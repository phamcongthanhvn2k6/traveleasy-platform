package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.common.security.CompanySecurityService;
import com.traveleasy.dto.company.exchange.TicketExchangeRequest;
import com.traveleasy.dto.company.exchange.TicketExchangeResponse;
import com.traveleasy.dto.company.exchange.TicketLookupResponse;
import com.traveleasy.entity.Role;
import com.traveleasy.entity.StaffRole;
import com.traveleasy.entity.User;
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
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyTicketExchangeControllerTest {

    @Mock
    private TicketExchangeService ticketExchangeService;

    @Mock
    private CompanySecurityService securityService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private CompanyTicketExchangeController controller;

    private User cashierUser;

    @BeforeEach
    void setUp() {
        cashierUser = User.builder()
                .id(10L)
                .email("cashier@futa.vn")
                .role(Role.OPERATOR)
                .staffRole(StaffRole.CASHIER)
                .busCompanyId(1L)
                .build();
    }

    @Test
    @DisplayName("API GET /lookup: Tra cứu thông tin vé gốc thành công khi có quyền CASHIER")
    void testLookupTicket_Success() {
        TicketLookupResponse mockResponse = TicketLookupResponse.builder()
                .ticketId(1001L)
                .ticketCode("TK-20261111-01")
                .bookingCode("BK-001")
                .status("ISSUED")
                .customerName("Nguyễn Văn Du Khách")
                .price(BigDecimal.valueOf(300000))
                .canExchange(true)
                .hoursUntilDeparture(24)
                .policyNotice("Đủ điều kiện đổi vé.")
                .build();

        when(authentication.isAuthenticated()).thenReturn(true);
        when(securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER))
                .thenReturn(cashierUser);
        when(ticketExchangeService.lookupTicket("TK-20261111-01", 1L)).thenReturn(mockResponse);

        ApiResponse<TicketLookupResponse> response = controller.lookupTicket("TK-20261111-01", authentication);

        assertTrue(response.isSuccess());
        assertEquals("TK-20261111-01", response.getData().getTicketCode());
        assertTrue(response.getData().isCanExchange());
        verify(securityService).requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER);
        verify(ticketExchangeService, times(1)).lookupTicket("TK-20261111-01", 1L);
    }

    @Test
    @DisplayName("API POST /calculate-difference: Tính toán chênh lệch giá thành công")
    void testCalculateDifference_Success() {
        Map<String, Object> mockResult = Map.of(
                "oldTicketCode", "TK-01",
                "newTripId", 102L,
                "priceDifference", BigDecimal.valueOf(80000),
                "surchargeAmount", BigDecimal.valueOf(80000),
                "refundAmount", BigDecimal.ZERO,
                "requiresSurcharge", true
        );

        when(authentication.isAuthenticated()).thenReturn(true);
        when(securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER))
                .thenReturn(cashierUser);
        when(ticketExchangeService.calculateDifference("TK-01", 102L, 1L)).thenReturn(mockResult);

        ApiResponse<Map<String, Object>> response = controller.calculateDifference("TK-01", 102L, authentication);

        assertTrue(response.isSuccess());
        assertEquals(BigDecimal.valueOf(80000), response.getData().get("priceDifference"));
        verify(securityService).requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER);
        verify(ticketExchangeService, times(1)).calculateDifference("TK-01", 102L, 1L);
    }

    @Test
    @DisplayName("API POST /: Thực hiện đổi vé thành công với quyền OWNER hoặc CASHIER")
    void testExchangeTicket_Success() {
        TicketExchangeRequest request = TicketExchangeRequest.builder()
                .oldTicketCode("TK-01")
                .newTripId(102L)
                .newSeatNumber("B02")
                .note("Đổi vé tại quầy")
                .build();

        TicketExchangeResponse mockResponse = TicketExchangeResponse.builder()
                .exchangeId(999L)
                .status("SUCCESS")
                .oldTicketCode("TK-01")
                .newTicketCode("TK-EX-1234567")
                .newSeatCode("B02")
                .newTripId(102L)
                .build();

        when(securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER))
                .thenReturn(cashierUser);
        when(ticketExchangeService.exchangeTicket(request, cashierUser)).thenReturn(mockResponse);

        ApiResponse<TicketExchangeResponse> response = controller.exchangeTicket(request, authentication);

        assertTrue(response.isSuccess());
        assertEquals("SUCCESS", response.getData().getStatus());
        assertEquals("TK-EX-1234567", response.getData().getNewTicketCode());
        verify(securityService).requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER);
        verify(ticketExchangeService, times(1)).exchangeTicket(request, cashierUser);
    }

    @Test
    @DisplayName("API POST /: Bị từ chối (403 FORBIDDEN) khi tài khoản DISPATCHER cố gọi API đổi vé")
    void testExchangeTicket_Forbidden_ForDispatcher() {
        TicketExchangeRequest request = TicketExchangeRequest.builder()
                .oldTicketCode("TK-01")
                .newTripId(102L)
                .newSeatNumber("B02")
                .build();

        when(securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER))
                .thenThrow(new AppException(ErrorCode.FORBIDDEN, "TRUY CẬP BỊ TỪ CHỐI"));

        AppException ex = assertThrows(AppException.class, () -> controller.exchangeTicket(request, authentication));
        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
        verify(ticketExchangeService, never()).exchangeTicket(any(), any());
    }
}
