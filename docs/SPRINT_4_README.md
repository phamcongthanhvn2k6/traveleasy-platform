# 📕 SPRINT 4 README — VẬN HÀNH SẴN SÀNG SẢN XUẤT, KỊCH BẢN BẢO VỆ OJT & LỘ TRÌNH MỞ RỘNG
> **Dự án:** Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy  
> **Đơn vị:** OJT Đồ Án Nhóm 7  
> **Thời gian thực hiện:** Tuần 7 - Tuần 8 (Sprint Cuối & Nghiệm thu Bảo vệ)  
> **Trạng thái:** 🎯 **FINAL SPRINT & ROADMAP (Sẵn sàng nghiệm thu)**  
> **Trọng tâm:** Bàn giao vận hành, Kịch bản Demo Hội đồng & Lộ trình mở rộng 10 tính năng mới  

---

## 🎯 1. MỤC TIÊU SPRINT (SPRINT GOAL)
Đóng gói toàn bộ nền tảng vào trạng thái sẵn sàng phát hành sản xuất (Production Readiness), hoàn thiện tài liệu hướng dẫn vận hành (Operations Runbook), xây dựng trung tâm trình diễn tự động hóa (Demo Hub 15 phút) phục vụ buổi báo cáo bảo vệ tốt nghiệp OJT, và hoạch định lộ trình 10 tính năng mở rộng nâng cấp giá trị thương mại cho hệ thống.

---

## 👥 2. PHÂN CÔNG THÀNH VIÊN TRONG GIAI ĐOẠN CUỐI & NÂNG CẤP (RACI)

*(Quy tắc đặc thù: Phạm Công Thành không nhận task mới do đã gánh toàn bộ kiến trúc lõi và 10 trang nhà xe; 4 thành viên còn lại chia đều các module mở rộng)*:

| Thành viên | Vai trò | Trọng tâm Sprint 4 & Lộ trình mở rộng |
|:---|:---|:---|
| **Phạm Công Thành** | Team Leader & System Architect | Bàn giao tài liệu kiến trúc, đóng gói Docker hoàn chỉnh, hỗ trợ kỹ thuật và trình bày phần Kiến trúc hệ thống trong buổi bảo vệ. |
| **Nguyễn Đại Phát** | Admin Lead & Full-Stack | Hoàn thiện tài liệu nghiệm thu Cổng Admin; Phụ trách 2 module mở rộng: **Trang Thuê xe hợp đồng du lịch (`/charter`)** và **Trang Quản trị giá vé động & Flash Sale (`/company/pricing-rules`)**. |
| **Phạm Thanh Phong** | Core Booking & Seat Engine | Hoàn thiện tài liệu tối ưu hiệu năng Booking; Phụ trách 3 module mở rộng: **Trang Cổng Đại lý vé (`/agent/portal`)**, **Backend GPS Live Tracking SSE (`/api/v1/tracking`)**, **Backend Tính cước gửi hàng bưu kiện (`/api/v1/cargo`)**. |
| **Đoàn Nhật Cường** | Mobile Specialist | Hoàn thiện tài liệu và video demo tính năng Soát vé QR di động; Phụ trách 2 module mở rộng: **Trang Trung tâm cứu hộ & CSKH 24/7 (`/support`)**, **Frontend Bản đồ GPS Live Tracking (`/tracking/:tripId`)**. |
| **Trần Minh Đức** | Customer Portal | Hoàn thiện tài liệu quy trình hoàn hủy vé; Phụ trách 3 module mở rộng: **Trang Bảo hiểm chuyến đi (`/insurance`)**, **Frontend Gửi bưu kiện & Tra cứu vận đơn (`/cargo`)**, **Ví điểm thưởng EasyXu & Vòng quay may mắn (`/rewards`)**. |
| **Phan Trung Kiên** | Thành viên | Miễn thực tập OJT (Exempted) theo quyết định đào tạo. |

---

## 📋 3. PHẠM VI & HẠNG MỤC CÔNG VIỆC CHÍNH

### 3.1. Kịch bản Trình diễn Bảo vệ OJT 15 Phút (`/demo`)
- Xây dựng trang tổng quan Demo Hub `/demo` hỗ trợ Hội đồng chấm thi chuyển nhanh giữa các phân hệ:
  * **Phút 01 - 03:** Giới thiệu bài toán, kiến trúc Modular Monolith và mô hình CSDL 36 bảng.
  * **Phút 04 - 07:** Demo luồng khách hàng: Tìm kiếm chuyến xe ➔ Chọn ghế Limousine VIP ➔ Khóa ghế 10 phút ➔ Quét mã VietQR thanh toán ➔ Nhận vé điện tử.
  * **Phút 08 - 10:** Demo soát vé di động: Dùng camera điện thoại quét mã QR vé tại bến xe trong 0.2 giây.
  * **Phút 11 - 13:** Demo Cổng Đối tác Nhà xe (`/company`) và Cổng Quản trị Sàn (`/admin`): Báo cáo doanh thu và đối soát 10%.
  * **Phút 14 - 15:** Trình bày giải pháp chịu tải (Concurrency Lock), mã truy vết phân tán `Correlation-Id` và phần hỏi đáp với Hội đồng.

### 3.2. Sổ tay Vận hành & Phục hồi Sự cố (Operations Runbook)
- Cẩm nang tài liệu chi tiết tại `docs/OPERATIONS_RUNBOOK.md`:
  * Hướng dẫn khởi động khẩn cấp và restart các dịch vụ bằng Docker.
  * Quy trình sao lưu (Backup) và phục hồi (Restore) CSDL Supabase khi gặp sự cố dữ liệu.
  * Quy trình đối soát tiền mặt định kỳ giữa Sàn và các Nhà xe đối tác.
  * Hướng dẫn xử lý khiếu nại khách hàng và hủy vé hoàn tiền khẩn cấp.

### 3.3. Lộ trình Nâng cấp 10 Tính năng Mới (Post-MVP Roadmap)
Chi tiết tại tài liệu `docs/KE_HOACH_NANG_CAP_TINH_NANG_VA_TRANG_MOI.md`:
1. `/charter` — Đặt trọn gói xe du lịch có tài xế riêng.
2. `/company/pricing-rules` — Cấu hình giá tự động tăng/giảm theo ngày lễ hoặc giờ vàng.
3. `/agent/portal` — Cổng xuất vé riêng cho đại lý bán vé tại bến.
4. `/api/v1/tracking` & `/tracking/:tripId` — Định vị vị trí xe bus theo thời gian thực trên bản đồ vệ tinh.
5. `/api/v1/cargo` & `/cargo` — Dịch vụ gửi hàng hóa, bưu kiện theo xe khách liên tỉnh.
6. `/insurance` — Tích hợp gói bảo hiểm tai nạn chuyến đi 10.000đ/vé.
7. `/support` — Trung tâm hỗ trợ trực tuyến kết hợp AI tư vấn lịch trình.
8. `/rewards` — Tích điểm đổi quà EasyXu và trò chơi vòng quay may mắn giữ chân khách hàng.

---

## 📦 4. SẢN PHẨM BÀN GIAO (DELIVERABLES)
1. Bộ tài liệu hoàn chỉnh: Sổ tay người dùng `USER_MANUAL.md`, Sổ tay vận hành `OPERATIONS_RUNBOOK.md`, Kế hoạch bảo vệ `KE_HOACH_THIET_KE_CONG_VIEC_VA_KICH_BAN_BAO_VE_OJT.md`.
2. Kịch bản và dữ liệu mẫu phục vụ trình diễn tại trang `/demo`.
3. Toàn bộ mã nguồn trên nhánh `dev` và `main` được gắn thẻ Release Tag `v1.0.0-production`.
4. Báo cáo tổng kết đồ án OJT và slide thuyết trình bảo vệ.

---

## 🏆 5. TIÊU CHÍ NGHIỆM THU TỐT NGHIỆP (DoD)
- ✅ Hệ thống vận hành trơn tru trong suốt 15 phút demo trước Hội đồng, không phát sinh lỗi bất ngờ.
- ✅ Tất cả thành viên trả lời đúng và sâu sắc về phân hệ mình phụ trách theo ma trận RACI.
- ✅ Đầy đủ minh chứng: Mã nguồn sạch, bảng Trello chuẩn chỉ, CSDL chuẩn hóa, tài liệu kỹ thuật chuyên nghiệp.
- ✅ Đạt điểm tối đa theo thang tiêu chí đánh giá đồ án OJT của Nhà trường và Doanh nghiệp.

