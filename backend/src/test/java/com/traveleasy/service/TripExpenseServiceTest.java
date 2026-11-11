package com.traveleasy.service;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.company.expense.CompanyExpenseSummaryResponse;
import com.traveleasy.dto.company.expense.SaveTripExpenseRequest;
import com.traveleasy.dto.company.expense.TripProfitLossResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.BookingRepository;
import com.traveleasy.repository.TripExpenseRepository;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.service.company.TripExpenseService;
import com.traveleasy.service.company.TripExpenseServiceImpl;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Kiểm thử nghiệp vụ Sổ Chi Phí Vận Hành Chuyến & Báo Cáo Lãi Lỗ (S318)")
class TripExpenseServiceTest {

    @Mock
    private TripExpenseRepository tripExpenseRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private TripExpenseServiceImpl tripExpenseService;

    private BusCompany companyA;
    private BusCompany companyB;
    private Route route;
    private Trip tripNormal;
    private Trip tripOverdue;
    private TripExpense expenseExisting;

    @BeforeEach
    void setUp() {
        companyA = BusCompany.builder()
                .id(1L)
                .name("Nhà Xe Phương Trang")
                .code("FUTA")
                .hotline("19006067")
                .build();

        companyB = BusCompany.builder()
                .id(2L)
                .name("Nhà Xe Thành Bưởi")
                .code("THBU")
                .hotline("19006079")
                .build();

        route = Route.builder()
                .id(10L)
                .busCompany(companyA)
                .departureLocation("Hà Nội")
                .arrivalLocation("Hải Phòng")
                .durationHours(new BigDecimal("2.5"))
                .distanceKm(new BigDecimal("120.0"))
                .build();

        tripNormal = Trip.builder()
                .id(100L)
                .busCompany(companyA)
                .route(route)
                .departureTime(LocalDateTime.now().minusHours(4))
                .arrivalTime(LocalDateTime.now().minusHours(1))
                .licensePlate("29B-123.45")
                .price(new BigDecimal("150000.00"))
                .totalSeats(34)
                .availableSeats(10)
                .status(TripStatus.COMPLETED)
                .build();

        tripOverdue = Trip.builder()
                .id(101L)
                .busCompany(companyA)
                .route(route)
                .departureTime(LocalDateTime.now().minusHours(60))
                .arrivalTime(LocalDateTime.now().minusHours(55))
                .licensePlate("29B-999.99")
                .price(new BigDecimal("150000.00"))
                .totalSeats(34)
                .availableSeats(5)
                .status(TripStatus.COMPLETED)
                .build();

        expenseExisting = TripExpense.builder()
                .id(1L)
                .trip(tripNormal)
                .busCompany(companyA)
                .fuelCost(new BigDecimal("1200000.00"))
                .tollBotCost(new BigDecimal("350000.00"))
                .driverSalary(new BigDecimal("600000.00"))
                .terminalFee(new BigDecimal("150000.00"))
                .otherCosts(new BigDecimal("100000.00"))
                .invoiceNumber("HD-2026-00123")
                .notes("Chi phí chuyến sáng bình thường")
                .isLocked(false)
                .build();
    }

    @Test
    @DisplayName("TC-S318-01: Lấy báo cáo lãi lỗ thành công cho chuyến xe có lãi")
    void getTripProfitLoss_Success_Profitable() {
        when(tripRepository.findById(100L)).thenReturn(Optional.of(tripNormal));
        when(tripExpenseRepository.findByTripId(100L)).thenReturn(Optional.of(expenseExisting));
        // Giả sử doanh thu bán vé thực tế là 3,600,000 VND
        when(bookingRepository.sumRevenueByTripId(100L)).thenReturn(new BigDecimal("3600000.00"));

        TripProfitLossResponse response = tripExpenseService.getTripProfitLoss(100L, 1L);

        assertThat(response).isNotNull();
        assertThat(response.getTripId()).isEqualTo(100L);
        assertThat(response.getActualRevenue()).isEqualByComparingTo(new BigDecimal("3600000.00"));
        // Tổng chi phí = 1.2M + 0.35M + 0.6M + 0.15M + 0.1M = 2,400,000 VND
        assertThat(response.getTotalExpense()).isEqualByComparingTo(new BigDecimal("2400000.00"));
        // Lợi nhuận ròng = 3.6M - 2.4M = 1,200,000 VND
        assertThat(response.getNetProfit()).isEqualByComparingTo(new BigDecimal("1200000.00"));
        assertThat(response.getIsLoss()).isFalse();
        assertThat(response.getLossAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.getProfitMarginPercent()).isEqualTo(33.33);
        assertThat(response.getInvoiceNumber()).isEqualTo("HD-2026-00123");
        assertThat(response.getIsLocked()).isFalse();
    }

    @Test
    @DisplayName("TC-S318-02: Báo cáo cảnh báo lỗ khi chi phí lớn hơn doanh thu bán vé")
    void getTripProfitLoss_Warning_LossMaking() {
        when(tripRepository.findById(100L)).thenReturn(Optional.of(tripNormal));
        when(tripExpenseRepository.findByTripId(100L)).thenReturn(Optional.of(expenseExisting));
        // Doanh thu chỉ được 1,500,000 VND (vắng khách)
        when(bookingRepository.sumRevenueByTripId(100L)).thenReturn(new BigDecimal("1500000.00"));

        TripProfitLossResponse response = tripExpenseService.getTripProfitLoss(100L, 1L);

        assertThat(response).isNotNull();
        assertThat(response.getActualRevenue()).isEqualByComparingTo(new BigDecimal("1500000.00"));
        assertThat(response.getTotalExpense()).isEqualByComparingTo(new BigDecimal("2400000.00"));
        // Lỗ ròng = 1.5M - 2.4M = -900,000 VND
        assertThat(response.getNetProfit()).isEqualByComparingTo(new BigDecimal("-900000.00"));
        assertThat(response.getIsLoss()).isTrue();
        assertThat(response.getLossAmount()).isEqualByComparingTo(new BigDecimal("900000.00"));
    }

    @Test
    @DisplayName("TC-S318-03: Trả về chi phí bằng 0 khi chuyến xe chưa có bản ghi chi phí")
    void getTripProfitLoss_NoExpenseYet() {
        when(tripRepository.findById(100L)).thenReturn(Optional.of(tripNormal));
        when(tripExpenseRepository.findByTripId(100L)).thenReturn(Optional.empty());
        when(bookingRepository.sumRevenueByTripId(100L)).thenReturn(new BigDecimal("2000000.00"));

        TripProfitLossResponse response = tripExpenseService.getTripProfitLoss(100L, 1L);

        assertThat(response).isNotNull();
        assertThat(response.getTotalExpense()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.getNetProfit()).isEqualByComparingTo(new BigDecimal("2000000.00"));
        assertThat(response.getIsLoss()).isFalse();
        assertThat(response.getInvoiceNumber()).isNull();
    }

    @Test
    @DisplayName("TC-S318-04: Multi-tenancy - Chặn nhà xe khác xem báo cáo chi phí của nhau")
    void getTripProfitLoss_Forbidden_DifferentCompany() {
        when(tripRepository.findById(100L)).thenReturn(Optional.of(tripNormal)); // thuộc companyA (1L)

        // CompanyB (2L) cố tình truy cập vào trip của CompanyA
        assertThatThrownBy(() -> tripExpenseService.getTripProfitLoss(100L, 2L))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException appEx = (AppException) ex;
                    assertThat(appEx.getErrorCode()).isEqualTo(ErrorCode.FORBIDDEN);
                });
    }

    @Test
    @DisplayName("TC-S318-05: Lưu chi phí vận hành chuyến xe thành công khi sổ chưa khóa")
    void saveTripExpense_Success() {
        SaveTripExpenseRequest request = SaveTripExpenseRequest.builder()
                .fuelCost(new BigDecimal("1300000.00"))
                .tollBotCost(new BigDecimal("350000.00"))
                .driverSalary(new BigDecimal("700000.00"))
                .terminalFee(new BigDecimal("150000.00"))
                .otherCosts(new BigDecimal("50000.00"))
                .invoiceNumber("VAT-HN-HP-88899")
                .notes("Bổ sung tiền rửa xe và hóa đơn dầu xăng dầu Petrolimex")
                .build();

        when(tripRepository.findById(100L)).thenReturn(Optional.of(tripNormal));
        when(tripExpenseRepository.findByTripId(100L)).thenReturn(Optional.of(expenseExisting));
        when(tripExpenseRepository.save(any(TripExpense.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TripProfitLossResponse response = tripExpenseService.saveTripExpense(100L, 1L, request);

        assertThat(response).isNotNull();
        assertThat(response.getFuelCost()).isEqualByComparingTo(new BigDecimal("1300000.00"));
        assertThat(response.getDriverSalary()).isEqualByComparingTo(new BigDecimal("700000.00"));
        assertThat(response.getInvoiceNumber()).isEqualTo("VAT-HN-HP-88899");
        verify(tripExpenseRepository, times(1)).save(any(TripExpense.class));
    }

    @Test
    @DisplayName("TC-S318-06: Chặn chỉnh sửa chi phí khi bản ghi đã bị khóa (is_locked = true)")
    void saveTripExpense_Blocked_WhenLocked() {
        expenseExisting.setIsLocked(true);
        SaveTripExpenseRequest request = SaveTripExpenseRequest.builder()
                .fuelCost(new BigDecimal("1000000.00"))
                .tollBotCost(new BigDecimal("200000.00"))
                .driverSalary(new BigDecimal("500000.00"))
                .terminalFee(new BigDecimal("100000.00"))
                .otherCosts(BigDecimal.ZERO)
                .build();

        when(tripRepository.findById(100L)).thenReturn(Optional.of(tripNormal));
        when(tripExpenseRepository.findByTripId(100L)).thenReturn(Optional.of(expenseExisting));

        assertThatThrownBy(() -> tripExpenseService.saveTripExpense(100L, 1L, request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException appEx = (AppException) ex;
                    assertThat(appEx.getErrorCode()).isEqualTo(ErrorCode.VALIDATION_ERROR);
                    assertThat(appEx.getMessage()).contains("SỔ CHI PHÍ ĐÃ KHÓA");
                });

        verify(tripExpenseRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC-S318-07: Chặn chỉnh sửa chi phí khi chuyến xe đã kết thúc quá 48 giờ")
    void saveTripExpense_Blocked_WhenExceed48Hours() {
        SaveTripExpenseRequest request = SaveTripExpenseRequest.builder()
                .fuelCost(new BigDecimal("1000000.00"))
                .tollBotCost(new BigDecimal("200000.00"))
                .driverSalary(new BigDecimal("500000.00"))
                .terminalFee(new BigDecimal("100000.00"))
                .otherCosts(BigDecimal.ZERO)
                .build();

        when(tripRepository.findById(101L)).thenReturn(Optional.of(tripOverdue));

        assertThatThrownBy(() -> tripExpenseService.saveTripExpense(101L, 1L, request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException appEx = (AppException) ex;
                    assertThat(appEx.getErrorCode()).isEqualTo(ErrorCode.VALIDATION_ERROR);
                    assertThat(appEx.getMessage()).contains("quá 48 giờ");
                });

        verify(tripExpenseRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC-S318-08: Multi-tenancy - Chặn nhà xe lưu chi phí cho chuyến xe của nhà xe khác")
    void saveTripExpense_Forbidden_DifferentCompany() {
        SaveTripExpenseRequest request = SaveTripExpenseRequest.builder()
                .fuelCost(new BigDecimal("1000000.00"))
                .tollBotCost(BigDecimal.ZERO)
                .driverSalary(BigDecimal.ZERO)
                .terminalFee(BigDecimal.ZERO)
                .otherCosts(BigDecimal.ZERO)
                .build();

        when(tripRepository.findById(100L)).thenReturn(Optional.of(tripNormal)); // thuộc companyA (1L)

        // CompanyB (2L) cố tình sửa chi phí của CompanyA
        assertThatThrownBy(() -> tripExpenseService.saveTripExpense(100L, 2L, request))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    AppException appEx = (AppException) ex;
                    assertThat(appEx.getErrorCode()).isEqualTo(ErrorCode.FORBIDDEN);
                });

        verify(tripExpenseRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC-S318-09: Tổng kết báo cáo chi phí và lãi lỗ toàn bộ đội xe của nhà xe")
    void getCompanyExpenseSummary_Success() {
        when(tripRepository.findByBusCompanyId(1L)).thenReturn(List.of(tripNormal));
        when(tripExpenseRepository.findByTripId(100L)).thenReturn(Optional.of(expenseExisting));
        when(bookingRepository.sumRevenueByTripId(100L)).thenReturn(new BigDecimal("3600000.00"));

        CompanyExpenseSummaryResponse summary = tripExpenseService.getCompanyExpenseSummary(1L);

        assertThat(summary).isNotNull();
        assertThat(summary.getTrips()).hasSize(1);
        assertThat(summary.getTotalRevenue()).isEqualByComparingTo(new BigDecimal("3600000.00"));
        assertThat(summary.getTotalExpense()).isEqualByComparingTo(new BigDecimal("2400000.00"));
        assertThat(summary.getTotalNetProfit()).isEqualByComparingTo(new BigDecimal("1200000.00"));
        assertThat(summary.getOverallMarginPercent()).isEqualTo(33.33);
        assertThat(summary.getLossTripsCount()).isEqualTo(0);
    }
}
