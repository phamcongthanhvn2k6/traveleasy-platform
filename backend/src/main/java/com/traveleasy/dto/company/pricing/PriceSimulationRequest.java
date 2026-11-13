package com.traveleasy.dto.company.pricing;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceSimulationRequest {

    private Long busCompanyId;

    @NotNull(message = "Giá vé gốc không được để trống")
    @DecimalMin(value = "1000.0", message = "Giá vé gốc phải từ 1.000 VNĐ trở lên")
    private BigDecimal basePrice;

    @NotNull(message = "Thời gian khởi hành không được để trống")
    private LocalDateTime departureTime;

    private Long routeId;

    @NotNull(message = "Tổng số ghế không được để trống")
    @Min(value = 1, message = "Tổng số ghế phải lớn hơn 0")
    private Integer totalSeats;

    @NotNull(message = "Số ghế trống không được để trống")
    @Min(value = 0, message = "Số ghế trống không được âm")
    private Integer availableSeats;

    private LocalDateTime requestTime;
}
