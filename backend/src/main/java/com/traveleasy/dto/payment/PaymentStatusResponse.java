package com.traveleasy.dto.payment;

import com.traveleasy.entity.BookingStatus;
import com.traveleasy.entity.PaymentMethod;
import com.traveleasy.entity.PaymentStatus;
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
public class PaymentStatusResponse {

    private String bookingCode;
    private String txnRef;
    private PaymentStatus paymentStatus;
    private BookingStatus bookingStatus;
    private PaymentMethod paymentMethod;
    private BigDecimal amount;
    private String transactionNo;
    private LocalDateTime payDate;
    private boolean isPaid;
    private String message;
}

