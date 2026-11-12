package com.traveleasy.controller.company;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.common.exception.GlobalExceptionHandler;
import com.traveleasy.common.security.CompanySecurityService;
import com.traveleasy.dto.company.expense.CompanyExpenseSummaryResponse;
import com.traveleasy.dto.company.expense.SaveTripExpenseRequest;
import com.traveleasy.dto.company.expense.TripProfitLossResponse;
import com.traveleasy.entity.StaffRole;
import com.traveleasy.entity.User;
import com.traveleasy.service.company.TripExpenseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@DisplayName("Kiểm thử Controller Quản lý Chi Phí & Báo Cáo Lãi Lỗ Chuyến Xe (S318)")
class CompanyTripExpenseControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TripExpenseService tripExpenseService;

    @Mock
    private CompanySecurityService securityService;

    @InjectMocks
    private CompanyTripExpenseController companyTripExpenseController;

    private ObjectMapper objectMapper;
    private User mockOwner;
    private Authentication mockAuth;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(companyTripExpenseController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        mockOwner = User.builder()
                .id(10L)
                .busCompanyId(1L)
                .build();
        mockAuth = mock(Authentication.class);
        lenient().when(mockAuth.isAuthenticated()).thenReturn(true);
        lenient().when(securityService.requireStaffRole(mockAuth, StaffRole.OWNER)).thenReturn(mockOwner);
    }

    @Test
    @DisplayName("GET /api/v1/company/expenses trả về tổng hợp chi phí toàn đội xe thành công")
    void getCompanyExpenseSummary_Success() throws Exception {
        TripProfitLossResponse trip1 = TripProfitLossResponse.builder()
                .tripId(101L)
                .tripCode("TRIP-101")
                .routeName("Hà Nội - Hải Phòng")
                .actualRevenue(new BigDecimal("3500000.00"))
                .totalExpense(new BigDecimal("2200000.00"))
                .netProfit(new BigDecimal("1300000.00"))
                .profitMarginPercent(37.14)
                .isLoss(false)
                .lossAmount(BigDecimal.ZERO)
                .build();

        CompanyExpenseSummaryResponse summary = CompanyExpenseSummaryResponse.builder()
                .trips(List.of(trip1))
                .totalRevenue(new BigDecimal("3500000.00"))
                .totalExpense(new BigDecimal("2200000.00"))
                .totalNetProfit(new BigDecimal("1300000.00"))
                .overallMarginPercent(37.14)
                .lossTripsCount(0)
                .build();

        when(tripExpenseService.getCompanyExpenseSummary(eq(1L))).thenReturn(summary);

        mockMvc.perform(get("/api/v1/company/expenses")
                        .principal(mockAuth)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalRevenue").value(3500000.00))
                .andExpect(jsonPath("$.data.totalExpense").value(2200000.00))
                .andExpect(jsonPath("$.data.totalNetProfit").value(1300000.00))
                .andExpect(jsonPath("$.data.lossTripsCount").value(0))
                .andExpect(jsonPath("$.data.trips[0].tripCode").value("TRIP-101"));

        verify(tripExpenseService, times(1)).getCompanyExpenseSummary(1L);
    }

    @Test
    @DisplayName("GET /api/v1/company/expenses/trips/{tripId} trả về chi tiết lãi lỗ chuyến xe thành công")
    void getTripProfitLoss_Success() throws Exception {
        TripProfitLossResponse response = TripProfitLossResponse.builder()
                .tripId(101L)
                .tripCode("TRIP-101")
                .routeName("Hà Nội - Hải Phòng")
                .departureTime(LocalDateTime.now().minusHours(2))
                .arrivalTime(LocalDateTime.now())
                .licensePlate("29B-123.45")
                .actualRevenue(new BigDecimal("3000000.00"))
                .fuelCost(new BigDecimal("1000000.00"))
                .tollBotCost(new BigDecimal("300000.00"))
                .driverSalary(new BigDecimal("600000.00"))
                .terminalFee(new BigDecimal("100000.00"))
                .otherCosts(new BigDecimal("50000.00"))
                .totalExpense(new BigDecimal("2050000.00"))
                .netProfit(new BigDecimal("950000.00"))
                .profitMarginPercent(31.67)
                .isLoss(false)
                .lossAmount(BigDecimal.ZERO)
                .invoiceNumber("VAT-88991")
                .isLocked(false)
                .build();

        when(tripExpenseService.getTripProfitLoss(eq(101L), eq(1L))).thenReturn(response);

        mockMvc.perform(get("/api/v1/company/expenses/trips/101")
                        .principal(mockAuth)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.tripId").value(101))
                .andExpect(jsonPath("$.data.actualRevenue").value(3000000.00))
                .andExpect(jsonPath("$.data.totalExpense").value(2050000.00))
                .andExpect(jsonPath("$.data.netProfit").value(950000.00))
                .andExpect(jsonPath("$.data.invoiceNumber").value("VAT-88991"));

        verify(tripExpenseService, times(1)).getTripProfitLoss(101L, 1L);
    }

    @Test
    @DisplayName("POST /api/v1/company/expenses/trips/{tripId} lưu chi phí thành công")
    void saveTripExpense_Success() throws Exception {
        SaveTripExpenseRequest request = SaveTripExpenseRequest.builder()
                .fuelCost(new BigDecimal("1200000.00"))
                .tollBotCost(new BigDecimal("250000.00"))
                .driverSalary(new BigDecimal("500000.00"))
                .terminalFee(new BigDecimal("100000.00"))
                .otherCosts(new BigDecimal("50000.00"))
                .invoiceNumber("VAT-HN-2026")
                .notes("Đầy đủ hóa đơn VAT")
                .build();

        TripProfitLossResponse savedResponse = TripProfitLossResponse.builder()
                .tripId(101L)
                .actualRevenue(new BigDecimal("3000000.00"))
                .fuelCost(new BigDecimal("1200000.00"))
                .tollBotCost(new BigDecimal("250000.00"))
                .driverSalary(new BigDecimal("500000.00"))
                .terminalFee(new BigDecimal("100000.00"))
                .otherCosts(new BigDecimal("50000.00"))
                .totalExpense(new BigDecimal("2100000.00"))
                .netProfit(new BigDecimal("900000.00"))
                .isLoss(false)
                .invoiceNumber("VAT-HN-2026")
                .build();

        when(tripExpenseService.saveTripExpense(eq(101L), eq(1L), any(SaveTripExpenseRequest.class)))
                .thenReturn(savedResponse);

        mockMvc.perform(post("/api/v1/company/expenses/trips/101")
                        .principal(mockAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalExpense").value(2100000.00))
                .andExpect(jsonPath("$.data.invoiceNumber").value("VAT-HN-2026"));

        verify(tripExpenseService, times(1)).saveTripExpense(eq(101L), eq(1L), any(SaveTripExpenseRequest.class));
    }

    @Test
    @DisplayName("POST /api/v1/company/expenses/trips/{tripId} chặn số tiền chi phí âm (Validation Error 400)")
    void saveTripExpense_Validation_NegativeAmount() throws Exception {
        SaveTripExpenseRequest request = SaveTripExpenseRequest.builder()
                .fuelCost(new BigDecimal("-100000.00")) // Số âm không hợp lệ
                .tollBotCost(BigDecimal.ZERO)
                .driverSalary(BigDecimal.ZERO)
                .terminalFee(BigDecimal.ZERO)
                .otherCosts(BigDecimal.ZERO)
                .build();

        mockMvc.perform(post("/api/v1/company/expenses/trips/101")
                        .principal(mockAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        verify(tripExpenseService, never()).saveTripExpense(any(), any(), any());
    }

    @Test
    @DisplayName("Chặn người dùng khi chưa đăng nhập (401 Unauthorized)")
    void requireLogin_Unauthorized_WhenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/company/expenses")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("BẠN CẦN ĐĂNG NHẬP")));
    }

    @Test
    @DisplayName("Chặn khi tài khoản không gắn với nhà xe nào (403 Forbidden)")
    void requireBusCompany_Forbidden_WhenUserHasNoCompanyId() throws Exception {
        Authentication authNoCompany = mock(Authentication.class);
        when(authNoCompany.isAuthenticated()).thenReturn(true);
        User userWithoutCompany = User.builder().id(20L).busCompanyId(null).build();
        when(securityService.requireStaffRole(authNoCompany, StaffRole.OWNER)).thenReturn(userWithoutCompany);

        mockMvc.perform(get("/api/v1/company/expenses")
                        .principal(authNoCompany)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("chưa được liên kết với nhà xe")));
    }

    @Test
    @DisplayName("Chặn người dùng khi không có quyền OWNER (403 Forbidden)")
    void requireOwnerRole_Forbidden_WhenNotOwner() throws Exception {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);

        when(securityService.requireStaffRole(any(), eq(StaffRole.OWNER)))
                .thenThrow(new AppException(ErrorCode.FORBIDDEN, "TRUY CẬP BỊ TỪ CHỐI (403 Forbidden): Yêu cầu quyền OWNER!"));

        mockMvc.perform(get("/api/v1/company/expenses")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("TRUY CẬP BỊ TỪ CHỐI")));
    }
}
