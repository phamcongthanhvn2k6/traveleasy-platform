package com.traveleasy.repository;

import com.traveleasy.entity.GatewayConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GatewayConfigRepository extends JpaRepository<GatewayConfig, Long> {
    Optional<GatewayConfig> findByProvider(String provider);
    List<GatewayConfig> findByCategory(String category);
}

