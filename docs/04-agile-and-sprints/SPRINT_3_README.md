# 📙 SPRINT 3 README — KIỂM THỬ TÍCH HỢP, SOÁT VÉ QR & TỐI ƯU VẬN HÀNH
> **Dự án:** Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy  
> **Đơn vị:** OJT Đồ Án Nhóm 7  
> **Thời gian thực hiện:** Tuần 3 (Sprint 3 — Tuần Kiểm thử Tích hợp, Firebase Auth & Thanh toán)  
> **Trạng thái:** 🚀 **NGHIỆM THU (30/36 Thẻ hoàn thành — Đạt 87.5% khối lượng)**  
> **Quy mô danh mục:** 36 Thẻ | 48 Story Points (Đã hoàn thành 30 thẻ | 42 SP trong 'Done Sprint 3' trên Trello)  

---

## 🎯 1. MỤC TIÊU SPRINT (SPRINT GOAL)
Kiểm thử tích hợp toàn diện (E2E Integration Testing) xuyên suốt 3 cổng người dùng (Khách hàng ⇄ Nhà xe ⇄ Quản trị sàn), xây dựng tính năng quét mã QR soát vé di động bằng camera (`/scanner`) với tốc độ < 0.2s, triển khai tra cứu vé ngoại tuyến (Offline Storage), tối ưu độ trễ hệ thống, tích hợp xác thực Firebase Google Sign-In & OTP Phone và gia cố độ tin cậy để đưa nền tảng vào trạng thái sẵn sàng sản xuất (Production-Ready).

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

### 3.0. Hạng mục Ưu tiên 1 (Tiếp thu ý kiến Thầy) & Tồn đọng chuyển tiếp từ Sprint 2
- **[Ưu tiên: 1] [5 SP] [S322] Tái cấu trúc Đăng ký Đối tác Nhà xe KYB & Thẩm định Cổng Admin (Phạm Công Thành):**
  - Form thẩm định doanh nghiệp 3 khối (Pháp nhân MST 10-13 số, Hồ sơ số hóa PDF/CCCD 2 mặt <= 10MB, Tài khoản ngân hàng Escrow đối soát).
  - Modal xem trước tài liệu PDF/CCCD trực quan tại /admin/bus-companies và cơ chế tự động cấp tài khoản /company/login khi duyệt.
  - Chi tiết đặc tả & quy chế: [HIEP_DINH_QUY_CHE_HOAT_DONG_VA_HOP_DONG_HOP_TAC.md](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/docs/01-requirements/HIEP_DINH_QUY_CHE_HOAT_DONG_VA_HOP_DONG_HOP_TAC.md).
- **[Ưu tiên: 1] [5 SP] [S321] Tích hợp Đăng nhập Google & Xác thực OTP (Nguyễn Đại Phát — Đã phân tách 4 thẻ chuẩn Scrum):**
  - `[FE][S321A]` (1 SP): Thiết kế nút Đăng nhập Google chuẩn & Xử lý Callback lấy ID Token.
  - `[BE][S321B]` (2 SP): API Xác thực Google ID Token, Tự động liên kết User & Cấp JWT.
  - `[FE][S321C]` (1 SP): Giao diện Modal nhập mã OTP 6 ô tự động nhảy focus & Bộ đếm 60s.
  - `[BE][S321D]` (1 SP): Dịch vụ Sinh mã OTP, Quản trị thời gian sống TTL & Xác thực số điện thoại.
  - Minh chứng: Đã hoàn thành 100% trong PR #45.
- **[Ưu tiên: 2] [8 SP] Xử lý dứt điểm 2 task tồn đọng Sprint 2 (Trần Minh Đức):**
  - [BE-S320] (3 SP): Bộ Fixtures dữ liệu mẫu và scripts dọn CSDL kiểm thử tự động.
  - [FE-S320] (5 SP): Kiểm thử nghiệm thu giao diện Acceptance Testing /test/fixtures.

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
- 🔄 **Hiện trạng nghiệm thu Sprint 3: 30/36 Thẻ hoàn thành (42/48 SP — Đạt 87.5% khối lượng trong cột 'Done Sprint 3').**
- 🚀 Đã nghiệm thu và merge 7 Pull Requests trọng yếu (#35, #36, #41, #42, #43, #45, #47) không có merge conflict nào.

