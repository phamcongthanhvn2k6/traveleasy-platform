package com.rikkei.quickshop.service;

import com.rikkei.quickshop.dto.order.CheckoutRequest;
import com.rikkei.quickshop.dto.order.OrderResponse;
import com.rikkei.quickshop.dto.order.UpdateOrderStatusRequest;
import com.rikkei.quickshop.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {
    OrderResponse checkout(String userEmail, CheckoutRequest request);
    List<OrderResponse> getMyOrders(String userEmail);
    OrderResponse getOrderDetail(Long orderId);
    Page<OrderResponse> getAllOrders(OrderStatus status, Pageable pageable);
    OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request);
}
