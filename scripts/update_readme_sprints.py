import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

README_PATH = "README.md"

with open(README_PATH, "r", encoding="utf-8") as f:
    content = f.read()

OLD_SECTION = """#### Lộ Trình Phân Chia 4 Sprint Hoàn Chỉnh (Đồng bộ 100% Bảng Trello Live):
> 📄 **Tài liệu chi tiết**: [docs/KE_HOACH_PHAN_CHIA_SPRINT_AGILE.md](docs/KE_HOACH_PHAN_CHIA_SPRINT_AGILE.md) & [docs/TRELLO_BOARD_MANAGEMENT.md](docs/TRELLO_BOARD_MANAGEMENT.md)

| Sprint | Thời gian & Trọng tâm | User Stories | Điểm SP | Deliverables then chốt | Trạng thái |
|:---:|---|:---:|:---:|---|:---:|
| **Sprint 1** | **Ngày 1 - 2**: Kiến trúc, CSDL Supabase, JWT & Master Data | US-03, US-04, US-06, US-11, US-14 | **23 SP** | CSDL 36 bảng, Stateless JWT RBAC, Master Data bến xe & xe 34 chỗ | **DONE (100%)** |
| **Sprint 2** | **Ngày 3 - 4**: Core Booking, Sơ đồ 2 tầng & Khóa Lock 10:00 | US-02, US-08, US-09, US-15 | **29 SP** | SWR Cache 0ms, Sơ đồ VIP 2 tầng, Pessimistic Lock chống cướp vé | **DONE (100%)** |
| **Sprint 3** | **Ngày 5 - 6**: Checkout, Cổng thanh toán & Vé QR Code | US-10, US-12, US-13, US-17 | **21 SP** | Thanh toán VietQR MB Bank/PayOS, Quét QR Camera 0.2s, Hủy vé tự động | **DONE (100%)** |
| **Sprint 4** | **Ngày 7**: Admin Portal, Cổng Nhà xe, Quyết toán & QA | US-01, US-05, US-07, US-16 | **22 SP** | Dashboard 4 KPIs, Quyết toán sàn 10%, Audit Logs & Pass 25 Test Cases | **DONE (100%)** |
| **Backlog** | **Phase 2 Roadmap**: Trợ lý AI RAG, Vé PDF, Sổ địa chỉ | US-21 đến US-25 | **19 SP** | Kế hoạch mở rộng hậu MVP phục vụ hội đồng chấm thi | **ROADMAP** |"""

NEW_SECTION = """#### Lộ Trình Phân Chia Sprint & Trạng Thái Đồng Bộ Bảng Trello Trực Tuyến:
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

# Normalize newlines
content_norm = content.replace("\r\n", "\n")
old_norm = OLD_SECTION.replace("\r\n", "\n")
new_norm = NEW_SECTION.replace("\r\n", "\n")

if old_norm in content_norm:
    content_norm = content_norm.replace(old_norm, new_norm)
    # Write back keeping original line ending style if CRLF was detected
    if "\r\n" in content:
        with open(README_PATH, "w", encoding="utf-8", newline="\r\n") as f:
            f.write(content_norm.replace("\n", "\r\n"))
    else:
        with open(README_PATH, "w", encoding="utf-8", newline="\n") as f:
            f.write(content_norm)
    print("✅ Successfully updated README.md with new Sprint structure & Sprint 5 backlog!")
else:
    print("❌ Could not find OLD_SECTION in README.md")

