package com.traveleasy.controller.conductor;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.conductor.ConductorSeatManifestResponse;
import com.traveleasy.dto.conductor.ValidateTicketResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.TicketRepository;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.repository.TripSeatRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * [S320] Giao Diện Điện Thoại Quét Mã QR Soát Vé Cho Phụ Xe (/conductor/scanner)
 * Đã khắc phục BUG-NEW-05: Cung cấp Trip Manifest Pre-caching cho phép quét vé Offline khi xe đi qua vùng mất sóng 4G
 * @author Đoàn Nhật Cường (CuongLiam)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/conductor/scanner")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Conductor Ticket Scanner", description = "[S320] Quét mã QR soát vé khách lên xe thời gian thực - Đoàn Nhật Cường")
public class ConductorScannerController {

    private final TicketRepository ticketRepository;
    private final TripRepository tripRepository;
    private final TripSeatRepository tripSeatRepository;

    @GetMapping("/trips/{tripId}/manifest")
    @Transactional(readOnly = true)
    @Operation(summary = "Tải toàn bộ danh sách vé và sơ đồ ghế của chuyến xe để lưu cache Offline vào LocalStorage (DoD & BUG-NEW-05)")
    public ApiResponse<ConductorSeatManifestResponse> getTripManifestForOfflineScan(@PathVariable Long tripId) {
        Trip trip = tripRepository.findByIdWithDetails(tripId).orElse(null);
        String routeName = (trip != null && trip.getRoute() != null)
                ? (trip.getRoute().getDepartureLocation() + " ➔ " + trip.getRoute().getArrivalLocation())
                : "Chuyến xe #" + tripId;
        String licensePlate = (trip != null && trip.getLicensePlate() != null) ? trip.getLicensePlate() : "51B-888.88";

        List<Ticket> tickets = ticketRepository.findByBookingTripId(tripId);
        Map<String, Ticket> ticketBySeat = new HashMap<>();
        for (Ticket t : tickets) {
            if (t.getSeatNumber() != null) {
                ticketBySeat.put(t.getSeatNumber().trim().toUpperCase(), t);
            }
        }

        List<TripSeat> seats = tripSeatRepository.findByTripIdOrderByFloorAscSeatCodeAsc(tripId);
        List<ConductorSeatManifestResponse.ConductorSeatItem> seatItems = new ArrayList<>();

        int checkedInCount = 0;
        int pendingCount = 0;

        if (seats != null && !seats.isEmpty()) {
            for (TripSeat s : seats) {
                String code = s.getSeatCode().trim().toUpperCase();
                Ticket t = ticketBySeat.get(code);

                boolean occupied = (t != null && t.getStatus() != TicketStatus.CANCELLED);
                boolean isCheckedIn = (t != null && t.getStatus() == TicketStatus.USED);

                if (isCheckedIn) {
                    checkedInCount++;
                } else if (occupied) {
                    pendingCount++;
                }

                String passName = (t != null && t.getBooking() != null) ? t.getBooking().getPassengerName() : null;
                String passPhone = (t != null && t.getBooking() != null) ? t.getBooking().getPassengerPhone() : null;
                String tCode = (t != null) ? t.getTicketCode() : null;

                seatItems.add(ConductorSeatManifestResponse.ConductorSeatItem.builder()
                        .seatCode(code)
                        .floor(s.getFloor() != null ? s.getFloor() : 1)
                        .seatType(s.getSeatType() != null ? s.getSeatType() : "STANDARD")
                        .occupied(occupied)
                        .checkedIn(isCheckedIn)
                        .ticketCode(tCode)
                        .passengerName(passName)
                        .passengerPhone(passPhone)
                        .build());
            }
        } else {
            // Fallback danh sách nếu chưa sinh trip_seats
            for (Ticket t : tickets) {
                boolean isCheckedIn = (t.getStatus() == TicketStatus.USED);
                if (isCheckedIn) checkedInCount++;
                else pendingCount++;

                seatItems.add(ConductorSeatManifestResponse.ConductorSeatItem.builder()
                        .seatCode(t.getSeatNumber())
                        .floor(1)
                        .seatType("STANDARD")
                        .occupied(true)
                        .checkedIn(isCheckedIn)
                        .ticketCode(t.getTicketCode())
                        .passengerName(t.getBooking() != null ? t.getBooking().getPassengerName() : "Hành khách")
                        .passengerPhone(t.getBooking() != null ? t.getBooking().getPassengerPhone() : "090***")
                        .build());
            }
        }

        ConductorSeatManifestResponse response = ConductorSeatManifestResponse.builder()
                .tripId(tripId)
                .route(routeName)
                .licensePlate(licensePlate)
                .totalSeats(seatItems.size())
                .checkedInCount(checkedInCount)
                .pendingCount(pendingCount)
                .seats(seatItems)
                .build();

        return ApiResponse.success(response);
    }

    @PostMapping("/validate")
    @Transactional
    @Operation(summary = "Kiểm tra tính hợp lệ và cập nhật check_in_status = 'CHECKED_IN' (DoD S320)")
    public ApiResponse<ValidateTicketResponse> validateTicket(
            @RequestParam String qrCodeOrTicketCode,
            @RequestParam(required = false) Long currentTripId) {

        String rawCode = qrCodeOrTicketCode != null ? qrCodeOrTicketCode.trim() : "";
        if (rawCode.isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Mã vé hoặc mã QR không được để trống!");
        }

        // Dùng phương thức có lock hoặc query chuẩn
        Ticket ticket = ticketRepository.findByCodeOrQrHashForUpdate(rawCode)
                .orElse(ticketRepository.findByCodeOrQrHash(rawCode).orElse(null));

        if (ticket == null) {
            ValidateTicketResponse res = ValidateTicketResponse.builder()
                    .valid(false)
                    .checkInStatus("NOT_FOUND")
                    .validationColor("RED")
                    .ticketCode(rawCode)
                    .message("Vé không tồn tại trên hệ thống!")
                    .build();
            return ApiResponse.success("Vé không tồn tại", res);
        }

        Booking booking = ticket.getBooking();
        Trip trip = (booking != null) ? booking.getTrip() : null;
        String routeName = (trip != null && trip.getRoute() != null)
                ? (trip.getRoute().getDepartureLocation() + " ➔ " + trip.getRoute().getArrivalLocation())
                : "Không xác định";

        String passName = (booking != null) ? booking.getPassengerName() : "Hành khách";
        String passPhone = (booking != null) ? booking.getPassengerPhone() : "";
        Long tripId = (trip != null) ? trip.getId() : null;

        // 1. Kiểm tra nếu vé sai chuyến/sai ngày (Màu VÀNG)
        if (currentTripId != null && tripId != null && !currentTripId.equals(tripId)) {
            ValidateTicketResponse res = ValidateTicketResponse.builder()
                    .valid(false)
                    .checkInStatus("INVALID_TRIP")
                    .validationColor("YELLOW")
                    .ticketCode(ticket.getTicketCode())
                    .seatNumber(ticket.getSeatNumber())
                    .passengerName(passName)
                    .passengerPhone(passPhone)
                    .tripId(tripId)
                    .tripRoute(routeName)
                    .departureTime(trip != null ? trip.getDepartureTime() : null)
                    .ticketPrice(ticket.getPrice())
                    .message("CẢNH BÁO: Vé thuộc chuyến xe #" + tripId + " (" + routeName + "), không trùng khớp chuyến hiện tại (#" + currentTripId + ")!")
                    .build();
            return ApiResponse.success("Vé sai chuyến", res);
        }

        // 2. Kiểm tra nếu vé đã dùng / trùng lặp (Màu ĐỎ)
        if (ticket.getStatus() == TicketStatus.USED) {
            ValidateTicketResponse res = ValidateTicketResponse.builder()
                    .valid(false)
                    .checkInStatus("ALREADY_CHECKED_IN")
                    .validationColor("RED")
                    .ticketCode(ticket.getTicketCode())
                    .seatNumber(ticket.getSeatNumber())
                    .passengerName(passName)
                    .passengerPhone(passPhone)
                    .tripId(tripId)
                    .tripRoute(routeName)
                    .departureTime(trip != null ? trip.getDepartureTime() : null)
                    .ticketPrice(ticket.getPrice())
                    .message("CẢNH BÁO ĐỎ: Vé " + ticket.getTicketCode() + " (Ghế " + ticket.getSeatNumber() + ") ĐÃ ĐƯỢC SOÁT LÊN XE TRƯỚC ĐÓ!")
                    .build();
            return ApiResponse.success("Vé đã soát trước đó", res);
        }

        // 3. Kiểm tra vé bị hủy hoặc đã đổi
        if (ticket.getStatus() == TicketStatus.CANCELLED || ticket.getStatus() == TicketStatus.EXCHANGED) {
            ValidateTicketResponse res = ValidateTicketResponse.builder()
                    .valid(false)
                    .checkInStatus(ticket.getStatus().name())
                    .validationColor("RED")
                    .ticketCode(ticket.getTicketCode())
                    .seatNumber(ticket.getSeatNumber())
                    .passengerName(passName)
                    .passengerPhone(passPhone)
                    .tripId(tripId)
                    .tripRoute(routeName)
                    .departureTime(trip != null ? trip.getDepartureTime() : null)
                    .ticketPrice(ticket.getPrice())
                    .message("CẢNH BÁO: Vé này đã ở trạng thái " + ticket.getStatus() + ", không còn hiệu lực lên xe!")
                    .build();
            return ApiResponse.success("Vé không còn hiệu lực", res);
        }

        // 4. Vé hợp lệ (Màu XANH LÁ) -> Cập nhật check_in_status = 'CHECKED_IN' (TicketStatus.USED)
        ticket.setStatus(TicketStatus.USED);
        ticketRepository.save(ticket);

        ValidateTicketResponse res = ValidateTicketResponse.builder()
                .valid(true)
                .checkInStatus("CHECKED_IN")
                .validationColor("GREEN")
                .ticketCode(ticket.getTicketCode())
                .seatNumber(ticket.getSeatNumber())
                .passengerName(passName)
                .passengerPhone(passPhone)
                .tripId(tripId)
                .tripRoute(routeName)
                .departureTime(trip != null ? trip.getDepartureTime() : null)
                .ticketPrice(ticket.getPrice())
                .message("VÉ HỢP LỆ! Đã xác nhận khách " + passName + " lên ghế " + ticket.getSeatNumber() + " thành công.")
                .build();

        return ApiResponse.success("Soát vé thành công", res);
    }

    @PostMapping("/verify-ticket")
    @Transactional
    @Operation(summary = "Endpoint tương thích ngược cho các client cũ (chuyển tiếp sang validate)")
    public ApiResponse<Map<String, Object>> verifyTicket(
            @RequestParam String qrCodeOrTicketCode,
            @RequestParam(required = false) Long currentTripId) {

        ApiResponse<ValidateTicketResponse> val = validateTicket(qrCodeOrTicketCode, currentTripId);
        ValidateTicketResponse d = val.getData();

        if (!d.isValid()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, d.getMessage());
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("valid", true);
        result.put("ticketCode", d.getTicketCode());
        result.put("seatNumber", d.getSeatNumber());
        result.put("status", "USED");
        result.put("message", d.getMessage());

        return ApiResponse.success(result);
    }
}
