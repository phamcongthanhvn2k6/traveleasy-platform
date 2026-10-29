package com.traveleasy.dto.trip;

import com.traveleasy.entity.BusType;
import com.traveleasy.entity.TripStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripResponse {
    private Long id;
    private Long busCompanyId;
    private String busCompanyName;
    private String busCompanyLogo;
    private BigDecimal busCompanyRating;
    private Long routeId;
    private String originCity;
    private String destinationCity;
    private Integer distanceKm;
    private Integer durationHours;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private BusType busType;
    private BigDecimal price;
    private Integer totalSeats;
    private Integer availableSeats;
    private TripStatus status;
    private List<PointResponse> pickupPoints;
    private List<PointResponse> dropoffPoints;
}
