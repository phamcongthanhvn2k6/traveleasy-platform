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
                .name("Nha Xe Phuong Trang")
                .code("FUTA")
                .hotline("19006067")
                .build();

        testRoute = Route.builder()
                .id(10L)
                .busCompany(testCompany)
                .departureLocation("TP. Ho Chi Minh")
                .arrivalLocation("Da Lat")
                .durationHours(BigDecimal.valueOf(6.5))
                .build();

        // Chuyen cu khoi hanh sau 24 tieng (>= 12h hop le)
        oldTrip = Trip.builder()
                .id(101L)
                .busCompany(testCompany)
                .route(testRoute)
                .departureTime(LocalDateTime.now().plusHours(24))
                .price(BigDecimal.valueOf(300000))
                .totalSeats(40)
                .availableSeats(20)
                .build();

        // Chuyen moi khoi hanh sau 48 tieng
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
                .passengerName("Nguyen Van Du Khach")
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
    @DisplayName("TC-S316-01: Tra cuu ve hop le va du dieu kien doi ve (con > 12h)")
    void testLookupTicket_Success_MoreThan12Hours() {
        when(ticketRepository.findByTicketCode("TK-20261111-01")).thenReturn(Optional.of(oldTicket));

        TicketLookupResponse response = ticketExchangeService.lookupTicket("TK-20261111-01");

        assertNotNull(response);
        assertEquals("TK-20261111-01", response.getTicketCode());
        assertEquals("BK-20261111-001", response.getBookingCode());
        assertEquals("A05", response.getSeatNumber());
        assertEquals(BigDecimal.valueOf(300000), response.getPrice());
        assertTrue(response.isCanExchange());
        assertTrue(response.getHoursUntilDeparture() >= 12);
        assertTrue(response.getPolicyNotice().contains("Du dieu kien doi ve"));
    }

    @Test
    @DisplayName("TC-S316-02: Tra cuu ve khoi hanh trong vong < 12h khong du dieu kien doi ve")
    void testLookupTicket_LessThan12Hours_CannotExchange() {
        // Chuyen xe khoi hanh sau 5 tieng (< 12h)
        oldTrip.setDepartureTime(LocalDateTime.now().plusHours(5));
        when(ticketRepository.findByTicketCode("TK-20261111-01")).thenReturn(Optional.of(oldTicket));

        TicketLookupResponse response = ticketExchangeService.lookupTicket("TK-20261111-01");

        assertNotNull(response);
        assertFalse(response.isCanExchange());
        assertTrue(response.getHoursUntilDeparture() < 12);
        assertTrue(response.getPolicyNotice().contains("< 12 gio"));
    }

    @Test
    @DisplayName("TC-S316-03: Tra cuu ma ve khong ton tai tra ve loi 404")
    void testLookupTicket_NotFound_ThrowsException() {
        when(ticketRepository.findByTicketCode("TK-UNKNOWN")).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> ticketExchangeService.lookupTicket("TK-UNKNOWN"));
        assertEquals(ErrorCode.RESOURCE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    @DisplayName("TC-S316-04: Tra cuu ve da USED hoac CANCELLED hoac EXCHANGED bi tu choi")
    void testLookupTicket_UsedOrCancelledOrExchanged_ThrowsException() {
        oldTicket.setStatus(TicketStatus.USED);
        when(ticketRepository.findByTicketCode("TK-USED")).thenReturn(Optional.of(oldTicket));

        AppException exUsed = assertThrows(AppException.class, () -> ticketExchangeService.lookupTicket("TK-USED"));
        assertEquals(ErrorCode.VALIDATION_ERROR, exUsed.getErrorCode());

        oldTicket.setStatus(TicketStatus.CANCELLED);
        AppException exCancelled = assertThrows(AppException.class, () -> ticketExchangeService.lookupTicket("TK-USED"));
        assertEquals(ErrorCode.VALIDATION_ERROR, exCancelled.getErrorCode());

        oldTicket.setStatus(TicketStatus.EXCHANGED);
        AppException exExchanged = assertThrows(AppException.class, () -> ticketExchangeService.lookupTicket("TK-USED"));
        assertEquals(ErrorCode.VALIDATION_ERROR, exExchanged.getErrorCode());
    }

    @Test
    @DisplayName("TC-S316-05: Tinh toan chenh lech gia khi ve moi dat hon (Phu thu)")
    void testCalculateDifference_Surcharge() {
        when(ticketRepository.findByTicketCode("TK-20261111-01")).thenReturn(Optional.of(oldTicket));
        when(tripRepository.findById(102L)).thenReturn(Optional.of(newTrip));

        var diff = ticketExchangeService.calculateDifference("TK-20261111-01", 102L);

        assertEquals(BigDecimal.valueOf(80000), diff.get("priceDifference"));
        assertEquals(BigDecimal.valueOf(80000), diff.get("surchargeAmount"));
        assertEquals(BigDecimal.ZERO, diff.get("refundAmount"));
        assertEquals(true, diff.get("requiresSurcharge"));
    }

    @Test
    @DisplayName("TC-S316-06: Tinh toan chenh lech gia khi ve moi re hon (Hoan tien)")
    void testCalculateDifference_Refund() {
        newTrip.setPrice(BigDecimal.valueOf(250000)); // re hon 50k
        when(ticketRepository.findByTicketCode("TK-20261111-01")).thenReturn(Optional.of(oldTicket));
        when(tripRepository.findById(102L)).thenReturn(Optional.of(newTrip));

        var diff = ticketExchangeService.calculateDifference("TK-20261111-01", 102L);

        assertEquals(BigDecimal.valueOf(-50000), diff.get("priceDifference"));
        assertEquals(BigDecimal.ZERO, diff.get("surchargeAmount"));
        assertEquals(BigDecimal.valueOf(50000), diff.get("refundAmount"));
        assertEquals(false, diff.get("requiresSurcharge"));
    }

    @Test
    @DisplayName("TC-S316-07: Tinh toan chenh lech gia khi gia bang nhau (Khong phu thu, khong hoan)")
    void testCalculateDifference_Equal() {
        newTrip.setPrice(BigDecimal.valueOf(300000)); // bang gia
        when(ticketRepository.findByTicketCode("TK-20261111-01")).thenReturn(Optional.of(oldTicket));
        when(tripRepository.findById(102L)).thenReturn(Optional.of(newTrip));

        var diff = ticketExchangeService.calculateDifference("TK-20261111-01", 102L);

        assertEquals(BigDecimal.ZERO, diff.get("priceDifference"));
        assertEquals(BigDecimal.ZERO, diff.get("surchargeAmount"));
        assertEquals(BigDecimal.ZERO, diff.get("refundAmount"));
    }

    @Test
    @DisplayName("TC-S316-08, 09, 10: Thuc hien doi ve thanh cong: Ve cu sang EXCHANGED, ve moi ISSUED, ghe cu AVAILABLE, ghe moi BOOKED, ghi log vao DB")
    void testExchangeTicket_Success_DoD123() {
        TicketExchangeRequest request = TicketExchangeRequest.builder()
                .oldTicketCode("TK-20261111-01")
                .newTripId(102L)
                .newSeatNumber("B02")
                .note("Doi gio chay chuyen som hon")
                .build();

        User operatorUser = User.builder().id(99L).email("operator@futa.vn").build();

        when(ticketRepository.findByTicketCode("TK-20261111-01")).thenReturn(Optional.of(oldTicket));
        when(tripRepository.findById(102L)).thenReturn(Optional.of(newTrip));
        when(tripSeatRepository.findByTripIdAndSeatCode(102L, "B02")).thenReturn(Optional.of(newSeat));
        when(tripSeatRepository.findByTripIdAndSeatCode(101L, "A05")).thenReturn(Optional.of(oldSeat));
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

        // Kiem tra DoD 2: Ghe cu duoc giai phong ve AVAILABLE
        assertEquals(SeatStatus.AVAILABLE, oldSeat.getStatus());
        verify(tripSeatRepository).save(oldSeat);
        verify(seatRealtimeService).broadcastReleased(eq(101L), eq(List.of("A05")));
        verify(tripRepository).syncAvailableSeats(101L);

        // Kiem tra DoD 3: Ghe moi duoc cap nhat BOOKED
        assertEquals(SeatStatus.BOOKED, newSeat.getStatus());
        verify(tripSeatRepository).save(newSeat);
        verify(seatRealtimeService).broadcastBooked(eq(102L), eq(List.of("B02")));
        verify(tripRepository).syncAvailableSeats(102L);

        // Kiem tra DoD 1: Ghi log vao ticket_exchange_logs
        verify(ticketExchangeLogRepository, times(1)).save(any(TicketExchangeLog.class));
    }

    @Test
    @DisplayName("TC-S316-11: Tu choi doi ve neu ghe moi tren chuyen moi da bi nguoi khac dat (BOOKED) - 409 Conflict")
    void testExchangeTicket_NewSeatAlreadyBooked_ThrowsConflictException() {
        newSeat.setStatus(SeatStatus.BOOKED); // Ghe da co nguoi mua

        TicketExchangeRequest request = TicketExchangeRequest.builder()
                .oldTicketCode("TK-20261111-01")
                .newTripId(102L)
                .newSeatNumber("B02")
                .build();

        when(ticketRepository.findByTicketCode("TK-20261111-01")).thenReturn(Optional.of(oldTicket));
        when(tripRepository.findById(102L)).thenReturn(Optional.of(newTrip));
        when(tripSeatRepository.findByTripIdAndSeatCode(102L, "B02")).thenReturn(Optional.of(newSeat));

        AppException ex = assertThrows(AppException.class, () -> ticketExchangeService.exchangeTicket(request, null));
        assertEquals(ErrorCode.SEAT_ALREADY_BOOKED, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("nguoi khac dat"));

        verify(ticketExchangeLogRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC-S316-12: Tu choi thuc hien doi ve neu gio khoi hanh chuyen cu < 12h - 400 Validation Error")
    void testExchangeTicket_DepartureLessThan12Hours_ThrowsValidationException() {
        oldTrip.setDepartureTime(LocalDateTime.now().plusHours(8)); // Chi con 8h

        TicketExchangeRequest request = TicketExchangeRequest.builder()
                .oldTicketCode("TK-20261111-01")
                .newTripId(102L)
                .newSeatNumber("B02")
                .build();

        when(ticketRepository.findByTicketCode("TK-20261111-01")).thenReturn(Optional.of(oldTicket));

        AppException ex = assertThrows(AppException.class, () -> ticketExchangeService.exchangeTicket(request, null));
        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("toi thieu 12 tieng"));

        verify(ticketExchangeLogRepository, never()).save(any());
    }
}
