package com.traveleasy.controller.conductor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.traveleasy.entity.*;
import com.traveleasy.repository.TicketRepository;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.repository.TripSeatRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ConductorScannerControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TripSeatRepository tripSeatRepository;

    @InjectMocks
    private ConductorScannerController conductorScannerController;

    private Trip sampleTrip;
    private Booking sampleBooking;
    private Ticket sampleTicket;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(conductorScannerController).build();

        Route route = Route.builder()
                .departureLocation("TP. Hồ Chí Minh")
                .arrivalLocation("Đà Lạt")
                .build();

        sampleTrip = Trip.builder()
                .id(696L)
                .route(route)
                .licensePlate("51B-888.88")
                .departureTime(LocalDateTime.now().plusHours(2))
                .build();

        sampleBooking = Booking.builder()
                .id(10L)
                .trip(sampleTrip)
                .passengerName("Nguyễn Văn An")
                .passengerPhone("0901234567")
                .build();

        sampleTicket = Ticket.builder()
                .id(100L)
                .booking(sampleBooking)
                .ticketCode("TK-696-A01")
                .qrCodeHash("HASH-696-A01")
                .seatNumber("A01")
                .price(new BigDecimal("350000"))
                .status(TicketStatus.ISSUED)
                .build();
    }

    @Test
    @DisplayName("DoD 1: Quét vé hợp lệ -> trả về GREEN và cập nhật checkInStatus = 'CHECKED_IN'")
    void validateTicket_ValidTicket_ReturnsGreenAndCheckedIn() throws Exception {
        when(ticketRepository.findByCodeOrQrHashForUpdate("TK-696-A01")).thenReturn(Optional.of(sampleTicket));

        mockMvc.perform(post("/api/v1/conductor/scanner/validate")
                        .param("qrCodeOrTicketCode", "TK-696-A01")
                        .param("currentTripId", "696"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.valid").value(true))
                .andExpect(jsonPath("$.data.checkInStatus").value("CHECKED_IN"))
                .andExpect(jsonPath("$.data.validationColor").value("GREEN"))
                .andExpect(jsonPath("$.data.seatNumber").value("A01"))
                .andExpect(jsonPath("$.data.passengerName").value("Nguyễn Văn An"));

        verify(ticketRepository, times(1)).save(sampleTicket);
    }

    @Test
    @DisplayName("DoD 1: Quét vé đã dùng trước đó -> trả về RED và checkInStatus = 'ALREADY_CHECKED_IN'")
    void validateTicket_AlreadyUsed_ReturnsRed() throws Exception {
        sampleTicket.setStatus(TicketStatus.USED);
        when(ticketRepository.findByCodeOrQrHashForUpdate("TK-696-A01")).thenReturn(Optional.of(sampleTicket));

        mockMvc.perform(post("/api/v1/conductor/scanner/validate")
                        .param("qrCodeOrTicketCode", "TK-696-A01")
                        .param("currentTripId", "696"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.valid").value(false))
                .andExpect(jsonPath("$.data.checkInStatus").value("ALREADY_CHECKED_IN"))
                .andExpect(jsonPath("$.data.validationColor").value("RED"))
                .andExpect(jsonPath("$.data.message").value(org.hamcrest.Matchers.containsString("ĐÃ ĐƯỢC SOÁT")));

        verify(ticketRepository, never()).save(sampleTicket);
    }

    @Test
    @DisplayName("DoD 1: Quét vé sai chuyến/sai ngày -> trả về YELLOW và checkInStatus = 'INVALID_TRIP'")
    void validateTicket_WrongTrip_ReturnsYellow() throws Exception {
        when(ticketRepository.findByCodeOrQrHashForUpdate("TK-696-A01")).thenReturn(Optional.of(sampleTicket));

        mockMvc.perform(post("/api/v1/conductor/scanner/validate")
                        .param("qrCodeOrTicketCode", "TK-696-A01")
                        .param("currentTripId", "999")) // Sai chuyến
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.valid").value(false))
                .andExpect(jsonPath("$.data.checkInStatus").value("INVALID_TRIP"))
                .andExpect(jsonPath("$.data.validationColor").value("YELLOW"))
                .andExpect(jsonPath("$.data.message").value(org.hamcrest.Matchers.containsString("không trùng khớp")));

        verify(ticketRepository, never()).save(sampleTicket);
    }

    @Test
    @DisplayName("DoD 3: Tải Trip Manifest kèm danh sách sơ đồ ghế đã lên xe / chưa lên xe để cache offline")
    void getTripManifest_ReturnsSeatListWithCheckInState() throws Exception {
        when(tripRepository.findByIdWithDetails(696L)).thenReturn(Optional.of(sampleTrip));
        when(ticketRepository.findByBookingTripId(696L)).thenReturn(List.of(sampleTicket));

        TripSeat seat1 = TripSeat.builder().seatCode("A01").floor(1).seatType("VIP").build();
        TripSeat seat2 = TripSeat.builder().seatCode("A02").floor(1).seatType("STANDARD").build();
        when(tripSeatRepository.findByTripIdOrderByFloorAscSeatCodeAsc(696L)).thenReturn(List.of(seat1, seat2));

        mockMvc.perform(get("/api/v1/conductor/scanner/trips/696/manifest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.tripId").value(696))
                .andExpect(jsonPath("$.data.totalSeats").value(2))
                .andExpect(jsonPath("$.data.seats[0].seatCode").value("A01"))
                .andExpect(jsonPath("$.data.seats[0].occupied").value(true))
                .andExpect(jsonPath("$.data.seats[0].checkedIn").value(false))
                .andExpect(jsonPath("$.data.seats[1].seatCode").value("A02"))
                .andExpect(jsonPath("$.data.seats[1].occupied").value(false));
    }
}
