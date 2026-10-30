package com.traveleasy.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "routes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_company_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private BusCompany busCompany;

    @Column(name = "departure_location", nullable = false, length = 100)
    private String departureLocation;

    @Column(name = "arrival_location", nullable = false, length = 100)
    private String arrivalLocation;

    @Column(name = "duration_hours", nullable = false, precision = 4, scale = 1)
    private BigDecimal durationHours;

    @Column(name = "distance_km", precision = 6, scale = 1)
    private BigDecimal distanceKm;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnoreProperties({"route", "hibernateLazyInitializer", "handler"})
    private List<PickupDropoffPoint> points = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
