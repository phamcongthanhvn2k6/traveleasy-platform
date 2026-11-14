package com.traveleasy.repository;

import com.traveleasy.entity.BusCompany;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT bc FROM BusCompany bc WHERE bc.id = :id")
    Optional<BusCompany> findByIdForUpdate(@Param("id") Long id);
}
