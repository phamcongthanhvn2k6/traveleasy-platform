package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.company.exchange.TicketExchangeRequest;
import com.traveleasy.dto.company.exchange.TicketExchangeResponse;
import com.traveleasy.dto.company.exchange.TicketLookupResponse;
import com.traveleasy.entity.Role;
import com.traveleasy.entity.User;
import com.traveleasy.repository.UserRepository;
import com.traveleasy.service.company.TicketExchangeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyTicketExchangeControllerTest {

    @Mock
    private TicketExchangeService ticketExchangeService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private CompanyTicketExchangeController controller;

    private User operatorUser;

    @BeforeEach
    void setUp() {
        operatorUser = User.builder()
                .id(10L)
                .email("operator@futa.vn")
                .role(Role.OPERATOR)
                .busCompanyId(1L)
                .build();
    }

    @Test
    @DisplayName("API GET /lookup: Tra cuu thong tin ve goc thanh cong")
    void testLookupTicket_Success() {
        TicketLookupResponse mockResponse = TicketLookupResponse.builder()
                .ticketId(1001L)
                .ticketCode("TK-20261111-01")
                .bookingCode("BK-001")
                .status("ISSUED")
                .customerName("Nguyen Van Du Khach")
                .price(BigDecimal.valueOf(300000))
                .canExchange(true)
                .hoursUntilDeparture(24)
                .policyNotice("Du dieu kien doi ve.")
                .build();

        when(ticketExchangeService.lookupTicket("TK-20261111-01")).thenReturn(mockResponse);

        ApiResponse<TicketLookupResponse> response = controller.lookupTicket("TK-20261111-01");

        assertTrue(response.isSuccess());
        assertEquals("TK-20261111-01", response.getData().getTicketCode());
        assertTrue(response.getData().isCanExchange());
        verify(ticketExchangeService, times(1)).lookupTicket("TK-20261111-01");
    }

    @Test
    @DisplayName("API POST /calculate-difference: Tinh toan chenh lech gia thanh cong")
    void testCalculateDifference_Success() {
        Map<String, Object> mockResult = Map.of(
                "oldTicketCode", "TK-01",
                "newTripId", 102L,
                "priceDifference", BigDecimal.valueOf(80000),
                "surchargeAmount", BigDecimal.valueOf(80000),
                "refundAmount", BigDecimal.ZERO,
                "requiresSurcharge", true
        );

        when(ticketExchangeService.calculateDifference("TK-01", 102L)).thenReturn(mockResult);

        ApiResponse<Map<String, Object>> response = controller.calculateDifference("TK-01", 102L);

        assertTrue(response.isSuccess());
        assertEquals(BigDecimal.valueOf(80000), response.getData().get("priceDifference"));
        verify(ticketExchangeService, times(1)).calculateDifference("TK-01", 102L);
    }

    @Test
    @DisplayName("API POST /: Thuc thi doi ve chinh thuc (DoD 1, DoD 2, DoD 3)")
    void testExchangeTicket_Success() {
        TicketExchangeRequest request = TicketExchangeRequest.builder()
                .oldTicketCode("TK-01")
                .newTripId(102L)
                .newSeatNumber("B02")
                .note("Doi gio chay")
                .build();

        TicketExchangeResponse mockResponse = TicketExchangeResponse.builder()
                .exchangeId(777L)
                .status("SUCCESS")
                .oldTicketCode("TK-01")
                .oldTicketStatus("EXCHANGED")
                .newTicketCode("TK-EX-999")
                .newSeatCode("B02")
                .newTripId(102L)
                .priceDifference(BigDecimal.valueOf(80000))
                .surchargeAmount(BigDecimal.valueOf(80000))
                .refundAmount(BigDecimal.ZERO)
                .exchangeTime(LocalDateTime.now())
                .build();

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("operator@futa.vn");
        when(userRepository.findByEmail("operator@futa.vn")).thenReturn(Optional.of(operatorUser));
        when(ticketExchangeService.exchangeTicket(any(TicketExchangeRequest.class), eq(operatorUser))).thenReturn(mockResponse);

        ApiResponse<TicketExchangeResponse> response = controller.exchangeTicket(request, authentication);

        assertTrue(response.isSuccess());
        assertEquals("SUCCESS", response.getData().getStatus());
        assertEquals("EXCHANGED", response.getData().getOldTicketStatus());
        assertEquals("TK-EX-999", response.getData().getNewTicketCode());
        verify(ticketExchangeService, times(1)).exchangeTicket(any(TicketExchangeRequest.class), eq(operatorUser));
    }

    @Test
    @DisplayName("API POST /confirm: Thuc thi doi ve qua endpoint alias tuong thich")
    void testConfirmExchange_Success() {
        Map<String, Object> body = Map.of(
                "oldTicketCode", "TK-01",
                "newTripId", 102L,
                "newSeatCode", "B02",
                "note", "Doi gio tai quay"
        );

        TicketExchangeResponse mockResponse = TicketExchangeResponse.builder()
                .exchangeId(777L)
                .status("SUCCESS")
                .oldTicketCode("TK-01")
                .oldTicketStatus("EXCHANGED")
                .newTicketCode("TK-EX-999")
                .build();

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("operator@futa.vn");
        when(userRepository.findByEmail("operator@futa.vn")).thenReturn(Optional.of(operatorUser));
        when(ticketExchangeService.exchangeTicket(any(TicketExchangeRequest.class), eq(operatorUser))).thenReturn(mockResponse);

        ApiResponse<TicketExchangeResponse> response = controller.confirmExchange(body, authentication);

        assertTrue(response.isSuccess());
        assertEquals("SUCCESS", response.getData().getStatus());
        assertEquals("TK-EX-999", response.getData().getNewTicketCode());
    }
}
