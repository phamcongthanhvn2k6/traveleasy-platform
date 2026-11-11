package com.traveleasy.controller.common;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.repository.UserRepository;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.sql.DataSource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HealthControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private ObjectProvider<DataSource> dataSourceProvider;

    @InjectMocks
    private HealthController healthController;

    @Test
    @DisplayName("GET /api/v1/health trả về UP kèm DB pool HikariCP và thông số RAM JVM")
    @SuppressWarnings("unchecked")
    void getHealthStatus_WithHikariPool_ReturnsFullMetrics() {
        when(userRepository.count()).thenReturn(25L);
        when(tripRepository.count()).thenReturn(120L);

        HikariDataSource hikari = mock(HikariDataSource.class);
        HikariPoolMXBean mxBean = mock(HikariPoolMXBean.class);
        when(dataSourceProvider.getIfAvailable()).thenReturn(hikari);
        when(hikari.getPoolName()).thenReturn("TravelEasyHikariPool");
        when(hikari.getMaximumPoolSize()).thenReturn(10);
        when(hikari.getHikariPoolMXBean()).thenReturn(mxBean);
        when(mxBean.getActiveConnections()).thenReturn(2);
        when(mxBean.getIdleConnections()).thenReturn(8);
        when(mxBean.getTotalConnections()).thenReturn(10);
        when(mxBean.getThreadsAwaitingConnection()).thenReturn(0);

        ResponseEntity<ApiResponse<Map<String, Object>>> response = healthController.getHealthStatus();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());

        Map<String, Object> data = response.getBody().getData();
        assertEquals("UP", data.get("status"));
        assertEquals("CONNECTED", data.get("database"));
        assertEquals(25L, data.get("userCount"));
        assertEquals(120L, data.get("tripCount"));
        assertNotNull(data.get("memoryUsedMb"));
        assertNotNull(data.get("memoryTotalMb"));
        assertNotNull(data.get("memoryMaxMb"));

        Map<String, Object> dbPool = (Map<String, Object>) data.get("dbPool");
        assertNotNull(dbPool);
        assertEquals("HikariCP", dbPool.get("type"));
        assertEquals("TravelEasyHikariPool", dbPool.get("poolName"));
        assertEquals(2, dbPool.get("active"));
        assertEquals(8, dbPool.get("idle"));
        assertEquals(10, dbPool.get("total"));
        assertEquals(0, dbPool.get("waiting"));
        assertEquals(10, dbPool.get("maxPoolSize"));
        assertEquals("ACTIVE", dbPool.get("status"));
    }

    @Test
    @DisplayName("GET /api/v1/health vẫn trả về UP khi không có DataSource bean")
    @SuppressWarnings("unchecked")
    void getHealthStatus_WithoutDataSource_ReturnsUnavailablePoolStatus() {
        when(userRepository.count()).thenReturn(10L);
        when(tripRepository.count()).thenReturn(20L);
        when(dataSourceProvider.getIfAvailable()).thenReturn(null);

        ResponseEntity<ApiResponse<Map<String, Object>>> response = healthController.getHealthStatus();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> data = response.getBody().getData();
        Map<String, Object> dbPool = (Map<String, Object>) data.get("dbPool");
        assertEquals("UNKNOWN", dbPool.get("type"));
        assertEquals("UNAVAILABLE", dbPool.get("status"));
    }

    @Test
    @DisplayName("GET /api/v1/health trả về 503 DEGRADED khi mất kết nối DB")
    void getHealthStatus_DatabaseError_Returns503() {
        when(userRepository.count()).thenThrow(new RuntimeException("Connection refused"));

        ResponseEntity<ApiResponse<Map<String, Object>>> response = healthController.getHealthStatus();

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("DEGRADED", response.getBody().getData().get("database"));
    }

    @Test
    @DisplayName("GET /api/v1/health/readiness trả về READY khi DB kết nối bình thường")
    void getReadiness_ReturnsReady() {
        when(userRepository.count()).thenReturn(1L);

        ResponseEntity<Map<String, Object>> response = healthController.getReadiness();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("READY", response.getBody().get("status"));
    }
}
