package com.traveleasy.common.security;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.entity.StaffRole;
import com.traveleasy.entity.User;
import com.traveleasy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Arrays;

/**
 * Dịch vụ kiểm soát phân quyền nhân viên nội bộ nhà xe (Sub-Account RBAC Service)
 * Áp dụng nguyên tắc Least Privilege (Quyền tối thiểu) để bảo vệ thông tin mật
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CompanySecurityService {

    private final UserRepository userRepository;

    /**
     * Xác thực xem tài khoản đang đăng nhập có thuộc các vai trò cho phép hay không
     * @param authentication Phiên xác thực người dùng Spring Security
     * @param allowedRoles Danh sách các StaffRole được phép truy cập
     * @return User Entity của người dùng hợp lệ
     */
    public User requireStaffRole(Authentication authentication, StaffRole... allowedRoles) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn cần đăng nhập để truy cập tính năng này!");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy thông tin tài khoản: " + email));

        StaffRole currentRole = user.getStaffRole() != null ? user.getStaffRole() : StaffRole.OWNER;

        boolean isAllowed = Arrays.asList(allowedRoles).contains(currentRole);
        if (!isAllowed) {
            log.warn("Truy cập trái phép: User {} mang vai trò {} cố tình truy cập chức năng yêu cầu {}",
                    email, currentRole, Arrays.toString(allowedRoles));
            throw new AppException(ErrorCode.FORBIDDEN,
                    "TRUY CẬP BỊ TỪ CHỐI (403 Forbidden): Bạn đang đăng nhập với vai trò [" + currentRole + "]. "
                    + "Chức năng này thuộc phạm vi bảo mật chỉ dành riêng cho: " + Arrays.toString(allowedRoles) + "!");
        }

        return user;
    }

    /**
     * Lấy StaffRole hiện tại của user, mặc định là OWNER nếu chưa thiết lập
     */
    public StaffRole getCurrentStaffRole(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return StaffRole.OWNER;
        }
        return userRepository.findByEmail(authentication.getName())
                .map(u -> u.getStaffRole() != null ? u.getStaffRole() : StaffRole.OWNER)
                .orElse(StaffRole.OWNER);
    }
}
