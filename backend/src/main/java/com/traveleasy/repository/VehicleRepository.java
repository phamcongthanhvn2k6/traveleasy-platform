package com.traveleasy.repository;

import com.traveleasy.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT v FROM Vehicle v LEFT JOIN FETCH v.busCompany bc WHERE bc.id = :busCompanyId ORDER BY v.createdAt DESC")
    List<Vehicle> findByBusCompanyIdOrderByCreatedAtDesc(@org.springframework.data.repository.query.Param("busCompanyId") Long busCompanyId);

    @org.springframework.data.jpa.repository.Query("SELECT v FROM Vehicle v LEFT JOIN FETCH v.busCompany bc ORDER BY v.createdAt DESC")
    List<Vehicle> findAllByOrderByCreatedAtDesc();
    Optional<Vehicle> findByPlateNumber(String plateNumber);
}

