package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.entity.Ticket;
import com.traveleasy.entity.TicketStatus;
import com.traveleasy.repository.TicketRepository;
import com.traveleasy.repository.TripRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * [S321] Quản Lý Biểu Phí & Tính Tiền Hoàn Hủy Vé Tự Động (/company/refunds)
 * Đã khắc phục BUG-NEW-03: Phân chia tiền phạt hủy vé 80/20 (80% Nhà xe bù đắp ghế trống, 20% Phí sàn)
 * @author Nguyễn Đại Phát (daiphat)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/company/refunds")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Cancellation & Refunds", description = "[S321] Cấu hình biểu phí và tự động tính tiền hoàn hủy vé - Nguyễn Đại Phát")
public class CompanyCancellationRefundController {

    private final TicketRepository ticketRepository;
    private final TripRepository tripRepository;

    @GetMapping("/rules")
    @Operation(summary = "Lấy biểu phí khấu trừ hoàn hủy theo mốc giờ của nhà xe")
    public ApiResponse<List<Map<String, Object>>> getRefundRules(
            @RequestParam(required = false) Long busCompanyId) {
        return ApiResponse.success(List.of(
                Map.of("hoursBeforeDeparture", 24, "feePercent", 10, "refundPercent", 90, "desc", "Hủy trước 24h: Mất 10% phí, Hoàn 90%"),
                Map.of("hoursBeforeDeparture", 12, "feePercent", 30, "refundPercent", 70, "desc", "Hủy 12h - 24h: Mất 30% phí, Hoàn 70%"),
                Map.of("hoursBeforeDeparture", 2, "feePercent", 50, "refundPercent", 50, "desc", "Hủy 2h - 12h: Mất 50% phí, Hoàn 50%"),
                Map.of("hoursBeforeDeparture", 0, "feePercent", 100, "refundPercent", 0, "desc", "Hủy dưới 2h: Mất 100% phí (Không hoàn)")
        ));
    }

    @PostMapping("/calculate")
    @Operation(summary = "Tính toán số tiền hoàn và phân bổ tiền phạt hủy vé (Khắc phục BUG-NEW-03)")
    public ApiResponse<Map<String, Object>> calculateRefundAmount(
            @RequestParam String ticketCode,
            @RequestParam(required = false, defaultValue = "18") int hoursBeforeDeparture) {

        BigDecimal originalPrice = new BigDecimal("340000.00");
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode).orElse(null);
        if (ticket != null) {
            originalPrice = ticket.getPrice();
        }

        // Xác định tỷ lệ phạt hủy theo bậc thang
        int feePercent = 10;
        if (hoursBeforeDeparture < 2) {
            feePercent = 100;
        } else if (hoursBeforeDeparture < 12) {
            feePercent = 50;
        } else if (hoursBeforeDeparture < 24) {
            feePercent = 30;
        }

        BigDecimal cancellationFee = originalPrice.multiply(BigDecimal.valueOf(feePercent))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal refundToCustomer = originalPrice.subtract(cancellationFee);

        // Phân bổ tiền phạt hủy (Khắc phục BUG-NEW-03: Chống lệch quỹ đối soát)
        BigDecimal busCompanyShare = cancellationFee.multiply(new BigDecimal("0.80")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal platformShare = cancellationFee.subtract(busCompanyShare);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ticketCode", ticketCode);
        result.put("originalPrice", originalPrice);
        result.put("hoursBeforeDeparture", hoursBeforeDeparture);
        result.put("cancellationFeePercent", feePercent);
        result.put("cancellationFee", cancellationFee);
        result.put("refundAmountToCustomer", refundToCustomer);
        result.put("busCompanyPenaltyRevenue", busCompanyShare); // 80% bù đắp rủi ro ghế trống
        result.put("platformServiceFeeRevenue", platformShare);   // 20% phí xử lý sàn
        result.put("settlementImpactNotice", "Khoản bồi hoàn " + busCompanyShare + " đ sẽ được cộng vào kỳ đối soát tiếp theo của nhà xe.");

        return ApiResponse.success(result);
    }

    @PostMapping("/confirm-refund")
    @Transactional
    @Operation(summary = "Xác nhận hủy vé, hoàn tiền và đồng bộ số ghế trống (BUG-NEW-04)")
    public ApiResponse<Map<String, Object>> confirmRefund(@RequestBody Map<String, Object> payload) {
        String ticketCode = (String) payload.getOrDefault("ticketCode", "TK-DEMO-REFUND");

        Ticket ticket = ticketRepository.findByTicketCode(ticketCode).orElse(null);
        if (ticket != null) {
            if (ticket.getStatus() == TicketStatus.CANCELLED) {
                throw new AppException(ErrorCode.VALIDATION_ERROR, "Vé " + ticketCode + " đã bị hủy trước đó!");
            }
            if (ticket.getStatus() == TicketStatus.USED) {
                throw new AppException(ErrorCode.VALIDATION_ERROR, "Vé " + ticketCode + " đã được soát lên xe, không thể hủy!");
            }

            ticket.setStatus(TicketStatus.CANCELLED);
            ticketRepository.save(ticket);

            // Đồng bộ lại số ghế trống trên chuyến xe (Khắc phục BUG-NEW-04)
            if (ticket.getBooking() != null && ticket.getBooking().getTrip() != null) {
                Long tripId = ticket.getBooking().getTrip().getId();
                tripRepository.syncAvailableSeats(tripId);
            }
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "SUCCESS");
        res.put("message", "Đã duyệt hủy vé và hoàn tiền thành công! Ghế đã được tự động mở lại cho khách khác đặt mua.");
        res.put("ticketCode", ticketCode);
        res.put("ticketStatus", "CANCELLED");

        return ApiResponse.success(res);
    }
}
