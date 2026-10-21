package com.traveleasy.repository;

import com.traveleasy.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByStatus(String status);
    List<Location> findByNameContainingIgnoreCaseOrProvinceContainingIgnoreCase(String name, String province);
}

