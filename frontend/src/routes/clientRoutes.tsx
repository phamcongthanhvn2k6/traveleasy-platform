import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/customer/home/HomePage';
import { TripSearchPage } from '../pages/customer/search/TripSearchPage';
import { CheckoutPage } from '../pages/customer/checkout/CheckoutPage';
import { TicketLookupPage } from '../pages/customer/ticket-lookup/TicketLookupPage';
import { CustomerAuthPage } from '../pages/customer/auth/CustomerAuthPage';
import { MyTicketsPage } from '../pages/customer/my-tickets/MyTicketsPage';
import { UserProfilePage } from '../pages/customer/profile/UserProfilePage';
import { PolicyPage } from '../pages/customer/policy/PolicyPage';
import { NotFoundPage } from '../pages/common/NotFoundPage';

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

      {/* Chính sách, Quy chế hoạt động & Câu hỏi thường gặp */}
      <Route path="/policy" element={<PolicyPage />} />
      <Route path="/guide" element={<PolicyPage />} />

      {/* =========================================================================
          CÁC TÍNH NĂNG CHỨC NĂNG TRONG LỘ TRÌNH PHÁT TRIỂN (ROADMAP COMING SOON)
         ========================================================================= */}
      <Route path="/schedule" element={<NotFoundPage feature="Lịch Trình & Bảng Giờ Chạy Xe" />} />
      <Route path="/routes" element={<NotFoundPage feature="Mạng Lưới Tuyến Đường Toàn Quốc" />} />
      <Route path="/promotions" element={<NotFoundPage feature="Chương Trình Khuyến Mãi & Voucher Giảm Giá" />} />
      <Route path="/reviews" element={<NotFoundPage feature="Đánh Giá & Xếp Hạng Chất Lượng Nhà Xe" />} />

      {/* Dịch vụ mở rộng khác */}
      <Route path="/flights" element={<NotFoundPage feature="Vé Máy Bay Trực Tuyến" />} />
      <Route path="/trains" element={<NotFoundPage feature="Vé Tàu Hỏa Đường Sắt Bắc Nam" />} />
      <Route path="/car-rental" element={<NotFoundPage feature="Thuê Xe Tự Lái & Du Lịch" />} />
      <Route path="/hotel" element={<NotFoundPage feature="Khách Sạn & Homestay Điểm Đến" />} />

      {/* =========================================================================
          CATCH-ALL 404: ĐIỀU HƯỚNG TẤT CẢ CÁC ĐƯỜNG LINK SAI / KHÔNG TỒN TẠI
         ========================================================================= */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default ClientRoutes;
