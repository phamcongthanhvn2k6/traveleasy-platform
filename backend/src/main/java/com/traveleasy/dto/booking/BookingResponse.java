package com.traveleasy.dto.booking;

import com.traveleasy.dto.trip.TripResponse;
import com.traveleasy.entity.BookingStatus;
import com.traveleasy.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private Long userId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private TripResponse trip;
    private String pickupPointName;
    private String dropoffPointName;
    private BigDecimal totalAmount;
    private PaymentMethod paymentMethod;
    private BookingStatus status;
    private String note;
    private LocalDateTime createdAt;
    private List<TicketResponse> tickets;
}
