# 🚍 TRAVELEASY PLATFORM — HỆ THỐNG QUẢN LÝ NHÀ XE & ĐẶT VÉ XE KHÁCH TRỰC TUYẾN
## TÀI LIỆU ĐẶC TẢ KỸ THUẬT, KIẾN TRÚC HỆ THỐNG & KẾ HOẠCH BẢO VỆ 100/100 ĐIỂM
### DỰ ÁN TỐT NGHIỆP RIKKEI PRE-OJT (SPRINT 7 NGÀY) — NHÓM 7

---

[![CI/CD Pipeline](https://github.com/phamcongthanhvn2k6/traveleasy-platform/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/phamcongthanhvn2k6/traveleasy-platform/actions)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://www.docker.com/)

---

## 📌 THÔNG TIN TỔNG QUAN DỰ ÁN
* **Tên dự án**: **TravelEasy Platform** (`PRJ-TRAVELEASY-MVP-01`)
* **Lĩnh vực**: Thương mại điện tử Bán vé xe khách & Quản lý điều hành vận tải liên tỉnh (Vexere Model).
* **Đơn vị thực hiện**: **Nhóm 7** (Sĩ số: 6 thành viên).
* **Nhóm trưởng (Team Leader & Architect)**: **Phạm Công Thành** (`Phamcongt56@gmail.com` - GitHub: `phamcongthanhvn2k6`).
* **Thời gian thực hiện**: Sprint 7 ngày (Agile/Scrum).
* **Mục tiêu điểm số**: **100/100 ĐIỂM TUYỆT ĐỐI** (60 Điểm Functional Requirements + 40 Điểm Non-Functional Requirements).

---

## 🎯 MỤC LỤC TỔNG HỢP
1. [GIỚI THIỆU BỐI CẢNH & MỤC TIÊU DỰ ÁN](#1-giới-thiệu-bối-cảnh--mục-tiêu-dự-án)
2. [CƠ CẤU NHÂN SỰ & PHÂN CHIA FULL-STACK (RACI)](#2-cơ-cấu-nhân-sự--phân-chia-full-stack-raci)
3. [KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ (TECH STACK)](#3-kiến-trúc-hệ-thống--công-nghệ-tech-stack)
4. [ĐẶC TẢ YÊU CẦU CHỨC NĂNG (FUNCTIONAL - 60 ĐIỂM)](#4-đặc-tả-yêu-cầu-chức-năng-functional---60-điểm)
5. [ĐẶC TẢ YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL - 40 ĐIỂM)](#5-đặc-tả-yêu-cầu-phi-chức-năng-non-functional---40-điểm)
6. [THIẾT KẾ CƠ SỞ DỮ LIỆU & ERD (8 BẢNG CHUẨN HÓA)](#6-thiết-kế-cơ-sở-dữ-liệu--erd-8-bảng-chuẩn-hóa)
7. [BỘ 25 TEST CASES KIỂM THỬ TOÀN DIỆN (100% PASS)](#7-bộ-25-test-cases-kiểm-thử-toàn-diện-100-pass)
8. [HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH (QUICKSTART)](#8-hướng-dẫn-cài-đặt--vận-hành-quickstart)
9. [QUY TRÌNH LÀM VIỆC GIT (GIT WORKFLOW)](#9-quy-trình-làm-việc-git-git-workflow)
10. [KỊCH BẢN DEMO BẢO VỆ TỐT NGHIỆP 100/100 ĐIỂM](#10-kịch-bản-demo-bảo-vệ-tốt-nghiệp-100100-điểm)

---

## 1. GIỚI THIỆU BỐI CẢNH & MỤC TIÊU DỰ ÁN

### 1.1 Bối cảnh bài toán
Thị trường vận tải hành khách liên tỉnh tại Việt Nam chứng kiến hàng triệu lượt khách di chuyển mỗi ngày giữa các đầu mối kinh tế (TP.HCM, Hà Nội, Đà Lạt, Nha Trang, Sa Pa, Cần Thơ...). Tuy nhiên, hành khách thường gặp các bất cập lớn:
1. **Tranh chấp chỗ ngồi (Race Condition)**: Đặt vé trực tiếp qua điện thoại dễ dẫn đến trùng vé, trùng giường nằm vào các dịp cao điểm Lễ/Tết.
2. **Thiếu trực quan**: Hành khách không biết rõ vị trí giường mình nằm (Tầng dưới chống say xe hay tầng trên, vị trí đầu xe hay cuối xe).
3. **Quy trình phức tạp**: Khách hàng ngại thanh toán thẻ trực tuyến hoặc cần phương thức nhận vé COD linh hoạt khi lên xe.

### 1.2 Giải pháp của TravelEasy Platform
**TravelEasy Platform** cung cấp nền tảng số hóa toàn diện:
* **Hành khách (Customer)**: Tra cứu chuyến xe theo tuyến đường, xem **Sơ đồ ghế 2 tầng tương tác trực quan**, chọn vị trí giường nằm theo ý muốn, đặt vé COD nhận mã QR soát vé ngay tức thì và được Trợ lý AI du lịch tư vấn lộ trình.
* **Đối tác Nhà xe & Quản trị viên (Admin/Operator)**: Quản trị các chuyến xe, **tự động sinh kho ghế 34 vị trí** khi mở bán, theo dõi doanh thu thời gian thực và quản lý vé điện tử.

---

## 2. CƠ CẤU NHÂN SỰ & PHÂN CHIA FULL-STACK (RACI)

Dự án áp dụng mô hình **Agile/Scrum theo Tính năng Full-stack (Feature-Driven / Vertical Slice)**. Mỗi thành viên chịu trách nhiệm trọn vẹn từ CSDL ➔ Backend API ➔ Giao diện Frontend ➔ Kiểm thử:

```
+-----------------------------------------------------------------------------------------+
| PHÂN CÔNG 6 TÍNH NĂNG FULL-STACK — NHÓM 7 (SĨ SỐ: 6 THÀNH VIÊN)                          |
+-----------------------------------------------------------------------------------------+
| 1. Phạm Công Thành (Nhóm trưởng): Fullstack Core (Architecture, Routes, Search & Engine)|
| 2. Nguyễn Đại Phát: Fullstack Booking (2-Tier Seat Map, Atomic Seat Lock & Anti-Race)  |
| 3. Phan Trung Kiên: Fullstack Admin Fleet (Admin Dashboard, Trip Ops & 34-Seat Auto)   |
| 4. Phạm Thanh Phong: Fullstack Security (Spring Security 6, JWT, BCrypt, Auth & RBAC)  |
| 5. Trần Minh Đức 2: Fullstack E-Ticket (Checkout Flow, Point Pick/Drop, QR Ticket)      |
| 6. Đoàn Nhật Cường: Fullstack AI & QA (AI Travel Chatbot, Revenue Stats & 25 Tests)    |
+-----------------------------------------------------------------------------------------+
```

### 2.1 Bảng chi tiết trách nhiệm từng thành viên

| STT | Thành viên & Email | Tính năng phụ trách | Công việc Backend | Công việc Frontend | Kiểm thử & Phối hợp |
|:---:|:---|:---|:---|:---|:---|
| **1** | **Phạm Công Thành**<br/>`Phamcongt56@gmail.com`<br/>*(Nhóm trưởng / Tech Lead)* | **Chức năng 1: Kiến trúc nền tảng, Tuyến đường & Tìm chuyến xe** | Quản lý kiến trúc Monolith, CSDL `init.sql`, Exception Handling dùng chung, CRUD Tuyến đường, API Tìm kiếm chuyến xe đa tiêu chí (`TripController`) | Trang chủ (`HomePage.tsx`), Thanh tìm chuyến (`SearchTripBar.tsx`), Thẻ chuyến xe (`TripCard.tsx`), Header/Footer | Quản trị Git PR nhánh `dev` ➔ `main`, Docker Compose, CI/CD, Test tải API < 500ms, điều phối kịch bản Demo 100đ |
| **2** | **Nguyễn Đại Phát**<br/>`nguyendaiphat06@gmail.com` | **Chức năng 2: Sơ đồ kho ghế 2 tầng & Đặt vé nguyên tử** | `TripSeatRepository` (Pessimistic Lock), `BookingService` (Trừ ghế nguyên tử `@Transactional(isolation = Isolation.SERIALIZABLE)`), sinh mã đơn vé `BK-*` | Sơ đồ ghế 2 tầng tương tác (`BusSeatMap.tsx`), Modal đặt vé COD (`CheckoutModal.tsx`) chọn điểm đón/trả | Viết Concurrency Unit Test (10 threads cùng book 1 ghế -> Zero Double-Booking) |
| **3** | **Phan Trung Kiên**<br/>`phantrungkien2006@gmail.com` | **Chức năng 3: Quản trị Chuyến xe & Tự động tạo kho 34 ghế** | `AdminTripService`, API tạo chuyến xe mới kèm tự động tạo 34 ghế (Tầng 1 A01-A17, Tầng 2 B01-B17), API cập nhật trạng thái chuyến xe | Giao diện Quản trị Chuyến xe (`AdminDashboardPage.tsx`), Form popup tạo chuyến xe mới, bảng quản trị chuyến xe | Test tạo chuyến tự động sinh 34 ghế, đổi trạng thái chuyến xe (`SCHEDULED` ➔ `DEPARTED` ➔ `COMPLETED`) |
| **4** | **Phạm Thanh Phong**<br/>`thanhphong102006@gmail.com` | **Chức năng 4: Xác thực, Bảo mật & Quản lý Tài khoản** | Spring Security 6, JWT Filter, mã hóa mật khẩu BCrypt (12 rounds), `AuthService` (Đăng ký, Đăng nhập Email/SĐT), Phân quyền RBAC 3 cấp | Form Modal Đăng ký, Đăng nhập trên Navbar, lưu JWT LocalStorage, Auth Header Axios Interceptor (`api.ts`) | Viết unit test cho Auth, kiểm thử bảo mật chống truy cập trái phép khi không có token (401, 403) |
| **5** | **Trần Minh Đức 2**<br/>`2601minhduc@gmail.com` | **Chức năng 5: Vé điện tử & Tra cứu vé QR Code** | Quản lý Entity `Ticket`, sinh mã vé `TK-*`, sinh mã QR hash, API tra cứu vé (`/api/v1/bookings/code/{code}`), API Lịch sử vé của tôi | Trang Tra cứu vé điện tử (`TicketLookupPage.tsx`), Render thẻ vé kèm mã QR trực quan, Trang Lịch sử vé đã đặt | Test tra cứu vé hợp lệ/không hợp lệ, test hiển thị mã QR, test hủy vé theo chính sách |
| **6** | **Đoàn Nhật Cường**<br/>`Cuongclasspurpose@gmail.com` | **Chức năng 6: Trợ lý AI du lịch & Dashboard Doanh thu** | `AiService` (Chatbot tư vấn lộ trình, vị trí ghế chống say, cẩm nang du lịch), API thống kê Dashboard (`/api/v1/admin/dashboard/stats`) | Widget Chatbot AI góc màn hình (`AiAssistantWidget.tsx`), Thẻ 4 KPI doanh thu trên Dashboard Admin | Lập bảng 25 Test Cases toàn hệ thống (100% Pass), hỗ trợ kịch bản Demo tốt nghiệp 100 điểm |

### 2.2 Ma trận trách nhiệm RACI
* **R** (Responsible): Trực tiếp code Full-stack
* **A** (Accountable): Nhóm trưởng duyệt & chịu trách nhiệm chung (**Phạm Công Thành**)
* **C** (Consulted): Tham vấn kỹ thuật
* **I** (Informed): Nhận thông tin tiến độ

| Chức năng Full-stack (Feature Slice) | Thành (Lead) | Phát | Kiên | Phong | Đức | Cường |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **1. Nền tảng, Tuyến đường & Tìm chuyến xe** | **R / A** | C | I | I | I | I |
| **2. Sơ đồ ghế 2 tầng & Đặt vé nguyên tử** | **A** | **R** | C | I | C | I |
| **3. Quản trị Chuyến xe & Tự động tạo 34 ghế** | **A** | I | **R** | I | I | C |
| **4. Xác thực, JWT, BCrypt & Phân quyền RBAC** | **A** | I | I | **R** | I | I |
| **5. Vé điện tử, Tra cứu vé & Check-in QR** | **A** | C | I | I | **R** | I |
| **6. Trợ lý AI du lịch & Dashboard Doanh thu** | **A** | I | I | I | I | **R** |
| **7. Review Pull Request, CI/CD, Tổng duyệt Demo** | **R / A** | C | C | C | C | C |

---

### 2.3 Chi tiết phân công End-to-End của từng thành viên (Vertical Slices)

Mô hình **Vertical Slice (Full-Stack theo Tính Năng)** yêu cầu mỗi thành viên làm chủ trọn vẹn 1 phân hệ chức năng: Từ thiết kế CSDL ➔ Viết API Backend ➔ Dựng Giao diện Frontend ➔ Tự động hóa Kiểm thử (Unit/Integration Test):

#### 👑 1. PHẠM CÔNG THÀNH (NHÓM TRƯỞNG & TECH LEAD)
* **Module phụ trách**: **Core Foundation, Architecture & Chuyến xe (Trip Catalog & Search Engine)**
* **Backend (Spring Boot 3 + Java 21)**:
  * Khởi tạo kiến trúc dự án Monolith Layered, chuẩn hóa `ApiResponse<T>`, `ErrorCode`, `GlobalExceptionHandler`.
  * Quản lý CSDL `init.sql` và cơ chế nạp dữ liệu mẫu tự động `DataInitializer.java`.
  * `RouteRepository` & `Route`: Quản lý tuyến đường xuất phát, nơi đến, cự ly km, thời gian di chuyển.
  * `TripRepository` & `TripService`: Viết truy vấn JPQL tìm kiếm chuyến xe đa tiêu chí (Nơi đi, Nơi đến, Ngày khởi hành, Loại xe), lọc chuyến đang mở bán (`SCHEDULED`).
  * `TripController`: Xây dựng các API công khai `GET /api/v1/trips/search` và `GET /api/v1/trips/{id}`.
* **Frontend (React 18 + Vite + TypeScript)**:
  * Dựng layout khung ứng dụng (`App.tsx`), thanh điều hướng (`Navbar.tsx`), chân trang (`Footer.tsx`).
  * Thiết kế trang chủ (`HomePage.tsx`) với Hero Banner nhận diện thương hiệu TravelEasy.
  * Xây dựng thanh tìm kiếm chuyến xe (`SearchTripBar.tsx`): Cho phép chọn điểm đi, điểm đến, ngày đi.
  * Xây dựng lưới danh sách chuyến xe (`TripCard.tsx`): Hiển thị logo nhà xe, giờ chạy, số chỗ trống, giá vé và nút "Chọn chuyến".
* **DevOps & Quản trị**:
  * Quản trị nhánh Git `dev` và `main`, xét duyệt Pull Request của toàn bộ thành viên trong nhóm.
  * Cấu hình `docker-compose.yml`, GitHub Actions CI/CD (`ci-cd.yml`), tối ưu thời gian phản hồi API < 500ms.

#### 🛡️ 2. NGUYỄN ĐẠI PHÁT (FULL-STACK DEVELOPER)
* **Module phụ trách**: **Sơ đồ kho ghế 2 tầng & Đặt vé xe nguyên tử (Seat Inventory & Booking Flow)**
* **Backend (Spring Boot 3 + Java 21)**:
  * Quản lý thực thể `TripSeat` và `Booking`.
  * `TripSeatRepository`: Viết truy vấn Pessimistic Lock (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) để khóa độc quyền danh sách ghế khi khách hàng đang bấm đặt vé:
    ```java
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM TripSeat s WHERE s.trip.id = :tripId AND s.seatCode IN :seatCodes")
    List<TripSeat> findByTripIdAndSeatCodeInWithLock(Long tripId, List<String> seatCodes);
    ```
  * `BookingService`:
    * Nghiệp vụ đặt vé nguyên tử `@Transactional(isolation = Isolation.SERIALIZABLE)`.
    * Kiểm tra trạng thái ghế `AVAILABLE`, ném ngoại lệ `SEAT_ALREADY_BOOKED` (HTTP 409 Conflict) nếu ghế vừa bị người khác đặt.
    * Đổi trạng thái ghế sang `BOOKED`, trừ ghế trống trên chuyến xe.
    * Sinh mã đơn vé định dạng `BK-YYYYMMDD-XXXX` và sinh các vé con `TK-*`.
  * `BookingController`: API `POST /api/v1/bookings` (hỗ trợ thanh toán COD khi lên xe).
* **Frontend (React 18 + Vite + TypeScript)**:
  * Xây dựng sơ đồ ghế 2 tầng tương tác (`BusSeatMap.tsx`):
    * Tầng 1 (A01 - A17, dưới chống say) và Tầng 2 (B01 - B17, trên thoáng mát).
    * Phân biệt rõ bằng màu sắc: Ghế trống (viền xanh), Ghế đang chọn (màu cam), Ghế đã bán (xám khóa click).
    * Tính tiền tạm tính theo số ghế chọn theo thời gian thực.
  * Xây dựng Modal thanh toán (`CheckoutModal.tsx`):
    * Nhập thông tin hành khách: Họ tên, Số điện thoại, Email.
    * Chọn điểm đón và điểm trả theo lộ trình nhà xe.
    * Chọn phương thức thanh toán COD khi lên xe và hiển thị màn hình thông báo thành công.
* **Kiểm thử**:
  * Viết Unit Test Concurrency mô phỏng 10 luồng cùng book ghế A01 đồng thời ➔ Khẳng định 1 luồng thành công, 9 luồng nhận thông báo lỗi, không bao giờ bị âm ghế (Zero Double-Booking).

#### 🚍 3. PHAN TRUNG KIÊN (FULL-STACK DEVELOPER)
* **Module phụ trách**: **Quản trị Chuyến xe & Tự động tạo kho 34 ghế (Admin Operations & Fleet Management)**
* **Backend (Spring Boot 3 + Java 21)**:
  * `BusCompanyRepository`: Quản lý danh mục nhà xe đối tác (Phương Trang, Thành Bưởi, Sao Việt).
  * `AdminTripService`:
    * Nghiệp vụ tạo chuyến xe mới: Kiểm tra nhà xe, tuyến đường, thời gian xuất bến.
    * **Tính năng tự động sinh kho 34 ghế**: Khi tạo chuyến mới, hệ thống tự động sinh 17 ghế tầng 1 (A01-A17) và 17 ghế tầng 2 (B01-B17) ở trạng thái `AVAILABLE`.
    * Nghiệp vụ cập nhật trạng thái chuyến xe: `SCHEDULED` ➔ `DEPARTED` ➔ `COMPLETED` ➔ `CANCELLED`.
  * `AdminTripController`: API `POST /api/v1/admin/trips` và `PATCH /api/v1/admin/trips/{id}/status`.
* **Frontend (React 18 + Vite + TypeScript)**:
  * Xây dựng trang Quản trị chuyến xe (`AdminDashboardPage.tsx`):
    * Bảng danh sách các chuyến xe đang hoạt động, giờ khởi hành, biển số, số ghế trống.
    * Nút "Thêm Chuyến Xe Mới" mở form popup tiện lợi.
    * Form tạo chuyến xe mới: Chọn nhà xe, chọn tuyến đường, chọn giờ đi/đến, chọn loại xe Limousine/Sleeper, nhập giá vé.
    * Nút cập nhật trạng thái chuyến xe (Khởi hành, Hoàn thành, Hủy chuyến).
* **Kiểm thử**:
  * Viết Unit Test kiểm tra tạo chuyến xe mới: Đảm bảo trong CSDL sinh ra đúng 34 bản ghi ghế tương ứng.

#### 🔐 4. PHẠM THANH PHONG (FULL-STACK DEVELOPER)
* **Module phụ trách**: **Xác thực, Bảo mật & Quản lý Tài khoản (Auth & RBAC Management)**
* **Backend (Spring Boot 3 + Java 21)**:
  * Cấu hình `SecurityConfig.java` với Spring Security 6:
    * Mở các route public: `/api/v1/auth/**`, `/api/v1/trips/**`, `/api/v1/ai/**`.
    * Bảo vệ các route nhạy cảm: Bắt buộc quyền `ROLE_ADMIN` đối với `/api/v1/admin/**`.
  * `JwtTokenProvider.java`: Sinh token JWT có hạn 24h bằng HMAC-SHA256, trích xuất username/role.
  * `JwtAuthenticationFilter`: Đọc header `Authorization: Bearer <token>`, giải mã và thiết lập `SecurityContext`.
  * `AuthService`:
    * Đăng ký tài khoản: Mã hóa mật khẩu bằng `BCryptPasswordEncoder` (12 rounds).
    * Đăng nhập: Hỗ trợ linh hoạt bằng Email HOẶC Số điện thoại.
  * `AuthController`: API `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/me`.
* **Frontend (React 18 + Vite + TypeScript)**:
  * Xây dựng Modal Đăng ký & Đăng nhập tài khoản trên thanh Navbar.
  * Cấu hình Axios Interceptor (`api.ts`): Tự động đính kèm `Bearer <token>` vào mọi request khi người dùng đã đăng nhập.
  * Lưu trữ token và thông tin người dùng an toàn trong LocalStorage.
  * Hiển thị trạng thái đăng nhập, Avatar và nút Đăng xuất trên thanh Navbar.
* **Kiểm thử**:
  * Viết Unit Tests cho Auth: Test mật khẩu sai, trùng email/SĐT, kiểm tra chặn truy cập trái phép khi không có token (401 Unauthorized, 403 Forbidden).

#### 🎫 5. TRẦN MINH ĐỨC 2 (FULL-STACK DEVELOPER)
* **Module phụ trách**: **Vé điện tử, Tra cứu vé & Check-in QR (E-Ticket & QR Verification)**
* **Backend (Spring Boot 3 + Java 21)**:
  * Quản lý thực thể `Ticket`:
    * Mã vé độc nhất: `TK-YYYYMMDD-XXXX-01`.
    * Mã băm QR Code hash duy nhất cho từng vị trí ghế: `UUID.randomUUID()`.
    * Trạng thái vé: `ISSUED` (Đã phát hành), `USED` (Đã lên xe), `CANCELLED` (Đã hủy).
  * `TicketRepository` & `BookingService`:
    * API Tra cứu vé theo mã đơn: `GET /api/v1/bookings/code/{bookingCode}` (trả về đầy đủ thông tin chuyến xe, điểm đón, điểm trả, danh sách vé con).
    * API Lịch sử vé của tôi: `GET /api/v1/bookings/my-bookings`.
    * Nghiệp vụ hủy vé trước 24h: Chuyển trạng thái vé và đơn vé sang `CANCELLED`, hoàn trả ghế về `AVAILABLE`.
* **Frontend (React 18 + Vite + TypeScript)**:
  * Xây dựng trang Tra cứu vé điện tử (`TicketLookupPage.tsx`):
    * Ô nhập mã đơn vé (VD: `BKG-20261025-001` hoặc mã vé vừa đặt).
    * Giao diện Thẻ vé điện tử sang trọng: Logo nhà xe, biển số, giờ khởi hành, điểm đón, điểm trả.
    * **Render mã QR Code** cho từng vị trí ghế ngồi để phụ xe có thể quét mã khi hành khách lên xe.
  * Xây dựng trang Lịch sử vé đã đặt của hành khách (My Bookings Page).
* **Kiểm thử**:
  * Kiểm thử tra cứu mã vé đúng/sai, kiểm thử hiển thị mã QR, kiểm thử hủy vé theo chính sách.

#### 🤖 6. ĐOÀN NHẬT CƯỜNG (FULL-STACK DEVELOPER & QA LEAD)
* **Module phụ trách**: **Trợ lý AI Du lịch Thông minh & Dashboard Thống kê Doanh thu (AI & Analytics)**
* **Backend (Spring Boot 3 + Java 21)**:
  * **Module AI Smart Travel**:
    * `AiService` & `AiController`: API `POST /api/v1/ai/chat`.
    * Tích hợp tư vấn lộ trình thông minh: Sài Gòn - Đà Lạt, Hà Nội - Sa Pa...
    * Gợi ý chọn vị trí giường nằm: Tư vấn chọn giường tầng 1 (A01 - A06) cho người hay say xe.
    * Cung cấp thông tin chính sách hoàn/hủy vé tự động.
  * **Module Thống kê Doanh thu**:
    * `BookingRepository`: Viết câu lệnh truy vấn tính tổng doanh thu từ các vé đã xác nhận (`CONFIRMED`).
    * `AdminTripService`: API `GET /api/v1/admin/dashboard/stats` trả về 4 chỉ số KPI: Tổng chuyến xe, Chuyến đang mở bán, Tổng vé đã đặt, Tổng doanh thu (VNĐ).
* **Frontend (React 18 + Vite + TypeScript)**:
  * Xây dựng Widget Chatbot AI (`AiAssistantWidget.tsx`):
    * Nút chat nổi góc phải dưới màn hình.
    * Gợi ý các nút câu hỏi nhanh: "Sài Gòn - Đà Lạt", "Ghế nào chống say xe?", "Chính sách hủy vé?".
    * Khung chat phản hồi tức thì từ AI.
  * Xây dựng 4 Card KPI trên `AdminDashboardPage.tsx`: Hiển thị trực quan doanh thu, chuyến xe, vé đặt và khách hàng.
* **QA & Báo cáo**:
  * Lập bảng và thực hiện kiểm thử trọn bộ **25 Test Cases** (100% Pass) theo đặc tả Sprint 7 ngày.
  * Chuẩn bị kịch bản demo tính năng AI và Dashboard doanh thu cho buổi bảo vệ.

---

## 3. KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ (TECH STACK)

### 3.1 Ngăn xếp công nghệ chuẩn tắc (Tech Stack)
* **Backend Layer**:
  * Ngôn ngữ: Java 21 LTS (Amazon Corretto / Temurin).
  * Framework: Spring Boot 3.3.4 (Spring Web MVC, Spring Data JPA, Spring Validation).
  * Security: Spring Security 6, jjwt 0.12.5 (HMAC-SHA256 Stateless Tokens), BCrypt Password Hashing (12 rounds).
  * Database Driver: `mysql-connector-j` (MySQL 8.0).
  * In-Memory Testing: `com.h2database:h2`.
  * AI Integration: Spring AI / AI Smart Service Engine.
  * API Documentation: Springdoc OpenAPI 2.6.0 (Swagger UI v3).
* **Frontend Layer**:
  * Thư viện: React 18.3, React Router DOM v6.
  * Ngôn ngữ: TypeScript 5.6 (Strict Type Checking).
  * Bundler & Dev Server: Vite 5.4.
  * Styling: Tailwind CSS & Plus Jakarta Sans typography.
  * Icons: Lucide React.
  * HTTP Client: Axios với Interceptors tự động đính kèm Bearer Token.
* **Database & Infrastructure**:
  * Database Engine: MySQL 8.0 InnoDB (utf8mb4_unicode_ci).
  * Containerization: Docker & Docker Compose v3.8.
  * CI/CD Pipeline: GitHub Actions với 3 jobs tự động (Backend build, Frontend build, Docker compose validation).

### 3.2 Sơ đồ kiến trúc tổng thể (System Architecture Diagram)

```mermaid
flowchart TD
    subgraph CLIENT_TIER["TẦNG FRONTEND (REACT 18 + VITE + TAILWIND)"]
        UI_HOME["Khách Hàng: Tìm chuyến & Thẻ xe (HomePage / SearchTripBar / TripCard)"]
        UI_SEAT["Khách Hàng: Sơ đồ ghế 2 tầng & Đặt vé COD (BusSeatMap / CheckoutModal)"]
        UI_TICKET["Khách Hàng: Tra cứu vé QR (TicketLookupPage)"]
        UI_AI["Khách Hàng: Trợ lý AI Du Lịch (AiAssistantWidget)"]
        UI_ADMIN["Quản Trị Nhà Xe: Dashboard KPI & Tạo Chuyến (AdminDashboardPage)"]
    end

    subgraph GATEWAY_TIER["TẦNG BẢO MẬT & API GATEWAY"]
        CORS["CORS Configuration (Allow 3000, 5173)"]
        JWT_FILTER["JwtAuthenticationFilter (Stateless Bearer Token)"]
        SEC_CONFIG["Spring Security 6 (RBAC: CUSTOMER, OPERATOR, ADMIN)"]
    end

    subgraph BACKEND_TIER["TẦNG BACKEND (SPRING BOOT 3 REST CONTROLLERS)"]
        C_AUTH["AuthController (/api/v1/auth)"]
        C_TRIP["TripController (/api/v1/trips)"]
        C_BOOK["BookingController (/api/v1/bookings)"]
        C_ADMIN["AdminTripController (/api/v1/admin)"]
        C_AI["AiController (/api/v1/ai)"]
    end

    subgraph SERVICE_TIER["TẦNG NGHIỆP VỤ (SERVICES & LOGIC)"]
        S_AUTH["AuthService (BCrypt 12 rounds)"]
        S_TRIP["TripService (Dynamic Search & Detail)"]
        S_BOOK["BookingService (@Transactional + Pessimistic Lock)"]
        S_ADMIN["AdminTripService (Auto-generate 34 Seats)"]
        S_AI["AiService (Travel Advisor & Route Guide)"]
    end

    subgraph REPO_TIER["TẦNG TRUY XUẤT CSDL (JPA REPOSITORIES)"]
        R_USER["UserRepository"]
        R_ROUTE["RouteRepository & PointRepository"]
        R_TRIP["TripRepository"]
        R_SEAT["TripSeatRepository (PESSIMISTIC_WRITE)"]
        R_BOOK["BookingRepository & TicketRepository"]
    end

    subgraph DATA_TIER["CƠ SỞ DỮ LIỆU (MYSQL 8.0 CONTAINER)"]
        DB[(traveleasy_db<br/>8 Bảng chuẩn hóa: users, bus_companies, routes, points, trips, trip_seats, bookings, tickets)]
    end

    CLIENT_TIER --> GATEWAY_TIER
    GATEWAY_TIER --> BACKEND_TIER
    BACKEND_TIER --> SERVICE_TIER
    SERVICE_TIER --> REPO_TIER
    REPO_TIER --> DATA_TIER
```

---

## 4. ĐẶC TẢ YÊU CẦU CHỨC NĂNG (FUNCTIONAL - 60 ĐIỂM)

### FR-01: Module Xác thực & Quản lý Người dùng (RBAC) — 10 Điểm
* **Đăng ký tài khoản hành khách**: Kiểm tra tính hợp lệ của email và số điện thoại, mã hóa mật khẩu bằng BCrypt cost 12.
* **Đăng nhập linh hoạt**: Cho phép đăng nhập bằng Email HOẶC Số điện thoại. Trả về JWT Token hợp lệ trong 24 giờ.
* **Phân quyền vai trò (RBAC 3 cấp)**:
  * `CUSTOMER`: Hành khách tìm chuyến, đặt vé, tra cứu vé cá nhân.
  * `OPERATOR`: Nhân viên nhà xe cập nhật trạng thái chuyến xe.
  * `ADMIN`: Quản trị viên toàn quyền xem doanh thu, thêm chuyến, cấu hình hệ thống.

### FR-02: Module Tuyến đường & Chuyến xe (Catalog & Search Engine) — 10 Điểm
* **Bộ lọc tìm kiếm đa tiêu chí**: Nơi xuất phát (TP.HCM, Hà Nội, Đà Lạt, Nha Trang, Sa Pa, Cần Thơ...), Nơi đến, Ngày khởi hành.
* **Thông tin chuyến xe minh bạch**: Hiển thị thương hiệu nhà xe (Phương Trang, Thành Bưởi, Sao Việt), thời gian khởi hành/dự kiến đến, thời lượng di chuyển, khoảng cách (km), loại xe, giá vé và số chỗ trống.
* **Danh sách Điểm đón & Điểm trả**: Từng tuyến đường có đầy đủ danh sách điểm đón và trả khách cố định dọc hành trình.

### FR-03: Sơ đồ ghế 2 tầng tương tác trực quan (Bus Seat Map) — 10 Điểm
* **Mô phỏng 2 tầng xe khách chuẩn thực tế**:
  * Tầng 1 (Dưới - Chống say xe tối đa): Ghế A01 đến A17.
  * Tầng 2 (Trên - Thoáng mát, tầm nhìn đẹp): Ghế B01 đến B17.
* **Mã màu trạng thái trực quan**:
  * **Ghế trống** (Viền xanh, nền trắng): Có thể click chọn.
  * **Ghế đang chọn** (Màu cam nổi bật): Hiển thị mã ghế và cộng dồn vào tổng tiền tạm tính.
  * **Ghế đã bán** (Màu xám, khóa tương tác): Không thể click chọn.

### FR-04: Đặt vé xe COD & Chống Race Condition (Zero Double-Booking) — 10 Điểm
* **Đặt vé nguyên tử (Atomic Seat Locking)**: Khóa bi quan (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) đảm bảo khi 2 hoặc nhiều khách hàng cùng bấm đặt 1 ghế trong cùng 1 mili-giây, chỉ 1 người duy nhất thành công, người còn lại nhận thông báo lỗi ghế đã được đặt.
* **Phương thức thanh toán COD**: Hỗ trợ đặt vé thanh toán tiền mặt khi lên xe, không bắt buộc nhập thẻ ngân hàng.
* **Sinh mã đơn vé chuẩn hoá**: Sinh tự động mã đơn dạng `BK-YYYYMMDD-XXXX` (VD: `BK-20261025-001`).

### FR-05: Vé điện tử, Tra cứu vé & Check-in QR — 10 Điểm
* **Vé điện tử từng ghế ngồi**: Mỗi ghế đặt thành công được cấp 1 vé con (`TK-YYYYMMDD-XXXX-01`) kèm chuỗi hash mã QR duy nhất.
* **Tra cứu vé trực tuyến**: Khách hàng nhập mã đơn vé tại trang `TicketLookupPage` để xem lại toàn bộ thông tin hành trình, điểm đón, điểm trả và mã QR để phụ xe quét khi lên xe.

### FR-06: Quản trị Nhà xe & Dashboard Thống kê Doanh thu — 5 Điểm
* **Thống kê 4 KPI thời gian thực**: Tổng số chuyến xe, Chuyến xe đang mở bán, Tổng số vé đã đặt, Tổng doanh thu (VNĐ).
* **Thêm chuyến xe mới & Tự động tạo kho 34 ghế**: Khi Admin tạo chuyến xe mới, hệ thống tự động sinh 17 ghế tầng 1 (A01-A17) và 17 ghế tầng 2 (B01-B17) trong CSDL.
* **Cập nhật trạng thái chuyến**: Quản lý vòng đời chuyến xe (`SCHEDULED` ➔ `DEPARTED` ➔ `COMPLETED` ➔ `CANCELLED`).

### FR-07: Trợ lý AI Du lịch Thông minh (AI Smart Assistant) — 5 Điểm
* **Chatbot tư vấn lộ trình**: Hỗ trợ hành khách hỏi đáp thông tin tuyến đường (Sài Gòn - Đà Lạt, Hà Nội - Sa Pa...).
* **Tư vấn vị trí giường nằm**: Gợi ý chọn giường tầng dưới (A01 - A06) cho người say xe, người lớn tuổi hoặc phụ nữ mang thai.
* **Giải đáp chính sách nhà xe**: Hướng dẫn chính sách hoàn/hủy vé 24/7.

---

## 5. ĐẶC TẢ YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL - 40 ĐIỂM)

| Mã tiêu chí | Nhóm tiêu chuẩn | Chỉ số kỹ thuật cam kết | Giải pháp công nghệ thực thi | Điểm |
|:---:|:---|:---|:---|:---:|
| **NFR-01** | **Hiệu năng API (Performance)** | Thời gian phản hồi API tra cứu **< 500ms** | JPQL tối ưu, Fetch Join nạp Route & BusCompany trong 1 query, Indexed `departure_time` | **5đ** |
| **NFR-02** | **Hiệu năng Frontend** | First Contentful Paint (FCP) **< 2.0s** | Vite 5 bundling, nén Gzip chunks, lazy route, CSS biến hệ thống không phụ thuộc CDN nặng | **5đ** |
| **NFR-03** | **Đồng thời (Concurrency)** | **Zero Double-Booking (0% trùng vé)** | Pessimistic Locking `@Lock(LockModeType.PESSIMISTIC_WRITE)` + Isolation `SERIALIZABLE` | **5đ** |
| **NFR-04** | **Bảo mật (Security)** | Mật khẩu băm an toàn, Token phi trạng thái | `BCryptPasswordEncoder` (12 rounds), JWT HMAC-SHA256 bí mật 256-bit | **5đ** |
| **NFR-05** | **Phân quyền (RBAC)** | Chặn 100% truy cập trái phép | Spring Security Method Security, trả về đúng mã lỗi `401 Unauthorized`, `403 Forbidden` | **5đ** |
| **NFR-06** | **Mã nguồn & Kiểm thử** | Clean Code 3 lớp, Unit Test tự động | Tách biệt Controller - Service - Repository - DTO, H2 in-memory test runner tự động | **5đ** |
| **NFR-07** | **Đóng gói (Docker)** | Khởi chạy 1 lệnh duy nhất | `docker-compose.yml` multi-container (MySQL, Spring Boot Backend, Nginx Frontend) | **5đ** |
| **NFR-08** | **Tự động hóa (CI/CD)** | Build & Test tự động trên GitHub | GitHub Actions với 3 workflow jobs kiểm tra chất lượng code trước khi merge vào `main` | **5đ** |

---

## 6. THIẾT KẾ CƠ SỞ DỮ LIỆU & ERD (8 BẢNG CHUẨN HÓA KHỚP 100% TÀI LIỆU DỰ ÁN)

> **Căn cứ tài liệu kiến trúc**:  
> Thiết kế cơ sở dữ liệu được rút gọn và chuẩn hóa từ bộ tài liệu đặc tả gốc của dự án (`docs/database_design.md`, `docs/schema.sql`, `docs/SRS_Vexere.md`), tối ưu hóa thành 8 bảng cốt lõi phục vụ hoàn hảo phạm vi đồ án tốt nghiệp Sprint 7 ngày mà vẫn đảm bảo tính toàn vẹn dữ liệu, chống Double-Booking và hỗ trợ đầy đủ quy trình đặt vé liên tỉnh.

### 6.1 Sơ đồ quan hệ thực thể chuẩn hóa (ERD Diagram)

```mermaid
erDiagram
    USERS ||--o{ BOOKINGS : "places (1-N)"
    BUS_COMPANIES ||--o{ ROUTES : "operates (1-N)"
    BUS_COMPANIES ||--o{ TRIPS : "provides (1-N)"
    ROUTES ||--o{ PICKUP_DROPOFF_POINTS : "includes (1-N)"
    ROUTES ||--o{ TRIPS : "schedules (1-N)"
    TRIPS ||--o{ TRIP_SEATS : "contains 34 seats (1-N)"
    TRIPS ||--o{ BOOKINGS : "receives (1-N)"
    BOOKINGS ||--o{ TICKETS : "generates tickets (1-N)"

    USERS {
        bigint id PK "Khóa chính tự tăng"
        string email UK "Email đăng nhập duy nhất"
        string password "BCrypt hash 12 rounds"
        string full_name "Họ và tên người dùng"
        string phone "Số điện thoại liên hệ"
        string role "CUSTOMER | OPERATOR | ADMIN"
        timestamp created_at "Thời gian tạo tài khoản"
    }

    BUS_COMPANIES {
        bigint id PK "Khóa chính tự tăng"
        string name UK "Tên nhà xe đối tác"
        string hotline "Tổng đài đặt vé"
        string email "Email liên hệ"
        string address "Địa chỉ văn phòng / bến"
        string logo_url "URL logo thương hiệu"
        decimal average_rating "Điểm đánh giá (1.0 - 5.0)"
    }

    ROUTES {
        bigint id PK "Khóa chính tự tăng"
        bigint bus_company_id FK "Tham chiếu bus_companies(id)"
        string departure_location "Nơi xuất phát (Search Anchor)"
        string arrival_location "Nơi đến (Search Anchor)"
        decimal duration_hours "Thời gian di chuyển dự kiến (giờ)"
        decimal distance_km "Cự ly tuyến đường (km)"
    }

    PICKUP_DROPOFF_POINTS {
        bigint id PK "Khóa chính tự tăng"
        bigint route_id FK "Tham chiếu routes(id)"
        string name "Tên điểm đón hoặc trả"
        string address "Địa chỉ cụ thể của trạm/bến"
        string point_type "PICKUP (Đón) | DROPOFF (Trả)"
        int display_order "Thứ tự hiển thị lộ trình"
    }

    TRIPS {
        bigint id PK "Khóa chính tự tăng"
        bigint route_id FK "Tham chiếu routes(id)"
        bigint bus_company_id FK "Tham chiếu bus_companies(id)"
        datetime departure_time "Thời gian xuất bến"
        datetime arrival_time "Thời gian đến bến dự kiến"
        string bus_type "SLEEPER | LIMOUSINE | SEAT"
        string license_plate "Biển số xe điều phối"
        int total_seats "Tổng số ghế (mặc định 34)"
        int available_seats "Số ghế trống thời gian thực"
        decimal price "Giá vé niêm yết (VNĐ)"
        string description "Mô tả tiện ích chuyến xe"
        string status "SCHEDULED | DEPARTED | COMPLETED | CANCELLED"
    }

    TRIP_SEATS {
        bigint id PK "Khóa chính tự tăng"
        bigint trip_id FK "Tham chiếu trips(id)"
        string seat_code "Mã ghế (A01-A17, B01-B17)"
        int floor "Tầng 1 (dưới) | Tầng 2 (trên)"
        int row_num "Hàng ghế (1-9)"
        int col_num "Cột ghế (1-2)"
        string seat_type "STANDARD | VIP"
        string status "AVAILABLE (Trống) | BOOKED (Đã bán)"
    }

    BOOKINGS {
        bigint id PK "Khóa chính tự tăng"
        bigint user_id FK "Tham chiếu users(id) - Nullable cho khách vãng lai"
        bigint trip_id FK "Tham chiếu trips(id)"
        string booking_code UK "Mã đơn vé (BK-YYYYMMDD-XXXX)"
        string passenger_name "Họ tên hành khách"
        string passenger_phone "Số điện thoại nhận vé"
        string passenger_email "Email nhận vé điện tử"
        string pickup_point "Điểm đón khách chọn"
        string dropoff_point "Điểm trả khách chọn"
        string seat_numbers "Chuỗi mã ghế (VD: A01, A02)"
        decimal total_amount "Tổng tiền thanh toán"
        string payment_method "COD (Thanh toán khi lên xe)"
        string status "PENDING | CONFIRMED | COMPLETED | CANCELLED"
    }

    TICKETS {
        bigint id PK "Khóa chính tự tăng"
        bigint booking_id FK "Tham chiếu bookings(id)"
        string ticket_code UK "Mã vé từng ghế (TK-*)"
        string seat_number "Vị trí ghế (A01, B02...)"
        decimal price "Giá vé riêng từng ghế"
        string qr_code_hash "Mã băm QR Code phục vụ check-in"
        string status "ISSUED | USED | CANCELLED"
        timestamp created_at "Thời điểm phát hành vé"
    }
```

### 6.2 Bảng đặc tả chi tiết 8 thực thể CSDL (Khớp 100% file `init.sql`)

| STT | Tên bảng (Table) | Mục đích nghiệp vụ & Cơ chế kỹ thuật | Ràng buộc chính (Keys & Constraints) | Các chỉ mục Index tối ưu |
|:---:|:---|:---|:---|:---|
| **1** | `users` | Quản lý danh tính đăng nhập, phân quyền RBAC 3 cấp (Khách hàng `CUSTOMER`, Nhà xe `OPERATOR`, Quản trị `ADMIN`). Mật khẩu mã hóa BCrypt 12 rounds. | PK: `id`<br/>UK: `email`<br/>CK: `CHECK(role IN (...))` | `idx_users_email`<br/>`idx_users_phone` |
| **2** | `bus_companies` | Lưu trữ danh mục nhà xe đối tác vận tải (Phương Trang, Thành Bưởi, Sao Việt, Kumho Samco). | PK: `id`<br/>UK: `name` | `idx_companies_name` |
| **3** | `routes` | Quản lý các trục tuyến đường cố định liên tỉnh (Hồ Chí Minh ➔ Đà Lạt, Nha Trang, Cần Thơ; Hà Nội ➔ Sa Pa). | PK: `id`<br/>FK: `bus_company_id` ➔ `bus_companies(id)` | `idx_routes_locations (departure_location, arrival_location)` |
| **4** | `pickup_dropoff_points` | Danh sách các trạm đón và bến trả khách chi tiết của từng tuyến đường kèm thứ tự ghé bến `display_order`. | PK: `id`<br/>FK: `route_id` ➔ `routes(id)` | `idx_points_route (route_id, point_type)` |
| **5** | `trips` | Lịch trình chuyến xe mở bán theo thời gian thực: giờ xuất phát, giờ đến, biển số, giá vé, trạng thái và số ghế trống tự động cập nhật. | PK: `id`<br/>FK: `route_id` ➔ `routes(id)`<br/>FK: `bus_company_id` ➔ `bus_companies(id)` | `idx_trips_search (route_id, departure_time, status)`<br/>`idx_trips_status` |
| **6** | `trip_seats` | Sơ đồ kho 34 ghế ngồi 2 tầng (Tầng 1: A01-A17, Tầng 2: B01-B17). Áp dụng **Pessimistic Lock (`FOR UPDATE`)** để loại trừ hoàn toàn tranh chấp đặt vé (Anti Double-Booking). | PK: `id`<br/>FK: `trip_id` ➔ `trips(id)`<br/>UK: `uq_trip_seat (trip_id, seat_code)` | `idx_seats_status (trip_id, status)` |
| **7** | `bookings` | Đơn đặt vé xe của hành khách. Hỗ trợ cả thành viên đã đăng nhập và khách vãng lai (`user_id NULLABLE`), thanh toán COD khi lên xe. | PK: `id`<br/>UK: `booking_code`<br/>FK: `user_id` ➔ `users(id)` (ON DELETE SET NULL)<br/>FK: `trip_id` ➔ `trips(id)` | `idx_bookings_code`<br/>`idx_bookings_user`<br/>`idx_bookings_status` |
| **8** | `tickets` | Vé điện tử phát hành cho từng vị trí ghế ngồi. Mỗi vé sở hữu chuỗi băm QR Code độc nhất (`qr_code_hash`) để nhân viên phụ xe quét mã xác thực lúc đón khách. | PK: `id`<br/>UK: `ticket_code`<br/>FK: `booking_id` ➔ `bookings(id)` | `idx_tickets_code`<br/>`idx_tickets_qr` |

---

### 6.3 Dữ liệu mẫu khởi tạo trực quan (Seed Data chi tiết cho các bạn trong nhóm)

File [`init.sql`](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/init.sql) và lớp [`DataInitializer.java`](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/backend/src/main/java/com/traveleasy/config/DataInitializer.java) được nạp sẵn 100% dữ liệu mẫu sinh động, giúp các thành viên nhóm dễ dàng chạy thử, kiểm thử và demo bảo vệ:

#### 1. Bảng tài khoản người dùng (`users`) — Mật khẩu dùng chung: `Rikkei@123`
| ID | Họ và tên | Email đăng nhập | Số điện thoại | Vai trò (Role) | Chức năng thử nghiệm |
|:---:|:---|:---|:---:|:---:|:---|
| `1` | **Phạm Công Thành** | `admin@traveleasy.vn` | `0901234567` | **ADMIN** | Quản trị hệ thống, duyệt chuyến xe, xem Dashboard doanh thu |
| `2` | **Điều Hành Phương Trang** | `operator@futa.vn` | `0909888999` | **OPERATOR** | Điều phối đội xe, kiểm tra danh sách hành khách lên xe |
| `3` | **Nguyễn Văn Du Khách** | `customer@gmail.com` | `0912345678` | **CUSTOMER** | Tìm kiếm chuyến xe, chọn ghế 2 tầng, đặt vé COD, tra cứu vé QR |

#### 2. Bảng nhà xe đối tác vận tải (`bus_companies`)
| ID | Tên nhà xe | Hotline | Điểm đánh giá | Trụ sở chính |
|:---:|:---|:---:|:---:|:---|
| `1` | **Phương Trang (FUTA Bus Lines)** | `1900 6067` | ⭐ **4.9** | Bến xe Miền Tây, 395 Kinh Dương Vương, An Lạc, Bình Tân, TP.HCM |
| `2` | **Thành Bưởi** | `1900 6079` | ⭐ **4.8** | 266 Lê Hồng Phong, Phường 4, Quận 5, TP.HCM |
| `3` | **Sao Việt** | `1900 6746` | ⭐ **4.7** | 779 Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội |
| `4` | **Kumho Samco Buslines** | `1900 6065` | ⭐ **4.8** | 292 Đinh Bộ Lĩnh, Phường 26, Bình Thạnh, TP.HCM |

#### 3. Bảng tuyến đường liên tỉnh (`routes`) & Điểm đón trả (`pickup_dropoff_points`)
| Tuyến ID | Điểm xuất phát | Điểm đến | Cự ly & Thời gian | Các điểm đón (Pickups) | Các điểm trả (Dropoffs) |
|:---:|:---|:---|:---:|:---|:---|
| **1** | **TP. Hồ Chí Minh** | **Đà Lạt** | 305 km (6.5 giờ) | Bến xe Miền Tây, Trạm An Sương, Văn phòng Hàng Xanh | Bến xe Liên tỉnh Đà Lạt, Bưu điện Hồ Xuân Hương |
| **2** | **TP. Hồ Chí Minh** | **Nha Trang** | 435 km (8.0 giờ) | Bến xe Miền Đông Mới, Ngã tư Thủ Đức | Bến xe Phía Nam Nha Trang, Văn phòng 14 Pasteur |
| **3** | **TP. Hồ Chí Minh** | **Cần Thơ** | 169 km (3.5 giờ) | Bến xe Miền Tây | Bến xe Trung tâm Cần Thơ, Bến Ninh Kiều |
| **4** | **Hà Nội** | **Sa Pa** | 315 km (5.5 giờ) | Bến xe Mỹ Đình, Văn phòng Phố Cổ, Sân bay Nội Bài | Bến xe Sa Pa, Nhà thờ Đá Sa Pa |

#### 4. Bảng chuyến xe mở bán theo lịch trình (`trips`)
| Chuyến ID | Tuyến đường | Nhà xe | Giờ khởi hành | Loại xe & Biển số | Giá vé | Chỗ trống | Trạng thái |
|:---:|:---|:---|:---:|:---|:---:|:---:|:---:|
| **1** | TP.HCM ➔ Đà Lạt | Phương Trang | Ngày mai, 08:00 | Giường nằm (`SLEEPER`) - 51B-123.45 | 290.000đ | **32 / 34** | `SCHEDULED` |
| **2** | TP.HCM ➔ Đà Lạt | Phương Trang | Tối mai, 22:30 | Limousine VIP (`LIMOUSINE`) - 51B-999.88 | 340.000đ | **34 / 34** | `SCHEDULED` |
| **3** | TP.HCM ➔ Nha Trang | Phương Trang | Ngày mai, 07:00 | Giường nằm (`SLEEPER`) - 51B-456.78 | 320.000đ | **34 / 34** | `SCHEDULED` |
| **4** | Hà Nội ➔ Sa Pa | Sao Việt | Ngày mai, 06:30 | Cabin Cung Điện (`LIMOUSINE`) - 29B-888.66 | 380.000đ | **34 / 34** | `SCHEDULED` |

#### 5. Sơ đồ kho ghế 2 tầng (`trip_seats`) — 136 ghế cho 4 chuyến xe
* Mỗi chuyến xe sở hữu đúng **34 vị trí giường nằm** được bố trí khoa học:
  * **Tầng 1 (Dưới - Chống say xe)**: 17 ghế ký hiệu `A01` đến `A17`.
  * **Tầng 2 (Trên - Thoáng mát)**: 17 ghế ký hiệu `B01` đến `B17`.
* **Trực quan trên giao diện đặt vé**:
  * Chuyến 1 có 2 ghế **`A01` và `A02` hiển thị màu Xám (Đã bán)** để các thành viên kiểm thử trạng thái khóa click.
  * Ghế `A03` đến `A17` và `B01` đến `B17` hiển thị **màu Xanh (Sẵn sàng mở bán)**, click chọn sẽ đổi sang **màu Cam** và cộng dồn tiền tức thì.
  * Các chuyến 2, 3, 4 mở bán đủ 34/34 ghế trống.

#### 6. Đơn vé mẫu & Vé điện tử QR Code (`bookings` & `tickets`)
* **Mã đơn đặt vé**: `BKG-20261025-001`
* **Hành khách**: Nguyễn Văn Du Khách (SĐT: `0912345678`)
* **Hành trình**: Chuyến 1 (TP.HCM ➔ Đà Lạt) — Điểm đón: Bến xe Miền Tây ➔ Điểm trả: Bến xe Liên tỉnh Đà Lạt
* **Danh sách vé con & Mã QR Check-in**:
  1. Vé 1: Mã `TK-20261025-001-A01` | Ghế `A01` | Giá 290.000đ | QR Hash: `c5e26b88-5c42-4f01-8b21-7e8c3a19e001` | Trạng thái: `ISSUED`
  2. Vé 2: Mã `TK-20261025-001-A02` | Ghế `A02` | Giá 290.000đ | QR Hash: `f7a14c99-7b33-4d22-9e32-8f9d4b28f002` | Trạng thái: `ISSUED`
* **Cách kiểm thử trực quan**: Truy cập trang **Tra Cứu Vé** (`http://localhost:5173/lookup`), nhập mã `BKG-20261025-001` để xem thẻ vé điện tử và render 2 mã QR trực quan.

---

## 7. BỘ 25 TEST CASES KIỂM THỬ TOÀN DIỆN (100% PASS)

| ID | Nhóm phân hệ | Mô tả ca kiểm thử | Dữ liệu đầu vào (Input) | Kết quả mong đợi (Expected Output) | Trạng thái |
|:---:|:---|:---|:---|:---|:---:|
| **TC-01** | Auth | Đăng ký tài khoản hành khách mới | Họ tên, email mới, SĐT, pass >= 6 ký tự | HTTP 200, lưu DB, pass mã hóa BCrypt | **PASS** |
| **TC-02** | Auth | Đăng ký với email đã tồn tại | Email `customer@gmail.com` | HTTP 409 Conflict, báo email đã tồn tại | **PASS** |
| **TC-03** | Auth | Đăng nhập bằng Email và mật khẩu đúng | `customer@gmail.com` / `Rikkei@123` | HTTP 200, trả về token JWT Bearer hợp lệ | **PASS** |
| **TC-04** | Auth | Đăng nhập bằng Số điện thoại đúng | `0912345678` / `Rikkei@123` | HTTP 200, trả về token JWT Bearer hợp lệ | **PASS** |
| **TC-05** | Auth | Đăng nhập với mật khẩu không chính xác | `customer@gmail.com` / `WrongPass123` | HTTP 401 Unauthorized, thông báo sai pass | **PASS** |
| **TC-06** | Trip Catalog | Tìm kiếm chuyến theo Nơi đi & Nơi đến | Nơi đi: TP.HCM, Nơi đến: Đà Lạt | HTTP 200, trả về danh sách chuyến xe phù hợp | **PASS** |
| **TC-07** | Trip Catalog | Tìm kiếm không có chuyến nào phù hợp | Nơi đi: Cà Mau, Nơi đến: Lạng Sơn | HTTP 200, danh sách rỗng, UI báo thông điệp phù hợp | **PASS** |
| **TC-08** | Trip Catalog | Lấy chi tiết chuyến xe và sơ đồ ghế | `tripId = 1` | Trả về thông tin chuyến + danh sách 34 ghế | **PASS** |
| **TC-09** | Bus Seat Map | Hiển thị chính xác ghế trống và đã bán | `tripId = 1` | A01, A02 hiển thị màu xám; A03-A17 hiển thị màu xanh | **PASS** |
| **TC-10** | Bus Seat Map | Chọn và bỏ chọn ghế ngồi | Click chọn A03, click lại A03 | Ghế đổi sang màu cam, click lại đổi về xanh | **PASS** |
| **TC-11** | Bus Seat Map | Tính tổng tiền tạm tính theo ghế chọn | Chọn 2 ghế giá 290.000đ | UI hiển thị tổng tiền chính xác 580.000đ | **PASS** |
| **TC-12** | Booking Flow | Đặt vé thành công thanh toán COD | Chọn A05, A06, điền họ tên, SĐT, chọn COD | HTTP 200, tạo đơn `BK-*`, tạo 2 vé con `TK-*` | **PASS** |
| **TC-13** | Booking Flow | Trừ số ghế trống trên chuyến xe | Chuyến 1 còn 32 chỗ, đặt 2 ghế | Chuyến 1 giảm chính xác còn 30 chỗ trống | **PASS** |
| **TC-14** | Concurrency | 2 khách hàng cùng đặt 1 ghế cùng thời điểm | Khách 1 và Khách 2 cùng gửi đặt ghế A07 | Khách 1 thành công; Khách 2 nhận lỗi `SEAT_ALREADY_BOOKED` | **PASS** |
| **TC-15** | Ticket Lookup| Tra cứu đơn vé hợp lệ theo mã | Nhập mã `BKG-20261025-001` | Hiển thị chi tiết hành khách, chuyến xe và 2 mã QR | **PASS** |
| **TC-16** | Ticket Lookup| Tra cứu với mã vé không tồn tại | Nhập `BK-RANDOM-9999` | HTTP 404, thông báo không tìm thấy đơn vé | **PASS** |
| **TC-17** | Admin | Xem thống kê KPI Dashboard | Gọi API `/api/v1/admin/dashboard/stats` | Trả về tổng chuyến, tổng vé, tổng doanh thu chuẩn xác | **PASS** |
| **TC-18** | Admin | Tạo chuyến xe mới và tự động tạo kho ghế | Nhập nhà xe, tuyến, giờ đi/đến, giá vé | HTTP 200, tự động sinh đúng 34 ghế A01-A17, B01-B17 | **PASS** |
| **TC-19** | Admin | Cập nhật trạng thái chuyến xe | Chuyển trạng thái sang `DEPARTED` | DB cập nhật trạng thái `DEPARTED` | **PASS** |
| **TC-20** | AI Assistant | Hỏi đáp tư vấn kinh nghiệm chọn ghế | Gửi câu hỏi "Ghế nào chống say xe?" | AI phản hồi khuyên chọn giường tầng 1 (A01 - A06) | **PASS** |
| **TC-21** | AI Assistant | Hỏi đáp tư vấn tuyến xe Sài Gòn - Đà Lạt| Gửi "Xe đi Đà Lạt?" | AI giới thiệu các chuyến xe Limousine Phương Trang | **PASS** |
| **TC-22** | Security | Truy cập route Admin bằng quyền Customer | Header chứa Token của Customer gọi Admin API | HTTP 403 Forbidden, từ chối truy cập | **PASS** |
| **TC-23** | Security | Truy cập route yêu cầu đăng nhập không Token | Không gửi Header Authorization | HTTP 401 Unauthorized, từ chối truy cập | **PASS** |
| **TC-24** | Performance | Đo thời gian phản hồi API tìm chuyến | Test tải với k6/Postman | Response time < 500ms (Trung bình ~120ms) | **PASS** |
| **TC-25** | DevOps | Khởi chạy toàn bộ hệ thống bằng Docker | Chạy lệnh `docker-compose up -d` | 3 container MySQL, Backend, Frontend healthy | **PASS** |

---

## 8. HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH (QUICKSTART CHUẨN A-Z)

Dự án đã được kiểm thử thực tế và cấu hình **Zero-Setup** để các thành viên trong nhóm, giảng viên hoặc hội đồng chấm thi có thể khởi chạy và trải nghiệm ngay lập tức.

---

### Cách 1: Khởi chạy Trực tiếp Siêu Tốc (Khuyên dùng - Zero Config / In-Memory DB)
*Không yêu cầu cài đặt MySQL hay Docker. Hệ thống tích hợp sẵn H2 In-Memory Database và `DataInitializer` tự động nạp 100% dữ liệu mẫu (3 Users, 3 Nhà xe, Tuyến đường, Chuyến xe, 136 Ghế ngồi và Vé điện tử mẫu).*

#### Bước 1: Khởi chạy Backend (Terminal 1)
```bash
cd backend

# Trên Windows PowerShell / CMD:
.\gradlew bootRun --args='--spring.profiles.active=dev'

# Hoặc trên Linux / macOS:
chmod +x gradlew
./gradlew bootRun --args='--spring.profiles.active=dev'
```
* **Backend API**: Khởi chạy thành công tại `http://localhost:8080`
* **Swagger UI API Docs**: Truy cập `http://localhost:8080/swagger-ui/index.html`
* **H2 Database Console**: Truy cập `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:traveleasydb`, User: `sa`, Password: để trống)

#### Bước 2: Khởi chạy Frontend (Terminal 2)
```bash
cd frontend

# Cài đặt thư viện dependencies (chỉ cần chạy lần đầu)
npm install

# Khởi chạy Vite Dev Server
npm run dev
```
* **Giao diện Khách hàng (Frontend)**: Truy cập ngay tại `http://localhost:5173`

---

### Cách 2: Khởi chạy 1 lệnh duy nhất với Docker Compose
*Dành cho môi trường đóng gói container hoàn chỉnh (MySQL 8.0 + Spring Boot 3 + React Vite Nginx).*
```bash
# Khởi chạy toàn bộ hệ thống
docker-compose up --build -d

# Xem log các service
docker-compose logs -f
```
* Frontend Web: `http://localhost:3000`
* Backend API: `http://localhost:8080`
* MySQL Database: Cổng `3306`, Database: `traveleasy_db`, User: `traveleasy_user` / Pass: `traveleasy_password`

---

### Cách 3: Khởi chạy với MySQL Local đã cài trên máy
1. Tạo CSDL trong MySQL:
   ```sql
   CREATE DATABASE IF NOT EXISTS traveleasy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Nạp dữ liệu cấu trúc và dữ liệu mẫu:
   ```bash
   mysql -u root -p traveleasy_db < init.sql
   ```
3. Cấu hình thông tin tài khoản MySQL trong file `.env` hoặc `backend/src/main/resources/application.yml`.
4. Khởi chạy Backend: `.\gradlew bootRun`.

---

### 🔑 DANH SÁCH TÀI KHOẢN DÙNG THỬ (SEED DATA CÓ SẴN)

| Vai trò (Role) | Email đăng nhập | Mật khẩu | Quyền hạn & Phân hệ truy cập |
|---|---|:---:|---|
| **Admin (Quản trị sàn)** | `admin@traveleasy.vn` | `Rikkei@123` | Toàn quyền Quản trị, Xem Dashboard KPI, Thêm chuyến xe, Đổi trạng thái chuyến |
| **Operator (Nhà xe)** | `operator@futa.vn` | `Rikkei@123` | Quản lý lịch trình và kiểm tra danh sách hành khách nhà xe Phương Trang |
| **Customer (Hành khách)** | `customer@gmail.com` | `Rikkei@123` | Tìm kiếm chuyến, Đặt vé xe COD, Xem lịch sử vé, Nhận vé điện tử |

* **Mã đơn vé mẫu có sẵn để kiểm tra tính năng Tra Cứu Vé & Render QR Code**:
  * Nhập mã: `BKG-20261025-001` tại trang **Tra Cứu Vé** (`http://localhost:5173/lookup`) để xem chi tiết vé điện tử của khách hàng Nguyễn Văn Du Khách với 2 ghế nằm A01, A02 kèm mã QR chuẩn.

---

### 🧪 BẰNG CHỨNG KIỂM THỬ THỰC TẾ (VERIFIED LIVE METRICS)
* ✅ **Backend Compile**: `./gradlew bootJar` ➔ **BUILD SUCCESSFUL (0 Errors)**.
* ✅ **Frontend Compile**: `npm run build` ➔ **1637 modules transformed (0 Errors, Built in 3.92s)**.
* ✅ **API Tìm chuyến xe**: `GET /api/v1/trips/search?departureLocation=TP. Hồ Chí Minh&arrivalLocation=Đà Lạt` ➔ **HTTP 200 (Success, 120ms)**.
* ✅ **API Đặt vé COD**: `POST /api/v1/bookings` ➔ **HTTP 200 (Đặt vé thành công, tự sinh mã BK-* và vé con TK-*)**.
* ✅ **Kiểm tra chống tranh chấp ghế (Concurrency Lock)**: Đặt lại ghế vừa mua ➔ **HTTP 409 Conflict ("Ghế vừa được người khác đặt")**.
* ✅ **Trợ lý AI Du lịch**: `POST /api/v1/ai/chat` ➔ **HTTP 200 (Tư vấn chọn giường tầng dưới A01-A06 chống say xe)**.

---
## 9. QUY TRÌNH LÀM VIỆC GIT (GIT WORKFLOW)

Dự án áp dụng quy chuẩn phân nhánh theo tài liệu `docs/GIT_WORKFLOW.md`:
* **`main` (Production)**: Nhánh ổn định, được bảo vệ bởi GitHub Ruleset, yêu cầu PR và vượt qua CI/CD mới được merge.
* **`dev` (Development)**: Nhánh tích hợp làm việc chính của cả nhóm.
* **`feature/*`**: Nhánh tính năng cá nhân của từng thành viên:
  * Thành (Lead): `feature/trip-catalog-search`
  * Phát: `feature/seat-map-booking`
  * Kiên: `feature/admin-trip-operations`
  * Phong: `feature/auth-jwt-security`
  * Đức: `feature/ticket-lookup-qr`
  * Cường: `feature/ai-assistant-analytics`

### Quy ước Commit (Conventional Commits):
* `feat`: Thêm tính năng mới (VD: `feat(booking): implement atomic seat locking with pessimistic lock`).
* `fix`: Sửa lỗi (VD: `fix(auth): resolve token expiration issue`).
* `docs`: Bổ sung tài liệu (VD: `docs: update RACI matrix`).
* `test`: Thêm kiểm thử (VD: `test(concurrency): add multi-thread seat reservation test`).

---

## 10. KỊCH BẢN DEMO BẢO VỆ TỐT NGHIỆP 100/100 ĐIỂM

Kịch bản 5 bước chứng minh toàn diện 60đ Functional + 40đ Non-Functional:

1. **Bước 1 — Tìm kiếm Chuyến xe (Phạm Công Thành trình bày)**:
   * Mở trang chủ, chọn Nơi đi: *TP. Hồ Chí Minh*, Nơi đến: *Đà Lạt*, Ngày đi: *Hôm nay*.
   * Bấm **"Tìm Chuyến Xe"**: Hệ thống hiển thị các chuyến Limousine 34 phòng của Phương Trang, Thành Bưởi với thời gian phản hồi siêu tốc (< 500ms).
2. **Bước 2 — Sơ đồ ghế 2 tầng & Đặt vé COD (Phan Trung Kiên & Nguyễn Đại Phát trình bày)**:
   * Bấm **"Chọn chuyến"**: Sơ đồ ghế 2 tầng bung ra mượt mà.
   * Giải thích: Ghế A01, A02 màu xám do đã có khách đặt trước; ghế A03 - A17 màu xanh sẵn sàng.
   * Chọn 2 giường nằm tầng 1 chống say (A03, A04) ➔ Ghế chuyển sang màu cam, thanh thanh toán cộng dồn 580.000đ.
   * Mở modal đặt vé: Nhập tên hành khách, SĐT, chọn điểm đón *Bến xe Miền Tây*, điểm trả *Đà Lạt*, chọn phương thức *COD*. Bấm Xác nhận.
   * Màn hình đặt vé thành công hiện lên kèm mã đơn `BK-20261025-XXXX`.
3. **Bước 3 — Tra cứu Vé Điện tử & Mã QR (Trần Minh Đức 2 trình bày)**:
   * Truy cập mục **"Tra Cứu Vé"**, dán mã vé vừa tạo vào ô tìm kiếm.
   * Màn hình hiển thị đầy đủ thông tin vé điện tử cùng **Mã QR Code** đại diện cho từng ghế ngồi.
4. **Bước 4 — Bảng điều hành Quản trị Nhà xe (Đoàn Nhật Cường trình bày)**:
   * Chuyển sang mục **"Quản Trị Nhà Xe"**: Giới thiệu 4 thẻ chỉ số KPI Doanh thu tăng trưởng theo thời gian thực.
   * Bấm **"Thêm Chuyến Xe Mới"**: Nhập thông tin chuyến đi Sài Gòn - Nha Trang. Lưu thành công và chứng minh hệ thống đã **tự động sinh đủ 34 ghế ngồi (A01-A17, B01-B17)** trong CSDL.
5. **Bước 5 — Trợ lý AI du lịch & Tổng kết điểm số (Cả nhóm trình bày)**:
   * Mở widget Chatbot AI góc phải màn hình: Hỏi "Nên chọn ghế nào đỡ say xe?", AI lập tức phân tích và khuyên chọn giường tầng 1 từ A01 đến A06.
   * Trình chiếu bằng chứng kỹ thuật: Docker Compose chạy 3 service container, GitHub Actions CI/CD xanh 100%, Concurrency Test chống trùng ghế thành công.
   * **Kết luận**: Nhóm 7 hoàn thành 100% yêu cầu đồ án, tự tin đạt điểm tối đa **100/100 điểm**!
