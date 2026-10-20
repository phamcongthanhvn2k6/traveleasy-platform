import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AdminTripsPage } from '../pages/AdminTripsPage';
import { AdminFleetPage } from '../pages/AdminFleetPage';
import { AdminRoutesPage } from '../pages/AdminRoutesPage';
import { AdminPoliciesPage } from '../pages/AdminPoliciesPage';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { AdminAuditLogsPage } from '../pages/AdminAuditLogsPage';

/**
 * =========================================================================
 * ROUTER PHÂN HỆ QUẢN TRỊ (ADMIN PORTAL)
 * Phụ trách độc quyền: Phạm Công Thành (Nhóm trưởng / Architect)
 * Base Path: /admin/*
 * =========================================================================
 */
export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Trang chủ Quản trị & Trung tâm Thống kê Tổng quan */}
      <Route path="/" element={<AdminDashboardPage />} />
      <Route path="/dashboard" element={<AdminDashboardPage />} />

      {/* 2. Quản lý & Điều hành Chuyến xe (Lập lịch & Tự động sinh 34 ghế) */}
      <Route path="/trips" element={<AdminTripsPage />} />

      {/* 3. Quản lý Nhà xe & Đội xe Phương tiện */}
      <Route path="/fleet" element={<AdminFleetPage />} />
      <Route path="/companies" element={<AdminFleetPage />} />

      {/* 4. Quản lý Tuyến đường & Điểm đón/trả */}
      <Route path="/routes" element={<AdminRoutesPage />} />

      {/* 5. Quản lý Chính sách Giá vé & Hủy hoàn tiền */}
      <Route path="/policies" element={<AdminPoliciesPage />} />

      {/* 6. Quản trị Người dùng & Phân quyền RBAC */}
      <Route path="/users" element={<AdminUsersPage />} />

      {/* 7. Nhật ký Hệ thống (Audit Logs) & Kiểm duyệt Đánh giá */}
      <Route path="/audit-logs" element={<AdminAuditLogsPage />} />
    </Routes>
  );
};

export default AdminRoutes;
