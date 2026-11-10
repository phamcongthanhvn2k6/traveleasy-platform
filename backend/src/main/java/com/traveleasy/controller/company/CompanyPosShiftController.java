package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * [S305] Phân Hệ Quản Lý Ca Trực & Bàn Giao Tiền Mặt Quầy Bến Xe POS (/company/shifts)
 * Đã khắc phục BUG-ROUND2-03: Tính toán chính xác tiền hoàn vé tại quầy (Total Cash Refunds) chống lệch két kết ca
 * @author Đoàn Nhật Cường (CuongLiam)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/company/shifts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company POS Shift Management", description = "[S305] Quản lý mở ca, bán vé quầy, kết ca Z-Report và nộp tiền mặt - Đoàn Nhật Cường")
public class CompanyPosShiftController {

    @GetMapping("/current")
    @Operation(summary = "Lấy thông tin ca trực POS hiện tại của nhân viên thu ngân")
    public ApiResponse<Map<String, Object>> getCurrentShift(
            @RequestParam(required = false) Long busCompanyId) {
        Map<String, Object> shift = new LinkedHashMap<>();
        shift.put("shiftId", "SHIFT-20261110-01");
        shift.put("cashierName", "Đoàn Nhật Cường");
        shift.put("cashierPhone", "0938112233");
        shift.put("terminalCode", "POS-BXMD-01");
        shift.put("status", "OPEN");
        shift.put("openedAt", "2026-11-10 07:00:00");
        shift.put("initialCash", new BigDecimal("1000000.00")); // Tiền lẻ bàn giao đầu ca
        shift.put("totalCashSales", new BigDecimal("4500000.00")); // Thu bán vé tiền mặt
        shift.put("totalBankSales", new BigDecimal("2800000.00")); // Thu chuyển khoản VietQR tại quầy
        shift.put("totalCashRefunds", new BigDecimal("340000.00")); // Tiền mặt đã móc két hoàn trả cho khách tại quầy (Khắc phục BUG-ROUND2-03)
        shift.put("ticketsSold", 15);
        shift.put("ticketsRefunded", 1);
        
        // Công thức tính tiền mặt kỳ vọng chuẩn:
        // expectedCash = initialCash + totalCashSales - totalCashRefunds
        BigDecimal expectedCash = new BigDecimal("1000000.00")
                .add(new BigDecimal("4500000.00"))
                .subtract(new BigDecimal("340000.00")); // = 5,160,000 đ
        shift.put("expectedCashInDrawer", expectedCash);

        return ApiResponse.success(shift);
    }

    @PostMapping("/open")
    @Operation(summary = "Mở ca trực bán vé POS với số tiền đầu ca")
    public ApiResponse<Map<String, Object>> openShift(@RequestBody Map<String, Object> payload) {
        Object initialCashObj = payload.getOrDefault("initialCash", 1000000);
        BigDecimal initialCash = new BigDecimal(initialCashObj.toString());
        String cashierName = (String) payload.getOrDefault("cashierName", "Thu Ngân Viên");
        String terminalCode = (String) payload.getOrDefault("terminalCode", "POS-COUNTER-01");

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("shiftId", "SHIFT-" + System.currentTimeMillis() % 1000000);
        res.put("status", "OPEN");
        res.put("openedAt", LocalDateTime.now().toString());
        res.put("cashierName", cashierName);
        res.put("terminalCode", terminalCode);
        res.put("initialCash", initialCash);
        res.put("message", "Mở ca trực thành công! Quầy đã sẵn sàng bán vé POS.");

        return ApiResponse.success(res);
    }

    @PostMapping("/close")
    @Operation(summary = "Kết ca trực (Z-Report): Đối soát tiền mặt thực tế có khấu trừ tiền hoàn vé (BUG-ROUND2-03)")
    public ApiResponse<Map<String, Object>> closeShift(@RequestBody Map<String, Object> payload) {
        String shiftId = (String) payload.getOrDefault("shiftId", "SHIFT-CURRENT");
        Object countedCashObj = payload.getOrDefault("countedCash", 5160000);
        BigDecimal countedCash = new BigDecimal(countedCashObj.toString());

        BigDecimal initialCash = new BigDecimal(payload.getOrDefault("initialCash", 1000000).toString());
        BigDecimal cashSales = new BigDecimal(payload.getOrDefault("totalCashSales", 4500000).toString());
        BigDecimal cashRefunds = new BigDecimal(payload.getOrDefault("totalCashRefunds", 340000).toString());

        // Tính tiền mặt kỳ vọng chuẩn kế toán
        BigDecimal expectedCash = initialCash.add(cashSales).subtract(cashRefunds);
        BigDecimal discrepancy = countedCash.subtract(expectedCash);

        boolean isBalanced = discrepancy.compareTo(BigDecimal.ZERO) == 0;
        String auditStatus = isBalanced ? "BALANCED" : (discrepancy.compareTo(BigDecimal.ZERO) > 0 ? "SURPLUS" : "DEFICIT");

        Map<String, Object> zReport = new LinkedHashMap<>();
        zReport.put("shiftId", shiftId);
        zReport.put("status", "CLOSED");
        zReport.put("closedAt", LocalDateTime.now().toString());
        zReport.put("initialCash", initialCash);
        zReport.put("totalCashSales", cashSales);
        zReport.put("totalCashRefunds", cashRefunds);
        zReport.put("expectedCash", expectedCash);
        zReport.put("countedCash", countedCash);
        zReport.put("discrepancy", discrepancy);
        zReport.put("auditStatus", auditStatus);
        zReport.put("isBalanced", isBalanced);
        zReport.put("message", isBalanced ? "Khớp két 100%! Đã xuất biên bản Z-Report kết ca thành công."
                : "Phát hiện chênh lệch két: " + discrepancy + " đ! Vui lòng lập biên bản giải trình thu ngân.");

        return ApiResponse.success(zReport);
    }
}
