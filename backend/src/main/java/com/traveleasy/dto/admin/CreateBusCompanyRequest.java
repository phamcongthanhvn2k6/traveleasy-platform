package com.traveleasy.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBusCompanyRequest {
    @NotBlank(message = "Tên nhà xe không được để trống")
    private String name;

    private String code;

    @NotBlank(message = "Hotline không được để trống")
    @Pattern(regexp = "^(0|\\+84|1900|1800)[0-9]{6,10}$", message = "Số hotline không đúng định dạng (VD: 19006067 hoặc 0988123456)")
    private String hotline;

    @Email(message = "Email không đúng định dạng")
    private String email;

    private String address;
    private String logoUrl;
    private String status; // PENDING_APPROVAL, ACTIVE, SUSPENDED
}
