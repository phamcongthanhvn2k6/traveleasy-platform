# 📙 SPRINT 3 README — KIỂM THỬ TÍCH HỢP, SOÁT VÉ QR & TỐI ƯU VẬN HÀNH
> **Dự án:** Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy  
> **Đơn vị:** OJT Đồ Án Nhóm 7  
> **Thời gian thực hiện:** Tuần 5 - Tuần 6 (Giai đoạn hiện tại)  
> **Trạng thái:** 🔵 **IN PROGRESS (Đang thực hiện)**  
> **Quy mô:** 54 Thẻ | 216 Story Points (SP)  

---

## 🎯 1. MỤC TIÊU SPRINT (SPRINT GOAL)
Kiểm thử tích hợp toàn diện (E2E Integration Testing) xuyên suốt 3 cổng người dùng (Khách hàng ⇄ Nhà xe ⇄ Quản trị sàn), xây dựng tính năng quét mã QR soát vé di động bằng camera (`/scanner`) với tốc độ < 0.2s, triển khai tra cứu vé ngoại tuyến (Offline Storage), tối ưu độ trễ hệ thống và gia cố độ tin cậy để đưa nền tảng vào trạng thái sẵn sàng sản xuất (Production-Ready).

---

## 👥 2. PHÂN CÔNG THÀNH VIÊN (RACI)

| Thành viên | Vai trò | Trọng tâm công việc Sprint 3 |
|:---|:---|:---|
| **Phạm Công Thành** | Team Leader & System Architect | Kiểm tra kiến trúc tổng thể, tích hợp bộ lọc truy vết phân tán `CorrelationIdFilter`, chuẩn bị tài liệu kỹ thuật vận hành và hỗ trợ giải quyết các lỗi tích hợp phức tạp (0 task mới). |
| **Nguyễn Đại Phát** | Admin Lead & Full-Stack | Kiểm thử nghiệm thu và tích hợp API Cổng Quản trị Admin: Đối soát hoa hồng, nhật ký kiểm toán bất biến (Immutable Audit Logs), kiểm tra quyền hạn các vai trò và chuẩn hóa mã phản hồi lỗi API. |
| **Phạm Thanh Phong** | Core Booking & Seat Engine | Kiểm thử tải (Load Testing) thuật toán khóa ghế, kiểm thử các trường hợp biên của cổng thanh toán VietQR/VNPAY (chống thanh toán lặp, khôi phục khi mất mạng), tối ưu chỉ mục truy vấn tìm chuyến. |
| **Đoàn Nhật Cường** | Mobile Specialist | Xây dựng và kiểm thử module Soát vé di động bằng QR Code qua webcam/camera điện thoại (`/scanner`), kiểm thử lưu trữ vé ngoại tuyến qua LocalStorage (`/lookup`), tối ưu giao diện Responsive Mobile. |
| **Trần Minh Đức** | Customer Portal | Kiểm thử nghiệm thu luồng Đăng nhập, Hồ sơ cá nhân, Lịch sử vé và quy trình Hủy vé / Hoàn tiền tự động (`/my-tickets`), kiểm tra tính hợp lệ của mã giảm giá khi thanh toán. |
| **Phan Trung Kiên** | Thành viên | Miễn thực tập OJT (Exempted) theo quyết định đào tạo. |

---

## 📋 3. PHẠM VI & HẠNG MỤC CÔNG VIỆC CHÍNH (SPRINT BACKLOG)

### 3.1. Kiểm thử Tích hợp Liên Cổng (E2E Integration Testing)
- Kiểm thử luồng thông suốt từ đầu đến cuối:
  1. Admin duyệt nhà xe mới và kích hoạt tuyến đường.
  2. Nhà xe tạo chuyến xe, gán biển số xe và mở bán vé.
  3. Khách hàng tìm chuyến, chọn ghế, hoàn tất thanh toán.
  4. Hệ thống ghi nhận doanh thu vào ví nhà xe và khấu trừ phí hoa hồng 10% về sàn.
- Kiểm thử các tình huống ngoại lệ (Edge Cases): Khách hủy thanh toán giữa chừng, hết hạn giữ ghế khi đang nhập thông tin, thanh toán trễ.

### 3.2. Soát vé Di động Bằng Mã QR Siêu Tốc (`/scanner`)
- Tích hợp thư viện quét mã vạch/QR qua camera HTML5/WebRTC trên thiết bị di động.
- Xác thực mã vé bảo mật (Signature Hash) chống làm giả vé.
- Tốc độ nhận diện và cập nhật trạng thái vé sang `USED` (Đã lên xe) trong vòng dưới **0.2 giây**.
- Cảnh báo âm thanh và màu sắc trực quan: Xanh (Vé hợp lệ), Đỏ (Vé đã sử dụng / Vé sai chuyến / Vé bị hủy).

### 3.3. Tra cứu Vé Ngoại Tuyến (Offline Ticket Lookup)
- Lưu cache thông tin vé và mã QR vào `localStorage` / `IndexedDB` ngay khi đặt vé thành công.
- Cho phép hành khách mở trang Tra cứu vé (`/lookup`) xuất trình vé ngay cả khi bến xe bị mất sóng điện thoại hoặc không có Internet.

### 3.4. Giám sát & Bền bỉ Hệ thống (Observability & Resilience)
- Gắn mã định danh truy vết `X-Correlation-Id` vào từng yêu cầu HTTP để theo dõi log xuyên suốt Client ➔ Backend ➔ CSDL.
- Xây dựng endpoint kiểm tra sức khỏe hệ thống: `/health`, `/health/liveness`, `/health/readiness`.
- Chuẩn bị bộ test fixtures tự động nạp và dọn dẹp dữ liệu kiểm thử.

---

## 📦 4. SẢN PHẨM BÀN GIAO (DELIVERABLES)
1. Ứng dụng quét mã QR soát vé di động vận hành thực tế tại `/scanner`.
2. Tính năng tra cứu vé ngoại tuyến hoạt động khi ngắt kết nối mạng.
3. Bộ tài liệu kiểm thử nghiệm thu tính năng `BIEN_BAN_NGHIEM_THU_KIEM_THU_TINH_NANG_NHOM_7.md`.
4. Endpoint giám sát sức khỏe hệ thống `/health` và log truy vết chuẩn `X-Correlation-Id`.

---

## 🏆 5. KẾT QUẢ NGHIỆM THU & TIÊU CHÍ HOÀN THÀNH (DoD)
- 🔄 Toàn bộ 54 user stories được rà soát và kiểm thử nghiệm thu theo ma trận chất lượng.
- 🔄 Quét mã QR kiểm thử thành công trên cả trình duyệt máy tính và camera điện thoại thật.
- 🔄 Không còn lỗi nghiêm trọng (Critical/Blocker Bug) ảnh hưởng đến luồng thanh toán và xuất vé.
- 🔄 **Mục tiêu hoàn thành: 54/54 Thẻ (216 SP) khi kết thúc Sprint 3.**
