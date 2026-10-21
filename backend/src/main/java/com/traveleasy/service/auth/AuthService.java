package com.traveleasy.service.auth;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.auth.AuthResponse;
import com.traveleasy.dto.auth.LoginRequest;
import com.traveleasy.dto.auth.RegisterRequest;
import com.traveleasy.entity.Role;
import com.traveleasy.entity.User;
import com.traveleasy.repository.UserRepository;
import com.traveleasy.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.RESOURCE_ALREADY_EXISTS, "Email đã tồn tại trong hệ thống");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new AppException(ErrorCode.RESOURCE_ALREADY_EXISTS, "Số điện thoại đã tồn tại trong hệ thống");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .status("ACTIVE")
                .build();

        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getIdentifier())
                .or(() -> userRepository.findByPhone(request.getIdentifier()))
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "Sai email/số điện thoại hoặc mật khẩu"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Sai email/số điện thoại hoặc mật khẩu");
        }

        if ("LOCKED".equalsIgnoreCase(user.getStatus())) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED, "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin tài khoản"));

        return AuthResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public AuthResponse updateProfile(String email, String fullName, String phone) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin tài khoản"));

        if (fullName != null && !fullName.trim().isEmpty()) {
            user.setFullName(fullName.trim());
        }
        if (phone != null && !phone.trim().isEmpty()) {
            user.setPhone(phone.trim());
        }

        userRepository.save(user);

        return AuthResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin tài khoản"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Mật khẩu hiện tại không chính xác");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
