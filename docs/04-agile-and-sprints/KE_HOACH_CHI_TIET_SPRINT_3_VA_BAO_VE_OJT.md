# 🎯 KẾ HOẠCH TỔNG LỰC SPRINT 3 & KỊCH BẢN BẢO VỆ ĐỒ ÁN OJT (DEFENSE RUNBOOK)
**Dự án**: Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy (`traveleasy-platform`)  
**Đơn vị thực hiện**: OJT Đồ Án Tốt Nghiệp Nhóm 7 — FPT Polytechnic  
**Giai đoạn**: Sprint 3 (Nâng cao Năng Lực Vận Hành & Hoàn Thiện Sản Phẩm Nghiệm Thu)  
**Nhóm trưởng / System Architect**: Phạm Công Thành (`phamcongthanhvn2k6`)  
**Quy mô kế hoạch Sprint 3 chuẩn hóa**: **16 User Stories & Technical Tasks — 42 Story Points — 04 Thành viên OJT Active**  

---

## 1. TỔNG QUAN PHÂN BỔ STORY POINTS & MA TRẬN TRÁCH NHIỆM RACI

| Mã Task | Tên Tính Năng & Nghiệp Vụ Trọng Tâm | Phụ trách (RACI) | Điểm SP | Trạng thái kỹ thuật & File phụ trách |
| :--- | :--- | :---: | :---: | :--- |
| **`[S301]`** | **Khóa ghế Concurrency Lock 10:00 & Giữ chỗ Real-time SSE** | **Phạm Công Thành** | **4 SP** | 🟡 `In Progress` (`SeatLockEngine`, Supabase Lock) |
| **`[S310]`** | **Dashboard Báo Cáo Doanh Thu & Tỷ Lệ Lấp Đầy Chuyến Xe** | **Phạm Công Thành** | **3 SP** | 🔵 `To Do` (`/company/dashboard`) |
| **`[S311]`** | **Đối Soát Doanh Số Bán Vé Định Kỳ & Quản Lý Ví Nhà Xe** | **Phạm Công Thành** | **3 SP** | 🔵 `To Do` (`/company/settlements`) |
| **`[S307]`** | **Cơ Chế Thiết Lập Giá Vé Động (Dynamic Pricing Engine)** | **Trần Minh Đức** | **3 SP** | 🔵 `To Do` (`/company/pricing-rules`) |
| **`[S316]`** | **Nghiệp Vụ Đổi Vé & Chuyển Chuyến Xe Khách** | **Trần Minh Đức** | **3 SP** | 🔵 `To Do` (`TicketExchangePage.tsx`, `ticket_exchange_logs`) |
| **`[S317]`** | **Quản Lý Đón Trả Trung Chuyển Hành Khách Tận Nơi** | **Trần Minh Đức** | **3 SP** | 🔵 `To Do` (`ShuttleManagementPage.tsx`, `shuttle_requests`) |
| **`[S318]`** | **Sổ Chi Phí Vận Hành Chuyến & Báo Cáo Lãi Lỗ (P&L)** | **Trần Minh Đức** | **2 SP** | 🔵 `To Do` (`TripExpensesPage.tsx`, `trip_expenses`) |
| **`[S305]`** | **Quản Lý Ca Trực Bán Vé POS & Kết Ca Nộp Tiền Mặt** | **Đoàn Nhật Cường** | **3 SP** | 🔵 `To Do` (`/company/shifts`, `pos_shifts`) |
| **`[S315]`** | **Code Review & Tối Ưu Hóa Hiệu Năng Truy Vấn CSDL** | **Đoàn Nhật Cường** | **2 SP** | 🔵 `To Do` (PostgreSQL Index, Query Tuning) |
| **`[S319]`** | **Phân Công Tổ Lái & Kiểm Tra Điều Kiện Xuất Bến** | **Đoàn Nhật Cường** | **3 SP** | 🔵 `To Do` (`TripCrewPage.tsx`, `trip_crews`) |
| **`[S320]`** | **WebApp Quét QR Soát Vé & Điểm Danh Hành Khách Lên Xe** | **Đoàn Nhật Cường** | **3 SP** | 🔵 `To Do` (`QrTicketScannerPage.tsx`, Conductor Scanner) |
| **`[S313]`** | **Tích Hợp Cổng Thanh Toán Tự Động & Xử Lý Webhook** | **Nguyễn Đại Phát** | **3 SP** | 🔵 `To Do` (VietQR Webhook, Idempotency Service) |
| **`[S314]`** | **Kiểm Thử Hồi Quy & Tích Hợp Toàn Bộ Luồng Thanh Toán** | **Nguyễn Đại Phát** | **2 SP** | 🔵 `To Do` (`S313ApiIntegrationTest.java`) |
| **`[S321]`** | **Thiết Lập Chính Sách Phí Hoàn Hủy & Xử Lý Yêu Cầu Hủy Vé** | **Nguyễn Đại Phát** | **3 SP** | 🔵 `To Do` (`CancellationRefundPage.tsx`, `cancellation_rules`) |
| **`[S322]`** | **Xuất PDF/Excel Lệnh Vận Chuyển Điện Tử Chuẩn Bộ GTVT** | **Nguyễn Đại Phát** | **2 SP** | 🔵 `To Do` (`PdfExportService`, GTVT Manifest) |
| **`[S323]`** | **Kịch Bản E2E Test & Kiểm Thử Tích Hợp Ca Trực POS + Webhook** | **Nguyễn Đại Phát** | **2 SP** | 🔵 `To Do` (E2E Test Collection) |
| **TỔNG** | **16 Tasks Chuẩn Hóa Theo Định Mức Scrum** | **4 Thành viên** | **42 SP** | **Phân chia đồng đều: Thành 10, Đức 11, Cường 11, Phát 10** |

---

## 2. KỊCH BẢN TRÌNH DIỄN BẢO VỆ 15 PHÚT TRƯỚC HỘI ĐỒNG OJT

Kịch bản trình diễn được thiết kế liền mạch theo dòng chảy thực tế của một chuyến xe từ lúc khách đặt vé đến khi xe hoàn thành lộ trình:

| Mốc thời gian | Phân đoạn & Nghiệp vụ trình diễn | Thành viên phụ trách | Thao tác trực quan trên màn hình chiếu |
| :---: | :--- | :---: | :--- |
| **00:00 - 02:30**<br>*(2.5 phút)* | **Mở đầu & Báo cáo Kiến trúc Tổng thể**<br>- Giới thiệu đề tài TravelEasy.<br>- Kiến trúc Modular Monolith, Supabase PostgreSQL, Redis Lock.<br>- Báo cáo phân công công việc 3 Sprint chuẩn Agile/Scrum. | **Phạm Công Thành**<br>*(Team Leader)* | - Trình chiếu Dashboard quản trị hệ thống.<br>- Show trạng thái các dịch vụ Backend Spring Boot, Frontend React Vite và kết nối Supabase Cloud. |
| **02:30 - 05:30**<br>*(3.0 phút)* | **Trải Nghiệm Khách Hàng & Khóa Ghế Concurrency Lock**<br>- Cơ chế khóa ghế 10:00 chống trùng vé đa luồng thời gian thực.<br>- Thanh toán tự động qua Webhook VietQR/VNPay. | **Phạm Công Thành** & **Nguyễn Đại Phát** | - Mở 2 trình duyệt song song cùng chọn ghế A01 chuyến 696: Tab A chọn thành công có đồng hồ đếm ngược, Tab B lập tức đổi màu Vàng (Đang giữ chỗ) qua SSE.<br>- Phát mô phỏng Webhook thanh toán thành công, vé lập tức chuyển sang trạng thái ĐÃ XUẤT. |
| **05:30 - 08:30**<br>*(3.0 phút)* | **Nghiệp Vụ Đổi Chuyến, Giá Động & Đón Trả Trung Chuyển**<br>- Xử lý đổi vé sang chuyến mới & phụ thu giá vé.<br>- Phân bổ tài xế xe trung chuyển đón khách tận nhà. | **Trần Minh Đức** | - Minh họa thao tác khách đổi từ vé thường sang vé VIP trên trang `/company/ticket-exchange`: tính phí phụ thu, cấp mã vé mới và giải phóng ghế cũ.<br>- Mở trang `/company/shuttles` phân tài xế gom khách đón tận nơi tại Quận 1. |
| **08:30 - 11:30**<br>*(3.0 phút)* | **Hiện Trường Bến Xe: Tổ Lái, Kiểm Tra Cồn & Soát Vé QR**<br>- Phân công tài xế, kiểm tra cồn 0.00 mg/L trước khi xuất bến.<br>- WebApp di động cho phụ xe quét mã QR soát vé tại cửa xe. | **Đoàn Nhật Cường** | - Mở `/company/crew`: Gán tài xế, nhập kết quả test cồn 0.00 mg/L để ký lệnh xuất bến.<br>- Cầm điện thoại mở `/conductor/scanner` quét mã QR vé vừa xuất $\rightarrow$ Hệ thống phát âm thanh "Ting" xanh, đổi trạng thái ĐÃ LÊN XE. |
| **11:30 - 13:30**<br>*(2.0 phút)* | **Tài Chính Vận Hành: Sổ Chi Phí P&L & Lệnh GTVT**<br>- Nhập chi phí xăng dầu, BOT để tính lãi/lỗ chuyến xe.<br>- Xuất file PDF Lệnh Vận Chuyển chuẩn Bộ Giao thông Vận tải. | **Trần Minh Đức** & **Nguyễn Đại Phát** | - Mở `/company/expenses`: Kê khai tiền xăng 1.2tr, hệ thống tính lợi nhuận ròng chuyến xe là +3.12tr.<br>- Bấm xuất PDF Lệnh Vận Chuyển Bộ GTVT có đầy đủ danh sách 34 hành khách và thông tin tổ lái. |
| **13:30 - 15:00**<br>*(1.5 phút)* | **Tổng Kết & Trả Lời Phản Biện Hội Đồng**<br>- Báo cáo đối soát hoa hồng sàn và ví nhà xe.<br>- Đón nhận câu hỏi đánh giá từ Thầy Cô Hội đồng. | **Cả 4 thành viên** | - Mở `/company/settlements` show lịch sử đối soát và sẵn sàng trả lời các câu hỏi kỹ thuật. |

---

## 3. BẢNG TIÊU CHÍ CHẤT LƯỢNG NGHIỆM THU (QUALITY GATES)

1. **Code Isolation 100%**: Mỗi thành viên làm việc độc lập trên Controller, Service, DTO và Page riêng biệt, không chạm vào code của nhau.
2. **Build Pass 100%**: Cả backend (`./gradlew compileJava`) và frontend (`npm run build`) luôn ở trạng thái pass tại mọi commit trên nhánh `dev`.
3. **Data Integrity**: Bảng dữ liệu có ràng buộc khóa ngoại, transaction `@Transactional` chặt chẽ, không sinh ra dữ liệu mồ côi khi hủy vé hoặc đổi chuyến.
