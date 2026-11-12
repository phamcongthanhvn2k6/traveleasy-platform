package com.traveleasy.dto.shuttle;

import com.traveleasy.entity.ShuttleRequestStatus;
import lombok.*;

import java.time.LocalDateTime;

/**
 * [S317] DTO phản hồi chi tiết yêu cầu trung chuyển
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShuttleRequestResponse {
    private Long id;
    private Long busCompanyId;
    private Long bookingId;
    private String passengerName;
    private String passengerPhone;
    private String pickupAddress;
    private Long mainTripId;
    private String mainTripRoute;
    private String tripDepartureTime;
    private LocalDateTime shuttlePickupTime;
    private String assignedVehiclePlate;
    private String shuttleDriverName;
    private ShuttleRequestStatus status;
    private LocalDateTime createdAt;
}
