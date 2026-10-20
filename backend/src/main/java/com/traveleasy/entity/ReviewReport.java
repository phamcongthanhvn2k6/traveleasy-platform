package com.traveleasy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "review_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reporter_email", length = 100)
    private String reporterEmail;

    @Column(name = "review_author", length = 100)
    private String reviewAuthor;

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "review_snippet", length = 500)
    private String reviewSnippet;

    @Column(name = "rating")
    @Builder.Default
    private Integer rating = 1;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

