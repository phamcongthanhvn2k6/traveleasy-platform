package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.pos.*;
import com.traveleasy.service.company.CompanyPosService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * [S304][POS] Giao diện & API Bán Vé Nhanh Tại Quầy Bến Xe POS (/company/pos) & In Vé Nhiệt 80mm
 * @author Phạm Thanh Phong
 */
@RestController
@RequestMapping({"/api/v1/company/pos", "/api/company/pos"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company POS Terminal", description = "[S304] Phân hệ bán vé nhanh tại quầy bến xe POS, in hóa đơn nhiệt 80mm, quản lý doanh số ca trực và xuất phiếu Z-Report - Phạm Thanh Phong")
public class CompanyPosController {

    private final CompanyPosService companyPosService;

    @PostMapping("/issue-ticket")
    @Operation(summary = "Xuất vé nhanh tại quầy POS bến xe, khóa ghế đồng thời tức thì và trả dữ liệu hóa đơn nhiệt 80mm kèm mã QR")
    public ApiResponse<PosReceiptResponse> issuePosTicket(
            @Valid @RequestBody PosIssueTicketRequest request,
            Authentication authentication
    ) {
        PosReceiptResponse receipt = companyPosService.issuePosTicket(request, authentication);
        return ApiResponse.success("Xuất vé quầy POS thành công và sẵn sàng in hóa đơn nhiệt 80mm", receipt);
    }

    @GetMapping("/shifts/current")
    @Operation(summary = "Lấy thông tin ca trực POS đang mở của nhà xe tại quầy bến xe")
    public ApiResponse<PosShiftReportResponse> getCurrentShift(
            @RequestParam(required = false) Long busCompanyId,
            Authentication authentication
    ) {
        return ApiResponse.success(companyPosService.getCurrentShift(busCompanyId, authentication));
    }

    @GetMapping("/shifts")
    @Operation(summary = "Báo cáo doanh số theo ca làm việc của từng nhân viên tại quầy POS")
    public ApiResponse<List<PosShiftReportResponse>> getShiftSalesReports(
            @RequestParam(required = false) Long busCompanyId,
            Authentication authentication
    ) {
        return ApiResponse.success(companyPosService.getShiftSalesReports(busCompanyId, authentication));
    }

    @PostMapping("/shifts/open")
    @Operation(summary = "Mở ca trực POS mới cho nhân viên thu ngân tại bến xe")
    public ApiResponse<PosShiftReportResponse> openShift(
            @RequestBody PosOpenShiftRequest request,
            Authentication authentication
    ) {
        PosShiftReportResponse shift = companyPosService.openShift(request, authentication);
        return ApiResponse.success("Mở ca trực POS thành công! Quầy đã sẵn sàng bán vé và in hóa đơn nhiệt 80mm.", shift);
    }

    @PostMapping("/shifts/{shiftId}/close")
    @Operation(summary = "Kết ca trực POS và xuất dữ liệu phiếu Z-Report tổng kết tiền nộp thủ quỹ")
    public ApiResponse<PosShiftReportResponse> closeShift(
            @PathVariable Long shiftId,
            @RequestBody(required = false) PosCloseShiftRequest request,
            Authentication authentication
    ) {
        PosShiftReportResponse zReport = companyPosService.closeShift(shiftId, request, authentication);
        return ApiResponse.success("Đã kết ca trực và xuất biên bản Z-Report thành công!", zReport);
    }

    @GetMapping("/tickets/recent")
    @Operation(summary = "Lấy danh sách vé vừa xuất tại quầy POS để hỗ trợ in lại hóa đơn nhiệt 80mm")
    public ApiResponse<List<PosReceiptResponse>> getRecentPosReceipts(
            @RequestParam(required = false) Long busCompanyId,
            Authentication authentication
    ) {
        return ApiResponse.success(companyPosService.getRecentPosReceipts(busCompanyId, authentication));
    }
}

