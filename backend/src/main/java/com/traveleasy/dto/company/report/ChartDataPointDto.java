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
public class ChartDataPointDto {
    private String label;
    private String date;
    private BigDecimal grossRevenue;
    private BigDecimal platformFee;
    private BigDecimal netRevenue;
    private Long bookings;
    private Double occupancyRate;
}
