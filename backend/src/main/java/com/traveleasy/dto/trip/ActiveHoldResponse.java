package com.traveleasy.dto.trip;

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
public class ActiveHoldResponse {
    private boolean hasActiveHold;
    private Long tripId;
    private String busCompanyName;
    private String busCompanyLogo;
    private String originCity;
    private String destinationCity;
    private LocalDateTime departureTime;
    private BigDecimal price;
    private List<String> seatCodes;
    private Long remainingSeconds;
    private Long expiryTimestamp;
}
