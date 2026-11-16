package com.traveleasy.dto.conductor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateTicketResponse {
    private boolean valid;
    private String checkInStatus; // CHECKED_IN, ALREADY_CHECKED_IN, INVALID_TRIP, CANCELLED, EXCHANGED, NOT_FOUND
    private String validationColor; // GREEN, RED, YELLOW
    private String ticketCode;
    private String seatNumber;
    private String passengerName;
    private String passengerPhone;
    private Long tripId;
    private String tripRoute;
    private LocalDateTime departureTime;
    private BigDecimal ticketPrice;
    private String message;
}
