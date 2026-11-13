package com.traveleasy.dto.pos;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosOpenShiftRequest {

    private Long busCompanyId;
    private Long terminalLocationId;
    private String terminalName;
    private String counterName;
    private String cashierName;
    private BigDecimal initialCashAmount;
    private String notes;
}

