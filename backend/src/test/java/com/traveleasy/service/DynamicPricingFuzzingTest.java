package com.traveleasy.service;

import com.traveleasy.dto.company.pricing.DynamicPricingResult;
import com.traveleasy.dto.company.pricing.PriceSimulationRequest;
import com.traveleasy.dto.company.pricing.PriceSimulationResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.CompanyPricingRuleRepository;
import com.traveleasy.service.company.DynamicPricingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DynamicPricingFuzzingTest {

    @Mock
    private CompanyPricingRuleRepository pricingRuleRepository;

    @InjectMocks
    private DynamicPricingService dynamicPricingService;

    private BusCompany testCompany;
    private Route testRoute;
    private Trip testTrip;

    @BeforeEach
    void setUp() {
        testCompany = BusCompany.builder()
                .id(1L)
                .name("Nhà xe Phương Trang")
                .hotline("19006067")
                .build();

        testRoute = Route.builder()
                .id(10L)
                .departureLocation("Hồ Chí Minh")
                .arrivalLocation("Đà Lạt")
                .distanceKm(BigDecimal.valueOf(300))
                .durationHours(BigDecimal.valueOf(6))
                .build();

        testTrip = Trip.builder()
                .id(100L)
                .busCompany(testCompany)
                .route(testRoute)
                .departureTime(LocalDateTime.of(2026, 9, 2, 8, 0))
                .arrivalTime(LocalDateTime.of(2026, 9, 2, 14, 0))
                .price(BigDecimal.valueOf(250000))
                .totalSeats(40)
                .availableSeats(25)
                .status(TripStatus.SCHEDULED)
                .build();
    }

    @Test
    @DisplayName("FUZZ-01: Tổng số ghế bằng 0 hoặc âm - Phòng vệ chia cho 0 an toàn tuyệt đối")
    void fuzz_zeroOrNegativeSeats_neverThrowsArithmeticException() {
        testTrip.setTotalSeats(0);
        testTrip.setAvailableSeats(0);

        CompanyPricingRule flashSaleRule = CompanyPricingRule.builder()
                .id(1L)
                .busCompany(testCompany)
                .name("Flash Sale Fuzz")
                .ruleType(PricingRuleType.FLASH_SALE)
                .isLastMinute(true)
                .minEmptySeatPercentage(50)
                .lastMinuteHours(2)
                .adjustmentType(AdjustmentType.PERCENTAGE)
                .adjustmentValue(BigDecimal.valueOf(15.0))
                .scope(PricingRuleScope.ALL_ROUTES)
                .startDate(LocalDate.of(2026, 9, 1))
                .endDate(LocalDate.of(2026, 9, 5))
                .priority(80)
                .status(PricingRuleStatus.ACTIVE)
                .build();

        LocalDateTime requestTime = testTrip.getDepartureTime().minusHours(1);

        assertDoesNotThrow(() -> {
            DynamicPricingResult result = dynamicPricingService.calculateDynamicPriceWithRules(
                    testTrip, requestTime, List.of(flashSaleRule)
            );
            assertNotNull(result);
            assertFalse(result.isRuleApplied(), "Không thể kích hoạt Flash sale khi tổng số ghế không hợp lệ");
            assertEquals(BigDecimal.valueOf(250000), result.getCalculatedPrice());
        });
    }

    @Test
    @DisplayName("FUZZ-02: Số ghế trống vượt quá tổng số ghế - Xử lý an toàn không gián đoạn")
    void fuzz_availableSeatsGreaterThanTotalSeats_safeOccupancy() {
        testTrip.setTotalSeats(40);
        testTrip.setAvailableSeats(50); // Bất thường: ghế trống > tổng ghế

        CompanyPricingRule rule = CompanyPricingRule.builder()
                .id(2L)
                .busCompany(testCompany)
                .name("Phụ thu Lễ Tết")
                .ruleType(PricingRuleType.HOLIDAY_SURCHARGE)
                .adjustmentType(AdjustmentType.PERCENTAGE)
                .adjustmentValue(BigDecimal.valueOf(20.0))
                .scope(PricingRuleScope.ALL_ROUTES)
                .startDate(LocalDate.of(2026, 9, 1))
                .endDate(LocalDate.of(2026, 9, 5))
                .priority(100)
                .status(PricingRuleStatus.ACTIVE)
                .build();

        assertDoesNotThrow(() -> {
            DynamicPricingResult result = dynamicPricingService.calculateDynamicPriceWithRules(
                    testTrip, LocalDateTime.of(2026, 9, 2, 7, 0), List.of(rule)
            );
            assertNotNull(result);
            assertTrue(result.isRuleApplied());
            assertEquals(BigDecimal.valueOf(300000), result.getCalculatedPrice());
        });
    }

    @Test
    @DisplayName("FUZZ-03: Chiết khấu cực đại 250% - Bắt buộc neo giữ ở mức giá sàn 50.000 VNĐ")
    void fuzz_extremeDiscountPercentage_clampsToFloorPrice() {
        testTrip.setPrice(BigDecimal.valueOf(100000));

        CompanyPricingRule extremeDiscount = CompanyPricingRule.builder()
                .id(3L)
                .busCompany(testCompany)
                .name("Siêu Chiết Khấu Fuzz")
                .ruleType(PricingRuleType.FLASH_SALE)
                .isLastMinute(true)
                .minEmptySeatPercentage(50)
                .lastMinuteHours(2)
                .adjustmentType(AdjustmentType.PERCENTAGE)
                .adjustmentValue(BigDecimal.valueOf(250.0)) // Giảm 250%
                .scope(PricingRuleScope.ALL_ROUTES)
                .startDate(LocalDate.of(2026, 9, 1))
                .endDate(LocalDate.of(2026, 9, 5))
                .priority(100)
                .status(PricingRuleStatus.ACTIVE)
                .build();

        DynamicPricingResult result = dynamicPricingService.calculateDynamicPriceWithRules(
                testTrip, LocalDateTime.of(2026, 9, 2, 7, 0), List.of(extremeDiscount)
        );

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(50000), result.getCalculatedPrice(),
                "Giá vé không bao giờ được giảm thấp hơn mức sàn 50.000 VNĐ");
    }

    @Test
    @DisplayName("FUZZ-04: Ngày bắt đầu sau ngày kết thúc - Quy tắc lỗi ngày không được kích hoạt")
    void fuzz_invertedDates_ruleNeverApplied() {
        CompanyPricingRule invertedRule = CompanyPricingRule.builder()
                .id(4L)
                .busCompany(testCompany)
                .name("Quy tắc ngày đảo ngược")
                .ruleType(PricingRuleType.HOLIDAY_SURCHARGE)
                .adjustmentType(AdjustmentType.PERCENTAGE)
                .adjustmentValue(BigDecimal.valueOf(20.0))
                .scope(PricingRuleScope.ALL_ROUTES)
                .startDate(LocalDate.of(2026, 9, 5)) // Bắt đầu ngày 5
                .endDate(LocalDate.of(2026, 9, 1))   // Kết thúc ngày 1
                .priority(100)
                .status(PricingRuleStatus.ACTIVE)
                .build();

        DynamicPricingResult result = dynamicPricingService.calculateDynamicPriceWithRules(
                testTrip, LocalDateTime.of(2026, 9, 2, 7, 0), List.of(invertedRule)
        );

        assertNotNull(result);
        assertFalse(result.isRuleApplied(), "Quy tắc đảo ngược ngày không được phép áp dụng");
        assertEquals(BigDecimal.valueOf(250000), result.getCalculatedPrice());
    }

    @Test
    @DisplayName("FUZZ-05: Giảm giá cố định vượt qua giá vé gốc - Sàn giá bảo vệ 50.000 VNĐ")
    void fuzz_extremeFixedDiscount_clampsToFloorPrice() {
        testTrip.setPrice(BigDecimal.valueOf(80000));

        CompanyPricingRule fixedDiscount = CompanyPricingRule.builder()
                .id(5L)
                .busCompany(testCompany)
                .name("Giảm cố định 100k")
                .ruleType(PricingRuleType.FLASH_SALE)
                .adjustmentType(AdjustmentType.FIXED_AMOUNT)
                .adjustmentValue(BigDecimal.valueOf(100000)) // Giảm 100k trên vé 80k
                .scope(PricingRuleScope.ALL_ROUTES)
                .startDate(LocalDate.of(2026, 9, 1))
                .endDate(LocalDate.of(2026, 9, 5))
                .priority(100)
                .status(PricingRuleStatus.ACTIVE)
                .build();

        DynamicPricingResult result = dynamicPricingService.calculateDynamicPriceWithRules(
                testTrip, LocalDateTime.of(2026, 9, 2, 7, 0), List.of(fixedDiscount)
        );

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(50000), result.getCalculatedPrice());
    }

    @Test
    @DisplayName("FUZZ-06: Giả lập tham số simulator biên bất thường - Phản hồi an toàn")
    void fuzz_simulatorBoundaryValues_safeHandling() {
        when(pricingRuleRepository.findByBusCompanyIdAndStatusOrderByPriorityDesc(eq(1L), eq(PricingRuleStatus.ACTIVE)))
                .thenReturn(Collections.emptyList());

        PriceSimulationRequest extremeReq = PriceSimulationRequest.builder()
                .busCompanyId(1L)
                .basePrice(BigDecimal.valueOf(500000))
                .departureTime(LocalDateTime.of(2026, 9, 2, 8, 0))
                .totalSeats(-10)
                .availableSeats(-5)
                .build();

        assertDoesNotThrow(() -> {
            PriceSimulationResponse response = dynamicPricingService.simulatePricing(extremeReq);
            assertNotNull(response);
            assertEquals(BigDecimal.valueOf(500000), response.getOriginalPrice());
            assertEquals(BigDecimal.valueOf(500000), response.getCalculatedPrice());
        });
    }
}
