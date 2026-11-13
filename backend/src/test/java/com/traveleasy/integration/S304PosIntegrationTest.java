package com.traveleasy.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.traveleasy.dto.pos.PosCloseShiftRequest;
import com.traveleasy.dto.pos.PosIssueTicketRequest;
import com.traveleasy.dto.pos.PosOpenShiftRequest;
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
 * S304PosIntegrationTest
 * ============================================================================
 * KIỂM THỬ TÍCH HỢP BÁN VÉ NHANH TẠI QUẦY BẾN XE POS (/company/pos) & IN VÉ NHIỆT 80MM
 * Thẻ Trello: [S304][POS]
 * Phụ trách: Phạm Thanh Phong
 * ============================================================================
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class S304PosIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BusCompanyRepository busCompanyRepository;

    @Autowired
    private UserRepository userRepository;

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

    @Autowired
    private CompanyPosShiftRepository posShiftRepository;

    private BusCompany futaCompany;
    private BusCompany otherCompany;
    private User cashierUser;
    private User dispatcherUser;
    private Trip sampleTrip;
    private Trip otherCompanyTrip;

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
        posShiftRepository.deleteAllInBatch();
        tripSeatRepository.deleteAllInBatch();
        tripRepository.deleteAllInBatch();
        pointRepository.deleteAllInBatch();
        routeRepository.deleteAllInBatch();
        vehicleRepository.deleteAllInBatch();
        userRepository.findByEmail("cashier.pos@futa.vn").ifPresent(userRepository::delete);
        userRepository.findByEmail("dispatcher.pos@futa.vn").ifPresent(userRepository::delete);
        if (futaCompany != null && futaCompany.getId() != null) {
            busCompanyRepository.deleteById(futaCompany.getId());
            futaCompany = null;
        }
        if (otherCompany != null && otherCompany.getId() != null) {
            busCompanyRepository.deleteById(otherCompany.getId());
            otherCompany = null;
        }
    }

    private void initFixtures() {
        futaCompany = busCompanyRepository.save(BusCompany.builder()
                .name("Phương Trang FUTA Bus Lines")
                .code("FUTA-S304")
                .hotline("19006067")
                .email("pos@futa.vn")
                .address("Bến Xe Miền Đông Mới, TP. Thủ Đức")
                .averageRating(BigDecimal.valueOf(4.9))
                .status("ACTIVE")
                .build());

        otherCompany = busCompanyRepository.save(BusCompany.builder()
                .name("Thành Bưởi Bus Lines")
                .code("TB-S304")
                .hotline("19006079")
                .email("pos@thanhbuoi.vn")
                .address("266 Lê Hồng Phong, Quận 5")
                .averageRating(BigDecimal.valueOf(4.7))
                .status("ACTIVE")
                .build());

        cashierUser = userRepository.save(User.builder()
                .email("cashier.pos@futa.vn")
                .password("encoded-password")
                .fullName("Phạm Thanh Phong (Thu Ngân POS)")
                .phone("0901234567")
                .role(Role.OPERATOR)
                .busCompanyId(futaCompany.getId())
                .staffRole(StaffRole.CASHIER)
                .status("ACTIVE")
                .build());

        dispatcherUser = userRepository.save(User.builder()
                .email("dispatcher.pos@futa.vn")
                .password("encoded-password")
                .fullName("Điều Phối Viên Bến Xe")
                .phone("0909998888")
                .role(Role.OPERATOR)
                .busCompanyId(futaCompany.getId())
                .staffRole(StaffRole.DISPATCHER)
                .status("ACTIVE")
                .build());

        Route route = routeRepository.save(Route.builder()
                .busCompany(futaCompany)
                .departureLocation("Bến Xe Miền Đông")
                .arrivalLocation("Đà Lạt")
                .durationHours(BigDecimal.valueOf(6.5))
                .distanceKm(BigDecimal.valueOf(310.0))
                .build());

        LocalDateTime depTime = LocalDate.now().plusDays(1).atTime(22, 0);
        sampleTrip = tripRepository.save(Trip.builder()
                .busCompany(futaCompany)
                .route(route)
                .departureTime(depTime)
                .arrivalTime(depTime.plusHours(6).plusMinutes(30))
                .busType(BusType.LIMOUSINE)
                .licensePlate("51B-304.88")
                .totalSeats(22)
                .availableSeats(5)
                .price(BigDecimal.valueOf(350000))
                .status(TripStatus.SCHEDULED)
                .isActive(true)
                .build());

        for (String code : List.of("A01", "A02", "A03", "B01", "B02")) {
            tripSeatRepository.save(TripSeat.builder()
                    .trip(sampleTrip)
                    .seatCode(code)
                    .floor(code.startsWith("A") ? 1 : 2)
                    .seatType("SLEEPER")
                    .status(SeatStatus.AVAILABLE)
                    .build());
        }

        tripSeatRepository.save(TripSeat.builder()
                .trip(sampleTrip)
                .seatCode("A04")
                .floor(1)
                .seatType("SLEEPER")
                .status(SeatStatus.LOCKED)
                .build());

        Route otherRoute = routeRepository.save(Route.builder()
                .busCompany(otherCompany)
                .departureLocation("Bến Xe Miền Tây")
                .arrivalLocation("Cần Thơ")
                .durationHours(BigDecimal.valueOf(3.5))
                .distanceKm(BigDecimal.valueOf(165.0))
                .build());

        otherCompanyTrip = tripRepository.save(Trip.builder()
                .busCompany(otherCompany)
                .route(otherRoute)
                .departureTime(depTime)
                .arrivalTime(depTime.plusHours(3).plusMinutes(30))
                .busType(BusType.SLEEPER)
                .licensePlate("51B-999.99")
                .totalSeats(34)
                .availableSeats(1)
                .price(BigDecimal.valueOf(180000))
                .status(TripStatus.SCHEDULED)
                .isActive(true)
                .build());

        tripSeatRepository.save(TripSeat.builder()
                .trip(otherCompanyTrip)
                .seatCode("A01")
                .floor(1)
                .seatType("SLEEPER")
                .status(SeatStatus.AVAILABLE)
                .build());
    }

    /**
     * DoD 1: Mở ca trực POS, xuất vé nhanh dưới 10 giây, in hóa đơn nhiệt 80mm kèm mã QR và cộng dồn doanh thu ca
     */
    @Test
    @Order(1)
    @DisplayName("DoD 1: Mở ca POS, xuất vé nhanh, trả về hóa đơn nhiệt 80mm có QR bảo mật và đồng bộ ghế BOOKED tức thì")
    void testOpenShift_IssuePosTicket_AndVerify80mmThermalReceipt() throws Exception {
        // 1. Mở ca trực tại Bến Xe Miền Đông
        PosOpenShiftRequest openReq = PosOpenShiftRequest.builder()
                .counterName("Quầy POS 01 - Bến Xe Miền Đông")
                .terminalLocationId(1L)
                .initialCashAmount(BigDecimal.valueOf(2000000))
                .notes("Ca sáng BXMĐ")
                .build();

        MvcResult openRes = mockMvc.perform(post("/api/v1/company/pos/shifts/open")
                        .with(SecurityMockMvcRequestPostProcessors.user(cashierUser.getEmail()).roles("COMPANY"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(openReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("OPEN"))
                .andExpect(jsonPath("$.data.counterName").value("Quầy POS 01 - Bến Xe Miền Đông"))
                .andExpect(jsonPath("$.data.initialCashAmount").value(2000000))
                .andReturn();

        JsonNode shiftJson = objectMapper.readTree(openRes.getResponse().getContentAsString()).get("data");
        long shiftId = shiftJson.get("shiftId").asLong();

        // 2. Xuất 2 vé (ghế B01, A01) thanh toán tiền mặt (khách đưa 1,000,000đ cho tổng 700,000đ -> tiền thối 300,000đ)
        PosIssueTicketRequest issueReq = PosIssueTicketRequest.builder()
                .tripId(sampleTrip.getId())
                .seatNumbers(List.of("B01", "A01"))
                .customerName("Nguyễn Văn Hành Khách")
                .customerPhone("0912345678")
                .paymentMethod("CASH")
                .cashReceived(BigDecimal.valueOf(1000000))
                .shiftId(shiftId)
                .terminalName("Bến Xe Miền Đông")
                .counterName("Quầy POS 01 - Bến Xe Miền Đông")
                .build();

        mockMvc.perform(post("/api/v1/company/pos/issue-ticket")
                        .with(SecurityMockMvcRequestPostProcessors.user(cashierUser.getEmail()).roles("COMPANY"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(issueReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.receiptWidthMm").value(80))
                .andExpect(jsonPath("$.data.bookingCode", startsWith("BK-POS-")))
                .andExpect(jsonPath("$.data.totalAmount").value(700000))
                .andExpect(jsonPath("$.data.cashReceived").value(1000000))
                .andExpect(jsonPath("$.data.changeAmount").value(300000))
                .andExpect(jsonPath("$.data.seatNumbers", contains("A01", "B01")))
                .andExpect(jsonPath("$.data.tickets", hasSize(2)))
                .andExpect(jsonPath("$.data.tickets[0].ticketCode", startsWith("TK-POS-")))
                .andExpect(jsonPath("$.data.tickets[0].qrCodeHash", startsWith("QR-POS-")))
                .andExpect(jsonPath("$.data.qrCodeHash", startsWith("QR-POS-")));

        // 3. Kiểm tra ghế A01, B01 đã chuyển sang BOOKED và availableSeats giảm từ 5 còn 3
        Trip updatedTrip = tripRepository.findById(sampleTrip.getId()).orElseThrow();
        assertEquals(3, updatedTrip.getAvailableSeats());

        TripSeat seatA01 = tripSeatRepository.findByTripIdAndSeatCode(sampleTrip.getId(), "A01").orElseThrow();
        TripSeat seatB01 = tripSeatRepository.findByTripIdAndSeatCode(sampleTrip.getId(), "B01").orElseThrow();
        assertEquals(SeatStatus.BOOKED, seatA01.getStatus());
        assertEquals(SeatStatus.BOOKED, seatB01.getStatus());

        // 4. Kiểm tra ca trực POS đã cộng dồn nguyên tử doanh thu mặt 700,000đ và 2 vé
        CompanyPosShift updatedShift = posShiftRepository.findById(shiftId).orElseThrow();
        assertEquals(0, BigDecimal.valueOf(700000).compareTo(updatedShift.getTotalCashCollected()));
        assertEquals(2, updatedShift.getTotalTicketsSold());
    }

    /**
     * DoD 2: Kết ca trực POS & xuất phiếu Z-Report tổng kết tiền nộp thủ quỹ, chặn bán vé vào ca đã đóng
     */
    @Test
    @Order(2)
    @DisplayName("DoD 2: Báo cáo doanh số theo ca nhân viên, kết ca Z-Report đối soát tiền mặt và chặn bán vé vào ca CLOSED")
    void testShiftSalesReport_CloseShiftZReport_AndRejectClosedShiftSale() throws Exception {
        CompanyPosShift shift = posShiftRepository.save(CompanyPosShift.builder()
                .busCompanyId(futaCompany.getId())
                .staffUserId(cashierUser.getId())
                .terminalLocationId(2L)
                .counterName("Quầy POS 02 - Bến Xe Miền Tây")
                .initialCashAmount(BigDecimal.valueOf(1500000))
                .totalCashCollected(BigDecimal.valueOf(1050000))
                .totalQrCollected(BigDecimal.valueOf(350000))
                .totalTicketsSold(4)
                .status("OPEN")
                .build());

        // 1. Lấy báo cáo doanh số ca làm việc
        mockMvc.perform(get("/api/v1/company/pos/shifts")
                        .with(SecurityMockMvcRequestPostProcessors.user(cashierUser.getEmail()).roles("COMPANY")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].shiftId").value(shift.getId()))
                .andExpect(jsonPath("$.data[0].totalRevenue").value(1400000))
                .andExpect(jsonPath("$.data[0].expectedCashInDrawer").value(2550000));

        // 2. Kết ca trực & in phiếu Z-Report (tiền kỳ vọng trong két = 1,500,000 + 1,050,000 = 2,550,000đ)
        PosCloseShiftRequest closeReq = PosCloseShiftRequest.builder()
                .countedCashAmount(BigDecimal.valueOf(2550000))
                .notes("Đã kiểm đếm khớp 100%, bàn giao thủ quỹ")
                .build();

        mockMvc.perform(post("/api/v1/company/pos/shifts/{shiftId}/close", shift.getId())
                        .with(SecurityMockMvcRequestPostProcessors.user(cashierUser.getEmail()).roles("COMPANY"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(closeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CLOSED"))
                .andExpect(jsonPath("$.data.auditStatus").value("BALANCED"))
                .andExpect(jsonPath("$.data.cashDiscrepancy").value(0));

        // 3. Cố tình xuất vé mới vào ca đã CLOSED -> Bắt buộc bị chặn 400 Bad Request
        PosIssueTicketRequest closedShiftSaleReq = PosIssueTicketRequest.builder()
                .tripId(sampleTrip.getId())
                .seatNumbers(List.of("A02"))
                .customerName("Khách Mua Sau Khi Kết Ca")
                .customerPhone("0903334444")
                .paymentMethod("CASH")
                .shiftId(shift.getId())
                .build();

        mockMvc.perform(post("/api/v1/company/pos/issue-ticket")
                        .with(SecurityMockMvcRequestPostProcessors.user(cashierUser.getEmail()).roles("COMPANY"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(closedShiftSaleReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("đã đóng")));
    }

    /**
     * DoD 3: Khóa ghế đồng thời tức thì (Multi-thread Concurrency) & chống bán đè ghế đang LOCKED bởi khách Online
     */
    @Test
    @Order(3)
    @DisplayName("DoD 3: Cạnh tranh đồng thời 5 thu ngân cùng bấm xuất ghế A03 và chặn bán đè ghế A04 đang LOCKED")
    void testConcurrentPosIssueTicket_AndRejectLockedSeat() throws Exception {
        // 1. Cố tình xuất vé vào ghế A04 đang được khách giữ chỗ Online (LOCKED) -> 409 Conflict
        PosIssueTicketRequest lockedSeatReq = PosIssueTicketRequest.builder()
                .tripId(sampleTrip.getId())
                .seatNumbers(List.of("A04"))
                .customerName("Khách Vãng Lai")
                .customerPhone("0988777666")
                .paymentMethod("CASH")
                .build();

        mockMvc.perform(post("/api/v1/company/pos/issue-ticket")
                        .with(SecurityMockMvcRequestPostProcessors.user(cashierUser.getEmail()).roles("COMPANY"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lockedSeatReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("A04")));

        // 2. 5 luồng POS đồng thời cùng xuất ghế A03 -> Duy nhất 1 luồng thành công (200 OK), 4 luồng bị từ chối (409)
        int threadCount = 5;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            final int idx = i;
            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await(5, TimeUnit.SECONDS);
                    PosIssueTicketRequest req = PosIssueTicketRequest.builder()
                            .tripId(sampleTrip.getId())
                            .seatNumbers(List.of("A03"))
                            .customerName("Hành Khách Đua Lệnh " + idx)
                            .customerPhone("090555666" + idx)
                            .paymentMethod("QR")
                            .build();
                    MvcResult res = mockMvc.perform(post("/api/v1/company/pos/issue-ticket")
                                    .with(SecurityMockMvcRequestPostProcessors.user(cashierUser.getEmail()).roles("COMPANY"))
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(req)))
                            .andReturn();
                    if (res.getResponse().getStatus() == 200) {
                        successCount.incrementAndGet();
                    } else {
                        conflictCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    conflictCount.incrementAndGet();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        assertTrue(readyLatch.await(5, TimeUnit.SECONDS));
        startLatch.countDown();
        assertTrue(doneLatch.await(10, TimeUnit.SECONDS));
        executor.shutdownNow();

        assertEquals(1, successCount.get(), "Chỉ duy nhất 1 lệnh xuất vé POS cho ghế A03 được phép thành công");
        assertEquals(threadCount - 1, conflictCount.get(), "Các lệnh xuất trùng ghế A03 còn lại phải bị từ chối");
    }

    /**
     * DoD 4: Kiểm soát phân quyền Sub-Account RBAC (chặn DISPATCHER) và chống IDOR chéo nhà xe
     */
    @Test
    @Order(4)
    @DisplayName("DoD 4: Chặn tài khoản DISPATCHER truy cập POS (403 Forbidden) và chặn xuất vé chuyến xe của nhà xe khác")
    void testSubAccountRbac_AndCrossCompanyIdorProtection() throws Exception {
        PosIssueTicketRequest req = PosIssueTicketRequest.builder()
                .tripId(sampleTrip.getId())
                .seatNumbers(List.of("B02"))
                .customerName("Khách Kiểm Thử RBAC")
                .customerPhone("0901112222")
                .paymentMethod("CASH")
                .build();

        // 1. Nhân viên DISPATCHER cố tình xuất vé POS -> 403 Forbidden
        mockMvc.perform(post("/api/v1/company/pos/issue-ticket")
                        .with(SecurityMockMvcRequestPostProcessors.user(dispatcherUser.getEmail()).roles("COMPANY"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));

        // 2. Thu ngân FUTA cố tình xuất vé trên chuyến xe của nhà xe Thành Bưởi -> 403 Forbidden (Chống IDOR)
        PosIssueTicketRequest crossCompanyReq = PosIssueTicketRequest.builder()
                .tripId(otherCompanyTrip.getId())
                .seatNumbers(List.of("A01"))
                .customerName("Khách Kiểm Thử IDOR")
                .customerPhone("0901112222")
                .paymentMethod("CASH")
                .build();

        mockMvc.perform(post("/api/v1/company/pos/issue-ticket")
                        .with(SecurityMockMvcRequestPostProcessors.user(cashierUser.getEmail()).roles("COMPANY"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crossCompanyReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("không thuộc quyền quản lý")));
    }
}

