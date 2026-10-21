import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/customer/home/HomePage';
import { TripSearchPage } from '../pages/customer/search/TripSearchPage';
import { CheckoutPage } from '../pages/customer/checkout/CheckoutPage';
import { TicketLookupPage } from '../pages/customer/ticket-lookup/TicketLookupPage';
import { CustomerAuthPage } from '../pages/customer/auth/CustomerAuthPage';
import { MyTicketsPage } from '../pages/customer/my-tickets/MyTicketsPage';
import { UserProfilePage } from '../pages/customer/profile/UserProfilePage';

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
      {/* Chức năng 1: Trang chủ & Tìm kiếm chuyến xe */}
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<TripSearchPage />} />

      {/* Chức năng 3: Điền thông tin hành khách & Thanh toán */}
      <Route path="/checkout" element={<CheckoutPage />} />

      {/* Xác thực người dùng (Đăng ký / Đăng nhập JWT) */}
      <Route path="/auth" element={<CustomerAuthPage />} />
      <Route path="/login" element={<CustomerAuthPage />} />
      <Route path="/register" element={<CustomerAuthPage />} />

      {/* Chức năng 5: Tra cứu vé điện tử & Lịch sử đặt chỗ */}
      <Route path="/lookup" element={<TicketLookupPage />} />
      <Route path="/tickets/:code" element={<TicketLookupPage />} />
      <Route path="/my-tickets" element={<MyTicketsPage />} />

      {/* Chức năng 8: Hồ sơ cá nhân & Sổ tay hành khách thân quen */}
      <Route path="/profile" element={<UserProfilePage />} />

      {/* Các route mở rộng của phân hệ Users:
          - /trips/:tripId/seats: Chọn sơ đồ ghế 2 tầng (Thành viên 3)
          - /checkout: Xác nhận điểm đón/trả & nhập thông tin (Thành viên 4)
          - /payment/callback: Trả về trạng thái thanh toán & QR Code (Thành viên 5)
      */}
    </Routes>
  );
};

export default ClientRoutes;
