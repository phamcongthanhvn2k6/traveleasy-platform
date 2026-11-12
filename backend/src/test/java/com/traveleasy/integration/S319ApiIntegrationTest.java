package com.traveleasy.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.traveleasy.dto.booking.CreateBookingRequest;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * S319ApiIntegrationTest
 * ============================================================================
 * KIỂM THỬ HỒI QUY HỢP ĐỒNG API — ÁNH XẠ NGOẠI LỆ VÀ NỘI DUNG LỖI (/api)
 * Thẻ Trello: [BE][S319]
 * Phụ trách: Phạm Thanh Phong (QA / Testing - Sprint 3)
 * ============================================================================
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class S319ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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

    private Trip sampleTrip;

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
                .name("Nhà Xe Kiểm Thử Hợp Đồng S319")
                .code("CONTRACT-S319")
                .hotline("19001234")
                .email("contract@traveleasy.vn")
                .address("Bến xe Miền Đông Mới, TP. Thủ Đức")
                .averageRating(BigDecimal.valueOf(4.8))
                .status("ACTIVE")
                .build());

        Route route = routeRepository.save(Route.builder()
                .busCompany(company)
                .departureLocation("TP. Hồ Chí Minh")
                .arrivalLocation("Nha Trang")
                .durationHours(BigDecimal.valueOf(8.0))
                .distanceKm(BigDecimal.valueOf(430.0))
                .build());

        LocalDateTime departure = LocalDate.now().plusDays(1).atTime(20, 0);
        sampleTrip = tripRepository.save(Trip.builder()
                .busCompany(company)
                .route(route)
                .departureTime(departure)
                .arrivalTime(departure.plusHours(8))
                .busType(BusType.SLEEPER)
                .licensePlate("51B-319.99")
                .totalSeats(34)
                .availableSeats(33)
                .price(BigDecimal.valueOf(350000))
                .status(TripStatus.SCHEDULED)
                .isActive(true)
                .build());

        tripSeatRepository.save(TripSeat.builder()
                .trip(sampleTrip)
                .seatCode("A01")
                .floor(1)
                .seatType("SLEEPER")
                .status(SeatStatus.BOOKED)
                .build());

        tripSeatRepository.save(TripSeat.builder()
                .trip(sampleTrip)
                .seatCode("A02")
                .floor(1)
                .seatType("SLEEPER")
                .status(SeatStatus.AVAILABLE)
                .build());
    }

    /**
     * DoD 1: Hợp đồng luồng thành công & trạng thái danh sách rỗng (HTTP 200 OK)
     */
    @Test
    @Order(1)
    @DisplayName("DoD 1: Hợp đồng phản hồi chuẩn ApiResponse cho luồng chính và trạng thái danh sách rỗng")
    void testHappyPathAndEmptyStateContract() throws Exception {
        mockMvc.perform(get("/api/v1/trips/search")
                        .param("origin", "TP. Hồ Chí Minh")
                        .param("destination", "Nha Trang")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].originCity").value("TP. Hồ Chí Minh"))
                .andExpect(jsonPath("$.timestamp").isNotEmpty());

        mockMvc.perform(get("/api/v1/trips/search")
                        .param("origin", "Cà Mau")
                        .param("destination", "Lào Cai")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(0)));

        mockMvc.perform(get("/api/v1/trips/{id}", sampleTrip.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.trip.id").value(sampleTrip.getId()))
                .andExpect(jsonPath("$.data.seats", hasSize(2)));
    }

    /**
     * DoD 2: Ánh xạ ngoại lệ kiểm tra dữ liệu bắt buộc (MethodArgumentNotValidException -> 400 Bad Request)
     */
    @Test
    @Order(2)
    @DisplayName("DoD 2: Ánh xạ lỗi Validation (400 Bad Request) trả về chi tiết từng trường vi phạm")
    void testValidationExceptionMapping() throws Exception {
        String invalidPayload = """
                {
                  "tripId": null,
                  "seatNumbers": [],
                  "customerName": "",
                  "customerPhone": "12345",
                  "customerEmail": "not-an-email",
                  "paymentMethod": null
                }
                """;

        mockMvc.perform(post("/api/v1/bookings")
                        .with(SecurityMockMvcRequestPostProcessors.user("customer@traveleasy.vn").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", startsWith("Lỗi dữ liệu:")))
                .andExpect(jsonPath("$.errors.tripId").value("Mã chuyến xe không được để trống"))
                .andExpect(jsonPath("$.errors.seatNumbers").value("Vui lòng chọn ít nhất 1 ghế"))
                .andExpect(jsonPath("$.errors.customerName").value("Họ tên hành khách không được để trống"))
                .andExpect(jsonPath("$.errors.customerPhone").value("Số điện thoại không đúng định dạng (VD: 0988123456)"))
                .andExpect(jsonPath("$.errors.customerEmail").value("Email không đúng định dạng"))
                .andExpect(jsonPath("$.errors.paymentMethod").value("Phương thức thanh toán không được để trống"))
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    /**
     * DoD 3: Ánh xạ ngoại lệ cú pháp JSON hỏng & sai kiểu dữ liệu tham số (HTTP 400 Bad Request)
     */
    @Test
    @Order(3)
    @DisplayName("DoD 3: Ánh xạ lỗi JSON sai cú pháp (HttpMessageNotReadable) và sai kiểu tham số (TypeMismatch)")
    void testMalformedJsonAndTypeMismatchMapping() throws Exception {
        mockMvc.perform(post("/api/v1/bookings")
                        .with(SecurityMockMvcRequestPostProcessors.user("customer@traveleasy.vn").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"tripId\": 1, \"seatNumbers\": [\"A01\", "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("không đúng định dạng JSON")));

        mockMvc.perform(get("/api/v1/trips/{id}", "abc-invalid-long")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", allOf(
                        containsString("id"),
                        containsString("abc-invalid-long"),
                        containsString("không đúng kiểu dữ liệu")
                )));
    }

    /**
     * DoD 4: Ánh xạ lỗi phương thức HTTP không hỗ trợ (405) & đường dẫn không tồn tại (404)
     */
    @Test
    @Order(4)
    @DisplayName("DoD 4: Ánh xạ lỗi sai phương thức HTTP (405 Method Not Allowed) và đường dẫn không tồn tại (404)")
    void testMethodNotAllowedAndNoResourceFoundMapping() throws Exception {
        mockMvc.perform(delete("/api/v1/trips/search")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("DELETE không được hỗ trợ")));

        mockMvc.perform(get("/api/v1/trips/non-existent-subpath/unknown")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("không tồn tại")));
    }

    /**
     * DoD 5: Ánh xạ ngoại lệ nghiệp vụ AppException (404 Not Found & 409 Conflict SEAT_ALREADY_BOOKED)
     */
    @Test
    @Order(5)
    @DisplayName("DoD 5: Ánh xạ ngoại lệ nghiệp vụ AppException (404 Not Found và 409 Conflict khi đặt trùng ghế)")
    void testBusinessAppExceptionMapping() throws Exception {
        mockMvc.perform(get("/api/v1/trips/{id}", 999999L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("Không tìm thấy chuyến xe")));

        CreateBookingRequest duplicateSeatRequest = new CreateBookingRequest();
        duplicateSeatRequest.setTripId(sampleTrip.getId());
        duplicateSeatRequest.setSeatNumbers(List.of("A01"));
        duplicateSeatRequest.setCustomerName("Nguyễn Văn Kiểm Thử");
        duplicateSeatRequest.setCustomerPhone("0912345678");
        duplicateSeatRequest.setCustomerEmail("test@traveleasy.vn");
        duplicateSeatRequest.setPaymentMethod(PaymentMethod.COD);

        mockMvc.perform(post("/api/v1/bookings")
                        .with(SecurityMockMvcRequestPostProcessors.user("test@traveleasy.vn").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateSeatRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("A01")));
    }

    /**
     * DoD 6: Kiểm soát phân quyền theo vai trò (401/403) và không rò rỉ stacktrace nội bộ
     */
    @Test
    @Order(6)
    @DisplayName("DoD 6: Phân quyền theo vai trò (401/403) và bảo mật nội dung lỗi không lộ stacktrace")
    void testRoleAuthorizationAndNoStacktraceLeakage() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));

        mockMvc.perform(get("/api/v1/admin/users")
                        .with(SecurityMockMvcRequestPostProcessors.user("customer@traveleasy.vn").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));

        mockMvc.perform(get("/api/v1/bookings/code/{bookingCode}", "BK-NON-EXISTENT-9999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(content().string(not(containsString("java.lang."))))
                .andExpect(content().string(not(containsString("org.hibernate."))))
                .andExpect(content().string(not(containsString("SELECT "))));
    }
}
