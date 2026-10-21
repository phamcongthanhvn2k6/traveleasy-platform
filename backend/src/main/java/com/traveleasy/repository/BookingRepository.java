package com.traveleasy.repository;

import com.traveleasy.entity.Booking;
import com.traveleasy.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingCode(String bookingCode);
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Booking> findByPassengerPhoneOrderByCreatedAtDesc(String passengerPhone);
    long countByStatus(BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status = com.traveleasy.entity.BookingStatus.CONFIRMED")
    BigDecimal sumTotalRevenue();

    @Query("SELECT b FROM Booking b WHERE b.trip.busCompany.id = :busCompanyId ORDER BY b.createdAt DESC")
    List<Booking> findByBusCompanyIdOrderByCreatedAtDesc(@Param("busCompanyId") Long busCompanyId);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.trip.busCompany.id = :busCompanyId AND b.status = com.traveleasy.entity.BookingStatus.CONFIRMED")
    BigDecimal sumTotalRevenueByBusCompanyId(@Param("busCompanyId") Long busCompanyId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.trip.busCompany.id = :busCompanyId")
    long countByBusCompanyId(@Param("busCompanyId") Long busCompanyId);
}
