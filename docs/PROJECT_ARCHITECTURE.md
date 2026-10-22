# KIẾN TRÚC HỆ THỐNG TRAVELEASY PLATFORM (PROJECT ARCHITECTURE)
## BẢN ĐẶC TẢ KIẾN TRÚC ĐỒNG BỘ MÃ NGUỒN PRODUCTION & CSDL 36 BẢNG
### MÃ DỰ ÁN: `PRJ-TRAVELEASY-MVP-01` | MÔ HÌNH VẬN HÀNH: VEXERE PLATFORM

---

> **TRẠNG THÁI TÀI LIỆU:** Production Architecture Specification (Đồng bộ 100% với mã nguồn `backend`, `frontend`, CSDL MySQL 8.0 `docs/schema.sql`, và `README.md`).  
> **PHIÊN BẢN:** 3.0 (Canonical Release).

---

## 1. TỔNG QUAN KIẾN TRÚC & QUYẾT ĐỊNH CỐT LÕI (ADR)

### 1.1 Bảng Quyết định Kiến trúc (Architectural Decision Records - ADR)

| Mã ADR | Quyết định | Lý do & Lợi ích kỹ thuật | Đánh đổi (Trade-offs) |
|---|---|---|---|
| **ADR-001** | **Modular Monolith** (Đơn ứng dụng Spring Boot 3 phân rã theo Domain Packages), **KHÔNG** dùng Microservices | Quy mô MVP Sprint 7 ngày gồm 36 bảng, 19 Aggregate Roots với các ràng buộc bất biến xuyên miền phức tạp (Giữ chỗ nguyên tử ↔ Đặt vé ↔ Thanh toán ↔ Hoàn tiền). Monolith loại bỏ hoàn toàn bài toán phân tán dữ liệu (Distributed Transactions / 2PC), đảm bảo tính nhất quán ACID tuyệt đối. | Khi quy mô hệ thống mở rộng lên hàng triệu người dùng sẽ cần phân tách dịch vụ độc lập; tuy nhiên kiến trúc Package-by-Feature hiện tại cho phép bóc tách thành Microservices dễ dàng. |
| **ADR-002** | **Java 21 LTS + Spring Boot 3.3.4 + Gradle 8.13** | Hỗ trợ Virtual Threads (Project Loom), tối ưu hóa I/O non-blocking cho các truy vấn DB đồng thời, Spring Data JPA chuẩn mực, Spring Security 6 với JWT không trạng thái (Stateless). Gradle tối ưu hóa thời gian build nhanh gấp 3 lần Maven. | Yêu cầu JDK 21 trên môi trường phát triển và Docker container. |
| **ADR-003** | **React 18.3.1 + Vite 5.4.8 + TypeScript 5.6.2** | Tốc độ Hot Module Replacement (HMR) tính bằng mili-giây, kiểm soát kiểu dữ liệu tĩnh nghiêm ngặt (Strict Type Safety), cấu trúc định tuyến phân tán (Modular Sub-Routers) giải quyết triệt để nguy cơ xung đột mã nguồn (Git Merge Hell). | Cần cấu hình TypeScript interfaces khớp 100% với Backend DTOs. |
| **ADR-004** | **Pessimistic Write Lock (`@Lock(PESSIMISTIC_WRITE)`)** trên kho ghế | Ngăn chặn triệt để hiện tượng tranh chấp đặt trùng vé (Overbooking) khi nhiều khách hàng cùng click vào 1 vị trí giường nằm tại cùng 1 thời điểm. | Khóa hàng (Row-level lock) trong MySQL trong thời gian thực thi giao dịch, cần cấu hình TTL giải phóng ghế sau 10 phút (600 giây). |
| **ADR-005** | **Two-Portal Physical Separation (Kiến trúc phân định 2 Phân hệ độc lập)** | Tách biệt hoàn toàn giao diện và quyền hạn giữa `Admin Portal` (Quản trị viên & Nhà xe) và `Client Portal` (Khách hàng) thông qua 2 Sub-Routers độc lập và URL Pattern `/api/v1/admin/**` có bảo vệ JWT Role-Based Access Control (RBAC). | Cần duy trì tính đồng bộ dữ liệu thông qua RESTful API chung. |

---

## 2. SƠ ĐỒ KIẾN TRÚC TỔNG THỂ HỆ THỐNG (SYSTEM ARCHITECTURE)

```
+----------------------------------------------------------------------------------------------------+
|                                    NGƯỜI DÙNG & TÁC NHÂN HỆ THỐNG                                   |
|   +------------------------------------+          +--------------------------------------------+   |
|   |   Khách Hàng (Customer Web/Mobile) |          |  Quản Trị Viên & Nhà Xe (Admin / Operator) |   |
|   +------------------------------------+          +--------------------------------------------+   |
+----------------------------------------------------------------------------------------------------+
                                      |                                  |
                                      v                                  v
+----------------------------------------------------------------------------------------------------+
|                              TẦNG GIAO DIỆN CLIENT (REACT 18 + VITE TS)                            |
|                                                                                                    |
|  [Client Portal Sub-Router: clientRoutes.tsx]       [Admin Portal Sub-Router: adminRoutes.tsx]     |
|  - Trang chủ & Tìm kiếm chuyến xe (/)               - Dashboard Hub & Thống kê 4 KPI (/admin)      |
|  - Sơ đồ 34 ghế Limousine 2 tầng (/seats)          - Quản lý Chuyến xe & Tự sinh 34 ghế (/trips)  |
|  - Khóa giữ chỗ đếm ngược 10:00 (/seat-lock)        - Quản lý Đội xe, Nhà xe & Biển số (/fleet)    |
|  - Form Đặt vé & Điểm đón/trả (/checkout)           - Quản lý Tuyến đường & Trạm dừng (/routes)    |
|  - Cổng thanh toán VietQR / VNPay (/payment)        - Cấu hình Chính sách hủy vé (/policies)       |
|  - Thẻ vé điện tử Boarding Pass QR (/tickets)       - Phân quyền Người dùng RBAC (/users)          |
|  - Tra cứu vé & Đánh giá dịch vụ (/lookup, /reviews)- Nhật ký Audit Log & Duyệt đánh giá (/audit)  |
|                                                                                                    |
|  Design System: CSS Custom Properties (--primary, --surface, --text) + Semantic Responsive Grid    |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                   HTTP / RESTful API (JSON) + Bearer JWT
                                                  v
+----------------------------------------------------------------------------------------------------+
|                               TẦNG BACKEND SPRING BOOT 3 (JAVA 21 LTS)                             |
|                                                                                                    |
|  [Security & Cross-Cutting Layer]                                                                  |
|  - Spring Security 6.x + Stateless JWT Filter (BCryptPasswordEncoder, Token Expiration 24h)        |
|  - Global Exception Handler: @RestControllerAdvice, chuẩn hóa ApiResponse<T> & ErrorCodes          |
|  - CORS Filter: Cho phép Frontend (port 3000, 5173, production domain) kết nối API                  |
|                                                                                                    |
|  [Presentation Layer - Controllers]                                                                |
|  - com.traveleasy.controller.auth       : AuthenticationController (Login, Register, Profile)      |
|  - com.traveleasy.controller.admin      : AdminDashboard, Trip, Fleet, Route, Policy, User, Audit  |
|  - com.traveleasy.controller.company    : CompanyManagementController (Đối tác nhà xe vận hành)   |
|  - com.traveleasy.controller.customer   : TripSearch, SeatLock, Booking, Payment, Ticket, Review   |
|  - com.traveleasy.controller.ai         : AiAssistantController (Trợ lý du lịch & AI mô tả)        |
|                                                                                                    |
|  [Application Service Layer - Business Logic & Invariants]                                         |
|  - TripService, SeatLockService, BookingOrchestratorService, PaymentService, TicketLookupService   |
|  - Rules: Overbooking Prevention, 10-min Hold TTL, Snapshot Immutability, Cancellation Matrix     |
|                                                                                                    |
|  [Domain & Persistence Layer - Spring Data JPA & Invariants]                                       |
|  - 36 JPA Entities mapping chính xác cấu trúc CSDL MySQL 8.0                                       |
|  - Repositories: Pessimistic Lock Query (@Lock(PESSIMISTIC_WRITE)), Dynamic Search Specifications  |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                      JDBC / HikariCP Connection Pool
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                      TẦNG CƠ SỞ DỮ LIỆU & LƯU TRỮ                                  |
|                                                                                                    |
|  [Primary Database: MySQL 8.0 Community / Production Engine InnoDB]                               |
|  - 36 Bảng chuẩn hóa quan hệ (3NF)                                                                 |
|  - Kho ghế 2 tầng: trip_seats (136 ghế cho 4 chuyến mẫu)                                           |
|  - Trigger & Invariants: Khóa snapshot giá vé, lịch sử chuyển trạng thái, bất biến giao dịch       |
|                                                                                                    |
|  [Cloud Synced Database: Supabase PostgreSQL]                                                      |
|  - Cấu hình đồng bộ kiểm tra trực quan sơ đồ CSDL đám mây cho toàn bộ nhóm phát triển              |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. CẤU TRÚC MÃ NGUỒN VẬT LÝ CHI TIẾT (PHYSICAL PROJECT STRUCTURE)

### 3.1 Backend - Spring Boot 3 Package Structure (`backend/src/main/java/com/traveleasy/`)

Hệ thống được thiết kế theo cấu trúc **Package-by-Feature kết hợp Clean Layered Architecture**:

```
backend/
├── build.gradle                              # Gradle 8.13 build script (Java 21, Spring Boot 3.3.4)
├── Dockerfile                                # Multi-stage build OpenJDK 21
├── src/
│   ├── main/
│   │   ├── java/com/traveleasy/
│   │   │   ├── TraveleasyApplication.java   # Main entry point (@SpringBootApplication)
│   │   │   ├── common/                      # Dùng chung toàn hệ thống
│   │   │   │   ├── dto/                     # ApiResponse<T>, PageResponse<T>
│   │   │   │   └── exception/               # GlobalExceptionHandler, BusinessException, ResourceNotFound
│   │   │   ├── config/                      # WebMvcConfig, OpenApiConfig (Swagger-UI), CorsConfig
│   │   │   ├── controller/                  # REST API Controllers (Phân định theo phân hệ)
│   │   │   │   ├── admin/                   # Admin controllers (Dashboard, Trips, Fleet, Routes, Users)
│   │   │   │   ├── auth/                    # AuthController (Đăng nhập, Đăng ký, JWT Profile)
│   │   │   │   ├── company/                 # CompanyManagementController (Portal Nhà xe đối tác)
│   │   │   │   ├── customer/                # Customer controllers (Search, SeatLock, Checkout, Tickets)
│   │   │   │   └── ai/                      # AiAssistantController (Tích hợp AI)
│   │   │   ├── dto/                         # Request / Response DTOs theo từng nghiệp vụ
│   │   │   ├── entity/                      # 36 JPA Entities ánh xạ 100% CSDL MySQL
│   │   │   ├── repository/                  # Spring Data JPA Repositories
│   │   │   ├── security/                    # Spring Security 6, JwtTokenProvider, JwtAuthFilter
│   │   │   └── service/                     # Nghiệp vụ cốt lõi (Admin, Company, Customer, Auth, AI)
│   │   └── resources/
│   │       ├── application.properties       # Cấu hình đa môi trường (dev, prod, test)
│   │       ├── application-dev.properties   # H2 In-Memory DB profile
│   │       └── application-prod.properties  # MySQL 8.0 Production profile
│   └── test/
│       └── java/com/traveleasy/             # Bộ kiểm thử tích hợp & Unit tests
```

### 3.2 Frontend - React 18 Modular Structure (`frontend/src/`)

```
frontend/
├── package.json                             # React 18.3.1, Vite 5.4.8, React Router v6
├── vite.config.ts                           # Vite configuration with proxy to port 8080
├── Dockerfile                               # Node build + Nginx alpine production image
├── src/
│   ├── App.tsx                              # App Root tích hợp 2 Sub-Routers
│   ├── index.css                            # CSS Custom Properties, Global Typography, Animations
│   ├── components/                          # Component dùng chung (Navbar, Footer, AdminNav, Toast, Modal)
│   ├── context/                             # AuthContext (quản lý phiên đăng nhập & JWT token)
│   ├── routes/
│   │   ├── adminRoutes.tsx                  # 7 Routes phân hệ Admin & Nhà xe (Role Protected)
│   │   └── clientRoutes.tsx                 # 10 Routes phân hệ Khách hàng công khai
│   ├── pages/
│   │   ├── admin/                           # 7 Trang quản trị (Dashboard, Trips, Fleet, Policies, Users...)
│   │   ├── company/                         # Trang điều hành nhà xe đối tác
│   │   ├── customer/                        # 10 Trang khách hàng (Home, Search, Seats, Checkout, Payment...)
│   │   └── common/                          # 404 NotFound, 403 Forbidden, Unauthorized
│   ├── services/
│   │   └── api.ts                           # Axios client cấu hình BaseURL & Interceptor đính kèm JWT
│   └── types/                               # TypeScript interfaces đồng bộ với Backend DTOs
```

---

## 4. QUY TẮC BẤT BIẾN NGHIỆP VỤ (BUSINESS INVARIANTS & OWNERSHIP RULES O1 - O5)

Toàn bộ hệ sinh thái tuân thủ 5 quy tắc bất biến sở hữu cốt lõi (được cam kết xuyên suốt từ CSDL đến Backend):

1. **Quy tắc O1 - Bất biến Giá vé Chuyến xe (`TripSeatPrice Snapshot`)**:
   - Giá vé trên mỗi chuyến xe mở bán là bản sao độc lập (snapshot) tại thời điểm khởi tạo chuyến từ Tuyến mẫu (`RouteTemplateSeatPrice`). Khi Nhà xe thay đổi giá trên Tuyến mẫu, giá của các chuyến xe ĐÃ mở bán không bao giờ bị biến động ngược.
2. **Quy tắc O2 - Bất biến Giá vé Đơn hàng (`Ticket.seatPrice`)**:
   - Khi hành khách đặt vé và thanh toán thành công, giá tiền ghi nhận trên `tickets.seat_price` và `bookings.total_amount` là bất biến. Mọi sự thay đổi về chính sách phụ thu hay giá niêm yết sau đó không làm thay đổi giá trị giao dịch lịch sử.
3. **Quy tắc O3 - Cơ chế Khóa giữ chỗ Concurrency (Pessimistic Lock & TTL 10:00)**:
   - Một ghế tại một chuyến xe chỉ có thể được giữ chỗ bởi duy nhất một phiên giao dịch. Trạng thái `LOCKED` có thời hạn tối đa 600 giây (10 phút). Nếu quá hạn mà không hoàn tất thanh toán, hệ thống tự động giải phóng về trạng thái `AVAILABLE`.
4. **Quy tắc O4 - Tính Toàn vẹn Lịch trình Trạm dừng (`TripPoints ETA Sequence`)**:
   - Lộ trình xe chạy gồm chuỗi các trạm dừng được sắp xếp tăng dần theo thứ tự `sequence`. Giờ đến dự kiến (`eta`) của trạm thứ `i` luôn bằng giờ đến của trạm `i-1` cộng thời gian di chuyển dự kiến giữa 2 trạm.
5. **Quy tắc O5 - Bất biến Giao dịch Hoàn tiền & Hủy vé (`Cancellation Policy Rule`)**:
   - Tỷ lệ hoàn tiền được áp dụng tự động dựa trên khoảng thời gian từ thời điểm bấm hủy vé đến giờ xe khởi hành:
     - Hủy trước > 24 giờ: Hoàn **90%** giá vé.
     - Hủy từ 12 đến 24 giờ: Hoàn **70%** giá vé.
     - Hủy dưới 12 giờ: **Không hoàn tiền (0%)**.

---

## 5. MÔ HÌNH BẢO MẬT PHÂN QUYỀN RBAC & JWT FLOW

Hệ thống bảo vệ phân định rõ ràng 4 vai trò cố định:
1. `ROLE_ADMIN` (Quản trị viên nền tảng): Toàn quyền truy cập mọi tài nguyên hệ thống và cấu hình toàn cục.
2. `ROLE_OPERATOR` (Điều hành viên nhà xe đối tác): Quản lý xe, chuyến đi và danh sách khách hàng thuộc phạm vi nhà xe của mình (`company_id`).
3. `ROLE_DRIVER` (Tài xế xe khách): Tra cứu danh sách hành khách lên xe, quét mã QR soát vé.
4. `ROLE_CUSTOMER` (Hành khách): Tìm kiếm, đặt vé, thanh toán, quản lý vé của chính mình, gửi đánh giá.

### Luồng Xác thực Stateless JWT:
```
Client -> [POST /api/v1/auth/login] -> AuthController
AuthController -> AuthenticationManager.authenticate()
-> Tìm User trong DB -> So khớp mật khẩu BCrypt -> Sinh JWT Token (HS256)
Client nhận JWT -> Lưu vào LocalStorage / Context
Mọi request tiếp theo: Header 'Authorization: Bearer <token>'
JwtAuthFilter -> Xác thực chữ ký token -> Trích xuất Username & Roles -> Đặt vào SecurityContextHolder
```

---

## 6. MÔ HÌNH DOCKER HÓA & VẬN HÀNH CLOUD

Hệ thống được đóng gói 100% bằng Containerization để đảm bảo tính nhất quán giữa môi trường lập trình và máy chủ chạy thực tế:

| Container Service | Image Base | Cổng nội bộ | Cổng công khai | Vai trò & Trách nhiệm |
|---|---|:---:|:---:|---|
| **`traveleasy-db`** | `mysql:8.0` | 3306 | `3306` | CSDL MySQL lưu trữ dữ liệu 36 bảng, tự động nạp `init.sql` khi khởi tạo. |
| **`traveleasy-backend`** | `eclipse-temurin:21-jre-alpine` | 8080 | `8080` | Máy chủ RESTful API Spring Boot 3, Swagger UI tại `/swagger-ui.html`. |
| **`traveleasy-frontend`** | `nginx:alpine` | 80 | `3000` | Web Server phân phối Single Page Application React đã được tối ưu hóa build. |

Hệ thống hỗ trợ khởi chạy tức thì chỉ với một câu lệnh:
```bash
docker compose up -d --build
```
Kiểm tra trạng thái sẵn sàng của toàn bộ hệ sinh thái qua:
```bash
docker compose ps
```
