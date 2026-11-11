package com.traveleasy.repository;

import com.traveleasy.entity.TicketExchangeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketExchangeLogRepository extends JpaRepository<TicketExchangeLog, Long> {
    List<TicketExchangeLog> findByOriginalTicketId(Long originalTicketId);
    List<TicketExchangeLog> findByBusCompanyIdOrderByCreatedAtDesc(Long busCompanyId);
}
