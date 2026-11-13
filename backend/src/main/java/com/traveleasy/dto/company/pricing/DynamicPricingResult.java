package com.traveleasy.dto.company.pricing;

import com.traveleasy.entity.CompanyPricingRule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DynamicPricingResult {

    private BigDecimal originalPrice;
    private BigDecimal calculatedPrice;
    private BigDecimal deltaAmount;
    private String pricingBadge;
    private String ruleDescription;
    private CompanyPricingRule appliedRule;
    private boolean ruleApplied;
}
