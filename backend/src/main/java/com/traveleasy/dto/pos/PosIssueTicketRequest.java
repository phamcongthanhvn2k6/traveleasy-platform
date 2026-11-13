package com.traveleasy.dto.pos;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosIssueTicketRequest {

    @NotNull(message = "Mã chuyến xe không được để trống")
    private Long tripId;

    @NotEmpty(message = "Vui lòng chọn ít nhất một ghế trống")
    private List<String> seatNumbers;

    private String customerName;

    private String customerPhone;

    private String customerEmail;

    private String paymentMethod; // CASH, QR

    private String terminalName;

    private String counterName;

    private Long shiftId;

    private Long busCompanyId;

    private BigDecimal cashReceived;

    private String pickupPoint;

    private String dropoffPoint;

    private Boolean hasInsurance;
}

