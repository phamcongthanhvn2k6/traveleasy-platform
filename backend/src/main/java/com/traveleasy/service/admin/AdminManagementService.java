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

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
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
    private final com.traveleasy.service.common.EmailNotificationService emailNotificationService;
    private final SettlementRecordRepository settlementRecordRepository;

    // ==========================================
    // 1. USER MANAGEMENT
    // ==========================================
    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable(value = "admin_users", key = "(#role != null ? #role : '') + '_' + (#status != null ? #status : '') + '_' + (#search != null ? #search : '')")
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

    public UserAdminResponse createUser(CreateUserRequest request) {
        return createUser(request, "admin@traveleasy.vn");
    }

    @Transactional
    public UserAdminResponse createUser(CreateUserRequest request, String currentEmail) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email đã được sử dụng");
        }

        Role userRole = Role.CUSTOMER;
        if (request.getRole() != null) {
            try {
                userRole = Role.valueOf(request.getRole().toUpperCase());
            } catch (Exception ignored) {}
        }

        // BẢO MẬT PHÂN CẤP ADMIN: Chỉ Admin Hệ Thống (admin@traveleasy.vn) mới có quyền tạo trực tiếp tài khoản ADMIN
        if (Role.ADMIN.equals(userRole)) {
            if (!"admin@traveleasy.vn".equalsIgnoreCase(currentEmail)) {
                throw new AppException(ErrorCode.FORBIDDEN,
                        "Chỉ Admin Hệ Thống (admin@traveleasy.vn) mới có quyền tạo trực tiếp tài khoản Quản trị viên! Vui lòng lập phiếu đề xuất gửi duyệt.");
            }
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
        logAction(currentEmail != null ? currentEmail : "admin@traveleasy.vn", "CREATE_USER", "users #" + saved.getId(), "-", "{\"email\": \"" + saved.getEmail() + "\", \"role\": \"" + userRole + "\"}");
        return mapToUserResponse(saved);
    }

    public UserAdminResponse updateUser(Long id, UpdateUserRequest request) {
        return updateUser(id, request, "admin@traveleasy.vn");
    }

    @Transactional
    public UserAdminResponse updateUser(Long id, UpdateUserRequest request, String currentEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng"));
        // Email: chi cap nhat khi gui len va khac email hien tai
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email da duoc su dung");
            }
            user.setEmail(request.getEmail().trim());
        }

        // Mat khau: chi dat lai khi admin nhap mat khau moi
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        }

        if (request.getFullName() != null && !request.getFullName().isBlank()) user.setFullName(request.getFullName());
        if (request.getPhone() != null && !request.getPhone().isBlank()) user.setPhone(request.getPhone());
        if (request.getRole() != null) {
            try {
                Role targetRole = Role.valueOf(request.getRole().toUpperCase());
                // Chặn nâng cấp lên ADMIN nếu không phải Admin Hệ Thống
                if (Role.ADMIN.equals(targetRole) && !Role.ADMIN.equals(user.getRole())) {
                    if (!"admin@traveleasy.vn".equalsIgnoreCase(currentEmail)) {
                        throw new AppException(ErrorCode.FORBIDDEN,
                                "Chỉ Admin Hệ Thống (admin@traveleasy.vn) mới có quyền thăng cấp tài khoản thành Quản trị viên!");
                    }
                }
                user.setRole(targetRole);
            } catch (AppException e) {
                throw e;
            } catch (Exception ignored) {}
        }
        User saved = userRepository.save(user);
        logAction(currentEmail != null ? currentEmail : "admin@traveleasy.vn", "UPDATE_USER", "users #" + id, "-", "{\"email\": \"" + saved.getEmail() + "\"}");
        return mapToUserResponse(saved);
    }
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng"));
        if ("admin@traveleasy.vn".equalsIgnoreCase(user.getEmail())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Không thể xoá tài khoản Quản trị viên tối cao!");
        }
        // XÓA MỀM (Soft Delete): Chuyển trạng thái sang DELETED, bảo lưu 100% dữ liệu lịch sử đặt vé và audit logs
        user.setStatus("DELETED");
        userRepository.save(user);
        logAction("admin@traveleasy.vn", "SOFT_DELETE_USER", "users #" + id, "{\"email\": \"" + user.getEmail() + "\"}", "{\"status\": \"DELETED\"}");
    }

    @Transactional
    public UserAdminResponse restoreUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng"));
        user.setStatus("ACTIVE");
        User saved = userRepository.save(user);
        logAction("admin@traveleasy.vn", "RESTORE_USER", "users #" + id, "{\"status\": \"DELETED\"}", "{\"status\": \"ACTIVE\"}");
        return mapToUserResponse(saved);
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
    @org.springframework.cache.annotation.Cacheable(value = "admin_bus_companies", key = "(#status != null ? #status : '') + '_' + (#search != null ? #search : '')")
    public List<BusCompanyAdminResponse> getAllBusCompanies(String status, String search) {
        return busCompanyRepository.findAll().stream()
                .filter(c -> {
                    if (status == null || status.equalsIgnoreCase("ALL")) return true;
                    if (c.getStatus() == null) return false;
                    if (c.getStatus().equalsIgnoreCase(status)) return true;
                    if (status.equalsIgnoreCase("PENDING") && c.getStatus().equalsIgnoreCase("PENDING_APPROVAL")) return true;
                    if (status.equalsIgnoreCase("PENDING_APPROVAL") && c.getStatus().equalsIgnoreCase("PENDING")) return true;
                    return false;
                })
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

        String before = "{status: " + company.getStatus() + "}";
        String normalizedStatus = status.equalsIgnoreCase("ACTIVE") ? "ACTIVE" :
                                 (status.equalsIgnoreCase("PENDING") || status.equalsIgnoreCase("PENDING_APPROVAL")) ? "PENDING_APPROVAL" :
                                 status.equalsIgnoreCase("REJECTED") ? "REJECTED" : "SUSPENDED";

        company.setStatus(normalizedStatus);
        BusCompany saved = busCompanyRepository.save(company);

        // NẾU PHÊ DUYỆT ĐƯA LÊN SÀN (ACTIVE): TỰ ĐỘNG KHỞI TẠO TÀI KHOẢN ĐỐI TÁC (ROLE_OPERATOR) & GỬI EMAIL THÔNG BÁO
        if ("ACTIVE".equals(normalizedStatus)) {
            provisionOperatorAccountAndNotify(saved);
        }

        logAction("admin@traveleasy.vn", normalizedStatus.equals("ACTIVE") ? "APPROVE_COMPANY" : "UPDATE_COMPANY_STATUS",
                "bus_companies #" + id, before, "{\"status\": \"" + normalizedStatus + "\"}");
        return mapToCompanyResponse(saved);
    }

    @Transactional
    public BusCompanyAdminResponse rejectCompany(Long id, String reason) {
        BusCompany company = busCompanyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy nhà xe"));

        String before = "{status: " + company.getStatus() + "}";
        company.setStatus("REJECTED");
        company.setKycStatus("REJECTED");
        company.setRejectionReason(reason != null ? reason : "Hồ sơ chưa đáp ứng đủ quy chuẩn vận tải sàn");
        BusCompany saved = busCompanyRepository.save(company);

        // Gửi email thông báo từ chối kèm lý do thẩm định
        if (company.getEmail() != null && !company.getEmail().isBlank()) {
            emailNotificationService.sendPartnerRejectionEmail(
                    company.getEmail().trim().toLowerCase(),
                    company.getName(),
                    company.getRejectionReason()
            );
        }

        logAction("admin@traveleasy.vn", "REJECT_PARTNER_APPLICATION", "bus_companies #" + id, before,
                "{\"status\": \"REJECTED\", \"reason\": \"" + company.getRejectionReason() + "\"}");
        log.info("🚫 Đã từ chối hồ sơ đối tác: {} với lý do: {}", company.getName(), reason);
        return mapToCompanyResponse(saved);
    }

    @Transactional
    public BusCompanyAdminResponse approveCompanyWithCommission(Long id, BigDecimal commissionRate, String adminNote) {
        BusCompany company = busCompanyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy nhà xe"));

        String before = "{status: " + company.getStatus() + "}";
        company.setStatus("ACTIVE");
        company.setKycStatus("VERIFIED");
        if (commissionRate != null) {
            company.setCommissionRate(commissionRate);
        }
        company.setVerifiedAt(LocalDateTime.now());
        company.setVerifiedBy("admin@traveleasy.vn");

        BusCompany saved = busCompanyRepository.save(company);

        // Tự động tạo tài khoản Điều Hành (OPERATOR) cho đối tác nếu chưa có & bàn giao tài khoản qua Email
        provisionOperatorAccountAndNotify(saved);

        logAction("admin@traveleasy.vn", "APPROVE_COMPANY_KYB", "bus_companies #" + id, before, "{status: ACTIVE, commissionRate: " + company.getCommissionRate() + "}");
        log.info("🎉 Admin đã phê duyệt thành công hồ sơ nhà xe: {} (Commission: {}%)", company.getName(), company.getCommissionRate());
        return mapToCompanyResponse(saved);
    }

    private void provisionOperatorAccountAndNotify(BusCompany company) {
        if (company.getEmail() == null || company.getEmail().isBlank()) {
            return;
        }
        String opEmail = company.getEmail().trim().toLowerCase();
        String tempPassword = generateRandomOperatorPassword();

        if (!userRepository.existsByEmail(opEmail)) {
            User operator = User.builder()
                    .email(opEmail)
                    .password(passwordEncoder.encode(tempPassword))
                    .fullName("Điều Hành " + company.getName())
                    .phone(company.getHotline())
                    .role(Role.OPERATOR)
                    .busCompanyId(company.getId())
                    .status("ACTIVE")
                    .build();
            userRepository.save(operator);
            logAction("admin@traveleasy.vn", "PROVISION_OPERATOR_ACCOUNT", "users #" + operator.getEmail(), "-",
                    "{\"companyId\": " + company.getId() + ", \"companyName\": \"" + company.getName() + "\"}");
            log.info("✅ Đã tự động tạo tài khoản Điều Hành (OPERATOR) cho đối tác: {} ({})", company.getName(), opEmail);
        } else {
            userRepository.findByEmail(opEmail).ifPresent(u -> {
                u.setBusCompanyId(company.getId());
                u.setRole(Role.OPERATOR);
                u.setPassword(passwordEncoder.encode(tempPassword));
                userRepository.save(u);
                log.info("🔗 Đã liên kết tài khoản {} với nhà xe {} và cấp mật khẩu mới", opEmail, company.getName());
            });
        }

        String companyCode = (company.getCode() != null && !company.getCode().isBlank())
                ? company.getCode().trim()
                : ("NX-" + company.getId());

        emailNotificationService.sendPartnerApprovalEmail(
                opEmail,
                company.getName(),
                companyCode,
                tempPassword,
                company.getCommissionRate()
        );
    }

    private String generateRandomOperatorPassword() {
        final String upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        final String lower = "abcdefghijkmnpqrstuvwxyz";
        final String digits = "23456789";
        final String specials = "@#$!&*";
        final String all = upper + lower + digits + specials;
        SecureRandom random = new SecureRandom();

        char[] chars = new char[12];
        chars[0] = upper.charAt(random.nextInt(upper.length()));
        chars[1] = lower.charAt(random.nextInt(lower.length()));
        chars[2] = digits.charAt(random.nextInt(digits.length()));
        chars[3] = specials.charAt(random.nextInt(specials.length()));
        for (int i = 4; i < chars.length; i++) {
            chars[i] = all.charAt(random.nextInt(all.length()));
        }
        for (int i = chars.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char tmp = chars[i];
            chars[i] = chars[j];
            chars[j] = tmp;
        }
        return new String(chars);
    }

    @Transactional
    public BusCompanyAdminResponse requestCompanySupplement(Long id, String reason) {
        BusCompany company = busCompanyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy nhà xe"));

        String before = "{status: " + company.getStatus() + "}";
        company.setStatus("PENDING_SUPPLEMENT");
        company.setKycStatus("PENDING_SUPPLEMENT");
        company.setRejectionReason(reason != null ? reason : "Yêu cầu bổ sung hồ sơ giấy tờ pháp lý");

        BusCompany saved = busCompanyRepository.save(company);

        // Gửi email yêu cầu bổ sung hồ sơ
        if (company.getEmail() != null && !company.getEmail().isBlank()) {
            emailNotificationService.sendPartnerSupplementEmail(
                    company.getEmail().trim().toLowerCase(),
                    company.getName(),
                    company.getRejectionReason()
            );
        }

        logAction("admin@traveleasy.vn", "REQUEST_COMPANY_SUPPLEMENT", "bus_companies #" + id, before, "{status: PENDING_SUPPLEMENT, reason: " + reason + "}");
        log.info("⚠️ Admin yêu cầu bổ sung hồ sơ nhà xe: {} (Lý do: {})", company.getName(), reason);
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
        // XÓA MỀM (Soft Delete): Chuyển trạng thái sang DELETED, bảo lưu toàn bộ dữ liệu xe, chuyến và doanh thu đối soát
        company.setStatus("DELETED");
        busCompanyRepository.save(company);
        logAction("admin@traveleasy.vn", "SOFT_DELETE_COMPANY", "bus_companies #" + id, "{\"name\": \"" + company.getName() + "\"}", "{\"status\": \"DELETED\"}");
    }

    @Transactional
    public BusCompanyAdminResponse restoreBusCompany(Long id) {
        BusCompany company = busCompanyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy nhà xe"));
        company.setStatus("ACTIVE");
        BusCompany saved = busCompanyRepository.save(company);
        logAction("admin@traveleasy.vn", "RESTORE_COMPANY", "bus_companies #" + id, "{\"status\": \"DELETED\"}", "{\"status\": \"ACTIVE\"}");
        return mapToCompanyResponse(saved);
    }

    private BusCompanyAdminResponse mapToCompanyResponse(BusCompany c) {
        String status = c.getStatus() != null ? c.getStatus() : "ACTIVE";
        String statusLabel = switch (status) {
            case "PENDING_APPROVAL", "PENDING" -> "Chờ duyệt";
            case "REJECTED" -> "Bị từ chối";
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
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Mã loại ghế không được để trống");
        }
        SeatType st = SeatType.builder()
                .code(request.getCode().trim().toUpperCase())
                .label(request.getLabel())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE")
                .build();
        SeatType saved = seatTypeRepository.save(st);
        logAction("admin@traveleasy.vn", "CREATE_SEAT_TYPE", "seat_types #" + saved.getCode(), "-", "{\"label\": \"" + saved.getLabel() + "\"}");
        return saved;
    }

    @Transactional
    public SeatType updateSeatType(String code, SeatTypeRequest request) {
        SeatType st = seatTypeRepository.findById(code)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy loại ghế"));
        String before = "{\"label\": \"" + st.getLabel() + "\", \"description\": \"" + (st.getDescription() != null ? st.getDescription() : "") + "\"}";
        if (request.getLabel() != null && !request.getLabel().isBlank()) {
            st.setLabel(request.getLabel().trim());
        }
        if (request.getDescription() != null) {
            st.setDescription(request.getDescription().trim());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            st.setStatus(request.getStatus().toUpperCase());
        }
        SeatType saved = seatTypeRepository.save(st);
        logAction("admin@traveleasy.vn", "UPDATE_SEAT_TYPE", "seat_types #" + code, before, "{\"label\": \"" + saved.getLabel() + "\"}");
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
                .layoutJson(request.getLayoutJson())
                .build();
        SeatLayoutTemplate saved = seatLayoutTemplateRepository.save(tpl);
        logAction("admin@traveleasy.vn", "CREATE_SEAT_TEMPLATE", "seat_layout_templates #" + saved.getId(), "-", "{\"name\": \"" + saved.getName() + "\"}");
        return saved;
    }

    @Transactional
    public SeatLayoutTemplate updateSeatTemplate(Long id, SeatTemplateRequest request) {
        SeatLayoutTemplate tpl = seatLayoutTemplateRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy mẫu sơ đồ ghế #" + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            tpl.setName(request.getName().trim());
        }
        if (request.getMaxFloor() != null) {
            tpl.setMaxFloor(request.getMaxFloor());
        }
        if (request.getMaxRows() != null) {
            tpl.setMaxRows(request.getMaxRows());
        }
        if (request.getMaxColumns() != null) {
            tpl.setMaxColumns(request.getMaxColumns());
        }
        if (request.getTotalSeats() != null) {
            tpl.setTotalSeats(request.getTotalSeats());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            tpl.setStatus(request.getStatus().toUpperCase());
        }
        if (request.getLayoutJson() != null) {
            tpl.setLayoutJson(request.getLayoutJson());
        }

        SeatLayoutTemplate saved = seatLayoutTemplateRepository.save(tpl);
        logAction("admin@traveleasy.vn", "UPDATE_SEAT_TEMPLATE", "seat_layout_templates #" + id, "-", "{\"name\": \"" + saved.getName() + "\"}");
        return saved;
    }

    @Transactional
    public void deleteSeatTemplate(Long id) {
        SeatLayoutTemplate tpl = seatLayoutTemplateRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy mẫu sơ đồ ghế"));
        // XÓA MỀM (Soft Delete): Đổi sang DEPRECATED
        tpl.setStatus("DEPRECATED");
        seatLayoutTemplateRepository.save(tpl);
        logAction("admin@traveleasy.vn", "SOFT_DELETE_SEAT_TEMPLATE", "seat_layout_templates #" + id, "-", "{\"status\": \"DEPRECATED\"}");
    }

    @Transactional
    public SeatLayoutTemplate restoreSeatTemplate(Long id) {
        SeatLayoutTemplate tpl = seatLayoutTemplateRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy mẫu sơ đồ ghế"));
        tpl.setStatus("PUBLISHED");
        SeatLayoutTemplate saved = seatLayoutTemplateRepository.save(tpl);
        logAction("admin@traveleasy.vn", "RESTORE_SEAT_TEMPLATE", "seat_layout_templates #" + id, "{\"status\": \"DEPRECATED\"}", "{\"status\": \"PUBLISHED\"}");
        return saved;
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
        Location loc = locationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy địa điểm"));
        // XÓA MỀM (Soft Delete): Đổi sang DELETED
        loc.setStatus("DELETED");
        locationRepository.save(loc);
        logAction("admin@traveleasy.vn", "SOFT_DELETE_LOCATION", "locations #" + id, "-", "{\"status\": \"DELETED\"}");
    }

    @Transactional
    public Location restoreLocation(Long id) {
        Location loc = locationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy địa điểm"));
        loc.setStatus("ACTIVE");
        Location saved = locationRepository.save(loc);
        logAction("admin@traveleasy.vn", "RESTORE_LOCATION", "locations #" + id, "{\"status\": \"DELETED\"}", "{\"status\": \"ACTIVE\"}");
        return saved;
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
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy banner"));
        // XÓA MỀM (Soft Delete): Đổi sang DELETED
        banner.setStatus("DELETED");
        bannerRepository.save(banner);
        logAction("admin@traveleasy.vn", "SOFT_DELETE_BANNER", "banners #" + id, "-", "{\"status\": \"DELETED\"}");
    }

    @Transactional
    public Banner restoreBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy banner"));
        banner.setStatus("ACTIVE");
        Banner saved = bannerRepository.save(banner);
        logAction("admin@traveleasy.vn", "RESTORE_BANNER", "banners #" + id, "{\"status\": \"DELETED\"}", "{\"status\": \"ACTIVE\"}");
        return saved;
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

    @Transactional
    public GatewayConfig toggleGatewaySandbox(String provider) {
        GatewayConfig gw = gatewayConfigRepository.findByProvider(provider.toUpperCase())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy cấu hình gateway: " + provider));
        boolean current = Boolean.TRUE.equals(gw.getIsSandbox());
        gw.setIsSandbox(!current);
        gw.setUpdatedAt(LocalDateTime.now());
        GatewayConfig saved = gatewayConfigRepository.save(gw);
        logAction("admin@traveleasy.vn", "TOGGLE_GATEWAY_SANDBOX", "gateway #" + provider, "isSandbox: " + current, "isSandbox: " + !current);
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
    // 9. AUDIT LOGS & SYSTEM DEFENSE SHIELD
    // ==========================================
    private final Map<String, Object> systemDefenseState = new ConcurrentHashMap<>(Map.of(
            "mode", "NORMAL",
            "isLockdown", false,
            "incidentType", "NONE",
            "reason", "Hệ thống hoạt động bình thường, các cơ chế an ninh mạng đang giám sát 24/7.",
            "publicNotice", "",
            "disclaimerActive", false,
            "disclaimerText", "Điều khoản Bất khả kháng & Miễn trừ trách nhiệm bồi thường theo Điều 14 Quy chế Sàn TravelEasy.",
            "activatedAt", "",
            "activatedBy", "System Sentinel"
    ));

    public Map<String, Object> getSystemDefenseStatus() {
        return new HashMap<>(systemDefenseState);
    }

    @Transactional
    public Map<String, Object> updateSystemDefenseStatus(Map<String, Object> payload, String adminEmail) {
        String nextMode = String.valueOf(payload.getOrDefault("mode", "NORMAL")).toUpperCase();
        String incidentType = String.valueOf(payload.getOrDefault("incidentType", "OTHER"));
        String reason = String.valueOf(payload.getOrDefault("reason", ""));
        String publicNotice = String.valueOf(payload.getOrDefault("publicNotice", ""));
        boolean disclaimerActive = Boolean.parseBoolean(String.valueOf(payload.getOrDefault("disclaimerActive", "true")));

        String prevMode = String.valueOf(systemDefenseState.getOrDefault("mode", "NORMAL"));
        String nowStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));

        systemDefenseState.put("mode", nextMode);
        systemDefenseState.put("isLockdown", "LOCKDOWN".equals(nextMode));
        systemDefenseState.put("incidentType", incidentType);
        systemDefenseState.put("reason", reason);
        systemDefenseState.put("publicNotice", publicNotice);
        systemDefenseState.put("disclaimerActive", disclaimerActive);
        systemDefenseState.put("activatedAt", nowStr);
        systemDefenseState.put("activatedBy", adminEmail != null ? adminEmail : "admin@traveleasy.vn");

        // Ghi Audit Log pháp lý bất biến
        String actionName = "LOCKDOWN".equals(nextMode)
                ? "TRIGGER_EMERGENCY_LOCKDOWN"
                : "MAINTENANCE".equals(nextMode)
                ? "TRIGGER_MAINTENANCE_MODE"
                : "RESTORE_SYSTEM_NORMAL";

        String target = "PLATFORM_SECURITY_SHIELD";
        String before = "{\"mode\": \"" + prevMode + "\"}";
        String after = String.format("{\"mode\": \"%s\", \"incident\": \"%s\", \"disclaimerActive\": %b, \"reason\": \"%s\"}",
                nextMode, incidentType, disclaimerActive, reason.replace("\"", "\\\""));

        logAction(adminEmail, actionName, target, before, after);

        return new HashMap<>(systemDefenseState);
    }

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
    @org.springframework.cache.annotation.Cacheable(value = "admin_routes", key = "(#search != null ? #search : '') + '_' + (#companyId != null ? #companyId : '')")
    public List<RouteAdminResponse> getAllRoutes(String search, Long companyId) {
        return routeRepository.findAllWithDetailsByCompanyId(companyId).stream()
                .filter(r -> search == null || search.isBlank() ||
                        r.getDepartureLocation().toLowerCase().contains(search.toLowerCase()) ||
                        r.getArrivalLocation().toLowerCase().contains(search.toLowerCase()) ||
                        (r.getBusCompany() != null && r.getBusCompany().getName().toLowerCase().contains(search.toLowerCase())))
                .map(this::mapToRouteResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"admin_routes", "routes_list", "popular_routes", "trips_search"}, allEntries = true)
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
    @org.springframework.cache.annotation.CacheEvict(value = {"admin_routes", "routes_list", "popular_routes", "trips_search"}, allEntries = true)
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
    @org.springframework.cache.annotation.CacheEvict(value = {"admin_routes", "routes_list", "popular_routes", "trips_search"}, allEntries = true)
    public void deleteRoute(Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tuyến đường"));
        if (tripRepository.existsByRouteId(id)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Không thể xoá tuyến đường này vì đang có các chuyến xe trực thuộc. Vui lòng huỷ hoặc xoá các chuyến xe trước.");
        }
        routeRepository.delete(route);
        logAction("admin@traveleasy.vn", "DELETE_ROUTE", "routes #" + id, "{\"from\": \"" + route.getDepartureLocation() + "\", \"to\": \"" + route.getArrivalLocation() + "\"}", "-");
    }

    @Transactional
    public List<java.util.Map<String, Object>> getAdminSettlements() {
        List<BusCompany> companies = busCompanyRepository.findAll();
        List<java.util.Map<String, Object>> list = new java.util.ArrayList<>();

        // TỐI ƯU HÓA: Truy vấn tổng hợp doanh thu và số vé trực tiếp từ CSDL Postgres thay vì tải toàn bộ bookings
        List<Object[]> statsList = bookingRepository.getBookingStatsGroupedByCompany();
        Map<Long, Long> ticketCountMap = new HashMap<>();
        Map<Long, BigDecimal> grossAmountMap = new HashMap<>();
        Map<Long, BigDecimal> customerPaidMap = new HashMap<>();
        Map<Long, BigDecimal> voucherSubsidyMap = new HashMap<>();
        for (Object[] row : statsList) {
            Long compId = (Long) row[0];
            Long cnt = (Long) row[1];
            BigDecimal sumGross = (BigDecimal) row[2];
            BigDecimal sumPaid = row.length > 3 && row[3] != null ? (BigDecimal) row[3] : sumGross;
            BigDecimal sumVoucher = row.length > 4 && row[4] != null ? (BigDecimal) row[4] : BigDecimal.ZERO;
            if (compId != null) {
                ticketCountMap.put(compId, cnt != null ? cnt : 0L);
                grossAmountMap.put(compId, sumGross != null ? sumGross : BigDecimal.ZERO);
                customerPaidMap.put(compId, sumPaid != null ? sumPaid : BigDecimal.ZERO);
                voucherSubsidyMap.put(compId, sumVoucher != null ? sumVoucher : BigDecimal.ZERO);
            }
        }

        // Tải các hồ sơ đối soát đã lưu trữ bền vững trong CSDL Postgres (settlement_records)
        List<SettlementRecord> savedRecords = settlementRecordRepository.findAll();
        Map<Long, SettlementRecord> recordMap = new HashMap<>();
        for (SettlementRecord sr : savedRecords) {
            if (sr.getCompany() != null && sr.getCompany().getId() != null) {
                recordMap.put(sr.getCompany().getId(), sr);
            }
        }

        for (BusCompany c : companies) {
            int count = ticketCountMap.getOrDefault(c.getId(), 0L).intValue();
            BigDecimal gross = grossAmountMap.getOrDefault(c.getId(), BigDecimal.ZERO);
            BigDecimal paid = customerPaidMap.getOrDefault(c.getId(), gross);
            BigDecimal subsidy = voucherSubsidyMap.getOrDefault(c.getId(), BigDecimal.ZERO);

            // TỈ LỆ HOA HỒNG SÀN THEO HỢP ĐỒNG KYB (MẶC ĐỊNH 10%)
            int comRate = c.getCommissionRate() != null ? c.getCommissionRate().intValue() : 10;
            BigDecimal commission = gross.multiply(BigDecimal.valueOf(comRate)).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            BigDecimal net = gross.subtract(commission);

            SettlementRecord record = recordMap.get(c.getId());
            if (record == null) {
                // Tự động khởi tạo bản ghi đối soát thực tế vào CSDL
                String sId = "s-" + c.getId();
                String code = "DS-202610-" + (c.getCode() != null && !c.getCode().isBlank() ? c.getCode() : ("BC" + c.getId()));
                record = SettlementRecord.builder()
                        .id(sId)
                        .code(code)
                        .company(c)
                        .periodName("Kỳ 2 - Tháng 10/2026")
                        .startDate("16/10/2026")
                        .endDate("31/10/2026")
                        .ticketCount(count)
                        .grossAmount(gross)
                        .customerPaid(paid)
                        .platformSubsidy(subsidy)
                        .commissionRate(comRate)
                        .platformCommission(commission)
                        .netPayable(net)
                        .status("PENDING")
                        .build();
                record = settlementRecordRepository.save(record);
                recordMap.put(c.getId(), record);
            } else if ("PENDING".equals(record.getStatus())) {
                // Nếu hồ sơ đang ở trạng thái PENDING, cập nhật dữ liệu vé mới nhất từ CSDL
                if (record.getTicketCount() != count || record.getGrossAmount().compareTo(gross) != 0) {
                    record.setTicketCount(count);
                    record.setGrossAmount(gross);
                    record.setCustomerPaid(paid);
                    record.setPlatformSubsidy(subsidy);
                    record.setCommissionRate(comRate);
                    record.setPlatformCommission(commission);
                    record.setNetPayable(net);
                    record.setUpdatedAt(LocalDateTime.now());
                    record = settlementRecordRepository.save(record);
                }
            }

            // Trích xuất tài khoản ngân hàng Escrow đã được thẩm định KYB thực tế của nhà xe
            String bankName = (c.getBankName() != null && !c.getBankName().isBlank())
                    ? c.getBankName() : "Ngân hàng TMCP Quân Đội (MB)";
            String accNum = (c.getBankAccountNumber() != null && !c.getBankAccountNumber().isBlank())
                    ? c.getBankAccountNumber() : "09128889999";
            String accHolder = (c.getBankAccountOwner() != null && !c.getBankAccountOwner().isBlank())
                    ? c.getBankAccountOwner().toUpperCase() : c.getName().toUpperCase();
            String bankCode = resolveBankCode(bankName);

            Map<String, String> bank = new HashMap<>();
            bank.put("bankCode", bankCode);
            bank.put("bankName", bankName);
            bank.put("accountNumber", accNum);
            bank.put("accountHolder", accHolder);

            Map<String, Object> item = new HashMap<>();
            item.put("id", record.getId());
            item.put("code", record.getCode());
            item.put("companyId", c.getId());
            item.put("companyName", c.getName());
            item.put("companyLogo", c.getLogoUrl() != null && !c.getLogoUrl().isBlank()
                    ? c.getLogoUrl()
                    : "https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289372/traveleasy/bus-companies/logo_futa_buslines.jpg");
            item.put("periodName", record.getPeriodName());
            item.put("startDate", record.getStartDate());
            item.put("endDate", record.getEndDate());
            item.put("ticketCount", record.getTicketCount());
            item.put("grossAmount", record.getGrossAmount());
            item.put("customerPaid", record.getCustomerPaid());
            item.put("platformSubsidy", record.getPlatformSubsidy());
            item.put("commissionRate", record.getCommissionRate());
            item.put("platformCommission", record.getPlatformCommission());
            item.put("netPayable", record.getNetPayable());
            item.put("bankAccount", bank);
            item.put("status", record.getStatus());
            item.put("reconciledAt", record.getReconciledAt());
            item.put("paidAt", record.getPaidAt());
            item.put("payoutTxHash", record.getPayoutTxHash());
            item.put("payoutNote", record.getPayoutNote());

            list.add(item);
        }
        return list;
    }

    @Transactional
    public Map<String, Object> reconcileSettlement(String settlementId, String userEmail) {
        SettlementRecord record = findSettlementRecord(settlementId);
        record.setStatus("RECONCILED");
        String nowStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        record.setReconciledAt(nowStr);
        record.setUpdatedAt(LocalDateTime.now());
        SettlementRecord saved = settlementRecordRepository.save(record);

        logAction(userEmail != null ? userEmail : "admin@traveleasy.vn", "RECONCILE_SETTLEMENT", settlementId, "-", "RECONCILED");

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("code", saved.getCode());
        result.put("status", saved.getStatus());
        result.put("reconciledAt", saved.getReconciledAt());
        return result;
    }

    @Transactional
    public Map<String, Object> paySettlement(String settlementId, String payoutTxHash, String note, String userEmail) {
        SettlementRecord record = findSettlementRecord(settlementId);
        record.setStatus("PAID");
        String nowStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        record.setPaidAt(nowStr);
        String txHash = (payoutTxHash != null && !payoutTxHash.isBlank()) ? payoutTxHash : ("VCB-FT-" + System.currentTimeMillis());
        record.setPayoutTxHash(txHash);
        if (note != null && !note.isBlank()) {
            record.setPayoutNote(note);
        }
        record.setUpdatedAt(LocalDateTime.now());
        SettlementRecord saved = settlementRecordRepository.save(record);

        // GỬI EMAIL THÔNG BÁO GIẢI NGÂN TỰ ĐỘNG TỚI ĐỐI TÁC NHÀ XE
        try {
            BusCompany comp = saved.getCompany();
            String targetEmail = comp.getEmail();
            if (targetEmail == null || targetEmail.isBlank()) {
                List<User> operators = userRepository.findByBusCompanyId(comp.getId());
                if (!operators.isEmpty() && operators.get(0).getEmail() != null) {
                    targetEmail = operators.get(0).getEmail();
                }
            }

            if (targetEmail != null && !targetEmail.isBlank()) {
                emailNotificationService.sendSettlementPayoutEmail(
                        targetEmail,
                        comp.getName(),
                        saved.getCode(),
                        saved.getPeriodName(),
                        saved.getGrossAmount(),
                        saved.getPlatformCommission(),
                        saved.getNetPayable(),
                        comp.getBankName(),
                        comp.getBankAccountNumber(),
                        comp.getBankAccountOwner(),
                        txHash,
                        note
                );
                log.info("📧 [SETTLEMENT PAYOUT] Đã kích hoạt email giải ngân tới nhà xe {}: {}", comp.getName(), targetEmail);
            }
        } catch (Exception ex) {
            log.error("⚠️ Không thể gửi email thông báo giải ngân: {}", ex.getMessage());
        }

        logAction(userEmail != null ? userEmail : "admin@traveleasy.vn", "PAY_SETTLEMENT", settlementId, "-", "PAID: " + txHash);

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("code", saved.getCode());
        result.put("status", saved.getStatus());
        result.put("paidAt", saved.getPaidAt());
        result.put("payoutTxHash", saved.getPayoutTxHash());
        result.put("payoutNote", saved.getPayoutNote());
        return result;
    }

    private SettlementRecord findSettlementRecord(String settlementId) {
        return settlementRecordRepository.findById(settlementId)
                .or(() -> {
                    if (settlementId.startsWith("s-")) {
                        try {
                            Long cId = Long.parseLong(settlementId.substring(2));
                            return settlementRecordRepository.findFirstByCompanyIdOrderByCreatedAtDesc(cId);
                        } catch (Exception ignored) {}
                    }
                    return java.util.Optional.empty();
                })
                .or(() -> settlementRecordRepository.findByCode(settlementId))
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hồ sơ đối soát quyết toán: " + settlementId));
    }

    private String resolveBankCode(String bankName) {
        if (bankName == null) return "VCB";
        String upper = bankName.toUpperCase();
        if (upper.contains("MB") || upper.contains("QUÂN ĐỘI")) return "MB";
        if (upper.contains("TECHCOM") || upper.contains("TCB")) return "TCB";
        if (upper.contains("VIETCOM") || upper.contains("VCB")) return "VCB";
        if (upper.contains("BIDV") || upper.contains("ĐẦU TƯ")) return "BIDV";
        if (upper.contains("VIETIN") || upper.contains("CTG") || upper.contains("CÔNG THƯƠNG")) return "CTG";
        if (upper.contains("ACB") || upper.contains("Á CHÂU")) return "ACB";
        if (upper.contains("VP") || upper.contains("THỊNH VƯỢNG")) return "VPB";
        if (upper.contains("TP") || upper.contains("TIÊN PHONG")) return "TPB";
        if (upper.contains("SACOM") || upper.contains("STB")) return "STB";
        if (upper.contains("HD") || upper.contains("HDB")) return "HDB";
        if (upper.contains("SHB")) return "SHB";
        return "VCB";
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
