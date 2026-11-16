package com.traveleasy.dto.conductor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConductorSeatManifestResponse {
    private Long tripId;
    private String route;
    private String licensePlate;
    private int totalSeats;
    private int checkedInCount;
    private int pendingCount;
    private List<ConductorSeatItem> seats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConductorSeatItem {
        private String seatCode;
        private int floor;
        private String seatType;
        private boolean occupied;
        private boolean checkedIn; // true = đã lên xe (USED), false = chưa lên xe
        private String ticketCode;
        private String passengerName;
        private String passengerPhone;
    }
}
