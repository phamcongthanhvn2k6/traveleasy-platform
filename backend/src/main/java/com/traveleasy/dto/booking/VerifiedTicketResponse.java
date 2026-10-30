package com.traveleasy.dto.booking;

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
public class VerifiedTicketResponse {
    private String bookingCode;
    private String ticketCode;
    private String passengerName;
    private String passengerPhone;
    private String passengerEmail;
    private String busCompanyName;
    private String busType;
    private String licensePlate;
    private String routeName;
    private String originCity;
    private String destinationCity;
    private String pickupPoint;
    private String dropoffPoint;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String seatNumber;
    private BigDecimal price;
    private String ticketStatus;   // ISSUED, USED, CANCELLED
    private String bookingStatus;  // CONFIRMED, PENDING, CANCELLED, COMPLETED
    private String validationStatus; // VALID, ALREADY_CHECKED_IN, CANCELLED, INVALID
    private String validationMessage;
    private boolean checkInAllowed;
}

