package com.traveleasy.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAdminProposalRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String proposedEmail;

    @NotBlank(message = "Họ tên không được để trống")
    private String proposedFullName;

    private String proposedPhone;

    private String departmentOrRoleNote;

    @NotBlank(message = "Vui lòng nhập lý do đề xuất cấp quyền Admin")
    private String reason;
}

