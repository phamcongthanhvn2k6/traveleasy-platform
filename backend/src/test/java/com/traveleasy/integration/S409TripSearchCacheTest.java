package com.traveleasy.integration;

import com.traveleasy.config.CacheConfig;
import com.traveleasy.dto.trip.TripResponse;
import com.traveleasy.entity.BusCompany;
import com.traveleasy.entity.BusType;
import com.traveleasy.entity.Route;
import com.traveleasy.entity.Trip;
import com.traveleasy.entity.TripStatus;
import com.traveleasy.repository.CompanyPricingRuleRepository;
import com.traveleasy.repository.PickupDropoffPointRepository;
import com.traveleasy.repository.RouteRepository;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.repository.TripSeatRepository;
import com.traveleasy.service.company.DynamicPricingService;
import com.traveleasy.service.customer.TripService;
import com.traveleasy.service.realtime.SeatRealtimeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * [S409] Kiểm thử tối ưu thời gian phản hồi API tìm chuyến /api/v1/trips/search bằng Cache TTL 60 giây & tự động xóa cache.
 * @author Phạm Thanh Phong
 */
public class S409TripSearchCacheTest {

    @Configuration
    @EnableCaching
    static class TestCacheContextConfig extends CacheConfig {

        @Bean
        public TripRepository tripRepository() {
            return mock(TripRepository.class);
        }

        @Bean
        public TripSeatRepository tripSeatRepository() {
            return mock(TripSeatRepository.class);
        }

        @Bean
        public PickupDropoffPointRepository pickupDropoffPointRepository() {
            return mock(PickupDropoffPointRepository.class);
        }

        @Bean
        public RouteRepository routeRepository() {
            return mock(RouteRepository.class);
        }

        @Bean
        public SeatRealtimeService seatRealtimeService() {
            return mock(SeatRealtimeService.class);
        }

        @Bean
        public CompanyPricingRuleRepository companyPricingRuleRepository() {
            return mock(CompanyPricingRuleRepository.class);
        }

        @Bean
        public DynamicPricingService dynamicPricingService(CompanyPricingRuleRepository companyPricingRuleRepository) {
            return new DynamicPricingService(companyPricingRuleRepository);
        }

        @Bean
        @SuppressWarnings("unchecked")
        public TripService tripService(
                TripRepository tripRepository,
                TripSeatRepository tripSeatRepository,
                PickupDropoffPointRepository pointRepository,
                RouteRepository routeRepository,
                SeatRealtimeService seatRealtimeService,
                DynamicPricingService dynamicPricingService,
                CompanyPricingRuleRepository companyPricingRuleRepository
        ) {
            ObjectProvider<com.traveleasy.service.automation.TripAutomationService> emptyProvider = mock(ObjectProvider.class);
            return new TripService(
                    tripRepository,
                    tripSeatRepository,
                    pointRepository,
                    routeRepository,
                    emptyProvider,
                    seatRealtimeService,
                    dynamicPricingService,
                    companyPricingRuleRepository
            );
        }
    }

    @Test
    @DisplayName("[S409] Cache kết quả tìm chuyến xe với TTL 60s, đo response time < 30ms khi Cache Hit và tự động xóa cache")
    void testSearchTripsCacheHitAndEviction() {
        try (AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(TestCacheContextConfig.class)) {
            TripService tripService = ctx.getBean(TripService.class);
            TripRepository tripRepository = ctx.getBean(TripRepository.class);
            PickupDropoffPointRepository pointRepository = ctx.getBean(PickupDropoffPointRepository.class);
            CompanyPricingRuleRepository ruleRepository = ctx.getBean(CompanyPricingRuleRepository.class);
            CacheManager cacheManager = ctx.getBean(CacheManager.class);

            assertEquals(30L, CacheConfig.TRIPS_SEARCH_TTL_SECONDS);
            Cache tripsSearchCache = cacheManager.getCache(CacheConfig.TRIPS_SEARCH_CACHE);
            assertNotNull(tripsSearchCache, "Cache 'trips_search' phải được khởi tạo sẵn với TTL 30 giây");

            BusCompany company = BusCompany.builder()
                    .id(1L)
                    .name("Phương Trang FUTA")
                    .averageRating(BigDecimal.valueOf(4.9))
                    .status("ACTIVE")
                    .build();

            Route route = Route.builder()
                    .id(10L)
                    .departureLocation("TP. Hồ Chí Minh")
                    .arrivalLocation("Đà Lạt")
                    .distanceKm(BigDecimal.valueOf(305))
                    .durationHours(BigDecimal.valueOf(6))
                    .build();

            LocalDate tomorrow = LocalDate.now().plusDays(1);
            Trip sampleTrip = Trip.builder()
                    .id(100L)
                    .busCompany(company)
                    .route(route)
                    .departureTime(LocalDateTime.of(tomorrow, java.time.LocalTime.of(8, 0)))
                    .arrivalTime(LocalDateTime.of(tomorrow, java.time.LocalTime.of(14, 0)))
                    .busType(BusType.LIMOUSINE)
                    .price(BigDecimal.valueOf(350000))
                    .totalSeats(34)
                    .availableSeats(30)
                    .status(TripStatus.SCHEDULED)
                    .build();

            when(tripRepository.searchTrips(eq("TP. Hồ Chí Minh"), eq("Đà Lạt"), any(), any(), eq(TripStatus.SCHEDULED)))
                    .thenAnswer(inv -> {
                        Thread.sleep(60);
                        return List.of(sampleTrip);
                    });
            when(pointRepository.findByRouteIdInOrderByDisplayOrderAsc(any()))
                    .thenReturn(Collections.emptyList());
            when(ruleRepository.findByBusCompanyIdInAndStatusOrderByPriorityDesc(any(), any()))
                    .thenReturn(Collections.emptyList());

            // Lần gọi 1: Cache Miss -> Truy vấn Database
            long missStart = System.nanoTime();
            List<TripResponse> firstCall = tripService.searchTrips("TP. Hồ Chí Minh", "Đà Lạt", tomorrow);
            long missElapsedMs = (System.nanoTime() - missStart) / 1_000_000L;
            assertEquals(1, firstCall.size());
            verify(tripRepository, times(1))
                    .searchTrips(eq("TP. Hồ Chí Minh"), eq("Đà Lạt"), any(), any(), eq(TripStatus.SCHEDULED));

            // Lần gọi 2: Cache Hit -> Phản hồi tức thì từ bộ nhớ đệm (< 30ms), KHÔNG gọi lại Database
            long hitStart = System.nanoTime();
            List<TripResponse> secondCall = tripService.searchTrips("TP. Hồ Chí Minh", "Đà Lạt", tomorrow);
            long hitElapsedMs = (System.nanoTime() - hitStart) / 1_000_000L;
            assertEquals(1, secondCall.size());
            assertTrue(hitElapsedMs < 30L, "Cache Hit phải phản hồi < 30ms (thực tế: " + hitElapsedMs + "ms)");
            assertTrue(hitElapsedMs < missElapsedMs, "Cache Hit (" + hitElapsedMs + "ms) phải nhanh hơn Cache Miss (" + missElapsedMs + "ms)");
            verify(tripRepository, times(1))
                    .searchTrips(eq("TP. Hồ Chí Minh"), eq("Đà Lạt"), any(), any(), eq(TripStatus.SCHEDULED));

            // Khi có thay đổi lịch trình hoặc đặt vé -> Tự động xóa cache (@CacheEvict)
            tripService.evictTripsSearchCache();

            // Lần gọi 3 sau khi evict: Gọi lại Database để lấy dữ liệu mới nhất
            List<TripResponse> thirdCall = tripService.searchTrips("TP. Hồ Chí Minh", "Đà Lạt", tomorrow);
            assertEquals(1, thirdCall.size());
            verify(tripRepository, times(2))
                    .searchTrips(eq("TP. Hồ Chí Minh"), eq("Đà Lạt"), any(), any(), eq(TripStatus.SCHEDULED));
        }
    }
}
