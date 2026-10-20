package com.traveleasy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "location_type", length = 30)
    @Builder.Default
    private String locationType = "BUS_STATION"; // BUS_STATION, BUS_STOP, OFFICE, REST_STOP

    @Column(length = 100)
    private String province;

    @Column(length = 255)
    private String address;

    @Column(name = "routes_count")
    @Builder.Default
    private Integer routesCount = 0;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

