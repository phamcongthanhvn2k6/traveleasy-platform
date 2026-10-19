package com.traveleasy.dto.booking;

import com.traveleasy.entity.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String ticketCode;
    private String seatNumber;
    private BigDecimal price;
    private String qrCodeHash;
    private TicketStatus status;
    private LocalDateTime createdAt;
}
