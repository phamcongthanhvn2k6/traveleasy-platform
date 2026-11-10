package com.traveleasy.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "settlement_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SettlementRecord {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private BusCompany company;

    @Column(name = "period_name", nullable = false, length = 100)
    private String periodName;

    @Column(name = "start_date", nullable = false, length = 20)
    private String startDate;

    @Column(name = "end_date", nullable = false, length = 20)
    private String endDate;

    @Column(name = "ticket_count", nullable = false)
    @Builder.Default
    private Integer ticketCount = 0;

    @Column(name = "gross_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal grossAmount = BigDecimal.ZERO;

    @Column(name = "customer_paid", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal customerPaid = BigDecimal.ZERO;

    @Column(name = "platform_subsidy", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal platformSubsidy = BigDecimal.ZERO;

    @Column(name = "commission_rate", nullable = false)
    @Builder.Default
    private Integer commissionRate = 10;

    @Column(name = "platform_commission", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal platformCommission = BigDecimal.ZERO;

    @Column(name = "net_payable", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal netPayable = BigDecimal.ZERO;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING"; // PENDING, RECONCILED, PAID

    @Column(name = "reconciled_at", length = 50)
    private String reconciledAt;

    @Column(name = "paid_at", length = 50)
    private String paidAt;

    @Column(name = "payout_tx_hash", length = 100)
    private String payoutTxHash;

    @Column(name = "payout_note", columnDefinition = "TEXT")
    private String payoutNote;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
