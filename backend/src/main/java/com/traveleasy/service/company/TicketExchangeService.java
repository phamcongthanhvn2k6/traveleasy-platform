package com.traveleasy.service.company;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.company.exchange.TicketExchangeRequest;
import com.traveleasy.dto.company.exchange.TicketExchangeResponse;
import com.traveleasy.dto.company.exchange.TicketLookupResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.TicketExchangeLogRepository;
import com.traveleasy.repository.TicketRepository;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.repository.TripSeatRepository;
import com.traveleasy.service.realtime.SeatRealtimeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * [S316] Service xu ly nghiep vu doi ve & chuyen chuyen xe khach
 * - Kiem tra gio khoi hanh >= 12 tieng
 * - Nguyen tu hoan ve cu EXCHANGED va cap ve moi ISSUED
 * - Giai phong ghe cu ve AVAILABLE va khoa dat ghe moi BOOKED
 * - Ghi nhat ky vao bang ticket_exchange_logs
 * @author Tran Minh Duc (minhdctrn13)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TicketExchangeService {

    private final TicketRepository ticketRepository;
    private final TripRepository tripRepository;
    private final TripSeatRepository tripSeatRepository;
    private final TicketExchangeLogRepository ticketExchangeLogRepository;
    private final SeatRealtimeService seatRealtimeService;

    /**
     * Tra cuu ve goc va kiem tra dieu kien doi ve (DoD, AC-S316-01, AC-S316-02)
     */
    @Transactional(readOnly = true)
    public TicketLookupResponse lookupTicket(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Khong tim thay ve voi ma: " + ticketCode));

        // Kiem tra trang thai ve
        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Ve " + ticketCode + " da bi huy truoc do, khong the thuc hien doi chuyen!");
        }
        if (ticket.getStatus() == TicketStatus.USED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Ve " + ticketCode + " da duoc soat len xe (USED), khong the doi ve!");
        }
        if (ticket.getStatus() == TicketStatus.EXCHANGED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Ve " + ticketCode + " da duoc doi sang chuyen khac truoc do!");
        }

        Trip trip = ticket.getBooking() != null ? ticket.getBooking().getTrip() : null;
        LocalDateTime depTime = trip != null ? trip.getDepartureTime() : LocalDateTime.now();
        LocalDateTime now = LocalDateTime.now();

        long hoursUntilDeparture = 0;
        if (depTime != null && depTime.isAfter(now)) {
            hoursUntilDeparture = Duration.between(now, depTime).toHours();
        }

        boolean canExchange = hoursUntilDeparture >= 12;
        String policyNotice = canExchange
                ? "Du dieu kien doi ve (con " + hoursUntilDeparture + " gio truoc khoi hanh, >= 12h)."
                : "Chuyen xe khoi hanh trong vong " + hoursUntilDeparture + " gio nua (< 12 gio). Khong du dieu kien doi ve.";

        String routeName = trip != null && trip.getRoute() != null
                ? trip.getRoute().getDepartureLocation() + " -> " + trip.getRoute().getArrivalLocation()
                : "Tuyen duong";

        return TicketLookupResponse.builder()
                .ticketId(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .bookingCode(ticket.getBooking() != null ? ticket.getBooking().getBookingCode() : null)
                .status(ticket.getStatus().name())
                .customerName(ticket.getBooking() != null ? ticket.getBooking().getPassengerName() : "Khach hang")
                .customerPhone(ticket.getBooking() != null ? ticket.getBooking().getPassengerPhone() : "")
                .tripId(trip != null ? trip.getId() : null)
                .route(routeName)
                .departureTime(depTime)
                .seatNumber(ticket.getSeatNumber())
                .price(ticket.getPrice())
                .canExchange(canExchange)
                .hoursUntilDeparture(hoursUntilDeparture)
                .policyNotice(policyNotice)
                .build();
    }

    /**
     * Tinh toan chenh lech gia giua ve cu va chuyen moi (AC-S316-05)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> calculateDifference(String oldTicketCode, Long newTripId) {
        Ticket oldTicket = ticketRepository.findByTicketCode(oldTicketCode)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Khong tim thay ve cu voi ma: " + oldTicketCode));

        Trip newTrip = tripRepository.findById(newTripId)
                .orElseThrow(() -> new AppException(ErrorCode.TRIP_NOT_FOUND, "Khong tim thay chuyen xe moi voi ID: " + newTripId));

        BigDecimal oldPrice = oldTicket.getPrice() != null ? oldTicket.getPrice() : BigDecimal.ZERO;
        BigDecimal newPrice = newTrip.getPrice() != null ? newTrip.getPrice() : BigDecimal.ZERO;
        BigDecimal priceDiff = newPrice.subtract(oldPrice);

        boolean requiresSurcharge = priceDiff.compareTo(BigDecimal.ZERO) > 0;
        BigDecimal surchargeAmount = requiresSurcharge ? priceDiff : BigDecimal.ZERO;
        BigDecimal refundAmount = priceDiff.compareTo(BigDecimal.ZERO) < 0 ? priceDiff.abs() : BigDecimal.ZERO;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("oldTicketCode", oldTicketCode);
        result.put("oldPrice", oldPrice);
        result.put("newTripId", newTripId);
        result.put("newPrice", newPrice);
        result.put("priceDifference", priceDiff);
        result.put("requiresSurcharge", requiresSurcharge);
        result.put("surchargeAmount", surchargeAmount);
        result.put("refundAmount", refundAmount);
        result.put("exchangeFee", BigDecimal.ZERO);

        return result;
    }

    /**
     * Thuc thi doi ve nguyen tu (DoD 1, 2, 3)
     */
    @Transactional
    public TicketExchangeResponse exchangeTicket(TicketExchangeRequest request, User performedByUser) {
        // 1. Kiem tra ve goc
        Ticket oldTicket = ticketRepository.findByTicketCode(request.getOldTicketCode())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Khong tim thay ve cu voi ma: " + request.getOldTicketCode()));

        if (oldTicket.getStatus() != TicketStatus.ISSUED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Chi co the doi ve o trang thai ISSUED. Trang thai hien tai: " + oldTicket.getStatus());
        }

        Trip oldTrip = oldTicket.getBooking() != null ? oldTicket.getBooking().getTrip() : null;
        if (oldTrip == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Ve cu khong gan voi chuyen xe hop le.");
        }

        // 2. Kiem tra gio khoi hanh >= 12h (AC-S316-02)
        LocalDateTime now = LocalDateTime.now();
        if (oldTrip.getDepartureTime() == null || oldTrip.getDepartureTime().isBefore(now.plusHours(12))) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Chi ho tro doi ve truoc gio khoi hanh toi thieu 12 tieng theo quy dinh.");
        }

        // 3. Kiem tra chuyen xe moi
        Trip newTrip = tripRepository.findById(request.getNewTripId())
                .orElseThrow(() -> new AppException(ErrorCode.TRIP_NOT_FOUND, "Khong tim thay chuyen xe moi voi ID: " + request.getNewTripId()));

        if (newTrip.getDepartureTime() == null || newTrip.getDepartureTime().isBefore(now)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Chuyen xe moi phai co gio khoi hanh trong tuong lai.");
        }

        // 4. Kiem tra ghe moi va Concurrency protection (DoD 3, AC-S316-04)
        TripSeat newSeat = tripSeatRepository.findByTripIdAndSeatCode(newTrip.getId(), request.getNewSeatNumber())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Ghe " + request.getNewSeatNumber() + " khong ton tai tren chuyen xe moi."));

        if (newSeat.getStatus() == SeatStatus.BOOKED) {
            throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED, "Ghe " + request.getNewSeatNumber() + " tren chuyen xe moi da duoc nguoi khac dat!");
        }

        // 5. Giai phong ghe cu ve AVAILABLE (DoD 2)
        TripSeat oldSeat = tripSeatRepository.findByTripIdAndSeatCode(oldTrip.getId(), oldTicket.getSeatNumber()).orElse(null);
        if (oldSeat != null) {
            oldSeat.setStatus(SeatStatus.AVAILABLE);
            tripSeatRepository.save(oldSeat);
            seatRealtimeService.broadcastReleased(oldTrip.getId(), List.of(oldTicket.getSeatNumber()));
        }
        tripRepository.syncAvailableSeats(oldTrip.getId());

        // 6. Dat ghe moi sang BOOKED (DoD 3)
        newSeat.setStatus(SeatStatus.BOOKED);
        tripSeatRepository.save(newSeat);
        seatRealtimeService.removeSeatHolders(newTrip.getId(), List.of(request.getNewSeatNumber()));
        seatRealtimeService.broadcastBooked(newTrip.getId(), List.of(request.getNewSeatNumber()));
        tripRepository.syncAvailableSeats(newTrip.getId());

        // 7. Chuyen trang thai ve cu sang EXCHANGED (AC-S316-03)
        oldTicket.setStatus(TicketStatus.EXCHANGED);
        ticketRepository.save(oldTicket);

        // 8. Tao ve moi (DoD 3)
        String newTicketCode = "TK-EX-" + System.currentTimeMillis() % 10000000;
        BigDecimal newPrice = newTrip.getPrice() != null ? newTrip.getPrice() : BigDecimal.ZERO;

        Ticket newTicket = Ticket.builder()
                .booking(oldTicket.getBooking())
                .ticketCode(newTicketCode)
                .seatNumber(request.getNewSeatNumber())
                .price(newPrice)
                .status(TicketStatus.ISSUED)
                .createdAt(now)
                .build();
        newTicket = ticketRepository.save(newTicket);

        // 9. Tinh toan chenh lech tai chinh (AC-S316-05)
        BigDecimal oldPrice = oldTicket.getPrice() != null ? oldTicket.getPrice() : BigDecimal.ZERO;
        BigDecimal priceDiff = newPrice.subtract(oldPrice);
        BigDecimal surcharge = priceDiff.compareTo(BigDecimal.ZERO) > 0 ? priceDiff : BigDecimal.ZERO;
        BigDecimal refund = priceDiff.compareTo(BigDecimal.ZERO) < 0 ? priceDiff.abs() : BigDecimal.ZERO;

        // 10. Luu log vao bang ticket_exchange_logs (DoD 1)
        Long busCompanyId = oldTrip.getBusCompany() != null ? oldTrip.getBusCompany().getId() : 1L;
        Long performedByUserId = performedByUser != null ? performedByUser.getId() : null;

        TicketExchangeLog logRecord = TicketExchangeLog.builder()
                .busCompanyId(busCompanyId)
                .originalTicketId(oldTicket.getId())
                .newTicketId(newTicket.getId())
                .oldTripId(oldTrip.getId())
                .newTripId(newTrip.getId())
                .oldSeatCode(oldTicket.getSeatNumber())
                .newSeatCode(request.getNewSeatNumber())
                .priceDifference(priceDiff)
                .surchargePaid(surcharge)
                .refundReturned(refund)
                .performedByUserId(performedByUserId)
                .reason(request.getNote())
                .createdAt(now)
                .build();
        logRecord = ticketExchangeLogRepository.save(logRecord);

        // Thong tin tuyen duong
        String oldRoute = oldTrip.getRoute() != null
                ? oldTrip.getRoute().getDepartureLocation() + " -> " + oldTrip.getRoute().getArrivalLocation()
                : "Tuyen cu";
        String newRoute = newTrip.getRoute() != null
                ? newTrip.getRoute().getDepartureLocation() + " -> " + newTrip.getRoute().getArrivalLocation()
                : "Tuyen moi";

        return TicketExchangeResponse.builder()
                .exchangeId(logRecord.getId())
                .status("SUCCESS")
                .message("Doi ve thanh cong! Ve cu da danh dau EXCHANGED va ve moi da duoc kich hoat.")
                .oldTicketCode(oldTicket.getTicketCode())
                .oldTicketStatus(TicketStatus.EXCHANGED.name())
                .newTicketCode(newTicketCode)
                .newSeatCode(request.getNewSeatNumber())
                .newTripId(newTrip.getId())
                .oldPrice(oldPrice)
                .newPrice(newPrice)
                .priceDifference(priceDiff)
                .surchargeAmount(surcharge)
                .refundAmount(refund)
                .exchangeFee(BigDecimal.ZERO)
                .customerName(oldTicket.getBooking() != null ? oldTicket.getBooking().getPassengerName() : "Khach hang")
                .customerPhone(oldTicket.getBooking() != null ? oldTicket.getBooking().getPassengerPhone() : "")
                .oldTripDepartureTime(oldTrip.getDepartureTime())
                .newTripDepartureTime(newTrip.getDepartureTime())
                .oldRoute(oldRoute)
                .newRoute(newRoute)
                .exchangeTime(now)
                .build();
    }
}
