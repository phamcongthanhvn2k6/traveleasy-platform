package com.traveleasy.dto.company;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PosShiftResponse(
        Long id,
        String code,
        Long companyId,
        String cashierName,
        String counter,
        BigDecimal openingFloat,
        LocalDateTime openedAt,
        String status,
        List<CashSaleResponse> cashSales,
        List<CashSaleResponse> cashRefunds,
        BigDecimal cashSalesTotal,
        BigDecimal cashRefundsTotal,
        BigDecimal expectedCash,
        LocalDateTime closedAt,
        BigDecimal countedCash,
        BigDecimal variance,
        String closeNote
) {}

