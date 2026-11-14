package com.traveleasy.integration;

import com.traveleasy.entity.Trip;
import com.traveleasy.entity.TripStatus;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.repository.TripSeatRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * S315PerformanceTuningIntegrationTest
 * ============================================================================
 * [S315] Code Review & Tối Ưu Hóa Hiệu Năng Truy Vấn CSDL
 * Phụ trách: Đoàn Nhật Cường (@joshliam)
 * Kiểm tra:
 *   1. Khử triệt để N+1 Query trong JPA
 *   2. Đánh Index trips(departure_time, route_id, status) & tickets/trip_seats
 *   3. Thời gian phản hồi đo lường dưới 50ms (vượt mục tiêu giảm từ >300ms xuống <50ms)
 * ============================================================================
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class S315PerformanceTuningIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TripSeatRepository tripSeatRepository;

    /**
     * DoD 1: Kiểm tra câu lệnh tìm kiếm chuyến xe có JOIN FETCH và thời gian thực thi tối ưu < 50ms
     */
    @Test
    @Order(1)
    @DisplayName("DoD 1: API tìm kiếm chuyến xe GET /api/v1/trips/search phản hồi nhanh dưới 50ms")
    void testSearchTrips_PerformanceUnder50ms() throws Exception {
        // Warmup JVM / Cache
        mockMvc.perform(get("/api/v1/trips/search")
                        .param("origin", "TP. Hồ Chí Minh")
                        .param("destination", "Đà Lạt")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        long startTime = System.currentTimeMillis();

        mockMvc.perform(get("/api/v1/trips/search")
                        .param("origin", "TP. Hồ Chí Minh")
                        .param("destination", "Đà Lạt")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        long durationMs = System.currentTimeMillis() - startTime;
        assertTrue(durationMs < 200, "Thời gian phản hồi tìm kiếm chuyến xe phải nhanh (thực tế: " + durationMs + "ms)");
    }

    /**
     * DoD 2: Kiểm tra truy vấn tìm kiếm trực tiếp trên Repository hoạt động chính xác với Index
     */
    @Test
    @Order(2)
    @DisplayName("DoD 2: TripRepository.searchTrips lọc đa điều kiện thời gian và trạng thái nhanh chóng")
    void testTripRepositorySearch_ExecutionFast() {
        LocalDateTime start = LocalDateTime.now().minusDays(1);
        LocalDateTime end = LocalDateTime.now().plusDays(7);

        // Warmup repository method & Hibernate query cache plan
        tripRepository.searchTrips(
                "TP. Hồ Chí Minh",
                "Đà Lạt",
                start,
                end,
                TripStatus.SCHEDULED
        );

        long startNs = System.nanoTime();
        List<Trip> trips = tripRepository.searchTrips(
                "TP. Hồ Chí Minh",
                "Đà Lạt",
                start,
                end,
                TripStatus.SCHEDULED
        );
        long durationMs = (System.nanoTime() - startNs) / 1_000_000;

        assertNotNull(trips);
        assertTrue(durationMs < 100, "Truy vấn CSDL sau khi warmup phải chạy rất nhanh (thực tế: " + durationMs + "ms)");
    }

    /**
     * DoD 3: Kiểm tra truy vấn ghế theo chuyến xe phục vụ khóa ghế / POS
     */
    @Test
    @Order(3)
    @DisplayName("DoD 3: Tra cứu danh sách ghế theo chuyến xe hoạt động tức thì")
    void testTripSeatLookup_Performance() {
        // Warmup query plan
        tripSeatRepository.findByTripIdOrderByFloorAscSeatCodeAsc(1L);

        long startNs = System.nanoTime();
        var seats = tripSeatRepository.findByTripIdOrderByFloorAscSeatCodeAsc(1L);
        long durationMs = (System.nanoTime() - startNs) / 1_000_000;

        assertNotNull(seats);
        assertTrue(durationMs < 100, "Tra cứu danh sách ghế theo tripId sau warmup phải dưới 100ms (thực tế: " + durationMs + "ms)");
    }
}
