package com.traveleasy.dto.payment;

import com.traveleasy.entity.PaymentMethod;
import com.traveleasy.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitResponse {

    private String bookingCode;
    private String txnRef;
    private PaymentMethod paymentMethod;
    private BigDecimal amount;
    private PaymentStatus status;

    // URL chuyển hướng cho VNPAY hoặc MoMo
    private String paymentUrl;

    // Mã QR động VietQR QuickPay
    private String qrCodeUrl;

    // Chi tiết tài khoản nhận tiền
    private BankTransferDetails bankDetails;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BankTransferDetails {
        private String bankName;
        private String bankCode;
        private String accountNumber;
        private String accountHolder;
        private String transferContent;
        private BigDecimal amount;
    }
}

