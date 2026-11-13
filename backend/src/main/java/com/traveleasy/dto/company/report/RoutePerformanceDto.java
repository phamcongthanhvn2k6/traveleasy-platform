package com.traveleasy.dto.company.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutePerformanceDto {
    private String routeId;
    private String routeName;
    private Integer tripsCount;
    private Integer totalSeats;
    private Integer bookedSeats;
    private Double occupancyRate;
    private BigDecimal grossRevenue;
    private BigDecimal platformFee;
    private BigDecimal netRevenue;
}
