import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

README_PATH = "README.md"

with open(README_PATH, "r", encoding="utf-8") as f:
    content = f.read()

OLD_SECTION = """#### Lộ Trình Phân Chia Sprint & Trạng Thái Đồng Bộ Bảng Trello Trực Tuyến:
> 📄 **Bảng Trello Live**: [https://trello.com/b/AA5BYoe1/traveleasyplatform](https://trello.com/b/AA5BYoe1/traveleasyplatform)  
> 📄 **Tài liệu chi tiết**: [docs/KE_HOACH_PHAT_TRIEN_SPRINT_5.md](docs/KE_HOACH_PHAT_TRIEN_SPRINT_5.md) & [docs/TRELLO_SPRINT_REORGANIZATION_AND_SPRINT_5_MATRIX.md](docs/TRELLO_SPRINT_REORGANIZATION_AND_SPRINT_5_MATRIX.md)

| Sprint | Thời gian & Trọng tâm | Thẻ Trello | Deliverables then chốt | Trạng thái Live |
|:---:|---|:---:|---|:---:|
| **Sprint 1** | **Foundation & Master Data**: Kiến trúc, CSDL Supabase 36 bảng, Stateless JWT RBAC & Master Data xe | **38 Thẻ (Done)** | CSDL 36 bảng chuẩn hóa, Spring Security 6 JWT Bearer 3 vai trò, Master Data bến xe & sơ đồ xe 34 chỗ, Docker compose | **`Done Sprint 1` (38/38 - 100%)** |
| **Sprint 2** | **Core Booking & Full Portals Engine**: Đặt vé thời gian thực, Giữ chỗ SSE/Pessimistic Lock, Thanh toán VietQR/VNPAY, Cổng Nhà xe (10 trang), Cổng Quản trị (10 trang) & Kiểm thử tích hợp | **100 Thẻ (Done)** | SWR Cache 0ms, Sơ đồ VIP 2 tầng, Pessimistic Lock chống cướp vé, VietQR Napas PayOS & VNPAY Serializable, Cổng Nhà xe 10 trang, Cổng Admin 10 trang, trọn bộ kiểm thử nghiệm thu 40 suite (đã sáp nhập Sprint 3 cũ & nửa đầu Sprint 4) | **`Done Sprint 2` (100/100 - 100%)** |
| **Sprint 3** | **Production Readiness & Operations Runbook**: Giám sát Health/Readiness, Distributed Tracing (`X-Correlation-Id`), Tối ưu độ trễ, Demo Hub 15' & Sổ tay vận hành | **22 Thẻ (Done)** | Health & Readiness probes, Correlation ID phân tán, Tối ưu Core Web Vitals, Kịch bản Demo Hub 15 phút, Tài liệu vận hành Runbook & Bàn giao hệ thống (từ nửa sau Sprint 4) | **`Done Sprint 3` (22/22 - 100%)** |
| **Sprint 4** | **Tái cấu trúc**: Đã sáp nhập hoàn toàn vào Sprint 2 và Sprint 3 | **0 Thẻ** | Tối ưu hóa luồng bàn giao sản phẩm, gộp kiểm thử nghiệm thu vào Sprint 2 và chuyển sẵn sàng vận hành sang Sprint 3 | **Đã sáp nhập (Merged)** |
| **Sprint 5** | **Roadmap Mở Rộng Tiếp Theo (Sprint 5 Backlog)**: 6 Tính năng Đột phá Mới Chuẩn Doanh nghiệp | **12 Thẻ (Backlog)** | 1. GPS Live Tracking & Lộ trình xe realtime<br/>2. Quản lý gửi bưu kiện Cargo Delivery<br/>3. Ví xu tích điểm thưởng EasyXu Loyalty<br/>4. Combo du lịch Vé xe + Khách sạn<br/>5. Cổng di động điều phối cho Tài xế<br/>6. Trung tâm thông báo đa kênh SMS/Zalo/Email/Push<br/>*(Việc giao task cụ thể cho từng thành viên sẽ để sau)* | **`Sprint Backlog - SPRINT 5` (12 Thẻ sẵn sàng)** |

---

### 2.7 Chi Tiết 12 Thẻ Nhiệm Vụ Chuẩn Hóa Của Sprint 5 (Sprint Backlog - SPRINT 5)

> 💡 **Lưu ý phân công**: 12 thẻ công việc dưới đây đã được tạo lập đầy đủ và chuẩn hóa với tiêu chí nghiệm thu DoD trên Trello. **Việc giao task cho từng thành viên cụ thể sẽ được quyết định sau**.

| STT | Mã Thẻ | Tên Thẻ & Nghiệp Vụ Sprint 5 | Phân Tầng | Điểm SP | Độ Ưu Tiên | Tiêu Chí Nghiệm Thu Chính (DoD) |
|:---:|:---:|:---|:---:|:---:|:---:|:---|
| **1** | `[S501]` | **Bản đồ theo dõi lộ trình và vị trí xe khách thời gian thực** (`/tracking/:tripId`) | Frontend | 5 SP | Ưu tiên 1 | Hiển thị bản đồ tương tác (Leaflet/Mapbox), icon xe di chuyển mượt mà, ước tính thời gian đến bến (ETA). |
| **2** | `[S501]` | **Dịch vụ tính toán ETA, khoảng cách và tiếp nhận tọa độ GPS xe khách** (`/api/v1/tracking`) | Backend | 5 SP | Ưu tiên 1 | API nhận tọa độ GPS tài xế, tính toán khoảng cách còn lại, phát tọa độ realtime qua WebSocket/SSE. |
| **3** | `[S502]` | **Giao diện đặt gửi bưu kiện, tra cứu vận đơn và tính cước hàng hóa** (`/cargo`) | Frontend | 5 SP | Ưu tiên 2 | Form nhập người gửi/nhận, loại hàng, kích thước, khối lượng; tự động tính cước và in mã vận đơn barcode. |
| **4** | `[S502]` | **Động cơ tính cước vận chuyển bưu kiện, quản lý tải trọng hầm xe và vận đơn** (`/api/v1/cargo`) | Backend | 5 SP | Ưu tiên 2 | Nghiệp vụ tính cước theo thể tích/khối lượng, kiểm soát tải trọng tối đa hầm xe chuyến chạy, sinh mã vận đơn `CG-*`. |
| **5** | `[S503]` | **Giao diện ví điểm thưởng EasyXu, lịch sử tích xu và vòng quay may mắn** (`/rewards`) | Frontend | 3 SP | Ưu tiên 2 | Hiển thị số dư EasyXu, giao dịch cộng/trừ xu, minigame Vòng quay may mắn nhận voucher và quà tặng. |
| **6** | `[S503]` | **Nghiệp vụ tích điểm tự động theo giá trị vé, khấu trừ xu và chống gian lận** (`/api/v1/loyalty`) | Backend | 3 SP | Ưu tiên 2 | Tự động cộng 1-5% xu sau khi hoàn thành chuyến đi, logic trừ xu thanh toán vé với tỷ lệ 1 xu = 1 VNĐ, chống bot. |
| **7** | `[S504]` | **Giao diện đặt Combo du lịch trọn gói Vé xe + Khách sạn / Homestay** (`/combos`) | Frontend | 5 SP | Ưu tiên 2 | Danh sách gói combo theo địa điểm (Đà Lạt, Sa Pa, Nha Trang), chọn phòng, xem ảnh thực tế, tính tổng tiền ưu đãi. |
| **8** | `[S504]` | **API kiểm tra tình trạng phòng khách sạn, ghép nối vé xe và khóa combo** (`/api/v1/combos`) | Backend | 5 SP | Ưu tiên 2 | Quản lý kho phòng khách sạn liên kết, khóa phòng đồng thời với khóa ghế xe, áp dụng chiết khấu combo 15-20%. |
| **9** | `[S505]` | **Cổng di động điều phối danh sách khách lên xe dành cho Tài xế / Phụ xe** (`/driver/portal`) | Frontend | 5 SP | Ưu tiên 1 | Giao diện tối ưu Mobile PWA cho lái phụ xe, danh sách khách tại từng trạm đón/trả, nút gọi điện thoại nhanh cho khách. |
| **10** | `[S505]` | **API điểm danh khách lên xe, gọi điện khẩn cấp và cập nhật trạng thái chuyến** (`/api/v1/driver`) | Backend | 5 SP | Ưu tiên 1 | Điểm danh hành khách offline-first, đồng bộ trạng thái đón khách tức thì về nhà xe, ghi nhật ký hành trình. |
| **11** | `[S506]` | **Giao diện cấu hình trung tâm thông báo đa kênh SMS, Zalo và Email** (`/admin/notifications`) | Frontend | 3 SP | Ưu tiên 3 | Quản lý mẫu tin nhắn (Template OTP, xác nhận đặt vé, nhắc giờ xuất bến, hủy chuyến), xem tỷ lệ gửi thành công. |
| **12** | `[S506]` | **Dịch vụ tự động gửi thông báo đa kênh SMS Brandname, Zalo ZNS và Email vé** (`/api/v1/notifications`) | Backend | 3 SP | Ưu tiên 3 | Tích hợp cổng SMS, Zalo ZNS API và Email SMTP HTML; hàng đợi gửi tin bất đồng bộ chống nghẽn hệ thống. |"""

NEW_SECTION = """#### Lộ Trình 4 Sprint Chuẩn Hóa Cân Đối & Bảng Điểm Story Points (Đồng bộ 100% Bảng Trello Live):
> 📄 **Bảng Trello Trực Tuyến**: [https://trello.com/b/AA5BYoe1/traveleasyplatform](https://trello.com/b/AA5BYoe1/traveleasyplatform)  
> 📄 **Tài liệu chi tiết**: [docs/TRELLO_4_SPRINTS_CAN_DOI_VA_RO_TRINH_MO_RONG.md](docs/TRELLO_4_SPRINTS_CAN_DOI_VA_RO_TRINH_MO_RONG.md) & [docs/KE_HOACH_NANG_CAP_TINH_NANG_VA_TRANG_MOI.md](docs/KE_HOACH_NANG_CAP_TINH_NANG_VA_TRANG_MOI.md)  
> 📌 **Quy mô đồ án OJT**: Đúng 4 Sprint (Sprint 1, 2, 3, 4) — **Sprint 4 là Sprint cuối cùng của đồ án**. Không có Sprint 5.

| Sprint | Thời gian & Trọng tâm Nghiệp vụ | Thẻ Trello Live | Story Points (SP) | Deliverables Then Chốt | Trạng Thái Live |
|:---:|---|:---:|:---:|---|:---:|
| **Sprint 1** | **Foundation & Master Data**: Khởi tạo kiến trúc Modular Monolith, CSDL 36 bảng Supabase Cloud, Stateless JWT Bearer RBAC 3 vai trò, Master Data bến xe & xe 34 chỗ VIP | **38 Thẻ** | **69 SP** | CSDL 36 bảng chuẩn hóa, Spring Security 6 JWT Bearer 3 vai trò, Master Data bến xe & sơ đồ xe 34 chỗ, Docker compose | **`Done Sprint 1` (38/38 - 100%)** |
| **Sprint 2** | **Core Booking & Full Portals Engine**: Đặt vé thời gian thực, Giữ chỗ SSE/Pessimistic Lock, Thanh toán VietQR/VNPAY Serializable, Cổng Nhà xe 10 trang, Cổng Admin 10 trang | **38 Thẻ** | **74 SP** | SWR Cache 0ms, Sơ đồ VIP 2 tầng, Pessimistic Lock chống cướp vé, VietQR Napas PayOS & VNPAY Serializable, Cổng Nhà xe 10 trang, Cổng Admin 10 trang | **`Done Sprint 2` (38/38 - 100%)** *(Cân đối đều với Sprint 1)* |
| **Sprint 3** | **Integration Testing & Real-time Check-in**: Kiểm thử tích hợp liên cổng E2E, Hợp đồng API, Tra cứu vé Offline LocalStorage, Soát vé QR Camera trong 0.2s, Kiểm duyệt đánh giá & Trợ lý AI du lịch | **40 Thẻ** | **120 SP** | Trọn bộ kiểm thử tích hợp liên cổng E2E, API Contract Testing, Tra cứu vé offline qua LocalStorage, Quét mã QR camera 0.2s, Kiểm duyệt đánh giá & AI du lịch | **`Done Sprint 3` (40/40 - 100%)** |
| **Sprint 4** | **Production Readiness & Final Defense**: Giám sát Micro-Core (`/health`, `/health/readiness`), Correlation ID Tracing (`X-Correlation-Id`), Tối ưu độ trễ, Kịch bản Demo Hub 15' (`/demo`), Sổ tay vận hành Runbook | **44 Thẻ** | **220 SP** | Health & Readiness probes, Correlation ID phân tán, Tối ưu Core Web Vitals di động, Kịch bản Demo Hub 15 phút, Tài liệu vận hành Runbook & Bàn giao *(Sprint cuối đồ án)* | **`Done Sprint 4` (44/44 - 100%)** |
| **TỔNG CỘNG** | **Toàn Bộ 4 Sprint Hoàn Thiện Chuẩn OJT** | **160 Thẻ** | **483 SP** | **160/160 Thẻ Hoàn Thành 100% (Không tồn đọng lỗi chặn)** | **100/100 ĐIỂM** |

---

### 2.7 Lộ Trình Nâng Cấp Tính Năng Mở Rộng & Các Trang Chức Năng Mới (Post-MVP Roadmap)

> 💡 **Chính sách phân bổ công việc nâng cấp**:  
> * **Phạm Công Thành (Nhóm trưởng / System Architect)**: **0 task mới** *(Đã hoàn thành khối lượng lớn nhất: Core Architecture, Cổng Nhà Xe 10 trang, CSDL 36 bảng, Docker, CI/CD, Tracing, Health Monitoring)*.  
> * **Phân chia đều cho 4 thành viên còn lại**: **Nguyễn Đại Phát**, **Phạm Thanh Phong**, **Đoàn Nhật Cường**, **Trần Minh Đức** *(Phan Trung Kiên: Miễn OJT)*.

| STT | Trang Màn Hình / Phân Hệ Mới | Nghiệp Vụ Nâng Cấp Cốt Lõi | Thành Viên Phụ Trách | Ý Nghĩa Thực Tế |
|:---:|:---|:---|:---:|:---|
| **1** | **Cho thuê xe hợp đồng du lịch**<br>[`/charter`](http://localhost:5173/charter) | Thuê trọn gói xe 16-29-34-45 chỗ có tài xế cho đoàn khách, cơ quan, gia đình; tự tính cước theo km & ngày. | **Nguyễn Đại Phát** | Tăng doanh thu hợp đồng du lịch cho các đối tác nhà xe |
| **2** | **Quản trị giá vé động & Flash Sale**<br>[`/company/pricing-rules`](http://localhost:5173/company/pricing-rules) | Nhà xe thiết lập luật giá linh hoạt: Giảm 20% chuyến đêm, giảm 15% đặt sớm, tự tăng 10% khi còn dưới 5 ghế trống. | **Nguyễn Đại Phát** | Tối ưu hóa doanh thu (Yield Management) và tỷ lệ lấp đầy ghế |
| **3** | **Cổng đại lý vé xe & Điểm bán bến**<br>[`/agent/portal`](http://localhost:5173/agent/portal) | Điểm bán vé tại bến xe / đại lý du lịch đặt vé hộ khách nhận hoa hồng 5-8%, in vé nhiệt POS 80mm có QR code. | **Phạm Thanh Phong** | Mở rộng mạng lưới phân phối vé đa kênh Offline-to-Online |
| **4** | **Backend GPS Live Tracking & Stream tọa độ**<br>`POST /api/v1/tracking/ping` & SSE | Tiếp nhận tọa độ GPS từ xe khách, tính khoảng cách (Haversine) và thời gian đến bến (ETA) phát realtime qua SSE. | **Phạm Thanh Phong** | Trải nghiệm theo dõi xe hiện đại như Grab/Be |
| **5** | **Backend Động cơ tính cước gửi bưu kiện**<br>`POST /api/v1/cargo/orders` | Tính cước theo thể tích ($D \times R \times C / 5000$) và cân nặng, kiểm soát tải trọng hầm xe, sinh mã `CG-*`. | **Phạm Thanh Phong** | Tận dụng 100% khoang hầm xe tạo dòng tiền phụ trợ 30-40% |
| **6** | **Trung tâm cứu hộ & Hỗ trợ 24/7**<br>[`/support`](http://localhost:5173/support) | Live Chat trực tuyến, gửi Ticket khiếu nại (quên đồ trên xe, tài xế thô lỗ), danh bạ hotline khẩn cấp các hãng xe. | **Đoàn Nhật Cường** | Nâng cao chất lượng dịch vụ và niềm tin của hành khách |
| **7** | **Bản đồ GPS Live Tracking trên di động**<br>[`/tracking/:tripId`](http://localhost:5173/tracking) | Giao diện bản đồ tương tác Leaflet/Mapbox hiển thị vị trí xe đang chạy trên quốc lộ và đếm lùi thời gian đón. | **Đoàn Nhật Cường** | Hành khách không phải ra bến chờ lâu hay lo lắng lỡ chuyến |
| **8** | **Bảo hiểm chuyến đi & Bồi thường online**<br>[`/insurance`](http://localhost:5173/insurance) | Quyền lợi bảo hiểm tai nạn tới 400 triệu, mất hành lý tới 5 triệu; nộp hồ sơ claim online nhận tiền đền bù vào tài khoản. | **Trần Minh Đức** | Tăng độ an tâm cho khách và doanh thu phí bảo hiểm sàn |
| **9** | **Giao diện đặt gửi bưu kiện & Tra cứu vận đơn**<br>[`/cargo`](http://localhost:5173/cargo) | Form nhập thông tin kiện hàng, tính cước tức thì, in phiếu gửi có mã vạch barcode, tra cứu lộ trình bưu kiện. | **Trần Minh Đức** | Khách hàng chủ động gửi hàng mà không cần gọi điện thoại |
| **10** | **Ví điểm thưởng EasyXu & Vòng quay may mắn**<br>[`/rewards`](http://localhost:5173/rewards) | Tích lũy 1-5% xu thưởng sau chuyến đi, cấn trừ xu khi mua vé (1 xu = 1đ), vòng quay may mắn mỗi ngày nhận voucher. | **Trần Minh Đức** | Giữ chân khách hàng trung thành (Customer Retention) |"""

content_norm = content.replace("\r\n", "\n")
old_norm = OLD_SECTION.replace("\r\n", "\n")
new_norm = NEW_SECTION.replace("\r\n", "\n")

if old_norm in content_norm:
    content_norm = content_norm.replace(old_norm, new_norm)
    if "\r\n" in content:
        with open(README_PATH, "w", encoding="utf-8", newline="\r\n") as f:
            f.write(content_norm.replace("\n", "\r\n"))
    else:
        with open(README_PATH, "w", encoding="utf-8", newline="\n") as f:
            f.write(content_norm)
    print("✅ Successfully updated README.md with 4 Sprints & Post-MVP Roadmap!")
else:
    print("❌ Could not find OLD_SECTION in README.md")

