package com.traveleasy.repository;

import com.traveleasy.entity.PayoutRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PayoutRequestRepository extends JpaRepository<PayoutRequest, Long> {

    List<PayoutRequest> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PayoutRequest p WHERE p.company.id = :companyId AND p.status IN ('PENDING', 'APPROVED')")
    BigDecimal sumPendingAmountByCompanyId(@Param("companyId") Long companyId);
}
