package com.traveleasy.repository;

import com.traveleasy.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {
    Optional<Route> findByDepartureLocationAndArrivalLocation(String departureLocation, String arrivalLocation);
    List<Route> findByDepartureLocationContainingIgnoreCase(String departureLocation);
    List<Route> findAllByOrderByDepartureLocationAscArrivalLocationAsc();

    @Query("SELECT DISTINCT r.departureLocation FROM Route r ORDER BY r.departureLocation ASC")
    List<String> findDistinctDepartureLocations();

    @Query("SELECT DISTINCT r.arrivalLocation FROM Route r ORDER BY r.arrivalLocation ASC")
    List<String> findDistinctArrivalLocations();
}
