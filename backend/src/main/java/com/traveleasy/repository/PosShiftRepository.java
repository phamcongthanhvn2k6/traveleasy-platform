package com.traveleasy.repository;

import com.traveleasy.entity.PosShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PosShiftRepository extends JpaRepository<PosShift, Long> {

    List<PosShift> findByBusCompanyIdOrderByOpenedAtDesc(Long busCompanyId);

    Optional<PosShift> findByIdAndBusCompanyId(Long id, Long busCompanyId);

    Optional<PosShift> findFirstByBusCompanyIdAndStaffUserIdAndStatusOrderByOpenedAtDesc(
            Long busCompanyId,
            Long staffUserId,
            String status
    );

    boolean existsByBusCompanyIdAndCounterNameIgnoreCaseAndStatus(
            Long busCompanyId,
            String counterName,
            String status
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        UPDATE PosShift s
        SET s.totalCashCollected = s.totalCashCollected + :amount,
            s.totalTicketsSold = s.totalTicketsSold + :ticketCount,
            s.updatedAt = :updatedAt
        WHERE s.id = :shiftId
          AND s.busCompanyId = :companyId
          AND s.status = 'OPEN'
    """)
    int addCashSale(
            @Param("companyId") Long companyId,
            @Param("shiftId") Long shiftId,
            @Param("amount") BigDecimal amount,
            @Param("ticketCount") int ticketCount,
            @Param("updatedAt") LocalDateTime updatedAt
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        UPDATE PosShift s
        SET s.totalCashRefunds = s.totalCashRefunds + :amount,
            s.updatedAt = :updatedAt
        WHERE s.id = :shiftId
          AND s.busCompanyId = :companyId
          AND s.status = 'OPEN'
    """)
    int addCashRefund(
            @Param("companyId") Long companyId,
            @Param("shiftId") Long shiftId,
            @Param("amount") BigDecimal amount,
            @Param("updatedAt") LocalDateTime updatedAt
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        UPDATE PosShift s
        SET s.status = 'CLOSED',
            s.closedAt = :closedAt,
            s.countedCashAmount = :countedCash,
            s.cashVariance = :countedCash - (s.initialCashAmount + s.totalCashCollected - s.totalCashRefunds),
            s.notes = :closeNote,
            s.updatedAt = :closedAt
        WHERE s.id = :shiftId
          AND s.busCompanyId = :companyId
          AND s.status = 'OPEN'
    """)
    int closeOpenShift(
            @Param("companyId") Long companyId,
            @Param("shiftId") Long shiftId,
            @Param("countedCash") BigDecimal countedCash,
            @Param("closeNote") String closeNote,
            @Param("closedAt") LocalDateTime closedAt
    );
}

