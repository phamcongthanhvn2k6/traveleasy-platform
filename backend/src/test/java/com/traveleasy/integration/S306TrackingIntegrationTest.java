package com.traveleasy.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.traveleasy.dto.tracking.UpdateTripGpsRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
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
 * [S306][TRACKING] Integration Test for Realtime GPS Tracking
 * Endpoints: /api/v1/tracking/{tripId}/**
 * @author Nguyễn Đại Phát (phatnguyn146)
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class S306TrackingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/v1/tracking/{tripId}/current - Trả về vị trí hiện tại và thông tin tổ lái")
    void testGetCurrentGpsLocation() throws Exception {
        mockMvc.perform(get("/api/v1/tracking/696/current")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tripId").value(696))
                .andExpect(jsonPath("$.data.latitude").exists())
                .andExpect(jsonPath("$.data.longitude").exists())
                .andExpect(jsonPath("$.data.speed").exists())
                .andExpect(jsonPath("$.data.driverName").isNotEmpty())
                .andExpect(jsonPath("$.data.alcoholTested").value(true))
                .andExpect(jsonPath("$.data.routeCoordinates").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/tracking/{tripId}/simulate-step - Di chuyển vị trí xe tiếp 1 bước")
    void testSimulateNextStep() throws Exception {
        mockMvc.perform(post("/api/v1/tracking/696/simulate-step")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tripId").value(696))
                .andExpect(jsonPath("$.data.progressPercent").exists());
    }

    @Test
    @DisplayName("POST /api/v1/tracking/{tripId}/update-location - Tài xế cập nhật GPS thực tế")
    void testUpdateDriverLocation() throws Exception {
        UpdateTripGpsRequest request = UpdateTripGpsRequest.builder()
                .latitude(10.8231)
                .longitude(106.6297)
                .speed(72.5)
                .heading(42.0)
                .locationName("Qua cầu Sài Gòn hướng Xa lộ Hà Nội")
                .driverPhone("0912 345 678")
                .build();

        mockMvc.perform(post("/api/v1/tracking/696/update-location")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tripId").value(696))
                .andExpect(jsonPath("$.data.latitude").value(10.8231))
                .andExpect(jsonPath("$.data.longitude").value(106.6297))
                .andExpect(jsonPath("$.data.speed").value(72.5))
                .andExpect(jsonPath("$.data.currentLocationName").value("Qua cầu Sài Gòn hướng Xa lộ Hà Nội"));
    }
}
