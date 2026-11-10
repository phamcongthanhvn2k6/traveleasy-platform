package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.company.pricing.*;
import com.traveleasy.entity.*;
import com.traveleasy.repository.BusCompanyRepository;
import com.traveleasy.repository.CompanyPricingRuleRepository;
import com.traveleasy.repository.RouteRepository;
import com.traveleasy.repository.UserRepository;
import com.traveleasy.service.company.DynamicPricingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class CompanyPricingRuleControllerTest {

    @Mock
    private CompanyPricingRuleRepository pricingRuleRepository;

    @Mock
    private BusCompanyRepository busCompanyRepository;

    @Mock
    private RouteRepository routeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DynamicPricingService dynamicPricingService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private CompanyPricingRuleController controller;

    private BusCompany company1;
    private BusCompany company2;
    private Route testRoute;
    private User operatorUser;
    private CompanyPricingRule rule1;

    @BeforeEach
    void setUp() {
        company1 = BusCompany.builder()
                .id(1L)
                .name("Nhà xe Phương Trang")
                .hotline("19006067")
                .build();

        company2 = BusCompany.builder()
                .id(2L)
                .name("Nhà xe Thành Bưởi")
                .hotline("19006079")
                .build();

        testRoute = Route.builder()
                .id(10L)
                .departureLocation("Hồ Chí Minh")
                .arrivalLocation("Đà Lạt")
                .distanceKm(BigDecimal.valueOf(300))
                .durationHours(BigDecimal.valueOf(6))
                .build();

        operatorUser = User.builder()
                .id(5L)
                .email("operator@phuongtrang.vn")
                .fullName("Điều hành Phương Trang")
                .busCompanyId(1L)
                .role(Role.OPERATOR)
                .build();

        rule1 = CompanyPricingRule.builder()
                .id(100L)
                .busCompany(company1)
                .name("Phụ thu Lễ 2/9")
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
    }

    private void mockAuth() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("operator@phuongtrang.vn");
        when(userRepository.findByEmail("operator@phuongtrang.vn")).thenReturn(Optional.of(operatorUser));
    }

    @Test
    @DisplayName("TC-S307-01: Lấy danh sách quy tắc giá của nhà xe (Tenant-Scoped)")
    void testGetPricingRules_Success() {
        mockAuth();
        when(pricingRuleRepository.findByBusCompanyIdOrderByPriorityDesc(1L))
                .thenReturn(List.of(rule1));

        ApiResponse<List<PricingRuleResponse>> response = controller.getPricingRules(null, null, authentication);

        assertTrue(response.isSuccess());
        assertNotNull(response.getData());
        assertEquals(1, response.getData().size());
        assertEquals("Phụ thu Lễ 2/9", response.getData().get(0).getName());
        assertEquals(1L, response.getData().get(0).getBusCompanyId());
    }

    @Test
    @DisplayName("TC-S307-02: Tạo mới quy tắc giá vé thành công")
    void testCreatePricingRule_Success() {
        mockAuth();
        when(busCompanyRepository.findById(1L)).thenReturn(Optional.of(company1));
        when(pricingRuleRepository.save(any(CompanyPricingRule.class))).thenReturn(rule1);

        CreatePricingRuleRequest request = CreatePricingRuleRequest.builder()
                .busCompanyId(1L)
                .name("Phụ thu Lễ 2/9")
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

        ApiResponse<PricingRuleResponse> response = controller.createPricingRule(request, authentication);

        assertTrue(response.isSuccess());
        assertEquals("Phụ thu Lễ 2/9", response.getData().getName());
        assertEquals(PricingRuleType.HOLIDAY_SURCHARGE, response.getData().getRuleType());
        verify(pricingRuleRepository, times(1)).save(any(CompanyPricingRule.class));
    }

    @Test
    @DisplayName("Tạo mới quy tắc thất bại khi ngày kết thúc trước ngày bắt đầu")
    void testCreatePricingRule_ValidationError_EndDateBeforeStartDate() {
        mockAuth();

        CreatePricingRuleRequest invalidRequest = CreatePricingRuleRequest.builder()
                .busCompanyId(1L)
                .name("Quy tắc sai ngày")
                .ruleType(PricingRuleType.WEEKEND_SURCHARGE)
                .adjustmentValue(BigDecimal.valueOf(10))
                .startDate(LocalDate.of(2026, 11, 20))
                .endDate(LocalDate.of(2026, 11, 10)) // Kết thúc trước bắt đầu
                .build();

        AppException ex = assertThrows(AppException.class, () ->
                controller.createPricingRule(invalidRequest, authentication)
        );

        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("Ngày kết thúc không được trước ngày bắt đầu"));
    }

    @Test
    @DisplayName("TC-S307-03: Bật/tắt nhanh trạng thái hoạt động của quy tắc (Toggle)")
    void testTogglePricingRuleStatus_Success() {
        mockAuth();
        when(pricingRuleRepository.findById(100L)).thenReturn(Optional.of(rule1));
        when(pricingRuleRepository.save(any(CompanyPricingRule.class))).thenAnswer(inv -> inv.getArgument(0));

        // Ban đầu rule1 đang ACTIVE -> Toggle sang INACTIVE
        ApiResponse<PricingRuleResponse> response = controller.togglePricingRuleStatus(100L, authentication);

        assertTrue(response.isSuccess());
        assertEquals(PricingRuleStatus.INACTIVE, response.getData().getStatus());

        // Toggle lần 2 -> Chuyển lại ACTIVE
        ApiResponse<PricingRuleResponse> response2 = controller.togglePricingRuleStatus(100L, authentication);
        assertEquals(PricingRuleStatus.ACTIVE, response2.getData().getStatus());
    }

    @Test
    @DisplayName("Xóa quy tắc giá vé thành công")
    void testDeletePricingRule_Success() {
        mockAuth();
        when(pricingRuleRepository.findById(100L)).thenReturn(Optional.of(rule1));
        doNothing().when(pricingRuleRepository).delete(rule1);

        ApiResponse<Void> response = controller.deletePricingRule(100L, authentication);

        assertTrue(response.isSuccess());
        verify(pricingRuleRepository, times(1)).delete(rule1);
    }

    @Test
    @DisplayName("Bảo vệ đa khách thuê (Tenant Isolation): Không được thao tác trên quy tắc nhà xe khác")
    void testTenantIsolation_CannotModifyOtherCompanyRule() {
        mockAuth(); // Đăng nhập với tư cách nhà xe 1 (Phương Trang)

        CompanyPricingRule otherRule = CompanyPricingRule.builder()
                .id(200L)
                .busCompany(company2) // Thuộc nhà xe 2 (Thành Bưởi)
                .name("Phụ thu Thành Bưởi")
                .build();

        when(pricingRuleRepository.findById(200L)).thenReturn(Optional.of(otherRule));

        AppException ex = assertThrows(AppException.class, () ->
                controller.deletePricingRule(200L, authentication)
        );

        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("không có quyền thao tác trên quy tắc của nhà xe khác"));
        verify(pricingRuleRepository, never()).delete(any());
    }

    @Test
    @DisplayName("TC-S307-04: Gọi API mô phỏng giá vé trực tiếp (Live Price Simulator)")
    void testSimulatePricing_Success() {
        mockAuth();

        PriceSimulationRequest request = PriceSimulationRequest.builder()
                .busCompanyId(1L)
                .basePrice(BigDecimal.valueOf(250000))
                .departureTime(LocalDateTime.of(2026, 9, 2, 8, 0))
                .totalSeats(40)
                .availableSeats(20)
                .build();

        PriceSimulationResponse mockSimResponse = PriceSimulationResponse.builder()
                .originalPrice(BigDecimal.valueOf(250000))
                .calculatedPrice(BigDecimal.valueOf(300000))
                .deltaAmount(BigDecimal.valueOf(50000))
                .adjustmentPercent(BigDecimal.valueOf(20))
                .pricingBadge("+20% Lễ Tết")
                .explanation("Áp dụng quy tắc Phụ thu Lễ 2/9 (+20%)")
                .hasRuleApplied(true)
                .build();

        when(dynamicPricingService.simulatePricing(any(PriceSimulationRequest.class))).thenReturn(mockSimResponse);

        ApiResponse<PriceSimulationResponse> response = controller.simulatePricing(request, authentication);

        assertTrue(response.isSuccess());
        assertNotNull(response.getData());
        assertEquals(BigDecimal.valueOf(300000), response.getData().getCalculatedPrice());
        assertEquals("+20% Lễ Tết", response.getData().getPricingBadge());
    }
}
