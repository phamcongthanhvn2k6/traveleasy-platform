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
public class TripDetailResponse {
    private TripResponse trip;
    private List<TripSeatResponse> seats;
    private List<PointResponse> pickupPoints;
    private List<PointResponse> dropoffPoints;
}
