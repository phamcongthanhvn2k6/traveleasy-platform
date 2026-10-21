package com.traveleasy.dto.admin;

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
public class RouteAdminResponse {
    private Long id;
    private Long busCompanyId;
    private String busCompanyName;
    private String departureLocation;
    private String arrivalLocation;
    private BigDecimal durationHours;
    private BigDecimal distanceKm;
    private Integer pointsCount;
    private LocalDateTime createdAt;
}

