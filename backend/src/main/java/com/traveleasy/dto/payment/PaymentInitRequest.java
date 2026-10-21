package com.traveleasy.dto.payment;

import com.traveleasy.entity.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitRequest {

    @NotBlank(message = "Mã đơn đặt vé không được để trống")
    private String bookingCode;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;

    private String bankCode; // VD: NCB, VCB, MB (Dành cho VNPAY nếu khách chọn đích danh ngân hàng)
}
