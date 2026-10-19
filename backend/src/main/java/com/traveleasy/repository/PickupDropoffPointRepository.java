package com.traveleasy.repository;

import com.traveleasy.entity.PickupDropoffPoint;
import com.traveleasy.entity.PointType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PickupDropoffPointRepository extends JpaRepository<PickupDropoffPoint, Long> {
    List<PickupDropoffPoint> findByRouteIdOrderByDisplayOrderAsc(Long routeId);
    List<PickupDropoffPoint> findByRouteIdAndPointTypeOrderByDisplayOrderAsc(Long routeId, PointType pointType);
}
