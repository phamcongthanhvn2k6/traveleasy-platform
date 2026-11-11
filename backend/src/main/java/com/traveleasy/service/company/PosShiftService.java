package com.traveleasy.service.company;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.company.CashSaleResponse;
import com.traveleasy.dto.company.ClosePosShiftRequest;
import com.traveleasy.dto.company.OpenPosShiftRequest;
import com.traveleasy.dto.company.PosShiftResponse;
import com.traveleasy.dto.company.RecordPosShiftCashSaleRequest;
import com.traveleasy.entity.Booking;
import com.traveleasy.entity.BookingStatus;
import com.traveleasy.entity.PaymentMethod;
import com.traveleasy.entity.PosShift;
import com.traveleasy.entity.PosShiftTransaction;
import com.traveleasy.repository.BookingRepository;
import com.traveleasy.repository.BusCompanyRepository;
import com.traveleasy.repository.PosShiftRepository;
import com.traveleasy.repository.PosShiftTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PosShiftService {

    private static final String OPEN = "OPEN";
    private static final String CLOSED = "CLOSED";
    private static final String CASH_SALE = "CASH_SALE";
    private static final String CASH_REFUND = "CASH_REFUND";

    private final PosShiftRepository posShiftRepository;
    private final PosShiftTransactionRepository transactionRepository;
    private final BookingRepository bookingRepository;
    private final BusCompanyRepository busCompanyRepository;

    @Transactional(readOnly = true)
    public List<PosShiftResponse> listShifts(Long busCompanyId) {
        return posShiftRepository.findByBusCompanyIdOrderByOpenedAtDesc(busCompanyId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PosShiftResponse getCurrentShift(Long busCompanyId, Long staffUserId) {
        return posShiftRepository
                .findFirstByBusCompanyIdAndStaffUserIdAndStatusOrderByOpenedAtDesc(busCompanyId, staffUserId, OPEN)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional
    public PosShiftResponse openShift(Long busCompanyId, Long staffUserId, OpenPosShiftRequest request) {
        busCompanyRepository.findByIdForUpdate(busCompanyId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy nhà xe của tài khoản."));

        String cashierName = request.cashierName().trim();
        String counter = request.counter().trim();

        if (posShiftRepository.existsByBusCompanyIdAndCounterNameIgnoreCaseAndStatus(busCompanyId, counter, OPEN)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Quầy \"" + counter + "\" đang có ca chưa chốt. Hãy chốt ca đó trước.");
        }

        LocalDateTime now = LocalDateTime.now();
        PosShift shift = PosShift.builder()
                .busCompanyId(busCompanyId)
                .staffUserId(staffUserId)
                .cashierName(cashierName)
                .counterName(counter)
                .openedAt(now)
                .initialCashAmount(request.initialCash())
                .totalCashCollected(BigDecimal.ZERO)
                .totalCashRefunds(BigDecimal.ZERO)
                .totalQrCollected(BigDecimal.ZERO)
                .totalTicketsSold(0)
                .status(OPEN)
                .createdAt(now)
                .updatedAt(now)
                .build();

        PosShift saved = posShiftRepository.save(shift);
        return toResponse(saved);
    }

    @Transactional
    public PosShiftResponse closeShift(Long busCompanyId, ClosePosShiftRequest request) {
        PosShift shift = findOwnedShift(busCompanyId, request.shiftId());
        if (!OPEN.equals(shift.getStatus())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Ca trực này đã được chốt trước đó.");
        }

        LocalDateTime now = LocalDateTime.now();
        int updated = posShiftRepository.closeOpenShift(
                busCompanyId,
                request.shiftId(),
                request.countedCash(),
                cleanOptional(request.closeNote()),
                now
        );

        if (updated != 1) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Ca trực đã được chốt hoặc không còn mở. Hãy làm mới danh sách ca.");
        }

        return toResponse(findOwnedShift(busCompanyId, request.shiftId()));
    }

    @Transactional
    public PosShiftResponse recordManualCashSale(Long busCompanyId, Long shiftId, RecordPosShiftCashSaleRequest request) {
        requireOpenShift(busCompanyId, shiftId);

        LocalDateTime now = LocalDateTime.now();
        int updated = posShiftRepository.addCashSale(busCompanyId, shiftId, request.amount(), 1, now);
        if (updated != 1) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Ca trực đã đóng hoặc không thuộc nhà xe hiện tại.");
        }

        PosShiftTransaction tx = PosShiftTransaction.builder()
                .shiftId(shiftId)
                .ticketCode(cleanOptional(request.ticketCode()))
                .amount(request.amount())
                .movementType(CASH_SALE)
                .note(cleanOptional(request.note()))
                .createdAt(now)
                .build();
        transactionRepository.save(tx);

        return toResponse(findOwnedShift(busCompanyId, shiftId));
    }

    @Transactional
    public void recordCashRefund(Long busCompanyId, Long shiftId, BigDecimal amount, String ticketCode, String note) {
        if (amount.signum() <= 0) {
            return;
        }

        requireOpenShift(busCompanyId, shiftId);

        LocalDateTime now = LocalDateTime.now();
        int updated = posShiftRepository.addCashRefund(busCompanyId, shiftId, amount, now);
        if (updated != 1) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Ca trực hoàn tiền đã đóng hoặc không thuộc nhà xe hiện tại.");
        }

        PosShiftTransaction tx = PosShiftTransaction.builder()
                .shiftId(shiftId)
                .ticketCode(ticketCode)
                .amount(amount)
                .movementType(CASH_REFUND)
                .note(cleanOptional(note))
                .createdAt(now)
                .build();
        transactionRepository.save(tx);
    }

    @Transactional
    public void recordPosCashSale(Long busCompanyId, Long shiftId, BigDecimal amount, int ticketCount) {
        if (amount == null || amount.signum() <= 0 || ticketCount <= 0) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Doanh thu POS phải lớn hơn 0.");
        }

        int updated = posShiftRepository.addCashSale(busCompanyId, shiftId, amount, ticketCount, LocalDateTime.now());
        if (updated != 1) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Không thể ghi nhận vé POS: ca đã đóng hoặc không thuộc nhà xe hiện tại.");
        }
    }

    private PosShift requireOpenShift(Long busCompanyId, Long shiftId) {
        PosShift shift = findOwnedShift(busCompanyId, shiftId);
        if (!OPEN.equals(shift.getStatus())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Ca trực đã chốt, không thể ghi nhận giao dịch.");
        }
        return shift;
    }

    private PosShift findOwnedShift(Long busCompanyId, Long shiftId) {
        return posShiftRepository.findByIdAndBusCompanyId(shiftId, busCompanyId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy ca trực."));
    }

    private PosShiftResponse toResponse(PosShift shift) {
        List<CashSaleResponse> sales = new ArrayList<>();

        List<Booking> posBookings = bookingRepository.findByPosShiftIdAndBookingChannelAndPaymentMethodAndStatusInOrderByCreatedAtAsc(
                shift.getId(),
                "POS_COUNTER",
                PaymentMethod.CASH,
                List.of(BookingStatus.CONFIRMED, BookingStatus.COMPLETED)
        );
        posBookings.forEach(b -> sales.add(new CashSaleResponse(
                "booking-" + b.getId(),
                b.getBookingCode(),
                b.getTotalAmount(),
                b.getCreatedAt(),
                null,
                "POS"
        )));

        List<CashSaleResponse> refunds = new ArrayList<>();
        List<PosShiftTransaction> transactions = transactionRepository.findByShiftIdOrderByCreatedAtAsc(shift.getId());
        for (PosShiftTransaction tx : transactions) {
            CashSaleResponse item = new CashSaleResponse(
                    "movement-" + tx.getId(),
                    tx.getTicketCode(),
                    tx.getAmount(),
                    tx.getCreatedAt(),
                    tx.getNote(),
                    "MANUAL"
            );
            if (CASH_REFUND.equals(tx.getMovementType())) {
                refunds.add(item);
            } else {
                sales.add(item);
            }
        }

        BigDecimal expectedCash = shift.getInitialCashAmount()
                .add(shift.getTotalCashCollected())
                .subtract(shift.getTotalCashRefunds());

        String code = "CA-" + shift.getOpenedAt().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + String.format("%05d", shift.getId());

        return new PosShiftResponse(
                shift.getId(),
                code,
                shift.getBusCompanyId(),
                shift.getCashierName(),
                shift.getCounterName(),
                shift.getInitialCashAmount(),
                shift.getOpenedAt(),
                shift.getStatus(),
                sales,
                refunds,
                shift.getTotalCashCollected(),
                shift.getTotalCashRefunds(),
                expectedCash,
                shift.getClosedAt(),
                shift.getCountedCashAmount(),
                shift.getCashVariance(),
                CLOSED.equals(shift.getStatus()) ? shift.getNotes() : null
        );
    }

    private String cleanOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}

