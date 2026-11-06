package com.traveleasy.service.auth;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.auth.AuthResponse;
import com.traveleasy.dto.auth.FirebaseAuthRequest;
import com.traveleasy.entity.Role;
import com.traveleasy.entity.User;
import com.traveleasy.repository.UserRepository;
import com.traveleasy.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service xác thực Firebase (tham khảo firebase-auth-lab - AuthService/FirebaseAuthenticationFilter).
 *
 * Nghiệp vụ:
 *  1. Nhận Firebase ID Token từ client (Google Sign-in hoặc Phone OTP).
 *  2. Verify token bằng Firebase Admin SDK (FirebaseToken - chữ ký, hạn, audience).
 *  3. Find-or-create User trong DB (auto-registration) - gán role CUSTOMER, status ACTIVE.
 *  4. Cấp JWT nội bộ (jwtTokenProvider) để frontend dùng như đăng nhập thường.
 *
 * Khác với lab (dùng filter cho mọi request), dự án này dùng endpoint riêng
 * POST /api/v1/auth/firebase/google và /api/v1/auth/firebase/phone để phù hợp
 * với flow JWT hiện tại của TravelEasy (AuthResponse trả token về client).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FirebaseAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Đăng nhập bằng Google: verify ID Token, trích xuất email/name,
     * find-or-create user và cấp JWT nội bộ.
     */
    @Transactional
    public AuthResponse loginWithGoogle(FirebaseAuthRequest request) {
        FirebaseToken decoded = verifyIdToken(request.getIdToken());

        String email = decoded.getEmail();
        if (email == null || email.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Tài khoản Google không cung cấp email");
        }

        String displayName = decoded.getName() != null ? decoded.getName() : email.split("@")[0];

        // Find-or-create theo email (khớp logic user hiện có để tránh trùng lặp tài khoản)
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> createFirebaseUser(email, displayName, null));

        // Đồng bộ fullName nếu Firebase có thông tin mới hơn
        if (decoded.getName() != null && !decoded.getName().isBlank()) {
            user.setFullName(decoded.getName());
        }

        checkAccountAccessible(user);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    /**
     * Đăng nhập bằng số điện thoại (OTP đã được Firebase xác thực ở client):
     * verify ID Token, trích xuất phone_number từ claims, find-or-create user.
     */
    @Transactional
    public AuthResponse loginWithPhone(FirebaseAuthRequest request) {
        FirebaseToken decoded = verifyIdToken(request.getIdToken());

        String phoneNumber = (String) decoded.getClaims().get("phone_number");
        if (phoneNumber == null || phoneNumber.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Token không chứa số điện thoại đã xác thực");
        }

        // Chuẩn hóa về dạng lưu trong DB (bỏ +84 đầu nếu có để khớp format 0912xxxxxx)
        String normalized = normalizePhone(phoneNumber);
        String displayName = decoded.getName() != null && !decoded.getName().isBlank()
                ? decoded.getName()
                : "Khách hàng " + normalized;

        // Find-or-create theo phone, fallback theo email nếu token có email
        User user = userRepository.findByPhone(normalized)
                .or(() -> decoded.getEmail() != null
                        ? userRepository.findByEmailIgnoreCase(decoded.getEmail())
                        : java.util.Optional.<User>empty())
                .orElseGet(() -> {
                    String email = decoded.getEmail();
                    // Phone-only account: sinh email placeholder đảm bảo unique + not-null
                    if (email == null || email.isBlank()) {
                        email = normalized.replace("+", "") + "@phone.firebase.local";
                    }
                    return createFirebaseUser(email, displayName, normalized);
                });

        user.setPhone(normalized);
        checkAccountAccessible(user);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    private FirebaseToken verifyIdToken(String idToken) {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                throw new AppException(ErrorCode.UNAUTHORIZED,
                        "Chức năng đăng nhập Firebase chưa được cấu hình trên server");
            }
            return FirebaseAuth.getInstance().verifyIdToken(idToken, true);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Firebase ID Token verification failed: {}", e.getMessage());
            throw new AppException(ErrorCode.UNAUTHORIZED, "Firebase ID Token không hợp lệ hoặc đã hết hạn");
        }
    }

    private User createFirebaseUser(String email, String fullName, String phone) {
        // Firebase-only account không có mật khẩu: gán hash ngẫu nhiên vô hiệu (không thể login bằng password)
        String unusablePassword = passwordEncoder.encode(UUID.randomUUID().toString());

        User user = User.builder()
                .email(email)
                .fullName(fullName)
                .phone(phone)
                .password(unusablePassword)
                .role(Role.CUSTOMER)
                .status("ACTIVE")
                .build();
        return userRepository.save(user);
    }

    private void checkAccountAccessible(User user) {
        if ("LOCKED".equalsIgnoreCase(user.getStatus())) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED,
                    "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }
        if ("DELETED".equalsIgnoreCase(user.getStatus())) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED,
                    "Tài khoản của bạn đã bị vô hiệu hóa hoặc xóa khỏi hệ thống. Vui lòng liên hệ quản trị viên.");
        }
    }

    /**
     * Chuyển "+84xxxxxxxxx" (E.164) thành "0xxxxxxxxx" để khớp format phone trong DB.
     */
    private String normalizePhone(String e164) {
        String phone = e164.trim();
        if (phone.startsWith("+84")) {
            return "0" + phone.substring(3);
        }
        if (phone.startsWith("84") && phone.length() > 9) {
            return "0" + phone.substring(2);
        }
        return phone;
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .busCompanyId(user.getBusCompanyId())
                .build();
    }
}

