package com.traveleasy.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Service quản lý giới hạn tần suất đăng nhập sai (Brute-force Protection).
 * Khóa tạm thời 15 phút nếu người dùng/IP nhập sai mật khẩu 5 lần liên tiếp.
 */
@Slf4j
@Service
public class LoginAttemptService {

    public static final int MAX_FAILED_ATTEMPTS = 5;
    public static final Duration LOCK_DURATION = Duration.ofMinutes(15);

    private final Cache<String, AtomicInteger> attemptsCache = Caffeine.newBuilder()
            .expireAfterWrite(LOCK_DURATION)
            .maximumSize(50_000)
            .build();

    /**
     * Kiểm tra xem IP hoặc tài khoản có đang bị khóa do nhập sai quá số lần cho phép không.
     */
    public void checkBlocked(String clientKey) {
        AtomicInteger attempts = attemptsCache.getIfPresent(clientKey);
        if (attempts != null && attempts.get() >= MAX_FAILED_ATTEMPTS) {
            log.warn("[Security] Khóa đăng nhập đối với key '{}' do thử sai {} lần", clientKey, attempts.get());
            throw new AppException(
                    ErrorCode.TOO_MANY_REQUESTS,
                    "Bạn đã đăng nhập sai quá 5 lần liên tiếp. Để đảm bảo an toàn tài khoản, hệ thống tạm thời khóa trong 15 phút. Vui lòng thử lại sau."
            );
        }
    }

    /**
     * Ghi nhận 1 lần đăng nhập thất bại.
     */
    public void loginFailed(String clientKey) {
        AtomicInteger attempts = attemptsCache.asMap().computeIfAbsent(clientKey, k -> new AtomicInteger(0));
        int count = attempts.incrementAndGet();
        log.warn("[Security] Đăng nhập thất bại lần {}/{} cho key '{}'", count, MAX_FAILED_ATTEMPTS, clientKey);
    }

    /**
     * Đăng nhập thành công, xóa bộ đếm lỗi cho clientKey.
     */
    public void loginSucceeded(String clientKey) {
        attemptsCache.invalidate(clientKey);
    }

    /**
     * Xóa toàn bộ cache (dành cho kiểm thử hoặc quản trị viên mở khóa).
     */
    public void clear() {
        attemptsCache.invalidateAll();
    }
}
