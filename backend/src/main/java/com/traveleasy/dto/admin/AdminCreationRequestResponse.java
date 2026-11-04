package com.traveleasy.dto.admin;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminCreationRequestResponse {
    private Long id;
    private String proposedEmail;
    private String proposedFullName;
    private String proposedPhone;
    private String departmentOrRoleNote;
    private String reason;
    private String requestedByEmail;
    private String status; // PENDING, APPROVED, REJECTED
    private String statusLabel;
    private String reviewedByEmail;
    private LocalDateTime reviewedAt;
    private String rejectReason;
    private Long createdUserId;
    private LocalDateTime createdAt;
}

