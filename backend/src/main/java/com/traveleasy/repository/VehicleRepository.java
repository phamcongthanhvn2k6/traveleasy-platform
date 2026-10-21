package com.traveleasy.repository;

import com.traveleasy.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByBusCompanyIdOrderByCreatedAtDesc(Long busCompanyId);
    List<Vehicle> findAllByOrderByCreatedAtDesc();
    Optional<Vehicle> findByPlateNumber(String plateNumber);
}
