package com.traveleasy.service.auth;

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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailNotificationService emailNotificationService;

    private MutableClock clock;
    private PasswordResetService passwordResetService;
    private User activeUser;
    private User otherUser;

    @BeforeEach
    void setUp() {
        clock = new MutableClock(Instant.parse("2026-11-11T10:00:00Z"));
        passwordResetService = new PasswordResetService(
                userRepository,
                passwordEncoder,
                emailNotificationService,
                clock
        );
        activeUser = User.builder()
                .id(10L)
                .email("customer@gmail.com")
                .phone("0912345678")
                .fullName("Nguyễn Văn A")
                .password("$2a$10$oldHash")
                .role(Role.CUSTOMER)
                .status("ACTIVE")
                .build();

        otherUser = User.builder()
                .id(12L)
                .email("other@gmail.com")
                .phone("0987654321")
                .fullName("Trần Thị B")
                .password("$2a$10$otherHash")
                .role(Role.CUSTOMER)
                .status("ACTIVE")
                .build();
    }

    @Test
    @DisplayName("Luồng chuẩn: đối chiếu đúng Email + SĐT trong DB -> gửi OTP tới email đã đăng ký -> xác minh -> đổi mật khẩu")
    void fullOtpResetFlow_SuccessAndSingleUse() {
        when(userRepository.findAllByEmailIgnoreCase("customer@gmail.com")).thenReturn(List.of(activeUser));
        when(userRepository.findById(10L)).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.encode("NewPass@123")).thenReturn("$2a$10$newHash");

        ForgotPasswordRequest forgotReq = new ForgotPasswordRequest();
        forgotReq.setEmail("  Customer@Gmail.com ");
        forgotReq.setPhone("+84 912 345 678");
        ForgotPasswordResponse forgotRes = passwordResetService.requestPasswordReset(forgotReq);

        assertEquals("cu***@gmail.com", forgotRes.getMaskedEmail());
        assertEquals("Khách hàng", forgotRes.getRoleLabel());
        assertNotNull(forgotRes.getMaskedFullName());
        assertEquals(300, forgotRes.getExpiresInSeconds());
        assertEquals(60, forgotRes.getResendCooldownSeconds());

        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailNotificationService).sendPasswordResetOtpEmail(
                eq("customer@gmail.com"),
                eq("Nguyễn Văn A"),
                otpCaptor.capture(),
                eq(5)
        );
        String otp = otpCaptor.getValue();
        assertTrue(otp.matches("^\\d{6}$"));

        VerifyResetOtpRequest verifyReq = new VerifyResetOtpRequest();
        verifyReq.setEmail("customer@gmail.com");
        verifyReq.setOtp(otp);
        VerifyResetOtpResponse verifyRes = passwordResetService.verifyResetOtp(verifyReq);
        assertNotNull(verifyRes.getResetToken());
        assertFalse(verifyRes.getResetToken().isBlank());

        AppException reuseOtpEx = assertThrows(AppException.class, () -> passwordResetService.verifyResetOtp(verifyReq));
        assertEquals(ErrorCode.VALIDATION_ERROR, reuseOtpEx.getErrorCode());

        ResetPasswordRequest resetReq = new ResetPasswordRequest();
        resetReq.setEmail("customer@gmail.com");
        resetReq.setResetToken(verifyRes.getResetToken());
        resetReq.setNewPassword("NewPass@123");
        passwordResetService.resetPassword(resetReq);

        assertEquals("$2a$10$newHash", activeUser.getPassword());
        verify(userRepository).save(activeUser);
        verify(emailNotificationService).sendPasswordResetSuccessEmail("customer@gmail.com", "Nguyễn Văn A");

        AppException reuseTokenEx = assertThrows(AppException.class, () -> passwordResetService.resetPassword(resetReq));
        assertEquals(ErrorCode.UNAUTHORIZED, reuseTokenEx.getErrorCode());
    }

    @Test
    @DisplayName("Tài khoản Google chưa có SĐT: cho phép gửi OTP về email Google, xác minh và tự động liên kết SĐT mới")
    void googleUserWithoutPhone_CanResetPasswordAndBindPhoneSuccessfully() {
        User googleUser = User.builder()
                .id(99L)
                .email("googleuser@gmail.com")
                .phone(null)
                .fullName("Google User")
                .password("$2a$10$unusableUuidHash")
                .role(Role.CUSTOMER)
                .status("ACTIVE")
                .build();

        when(userRepository.findAllByEmailIgnoreCase("googleuser@gmail.com")).thenReturn(List.of(googleUser));
        when(userRepository.existsByPhoneAndIdNot("0944354398", 99L)).thenReturn(false);
        when(userRepository.findById(99L)).thenReturn(Optional.of(googleUser));
        when(passwordEncoder.encode("NewSecret@123")).thenReturn("$2a$10$newSecretHash");

        ForgotPasswordRequest forgotReq = new ForgotPasswordRequest();
        forgotReq.setEmail("googleuser@gmail.com");
        forgotReq.setPhone("0944354398");

        ForgotPasswordResponse forgotRes = passwordResetService.requestPasswordReset(forgotReq);
        assertEquals("go***@gmail.com", forgotRes.getMaskedEmail());

        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailNotificationService).sendPasswordResetOtpEmail(
                eq("googleuser@gmail.com"),
                eq("Google User"),
                otpCaptor.capture(),
                eq(5)
        );

        VerifyResetOtpRequest verifyReq = new VerifyResetOtpRequest();
        verifyReq.setEmail("googleuser@gmail.com");
        verifyReq.setOtp(otpCaptor.getValue());
        VerifyResetOtpResponse verifyRes = passwordResetService.verifyResetOtp(verifyReq);
        assertNotNull(verifyRes.getResetToken());

        ResetPasswordRequest resetReq = new ResetPasswordRequest();
        resetReq.setEmail("googleuser@gmail.com");
        resetReq.setResetToken(verifyRes.getResetToken());
        resetReq.setNewPassword("NewSecret@123");
        passwordResetService.resetPassword(resetReq);

        assertEquals("$2a$10$newSecretHash", googleUser.getPassword());
        assertEquals("0944354398", googleUser.getPhone());
        verify(userRepository).save(googleUser);
    }

    @Test
    @DisplayName("Tài khoản Google chưa có SĐT: chặn nếu SĐT nhập vào đã thuộc về tài khoản khác")
    void googleUserWithoutPhone_RejectsIfPhoneAlreadyTaken() {
        User googleUser = User.builder()
                .id(99L)
                .email("googleuser@gmail.com")
                .phone(null)
                .fullName("Google User")
                .role(Role.CUSTOMER)
                .status("ACTIVE")
                .build();

        when(userRepository.findAllByEmailIgnoreCase("googleuser@gmail.com")).thenReturn(List.of(googleUser));
        when(userRepository.existsByPhoneAndIdNot("0944354398", 99L)).thenReturn(true);

        ForgotPasswordRequest forgotReq = new ForgotPasswordRequest();
        forgotReq.setEmail("googleuser@gmail.com");
        forgotReq.setPhone("0944354398");

        AppException ex = assertThrows(AppException.class, () -> passwordResetService.requestPasswordReset(forgotReq));
        assertEquals(ErrorCode.PHONE_ALREADY_EXISTS, ex.getErrorCode());
        verify(emailNotificationService, never()).sendPasswordResetOtpEmail(anyString(), anyString(), anyString(), anyInt());
    }

    @Test
    @DisplayName("Chặn ngay ở Bước 1 nếu nhập nhầm Email của tài khoản khác không khớp SĐT")
    void requestPasswordReset_RejectsMismatchedEmailAndPhone() {
        when(userRepository.findAllByEmailIgnoreCase("other@gmail.com")).thenReturn(List.of(otherUser));

        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("other@gmail.com");
        req.setPhone("0912345678"); // SĐT của activeUser, không phải của otherUser

        AppException ex = assertThrows(AppException.class, () -> passwordResetService.requestPasswordReset(req));
        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
        verify(emailNotificationService, never()).sendPasswordResetOtpEmail(anyString(), anyString(), anyString(), anyInt());
    }

    @Test
    @DisplayName("Từ chối tài khoản placeholder Firebase không có email thật")
    void requestPasswordReset_RejectsPlaceholderFirebaseEmail() {
        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("0912345678@phone.firebase.local");
        req.setPhone("0912345678");

        AppException ex = assertThrows(AppException.class, () -> passwordResetService.requestPasswordReset(req));
        assertEquals(ErrorCode.OPERATION_NOT_ALLOWED, ex.getErrorCode());
        verify(userRepository, never()).findAllByEmailIgnoreCase(anyString());
    }

    @Test
    @DisplayName("Chặn gửi lại OTP quá nhanh trong thời gian cooldown 60 giây và cho phép sau 60 giây")
    void requestPasswordReset_EnforcesCooldown() {
        when(userRepository.findAllByEmailIgnoreCase("customer@gmail.com")).thenReturn(List.of(activeUser));

        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("customer@gmail.com");
        req.setPhone("0912345678");
        passwordResetService.requestPasswordReset(req);

        clock.advanceSeconds(30);
        AppException tooSoon = assertThrows(AppException.class, () -> passwordResetService.requestPasswordReset(req));
        assertEquals(ErrorCode.OPERATION_NOT_ALLOWED, tooSoon.getErrorCode());

        clock.advanceSeconds(31);
        assertDoesNotThrow(() -> passwordResetService.requestPasswordReset(req));
        verify(emailNotificationService, times(2))
                .sendPasswordResetOtpEmail(eq("customer@gmail.com"), eq("Nguyễn Văn A"), anyString(), eq(5));
    }

    @Test
    @DisplayName("Từ chối OTP đã hết hạn sau 5 phút")
    void verifyResetOtp_RejectsExpiredOtp() {
        when(userRepository.findAllByEmailIgnoreCase("customer@gmail.com")).thenReturn(List.of(activeUser));

        ForgotPasswordRequest forgotReq = new ForgotPasswordRequest();
        forgotReq.setEmail("customer@gmail.com");
        forgotReq.setPhone("0912345678");
        passwordResetService.requestPasswordReset(forgotReq);

        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailNotificationService).sendPasswordResetOtpEmail(anyString(), anyString(), otpCaptor.capture(), eq(5));

        clock.advanceSeconds(301);

        VerifyResetOtpRequest verifyReq = new VerifyResetOtpRequest();
        verifyReq.setEmail("customer@gmail.com");
        verifyReq.setOtp(otpCaptor.getValue());

        AppException ex = assertThrows(AppException.class, () -> passwordResetService.verifyResetOtp(verifyReq));
        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
    }

    @Test
    @DisplayName("Hủy OTP sau 5 lần nhập sai liên tiếp")
    void verifyResetOtp_InvalidatesAfterMaxAttempts() {
        when(userRepository.findAllByEmailIgnoreCase("customer@gmail.com")).thenReturn(List.of(activeUser));

        ForgotPasswordRequest forgotReq = new ForgotPasswordRequest();
        forgotReq.setEmail("customer@gmail.com");
        forgotReq.setPhone("0912345678");
        passwordResetService.requestPasswordReset(forgotReq);

        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailNotificationService).sendPasswordResetOtpEmail(anyString(), anyString(), otpCaptor.capture(), eq(5));
        String wrongOtp = otpCaptor.getValue().equals("000000") ? "111111" : "000000";

        VerifyResetOtpRequest wrongReq = new VerifyResetOtpRequest();
        wrongReq.setEmail("customer@gmail.com");
        wrongReq.setOtp(wrongOtp);

        for (int i = 1; i <= 4; i++) {
            AppException attemptEx = assertThrows(AppException.class, () -> passwordResetService.verifyResetOtp(wrongReq));
            assertEquals(ErrorCode.VALIDATION_ERROR, attemptEx.getErrorCode());
        }

        AppException fifthEx = assertThrows(AppException.class, () -> passwordResetService.verifyResetOtp(wrongReq));
        assertEquals(ErrorCode.OPERATION_NOT_ALLOWED, fifthEx.getErrorCode());

        VerifyResetOtpRequest rightReq = new VerifyResetOtpRequest();
        rightReq.setEmail("customer@gmail.com");
        rightReq.setOtp(otpCaptor.getValue());
        assertThrows(AppException.class, () -> passwordResetService.verifyResetOtp(rightReq));
    }

    @Test
    @DisplayName("Báo lỗi khi email chưa đăng ký hoặc tài khoản đang bị khóa")
    void requestPasswordReset_HandlesMissingAndLockedUser() {
        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("unknown@gmail.com");
        req.setPhone("0912345678");
        when(userRepository.findAllByEmailIgnoreCase("unknown@gmail.com")).thenReturn(Collections.emptyList());

        AppException notFound = assertThrows(AppException.class, () -> passwordResetService.requestPasswordReset(req));
        assertEquals(ErrorCode.RESOURCE_NOT_FOUND, notFound.getErrorCode());

        User lockedUser = User.builder()
                .id(11L)
                .email("locked@gmail.com")
                .phone("0911223344")
                .fullName("Locked User")
                .password("hash")
                .role(Role.CUSTOMER)
                .status("LOCKED")
                .build();
        when(userRepository.findAllByEmailIgnoreCase("locked@gmail.com")).thenReturn(List.of(lockedUser));
        req.setEmail("locked@gmail.com");
        req.setPhone("0911223344");

        AppException lockedEx = assertThrows(AppException.class, () -> passwordResetService.requestPasswordReset(req));
        assertEquals(ErrorCode.ACCOUNT_LOCKED, lockedEx.getErrorCode());
    }

    @Test
    @DisplayName("Không cho phép dùng resetToken của email này để đổi mật khẩu email khác")
    void resetPassword_RejectsTokenMismatchEmail() {
        when(userRepository.findAllByEmailIgnoreCase("customer@gmail.com")).thenReturn(List.of(activeUser));

        ForgotPasswordRequest forgotReq = new ForgotPasswordRequest();
        forgotReq.setEmail("customer@gmail.com");
        forgotReq.setPhone("0912345678");
        passwordResetService.requestPasswordReset(forgotReq);

        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailNotificationService).sendPasswordResetOtpEmail(anyString(), anyString(), otpCaptor.capture(), eq(5));

        VerifyResetOtpRequest verifyReq = new VerifyResetOtpRequest();
        verifyReq.setEmail("customer@gmail.com");
        verifyReq.setOtp(otpCaptor.getValue());
        String token = passwordResetService.verifyResetOtp(verifyReq).getResetToken();

        ResetPasswordRequest hijackReq = new ResetPasswordRequest();
        hijackReq.setEmail(otherUser.getEmail());
        hijackReq.setResetToken(token);
        hijackReq.setNewPassword("Hacked@123");

        AppException ex = assertThrows(AppException.class, () -> passwordResetService.resetPassword(hijackReq));
        assertEquals(ErrorCode.UNAUTHORIZED, ex.getErrorCode());
        verify(userRepository, never()).save(otherUser);
    }

    @Test
    @DisplayName("Kênh Số điện thoại: đối chiếu đúng SĐT trong DB -> gửi OTP SMS -> xác minh thành công")
    void requestPasswordReset_PhoneChannel_Success() {
        when(userRepository.findByPhone("0912345678")).thenReturn(Optional.of(activeUser));
        when(userRepository.findById(10L)).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.encode("PhonePass@123")).thenReturn("$2a$10$phonePassHash");

        ForgotPasswordRequest forgotReq = new ForgotPasswordRequest();
        forgotReq.setChannel("PHONE");
        forgotReq.setPhone("0912345678");

        ForgotPasswordResponse forgotRes = passwordResetService.requestPasswordReset(forgotReq);
        assertEquals("PHONE", forgotRes.getChannel());
        assertEquals("0912***678", forgotRes.getMaskedDestination());
        assertEquals(300, forgotRes.getExpiresInSeconds());

        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailNotificationService).sendPasswordResetOtpEmail(
                eq("customer@gmail.com"),
                eq("Nguyễn Văn A"),
                otpCaptor.capture(),
                eq(5)
        );

        VerifyResetOtpRequest verifyReq = new VerifyResetOtpRequest();
        verifyReq.setChannel("PHONE");
        verifyReq.setPhone("0912345678");
        verifyReq.setOtp(otpCaptor.getValue());

        VerifyResetOtpResponse verifyRes = passwordResetService.verifyResetOtp(verifyReq);
        assertNotNull(verifyRes.getResetToken());

        ResetPasswordRequest resetReq = new ResetPasswordRequest();
        resetReq.setResetToken(verifyRes.getResetToken());
        resetReq.setNewPassword("PhonePass@123");
        passwordResetService.resetPassword(resetReq);

        assertEquals("$2a$10$phonePassHash", activeUser.getPassword());
        verify(userRepository).save(activeUser);
    }

    @Test
    @DisplayName("Kênh Số điện thoại: báo lỗi nếu SĐT chưa được đăng ký trong database")
    void requestPasswordReset_PhoneChannel_NotFound() {
        when(userRepository.findByPhone("0999999999")).thenReturn(Optional.empty());

        ForgotPasswordRequest forgotReq = new ForgotPasswordRequest();
        forgotReq.setChannel("PHONE");
        forgotReq.setPhone("0999999999");

        AppException ex = assertThrows(AppException.class, () -> passwordResetService.requestPasswordReset(forgotReq));
        assertEquals(ErrorCode.RESOURCE_NOT_FOUND, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("Số điện thoại này chưa được đăng ký"));
    }

    @Test
    @DisplayName("Giới hạn số request: Chặn sau 5 lần yêu cầu OTP trong vòng 15 phút để chống nghẽn dữ liệu")
    void requestPasswordReset_RateLimiting_BlocksAfterMaxRequests() {
        when(userRepository.findAllByEmailIgnoreCase("customer@gmail.com")).thenReturn(List.of(activeUser));

        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setChannel("EMAIL");
        req.setEmail("customer@gmail.com");

        // Gửi 5 lần hợp lệ (mỗi lần qua 61s cooldown)
        for (int i = 1; i <= 5; i++) {
            assertDoesNotThrow(() -> passwordResetService.requestPasswordReset(req));
            clock.advanceSeconds(61);
        }

        // Lần thứ 6 trong vòng 15 phút: Bị chặn bởi Rate Limiter
        AppException rateLimitEx = assertThrows(AppException.class, () -> passwordResetService.requestPasswordReset(req));
        assertEquals(ErrorCode.OPERATION_NOT_ALLOWED, rateLimitEx.getErrorCode());
        assertTrue(rateLimitEx.getMessage().contains("quá 5 lần trong 15 phút"));
    }

    private static final class MutableClock extends Clock {
        private Instant current;

        MutableClock(Instant initial) {
            this.current = initial;
        }

        void advanceSeconds(long seconds) {
            this.current = this.current.plusSeconds(seconds);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return current;
        }
    }
}
