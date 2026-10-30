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
        
        // Cấu hình bộ nhớ đệm Caffeine in-memory: TTL 10 phút, kích thước tối đa 500 mục
        // Không giới hạn cứng danh sách cacheNames để hệ thống tự động khởi tạo cache động (dynamic)
        // cho bất kỳ @Cacheable nào (popular_routes, banners_list, trips_search, promotions_list...)
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

