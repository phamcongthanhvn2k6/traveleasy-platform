package com.traveleasy.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * S313ApiIntegrationTest
 * ============================================================================
 * KIỂM THỬ TÍCH HỢP API TRA CỨU VÉ — MÃ VÉ, SỐ ĐIỆN THOẠI VÀ TUYẾN (/api/tickets/lookup)
 * Thẻ Trello: [BE][S313] (ID: 6ae8113dda2d1e6b096543d7)
 * Phụ trách: Trần Minh Đức (Customer & Tickets)
 * ============================================================================
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class S313ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

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

    private static final String TEST_BOOKING_CODE = "BK-S313-TEST-8888";
    private static final String TEST_TICKET_CODE = "TK-S313-TEST-8888";

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
        BusCompany testCompany = busCompanyRepository.save(BusCompany.builder()
                .name("TravelEasy Phương Trang Test")
                .code("FUTA-S313")
                .hotline("19006067")
                .email("hotro@futa.vn")
                .address("272 Đề Thám, Quận 1, TP. HCM")
                .averageRating(BigDecimal.valueOf(4.9))
                .status("ACTIVE")
                .build());

        Route testRoute = routeRepository.save(Route.builder()
                .busCompany(testCompany)
                .departureLocation("TP. Hồ Chí Minh")
                .arrivalLocation("Đà Lạt")
                .durationHours(BigDecimal.valueOf(6.5))
                .distanceKm(BigDecimal.valueOf(310.0))
                .build());

        LocalDateTime depTime = LocalDate.now().plusDays(1).atTime(22, 0);
        Trip testTrip = tripRepository.save(Trip.builder()
                .busCompany(testCompany)
                .route(testRoute)
                .departureTime(depTime)
                .arrivalTime(depTime.plusHours(6).plusMinutes(30))
                .busType(BusType.LIMOUSINE)
                .licensePlate("51B-888.99")
                .totalSeats(34)
                .availableSeats(33)
                .price(BigDecimal.valueOf(320000.00))
                .status(TripStatus.SCHEDULED)
                .isActive(true)
                .build());

        Booking testBooking = bookingRepository.save(Booking.builder()
                .trip(testTrip)
                .bookingCode(TEST_BOOKING_CODE)
                .passengerName("Nguyễn Văn An")
                .passengerPhone("0912345678")
                .passengerEmail("an.nguyen@test.traveleasy.vn")
                .pickupPoint("Bến xe Miền Đông Mới")
                .dropoffPoint("Bến xe Liên tỉnh Đà Lạt")
                .seatNumbers("A05")
                .totalAmount(BigDecimal.valueOf(320000.00))
                .paymentMethod(PaymentMethod.VNPAY)
                .status(BookingStatus.CONFIRMED)
                .build());

        ticketRepository.save(Ticket.builder()
                .booking(testBooking)
                .ticketCode(TEST_TICKET_CODE)
                .seatNumber("A05")
                .price(BigDecimal.valueOf(320000.00))
                .qrCodeHash("HASH-" + TEST_TICKET_CODE)
                .status(TicketStatus.ISSUED)
                .build());
    }

    /**
     * DoD 1: Tra cứu đơn đặt vé theo mã vé (Booking Code) chính xác theo trạng thái nghiệp vụ
     */
    @Test
    @Order(1)
    @DisplayName("DoD 1: Tra cứu vé theo mã Booking Code (GET /api/v1/bookings/code/{bookingCode})")
    void testLookupByBookingCode_Success() throws Exception {
        mockMvc.perform(get("/api/v1/bookings/code/{bookingCode}", TEST_BOOKING_CODE)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.bookingCode").value(TEST_BOOKING_CODE))
                .andExpect(jsonPath("$.data.customerName").value("Nguyễn Văn An"))
                .andExpect(jsonPath("$.data.customerPhone").value("091****678"))
                .andExpect(jsonPath("$.data.pickupPointName").value("Bến xe Miền Đông Mới"))
                .andExpect(jsonPath("$.data.dropoffPointName").value("Bến xe Liên tỉnh Đà Lạt"))
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.data.tickets").isArray())
                .andExpect(jsonPath("$.data.tickets[0].seatNumber").value("A05"));
    }

    /**
     * DoD 2: Quét mã QR / Tra cứu theo Ticket Code (Verify Ticket)
     */
    @Test
    @Order(2)
    @DisplayName("DoD 2: Quét mã QR vé xe điện tử (GET /api/v1/bookings/verify-ticket/{code})")
    void testVerifyTicket_Success() throws Exception {
        mockMvc.perform(get("/api/v1/bookings/verify-ticket/{code}", TEST_TICKET_CODE)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.validationStatus").value("VALID"))
                .andExpect(jsonPath("$.data.ticketCode").value(TEST_TICKET_CODE))
                .andExpect(jsonPath("$.data.passengerName").value("Nguyễn Văn An"))
                .andExpect(jsonPath("$.data.originCity").value("TP. Hồ Chí Minh"))
                .andExpect(jsonPath("$.data.destinationCity").value("Đà Lạt"))
                .andExpect(jsonPath("$.data.seatNumber").value("A05"))
                .andExpect(jsonPath("$.data.checkInAllowed").value(true));
    }

    /**
     * DoD 3: Tra cứu với payload QR chứa chuỗi phân tách pipe (TK-...|BK-...)
     */
    @Test
    @Order(3)
    @DisplayName("DoD 3: Quét mã QR chuỗi tổ hợp TK|BK phân tách pipe")
    void testVerifyTicket_CompositeQrCode_Success() throws Exception {
        String compositeQr = TEST_TICKET_CODE + "|" + TEST_BOOKING_CODE;
        mockMvc.perform(get("/api/v1/bookings/verify-ticket/{code}", compositeQr)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.validationStatus").value("VALID"))
                .andExpect(jsonPath("$.data.ticketCode").value(TEST_TICKET_CODE))
                .andExpect(jsonPath("$.data.checkInAllowed").value(true));
    }

    /**
     * DoD 4: Tra cứu mã đơn không tồn tại (Xử lý lỗi rõ ràng, trả về 404 chuẩn AppException)
     */
    @Test
    @Order(4)
    @DisplayName("DoD 4: Tra cứu mã đơn không tồn tại trả về lỗi 404 rõ ràng")
    void testLookupByBookingCode_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/bookings/code/{bookingCode}", "BK-NON-EXISTENT-CODE")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("Không tìm thấy")));
    }

    /**
     * DoD 5: Quét mã QR không tồn tại trên hệ thống (Trả về validationStatus: INVALID)
     */
    @Test
    @Order(5)
    @DisplayName("DoD 5: Quét mã QR không hợp lệ trả về INVALID và checkInAllowed: false")
    void testVerifyTicket_InvalidCode() throws Exception {
        mockMvc.perform(get("/api/v1/bookings/verify-ticket/{code}", "TK-UNKNOWN-000")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.validationStatus").value("INVALID"))
                .andExpect(jsonPath("$.data.checkInAllowed").value(false));
    }

    /**
     * DoD 6: Luồng soát vé Check-in và chống Check-in trùng lặp
     */
    @Test
    @Order(6)
    @DisplayName("DoD 6: Soát vé hành khách Check-in và bảo vệ chống Check-in trùng lặp")
    void testCheckInTicket_AndDuplicatePrevention() throws Exception {
        // Lần 1: Check-in hợp lệ với quyền COMPANY / STAFF
        mockMvc.perform(post("/api/v1/bookings/check-in/{ticketCode}", TEST_TICKET_CODE)
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("driver_staff").roles("COMPANY"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.ticketStatus").value("USED"));

        // Lần 2: Quét lại vé vừa check-in -> Trạng thái báo vé đã được sử dụng
        mockMvc.perform(get("/api/v1/bookings/verify-ticket/{code}", TEST_TICKET_CODE)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.validationStatus").value("ALREADY_CHECKED_IN"))
                .andExpect(jsonPath("$.data.checkInAllowed").value(false));
    }

    @Test
    @Order(7)
    @DisplayName("DoD 7: Chặn check-in khi người dùng không có quyền (Anonymous hoặc CUSTOMER)")
    void testCheckInTicket_ForbiddenForUnauthorized() throws Exception {
        // 1. Thử check-in khi chưa đăng nhập (Anonymous) -> 401 Unauthorized
        mockMvc.perform(post("/api/v1/bookings/check-in/{ticketCode}", TEST_TICKET_CODE)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        // 2. Thử check-in với vai trò CUSTOMER -> Bị cấm (403 Forbidden)
        mockMvc.perform(post("/api/v1/bookings/check-in/{ticketCode}", TEST_TICKET_CODE)
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("normal_user").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
