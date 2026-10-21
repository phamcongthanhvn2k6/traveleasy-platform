package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.admin.CreateTripRequest;
import com.traveleasy.dto.admin.UpdateTripRequest;
import com.traveleasy.dto.booking.BookingResponse;
import com.traveleasy.dto.trip.TripResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.CancellationPolicyRepository;
import com.traveleasy.repository.LocationRepository;
import com.traveleasy.repository.ReviewReportRepository;
import com.traveleasy.service.admin.AdminTripService;
import com.traveleasy.service.customer.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/company")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Management Operations", description = "Vận hành điều phối chuyến, đơn vé, chính sách và phản hồi của nhà xe đối tác")
public class CompanyManagementController {

    private final AdminTripService adminTripService;
    private final BookingService bookingService;
    private final CancellationPolicyRepository cancellationPolicyRepository;
    private final ReviewReportRepository reviewReportRepository;
    private final LocationRepository locationRepository;

    // =========================================================================
    // 1. CHUYẾN XE (TRIPS MANAGEMENT)
    // =========================================================================
    @GetMapping("/trips")
    @Operation(summary = "Lấy danh sách chuyến xe trực tiếp từ CSDL thực tế")
    public ApiResponse<List<TripResponse>> getCompanyTrips() {
        return ApiResponse.success(adminTripService.getAllTrips());
    }

    @PostMapping("/trips")
    @Operation(summary = "Tạo chuyến xe mới vào CSDL thực tế (Tự động sinh kho ghế 34 chỗ)")
    public ApiResponse<TripResponse> createCompanyTrip(@RequestBody CreateTripRequest request) {
        return ApiResponse.success("Tạo chuyến xe thành công và lưu vào CSDL", adminTripService.createTrip(request));
    }

    @PutMapping("/trips/{id}")
    @Operation(summary = "Cập nhật thông tin chuyến xe trên CSDL thực tế")
    public ApiResponse<TripResponse> updateCompanyTrip(@PathVariable Long id, @RequestBody UpdateTripRequest request) {
        return ApiResponse.success("Cập nhật thông tin chuyến xe thành công", adminTripService.updateTrip(id, request));
    }

    @PatchMapping("/trips/{id}/status")
    @Operation(summary = "Cập nhật trạng thái chuyến xe (SCHEDULED, RUNNING, COMPLETED, CANCELLED)")
    public ApiResponse<TripResponse> updateTripStatus(@PathVariable Long id, @RequestParam TripStatus status) {
        return ApiResponse.success("Cập nhật trạng thái chuyến thành công", adminTripService.updateTripStatus(id, status));
    }

    @DeleteMapping("/trips/{id}")
    @Operation(summary = "Xóa chuyến xe khỏi CSDL thực tế")
    public ApiResponse<Void> deleteCompanyTrip(@PathVariable Long id) {
        adminTripService.deleteTrip(id);
        return ApiResponse.success("Xóa chuyến xe thành công khỏi CSDL", null);
    }

    // =========================================================================
    // 2. ĐƠN ĐẶT VÉ (BOOKINGS MANAGEMENT)
    // =========================================================================
    @GetMapping("/bookings")
    @Operation(summary = "Lấy danh sách đơn vé hành khách trực tiếp từ CSDL thực tế")
    public ApiResponse<List<BookingResponse>> getCompanyBookings() {
        return ApiResponse.success(bookingService.getAllBookings());
    }

    @PatchMapping("/bookings/{id}/status")
    @Operation(summary = "Cập nhật trạng thái đơn vé trực tiếp trong CSDL (CONFIRMED, CANCELLED)")
    public ApiResponse<BookingResponse> updateCompanyBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status) {
        return ApiResponse.success("Cập nhật trạng thái đơn vé thành công", bookingService.updateBookingStatus(id, status));
    }

    // =========================================================================
    // 3. CHÍNH SÁCH HỦY VÉ (CANCELLATION POLICIES)
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
    // 4. ĐÁNH GIÁ & PHẢN HỒI (REVIEWS & REPORTS)
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
    // 5. ĐỊA ĐIỂM ĐÓN TRẢ (COMPANY LOCATIONS)
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
}
