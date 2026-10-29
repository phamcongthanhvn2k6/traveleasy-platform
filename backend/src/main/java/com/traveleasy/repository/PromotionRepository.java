package com.traveleasy.repository;

import com.traveleasy.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    List<Promotion> findAllByIsActiveTrueOrderByCreatedAtDesc();
    Optional<Promotion> findByCodeIgnoreCaseAndIsActiveTrue(String code);
    Optional<Promotion> findByCodeIgnoreCase(String code);
}

