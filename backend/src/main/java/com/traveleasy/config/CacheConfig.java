package com.traveleasy.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        
        // Cấu hình mặc định cho các cache: TTL 10 phút, kích thước tối đa 500 mục
        cacheManager.setCaffeine(
            Caffeine.newBuilder()
                .initialCapacity(50)
                .maximumSize(500)
                .expireAfterWrite(Duration.ofMinutes(10))
                .recordStats()
        );

        // Khai báo trước các tên cache cốt lõi của hệ thống
        cacheManager.setCacheNames(List.of(
            "trips_search",
            "routes_list",
            "bus_companies",
            "locations_list",
            "cancellation_policies",
            "promotions_list",
            "system_stats"
        ));

        return cacheManager;
    }
}
