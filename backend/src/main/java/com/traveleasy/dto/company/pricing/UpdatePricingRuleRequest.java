package com.traveleasy.dto.company.pricing;

import com.traveleasy.entity.AdjustmentType;
import com.traveleasy.entity.PricingRuleScope;
import com.traveleasy.entity.PricingRuleStatus;
import com.traveleasy.entity.PricingRuleType;
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
public class UpdatePricingRuleRequest {

    private String name;
    private PricingRuleType ruleType;
    private PricingRuleScope scope;
    private Long routeId;
    private AdjustmentType adjustmentType;
    private BigDecimal adjustmentValue;
    private LocalDate startDate;
    private LocalDate endDate;
    private String applicableDays;
    private Boolean isLastMinute;
    private Integer lastMinuteHours;
    private Integer minEmptySeatPercentage;
    private Integer priority;
    private PricingRuleStatus status;
    private String description;
}
