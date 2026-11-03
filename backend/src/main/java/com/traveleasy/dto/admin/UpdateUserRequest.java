package com.traveleasy.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO dùng cho endpoint PUT /admin/users/{id}.
 * Tất cả các trường đều tùy chọn — chỉ những trường được gửi lên (khác null/blank)
 * mới được cập nhật. Cho phép Admin đổi email hoặc đặt lại mật khẩu người dùng.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    @Email(message = "Email không hợp lệ")
    private String email;

    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    private String fullName;

    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Số điện thoại không đúng định dạng (10 số)")
    private String phone;

    private String role; // ADMIN, OPERATOR, CUSTOMER
}

