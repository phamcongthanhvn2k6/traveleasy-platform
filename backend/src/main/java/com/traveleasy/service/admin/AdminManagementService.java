package com.traveleasy.service.admin;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.admin.*;
import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminManagementService {

    private final UserRepository userRepository;
    private final BusCompanyRepository busCompanyRepository;
    private final SeatTypeRepository seatTypeRepository;
    private final SeatLayoutTemplateRepository seatLayoutTemplateRepository;
    private final LocationRepository locationRepository;
    private final BannerRepository bannerRepository;
    private final GatewayConfigRepository gatewayConfigRepository;
    private final ReviewReportRepository reviewReportRepository;
    private final CancellationPolicyRepository cancellationPolicyRepository;
    private final AuditLogRepository auditLogRepository;
    private final RouteRepository routeRepository;
    private final BookingRepository bookingRepository;
    private final TripRepository tripRepository;
    private final PasswordEncoder passwordEncoder;

    // ==========================================
    // 1. USER MANAGEMENT
    // ==========================================
    @Transactional(readOnly = true)
    public List<UserAdminResponse> getAllUsers(String role, String status, String search) {
        return userRepository.findAll().stream()
                .filter(u -> role == null || role.equalsIgnoreCase("ALL") || u.getRole().name().equalsIgnoreCase(role))
                .filter(u -> status == null || status.equalsIgnoreCase("ALL") || (u.getStatus() != null && u.getStatus().equalsIgnoreCase(status)))
                .filter(u -> search == null || search.isBlank() ||
                        u.getEmail().toLowerCase().contains(search.toLowerCase()) ||
                        u.getFullName().toLowerCase().contains(search.toLowerCase()) ||
                        (u.getPhone() != null && u.getPhone().contains(search)))
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserAdminResponse toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng"));

        String before = "{\"status\": \"" + user.getStatus() + "\"}";
        String newStatus = "ACTIVE".equalsIgnoreCase(user.getStatus()) ? "LOCKED" : "ACTIVE";
        user.setStatus(newStatus);
        User saved = userRepository.save(user);

        logAction("admin@traveleasy.vn", "TOGGLE_USER_STATUS", "users #" + id, before, "{\"status\": \"" + newStatus + "\"}");
        return mapToUserResponse(saved);
    }

    @Transactional
    public UserAdminResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email đã được sử dụng");
        }

        Role userRole = Role.CUSTOMER;
        if (request.getRole() != null) {
            try {
                userRole = Role.valueOf(request.getRole().toUpperCase());
            } catch (Exception ignored) {}
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(userRole)
                .status("ACTIVE")
                .build();

        User saved = userRepository.save(user);
        logAction("admin@traveleasy.vn", "CREATE_USER", "users #" + saved.getId(), "-", "{\"email\": \"" + saved.getEmail() + "\"}");
        return mapToUserResponse(saved);
    }

    @Transactional
    public UserAdminResponse updateUser(Long id, CreateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng"));
        if (request.getFullName() != null && !request.getFullName().isBlank()) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getRole() != null) {
            try {
                user.setRole(Role.valueOf(request.getRole().toUpperCase()));
            } catch (Exception ignored) {}
        }
        User saved = userRepository.save(user);
        logAction("admin@traveleasy.vn", "UPDATE_USER", "users #" + id, "-", "{\"email\": \"" + saved.getEmail() + "\"}");
        return mapToUserResponse(saved);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng"));
        if ("admin@traveleasy.vn".equalsIgnoreCase(user.getEmail())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Không thể xoá tài khoản Quản trị viên tối cao!");
        }
        if (bookingRepository.existsByUserId(id)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Không thể xoá tài khoản này vì đã có lịch sử đơn đặt vé. Vui lòng sử dụng tính năng KHÓA TÀI KHOẢN (LOCKED).");
        }
        userRepository.delete(user);
        logAction("admin@traveleasy.vn", "DELETE_USER", "users #" + id, "{\"email\": \"" + user.getEmail() + "\"}", "-");
    }

    private UserAdminResponse mapToUserResponse(User user) {
        String roleLabel = switch (user.getRole()) {
            case ADMIN -> "Quản trị viên";
            case OPERATOR -> "Nhà xe";
            default -> "Khách hàng";
        };

        return UserAdminResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone() != null ? user.getPhone() : "")
                .role(user.getRole().name())
                .roleLabel(roleLabel)
                .status(user.getStatus() != null ? user.getStatus() : "ACTIVE")
                .createdAt(user.getCreatedAt())
                .build();
    }

    // ==========================================
    // 2. BUS COMPANY MANAGEMENT
    // ==========================================
    @Transactional(readOnly = true)
    public List<BusCompanyAdminResponse> getAllBusCompanies(String status, String search) {
        return busCompanyRepository.findAll().stream()
                .filter(c -> status == null || status.equalsIgnoreCase("ALL") || (c.getStatus() != null && c.getStatus().equalsIgnoreCase(status)))
                .filter(c -> search == null || search.isBlank() ||
                        c.getName().toLowerCase().contains(search.toLowerCase()) ||
                        (c.getEmail() != null && c.getEmail().toLowerCase().contains(search.toLowerCase())) ||
                        (c.getHotline() != null && c.getHotline().contains(search)))
                .map(this::mapToCompanyResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BusCompanyAdminResponse updateCompanyStatus(Long id, String status) {
        BusCompany company = busCompanyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy nhà xe"));

        String before = "{\"status\": \"" + company.getStatus() + "\"}";
        company.setStatus(status.toUpperCase());
        BusCompany saved = busCompanyRepository.save(company);

        logAction("admin@traveleasy.vn", status.equalsIgnoreCase("ACTIVE") ? "APPROVE_COMPANY" : "SUSPEND_COMPANY",
                "bus_companies #" + id, before, "{\"status\": \"" + status + "\"}");
        return mapToCompanyResponse(saved);
    }

    @Transactional
    public BusCompanyAdminResponse createBusCompany(CreateBusCompanyRequest request) {
        BusCompany company = BusCompany.builder()
                .name(request.getName())
                .code(request.getCode())
                .hotline(request.getHotline())
                .email(request.getEmail())
                .address(request.getAddress())
                .logoUrl(request.getLogoUrl())
                .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "PENDING_APPROVAL")
                .build();

        BusCompany saved = busCompanyRepository.save(company);
        logAction("admin@traveleasy.vn", "CREATE_COMPANY", "bus_companies #" + saved.getId(), "-", "{\"name\": \"" + saved.getName() + "\"}");
        return mapToCompanyResponse(saved);
    }

    @Transactional
    public BusCompanyAdminResponse updateBusCompany(Long id, CreateBusCompanyRequest request) {
        BusCompany company = busCompanyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy nhà xe"));
        if (request.getName() != null && !request.getName().isBlank()) company.setName(request.getName());
        if (request.getCode() != null) company.setCode(request.getCode());
        if (request.getHotline() != null && !request.getHotline().isBlank()) company.setHotline(request.getHotline());
        if (request.getEmail() != null) company.setEmail(request.getEmail());
        if (request.getAddress() != null) company.setAddress(request.getAddress());
        BusCompany saved = busCompanyRepository.save(company);
        logAction("admin@traveleasy.vn", "UPDATE_COMPANY", "bus_companies #" + id, "-", "{\"name\": \"" + saved.getName() + "\"}");
        return mapToCompanyResponse(saved);
    }

    @Transactional
    public void deleteBusCompany(Long id) {
        BusCompany company = busCompanyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy nhà xe"));
        if (tripRepository.existsByBusCompanyId(id)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Không thể xoá nhà xe này vì đang có các chuyến xe trên hệ thống. Vui lòng chuyển trạng thái sang TẠM NGƯNG (SUSPENDED).");
        }
        busCompanyRepository.delete(company);
        logAction("admin@traveleasy.vn", "DELETE_COMPANY", "bus_companies #" + id, "{\"name\": \"" + company.getName() + "\"}", "-");
    }

    private BusCompanyAdminResponse mapToCompanyResponse(BusCompany c) {
        String status = c.getStatus() != null ? c.getStatus() : "ACTIVE";
        String statusLabel = switch (status) {
            case "PENDING_APPROVAL" -> "Chờ duyệt";
            case "SUSPENDED" -> "Tạm ngưng";
            default -> "Hoạt động";
        };

        return BusCompanyAdminResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .code(c.getCode())
                .hotline(c.getHotline())
                .email(c.getEmail())
                .address(c.getAddress())
                .logoUrl(c.getLogoUrl())
                .status(status)
                .statusLabel(statusLabel)
                .averageRating(c.getAverageRating())
                .createdAt(c.getCreatedAt())
                .build();
    }

    // ==========================================
    // 3. SEAT CATALOG (TYPES & TEMPLATES)
    // ==========================================
    @Transactional(readOnly = true)
    public List<SeatType> getAllSeatTypes() {
        return seatTypeRepository.findAll();
    }

    @Transactional
    public SeatType createSeatType(SeatTypeRequest request) {
        SeatType st = SeatType.builder()
                .code(request.getCode().toUpperCase())
                .label(request.getLabel())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE")
                .build();
        SeatType saved = seatTypeRepository.save(st);
        logAction("admin@traveleasy.vn", "CREATE_SEAT_TYPE", "seat_types #" + saved.getCode(), "-", "{\"label\": \"" + saved.getLabel() + "\"}");
        return saved;
    }

    @Transactional
    public SeatType updateSeatTypeStatus(String code, String status) {
        SeatType st = seatTypeRepository.findById(code)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy loại ghế"));
        String before = "{\"status\": \"" + st.getStatus() + "\"}";
        st.setStatus(status.toUpperCase());
        SeatType saved = seatTypeRepository.save(st);
        logAction("admin@traveleasy.vn", "UPDATE_SEAT_TYPE_STATUS", "seat_types #" + code, before, "{\"status\": \"" + status + "\"}");
        return saved;
    }

    @Transactional(readOnly = true)
    public List<SeatLayoutTemplate> getAllSeatTemplates() {
        return seatLayoutTemplateRepository.findAll();
    }

    @Transactional
    public SeatLayoutTemplate createSeatTemplate(SeatTemplateRequest request) {
        SeatLayoutTemplate tpl = SeatLayoutTemplate.builder()
                .name(request.getName())
                .maxFloor(request.getMaxFloor() != null ? request.getMaxFloor() : 2)
                .maxRows(request.getMaxRows() != null ? request.getMaxRows() : 6)
                .maxColumns(request.getMaxColumns() != null ? request.getMaxColumns() : 3)
                .totalSeats(request.getTotalSeats() != null ? request.getTotalSeats() : 34)
                .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "PUBLISHED")
                .build();
        SeatLayoutTemplate saved = seatLayoutTemplateRepository.save(tpl);
        logAction("admin@traveleasy.vn", "CREATE_SEAT_TEMPLATE", "seat_layout_templates #" + saved.getId(), "-", "{\"name\": \"" + saved.getName() + "\"}");
        return saved;
    }

    @Transactional
    public void deleteSeatTemplate(Long id) {
        seatLayoutTemplateRepository.deleteById(id);
        logAction("admin@traveleasy.vn", "DELETE_SEAT_TEMPLATE", "seat_layout_templates #" + id, "-", "{\"deleted\": true}");
    }

    // ==========================================
    // 4. LOCATIONS
    // ==========================================
    @Transactional(readOnly = true)
    public List<Location> getAllLocations(String search, String type, String province) {
        return locationRepository.findAll().stream()
                .filter(loc -> type == null || type.equalsIgnoreCase("ALL") || (loc.getLocationType() != null && loc.getLocationType().equalsIgnoreCase(type)))
                .filter(loc -> province == null || province.equalsIgnoreCase("ALL") || (loc.getProvince() != null && loc.getProvince().equalsIgnoreCase(province)))
                .filter(loc -> search == null || search.isBlank() ||
                        loc.getName().toLowerCase().contains(search.toLowerCase()) ||
                        (loc.getAddress() != null && loc.getAddress().toLowerCase().contains(search.toLowerCase())))
                .collect(Collectors.toList());
    }

    @Transactional
    public Location createLocation(LocationRequest request) {
        Location loc = Location.builder()
                .name(request.getName())
                .locationType(request.getLocationType() != null ? request.getLocationType().toUpperCase() : "BUS_STATION")
                .province(request.getProvince())
                .address(request.getAddress())
                .routesCount(request.getRoutesCount() != null ? request.getRoutesCount() : 0)
                .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE")
                .build();
        Location saved = locationRepository.save(loc);
        logAction("admin@traveleasy.vn", "CREATE_LOCATION", "locations #" + saved.getId(), "-", "{\"name\": \"" + saved.getName() + "\"}");
        return saved;
    }

    @Transactional
    public Location updateLocation(Long id, LocationRequest request) {
        Location loc = locationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy địa điểm"));
        loc.setName(request.getName());
        if (request.getLocationType() != null) loc.setLocationType(request.getLocationType().toUpperCase());
        if (request.getProvince() != null) loc.setProvince(request.getProvince());
        if (request.getAddress() != null) loc.setAddress(request.getAddress());
        if (request.getRoutesCount() != null) loc.setRoutesCount(request.getRoutesCount());
        if (request.getStatus() != null) loc.setStatus(request.getStatus().toUpperCase());
        return locationRepository.save(loc);
    }

    @Transactional
    public void deleteLocation(Long id) {
        locationRepository.deleteById(id);
        logAction("admin@traveleasy.vn", "DELETE_LOCATION", "locations #" + id, "-", "{\"deleted\": true}");
    }

    // ==========================================
    // 5. BANNERS
    // ==========================================
    @Transactional(readOnly = true)
    public List<Banner> getAllBanners(String search, String position, String status) {
        return bannerRepository.findAll().stream()
                .filter(b -> position == null || position.equalsIgnoreCase("ALL") || (b.getPosition() != null && b.getPosition().equalsIgnoreCase(position)))
                .filter(b -> status == null || status.equalsIgnoreCase("ALL") || (b.getStatus() != null && b.getStatus().equalsIgnoreCase(status)))
                .filter(b -> search == null || search.isBlank() || b.getTitle().toLowerCase().contains(search.toLowerCase()))
                .collect(Collectors.toList());
    }

    @Transactional
    public Banner createBanner(BannerRequest request) {
        Banner banner = Banner.builder()
                .title(request.getTitle())
                .imagePath(request.getImagePath())
                .position(request.getPosition() != null ? request.getPosition() : "Trang chu - Top")
                .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE")
                .duration(request.getDuration())
                .link(request.getLink())
                .build();
        Banner saved = bannerRepository.save(banner);
        logAction("admin@traveleasy.vn", "CREATE_BANNER", "banners #" + saved.getId(), "-", "{\"title\": \"" + saved.getTitle() + "\"}");
        return saved;
    }

    @Transactional
    public Banner toggleBannerStatus(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy banner"));
        String before = "{\"status\": \"" + banner.getStatus() + "\"}";
        String newStatus = "ACTIVE".equalsIgnoreCase(banner.getStatus()) ? "INACTIVE" : "ACTIVE";
        banner.setStatus(newStatus);
        Banner saved = bannerRepository.save(banner);
        logAction("admin@traveleasy.vn", "UPDATE_BANNER", "banners #" + id, before, "{\"status\": \"" + newStatus + "\"}");
        return saved;
    }

    @Transactional
    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
        logAction("admin@traveleasy.vn", "DELETE_BANNER", "banners #" + id, "-", "{\"deleted\": true}");
    }

    // ==========================================
    // 6. GATEWAYS
    // ==========================================
    @Transactional(readOnly = true)
    public List<GatewayConfig> getAllGateways() {
        return gatewayConfigRepository.findAll();
    }

    @Transactional
    public GatewayConfig toggleGatewayStatus(String provider) {
        GatewayConfig gw = gatewayConfigRepository.findByProvider(provider.toUpperCase())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy cấu hình gateway: " + provider));
        String before = "{\"status\": \"" + gw.getStatus() + "\"}";
        String newStatus = "ACTIVE".equalsIgnoreCase(gw.getStatus()) ? "INACTIVE" : "ACTIVE";
        gw.setStatus(newStatus);
        gw.setUpdatedAt(LocalDateTime.now());
        GatewayConfig saved = gatewayConfigRepository.save(gw);
        logAction("admin@traveleasy.vn", "TOGGLE_GATEWAY", "gateway #" + provider, before, "{\"status\": \"" + newStatus + "\"}");
        return saved;
    }

    // ==========================================
    // 7. REVIEW REPORTS
    // ==========================================
    @Transactional(readOnly = true)
    public List<ReviewReport> getAllReviewReports(String status) {
        return reviewReportRepository.findAll().stream()
                .filter(r -> status == null || status.equalsIgnoreCase("ALL") || (r.getStatus() != null && r.getStatus().equalsIgnoreCase(status)))
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewReport updateReviewReportStatus(Long id, String status) {
        ReviewReport report = reviewReportRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy báo cáo đánh giá"));
        String before = "{\"status\": \"" + report.getStatus() + "\"}";
        report.setStatus(status.toUpperCase());
        ReviewReport saved = reviewReportRepository.save(report);
        logAction("admin@traveleasy.vn", status.equalsIgnoreCase("APPROVED") ? "APPROVE_REVIEW_REPORT" : "REJECT_REVIEW_REPORT",
                "review_reports #" + id, before, "{\"status\": \"" + status + "\"}");
        return saved;
    }

    // ==========================================
    // 8. CANCELLATION POLICIES
    // ==========================================
    @Transactional(readOnly = true)
    public List<CancellationPolicy> getAllCancellationPolicies() {
        return cancellationPolicyRepository.findAll();
    }

    @Transactional
    public CancellationPolicy createCancellationPolicy(CancellationPolicyRequest request) {
        CancellationPolicy policy = CancellationPolicy.builder()
                .name(request.getName())
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .busCompanyName(request.getBusCompanyName())
                .description(request.getDescription())
                .rulesCount(request.getRulesCount() != null ? request.getRulesCount() : 3)
                .build();
        CancellationPolicy saved = cancellationPolicyRepository.save(policy);
        logAction("admin@traveleasy.vn", "CREATE_CANCELLATION_POLICY", "cancellation_policies #" + saved.getId(), "-", "{\"name\": \"" + saved.getName() + "\"}");
        return saved;
    }

    // ==========================================
    // 9. AUDIT LOGS
    // ==========================================
    @Transactional(readOnly = true)
    public List<AuditLog> getAllAuditLogs(String action) {
        if (action != null && !action.equalsIgnoreCase("ALL")) {
            return auditLogRepository.findByActionOrderByCreatedAtDesc(action.toUpperCase());
        }
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }

    // ==========================================
    // 10. ROUTE MANAGEMENT (/admin/routes)
    // ==========================================
    @Transactional(readOnly = true)
    public List<RouteAdminResponse> getAllRoutes(String search, Long companyId) {
        return routeRepository.findAll().stream()
                .filter(r -> companyId == null || (r.getBusCompany() != null && r.getBusCompany().getId().equals(companyId)))
                .filter(r -> search == null || search.isBlank() ||
                        r.getDepartureLocation().toLowerCase().contains(search.toLowerCase()) ||
                        r.getArrivalLocation().toLowerCase().contains(search.toLowerCase()) ||
                        (r.getBusCompany() != null && r.getBusCompany().getName().toLowerCase().contains(search.toLowerCase())))
                .map(this::mapToRouteResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RouteAdminResponse createRoute(CreateRouteRequest request) {
        if (request.getDepartureLocation() != null && request.getArrivalLocation() != null &&
                request.getDepartureLocation().trim().equalsIgnoreCase(request.getArrivalLocation().trim())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Điểm khởi hành và điểm đến không được trùng nhau");
        }

        BusCompany company = busCompanyRepository.findById(request.getBusCompanyId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy nhà xe"));

        Route route = Route.builder()
                .busCompany(company)
                .departureLocation(request.getDepartureLocation())
                .arrivalLocation(request.getArrivalLocation())
                .durationHours(request.getDurationHours())
                .distanceKm(request.getDistanceKm() != null ? request.getDistanceKm() : java.math.BigDecimal.valueOf(100))
                .build();

        Route saved = routeRepository.save(route);
        logAction("admin@traveleasy.vn", "CREATE_ROUTE", "routes #" + saved.getId(), "-", 
                "{\"company\": \"" + company.getName() + "\", \"from\": \"" + saved.getDepartureLocation() + "\", \"to\": \"" + saved.getArrivalLocation() + "\"}");
        return mapToRouteResponse(saved);
    }

    @Transactional
    public RouteAdminResponse updateRoute(Long id, CreateRouteRequest request) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tuyến đường"));
        if (request.getDepartureLocation() != null) route.setDepartureLocation(request.getDepartureLocation());
        if (request.getArrivalLocation() != null) route.setArrivalLocation(request.getArrivalLocation());
        if (request.getDurationHours() != null) route.setDurationHours(request.getDurationHours());
        if (request.getDistanceKm() != null) route.setDistanceKm(request.getDistanceKm());
        Route saved = routeRepository.save(route);
        logAction("admin@traveleasy.vn", "UPDATE_ROUTE", "routes #" + id, "-", "{\"from\": \"" + saved.getDepartureLocation() + "\", \"to\": \"" + saved.getArrivalLocation() + "\"}");
        return mapToRouteResponse(saved);
    }

    @Transactional
    public void deleteRoute(Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tuyến đường"));
        if (tripRepository.existsByRouteId(id)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Không thể xoá tuyến đường này vì đang có các chuyến xe trực thuộc. Vui lòng huỷ hoặc xoá các chuyến xe trước.");
        }
        routeRepository.delete(route);
        logAction("admin@traveleasy.vn", "DELETE_ROUTE", "routes #" + id, "{\"from\": \"" + route.getDepartureLocation() + "\", \"to\": \"" + route.getArrivalLocation() + "\"}", "-");
    }

    private RouteAdminResponse mapToRouteResponse(Route r) {
        return RouteAdminResponse.builder()
                .id(r.getId())
                .busCompanyId(r.getBusCompany() != null ? r.getBusCompany().getId() : null)
                .busCompanyName(r.getBusCompany() != null ? r.getBusCompany().getName() : "TravelEasy Express")
                .departureLocation(r.getDepartureLocation())
                .arrivalLocation(r.getArrivalLocation())
                .durationHours(r.getDurationHours())
                .distanceKm(r.getDistanceKm())
                .pointsCount(r.getPoints() != null ? r.getPoints().size() : 0)
                .createdAt(r.getCreatedAt())
                .build();
    }

    @Transactional
    public void logAction(String userEmail, String action, String target, String before, String after) {
        try {
            AuditLog logEntry = AuditLog.builder()
                    .userEmail(userEmail != null ? userEmail : "admin@traveleasy.vn")
                    .action(action)
                    .target(target)
                    .beforeState(before)
                    .afterState(after)
                    .build();
            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to write audit log: {}", e.getMessage());
        }
    }
}
