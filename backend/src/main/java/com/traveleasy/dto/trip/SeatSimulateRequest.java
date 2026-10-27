package com.traveleasy.dto.trip;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatSimulateRequest {
    private String seatNumber;
    private String action; // "HOLD", "BOOK", "RELEASE"
}

