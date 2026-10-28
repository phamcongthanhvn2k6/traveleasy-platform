package com.traveleasy.dto.trip;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteOptionResponse {
    private Long id;
    private String departureLocation;
    private String arrivalLocation;
    private BigDecimal distanceKm;
    private BigDecimal durationHours;
}

