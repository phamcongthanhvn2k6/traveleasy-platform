package com.traveleasy.controller.customer;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.payment.PaymentInitRequest;
import com.traveleasy.dto.payment.PaymentInitResponse;
import com.traveleasy.dto.payment.PaymentStatusResponse;
import com.traveleasy.entity.PaymentMethod;
import com.traveleasy.entity.PaymentStatus;
import com.traveleasy.service.customer.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment Management", description = "Cổng thanh toán trực tuyến (VNPAY Sandbox, VietQR Napas247, MoMo, COD)")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    @Operation(summary = "Khởi tạo giao dịch thanh toán (Sinh link VNPAY Sandbox hoặc mã VietQR động)")
    public ApiResponse<PaymentInitResponse> initiatePayment(
            @Valid @RequestBody PaymentInitRequest request,
            HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = httpRequest.getRemoteAddr();
        }
        return ApiResponse.success("Khởi tạo thanh toán thành công", paymentService.initiatePayment(request, ipAddress));
    }

    @GetMapping("/status/{bookingCode}")
    @Operation(summary = "Kiểm tra trạng thái thanh toán của đơn đặt vé thời gian thực")
    public ApiResponse<PaymentStatusResponse> getPaymentStatus(@PathVariable String bookingCode) {
        return ApiResponse.success(paymentService.getPaymentStatus(bookingCode));
    }

    @PostMapping("/confirm-transfer/{bookingCode}")
    @Operation(summary = "Xác nhận chuyển khoản VietQR QuickPay thành công")
    public ApiResponse<PaymentStatusResponse> confirmVietQr(
            @PathVariable String bookingCode,
            @RequestParam(required = false) String manualRef) {
        return ApiResponse.success("Xác nhận chuyển khoản thành công", paymentService.confirmVietQrTransfer(bookingCode, manualRef));
    }

    @PostMapping("/mock-success/{bookingCode}")
    @Operation(summary = "Giả lập thanh toán VNPAY/Cổng thành công phục vụ Demo (Ghi nhận CSDL thật)")
    public ApiResponse<PaymentStatusResponse> mockPaymentSuccess(
            @PathVariable String bookingCode,
            @RequestParam(defaultValue = "VNPAY") PaymentMethod paymentMethod) {
        return ApiResponse.success("Giả lập thanh toán thành công", paymentService.mockPaymentSuccess(bookingCode, paymentMethod));
    }

    @GetMapping("/vnpay-return")
    @Operation(summary = "Callback từ cổng VNPAY khi người dùng hoàn tất thanh toán trên trình duyệt")
    public void vnpayReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, String> params = new HashMap<>();
        Map<String, String[]> requestParams = request.getParameterMap();
        for (String key : requestParams.keySet()) {
            params.put(key, requestParams.get(key)[0]);
        }

        PaymentStatusResponse result = paymentService.processVnPayCallback(params);
        String bookingCode = result.getBookingCode();

        if (result.getPaymentStatus() == PaymentStatus.SUCCESS) {
            response.sendRedirect("http://localhost:5173/tickets/" + bookingCode + "?payment=success");
        } else {
            response.sendRedirect("http://localhost:5173/checkout?vnpay_status=failed&bookingCode=" + bookingCode);
        }
    }

    @GetMapping("/vnpay-ipn")
    @Operation(summary = "Webhook IPN nhận tín hiệu thanh toán ngầm từ Server VNPAY (Server-to-Server)")
    public ResponseEntity<Map<String, String>> vnpayIpn(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        Map<String, String[]> requestParams = request.getParameterMap();
        for (String key : requestParams.keySet()) {
            params.put(key, requestParams.get(key)[0]);
        }

        try {
            PaymentStatusResponse result = paymentService.processVnPayCallback(params);
            Map<String, String> response = new HashMap<>();
            if (result.getPaymentStatus() == PaymentStatus.SUCCESS) {
                response.put("RspCode", "00");
                response.put("Message", "Confirm Success");
            } else {
                response.put("RspCode", "01");
                response.put("Message", "Order Not Found or Failed");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing VNPAY IPN", e);
            Map<String, String> response = new HashMap<>();
            response.put("RspCode", "99");
            response.put("Message", "Unknown error");
            return ResponseEntity.ok(response);
        }
    }
}

