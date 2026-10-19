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
