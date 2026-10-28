package com.traveleasy.dto.trip;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteScheduleResponse {
    private Long routeId;
    private String originCity;
    private String destinationCity;
    private BigDecimal distanceKm;
    private BigDecimal durationHours;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer totalTrips;
    private String frequency;

    // Chiều đi (Outbound)
    private List<ScheduleTripItem> outboundTrips;

    // Chiều về (Inbound)
    private Long returnRouteId;
    private List<ScheduleTripItem> inboundTrips;

    // Điểm đón/trả mặc định của tuyến
    private List<PointResponse> pickupPoints;
    private List<PointResponse> dropoffPoints;

    // Danh sách tỉnh/thành phố có trong hệ thống
    private List<String> availableOrigins;
    private List<String> availableDestinations;
}

