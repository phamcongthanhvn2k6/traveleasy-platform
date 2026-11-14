package com.traveleasy.controller.customer;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.tracking.TripGpsLocationDto;
import com.traveleasy.dto.tracking.UpdateTripGpsRequest;
import com.traveleasy.service.realtime.TripGpsRealtimeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * [S306][TRACKING] Controller Định Vị GPS Live Tracking Xe Chạy Thời Gian Thực
 * Phục vụ cả 3 vai trò:
 * 1. Khách hàng theo dõi xe qua bản đồ Leaflet & SSE stream (/tracking/:tripId)
 * 2. Tài xế phát tín hiệu GPS trực tiếp từ điện thoại (/conductor/scanner)
 * 3. Ban điều hành nhà xe & Admin giám sát tiến độ đội xe (/company/trips)
 * @author Nguyễn Đại Phát (phatnguyn146)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/tracking")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "GPS Live Tracking", description = "[S306][TRACKING] Server-Sent Events stream và bản đồ GPS thời gian thực - Nguyễn Đại Phát")
public class TripGpsController {

    private final TripGpsRealtimeService tripGpsRealtimeService;

    @GetMapping("/{tripId}/current")
    @Operation(summary = "Lấy snapshot tọa độ GPS hiện tại và thông tin tổ lái của chuyến xe")
    public ApiResponse<TripGpsLocationDto> getCurrentGpsLocation(@PathVariable Long tripId) {
        TripGpsLocationDto location = tripGpsRealtimeService.getCurrentLocation(tripId);
        return ApiResponse.success(location);
    }

    @GetMapping(value = "/{tripId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Đăng ký nhận luồng Server-Sent Events (SSE) cập nhật tọa độ xe 1 giây/lần")
    public SseEmitter streamTripGpsLocation(@PathVariable Long tripId) {
        return tripGpsRealtimeService.subscribe(tripId);
    }

    @PostMapping("/{tripId}/update-location")
    @Operation(summary = "Tài xế / Thiết bị GPS trên xe gửi tọa độ thực tế lên hệ thống")
    public ApiResponse<TripGpsLocationDto> updateDriverGpsLocation(
            @PathVariable Long tripId,
            @RequestBody UpdateTripGpsRequest request) {

        TripGpsLocationDto updated = tripGpsRealtimeService.updateDriverLocation(tripId, request);
        return ApiResponse.success("Cập nhật vị trí xe thành công", updated);
    }

    @PostMapping("/{tripId}/simulate-step")
    @Operation(summary = "Kích hoạt xe di chuyển tiếp 1 bước trên cao tốc (Phục vụ Demo & Test)")
    public ApiResponse<TripGpsLocationDto> simulateNextStep(@PathVariable Long tripId) {
        TripGpsLocationDto next = tripGpsRealtimeService.advanceSimulationStep(tripId);
        return ApiResponse.success("Đã mô phỏng di chuyển xe", next);
    }
}
