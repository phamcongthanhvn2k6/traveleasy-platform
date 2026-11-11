package com.traveleasy.dto.company.exchange;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketExchangeResponse {
    private Long exchangeId;
    private String status;
    private String message;
    private String oldTicketCode;
    private String oldTicketStatus;
    private String newTicketCode;
    private String newSeatCode;
    private Long newTripId;
    private BigDecimal oldPrice;
    private BigDecimal newPrice;
    private BigDecimal priceDifference;
    private BigDecimal surchargeAmount;
    private BigDecimal refundAmount;
    private BigDecimal exchangeFee;
    private String customerName;
    private String customerPhone;
    private LocalDateTime oldTripDepartureTime;
    private LocalDateTime newTripDepartureTime;
    private String oldRoute;
    private String newRoute;
    private LocalDateTime exchangeTime;
}
