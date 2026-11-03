# TÀI LIỆU VẬN HÀNH KIẾN TRÚC & QUY TRÌNH TRIỂN KHAI (RUNBOOK)
> **Dự án OJT:** Nền tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy  
> **Phiên bản:** v1.0.0-RELEASE (Sprint 3 - Vận hành Sẵn sàng Sản xuất)  
> **Nhóm thực hiện:** Nhóm 7 (Phạm Công Thành - Leader, Nguyễn Đại Phát, Phạm Thanh Phong, Đoàn Nhật Cường, Trần Minh Đức; Phan Trung Kiên: Miễn OJT)

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

Hệ thống **TravelEasy Platform** được xây dựng theo kiến trúc Monorepo phân tách rõ ràng giữa tầng hiển thị đa giao diện (Multi-Portal Frontend) và tầng lõi dịch vụ phân tán (Stateless Backend Micro-Core):

```
+-----------------------------------------------------------------------------------+
|                           CLIENT TIER (React 18 + Vite)                           |
|  - Cổng Khách Hàng (Customer Portal): /, /search, /checkout, /lookup, /my-tickets |
|  - Cổng Nhà Xe (Partner Portal): /company/* (Xe, chuyến, đối soát, soát vé QR)    |
|  - Cổng Quản Trị (Admin Portal): /admin/* (Doanh thu, duyệt đối tác, audit logs)  |
|  - Trung Tâm Trình Diễn (Demo & Health Hub): /demo                                |
+-----------------------------------------------------------------------------------+
                                        | (HTTPS / REST API / SSE Streams)
                                        v
+-----------------------------------------------------------------------------------+
|                        APPLICATION CORE (Spring Boot 3.3.x)                       |
|  [Security & Audit]                                                               |
|    - CorrelationIdFilter: Gắn X-Correlation-Id cho mọi request & MDC log context   |
|    - JwtAuthenticationFilter: Stateless Auth, Role-Based Access Control (RBAC)    |
|  [Business Modules]                                                               |
|    - Trip & Route Management (Tối ưu tìm kiếm đa tiêu chí, phân trang linh hoạt) |
|    - SeatRealtimeService (Pessimistic Lock, SSE Broadcast, Auto 10-min release)   |
|    - PaymentGatewayService (VietQR Pro Webhook, VNPAY Sandbox, Idempotency check) |
|    - CheckInService (Soát vé QR chữ ký SHA-256, Anti-rescan prevention)          |
|    - HealthController (/api/v1/health): Liveness, Readiness, JVM Metrics          |
|    - DemoController (/api/v1/demo): Reset seat locks, Seed test tickets           |
+-----------------------------------------------------------------------------------+
                                        |
                   +--------------------+--------------------+
                   v                                         v
+---------------------------------------+  +----------------------------------------+
|        DATABASE (PostgreSQL 16)       |  |          DISTRIBUTED CACHE             |
|  - Hosted trên Cloud Supabase         |  |  - Redis Cache / Spring Local Cache    |
|  - 18 Bảng quan hệ chuẩn hóa 3NF      |  |  - Lưu trữ kết quả tìm chuyến phổ biến |
|  - Chỉ mục đánh trên origin/dest/date |  |  - Cache cấu hình hệ thống & banners   |
+---------------------------------------+  +----------------------------------------+
```

---

## 2. TRUY VẾT YÊU CẦU & NHẬT KÝ KIỂM TOÁN (CORRELATION ID & AUDITING)

- **Cơ chế hoạt động:**
  Mọi yêu cầu gửi từ Frontend hoặc bên thứ 3 đều đi qua `CorrelationIdFilter`. Nếu request chưa có header `X-Correlation-Id`, filter tự động sinh chuỗi UUIDv4 mới:
  ```
  Client Request ---> [CorrelationIdFilter] ---> Gán MDC.put("correlationId", UUID)
                                            ---> Response Header: X-Correlation-Id: <UUID>
  ```
- **Lợi ích vận hành:**
  1. Khi phát sinh lỗi thanh toán hoặc xung đột ghế, người dùng chỉ cần cung cấp mã `X-Correlation-Id` từ response hoặc giao diện chẩn đoán.
  2. Kỹ sư vận hành dùng lệnh `grep <UUID> app.log` để xem trọn vẹn chuỗi gọi hàm từ Controller -> Service -> Repository -> Database.

---

## 3. CƠ CHẾ GIÁM SÁT SỨC KHỎE (HEALTH & READINESS PROBES)

Hệ thống cung cấp 3 endpoint giám sát tại `HealthController`:
- `GET /api/v1/health`: Kiểm tra toàn diện trạng thái hệ thống, ping cơ sở dữ liệu thực tế, đếm số người dùng, số chuyến xe và dung lượng RAM JVM đang tiêu thụ.
  ```json
  {
    "success": true,
    "message": "Hệ thống TravelEasy Platform đang hoạt động bình thường",
    "data": {
      "status": "UP",
      "version": "1.0.0-RELEASE",
      "uptimeMs": 45210,
      "database": "CONNECTED",
      "userCount": 25,
      "tripCount": 120,
      "memoryUsedMb": 380,
      "memoryTotalMb": 1024
    }
  }
  ```
- `GET /api/v1/health/liveness`: Dành cho Kubernetes Liveness Probe (HTTP 200: Container vẫn đang chạy).
- `GET /api/v1/health/readiness`: Dành cho Kubernetes Readiness Probe (HTTP 200: DB kết nối thông suốt, sẵn sàng nhận traffic).

---

## 4. QUY TRÌNH KHỞI ĐỘNG CỤC BỘ & TRIỂN KHAI (DEPLOYMENT)

### 4.1 Yêu cầu môi trường
- **Java:** OpenJDK 21 LTS
- **Node.js:** v18.x trở lên & npm 9.x+
- **Database:** PostgreSQL 16 (hoặc Supabase instance)

### 4.2 Khởi động Backend
```bash
cd backend
./gradlew bootRun
# Backend sẽ lắng nghe tại cổng http://localhost:8080
# Swagger UI tài liệu API: http://localhost:8080/swagger-ui.html
```

### 4.3 Khởi động Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend sẽ lắng nghe tại cổng http://localhost:5173
```

---

## 5. KỊCH BẢN PHỤC HỒI SỰ CỐ & QUAY LUI (ROLLBACK & DISASTER RECOVERY)

| Kịch Bản Sự Cố | Triệu Chứng | Thao Tác Xử Lý Khẩn Cấp (SOP) |
|:---|:---|:---|
| Ghế bị kẹt màu vàng do khách thoát trình duyệt | Khách khác không thể đặt ghế | Vào `http://localhost:5173/demo` -> Bấm nút **"Đặt Lại Ghế Khóa Tạm"** (hoặc gọi `POST /api/v1/demo/reset-seats`) |
| Lỗi Webhook thanh toán ngân hàng gián đoạn | Khách bị trừ tiền nhưng chưa có vé | Tra cứu giao dịch trong `payments` table -> Gọi endpoint kiểm tra trạng thái thanh toán hoặc cấp vé bổ sung |
| Phiên bản release mới phát sinh lỗi nghiêm trọng | Lỗi 500 diện rộng sau deploy | Thực hiện rollback Git: `git checkout tags/v0.9.5-stable` -> Build lại dist và restart container backend |
| Cơ sở dữ liệu quá tải kết nối (Connection pool exhaustion) | `HikariPool-1 - Connection is not available` | Khởi động lại service backend để reset pool; kiểm tra các truy vấn chậm trong PostgreSQL `pg_stat_activity` |

---

## 6. DANH SÁCH BIẾN MÔI TRƯỜNG CỐT LÕI (ENVIRONMENT CONFIGURATION)

| Biến Môi Trường | Mô Tả | Giá Trị Mặc Định / Mẫu |
|:---|:---|:---|
| `SPRING_DATASOURCE_URL` | Chuỗi kết nối JDBC PostgreSQL | `jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres` |
| `SPRING_DATASOURCE_USERNAME` | Tên người dùng database | `postgres.dkzrqnahy` |
| `SPRING_DATASOURCE_PASSWORD` | Mật khẩu kết nối database | (Bảo mật qua secret vault) |
| `JWT_SECRET` | Khóa bí mật ký mã HMAC-SHA256 | `traveleasy_secure_jwt_secret_key_super_secret_for_ojt_project_2026` |
| `JWT_EXPIRATION` | Thời hạn hiệu lực JWT token | `86400000` (24 giờ) |
| `VNPAY_TMN_CODE` | Mã định danh đơn vị VNPAY Sandbox | `VNPAYTRAVELEASY` |
| `VNPAY_HASH_SECRET` | Khóa bí mật checksum VNPAY | (Cung cấp bởi VNPAY Sandbox) |

