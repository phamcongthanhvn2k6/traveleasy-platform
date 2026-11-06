# BÁO CÁO TỔNG KẾT SPRINT 2 & KẾ HOẠCH SPRINT 3
> **Đơn vị:** Nhóm 7 — Dự Án TravelEasy (5 Thành viên)  
> **Nghiệm thu Sprint 2:** 62/70 Story Points (88.6%)  
> **Kế hoạch Sprint 3:** 74 Story Points (Đối soát tài chính & Vận hành toàn diện)  

---

## 1. TỔNG KẾT ĐÁNH GIÁ SPRINT 2
* **Story Points hoàn thành:** 62 / 70 Story Points (88.6% kế hoạch). Toàn bộ luồng nghiệp vụ kinh doanh cốt lõi (Core Booking Flow) và 2 Cổng quản trị (`/company` và `/admin`) đã vận hành trơn tru.
* **Chuẩn Xóa Mềm 100%:** Toàn bộ các trang Admin đã chuyển đổi từ Xóa cứng sang Xóa mềm.
* **Thanh toán:** Tích hợp thành công VietQR PayOS, VNPAY Sandbox và COD; dọn dẹp các cổng lỗi thời.
* **Task chuyển tiếp (Rollover):** 2 Tasks (8 SP) chuyển tiếp sang Sprint 3 (KYB form và Google OAuth2).

---

## 2. KẾ HOẠCH SPRINT 3 — ĐỐI SOÁT TÀI CHÍNH & VẬN HÀNH TOÀN DIỆN
* **Thời gian thực hiện:** 2 tuần (Tuần 5 - Tuần 6)
* **Quy mô cam kết:** 74 Story Points (8 SP rollover + 66 SP tính năng mới)
* **5 Trọng tâm lớn của Sprint 3:**
  1. **Module Đối soát Tài chính (`/admin/settlements`):** Chu kỳ 15 ngày, tự động trích hoa hồng sàn, tài khoản ký quỹ Escrow và lệnh giải ngân ví nhà xe.
  2. **Kiểm duyệt Báo cáo Vi phạm (`/admin/review-reports`):** Tiếp nhận khiếu nại của khách, kiểm duyệt đánh giá tiêu cực và xử lý tranh chấp vé.
  3. **Phân quyền Duyệt Admin (`/admin/users`):** Hệ thống phê duyệt 2 tầng bảo vệ hệ thống trước hành vi tạo admin trái phép.
  4. **Cổng Đăng Ký Đối Tác (KYB Registration):** Cổng đăng ký dành riêng cho nhà xe mới gia nhập sàn với form xác thực giấy phép kinh doanh.
  5. **Tích hợp Google OAuth2:** Đăng nhập nhanh một chạm bằng tài khoản Google cá nhân.
