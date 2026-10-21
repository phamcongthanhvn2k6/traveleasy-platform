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
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg?logo=supabase)](https://supabase.com/dashboard/project/ctvcwhdepzyvqsncbslf/database/schemas)
[![Trello](https://img.shields.io/badge/Trello-Board-0052CC.svg?logo=trello)](https://trello.com/b/AA5BYoe1/traveleasyplatform)
[![Stitch](https://img.shields.io/badge/Stitch-UI%20Design-EA4335.svg)](https://stitch.withgoogle.com/projects/5774129554395496210?pli=1)

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

### 🔗 HỆ THỐNG TÀI NGUYÊN TRỰC TUYẾN DỰ ÁN (PROJECT LIVE RESOURCES)
* 📋 **Bảng Quản Trị Tiến Độ & Sprint Backlog (Trello)**: [TravelEasy_Platform | Trello Board](https://trello.com/b/AA5BYoe1/traveleasyplatform)
* 🎨 **Hệ Thống Thiết Kế Giao Diện UI/UX (Google Stitch)**: [TravelEasy UI Prototype | Stitch Project](https://stitch.withgoogle.com/projects/5774129554395496210?pli=1)
* 🗄️ **Cơ Sở Dữ Liệu Đám Mây & Schema Visualizer (Supabase PostgreSQL)**: [Schema Visualizer & Database | Supabase Console](https://supabase.com/dashboard/project/ctvcwhdepzyvqsncbslf/database/schemas)

---

## 🎯 MỤC LỤC TỔNG HỢP

1. [TỔNG QUAN DỰ ÁN & TIÊU CHÍ ĐÁNH GIÁ 100 ĐIỂM](#1-tổng-quan-dự-án--tiêu-chí-đánh-giá-100-điểm)
   - 1.1 Bối cảnh bài toán vận tải hành khách liên tỉnh
   - 1.2 Giải pháp nền tảng TravelEasy Platform
   - 1.3 Bảng phân bổ điểm số tốt nghiệp (Rubric 100/100 điểm)
2. [CƠ CẤU NHÂN SỰ, PHÂN CHIA PHÂN HỆ & KIẾN TRÚC ĐIỀU HƯỚNG THEO NĂNG LỰC](#2-cơ-cấu-nhân-sự-phân-chia-phân-hệ--kiến-trúc-điều-hướng-theo-năng-lực)
   - 2.1 Kiến trúc Phân định 2 Phân hệ Lớn (Two-Portal Architecture)
   - 2.2 Đánh giá Thiết kế: "Quản lý các đường dẫn bằng 1 Router Controller có phù hợp không?"
   - 2.3 Ma Trận 17 Trang Giao Diện & Điều Hướng Chi Tiết (Page & Component Sitemap V3)
   - 2.4 Bảng Phân Công Nhiệm Vụ 6 Thành Viên (RACI V3)
   - 2.5 Ma trận Trách nhiệm RACI Cập Nhật V3
   - 2.6 Kế Hoạch Sprint Backlog & 17 User Stories Chuẩn Agile Scrum (Trello Board)
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
   - Cách 2: Khởi chạy kết nối Supabase Cloud Database (PostgreSQL - Đồng bộ cả nhóm)
   - Cách 3: Khởi chạy 1 lệnh với Docker Compose (Full Containers)
   - Cách 4: Khởi chạy thủ công với MySQL vật lý
   - 8.5 Quy chuẩn & Lưu ý sống còn cho thành viên khi code Backend & Kết nối Database
   - Danh sách tài khoản thử nghiệm có sẵn
9. [QUY CHUẨN LÀM VIỆC VỚI GIT & QUY TRÌNH PHÂN NHÁNH (GIT WORKFLOW)](#9-quy-chuẩn-làm-việc-với-git--quy-trình-phân-nhánh-git-workflow)
   - 9.1 Mô hình phân nhánh chuẩn (Branching Strategy)
   - 9.2 Quy chuẩn đặt tên commit (Conventional Commits)
   - 9.3 Quy trình 7 bước hàng ngày của thành viên nhóm
   - 9.4 Cấu hình Branch Protection Rules trên GitHub
10. [KỊCH BẢN DEMO BẢO VỆ TỐT NGHIỆP 100/100 ĐIỂM (15 PHÚT)](#10-kịch-bản-demo-bảo-vệ-tốt-nghiệp-100100-điểm-15-phút)
11. [BÁO CÁO NGHIỆM THU BACKEND API (30/30 PASS) & HỆ THỐNG MINH CHỨNG GIAO DIỆN (UI EVIDENCE GALLERY)](#11-báo-cáo-nghiệm-thu-backend-api-3030-pass--hệ-thống-minh-chứng-giao-diện-ui-evidence-gallery)
    - 11.1 Ma trận nghiệm thu 30 API Backend cốt lõi (100% Pass)
    - 11.2 Minh chứng Giao diện Người dùng (User / Customer Journey)
    - 11.3 Minh chứng Giao diện Quản trị Hệ thống (Admin Portal Journey)
    - 11.4 Minh chứng Giao diện & Kiểm soát Đối tác Nhà xe (Company Portal & Security Guard)

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

## 2. CƠ CẤU NHÂN SỰ, PHÂN CHIA PHÂN HỆ & KIẾN TRÚC ĐIỀU HƯỚNG THEO NĂNG LỰC

### 2.1 Kiến trúc Phân định 2 Phân hệ Lớn (Two-Portal Architecture)
Để tối ưu hóa năng suất, đáp ứng đúng năng lực làm **Full-Stack** của từng cá nhân và đảm bảo tiến độ Sprint 7 ngày, dự án phân định ranh giới tuyệt đối thành 2 phân hệ độc lập:
1. **Phân hệ 1: ADMIN PORTAL (Quản trị Hệ thống & Điều hành Nhà xe)**:
   - **Độc quyền đảm nhận**: **Phạm Công Thành** (Nhóm trưởng / System Architect & Tech Lead).
   - **Phạm vi nghiệp vụ**: Toàn bộ nghiệp vụ quản trị nhà xe đối tác, quản lý phương tiện/xe, sơ đồ ghế mẫu, quản lý tuyến đường & điểm dừng, quản lý chuyến xe & tự động sinh kho 34 ghế, thiết lập chính sách giá vé động và quy tắc hủy vé/hoàn tiền, quản lý người dùng & phân quyền RBAC, bảng điều khiển thống kê KPI (doanh thu, đơn hàng, tỷ lệ lấp đầy) và nhật ký kiểm toán hệ thống (`audit_logs`).
2. **Phân hệ 2: USERS / CLIENT PORTAL (Hành khách & Đặt vé Trực tuyến)**:
   - **Đảm nhận**: **5 Thành viên còn lại** trong nhóm (mỗi bạn phụ trách đúng 2 trang chức năng End-to-End từ CSDL ➔ Backend API ➔ Frontend UI ➔ Unit Test).
   - **Phân hóa theo năng lực thực tế**:
     - **3 Thành viên cứng (Phan Trung Kiên, Nguyễn Đại Phát, Phạm Thanh Phong)**: Gánh vác các module kỹ thuật nặng, thuật toán giữ chỗ Concurrency Pessimistic Lock, tích hợp cổng thanh toán trực tuyến `@Transactional` và tìm kiếm lọc dữ liệu động.
     - **2 Thành viên yếu hơn (Trần Minh Đức 2, Đoàn Nhật Cường)**: Giao các module hiển thị trực quan, CRUD cơ bản, không có thuật toán hay concurrency phức tạp (Hiển thị thẻ vé QR, Hướng dẫn đi xe/FAQ, Tra cứu vé đơn giản, Form đánh giá review 1-5 sao).

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                    TRAVELEASY PLATFORM — ARCHITECTURAL SITEMAP (17 TRANG)                               |
+-------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                         |
|  [PHÂN HỆ 1: ADMIN PORTAL] (7 Trang)                       [PHÂN HỆ 2: USERS / CLIENT PORTAL] (10 Trang)                 |
|  Phụ trách: PHẠM CÔNG THÀNH (Lead / Architect)             Phụ trách: 5 THÀNH VIÊN (Phân hóa theo năng lực)              |
|                                                                                                                         |
|  A0. Trang Chủ Quản Trị (/admin - Dashboard Hub)           === NHÓM CỨNG (TASK KHÓ & LOGIC PHỨC TẠP) ===                 |
|  A1. Quản Trị Chuyến Xe (/admin/trips)                     1. Phát: Trang Chủ Gộp Tìm Kiếm & Lọc (/) + Chi Tiết (/trips/:id)
|  A2. Quản Lý Đội Xe & Nhà Xe (/admin/fleet)                2. Kiên: Sơ Đồ Ghế 2 Tầng (/seats) + Khóa Chỗ 10:00 (/seat-lock)|
|  A3. Tuyến Đường & Điểm Dừng (/admin/routes)               3. Phong: Đặt Vé (/checkout) + Cổng Thanh Toán (/payment)    |
|  A4. Chính Sách & Giá Vé (/admin/policies)                                                                              |
|  A5. Người Dùng & Phân Quyền (/admin/users)                === NHÓM YẾU (TASK DỄ, TRỰC QUAN & CRUD CƠ BẢN) ===           |
|  A6. Nhật Ký & Kiểm Duyệt Review (/admin/audit-logs)       4. Đức: Thẻ Vé QR (/tickets) + Hướng Dẫn & FAQ (/guide)      |
|                                                            5. Cường: Tra Cứu Vé (/lookup) + Đánh Giá Sao (/reviews)     |
+-------------------------------------------------------------------------------------------------------------------------+
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

### 2.3 Ma Trận 17 Trang Giao Diện & Điều Hướng Chi Tiết (Page & Component Sitemap V3)

#### 👑 A. PHÂN HỆ QUẢN TRỊ (ADMIN PORTAL) — PHẠM CÔNG THÀNH ĐỘC QUYỀN (7 TRANG)
* **Thanh điều hướng**: `frontend/src/components/AdminNav.tsx` (Tabs chuyển trang nhanh).
* **Router quản lý**: `frontend/src/routes/adminRoutes.tsx`.

| STT | Tên Trang Giao Diện | Đường Dẫn (URL) | File Component | Use Case (`docs/`) | Độ Khó | Chức Năng Chính Trên Trang |
|:---:|:---|:---|:---|:---|:---:|:---|
| **A0** | **Trang Chủ Quản Trị (Admin Home & Hub)** | `/admin`<br/>`/admin/dashboard` | `AdminDashboardPage.tsx` | UC-3.5 & Overview | ⭐⭐⭐⭐⭐ (Khó) | Dashboard thống kê 4 KPIs (Tổng chuyến, Chuyến mở bán, Đơn đặt vé, Doanh thu), Bảng danh mục điều phối 6 phân hệ quản trị, Form popup tạo chuyến xe tự động sinh 34 ghế. |
| **A1** | **Quản Trị Lịch Trình & Chuyến Xe** | `/admin/trips` | `AdminTripsPage.tsx` | UC-3.5, UC-2.5, UC-2.11 | ⭐⭐⭐⭐ (Khá) | Bảng theo dõi các chuyến xe, tỷ lệ lấp đầy ghế (vd: 30/34 chỗ), các nút thao tác chuyển trạng thái (`Xuất bến`, `Hoàn thành`, `Hủy`), cập nhật số phút trễ chuyến thủ công. |
| **A2** | **Quản Lý Nhà Xe & Phương Tiện (Fleet)** | `/admin/fleet` | `AdminFleetPage.tsx` | UC-3.2, UC-2.1, UC-2.2 | ⭐⭐⭐ (Vừa) | Danh sách đối tác nhà xe (Phương Trang, Thành Bưởi...) kèm hotline/trụ sở, quản lý biển số xe (51B-123.45...), loại xe Limousine 34 phòng, số tầng và tình trạng bảo dưỡng. |
| **A3** | **Quản Lý Tuyến Đường & Điểm Dừng** | `/admin/routes` | `AdminRoutesPage.tsx` | UC-3.3, UC-3.6, UC-2.3 | ⭐⭐⭐ (Vừa) | Danh mục tuyến xe liên tỉnh (Sài Gòn ➔ Đà Lạt...), cự ly km, thời gian chạy dự kiến, danh sách trạm dừng chân và mốc giờ đón dự kiến (ETA Offset). |
| **A4** | **Chính Sách Giá Vé & Hủy Hoàn Tiền** | `/admin/policies` | `AdminPoliciesPage.tsx` | UC-2.9 & Invariants | ⭐⭐⭐⭐ (Khá) | Quy tắc hoàn tiền theo mốc giờ (>24h hoàn 90%, 12-24h hoàn 70%, <12h không hoàn) khớp bảng `cancellation_policy_rules`, cấu hình phụ thu giường VIP tầng 1 và phụ thu cuối tuần/lễ tết. |
| **A5** | **Quản Trị Người Dùng & Phân Quyền (RBAC)** | `/admin/users` | `AdminUsersPage.tsx` | UC-3.1 & Security RBAC | ⭐⭐⭐ (Vừa) | Danh sách tài khoản người dùng, phân quyền 4 vai trò tĩnh (`ADMIN`, `OPERATOR`, `DRIVER`, `CUSTOMER`), khóa/mở tài khoản. |
| **A6** | **Nhật Ký Kiểm Toán & Kiểm Duyệt Review** | `/admin/audit-logs` | `AdminAuditLogsPage.tsx` | UC-3.11, UC-3.9 | ⭐⭐⭐ (Vừa) | Xem lịch sử thao tác hệ thống bất biến (`audit_logs`), kiểm duyệt đánh giá 1-5 sao từ khách hàng trước khi cho phép hiển thị ra trang chủ. |

---

#### 🚍 B. PHÂN HỆ KHÁCH HÀNG (USERS PORTAL) — PHÂN CHIA THEO NĂNG LỰC (10 TRANG)
* **Header / Footer chung**: `frontend/src/components/Navbar.tsx` & `Footer.tsx`.
* **Router quản lý**: `frontend/src/routes/clientRoutes.tsx`.

| STT | Tên Trang Giao Diện | Đường Dẫn (URL) | File Component | Người Phụ Trách | Độ Khó | Chức Năng Chính Trên Trang |
|:---:|:---|:---|:---|:---:|:---:|:---|
| **U1** | **Trang Chủ Gộp Tìm Kiếm & Lọc Nâng Cao** | `/` | `HomePage.tsx` | **Nguyễn Đại Phát** | ⭐⭐⭐⭐ (Khá) | **Gộp trọn gói**: Hero tìm kiếm (Nơi đi, Nơi đến, Ngày đi) + **Sidebar bộ lọc thông minh** (slider giá, giờ sáng/tối, nhà xe) + Lưới danh sách chuyến xe realtime. |
| **U2** | **Chi Tiết Chuyến Xe & Lộ Trình Điểm Đón** | `/trips/:tripId` | `TripDetailPage.tsx` | **Nguyễn Đại Phát** | ⭐⭐⭐ (Vừa) | Tiện ích xe (WiFi, cổng sạc, nước uống, rèm riêng tư), Lộ trình trạm dừng chân, điểm đón/trả và mốc giờ ETA dự kiến. |
| **U3** | **Sơ Đồ Chọn Ghế 2 Tầng VIP Limousine** | `/trips/:tripId/seats` | `SeatSelectionPage.tsx` | **Phan Trung Kiên** | ⭐⭐⭐⭐ (Khá) | Sơ đồ tương tác 34 phòng Limousine VIP: Tầng 1 (A01-A17) & Tầng 2 (B01-B17), mã màu trực quan (Trống, Đang chọn, Đã bán), tính tiền realtime. |
| **U4** | **Khóa Giữ Chỗ & Đồng Hồ Đếm Lùi 10:00** | `/booking/seat-lock/:tripId` | `SeatLockStatusPage.tsx` | **Phan Trung Kiên** | ⭐⭐⭐⭐⭐ (Rất Khó) | **Pessimistic Write Lock**: Khóa ghế độc quyền, đếm ngược 10 phút (TTL), cảnh báo đỏ < 2 phút, tự động nhả ghế chống Overbooking. |
| **U5** | **Điểm Đón / Trả & Xác Nhận Đặt Vé** | `/checkout` | `BookingCheckoutPage.tsx` | **Phạm Thanh Phong** | ⭐⭐⭐ (Vừa) | Chọn điểm đón kèm giờ ETA, điểm trả, form nhập thông tin hành khách (validate SĐT 10 số, email), ô nhập mã Voucher ưu đãi. |
| **U6** | **Cổng Thanh Toán Đa Kênh Trực Tuyến** | `/payment/:bookingCode` | `PaymentPortalPage.tsx` | **Phạm Thanh Phong** | ⭐⭐⭐⭐⭐ (Rất Khó) | **Giao dịch `@Transactional(SERIALIZABLE)`**: Hỗ trợ tiền mặt COD, Cổng VNPay (quét mã QR ngân hàng động), Ví MoMo, xác nhận giao dịch an toàn. |
| **U7** | **Thẻ Vé Điện Tử & Mã QR Soát Vé** | `/tickets/:ticketCode` | `PaymentSuccessPage.tsx` | **Trần Minh Đức 2** | ⭐⭐ (Dễ) | **Không có logic phức tạp**: Hiển thị thẻ vé (Boarding Pass) sang trọng, render mã QR Code có sẵn quét được để tài xế soát vé, nút in/lưu vé PDF. |
| **U8** | **Hướng Dẫn Đi Xe & Câu Hỏi Thường Gặp (FAQ)**| `/guide` | `GuideFaqPage.tsx` | **Trần Minh Đức 2** | ⭐⭐ (Dễ) | Hướng dẫn thủ tục đi xe, quy định hành lý (tối đa 20kg), chính sách trẻ em và thú cưng, accordion danh mục câu hỏi thường gặp FAQ. |
| **U9** | **Tra Cứu Vé Bằng SĐT / Mã Vé** | `/lookup` | `TicketLookupPage.tsx` | **Đoàn Nhật Cường** | ⭐⭐ (Dễ) | Ô nhập Số điện thoại hoặc Mã đơn vé (`BK-*`), gọi API hiển thị bảng danh sách vé đơn giản và trạng thái chuyến xe. |
| **U10**| **Đánh Giá Chuyến Đi & Góp Ý Nhà Xe ⭐** | `/reviews` | `ReviewSubmitPage.tsx` | **Đoàn Nhật Cường** | ⭐⭐ (Dễ) | Form đánh giá đơn giản: Chọn số sao ⭐ (1 đến 5 sao) và viết nhận xét dịch vụ, gửi lưu vào bảng `reviews` của CSDL. |

---

### 2.4 Bảng Phân Công Nhiệm Vụ 6 Thành Viên (RACI V3)

| STT | Thành viên & Email | Phân hệ & Vai trò | Tính năng & Trang phụ trách | Công việc Backend (Spring Boot 3) | Công việc Frontend (React 18) |
|:---:|:---|:---|:---|:---|:---|
| **1** | **Phạm Công Thành**<br/>`Phamcongt56@gmail.com`<br/>*(Lead / Architect)* | **ADMIN PORTAL TOÀN QUYỀN** | **7 Trang Admin (A0 ➔ A6)** | • CSDL 36 bảng `init.sql`<br/>• Bảo mật JWT & Spring Security RBAC<br/>• Quản lý Chuyến xe & Tự sinh 34 ghế<br/>• Quản lý Nhà xe, Xe, Tuyến, Trạm<br/>• Chính sách giá vé & Hoàn tiền<br/>• API Thống kê Dashboard KPI | • Router `adminRoutes.tsx`<br/>• Thanh điều hướng `AdminNav.tsx`<br/>• Dashboard điều hành tổng quát<br/>• Giao diện điều phối chuyến xe, đội xe, tuyến đường, chính sách, người dùng, audit logs |
| **2** | **Nguyễn Đại Phát**<br/>`nguyendaiphat06@gmail.com`<br/>*(Nhóm Cứng)* | **USERS SLICE 1: Tìm kiếm, Bộ lọc & Chi tiết lộ trình** | **Trang U1 & U2** (`/` & `/trips/:id`) | • `TripSearchController` & `TripService`<br/>• API tìm kiếm đa tiêu chí kết hợp bộ lọc (giá, giờ, xe)<br/>• API chi tiết chuyến xe và điểm dừng | • **Trang Chủ gộp thanh tìm kiếm + bộ lọc thông minh + danh sách chuyến xe**<br/>• Trang Chi tiết chuyến xe & lộ trình trạm dừng ETA |
| **3** | **Phan Trung Kiên**<br/>`phantrungkien2006@gmail.com`<br/>*(Nhóm Cứng)* | **USERS SLICE 2: Sơ đồ ghế & Khóa giữ chỗ Concurrency** | **Trang U3 & U4** (`/seats` & `/seat-lock`) | • `SeatLockController` & `SeatLockService`<br/>• **Pessimistic Lock `@Lock(PESSIMISTIC_WRITE)`**<br/>• Cơ chế đếm lùi giữ chỗ 10:00 (TTL) tự động nhả ghế | • Sơ đồ 34 phòng Limousine VIP 2 tầng<br/>• Màn hình đếm ngược giữ chỗ 10:00 cảnh báo đổi màu đỏ khi sắp hết giờ |
| **4** | **Phạm Thanh Phong**<br/>`thanhphong102006@gmail.com`<br/>*(Nhóm Cứng)* | **USERS SLICE 3: Đặt vé & Cổng thanh toán đa kênh** | **Trang U5 & U6** (`/checkout` & `/payment`) | • `BookingProcessController` & `PaymentController`<br/>• **Giao dịch an toàn `@Transactional(SERIALIZABLE)`**<br/>• Tích hợp thanh toán COD, VNPay QR, MoMo | • Form chọn điểm đón/trả kèm giờ ETA, nhập thông tin hành khách, áp dụng voucher<br/>• Màn hình Cổng thanh toán đa kênh trực tuyến |
| **5** | **Trần Minh Đức 2**<br/>`2601minhduc@gmail.com`<br/>*(Nhóm Yếu - Dễ)* | **USERS SLICE 4: Hiển thị Thẻ vé QR & Hướng dẫn/FAQ** | **Trang U7 & U8** (`/tickets` & `/guide`) | • API trả về thông tin thẻ vé điện tử theo mã vé<br/>• Danh mục câu hỏi thường gặp FAQ tĩnh | • **Hiển thị Thẻ vé điện tử sang trọng có sẵn mã QR Code lên xe**, nút in vé<br/>• Trang Cẩm nang đi xe, quy định hành lý & FAQ |
| **6** | **Đoàn Nhật Cường**<br/>`Cuongclasspurpose@gmail.com`<br/>*(Nhóm Yếu - Dễ)* | **USERS SLICE 5: Tra cứu vé đơn giản & Đánh giá Review** | **Trang U9 & U10** (`/lookup` & `/reviews`) | • API Tra cứu vé đơn giản bằng SĐT/Mã đơn<br/>• API Gửi đánh giá lưu vào bảng `reviews` | • Trang Tra cứu vé bằng 1 ô SĐT/mã vé hiển thị bảng đơn giản<br/>• Form Đánh giá chất lượng 1-5 sao ⭐ và viết nhận xét |

---

### 2.5 Ma trận Trách nhiệm RACI Cập Nhật V3
* **R** (Responsible): Trực tiếp thực hiện Full-Stack (BE + FE + Test)
* **A** (Accountable): Nhóm trưởng phê duyệt & chịu trách nhiệm chất lượng chung (**Phạm Công Thành**)
* **C** (Consulted): Tham vấn chuyên môn kỹ thuật
* **I** (Informed): Nhận thông báo tiến độ

| Phân hệ & Tính năng Full-Stack | Thành (Lead) | Phát (Cứng) | Kiên (Cứng) | Phong (Cứng) | Đức (Yếu) | Cường (Yếu) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **ADMIN PORTAL (7 Trang Dashboard, Chuyến, Xe, Tuyến, Giá, User, Logs)** | **R / A** | I | I | I | I | I |
| **USERS 1: Trang Chủ Gộp Tìm Kiếm, Bộ Lọc & Chi Tiết Lộ Trình (U1, U2)** | **A** | **R** | C | I | I | I |
| **USERS 2: Sơ Đồ Ghế 2 Tầng & Khóa Giữ Chỗ Concurrency 10:00 (U3, U4)** | **A** | C | **R** | C | I | I |
| **USERS 3: Điểm Đón/Trả, Form Đặt Vé & Cổng Thanh Toán Đa Kênh (U5, U6)** | **A** | I | C | **R** | I | I |
| **USERS 4: Thẻ Vé Điện Tử QR & Cẩm Nang Đi Xe / FAQ (U7, U8)** | **A** | I | I | I | **R** | I |
| **USERS 5: Tra Cứu Vé Đơn Giản & Đánh Giá Chất Lượng ⭐ (U9, U10)** | **A** | I | I | I | I | **R** |
| **Kiến trúc Hệ thống, Security JWT, DDL CSDL & Quản trị Git PR** | **R / A** | C | C | C | C | C |

---

### 2.6 Kế Hoạch Sprint Backlog & 17 User Stories Chuẩn Agile Scrum (Trello Board)

> 📋 **Bảng Trello Trực Tuyến**: [TravelEasy_Platform | Trello Board](https://trello.com/b/AA5BYoe1/traveleasyplatform)  
> 🎨 **Bản Thiết Kế Stitch Trực Tuyến**: [TravelEasy UI Prototype | Stitch Project](https://stitch.withgoogle.com/projects/5774129554395496210?pli=1)

#### 🎯 Quy ước Cấu trúc Thẻ Task trên Trello:
* **Tiêu đề (Title)**: `({Điểm}) US-{Mã}: Là một {Vai trò}, tôi muốn {Hành động} để {Mục đích}` (Khớp 100% chuẩn Scrum & tiện ích Scrum for Trello).
* **Story Points theo Fibonacci**:
  * `(2)` - Rất dễ / Cơ bản (1 - 3 giờ): Giao diện tĩnh, CRUD cơ bản, không logic phức tạp (Đức, Cường phụ trách).
  * `(3)` - Trung bình (Nửa ngày - 1 ngày): Form validation, gọi API RESTful chuẩn, hiển thị chi tiết (Đức, Cường, Phát).
  * `(5)` - Khá phức tạp (1 - 1.5 ngày): Dynamic filter đa tiêu chí, sơ đồ xe tương tác (Phát, Kiên, Phong).
  * `(8)` - Rất khó / Concurrency (1.5 - 2 ngày): Pessimistic Lock chống đặt trùng ghế, Giao dịch thanh toán an toàn `@Transactional(SERIALIZABLE)` (Kiên, Phong, Thành).
* **Mỗi Task bao gồm 2 Checklist cụ thể**: **⚙️ Backend Checklist** và **🎨 Frontend Checklist**.

---

#### 📊 Bảng Tổng Hợp Phân Bổ 17 User Stories (95 Story Points):

| Mã US | Phân hệ / Trang | Tiêu đề User Story | Story Points | Thành viên phụ trách | Mức độ kỹ thuật |
|:---:|:---|:---|:---:|:---:|:---|
| **US-01** | **A0. Admin Dashboard** | Là một Quản trị viên, tôi muốn xem Dashboard 4 chỉ số KPI và bảng điều phối để nắm bắt tức thời tình hình vận hành của hệ thống | **(8)** | **Phạm Công Thành** | Khó / Thống kê tổng hợp & Điều phối |
| **US-02** | **A1. Lịch trình & Chuyến** | Là một Quản trị viên, tôi muốn tạo chuyến xe mới tự động sinh 34 ghế và đổi trạng thái chuyến để vận hành lịch trình xe chạy | **(8)** | **Phạm Công Thành** | Khó / Thuật toán sinh ghế & State Machine |
| **US-03** | **A2. Đội xe & Nhà xe** | Là một Quản trị viên, tôi muốn quản lý danh mục nhà xe đối tác và phương tiện để kiểm soát đội xe trên hệ thống | **(5)** | **Phạm Công Thành** | Vừa / CRUD Danh mục Đối tác & Xe |
| **US-04** | **A3. Tuyến & Trạm dừng** | Là một Quản trị viên, tôi muốn quản lý các tuyến đường và trạm đón/trả kèm mốc giờ ETA để tối ưu lộ trình xe di chuyển | **(5)** | **Phạm Công Thành** | Vừa / Quản lý lộ trình & ETA Offset |
| **US-05** | **A4. Chính sách & Giá vé** | Là một Quản trị viên, tôi muốn cấu hình bảng quy tắc hoàn tiền hủy vé và phụ thu tầng ghế để tự động hóa chính sách tài chính | **(5)** | **Phạm Công Thành** | Khá / Cancellation Rules & Surcharges |
| **US-06** | **A5. Người dùng & RBAC** | Là một Quản trị viên, tôi muốn quản lý danh sách người dùng và phân quyền RBAC an toàn bằng JWT để kiểm soát quyền truy cập hệ thống | **(5)** | **Phạm Công Thành** | Khá / Spring Security JWT & RBAC |
| **US-07** | **A6. Audit Logs & Review** | Là một Quản trị viên, tôi muốn theo dõi nhật ký audit log và kiểm duyệt đánh giá của khách hàng để đảm bảo chất lượng dịch vụ và tính an toàn bảo mật | **(5)** | **Phạm Công Thành** | Vừa / Audit Trail & Kiểm duyệt |
| **US-08** | **U1. Tìm kiếm & Bộ lọc** | Là một Khách hàng, tôi muốn tìm kiếm chuyến xe kết hợp bộ lọc nâng cao thời gian thực để nhanh chóng chọn được chuyến xe phù hợp với nhu cầu | **(8)** | **Nguyễn Đại Phát** | Khó / Dynamic JPA Specification |
| **US-09** | **U2. Chi tiết chuyến xe** | Là một Khách hàng, tôi muốn xem chi tiết thông tin xe, tiện ích và lộ trình trạm dừng ETA để an tâm về chất lượng chuyến đi | **(5)** | **Nguyễn Đại Phát** | Vừa / DTO Tiện ích & Lộ trình ETA |
| **US-10** | **U3. Sơ đồ ghế 2 tầng** | Là một Khách hàng, tôi muốn xem sơ đồ 2 tầng xe Limousine trực quan để tự do chọn vị trí giường nằm ưng ý nhất | **(8)** | **Phan Trung Kiên** | Khó / Interactive 34-seat Map |
| **US-11** | **U4. Khóa giữ chỗ 10:00** | Là một Khách hàng, tôi muốn hệ thống giữ chỗ độc quyền trong 10 phút có đồng hồ đếm ngược để hoàn tất thủ tục thanh toán mà không sợ bị người khác cướp vé | **(8)** | **Phan Trung Kiên** | Rất khó / Pessimistic Lock & Concurrency |
| **US-12** | **U5. Điểm đón/trả & Đặt vé** | Là một Khách hàng, tôi muốn chọn điểm đón/trả cụ thể và điền thông tin hành khách để nhà xe liên hệ đón đúng giờ | **(5)** | **Phạm Thanh Phong** | Vừa / Validation Regex & Voucher |
| **US-13** | **U6. Cổng thanh toán** | Là một Khách hàng, tôi muốn thanh toán đơn vé đa kênh an toàn (VNPay QR, MoMo, COD) để xác nhận đặt vé thành công tức thì | **(8)** | **Phạm Thanh Phong** | Rất khó / Transactional & Webhook |
| **US-14** | **U7. Vé điện tử QR** | Là một Khách hàng, tôi muốn nhận vé điện tử sắc nét kèm mã QR Code để dễ dàng xuất trình cho tài xế soát vé khi lên xe | **(5)** | **Trần Minh Đức 2** | Dễ / Render Boarding Pass & QR Code |
| **US-15** | **U8. Cẩm nang & FAQ** | Là một Khách hàng, tôi muốn đọc hướng dẫn quy định hành lý và các câu hỏi thường gặp (FAQ) để chuẩn bị tốt nhất trước khi khởi hành | **(3)** | **Trần Minh Đức 2** | Rất dễ / Accordion FAQ & Luggage Policy |
| **US-16** | **U9. Tra cứu vé 1 ô** | Là một Khách hàng, tôi muốn tra cứu thông tin vé nhanh bằng số điện thoại hoặc mã đơn để kiểm tra lại lịch trình bất kỳ lúc nào | **(3)** | **Đoàn Nhật Cường** | Rất dễ / Single Input Lookup & Result Table |
| **US-17** | **U10. Đánh giá 1-5 sao** | Là một Khách hàng, tôi muốn gửi đánh giá số sao (1-5 ⭐) và nhận xét dịch vụ sau chuyến đi để phản hồi trải nghiệm thực tế với nhà xe | **(3)** | **Đoàn Nhật Cường** | Rất dễ / Star Rating Widget & Feedback |

---

#### 👑 PHÂN HỆ QUẢN TRỊ (ADMIN PORTAL) — PHẠM CÔNG THÀNH (7 USER STORIES)

##### (8) US-01: Là một Quản trị viên, tôi muốn xem Dashboard 4 chỉ số KPI và bảng điều phối để nắm bắt tức thời tình hình vận hành của hệ thống
* **Mô tả (Description)**:
  * **Backend**: `GET /api/v1/admin/dashboard/stats` (Tính tổng chuyến xe, chuyến đang mở bán, tổng đơn đặt và doanh thu thực nhận).
  * **Frontend**: `AdminDashboardPage.tsx` (Dựng 4 thẻ KPI số liệu trực quan và lưới 6 Card điều phối chức năng).
* **Checklist**:
  * [ ] [BE] Viết Service truy vấn tổng hợp doanh thu và số lượng chuyến
  * [ ] [BE] Tạo DTO `DashboardStatsResponse`
  * [ ] [FE] Dựng 4 thẻ KPI Card hiển thị số liệu trực quan
  * [ ] [FE] Dựng lưới 6 Card chức năng có nút chuyển trang nhanh

##### (8) US-02: Là một Quản trị viên, tôi muốn tạo chuyến xe mới tự động sinh 34 ghế và đổi trạng thái chuyến để vận hành lịch trình xe chạy
* **Mô tả (Description)**:
  * **Backend**: `POST /api/v1/admin/trips` & `PATCH /api/v1/admin/trips/{id}/status`.
  * **Frontend**: `AdminTripsPage.tsx` (Bảng danh sách chuyến xe và Form modal tạo chuyến).
* **Checklist**:
  * [ ] [BE] Thuật toán tự động sinh 34 ghế (17 ghế tầng 1 A01-A17, 17 ghế tầng 2 B01-B17)
  * [ ] [BE] Logic chuyển trạng thái: `SCHEDULED` ➔ `DEPARTED` ➔ `COMPLETED` ➔ `CANCELLED`
  * [ ] [FE] Form Popup tạo chuyến mới có validation giờ chạy
  * [ ] [FE] Bảng hiển thị danh sách chuyến kèm nút đổi trạng thái trực tiếp

##### (5) US-03: Là một Quản trị viên, tôi muốn quản lý danh mục nhà xe đối tác và phương tiện để kiểm soát đội xe trên hệ thống
* **Mô tả (Description)**:
  * **Backend**: `GET/POST /api/v1/admin/companies` & `/api/v1/admin/vehicles`.
  * **Frontend**: `AdminFleetPage.tsx` (Card danh thiếp nhà xe và bảng quản lý biển số xe).
* **Checklist**:
  * [ ] [BE] Viết CRUD `BusCompanyRepository` & `VehicleRepository`
  * [ ] [BE] Xử lý ràng buộc một nhà xe sở hữu nhiều phương tiện
  * [ ] [FE] Dựng giao diện thẻ thông tin nhà xe (Hotline, địa chỉ, rating)
  * [ ] [FE] Bảng quản lý phương tiện (Biển số xe, loại xe Limousine 34 phòng)

##### (5) US-04: Là một Quản trị viên, tôi muốn quản lý các tuyến đường và trạm đón/trả kèm mốc giờ ETA để tối ưu lộ trình xe di chuyển
* **Mô tả (Description)**:
  * **Backend**: `GET/POST /api/v1/admin/routes` & `/api/v1/admin/routes/{id}/stops`.
  * **Frontend**: `AdminRoutesPage.tsx` (Bảng lộ trình liên tỉnh và sơ đồ trạm đón/trả).
* **Checklist**:
  * [ ] [BE] Viết CRUD Route và danh sách điểm dừng kèm mốc giờ ETA Offset
  * [ ] [BE] Validation khoảng cách km và thứ tự trạm dừng
  * [ ] [FE] Bảng danh sách tuyến xe liên tỉnh (Điểm đi - Điểm đến)
  * [ ] [FE] Card danh sách trạm đón/trả dọc đường kèm khoảng cách km

##### (5) US-05: Là một Quản trị viên, tôi muốn cấu hình bảng quy tắc hoàn tiền hủy vé và phụ thu tầng ghế để tự động hóa chính sách tài chính
* **Mô tả (Description)**:
  * **Backend**: Quản lý bảng `cancellation_policy_rules` (>24h hoàn 90%, 12-24h hoàn 70%, <12h không hoàn) và phụ thu giường VIP tầng 1.
  * **Frontend**: `AdminPoliciesPage.tsx` (Bảng mốc giờ hoàn vé và tỷ lệ %).
* **Checklist**:
  * [ ] [BE] Entity `CancellationPolicyRule` và logic tính % tiền hoàn tự động
  * [ ] [BE] Cấu hình mức phụ thu tầng 1 và phụ thu cuối tuần
  * [ ] [FE] Bảng trực quan hóa các mốc giờ hủy vé và tỷ lệ hoàn
  * [ ] [FE] Khung cấu hình giá vé phụ thu theo tầng

##### (5) US-06: Là một Quản trị viên, tôi muốn quản lý danh sách người dùng và phân quyền RBAC an toàn bằng JWT để kiểm soát quyền truy cập hệ thống
* **Mô tả (Description)**:
  * **Backend**: Cấu hình Spring Security JWT, 4 vai trò cố định (`ADMIN`, `OPERATOR`, `DRIVER`, `CUSTOMER`), mã hóa BCrypt.
  * **Frontend**: `AdminUsersPage.tsx` (Bảng danh sách tài khoản kèm Badge màu phân quyền).
* **Checklist**:
  * [ ] [BE] Cấu hình `SecurityConfig` và JWT Authentication Filter
  * [ ] [BE] API `GET /api/v1/admin/users`
  * [ ] [FE] Bảng danh sách người dùng (Họ tên, SĐT, Email)
  * [ ] [FE] Badge hiển thị màu theo vai trò (Admin đỏ, Driver vàng, Khách xanh)

##### (5) US-07: Là một Quản trị viên, tôi muốn theo dõi nhật ký audit log và kiểm duyệt đánh giá của khách hàng để đảm bảo chất lượng dịch vụ và tính an toàn bảo mật
* **Mô tả (Description)**:
  * **Backend**: Ghi log tự động vào bảng `audit_logs` (thời gian, IP, người thực hiện, hành động) và API duyệt review.
  * **Frontend**: `AdminAuditLogsPage.tsx` (Bảng truy vết thao tác và danh sách review chờ duyệt).
* **Checklist**:
  * [ ] [BE] Service ghi nhận vết Audit Log bất biến
  * [ ] [BE] API lấy danh sách đánh giá kèm nút duyệt trạng thái
  * [ ] [FE] Bảng Audit Trail hiển thị lịch sử thao tác hệ thống
  * [ ] [FE] Thẻ đánh giá của khách hàng kèm nút "Duyệt hiển thị"

---

#### 🔥 PHÂN HỆ KHÁCH HÀNG — NHÓM CỨNG (KHÓ & CONCURRENCY)

##### 🔍 Nguyễn Đại Phát (Full-Stack Search & Discovery)

###### (8) US-08: Là một Khách hàng, tôi muốn tìm kiếm chuyến xe kết hợp bộ lọc nâng cao thời gian thực để nhanh chóng chọn được chuyến xe phù hợp với nhu cầu
* **Mô tả (Description)**:
  * **Backend**: `GET /api/v1/trips/search` (Spring Data JPA Dynamic Specification: Nơi đi, Nơi đến, Ngày đi, Khoảng giá min-max, Khung giờ, Nhà xe).
  * **Frontend**: `HomePage.tsx` & `SearchTripBar.tsx` (Hero tìm kiếm + Sidebar lọc thông minh + Lưới thẻ chuyến xe).
* **Checklist**:
  * [ ] [BE] Viết dynamic JPA Specification lọc đa tiêu chí linh hoạt
  * [ ] [BE] DTO `TripSearchRequest` và `TripSummaryResponse`
  * [ ] [FE] Thanh tìm kiếm có gợi ý địa điểm (Autosuggest)
  * [ ] [FE] Sidebar bộ lọc thời gian thực (Slider khoảng giá, Checkbox nhà xe, Radio khung giờ)

###### (5) US-09: Là một Khách hàng, tôi muốn xem chi tiết thông tin xe, tiện ích và lộ trình trạm dừng ETA để an tâm về chất lượng chuyến đi
* **Mô tả (Description)**:
  * **Backend**: `GET /api/v1/trips/{id}` (Lấy thông tin xe, tiện ích: WiFi, sạc điện thoại, nước uống; danh sách trạm dừng kèm giờ ETA).
  * **Frontend**: `TripDetailPage.tsx` (Trang chi tiết chuyến, ảnh xe, timeline lộ trình đón/trả).
* **Checklist**:
  * [ ] [BE] DTO `TripDetailResponse` kèm mảng tiện ích và điểm đón/trả
  * [ ] [BE] API Endpoint `GET /api/v1/trips/{id}`
  * [ ] [FE] Khung hiển thị hình ảnh xe Limousine và biểu tượng tiện ích
  * [ ] [FE] Timeline trực quan hóa các trạm đón/trả và mốc giờ ETA xe chạy

---

##### 💺 Phan Trung Kiên (Full-Stack Seat Inventory & Concurrency)

###### (8) US-10: Là một Khách hàng, tôi muốn xem sơ đồ 2 tầng xe Limousine trực quan để tự do chọn vị trí giường nằm ưng ý nhất
* **Mô tả (Description)**:
  * **Backend**: `GET /api/v1/trips/{id}/seats` (Trả về 34 ghế chia 2 tầng kèm trạng thái `AVAILABLE`, `LOCKED`, `BOOKED`).
  * **Frontend**: `BusSeatMap.tsx` & `SeatSelectionPage.tsx` (Vẽ 2 tầng xe Limousine với 3 mã màu: Xanh trống, Cam chọn, Xám đã bán).
* **Checklist**:
  * [ ] [BE] Truy vấn danh sách ghế theo chuyến kèm giá vé từng ghế
  * [ ] [BE] DTO `TripSeatResponse`
  * [ ] [FE] Vẽ sơ đồ 2 tầng xe Limousine (Tầng 1 A01-A17, Tầng 2 B01-B17)
  * [ ] [FE] Xử lý chọn/bỏ chọn tối đa 4 ghế và tự động tính tổng tiền tạm tính

###### (8) US-11: Là một Khách hàng, tôi muốn hệ thống giữ chỗ độc quyền trong 10 phút có đồng hồ đếm ngược để hoàn tất thủ tục thanh toán mà không sợ bị người khác cướp vé
* **Mô tả (Description)**:
  * **Backend**: `POST /api/v1/seats/lock` (Khóa bi quan `@Lock(LockModeType.PESSIMISTIC_WRITE)`, TTL = 600s, tự động nhả ghế nếu hết hạn).
  * **Frontend**: `SeatLockStatusPage.tsx` (Đồng hồ đếm lùi 10:00, cảnh báo nhấp nháy đỏ khi < 2:00, cảnh báo nhả ghế khi hết giờ).
* **Checklist**:
  * [ ] [BE] Khóa ghế độc quyền bằng Pessimistic Write Lock chống Overbooking
  * [ ] [BE] Cơ chế kiểm tra và giải phóng ghế tự động sau 10 phút
  * [ ] [BE] Viết test kiểm thử Concurrency 10 luồng cùng tranh 1 ghế
  * [ ] [FE] Widget đồng hồ đếm ngược 10:00 thời gian thực
  * [ ] [FE] Hiệu ứng cảnh báo sắp hết giờ và thông báo hủy giữ chỗ

---

##### 📝 Phạm Thanh Phong (Full-Stack Booking & Payment Flow)

###### (5) US-12: Là một Khách hàng, tôi muốn chọn điểm đón/trả cụ thể và điền thông tin hành khách để nhà xe liên hệ đón đúng giờ
* **Mô tả (Description)**:
  * **Backend**: `GET /api/v1/trips/{id}/points` & `POST /api/v1/bookings/validate` (Lấy trạm đón/trả, validate SĐT 10 số, Email đúng định dạng).
  * **Frontend**: `BookingCheckoutPage.tsx` (Dropdown chọn điểm đón/trả theo giờ, form nhập thông tin người đặt, ô nhập Voucher).
* **Checklist**:
  * [ ] [BE] API trả danh mục điểm đón/trả theo lộ trình
  * [ ] [BE] Regex kiểm tra hợp lệ Số điện thoại Việt Nam và Email
  * [ ] [FE] Dropdown chọn điểm đón và điểm trả theo mốc giờ xe chạy
  * [ ] [FE] Form nhập thông tin khách hàng và ô áp dụng mã Voucher

###### (8) US-13: Là một Khách hàng, tôi muốn thanh toán đơn vé đa kênh an toàn (VNPay QR, MoMo, COD) để xác nhận đặt vé thành công tức thì
* **Mô tả (Description)**:
  * **Backend**: `POST /api/v1/bookings` & `POST /api/v1/payments/create` (`@Transactional` nguyên tử, sinh mã đơn `BK-*`, tích hợp VNPay/MoMo/COD).
  * **Frontend**: `PaymentPortalPage.tsx` (Chọn phương thức COD / VNPay / MoMo, mã QR ngân hàng động, màn hình loading an toàn).
* **Checklist**:
  * [ ] [BE] Xử lý giao dịch nguyên tử `@Transactional(isolation = Isolation.SERIALIZABLE)`
  * [ ] [BE] Thuật toán sinh mã đơn vé duy nhất `BK-YYYYMMDD-XXXX`
  * [ ] [BE] Tích hợp tạo URL/QR thanh toán VNPay và MoMo
  * [ ] [FE] Giao diện chọn phương thức thanh toán trực quan
  * [ ] [FE] Màn hình hiển thị mã QR Code chuyển khoản kèm hướng dẫn

---

#### 🟢 PHÂN HỆ KHÁCH HÀNG — NHÓM YẾU (TASK DỄ, TRỰC QUAN & CRUD)

##### 🎫 Trần Minh Đức 2 (Full-Stack E-Ticket & Guide — Task Dễ)

###### (5) US-14: Là một Khách hàng, tôi muốn nhận vé điện tử sắc nét kèm mã QR Code để dễ dàng xuất trình cho tài xế soát vé khi lên xe
* **Mô tả (Description)**:
  * **Backend**: `GET /api/v1/tickets/{ticketCode}` (Lấy thông tin vé từ bảng `tickets`: tên khách, tuyến đường, giờ chạy, số ghế, chuỗi hash QR).
  * **Frontend**: `PaymentSuccessPage.tsx` (Thẻ vé Boarding Pass sang trọng, render mã QR Code quét được bằng camera, nút In vé và Tải PDF).
* **Checklist**:
  * [ ] [BE] Viết query lấy thông tin vé theo mã `ticketCode`
  * [ ] [BE] DTO `TicketResponse` đầy đủ thông tin chuyến và hành khách
  * [ ] [FE] Thiết kế giao diện Thẻ vé Boarding Pass (Logo nhà xe, số xe, số ghế)
  * [ ] [FE] Render mã QR Code sắc nét quét được bằng camera và nút "In vé"

###### (3) US-15: Là một Khách hàng, tôi muốn đọc hướng dẫn quy định hành lý và các câu hỏi thường gặp (FAQ) để chuẩn bị tốt nhất trước khi khởi hành
* **Mô tả (Description)**:
  * **Backend**: `GET /api/v1/guide/faq` (Trả về danh mục câu hỏi thường gặp và quy định hành lý từ CSDL/JSON).
  * **Frontend**: `GuideFaqPage.tsx` (Quy định hành lý tối đa 20kg, giờ có mặt trước 15 phút, Accordion FAQ bấm đóng/mở).
* **Checklist**:
  * [ ] [BE] Tạo Controller trả về danh sách FAQ và quy định hành lý
  * [ ] [BE] Model dữ liệu FAQ đơn giản
  * [ ] [FE] Dựng khung thông tin quy định hành lý và lưu ý khi đi xe
  * [ ] [FE] Danh sách câu hỏi thường gặp dạng Accordion (click để mở câu trả lời)

---

##### 🌟 Đoàn Nhật Cường (Full-Stack Self-Service & Review — Task Dễ)

###### (3) US-16: Là một Khách hàng, tôi muốn tra cứu thông tin vé nhanh bằng số điện thoại hoặc mã đơn để kiểm tra lại lịch trình bất kỳ lúc nào
* **Mô tả (Description)**:
  * **Backend**: `GET /api/v1/bookings/code/{code}` hoặc theo SĐT (Tìm đơn vé trong CSDL, trả về 404 nếu không tìm thấy).
  * **Frontend**: `TicketLookupPage.tsx` (1 ô nhập SĐT hoặc Mã vé `BK-*`, nút "Tra cứu", bảng thông tin kết quả vé).
* **Checklist**:
  * [ ] [BE] Viết truy vấn tìm Booking theo mã đơn vé hoặc số điện thoại
  * [ ] [BE] Xử lý ngoại lệ trả về thông báo lỗi thân thiện nếu không tìm thấy vé
  * [ ] [FE] Ô nhập liệu đơn giản tra cứu SĐT / Mã vé
  * [ ] [FE] Bảng hiển thị thông tin vé tra cứu được kèm thông báo trạng thái

###### (3) US-17: Là một Khách hàng, tôi muốn gửi đánh giá số sao (1-5 ⭐) và nhận xét dịch vụ sau chuyến đi để phản hồi trải nghiệm thực tế với nhà xe
* **Mô tả (Description)**:
  * **Backend**: `POST /api/v1/reviews` (Lưu số sao 1-5, nội dung nhận xét vào bảng `reviews` của CSDL).
  * **Frontend**: `ReviewSubmitPage.tsx` (Widget chọn 1-5 ngôi sao ⭐, ô textarea nhập nhận xét, nút "Gửi đánh giá").
* **Checklist**:
  * [ ] [BE] Tạo Entity `Review` và Repository lưu đánh giá vào CSDL
  * [ ] [BE] API Endpoint `POST /api/v1/reviews`
  * [ ] [FE] Widget tương tác chọn từ 1 đến 5 sao ⭐ trực quan
  * [ ] [FE] Ô textarea nhập lời nhận xét và nút gửi kèm thông báo thành công

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

### Cách 2: Khởi chạy kết nối Supabase Cloud Database (PostgreSQL - Đồng bộ cả nhóm)
*Dành cho cả nhóm 6 thành viên khi làm việc cùng nhau, đảm bảo dữ liệu test đồng nhất thời gian thực trên Cloud Supabase (Transaction Pooler).*

```bash
cd backend

# Khởi chạy Backend với profile Supabase:
.\gradlew bootRun --args='--spring.profiles.active=supabase'

# Hoặc trên Linux/macOS:
./gradlew bootRun --args='--spring.profiles.active=supabase'
```
* **Thông số kết nối Cloud**:
  * Trình trực quan hóa CSDL: [Schema Visualizer | traveleasy-platform | Supabase](https://supabase.com/dashboard/project/ctvcwhdepzyvqsncbslf/database/schemas)
  * Host: `aws-0-ap-southeast-2.pooler.supabase.com`
  * Port: `6543` (PgBouncer Transaction Pooler)
  * Database: `postgres`
  * User: `postgres.ctvcwhdepzyvqsncbslf`
  * JDBC URL: `jdbc:postgresql://aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0`
* **Ưu điểm**: Toàn bộ bảng CSDL và 100% dữ liệu mẫu (Users, Buses, Trips, Seats, Tickets) tự động sinh và nạp sẵn trên Supabase, không cần cài đặt database nội bộ trên máy.

---

### Cách 3: Khởi chạy 1 lệnh duy nhất với Docker Compose
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

### Cách 4: Khởi chạy với MySQL Local đã cài trên máy
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

### 8.5 Quy chuẩn & Lưu ý sống còn cho thành viên khi code Backend & Kết nối Database

Để đảm bảo tiến độ chạy nước rút, không xảy ra lỗi xung đột Git (Merge Conflicts) và duy trì tính toàn vẹn dữ liệu cho toàn bộ nhóm 6 thành viên, mọi lập trình viên Backend **BẮT BUỘC** tuân thủ các quy tắc sau:

#### 1. Lựa chọn Profile Database chuẩn xác
* **Khi code offline / phát triển tính năng cục bộ độc lập**: Dùng profile `dev` (H2 In-Memory):
  ```bash
  .\gradlew bootRun --args='--spring.profiles.active=dev'
  ```
  *(Khởi động siêu nhanh trong 2 giây, dữ liệu reset sạch sẽ sau mỗi lần tắt).*
* **Khi tích hợp End-to-End & kiểm thử chéo giữa các thành viên**: Dùng profile `supabase`:
  ```bash
  .\gradlew bootRun --args='--spring.profiles.active=supabase'
  ```
  *(Dữ liệu lưu trữ tập trung trên đám mây Supabase, các bạn Frontend gọi API là có dữ liệu thật tức thì).*

#### 2. Quy tắc Concurrency Lock (Dành cho Phan Trung Kiên — Task U4)
* **Khóa bi quan bắt buộc**: Khi viết API khóa giữ chỗ 10 phút (`POST /api/v1/seats/lock`), bắt buộc phải sử dụng `@Lock(LockModeType.PESSIMISTIC_WRITE)` trên phương thức truy vấn của `TripSeatRepository` để khóa hàng độc quyền ở tầng Database:
  ```java
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT s FROM TripSeat s WHERE s.trip.id = :tripId AND s.seatCode IN :seatCodes")
  List<TripSeat> findSeatsWithLock(@Param("tripId") Long tripId, @Param("seatCodes") List<String> seatCodes);
  ```
* **Tuyệt đối không dùng `synchronized` Java**: Khóa ở tầng RAM của JVM sẽ vô tác dụng khi scale nhiều instance hoặc chạy qua load balancer. Phải giao trách nhiệm khóa độc quyền cho PostgreSQL/MySQL.

#### 3. Quy tắc Giao dịch Tài chính Nguyên tử (Dành cho Phạm Thanh Phong — Task U6)
* **Giao dịch `@Transactional` Serializable**: Khi tạo đơn vé và thanh toán (`POST /api/v1/bookings`), phương thức xử lý phải được gắn annotation:
  ```java
  @Transactional(isolation = Isolation.SERIALIZABLE)
  ```
* **Tính nguyên tử (Atomicity)**: Các bước: *(1) Xác thực chỗ trống ➔ (2) Chuyển trạng thái ghế sang `BOOKED` ➔ (3) Giảm số chỗ trống trên `trips` ➔ (4) Tạo đơn `bookings` ➔ (5) Sinh vé `tickets` kèm mã QR* phải nằm trọn trong **CÙNG 1 TRANSACTION**. Nếu bất kỳ bước nào lỗi (vd: lỗi mạng cổng thanh toán), toàn bộ thao tác phải được tự động Rollback 100%.

#### 4. Tuyệt đối không viết Native SQL đặc thù cơ sở dữ liệu
* Hệ thống hỗ trợ đa nền tảng (H2, MySQL, Supabase PostgreSQL). Do đó:
  * **CẤM**: Viết các câu lệnh native SQL chứa cú pháp riêng của MySQL như: `AUTO_INCREMENT`, `TINYINT(1)`, `LIMIT x, y`, hoặc bao tên bảng bằng dấu backtick ``` `table` ```.
  * **BẮT BUỘC**: Sử dụng **Spring Data JPA Method Naming** (`findBy...`) hoặc viết truy vấn **JPQL** (`SELECT t FROM Trip t WHERE ...`). Khi cần tìm kiếm chuỗi không phân biệt hoa thường với tham số có thể `NULL`, hãy ép kiểu rõ ràng:
    ```java
    WHERE (CAST(:param AS string) IS NULL OR LOWER(field) LIKE CONCAT('%', LOWER(CAST(:param AS string)), '%'))
    ```
    để Hibernate tự động sinh SQL tối ưu tương thích với cả PostgreSQL và MySQL.

#### 5. Phân chia Controller độc lập — Tuyệt đối không sửa chung file
* Nhóm tuân thủ mô hình **Feature Controllers** (đã thống nhất tại Mục 2.2):
  * **Nguyễn Đại Phát**: Phụ trách riêng `TripSearchController.java` & `TripDetailController.java`.
  * **Phan Trung Kiên**: Phụ trách riêng `SeatCatalogController.java` & `SeatLockController.java`.
  * **Phạm Thanh Phong**: Phụ trách riêng `BookingCheckoutController.java` & `PaymentController.java`.
  * **Trần Minh Đức 2**: Phụ trách riêng `TicketDisplayController.java` & `GuideFaqController.java`.
  * **Đoàn Nhật Cường**: Phụ trách riêng `TicketLookupController.java` & `ReviewController.java`.
  * **Phạm Công Thành**: Độc quyền phụ trách phân hệ `com.traveleasy.controller.admin.*`.
* **Không được phép** tự ý khai báo API của mình vào Controller của bạn khác để tránh xung đột mã nguồn (Merge Hell) khi push code lên nhánh `dev`.

#### 6. Chuẩn hóa Phản hồi API & Xử lý Ngoại lệ
* Mọi API Endpoint bắt buộc trả về đối tượng bọc thống nhất `ApiResponse<T>`:
  ```java
  return ResponseEntity.ok(ApiResponse.success(data));
  ```
* Khi có lỗi nghiệp vụ, hãy ném ngoại lệ thông qua `AppException(ErrorCode.xxx)`:
  * Ví dụ: `throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe!");`
  * Lớp `GlobalExceptionHandler` sẽ tự động bắt và trả về mã lỗi HTTP chuẩn (400, 401, 403, 404, 409, 500) kèm thông điệp tiếng Việt thân thiện cho Frontend.

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

## 11. BÁO CÁO NGHIỆM THU BACKEND API (30/30 PASS) & HỆ THỐNG MINH CHỨNG GIAO DIỆN (UI EVIDENCE GALLERY)

### 11.1 Ma trận nghiệm thu 30 API Backend Cốt Lõi (100% Pass)
Toàn bộ 30 endpoints thuộc 7 nhóm nghiệp vụ chính của TravelEasy Platform đã được kiểm thử tự động End-to-End bằng test suite `scratch/verify_all_backend_apis.mjs` trên môi trường thực tế (Spring Boot 3.3.4 + JPA + H2 / PostgreSQL). Tỷ lệ phản hồi hợp lệ đạt **100% (30/30 APIs Pass)**:

| STT | Phân hệ (Domain) | Phương thức | Đường dẫn API (Endpoint) | Quyền hạn (RBAC) | Mô tả nghiệp vụ | HTTP Status | Kết quả thực tế |
|:---:|:---|:---:|:---|:---:|:---|:---:|:---|
| 1 | **Auth** | `POST` | `/api/v1/auth/login` | Public | Đăng nhập Quản trị viên (`admin@traveleasy.vn`) | `200 OK` | ✅ Sinh JWT Token Role ADMIN |
| 2 | **Auth** | `POST` | `/api/v1/auth/login` | Public | Đăng nhập Đối tác Nhà xe (`operator@futa.vn`) | `200 OK` | ✅ Sinh JWT Token Role OPERATOR |
| 3 | **Auth** | `POST` | `/api/v1/auth/login` | Public | Đăng nhập Khách hàng (`customer@gmail.com`) | `200 OK` | ✅ Sinh JWT Token Role CUSTOMER |
| 4 | **Customer** | `GET` | `/api/v1/trips/search` | Public | Tìm kiếm chuyến xe theo điểm đi, điểm đến, ngày | `200 OK` | ✅ Trả về danh sách 12 chuyến khả dụng |
| 5 | **Customer** | `GET` | `/api/v1/trips/{id}` | Public | Chi tiết chuyến xe & sơ đồ kho 34 ghế ngồi | `200 OK` | ✅ Trả về đầy đủ thông tin chuyến & trạng thái ghế |
| 6 | **Customer** | `GET` | `/api/v1/banners` | Public | Lấy danh sách banner chiến dịch trang chủ | `200 OK` | ✅ Trả về banner hiển thị `ACTIVE` |
| 7 | **Booking** | `POST` | `/api/v1/bookings` | Public / User | Khởi tạo đơn đặt vé xe (Ghế A03, COD/Chờ thanh toán) | `200 OK` | ✅ Tạo đơn thành công, sinh mã `BK-*` |
| 8 | **Booking** | `POST` | `/api/v1/bookings` | Public / User | **Kiểm tra Concurrency Lock (Pessimistic Locking)** | `409 CONFLICT` | ✅ Chặn trùng ghế tức thì, trả về lỗi xung đột |
| 9 | **Booking** | `GET` | `/api/v1/bookings/code/{code}` | Public / User | Tra cứu thông tin đơn vé & vé con điện tử | `200 OK` | ✅ Trả về dữ liệu đặt vé & danh sách vé con |
| 10 | **Payment** | `POST` | `/api/v1/payments/vnpay/create-payment` | Public / User | Khởi tạo giao dịch thanh toán VNPAY (HMAC-SHA512) | `200 OK` | ✅ Sinh URL thanh toán VNPAY Sandbox chuẩn |
| 11 | **Payment** | `POST` | `/api/v1/payments/mock-success` | Public / User | **Cơ chế Duyệt Nhanh 1-Click Demo (Mock Payment)** | `200 OK` | ✅ Ghi nhận thanh toán thành công ngay trên demo |
| 12 | **Payment** | `GET` | `/api/v1/bookings/code/{code}` | Public / User | Đồng bộ CSDL: Booking = `CONFIRMED`, Ticket = `ISSUED` | `200 OK` | ✅ Lịch sử giao dịch lưu vĩnh viễn vào Database |
| 13 | **Review** | `POST` | `/api/v1/reviews` | Customer | Gửi đánh giá sao & nhận xét chất lượng chuyến đi | `200 OK` | ✅ Lưu đánh giá 5 sao thành công |
| 14 | **Booking** | `POST` | `/api/v1/bookings/{id}/cancel` | Public / User | Hủy vé & hoàn tiền tự động theo chính sách sàn | `200 OK` | ✅ Giải phóng ghế về `AVAILABLE`, cập nhật đơn |
| 15 | **Admin** | `GET` | `/api/v1/admin/dashboard/stats` | ADMIN | Thống kê số liệu KPI tổng quan sàn trực tiếp từ CSDL | `200 OK` | ✅ Trả về doanh thu, số vé, chuyến xe thời gian thực |
| 16 | **Admin** | `GET` | `/api/v1/admin/trips` | ADMIN | Quản lý danh sách chuyến xe toàn sàn | `200 OK` | ✅ Trả về danh sách 18 chuyến xe |
| 17 | **Admin** | `GET` | `/api/v1/admin/bookings` | ADMIN | Quản lý và lọc danh sách đơn đặt vé | `200 OK` | ✅ Trả về danh sách đơn đặt vé |
| 18 | **Admin** | `GET` | `/api/v1/admin/users` | ADMIN | Quản lý danh sách tài khoản & phân quyền | `200 OK` | ✅ Trả về danh sách 12 người dùng |
| 19 | **Admin** | `PATCH` | `/api/v1/admin/users/{id}/status` | ADMIN | Khóa / Mở khóa tài khoản người dùng vi phạm | `200 OK` | ✅ Cập nhật trạng thái `ACTIVE` / `LOCKED` |
| 20 | **Admin** | `GET` | `/api/v1/admin/companies` | ADMIN | Quản lý danh sách đối tác nhà xe liên kết | `200 OK` | ✅ Trả về danh sách đối tác nhà xe |
| 21 | **Admin** | `POST` | `/api/v1/admin/bus-companies` | ADMIN | Thêm mới đối tác nhà xe vào sàn | `200 OK` | ✅ Tạo nhà xe và đồng bộ CSDL |
| 22 | **Admin** | `GET` | `/api/v1/admin/routes` | ADMIN | Quản lý danh sách tuyến đường liên tỉnh | `200 OK` | ✅ Trả về 15 tuyến đường kết nối |
| 23 | **Admin** | `POST` | `/api/v1/admin/routes` | ADMIN | Thêm mới tuyến đường vận tải liên tỉnh | `200 OK` | ✅ Tạo tuyến đường và ghi nhận audit log |
| 24 | **Admin** | `POST` | `/api/v1/admin/trips` | ADMIN | **Thêm chuyến xe mới & tự động sinh kho 34 ghế** | `200 OK` | ✅ Sinh đủ 34 ghế A01-A17, B01-B17 |
| 21 | **Admin** | `GET` | `/api/v1/admin/seat-types` | ADMIN | Danh mục loại ghế chuẩn hóa (VIP, Thường, Đôi) | `200 OK` | ✅ Trả về danh mục loại ghế |
| 22 | **Admin** | `GET` | `/api/v1/admin/seat-templates`| ADMIN | Danh mục sơ đồ ghế mẫu (Giường nằm 34, 40 chỗ) | `200 OK` | ✅ Trả về danh sách template ghế |
| 23 | **Admin** | `GET` | `/api/v1/admin/locations` | ADMIN | Danh mục địa điểm & bến xe đón trả khách | `200 OK` | ✅ Trả về danh sách địa điểm |
| 24 | **Admin** | `GET` | `/api/v1/admin/banners` | ADMIN | Quản lý danh sách banner sự kiện & khuyến mãi | `200 OK` | ✅ Trả về danh sách banner sàn |
| 25 | **Admin** | `PATCH` | `/api/v1/admin/banners/{id}/status` | ADMIN | Bật / Tắt trạng thái hiển thị banner trên trang chủ | `200 OK` | ✅ Cập nhật cờ kích hoạt banner |
| 26 | **Admin** | `GET` | `/api/v1/admin/gateways` | ADMIN | Cấu hình cổng thanh toán (VNPAY, VietQR) & thông báo | `200 OK` | ✅ Trả về trạng thái các cổng tích hợp |
| 27 | **Admin** | `GET` | `/api/v1/admin/review-reports`| ADMIN | Báo cáo kiểm duyệt đánh giá và khiếu nại | `200 OK` | ✅ Trả về danh sách đánh giá cần duyệt |
| 28 | **Admin** | `GET` | `/api/v1/admin/cancellation-policies` | ADMIN | Thiết lập chính sách hoàn hủy vé theo khung giờ | `200 OK` | ✅ Trả về bảng chính sách bồi hoàn |
| 29 | **Admin** | `GET` | `/api/v1/admin/audit-logs` | ADMIN | Nhật ký kiểm toán các thao tác quản trị trên hệ thống | `200 OK` | ✅ Trả về danh sách 17 sự kiện audit log |
| 30 | **AI** | `POST` | `/api/v1/ai/chat` | Public | Hỏi đáp & nhận tư vấn thông minh từ Trợ lý AI du lịch | `200 OK` | ✅ AI tư vấn hành trình và vị trí ghế nằm êm ái |

---

### 11.2 Minh chứng Giao diện Người dùng (User / Customer Journey)

#### 1. Trang chủ & Tìm kiếm Chuyến xe Trực tuyến
Hành khách tìm kiếm tuyến đường nhanh chóng với gợi ý địa điểm, ngày khởi hành và bộ lọc chuyến xe thông minh.
![Trang Chủ Khách Hàng](docs/screenshots/screenshot_customer_home.png)
*Hình 11.1: Giao diện Trang chủ hiện đại với thanh tìm kiếm đa năng và thanh điều hướng thân thiện.*

![Kết Quả Tìm Kiếm Chuyến Xe](docs/screenshots/screenshot_vexere_search_results.png)
*Hình 11.2: Danh sách chuyến xe hiển thị trực quan thông tin nhà xe, giờ khởi hành, giá vé và số chỗ trống thực tế.*

#### 2. Sơ đồ Ghế 2 Tầng & Thông tin Đặt Vé (Checkout)
Giao diện cho phép chọn ghế trực quan tầng dưới/tầng trên theo mã A01-A17, B01-B17 với cập nhật tổng tiền tức thì.
![Sơ đồ Ghế & Đặt Chỗ](docs/screenshots/screenshot_vexere_checkout_page.png)
*Hình 11.3: Trang điền thông tin hành khách, chọn điểm đón trả và áp dụng mã giảm giá.*

#### 3. Phương thức Thanh toán Đa Dạng & VietQR Động
Hệ thống hỗ trợ VietQR sinh mã QR động kèm thông tin chuyển khoản chuẩn NAPAS 24/7.
![Phương Thức Thanh Toán Đa Dạng](docs/screenshots/screenshot_payment_checkout_methods.png)
*Hình 11.4: Lựa chọn linh hoạt giữa Thanh toán khi lên xe (COD), VietQR Chuyển khoản, và Thẻ ATM/VNPAY.*

![Modal Thanh Toán VietQR Tự Động](docs/screenshots/screenshot_payment_vietqr_modal.png)
*Hình 11.5: Mã VietQR tự động sinh khớp số tiền đơn hàng và nội dung chuyển khoản để khách quét trên app ngân hàng.*

#### 4. Cơ chế Mock Thanh toán 1-Click Demo & VNPAY Sandbox
Để phục vụ việc trình diễn bảo vệ không cần chuyển tiền thật mà vẫn đảm bảo toàn bộ luồng Backend, API và CSDL ghi nhận đầy đủ, hệ thống trang bị nút **"Xác nhận đã thanh toán (1-Click Demo)"**.
![Modal Demo Thanh Toán VNPAY 1-Click](docs/screenshots/screenshot_vnpay_demo_modal.png)
*Hình 11.6: Hộp thoại xác nhận thanh toán Demo — Gửi lệnh `POST /api/v1/payments/mock-success` kích hoạt cập nhật trạng thái đơn vé sang `CONFIRMED` và xuất vé `ISSUED`.*

![Thông Báo Thanh Toán Thành Công](docs/screenshots/screenshot_ticket_paid_success.png)
*Hình 11.7: Xác nhận thanh toán thành công tức thì, hiển thị mã đơn vé điện tử và nút xem vé ngay.*

#### 5. Vé Điện Tử Kèm Mã QR Code & Tra Cứu Vé
Hành khách có thể tra cứu mã vé bất kỳ lúc nào để xuất trình mã QR cho phụ xe quét lên xe mà không cần in giấy.
![Vé Điện Tử QR Code](docs/screenshots/screenshot_vnpay_demo_confirmed_ticket.png)
*Hình 11.8: Thẻ vé điện tử chính thức với mã QR độc nhất cho từng ghế ngồi và thông tin hành trình chi tiết.*

![Trang Tra Cứu Vé Điện Tử](docs/screenshots/screenshot_vexere_ticket_lookup.png)
*Hình 11.9: Giao diện tra cứu vé tức thời theo mã đặt chỗ (`BK-*` hoặc `BKG-*`).*

#### 6. Hồ Sơ Cá Nhân & Danh Sách Hành Khách Đi Cùng
![Hồ Sơ Khách Hàng](docs/screenshots/screenshot_vexere_profile_authenticated.png)
*Hình 11.10: Quản lý thông tin cá nhân, cập nhật số điện thoại và email nhận vé.*

![Danh Sách Hành Khách Đi Cùng](docs/screenshots/screenshot_vexere_profile_travelers.png)
*Hình 11.11: Danh sách hành khách đi cùng được lưu sẵn để tự động điền nhanh khi đặt vé các chuyến tiếp theo.*

---

### 11.3 Minh chứng Giao diện Quản trị Hệ thống (Admin Portal Journey)

#### 1. Dashboard Quản Trị Trực Tiếp Từ Cơ Sở Dữ Liệu
Toàn bộ 4 thẻ KPI (Doanh thu, Vé đã bán, Chuyến xe hoạt động, Khách hàng) và bảng giao dịch gần nhất được đồng bộ 100% thời gian thực từ CSDL qua endpoint `GET /api/v1/admin/dashboard/stats`.
![Admin Dashboard Đồng Bộ CSDL](docs/screenshots/screenshot_admin_dashboard_synced.png)
*Hình 11.12: Dashboard quản trị hiển thị dữ liệu thực tế từ cơ sở dữ liệu.*

#### 2. Quản Lý Toàn Diện Chuyến Xe (Trips Management — Full CRUD)
Hệ thống cho phép Quản trị viên thực hiện đầy đủ chu trình **Thêm - Sửa - Xóa** chuyến xe trực tiếp trên giao diện:
* **Thêm mới**: Tự động sinh kho 34 ghế ngồi chuẩn (A01-A17 tầng dưới, B01-B17 tầng trên) kèm liên kết Tuyến đường & Nhà xe.
* **Chỉnh sửa**: Cập nhật giờ khởi hành, giờ đến, loại xe (Limousine/Sleeper/Seat) và giá vé niêm yết.
* **Xóa & Chuyển trạng thái**: Hỗ trợ xóa chuyến an toàn (tự động giải phóng các ghế liên quan) và toggle trạng thái Mở bán / Hủy chuyến.
![Quản Lý Chuyến Xe Full CRUD](docs/screenshots/screenshot_admin_trips_crud.png)
*Hình 11.13: Danh sách chuyến xe với đầy đủ nút Thao tác: Sửa, Đổi trạng thái (Mở bán / Hủy), và Xóa.*

#### 3. Quản Lý Tuyến Đường Vận Tải (Routes Management — Full CRUD)
Quản trị viên cấu hình mạng lưới tuyến đường liên tỉnh toàn quốc:
* **Thêm tuyến mới**: Thiết lập điểm xuất phát, điểm đến, nhà xe vận hành, cự ly km, thời gian dự kiến và giá vé cơ sở.
* **Chỉnh sửa tuyến**: Điều chỉnh lộ trình đón trả, cập nhật thời gian chạy và biểu giá.
* **Xóa tuyến**: Loại bỏ các tuyến ngừng khai thác khỏi hệ thống.
![Quản Lý Tuyến Đường Full CRUD](docs/screenshots/screenshot_admin_routes_crud.png)
*Hình 11.14: Giao diện quản lý tuyến đường với các nút Sửa và Xóa theo thời gian thực.*

#### 4. Quản Lý Đối Tác Nhà Xe (Bus Companies — Full CRUD)
Quản trị toàn diện danh sách các nhà xe tham gia sàn thương mại điện tử TravelEasy:
* **Thêm nhà xe mới**: Nhập tên nhà xe, hotline chăm sóc khách hàng, email điều hành và văn phòng đại diện.
* **Sửa thông tin**: Cập nhật thông tin liên hệ và địa chỉ bến bãi.
* **Kiểm soát vận hành**: Phê duyệt (`ACTIVE`), Tạm ngưng (`SUSPENDED`), hoặc Xóa nhà xe khỏi hệ thống.
![Quản Lý Đối Tác Nhà Xe Full CRUD](docs/screenshots/screenshot_admin_companies_crud.png)
*Hình 11.15: Quản lý đối tác nhà xe với tính năng Sửa, Duyệt/Ngưng và Xóa trực tiếp.*

#### 5. Quản Lý Địa Điểm & Bến Xe Master Data (Locations — Full CRUD)
Danh mục bến xe và trạm trung chuyển cấp hệ thống phục vụ tìm kiếm và đặt vé:
* **Thêm địa điểm**: Tạo mới bến xe khách (`BUS_STATION`) hoặc trạm trung chuyển (`TRANSIT_POINT`).
* **Sửa địa điểm**: Modal chỉnh sửa thông tin chi tiết tên bến, tỉnh thành, địa chỉ và số tuyến phục vụ.
* **Xóa địa điểm**: Loại bỏ các điểm đón trả không còn hoạt động.
![Modal Chỉnh Sửa Địa Điểm Master Data](docs/screenshots/screenshot_admin_locations_crud.png)
*Hình 11.16: Hộp thoại Cập nhật Địa Điểm Master Data trên giao diện Admin.*

#### 6. Quản Lý Người Dùng, Phân Quyền & Bảo Mật (Users Management — Full CRUD)
Kiểm soát toàn bộ tài khoản trong hệ thống với các cơ chế bảo mật nghiêm ngặt:
* **Thêm người dùng mới**: Phân quyền trực tiếp Role `ADMIN`, `OPERATOR`, hoặc `CUSTOMER`.
* **Chỉnh sửa & Điều chuyển vai trò**: Cập nhật họ tên, số điện thoại và nâng cấp/hạ cấp Role.
* **Khóa / Mở khóa tài khoản**: Toggle trạng thái `ACTIVE` <-> `LOCKED` tức thì chỉ với 1 click.
* **Xóa tài khoản**: Xóa tài khoản vi phạm kèm **Cơ chế bảo vệ Quản trị viên tối cao** (Super Admin Guard — không thể xóa `admin@traveleasy.vn`).
![Quản Lý Người Dùng & Phân Quyền Full CRUD](docs/screenshots/screenshot_admin_users_crud.png)
*Hình 11.17: Quản lý tài khoản với đầy đủ thao tác Khóa, Sửa và Xóa an toàn.*

---

### 11.4 Minh chứng Giao diện & Kiểm soát Đối tác Nhà xe (Company Portal & Security Guard)

#### 1. Đăng Nhập Đối Tác Nhà Xe Chuyên Biệt
Phân hệ Đối tác Nhà xe sở hữu trang đăng nhập riêng biệt (`/company/login`) với giao diện màu xanh ngọc chuyên nghiệp (`#0F766E`).
![Đăng Nhập Đối Tác Nhà Xe](docs/screenshots/screenshot_company_login.png)
*Hình 11.18: Giao diện đăng nhập dành riêng cho nhân viên và điều hành viên nhà xe đối tác.*

#### 2. Kiểm Soát Quyền Truy Cập (Company Auth Guard)
Cơ chế bảo mật `CompanyAuthGuard` tự động ngăn chặn truy cập trái phép. Khách vãng lai hoặc tài khoản khách hàng thông thường khi cố truy cập `/company/*` sẽ bị chặn với mã 403 Forbidden và điều hướng về trang thông báo thân thiện.
![Chặn Truy Cập Phân Hệ Đối Tác](docs/screenshots/screenshot_company_auth_guard.png)
*Hình 11.19: Thông báo từ chối truy cập khi người dùng không sở hữu quyền Nhà Xe (`ROLE_OPERATOR`).*

#### 3. Bảng Điều Khiển Nhà Xe & Kế Hoạch Tính Năng Mở Rộng
Hệ thống đã chuẩn bị sẵn Dashboard điều hành cho nhà xe (`/company/dashboard`) và thông báo tính năng đối tác đang được hoàn thiện theo lộ trình phát triển.
![Dashboard Đối Tác Nhà Xe](docs/screenshots/screenshot_company_dashboard.png)
*Hình 11.20: Dashboard điều hành dành riêng cho nhà xe đối tác.*

#### 4. Quản Lý Đội Xe Vận Hành (Company Vehicles — Full CRUD)
Tính năng quản lý toàn diện đội xe của từng nhà xe đối tác trên sàn:
* **Thêm xe mới**: Hộp thoại thêm xe nhập biển số, loại xe (Giường nằm / Limousine VIP / Ghế ngồi), số tầng, năm sản xuất và sơ đồ ghế mẫu.
* **Chỉnh sửa xe**: Cập nhật biển số, loại xe, năm sản xuất, và cấu hình ghế ngồi.
* **Xem chi tiết xe**: Bảng thông số kỹ thuật xe chi tiết, tình trạng kiểm định và đơn vị vận hành.
* **Bật / tắt trạng thái vận hành**: Chuyển đổi trạng thái hoạt động tức thì (`ACTIVE` <-> `INACTIVE`) và đồng bộ CSDL thời gian thực qua `PATCH /api/v1/company/vehicles/{id}/status`.
* **Xóa xe**: Gỡ bỏ xe khỏi đội xe vận hành.
![Quản Lý Đội Xe Nhà Xe](docs/screenshots/screenshot_company_vehicles_live.png)
*Hình 11.21: Giao diện quản lý đội xe thời gian thực với đầy đủ các thao tác Xem, Sửa, Xóa và Đổi trạng thái.*

![Modal Thêm Xe Mới Vào Đội Xe](docs/screenshots/screenshot_company_vehicles_modal.png)
*Hình 11.22: Hộp thoại Thêm Xe Mới Vào Đội Xe — Kết nối CSDL và lưu trữ bền vững.*

---
*Tài liệu Master Specification được ban hành chính thức bởi Nhóm trưởng Phạm Công Thành — Nhóm 7.*  
*Chúc toàn đội bảo vệ thành công rực rỡ!*
