package com.traveleasy.repository;

import com.traveleasy.entity.SeatType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatTypeRepository extends JpaRepository<SeatType, String> {
    List<SeatType> findByStatus(String status);
}

