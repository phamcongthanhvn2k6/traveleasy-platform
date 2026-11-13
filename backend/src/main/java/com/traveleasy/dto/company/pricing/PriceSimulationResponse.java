package com.traveleasy.dto.company.pricing;

import com.traveleasy.entity.PricingRuleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceSimulationResponse {

    private BigDecimal originalPrice;
    private BigDecimal calculatedPrice;
    private BigDecimal deltaAmount;
    private BigDecimal adjustmentPercent;
    private String appliedRuleName;
    private PricingRuleType appliedRuleType;
    private String pricingBadge;
    private String explanation;
    private Boolean hasRuleApplied;
}
