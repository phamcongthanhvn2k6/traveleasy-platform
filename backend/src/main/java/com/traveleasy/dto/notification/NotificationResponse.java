package com.traveleasy.dto.notification;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Long id;
    private String type;
    private String role;
    private String title;
    private String message;
    private String timestamp;
    private String link;
    private boolean isRead;
    private String priority;
}
