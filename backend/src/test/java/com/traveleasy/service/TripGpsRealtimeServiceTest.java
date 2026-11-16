package com.traveleasy.service;

import com.traveleasy.dto.tracking.TripGpsLocationDto;
import com.traveleasy.dto.tracking.UpdateTripGpsRequest;
import com.traveleasy.entity.*;
import com.traveleasy.repository.TripCrewRepository;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.service.realtime.TripGpsRealtimeService;
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
class TripGpsRealtimeServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TripCrewRepository tripCrewRepository;

    @InjectMocks
    private TripGpsRealtimeService tripGpsRealtimeService;

    private Trip testTrip;
    private Route testRoute;
    private BusCompany testCompany;
    private TripCrew testCrew;

    @BeforeEach
    void setUp() {
        testCompany = BusCompany.builder()
                .id(1L)
                .name("TravelEasy Express")
                .build();

        testRoute = Route.builder()
                .id(25L)
                .departureLocation("TP. Hồ Chí Minh")
                .arrivalLocation("Đà Lạt")
                .distanceKm(BigDecimal.valueOf(305.0))
                .durationHours(BigDecimal.valueOf(6.5))
                .build();

        testTrip = Trip.builder()
                .id(101L)
                .route(testRoute)
                .busCompany(testCompany)
                .departureTime(LocalDateTime.now().plusHours(2))
                .arrivalTime(LocalDateTime.now().plusHours(8))
                .busType(BusType.LIMOUSINE)
                .licensePlate("51B-888.88")
                .status(TripStatus.SCHEDULED)
                .build();

        testCrew = TripCrew.builder()
                .id(1L)
                .trip(testTrip)
                .busCompany(testCompany)
                .primaryDriverName("Trần Văn Tài")
                .primaryDriverPhone("0988777666")
                .primaryDriverLicense("GPLX E (123456789)")
                .alcoholTested(true)
                .build();
    }

    @Test
    @DisplayName("getCurrentLocation lấy thông tin tổ lái thực tế từ TripCrew khi đã phân công")
    void testGetCurrentLocation_WithAssignedCrew() {
        when(tripRepository.findByIdWithDetails(101L)).thenReturn(Optional.of(testTrip));
        when(tripCrewRepository.findByTripId(101L)).thenReturn(Optional.of(testCrew));

        TripGpsLocationDto location = tripGpsRealtimeService.getCurrentLocation(101L);

        assertNotNull(location);
        assertEquals(101L, location.getTripId());
        assertEquals("51B-888.88", location.getLicensePlate());
        assertEquals("Trần Văn Tài", location.getDriverName());
        assertEquals("0988777666", location.getDriverPhone());
        assertEquals("GPLX E (123456789)", location.getDriverLicense());
        assertTrue(location.getAlcoholTested());
        assertEquals("TP. Hồ Chí Minh", location.getOriginCity());
        assertEquals("Đà Lạt", location.getDestinationCity());
    }

    @Test
    @DisplayName("advanceSimulationStep mô phỏng di chuyển mượt mà trên cao tốc")
    void testAdvanceSimulationStep() {
        when(tripRepository.findByIdWithDetails(101L)).thenReturn(Optional.of(testTrip));
        when(tripCrewRepository.findByTripId(101L)).thenReturn(Optional.empty());

        TripGpsLocationDto step1 = tripGpsRealtimeService.advanceSimulationStep(101L);
        assertNotNull(step1);
        assertTrue(step1.getProgressPercent() > 0);
        assertTrue(step1.getSpeed() > 50.0);
        double initialLat = step1.getLatitude();

        TripGpsLocationDto step2 = tripGpsRealtimeService.advanceSimulationStep(101L);
        assertNotNull(step2);
        assertNotEquals(initialLat, step2.getLatitude());
    }

    @Test
    @DisplayName("updateDriverLocation cập nhật trực tiếp tọa độ GPS từ điện thoại tài xế")
    void testUpdateDriverLocation() {
        when(tripRepository.findByIdWithDetails(101L)).thenReturn(Optional.of(testTrip));
        when(tripCrewRepository.findByTripId(101L)).thenReturn(Optional.empty());

        UpdateTripGpsRequest request = UpdateTripGpsRequest.builder()
                .latitude(10.9500)
                .longitude(107.1200)
                .speed(72.5)
                .heading(60.0)
                .locationName("Qua Trạm thu phí Long Phước")
                .driverName("Trần Văn Tài")
                .driverPhone("0988777666")
                .build();

        TripGpsLocationDto updated = tripGpsRealtimeService.updateDriverLocation(101L, request);

        assertNotNull(updated);
        assertEquals(10.9500, updated.getLatitude());
        assertEquals(107.1200, updated.getLongitude());
        assertEquals(72.5, updated.getSpeed());
        assertEquals(60.0, updated.getHeading());
        assertEquals("Qua Trạm thu phí Long Phước", updated.getCurrentLocationName());
        assertEquals("Trần Văn Tài", updated.getDriverName());
    }

    @Test
    @DisplayName("getFleetSnapshot lọc bỏ các chuyến đã hủy CANCELLED")
    void testGetFleetSnapshot() {
        Trip cancelledTrip = Trip.builder()
                .id(999L)
                .status(TripStatus.CANCELLED)
                .build();

        when(tripRepository.findAllByOrderByDepartureTimeDesc()).thenReturn(List.of(testTrip, cancelledTrip));
        when(tripRepository.findByIdWithDetails(101L)).thenReturn(Optional.of(testTrip));
        when(tripCrewRepository.findByTripId(101L)).thenReturn(Optional.empty());

        List<TripGpsLocationDto> fleet = tripGpsRealtimeService.getFleetSnapshot();

        assertEquals(1, fleet.size());
        assertEquals(101L, fleet.get(0).getTripId());
    }
}
