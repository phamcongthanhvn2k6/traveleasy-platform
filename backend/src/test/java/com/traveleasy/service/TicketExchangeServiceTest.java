package com.traveleasy.service;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.company.exchange.TicketExchangeRequest;
import com.traveleasy.dto.company.exchange.TicketExchangeResponse;
import com.traveleasy.dto.company.exchange.TicketLookupResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import com.traveleasy.service.company.TicketExchangeService;
import com.traveleasy.service.realtime.SeatRealtimeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketExchangeServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TripSeatRepository tripSeatRepository;

    @Mock
    private TicketExchangeLogRepository ticketExchangeLogRepository;

    @Mock
    private SeatRealtimeService seatRealtimeService;

    @InjectMocks
    private TicketExchangeService ticketExchangeService;

    private BusCompany testCompany;
    private BusCompany otherCompany;
    private Route testRoute;
    private Trip oldTrip;
    private Trip newTrip;
    private Booking testBooking;
    private Ticket oldTicket;
    private TripSeat oldSeat;
    private TripSeat newSeat;

    @BeforeEach
    void setUp() {
        testCompany = BusCompany.builder()
                .id(1L)
                .name("Nhà Xe Phương Trang")
                .code("FUTA")
                .hotline("19006067")
                .build();

        otherCompany = BusCompany.builder()
                .id(2L)
                .name("Nhà Xe Thành Bưởi")
                .code("TB")
                .hotline("19001234")
                .build();

        testRoute = Route.builder()
                .id(10L)
                .busCompany(testCompany)
                .departureLocation("TP. Hồ Chí Minh")
                .arrivalLocation("Đà Lạt")
                .durationHours(BigDecimal.valueOf(6.5))
                .build();

        // Chuyến cũ khởi hành sau 24 tiếng (>= 12h hợp lệ)
        oldTrip = Trip.builder()
                .id(101L)
                .busCompany(testCompany)
                .route(testRoute)
                .departureTime(LocalDateTime.now().plusHours(24))
                .price(BigDecimal.valueOf(300000))
                .totalSeats(40)
                .availableSeats(20)
                .build();

        // Chuyến mới khởi hành sau 48 tiếng
        newTrip = Trip.builder()
                .id(102L)
                .busCompany(testCompany)
                .route(testRoute)
                .departureTime(LocalDateTime.now().plusHours(48))
                .price(BigDecimal.valueOf(380000))
                .totalSeats(40)
                .availableSeats(25)
                .build();

        testBooking = Booking.builder()
                .id(501L)
                .bookingCode("BK-20261111-001")
                .trip(oldTrip)
                .passengerName("Nguyễn Văn Du Khách")
                .passengerPhone("0912345678")
                .passengerEmail("khach@gmail.com")
                .seatNumbers("A05")
                .totalAmount(BigDecimal.valueOf(300000))
                .status(BookingStatus.CONFIRMED)
                .build();

        oldTicket = Ticket.builder()
                .id(1001L)
                .booking(testBooking)
                .ticketCode("TK-20261111-01")
                .seatNumber("A05")
                .price(BigDecimal.valueOf(300000))
                .status(TicketStatus.ISSUED)
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();

        oldSeat = TripSeat.builder()
                .id(201L)
                .trip(oldTrip)
                .seatCode("A05")
                .status(SeatStatus.BOOKED)
                .build();

        newSeat = TripSeat.builder()
                .id(202L)
                .trip(newTrip)
                .seatCode("B02")
                .status(SeatStatus.AVAILABLE)
                .build();
    }

    @Test
    @DisplayName("TC-S316-01: Tra cứu vé hợp lệ và đủ điều kiện đổi vé (còn > 12h)")
    void testLookupTicket_Success_MoreThan12Hours() {
        when(ticketRepository.findByTicketCode("TK-20261111-01")).thenReturn(Optional.of(oldTicket));

        TicketLookupResponse response = ticketExchangeService.lookupTicket("TK-20261111-01", 1L);

        assertNotNull(response);
        assertEquals("TK-20261111-01", response.getTicketCode());
        assertEquals("BK-20261111-001", response.getBookingCode());
        assertEquals("A05", response.getSeatNumber());
        assertEquals(BigDecimal.valueOf(300000), response.getPrice());
        assertTrue(response.isCanExchange());
        assertTrue(response.getHoursUntilDeparture() >= 12);
        assertTrue(response.getPolicyNotice().contains("Đủ điều kiện đổi vé"));
    }

    @Test
    @DisplayName("TC-S316-02: Tra cứu vé khởi hành trong vòng < 12h không đủ điều kiện đổi vé")
    void testLookupTicket_LessThan12Hours_CannotExchange() {
        oldTrip.setDepartureTime(LocalDateTime.now().plusHours(5));
        when(ticketRepository.findByTicketCode("TK-20261111-01")).thenReturn(Optional.of(oldTicket));

        TicketLookupResponse response = ticketExchangeService.lookupTicket("TK-20261111-01", 1L);

        assertNotNull(response);
        assertFalse(response.isCanExchange());
        assertTrue(response.getHoursUntilDeparture() < 12);
        assertTrue(response.getPolicyNotice().contains("Không đủ điều kiện đổi vé"));
    }

    @Test
    @DisplayName("TC-S316-03: Tra cứu vé không tồn tại ném lỗi RESOURCE_NOT_FOUND (404)")
    void testLookupTicket_NotFound_ThrowsException() {
        when(ticketRepository.findByTicketCode("TK-UNKNOWN")).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> ticketExchangeService.lookupTicket("TK-UNKNOWN", 1L));
        assertEquals(ErrorCode.RESOURCE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    @DisplayName("TC-S316-04: Tra cứu vé đã USED hoặc CANCELLED hoặc EXCHANGED bị từ chối")
    void testLookupTicket_UsedOrCancelledOrExchanged_ThrowsException() {
        oldTicket.setStatus(TicketStatus.USED);
        when(ticketRepository.findByTicketCode("TK-USED")).thenReturn(Optional.of(oldTicket));

        AppException exUsed = assertThrows(AppException.class, () -> ticketExchangeService.lookupTicket("TK-USED", 1L));
        assertEquals(ErrorCode.VALIDATION_ERROR, exUsed.getErrorCode());

        oldTicket.setStatus(TicketStatus.CANCELLED);
        AppException exCancelled = assertThrows(AppException.class, () -> ticketExchangeService.lookupTicket("TK-USED", 1L));
        assertEquals(ErrorCode.VALIDATION_ERROR, exCancelled.getErrorCode());

        oldTicket.setStatus(TicketStatus.EXCHANGED);
        AppException exExchanged = assertThrows(AppException.class, () -> ticketExchangeService.lookupTicket("TK-USED", 1L));
        assertEquals(ErrorCode.VALIDATION_ERROR, exExchanged.getErrorCode());
    }

    @Test
    @DisplayName("TC-S316-05: Tính toán chênh lệch giá khi vé mới đắt hơn (Phụ thu)")
    void testCalculateDifference_Surcharge() {
        when(ticketRepository.findByTicketCode("TK-20261111-01")).thenReturn(Optional.of(oldTicket));
        when(tripRepository.findById(102L)).thenReturn(Optional.of(newTrip));

        var diff = ticketExchangeService.calculateDifference("TK-20261111-01", 102L, 1L);

        assertEquals(BigDecimal.valueOf(80000), diff.get("priceDifference"));
        assertEquals(BigDecimal.valueOf(80000), diff.get("surchargeAmount"));
        assertEquals(BigDecimal.ZERO, diff.get("refundAmount"));
        assertEquals(true, diff.get("requiresSurcharge"));
    }

    @Test
    @DisplayName("TC-S316-06: Tính toán chênh lệch giá khi vé mới rẻ hơn (Hoàn tiền)")
    void testCalculateDifference_Refund() {
        newTrip.setPrice(BigDecimal.valueOf(250000));
        when(ticketRepository.findByTicketCode("TK-20261111-01")).thenReturn(Optional.of(oldTicket));
        when(tripRepository.findById(102L)).thenReturn(Optional.of(newTrip));

        var diff = ticketExchangeService.calculateDifference("TK-20261111-01", 102L, 1L);

        assertEquals(BigDecimal.valueOf(-50000), diff.get("priceDifference"));
        assertEquals(BigDecimal.ZERO, diff.get("surchargeAmount"));
        assertEquals(BigDecimal.valueOf(50000), diff.get("refundAmount"));
        assertEquals(false, diff.get("requiresSurcharge"));
    }

    @Test
    @DisplayName("TC-S316-07: Tính toán chênh lệch giá khi giá bằng nhau (Không phụ thu, không hoàn)")
    void testCalculateDifference_Equal() {
        newTrip.setPrice(BigDecimal.valueOf(300000));
        when(ticketRepository.findByTicketCode("TK-20261111-01")).thenReturn(Optional.of(oldTicket));
        when(tripRepository.findById(102L)).thenReturn(Optional.of(newTrip));

        var diff = ticketExchangeService.calculateDifference("TK-20261111-01", 102L, 1L);

        assertEquals(BigDecimal.ZERO, diff.get("priceDifference"));
        assertEquals(BigDecimal.ZERO, diff.get("surchargeAmount"));
        assertEquals(BigDecimal.ZERO, diff.get("refundAmount"));
    }

    @Test
    @DisplayName("TC-S316-08, 09, 10: Thực hiện đổi vé thành công: Tạo Booking mới gắn chuyến mới, vé mới ISSUED có QR, ghế cũ AVAILABLE, ghế mới BOOKED")
    void testExchangeTicket_Success_DoD123() {
        TicketExchangeRequest request = TicketExchangeRequest.builder()
                .oldTicketCode("TK-20261111-01")
                .newTripId(102L)
                .newSeatNumber("B02")
                .note("Đổi giờ chạy chuyến sớm hơn")
                .build();

        User operatorUser = User.builder().id(99L).email("operator@futa.vn").busCompanyId(1L).build();

        when(ticketRepository.findByTicketCode("TK-20261111-01")).thenReturn(Optional.of(oldTicket));
        when(tripRepository.findById(102L)).thenReturn(Optional.of(newTrip));
        when(tripSeatRepository.findByTripIdAndSeatCodeWithLock(102L, "B02")).thenReturn(Optional.of(newSeat));
        when(tripSeatRepository.findByTripIdAndSeatCode(101L, "A05")).thenReturn(Optional.of(oldSeat));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(ticketExchangeLogRepository.save(any(TicketExchangeLog.class))).thenAnswer(invocation -> {
            TicketExchangeLog l = invocation.getArgument(0);
            l.setId(888L);
            return l;
        });

        TicketExchangeResponse response = ticketExchangeService.exchangeTicket(request, operatorUser);

        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());
        assertEquals("TK-20261111-01", response.getOldTicketCode());
        assertEquals("EXCHANGED", response.getOldTicketStatus());
        assertEquals("B02", response.getNewSeatCode());
        assertEquals(102L, response.getNewTripId());
        assertEquals(BigDecimal.valueOf(80000), response.getPriceDifference());
        assertEquals(BigDecimal.valueOf(80000), response.getSurchargeAmount());
        assertEquals(BigDecimal.ZERO, response.getRefundAmount());
        assertTrue(response.getNewTicketCode().startsWith("TK-EX-"));

        // Kiểm tra Review Point #1: Đơn Booking mới được lưu độc lập gắn chuyến mới
        verify(bookingRepository, times(1)).save(argThat(b -> b.getTrip().getId().equals(102L) && b.getBookingCode().startsWith("BK-EX-")));

        // Kiểm tra Review Point #1: Vé mới có mã QR Hash và gắn Booking mới
        verify(ticketRepository).save(argThat(t -> t.getQrCodeHash() != null && !t.getQrCodeHash().isEmpty()));

        // Kiểm tra DoD 2: Ghế cũ được giải phóng về AVAILABLE
        assertEquals(SeatStatus.AVAILABLE, oldSeat.getStatus());
        verify(tripSeatRepository).save(oldSeat);
        verify(seatRealtimeService).broadcastReleased(eq(101L), eq(List.of("A05")));
        verify(tripRepository).syncAvailableSeats(101L);

        // Kiểm tra DoD 3: Ghế mới được cập nhật BOOKED
        assertEquals(SeatStatus.BOOKED, newSeat.getStatus());
        verify(tripSeatRepository).save(newSeat);
        verify(seatRealtimeService).broadcastBooked(eq(102L), eq(List.of("B02")));
        verify(tripRepository).syncAvailableSeats(102L);

        // Kiểm tra DoD 1: Ghi log vào ticket_exchange_logs
        verify(ticketExchangeLogRepository, times(1)).save(any(TicketExchangeLog.class));
    }

    @Test
    @DisplayName("TC-S316-11: Từ chối đổi vé nếu ghế mới trên chuyến mới đã bị người khác đặt (BOOKED) - 409 Conflict")
    void testExchangeTicket_NewSeatAlreadyBooked_ThrowsConflictException() {
        newSeat.setStatus(SeatStatus.BOOKED);

        TicketExchangeRequest request = TicketExchangeRequest.builder()
                .oldTicketCode("TK-20261111-01")
                .newTripId(102L)
                .newSeatNumber("B02")
                .build();

        User operatorUser = User.builder().id(99L).email("operator@futa.vn").busCompanyId(1L).build();

        when(ticketRepository.findByTicketCode("TK-20261111-01")).thenReturn(Optional.of(oldTicket));
        when(tripRepository.findById(102L)).thenReturn(Optional.of(newTrip));
        when(tripSeatRepository.findByTripIdAndSeatCodeWithLock(102L, "B02")).thenReturn(Optional.of(newSeat));

        AppException ex = assertThrows(AppException.class, () -> ticketExchangeService.exchangeTicket(request, operatorUser));
        assertEquals(ErrorCode.SEAT_ALREADY_BOOKED, ex.getErrorCode());
    }

    @Test
    @DisplayName("TC-S316-12: Từ chối đổi vé nếu ghế mới đang bị LOCKED (chống race condition - Review Point #3)")
    void testExchangeTicket_NewSeatLocked_ThrowsConflictException() {
        newSeat.setStatus(SeatStatus.LOCKED);

        TicketExchangeRequest request = TicketExchangeRequest.builder()
                .oldTicketCode("TK-20261111-01")
                .newTripId(102L)
                .newSeatNumber("B02")
                .build();

        User operatorUser = User.builder().id(99L).email("operator@futa.vn").busCompanyId(1L).build();

        when(ticketRepository.findByTicketCode("TK-20261111-01")).thenReturn(Optional.of(oldTicket));
        when(tripRepository.findById(102L)).thenReturn(Optional.of(newTrip));
        when(tripSeatRepository.findByTripIdAndSeatCodeWithLock(102L, "B02")).thenReturn(Optional.of(newSeat));

        AppException ex = assertThrows(AppException.class, () -> ticketExchangeService.exchangeTicket(request, operatorUser));
        assertEquals(ErrorCode.SEAT_ALREADY_BOOKED, ex.getErrorCode());
    }

    @Test
    @DisplayName("TC-S316-13: Chặn IDOR chéo nhà xe: Nhà xe A không được đổi vé của Nhà xe B (Review Point #2)")
    void testExchangeTicket_CrossCompanyIDOR_ThrowsForbidden() {
        TicketExchangeRequest request = TicketExchangeRequest.builder()
                .oldTicketCode("TK-20261111-01")
                .newTripId(102L)
                .newSeatNumber("B02")
                .build();

        // Nhân viên thuộc nhà xe 2 (Thành Bưởi) cố tình đổi vé của nhà xe 1 (Phương Trang)
        User attacker = User.builder().id(88L).email("attacker@thanhbuoi.com").busCompanyId(2L).build();

        when(ticketRepository.findByTicketCode("TK-20261111-01")).thenReturn(Optional.of(oldTicket));

        AppException ex = assertThrows(AppException.class, () -> ticketExchangeService.exchangeTicket(request, attacker));
        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
    }
}
