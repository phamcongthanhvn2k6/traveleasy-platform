package com.traveleasy.controller.auth;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.auth.AuthResponse;
import com.traveleasy.dto.auth.ChangePasswordRequest;
import com.traveleasy.dto.auth.FirebaseAuthRequest;
import com.traveleasy.dto.auth.LoginRequest;
import com.traveleasy.dto.auth.RegisterRequest;
import com.traveleasy.dto.auth.UpdateProfileRequest;
import com.traveleasy.service.auth.AuthService;
import com.traveleasy.service.auth.FirebaseAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth Management", description = "Đăng ký, Đăng nhập và Xác thực JWT")
public class AuthController {

    private final AuthService authService;
    private final FirebaseAuthService firebaseAuthService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản hành khách mới")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success("Đăng ký thành công", authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập bằng Email hoặc Số điện thoại")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success("Đăng nhập thành công", authService.login(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin người dùng hiện tại")
    public ApiResponse<String> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.success("Lấy thông tin thành công", userDetails != null ? userDetails.getUsername() : "Guest");
    }

    @GetMapping("/profile")
    @Operation(summary = "Lấy hồ sơ cá nhân của người dùng đã đăng nhập")
    public ApiResponse<AuthResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ApiResponse.error("Chưa đăng nhập");
        }
        return ApiResponse.success(authService.getProfile(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Cập nhật hồ sơ cá nhân")
    public ApiResponse<AuthResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ApiResponse.error("Chưa đăng nhập");
        }
        return ApiResponse.success("Cập nhật thông tin thành công",
                authService.updateProfile(userDetails.getUsername(), request.getFullName(), request.getPhone()));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Đổi mật khẩu tài khoản")
    public ApiResponse<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ApiResponse.error("Chưa đăng nhập");
        }
        authService.changePassword(userDetails.getUsername(), request.getOldPassword(), request.getNewPassword());
        return ApiResponse.success("Đổi mật khẩu thành công", null);
    }

    // ==================== FIREBASE SOCIAL AUTH (Google / Phone OTP) ====================

    @PostMapping("/firebase/google")
    @Operation(summary = "Đăng nhập bằng Google qua Firebase (nhận Firebase ID Token)")
    public ApiResponse<AuthResponse> firebaseGoogle(@Valid @RequestBody FirebaseAuthRequest request) {
        return ApiResponse.success("Đăng nhập Google thành công", firebaseAuthService.loginWithGoogle(request));
    }

    @PostMapping("/firebase/phone")
    @Operation(summary = "Đăng nhập bằng Số điện thoại OTP qua Firebase (nhận Firebase ID Token)")
    public ApiResponse<AuthResponse> firebasePhone(@Valid @RequestBody FirebaseAuthRequest request) {
        return ApiResponse.success("Đăng nhập OTP thành công", firebaseAuthService.loginWithPhone(request));
    }
}