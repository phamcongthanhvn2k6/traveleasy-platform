package com.traveleasy.dto.company;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ClosePosShiftRequest(
        @NotNull(message = "Mã ca trực không được để trống")
        Long shiftId,

        @NotNull(message = "Số tiền thực đếm không được để trống")
        @DecimalMin(value = "0.00", message = "Số tiền thực đếm phải >= 0")
        BigDecimal countedCash,

        String closeNote
) {}

