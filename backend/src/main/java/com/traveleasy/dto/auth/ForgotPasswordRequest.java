package com.traveleasy.dto.auth;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    /**
     * Kênh nhận mã OTP: "EMAIL" hoặc "PHONE" (mặc định EMAIL nếu để trống)
     */
    private String channel;

    /**
     * Địa chỉ email của tài khoản khi chọn kênh EMAIL (hoặc đối chiếu)
     */
    private String email;

    /**
     * Số điện thoại của tài khoản khi chọn kênh PHONE (hoặc đối chiếu)
     */
    private String phone;
}
