package com.traveleasy.service.company;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.entity.AuditLog;
import com.traveleasy.entity.BusCompany;
import com.traveleasy.entity.PayoutRequest;
import com.traveleasy.entity.SettlementRecord;
import com.traveleasy.repository.AuditLogRepository;
import com.traveleasy.repository.BookingRepository;
import com.traveleasy.repository.BusCompanyRepository;
import com.traveleasy.repository.PayoutRequestRepository;
import com.traveleasy.repository.SettlementRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanySettlementService {

    public static final BigDecimal MIN_PAYOUT_AMOUNT = BigDecimal.valueOf(500_000);
    private static final BigDecimal DEFAULT_COMMISSION_RATE = BigDecimal.valueOf(5.00);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final SettlementRecordRepository settlementRecordRepository;
    private final PayoutRequestRepository payoutRequestRepository;
    private final BusCompanyRepository busCompanyRepository;
    private final BookingRepository bookingRepository;
    private final AuditLogRepository auditLogRepository;

    /**
     * Tự động chốt kỳ đối soát vào 00:05 ngày 01 và ngày 15 hàng tháng.
     */
    @Scheduled(cron = "0 5 0 1,15 * ?")
    @Transactional
    public void closeAndRotatePeriodsOnSchedule() {
        LocalDate today = LocalDate.now();
        PeriodRange previousPeriod = resolvePreviousPeriod(today);
        PeriodRange currentPeriod = resolvePeriodForDate(today);

        List<BusCompany> companies = busCompanyRepository.findAll();
        for (BusCompany company : companies) {
            // 1. Chốt kỳ vừa kết thúc
            SettlementRecord closed = upsertPeriodRecord(company, previousPeriod, false);
            if ("PENDING".equalsIgnoreCase(closed.getStatus())) {
                closed.setStatus(closed.getGrossAmount().compareTo(BigDecimal.ZERO) == 0 ? "COMPLETED" : "RECONCILED");
                closed.setReconciledAt(LocalDateTime.now().format(DT_FMT));
                closed.setUpdatedAt(LocalDateTime.now());
                settlementRecordRepository.save(closed);
            }
            // 2. Khởi tạo kỳ mới với số dư kỳ trước chuyển sang
            upsertPeriodRecord(company, currentPeriod, true);
        }
        log.info("[SETTLEMENT CRON] Đã tự động chốt kỳ {} và mở kỳ mới {} cho {} nhà xe.",
                previousPeriod.codePrefix(), currentPeriod.codePrefix(), companies.size());
    }

    /**
     * Lấy lịch sử đối soát từ bảng settlement_records cho nhà xe, đồng bộ kỳ hiện tại theo dữ liệu thật.
     */
    @Transactional
    public List<Map<String, Object>> getCompanySettlements(Long companyId, String statusFilter) {
        BusCompany company = busCompanyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin nhà xe #" + companyId));

        PeriodRange currentPeriod = resolvePeriodForDate(LocalDate.now());
        List<SettlementRecord> existing = settlementRecordRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);

        String currentCode = buildRecordCode(currentPeriod, company);
        boolean hasCurrent = existing.stream().anyMatch(r -> currentCode.equals(r.getCode()));

        // Chỉ khởi tạo hoặc cập nhật kỳ hiện tại nếu đã có phát sinh doanh thu hoặc đã có lịch sử trước đó
        PeriodStats currentStats = loadPeriodStats(companyId, currentPeriod.startDate(), currentPeriod.endExclusive());
        if (hasCurrent || currentStats.ticketCount() > 0 || !existing.isEmpty()) {
            upsertPeriodRecord(company, currentPeriod, true);
            existing = settlementRecordRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (SettlementRecord record : existing) {
            if (statusFilter != null && !statusFilter.isBlank() && !"ALL".equalsIgnoreCase(statusFilter)) {
                if (!matchesStatusFilter(record.getStatus(), statusFilter)) {
                    continue;
                }
            }
            result.add(toSettlementMap(record, company));
        }
        return result;
    }

    /**
     * Lấy số dư ví khả dụng và lịch sử lệnh rút tiền của nhà xe.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCompanyWallet(Long companyId) {
        BusCompany company = busCompanyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin nhà xe #" + companyId));

        List<SettlementRecord> records = settlementRecordRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
        List<PayoutRequest> payoutRequests = payoutRequestRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);

        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalCommission = BigDecimal.ZERO;
        BigDecimal totalEarnedNet = BigDecimal.ZERO;
        BigDecimal totalSettledPaid = BigDecimal.ZERO;
        BigDecimal unsettledNet = BigDecimal.ZERO;

        for (SettlementRecord r : records) {
            BigDecimal gross = safe(r.getGrossAmount());
            BigDecimal fee = safe(r.getPlatformCommission());
            BigDecimal net = safe(r.getNetPayable());
            totalGross = totalGross.add(gross);
            totalCommission = totalCommission.add(fee);
            totalEarnedNet = totalEarnedNet.add(net);
            if (isCompletedStatus(r.getStatus())) {
                totalSettledPaid = totalSettledPaid.add(net);
            } else {
                unsettledNet = unsettledNet.add(net);
            }
        }

        BigDecimal pendingPayoutAmount = safe(payoutRequestRepository.sumPendingAmountByCompanyId(companyId));
        BigDecimal availableBalance = unsettledNet.subtract(pendingPayoutAmount).max(BigDecimal.ZERO);

        Map<String, Object> wallet = new LinkedHashMap<>();
        wallet.put("companyId", company.getId());
        wallet.put("companyName", company.getName());
        wallet.put("commissionRate", resolveCommissionRate(company));
        wallet.put("minPayoutAmount", MIN_PAYOUT_AMOUNT);
        wallet.put("totalGross", totalGross);
        wallet.put("totalCommission", totalCommission);
        wallet.put("totalEarnedNet", totalEarnedNet);
        wallet.put("totalPaidOut", totalSettledPaid);
        wallet.put("pendingPayoutAmount", pendingPayoutAmount);
        wallet.put("availableBalance", availableBalance);
        wallet.put("bankAccount", buildBankInfo(company));
        wallet.put("payoutRequests", payoutRequests.stream().map(this::toPayoutMap).toList());
        return wallet;
    }

    /**
     * Tạo lệnh rút tiền (Payout Request) với hạn mức tối thiểu 500,000 VNĐ và kiểm tra số dư khả dụng.
     */
    @Transactional
    public Map<String, Object> createPayoutRequest(Long companyId, BigDecimal amount, String note, String userEmail) {
        if (amount == null || amount.compareTo(MIN_PAYOUT_AMOUNT) < 0) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "Số tiền rút tối thiểu là 500.000 VNĐ cho mỗi lệnh tất toán.");
        }

        BusCompany company = busCompanyRepository.findById(companyId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy thông tin nhà xe #" + companyId));

        // Đảm bảo kỳ hiện tại đã được đồng bộ trước khi tính số dư khả dụng
        PeriodRange currentPeriod = resolvePeriodForDate(LocalDate.now());
        PeriodStats currentStats = loadPeriodStats(companyId, currentPeriod.startDate(), currentPeriod.endExclusive());
        if (currentStats.ticketCount() > 0) {
            upsertPeriodRecord(company, currentPeriod, true);
        }

        BigDecimal availableBalance = (BigDecimal) getCompanyWallet(companyId).get("availableBalance");
        if (amount.compareTo(availableBalance) > 0) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    String.format("Số dư khả dụng (%s VNĐ) không đủ cho yêu cầu rút %s VNĐ.",
                            availableBalance.toPlainString(), amount.toPlainString()));
        }

        Map<String, String> bank = buildBankInfo(company);
        String reqCode = "PO-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-"
                + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        PayoutRequest payout = PayoutRequest.builder()
                .requestCode(reqCode)
                .company(company)
                .amount(amount.setScale(2, RoundingMode.HALF_UP))
                .bankName(bank.get("bankName"))
                .bankAccountNumber(bank.get("accountNumber"))
                .bankAccountOwner(bank.get("accountHolder"))
                .status("PENDING")
                .note(note != null && !note.isBlank() ? note.trim() : "Đề nghị tất toán doanh thu về tài khoản ngân hàng đối tác")
                .requestedBy(userEmail != null ? userEmail : "partner@traveleasy.vn")
                .createdAt(LocalDateTime.now())
                .build();

        PayoutRequest saved = payoutRequestRepository.save(payout);

        auditLogRepository.save(AuditLog.builder()
                .userEmail(saved.getRequestedBy())
                .action("CREATE_PAYOUT_REQUEST")
                .target("payout_requests #" + saved.getRequestCode())
                .beforeState("availableBalance=" + availableBalance.toPlainString())
                .afterState("amount=" + saved.getAmount().toPlainString() + ", status=PENDING")
                .build());

        return toPayoutMap(saved);
    }

    SettlementRecord upsertPeriodRecord(BusCompany company, PeriodRange period, boolean syncIfPending) {
        String code = buildRecordCode(period, company);
        Optional<SettlementRecord> existingOpt = settlementRecordRepository.findByCompanyIdAndCode(company.getId(), code);
        if (existingOpt.isPresent()) {
            SettlementRecord existing = existingOpt.get();
            if (!syncIfPending || !"PENDING".equalsIgnoreCase(existing.getStatus())) {
                return existing;
            }
            return populateAmounts(existing, company, period);
        }

        String id = "ds-" + company.getId() + "-" + period.codePrefix().toLowerCase();
        SettlementRecord created = SettlementRecord.builder()
                .id(id)
                .code(code)
                .periodCode(code)
                .company(company)
                .periodName(period.periodName())
                .startDate(period.startDate().format(DATE_FMT))
                .endDate(period.endInclusive().format(DATE_FMT))
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();
        return populateAmounts(created, company, period);
    }

    private SettlementRecord populateAmounts(SettlementRecord record, BusCompany company, PeriodRange period) {
        PeriodStats stats = loadPeriodStats(company.getId(), period.startDate(), period.endExclusive());
        BigDecimal previousBalance = computePreviousUnsettledBalance(company.getId(), record.getCode());
        BigDecimal rate = resolveCommissionRate(company);
        BigDecimal commission = stats.grossAmount()
                .multiply(rate)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal net = stats.grossAmount().subtract(commission);

        record.setPreviousBalance(previousBalance);
        record.setTicketCount((int) stats.ticketCount());
        record.setGrossAmount(stats.grossAmount());
        record.setCustomerPaid(stats.customerPaid());
        record.setPlatformSubsidy(stats.platformSubsidy());
        record.setCommissionRate(rate.setScale(0, RoundingMode.HALF_UP).intValue());
        record.setPlatformCommission(commission);
        record.setNetPayable(net);
        record.setUpdatedAt(LocalDateTime.now());
        return settlementRecordRepository.save(record);
    }

    private BigDecimal computePreviousUnsettledBalance(Long companyId, String excludeCode) {
        List<SettlementRecord> records = settlementRecordRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
        BigDecimal sum = BigDecimal.ZERO;
        for (SettlementRecord r : records) {
            if (!excludeCode.equals(r.getCode()) && !isCompletedStatus(r.getStatus())) {
                sum = sum.add(safe(r.getNetPayable()));
            }
        }
        return sum;
    }

    private PeriodStats loadPeriodStats(Long companyId, LocalDate start, LocalDate endExclusive) {
        List<Object[]> rows = bookingRepository.getCompanyStatsInPeriod(
                companyId, start.atStartOfDay(), endExclusive.atStartOfDay());
        if (rows == null || rows.isEmpty()) {
            return new PeriodStats(0L, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        }
        Object[] row = rows.get(0);
        long count = row[0] != null ? ((Number) row[0]).longValue() : 0L;
        BigDecimal gross = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
        BigDecimal paid = row[2] != null ? (BigDecimal) row[2] : gross;
        BigDecimal subsidy = row[3] != null ? (BigDecimal) row[3] : BigDecimal.ZERO;
        return new PeriodStats(count, gross, paid, subsidy);
    }

    static PeriodRange resolvePeriodForDate(LocalDate date) {
        YearMonth ym = YearMonth.from(date);
        if (date.getDayOfMonth() <= 15) {
            LocalDate start = ym.atDay(1);
            LocalDate endInc = ym.atDay(15);
            return new PeriodRange(
                    String.format("DS-%04d%02d-P1", date.getYear(), date.getMonthValue()),
                    String.format("Kỳ 1 - Tháng %02d/%04d", date.getMonthValue(), date.getYear()),
                    start, endInc, endInc.plusDays(1));
        }
        LocalDate start = ym.atDay(16);
        LocalDate endInc = ym.atEndOfMonth();
        return new PeriodRange(
                String.format("DS-%04d%02d-P2", date.getYear(), date.getMonthValue()),
                String.format("Kỳ 2 - Tháng %02d/%04d", date.getMonthValue(), date.getYear()),
                start, endInc, endInc.plusDays(1));
    }

    static PeriodRange resolvePreviousPeriod(LocalDate today) {
        if (today.getDayOfMonth() < 15) {
            YearMonth prev = YearMonth.from(today).minusMonths(1);
            return resolvePeriodForDate(prev.atEndOfMonth());
        }
        return resolvePeriodForDate(today.withDayOfMonth(1));
    }

    private BigDecimal resolveCommissionRate(BusCompany company) {
        if (company.getCommissionRate() != null && company.getCommissionRate().compareTo(BigDecimal.ZERO) >= 0) {
            return company.getCommissionRate();
        }
        return DEFAULT_COMMISSION_RATE;
    }

    private String buildRecordCode(PeriodRange period, BusCompany company) {
        String compCode = (company.getCode() != null && !company.getCode().isBlank())
                ? company.getCode().trim().toUpperCase()
                : ("BC" + company.getId());
        return period.codePrefix() + "-" + compCode;
    }

    private boolean isCompletedStatus(String status) {
        return "PAID".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status);
    }

    private boolean matchesStatusFilter(String recordStatus, String filter) {
        if ("COMPLETED".equalsIgnoreCase(filter) || "PAID".equalsIgnoreCase(filter)) {
            return isCompletedStatus(recordStatus);
        }
        return filter.equalsIgnoreCase(recordStatus);
    }

    private Map<String, Object> toSettlementMap(SettlementRecord r, BusCompany company) {
        BigDecimal prev = safe(r.getPreviousBalance());
        BigDecimal net = safe(r.getNetPayable());
        BigDecimal rate = company.getCommissionRate() != null
                ? company.getCommissionRate()
                : BigDecimal.valueOf(r.getCommissionRate() != null ? r.getCommissionRate() : 5);

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", r.getId());
        map.put("code", r.getCode());
        map.put("periodName", r.getPeriodName());
        map.put("startDate", r.getStartDate());
        map.put("endDate", r.getEndDate());
        map.put("ticketCount", r.getTicketCount());
        map.put("previousBalance", prev);
        map.put("grossAmount", safe(r.getGrossAmount()));
        map.put("platformSubsidy", safe(r.getPlatformSubsidy()));
        map.put("customerPaid", safe(r.getCustomerPaid()));
        map.put("platformFeeRate", rate);
        map.put("platformFeeAmount", safe(r.getPlatformCommission()));
        map.put("netReceived", net);
        map.put("totalWithPrevious", prev.add(net));
        map.put("guaranteeNote", "Sàn TravelEasy tài trợ 100% voucher khuyến mãi. Hoa hồng áp dụng theo hợp đồng riêng của nhà xe.");
        map.put("status", r.getStatus());
        map.put("reconciledAt", r.getReconciledAt());
        map.put("paidAt", r.getPaidAt());
        map.put("payoutTxHash", r.getPayoutTxHash());
        map.put("payoutNote", r.getPayoutNote());
        return map;
    }

    private Map<String, Object> toPayoutMap(PayoutRequest p) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getId());
        map.put("requestCode", p.getRequestCode());
        map.put("amount", p.getAmount());
        map.put("bankName", p.getBankName());
        map.put("bankAccountNumber", p.getBankAccountNumber());
        map.put("bankAccountOwner", p.getBankAccountOwner());
        map.put("status", p.getStatus());
        map.put("note", p.getNote());
        map.put("requestedBy", p.getRequestedBy());
        map.put("createdAt", p.getCreatedAt());
        map.put("processedAt", p.getProcessedAt());
        return map;
    }

    private Map<String, String> buildBankInfo(BusCompany c) {
        Map<String, String> bank = new LinkedHashMap<>();
        bank.put("bankName", (c.getBankName() != null && !c.getBankName().isBlank())
                ? c.getBankName() : "Vietcombank - Chi nhánh TP.HCM");
        bank.put("accountNumber", (c.getBankAccountNumber() != null && !c.getBankAccountNumber().isBlank())
                ? c.getBankAccountNumber() : "Chưa cập nhật STK");
        bank.put("accountHolder", (c.getBankAccountOwner() != null && !c.getBankAccountOwner().isBlank())
                ? c.getBankAccountOwner().toUpperCase() : c.getName().toUpperCase());
        return bank;
    }

    private BigDecimal safe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    record PeriodRange(String codePrefix, String periodName, LocalDate startDate, LocalDate endInclusive, LocalDate endExclusive) {}
    record PeriodStats(long ticketCount, BigDecimal grossAmount, BigDecimal customerPaid, BigDecimal platformSubsidy) {}
}
