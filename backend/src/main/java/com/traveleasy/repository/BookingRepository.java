package com.traveleasy.repository;

import com.traveleasy.entity.Booking;
import com.traveleasy.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Booking b WHERE b.id = :id")
    Optional<Booking> findByIdForUpdate(@Param("id") Long id);

    @EntityGraph(attributePaths = {"user", "trip", "trip.busCompany", "trip.route"})
    @Query(value = """
            SELECT b FROM Booking b LEFT JOIN b.trip t LEFT JOIN t.busCompany c LEFT JOIN t.route r
            WHERE (:search IS NULL OR LOWER(b.bookingCode) LIKE :search ESCAPE '!'
                   OR LOWER(b.passengerName) LIKE :search ESCAPE '!'
                   OR LOWER(b.passengerPhone) LIKE :search ESCAPE '!'
                   OR LOWER(b.passengerEmail) LIKE :search ESCAPE '!')
              AND (:busCompanyId IS NULL OR c.id = :busCompanyId)
              AND (:routeId IS NULL OR r.id = :routeId)
              AND (CAST(:departureFrom AS java.time.LocalDateTime) IS NULL OR t.departureTime >= :departureFrom)
              AND (CAST(:departureToExclusive AS java.time.LocalDateTime) IS NULL OR t.departureTime < :departureToExclusive)
              AND (:status IS NULL OR b.status = :status)
            """, countQuery = """
            SELECT COUNT(b) FROM Booking b LEFT JOIN b.trip t LEFT JOIN t.busCompany c LEFT JOIN t.route r
            WHERE (:search IS NULL OR LOWER(b.bookingCode) LIKE :search ESCAPE '!'
                   OR LOWER(b.passengerName) LIKE :search ESCAPE '!'
                   OR LOWER(b.passengerPhone) LIKE :search ESCAPE '!'
                   OR LOWER(b.passengerEmail) LIKE :search ESCAPE '!')
              AND (:busCompanyId IS NULL OR c.id = :busCompanyId)
              AND (:routeId IS NULL OR r.id = :routeId)
              AND (CAST(:departureFrom AS java.time.LocalDateTime) IS NULL OR t.departureTime >= :departureFrom)
              AND (CAST(:departureToExclusive AS java.time.LocalDateTime) IS NULL OR t.departureTime < :departureToExclusive)
              AND (:status IS NULL OR b.status = :status)
            """)
    Page<Booking> findS405Page(@Param("search") String search,
                               @Param("busCompanyId") Long busCompanyId,
                               @Param("routeId") Long routeId,
                               @Param("departureFrom") java.time.LocalDateTime departureFrom,
                               @Param("departureToExclusive") java.time.LocalDateTime departureToExclusive,
                               @Param("status") BookingStatus status,
                               Pageable pageable);

    @Query("SELECT b FROM Booking b JOIN FETCH b.trip t JOIN FETCH t.busCompany bc JOIN FETCH t.route r WHERE b.status IN (com.traveleasy.entity.BookingStatus.CONFIRMED, com.traveleasy.entity.BookingStatus.COMPLETED) ORDER BY b.createdAt DESC")
    List<Booking> findRecentCompletedEligibleBookings();

    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.trip t LEFT JOIN FETCH t.busCompany bc LEFT JOIN FETCH t.route r ORDER BY b.createdAt DESC")
    List<Booking> findAllWithTripDetails();

    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.trip t LEFT JOIN FETCH t.busCompany bc LEFT JOIN FETCH t.route r WHERE t.busCompany.id = :busCompanyId ORDER BY b.createdAt DESC")
    List<Booking> findByBusCompanyIdWithTripDetails(@Param("busCompanyId") Long busCompanyId);

    @Query("SELECT b FROM Booking b JOIN FETCH b.trip t JOIN FETCH t.busCompany bc JOIN FETCH t.route r WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<Booking> findByUserIdWithTripDetails(@Param("userId") Long userId);

    @Query("SELECT b FROM Booking b JOIN FETCH b.trip t JOIN FETCH t.busCompany bc JOIN FETCH t.route r WHERE b.bookingCode = :bookingCode")
    Optional<Booking> findByBookingCodeWithTripDetails(@Param("bookingCode") String bookingCode);

    Optional<Booking> findByBookingCode(String bookingCode);
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.trip t LEFT JOIN FETCH t.busCompany bc LEFT JOIN FETCH t.route r WHERE (b.user IS NOT NULL AND b.user.id = :userId) OR (b.passengerEmail IS NOT NULL AND LOWER(b.passengerEmail) = LOWER(:email)) ORDER BY b.createdAt DESC")
    List<Booking> findByUserIdOrPassengerEmailOrderByCreatedAtDesc(@Param("userId") Long userId, @Param("email") String email);

    List<Booking> findByPassengerPhoneOrderByCreatedAtDesc(String passengerPhone);

    List<Booking> findByPosShiftIdAndBookingChannelAndPaymentMethodAndStatusInOrderByCreatedAtAsc(
            Long posShiftId,
            String bookingChannel,
            com.traveleasy.entity.PaymentMethod paymentMethod,
            List<BookingStatus> statuses
    );

    long countByStatus(BookingStatus status);
    List<Booking> findByStatusAndCreatedAtBefore(BookingStatus status, java.time.LocalDateTime threshold);

    boolean existsByTripId(Long tripId);
    List<Booking> findByTripId(Long tripId);
    boolean existsByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status = com.traveleasy.entity.BookingStatus.CONFIRMED")
    BigDecimal sumTotalRevenue();

    @Query("SELECT b FROM Booking b WHERE b.trip.busCompany.id = :busCompanyId ORDER BY b.createdAt DESC")
    List<Booking> findByBusCompanyIdOrderByCreatedAtDesc(@Param("busCompanyId") Long busCompanyId);

    /**
     * [P3 PERF] Lấy booking hợp lệ của nhà xe trong khoảng thời gian từ DB — tránh load toàn bộ.
     * Chỉ lấy CONFIRMED + COMPLETED, từ startDate trở đi, giảm data transfer đáng kể.
     */
    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.trip t LEFT JOIN FETCH t.busCompany bc LEFT JOIN FETCH t.route r " +
           "WHERE t.busCompany.id = :busCompanyId " +
           "AND b.status IN (com.traveleasy.entity.BookingStatus.CONFIRMED, com.traveleasy.entity.BookingStatus.COMPLETED) " +
           "AND b.createdAt >= :startDate " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findValidBookingsByBusCompanyAndPeriod(
            @Param("busCompanyId") Long busCompanyId,
            @Param("startDate") java.time.LocalDateTime startDate
    );

    @Query("SELECT COALESCE(SUM(COALESCE(b.originalAmount, b.totalAmount)), 0) FROM Booking b WHERE b.trip.busCompany.id = :busCompanyId AND b.status = com.traveleasy.entity.BookingStatus.CONFIRMED")
    BigDecimal sumTotalRevenueByBusCompanyId(@Param("busCompanyId") Long busCompanyId);

    @Query("SELECT COALESCE(SUM(b.discountAmount), 0) FROM Booking b WHERE b.trip.busCompany.id = :busCompanyId AND b.status = com.traveleasy.entity.BookingStatus.CONFIRMED")
    BigDecimal sumVoucherDiscountByBusCompanyId(@Param("busCompanyId") Long busCompanyId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.trip.busCompany.id = :busCompanyId")
    long countByBusCompanyId(@Param("busCompanyId") Long busCompanyId);

    @Query("SELECT b.trip.busCompany.id, COUNT(b), COALESCE(SUM(COALESCE(b.originalAmount, b.totalAmount)), 0), COALESCE(SUM(b.totalAmount), 0), COALESCE(SUM(b.discountAmount), 0) FROM Booking b WHERE b.status = com.traveleasy.entity.BookingStatus.CONFIRMED GROUP BY b.trip.busCompany.id")
    List<Object[]> getBookingStatsGroupedByCompany();

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.trip.id = :tripId AND b.status IN (com.traveleasy.entity.BookingStatus.CONFIRMED, com.traveleasy.entity.BookingStatus.COMPLETED)")
    BigDecimal sumRevenueByTripId(@Param("tripId") Long tripId);

    @Query("SELECT b.trip.id, COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.trip.busCompany.id = :busCompanyId AND b.status IN (com.traveleasy.entity.BookingStatus.CONFIRMED, com.traveleasy.entity.BookingStatus.COMPLETED) GROUP BY b.trip.id")
    List<Object[]> sumRevenueGroupedByTripId(@Param("busCompanyId") Long busCompanyId);

    @Query("SELECT COUNT(b), COALESCE(SUM(COALESCE(b.originalAmount, b.totalAmount)), 0), COALESCE(SUM(b.totalAmount), 0), COALESCE(SUM(b.discountAmount), 0) " +
           "FROM Booking b WHERE b.trip.busCompany.id = :busCompanyId AND b.status = com.traveleasy.entity.BookingStatus.CONFIRMED " +
           "AND b.createdAt >= :start AND b.createdAt < :end")
    List<Object[]> getCompanyStatsInPeriod(
            @Param("busCompanyId") Long busCompanyId,
            @Param("start") java.time.LocalDateTime start,
            @Param("end") java.time.LocalDateTime end);

    @Query("SELECT b FROM Booking b WHERE b.status IN (com.traveleasy.entity.BookingStatus.CONFIRMED, com.traveleasy.entity.BookingStatus.COMPLETED) AND b.createdAt >= :startDate")
    List<Booking> findRecentConfirmedBookings(@Param("startDate") java.time.LocalDateTime startDate);
}
