package com.traveleasy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * [S317] Thực thể yêu cầu xe trung chuyển đón trả hành khách tận nơi
 * Ánh xạ 1:1 với bảng shuttle_requests trong init.sql
 */
@Entity
@Table(name = "shuttle_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShuttleRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bus_company_id", nullable = false)
    private Long busCompanyId;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "passenger_name", nullable = false, length = 100)
    private String passengerName;

    @Column(name = "passenger_phone", nullable = false, length = 20)
    private String passengerPhone;

    @Column(name = "pickup_address", nullable = false, length = 255)
    private String pickupAddress;

    @Column(name = "main_trip_id", nullable = false)
    private Long mainTripId;

    @Column(name = "shuttle_pickup_time", nullable = false)
    private LocalDateTime shuttlePickupTime;

    @Column(name = "assigned_vehicle_plate", length = 30)
    private String assignedVehiclePlate;

    @Column(name = "shuttle_driver_name", length = 100)
    private String shuttleDriverName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ShuttleRequestStatus status = ShuttleRequestStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
