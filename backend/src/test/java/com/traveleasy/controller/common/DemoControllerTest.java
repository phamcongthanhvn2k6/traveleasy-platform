package com.traveleasy.controller.common;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DemoControllerTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TripSeatRepository tripSeatRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BusCompanyRepository busCompanyRepository;

    @Mock
    private RouteRepository routeRepository;

    @InjectMocks
    private DemoController demoController;

    private Trip sampleTrip;
    private List<TripSeat> sampleSeats;

    @BeforeEach
    void setUp() {
        Route route = Route.builder()
                .id(1L)
                .departureLocation("Hà Nội")
                .arrivalLocation("Đà Nẵng")
                .build();

        BusCompany company = BusCompany.builder()
                .id(1L)
                .name("Phương Trang VIP")
                .build();

        sampleTrip = Trip.builder()
                .id(101L)
                .route(route)
                .busCompany(company)
                .licensePlate("29B-12345")
                .departureTime(LocalDateTime.of(2026, 11, 10, 18, 30))
                .arrivalTime(LocalDateTime.of(2026, 11, 11, 8, 30))
                .busType(BusType.LIMOUSINE)
                .totalSeats(34)
                .availableSeats(32)
                .price(BigDecimal.valueOf(450000))
                .status(TripStatus.SCHEDULED)
                .isActive(true)
                .build();

        sampleSeats = new ArrayList<>();
        for (int i = 1; i <= 34; i++) {
            sampleSeats.add(TripSeat.builder()
                    .id((long) i)
                    .trip(sampleTrip)
                    .seatCode(String.format("A%02d", i))
                    .floor(1)
                    .status(i <= 32 ? SeatStatus.AVAILABLE : SeatStatus.BOOKED)
                    .build());
        }
    }

    @Test
    @DisplayName("GET /api/v1/demo/trips trả về danh sách chuyến xe với đầy đủ thông tin kiểm thử")
    void getDemoTrips_Success() {
        when(tripRepository.findAllByOrderByDepartureTimeDesc()).thenReturn(List.of(sampleTrip));

        ResponseEntity<ApiResponse<List<Map<String, Object>>>> response = demoController.getDemoTrips(20);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());

        List<Map<String, Object>> trips = response.getBody().getData();
        assertEquals(1, trips.size());
        Map<String, Object> tripMap = trips.get(0);
        assertEquals(101L, tripMap.get("id"));
        assertEquals("Hà Nội - Đà Nẵng", tripMap.get("route"));
        assertEquals("Phương Trang VIP", tripMap.get("busCompany"));
        assertEquals("29B-12345", tripMap.get("licensePlate"));
        assertEquals(34, tripMap.get("totalSeats"));
        assertEquals(32, tripMap.get("availableSeats"));
        assertEquals(BigDecimal.valueOf(450000), tripMap.get("price"));
    }

    @Test
    @DisplayName("POST /api/v1/demo/trips/{tripId}/set-sold-out cập nhật 0 ghế trống và toàn bộ ghế sang BOOKED")
    void setSoldOut_Success() {
        when(tripRepository.findByIdWithDetails(101L)).thenReturn(Optional.of(sampleTrip));
        when(tripSeatRepository.findByTripIdOrderByFloorAscSeatCodeAsc(101L)).thenReturn(sampleSeats);

        ResponseEntity<ApiResponse<Map<String, Object>>> response = demoController.setSoldOut(101L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(0, sampleTrip.getAvailableSeats());
        verify(tripRepository).save(sampleTrip);
        verify(tripSeatRepository).saveAll(sampleSeats);

        boolean allBooked = sampleSeats.stream().allMatch(s -> s.getStatus() == SeatStatus.BOOKED);
        assertTrue(allBooked);
    }

    @Test
    @DisplayName("POST /api/v1/demo/trips/{tripId}/set-sold-out trả về 404 khi không tìm thấy chuyến")
    void setSoldOut_NotFound() {
        when(tripRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());
        when(tripRepository.findById(999L)).thenReturn(Optional.empty());

        ResponseEntity<ApiResponse<Map<String, Object>>> response = demoController.setSoldOut(999L);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @DisplayName("POST /api/v1/demo/trips/{tripId}/reset-seats mở lại toàn bộ ghế AVAILABLE và availableSeats = totalSeats")
    void resetTripSeats_Success() {
        when(tripRepository.findByIdWithDetails(101L)).thenReturn(Optional.of(sampleTrip));
        when(tripSeatRepository.findByTripIdOrderByFloorAscSeatCodeAsc(101L)).thenReturn(sampleSeats);

        ResponseEntity<ApiResponse<Map<String, Object>>> response = demoController.resetTripSeats(101L);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(34, sampleTrip.getAvailableSeats());
        verify(tripRepository).save(sampleTrip);

        boolean allAvailable = sampleSeats.stream().allMatch(s -> s.getStatus() == SeatStatus.AVAILABLE);
        assertTrue(allAvailable);
    }

    @Test
    @DisplayName("POST /api/v1/demo/trips/{tripId}/set-seats?count=1 đặt chính xác 1 ghế AVAILABLE còn lại BOOKED")
    void setSeatCount_Success_OneSeat() {
        when(tripRepository.findByIdWithDetails(101L)).thenReturn(Optional.of(sampleTrip));
        when(tripSeatRepository.findByTripIdOrderByFloorAscSeatCodeAsc(101L)).thenReturn(sampleSeats);

        ResponseEntity<ApiResponse<Map<String, Object>>> response = demoController.setSeatCount(101L, 1);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, sampleTrip.getAvailableSeats());

        long availableCount = sampleSeats.stream().filter(s -> s.getStatus() == SeatStatus.AVAILABLE).count();
        long bookedCount = sampleSeats.stream().filter(s -> s.getStatus() == SeatStatus.BOOKED).count();
        assertEquals(1, availableCount);
        assertEquals(33, bookedCount);
    }

    @Test
    @DisplayName("POST /api/v1/demo/trips/{tripId}/set-seats trả về 400 Bad Request khi count < 0")
    void setSeatCount_NegativeCount_BadRequest() {
        ResponseEntity<ApiResponse<Map<String, Object>>> response = demoController.setSeatCount(101L, -1);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("POST /api/v1/demo/trips/{tripId}/set-seats giới hạn tối đa totalSeats khi count lớn hơn totalSeats")
    void setSeatCount_ClampedToTotalSeats() {
        when(tripRepository.findByIdWithDetails(101L)).thenReturn(Optional.of(sampleTrip));
        when(tripSeatRepository.findByTripIdOrderByFloorAscSeatCodeAsc(101L)).thenReturn(sampleSeats);

        ResponseEntity<ApiResponse<Map<String, Object>>> response = demoController.setSeatCount(101L, 100);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(34, sampleTrip.getAvailableSeats());
    }
}
