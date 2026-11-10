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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/company/pricing-rules")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
@Tag(name = "Company Pricing Rules Management", description = "Quản trị quy tắc giá vé động, phụ thu Lễ Tết/Cuối tuần và Flash Sale giờ chót cho nhà xe đối tác")
public class CompanyPricingRuleController {

    private final CompanyPricingRuleRepository pricingRuleRepository;
    private final BusCompanyRepository busCompanyRepository;
    private final RouteRepository routeRepository;
    private final UserRepository userRepository;
    private final DynamicPricingService dynamicPricingService;

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
    @Operation(summary = "Tạo mới quy tắc giá vé")
    public ApiResponse<PricingRuleResponse> createPricingRule(
            @Valid @RequestBody CreatePricingRuleRequest request,
            Authentication authentication) {

        Long targetCompanyId = resolveTargetCompanyId(request.getBusCompanyId(), authentication);
        if (targetCompanyId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Không thể xác thực nhà xe đối tác");
        }

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
        if (rule.getRoute() != null) {
            routeName = rule.getRoute().getDepartureLocation() + " -> " + rule.getRoute().getArrivalLocation();
        }

        return PricingRuleResponse.builder()
                .id(rule.getId())
                .busCompanyId(rule.getBusCompany().getId())
                .busCompanyName(rule.getBusCompany().getName())
                .name(rule.getName())
                .ruleType(rule.getRuleType())
                .scope(rule.getScope())
                .routeId(rule.getRoute() != null ? rule.getRoute().getId() : null)
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
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                // Nếu là ADMIN, cho phép thao tác đại diện theo explicitCompanyId
                if (user.getRole() == Role.ADMIN && explicitCompanyId != null && explicitCompanyId > 0) {
                    return explicitCompanyId;
                }
                // Nếu là OPERATOR hoặc có busCompanyId gán cho tài khoản, BẮT BUỘC dùng busCompanyId của chính mình (chống giả mạo)
                if (user.getBusCompanyId() != null && user.getBusCompanyId() > 0) {
                    return user.getBusCompanyId();
                }

                Optional<BusCompany> compByEmail = busCompanyRepository.findByEmail(email);
                if (compByEmail.isPresent()) {
                    return compByEmail.get().getId();
                }

                if (user.getFullName() != null) {
                    String fullName = user.getFullName().trim().toLowerCase();
                    for (BusCompany bc : busCompanyRepository.findAll()) {
                        String bcName = bc.getName().trim().toLowerCase();
                        if (fullName.equals(bcName) || fullName.equals("điều hành " + bcName)) {
                            return bc.getId();
                        }
                    }
                }
            }
        }

        if (explicitCompanyId != null && explicitCompanyId > 0) {
            return explicitCompanyId;
        }

        return null;
    }
}
