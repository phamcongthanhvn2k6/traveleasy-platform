package com.rikkei.quickshop.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiGenerateRequest {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String productName;
}
