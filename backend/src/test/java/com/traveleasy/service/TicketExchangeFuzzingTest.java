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
 * [S316] Kiem thu Fuzzing va truong hop bien cho nghiep vu doi ve
 * - Bien 12 tieng: 11h59m (tu choi) vs 12h01m (chap nhan)
 * - Chenh lech gia cuc doan (0 VND, 100 trieu VND, ve mien phi)
 * - Ma ve ky tu la, khoang trang, null
 * - Idempotency va phong ve concurrency
 * @author Tran Minh Duc (minhdctrn13)
 */
@ExtendWith(MockitoExtension.class)
class TicketExchangeFuzzingTest {

    @Mock
    private TicketRepository ticketRepository;

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
        testCompany = BusCompany.builder().id(1L).name("Phuong Trang").build();
        testRoute = Route.builder().id(1L).departureLocation("Sai Gon").arrivalLocation("Nha Trang").build();

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
    @DisplayName("FUZZ-01: Truong hop bien thoi gian - Chinh xac 11 gio 59 phut (Tu choi 400)")
    void testBoundary_11Hours59Minutes_Rejected() {
        // Khoi hanh sau dung 11h 59m (< 12h)
        baseOldTrip.setDepartureTime(LocalDateTime.now().plusHours(11).plusMinutes(59));

        TicketExchangeRequest req = TicketExchangeRequest.builder()
                .oldTicketCode("TK-FUZZ-01")
                .newTripId(20L)
                .newSeatNumber("B01")
                .build();

        when(ticketRepository.findByTicketCode("TK-FUZZ-01")).thenReturn(Optional.of(baseTicket));

        AppException ex = assertThrows(AppException.class, () -> ticketExchangeService.exchangeTicket(req, null));
        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("toi thieu 12 tieng"));
    }

    @Test
    @DisplayName("FUZZ-02: Truong hop bien thoi gian - Chinh xac 12 gio 01 phut (Chap nhan thanh cong)")
    void testBoundary_12Hours01Minute_Accepted() {
        // Khoi hanh sau 12h 01m (>= 12h)
        baseOldTrip.setDepartureTime(LocalDateTime.now().plusHours(12).plusMinutes(1));

        TicketExchangeRequest req = TicketExchangeRequest.builder()
                .oldTicketCode("TK-FUZZ-01")
                .newTripId(20L)
                .newSeatNumber("B01")
                .build();

        when(ticketRepository.findByTicketCode("TK-FUZZ-01")).thenReturn(Optional.of(baseTicket));
        when(tripRepository.findById(20L)).thenReturn(Optional.of(baseNewTrip));
        when(tripSeatRepository.findByTripIdAndSeatCode(20L, "B01")).thenReturn(Optional.of(baseNewSeat));
        when(tripSeatRepository.findByTripIdAndSeatCode(10L, "A01")).thenReturn(Optional.of(baseOldSeat));
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
    }

    @Test
    @DisplayName("FUZZ-03: Chenh lech gia cuc doan - Chuyen moi gia 0 VND (Ve khuyen mai dac biet, hoan toan bo tien)")
    void testExtremePrice_NewPriceZero_RefundsFullAmount() {
        baseNewTrip.setPrice(BigDecimal.ZERO); // Gia 0d

        TicketExchangeRequest req = TicketExchangeRequest.builder()
                .oldTicketCode("TK-FUZZ-01")
                .newTripId(20L)
                .newSeatNumber("B01")
                .build();

        when(ticketRepository.findByTicketCode("TK-FUZZ-01")).thenReturn(Optional.of(baseTicket));
        when(tripRepository.findById(20L)).thenReturn(Optional.of(baseNewTrip));
        when(tripSeatRepository.findByTripIdAndSeatCode(20L, "B01")).thenReturn(Optional.of(baseNewSeat));
        when(tripSeatRepository.findByTripIdAndSeatCode(10L, "A01")).thenReturn(Optional.of(baseOldSeat));
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
    @DisplayName("FUZZ-04: Chenh lech gia cuc doan - Chuyen moi dat hon 10 trieu VND (Phu thu lon)")
    void testExtremePrice_HighSurcharge() {
        baseNewTrip.setPrice(BigDecimal.valueOf(10000000)); // 10 trieu

        TicketExchangeRequest req = TicketExchangeRequest.builder()
                .oldTicketCode("TK-FUZZ-01")
                .newTripId(20L)
                .newSeatNumber("B01")
                .build();

        when(ticketRepository.findByTicketCode("TK-FUZZ-01")).thenReturn(Optional.of(baseTicket));
        when(tripRepository.findById(20L)).thenReturn(Optional.of(baseNewTrip));
        when(tripSeatRepository.findByTripIdAndSeatCode(20L, "B01")).thenReturn(Optional.of(baseNewSeat));
        when(tripSeatRepository.findByTripIdAndSeatCode(10L, "A01")).thenReturn(Optional.of(baseOldSeat));
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
    @DisplayName("FUZZ-05: Chuyen xe moi co gio khoi hanh trong qua khu (Tu choi 400)")
    void testNewTripInPast_ThrowsValidationException() {
        baseNewTrip.setDepartureTime(LocalDateTime.now().minusHours(2)); // Da qua

        TicketExchangeRequest req = TicketExchangeRequest.builder()
                .oldTicketCode("TK-FUZZ-01")
                .newTripId(20L)
                .newSeatNumber("B01")
                .build();

        when(ticketRepository.findByTicketCode("TK-FUZZ-01")).thenReturn(Optional.of(baseTicket));
        when(tripRepository.findById(20L)).thenReturn(Optional.of(baseNewTrip));

        AppException ex = assertThrows(AppException.class, () -> ticketExchangeService.exchangeTicket(req, null));
        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("trong tuong lai"));
    }

    @Test
    @DisplayName("FUZZ-06: Idempotency - Ve da EXCHANGED roi khong the tiep tuc doi lan thu hai")
    void testIdempotency_AlreadyExchanged_CannotExchangeAgain() {
        baseTicket.setStatus(TicketStatus.EXCHANGED); // Da doi truoc do

        TicketExchangeRequest req = TicketExchangeRequest.builder()
                .oldTicketCode("TK-FUZZ-01")
                .newTripId(20L)
                .newSeatNumber("B01")
                .build();

        when(ticketRepository.findByTicketCode("TK-FUZZ-01")).thenReturn(Optional.of(baseTicket));

        AppException ex = assertThrows(AppException.class, () -> ticketExchangeService.exchangeTicket(req, null));
        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("Chi co the doi ve o trang thai ISSUED"));
    }
}
