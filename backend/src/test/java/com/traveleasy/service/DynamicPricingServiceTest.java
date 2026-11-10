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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DynamicPricingServiceTest {

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
                .departureTime(LocalDateTime.of(2026, 9, 2, 8, 0)) // Ngày Quốc Khánh 2/9/2026 (Thứ 4)
                .arrivalTime(LocalDateTime.of(2026, 9, 2, 14, 0))
                .price(BigDecimal.valueOf(250000))
                .totalSeats(40)
                .availableSeats(30)
                .status(TripStatus.SCHEDULED)
                .build();
    }

    @Test
    @DisplayName("TC-S307-05: Phụ thu Lễ Tết (+20%) làm tròn hàng nghìn đồng")
    void testHolidaySurcharge_20Percent() {
        CompanyPricingRule holidayRule = CompanyPricingRule.builder()
                .id(1L)
                .busCompany(testCompany)
                .name("Phụ thu Lễ Quốc Khánh 2/9")
                .ruleType(PricingRuleType.HOLIDAY_SURCHARGE)
                .scope(PricingRuleScope.ALL_ROUTES)
                .adjustmentType(AdjustmentType.PERCENTAGE)
                .adjustmentValue(BigDecimal.valueOf(20))
                .startDate(LocalDate.of(2026, 9, 1))
                .endDate(LocalDate.of(2026, 9, 4))
                .applicableDays("ALL")
                .priority(100)
                .status(PricingRuleStatus.ACTIVE)
                .build();

        when(pricingRuleRepository.findByBusCompanyIdAndStatusOrderByPriorityDesc(eq(1L), eq(PricingRuleStatus.ACTIVE)))
                .thenReturn(List.of(holidayRule));

        LocalDateTime now = LocalDateTime.of(2026, 9, 1, 10, 0);
        DynamicPricingResult result = dynamicPricingService.calculateDynamicPrice(testTrip, now);

        assertTrue(result.isRuleApplied());
        assertEquals(BigDecimal.valueOf(300000), result.getCalculatedPrice()); // 250,000 * 1.20 = 300,000
        assertEquals(BigDecimal.valueOf(250000), result.getOriginalPrice());
        assertEquals(BigDecimal.valueOf(50000), result.getDeltaAmount());
        assertEquals("+20% Lễ Tết", result.getPricingBadge());
    }

    @Test
    @DisplayName("TC-S307-06: Phụ thu Cuối tuần (+10%) vào Thứ 7")
    void testWeekendSurcharge_10Percent() {
        // Thứ 7 ngày 2026-11-14
        Trip weekendTrip = Trip.builder()
                .id(101L)
                .busCompany(testCompany)
                .route(testRoute)
                .departureTime(LocalDateTime.of(2026, 11, 14, 9, 0)) // Thứ 7
                .arrivalTime(LocalDateTime.of(2026, 11, 14, 15, 0))
                .price(BigDecimal.valueOf(200000))
                .totalSeats(40)
                .availableSeats(20)
                .status(TripStatus.SCHEDULED)
                .build();

        CompanyPricingRule weekendRule = CompanyPricingRule.builder()
                .id(2L)
                .busCompany(testCompany)
                .name("Phụ thu Cuối tuần Thứ 6, Thứ 7, Chủ Nhật")
                .ruleType(PricingRuleType.WEEKEND_SURCHARGE)
                .scope(PricingRuleScope.ALL_ROUTES)
                .adjustmentType(AdjustmentType.PERCENTAGE)
                .adjustmentValue(BigDecimal.valueOf(10))
                .startDate(LocalDate.of(2026, 1, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .applicableDays("FRIDAY,SATURDAY,SUNDAY")
                .priority(10)
                .status(PricingRuleStatus.ACTIVE)
                .build();

        when(pricingRuleRepository.findByBusCompanyIdAndStatusOrderByPriorityDesc(eq(1L), eq(PricingRuleStatus.ACTIVE)))
                .thenReturn(List.of(weekendRule));

        LocalDateTime now = LocalDateTime.of(2026, 11, 10, 10, 0);
        DynamicPricingResult result = dynamicPricingService.calculateDynamicPrice(weekendTrip, now);

        assertTrue(result.isRuleApplied());
        assertEquals(BigDecimal.valueOf(220000), result.getCalculatedPrice()); // 200,000 * 1.10 = 220,000
        assertEquals(BigDecimal.valueOf(20000), result.getDeltaAmount());
        assertEquals("+10% Cuối tuần", result.getPricingBadge());
    }

    @Test
    @DisplayName("TC-S307-07: Flash Sale Giờ Chót (-15%) khi xe sắp chạy trong vòng 2h và còn trống > 50%")
    void testFlashSale_LastMinute_15Percent() {
        LocalDateTime departure = LocalDateTime.of(2026, 11, 10, 14, 0);
        LocalDateTime now = LocalDateTime.of(2026, 11, 10, 12, 30); // Cách 1.5 giờ

        Trip flashTrip = Trip.builder()
                .id(102L)
                .busCompany(testCompany)
                .route(testRoute)
                .departureTime(departure)
                .arrivalTime(departure.plusHours(6))
                .price(BigDecimal.valueOf(200000))
                .totalSeats(40)
                .availableSeats(25) // 25/40 = 62.5% > 50%
                .status(TripStatus.SCHEDULED)
                .build();

        CompanyPricingRule flashRule = CompanyPricingRule.builder()
                .id(3L)
                .busCompany(testCompany)
                .name("Flash Sale Giờ Chót 2H")
                .ruleType(PricingRuleType.FLASH_SALE)
                .scope(PricingRuleScope.ALL_ROUTES)
                .adjustmentType(AdjustmentType.PERCENTAGE)
                .adjustmentValue(BigDecimal.valueOf(15))
                .startDate(LocalDate.of(2026, 1, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .applicableDays("ALL")
                .isLastMinute(true)
                .lastMinuteHours(2)
                .minEmptySeatPercentage(50)
                .priority(50)
                .status(PricingRuleStatus.ACTIVE)
                .build();

        when(pricingRuleRepository.findByBusCompanyIdAndStatusOrderByPriorityDesc(eq(1L), eq(PricingRuleStatus.ACTIVE)))
                .thenReturn(List.of(flashRule));

        DynamicPricingResult result = dynamicPricingService.calculateDynamicPrice(flashTrip, now);

        assertTrue(result.isRuleApplied());
        assertEquals(BigDecimal.valueOf(170000), result.getCalculatedPrice()); // 200,000 * 0.85 = 170,000
        assertEquals(BigDecimal.valueOf(-30000), result.getDeltaAmount());
        assertEquals("-15% Giờ chót", result.getPricingBadge());
    }

    @Test
    @DisplayName("Flash Sale không áp dụng khi tỷ lệ trống < 50%")
    void testFlashSale_NotApplicable_WhenSeatsLessThan50Percent() {
        LocalDateTime departure = LocalDateTime.of(2026, 11, 10, 14, 0);
        LocalDateTime now = LocalDateTime.of(2026, 11, 10, 12, 30);

        Trip fullTrip = Trip.builder()
                .id(103L)
                .busCompany(testCompany)
                .route(testRoute)
                .departureTime(departure)
                .arrivalTime(departure.plusHours(6))
                .price(BigDecimal.valueOf(200000))
                .totalSeats(40)
                .availableSeats(10) // 10/40 = 25% < 50%
                .status(TripStatus.SCHEDULED)
                .build();

        CompanyPricingRule flashRule = CompanyPricingRule.builder()
                .id(3L)
                .busCompany(testCompany)
                .name("Flash Sale Giờ Chót 2H")
                .ruleType(PricingRuleType.FLASH_SALE)
                .scope(PricingRuleScope.ALL_ROUTES)
                .adjustmentType(AdjustmentType.PERCENTAGE)
                .adjustmentValue(BigDecimal.valueOf(15))
                .startDate(LocalDate.of(2026, 1, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .applicableDays("ALL")
                .isLastMinute(true)
                .lastMinuteHours(2)
                .minEmptySeatPercentage(50)
                .priority(50)
                .status(PricingRuleStatus.ACTIVE)
                .build();

        when(pricingRuleRepository.findByBusCompanyIdAndStatusOrderByPriorityDesc(eq(1L), eq(PricingRuleStatus.ACTIVE)))
                .thenReturn(List.of(flashRule));

        DynamicPricingResult result = dynamicPricingService.calculateDynamicPrice(fullTrip, now);

        assertFalse(result.isRuleApplied());
        assertEquals(BigDecimal.valueOf(200000), result.getCalculatedPrice());
    }

    @Test
    @DisplayName("TC-S307-08: Nguyên tắc độc quyền (Non-stacking) - Lễ Tết ưu tiên cao nhất đè Cuối tuần")
    void testPriority_HolidayOverWeekend_NonStacking() {
        // Chuyến xe ngày 2026-09-05 (Thứ 7, nằm trong đợt nghỉ Lễ 2/9)
        Trip holidayWeekendTrip = Trip.builder()
                .id(104L)
                .busCompany(testCompany)
                .route(testRoute)
                .departureTime(LocalDateTime.of(2026, 9, 5, 8, 0))
                .arrivalTime(LocalDateTime.of(2026, 9, 5, 14, 0))
                .price(BigDecimal.valueOf(250000))
                .totalSeats(40)
                .availableSeats(20)
                .status(TripStatus.SCHEDULED)
                .build();

        CompanyPricingRule holidayRule = CompanyPricingRule.builder()
                .id(1L)
                .busCompany(testCompany)
                .name("Phụ thu Lễ Quốc Khánh")
                .ruleType(PricingRuleType.HOLIDAY_SURCHARGE)
                .adjustmentType(AdjustmentType.PERCENTAGE)
                .adjustmentValue(BigDecimal.valueOf(20))
                .startDate(LocalDate.of(2026, 9, 1))
                .endDate(LocalDate.of(2026, 9, 6))
                .applicableDays("ALL")
                .priority(100)
                .status(PricingRuleStatus.ACTIVE)
                .build();

        CompanyPricingRule weekendRule = CompanyPricingRule.builder()
                .id(2L)
                .busCompany(testCompany)
                .name("Phụ thu Cuối tuần")
                .ruleType(PricingRuleType.WEEKEND_SURCHARGE)
                .adjustmentType(AdjustmentType.PERCENTAGE)
                .adjustmentValue(BigDecimal.valueOf(10))
                .startDate(LocalDate.of(2026, 1, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .applicableDays("FRIDAY,SATURDAY,SUNDAY")
                .priority(10)
                .status(PricingRuleStatus.ACTIVE)
                .build();

        // Repository trả về theo thứ tự priority DESC (holidayRule đứng trước)
        when(pricingRuleRepository.findByBusCompanyIdAndStatusOrderByPriorityDesc(eq(1L), eq(PricingRuleStatus.ACTIVE)))
                .thenReturn(List.of(holidayRule, weekendRule));

        LocalDateTime now = LocalDateTime.of(2026, 9, 3, 10, 0);
        DynamicPricingResult result = dynamicPricingService.calculateDynamicPrice(holidayWeekendTrip, now);

        assertTrue(result.isRuleApplied());
        // Chỉ áp dụng duy nhất +20% Lễ Tết (300,000đ), KHÔNG cộng dồn thành +30% (325,000đ)
        assertEquals(BigDecimal.valueOf(300000), result.getCalculatedPrice());
        assertEquals("+20% Lễ Tết", result.getPricingBadge());
    }

    @Test
    @DisplayName("TC-S307-09: Ràng buộc giá sàn tối thiểu 50.000 VNĐ")
    void testPriceFloor_Minimum50000() {
        Trip cheapTrip = Trip.builder()
                .id(105L)
                .busCompany(testCompany)
                .route(testRoute)
                .departureTime(LocalDateTime.of(2026, 11, 15, 8, 0))
                .arrivalTime(LocalDateTime.of(2026, 11, 15, 10, 0))
                .price(BigDecimal.valueOf(60000))
                .totalSeats(40)
                .availableSeats(35)
                .status(TripStatus.SCHEDULED)
                .build();

        CompanyPricingRule bigDiscountRule = CompanyPricingRule.builder()
                .id(4L)
                .busCompany(testCompany)
                .name("Giảm giá sâu 50%")
                .ruleType(PricingRuleType.FLASH_SALE)
                .adjustmentType(AdjustmentType.PERCENTAGE)
                .adjustmentValue(BigDecimal.valueOf(50)) // 60,000 * 0.5 = 30,000 < 50,000 sàn
                .startDate(LocalDate.of(2026, 1, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .applicableDays("ALL")
                .isLastMinute(false)
                .priority(10)
                .status(PricingRuleStatus.ACTIVE)
                .build();

        when(pricingRuleRepository.findByBusCompanyIdAndStatusOrderByPriorityDesc(eq(1L), eq(PricingRuleStatus.ACTIVE)))
                .thenReturn(List.of(bigDiscountRule));

        DynamicPricingResult result = dynamicPricingService.calculateDynamicPrice(cheapTrip, LocalDateTime.now());

        assertTrue(result.isRuleApplied());
        assertEquals(BigDecimal.valueOf(50000), result.getCalculatedPrice()); // Chạm sàn 50,000
    }

    @Test
    @DisplayName("TC-S307-13: Phụ thu theo số tiền cố định (FIXED_AMOUNT)")
    void testFixedAmountAdjustment() {
        CompanyPricingRule fixedRule = CompanyPricingRule.builder()
                .id(5L)
                .busCompany(testCompany)
                .name("Phụ thu đêm 50.000 VNĐ")
                .ruleType(PricingRuleType.CUSTOM)
                .adjustmentType(AdjustmentType.FIXED_AMOUNT)
                .adjustmentValue(BigDecimal.valueOf(50000))
                .startDate(LocalDate.of(2026, 1, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .applicableDays("ALL")
                .priority(20)
                .status(PricingRuleStatus.ACTIVE)
                .build();

        when(pricingRuleRepository.findByBusCompanyIdAndStatusOrderByPriorityDesc(eq(1L), eq(PricingRuleStatus.ACTIVE)))
                .thenReturn(List.of(fixedRule));

        DynamicPricingResult result = dynamicPricingService.calculateDynamicPrice(testTrip, LocalDateTime.now());

        assertTrue(result.isRuleApplied());
        assertEquals(BigDecimal.valueOf(300000), result.getCalculatedPrice()); // 250,000 + 50,000 = 300,000
        assertEquals(BigDecimal.valueOf(50000), result.getDeltaAmount());
    }

    @Test
    @DisplayName("TC-S307-14: Quy tắc tuyến cụ thể (SPECIFIC_ROUTE) ưu tiên hơn toàn tuyến (ALL_ROUTES)")
    void testSpecificRouteOverAllRoutes() {
        CompanyPricingRule allRouteRule = CompanyPricingRule.builder()
                .id(6L)
                .busCompany(testCompany)
                .name("Phụ thu toàn mạng lưới 10%")
                .ruleType(PricingRuleType.WEEKEND_SURCHARGE)
                .scope(PricingRuleScope.ALL_ROUTES)
                .adjustmentType(AdjustmentType.PERCENTAGE)
                .adjustmentValue(BigDecimal.valueOf(10))
                .startDate(LocalDate.of(2026, 1, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .applicableDays("ALL")
                .priority(10)
                .status(PricingRuleStatus.ACTIVE)
                .build();

        CompanyPricingRule specificRouteRule = CompanyPricingRule.builder()
                .id(7L)
                .busCompany(testCompany)
                .name("Phụ thu tuyến cao điểm Đà Lạt 25%")
                .ruleType(PricingRuleType.WEEKEND_SURCHARGE)
                .scope(PricingRuleScope.SPECIFIC_ROUTE)
                .route(testRoute) // Route ID 10
                .adjustmentType(AdjustmentType.PERCENTAGE)
                .adjustmentValue(BigDecimal.valueOf(25))
                .startDate(LocalDate.of(2026, 1, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .applicableDays("ALL")
                .priority(20) // Ưu tiên cao hơn
                .status(PricingRuleStatus.ACTIVE)
                .build();

        when(pricingRuleRepository.findByBusCompanyIdAndStatusOrderByPriorityDesc(eq(1L), eq(PricingRuleStatus.ACTIVE)))
                .thenReturn(List.of(specificRouteRule, allRouteRule));

        DynamicPricingResult result = dynamicPricingService.calculateDynamicPrice(testTrip, LocalDateTime.now());

        assertTrue(result.isRuleApplied());
        assertEquals(BigDecimal.valueOf(313000), result.getCalculatedPrice()); // 250,000 * 1.25 = 312,500 làm tròn 313,000
    }

    @Test
    @DisplayName("Phòng vệ chia cho 0: totalSeats = 0 không ném ArithmeticException")
    void testDefensive_TotalSeatsZero_NoException() {
        Trip zeroSeatTrip = Trip.builder()
                .id(106L)
                .busCompany(testCompany)
                .route(testRoute)
                .departureTime(LocalDateTime.now().plusHours(1))
                .arrivalTime(LocalDateTime.now().plusHours(7))
                .price(BigDecimal.valueOf(200000))
                .totalSeats(0) // totalSeats = 0
                .availableSeats(0)
                .status(TripStatus.SCHEDULED)
                .build();

        CompanyPricingRule flashRule = CompanyPricingRule.builder()
                .id(3L)
                .busCompany(testCompany)
                .name("Flash Sale Giờ Chót")
                .ruleType(PricingRuleType.FLASH_SALE)
                .isLastMinute(true)
                .lastMinuteHours(2)
                .minEmptySeatPercentage(50)
                .startDate(LocalDate.now().minusDays(1))
                .endDate(LocalDate.now().plusDays(1))
                .applicableDays("ALL")
                .adjustmentType(AdjustmentType.PERCENTAGE)
                .adjustmentValue(BigDecimal.valueOf(15))
                .status(PricingRuleStatus.ACTIVE)
                .build();

        when(pricingRuleRepository.findByBusCompanyIdAndStatusOrderByPriorityDesc(eq(1L), eq(PricingRuleStatus.ACTIVE)))
                .thenReturn(List.of(flashRule));

        assertDoesNotThrow(() -> {
            DynamicPricingResult result = dynamicPricingService.calculateDynamicPrice(zeroSeatTrip, LocalDateTime.now());
            assertFalse(result.isRuleApplied());
            assertEquals(BigDecimal.valueOf(200000), result.getCalculatedPrice());
        });
    }

    @Test
    @DisplayName("TC-S307-04: Mô phỏng tính giá thời gian thực (Price Simulator)")
    void testPriceSimulation() {
        CompanyPricingRule holidayRule = CompanyPricingRule.builder()
                .id(1L)
                .busCompany(testCompany)
                .name("Phụ thu Lễ Quốc Khánh 2/9")
                .ruleType(PricingRuleType.HOLIDAY_SURCHARGE)
                .adjustmentType(AdjustmentType.PERCENTAGE)
                .adjustmentValue(BigDecimal.valueOf(20))
                .startDate(LocalDate.of(2026, 9, 1))
                .endDate(LocalDate.of(2026, 9, 4))
                .applicableDays("ALL")
                .priority(100)
                .status(PricingRuleStatus.ACTIVE)
                .build();

        when(pricingRuleRepository.findByBusCompanyIdAndStatusOrderByPriorityDesc(eq(1L), eq(PricingRuleStatus.ACTIVE)))
                .thenReturn(List.of(holidayRule));

        PriceSimulationRequest request = PriceSimulationRequest.builder()
                .busCompanyId(1L)
                .basePrice(BigDecimal.valueOf(200000))
                .departureTime(LocalDateTime.of(2026, 9, 2, 8, 0))
                .totalSeats(40)
                .availableSeats(20)
                .requestTime(LocalDateTime.of(2026, 9, 1, 12, 0))
                .build();

        PriceSimulationResponse response = dynamicPricingService.simulatePricing(request);

        assertTrue(response.getHasRuleApplied());
        assertEquals(BigDecimal.valueOf(200000), response.getOriginalPrice());
        assertEquals(BigDecimal.valueOf(240000), response.getCalculatedPrice()); // 200,000 * 1.20 = 240,000
        assertEquals(BigDecimal.valueOf(40000), response.getDeltaAmount());
        assertEquals(BigDecimal.valueOf(20), response.getAdjustmentPercent());
        assertEquals("+20% Lễ Tết", response.getPricingBadge());
    }
}
