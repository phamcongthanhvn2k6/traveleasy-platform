package com.traveleasy.controller.common;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.config.DatabaseKeepAliveWatchdog;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.repository.UserRepository;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Controller giám sát sức khỏe, độ sẵn sàng và chỉ số vận hành (Sprint 4 - S407 / S308)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
@Tag(name = "Health & Monitoring", description = "Điểm kiểm tra sức khỏe hệ thống, độ sẵn sàng (Readiness/Liveness) và chỉ số vận hành")
public class HealthController {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final ObjectProvider<DataSource> dataSourceProvider;

    @Autowired(required = false)
    private DatabaseKeepAliveWatchdog databaseKeepAliveWatchdog;

    @GetMapping
    @Operation(summary = "Kiểm tra toàn diện trạng thái hệ thống, DB pool và bộ nhớ")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealthStatus() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("version", "1.0.0-RELEASE");
        health.put("timestamp", LocalDateTime.now());
        health.put("uptimeMs", ManagementFactory.getRuntimeMXBean().getUptime());

        // Kiểm tra kết nối DB thực tế
        try {
            long userCount = userRepository.count();
            long tripCount = tripRepository.count();
            health.put("database", "CONNECTED");
            health.put("userCount", userCount);
            health.put("tripCount", tripCount);
        } catch (Exception e) {
            log.error("Lỗi kết nối cơ sở dữ liệu khi kiểm tra health: {}", e.getMessage());
            health.put("database", "DEGRADED");
            health.put("error", e.getMessage());
            return ResponseEntity.status(503).body(ApiResponse.error("Hệ thống cơ sở dữ liệu đang gián đoạn", health));
        }

        // Thông số DB Connection Pool (HikariCP)
        health.put("dbPool", resolveDbPoolMetrics());
        if (databaseKeepAliveWatchdog != null) {
            health.put("dbWatchdog", databaseKeepAliveWatchdog.getWatchdogMetrics());
        }

        // Thông tin bộ nhớ JVM
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory() / (1024 * 1024);
        long freeMemory = runtime.freeMemory() / (1024 * 1024);
        long usedMemory = totalMemory - freeMemory;
        long maxMemory = runtime.maxMemory() / (1024 * 1024);
        health.put("memoryUsedMb", usedMemory);
        health.put("memoryTotalMb", totalMemory);
        health.put("memoryMaxMb", maxMemory);

        return ResponseEntity.ok(ApiResponse.success("Hệ thống TravelEasy Platform đang hoạt động bình thường", health));
    }

    private Map<String, Object> resolveDbPoolMetrics() {
        Map<String, Object> poolInfo = new LinkedHashMap<>();
        DataSource dataSource = dataSourceProvider.getIfAvailable();
        if (dataSource instanceof HikariDataSource hikari) {
            poolInfo.put("type", "HikariCP");
            poolInfo.put("poolName", hikari.getPoolName());
            poolInfo.put("maxPoolSize", hikari.getMaximumPoolSize());
            HikariPoolMXBean mxBean = hikari.getHikariPoolMXBean();
            if (mxBean != null) {
                poolInfo.put("active", mxBean.getActiveConnections());
                poolInfo.put("idle", mxBean.getIdleConnections());
                poolInfo.put("total", mxBean.getTotalConnections());
                poolInfo.put("waiting", mxBean.getThreadsAwaitingConnection());
            }
            poolInfo.put("status", "ACTIVE");
        } else if (dataSource != null) {
            poolInfo.put("type", dataSource.getClass().getSimpleName());
            poolInfo.put("status", "ACTIVE");
        } else {
            poolInfo.put("type", "UNKNOWN");
            poolInfo.put("status", "UNAVAILABLE");
        }
        return poolInfo;
    }

    @GetMapping("/liveness")
    @Operation(summary = "Kubernetes / Container Liveness probe")
    public ResponseEntity<Map<String, String>> getLiveness() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    @GetMapping("/readiness")
    @Operation(summary = "Kubernetes / Container Readiness probe")
    public ResponseEntity<Map<String, Object>> getReadiness() {
        try {
            userRepository.count();
            return ResponseEntity.ok(Map.of("status", "READY", "database", "CONNECTED"));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of("status", "NOT_READY", "reason", e.getMessage()));
        }
    }
}

