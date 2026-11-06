package com.traveleasy.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.traveleasy.dto.booking.CreateBookingRequest;
import com.traveleasy.dto.trip.SeatHoldRequest;
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
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * S309ApiIntegrationTest
 * ============================================================================
 * KIỂM THỬ TÍCH HỢP KHÓA GHẾ — GIỮ CHỖ, ĐỒNG THỜI VÀ CHỐNG ĐẶT TRÙNG
 * Thẻ Trello: [BE][S309]
 * Phụ trách: Phạm Thanh Phong (QA / Testing - Sprint 3)
 * ============================================================================
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class S309ApiIntegrationTest {

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
                .name("Nhà Xe Phương Trang S309")
                .code("FUTA-S309")
                .hotline("19006067")
                .email("support@futa.vn")
                .address("272 Đề Thám, Quận 1, TP. HCM")
                .averageRating(BigDecimal.valueOf(4.9))
                .status("ACTIVE")
                .build());

        Route route = routeRepository.save(Route.builder()
                .busCompany(company)
                .departureLocation("TP. Hồ Chí Minh")
                .arrivalLocation("Đà Lạt")
                .durationHours(BigDecimal.valueOf(6.5))
                .distanceKm(BigDecimal.valueOf(310.0))
                .build());

        LocalDateTime depTime = LocalDate.now().plusDays(1).atTime(22, 0);
        sampleTrip = tripRepository.save(Trip.builder()
                .busCompany(company)
                .route(route)
                .departureTime(depTime)
                .arrivalTime(depTime.plusHours(6).plusMinutes(30))
                .busType(BusType.SLEEPER)
                .licensePlate("51B-309.99")
                .totalSeats(10)
                .availableSeats(9)
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

        for (String code : List.of("A02", "A03", "A04", "A05", "A06")) {
            tripSeatRepository.save(TripSeat.builder()
                    .trip(sampleTrip)
                    .seatCode(code)
                    .floor(1)
                    .seatType("SLEEPER")
                    .status(SeatStatus.AVAILABLE)
                    .build());
        }
    }

    /**
     * DoD 1: Khóa giữ chỗ ghế tạm thời (POST /api/v1/trips/{tripId}/seats/hold) & đồng bộ sơ đồ ghế
     */
    @Test
    @Order(1)
    @DisplayName("DoD 1: Khóa giữ chỗ ghế tạm thời 10 phút và đồng bộ trạng thái LOCKED trên sơ đồ chuyến xe")
    void testHoldSeats_AndVerifyTripSeatMap_Success() throws Exception {
        SeatHoldRequest holdRequest = SeatHoldRequest.builder()
                .seatCodes(List.of("A02", "A03"))
                .sessionId("sess-customer-01")
                .build();

        mockMvc.perform(post("/api/v1/trips/{tripId}/seats/hold", sampleTrip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(holdRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].seatNumber").value("A02"))
                .andExpect(jsonPath("$.data[0].status").value("LOCKED"))
                .andExpect(jsonPath("$.data[0].holderSessionId").value("sess-customer-01"));

        mockMvc.perform(get("/api/v1/trips/{id}", sampleTrip.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.seats[?(@.seatNumber == 'A02')].status", contains("LOCKED")))
                .andExpect(jsonPath("$.data.seats[?(@.seatNumber == 'A03')].status", contains("LOCKED")));
    }

    /**
     * DoD 2: Chặn giữ trùng ghế đang LOCKED và bảo toàn tính nguyên tử của lô ghế
     */
    @Test
    @Order(2)
    @DisplayName("DoD 2: Chặn khách hàng khác giữ trùng ghế đang LOCKED và bảo toàn nguyên tử lô ghế")
    void testHoldConflict_AtomicBatchRollback() throws Exception {
        SeatHoldRequest firstHold = SeatHoldRequest.builder()
                .seatCodes(List.of("A02"))
                .sessionId("sess-holder-A")
                .build();

        mockMvc.perform(post("/api/v1/trips/{tripId}/seats/hold", sampleTrip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(firstHold)))
                .andExpect(status().isOk());

        // Khách B gửi lô ["A04", "A02"] trong đó A02 đã bị khóa -> Toàn bộ lô bị từ chối, A04 vẫn AVAILABLE
        SeatHoldRequest conflictingBatch = SeatHoldRequest.builder()
                .seatCodes(List.of("A04", "A02"))
                .sessionId("sess-holder-B")
                .build();

        mockMvc.perform(post("/api/v1/trips/{tripId}/seats/hold", sampleTrip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(conflictingBatch)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("A02")));

        TripSeat seatA04 = tripSeatRepository.findByTripIdAndSeatCode(sampleTrip.getId(), "A04").orElseThrow();
        assertEquals(SeatStatus.AVAILABLE, seatA04.getStatus(), "Ghế A04 phải giữ nguyên AVAILABLE khi lô giữ chỗ thất bại");
    }

    /**
     * DoD 3: Cạnh tranh đồng thời (Multi-thread Concurrency) với Pessimistic Lock
     */
    @Test
    @Order(3)
    @DisplayName("DoD 3: Cạnh tranh đồng thời 6 luồng cùng giữ ghế A04 — Duy nhất 1 luồng thành công")
    void testConcurrentSeatHold_OnlyOneSucceeds() throws Exception {
        int threadCount = 6;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectedCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            final String session = "sess-race-" + i;
            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await(5, TimeUnit.SECONDS);
                    SeatHoldRequest req = SeatHoldRequest.builder()
                            .seatCodes(List.of("A04"))
                            .sessionId(session)
                            .build();
                    MvcResult res = mockMvc.perform(post("/api/v1/trips/{tripId}/seats/hold", sampleTrip.getId())
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(req)))
                            .andReturn();
                    if (res.getResponse().getStatus() == 200) {
                        successCount.incrementAndGet();
                    } else {
                        rejectedCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    rejectedCount.incrementAndGet();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        assertTrue(readyLatch.await(5, TimeUnit.SECONDS));
        startLatch.countDown();
        assertTrue(doneLatch.await(10, TimeUnit.SECONDS));
        executor.shutdownNow();

        assertEquals(1, successCount.get(), "Chỉ duy nhất 1 luồng được phép khóa ghế A04 thành công");
        assertEquals(threadCount - 1, rejectedCount.get(), "5 luồng còn lại phải bị từ chối");
    }

    /**
     * DoD 4: Giải phóng ghế giữ chỗ (POST /api/v1/trips/{tripId}/seats/release) và mở lại cho khách mới
     */
    @Test
    @Order(4)
    @DisplayName("DoD 4: Giải phóng ghế đang giữ chỗ về AVAILABLE và cho phép khách hàng mới giữ chỗ lại")
    void testReleaseSeats_AndReholdByAnotherCustomer() throws Exception {
        SeatHoldRequest holdReq = SeatHoldRequest.builder()
                .seatCodes(List.of("A05"))
                .sessionId("sess-first")
                .build();

        mockMvc.perform(post("/api/v1/trips/{tripId}/seats/hold", sampleTrip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(holdReq)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/trips/{tripId}/seats/release", sampleTrip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(holdReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        TripSeat releasedSeat = tripSeatRepository.findByTripIdAndSeatCode(sampleTrip.getId(), "A05").orElseThrow();
        assertEquals(SeatStatus.AVAILABLE, releasedSeat.getStatus());

        SeatHoldRequest secondHold = SeatHoldRequest.builder()
                .seatCodes(List.of("A05"))
                .sessionId("sess-second")
                .build();

        mockMvc.perform(post("/api/v1/trips/{tripId}/seats/hold", sampleTrip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(secondHold)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].holderSessionId").value("sess-second"));
    }

    /**
     * DoD 5: Chống đặt trùng (Anti-Double-Booking) trên /api/v1/bookings và kiểm tra mã ghế không tồn tại
     */
    @Test
    @Order(5)
    @DisplayName("DoD 5: Chống đặt trùng trên POST /api/v1/bookings (409 Conflict) và bắt lỗi ghế không tồn tại (404)")
    void testAntiDoubleBooking_AndInvalidSeatValidation() throws Exception {
        CreateBookingRequest bookingReq = new CreateBookingRequest();
        bookingReq.setTripId(sampleTrip.getId());
        bookingReq.setSeatNumbers(List.of("A06"));
        bookingReq.setCustomerName("Phạm Thanh Phong");
        bookingReq.setCustomerPhone("0901234567");
        bookingReq.setCustomerEmail("phong@traveleasy.vn");
        bookingReq.setPaymentMethod(PaymentMethod.COD);

        // Đặt ghế A06 lần 1 -> 200 OK
        mockMvc.perform(post("/api/v1/bookings")
                        .with(SecurityMockMvcRequestPostProcessors.user("phong@traveleasy.vn").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Cố tình đặt trùng ghế A06 lần 2 -> 409 Conflict (SEAT_ALREADY_BOOKED)
        mockMvc.perform(post("/api/v1/bookings")
                        .with(SecurityMockMvcRequestPostProcessors.user("other@traveleasy.vn").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("A06")));

        // Cố tình giữ chỗ ghế A01 đã BOOKED -> 409 Conflict
        mockMvc.perform(post("/api/v1/trips/{tripId}/seats/hold", sampleTrip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(SeatHoldRequest.builder()
                                .seatCodes(List.of("A01"))
                                .sessionId("sess-booked")
                                .build())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));

        // Giữ chỗ ghế Z99 không tồn tại -> 404 Not Found
        mockMvc.perform(post("/api/v1/trips/{tripId}/seats/hold", sampleTrip.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(SeatHoldRequest.builder()
                                .seatCodes(List.of("Z99"))
                                .sessionId("sess-non-existent")
                                .build())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }
}
