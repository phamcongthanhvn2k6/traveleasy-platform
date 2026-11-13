package com.traveleasy.service.auth;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.auth.ForgotPasswordRequest;
import com.traveleasy.dto.auth.ForgotPasswordResponse;
import com.traveleasy.dto.auth.ResetPasswordRequest;
import com.traveleasy.dto.auth.VerifyResetOtpRequest;
import com.traveleasy.dto.auth.VerifyResetOtpResponse;
import com.traveleasy.entity.Role;
import com.traveleasy.entity.User;
import com.traveleasy.repository.UserRepository;
import com.traveleasy.service.common.EmailNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class PasswordResetService {

    static final int OTP_TTL_SECONDS = 300;
    static final int RESEND_COOLDOWN_SECONDS = 60;
    static final int RESET_TOKEN_TTL_SECONDS = 600;
    static final int MAX_FAILED_ATTEMPTS = 5;
    private static final String FIREBASE_PLACEHOLDER_DOMAIN = "@phone.firebase.local";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailNotificationService emailNotificationService;
    private final Clock clock;
    private final SecureRandom secureRandom = new SecureRandom();
    private final String otpPepper = UUID.randomUUID().toString();

    private final Cache<Long, OtpEntry> otpCache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofSeconds(OTP_TTL_SECONDS + 60L))
            .maximumSize(10_000)
            .build();

    private final Cache<String, ResetTokenEntry> resetTokenCache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofSeconds(RESET_TOKEN_TTL_SECONDS + 60L))
            .maximumSize(10_000)
            .build();

    @Autowired
    public PasswordResetService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailNotificationService emailNotificationService
    ) {
        this(userRepository, passwordEncoder, emailNotificationService, Clock.systemUTC());
    }

    PasswordResetService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailNotificationService emailNotificationService,
            Clock clock
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailNotificationService = emailNotificationService;
        this.clock = clock;
    }

    public ForgotPasswordResponse requestPasswordReset(ForgotPasswordRequest request) {
        String inputEmail = normalizeEmail(request.getEmail());
        String inputPhone = normalizePhone(request.getPhone());

        User user = findAndVerifyRegisteredUser(inputEmail, inputPhone);
        String registeredEmail = normalizeEmail(user.getEmail());

        Instant now = clock.instant();
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        byte[] hashedOtp = hashOtp(user.getId(), registeredEmail, otp);

        final long[] retryAfterSeconds = {0L};
        otpCache.asMap().compute(user.getId(), (key, existing) -> {
            if (existing != null) {
                Instant nextAllowedAt = existing.lastSentAt().plusSeconds(RESEND_COOLDOWN_SECONDS);
                if (now.isBefore(nextAllowedAt)) {
                    retryAfterSeconds[0] = Math.max(1L, Duration.between(now, nextAllowedAt).getSeconds());
                    return existing;
                }
            }
            return new OtpEntry(user.getId(), registeredEmail, inputPhone, hashedOtp, now.plusSeconds(OTP_TTL_SECONDS), now, 0);
        });

        if (retryAfterSeconds[0] > 0) {
            throw new AppException(
                    ErrorCode.OPERATION_NOT_ALLOWED,
                    "Vui lòng chờ " + retryAfterSeconds[0] + " giây trước khi yêu cầu gửi lại mã OTP"
            );
        }

        // Gửi OTP tới chính xác địa chỉ email đã đăng ký lưu trong DB của tài khoản này
        emailNotificationService.sendPasswordResetOtpEmail(
                user.getEmail().trim(),
                user.getFullName(),
                otp,
                OTP_TTL_SECONDS / 60
        );

        return ForgotPasswordResponse.builder()
                .maskedEmail(maskEmail(user.getEmail().trim()))
                .maskedFullName(maskFullName(user.getFullName()))
                .roleLabel(resolveRoleLabel(user.getRole()))
                .expiresInSeconds(OTP_TTL_SECONDS)
                .resendCooldownSeconds(RESEND_COOLDOWN_SECONDS)
                .build();
    }

    public VerifyResetOtpResponse verifyResetOtp(VerifyResetOtpRequest request) {
        String inputEmail = normalizeEmail(request.getEmail());
        String otp = request.getOtp() != null ? request.getOtp().trim() : "";

        User user = resolveUserForPendingOtp(inputEmail);
        String registeredEmail = normalizeEmail(user.getEmail());

        Instant now = clock.instant();
        byte[] submittedHash = hashOtp(user.getId(), registeredEmail, otp);
        VerificationOutcome[] outcomeHolder = {VerificationOutcome.notFound()};
        final String[] pendingPhoneHolder = new String[1];

        otpCache.asMap().compute(user.getId(), (key, existing) -> {
            if (existing == null || !existing.registeredEmail().equals(registeredEmail)) {
                outcomeHolder[0] = VerificationOutcome.notFound();
                return null;
            }
            if (now.isAfter(existing.expiresAt())) {
                outcomeHolder[0] = VerificationOutcome.expired();
                return null;
            }
            if (MessageDigest.isEqual(existing.otpHash(), submittedHash)) {
                outcomeHolder[0] = VerificationOutcome.verified();
                pendingPhoneHolder[0] = existing.pendingPhone();
                return null;
            }
            int nextAttempts = existing.failedAttempts() + 1;
            if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
                outcomeHolder[0] = VerificationOutcome.maxAttempts();
                return null;
            }
            outcomeHolder[0] = VerificationOutcome.invalid(MAX_FAILED_ATTEMPTS - nextAttempts);
            return new OtpEntry(
                    existing.userId(),
                    existing.registeredEmail(),
                    existing.pendingPhone(),
                    existing.otpHash(),
                    existing.expiresAt(),
                    existing.lastSentAt(),
                    nextAttempts
            );
        });

        VerificationOutcome outcome = outcomeHolder[0];
        switch (outcome.status()) {
            case NOT_FOUND, EXPIRED -> throw new AppException(
                    ErrorCode.VALIDATION_ERROR,
                    "Mã OTP đã hết hạn hoặc chưa được yêu cầu. Vui lòng gửi lại mã mới."
            );
            case MAX_ATTEMPTS -> throw new AppException(
                    ErrorCode.OPERATION_NOT_ALLOWED,
                    "Bạn đã nhập sai mã OTP quá " + MAX_FAILED_ATTEMPTS + " lần. Mã hiện tại đã bị hủy, vui lòng gửi lại mã mới."
            );
            case INVALID -> throw new AppException(
                    ErrorCode.VALIDATION_ERROR,
                    "Mã OTP không chính xác. Bạn còn " + outcome.remainingAttempts() + " lần thử."
            );
            case VERIFIED -> {
                String resetToken = generateResetToken();
                resetTokenCache.put(
                        resetToken,
                        new ResetTokenEntry(user.getId(), registeredEmail, pendingPhoneHolder[0], now.plusSeconds(RESET_TOKEN_TTL_SECONDS))
                );
                return VerifyResetOtpResponse.builder()
                        .resetToken(resetToken)
                        .expiresInSeconds(RESET_TOKEN_TTL_SECONDS)
                        .build();
            }
        }
        throw new AppException(ErrorCode.VALIDATION_ERROR, "Không thể xác minh mã OTP");
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String inputEmail = normalizeEmail(request.getEmail());
        String resetToken = request.getResetToken() != null ? request.getResetToken().trim() : "";
        String newPassword = request.getNewPassword();

        if (newPassword == null || newPassword.isBlank() || newPassword.length() < 6) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Mật khẩu mới phải có tối thiểu 6 ký tự");
        }

        Instant now = clock.instant();
        ResetTokenEntry tokenEntry = resetTokenCache.asMap().remove(resetToken);
        if (tokenEntry == null
                || !tokenEntry.registeredEmail().equals(inputEmail)
                || now.isAfter(tokenEntry.expiresAt())) {
            throw new AppException(
                    ErrorCode.UNAUTHORIZED,
                    "Phiên xác thực đặt lại mật khẩu đã hết hạn hoặc không khớp với tài khoản đã xác minh. Vui lòng thực hiện lại."
            );
        }

        User user = userRepository.findById(tokenEntry.userId())
                .orElseThrow(() -> new AppException(
                        ErrorCode.RESOURCE_NOT_FOUND,
                        "Không tìm thấy tài khoản tương ứng trong hệ thống"
                ));

        if (!normalizeEmail(user.getEmail()).equals(tokenEntry.registeredEmail())) {
            throw new AppException(
                    ErrorCode.UNAUTHORIZED,
                    "Thông tin email tài khoản đã thay đổi. Vui lòng thực hiện lại quy trình xác minh OTP."
            );
        }

        checkUserAccountStatus(user);

        user.setPassword(passwordEncoder.encode(newPassword));
        // Nếu tài khoản trước đó chưa có số điện thoại (ví dụ tài khoản tạo qua Google OAuth),
        // tự động liên kết số điện thoại người dùng đã đối chiếu ở Bước 1
        if ((user.getPhone() == null || user.getPhone().isBlank())
                && tokenEntry.pendingPhone() != null
                && !tokenEntry.pendingPhone().isBlank()) {
            if (!userRepository.existsByPhoneAndIdNot(tokenEntry.pendingPhone(), user.getId())) {
                user.setPhone(tokenEntry.pendingPhone());
            }
        }
        userRepository.save(user);

        emailNotificationService.sendPasswordResetSuccessEmail(user.getEmail().trim(), user.getFullName());
    }

    private User findAndVerifyRegisteredUser(String normalizedEmail, String normalizedInputPhone) {
        List<User> candidates = findEmailCandidatesOrThrow(normalizedEmail);

        if (candidates.size() == 1) {
            User user = candidates.get(0);
            checkUserAccountStatus(user);
            verifyUserPhoneMatches(user, normalizedInputPhone);
            return user;
        }

        List<User> matchedByPhone = candidates.stream()
                .filter(u -> u.getPhone() != null && normalizePhoneSafe(u.getPhone()).equals(normalizedInputPhone))
                .toList();

        if (matchedByPhone.isEmpty()) {
            // Nếu có nhiều bản ghi trùng email nhưng không khớp SĐT, kiểm tra tài khoản chưa có SĐT (Google OAuth)
            List<User> withoutPhone = candidates.stream()
                    .filter(u -> u.getPhone() == null || normalizePhoneSafe(u.getPhone()).isEmpty())
                    .toList();
            if (withoutPhone.size() == 1) {
                User user = withoutPhone.get(0);
                checkUserAccountStatus(user);
                verifyUserPhoneMatches(user, normalizedInputPhone);
                return user;
            }

            throw new AppException(
                    ErrorCode.VALIDATION_ERROR,
                    "Email và số điện thoại không khớp với cùng một tài khoản đã đăng ký. Vui lòng kiểm tra lại để tránh nhầm sang tài khoản khác."
            );
        }
        if (matchedByPhone.size() > 1) {
            throw new AppException(
                    ErrorCode.DATA_INTEGRITY_VIOLATION,
                    "Phát hiện nhiều tài khoản trùng lặp cùng email và số điện thoại. Vui lòng liên hệ quản trị viên."
            );
        }

        User user = matchedByPhone.get(0);
        checkUserAccountStatus(user);
        return user;
    }

    private User resolveUserForPendingOtp(String normalizedEmail) {
        List<User> candidates = findEmailCandidatesOrThrow(normalizedEmail);

        if (candidates.size() == 1) {
            User user = candidates.get(0);
            checkUserAccountStatus(user);
            return user;
        }

        List<User> withPendingOtp = candidates.stream()
                .filter(u -> otpCache.getIfPresent(u.getId()) != null)
                .toList();

        if (withPendingOtp.size() == 1) {
            User user = withPendingOtp.get(0);
            checkUserAccountStatus(user);
            return user;
        }

        throw new AppException(
                ErrorCode.VALIDATION_ERROR,
                "Mã OTP đã hết hạn hoặc không xác định được phiên khôi phục. Vui lòng yêu cầu gửi lại mã mới."
        );
    }

    private List<User> findEmailCandidatesOrThrow(String normalizedEmail) {
        if (normalizedEmail.endsWith(FIREBASE_PLACEHOLDER_DOMAIN)) {
            throw new AppException(
                    ErrorCode.OPERATION_NOT_ALLOWED,
                    "Tài khoản này được tạo bằng Số điện thoại OTP và chưa liên kết email thật. Vui lòng đăng nhập bằng Số điện thoại OTP."
            );
        }

        List<User> candidates = userRepository.findAllByEmailIgnoreCase(normalizedEmail);
        if (candidates.isEmpty()) {
            throw new AppException(
                    ErrorCode.RESOURCE_NOT_FOUND,
                    "Không tìm thấy tài khoản nào được đăng ký với email này"
            );
        }
        return candidates;
    }

    private void verifyUserPhoneMatches(User user, String normalizedInputPhone) {
        String dbPhone = normalizePhoneSafe(user.getPhone());
        if (dbPhone.isEmpty()) {
            throw new AppException(
                    ErrorCode.OPERATION_NOT_ALLOWED,
                    "Tài khoản này chưa cập nhật số điện thoại đăng ký để đối chiếu. Nếu bạn đăng nhập bằng Google, hãy dùng nút Google ID."
            );
        }
        if (!dbPhone.equals(normalizedInputPhone)) {
            throw new AppException(
                    ErrorCode.VALIDATION_ERROR,
                    "Email và số điện thoại không khớp với cùng một tài khoản đã đăng ký. Vui lòng kiểm tra lại để tránh nhầm sang tài khoản khác."
            );
        }
    }

    private void checkUserAccountStatus(User user) {
        if ("LOCKED".equalsIgnoreCase(user.getStatus()) || "DELETED".equalsIgnoreCase(user.getStatus())) {
            throw new AppException(
                    ErrorCode.ACCOUNT_LOCKED,
                    "Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa. Vui lòng liên hệ quản trị viên."
            );
        }
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Email đăng ký không được để trống");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Số điện thoại đăng ký không được để trống");
        }
        String normalized = normalizePhoneSafe(phone);
        if (normalized.length() < 9 || normalized.length() > 15) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Số điện thoại đăng ký không hợp lệ");
        }
        return normalized;
    }

    private String normalizePhoneSafe(String rawPhone) {
        if (rawPhone == null) {
            return "";
        }
        String digits = rawPhone.replaceAll("\\D", "");
        if (digits.startsWith("84") && digits.length() >= 11) {
            digits = "0" + digits.substring(2);
        }
        return digits;
    }

    private byte[] hashOtp(Long userId, String normalizedEmail, String otp) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String payload = userId + ":" + normalizedEmail + ":" + otp + ":" + otpPepper;
            return digest.digest(payload.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm unavailable", e);
        }
    }

    private String generateResetToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return email;
        }
        String local = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        int visiblePrefix = Math.min(2, local.length() - 1);
        return local.substring(0, visiblePrefix) + "***" + domain;
    }

    private String maskFullName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "Thành viên";
        }
        String trimmed = fullName.trim();
        if (trimmed.length() <= 2) {
            return trimmed.charAt(0) + "***";
        }
        int prefixLen = Math.min(3, trimmed.length() - 1);
        int suffixLen = Math.min(2, Math.max(0, trimmed.length() - prefixLen - 1));
        String prefix = trimmed.substring(0, prefixLen);
        String suffix = suffixLen > 0 ? trimmed.substring(trimmed.length() - suffixLen) : "";
        return prefix + "***" + suffix;
    }

    private String resolveRoleLabel(Role role) {
        if (role == null) return "Thành viên";
        return switch (role) {
            case ADMIN -> "Quản trị viên";
            case OPERATOR -> "Đối tác nhà xe";
            case CUSTOMER -> "Khách hàng";
        };
    }

    private record OtpEntry(
            Long userId,
            String registeredEmail,
            byte[] otpHash,
            Instant expiresAt,
            Instant lastSentAt,
            int failedAttempts
    ) {}

    private record ResetTokenEntry(Long userId, String registeredEmail, Instant expiresAt) {}

    private enum OutcomeStatus { NOT_FOUND, EXPIRED, MAX_ATTEMPTS, INVALID, VERIFIED }

    private record VerificationOutcome(OutcomeStatus status, int remainingAttempts) {
        static VerificationOutcome notFound() { return new VerificationOutcome(OutcomeStatus.NOT_FOUND, 0); }
        static VerificationOutcome expired() { return new VerificationOutcome(OutcomeStatus.EXPIRED, 0); }
        static VerificationOutcome maxAttempts() { return new VerificationOutcome(OutcomeStatus.MAX_ATTEMPTS, 0); }
        static VerificationOutcome invalid(int remaining) { return new VerificationOutcome(OutcomeStatus.INVALID, remaining); }
        static VerificationOutcome verified() { return new VerificationOutcome(OutcomeStatus.VERIFIED, 0); }
    }
}
