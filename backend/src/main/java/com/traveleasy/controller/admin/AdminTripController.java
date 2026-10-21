package com.traveleasy.controller.admin;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.admin.CreateTripRequest;
import com.traveleasy.dto.admin.DashboardStatsResponse;
import com.traveleasy.dto.trip.TripResponse;
import com.traveleasy.dto.booking.BookingResponse;
import com.traveleasy.entity.TripStatus;
import com.traveleasy.entity.BookingStatus;
import com.traveleasy.service.admin.AdminTripService;
import com.traveleasy.service.customer.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Management", description = "Quản lý chuyến xe, kho ghế và Thống kê Dashboard")
public class AdminTripController {

    private final AdminTripService adminTripService;
    private final BookingService bookingService;

    @GetMapping("/trips")
    @Operation(summary = "Lấy toàn bộ danh sách chuyến xe trên sàn cho Quản trị viên")
    public ApiResponse<List<TripResponse>> getAllTrips() {
        return ApiResponse.success(adminTripService.getAllTrips());
    }

    @GetMapping("/bookings")
    @Operation(summary = "Lấy toàn bộ danh sách đơn đặt vé của khách hàng trên hệ thống")
    public ApiResponse<List<BookingResponse>> getAllBookings() {
        return ApiResponse.success(bookingService.getAllBookings());
    }

    @PatchMapping("/bookings/{id}/status")
    @Operation(summary = "Cập nhật trạng thái đơn đặt vé (CONFIRMED, CANCELLED, PENDING)")
    public ApiResponse<BookingResponse> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status) {
        return ApiResponse.success("Cập nhật trạng thái đơn vé thành công", bookingService.updateBookingStatus(id, status));
    }

    @PostMapping("/trips")
    @Operation(summary = "Tạo chuyến xe mới (Tự động sinh kho ghế 2 tầng A01-A17, B01-B17)")
    public ApiResponse<TripResponse> createTrip(@Valid @RequestBody CreateTripRequest request) {
        return ApiResponse.success("Tạo chuyến xe thành công", adminTripService.createTrip(request));
    }

    @PutMapping("/trips/{id}")
    @Operation(summary = "Cập nhật thông tin chuyến xe (giờ chạy, loại xe, giá vé)")
    public ApiResponse<TripResponse> updateTrip(
            @PathVariable Long id,
            @RequestBody com.traveleasy.dto.admin.UpdateTripRequest request) {
        return ApiResponse.success("Cập nhật chuyến xe thành công", adminTripService.updateTrip(id, request));
    }

    @DeleteMapping("/trips/{id}")
    @Operation(summary = "Xoá chuyến xe và giải phóng kho ghế liên quan")
    public ApiResponse<Void> deleteTrip(@PathVariable Long id) {
        adminTripService.deleteTrip(id);
        return ApiResponse.success("Xoá chuyến xe thành công", null);
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
