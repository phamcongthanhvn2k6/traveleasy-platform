package com.traveleasy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pos_shifts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyPosShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bus_company_id", nullable = false)
    private Long busCompanyId;

    @Column(name = "staff_user_id", nullable = false)
    private Long staffUserId;

    @Column(name = "terminal_location_id", nullable = false)
    @Builder.Default
    private Long terminalLocationId = 1L;

    @Column(name = "counter_name", nullable = false, length = 50)
    @Builder.Default
    private String counterName = "Quầy POS 01 - Bến Xe Miền Đông";

    @Column(name = "opened_at", nullable = false)
    @Builder.Default
    private LocalDateTime openedAt = LocalDateTime.now();

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "initial_cash_amount", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal initialCashAmount = BigDecimal.ZERO;

    @Column(name = "total_cash_collected", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal totalCashCollected = BigDecimal.ZERO;

    @Column(name = "total_qr_collected", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal totalQrCollected = BigDecimal.ZERO;

    @Column(name = "total_tickets_sold", nullable = false)
    @Builder.Default
    private Integer totalTicketsSold = 0;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "OPEN";

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}

