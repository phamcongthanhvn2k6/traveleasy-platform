package com.traveleasy.service.company;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.company.ClosePosShiftRequest;
import com.traveleasy.dto.company.OpenPosShiftRequest;
import com.traveleasy.dto.company.PosShiftResponse;
import com.traveleasy.dto.company.RecordPosShiftCashSaleRequest;
import com.traveleasy.entity.BusCompany;
import com.traveleasy.entity.PosShift;
import com.traveleasy.repository.BookingRepository;
import com.traveleasy.repository.BusCompanyRepository;
import com.traveleasy.repository.PosShiftRepository;
import com.traveleasy.repository.PosShiftTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PosShiftServiceTest {

    @Mock
    private PosShiftRepository posShiftRepository;

    @Mock
    private PosShiftTransactionRepository transactionRepository;

    @Mock
    private BusCompanyRepository busCompanyRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private PosShiftService posShiftService;

    private Long busCompanyId;
    private Long staffUserId;
    private BusCompany busCompany;

    @BeforeEach
    void setUp() {
        busCompanyId = 1L;
        staffUserId = 10L;
        busCompany = BusCompany.builder()
                .id(busCompanyId)
                .name("Nhà xe TravelEasy")
                .build();
    }

    @Test
    @DisplayName("Mở ca trực khi quầy đang có ca mở -> ném lỗi VALIDATION_ERROR")
    void openShift_WhenCounterHasOpenShift_ThrowsValidationError() {
        when(busCompanyRepository.findByIdForUpdate(busCompanyId)).thenReturn(Optional.of(busCompany));
        when(posShiftRepository.existsByBusCompanyIdAndCounterNameIgnoreCaseAndStatus(
                eq(busCompanyId), eq("Quầy 01"), eq("OPEN")
        )).thenReturn(true);

        OpenPosShiftRequest request = new OpenPosShiftRequest(
                "Đoàn Nhật Cường",
                "Quầy 01",
                new BigDecimal("500000")
        );

        AppException exception = assertThrows(AppException.class, () ->
                posShiftService.openShift(busCompanyId, staffUserId, request)
        );

        assertEquals(ErrorCode.VALIDATION_ERROR, exception.getErrorCode());
        assertTrue(exception.getMessage().contains("đang có ca chưa chốt"));
        verify(posShiftRepository, never()).save(any());
    }

    @Test
    @DisplayName("Mở ca trực thành công khi quầy chưa có ca mở")
    void openShift_Success() {
        when(busCompanyRepository.findByIdForUpdate(busCompanyId)).thenReturn(Optional.of(busCompany));
        when(posShiftRepository.existsByBusCompanyIdAndCounterNameIgnoreCaseAndStatus(
                eq(busCompanyId), eq("Quầy 02"), eq("OPEN")
        )).thenReturn(false);

        PosShift savedShift = PosShift.builder()
                .id(100L)
                .busCompanyId(busCompanyId)
                .staffUserId(staffUserId)
                .cashierName("Đoàn Nhật Cường")
                .counterName("Quầy 02")
                .openedAt(LocalDateTime.now())
                .initialCashAmount(new BigDecimal("500000"))
                .totalCashCollected(BigDecimal.ZERO)
                .totalCashRefunds(BigDecimal.ZERO)
                .totalQrCollected(BigDecimal.ZERO)
                .totalTicketsSold(0)
                .status("OPEN")
                .build();

        when(posShiftRepository.save(any(PosShift.class))).thenReturn(savedShift);
        when(bookingRepository.findByPosShiftIdAndBookingChannelAndPaymentMethodAndStatusInOrderByCreatedAtAsc(
                eq(100L), anyString(), any(), anyList()
        )).thenReturn(Collections.emptyList());
        when(transactionRepository.findByShiftIdOrderByCreatedAtAsc(100L)).thenReturn(Collections.emptyList());

        OpenPosShiftRequest request = new OpenPosShiftRequest(
                "Đoàn Nhật Cường",
                "Quầy 02",
                new BigDecimal("500000")
        );

        PosShiftResponse response = posShiftService.openShift(busCompanyId, staffUserId, request);

        assertNotNull(response);
        assertEquals(100L, response.id());
        assertEquals("Quầy 02", response.counter());
        assertEquals("OPEN", response.status());
        assertEquals(new BigDecimal("500000"), response.openingFloat());
        assertEquals(new BigDecimal("500000"), response.expectedCash());
    }

    @Test
    @DisplayName("Chốt ca trực tính đúng chênh lệch két (cashVariance = countedCash - expectedCash)")
    void closeShift_CalculatesCashVarianceCorrectly() {
        Long shiftId = 200L;
        BigDecimal initialCash = new BigDecimal("500000");
        BigDecimal cashCollected = new BigDecimal("1200000");
        BigDecimal cashRefunded = new BigDecimal("200000");
        // expectedCash = initial (500000) + collected (1200000) - refunds (200000) = 1500000
        BigDecimal countedCash = new BigDecimal("1550000"); // Thừa 50.000đ

        PosShift openShift = PosShift.builder()
                .id(shiftId)
                .busCompanyId(busCompanyId)
                .staffUserId(staffUserId)
                .cashierName("Đoàn Nhật Cường")
                .counterName("Quầy 01")
                .openedAt(LocalDateTime.now().minusHours(8))
                .initialCashAmount(initialCash)
                .totalCashCollected(cashCollected)
                .totalCashRefunds(cashRefunded)
                .totalQrCollected(BigDecimal.ZERO)
                .totalTicketsSold(4)
                .status("OPEN")
                .build();

        PosShift closedShift = PosShift.builder()
                .id(shiftId)
                .busCompanyId(busCompanyId)
                .staffUserId(staffUserId)
                .cashierName("Đoàn Nhật Cường")
                .counterName("Quầy 01")
                .openedAt(openShift.getOpenedAt())
                .closedAt(LocalDateTime.now())
                .initialCashAmount(initialCash)
                .totalCashCollected(cashCollected)
                .totalCashRefunds(cashRefunded)
                .totalQrCollected(BigDecimal.ZERO)
                .totalTicketsSold(4)
                .countedCashAmount(countedCash)
                .cashVariance(new BigDecimal("50000"))
                .status("CLOSED")
                .notes("Kiểm đếm cuối ca - thừa 50k")
                .build();

        when(posShiftRepository.findByIdAndBusCompanyId(shiftId, busCompanyId))
                .thenReturn(Optional.of(openShift))
                .thenReturn(Optional.of(closedShift));

        when(posShiftRepository.closeOpenShift(
                eq(busCompanyId), eq(shiftId), eq(countedCash), eq("Kiểm đếm cuối ca - thừa 50k"), any(LocalDateTime.class)
        )).thenReturn(1);

        when(bookingRepository.findByPosShiftIdAndBookingChannelAndPaymentMethodAndStatusInOrderByCreatedAtAsc(
                eq(shiftId), anyString(), any(), anyList()
        )).thenReturn(Collections.emptyList());
        when(transactionRepository.findByShiftIdOrderByCreatedAtAsc(shiftId)).thenReturn(Collections.emptyList());

        ClosePosShiftRequest closeRequest = new ClosePosShiftRequest(
                shiftId,
                countedCash,
                "Kiểm đếm cuối ca - thừa 50k"
        );

        PosShiftResponse response = posShiftService.closeShift(busCompanyId, closeRequest);

        assertNotNull(response);
        assertEquals("CLOSED", response.status());
        assertEquals(new BigDecimal("1500000"), response.expectedCash());
        assertEquals(new BigDecimal("1550000"), response.countedCash());
        assertEquals(new BigDecimal("50000"), response.variance()); // +50,000 variance
    }

    @Test
    @DisplayName("Chốt ca trực thất bại khi ca đã đóng trước đó -> ném lỗi VALIDATION_ERROR")
    void closeShift_WhenAlreadyClosed_ThrowsValidationError() {
        Long shiftId = 201L;
        PosShift closedShift = PosShift.builder()
                .id(shiftId)
                .busCompanyId(busCompanyId)
                .status("CLOSED")
                .build();

        when(posShiftRepository.findByIdAndBusCompanyId(shiftId, busCompanyId))
                .thenReturn(Optional.of(closedShift));

        ClosePosShiftRequest closeRequest = new ClosePosShiftRequest(
                shiftId,
                new BigDecimal("1000000"),
                "Chốt lại ca"
        );

        AppException exception = assertThrows(AppException.class, () ->
                posShiftService.closeShift(busCompanyId, closeRequest)
        );

        assertEquals(ErrorCode.VALIDATION_ERROR, exception.getErrorCode());
        assertTrue(exception.getMessage().contains("đã được chốt trước đó"));
        verify(posShiftRepository, never()).closeOpenShift(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Cập nhật số tiền và số vé nguyên tử chống Race Condition (addCashSale = 1)")
    void recordManualCashSale_AtomicUpdateSuccess() {
        Long shiftId = 300L;
        BigDecimal saleAmount = new BigDecimal("350000");

        PosShift openShift = PosShift.builder()
                .id(shiftId)
                .busCompanyId(busCompanyId)
                .staffUserId(staffUserId)
                .cashierName("Đoàn Nhật Cường")
                .counterName("Quầy 01")
                .status("OPEN")
                .initialCashAmount(new BigDecimal("500000"))
                .totalCashCollected(saleAmount)
                .totalCashRefunds(BigDecimal.ZERO)
                .totalTicketsSold(1)
                .build();

        when(posShiftRepository.findByIdAndBusCompanyId(shiftId, busCompanyId))
                .thenReturn(Optional.of(openShift));
        when(posShiftRepository.addCashSale(eq(busCompanyId), eq(shiftId), eq(saleAmount), eq(1), any(LocalDateTime.class)))
                .thenReturn(1);
        when(bookingRepository.findByPosShiftIdAndBookingChannelAndPaymentMethodAndStatusInOrderByCreatedAtAsc(
                eq(shiftId), anyString(), any(), anyList()
        )).thenReturn(Collections.emptyList());
        when(transactionRepository.findByShiftIdOrderByCreatedAtAsc(shiftId)).thenReturn(Collections.emptyList());

        RecordPosShiftCashSaleRequest request = new RecordPosShiftCashSaleRequest(
                "TE-TK-9999",
                saleAmount,
                "Bán vé xe limousine tuyến Đà Lạt"
        );

        PosShiftResponse response = posShiftService.recordManualCashSale(busCompanyId, shiftId, request);

        assertNotNull(response);
        verify(posShiftRepository, times(1)).addCashSale(eq(busCompanyId), eq(shiftId), eq(saleAmount), eq(1), any(LocalDateTime.class));
        verify(transactionRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Bán vé vào ca đã đóng -> ném lỗi VALIDATION_ERROR")
    void recordManualCashSale_WhenShiftClosed_ThrowsValidationError() {
        Long shiftId = 301L;
        BigDecimal saleAmount = new BigDecimal("350000");

        PosShift closedShift = PosShift.builder()
                .id(shiftId)
                .busCompanyId(busCompanyId)
                .status("CLOSED")
                .build();

        when(posShiftRepository.findByIdAndBusCompanyId(shiftId, busCompanyId))
                .thenReturn(Optional.of(closedShift));

        RecordPosShiftCashSaleRequest request = new RecordPosShiftCashSaleRequest(
                "TE-TK-9999",
                saleAmount,
                "Bán vé xe limousine"
        );

        AppException exception = assertThrows(AppException.class, () ->
                posShiftService.recordManualCashSale(busCompanyId, shiftId, request)
        );

        assertEquals(ErrorCode.VALIDATION_ERROR, exception.getErrorCode());
        assertTrue(exception.getMessage().contains("Ca trực đã chốt"));
        verify(posShiftRepository, never()).addCashSale(any(), any(), any(), anyInt(), any());
    }

    @Test
    @DisplayName("Hoàn tiền mặt cho khách cập nhật nguyên tử addCashRefund thành công")
    void recordCashRefund_AtomicUpdateSuccess() {
        Long shiftId = 400L;
        BigDecimal refundAmount = new BigDecimal("200000");

        PosShift openShift = PosShift.builder()
                .id(shiftId)
                .busCompanyId(busCompanyId)
                .status("OPEN")
                .build();

        when(posShiftRepository.findByIdAndBusCompanyId(shiftId, busCompanyId)).thenReturn(Optional.of(openShift));
        when(posShiftRepository.addCashRefund(eq(busCompanyId), eq(shiftId), eq(refundAmount), any(LocalDateTime.class)))
                .thenReturn(1);

        posShiftService.recordCashRefund(busCompanyId, shiftId, refundAmount, "TE-TK-8888", "Khách hủy chuyến hoàn tiền mặt");

        verify(posShiftRepository, times(1)).addCashRefund(eq(busCompanyId), eq(shiftId), eq(refundAmount), any(LocalDateTime.class));
        verify(transactionRepository, times(1)).save(any());
    }
}
