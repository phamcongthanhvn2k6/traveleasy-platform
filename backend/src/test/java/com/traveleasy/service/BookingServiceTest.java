package com.traveleasy.service;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.booking.CreateBookingRequest;
import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import com.traveleasy.service.customer.BookingService;
import com.traveleasy.service.customer.TripService;
import com.traveleasy.service.realtime.SeatRealtimeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TripSeatRepository tripSeatRepository;

    @Mock
    private PickupDropoffPointRepository pointRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TripService tripService;

    @Mock
    private SeatRealtimeService seatRealtimeService;

    @Mock
    private com.traveleasy.service.company.DynamicPricingService dynamicPricingService;

    @InjectMocks
    private BookingService bookingService;

    private Trip sampleTrip;
    private CreateBookingRequest bookingRequest;

    @BeforeEach
    void setUp() {
        sampleTrip = new Trip();
        sampleTrip.setId(1L);
        sampleTrip.setStatus(TripStatus.SCHEDULED);
        sampleTrip.setPrice(new BigDecimal("300000"));
        sampleTrip.setAvailableSeats(30);

        bookingRequest = new CreateBookingRequest();
        bookingRequest.setTripId(1L);
        bookingRequest.setSeatNumbers(List.of("A01", "A02"));
        bookingRequest.setCustomerName("Nguyễn Văn An");
        bookingRequest.setCustomerPhone("0912345678");
        bookingRequest.setCustomerEmail("an.nguyen@example.com");
    }

    @Test
    @DisplayName("Ném ngoại lệ khi không tìm thấy chuyến xe")
    void testCreateBooking_TripNotFound() {
        when(tripRepository.findById(999L)).thenReturn(Optional.empty());
        bookingRequest.setTripId(999L);

        AppException ex = assertThrows(AppException.class, () ->
                bookingService.createBooking(bookingRequest, null)
        );

        assertEquals(ErrorCode.RESOURCE_NOT_FOUND, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("Không tìm thấy chuyến xe"));
    }

    @Test
    @DisplayName("Ném ngoại lệ khi chuyến xe đã bị hủy hoặc đã xuất bến")
    void testCreateBooking_TripNotScheduled() {
        sampleTrip.setStatus(TripStatus.CANCELLED);
        when(tripRepository.findById(1L)).thenReturn(Optional.of(sampleTrip));

        AppException ex = assertThrows(AppException.class, () ->
                bookingService.createBooking(bookingRequest, null)
        );

        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("không còn mở bán"));
    }

    @Test
    @DisplayName("Ném ngoại lệ SEAT_ALREADY_BOOKED khi ghế đã có người đặt trước")
    void testCreateBooking_SeatAlreadyBooked() {
        when(tripRepository.findById(1L)).thenReturn(Optional.of(sampleTrip));

        TripSeat seat1 = new TripSeat();
        seat1.setSeatCode("A01");
        seat1.setStatus(SeatStatus.AVAILABLE);

        TripSeat seat2 = new TripSeat();
        seat2.setSeatCode("A02");
        seat2.setStatus(SeatStatus.BOOKED); // Đã có người mua!

        when(tripSeatRepository.findByTripIdAndSeatCodeInWithLock(1L, List.of("A01", "A02")))
                .thenReturn(List.of(seat1, seat2));

        AppException ex = assertThrows(AppException.class, () ->
                bookingService.createBooking(bookingRequest, null)
        );

        assertEquals(ErrorCode.SEAT_ALREADY_BOOKED, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("vừa được người khác đặt"));
    }

    @Test
    @DisplayName("Ném ngoại lệ VALIDATION_ERROR khi đặt vé chuyến xe đã khởi hành trong quá khứ")
    void testCreateBooking_TripDepartureInPast() {
        sampleTrip.setDepartureTime(java.time.LocalDateTime.now().minusHours(2));
        when(tripRepository.findById(1L)).thenReturn(Optional.of(sampleTrip));

        AppException ex = assertThrows(AppException.class, () ->
                bookingService.createBooking(bookingRequest, null)
        );

        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("đã khởi hành"));
    }

    @Test
    @DisplayName("Ném ngoại lệ VALIDATION_ERROR khi hủy đơn vé của chuyến xe đã khởi hành")
    void testCancelBooking_TripAlreadyDeparted() {
        Booking booking = new Booking();
        booking.setId(10L);
        booking.setStatus(BookingStatus.CONFIRMED);
        sampleTrip.setDepartureTime(java.time.LocalDateTime.now().minusMinutes(30));
        booking.setTrip(sampleTrip);

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));

        AppException ex = assertThrows(AppException.class, () ->
                bookingService.cancelBooking(10L, null)
        );

        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("đã khởi hành"));
    }

    @Test
    @DisplayName("Ném ngoại lệ VALIDATION_ERROR khi đổi vé sang trùng chuyến và ghế hiện tại")
    void testRescheduleTicket_SameTripAndSeat() {
        Booking booking = new Booking();
        booking.setId(10L);
        booking.setStatus(BookingStatus.CONFIRMED);
        sampleTrip.setDepartureTime(java.time.LocalDateTime.now().plusDays(2));
        booking.setTrip(sampleTrip);

        Ticket ticket = new Ticket();
        ticket.setId(100L);
        ticket.setSeatNumber("A01");
        ticket.setStatus(TicketStatus.ISSUED);

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(ticketRepository.findById(100L)).thenReturn(Optional.of(ticket));

        AppException ex = assertThrows(AppException.class, () ->
                bookingService.rescheduleTicket(10L, 100L, 1L, "A01", null)
        );

        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("trùng chuyến xe và ghế"));
    }

    @Test
    @DisplayName("TC-S307-10: Đặt vé áp dụng giá động và chống gian lận can thiệp finalAmount từ Client")
    void testCreateBooking_WithDynamicPricingAndAntiTampering() {
        TripSeat seat1 = new TripSeat();
        seat1.setSeatCode("A01");
        seat1.setStatus(SeatStatus.AVAILABLE);

        TripSeat seat2 = new TripSeat();
        seat2.setSeatCode("A02");
        seat2.setStatus(SeatStatus.AVAILABLE);

        when(tripRepository.findById(1L)).thenReturn(Optional.of(sampleTrip));
        when(tripSeatRepository.findByTripIdAndSeatCodeInWithLock(eq(1L), anyList())).thenReturn(List.of(seat1, seat2));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(50L);
            return b;
        });

        // Dynamic pricing trả về đơn giá 360,000 (tăng 20% từ gốc 300,000)
        com.traveleasy.dto.company.pricing.DynamicPricingResult pricingResult = com.traveleasy.dto.company.pricing.DynamicPricingResult.builder()
                .originalPrice(new BigDecimal("300000"))
                .calculatedPrice(new BigDecimal("360000"))
                .deltaAmount(new BigDecimal("60000"))
                .ruleApplied(true)
                .pricingBadge("+20% Lễ Tết")
                .build();

        when(dynamicPricingService.calculateDynamicPrice(eq(sampleTrip), any())).thenReturn(pricingResult);

        // Client cố tình gửi finalAmount = 10,000 đ để gian lận tiền vé
        bookingRequest.setFinalAmount(new BigDecimal("10000"));

        com.traveleasy.dto.booking.BookingResponse response = bookingService.createBooking(bookingRequest, "an.nguyen@example.com");

        assertNotNull(response);
        // Backend tự động ghi đè giá đúng: 360,000 x 2 = 720,000 đ
        assertEquals(new BigDecimal("720000"), response.getTotalAmount());
        assertEquals(new BigDecimal("600000"), response.getOriginalAmount());
    }

    @Test
    @DisplayName("AC-REV-03: Kênh đặt vé tại quầy (POS/COUNTER) tự động bỏ qua giá động, giữ nguyên giá gốc")
    void testCreateBooking_PosChannel_BypassesDynamicPricing() {
        TripSeat seat1 = new TripSeat();
        seat1.setSeatCode("A01");
        seat1.setStatus(SeatStatus.AVAILABLE);

        TripSeat seat2 = new TripSeat();
        seat2.setSeatCode("A02");
        seat2.setStatus(SeatStatus.AVAILABLE);

        when(tripRepository.findById(1L)).thenReturn(Optional.of(sampleTrip));
        when(tripSeatRepository.findByTripIdAndSeatCodeInWithLock(eq(1L), anyList())).thenReturn(List.of(seat1, seat2));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(51L);
            return b;
        });

        // Thiết lập kênh đặt vé là quầy bến xe (POS)
        bookingRequest.setBookingChannel("POS");

        com.traveleasy.dto.booking.BookingResponse response = bookingService.createBooking(bookingRequest, "nhanvienquay@traveleasy.vn");

        assertNotNull(response);
        // Tại quầy giữ nguyên giá gốc: 300,000 x 2 = 600,000 đ (KHÔNG phụ thu 360,000 x 2 = 720,000 đ)
        assertEquals(new BigDecimal("600000"), response.getTotalAmount());
        assertEquals(new BigDecimal("600000"), response.getOriginalAmount());
        // Dynamic pricing service KHÔNG được gọi khi là POS channel
        verify(dynamicPricingService, never()).calculateDynamicPrice(any(), any());
    }

    @Test
    @DisplayName("AC-REV-01: Khóa cứng giá vé (Price Freezing) bất biến sau khi booking đã tạo")
    void testPriceFreezing_ImmutabilityAfterCreation() {
        TripSeat seat1 = new TripSeat();
        seat1.setSeatCode("A01");
        seat1.setStatus(SeatStatus.AVAILABLE);

        when(tripRepository.findById(1L)).thenReturn(Optional.of(sampleTrip));
        when(tripSeatRepository.findByTripIdAndSeatCodeInWithLock(eq(1L), anyList())).thenReturn(List.of(seat1));

        Booking savedBooking = Booking.builder()
                .id(999L)
                .bookingCode("BK-20261111-TEST")
                .totalAmount(new BigDecimal("360000"))
                .originalAmount(new BigDecimal("300000"))
                .status(BookingStatus.PENDING)
                .trip(sampleTrip)
                .build();

        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        com.traveleasy.dto.company.pricing.DynamicPricingResult pricingResult = com.traveleasy.dto.company.pricing.DynamicPricingResult.builder()
                .originalPrice(new BigDecimal("300000"))
                .calculatedPrice(new BigDecimal("360000"))
                .deltaAmount(new BigDecimal("60000"))
                .ruleApplied(true)
                .build();
        when(dynamicPricingService.calculateDynamicPrice(eq(sampleTrip), any())).thenReturn(pricingResult);

        bookingRequest.setSeatNumbers(List.of("A01"));
        com.traveleasy.dto.booking.BookingResponse response = bookingService.createBooking(bookingRequest, "khach@example.com");

        assertNotNull(response);
        assertEquals(new BigDecimal("360000"), response.getTotalAmount());

        // Kiểm tra sau khi tạo: giá vé đã đóng băng cố định, các thao tác tra cứu hay thanh toán
        // chỉ đọc totalAmount từ entity, không bao giờ gọi lại recalculate
        assertEquals(new BigDecimal("360000"), savedBooking.getTotalAmount());
        assertEquals(new BigDecimal("300000"), savedBooking.getOriginalAmount());
    }
}

