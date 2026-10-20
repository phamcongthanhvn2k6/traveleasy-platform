package com.traveleasy.dto.trip;

import com.traveleasy.entity.SeatStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripSeatResponse {
    private Long id;
    private String seatNumber;
    private Integer deck;
    private SeatStatus status;
    private BigDecimal price;
}
