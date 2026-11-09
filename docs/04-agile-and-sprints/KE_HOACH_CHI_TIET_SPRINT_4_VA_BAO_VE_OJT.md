# 🎯 KẾ HOẠCH TỔNG LỰC SPRINT 4 & ĐỐI SOÁT BẢNG TRELLO (FINAL SPRINT DEFENSE RUNBOOK)
**Dự án**: Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy (`traveleasy-platform`)  
**Đơn vị thực hiện**: OJT Đồ Án Nhóm 7  
**Giai đoạn**: Tuần 4 (Sprint 4 — Tuần Nước Rút & Nghiệm thu Bảo vệ OJT)  
**Thời hạn chốt nộp**: Cuối Tuần 4 (Code Freeze & Defense Ready)  
**Nhóm trưởng / System Architect**: Phạm Công Thành (`phamcongthanhvn2k6` / `thanhphmcong1`)  
**Quy mô kế hoạch Sprint 4 chuẩn hóa**: **8 User Stories & Technical Tasks cốt lõi — 28 Story Points (Chuẩn mực 1 tuần Scrum quốc tế)**  

---

## 1. BÁO CÁO ĐỐI SOÁT & TINH GỌN BACKLOG SPRINT 4 (RECONCILIATION & SCRUBBING)

### 1.1. Tinh gọn & Loại bỏ các tính năng ngoài phạm vi đề tài (Out of Scope)
Qua rà soát chuyên môn và đối chiếu với mục tiêu đề tài **"Nền tảng đặt vé xe khách liên tỉnh tuyến cố định"**, nhóm thống nhất loại bỏ các tính năng không thuộc nghiệp vụ cốt lõi để tránh loãng đề tài và áp lực bảo vệ:
- ❌ **Thuê xe Hợp đồng Du lịch (`/charter`) & Ký quỹ Escrow 30%** *(Cũ: S401, S409)*: Chuyển sang Product Roadmap tương lai (v2.0) vì đây là mô hình thuê xe tour du lịch, không thuộc tuyến cố định.
- ❌ **Ký gửi Hàng hóa Bưu kiện Hầm xe (`/cargo`)** *(Cũ: S406, S410)*: Chuyển sang Product Roadmap tương lai (v2.0) để tập trung 100% vào nghiệp vụ cốt lõi Hành khách, Bến xe & Nhà xe.
- ❌ **Tách nhỏ Support & Mobile-first** *(Cũ: S407, S408)*: Gộp vào tiêu chuẩn phi chức năng (Non-functional Quality Gate).

### 1.2. Bổ sung các tính năng cốt lõi bắt buộc cho vận hành thực tế
Bổ sung chính thức vào Sprint 4 các module sống còn đã và đang hoàn tất:
- ✅ **Đồng bộ Khóa ghế & Giữ chỗ Real-time 10 phút (SSE Concurrency Lock)**: Đã hoàn thiện, ngăn 100% rủi ro đặt trùng ghế trên toàn sàn.
- ✅ **Dịch vụ Email Tự Động Phê Duyệt Hồ Sơ Đối Tác & Cấp Phát Tài Khoản B2B (`/company/login`)**: Bàn giao tài khoản nhà xe có mật khẩu khởi tạo rõ ràng qua Google SMTP live.
- ✅ **Đóng gói Docker Compose Production & Triển khai CI/CD lên VPS (`103.72.57.149`)**: Đưa hệ thống lên môi trường thật có Nginx Reverse Proxy cổng 80 và kết nối Supabase Cloud.

---

## 2. PHÂN BỔ ĐIỂM STORY POINTS (SP) VÀ MA TRẬN RACI SPRINT 4 CHUẨN

### 2.1. Bảng phân bổ Story Points chuẩn Scrum (Tổng cộng: 28 SP)

| Mã Task | Phân hệ & Nghiệp vụ Trọng Tâm | Phụ trách (RACI) | Điểm SP | Trạng thái kỹ thuật thực tế |
| :--- | :--- | :---: | :---: | :--- |
| **`[S401]`** | **Khóa ghế Concurrency Lock 10:00 & Đồng bộ Sơ đồ ghế Real-time SSE** | **Phạm Thanh Phong** | **4 SP** | 🟢 **ĐÃ HOÀN THÀNH 100%** (Đã merge `origin/dev`) |
| **`[S402]`** | **Dịch vụ Email Tự Động Phê Duyệt Đối Tác & Cấp Tài Khoản Điều Hành** | **Phạm Công Thành** | **3 SP** | 🟡 **ĐANG HOÀN TẤT** (Đã gửi live tới `phamcongt56@gmail.com`) |
| **`[S403]`** | **Đóng Gói Docker Production & Triển Khai CI/CD Lên VPS Thực Tế** | **Phạm Công Thành** | **4 SP** | 🟡 **ĐANG HOÀN TẤT** (Container Backend & Frontend đã UP) |
| **`[S404]`** | **Giao diện & API Bán Vé Nhanh Tại Quầy Bến Xe POS (`/company/pos`)** | **Phạm Thanh Phong** | **4 SP** | 🔵 **SẴN SÀNG NGHIỆM THU** (In vé nhiệt 80mm có QR) |
| **`[S405]`** | **Quản Lý Ca Trực & Bàn Giao Tiền Mặt Quầy Bến Xe (`/company/pos/shifts`)** | **Nguyễn Đại Phát** | **3 SP** | 🔵 **SẴN SÀNG NGHIỆM THU** (Mở ca, kết ca Z-Report) |
| **`[S406]`** | **Bản Đồ GPS Live Tracking Xe Chạy Thời Gian Thực (`/tracking/:tripId`)** | **Đoàn Nhật Cường** | **4 SP** | 🔵 **SẴN SÀNG NGHIỆM THU** (Leaflet map + SSE stream) |
| **`[S407]`** | **Quản Trị Giá Vé Động & Phụ Thu Lễ Tết/Cuối Tuần (`/company/pricing-rules`)** | **Trần Minh Đức** | **3 SP** | 🔵 **SẴN SÀNG NGHIỆM THU** (Quy tắc phụ thu tự động) |
| **`[S408]`** | **Trung Tâm Trình Diễn Demo Hub 15 Phút (`/demo`) & Slide Bảo Vệ OJT** | **Phạm Công Thành** *(Lead)* | **3 SP** | 🟢 **ĐÃ HOÀN THÀNH 100%** (Demo Hub & kịch bản sẵn sàng) |
| **TỔNG CỘNG** | **8 User Stories & Technical Tasks Chuẩn Hóa** | **Toàn đội** | **28 SP** | **Cân bằng tải chuẩn mực 1 tuần nước rút** |

---

## 3. KỊCH BẢN TRÌNH DIỄN BẢO VỆ 15 PHÚT TRƯỚC HỘI ĐỒNG (15-MINUTE DEFENSE RUNBOOK)

| Thời gian | Nội dung trình bày | Người phụ trách | Hành động trực quan trên màn hình chiếu |
| :---: | :--- | :---: | :--- |
| **00:00 - 02:30**<br>*(2.5 phút)* | **Mở đầu & Kiến trúc Hệ thống**<br>- Giới thiệu Đề tài TravelEasy.<br>- Kiến trúc Modular Monolith, Supabase PostgreSQL.<br>- Bảng Trello 4 Sprint chuẩn Agile (28 SP Sprint 4). | **Phạm Công Thành**<br>*(Team Leader)* | - Mở trang `/demo` bấm nút **Kiểm tra Sức Khỏe Hệ Thống** (Show trạng thái UP, CSDL kết nối tốt, Memory < 256MB).<br>- Giới thiệu môi trường Production thực tế trên VPS `103.72.57.149`. |
| **02:30 - 06:30**<br>*(4.0 phút)* | **Luồng Khách hàng Đặt vé & Concurrency Lock**<br>- Tìm kiếm chuyến SWR Cache 0ms.<br>- Sơ đồ 34 ghế Limousine VIP 2 tầng.<br>- Cơ chế khóa ghế Concurrency Lock 10:00.<br>- Quét VietQR thanh toán tự động PayOS. | **Trần Minh Đức**<br>*(Customer Portal)* | - Thao tác tìm xe Sài Gòn $\rightarrow$ Đà Lạt.<br>- **Chọn ghế A01, mở song song tab ẩn danh chứng minh ghế A01 lập tức chuyển màu Vàng (Đang giữ chỗ) trên màn hình người khác**.<br>- Quét VietQR hoàn tất đặt vé, sinh vé điện tử có QR code. |
| **06:30 - 09:30**<br>*(3.0 phút)* | **Hiện trường Bến xe Thực tế**<br>- Quầy bán vé nhanh POS (`/company/pos`).<br>- In vé nhiệt cầm tay 80mm có mã QR bảo mật.<br>- Tài xế quét mã QR soát vé siêu tốc < 0.2s bằng camera điện thoại. | **Phạm Thanh Phong** & **Đoàn Nhật Cường** | - Phong mở `/company/pos`, dùng phím tắt F2 bán vé cho khách vãng lai, in hóa đơn nhiệt ra màn hình.<br>- Cường cầm điện thoại thật quét camera vào mã QR vé vừa in $\rightarrow$ Hệ thống lập tức "Tít" xanh và cập nhật vé sang trạng thái `ĐÃ LÊN XE`. |
| **09:30 - 12:00**<br>*(2.5 phút)* | **Nghiệp vụ Đối tác B2B & Vận hành**<br>- Luồng đối tác nộp hồ sơ KYB.<br>- Admin duyệt và **hệ thống tự động gửi Email HTML bàn giao tài khoản**.<br>- Bản đồ GPS Live Tracking xe chạy thời gian thực (`/tracking`). | **Nguyễn Đại Phát** & **Phạm Công Thành** | - Phát mở Quản lý nhà xe duyệt đơn.<br>- Thành show hộp thư Gmail nhận thư chúc mừng có mật khẩu khởi tạo và nút đăng nhập thẳng vào Cổng Đối tác `/company/login`. |
| **12:00 - 15:00**<br>*(3.0 phút)* | **Tổng kết Hạ tầng CI/CD, Đối soát & Q&A**<br>- Báo cáo Docker Compose trên VPS.<br>- Đối soát hoa hồng 8%-10% bất biến.<br>- Đón nhận câu hỏi phản biện từ Hội đồng. | **Phạm Công Thành** & Toàn đội | - Chiếu báo cáo deploy VPS, log giao dịch và trả lời câu hỏi chuyên sâu từ các Thầy Cô trong Hội đồng. |

---

## 4. BỘ SẢN PHẨM BÀN GIAO NGHIỆM THU (FINAL DELIVERABLES)
1. 📂 **Mã nguồn hoàn chỉnh**: Nhánh `main` sạch sẽ, gắn tag `v1.0.0-production`.
2. 🐳 **Gói Docker triển khai**: `docker-compose.prod.yml` chạy trên VPS `103.72.57.149`.
3. 📑 **Hồ sơ kỹ thuật**: Kiến trúc hệ thống, Báo cáo kiểm thử E2E, Sổ tay vận hành Runbook.
4. 📊 **Slide thuyết trình bảo vệ**: 25 slides chuẩn nhận diện thương hiệu TravelEasy.
5. 🎥 **Video Demo Backup**: Video 7 phút full HD phòng trường hợp sự cố mạng tại bến xe/hội trường.

---
*Kế hoạch đã được rà soát, tinh gọn và phê duyệt bởi Nhóm trưởng Phạm Công Thành để đảm bảo đạt điểm số tuyệt đối tại buổi bảo vệ OJT.*
