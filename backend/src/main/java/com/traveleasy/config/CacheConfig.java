package com.traveleasy.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * [P4 PERF] Cấu hình Caffeine Cache với TTL riêng biệt cho từng loại dữ liệu.
 * - Dữ liệu tĩnh (routes, locations): TTL 30 phút
 * - Dữ liệu thay đổi thường xuyên (trips, dashboard): TTL 3-5 phút
 * - Mặc định: TTL 10 phút
 */
@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();

        // Đăng ký per-cache TTL cho các cache quan trọng
        // Dữ liệu dashboard thay đổi nhanh — TTL ngắn để hiển thị cập nhật
        cacheManager.registerCustomCache("company_dashboard_stats",
            Caffeine.newBuilder()
                .initialCapacity(20)
                .maximumSize(100)
                .expireAfterWrite(Duration.ofMinutes(3))
                .recordStats()
                .build());

        // Trips thay đổi thường xuyên (tạo mới, hủy) — TTL 5 phút
        cacheManager.registerCustomCache("company_trips",
            Caffeine.newBuilder()
                .initialCapacity(30)
                .maximumSize(200)
                .expireAfterWrite(Duration.ofMinutes(5))
                .recordStats()
                .build());

        // Routes và Locations ít thay đổi — TTL 30 phút
        cacheManager.registerCustomCache("company_routes",
            Caffeine.newBuilder()
                .initialCapacity(20)
                .maximumSize(100)
                .expireAfterWrite(Duration.ofMinutes(30))
                .recordStats()
                .build());

        cacheManager.registerCustomCache("company_locations",
            Caffeine.newBuilder()
                .initialCapacity(20)
                .maximumSize(100)
                .expireAfterWrite(Duration.ofMinutes(30))
                .recordStats()
                .build());

        // Admin trips và search — TTL 5 phút
        cacheManager.registerCustomCache("admin_all_trips",
            Caffeine.newBuilder()
                .initialCapacity(30)
                .maximumSize(200)
                .expireAfterWrite(Duration.ofMinutes(5))
                .recordStats()
                .build());

        cacheManager.registerCustomCache("trips_search",
            Caffeine.newBuilder()
                .initialCapacity(50)
                .maximumSize(300)
                .expireAfterWrite(Duration.ofMinutes(5))
                .recordStats()
                .build());

        // Cấu hình mặc định cho tất cả cache còn lại (TTL 10 phút — giữ nguyên hành vi cũ)
        cacheManager.setCaffeine(
            Caffeine.newBuilder()
                .initialCapacity(50)
                .maximumSize(500)
                .expireAfterWrite(Duration.ofMinutes(10))
                .recordStats()
        );

        return cacheManager;
    }
}

