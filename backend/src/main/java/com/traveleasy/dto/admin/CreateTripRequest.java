package com.traveleasy.dto.admin;

import com.traveleasy.entity.BusType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreateTripRequest {
    @NotNull(message = "Nhà xe không được để trống")
    private Long busCompanyId;

    @NotNull(message = "Tuyến đường không được để trống")
    private Long routeId;

    @NotNull(message = "Thời gian khởi hành không được để trống")
    private LocalDateTime departureTime;

    @NotNull(message = "Thời gian đến không được để trống")
    private LocalDateTime arrivalTime;

    @NotNull(message = "Loại xe không được để trống")
    private BusType busType;

    @NotNull(message = "Giá vé không được để trống")
    @DecimalMin(value = "1000", message = "Giá vé phải tối thiểu 1.000 VNĐ")
    private BigDecimal price;

    @Min(value = 1, message = "Số ghế phải lớn hơn 0")
    @Max(value = 100, message = "Số ghế tối đa 100")
    private Integer totalSeats = 34; // mặc định 34 giường
}
