package com.traveleasy.dto.pos;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosShiftReportResponse {

    private Long shiftId;
    private String shiftCode;
    private Long busCompanyId;
    private Long staffUserId;
    private String cashierName;
    private Long terminalLocationId;
    private String terminalName;
    private String counterName;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private BigDecimal initialCashAmount;
    private BigDecimal totalCashCollected;
    private BigDecimal totalQrCollected;
    private BigDecimal totalRevenue;
    private BigDecimal expectedCashInDrawer;
    private BigDecimal countedCashAmount;
    private BigDecimal cashDiscrepancy;
    private String auditStatus; // OPEN, BALANCED, SURPLUS, DEFICIT
    private Integer totalTicketsSold;
    private String status; // OPEN, CLOSED
    private String notes;
}

