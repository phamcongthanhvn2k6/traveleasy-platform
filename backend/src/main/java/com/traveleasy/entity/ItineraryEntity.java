package com.traveleasy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

/**
 * Entity đại diện cho Kịch bản Lịch trình Du lịch (Cẩm nang du lịch & Lộ trình khám phá)
 * Lưu trữ tập trung tại CSDL PostgreSQL Supabase (Bảng: itineraries)
 */
@Entity
@Table(name = "itineraries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItineraryEntity {

    @Id
    @Column(name = "id", length = 100)
    private String id;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "duration", nullable = false)
    private String duration;

    @Column(name = "vibe", nullable = false)
    private String vibe;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "tagline", columnDefinition = "TEXT")
    private String tagline;

    @Column(name = "weather", columnDefinition = "TEXT")
    private String weather;

    @Column(name = "season", columnDefinition = "TEXT")
    private String season;

    @Column(name = "transport_info", columnDefinition = "TEXT")
    private String transportInfo;

    @Column(name = "distance_from_major", columnDefinition = "TEXT")
    private String distanceFromMajor;

    @Column(name = "recommended_departure_time", columnDefinition = "TEXT")
    private String recommendedDepartureTime;

    @Column(name = "recommended_departure_reason", columnDefinition = "TEXT")
    private String recommendedDepartureReason;

    @Column(name = "checklist", columnDefinition = "TEXT")
    private String checklist;

    @Column(name = "budget", columnDefinition = "TEXT")
    private String budget;

    @Column(name = "days", columnDefinition = "TEXT")
    private String days;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "updated_at")
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}

