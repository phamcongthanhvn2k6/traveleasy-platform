package com.traveleasy.dto.company.expense;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripProfitLossResponse {
    private Long tripId;
    private String tripCode;
    private String routeName;
    private String licensePlate;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String tripStatus;

    private BigDecimal actualRevenue;
    private BigDecimal fuelCost;
    private BigDecimal tollBotCost;
    private BigDecimal driverSalary;
    private BigDecimal terminalFee;
    private BigDecimal otherCosts;
    private BigDecimal totalExpense;
    private BigDecimal netProfit;
    private Boolean isLoss;
    private BigDecimal lossAmount;
    private Double profitMarginPercent;

    private String invoiceNumber;
    private String notes;
    private Boolean isLocked;
    private String accessScope;
    private String lockNotice;
}
