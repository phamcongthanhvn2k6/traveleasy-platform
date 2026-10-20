package com.traveleasy.service;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.admin.CreateTripRequest;
import com.traveleasy.dto.admin.DashboardStatsResponse;
import com.traveleasy.dto.trip.TripResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminTripService {

    private final TripRepository tripRepository;
    private final TripSeatRepository tripSeatRepository;
    private final BusCompanyRepository busCompanyRepository;
    private final RouteRepository routeRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final TripService tripService;

    @Transactional
    public TripResponse createTrip(CreateTripRequest request) {
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

    @Transactional
    public TripResponse updateTripStatus(Long tripId, TripStatus status) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe"));
        trip.setStatus(status);
        return tripService.mapToTripResponse(tripRepository.save(trip));
    }

    @Transactional(readOnly = true)
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
