package com.traveleasy.service;

import com.traveleasy.dto.ai.AiChatRequest;
import com.traveleasy.dto.ai.AiChatResponse;
import com.traveleasy.repository.RouteRepository;
import com.traveleasy.service.ai.AiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class AiServiceTest {

    @Mock
    private RouteRepository routeRepository;

    private AiService aiService;

    @BeforeEach
    void setUp() {
        aiService = new AiService(routeRepository);
    }

    @Test
    @DisplayName("Test AI tư vấn tuyến Đà Lạt")
    void testGetTravelAdvice_DaLat() {
        AiChatRequest request = new AiChatRequest();
        request.setMessage("Tư vấn chuyến đi Đà Lạt giúp tôi");

        AiChatResponse response = aiService.getTravelAdvice(request);

        assertNotNull(response);
        assertTrue(response.getReply().contains("Đà Lạt"));
        assertEquals("TP. Hồ Chí Minh -> Đà Lạt", response.getSuggestedRoute());
    }

    @Test
    @DisplayName("Test AI tư vấn tuyến Nha Trang")
    void testGetTravelAdvice_NhaTrang() {
        AiChatRequest request = new AiChatRequest();
        request.setMessage("Có xe đi Nha Trang đêm nay không?");

        AiChatResponse response = aiService.getTravelAdvice(request);

        assertNotNull(response);
        assertTrue(response.getReply().contains("Nha Trang"));
        assertEquals("TP. Hồ Chí Minh -> Nha Trang", response.getSuggestedRoute());
    }

    @Test
    @DisplayName("Test AI tư vấn tuyến Sa Pa")
    void testGetTravelAdvice_Sapa() {
        AiChatRequest request = new AiChatRequest();
        request.setMessage("Tư vấn xe cabin đi Sapa từ Hà Nội");

        AiChatResponse response = aiService.getTravelAdvice(request);

        assertNotNull(response);
        assertTrue(response.getReply().contains("Sa Pa"));
        assertEquals("Hà Nội -> Sa Pa", response.getSuggestedRoute());
    }

    @Test
    @DisplayName("Test AI giải đáp chính sách hủy vé")
    void testGetTravelAdvice_CancelPolicy() {
        AiChatRequest request = new AiChatRequest();
        request.setMessage("Chính sách hủy vé xe như thế nào?");

        AiChatResponse response = aiService.getTravelAdvice(request);

        assertNotNull(response);
        assertTrue(response.getReply().contains("Chính sách hủy vé TravelEasy"));
        assertNull(response.getSuggestedRoute());
    }

    @Test
    @DisplayName("Test AI phản hồi chào mừng mặc định")
    void testGetTravelAdvice_DefaultGreeting() {
        AiChatRequest request = new AiChatRequest();
        request.setMessage("Xin chào bạn");

        AiChatResponse response = aiService.getTravelAdvice(request);

        assertNotNull(response);
        assertTrue(response.getReply().contains("Chào bạn! Tôi là trợ lý AI TravelEasy"));
        assertNull(response.getSuggestedRoute());
    }
}

