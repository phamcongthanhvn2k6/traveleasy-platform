package com.traveleasy.repository;

import com.traveleasy.entity.ShuttleRequest;
import com.traveleasy.entity.ShuttleRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * [S317] Repository quản lý yêu cầu xe trung chuyển đón tận nhà
 */
@Repository
public interface ShuttleRequestRepository extends JpaRepository<ShuttleRequest, Long> {

    List<ShuttleRequest> findByBusCompanyId(Long busCompanyId);

    List<ShuttleRequest> findByBusCompanyIdAndMainTripId(Long busCompanyId, Long mainTripId);

    List<ShuttleRequest> findByBusCompanyIdAndStatus(Long busCompanyId, ShuttleRequestStatus status);

    @Query("SELECT s FROM ShuttleRequest s WHERE s.busCompanyId = :busCompanyId " +
           "AND (:mainTripId IS NULL OR s.mainTripId = :mainTripId) " +
           "AND (:status IS NULL OR s.status = :status) " +
           "AND (:fromTime IS NULL OR s.shuttlePickupTime >= :fromTime) " +
           "AND (:toTime IS NULL OR s.shuttlePickupTime <= :toTime) " +
           "ORDER BY s.shuttlePickupTime ASC")
    List<ShuttleRequest> findWithFilters(
            @Param("busCompanyId") Long busCompanyId,
            @Param("mainTripId") Long mainTripId,
            @Param("status") ShuttleRequestStatus status,
            @Param("fromTime") LocalDateTime fromTime,
            @Param("toTime") LocalDateTime toTime
    );
}
