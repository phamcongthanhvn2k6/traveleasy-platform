import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PartnerComingSoonPage } from '../pages/company/unsupported/PartnerComingSoonPage';

/**
 * =========================================================================
 * ROUTER PHÂN HỆ ĐỐI TÁC NHÀ XE (TRAVELEASY PARTNER PORTAL)
 * Base Path: /company/*
 * Trạng thái: Tính năng Cổng Đối tác Nhà xe chưa được hỗ trợ / Đang phát triển.
 * Chặn hoàn toàn khách vãng lai và người chưa đăng nhập truy cập vào layout nội bộ.
 * =========================================================================
 */
export const CompanyRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Trang thông báo tính năng đối tác chưa hỗ trợ */}
      <Route path="/" element={<PartnerComingSoonPage />} />
      <Route path="/dashboard" element={<PartnerComingSoonPage />} />
      <Route path="/unsupported" element={<PartnerComingSoonPage />} />
      <Route path="/vehicles" element={<PartnerComingSoonPage />} />
      <Route path="/routes" element={<PartnerComingSoonPage />} />
      <Route path="/locations" element={<PartnerComingSoonPage />} />
      <Route path="/cancellation-policies" element={<PartnerComingSoonPage />} />
      <Route path="/trips" element={<PartnerComingSoonPage />} />
      <Route path="/bookings" element={<PartnerComingSoonPage />} />
      <Route path="/reviews" element={<PartnerComingSoonPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/company" replace />} />
    </Routes>
  );
};

export default CompanyRoutes;
