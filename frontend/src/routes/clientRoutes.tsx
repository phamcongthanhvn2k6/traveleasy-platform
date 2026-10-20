import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/customer/home/HomePage';
import { TicketLookupPage } from '../pages/customer/ticket-lookup/TicketLookupPage';

/**
 * =========================================================================
 * ROUTER PHÂN HỆ KHÁCH HÀNG / NGƯỜI DÙNG (USERS / CLIENT PORTAL)
 * Phụ trách: 5 Thành viên trong nhóm (chia theo tính năng End-to-End)
 * Base Path: /*
 * =========================================================================
 */
export const ClientRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Chức năng 1 (Thành viên 2): Trang chủ & Tìm kiếm chuyến xe */}
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<HomePage />} />

      {/* Chức năng 5 (Thành viên 6): Tra cứu vé điện tử & Lịch sử đặt chỗ */}
      <Route path="/lookup" element={<TicketLookupPage />} />
      <Route path="/tickets/:code" element={<TicketLookupPage />} />

      {/* Các route mở rộng của phân hệ Users do 5 thành viên phát triển:
          - /trips/:tripId/seats: Chọn sơ đồ ghế 2 tầng (Thành viên 3)
          - /checkout: Xác nhận điểm đón/trả & nhập thông tin (Thành viên 4)
          - /payment/callback: Trả về trạng thái thanh toán & QR Code (Thành viên 5)
      */}
    </Routes>
  );
};

export default ClientRoutes;

