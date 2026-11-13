package com.traveleasy.repository;

import com.traveleasy.entity.TripExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripExpenseRepository extends JpaRepository<TripExpense, Long> {
    Optional<TripExpense> findByTripId(Long tripId);
    List<TripExpense> findByBusCompanyId(Long busCompanyId);
}
