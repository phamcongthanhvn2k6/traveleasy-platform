package com.traveleasy.dto.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RescheduleRequest {
    @NotNull(message = "Mã vé cần đổi không được để trống")
    private Long ticketId;

    @NotNull(message = "Mã chuyến xe mới không được để trống")
    private Long newTripId;

    @NotBlank(message = "Số ghế mới không được để trống")
    private String newSeatNumber;
}
