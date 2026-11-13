package com.traveleasy.dto.pos;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosReceiptResponse {

    private Long bookingId;
    private String bookingCode;
    private String qrCodeHash;
    private Long tripId;
    private Long busCompanyId;
    private String busCompanyName;
    private String busCompanyPhone;
    private String routeName;
    private String originCity;
    private String destinationCity;
    private String vehiclePlate;
    private String busType;
    private LocalDateTime departureTime;
    private String pickupPoint;
    private String dropoffPoint;
    private String customerName;
    private String customerPhone;
    private List<String> seatNumbers;
    private List<PosTicketItem> tickets;
    private BigDecimal unitPrice;
    private BigDecimal insuranceAmount;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private BigDecimal cashReceived;
    private BigDecimal changeAmount;
    private Long shiftId;
    private String counterName;
    private String terminalName;
    private String cashierName;
    private LocalDateTime printedAt;
    private Integer receiptWidthMm;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PosTicketItem {
        private Long ticketId;
        private String ticketCode;
        private String seatNumber;
        private BigDecimal price;
        private String qrCodeHash;
        private String status;
        private Boolean isPrinted;
    }
}

