package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.security.CompanySecurityService;
import com.traveleasy.dto.company.expense.CompanyExpenseSummaryResponse;
import com.traveleasy.dto.company.expense.SaveTripExpenseRequest;
import com.traveleasy.dto.company.expense.TripProfitLossResponse;
import com.traveleasy.entity.StaffRole;
import com.traveleasy.entity.User;
import com.traveleasy.service.company.TripExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * [S318] Phân Hệ Quản Lý Chi Phí Chuyến Xe & Tính Lợi Nhuận Ròng (/company/expenses)
 * BẢO MẬT: Chỉ Chủ nhà xe / Kế toán trưởng (StaffRole.OWNER) mới có quyền truy cập
 * @author Trần Minh Đức (tranduc2601)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/company/expenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Trip Expenses & Profit", description = "[S318] Sổ thu chi dầu nhớt, vé cầu đường BOT và lợi nhuận ròng chuyến xe - Trần Minh Đức")
public class CompanyTripExpenseController {

    private final CompanySecurityService securityService;
    private final TripExpenseService tripExpenseService;

    @GetMapping
    @Operation(summary = "Lấy tổng hợp chi phí toàn đội xe (Chỉ OWNER được xem)")
    public ApiResponse<CompanyExpenseSummaryResponse> getCompanyExpenseSummary(
            @RequestParam(required = false) Long busCompanyId,
            Authentication authentication) {

        Long companyId = resolveCompanyId(authentication, busCompanyId);
        CompanyExpenseSummaryResponse summary = tripExpenseService.getCompanyExpenseSummary(companyId);
        return ApiResponse.success(summary);
    }

    @GetMapping("/trips/{tripId}")
    @Operation(summary = "Lấy báo cáo chi phí và lợi nhuận ròng (Chỉ OWNER được xem)")
    public ApiResponse<TripProfitLossResponse> getTripProfitLoss(
            @PathVariable Long tripId,
            @RequestParam(required = false) Long busCompanyId,
            Authentication authentication) {

        Long companyId = resolveCompanyId(authentication, busCompanyId);
        TripProfitLossResponse response = tripExpenseService.getTripProfitLoss(tripId, companyId);
        return ApiResponse.success(response);
    }

    @PostMapping("/trips/{tripId}")
    @Operation(summary = "Lưu hoặc cập nhật chi phí vận hành chuyến xe (Chỉ OWNER được sửa & Chặn sau 48h)")
    public ApiResponse<TripProfitLossResponse> saveTripExpense(
            @PathVariable Long tripId,
            @RequestParam(required = false) Long busCompanyId,
            @Valid @RequestBody SaveTripExpenseRequest request,
            Authentication authentication) {

        Long companyId = resolveCompanyId(authentication, busCompanyId);
        TripProfitLossResponse response = tripExpenseService.saveTripExpense(tripId, companyId, request);
        return ApiResponse.success(response);
    }

    private Long resolveCompanyId(Authentication authentication, Long busCompanyId) {
        if (authentication != null && authentication.isAuthenticated()) {
            User user = securityService.requireStaffRole(authentication, StaffRole.OWNER);
            if (user != null && user.getBusCompanyId() != null) {
                return user.getBusCompanyId();
            }
        }
        return busCompanyId != null ? busCompanyId : 1L;
    }
}
