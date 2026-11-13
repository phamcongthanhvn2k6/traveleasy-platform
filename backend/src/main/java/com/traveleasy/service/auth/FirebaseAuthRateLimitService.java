package com.traveleasy.service.auth;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * In-memory guard for Firebase auth endpoints.
 *
 * Firebase performs the actual Google/Phone verification, but the TravelEasy
 * endpoints still need protection against repeated token verification and
 * account-enumeration attempts. The key is endpoint + remote IP; do not trust
 * a client-supplied X-Forwarded-For header here.
 *
 * This is deliberately a local-process limiter. For a multi-instance
 * deployment, move the same counter to Redis/API Gateway before production.
 */
@Service
public class FirebaseAuthRateLimitService {

    static final int MAX_ATTEMPTS_PER_WINDOW = 10;
    static final long WINDOW_SECONDS = 60;

    private final Cache<String, Window> windows = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofSeconds(WINDOW_SECONDS))
            .maximumSize(20_000)
            .build();

    public void check(String endpoint, String remoteAddress) {
        String key = endpoint + ":" + normalizeAddress(remoteAddress);
        Window window = windows.asMap().computeIfAbsent(key, ignored -> new Window());
        int attempts = window.attempts.incrementAndGet();
        if (attempts > MAX_ATTEMPTS_PER_WINDOW) {
            throw new AppException(
                    ErrorCode.TOO_MANY_REQUESTS,
                    "Bạn đã thử quá nhiều lần. Vui lòng chờ một phút rồi thử lại."
            );
        }
    }

    /** Exposed for deterministic unit tests and operational reset hooks. */
    void clear() {
        windows.invalidateAll();
    }

    private String normalizeAddress(String remoteAddress) {
        return Objects.requireNonNullElse(remoteAddress, "unknown");
    }

    private static final class Window {
        private final AtomicInteger attempts = new AtomicInteger();
    }
}
