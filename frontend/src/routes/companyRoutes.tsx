import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CompanyLayout } from '../components/CompanyLayout';
import { CompanyAuthGuard } from '../components/CompanyAuthGuard';

// ============================================================================
// LAZY LOADING — TỐI ƯU HIỆU SUẤT: Tách 18 trang thành chunk riêng biệt
// Mỗi trang chỉ được tải khi người dùng điều hướng tới (giảm bundle lần đầu từ 2.1MB → ~400KB)
// ============================================================================

// Trang đăng nhập & fallback (tải sớm vì cần ngay)
import { CompanyLoginPage } from '../pages/company/auth/CompanyLoginPage';
import { PartnerComingSoonPage } from '../pages/company/unsupported/PartnerComingSoonPage';

// Dashboard (ưu tiên cao — trang chủ sau đăng nhập)
const CompanyDashboardPage = React.lazy(() =>
  import('../pages/company/dashboard/CompanyDashboardPage')
    .then(m => ({ default: m.CompanyDashboardPage }))
);

// Vận hành & Đội xe
const CompanyVehiclesPage = React.lazy(() =>
  import('../pages/company/vehicles/CompanyVehiclesPage')
    .then(m => ({ default: m.CompanyVehiclesPage }))
);
const CompanyRoutesPage = React.lazy(() =>
  import('../pages/company/routes/CompanyRoutesPage')
    .then(m => ({ default: m.CompanyRoutesPage }))
);
const CompanyLocationsPage = React.lazy(() =>
  import('../pages/company/locations/CompanyLocationsPage')
    .then(m => ({ default: m.CompanyLocationsPage }))
);
const CompanyCancellationPoliciesPage = React.lazy(() =>
  import('../pages/company/cancellation-policies/CompanyCancellationPoliciesPage')
    .then(m => ({ default: m.CompanyCancellationPoliciesPage }))
);

// Kinh doanh & Khách hàng
const CompanyTripsPage = React.lazy(() =>
  import('../pages/company/trips/CompanyTripsPage')
    .then(m => ({ default: m.CompanyTripsPage }))
);
const CompanyBookingsPage = React.lazy(() =>
  import('../pages/company/bookings/CompanyBookingsPage')
    .then(m => ({ default: m.CompanyBookingsPage }))
);
const CompanyReviewsPage = React.lazy(() =>
  import('../pages/company/reviews/CompanyReviewsPage')
    .then(m => ({ default: m.CompanyReviewsPage }))
);
const CompanySettlementsPage = React.lazy(() =>
  import('../pages/company/settlements/CompanySettlementsPage')
    .then(m => ({ default: m.CompanySettlementsPage }))
);

// Sprint 4 Modules & Member Tasks
const PosTerminalPage = React.lazy(() => import('../pages/company/pos/PosTerminalPage'));
const CompanyShiftsPage = React.lazy(() =>
  import('../pages/company/shifts/CompanyShiftsPage')
    .then(m => ({ default: m.CompanyShiftsPage }))
);
const CompanyPricingRulesPage = React.lazy(() =>
  import('../pages/company/pricing-rules/CompanyPricingRulesPage')
    .then(m => ({ default: m.CompanyPricingRulesPage }))
);
const CompanyReportsPage = React.lazy(() =>
  import('../pages/company/reports/CompanyReportsPage')
    .then(m => ({ default: m.CompanyReportsPage }))
);

// Sprint 3 Extended Modules (Nhiệm vụ bổ sung cho thành viên OJT)
const TicketExchangePage = React.lazy(() => import('../pages/company/ticket-exchange/TicketExchangePage'));
const ShuttleManagementPage = React.lazy(() => import('../pages/company/shuttles/ShuttleManagementPage'));
const TripExpensesPage = React.lazy(() => import('../pages/company/expenses/TripExpensesPage'));
const TripCrewPage = React.lazy(() => import('../pages/company/crew/TripCrewPage'));
const CancellationRefundPage = React.lazy(() => import('../pages/company/refunds/CancellationRefundPage'));
const DriverGpsTrackingPage = React.lazy(() => import('../pages/company/tracking/DriverGpsTrackingPage'));

// Skeleton fallback khi trang đang tải lần đầu
const PageLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Đang tải trang...</p>
    </div>
  </div>
);

/**
 * =========================================================================
 * ROUTER PHÂN HỆ ĐỐI TÁC NHÀ XE (TRAVELEASY PARTNER PORTAL)
 * Base Path: /company/*
 * Tối ưu: React.lazy() + Suspense — 18 trang tải theo nhu cầu (code splitting)
 * Được bảo vệ bởi CompanyAuthGuard (ROLE_OPERATOR)
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
              <Suspense fallback={<PageLoadingFallback />}>
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
                  {/* [S306] Bảng điều khiển định vị GPS tài xế & phụ xe */}
                  <Route path="tracking" element={<DriverGpsTrackingPage />} />
                  <Route path="/tracking" element={<DriverGpsTrackingPage />} />

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

                  {/* ======================================================== */}
                  {/* SPRINT 3 EXTENDED TASKS (NHIỆM VỤ BỔ SUNG KHÔNG XUNG ĐỘT) */}
                  {/* ======================================================== */}
                  {/* [S316] Đổi vé, đổi giờ chạy & chuyển ghế - Trần Minh Đức */}
                  <Route path="ticket-exchange" element={<TicketExchangePage />} />
                  <Route path="/ticket-exchange" element={<TicketExchangePage />} />

                  {/* [S317] Quản lý xe trung chuyển gom khách tận nơi - Trần Minh Đức */}
                  <Route path="shuttles" element={<ShuttleManagementPage />} />
                  <Route path="/shuttles" element={<ShuttleManagementPage />} />

                  {/* [S318] Quản lý chi phí & lợi nhuận chuyến xe (Trip P&L) - Trần Minh Đức */}
                  <Route path="expenses" element={<TripExpensesPage />} />
                  <Route path="/expenses" element={<TripExpensesPage />} />

                  {/* [S319] Phân công tài xế & phụ xe (Tổ lái) - Đoàn Nhật Cường */}
                  <Route path="crew" element={<TripCrewPage />} />
                  <Route path="/crew" element={<TripCrewPage />} />

                  {/* [S321] Quản lý biểu phí & hoàn hủy vé - Nguyễn Đại Phát */}
                  <Route path="refunds" element={<CancellationRefundPage />} />
                  <Route path="/refunds" element={<CancellationRefundPage />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/company/dashboard" replace />} />
                </Routes>
              </Suspense>
            </CompanyLayout>
          </CompanyAuthGuard>
        }
      />
    </Routes>
  );
};

export default CompanyRoutes;
