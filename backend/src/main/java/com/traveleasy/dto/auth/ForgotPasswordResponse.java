package com.traveleasy.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordResponse {
    private String maskedEmail;
    private String maskedFullName;
    private String roleLabel;
    private int expiresInSeconds;
    private int resendCooldownSeconds;
}
