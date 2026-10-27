package com.traveleasy.service;

import com.traveleasy.config.PayOsConfig;
import com.traveleasy.dto.payment.PaymentInitResponse;
import com.traveleasy.entity.Booking;
import com.traveleasy.entity.PaymentMethod;
import com.traveleasy.entity.Route;
import com.traveleasy.entity.Trip;
import com.traveleasy.service.customer.PayOsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PayOsServiceTest {

    @Mock
    private PayOsConfig payOsConfig;

    @InjectMocks
    private PayOsService payOsService;

    private Booking sampleBooking;

    @BeforeEach
    void setUp() {
        Route route = new Route();
        route.setDepartureLocation("TP. Hồ Chí Minh");
        route.setArrivalLocation("Đà Lạt");

        Trip trip = new Trip();
        trip.setRoute(route);

        sampleBooking = Booking.builder()
                .id(1L)
                .bookingCode("BK-20261027-1234")
                .passengerName("Phạm Công Thành")
                .passengerEmail("phamcongt56@gmail.com")
                .passengerPhone("0944354398")
                .totalAmount(new BigDecimal("320000"))
                .trip(trip)
                .build();
    }

    @Test
    @DisplayName("Khởi tạo thanh toán PayOS trả về đầy đủ thông tin MB Bank và mã VietQR")
    void testCreatePayOsPayment_Success() {
        when(payOsConfig.getBankBin()).thenReturn("970422");
        when(payOsConfig.getAccountNumber()).thenReturn("0944354398");
        when(payOsConfig.getAccountHolder()).thenReturn("PHAM CONG THANH");
        when(payOsConfig.getBankName()).thenReturn("MB Bank (Ngân hàng Quân Đội)");
        when(payOsConfig.getBankCode()).thenReturn("MB");
        when(payOsConfig.getCancelUrl()).thenReturn("http://localhost:5173/checkout");
        when(payOsConfig.getReturnUrl()).thenReturn("http://localhost:5173/lookup");
        when(payOsConfig.getClientId()).thenReturn("a187b55f-6c8a-499b-886b-722fcc0c3039");
        when(payOsConfig.getApiKey()).thenReturn("b8a86931-3e77-4787-8acd-322dceb91f70");
        when(payOsConfig.getChecksumKey()).thenReturn("173bbbcb0a50af57bf7fa7b550a2cb643cc37baa601137");

        PaymentInitResponse response = payOsService.createPayOsPayment(sampleBooking, "TXN-12345");

        assertNotNull(response);
        assertEquals(sampleBooking.getBookingCode(), response.getBookingCode());
        assertEquals(PaymentMethod.PAYOS, response.getPaymentMethod());
        assertEquals(new BigDecimal("320000"), response.getAmount());
        assertNotNull(response.getBankDetails());
        assertEquals("0944354398", response.getBankDetails().getAccountNumber());
        assertEquals("PHAM CONG THANH", response.getBankDetails().getAccountHolder());
        assertTrue(response.getQrCodeUrl().contains("0944354398"));
    }

    @Test
    @DisplayName("Kiểm tra thuật toán sinh chữ ký PayOS HMAC-SHA256")
    void testPayOsSignatureGeneration() {
        String data = "amount=320000&cancelUrl=http://localhost:5173&description=Ve xe BK-1234&orderCode=123456&returnUrl=http://localhost:5173";
        String key = "173bbbcb0a50af57bf7fa7b550a2cb643cc37baa601137";
        String signature = PayOsConfig.hmacSHA256(key, data);

        assertNotNull(signature);
        assertFalse(signature.isBlank());
        assertEquals(64, signature.length()); // SHA-256 hex string is 64 chars
    }
}
