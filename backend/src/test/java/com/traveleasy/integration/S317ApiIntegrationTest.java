package com.traveleasy.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * S317ApiIntegrationTest
 * ============================================================================
 * KIỂM THỬ HỒI QUY TƯƠNG THÍCH API — HỢP ĐỒNG VÀ CẤU TRÚC PHẢN HỒI (/api)
 * Thẻ Trello: [BE][S317] (ID: 6ae811415450f103bd7964a7)
 * Phụ trách: Trần Minh Đức (Customer & Tickets)
 * ============================================================================
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class S317ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * DoD 1: Kiểm thử hợp đồng thành công (HTTP 200 OK)
     * Xác nhận cấu trúc chuẩn ApiResponse: success, message, data, timestamp
     */
    @Test
    @Order(1)
    @DisplayName("DoD 1: Hợp đồng phản hồi thành công cấu trúc chuẩn ApiResponse (GET /api/v1/trips/search)")
    void testApiContract_SuccessStructure() throws Exception {
        mockMvc.perform(get("/api/v1/trips/search")
                        .param("origin", "TP. Hồ Chí Minh")
                        .param("destination", "Đà Lạt")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(jsonPath("$.errors").doesNotExist());
    }

    /**
     * DoD 2: Hợp đồng phản hồi danh mục tuyến đường (GET /api/v1/trips/schedule/routes)
     */
    @Test
    @Order(2)
    @DisplayName("DoD 2: Hợp đồng danh mục tuyến đường (GET /api/v1/trips/schedule/routes)")
    void testApiContract_ScheduleRoutesStructure() throws Exception {
        mockMvc.perform(get("/api/v1/trips/schedule/routes")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    /**
     * DoD 3: Hợp đồng lỗi nghiệp vụ không tìm thấy tài nguyên (HTTP 404 Not Found)
     */
    @Test
    @Order(3)
    @DisplayName("DoD 3: Hợp đồng lỗi tài nguyên không tồn tại trả về 404 chuẩn AppException")
    void testApiContract_ResourceNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/trips/{id}", 9999999L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    /**
     * DoD 4: Hợp đồng lỗi sai kiểu dữ liệu tham số (HTTP 400 Bad Request)
     */
    @Test
    @Order(4)
    @DisplayName("DoD 4: Hợp đồng lỗi tham số sai kiểu dữ liệu MethodArgumentTypeMismatch (400 Bad Request)")
    void testApiContract_TypeMismatchValidation() throws Exception {
        mockMvc.perform(get("/api/v1/trips/{id}", "not-a-valid-number")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("không đúng kiểu dữ liệu")))
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    /**
     * DoD 5: Hợp đồng lỗi phương thức HTTP không được hỗ trợ (HTTP 405 Method Not Allowed)
     */
    @Test
    @Order(5)
    @DisplayName("DoD 5: Hợp đồng chặn phương thức HTTP không hợp lệ (405 Method Not Allowed)")
    void testApiContract_MethodNotAllowed() throws Exception {
        mockMvc.perform(post("/api/v1/trips/schedule/routes")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("không được hỗ trợ")))
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    /**
     * DoD 6: Hợp đồng kiểm soát phân quyền và bảo vệ Endpoint quản trị (401/403)
     */
    @Test
    @Order(6)
    @DisplayName("DoD 6: Hợp đồng bảo vệ phân quyền, chặn truy cập trái phép không có Token")
    void testApiContract_SecurityProtection() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    org.junit.jupiter.api.Assertions.assertTrue(
                            status == 401 || status == 403,
                            "Endpoint quản trị phải trả về 401 hoặc 403 khi chưa đăng nhập. Thực tế: " + status
                    );
                });
    }
}
