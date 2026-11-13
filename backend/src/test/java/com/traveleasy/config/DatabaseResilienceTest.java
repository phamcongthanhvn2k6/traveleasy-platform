package com.traveleasy.config;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.GlobalExceptionHandler;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.CannotCreateTransactionException;

import javax.sql.DataSource;
import java.sql.SQLTransientConnectionException;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DatabaseResilienceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Mock
    private ObjectProvider<DataSource> dataSourceProvider;

    @Mock
    private HikariDataSource hikariDataSource;

    @Mock
    private HikariPoolMXBean hikariPoolMXBean;

    @Test
    void watchdogEvictsPoolOnFailureAndRecoversOnSuccess() {
        when(dataSourceProvider.getIfAvailable()).thenReturn(hikariDataSource);
        when(hikariDataSource.getHikariPoolMXBean()).thenReturn(hikariPoolMXBean);
        when(hikariDataSource.getPoolName()).thenReturn("TravelEasyHikariPool");

        DatabaseKeepAliveWatchdog watchdog = new DatabaseKeepAliveWatchdog(jdbcTemplate, dataSourceProvider);

        when(jdbcTemplate.queryForObject("SELECT 1", Integer.class))
                .thenThrow(new DataAccessResourceFailureException("Connection reset"))
                .thenThrow(new DataAccessResourceFailureException("Connection reset"))
                .thenThrow(new DataAccessResourceFailureException("Connection reset"))
                .thenReturn(1);

        assertFalse(watchdog.runHeartbeatCheck());
        assertEquals("RECOVERING", watchdog.getWatchdogMetrics().get("status"));
        assertEquals(1, watchdog.getWatchdogMetrics().get("consecutiveFailures"));

        assertFalse(watchdog.runHeartbeatCheck());
        assertFalse(watchdog.runHeartbeatCheck());
        Map<String, Object> disconnected = watchdog.getWatchdogMetrics();
        assertEquals("DISCONNECTED", disconnected.get("status"));
        assertEquals(3, disconnected.get("consecutiveFailures"));
        assertEquals(3L, disconnected.get("totalEvictions"));
        verify(hikariPoolMXBean, times(3)).softEvictConnections();

        assertTrue(watchdog.runHeartbeatCheck());
        Map<String, Object> recovered = watchdog.getWatchdogMetrics();
        assertEquals("CONNECTED", recovered.get("status"));
        assertEquals(0, recovered.get("consecutiveFailures"));
        assertNull(recovered.get("lastError"));
    }

    @Test
    void retryAspectClassifiesTransientVsBusinessExceptions() {
        CannotCreateTransactionException txOpenFail =
                new CannotCreateTransactionException("Could not open JPA EntityManager for transaction");
        assertTrue(TransientDbRetryAspect.isRetryableConnectionFailure(txOpenFail, false));
        assertTrue(TransientDbRetryAspect.isRetryableConnectionFailure(txOpenFail, true));

        SQLTransientConnectionException transientReadFail =
                new SQLTransientConnectionException("Connection is closed");
        assertTrue(TransientDbRetryAspect.isRetryableConnectionFailure(transientReadFail, true));
        assertFalse(TransientDbRetryAspect.isRetryableConnectionFailure(transientReadFail, false));

        RuntimeException resetWrapped = new RuntimeException("Wrapper", new RuntimeException("Connection reset by peer"));
        assertTrue(TransientDbRetryAspect.isRetryableConnectionFailure(resetWrapped, true));
        assertFalse(TransientDbRetryAspect.isRetryableConnectionFailure(resetWrapped, false));

        assertFalse(TransientDbRetryAspect.isRetryableConnectionFailure(new IllegalArgumentException("Bad input"), true));
    }

    @Test
    void globalExceptionHandlerReturns503WhenDatabaseUnavailable() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        ResponseEntity<ApiResponse<Void>> response = handler.handleDatabaseUnavailable(
                new CannotCreateTransactionException("Unable to acquire JDBC Connection"));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
    }
}
