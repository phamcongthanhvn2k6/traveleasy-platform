package com.traveleasy.repository;

import com.traveleasy.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByTxnRef(String txnRef);

    List<PaymentTransaction> findByBookingCode(String bookingCode);

    List<PaymentTransaction> findByBookingId(Long bookingId);

    Optional<PaymentTransaction> findFirstByBookingCodeOrderByCreatedAtDesc(String bookingCode);
}
