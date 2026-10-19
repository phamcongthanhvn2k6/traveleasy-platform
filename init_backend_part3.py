import os

def write_file(path, content):
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Created: {path}")

# ==============================================================================
# SERVICES & IMPL
# ==============================================================================
write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/service/AuthService.java", """
package com.rikkei.quickshop.service;

import com.rikkei.quickshop.dto.auth.AuthResponse;
import com.rikkei.quickshop.dto.auth.LoginRequest;
import com.rikkei.quickshop.dto.auth.RegisterRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
}
""")

write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/service/UserService.java", """
package com.rikkei.quickshop.service;

import com.rikkei.quickshop.dto.auth.UpdateProfileRequest;
import com.rikkei.quickshop.dto.auth.UserProfileResponse;

public interface UserService {
    UserProfileResponse getCurrentProfile(String email);
    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
}
""")

write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/service/CategoryService.java", """
package com.rikkei.quickshop.service;

import com.rikkei.quickshop.dto.product.CategoryResponse;
import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllCategories();
}
""")

write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/service/ProductService.java", """
package com.rikkei.quickshop.service;

import com.rikkei.quickshop.dto.product.ProductRequest;
import com.rikkei.quickshop.dto.product.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    Page<ProductResponse> getProducts(Long categoryId, String keyword, Pageable pageable);
    ProductResponse getProductById(Long id);
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
}
""")

write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/service/OrderService.java", """
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
""")

write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/service/AiService.java", """
package com.rikkei.quickshop.service;

import com.rikkei.quickshop.dto.ai.AiChatResponse;
import com.rikkei.quickshop.dto.ai.AiGenerateResponse;

public interface AiService {
    AiGenerateResponse generateProductDescription(String productName);
    AiChatResponse chatWithAssistant(String userMessage);
}
""")

# SERVICE IMPL
write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/service/impl/AuthServiceImpl.java", """
package com.rikkei.quickshop.service.impl;

import com.rikkei.quickshop.common.exception.AppException;
import com.rikkei.quickshop.common.exception.ErrorCode;
import com.rikkei.quickshop.dto.auth.AuthResponse;
import com.rikkei.quickshop.dto.auth.LoginRequest;
import com.rikkei.quickshop.dto.auth.RegisterRequest;
import com.rikkei.quickshop.entity.Role;
import com.rikkei.quickshop.entity.User;
import com.rikkei.quickshop.repository.UserRepository;
import com.rikkei.quickshop.security.JwtTokenProvider;
import com.rikkei.quickshop.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String token = tokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(Role.CUSTOMER)
                .build();

        user = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String token = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}
""")

write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/service/impl/UserServiceImpl.java", """
package com.rikkei.quickshop.service.impl;

import com.rikkei.quickshop.common.exception.AppException;
import com.rikkei.quickshop.common.exception.ErrorCode;
import com.rikkei.quickshop.dto.auth.UpdateProfileRequest;
import com.rikkei.quickshop.dto.auth.UserProfileResponse;
import com.rikkei.quickshop.entity.User;
import com.rikkei.quickshop.repository.UserRepository;
import com.rikkei.quickshop.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserProfileResponse getCurrentProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole())
                .build();
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user = userRepository.save(user);

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole())
                .build();
    }
}
""")

write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/service/impl/CategoryServiceImpl.java", """
package com.rikkei.quickshop.service.impl;

import com.rikkei.quickshop.dto.product.CategoryResponse;
import com.rikkei.quickshop.repository.CategoryRepository;
import com.rikkei.quickshop.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> CategoryResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .slug(c.getSlug())
                        .description(c.getDescription())
                        .build())
                .collect(Collectors.toList());
    }
}
""")

write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/service/impl/ProductServiceImpl.java", """
package com.rikkei.quickshop.service.impl;

import com.rikkei.quickshop.common.exception.AppException;
import com.rikkei.quickshop.common.exception.ErrorCode;
import com.rikkei.quickshop.dto.product.ProductRequest;
import com.rikkei.quickshop.dto.product.ProductResponse;
import com.rikkei.quickshop.entity.Category;
import com.rikkei.quickshop.entity.Product;
import com.rikkei.quickshop.repository.CategoryRepository;
import com.rikkei.quickshop.repository.ProductRepository;
import com.rikkei.quickshop.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public Page<ProductResponse> getProducts(Long categoryId, String keyword, Pageable pageable) {
        Page<Product> page;
        if (categoryId != null && keyword != null && !keyword.trim().isEmpty()) {
            page = productRepository.findByCategoryIdAndNameContainingIgnoreCaseAndIsActiveTrue(categoryId, keyword.trim(), pageable);
        } else if (categoryId != null) {
            page = productRepository.findByCategoryIdAndIsActiveTrue(categoryId, pageable);
        } else if (keyword != null && !keyword.trim().isEmpty()) {
            page = productRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(keyword.trim(), pageable);
        } else {
            page = productRepository.findByIsActiveTrue(pageable);
        }
        return page.map(this::mapToResponse);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return mapToResponse(p);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        String slug = request.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-") + "-" + System.currentTimeMillis();

        Product product = Product.builder()
                .category(category)
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .isActive(true)
                .build();

        return mapToResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        product.setCategory(category);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());

        return mapToResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        product.setIsActive(false);
        productRepository.save(product);
    }

    private ProductResponse mapToResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .categoryId(p.getCategory().getId())
                .categoryName(p.getCategory().getName())
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .price(p.getPrice())
                .stock(p.getStock())
                .imageUrl(p.getImageUrl())
                .isActive(p.getIsActive())
                .build();
    }
}
""")

write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/service/impl/OrderServiceImpl.java", """
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
""")

write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/service/impl/AiServiceImpl.java", """
package com.rikkei.quickshop.service.impl;

import com.rikkei.quickshop.dto.ai.AiChatResponse;
import com.rikkei.quickshop.dto.ai.AiGenerateResponse;
import com.rikkei.quickshop.entity.Product;
import com.rikkei.quickshop.repository.ProductRepository;
import com.rikkei.quickshop.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final ProductRepository productRepository;

    @Override
    public AiGenerateResponse generateProductDescription(String productName) {
        // Fallback / Stub Generator chuẩn SEO
        String generated = "✨ **" + productName + "** — Trải nghiệm sự khác biệt đẳng cấp từ QuickShop!\n\n" +
                "🔹 **Đặc điểm nổi bật:**\n" +
                "• Thiết kế hiện đại, tinh tế và sang trọng, dẫn đầu xu hướng thị trường.\n" +
                "• Chất liệu cao cấp đạt tiêu chuẩn độ bền vượt trội theo thời gian.\n" +
                "• Tối ưu hiệu năng sử dụng hằng ngày, đem lại cảm giác thoải mái tối đa.\n" +
                "• Bảo hành chính hãng uy tín 12 tháng, 1 đổi 1 trong 30 ngày đầu.\n\n" +
                "👉 *Đặt mua ngay hôm nay tại QuickShop để nhận ưu đãi giá tốt nhất cùng chính sách giao hàng COD tận nơi toàn quốc!*";

        return AiGenerateResponse.builder()
                .description(generated)
                .build();
    }

    @Override
    public AiChatResponse chatWithAssistant(String userMessage) {
        List<Product> availableProducts = productRepository.findTop20ByIsActiveTrue();

        StringBuilder reply = new StringBuilder("Dạ QuickShop xin chào bạn! Cảm ơn bạn đã nhắn tin: '" + userMessage + "'.\\n\\n");
        reply.append("Dưới đây là một số sản phẩm đang bán chạy nhất tại cửa hàng chúng mình:\\n");

        for (int i = 0; i < Math.min(3, availableProducts.size()); i++) {
            Product p = availableProducts.get(i);
            reply.append("• **").append(p.getName()).append("**: ")
                 .append(String.format("%,.0f VNĐ", p.getPrice()))
                 .append(" (Còn lại: ").append(p.getStock()).append(" chiếc)\\n");
        }
        reply.append("\\nBạn cần tư vấn thêm chi tiết sản phẩm nào, cứ nhắn cho mình nhé!");

        return AiChatResponse.builder()
                .reply(reply.toString())
                .build();
    }
}
""")

# ==============================================================================
# CONTROLLERS
# ==============================================================================
write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/controller/AuthController.java", """
package com.rikkei.quickshop.controller;

import com.rikkei.quickshop.common.dto.ApiResponse;
import com.rikkei.quickshop.dto.auth.AuthResponse;
import com.rikkei.quickshop.dto.auth.LoginRequest;
import com.rikkei.quickshop.dto.auth.RegisterRequest;
import com.rikkei.quickshop.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Đăng ký, Đăng nhập và nhận JWT")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", authService.login(request)));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đăng ký tài khoản thành công", authService.register(request)));
    }
}
""")

write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/controller/UserController.java", """
package com.rikkei.quickshop.controller;

import com.rikkei.quickshop.common.dto.ApiResponse;
import com.rikkei.quickshop.dto.auth.UpdateProfileRequest;
import com.rikkei.quickshop.dto.auth.UserProfileResponse;
import com.rikkei.quickshop.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Quản lý hồ sơ người dùng hiện tại")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getCurrentProfile(userDetails.getUsername())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật hồ sơ thành công",
                userService.updateProfile(userDetails.getUsername(), request)));
    }
}
""")

write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/controller/CategoryController.java", """
package com.rikkei.quickshop.controller;

import com.rikkei.quickshop.common.dto.ApiResponse;
import com.rikkei.quickshop.dto.product.CategoryResponse;
import com.rikkei.quickshop.service.CategoryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Category", description = "Xem danh mục sản phẩm")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllCategories()));
    }
}
""")

write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/controller/ProductController.java", """
package com.rikkei.quickshop.controller;

import com.rikkei.quickshop.common.dto.ApiResponse;
import com.rikkei.quickshop.dto.product.ProductResponse;
import com.rikkei.quickshop.service.ProductService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Product", description = "Tìm kiếm và xem chi tiết sản phẩm")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        return ResponseEntity.ok(ApiResponse.ok(productService.getProducts(categoryId, keyword, pageRequest)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getProductById(id)));
    }
}
""")

write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/controller/OrderController.java", """
package com.rikkei.quickshop.controller;

import com.rikkei.quickshop.common.dto.ApiResponse;
import com.rikkei.quickshop.dto.order.CheckoutRequest;
import com.rikkei.quickshop.dto.order.OrderResponse;
import com.rikkei.quickshop.service.OrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order & Checkout", description = "Đặt hàng COD và xem lịch sử đơn cá nhân")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đặt hàng thành công", orderService.checkout(userDetails.getUsername(), request)));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getMyOrders(userDetails.getUsername())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrderDetail(id)));
    }
}
""")

write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/controller/AdminProductController.java", """
package com.rikkei.quickshop.controller;

import com.rikkei.quickshop.common.dto.ApiResponse;
import com.rikkei.quickshop.dto.product.ProductRequest;
import com.rikkei.quickshop.dto.product.ProductResponse;
import com.rikkei.quickshop.service.ProductService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
@Tag(name = "Admin Product Management", description = "Thêm, sửa, xóa sản phẩm cho Admin")
public class AdminProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thêm sản phẩm thành công", productService.createProduct(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật sản phẩm thành công", productService.updateProduct(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa sản phẩm thành công", null));
    }
}
""")

write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/controller/AdminOrderController.java", """
package com.rikkei.quickshop.controller;

import com.rikkei.quickshop.common.dto.ApiResponse;
import com.rikkei.quickshop.dto.order.OrderResponse;
import com.rikkei.quickshop.dto.order.UpdateOrderStatusRequest;
import com.rikkei.quickshop.entity.OrderStatus;
import com.rikkei.quickshop.service.OrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
@Tag(name = "Admin Order Management", description = "Quản lý và đổi trạng thái đơn hàng")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAll(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok(orderService.getAllOrders(status, pageRequest)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái thành công",
                orderService.updateOrderStatus(id, request)));
    }
}
""")

write_file("quickshop-backend/src/main/java/com/rikkei/quickshop/controller/AiController.java", """
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
""")

write_file("quickshop-backend/src/test/java/com/rikkei/quickshop/QuickshopApplicationTests.java", """
package com.rikkei.quickshop;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class QuickshopApplicationTests {

    @Test
    void contextLoads() {
    }
}
""")

print("Backend part 3 (Services, Controllers, Tests) completed.")

