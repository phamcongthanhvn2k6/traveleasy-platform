package com.traveleasy.service.customer;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.trip.*;
import com.traveleasy.entity.*;
import com.traveleasy.repository.PickupDropoffPointRepository;
import com.traveleasy.repository.RouteRepository;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.repository.TripSeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final TripSeatRepository tripSeatRepository;
    private final PickupDropoffPointRepository pointRepository;
    private final RouteRepository routeRepository;
    private final com.traveleasy.service.automation.TripAutomationService tripAutomationService;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    @Transactional
    public List<TripResponse> searchTrips(String origin, String destination, LocalDate departureDate) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime = null;
        LocalDateTime endTime = null;

        if (departureDate != null) {
            // Nếu ngày tìm kiếm trong quá khứ -> Không mở bán vé
            if (departureDate.isBefore(now.toLocalDate())) {
                return Collections.emptyList();
            }
            if (departureDate.isEqual(now.toLocalDate())) {
                // Ngày hôm nay: Chỉ tìm chuyến từ thời điểm hiện tại trở đi
                startTime = now;
            } else {
                startTime = departureDate.atStartOfDay();
            }
            endTime = departureDate.atTime(LocalTime.MAX);

            // On-demand: Tự động đảm bảo sinh chuyến nếu ngày tìm kiếm chưa có chuyến nào
            if (tripAutomationService != null) {
                tripAutomationService.ensureTripsForRouteAndDate(origin, destination, departureDate);
            }
        } else {
            // Không truyền ngày: Tìm các chuyến sắp tới từ thời điểm hiện tại trở đi
            startTime = now;
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

    /**
     * Tra cứu bảng lịch trình chạy xe & tần suất định kỳ theo tuyến đường (Outbound & Inbound)
     */
    @Transactional(readOnly = true)
    public RouteScheduleResponse getSchedule(String origin, String destination) {
        // 1. Chuẩn hóa điểm đi & điểm đến mặc định nếu không truyền
        String from = (origin != null && !origin.trim().isEmpty()) ? origin.trim() : "TP. Hồ Chí Minh";
        String to = (destination != null && !destination.trim().isEmpty()) ? destination.trim() : "Đà Lạt";

        // 2. Lấy danh sách điểm đi / đến có sẵn trong CSDL
        List<String> origins = routeRepository.findDistinctDepartureLocations();
        List<String> destinations = routeRepository.findDistinctArrivalLocations();
        if (origins.isEmpty()) {
            origins = List.of("TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Vũng Tàu", "Đà Lạt");
        }
        if (destinations.isEmpty()) {
            destinations = List.of("Đà Lạt", "Nha Trang", "Sa Pa", "Hải Phòng", "Phan Thiết", "TP. Hồ Chí Minh");
        }

        // 3. Tìm tuyến đường thực tế trong CSDL
        Optional<Route> outboundRouteOpt = routeRepository.findByDepartureLocationAndArrivalLocation(from, to);
        if (outboundRouteOpt.isEmpty()) {
            List<Route> routes = routeRepository.findByDepartureLocationContainingIgnoreCase(from);
            outboundRouteOpt = routes.stream()
                    .filter(r -> r.getArrivalLocation().toLowerCase().contains(to.toLowerCase()))
                    .findFirst();
        }

        Route outboundRoute = outboundRouteOpt.orElse(null);
        Long routeId = outboundRoute != null ? outboundRoute.getId() : null;
        BigDecimal distanceKm = outboundRoute != null && outboundRoute.getDistanceKm() != null 
                ? outboundRoute.getDistanceKm() : BigDecimal.valueOf(305.0);
        BigDecimal durationHours = outboundRoute != null && outboundRoute.getDurationHours() != null 
                ? outboundRoute.getDurationHours() : BigDecimal.valueOf(6.5);

        // Điểm đón / trả của tuyến chiều đi
        List<PickupDropoffPoint> outboundPoints = outboundRoute != null 
                ? pointRepository.findByRouteIdOrderByDisplayOrderAsc(outboundRoute.getId()) 
                : List.of();

        List<PointResponse> pickupPoints = outboundPoints.stream()
                .filter(p -> p.getPointType() == PointType.PICKUP)
                .map(this::mapToPointResponse)
                .collect(Collectors.toList());

        List<PointResponse> dropoffPoints = outboundPoints.stream()
                .filter(p -> p.getPointType() == PointType.DROPOFF)
                .map(this::mapToPointResponse)
                .collect(Collectors.toList());

        // 4. Tìm các chuyến xe chiều đi (Outbound)
        List<Trip> realOutboundTrips = tripRepository.searchTrips(from, to, null, null, TripStatus.SCHEDULED);
        List<ScheduleTripItem> outboundItems;

        if (!realOutboundTrips.isEmpty()) {
            outboundItems = realOutboundTrips.stream()
                    .map(t -> mapToScheduleTripItem(t, outboundPoints))
                    .collect(Collectors.toList());
        } else {
            // Trường hợp tuyến mới chưa tạo chuyến, sinh lịch trình chạy giờ tiêu chuẩn theo tuyến
            outboundItems = generateSyntheticTrips(from, to, durationHours, distanceKm, false);
        }

        // 5. Tìm tuyến đường và các chuyến xe chiều về (Inbound)
        Optional<Route> inboundRouteOpt = routeRepository.findByDepartureLocationAndArrivalLocation(to, from);
        Route inboundRoute = inboundRouteOpt.orElse(null);
        Long returnRouteId = inboundRoute != null ? inboundRoute.getId() : null;

        List<PickupDropoffPoint> inboundPoints = inboundRoute != null 
                ? pointRepository.findByRouteIdOrderByDisplayOrderAsc(inboundRoute.getId()) 
                : List.of();

        List<Trip> realInboundTrips = tripRepository.searchTrips(to, from, null, null, TripStatus.SCHEDULED);
        List<ScheduleTripItem> inboundItems;

        if (!realInboundTrips.isEmpty()) {
            inboundItems = realInboundTrips.stream()
                    .map(t -> mapToScheduleTripItem(t, inboundPoints))
                    .collect(Collectors.toList());
        } else {
            inboundItems = generateSyntheticTrips(to, from, durationHours, distanceKm, true);
        }

        // 6. Tính giá vé min, max và tần suất
        BigDecimal minPrice = outboundItems.stream()
                .map(ScheduleTripItem::getPrice)
                .filter(Objects::nonNull)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.valueOf(280000));

        BigDecimal maxPrice = outboundItems.stream()
                .map(ScheduleTripItem::getPrice)
                .filter(Objects::nonNull)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.valueOf(390000));

        int totalCount = outboundItems.size();
        String frequency = totalCount > 1 
                ? "Khoảng " + Math.max(30, Math.round(1440.0 / totalCount / 15.0) * 15) + " phút / chuyến"
                : "Chạy định kỳ hàng ngày";

        return RouteScheduleResponse.builder()
                .routeId(routeId)
                .originCity(from)
                .destinationCity(to)
                .distanceKm(distanceKm)
                .durationHours(durationHours)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .totalTrips(totalCount)
                .frequency(frequency)
                .outboundTrips(outboundItems)
                .returnRouteId(returnRouteId)
                .inboundTrips(inboundItems)
                .pickupPoints(pickupPoints)
                .dropoffPoints(dropoffPoints)
                .availableOrigins(origins)
                .availableDestinations(destinations)
                .build();
    }

    /**
     * Lấy danh sách toàn bộ các tuyến đường đang mở bán
     */
    @Transactional(readOnly = true)
    public List<RouteOptionResponse> getAllRouteOptions() {
        return routeRepository.findAllByOrderByDepartureLocationAscArrivalLocationAsc().stream()
                .map(r -> RouteOptionResponse.builder()
                        .id(r.getId())
                        .departureLocation(r.getDepartureLocation())
                        .arrivalLocation(r.getArrivalLocation())
                        .distanceKm(r.getDistanceKm())
                        .durationHours(r.getDurationHours())
                        .build())
                .collect(Collectors.toList());
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

    private ScheduleTripItem mapToScheduleTripItem(Trip trip, List<PickupDropoffPoint> routePoints) {
        List<PointResponse> pickups = routePoints.stream()
                .filter(p -> p.getPointType() == PointType.PICKUP)
                .map(this::mapToPointResponse)
                .collect(Collectors.toList());

        List<PointResponse> dropoffs = routePoints.stream()
                .filter(p -> p.getPointType() == PointType.DROPOFF)
                .map(this::mapToPointResponse)
                .collect(Collectors.toList());

        String mainPickup = !pickups.isEmpty() ? pickups.get(0).getName() : "Bến xe trung tâm " + trip.getRoute().getDepartureLocation();
        String mainDropoff = !dropoffs.isEmpty() ? dropoffs.get(0).getName() : "Bến xe trung tâm " + trip.getRoute().getArrivalLocation();

        return ScheduleTripItem.builder()
                .id(trip.getId())
                .busCompanyId(trip.getBusCompany().getId())
                .busCompanyName(trip.getBusCompany().getName())
                .busCompanyLogo(trip.getBusCompany().getLogoUrl())
                .busCompanyRating(4.9)
                .departureTime(trip.getDepartureTime())
                .arrivalTime(trip.getArrivalTime())
                .departureTimeFormatted(trip.getDepartureTime().format(TIME_FMT))
                .arrivalTimeFormatted(trip.getArrivalTime().format(TIME_FMT))
                .durationFormatted(formatDuration(trip.getDepartureTime(), trip.getArrivalTime()))
                .busType(trip.getBusType())
                .busTypeName(mapBusTypeName(trip.getBusType()))
                .price(trip.getPrice())
                .totalSeats(trip.getTotalSeats())
                .availableSeats(trip.getAvailableSeats())
                .status(trip.getStatus())
                .originCity(trip.getRoute().getDepartureLocation())
                .destinationCity(trip.getRoute().getArrivalLocation())
                .mainPickupPoint(mainPickup)
                .mainDropoffPoint(mainDropoff)
                .pickupPoints(pickups)
                .dropoffPoints(dropoffs)
                .build();
    }

    private List<ScheduleTripItem> generateSyntheticTrips(String from, String to, BigDecimal duration, BigDecimal distance, boolean isReturn) {
        List<ScheduleTripItem> list = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // 5 mốc thời gian xuất bến chuẩn bao quát đầy đủ cả 4 khung giờ trong ngày
        int[][] departureSlots = {
                {4, 30, 350000, 34, 26}, // 00h - 06h (Sáng sớm)
                {7, 30, 320000, 34, 28}, // 06h - 12h (Buổi sáng)
                {10, 30, 280000, 40, 22}, // 06h - 12h (Buổi sáng)
                {15, 0, 340000, 34, 18},  // 12h - 18h (Buổi chiều)
                {22, 30, 390000, 34, 30}  // 18h - 24h (Buổi tối)
        };

        if (isReturn) {
            departureSlots = new int[][]{
                    {5, 0, 350000, 34, 24},  // 00h - 06h (Sáng sớm)
                    {8, 0, 320000, 34, 25},  // 06h - 12h (Buổi sáng)
                    {11, 0, 280000, 40, 19}, // 06h - 12h (Buổi sáng)
                    {16, 30, 340000, 34, 15},// 12h - 18h (Buổi chiều)
                    {23, 0, 390000, 34, 29}  // 18h - 24h (Buổi tối)
            };
        }

        long durMinutes = duration != null ? Math.round(duration.doubleValue() * 60) : 360;

        for (int i = 0; i < departureSlots.length; i++) {
            int hour = departureSlots[i][0];
            int minute = departureSlots[i][1];
            BigDecimal price = BigDecimal.valueOf(departureSlots[i][2]);
            int totalSeats = departureSlots[i][3];
            int availableSeats = departureSlots[i][4];

            LocalDateTime dep = today.atTime(hour, minute);
            LocalDateTime arr = dep.plusMinutes(durMinutes);

            BusType bType = totalSeats == 40 ? BusType.SLEEPER : BusType.LIMOUSINE;
            String companyName = (i % 2 == 0) ? "TravelEasy Express" : "Thành Bưởi Limousine";

            List<PointResponse> pickups = List.of(
                    PointResponse.builder().id((long) (100 + i * 2)).name("Bến xe Trung Tâm " + from).address("Cổng số 1, " + from).pointType(PointType.PICKUP).orderIndex(1).build(),
                    PointResponse.builder().id((long) (101 + i * 2)).name("Trạm đón khách trung chuyển " + from).address("Đại lộ chính, " + from).pointType(PointType.PICKUP).orderIndex(2).build()
            );

            List<PointResponse> dropoffs = List.of(
                    PointResponse.builder().id((long) (200 + i * 2)).name("Bến xe Liên Tỉnh " + to).address("Trung tâm TP. " + to).pointType(PointType.DROPOFF).orderIndex(1).build(),
                    PointResponse.builder().id((long) (201 + i * 2)).name("Văn phòng trả khách " + to).address("Nội thành, " + to).pointType(PointType.DROPOFF).orderIndex(2).build()
            );

            list.add(ScheduleTripItem.builder()
                    .id((long) (1000 + i + (isReturn ? 50 : 0)))
                    .busCompanyId(1L)
                    .busCompanyName(companyName)
                    .busCompanyLogo(null)
                    .busCompanyRating(4.9)
                    .departureTime(dep)
                    .arrivalTime(arr)
                    .departureTimeFormatted(dep.format(TIME_FMT))
                    .arrivalTimeFormatted(arr.format(TIME_FMT))
                    .durationFormatted(formatDuration(dep, arr))
                    .busType(bType)
                    .busTypeName(mapBusTypeName(bType))
                    .price(price)
                    .totalSeats(totalSeats)
                    .availableSeats(availableSeats)
                    .status(TripStatus.SCHEDULED)
                    .originCity(from)
                    .destinationCity(to)
                    .mainPickupPoint("Bến xe Trung Tâm " + from)
                    .mainDropoffPoint("Bến xe Liên Tỉnh " + to)
                    .pickupPoints(pickups)
                    .dropoffPoints(dropoffs)
                    .build());
        }

        return list;
    }

    private String formatDuration(LocalDateTime dep, LocalDateTime arr) {
        if (dep == null || arr == null) return "6h 00m";
        Duration duration = Duration.between(dep, arr);
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        return hours + "h " + (minutes < 10 ? "0" + minutes : minutes) + "m";
    }

    private String mapBusTypeName(BusType type) {
        if (type == null) return "Giường Nằm 40 Chỗ";
        return switch (type) {
            case LIMOUSINE -> "Limousine 34 Phòng VIP";
            case SLEEPER -> "Giường Nằm Tiêu Chuẩn 40 Chỗ";
            case SEAT -> "Ghế Ngồi Cao Cấp 29 Chỗ";
            default -> type.name();
        };
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
