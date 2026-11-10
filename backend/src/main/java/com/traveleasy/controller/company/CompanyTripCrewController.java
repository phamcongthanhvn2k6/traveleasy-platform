package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * [S319] Phân Hệ Phân Công Tài Xế & Phụ Xe Cho Từng Chuyến Xe (/company/crew)
 * Đã khắc phục BUG-NEW-06: Ràng buộc an toàn giao thông Nghị định 10/2020/NĐ-CP (Kiểm tra cồn & 2 tài xế cho tuyến dài)
 * @author Đoàn Nhật Cường (CuongLiam)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/company/crew")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Trip Crew Operations", description = "[S319] Phân công tổ lái, tài xế phụ và kiểm soát giờ lái xe an toàn - Đoàn Nhật Cường")
public class CompanyTripCrewController {

    @GetMapping("/assignments")
    @Operation(summary = "Lấy danh sách phân công tổ lái theo chuyến xe kèm trạng thái kiểm định")
    public ApiResponse<List<Map<String, Object>>> getCrewAssignments(
            @RequestParam(required = false) Long busCompanyId,
            @RequestParam(required = false) String date) {

        List<Map<String, Object>> list = new ArrayList<>();

        Map<String, Object> crew1 = new LinkedHashMap<>();
        crew1.put("tripId", 696L);
        crew1.put("route", "TP. Hồ Chí Minh ➔ Đà Lạt (310km - 6.5h)");
        crew1.put("primaryDriverName", "Nguyễn Văn Hùng");
        crew1.put("primaryDriverPhone", "0901234567");
        crew1.put("secondaryDriverName", "Lê Văn Thắng");
        crew1.put("secondaryDriverPhone", "0907654321");
        crew1.put("conductorName", "Trần Văn Phụ");
        crew1.put("continuousDriveHours", 3.5);
        crew1.put("alcoholTested", true);
        crew1.put("alcoholReading", 0.00);
        crew1.put("status", "COMPLIANT_DISPATCH_READY");
        list.add(crew1);

        Map<String, Object> crew2 = new LinkedHashMap<>();
        crew2.put("tripId", 697L);
        crew2.put("route", "TP. Hồ Chí Minh ➔ Vũng Tàu (100km - 2.5h)");
        crew2.put("primaryDriverName", "Phạm Đức Hải");
        crew2.put("primaryDriverPhone", "0912389922");
        crew2.put("secondaryDriverName", "Không yêu cầu (Tuyến ngắn < 300km)");
        crew2.put("conductorName", "Nguyễn Văn Đạt");
        crew2.put("continuousDriveHours", 2.5);
        crew2.put("alcoholTested", true);
        crew2.put("alcoholReading", 0.00);
        crew2.put("status", "COMPLIANT_DISPATCH_READY");
        list.add(crew2);

        return ApiResponse.success(list);
    }

    @PostMapping("/assignments")
    @Operation(summary = "Phân công hoặc cập nhật tổ lái (Có validation BUG-NEW-06 chống vi phạm an toàn)")
    public ApiResponse<Map<String, Object>> assignCrew(@RequestBody Map<String, Object> payload) {
        String primaryDriver = (String) payload.get("primaryDriverName");
        String secondaryDriver = (String) payload.get("secondaryDriverName");
        Boolean alcoholTested = Boolean.TRUE.equals(payload.get("alcoholTested"));
        Object alcoholReadingObj = payload.getOrDefault("alcoholReading", 0.00);
        double alcoholReading = Double.parseDouble(alcoholReadingObj.toString());
        Object distanceKmObj = payload.getOrDefault("distanceKm", 310);
        double distanceKm = Double.parseDouble(distanceKmObj.toString());

        // 1. Kiểm tra an toàn nồng độ cồn
        if (!alcoholTested) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "CẢNH BÁO AN TOÀN: Chưa có kết quả kiểm tra nồng độ cồn trước chuyến đi! Không thể duyệt xuất bến.");
        }
        if (alcoholReading > 0.00) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "VI PHẠM NGHIÊM TRỌNG: Phát hiện nồng độ cồn (" + alcoholReading + " mg/L)! Nghiêm cấm xuất bến theo quy định pháp luật.");
        }

        // 2. Kiểm tra quy định tuyến đường dài (Nghị định 10/2020/NĐ-CP)
        if (distanceKm > 300.0 && (secondaryDriver == null || secondaryDriver.trim().isEmpty() || "null".equalsIgnoreCase(secondaryDriver))) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "VI PHẠM NGHỊ ĐỊNH 10/2020: Tuyến đường dài " + distanceKm + "km (> 300km) bắt buộc phải bố trí ít nhất 02 tài xế (Lái chính và Lái phụ)!");
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "SUCCESS");
        result.put("message", "Phân công tổ lái thành công và đáp ứng đầy đủ điều kiện an toàn xuất bến!");
        result.put("dispatchPermitCode", "DP-" + System.currentTimeMillis() % 100000);
        result.put("primaryDriver", primaryDriver);
        result.put("secondaryDriver", secondaryDriver != null ? secondaryDriver : "Tuyến ngắn - 01 Tài xế");
        result.put("alcoholAudit", "PASSED (0.00 mg/L)");

        return ApiResponse.success(result);
    }
}
