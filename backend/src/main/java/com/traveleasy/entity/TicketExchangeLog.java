package com.traveleasy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * [S316] Luu tru nhat ky doi ve / chuyen chuyen xe khach
 * Bang CSDL: ticket_exchange_logs
 * @author Tran Minh Duc (minhdctrn13)
 */
@Entity
@Table(name = "ticket_exchange_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketExchangeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bus_company_id", nullable = false)
    private Long busCompanyId;

    @Column(name = "original_ticket_id", nullable = false)
    private Long originalTicketId;

    @Column(name = "new_ticket_id")
    private Long newTicketId;

    @Column(name = "old_trip_id", nullable = false)
    private Long oldTripId;

    @Column(name = "new_trip_id", nullable = false)
    private Long newTripId;

    @Column(name = "old_seat_code", nullable = false, length = 20)
    private String oldSeatCode;

    @Column(name = "new_seat_code", nullable = false, length = 20)
    private String newSeatCode;

    @Column(name = "price_difference", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal priceDifference = BigDecimal.ZERO;

    @Column(name = "surcharge_paid", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal surchargePaid = BigDecimal.ZERO;

    @Column(name = "refund_returned", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal refundReturned = BigDecimal.ZERO;

    @Column(name = "performed_by_user_id")
    private Long performedByUserId;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
