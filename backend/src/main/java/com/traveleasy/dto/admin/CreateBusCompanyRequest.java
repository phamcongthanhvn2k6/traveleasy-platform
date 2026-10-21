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
public class CreateBusCompanyRequest {
    @NotBlank(message = "Tên nhà xe không được để trống")
    private String name;

    private String code;

    @NotBlank(message = "Hotline không được để trống")
    private String hotline;

    private String email;
    private String address;
    private String logoUrl;
    private String status; // PENDING_APPROVAL, ACTIVE, SUSPENDED
}

