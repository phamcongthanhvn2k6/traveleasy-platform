package com.traveleasy.controller.customer;

import com.traveleasy.entity.Promotion;
import com.traveleasy.repository.PromotionRepository;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PublicContentVoucherTest {
    @Mock
    private PromotionRepository promotionRepository;

    @InjectMocks
    private PublicContentController controller;

    @ParameterizedTest
    @CsvSource({"199999, false", "200000, true", "200001, true"})
    void validatesMinimumOrderBeforeApplyingDiscount(long amount, boolean eligible) {
        Promotion promotion = Promotion.builder()
                .code("GIAM50K")
                .discountType("FIXED")
                .discountValue(BigDecimal.valueOf(50000))
                .minOrderValue(BigDecimal.valueOf(200000))
                .build();
        when(promotionRepository.findByCodeIgnoreCaseAndIsActiveTrue("GIAM50K"))
                .thenReturn(Optional.of(promotion));

        var response = controller.validateVoucher("GIAM50K", BigDecimal.valueOf(amount), null, null);

        assertEquals(eligible, response.isSuccess());
        assertEquals(eligible ? BigDecimal.valueOf(50000) : null,
                response.getData() == null ? null : response.getData().getDiscountAmount());
    }
}
