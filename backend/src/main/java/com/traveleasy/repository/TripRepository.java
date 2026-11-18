package com.traveleasy.repository;

import com.traveleasy.entity.Trip;
import com.traveleasy.entity.TripStatus;
import com.traveleasy.dto.admin.S405TripSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    @EntityGraph(attributePaths = {"busCompany", "route"})
    @Query(value = """
        SELECT t FROM Trip t
        LEFT JOIN t.busCompany c LEFT JOIN t.route r
        WHERE (:searchPattern IS NULL OR
               LOWER(c.name) LIKE :searchPattern ESCAPE '!' OR
               LOWER(r.departureLocation) LIKE :searchPattern ESCAPE '!' OR
               LOWER(r.arrivalLocation) LIKE :searchPattern ESCAPE '!' OR
               CAST(t.id AS string) LIKE :searchPattern ESCAPE '!')
          AND (:busCompanyId IS NULL OR c.id = :busCompanyId)
          AND (:routeId IS NULL OR r.id = :routeId)
          AND (CAST(:fromTime AS java.time.LocalDateTime) IS NULL OR t.departureTime >= :fromTime)
          AND (CAST(:toExclusive AS java.time.LocalDateTime) IS NULL OR t.departureTime < :toExclusive)
          AND (:status IS NULL OR t.status = :status)
        """, countQuery = """
        SELECT COUNT(t) FROM Trip t
        LEFT JOIN t.busCompany c LEFT JOIN t.route r
        WHERE (:searchPattern IS NULL OR
               LOWER(c.name) LIKE :searchPattern ESCAPE '!' OR
               LOWER(r.departureLocation) LIKE :searchPattern ESCAPE '!' OR
               LOWER(r.arrivalLocation) LIKE :searchPattern ESCAPE '!' OR
               CAST(t.id AS string) LIKE :searchPattern ESCAPE '!')
          AND (:busCompanyId IS NULL OR c.id = :busCompanyId)
          AND (:routeId IS NULL OR r.id = :routeId)
          AND (CAST(:fromTime AS java.time.LocalDateTime) IS NULL OR t.departureTime >= :fromTime)
          AND (CAST(:toExclusive AS java.time.LocalDateTime) IS NULL OR t.departureTime < :toExclusive)
          AND (:status IS NULL OR t.status = :status)
        """)
    Page<Trip> findS405Trips(@Param("searchPattern") String searchPattern,
                              @Param("busCompanyId") Long busCompanyId,
                              @Param("routeId") Long routeId,
                              @Param("fromTime") LocalDateTime fromTime,
                              @Param("toExclusive") LocalDateTime toExclusive,
                              @Param("status") TripStatus status,
                              Pageable pageable);

    @Query("""
        SELECT new com.traveleasy.dto.admin.S405TripSummary(
            COUNT(t),
            COALESCE(SUM(CASE WHEN t.status = com.traveleasy.entity.TripStatus.SCHEDULED THEN 1L ELSE 0L END), 0L),
            COALESCE(SUM(CASE WHEN t.status = com.traveleasy.entity.TripStatus.CANCELLED THEN 1L ELSE 0L END), 0L),
            COALESCE(SUM(COALESCE(t.totalSeats, 0)), 0L),
            COALESCE(SUM(COALESCE(t.totalSeats, 0) - COALESCE(t.availableSeats, 0)), 0L))
        FROM Trip t
        """)
    S405TripSummary getS405TripSummary();

    @EntityGraph(attributePaths = {"busCompany", "route"})
    @Query("SELECT t FROM Trip t")
    List<Trip> findAllWithDetails();

    @EntityGraph(attributePaths = {"busCompany", "route"})
    @Query("SELECT t FROM Trip t WHERE t.id = :id")
    Optional<Trip> findByIdWithDetails(@Param("id") Long id);

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

    @EntityGraph(attributePaths = {"busCompany", "route"})
    List<Trip> findByRouteIdAndDepartureTimeBetween(Long routeId, LocalDateTime start, LocalDateTime end);

    long countByStatus(TripStatus status);

    @EntityGraph(attributePaths = {"busCompany", "route"})
    @Query("SELECT t FROM Trip t ORDER BY t.departureTime DESC")
    List<Trip> findAllByOrderByDepartureTimeDesc();

    @EntityGraph(attributePaths = {"busCompany", "route"})
    @Query("SELECT t FROM Trip t WHERE t.busCompany.id = :busCompanyId ORDER BY t.departureTime DESC")
    List<Trip> findByBusCompanyIdOrderByDepartureTimeDesc(@Param("busCompanyId") Long busCompanyId);

    @EntityGraph(attributePaths = {"busCompany", "route"})
    @Query("SELECT t FROM Trip t WHERE t.busCompany.id = :busCompanyId ORDER BY t.departureTime DESC")
    List<Trip> findByBusCompanyIdWithDetails(@Param("busCompanyId") Long busCompanyId);

    /**
     * [P2 PERF] Lấy top N chuyến xe mới nhất của nhà xe với LIMIT từ DB — tránh load toàn bộ.
     * Dùng cho Dashboard (top 5) và các tính năng cần phân trang nhỏ.
     */
    @EntityGraph(attributePaths = {"busCompany", "route"})
    @Query("SELECT t FROM Trip t WHERE t.busCompany.id = :busCompanyId ORDER BY t.departureTime DESC")
    List<Trip> findTopNByBusCompanyId(@Param("busCompanyId") Long busCompanyId, Pageable pageable);

    @EntityGraph(attributePaths = {"busCompany", "route"})
    @Query("SELECT t FROM Trip t WHERE t.busCompany.id = :busCompanyId AND t.departureTime >= :startTime AND t.departureTime < :endTime ORDER BY t.departureTime ASC")
    List<Trip> findByBusCompanyIdAndDepartureTimeBetweenWithDetails(
            @Param("busCompanyId") Long busCompanyId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @EntityGraph(attributePaths = {"busCompany", "route"})
    List<Trip> findByBusCompanyId(Long busCompanyId);
    long countByBusCompanyId(Long busCompanyId);
    long countByBusCompanyIdAndStatus(Long busCompanyId, TripStatus status);

    boolean existsByRouteId(Long routeId);
    boolean existsByBusCompanyId(Long busCompanyId);
    boolean existsByRouteIdAndDepartureTime(Long routeId, LocalDateTime departureTime);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Trip t SET t.availableSeats = (SELECT CAST(COUNT(s) AS int) FROM TripSeat s WHERE s.trip.id = :tripId AND s.status = com.traveleasy.entity.SeatStatus.AVAILABLE) WHERE t.id = :tripId")
    int syncAvailableSeats(@Param("tripId") Long tripId);
}

