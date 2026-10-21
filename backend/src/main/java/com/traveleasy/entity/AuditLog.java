package com.traveleasy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", length = 100)
    private String userEmail;

    @Column(nullable = false, length = 50)
    private String action; // APPROVE_COMPANY, SUSPEND_COMPANY, LOCK_USER, UPDATE_BANNER, etc.

    @Column(length = 100)
    private String target;

    @Column(name = "before_state", columnDefinition = "TEXT")
    private String beforeState;

    @Column(name = "after_state", columnDefinition = "TEXT")
    private String afterState;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

