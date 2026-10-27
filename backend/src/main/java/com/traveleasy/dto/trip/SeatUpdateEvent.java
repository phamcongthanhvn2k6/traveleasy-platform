package com.traveleasy.dto.trip;

import com.traveleasy.entity.SeatStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatUpdateEvent {
    private Long tripId;
    private String seatNumber;
    private SeatStatus status;
    private String message;
    private String holderSessionId;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
