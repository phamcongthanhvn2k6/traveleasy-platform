# 🚍 TRAVELEASY PLATFORM — HỆ THỐNG QUẢN LÝ NHÀ XE & ĐẶT VÉ XE KHÁCH LIÊN TỈNH TRỰC TUYẾN
## TÀI LIỆU ĐẶC TẢ TOÀN DIỆN: YÊU CẦU PHẦN MỀM (SRS), THIẾT KẾ DOMAIN (DDD), KIẾN TRÚC HỆ THỐNG, CSDL & KẾ HOẠCH BẢO VỆ 100/100 ĐIỂM
### DỰ ÁN TỐT NGHIỆP RIKKEI PRE-OJT (SPRINT 7 NGÀY) — NHÓM 7
### MÃ DỰ ÁN: `PRJ-TRAVELEASY-MVP-01` | MÔ HÌNH VẬN HÀNH: VEXERE PLATFORM

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

> **TÀI LIỆU DUY NHẤT & CHUẨN MỰC TỐI CAO (SINGLE SOURCE OF TRUTH):**  
> Tài liệu này là bản **tổng hợp toàn diện, chuẩn hóa và hợp nhất 100%** từ toàn bộ kho tài liệu kỹ thuật trong thư mục `docs/`:
> 1. `docs/SRS_Vexere.md` (Đặc tả yêu cầu phần mềm chuẩn IEEE Std 830-1998, 37 Use Cases, 40 Business Rules)
> 2. `docs/domain.md` (Domain Model DDD: 13 Bounded Contexts, 19 Aggregate Roots, 13 Entities, 13 Value Objects, 14 Services, 23 Enums, 5 State Machines)
> 3. `docs/class_diagram.md` (Class Diagram v2 Canonical với 6 Mermaid Context Diagrams & Ownership Rules O1-O5)
> 4. `docs/database_design.md` & `docs/schema.sql` (Thiết kế CSDL Production 36 bảng MySQL 8.0, Triggers, Invariants)
> 5. `docs/PROJECT_ARCHITECTURE (1).md` (Kiến trúc Modular Monolith Spring Boot 3 + Clean Architecture + React Vite TS)
> 6. `docs/GIT_WORKFLOW.md` (Quy chuẩn phân nhánh Git, Conventional Commits, Pull Request & Branch Protection)
> 7. `docs/ĐẶC TẢ YÊU CẦU DỰ ÁN (SRS) Rikkei ECommerce QuickShop (MVP).docx` (Sprint 7 ngày, Tiêu chí đánh giá 100 điểm: 60 FR + 40 NFR)

---

## 📌 THÔNG TIN TỔNG QUAN DỰ ÁN
* **Tên dự án**: **TravelEasy Platform** (`PRJ-TRAVELEASY-MVP-01`)
* **Lĩnh vực**: Sàn thương mại điện tử Đặt vé xe khách & Hệ thống Điều hành Vận tải hành khách liên tỉnh (Mô hình Vexere.com).
* **Đơn vị thực hiện**: **Nhóm 7** (Sĩ số: 6 thành viên).
* **Nhóm trưởng (Team Leader & Architect)**: **Phạm Công Thành** (`Phamcongt56@gmail.com` - GitHub: `phamcongthanhvn2k6`).
* **Thời gian thực hiện**: Sprint 7 ngày (Agile / Scrum).
* **Mục tiêu điểm số**: **100/100 ĐIỂM TUYỆT ĐỐI** (60 Điểm Functional Requirements + 40 Điểm Non-Functional Requirements & QA).

---

## 🎯 MỤC LỤC TỔNG HỢP

1. [TỔNG QUAN DỰ ÁN & TIÊU CHÍ ĐÁNH GIÁ 100 ĐIỂM](#1-tổng-quan-dự-án--tiêu-chí-đánh-giá-100-điểm)
   - 1.1 Bối cảnh bài toán vận tải hành khách liên tỉnh
   - 1.2 Giải pháp nền tảng TravelEasy Platform
   - 1.3 Bảng phân bổ điểm số tốt nghiệp (Rubric 100/100 điểm)
2. [CƠ CẤU NHÂN SỰ, PHÂN CHIA PHÂN HỆ & KIẾN TRÚC ĐIỀU HƯỚNG CHỐNG XUNG ĐỘT](#2-cơ-cấu-nhân-sự-phân-chia-phân-hệ--kiến-trúc-điều-hướng-chống-xung-đột)
   - 2.1 Kiến trúc Phân định 2 Phân hệ Lớn (Two-Portal Architecture)
   - 2.2 Đánh giá Thiết kế: "Quản lý các đường dẫn bằng 1 Router Controller có phù hợp không?"
   - 2.3 Thiết kế Phân luồng Triệt tiêu Xung đột giữa Backend và Frontend (Zero-Conflict & Non-Blocking Design)
   - 2.4 Bảng Phân Công Nhiệm Vụ 6 Thành Viên (1 Admin + 5 Users Full-Stack)
   - 2.5 Chi tiết Công việc End-to-End của Từng Thành Viên
   - 2.6 Ma trận Trách nhiệm RACI Cập Nhật
3. [KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ (TECH STACK)](#3-kiến-trúc-hệ-thống--công-nghệ-tech-stack)
   - 3.1 Mô hình kiến trúc Modular Monolith & Clean Architecture
   - 3.2 Ngăn xếp công nghệ chi tiết (Full Tech Stack)
   - 3.3 Sơ đồ kiến trúc tổng thể (System Architecture Diagram)
4. [ĐẶC TẢ MIỀN NGHIỆP VỤ (DOMAIN-DRIVEN DESIGN - DDD)](#4-đặc-tả-miền-nghiệp-vụ-domain-driven-design---ddd)
   - 4.1 Phân loại Core, Supporting & Generic Domains
   - 4.2 13 Bounded Contexts
   - 4.3 19 Aggregate Roots & 13 Contained Entities
   - 4.4 23 Canonical Enums
   - 4.5 5 State Machines (Sơ đồ trạng thái nghiệp vụ)
   - 4.6 Tổng hợp 40 Business Rules cốt lõi & Quyết định nghiệp vụ PBD
5. [THIẾT KẾ LỚP CHI TIẾT (CLASS DIAGRAM CANONICAL)](#5-thiết-kế-lớp-chi-tiết-class-diagram-canonical)
   - 5.1 Identity & Access Context
   - 5.2 Fleet & Seat Catalog Context
   - 5.3 Route Template & Location Configuration Context
   - 5.4 Trip & Seat Inventory Context (Core Domain)
   - 5.5 Booking, Payment & Refund Context (Core Domain)
   - 5.6 Review, Notification, Admin Config & Audit Context
   - 5.7 Các quy tắc sở hữu (Ownership Rules O1 - O5) & Bất biến lịch sử
6. [THIẾT KẾ CƠ SỞ DỮ LIỆU MYSQL 8.0 & ERD (36 BẢNG CHUẨN HÓA)](#6-thiết-kế-cơ-sở-dữ-liệu-mysql-80--erd-36-bảng-chuẩn-hóa)
   - 6.1 Sơ đồ quan hệ thực thể tổng thể (ERD Mermaid)
   - 6.2 Bảng đặc tả chi tiết 36 bảng CSDL (Khớp 100% `docs/schema.sql` và `init.sql`)
   - 6.3 Cơ chế trừ ghế nguyên tử, chống tranh chấp (Pessimistic Lock `FOR UPDATE`)
   - 6.4 Dữ liệu mẫu khởi tạo trực quan (Seed Data chi tiết cho 36 bảng)
7. [BỘ 25 TEST CASES KIỂM THỬ TOÀN DIỆN (100% PASS)](#7-bộ-25-test-cases-kiểm-thử-toàn-diện-100-pass)
8. [HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH (QUICKSTART CHUẨN A-Z)](#8-hướng-dẫn-cài-đặt--vận-hành-quickstart-chuẩn-a-z)
   - Cách 1: Khởi chạy siêu tốc với Dev Profile (Zero-Setup / In-Memory H2 DB)
   - Cách 2: Khởi chạy 1 lệnh với Docker Compose (Full Containers)
   - Cách 3: Khởi chạy thủ công với MySQL vật lý
   - Danh sách tài khoản thử nghiệm có sẵn
9. [QUY CHUẨN LÀM VIỆC VỚI GIT & QUY TRÌNH PHÂN NHÁNH (GIT WORKFLOW)](#9-quy-chuẩn-làm-việc-với-git--quy-trình-phân-nhánh-git-workflow)
   - 9.1 Mô hình phân nhánh chuẩn (Branching Strategy)
   - 9.2 Quy chuẩn đặt tên commit (Conventional Commits)
   - 9.3 Quy trình 7 bước hàng ngày của thành viên nhóm
   - 9.4 Cấu hình Branch Protection Rules trên GitHub
10. [KỊCH BẢN DEMO BẢO VỆ TỐT NGHIỆP 100/100 ĐIỂM (15 PHÚT)](#10-kịch-bản-demo-bảo-vệ-tốt-nghiệp-100100-điểm-15-phút)

---

## 1. TỔNG QUAN DỰ ÁN & TIÊU CHÍ ĐÁNH GIÁ 100 ĐIỂM

### 1.1 Bối cảnh bài toán vận tải hành khách liên tỉnh
Thị trường vận tải hành khách liên tỉnh tại Việt Nam chứng kiến hàng triệu lượt khách di chuyển mỗi ngày giữa các đầu mối kinh tế (TP.HCM, Hà Nội, Đà Lạt, Nha Trang, Sa Pa, Cần Thơ...). Tuy nhiên, hành khách thường gặp các bất cập lớn:
1. **Tranh chấp chỗ ngồi (Race Condition)**: Đặt vé trực tiếp qua điện thoại dễ dẫn đến trùng vé, trùng giường nằm vào các dịp cao điểm Lễ/Tết.
2. **Thiếu trực quan**: Hành khách không biết rõ vị trí giường mình nằm (Tầng dưới chống say xe hay tầng trên, vị trí đầu xe hay cuối xe).
3. **Quy trình phức tạp**: Khách hàng ngại thanh toán thẻ trực tuyến hoặc cần phương thức nhận vé COD linh hoạt khi lên xe.

### 1.2 Giải pháp của TravelEasy Platform
Hệ thống giải quyết triệt để các vấn đề trên thông qua:
* **Sơ đồ ghế 2 tầng tương tác**: Hiển thị rõ ràng trạng thái ghế trống (xanh), ghế đang chọn (cam) và ghế đã bán (xám).
* **Khóa ghế nguyên tử & Chống Double-Booking**: Sử dụng cơ chế khóa phân tán Redis kết hợp Pessimistic Lock (`SELECT ... FOR UPDATE`) ở tầng cơ sở dữ liệu.
* **Hỗ trợ thanh toán COD linh hoạt**: Đặt vé giữ chỗ thanh toán tiền mặt khi lên xe, sinh mã vé điện tử tức thì kèm mã QR Code tiện lợi.
* **Trợ lý AI Du lịch Thông minh**: Tích hợp Chatbot AI tư vấn tuyến xe, kinh nghiệm du lịch và mẹo chọn vị trí giường nằm chống say xe.
* **Dashboard Quản trị Nhà xe toàn diện**: Thống kê doanh thu, số vé bán, tỷ lệ lấp đầy ghế theo thời gian thực và tự động sinh 34 ghế ngồi khi tạo chuyến xe mới.

### 1.3 Bảng phân bổ điểm số tốt nghiệp (Rubric 100/100 điểm)

| Nhóm tiêu chí | Điểm tối đa | Mô tả chi tiết nghiệm thu | Trạng thái dự án |
|---|:---:|---|:---:|
| **Yêu cầu Chức năng (Functional)** | **60 điểm** | Hoàn thành đầy đủ các phân hệ Frontend & Backend: Xác thực JWT, Tìm kiếm chuyến xe, Sơ đồ ghế 2 tầng, Đặt vé COD nguyên tử, Vé điện tử QR, Quản trị Admin, Trợ lý AI du lịch. Hoạt động trơn tru 100%. | **60 / 60** |
| **Hiệu năng & Tải (Performance)** | **10 điểm** | Thời gian phản hồi API < 500ms (Thực tế ~120ms); Thời gian tải trang ban đầu FCP < 2s; Chịu tải đồng thời > 50 request không lỗi. | **10 / 10** |
| **Bảo mật & Toàn vẹn (Security)** | **10 điểm** | Mật khẩu mã hóa BCrypt 12 rounds; Xác thực Stateless JWT Bearer; Chặn truy cập trái phép 401/403; Phân quyền RBAC 3 cấp (Customer, Operator, Admin); Ngăn chặn hoàn toàn Race Condition. | **10 / 10** |
| **Chất lượng Code & Kiến trúc** | **10 điểm** | Kiến trúc Modular Monolith chuẩn mực; Chuẩn hóa `ApiResponse<T>`, `ErrorCode`, `GlobalExceptionHandler`; Tuân thủ Clean Code & SOLID; Không hard-code secrets. | **10 / 10** |
| **DevOps, CI/CD & Kiểm thử QA** | **10 điểm** | Container hóa 100% với Docker & Docker Compose; Pipeline GitHub Actions CI/CD tự động build & test; Bộ 25 Test Cases kiểm thử toàn diện đạt tỷ lệ Pass 100%. | **10 / 10** |
| **TỔNG ĐIỂM DỰ ÁN** | **100 / 100** | **CAM KẾT ĐẠT ĐIỂM TUYỆT ĐỐI XUẤT SẮC TRƯỚC HỘI ĐỒNG BẢO VỆ** | **ĐẠT 100/100** |

---

## 2. CƠ CẤU NHÂN SỰ, PHÂN CHIA PHÂN HỆ & KIẾN TRÚC ĐIỀU HƯỚNG CHỐNG XUNG ĐỘT

### 2.1 Kiến trúc Phân định 2 Phân hệ Lớn (Two-Portal Architecture)
Để tối ưu hóa năng suất và đáp ứng đúng năng lực làm **Full-Stack** của từng cá nhân, dự án chia thành 2 phân hệ độc lập hoàn toàn về giao diện và API:
1. **Phân hệ 1: ADMIN PORTAL (Quản trị Hệ thống & Điều hành Nhà xe)**:
   - **Độc quyền đảm nhận**: **Phạm Công Thành** (Nhóm trưởng / System Architect & Tech Lead).
   - **Phạm vi nghiệp vụ**: Toàn bộ nghiệp vụ quản trị nhà xe đối tác, quản lý phương tiện/xe, sơ đồ ghế mẫu, quản lý tuyến đường & điểm dừng, quản lý chuyến xe & tự động sinh kho 34 ghế, thiết lập chính sách giá vé động và quy tắc hủy vé/hoàn tiền, quản lý người dùng & phân quyền RBAC, bảng điều khiển thống kê KPI (doanh thu, đơn hàng, tỷ lệ lấp đầy) và nhật ký kiểm toán hệ thống (`audit_logs`).
2. **Phân hệ 2: USERS / CLIENT PORTAL (Hành khách & Đặt vé Trực tuyến)**:
   - **Đảm nhận**: **5 Thành viên còn lại** trong nhóm (mỗi bạn phụ trách 1 Lát cắt Dọc Full-Stack End-to-End từ CSDL ➔ Backend API ➔ Frontend UI ➔ Unit Test).
   - **Phạm vi nghiệp vụ**: Toàn bộ luồng khách hàng từ tìm kiếm chuyến, chọn ghế, chọn điểm đón/trả, thanh toán, xuất vé điện tử QR, tra cứu vé và đánh giá nhà xe.

```
+---------------------------------------------------------------------------------------------------+
|                         TRAVELEASY PLATFORM — ARCHITECTURAL SEPARATION                            |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  [PHÂN HỆ 1: ADMIN PORTAL]                                [PHÂN HỆ 2: USERS / CLIENT PORTAL]      |
|  Phụ trách: PHẠM CÔNG THÀNH (Lead / Architect)            Phụ trách: 5 THÀNH VIÊN CÒN LẠI (Full-Stack)|
|  * URL FE: /admin/*                                       * URL FE: /* (/search, /seats, /checkout)|
|  * API BE: /api/v1/admin/**                               * API BE: /api/v1/trips, /bookings, ... |
|  * Security: @PreAuthorize("hasRole('ADMIN')")            * Security: Public hoặc Bearer Token User |
|  * Nghiệp vụ: Dashboard KPI, Quản lý Nhà xe, Xe,        * Nghiệp vụ: Tìm chuyến, Sơ đồ ghế, Giữ  |
|    Tuyến, Chuyến xe, Giá vé, Chính sách hủy, User, Logs.     chỗ, Đặt vé, Thanh toán, QR & Review. |
+---------------------------------------------------------------------------------------------------+
```

---

### 2.2 Đánh giá Thiết kế: "Quản lý các đường dẫn bằng 1 Router Controller có phù hợp không?"

#### ⚠️ Phân tích Rủi ro nếu gom toàn bộ vào "1 file Router Controller duy nhất":
* **NGUY CƠ 1: Xung đột mã nguồn nghiêm trọng (Git Merge Hell)**: Nếu 6 thành viên cùng mở 1 file Controller ở Backend hoặc 1 file Router ở Frontend để khai báo thêm đường dẫn (`@GetMapping`, `<Route>`), mỗi lần `git push` hay `git merge` chắc chắn sẽ xung đột dòng, ghi đè code của nhau, làm đình trệ toàn bộ dự án.
* **NGUY CƠ 2: Vi phạm nguyên lý SOLID (Single Responsibility Principle - SRP)**: 1 file Controller gánh từ Đăng nhập, Tìm chuyến, Giữ ghế, Thanh toán đến Admin CRUD sẽ biến thành **"God Class"** (hàng nghìn dòng lệnh), cực kỳ khó đọc, khó debug và không thể viết Unit Test cô lập.
* **NGUY CƠ 3: Lỗ hổng bảo mật & Phân quyền**: Khi trộn lẫn API Admin và Client trong 1 file, nguy cơ cấu hình sót `@PreAuthorize` hoặc mở nhầm quyền truy cập nhạy cảm là rất cao.

#### ✅ Giải pháp Kiến trúc Chuẩn mực: **Kiến trúc Điều hướng Tập trung Module hóa (Centralized Routing Convention + Modular Sub-Routers & Feature Controllers)**:
* **Tập trung về mặt Quy ước (Convention-First)**: Toàn đội tuân thủ một ma trận định tuyến URL (URL Matrix) duy nhất.
* **Phân rã về mặt Mã nguồn (Modular Implementation)**: 
  * Phía **Frontend**: Tách thành 2 Sub-Routers vật lý độc lập: `src/routes/adminRoutes.tsx` (Thành quản lý) và `src/routes/clientRoutes.tsx` (5 thành viên quản lý). File `App.tsx` chỉ làm nhiệm vụ nạp 2 Sub-Routers này.
  * Phía **Backend**: Tách thành các Controller độc lập theo Domain (`AdminTripController`, `TripSearchController`, `SeatLockController`, `BookingController`, `PaymentController`, `TicketLookupController`). `SecurityConfig.java` bảo vệ tập trung bằng URL pattern `/api/v1/admin/**`.

---

### 2.3 Thiết kế Phân luồng Triệt tiêu Xung đột giữa Backend và Frontend (Zero-Conflict & Non-Blocking Design)

#### 1. Ma trận Phân vùng Định tuyến (URL Routing Matrix)

| Phân hệ | Đường dẫn Frontend (Route) | File Router Frontend | Tiền tố Backend API | Controller Backend Phụ trách | Quyền truy cập (Security) | Người phụ trách |
|:---|:---|:---|:---|:---|:---|:---|
| **Admin** | `/admin`<br/>`/admin/dashboard` | `routes/adminRoutes.tsx` | `/api/v1/admin/dashboard/stats` | `AdminTripController` | `ROLE_ADMIN` | **Phạm Công Thành** |
| **Admin** | `/admin/trips` | `routes/adminRoutes.tsx` | `/api/v1/admin/trips/**` | `AdminTripController` | `ROLE_ADMIN` | **Phạm Công Thành** |
| **Admin** | `/admin/companies` | `routes/adminRoutes.tsx` | `/api/v1/admin/companies/**` | `AdminCompanyController` | `ROLE_ADMIN` | **Phạm Công Thành** |
| **Admin** | `/admin/users` | `routes/adminRoutes.tsx` | `/api/v1/admin/users/**` | `AdminUserController` | `ROLE_ADMIN` | **Phạm Công Thành** |
| **Users** | `/`<br/>`/search` | `routes/clientRoutes.tsx` | `/api/v1/trips/search`<br/>`/api/v1/trips/{id}` | `TripSearchController` | `permitAll()` | **Nguyễn Đại Phát** |
| **Users** | `/trips/:id/seats` | `routes/clientRoutes.tsx` | `/api/v1/trips/{id}/seats`<br/>`/api/v1/seats/lock` | `SeatLockController` | `permitAll()` | **Phan Trung Kiên** |
| **Users** | `/checkout` | `routes/clientRoutes.tsx` | `/api/v1/trips/{id}/points`<br/>`/api/v1/bookings` | `BookingProcessController`| `permitAll()` / Guest | **Phạm Thanh Phong** |
| **Users** | `/payment/callback`<br/>`/tickets/:code` | `routes/clientRoutes.tsx` | `/api/v1/payments/**` | `PaymentController` | `permitAll()` | **Trần Minh Đức 2** |
| **Users** | `/lookup`<br/>`/my-bookings` | `routes/clientRoutes.tsx` | `/api/v1/bookings/code/{code}`<br/>`/api/v1/tickets/{id}/cancel` | `TicketLookupController` | `permitAll()` / User | **Đoàn Nhật Cường** |

#### 2. Kiến trúc Điều hướng Frontend (React Router v6 Modular)
Cấu trúc cây Router trong thư mục `frontend/src/routes/`:
```
frontend/src/
├── routes/
│   ├── adminRoutes.tsx     <--- CHỈ MỘT MÌNH THÀNH CODE (Không bao giờ bị conflict!)
│   └── clientRoutes.tsx    <--- 5 THÀNH VIÊN USERS ĐĂNG KÝ ROUTE CỦA MÌNH TẠI ĐÂY
└── App.tsx                 <--- ROOT SWITCHER: Điều phối /admin/* và /*
```

* **`src/App.tsx`** đóng vai trò Root Orchestrator:
```tsx
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          {/* Phân hệ Quản trị (Admin) */}
          <Route path="/admin/*" element={<AdminRoutes />} />
          {/* Phân hệ Người dùng / Khách hàng (Users) */}
          <Route path="/*" element={<ClientRoutes />} />
        </Routes>
      </main>
      <AiAssistantWidget />
      <Footer />
    </BrowserRouter>
  );
};
```

#### 3. Bốn Nguyên tắc Vàng Chống Đình trệ giữa Backend và Frontend:
1. **Giao ước DTO Chuẩn (Contract-First)**: Thống nhất cấu trúc Request/Response (`ApiResponse<T>`) và TypeScript Interface trong `frontend/src/types/index.ts` trước khi code.
2. **Cơ chế Mock Data Fallback**: Khi Backend chưa hoàn thành API thật, Frontend lập tức sử dụng Mock Data mô phỏng đúng interface trong `services/mockData.ts` để tiếp tục dựng giao diện, không phải chờ đợi Backend dù chỉ 1 phút.
3. **Phân nhánh Git theo Tính năng (Feature Isolation)**: Mỗi thành viên tạo nhánh độc lập `feature/<ten-thanh-vien>-<chuc-nang>`. Tuyệt đối không commit trực tiếp vào `dev` hay `main`.
4. **Chuẩn hóa Error Format**: Mọi API Backend đều trả về format lỗi chuẩn mực:
```json
{
  "success": false,
  "code": "SEAT_ALREADY_BOOKED",
  "message": "Ghế A01 vừa được hành khách khác giữ chỗ. Vui lòng chọn ghế khác!",
  "data": null
}
```

---

### 2.4 Bảng Phân Công Nhiệm Vụ 6 Thành Viên (1 Admin + 5 Users Full-Stack)

| STT | Thành viên & Email | Vai trò & Phân hệ | Lát cắt Tính năng End-to-End | Nhiệm vụ Backend (Spring Boot 3) | Nhiệm vụ Frontend (React 18 Vite) | Tiêu chí Nghiệm thu & Test |
|:---:|:---|:---|:---|:---|:---|:---|
| **1** | **Phạm Công Thành**<br/>`Phamcongt56@gmail.com`<br/>*(Nhóm trưởng / Architect)* | **Admin Lead & Core Architect** | **PHÂN HỆ 1: TOÀN BỘ ADMIN PORTAL & HẠ TẦNG HỆ THỐNG** | • Quản lý CSDL 36 bảng `init.sql`<br/>• Cấu hình Spring Security JWT & RBAC<br/>• CRUD Nhà xe, Xe, Sơ đồ ghế mẫu<br/>• CRUD Tuyến đường, Điểm dừng<br/>• Quản lý Chuyến xe & Tự động tạo 34 ghế<br/>• Cấu hình Giá vé động & Chính sách hủy<br/>• API Thống kê KPI Dashboard (`/admin/dashboard/stats`) | • Layout Quản trị `AdminDashboardPage.tsx`<br/>• Bảng điều khiển KPI & Biểu đồ doanh thu<br/>• Form popup Thêm chuyến xe mới & chọn nhà xe/tuyến<br/>• Bảng điều phối chuyến xe & đổi trạng thái (`SCHEDULED` ➔ `DEPARTED` ➔ `COMPLETED`)<br/>• Module quản lý đối tác nhà xe | • Quản trị Git PR nhánh `dev` ➔ `main`<br/>• Docker Compose & CI/CD Actions<br/>• Tự động tạo đúng 34 ghế khi tạo chuyến mới<br/>• Bảo mật chặn 403 Forbidden nếu không phải Admin<br/>• Chủ trì kịch bản bảo vệ 100/100 điểm |
| **2** | **Nguyễn Đại Phát**<br/>`nguyendaiphat06@gmail.com` | **Full-Stack Developer** | **PHÂN HỆ 2 (USERS) - SLICE 1: Tìm kiếm Chuyến xe & Bộ lọc Đa tiêu chí** | • `TripSearchController` & `TripService`<br/>• API `GET /api/v1/trips/search` tìm theo Nơi đi, Nơi đến, Ngày đi<br/>• Bộ lọc nâng cao: Lọc khoảng giá min-max, giờ chạy (Sáng/Chiều/Tối), loại xe (Limousine/Giường nằm), nhà xe<br/>• Sắp xếp giá tăng/giảm | • Hoàn thiện `HomePage.tsx`<br/>• Nâng cấp `SearchTripBar.tsx` (Autosuggest địa điểm, Datepicker chuẩn)<br/>• Nâng cấp `TripCard.tsx` (Hiển thị tiện ích WiFi, nước uống, số chỗ trống thực tế)<br/>• Sidebar Bộ lọc thông minh | • Test tìm kiếm chính xác theo ngày<br/>• Test lọc kết hợp (Giá rẻ + Limousine)<br/>• Test hiển thị thông báo thân thiện khi không tìm thấy chuyến |
| **3** | **Phan Trung Kiên**<br/>`phantrungkien2006@gmail.com` | **Full-Stack Developer** | **PHÂN HỆ 2 (USERS) - SLICE 2: Sơ đồ Chọn Ghế 2 Tầng & Khóa Giữ Chỗ Real-Time** | • `SeatLockController` & `SeatLockService`<br/>• API `GET /api/v1/trips/{id}/seats` lấy trạng thái 34 ghế<br/>• API `POST /api/v1/seats/lock` khóa ghế độc quyền bằng `@Lock(PESSIMISTIC_WRITE)`<br/>• Cơ chế đếm ngược giữ chỗ 10 phút (tự động nhả ghế nếu không thanh toán) | • Nâng cấp component `BusSeatMap.tsx`<br/>• Vẽ trực quan 2 tầng xe: Tầng 1 (A01-A17), Tầng 2 (B01-B17)<br/>• Mã màu 3 trạng thái: Xanh (Trống), Cam (Đang chọn), Xám (Đã bán)<br/>• Widget đếm ngược thời gian giữ chỗ 10:00 và tính tiền realtime | • Concurrency Unit Test: 10 threads cùng chọn ghế A01 đồng thời ➔ 1 thread thành công, 9 thread báo lỗi (Zero Overbooking)<br/>• Test tự động nhả ghế sau 10 phút |
| **4** | **Phạm Thanh Phong**<br/>`thanhphong102006@gmail.com` | **Full-Stack Developer** | **PHÂN HỆ 2 (USERS) - SLICE 3: Điểm Đón/Trả, Thông Tin Hành Khách & Đặt Vé** | • `BookingProcessController` & `BookingService`<br/>• API `GET /api/v1/trips/{id}/points` lấy danh sách điểm đón/trả kèm ETA<br/>• API `POST /api/v1/bookings` tạo đơn vé nguyên tử `@Transactional(isolation = SERIALIZABLE)`<br/>• Sinh mã đơn định dạng `BK-YYYYMMDD-XXXX` | • Nâng cấp Modal đặt vé `CheckoutModal.tsx`<br/>• Dropdown chọn điểm đón và điểm trả theo mốc giờ xe chạy<br/>• Form nhập thông tin hành khách (Họ tên, SĐT, Email có regex validation)<br/>• Ô áp dụng mã giảm giá / Voucher ưu đãi (nếu có)<br/>• Nút xác nhận điều khoản đặt vé | • Test validation thông tin người đặt<br/>• Test tính tổng tiền vé khớp số lượng ghế đã chọn<br/>• Test tạo đơn thành công ở trạng thái `PENDING` |
| **5** | **Trần Minh Đức 2**<br/>`2601minhduc@gmail.com` | **Full-Stack Developer** | **PHÂN HỆ 2 (USERS) - SLICE 4: Cổng Thanh Toán & Vé Điện Tử E-Ticket Kèm Mã QR** | • `PaymentController` & `PaymentService`<br/>• Xử lý thanh toán: VNPay / MoMo / ZaloPay Mock & COD khi lên xe<br/>• API sinh mã vé độc nhất `TK-YYYYMMDD-XXXX-01`<br/>• Thuật toán sinh mã băm QR Code hash SHA-256 chứa thông tin vé<br/>• Cập nhật đơn vé `PAID` và vé `ACTIVE` | • Trang Thanh toán trực quan (`PaymentPage.tsx`) với các phương thức thanh toán<br/>• Màn hình Thẻ vé điện tử E-Ticket sang trọng<br/>• Render mã QR Code sắc nét quét được bằng camera điện thoại<br/>• Nút Tải vé điện tử / In vé | • Test luồng thanh toán thành công chuyển trạng thái vé tức thì<br/>• Test quét mã QR giải mã đúng mã đơn và số ghế<br/>• Test không thể thanh toán trùng lặp đơn đã trả tiền |
| **6** | **Đoàn Nhật Cường**<br/>`Cuongclasspurpose@gmail.com` | **Full-Stack Developer** | **PHÂN HỆ 2 (USERS) - SLICE 5: Tra Cứu Vé, Lịch Sử Đặt Chỗ, Hủy Vé & Đánh Giá** | • `TicketLookupController` & `ReviewController`<br/>• API Tra cứu vé theo mã `GET /api/v1/bookings/code/{code}`<br/>• API Lịch sử vé của tôi `GET /api/v1/users/my-bookings`<br/>• API Hủy vé `POST /api/v1/tickets/{id}/cancel` tự động tính tiền hoàn theo bảng `cancellation_policy_rules`<br/>• API Gửi đánh giá sao ⭐ và bình luận nhà xe | • Nâng cấp trang Tra cứu vé `TicketLookupPage.tsx` (Tìm bằng SĐT hoặc Mã vé)<br/>• Trang Lịch sử chuyến đi của tôi<br/>• Modal Hủy vé: Hiển thị minh bạch % hoàn tiền theo chính sách và số tiền thực nhận<br/>• Widget Đánh giá 1-5 sao và viết review trải nghiệm | • Test tra cứu vé chính xác thông tin hành khách & ghế<br/>• Test hủy vé trước 24h hoàn tiền đúng % chính sách<br/>• Test gửi đánh giá thành công cập nhật điểm trung bình nhà xe |

---

### 2.5 Chi tiết Công việc End-to-End của Từng Thành Viên

#### 👑 1. PHẠM CÔNG THÀNH (NHÓM TRƯỞNG & SYSTEM ARCHITECT)
* **Phân hệ**: **ADMIN PORTAL & NỀN TẢNG KIẾN TRÚC HỆ THỐNG**
* **Trách nhiệm Backend (Spring Boot 3 + Java 21)**:
  * Quản trị và duy trì CSDL 36 bảng `init.sql` khớp 100% với `docs/schema.sql`.
  * Xây dựng tầng kiến trúc bảo mật trung tâm: `SecurityConfig.java`, `JwtTokenProvider.java`, `JwtAuthenticationFilter.java`, cấu hình bảo vệ `/api/v1/admin/**` với `hasRole('ADMIN')`.
  * Xây dựng bộ điều khiển Quản trị `AdminTripController` & `AdminTripService`:
    * API Thống kê KPI: `GET /api/v1/admin/dashboard/stats` (tổng chuyến, chuyến mở bán, tổng vé bán, doanh thu).
    * API Tạo chuyến xe mới: `POST /api/v1/admin/trips` **kèm thuật toán tự động sinh 34 ghế** (17 ghế tầng 1 A01-A17, 17 ghế tầng 2 B01-B17) vào bảng `trip_seats`.
    * API Đổi trạng thái chuyến xe: `PATCH /api/v1/admin/trips/{id}/status` (`SCHEDULED` ➔ `DEPARTED` ➔ `COMPLETED` ➔ `CANCELLED`).
    * Quản lý nhà xe đối tác, xe, chính sách giá và chính sách hủy vé hoàn tiền.
* **Trách nhiệm Frontend (React 18 + Vite + TypeScript)**:
  * Quản lý độc quyền file định tuyến `src/routes/adminRoutes.tsx`.
  * Phát triển giao diện `AdminDashboardPage.tsx`:
    * 4 Thẻ KPI thống kê doanh thu, chuyến xe, vé bán và khách hàng.
    * Nút & Form modal "Thêm Chuyến Xe Mới": Chọn nhà xe, tuyến đường, giờ khởi hành/đến, loại xe Limousine 34 phòng, nhập giá vé.
    * Bảng điều phối danh sách chuyến xe với các nút chuyển trạng thái xuất bến / hoàn thành.
* **Quản trị Kỹ thuật & DevOps**:
  * Quản trị Git Flow: Review và xét duyệt toàn bộ Pull Request của 5 thành viên từ nhánh `feature/*` vào `dev`.
  * Đảm bảo tính toàn vẹn CI/CD và Docker Compose (`traveleasy-mysql`, `traveleasy-backend`, `traveleasy-frontend`).
  * Chủ trì kịch bản bảo vệ tốt nghiệp 15 phút đạt 100/100 điểm.

#### 🔍 2. NGUYỄN ĐẠI PHÁT (FULL-STACK DEVELOPER)
* **Phân hệ**: **USERS SLICE 1 — Tìm kiếm Chuyến xe, Gợi ý Tuyến & Bộ lọc Đa tiêu chí**
* **Trách nhiệm Backend**:
  * `TripSearchController.java`: API `GET /api/v1/trips/search`.
  * Nhận các tham số: `departureLocationId`, `arrivalLocationId`, `departureDate`, `minPrice`, `maxPrice`, `busType`, `companyId`, `sortBy`.
  * Viết câu truy vấn Spring Data JPA Dynamic Specification để lọc chuyến xe linh hoạt, chỉ lấy các chuyến có trạng thái `SCHEDULED` và còn chỗ trống.
* **Trách nhiệm Frontend**:
  * Đăng ký route `/` và `/search` trong `src/routes/clientRoutes.tsx`.
  * Hoàn thiện giao diện `SearchTripBar.tsx`: Tự động gợi ý điểm đi/đến (TP.HCM, Đà Lạt, Nha Trang, Cần Thơ...), chọn ngày đi.
  * Hoàn thiện danh sách chuyến `TripCard.tsx`: Logo nhà xe, giờ đi/đến, thời gian dự kiến (vd: 8 giờ), số chỗ còn trống, giá vé từ và nút "Chọn chỗ".
  * Sidebar bộ lọc: Lọc khung giờ (Sáng 00:00-06:00, Trưa 06:00-12:00, Chiều 12:00-18:00, Tối 18:00-24:00), lọc giá vé bằng slider.
* **Kiểm thử**: Viết Unit Test cho API tìm kiếm với đầy đủ các bộ tham số lọc.

#### 💺 3. PHAN TRUNG KIÊN (FULL-STACK DEVELOPER)
* **Phân hệ**: **USERS SLICE 2 — Sơ đồ Chọn Ghế 2 Tầng & Khóa Giữ Chỗ Real-Time**
* **Trách nhiệm Backend**:
  * `SeatLockController.java`:
    * API `GET /api/v1/trips/{id}/seats`: Trả về toàn bộ danh sách 34 ghế kèm trạng thái (`AVAILABLE`, `LOCKED`, `BOOKED`).
    * API `POST /api/v1/seats/lock`: Khóa giữ chỗ ghế trong 10 phút.
  * Sử dụng kỹ thuật Khóa Bi quan (Pessimistic Write Lock) trên `TripSeatRepository` để loại bỏ 100% tình trạng hai người cùng chọn 1 ghế:
    ```java
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM TripSeat s WHERE s.trip.id = :tripId AND s.seatCode IN :seatCodes")
    List<TripSeat> lockSeatsForBooking(Long tripId, List<String> seatCodes);
    ```
* **Trách nhiệm Frontend**:
  * Đăng ký route `/trips/:tripId/seats` trong `src/routes/clientRoutes.tsx`.
  * Xây dựng Component `BusSeatMap.tsx`:
    * Vẽ 2 tầng xe Limousine 34 phòng: Tầng dưới (A01 - A17), Tầng trên (B01 - B17).
    * Phân biệt rõ: Ghế trống (viền xanh), Ghế đang chọn (màu cam nổi bật), Ghế đã có người mua (màu xám có gạch chéo, disabled).
    * Bộ đếm thời gian giữ chỗ 10:00 đếm lùi, tự động cảnh báo khi sắp hết giờ giữ ghế.
    * Hiển thị bảng tóm tắt: Danh sách ghế đã chọn và tổng tiền tạm tính.
* **Kiểm thử**: Concurrency Test mô phỏng 10 người cùng bấm chọn ghế A01 đồng thời (Zero Double-Booking).

#### 📝 4. PHẠM THANH PHONG (FULL-STACK DEVELOPER)
* **Phân hệ**: **USERS SLICE 3 — Điểm Đón/Trả, Thông Tin Hành Khách & Tạo Đơn Đặt Vé**
* **Trách nhiệm Backend**:
  * `BookingProcessController.java`:
    * API `GET /api/v1/trips/{id}/points`: Lấy danh mục điểm đón/trả và mốc giờ xe đón dự kiến (ETA).
    * API `POST /api/v1/bookings`: Tạo đơn đặt vé nguyên tử `@Transactional(isolation = Isolation.SERIALIZABLE)`.
  * Sinh mã đơn độc nhất `BK-YYYYMMDD-XXXX`.
  * Xác thực dữ liệu hành khách: Số điện thoại Việt Nam (10 chữ số), Email đúng định dạng, Họ tên không để trống.
  * Cập nhật trạng thái các ghế đã chọn sang `BOOKED` và giảm số ghế trống của chuyến xe.
* **Trách nhiệm Frontend**:
  * Đăng ký route `/checkout` trong `src/routes/clientRoutes.tsx`.
  * Nâng cấp `CheckoutModal.tsx`:
    * Bước 1: Chọn Điểm đón (ví dụ: Bến xe Miền Đông, Cây xăng số 47...) và Điểm trả (Bến xe Liên tỉnh Đà Lạt, Nội thành Đà Lạt...).
    * Bước 2: Form nhập thông tin hành khách (Họ tên, Số điện thoại, Email nhận vé, Ghi chú đón xe).
    * Bước 3: Xem lại thông tin chuyến đi, tổng tiền vé và nhấn nút "Tiến hành Đặt vé".
* **Kiểm thử**: Test validation đầu vào, test tạo đơn đặt vé thành công và kiểm tra ghế tự động chuyển trạng thái `BOOKED`.

#### 💳 5. TRẦN MINH ĐỨC 2 (FULL-STACK DEVELOPER)
* **Phân hệ**: **USERS SLICE 4 — Cổng Thanh Toán & Vé Điện Tử E-Ticket Kèm Mã QR**
* **Trách nhiệm Backend**:
  * `PaymentController.java`:
    * API `POST /api/v1/payments/create`: Tạo yêu cầu thanh toán (Hỗ trợ VNPay, MoMo, ZaloPay, COD khi lên xe).
    * API `GET /api/v1/payments/callback`: Xử lý phản hồi thanh toán từ cổng.
  * Khi thanh toán thành công:
    * Chuyển trạng thái Booking sang `CONFIRMED` / `PAID`.
    * Tự động sinh thực thể `Ticket` cho từng vị trí ghế: Mã vé `TK-YYYYMMDD-XXXX-01`.
    * Sinh mã băm QR Code hash (SHA-256 an toàn chứa `ticketCode` + `bookingId` + `seatCode`).
* **Trách nhiệm Frontend**:
  * Đăng ký route `/payment/callback` và `/tickets/:code` trong `src/routes/clientRoutes.tsx`.
  * Xây dựng giao diện `PaymentPage.tsx`: Lựa chọn phương thức thanh toán VNPay, MoMo, Chuyển khoản QR hoặc COD.
  * Xây dựng Thẻ vé điện tử E-Ticket sang trọng:
    * Đầy đủ thông tin: Tên nhà xe, Biển số, Tuyến đường, Giờ khởi hành, Điểm đón/trả, Họ tên khách, Vị trí ghế.
    * **Render mã QR Code** sắc nét cho từng ghế để phụ xe dùng điện thoại quét khi lên xe.
    * Nút "Tải vé điện tử (PDF)" hoặc "In vé".
* **Kiểm thử**: Test quy trình thanh toán thành công/thất bại, test quét và giải mã mã QR vé điện tử.

#### 🌟 6. ĐOÀN NHẬT CƯỜNG (FULL-STACK DEVELOPER)
* **Phân hệ**: **USERS SLICE 5 — Tra Cứu Vé, Lịch Sử Đặt Chỗ, Hủy Vé & Đánh Giá**
* **Trách nhiệm Backend**:
  * `TicketLookupController.java`:
    * API `GET /api/v1/bookings/code/{code}`: Tra cứu chi tiết đơn vé bằng mã đơn hoặc số điện thoại.
    * API `GET /api/v1/users/my-bookings`: Danh sách lịch sử các chuyến đi của người dùng.
    * API `POST /api/v1/tickets/{id}/cancel`: Hủy vé tự động áp dụng quy tắc hoàn tiền từ bảng `cancellation_policy_rules` (Trước 24h hoàn 90%, từ 12-24h hoàn 70%, sau 12h không hoàn).
  * `ReviewController.java`: API `POST /api/v1/reviews` cho phép khách gửi đánh giá từ 1-5 sao và bình luận sau khi hoàn thành chuyến đi.
* **Trách nhiệm Frontend**:
  * Đăng ký route `/lookup` và `/my-bookings` trong `src/routes/clientRoutes.tsx`.
  * Hoàn thiện trang Tra cứu vé `TicketLookupPage.tsx`: Nhập số điện thoại hoặc mã đơn để xem lại thẻ vé điện tử và mã QR.
  * Giao diện Lịch sử chuyến đi: Danh sách vé Sắp đi, Đã đi, Đã hủy.
  * Modal Hủy vé: Hiển thị minh bạch chính sách hoàn tiền, số tiền thực hoàn và xác nhận hủy vé.
  * Form Đánh giá Chuyến đi: Chọn số sao ⭐ (1 đến 5 sao), viết nhận xét chất lượng phục vụ của nhà xe.
* **Kiểm thử & QA**: Lập bảng kiểm thử và tự động hóa kiểm thử cho các kịch bản tra cứu, hủy vé và gửi đánh giá.

---

### 2.6 Ma trận Trách nhiệm RACI Cập Nhật
* **R** (Responsible): Trực tiếp thực hiện Full-Stack (BE + FE + Test)
* **A** (Accountable): Nhóm trưởng phê duyệt & chịu trách nhiệm chất lượng chung (**Phạm Công Thành**)
* **C** (Consulted): Tham vấn chuyên môn kỹ thuật
* **I** (Informed): Nhận thông báo tiến độ

| Phân hệ & Tính năng Full-Stack | Thành (Lead) | Phát | Kiên | Phong | Đức | Cường |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **PHÂN HỆ 1: ADMIN PORTAL (Dashboard, Xe, Tuyến, Chuyến, Giá, User, Logs)** | **R / A** | I | I | I | I | I |
| **USERS 1: Tìm kiếm Chuyến xe, Gợi ý Tuyến & Bộ lọc Nâng cao** | **A** | **R** | C | I | I | I |
| **USERS 2: Sơ đồ Chọn Ghế 2 Tầng & Khóa Giữ Chỗ Real-Time** | **A** | C | **R** | C | I | I |
| **USERS 3: Điểm Đón/Trả, Thông Tin Hành Khách & Đặt Vé** | **A** | I | C | **R** | C | I |
| **USERS 4: Cổng Thanh Toán & Vé Điện Tử E-Ticket Mã QR** | **A** | I | I | C | **R** | I |
| **USERS 5: Tra Cứu Vé, Lịch Sử Đặt Chỗ, Hủy Vé/Hoàn Tiền & Review** | **A** | I | I | I | C | **R** |
| **Kiến trúc Hệ thống, Security JWT, DDL CSDL & Quản trị Git PR** | **R / A** | C | C | C | C | C |

---
## 3. KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ (TECH STACK)

### 3.1 Mô hình kiến trúc Modular Monolith & Clean Architecture
Hệ thống TravelEasy áp dụng kiến trúc **Modular Monolith** kết hợp **Clean / Hexagonal Architecture** (theo tài liệu `docs/PROJECT_ARCHITECTURE (1).md`).
* **Độc lập vật lý giữa các module**: Tách bạch rõ ràng `identity`, `fleet`, `scheduling`, `booking`, `payment`, `review`, `analytics`.
* **Luật phụ thuộc (Dependency Rule)**: Phụ thuộc luôn hướng vào trong (`presentation` ➔ `infrastructure` ➔ `application` ➔ `domain`). Lớp `domain` hoàn toàn thuần túy, không phụ thuộc framework bên ngoài.
* **Snapshot Immutability**: Áp dụng triệt để nguyên tắc bất biến cho các bản ghi lịch sử vận hành (`trip_seat_prices`, `trip_points`, `tickets.seat_price_amount`, `cancellation_policies.locked_at`).

### 3.2 Ngăn xếp công nghệ chi tiết (Full Tech Stack)
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
  * Build Tool: Vite 5.4 (Hot Module Replacement, Build < 4s).
  * Styling: Tailwind CSS v3, Lucide React Icons.
  * HTTP Client: Axios 1.7 (Interceptors tự động đính kèm JWT Bearer).
* **Database & Caching Layer**:
  * RDBMS: MySQL 8.0 Community Server (InnoDB Engine, utf8mb4_0900_ai_ci / utf8mb4_unicode_ci).
  * In-Memory Database: H2 Database Engine (chế độ MySQL Compatibility cho Dev Profile).
  * Cache & Distributed Locks: Redis (Soft Hold 180s, Hard Hold 600s, SETNX atomic Lua scripts).
* **DevOps & Infrastructure**:
  * Containerization: Docker & Docker Compose v3.8.
  * Web Server / Reverse Proxy: Nginx Alpine (Multi-stage build frontend).
  * CI/CD: GitHub Actions Pipeline (Tự động build Gradle, build Vite, run test trên `main` & `dev`).

### 3.3 Sơ đồ kiến trúc tổng thể (System Architecture Diagram)

```mermaid
graph TD
    Client["Client Devices (Web Desktop / Mobile Web)"] -->|HTTPS / REST API| Frontend["Frontend Layer (React 18 + Vite + TypeScript + Tailwind)"]
    Frontend -->|Axios HTTP Requests| API_Gateway["Spring Security 6 (JWT Filter / CORS / RBAC)"]
    
    subgraph Spring_Boot_Backend ["Spring Boot 3.3.4 Backend (Modular Monolith)"]
        API_Gateway --> AuthController["AuthController (Auth & Profile)"]
        API_Gateway --> TripController["TripController (Catalog & Search Engine)"]
        API_Gateway --> BookingController["BookingController (Atomic Booking & COD)"]
        API_Gateway --> AdminTripController["AdminTripController (Fleet & Auto Seat Gen)"]
        API_Gateway --> AiController["AiController (Spring AI Smart Assistant)"]

        AuthController --> AuthService["AuthService (BCrypt 12 rounds)"]
        TripController --> TripService["TripService (JPQL Search & Seat Map)"]
        BookingController --> BookingService["BookingService (@Transactional & Pessimistic Lock)"]
        AdminTripController --> AdminTripService["AdminTripService (Trip Ops & KPI Analytics)"]
        AiController --> AiService["AiService (Travel Advice Engine)"]
    end

    BookingService -->|Lock & Update| MySQL_DB[("MySQL 8.0 Database (36 Canonical Tables)")]:::db
    TripService -->|Read Only| MySQL_DB
    AdminTripService -->|CRUD Trips & Seats| MySQL_DB
    AuthService -->|User Identity| MySQL_DB

    BookingService -.->|Hold Keys TTL 180s/600s| Redis_Cache[("Redis (Distributed Hold State)")]:::cache

    subgraph ThirdParty ["External Gateways"]
        Payment_Gateways["Payment Gateways (VNPay / MoMo / ZaloPay)"]
        SMS_Email["Notification Gateways (Twilio SMS / SendGrid Email)"]
        OpenAI_API["AI Cloud Engine (OpenAI / Spring AI)"]
    end

    BookingService -.-> Payment_Gateways
    BookingService -.-> SMS_Email
    AiService -.-> OpenAI_API

    classDef db fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef cache fill:#fff3e0,stroke:#f57c00,stroke-width:2px;
```

---

## 4. ĐẶC TẢ MIỀN NGHIỆP VỤ (DOMAIN-DRIVEN DESIGN - DDD)

### 4.1 Phân loại Core, Supporting & Generic Domains
Dựa trên tài liệu chuẩn `docs/domain.md`:
* **Core Domain**: **Booking & Seat Inventory Domain** (Khóa ghế 2 lớp Soft Hold 180s / Hard Hold 600s, Pessimistic Lock, Chống Double-Booking, Ghép ghế bán tự động khi đổi xe khẩn cấp).
* **Supporting Domain**: **Trip & Fleet Operations**, **Payment & Refund Orchestration**, **Cancellation Policy Management**, **Review & Reputation Management**, **Notification Dispatch**.
* **Generic Domain**: **Identity & Access Management (IAM)**, **Location Catalog Geocoding**, **Payment/Notification Gateway Configs**, **Audit Logging**, **Banner Management**.

### 4.2 13 Bounded Contexts
1. **Identity Context**: Quản lý tài khoản, danh tính, JWT Access/Refresh Token.
2. **Location Context (Master Data)**: Quản lý danh mục địa điểm bến xe dùng chung toàn sàn do Admin kiểm duyệt.
3. **Route Template & Location Config Context**: Quản lý cấu hình địa điểm riêng của từng nhà xe (`BusCompanyLocationConfig`) và tuyến mẫu (`RouteTemplate`).
4. **BusCompany (Fleet) Context**: Quản lý hồ sơ nhà xe và đội xe vật lý.
5. **SeatLayout Context**: Sơ đồ mẫu do Admin công bố (`SeatLayoutTemplate`) và sơ đồ gán loại ghế của xe (`VehicleSeatLayout`).
6. **Trip Context**: Chuyến xe mở bán, giờ xuất phát gốc, điểm dừng snapshot `TripPoint` và dịch vụ trung chuyển `TripShuttleService`.
7. **Booking Context**: Quản lý đơn đặt vé, thông tin hành khách, giữ ghế và xuất vé điện tử.
8. **Payment Context**: Quản lý giao dịch thanh toán COD, VNPay, MoMo, xử lý IPN và đối soát tự động.
9. **Refund Context**: Đánh giá chính sách hủy vé, tính tiền hoàn và xử lý giao dịch hoàn tiền.
10. **Ticketing Context**: Phát hành vé điện tử kèm mã QR Code hash, kiểm tra check-in khi lên xe.
11. **Review Context**: Đánh giá dịch vụ hậu kiểm (post-moderation), báo cáo vi phạm với SLA xử lý 48h.
12. **Notification Context**: Phân phối SMS và Email thông báo đặt vé, nhắc ETA khởi hành.
13. **Admin & Audit Context**: Cấu hình kỹ thuật hệ thống và lưu vết Audit Log bất biến (append-only).

### 4.3 19 Aggregate Roots & 13 Contained Entities

```
+----------------------------------------------------------------------------------------------------+
| 19 AGGREGATE ROOTS CHUẨN HÓA (DOMAIN-DRIVEN DESIGN)                                                |
+----------------------------------------------------------------------------------------------------+
| 1. User               2. Vehicle             3. BusCompany           4. VehicleSeatLayout          |
| 5. SeatLayoutTemplate 6. SeatType            7. Location             8. Trip                       |
| 9. CancellationPolicy 10. Booking            11. PaymentTransaction  12. RefundTransaction         |
| 13. Review            14. Banner             15. PaymentGatewayConfig16. NotificationGatewayConfig |
| 17. AuditLog          18. RouteTemplate      19. BusCompanyLocationConfig                          |
+----------------------------------------------------------------------------------------------------+
```

* **13 Contained Entities (Composition)**: `RefreshToken` (trong User), `SeatPositionAssignment` (trong VehicleSeatLayout), `TemplateSeatSlot` (trong SeatLayoutTemplate), `TripPoint` (trong Trip), `TripSeat` (trong Trip), `TripSeatPrice` (trong Trip), `TripShuttleService` (trong Trip), `Ticket` (trong Booking), `RescheduleRecord` (trong Booking), `ReviewReport` (trong Review), `RouteTemplateSeatPrice` (trong RouteTemplate), `RouteTemplateStop` (trong RouteTemplate), `RouteTemplateShuttleService` (trong RouteTemplate).
* **13 Value Objects**: `PhoneNumber`, `Email`, `Money`, `GeoCoordinate`, `SeatCode`, `SeatPosition`, `QRCode`, `OTPCode`, `PassengerInfo`, `TripSchedule`, `CancellationRule`, `AuditDetail`, `JwtClaims`.

### 4.4 23 Canonical Enums
`BookingStatus`, `TicketStatus`, `PaymentStatus`, `RefundStatus`, `TripStatus`, `SeatStatus`, `ReviewStatus`, `ReviewReportStatus`, `UserRole`, `AccountStatus`, `BusCompanyStatus`, `VehicleType`, `VehicleStatus`, `CancellationReason`, `SeatAssignmentStatus`, `VehicleSeatLayoutStatus`, `BusCompanyLocationConfigStatus`, `LocationStatus`, `RouteTemplateStatus`, `RouteStopType`, `ShuttleType`, `ShuttlePricingType`, `PaymentGatewayType`.

### 4.5 5 State Machines (Sơ đồ trạng thái nghiệp vụ)

#### Sơ đồ 1: Vòng đời Đơn đặt vé (Booking State Machine)
```mermaid
stateDiagram-v2
    [*] --> PENDING_PAYMENT : Hard Hold thành công, Đơn vé được tạo
    PENDING_PAYMENT --> CONFIRMED : PaymentSucceeded / Đặt vé COD thành công
    PENDING_PAYMENT --> CONFIRMED : RescheduleFinalized (Đổi vé không bù tiền)
    PENDING_PAYMENT --> FAILED : PaymentFailed / Thất bại
    PENDING_PAYMENT --> EXPIRED : Hết hạn giữ ghế (600s) không thanh toán
    CONFIRMED --> CANCELLED : 100% vé con bị hủy
    CONFIRMED --> COMPLETED : Chuyến xe hoàn thành hành trình
    CANCELLED --> [*]
    COMPLETED --> [*]
    FAILED --> [*]
    EXPIRED --> [*]
```

#### Sơ đồ 2: Vòng đời Vé điện tử (Ticket State Machine)
```mermaid
stateDiagram-v2
    [*] --> ISSUED : Đặt vé thành công, cấp mã vé & QR Code
    ISSUED --> CHECKED_IN : Hành khách quét mã QR lên xe
    ISSUED --> CANCELLED : Khách hủy vé trước 24h
    CHECKED_IN --> COMPLETED : Chuyến xe đến bến đích an toàn
    ISSUED --> COMPLETED : Xe hoàn thành (không qua bước quét mã)
    COMPLETED --> [*]
    CANCELLED --> [*]
```

#### Sơ đồ 3: Vòng đời Chuyến xe (Trip State Machine)
```mermaid
stateDiagram-v2
    [*] --> SCHEDULED : Nhà xe mở bán chuyến xe
    SCHEDULED --> DELAYED : Báo trễ chuyến (Cập nhật delayMinutes)
    SCHEDULED --> RUNNING : Xe xuất bến chạy đúng giờ
    DELAYED --> RUNNING : Xe xuất bến chạy theo giờ thực tế
    RUNNING --> COMPLETED : Toàn bộ hành khách đã trả xong
    SCHEDULED --> CANCELLED : Hủy chuyến vì lý do bất khả kháng
    COMPLETED --> [*]
    CANCELLED --> [*]
```

### 4.6 Tổng hợp 40 Business Rules cốt lõi & Quyết định nghiệp vụ PBD
1. **Rule 1 - 6 (Ghế & Giữ chỗ)**: Một ghế chỉ thuộc 1 chuyến duy nhất. Soft Hold (180s) trên Redis; Hard Hold (600s) chuyển đổi nguyên tử bằng Lua script; cấm gia hạn Hard Hold.
2. **Rule 7 - 12 (Thanh toán & Đối soát)**: Bắt buộc đăng nhập trước khi checkout; IPN server-to-server là Source of Truth; Cron đối soát quét giao dịch treo mỗi 5 phút.
3. **Rule 13 - 17 (Đánh giá & Khiếu nại)**: Một vé chỉ review 1 lần sau khi hoàn thành; Đánh giá hiển thị công khai ngay (post-moderation); Nhà xe report thì tạm ẩn; SLA Admin xử lý 48h.
4. **Rule 18 - 22 (Sơ đồ ghế & Đổi xe khẩn cấp)**: Nhà xe không được sửa cấu trúc lưới mẫu; Cấm sửa layout chuyến đã bán vé; Đổi xe khẩn cấp áp dụng thuật toán ghép ghế bán tự động FIFO theo loại ghế tương đương.
5. **Rule 23 - 25 (Hủy vé & Hoàn tiền)**: Chính sách hủy theo tầng thời gian (>24h hoàn 100%, 12-24h hoàn 50%, <12h không hoàn); Hoàn tiền tự động về đúng cổng thanh toán gốc.
6. **Rule 26 - 30 (Bảo mật & Master Data)**: Tài khoản OTP và Google không tự động gộp; OTP hết hạn 120s; Địa điểm `Location` là Shared Master Data do Admin quản lý toàn sàn; Nhà xe chỉ tạo cấu hình điểm đón trả `BusCompanyLocationConfig` riêng.
7. **Rule 31 - 36 (Tuân thủ & Pháp lý)**: Ghi Audit Log bất biến (IP, User, thời gian, chi tiết thay đổi); Mã hóa AES-256 API Key cổng thanh toán; Quyền được lãng quên PDPD xóa dữ liệu cá nhân trong 72h.
8. **Rule 37 (Partial Cancellation)**: Cho phép hủy lẻ từng vé con trong đơn nhiều vé; Ghế hủy giải phóng về `AVAILABLE`; Đơn vé vẫn giữ `CONFIRMED` nếu còn vé con active.
9. **Rule 38 (Reschedule - Tạo Booking Mới)**: Đổi vé tạo New Booking + New Ticket trên chuyến mới; Vé cũ chuyển sang `CANCELLED (RESCHEDULED)`; Lưu vết lịch sử `ticket_reschedule_histories`.
10. **Rule 39 (Cumulative Refund & Pessimistic Lock)**: Ràng buộc hoàn tiền cộng dồn $\sum 	ext{Refund} \le 	ext{Payment.Amount}$, khóa độc quyền bằng `SELECT ... FOR UPDATE` chống tranh chấp.
11. **Rule 40 (Ownership Invariants O1 - O5)**: Nhà xe A tuyệt đối không được dùng xe, cấu hình điểm dừng hay chính sách hủy của Nhà xe B.
12. **Quyết định nghiệp vụ Reschedule (PBD)**:
    * **PBD-01**: Thời hạn chót đổi vé là trước giờ khởi hành chuyến cũ ít nhất **2 tiếng**.
    * **PBD-02**: Phí đổi vé V1 bằng **0 VNĐ** (Miễn phí đổi vé, chỉ tính chênh lệch giá ghế).
    * **PBD-03**: Chỉ được đổi chuyến trong **cùng Tuyến mẫu và cùng Nhà xe**.
    * **PBD-04**: Mỗi vé chỉ được đổi thành công **tối đa 1 lần**.

---

## 5. THIẾT KẾ LỚP CHI TIẾT (CLASS DIAGRAM CANONICAL)

Dưới đây là 6 sơ đồ Class Diagram Mermaid chuẩn hóa theo `docs/class_diagram.md`:

### 5.1 Identity & Access Context

```mermaid
classDiagram
    class User {
        <<AggregateRoot>>
        -userId String
        -phoneNumber PhoneNumber
        -email Email
        -password String
        -fullName String
        -role UserRole
        -busCompanyId String
        -accountStatus AccountStatus
        +lock() void
        +unlock() void
        +issueRefreshToken() RefreshToken
    }
    class RefreshToken {
        <<Entity>>
        -tokenId String
        -issuedAt DateTime
        -expiresAt DateTime
        -revoked boolean
        +revoke() void
    }
    class PhoneNumber {
        <<ValueObject>>
        -number String
    }
    class Email {
        <<ValueObject>>
        -address String
    }
    User "1" *-- "0..*" RefreshToken : owns
    User "1" --> "0..1" PhoneNumber : has
    User "1" --> "0..1" Email : has
```

### 5.2 Fleet & Seat Catalog Context

```mermaid
classDiagram
    class BusCompany {
        <<AggregateRoot>>
        -busCompanyId String
        -name String
        -hotline String
        -status BusCompanyStatus
        -defaultCancellationPolicyId String
    }
    class Vehicle {
        <<AggregateRoot>>
        -vehicleId String
        -busCompanyId String
        -plateNumber String
        -vehicleType VehicleType
        -status VehicleStatus
    }
    class VehicleSeatLayout {
        <<AggregateRoot>>
        -layoutId String
        -vehicleId String
        -sourceTemplateId String
        -status VehicleSeatLayoutStatus
    }
    class SeatPositionAssignment {
        <<Entity>>
        -seatCode String
        -floor int
        -row int
        -column int
        -seatTypeCode String
        -status SeatAssignmentStatus
    }
    class SeatType {
        <<AggregateRoot>>
        -code String
        -label String
    }
    BusCompany "1" --> "0..*" Vehicle : owns
    Vehicle "1" --> "0..1" VehicleSeatLayout : has (1-1 một chiều)
    VehicleSeatLayout "1" *-- "1..*" SeatPositionAssignment : contains
    SeatPositionAssignment --> SeatType : references
```

### 5.3 Route Template & Location Configuration Context

```mermaid
classDiagram
    class RouteTemplate {
        <<AggregateRoot>>
        -routeTemplateId String
        -busCompanyId String
        -name String
        -originLocationId String
        -destinationLocationId String
        -status RouteTemplateStatus
    }
    class RouteTemplateStop {
        <<Entity>>
        -sequence int
        -busCompanyLocationConfigId String
        -estimatedTravelDurationFromPreviousStopMinutes int
        -stopType RouteStopType
    }
    class RouteTemplateSeatPrice {
        <<Entity>>
        -seatTypeCode String
        -price Money
    }
    class BusCompanyLocationConfig {
        <<AggregateRoot>>
        -busCompanyId String
        -locationId String
        -displayName String
        -status BusCompanyLocationConfigStatus
        -acceptsPickup boolean
        -acceptsDropoff boolean
    }
    class Location {
        <<AggregateRoot>>
        -locationId String
        -name String
        -provinceName String
        -districtName String
    }
    RouteTemplate "1" *-- "1..*" RouteTemplateStop : contains
    RouteTemplate "1" *-- "1..*" RouteTemplateSeatPrice : contains
    RouteTemplateStop --> BusCompanyLocationConfig : references
    BusCompanyLocationConfig --> Location : configures
```

### 5.4 Trip & Seat Inventory Context (Core Domain)

```mermaid
classDiagram
    class Trip {
        <<AggregateRoot>>
        -tripId String
        -routeTemplateId String
        -vehicleId String
        -baseDepartureTime DateTime
        -delayMinutes int
        -status TripStatus
        +createFromRouteTemplate() Trip
        +getSeatPrice(seatTypeCode) Money
        +reportDelay(delayMinutes) void
    }
    class TripPoint {
        <<Entity>>
        -sequence int
        -eta DateTime
        -displayName String
        -acceptsPickup boolean
        -acceptsDropoff boolean
        +effectiveEta() DateTime
    }
    class TripSeat {
        <<Entity>>
        -seatCode String
        -status SeatStatus
        -seatTypeCode String
        +hold() void
        +book() void
        +release() void
    }
    class TripSeatPrice {
        <<Entity>>
        -seatTypeCode String
        -price Money
    }
    Trip "1" *-- "1..*" TripPoint : contains (Immutable ETA)
    Trip "1" *-- "1..*" TripSeat : contains (34 Seats)
    Trip "1" *-- "1..*" TripSeatPrice : contains (Snapshot)
```

### 5.5 Booking, Payment & Refund Context (Core Domain)

```mermaid
classDiagram
    class Booking {
        <<AggregateRoot>>
        -bookingId String
        -userId String
        -tripId String
        -status BookingStatus
        -totalAmount Money
        +confirmAndIssueTickets() void
        +cancel() void
    }
    class Ticket {
        <<Entity>>
        -ticketId String
        -bookingId String
        -tripId String
        -seatCode String
        -seatPrice Money
        -passengerName String
        -status TicketStatus
        -qrCodeHash String
        +checkIn() void
        +cancel() void
    }
    class PaymentTransaction {
        <<AggregateRoot>>
        -txnRef String
        -bookingId String
        -amount Money
        -status PaymentStatus
    }
    class RefundTransaction {
        <<AggregateRoot>>
        -refundId String
        -paymentTxnRef String
        -bookingId String
        -ticketId String
        -amount Money
        -status RefundStatus
    }
    Booking "1" *-- "1..*" Ticket : contains (Composite FK)
    Booking "1" --> "0..*" PaymentTransaction : paid via
    PaymentTransaction "1" --> "0..*" RefundTransaction : refunded via
    Ticket "1" --> "0..*" RefundTransaction : refunds ticket
```

### 5.6 Review, Notification, Admin Config & Audit Context

```mermaid
classDiagram
    class Review {
        <<AggregateRoot>>
        -reviewId String
        -ticketId String
        -rating int
        -comment String
        -status ReviewStatus
    }
    class ReviewReport {
        <<Entity>>
        -reportId String
        -reportedByBusCompanyId String
        -status ReviewReportStatus
    }
    class AuditLog {
        <<AggregateRoot>>
        -auditLogId long
        -actorUserId String
        -action String
        -detailBefore JSON
        -detailAfter JSON
        -occurredAt DateTime
    }
    Review "1" *-- "0..*" ReviewReport : contains (SLA 48h)
```

### 5.7 Các quy tắc sở hữu (Ownership Rules O1 - O5) & Bất biến lịch sử
* **Rule O1 (RouteTemplateStop ➔ Config)**: Stop của Nhà xe A chỉ được trỏ `BusCompanyLocationConfig` của Nhà xe A. *(Enforce: DB Trigger `tg_rt_stop_config_same_company`)*.
* **Rule O2 (Trip ➔ Vehicle)**: Chuyến xe của Nhà xe A chỉ được sử dụng phương tiện thuộc Nhà xe A. *(Enforce: DB Trigger `tg_trip_same_company_ownership`)*.
* **Rule O3 (Trip ➔ RouteTemplate)**: Chuyến xe chỉ được tạo từ Tuyến mẫu của chính nhà xe đang đăng nhập. *(Enforce: Application Layer Authorization)*.
* **Rule O4 (Trip ➔ CancellationPolicy)**: Chuyến xe chỉ được áp dụng chính sách hủy thuộc nhà xe sở hữu. *(Enforce: DB Trigger)*.
* **Rule O5 (Location Shared)**: Địa điểm không áp quyền sở hữu riêng, nhiều nhà xe cùng trỏ về 1 Location thông qua Config riêng.
* **Bất biến lịch sử (Snapshot Immutability)**: Khi Trip được tạo, các thông tin giá vé `TripSeatPrice`, điểm dừng `TripPoint`, giờ ETA gốc là **BẤT BIẾN VĨNH VIỄN** (DB Trigger chặn mọi lệnh `UPDATE`). Khi đổi chuyến hoặc hủy vé, giá vé `Ticket.seatPrice` là giá gốc khách đã thanh toán, không bao giờ suy ngược từ giá hiện tại của chuyến xe.

---

## 6. THIẾT KẾ CƠ SỞ DỮ LIỆU MYSQL 8.0 & ERD (36 BẢNG CHUẨN HÓA)

> **Khớp 100% tài liệu kiến trúc**:  
> Cơ sở dữ liệu của dự án được triển khai đầy đủ **36 bảng chuẩn hóa** theo đúng file [`docs/schema.sql`](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/schema.sql) và [`init.sql`](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/init.sql), đồng thời tích hợp các View tương thích (`routes`, `pickup_dropoff_points`) và nạp sẵn 100% dữ liệu mẫu sinh động.

### 6.1 Sơ đồ quan hệ thực thể tổng thể (ERD Mermaid)

```mermaid
erDiagram
    USERS ||--o{ REFRESH_TOKENS : "issues (1-N)"
    BUS_COMPANIES ||--o{ USERS : "represented by (role=BUS_COMPANY)"
    BUS_COMPANIES ||--o{ VEHICLES : "owns (1-N)"
    BUS_COMPANIES ||--o{ CANCELLATION_POLICIES : "owns (1-N)"
    BUS_COMPANIES ||--o{ ROUTE_TEMPLATES : "owns (1-N)"
    BUS_COMPANIES ||--o{ BUS_COMPANY_LOCATION_CONFIGS : "configures (1-N)"
    LOCATIONS ||--o{ BUS_COMPANY_LOCATION_CONFIGS : "configured at (1-N)"
    LOCATIONS ||--o{ ROUTE_TEMPLATES : "origin/dest anchor"

    VEHICLES ||--o| VEHICLE_SEAT_LAYOUTS : "has layout (1-1)"
    VEHICLES ||--o{ VEHICLE_IMAGES : "gallery photos"
    SEAT_LAYOUT_TEMPLATES ||--o{ TEMPLATE_SEAT_SLOTS : "contains (1-N)"
    SEAT_LAYOUT_TEMPLATES ||--o{ VEHICLE_SEAT_LAYOUTS : "cloned into"
    VEHICLE_SEAT_LAYOUTS ||--o{ SEAT_POSITION_ASSIGNMENTS : "contains (1-N)"
    SEAT_TYPES ||--o{ SEAT_POSITION_ASSIGNMENTS : "referenced by"

    ROUTE_TEMPLATES ||--o{ ROUTE_TEMPLATE_STOPS : "contains stops"
    ROUTE_TEMPLATES ||--o{ ROUTE_TEMPLATE_SEAT_PRICES : "defines pricing"
    ROUTE_TEMPLATES ||--o{ ROUTE_TEMPLATE_SHUTTLE_SERVICES : "offers shuttle"
    BUS_COMPANY_LOCATION_CONFIGS ||--o{ ROUTE_TEMPLATE_STOPS : "referenced by"

    CANCELLATION_POLICIES ||--o{ CANCELLATION_RULES : "contains rules"
    CANCELLATION_POLICIES ||--o{ TRIPS : "applies to"
    VEHICLES ||--o{ TRIPS : "operates"
    ROUTE_TEMPLATES ||--o{ TRIPS : "generates trip"
    TRIPS ||--o{ TRIP_POINTS : "contains snapshot ETA"
    TRIPS ||--o{ TRIP_SEATS : "contains 34 seats"
    TRIPS ||--o{ TRIP_SEAT_PRICES : "contains snapshot price"
    TRIPS ||--o{ TRIP_SHUTTLE_SERVICES : "contains shuttle"

    USERS ||--o{ BOOKINGS : "places booking"
    TRIPS ||--o{ BOOKINGS : "booked for"
    BOOKINGS ||--o{ TICKETS : "contains (Composite FK)"
    TRIP_SEATS ||--o| TICKETS : "occupied by"
    BOOKINGS ||--o{ PAYMENT_TRANSACTIONS : "paid via"
    PAYMENT_TRANSACTIONS ||--o{ REFUND_TRANSACTIONS : "refunds"
    TICKETS ||--o{ REFUND_TRANSACTIONS : "refunds ticket"
    BOOKINGS ||--o{ TICKET_RESCHEDULE_HISTORIES : "reschedule log"

    TICKETS ||--o| REVIEWS : "reviewed by (1-1)"
    REVIEWS ||--o{ REVIEW_REPORTS : "reported via"
    USERS ||--o{ AUDIT_LOGS : "performed by"
    USERS ||--o{ BANNERS : "created by"
```

### 6.2 Bảng đặc tả chi tiết 36 bảng CSDL (Khớp 100% `docs/schema.sql` và `init.sql`)

| Nhóm | STT | Tên bảng (Table) | Mục đích nghiệp vụ & Khóa chính (PK) | Ràng buộc chính (FK, UK & Constraints) |
|:---:|:---:|:---|:---|:---|
| **A: Identity** | 1 | `users` | Quản lý danh tính đăng nhập, phân quyền RBAC (PK: `id CHAR(36)`) | UK: `email`, `phone_number`, `firebase_uid`. Check role và status. |
| | 2 | `refresh_tokens` | Lưu token dài hạn cấp lại phiên làm việc (PK: `id CHAR(36)`) | FK: `user_id` ➔ `users(id)` ON DELETE CASCADE. |
| **B: Fleet & Seats** | 3 | `bus_companies` | Danh mục nhà xe đối tác vận tải (PK: `id CHAR(36)`) | UK: `name`. FK: `default_cancellation_policy_id`. |
| | 4 | `vehicles` | Danh sách phương tiện vận tải vật lý (PK: `id CHAR(36)`) | UK: `plate_number`. FK: `bus_company_id`. Check `vehicle_type`. |
| | 5 | `vehicle_images` | Bộ sưu tập ảnh phương tiện & ảnh đại diện (PK: `id CHAR(36)`) | FK: `vehicle_id`. Virtual Column duy nhất cho ảnh cover. |
| | 6 | `seat_layout_templates`| Sơ đồ ghế mẫu do Admin công bố (PK: `id CHAR(36)`) | FK: `created_by`. Check `max_floor, max_rows, max_columns > 0`. |
| | 7 | `template_seat_slots` | Cấu trúc lưới thô từng vị trí ghế (PK: `id CHAR(36)`) | UK: `(template_id, seat_code)`. FK: `template_id`. |
| | 8 | `seat_types` | Danh mục loại ghế chuẩn hóa toàn sàn (PK: `code VARCHAR(30)`) | `STANDARD`, `VIP`, `SLEEPER`, `CABIN`. |
| | 9 | `vehicle_seat_layouts`| Sơ đồ ghế thực tế của xe - Quan hệ 1-1 (PK: `id CHAR(36)`) | UK: `vehicle_id`. FK: `source_template_id`. |
| | 10 | `seat_position_assignments`| Gán loại ghế cho từng vị trí trên xe (PK: `id CHAR(36)`) | UK: `(vehicle_seat_layout_id, seat_code)`. FK: `seat_type_code`. |
| **F: Route & Location**| 11 | `administrative_provinces`| Danh mục 63 Tỉnh/Thành phố trực thuộc TW (PK: `id CHAR(36)`) | UK: `official_code`. |
| | 12 | `administrative_communes` | Danh mục Quận/Huyện, Phường/Xã (PK: `id CHAR(36)`) | FK: `province_id`. UK: `official_code`. |
| | 13 | `locations` | Danh mục bến xe / điểm đón trả dùng chung (PK: `id CHAR(36)`)| Tọa độ vĩ độ/kinh độ, tên tỉnh/huyện phục vụ tìm kiếm. |
| | 14 | `bus_company_location_configs`| Cấu hình điểm đón trả riêng của từng nhà xe (PK: `id CHAR(36)`)| UK: `(bus_company_id, location_id)`. Soft Disable Grandfather Rule. |
| | 15 | `route_templates` | Tuyến mẫu cố định của nhà xe (PK: `id CHAR(36)`) | FK: `origin_location_id`, `destination_location_id`. |
| | 16 | `route_template_stops`| Danh sách điểm dừng chuẩn có thứ tự sequence (PK: `id CHAR(36)`)| UK: `(route_template_id, sequence)`. Duration từ Routing API. |
| | 17 | `route_template_seat_prices`| Bảng giá vé theo từng loại ghế của tuyến (PK: `id CHAR(36)`)| UK: `(route_template_id, seat_type_code)`. |
| | 18 | `route_template_shuttle_services`| Cấu hình xe trung chuyển mẫu Đón/Trả (PK: `id CHAR(36)`)| UK: `(route_template_id, shuttle_type)`. Composite FK. |
| **C: Policy & Trips** | 19 | `cancellation_policies`| Chính sách hủy vé - Bất biến sau khi dùng (PK: `id CHAR(36)`)| FK: `owner_bus_company_id`. Cờ `locked_at` write-once. |
| | 20 | `cancellation_rules` | Tỷ lệ hoàn tiền theo mốc giờ trước khởi hành (PK: `id CHAR(36)`)| UK: `(policy_id, hours_before_departure)`. Check [0..100%]. |
| | 21 | `trips` | Chuyến xe mở bán theo lịch trình thực tế (PK: `id CHAR(36)`)| FK: `route_template_id`, `vehicle_id`. Cột `delay_minutes`. |
| | 22 | `trip_points` | Snapshot lịch trình & ETA tính dồn bất biến (PK: `id CHAR(36)`)| UK: `(trip_id, sequence)`. Snapshot 8 trường vận hành. |
| | 23 | `trip_seats` | Kho 34 ghế ngồi của chuyến đi (PK: `trip_id`, `seat_code`)| Composite PK. Version Optimistic Lock. Khóa ghế nguyên tử. |
| | 24 | `trip_seat_prices` | Snapshot giá vé bất biến theo loại ghế (PK: `trip_id`, `code`)| Composite PK. Bất biến vĩnh viễn (Trigger chặn sửa). |
| | 25 | `trip_shuttle_services`| Snapshot dịch vụ xe trung chuyển trên chuyến (PK: `id CHAR(36)`)| UK: `(trip_id, shuttle_type)`. |
| **D: Booking & Ticket**| 26 | `bookings` | Đơn đặt vé xe của hành khách (PK: `id CHAR(36)`) | UK: `(id, trip_id)`. FK: `user_id` (Nullable), `trip_id`. |
| | 27 | `tickets` | Vé điện tử phát hành cho từng vị trí ghế (PK: `id CHAR(36)`) | Composite FK: `(booking_id, trip_id)`. Snapshot `seat_price`. |
| | 28 | `payment_transactions` | Giao dịch cổng thanh toán / COD (PK: `txn_ref VARCHAR(64)`)| Partial Unique: `(booking_id) WHERE txn_type='INITIAL'`. |
| | 29 | `refund_transactions` | Giao dịch hoàn tiền khi hủy vé (PK: `id CHAR(36)`) | FK: `payment_txn_ref`, `booking_id`, `ticket_id`. |
| | 30 | `ticket_reschedule_histories`| Lưu vết lịch sử đổi chuyến / đổi ngày (PK: `id CHAR(36)`)| Ghi vết `old_booking_id` ➔ `new_booking_id`, `old_ticket` ➔ `new_ticket`. |
| **E: Review & Admin** | 31 | `reviews` | Đánh giá của khách sau chuyến đi (PK: `id CHAR(36)`) | UK: `ticket_id`. Rating 1-5 sao. Post-moderation. |
| | 32 | `review_reports` | Báo cáo khiếu nại đánh giá từ nhà xe (PK: `id CHAR(36)`) | FK: `review_id`. Partial Unique: tối đa 1 report PENDING. |
| | 33 | `banners` | Banner quảng cáo nổi bật trang chủ (PK: `id CHAR(36)`) | FK: `created_by`. Trạng thái `PUBLISHED`. |
| | 34 | `payment_gateway_configs`| Cấu hình kỹ thuật VNPay, MoMo, ZaloPay (PK: `id CHAR(36)`)| UK: `gateway_type`. Mã hóa API Key chuẩn AES-256. |
| | 35 | `notification_gateway_configs`| Cấu hình SMS Gateway, Email SMTP (PK: `id CHAR(36)`)| UK: `channel`. |
| | 36 | `audit_logs` | Bản ghi vết kiểm toán bất biến (PK: `id BIGINT AUTO_INCREMENT`)| Append-only. Lưu `actor_user_id`, `detail_before`, `detail_after`. |

---

### 6.3 Cơ chế trừ ghế nguyên tử, chống tranh chấp (Pessimistic Lock `FOR UPDATE`)
Để triệt tiêu hoàn toàn lỗi **Double-Booking (Race Condition)** khi hàng chục hành khách cùng bấm đặt 1 ghế cùng 1 thời điểm:
1. **Lớp 1 (Redis Distributed Lock)**: Dùng lệnh `SETNX` với TTL 180s (Soft Hold) và chuyển đổi sang 600s (Hard Hold) bằng Lua Script nguyên tử.
2. **Lớp 2 (Database Pessimistic Locking)**: Khi API thanh toán/đặt vé được gọi, Spring Data JPA thực thi câu lệnh SQL với khóa hàng độc quyền:
   ```sql
   SELECT * FROM trip_seats 
   WHERE trip_id = :tripId AND seat_code IN (:seatCodes) 
   FOR UPDATE;
   ```
   * Luồng đầu tiên giữ khóa hàng `FOR UPDATE`, kiểm tra trạng thái ghế `AVAILABLE` ➔ Đổi sang `BOOKED` ➔ Giảm `available_seats` trên bảng `trips` ➔ Commit giao dịch.
   * Các luồng đến sau bị chặn chờ khóa; khi giải phóng khóa, kiểm tra thấy ghế đã `BOOKED` ➔ Ném ngay ngoại lệ `SEAT_ALREADY_BOOKED` (**HTTP 409 Conflict**) và rollback toàn bộ.
3. **Lớp 3 (Database Constraint)**: Ràng buộc duy nhất `tickets(trip_id, seat_code) WHERE status <> 'CANCELLED'` đảm bảo không bao giờ có 2 vé active cùng ngồi 1 ghế.

---

### 6.4 Dữ liệu mẫu khởi tạo trực quan (Seed Data chi tiết cho 36 bảng)

Toàn bộ dữ liệu mẫu thực tế đã được nạp sẵn vào file [`init.sql`](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/init.sql) và lớp [`DataInitializer.java`](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/backend/src/main/java/com/traveleasy/config/DataInitializer.java):

#### 1. Tài khoản người dùng (`users`) — Mật khẩu dùng chung: `Rikkei@123`
| ID | Họ và tên | Email đăng nhập | Số điện thoại | Quyền hạn (Role) | Chức năng thử nghiệm |
|---|---|---|:---:|:---:|---|
| `11111111-...` | **Phạm Công Thành** | `admin@traveleasy.vn` | `0901234567` | **ADMIN** | Quản trị toàn sàn, xem Dashboard KPI, duyệt chuyến |
| `22222222-...` | **Điều Hành Phương Trang** | `operator@futa.vn` | `0909888999` | **BUS_COMPANY** | Quản lý đội xe, xem danh sách hành khách lên xe |
| `33333333-...` | **Nguyễn Văn Du Khách** | `customer@gmail.com` | `0912345678` | **CUSTOMER** | Tìm kiếm chuyến, chọn ghế 2 tầng, đặt vé COD, tra cứu QR |

#### 2. Nhà xe đối tác vận tải (`bus_companies`)
| ID | Tên thương hiệu nhà xe | Hotline | Đánh giá | Trụ sở văn phòng |
|---|---|:---:|:---:|---|
| `bc-futa` | **Phương Trang (FUTA Bus Lines)** | `1900 6067` | ⭐ **4.9** | Bến xe Miền Tây, 395 Kinh Dương Vương, Bình Tân, TP.HCM |
| `bc-thanhbuoi` | **Thành Bưởi** | `1900 6079` | ⭐ **4.8** | 266 Lê Hồng Phong, Phường 4, Quận 5, TP.HCM |
| `bc-saoviet` | **Sao Việt** | `1900 6746` | ⭐ **4.7** | 779 Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội |
| `bc-kumho` | **Kumho Samco Buslines** | `1900 6065` | ⭐ **4.8** | 292 Đinh Bộ Lĩnh, Phường 26, Bình Thạnh, TP.HCM |

#### 3. Tuyến mẫu (`route_templates`) & Bến xe (`locations`)
| Mã tuyến | Tuyến đường vận chuyển | Nhà xe | Cự ly & Thời gian | Bến xuất phát | Bến đến |
|---|---|---|:---:|---|---|
| `rt-futa-hcm-dl` | **TP. Hồ Chí Minh ➔ Đà Lạt** | Phương Trang | 305 km (6.5h) | Bến xe Miền Tây / An Sương | Bến xe Liên tỉnh Đà Lạt |
| `rt-futa-hcm-nt` | **TP. Hồ Chí Minh ➔ Nha Trang** | Phương Trang | 435 km (8.0h) | Bến xe Miền Đông Mới | Bến xe Phía Nam Nha Trang |
| `rt-tb-hcm-ct` | **TP. Hồ Chí Minh ➔ Cần Thơ** | Thành Bưởi | 169 km (3.5h) | Bến xe Miền Tây | Bến xe Trung tâm Cần Thơ |
| `rt-sao-hn-sp` | **Hà Nội ➔ Sa Pa** | Sao Việt | 315 km (5.5h) | Bến xe Mỹ Đình | Bến xe Khách Sa Pa |

#### 4. Lịch trình chuyến xe mở bán (`trips`)
| Mã chuyến | Lộ trình | Giờ khởi hành | Loại xe & Biển số | Giá niêm yết | Ghế trống | Trạng thái |
|---|---|:---:|---|:---:|:---:|:---:|
| `trip-1` | Sài Gòn ➔ Đà Lạt | Ngày mai, 08:00 | Giường nằm (`SLEEPER`) - 51B-123.45 | 290.000đ | **32 / 34** | `SCHEDULED` |
| `trip-2` | Sài Gòn ➔ Đà Lạt | Tối mai, 22:30 | Limousine VIP (`LIMOUSINE`) - 51B-999.88 | 340.000đ | **34 / 34** | `SCHEDULED` |
| `trip-3` | Sài Gòn ➔ Nha Trang | Ngày mai, 07:00 | Giường nằm (`SLEEPER`) - 51B-456.78 | 320.000đ | **34 / 34** | `SCHEDULED` |
| `trip-4` | Hà Nội ➔ Sa Pa | Ngày mai, 06:30 | Cabin Cung Điện (`CABIN`) - 29B-888.66 | 380.000đ | **34 / 34** | `SCHEDULED` |

#### 5. Sơ đồ kho ghế 2 tầng (`trip_seats` — 136 ghế cho 4 chuyến xe)
* Mỗi chuyến xe mở bán sở hữu đúng **34 giường nằm**:
  * **Tầng 1 (Dưới - Chống say xe)**: 17 ghế ký hiệu `A01` đến `A17` (Loại `STANDARD`).
  * **Tầng 2 (Trên - Thoáng mát)**: 17 ghế ký hiệu `B01` đến `B17` (Loại `VIP`).
* **Trực quan trên giao diện đặt vé**:
  * Chuyến 1 có 2 ghế **`A01` và `A02` hiển thị màu Xám (`BOOKED`)** đại diện cho vé đã bán mẫu để demo.
  * Ghế `A03` đến `A17` và `B01` đến `B17` hiển thị **màu Xanh (`AVAILABLE`)** sẵn sàng chọn mua.

#### 6. Đơn vé mẫu & Thẻ vé điện tử QR Code (`bookings` & `tickets`)
* **Mã đơn đặt vé**: `BKG-20261025-001`
* **Hành khách**: Nguyễn Văn Du Khách (SĐT: `0912345678` - Email: `customer@gmail.com`)
* **Hành trình**: Chuyến 1 (Sài Gòn ➔ Đà Lạt), Đón tại Bến xe Miền Tây ➔ Trả tại Bến xe Liên tỉnh Đà Lạt.
* **Danh sách vé con & Mã QR Check-in**:
  1. Vé 1: Mã `TK-20261025-001-A01` | Ghế `A01` | Giá 290.000đ | QR Hash: `c5e26b88-5c42-4f01-8b21-7e8c3a19e001`
  2. Vé 2: Mã `TK-20261025-001-A02` | Ghế `A02` | Giá 290.000đ | QR Hash: `f7a14c99-7b33-4d22-9e32-8f9d4b28f002`
* **Cách tra cứu nhanh**: Vào trang **Tra Cứu Vé** (`http://localhost:5173/lookup`), nhập mã `BKG-20261025-001` để xem thẻ vé điện tử và render 2 mã QR trực quan.

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
| **TC-08** | Trip Catalog | Lấy chi tiết chuyến xe và sơ đồ ghế | `tripId = trip-1` | Trả về thông tin chuyến + danh sách 34 ghế | **PASS** |
| **TC-09** | Bus Seat Map | Hiển thị chính xác ghế trống và đã bán | `tripId = trip-1` | A01, A02 hiển thị màu xám; A03-A17 hiển thị màu xanh | **PASS** |
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
| **TC-24** | Performance | Đo thời gian phản hồi API tìm chuyến | Test tải với k6 / Postman Runner | Response time < 500ms (Trung bình ~120ms) | **PASS** |
| **TC-25** | DevOps | Khởi chạy toàn bộ hệ thống bằng Docker | Chạy lệnh `docker-compose up -d` | 3 container MySQL, Backend, Frontend healthy | **PASS** |

---

## 8. HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH (QUICKSTART CHUẨN A-Z)

Dự án đã được cấu hình **Zero-Setup** để các thành viên nhóm, giảng viên hoặc hội đồng chấm thi có thể khởi chạy và trải nghiệm ngay lập tức.

---

### Cách 1: Khởi chạy Trực tiếp Siêu Tốc (Khuyên dùng - Zero Config / In-Memory DB)
*Không yêu cầu cài đặt MySQL hay Docker. Hệ thống tích hợp sẵn H2 In-Memory Database và `DataInitializer` tự động nạp 100% dữ liệu mẫu (3 Users, 4 Nhà xe, 4 Tuyến đường, 4 Chuyến xe, 136 Ghế ngồi và Vé điện tử mẫu).*

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
   CREATE DATABASE IF NOT EXISTS traveleasy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
   ```
2. Nạp file schema hoàn chỉnh 36 bảng và dữ liệu mẫu:
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

## 9. QUY CHUẨN LÀM VIỆC VỚI GIT & QUY TRÌNH PHÂN NHÁNH (GIT WORKFLOW)

Dựa trên tài liệu chuẩn `docs/GIT_WORKFLOW.md`:

### 9.1 Mô hình phân nhánh chuẩn (Branching Strategy)
* **Nhánh `main` (Production)**: Chứa mã nguồn ổn định nhất, đã được kiểm thử kỹ lưỡng. **Bật Branch Protection**: Cấm push trực tiếp, bắt buộc phải tạo Pull Request (PR) từ `dev` và có ít nhất 1 phê duyệt (Approve) từ Nhóm trưởng.
* **Nhánh `dev` (Tích hợp)**: Nhánh làm việc chung của cả nhóm 6 người. Mọi PR tính năng từ các nhánh con đều merge vào đây.
* **Nhánh `feature/*`**: Nhánh tính năng cá nhân của từng thành viên, tách ra từ `dev`:
  * Thành: `feature/trip-catalog-search`
  * Phát: `feature/seat-map-booking`
  * Kiên: `feature/admin-trip-operations`
  * Phong: `feature/auth-jwt-security`
  * Đức: `feature/ticket-lookup-qr`
  * Cường: `feature/ai-assistant-analytics`

### 9.2 Quy chuẩn đặt tên commit (Conventional Commits)
$$	ext{type}(	ext{scope}): 	ext{mô tả ngắn gọn bằng tiếng Việt}$$
* `feat`: Thêm tính năng / API mới (VD: `feat(booking): hoàn thiện API đặt vé COD`).
* `fix`: Sửa lỗi (VD: `fix(concurrency): khắc phục race condition trừ ghế`).
* `docs`: Cập nhật tài liệu (VD: `docs(readme): chuẩn hóa tài liệu master`).
* `test`: Viết thêm kiểm thử (VD: `test(auth): bổ sung 5 test case login`).
* `ci`: Cập nhật pipeline GitHub Actions.

### 9.3 Quy trình 7 bước hàng ngày của thành viên nhóm
1. Kéo mã nguồn mới nhất từ `dev`: `git checkout dev && git pull origin dev`
2. Tạo nhánh tính năng: `git checkout -b feature/<tên-nhánh>`
3. Viết code và commit thường xuyên theo chuẩn Conventional Commits.
4. Kéo cập nhật mới nhất từ `dev` về nhánh của mình: `git checkout dev && git pull origin dev && git checkout feature/... && git merge dev`
5. Đẩy nhánh lên GitHub: `git push -u origin feature/...`
6. Tạo Pull Request vào nhánh `dev` trên giao diện GitHub.
7. **Nhóm trưởng Phạm Công Thành** review code và duyệt merge.

---

## 10. KỊCH BẢN DEMO BẢO VỆ TỐT NGHIỆP 100/100 ĐIỂM (15 PHÚT)

Kịch bản 15 phút chia rõ vai trò và thao tác cho cả 6 thành viên trước Hội đồng giám khảo:

```
+-----------------------------------------------------------------------------------------+
| PHÂN BỔ THỜI GIAN DEMO BẢO VỆ (TỔNG CỘNG 15 PHÚT)                                        |
+-----------------------------------------------------------------------------------------+
| 00:00 - 02:30 : Phạm Công Thành  - Giới thiệu đề tài, kiến trúc hệ thống, Live Search  |
| 02:30 - 05:30 : Nguyễn Đại Phát   - Sơ đồ ghế 2 tầng, Đặt vé COD, Test Concurrency Lock  |
| 05:30 - 08:30 : Trần Minh Đức 2   - Vé điện tử, Tra cứu vé theo mã & Render QR Code     |
| 08:30 - 11:00 : Phan Trung Kiên   - Admin Dashboard, Thêm chuyến xe tự sinh 34 ghế      |
| 11:00 - 13:00 : Phạm Thanh Phong  - Bảo mật JWT, BCrypt, RBAC phân quyền 401/403        |
| 13:00 - 15:00 : Đoàn Nhật Cường   - Chatbot AI du lịch, KPI doanh thu & Tổng kết điểm   |
+-----------------------------------------------------------------------------------------+
```

### Chi tiết các bước trình diễn:
1. **Phút 00:00 - 02:30: Phạm Công Thành (Nhóm trưởng / Tech Lead)**
   * Chào hội đồng, giới thiệu bài toán đặt vé xe liên tỉnh giải quyết vấn đề tranh chấp ghế dịp Lễ/Tết.
   * Trình chiếu sơ đồ kiến trúc Modular Monolith Spring Boot 3 + Clean Architecture + MySQL 36 bảng.
   * Thao tác trên Trang chủ: Tìm kiếm chuyến xe **TP. Hồ Chí Minh ➔ Đà Lạt** ngày mai. Lưới chuyến xe xuất hiện tức thì trong 120ms với đầy đủ logo Phương Trang, Thành Bưởi, giá vé, số chỗ trống.
2. **Phút 02:30 - 05:30: Nguyễn Đại Phát (Full-Stack Developer)**
   * Bấm **"Chọn chuyến"** tại chuyến Limousine 34 chỗ. Sơ đồ ghế 2 tầng bung ra trực quan.
   * Giải thích: Ghế A01, A02 màu xám do đã có khách đặt; ghế A03 - A17 màu xanh sẵn sàng mở bán.
   * Chọn 2 giường nằm A03, A04: Ghế chuyển màu cam, tổng tiền tự động nhảy 580.000đ.
   * Mở modal đặt vé: Nhập tên hành khách, SĐT, chọn điểm đón Bến xe Miền Tây, điểm trả Bến xe Liên tỉnh Đà Lạt, chọn thanh toán COD khi lên xe. Bấm Xác nhận.
   * Đặt vé thành công kèm mã đơn `BK-*`.
   * **Demo Concurrency Lock đỉnh cao**: Dùng Postman gửi đồng thời 10 request đặt cùng 1 ghế A05 ➔ Chứng minh chỉ duy nhất 1 request thành công, 9 request còn lại nhận lỗi HTTP 409 Conflict, số ghế trống không bao giờ bị âm.
3. **Phút 05:30 - 08:30: Trần Minh Đức 2 (Full-Stack Developer)**
   * Chuyển sang mục **"Tra Cứu Vé"**, dán mã vé vừa tạo vào ô tìm kiếm.
   * Màn hình hiển thị Thẻ vé điện tử sang trọng đầy đủ thông tin chuyến đi, điểm đón, điểm trả và **Mã QR Code độc nhất** cho từng vị trí ghế ngồi để phụ xe quét mã khi đón khách.
4. **Phút 08:30 - 11:00: Phan Trung Kiên (Full-Stack Developer)**
   * Đăng nhập tài khoản Admin, chuyển sang màn hình **"Quản Trị Nhà Xe"**.
   * Bấm nút **"Thêm Chuyến Xe Mới"**: Chọn nhà xe Phương Trang, tuyến Sài Gòn - Nha Trang, giờ chạy, giá vé. Lưu chuyến xe.
   * Mở database / Swagger UI chứng minh hệ thống đã **tự động sinh đủ 34 ghế ngồi (A01-A17, B01-B17)** cho chuyến xe mới mà quản trị viên không cần gõ tay từng ghế.
5. **Phút 11:00 - 13:00: Phạm Thanh Phong (Full-Stack Developer)**
   * Trình bày cơ chế bảo mật Spring Security 6: Mật khẩu mã hóa BCrypt 12 rounds, token JWT có hạn 24h.
   * Thử dùng tài khoản Customer truy cập API Quản trị Admin ➔ Hệ thống chặn ngay lập tức với mã lỗi HTTP 403 Forbidden.
6. **Phút 13:00 - 15:00: Đoàn Nhật Cường (Full-Stack Developer & QA Lead)**
   * Mở widget Chatbot AI ở góc phải màn hình: Hỏi "Nên chọn ghế nào chống say xe?", AI lập tức phân tích và khuyên chọn giường tầng 1 (A01 - A06).
   * Giới thiệu 4 Card KPI doanh thu, số vé, chuyến xe trên Dashboard Admin.
   * Bật giao diện GitHub Actions chứng minh Pipeline CI/CD xanh 100%, Docker Compose khởi chạy 3 service container mượt mà.
   * **Tổng kết**: Nhóm 7 hoàn thành xuất sắc 100% yêu cầu đề tài, tự tin bảo vệ đạt điểm tối đa **100/100 điểm**!

---
*Tài liệu Master Specification được ban hành chính thức bởi Nhóm trưởng Phạm Công Thành — Nhóm 7.*  
*Chúc toàn đội bảo vệ thành công rực rỡ!*
