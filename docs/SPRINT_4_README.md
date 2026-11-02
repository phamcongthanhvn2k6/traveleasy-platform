# 📕 SPRINT 4 README — VẬN HÀNH SẴN SÀNG SẢN XUẤT, KỊCH BẢN BẢO VỆ OJT & LỘ TRÌNH MỞ RỘNG
> **Dự án:** Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy  
> **Đơn vị:** OJT Đồ Án Nhóm 7  
> **Thời gian thực hiện:** Tuần 7 - Tuần 8 (Sprint Cuối & Nghiệm thu Bảo vệ)  
> **Trạng thái:** 🎯 **FINAL SPRINT & ROADMAP (Sẵn sàng nghiệm thu)**  
> **Trọng tâm:** Bàn giao vận hành, Kịch bản Demo Hội đồng & Hệ sinh thái mở rộng sát thực tế bến xe  

---

## 🎯 1. MỤC TIÊU SPRINT (SPRINT GOAL)
Đóng gói toàn bộ nền tảng vào trạng thái sẵn sàng phát hành sản xuất (Production Readiness), hoàn thiện tài liệu hướng dẫn vận hành (Operations Runbook), xây dựng trung tâm trình diễn tự động hóa (Demo Hub 15 phút) phục vụ buổi báo cáo bảo vệ tốt nghiệp OJT, và hiện thực hóa lộ trình các phân hệ nâng cao bám sát 100% nghiệp vụ thực tế tại các bến xe lớn (Bến xe Miền Đông, Bến xe Miền Tây, Mỹ Đình, Giáp Bát): **Phân hệ Quầy vé Bến xe của Nhà xe (`/company/pos`), Dịch vụ Thuê xe Hợp đồng Du lịch (`/charter`), Ký gửi hàng hóa bưu kiện (`/cargo`), và Bản đồ GPS Live Tracking thời gian thực (`/tracking/:tripId`)**.

---

## 👥 2. PHÂN CÔNG THÀNH VIÊN TRONG GIAI ĐOẠN CUỐI & NÂNG CẤP (RACI)

*(Nguyên tắc phân công chuẩn OJT: **Phạm Công Thành** giữ vai trò Tổng công trình sư / System Architect, review mã nguồn, hạ tầng Docker và tài liệu kiến trúc, **0 nhận task code mới**; 4 thành viên còn lại chia đều các module)*:

| Thành viên | Vai trò | Trọng tâm Sprint 4 & Lộ trình mở rộng thực tế |
|:---|:---|:---|
| **Phạm Công Thành** | Team Leader & System Architect | Bàn giao tài liệu kiến trúc tổng thể, đóng gói Docker Compose Production, hỗ trợ kỹ thuật tối ưu hóa CSDL và trình bày phần Kiến trúc hệ thống trước Hội đồng. |
| **Nguyễn Đại Phát** | Admin Lead & Full-Stack | Hoàn thiện tài liệu nghiệm thu Cổng Admin; Phụ trách: **Giám sát hợp đồng thuê xe & Ký quỹ an toàn Escrow 30% (`/admin/charters`)** và **Trang Quản trị giá vé động & Flash Sale giờ chót (`/company/pricing-rules`)**. |
| **Phạm Thanh Phong** | Core Booking & Seat Engine | Hoàn thiện tài liệu tối ưu hiệu năng Booking; Phụ trách: **Phân hệ Bán vé nhanh tại Quầy bến xe của Nhà xe (`/company/pos`)**, **Quản lý đóng/mở ca trực & Tiền mặt (`/company/pos/shifts`)**, **Backend GPS Live Tracking SSE (`/api/v1/tracking`)**, **Backend Động cơ tính cước gửi bưu kiện (`/api/v1/cargo`)**. |
| **Đoàn Nhật Cường** | Mobile Specialist | Hoàn thiện tài liệu và video demo Soát vé QR di động; Phụ trách: **Frontend Bản đồ GPS Live Tracking xe chạy thời gian thực (`/tracking/:tripId`)**, **Trang Trung tâm cứu hộ & CSKH khẩn cấp 24/7 (`/support`)**. |
| **Trần Minh Đức** | Customer Portal | Hoàn thiện tài liệu quy trình hoàn hủy vé; Phụ trách: **Trang Đặt xe hợp đồng du lịch (`/charter`)**, **Frontend Ký gửi bưu kiện & Tra cứu vận đơn (`/cargo`)**, **Trang Bảo hiểm chuyến đi (`/insurance`)**, **Ví điểm thưởng EasyXu & Vòng quay may mắn (`/rewards`)**. |
| **Phan Trung Kiên** | Thành viên | Miễn thực tập OJT (Exempted) theo quyết định đào tạo. |

---

## 📋 3. CHI TIẾT CÁC PHÂN HỆ NÂNG CẤP SÁT NGHIỆP VỤ THỰC TẾ

### 3.1. Phân hệ Bán vé Nhanh tại Quầy Bến xe của Nhà xe (`/company/pos`)
* **Bối cảnh thực tế:** Các nhà xe lớn (Phương Trang, Thành Bưởi, Sao Việt...) đều thuê quầy vé tại bến xe (BXMĐ, Mỹ Đình...) và bố trí **nhân viên của chính nhà xe** ra trực quầy bán vé cho khách vãng lai/người lớn tuổi. Không sử dụng role "Agent trung gian" phi thực tế.
* **Chức năng nghiệp vụ:**
  * **Giao diện POS siêu tốc:** Tối ưu thao tác bằng phím tắt (F1-F9), nhân viên quầy chọn chuyến ➔ click chọn ghế ➔ nhập SĐT/Tên khách ➔ chọn thanh toán **`Tiền mặt (CASH)`** hoặc **`Quét VietQR tại quầy`** ➔ Xuất vé chỉ trong **3 cú click chuột (dưới 10 giây)**.
  * **In vé nhiệt hóa đơn cầm tay (80mm):** Gửi lệnh in trực tiếp ra máy in bill nhiệt bến xe, nhả vé giấy có đầy đủ: Thông tin chuyến, biển số xe, số ghế, hướng dẫn lên xe và **Mã QR vé bảo mật** để tài xế quét soát vé.
  * **Đồng bộ khóa ghế thời gian thực (Real-time Concurrency):** Ghế nhân viên bán tại quầy ngay lập tức chuyển sang trạng thái `ĐÃ BÁN` trên Web/App của khách hàng, loại bỏ 100% rủi ro trùng ghế.
  * **Quản lý Ca trực & Đối soát tiền mặt (`/company/pos/shifts`):** Khởi tạo ca với số tiền lẻ đầu ca, theo dõi tổng tiền mặt thu được trong ca, bấm **Kết ca (Z-Report)** in phiếu tổng kết để nộp tiền lại cho thủ quỹ nhà xe.

---

### 3.2. Dịch vụ Thuê Xe Hợp đồng Du lịch Đa Kênh (`/charter`)
* **Kênh 1 — Khách đặt trực tuyến (`/charter`):**
  * Khách hàng cá nhân hoặc doanh nghiệp nhập lộ trình (VD: Sài Gòn ⇄ Vũng Tàu 2 ngày 1 đêm), chọn loại xe (16, 29, 45 chỗ), tiện ích kèm theo ➔ Hệ thống gợi ý mức giá ước tính theo km.
* **Kênh 2 — Khách hỏi thuê trực tiếp tại Quầy bến xe (`/company/pos/charter`):**
  * Khách đoàn đến trực tiếp quầy vé của nhà xe tại bến hỏi thuê xe đi tour. Nhân viên quầy mở tab Hợp đồng, kiểm tra lịch xe trống của nhà xe mình trong ngày đó, báo giá và in **Phiếu giữ xe hợp đồng** cho khách ngay tại quầy.
* **Sàn đấu giá báo giá cạnh tranh (`/company/charter-bids`):**
  * Các nhà xe nhận thông báo có yêu cầu thuê xe trong khu vực ➔ Gửi báo giá trọn gói kèm hình ảnh xe thực tế và thông tin tài xế để khách lựa chọn.
* **Ký quỹ giữ cọc an toàn (Escrow Payment 30% tại `/admin/charters`):**
  * Sàn TravelEasy đứng giữa giữ 30% tiền cọc của khách hàng, chỉ giải ngân cho Nhà xe sau khi chuyến đi hoàn thành an toàn, bảo vệ khách hàng khỏi tình trạng bị "bỏ rơi" hoặc tráo xe cũ.

---

### 3.3. Bản đồ Định vị GPS Live Tracking Thời gian thực (`/tracking/:tripId`)
* **Frontend (`/tracking/:tripId`):** Tích hợp bản đồ vệ tinh tương tác (Leaflet/Mapbox), hiển thị icon xe khách di chuyển mượt mà trên tuyến đường, các trạm dừng đón/trả và ước tính thời gian xe đến đón (ETA).
* **Backend SSE (`/api/v1/tracking`):** Sử dụng giao thức **Server-Sent Events (SSE)** truyền tọa độ GPS theo thời gian thực về trình duyệt hành khách với độ trễ < 1 giây, tiết kiệm 90% băng thông so với cơ chế polling liên tục.

---

### 3.4. Dịch vụ Ký gửi Hàng hóa Bưu kiện Theo Xe Khách (`/cargo`)
* **Frontend Khách hàng (`/cargo`):** Nhập kích thước, trọng lượng, loại hàng (giấy tờ, bưu phẩm, hoa quả, xe máy) ➔ Tự động tính cước ➔ Sinh mã vận đơn bưu kiện kèm **Tem nhãn QR dán kiện hàng**.
* **Phía Nhà xe (`/company/cargo`):** Nhân viên quầy bến xe tiếp nhận hàng, xếp vào hầm xe, xác nhận giao hàng cho người nhận bằng mã OTP SMS tại bến đích.

---

### 3.5. Quản trị Giá vé Động & Gamification (`/company/pricing-rules` & `/rewards`)
* **Giá vé động linh hoạt:** Tự động phụ thu +20% dịp Lễ Tết/cuối tuần; giảm giá Flash Sale -15% khi xe sắp xuất bến trong 2 giờ mà tỷ lệ trống > 50%.
* **Ví EasyXu & Vòng quay may mắn:** Tích 2% giá trị vé thành EasyXu trừ tiền lần sau; Vòng quay may mắn tặng voucher giảm giá 10% - 30% giữ chân khách hàng.

---

## 🎬 4. KỊCH BẢN TRÌNH DIỄN BẢO VỆ OJT 15 PHÚT (`/demo`)
Xây dựng trang tổng quan Demo Hub `/demo` hỗ trợ Hội đồng chấm thi chuyển nhanh giữa các phân hệ:
* **Phút 01 - 03:** Giới thiệu bài toán, kiến trúc Modular Monolith và CSDL 36 bảng chuẩn hóa.
* **Phút 04 - 07:** Demo luồng khách hàng: Tìm kiếm ➔ Chọn ghế Limousine VIP ➔ Khóa ghế 10:00 phút ➔ Quét VietQR thanh toán ➔ Nhận vé điện tử.
* **Phút 08 - 10:** Demo hiện trường bến xe: Nhân viên nhà xe bán vé quầy POS (`/company/pos`), in vé nhiệt mã QR; tài xế dùng camera điện thoại quét soát vé trong 0.2s (`/scanner`).
* **Phút 11 - 13:** Demo các tính năng mở rộng: Bản đồ GPS xe chạy thời gian thực (`/tracking`), gửi hàng bưu phẩm (`/cargo`) và thuê xe hợp đồng (`/charter`).
* **Phút 14 - 15:** Trình bày giải pháp chịu tải Concurrency Lock, Correlation ID tracing và trả lời câu hỏi phản biện của Hội đồng.

---

## 📦 5. SẢN PHẨM BÀN GIAO (DELIVERABLES)
1. Bộ tài liệu hoàn chỉnh: Sổ tay người dùng `USER_MANUAL.md`, Sổ tay vận hành `OPERATIONS_RUNBOOK.md`, Kế hoạch bảo vệ `KE_HOACH_THIET_KE_CONG_VIEC_VA_KICH_BAN_BAO_VE_OJT.md`.
2. Kịch bản và dữ liệu mẫu phục vụ trình diễn tại trang `/demo`.
3. Toàn bộ mã nguồn trên nhánh `dev` và `main` được gắn thẻ Release Tag `v1.0.0-production`.
4. Báo cáo tổng kết đồ án OJT và slide thuyết trình bảo vệ.

---

## 🏆 6. TIÊU CHÍ NGHIỆM THU TỐT NGHIỆP (DoD)
- ✅ Hệ thống vận hành trơn tru trong suốt 15 phút demo trước Hội đồng, không phát sinh lỗi bất ngờ.
- ✅ Tất cả thành viên trả lời đúng và sâu sắc về phân hệ mình phụ trách theo ma trận RACI.
- ✅ Đầy đủ minh chứng: Mã nguồn sạch, bảng Trello chuẩn chỉ, CSDL chuẩn hóa, tài liệu kỹ thuật chuyên nghiệp.
- ✅ Đạt điểm tối đa theo thang tiêu chí đánh giá đồ án OJT của Nhà trường và Doanh nghiệp.
