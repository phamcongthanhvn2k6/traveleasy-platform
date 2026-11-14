package com.traveleasy.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trip_seats", indexes = {
    @Index(name = "idx_trip_seats_trip_id", columnList = "trip_id"),
    @Index(name = "idx_trip_seats_trip_floor_code", columnList = "trip_id, floor, seat_code"),
    @Index(name = "idx_trip_seats_trip_seat_code", columnList = "trip_id, seat_code"),
    @Index(name = "idx_trip_seats_trip_status", columnList = "trip_id, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripSeat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "seat_code", nullable = false, length = 10)
    private String seatCode; // A01, A02, B01...

    @Column(nullable = false)
    @Builder.Default
    private Integer floor = 1;

    @Column(name = "row_num")
    @Builder.Default
    private Integer rowNum = 1;

    @Column(name = "col_num")
    @Builder.Default
    private Integer colNum = 1;

    @Column(name = "seat_type", length = 50)
    @Builder.Default
    private String seatType = "STANDARD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SeatStatus status = SeatStatus.AVAILABLE;
}
