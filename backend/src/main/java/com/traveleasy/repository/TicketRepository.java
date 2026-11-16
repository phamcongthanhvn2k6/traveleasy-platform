package com.traveleasy.repository;

import com.traveleasy.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByTicketCode(String ticketCode);
    Optional<Ticket> findByQrCodeHash(String qrCodeHash);

    @Query("SELECT t FROM Ticket t WHERE UPPER(t.ticketCode) = UPPER(:code) OR (t.qrCodeHash IS NOT NULL AND t.qrCodeHash = :code)")
    Optional<Ticket> findByCodeOrQrHash(@Param("code") String code);

    // ponytail: pessimistic write lock for atomic check-in prevention
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Ticket t WHERE t.ticketCode = :ticketCode")
    Optional<Ticket> findByTicketCodeForUpdate(@Param("ticketCode") String ticketCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Ticket t WHERE UPPER(t.ticketCode) = UPPER(:code) OR (t.qrCodeHash IS NOT NULL AND t.qrCodeHash = :code)")
    Optional<Ticket> findByCodeOrQrHashForUpdate(@Param("code") String code);

    List<Ticket> findByBookingId(Long bookingId);
    List<Ticket> findByBookingIdIn(Collection<Long> bookingIds);
    List<Ticket> findByBookingTripId(Long tripId);
}
