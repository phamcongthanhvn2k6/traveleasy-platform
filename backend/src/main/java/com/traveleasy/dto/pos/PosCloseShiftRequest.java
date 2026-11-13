package com.traveleasy.dto.pos;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosCloseShiftRequest {

    private BigDecimal countedCashAmount;
    private String notes;
}

