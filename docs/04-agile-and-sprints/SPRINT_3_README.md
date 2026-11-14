# 📙 SPRINT 3 README — KHÓA GHẾ REALTIME, POS BẾN XE, ĐIỀU HÀNH TỔ LÁI, TRUNG CHUYỂN & VẬN HÀNH TOÀN DIỆN
> **Dự án:** Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy (`traveleasy-platform`)  
> **Đơn vị:** OJT Đồ Án Tốt Nghiệp Nhóm 7 — FPT Polytechnic  
> **Thời gian thực hiện:** Sprint 3 (Tuần Vận Hành Nâng Cao & Hoàn Thiện Nghiệp Vụ)  
> **Trạng thái:** 🚀 **CHÍNH THỨC PHÊ DUYỆT & ĐANG THỰC HIỆN**  
> **Quy mô Sprint 3 chính thức:** **17 User Stories & Technical Tasks | 45 Story Points | 04 Thành viên OJT Active**  

---

## 🎯 1. MỤC TIÊU SPRINT 3 (SPRINT GOALS)
Sprint 3 mở rộng toàn diện nhằm giải quyết bài toán vận hành thực tế của các nhà xe liên tỉnh, nâng cao năng lực bảo vệ đồ án tốt nghiệp OJT với các năng lực nghiệp vụ đỉnh cao:
1. **Lõi Đặt Vé & Concurrency:** Khóa ghế đồng thời **Concurrency Lock 10 phút** chống trùng vé đa luồng thời gian thực qua Server-Sent Events (SSE).
2. **Nghiệp Vụ Vé Nâng Cao:** Xử lý **Đổi vé & Chuyển chuyến xe** (`/company/ticket-exchange`), quy định bậc thang **Biểu phí hoàn hủy vé** (`/company/refunds`) và **Thiết lập giá vé động Lễ/Tết** (`/company/pricing-rules`).
3. **Hiện Trường Bến Xe & Điều Hành:** **Phân công tổ lái & kiểm tra cồn xuất bến** (`/company/crew`), **Quản lý đón/trả trung chuyển tận nơi** (`/company/shuttles`), **WebApp di động quét QR soát vé** (`/conductor/scanner`), **Quản lý ca trực POS nộp tiền mặt** (`/company/shifts`).
4. **Tài Chính & Pháp Lý:** **Sổ chi phí vận hành chuyến & lãi/lỗ P&L** (`/company/expenses`), **Xuất lệnh vận chuyển điện tử chuẩn Bộ GTVT** (PDF/Excel), **Đối soát doanh thu & Ví nhà xe** (`/company/settlements`), **Cổng thanh toán tự động Webhook**.
5. **Bảo Mật & Xác Thực Khách Hàng:** **Quên mật khẩu & khôi phục tài khoản qua OTP Gmail** (`/forgot-password`), xác thực mã 6 số chống brute-force và cấp lại mật khẩu mới an toàn.

---

## 👥 2. PHÂN BỔ STORY POINTS THEO THÀNH VIÊN (17 TASKS / 45 SP)

| STT | Thành viên | Vai trò chuyên trách | Số task | Story Points | Các Task Phụ Trách |
|:---:|:---|:---|:---:|:---:|:---|
| 1 | **Phạm Công Thành** | Team Leader & System Architect | 4 tasks | **13 SP** | `[S301]` (4 SP), `[S310]` (3 SP), `[S311]` (3 SP), `[AUTH-FORGOT]` (3 SP) |
| 2 | **Trần Minh Đức** | Core Features & Pricing Engine | 4 tasks | **11 SP** | `[S307]` (3 SP), `[S316]` (3 SP), `[S317]` (3 SP), `[S318]` (2 SP) |
| 3 | **Đoàn Nhật Cường** | Operator Hub & Mobile Scanner | 4 tasks | **11 SP** | `[S305]` (3 SP), `[S315]` (2 SP), `[S319]` (3 SP), `[S320]` (3 SP) |
| 4 | **Nguyễn Đại Phát** | Payment Gateway, Legal & QA | 5 tasks | **10 SP** | `[S313]` (3 SP), `[S314]` (2 SP), `[S321]` (3 SP), `[S322]` (2 SP), `[S323]` (2 SP) |
| 5 | **Phan Trung Kiên** | Thành viên | 0 task | **0 SP** | *(Miễn thực tập OJT theo quyết định đào tạo)* |
| **TỔNG** | **Toàn đội Nhóm 7** | **Khối lượng chuẩn mực Sprint 3** | **17 tasks** | **45 SP** | **Phân bổ đồng đều giữa các thành viên active** |

---

## 📋 3. DANH MỤC CÔNG VIỆC CHI TIẾT (SPRINT 3 SPRINT BACKLOG)

### 3.1. Phân hệ Lõi Đặt Vé, Concurrency, Báo Cáo Tài Chính & Xác Thực — Phạm Công Thành (13 SP)
- **`[Ưu tiên: 1] [4 SP] [S301][CORE]` Đồng bộ Khóa ghế Concurrency Lock 10:00 & Giữ chỗ Real-time SSE:**
  - Ngăn chặn triệt để xung đột khi 2 người cùng chọn 1 ghế tại cùng một thời điểm.
  - Tự động nhả ghế sau 10:00 đếm ngược nếu chưa hoàn tất thanh toán.
  - Route: `/booking`, `/trips/:id`.
- **`[Ưu tiên: 2] [3 SP] [S310]` Dashboard Báo Cáo Doanh Thu & Tỷ Lệ Lấp Đầy Chuyến Xe:**
  - Biểu đồ doanh thu theo ngày/tháng, tỷ lệ lấp đầy ghế theo tuyến đường, phân tích hiệu suất khai thác.
  - Route: `/company/dashboard`.
- **`[Ưu tiên: 2] [3 SP] [S311]` Đối Soát Doanh Số Bán Vé Định Kỳ & Quản Lý Ví Nhà Xe:**
  - Tự động chốt kỳ đối soát ngày 01 và 15 hàng tháng, trừ phí hoa hồng sàn 3-5%, quản lý số dư ví khả dụng và yêu cầu rút tiền.
  - Route: `/company/settlements`.
- **`[Ưu tiên: 2] [3 SP] [AUTH-FORGOT]` Chức Năng Quên Mật Khẩu & Xác Thực OTP Khôi Phục Qua Gmail (To Do):**
  - **Mục tiêu**: Cung cấp cơ chế tự phục hồi tài khoản khi quên mật khẩu qua OTP gửi về Gmail, tăng tính tự phục vụ và bảo mật người dùng.
  - **Checklist Nghiệm thu (DoD)**:
    - [ ] Endpoint `POST /api/v1/auth/forgot-password` nhận email người dùng, sinh mã OTP 6 chữ số có hiệu lực 5 phút (TTL) và gửi email qua Gmail SMTP / JavaMailSender.
    - [ ] Endpoint `POST /api/v1/auth/verify-reset-otp` xác thực OTP, chống brute-force (giới hạn thử sai tối đa 5 lần), sinh `resetToken` dùng một lần.
    - [ ] Endpoint `POST /api/v1/auth/reset-password` nhận `resetToken` và mật khẩu mới, cập nhật hash BCrypt vào database và vô hiệu hóa phiên đăng nhập cũ.
    - [ ] Giao diện Modal/Trang quên mật khẩu 3 bước (Nhập Email -> Nhập mã OTP 6 ô có đếm ngược 60s -> Nhập lại mật khẩu mới và thông báo thành công).
  - **Route**: `/forgot-password` (hoặc modal tại `/login`).
  - **Trạng thái**: `To Do` | **Phụ trách**: Phạm Công Thành (`@thanhphmcong1`)

### 3.2. Phân hệ Định Giá, Đổi Chuyến, Trung Chuyển & Chi Phí — Trần Minh Đức (11 SP)
- **`[Ưu tiên: 2] [3 SP] [S307]` Cơ Chế Thiết Lập Giá Vé Động (Dynamic Pricing Engine):**
  - Cấu hình quy tắc phụ thu ngày cuối tuần (T6, T7, CN) và ngày Lễ/Tết; phụ thu theo vị trí ghế tầng dưới.
  - Route: `/company/pricing-rules`.
- **`[Ưu tiên: 2] [3 SP] [S316]` Nghiệp Vụ Đổi Vé & Chuyển Chuyến Xe Khách:**
  - Đổi vé trước giờ chạy $\ge 12h$, tự động hoàn vé cũ (`EXCHANGED`), tính toán chênh lệch giá, bảo lưu ghế mới.
  - Route: `/company/ticket-exchange`. Bảng CSDL: `ticket_exchange_logs`.
- **`[Ưu tiên: 3] [3 SP] [S317]` Quản Lý Đón Trả Trung Chuyển Hành Khách Tận Nơi:**
  - Quản lý danh sách đón/trả tận nhà, phân bổ tài xế xe trung chuyển gom khách trước 60-90 phút.
  - Route: `/company/shuttles`. Bảng CSDL: `shuttle_requests`.
- **`[Ưu tiên: 3] [2 SP] [S318]` Sổ Chi Phí Vận Hành Chuyến & Báo Cáo Lãi Lỗ (P&L):**
  - Kê khai chi phí thực tế chuyến xe: Xăng dầu, cầu đường BOT, bến bãi; tính lợi nhuận ròng chuyến xe.
  - Route: `/company/expenses`. Bảng CSDL: `trip_expenses`.

### 3.3. Phân hệ Điều Hành Bến Xe, Tổ Lái & Soát Vé Di Động — Đoàn Nhật Cường (11 SP)
- **`[Ưu tiên: 2] [3 SP] [S305]` Quản Lý Ca Trực Bán Vé POS & Kết Ca Nộp Tiền Mặt:**
  - Mở ca với tiền mặt đầu ca, ghi nhận doanh thu trong ca, kết ca đếm tiền và xuất báo cáo Z-Report nộp quỹ.
  - Route: `/company/shifts`.
- **`[Ưu tiên: 3] [2 SP] [S315]` Code Review & Tối Ưu Hóa Hiệu Năng Truy Vấn CSDL:**
  - Rà soát N+1 JPA Query, bổ sung Index tối ưu hóa tốc độ tìm kiếm chuyến xe xuống dưới 50ms.
- **`[Ưu tiên: 2] [3 SP] [S319]` Phân Công Tổ Lái & Kiểm Tra Điều Kiện Xuất Bến:**
  - Phân công Lái chính, Lái phụ, Phụ xe; kiểm tra nồng độ cồn bắt buộc 0.00 mg/L và GPLX trước khi lăn bánh.
  - Route: `/company/crew`. Bảng CSDL: `trip_crews`.
- **`[Ưu tiên: 2] [3 SP] [S320]` WebApp Quét QR Soát Vé & Điểm Danh Hành Khách Lên Xe:**
  - Ứng dụng di động quét mã QR vé tại cửa xe, âm thanh thông báo vé hợp lệ/trùng lặp, điểm danh sơ đồ ghế.
  - Route: `/conductor/scanner`.

### 3.4. Phân hệ Thanh Toán, Pháp Lý Chuẩn Bộ GTVT & QA Testing — Nguyễn Đại Phát (10 SP)
- **`[Ưu tiên: 1] [3 SP] [S313]` Tích Hợp Cổng Thanh Toán Tự Động & Xử Lý Webhook:**
  - Tích hợp VietQR / VNPay Webhook, cơ chế Idempotency chống ghi nhận trùng lặp giao dịch.
- **`[Ưu tiên: 2] [2 SP] [S314]` Kiểm Thử Hồi Quy & Tích Hợp Toàn Bộ Luồng Thanh Toán:**
  - Integration Test suite cho toàn bộ vòng đời vé từ lúc tạo đến lúc thanh toán và xuất vé.
- **`[Ưu tiên: 2] [3 SP] [S321]` Thiết Lập Chính Sách Phí Hoàn Hủy & Xử Lý Yêu Cầu Hủy Vé:**
  - Cấu hình bậc thang phí phạt hủy vé theo thời gian báo trước, tính tiền hoàn trả và tự động mở lại ghế trống.
  - Route: `/company/refunds`.
- **`[Ưu tiên: 3] [2 SP] [S322]` Xuất PDF/Excel Lệnh Vận Chuyển Điện Tử Chuẩn Bộ GTVT:**
  - Xuất file PDF/Excel mẫu Lệnh Vận Chuyển Hành Khách Bằng Xe Ô Tô theo đúng mẫu biểu quy chuẩn pháp lý.
- **`[Ưu tiên: 2] [2 SP] [S323]` Kịch Bản E2E Test & Kiểm Thử Tích Hợp Ca Trực POS + Webhook:**
  - Kịch bản kiểm thử E2E liên thông giữa POS bán vé quầy, quét mã QR thanh toán và đóng ca đối soát tiền mặt.

---

## 🛠️ 4. QUY HOẠCH CẤU TRÚC MÃ NGUỒN CHỐNG XUNG ĐỘT (ZERO-CONFLICT ARCHITECTURE)

Nhằm đảm bảo các thành viên làm việc song song mà **không xảy ra xung đột git (0 merge conflict)**:
1. **Quy hoạch Router 2 cấp phẳng (`/company/*`):** Toàn bộ 6 route mới đã được khai báo và khóa trong `companyRoutes.tsx`. Thành viên chỉ viết code trong trang của mình.
2. **Kiến trúc Package-by-Feature:**
   - Đức: `CompanyTicketExchangeController.java`, `CompanyShuttleController.java`, `CompanyTripExpenseController.java`.
   - Cường: `CompanyTripCrewController.java`, `ConductorScannerController.java`.
   - Phát: `CompanyCancellationRefundController.java`.
3. **CSDL Sẵn Sàng (Live Data):** 4 bảng mới (`trip_crews`, `shuttle_requests`, `trip_expenses`, `ticket_exchange_logs`) đã được tạo và seed sẵn dữ liệu mẫu thực tế của Nhà xe ID 14 trên Supabase.

---

## 📦 5. BỘ SẢN PHẨM BÀN GIAO SPRINT 3 (DELIVERABLES)
1. ⚡ **Module Khóa Ghế Concurrency Lock 10 phút & SSE**.
2. 🔄 **Module Đổi Vé Chuyển Chuyến & Biểu Phí Hoàn Hủy Vé**.
3. 🚐 **Module Đón Trả Trung Chuyển Tận Nơi & Sổ Chi Phí Lãi/Lỗ P&L**.
4. 👨‍✈️ **Module Phân Công Tổ Lái & Kiểm Tra Cồn Xuất Bến**.
5. 📱 **WebApp Quét QR Soát Vé Cho Tài Xế / Phụ Xe Cầm Tay**.
6. 📄 **Công Cụ Xuất PDF Lệnh Vận Chuyển Điện Tử Chuẩn Bộ GTVT**.
7. 💳 **Cổng Thanh Toán Webhook Tự Động & Quầy Bán Vé POS Bến Xe**.
8. 📊 **Bộ Test Suite E2E & Báo Cáo Đối Soát Doanh Số Nhà Xe**.
