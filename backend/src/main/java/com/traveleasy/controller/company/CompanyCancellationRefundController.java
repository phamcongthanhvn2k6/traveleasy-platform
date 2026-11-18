package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.common.security.CompanySecurityService;
import com.traveleasy.entity.*;
import com.traveleasy.repository.BookingRepository;
import com.traveleasy.repository.PromotionRepository;
import com.traveleasy.repository.TicketRepository;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.repository.TripSeatRepository;
import com.traveleasy.service.realtime.SeatRealtimeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

/**
 * [S321] Quản Lý Biểu Phí & Tính Tiền Hoàn Hủy Vé Tự Động (/company/refunds)
 * - Cấu hình biểu phí hoàn hủy đa bậc thang theo mốc giờ
 * - Phân chia tiền phạt hủy vé 80/20 (80% Nhà xe bù đắp ghế trống, 20% Phí sàn - BUG-NEW-03)
 * - Tự động hoàn ghế về AVAILABLE, đồng bộ availableSeats và phát WebSocket SSE (BUG-NEW-04)
 * - Bảo mật Multi-Tenancy và phân quyền RBAC
 * @author Nguyễn Đại Phát (daiphat)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/company/refunds")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Cancellation & Refunds", description = "[S321] Cấu hình biểu phí và tự động tính tiền hoàn hủy vé - Nguyễn Đại Phát")
public class CompanyCancellationRefundController {

    private final BookingRepository bookingRepository;
    private final PromotionRepository promotionRepository;
    private final TicketRepository ticketRepository;
    private final TripRepository tripRepository;
    private final TripSeatRepository tripSeatRepository;
    private final SeatRealtimeService seatRealtimeService;
    private final CompanySecurityService securityService;

    // Bộ quy tắc biểu phí có thể tùy chỉnh
    private static final List<Map<String, Object>> activeRules = new CopyOnWriteArrayList<>(List.of(
            new LinkedHashMap<>(Map.of("id", 1, "hoursBeforeDeparture", 24, "feePercent", 10, "refundPercent", 90, "desc", "Hủy trước 24h: Mất 10% phí, Hoàn 90%")),
            new LinkedHashMap<>(Map.of("id", 2, "hoursBeforeDeparture", 12, "feePercent", 30, "refundPercent", 70, "desc", "Hủy 12h - 24h: Mất 30% phí, Hoàn 70%")),
            new LinkedHashMap<>(Map.of("id", 3, "hoursBeforeDeparture", 2, "feePercent", 50, "refundPercent", 50, "desc", "Hủy 2h - 12h: Mất 50% phí, Hoàn 50%")),
            new LinkedHashMap<>(Map.of("id", 4, "hoursBeforeDeparture", 0, "feePercent", 100, "refundPercent", 0, "desc", "Hủy dưới 2h hoặc sau giờ xuất bến: Không hoàn tiền"))
    ));

    @GetMapping("/rules")
    @Operation(summary = "Lấy biểu phí khấu trừ hoàn hủy theo mốc giờ của nhà xe")
    public ApiResponse<List<Map<String, Object>>> getRefundRules(
            @RequestParam(required = false) Long busCompanyId) {
        return ApiResponse.success(new ArrayList<>(activeRules));
    }

    @PutMapping("/rules")
    @Operation(summary = "Cập nhật biểu phí khấu trừ hoàn hủy theo chính sách nhà xe")
    public ApiResponse<List<Map<String, Object>>> updateRefundRules(
            @RequestBody List<Map<String, Object>> newRules,
            Authentication authentication) {
        if (newRules != null && !newRules.isEmpty()) {
            activeRules.clear();
            activeRules.addAll(newRules);
        }
        return ApiResponse.success("Đã cập nhật biểu phí hoàn hủy vé thành công", new ArrayList<>(activeRules));
    }

    @GetMapping("/requests")
    @Operation(summary = "Lấy danh sách yêu cầu hoàn hủy vé của nhà xe")
    public ApiResponse<List<Map<String, Object>>> getRefundRequests(
            @RequestParam(required = false) Long busCompanyId,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) String keyword,
            Authentication authentication) {
        User staff = requireCompanyStaff(authentication);
        Long targetCompanyId = staff.getBusCompanyId();

        List<Ticket> tickets = ticketRepository.findByBookingTripBusCompanyId(targetCompanyId).stream()
                .filter(t -> {
                    if (t.getStatus() != TicketStatus.CANCELLED && t.getStatus() != TicketStatus.ISSUED) {
                        return false;
                    }
                    if (keyword != null && !keyword.isBlank()) {
                        String kw = keyword.trim().toLowerCase();
                        boolean matchCode = t.getTicketCode() != null && t.getTicketCode().toLowerCase().contains(kw);
                        boolean matchName = t.getBooking().getPassengerName() != null && t.getBooking().getPassengerName().toLowerCase().contains(kw);
                        boolean matchPhone = t.getBooking().getPassengerPhone() != null && t.getBooking().getPassengerPhone().contains(kw);
                        return matchCode || matchName || matchPhone;
                    }
                    return true;
                })
                .sorted(Comparator.comparing((Ticket t) -> !isAwaitingTransfer(t))
                        .thenComparing(Ticket::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(20)
                .toList();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Ticket t : tickets) {
            Trip trip = t.getBooking().getTrip();
            String routeName = trip.getRoute() != null
                    ? trip.getRoute().getDepartureLocation() + " ➔ " + trip.getRoute().getArrivalLocation()
                    : "Chuyến xe #" + trip.getId();

            RefundAmounts amounts = displayAmounts(t);

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", t.getId());
            item.put("ticketCode", t.getTicketCode());
            item.put("passengerName", t.getBooking().getPassengerName());
            item.put("passengerPhone", t.getBooking().getPassengerPhone());
            item.put("routeName", routeName);
            item.put("seatNumber", t.getSeatNumber());
            addRefundFields(item, t, amounts);
            item.put("canConfirmTransfer", canConfirmTransfer(staff) && isAwaitingTransfer(t));
            item.put("departureTime", trip.getDepartureTime());
            item.put("requestTime", t.getCreatedAt());
            result.add(item);
        }

        return ApiResponse.success(result);
    }

    @PostMapping("/calculate")
    @Operation(summary = "Tính toán số tiền hoàn và phân bổ tiền phạt hủy vé (Khắc phục BUG-NEW-03)")
    public ApiResponse<Map<String, Object>> calculateRefundAmount(
            @RequestParam String ticketCode,
            @RequestParam(required = false) Integer hoursBeforeDeparture,
            Authentication authentication) {

        Ticket ticket = ticketRepository.findByTicketCode(ticketCode.trim())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy vé với mã: " + ticketCode));

        User staff = requireCompanyStaff(authentication);
        Long targetCompanyId = staff.getBusCompanyId();
        BusCompany company = ticket.getBooking().getTrip().getBusCompany();
        if (company == null || !targetCompanyId.equals(company.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Vé không thuộc nhà xe của bạn");
        }

        int hours = hoursBeforeDeparture != null ? hoursBeforeDeparture : hoursBeforeDeparture(ticket);
        RefundAmounts amounts = ticket.getStatus() == TicketStatus.CANCELLED
                ? displayAmounts(ticket) : calculateAmounts(ticket, hours);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ticketCode", ticket.getTicketCode());
        addRefundFields(result, ticket, amounts);
        result.put("canConfirmTransfer", canConfirmTransfer(staff) && isAwaitingTransfer(ticket));
        result.put("hoursBeforeDeparture", ticket.getStatus() == TicketStatus.CANCELLED ? null : hours);
        result.put("refundAmountToCustomer", amounts.refund());
        result.put("busCompanyPenaltyRevenue", amounts.partnerShare());
        result.put("platformServiceFeeRevenue", result.get("platformShare"));

        return ApiResponse.success(result);
    }

    @PostMapping(value = {"", "/confirm-refund"})
    @Transactional
    @Operation(summary = "[S321] Xác nhận hủy vé, tính chính xác tỷ lệ hoàn tiền và đồng bộ số ghế trống (DoD)")
    public ApiResponse<Map<String, Object>> confirmRefund(
            @RequestBody Map<String, Object> payload,
            Authentication authentication) {
        String ticketCode = (String) payload.getOrDefault("ticketCode", "");
        if (ticketCode == null || ticketCode.isBlank()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Mã vé không được để trống!");
        }

        User staff = requireCompanyStaff(authentication);
        Ticket ticket = lockCompanyTicket(ticketCode, staff);
        Booking booking = ticket.getBooking();

        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Vé " + ticketCode + " đã bị hủy trước đó!");
        }
        if (ticket.getStatus() != TicketStatus.ISSUED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Vé " + ticketCode + " không ở trạng thái cho phép hủy");
        }

        Trip trip = booking.getTrip();
        RefundAmounts amounts = calculateAmounts(ticket, hoursBeforeDeparture(ticket));
        ticket.setStatus(TicketStatus.CANCELLED);
        ticket.setCancellationFeePercent(amounts.percent());
        ticket.setCancellationFee(amounts.fee());
        ticket.setRefundAmount(amounts.refund());
        if (amounts.refund().signum() == 0) {
            recordPartnerMovement(ticket, null, authentication);
        }
        ticketRepository.save(ticket);

        if (booking.getTickets() != null) {
            boolean allCancelled = booking.getTickets().stream()
                    .allMatch(t -> t.getStatus() == TicketStatus.CANCELLED);
            if (allCancelled) {
                booking.setStatus(BookingStatus.CANCELLED);
                // HOÀN LẠI LƯỢT KHUYẾN MẠI NẾU CÓ ÁP DỤNG VOUCHER
                if (booking.getVoucherCode() != null && !booking.getVoucherCode().isBlank()) {
                    promotionRepository.findByCodeIgnoreCase(booking.getVoucherCode().trim()).ifPresent(promo -> {
                        if (promo.getUsedCount() != null && promo.getUsedCount() > 0) {
                            promo.setUsedCount(promo.getUsedCount() - 1);
                            promotionRepository.save(promo);
                        }
                    });
                }
            }
            List<String> remaining = booking.getTickets().stream()
                    .filter(t -> !t.getId().equals(ticket.getId()) && t.getStatus() != TicketStatus.CANCELLED)
                    .map(Ticket::getSeatNumber)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            booking.setSeatNumbers(String.join(", ", remaining));
        }
        bookingRepository.save(booking);

        // 3. Mở lại ghế trống về AVAILABLE trên bảng trip_seats và phát WebSocket SSE (DoD & BUG-NEW-04)
        Long tripId = trip != null ? trip.getId() : null;
        if (tripId != null && ticket.getSeatNumber() != null) {
            TripSeat seat = tripSeatRepository.findByTripIdAndSeatCode(tripId, ticket.getSeatNumber()).orElse(null);
            if (seat != null) {
                seat.setStatus(SeatStatus.AVAILABLE);
                tripSeatRepository.save(seat);
                seatRealtimeService.broadcastReleased(tripId, List.of(ticket.getSeatNumber()));
            }

            // Đồng bộ lại bộ đếm số ghế trống trên chuyến xe (BUG-NEW-04)
            tripRepository.syncAvailableSeats(tripId);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ticketCode", ticket.getTicketCode());
        result.put("seatNumber", ticket.getSeatNumber());
        result.put("ticketStatus", ticket.getStatus().name());
        addRefundFields(result, ticket, amounts);
        result.put("canConfirmTransfer", canConfirmTransfer(staff) && isAwaitingTransfer(ticket));
        return ApiResponse.success("Đã hủy vé và cập nhật ghế", result);
    }

    @PostMapping("/confirm-transfer")
    @Transactional
    public ApiResponse<Map<String, Object>> confirmTransfer(
            @RequestBody Map<String, String> payload, Authentication authentication) {
        String txCode = Objects.toString(payload.get("txCode"), "").trim();
        if (txCode.isBlank() || txCode.length() > 100) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Mã giao dịch phải có từ 1 đến 100 ký tự");
        }
        User staff = securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER);
        Ticket ticket = lockCompanyTicket(payload.get("ticketCode"), staff);
        Booking booking = ticket.getBooking();
        boolean legacy = ticket.getCancellationFeePercent() == null && isLegacyPending(ticket);
        if (legacy) {
            RefundAmounts amounts = displayAmounts(ticket);
            ticket.setCancellationFeePercent(amounts.percent());
            ticket.setCancellationFee(amounts.fee());
            ticket.setRefundAmount(amounts.refund());
        }
        if (ticket.getStatus() != TicketStatus.CANCELLED || ticket.getRefundAmount() == null
                || ticket.getRefundAmount().signum() <= 0) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Vé không có khoản hoàn tiền chờ chuyển");
        }
        if (ticket.getRefundRecordedAt() == null) {
            recordPartnerMovement(ticket, txCode, authentication);
            ticketRepository.save(ticket);
            if (legacy) {
                booking.setRefundStatus("REFUNDED");
                booking.setRefundedAt(ticket.getRefundRecordedAt());
                booking.setRefundTxCode(txCode);
                bookingRepository.save(booking);
            }
        } else if (!txCode.equals(ticket.getRefundTransferCode())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Vé đã được xác nhận với mã giao dịch khác");
        }
        Map<String, Object> result = new LinkedHashMap<>();
        addRefundFields(result, ticket, displayAmounts(ticket));
        result.put("canConfirmTransfer", false);
        return ApiResponse.success("Đã xác nhận chuyển khoản hoàn tiền", result);
    }

    private Ticket lockCompanyTicket(String code, User staff) {
        if (code == null || code.isBlank()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Mã vé không được để trống");
        }
        Ticket ticket = ticketRepository.findByTicketCodeForUpdate(code.trim())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy vé: " + code));
        bookingRepository.findByIdForUpdate(ticket.getBooking().getId());
        BusCompany company = ticket.getBooking().getTrip().getBusCompany();
        if (company == null || !company.getId().equals(staff.getBusCompanyId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Vé không thuộc nhà xe của bạn");
        }
        return ticket;
    }

    private void recordPartnerMovement(Ticket ticket, String txCode, Authentication authentication) {
        ticket.setRefundPartnerCredit(partnerShare(ticket.getCancellationFee()));
        ticket.setRefundRecordedAt(LocalDateTime.now());
        ticket.setRefundTransferCode(txCode);
        ticket.setRefundRecordedBy(authentication.getName());
    }

    private static int hoursBeforeDeparture(Ticket ticket) {
        LocalDateTime departure = ticket.getBooking().getTrip().getDepartureTime();
        return departure == null ? 24 : (int) Math.max(0, Duration.between(LocalDateTime.now(), departure).toHours());
    }

    private static RefundAmounts calculateAmounts(Ticket ticket, int hours) {
        int percent = hours < 2 ? 100 : hours < 12 ? 50 : hours < 24 ? 30 : 10;
        BigDecimal price = ticket.getPrice();
        BigDecimal fee = price.multiply(BigDecimal.valueOf(percent)).movePointLeft(2).setScale(2, RoundingMode.HALF_UP);
        return new RefundAmounts(price, percent, fee, price.subtract(fee));
    }

    private static RefundAmounts displayAmounts(Ticket ticket) {
        if (ticket.getStatus() != TicketStatus.CANCELLED) {
            return calculateAmounts(ticket, hoursBeforeDeparture(ticket));
        }
        if (ticket.getCancellationFeePercent() != null) {
            return new RefundAmounts(ticket.getRefundAmount().add(ticket.getCancellationFee()),
                    ticket.getCancellationFeePercent(), ticket.getCancellationFee(), ticket.getRefundAmount());
        }
        Booking booking = ticket.getBooking();
        BigDecimal fee = booking.getRefundFee();
        BigDecimal refund = booking.getRefundAmount();
        if (booking.getTickets() != null && booking.getTickets().size() == 1 && fee != null && refund != null
                && fee.add(refund).signum() > 0) {
            BigDecimal original = fee.add(refund);
            int percent = fee.multiply(BigDecimal.valueOf(100)).divide(original, 0, RoundingMode.HALF_UP).intValue();
            return new RefundAmounts(original, percent, fee, refund);
        }
        return new RefundAmounts(ticket.getPrice(), null, null, null);
    }

    private static void addRefundFields(Map<String, Object> item, Ticket ticket, RefundAmounts amounts) {
        boolean tracked = ticket.getCancellationFeePercent() != null;
        boolean cancelled = ticket.getStatus() == TicketStatus.CANCELLED;
        String refundStatus = "NONE";
        if (tracked) {
            refundStatus = amounts.refund().signum() == 0 ? "NO_REFUND"
                    : ticket.getRefundRecordedAt() != null ? "REFUNDED" : "PENDING";
        } else if (cancelled && amounts.refund() != null) {
            String txCode = ticket.getBooking().getRefundTxCode();
            refundStatus = amounts.refund().signum() == 0 ? "NO_REFUND"
                    : txCode != null && txCode.startsWith("COMPANY-REFUND-") ? "UNKNOWN"
                    : ticket.getBooking().getRefundStatus();
        } else if (cancelled) {
            refundStatus = "UNKNOWN";
        }
        item.put("status", ticket.getStatus().name());
        item.put("originalPrice", amounts.original());
        item.put("cancellationFeePercent", amounts.percent());
        item.put("cancellationFee", amounts.fee());
        item.put("refundAmount", amounts.refund());
        item.put("busCompanyShare", amounts.partnerShare());
        item.put("platformShare", amounts.fee() == null ? null : amounts.fee().subtract(amounts.partnerShare()));
        item.put("refundStatus", refundStatus);
        item.put("refundTransferCode", tracked ? ticket.getRefundTransferCode()
                : "REFUNDED".equals(refundStatus) ? ticket.getBooking().getRefundTxCode() : null);
    }

    private static boolean isAwaitingTransfer(Ticket ticket) {
        return ticket.getStatus() == TicketStatus.CANCELLED && (ticket.getRefundAmount() != null
                ? ticket.getRefundAmount().signum() > 0 && ticket.getRefundRecordedAt() == null
                : isLegacyPending(ticket));
    }

    private static boolean isLegacyPending(Ticket ticket) {
        if (ticket.getStatus() != TicketStatus.CANCELLED || !"PENDING".equals(ticket.getBooking().getRefundStatus())) {
            return false;
        }
        BigDecimal refund = displayAmounts(ticket).refund();
        return refund != null && refund.signum() > 0;
    }

    private static boolean canConfirmTransfer(User staff) {
        return staff.getStaffRole() != StaffRole.DISPATCHER;
    }

    private static BigDecimal partnerShare(BigDecimal fee) {
        return fee.multiply(new BigDecimal("0.80")).setScale(2, RoundingMode.HALF_UP);
    }

    private record RefundAmounts(BigDecimal original, Integer percent, BigDecimal fee, BigDecimal refund) {
        BigDecimal partnerShare() {
            return fee == null ? null : CompanyCancellationRefundController.partnerShare(fee);
        }
    }

    private User requireCompanyStaff(Authentication authentication) {
        User staff = securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER, StaffRole.DISPATCHER);
        if (staff.getBusCompanyId() == null) {
            throw new AppException(ErrorCode.FORBIDDEN, "Tài khoản chưa được gán nhà xe");
        }
        return staff;
    }
}
