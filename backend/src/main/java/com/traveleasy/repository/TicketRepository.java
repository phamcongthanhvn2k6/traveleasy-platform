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

    // ponytail: pessimistic write lock for atomic check-in prevention
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Ticket t WHERE t.ticketCode = :ticketCode")
    Optional<Ticket> findByTicketCodeForUpdate(@Param("ticketCode") String ticketCode);

    List<Ticket> findByBookingId(Long bookingId);
    List<Ticket> findByBookingIdIn(Collection<Long> bookingIds);
    List<Ticket> findByBookingTripId(Long tripId);
}
