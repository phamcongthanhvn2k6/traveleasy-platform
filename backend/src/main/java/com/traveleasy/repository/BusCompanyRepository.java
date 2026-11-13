package com.traveleasy.repository;

import com.traveleasy.entity.BusCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusCompanyRepository extends JpaRepository<BusCompany, Long> {
    Optional<BusCompany> findFirstByName(String name);
    default Optional<BusCompany> findByName(String name) {
        return findFirstByName(name);
    }
    boolean existsByName(String name);
    Optional<BusCompany> findByEmail(String email);
    boolean existsByEmail(String email);
}
