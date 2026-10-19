package com.rikkei.quickshop.service.impl;

import com.rikkei.quickshop.common.exception.AppException;
import com.rikkei.quickshop.common.exception.ErrorCode;
import com.rikkei.quickshop.dto.order.*;
import com.rikkei.quickshop.entity.*;
import com.rikkei.quickshop.repository.OrderItemRepository;
import com.rikkei.quickshop.repository.OrderRepository;
import com.rikkei.quickshop.repository.ProductRepository;
import com.rikkei.quickshop.repository.UserRepository;
import com.rikkei.quickshop.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OrderResponse checkout(String userEmail, CheckoutRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String orderCode = "ORD-" + System.currentTimeMillis();
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        Order order = Order.builder()
                .user(user)
                .orderCode(orderCode)
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(PaymentMethod.COD)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        order = orderRepository.save(order);

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

            // Trừ tồn kho nguyên tử (Atomic Stock Reduction)
            int updated = productRepository.decreaseStock(product.getId(), itemReq.getQuantity());
            if (updated == 0) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK,
                        "Sản phẩm '" + product.getName() + "' không còn đủ số lượng trong kho!");
            }

            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .price(product.getPrice())
                    .quantity(itemReq.getQuantity())
                    .subtotal(subtotal)
                    .build();

            items.add(orderItemRepository.save(orderItem));
        }

        order.setTotalAmount(totalAmount);
        order.setItems(items);
        order = orderRepository.save(order);

        return mapToResponse(order);
    }

    @Override
    public List<OrderResponse> getMyOrders(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        return mapToResponse(order);
    }

    @Override
    public Page<OrderResponse> getAllOrders(OrderStatus status, Pageable pageable) {
        Page<Order> page = (status != null)
                ? orderRepository.findByStatus(status, pageable)
                : orderRepository.findAll(pageable);
        return page.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        order.setStatus(request.getStatus());
        return mapToResponse(orderRepository.save(order));
    }

    private OrderResponse mapToResponse(Order o) {
        List<OrderItemResponse> itemResponses = o.getItems() != null ? o.getItems().stream()
                .map(i -> OrderItemResponse.builder()
                        .id(i.getId())
                        .productId(i.getProduct().getId())
                        .productName(i.getProductName())
                        .price(i.getPrice())
                        .quantity(i.getQuantity())
                        .subtotal(i.getSubtotal())
                        .build())
                .collect(Collectors.toList()) : List.of();

        return OrderResponse.builder()
                .id(o.getId())
                .orderCode(o.getOrderCode())
                .recipientName(o.getRecipientName())
                .recipientPhone(o.getRecipientPhone())
                .shippingAddress(o.getShippingAddress())
                .totalAmount(o.getTotalAmount())
                .paymentMethod(o.getPaymentMethod())
                .status(o.getStatus())
                .createdAt(o.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
