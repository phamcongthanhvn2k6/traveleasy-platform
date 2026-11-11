package com.traveleasy.dto.company;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record OpenPosShiftRequest(
        @NotBlank(message = "Tên thu ngân không được để trống")
        String cashierName,

        @NotBlank(message = "Tên/số quầy không được để trống")
        String counter,

        @NotNull(message = "Số tiền lẻ ban đầu không được để trống")
        @DecimalMin(value = "0.00", message = "Số tiền lẻ ban đầu phải >= 0")
        BigDecimal initialCash
) {}

