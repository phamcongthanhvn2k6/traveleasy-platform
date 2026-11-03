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
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class S320ApiIntegrationTest {

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
        initSampleFixtures();
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

    private void initSampleFixtures() {
        // 1. Tạo Nhà xe mẫu
        sampleCompany = busCompanyRepository.save(BusCompany.builder()
                .name("TravelEasy Test Express " + System.currentTimeMillis())
                .code("TVE-TEST-" + System.currentTimeMillis())
                .hotline("19001234")
                .email("test@traveleasy.vn")
                .address("123 Đường Giải Phóng, Hà Nội")
                .averageRating(BigDecimal.valueOf(4.8))
                .status("ACTIVE")
                .build());

        // 2. Tạo Tuyến đường mẫu
        sampleRoute = routeRepository.save(Route.builder()
                .busCompany(sampleCompany)
                .departureLocation("Hà Nội")
                .arrivalLocation("Đà Nẵng")
                .durationHours(BigDecimal.valueOf(14.5))
                .distanceKm(BigDecimal.valueOf(760.0))
                .build());

        // 3. Tạo Chuyến xe mẫu
        LocalDateTime depTime = LocalDate.now().plusDays(2).atTime(18, 30);
        sampleTrip = tripRepository.save(Trip.builder()
                .busCompany(sampleCompany)
                .route(sampleRoute)
                .departureTime(depTime)
                .arrivalTime(depTime.plusHours(14))
                .busType(BusType.LIMOUSINE)
                .licensePlate("29B-999.88")
                .totalSeats(34)
                .availableSeats(32)
                .price(BigDecimal.valueOf(450000.00))
                .status(TripStatus.SCHEDULED)
                .isActive(true)
                .build());

        // 4. Tạo Sơ đồ ghế mẫu cho chuyến
        List<TripSeat> seats = new ArrayList<>();
        for (int i = 1; i <= 34; i++) {
            seats.add(TripSeat.builder()
                    .trip(sampleTrip)
                    .seatCode(String.format("A%02d", i))
                    .floor(i <= 17 ? 1 : 2)
                    .rowNum((i - 1) % 6 + 1)
                    .colNum(1)
                    .seatType("VIP_MASSAGE")
                    .status(i == 1 || i == 2 ? SeatStatus.BOOKED : SeatStatus.AVAILABLE)
                    .build());
        }
        tripSeatRepository.saveAll(seats);
    }

    @Test
    @Order(1)
    @DisplayName("DoD 1: Khởi tạo fixture ổn định và tìm kiếm chuyến hợp lệ")
    void testFixtureInitializationAndSearchSuccess() throws Exception {
        LocalDate searchDate = sampleTrip.getDepartureTime().toLocalDate();

        mockMvc.perform(get("/api/v1/trips/search")
                        .param("origin", "Hà Nội")
                        .param("destination", "Đà Nẵng")
                        .param("departureDate", searchDate.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].busCompanyName").value(sampleCompany.getName()))
                .andExpect(jsonPath("$.data[0].originCity").value("Hà Nội"))
                .andExpect(jsonPath("$.data[0].destinationCity").value("Đà Nẵng"))
                .andExpect(jsonPath("$.data[0].availableSeats").value(32));
    }

    @Test
    @Order(2)
    @DisplayName("DoD 2: Dữ liệu mẫu bao phủ các trường hợp biên, giá trị sai và dữ liệu rỗng")
    void testBoundaryAndEdgeCases() throws Exception {
        LocalDate searchDate = sampleTrip.getDepartureTime().toLocalDate();

        // 2.1 Tuyến không tồn tại -> Trả về mảng rỗng, không crash 500
        mockMvc.perform(get("/api/v1/trips/search")
                        .param("origin", "Cà Mau")
                        .param("destination", "Lạng Sơn")
                        .param("departureDate", searchDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(0)));

        // 2.2 Ngày khởi hành trong quá khứ -> An toàn không phát sinh lỗi
        mockMvc.perform(get("/api/v1/trips/search")
                        .param("origin", "Hà Nội")
                        .param("destination", "Đà Nẵng")
                        .param("departureDate", "2020-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(0)));

        // 2.3 Tham số chứa ký tự đặc biệt / SQL Injection attempt -> Không gây crash SQL
        mockMvc.perform(get("/api/v1/trips/search")
                        .param("origin", "Hà Nội' OR '1'='1")
                        .param("destination", "Đà Nẵng--")
                        .param("departureDate", searchDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(0)));

        // 2.4 Xem chi tiết chuyến xe với ID âm / không tồn tại
        mockMvc.perform(get("/api/v1/trips/-9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));

        // 2.5 Xem chi tiết với ID sai định dạng chữ
        mockMvc.perform(get("/api/v1/trips/invalid_format_id"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @Order(3)
    @DisplayName("DoD 3: Quy trình dọn dẹp DB an toàn, bảo đảm tính độc lập giữa các lượt chạy (Idempotent)")
    void testSafeDatabaseCleanupAndRepeatability() {
        // Kiểm tra dữ liệu hiện diện trong test này
        assertTrue(tripRepository.count() > 0, "Dữ liệu fixture phải tồn tại trước khi dọn dẹp");
        assertTrue(tripSeatRepository.count() > 0, "Dữ liệu ghế phải tồn tại trước khi dọn dẹp");

        // Tiến hành dọn dẹp an toàn theo thứ tự ràng buộc khóa ngoại
        cleanDatabase();

        // Xác nhận sạch bóng dữ liệu
        assertEquals(0, tripSeatRepository.count(), "Bảng trip_seats phải trống sau khi dọn");
        assertEquals(0, tripRepository.count(), "Bảng trips phải trống sau khi dọn");
        assertEquals(0, routeRepository.count(), "Bảng routes phải trống sau khi dọn");
        assertEquals(0, vehicleRepository.count(), "Bảng vehicles phải trống sau khi dọn");
        assertEquals(0, busCompanyRepository.count(), "Bảng bus_companies phải trống sau khi dọn");

        // Khởi tạo lại lần 2 để chứng minh có thể chạy lặp lại mà không xung đột
        initSampleFixtures();
        assertEquals(1, tripRepository.count(), "Có thể tái tạo fixture lặp lại thành công");
        assertEquals(34, tripSeatRepository.count(), "Tái tạo đủ 34 ghế cho chuyến");
    }

    @Test
    @Order(4)
    @DisplayName("DoD 4: Tích hợp lịch trình tuyến và danh mục tuyến đường với fixture")
    void testTripScheduleEndpoints() throws Exception {
        // Kiểm tra API lấy lịch trình định kỳ
        mockMvc.perform(get("/api/v1/trips/schedule")
                        .param("origin", "Hà Nội")
                        .param("destination", "Đà Nẵng"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Kiểm tra API lấy danh mục tuyến đường
        mockMvc.perform(get("/api/v1/trips/schedule/routes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }
}
