package com.traveleasy.service.automation;

import com.traveleasy.entity.*;
import com.traveleasy.repository.BusCompanyRepository;
import com.traveleasy.repository.RouteRepository;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.repository.TripSeatRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class TripAutomationService {

    private final TripRepository tripRepository;
    private final TripSeatRepository tripSeatRepository;
    private final RouteRepository routeRepository;
    private final BusCompanyRepository busCompanyRepository;
    private final org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    public record RouteScheduleTemplate(
            String origin,
            String destination,
            String companyName,
            List<String> dailySlots,
            BusType busType,
            BigDecimal price,
            double durationHours
    ) {}

    private static final List<RouteScheduleTemplate> DEFAULT_TEMPLATES = List.of(
            // 1. TP.HCM <-> Đà Lạt
            new RouteScheduleTemplate(
                    "TP. Hồ Chí Minh", "Đà Lạt", "TravelEasy Express",
                    List.of("00:30", "04:30", "07:00", "09:30", "11:00", "13:30", "15:30", "18:00", "22:30", "23:00"),
                    BusType.LIMOUSINE, BigDecimal.valueOf(390000), 6.5
            ),
            new RouteScheduleTemplate(
                    "Đà Lạt", "TP. Hồ Chí Minh", "TravelEasy Express",
                    List.of("00:30", "04:30", "07:00", "09:30", "11:00", "13:30", "15:30", "18:00", "22:30", "23:00"),
                    BusType.LIMOUSINE, BigDecimal.valueOf(390000), 6.5
            ),
            // 2. Hà Nội <-> Sa Pa
            new RouteScheduleTemplate(
                    "Hà Nội", "Sa Pa", "Sao Việt",
                    List.of("00:30", "05:00", "06:30", "09:00", "13:00", "15:30", "22:00", "23:00"),
                    BusType.LIMOUSINE, BigDecimal.valueOf(450000), 5.5
            ),
            new RouteScheduleTemplate(
                    "Sa Pa", "Hà Nội", "Sao Việt",
                    List.of("00:30", "04:30", "07:00", "10:30", "13:30", "16:00", "22:00", "23:00"),
                    BusType.LIMOUSINE, BigDecimal.valueOf(450000), 5.5
            ),
            // 3. TP.HCM <-> Nha Trang
            new RouteScheduleTemplate(
                    "TP. Hồ Chí Minh", "Nha Trang", "Phương Trang FUTA Bus Lines",
                    List.of("07:30", "11:00", "13:30", "17:45", "22:30", "23:00"),
                    BusType.SLEEPER, BigDecimal.valueOf(320000), 8.0
            ),
            // 4. TP.HCM <-> Vũng Tàu
            new RouteScheduleTemplate(
                    "TP. Hồ Chí Minh", "Vũng Tàu", "Hoa Mai Limousine",
                    List.of("06:00", "07:30", "09:30", "11:30", "13:30", "15:30", "17:00", "19:00"),
                    BusType.LIMOUSINE, BigDecimal.valueOf(190000), 2.0
            ),
            new RouteScheduleTemplate(
                    "Vũng Tàu", "TP. Hồ Chí Minh", "Hoa Mai Limousine",
                    List.of("06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"),
                    BusType.LIMOUSINE, BigDecimal.valueOf(190000), 2.0
            ),
            // 5. Hà Nội <-> Hải Phòng
            new RouteScheduleTemplate(
                    "Hà Nội", "Hải Phòng", "DCar Limousine VIP",
                    List.of("06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"),
                    BusType.LIMOUSINE, BigDecimal.valueOf(220000), 1.5
            ),
            // 6. Đà Nẵng <-> Quy Nhơn
            new RouteScheduleTemplate(
                    "Đà Nẵng", "Quy Nhơn", "An Phú Quý Limousine",
                    List.of("07:00", "13:15", "19:30"),
                    BusType.SLEEPER, BigDecimal.valueOf(300000), 5.5
            )
    );

    /**
     * Tự động chạy khi khởi động hệ thống:
     * 1. Cập nhật trạng thái các chuyến trong quá khứ thành COMPLETED
     * 2. Tự động sinh chuyến mở bán cho 30 ngày tiếp theo
     */
    @PostConstruct
    public void initializeAutomation() {
        log.info("🚀 [TripAutomationService] Khởi động động cơ tự động hóa lịch chạy xe ngầm...");
        // Chạy bất đồng bộ hoàn toàn để KHÔNG chặn tiến trình khởi động server
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                if (transactionTemplate != null) {
                    transactionTemplate.executeWithoutResult(status -> {
                        expirePastTrips();
                    });
                }
                long scheduledCount = tripRepository.countByStatus(TripStatus.SCHEDULED);
                if (scheduledCount < 20) {
                    log.info("Số chuyến hiện tại ({}) ít hơn 20, tiến hành sinh bổ sung lịch chạy...", scheduledCount);
                    ensureTripsForDateRange(LocalDate.now(), LocalDate.now().plusDays(7));
                } else {
                    log.info("Hệ thống đã có {} chuyến xe mở bán trên Supabase. Sẵn sàng!", scheduledCount);
                }
            } catch (Exception e) {
                log.warn("Lỗi tự động hóa chạy ngầm: {}", e.getMessage());
            }
        });
    }

    /**
     * Tự động chạy định kỳ lúc 01:00 sáng mỗi ngày:
     * - Đóng các chuyến đã qua giờ khởi hành hôm qua
     * - Đảm bảo luôn duy trì cửa sổ 30 ngày chuyến xe mở bán trong tương lai
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void dailyMidnightMaintenance() {
        log.info("⏰ [TripAutomationService] Thực hiện bảo trì định kỳ lúc nửa đêm...");
        expirePastTrips();
        ensureTripsForDateRange(LocalDate.now(), LocalDate.now().plusDays(30));
    }

    /**
     * Cập nhật trạng thái các chuyến có giờ khởi hành trong quá khứ thành COMPLETED
     * Tối ưu hóa: Dùng câu lệnh JPQL UPDATE trực tiếp thay vì load toàn bộ Entity về RAM
     */
    @Transactional
    public int expirePastTrips() {
        LocalDateTime now = LocalDateTime.now();
        int updated = tripRepository.markPastTripsAsCompleted(now);
        if (updated > 0) {
            log.info("✅ [TripAutomationService] Đã tự động cập nhật {} chuyến xe quá hạn thành COMPLETED (JPQL Batch)", updated);
        }
        return updated;
    }

    /**
     * Tự động sinh chuyến xe cho một dải ngày (mặc định 30 ngày tới)
     */
    @Transactional
    public int ensureTripsForDateRange(LocalDate fromDate, LocalDate toDate) {
        int createdCount = 0;
        LocalDate current = fromDate;

        while (!current.isAfter(toDate)) {
            for (RouteScheduleTemplate tmpl : DEFAULT_TEMPLATES) {
                createdCount += generateTripsForTemplateOnDate(tmpl, current);
            }
            current = current.plusDays(1);
        }

        if (createdCount > 0) {
            log.info("🎉 [TripAutomationService] Tự động sinh thành công {} chuyến xe mới từ {} đến {}", createdCount, fromDate, toDate);
        }
        return createdCount;
    }

    /**
     * On-Demand: Tự động sinh chuyến ngay khi khách hàng tìm kiếm một ngày trong tương lai chưa có chuyến
     */
    @org.springframework.scheduling.annotation.Async
    @Transactional
    public void ensureTripsForRouteAndDate(String origin, String destination, LocalDate date) {
        if (date.isBefore(LocalDate.now())) {
            return;
        }

        for (RouteScheduleTemplate tmpl : DEFAULT_TEMPLATES) {
            boolean matchOrigin = origin == null || tmpl.origin.toLowerCase().contains(origin.toLowerCase()) || origin.toLowerCase().contains(tmpl.origin.toLowerCase());
            boolean matchDest = destination == null || tmpl.destination.toLowerCase().contains(destination.toLowerCase()) || destination.toLowerCase().contains(tmpl.destination.toLowerCase());

            if (matchOrigin && matchDest) {
                generateTripsForTemplateOnDate(tmpl, date);
            }
        }
    }

    /**
     * Tự động sinh chuyến theo yêu cầu của Nhà xe (Batch Generation từ Company Portal)
     */
    @Transactional
    public int batchGenerateForCompany(Long busCompanyId, Long routeId, int daysAhead, List<String> timeSlots, BusType busType, BigDecimal price) {
        BusCompany company = busCompanyRepository.findById(busCompanyId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhà xe ID: " + busCompanyId));

        List<Route> routes = routeId != null
                ? List.of(routeRepository.findById(routeId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tuyến ID: " + routeId)))
                : routeRepository.findAll();

        int count = 0;
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(Math.max(1, daysAhead));

        List<String> slots = (timeSlots != null && !timeSlots.isEmpty())
                ? timeSlots
                : List.of("07:00", "13:30", "22:30");

        BusType actualType = busType != null ? busType : BusType.LIMOUSINE;
        BigDecimal actualPrice = (price != null && price.compareTo(BigDecimal.ZERO) > 0) ? price : BigDecimal.valueOf(350000);

        for (Route route : routes) {
            LocalDate cur = start;
            while (!cur.isAfter(end)) {
                for (String slot : slots) {
                    try {
                        String[] parts = slot.split(":");
                        int hour = Integer.parseInt(parts[0].trim());
                        int minute = Integer.parseInt(parts[1].trim());

                        LocalDateTime depTime = cur.atTime(hour, minute);
                        if (depTime.isBefore(LocalDateTime.now())) {
                            continue;
                        }

                        if (!tripRepository.existsByRouteIdAndDepartureTime(route.getId(), depTime)) {
                            double durHours = route.getDurationHours() != null ? route.getDurationHours().doubleValue() : 6.0;
                            LocalDateTime arrTime = depTime.plusMinutes((long) (durHours * 60));

                            Trip trip = Trip.builder()
                                    .route(route)
                                    .busCompany(company)
                                    .departureTime(depTime)
                                    .arrivalTime(arrTime)
                                    .busType(actualType)
                                    .price(actualPrice)
                                    .totalSeats(34)
                                    .availableSeats(34)
                                    .licensePlate(generatePlate(company.getId()))
                                    .status(TripStatus.SCHEDULED)
                                    .build();

                            Trip saved = tripRepository.save(trip);
                            seedSeatsForTrip(saved);
                            count++;
                        }
                    } catch (Exception e) {
                        log.warn("Lỗi khi sinh chuyến {}: {}", slot, e.getMessage());
                    }
                }
                cur = cur.plusDays(1);
            }
        }

        return count;
    }

    private int generateTripsForTemplateOnDate(RouteScheduleTemplate tmpl, LocalDate date) {
        Optional<Route> routeOpt = routeRepository.findByDepartureLocationAndArrivalLocation(tmpl.origin, tmpl.destination);
        if (routeOpt.isEmpty()) {
            List<Route> candidates = routeRepository.findByDepartureLocationContainingIgnoreCase(tmpl.origin);
            routeOpt = candidates.stream()
                    .filter(r -> r.getArrivalLocation().toLowerCase().contains(tmpl.destination.toLowerCase()))
                    .findFirst();
        }

        if (routeOpt.isEmpty()) {
            return 0;
        }

        Route route = routeOpt.get();
        BusCompany company = busCompanyRepository.findByName(tmpl.companyName)
                .orElseGet(() -> busCompanyRepository.findAll().stream().findFirst().orElse(null));

        if (company == null) {
            return 0;
        }

        int created = 0;
        for (String slot : tmpl.dailySlots) {
            try {
                String[] parts = slot.split(":");
                int hour = Integer.parseInt(parts[0].trim());
                int minute = Integer.parseInt(parts[1].trim());

                LocalDateTime depTime = date.atTime(hour, minute);
                if (depTime.isBefore(LocalDateTime.now())) {
                    continue; // Không sinh chuyến đã qua trong ngày hôm nay
                }

                if (!tripRepository.existsByRouteIdAndDepartureTime(route.getId(), depTime)) {
                    LocalDateTime arrTime = depTime.plusMinutes((long) (tmpl.durationHours * 60));

                    Trip trip = Trip.builder()
                            .route(route)
                            .busCompany(company)
                            .departureTime(depTime)
                            .arrivalTime(arrTime)
                            .busType(tmpl.busType)
                            .price(tmpl.price)
                            .totalSeats(34)
                            .availableSeats(34)
                            .licensePlate(generatePlate(company.getId()))
                            .status(TripStatus.SCHEDULED)
                            .build();

                    Trip saved = tripRepository.save(trip);
                    seedSeatsForTrip(saved);
                    created++;
                }
            } catch (Exception e) {
                log.warn("Lỗi sinh chuyến {}: {}", slot, e.getMessage());
            }
        }
        return created;
    }

    private void seedSeatsForTrip(Trip trip) {
        List<TripSeat> seats = new ArrayList<>();
        // Tầng 1: A01 - A17
        for (int i = 1; i <= 17; i++) {
            seats.add(TripSeat.builder()
                    .trip(trip)
                    .seatCode(String.format("A%02d", i))
                    .floor(1)
                    .rowNum((i + 1) / 2)
                    .colNum(i % 2 == 1 ? 1 : 2)
                    .status(SeatStatus.AVAILABLE)
                    .build());
        }
        // Tầng 2: B01 - B17
        for (int i = 1; i <= 17; i++) {
            seats.add(TripSeat.builder()
                    .trip(trip)
                    .seatCode(String.format("B%02d", i))
                    .floor(2)
                    .rowNum((i + 1) / 2)
                    .colNum(i % 2 == 1 ? 1 : 2)
                    .status(SeatStatus.AVAILABLE)
                    .build());
        }
        tripSeatRepository.saveAll(seats);
    }

    private String generatePlate(Long companyId) {
        int prefix = 51 + (int) (companyId != null ? companyId % 30 : 0);
        int num = 10000 + (int) (Math.random() * 89999);
        return String.format("%dB-%03d.%02d", prefix, num / 100, num % 100);
    }
}
