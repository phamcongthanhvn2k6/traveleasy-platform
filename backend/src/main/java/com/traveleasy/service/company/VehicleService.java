package com.traveleasy.service.company;

import com.traveleasy.dto.company.VehicleRequest;
import com.traveleasy.dto.company.VehicleResponse;
import com.traveleasy.entity.BusCompany;
import com.traveleasy.entity.Vehicle;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.repository.BusCompanyRepository;
import com.traveleasy.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final BusCompanyRepository busCompanyRepository;

    public List<VehicleResponse> getVehicles(Long busCompanyId, String type, String status, String search) {
        List<Vehicle> list;
        if (busCompanyId != null) {
            list = vehicleRepository.findByBusCompanyIdOrderByCreatedAtDesc(busCompanyId);
        } else {
            list = vehicleRepository.findAllByOrderByCreatedAtDesc();
        }

        return list.stream()
                .filter(v -> {
                    if (type != null && !type.isBlank() && !"ALL".equalsIgnoreCase(type)) {
                        if (!type.equalsIgnoreCase(v.getVehicleType())) return false;
                    }
                    if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                        if (!status.equalsIgnoreCase(v.getStatus())) return false;
                    }
                    if (search != null && !search.isBlank()) {
                        String q = search.toLowerCase();
                        boolean matchPlate = v.getPlateNumber() != null && v.getPlateNumber().toLowerCase().contains(q);
                        boolean matchCode = v.getVehicleCode() != null && v.getVehicleCode().toLowerCase().contains(q);
                        boolean matchOperator = v.getBusCompany() != null && v.getBusCompany().getName().toLowerCase().contains(q);
                        if (!matchPlate && !matchCode && !matchOperator) return false;
                    }
                    return true;
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public VehicleResponse getVehicleById(Long id) {
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy xe #" + id));
        return mapToResponse(v);
    }

    @Transactional
    public VehicleResponse createVehicle(VehicleRequest request) {
        BusCompany company = null;
        if (request.getBusCompanyId() != null) {
            company = busCompanyRepository.findById(request.getBusCompanyId()).orElse(null);
        }
        if (company == null) {
            company = busCompanyRepository.findAll().stream().findFirst().orElse(null);
        }

        String code = request.getVehicleCode();
        if (code == null || code.isBlank()) {
            code = "v" + (vehicleRepository.count() + 1);
        }

        Vehicle vehicle = Vehicle.builder()
                .plateNumber(request.getPlateNumber().trim())
                .vehicleCode(code)
                .busCompany(company)
                .vehicleType(request.getVehicleType() != null ? request.getVehicleType().toUpperCase() : "SLEEPER")
                .floors(request.getFloors() != null ? request.getFloors() : 2)
                .manufactureYear(request.getManufactureYear() != null ? request.getManufactureYear() : 2023)
                .seatLayout(request.getSeatLayout() != null ? request.getSeatLayout() : "Giường nằm 2 tầng 34 chỗ")
                .imageUrl(request.getImageUrl())
                .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE")
                .build();

        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Created vehicle: {} ({}) for company: {}", saved.getPlateNumber(), saved.getVehicleType(), company != null ? company.getName() : "None");
        return mapToResponse(saved);
    }

    @Transactional
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy xe #" + id));

        if (request.getPlateNumber() != null && !request.getPlateNumber().isBlank()) {
            v.setPlateNumber(request.getPlateNumber().trim());
        }
        if (request.getVehicleType() != null) {
            v.setVehicleType(request.getVehicleType().toUpperCase());
        }
        if (request.getFloors() != null) {
            v.setFloors(request.getFloors());
        }
        if (request.getManufactureYear() != null) {
            v.setManufactureYear(request.getManufactureYear());
        }
        if (request.getSeatLayout() != null) {
            v.setSeatLayout(request.getSeatLayout());
        }
        if (request.getImageUrl() != null) {
            v.setImageUrl(request.getImageUrl());
        }
        if (request.getStatus() != null) {
            v.setStatus(request.getStatus().toUpperCase());
        }
        if (request.getBusCompanyId() != null) {
            busCompanyRepository.findById(request.getBusCompanyId()).ifPresent(v::setBusCompany);
        }

        Vehicle saved = vehicleRepository.save(v);
        return mapToResponse(saved);
    }

    @Transactional
    public VehicleResponse toggleVehicleStatus(Long id) {
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy xe #" + id));

        String newStatus = "ACTIVE".equalsIgnoreCase(v.getStatus()) ? "INACTIVE" : "ACTIVE";
        v.setStatus(newStatus);
        Vehicle saved = vehicleRepository.save(v);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy xe #" + id);
        }
        vehicleRepository.deleteById(id);
        log.info("Deleted vehicle #{}", id);
    }

    private VehicleResponse mapToResponse(Vehicle v) {
        boolean isActive = "ACTIVE".equalsIgnoreCase(v.getStatus());
        String operatorName = v.getBusCompany() != null ? v.getBusCompany().getName() : "TravelEasy Express";
        Long operatorId = v.getBusCompany() != null ? v.getBusCompany().getId() : 1L;

        return VehicleResponse.builder()
                .id(v.getId())
                .plate(v.getPlateNumber())
                .code(v.getVehicleCode() != null ? v.getVehicleCode() : "v" + v.getId())
                .type(v.getVehicleType())
                .floors(v.getFloors() != null ? v.getFloors() : 2)
                .year(v.getManufactureYear() != null ? v.getManufactureYear() : 2023)
                .busCompanyId(operatorId)
                .operator(operatorName)
                .status(v.getStatus())
                .statusLabel(isActive ? "Hoạt động" : "Ngừng hoạt động")
                .seatLayout(v.getSeatLayout() != null ? v.getSeatLayout() : "—")
                .image(v.getImageUrl())
                .createdAt(v.getCreatedAt())
                .build();
    }
}
