package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.security.CompanySecurityService;
import com.traveleasy.entity.*;
import com.traveleasy.repository.BookingRepository;
import com.traveleasy.repository.PromotionRepository;
import com.traveleasy.repository.TicketRepository;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.repository.TripSeatRepository;
import com.traveleasy.service.realtime.SeatRealtimeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * [S321] Unit Test cho phân hệ Quản lý Biểu Phí & Tính Tiền Hoàn Hủy Vé Tự Động
 * @author Nguyễn Đại Phát (daiphat)
 */
@ExtendWith(MockitoExtension.class)
class CompanyCancellationRefundControllerTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PromotionRepository promotionRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TripSeatRepository tripSeatRepository;

    @Mock
    private SeatRealtimeService seatRealtimeService;

    @Mock
    private CompanySecurityService securityService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private CompanyCancellationRefundController controller;

    private BusCompany testCompany;
    private Trip testTrip;
    private Booking testBooking;
    private Ticket testTicket;
    private TripSeat testSeat;

    @BeforeEach
    void setUp() {
        User staff = User.builder().busCompanyId(14L).staffRole(StaffRole.OWNER).build();
        lenient().when(securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER, StaffRole.DISPATCHER))
                .thenReturn(staff);
        lenient().when(securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER))
                .thenReturn(staff);
        testCompany = BusCompany.builder().id(14L).name("Phương Trang").build();
        testTrip = Trip.builder()
                .id(100L)
                .busCompany(testCompany)
                .departureTime(LocalDateTime.now().plusHours(30))
                .availableSeats(20)
                .totalSeats(34)
                .build();
        testTicket = Ticket.builder()
                .id(200L)
                .ticketCode("TK-REFUND-01")
                .seatNumber("A05")
                .price(BigDecimal.valueOf(400000))
                .status(TicketStatus.ISSUED)
                .build();
        testBooking = Booking.builder()
                .id(50L)
                .bookingCode("BK-REFUND-01")
                .trip(testTrip)
                .passengerName("Nguyễn Văn Khách")
                .passengerPhone("0988776655")
                .tickets(new java.util.ArrayList<>(List.of(testTicket)))
                .build();
        testTicket.setBooking(testBooking);
        testSeat = TripSeat.builder()
                .id(500L)
                .trip(testTrip)
                .seatCode("A05")
                .status(SeatStatus.BOOKED)
                .build();
    }

    @Test
    @DisplayName("TC-01: Lấy danh sách 4 bậc thang biểu phí hoàn hủy vé")
    void testGetRefundRules_Success() {
        ApiResponse<List<Map<String, Object>>> res = controller.getRefundRules(14L);
        assertNotNull(res);
        assertTrue(res.isSuccess());
        assertEquals(4, res.getData().size());
    }

    @Test
    @DisplayName("TC-02: Tính tiền hoàn trước 30h (>24h): Khấu trừ 10%, hoàn 90%, chia 80/20 tiền phạt")
    void testCalculateRefund_Before24Hours_Fee10Percent() {
        when(ticketRepository.findByTicketCode("TK-REFUND-01")).thenReturn(Optional.of(testTicket));

        ApiResponse<Map<String, Object>> res = controller.calculateRefundAmount("TK-REFUND-01", 30, authentication);
        assertNotNull(res);
        assertTrue(res.isSuccess());
        Map<String, Object> data = res.getData();

        assertEquals(10, data.get("cancellationFeePercent"));
        assertEquals(BigDecimal.valueOf(40000).setScale(2), data.get("cancellationFee"));
        assertEquals(BigDecimal.valueOf(360000).setScale(2), data.get("refundAmountToCustomer"));
        // 80% của 40,000 là 32,000 cho nhà xe
        assertEquals(BigDecimal.valueOf(32000).setScale(2), data.get("busCompanyPenaltyRevenue"));
        // 20% của 40,000 là 8,000 cho sàn
        assertEquals(BigDecimal.valueOf(8000).setScale(2), data.get("platformServiceFeeRevenue"));
    }

    @Test
    @DisplayName("TC-03: Tính tiền hoàn từ 12h-24h (18h): Khấu trừ 30%, hoàn 70%")
    void testCalculateRefund_Between12And24Hours_Fee30Percent() {
        when(ticketRepository.findByTicketCode("TK-REFUND-01")).thenReturn(Optional.of(testTicket));

        ApiResponse<Map<String, Object>> res = controller.calculateRefundAmount("TK-REFUND-01", 18, authentication);
        Map<String, Object> data = res.getData();

        assertEquals(30, data.get("cancellationFeePercent"));
        assertEquals(BigDecimal.valueOf(120000).setScale(2), data.get("cancellationFee"));
        assertEquals(BigDecimal.valueOf(280000).setScale(2), data.get("refundAmountToCustomer"));
        assertEquals(BigDecimal.valueOf(96000).setScale(2), data.get("busCompanyPenaltyRevenue"));
    }

    @Test
    @DisplayName("TC-04: Tính tiền hoàn từ 2h-12h (5h): Khấu trừ 50%, hoàn 50%")
    void testCalculateRefund_Between2And12Hours_Fee50Percent() {
        when(ticketRepository.findByTicketCode("TK-REFUND-01")).thenReturn(Optional.of(testTicket));

        ApiResponse<Map<String, Object>> res = controller.calculateRefundAmount("TK-REFUND-01", 5, authentication);
        Map<String, Object> data = res.getData();

        assertEquals(50, data.get("cancellationFeePercent"));
        assertEquals(BigDecimal.valueOf(200000).setScale(2), data.get("cancellationFee"));
        assertEquals(BigDecimal.valueOf(200000).setScale(2), data.get("refundAmountToCustomer"));
    }

    @Test
    @DisplayName("TC-05: Tính tiền hoàn sát giờ (<2h): Khấu trừ 100%, không hoàn tiền")
    void testCalculateRefund_Under2Hours_Fee100Percent() {
        when(ticketRepository.findByTicketCode("TK-REFUND-01")).thenReturn(Optional.of(testTicket));

        ApiResponse<Map<String, Object>> res = controller.calculateRefundAmount("TK-REFUND-01", 1, authentication);
        Map<String, Object> data = res.getData();

        assertEquals(100, data.get("cancellationFeePercent"));
        assertEquals(BigDecimal.valueOf(400000).setScale(2), data.get("cancellationFee"));
        assertEquals(BigDecimal.ZERO.setScale(2), data.get("refundAmountToCustomer"));
    }

    @Test
    @DisplayName("TC-06: Xác nhận hoàn tiền: Vé chuyển sang CANCELLED, mở lại ghế AVAILABLE và phát WebSocket")
    void testConfirmRefund_Success() {
        when(ticketRepository.findByTicketCodeForUpdate("TK-REFUND-01")).thenReturn(Optional.of(testTicket));
        when(tripSeatRepository.findByTripIdAndSeatCode(100L, "A05")).thenReturn(Optional.of(testSeat));

        ApiResponse<Map<String, Object>> res = controller.confirmRefund(Map.of("ticketCode", "TK-REFUND-01"), authentication);

        assertNotNull(res);
        assertTrue(res.isSuccess());
        assertEquals("CANCELLED", testTicket.getStatus().name());
        assertEquals("PENDING", res.getData().get("refundStatus"));
        assertNull(testTicket.getRefundRecordedAt());
        assertEquals(SeatStatus.AVAILABLE, testSeat.getStatus());

        verify(ticketRepository, times(1)).save(testTicket);
        verify(bookingRepository, times(1)).save(testBooking);
        verify(tripSeatRepository, times(1)).save(testSeat);
        verify(seatRealtimeService, times(1)).broadcastReleased(eq(100L), eq(List.of("A05")));
        verify(tripRepository, times(1)).syncAvailableSeats(eq(100L));
    }

    @Test
    @DisplayName("TC-07: Từ chối hủy vé khi vé đã USED (hành khách đã lên xe)")
    void testConfirmRefund_UsedTicket_ThrowsException() {
        testTicket.setStatus(TicketStatus.USED);
        when(ticketRepository.findByTicketCodeForUpdate("TK-REFUND-01")).thenReturn(Optional.of(testTicket));

        assertThrows(AppException.class, () ->
                controller.confirmRefund(Map.of("ticketCode", "TK-REFUND-01"), authentication)
        );
        verify(ticketRepository, never()).save(any());
        verify(seatRealtimeService, never()).broadcastReleased(anyLong(), anyList());
    }

    @Test
    @DisplayName("TC-08: Từ chối hủy vé khi vé đã CANCELLED trước đó")
    void testConfirmRefund_AlreadyCancelled_ThrowsException() {
        testTicket.setStatus(TicketStatus.CANCELLED);
        when(ticketRepository.findByTicketCodeForUpdate("TK-REFUND-01")).thenReturn(Optional.of(testTicket));

        assertThrows(AppException.class, () ->
                controller.confirmRefund(Map.of("ticketCode", "TK-REFUND-01"), authentication)
        );
    }

    @Test
    void confirmedTransferKeepsSnapshotAfterDepartureAndRetry() {
        when(ticketRepository.findByTicketCodeForUpdate("TK-REFUND-01")).thenReturn(Optional.of(testTicket));
        when(ticketRepository.findByBookingTripBusCompanyId(14L)).thenReturn(List.of(testTicket));
        when(authentication.getName()).thenReturn("cashier@example.com");
        controller.confirmRefund(Map.of("ticketCode", "TK-REFUND-01"), authentication);
        testTrip.setDepartureTime(LocalDateTime.now().minusDays(1));

        Map<String, Object> pending = controller.getRefundRequests(null, null, null, authentication).getData().get(0);
        assertEquals(10, pending.get("cancellationFeePercent"));
        assertEquals(new BigDecimal("360000.00"), pending.get("refundAmount"));
        assertEquals("PENDING", pending.get("refundStatus"));

        Map<String, String> transfer = Map.of("ticketCode", "TK-REFUND-01", "txCode", "BANK-123");
        Map<String, Object> confirmed = controller.confirmTransfer(transfer, authentication).getData();
        LocalDateTime recordedAt = testTicket.getRefundRecordedAt();
        controller.confirmTransfer(transfer, authentication);

        assertEquals("REFUNDED", confirmed.get("refundStatus"));
        assertEquals("BANK-123", confirmed.get("refundTransferCode"));
        assertEquals(new BigDecimal("32000.00"), testTicket.getRefundPartnerCredit());
        assertEquals(recordedAt, testTicket.getRefundRecordedAt());
        verify(ticketRepository, times(2)).save(testTicket);
    }

    @Test
    void zeroRefundRecordsOnlyPenalty() {
        when(ticketRepository.findByTicketCodeForUpdate("TK-REFUND-01")).thenReturn(Optional.of(testTicket));
        when(authentication.getName()).thenReturn("cashier@example.com");
        testTrip.setDepartureTime(LocalDateTime.now().plusHours(1));

        Map<String, Object> data = controller.confirmRefund(Map.of("ticketCode", "TK-REFUND-01"), authentication).getData();

        assertEquals("NO_REFUND", data.get("refundStatus"));
        assertEquals(false, data.get("canConfirmTransfer"));
        assertEquals(new BigDecimal("0.00"), data.get("refundAmount"));
        assertEquals(new BigDecimal("320000.00"), testTicket.getRefundPartnerCredit());
        assertNull(testTicket.getRefundTransferCode());
    }

    @Test
    void partialCancellationKeepsOtherTicketAndCannotConsumeBookingRefund() {
        Ticket other = Ticket.builder().id(201L).seatNumber("A06").booking(testBooking)
                .price(new BigDecimal("400000.00")).build();
        testBooking.getTickets().add(other);
        testBooking.setStatus(BookingStatus.CONFIRMED);
        testBooking.setRefundStatus("NONE");
        when(ticketRepository.findByTicketCodeForUpdate("TK-REFUND-01")).thenReturn(Optional.of(testTicket));
        controller.confirmRefund(Map.of("ticketCode", "TK-REFUND-01"), authentication);
        controller.confirmTransfer(Map.of("ticketCode", "TK-REFUND-01", "txCode", "BANK-123"), authentication);

        assertEquals(BookingStatus.CONFIRMED, testBooking.getStatus());
        assertEquals("A06", testBooking.getSeatNumbers());
        assertEquals(TicketStatus.ISSUED, other.getStatus());
        assertNull(other.getRefundRecordedAt());
        assertEquals("NONE", testBooking.getRefundStatus());
    }
}
