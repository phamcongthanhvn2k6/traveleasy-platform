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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

        return buildProfitLossResponse(trip);
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
        return mapExpenseToResponse(trip, savedExpense);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyExpenseSummaryResponse getCompanyExpenseSummary(Long companyId) {
        List<Trip> trips = tripRepository.findByBusCompanyId(companyId);
        List<TripProfitLossResponse> tripResponses = new ArrayList<>();

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        int lossCount = 0;

        for (Trip trip : trips) {
            TripProfitLossResponse res = buildProfitLossResponse(trip);
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

    private TripProfitLossResponse buildProfitLossResponse(Trip trip) {
        Optional<TripExpense> expenseOpt = tripExpenseRepository.findByTripId(trip.getId());
        return mapExpenseToResponse(trip, expenseOpt.orElse(null));
    }

    private TripProfitLossResponse mapExpenseToResponse(Trip trip, TripExpense expense) {
        BigDecimal actualRevenue = bookingRepository.sumRevenueByTripId(trip.getId());
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
        boolean isLocked = false;

        if (expense != null) {
            fuelCost = expense.getFuelCost() != null ? expense.getFuelCost() : BigDecimal.ZERO;
            tollBotCost = expense.getTollBotCost() != null ? expense.getTollBotCost() : BigDecimal.ZERO;
            driverSalary = expense.getDriverSalary() != null ? expense.getDriverSalary() : BigDecimal.ZERO;
            terminalFee = expense.getTerminalFee() != null ? expense.getTerminalFee() : BigDecimal.ZERO;
            otherCosts = expense.getOtherCosts() != null ? expense.getOtherCosts() : BigDecimal.ZERO;
            totalExpense = fuelCost.add(tollBotCost).add(driverSalary).add(terminalFee).add(otherCosts);
            invoiceNumber = expense.getInvoiceNumber();
            notes = expense.getNotes();
            isLocked = Boolean.TRUE.equals(expense.getIsLocked());
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
                .isLocked(isLocked)
                .accessScope("CONFIDENTIAL_OWNER_ONLY")
                .lockNotice(isLocked
                        ? "Sổ chi phí đã bị khóa. Không thể chỉnh sửa."
                        : "Sổ chi phí còn mở. Có thể điều chỉnh hóa đơn trong vòng 48h sau chuyến đi.")
                .build();
    }
}
