package com.traveleasy.dto.company.expense;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyExpenseSummaryResponse {
    private List<TripProfitLossResponse> trips;
    private BigDecimal totalRevenue;
    private BigDecimal totalExpense;
    private BigDecimal totalNetProfit;
    private Double overallMarginPercent;
    private Integer lossTripsCount;
}
