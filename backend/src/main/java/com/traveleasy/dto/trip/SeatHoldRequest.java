package com.traveleasy.dto.trip;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatHoldRequest {
    private Long tripId;
    private List<String> seatCodes;
    private String sessionId;
    private Integer ttlSeconds;

    public SeatHoldRequest(List<String> seatCodes, String sessionId) {
        this.seatCodes = seatCodes;
        this.sessionId = sessionId;
    }
}
