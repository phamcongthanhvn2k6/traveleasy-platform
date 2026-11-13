package com.traveleasy.service.company;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.company.expense.CompanyExpenseSummaryResponse;
import com.traveleasy.dto.company.expense.SaveTripExpenseRequest;
import com.traveleasy.dto.company.expense.TripProfitLossResponse;
import com.traveleasy.entity.Trip;
import com.traveleasy.entity.TripExpense;
import com.traveleasy.repository.BookingRepository;
import com.traveleasy.repository.TripExpenseRepository;
import com.traveleasy.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TripExpenseServiceImpl implements TripExpenseService {

    private final TripExpenseRepository tripExpenseRepository;
    private final TripRepository tripRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional(readOnly = true)
    public TripProfitLossResponse getTripProfitLoss(Long tripId, Long companyId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new AppException(ErrorCode.TRIP_NOT_FOUND, "Chuyến xe không tồn tại: " + tripId));

        if (trip.getBusCompany() == null || !trip.getBusCompany().getId().equals(companyId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền truy cập thông tin chi phí của chuyến xe này");
        }

        Optional<TripExpense> expenseOpt = tripExpenseRepository.findByTripId(trip.getId());
        BigDecimal actualRevenue = bookingRepository.sumRevenueByTripId(trip.getId());
        return mapExpenseToResponse(trip, expenseOpt.orElse(null), actualRevenue);
    }

    @Override
    @Transactional
    public TripProfitLossResponse saveTripExpense(Long tripId, Long companyId, SaveTripExpenseRequest request) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new AppException(ErrorCode.TRIP_NOT_FOUND, "Chuyến xe không tồn tại: " + tripId));

        if (trip.getBusCompany() == null || !trip.getBusCompany().getId().equals(companyId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền cập nhật chi phí của chuyến xe này");
        }

        Optional<TripExpense> existingOpt = tripExpenseRepository.findByTripId(tripId);
        if (existingOpt.isPresent() && Boolean.TRUE.equals(existingOpt.get().getIsLocked())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "SỔ CHI PHÍ ĐÃ KHÓA: Chuyến xe đã được khóa sổ tài chính. Không thể chỉnh sửa!");
        }

        LocalDateTime completionTime = trip.getArrivalTime() != null ? trip.getArrivalTime() : trip.getDepartureTime();
        if (completionTime != null && completionTime.isBefore(LocalDateTime.now().minusHours(48))) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "SỔ CHI PHÍ ĐÃ KHÓA: Chuyến xe đã kết thúc quá 48 giờ. Nghiêm cấm chỉnh sửa bổ sung chi phí!");
        }

        TripExpense expense = existingOpt.orElseGet(() -> TripExpense.builder()
                .trip(trip)
                .busCompany(trip.getBusCompany())
                .build());

        expense.setTrip(trip);
        expense.setBusCompany(trip.getBusCompany());
        expense.setFuelCost(request.getFuelCost() != null ? request.getFuelCost() : BigDecimal.ZERO);
        expense.setTollBotCost(request.getTollBotCost() != null ? request.getTollBotCost() : BigDecimal.ZERO);
        expense.setDriverSalary(request.getDriverSalary() != null ? request.getDriverSalary() : BigDecimal.ZERO);
        expense.setTerminalFee(request.getTerminalFee() != null ? request.getTerminalFee() : BigDecimal.ZERO);
        expense.setOtherCosts(request.getOtherCosts() != null ? request.getOtherCosts() : BigDecimal.ZERO);
        expense.setInvoiceNumber(request.getInvoiceNumber());
        expense.setNotes(request.getNotes());

        TripExpense savedExpense = tripExpenseRepository.save(expense);
        BigDecimal actualRevenue = bookingRepository.sumRevenueByTripId(trip.getId());
        return mapExpenseToResponse(trip, savedExpense, actualRevenue);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyExpenseSummaryResponse getCompanyExpenseSummary(Long companyId) {
        // 1. Batch query 1: Lấy danh sách Trip kèm Route và BusCompany (Tránh N+1 Lazy load)
        List<Trip> trips = tripRepository.findByBusCompanyIdWithDetails(companyId);
        if (trips == null || trips.isEmpty()) {
            trips = tripRepository.findByBusCompanyId(companyId);
        }

        // 2. Batch query 2: Lấy toàn bộ TripExpense của nhà xe trong 1 câu query
        List<TripExpense> expenses = tripExpenseRepository.findByBusCompanyId(companyId);
        Map<Long, TripExpense> expenseMap = (expenses != null) ? expenses.stream()
                .filter(e -> e.getTrip() != null && e.getTrip().getId() != null)
                .collect(Collectors.toMap(e -> e.getTrip().getId(), e -> e, (e1, e2) -> e1))
                : Collections.emptyMap();

        // 3. Batch query 3: Lấy tổng doanh thu theo từng chuyến xe trong 1 câu GROUP BY
        List<Object[]> revenueRows = bookingRepository.sumRevenueGroupedByTripId(companyId);
        Map<Long, BigDecimal> revenueMap = new HashMap<>();
        if (revenueRows != null) {
            for (Object[] row : revenueRows) {
                if (row != null && row.length >= 2 && row[0] != null) {
                    Long tId = ((Number) row[0]).longValue();
                    BigDecimal rev = (row[1] instanceof BigDecimal) ? (BigDecimal) row[1] : (row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO);
                    revenueMap.put(tId, rev != null ? rev : BigDecimal.ZERO);
                }
            }
        }

        List<TripProfitLossResponse> tripResponses = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        int lossCount = 0;

        for (Trip trip : trips) {
            BigDecimal actualRevenue = revenueMap.getOrDefault(trip.getId(), BigDecimal.ZERO);
            TripExpense expense = expenseMap.get(trip.getId());
            TripProfitLossResponse res = mapExpenseToResponse(trip, expense, actualRevenue);

            tripResponses.add(res);
            if (res.getActualRevenue() != null) {
                totalRevenue = totalRevenue.add(res.getActualRevenue());
            }
            if (res.getTotalExpense() != null) {
                totalExpense = totalExpense.add(res.getTotalExpense());
            }
            if (Boolean.TRUE.equals(res.getIsLoss())) {
                lossCount++;
            }
        }

        BigDecimal totalNetProfit = totalRevenue.subtract(totalExpense);
        Double overallMarginPercent = 0.0;
        if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal margin = totalNetProfit.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            overallMarginPercent = Math.round(margin.doubleValue() * 100.0) / 100.0;
        }

        return CompanyExpenseSummaryResponse.builder()
                .trips(tripResponses)
                .totalRevenue(totalRevenue)
                .totalExpense(totalExpense)
                .totalNetProfit(totalNetProfit)
                .overallMarginPercent(overallMarginPercent)
                .lossTripsCount(lossCount)
                .build();
    }

    private TripProfitLossResponse mapExpenseToResponse(Trip trip, TripExpense expense, BigDecimal actualRevenue) {
        if (actualRevenue == null) {
            actualRevenue = BigDecimal.ZERO;
        }

        BigDecimal fuelCost = BigDecimal.ZERO;
        BigDecimal tollBotCost = BigDecimal.ZERO;
        BigDecimal driverSalary = BigDecimal.ZERO;
        BigDecimal terminalFee = BigDecimal.ZERO;
        BigDecimal otherCosts = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        String invoiceNumber = null;
        String notes = null;

        if (expense != null) {
            fuelCost = expense.getFuelCost() != null ? expense.getFuelCost() : BigDecimal.ZERO;
            tollBotCost = expense.getTollBotCost() != null ? expense.getTollBotCost() : BigDecimal.ZERO;
            driverSalary = expense.getDriverSalary() != null ? expense.getDriverSalary() : BigDecimal.ZERO;
            terminalFee = expense.getTerminalFee() != null ? expense.getTerminalFee() : BigDecimal.ZERO;
            otherCosts = expense.getOtherCosts() != null ? expense.getOtherCosts() : BigDecimal.ZERO;
            totalExpense = fuelCost.add(tollBotCost).add(driverSalary).add(terminalFee).add(otherCosts);
            invoiceNumber = expense.getInvoiceNumber();
            notes = expense.getNotes();
        }

        BigDecimal netProfit = actualRevenue.subtract(totalExpense);
        boolean isLoss = netProfit.compareTo(BigDecimal.ZERO) < 0;
        BigDecimal lossAmount = isLoss ? netProfit.abs() : BigDecimal.ZERO;

        Double marginPercent = 0.0;
        if (actualRevenue.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal margin = netProfit.divide(actualRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
            marginPercent = Math.round(margin.doubleValue() * 100.0) / 100.0;
        }

        String routeName = null;
        if (trip.getRoute() != null) {
            routeName = trip.getRoute().getDepartureLocation() + " - " + trip.getRoute().getArrivalLocation();
        }

        // Tính cờ khóa sổ: Bản ghi đã chốt sổ (is_locked = true) HOẶC Chuyến xe kết thúc quá 48 giờ
        LocalDateTime completionTime = trip.getArrivalTime() != null ? trip.getArrivalTime() : trip.getDepartureTime();
        boolean isOverdue = completionTime != null && completionTime.isBefore(LocalDateTime.now().minusHours(48));
        boolean isRecordLocked = expense != null && Boolean.TRUE.equals(expense.getIsLocked());
        boolean effectiveLocked = isRecordLocked || isOverdue;

        String lockNotice;
        if (effectiveLocked) {
            lockNotice = isOverdue
                    ? "Sổ chi phí đã bị khóa: Chuyến xe đã kết thúc quá 48 giờ."
                    : "Sổ chi phí đã bị khóa: Đã chốt kỳ đối soát tài chính.";
        } else {
            lockNotice = "Sổ chi phí còn mở. Có thể điều chỉnh hóa đơn trong vòng 48h sau chuyến đi.";
        }

        return TripProfitLossResponse.builder()
                .tripId(trip.getId())
                .tripCode("TRIP-" + trip.getId())
                .routeName(routeName)
                .licensePlate(trip.getLicensePlate())
                .departureTime(trip.getDepartureTime())
                .arrivalTime(trip.getArrivalTime())
                .tripStatus(trip.getStatus() != null ? trip.getStatus().name() : null)
                .actualRevenue(actualRevenue)
                .fuelCost(fuelCost)
                .tollBotCost(tollBotCost)
                .driverSalary(driverSalary)
                .terminalFee(terminalFee)
                .otherCosts(otherCosts)
                .totalExpense(totalExpense)
                .netProfit(netProfit)
                .isLoss(isLoss)
                .lossAmount(lossAmount)
                .profitMarginPercent(marginPercent)
                .invoiceNumber(invoiceNumber)
                .notes(notes)
                .isLocked(effectiveLocked)
                .accessScope("CONFIDENTIAL_OWNER_ONLY")
                .lockNotice(lockNotice)
                .build();
    }
}
