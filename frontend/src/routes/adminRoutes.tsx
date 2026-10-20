import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';

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
      {/* Trang tổng quan thống kê & điều hành */}
      <Route path="/" element={<AdminDashboardPage />} />
      <Route path="/dashboard" element={<AdminDashboardPage />} />
      {/* Các route mở rộng tiếp theo của Admin do Phạm Công Thành phát triển:
          - /admin/trips: Quản lý chi tiết lịch trình chuyến xe
          - /admin/companies: Quản lý đối tác nhà xe & phương tiện
          - /admin/users: Quản lý người dùng & phân quyền RBAC
          - /admin/policies: Quản lý chính sách giá vé & hủy trả
      */}
    </Routes>
  );
};

export default AdminRoutes;

