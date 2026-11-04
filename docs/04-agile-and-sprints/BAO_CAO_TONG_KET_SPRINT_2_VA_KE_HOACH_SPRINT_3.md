# 📋 BIÊN BẢN BÁO CÁO TỔNG KẾT SPRINT 2 & KẾ HOẠCH NƯỚC RÚT SPRINT 3
## DỰ ÁN: TRAVELEASY PLATFORM — NỀN TẢNG ĐẶT VÉ XE KHÁCH & QUẢN LÝ NHÀ XE
### ĐƠN VỊ: OJT ĐỒ ÁN NHÓM 7 | MÃ DỰ ÁN: `PRJ-TRAVELEASY-MVP-01`
### THỜI GIAN THỰC HIỆN: TUẦN 3 - TUẦN 4 | HỘI ĐỒNG REVIEW: GIẢNG VIÊN HƯỚNG DẪN OJT

---

> **MỤC TIÊU TÀI LIỆU:**  
> • Ghi nhận chính thức kết quả nghiệm thu **Sprint 2** (Động cơ đặt vé, Sơ đồ ghế 2 tầng, Thanh toán đa kênh & Hai cổng quản trị).  
> • Đồng bộ hóa số liệu Story Points và User Stories theo tiêu chuẩn **Agile/Scrum** (Đạt tỷ lệ **88.6%**, hoàn thành **62/70 SP**, **16/18 tasks**).  
> • Tiếp thu và thể chế hóa toàn bộ ý kiến đóng góp từ buổi kiểm tra của Giảng viên vào **Kế hoạch Sprint 3**.  
> • Cung cấp nội dung chuẩn hóa phục vụ báo cáo trực tiếp trên kênh trao đổi của lớp (Teams/Slack Thread).

---

## 📌 PHẦN 1: NỘI DUNG BÁO CÁO THREAD (COPY PASTE GỬI GIẢNG VIÊN)

Dưới đây là mẫu báo cáo ngắn gọn, chuẩn hóa theo định dạng quy định của lớp để Nhóm trưởng đăng vào thread của Thầy:

```markdown
Nhóm 7: TravelEasy - Nền Tảng Đặt Vé Xe Khách & Quản Trị Vận Tải Trực Tuyến
- Sprint goal: Hoàn thiện cổng quản trị Đối tác Nhà xe & Quản trị Hệ thống (Admin), tích hợp thanh toán trực tuyến đa kênh (VietQR PayOS, VNPAY), xuất vé điện tử PDF kèm QR Code bảo mật và quản lý sơ đồ ghế thời gian thực (ĐẠT).
- Điểm danh: 5/5 thành viên tham gia báo cáo đầy đủ, không có bạn nào vắng nghỉ.
- Kết quả hoàn thành: 62/70 SP (16/18 tasks - Đạt 88.6%):
  - Phạm Công Thành (18 SP - 5/5 tasks): Kiến trúc Core, sơ đồ ghế thời gian thực, cổng thanh toán VietQR PayOS & VNPAY.
  - Nguyễn Đại Phát (14 SP - 4/4 tasks): Cổng Quản trị Admin, phân quyền RBAC, quản lý danh mục tuyến & trạm dừng.
  - Trần Thanh Phong (12 SP - 3/3 tasks): Module quản lý nhà xe (Company Portal), cấu hình xe, tài xế và lịch trình.
  - Huỳnh Nhật Cường (10 SP - 3/3 tasks): Giao diện tìm kiếm chuyến xe, bộ lọc động, tối ưu Responsive đa thiết bị.
  - Trần Minh Đức (8/16 SP - 2/4 tasks, delay 8 SP): Thực thi kiểm thử tự động, dữ liệu mẫu Fixture & dọn dẹp DB.
- Tồn đọng (Chuyển tiếp Sprint 3): 8 SP (2 tasks)
  - [BE-S320] Kiểm thử tự động API & Test Fixtures dọn dẹp DB (3 SP): Cần bổ sung test case môi trường cô lập trước khi chạy E2E.
  - [FE-S320] Kiểm thử giao diện & Acceptance Test Fixtures (5 SP): Chờ đồng bộ bộ dữ liệu mẫu chuẩn hóa toàn hệ thống.
- Cải thiện (Tiếp thu nghiêm túc nhận xét của các Thầy từ buổi kiểm tra hôm qua):
  - Hệ thống Đăng ký đối tác Nhà xe (/partner/register) còn sơ sài, thiếu kiểm soát pháp lý: Nhóm trưởng (Công Thành) trực tiếp tiếp nhận tái cấu trúc luồng thẩm định doanh nghiệp (KYB đa bước), bổ sung tải hồ sơ pháp lý số hóa (PDF Giấy phép vận tải Sở GTVT, CCCD 2 mặt) và màn hình đối soát Escrow tại Admin.
  - Phân hệ xác thực cần tiện dụng và an toàn hơn: Giao cho Đại Phát bổ sung Đăng nhập nhanh bằng Google ID (OAuth2) và Xác thực mã OTP qua Email/SMS để chống tài khoản ảo.
  - Tiếp tục duy trì quy tắc: Mọi API Backend đều phải có giao diện Frontend tương ứng trong Sprint để demo trực tiếp trên Web, không demo qua Swagger/Postman.
- Dự kiến Sprint 3: Dứt điểm 2 task tồn đọng, hoàn thiện 2 task đột xuất của Thầy (Đăng nhập Google/OTP & Thẩm định đối tác KYB), tập trung kiểm thử toàn diện E2E, Stress Test và tối ưu hóa hiệu năng hệ thống trước khi nghiệm thu.
- Video sprint review & Demo: [Điền link Google Drive / YouTube của nhóm]
- Trello Board: https://trello.com/b/AA5BYoe1
```

---

## 📊 PHẦN 2: BẢNG TỔNG HỢP & ĐỐI SOÁT CHỈ SỐ METRICS SPRINT 2

### 2.1 Bảng ma trận đóng góp cá nhân (Individual Velocity Matrix)

| STT | Thành viên | Vai trò Scrum | Số Task cam kết | Số Task hoàn thành | Story Points cam kết | Story Points hoàn thành | Tỷ lệ cá nhân | Trạng thái nghiệm thu |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| 1 | **Phạm Công Thành** | Team Leader & System Architect | 5 | 5 | 18 SP | 18 SP | 100% | ✅ Xuất sắc (Vượt tiến độ) |
| 2 | **Nguyễn Đại Phát** | Admin Lead & Backend | 4 | 4 | 14 SP | 14 SP | 100% | ✅ Đạt mục tiêu |
| 3 | **Trần Thanh Phong** | Core Booking & Seat Engine | 3 | 3 | 12 SP | 12 SP | 100% | ✅ Đạt mục tiêu |
| 4 | **Huỳnh Nhật Cường** | Frontend & Mobile Responsive | 3 | 3 | 10 SP | 10 SP | 100% | ✅ Đạt mục tiêu |
| 5 | **Trần Minh Đức** | QA/Testing & Customer Portal | 4 | 2 | 16 SP | 8 SP | 50% | ⚠️ Chuyển tiếp 2 task (8 SP) |
| **TỔNG** | **Toàn đội ngũ (Nhóm 7)** | **5 Thành viên** | **18 Tasks** | **16 Tasks** | **70 SP** | **62 SP** | **88.6%** | **ĐẠT MỤC TIÊU SPRINT** |

### 2.2 Công thức kiểm tra tính toán toán học (Verification Proofs)
* **Tổng số Story Points hoàn thành:**  
  $$18 + 14 + 12 + 10 + 8 = 62\text{ SP}$$
* **Tổng số Story Points cam kết:**  
  $$18 + 14 + 12 + 10 + 16 = 70\text{ SP}$$
* **Tỷ lệ hoàn thành Sprint 2:**  
  $$\text{Tỷ lệ} = \frac{62}{70} \times 100\% = 88.57\% \approx \mathbf{88.6\%}$$
* **Tổng số Task hoàn thành:**  
  $$5 + 4 + 3 + 3 + 2 = 16\text{ / }18\text{ Tasks (88.9\%)}$$
* **Khối lượng chuyển tiếp (Rollover Backlog):**  
  $$70 - 62 = 8\text{ SP (2 Tasks)}$$

---

## 🔍 PHẦN 3: ĐÁNH GIÁ SPRINT RETROSPECTIVE (TIẾP THU Ý KIẾN THẦY CÔ)

### 3.1 Những điểm làm tốt (What Went Well)
1. **Kiến trúc Seat Engine & Concurrency Lock:** Cơ chế khóa bi quan `@Lock(LockModeType.PESSIMISTIC_WRITE)` và Countdown Timer 10:00 giải quyết triệt để lỗi đặt trùng vé khi nhiều khách hàng cùng chọn một chỗ.
2. **Cổng thanh toán tự động hóa cao:** Tích hợp thành công VietQR qua cổng PayOS với Webhook cập nhật đơn hàng tức thì (1-2s), hỗ trợ VNPAY Sandbox và COD dự phòng.
3. **Mô hình 2 Cổng Quản trị độc lập:** Cổng Nhà xe (`/company/*`) và Cổng Quản trị sàn (`/admin/*`) có thẩm quyền rõ ràng, hỗ trợ đầy đủ quản lý xe, tài xế, chuyến đi và biểu đồ trực quan.

### 3.2 Nhận xét & Đóng góp từ Giảng viên (Feedback From Faculty)
Trong buổi kiểm tra tiến độ Sprint 2, Giảng viên hướng dẫn đã đánh giá cao khối lượng công việc nhưng lưu ý **2 vấn đề trọng yếu cần xử lý ngay**:
* **Lỗ hổng 1 — Xác thực đăng nhập còn thô sơ:**  
  Hệ thống chỉ có form đăng nhập truyền thống bằng email/password, thiếu các phương thức tiện lợi hiện đại và thiếu kiểm tra chống spam tài khoản rác.  
  👉 **Chỉ đạo:** Bổ sung **Đăng nhập nhanh Google ID (OAuth2)** và **Cơ chế xác thực mã OTP qua Email/SMS**.  
  👉 **Phân công:** Giao cho **Nguyễn Đại Phát** làm trọng tâm đầu Sprint 3 (Card `[S321]`).
* **Lỗ hổng 2 — Quy trình Đăng ký đối tác Nhà xe thiếu tính pháp lý:**  
  Trang đăng ký đối tác hiện tại mới thu thập thông tin cơ bản, chưa có thẩm định năng lực doanh nghiệp vận tải (KYB - Know Your Business), chưa kiểm soát CCCD người đại diện và giấy phép kinh doanh vận tải do Sở GTVT cấp, dễ tạo kẽ hở cho doanh nghiệp “ma”.  
  👉 **Chỉ đạo:** Tái cấu trúc toàn diện form thẩm định doanh nghiệp đa bước, số hóa tải hồ sơ pháp lý (PDF/Ảnh scan), tài khoản ký quỹ đối soát Escrow, và modal xét duyệt chuyên sâu tại Cổng Admin.  
  👉 **Phân công:** Nhóm trưởng **Phạm Công Thành** trực tiếp đảm nhận để nâng tầm đồ án (Card `[S322]`).

---

## 🚀 PHẦN 4: KẾ HOẠCH NƯỚC RÚT SPRINT 3 (TESTING & SYSTEM OPTIMIZATION)

### 4.1 Danh mục nhiệm vụ trọng tâm Sprint 3

```
+-------------------------------------------------------------------------------------------------------------------+
|                                      DANH MỤC CÔNG VIỆC TRỌNG TÂM SPRINT 3                                        |
+-------------------------------------------------------------------------------------------------------------------+
| 1. [Ưu tiên 1] [S322] Tái cấu trúc Đăng ký đối tác KYB & Thẩm định Admin (5 SP)        -> Phạm Công Thành (DONE)   |
| 2. [Ưu tiên 1] [S321] Tích hợp Đăng nhập Google OAuth2 & Xác thực OTP (5 SP)            -> Nguyễn Đại Phát          |
| 3. [Ưu tiên 2] [S320] Bộ Test Fixtures dữ liệu mẫu & Dọn dẹp DB tự động (3 SP)          -> Trần Minh Đức            |
| 4. [Ưu tiên 2] [S320] Kiểm thử nghiệm thu giao diện Acceptance Testing (5 SP)           -> Trần Minh Đức            |
| 5. [Ưu tiên 2] Kiểm thử tải Concurrency Lock & Biên độ thanh toán đa kênh (8 SP)        -> Trần Thanh Phong         |
| 6. [Ưu tiên 2] Module Quét mã QR Soát vé bằng Camera di động /scanner (5 SP)            -> Huỳnh Nhật Cường         |
| 7. [Ưu tiên 3] Kiểm thử tích hợp toàn diện 25/25 Test Cases & Tối ưu hóa hiệu năng     -> Toàn bộ nhóm             |
+-------------------------------------------------------------------------------------------------------------------+
```

### 4.2 Kế hoạch bàn giao nghiệm thu đồ án
- **Ngày 5:** Hoàn tất dứt điểm 2 task đột xuất (Google OAuth2/OTP và KYB Partner Registration) cùng 2 task tồn đọng.
- **Ngày 6:** Thực thi trọn vẹn 25 Test Cases tự động và kiểm thử tải đồng thời 500 CCU.
- **Ngày 7:** Tổng duyệt kịch bản Demo trực tiếp trên giao diện sản phẩm thực tế, xuất báo cáo và chuẩn bị nghiệm thu 100/100 điểm.

---
*Biên bản được lập và thông qua bởi toàn thể 5 thành viên Nhóm 7 (TravelEasy Platform).*

