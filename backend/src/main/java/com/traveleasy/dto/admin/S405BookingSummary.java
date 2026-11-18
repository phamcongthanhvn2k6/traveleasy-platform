package com.traveleasy.dto.admin;

import java.math.BigDecimal;

/** Global, unfiltered booking KPIs; revenue includes CONFIRMED bookings only. */
public record S405BookingSummary(long total, long confirmed, long pending, long cancelled,
                                 BigDecimal confirmedRevenue) {
}
