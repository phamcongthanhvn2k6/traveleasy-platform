# 📕 SPRINT 4 README — VẬN HÀNH SẴN SÀNG SẢN XUẤT, DEVOPS VPS, EMAIL B2B & KỊCH BẢN BẢO VỆ OJT
> **Dự án:** Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy  
> **Đơn vị:** OJT Đồ Án Nhóm 7  
> **Thời gian thực hiện:** Tuần 4 (Sprint 4 — Tuần Nước Rút & Nghiệm thu Bảo vệ OJT)  
> **Quy mô danh mục chuẩn hóa:** 8 User Stories & Technical Tasks cốt lõi — 28 Story Points (Chuẩn Scrum 1 tuần)  
> **Trạng thái:** 🎯 **FINAL SPRINT & PRODUCTION READINESS (Đã rà soát & Tinh gọn backlog)**  
> **Trọng tâm:** Khóa ghế Real-time, Email Bàn giao Tài khoản Đối tác, Triển khai VPS CI/CD, POS Bến xe & Kịch bản Demo Hội đồng 15 phút.

---

## 🎯 1. MỤC TIÊU SPRINT (SPRINT GOAL)
Đóng gói toàn bộ nền tảng vào trạng thái sẵn sàng phát hành sản xuất (Production Readiness), đưa hệ thống lên máy chủ VPS thực tế (`103.72.57.149`), hoàn tất cơ chế khóa ghế thời gian thực chống đặt trùng vé (Real-time Concurrency Lock 10 phút), kích hoạt luồng tự động gửi Email thông báo phê duyệt hồ sơ đối tác nhà xe kèm thông tin đăng nhập Cổng Điều Hành (`/company/login`), hoàn thiện phân hệ Quầy vé Bến xe của Nhà xe (`/company/pos`) và xây dựng Trung tâm trình diễn Demo Hub (`/demo`) phục vụ buổi báo cáo bảo vệ tốt nghiệp OJT 15 phút.

---

## 🔍 2. KẾT QUẢ RÀ SOÁT & DUYỆT LẠI SPRINT 4 BACKLOG (BACKLOG REFINEMENT & SCRUBBING)

Sau khi rà soát kỹ lưỡng cùng Nhóm trưởng và yêu cầu nghiệp vụ thực tế của đề tài **"Nền tảng đặt vé xe khách liên tỉnh"**, nhóm đã thực hiện tinh gọn và thanh lọc backlog Sprint 4:

### 2.1. Danh mục các thẻ LOẠI BỎ khỏi Sprint 4 (Đưa vào Product Roadmap tương lai)
Các tính năng sau bị loại bỏ vì **không thuộc phạm vi cốt lõi của sàn vé xe khách liên tỉnh tuyến cố định** và làm loãng nội dung bảo vệ trước Hội đồng OJT:
1. ❌ **Thuê xe Hợp đồng Du lịch trọn gói (`/charter`) & Ký quỹ Escrow 30%** *(Cũ: `S401[FE]`, `S401[BE]`, `S409[FE]`)*:
   - *Lý do loại bỏ:* Đề tài là xe khách liên tỉnh tuyến cố định (Intercity Scheduled Bus). Việc phát triển thêm sàn đấu thầu thuê xe hợp đồng tour du lịch riêng là một mô hình kinh doanh hoàn toàn khác, phân tán nguồn lực và không khả thi trong sprint cuối 1 tuần.
2. ❌ **Ký gửi Hàng hóa Bưu kiện Hầm xe (`/cargo`)** *(Cũ: `S406[BE]`, `S410[FE]`)*:
   - *Lý do loại bỏ:* Dịch vụ vận chuyển bưu kiện (tính cước theo cân nặng/kích thước, sinh mã vận đơn QR, ký gửi tại bến) là nghiệp vụ Logistics chuyên biệt. Đưa vào phạm vi bảo vệ dễ bị Hội đồng chất vấn làm nông, không sát đề tài cốt lõi. Chuyển sang Roadmap phiên bản 2.0.
3. ❌ **Trung tâm Hỗ trợ Khẩn cấp 24/7 (`/support`) & Tối ưu Mobile-First** *(Cũ: `S407[FE]`, `S408[FE]`)*:
   - *Lý do gộp:* Trang Support thực chất là trang tĩnh FAQ & Hotline đã có sẵn. Yêu cầu Mobile Responsive là tiêu chuẩn kỹ thuật (Non-functional) chứ không phải User Story nghiệp vụ mới.

---

### 2.2. Danh mục BỔ SUNG & CHỐT CHÍNH THỨC SPRINT 4 BACKLOG (8 Thẻ — 28 SP)

| Mã Thẻ | Tên Nhiệm Vụ Nghiệp Vụ & Kỹ Thuật | Điểm SP | Người Phụ Trách (RACI) | Trạng Thái Thực Tế |
| :---: | :--- | :---: | :---: | :--- |
| **`[S401]`** | **Đồng bộ Khóa ghế & Giữ chỗ Real-time 10 phút (SSE Concurrency Lock)**<br>• Khóa ghế độc quyền 10 phút chống đặt trùng.<br>• Giữ chỗ bền vững khi chuyển trang checkout quay lại.<br>• SSE cập nhật màu ghế tức thì trên toàn sàn. | **4 SP** | **Phạm Thanh Phong** | 🟢 **ĐÃ HOÀN THÀNH 100%**<br>*(Đã kiểm thử & Merge)* |
| **`[S402]`** | **Dịch vụ Email Tự Động Phê Duyệt Hồ Sơ Đối Tác & Cấp Tài Khoản B2B**<br>• Gửi email HTML chúc mừng khi Admin duyệt nhà xe.<br>• Tự sinh mật khẩu khởi tạo bảo mật & gán `ROLE_OPERATOR`, `busCompanyId`.<br>• Tích hợp Google SMTP live + Smart fallback. | **3 SP** | **Phạm Công Thành** | 🟡 **ĐANG HOÀN TẤT**<br>*(Đã code & test Gmail SMTP)* |
| **`[S403]`** | **Đóng Gói Docker Compose Production & Triển Khai CI/CD Lên VPS Thực Tế**<br>• Cấu hình `docker-compose.prod.yml`, Nginx Reverse Proxy cổng 80.<br>• Kết nối Supabase PostgreSQL Cloud & nạp cấu hình production VPS `103.72.57.149`.<br>• Tự động hóa build & deploy. | **4 SP** | **Phạm Công Thành** | 🟡 **ĐANG HOÀN TẤT**<br>*(Container đã chạy trên VPS)* |
| **`[S404]`** | **Giao Diện & API Bán Vé Nhanh Tại Quầy Bến Xe POS (`/company/pos`)**<br>• Tối ưu thao tác phím tắt F1-F9 cho nhân viên nhà xe tại bến.<br>• Xuất vé dưới 10 giây, in hóa đơn nhiệt 80mm có mã QR bảo mật.<br>• Đồng bộ trạng thái ghế đã bán sang Web khách hàng. | **4 SP** | **Phạm Thanh Phong** | 🔵 **SẴN SÀNG NGHIỆM THU**<br>*(Giao diện đã có sẵn)* |
| **`[S405]`** | **Quản Lý Ca Trực & Bàn Giao Tiền Mặt Quầy Bến Xe (`/company/pos/shifts`)**<br>• Khởi tạo số tiền lẻ đầu ca trực.<br>• Theo dõi doanh thu tiền mặt và in phiếu kết ca Z-Report nộp thủ quỹ. | **3 SP** | **Nguyễn Đại Phát** | 🔵 **SẴN SÀNG NGHIỆM THU** |
| **`[S406]`** | **Bản Đồ Định Vị GPS Live Tracking Xe Chạy Thời Gian Thực (`/tracking/:tripId`)**<br>• Tích hợp bản đồ Leaflet hiển thị xe khách di chuyển theo tọa độ GPS.<br>• Server-Sent Events (SSE) truyền tọa độ thời gian thực về máy khách. | **4 SP** | **Đoàn Nhật Cường** | 🔵 **SẴN SÀNG NGHIỆM THU** |
| **`[S407]`** | **Quản Trị Chính Sách Giá Vé Động & Phụ Thu Lễ Tết (`/company/pricing-rules`)**<br>• Cấu hình phụ thu cao điểm dịp Lễ Tết (+20%) hoặc giảm giá giờ chót (-15%).<br>• Tự động tính giá vé theo quy tắc khi khách đặt chỗ. | **3 SP** | **Trần Minh Đức** | 🔵 **SẴN SÀNG NGHIỆM THU** |
| **`[S408]`** | **Trung Tâm Trình Diễn Demo Hub 15 Phút (`/demo`) & Hồ Sơ Bảo Vệ OJT**<br>• Trang Demo Hub chuyển nhanh các kịch bản demo.<br>• Slide thuyết trình 25 trang & Kịch bản khớp từng giây bảo vệ Hội đồng. | **3 SP** | **Phạm Công Thành** *(Lead)* | 🟢 **ĐÃ HOÀN THÀNH 100%** |
| **TỔNG** | **8 User Stories & Technical Tasks Trọng Tâm** | **28 SP** | **Toàn đội Nhóm 7** | **Đạt chuẩn 100% Scrum 1 tuần** |

---

## 👥 3. PHÂN CÔNG THÀNH VIÊN TRONG SPRINT 4 (MA TRẬN RACI CHUẨN)

| Thành viên | Trách nhiệm chính trong Sprint 4 | Định mức SP | Trạng thái cam kết |
| :--- | :--- | :---: | :---: |
| **Phạm Công Thành** *(Team Leader)* | • Hệ thống Email B2B bàn giao tài khoản nhà xe (`S402`)<br>• Hạ tầng Docker Production & CI/CD VPS (`S403`)<br>• Kịch bản Demo Hub 15 phút & Điều phối bảo vệ (`S408`) | **10 SP** *(Kiến trúc & DevOps)* | Cam kết hoàn thành 100% |
| **Phạm Thanh Phong** | • Động cơ khóa ghế Real-time 10 phút (`S401`)<br>• Phân hệ Bán vé Quầy POS Bến xe (`S404`) | **8 SP** *(Core Booking)* | Cam kết hoàn thành 100% |
| **Nguyễn Đại Phát** | • Quản lý Ca trực & Đối soát Tiền mặt Quầy bến xe (`S405`) | **3 SP** *(Admin & Finance)* | Cam kết hoàn thành 100% |
| **Đoàn Nhật Cường** | • Bản đồ GPS Live Tracking thời gian thực qua SSE (`S406`) | **4 SP** *(Mobile & Tracking)* | Cam kết hoàn thành 100% |
| **Trần Minh Đức** | • Phân hệ Quản trị Giá vé động & Phụ thu Lễ Tết (`S407`) | **3 SP** *(Customer Portal)* | Cam kết hoàn thành 100% |
| **Phan Trung Kiên** | Miễn thực tập OJT theo quy chế đào tạo. | **0 SP** | Exempted |

---

## 🎬 4. KỊCH BẢN TRÌNH DIỄN BẢO VỆ OJT 15 PHÚT TẠI TRANG `/demo`

* **Phút 00:00 - 02:30:** Giới thiệu bài toán sàn đặt vé xe khách liên tỉnh, kiến trúc Modular Monolith và CSDL Supabase PostgreSQL.
* **Phút 02:30 - 06:30:** Demo luồng khách hàng: Tìm kiếm SWR Cache 0ms ➔ Chọn ghế Limousine VIP ➔ **Khóa ghế Concurrency Lock 10:00 thời gian thực (chứng minh tab ẩn danh bị khóa ngay lập tức)** ➔ Quét VietQR thanh toán tự động ➔ Nhận vé điện tử QR.
* **Phút 06:30 - 09:30:** Demo hiện trường Bến xe: Nhân viên nhà xe bán vé quầy POS (`/company/pos`), nhả hóa đơn nhiệt có mã QR bảo mật; Tài xế dùng camera điện thoại quét soát vé siêu tốc < 0.2s (`/scanner`).
* **Phút 09:30 - 12:00:** Demo B2B Nhà xe & Vận hành: Đối tác đăng ký hợp tác KYB ➔ Admin phê duyệt ➔ **Tự động gửi Email HTML bàn giao tài khoản điều hành** ➔ Bản đồ GPS Live Tracking xe chạy (`/tracking`).
* **Phút 12:00 - 15:00:** Tổng kết giải pháp chịu tải Concurrency, báo cáo triển khai thực tế trên VPS `103.72.57.149` và đón nhận phản biện từ Hội đồng.

---

## 🏆 5. TIÊU CHÍ NGHIỆM THU (DoD SPRINT 4)
- ✅ Toàn bộ 8 thẻ công việc đạt trạng thái `Done` trên Trello và có bằng chứng kiểm thử rõ ràng.
- ✅ Hệ thống chạy ổn định trực tiếp trên máy chủ VPS Internet `http://103.72.57.149`.
- ✅ Cơ chế khóa ghế thời gian thực chống đặt trùng vé 100% không phát sinh xung đột.
- ✅ Email thông báo phê duyệt đối tác gửi thành công qua Google SMTP live.
- ✅ Bài thuyết trình 15 phút diễn ra đúng kịch bản, trôi chảy, tự tin trước Hội đồng bảo vệ OJT.
