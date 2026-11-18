package com.traveleasy.dto.admin;

import java.util.List;
import org.springframework.data.domain.Page;

/** Stable, zero-based pagination metadata for admin list endpoints. */
public record S405PageResponse<T>(List<T> items, int page, int size, long totalElements, int totalPages) {
    public static <T> S405PageResponse<T> from(Page<T> source) {
        return new S405PageResponse<>(source.getContent(), source.getNumber(), source.getSize(),
                source.getTotalElements(), source.getTotalPages());
    }
}
