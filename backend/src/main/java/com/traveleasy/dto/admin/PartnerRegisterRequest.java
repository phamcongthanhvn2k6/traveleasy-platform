package com.traveleasy.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerRegisterRequest {
    @NotBlank(message = "Tên nhà xe không được để trống")
    private String companyName;

    @NotBlank(message = "Họ tên người liên hệ không được để trống")
    private String contactName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;

    private String email;
    private String taxCode;
    private String businessAddress;
    private String routes;
    private String fleetSize;
    private String notes;
}

