package com.traveleasy.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pickup_dropoff_points", indexes = {
    @Index(name = "idx_pdp_route_id", columnList = "route_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PickupDropoffPoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @Enumerated(EnumType.STRING)
    @Column(name = "point_type", nullable = false)
    private PointType pointType;

    @Column(nullable = false)
    private String name;

    private String address;

    @Column(name = "display_order")
    private Integer displayOrder;
}
