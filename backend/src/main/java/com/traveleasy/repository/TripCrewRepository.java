package com.traveleasy.repository;

import com.traveleasy.entity.TripCrew;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface TripCrewRepository extends JpaRepository<TripCrew, Long> {
    @Query("SELECT c FROM TripCrew c WHERE c.trip.id = :tripId")
    Optional<TripCrew> findByTripId(@Param("tripId") Long tripId);

    @Query("SELECT c FROM TripCrew c WHERE c.trip.id IN :tripIds")
    List<TripCrew> findByTripIdIn(@Param("tripIds") java.util.Collection<Long> tripIds);

    List<TripCrew> findByBusCompanyIdOrderByCreatedAtDesc(Long busCompanyId);
    boolean existsByTripId(Long tripId);
}
