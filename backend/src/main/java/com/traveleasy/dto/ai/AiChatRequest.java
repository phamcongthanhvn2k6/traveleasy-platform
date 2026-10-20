package com.traveleasy.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiChatRequest {
    @NotBlank(message = "Câu hỏi tư vấn không được để trống")
    private String message;
    private String contextCity;
}
