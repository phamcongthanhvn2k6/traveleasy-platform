package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * [S319] Phân Hệ Phân Công Tài Xế & Phụ Xe Cho Từng Chuyến Xe (/company/crew)
 * @author Đoàn Nhật Cường (CuongLiam)
 */
@RestController
@RequestMapping("/api/v1/company/crew")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Trip Crew Operations", description = "[S319] Phân công tổ lái, tài xế phụ và kiểm soát giờ lái xe an toàn - Đoàn Nhật Cường")
public class CompanyTripCrewController {

    @GetMapping("/assignments")
    @Operation(summary = "Lấy danh sách phân công tổ lái theo chuyến xe")
    public ApiResponse<List<Map<String, Object>>> getCrewAssignments(
            @RequestParam(required = false) Long busCompanyId,
            @RequestParam(required = false) String date) {
        return ApiResponse.success(List.of(
                Map.of(
                        "tripId", 696L,
                        "route", "TP. Hồ Chí Minh ➔ Đà Lạt",
                        "primaryDriverName", "Nguyễn Văn Hùng",
                        "primaryDriverPhone", "0901234567",
                        "secondaryDriverName", "Lê Văn Thắng",
                        "conductorName", "Trần Văn Phụ",
                        "continuousDriveHours", 3.5,
                        "status", "COMPLIANT"
                ),
                Map.of(
                        "tripId", 697L,
                        "route", "TP. Hồ Chí Minh ➔ Đà Lạt VIP",
                        "primaryDriverName", "Phạm Đức Hải",
                        "primaryDriverPhone", "0912389922",
                        "secondaryDriverName", "Vũ Quốc Tuấn",
                        "conductorName", "Nguyễn Văn Đạt",
                        "continuousDriveHours", 3.0,
                        "status", "COMPLIANT"
                )
        ));
    }

    @PostMapping("/assignments")
    @Operation(summary = "Phân công hoặc cập nhật tổ lái cho chuyến xe")
    public ApiResponse<Map<String, Object>> assignCrew(@RequestBody Map<String, Object> payload) {
        return ApiResponse.success(Map.of(
                "status", "SUCCESS",
                "message", "Phân công tài xế và phụ xe thành công, không có xung đột lịch trình!"
        ));
    }
}
