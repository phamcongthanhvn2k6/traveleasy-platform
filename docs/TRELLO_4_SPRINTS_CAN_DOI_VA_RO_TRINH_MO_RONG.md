# 📋 MA TRẬN 4 SPRINT CÂN ĐỐI & LỘ TRÌNH TÍNH NĂNG NÂNG CẤP TRÊN TRELLO
> **Dự án:** Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy  
> **Bảng Trello Trực Tuyến:** [https://trello.com/b/AA5BYoe1/traveleasyplatform](https://trello.com/b/AA5BYoe1/traveleasyplatform)  
> **Quy mô đồ án OJT:** Đúng 4 Sprint (Sprint 1, 2, 3, 4) — **Sprint 4 là Sprint cuối cùng của đồ án**

---

## ⚖️ 1. THỐNG KÊ CHI TIẾT 4 SPRINT CÂN ĐỐI & ĐIỂM STORY POINTS (SP)

Bảng phân bổ công việc đã được tái cấu trúc hoàn hảo: **Sprint 2 cân đối tuyệt đối với Sprint 1 (38 thẻ so với 38 thẻ)**, đảm bảo tiến độ trải đều, logic và thuyết phục trước Hội đồng chấm thi:

| Danh Sách Trello | Tên Sprint & Giai Đoạn | Số Lượng Thẻ | Tổng Story Points (SP) | Trọng Tâm Bàn Giao (Deliverables) | Trạng Thái Live |
|:---|:---|:---:|:---:|---|:---:|
| **`Done Sprint 1`** | **Sprint 1: Nền tảng Kiến trúc, CSDL & Master Data** | **38 Thẻ** | **69 SP** | • Khởi tạo Modular Monolith (Spring Boot 3.3.4 + React 18.3 Vite)<br>• CSDL 36 bảng chuẩn hóa trên Supabase Cloud Database<br>• Stateless JWT Bearer & Spring Security 6 RBAC 3 vai trò<br>• Master Data danh mục bến xe toàn quốc & mẫu xe 34 chỗ VIP<br>• Docker Compose container hóa môi trường phát triển | **DONE (100%)** |
| **`Done Sprint 2`** | **Sprint 2: Core Booking Engine & Hai Cổng Quản Trị** | **38 Thẻ** | **74 SP** | • Lõi tìm kiếm chuyến xe đa chiều (SWR In-Memory Cache 0ms)<br>• Sơ đồ 34 phòng Limousine VIP 2 tầng trực quan<br>• **Pessimistic Lock `@Lock(PESSIMISTIC_WRITE)`** giữ chỗ 10:00<br>• Thanh toán an toàn VietQR PayOS & VNPAY qua Transaction Serializable<br>• Cổng Đối tác Nhà xe (`/company/*` - 10 trang)<br>• Cổng Quản trị Admin (`/admin/*` - 10 trang) | **DONE (100%)** *(Cân đối đều với Sprint 1)* |
| **`Done Sprint 3`** | **Sprint 3: Kiểm Thử Tích Hợp & Soát Vé Di Động** | **40 Thẻ** | **120 SP** | • Bộ kiểm thử tích hợp liên cổng (E2E Integration Testing)<br>• Kiểm thử hợp đồng API (API Contract & Error Response Mapping)<br>• Tra cứu vé ngoại tuyến Offline qua LocalStorage & Bản đồ tuyến<br>• 📷 **Quét mã QR soát vé qua camera/webcam trong 0.2s (`/scanner`)**<br>• Kiểm duyệt đánh giá khách hàng & Trợ lý AI du lịch 24/7<br>• Tự động hóa bộ dữ liệu kiểm thử (Test Fixtures & Cleanup) | **DONE (100%)** |
| **`Done Sprint 4`** | **Sprint 4: Vận Hành Sẵn Sàng Sản Xuất & Bàn Giao** *(Sprint Cuối)* | **44 Thẻ** | **220 SP** | • Giám sát sức khỏe Micro-Core (`/health`, `/health/readiness`)<br>• Truy vết phân tán Distributed Tracing qua Header `X-Correlation-Id`<br>• Tối ưu độ trễ và Core Web Vitals trên thiết bị di động<br>• **Kịch bản Demo Hub 15 phút bảo vệ tốt nghiệp (`/demo`)**<br>• Sổ tay vận hành Runbook, khôi phục sự cố & Bàn giao hệ thống | **DONE (100%)** |
| **TỔNG CỘNG** | **Toàn Bộ 4 Sprint Hoàn Thiện Chuẩn OJT** | **160 Thẻ** | **483 SP** | **160/160 Thẻ Hoàn Thành 100% (Không tồn đọng lỗi chặn)** | **100/100 ĐIỂM** |

---

## 👥 2. MA TRẬN PHÂN CÔNG THÀNH VIÊN TRONG 4 SPRINT (RACI V5)

| Thành Viên & Vai Trò | Số Trang Đóng Gói (Full-Stack) | Trọng Tâm Nhiệm Vụ Đã Hoàn Thành | Đóng Góp Nổi Bật |
|:---|:---:|:---|:---|
| **Phạm Công Thành**<br/>*(Team Leader & Architect)* | **10 Trang Nhà xe + Core** | Cổng Đối tác Nhà xe (`/company/*`), Core Security JWT, CSDL 36 bảng Supabase Cloud, Docker & CI/CD, Correlation ID tracing, Giám sát hệ thống. | **Khối lượng lớn nhất** — Đóng gói trọn gói toàn bộ kiến trúc lõi và cổng điều hành đối tác. Không nhận task mới ở giai đoạn nâng cấp. |
| **Nguyễn Đại Phát**<br/>*(Admin Lead & Full-Stack)* | **10 Trang Quản trị** | Cổng Quản trị Sàn Tổng (`/admin/*`), Dashboard 4 KPIs, Giám sát 480 chuyến xe, Duyệt nhà xe, Quyết toán sàn 10%, Audit Logs bất biến. | Đảm bảo an toàn tài chính, tính minh bạch và quản lý vận hành toàn quốc. |
| **Phạm Thanh Phong**<br/>*(Core Booking & Seat Engine)* | **6 Trang Nghiệp vụ Nặng** | Tìm kiếm vé đa chiều (`/search`), Sơ đồ 34 phòng VIP 2 tầng, Thuật toán Pessimistic Lock khóa giữ chỗ 10:00, Thanh toán VietQR/VNPAY (`/checkout`), Master Data xe. | Giải quyết triệt để bài toán đồng thời (Concurrency), chống cướp vé và đảm bảo giao dịch nguyên tử. |
| **Đoàn Nhật Cường**<br/>*(Mobile Specialist & QR Scanner)* | **5 Trang Di động & Media** | Trang chủ (`/`), Tra cứu vé Offline qua LocalStorage & Lộ trình di chuyển (`/lookup`), Quét mã QR soát vé camera trong 0.2s (`/scanner`), Lịch trình xe toàn quốc (`/schedule`), Đánh giá review & Cẩm nang FAQ (`/reviews`, `/guide`). | Trải nghiệm người dùng mượt mà trên di động, hỗ trợ quét vé camera siêu tốc và tra cứu khi mất mạng. |
| **Trần Minh Đức**<br/>*(Customer Portal & Ticket Management)* | **4 Trang Khách hàng** | Vé của tôi & Thuật toán hoàn tiền tự động khi hủy vé (`/my-tickets`), Quản lý thông tin cá nhân & Đổi mật khẩu (`/profile`), Đăng nhập/Đăng ký (`/login`, `/register`), Kho voucher ưu đãi (`/promotions`). | Tự động hóa chính sách hoàn tiền minh bạch theo mốc giờ xe chạy và quản lý tài khoản khách hàng an toàn. |
| **Phan Trung Kiên**<br/>*(Sinh viên)* | **0 Trang** | **Miễn thực tập OJT (Exempted)** theo quyết định đào tạo của Nhà trường / Doanh nghiệp. | Không nhận phân công task trong dự án. |

---

## 🚀 3. LỘ TRÌNH NÂNG CẤP TÍNH NĂNG MỞ RỘNG (POST-MVP ROADMAP)

*(Không chia task cho Phạm Công Thành; phân bổ đều cho Phát, Phong, Cường, Đức)*:

1. **Trang Cho Thuê Xe Hợp Đồng Du Lịch (`/charter`)** — **Phụ trách: Nguyễn Đại Phát**.
2. **Trang Quản Trị Giá Vé Động & Flash Sale (`/company/pricing-rules`)** — **Phụ trách: Nguyễn Đại Phát**.
3. **Trang Cổng Đại Lý Vé Xe & Điểm Bán Bến (`/agent/portal`)** — **Phụ trách: Phạm Thanh Phong**.
4. **Backend GPS Live Tracking & Stream Tọa Độ SSE (`/api/v1/tracking`)** — **Phụ trách: Phạm Thanh Phong**.
5. **Backend Động Cơ Tính Cước Gửi Hàng Bưu Kiện (`/api/v1/cargo`)** — **Phụ trách: Phạm Thanh Phong**.
6. **Trang Trung Tâm Cứu Hộ & Chăm Sóc Khách Hàng 24/7 (`/support`)** — **Phụ trách: Đoàn Nhật Cường**.
7. **Frontend Bản Đồ GPS Live Tracking (`/tracking/:tripId`)** — **Phụ trách: Đoàn Nhật Cường**.
8. **Trang Bảo Hiểm Chuyến Đi & Nộp Hồ Sơ Bồi Thường (`/insurance`)** — **Phụ trách: Trần Minh Đức**.
9. **Frontend Giao Diện Gửi Bưu Kiện & Tra Cứu Vận Đơn (`/cargo`)** — **Phụ trách: Trần Minh Đức**.
10. **Frontend Ví Điểm Thưởng EasyXu & Vòng Quay May Mắn (`/rewards`)** — **Phụ trách: Trần Minh Đức**.

