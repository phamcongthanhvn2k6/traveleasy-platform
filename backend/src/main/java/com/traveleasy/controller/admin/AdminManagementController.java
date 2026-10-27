package com.traveleasy.controller.admin;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.admin.*;
import com.traveleasy.entity.*;
import com.traveleasy.service.admin.AdminManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Platform Management", description = "Bộ API quản trị toàn diện cho TravelEasy Admin Portal")
public class AdminManagementController {

    private final AdminManagementService adminManagementService;

    // ==========================================
    // 1. QUẢN LÝ NGƯỜI DÙNG (/admin/users)
    // ==========================================
    @GetMapping("/users")
    @Operation(summary = "Danh sách người dùng (hỗ trợ lọc vai trò, trạng thái, tìm kiếm)")
    public ApiResponse<List<UserAdminResponse>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ApiResponse.success(adminManagementService.getAllUsers(role, status, search));
    }

    @PostMapping("/users")
    @Operation(summary = "Tạo mới tài khoản người dùng bởi Admin")
    public ApiResponse<UserAdminResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ApiResponse.success("Tạo người dùng thành công", adminManagementService.createUser(request));
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Cập nhật thông tin người dùng (Họ tên, SĐT, Vai trò)")
    public ApiResponse<UserAdminResponse> updateUser(@PathVariable Long id, @Valid @RequestBody CreateUserRequest request) {
        return ApiResponse.success("Cập nhật người dùng thành công", adminManagementService.updateUser(id, request));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Xoá tài khoản người dùng")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        adminManagementService.deleteUser(id);
        return ApiResponse.success("Xoá người dùng thành công", null);
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Khoá hoặc mở khoá tài khoản người dùng (ACTIVE <-> LOCKED)")
    public ApiResponse<UserAdminResponse> toggleUserStatus(@PathVariable Long id) {
        return ApiResponse.success("Cập nhật trạng thái người dùng thành công", adminManagementService.toggleUserStatus(id));
    }

    // ==========================================
    // 2. QUẢN LÝ ĐỐI TÁC NHÀ XE (/admin/bus-companies)
    // ==========================================
    @GetMapping("/bus-companies")
    @Operation(summary = "Danh sách nhà xe đối tác (lọc theo tab ALL, PENDING, ACTIVE, SUSPENDED)")
    public ApiResponse<List<BusCompanyAdminResponse>> getBusCompanies(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ApiResponse.success(adminManagementService.getAllBusCompanies(status, search));
    }

    @PostMapping("/bus-companies")
    @Operation(summary = "Thêm mới đối tác nhà xe vào sàn")
    public ApiResponse<BusCompanyAdminResponse> createBusCompany(@Valid @RequestBody CreateBusCompanyRequest request) {
        return ApiResponse.success("Tạo nhà xe thành công", adminManagementService.createBusCompany(request));
    }

    @PutMapping("/bus-companies/{id}")
    @Operation(summary = "Cập nhật thông tin đối tác nhà xe")
    public ApiResponse<BusCompanyAdminResponse> updateBusCompany(
            @PathVariable Long id,
            @Valid @RequestBody CreateBusCompanyRequest request) {
        return ApiResponse.success("Cập nhật nhà xe thành công", adminManagementService.updateBusCompany(id, request));
    }

    @DeleteMapping("/bus-companies/{id}")
    @Operation(summary = "Xoá đối tác nhà xe khỏi hệ thống")
    public ApiResponse<Void> deleteBusCompany(@PathVariable Long id) {
        adminManagementService.deleteBusCompany(id);
        return ApiResponse.success("Xoá nhà xe thành công", null);
    }

    @PatchMapping("/bus-companies/{id}/status")
    @Operation(summary = "Phê duyệt hoặc tạm ngưng hoạt động nhà xe (ACTIVE, SUSPENDED, PENDING_APPROVAL)")
    public ApiResponse<BusCompanyAdminResponse> updateCompanyStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ApiResponse.success("Cập nhật trạng thái nhà xe thành công", adminManagementService.updateCompanyStatus(id, status));
    }

    // ==========================================
    // 3. DANH MỤC LOẠI GHẾ & MẪU SƠ ĐỒ GHẾ (/admin/seat-catalog/*)
    // ==========================================
    @GetMapping("/seat-types")
    @Operation(summary = "Danh sách loại ghế chuẩn hoá (SEATED, SLEEPER, LIMOUSINE...)")
    public ApiResponse<List<SeatType>> getSeatTypes() {
        return ApiResponse.success(adminManagementService.getAllSeatTypes());
    }

    @PostMapping("/seat-types")
    @Operation(summary = "Tạo mới loại ghế trong danh mục hệ thống")
    public ApiResponse<SeatType> createSeatType(@Valid @RequestBody SeatTypeRequest request) {
        return ApiResponse.success("Tạo loại ghế thành công", adminManagementService.createSeatType(request));
    }

    @PatchMapping("/seat-types/{code}/status")
    @Operation(summary = "Cập nhật trạng thái loại ghế (ACTIVE, DEPRECATED)")
    public ApiResponse<SeatType> updateSeatTypeStatus(@PathVariable String code, @RequestParam String status) {
        return ApiResponse.success("Cập nhật trạng thái loại ghế thành công", adminManagementService.updateSeatTypeStatus(code, status));
    }

    @GetMapping("/seat-templates")
    @Operation(summary = "Danh sách mẫu sơ đồ ghế (2 tầng 34 chỗ, 1 tầng 24 chỗ...)")
    public ApiResponse<List<SeatLayoutTemplate>> getSeatTemplates() {
        return ApiResponse.success(adminManagementService.getAllSeatTemplates());
    }

    @PostMapping("/seat-templates")
    @Operation(summary = "Tạo mới mẫu sơ đồ ghế")
    public ApiResponse<SeatLayoutTemplate> createSeatTemplate(@Valid @RequestBody SeatTemplateRequest request) {
        return ApiResponse.success("Tạo mẫu sơ đồ ghế thành công", adminManagementService.createSeatTemplate(request));
    }

    @DeleteMapping("/seat-templates/{id}")
    @Operation(summary = "Xoá mẫu sơ đồ ghế")
    public ApiResponse<Void> deleteSeatTemplate(@PathVariable Long id) {
        adminManagementService.deleteSeatTemplate(id);
        return ApiResponse.success("Xoá mẫu sơ đồ ghế thành công", null);
    }

    // ==========================================
    // 4. DANH MỤC ĐỊA ĐIỂM MASTER (/admin/locations)
    // ==========================================
    @GetMapping("/locations")
    @Operation(summary = "Danh mục bến xe và địa điểm cấp hệ thống")
    public ApiResponse<List<Location>> getLocations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String province) {
        return ApiResponse.success(adminManagementService.getAllLocations(search, type, province));
    }

    @PostMapping("/locations")
    @Operation(summary = "Tạo mới địa điểm master")
    public ApiResponse<Location> createLocation(@Valid @RequestBody LocationRequest request) {
        return ApiResponse.success("Tạo địa điểm thành công", adminManagementService.createLocation(request));
    }

    @PutMapping("/locations/{id}")
    @Operation(summary = "Cập nhật thông tin địa điểm master")
    public ApiResponse<Location> updateLocation(@PathVariable Long id, @Valid @RequestBody LocationRequest request) {
        return ApiResponse.success("Cập nhật địa điểm thành công", adminManagementService.updateLocation(id, request));
    }

    @DeleteMapping("/locations/{id}")
    @Operation(summary = "Xoá địa điểm khỏi hệ thống")
    public ApiResponse<Void> deleteLocation(@PathVariable Long id) {
        adminManagementService.deleteLocation(id);
        return ApiResponse.success("Xoá địa điểm thành công", null);
    }

    // ==========================================
    // 5. BANNER & QUẢNG CÁO (/admin/banners)
    // ==========================================
    @GetMapping("/banners")
    @Operation(summary = "Danh sách banner chiến dịch trên trang chủ và sàn")
    public ApiResponse<List<Banner>> getBanners(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String position,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(adminManagementService.getAllBanners(search, position, status));
    }

    @PostMapping("/banners")
    @Operation(summary = "Tạo mới banner quảng cáo")
    public ApiResponse<Banner> createBanner(@Valid @RequestBody BannerRequest request) {
        return ApiResponse.success("Tạo banner thành công", adminManagementService.createBanner(request));
    }

    @PatchMapping("/banners/{id}/status")
    @Operation(summary = "Bật/Tắt hiển thị banner (ACTIVE <-> INACTIVE)")
    public ApiResponse<Banner> toggleBannerStatus(@PathVariable Long id) {
        return ApiResponse.success("Cập nhật trạng thái banner thành công", adminManagementService.toggleBannerStatus(id));
    }

    @DeleteMapping("/banners/{id}")
    @Operation(summary = "Xoá banner khỏi hệ thống")
    public ApiResponse<Void> deleteBanner(@PathVariable Long id) {
        adminManagementService.deleteBanner(id);
        return ApiResponse.success("Xoá banner thành công", null);
    }

    // ==========================================
    // 6. CỔNG THANH TOÁN & THÔNG BÁO (/admin/gateways)
    // ==========================================
    @GetMapping("/gateways")
    @Operation(summary = "Danh sách cổng thanh toán (VNPAY, MoMo, ZaloPay, VietQR) và thông báo (Telegram, Twilio)")
    public ApiResponse<List<GatewayConfig>> getGateways() {
        return ApiResponse.success(adminManagementService.getAllGateways());
    }

    @PatchMapping("/gateways/{provider}/status")
    @Operation(summary = "Bật/Tắt cổng thanh toán hoặc cổng thông báo")
    public ApiResponse<GatewayConfig> toggleGatewayStatus(@PathVariable String provider) {
        return ApiResponse.success("Cập nhật cổng kết nối thành công", adminManagementService.toggleGatewayStatus(provider));
    }

    // ==========================================
    // 7. BÁO CÁO ĐÁNH GIÁ VI PHẠM (/admin/review-reports)
    // ==========================================
    @GetMapping("/review-reports")
    @Operation(summary = "Danh sách báo cáo đánh giá vi phạm cần xử lý")
    public ApiResponse<List<ReviewReport>> getReviewReports(@RequestParam(required = false) String status) {
        return ApiResponse.success(adminManagementService.getAllReviewReports(status));
    }

    @PatchMapping("/review-reports/{id}/status")
    @Operation(summary = "Phê duyệt (ẩn đánh giá) hoặc từ chối báo cáo vi phạm (APPROVED, REJECTED)")
    public ApiResponse<ReviewReport> updateReviewReportStatus(@PathVariable Long id, @RequestParam String status) {
        return ApiResponse.success("Xử lý báo cáo thành công", adminManagementService.updateReviewReportStatus(id, status));
    }

    // ==========================================
    // 8. CHÍNH SÁCH HUỶ VÉ SÀN (/admin/cancellation-policies)
    // ==========================================
    @GetMapping("/cancellation-policies")
    @Operation(summary = "Danh sách chính sách hoàn huỷ vé (Mặc định sàn + Tuỳ chỉnh nhà xe)")
    public ApiResponse<List<CancellationPolicy>> getCancellationPolicies() {
        return ApiResponse.success(adminManagementService.getAllCancellationPolicies());
    }

    @PostMapping("/cancellation-policies")
    @Operation(summary = "Tạo chính sách hoàn huỷ vé mới")
    public ApiResponse<CancellationPolicy> createCancellationPolicy(@Valid @RequestBody CancellationPolicyRequest request) {
        return ApiResponse.success("Tạo chính sách hoàn huỷ thành công", adminManagementService.createCancellationPolicy(request));
    }

    // ==========================================
    // 9. NHẬT KÝ KIỂM TOÁN AUDIT LOGS (/admin/audit-logs)
    // ==========================================
    @GetMapping("/audit-logs")
    @Operation(summary = "Lịch sử thao tác kiểm toán toàn hệ thống (Before/After diff)")
    public ApiResponse<List<AuditLog>> getAuditLogs(@RequestParam(required = false) String action) {
        return ApiResponse.success(adminManagementService.getAllAuditLogs(action));
    }

    // ==========================================
    // 10. QUẢN LÝ TUYẾN ĐƯỜNG (/admin/routes)
    // ==========================================
    @GetMapping("/routes")
    @Operation(summary = "Danh sách tuyến đường trên toàn sàn")
    public ApiResponse<List<RouteAdminResponse>> getRoutes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long companyId) {
        return ApiResponse.success(adminManagementService.getAllRoutes(search, companyId));
    }

    @PostMapping("/routes")
    @Operation(summary = "Tạo mới tuyến đường kết nối các tỉnh thành")
    public ApiResponse<RouteAdminResponse> createRoute(@Valid @RequestBody CreateRouteRequest request) {
        return ApiResponse.success("Tạo tuyến đường thành công", adminManagementService.createRoute(request));
    }

    @PutMapping("/routes/{id}")
    @Operation(summary = "Cập nhật lộ trình, cự ly và thời gian của tuyến đường")
    public ApiResponse<RouteAdminResponse> updateRoute(
            @PathVariable Long id,
            @RequestBody CreateRouteRequest request) {
        return ApiResponse.success("Cập nhật tuyến đường thành công", adminManagementService.updateRoute(id, request));
    }

    @DeleteMapping("/routes/{id}")
    @Operation(summary = "Xoá tuyến đường khỏi hệ thống")
    public ApiResponse<Void> deleteRoute(@PathVariable Long id) {
        adminManagementService.deleteRoute(id);
        return ApiResponse.success("Xoá tuyến đường thành công", null);
    }
}

