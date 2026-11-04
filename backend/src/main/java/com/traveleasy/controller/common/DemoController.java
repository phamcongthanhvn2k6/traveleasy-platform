package com.traveleasy.controller.common;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Controller phục vụ thiết lập dữ liệu mẫu lặp lại, đặt lại trạng thái ghế và kịch bản bảo vệ 15 phút (Sprint 4 - S417 & S421)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/demo")
@RequiredArgsConstructor
@Tag(name = "Demo & Presentation Hub", description = "Các endpoint hỗ trợ thiết lập dữ liệu minh họa lặp lại, phục hồi ghế và kịch bản thuyết trình bảo vệ đồ án OJT")
public class DemoController {

    private final TripRepository tripRepository;
    private final TripSeatRepository tripSeatRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final BusCompanyRepository busCompanyRepository;
    private final RouteRepository routeRepository;

    @GetMapping("/status")
    @Operation(summary = "Kiểm tra tổng quan dữ liệu sẵn sàng cho buổi thuyết trình demo")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDemoStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("totalUsers", userRepository.count());
        status.put("totalBusCompanies", busCompanyRepository.count());
        status.put("totalRoutes", routeRepository.count());
        status.put("totalTrips", tripRepository.count());
        status.put("totalBookings", bookingRepository.count());
        status.put("totalTickets", ticketRepository.count());
        status.put("totalSeats", tripSeatRepository.count());

        List<TripSeat> allSeats = tripSeatRepository.findAll();
        long available = allSeats.stream().filter(s -> s.getStatus() == SeatStatus.AVAILABLE).count();
        long locked = allSeats.stream().filter(s -> s.getStatus() == SeatStatus.LOCKED).count();
        long booked = allSeats.stream().filter(s -> s.getStatus() == SeatStatus.BOOKED).count();

        status.put("seatsAvailable", available);
        status.put("seatsLocked", locked);
        status.put("seatsBooked", booked);
        status.put("readyForDemo", true);

        return ResponseEntity.ok(ApiResponse.success("Trạng thái dữ liệu hệ thống sẵn sàng cho demo", status));
    }

    @PostMapping("/reset-seats")
    @Transactional
    @Operation(summary = "Đặt lại các ghế đang bị khóa tạm thời (LOCKED) về trạng thái TRỐNG (AVAILABLE)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resetLockedSeats(
            @RequestParam(required = false, defaultValue = "false") boolean resetAllBooked,
            @RequestParam(required = false) Long tripId) {

        List<TripSeat> seatsToReset;
        if (tripId != null) {
            seatsToReset = tripSeatRepository.findByTripIdOrderByFloorAscSeatCodeAsc(tripId);
        } else {
            seatsToReset = tripSeatRepository.findAll();
        }

        int count = 0;
        for (TripSeat seat : seatsToReset) {
            if (seat.getStatus() == SeatStatus.LOCKED || (resetAllBooked && seat.getStatus() == SeatStatus.BOOKED)) {
                seat.setStatus(SeatStatus.AVAILABLE);
                count++;
            }
        }
        tripSeatRepository.saveAll(seatsToReset);

        log.info("Demo reset: đã giải phóng {} ghế về trạng thái AVAILABLE", count);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Đã giải phóng thành công %d ghế về trạng thái TRỐNG (AVAILABLE) để sẵn sàng demo", count),
                Map.of("releasedSeatsCount", count, "tripId", tripId != null ? tripId : "ALL")
        ));
    }

    @GetMapping("/trips")
    @Operation(summary = "Lấy danh sách các chuyến xe gần nhất để điều khiển demo trực tiếp")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDemoTrips(
            @RequestParam(required = false, defaultValue = "20") int limit) {
        int maxLimit = Math.max(1, Math.min(limit, 50));
        List<Trip> trips = tripRepository.findAllByOrderByDepartureTimeDesc();

        List<Map<String, Object>> result = trips.stream()
                .limit(maxLimit)
                .map(t -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", t.getId());
                    map.put("route", t.getRoute() != null
                            ? t.getRoute().getDepartureLocation() + " - " + t.getRoute().getArrivalLocation()
                            : "Chưa xác định");
                    map.put("departureLocation", t.getRoute() != null ? t.getRoute().getDepartureLocation() : "");
                    map.put("arrivalLocation", t.getRoute() != null ? t.getRoute().getArrivalLocation() : "");
                    map.put("busCompany", t.getBusCompany() != null ? t.getBusCompany().getName() : "Chưa xác định");
                    map.put("licensePlate", t.getLicensePlate() != null ? t.getLicensePlate() : "");
                    map.put("departureTime", t.getDepartureTime());
                    map.put("totalSeats", t.getTotalSeats() != null ? t.getTotalSeats() : 34);
                    map.put("availableSeats", t.getAvailableSeats() != null ? t.getAvailableSeats() : 0);
                    map.put("price", t.getPrice());
                    map.put("status", t.getStatus() != null ? t.getStatus().name() : "SCHEDULED");
                    map.put("busType", t.getBusType() != null ? t.getBusType().name() : "SLEEPER");
                    return map;
                })
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách chuyến xe demo thành công", result));
    }

    @PostMapping("/trips/{tripId}/set-sold-out")
    @Transactional
    @CacheEvict(value = {"trips_search", "popular_routes", "admin_all_trips", "company_trips"}, allEntries = true)
    @Operation(summary = "Cập nhật chuyến xe sang trạng thái cháy vé (0 ghế trống, toàn bộ ghế BOOKED)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> setSoldOut(@PathVariable Long tripId) {
        return applySeatCount(tripId, 0, "Đã thiết lập chuyến xe sang trạng thái CHÁY VÉ (0 ghế trống) thành công");
    }

    @PostMapping("/trips/{tripId}/reset-seats")
    @Transactional
    @CacheEvict(value = {"trips_search", "popular_routes", "admin_all_trips", "company_trips"}, allEntries = true)
    @Operation(summary = "Khôi phục mở bán lại toàn bộ ghế của chuyến xe về AVAILABLE")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resetTripSeats(@PathVariable Long tripId) {
        Trip trip = tripRepository.findByIdWithDetails(tripId)
                .or(() -> tripRepository.findById(tripId))
                .orElse(null);
        if (trip == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy chuyến xe với mã " + tripId));
        }
        int total = trip.getTotalSeats() != null ? trip.getTotalSeats() : 34;
        return applySeatCount(tripId, total, String.format("Đã khôi phục toàn bộ %d ghế trống mở bán thành công", total));
    }

    @PostMapping("/trips/{tripId}/set-seats")
    @Transactional
    @CacheEvict(value = {"trips_search", "popular_routes", "admin_all_trips", "company_trips"}, allEntries = true)
    @Operation(summary = "Đặt số ghế trống tùy biến của chuyến xe phục vụ kịch bản kiểm thử")
    public ResponseEntity<ApiResponse<Map<String, Object>>> setSeatCount(
            @PathVariable Long tripId,
            @RequestParam(defaultValue = "1") int count) {
        if (count < 0) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Số lượng ghế trống không được nhỏ hơn 0"));
        }
        return applySeatCount(tripId, count, String.format("Đã thiết lập số ghế trống của chuyến xe về %d ghế thành công", count));
    }

    private ResponseEntity<ApiResponse<Map<String, Object>>> applySeatCount(Long tripId, int requestedCount, String successMessage) {
        Trip trip = tripRepository.findByIdWithDetails(tripId)
                .or(() -> tripRepository.findById(tripId))
                .orElse(null);
        if (trip == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Không tìm thấy chuyến xe với mã " + tripId));
        }

        int totalSeats = trip.getTotalSeats() != null ? trip.getTotalSeats() : 34;
        int targetAvailable = Math.max(0, Math.min(requestedCount, totalSeats));
        trip.setAvailableSeats(targetAvailable);
        tripRepository.save(trip);

        List<TripSeat> seats = tripSeatRepository.findByTripIdOrderByFloorAscSeatCodeAsc(tripId);
        if (seats == null || seats.isEmpty()) {
            seats = new ArrayList<>();
            int floor1Count = (totalSeats + 1) / 2;
            for (int i = 1; i <= floor1Count; i++) {
                seats.add(TripSeat.builder()
                        .trip(trip)
                        .seatCode(String.format("A%02d", i))
                        .floor(1)
                        .rowNum((i - 1) / 3 + 1)
                        .colNum((i - 1) % 3 + 1)
                        .seatType("STANDARD")
                        .status(SeatStatus.AVAILABLE)
                        .build());
            }
            for (int i = 1; i <= (totalSeats - floor1Count); i++) {
                seats.add(TripSeat.builder()
                        .trip(trip)
                        .seatCode(String.format("B%02d", i))
                        .floor(2)
                        .rowNum((i - 1) / 3 + 1)
                        .colNum((i - 1) % 3 + 1)
                        .seatType("VIP")
                        .status(SeatStatus.AVAILABLE)
                        .build());
            }
        }

        int updatedAvailable = 0;
        int updatedBooked = 0;
        for (int i = 0; i < seats.size(); i++) {
            TripSeat seat = seats.get(i);
            if (i < targetAvailable) {
                seat.setStatus(SeatStatus.AVAILABLE);
                updatedAvailable++;
            } else {
                seat.setStatus(SeatStatus.BOOKED);
                updatedBooked++;
            }
        }
        tripSeatRepository.saveAll(seats);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("tripId", trip.getId());
        data.put("route", trip.getRoute() != null
                ? trip.getRoute().getDepartureLocation() + " - " + trip.getRoute().getArrivalLocation()
                : "Chưa xác định");
        data.put("departureLocation", trip.getRoute() != null ? trip.getRoute().getDepartureLocation() : "");
        data.put("arrivalLocation", trip.getRoute() != null ? trip.getRoute().getArrivalLocation() : "");
        data.put("busCompany", trip.getBusCompany() != null ? trip.getBusCompany().getName() : "Chưa xác định");
        data.put("licensePlate", trip.getLicensePlate() != null ? trip.getLicensePlate() : "");
        data.put("departureTime", trip.getDepartureTime());
        data.put("totalSeats", totalSeats);
        data.put("availableSeats", targetAvailable);
        data.put("price", trip.getPrice());
        data.put("seatsAvailableCount", updatedAvailable);
        data.put("seatsBookedCount", updatedBooked);

        log.info("Demo control: tripId={}, targetAvailable={}, updatedAvailable={}, updatedBooked={}",
                tripId, targetAvailable, updatedAvailable, updatedBooked);

        return ResponseEntity.ok(ApiResponse.success(successMessage, data));
    }

    @PostMapping("/seed-sample-booking")
    @Transactional
    @Operation(summary = "Tạo một vé xe mẫu đã xác nhận thanh toán kèm mã QR phục vụ quét vé trực tiếp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> seedSampleBooking() {
        String demoBookingCode = "DEMO-TICKET-2026";
        Optional<Booking> existing = bookingRepository.findByBookingCode(demoBookingCode);

        Booking booking;
        Ticket ticket;
        if (existing.isPresent()) {
            booking = existing.get();
            ticket = booking.getTickets().isEmpty() ? null : booking.getTickets().get(0);
        } else {
            List<Trip> trips = tripRepository.findAll();
            if (trips.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Không tìm thấy chuyến xe nào trong hệ thống để tạo vé demo"));
            }
            Trip trip = trips.get(0);

            User customer = userRepository.findByEmail("customer@gmail.com").orElse(null);

            booking = Booking.builder()
                    .user(customer)
                    .trip(trip)
                    .bookingCode(demoBookingCode)
                    .passengerName("Nguyễn Văn Du Khách (Demo)")
                    .passengerPhone("0912345678")
                    .passengerEmail("customer@gmail.com")
                    .pickupPoint("Bến xe Miền Tây, TP.HCM")
                    .dropoffPoint("Bến xe liên tỉnh Đà Lạt")
                    .seatNumbers("A01")
                    .totalAmount(BigDecimal.valueOf(320000))
                    .paymentMethod(PaymentMethod.VNPAY)
                    .status(BookingStatus.CONFIRMED)
                    .createdAt(LocalDateTime.now())
                    .build();
            booking = bookingRepository.save(booking);

            ticket = Ticket.builder()
                    .booking(booking)
                    .ticketCode("DEMO-TK-001")
                    .seatNumber("A01")
                    .price(BigDecimal.valueOf(320000))
                    .qrCodeHash("TE-DEMO-001-VALID")
                    .status(TicketStatus.ISSUED)
                    .createdAt(LocalDateTime.now())
                    .build();
            ticket = ticketRepository.save(ticket);
            booking.getTickets().add(ticket);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("bookingCode", booking.getBookingCode());
        result.put("ticketCode", ticket != null ? ticket.getTicketCode() : "DEMO-TK-001");
        result.put("passengerName", booking.getPassengerName());
        result.put("passengerPhone", booking.getPassengerPhone());
        result.put("qrCodeHash", ticket != null ? ticket.getQrCodeHash() : "TE-DEMO-001-VALID");
        result.put("tripRoute", booking.getTrip().getRoute().getDepartureLocation() + " -> " + booking.getTrip().getRoute().getArrivalLocation());
        result.put("busCompany", booking.getTrip().getBusCompany().getName());
        result.put("instructions", "Sử dụng mã vé 'DEMO-TICKET-2026' để tra cứu tại /lookup hoặc quét mã hash 'TE-DEMO-001-VALID' tại /scanner");

        return ResponseEntity.ok(ApiResponse.success("Đã khởi tạo vé mẫu demo thành công", result));
    }
}
