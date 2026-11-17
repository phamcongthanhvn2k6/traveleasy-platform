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

    public static final String TRIPS_SEARCH_CACHE = "trips_search";
    public static final long TRIPS_SEARCH_TTL_SECONDS = 60L;

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();

        // [S409] Cache kết quả tìm kiếm chuyến xe (/api/v1/trips/search) với TTL chuẩn 60 giây
        cacheManager.registerCustomCache(
            TRIPS_SEARCH_CACHE,
            Caffeine.newBuilder()
                .initialCapacity(50)
                .maximumSize(500)
                .expireAfterWrite(Duration.ofSeconds(TRIPS_SEARCH_TTL_SECONDS))
                .recordStats()
                .build()
        );

        // Cấu hình bộ nhớ đệm mặc định cho các cache động khác (popular_routes, banners_list, promotions_list...): TTL 10 phút
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

