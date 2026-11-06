package com.traveleasy.controller.customer;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.trip.SeatHoldRequest;
import com.traveleasy.dto.trip.SeatUpdateEvent;
import com.traveleasy.entity.Trip;
import com.traveleasy.entity.TripStatus;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.service.realtime.SeatRealtimeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Seat Lock Management", description = "Quản lý khóa giữ chỗ ghế thời gian thực (/api/seat-locks)")
public class SeatLockController {

    private final TripRepository tripRepository;
    private final SeatRealtimeService seatRealtimeService;

    @GetMapping({"/api/seat-locks", "/api/v1/seat-locks", "/api/v1/trips/{tripId}/seat-locks"})
    @Operation(summary = "Lấy danh sách các ghế đang được khóa giữ chỗ (LOCKED) trên chuyến xe")
    public ApiResponse<List<SeatUpdateEvent>> getActiveSeatLocks(
            @PathVariable(required = false) Long tripId,
            @RequestParam(value = "tripId", required = false) Long tripIdParam) {
        Long resolvedTripId = tripId != null ? tripId : tripIdParam;
        if (resolvedTripId == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Mã chuyến xe (tripId) không được để trống");
        }
        tripRepository.findById(resolvedTripId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe ID: " + resolvedTripId));
        return ApiResponse.success("Danh sách ghế đang được khóa giữ chỗ", seatRealtimeService.getActiveLocks(resolvedTripId));
    }

    @PostMapping({"/api/seat-locks", "/api/v1/seat-locks", "/api/v1/trips/{tripId}/seat-locks"})
    @Operation(summary = "Khóa giữ chỗ ghế tạm thời 10 phút chống đặt trùng đồng thời")
    public ApiResponse<List<SeatUpdateEvent>> lockSeats(
            @PathVariable(required = false) Long tripId,
            @RequestBody(required = false) SeatHoldRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Dữ liệu yêu cầu khóa ghế không được để trống");
        }
        Long resolvedTripId = tripId != null ? tripId : request.getTripId();
        if (resolvedTripId == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Mã chuyến xe (tripId) không được để trống");
        }
        if (request.getSeatCodes() == null || request.getSeatCodes().isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Danh sách mã ghế (seatCodes) không được để trống");
        }
        if (request.getSessionId() == null || request.getSessionId().isBlank()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Mã phiên giữ chỗ (sessionId) không được để trống");
        }

        Trip trip = tripRepository.findById(resolvedTripId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe ID: " + resolvedTripId));

        if (trip.getStatus() != TripStatus.SCHEDULED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Chuyến xe không còn mở bán vé (Trạng thái: " + trip.getStatus() + ")");
        }
        if (trip.getBusCompany() != null && "SUSPENDED".equalsIgnoreCase(trip.getBusCompany().getStatus())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Nhà xe đang tạm ngừng hoạt động, không thể giữ chỗ ghế");
        }

        List<SeatUpdateEvent> events = seatRealtimeService.holdSeatsWithTtl(
                resolvedTripId, request.getSeatCodes(), request.getSessionId(), request.getTtlSeconds());
        return ApiResponse.success("Giữ chỗ thành công trong 10 phút", events);
    }

    @PostMapping({"/api/seat-locks/release", "/api/v1/seat-locks/release", "/api/v1/trips/{tripId}/seat-locks/release"})
    @Operation(summary = "Giải phóng ghế đang giữ chỗ về trạng thái mở bán trống (AVAILABLE)")
    public ApiResponse<List<SeatUpdateEvent>> releaseSeatLocks(
            @PathVariable(required = false) Long tripId,
            @RequestBody(required = false) SeatHoldRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Dữ liệu yêu cầu giải phóng ghế không được để trống");
        }
        Long resolvedTripId = tripId != null ? tripId : request.getTripId();
        if (resolvedTripId == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Mã chuyến xe (tripId) không được để trống");
        }
        if (request.getSeatCodes() == null || request.getSeatCodes().isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Danh sách mã ghế (seatCodes) cần giải phóng không được để trống");
        }

        tripRepository.findById(resolvedTripId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe ID: " + resolvedTripId));

        List<SeatUpdateEvent> events = seatRealtimeService.releaseSeatsWithSession(
                resolvedTripId, request.getSeatCodes(), request.getSessionId());
        return ApiResponse.success("Đã giải phóng ghế giữ chỗ thành công", events);
    }

    @PostMapping({"/api/seat-locks/expire", "/api/v1/seat-locks/expire", "/api/v1/trips/{tripId}/seat-locks/expire"})
    @Operation(summary = "Thu hồi và làm sạch các khóa ghế đã hết hạn thời gian giữ chỗ")
    public ApiResponse<List<SeatUpdateEvent>> expireSeatLocks(
            @PathVariable(required = false) Long tripId,
            @RequestParam(value = "tripId", required = false) Long tripIdParam,
            @RequestBody(required = false) SeatHoldRequest request) {
        Long resolvedTripId = tripId != null ? tripId : (tripIdParam != null ? tripIdParam : (request != null ? request.getTripId() : null));
        if (resolvedTripId == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Mã chuyến xe (tripId) không được để trống");
        }
        tripRepository.findById(resolvedTripId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe ID: " + resolvedTripId));

        List<String> seatCodes = request != null ? request.getSeatCodes() : null;
        List<SeatUpdateEvent> released = seatRealtimeService.expireLocksImmediately(resolvedTripId, seatCodes);
        return ApiResponse.success("Đã thu hồi các khóa ghế hết hạn thành công", released);
    }

    @PostMapping({"/api/seat-locks/force-release", "/api/v1/seat-locks/force-release"})
    @Operation(summary = "Cưỡng chế giải phóng khóa ghế treo dành cho Quản trị viên hoặc Nhà xe sở hữu chuyến")
    public ApiResponse<List<SeatUpdateEvent>> forceReleaseSeatLocks(
            @RequestHeader(value = "X-Company-Id", required = false) Long companyId,
            @RequestBody(required = false) SeatHoldRequest request) {
        if (request == null || request.getTripId() == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Mã chuyến xe (tripId) không được để trống");
        }
        if (request.getSeatCodes() == null || request.getSeatCodes().isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Danh sách mã ghế (seatCodes) không được để trống");
        }

        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe ID: " + request.getTripId()));

        if (companyId != null && trip.getBusCompany() != null && !trip.getBusCompany().getId().equals(companyId)) {
            throw new AppException(ErrorCode.FORBIDDEN,
                    "Nhà xe không có quyền can thiệp khóa ghế trên chuyến xe thuộc phạm vi nhà xe khác!");
        }

        List<SeatUpdateEvent> released = seatRealtimeService.releaseSeatsWithSession(
                request.getTripId(), request.getSeatCodes(), null);
        return ApiResponse.success("Đã cưỡng chế giải phóng khóa ghế thành công", released);
    }
}

