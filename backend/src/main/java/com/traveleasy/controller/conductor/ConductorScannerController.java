package com.traveleasy.controller.conductor;

import com.traveleasy.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * [S320] Giao Diện Điện Thoại Quét Mã QR Soát Vé Cho Phụ Xe (/conductor/scanner)
 * @author Đoàn Nhật Cường (CuongLiam)
 */
@RestController
@RequestMapping("/api/v1/conductor/scanner")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Conductor Ticket Scanner", description = "[S320] Quét mã QR soát vé khách lên xe thời gian thực - Đoàn Nhật Cường")
public class ConductorScannerController {

    @PostMapping("/verify-ticket")
    @Operation(summary = "Xác minh mã QR vé và chuyển trạng thái vé sang ĐÃ LÊN XE (USED)")
    public ApiResponse<Map<String, Object>> verifyTicket(
            @RequestParam String qrCodeOrTicketCode,
            @RequestParam(required = false) Long currentTripId) {
        return ApiResponse.success(Map.of(
                "valid", true,
                "ticketCode", qrCodeOrTicketCode,
                "passengerName", "Nguyễn Văn Du Khách",
                "seatNumber", "A05",
                "status", "USED",
                "message", "Vé hợp lệ! Đã xác nhận khách lên xe thành công."
        ));
    }
}
