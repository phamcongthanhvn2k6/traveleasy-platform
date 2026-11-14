package com.traveleasy.dto.company.exchange;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketExchangeRequest {

    @NotBlank(message = "Ma ve cu khong duoc de trong")
    private String oldTicketCode;

    @NotNull(message = "ID chuyen xe moi khong duoc de trong")
    private Long newTripId;

    @NotBlank(message = "Ma so ghe moi khong duoc de trong")
    private String newSeatNumber;

    private String note;
}
