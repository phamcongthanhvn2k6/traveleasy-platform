package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * [S316] Phân Hệ Đổi Vé, Đổi Giờ Chạy & Chuyển Ghế Linh Hoạt (/company/ticket-exchange)
 * @author Trần Minh Đức (tranduc2601)
 */
@RestController
@RequestMapping("/api/v1/company/ticket-exchange")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Ticket Exchange", description = "[S316] Đổi vé, đổi giờ chạy và tính toán chênh lệch giá vé tự động - Trần Minh Đức")
public class CompanyTicketExchangeController {

    @GetMapping("/lookup")
    @Operation(summary = "Tra cứu thông tin vé gốc cần đổi")
    public ApiResponse<Map<String, Object>> lookupTicket(@RequestParam String ticketCode) {
        return ApiResponse.success(Map.of(
                "ticketCode", ticketCode,
                "status", "ISSUED",
                "customerName", "Nguyễn Văn Du Khách",
                "price", 340000,
                "currentSeat", "A05",
                "canExchange", true
        ));
    }

    @PostMapping("/calculate-difference")
    @Operation(summary = "Tính toán số tiền chênh lệch giữa vé cũ và vé mới")
    public ApiResponse<Map<String, Object>> calculateDifference(
            @RequestParam String oldTicketCode,
            @RequestParam Long newTripId,
            @RequestParam String newSeatCode) {
        return ApiResponse.success(Map.of(
                "oldPrice", 340000,
                "newPrice", 420000,
                "priceDifference", 80000,
                "requiresSurcharge", true
        ));
    }

    @PostMapping("/confirm")
    @Operation(summary = "Xác nhận đổi vé và phát hành vé mới")
    public ApiResponse<Map<String, Object>> confirmExchange(@RequestBody Map<String, Object> request) {
        return ApiResponse.success(Map.of(
                "status", "SUCCESS",
                "message", "Đổi vé thành công! Mã vé mới đã được kích hoạt.",
                "newTicketCode", "TK-EX-" + System.currentTimeMillis()
        ));
    }
}
