package com.traveleasy.dto.company.pricing;

import com.traveleasy.entity.AdjustmentType;
import com.traveleasy.entity.PricingRuleScope;
import com.traveleasy.entity.PricingRuleStatus;
import com.traveleasy.entity.PricingRuleType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePricingRuleRequest {

    private Long busCompanyId;

    @NotBlank(message = "Tên quy tắc giá vé không được để trống")
    private String name;

    @NotNull(message = "Loại quy tắc không được để trống")
    private PricingRuleType ruleType;

    @Builder.Default
    private PricingRuleScope scope = PricingRuleScope.ALL_ROUTES;

    private Long routeId;

    @Builder.Default
    private AdjustmentType adjustmentType = AdjustmentType.PERCENTAGE;

    @NotNull(message = "Giá trị điều chỉnh không được để trống")
    @DecimalMin(value = "0.01", message = "Giá trị điều chỉnh phải lớn hơn 0")
    private BigDecimal adjustmentValue;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;

    @Builder.Default
    private String applicableDays = "ALL";

    @Builder.Default
    private Boolean isLastMinute = false;

    @Builder.Default
    private Integer lastMinuteHours = 2;

    @Builder.Default
    private Integer minEmptySeatPercentage = 50;

    @Builder.Default
    private Integer priority = 0;

    @Builder.Default
    private PricingRuleStatus status = PricingRuleStatus.ACTIVE;

    private String description;
}
