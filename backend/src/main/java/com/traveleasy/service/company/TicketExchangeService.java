package com.traveleasy.service.company;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.company.exchange.TicketExchangeRequest;
import com.traveleasy.dto.company.exchange.TicketExchangeResponse;
import com.traveleasy.dto.company.exchange.TicketLookupResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.BookingRepository;
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
import java.util.UUID;

/**
 * [S316] Service xử lý nghiệp vụ đổi vé & chuyển chuyến xe khách
 * - Kiểm tra giờ khởi hành >= 12 tiếng
 * - Bảo mật Multi-Tenancy và phân quyền Sub-Account RBAC
 * - Chống race condition với khóa bi quan và chặn trạng thái BOOKED / LOCKED
 * - Tách Booking mới gắn chuyến mới và sinh mã QR Hash độc lập
 * - Nguyên tử hoàn vé cũ EXCHANGED và cấp vé mới ISSUED
 * - Giải phóng ghế cũ về AVAILABLE và khóa đặt ghế mới BOOKED
 * - Ghi nhật ký vào bảng ticket_exchange_logs
 * @author Trần Minh Đức (tranduc2601)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TicketExchangeService {

    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;
    private final TripRepository tripRepository;
    private final TripSeatRepository tripSeatRepository;
    private final TicketExchangeLogRepository ticketExchangeLogRepository;
    private final SeatRealtimeService seatRealtimeService;

    /**
     * Tra cứu vé gốc và kiểm tra điều kiện đổi vé (DoD, AC-S316-01, AC-S316-02)
     */
    @Transactional(readOnly = true)
    public TicketLookupResponse lookupTicket(String ticketCode) {
        return lookupTicket(ticketCode, null);
    }

    /**
     * Tra cứu vé gốc có kiểm tra quyền nhà xe đối tác (Multi-Tenancy)
     */
    @Transactional(readOnly = true)
    public TicketLookupResponse lookupTicket(String ticketCode, Long authenticatedCompanyId) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy vé với mã: " + ticketCode));

        // Kiểm tra phân lập nhà xe nếu có ngữ cảnh xác thực
        Trip trip = ticket.getBooking() != null ? ticket.getBooking().getTrip() : null;
        if (trip != null && trip.getBusCompany() != null && authenticatedCompanyId != null) {
            if (!authenticatedCompanyId.equals(trip.getBusCompany().getId())) {
                log.warn("Truy cập IDOR chéo nhà xe: Công ty {} cố tra cứu vé {} thuộc công ty {}",
                        authenticatedCompanyId, ticketCode, trip.getBusCompany().getId());
                throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên vé của nhà xe khác!");
            }
        }

        // Kiểm tra trạng thái vé
        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Vé " + ticketCode + " đã bị hủy trước đó, không thể thực hiện đổi chuyến!");
        }
        if (ticket.getStatus() == TicketStatus.USED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Vé " + ticketCode + " đã được soát lên xe (USED), không thể đổi vé!");
        }
        if (ticket.getStatus() == TicketStatus.EXCHANGED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Vé " + ticketCode + " đã được đổi sang chuyến khác trước đó!");
        }

        LocalDateTime depTime = trip != null ? trip.getDepartureTime() : LocalDateTime.now();
        LocalDateTime now = LocalDateTime.now();

        long hoursUntilDeparture = 0;
        if (depTime != null && depTime.isAfter(now)) {
            hoursUntilDeparture = Duration.between(now, depTime).toHours();
        }

        boolean canExchange = hoursUntilDeparture >= 12;
        String policyNotice = canExchange
                ? "Đủ điều kiện đổi vé (còn " + hoursUntilDeparture + " giờ trước khởi hành, >= 12h)."
                : "Chuyến xe khởi hành trong vòng " + hoursUntilDeparture + " giờ nữa (< 12 giờ). Không đủ điều kiện đổi vé.";

        String routeName = trip != null && trip.getRoute() != null
                ? trip.getRoute().getDepartureLocation() + " -> " + trip.getRoute().getArrivalLocation()
                : "Tuyến đường";

        return TicketLookupResponse.builder()
                .ticketId(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .bookingCode(ticket.getBooking() != null ? ticket.getBooking().getBookingCode() : null)
                .status(ticket.getStatus().name())
                .customerName(ticket.getBooking() != null ? ticket.getBooking().getPassengerName() : "Khách hàng")
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
     * Tính toán chênh lệch giá giữa vé cũ và chuyến mới (AC-S316-05)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> calculateDifference(String oldTicketCode, Long newTripId) {
        return calculateDifference(oldTicketCode, newTripId, null);
    }

    /**
     * Tính toán chênh lệch giá có kiểm tra bảo mật nhà xe
     */
    @Transactional(readOnly = true)
    public Map<String, Object> calculateDifference(String oldTicketCode, Long newTripId, Long authenticatedCompanyId) {
        Ticket oldTicket = ticketRepository.findByTicketCode(oldTicketCode)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy vé cũ với mã: " + oldTicketCode));

        Trip newTrip = tripRepository.findById(newTripId)
                .orElseThrow(() -> new AppException(ErrorCode.TRIP_NOT_FOUND, "Không tìm thấy chuyến xe mới với ID: " + newTripId));

        Trip oldTrip = oldTicket.getBooking() != null ? oldTicket.getBooking().getTrip() : null;
        if (authenticatedCompanyId != null) {
            if (oldTrip != null && oldTrip.getBusCompany() != null && !authenticatedCompanyId.equals(oldTrip.getBusCompany().getId())) {
                throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên vé của nhà xe khác!");
            }
            if (newTrip.getBusCompany() != null && !authenticatedCompanyId.equals(newTrip.getBusCompany().getId())) {
                throw new AppException(ErrorCode.FORBIDDEN, "Không thể chuyển sang chuyến xe của nhà xe khác!");
            }
        }

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
     * Thực thi đổi vé nguyên tử (DoD 1, 2, 3)
     */
    @Transactional
    public TicketExchangeResponse exchangeTicket(TicketExchangeRequest request, User performedByUser) {
        // 1. Kiểm tra vé gốc
        Ticket oldTicket = ticketRepository.findByTicketCode(request.getOldTicketCode())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy vé cũ với mã: " + request.getOldTicketCode()));

        if (oldTicket.getStatus() != TicketStatus.ISSUED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Chỉ có thể đổi vé ở trạng thái ISSUED. Trạng thái hiện tại: " + oldTicket.getStatus());
        }

        Trip oldTrip = oldTicket.getBooking() != null ? oldTicket.getBooking().getTrip() : null;
        if (oldTrip == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Vé cũ không gắn với chuyến xe hợp lệ.");
        }

        // Kiểm tra phân quyền và phân lập nhà xe Multi-Tenancy (DoD 5, Review Point #2)
        Long companyId = performedByUser != null ? performedByUser.getBusCompanyId() : null;
        if (companyId != null) {
            if (oldTrip.getBusCompany() != null && !companyId.equals(oldTrip.getBusCompany().getId())) {
                log.warn("Truy cập trái phép: Nhân viên công ty {} cố đổi vé thuộc công ty {}",
                        companyId, oldTrip.getBusCompany().getId());
                throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên vé của nhà xe khác!");
            }
        }

        // 2. Kiểm tra giờ khởi hành >= 12h (AC-S316-02)
        LocalDateTime now = LocalDateTime.now();
        if (oldTrip.getDepartureTime() == null || oldTrip.getDepartureTime().isBefore(now.plusHours(12))) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Chỉ hỗ trợ đổi vé trước giờ khởi hành tối thiểu 12 tiếng theo quy định.");
        }

        // 3. Kiểm tra chuyến xe mới
        Trip newTrip = tripRepository.findById(request.getNewTripId())
                .orElseThrow(() -> new AppException(ErrorCode.TRIP_NOT_FOUND, "Không tìm thấy chuyến xe mới với ID: " + request.getNewTripId()));

        if (companyId != null && newTrip.getBusCompany() != null && !companyId.equals(newTrip.getBusCompany().getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Không thể đổi vé sang chuyến xe của nhà xe khác!");
        }

        if (newTrip.getDepartureTime() == null || newTrip.getDepartureTime().isBefore(now)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Chuyến xe mới phải có giờ khởi hành trong tương lai.");
        }

        if (oldTrip.getId().equals(newTrip.getId()) && request.getNewSeatNumber().equalsIgnoreCase(oldTicket.getSeatNumber())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Bạn đang chọn lại chính xác chuyến xe và vị trí ghế hiện tại. Vui lòng chọn chuyến xe khác hoặc vị trí ghế khác để thực hiện đổi vé.");
        }

        // 4. Kiểm tra ghế mới và Concurrency protection với khóa bi quan (DoD 3, AC-S316-04, Review Point #3)
        TripSeat newSeat = tripSeatRepository.findByTripIdAndSeatCodeWithLock(newTrip.getId(), request.getNewSeatNumber())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Ghế " + request.getNewSeatNumber() + " không tồn tại trên chuyến xe mới."));

        if (newSeat.getStatus() != SeatStatus.AVAILABLE) {
            throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED, "Ghế " + request.getNewSeatNumber() + " trên chuyến xe mới đã có người đặt hoặc đang được giữ chỗ!");
        }

        // 5. Giải phóng ghế cũ về AVAILABLE (DoD 2)
        TripSeat oldSeat = tripSeatRepository.findByTripIdAndSeatCode(oldTrip.getId(), oldTicket.getSeatNumber()).orElse(null);
        if (oldSeat != null) {
            oldSeat.setStatus(SeatStatus.AVAILABLE);
            tripSeatRepository.save(oldSeat);
            seatRealtimeService.broadcastReleased(oldTrip.getId(), List.of(oldTicket.getSeatNumber()));
        }
        tripRepository.syncAvailableSeats(oldTrip.getId());

        // 6. Đặt ghế mới sang BOOKED (DoD 3)
        newSeat.setStatus(SeatStatus.BOOKED);
        tripSeatRepository.save(newSeat);
        seatRealtimeService.removeSeatHolders(newTrip.getId(), List.of(request.getNewSeatNumber()));
        seatRealtimeService.broadcastBooked(newTrip.getId(), List.of(request.getNewSeatNumber()));
        tripRepository.syncAvailableSeats(newTrip.getId());

        // 7. Chuyển trạng thái vé cũ sang EXCHANGED (AC-S316-03)
        oldTicket.setStatus(TicketStatus.EXCHANGED);
        ticketRepository.save(oldTicket);

        // 8. Tạo Booking mới cho chuyến mới & Vé mới độc lập có mã QR (Review Point #1, #4)
        BigDecimal newPrice = newTrip.getPrice() != null ? newTrip.getPrice() : BigDecimal.ZERO;
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        long timestamp = System.currentTimeMillis();
        String newBookingCode = "BK-EX-" + timestamp + "-" + randomSuffix;
        String newTicketCode = "TK-EX-" + timestamp + "-" + randomSuffix;
        String qrCodeHash = UUID.randomUUID().toString().replace("-", "");

        Booking oldBooking = oldTicket.getBooking();
        Booking newBooking = Booking.builder()
                .user(oldBooking != null ? oldBooking.getUser() : null)
                .trip(newTrip)
                .bookingCode(newBookingCode)
                .passengerName(oldBooking != null ? oldBooking.getPassengerName() : "Khách hàng")
                .passengerPhone(oldBooking != null ? oldBooking.getPassengerPhone() : "")
                .passengerEmail(oldBooking != null ? oldBooking.getPassengerEmail() : "")
                .pickupPoint(oldBooking != null ? oldBooking.getPickupPoint() : null)
                .dropoffPoint(oldBooking != null ? oldBooking.getDropoffPoint() : null)
                .seatNumbers(request.getNewSeatNumber())
                .totalAmount(newPrice)
                .originalAmount(newPrice)
                .discountAmount(BigDecimal.ZERO)
                .insuranceAmount(BigDecimal.ZERO)
                .paymentMethod(oldBooking != null ? oldBooking.getPaymentMethod() : PaymentMethod.COD)
                .status(BookingStatus.CONFIRMED)
                .createdAt(now)
                .build();
        newBooking = bookingRepository.save(newBooking);

        Ticket newTicket = Ticket.builder()
                .booking(newBooking)
                .ticketCode(newTicketCode)
                .seatNumber(request.getNewSeatNumber())
                .price(newPrice)
                .qrCodeHash(qrCodeHash)
                .status(TicketStatus.ISSUED)
                .createdAt(now)
                .build();
        newTicket = ticketRepository.save(newTicket);

        // 9. Tính toán chênh lệch tài chính (AC-S316-05)
        BigDecimal oldPrice = oldTicket.getPrice() != null ? oldTicket.getPrice() : BigDecimal.ZERO;
        BigDecimal priceDiff = newPrice.subtract(oldPrice);
        BigDecimal surcharge = priceDiff.compareTo(BigDecimal.ZERO) > 0 ? priceDiff : BigDecimal.ZERO;
        BigDecimal refund = priceDiff.compareTo(BigDecimal.ZERO) < 0 ? priceDiff.abs() : BigDecimal.ZERO;

        // 10. Lưu log vào bảng ticket_exchange_logs (DoD 1)
        Long busCompanyId = oldTrip.getBusCompany() != null ? oldTrip.getBusCompany().getId() : 1L;
        Long performedByUserId = performedByUser != null ? performedByUser.getId() : null;

        String exchangeReason = (request.getNote() != null && !request.getNote().isBlank())
                ? request.getNote().trim()
                : "Đổi vé theo yêu cầu hành khách";

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
                .reason(exchangeReason)
                .createdAt(now)
                .build();
        logRecord = ticketExchangeLogRepository.save(logRecord);

        // Thông tin tuyến đường
        String oldRoute = oldTrip.getRoute() != null
                ? oldTrip.getRoute().getDepartureLocation() + " -> " + oldTrip.getRoute().getArrivalLocation()
                : "Tuyến cũ";
        String newRoute = newTrip.getRoute() != null
                ? newTrip.getRoute().getDepartureLocation() + " -> " + newTrip.getRoute().getArrivalLocation()
                : "Tuyến mới";

        return TicketExchangeResponse.builder()
                .exchangeId(logRecord.getId())
                .status("SUCCESS")
                .message("Đổi vé thành công! Vé cũ đã đánh dấu EXCHANGED và vé mới đã được kích hoạt.")
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
                .customerName(newBooking.getPassengerName())
                .customerPhone(newBooking.getPassengerPhone())
                .oldTripDepartureTime(oldTrip.getDepartureTime())
                .newTripDepartureTime(newTrip.getDepartureTime())
                .oldRoute(oldRoute)
                .newRoute(newRoute)
                .exchangeTime(now)
                .build();
    }
}
