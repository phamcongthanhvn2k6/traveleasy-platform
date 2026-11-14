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
public class PosShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bus_company_id", nullable = false)
    private Long busCompanyId;

    @Column(name = "staff_user_id", nullable = false)
    private Long staffUserId;

    @Column(name = "terminal_location_id")
    private Long terminalLocationId;

    @Column(name = "cashier_name", length = 100)
    private String cashierName;

    @Column(name = "counter_name", nullable = false, length = 50)
    @Builder.Default
    private String counterName = "Quầy số 1";

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

    @Column(name = "total_cash_refunds", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal totalCashRefunds = BigDecimal.ZERO;

    @Column(name = "total_qr_collected", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal totalQrCollected = BigDecimal.ZERO;

    @Column(name = "total_tickets_sold", nullable = false)
    @Builder.Default
    private Integer totalTicketsSold = 0;

    @Column(name = "counted_cash_amount", precision = 14, scale = 2)
    private BigDecimal countedCashAmount;

    @Column(name = "cash_variance", precision = 14, scale = 2)
    private BigDecimal cashVariance;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "OPEN"; // OPEN, CLOSED, AUDITED

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}

