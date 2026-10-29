package com.traveleasy.repository;

import com.traveleasy.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findAllByStatusOrderByCreatedAtDesc(String status);
    List<Review> findByBusCompanyIdAndStatusOrderByCreatedAtDesc(Long busCompanyId, String status);
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByBookingCode(String bookingCode);
    boolean existsByBookingId(Long bookingId);

    @org.springframework.data.jpa.repository.Query("SELECT r.bookingCode FROM Review r WHERE r.bookingCode IS NOT NULL")
    java.util.Set<String> findAllReviewedBookingCodes();
}
