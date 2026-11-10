package com.traveleasy.service.company;

import com.traveleasy.dto.company.pricing.DynamicPricingResult;
import com.traveleasy.dto.company.pricing.PriceSimulationRequest;
import com.traveleasy.dto.company.pricing.PriceSimulationResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.CompanyPricingRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DynamicPricingService {

    private final CompanyPricingRuleRepository pricingRuleRepository;

    private static final BigDecimal PRICE_FLOOR = BigDecimal.valueOf(50000);
    private static final BigDecimal THOUSAND = BigDecimal.valueOf(1000);

    /**
     * Tính toán giá vé động thời gian thực cho một chuyến xe cụ thể.
     */
    public DynamicPricingResult calculateDynamicPrice(Trip trip, LocalDateTime requestTime) {
        if (trip == null || trip.getPrice() == null) {
            return DynamicPricingResult.builder()
                    .originalPrice(BigDecimal.ZERO)
                    .calculatedPrice(BigDecimal.ZERO)
                    .deltaAmount(BigDecimal.ZERO)
                    .ruleApplied(false)
                    .build();
        }

        Long companyId = (trip.getBusCompany() != null) ? trip.getBusCompany().getId() : null;
        List<CompanyPricingRule> activeRules = Collections.emptyList();
        if (companyId != null) {
            activeRules = pricingRuleRepository.findByBusCompanyIdAndStatusOrderByPriorityDesc(companyId, PricingRuleStatus.ACTIVE);
        }

        return evaluateDynamicPricing(trip, requestTime != null ? requestTime : LocalDateTime.now(), activeRules);
    }

    /**
     * Tính toán giá vé động khi đã nạp sẵn danh sách quy tắc (Batch Evaluation tránh N+1 Query).
     */
    public DynamicPricingResult calculateDynamicPriceWithRules(Trip trip, LocalDateTime requestTime, List<CompanyPricingRule> activeRules) {
        if (trip == null || trip.getPrice() == null) {
            return DynamicPricingResult.builder()
                    .originalPrice(BigDecimal.ZERO)
                    .calculatedPrice(BigDecimal.ZERO)
                    .deltaAmount(BigDecimal.ZERO)
                    .ruleApplied(false)
                    .build();
        }

        return evaluateDynamicPricing(trip, requestTime != null ? requestTime : LocalDateTime.now(), activeRules);
    }

    /**
     * Đánh giá và áp dụng quy tắc theo nguyên tắc độc quyền (Non-stacking) & ưu tiên cao nhất.
     */
    private DynamicPricingResult evaluateDynamicPricing(Trip trip, LocalDateTime requestTime, List<CompanyPricingRule> activeRules) {
        BigDecimal basePrice = trip.getPrice();
        LocalDateTime departureTime = trip.getDepartureTime();
        if (departureTime == null || activeRules == null || activeRules.isEmpty()) {
            return DynamicPricingResult.builder()
                    .originalPrice(basePrice)
                    .calculatedPrice(basePrice)
                    .deltaAmount(BigDecimal.ZERO)
                    .ruleApplied(false)
                    .build();
        }

        LocalDate departureDate = departureTime.toLocalDate();
        String dayOfWeek = departureTime.getDayOfWeek().name();
        int totalSeats = (trip.getTotalSeats() != null) ? trip.getTotalSeats() : 0;
        int availableSeats = (trip.getAvailableSeats() != null) ? trip.getAvailableSeats() : 0;
        Long tripRouteId = (trip.getRoute() != null) ? trip.getRoute().getId() : null;

        CompanyPricingRule matchedRule = null;

        for (CompanyPricingRule rule : activeRules) {
            if (rule.getStatus() != PricingRuleStatus.ACTIVE) {
                continue;
            }

            // 1. Kiểm tra dải ngày hiệu lực
            if (departureDate.isBefore(rule.getStartDate()) || departureDate.isAfter(rule.getEndDate())) {
                continue;
            }

            // 2. Kiểm tra phạm vi tuyến đường (SPECIFIC_ROUTE vs ALL_ROUTES)
            if (rule.getScope() == PricingRuleScope.SPECIFIC_ROUTE) {
                if (rule.getRoute() == null || tripRouteId == null || !rule.getRoute().getId().equals(tripRouteId)) {
                    continue;
                }
            }

            // 3. Kiểm tra các thứ trong tuần áp dụng
            if (rule.getApplicableDays() != null && !"ALL".equalsIgnoreCase(rule.getApplicableDays().trim())) {
                List<String> days = Arrays.stream(rule.getApplicableDays().toUpperCase().split("[,;| ]+"))
                        .filter(s -> !s.isBlank())
                        .toList();
                if (!days.contains(dayOfWeek)) {
                    continue;
                }
            }

            // 4. Kiểm tra điều kiện giờ chót (Flash Sale Last-Minute)
            if (Boolean.TRUE.equals(rule.getIsLastMinute())) {
                if (totalSeats <= 0) {
                    continue; // Phòng vệ tránh chia cho 0
                }
                double emptySeatPercentage = (availableSeats * 100.0) / totalSeats;
                int minEmptyRequired = (rule.getMinEmptySeatPercentage() != null) ? rule.getMinEmptySeatPercentage() : 50;
                if (emptySeatPercentage < minEmptyRequired) {
                    continue;
                }

                if (!departureTime.isAfter(requestTime)) {
                    continue; // Chuyến đã qua giờ khởi hành
                }

                int limitHours = (rule.getLastMinuteHours() != null) ? rule.getLastMinuteHours() : 2;
                long diffMinutes = Duration.between(requestTime, departureTime).toMinutes();
                if (diffMinutes < 0 || diffMinutes > (long) limitHours * 60) {
                    continue;
                }
            }

            // Khớp quy tắc ưu tiên cao nhất đầu tiên (Non-stacking)
            matchedRule = rule;
            break;
        }

        if (matchedRule == null) {
            return DynamicPricingResult.builder()
                    .originalPrice(basePrice)
                    .calculatedPrice(basePrice)
                    .deltaAmount(BigDecimal.ZERO)
                    .ruleApplied(false)
                    .build();
        }

        // Tính giá điều chỉnh
        BigDecimal calculatedPrice = calculatePriceWithRule(basePrice, matchedRule);
        BigDecimal deltaAmount = calculatedPrice.subtract(basePrice);
        String badge = generatePricingBadge(matchedRule);
        String description = matchedRule.getDescription() != null ? matchedRule.getDescription() : matchedRule.getName();

        return DynamicPricingResult.builder()
                .originalPrice(basePrice)
                .calculatedPrice(calculatedPrice)
                .deltaAmount(deltaAmount)
                .pricingBadge(badge)
                .ruleDescription(description)
                .appliedRule(matchedRule)
                .ruleApplied(true)
                .build();
    }

    /**
     * Tính giá điều chỉnh, áp dụng sàn giá 50.000 VNĐ và làm tròn đến hàng nghìn đồng (commercial rounding).
     */
    private BigDecimal calculatePriceWithRule(BigDecimal basePrice, CompanyPricingRule rule) {
        BigDecimal rawPrice;
        BigDecimal adjustmentValue = rule.getAdjustmentValue();

        if (rule.getAdjustmentType() == AdjustmentType.PERCENTAGE) {
            BigDecimal rate = adjustmentValue.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            if (rule.getRuleType() == PricingRuleType.FLASH_SALE) {
                rawPrice = basePrice.multiply(BigDecimal.ONE.subtract(rate));
            } else {
                rawPrice = basePrice.multiply(BigDecimal.ONE.add(rate));
            }
        } else {
            // FIXED_AMOUNT
            if (rule.getRuleType() == PricingRuleType.FLASH_SALE) {
                rawPrice = basePrice.subtract(adjustmentValue);
            } else {
                rawPrice = basePrice.add(adjustmentValue);
            }
        }

        // Áp dụng giá sàn tối thiểu 50.000 VNĐ
        if (rawPrice.compareTo(PRICE_FLOOR) < 0) {
            rawPrice = PRICE_FLOOR;
        }

        // Làm tròn đến hàng nghìn đồng (Nearest 1.000 VNĐ)
        return rawPrice.divide(THOUSAND, 0, RoundingMode.HALF_UP).multiply(THOUSAND);
    }

    /**
     * Tạo chuỗi huy hiệu hiển thị trực quan (pricing badge).
     */
    private String generatePricingBadge(CompanyPricingRule rule) {
        String sign = (rule.getRuleType() == PricingRuleType.FLASH_SALE) ? "-" : "+";
        String valStr;
        if (rule.getAdjustmentType() == AdjustmentType.PERCENTAGE) {
            valStr = rule.getAdjustmentValue().stripTrailingZeros().toPlainString() + "%";
        } else {
            valStr = rule.getAdjustmentValue().divide(THOUSAND, 0, RoundingMode.HALF_UP).toPlainString() + "k";
        }

        return switch (rule.getRuleType()) {
            case HOLIDAY_SURCHARGE -> sign + valStr + " Lễ Tết";
            case WEEKEND_SURCHARGE -> sign + valStr + " Cuối tuần";
            case FLASH_SALE -> sign + valStr + " Giờ chót";
            case CUSTOM -> sign + valStr + " " + rule.getName();
        };
    }

    /**
     * Mô phỏng giá vé trực tiếp (Live Price Simulator) cho nhà xe.
     */
    public PriceSimulationResponse simulatePricing(PriceSimulationRequest request) {
        Route route = null;
        if (request.getRouteId() != null) {
            route = Route.builder().id(request.getRouteId()).build();
        }

        BusCompany company = null;
        if (request.getBusCompanyId() != null) {
            company = BusCompany.builder().id(request.getBusCompanyId()).build();
        }

        Trip mockTrip = Trip.builder()
                .busCompany(company)
                .route(route)
                .departureTime(request.getDepartureTime())
                .price(request.getBasePrice())
                .totalSeats(request.getTotalSeats())
                .availableSeats(request.getAvailableSeats())
                .status(TripStatus.SCHEDULED)
                .build();

        LocalDateTime reqTime = (request.getRequestTime() != null) ? request.getRequestTime() : LocalDateTime.now();
        DynamicPricingResult result = calculateDynamicPrice(mockTrip, reqTime);

        BigDecimal adjustmentPercent = BigDecimal.ZERO;
        if (result.isRuleApplied() && result.getAppliedRule() != null) {
            if (result.getAppliedRule().getAdjustmentType() == AdjustmentType.PERCENTAGE) {
                adjustmentPercent = result.getAppliedRule().getAdjustmentValue();
            } else if (request.getBasePrice().compareTo(BigDecimal.ZERO) > 0) {
                adjustmentPercent = result.getDeltaAmount()
                        .multiply(BigDecimal.valueOf(100))
                        .divide(request.getBasePrice(), 1, RoundingMode.HALF_UP);
            }
        }

        String explanation;
        if (result.isRuleApplied() && result.getAppliedRule() != null) {
            explanation = String.format("Áp dụng quy tắc '%s' (%s), điều chỉnh %s%s. Đơn giá từ %sđ thành %sđ.",
                    result.getAppliedRule().getName(),
                    result.getPricingBadge(),
                    result.getDeltaAmount().compareTo(BigDecimal.ZERO) >= 0 ? "+" : "",
                    result.getDeltaAmount(),
                    result.getOriginalPrice(),
                    result.getCalculatedPrice()
            );
        } else {
            explanation = "Không có quy tắc giá vé nào phù hợp tại thời điểm này. Giữ nguyên giá vé gốc.";
        }

        return PriceSimulationResponse.builder()
                .originalPrice(result.getOriginalPrice())
                .calculatedPrice(result.getCalculatedPrice())
                .deltaAmount(result.getDeltaAmount())
                .adjustmentPercent(adjustmentPercent)
                .appliedRuleName(result.getAppliedRule() != null ? result.getAppliedRule().getName() : null)
                .appliedRuleType(result.getAppliedRule() != null ? result.getAppliedRule().getRuleType() : null)
                .pricingBadge(result.getPricingBadge())
                .explanation(explanation)
                .hasRuleApplied(result.isRuleApplied())
                .build();
    }
}
