package com.traveleasy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "booking_code", length = 50)
    private String bookingCode;

    @Column(name = "trip_id")
    private Long tripId;

    @Column(name = "bus_company_id")
    private Long busCompanyId;

    @Column(name = "bus_company_name", nullable = false, length = 150)
    private String busCompanyName;

    @Column(name = "route_name", nullable = false, length = 200)
    private String routeName;

    @Column(nullable = false)
    private Integer rating; // 1 to 5

    @Column(name = "punctuality_rating", precision = 2, scale = 1)
    private BigDecimal punctualityRating;

    @Column(name = "cleanliness_rating", precision = 2, scale = 1)
    private BigDecimal cleanlinessRating;

    @Column(name = "service_rating", precision = 2, scale = 1)
    private BigDecimal serviceRating;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls;

    @Column(name = "company_reply", columnDefinition = "TEXT")
    private String companyReply;

    @Column(length = 30)
    private String status; // "APPROVED", "PENDING"

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
