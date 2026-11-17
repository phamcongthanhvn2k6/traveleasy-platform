package com.traveleasy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient_email", length = 100)
    private String recipientEmail; // null = gửi cho tất cả người dùng thuộc role

    @Column(name = "target_role", length = 20)
    @Builder.Default
    private String targetRole = "ALL"; // ALL, ADMIN, OPERATOR, CUSTOMER

    @Column(nullable = false, length = 50)
    private String type; // BOOKING, SECURITY, FINANCE, REVIEW, SYSTEM, CHECKIN, TRIP

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(length = 255)
    private String link;

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "priority", length = 20)
    @Builder.Default
    private String priority = "NORMAL"; // HIGH, NORMAL

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
