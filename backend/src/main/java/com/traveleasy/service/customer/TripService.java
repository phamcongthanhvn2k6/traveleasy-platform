package com.traveleasy.service.customer;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.trip.PointResponse;
import com.traveleasy.dto.trip.TripDetailResponse;
import com.traveleasy.dto.trip.TripResponse;
import com.traveleasy.dto.trip.TripSeatResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.PickupDropoffPointRepository;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.repository.TripSeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final TripSeatRepository tripSeatRepository;
    private final PickupDropoffPointRepository pointRepository;

    @Transactional(readOnly = true)
    public List<TripResponse> searchTrips(String origin, String destination, LocalDate departureDate) {
        LocalDateTime startTime = null;
        LocalDateTime endTime = null;

        if (departureDate != null) {
            startTime = departureDate.atStartOfDay();
            endTime = departureDate.atTime(LocalTime.MAX);
        }

        List<Trip> trips = tripRepository.searchTrips(origin, destination, startTime, endTime, TripStatus.SCHEDULED);
        return trips.stream().map(this::mapToTripResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TripDetailResponse getTripDetail(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe ID: " + tripId));

        List<TripSeat> seats = tripSeatRepository.findByTripIdOrderByFloorAscSeatCodeAsc(tripId);
        List<PickupDropoffPoint> points = pointRepository.findByRouteIdOrderByDisplayOrderAsc(trip.getRoute().getId());

        List<TripSeatResponse> seatResponses = seats.stream().map(s -> TripSeatResponse.builder()
                .id(s.getId())
                .seatNumber(s.getSeatCode())
                .deck(s.getFloor())
                .status(s.getStatus())
                .price(trip.getPrice())
                .build()).collect(Collectors.toList());

        List<PointResponse> pickupPoints = points.stream()
                .filter(p -> p.getPointType() == PointType.PICKUP)
                .map(this::mapToPointResponse)
                .collect(Collectors.toList());

        List<PointResponse> dropoffPoints = points.stream()
                .filter(p -> p.getPointType() == PointType.DROPOFF)
                .map(this::mapToPointResponse)
                .collect(Collectors.toList());

        return TripDetailResponse.builder()
                .trip(mapToTripResponse(trip))
                .seats(seatResponses)
                .pickupPoints(pickupPoints)
                .dropoffPoints(dropoffPoints)
                .build();
    }

    public TripResponse mapToTripResponse(Trip trip) {
        return TripResponse.builder()
                .id(trip.getId())
                .busCompanyId(trip.getBusCompany().getId())
                .busCompanyName(trip.getBusCompany().getName())
                .busCompanyLogo(trip.getBusCompany().getLogoUrl())
                .routeId(trip.getRoute().getId())
                .originCity(trip.getRoute().getDepartureLocation())
                .destinationCity(trip.getRoute().getArrivalLocation())
                .distanceKm(trip.getRoute().getDistanceKm() != null ? trip.getRoute().getDistanceKm().intValue() : 0)
                .durationHours(trip.getRoute().getDurationHours() != null ? trip.getRoute().getDurationHours().intValue() : 0)
                .departureTime(trip.getDepartureTime())
                .arrivalTime(trip.getArrivalTime())
                .busType(trip.getBusType())
                .price(trip.getPrice())
                .totalSeats(trip.getTotalSeats())
                .availableSeats(trip.getAvailableSeats())
                .status(trip.getStatus())
                .build();
    }

    private PointResponse mapToPointResponse(PickupDropoffPoint p) {
        return PointResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .address(p.getAddress())
                .pointType(p.getPointType())
                .orderIndex(p.getDisplayOrder())
                .build();
    }
}
