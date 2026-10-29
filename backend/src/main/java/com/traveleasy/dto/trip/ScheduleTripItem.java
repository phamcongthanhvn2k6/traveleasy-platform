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
public class ScheduleTripItem {
    private Long id;
    private Long busCompanyId;
    private String busCompanyName;
    private String busCompanyLogo;
    private Double busCompanyRating;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String departureTimeFormatted;
    private String arrivalTimeFormatted;
    private String durationFormatted;
    private BusType busType;
    private String busTypeName;
    private BigDecimal price;
    private Integer totalSeats;
    private Integer availableSeats;
    private TripStatus status;
    private String originCity;
    private String destinationCity;
    private String mainPickupPoint;
    private String mainDropoffPoint;
    private List<PointResponse> pickupPoints;
    private List<PointResponse> dropoffPoints;
}

