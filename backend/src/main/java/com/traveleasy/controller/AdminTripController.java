package com.traveleasy.controller;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.admin.CreateTripRequest;
import com.traveleasy.dto.admin.DashboardStatsResponse;
import com.traveleasy.dto.trip.TripResponse;
import com.traveleasy.entity.TripStatus;
import com.traveleasy.service.AdminTripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Management", description = "Quản lý chuyến xe, kho ghế và Thống kê Dashboard")
public class AdminTripController {

    private final AdminTripService adminTripService;

    @PostMapping("/trips")
    @Operation(summary = "Tạo chuyến xe mới (Tự động sinh kho ghế 2 tầng A01-A17, B01-B17)")
    public ApiResponse<TripResponse> createTrip(@Valid @RequestBody CreateTripRequest request) {
        return ApiResponse.success("Tạo chuyến xe thành công", adminTripService.createTrip(request));
    }

    @PatchMapping("/trips/{id}/status")
    @Operation(summary = "Cập nhật trạng thái chuyến xe (SCHEDULED, DEPARTED, CANCELLED)")
    public ApiResponse<TripResponse> updateStatus(@PathVariable Long id, @RequestParam TripStatus status) {
        return ApiResponse.success("Cập nhật trạng thái thành công", adminTripService.updateTripStatus(id, status));
    }

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Thống kê tổng quan Dashboard: Doanh thu, số chuyến, số vé, số hành khách")
    public ApiResponse<DashboardStatsResponse> getDashboardStats() {
        return ApiResponse.success(adminTripService.getDashboardStats());
    }
}
