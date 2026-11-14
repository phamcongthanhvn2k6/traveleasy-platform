package com.traveleasy.dto.company.crew;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripCrewResponse {
    private Long id;
    private Long tripId;
    private String tripCode;
    private String route;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String licensePlate;
    private String busType;
    private Integer distanceKm;

    private String primaryDriverName;
    private String primaryDriverPhone;
    private String primaryDriverLicense;

    private String secondaryDriverName;
    private String secondaryDriverPhone;

    private String conductorName;
    private String conductorPhone;

    private BigDecimal continuousDriveHours;
    private Boolean alcoholTested;
    private BigDecimal alcoholReading;

    private String dispatchPermitCode;
    private LocalDateTime dispatchedAt;

    private String status;
    private String notes;
}
