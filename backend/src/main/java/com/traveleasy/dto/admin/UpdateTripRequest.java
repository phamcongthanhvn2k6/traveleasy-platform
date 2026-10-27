package com.traveleasy.dto.admin;

import com.traveleasy.entity.BusType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class UpdateTripRequest {
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private BusType busType;

    @DecimalMin(value = "1000", message = "Giá vé phải tối thiểu 1.000 VNĐ")
    private BigDecimal price;

    @Min(value = 1, message = "Số ghế phải lớn hơn 0")
    @Max(value = 100, message = "Số ghế tối đa 100")
    private Integer totalSeats;
}
