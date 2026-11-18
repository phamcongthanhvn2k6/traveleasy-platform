package com.traveleasy.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelBookingRequest {
    private String bankName;
    private String accountNumber;
    private String accountHolder;
    private String reason;
    private List<Long> ticketIds;
}

