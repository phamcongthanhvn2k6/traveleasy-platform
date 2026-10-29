package com.traveleasy.service;

import com.traveleasy.dto.trip.RouteOptionResponse;
import com.traveleasy.dto.trip.RouteScheduleResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.PickupDropoffPointRepository;
import com.traveleasy.repository.RouteRepository;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.repository.TripSeatRepository;
import com.traveleasy.service.customer.TripService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripServiceScheduleTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TripSeatRepository tripSeatRepository;

    @Mock
    private PickupDropoffPointRepository pointRepository;

    @Mock
    private RouteRepository routeRepository;

    @Mock
    private com.traveleasy.service.automation.TripAutomationService tripAutomationService;

    @InjectMocks
    private TripService tripService;

    private Route testRoute;
    private BusCompany testCompany;
    private Trip testTrip;

    @BeforeEach
    void setUp() {
        testCompany = BusCompany.builder()
                .id(1L)
                .name("TravelEasy Express")
                .logoUrl("http://example.com/logo.png")
                .build();

        testRoute = Route.builder()
                .id(1L)
                .departureLocation("TP. Hồ Chí Minh")
                .arrivalLocation("Đà Lạt")
                .durationHours(BigDecimal.valueOf(6.5))
                .distanceKm(BigDecimal.valueOf(305.0))
                .build();

        testTrip = Trip.builder()
                .id(101L)
                .route(testRoute)
                .busCompany(testCompany)
                .departureTime(LocalDateTime.now().plusDays(1).withHour(7).withMinute(0))
                .arrivalTime(LocalDateTime.now().plusDays(1).withHour(13).withMinute(30))
                .busType(BusType.LIMOUSINE)
                .price(BigDecimal.valueOf(350000))
                .totalSeats(34)
                .availableSeats(28)
                .status(TripStatus.SCHEDULED)
                .build();
    }

    @Test
    @DisplayName("getSchedule trả về thông tin đầy đủ gồm cự ly, thời gian, chuyến đi và chuyến về")
    void getSchedule_Success_WithRealTrips() {
        when(routeRepository.findDistinctDepartureLocations()).thenReturn(List.of("TP. Hồ Chí Minh", "Hà Nội"));
        when(routeRepository.findDistinctArrivalLocations()).thenReturn(List.of("Đà Lạt", "Sa Pa"));
        when(routeRepository.findByDepartureLocationAndArrivalLocation("TP. Hồ Chí Minh", "Đà Lạt"))
                .thenReturn(Optional.of(testRoute));

        when(tripRepository.searchTrips(eq("TP. Hồ Chí Minh"), eq("Đà Lạt"), isNull(), isNull(), eq(TripStatus.SCHEDULED)))
                .thenReturn(List.of(testTrip));

        PickupDropoffPoint pickupPoint = PickupDropoffPoint.builder()
                .id(1L)
                .route(testRoute)
                .name("Bến xe Miền Tây")
                .address("TP.HCM")
                .pointType(PointType.PICKUP)
                .displayOrder(1)
                .build();

        PickupDropoffPoint dropoffPoint = PickupDropoffPoint.builder()
                .id(2L)
                .route(testRoute)
                .name("Bến xe Liên tỉnh Đà Lạt")
                .address("Đà Lạt")
                .pointType(PointType.DROPOFF)
                .displayOrder(1)
                .build();

        when(pointRepository.findByRouteIdOrderByDisplayOrderAsc(1L))
                .thenReturn(List.of(pickupPoint, dropoffPoint));

        RouteScheduleResponse response = tripService.getSchedule("TP. Hồ Chí Minh", "Đà Lạt");

        assertNotNull(response);
        assertEquals("TP. Hồ Chí Minh", response.getOriginCity());
        assertEquals("Đà Lạt", response.getDestinationCity());
        assertEquals(BigDecimal.valueOf(305.0), response.getDistanceKm());
        assertEquals(BigDecimal.valueOf(6.5), response.getDurationHours());
        assertEquals(1, response.getTotalTrips());
        assertEquals(1, response.getOutboundTrips().size());
        assertEquals("07:00", response.getOutboundTrips().get(0).getDepartureTimeFormatted());
        assertEquals("Bến xe Miền Tây", response.getOutboundTrips().get(0).getMainPickupPoint());
        assertEquals(1, response.getPickupPoints().size());
        assertEquals(1, response.getDropoffPoints().size());
    }

    @Test
    @DisplayName("getSchedule tự động tạo lịch trình giờ chuẩn nếu tuyến chưa có chuyến trong CSDL")
    void getSchedule_SyntheticFallback_WhenNoTrips() {
        when(routeRepository.findDistinctDepartureLocations()).thenReturn(List.of("Hà Nội"));
        when(routeRepository.findDistinctArrivalLocations()).thenReturn(List.of("Hải Phòng"));
        when(routeRepository.findByDepartureLocationAndArrivalLocation("Hà Nội", "Hải Phòng"))
                .thenReturn(Optional.empty());

        when(tripRepository.searchTrips(eq("Hà Nội"), eq("Hải Phòng"), isNull(), isNull(), eq(TripStatus.SCHEDULED)))
                .thenReturn(List.of());

        RouteScheduleResponse response = tripService.getSchedule("Hà Nội", "Hải Phòng");

        assertNotNull(response);
        assertEquals("Hà Nội", response.getOriginCity());
        assertEquals("Hải Phòng", response.getDestinationCity());
        assertFalse(response.getOutboundTrips().isEmpty(), "Phải tự tạo lịch chạy định kỳ tiêu chuẩn");
        assertFalse(response.getInboundTrips().isEmpty(), "Phải tự tạo lịch chạy chiều về tiêu chuẩn");
    }

    @Test
    @DisplayName("getAllRouteOptions trả về danh sách các tuyến đường sắp xếp đúng")
    void getAllRouteOptions_Success() {
        when(routeRepository.findAllByOrderByDepartureLocationAscArrivalLocationAsc())
                .thenReturn(List.of(testRoute));

        List<RouteOptionResponse> options = tripService.getAllRouteOptions();

        assertNotNull(options);
        assertEquals(1, options.size());
        assertEquals("TP. Hồ Chí Minh", options.get(0).getDepartureLocation());
        assertEquals("Đà Lạt", options.get(0).getArrivalLocation());
    }
}

