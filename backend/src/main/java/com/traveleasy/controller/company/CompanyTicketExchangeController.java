package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.company.exchange.TicketExchangeRequest;
import com.traveleasy.dto.company.exchange.TicketExchangeResponse;
import com.traveleasy.dto.company.exchange.TicketLookupResponse;
import com.traveleasy.entity.User;
import com.traveleasy.repository.UserRepository;
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
 * [S316] Phan He Doi Ve, Doi Gio Chay & Chuyen Ghe Linh Hoat (/company/ticket-exchange)
 * Endpoint chinh thuc: POST /api/v1/company/ticket-exchange (DoD 1)
 * @author Tran Minh Duc (minhdctrn13)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/company/ticket-exchange")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Ticket Exchange", description = "[S316] Doi ve, doi gio chay va tinh toan chenh lech gia ve tu dong - Tran Minh Duc")
public class CompanyTicketExchangeController {

    private final TicketExchangeService ticketExchangeService;
    private final UserRepository userRepository;

    @GetMapping("/lookup")
    @Operation(summary = "Tra cuu thong tin ve goc can doi & kiem tra dieu kien doi ve (AC-S316-01, AC-S316-02)")
    public ApiResponse<TicketLookupResponse> lookupTicket(@RequestParam String ticketCode) {
        log.info("[S316-EXCHANGE] Yeu cau tra cuu ve goc: {}", ticketCode);
        TicketLookupResponse response = ticketExchangeService.lookupTicket(ticketCode);
        return ApiResponse.success(response);
    }

    @PostMapping("/calculate-difference")
    @Operation(summary = "Tinh toan so tien chenh lech giua ve cu va chuyen xe moi (AC-S316-05)")
    public ApiResponse<Map<String, Object>> calculateDifference(
            @RequestParam String oldTicketCode,
            @RequestParam Long newTripId) {
        log.info("[S316-EXCHANGE] Tinh toan chenh lech gia ve {} sang chuyen moi {}", oldTicketCode, newTripId);
        Map<String, Object> result = ticketExchangeService.calculateDifference(oldTicketCode, newTripId);
        return ApiResponse.success(result);
    }

    @PostMapping
    @Operation(summary = "Xu ly doi ve va luu nhat ky vao ticket_exchange_logs (DoD 1, DoD 2, DoD 3)")
    public ApiResponse<TicketExchangeResponse> exchangeTicket(
            @Valid @RequestBody TicketExchangeRequest request,
            Authentication authentication) {
        log.info("[S316-EXCHANGE] Thuc hien doi ve: oldTicket={}, newTrip={}, newSeat={}",
                request.getOldTicketCode(), request.getNewTripId(), request.getNewSeatNumber());

        User currentUser = null;
        if (authentication != null && authentication.isAuthenticated() && authentication.getName() != null) {
            currentUser = userRepository.findByEmail(authentication.getName()).orElse(null);
        }

        TicketExchangeResponse response = ticketExchangeService.exchangeTicket(request, currentUser);
        return ApiResponse.success(response);
    }

    @PostMapping("/confirm")
    @Operation(summary = "Alias tuong thich cho cac client cu: Thuc hien doi ve va cap nhat trang thai")
    public ApiResponse<TicketExchangeResponse> confirmExchange(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        String oldTicketCode = (String) body.getOrDefault("oldTicketCode", "");
        String newSeatCode = (String) body.getOrDefault("newSeatCode", body.getOrDefault("newSeatNumber", ""));
        Object newTripIdObj = body.getOrDefault("newTripId", 0L);
        Long newTripId = Long.valueOf(newTripIdObj.toString());
        String note = (String) body.getOrDefault("note", "Doi ve qua he thong quoc te");

        TicketExchangeRequest request = TicketExchangeRequest.builder()
                .oldTicketCode(oldTicketCode)
                .newTripId(newTripId)
                .newSeatNumber(newSeatCode)
                .note(note)
                .build();

        User currentUser = null;
        if (authentication != null && authentication.isAuthenticated() && authentication.getName() != null) {
            currentUser = userRepository.findByEmail(authentication.getName()).orElse(null);
        }

        TicketExchangeResponse response = ticketExchangeService.exchangeTicket(request, currentUser);
        return ApiResponse.success(response);
    }
}
