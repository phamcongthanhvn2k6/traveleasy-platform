package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.common.security.CompanySecurityService;
import com.traveleasy.dto.company.pricing.*;
import com.traveleasy.entity.*;
import com.traveleasy.repository.BusCompanyRepository;
import com.traveleasy.repository.CompanyPricingRuleRepository;
import com.traveleasy.repository.RouteRepository;
import com.traveleasy.repository.UserRepository;
import com.traveleasy.service.company.DynamicPricingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * [S307] Phân Hệ Quản Trị Giá Vé Động & Phụ Thu Lễ Tết / Cuối Tuần (/company/pricing-rules)
 * BẢO MẬT: Chỉ Chủ nhà xe (StaffRole.OWNER) và ADMIN mới có quyền cấu hình luật giá
 * @author Trần Minh Đức (tranduc2601)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/company/pricing-rules")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Transactional(readOnly = true)
@Tag(name = "Company Pricing Rules Management", description = "Quản trị quy tắc giá vé động, phụ thu Lễ Tết/Cuối tuần và Flash Sale giờ chót cho nhà xe đối tác")
public class CompanyPricingRuleController {

    private final CompanyPricingRuleRepository pricingRuleRepository;
    private final BusCompanyRepository busCompanyRepository;
    private final RouteRepository routeRepository;
    private final UserRepository userRepository;
    private final DynamicPricingService dynamicPricingService;
    private final CompanySecurityService securityService;
    private static final BigDecimal MAX_SURCHARGE_CAP_PERCENT = new BigDecimal("40.0"); // Trần tối đa 40%

    @GetMapping
    @Operation(summary = "Lấy danh sách quy tắc giá vé của nhà xe")
    public ApiResponse<List<PricingRuleResponse>> getPricingRules(
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) PricingRuleStatus status,
            Authentication authentication) {

        Long targetCompanyId = resolveTargetCompanyId(companyId, authentication);
        if (targetCompanyId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Không thể xác thực nhà xe đối tác");
        }

        List<CompanyPricingRule> rules;
        if (status != null) {
            rules = pricingRuleRepository.findByBusCompanyIdAndStatusOrderByPriorityDesc(targetCompanyId, status);
        } else {
            rules = pricingRuleRepository.findByBusCompanyIdOrderByPriorityDesc(targetCompanyId);
        }

        List<PricingRuleResponse> responses = rules.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ApiResponse.success("Lấy danh sách quy tắc giá vé thành công", responses);
    }

    @PostMapping
    @Transactional
    @Operation(summary = "Tạo mới quy tắc giá vé")
    public ApiResponse<PricingRuleResponse> createPricingRule(
            @Valid @RequestBody CreatePricingRuleRequest request,
            Authentication authentication) {

        Long targetCompanyId = resolveTargetCompanyId(request.getBusCompanyId(), authentication);
        if (targetCompanyId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Không thể xác thực nhà xe đối tác");
        }
        request.setBusCompanyId(targetCompanyId);

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Ngày kết thúc không được trước ngày bắt đầu");
        }

        BusCompany busCompany = busCompanyRepository.findById(targetCompanyId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Nhà xe không tồn tại"));

        Route route = null;
        if (request.getScope() == PricingRuleScope.SPECIFIC_ROUTE) {
            if (request.getRouteId() == null) {
                throw new AppException(ErrorCode.VALIDATION_ERROR, "Vui lòng chọn tuyến đường cụ thể khi áp dụng phạm vi theo tuyến");
            }
            route = routeRepository.findById(request.getRouteId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Tuyến đường không tồn tại"));
        }

        CompanyPricingRule rule = CompanyPricingRule.builder()
                .busCompany(busCompany)
                .name(request.getName().trim())
                .ruleType(request.getRuleType())
                .scope(request.getScope())
                .route(route)
                .adjustmentType(request.getAdjustmentType())
                .adjustmentValue(request.getAdjustmentValue())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .applicableDays(request.getApplicableDays() != null && !request.getApplicableDays().isBlank() ? request.getApplicableDays().trim() : "ALL")
                .isLastMinute(Boolean.TRUE.equals(request.getIsLastMinute()))
                .lastMinuteHours(request.getLastMinuteHours() != null ? request.getLastMinuteHours() : 2)
                .minEmptySeatPercentage(request.getMinEmptySeatPercentage() != null ? request.getMinEmptySeatPercentage() : 50)
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .status(request.getStatus() != null ? request.getStatus() : PricingRuleStatus.ACTIVE)
                .description(request.getDescription())
                .build();

        CompanyPricingRule savedRule = pricingRuleRepository.save(rule);
        log.info("Nhà xe {} tạo mới quy tắc giá vé: id={}, name='{}'", targetCompanyId, savedRule.getId(), savedRule.getName());

        return ApiResponse.success("Tạo mới quy tắc giá vé thành công", mapToResponse(savedRule));
    }

    @PutMapping("/{id}")
    @Transactional
    @Operation(summary = "Cập nhật thông tin quy tắc giá vé")
    public ApiResponse<PricingRuleResponse> updatePricingRule(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePricingRuleRequest request,
            Authentication authentication) {

        Long targetCompanyId = resolveTargetCompanyId(null, authentication);
        CompanyPricingRule rule = findRuleAndValidateOwnership(id, targetCompanyId);

        if (request.getStartDate() != null && request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Ngày kết thúc không được trước ngày bắt đầu");
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            rule.setName(request.getName().trim());
        }
        if (request.getRuleType() != null) {
            rule.setRuleType(request.getRuleType());
        }
        if (request.getScope() != null) {
            rule.setScope(request.getScope());
            if (request.getScope() == PricingRuleScope.SPECIFIC_ROUTE) {
                if (request.getRouteId() != null) {
                    Route route = routeRepository.findById(request.getRouteId())
                            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Tuyến đường không tồn tại"));
                    rule.setRoute(route);
                }
            } else {
                rule.setRoute(null);
            }
        }
        if (request.getAdjustmentType() != null) {
            rule.setAdjustmentType(request.getAdjustmentType());
        }
        if (request.getAdjustmentValue() != null) {
            rule.setAdjustmentValue(request.getAdjustmentValue());
        }
        if (request.getStartDate() != null) {
            rule.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            rule.setEndDate(request.getEndDate());
        }
        if (request.getApplicableDays() != null) {
            rule.setApplicableDays(request.getApplicableDays().trim());
        }
        if (request.getIsLastMinute() != null) {
            rule.setIsLastMinute(request.getIsLastMinute());
        }
        if (request.getLastMinuteHours() != null) {
            rule.setLastMinuteHours(request.getLastMinuteHours());
        }
        if (request.getMinEmptySeatPercentage() != null) {
            rule.setMinEmptySeatPercentage(request.getMinEmptySeatPercentage());
        }
        if (request.getPriority() != null) {
            rule.setPriority(request.getPriority());
        }
        if (request.getStatus() != null) {
            rule.setStatus(request.getStatus());
        }
        if (request.getDescription() != null) {
            rule.setDescription(request.getDescription());
        }

         CompanyPricingRule updatedRule = pricingRuleRepository.save(rule);
        log.info("Nhà xe {} cập nhật quy tắc giá vé: id={}", targetCompanyId, updatedRule.getId());

        return ApiResponse.success("Cập nhật quy tắc giá vé thành công", mapToResponse(updatedRule));
    }

    @PatchMapping("/{id}/toggle-status")
    @Transactional
    @Operation(summary = "Bật hoặc tắt trạng thái quy tắc giá vé")
    public ApiResponse<PricingRuleResponse> togglePricingRuleStatus(
            @PathVariable Long id,
            Authentication authentication) {

        Long targetCompanyId = resolveTargetCompanyId(null, authentication);
        CompanyPricingRule rule = findRuleAndValidateOwnership(id, targetCompanyId);

        PricingRuleStatus nextStatus = (rule.getStatus() == PricingRuleStatus.ACTIVE)
                ? PricingRuleStatus.INACTIVE
                : PricingRuleStatus.ACTIVE;

        rule.setStatus(nextStatus);
        CompanyPricingRule updated = pricingRuleRepository.save(rule);
        log.info("Nhà xe {} chuyển trạng thái quy tắc id={} sang {}", targetCompanyId, id, nextStatus);

        return ApiResponse.success("Thay đổi trạng thái quy tắc thành công", mapToResponse(updated));
    }

    @DeleteMapping("/{id}")
    @Transactional
    @Operation(summary = "Xóa quy tắc giá vé")
    public ApiResponse<Void> deletePricingRule(
            @PathVariable Long id,
            Authentication authentication) {

        Long targetCompanyId = resolveTargetCompanyId(null, authentication);
        CompanyPricingRule rule = findRuleAndValidateOwnership(id, targetCompanyId);

        pricingRuleRepository.delete(rule);
        log.info("Nhà xe {} đã xóa quy tắc giá vé id={}", targetCompanyId, id);

        return ApiResponse.success("Xóa quy tắc giá vé thành công", null);
    }

    @PostMapping("/simulate")
    @Operation(summary = "Mô phỏng tính giá thời gian thực cho nhà xe")
    public ApiResponse<PriceSimulationResponse> simulatePricing(
            @Valid @RequestBody PriceSimulationRequest request,
            Authentication authentication) {

        Long targetCompanyId = resolveTargetCompanyId(request.getBusCompanyId(), authentication);
        if (targetCompanyId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Không thể xác thực nhà xe đối tác");
        }
        request.setBusCompanyId(targetCompanyId);

        PriceSimulationResponse response = dynamicPricingService.simulatePricing(request);
        return ApiResponse.success("Mô phỏng tính giá vé thành công", response);
    }

    @PostMapping("/calculate-dynamic-price")
    @Operation(summary = "Tính toán giá vé thực tế có áp dụng trần phụ thu Max Surcharge Cap 40% (BUG-ROUND2-04)")
    public ApiResponse<Map<String, Object>> calculateDynamicPrice(@RequestBody Map<String, Object> payload) {
        Object basePriceObj = payload.getOrDefault("basePrice", 300000);
        BigDecimal basePrice = new BigDecimal(basePriceObj.toString());

        String departureDateStr = (String) payload.getOrDefault("departureDate", LocalDate.now().toString());
        LocalDate departureDate = LocalDate.parse(departureDateStr.substring(0, 10));

        boolean isFloor1 = Boolean.TRUE.equals(payload.get("isFloor1")) || "1".equals(String.valueOf(payload.get("floor")));
        boolean isHoliday = Boolean.TRUE.equals(payload.get("isHoliday"));

        // 1. Tính phụ thu cuối tuần
        DayOfWeek day = departureDate.getDayOfWeek();
        boolean isWeekend = (day == DayOfWeek.FRIDAY || day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY);
        BigDecimal weekendSurcharge = BigDecimal.ZERO;
        if (isWeekend) {
            weekendSurcharge = basePrice.multiply(new BigDecimal("0.15")).setScale(0, RoundingMode.HALF_UP);
        }

        // 2. Tính phụ thu ngày Lễ
        BigDecimal holidaySurcharge = BigDecimal.ZERO;
        if (isHoliday) {
            holidaySurcharge = basePrice.multiply(new BigDecimal("0.30")).setScale(0, RoundingMode.HALF_UP);
        }

        // 3. Tính phụ thu tầng 1
        BigDecimal floor1Surcharge = isFloor1 ? new BigDecimal("20000") : BigDecimal.ZERO;

        BigDecimal totalRawSurcharge = weekendSurcharge.add(holidaySurcharge).add(floor1Surcharge);

        // KIỂM SOÁT TRẦN PHỤ THU
        BigDecimal maxAllowedSurcharge = basePrice.multiply(MAX_SURCHARGE_CAP_PERCENT)
                .divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP);

        boolean capApplied = false;
        BigDecimal finalSurcharge = totalRawSurcharge;
        if (totalRawSurcharge.compareTo(maxAllowedSurcharge) > 0) {
            finalSurcharge = maxAllowedSurcharge;
            capApplied = true;
        }

        BigDecimal finalPrice = basePrice.add(finalSurcharge);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("basePrice", basePrice);
        result.put("departureDate", departureDateStr);
        result.put("isWeekend", isWeekend);
        result.put("isHoliday", isHoliday);
        result.put("isFloor1", isFloor1);
        result.put("weekendSurcharge", weekendSurcharge);
        result.put("holidaySurcharge", holidaySurcharge);
        result.put("floor1Surcharge", floor1Surcharge);
        result.put("rawTotalSurcharge", totalRawSurcharge);
        result.put("maxAllowedSurcharge", maxAllowedSurcharge);
        result.put("capApplied", capApplied);
        result.put("finalSurcharge", finalSurcharge);
        result.put("finalPrice", finalPrice);
        result.put("regulatoryCompliance", "Tuân thủ quy chuẩn giá vé Bộ GTVT & Sở Tài chính (Trần <= 40%)");

        return ApiResponse.success(result);
    }

    private CompanyPricingRule findRuleAndValidateOwnership(Long ruleId, Long targetCompanyId) {
        if (targetCompanyId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Không thể xác thực nhà xe đối tác");
        }

        CompanyPricingRule rule = pricingRuleRepository.findById(ruleId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy quy tắc giá vé"));

        if (!rule.getBusCompany().getId().equals(targetCompanyId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên quy tắc của nhà xe khác");
        }

        return rule;
    }

    private PricingRuleResponse mapToResponse(CompanyPricingRule rule) {
        String routeName = null;
        Long routeId = null;
        if (rule.getRoute() != null) {
            try {
                routeId = rule.getRoute().getId();
                String dep = rule.getRoute().getDepartureLocation();
                String arr = rule.getRoute().getArrivalLocation();
                if (dep != null && arr != null) {
                    routeName = dep + " -> " + arr;
                }
            } catch (Exception e) {
                log.warn("Lazy load route failed for rule {}: {}", rule.getId(), e.getMessage());
            }
        }

        Long busCompanyId = null;
        String busCompanyName = null;
        if (rule.getBusCompany() != null) {
            try {
                busCompanyId = rule.getBusCompany().getId();
                busCompanyName = rule.getBusCompany().getName();
            } catch (Exception e) {
                log.warn("Lazy load busCompany failed for rule {}: {}", rule.getId(), e.getMessage());
            }
        }

        return PricingRuleResponse.builder()
                .id(rule.getId())
                .busCompanyId(busCompanyId)
                .busCompanyName(busCompanyName)
                .name(rule.getName())
                .ruleType(rule.getRuleType())
                .scope(rule.getScope())
                .routeId(routeId)
                .routeName(routeName)
                .adjustmentType(rule.getAdjustmentType())
                .adjustmentValue(rule.getAdjustmentValue())
                .startDate(rule.getStartDate())
                .endDate(rule.getEndDate())
                .applicableDays(rule.getApplicableDays())
                .isLastMinute(rule.getIsLastMinute())
                .lastMinuteHours(rule.getLastMinuteHours())
                .minEmptySeatPercentage(rule.getMinEmptySeatPercentage())
                .priority(rule.getPriority())
                .status(rule.getStatus())
                .description(rule.getDescription())
                .createdAt(rule.getCreatedAt())
                .updatedAt(rule.getUpdatedAt())
                .build();
    }

    private Long resolveTargetCompanyId(Long explicitCompanyId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Vui lòng đăng nhập để thực hiện");
        }
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "Người dùng không tồn tại"));

        // Chỉ duy nhất ADMIN hệ thống mới được phép thao tác đại diện bằng explicitCompanyId
        if (user.getRole() == Role.ADMIN) {
            if (explicitCompanyId != null && explicitCompanyId > 0) {
                return explicitCompanyId;
            }
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Admin hệ thống vui lòng chỉ định mã nhà xe cần thao tác");
        }

        // BẢO MẬT PHÂN QUYỀN NỘI BỘ NHÀ XE (Sub-Account RBAC):
        // Chỉ Chủ nhà xe (StaffRole.OWNER) mới có quyền cấu hình luật giá vé (cấm Thu ngân & Điều phối viên)
        if (securityService != null) {
            securityService.requireStaffRole(authentication, StaffRole.OWNER);
        }

        // Người dùng nhà xe BẮT BUỘC lấy busCompanyId từ tài khoản của chính mình (chống giả mạo)
        if (user.getBusCompanyId() != null && user.getBusCompanyId() > 0) {
            return user.getBusCompanyId();
        }

        Optional<BusCompany> compByEmail = busCompanyRepository.findByEmail(email);
        if (compByEmail.isPresent()) {
            return compByEmail.get().getId();
        }

        // Đã xóa bỏ hoàn toàn lỗ hổng cướp quyền qua fullName (findAll loop).
        // Tuyệt đối không fallback explicitCompanyId cho non-admin: Trả về FORBIDDEN ngay lập tức
        throw new AppException(ErrorCode.FORBIDDEN, "Tài khoản của bạn không được cấp quyền quản trị nhà xe nào");
    }
}
