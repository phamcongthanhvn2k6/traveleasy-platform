package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.company.VehicleRequest;
import com.traveleasy.dto.company.VehicleResponse;
import com.traveleasy.entity.BusCompany;
import com.traveleasy.entity.User;
import com.traveleasy.repository.BusCompanyRepository;
import com.traveleasy.repository.UserRepository;
import com.traveleasy.service.company.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/company/vehicles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Company Vehicle Operations", description = "Quản lý đội xe và phương tiện vận hành của đối tác nhà xe (Tenant-Scoped)")
public class CompanyVehicleController {

    private final VehicleService vehicleService;
    private final UserRepository userRepository;
    private final BusCompanyRepository busCompanyRepository;

    @Cacheable(value = "company_vehicles", key = "(#busCompanyId != null ? #busCompanyId : '') + '_' + (#type != null ? #type : '') + '_' + (#status != null ? #status : '') + '_' + (#search != null ? #search : '')")
    @GetMapping
    @Operation(summary = "Lấy danh sách đội xe theo nhà xe và bộ lọc")
    public ApiResponse<List<VehicleResponse>> getVehicles(
            @RequestParam(required = false) Long busCompanyId,
            @RequestParam(required = false) String companyName,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            Authentication authentication) {
        Long targetId = busCompanyId;
        if (targetId == null) {
            targetId = resolveCompanyId(companyName, authentication);
        }
        return ApiResponse.success(vehicleService.getVehicles(targetId, type, status, search));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết xe")
    public ApiResponse<VehicleResponse> getVehicleById(@PathVariable Long id) {
        return ApiResponse.success(vehicleService.getVehicleById(id));
    }

    @CacheEvict(value = "company_vehicles", allEntries = true)
    @PostMapping
    @Operation(summary = "Thêm xe mới vào đội xe")
    public ApiResponse<VehicleResponse> createVehicle(
            @Valid @RequestBody VehicleRequest request,
            Authentication authentication) {
        if (request.getBusCompanyId() == null) {
            request.setBusCompanyId(resolveCompanyId(null, authentication));
        }
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

    private Long resolveCompanyId(String explicitName, Authentication authentication) {
        if (explicitName != null && !explicitName.isBlank() && !explicitName.equalsIgnoreCase("ALL")) {
            for (BusCompany bc : busCompanyRepository.findAll()) {
                if (explicitName.toLowerCase().contains(bc.getName().toLowerCase()) || bc.getName().toLowerCase().contains(explicitName.toLowerCase())) {
                    return bc.getId();
                }
            }
        }
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null && user.getFullName() != null) {
                String fullName = user.getFullName().toLowerCase();
                for (BusCompany bc : busCompanyRepository.findAll()) {
                    String bcName = bc.getName().toLowerCase();
                    if (fullName.contains(bcName) || bcName.contains(fullName)) {
                        return bc.getId();
                    }
                }
                if (fullName.contains("sao việt") || fullName.contains("sao viet")) return 3L;
                if (fullName.contains("phương trang") || fullName.contains("futa")) return 1L;
                if (fullName.contains("thành bưởi") || fullName.contains("thanh buoi")) return 2L;
                if (fullName.contains("kumho")) return 4L;
                if (fullName.contains("hoa mai")) return 5L;
                if (fullName.contains("hoàng long") || fullName.contains("hoang long")) return 6L;
                if (fullName.contains("văn minh") || fullName.contains("van minh")) return 7L;
                if (fullName.contains("cúc tùng") || fullName.contains("cuc tung")) return 8L;
                if (fullName.contains("hải vân") || fullName.contains("hai van")) return 9L;
                if (fullName.contains("chín nghĩa") || fullName.contains("chin nghia")) return 10L;
            }
        }
        return 3L; // Default fallback to Sao Việt
    }
}
