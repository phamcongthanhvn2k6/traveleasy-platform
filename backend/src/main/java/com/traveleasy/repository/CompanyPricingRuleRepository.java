package com.traveleasy.repository;

import com.traveleasy.entity.CompanyPricingRule;
import com.traveleasy.entity.PricingRuleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyPricingRuleRepository extends JpaRepository<CompanyPricingRule, Long> {

    List<CompanyPricingRule> findByBusCompanyIdOrderByPriorityDesc(Long busCompanyId);

    List<CompanyPricingRule> findByBusCompanyIdAndStatusOrderByPriorityDesc(Long busCompanyId, PricingRuleStatus status);

    Optional<CompanyPricingRule> findByIdAndBusCompanyId(Long id, Long busCompanyId);

    List<CompanyPricingRule> findByBusCompanyIdInAndStatusOrderByPriorityDesc(Collection<Long> busCompanyIds, PricingRuleStatus status);

    List<CompanyPricingRule> findByStatusOrderByPriorityDesc(PricingRuleStatus status);
}
