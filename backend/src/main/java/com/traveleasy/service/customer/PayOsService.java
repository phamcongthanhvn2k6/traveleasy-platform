package com.traveleasy.service.customer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.traveleasy.config.PayOsConfig;
import com.traveleasy.dto.payment.PaymentInitResponse;
import com.traveleasy.entity.Booking;
import com.traveleasy.entity.PaymentMethod;
import com.traveleasy.entity.PaymentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayOsService {

    private final PayOsConfig payOsConfig;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String PAYOS_CREATE_PAYMENT_URL = "https://api-merchant.payos.vn/v2/payment-requests";

    /**
     * Tạo liên kết thanh toán / mã QR qua cổng PayOS liên kết MB Bank (0944354398 - PHAM CONG THANH)
     */
    public PaymentInitResponse createPayOsPayment(Booking booking, String txnRef) {
        long amount = booking.getTotalAmount().longValue();

        // PayOS quy định orderCode là số nguyên dương <= 9007199254740991
        long orderCode = Math.abs(booking.getBookingCode().hashCode()) % 900000000L + 100000000L;

        // Mô tả tối đa 25 ký tự theo quy định PayOS
        String description = ("Ve xe " + booking.getBookingCode().replace("BK-", "")).trim();
        if (description.length() > 25) {
            description = description.substring(0, 25);
        }

        String vietQrContent = "TRAVELEASY " + booking.getBookingCode();
        String fallbackQrUrl = String.format(
                "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d&addInfo=%s&accountName=%s",
                payOsConfig.getBankBin(),
                payOsConfig.getAccountNumber(),
                amount,
                URLEncoder.encode(vietQrContent, StandardCharsets.UTF_8),
                URLEncoder.encode(payOsConfig.getAccountHolder(), StandardCharsets.UTF_8)
        );

        PaymentInitResponse.BankTransferDetails bankDetails = PaymentInitResponse.BankTransferDetails.builder()
                .bankName(payOsConfig.getBankName())
                .bankCode(payOsConfig.getBankCode())
                .accountNumber(payOsConfig.getAccountNumber())
                .accountHolder(payOsConfig.getAccountHolder())
                .transferContent(vietQrContent)
                .amount(booking.getTotalAmount())
                .build();

        String paymentUrl = null;
        String qrCodeUrl = fallbackQrUrl;

        try {
            // Chuỗi ký theo thứ tự chữ cái: amount, cancelUrl, description, orderCode, returnUrl
            Map<String, Object> signMap = new TreeMap<>();
            signMap.put("amount", amount);
            signMap.put("cancelUrl", payOsConfig.getCancelUrl());
            signMap.put("description", description);
            signMap.put("orderCode", orderCode);
            signMap.put("returnUrl", payOsConfig.getReturnUrl());

            String signData = PayOsConfig.createSignatureString(signMap);
            String signature = PayOsConfig.hmacSHA256(payOsConfig.getChecksumKey(), signData);

            Map<String, Object> requestBody = new HashMap<>(signMap);
            requestBody.put("signature", signature);
            requestBody.put("buyerName", booking.getPassengerName() != null ? booking.getPassengerName() : "Khach hang");
            requestBody.put("buyerEmail", booking.getPassengerEmail() != null ? booking.getPassengerEmail() : "khachhang@traveleasy.vn");
            requestBody.put("buyerPhone", booking.getPassengerPhone() != null ? booking.getPassengerPhone() : "0944354398");

            List<Map<String, Object>> items = new ArrayList<>();
            items.add(Map.of(
                    "name", "Vé xe TravelEasy - " + booking.getBookingCode(),
                    "quantity", 1,
                    "price", amount
            ));
            requestBody.put("items", items);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", payOsConfig.getClientId());
            headers.set("x-api-key", payOsConfig.getApiKey());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("PayOS Request: Đang gửi yêu cầu tạo link thanh toán cho đơn {} (orderCode: {})", booking.getBookingCode(), orderCode);
            ResponseEntity<String> response = restTemplate.postForEntity(PAYOS_CREATE_PAYMENT_URL, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String code = root.path("code").asText("");
                if ("00".equals(code)) {
                    JsonNode dataNode = root.path("data");
                    paymentUrl = dataNode.path("checkoutUrl").asText(null);
                    String payOsQr = dataNode.path("qrCode").asText(null);
                    if (payOsQr != null && !payOsQr.isBlank()) {
                        qrCodeUrl = payOsQr;
                    }
                    log.info("PayOS Success: Đã tạo link thanh toán thành công cho đơn {}", booking.getBookingCode());
                } else {
                    log.warn("PayOS Response Code != 00: {} - {}", code, root.path("desc").asText(""));
                }
            }
        } catch (Exception e) {
            log.warn("PayOS API Call: Chuyển sang chế độ VietQR Napas MB Bank trực tiếp ({}: {})", e.getClass().getSimpleName(), e.getMessage());
        }

        return PaymentInitResponse.builder()
                .bookingCode(booking.getBookingCode())
                .txnRef(txnRef)
                .paymentMethod(PaymentMethod.PAYOS)
                .amount(booking.getTotalAmount())
                .status(PaymentStatus.PENDING)
                .paymentUrl(paymentUrl)
                .qrCodeUrl(qrCodeUrl)
                .bankDetails(bankDetails)
                .build();
    }
}
