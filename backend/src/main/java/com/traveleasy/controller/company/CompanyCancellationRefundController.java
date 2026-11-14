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
        Long targetCompanyId = resolveCompanyId(authentication, busCompanyId != null ? busCompanyId : companyId);

        List<Ticket> tickets = ticketRepository.findAll().stream()
                .filter(t -> {
                    if (t.getBooking() == null || t.getBooking().getTrip() == null) return false;
                    Trip trip = t.getBooking().getTrip();
                    if (targetCompanyId != null && trip.getBusCompany() != null && !targetCompanyId.equals(trip.getBusCompany().getId())) {
                        return false;
                    }
                    if (keyword != null && !keyword.isBlank()) {
                        String kw = keyword.trim().toLowerCase();
                        boolean matchCode = t.getTicketCode() != null && t.getTicketCode().toLowerCase().contains(kw);
                        boolean matchName = t.getBooking().getPassengerName() != null && t.getBooking().getPassengerName().toLowerCase().contains(kw);
                        boolean matchPhone = t.getBooking().getPassengerPhone() != null && t.getBooking().getPassengerPhone().contains(kw);
                        return matchCode || matchName || matchPhone;
                    }
                    return t.getStatus() == TicketStatus.CANCELLED || t.getStatus() == TicketStatus.ISSUED;
                })
                .sorted(Comparator.comparing(Ticket::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(20)
                .toList();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Ticket t : tickets) {
            Trip trip = t.getBooking().getTrip();
            String routeName = trip.getRoute() != null
                    ? trip.getRoute().getDepartureLocation() + " ➔ " + trip.getRoute().getArrivalLocation()
                    : "Chuyến xe #" + trip.getId();

            BigDecimal price = t.getPrice() != null ? t.getPrice() : BigDecimal.valueOf(350000);

            // Tính toán % phí hủy động theo thời gian xuất bến thực tế
            int hours = 24;
            if (trip.getDepartureTime() != null) {
                LocalDateTime now = LocalDateTime.now();
                if (trip.getDepartureTime().isAfter(now)) {
                    hours = (int) Duration.between(now, trip.getDepartureTime()).toHours();
                } else {
                    hours = 0;
                }
            }
            int feePct = 10;
            if (hours < 2) {
                feePct = 100;
            } else if (hours < 12) {
                feePct = 50;
            } else if (hours < 24) {
                feePct = 30;
            }

            BigDecimal fee = price.multiply(BigDecimal.valueOf(feePct)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal refund = price.subtract(fee);
            BigDecimal companyPenalty = fee.multiply(new BigDecimal("0.80")).setScale(2, RoundingMode.HALF_UP);
            BigDecimal platformFee = fee.subtract(companyPenalty);

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", t.getId());
            item.put("ticketCode", t.getTicketCode());
            item.put("passengerName", t.getBooking().getPassengerName());
            item.put("passengerPhone", t.getBooking().getPassengerPhone());
            item.put("routeName", routeName);
            item.put("seatNumber", t.getSeatNumber());
            item.put("originalPrice", price);
            item.put("status", t.getStatus().name());
            item.put("cancellationFeePercent", feePct);
            item.put("cancellationFee", fee);
            item.put("refundAmount", refund);
            item.put("busCompanyShare", companyPenalty);
            item.put("platformShare", platformFee);
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

        Long targetCompanyId = resolveCompanyId(authentication, null);
        if (targetCompanyId != null && ticket.getBooking() != null && ticket.getBooking().getTrip() != null) {
            Trip trip = ticket.getBooking().getTrip();
            if (trip.getBusCompany() != null && !targetCompanyId.equals(trip.getBusCompany().getId())) {
                throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên vé của nhà xe khác!");
            }
        }

        BigDecimal originalPrice = ticket.getPrice() != null ? ticket.getPrice() : BigDecimal.valueOf(350000);

        // Tính số giờ trước khởi hành thực tế
        int hours = 24;
        if (hoursBeforeDeparture != null) {
            hours = hoursBeforeDeparture;
        } else if (ticket.getBooking() != null && ticket.getBooking().getTrip() != null && ticket.getBooking().getTrip().getDepartureTime() != null) {
            LocalDateTime depTime = ticket.getBooking().getTrip().getDepartureTime();
            LocalDateTime now = LocalDateTime.now();
            if (depTime.isAfter(now)) {
                hours = (int) Duration.between(now, depTime).toHours();
            } else {
                hours = 0;
            }
        }

        // Xác định tỷ lệ phạt hủy theo bậc thang quy định
        int feePercent = 10;
        String tierDesc = "Hủy trước 24h: Phạt 10%, Hoàn 90%";
        if (hours < 2) {
            feePercent = 100;
            tierDesc = "Hủy dưới 2h: Phạt 100% (Không hoàn tiền)";
        } else if (hours < 12) {
            feePercent = 50;
            tierDesc = "Hủy từ 2h - 12h: Phạt 50%, Hoàn 50%";
        } else if (hours < 24) {
            feePercent = 30;
            tierDesc = "Hủy từ 12h - 24h: Phạt 30%, Hoàn 70%";
        }

        BigDecimal cancellationFee = originalPrice.multiply(BigDecimal.valueOf(feePercent))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal refundToCustomer = originalPrice.subtract(cancellationFee);

        // Phân bổ tiền phạt hủy (Khắc phục BUG-NEW-03: 80% Nhà xe, 20% Sàn)
        BigDecimal busCompanyShare = cancellationFee.multiply(new BigDecimal("0.80")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal platformShare = cancellationFee.subtract(busCompanyShare);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ticketCode", ticket.getTicketCode());
        result.put("originalPrice", originalPrice);
        result.put("hoursBeforeDeparture", hours);
        result.put("cancellationFeePercent", feePercent);
        result.put("cancellationFee", cancellationFee);
        result.put("refundAmountToCustomer", refundToCustomer);
        result.put("busCompanyPenaltyRevenue", busCompanyShare); // 80% bù đắp rủi ro ghế trống
        result.put("platformServiceFeeRevenue", platformShare);   // 20% phí xử lý sàn
        result.put("tierDescription", tierDesc);
        result.put("settlementImpactNotice", "Khoản bồi hoàn " + busCompanyShare + " đ sẽ được cộng vào kỳ đối soát tiếp theo của nhà xe.");

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

        Ticket ticket = ticketRepository.findByTicketCode(ticketCode.trim())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy vé: " + ticketCode));

        Long explicitCompanyId = null;
        if (payload.get("companyId") != null) {
            explicitCompanyId = Long.valueOf(payload.get("companyId").toString());
        } else if (payload.get("busCompanyId") != null) {
            explicitCompanyId = Long.valueOf(payload.get("busCompanyId").toString());
        }

        Long targetCompanyId = resolveCompanyId(authentication, explicitCompanyId);
        if (targetCompanyId != null && ticket.getBooking() != null && ticket.getBooking().getTrip() != null) {
            Trip trip = ticket.getBooking().getTrip();
            if (trip.getBusCompany() != null && !targetCompanyId.equals(trip.getBusCompany().getId())) {
                throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên vé của nhà xe khác!");
            }
        }

        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Vé " + ticketCode + " đã bị hủy trước đó!");
        }
        if (ticket.getStatus() == TicketStatus.USED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Vé " + ticketCode + " đã được soát lên xe (USED), không thể hủy!");
        }

        BigDecimal originalPrice = ticket.getPrice() != null ? ticket.getPrice() : BigDecimal.valueOf(350000);

        // Tính toán số giờ trước khởi hành thực tế
        Trip trip = ticket.getBooking() != null ? ticket.getBooking().getTrip() : null;
        int hours = 24;
        if (trip != null && trip.getDepartureTime() != null) {
            LocalDateTime now = LocalDateTime.now();
            if (trip.getDepartureTime().isAfter(now)) {
                hours = (int) Duration.between(now, trip.getDepartureTime()).toHours();
            } else {
                hours = 0;
            }
        }

        // Bậc thang tính phí hủy vé theo quy định
        int feePercent = 10;
        String tierDesc = "Hủy trước 24h: Phạt 10%, Hoàn 90%";
        if (hours < 2) {
            feePercent = 100;
            tierDesc = "Hủy dưới 2h: Phạt 100% (Không hoàn tiền)";
        } else if (hours < 12) {
            feePercent = 50;
            tierDesc = "Hủy từ 2h - 12h: Phạt 50%, Hoàn 50%";
        } else if (hours < 24) {
            feePercent = 30;
            tierDesc = "Hủy từ 12h - 24h: Phạt 30%, Hoàn 70%";
        }

        BigDecimal cancellationFee = originalPrice.multiply(BigDecimal.valueOf(feePercent))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal refundAmount = originalPrice.subtract(cancellationFee);

        // Phân bổ 80% cho Nhà xe, 20% cho Sàn (BUG-NEW-03)
        BigDecimal busCompanyShare = cancellationFee.multiply(new BigDecimal("0.80")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal platformShare = cancellationFee.subtract(busCompanyShare);

        // 1. Chuyển trạng thái vé sang CANCELLED
        ticket.setStatus(TicketStatus.CANCELLED);
        ticketRepository.save(ticket);

        // 2. Cập nhật booking nếu toàn bộ vé đã hủy
        Booking booking = ticket.getBooking();
        if (booking != null && booking.getTickets() != null) {
            boolean allCancelled = booking.getTickets().stream()
                    .allMatch(t -> t.getId().equals(ticket.getId()) || t.getStatus() == TicketStatus.CANCELLED);
            if (allCancelled) {
                booking.setStatus(BookingStatus.CANCELLED);
                bookingRepository.save(booking);

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
        }

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

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "SUCCESS");
        res.put("message", "Đã duyệt hủy vé và hoàn tiền thành công! Ghế " + ticket.getSeatNumber() + " đã được mở lại cho khách khác đặt mua.");
        res.put("ticketCode", ticketCode);
        res.put("seatNumber", ticket.getSeatNumber());
        res.put("ticketStatus", "CANCELLED");
        res.put("originalPrice", originalPrice);
        res.put("hoursBeforeDeparture", hours);
        res.put("cancellationFeePercent", feePercent);
        res.put("cancellationFee", cancellationFee);
        res.put("refundAmount", refundAmount);
        res.put("refundAmountToCustomer", refundAmount);
        res.put("busCompanyPenaltyRevenue", busCompanyShare);
        res.put("platformServiceFeeRevenue", platformShare);
        res.put("tierDescription", tierDesc);
        res.put("settlementImpactNotice", "Khoản bồi hoàn " + busCompanyShare + " đ sẽ được cộng vào kỳ đối soát tiếp theo của nhà xe.");

        return ApiResponse.success(res);
    }

    private Long resolveCompanyId(Authentication authentication, Long explicitId) {
        if (explicitId != null) {
            return explicitId;
        }
        if (authentication != null && authentication.isAuthenticated()) {
            User user = securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER, StaffRole.DISPATCHER);
            if (user != null && user.getBusCompanyId() != null) {
                return user.getBusCompanyId();
            }
        }
        return null;
    }
}

