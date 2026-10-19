package com.rikkei.quickshop.service;

import com.rikkei.quickshop.dto.product.CategoryResponse;
import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllCategories();
}
