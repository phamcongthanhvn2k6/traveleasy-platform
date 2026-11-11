package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.common.security.CompanySecurityService;
import com.traveleasy.dto.company.ClosePosShiftRequest;
import com.traveleasy.dto.company.OpenPosShiftRequest;
import com.traveleasy.dto.company.PosShiftResponse;
import com.traveleasy.dto.company.RecordPosShiftCashSaleRequest;
import com.traveleasy.entity.StaffRole;
import com.traveleasy.entity.User;
import com.traveleasy.service.company.PosShiftService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * [S305] Phân Hệ Quản Lý Ca Trực & Bàn Giao Tiền Mặt Quầy Bến Xe POS (/company/shifts)
 * BẢO MẬT: Chỉ OWNER và CASHIER được thao tác; DISPATCHER bị chặn
 * @author Đoàn Nhật Cường (CuongLiam)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/company/shifts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company POS Shift Management", description = "[S305] Quản lý mở ca, bán vé quầy, kết ca Z-Report và nộp tiền mặt - Đoàn Nhật Cường")
public class CompanyPosShiftController {

    private final CompanySecurityService securityService;
    private final PosShiftService posShiftService;

    @GetMapping
    @Operation(summary = "Lấy danh sách ca trực của nhà xe đăng nhập")
    public ApiResponse<List<PosShiftResponse>> listShifts(Authentication authentication) {
        User staff = requireStaff(authentication);
        return ApiResponse.success(posShiftService.listShifts(requireCompanyId(staff)));
    }

    @GetMapping("/current")
    @Operation(summary = "Lấy ca trực đang mở của nhân viên hiện tại")
    public ApiResponse<PosShiftResponse> getCurrentShift(Authentication authentication) {
        User staff = requireStaff(authentication);
        return ApiResponse.success(posShiftService.getCurrentShift(requireCompanyId(staff), staff.getId()));
    }

    @PostMapping("/open")
    @Operation(summary = "Mở ca trực quầy vé")
    public ApiResponse<PosShiftResponse> openShift(
            @Valid @RequestBody OpenPosShiftRequest request,
            Authentication authentication) {
        User staff = requireStaff(authentication);
        return ApiResponse.success("Mở ca trực thành công", posShiftService.openShift(requireCompanyId(staff), staff.getId(), request));
    }

    @PostMapping("/close")
    @Operation(summary = "Chốt ca và ghi nhận Z-Report")
    public ApiResponse<PosShiftResponse> closeShift(
            @Valid @RequestBody ClosePosShiftRequest request,
            Authentication authentication) {
        User staff = requireStaff(authentication);
        return ApiResponse.success("Đã chốt ca và lưu biên bản đối soát", posShiftService.closeShift(requireCompanyId(staff), request));
    }

    @PostMapping("/{shiftId}/sales")
    @Operation(summary = "Ghi nhận giao dịch tiền mặt thủ công khi POS gặp sự cố")
    public ApiResponse<PosShiftResponse> recordCashSale(
            @PathVariable Long shiftId,
            @Valid @RequestBody RecordPosShiftCashSaleRequest request,
            Authentication authentication) {
        User staff = requireStaff(authentication);
        return ApiResponse.success("Đã ghi nhận giao dịch tiền mặt", posShiftService.recordManualCashSale(requireCompanyId(staff), shiftId, request));
    }

    private User requireStaff(Authentication authentication) {
        return securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER);
    }

    private Long requireCompanyId(User staff) {
        if (staff.getBusCompanyId() == null || staff.getBusCompanyId() <= 0L) {
            throw new AppException(ErrorCode.FORBIDDEN, "Tài khoản chưa được gắn vào nhà xe.");
        }
        return staff.getBusCompanyId();
    }
}
