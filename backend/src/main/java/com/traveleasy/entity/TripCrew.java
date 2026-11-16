package com.traveleasy.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trip_crews", indexes = {
    @Index(name = "idx_trip_crews_trip_id", columnList = "trip_id"),
    @Index(name = "idx_trip_crews_bus_company_id", columnList = "bus_company_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TripCrew {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_company_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private BusCompany busCompany;

    @Column(name = "primary_driver_name", nullable = false, length = 100)
    private String primaryDriverName;

    @Column(name = "primary_driver_phone", nullable = false, length = 20)
    private String primaryDriverPhone;

    @Column(name = "primary_driver_license", length = 50)
    private String primaryDriverLicense;

    @Column(name = "secondary_driver_name", length = 100)
    private String secondaryDriverName;

    @Column(name = "secondary_driver_phone", length = 20)
    private String secondaryDriverPhone;

    @Column(name = "conductor_name", length = 100)
    private String conductorName;

    @Column(name = "conductor_phone", length = 20)
    private String conductorPhone;

    @Column(name = "continuous_drive_hours", precision = 4, scale = 1)
    @Builder.Default
    private BigDecimal continuousDriveHours = BigDecimal.ZERO;

    @Column(name = "alcohol_tested", nullable = false)
    @Builder.Default
    private Boolean alcoholTested = false;

    @Column(name = "alcohol_reading", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal alcoholReading = BigDecimal.ZERO;

    @Column(name = "dispatch_permit_code", length = 50)
    private String dispatchPermitCode;

    @Column(name = "dispatched_at")
    private LocalDateTime dispatchedAt;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "COMPLIANT";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
