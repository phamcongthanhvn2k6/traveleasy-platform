package com.traveleasy.repository;

import com.traveleasy.entity.SeatStatus;
import com.traveleasy.entity.TripSeat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripSeatRepository extends JpaRepository<TripSeat, Long> {
    List<TripSeat> findByTripIdOrderByFloorAscSeatCodeAsc(Long tripId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM TripSeat s WHERE s.trip.id = :tripId AND s.seatCode IN :seatCodes")
    List<TripSeat> findByTripIdAndSeatCodeInWithLock(
        @Param("tripId") Long tripId,
        @Param("seatCodes") List<String> seatCodes
    );

    long countByTripIdAndStatus(Long tripId, SeatStatus status);
}
