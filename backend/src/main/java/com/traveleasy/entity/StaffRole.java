package com.traveleasy.entity;

/**
 * Phân quyền nội bộ nhà xe (Sub-Account Delegation RBAC)
 * Đảm bảo nguyên lý Least Privilege (Quyền hạn tối thiểu), bảo vệ thông tin mật tài chính
 */
public enum StaffRole {
    /**
     * Chủ nhà xe / Giám đốc / Kế toán trưởng:
     * Full quyền quản trị: Xem ví tiền, yêu cầu rút tiền đối soát, xem sổ chi phí lãi/lỗ P&L,
     * cấu hình giá vé Lễ/Tết và quản lý nhân sự.
     */
    OWNER,

    /**
     * Nhân viên quầy vé / Thu ngân bến xe:
     * Chỉ có quyền: Bán vé nhanh POS, Quản lý ca trực tiền mặt Z-Report, Đổi vé tại quầy.
     * TUYỆT ĐỐI BỊ KHÓA: Ví tiền nhà xe, Quyết toán đối soát, Sổ chi phí lãi/lỗ.
     */
    CASHIER,

    /**
     * Điều hành viên bến xe / Trực ban xuất bến:
     * Chỉ có quyền: Theo dõi lịch chuyến xe, Phân công tổ lái & kiểm tra cồn,
     * Điều phối xe trung chuyển đón tận nhà, Xuất Lệnh Vận Chuyển GTVT.
     * TUYỆT ĐỐI BỊ KHÓA: Tiền nong, Ví tiền và Tài chính kế toán.
     */
    DISPATCHER,

    /**
     * Phụ xe / Tài xế lưu động:
     * Chỉ có quyền: Mở WebApp di động quét mã QR soát vé khách lên xe.
     */
    CONDUCTOR
}
