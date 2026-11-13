package com.traveleasy.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "company_pricing_rules", indexes = {
    @Index(name = "idx_pricing_rules_company", columnList = "bus_company_id"),
    @Index(name = "idx_pricing_rules_status", columnList = "status"),
    @Index(name = "idx_pricing_rules_dates", columnList = "start_date, end_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CompanyPricingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_company_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private BusCompany busCompany;

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", nullable = false, length = 30)
    private PricingRuleType ruleType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private PricingRuleScope scope = PricingRuleScope.ALL_ROUTES;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Route route;

    @Enumerated(EnumType.STRING)
    @Column(name = "adjustment_type", nullable = false, length = 30)
    @Builder.Default
    private AdjustmentType adjustmentType = AdjustmentType.PERCENTAGE;

    @Column(name = "adjustment_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal adjustmentValue;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "applicable_days", length = 100)
    @Builder.Default
    private String applicableDays = "ALL";

    @Column(name = "is_last_minute", nullable = false)
    @Builder.Default
    private Boolean isLastMinute = false;

    @Column(name = "last_minute_hours")
    @Builder.Default
    private Integer lastMinuteHours = 2;

    @Column(name = "min_empty_seat_percentage")
    @Builder.Default
    private Integer minEmptySeatPercentage = 50;

    @Column(nullable = false)
    @Builder.Default
    private Integer priority = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PricingRuleStatus status = PricingRuleStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = PricingRuleStatus.ACTIVE;
        if (scope == null) scope = PricingRuleScope.ALL_ROUTES;
        if (adjustmentType == null) adjustmentType = AdjustmentType.PERCENTAGE;
        if (isLastMinute == null) isLastMinute = false;
        if (priority == null) priority = 0;
        if (applicableDays == null || applicableDays.isBlank()) applicableDays = "ALL";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
