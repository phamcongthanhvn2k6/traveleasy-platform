package com.rikkei.quickshop.service;

import com.rikkei.quickshop.dto.ai.AiChatResponse;
import com.rikkei.quickshop.dto.ai.AiGenerateResponse;

public interface AiService {
    AiGenerateResponse generateProductDescription(String productName);
    AiChatResponse chatWithAssistant(String userMessage);
}
