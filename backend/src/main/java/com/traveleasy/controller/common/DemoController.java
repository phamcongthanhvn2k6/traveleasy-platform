package com.traveleasy.controller.common;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
