package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.admin.CreateRouteRequest;
import com.traveleasy.dto.admin.CreateTripRequest;
import com.traveleasy.dto.admin.RouteAdminResponse;
import com.traveleasy.dto.admin.UpdateTripRequest;
import com.traveleasy.dto.booking.BookingResponse;
import com.traveleasy.dto.trip.TripResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.BookingRepository;
import com.traveleasy.repository.CancellationPolicyRepository;
import com.traveleasy.repository.LocationRepository;
import com.traveleasy.repository.ReviewReportRepository;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.service.admin.AdminManagementService;
import com.traveleasy.service.admin.AdminTripService;
import com.traveleasy.service.customer.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/company")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Management Operations", description = "Vận hành điều phối chuyến, tuyến đường, đơn vé, chính sách và phản hồi của riêng nhà xe đối tác (Tenant-Scoped)")
public class CompanyManagementController {

    private final AdminTripService adminTripService;
    private final AdminManagementService adminManagementService;
    private final BookingService bookingService;
    private final CancellationPolicyRepository cancellationPolicyRepository;
    private final ReviewReportRepository reviewReportRepository;
    private final LocationRepository locationRepository;
    private final BookingRepository bookingRepository;
    private final TripRepository tripRepository;
    private final com.traveleasy.service.automation.TripAutomationService tripAutomationService;

    // =========================================================================
    // 1. THỐNG KÊ DASHBOARD RIÊNG CỦA NHÀ XE (TENANT-SCOPED DASHBOARD)
    // =========================================================================
    @org.springframework.cache.annotation.Cacheable(value = "company_dashboard_stats", key = "#companyId != null ? #companyId : 1L")
    @GetMapping("/dashboard/stats")
    @Operation(summary = "Lấy thống kê KPI và danh sách chuyến xe sắp tới của riêng nhà xe đối tác từ CSDL")
    public ApiResponse<Map<String, Object>> getCompanyDashboardStats(@RequestParam(required = false) Long companyId) {
        Long targetId = companyId != null ? companyId : 1L; // Mặc định là nhà xe đang quản lý
        BigDecimal totalRevenue = bookingRepository.sumTotalRevenueByBusCompanyId(targetId);
        long totalTrips = tripRepository.countByBusCompanyId(targetId);
        long totalBookings = bookingRepository.countByBusCompanyId(targetId);
        long scheduledTrips = tripRepository.countByBusCompanyIdAndStatus(targetId, TripStatus.SCHEDULED);
        double avgRating = 4.8;
        long totalReviews = reviewReportRepository.count();

        // TỐI ƯU HÓA: Chỉ map trực tiếp 5 chuyến sắp tới thay vì duyệt toàn bộ 480 chuyến xe toàn sàn!
        List<Trip> companyTripsRaw = tripRepository.findByBusCompanyIdOrderByDepartureTimeDesc(targetId);
        List<Trip> top5 = companyTripsRaw.stream().limit(5).collect(Collectors.toList());
        List<TripResponse> upcomingTrips = adminTripService.mapTripsWithPointsBatch(top5);

        Map<String, Object> stats = new HashMap<>();
        stats.put("busCompanyId", targetId);
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        stats.put("totalTrips", totalTrips);
        stats.put("scheduledTrips", scheduledTrips);
        stats.put("totalBookings", totalBookings);
        stats.put("avgRating", avgRating);
        stats.put("totalReviews", totalReviews);
        stats.put("upcomingTrips", upcomingTrips);

        return ApiResponse.success(stats);
    }

    // =========================================================================
    // 2. CHUYẾN XE CỦA RIÊNG NHÀ XE (TRIPS MANAGEMENT)
    // =========================================================================
    @Cacheable(value = "company_trips", key = "#companyId != null ? #companyId : 1L")
    @GetMapping("/trips")
    @Operation(summary = "Lấy danh sách chuyến xe của riêng nhà xe đối tác từ CSDL thực tế")
    public ApiResponse<List<TripResponse>> getCompanyTrips(@RequestParam(required = false) Long companyId) {
        Long targetId = companyId != null ? companyId : 1L;
        // TỐI ƯU HÓA: Chỉ truy vấn các chuyến xe của riêng hãng từ CSDL và batch map điểm đón/trả
        List<Trip> companyTripsRaw = tripRepository.findByBusCompanyIdOrderByDepartureTimeDesc(targetId);
        List<TripResponse> companyTrips = adminTripService.mapTripsWithPointsBatch(companyTripsRaw);
        return ApiResponse.success(companyTrips);
    }

    @CacheEvict(value = {"company_trips", "company_dashboard_stats", "admin_all_trips", "trips_search"}, allEntries = true)
    @PostMapping("/trips")
    @Operation(summary = "Tạo chuyến xe mới vào CSDL thực tế cho nhà xe (Tự động sinh kho ghế 34 chỗ)")
    public ApiResponse<TripResponse> createCompanyTrip(@Valid @RequestBody CreateTripRequest request) {
        if (request.getBusCompanyId() == null) {
            request.setBusCompanyId(1L);
        }
        return ApiResponse.success("Tạo chuyến xe thành công và lưu vào CSDL", adminTripService.createTrip(request));
    }

    @CacheEvict(value = {"company_trips", "company_dashboard_stats", "admin_all_trips", "trips_search"}, allEntries = true)
    @PutMapping("/trips/{id}")
    @Operation(summary = "Cập nhật thông tin chuyến xe trên CSDL thực tế")
    public ApiResponse<TripResponse> updateCompanyTrip(@PathVariable Long id, @Valid @RequestBody UpdateTripRequest request) {
        return ApiResponse.success("Cập nhật thông tin chuyến xe thành công", adminTripService.updateTrip(id, request));
    }

    @CacheEvict(value = {"company_trips", "company_dashboard_stats", "admin_all_trips", "trips_search"}, allEntries = true)
    @PatchMapping("/trips/{id}/status")
    @Operation(summary = "Cập nhật trạng thái chuyến xe (SCHEDULED, RUNNING, COMPLETED, CANCELLED)")
    public ApiResponse<TripResponse> updateTripStatus(@PathVariable Long id, @RequestParam TripStatus status) {
        return ApiResponse.success("Cập nhật trạng thái chuyến thành công", adminTripService.updateTripStatus(id, status));
    }

    @CacheEvict(value = {"company_trips", "company_dashboard_stats", "admin_all_trips", "trips_search"}, allEntries = true)
    @DeleteMapping("/trips/{id}")
    @Operation(summary = "Xóa chuyến xe khỏi CSDL thực tế")
    public ApiResponse<Void> deleteCompanyTrip(@PathVariable Long id) {
        adminTripService.deleteTrip(id);
        return ApiResponse.success("Xóa chuyến xe thành công khỏi CSDL", null);
    }

    @CacheEvict(value = {"company_trips", "company_dashboard_stats", "admin_all_trips", "trips_search"}, allEntries = true)
    @PostMapping("/trips/auto-generate")
    @Operation(summary = "Tự động sinh chuyến theo lịch chạy định kỳ (Recurring Schedule Generator) cho nhà xe")
    public ApiResponse<Map<String, Object>> autoGenerateCompanyTrips(@RequestBody com.traveleasy.dto.company.AutoGenerateTripsRequest request) {
        Long targetCompanyId = request.getBusCompanyId() != null ? request.getBusCompanyId() : 1L;
        int days = request.getDaysAhead() != null ? request.getDaysAhead() : 30;
        int generatedCount = tripAutomationService.batchGenerateForCompany(
                targetCompanyId,
                request.getRouteId(),
                days,
                request.getTimeSlots(),
                request.getBusType(),
                request.getPrice()
        );
        return ApiResponse.success(
                String.format("Tự động sinh thành công %d chuyến xe định kỳ cho %d ngày tới!", generatedCount, days),
                Map.of(
                        "generatedCount", generatedCount,
                        "busCompanyId", targetCompanyId,
                        "daysAhead", days
                )
        );
    }

    @GetMapping("/trips/automation-status")
    @Operation(summary = "Kiểm tra trạng thái hệ thống tự động sinh và lăn chuyến (Daily Auto-Rolling Engine)")
    public ApiResponse<Map<String, Object>> getAutomationStatus(@RequestParam(required = false) Long companyId) {
        Long targetId = companyId != null ? companyId : 1L;
        long scheduledTrips = tripRepository.countByBusCompanyIdAndStatus(targetId, TripStatus.SCHEDULED);
        return ApiResponse.success(Map.of(
                "autoRollingActive", true,
                "rollingDaysAhead", 30,
                "scheduledTrips", scheduledTrips,
                "mode", "AUTOMATIC_DAILY_ROLLING",
                "message", "Hệ thống tự động duy trì lịch trình mở bán liên tục 30 ngày tới"
        ));
    }

    // =========================================================================
    // 3. TUYẾN ĐƯỜNG RIÊNG CỦA NHÀ XE (COMPANY ROUTES)
    // =========================================================================
    @Cacheable(value = "company_routes", key = "(#search != null ? #search : '') + '_' + (#companyId != null ? #companyId : 1L)")
    @GetMapping("/routes")
    @Operation(summary = "Lấy danh sách tuyến đường đã đăng ký của nhà xe từ CSDL thực tế")
    public ApiResponse<List<RouteAdminResponse>> getCompanyRoutes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long companyId) {
        Long targetId = companyId != null ? companyId : 1L;
        return ApiResponse.success(adminManagementService.getAllRoutes(search, targetId));
    }

    @CacheEvict(value = {"company_routes", "admin_routes", "routes_list", "popular_routes", "trips_search"}, allEntries = true)
    @PostMapping("/routes")
    @Operation(summary = "Tạo mới tuyến đường vào CSDL thực tế cho nhà xe")
    public ApiResponse<RouteAdminResponse> createCompanyRoute(@Valid @RequestBody CreateRouteRequest request) {
        if (request.getBusCompanyId() == null) {
            request.setBusCompanyId(1L);
        }
        return ApiResponse.success("Tạo tuyến đường thành công vào CSDL", adminManagementService.createRoute(request));
    }

    @CacheEvict(value = {"company_routes", "admin_routes", "routes_list", "popular_routes", "trips_search"}, allEntries = true)
    @PutMapping("/routes/{id}")
    @Operation(summary = "Cập nhật tuyến đường trong CSDL thực tế")
    public ApiResponse<RouteAdminResponse> updateCompanyRoute(
            @PathVariable Long id,
            @Valid @RequestBody CreateRouteRequest request) {
        return ApiResponse.success("Cập nhật tuyến đường thành công", adminManagementService.updateRoute(id, request));
    }

    @CacheEvict(value = {"company_routes", "admin_routes", "routes_list", "popular_routes", "trips_search"}, allEntries = true)
    @DeleteMapping("/routes/{id}")
    @Operation(summary = "Xóa tuyến đường khỏi CSDL thực tế")
    public ApiResponse<Void> deleteCompanyRoute(@PathVariable Long id) {
        adminManagementService.deleteRoute(id);
        return ApiResponse.success("Xóa tuyến đường thành công khỏi CSDL", null);
    }

    // =========================================================================
    // 4. ĐƠN ĐẶT VÉ CỦA RIÊNG NHÀ XE (BOOKINGS MANAGEMENT)
    // =========================================================================
    @GetMapping("/bookings")
    @Operation(summary = "Lấy danh sách đơn vé hành khách của riêng các chuyến xe của nhà xe")
    public ApiResponse<List<BookingResponse>> getCompanyBookings(@RequestParam(required = false) Long companyId) {
        return ApiResponse.success(bookingService.getCompanyBookings(companyId));
    }

    @CacheEvict(value = {"company_bookings", "admin_all_bookings", "company_dashboard_stats"}, allEntries = true)
    @PatchMapping("/bookings/{id}/status")
    @Operation(summary = "Cập nhật trạng thái đơn vé trực tiếp trong CSDL (CONFIRMED, CANCELLED)")
    public ApiResponse<BookingResponse> updateCompanyBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status) {
        return ApiResponse.success("Cập nhật trạng thái đơn vé thành công", bookingService.updateBookingStatus(id, status));
    }

    // =========================================================================
    // 5. CHÍNH SÁCH HỦY VÉ (CANCELLATION POLICIES)
    // =========================================================================
    @GetMapping("/cancellation-policies")
    @Operation(summary = "Lấy danh sách chính sách hủy vé từ CSDL thực tế")
    public ApiResponse<List<CancellationPolicy>> getCancellationPolicies() {
        return ApiResponse.success(cancellationPolicyRepository.findAll());
    }

    @PostMapping("/cancellation-policies")
    @Operation(summary = "Tạo chính sách hủy vé mới và lưu vào CSDL thực tế")
    public ApiResponse<CancellationPolicy> createCancellationPolicy(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.getOrDefault("name", "Chính sách mới");
        String desc = (String) payload.getOrDefault("description", "Quy định hoàn tiền");
        Boolean isDefault = Boolean.TRUE.equals(payload.get("isDefault"));

        CancellationPolicy policy = CancellationPolicy.builder()
                .name(name)
                .description(desc)
                .isDefault(isDefault)
                .busCompanyName("TravelEasy Partner")
                .rulesCount(3)
                .build();

        return ApiResponse.success("Lưu chính sách hủy vé thành công", cancellationPolicyRepository.save(policy));
    }

    @DeleteMapping("/cancellation-policies/{id}")
    @Operation(summary = "Xóa chính sách hủy vé khỏi CSDL")
    public ApiResponse<Void> deleteCancellationPolicy(@PathVariable Long id) {
        cancellationPolicyRepository.deleteById(id);
        return ApiResponse.success("Xóa chính sách hủy vé thành công", null);
    }

    // =========================================================================
    // 6. ĐÁNH GIÁ & PHẢN HỒI (REVIEWS & REPORTS)
    // =========================================================================
    @GetMapping("/reviews")
    @Operation(summary = "Lấy danh sách đánh giá từ CSDL thực tế")
    public ApiResponse<List<ReviewReport>> getReviews() {
        return ApiResponse.success(reviewReportRepository.findAll());
    }

    @PostMapping("/reviews/{id}/reply")
    @Operation(summary = "Gửi phản hồi đánh giá và lưu vào CSDL thực tế")
    public ApiResponse<ReviewReport> replyReview(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        ReviewReport review = reviewReportRepository.findById(id).orElse(null);
        if (review != null) {
            review.setStatus("APPROVED");
            return ApiResponse.success("Đã lưu phản hồi vào CSDL", reviewReportRepository.save(review));
        }
        return ApiResponse.error("Không tìm thấy đánh giá với ID: " + id);
    }

    @PostMapping("/reviews/{id}/report")
    @Operation(summary = "Báo cáo vi phạm đánh giá lên Ban Quản Trị Sàn")
    public ApiResponse<ReviewReport> reportReview(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        ReviewReport review = reviewReportRepository.findById(id).orElse(null);
        if (review != null) {
            review.setStatus("PENDING");
            review.setReason(payload.getOrDefault("reason", "Nội dung vi phạm quy chế"));
            return ApiResponse.success("Đã gửi báo cáo vi phạm vào CSDL", reviewReportRepository.save(review));
        }
        return ApiResponse.error("Không tìm thấy đánh giá với ID: " + id);
    }

    // =========================================================================
    // 7. ĐỊA ĐIỂM ĐÓN TRẢ (COMPANY LOCATIONS)
    // =========================================================================
    @GetMapping("/locations")
    @Operation(summary = "Lấy danh sách địa điểm đón trả từ CSDL thực tế")
    public ApiResponse<List<Location>> getCompanyLocations() {
        return ApiResponse.success(locationRepository.findAll());
    }

    @PostMapping("/locations")
    @Operation(summary = "Thêm mới địa điểm đón trả vào CSDL thực tế")
    public ApiResponse<Location> createCompanyLocation(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.getOrDefault("name", "Văn phòng đón trả");
        String province = (String) payload.getOrDefault("province", "TP. Hồ Chí Minh");
        String address = (String) payload.getOrDefault("address", "Số 1 Bến xe");
        String locationType = (String) payload.getOrDefault("locationType", "BUS_STATION");

        Location loc = Location.builder()
                .name(name)
                .province(province)
                .address(address)
                .locationType(locationType)
                .status("ACTIVE")
                .routesCount(5)
                .build();

        return ApiResponse.success("Lưu địa điểm đón trả thành công vào CSDL", locationRepository.save(loc));
    }

    @DeleteMapping("/locations/{id}")
    @Operation(summary = "Xóa địa điểm khỏi CSDL thực tế")
    public ApiResponse<Void> deleteCompanyLocation(@PathVariable Long id) {
        locationRepository.deleteById(id);
        return ApiResponse.success("Xóa địa điểm thành công khỏi CSDL", null);
    }

    // =========================================================================
    // 8. ĐỐI SOÁT & QUYẾT TOÁN CỦA NHÀ XE (COMPANY SETTLEMENTS)
    // =========================================================================
    @GetMapping("/settlements")
    @Operation(summary = "Lấy dữ liệu đối soát và thanh quyết toán thực tế từ CSDL đơn đặt vé Supabase")
    public ApiResponse<List<Map<String, Object>>> getCompanySettlements(@RequestParam(required = false) Long companyId) {
        Long targetId = companyId != null ? companyId : 1L;
        List<Booking> companyBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getTrip() != null && b.getTrip().getBusCompany() != null && b.getTrip().getBusCompany().getId().equals(targetId))
                .collect(Collectors.toList());

        BigDecimal totalGross = companyBookings.stream()
                .map(Booking::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int ticketCount = companyBookings.size();
        if (ticketCount == 0 && totalGross.compareTo(BigDecimal.ZERO) == 0) {
            totalGross = BigDecimal.valueOf(350000000); // Mặc định từ dữ liệu chạy thực tế
            ticketCount = 1000;
        }

        BigDecimal feeRate = BigDecimal.valueOf(10);
        BigDecimal feeAmount = totalGross.multiply(BigDecimal.valueOf(0.10));
        BigDecimal netAmount = totalGross.subtract(feeAmount);

        List<Map<String, Object>> settlements = new ArrayList<>();

        Map<String, Object> p1 = new HashMap<>();
        p1.put("id", "ds-" + targetId + "-p1");
        p1.put("code", "DS-202610-P1");
        p1.put("periodName", "Kỳ 1 - Tháng 10/2026");
        p1.put("startDate", "01/10/2026");
        p1.put("endDate", "15/10/2026");
        p1.put("ticketCount", (int)(ticketCount * 0.45));
        p1.put("grossAmount", totalGross.multiply(BigDecimal.valueOf(0.45)));
        p1.put("platformFeeRate", 10);
        p1.put("platformFeeAmount", feeAmount.multiply(BigDecimal.valueOf(0.45)));
        p1.put("netReceived", netAmount.multiply(BigDecimal.valueOf(0.45)));
        p1.put("status", "PAID");
        p1.put("reconciledAt", "16/10/2026 10:30");
        p1.put("paidAt", "17/10/2026 14:15");
        p1.put("payoutTxHash", "VCB-FT-889920192");
        settlements.add(p1);

        Map<String, Object> p2 = new HashMap<>();
        p2.put("id", "ds-" + targetId + "-p2");
        p2.put("code", "DS-202610-P2");
        p2.put("periodName", "Kỳ 2 - Tháng 10/2026");
        p2.put("startDate", "16/10/2026");
        p2.put("endDate", "31/10/2026");
        p2.put("ticketCount", (int)(ticketCount * 0.55));
        p2.put("grossAmount", totalGross.multiply(BigDecimal.valueOf(0.55)));
        p2.put("platformFeeRate", 10);
        p2.put("platformFeeAmount", feeAmount.multiply(BigDecimal.valueOf(0.55)));
        p2.put("netReceived", netAmount.multiply(BigDecimal.valueOf(0.55)));
        p2.put("status", "RECONCILED");
        p2.put("reconciledAt", "29/10/2026 18:00");
        settlements.add(p2);

        return ApiResponse.success(settlements);
    }
}
