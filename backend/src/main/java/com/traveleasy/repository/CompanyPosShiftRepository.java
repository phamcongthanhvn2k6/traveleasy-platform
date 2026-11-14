package com.traveleasy.repository;

import com.traveleasy.entity.CompanyPosShift;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyPosShiftRepository extends JpaRepository<CompanyPosShift, Long> {

    List<CompanyPosShift> findByBusCompanyIdOrderByOpenedAtDesc(Long busCompanyId);

    Optional<CompanyPosShift> findFirstByBusCompanyIdAndStatusOrderByOpenedAtDesc(Long busCompanyId, String status);

    Optional<CompanyPosShift> findFirstByBusCompanyIdAndStaffUserIdAndStatusOrderByOpenedAtDesc(
            Long busCompanyId,
            Long staffUserId,
            String status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM CompanyPosShift s WHERE s.id = :id")
    Optional<CompanyPosShift> findByIdWithLock(@Param("id") Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE CompanyPosShift s SET s.totalCashCollected = s.totalCashCollected + :amount, " +
           "s.totalTicketsSold = s.totalTicketsSold + :ticketCount, " +
           "s.updatedAt = CURRENT_TIMESTAMP " +
           "WHERE s.id = :shiftId AND s.status = 'OPEN'")
    int recordCashSaleAtomically(
            @Param("shiftId") Long shiftId,
            @Param("amount") BigDecimal amount,
            @Param("ticketCount") int ticketCount
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE CompanyPosShift s SET s.totalQrCollected = s.totalQrCollected + :amount, " +
           "s.totalTicketsSold = s.totalTicketsSold + :ticketCount, " +
           "s.updatedAt = CURRENT_TIMESTAMP " +
           "WHERE s.id = :shiftId AND s.status = 'OPEN'")
    int recordQrSaleAtomically(
            @Param("shiftId") Long shiftId,
            @Param("amount") BigDecimal amount,
            @Param("ticketCount") int ticketCount
    );
}

