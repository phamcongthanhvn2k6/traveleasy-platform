package com.traveleasy.repository;

import com.traveleasy.entity.SeatLayoutTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatLayoutTemplateRepository extends JpaRepository<SeatLayoutTemplate, Long> {
    List<SeatLayoutTemplate> findByStatus(String status);
}

