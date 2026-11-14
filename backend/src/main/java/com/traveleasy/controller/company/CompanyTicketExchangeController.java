package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.security.CompanySecurityService;
import com.traveleasy.dto.company.exchange.TicketExchangeRequest;
import com.traveleasy.dto.company.exchange.TicketExchangeResponse;
import com.traveleasy.dto.company.exchange.TicketLookupResponse;
import com.traveleasy.entity.StaffRole;
import com.traveleasy.entity.User;
import com.traveleasy.service.company.TicketExchangeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * [S316] Phân Hệ Đổi Vé, Đổi Giờ Chạy & Chuyển Ghế Linh Hoạt (/company/ticket-exchange)
 * Endpoint chính thức: POST /api/v1/company/ticket-exchange (DoD 1)
 * BẢO MẬT: Bắt buộc đăng nhập với vai trò OWNER hoặc CASHIER (DoD 5, Review Point #2)
 * @author Trần Minh Đức (tranduc2601)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/company/ticket-exchange")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Ticket Exchange", description = "[S316] Đổi vé, đổi giờ chạy và tính toán chênh lệch giá vé tự động - Trần Minh Đức")
public class CompanyTicketExchangeController {

    private final TicketExchangeService ticketExchangeService;
    private final CompanySecurityService securityService;

    @GetMapping("/lookup")
    @Operation(summary = "Tra cứu thông tin vé gốc cần đổi & kiểm tra điều kiện đổi vé (AC-S316-01, AC-S316-02)")
    public ApiResponse<TicketLookupResponse> lookupTicket(
            @RequestParam String ticketCode,
            Authentication authentication) {
        log.info("[S316-EXCHANGE] Yêu cầu tra cứu vé gốc: {}", ticketCode);
        User staff = null;
        if (authentication != null && authentication.isAuthenticated()) {
            staff = securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER);
        }
        Long companyId = staff != null ? staff.getBusCompanyId() : null;
        TicketLookupResponse response = ticketExchangeService.lookupTicket(ticketCode, companyId);
        return ApiResponse.success(response);
    }

    @PostMapping("/calculate-difference")
    @Operation(summary = "Tính toán số tiền chênh lệch giữa vé cũ và chuyến xe mới (AC-S316-05)")
    public ApiResponse<Map<String, Object>> calculateDifference(
            @RequestParam String oldTicketCode,
            @RequestParam Long newTripId,
            Authentication authentication) {
        log.info("[S316-EXCHANGE] Tính toán chênh lệch giá vé {} sang chuyến mới {}", oldTicketCode, newTripId);
        User staff = null;
        if (authentication != null && authentication.isAuthenticated()) {
            staff = securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER);
        }
        Long companyId = staff != null ? staff.getBusCompanyId() : null;
        Map<String, Object> result = ticketExchangeService.calculateDifference(oldTicketCode, newTripId, companyId);
        return ApiResponse.success(result);
    }

    @PostMapping
    @Operation(summary = "Xử lý đổi vé và lưu nhật ký vào ticket_exchange_logs (DoD 1, DoD 2, DoD 3)")
    public ApiResponse<TicketExchangeResponse> exchangeTicket(
            @Valid @RequestBody TicketExchangeRequest request,
            Authentication authentication) {
        log.info("[S316-EXCHANGE] Thực hiện đổi vé: oldTicket={}, newTrip={}, newSeat={}",
                request.getOldTicketCode(), request.getNewTripId(), request.getNewSeatNumber());

        User staff = securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER);
        TicketExchangeResponse response = ticketExchangeService.exchangeTicket(request, staff);
        return ApiResponse.success(response);
    }

    @PostMapping("/confirm")
    @Operation(summary = "Alias tương thích cho các client cũ: Thực hiện đổi vé và cập nhật trạng thái")
    public ApiResponse<TicketExchangeResponse> confirmExchange(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        String oldTicketCode = (String) body.getOrDefault("oldTicketCode", "");
        String newSeatCode = (String) body.getOrDefault("newSeatCode", body.getOrDefault("newSeatNumber", ""));
        Object newTripIdObj = body.getOrDefault("newTripId", 0L);
        Long newTripId = Long.valueOf(newTripIdObj.toString());
        String note = (String) body.getOrDefault("note", "Đổi vé tại quầy nhà xe");

        TicketExchangeRequest request = TicketExchangeRequest.builder()
                .oldTicketCode(oldTicketCode)
                .newTripId(newTripId)
                .newSeatNumber(newSeatCode)
                .note(note)
                .build();

        User staff = securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER);
        TicketExchangeResponse response = ticketExchangeService.exchangeTicket(request, staff);
        return ApiResponse.success(response);
    }
}
