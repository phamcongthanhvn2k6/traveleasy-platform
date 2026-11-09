# 📙 SPRINT 3 README — KHÓA GHẾ REALTIME, POS BẾN XE, GPS TRACKING, CI/CD VPS & BÁO CÁO NHÀ XE
> **Dự án:** Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy (`traveleasy-platform`)  
> **Đơn vị:** OJT Đồ Án Tốt Nghiệp Nhóm 7  
> **Thời gian thực hiện:** Tuần 3 (Sprint 3 — Tuần Hoàn Thiện & Nghiệm Thu Sản Phẩm)  
> **Trạng thái:** 🚀 **ĐANG THỰC HIỆN (Theo đúng tiến độ Tuần 3 của môn học)**  
> **Quy mô danh mục Sprint 3:** **10 User Stories & Technical Tasks | 34 Story Points | 06 Thành viên**  

---

## 🎯 1. MỤC TIÊU SPRINT (SPRINT GOAL)
Triển khai trọn vẹn nghiệp vụ cốt lõi và hoàn tất chuyển giao sản phẩm:
- **Hạ tầng & Real-time:** Hoàn tất cơ chế khóa ghế đồng thời **Concurrency Lock 10 phút** chống trùng vé, tích hợp Server-Sent Events (SSE). Đóng gói **Docker Compose** và triển khai hệ thống lên **VPS Production** (`103.72.57.149`).
- **Nghiệp vụ Bến xe & Nhà xe:** Xây dựng quầy bán vé nhanh **POS Bến xe** (`/company/pos`) hỗ trợ in bill nhiệt 80mm có QR; phân hệ **Quản lý ca trực tiền mặt** Z-Report (`/company/shifts`); phân hệ **Báo cáo doanh thu & tỷ lệ lấp đầy ghế** (`/company/reports`).
- **Khách hàng & Trải nghiệm:** Tích hợp bản đồ **GPS Live Tracking** xe chạy thời gian thực (`/tracking/:tripId`), cấu hình **luật giá vé động & giờ cao điểm** (`/company/pricing-rules`), tối ưu tốc độ tải trang với **SWR Cache 0ms & Skeleton UI**.
- **Chuyển giao & Sẵn sàng bảo vệ:** Chuẩn bị trung tâm kịch bản **Demo Hub 15 phút** (`/demo`) và bộ slide báo cáo OJT.

---

## 👥 2. PHÂN CÔNG THÀNH VIÊN VÀ ĐỊNH MỨC STORY POINTS (10 TASKS / 34 SP)

| STT | Thành viên | Vai trò | Số task | Story Points | Nhiệm vụ trọng tâm Sprint 3 |
|:---:|:---|:---|:---:|:---:|:---|
| 1 | **Phạm Công Thành** | Team Leader & System Architect | 3 tasks | **10 SP** | DevOps VPS Production (`S303`), Email B2B SMTP (`S302`), Demo Hub 15p & Slide (`S308`) |
| 2 | **Phạm Thanh Phong** | Core Booking & Seat Engine | 2 tasks | **8 SP** | Concurrency Lock 10:00 (`S301`), Quầy bán vé nhanh POS Bến xe in nhiệt 80mm (`S304`) |
| 3 | **Nguyễn Đại Phát** | Admin Lead & Fullstack | 2 tasks | **7 SP** | GPS Live Tracking SSE (`S306`), Báo cáo doanh thu & lấp đầy ghế nhà xe (`S310`) |
| 4 | **Trần Minh Đức** | Customer Portal & Performance | 2 tasks | **6 SP** | Giá vé động & giờ cao điểm (`S307`), Global Loading & SWR Cache 0ms (`S309`) |
| 5 | **Đoàn Nhật Cường** | Mobile Specialist & Operator POS | 1 task | **3 SP** | Quản lý ca trực & bàn giao tiền mặt quầy bến xe Z-Report (`S305`) |
| 6 | **Phan Trung Kiên** | Thành viên | 0 task | **0 SP** | Miễn thực tập OJT theo quy chế đào tạo |

---

## 📋 3. DANH MỤC CÔNG VIỆC CHI TIẾT (SPRINT 3 BACKLOG)

### 3.1. Phân hệ Lõi Đặt Vé, Hạ Tầng & DevOps
- **[Ưu tiên: 1] [4 SP] [S301][CORE] Đồng bộ Khóa ghế Concurrency Lock 10:00 & Giữ chỗ Real-time SSE:**
  - Ngăn chặn 100% tình trạng 2 khách hàng hoặc khách online và nhân viên quầy đặt trùng 1 ghế.
  - Tự động hoàn ghế về trạng thái trống sau khi bộ đếm 10:00 kết thúc nếu chưa thanh toán.
  - Phụ trách: **Phạm Thanh Phong**.
- **[Ưu tiên: 1] [3 SP] [S302][MAIL] Dịch vụ Email Tự Động Phê Duyệt Hồ Sơ Đối Tác & Cấp Phát Tài Khoản B2B (`/company/login`):**
  - Tự động kích hoạt tài khoản nhà xe khi Admin phê duyệt, gửi email HTML chứa thông tin đăng nhập và mật khẩu khởi tạo qua Google SMTP live.
  - Phụ trách: **Phạm Công Thành**.
- **[Ưu tiên: 1] [4 SP] [S303][DEVOPS] Đóng Gói Docker Compose Production & Triển Khai CI/CD Lên VPS Thực Tế (`103.72.57.149`):**
  - Cấu hình Nginx reverse proxy cổng 80/443, SSL Let's Encrypt, container hóa Spring Boot Backend và React Frontend.
  - Phụ trách: **Phạm Công Thành**.

### 3.2. Phân hệ Quầy Vé Bến Xe & Điều Hành Nhà Xe
- **[Ưu tiên: 2] [4 SP] [S304][POS] Giao diện & API Bán Vé Nhanh Tại Quầy Bến Xe POS (`/company/pos`):**
  - Tối ưu thao tác bán vé cho khách vãng lai trong 3 click chuột hoặc phím tắt (F2 tìm chuyến, F9 in bill).
  - Tích hợp in hóa đơn nhiệt khổ 80mm có mã QR bảo mật để tài xế quét soát vé.
  - Phụ trách: **Phạm Thanh Phong**.
- **[Ưu tiên: 2] [3 SP] [S305][SHIFTS] Quản Lý Ca Trực & Bàn Giao Tiền Mặt Quầy Bến Xe (`/company/shifts`):**
  - Mở ca với tiền mặt đầu ca (Float Cash), ghi nhận doanh thu tiền mặt trong ca, kết ca xuất báo cáo Z-Report nộp quỹ.
  - Tách biệt độc lập khỏi phân hệ POS để tránh xung đột mã nguồn.
  - Phụ trách: **Đoàn Nhật Cường**.
- **[Ưu tiên: 2] [3 SP] [S310][REPORTS] Phân Hệ Báo Cáo Thống Kê Doanh Thu & Tỷ Lệ Lấp Đầy Ghế Nhà Xe (`/company/reports`):**
  - Biểu đồ trực quan doanh thu theo ngày/tháng, tỷ lệ lấp đầy ghế theo tuyến đường, xuất dữ liệu Excel đối soát.
  - Phụ trách: **Nguyễn Đại Phát**.

### 3.3. Phân hệ Trải Nghiệm Khách Hàng & Vận Hành
- **[Ưu tiên: 2] [4 SP] [S306][TRACKING] Bản Đồ Định Vị GPS Live Tracking Xe Chạy Thời Gian Thực (`/tracking/:tripId`):**
  - Tích hợp Leaflet Map hiển thị tuyến đường, mô phỏng tọa độ GPS xe chạy realtime qua Server-Sent Events (SSE).
  - Khách hàng bấm xem vị trí xe trực tiếp từ trang Vé của tôi (`/my-tickets`).
  - Phụ trách: **Nguyễn Đại Phát**.
- **[Ưu tiên: 2] [3 SP] [S307][PRICING] Phân Hệ Quản Trị Giá Vé Động & Phụ Thu Lễ Tết/Cuối Tuần (`/company/pricing-rules`):**
  - Thiết lập luật tự động điều chỉnh giá: phụ thu cuối tuần (+15%), ngày lễ (+30%), giảm giá giờ thấp điểm (-10%).
  - Phụ trách: **Trần Minh Đức**.
- **[Ưu tiên: 1] [3 SP] [S309][PERF] Màn hình Loading chuyển trang & Tối ưu hiệu năng giao diện SWR Cache 0ms, Skeleton Vé của tôi (`/my-tickets`):**
  - Tối ưu trải nghiệm không giật lag, Skeleton Loading UI khi tải dữ liệu vé và lịch trình.
  - Phụ trách: **Trần Minh Đức**.

### 3.4. Phân hệ Tổng Kết & Sẵn Sàng Nghiệm Thu OJT
- **[Ưu tiên: 1] [3 SP] [S308][DEMO-DEFENSE] Xây Dựng Trung Tâm Trình Diễn Demo Hub 15 Phút (`/demo`) & Slide Bảo Vệ OJT:**
  - Cổng kịch bản demo 1-click kiểm tra sức khỏe hệ thống, nạp dữ liệu mẫu và slide thuyết trình chuẩn nhận diện.
  - Phụ trách: **Phạm Công Thành**.

---

## 📦 4. SẢN PHẨM BÀN GIAO SPRINT 3 (DELIVERABLES)
1. 🖨️ Phân hệ POS bán vé quầy bến xe (`/company/pos`) và Quản lý ca trực tiền mặt (`/company/shifts`).
2. 🗺️ Phân hệ Bản đồ định vị GPS xe chạy thời gian thực (`/tracking/:tripId`).
3. ⚡ Động cơ khóa ghế đồng thời Concurrency Lock 10 phút chống trùng vé.
4. 📈 Báo cáo thống kê doanh thu & lấp đầy ghế nhà xe (`/company/reports`).
5. 🐳 Môi trường Production VPS đóng gói Docker (`103.72.57.149`).
6. 🎬 Cổng trình diễn Demo Hub 15 phút (`/demo`) và Kịch bản bảo vệ đồ án OJT.
