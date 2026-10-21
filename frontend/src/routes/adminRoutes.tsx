import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { AdminAuthGuard } from '../components/AdminAuthGuard';
import { AdminLoginPage } from '../pages/admin/auth/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/dashboard/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/users/AdminUsersPage';
import { AdminBusCompaniesPage } from '../pages/admin/bus-companies/AdminBusCompaniesPage';
import { AdminSeatTypesPage } from '../pages/admin/seat-types/AdminSeatTypesPage';
import { AdminSeatTemplatesPage } from '../pages/admin/seat-templates/AdminSeatTemplatesPage';
import { AdminLocationsPage } from '../pages/admin/locations/AdminLocationsPage';
import { AdminBannersPage } from '../pages/admin/banners/AdminBannersPage';
import { AdminPaymentsPage } from '../pages/admin/payments/AdminPaymentsPage';
import { AdminReviewsPage } from '../pages/admin/reviews/AdminReviewsPage';
import { AdminCancellationPoliciesPage } from '../pages/admin/cancellation-policies/AdminCancellationPoliciesPage';
import { AdminAuditLogsPage } from '../pages/admin/audit-logs/AdminAuditLogsPage';

/**
 * =========================================================================
 * ROUTER PHÂN HỆ QUẢN TRỊ (ADMIN PORTAL)
 * Base Path: /admin/*
 * Bảo vệ nghiêm ngặt bằng AdminAuthGuard:
 * - /admin/login: Trang xác thực quản trị viên công khai (Không cho phép đăng ký mới)
 * - /admin/*: Yêu cầu JWT Token hợp lệ & Vai trò phải là ROLE_ADMIN
 * =========================================================================
 */
export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Cổng đăng nhập Quản Trị Viên (Công khai, không Sidebar, không Đăng ký) */}
      <Route path="login" element={<AdminLoginPage />} />
      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* 2. Toàn bộ các trang nghiệp vụ Quản trị được bảo vệ tuyệt đối bởi AdminAuthGuard */}
      <Route
        path="*"
        element={
          <AdminAuthGuard>
            <AdminLayout>
              <Routes>
                {/* Trang tổng quan hệ thống */}
                <Route path="" element={<AdminDashboardPage />} />
                <Route path="/" element={<AdminDashboardPage />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="/dashboard" element={<AdminDashboardPage />} />

                {/* Nhóm Tài khoản & Đối tác */}
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="/users" element={<AdminUsersPage />} />
                <Route path="bus-companies" element={<AdminBusCompaniesPage />} />
                <Route path="/bus-companies" element={<AdminBusCompaniesPage />} />

                {/* Nhóm Danh mục */}
                <Route path="seat-catalog/types" element={<AdminSeatTypesPage />} />
                <Route path="/seat-catalog/types" element={<AdminSeatTypesPage />} />
                <Route path="seat-types" element={<AdminSeatTypesPage />} />
                <Route path="/seat-types" element={<AdminSeatTypesPage />} />

                <Route path="seat-catalog/templates" element={<AdminSeatTemplatesPage />} />
                <Route path="/seat-catalog/templates" element={<AdminSeatTemplatesPage />} />
                <Route path="seat-templates" element={<AdminSeatTemplatesPage />} />
                <Route path="/seat-templates" element={<AdminSeatTemplatesPage />} />

                <Route path="locations" element={<AdminLocationsPage />} />
                <Route path="/locations" element={<AdminLocationsPage />} />

                {/* Nhóm Hệ thống */}
                <Route path="banners" element={<AdminBannersPage />} />
                <Route path="/banners" element={<AdminBannersPage />} />
                <Route path="gateways" element={<AdminPaymentsPage />} />
                <Route path="/gateways" element={<AdminPaymentsPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="/payments" element={<AdminPaymentsPage />} />

                <Route path="review-reports" element={<AdminReviewsPage />} />
                <Route path="/review-reports" element={<AdminReviewsPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
                <Route path="/reviews" element={<AdminReviewsPage />} />

                <Route path="cancellation-policies" element={<AdminCancellationPoliciesPage />} />
                <Route path="/cancellation-policies" element={<AdminCancellationPoliciesPage />} />
                <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                <Route path="/audit-logs" element={<AdminAuditLogsPage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </AdminLayout>
          </AdminAuthGuard>
        }
      />
    </Routes>
  );
};

export default AdminRoutes;
