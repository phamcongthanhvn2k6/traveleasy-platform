package com.traveleasy.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Email hoặc số điện thoại không được để trống")
    private String identifier; // email or phone

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
}
