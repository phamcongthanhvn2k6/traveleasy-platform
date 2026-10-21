package com.traveleasy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seat_layout_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatLayoutTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "max_floor")
    @Builder.Default
    private Integer maxFloor = 1;

    @Column(name = "max_rows")
    @Builder.Default
    private Integer maxRows = 6;

    @Column(name = "max_columns")
    @Builder.Default
    private Integer maxColumns = 3;

    @Column(name = "total_seats")
    @Builder.Default
    private Integer totalSeats = 34;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "PUBLISHED"; // DRAFT, PUBLISHED, DEPRECATED

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

