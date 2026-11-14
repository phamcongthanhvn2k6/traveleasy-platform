package com.traveleasy.service.company;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.shuttle.*;
import com.traveleasy.entity.ShuttleRequest;
import com.traveleasy.entity.ShuttleRequestStatus;
import com.traveleasy.repository.ShuttleRequestRepository;
import com.traveleasy.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * [S317] Triển khai dịch vụ quản lý điều phối xe trung chuyển đón khách tận nơi
 * @author Trần Minh Đức (tranduc2601)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyShuttleServiceImpl implements CompanyShuttleService {

    private final ShuttleRequestRepository shuttleRequestRepository;
    private final TripRepository tripRepository;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

    @Override
    @Transactional(readOnly = true)
    public List<ShuttleRequestResponse> getShuttleRequests(Long busCompanyId, Long mainTripId, String timeSlot, ShuttleRequestStatus status) {
        LocalDateTime fromTime = null;
        LocalDateTime toTime = null;

        if (timeSlot != null && !timeSlot.isBlank() && !"ALL".equalsIgnoreCase(timeSlot)) {
            LocalDate today = LocalDate.now();
            switch (timeSlot.toUpperCase()) {
                case "MORNING":
                    fromTime = today.atTime(LocalTime.of(6, 0));
                    toTime = today.atTime(LocalTime.of(11, 59, 59));
                    break;
                case "AFTERNOON":
                    fromTime = today.atTime(LocalTime.of(12, 0));
                    toTime = today.atTime(LocalTime.of(17, 59, 59));
                    break;
                case "EVENING":
                    fromTime = today.atTime(LocalTime.of(18, 0));
                    toTime = today.atTime(LocalTime.of(23, 59, 59));
                    break;
                case "NIGHT":
                    fromTime = today.atTime(LocalTime.of(0, 0));
                    toTime = today.atTime(LocalTime.of(5, 59, 59));
                    break;
                default:
                    break;
            }
        }

        List<ShuttleRequest> list = shuttleRequestRepository.findWithFilters(busCompanyId, mainTripId, status, fromTime, toTime);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ShuttleRequestResponse getShuttleRequestById(Long id, Long busCompanyId) {
        ShuttleRequest entity = shuttleRequestRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy yêu cầu trung chuyển: " + id));

        validateTenancy(entity, busCompanyId);
        return mapToResponse(entity);
    }

    @Override
    @Transactional
    public ShuttleRequestResponse createShuttleRequest(CreateShuttleRequest request, Long busCompanyId) {
        // 1. Kiểm tra thời gian đăng ký đón trước (Lead time >= 120 phút)
        Long minutesBefore = request.getMinutesBeforeDeparture() != null ? request.getMinutesBeforeDeparture().longValue() : null;
        if (minutesBefore == null && request.getMainTripId() != null && tripRepository != null) {
            try {
                var tripOpt = tripRepository.findById(request.getMainTripId());
                if (tripOpt.isPresent() && tripOpt.get().getDepartureTime() != null) {
                    minutesBefore = java.time.Duration.between(LocalDateTime.now(), tripOpt.get().getDepartureTime()).toMinutes();
                }
            } catch (Exception ignored) {
            }
        }
        if (minutesBefore != null && minutesBefore < 120) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "KHÔNG THỂ ĐĂNG KÝ: Yêu cầu trung chuyển đón tận nhà phải được đăng ký trước giờ xe chạy tối thiểu 120 phút (Hiện tại chỉ còn " + minutesBefore + " phút)!");
        }

        // 2. Kiểm tra bán kính đón (Geofence <= 10.0km)
        if (request.getDistanceKm() != null && request.getDistanceKm() > 10.0) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "NGOÀI PHẠM VI PHỤC VỤ: Địa chỉ đón cách bến " + request.getDistanceKm() + "km, vượt quá bán kính phục vụ tối đa 10.0km của dịch vụ trung chuyển miễn phí!");
        }

        Long targetCompanyId = busCompanyId != null ? busCompanyId : request.getBusCompanyId();
        if (targetCompanyId == null) {
            targetCompanyId = 14L; // Mặc định cho mock/testing nếu không truyền
        }

        ShuttleRequest entity = ShuttleRequest.builder()
                .busCompanyId(targetCompanyId)
                .bookingId(request.getBookingId())
                .passengerName(request.getPassengerName())
                .passengerPhone(request.getPassengerPhone())
                .pickupAddress(request.getPickupAddress())
                .mainTripId(request.getMainTripId())
                .shuttlePickupTime(request.getShuttlePickupTime())
                .status(ShuttleRequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        ShuttleRequest saved = shuttleRequestRepository.save(entity);
        log.info("Tạo mới yêu cầu đón trung chuyển thành công: id={}, khách={}, SĐT={}",
                saved.getId(), saved.getPassengerName(), saved.getPassengerPhone());

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ShuttleRequestResponse updateShuttleRequest(Long id, UpdateShuttleRequest request, Long busCompanyId) {
        ShuttleRequest entity = shuttleRequestRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy yêu cầu trung chuyển: " + id));

        validateTenancy(entity, busCompanyId);

        if (request.getPassengerName() != null && !request.getPassengerName().isBlank()) {
            entity.setPassengerName(request.getPassengerName());
        }
        if (request.getPassengerPhone() != null && !request.getPassengerPhone().isBlank()) {
            entity.setPassengerPhone(request.getPassengerPhone());
        }
        if (request.getPickupAddress() != null && !request.getPickupAddress().isBlank()) {
            entity.setPickupAddress(request.getPickupAddress());
        }
        if (request.getShuttlePickupTime() != null) {
            entity.setShuttlePickupTime(request.getShuttlePickupTime());
        }
        if (request.getAssignedVehiclePlate() != null) {
            entity.setAssignedVehiclePlate(request.getAssignedVehiclePlate());
        }
        if (request.getShuttleDriverName() != null) {
            entity.setShuttleDriverName(request.getShuttleDriverName());
        }
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }

        ShuttleRequest updated = shuttleRequestRepository.save(entity);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public ShuttleRequestResponse assignDriver(Long id, AssignDriverRequest request, Long busCompanyId) {
        ShuttleRequest entity = shuttleRequestRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy yêu cầu trung chuyển: " + id));

        validateTenancy(entity, busCompanyId);

        entity.setShuttleDriverName(request.getDriverName());
        entity.setAssignedVehiclePlate(request.getVehiclePlate());
        entity.setStatus(ShuttleRequestStatus.ASSIGNED);

        ShuttleRequest updated = shuttleRequestRepository.save(entity);
        log.info("Gán tài xế xe trung chuyển thành công: id={}, tài xế={}, biển số={}",
                id, request.getDriverName(), request.getVehiclePlate());

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public ShuttleRequestResponse updateStatus(Long id, ShuttleRequestStatus status, Long busCompanyId) {
        ShuttleRequest entity = shuttleRequestRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy yêu cầu trung chuyển: " + id));

        validateTenancy(entity, busCompanyId);

        // Chặn nhảy cóc từ PENDING trực tiếp lên ARRIVED_TERMINAL hoặc COMPLETED mà chưa qua điều phối
        if (entity.getStatus() == ShuttleRequestStatus.PENDING &&
                (status == ShuttleRequestStatus.ARRIVED_TERMINAL || status == ShuttleRequestStatus.COMPLETED)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "Yêu cầu trung chuyển đang ở trạng thái CHỜ XỬ LÝ, cần gán tài xế và bắt đầu lộ trình trước khi xác nhận hoàn tất đón!");
        }

        entity.setStatus(status);
        ShuttleRequest updated = shuttleRequestRepository.save(entity);
        log.info("Cập nhật trạng thái yêu cầu trung chuyển id={} sang {}", id, status);

        return mapToResponse(updated);
    }

    private void validateTenancy(ShuttleRequest entity, Long busCompanyId) {
        if (busCompanyId != null && !entity.getBusCompanyId().equals(busCompanyId)) {
            log.warn("Truy cập trái phép: Nhà xe {} cố tình thao tác yêu cầu trung chuyển {} thuộc nhà xe {}",
                    busCompanyId, entity.getId(), entity.getBusCompanyId());
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên yêu cầu trung chuyển của nhà xe khác!");
        }
    }

    private ShuttleRequestResponse mapToResponse(ShuttleRequest entity) {
        String routeInfo = "Chuyến xe #" + entity.getMainTripId();
        String departureTimeStr = null;

        if (tripRepository != null && entity.getMainTripId() != null) {
            try {
                var tripOpt = tripRepository.findById(entity.getMainTripId());
                if (tripOpt.isPresent()) {
                    var trip = tripOpt.get();
                    if (trip.getRoute() != null) {
                        routeInfo = trip.getRoute().getDepartureLocation() + " -> " + trip.getRoute().getArrivalLocation();
                    }
                    if (trip.getDepartureTime() != null) {
                        departureTimeStr = trip.getDepartureTime().format(TIME_FORMATTER);
                    }
                }
            } catch (Exception ignored) {
            }
        }

        return ShuttleRequestResponse.builder()
                .id(entity.getId())
                .busCompanyId(entity.getBusCompanyId())
                .bookingId(entity.getBookingId())
                .passengerName(entity.getPassengerName())
                .passengerPhone(entity.getPassengerPhone())
                .pickupAddress(entity.getPickupAddress())
                .mainTripId(entity.getMainTripId())
                .mainTripRoute(routeInfo)
                .tripDepartureTime(departureTimeStr)
                .shuttlePickupTime(entity.getShuttlePickupTime())
                .assignedVehiclePlate(entity.getAssignedVehiclePlate())
                .shuttleDriverName(entity.getShuttleDriverName())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
