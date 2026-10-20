import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CompanyLayout } from '../components/CompanyLayout';
import { CompanyDashboardPage } from '../pages/company/dashboard/CompanyDashboardPage';
import { CompanyVehiclesPage } from '../pages/company/vehicles/CompanyVehiclesPage';
import { CompanyLocationsPage } from '../pages/company/locations/CompanyLocationsPage';
import { CompanyRoutesPage } from '../pages/company/routes/CompanyRoutesPage';
import { CompanyCancellationPoliciesPage } from '../pages/company/cancellation-policies/CompanyCancellationPoliciesPage';
import { CompanyTripsPage } from '../pages/company/trips/CompanyTripsPage';
import { CompanyBookingsPage } from '../pages/company/bookings/CompanyBookingsPage';
import { CompanyReviewsPage } from '../pages/company/reviews/CompanyReviewsPage';

/**
 * =========================================================================
 * ROUTER PHÂN HỆ ĐỐI TÁC NHÀ XE (TRAVELEASY PARTNER PORTAL)
 * Phụ trách: Phạm Công Thành (Nhóm trưởng / Architect)
 * Base Path: /company/*
 * Giao diện tối giản, chuẩn xác 100% theo bộ prototype ảnh chụp thực tế
 * =========================================================================
 */
export const CompanyRoutes: React.FC = () => {
  return (
    <CompanyLayout>
      <Routes>
        {/* Trang tổng quan nhà xe */}
        <Route path="/" element={<CompanyDashboardPage />} />
        <Route path="/dashboard" element={<CompanyDashboardPage />} />

        {/* Nhóm Vận hành */}
        <Route path="/vehicles" element={<CompanyVehiclesPage />} />
        <Route path="/fleet/vehicles" element={<CompanyVehiclesPage />} />
        <Route path="/locations" element={<CompanyLocationsPage />} />
        <Route path="/routes" element={<CompanyRoutesPage />} />
        <Route path="/cancellation-policies" element={<CompanyCancellationPoliciesPage />} />

        {/* Nhóm Kinh doanh */}
        <Route path="/trips" element={<CompanyTripsPage />} />
        <Route path="/bookings" element={<CompanyBookingsPage />} />
        <Route path="/reviews" element={<CompanyReviewsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/company/dashboard" replace />} />
      </Routes>
    </CompanyLayout>
  );
};

export default CompanyRoutes;
