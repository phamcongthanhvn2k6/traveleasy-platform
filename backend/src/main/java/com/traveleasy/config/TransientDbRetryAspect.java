package com.traveleasy.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.hibernate.exception.JDBCConnectionException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.RecoverableDataAccessException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.CannotCreateTransactionException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.lang.reflect.Method;
import java.sql.SQLTransientConnectionException;
import java.util.Locale;

/**
 * Tự động thử lại tối đa 2 lần cho các lỗi mất kết nối DB thoáng qua (transient connection error)
 * tại biên transaction ngoài cùng (chỉ retry trước khi transaction mở hoặc với giao dịch readOnly).
 */
@Slf4j
@Aspect
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class TransientDbRetryAspect {

    private static final int MAX_RETRIES = 2;
    private static final long BACKOFF_MS = 250L;

    private final DatabaseKeepAliveWatchdog databaseKeepAliveWatchdog;

    @Around("@annotation(org.springframework.transaction.annotation.Transactional) || @within(org.springframework.transaction.annotation.Transactional)")
    public Object retryOnTransientDbError(ProceedingJoinPoint joinPoint) throws Throwable {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            return joinPoint.proceed();
        }

        boolean readOnly = resolveReadOnly(joinPoint);
        int attempt = 0;
        while (true) {
            try {
                return joinPoint.proceed();
            } catch (Throwable ex) {
                attempt++;
                boolean canRetry = attempt <= MAX_RETRIES && isRetryableConnectionFailure(ex, readOnly);
                if (!canRetry) {
                    throw ex;
                }
                log.warn("[DB RETRY] Lỗi kết nối DB thoáng qua tại {} (lần {}/{}): {}. Đang làm mới pool và thử lại...",
                        joinPoint.getSignature().toShortString(), attempt, MAX_RETRIES, ex.getMessage());
                databaseKeepAliveWatchdog.evictIdleAndBrokenConnections();
                sleepQuietly(BACKOFF_MS * attempt);
            }
        }
    }

    private boolean resolveReadOnly(ProceedingJoinPoint joinPoint) {
        if (joinPoint.getSignature() instanceof MethodSignature methodSignature) {
            Method method = methodSignature.getMethod();
            Transactional methodTx = AnnotatedElementUtils.findMergedAnnotation(method, Transactional.class);
            if (methodTx != null) {
                return methodTx.readOnly();
            }
        }
        Class<?> targetClass = joinPoint.getTarget() != null ? joinPoint.getTarget().getClass() : null;
        if (targetClass != null) {
            Transactional classTx = AnnotatedElementUtils.findMergedAnnotation(targetClass, Transactional.class);
            if (classTx != null) {
                return classTx.readOnly();
            }
        }
        return false;
    }

    static boolean isRetryableConnectionFailure(Throwable ex, boolean isReadOnly) {
        Throwable current = ex;
        while (current != null) {
            // Lỗi xảy ra ngay lúc lấy connection để mở transaction -> chưa có SQL nào chạy, an toàn cho cả read & write
            if (current instanceof CannotCreateTransactionException) {
                return true;
            }
            // Với readOnly=true, an toàn khi retry thêm các lỗi đứt kết nối giữa chừng
            if (isReadOnly && (current instanceof SQLTransientConnectionException
                    || current instanceof RecoverableDataAccessException
                    || current instanceof DataAccessResourceFailureException
                    || current instanceof JDBCConnectionException)) {
                return true;
            }
            if (isReadOnly && hasTransientNetworkMessage(current.getMessage())) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private static boolean hasTransientNetworkMessage(String message) {
        if (message == null) {
            return false;
        }
        String lower = message.toLowerCase(Locale.ROOT);
        return lower.contains("connection reset")
                || lower.contains("broken pipe")
                || lower.contains("connection is closed")
                || lower.contains("an i/o error occurred")
                || lower.contains("connection refused")
                || lower.contains("socket timeout");
    }

    private void sleepQuietly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }
}
