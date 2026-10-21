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
public class SeatTypeRequest {
    @NotBlank(message = "Mã loại ghế không được để trống")
    private String code;

    @NotBlank(message = "Nhãn loại ghế không được để trống")
    private String label;

    private String description;
    private String status;
}

