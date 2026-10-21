package com.traveleasy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_company_id")
    private BusCompany busCompany;

    @Column(name = "plate_number", nullable = false, length = 30)
    private String plateNumber;

    @Column(name = "vehicle_code", length = 30)
    private String vehicleCode;

    @Column(name = "vehicle_type", length = 30)
    private String vehicleType; // SLEEPER, LIMOUSINE, SEATED

    @Column(name = "floors")
    @Builder.Default
    private Integer floors = 2;

    @Column(name = "manufacture_year")
    @Builder.Default
    private Integer manufactureYear = 2023;

    @Column(name = "seat_layout", length = 150)
    private String seatLayout;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

