package com.traveleasy.controller.common;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.notification.NotificationResponse;
import com.traveleasy.service.common.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Real-time Notification", description = "Hệ thống thông báo thời gian thực & CSDL")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Lấy danh sách thông báo theo vai trò và tài khoản người dùng")
    public ApiResponse<List<NotificationResponse>> getNotifications(
            @RequestParam(required = false) String role,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ApiResponse.success(notificationService.getNotificationsForUser(email, role));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Đánh dấu đã đọc cho một thông báo")
    public ApiResponse<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ApiResponse.success("Đã đánh dấu đã đọc", null);
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Đánh dấu đã đọc tất cả thông báo")
    public ApiResponse<Void> markAllAsRead(
            @RequestParam(required = false) String role,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        notificationService.markAllAsRead(email, role);
        return ApiResponse.success("Đã đánh dấu đã đọc tất cả thông báo", null);
    }

    @PostMapping("/test-live")
    @Operation(summary = "Bắn thử nghiệm thông báo Real-time lưu trực tiếp vào CSDL")
    public ApiResponse<NotificationResponse> testLive(
            @RequestParam(defaultValue = "ADMIN") String role) {
        return ApiResponse.success("Bắn thông báo test live thành công", notificationService.createTestNotification(role));
    }
}
