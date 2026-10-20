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
public class CancellationPolicyRequest {
    @NotBlank(message = "Tên chính sách không được để trống")
    private String name;

    private Boolean isDefault;
    private String busCompanyName;
    private String description;
    private Integer rulesCount;
}

