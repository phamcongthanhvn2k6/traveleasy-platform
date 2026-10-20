package com.traveleasy.dto.booking;

import com.traveleasy.entity.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateBookingRequest {
    @NotNull(message = "Trip ID không được để trống")
    private Long tripId;

    @NotEmpty(message = "Vui lòng chọn ít nhất 1 ghế")
    private List<String> seatNumbers;

    @NotBlank(message = "Họ tên hành khách không được để trống")
    private String customerName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String customerPhone;

    private String customerEmail;

    private Long pickupPointId;
    private Long dropoffPointId;
    private String note;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;
}
