import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { TripSearchPage } from '../pages/TripSearchPage';
import { SeatSelectionPage } from '../pages/SeatSelectionPage';
import { BookingCheckoutPage } from '../pages/BookingCheckoutPage';
import { PaymentSuccessPage } from '../pages/PaymentSuccessPage';
import { TicketLookupPage } from '../pages/TicketLookupPage';

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
      {/* 1. Trang chủ Người dùng (User Home) & Thống kê Phân hệ Khách hàng */}
      <Route path="/" element={<HomePage />} />

      {/* 2. Chức năng 1 (Thành viên 2): Tìm kiếm Chuyến xe & Bộ lọc Nâng cao (UC-1.4, UC-1.5) */}
      <Route path="/search" element={<TripSearchPage />} />

      {/* 3. Chức năng 2 (Thành viên 3): Sơ đồ Chọn Ghế 2 Tầng & Khóa Giữ Chỗ Real-time (UC-1.6) */}
      <Route path="/trips/:tripId/seats" element={<SeatSelectionPage />} />

      {/* 4. Chức năng 3 (Thành viên 4): Điểm Đón/Trả & Xác Nhận Đặt Vé (UC-1.7, UC-1.8) */}
      <Route path="/checkout" element={<BookingCheckoutPage />} />

      {/* 5. Chức năng 4 (Thành viên 5): Thanh Toán & Xuất Thẻ Vé Điện Tử QR Code (UC-1.8, UC-1.9) */}
      <Route path="/tickets/:code" element={<PaymentSuccessPage />} />
      <Route path="/payment/success" element={<PaymentSuccessPage />} />

      {/* 6. Chức năng 5 (Thành viên 6): Tra Cứu Vé, Lịch Sử Đặt Chỗ & Hủy Vé/Hoàn Tiền (UC-1.11, UC-1.15) */}
      <Route path="/lookup" element={<TicketLookupPage />} />
      <Route path="/my-bookings" element={<TicketLookupPage />} />
    </Routes>
  );
};

export default ClientRoutes;
