package com.rikkei.quickshop.repository;

import com.rikkei.quickshop.entity.Order;
import com.rikkei.quickshop.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
}
