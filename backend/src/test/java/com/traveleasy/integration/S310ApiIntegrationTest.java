package com.traveleasy.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.traveleasy.config.VnPayConfig;
import com.traveleasy.dto.booking.CreateBookingRequest;
import com.traveleasy.dto.payment.PaymentInitRequest;
import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * S310ApiIntegrationTest
 * ============================================================================
 * KIỂM THỬ TÍCH HỢP ĐẶT VÉ VÀ THANH TOÁN — CỔNG THANH TOÁN, WEBHOOK (/api/bookings & /api/payments)
 * Thẻ Trello: [BE][S310]
 * Phụ trách: Phạm Thanh Phong (QA / Testing - Sprint 3)
 * ============================================================================
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class S310ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VnPayConfig vnPayConfig;

    @Autowired
    private BusCompanyRepository busCompanyRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private PickupDropoffPointRepository pointRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripSeatRepository tripSeatRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    private Trip activeTrip;
    private PickupDropoffPoint pickupPoint;
    private PickupDropoffPoint dropoffPoint;

    @BeforeEach
    void setUp() {
        cleanDatabase();
        initFixtures();
    }

    @AfterEach
    void tearDown() {
        cleanDatabase();
    }

    private void cleanDatabase() {
        paymentTransactionRepository.deleteAllInBatch();
        ticketRepository.deleteAllInBatch();
        reviewRepository.deleteAllInBatch();
        bookingRepository.deleteAllInBatch();
        tripSeatRepository.deleteAllInBatch();
        tripRepository.deleteAllInBatch();
        pointRepository.deleteAllInBatch();
        routeRepository.deleteAllInBatch();
        vehicleRepository.deleteAllInBatch();
        busCompanyRepository.deleteAllInBatch();
    }

    private void initFixtures() {
        BusCompany company = busCompanyRepository.save(BusCompany.builder()
                .name("TravelEasy Express S310")
                .code("TE-S310")
                .hotline("19008888")
                .email("support@traveleasy.vn")
                .address("268 Lý Thường Kiệt, Quận 10, TP. HCM")
                .averageRating(BigDecimal.valueOf(4.8))
                .status("ACTIVE")
                .build());

        Route route = routeRepository.save(Route.builder()
                .busCompany(company)
                .departureLocation("TP. Hồ Chí Minh")
                .arrivalLocation("Đà Lạt")
                .durationHours(BigDecimal.valueOf(6.0))
                .distanceKm(BigDecimal.valueOf(305.0))
                .build());

        pickupPoint = pointRepository.save(PickupDropoffPoint.builder()
                .route(route)
                .name("Bến xe Miền Tây")
                .address("395 Kinh Dương Vương, Bình Tân")
                .pointType(PointType.PICKUP)
                .displayOrder(1)
                .build());

        dropoffPoint = pointRepository.save(PickupDropoffPoint.builder()
                .route(route)
                .name("Bến xe Liên tỉnh Đà Lạt")
                .address("01 Tô Hiến Thành, Phường 3, Đà Lạt")
                .pointType(PointType.DROPOFF)
                .displayOrder(2)
                .build());

        LocalDateTime depTime = LocalDate.now().plusDays(2).atTime(21, 30);
        activeTrip = tripRepository.save(Trip.builder()
                .busCompany(company)
                .route(route)
                .departureTime(depTime)
                .arrivalTime(depTime.plusHours(6))
                .busType(BusType.SLEEPER)
                .licensePlate("51B-310.00")
                .totalSeats(10)
                .availableSeats(10)
                .price(BigDecimal.valueOf(300000))
                .status(TripStatus.SCHEDULED)
                .isActive(true)
                .build());

        for (String code : List.of("A01", "A02", "A03", "A04", "A05")) {
            tripSeatRepository.save(TripSeat.builder()
                    .trip(activeTrip)
                    .seatCode(code)
                    .floor(1)
                    .seatType("SLEEPER")
                    .status(SeatStatus.AVAILABLE)
                    .build());
        }
    }

    /**
     * DoD 1: Đặt vé xe khách qua POST /api/v1/bookings, kiểm tra tính tiền, trừ ghế trống và trạng thái khởi tạo
     */
    @Test
    @Order(1)
    @DisplayName("DoD 1: Đặt vé thành công qua POST /api/v1/bookings với VNPAY và COD, trừ ghế nguyên tử")
    void testCreateBooking_OnlineAndCod_Success() throws Exception {
        CreateBookingRequest vnpayReq = new CreateBookingRequest();
        vnpayReq.setTripId(activeTrip.getId());
        vnpayReq.setSeatNumbers(List.of("A01", "A02"));
        vnpayReq.setCustomerName("Phạm Thanh Phong");
        vnpayReq.setCustomerPhone("0901234567");
        vnpayReq.setCustomerEmail("phong.s310@traveleasy.vn");
        vnpayReq.setPickupPointId(pickupPoint.getId());
        vnpayReq.setDropoffPointId(dropoffPoint.getId());
        vnpayReq.setPaymentMethod(PaymentMethod.VNPAY);
        vnpayReq.setHasInsurance(true);
        vnpayReq.setDiscountAmount(BigDecimal.valueOf(20000));
        // 2 ghế * 300,000 + bảo hiểm 2 * 25,000 - giảm giá 20,000 = 630,000

        mockMvc.perform(post("/api/v1/bookings")
                        .with(SecurityMockMvcRequestPostProcessors.user("phong.s310@traveleasy.vn").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vnpayReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.bookingCode").value(startsWith("BK-")))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.paymentMethod").value("VNPAY"))
                .andExpect(jsonPath("$.data.totalAmount").value(630000.0))
                .andExpect(jsonPath("$.data.tickets", hasSize(2)))
                .andExpect(jsonPath("$.data.tickets[0].seatNumber").value("A01"));

        Trip updatedTrip = tripRepository.findById(activeTrip.getId()).orElseThrow();
        assertEquals(8, updatedTrip.getAvailableSeats(), "Số ghế trống phải giảm từ 10 xuống 8 sau khi đặt 2 ghế");

        // Đặt vé COD cho ghế A03 -> Trạng thái đơn chuyển thẳng sang CONFIRMED
        CreateBookingRequest codReq = new CreateBookingRequest();
        codReq.setTripId(activeTrip.getId());
        codReq.setSeatNumbers(List.of("A03"));
        codReq.setCustomerName("Nguyễn Văn Bình");
        codReq.setCustomerPhone("0988777666");
        codReq.setCustomerEmail("binh.cod@traveleasy.vn");
        codReq.setPaymentMethod(PaymentMethod.COD);
        codReq.setHasInsurance(false);

        mockMvc.perform(post("/api/v1/bookings")
                        .with(SecurityMockMvcRequestPostProcessors.user("binh.cod@traveleasy.vn").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(codReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.data.paymentMethod").value("COD"))
                .andExpect(jsonPath("$.data.totalAmount").value(300000.0));
    }

    /**
     * DoD 2: Kết nối cổng thanh toán (POST /api/v1/payments/initiate) và kiểm tra trạng thái giao dịch
     */
    @Test
    @Order(2)
    @DisplayName("DoD 2: Khởi tạo phiên thanh toán VNPAY & VIETQR, sinh mã tham chiếu txnRef và kiểm tra trạng thái")
    void testInitiatePayment_VnPayAndVietQr_Success() throws Exception {
        Booking booking = createPendingBookingFixture("BK-S310-INIT02", "A01", BigDecimal.valueOf(300000), PaymentMethod.VNPAY);

        // 1. Khởi tạo giao dịch VNPAY
        PaymentInitRequest vnpayInit = new PaymentInitRequest();
        vnpayInit.setBookingCode(booking.getBookingCode());
        vnpayInit.setPaymentMethod(PaymentMethod.VNPAY);
        vnpayInit.setBankCode("NCB");

        mockMvc.perform(post("/api/v1/payments/initiate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vnpayInit)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.bookingCode").value("BK-S310-INIT02"))
                .andExpect(jsonPath("$.data.txnRef").value(startsWith("TXN-S310-INIT02-")))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.paymentUrl").value(containsString("vnp_SecureHash=")));

        // 2. Khởi tạo giao dịch VIETQR
        PaymentInitRequest vietQrInit = new PaymentInitRequest();
        vietQrInit.setBookingCode(booking.getBookingCode());
        vietQrInit.setPaymentMethod(PaymentMethod.VIETQR);

        mockMvc.perform(post("/api/v1/payments/initiate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vietQrInit)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.qrCodeUrl").value(containsString("img.vietqr.io")))
                .andExpect(jsonPath("$.data.bankDetails.accountNumber").isNotEmpty())
                .andExpect(jsonPath("$.data.bankDetails.transferContent").value(containsString("BK-S310-INIT02")));

        // 3. Tra cứu trạng thái giao dịch khi chưa thanh toán
        mockMvc.perform(get("/api/v1/payments/status/{bookingCode}", booking.getBookingCode()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.bookingCode").value("BK-S310-INIT02"))
                .andExpect(jsonPath("$.data.paymentStatus").value("PENDING"))
                .andExpect(jsonPath("$.data.bookingStatus").value("PENDING"))
                .andExpect(jsonPath("$.data.paid").value(false));
    }

    /**
     * DoD 3: Xử lý Webhook IPN VNPAY (GET /api/v1/payments/vnpay-ipn) — Xác thực chữ ký HMAC-SHA512 và kích hoạt vé
     */
    @Test
    @Order(3)
    @DisplayName("DoD 3: Xử lý Webhook VNPAY IPN chặn chữ ký giả mạo và kích hoạt đơn/vé khi chữ ký hợp lệ")
    void testVnPayIpnWebhook_SignatureValidationAndActivation() throws Exception {
        Booking booking = createPendingBookingFixture("BK-S310-VNPIPN", "A02", BigDecimal.valueOf(300000), PaymentMethod.VNPAY);

        PaymentInitRequest initReq = new PaymentInitRequest();
        initReq.setBookingCode(booking.getBookingCode());
        initReq.setPaymentMethod(PaymentMethod.VNPAY);

        MvcResult initResult = mockMvc.perform(post("/api/v1/payments/initiate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initReq)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(initResult.getResponse().getContentAsString());
        String txnRef = root.path("data").path("txnRef").asText();

        // Kịch bản 3A: Gửi IPN với chữ ký giả mạo -> RspCode = 01, đơn vẫn ở trạng thái PENDING
        mockMvc.perform(get("/api/v1/payments/vnpay-ipn")
                        .param("vnp_TxnRef", txnRef)
                        .param("vnp_ResponseCode", "00")
                        .param("vnp_TransactionNo", "14009999")
                        .param("vnp_BankCode", "NCB")
                        .param("vnp_SecureHash", "FORGED_INVALID_SIGNATURE_HASH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("01"));

        Booking afterForged = bookingRepository.findByBookingCode(booking.getBookingCode()).orElseThrow();
        assertEquals(BookingStatus.PENDING, afterForged.getStatus(), "Chữ ký giả mạo không được phép kích hoạt đơn đặt vé");

        // Kịch bản 3B: Gửi IPN với chữ ký HMAC-SHA512 hợp lệ và vnp_ResponseCode = 00 -> RspCode = 00, đơn CONFIRMED, vé ISSUED
        Map<String, String> validParams = new HashMap<>();
        validParams.put("vnp_TxnRef", txnRef);
        validParams.put("vnp_ResponseCode", "00");
        validParams.put("vnp_TransactionNo", "14008888");
        validParams.put("vnp_BankCode", "NCB");
        String validHash = VnPayConfig.hashAllFields(validParams, vnPayConfig.getVnpHashSecret());

        mockMvc.perform(get("/api/v1/payments/vnpay-ipn")
                        .param("vnp_TxnRef", txnRef)
                        .param("vnp_ResponseCode", "00")
                        .param("vnp_TransactionNo", "14008888")
                        .param("vnp_BankCode", "NCB")
                        .param("vnp_SecureHash", validHash))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("00"))
                .andExpect(jsonPath("$.Message").value("Confirm Success"));

        Booking confirmedBooking = bookingRepository.findByBookingCode(booking.getBookingCode()).orElseThrow();
        assertEquals(BookingStatus.CONFIRMED, confirmedBooking.getStatus(), "Đơn đặt vé phải chuyển sang CONFIRMED sau IPN hợp lệ");

        List<Ticket> tickets = ticketRepository.findByBookingId(confirmedBooking.getId());
        assertFalse(tickets.isEmpty());
        assertEquals(TicketStatus.ISSUED, tickets.get(0).getStatus(), "Vé điện tử phải ở trạng thái ISSUED sau khi thanh toán thành công");
    }

    /**
     * DoD 4: Xử lý Webhook PayOS (POST /api/v1/payments/payos/webhook) & Chống xử lý lặp (Idempotency)
     */
    @Test
    @Order(4)
    @DisplayName("DoD 4: Xử lý Webhook PayOS và đảm bảo tính lũy đẳng (Idempotency) khi nhận Webhook lặp lại")
    void testPayOsWebhook_AndIdempotentRepeatDelivery() throws Exception {
        Booking booking = createPendingBookingFixture("BK-S310-PAYOS04", "A04", BigDecimal.valueOf(300000), PaymentMethod.PAYOS);

        Map<String, Object> webhookPayload = Map.of(
                "code", "00",
                "desc", "success",
                "data", Map.of(
                        "description", "Chuyen khoan ve xe " + booking.getBookingCode() + " nhanh",
                        "reference", "FT26310999888",
                        "amount", 300000
                )
        );

        // Lần 1: Webhook PayOS xử lý kích hoạt đơn và vé
        mockMvc.perform(post("/api/v1/payments/payos/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(webhookPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.bookingCode").value("BK-S310-PAYOS04"))
                .andExpect(jsonPath("$.data.paymentStatus").value("SUCCESS"))
                .andExpect(jsonPath("$.data.bookingStatus").value("CONFIRMED"))
                .andExpect(jsonPath("$.data.paid").value(true));

        // Lần 2: Cổng PayOS gửi lặp lại cùng bản tin Webhook (Retry) -> Hệ thống xử lý lũy đẳng, không tạo bản ghi trùng
        mockMvc.perform(post("/api/v1/payments/payos/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(webhookPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.paymentStatus").value("SUCCESS"))
                .andExpect(jsonPath("$.data.bookingStatus").value("CONFIRMED"))
                .andExpect(jsonPath("$.data.message").value(containsString("trước đó")));

        List<PaymentTransaction> txns = paymentTransactionRepository.findAll();
        assertEquals(1, txns.size(), "Webhook lặp lại không được sinh thêm giao dịch trùng lặp trong CSDL");
        assertEquals("FT26310999888", txns.get(0).getTransactionNo(), "Mã tham chiếu giao dịch gốc phải được bảo toàn");
    }

    /**
     * DoD 5: Kiểm tra phân quyền truy cập, xác thực dữ liệu đầu vào và chặn đặt trùng ghế / thanh toán đơn đã hủy
     */
    @Test
    @Order(5)
    @DisplayName("DoD 5: Chặn đặt vé khi chưa đăng nhập (401), dữ liệu sai (400), ghế đã bán (409) và đơn đã hủy (400)")
    void testSecurityValidationAndConflictConstraints() throws Exception {
        CreateBookingRequest validReq = new CreateBookingRequest();
        validReq.setTripId(activeTrip.getId());
        validReq.setSeatNumbers(List.of("A05"));
        validReq.setCustomerName("Trần Thị Mai");
        validReq.setCustomerPhone("0912345678");
        validReq.setCustomerEmail("mai.s310@traveleasy.vn");
        validReq.setPaymentMethod(PaymentMethod.VNPAY);

        // 1. Chưa đăng nhập gọi POST /api/v1/bookings -> 401 Unauthorized
        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));

        // 2. Dữ liệu đầu vào không hợp lệ (SĐT sai định dạng, danh sách ghế rỗng) -> 400 Bad Request
        CreateBookingRequest invalidReq = new CreateBookingRequest();
        invalidReq.setTripId(activeTrip.getId());
        invalidReq.setSeatNumbers(List.of());
        invalidReq.setCustomerName("");
        invalidReq.setCustomerPhone("12345");
        invalidReq.setPaymentMethod(PaymentMethod.VNPAY);

        mockMvc.perform(post("/api/v1/bookings")
                        .with(SecurityMockMvcRequestPostProcessors.user("mai.s310@traveleasy.vn").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        // 3. Đặt ghế A05 lần 1 thành công, lần 2 đặt lại đúng ghế A05 -> 409 Conflict (SEAT_ALREADY_BOOKED)
        mockMvc.perform(post("/api/v1/bookings")
                        .with(SecurityMockMvcRequestPostProcessors.user("mai.s310@traveleasy.vn").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validReq)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/bookings")
                        .with(SecurityMockMvcRequestPostProcessors.user("other@traveleasy.vn").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("A05")));

        // 4. Khởi tạo thanh toán cho đơn đặt vé đã bị hủy -> 400 Bad Request
        Booking cancelledBooking = createPendingBookingFixture("BK-S310-CANCEL05", "A01", BigDecimal.valueOf(300000), PaymentMethod.VNPAY);
        cancelledBooking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(cancelledBooking);

        PaymentInitRequest initCancelledReq = new PaymentInitRequest();
        initCancelledReq.setBookingCode("BK-S310-CANCEL05");
        initCancelledReq.setPaymentMethod(PaymentMethod.VNPAY);

        mockMvc.perform(post("/api/v1/payments/initiate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initCancelledReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("đã bị hủy")));
    }

    private Booking createPendingBookingFixture(String bookingCode, String seatCode, BigDecimal amount, PaymentMethod method) {
        Booking booking = bookingRepository.save(Booking.builder()
                .trip(activeTrip)
                .bookingCode(bookingCode)
                .passengerName("Khách Hàng Kiểm Thử S310")
                .passengerPhone("0909111222")
                .passengerEmail("tester.s310@traveleasy.vn")
                .pickupPoint(pickupPoint.getName())
                .dropoffPoint(dropoffPoint.getName())
                .seatNumbers(seatCode)
                .totalAmount(amount)
                .paymentMethod(method)
                .status(BookingStatus.PENDING)
                .build());

        ticketRepository.save(Ticket.builder()
                .booking(booking)
                .ticketCode("TK-" + bookingCode.replace("BK-", ""))
                .seatNumber(seatCode)
                .price(amount)
                .qrCodeHash("HASH-" + bookingCode)
                .status(TicketStatus.ISSUED)
                .build());

        return booking;
    }
}
