package com.traveleasy.dto.notification;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendNotificationRequest {
    private String recipientEmail; // null = gửi cho toàn bộ người dùng theo targetRole
    private String targetRole;     // CUSTOMER, OPERATOR, ADMIN, ALL
    private String type;           // BOOKING, PROMOTION, SYSTEM, TRIP, FINANCE, SECURITY
    private String title;
    private String message;
    private String link;
    private String priority;       // NORMAL, HIGH
}
