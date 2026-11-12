package com.traveleasy.config;

import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Giám sát kết nối CSDL định kỳ (Heartbeat) và tự động xả bỏ kết nối hỏng trong HikariCP
 * để tránh lỗi ngắt kết nối đột ngột khi dùng Supabase Transaction Pooler / mạng chập chờn.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseKeepAliveWatchdog {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectProvider<DataSource> dataSourceProvider;

    private final AtomicReference<String> status = new AtomicReference<>("CONNECTED");
    private final AtomicInteger consecutiveFailures = new AtomicInteger(0);
    private final AtomicLong totalEvictions = new AtomicLong(0);
    private final AtomicReference<LocalDateTime> lastHeartbeatAt = new AtomicReference<>();
    private final AtomicReference<String> lastError = new AtomicReference<>();

    @Scheduled(fixedDelay = 45000, initialDelay = 45000)
    public void scheduledHeartbeat() {
        runHeartbeatCheck();
    }

    /**
     * Thực hiện kiểm tra kết nối nhẹ bằng SELECT 1 và tự động làm mới pool nếu phát hiện lỗi.
     */
    public boolean runHeartbeatCheck() {
        LocalDateTime now = LocalDateTime.now();
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            if (result != null && result == 1) {
                int previousFailures = consecutiveFailures.getAndSet(0);
                status.set("CONNECTED");
                lastHeartbeatAt.set(now);
                lastError.set(null);
                if (previousFailures > 0) {
                    log.info("[DB WATCHDOG] Kết nối CSDL đã phục hồi sau {} lần kiểm tra lỗi.", previousFailures);
                }
                return true;
            }
            handleHeartbeatFailure("SELECT 1 trả về kết quả không hợp lệ", now);
            return false;
        } catch (Exception ex) {
            handleHeartbeatFailure(ex.getMessage(), now);
            return false;
        }
    }

    private void handleHeartbeatFailure(String errorMessage, LocalDateTime now) {
        int failures = consecutiveFailures.incrementAndGet();
        lastHeartbeatAt.set(now);
        lastError.set(errorMessage);
        status.set(failures >= 3 ? "DISCONNECTED" : "RECOVERING");
        log.warn("[DB WATCHDOG] Heartbeat CSDL thất bại (lần {}): {}. Đang xả bỏ kết nối hỏng trong pool...",
                failures, errorMessage);
        evictIdleAndBrokenConnections();
    }

    /**
     * Yêu cầu HikariCP đóng mềm các kết nối nhàn rỗi/hỏng để mở lại kết nối mới sạch sẽ.
     */
    public boolean evictIdleAndBrokenConnections() {
        DataSource dataSource = dataSourceProvider.getIfAvailable();
        if (dataSource instanceof HikariDataSource hikari) {
            HikariPoolMXBean poolMXBean = hikari.getHikariPoolMXBean();
            if (poolMXBean != null) {
                poolMXBean.softEvictConnections();
                long count = totalEvictions.incrementAndGet();
                log.info("[DB WATCHDOG] Đã kích hoạt softEvictConnections trên pool '{}' (tổng lần xả: {}).",
                        hikari.getPoolName(), count);
                return true;
            }
        }
        return false;
    }

    public Map<String, Object> getWatchdogMetrics() {
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("status", status.get());
        metrics.put("consecutiveFailures", consecutiveFailures.get());
        metrics.put("totalEvictions", totalEvictions.get());
        metrics.put("lastHeartbeatAt", lastHeartbeatAt.get());
        if (lastError.get() != null) {
            metrics.put("lastError", lastError.get());
        }
        return metrics;
    }
}
