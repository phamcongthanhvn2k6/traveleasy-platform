# 🚀 KẾ HOẠCH NÂNG CẤP TÍNH NĂNG MỞ RỘNG & CÁC TRANG CHỨC NĂNG MỚI (POST-MVP ROADMAP)
> **Dự án:** Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy  
> **Khung chương trình OJT:** 4 Sprint tuần tự (Sprint 1, 2, 3, 4) — **Sprint 4 là Sprint cuối cùng của đồ án**  
> **Chính sách phân bổ công việc nâng cấp:**
> * **Phạm Công Thành (Nhóm trưởng / System Architect)**: **0 task mới** *(Đã hoàn thành khối lượng lớn nhất: Core Architecture, Cổng Nhà Xe 10 trang, CSDL 36 bảng, Docker, CI/CD, Tracing, Health Monitoring)*.
> * **Phân chia cho 4 thành viên còn lại**: **Nguyễn Đại Phát**, **Phạm Thanh Phong**, **Đoàn Nhật Cường**, **Trần Minh Đức**.
> * *(Phan Trung Kiên: Miễn thực tập OJT theo quy định đào tạo)*.

---

## 📊 1. TỔNG KẾT 4 SPRINT HOÀN THÀNH (100% DONE TRÊN TRELLO)

Bảng Trello Live: [TravelEasy_Platform | Trello Board](https://trello.com/b/AA5BYoe1/traveleasyplatform)

| Sprint | Trọng Tâm Nghiệp Vụ | Số Lượng Thẻ | Story Points (SP) | Trạng Thái Live |
|:---:|---|:---:|:---:|:---:|
| **Sprint 1** | **Foundation & Master Data**: Kiến trúc Modular Monolith, CSDL 36 bảng Supabase Cloud, Stateless JWT Bearer RBAC 3 vai trò, Docker Compose & Master Data bến xe | **38 Thẻ** | **69 SP** | **`Done Sprint 1` (100%)** |
| **Sprint 2** | **Core Booking & Portals Engine**: Đặt vé thời gian thực, Sơ đồ 34 VIP 2 tầng, Khóa giữ chỗ Pessimistic Lock 10:00, Thanh toán đa kênh VietQR/VNPAY Serializable, Cổng Nhà xe 10 trang, Cổng Admin 10 trang | **38 Thẻ** | **74 SP** | **`Done Sprint 2` (100%)** *(Đều & cân đối bằng Sprint 1)* |
| **Sprint 3** | **Integration Testing & Real-time Check-in**: Kiểm thử tích hợp liên cổng E2E, Hợp đồng API, Tra cứu vé Offline LocalStorage, Soát vé QR Camera trong 0.2s, Kiểm duyệt đánh giá & Trợ lý AI du lịch | **40 Thẻ** | **120 SP** | **`Done Sprint 3` (100%)** |
| **Sprint 4** | **Production Readiness & Final Defense**: Giám sát Micro-Core (`/health`, `/health/readiness`), Correlation ID Tracing (`X-Correlation-Id`), Tối ưu độ trễ, Kịch bản Demo Hub 15' (`/demo`), Sổ tay vận hành Runbook *(Sprint cuối đồ án)* | **44 Thẻ** | **220 SP** | **`Done Sprint 4` (100%)** |
| **TỔNG CỘNG** | **Toàn bộ 4 Sprint hoàn thiện phục vụ bảo vệ đồ án** | **160 Thẻ** | **483 SP** | **160/160 Thẻ Hoàn Thành 100%** |

---

## 🌟 2. DANH SÁCH 8 TÍNH NĂNG MỞ RỘNG & CÁC TRANG CHỨC NĂNG MỚI ĐỀ XUẤT

Để tiếp tục nâng tầm TravelEasy thành Siêu Ứng Dụng Di Chuyển & Dịch Vụ Du Lịch Toàn Diện (All-in-One Mobility Platform), nhóm nghiên cứu và thiết kế 8 phân hệ tính năng và trang màn hình mới:

### 🚐 1. Trang Cho Thuê Xe Hợp Đồng Du Lịch (`/charter` / `/rental`)
* **Mô tả nghiệp vụ**: Phục vụ đối tượng khách hàng đoàn (doanh nghiệp du lịch, trường học, đám cưới, gia đình đông người) có nhu cầu thuê nguyên xe 16 chỗ, 29 chỗ, 34 phòng VIP hoặc 45 chỗ có tài xế riêng.
* **Tính năng chính**:
  - Giao diện chọn điểm đi, điểm đến, ngày khởi hành, ngày về, số lượng hành khách.
  - Công cụ tính cước tự động theo tổng số km lộ trình và loại xe.
  - Cổng đối tác nhà xe tiếp nhận đơn thuê xe, duyệt báo giá và điều động phương tiện/tài xế.
* **Phân công phụ trách**: **Nguyễn Đại Phát** (Full-Stack).

---

### 🛡️ 2. Trang Bảo Hiểm Chuyến Đi & Nộp Hồ Sơ Bồi Thường Online (`/insurance`)
* **Mô tả nghiệp vụ**: Liên kết đối tác bảo hiểm (Bảo Việt / PTI / PVI), tự động tích hợp gói bảo hiểm tai nạn và thất lạc hành lý vào vé xe chỉ với phí từ 5.000đ - 10.000đ/vé.
* **Tính năng chính**:
  - Trang chi tiết quyền lợi bảo hiểm (đền bù tai nạn tới 400 triệu, mất hành lý tới 5 triệu, hoãn hủy chuyến do thiên tai).
  - Giao diện nộp hồ sơ yêu cầu bồi thường trực tuyến (`/insurance/claim`): Tải ảnh vé điện tử, biên bản sự cố, hóa đơn y tế và nhập số tài khoản ngân hàng để nhận tiền đền bù online.
* **Phân công phụ trách**: **Trần Minh Đức** (Full-Stack).

---

### 🆘 3. Trang Trung Tâm Cứu Hộ & Chăm Sóc Khách Hàng 24/7 (`/support`)
* **Mô tả nghiệp vụ**: Kênh hỗ trợ hành khách tức thời trên suốt hành trình di chuyển.
* **Tính năng chính**:
  - Widget Live Chat trực tuyến giải đáp thắc mắc.
  - Hệ thống gửi Ticket yêu cầu hỗ trợ (Quên hành lý trên xe, phản ánh thái độ phục vụ của tài xế/phụ xe, khiếu nại hoàn tiền).
  - Danh bạ Hotline khẩn cấp theo từng hãng xe và trạm dừng chân trên quốc lộ.
* **Phân công phụ trách**: **Đoàn Nhật Cường** (Full-Stack).

---

### 🤝 4. Trang Cổng Đại Lý Vé Xe & Điểm Bán Vé Tại Bến (`/agent/portal`)
* **Mô tả nghiệp vụ**: Kênh phân phối vé dành cho các quầy bán vé trực tiếp tại bến xe hoặc đại lý du lịch địa phương.
* **Tính năng chính**:
  - Giao diện đặt vé nhanh cho khách vãng lai, in vé giấy mini khổ nhiệt 80mm có mã vạch QR check-in tức thì.
  - Quản lý hạn mức công nợ đại lý, thống kê hoa hồng chiết khấu đại lý 5-8%.
* **Phân công phụ trách**: **Phạm Thanh Phong** (Full-Stack).

---

### ⚡ 5. Trang Quản Trị Giá Vé Động & Khuyến Mãi Flash Sale Theo Khung Giờ (`/company/pricing-rules`)
* **Mô tả nghiệp vụ**: Áp dụng thuật toán quản trị doanh thu (Revenue Management) cho phép các nhà xe tối ưu tỷ lệ lấp đầy ghế.
* **Tính năng chính**:
  - Nhà xe thiết lập luật giá vé linh hoạt: Giảm giá giờ vàng Flash Sale chuyến đêm (giảm 20%), đặt vé sớm trước 7 ngày (giảm 15%), tự động tăng giá 10% khi số ghế trống trên xe còn dưới 5 chỗ.
  - Trang chủ hiển thị khu vực "Flash Sale Vé Rẻ Giờ Vàng" có đồng hồ đếm ngược kích thích mua vé.
* **Phân công phụ trách**: **Nguyễn Đại Phát** (Full-Stack).

---

### 📍 6. Bản Đồ GPS Live Tracking & Lộ Trình Xe Khách Thời Gian Thực (`/tracking/:tripId`)
* **Mô tả nghiệp vụ**: Giúp hành khách và người thân biết chính xác xe đang chạy ở đâu trên quốc lộ, bao lâu nữa tới điểm đón để chủ động thời gian.
* **Tính năng chính**:
  - Bản đồ tương tác Leaflet/Mapbox hiển thị tuyến đường và icon xe di chuyển thời gian thực.
  - Thuật toán tính toán khoảng cách còn lại (Haversine Formula) và thời gian dự kiến đến bến (ETA).
* **Phân công phụ trách**: **Đoàn Nhật Cường** (Frontend) & **Phạm Thanh Phong** (Backend GPS / SSE).

---

### 📦 7. Quản Lý Gửi Bưu Kiện & Hàng Hóa Hầm Xe Liên Tỉnh (`/cargo`)
* **Mô tả nghiệp vụ**: Số hóa nghiệp vụ nhận gửi hàng hóa dưới gầm xe khách liên tỉnh — nguồn doanh thu bổ sung 30-40% của các hãng xe.
* **Tính năng chính**:
  - Giao diện đặt gửi hàng, tính cước theo thể tích ($D \times R \times C / 5000$) và khối lượng thực tế.
  - In phiếu gửi hàng có mã vạch barcode, tra cứu tiến độ vận đơn `CG-*`, kiểm soát giới hạn tải trọng hầm xe.
* **Phân công phụ trách**: **Trần Minh Đức** (Frontend) & **Phạm Thanh Phong** (Backend).

---

### 🎁 8. Ví Điểm Thưởng EasyXu & Minigame Vòng Quay May Mắn (`/rewards`)
* **Mô tả nghiệp vụ**: Tăng tỷ lệ giữ chân khách hàng thông qua cơ chế tích lũy điểm thưởng và trò chơi trúng voucher.
* **Tính năng chính**:
  - Tự động tích lũy 1-5% xu thưởng sau mỗi chuyến đi hoàn thành; cấn trừ xu trực tiếp khi thanh toán (1 xu = 1 VNĐ).
  - Vòng quay may mắn (Lucky Wheel) 1 lượt mỗi ngày để nhận voucher giảm giá hoặc xu thưởng.
* **Phân công phụ trách**: **Trần Minh Đức** (Frontend) & **Nguyễn Đại Phát** (Backend).

---

## 👥 3. BẢNG PHÂN BỔ CÔNG VIỆC TÍNH NĂNG MỞ RỘNG (4 THÀNH VIÊN)

| Thành Viên | Vai Trò | Tính Năng & Trang Mới Phụ Trách | Ghi Chú |
|:---|:---|:---|:---|
| **Phạm Công Thành** | **Nhóm trưởng & System Architect** | **0 task mới** *(Đã hoàn thành xuất sắc toàn bộ Core Architecture, Cổng Nhà xe 10 trang, Docker, CI/CD, DB, Tracing)* | Giám sát chất lượng & Điều phối chung |
| **Nguyễn Đại Phát** | **Admin Lead & Full-Stack** | • Trang Cho thuê xe hợp đồng du lịch (`/charter`)<br>• Trang Quản trị giá vé động & Flash Sale (`/company/pricing-rules`)<br>• Backend Quản lý ví điểm thưởng EasyXu & Ledger tài chính | Đảm nhận phân hệ Đối tác & Quản trị mở rộng |
| **Phạm Thanh Phong** | **Core Booking & Seat Engine** | • Trang Cổng đại lý vé xe & Điểm bán bến (`/agent/portal`)<br>• Backend tiếp nhận GPS Live Tracking & Stream tọa độ SSE<br>• Backend Động cơ tính cước gửi hàng & Vận đơn bưu kiện | Đảm nhận lõi xử lý cước phí & dữ liệu thời gian thực |
| **Đoàn Nhật Cường** | **Mobile Specialist & QR Scanner** | • Trang Trung tâm cứu hộ & Chăm sóc khách hàng 24/7 (`/support`)<br>• Frontend Bản đồ GPS Live Tracking trên di động (`/tracking/:tripId`) | Đảm nhận giao diện thời gian thực & hỗ trợ hành khách |
| **Trần Minh Đức** | **Customer Portal & Ticket Management** | • Trang Bảo hiểm chuyến đi & Nộp hồ sơ bồi thường (`/insurance`)<br>• Frontend Giao diện gửi bưu kiện & Tra cứu vận đơn (`/cargo`)<br>• Frontend Ví điểm thưởng EasyXu & Vòng quay may mắn (`/rewards`) | Đảm nhận phân hệ dịch vụ giá trị gia tăng cho hành khách |
| **Phan Trung Kiên** | **Sinh viên** | **0 task** *(Miễn thực tập OJT theo quyết định đào tạo của Nhà trường / Doanh nghiệp)* | Miễn OJT |

