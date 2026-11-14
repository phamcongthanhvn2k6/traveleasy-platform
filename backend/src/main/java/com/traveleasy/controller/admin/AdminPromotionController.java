package com.traveleasy.controller.admin;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.entity.Promotion;
import com.traveleasy.repository.PromotionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * Controller Quản Lý Chương Trình Khuyến Mại & Voucher Sàn (Admin Portal)
 * - Tra cứu, thống kê và lọc voucher theo trạng thái, danh mục
 * - Tạo mới & cập nhật chương trình khuyến mại
 * - Bật / Tắt trạng thái hoạt động (Active/Inactive)
 * - Cấp thêm lượt sử dụng (Adjust Quota / Re-allocation)
 * - Xóa chương trình khuyến mại
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/promotions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Admin Promotion Management", description = "Quản lý chương trình khuyến mại, cấp & trừ voucher sàn")
public class AdminPromotionController {

    private final PromotionRepository promotionRepository;

    @GetMapping
    @Operation(summary = "Lấy danh sách toàn bộ khuyến mại sàn (Hỗ trợ tìm kiếm, lọc danh mục, trạng thái)")
    public ApiResponse<List<Promotion>> getAllPromotions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {

        List<Promotion> list = promotionRepository.findAll();

        if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase();
            list = list.stream().filter(p ->
                    (p.getCode() != null && p.getCode().toLowerCase().contains(q)) ||
                    (p.getTitle() != null && p.getTitle().toLowerCase().contains(q)) ||
                    (p.getDescription() != null && p.getDescription().toLowerCase().contains(q))
            ).toList();
        }

        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
            list = list.stream().filter(p -> category.equalsIgnoreCase(p.getCategory())).toList();
        }

        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            LocalDateTime now = LocalDateTime.now();
            if ("ACTIVE".equalsIgnoreCase(status)) {
                list = list.stream().filter(p -> Boolean.TRUE.equals(p.getIsActive()) &&
                        (p.getEndDate() == null || p.getEndDate().isAfter(now)) &&
                        (p.getUsageLimit() == null || p.getUsedCount() == null || p.getUsedCount() < p.getUsageLimit())
                ).toList();
            } else if ("INACTIVE".equalsIgnoreCase(status)) {
                list = list.stream().filter(p -> Boolean.FALSE.equals(p.getIsActive())).toList();
            } else if ("EXPIRED".equalsIgnoreCase(status)) {
                list = list.stream().filter(p -> p.getEndDate() != null && p.getEndDate().isBefore(now)).toList();
            } else if ("DEPLETED".equalsIgnoreCase(status)) {
                list = list.stream().filter(p -> p.getUsageLimit() != null && p.getUsedCount() != null && p.getUsedCount() >= p.getUsageLimit()).toList();
            }
        }

        // Sắp xếp mới nhất lên đầu
        List<Promotion> sorted = list.stream()
                .sorted(Comparator.comparing(Promotion::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        return ApiResponse.success(sorted);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết một chương trình khuyến mại")
    public ApiResponse<Promotion> getPromotionById(@PathVariable Long id) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chương trình khuyến mại #" + id));
        return ApiResponse.success(promo);
    }

    @CacheEvict(value = "promotions_list", allEntries = true)
    @PostMapping
    @Operation(summary = "Tạo mới một chương trình khuyến mại sàn")
    public ApiResponse<Promotion> createPromotion(@RequestBody Promotion promo) {
        if (promo.getCode() == null || promo.getCode().isBlank()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Mã khuyến mại không được để trống!");
        }

        String code = promo.getCode().trim().toUpperCase();
        if (promotionRepository.findByCodeIgnoreCase(code).isPresent()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Mã khuyến mại '" + code + "' đã tồn tại trên hệ thống!");
        }

        promo.setCode(code);
        if (promo.getUsedCount() == null) promo.setUsedCount(0);
        if (promo.getUsageLimit() == null || promo.getUsageLimit() <= 0) promo.setUsageLimit(500);
        if (promo.getIsActive() == null) promo.setIsActive(true);
        if (promo.getCreatedAt() == null) promo.setCreatedAt(LocalDateTime.now());
        if (promo.getStartDate() == null) promo.setStartDate(LocalDateTime.now());
        if (promo.getEndDate() == null) promo.setEndDate(LocalDateTime.now().plusMonths(3));
        if (promo.getCategory() == null || promo.getCategory().isBlank()) promo.setCategory("ALL");

        Promotion saved = promotionRepository.save(promo);
        log.info("🎉 [ADMIN PROMO CREATED] Ma: {}, Gia tri: {} {}", saved.getCode(), saved.getDiscountValue(), saved.getDiscountType());
        return ApiResponse.success("Tạo chương trình khuyến mại thành công!", saved);
    }

    @CacheEvict(value = "promotions_list", allEntries = true)
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật chương trình khuyến mại")
    public ApiResponse<Promotion> updatePromotion(@PathVariable Long id, @RequestBody Promotion updateData) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chương trình khuyến mại #" + id));

        if (updateData.getCode() != null && !updateData.getCode().isBlank()) {
            String newCode = updateData.getCode().trim().toUpperCase();
            if (!newCode.equalsIgnoreCase(promo.getCode()) && promotionRepository.findByCodeIgnoreCase(newCode).isPresent()) {
                throw new AppException(ErrorCode.VALIDATION_ERROR, "Mã khuyến mại '" + newCode + "' đã tồn tại!");
            }
            promo.setCode(newCode);
        }

        if (updateData.getTitle() != null) promo.setTitle(updateData.getTitle());
        if (updateData.getDescription() != null) promo.setDescription(updateData.getDescription());
        if (updateData.getDiscountType() != null) promo.setDiscountType(updateData.getDiscountType());
        if (updateData.getDiscountValue() != null) promo.setDiscountValue(updateData.getDiscountValue());
        if (updateData.getMinOrderValue() != null) promo.setMinOrderValue(updateData.getMinOrderValue());
        if (updateData.getMaxDiscount() != null) promo.setMaxDiscount(updateData.getMaxDiscount());
        if (updateData.getStartDate() != null) promo.setStartDate(updateData.getStartDate());
        if (updateData.getEndDate() != null) promo.setEndDate(updateData.getEndDate());
        if (updateData.getUsageLimit() != null) promo.setUsageLimit(updateData.getUsageLimit());
        if (updateData.getCategory() != null) promo.setCategory(updateData.getCategory());
        if (updateData.getApplicableOrigin() != null) promo.setApplicableOrigin(updateData.getApplicableOrigin());
        if (updateData.getApplicableDestination() != null) promo.setApplicableDestination(updateData.getApplicableDestination());
        if (updateData.getBadgeText() != null) promo.setBadgeText(updateData.getBadgeText());
        if (updateData.getTerms() != null) promo.setTerms(updateData.getTerms());
        if (updateData.getIsActive() != null) promo.setIsActive(updateData.getIsActive());

        Promotion updated = promotionRepository.save(promo);
        log.info("📝 [ADMIN PROMO UPDATED] Ma: {}", updated.getCode());
        return ApiResponse.success("Đã cập nhật chương trình khuyến mại!", updated);
    }

    @CacheEvict(value = "promotions_list", allEntries = true)
    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Bật / Tắt trạng thái hoạt động của khuyến mại")
    public ApiResponse<Promotion> toggleStatus(@PathVariable Long id) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chương trình khuyến mại #" + id));

        boolean next = !Boolean.TRUE.equals(promo.getIsActive());
        promo.setIsActive(next);
        Promotion saved = promotionRepository.save(promo);
        String msg = next ? "Đã kích hoạt chương trình khuyến mại!" : "Đã tạm dừng chương trình khuyến mại!";
        return ApiResponse.success(msg, saved);
    }

    @CacheEvict(value = "promotions_list", allEntries = true)
    @PatchMapping("/{id}/adjust-quota")
    @Operation(summary = "Cấp thêm lượt dùng cho chương trình khuyến mại (Cơ chế cấp lượt khuyến mại)")
    public ApiResponse<Promotion> adjustQuota(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chương trình khuyến mại #" + id));

        Integer addAmount = body.get("addAmount") != null ? Integer.valueOf(body.get("addAmount").toString()) : null;
        Integer newLimit = body.get("usageLimit") != null ? Integer.valueOf(body.get("usageLimit").toString()) : null;

        if (addAmount != null && addAmount > 0) {
            int current = promo.getUsageLimit() != null ? promo.getUsageLimit() : 0;
            promo.setUsageLimit(current + addAmount);
        } else if (newLimit != null && newLimit > 0) {
            promo.setUsageLimit(newLimit);
        } else {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Vui lòng nhập số lượt cấp thêm hợp lệ (> 0)!");
        }

        Promotion saved = promotionRepository.save(promo);
        log.info("🎁 [ADMIN PROMO QUOTA GRANTED] Ma: {}, Gioi han moi: {} luot", saved.getCode(), saved.getUsageLimit());
        return ApiResponse.success("Đã cấp thêm lượt sử dụng thành công cho mã " + saved.getCode() + "!", saved);
    }

    @CacheEvict(value = "promotions_list", allEntries = true)
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa chương trình khuyến mại")
    public ApiResponse<Void> deletePromotion(@PathVariable Long id) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chương trình khuyến mại #" + id));

        promotionRepository.delete(promo);
        log.info("🗑️ [ADMIN PROMO DELETED] Ma: {}", promo.getCode());
        return ApiResponse.success("Đã xóa chương trình khuyến mại thành công!", null);
    }
}
