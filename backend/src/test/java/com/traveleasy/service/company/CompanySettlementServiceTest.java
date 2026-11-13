package com.traveleasy.service.company;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.entity.AuditLog;
import com.traveleasy.entity.BusCompany;
import com.traveleasy.entity.PayoutRequest;
import com.traveleasy.entity.SettlementRecord;
import com.traveleasy.repository.AuditLogRepository;
import com.traveleasy.repository.BookingRepository;
import com.traveleasy.repository.BusCompanyRepository;
import com.traveleasy.repository.PayoutRequestRepository;
import com.traveleasy.repository.SettlementRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanySettlementServiceTest {

    @Mock
    private SettlementRecordRepository settlementRecordRepository;

    @Mock
    private PayoutRequestRepository payoutRequestRepository;

    @Mock
    private BusCompanyRepository busCompanyRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private CompanySettlementService settlementService;

    private BusCompany futaCompany;

    @BeforeEach
    void setUp() {
        futaCompany = BusCompany.builder()
                .id(1L)
                .code("FUTA")
                .name("Phương Trang FUTA")
                .commissionRate(BigDecimal.valueOf(4.00))
                .bankName("Vietcombank")
                .bankAccountNumber("0071000987101")
                .bankAccountOwner("CTY CP XE KHACH PHUONG TRANG")
                .build();
    }

    @Test
    @DisplayName("Tính chính xác số tiền kỳ trước, doanh thu phát sinh, hoa hồng theo từng nhà xe (4%) và thực nhận")
    void getCompanySettlements_UsesPerCompanyRateAndPreviousBalance() {
        SettlementRecord prevUnsettled = SettlementRecord.builder()
                .id("ds-1-old")
                .code("DS-202610-P2-FUTA")
                .company(futaCompany)
                .periodName("Kỳ 2 - Tháng 10/2026")
                .startDate("16/10/2026")
                .endDate("31/10/2026")
                .ticketCount(10)
                .previousBalance(BigDecimal.ZERO)
                .grossAmount(new BigDecimal("1000000.00"))
                .platformCommission(new BigDecimal("40000.00"))
                .netPayable(new BigDecimal("960000.00"))
                .status("RECONCILED")
                .build();

        when(busCompanyRepository.findById(1L)).thenReturn(Optional.of(futaCompany));
        when(settlementRecordRepository.findByCompanyIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(prevUnsettled));

        Object[] row = new Object[]{5L, new BigDecimal("2000000.00"), new BigDecimal("1900000.00"), new BigDecimal("100000.00")};
        when(bookingRepository.getCompanyStatsInPeriod(eq(1L), any(), any()))
                .thenReturn(Collections.singletonList(row));

        when(settlementRecordRepository.findByCompanyIdAndCode(eq(1L), any()))
                .thenReturn(Optional.empty());
        when(settlementRecordRepository.save(any(SettlementRecord.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        List<Map<String, Object>> result = settlementService.getCompanySettlements(1L, null);

        assertFalse(result.isEmpty());
        ArgumentCaptor<SettlementRecord> captor = ArgumentCaptor.forClass(SettlementRecord.class);
        verify(settlementRecordRepository).save(captor.capture());

        SettlementRecord saved = captor.getValue();
        assertEquals(0, new BigDecimal("960000.00").compareTo(saved.getPreviousBalance()));
        assertEquals(0, new BigDecimal("2000000.00").compareTo(saved.getGrossAmount()));
        assertEquals(4, saved.getCommissionRate());
        // 4% của 2,000,000 = 80,000; thực nhận = 1,920,000
        assertEquals(0, new BigDecimal("80000.00").compareTo(saved.getPlatformCommission()));
        assertEquals(0, new BigDecimal("1920000.00").compareTo(saved.getNetPayable()));
    }

    @Test
    @DisplayName("Lọc trạng thái COMPLETED trả về cả các kỳ PAID và COMPLETED")
    void getCompanySettlements_FilterCompleted_ReturnsPaidAndCompleted() {
        SettlementRecord paid = SettlementRecord.builder()
                .id("1").code("DS-1").company(futaCompany).periodName("K1").startDate("01/10/2026").endDate("15/10/2026")
                .status("PAID").netPayable(new BigDecimal("500000")).build();
        SettlementRecord pending = SettlementRecord.builder()
                .id("2").code("DS-2").company(futaCompany).periodName("K2").startDate("16/10/2026").endDate("31/10/2026")
                .status("PENDING").netPayable(new BigDecimal("600000")).build();

        when(busCompanyRepository.findById(1L)).thenReturn(Optional.of(futaCompany));
        when(settlementRecordRepository.findByCompanyIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(paid, pending));
        when(bookingRepository.getCompanyStatsInPeriod(eq(1L), any(), any()))
                .thenReturn(Collections.singletonList(new Object[]{0L, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO}));
        when(settlementRecordRepository.findByCompanyIdAndCode(eq(1L), any()))
                .thenReturn(Optional.of(pending));
        when(settlementRecordRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        List<Map<String, Object>> filtered = settlementService.getCompanySettlements(1L, "COMPLETED");

        assertEquals(1, filtered.size());
        assertEquals("DS-1", filtered.get(0).get("code"));
    }

    @Test
    @DisplayName("Từ chối tạo lệnh rút tiền nếu nhỏ hơn hạn mức tối thiểu 500,000 VNĐ")
    void createPayoutRequest_BelowMinimum_ThrowsBadRequest() {
        AppException ex = assertThrows(AppException.class,
                () -> settlementService.createPayoutRequest(1L, new BigDecimal("499000"), "Rút thử", "partner@traveleasy.vn"));
        assertTrue(ex.getMessage().contains("500.000"));
        verifyNoInteractions(payoutRequestRepository);
    }

    @Test
    @DisplayName("Từ chối tạo lệnh rút tiền nếu vượt quá số dư khả dụng trong ví nhà xe")
    void createPayoutRequest_ExceedsBalance_ThrowsBadRequest() {
        SettlementRecord rec = SettlementRecord.builder()
                .id("1").code("DS-1").company(futaCompany)
                .grossAmount(new BigDecimal("1000000")).platformCommission(new BigDecimal("40000"))
                .netPayable(new BigDecimal("960000")).status("RECONCILED").build();

        when(busCompanyRepository.findById(1L)).thenReturn(Optional.of(futaCompany));
        when(bookingRepository.getCompanyStatsInPeriod(eq(1L), any(), any()))
                .thenReturn(Collections.singletonList(new Object[]{0L, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO}));
        when(settlementRecordRepository.findByCompanyIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(rec));
        when(payoutRequestRepository.findByCompanyIdOrderByCreatedAtDesc(1L)).thenReturn(Collections.emptyList());
        when(payoutRequestRepository.sumPendingAmountByCompanyId(1L)).thenReturn(new BigDecimal("300000"));

        // Available = 960,000 - 300,000 = 660,000; yêu cầu rút 700,000 -> lỗi
        AppException ex = assertThrows(AppException.class,
                () -> settlementService.createPayoutRequest(1L, new BigDecimal("700000"), "Rút vượt", "partner@traveleasy.vn"));
        assertTrue(ex.getMessage().contains("không đủ"));
        verify(payoutRequestRepository, never()).save(any());
    }

    @Test
    @DisplayName("Tạo lệnh rút tiền thành công khi >= 500,000 VNĐ và <= số dư khả dụng")
    void createPayoutRequest_ValidAmount_SavesPayoutAndAuditLog() {
        SettlementRecord rec = SettlementRecord.builder()
                .id("1").code("DS-1").company(futaCompany)
                .grossAmount(new BigDecimal("2000000")).platformCommission(new BigDecimal("80000"))
                .netPayable(new BigDecimal("1920000")).status("RECONCILED").build();

        when(busCompanyRepository.findById(1L)).thenReturn(Optional.of(futaCompany));
        when(bookingRepository.getCompanyStatsInPeriod(eq(1L), any(), any()))
                .thenReturn(Collections.singletonList(new Object[]{0L, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO}));
        when(settlementRecordRepository.findByCompanyIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(rec));
        when(payoutRequestRepository.findByCompanyIdOrderByCreatedAtDesc(1L)).thenReturn(Collections.emptyList());
        when(payoutRequestRepository.sumPendingAmountByCompanyId(1L)).thenReturn(BigDecimal.ZERO);
        when(payoutRequestRepository.save(any(PayoutRequest.class))).thenAnswer(inv -> {
            PayoutRequest p = inv.getArgument(0);
            p.setId(99L);
            return p;
        });

        Map<String, Object> payout = settlementService.createPayoutRequest(
                1L, new BigDecimal("500000"), "Rút kỳ 1", "partner@traveleasy.vn");

        assertEquals(99L, payout.get("id"));
        assertEquals("PENDING", payout.get("status"));
        assertEquals("Vietcombank", payout.get("bankName"));
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("Tính đúng chu kỳ đối soát ngày 01..15 và 16..cuối tháng")
    void resolvePeriods_FirstAndSecondHalf_AreAccurate() {
        var p1 = CompanySettlementService.resolvePeriodForDate(LocalDate.of(2026, 11, 12));
        assertEquals("DS-202611-P1", p1.codePrefix());
        assertEquals(LocalDate.of(2026, 11, 1), p1.startDate());
        assertEquals(LocalDate.of(2026, 11, 15), p1.endInclusive());

        var prevOf15 = CompanySettlementService.resolvePreviousPeriod(LocalDate.of(2026, 11, 15));
        assertEquals("DS-202611-P1", prevOf15.codePrefix());

        var prevOf1 = CompanySettlementService.resolvePreviousPeriod(LocalDate.of(2026, 11, 1));
        assertEquals("DS-202610-P2", prevOf1.codePrefix());
    }
}
