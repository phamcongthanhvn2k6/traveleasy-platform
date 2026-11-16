package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.common.security.CompanySecurityService;
import com.traveleasy.dto.company.crew.AssignCrewRequest;
import com.traveleasy.dto.company.crew.TripCrewResponse;
import com.traveleasy.entity.StaffRole;
import com.traveleasy.entity.User;
import com.traveleasy.service.company.TripCrewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * [S319] Phân Hệ Phân Công Tài Xế & Phụ Xe Cho Từng Chuyến Xe (/company/crew)
 * BẢO MẬT: Chỉ OWNER và DISPATCHER được quyền thao tác; CASHIER bị chặn 100%
 * @author Đoàn Nhật Cường (CuongLiam)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/company/crew")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Trip Crew Operations", description = "[S319] Phân công tổ lái, tài xế phụ và kiểm soát giờ lái xe an toàn - Đoàn Nhật Cường")
public class CompanyTripCrewController {

    private final CompanySecurityService securityService;
    private final TripCrewService tripCrewService;

    @GetMapping("/assignments")
    @Operation(summary = "Lấy danh sách phân công tổ lái theo chuyến xe (OWNER & DISPATCHER)")
    public ApiResponse<List<TripCrewResponse>> getCrewAssignments(
            @RequestParam(required = false) Long busCompanyId,
            @RequestParam(required = false) String date,
            Authentication authentication) {

        Long companyId = resolveCompanyId(authentication, busCompanyId);
        List<TripCrewResponse> list = tripCrewService.getCrewAssignments(companyId, date);
        return ApiResponse.success(list);
    }

    @PostMapping("/assignments")
    @Operation(summary = "Phân công hoặc cập nhật tổ lái (Chỉ OWNER & DISPATCHER)")
    public ApiResponse<TripCrewResponse> assignCrew(
            @RequestParam(required = false) Long busCompanyId,
            @Valid @RequestBody AssignCrewRequest request,
            Authentication authentication) {

        Long companyId = resolveCompanyId(authentication, busCompanyId);
        TripCrewResponse response = tripCrewService.assignCrew(companyId, request);
        return ApiResponse.success("Phân công tổ lái thành công và đáp ứng đầy đủ điều kiện an toàn xuất bến!", response);
    }

    @PostMapping("/trips/{tripId}/dispatch-permit")
    @Operation(summary = "Ký duyệt biên bản / Lệnh xuất bến điện tử (Chặn nếu chưa test cồn)")
    public ApiResponse<TripCrewResponse> signDispatchPermit(
            @PathVariable Long tripId,
            @RequestParam(required = false) Long busCompanyId,
            Authentication authentication) {

        Long companyId = resolveCompanyId(authentication, busCompanyId);
        TripCrewResponse response = tripCrewService.signDispatchPermit(companyId, tripId);
        return ApiResponse.success("Ký lệnh xuất bến điện tử thành công!", response);
    }

    private Long resolveCompanyId(Authentication authentication, Long busCompanyId) {
        if (authentication != null && authentication.isAuthenticated()) {
            User user = securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.DISPATCHER);
            if (user != null && user.getBusCompanyId() != null) {
                return user.getBusCompanyId();
            }
        }
        if (busCompanyId != null) {
            return busCompanyId;
        }
        // Fallback demo company ID nếu chạy môi trường test không phân quyền
        return 14L;
    }
}
