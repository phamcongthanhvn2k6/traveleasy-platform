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
import lombok.extern.slf4j.Slf4j;
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
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
public class PasswordResetService {

    static final int OTP_TTL_SECONDS = 300; // 5 phút (300 giây)
    static final int RESEND_COOLDOWN_SECONDS = 60; // 60 giây giãn cách giữa 2 lần gửi
    static final int RESET_TOKEN_TTL_SECONDS = 600; // 10 phút sau khi xác minh OTP
    static final int MAX_FAILED_ATTEMPTS = 5; // Tối đa 5 lần thử nhập mã OTP
    static final int MAX_REQUESTS_PER_WINDOW = 5; // Tối đa 5 lần yêu cầu OTP trong cửa sổ
    static final int RATE_LIMIT_WINDOW_MINUTES = 15; // Cửa sổ 15 phút chống spam nghẽn
    private static final String FIREBASE_PLACEHOLDER_DOMAIN = "@phone.firebase.local";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailNotificationService emailNotificationService;
    private final Clock clock;
    private final SecureRandom secureRandom = new SecureRandom();
    private final String otpPepper = UUID.randomUUID().toString();

    // Cache lưu OTP của từng người dùng
    private final Cache<Long, OtpEntry> otpCache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofSeconds(OTP_TTL_SECONDS + 60L))
            .maximumSize(10_000)
            .build();

    // Cache lưu resetToken sau khi verify OTP thành công
    private final Cache<String, ResetTokenEntry> resetTokenCache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofSeconds(RESET_TOKEN_TTL_SECONDS + 60L))
            .maximumSize(10_000)
            .build();

    // Rate Limiting Cache: Giới hạn tối đa 5 requests trong 15 phút trên mỗi tài khoản
    private final Cache<Long, AtomicInteger> rateLimitCache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(RATE_LIMIT_WINDOW_MINUTES))
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
        String channel = resolveChannel(request.getChannel());
        User user = findAndValidateUser(request, channel);

        checkUserAccountStatus(user);

        // 1. Kiểm tra Rate Limiting (chống nghẽn dữ liệu hệ thống)
        AtomicInteger requestCounter = rateLimitCache.get(user.getId(), k -> new AtomicInteger(0));
        if (requestCounter != null && requestCounter.get() >= MAX_REQUESTS_PER_WINDOW) {
            throw new AppException(
                    ErrorCode.OPERATION_NOT_ALLOWED,
                    "Bạn đã yêu cầu gửi mã OTP quá " + MAX_REQUESTS_PER_WINDOW + " lần trong "
                            + RATE_LIMIT_WINDOW_MINUTES + " phút. Vui lòng chờ trước khi thử lại để tránh nghẽn dữ liệu hệ thống."
            );
        }

        Instant now = clock.instant();
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        String targetIdentifier = "PHONE".equals(channel) ? normalizePhoneSafe(user.getPhone()) : normalizeEmailSafe(user.getEmail());
        byte[] hashedOtp = hashOtp(user.getId(), targetIdentifier, otp);

        // 2. Cooldown 60s giữa 2 lần gửi liên tiếp
        final long[] retryAfterSeconds = {0L};
        final String pendingPhone = request.getPhone() != null && !request.getPhone().isBlank()
                ? normalizePhoneSafe(request.getPhone())
                : normalizePhoneSafe(user.getPhone());

        otpCache.asMap().compute(user.getId(), (key, existing) -> {
            if (existing != null) {
                Instant nextAllowedAt = existing.lastSentAt().plusSeconds(RESEND_COOLDOWN_SECONDS);
                if (now.isBefore(nextAllowedAt)) {
                    retryAfterSeconds[0] = Math.max(1L, Duration.between(now, nextAllowedAt).getSeconds());
                    return existing;
                }
            }
            if (requestCounter != null) {
                requestCounter.incrementAndGet();
            }
            return new OtpEntry(
                    user.getId(),
                    channel,
                    user.getEmail(),
                    pendingPhone,
                    hashedOtp,
                    now.plusSeconds(OTP_TTL_SECONDS),
                    now,
                    0
            );
        });

        if (retryAfterSeconds[0] > 0) {
            throw new AppException(
                    ErrorCode.OPERATION_NOT_ALLOWED,
                    "Vui lòng chờ " + retryAfterSeconds[0] + " giây trước khi yêu cầu gửi lại mã OTP."
            );
        }

        // 3. Phân phối OTP theo kênh đã chọn
        if ("EMAIL".equals(channel)) {
            emailNotificationService.sendPasswordResetOtpEmail(
                    user.getEmail().trim(),
                    user.getFullName(),
                    otp,
                    OTP_TTL_SECONDS / 60
            );
        } else {
            // Kênh PHONE (SMS Gateway Simulation/Provider)
            log.info("📱 [SMS OTP SERVICE] Đã phát mã OTP [{}] gửi tới SĐT: {} (Tài khoản: {}). Hiệu lực trong {} phút.",
                    otp, user.getPhone(), user.getFullName(), OTP_TTL_SECONDS / 60);

            // Gửi bản sao dự phòng tới Email (nếu tài khoản có email thật) để phòng nghẽn viễn thông
            if (user.getEmail() != null && !user.getEmail().isBlank() && !user.getEmail().endsWith(FIREBASE_PLACEHOLDER_DOMAIN)) {
                try {
                    emailNotificationService.sendPasswordResetOtpEmail(
                            user.getEmail().trim(),
                            user.getFullName(),
                            otp,
                            OTP_TTL_SECONDS / 60
                    );
                } catch (Exception e) {
                    log.warn("Không thể gửi email sao lưu OTP: {}", e.getMessage());
                }
            }
        }

        String destination = "PHONE".equals(channel) ? user.getPhone() : user.getEmail();
        String maskedDestination = "PHONE".equals(channel) ? maskPhone(user.getPhone()) : maskEmail(user.getEmail());

        return ForgotPasswordResponse.builder()
                .channel(channel)
                .destination(destination)
                .maskedDestination(maskedDestination)
                .maskedEmail(maskEmail(user.getEmail()))
                .maskedPhone(maskPhone(user.getPhone()))
                .maskedFullName(maskFullName(user.getFullName()))
                .roleLabel(resolveRoleLabel(user.getRole()))
                .expiresInSeconds(OTP_TTL_SECONDS)
                .resendCooldownSeconds(RESEND_COOLDOWN_SECONDS)
                .build();
    }

    public VerifyResetOtpResponse verifyResetOtp(VerifyResetOtpRequest request) {
        String otp = request.getOtp() != null ? request.getOtp().trim() : "";
        User user = resolveUserForVerification(request);

        OtpEntry existingOtp = otpCache.getIfPresent(user.getId());
        String targetIdentifier = (existingOtp != null && "PHONE".equals(existingOtp.channel()))
                ? normalizePhoneSafe(user.getPhone())
                : normalizeEmailSafe(user.getEmail());

        Instant now = clock.instant();
        byte[] submittedHash = hashOtp(user.getId(), targetIdentifier, otp);
        VerificationOutcome[] outcomeHolder = {VerificationOutcome.notFound()};
        final String[] pendingPhoneHolder = new String[1];

        otpCache.asMap().compute(user.getId(), (key, existing) -> {
            if (existing == null) {
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
                return null; // Xác minh thành công, xóa khỏi cache OTP
            }
            int nextAttempts = existing.failedAttempts() + 1;
            if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
                outcomeHolder[0] = VerificationOutcome.maxAttempts();
                return null; // Hủy OTP sau khi vượt quá số lần thử
            }
            outcomeHolder[0] = VerificationOutcome.invalid(MAX_FAILED_ATTEMPTS - nextAttempts);
            return new OtpEntry(
                    existing.userId(),
                    existing.channel(),
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
                    "Mã OTP đã hết hiệu lực sau 5 phút hoặc chưa được yêu cầu. Vui lòng bấm 'Gửi lại mã OTP' để nhận mã mới."
            );
            case MAX_ATTEMPTS -> throw new AppException(
                    ErrorCode.OPERATION_NOT_ALLOWED,
                    "Bạn đã nhập sai mã OTP quá " + MAX_FAILED_ATTEMPTS + " lần. Mã hiện tại đã bị hủy để đảm bảo an toàn, vui lòng yêu cầu mã mới."
            );
            case INVALID -> throw new AppException(
                    ErrorCode.VALIDATION_ERROR,
                    "Mã OTP không chính xác. Bạn còn " + outcome.remainingAttempts() + " lần thử."
            );
            case VERIFIED -> {
                String resetToken = generateResetToken();
                resetTokenCache.put(
                        resetToken,
                        new ResetTokenEntry(
                                user.getId(),
                                user.getEmail(),
                                pendingPhoneHolder[0],
                                now.plusSeconds(RESET_TOKEN_TTL_SECONDS)
                        )
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
        String resetToken = request.getResetToken() != null ? request.getResetToken().trim() : "";
        String newPassword = request.getNewPassword();

        if (newPassword == null || newPassword.isBlank() || newPassword.length() < 6) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Mật khẩu mới phải có tối thiểu 6 ký tự");
        }

        Instant now = clock.instant();
        ResetTokenEntry tokenEntry = resetTokenCache.asMap().remove(resetToken);
        if (tokenEntry == null || now.isAfter(tokenEntry.expiresAt())) {
            throw new AppException(
                    ErrorCode.UNAUTHORIZED,
                    "Phiên xác thực đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng thực hiện lại từ đầu."
            );
        }

        // Đối chiếu chống đánh tráo tài khoản khi gửi resetToken
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!normalizeEmailSafe(tokenEntry.registeredEmail()).equals(normalizeEmailSafe(request.getEmail()))) {
                throw new AppException(
                        ErrorCode.UNAUTHORIZED,
                        "Email yêu cầu không khớp với tài khoản đã xác minh OTP."
                );
            }
        }
        if (request.getIdentifier() != null && !request.getIdentifier().isBlank()) {
            String raw = request.getIdentifier().trim();
            if (raw.contains("@")) {
                if (!normalizeEmailSafe(tokenEntry.registeredEmail()).equals(normalizeEmailSafe(raw))) {
                    throw new AppException(ErrorCode.UNAUTHORIZED, "Thông tin định danh không khớp với tài khoản đã xác minh OTP.");
                }
            }
        }

        User user = userRepository.findById(tokenEntry.userId())
                .orElseThrow(() -> new AppException(
                        ErrorCode.RESOURCE_NOT_FOUND,
                        "Không tìm thấy tài khoản tương ứng trong hệ thống"
                ));

        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            if (!normalizePhoneSafe(user.getPhone()).equals(normalizePhoneSafe(request.getPhone()))) {
                throw new AppException(
                        ErrorCode.UNAUTHORIZED,
                        "Số điện thoại yêu cầu không khớp với tài khoản đã xác minh OTP."
                );
            }
        }

        checkUserAccountStatus(user);

        // Mã hóa mật khẩu chuẩn BCrypt vào Database
        user.setPassword(passwordEncoder.encode(newPassword));

        // Tự động liên kết SĐT nếu trước đó tài khoản chưa có SĐT
        if ((user.getPhone() == null || user.getPhone().isBlank())
                && tokenEntry.pendingPhone() != null
                && !tokenEntry.pendingPhone().isBlank()) {
            if (!userRepository.existsByPhoneAndIdNot(tokenEntry.pendingPhone(), user.getId())) {
                user.setPhone(tokenEntry.pendingPhone());
            }
        }
        userRepository.save(user);

        // Gửi email thông báo đặt lại mật khẩu thành công
        if (user.getEmail() != null && !user.getEmail().endsWith(FIREBASE_PLACEHOLDER_DOMAIN)) {
            try {
                emailNotificationService.sendPasswordResetSuccessEmail(user.getEmail().trim(), user.getFullName());
            } catch (Exception ex) {
                log.warn("Không thể gửi email xác nhận đặt lại mật khẩu: {}", ex.getMessage());
            }
        }
    }

    private User findAndValidateUser(ForgotPasswordRequest request, String channel) {
        if ("PHONE".equals(channel)) {
            String inputPhone = normalizePhone(request.getPhone());
            return userRepository.findByPhone(inputPhone)
                    .orElseThrow(() -> new AppException(
                            ErrorCode.RESOURCE_NOT_FOUND,
                            "Số điện thoại này chưa được đăng ký trong hệ thống. Vui lòng kiểm tra lại hoặc tạo tài khoản mới."
                    ));
        }

        // Kênh EMAIL
        String inputEmail = normalizeEmail(request.getEmail());
        if (inputEmail.endsWith(FIREBASE_PLACEHOLDER_DOMAIN)) {
            throw new AppException(
                    ErrorCode.OPERATION_NOT_ALLOWED,
                    "Tài khoản này được tạo bằng Số điện thoại OTP và chưa liên kết email. Vui lòng chọn kênh Số điện thoại để khôi phục."
            );
        }

        List<User> candidates = userRepository.findAllByEmailIgnoreCase(inputEmail);
        if (candidates.isEmpty()) {
            throw new AppException(
                    ErrorCode.RESOURCE_NOT_FOUND,
                    "Địa chỉ email này chưa được đăng ký trong hệ thống. Vui lòng kiểm tra lại hoặc tạo tài khoản mới."
            );
        }

        // Nếu người dùng cung cấp kèm SĐT, thực hiện đối chiếu chéo
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            String inputPhone = normalizePhoneSafe(request.getPhone());
            return findAndVerifyRegisteredUserWithPhone(candidates, inputPhone);
        }

        return candidates.get(0);
    }

    private User findAndVerifyRegisteredUserWithPhone(List<User> candidates, String normalizedInputPhone) {
        if (candidates.size() == 1) {
            User user = candidates.get(0);
            verifyUserPhoneMatches(user, normalizedInputPhone);
            return user;
        }

        List<User> matchedByPhone = candidates.stream()
                .filter(u -> u.getPhone() != null && normalizePhoneSafe(u.getPhone()).equals(normalizedInputPhone))
                .toList();

        if (matchedByPhone.isEmpty()) {
            List<User> withoutPhone = candidates.stream()
                    .filter(u -> u.getPhone() == null || normalizePhoneSafe(u.getPhone()).isEmpty())
                    .toList();
            if (withoutPhone.size() == 1) {
                User user = withoutPhone.get(0);
                verifyUserPhoneMatches(user, normalizedInputPhone);
                return user;
            }
            throw new AppException(
                    ErrorCode.VALIDATION_ERROR,
                    "Email và số điện thoại không khớp với cùng một tài khoản đã đăng ký. Vui lòng kiểm tra lại."
            );
        }

        return matchedByPhone.get(0);
    }

    private User resolveUserForVerification(VerifyResetOtpRequest request) {
        String identifier = request.getIdentifier();
        if (identifier == null || identifier.isBlank()) {
            identifier = request.getEmail() != null && !request.getEmail().isBlank()
                    ? request.getEmail()
                    : request.getPhone();
        }

        if (identifier == null || identifier.isBlank()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Thiếu thông tin Email hoặc Số điện thoại để xác minh OTP");
        }

        String raw = identifier.trim();
        if (raw.contains("@")) {
            String normalizedEmail = normalizeEmailSafe(raw);
            List<User> candidates = userRepository.findAllByEmailIgnoreCase(normalizedEmail);
            if (candidates.isEmpty()) {
                throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tài khoản tương ứng với email này");
            }
            return candidates.stream()
                    .filter(u -> otpCache.getIfPresent(u.getId()) != null)
                    .findFirst()
                    .orElse(candidates.get(0));
        }

        String normalizedPhone = normalizePhoneSafe(raw);
        return userRepository.findByPhone(normalizedPhone)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tài khoản tương ứng với số điện thoại này"));
    }

    private void verifyUserPhoneMatches(User user, String normalizedInputPhone) {
        String dbPhone = normalizePhoneSafe(user.getPhone());
        if (dbPhone.isEmpty()) {
            if (userRepository.existsByPhoneAndIdNot(normalizedInputPhone, user.getId())) {
                throw new AppException(
                        ErrorCode.PHONE_ALREADY_EXISTS,
                        "Số điện thoại này đã được sử dụng bởi một tài khoản khác trong hệ thống."
                );
            }
            return;
        }
        if (!dbPhone.equals(normalizedInputPhone)) {
            throw new AppException(
                    ErrorCode.VALIDATION_ERROR,
                    "Email và số điện thoại không khớp với cùng một tài khoản đã đăng ký. Vui lòng kiểm tra lại."
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

    private String resolveChannel(String rawChannel) {
        if (rawChannel == null || rawChannel.isBlank()) return "EMAIL";
        String upper = rawChannel.trim().toUpperCase(Locale.ROOT);
        return "PHONE".equals(upper) ? "PHONE" : "EMAIL";
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Địa chỉ email không được để trống");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeEmailSafe(String email) {
        return email != null ? email.trim().toLowerCase(Locale.ROOT) : "";
    }

    private String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Số điện thoại không được để trống");
        }
        String normalized = normalizePhoneSafe(phone);
        if (normalized.length() < 9 || normalized.length() > 15) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Số điện thoại không đúng định dạng hợp lệ (9-15 chữ số)");
        }
        return normalized;
    }

    private String normalizePhoneSafe(String phone) {
        if (phone == null) return "";
        String digits = phone.replaceAll("\\D+", "");
        if (digits.startsWith("84") && digits.length() >= 11) {
            return "0" + digits.substring(2);
        }
        return digits;
    }

    private byte[] hashOtp(Long userId, String identifier, String otp) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String payload = userId + ":" + identifier + ":" + otp + ":" + otpPepper;
            return digest.digest(payload.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Thuật toán SHA-256 không khả dụng trên JVM", e);
        }
    }

    private String generateResetToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String maskEmail(String email) {
        if (email == null || email.isBlank()) return "";
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) return email;
        String local = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        int visiblePrefix = Math.min(2, local.length() - 1);
        return local.substring(0, visiblePrefix) + "***" + domain;
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.isBlank()) return "";
        String p = phone.trim();
        if (p.length() <= 4) return p;
        int prefix = Math.min(4, p.length() - 3);
        int suffix = Math.min(3, p.length() - prefix);
        return p.substring(0, prefix) + "***" + p.substring(p.length() - suffix);
    }

    private String maskFullName(String fullName) {
        if (fullName == null || fullName.isBlank()) return "Thành viên";
        String trimmed = fullName.trim();
        if (trimmed.length() <= 2) return trimmed.charAt(0) + "***";
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
            String channel,
            String registeredEmail,
            String pendingPhone,
            byte[] otpHash,
            Instant expiresAt,
            Instant lastSentAt,
            int failedAttempts
    ) {}

    private record ResetTokenEntry(Long userId, String registeredEmail, String pendingPhone, Instant expiresAt) {}

    private enum OutcomeStatus { NOT_FOUND, EXPIRED, MAX_ATTEMPTS, INVALID, VERIFIED }

    private record VerificationOutcome(OutcomeStatus status, int remainingAttempts) {
        static VerificationOutcome notFound() { return new VerificationOutcome(OutcomeStatus.NOT_FOUND, 0); }
        static VerificationOutcome expired() { return new VerificationOutcome(OutcomeStatus.EXPIRED, 0); }
        static VerificationOutcome maxAttempts() { return new VerificationOutcome(OutcomeStatus.MAX_ATTEMPTS, 0); }
        static VerificationOutcome invalid(int remaining) { return new VerificationOutcome(OutcomeStatus.INVALID, remaining); }
        static VerificationOutcome verified() { return new VerificationOutcome(OutcomeStatus.VERIFIED, 0); }
    }
}
