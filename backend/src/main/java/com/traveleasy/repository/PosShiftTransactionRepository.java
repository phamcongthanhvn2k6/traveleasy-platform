package com.traveleasy.repository;

import com.traveleasy.entity.PosShiftTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PosShiftTransactionRepository extends JpaRepository<PosShiftTransaction, Long> {

    List<PosShiftTransaction> findByShiftIdOrderByCreatedAtAsc(Long shiftId);
}

