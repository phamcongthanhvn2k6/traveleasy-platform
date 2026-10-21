package com.traveleasy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "txn_ref", nullable = false, unique = true, length = 64)
    private String txnRef;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "booking_code", nullable = false, length = 50)
    private String bookingCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "bank_code", length = 30)
    private String bankCode;

    @Column(name = "transaction_no", length = 100)
    private String transactionNo;

    @Column(name = "response_code", length = 20)
    private String responseCode;

    @Column(name = "order_info", length = 255)
    private String orderInfo;

    @Column(name = "pay_date")
    private LocalDateTime payDate;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}

