package com.traveleasy.repository;

import com.traveleasy.entity.TripCrew;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripCrewRepository extends JpaRepository<TripCrew, Long> {
    Optional<TripCrew> findByTripId(Long tripId);
    List<TripCrew> findByBusCompanyIdOrderByCreatedAtDesc(Long busCompanyId);
    boolean existsByTripId(Long tripId);
}
