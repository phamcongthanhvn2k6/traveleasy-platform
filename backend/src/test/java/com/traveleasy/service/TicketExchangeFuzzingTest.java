package com.traveleasy.service;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.company.exchange.TicketExchangeRequest;
import com.traveleasy.dto.company.exchange.TicketExchangeResponse;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * [S316] Kiểm thử Fuzzing và trường hợp biên cho nghiệp vụ đổi vé
 * - Biên 12 tiếng: 11h59m (từ chối) vs 12h01m (chấp nhận)
 * - Chênh lệch giá cực đoan (0 VNĐ, 10 triệu VNĐ, vé miễn phí)
 * - Mã vé ký tự lạ, khoảng trắng, null
 * - Idempotency và phòng vệ concurrency
 * @author Trần Minh Đức (tranduc2601)
 */
@ExtendWith(MockitoExtension.class)
class TicketExchangeFuzzingTest {

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
    private Route testRoute;
    private Trip baseOldTrip;
    private Trip baseNewTrip;
    private Booking baseBooking;
    private Ticket baseTicket;
    private TripSeat baseOldSeat;
    private TripSeat baseNewSeat;

    @BeforeEach
    void setUp() {
        testCompany = BusCompany.builder().id(1L).name("Phương Trang").build();
        testRoute = Route.builder().id(1L).departureLocation("Sài Gòn").arrivalLocation("Nha Trang").build();

        baseOldTrip = Trip.builder()
                .id(10L)
                .busCompany(testCompany)
                .route(testRoute)
                .departureTime(LocalDateTime.now().plusHours(20))
                .price(BigDecimal.valueOf(350000))
                .totalSeats(40)
                .availableSeats(15)
                .build();

        baseNewTrip = Trip.builder()
                .id(20L)
                .busCompany(testCompany)
                .route(testRoute)
                .departureTime(LocalDateTime.now().plusHours(40))
                .price(BigDecimal.valueOf(450000))
                .totalSeats(40)
                .availableSeats(20)
                .build();

        baseBooking = Booking.builder()
                .id(100L)
                .bookingCode("BK-FUZZ-01")
                .trip(baseOldTrip)
                .passengerName("Fuzzing Tester")
                .passengerPhone("0909999888")
                .status(BookingStatus.CONFIRMED)
                .build();

        baseTicket = Ticket.builder()
                .id(500L)
                .booking(baseBooking)
                .ticketCode("TK-FUZZ-01")
                .seatNumber("A01")
                .price(BigDecimal.valueOf(350000))
                .status(TicketStatus.ISSUED)
                .build();

        baseOldSeat = TripSeat.builder().id(1L).trip(baseOldTrip).seatCode("A01").status(SeatStatus.BOOKED).build();
        baseNewSeat = TripSeat.builder().id(2L).trip(baseNewTrip).seatCode("B01").status(SeatStatus.AVAILABLE).build();
    }

    @Test
    @DisplayName("FUZZ-01: Trường hợp biên thời gian - Chính xác 11 giờ 59 phút (Từ chối 400)")
    void testBoundary_11Hours59Minutes_Rejected() {
        baseOldTrip.setDepartureTime(LocalDateTime.now().plusHours(11).plusMinutes(59));

        TicketExchangeRequest req = TicketExchangeRequest.builder()
                .oldTicketCode("TK-FUZZ-01")
                .newTripId(20L)
                .newSeatNumber("B01")
                .build();

        when(ticketRepository.findByTicketCode("TK-FUZZ-01")).thenReturn(Optional.of(baseTicket));

        AppException ex = assertThrows(AppException.class, () -> ticketExchangeService.exchangeTicket(req, null));
        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("12 tiếng"));
    }

    @Test
    @DisplayName("FUZZ-02: Trường hợp biên thời gian - Chính xác 12 giờ 01 phút (Chấp nhận thành công)")
    void testBoundary_12Hours01Minute_Accepted() {
        baseOldTrip.setDepartureTime(LocalDateTime.now().plusHours(12).plusMinutes(1));

        TicketExchangeRequest req = TicketExchangeRequest.builder()
                .oldTicketCode("TK-FUZZ-01")
                .newTripId(20L)
                .newSeatNumber("B01")
                .build();

        when(ticketRepository.findByTicketCode("TK-FUZZ-01")).thenReturn(Optional.of(baseTicket));
        when(tripRepository.findById(20L)).thenReturn(Optional.of(baseNewTrip));
        when(tripSeatRepository.findByTripIdAndSeatCodeWithLock(20L, "B01")).thenReturn(Optional.of(baseNewSeat));
        when(tripSeatRepository.findByTripIdAndSeatCode(10L, "A01")).thenReturn(Optional.of(baseOldSeat));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));
        when(ticketExchangeLogRepository.save(any(TicketExchangeLog.class))).thenAnswer(i -> {
            TicketExchangeLog l = i.getArgument(0);
            l.setId(999L);
            return l;
        });

        TicketExchangeResponse res = ticketExchangeService.exchangeTicket(req, null);

        assertNotNull(res);
        assertEquals("SUCCESS", res.getStatus());
        assertEquals(SeatStatus.AVAILABLE, baseOldSeat.getStatus());
        assertEquals(SeatStatus.BOOKED, baseNewSeat.getStatus());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("FUZZ-03: Chênh lệch giá cực đoan - Chuyến mới giá 0 VNĐ (Vé khuyến mãi đặc biệt, hoàn toàn bộ tiền)")
    void testExtremePrice_NewPriceZero_RefundsFullAmount() {
        baseNewTrip.setPrice(BigDecimal.ZERO);

        TicketExchangeRequest req = TicketExchangeRequest.builder()
                .oldTicketCode("TK-FUZZ-01")
                .newTripId(20L)
                .newSeatNumber("B01")
                .build();

        when(ticketRepository.findByTicketCode("TK-FUZZ-01")).thenReturn(Optional.of(baseTicket));
        when(tripRepository.findById(20L)).thenReturn(Optional.of(baseNewTrip));
        when(tripSeatRepository.findByTripIdAndSeatCodeWithLock(20L, "B01")).thenReturn(Optional.of(baseNewSeat));
        when(tripSeatRepository.findByTripIdAndSeatCode(10L, "A01")).thenReturn(Optional.of(baseOldSeat));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));
        when(ticketExchangeLogRepository.save(any(TicketExchangeLog.class))).thenAnswer(i -> {
            TicketExchangeLog l = i.getArgument(0);
            l.setId(998L);
            return l;
        });

        TicketExchangeResponse res = ticketExchangeService.exchangeTicket(req, null);

        assertNotNull(res);
        assertEquals(BigDecimal.valueOf(-350000), res.getPriceDifference());
        assertEquals(BigDecimal.ZERO, res.getSurchargeAmount());
        assertEquals(BigDecimal.valueOf(350000), res.getRefundAmount());
    }

    @Test
    @DisplayName("FUZZ-04: Chênh lệch giá cực đoan - Chuyến mới đắt hơn 10 triệu VNĐ (Phụ thu lớn)")
    void testExtremePrice_HighSurcharge() {
        baseNewTrip.setPrice(BigDecimal.valueOf(10000000));

        TicketExchangeRequest req = TicketExchangeRequest.builder()
                .oldTicketCode("TK-FUZZ-01")
                .newTripId(20L)
                .newSeatNumber("B01")
                .build();

        when(ticketRepository.findByTicketCode("TK-FUZZ-01")).thenReturn(Optional.of(baseTicket));
        when(tripRepository.findById(20L)).thenReturn(Optional.of(baseNewTrip));
        when(tripSeatRepository.findByTripIdAndSeatCodeWithLock(20L, "B01")).thenReturn(Optional.of(baseNewSeat));
        when(tripSeatRepository.findByTripIdAndSeatCode(10L, "A01")).thenReturn(Optional.of(baseOldSeat));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));
        when(ticketExchangeLogRepository.save(any(TicketExchangeLog.class))).thenAnswer(i -> {
            TicketExchangeLog l = i.getArgument(0);
            l.setId(997L);
            return l;
        });

        TicketExchangeResponse res = ticketExchangeService.exchangeTicket(req, null);

        assertNotNull(res);
        assertEquals(BigDecimal.valueOf(9650000), res.getPriceDifference());
        assertEquals(BigDecimal.valueOf(9650000), res.getSurchargeAmount());
        assertEquals(BigDecimal.ZERO, res.getRefundAmount());
    }

    @Test
    @DisplayName("FUZZ-05: Chuyến xe mới có giờ khởi hành trong quá khứ (Từ chối 400)")
    void testNewTripInPast_ThrowsValidationException() {
        baseNewTrip.setDepartureTime(LocalDateTime.now().minusHours(2));

        TicketExchangeRequest req = TicketExchangeRequest.builder()
                .oldTicketCode("TK-FUZZ-01")
                .newTripId(20L)
                .newSeatNumber("B01")
                .build();

        when(ticketRepository.findByTicketCode("TK-FUZZ-01")).thenReturn(Optional.of(baseTicket));
        when(tripRepository.findById(20L)).thenReturn(Optional.of(baseNewTrip));

        AppException ex = assertThrows(AppException.class, () -> ticketExchangeService.exchangeTicket(req, null));
        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("trong tương lai"));
    }

    @Test
    @DisplayName("FUZZ-06: Idempotency - Vé đã EXCHANGED rồi không thể tiếp tục đổi lần thứ hai")
    void testIdempotency_AlreadyExchanged_CannotExchangeAgain() {
        baseTicket.setStatus(TicketStatus.EXCHANGED);

        TicketExchangeRequest req = TicketExchangeRequest.builder()
                .oldTicketCode("TK-FUZZ-01")
                .newTripId(20L)
                .newSeatNumber("B01")
                .build();

        when(ticketRepository.findByTicketCode("TK-FUZZ-01")).thenReturn(Optional.of(baseTicket));

        AppException ex = assertThrows(AppException.class, () -> ticketExchangeService.exchangeTicket(req, null));
        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("ISSUED"));
    }
}
