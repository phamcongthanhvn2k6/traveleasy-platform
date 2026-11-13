package com.traveleasy.service.company;

import com.traveleasy.dto.company.report.ChartDataPointDto;
import com.traveleasy.dto.company.report.CompanyReportSummaryResponse;
import com.traveleasy.dto.company.report.RoutePerformanceDto;
import com.traveleasy.dto.company.report.TripPerformanceDto;
import com.traveleasy.entity.BusCompany;
import com.traveleasy.entity.Trip;
import com.traveleasy.repository.BookingRepository;
import com.traveleasy.repository.BusCompanyRepository;
import com.traveleasy.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * [S310][REPORTS] Dịch vụ Tính Toán Thống Kê Báo Cáo Doanh Thu & Tỷ Lệ Lấp Đầy Ghế Nhà Xe
 * Phục vụ phân hệ /company/reports
 * @author Nguyễn Đại Phát (phatnguyn146)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyReportService {

    private static final BigDecimal PLATFORM_FEE_RATE = BigDecimal.valueOf(0.08); // 8% hoa hồng sàn bất biến
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");
    private static final DateTimeFormatter SHORT_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM");

    private final TripRepository tripRepository;
    private final BookingRepository bookingRepository;
    private final BusCompanyRepository busCompanyRepository;

    @Transactional(readOnly = true)
    public CompanyReportSummaryResponse getCompanyReportSummary(Long busCompanyId, String period) {
        String effectivePeriod = (period != null && !period.isBlank()) ? period.toUpperCase() : "MONTH";

        BusCompany company = busCompanyRepository.findById(busCompanyId).orElse(null);
        String companyName = company != null ? company.getName() : ("Nhà Xe #" + busCompanyId);

        // Lấy toàn bộ chuyến xe của nhà xe
        List<Trip> allTrips = tripRepository.findByBusCompanyIdWithDetails(busCompanyId);

        // Xác định khoảng thời gian lọc
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime filterStart;
        LocalDateTime filterEnd = now.plusDays(30); // Bao gồm cả các chuyến sắp tới trong kỳ

        switch (effectivePeriod) {
            case "7D":
            case "WEEK":
                filterStart = now.minusDays(6).withHour(0).withMinute(0).withSecond(0);
                break;
            case "QUARTER":
                filterStart = now.minusMonths(3).withHour(0).withMinute(0).withSecond(0);
                break;
            case "ALL":
                filterStart = now.minusYears(2);
                break;
            case "MONTH":
            default:
                filterStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
                break;
        }

        // Lọc các chuyến theo thời gian
        List<Trip> targetTrips = allTrips.stream()
                .filter(t -> t.getDepartureTime() != null &&
                        !t.getDepartureTime().isBefore(filterStart) &&
                        !t.getDepartureTime().isAfter(filterEnd))
                .sorted(Comparator.comparing(Trip::getDepartureTime).reversed())
                .collect(Collectors.toList());

        // Nếu danh sách lọc bị rỗng (ví dụ đầu tháng chưa có chuyến), fallback về toàn bộ chuyến để luôn có dữ liệu hiển thị
        if (targetTrips.isEmpty() && !allTrips.isEmpty()) {
            targetTrips = allTrips;
        }

        // 1. Phân tích chi tiết từng chuyến xe (TripPerformanceDto)
        List<TripPerformanceDto> tripDtos = new ArrayList<>();
        Map<String, RoutePerformanceDto> routeMap = new LinkedHashMap<>();

        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalFee = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;
        long totalTickets = 0;
        long totalSeatsAllTrips = 0;
        long peakTripsCount = 0;
        long lowTripsCount = 0;

        for (Trip trip : targetTrips) {
            int totalSeats = trip.getTotalSeats() != null && trip.getTotalSeats() > 0 ? trip.getTotalSeats() : 34;
            int availableSeats = trip.getAvailableSeats() != null ? trip.getAvailableSeats() : totalSeats;
            int bookedSeats = Math.max(0, totalSeats - availableSeats);

            double occupancyRate = totalSeats > 0
                    ? Math.round(((double) bookedSeats / totalSeats) * 1000.0) / 10.0
                    : 0.0;

            BigDecimal unitPrice = trip.getPrice() != null ? trip.getPrice() : BigDecimal.ZERO;
            BigDecimal tripGross = unitPrice.multiply(BigDecimal.valueOf(bookedSeats));
            BigDecimal tripFee = tripGross.multiply(PLATFORM_FEE_RATE).setScale(0, RoundingMode.HALF_UP);
            BigDecimal tripNet = tripGross.subtract(tripFee);

            String occupancyLevel;
            if (occupancyRate >= 80.0) {
                occupancyLevel = "PEAK";
                peakTripsCount++;
            } else if (occupancyRate < 50.0) {
                occupancyLevel = "LOW";
                lowTripsCount++;
            } else {
                occupancyLevel = "NORMAL";
            }

            String routeName = "Tuyến liên tỉnh";
            final String finalRouteId = (trip.getRoute() != null) ? ("R-" + trip.getRoute().getId()) : "R-1";
            if (trip.getRoute() != null) {
                String dep = trip.getRoute().getDepartureLocation() != null ? trip.getRoute().getDepartureLocation() : "Điểm đi";
                String arr = trip.getRoute().getArrivalLocation() != null ? trip.getRoute().getArrivalLocation() : "Điểm đến";
                routeName = dep + " ➔ " + arr;
            }

            String depTimeStr = trip.getDepartureTime() != null ? trip.getDepartureTime().format(DATE_TIME_FORMATTER) : "-";

            TripPerformanceDto tripDto = TripPerformanceDto.builder()
                    .tripId(trip.getId())
                    .tripCode("TRIP-" + trip.getId())
                    .routeName(routeName)
                    .departureTime(depTimeStr)
                    .licensePlate(trip.getLicensePlate() != null ? trip.getLicensePlate() : "51B-123.45")
                    .busType(trip.getBusType() != null ? trip.getBusType().name() : "SLEEPER")
                    .totalSeats(totalSeats)
                    .bookedSeats(bookedSeats)
                    .availableSeats(availableSeats)
                    .occupancyRate(occupancyRate)
                    .price(unitPrice)
                    .grossRevenue(tripGross)
                    .platformFee(tripFee)
                    .netRevenue(tripNet)
                    .status(trip.getStatus() != null ? trip.getStatus().name() : "SCHEDULED")
                    .occupancyLevel(occupancyLevel)
                    .build();

            tripDtos.add(tripDto);

            // Tích lũy KPIs toàn cục
            totalGross = totalGross.add(tripGross);
            totalFee = totalFee.add(tripFee);
            totalNet = totalNet.add(tripNet);
            totalTickets += bookedSeats;
            totalSeatsAllTrips += totalSeats;

            // Nhóm theo tuyến đường (Route Performance)
            RoutePerformanceDto rDto = routeMap.computeIfAbsent(routeName, k -> RoutePerformanceDto.builder()
                    .routeId(finalRouteId)
                    .routeName(k)
                    .tripsCount(0)
                    .totalSeats(0)
                    .bookedSeats(0)
                    .occupancyRate(0.0)
                    .grossRevenue(BigDecimal.ZERO)
                    .platformFee(BigDecimal.ZERO)
                    .netRevenue(BigDecimal.ZERO)
                    .build());

            rDto.setTripsCount(rDto.getTripsCount() + 1);
            rDto.setTotalSeats(rDto.getTotalSeats() + totalSeats);
            rDto.setBookedSeats(rDto.getBookedSeats() + bookedSeats);
            rDto.setGrossRevenue(rDto.getGrossRevenue().add(tripGross));
            rDto.setPlatformFee(rDto.getPlatformFee().add(tripFee));
            rDto.setNetRevenue(rDto.getNetRevenue().add(tripNet));
        }

        // Hoàn thiện tỷ lệ lấp đầy theo tuyến
        for (RoutePerformanceDto rDto : routeMap.values()) {
            if (rDto.getTotalSeats() > 0) {
                double rRate = Math.round(((double) rDto.getBookedSeats() / rDto.getTotalSeats()) * 1000.0) / 10.0;
                rDto.setOccupancyRate(rRate);
            }
        }

        // Tỷ lệ lấp đầy trung bình
        double avgOccupancy = totalSeatsAllTrips > 0
                ? Math.round(((double) totalTickets / totalSeatsAllTrips) * 1000.0) / 10.0
                : 0.0;

        // 2. Tạo chuỗi dữ liệu Biểu đồ (ChartDataPointDto)
        List<ChartDataPointDto> chartPoints = generateChartDataPoints(effectivePeriod, targetTrips);

        return CompanyReportSummaryResponse.builder()
                .busCompanyId(busCompanyId)
                .companyName(companyName)
                .period(effectivePeriod)
                .totalGrossRevenue(totalGross)
                .platformFeeRate(8.0)
                .totalPlatformFee(totalFee)
                .totalNetRevenue(totalNet)
                .totalTickets(totalTickets)
                .totalTrips((long) targetTrips.size())
                .avgOccupancyRate(avgOccupancy)
                .peakTripsCount(peakTripsCount)
                .lowTripsCount(lowTripsCount)
                .chartData(chartPoints)
                .routePerformances(new ArrayList<>(routeMap.values()))
                .tripPerformances(tripDtos)
                .build();
    }

    private List<ChartDataPointDto> generateChartDataPoints(String period, List<Trip> trips) {
        List<ChartDataPointDto> points = new ArrayList<>();
        LocalDate today = LocalDate.now();

        if ("7D".equalsIgnoreCase(period) || "WEEK".equalsIgnoreCase(period)) {
            // 7 ngày gần nhất
            for (int i = 6; i >= 0; i--) {
                LocalDate d = today.minusDays(i);
                String label = d.format(SHORT_DATE_FORMATTER);
                String dateStr = d.toString();

                List<Trip> dayTrips = trips.stream()
                        .filter(t -> t.getDepartureTime() != null && t.getDepartureTime().toLocalDate().isEqual(d))
                        .collect(Collectors.toList());

                points.add(aggregatePoints(label, dateStr, dayTrips));
            }
        } else if ("QUARTER".equalsIgnoreCase(period)) {
            // 3 tháng gần nhất
            for (int i = 2; i >= 0; i--) {
                LocalDate monthDate = today.minusMonths(i);
                String label = "Tháng " + monthDate.getMonthValue();
                String dateStr = monthDate.getYear() + "-" + String.format("%02d", monthDate.getMonthValue());

                List<Trip> monthTrips = trips.stream()
                        .filter(t -> t.getDepartureTime() != null &&
                                t.getDepartureTime().getYear() == monthDate.getYear() &&
                                t.getDepartureTime().getMonthValue() == monthDate.getMonthValue())
                        .collect(Collectors.toList());

                points.add(aggregatePoints(label, dateStr, monthTrips));
            }
        } else {
            // Mặc định Tháng (4 tuần hoặc chia theo tuần)
            for (int week = 1; week <= 4; week++) {
                String label = "Tuần " + week;
                int startDay = (week - 1) * 7 + 1;
                int endDay = week == 4 ? 31 : week * 7;

                List<Trip> weekTrips = trips.stream()
                        .filter(t -> {
                            if (t.getDepartureTime() == null) return false;
                            int day = t.getDepartureTime().getDayOfMonth();
                            return day >= startDay && day <= endDay;
                        })
                        .collect(Collectors.toList());

                points.add(aggregatePoints(label, today.getYear() + "-" + today.getMonthValue() + "-W" + week, weekTrips));
            }
        }

        return points;
    }

    private ChartDataPointDto aggregatePoints(String label, String dateStr, List<Trip> tripsList) {
        BigDecimal gross = BigDecimal.ZERO;
        long bookings = 0;
        int totalSeats = 0;

        for (Trip t : tripsList) {
            int tSeats = t.getTotalSeats() != null && t.getTotalSeats() > 0 ? t.getTotalSeats() : 34;
            int aSeats = t.getAvailableSeats() != null ? t.getAvailableSeats() : tSeats;
            int bSeats = Math.max(0, tSeats - aSeats);
            BigDecimal price = t.getPrice() != null ? t.getPrice() : BigDecimal.ZERO;

            gross = gross.add(price.multiply(BigDecimal.valueOf(bSeats)));
            bookings += bSeats;
            totalSeats += tSeats;
        }

        BigDecimal fee = gross.multiply(PLATFORM_FEE_RATE).setScale(0, RoundingMode.HALF_UP);
        BigDecimal net = gross.subtract(fee);
        double occ = totalSeats > 0 ? Math.round(((double) bookings / totalSeats) * 1000.0) / 10.0 : 0.0;

        return ChartDataPointDto.builder()
                .label(label)
                .date(dateStr)
                .grossRevenue(gross)
                .platformFee(fee)
                .netRevenue(net)
                .bookings(bookings)
                .occupancyRate(occ)
                .build();
    }
}
