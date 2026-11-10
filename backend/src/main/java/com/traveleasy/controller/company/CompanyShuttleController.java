package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * [S317] Phân Hệ Quản Lý Xe Trung Chuyển Đón/Trả Khách Tận Nhà (/company/shuttles)
 * Đã khắc phục BUG-NEW-07: Ràng buộc khả thi địa lý (Lead Time >= 120 phút & Bán kính đón <= 10km)
 * @author Trần Minh Đức (tranduc2601)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/company/shuttles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Shuttle Operations", description = "[S317] Điều phối xe trung chuyển đón gom khách tận nhà - Trần Minh Đức")
public class CompanyShuttleController {

    @GetMapping("/requests")
    @Operation(summary = "Lấy danh sách yêu cầu trung chuyển theo ngày và chuyến xe")
    public ApiResponse<List<Map<String, Object>>> getShuttleRequests(
            @RequestParam(required = false) Long busCompanyId,
            @RequestParam(required = false) Long mainTripId) {
        return ApiResponse.success(List.of(
                Map.of(
                        "id", "ST-01",
                        "passengerName", "Trần Thị Bích Ngọc",
                        "phone", "0987654321",
                        "pickupAddress", "45 Lê Văn Việt, Tăng Nhơn Phú A, TP. Thủ Đức",
                        "distanceFromTerminalKm", 6.2,
                        "shuttlePickupTime", "2026-11-10 21:15:00",
                        "assignedVehiclePlate", "51B-168.99",
                        "status", "ARRIVED_TERMINAL"
                ),
                Map.of(
                        "id", "ST-02",
                        "passengerName", "Lê Hoàng Cường",
                        "phone", "0918273645",
                        "pickupAddress", "120 Man Thiện, P. Hiệp Phú, TP. Thủ Đức",
                        "distanceFromTerminalKm", 4.8,
                        "shuttlePickupTime", "2026-11-10 21:30:00",
                        "assignedVehiclePlate", "51B-168.99",
                        "status", "PICKING_UP"
                )
        ));
    }

    @PostMapping("/requests")
    @Operation(summary = "Tạo yêu cầu đón trung chuyển mới (Có validation BUG-NEW-07 chống đón bất khả thi)")
    public ApiResponse<Map<String, Object>> createShuttleRequest(@RequestBody Map<String, Object> payload) {
        String pickupAddress = (String) payload.getOrDefault("pickupAddress", "");
        Object distanceObj = payload.getOrDefault("distanceKm", 5.0);
        double distanceKm = Double.parseDouble(distanceObj.toString());
        Object minutesBeforeObj = payload.getOrDefault("minutesBeforeDeparture", 150);
        int minutesBeforeDeparture = Integer.parseInt(minutesBeforeObj.toString());

        // 1. Kiểm tra thời gian đăng ký đón trước (Lead time)
        if (minutesBeforeDeparture < 120) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "KHÔNG THỂ ĐĂNG KÝ: Yêu cầu trung chuyển đón tận nhà phải được đăng ký trước giờ xe chạy tối thiểu 120 phút (Hiện tại chỉ còn " + minutesBeforeDeparture + " phút)!");
        }

        // 2. Kiểm tra bán kính đón (Geofence)
        if (distanceKm > 10.0) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "NGOÀI PHẠM VI PHỤC VỤ: Địa chỉ đón cách bến " + distanceKm + "km, vượt quá bán kính phục vụ tối đa 10.0km của dịch vụ trung chuyển miễn phí!");
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "SUCCESS");
        res.put("message", "Đăng ký đón trung chuyển thành công! Bác tài sẽ gọi trước 30 phút.");
        res.put("pickupAddress", pickupAddress);
        res.put("distanceKm", distanceKm);
        res.put("estimatedPickupTime", "Khoảng 60-90 phút trước giờ xe tuyến xuất bến");

        return ApiResponse.success(res);
    }

    @PatchMapping("/requests/{id}/status")
    @Operation(summary = "Cập nhật trạng thái đón khách trung chuyển")
    public ApiResponse<Map<String, Object>> updateStatus(
            @PathVariable String id,
            @RequestParam String status) {
        return ApiResponse.success(Map.of(
                "id", id,
                "status", status,
                "message", "Cập nhật trạng thái đón trung chuyển thành công!"
        ));
    }
}
