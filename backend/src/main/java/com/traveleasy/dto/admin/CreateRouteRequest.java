package com.traveleasy.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRouteRequest {
    @NotNull(message = "Nhà xe không được để trống")
    private Long busCompanyId;

    @NotBlank(message = "Điểm khởi hành không được để trống")
    private String departureLocation;

    @NotBlank(message = "Điểm đến không được để trống")
    private String arrivalLocation;

    @NotNull(message = "Thời gian di chuyển dự kiến (giờ) không được để trống")
    private BigDecimal durationHours;

    private BigDecimal distanceKm;
}
