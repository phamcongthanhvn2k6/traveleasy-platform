package com.traveleasy.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Khởi tạo Firebase Admin SDK (tham khảo firebase-auth-lab - FirebaseConfig).
 *
 * Nghiệp vụ: Đọc tệp Service Account JSON (đường dẫn cấu hình trong application.yml,
 * trong classpath resources hoặc biến môi trường GOOGLE_APPLICATION_CREDENTIALS)
 * và khởi tạo FirebaseApp singleton để backend verify Firebase ID Token do client gửi lên.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class FirebaseConfig {

    private final ResourceLoader resourceLoader;

    @Value("${app.firebase.credentials-path:classpath:fir-traveleasy-platform-firebase-adminsdk-fbsvc-7e7452d400.json}")
    private String credentialsPath;

    @PostConstruct
    public void initialize() {
        // Chỉ khởi tạo FirebaseApp đúng 1 lần trong JVM (singleton guard)
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }

        try {
            GoogleCredentials credentials;

            InputStream stream = resolveCredentialsStream();
            if (stream != null) {
                try (stream) {
                    credentials = GoogleCredentials.fromStream(stream);
                }
            } else {
                // Fallback: dùng Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS env)
                credentials = GoogleCredentials.getApplicationDefault();
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .build();

            FirebaseApp.initializeApp(options);
            log.info("Firebase Admin SDK initialized successfully with credentials from: {}", credentialsPath);
        } catch (IOException e) {
            // Không làm sập ứng dụng nếu thiếu credentials (dev mode không dùng Firebase)
            log.warn("Firebase Admin SDK NOT initialized: {}. Các endpoint /auth/firebase/* sẽ bị vô hiệu hóa.", e.getMessage());
        }
    }

    private InputStream resolveCredentialsStream() throws IOException {
        if (credentialsPath == null || credentialsPath.isBlank()) {
            return null;
        }

        // 1. Kiểm tra chuỗi JSON trực tiếp
        if (credentialsPath.trim().startsWith("{")) {
            return new java.io.ByteArrayInputStream(credentialsPath.getBytes());
        }

        // 2. Kiểm tra qua Spring ResourceLoader (hỗ trợ classpath: hoặc file:)
        try {
            Resource resource = resourceLoader.getResource(credentialsPath);
            if (resource.exists()) {
                return resource.getInputStream();
            }
        } catch (Exception ignored) {
        }

        // 3. Fallback classpath nếu chưa có prefix classpath:
        if (!credentialsPath.startsWith("classpath:")) {
            try {
                Resource resource = resourceLoader.getResource("classpath:" + credentialsPath);
                if (resource.exists()) {
                    return resource.getInputStream();
                }
            } catch (Exception ignored) {
            }
        }

        // 4. Fallback File hệ thống thông thường
        File file = new File(credentialsPath);
        if (file.exists()) {
            return new FileInputStream(file);
        }

        log.warn("Firebase credentials file not found at: {}", credentialsPath);
        return null;
    }
}

