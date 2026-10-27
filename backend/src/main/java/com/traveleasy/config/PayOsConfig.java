package com.traveleasy.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Configuration
@Getter
public class PayOsConfig {

    @Value("${payos.client-id:a187b55f-6c8a-499b-886b-722fcc0c3039}")
    private String clientId;

    @Value("${payos.api-key:b8a86931-3e77-4787-8acd-322dceb91f70}")
    private String apiKey;

    @Value("${payos.checksum-key:173bbbcb0a50af57bf7fa7b550a2cb643cc37baa601137}")
    private String checksumKey;

    @Value("${payos.account-number:0944354398}")
    private String accountNumber;

    @Value("${payos.account-holder:PHAM CONG THANH}")
    private String accountHolder;

    @Value("${payos.bank-code:MB}")
    private String bankCode;

    @Value("${payos.bank-name:MB Bank (Ngân hàng Quân Đội)}")
    private String bankName;

    @Value("${payos.bank-bin:970422}")
    private String bankBin;

    @Value("${payos.return-url:http://localhost:5173/lookup}")
    private String returnUrl;

    @Value("${payos.cancel-url:http://localhost:5173/checkout}")
    private String cancelUrl;

    /**
     * Tính chữ ký HMAC-SHA256 theo chuẩn bảo mật PayOS
     */
    public static String hmacSHA256(String key, String data) {
        try {
            if (key == null || data == null) {
                return "";
            }
            Mac hmacSha256 = Mac.getInstance("HmacSHA256");
            byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "HmacSHA256");
            hmacSha256.init(secretKey);
            byte[] hashBytes = hmacSha256.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * hashBytes.length);
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * Tạo chuỗi chữ ký (signature data string) từ Map theo thứ tự bảng chữ cái
     */
    public static String createSignatureString(Map<String, Object> data) {
        if (data == null || data.isEmpty()) {
            return "";
        }
        List<String> sortedKeys = new ArrayList<>(data.keySet());
        Collections.sort(sortedKeys);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < sortedKeys.size(); i++) {
            String key = sortedKeys.get(i);
            Object value = data.get(key);
            if (value != null && !key.equalsIgnoreCase("signature")) {
                if (sb.length() > 0) {
                    sb.append("&");
                }
                sb.append(key).append("=").append(value);
            }
        }
        return sb.toString();
    }
}

