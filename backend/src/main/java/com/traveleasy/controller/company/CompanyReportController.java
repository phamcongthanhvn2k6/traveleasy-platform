package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.company.report.CompanyReportSummaryResponse;
import com.traveleasy.dto.company.report.TripPerformanceDto;
import com.traveleasy.entity.BusCompany;
import com.traveleasy.entity.User;
import com.traveleasy.repository.BusCompanyRepository;
import com.traveleasy.repository.UserRepository;
import com.traveleasy.service.company.CompanyReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * [S310][REPORTS] Phân Hệ Báo Cáo Thống Kê Doanh Thu & Tỷ Lệ Lấp Đầy Ghế Nhà Xe (/company/reports)
 * @author Nguyễn Đại Phát (phatnguyn146)
 * @role Analytics & Finance Specialist
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/company/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Reports & Analytics", description = "[S310][REPORTS] Thống kê doanh thu, tỷ lệ lấp đầy ghế và đối soát hoa hồng 8% - Nguyễn Đại Phát")
public class CompanyReportController {

    private final CompanyReportService companyReportService;
    private final UserRepository userRepository;
    private final BusCompanyRepository busCompanyRepository;

    @GetMapping("/summary")
    @Operation(summary = "Lấy tổng hợp KPIs, biểu đồ chuỗi thời gian, thống kê theo tuyến và chi tiết chuyến xe")
    public ApiResponse<CompanyReportSummaryResponse> getReportSummary(
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false, defaultValue = "MONTH") String period,
            Authentication authentication) {

        Long targetCompanyId = resolveTargetCompanyId(companyId, authentication);
        CompanyReportSummaryResponse summary = companyReportService.getCompanyReportSummary(targetCompanyId, period);
        return ApiResponse.success(summary);
    }

    @GetMapping("/trips")
    @Operation(summary = "Lấy danh sách chi tiết hiệu suất từng chuyến xe (Tỷ lệ lấp đầy, Doanh thu, 8% Phí sàn)")
    public ApiResponse<List<TripPerformanceDto>> getTripPerformances(
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false, defaultValue = "MONTH") String period,
            Authentication authentication) {

        Long targetCompanyId = resolveTargetCompanyId(companyId, authentication);
        CompanyReportSummaryResponse summary = companyReportService.getCompanyReportSummary(targetCompanyId, period);
        return ApiResponse.success(summary.getTripPerformances());
    }

    @GetMapping("/export-csv")
    @Operation(summary = "Xuất file bảng tính Excel/CSV đối soát doanh thu & hiệu suất chuyến xe chuẩn UTF-8 BOM")
    public ResponseEntity<byte[]> exportReportCsv(
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false, defaultValue = "MONTH") String period,
            Authentication authentication) {

        Long targetCompanyId = resolveTargetCompanyId(companyId, authentication);
        CompanyReportSummaryResponse summary = companyReportService.getCompanyReportSummary(targetCompanyId, period);

        StringBuilder sb = new StringBuilder();
        // UTF-8 BOM để Excel hiển thị tiếng Việt không bị lỗi font
        sb.append('\uFEFF');

        // Header thông tin đối soát
        sb.append("BÁO CÁO THỐNG KÊ DOANH THU & TỶ LỆ LẤP ĐẦY GHẾ NHÀ XE - TRAVELEASY\n");
        sb.append("Nhà xe:,").append(summary.getCompanyName()).append("\n");
        sb.append("Kỳ báo cáo:,").append(summary.getPeriod()).append("\n");
        sb.append("Tổng doanh thu:,").append(summary.getTotalGrossRevenue()).append(" VNĐ\n");
        sb.append("Hoa hồng sàn (8%):,").append(summary.getTotalPlatformFee()).append(" VNĐ\n");
        sb.append("Thực nhận nhà xe:,").append(summary.getTotalNetRevenue()).append(" VNĐ\n");
        sb.append("Tỷ lệ lấp đầy TB:,").append(summary.getAvgOccupancyRate()).append("%\n");
        sb.append("Tổng số vé đã bán:,").append(summary.getTotalTickets()).append("\n\n");

        // Bảng kê chi tiết chuyến xe
        sb.append("Mã Chuyến,Tuyến Đường,Giờ Xuất Bến,Biển Số,Loại Xe,Tổng Chỗ,Vé Đã Bán,Chỗ Trống,Tỷ Lệ Lấp Đầy (%),Đơn Giá (VNĐ),Doanh Thu (VNĐ),Phí Sàn 8% (VNĐ),Thực Nhận (VNĐ),Phân Loại\n");

        for (TripPerformanceDto t : summary.getTripPerformances()) {
            sb.append("\"").append(t.getTripCode()).append("\",");
            sb.append("\"").append(t.getRouteName()).append("\",");
            sb.append("\"").append(t.getDepartureTime()).append("\",");
            sb.append("\"").append(t.getLicensePlate()).append("\",");
            sb.append("\"").append(t.getBusType()).append("\",");
            sb.append(t.getTotalSeats()).append(",");
            sb.append(t.getBookedSeats()).append(",");
            sb.append(t.getAvailableSeats()).append(",");
            sb.append(t.getOccupancyRate()).append("%,");
            sb.append(t.getPrice()).append(",");
            sb.append(t.getGrossRevenue()).append(",");
            sb.append(t.getPlatformFee()).append(",");
            sb.append(t.getNetRevenue()).append(",");
            sb.append("\"").append("PEAK".equals(t.getOccupancyLevel()) ? "Cao điểm (>=80%)" : ("LOW".equals(t.getOccupancyLevel()) ? "Thấp điểm (<50%)" : "Bình thường")).append("\"\n");
        }

        byte[] csvBytes = sb.toString().getBytes(StandardCharsets.UTF_8);
        String fileName = "Bao_Cao_Doanh_Thu_Nha_Xe_" + targetCompanyId + "_" + System.currentTimeMillis() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvBytes);
    }

    private Long resolveTargetCompanyId(Long explicitCompanyId, Authentication authentication) {
        if (explicitCompanyId != null && explicitCompanyId > 0) {
            return explicitCompanyId;
        }
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                if (user.getBusCompanyId() != null && user.getBusCompanyId() > 0) {
                    return user.getBusCompanyId();
                }
                BusCompany comp = busCompanyRepository.findByEmail(email).orElse(null);
                if (comp != null) {
                    return comp.getId();
                }
            }
        }
        return 1L; // Fallback an toàn cho môi trường test/dev
    }
}
