package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * [S321] Quản Lý Biểu Phí & Tính Tiền Hoàn Hủy Vé Tự Động (/company/refunds)
 * @author Nguyễn Đại Phát (daiphat)
 */
@RestController
@RequestMapping("/api/v1/company/refunds")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Cancellation & Refunds", description = "[S321] Cấu hình biểu phí và tự động tính tiền hoàn hủy vé - Nguyễn Đại Phát")
public class CompanyCancellationRefundController {

    @GetMapping("/rules")
    @Operation(summary = "Lấy biểu phí khấu trừ hoàn hủy theo mốc giờ của nhà xe")
    public ApiResponse<List<Map<String, Object>>> getRefundRules(
            @RequestParam(required = false) Long busCompanyId) {
        return ApiResponse.success(List.of(
                Map.of("hoursBeforeDeparture", 24, "feePercent", 10, "refundPercent", 90, "desc", "Hủy trước 24h: Hoàn 90%"),
                Map.of("hoursBeforeDeparture", 12, "feePercent", 30, "refundPercent", 70, "desc", "Hủy 12h - 24h: Hoàn 70%"),
                Map.of("hoursBeforeDeparture", 2, "feePercent", 50, "refundPercent", 50, "desc", "Hủy 2h - 12h: Hoàn 50%"),
                Map.of("hoursBeforeDeparture", 0, "feePercent", 100, "refundPercent", 0, "desc", "Hủy dưới 2h: Không hoàn")
        ));
    }

    @PostMapping("/calculate")
    @Operation(summary = "Tính toán số tiền hoàn thực tế khi khách hủy vé")
    public ApiResponse<Map<String, Object>> calculateRefundAmount(
            @RequestParam String ticketCode) {
        return ApiResponse.success(Map.of(
                "ticketCode", ticketCode,
                "originalPrice", 340000,
                "cancellationFee", 34000,
                "refundAmount", 306000,
                "refundPercent", 90
        ));
    }

    @PostMapping("/confirm-refund")
    @Operation(summary = "Xác nhận hủy vé và duyệt lệnh hoàn tiền")
    public ApiResponse<Map<String, Object>> confirmRefund(@RequestBody Map<String, Object> payload) {
        return ApiResponse.success(Map.of(
                "status", "SUCCESS",
                "message", "Đã duyệt hoàn tiền thành công! Vé đã chuyển sang trạng thái CANCELLED."
        ));
    }
}
