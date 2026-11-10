package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * [S318] Phân Hệ Quản Lý Chi Phí Chuyến Xe & Tính Lợi Nhuận Ròng (/company/expenses)
 * @author Trần Minh Đức (tranduc2601)
 */
@RestController
@RequestMapping("/api/v1/company/expenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Trip Expenses & Profit", description = "[S318] Sổ thu chi dầu nhớt, vé cầu đường BOT và lợi nhuận ròng chuyến xe - Trần Minh Đức")
public class CompanyTripExpenseController {

    @GetMapping("/trips/{tripId}")
    @Operation(summary = "Lấy báo cáo chi phí và lợi nhuận ròng theo chuyến xe")
    public ApiResponse<Map<String, Object>> getTripProfitLoss(@PathVariable Long tripId) {
        java.util.Map<String, Object> data = new java.util.LinkedHashMap<>();
        data.put("tripId", tripId);
        data.put("ticketRevenue", new BigDecimal("10200000.00"));
        data.put("cargoRevenue", new BigDecimal("1500000.00"));
        data.put("totalRevenue", new BigDecimal("11700000.00"));
        data.put("fuelCost", new BigDecimal("3200000.00"));
        data.put("tollBotCost", new BigDecimal("850000.00"));
        data.put("driverSalary", new BigDecimal("1200000.00"));
        data.put("terminalFee", new BigDecimal("450000.00"));
        data.put("totalExpense", new BigDecimal("5700000.00"));
        data.put("netProfit", new BigDecimal("6000000.00"));
        data.put("profitMarginPercent", 51.3);
        return ApiResponse.success(data);
    }

    @PostMapping("/trips/{tripId}")
    @Operation(summary = "Lưu hoặc cập nhật chi phí vận hành chuyến xe")
    public ApiResponse<Map<String, Object>> saveTripExpense(
            @PathVariable Long tripId,
            @RequestBody Map<String, Object> payload) {
        return ApiResponse.success(Map.of(
                "tripId", tripId,
                "status", "SAVED",
                "message", "Đã lưu chi phí chuyến xe thành công!"
        ));
    }
}
