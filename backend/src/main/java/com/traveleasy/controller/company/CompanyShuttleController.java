package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.security.CompanySecurityService;
import com.traveleasy.dto.shuttle.*;
import com.traveleasy.entity.ShuttleRequestStatus;
import com.traveleasy.entity.StaffRole;
import com.traveleasy.entity.User;
import com.traveleasy.service.company.CompanyShuttleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * [S317] Phân Hệ Quản Lý Xe Trung Chuyển Đón/Trả Khách Tận Nhà (/company/shuttles)
 * Hỗ trợ bộ lọc theo Chuyến xe, Khung giờ đón và Gán tài xế nhanh
 * BẢO MẬT: Chỉ vai trò OWNER và DISPATCHER được quyền truy cập; CASHIER bị chặn 403.
 * @author Trần Minh Đức (tranduc2601)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/company/shuttles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Shuttle Operations", description = "[S317] Điều phối xe trung chuyển đón gom khách tận nhà - Trần Minh Đức")
public class CompanyShuttleController {

    private final CompanyShuttleService shuttleService;
    private final CompanySecurityService securityService;

    @GetMapping({"", "/requests"})
    @Operation(summary = "Lấy danh sách yêu cầu trung chuyển theo bộ lọc (Chuyến xe, Khung giờ, Trạng thái)")
    public ApiResponse<List<ShuttleRequestResponse>> getShuttleRequests(
            @RequestParam(required = false) Long busCompanyId,
            @RequestParam(required = false) Long mainTripId,
            @RequestParam(required = false) Long tripId,
            @RequestParam(required = false) String timeSlot,
            @RequestParam(required = false) ShuttleRequestStatus status,
            Authentication authentication) {

        Long effectiveCompanyId = resolveCompanyId(authentication, busCompanyId);
        Long effectiveTripId = mainTripId != null ? mainTripId : tripId;

        List<ShuttleRequestResponse> list = shuttleService.getShuttleRequests(
                effectiveCompanyId, effectiveTripId, timeSlot, status);

        return ApiResponse.success(list);
    }

    @GetMapping({"/{id}", "/requests/{id}"})
    @Operation(summary = "Lấy chi tiết một yêu cầu đón trung chuyển")
    public ApiResponse<ShuttleRequestResponse> getShuttleRequestById(
            @PathVariable Long id,
            @RequestParam(required = false) Long busCompanyId,
            Authentication authentication) {

        Long effectiveCompanyId = resolveCompanyId(authentication, busCompanyId);
        return ApiResponse.success(shuttleService.getShuttleRequestById(id, effectiveCompanyId));
    }

    @PostMapping({"", "/requests"})
    @Operation(summary = "Tạo yêu cầu đón trung chuyển mới (Có validation Lead Time >= 120p & Bán kính <= 10km)")
    public ApiResponse<ShuttleRequestResponse> createShuttleRequest(
            @Valid @RequestBody CreateShuttleRequest request,
            @RequestParam(required = false) Long busCompanyId,
            Authentication authentication) {

        Long effectiveCompanyId = resolveCompanyId(authentication, busCompanyId != null ? busCompanyId : request.getBusCompanyId());
        ShuttleRequestResponse created = shuttleService.createShuttleRequest(request, effectiveCompanyId);
        return ApiResponse.success("Đăng ký đón trung chuyển thành công! Bác tài sẽ gọi trước 30 phút.", created);
    }

    @PutMapping({"/{id}", "/requests/{id}"})
    @Operation(summary = "Cập nhật thông tin yêu cầu đón trung chuyển")
    public ApiResponse<ShuttleRequestResponse> updateShuttleRequest(
            @PathVariable Long id,
            @Valid @RequestBody UpdateShuttleRequest request,
            @RequestParam(required = false) Long busCompanyId,
            Authentication authentication) {

        Long effectiveCompanyId = resolveCompanyId(authentication, busCompanyId);
        return ApiResponse.success("Cập nhật yêu cầu trung chuyển thành công!",
                shuttleService.updateShuttleRequest(id, request, effectiveCompanyId));
    }

    @PutMapping({"/{id}/assign", "/requests/{id}/assign"})
    @PostMapping({"/{id}/assign", "/requests/{id}/assign"})
    @Operation(summary = "Gán tài xế nhanh và biển số xe trung chuyển 7-16 chỗ")
    public ApiResponse<ShuttleRequestResponse> assignDriver(
            @PathVariable Long id,
            @Valid @RequestBody AssignDriverRequest request,
            @RequestParam(required = false) Long busCompanyId,
            Authentication authentication) {

        Long effectiveCompanyId = resolveCompanyId(authentication, busCompanyId);
        ShuttleRequestResponse res = shuttleService.assignDriver(id, request, effectiveCompanyId);
        return ApiResponse.success("Gán tài xế xe trung chuyển thành công!", res);
    }

    @PatchMapping({"/{id}/status", "/requests/{id}/status"})
    @PutMapping({"/{id}/status", "/requests/{id}/status"})
    @Operation(summary = "Cập nhật trạng thái đón khách trung chuyển")
    public ApiResponse<ShuttleRequestResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam ShuttleRequestStatus status,
            @RequestParam(required = false) Long busCompanyId,
            Authentication authentication) {

        Long effectiveCompanyId = resolveCompanyId(authentication, busCompanyId);
        ShuttleRequestResponse res = shuttleService.updateStatus(id, status, effectiveCompanyId);
        return ApiResponse.success("Cập nhật trạng thái đón trung chuyển thành công!", res);
    }

    private Long resolveCompanyId(Authentication authentication, Long explicitCompanyId) {
        if (authentication != null && authentication.isAuthenticated()) {
            User user = securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.DISPATCHER);
            if (user != null && user.getBusCompanyId() != null) {
                return user.getBusCompanyId();
            }
        }
        return explicitCompanyId != null ? explicitCompanyId : 14L;
    }
}
