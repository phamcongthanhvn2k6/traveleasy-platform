package com.traveleasy.repository;

import com.traveleasy.entity.ItineraryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItineraryRepository extends JpaRepository<ItineraryEntity, String> {
    List<ItineraryEntity> findByCityIgnoreCaseAndIsActiveTrue(String city);
    List<ItineraryEntity> findByIsActiveTrue();
}

