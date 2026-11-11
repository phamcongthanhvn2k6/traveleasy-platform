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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Kiểm thử Fuzzing và Giá trị biên cho Sổ Chi Phí & Lợi Nhuận (S318)")
class TripExpenseFuzzingTest {

    @Mock
    private TripExpenseRepository tripExpenseRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private TripExpenseServiceImpl tripExpenseService;

    private BusCompany defaultCompany;
    private Trip defaultTrip;

    @BeforeEach
    void setUp() {
        defaultCompany = BusCompany.builder()
                .id(1L)
                .name("Nhà Xe Liên Tỉnh Hoàng Long")
                .code("HOLA")
                .build();

        defaultTrip = Trip.builder()
                .id(200L)
                .busCompany(defaultCompany)
                .departureTime(LocalDateTime.now().minusHours(2))
                .arrivalTime(LocalDateTime.now())
                .licensePlate("15B-098.76")
                .status(TripStatus.COMPLETED)
                .build();
    }

    @Test
    @DisplayName("FUZZ-01: Doanh thu bằng 0, không xảy ra ngoại lệ chia cho 0 (DivideByZero)")
    void fuzzing_ZeroRevenue_NoArithmeticException() {
        TripExpense expense = TripExpense.builder()
                .id(10L)
                .trip(defaultTrip)
                .busCompany(defaultCompany)
                .fuelCost(new BigDecimal("2000000.00"))
                .tollBotCost(new BigDecimal("500000.00"))
                .driverSalary(new BigDecimal("800000.00"))
                .terminalFee(new BigDecimal("200000.00"))
                .otherCosts(BigDecimal.ZERO)
                .build();

        when(tripRepository.findById(200L)).thenReturn(Optional.of(defaultTrip));
        when(tripExpenseRepository.findByTripId(200L)).thenReturn(Optional.of(expense));
        when(bookingRepository.sumRevenueByTripId(200L)).thenReturn(BigDecimal.ZERO);

        TripProfitLossResponse response = tripExpenseService.getTripProfitLoss(200L, 1L);

        assertThat(response).isNotNull();
        assertThat(response.getActualRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.getTotalExpense()).isEqualByComparingTo(new BigDecimal("3500000.00"));
        assertThat(response.getNetProfit()).isEqualByComparingTo(new BigDecimal("-3500000.00"));
        assertThat(response.getIsLoss()).isTrue();
        assertThat(response.getLossAmount()).isEqualByComparingTo(new BigDecimal("3500000.00"));
        assertThat(response.getProfitMarginPercent()).isEqualTo(0.0);
    }

    @Test
    @DisplayName("FUZZ-02: Số tiền chi phí cực lớn (999 Tỷ VNĐ) không bị tràn số hay tràn bộ nhớ")
    void fuzzing_ExtremelyLargeExpense_HandledCorrectly() {
        BigDecimal massiveCost = new BigDecimal("999999999999.00");
        TripExpense expense = TripExpense.builder()
                .id(11L)
                .trip(defaultTrip)
                .busCompany(defaultCompany)
                .fuelCost(massiveCost)
                .tollBotCost(BigDecimal.ZERO)
                .driverSalary(BigDecimal.ZERO)
                .terminalFee(BigDecimal.ZERO)
                .otherCosts(BigDecimal.ZERO)
                .build();

        when(tripRepository.findById(200L)).thenReturn(Optional.of(defaultTrip));
        when(tripExpenseRepository.findByTripId(200L)).thenReturn(Optional.of(expense));
        when(bookingRepository.sumRevenueByTripId(200L)).thenReturn(new BigDecimal("10000000.00"));

        TripProfitLossResponse response = tripExpenseService.getTripProfitLoss(200L, 1L);

        assertThat(response).isNotNull();
        assertThat(response.getTotalExpense()).isEqualByComparingTo(massiveCost);
        assertThat(response.getIsLoss()).isTrue();
        assertThat(response.getNetProfit()).isNegative();
    }

    @Test
    @DisplayName("FUZZ-03: Chi phí toàn bộ bằng 0, tỷ suất lợi nhuận đạt tối đa 100%")
    void fuzzing_ZeroExpenses_FullMargin() {
        TripExpense expense = TripExpense.builder()
                .id(12L)
                .trip(defaultTrip)
                .busCompany(defaultCompany)
                .fuelCost(BigDecimal.ZERO)
                .tollBotCost(BigDecimal.ZERO)
                .driverSalary(BigDecimal.ZERO)
                .terminalFee(BigDecimal.ZERO)
                .otherCosts(BigDecimal.ZERO)
                .build();

        when(tripRepository.findById(200L)).thenReturn(Optional.of(defaultTrip));
        when(tripExpenseRepository.findByTripId(200L)).thenReturn(Optional.of(expense));
        when(bookingRepository.sumRevenueByTripId(200L)).thenReturn(new BigDecimal("5000000.00"));

        TripProfitLossResponse response = tripExpenseService.getTripProfitLoss(200L, 1L);

        assertThat(response).isNotNull();
        assertThat(response.getTotalExpense()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.getNetProfit()).isEqualByComparingTo(new BigDecimal("5000000.00"));
        assertThat(response.getIsLoss()).isFalse();
        assertThat(response.getProfitMarginPercent()).isEqualTo(100.0);
    }

    @Test
    @DisplayName("FUZZ-04: Lưu số hóa đơn đỏ chứa ký tự tiếng Việt, dấu cách và ký tự đặc biệt")
    void fuzzing_SpecialCharactersInInvoiceNumber() {
        String complexInvoice = "HĐĐT-VAT/2026-XĂNG DẦU #9988_HN@!";
        SaveTripExpenseRequest request = SaveTripExpenseRequest.builder()
                .fuelCost(new BigDecimal("1000000.00"))
                .tollBotCost(BigDecimal.ZERO)
                .driverSalary(BigDecimal.ZERO)
                .terminalFee(BigDecimal.ZERO)
                .otherCosts(BigDecimal.ZERO)
                .invoiceNumber(complexInvoice)
                .notes("Hóa đơn điện tử có mã cơ quan thuế cấp")
                .build();

        when(tripRepository.findById(200L)).thenReturn(Optional.of(defaultTrip));
        when(tripExpenseRepository.findByTripId(200L)).thenReturn(Optional.empty());
        when(tripExpenseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TripProfitLossResponse response = tripExpenseService.saveTripExpense(200L, 1L, request);

        assertThat(response).isNotNull();
        assertThat(response.getInvoiceNumber()).isEqualTo(complexInvoice);
    }

    @Test
    @DisplayName("FUZZ-05: Mô phỏng 100 yêu cầu truy cập ngẫu nhiên kiểm tra multi-tenancy isolation")
    void fuzzing_RandomMultiTenancyAccess_StrictlyEnforced() {
        Random random = new Random(42);
        when(tripRepository.findById(200L)).thenReturn(Optional.of(defaultTrip)); // busCompanyId = 1L

        for (int i = 0; i < 100; i++) {
            long randomCompanyId = 2L + random.nextInt(1000); // Các ID khác 1L
            assertThatThrownBy(() -> tripExpenseService.getTripProfitLoss(200L, randomCompanyId))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getErrorCode()).isEqualTo(ErrorCode.FORBIDDEN);
                    });
        }
    }
}
