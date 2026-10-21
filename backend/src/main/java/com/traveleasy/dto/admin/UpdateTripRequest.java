package com.traveleasy.dto.admin;

import com.traveleasy.entity.BusType;
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
    private BigDecimal price;
    private Integer totalSeats;
}

