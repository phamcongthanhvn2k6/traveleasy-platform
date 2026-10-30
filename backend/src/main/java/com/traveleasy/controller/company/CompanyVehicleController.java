package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.company.VehicleRequest;
import com.traveleasy.dto.company.VehicleResponse;
import com.traveleasy.service.company.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/company/vehicles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Vehicle Operations", description = "Quản lý đội xe và phương tiện vận hành của đối tác nhà xe")
public class CompanyVehicleController {

    private final VehicleService vehicleService;

    @Cacheable(value = "company_vehicles", key = "(#busCompanyId != null ? #busCompanyId : '') + '_' + (#type != null ? #type : '') + '_' + (#status != null ? #status : '') + '_' + (#search != null ? #search : '')")
    @GetMapping
    @Operation(summary = "Lấy danh sách đội xe theo nhà xe và bộ lọc")
    public ApiResponse<List<VehicleResponse>> getVehicles(
            @RequestParam(required = false) Long busCompanyId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ApiResponse.success(vehicleService.getVehicles(busCompanyId, type, status, search));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết xe")
    public ApiResponse<VehicleResponse> getVehicleById(@PathVariable Long id) {
        return ApiResponse.success(vehicleService.getVehicleById(id));
    }

    @CacheEvict(value = "company_vehicles", allEntries = true)
    @PostMapping
    @Operation(summary = "Thêm xe mới vào đội xe")
    public ApiResponse<VehicleResponse> createVehicle(@Valid @RequestBody VehicleRequest request) {
        return ApiResponse.success("Thêm xe mới thành công", vehicleService.createVehicle(request));
    }

    @CacheEvict(value = "company_vehicles", allEntries = true)
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin xe")
    public ApiResponse<VehicleResponse> updateVehicle(@PathVariable Long id, @RequestBody VehicleRequest request) {
        return ApiResponse.success("Cập nhật thông tin xe thành công", vehicleService.updateVehicle(id, request));
    }

    @CacheEvict(value = "company_vehicles", allEntries = true)
    @PatchMapping("/{id}/status")
    @Operation(summary = "Chuyển đổi trạng thái hoạt động của xe")
    public ApiResponse<VehicleResponse> toggleVehicleStatus(@PathVariable Long id) {
        return ApiResponse.success("Cập nhật trạng thái xe thành công", vehicleService.toggleVehicleStatus(id));
    }

    @CacheEvict(value = "company_vehicles", allEntries = true)
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa xe khỏi đội xe")
    public ApiResponse<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ApiResponse.success("Xóa xe thành công", null);
    }
}
