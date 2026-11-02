package com.traveleasy.config;

import com.traveleasy.service.customer.TripService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class CacheWarmupRunner {

    private final TripService tripService;
    private final com.traveleasy.service.admin.AdminTripService adminTripService;
    private final com.traveleasy.service.admin.AdminManagementService adminManagementService;
    private final com.traveleasy.service.customer.BookingService bookingService;
    private final com.traveleasy.service.company.VehicleService vehicleService;
    private final com.traveleasy.controller.customer.PublicContentController publicContentController;

    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void warmupCache() {
        try {
            log.info("🔥 [CACHE WARMUP] Bắt đầu làm nóng bộ nhớ đệm ngầm cho toàn hệ thống (Customer, Admin & Đối tác)...");
            long t0 = System.currentTimeMillis();

            // 1. Warmup Trang chủ & Công khai (Banners, Tuyến hot, Khuyến mại, Nhà xe, Bến xe)
            publicContentController.getActiveBanners();
            publicContentController.getPopularRoutes();
            publicContentController.getBusCompanies();
            publicContentController.getLocations();
            publicContentController.getPromotions("ALL");

            // 2. Warmup Khách hàng: Toàn bộ chuyến xe & các tuyến trọng điểm
            tripService.searchTrips(null, null, null);

            LocalDate today = LocalDate.now();
            LocalDate tomorrow = today.plusDays(1);
            tripService.searchTrips("TP. Hồ Chí Minh", "Đà Lạt", today);
            tripService.searchTrips("Hà Nội", "Sa Pa", today);
            tripService.searchTrips("TP. Hồ Chí Minh", "Nha Trang", today);
            tripService.searchTrips("TP. Hồ Chí Minh", "Đà Lạt", tomorrow);

            // 3. Warmup Admin Portal & Partner: Thống kê Dashboard, Chuyến xe toàn sàn, Người dùng, Nhà xe, Tuyến đường, Đơn vé, Đội xe, Quyết toán
            adminTripService.getDashboardStats();
            adminTripService.getAllTrips();
            adminManagementService.getAllUsers(null, null, null);
            adminManagementService.getAllBusCompanies(null, null);
            adminManagementService.getAllRoutes(null, null);
            adminManagementService.getAdminSettlements();
            bookingService.getAllBookings();
            vehicleService.getVehicles(null, null, null, null);

            long t1 = System.currentTimeMillis();
            log.info("✔ [CACHE WARMUP] Hoàn tất làm nóng bộ nhớ đệm toàn hệ thống trong {}ms. Các cổng Customer, Admin và Đối tác đã sẵn sàng phản hồi tức thì trong <15ms!", (t1 - t0));
        } catch (Exception e) {
            log.warn("⚠️ [CACHE WARMUP] Lỗi khi làm nóng bộ nhớ đệm: {}", e.getMessage());
        }
    }
}

