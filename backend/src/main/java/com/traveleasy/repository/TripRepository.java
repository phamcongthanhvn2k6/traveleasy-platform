package com.traveleasy.repository;

import com.traveleasy.entity.Trip;
import com.traveleasy.entity.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    @Query("""
        SELECT t FROM Trip t
        JOIN FETCH t.route r
        JOIN FETCH t.busCompany c
        WHERE (:origin IS NULL OR LOWER(r.departureLocation) LIKE LOWER(CONCAT('%', :origin, '%')))
          AND (:destination IS NULL OR LOWER(r.arrivalLocation) LIKE LOWER(CONCAT('%', :destination, '%')))
          AND (:startTime IS NULL OR t.departureTime >= :startTime)
          AND (:endTime IS NULL OR t.departureTime <= :endTime)
          AND (:status IS NULL OR t.status = :status)
        ORDER BY t.departureTime ASC
    """)
    List<Trip> searchTrips(
        @Param("origin") String origin,
        @Param("destination") String destination,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        @Param("status") TripStatus status
    );

    List<Trip> findByRouteIdAndDepartureTimeBetween(Long routeId, LocalDateTime start, LocalDateTime end);
    long countByStatus(TripStatus status);
}
