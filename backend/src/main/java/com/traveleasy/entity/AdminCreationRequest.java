package com.traveleasy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_creation_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminCreationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "proposed_email", nullable = false, length = 100)
    private String proposedEmail;

    @Column(name = "proposed_full_name", nullable = false, length = 100)
    private String proposedFullName;

    @Column(name = "proposed_phone", length = 20)
    private String proposedPhone;

    @Column(name = "department_or_role_note", length = 255)
    private String departmentOrRoleNote;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "requested_by_email", nullable = false, length = 100)
    private String requestedByEmail;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "reviewed_by_email", length = 100)
    private String reviewedByEmail;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;

    @Column(name = "created_user_id")
    private Long createdUserId;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
