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
        WHERE (CAST(:origin AS string) IS NULL OR LOWER(r.departureLocation) LIKE CONCAT('%', LOWER(CAST(:origin AS string)), '%'))
          AND (CAST(:destination AS string) IS NULL OR LOWER(r.arrivalLocation) LIKE CONCAT('%', LOWER(CAST(:destination AS string)), '%'))
          AND (CAST(:startTime AS java.time.LocalDateTime) IS NULL OR t.departureTime >= :startTime)
          AND (CAST(:endTime AS java.time.LocalDateTime) IS NULL OR t.departureTime <= :endTime)
          AND (:status IS NULL OR t.status = :status)
          AND (c.status IS NULL OR UPPER(c.status) = 'ACTIVE')
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
    List<Trip> findAllByOrderByDepartureTimeDesc();
}
