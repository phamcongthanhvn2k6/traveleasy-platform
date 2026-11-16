package com.traveleasy.service.company;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.company.crew.AssignCrewRequest;
import com.traveleasy.dto.company.crew.TripCrewResponse;
import com.traveleasy.entity.BusCompany;
import com.traveleasy.entity.Trip;
import com.traveleasy.entity.TripCrew;
import com.traveleasy.repository.BusCompanyRepository;
import com.traveleasy.repository.TripCrewRepository;
import com.traveleasy.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TripCrewServiceImpl implements TripCrewService {

    private final TripCrewRepository tripCrewRepository;
    private final TripRepository tripRepository;
    private final BusCompanyRepository busCompanyRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TripCrewResponse> getCrewAssignments(Long busCompanyId, String date) {
        List<Trip> trips = tripRepository.findByBusCompanyIdWithDetails(busCompanyId);

        return trips.stream()
                .map(trip -> {
                    TripCrew crew = tripCrewRepository.findByTripId(trip.getId()).orElse(null);
                    return mapToResponse(trip, crew);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TripCrewResponse assignCrew(Long busCompanyId, AssignCrewRequest request) {
        Trip trip = tripRepository.findByIdWithDetails(request.getTripId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe có ID: " + request.getTripId()));

        if (!trip.getBusCompany().getId().equals(busCompanyId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền quản lý chuyến xe của nhà xe khác!");
        }

        double distanceKm = request.getDistanceKm() != null ? request.getDistanceKm()
                : (trip.getRoute().getDistanceKm() != null ? trip.getRoute().getDistanceKm().doubleValue() : 0.0);

        // 1. Kiểm tra an toàn nồng độ cồn (DoD: Chặn nếu chưa kiểm tra hoặc nồng độ cồn > 0)
        if (!Boolean.TRUE.equals(request.getAlcoholTested())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "CẢNH BÁO AN TOÀN: Chưa có xác nhận kiểm tra nồng độ cồn (alcohol_tested = false)! Không thể phân công hoặc xuất bến.");
        }

        BigDecimal alcoholReading = request.getAlcoholReading() != null ? request.getAlcoholReading() : BigDecimal.ZERO;
        if (alcoholReading.compareTo(BigDecimal.ZERO) > 0) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "VI PHẠM AN TOÀN: Phát hiện nồng độ cồn (" + alcoholReading + " mg/L)! Nồng độ cồn bắt buộc phải là 0.00 mg/L để đảm bảo an toàn.");
        }

        // 2. Kiểm tra điều kiện GPLX hạng D hoặc E
        String license = request.getPrimaryDriverLicense() != null ? request.getPrimaryDriverLicense().toUpperCase() : "";
        boolean hasValidClass = license.contains("HẠNG D") || license.contains("HẠNG E") || license.contains("HANG D") || license.contains("HANG E") || license.contains("BẰNG D") || license.contains("BẰNG E") || license.matches(".*\\b[DE]\\b.*");
        if (!license.isEmpty() && !hasValidClass) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "VI PHẠM PHÁP LÝ GTVT: Giấy phép lái xe phải thuộc hạng D hoặc E (chở khách từ 10 đến 30 chỗ hoặc trên 30 chỗ)!");
        }

        // 3. Kiểm tra thời gian lái xe liên tục (Không quá 4 giờ liên tục theo quy chuẩn Bộ GTVT)
        BigDecimal driveHours = request.getContinuousDriveHours() != null ? request.getContinuousDriveHours()
                : (trip.getRoute().getDurationHours() != null ? trip.getRoute().getDurationHours() : BigDecimal.valueOf(3.0));

        if (driveHours.compareTo(BigDecimal.valueOf(4.0)) > 0) {
            String secDriver = request.getSecondaryDriverName();
            if (secDriver == null || secDriver.trim().isEmpty() || "null".equalsIgnoreCase(secDriver)) {
                throw new AppException(ErrorCode.VALIDATION_ERROR,
                        "VI PHẠM QUY ĐỊNH BỘ GTVT: Chuyến xe có thời gian chạy " + driveHours + "h (> 4 giờ liên tục) bắt buộc phải bố trí Tài xế 2 (Đổi lái)!");
            }
        }

        if (distanceKm > 300.0) {
            String secDriver = request.getSecondaryDriverName();
            if (secDriver == null || secDriver.trim().isEmpty() || "null".equalsIgnoreCase(secDriver)) {
                throw new AppException(ErrorCode.VALIDATION_ERROR,
                        "VI PHẠM NGHỊ ĐỊNH 10/2020/NĐ-CP: Tuyến đường dài " + distanceKm + "km (> 300km) bắt buộc phải có ít nhất 02 tài xế thay phiên lái!");
            }
        }

        // Lưu hoặc cập nhật TripCrew
        TripCrew crew = tripCrewRepository.findByTripId(trip.getId())
                .orElseGet(() -> TripCrew.builder()
                        .trip(trip)
                        .busCompany(trip.getBusCompany())
                        .build());

        crew.setPrimaryDriverName(request.getPrimaryDriverName().trim());
        crew.setPrimaryDriverPhone(request.getPrimaryDriverPhone().trim());
        crew.setPrimaryDriverLicense(request.getPrimaryDriverLicense() != null ? request.getPrimaryDriverLicense().trim() : "Hạng E (Đầy đủ hồ sơ)");
        crew.setSecondaryDriverName(request.getSecondaryDriverName() != null ? request.getSecondaryDriverName().trim() : null);
        crew.setSecondaryDriverPhone(request.getSecondaryDriverPhone() != null ? request.getSecondaryDriverPhone().trim() : null);
        crew.setConductorName(request.getConductorName() != null ? request.getConductorName().trim() : null);
        crew.setConductorPhone(request.getConductorPhone() != null ? request.getConductorPhone().trim() : null);
        crew.setContinuousDriveHours(driveHours);
        crew.setAlcoholTested(true);
        crew.setAlcoholReading(alcoholReading);
        crew.setNotes(request.getNotes());
        crew.setStatus("COMPLIANT_DISPATCH_READY");

        TripCrew saved = tripCrewRepository.save(crew);
        return mapToResponse(trip, saved);
    }

    @Override
    @Transactional
    public TripCrewResponse signDispatchPermit(Long busCompanyId, Long tripId) {
        Trip trip = tripRepository.findByIdWithDetails(tripId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe có ID: " + tripId));

        if (!trip.getBusCompany().getId().equals(busCompanyId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền quản lý chuyến xe của nhà xe khác!");
        }

        TripCrew crew = tripCrewRepository.findByTripId(tripId)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_ERROR, "Chuyến xe chưa được phân công tổ lái! Vui lòng phân công trước khi ký lệnh."));

        // Chặn ký lệnh xuất bến nếu chưa có xác nhận kiểm tra cồn
        if (!Boolean.TRUE.equals(crew.getAlcoholTested())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "CHẶN XUẤT BẾN: Chưa có xác nhận kiểm tra nồng độ cồn (alcohol_tested = false)! Tuyệt đối không thể ký lệnh.");
        }

        if (crew.getAlcoholReading() != null && crew.getAlcoholReading().compareTo(BigDecimal.ZERO) > 0) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "CẢNH BÁO ĐỎ: Phát hiện nồng độ cồn (" + crew.getAlcoholReading() + " mg/L). Đình chỉ xuất bến theo quy định an toàn!");
        }

        // Tạo mã Lệnh xuất bến điện tử
        String permitCode = "DP-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + String.format("%05d", tripId);
        crew.setDispatchPermitCode(permitCode);
        crew.setDispatchedAt(LocalDateTime.now());
        crew.setStatus("DISPATCH_PERMIT_SIGNED");

        TripCrew saved = tripCrewRepository.save(crew);
        return mapToResponse(trip, saved);
    }

    private TripCrewResponse mapToResponse(Trip trip, TripCrew crew) {
        String routeName = (trip.getRoute() != null)
                ? (trip.getRoute().getDepartureLocation() + " ➔ " + trip.getRoute().getArrivalLocation())
                : "Tuyến xe #" + trip.getId();

        Integer distance = (trip.getRoute() != null && trip.getRoute().getDistanceKm() != null)
                ? trip.getRoute().getDistanceKm().intValue() : 0;

        String tripCode = "TRIP-" + String.format("%04d", trip.getId());

        if (crew == null) {
            return TripCrewResponse.builder()
                    .id(null)
                    .tripId(trip.getId())
                    .tripCode(tripCode)
                    .route(routeName)
                    .departureTime(trip.getDepartureTime())
                    .arrivalTime(trip.getArrivalTime())
                    .licensePlate(trip.getLicensePlate() != null ? trip.getLicensePlate() : "51B-888.88")
                    .busType(trip.getBusType() != null ? trip.getBusType().name() : "SLEEPER")
                    .distanceKm(distance)
                    .primaryDriverName(null)
                    .primaryDriverPhone(null)
                    .primaryDriverLicense(null)
                    .secondaryDriverName(null)
                    .secondaryDriverPhone(null)
                    .conductorName(null)
                    .conductorPhone(null)
                    .continuousDriveHours(trip.getRoute() != null && trip.getRoute().getDurationHours() != null ? trip.getRoute().getDurationHours() : BigDecimal.ZERO)
                    .alcoholTested(false)
                    .alcoholReading(BigDecimal.ZERO)
                    .dispatchPermitCode(null)
                    .dispatchedAt(null)
                    .status("UNASSIGNED")
                    .notes(null)
                    .build();
        }

        return TripCrewResponse.builder()
                .id(crew.getId())
                .tripId(trip.getId())
                .tripCode(tripCode)
                .route(routeName)
                .departureTime(trip.getDepartureTime())
                .arrivalTime(trip.getArrivalTime())
                .licensePlate(trip.getLicensePlate() != null ? trip.getLicensePlate() : "51B-888.88")
                .busType(trip.getBusType() != null ? trip.getBusType().name() : "SLEEPER")
                .distanceKm(distance)
                .primaryDriverName(crew.getPrimaryDriverName())
                .primaryDriverPhone(crew.getPrimaryDriverPhone())
                .primaryDriverLicense(crew.getPrimaryDriverLicense())
                .secondaryDriverName(crew.getSecondaryDriverName())
                .secondaryDriverPhone(crew.getSecondaryDriverPhone())
                .conductorName(crew.getConductorName())
                .conductorPhone(crew.getConductorPhone())
                .continuousDriveHours(crew.getContinuousDriveHours())
                .alcoholTested(crew.getAlcoholTested())
                .alcoholReading(crew.getAlcoholReading())
                .dispatchPermitCode(crew.getDispatchPermitCode())
                .dispatchedAt(crew.getDispatchedAt())
                .status(crew.getStatus())
                .notes(crew.getNotes())
                .build();
    }
}
