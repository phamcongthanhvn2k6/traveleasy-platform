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
