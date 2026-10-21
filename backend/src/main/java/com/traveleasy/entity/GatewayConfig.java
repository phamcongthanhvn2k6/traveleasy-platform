package com.traveleasy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gateway_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GatewayConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50, unique = true)
    private String provider; // VNPAY, MOMO, ZALOPAY, VIETQR, TELEGRAM, TWILIO, SENDGRID

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "category", length = 30)
    @Builder.Default
    private String category = "PAYMENT"; // PAYMENT, NOTIFICATION

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, TESTING

    @Column(name = "is_sandbox")
    @Builder.Default
    private Boolean isSandbox = false;

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}

