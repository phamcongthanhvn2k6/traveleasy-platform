package com.traveleasy.dto.company.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyReportSummaryResponse {
    private Long busCompanyId;
    private String companyName;
    private String period;

    // KPI Counters
    private BigDecimal totalGrossRevenue;
    private Double platformFeeRate; // 8.0%
    private BigDecimal totalPlatformFee;
    private BigDecimal totalNetRevenue;
    private Long totalTickets;
    private Long totalTrips;
    private Double avgOccupancyRate;
    private Long peakTripsCount;
    private Long lowTripsCount;

    // Charts & Breakdowns
    private List<ChartDataPointDto> chartData;
    private List<RoutePerformanceDto> routePerformances;
    private List<TripPerformanceDto> tripPerformances;
}
