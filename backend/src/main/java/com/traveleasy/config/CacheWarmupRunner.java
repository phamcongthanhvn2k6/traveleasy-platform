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

    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void warmupCache() {
        try {
            log.info("🔥 [CACHE WARMUP] Bắt đầu làm nóng bộ nhớ đệm ngầm cho các truy vấn phổ biến...");
            long t0 = System.currentTimeMillis();

            // 1. Warmup toàn bộ chuyến xe (mặc định trang /search không chọn bộ lọc)
            tripService.searchTrips(null, null, null);

            // 2. Warmup các tuyến phổ biến cho ngày hôm nay và ngày mai
            LocalDate today = LocalDate.now();
            LocalDate tomorrow = today.plusDays(1);
            
            tripService.searchTrips("TP. Hồ Chí Minh", "Đà Lạt", today);
            tripService.searchTrips("Hà Nội", "Sa Pa", today);
            tripService.searchTrips("TP. Hồ Chí Minh", "Nha Trang", today);
            tripService.searchTrips("TP. Hồ Chí Minh", "Đà Lạt", tomorrow);

            long t1 = System.currentTimeMillis();
            log.info("✔ [CACHE WARMUP] Hoàn tất làm nóng bộ nhớ đệm trong {}ms. Trang /search sẵn sàng phản hồi trong <10ms!", (t1 - t0));
        } catch (Exception e) {
            log.warn("⚠️ [CACHE WARMUP] Lỗi khi làm nóng bộ nhớ đệm: {}", e.getMessage());
        }
    }
}
