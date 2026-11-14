package com.traveleasy.dto.company.exchange;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketLookupResponse {
    private Long ticketId;
    private String ticketCode;
    private String bookingCode;
    private String status;
    private String customerName;
    private String customerPhone;
    private Long tripId;
    private String route;
    private LocalDateTime departureTime;
    private String seatNumber;
    private BigDecimal price;
    private boolean canExchange;
    private long hoursUntilDeparture;
    private String policyNotice;
}
