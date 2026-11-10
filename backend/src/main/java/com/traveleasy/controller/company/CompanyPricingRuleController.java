package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;

/**
 * [S307] Phân Hệ Quản Trị Giá Vé Động & Phụ Thu Lễ Tết / Cuối Tuần (/company/pricing-rules)
 * Đã khắc phục BUG-ROUND2-04: Giới hạn trần phụ thu Max Surcharge Cap (40%) chống nhồi giá quá khung quy định
 * @author Trần Minh Đức (tranduc2601)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/company/pricing-rules")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Dynamic Pricing", description = "[S307] Động cơ định giá vé động và kiểm soát trần giá Bộ GTVT - Trần Minh Đức")
public class CompanyPricingRuleController {

    private static final BigDecimal MAX_SURCHARGE_CAP_PERCENT = new BigDecimal("40.0"); // Trần tối đa 40% theo khung đăng ký Sở GTVT

    @GetMapping
    @Operation(summary = "Lấy danh sách quy tắc phụ thu giá vé đang áp dụng")
    public ApiResponse<List<Map<String, Object>>> getPricingRules(
            @RequestParam(required = false) Long busCompanyId) {
        return ApiResponse.success(List.of(
                Map.of(
                        "id", "RULE-01",
                        "ruleName", "Phụ thu Cuối tuần (T6, T7, CN)",
                        "ruleType", "WEEKEND",
                        "surchargePercent", 15,
                        "fixedSurcharge", 0,
                        "active", true,
                        "description", "Áp dụng tự động cho các chuyến khởi hành Thứ 6, Thứ 7 và Chủ Nhật"
                ),
                Map.of(
                        "id", "RULE-02",
                        "ruleName", "Phụ thu Giường Tầng 1 (Tầng Dưới)",
                        "ruleType", "SEAT_POSITION",
                        "surchargePercent", 0,
                        "fixedSurcharge", 20000,
                        "active", true,
                        "description", "Phụ thu tiện ích cho hành khách ưu tiên chọn giường tầng dưới thuận tiện di chuyển"
                ),
                Map.of(
                        "id", "RULE-03",
                        "ruleName", "Phụ thu Cao điểm Lễ / Tết",
                        "ruleType", "HOLIDAY",
                        "surchargePercent", 30,
                        "fixedSurcharge", 0,
                        "active", true,
                        "description", "Áp dụng trong các dịp Lễ 30/4 - 1/5, Quốc khánh 2/9 và Tết Nguyên Đán"
                )
        ));
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

        // 1. Tính phụ thu cuối tuần (T6, T7, CN)
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

        // Tổng phụ thu lý thuyết
        BigDecimal totalRawSurcharge = weekendSurcharge.add(holidaySurcharge).add(floor1Surcharge);

        // KIỂM SOÁT TRẦN PHỤ THU (Khắc phục BUG-ROUND2-04: Price Gouging Prevention)
        BigDecimal maxAllowedSurcharge = basePrice.multiply(MAX_SURCHARGE_CAP_PERCENT)
                .divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP);

        boolean capApplied = false;
        BigDecimal finalSurcharge = totalRawSurcharge;
        if (totalRawSurcharge.compareTo(maxAllowedSurcharge) > 0) {
            finalSurcharge = maxAllowedSurcharge;
            capApplied = true;
            log.info("Price Cap Alert: Tổng phụ thu {} vượt trần 40% ({}), đã tự động điều chỉnh về mức trần cho phép.",
                    totalRawSurcharge, maxAllowedSurcharge);
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
}
