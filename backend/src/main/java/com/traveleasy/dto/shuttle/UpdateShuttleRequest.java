package com.traveleasy.dto.shuttle;

import com.traveleasy.entity.ShuttleRequestStatus;
import lombok.*;

import java.time.LocalDateTime;

/**
 * [S317] DTO cập nhật thông tin yêu cầu trung chuyển
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateShuttleRequest {
    private String passengerName;
    private String passengerPhone;
    private String pickupAddress;
    private LocalDateTime shuttlePickupTime;
    private String assignedVehiclePlate;
    private String shuttleDriverName;
    private ShuttleRequestStatus status;
}
