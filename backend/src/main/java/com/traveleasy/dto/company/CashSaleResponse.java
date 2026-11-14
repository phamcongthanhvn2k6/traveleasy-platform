package com.traveleasy.dto.company;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CashSaleResponse(
        String id,
        String ticketCode,
        BigDecimal amount,
        LocalDateTime createdAt,
        String note,
        String source
) {}

