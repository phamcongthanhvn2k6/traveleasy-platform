package com.traveleasy.dto.booking;

import com.traveleasy.entity.PaymentMethod;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.List;

@Data
public class CreateBookingRequest {
    @NotNull(message = "Mã chuyến xe không được để trống")
    private Long tripId;

    @NotEmpty(message = "Vui lòng chọn ít nhất 1 ghế")
    private List<String> seatNumbers;

    @NotBlank(message = "Họ tên hành khách không được để trống")
    private String customerName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Số điện thoại không đúng định dạng (VD: 0988123456)")
    private String customerPhone;

    @Email(message = "Email không đúng định dạng")
    private String customerEmail;

    private Long pickupPointId;
    private Long dropoffPointId;
    private String note;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;
}
