package com.traveleasy.service.auth;

import com.traveleasy.common.exception.AppException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class FirebaseAuthRateLimitServiceTest {

    @Test
    void allowsTenAttemptsWithinWindowAndBlocksTheEleventh() {
        FirebaseAuthRateLimitService service = new FirebaseAuthRateLimitService();

        for (int i = 0; i < FirebaseAuthRateLimitService.MAX_ATTEMPTS_PER_WINDOW; i++) {
            assertDoesNotThrow(() -> service.check("google", "127.0.0.1"));
        }

        assertThrows(AppException.class, () -> service.check("google", "127.0.0.1"));
    }

    @Test
    void separatesEndpointsAndRemoteAddresses() {
        FirebaseAuthRateLimitService service = new FirebaseAuthRateLimitService();

        for (int i = 0; i < FirebaseAuthRateLimitService.MAX_ATTEMPTS_PER_WINDOW; i++) {
            service.check("google", "127.0.0.1");
        }

        assertDoesNotThrow(() -> service.check("phone", "127.0.0.1"));
        assertDoesNotThrow(() -> service.check("google", "127.0.0.2"));
    }
}
