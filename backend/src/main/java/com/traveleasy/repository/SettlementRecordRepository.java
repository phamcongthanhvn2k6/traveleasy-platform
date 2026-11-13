package com.traveleasy.repository;

import com.traveleasy.entity.SettlementRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SettlementRecordRepository extends JpaRepository<SettlementRecord, String> {

    @Query("SELECT s FROM SettlementRecord s JOIN FETCH s.company ORDER BY s.company.id ASC")
    List<SettlementRecord> findAllWithCompany();

    Optional<SettlementRecord> findByCompanyId(Long companyId);

    Optional<SettlementRecord> findFirstByCompanyIdOrderByCreatedAtDesc(Long companyId);

    List<SettlementRecord> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    Optional<SettlementRecord> findByCompanyIdAndCode(Long companyId, String code);

    Optional<SettlementRecord> findByCode(String code);
}
