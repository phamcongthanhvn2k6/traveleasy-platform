package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * [S317] Phân Hệ Quản Lý Xe Trung Chuyển Đón/Trả Khách Tận Nhà (/company/shuttles)
 * @author Trần Minh Đức (tranduc2601)
 */
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
                        "shuttlePickupTime", "2026-11-10 21:15:00",
                        "assignedVehiclePlate", "51B-168.99",
                        "status", "ARRIVED_TERMINAL"
                ),
                Map.of(
                        "id", "ST-02",
                        "passengerName", "Lê Hoàng Cường",
                        "phone", "0918273645",
                        "pickupAddress", "120 Man Thiện, P. Hiệp Phú, TP. Thủ Đức",
                        "shuttlePickupTime", "2026-11-10 21:30:00",
                        "assignedVehiclePlate", "51B-168.99",
                        "status", "PICKING_UP"
                )
        ));
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
