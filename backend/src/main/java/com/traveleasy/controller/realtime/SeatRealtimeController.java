package com.traveleasy.controller.realtime;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.trip.SeatHoldRequest;
import com.traveleasy.dto.trip.SeatSimulateRequest;
import com.traveleasy.dto.trip.SeatUpdateEvent;
import com.traveleasy.service.realtime.SeatRealtimeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/v1/trips/{tripId}/seats")
@RequiredArgsConstructor
@Tag(name = "Realtime Seats", description = "API quản lý luồng thời gian thực SSE và cơ chế khóa giữ chỗ ghế")
public class SeatRealtimeController {

    private final SeatRealtimeService seatRealtimeService;

    @Operation(summary = "Đăng ký nhận luồng Server-Sent Events (SSE) cập nhật trạng thái ghế theo thời gian thực")
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamSeatUpdates(@PathVariable Long tripId) {
        return seatRealtimeService.subscribe(tripId);
    }

    @Operation(summary = "Khóa tạm thời ghế khi khách bắt đầu thanh toán (đổi màu vàng LOCKED)")
    @PostMapping("/hold")
    public ResponseEntity<ApiResponse<List<SeatUpdateEvent>>> holdSeats(
            @PathVariable Long tripId,
            @RequestBody SeatHoldRequest request
    ) {
        List<SeatUpdateEvent> events = seatRealtimeService.holdSeats(tripId, request.getSeatCodes(), request.getSessionId());
        return ResponseEntity.ok(ApiResponse.success("Giữ chỗ thành công trong 10 phút", events));
    }

    @Operation(summary = "Hủy giữ chỗ ghế và trả về trạng thái mở bán trống (đổi màu trắng AVAILABLE)")
    @PostMapping("/release")
    public ResponseEntity<ApiResponse<Void>> releaseSeats(
            @PathVariable Long tripId,
            @RequestBody SeatHoldRequest request
    ) {
        seatRealtimeService.releaseSeats(tripId, request.getSeatCodes());
        return ResponseEntity.ok(ApiResponse.success("Đã giải phóng ghế giữ chỗ thành công", null));
    }

    @Operation(summary = "Giả lập hành động chọn ghế theo thời gian thực (demo test)")
    @PostMapping("/simulate")
    public ResponseEntity<ApiResponse<SeatUpdateEvent>> simulateSeatAction(
            @PathVariable Long tripId,
            @RequestBody SeatSimulateRequest request
    ) {
        SeatUpdateEvent event = seatRealtimeService.simulateSeatAction(tripId, request.getSeatNumber(), request.getAction());
        return ResponseEntity.ok(ApiResponse.success("Giả lập cập nhật ghế thành công", event));
    }
}
