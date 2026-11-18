package com.traveleasy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets", indexes = {
    @Index(name = "idx_tickets_booking_id", columnList = "booking_id"),
    @Index(name = "idx_tickets_ticket_code", columnList = "ticket_code"),
    @Index(name = "idx_tickets_qr_code_hash", columnList = "qr_code_hash"),
    @Index(name = "idx_tickets_booking_seat", columnList = "booking_id, seat_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "ticket_code", nullable = false, unique = true, length = 50)
    private String ticketCode;

    @Column(name = "seat_number", nullable = false, length = 10)
    private String seatNumber;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "qr_code_hash")
    private String qrCodeHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TicketStatus status = TicketStatus.ISSUED;

    private Integer cancellationFeePercent;

    @Column(precision = 12, scale = 2)
    private BigDecimal cancellationFee;

    @Column(precision = 12, scale = 2)
    private BigDecimal refundAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal refundPartnerCredit;

    private LocalDateTime refundRecordedAt;

    @Column(length = 100)
    private String refundTransferCode;

    @Column(length = 150)
    private String refundRecordedBy;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
