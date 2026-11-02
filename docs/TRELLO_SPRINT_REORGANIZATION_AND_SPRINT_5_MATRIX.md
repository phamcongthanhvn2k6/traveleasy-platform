# 📋 MA TRẬN TÁI CẤU TRÚC SPRINT & CHUẨN HÓA SPRINT 5 TRÊN TRELLO
> **Dự án:** Nền Tảng Quản Lý Nhà Xe & Đặt Vé Xe Khách Liên Tỉnh TravelEasy  
> **Bảng Trello Trực Tuyến:** [https://trello.com/b/AA5BYoe1/traveleasyplatform](https://trello.com/b/AA5BYoe1/traveleasyplatform)  
> **Nhóm thực hiện (Nhóm 7):**
> 1. **Phạm Công Thành** — Trưởng nhóm (Team Leader & System Architect)
> 2. **Nguyễn Đại Phát** — Full-Stack Developer (Phụ trách Admin Portal & Đối soát)
> 3. **Phạm Thanh Phong** — Full-Stack Developer (Phụ trách Core Booking & Khóa Concurrency)
> 4. **Đoàn Nhật Cường** — Full-Stack / Mobile Specialist (Phụ trách Tra cứu vé Offline, QR Scanner & Đánh giá)
> 5. **Trần Minh Đức** — Full-Stack Developer (Phụ trách Vé của tôi, Hủy hoàn vé & Khuyến mãi)  
> *(Phan Trung Kiên: Miễn thực tập OJT theo quyết định đào tạo của Nhà trường / Doanh nghiệp)*

---

## 🔄 1. TỔNG QUAN TÁI CẤU TRÚC CÁC SPRINT (SPRINT REORGANIZATION)

Theo chỉ đạo tái cơ cấu tiến độ để chuẩn bị tốt nhất cho buổi bảo vệ đồ án:
1. **Gộp toàn bộ Sprint 3 vào Sprint 2**: Chuyển 40 thẻ tích hợp và kiểm thử nghiệm thu của Sprint 3 sang danh sách `Done Sprint 2`.
2. **Chia đôi Sprint 4**:
   - **Nửa đầu Sprint 4 (22 thẻ: S401 – S411)**: Chuyển sang danh sách `Done Sprint 2` (Gia cố xác thực, thanh toán, khóa ghế, tối ưu tìm kiếm, CI/CD, biến môi trường, tra cứu ngoại tuyến và soát vé).
   - **Nửa sau Sprint 4 (22 thẻ: S412 – S422)**: Chuyển sang danh sách `Done Sprint 3` (Giao diện thích ứng, rà soát thư viện, Correlation ID tracing, Core Web Vitals, tài liệu kỹ thuật Runbook, dữ liệu seed mẫu và Demo Hub 15').
3. **Chuẩn hóa Sprint 5**: Tạo mới danh sách `Sprint Backlog - SPRINT 5` với 12 thẻ chức năng mở rộng cao cấp (S501 – S506 cho cả FE và BE). Việc giao task cho từng thành viên cụ thể sẽ được phân bổ sau.

---

## 📊 2. SỐ LƯỢNG THẺ ĐỒNG BỘ TRỰC TIẾP TRÊN TRELLO LIVE

| Danh Sách Trello (List Name) | Số Lượng Thẻ | Trạng Thái & Ý Nghĩa |
|:---|:---:|:---|
| **`Done Sprint 1`** | **38 Thẻ** | Hoàn thành 100% (Kiến trúc, CSDL Supabase 36 bảng, Stateless JWT RBAC, Docker) |
| **`Done Sprint 2`** | **100 Thẻ** | Hoàn thành 100% (Core Booking, Pessimistic Lock, Thanh toán VietQR/VNPAY, Cổng Nhà xe 10 trang, Cổng Admin 10 trang, trọn bộ Suite kiểm thử tích hợp & nghiệm thu) |
| **`Done Sprint 3`** | **22 Thẻ** | Hoàn thành 100% (Production Readiness, Health/Readiness Probes, Distributed Tracing `X-Correlation-Id`, Tối ưu Core Web Vitals, Kịch bản Demo Hub 15' & Runbook) |
| **`Done Sprint 4`** | **0 Thẻ** | Đã sáp nhập hoàn toàn vào Sprint 2 và Sprint 3 |
| **`Sprint Backlog - SPRINT 5`** | **12 Thẻ** | Sẵn sàng triển khai (6 tính năng cao cấp: GPS Live Tracking, Cargo, Loyalty EasyXu, Hotel Combo, Driver Portal, Multi-channel Notification Engine) |

---

## 🎯 3. DANH SÁCH 12 THẺ SPRINT 5 (SPRINT BACKLOG - SPRINT 5)

> 💡 **Phân công nhiệm vụ**: Chưa gán thành viên ("việc giao task cho ai sẽ để sau đi").

| STT | Mã Thẻ | Tên Thẻ & Nghiệp Vụ | Phân Tầng | SP | Ưu Tiên | Nhãn Trello |
|:---:|:---:|:---|:---:|:---:|:---:|:---|
| 1 | `[S501]` | Bản đồ theo dõi lộ trình và vị trí xe khách thời gian thực (`/tracking/:tripId`) | Frontend | 5 SP | Ưu tiên 1 | `Frontend`, `Sprint 5` |
| 2 | `[S501]` | Dịch vụ tính toán ETA, khoảng cách và tiếp nhận tọa độ GPS xe khách (`/api/v1/tracking`) | Backend | 5 SP | Ưu tiên 1 | `Backend`, `Sprint 5` |
| 3 | `[S502]` | Giao diện đặt gửi bưu kiện, tra cứu vận đơn và tính cước hàng hóa (`/cargo`) | Frontend | 5 SP | Ưu tiên 2 | `Frontend`, `Sprint 5` |
| 4 | `[S502]` | Động cơ tính cước vận chuyển bưu kiện, quản lý tải trọng hầm xe và vận đơn (`/api/v1/cargo`) | Backend | 5 SP | Ưu tiên 2 | `Backend`, `Sprint 5` |
| 5 | `[S503]` | Giao diện ví điểm thưởng EasyXu, lịch sử tích xu và vòng quay may mắn (`/rewards`) | Frontend | 3 SP | Ưu tiên 2 | `Frontend`, `Sprint 5` |
| 6 | `[S503]` | Nghiệp vụ tích điểm tự động theo giá trị vé, khấu trừ xu và chống gian lận (`/api/v1/loyalty`) | Backend | 3 SP | Ưu tiên 2 | `Backend`, `Sprint 5` |
| 7 | `[S504]` | Giao diện đặt Combo du lịch trọn gói Vé xe + Khách sạn / Homestay (`/combos`) | Frontend | 5 SP | Ưu tiên 2 | `Frontend`, `Sprint 5` |
| 8 | `[S504]` | API kiểm tra tình trạng phòng khách sạn, ghép nối vé xe và khóa combo (`/api/v1/combos`) | Backend | 5 SP | Ưu tiên 2 | `Backend`, `Sprint 5` |
| 9 | `[S505]` | Cổng di động điều phối danh sách khách lên xe dành cho Tài xế / Phụ xe (`/driver/portal`) | Frontend | 5 SP | Ưu tiên 1 | `Frontend`, `Sprint 5` |
| 10 | `[S505]` | API điểm danh khách lên xe, gọi điện khẩn cấp và cập nhật trạng thái chuyến (`/api/v1/driver`) | Backend | 5 SP | Ưu tiên 1 | `Backend`, `Sprint 5` |
| 11 | `[S506]` | Giao diện cấu hình trung tâm thông báo đa kênh SMS, Zalo và Email (`/admin/notifications`) | Frontend | 3 SP | Ưu tiên 3 | `Frontend`, `Sprint 5` |
| 12 | `[S506]` | Dịch vụ tự động gửi thông báo đa kênh SMS Brandname, Zalo ZNS và Email vé (`/api/v1/notifications`) | Backend | 3 SP | Ưu tiên 3 | `Backend`, `Sprint 5` |

---

## 📑 4. BẢNG TỔNG KẾT PHÂN CÔNG THỰC TẾ TRONG NHÓM 7 (SPRINT 1 - 3)

| Thành Viên | Vai Trò Chính | Số Trang Đóng Gói (Full-Stack) | Trọng Tâm Nhiệm Vụ |
|:---|:---|:---:|:---|
| **Phạm Công Thành** | **Nhóm trưởng & System Architect** | **10 Trang Nhà xe + Core** | Cổng Đối tác Nhà xe (`/company/*`), Bảo mật Stateless JWT, CSDL 36 bảng Supabase Cloud, Docker & CI/CD, Correlation ID tracing, Giám sát hệ thống. |
| **Nguyễn Đại Phát** | **Admin Lead & Full-Stack** | **10 Trang Quản trị** | Cổng Quản trị Sàn Tổng (`/admin/*`), Dashboard 4 KPIs, Quản lý 480 chuyến xe, Duyệt nhà xe, Quyết toán sàn 10%, Audit Logs bất biến. |
| **Phạm Thanh Phong** | **Core Booking & Seat Engine** | **6 Trang Nghiệp vụ Nặng** | Tìm kiếm vé đa chiều (`/search`), Sơ đồ 34 phòng Limousine VIP 2 tầng, Thuật toán Pessimistic Lock khóa giữ chỗ 10:00, Thanh toán VietQR/VNPAY (`/checkout`), Master Data xe. |
| **Đoàn Nhật Cường** | **Mobile Specialist & QR Scanner** | **5 Trang Di động & Media** | Trang chủ (`/`), Tra cứu vé Offline qua LocalStorage & Lộ trình di chuyển (`/lookup`), Quét mã QR soát vé Camera trong 0.2s (`/scanner`), Lịch trình xe toàn quốc (`/schedule`), Đánh giá review & Cẩm nang FAQ (`/reviews`, `/guide`). |
| **Trần Minh Đức** | **Customer Portal & Ticket Management** | **4 Trang Khách hàng** | Vé của tôi & Thuật toán hoàn tiền tự động khi hủy vé (`/my-tickets`), Quản lý thông tin cá nhân & Đổi mật khẩu (`/profile`), Đăng nhập/Đăng ký (`/login`, `/register`), Kho voucher ưu đãi (`/promotions`). |
| **Phan Trung Kiên** | **Sinh viên** | **0 Trang** | **Miễn thực tập OJT (Exempted)** theo quy định đào tạo. Không nhận phân công task trong dự án. |

