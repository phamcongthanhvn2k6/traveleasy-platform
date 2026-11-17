package com.traveleasy.service.common;

import com.traveleasy.dto.notification.NotificationResponse;
import com.traveleasy.entity.Notification;
import com.traveleasy.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public List<NotificationResponse> getNotificationsForUser(String email, String role) {
        String targetRole = (role != null && !role.isBlank()) ? role.toUpperCase() : "CUSTOMER";

        // Khởi tạo các thông báo thực tế mẫu từ CSDL nếu chưa có
        if (notificationRepository.count() == 0) {
            seedInitialNotifications();
        }

        List<Notification> list = notificationRepository.findForUser(email, targetRole);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(String email, String role) {
        String targetRole = (role != null && !role.isBlank()) ? role.toUpperCase() : "CUSTOMER";
        notificationRepository.markAllAsReadForUser(email, targetRole);
    }

    @Transactional
    public NotificationResponse createNotification(String type, String targetRole, String title, String message, String link, String priority) {
        Notification notification = Notification.builder()
                .type(type != null ? type : "SYSTEM")
                .targetRole(targetRole != null ? targetRole : "ALL")
                .title(title)
                .message(message)
                .link(link != null ? link : "/")
                .isRead(false)
                .priority(priority != null ? priority : "NORMAL")
                .createdAt(LocalDateTime.now())
                .build();

        Notification saved = notificationRepository.save(notification);
        return mapToResponse(saved);
    }

    @Transactional
    public NotificationResponse createTestNotification(String role) {
        String targetRole = (role != null && !role.isBlank()) ? role.toUpperCase() : "ADMIN";
        return createNotification(
                "SYSTEM",
                targetRole,
                "⚡ Bắn Test Live: Hệ thống CSDL Thời Gian Thực",
                "Thông báo test thời gian thực đã lưu thành công vào CSDL Supabase lúc " + LocalDateTime.now().toLocalTime().toString().substring(0, 8),
                targetRole.equals("ADMIN") ? "/admin/audit-logs" : "/my-tickets",
                "HIGH"
        );
    }

    private void seedInitialNotifications() {
        List<Notification> initial = Arrays.asList(
                // ADMIN
                Notification.builder()
                        .type("SECURITY")
                        .targetRole("ADMIN")
                        .title("🛡️ Cảnh báo an ninh mạng & Kiểm toán")
                        .message("Hệ thống Audit Log ghi nhận thao tác can thiệp CSDL được mã hóa bất khả biến.")
                        .link("/admin/audit-logs")
                        .isRead(false)
                        .priority("HIGH")
                        .createdAt(LocalDateTime.now().minusMinutes(5))
                        .build(),
                Notification.builder()
                        .type("COMPANY")
                        .targetRole("ADMIN")
                        .title("🏢 Hồ sơ nhà xe mới chờ duyệt")
                        .message("Nhà xe Việt Thắng vừa nộp hồ sơ mở tuyến mới trên sàn, đang chờ xét duyệt.")
                        .link("/admin/bus-companies")
                        .isRead(false)
                        .priority("NORMAL")
                        .createdAt(LocalDateTime.now().minusMinutes(25))
                        .build(),
                Notification.builder()
                        .type("FINANCE")
                        .targetRole("ADMIN")
                        .title("💵 Yêu cầu đối soát & rút tiền")
                        .message("Phương Trang vừa gửi yêu cầu tất toán doanh thu đợt 2: 45.200.000 đ.")
                        .link("/admin/settlements")
                        .isRead(false)
                        .priority("HIGH")
                        .createdAt(LocalDateTime.now().minusHours(1))
                        .build(),
                Notification.builder()
                        .type("REVIEW")
                        .targetRole("ADMIN")
                        .title("⚠️ Báo cáo đánh giá vi phạm")
                        .message("Hành khách khiếu nại bài đánh giá sai sự thật về tuyến Hà Nội - Hải Phòng.")
                        .link("/admin/review-reports")
                        .isRead(false)
                        .priority("NORMAL")
                        .createdAt(LocalDateTime.now().minusHours(2))
                        .build(),

                // OPERATOR
                Notification.builder()
                        .type("BOOKING")
                        .targetRole("OPERATOR")
                        .title("🎟️ Đơn vé mới vừa đặt thành công")
                        .message("Khách hàng vừa đặt vé ghế A03 (Sa Pa - Hà Nội). Đã thanh toán 450.000 đ.")
                        .link("/company/bookings")
                        .isRead(false)
                        .priority("HIGH")
                        .createdAt(LocalDateTime.now().minusMinutes(3))
                        .build(),
                Notification.builder()
                        .type("CHECKIN")
                        .targetRole("OPERATOR")
                        .title("⚡ Soát vé QR Scanner tại cửa xe")
                        .message("Vé TK-20261101-6BFF-01 (Ghế A03) vừa được quét thành công qua camera kiểm soát vé.")
                        .link("/company/scanner")
                        .isRead(false)
                        .priority("NORMAL")
                        .createdAt(LocalDateTime.now().minusMinutes(12))
                        .build(),

                // CUSTOMER
                Notification.builder()
                        .type("BOOKING")
                        .targetRole("CUSTOMER")
                        .title("🎟️ Đặt vé thành công - Mã vé BK-9812")
                        .message("Vé xe Limousine TP.HCM đi Đà Lạt (19:00 hôm nay) đã thanh toán thành công. Mã QR lên xe đã sẵn sàng.")
                        .link("/lookup?code=BK-9812")
                        .isRead(false)
                        .priority("HIGH")
                        .createdAt(LocalDateTime.now().minusMinutes(10))
                        .build(),
                Notification.builder()
                        .type("FINANCE")
                        .targetRole("CUSTOMER")
                        .title("🎁 Tặng bạn Voucher GIAM30K")
                        .message("Mã giảm giá 30.000đ cho chuyến xe liên tỉnh cuối tuần này đã được lưu vào ví ưu đãi của bạn.")
                        .link("/promotions")
                        .isRead(false)
                        .priority("NORMAL")
                        .createdAt(LocalDateTime.now().minusHours(3))
                        .build()
        );

        notificationRepository.saveAll(initial);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .role(n.getTargetRole())
                .title(n.getTitle())
                .message(n.getMessage())
                .timestamp(formatTimeAgo(n.getCreatedAt()))
                .link(n.getLink())
                .isRead(Boolean.TRUE.equals(n.getIsRead()))
                .priority(n.getPriority())
                .build();
    }

    private String formatTimeAgo(LocalDateTime time) {
        if (time == null) return "Vừa xong";
        Duration duration = Duration.between(time, LocalDateTime.now());
        long seconds = duration.getSeconds();
        if (seconds < 60) return "Vừa xong";
        long minutes = duration.toMinutes();
        if (minutes < 60) return minutes + " phút trước";
        long hours = duration.toHours();
        if (hours < 24) return hours + " giờ trước";
        long days = duration.toDays();
        return days + " ngày trước";
    }
}
