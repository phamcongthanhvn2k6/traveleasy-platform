# 🧭 HƯỚNG DẪN PHÂN CHIA THƯ MỤC & KHÔNG GIAN LÀM VIỆC NHÓM 7
> **Dự án:** TravelEasy Platform — Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh  
> **Mục đích:** Phân định rõ ràng thư mục code cho từng thành viên, giúp code độc lập, không bị đè code (merge conflicts) và dễ dàng bàn giao, nghiệm thu.  
> **Nguyên tắc cốt lõi:**  
> * **Phạm Công Thành (Leader & Architect)**: Giữ vai trò bảo trợ kiến trúc lõi, Docker, CSDL, Code Review; **không nhận thêm task code mới**.  
> * **4 thành viên còn lại (Phát, Phong, Cường, Đức)**: Mỗi người có không gian thư mục chuyên biệt cho phân hệ mình đảm nhận.

---

## 🗺️ TỔNG QUAN PHÂN BỔ THƯ MỤC THEO THÀNH VIÊN

```
Nhom7_QUANLYNHAXE/
├── frontend/src/pages/
│   ├── admin/
│   │   └── charters/                   👉 NGUYỄN ĐẠI PHÁT (Quản trị cọc & hợp đồng thuê xe)
│   ├── company/
│   │   ├── pricing-rules/              👉 NGUYỄN ĐẠI PHÁT (Thiết lập giá vé động, Flash Sale)
│   │   └── pos/                        👉 PHẠM THANH PHONG (Quầy vé bến xe của nhà xe)
│   │       └── shifts/                 👉 PHẠM THANH PHONG (Mở ca, kết ca, đối soát tiền mặt)
│   └── customer/
│       ├── tracking/                   👉 ĐOÀN NHẬT CƯỜNG (Bản đồ GPS xe chạy Live)
│       ├── support/                    👉 ĐOÀN NHẬT CƯỜNG (Trung tâm CSKH & Cứu hộ 24/7)
│       ├── charter/                    👉 TRẦN MINH ĐỨC (Giao diện đặt xe du lịch hợp đồng)
│       ├── cargo/                      👉 TRẦN MINH ĐỨC (Giao diện gửi hàng & tra cứu vận đơn)
│       ├── insurance/                  👉 TRẦN MINH ĐỨC (Bảo hiểm chuyến đi & nộp bồi thường)
│       └── rewards/                    👉 TRẦN MINH ĐỨC (Ví điểm EasyXu & Vòng quay may mắn)
│
└── backend/src/main/java/com/traveleasy/
    ├── controller/
    │   ├── admin/                      👉 NGUYỄN ĐẠI PHÁT (AdminCharterController)
    │   ├── company/                    👉 PHẠM THANH PHONG (CompanyPosController, CompanyPricingRuleController)
    │   ├── realtime/                   👉 PHẠM THANH PHONG (TrackingController - SSE)
    │   └── cargo/                      👉 PHẠM THANH PHONG (CargoController - Tính cước bưu kiện)
    └── service/
        ├── admin/                      👉 NGUYỄN ĐẠI PHÁT
        ├── company/                    👉 PHẠM THANH PHONG
        ├── realtime/                   👉 PHẠM THANH PHONG
        └── cargo/                      👉 PHẠM THANH PHONG
```

---

## 👤 1. NGUYỄN ĐẠI PHÁT — ADMIN LEAD & ĐỐI TÁC

### 📁 Thư mục phụ trách:
1. **Frontend:**
   * `frontend/src/pages/admin/charters/`
     * `AdminCharterList.jsx`: Màn hình duyệt hợp đồng thuê xe, kiểm tra trạng thái cọc 30% và giải ngân cho nhà xe sau chuyến đi.
   * `frontend/src/pages/company/pricing-rules/`
     * `PricingRulesPage.jsx`: Giao diện nhà xe cài đặt luật tăng giá Lễ/Tết hoặc Flash Sale giảm giá giờ chót.
2. **Backend:**
   * `backend/src/main/java/com/traveleasy/controller/admin/AdminCharterController.java`
   * `backend/src/main/java/com/traveleasy/service/admin/AdminCharterService.java`
   * `backend/src/main/java/com/traveleasy/controller/company/CompanyPricingRuleController.java`
   * `backend/src/main/java/com/traveleasy/service/company/CompanyPricingRuleService.java`

---

## 👤 2. PHẠM THANH PHONG — CORE BOOKING, QUẦY BẾN & REALTIME

### 📁 Thư mục phụ trách:
1. **Frontend:**
   * `frontend/src/pages/company/pos/`
     * `PosTerminalPage.jsx`: Màn hình POS bán vé siêu tốc tại quầy bến xe (chọn chuyến, chọn ghế, in vé nhiệt 80mm).
   * `frontend/src/pages/company/pos/shifts/`
     * `CashShiftManagement.jsx`: Mở ca đầu ngày, theo dõi tiền mặt trong ca, in phiếu Z-Report kết ca bàn giao thủ quỹ.
2. **Backend:**
   * `backend/src/main/java/com/traveleasy/controller/company/CompanyPosController.java`
   * `backend/src/main/java/com/traveleasy/service/company/CompanyPosService.java`
   * `backend/src/main/java/com/traveleasy/controller/realtime/TrackingController.java` (Stream tọa độ GPS SSE `/api/v1/tracking/stream/{tripId}`)
   * `backend/src/main/java/com/traveleasy/service/realtime/TrackingService.java`
   * `backend/src/main/java/com/traveleasy/controller/cargo/CargoController.java` (API tính cước bưu kiện theo thể tích & cân nặng)
   * `backend/src/main/java/com/traveleasy/service/cargo/CargoService.java`

---

## 👤 3. ĐOÀN NHẬT CƯỜNG — MOBILE SPECIALIST & BẢN ĐỒ VỆ TINH

### 📁 Thư mục phụ trách:
1. **Frontend:**
   * `frontend/src/pages/customer/tracking/`
     * `LiveTrackingMapPage.jsx`: Bản đồ Leaflet/Mapbox hiển thị icon xe bus di chuyển thời gian thực trên tuyến đường đón khách (`/tracking/:tripId`), trạm dừng chân và thời gian dự kiến đến nơi (ETA).
   * `frontend/src/pages/customer/support/`
     * `CustomerSupportHub.jsx`: Trung tâm trợ giúp khẩn cấp 24/7, hotline các bến xe và gửi phản ánh sự cố chuyến đi (`/support`).
   * `frontend/src/components/map/`
     * `RouteMapViewer.jsx`: Component bản đồ dùng chung hiển thị trạm đón/trả và lộ trình xe chạy.

---

## 👤 4. TRẦN MINH ĐỨC — CUSTOMER SERVICES & TIỆN ÍCH MỞ RỘNG

### 📁 Thư mục phụ trách:
1. **Frontend:**
   * `frontend/src/pages/customer/charter/`
     * `CharterBookingPage.jsx`: Form đặt thuê nguyên xe du lịch có tài xế riêng (`/charter`), tính khoảng cách km, chọn số lượng buồng/chỗ và xem báo giá các nhà xe.
   * `frontend/src/pages/customer/cargo/`
     * `CargoBookingPage.jsx`: Form ký gửi hàng hóa bưu kiện theo xe (`/cargo`), nhập kích thước, trọng lượng, tính cước và in tem vận đơn QR.
   * `frontend/src/pages/customer/insurance/`
     * `TravelInsurancePage.jsx`: Quyền lợi bảo hiểm tai nạn chuyến đi 10.000đ/vé (`/insurance`) và form nộp hồ sơ yêu cầu bồi thường online.
   * `frontend/src/pages/customer/rewards/`
     * `EasyRewardsPage.jsx`: Giao diện ví tích điểm EasyXu và Minigame Vòng quay may mắn (Lucky Wheel) tặng mã giảm giá (`/rewards`).

---

## 👤 5. PHẠM CÔNG THÀNH — LEADER & SYSTEM ARCHITECT
* **Trọng tâm:**
  * Giám sát hệ thống (`backend/src/main/java/com/traveleasy/controller/common/HealthController.java`).
  * Bộ lọc truy vết phân tán (`backend/src/main/java/com/traveleasy/security/CorrelationIdFilter.java`).
  * Quản trị cấu hình Docker (`docker-compose.yml`), Supabase CSDL 36 bảng.
  * Code Review Pull Request từ 4 thành viên trước khi merge vào nhánh `dev` và `main`.

---

## 📌 QUY TẮC PHỐI HỢP GIT CHO CÁC THÀNH VIÊN
1. **Luôn tạo nhánh feature riêng:** `git checkout -b feature/<ten-chuc-nang>-<ten-ban>`
   * Ví dụ Phát: `git checkout -b feature/pricing-rules-phat`
   * Ví dụ Phong: `git checkout -b feature/pos-terminal-phong`
   * Ví dụ Cường: `git checkout -b feature/live-tracking-cuong`
   * Ví dụ Đức: `git checkout -b feature/charter-cargo-duc`
2. **Cam kết không sửa chéo file ngoài thư mục phụ trách:** Nếu cần dùng API chung, trao đổi với Thành để cập nhật `apiService.js` hoặc cấu hình route chung trong `AppRoutes.jsx`.
3. **Trước khi tạo Pull Request:** Chạy `npm run lint` hoặc `npm run build` ở frontend và `./gradlew test` ở backend để đảm bảo không gãy dự án.
