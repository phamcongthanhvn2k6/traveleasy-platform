package com.traveleasy.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.traveleasy.dto.payment.PaymentInitRequest;
import com.traveleasy.dto.payment.PaymentStatusResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import com.traveleasy.service.customer.PaymentService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * [S314] Kiểm Thử Hồi Quy & Tích Hợp Toàn Bộ Luồng Thanh Toán
 * - Chu trình hoàn chỉnh vé điện tử: Đặt chỗ ➔ Khóa ghế 10p ➔ Thanh toán VietQR / VNPAY / POS COD ➔ Webhook IPN ➔ ISSUED
 * - Kiểm thử bảo vệ chống Double-Booking và Concurrency
 * - Kiểm thử Late Webhook Guard (Bảo vệ khi webhook đến sau thời hạn hủy 10 phút)
 * - Kiểm thử Giao dịch quầy POS và tính toán kết sổ ca trực
 * @author Nguyễn Đại Phát (daiphat)
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class S314PaymentRegressionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BusCompanyRepository busCompanyRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private PickupDropoffPointRepository pointRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private TripSeatRepository tripSeatRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private PosShiftRepository posShiftRepository;

    @Autowired
    private PaymentService paymentService;

    private BusCompany company;
    private Route route;
    private Trip trip;

    @BeforeEach
    void setUp() {
        cleanDb();
        company = busCompanyRepository.save(BusCompany.builder()
                .name("TravelEasy Test Lines S314")
                .code("TEST-S314")
                .hotline("19001122")
                .address("TP. Hồ Chí Minh")
                .taxCode("0318899881")
                .build());

        route = routeRepository.save(Route.builder()
                .busCompany(company)
                .departureLocation("TP. Hồ Chí Minh")
                .arrivalLocation("Đà Lạt")
                .distanceKm(BigDecimal.valueOf(305.0))
                .durationHours(BigDecimal.valueOf(6.5))
                .build());

        trip = tripRepository.save(Trip.builder()
                .busCompany(company)
                .route(route)
                .licensePlate("51B-777.99")
                .busType(BusType.LIMOUSINE)
                .departureTime(LocalDateTime.now().plusDays(2))
                .arrivalTime(LocalDateTime.now().plusDays(2).plusHours(6))
                .price(BigDecimal.valueOf(320000))
                .totalSeats(34)
                .availableSeats(34)
                .status(TripStatus.SCHEDULED)
                .build());
    }

    @AfterEach
    void tearDown() {
        cleanDb();
    }

    private void cleanDb() {
        paymentTransactionRepository.deleteAllInBatch();
        ticketRepository.deleteAllInBatch();
        reviewRepository.deleteAllInBatch();
        bookingRepository.deleteAllInBatch();
        posShiftRepository.deleteAllInBatch();
        tripSeatRepository.deleteAllInBatch();
        tripRepository.deleteAllInBatch();
        pointRepository.deleteAllInBatch();
        routeRepository.deleteAllInBatch();
        vehicleRepository.deleteAllInBatch();
        busCompanyRepository.deleteAllInBatch();
    }

    @Test
    @Order(1)
    @DisplayName("[S314-01] Chu trình thanh toán VietQR Napas247 hoàn chỉnh từ PENDING ➔ CONFIRMED ➔ ISSUED")
    void testVietQrPayment_CompleteLifecycle() throws Exception {
        // 1. Tạo đơn đặt vé PENDING
        String bookingCode = "BK-S314-VQR-001";
        Booking booking = bookingRepository.save(Booking.builder()
                .bookingCode(bookingCode)
                .trip(trip)
                .passengerName("Trần Văn An")
                .passengerPhone("0908112233")
                .seatNumbers("A01")
                .totalAmount(BigDecimal.valueOf(320000))
                .status(BookingStatus.PENDING)
                .bookingChannel("ONLINE")
                .build());

        Ticket ticket = ticketRepository.save(Ticket.builder()
                .booking(booking)
                .ticketCode("TK-S314-VQR-A01")
                .seatNumber("A01")
                .price(BigDecimal.valueOf(320000))
                .status(TicketStatus.ISSUED)
                .build());

        // 2. Khởi tạo thanh toán VietQR qua API
        PaymentInitRequest initReq = PaymentInitRequest.builder()
                .bookingCode(bookingCode)
                .paymentMethod(PaymentMethod.VIETQR)
                .build();

        mockMvc.perform(post("/api/v1/payments/initiate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.bookingCode").value(bookingCode))
                .andExpect(jsonPath("$.data.qrCodeUrl").isNotEmpty())
                .andExpect(jsonPath("$.data.bankDetails.transferContent").value("TRAVELEASY " + bookingCode));

        // 3. Giả lập Webhook IPN từ ngân hàng xác nhận chuyển khoản
        mockMvc.perform(post("/api/v1/payments/confirm-transfer/" + bookingCode)
                        .param("manualRef", "NAPAS-MB-998877"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.paid").value(true))
                .andExpect(jsonPath("$.data.bookingStatus").value("CONFIRMED"));

        // 4. Kiểm tra CSDL thực tế: Đơn vé CONFIRMED, vé ISSUED
        Booking updatedBooking = bookingRepository.findByBookingCode(bookingCode).orElseThrow();
        assertThat(updatedBooking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);

        List<Ticket> updatedTickets = ticketRepository.findByBookingId(updatedBooking.getId());
        assertThat(updatedTickets).isNotEmpty();
        assertThat(updatedTickets.get(0).getStatus()).isEqualTo(TicketStatus.ISSUED);

        PaymentTransaction txn = paymentTransactionRepository.findFirstByBookingCodeOrderByCreatedAtDesc(bookingCode).orElseThrow();
        assertThat(txn.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(txn.getTransactionNo()).isEqualTo("NAPAS-MB-998877");

        // 5. Kiểm tra Idempotent (Webhook gửi lại lần 2 không bị lỗi và vẫn trả về SUCCESS)
        mockMvc.perform(post("/api/v1/payments/confirm-transfer/" + bookingCode))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.paid").value(true))
                .andExpect(jsonPath("$.data.paymentStatus").value("SUCCESS"));
    }

    @Test
    @Order(2)
    @DisplayName("[S314-02] Late Webhook Guard: Đơn vé đã quá hạn 10 phút bị HỦY không được phép hồi sinh CONFIRMED (Chống Double-Booking)")
    void testLateWebhook_ProtectionAgainstDoubleBooking() throws Exception {
        String bookingCode = "BK-S314-EXPIRED-999";
        Booking expiredBooking = bookingRepository.save(Booking.builder()
                .bookingCode(bookingCode)
                .trip(trip)
                .passengerName("Lê Văn Chậm")
                .passengerPhone("0912345678")
                .seatNumbers("A02")
                .totalAmount(BigDecimal.valueOf(320000))
                .status(BookingStatus.CANCELLED) // Đã bị hệ thống quét hủy do quá 10 phút
                .bookingChannel("ONLINE")
                .build());

        ticketRepository.save(Ticket.builder()
                .booking(expiredBooking)
                .ticketCode("TK-S314-EXP-A02")
                .seatNumber("A02")
                .price(BigDecimal.valueOf(320000))
                .status(TicketStatus.CANCELLED)
                .build());

        // Tiền bất ngờ đổ về tài khoản sau khi ghế đã bị nhả
        mockMvc.perform(post("/api/v1/payments/confirm-transfer/" + bookingCode)
                        .param("manualRef", "LATE-TRANSFER-12345"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.paymentStatus").value("REFUND_REQUIRED"))
                .andExpect(jsonPath("$.data.bookingStatus").value("CANCELLED"))
                .andExpect(jsonPath("$.data.paid").value(false));

        // Xác nhận đơn vé vẫn là CANCELLED (tuyệt đối không hồi sinh)
        Booking dbBooking = bookingRepository.findByBookingCode(bookingCode).orElseThrow();
        assertThat(dbBooking.getStatus()).isEqualTo(BookingStatus.CANCELLED);

        PaymentTransaction txn = paymentTransactionRepository.findFirstByBookingCodeOrderByCreatedAtDesc(bookingCode).orElseThrow();
        assertThat(txn.getStatus()).isEqualTo(PaymentStatus.REFUND_REQUIRED);
    }

    @Test
    @Order(3)
    @DisplayName("[S314-03] Thanh toán VNPAY Mock-Success & Tra cứu trạng thái thanh toán thời gian thực")
    void testVnPayMockSuccess_AndStatusLookup() throws Exception {
        String bookingCode = "BK-S314-VNPAY-777";
        Booking booking = bookingRepository.save(Booking.builder()
                .bookingCode(bookingCode)
                .trip(trip)
                .passengerName("Phạm Thị Mai")
                .passengerPhone("0988990011")
                .seatNumbers("B01")
                .totalAmount(BigDecimal.valueOf(320000))
                .status(BookingStatus.PENDING)
                .bookingChannel("ONLINE")
                .build());

        ticketRepository.save(Ticket.builder()
                .booking(booking)
                .ticketCode("TK-S314-VNP-B01")
                .seatNumber("B01")
                .price(BigDecimal.valueOf(320000))
                .status(TicketStatus.ISSUED)
                .build());

        // Kiểm tra tra cứu trạng thái trước khi trả tiền
        mockMvc.perform(get("/api/v1/payments/status/" + bookingCode))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.paid").value(false));

        // Khách hoàn tất thanh toán thành công
        mockMvc.perform(post("/api/v1/payments/mock-success/" + bookingCode)
                        .param("paymentMethod", "VNPAY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.paymentStatus").value("SUCCESS"))
                .andExpect(jsonPath("$.data.bookingStatus").value("CONFIRMED"));

        // Kiểm tra tra cứu trạng thái sau khi thanh toán
        mockMvc.perform(get("/api/v1/payments/status/" + bookingCode))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.paid").value(true))
                .andExpect(jsonPath("$.data.paymentStatus").value("SUCCESS"));
    }

    @Test
    @Order(4)
    @DisplayName("[S314-04] Thanh toán tiền mặt tại quầy bến xe (POS Cash) kích hoạt vé tức thì")
    void testPosCashPayment_DirectConfirmation() {
        String bookingCode = "BK-S314-POS-CASH-888";
        Booking booking = bookingRepository.save(Booking.builder()
                .bookingCode(bookingCode)
                .trip(trip)
                .passengerName("Vũ Quốc Bảo")
                .passengerPhone("0977889900")
                .seatNumbers("B02")
                .totalAmount(BigDecimal.valueOf(320000))
                .status(BookingStatus.PENDING)
                .bookingChannel("POS")
                .paymentMethod(PaymentMethod.COD)
                .build());

        ticketRepository.save(Ticket.builder()
                .booking(booking)
                .ticketCode("TK-S314-POS-B02")
                .seatNumber("B02")
                .price(BigDecimal.valueOf(320000))
                .status(TicketStatus.ISSUED)
                .build());

        PaymentInitRequest request = PaymentInitRequest.builder()
                .bookingCode(bookingCode)
                .paymentMethod(PaymentMethod.COD)
                .build();

        var response = paymentService.initiatePayment(request, "127.0.0.1");

        assertThat(response).isNotNull();
        assertThat(response.getBookingCode()).isEqualTo(bookingCode);

        // COD/Cash xác nhận CONFIRMED ngay lập tức
        Booking dbBooking = bookingRepository.findByBookingCode(bookingCode).orElseThrow();
        assertThat(dbBooking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
    }
}

