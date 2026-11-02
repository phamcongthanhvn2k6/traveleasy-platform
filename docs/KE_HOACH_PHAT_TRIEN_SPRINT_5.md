# 🚀 KẾ HOẠCH PHÁT TRIỂN & ĐẶC TẢ CHI TIẾT SPRINT 5 (ADVANCED ROADMAP)
> **Dự án:** Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy  
> **Đơn vị:** Nhóm 7 (Phạm Công Thành - Leader, Nguyễn Đại Phát, Phạm Thanh Phong, Đoàn Nhật Cường, Trần Minh Đức; Phan Trung Kiên: Miễn OJT)  
> **Bảng Trello Trực Tuyến:** [TravelEasy_Platform | Trello Board](https://trello.com/b/AA5BYoe1/traveleasyplatform)  
> **Danh sách trên Trello:** `Sprint Backlog - SPRINT 5` (12 thẻ chuẩn hóa)  
> **Chính sách phân công:** *Việc giao task cụ thể cho từng thành viên sẽ được xác định sau theo điều phối của Nhóm trưởng.*

---

## 📌 1. TỔNG QUAN VỀ SPRINT 5

Sau khi hoàn thành xuất sắc 3 Sprint cốt lõi phục vụ bảo vệ đồ án OJT:
* **Sprint 1 (38 Thẻ - `Done Sprint 1`)**: Nền tảng kiến trúc Modular Monolith, CSDL 36 bảng Supabase Cloud, Stateless JWT Bearer RBAC 3 vai trò, Master Data bến xe & sơ đồ xe 34 chỗ, Docker Compose.
* **Sprint 2 (100 Thẻ - `Done Sprint 2`)**: Core Booking Engine, Concurrency Seat Locking (Pessimistic Lock & SSE realtime), Đặt vé & Thanh toán đa kênh (VietQR, VNPAY, COD), Cổng Nhà xe (10 trang), Cổng Quản trị (10 trang), cùng trọn bộ 40 test suite tích hợp & nghiệm thu toàn sàn (bao gồm toàn bộ Sprint 3 cũ và nửa đầu Sprint 4).
* **Sprint 3 (22 Thẻ - `Done Sprint 3`)**: Vận hành Sẵn sàng Sản xuất (Production Readiness), Health/Readiness Probes, Distributed Tracing (`X-Correlation-Id`), Tối ưu độ trễ & Core Web Vitals, Demo Hub 15' & Sổ tay vận hành Runbook (từ nửa sau Sprint 4).

**Sprint 5** được thiết kế nhằm nâng tầm TravelEasy từ một hệ thống bán vé đơn thuần thành một **Siêu Nền Tảng Di Chuyển & Dịch Vụ Du Lịch Toàn Diện (All-in-One Mobility & Travel Ecosystem)**, bổ sung 6 tính năng cao cấp chuẩn thực tế doanh nghiệp vận tải.

---

## 📊 2. DANH SÁCH 12 THẺ NHIỆM VỤ CHUẨN HÓA TRÊN TRELLO

| STT | Mã Thẻ | Tên Thẻ & Nghiệp Vụ Sprint 5 | Phân Tầng | Điểm SP | Ưu Tiên | Trạng Thái Trello |
|:---:|:---:|:---|:---:|:---:|:---:|:---|
| **1** | `[S501]` | **Bản đồ theo dõi lộ trình và vị trí xe khách thời gian thực** (`/tracking/:tripId`) | Frontend | 5 SP | Ưu tiên 1 | `Sprint Backlog - SPRINT 5` |
| **2** | `[S501]` | **Dịch vụ tính toán ETA, khoảng cách và tiếp nhận tọa độ GPS xe khách** (`/api/v1/tracking`) | Backend | 5 SP | Ưu tiên 1 | `Sprint Backlog - SPRINT 5` |
| **3** | `[S502]` | **Giao diện đặt gửi bưu kiện, tra cứu vận đơn và tính cước hàng hóa** (`/cargo`) | Frontend | 5 SP | Ưu tiên 2 | `Sprint Backlog - SPRINT 5` |
| **4** | `[S502]` | **Động cơ tính cước vận chuyển bưu kiện, quản lý tải trọng hầm xe và vận đơn** (`/api/v1/cargo`) | Backend | 5 SP | Ưu tiên 2 | `Sprint Backlog - SPRINT 5` |
| **5** | `[S503]` | **Giao diện ví điểm thưởng EasyXu, lịch sử tích xu và vòng quay may mắn** (`/rewards`) | Frontend | 3 SP | Ưu tiên 2 | `Sprint Backlog - SPRINT 5` |
| **6** | `[S503]` | **Nghiệp vụ tích điểm tự động theo giá trị vé, khấu trừ xu và chống gian lận** (`/api/v1/loyalty`) | Backend | 3 SP | Ưu tiên 2 | `Sprint Backlog - SPRINT 5` |
| **7** | `[S504]` | **Giao diện đặt Combo du lịch trọn gói Vé xe + Khách sạn / Homestay** (`/combos`) | Frontend | 5 SP | Ưu tiên 2 | `Sprint Backlog - SPRINT 5` |
| **8** | `[S504]` | **API kiểm tra tình trạng phòng khách sạn, ghép nối vé xe và khóa combo** (`/api/v1/combos`) | Backend | 5 SP | Ưu tiên 2 | `Sprint Backlog - SPRINT 5` |
| **9** | `[S505]` | **Cổng di động điều phối danh sách khách lên xe dành cho Tài xế / Phụ xe** (`/driver/portal`) | Frontend | 5 SP | Ưu tiên 1 | `Sprint Backlog - SPRINT 5` |
| **10** | `[S505]` | **API điểm danh khách lên xe, gọi điện khẩn cấp và cập nhật trạng thái chuyến** (`/api/v1/driver`) | Backend | 5 SP | Ưu tiên 1 | `Sprint Backlog - SPRINT 5` |
| **11** | `[S506]` | **Giao diện cấu hình trung tâm thông báo đa kênh SMS, Zalo và Email** (`/admin/notifications`) | Frontend | 3 SP | Ưu tiên 3 | `Sprint Backlog - SPRINT 5` |
| **12** | `[S506]` | **Dịch vụ tự động gửi thông báo đa kênh SMS Brandname, Zalo ZNS và Email vé** (`/api/v1/notifications`) | Backend | 3 SP | Ưu tiên 3 | `Sprint Backlog - SPRINT 5` |

---

## 🛠️ 3. ĐẶC TẢ CHI TIẾT 6 TÍNH NĂNG MỞ RỘNG

### 🎯 TÍNH NĂNG 1: GPS LIVE TRACKING & LỘ TRÌNH XE THỜI GIAN THỰC
* **Bài toán thực tế**: Hành khách và người thân thường lo lắng không biết xe đang ở đâu trên quốc lộ, bao lâu nữa tới điểm đón/trả, dẫn đến việc phải ra bến chờ đợi quá sớm hoặc lỡ chuyến.
* **Giải pháp kỹ thuật**:
  - **Frontend (`/tracking/:tripId`)**: Tích hợp thư viện Leaflet / Mapbox GL JS, hiển thị bản đồ trực quan với tuyến đường polyline nối điểm đi và điểm đến. Icon xe bus di chuyển mượt mà theo tọa độ GPS thời gian thực.
  - **Backend (`/api/v1/tracking`)**: Endpoint tiếp nhận tọa độ `POST /api/v1/tracking/ping` từ thiết bị định vị/app tài xế; tính toán khoảng cách còn lại (Haversine Formula) và thời gian dự kiến đến (ETA). Stream tọa độ đến client qua Server-Sent Events (SSE) hoặc WebSocket.
* **Tiêu chí nghiệm thu (DoD)**:
  - Bản đồ tải trong dưới 1 giây, zoom/pan mượt mà trên mobile.
  - Tọa độ xe cập nhật tự động mỗi 5-10 giây không cần reload trang.
  - Cảnh báo trực quan khi xe còn cách điểm đón dưới 5km.

---

### 📦 TÍNH NĂNG 2: QUẢN LÝ GỬI BƯU KIỆN & HÀNG HÓA LIÊN TỈNH (CARGO DELIVERY)
* **Bài toán thực tế**: 100% các nhà xe liên tỉnh tại Việt Nam (Phương Trang, Sao Việt, Thành Bưởi...) đều tận dụng hầm xe để vận chuyển hàng hóa, mang lại 30-40% lợi nhuận ròng.
* **Giải pháp kỹ thuật**:
  - **Frontend (`/cargo`)**: Form gửi hàng đa bước (Thông tin người gửi/nhận, loại hàng, kích thước 3 chiều D x R x C, khối lượng kg, giá trị khai báo, bảo hiểm hàng hóa). Tự động tính cước tức thì và in phiếu gửi kèm mã vạch Barcode/QR Code. Trang tra cứu tiến độ vận đơn `CG-*`.
  - **Backend (`/api/v1/cargo`)**: Động cơ tính cước thông minh theo công thức: $\text{Khối lượng quy đổi} = \frac{D \times R \times C}{5000}$ so với cân nặng thực tế; quản lý giới hạn tải trọng hầm xe theo từng biển số xe; API cập nhật trạng thái vận đơn (`RECEIVED` ➔ `LOADED` ➔ `IN_TRANSIT` ➔ `ARRIVED_HUB` ➔ `DELIVERED`).
* **Tiêu chí nghiệm thu (DoD)**:
  - Sinh mã vận đơn duy nhất chuẩn định dạng `CG-YYYYMMDD-XXXX`.
  - Khóa không cho nhận thêm hàng khi hầm xe đạt giới hạn trọng tải tối đa.
  - In phiếu gửi hàng chuẩn khổ A5/A6 có mã vạch quét quang học.

---

### 🎁 TÍNH NĂNG 3: VÍ ĐIỂM THƯỞNG EASYXU & CHƯƠNG TRÌNH KHÁCH HÀNG THÂN THIẾT (LOYALTY)
* **Bài toán thực tế**: Tăng tỷ lệ giữ chân khách hàng (Customer Retention Rate) và tần suất quay lại đặt vé thông qua cơ chế tích lũy điểm thưởng tương tự GrabRewards hay Shopee Xu.
* **Giải pháp kỹ thuật**:
  - **Frontend (`/rewards`)**: Giao diện ví điểm cá nhân hiển thị số dư EasyXu (1 xu = 1 VNĐ); lịch sử giao dịch xu minh bạch; Minigame Vòng quay may mắn (Lucky Wheel) quay 1 lượt mỗi ngày nhận thêm mã giảm giá hoặc xu thưởng.
  - **Backend (`/api/v1/loyalty`)**: Tự động tích lũy từ 1% đến 5% giá trị đơn vé vào ví EasyXu ngay sau khi chuyến đi hoàn thành (`COMPLETED`). Logic cấn trừ xu trực tiếp vào tổng tiền thanh toán vé tại `/checkout`. Cơ chế Idempotent chống gian lận cộng xu lặp và rate-limiting minigame.
* **Tiêu chí nghiệm thu (DoD)**:
  - Xu được cộng chính xác và ghi nhận nhật ký ledger bất biến.
  - Không cho phép trừ số xu vượt quá số dư hiện có hoặc vượt quá 50% giá trị đơn vé.
  - Vòng quay may mắn có tỷ lệ trúng thưởng ngẫu nhiên bảo mật từ server.

---

### 🏨 TÍNH NĂNG 4: COMBO DU LỊCH TRỌN GÓI VÉ XE + KHÁCH SẠN / HOMESTAY
* **Bài toán thực tế**: Khách du lịch đến các địa danh nổi tiếng (Đà Lạt, Sa Pa, Nha Trang, Vũng Tàu) có nhu cầu đặt trọn gói vé xe khứ hồi và phòng nghỉ để tiết kiệm chi phí và thời gian.
* **Giải pháp kỹ thuật**:
  - **Frontend (`/combos`)**: Giao diện chọn gói combo theo điểm đến; xem danh sách khách sạn 3-5 sao / homestay liên kết kèm thư viện ảnh, tiện ích (hồ bơi, bữa sáng, ban công ngắm núi); chọn ngày check-in/check-out khớp với lịch xe chạy; hiển thị số tiền tiết kiệm được (tiết kiệm 15-20% so với đặt lẻ).
  - **Backend (`/api/v1/combos`)**: Quản lý quỹ phòng liên kết (Allotment Inventory); cơ chế khóa phòng song song với khóa ghế xe (Two-Phase Locking); tính toán chiết khấu bundle giá linh hoạt; webhook thông báo đơn đặt phòng sang hệ thống khách sạn đối tác.
* **Tiêu chí nghiệm thu (DoD)**:
  - Khóa đồng thời ghế xe và phòng khách sạn trong 10 phút thanh toán.
  - Tự động nhả phòng và nhả ghế nếu khách hàng hủy thanh toán hoặc quá hạn 10 phút.
  - Sinh hóa đơn combo duy nhất kèm thông tin liên hệ lễ tân khách sạn.

---

### 📱 TÍNH NĂNG 5: CỔNG DI ĐỘNG ĐIỀU PHỐI DÀNH CHO TÀI XẾ / TIẾP VIÊN (DRIVER MOBILE PORTAL)
* **Bài toán thực tế**: Tài xế và tiếp viên cần một giao diện cực kỳ đơn giản, trực quan, tối ưu cho màn hình cảm ứng di động để điều hành đón trả khách dọc đường, thay thế danh sách in giấy truyền thống.
* **Giải pháp kỹ thuật**:
  - **Frontend (`/driver/portal`)**: Thiết kế chuẩn Mobile PWA (Progressive Web App) có thể cài đặt trực tiếp lên màn hình điện thoại; danh sách hành khách sắp xếp theo thứ tự trạm đón; nút gọi điện thoại nhanh (`tel:`) liên hệ khách; nút tích chọn điểm danh khách đã lên xe; hỗ trợ chế độ Offline nếu mất sóng 4G trên đèo.
  - **Backend (`/api/v1/driver`)**: API nhận điểm danh và cập nhật trạng thái đón khách tức thì về Dashboard nhà xe; API báo cáo sự cố khẩn cấp trên đường (sự cố kỹ thuật, tắc đường, tai nạn); API chốt số lượng khách thực tế trước khi xe rời bến.
* **Tiêu chí nghiệm thu (DoD)**:
  - Tải nhanh dưới 500ms, nút bấm to bản dễ thao tác khi đang trên xe.
  - Nút gọi điện mở ngay ứng dụng gọi điện mặc định trên điện thoại tài xế.
  - Đồng bộ dữ liệu điểm danh về server ngay khi có kết nối mạng.

---

### 🔔 TÍNH NĂNG 6: TRUNG TÂM THÔNG BÁO ĐA KÊNH TỰ ĐỘNG (MULTI-CHANNEL NOTIFICATIONS)
* **Bài toán thực tế**: Khách hàng cần nhận thông tin vé tức thì qua SMS và Zalo ngay sau khi đặt vé mà không cần phải chủ động mở ứng dụng kiểm tra.
* **Giải pháp kỹ thuật**:
  - **Frontend (`/admin/notifications`)**: Giao diện cấu hình mẫu thông báo (OTP đăng ký, vé điện tử thành công, nhắc giờ xe chạy trước 2 tiếng, thông báo hủy/đổi chuyến xe); theo dõi tỷ lệ gửi thành công, chi phí cước viễn thông.
  - **Backend (`/api/v1/notifications`)**: Tích hợp các cổng viễn thông: SMS Brandname, Zalo Notification Service (ZNS), Email HTML SMTP và Push Notification trình duyệt. Xử lý bất đồng bộ qua Message Queue / ThreadPool TaskExecutor chống nghẽn luồng xử lý chính.
* **Tiêu chí nghiệm thu (DoD)**:
  - Thông báo gửi đi trong vòng dưới 3 giây sau khi thanh toán thành công.
  - Hỗ trợ cơ chế Retry 3 lần nếu cổng SMS/Zalo tạm thời bận.
  - Ghi nhận lịch sử gửi tin (`sent_at`, `status`, `recipient`, `provider_response`) vào bảng `notification_logs`.

---

## 🗄️ 4. THIẾT KẾ MỞ RỘNG CƠ SỞ DỮ LIỆU (DATABASE SCHEMA PROPOSAL)

Dự kiến bổ sung 6 bảng mới vào CSDL PostgreSQL trên Supabase:
1. `parcels`: Quản lý thông tin kiện hàng, người gửi, người nhận, cước phí, mã vận đơn `CG-*`.
2. `loyalty_wallets`: Ví điểm thưởng người dùng (`user_id`, `balance_points`, `tier`).
3. `loyalty_transactions`: Nhật ký biến động điểm thưởng (`points_delta`, `action_type`, `ref_id`).
4. `hotels`: Danh mục khách sạn đối tác (`name`, `star_rating`, `address`, `amenities`).
5. `combo_bookings`: Thông tin đơn đặt combo (`booking_id`, `hotel_id`, `room_type`, `nights`).
6. `trip_gps_logs`: Lịch sử tọa độ GPS của từng chuyến (`trip_id`, `lat`, `lng`, `speed`, `recorded_at`).
7. `notification_logs`: Nhật ký gửi tin đa kênh (`channel`, `recipient`, `content`, `status`).

---

## 📅 5. KẾ HOẠCH BÀN GIAO & PHÂN CÔNG CÔNG VIỆC

* Toàn bộ 12 thẻ công việc trên đã được tạo lập hoàn chỉnh trên bảng Trello tại danh sách: **`Sprint Backlog - SPRINT 5`**.
* Mỗi thẻ đều có độ ưu tiên, Story Points ước lượng và Checklist tiêu chí nghiệm thu (DoD) chuẩn hóa.
* **Phân công nhiệm vụ chi tiết**: Sẽ được Nhóm trưởng Phạm Công Thành tổ chức phiên Sprint Planning họp nội bộ cùng nhóm (Nguyễn Đại Phát, Phạm Thanh Phong, Đoàn Nhật Cường, Trần Minh Đức) để phân chia cụ thể trước khi kích hoạt Sprint 5.

