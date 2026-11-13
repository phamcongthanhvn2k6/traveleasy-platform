package com.traveleasy.repository;

import com.traveleasy.entity.CompanyPricingRule;
import com.traveleasy.entity.PricingRuleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyPricingRuleRepository extends JpaRepository<CompanyPricingRule, Long> {

    @Query("SELECT r FROM CompanyPricingRule r LEFT JOIN FETCH r.busCompany LEFT JOIN FETCH r.route WHERE r.busCompany.id = :busCompanyId ORDER BY r.priority DESC")
    List<CompanyPricingRule> findByBusCompanyIdOrderByPriorityDesc(@Param("busCompanyId") Long busCompanyId);

    @Query("SELECT r FROM CompanyPricingRule r LEFT JOIN FETCH r.busCompany LEFT JOIN FETCH r.route WHERE r.busCompany.id = :busCompanyId AND r.status = :status ORDER BY r.priority DESC")
    List<CompanyPricingRule> findByBusCompanyIdAndStatusOrderByPriorityDesc(@Param("busCompanyId") Long busCompanyId, @Param("status") PricingRuleStatus status);

    @Query("SELECT r FROM CompanyPricingRule r LEFT JOIN FETCH r.busCompany LEFT JOIN FETCH r.route WHERE r.id = :id AND r.busCompany.id = :busCompanyId")
    Optional<CompanyPricingRule> findByIdAndBusCompanyId(@Param("id") Long id, @Param("busCompanyId") Long busCompanyId);

    @Query("SELECT r FROM CompanyPricingRule r LEFT JOIN FETCH r.busCompany LEFT JOIN FETCH r.route WHERE r.busCompany.id IN :busCompanyIds AND r.status = :status ORDER BY r.priority DESC")
    List<CompanyPricingRule> findByBusCompanyIdInAndStatusOrderByPriorityDesc(@Param("busCompanyIds") Collection<Long> busCompanyIds, @Param("status") PricingRuleStatus status);

    @Query("SELECT r FROM CompanyPricingRule r LEFT JOIN FETCH r.busCompany LEFT JOIN FETCH r.route WHERE r.status = :status ORDER BY r.priority DESC")
    List<CompanyPricingRule> findByStatusOrderByPriorityDesc(@Param("status") PricingRuleStatus status);
}
