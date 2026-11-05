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
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * S319ApiIntegrationTest
 * ============================================================================
 * KIỂM THỬ HỒI QUY HỢP ĐỒNG API — ÁNH XẠ NGOẠI LỆ VÀ NỘI DUNG LỖI (/api)
 * Thẻ Trello: [BE][S319] (ID: 6ae81144 / AyWUDmz6)
 * Phụ trách: Phạm Thanh Phong (phmthanhphong17)
 * Người rà soát: Phạm Công Thành (thanhphmcong1)
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
    private RouteRepository routeRepository;

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

    @Autowired
    private PickupDropoffPointRepository pointRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    private BusCompany sampleCompany;
    private Route sampleRoute;
    private Trip sampleTrip;

    @BeforeEach
    void setUp() {
        cleanDatabase();
        initStableFixtures();
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

    private void initStableFixtures() {
        long suffix = System.nanoTime();

        sampleCompany = busCompanyRepository.save(BusCompany.builder()
                .name("TravelEasy Royal Limousine " + suffix)
                .code("TRL-" + suffix)
                .hotline("19008888")
                .email("royal@traveleasy.vn")
                .address("500 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh")
                .averageRating(BigDecimal.valueOf(4.9))
                .status("ACTIVE")
                .build());

        sampleRoute = routeRepository.save(Route.builder()
                .busCompany(sampleCompany)
                .departureLocation("TP. Hồ Chí Minh")
                .arrivalLocation("Nha Trang")
                .durationHours(BigDecimal.valueOf(8.0))
                .distanceKm(BigDecimal.valueOf(430.0))
                .build());

        LocalDateTime depTime = LocalDate.now().plusDays(2).atTime(21, 0);
        sampleTrip = tripRepository.save(Trip.builder()
                .busCompany(sampleCompany)
                .route(sampleRoute)
                .departureTime(depTime)
                .arrivalTime(depTime.plusHours(8))
                .busType(BusType.LIMOUSINE)
                .licensePlate("51B-678.90")
                .totalSeats(10)
                .availableSeats(9)
                .price(BigDecimal.valueOf(420000.00))
                .status(TripStatus.SCHEDULED)
                .isActive(true)
                .build());

        List<TripSeat> seats = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            seats.add(TripSeat.builder()
                    .trip(sampleTrip)
                    .seatCode(String.format("A%02d", i))
                    .floor(i <= 5 ? 1 : 2)
                    .rowNum(i)
                    .colNum(1)
                    .seatType("VIP_CABIN")
                    .status(i == 1 ? SeatStatus.BOOKED : SeatStatus.AVAILABLE)
                    .build());
        }
        tripSeatRepository.saveAll(seats);
    }

    /**
     * DoD 1: Kiểm thử hợp đồng phản hồi luồng chính thành công (200 OK),
     * trạng thái dữ liệu rỗng ([]) và đồng bộ trên cả /api/v1/trips lẫn /api/trips.
     */
    @Test
    @Order(1)
    @DisplayName("DoD 1: Hợp đồng phản hồi luồng chính thành công và trạng thái danh sách rỗng chuẩn ApiResponse")
    void testPrimaryContract_SuccessAndEmptyState() throws Exception {
        LocalDate searchDate = sampleTrip.getDepartureTime().toLocalDate();

        // 1. Luồng chính có dữ liệu: Trả về cấu trúc chuẩn success=true, message, data, timestamp
        mockMvc.perform(get("/api/v1/trips/search")
                        .param("origin", "TP. Hồ Chí Minh")
                        .param("destination", "Nha Trang")
                        .param("departureDate", searchDate.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(sampleTrip.getId()))
                .andExpect(jsonPath("$.data[0].price").value(420000.0))
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(jsonPath("$.errors").doesNotExist());

        // 2. Luồng chi tiết chuyến xe qua cả /api/v1/trips/{id} và /api/trips/{id} (authenticated)
        mockMvc.perform(get("/api/v1/trips/{id}", sampleTrip.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.trip.id").value(sampleTrip.getId()))
                .andExpect(jsonPath("$.data.seats", hasSize(10)));

        mockMvc.perform(get("/api/trips/{id}", sampleTrip.getId())
                        .with(SecurityMockMvcRequestPostProcessors.user("tester").roles("CUSTOMER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.trip.id").value(sampleTrip.getId()));

        // 3. Trạng thái rỗng (Empty State): Không tìm thấy chuyến -> Trả về mảng rỗng [], không báo lỗi 500
        mockMvc.perform(get("/api/v1/trips/search")
                        .param("origin", "Điện Biên")
                        .param("destination", "Côn Đảo")
                        .param("departureDate", searchDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    /**
     * DoD 2: Kiểm thử ánh xạ ngoại lệ MethodArgumentNotValidException (400 Bad Request)
     * Xác minh bản đồ lỗi chi tiết theo từng trường (errors.<fieldName>) bằng tiếng Việt rõ ràng.
     */
    @Test
    @Order(2)
    @DisplayName("DoD 2: Ánh xạ ngoại lệ MethodArgumentNotValidException trả về 400 kèm chi tiết từng trường lỗi")
    void testValidationExceptionMapping_FieldLevelDetails() throws Exception {
        CreateBookingRequest invalidRequest = new CreateBookingRequest();
        invalidRequest.setTripId(null); // @NotNull
        invalidRequest.setSeatNumbers(Collections.emptyList()); // @NotEmpty
        invalidRequest.setCustomerName(""); // @NotBlank
        invalidRequest.setCustomerPhone("12345"); // @Pattern sai định dạng SĐT Việt Nam
        invalidRequest.setCustomerEmail("not-an-email"); // @Email sai định dạng
        invalidRequest.setPaymentMethod(null); // @NotNull

        mockMvc.perform(post("/api/v1/bookings")
                        .with(SecurityMockMvcRequestPostProcessors.user("customer@traveleasy.vn").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", startsWith("Lỗi dữ liệu:")))
                .andExpect(jsonPath("$.errors.tripId").isNotEmpty())
                .andExpect(jsonPath("$.errors.seatNumbers").isNotEmpty())
                .andExpect(jsonPath("$.errors.customerName").isNotEmpty())
                .andExpect(jsonPath("$.errors.customerPhone", containsString("Số điện thoại")))
                .andExpect(jsonPath("$.errors.customerEmail", containsString("Email")))
                .andExpect(jsonPath("$.errors.paymentMethod").isNotEmpty())
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    /**
     * DoD 3: Kiểm thử ánh xạ ngoại lệ cú pháp JSON hỏng, sai Enum, sai kiểu tham số và sai Content-Type
     * (HttpMessageNotReadableException, MethodArgumentTypeMismatchException, HttpMediaTypeNotSupportedException).
     */
    @Test
    @Order(3)
    @DisplayName("DoD 3: Ánh xạ ngoại lệ JSON sai cú pháp (400), sai kiểu tham số (400) và sai Content-Type (415)")
    void testMalformedJson_TypeMismatch_AndUnsupportedMediaType() throws Exception {
        // 3.1 JSON bị vỡ cú pháp -> HttpMessageNotReadableException (400 Bad Request)
        mockMvc.perform(post("/api/v1/bookings")
                        .with(SecurityMockMvcRequestPostProcessors.user("customer@traveleasy.vn").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tripId\": 1, \"seatNumbers\": [\"A02\", BROKEN_JSON}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("JSON")));

        // 3.2 Giá trị Enum PaymentMethod không tồn tại -> HttpMessageNotReadableException (400 Bad Request)
        mockMvc.perform(post("/api/v1/bookings")
                        .with(SecurityMockMvcRequestPostProcessors.user("customer@traveleasy.vn").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tripId\": 1, \"seatNumbers\": [\"A02\"], \"customerName\": \"An\", \"customerPhone\": \"0912345678\", \"paymentMethod\": \"BITCOIN_INVALID\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("enum")));

        // 3.3 Sai kiểu dữ liệu tham số PathVariable (truyền chữ vào kiểu Long) -> MethodArgumentTypeMismatchException (400)
        mockMvc.perform(get("/api/v1/trips/{id}", "abc-invalid-long"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("id")))
                .andExpect(jsonPath("$.message", containsString("abc-invalid-long")))
                .andExpect(jsonPath("$.message", containsString("Long")));

        // 3.4 Sai kiểu dữ liệu tham số ngày tháng (departureDate) -> MethodArgumentTypeMismatchException (400)
        mockMvc.perform(get("/api/v1/trips/search")
                        .param("origin", "TP. Hồ Chí Minh")
                        .param("departureDate", "not-a-date"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("departureDate")));

        // 3.5 Gửi sai Content-Type (text/plain thay vì application/json) -> HttpMediaTypeNotSupportedException (415)
        mockMvc.perform(post("/api/v1/bookings")
                        .with(SecurityMockMvcRequestPostProcessors.user("customer@traveleasy.vn").roles("CUSTOMER"))
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("plain text payload"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("application/json")));
    }

    /**
     * DoD 4: Kiểm thử ánh xạ ngoại lệ Phương thức HTTP không hỗ trợ (405) và Đường dẫn không tồn tại (404)
     */
    @Test
    @Order(4)
    @DisplayName("DoD 4: Ánh xạ ngoại lệ HttpRequestMethodNotSupportedException (405) và NoResourceFoundException (404)")
    void testMethodNotAllowed_AndNoResourceFound() throws Exception {
        // 4.1 Gọi DELETE vào endpoint chỉ hỗ trợ GET -> 405 Method Not Allowed
        mockMvc.perform(delete("/api/v1/trips/search"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("DELETE")))
                .andExpect(jsonPath("$.message", containsString("không được hỗ trợ")));

        // 4.2 Gọi đường dẫn API không tồn tại -> 404 Not Found
        mockMvc.perform(get("/api/v1/trips/non-existent-subpath/unknown"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    /**
     * DoD 5: Kiểm thử ánh xạ ngoại lệ nghiệp vụ AppException (404 / 400 / 409) kèm mã lỗi chuẩn errors.errorCode
     * và kiểm soát giá trị biên (Boundary Values).
     */
    @Test
    @Order(5)
    @DisplayName("DoD 5: Ánh xạ AppException (SYS_404, VAL_400, SEAT_002) và xử lý giá trị biên an toàn")
    void testAppExceptionMapping_AndBoundaryValues() throws Exception {
        // 5.1 Giá trị biên ID = 0 và ID âm (-1) -> 404 Not Found kèm errorCode = SYS_404
        mockMvc.perform(get("/api/v1/trips/{id}", 0L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors.errorCode").value("SYS_404"));

        mockMvc.perform(get("/api/v1/trips/{id}", -1L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors.errorCode").value("SYS_404"));

        // 5.2 Giá trị biên chuỗi tìm kiếm vượt quá 100 ký tự -> 400 Bad Request kèm errorCode = VAL_400
        String overlyLongOrigin = "A".repeat(120);
        mockMvc.perform(get("/api/v1/trips/search")
                        .param("origin", overlyLongOrigin))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("vượt quá độ dài tối đa")))
                .andExpect(jsonPath("$.errors.errorCode").value("VAL_400"));

        // 5.3 Xung đột đặt ghế đã BOOKED (ghế A01) -> 409 Conflict kèm errorCode = SEAT_002
        CreateBookingRequest bookedSeatReq = new CreateBookingRequest();
        bookedSeatReq.setTripId(sampleTrip.getId());
        bookedSeatReq.setSeatNumbers(List.of("A01"));
        bookedSeatReq.setCustomerName("Lê Hoàng Nam");
        bookedSeatReq.setCustomerPhone("0909123456");
        bookedSeatReq.setCustomerEmail("nam.le@example.com");
        bookedSeatReq.setPaymentMethod(PaymentMethod.COD);

        mockMvc.perform(post("/api/v1/bookings")
                        .with(SecurityMockMvcRequestPostProcessors.user("nam.le@example.com").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookedSeatReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("A01")))
                .andExpect(jsonPath("$.errors.errorCode").value("SEAT_002"));
    }

    /**
     * DoD 6: Kiểm thử phân quyền (401 Unauthorized / 403 Forbidden) và bảo mật chống rò rỉ dữ liệu nhạy cảm
     * (Không tiết lộ StackTrace, tên class nội bộ hoặc câu lệnh SQL trong phản hồi lỗi).
     */
    @Test
    @Order(6)
    @DisplayName("DoD 6: Xử lý thiếu quyền (401/403) và bảo đảm không rò rỉ StackTrace hay cấu trúc SQL nội bộ")
    void testSecurityErrorContract_AndZeroSensitiveDataLeakage() throws Exception {
        // 6.1 Gọi API quản trị khi chưa xác thực -> 401 Unauthorized
        MvcResult unauthResult = mockMvc.perform(get("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andReturn();

        // 6.2 Gọi API quản trị với vai trò CUSTOMER -> 403 Forbidden
        MvcResult forbiddenResult = mockMvc.perform(get("/api/v1/admin/users")
                        .with(SecurityMockMvcRequestPostProcessors.user("customer_user").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("không có quyền")))
                .andReturn();

        // 6.3 Gọi API với payload tiêm SQL / ký tự đặc biệt và kiểm tra không lộ thông tin nội bộ
        MvcResult errorResult = mockMvc.perform(get("/api/v1/bookings/code/{code}", "BK-9999' OR 1=1--")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andReturn();

        for (MvcResult res : List.of(unauthResult, forbiddenResult, errorResult)) {
            String body = res.getResponse().getContentAsString();
            assertFalse(body.contains("java.lang."), "Phản hồi lỗi không được làm lộ java.lang stacktrace");
            assertFalse(body.contains("org.springframework."), "Phản hồi lỗi không được làm lộ package nội bộ Spring");
            assertFalse(body.contains("org.hibernate."), "Phản hồi lỗi không được làm lộ thông tin Hibernate ORM");
            assertFalse(body.toUpperCase().contains("SELECT "), "Phản hồi lỗi không được làm lộ câu truy vấn SQL");
        }
    }
}

