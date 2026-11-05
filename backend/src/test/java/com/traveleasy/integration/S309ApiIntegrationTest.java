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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
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
 * KIỂM THỬ TÍCH HỢP KHÓA GHẾ — HẾT HẠN, ĐỒNG THỜI VÀ CHỐNG ĐẶT TRÙNG (/api/seat-locks)
 * Thẻ Trello: [BE][S309] (ID: 6ae81139 / oUXpbgI1)
 * Phụ trách: Phạm Thanh Phong (phmthanhphong17)
 * Người rà soát: Phạm Công Thành (thanhphmcong1)
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

    private BusCompany primaryCompany;
    private BusCompany rivalCompany;
    private Route sampleRoute;
    private Trip sampleTrip;

    @BeforeEach
    void setUp() {
        cleanDatabase();
        initRefreshableFixtures();
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

    private void initRefreshableFixtures() {
        long suffix = System.nanoTime();

        primaryCompany = busCompanyRepository.save(BusCompany.builder()
                .name("Phương Trang FUTA Express " + suffix)
                .code("FUTA-" + suffix)
                .hotline("19006067")
                .email("futa@traveleasy.vn")
                .address("272 Đề Thám, Quận 1, TP. Hồ Chí Minh")
                .averageRating(BigDecimal.valueOf(4.9))
                .status("ACTIVE")
                .build());

        rivalCompany = busCompanyRepository.save(BusCompany.builder()
                .name("Thành Bưởi Limousine " + suffix)
                .code("TBL-" + suffix)
                .hotline("19006079")
                .email("thanhbuoi@traveleasy.vn")
                .address("266 Lê Hồng Phong, Quận 5, TP. Hồ Chí Minh")
                .averageRating(BigDecimal.valueOf(4.7))
                .status("ACTIVE")
                .build());

        sampleRoute = routeRepository.save(Route.builder()
                .busCompany(primaryCompany)
                .departureLocation("TP. Hồ Chí Minh")
                .arrivalLocation("Đà Lạt")
                .durationHours(BigDecimal.valueOf(6.5))
                .distanceKm(BigDecimal.valueOf(305.0))
                .build());

        LocalDateTime depTime = LocalDate.now().plusDays(2).atTime(22, 0);
        sampleTrip = tripRepository.save(Trip.builder()
                .busCompany(primaryCompany)
                .route(sampleRoute)
                .departureTime(depTime)
                .arrivalTime(depTime.plusHours(6))
                .busType(BusType.LIMOUSINE)
                .licensePlate("51B-888.99")
                .totalSeats(10)
                .availableSeats(9)
                .price(BigDecimal.valueOf(350000.00))
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
                    .seatType("LIMOUSINE_VIP")
                    .status(i == 1 ? SeatStatus.BOOKED : SeatStatus.AVAILABLE)
                    .build());
        }
        tripSeatRepository.saveAll(seats);
    }

    /**
     * DoD 1: Kiểm thử luồng chính khóa ghế thành công (/api/seat-locks),
     * đồng bộ giá vé, thời gian đếm ngược 10 phút (600s), số ghế và trạng thái LOCKED giữa dịch vụ và giao diện.
     */
    @Test
    @Order(1)
    @DisplayName("DoD 1: Khóa ghế thành công qua /api/seat-locks và đồng bộ nhất quán giá, thời gian, trạng thái")
    void testLockSeats_SuccessAndDataConsistency() throws Exception {
        // 1. Khi chưa có khóa ghế tạm thời -> Danh sách khóa đang hoạt động trả về rỗng []
        mockMvc.perform(get("/api/seat-locks")
                        .param("tripId", sampleTrip.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(0)));

        // 2. Khách hàng A khóa 2 ghế A02, A03 với phiên sess-customer-01
        SeatHoldRequest holdRequest = SeatHoldRequest.builder()
                .tripId(sampleTrip.getId())
                .seatCodes(List.of("A02", "A03"))
                .sessionId("sess-customer-01")
                .build();

        mockMvc.perform(post("/api/seat-locks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(holdRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].tripId").value(sampleTrip.getId()))
                .andExpect(jsonPath("$.data[0].seatNumber").value("A02"))
                .andExpect(jsonPath("$.data[0].status").value("LOCKED"))
                .andExpect(jsonPath("$.data[0].holderSessionId").value("sess-customer-01"))
                .andExpect(jsonPath("$.data[0].price").value(350000.0))
                .andExpect(jsonPath("$.data[0].ttlSeconds").value(600))
                .andExpect(jsonPath("$.data[0].expiresAt").isNotEmpty());

        // 3. Kiểm tra đồng nhất giữa /api/seat-locks và /api/v1/trips/{id} (API chi tiết sơ đồ ghế giao diện)
        mockMvc.perform(get("/api/seat-locks")
                        .param("tripId", sampleTrip.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].seatNumber").value("A02"))
                .andExpect(jsonPath("$.data[0].status").value("LOCKED"))
                .andExpect(jsonPath("$.data[0].price").value(350000.0));

        mockMvc.perform(get("/api/v1/trips/{id}", sampleTrip.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.trip.price").value(350000.0))
                .andExpect(jsonPath("$.data.seats[?(@.seatNumber == 'A02')].status", contains("LOCKED")))
                .andExpect(jsonPath("$.data.seats[?(@.seatNumber == 'A03')].status", contains("LOCKED")))
                .andExpect(jsonPath("$.data.seats[?(@.seatNumber == 'A04')].status", contains("AVAILABLE")));
    }

    /**
     * DoD 2: Xử lý thao tác lặp (Idempotent retry bởi cùng một sessionId)
     * và bảo đảm tính nguyên tử khi một ghế trong danh sách bị xung đột (không để lại trạng thái dở dang).
     */
    @Test
    @Order(2)
    @DisplayName("DoD 2: Thao tác lặp cùng phiên (Idempotent) và chống để lại trạng thái dở dang khi xung đột lô ghế")
    void testIdempotentHold_AndAtomicRollbackOnPartialConflict() throws Exception {
        SeatHoldRequest holdRequestA = SeatHoldRequest.builder()
                .tripId(sampleTrip.getId())
                .seatCodes(List.of("A02"))
                .sessionId("sess-holder-A")
                .build();

        // Lần 1: Phiên A giữ ghế A02
        mockMvc.perform(post("/api/seat-locks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(holdRequestA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].status").value("LOCKED"));

        // Lần 2 (Thao tác lặp cùng phiên A): Gửi lại yêu cầu giữ ghế A02 -> Thành công làm mới khóa, không báo lỗi
        mockMvc.perform(post("/api/seat-locks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(holdRequestA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].seatNumber").value("A02"))
                .andExpect(jsonPath("$.data[0].holderSessionId").value("sess-holder-A"));

        // Phiên B cố gắng giữ cặp ghế ["A05", "A02"] (trong đó A05 đang AVAILABLE, còn A02 đang bị A giữ)
        SeatHoldRequest conflictingBatch = SeatHoldRequest.builder()
                .tripId(sampleTrip.getId())
                .seatCodes(List.of("A05", "A02"))
                .sessionId("sess-intruder-B")
                .build();

        mockMvc.perform(post("/api/seat-locks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(conflictingBatch)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("A02")));

        // Xác nhận ghế A05 KHÔNG bị treo dở dang ở trạng thái LOCKED mà vẫn là AVAILABLE
        TripSeat seatA05 = tripSeatRepository.findByTripIdAndSeatCode(sampleTrip.getId(), "A05").orElseThrow();
        assertEquals(SeatStatus.AVAILABLE, seatA05.getStatus(), "Ghế A05 phải giữ nguyên trạng thái AVAILABLE khi giao dịch lô ghế bị từ chối");
    }

    /**
     * DoD 3: Kiểm thử tranh chấp đồng thời (Concurrency contention)
     * Nhiều luồng khách hàng cùng gửi yêu cầu khóa 1 ghế tại cùng 1 thời điểm -> Đúng 1 luồng thành công, các luồng còn lại nhận 409 Conflict.
     */
    @Test
    @Order(3)
    @DisplayName("DoD 3: Cạnh tranh đồng thời (Multi-thread Race Condition) — Chỉ duy nhất 1 khách hàng khóa được ghế")
    void testConcurrentSeatLocking_OnlyOneSucceeds() throws Exception {
        int threadCount = 8;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        List<String> winningSessions = Collections.synchronizedList(new ArrayList<>());

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < threadCount; i++) {
            final String sessionId = "concurrent-sess-" + i;
            futures.add(executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await(5, TimeUnit.SECONDS);
                    SeatHoldRequest req = SeatHoldRequest.builder()
                            .tripId(sampleTrip.getId())
                            .seatCodes(List.of("A06"))
                            .sessionId(sessionId)
                            .build();

                    int httpStatus = mockMvc.perform(post("/api/seat-locks")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(req)))
                            .andReturn()
                            .getResponse()
                            .getStatus();

                    if (httpStatus == 200) {
                        successCount.incrementAndGet();
                        winningSessions.add(sessionId);
                    } else if (httpStatus == 409 || httpStatus == 400) {
                        conflictCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    conflictCount.incrementAndGet();
                }
            }));
        }

        readyLatch.await(5, TimeUnit.SECONDS);
        startLatch.countDown(); // Xuất phát đồng loạt
        for (Future<?> f : futures) {
            f.get(10, TimeUnit.SECONDS);
        }
        executor.shutdownNow();

        assertEquals(1, successCount.get(), "Phải có đúng 1 yêu cầu khóa ghế thành công trong điều kiện tranh chấp đồng thời");
        assertEquals(threadCount - 1, conflictCount.get(), "Tất cả các yêu cầu cạnh tranh còn lại phải bị từ chối rõ ràng");
        assertEquals(1, winningSessions.size());

        TripSeat lockedSeat = tripSeatRepository.findByTripIdAndSeatCode(sampleTrip.getId(), "A06").orElseThrow();
        assertEquals(SeatStatus.LOCKED, lockedSeat.getStatus());
    }

    /**
     * DoD 4: Kiểm thử luồng hết hạn khóa ghế (TTL Expiry & Auto-Cleanup)
     * Sau khi khóa ghế hết hạn, ghế tự động trở về AVAILABLE và khách hàng khác có thể khóa/đặt hợp lệ.
     */
    @Test
    @Order(4)
    @DisplayName("DoD 4: Luồng hết hạn khóa ghế (TTL Expiration) tự động giải phóng về AVAILABLE cho khách mới")
    void testSeatLockExpiration_AndReacquisitionByAnotherCustomer() throws Exception {
        // 1. Khách hàng 1 khóa ghế A07 với TTL 1 giây
        SeatHoldRequest shortHold = SeatHoldRequest.builder()
                .tripId(sampleTrip.getId())
                .seatCodes(List.of("A07"))
                .sessionId("sess-short-ttl")
                .ttlSeconds(1)
                .build();

        mockMvc.perform(post("/api/seat-locks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shortHold)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].status").value("LOCKED"))
                .andExpect(jsonPath("$.data[0].ttlSeconds").value(1));

        // 2. Chờ quá hạn 1.2 giây để TTL hết hiệu lực
        Thread.sleep(1200);

        // 3. Khách hàng 2 vào khóa ghế A07 -> Hệ thống tự động dọn khóa hết hạn của Khách 1 và cấp khóa mới cho Khách 2
        SeatHoldRequest newCustomerHold = SeatHoldRequest.builder()
                .tripId(sampleTrip.getId())
                .seatCodes(List.of("A07"))
                .sessionId("sess-new-customer")
                .ttlSeconds(600)
                .build();

        mockMvc.perform(post("/api/seat-locks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newCustomerHold)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].seatNumber").value("A07"))
                .andExpect(jsonPath("$.data[0].status").value("LOCKED"))
                .andExpect(jsonPath("$.data[0].holderSessionId").value("sess-new-customer"));

        // 4. Kích hoạt API thu hồi khóa hết hạn (/api/seat-locks/expire) và kiểm tra ghế về AVAILABLE
        mockMvc.perform(post("/api/seat-locks/expire")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(SeatHoldRequest.builder()
                                .tripId(sampleTrip.getId())
                                .seatCodes(List.of("A07"))
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].seatNumber").value("A07"))
                .andExpect(jsonPath("$.data[0].status").value("AVAILABLE"));

        TripSeat seatAfterExpire = tripSeatRepository.findByTripIdAndSeatCode(sampleTrip.getId(), "A07").orElseThrow();
        assertEquals(SeatStatus.AVAILABLE, seatAfterExpire.getStatus());
    }

    /**
     * DoD 5: Chống đặt trùng (Anti-Double-Booking) trên tuyến /api/v1/bookings
     * Không cho phép đặt ghế đang bị giữ bởi phiên khác hoặc ghế đã BOOKED; chỉ cho phép chủ phiên giữ chỗ thanh toán thành công.
     */
    @Test
    @Order(5)
    @DisplayName("DoD 5: Chống đặt trùng — Chặn đặt ghế đang bị người khác giữ chỗ và cho phép chủ phiên hoàn tất đặt vé")
    void testAntiDoubleBooking_BlocksOtherSessionAndAllowsLockOwner() throws Exception {
        // 1. Khách hàng A khóa ghế A08
        SeatHoldRequest holdA = SeatHoldRequest.builder()
                .tripId(sampleTrip.getId())
                .seatCodes(List.of("A08"))
                .sessionId("sess-owner-A08")
                .build();

        mockMvc.perform(post("/api/seat-locks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(holdA)))
                .andExpect(status().isOk());

        // 2. Khách hàng B cố tình gọi API đặt vé (/api/v1/bookings) vào ghế A08 đang bị A khóa -> Bị từ chối 409 Conflict
        CreateBookingRequest intruderBooking = new CreateBookingRequest();
        intruderBooking.setTripId(sampleTrip.getId());
        intruderBooking.setSeatNumbers(List.of("A08"));
        intruderBooking.setCustomerName("Trần Văn B");
        intruderBooking.setCustomerPhone("0988111222");
        intruderBooking.setCustomerEmail("b.tran@example.com");
        intruderBooking.setPaymentMethod(PaymentMethod.COD);
        intruderBooking.setSessionId("sess-intruder-B08");

        mockMvc.perform(post("/api/v1/bookings")
                        .with(SecurityMockMvcRequestPostProcessors.user("b.tran@example.com").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(intruderBooking)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("A08")));

        // 3. Khách hàng A (đúng chủ phiên sess-owner-A08) thực hiện đặt vé -> Thành công 200 OK
        CreateBookingRequest ownerBooking = new CreateBookingRequest();
        ownerBooking.setTripId(sampleTrip.getId());
        ownerBooking.setSeatNumbers(List.of("A08"));
        ownerBooking.setCustomerName("Nguyễn Văn A");
        ownerBooking.setCustomerPhone("0912333444");
        ownerBooking.setCustomerEmail("a.nguyen@example.com");
        ownerBooking.setPaymentMethod(PaymentMethod.COD);
        ownerBooking.setSessionId("sess-owner-A08");

        mockMvc.perform(post("/api/v1/bookings")
                        .with(SecurityMockMvcRequestPostProcessors.user("a.nguyen@example.com").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ownerBooking)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.tickets[0].seatNumber").value("A08"))
                .andExpect(jsonPath("$.data.totalAmount").value(350000.0));

        // 4. Sau khi ghế A08 đã chuyển sang BOOKED, mọi yêu cầu khóa lại ghế A08 đều bị chặn với 409 Conflict
        mockMvc.perform(post("/api/seat-locks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(SeatHoldRequest.builder()
                                .tripId(sampleTrip.getId())
                                .seatCodes(List.of("A08"))
                                .sessionId("sess-anyone")
                                .build())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("đã có người mua vé")));
    }

    /**
     * DoD 6: Kiểm tra dữ liệu bắt buộc, lỗi phụ thuộc (chuyến hủy, nhà xe tạm ngừng, ghế không tồn tại)
     */
    @Test
    @Order(6)
    @DisplayName("DoD 6: Kiểm tra dữ liệu bắt buộc và xử lý lỗi phụ thuộc rõ ràng (400 / 404 / 409)")
    void testValidationAndDependencyErrors() throws Exception {
        // 6.1 Thiếu tripId -> 400 Bad Request
        mockMvc.perform(post("/api/seat-locks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(SeatHoldRequest.builder()
                                .seatCodes(List.of("A09"))
                                .sessionId("sess-01")
                                .build())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("tripId")));

        // 6.2 Danh sách seatCodes rỗng -> 400 Bad Request
        mockMvc.perform(post("/api/seat-locks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(SeatHoldRequest.builder()
                                .tripId(sampleTrip.getId())
                                .seatCodes(Collections.emptyList())
                                .sessionId("sess-01")
                                .build())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        // 6.3 Thiếu sessionId -> 400 Bad Request
        mockMvc.perform(post("/api/seat-locks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(SeatHoldRequest.builder()
                                .tripId(sampleTrip.getId())
                                .seatCodes(List.of("A09"))
                                .sessionId("   ")
                                .build())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        // 6.4 Chuyến xe không tồn tại -> 404 Not Found
        mockMvc.perform(post("/api/seat-locks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(SeatHoldRequest.builder()
                                .tripId(999999L)
                                .seatCodes(List.of("A09"))
                                .sessionId("sess-01")
                                .build())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));

        // 6.5 Mã ghế không tồn tại trên chuyến xe -> 404 Not Found
        mockMvc.perform(post("/api/seat-locks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(SeatHoldRequest.builder()
                                .tripId(sampleTrip.getId())
                                .seatCodes(List.of("Z99"))
                                .sessionId("sess-01")
                                .build())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));

        // 6.6 Khóa ghế đã BOOKED sẵn (A01) -> 409 Conflict
        mockMvc.perform(post("/api/seat-locks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(SeatHoldRequest.builder()
                                .tripId(sampleTrip.getId())
                                .seatCodes(List.of("A01"))
                                .sessionId("sess-01")
                                .build())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));

        // 6.7 Chuyến xe đã bị CANCELLED -> 400 Bad Request
        sampleTrip.setStatus(TripStatus.CANCELLED);
        tripRepository.save(sampleTrip);

        mockMvc.perform(post("/api/seat-locks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(SeatHoldRequest.builder()
                                .tripId(sampleTrip.getId())
                                .seatCodes(List.of("A09"))
                                .sessionId("sess-01")
                                .build())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("không còn mở bán")));
    }

    /**
     * DoD 7: Kiểm tra phân quyền theo vai trò (Role-based Access Control), bảo vệ phiên giữ chỗ
     * và cô lập phạm vi nhà xe (Multi-tenant Company Scope) khi giải phóng khóa ghế.
     */
    @Test
    @Order(7)
    @DisplayName("DoD 7: Phân quyền theo vai trò (401/403) và cô lập phạm vi nhà xe khi giải phóng khóa ghế")
    void testRoleAuthorizationAndCompanyScopeIsolation() throws Exception {
        // 1. Khách hàng A giữ ghế A10
        mockMvc.perform(post("/api/seat-locks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(SeatHoldRequest.builder()
                                .tripId(sampleTrip.getId())
                                .seatCodes(List.of("A10"))
                                .sessionId("sess-victim-A10")
                                .build())))
                .andExpect(status().isOk());

        // 2. Khách hàng khác (sess-hacker) cố tình gọi /api/seat-locks/release để nhả ghế của A -> 403 Forbidden
        mockMvc.perform(post("/api/seat-locks/release")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(SeatHoldRequest.builder()
                                .tripId(sampleTrip.getId())
                                .seatCodes(List.of("A10"))
                                .sessionId("sess-hacker")
                                .build())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));

        // 3. Gọi API cưỡng chế giải phóng (/api/seat-locks/force-release) khi chưa đăng nhập -> 401 Unauthorized
        SeatHoldRequest forceReq = SeatHoldRequest.builder()
                .tripId(sampleTrip.getId())
                .seatCodes(List.of("A10"))
                .build();

        mockMvc.perform(post("/api/seat-locks/force-release")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(forceReq)))
                .andExpect(status().isUnauthorized());

        // 4. Gọi API cưỡng chế giải phóng với vai trò CUSTOMER -> 403 Forbidden
        mockMvc.perform(post("/api/seat-locks/force-release")
                        .with(SecurityMockMvcRequestPostProcessors.user("customer_user").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(forceReq)))
                .andExpect(status().isForbidden());

        // 5. Nhà xe đối thủ (rivalCompany) gọi force-release vào chuyến của primaryCompany -> 403 Forbidden (Cô lập phạm vi nhà xe)
        mockMvc.perform(post("/api/seat-locks/force-release")
                        .with(SecurityMockMvcRequestPostProcessors.user("rival_operator").roles("COMPANY"))
                        .header("X-Company-Id", rivalCompany.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(forceReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("không có quyền can thiệp")));

        // 6. Nhà xe sở hữu chuyến (primaryCompany) hoặc ADMIN thực hiện giải phóng -> 200 OK
        mockMvc.perform(post("/api/seat-locks/force-release")
                        .with(SecurityMockMvcRequestPostProcessors.user("futa_operator").roles("COMPANY"))
                        .header("X-Company-Id", primaryCompany.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(forceReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].seatNumber").value("A10"))
                .andExpect(jsonPath("$.data[0].status").value("AVAILABLE"));
    }
}

