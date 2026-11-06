package com.traveleasy.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body cho các endpoint xác thực Firebase (/auth/firebase/google, /auth/firebase/phone).
 *
 * Client (frontend) đăng nhập bằng Firebase JS SDK (Google popup hoặc Phone OTP),
 * sau đó lấy Firebase ID Token và gửi lên backend để verify + cấp JWT nội bộ.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FirebaseAuthRequest {

    /**
     * Firebase ID Token (JWT) lấy từ user.getIdToken() phía client.
     * Backend dùng Firebase Admin SDK verify chữ ký và trích xuất email/phone/name.
     */
    @NotBlank(message = "Firebase ID Token không được để trống")
    private String idToken;
}

