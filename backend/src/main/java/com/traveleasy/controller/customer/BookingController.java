package com.traveleasy.controller.customer;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.booking.BookingResponse;
import com.traveleasy.dto.booking.CancelPartialRequest;
import com.traveleasy.dto.booking.CreateBookingRequest;
import com.traveleasy.dto.booking.RescheduleRequest;
import com.traveleasy.service.customer.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking Management", description = "Đặt vé xe, tra cứu vé và quản lý đơn đặt vé")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Đặt vé xe khách (Trừ ghế nguyên tử chống Race Condition)")
    public ApiResponse<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ApiResponse.success("Đặt vé thành công", bookingService.createBooking(request, email));
    }

    @GetMapping("/code/{bookingCode}")
    @Operation(summary = "Tra cứu đơn đặt vé theo mã vé (VD: BK-20261019-XXXX)")
    public ApiResponse<BookingResponse> getBookingByCode(@PathVariable String bookingCode) {
        return ApiResponse.success(bookingService.getBookingByCode(bookingCode));
    }

    @GetMapping("/my-bookings")
    @Operation(summary = "Lấy danh sách vé đã đặt của người dùng hiện tại")
    public ApiResponse<List<BookingResponse>> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ApiResponse.error("Vui lòng đăng nhập để xem danh sách vé của bạn");
        }
        return ApiResponse.success(bookingService.getUserBookings(userDetails.getUsername()));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Hủy toàn bộ đơn đặt vé và hoàn trả ghế trống")
    public ApiResponse<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ApiResponse.success("Hủy vé thành công", bookingService.cancelBooking(id, email));
    }

    @PostMapping("/{id}/cancel-partial")
    @Operation(summary = "Hủy từng vé cụ thể trong đơn (Partial Cancellation - UC-1.11)")
    public ApiResponse<BookingResponse> cancelPartial(
            @PathVariable Long id,
            @Valid @RequestBody CancelPartialRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ApiResponse.success("Hủy vé từng phần thành công", bookingService.cancelPartialTickets(id, request.getTicketIds(), email));
    }

    @PostMapping("/{id}/reschedule")
    @Operation(summary = "Yêu cầu đổi ngày / đổi chuyến sang chuyến mới (Reschedule - UC-1.16)")
    public ApiResponse<BookingResponse> reschedule(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ApiResponse.success("Đổi chuyến thành công", bookingService.rescheduleTicket(
                id, request.getTicketId(), request.getNewTripId(), request.getNewSeatNumber(), email));
    }
}
