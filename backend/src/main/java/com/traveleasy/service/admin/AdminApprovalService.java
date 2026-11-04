package com.traveleasy.service.admin;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.admin.AdminCreationRequestResponse;
import com.traveleasy.dto.admin.CreateAdminProposalRequest;
import com.traveleasy.dto.admin.RejectAdminProposalRequest;
import com.traveleasy.entity.AdminCreationRequest;
import com.traveleasy.entity.AuditLog;
import com.traveleasy.entity.Role;
import com.traveleasy.entity.User;
import com.traveleasy.repository.AdminCreationRequestRepository;
import com.traveleasy.repository.AuditLogRepository;
import com.traveleasy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminApprovalService {

    public static final String ROOT_SYSTEM_ADMIN_EMAIL = "admin@traveleasy.vn";

    private final AdminCreationRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public boolean isSystemAdmin(String email) {
        return ROOT_SYSTEM_ADMIN_EMAIL.equalsIgnoreCase(email);
    }

    @Transactional
    public AdminCreationRequestResponse createProposal(CreateAdminProposalRequest request, String currentEmail) {
        String proposedEmail = request.getProposedEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(proposedEmail)) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email này đã được đăng ký tài khoản trên hệ thống!");
        }

        if (requestRepository.existsByProposedEmailAndStatus(proposedEmail, "PENDING")) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Đã có một phiếu đề xuất cấp quyền Admin đang chờ duyệt cho email này!");
        }

        AdminCreationRequest entity = AdminCreationRequest.builder()
                .proposedEmail(proposedEmail)
                .proposedFullName(request.getProposedFullName().trim())
                .proposedPhone(request.getProposedPhone() != null ? request.getProposedPhone().trim() : "")
                .departmentOrRoleNote(request.getDepartmentOrRoleNote() != null ? request.getDepartmentOrRoleNote().trim() : "")
                .reason(request.getReason().trim())
                .requestedByEmail(currentEmail)
                .status("PENDING")
                .build();

        AdminCreationRequest saved = requestRepository.save(entity);
        logAction(currentEmail, "SUBMIT_ADMIN_PROPOSAL", "admin_request #" + saved.getId(), "-", "{\"email\": \"" + proposedEmail + "\"}");

        return mapToResponse(saved);
    }

    public List<AdminCreationRequestResponse> getProposals(String status) {
        List<AdminCreationRequest> list;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            list = requestRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
        } else {
            list = requestRepository.findAllByOrderByCreatedAtDesc();
        }
        return list.stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public AdminCreationRequestResponse approveProposal(Long id, String currentEmail) {
        if (!isSystemAdmin(currentEmail)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Chỉ Admin Hệ Thống (admin@traveleasy.vn) mới có thẩm quyền phê duyệt cấp quyền Quản trị viên!");
        }

        AdminCreationRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy phiếu đề xuất cấp quyền Admin #" + id));

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Phiếu này đã được xử lý (trạng thái hiện tại: " + request.getStatus() + ")");
        }

        if (userRepository.existsByEmail(request.getProposedEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, "Tài khoản email này đã tồn tại trong danh sách người dùng!");
        }

        // Tạo tài khoản Admin mới chính thức
        String defaultPassword = "Admin@" + (int)(Math.random() * 900000 + 100000) + "!";
        User newAdmin = User.builder()
                .email(request.getProposedEmail())
                .password(passwordEncoder.encode(defaultPassword))
                .fullName(request.getProposedFullName())
                .phone(request.getProposedPhone())
                .role(Role.ADMIN)
                .status("ACTIVE")
                .build();

        User savedUser = userRepository.save(newAdmin);

        request.setStatus("APPROVED");
        request.setReviewedByEmail(currentEmail);
        request.setReviewedAt(LocalDateTime.now());
        request.setCreatedUserId(savedUser.getId());
        AdminCreationRequest savedRequest = requestRepository.save(request);

        logAction(currentEmail, "APPROVE_ADMIN_CREATION", "admin_request #" + id, "{\"status\": \"PENDING\"}", "{\"new_admin_id\": " + savedUser.getId() + "}");
        log.info("System Admin approved creation of Admin account: id={}, email={}", savedUser.getId(), savedUser.getEmail());

        return mapToResponse(savedRequest);
    }

    @Transactional
    public AdminCreationRequestResponse rejectProposal(Long id, RejectAdminProposalRequest rejectReq, String currentEmail) {
        if (!isSystemAdmin(currentEmail)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Chỉ Admin Hệ Thống (admin@traveleasy.vn) mới có thẩm quyền từ chối phiếu đề xuất cấp quyền Quản trị viên!");
        }

        AdminCreationRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy phiếu đề xuất cấp quyền Admin #" + id));

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Phiếu này đã được xử lý (trạng thái hiện tại: " + request.getStatus() + ")");
        }

        request.setStatus("REJECTED");
        request.setReviewedByEmail(currentEmail);
        request.setReviewedAt(LocalDateTime.now());
        request.setRejectReason(rejectReq.getReason().trim());
        AdminCreationRequest saved = requestRepository.save(request);

        logAction(currentEmail, "REJECT_ADMIN_CREATION", "admin_request #" + id, "{\"status\": \"PENDING\"}", "{\"reason\": \"" + rejectReq.getReason() + "\"}");

        return mapToResponse(saved);
    }

    private AdminCreationRequestResponse mapToResponse(AdminCreationRequest r) {
        String label = switch (r.getStatus()) {
            case "APPROVED" -> "Đã phê duyệt";
            case "REJECTED" -> "Bị từ chối";
            default -> "Chờ duyệt";
        };

        return AdminCreationRequestResponse.builder()
                .id(r.getId())
                .proposedEmail(r.getProposedEmail())
                .proposedFullName(r.getProposedFullName())
                .proposedPhone(r.getProposedPhone())
                .departmentOrRoleNote(r.getDepartmentOrRoleNote())
                .reason(r.getReason())
                .requestedByEmail(r.getRequestedByEmail())
                .status(r.getStatus())
                .statusLabel(label)
                .reviewedByEmail(r.getReviewedByEmail())
                .reviewedAt(r.getReviewedAt())
                .rejectReason(r.getRejectReason())
                .createdUserId(r.getCreatedUserId())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private void logAction(String actor, String action, String target, String oldVal, String newVal) {
        try {
            AuditLog log = AuditLog.builder()
                    .userEmail(actor != null ? actor : "SYSTEM")
                    .action(action)
                    .target(target)
                    .beforeState(oldVal)
                    .afterState(newVal)
                    .createdAt(LocalDateTime.now())
                    .build();
            auditLogRepository.save(log);
        } catch (Exception ex) {
            log.error("Failed to write audit log for action: {}", action, ex);
        }
    }
}
