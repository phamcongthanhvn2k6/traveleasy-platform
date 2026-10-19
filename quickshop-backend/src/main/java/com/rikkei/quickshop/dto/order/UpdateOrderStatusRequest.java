package com.rikkei.quickshop.dto.order;

import com.rikkei.quickshop.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOrderStatusRequest {
    @NotNull(message = "Trạng thái mới không được để trống")
    private OrderStatus status;
}
