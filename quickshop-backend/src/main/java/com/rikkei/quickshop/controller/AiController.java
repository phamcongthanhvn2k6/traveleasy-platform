package com.rikkei.quickshop.controller;

import com.rikkei.quickshop.common.dto.ApiResponse;
import com.rikkei.quickshop.dto.ai.AiChatRequest;
import com.rikkei.quickshop.dto.ai.AiChatResponse;
import com.rikkei.quickshop.dto.ai.AiGenerateRequest;
import com.rikkei.quickshop.dto.ai.AiGenerateResponse;
import com.rikkei.quickshop.service.AiService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Integration", description = "Tích hợp AI sinh mô tả SEO và Chatbot tư vấn")
public class AiController {

    private final AiService aiService;

    @PostMapping("/generate-description")
    public ResponseEntity<ApiResponse<AiGenerateResponse>> generateDescription(
            @Valid @RequestBody AiGenerateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Sinh mô tả thành công",
                aiService.generateProductDescription(request.getProductName())));
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(
            @Valid @RequestBody AiChatRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(aiService.chatWithAssistant(request.getMessage())));
    }
}
