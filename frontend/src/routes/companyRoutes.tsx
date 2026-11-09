import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CompanyLayout } from '../components/CompanyLayout';
import { CompanyAuthGuard } from '../components/CompanyAuthGuard';
import { CompanyLoginPage } from '../pages/company/auth/CompanyLoginPage';
import { CompanyDashboardPage } from '../pages/company/dashboard/CompanyDashboardPage';
import { CompanyVehiclesPage } from '../pages/company/vehicles/CompanyVehiclesPage';
import { CompanyRoutesPage } from '../pages/company/routes/CompanyRoutesPage';
import { CompanyLocationsPage } from '../pages/company/locations/CompanyLocationsPage';
import { CompanyCancellationPoliciesPage } from '../pages/company/cancellation-policies/CompanyCancellationPoliciesPage';
import { CompanyTripsPage } from '../pages/company/trips/CompanyTripsPage';
import { CompanyBookingsPage } from '../pages/company/bookings/CompanyBookingsPage';
import { CompanyReviewsPage } from '../pages/company/reviews/CompanyReviewsPage';
import { CompanySettlementsPage } from '../pages/company/settlements/CompanySettlementsPage';
import { PartnerComingSoonPage } from '../pages/company/unsupported/PartnerComingSoonPage';

// Sprint 4 Modules & Member Tasks
import PosTerminalPage from '../pages/company/pos/PosTerminalPage';
import { CompanyShiftsPage } from '../pages/company/shifts/CompanyShiftsPage';
import { CompanyPricingRulesPage } from '../pages/company/pricing-rules/CompanyPricingRulesPage';
import { CompanyReportsPage } from '../pages/company/reports/CompanyReportsPage';

/**
 * =========================================================================
 * ROUTER PHÂN HỆ ĐỐI TÁC NHÀ XE (TRAVELEASY PARTNER PORTAL)
 * Base Path: /company/*
 * Được bảo vệ nghiêm ngặt bằng CompanyAuthGuard:
 * - /company/login: Cổng đăng nhập đối tác nhà xe công khai
 * - /company/*: Yêu cầu JWT Token hợp lệ & Vai trò phải là ROLE_OPERATOR (nghiêm ngặt độc lập với ROLE_ADMIN)
 * =========================================================================
 */
export const CompanyRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Cổng đăng nhập Đối tác Nhà Xe (Công khai) */}
      <Route path="login" element={<CompanyLoginPage />} />
      <Route path="/login" element={<CompanyLoginPage />} />

      {/* 2. Trang thông tin hỗ trợ đối tác nhà xe chưa đăng nhập */}
      <Route path="unsupported" element={<PartnerComingSoonPage />} />

      {/* 3. Toàn bộ các trang nghiệp vụ Nhà xe được bảo vệ bởi CompanyAuthGuard */}
      <Route
        path="*"
        element={
          <CompanyAuthGuard>
            <CompanyLayout>
              <Routes>
                {/* Tổng quan nhà xe */}
                <Route path="" element={<CompanyDashboardPage />} />
                <Route path="/" element={<CompanyDashboardPage />} />
                <Route path="dashboard" element={<CompanyDashboardPage />} />
                <Route path="/dashboard" element={<CompanyDashboardPage />} />

                {/* Vận hành & Đội xe */}
                <Route path="vehicles" element={<CompanyVehiclesPage />} />
                <Route path="/vehicles" element={<CompanyVehiclesPage />} />
                <Route path="locations" element={<CompanyLocationsPage />} />
                <Route path="/locations" element={<CompanyLocationsPage />} />
                <Route path="routes" element={<CompanyRoutesPage />} />
                <Route path="/routes" element={<CompanyRoutesPage />} />
                <Route path="cancellation-policies" element={<CompanyCancellationPoliciesPage />} />
                <Route path="/cancellation-policies" element={<CompanyCancellationPoliciesPage />} />

                {/* Kinh doanh & Khách hàng */}
                <Route path="trips" element={<CompanyTripsPage />} />
                <Route path="/trips" element={<CompanyTripsPage />} />
                <Route path="bookings" element={<CompanyBookingsPage />} />
                <Route path="/bookings" element={<CompanyBookingsPage />} />
                <Route path="reviews" element={<CompanyReviewsPage />} />
                <Route path="/reviews" element={<CompanyReviewsPage />} />
                <Route path="settlements" element={<CompanySettlementsPage />} />
                <Route path="/settlements" element={<CompanySettlementsPage />} />

                {/* ======================================================== */}
                {/* SPRINT 3 MODULES (NHIỆM VỤ THÀNH VIÊN SPRINT 3)         */}
                {/* ======================================================== */}
                {/* [S304] Quầy bán vé nhanh POS - Phạm Thanh Phong */}
                <Route path="pos" element={<PosTerminalPage />} />
                <Route path="/pos" element={<PosTerminalPage />} />

                {/* [S305] Quản lý ca trực & bàn giao tiền mặt - Đoàn Nhật Cường */}
                <Route path="shifts" element={<CompanyShiftsPage />} />
                <Route path="/shifts" element={<CompanyShiftsPage />} />

                {/* [S307] Quản trị chính sách giá vé động - Trần Minh Đức */}
                <Route path="pricing-rules" element={<CompanyPricingRulesPage />} />
                <Route path="/pricing-rules" element={<CompanyPricingRulesPage />} />

                {/* [S310] Báo cáo doanh thu & tỷ lệ lấp đầy ghế - Nguyễn Đại Phát */}
                <Route path="reports" element={<CompanyReportsPage />} />
                <Route path="/reports" element={<CompanyReportsPage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/company/dashboard" replace />} />
              </Routes>
            </CompanyLayout>
          </CompanyAuthGuard>
        }
      />
    </Routes>
  );
};

export default CompanyRoutes;
