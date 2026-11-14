package com.traveleasy.controller.admin;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.entity.Promotion;
import com.traveleasy.repository.PromotionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminPromotionControllerTest {

    @Mock
    private PromotionRepository promotionRepository;

    @InjectMocks
    private AdminPromotionController controller;

    private Promotion testPromo;

    @BeforeEach
    void setUp() {
        testPromo = Promotion.builder()
                .id(1L)
                .code("SAPA20")
                .title("Giảm 20% Sa Pa")
                .description("Ưu đãi Sa Pa")
                .discountType("PERCENT")
                .discountValue(BigDecimal.valueOf(20))
                .minOrderValue(BigDecimal.valueOf(300000))
                .maxDiscount(BigDecimal.valueOf(100000))
                .usageLimit(500)
                .usedCount(120)
                .category("HOT_ROUTE")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("TC-01: Admin lấy danh sách toàn bộ khuyến mại sàn thành công")
    void testGetAllPromotions_Success() {
        when(promotionRepository.findAll()).thenReturn(List.of(testPromo));

        ApiResponse<List<Promotion>> res = controller.getAllPromotions(null, null, null);
        assertNotNull(res);
        assertTrue(res.isSuccess());
        assertEquals(1, res.getData().size());
        assertEquals("SAPA20", res.getData().get(0).getCode());
    }

    @Test
    @DisplayName("TC-02: Admin tìm kiếm khuyến mại theo mã hoặc từ khóa")
    void testGetAllPromotions_WithSearch() {
        when(promotionRepository.findAll()).thenReturn(List.of(testPromo));

        ApiResponse<List<Promotion>> res = controller.getAllPromotions("sapa", null, null);
        assertEquals(1, res.getData().size());

        ApiResponse<List<Promotion>> resEmpty = controller.getAllPromotions("DALAT", null, null);
        assertEquals(0, resEmpty.getData().size());
    }

    @Test
    @DisplayName("TC-03: Admin tạo mới mã khuyến mại thành công")
    void testCreatePromotion_Success() {
        Promotion newPromo = Promotion.builder()
                .code("HUE15")
                .title("Giảm 15% đi Huế")
                .discountType("PERCENT")
                .discountValue(BigDecimal.valueOf(15))
                .build();

        when(promotionRepository.findByCodeIgnoreCase("HUE15")).thenReturn(Optional.empty());
        when(promotionRepository.save(any(Promotion.class))).thenAnswer(i -> {
            Promotion p = i.getArgument(0);
            p.setId(10L);
            return p;
        });

        ApiResponse<Promotion> res = controller.createPromotion(newPromo);
        assertNotNull(res);
        assertTrue(res.isSuccess());
        assertEquals("HUE15", res.getData().getCode());
        verify(promotionRepository, times(1)).save(any(Promotion.class));
    }

    @Test
    @DisplayName("TC-04: Từ chối tạo khuyến mại khi mã đã tồn tại")
    void testCreatePromotion_DuplicateCode_ThrowsException() {
        Promotion duplicate = Promotion.builder().code("SAPA20").title("Trùng").build();
        when(promotionRepository.findByCodeIgnoreCase("SAPA20")).thenReturn(Optional.of(testPromo));

        assertThrows(AppException.class, () -> controller.createPromotion(duplicate));
        verify(promotionRepository, never()).save(any(Promotion.class));
    }

    @Test
    @DisplayName("TC-05: Admin bật / tắt trạng thái kích hoạt của khuyến mại")
    void testToggleStatus_Success() {
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(testPromo));
        when(promotionRepository.save(any(Promotion.class))).thenAnswer(i -> i.getArgument(0));

        ApiResponse<Promotion> res = controller.toggleStatus(1L);
        assertNotNull(res);
        assertFalse(res.getData().getIsActive()); // From true to false
    }

    @Test
    @DisplayName("TC-06: Cơ chế CẤP THÊM LƯỢT DÙNG (Adjust Quota / Re-allocation)")
    void testAdjustQuota_Success() {
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(testPromo));
        when(promotionRepository.save(any(Promotion.class))).thenAnswer(i -> i.getArgument(0));

        // Cấp thêm +200 lượt vào hạn ngạch hiện tại (500 -> 700)
        ApiResponse<Promotion> res = controller.adjustQuota(1L, Map.of("addAmount", 200));
        assertNotNull(res);
        assertTrue(res.isSuccess());
        assertEquals(700, res.getData().getUsageLimit());
        verify(promotionRepository, times(1)).save(testPromo);
    }

    @Test
    @DisplayName("TC-07: Admin xóa khuyến mại thành công")
    void testDeletePromotion_Success() {
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(testPromo));

        ApiResponse<Void> res = controller.deletePromotion(1L);
        assertNotNull(res);
        assertTrue(res.isSuccess());
        verify(promotionRepository, times(1)).delete(testPromo);
    }
}
