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
public class TripPerformanceDto {
    private Long tripId;
    private String tripCode;
    private String routeName;
    private String departureTime;
    private String licensePlate;
    private String busType;
    private Integer totalSeats;
    private Integer bookedSeats;
    private Integer availableSeats;
    private Double occupancyRate;
    private BigDecimal price;
    private BigDecimal grossRevenue;
    private BigDecimal platformFee;
    private BigDecimal netRevenue;
    private String status;
    private String occupancyLevel; // PEAK (>=80%), NORMAL (50-79%), LOW (<50%)
}
