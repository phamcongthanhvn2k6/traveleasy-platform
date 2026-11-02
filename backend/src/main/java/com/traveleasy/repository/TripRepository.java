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
        WHERE (:origin IS NULL OR :origin = '' OR LOWER(r.departureLocation) LIKE CONCAT('%', LOWER(:origin), '%'))
          AND (:destination IS NULL OR :destination = '' OR LOWER(r.arrivalLocation) LIKE CONCAT('%', LOWER(:destination), '%'))
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

    @Query("SELECT t.route.id, MIN(t.price) FROM Trip t WHERE t.status = com.traveleasy.entity.TripStatus.SCHEDULED AND t.departureTime >= :startTime GROUP BY t.route.id")
    List<Object[]> findMinPricesPerRouteGrouped(@Param("startTime") LocalDateTime startTime);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Trip t SET t.status = com.traveleasy.entity.TripStatus.COMPLETED WHERE t.status = com.traveleasy.entity.TripStatus.SCHEDULED AND t.departureTime < :now")
    int markPastTripsAsCompleted(@Param("now") LocalDateTime now);

    List<Trip> findByRouteIdAndDepartureTimeBetween(Long routeId, LocalDateTime start, LocalDateTime end);
    long countByStatus(TripStatus status);
    @Query("SELECT t FROM Trip t JOIN FETCH t.busCompany bc JOIN FETCH t.route r ORDER BY t.departureTime DESC")
    List<Trip> findAllByOrderByDepartureTimeDesc();

    @Query("SELECT t FROM Trip t JOIN FETCH t.busCompany bc JOIN FETCH t.route r WHERE bc.id = :busCompanyId ORDER BY t.departureTime DESC")
    List<Trip> findByBusCompanyIdOrderByDepartureTimeDesc(@Param("busCompanyId") Long busCompanyId);
    long countByBusCompanyId(Long busCompanyId);
    long countByBusCompanyIdAndStatus(Long busCompanyId, TripStatus status);

    boolean existsByRouteId(Long routeId);
    boolean existsByBusCompanyId(Long busCompanyId);
    boolean existsByRouteIdAndDepartureTime(Long routeId, LocalDateTime departureTime);
}
