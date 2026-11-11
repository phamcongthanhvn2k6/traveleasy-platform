package com.traveleasy.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyResetOtpResponse {
    private String resetToken;
    private int expiresInSeconds;
}
