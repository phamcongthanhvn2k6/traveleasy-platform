package com.traveleasy.controller.ai;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.ai.AiChatRequest;
import com.traveleasy.dto.ai.AiChatResponse;
import com.traveleasy.service.ai.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Smart Travel", description = "Trợ lý AI tư vấn tuyến xe, kinh nghiệm du lịch và vị trí ghế")
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    @Operation(summary = "Hỏi đáp tư vấn thông minh với trợ lý AI TravelEasy")
    public ApiResponse<AiChatResponse> chat(@Valid @RequestBody AiChatRequest request) {
        return ApiResponse.success(aiService.getTravelAdvice(request));
    }
}
