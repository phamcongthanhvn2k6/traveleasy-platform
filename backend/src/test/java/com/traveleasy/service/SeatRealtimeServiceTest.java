package com.traveleasy.service;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.trip.SeatUpdateEvent;
import com.traveleasy.entity.SeatStatus;
import com.traveleasy.entity.TripSeat;
import com.traveleasy.repository.TripSeatRepository;
import com.traveleasy.service.realtime.SeatRealtimeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SeatRealtimeServiceTest {

    @Mock
    private TripSeatRepository tripSeatRepository;

    @InjectMocks
    private SeatRealtimeService seatRealtimeService;

    private TripSeat seatA01;
    private TripSeat seatA02;

    @BeforeEach
    void setUp() {
        seatA01 = new TripSeat();
        seatA01.setId(101L);
        seatA01.setSeatCode("A01");
        seatA01.setStatus(SeatStatus.AVAILABLE);

        seatA02 = new TripSeat();
        seatA02.setId(102L);
        seatA02.setSeatCode("A02");
        seatA02.setStatus(SeatStatus.AVAILABLE);
    }

    @Test
    @DisplayName("Đăng ký thành công SseEmitter theo tripId")
    void testSubscribe_Success() {
        SseEmitter emitter = seatRealtimeService.subscribe(1L);
        assertNotNull(emitter);
        assertEquals(1_800_000L, emitter.getTimeout());
    }

    @Test
    @DisplayName("Khóa giữ chỗ ghế thành công sang LOCKED (Vàng) trong 10 phút")
    void testHoldSeats_Success() {
        when(tripSeatRepository.findByTripIdAndSeatCodeInWithLock(1L, List.of("A01", "A02")))
                .thenReturn(List.of(seatA01, seatA02));

        List<SeatUpdateEvent> events = seatRealtimeService.holdSeats(1L, List.of("A01", "A02"), "sess-123");

        assertEquals(2, events.size());
        assertEquals(SeatStatus.LOCKED, seatA01.getStatus());
        assertEquals(SeatStatus.LOCKED, seatA02.getStatus());
        verify(tripSeatRepository, times(1)).saveAll(any());
    }

    @Test
    @DisplayName("Ném ngoại lệ khi giữ chỗ ghế đã được đặt mua (BOOKED)")
    void testHoldSeats_ThrowsWhenAlreadyBooked() {
        seatA01.setStatus(SeatStatus.BOOKED);
        when(tripSeatRepository.findByTripIdAndSeatCodeInWithLock(1L, List.of("A01")))
                .thenReturn(List.of(seatA01));

        AppException ex = assertThrows(AppException.class, () ->
                seatRealtimeService.holdSeats(1L, List.of("A01"), "sess-123")
        );

        assertEquals(ErrorCode.SEAT_ALREADY_BOOKED, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("đã có người mua vé"));
    }

    @Test
    @DisplayName("Giải phóng ghế từ LOCKED về AVAILABLE (Trắng)")
    void testReleaseSeats_Success() {
        seatA01.setStatus(SeatStatus.LOCKED);
        when(tripSeatRepository.findByTripIdAndSeatCodeInWithLock(1L, List.of("A01")))
                .thenReturn(List.of(seatA01));

        seatRealtimeService.releaseSeats(1L, List.of("A01"));

        assertEquals(SeatStatus.AVAILABLE, seatA01.getStatus());
        verify(tripSeatRepository, times(1)).saveAll(any());
    }

    @Test
    @DisplayName("Giả lập cập nhật trạng thái ghế (Simulation HOLD / BOOK / RELEASE)")
    void testSimulateSeatAction() {
        when(tripSeatRepository.findByTripIdAndSeatCode(1L, "A01")).thenReturn(Optional.of(seatA01));

        // Test HOLD -> LOCKED
        SeatUpdateEvent holdEv = seatRealtimeService.simulateSeatAction(1L, "A01", "HOLD");
        assertEquals(SeatStatus.LOCKED, holdEv.getStatus());
        assertEquals(SeatStatus.LOCKED, seatA01.getStatus());

        // Test BOOK -> BOOKED
        SeatUpdateEvent bookEv = seatRealtimeService.simulateSeatAction(1L, "A01", "BOOK");
        assertEquals(SeatStatus.BOOKED, bookEv.getStatus());
        assertEquals(SeatStatus.BOOKED, seatA01.getStatus());

        // Test RELEASE -> AVAILABLE
        SeatUpdateEvent releaseEv = seatRealtimeService.simulateSeatAction(1L, "A01", "RELEASE");
        assertEquals(SeatStatus.AVAILABLE, releaseEv.getStatus());
        assertEquals(SeatStatus.AVAILABLE, seatA01.getStatus());
    }
}
