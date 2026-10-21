package com.traveleasy.dto.booking;

import lombok.Data;

@Data
public class RescheduleRequest {
    private Long ticketId;
    private Long newTripId;
    private String newSeatNumber;
}
