package com.traveleasy.service;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.booking.CreateBookingRequest;
import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import com.traveleasy.service.customer.BookingService;
import com.traveleasy.service.customer.TripService;
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
}
