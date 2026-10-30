package com.traveleasy.service.admin;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.admin.CreateTripRequest;
import com.traveleasy.dto.admin.DashboardStatsResponse;
import com.traveleasy.dto.trip.TripResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import com.traveleasy.service.customer.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminTripService {

    private final TripRepository tripRepository;
    private final TripSeatRepository tripSeatRepository;
    private final BusCompanyRepository busCompanyRepository;
    private final RouteRepository routeRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PickupDropoffPointRepository pointRepository;
    private final TripService tripService;

    @Transactional
    @CacheEvict(value = {"admin_all_trips", "company_trips", "company_dashboard_stats", "system_stats", "trips_search"}, allEntries = true)
    public TripResponse createTrip(CreateTripRequest request) {
        if (request.getArrivalTime().isBefore(request.getDepartureTime())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Thời gian đến phải sau thời gian khởi hành");
        }
        if (request.getDepartureTime().isBefore(java.time.LocalDateTime.now())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Thời gian khởi hành không được ở trong quá khứ");
        }

        BusCompany company = busCompanyRepository.findById(request.getBusCompanyId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy nhà xe"));

        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tuyến đường"));

        int totalSeats = request.getTotalSeats() != null ? request.getTotalSeats() : 34;

        Trip trip = Trip.builder()
                .busCompany(company)
                .route(route)
                .departureTime(request.getDepartureTime())
                .arrivalTime(request.getArrivalTime())
                .busType(request.getBusType())
                .price(request.getPrice())
                .totalSeats(totalSeats)
                .availableSeats(totalSeats)
                .status(TripStatus.SCHEDULED)
                .build();

        Trip savedTrip = tripRepository.save(trip);

        // Tự động sinh kho ghế 2 tầng: Tầng 1 (A01-A17), Tầng 2 (B01-B17)
        List<TripSeat> seats = new ArrayList<>();
        int halfSeats = totalSeats / 2;

        for (int i = 1; i <= halfSeats; i++) {
            seats.add(TripSeat.builder()
                    .trip(savedTrip)
                    .seatCode(String.format("A%02d", i))
                    .floor(1)
                    .rowNum((i + 1) / 2)
                    .colNum(i % 2 == 1 ? 1 : 2)
                    .status(SeatStatus.AVAILABLE)
                    .build());
        }

        for (int i = 1; i <= (totalSeats - halfSeats); i++) {
            seats.add(TripSeat.builder()
                    .trip(savedTrip)
                    .seatCode(String.format("B%02d", i))
                    .floor(2)
                    .rowNum((i + 1) / 2)
                    .colNum(i % 2 == 1 ? 1 : 2)
                    .status(SeatStatus.AVAILABLE)
                    .build());
        }

        tripSeatRepository.saveAll(seats);

        return tripService.mapToTripResponse(savedTrip);
    }

    @Transactional(readOnly = true)
    @Cacheable("admin_all_trips")
    public List<TripResponse> getAllTrips() {
        List<Trip> trips = tripRepository.findAllByOrderByDepartureTimeDesc();
        return mapTripsWithPointsBatch(trips);
    }

    public List<TripResponse> mapTripsWithPointsBatch(List<Trip> trips) {
        if (trips == null || trips.isEmpty()) return Collections.emptyList();

        Set<Long> routeIds = trips.stream()
                .map(t -> t.getRoute() != null ? t.getRoute().getId() : null)
                .filter(Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());

        Map<Long, List<PickupDropoffPoint>> routePointsMap = new HashMap<>();
        if (!routeIds.isEmpty()) {
            List<PickupDropoffPoint> allPoints = pointRepository.findByRouteIdInOrderByDisplayOrderAsc(routeIds);
            for (PickupDropoffPoint p : allPoints) {
                if (p.getRoute() != null && p.getRoute().getId() != null) {
                    routePointsMap.computeIfAbsent(p.getRoute().getId(), k -> new ArrayList<>()).add(p);
                }
            }
        }

        return trips.stream()
                .map(t -> {
                    Long rId = t.getRoute() != null ? t.getRoute().getId() : null;
                    return tripService.mapToTripResponse(t, routePointsMap.getOrDefault(rId, Collections.emptyList()));
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"admin_all_trips", "company_trips", "company_dashboard_stats", "system_stats", "trips_search"}, allEntries = true)
    public TripResponse updateTripStatus(Long tripId, TripStatus status) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe"));
        trip.setStatus(status);
        return tripService.mapToTripResponse(tripRepository.save(trip));
    }

    @Transactional
    @CacheEvict(value = {"admin_all_trips", "company_trips", "company_dashboard_stats", "system_stats", "trips_search"}, allEntries = true)
    public TripResponse updateTrip(Long tripId, com.traveleasy.dto.admin.UpdateTripRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe"));

        java.time.LocalDateTime dep = request.getDepartureTime() != null ? request.getDepartureTime() : trip.getDepartureTime();
        java.time.LocalDateTime arr = request.getArrivalTime() != null ? request.getArrivalTime() : trip.getArrivalTime();
        if (arr != null && dep != null && arr.isBefore(dep)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Thời gian đến phải sau thời gian khởi hành");
        }

        if (request.getDepartureTime() != null) trip.setDepartureTime(request.getDepartureTime());
        if (request.getArrivalTime() != null) trip.setArrivalTime(request.getArrivalTime());
        if (request.getBusType() != null) trip.setBusType(request.getBusType());
        if (request.getPrice() != null) trip.setPrice(request.getPrice());

        return tripService.mapToTripResponse(tripRepository.save(trip));
    }

    @Transactional
    @CacheEvict(value = {"admin_all_trips", "company_trips", "company_dashboard_stats", "system_stats", "trips_search"}, allEntries = true)
    public void deleteTrip(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe"));

        if (bookingRepository.existsByTripId(tripId)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Không thể xóa chuyến xe đã có hành khách đặt vé. Vui lòng chuyển trạng thái sang CANCELLED thay vì xóa.");
        }

        tripSeatRepository.deleteAll(tripSeatRepository.findByTripIdOrderByFloorAscSeatCodeAsc(tripId));
        tripRepository.delete(trip);
    }

    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable("system_stats")
    public DashboardStatsResponse getDashboardStats() {
        long totalTrips = tripRepository.count();
        long scheduledTrips = tripRepository.countByStatus(TripStatus.SCHEDULED);
        long totalBookings = bookingRepository.count();
        long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        BigDecimal totalRevenue = bookingRepository.sumTotalRevenue();
        long totalUsers = userRepository.count();

        return DashboardStatsResponse.builder()
                .totalTrips(totalTrips)
                .scheduledTrips(scheduledTrips)
                .totalBookings(totalBookings)
                .confirmedBookings(confirmedBookings)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .totalUsers(totalUsers)
                .build();
    }
}
