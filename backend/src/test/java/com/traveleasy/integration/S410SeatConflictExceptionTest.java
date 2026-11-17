package com.traveleasy.integration;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.CustomSeatHoldException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.common.exception.GlobalExceptionHandler;
import com.traveleasy.entity.SeatStatus;
import com.traveleasy.entity.TripSeat;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.repository.TripSeatRepository;
import com.traveleasy.service.realtime.SeatRealtimeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

/**
 * [S410] Kiểm thử xử lý ngoại lệ tranh chấp ghế đồng thời (Race Condition) trả về HTTP 409 Conflict chuẩn xác.
 * @author Phạm Thanh Phong
 */
@ExtendWith(MockitoExtension.class)
public class S410SeatConflictExceptionTest {

    private final GlobalExceptionHandler exceptionHandler = new GlobalExceptionHandler();

    @Mock
    private TripSeatRepository tripSeatRepository;

    @Mock
    private TripRepository tripRepository;

    @InjectMocks
    private SeatRealtimeService seatRealtimeService;

    @Test
    @DisplayName("[S410] GlobalExceptionHandler bắt CustomSeatHoldException trả về HTTP 409 kèm thông điệp chuẩn")
    void testHandleCustomSeatHoldException_Returns409Conflict() {
        CustomSeatHoldException ex = new CustomSeatHoldException();
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleCustomSeatHoldConflict(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Ghế này vừa được chọn bởi khách hàng khác", response.getBody().getMessage());
    }

    @Test
    @DisplayName("[S410] GlobalExceptionHandler bắt OptimisticLockingFailureException trả về HTTP 409 kèm thông điệp chuẩn")
    void testHandleOptimisticLockingFailureException_Returns409Conflict() {
        OptimisticLockingFailureException ex = new OptimisticLockingFailureException("Concurrent seat modification");
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleLockingConflict(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Ghế này vừa được chọn bởi khách hàng khác", response.getBody().getMessage());
    }

    @Test
    @DisplayName("[S410] GlobalExceptionHandler bắt ObjectOptimisticLockingFailureException trả về HTTP 409 kèm thông điệp chuẩn")
    void testHandleObjectOptimisticLockingFailureException_Returns409Conflict() {
        ObjectOptimisticLockingFailureException ex =
                new ObjectOptimisticLockingFailureException(TripSeat.class, 101L);
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleLockingConflict(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Ghế này vừa được chọn bởi khách hàng khác", response.getBody().getMessage());
    }

    @Test
    @DisplayName("[S410] Khi 2 khách cùng bấm giữ 1 ghế trong cùng mili-giây -> Ném CustomSeatHoldException (HTTP 409)")
    void testConcurrentSeatHold_ThrowsCustomSeatHoldException409() {
        TripSeat seatA01 = TripSeat.builder()
                .id(1L)
                .seatCode("A01")
                .floor(1)
                .status(SeatStatus.AVAILABLE)
                .build();

        when(tripSeatRepository.findByTripIdAndSeatCodeInWithLock(10L, List.of("A01")))
                .thenReturn(List.of(seatA01));

        // Khách hàng 1 giữ ghế A01 thành công
        seatRealtimeService.holdSeats(10L, List.of("A01"), "session-khach-1", "khach1@gmail.com");
        assertEquals(SeatStatus.LOCKED, seatA01.getStatus());

        // Khách hàng 2 bấm chọn đúng ghế A01 ngay sau đó -> Bị chặn bởi CustomSeatHoldException (409 Conflict)
        CustomSeatHoldException conflictEx = assertThrows(CustomSeatHoldException.class, () ->
                seatRealtimeService.holdSeats(10L, List.of("A01"), "session-khach-2", "khach2@gmail.com")
        );

        assertEquals(ErrorCode.SEAT_ALREADY_BOOKED, conflictEx.getErrorCode());
        assertEquals(HttpStatus.CONFLICT, conflictEx.getErrorCode().getHttpStatus());
        assertTrue(conflictEx.getMessage().contains("Ghế này vừa được chọn bởi khách hàng khác"));

        ResponseEntity<ApiResponse<Void>> httpResponse = exceptionHandler.handleCustomSeatHoldConflict(conflictEx);
        assertEquals(HttpStatus.CONFLICT, httpResponse.getStatusCode());
    }
}
