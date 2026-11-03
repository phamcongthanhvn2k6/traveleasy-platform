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
> 1. `docs/01-requirements/SRS_Vexere.md` (Đặc tả yêu cầu phần mềm chuẩn IEEE Std 830-1998, 37 Use Cases, 40 Business Rules)
> 2. `docs/01-requirements/domain.md` (Domain Model DDD: 13 Bounded Contexts, 19 Aggregate Roots, 13 Entities, 13 Value Objects, 14 Services, 23 Enums, 5 State Machines)
> 3. `docs/02-architecture-and-db/class_diagram.md` (Class Diagram v2 Canonical với 6 Mermaid Context Diagrams & Ownership Rules O1-O5)
> 4. `docs/02-architecture-and-db/database_design.md` & `docs/schema.sql` (Thiết kế CSDL Production 36 bảng MySQL 8.0, Triggers, Invariants)
> 5. `docs/02-architecture-and-db/PROJECT_ARCHITECTURE.md` (Kiến trúc Modular Monolith Spring Boot 3 + Clean Architecture + React Vite TS)
> 6. `docs/03-api-and-deployment/GIT_WORKFLOW.md` (Quy chuẩn phân nhánh Git, Conventional Commits, Pull Request & Branch Protection)
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

## 🔑 BẢNG THÔNG TIN TÀI KHOẢN ĐĂNG NHẬP & KIỂM THỬ HỆ THỐNG (CREDENTIALS)

> [!IMPORTANT]
> **MẬT KHẨU DÙNG CHUNG CHO TẤT CẢ CÁC TÀI KHOẢN MẪU:**  
> 🔑 **`123456789@`** *(Đã đồng bộ hóa 100% trên Supabase Cloud Database & hỗ trợ cả `Rikkei@123`)*

| Phân Hệ | Đường Dẫn Truy Cập (URL) | Tài Khoản Đăng Nhập (Email / SĐT) | Mật Khẩu Mẫu | Vai Trò (Role) & Quyền Hạn |
| :--- | :--- | :--- | :---: | :--- |
| **👑 Quản Trị Sàn Tổng (Admin Portal)** | [`/admin/login`](http://localhost:5173/admin/login) | • `admin@traveleasy.vn`<br>• `daiphat.admin@traveleasy.vn` *(Nguyễn Đại Phát)*<br>• `phanthanhphong.admin@traveleasy.vn`<br>• `admin@gmail.com` | **`123456789@`** | **`ADMIN`** — Toàn quyền Quản trị sàn, xem Dashboard doanh thu/KPI, duyệt đối tác nhà xe, quản lý 480 chuyến xe, kiểm tra Audit Logs và cài đặt Gateway |
| **🚍 Cổng Đối Tác Nhà Xe (Company Portal)** | [`/company/login`](http://localhost:5173/company/login) | • `operator@futa.vn` / `futa@gmail.com` *(Phương Trang)*<br>• `dieuhanh@thanhbuoi.com.vn` *(Thành Bưởi)*<br>• `dieuhanh@hoamaivungtau.com.vn` *(Hoa Mai)*<br>• `dieuhanh@xesaoviet.com.vn` *(Sao Việt)*<br>• `partner@traveleasy.vn` *(TravelEasy Express)* | **`123456789@`** | **`OPERATOR`** — Quản lý lịch chạy xe, sơ đồ ghế 2 tầng, danh sách hành khách đặt vé theo thời gian thực và theo dõi quyết toán doanh thu |
| **👤 Cổng Khách Hàng (Customer Portal)** | [`/login`](http://localhost:5173/login) | • `customer@gmail.com` *(SĐT: `0912345678`)*<br>• `tranthib@gmail.com`<br>• `lehoangc@gmail.com`<br>• `phamcongthanhvn2k6@gmail.com` | **`123456789@`** | **`CUSTOMER`** — Đặt vé xe trực tuyến, chọn vị trí ghế tầng 1/tầng 2, áp dụng mã giảm giá voucher, thanh toán VNPay/COD, quản lý vé và đánh giá chuyến đi |
| **📷 Quét Mã QR Xác Thực Vé Đa Năng** | [`/scanner`](http://localhost:5173/scanner) | *Không cần đăng nhập (Công khai)* | — | Quét camera/webcam điện thoại & máy tính, tải ảnh QR hoặc nhập mã vé để xác thực tính hợp lệ và check-in lên xe |

> [!TIP]
> **Dữ Liệu Thử Nghiệm Tra Cứu Vé & In Vé Điện Tử Có Sẵn:**
> * **Mã đặt vé (Booking Code)**: `BKG-20261025-001` (Khách hàng Nguyễn Văn Du Khách - Ghế A01, A02)
> * **Mã vé con (Ticket Code)**: `TK-20261025-001-A01` hoặc `TK-20261025-001-A02`
> * **Trang tra cứu tức thì**: [`http://localhost:5173/lookup`](http://localhost:5173/lookup) (Hỗ trợ tra cứu Offline, vẽ lộ trình di chuyển thời gian thực và tải vé PDF kèm mã QR)

---

## 🎯 MỤC LỤC TỔNG HỢP

1. [TỔNG QUAN DỰ ÁN & TIÊU CHÍ ĐÁNH GIÁ 100 ĐIỂM](#1-tổng-quan-dự-án--tiêu-chí-đánh-giá-100-điểm)
   - 1.1 Bối cảnh bài toán vận tải hành khách liên tỉnh
   - 1.2 Giải pháp nền tảng TravelEasy Platform
   - 1.3 Bảng phân bổ điểm số tốt nghiệp (Rubric 100/100 điểm)
2. [CƠ CẤU NHÂN SỰ, PHÂN CHIA PHÂN HỆ & KIẾN TRÚC ĐIỀU HƯỚNG THEO NĂNG LỰC](#2-cơ-cấu-nhân-sự-phân-chia-phân-hệ--kiến-trúc-điều-hướng-theo-năng-lực)
   - 2.1 Kiến trúc Phân định 2 Phân hệ Lớn (Two-Portal Architecture)
   - 2.2 Đánh giá Thiết kế: "Quản lý các đường dẫn bằng 1 Router Controller có phù hợp không?"
   - 2.3 Bản Đồ Tổng Thể Các Trang Của Dự Án TravelEasy (Full Sitemap V4 - 3 Phân Hệ Doanh Nghiệp)
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
    - 4.7 Quy Trình Nộp Đơn Đối Tác & Trung Tâm Thẩm Định Pháp Lý KYB (Partner Onboarding & KYB Center)
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
9. [QUY CHUẨN LÀM VIỆC VỚI GIT & BỘ NGUYÊN TẮC PHÂN NHÁNH - COMMIT CHUẨN DOANH NGHIỆP](#9-quy-chuẩn-làm-việc-với-git--bộ-nguyên-tắc-phân-nhánh---commit-chuẩn-doanh-nghiệp)
   - 9.1 Triết lý & Bộ nguyên tắc cốt lõi (Core Git Principles)
   - 9.2 Mô hình phân nhánh chuẩn Enterprise Git Flow (Branching Strategy)
   - 9.3 Quy chuẩn đặt tên nhánh (Branch Naming Convention & Matrix Phân Công Thành Viên)
   - 9.4 Quy chuẩn đặt tên commit (Conventional Commits 1.0.0 & Bảng Tra Cứu Scope)
   - 9.5 Bảng nguyên tắc Do's and Don'ts khi thao tác Git
   - 9.6 Quy trình 7 bước làm việc hàng ngày của lập trình viên (Daily Workflow Standard)
   - 9.7 Mẫu Pull Request chuẩn & Bộ tiêu chí đánh giá Code Review (PR Quality Gate)
   - 9.8 Cấu hình Branch Protection Rules trên GitHub & Quản lý Bảo mật Secret Zero-Leakage
   - 9.9 Cẩm nang xử lý xung đột mã nguồn chuyên sâu (Deep Merge Conflict Resolution)
   - 9.10 Bảng tra cứu nhanh lệnh Git thường dùng (Git Daily Cheat Sheet)
10. [KỊCH BẢN DEMO BẢO VỆ TỐT NGHIỆP 100/100 ĐIỂM (15 PHÚT)](#10-kịch-bản-demo-bảo-vệ-tốt-nghiệp-100100-điểm-15-phút)
11. [BÁO CÁO NGHIỆM THU BACKEND API (30/30 PASS) & HỆ THỐNG MINH CHỨNG GIAO DIỆN (UI EVIDENCE GALLERY)](#11-báo-cáo-nghiệm-thu-backend-api-3030-pass--hệ-thống-minh-chứng-giao-diện-ui-evidence-gallery)
    - 11.1 Ma trận nghiệm thu 30 API Backend cốt lõi (100% Pass)
    - 11.2 Minh chứng Giao diện Người dùng (User / Customer Journey)
    - 11.3 Minh chứng Giao diện Quản trị Hệ thống (Admin Portal Journey)
    - 11.4 Minh chứng Giao diện & Kiểm soát Đối tác Nhà xe (Company Portal & Security Guard)
    - 11.11 Hệ Thống Nâng Cấp Toàn Diện (Phase 1, 2, 3): Bộ Tính Năng Enterprise Đột Phá 2026
12. [HƯỚNG DẪN TOÀN DIỆN CHO THÀNH VIÊN: TEST TÍNH NĂNG, CHỤP ẢNH MINH CHỨNG & LẬP BIÊN BẢN NGHIỆM THU (DEADLINE HẾT NGÀY MAI)](#12-hướng-dẫn-toàn-diện-cho-thành-viên-test-tính-năng-chụp-ảnh-minh-chứng--lập-biên-bản-nghiệm-thu-deadline-hết-ngày-mai)
    - 12.1 Thông báo chỉ đạo từ Nhóm trưởng & Mục tiêu nghiệm thu toàn sàn
    - 12.2 Quy trình 7 bước "Đường đi nước bước" dành cho thành viên nhóm
    - 12.3 Ma trận phân công kiểm thử nghiệm thu theo Trang chức năng (Page-Based Ownership)
    - 12.4 Quy chuẩn chụp ảnh màn hình & đặt tên file minh chứng vào docs/screenshots/
    - 12.5 Hướng dẫn lập file Biên bản nghiệm thu và nộp Pull Request

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

### 2.1 Kiến trúc Phân định 3 Phân hệ Doanh nghiệp & Phân công Nhân sự OJT Chuẩn Theo Trang Chức Năng (Page-Based Ownership)

Để tối ưu hóa năng suất, xóa bỏ triệt để xung đột mã nguồn và tuân thủ nguyên tắc **"Phân chia trọn gói theo từng Trang chức năng (End-to-End Page Ownership: Giao diện + Nghiệp vụ Backend + APIs)"**, dự án phân bổ rõ ràng ranh giới giữa các thành viên: **Phạm Công Thành, Nguyễn Đại Phát, Phạm Thanh Phong** gánh vác khối lượng lớn nhất, đóng gói nhiều trang nhất; **Trần Minh Đức** và **Đoàn Nhật Cường** phụ trách các trang khách hàng & truyền thông tương ứng; **Phan Trung Kiên** được miễn thực tập OJT:

1. **Phân hệ 1: COMPANY / OPERATOR PORTAL (Cổng Đối Tác Nhà Xe — 10 Trang Trọn Gói)**:
   - **Đảm nhận**: **Phạm Công Thành** (Nhóm trưởng / System Architect & Tech Lead) — *Khối lượng lớn nhất*.
   - **10 Trang chức năng End-to-End**: Đăng nhập nhà xe (`/company/login`), Dashboard đối tác (`/company/dashboard`), Lịch chạy & mở bán chuyến (`/company/trips`), Danh sách khách đi xe (`/company/bookings`), Quản lý đội xe (`/company/vehicles`), Điểm đón/trả riêng (`/company/locations`), Tuyến khai thác (`/company/routes`), Đối soát doanh thu sàn 10% (`/company/settlements`), Chính sách hoàn hủy riêng (`/company/cancellation-policies`), Chăm sóc & phản hồi đánh giá (`/company/reviews`).
   - **Trụ cột Kiến trúc & Hạ tầng**: CSDL 36 bảng chuẩn hóa trên Supabase Cloud Database, Bảo mật Stateless JWT Bearer & Spring Security RBAC phân quyền 3 vai trò, Container hóa Docker Compose và Pipeline CI/CD GitHub Actions.

2. **Phân hệ 2: ADMIN PORTAL CỐT LÕI (Cổng Quản Trị Sàn Tổng — 10 Trang Trọng Yếu)**:
   - **Đảm nhận**: **Nguyễn Đại Phát** (Full-Stack Developer phụ trách Admin Lead) — *Khối lượng lớn*.
   - **10 Trang chức năng End-to-End**: Đăng nhập Admin (`/admin/login`), Dashboard điều hành toàn sàn 4 KPIs (`/admin/dashboard`), Quản lý & giám sát 480 chuyến xe toàn quốc (`/admin/trips`), Quản trị người dùng & RBAC chống xóa Admin tối cao (`/admin/users`), Phê duyệt & quản lý hồ sơ nhà xe (`/admin/bus-companies`), Quản lý 25+ tuyến đường liên tỉnh (`/admin/routes`), Quản lý tất cả đơn vé sàn (`/admin/bookings`), Quyết toán tài chính & Escrow (`/admin/settlements`), Chính sách hoàn hủy chuẩn sàn (`/admin/cancellation-policies`), Vết kiểm toán bất biến bảo mật (`/admin/audit-logs`).

3. **Khối Lõi Nghiệp Vụ Chịu Tải Cao & Master Data Xe (Core Transaction & Vehicle Engine — 6 Trang Phức Tạp)**:
   - **Đảm nhận**: **Phạm Thanh Phong** (Full-Stack Developer) — *Khối lượng lớn*.
   - **6 Trang chức năng End-to-End**: 
     - **Trang Khách hàng Lõi**: Tìm kiếm chuyến xe đa chiều & Sơ đồ ghế 2 tầng 34 chỗ VIP Limousine tích hợp Thuật toán Pessimistic Lock (`/search`), Xác nhận đặt vé & Thanh toán đa kênh an toàn VietQR/VNPAY/COD (`/checkout`).
     - **Trang Master Data Kỹ thuật**: Danh mục bến xe toàn quốc (`/admin/locations`), Quản lý hạng ghế & đơn giá phụ thu (`/admin/seat-types`), Thiết kế mẫu sơ đồ xe 34 chỗ & 22 phòng (`/admin/seat-templates`), Cấu hình kích hoạt cổng thanh toán (`/admin/gateways`).

4. **Khối Trải Nghiệm Khách Hàng & Quản Lý Vé Cá Nhân (Customer Portal — 4 Trang)**:
   - **Đảm nhận**: **Trần Minh Đức** (Full-Stack Developer).
   - **4 Trang chức năng End-to-End**: Quản lý vé của tôi & Hủy vé hoàn tiền tự động (`/my-tickets`), Hồ sơ cá nhân & Đổi mật khẩu (`/profile`), Đăng nhập & Đăng ký tài khoản khách hàng (`/login`, `/register`), Kho khuyến mại Voucher ưu đãi (`/promotions`).

5. **Khối Truyền Thông, Tra Cứu Offline & Soát Vé Di Động (Mobile & Media Specialist — 5 Trang)**:
   - **Đảm nhận**: **Đoàn Nhật Cường** (Frontend & Mobile Specialist).
   - **5 Trang chức năng End-to-End**: Trang chủ TravelEasy (`/`), Tra cứu vé điện tử Offline & Bản đồ lộ trình di chuyển (`/lookup`), 📷 Quét mã QR soát vé camera thời gian thực (`/scanner`), Lịch trình xe chạy toàn quốc (`/schedule`), Đánh giá khách hàng & Cẩm nang FAQ (`/reviews`, `/guide`; kèm `/admin/banners` & `/admin/reviews`).

6. **Miễn thực tập OJT**:
   - **Phan Trung Kiên**: **Miễn thực tập OJT (Exempted from OJT)** theo quyết định và quy định đào tạo của Nhà trường / Doanh nghiệp — Không nhận phân công task trong dự án.

```
+-------------------------------------------------------------------------------------------------------------------------+
|                              TRAVELEASY PLATFORM — ARCHITECTURAL SITEMAP THEO TRANG CHỨC NĂNG (34 TRANG)                |
+-------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                         |
|  [PHÂN HỆ 1: COMPANY PORTAL] (10 Trang)      [PHÂN HỆ 2: ADMIN PORTAL] (10 Trang)      [PHÂN HỆ 3: USERS & MASTER]      |
|  Phụ trách: PHẠM CÔNG THÀNH (10 Trang)       Phụ trách: NGUYỄN ĐẠI PHÁT (10 Trang)     Phụ trách: PHONG (6), ĐỨC (4),   |
|  (Kèm Trụ cột Core Architecture & DevOps)    (Khối Vận Hành Sàn Tổng Toàn Quốc)        CƯỜNG (5 Trang)                  |
|                                                                                                                         |
|  C1. Đăng nhập Nhà xe (/company/login)       A1. Đăng nhập Admin (/admin/login)        P1. Tìm kiếm & Ghế VIP (/search) |
|  C2. Dashboard Đối tác (/company/dashboard)  A2. Dashboard Toàn Sàn (/admin/dashboard) P2. Checkout Thanh Toán (/checkout)  |
|  C3. Lịch Chạy & Mở Bán (/company/trips)     A3. Quản Lý 480 Chuyến (/admin/trips)     P3. Master Data Bến (/admin/loc) |
|  C4. Danh Sách Khách Đi (/company/bookings)  A4. Quản Trị Người Dùng (/admin/users)    P4. Hạng Ghế & Giá (/admin/seat) |
|  C5. Quản Lý Đội Xe (/company/vehicles)      A5. Duyệt Nhà Xe (/admin/bus-companies)   P5. Mẫu Sơ Đồ Xe (/admin/tmpl)   |
|  C6. Điểm Đón/Trả Riêng (/company/locations) A6. Tuyến Đường Liên Tỉnh (/admin/routes) P6. Cổng Gateway (/admin/gate)   |
|  C7. Tuyến Khai Thác (/company/routes)       A7. Quản Lý Tất Cả Vé (/admin/bookings)  --------------------------------  |
|  C8. Quyết Toán Hãng (/company/settlements)  A8. Quyết Toán Sàn (/admin/settlements)   D1. Vé Của Tôi (/my-tickets)     |
|  C9. Chính Sách Hủy Vé (/company/cancel)     A9. Chính Sách Hoàn Hủy Sàn Chuẩn         D2. Hồ Sơ Cá Nhân (/profile)     |
|  C10. Phản Hồi Đánh Giá (/company/reviews)   A10. Vết Kiểm Toán (/admin/audit-logs)    D3. Đăng Nhập/Ký (/login)        |
|                                                                                        D4. Kho Khuyến Mãi (/promotions) |
|                                                                                        --------------------------------  |
|                                                                                        M1. Trang Chủ TravelEasy (/)     |
|                                                                                        M2. Tra Cứu Offline (/lookup)    |
|                                                                                        M3. 📷 Quét Mã QR (/scanner)     |
|                                                                                        M4. Lịch Trình Xe (/schedule)    |
|                                                                                        M5. Đánh Giá & FAQ (/reviews)    |
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

### 2.3 🗺️ BẢN ĐỒ TỔNG THỂ CÁC TRANG CỦA DỰ ÁN TRAVELEASY (FULL SITEMAP V4 — 3 PHÂN HỆ DOANH NGHIỆP)

```mermaid
flowchart TD
    App["🚀 TRAVELEASY PLATFORM"]
    
    App --> PublicPortal["🌐 PHÂN HỆ 1: KHÁCH HÀNG & CÔNG CỘNG (11 Trang)"]
    App --> CompanyPortal["🚍 PHÂN HỆ 2: CỔNG ĐỐI TÁC NHÀ XE (9 Trang)"]
    App --> AdminPortal["👑 PHÂN HỆ 3: CỔNG QUẢN TRỊ SÀN TỔNG (14 Trang)"]
    
    PublicPortal --> P1["Trang Chủ (/)"]
    PublicPortal --> P2["Tìm Kiếm & Ghế (/search)"]
    PublicPortal --> P3["Thanh Toán Đặt Vé (/checkout)"]
    PublicPortal --> P4["Tra Cứu Vé & Lộ Trình (/lookup)"]
    PublicPortal --> P5["Vé Của Tôi (/my-tickets)"]
    PublicPortal --> P6["Quét Mã QR Vé (/scanner)"]
    
    CompanyPortal --> C1["Dashboard Nhà Xe (/company/dashboard)"]
    CompanyPortal --> C2["Quản Lý Chuyến Xe (/company/trips)"]
    CompanyPortal --> C3["Danh Sách Hành Khách (/company/bookings)"]
    CompanyPortal --> C4["Quyết Toán Doanh Thu (/company/settlements)"]
    
    AdminPortal --> A1["Dashboard Toàn Sàn (/admin/dashboard)"]
    AdminPortal --> A2["Quản Lý 480 Chuyến (/admin/trips)"]
    AdminPortal --> A3["Quản Trị Người Dùng (/admin/users)"]
    AdminPortal --> A4["Duyệt Nhà Xe (/admin/bus-companies)"]
    AdminPortal --> A5["Vết Kiểm Toán (/admin/audit-logs)"]
```

#### 🌐 PHÂN HỆ 1: DÀNH CHO KHÁCH HÀNG & CÔNG CỘNG (11 TRANG)
*(Truy cập công khai hoặc chỉ cần đăng nhập tài khoản Khách hàng `CUSTOMER`)*

| STT | Tên Màn Hình | Đường Dẫn (URL) | Quyền Truy Cập | Chức Năng Cốt Lõi |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **Trang Chủ** | [`/`](http://localhost:5173/) | Công khai | Tìm kiếm chuyến xe nhanh (Nơi đi, Nơi đến, Ngày đi), Banner khuyến mại Cloudinary, Top tuyến đường phổ biến, Cẩm nang xe khách. |
| **2** | **Tìm Kiếm Chuyến & Sơ Đồ Ghế** | [`/search`](http://localhost:5173/search) | Công khai | Bộ lọc đa chiều (Giá vé, Giờ đi, Nhà xe, Điểm đón, Đánh giá ⭐), **Hiển thị sơ đồ ghế 2 tầng 34 chỗ thời gian thực**, chọn điểm đón/trả và đặt vé nhanh. *(Tích hợp Cache SWR tải trong 0ms)* |
| **3** | **Thanh Toán & Đặt Vé** | [`/checkout`](http://localhost:5173/checkout) | Khách hàng | Điền thông tin hành khách, áp mã Voucher giảm giá, chọn phương thức thanh toán (**VNPay, MoMo, VietQR, Tiền mặt COD**), đếm ngược giữ ghế 10 phút. |
| **4** | **Tra Cứu Vé & In Vé Điện Tử** | [`/lookup`](http://localhost:5173/lookup) | Công khai | Tra cứu theo Mã đặt vé (`BK-*`) hoặc SĐT. Hiển thị vé điện tử, **Mã QR Code lên xe**, **Bản đồ lộ trình di chuyển thời gian thực**, hỗ trợ lưu vé Offline không cần mạng. |
| **5** | **Quản Lý Vé Của Tôi** | [`/my-tickets`](http://localhost:5173/my-tickets) | `CUSTOMER` | Xem toàn bộ lịch sử vé đã mua của tài khoản cá nhân, xem trạng thái vé (`ISSUED`, `USED`, `CANCELLED`), yêu cầu hủy vé & hoàn tiền online. |
| **6** | **📷 Quét Mã QR Vé Đa Năng** | [`/scanner`](http://localhost:5173/scanner) | Công khai | **Quét camera/webcam điện thoại & laptop**, tải ảnh chụp mã QR hoặc nhập mã vé. Xác thực tính hợp lệ của vé và bấm nút **"Xác nhận Check-in lên xe"** theo thời gian thực. |
| **7** | **Đăng Nhập / Đăng Ký** | [`/login`](http://localhost:5173/login) | Công khai | Xác thực JWT Token, đăng ký tài khoản khách hàng mới, nút bấm điền nhanh tài khoản mẫu (`customer@gmail.com`). |
| **8** | **Hồ Sơ Cá Nhân** | [`/profile`](http://localhost:5173/profile) | `CUSTOMER` | Cập nhật họ tên, số điện thoại, đổi mật khẩu bảo mật, xem số dư và thông tin tài khoản. |
| **9** | **Lịch Trình Toàn Quốc** | [`/schedule`](http://localhost:5173/schedule) | Công khai | Bảng giờ xuất bến định kỳ, thông tin chi tiết các tuyến đường 3 miền (cự ly km, thời gian di chuyển dự kiến, danh sách trạm đón/trả). |
| **10** | **Khuyến Mãi & Voucher** | [`/promotions`](http://localhost:5173/promotions) | Công khai | Kho mã giảm giá (Voucher 20k, 50k, 100k, giảm 15%), nút sao chép mã ưu đãi nhanh, điều khoản áp dụng theo từng chặng. |
| **11** | **Đánh Giá & Nhận Xét** | [`/reviews`](http://localhost:5173/reviews) | Công khai | Tổng hợp đánh giá sao, nhận xét trải nghiệm thực tế từ hành khách, hình ảnh xe, phản hồi từ các đối tác nhà xe. |

---

#### 🚍 PHÂN HỆ 2: CỔNG ĐỐI TÁC NHÀ XE (COMPANY PORTAL - 9 TRANG)
*(Dành riêng cho các Hãng xe vận tải như Phương Trang, Thành Bưởi, Hoa Mai... — Role `OPERATOR`)*

| STT | Tên Màn Hình | Đường Dẫn (URL) | Chức Năng Cốt Lõi |
| :---: | :--- | :--- | :--- |
| **12** | **Đăng Nhập Nhà Xe** | [`/company/login`](http://localhost:5173/company/login) | Đăng nhập tài khoản điều hành nhà xe (`operator@futa.vn`, `dieuhanh@thanhbuoi.com.vn`...). |
| **13** | **Dashboard Đối Tác** | [`/company/dashboard`](http://localhost:5173/company/dashboard) | Thống kê doanh thu bán vé riêng của hãng, số lượt khách đã phục vụ, số chuyến đang chạy hôm nay, tỷ lệ lấp đầy ghế. |
| **14** | **Lịch Chạy & Mở Bán Chuyến** | [`/company/trips`](http://localhost:5173/company/trips) | Quản lý toàn bộ chuyến xe của hãng, thêm chuyến mới, gán biển số xe, mở bán vé, điều chỉnh giá vé dịp Lễ/Tết. |
| **15** | **Danh Sách Khách Đi Xe** | [`/company/bookings`](http://localhost:5173/company/bookings) | Xem danh sách hành khách theo từng chuyến xe, số ghế, điểm đón, điểm trả, số điện thoại, trạng thái thanh toán & check-in. |
| **16** | **Quản Lý Đội Xe Vận Tải** | [`/company/vehicles`](http://localhost:5173/company/vehicles) | Quản lý danh mục phương tiện (Xe Limousine 34 phòng, Xe Giường Nằm, Xe Ghế VIP), biển số xe, trạng thái hoạt động/bảo dưỡng. |
| **17** | **Điểm Đón / Trả Riêng** | [`/company/locations`](http://localhost:5173/company/locations) | Cấu hình các văn phòng, trạm trung chuyển, trạm dừng chân riêng của nhà xe trên từng tuyến đường. |
| **18** | **Tuyến Đường Khai Thác** | [`/company/routes`](http://localhost:5173/company/routes) | Danh sách các tuyến đường nhà xe đã đăng ký và được Sàn TravelEasy phê duyệt hoạt động. |
| **19** | **Quyết Toán Doanh Thu** | [`/company/settlements`](http://localhost:5173/company/settlements) | Bảng kê đối soát doanh thu bán vé, số tiền hoa hồng sàn giữ lại (phí sàn 10%), số tiền thực nhận về tài khoản ngân hàng nhà xe. |
| **20** | **Chăm Sóc & Phản Hồi Đánh Giá** | [`/company/reviews`](http://localhost:5173/company/reviews) | Đọc các đánh giá của khách hàng đi xe của mình và gửi phản hồi giải đáp thắc mắc. |

---

#### 👑 PHÂN HỆ 3: CỔNG QUẢN TRỊ SÀN TỔNG (ADMIN PORTAL - 13 TRANG)
*(Dành riêng cho Ban Giám Đốc và Quản Trị Viên Sàn — Role `ADMIN`)*

| STT | Tên Màn Hình | Đường Dẫn (URL) | Chức Năng Cốt Lõi |
| :---: | :--- | :--- | :--- |
| **21** | **Đăng Nhập Quản Trị Viên** | [`/admin/login`](http://localhost:5173/admin/login) | Cổng đăng nhập bảo mật của Quản trị viên (`admin@traveleasy.vn`, mật khẩu: `123456789@`). |
| **22** | **Dashboard Tổng Quan Sàn** | [`/admin/dashboard`](http://localhost:5173/admin/dashboard) | Trung tâm điều hành toàn sàn: Tổng doanh thu (GMV), Tổng số vé bán ra, Biểu đồ doanh thu 12 tháng, Top 5 nhà xe xuất sắc nhất. |
| **23** | **Quản Lý Chuyến Xe Toàn Sàn** | [`/admin/trips`](http://localhost:5173/admin/trips) | Quản lý và giám sát toàn bộ 480 chuyến xe trên cả nước, can thiệp khẩn cấp (hủy chuyến do thời tiết, đổi lịch xe, đổi tài xế). |
| **24** | **Quản Trị Người Dùng & RBAC** | [`/admin/users`](http://localhost:5173/admin/users) | Quản lý danh sách tài khoản toàn hệ thống, phân quyền vai trò (**ADMIN, OPERATOR, CUSTOMER**), khóa / mở khóa tài khoản (`ACTIVE` / `LOCKED`). *(Có cơ chế chống xóa Admin tối cao)* |
| **25** | **Quản Lý Đối Tác Nhà Xe** | [`/admin/bus-companies`](http://localhost:5173/admin/bus-companies) | Phê duyệt hồ sơ nhà xe mới đăng ký lên sàn, quản lý hợp đồng, hotline, logo Cloudinary, tạm ngừng hợp tác nhà xe vi phạm. |
| **26** | **Quản Lý Tuyến Đường Liên Tỉnh** | [`/admin/routes`](http://localhost:5173/admin/routes) | Quản lý danh mục 25+ tuyến đường trọng điểm, khoảng cách km, thời gian chạy, gán nhà xe vận hành. |
| **27** | **Quản Lý Tất Cả Đơn Vé** | [`/admin/bookings`](http://localhost:5173/admin/bookings) | Tra cứu toàn bộ giao dịch đặt vé trên sàn, kiểm tra mã đơn, lịch sử thanh toán, phê duyệt hoàn tiền vé hủy. |
| **28** | **Quyết Toán Tài Chính Sàn** | [`/admin/settlements`](http://localhost:5173/admin/settlements) | Kiểm soát dòng tiền, tạo kỳ quyết toán chi trả cho các nhà xe đối tác, quản lý thông tin tài khoản ngân hàng thụ hưởng. |
| **29** | **Quản Lý Danh Mục Bến Xe** | [`/admin/locations`](http://localhost:5173/admin/locations) | Dữ liệu gốc (Master Data) các bến xe lớn toàn quốc: Bến xe Miền Đông, Bến xe Miền Tây, Bến xe Mỹ Đình, Giáp Bát, Nước Ngầm... |
| **30** | **Quản Lý Loại Ghế & Giá Phụ Thu**| [`/admin/seat-types`](http://localhost:5173/admin/seat-types) | Cấu hình các hạng ghế trên sàn: `STANDARD`, `VIP`, `LIMOUSINE`, `SLEEPER` kèm đơn giá phụ thu và tiện ích đi kèm. |
| **31** | **Quản Lý Mẫu Sơ Đồ Xe** | [`/admin/seat-templates`](http://localhost:5173/admin/seat-templates) | Thiết kế bố cục sơ đồ xe 2 tầng 34 chỗ, xe Limousine 22 phòng, xe ghế ngồi 45 chỗ để các nhà xe áp dụng. |
| **32** | **Cấu Hình Cổng Thanh Toán** | [`/admin/gateways`](http://localhost:5173/admin/gateways) | Bật / tắt và quản lý API Key của các cổng thanh toán điện tử: VNPay, PayOS, MoMo, VietQR và phương thức Tiền mặt COD. |
| **33** | **Quản Lý Banner Quảng Cáo** | [`/admin/banners`](http://localhost:5173/admin/banners) | Quản lý hình ảnh banner trang chủ tải lên Cloudinary, gắn link khuyến mại, kích hoạt / ẩn banner theo mùa vụ. |
| **34** | **Kiểm Duyệt Đánh Giá Khách Hàng**| [`/admin/reviews`](http://localhost:5173/admin/reviews) | Xử lý các báo cáo vi phạm đánh giá, ẩn bình luận độc hại, giữ môi trường đánh giá minh bạch, khách quan. |
| **35** | **Chính Sách Hoàn Hủy Sàn** | [`/admin/cancellation-policies`](http://localhost:5173/admin/cancellation-policies) | Quy định chính sách hoàn tiền chuẩn của sàn: Hoàn 100% trước 24h, hoàn 50% trước 12h, không hoàn sau giờ xe chạy. |
| **36** | **Vết Kiểm Toán Bất Biến (Audit Log)**| [`/admin/audit-logs`](http://localhost:5173/admin/audit-logs) | Bản ghi lịch sử hoạt động bảo mật bất biến (Append-only): Ghi nhận chi tiết mọi hành vi tạo/sửa/xóa của Admin và Nhà xe (ai thực hiện, thời gian, IP, dữ liệu trước và sau khi thay đổi). |

---

### 2.4 Bảng Phân Công Nhiệm Vụ Thành Viên Theo Trang Chức Năng (Page-Based RACI V5)

> **Nguyên tắc phân chia cốt lõi:**  
> Toàn bộ 34 trang chức năng của hệ thống được đóng gói trọn vẹn theo từng thành viên phụ trách (End-to-End: Giao diện React + Backend Controller/Service + APIs).  
> **Phạm Công Thành, Nguyễn Đại Phát, Phạm Thanh Phong** gánh vác khối lượng lớn nhất, đóng gói nhiều trang phức tạp nhất. **Trần Minh Đức** và **Đoàn Nhật Cường** phụ trách các trang khách hàng & truyền thông tương ứng. **Phan Trung Kiên** được miễn thực tập OJT.

| STT | Thành viên & Email | Phân hệ & Vai trò | Trang Chức Năng Phụ Trách (Full-Stack End-to-End) | Công việc Backend (Spring Boot 3) | Công việc Frontend (React 18) |
|:---:|:---|:---|:---|:---|:---|
| **1** | **Phạm Công Thành**<br/>`Phamcongt56@gmail.com`<br/>*(Nhóm trưởng / Architect)* | **CỔNG ĐỐI TÁC NHÀ XE (10 Trang) + CORE ARCHITECTURE** — *Khối lượng lớn nhất* | **Toàn bộ 10 Trang `/company/*`**: Login, Dashboard, Trips, Bookings, Vehicles, Locations, Routes, Settlements, Cancellation Policies, Reviews | • CSDL 36 bảng chuẩn hóa trên Supabase Cloud<br/>• Bảo mật JWT & Spring Security RBAC 3 vai trò<br/>• API Quản lý Chuyến xe của hãng & Danh sách khách đi xe<br/>• API Quyết toán doanh thu đối tác & Phí hoa hồng sàn 10%<br/>• Bảo vệ Tenant Isolation đa nhà xe an toàn<br/>• DevOps Docker, Containerization & CI/CD Pipeline | • Router `companyRoutes.tsx`<br/>• Sidebar điều hành nhà xe độc lập<br/>• Dashboard KPI đối tác thời gian thực<br/>• Quản lý lịch chạy, duyệt khách đi xe, quản lý đội xe, trạm dừng riêng và quyết toán doanh thu |
| **2** | **Nguyễn Đại Phát**<br/>`nguyendaiphat06@gmail.com`<br/>*(Full-Stack Developer)* | **CỔNG QUẢN TRỊ SÀN TỔNG ADMIN (10 Trang Cốt Lõi)** — *Khối lượng lớn* | **Toàn bộ 10 Trang `/admin/*`**: Login, Dashboard Toàn Sàn, Trips (480 chuyến), Users RBAC, Bus Companies, Routes, Bookings, Settlements, Cancellation Policies, Audit Logs | • Toàn bộ `Admin*Controller` & `AdminManagementService`<br/>• API Giám sát & Quản lý 480 chuyến xe toàn quốc<br/>• Quản trị Người dùng RBAC & Cơ chế chống xóa Admin tối cao<br/>• API Phê duyệt nhà xe & Tuyến đường liên tỉnh<br/>• API Quyết toán tài chính sàn & Vết kiểm toán bất biến `audit_logs` | • Router `adminRoutes.tsx`<br/>• Thanh điều hướng `AdminNav.tsx`<br/>• Dashboard điều hành toàn sàn 4 KPIs<br/>• Điều phối 10 trang quản trị cấp cao: Người dùng, Chuyến, Nhà xe, Tuyến, Vé, Quyết toán, Chính sách, Audit |
| **3** | **Phạm Thanh Phong**<br/>`thanhphong102006@gmail.com`<br/>*(Full-Stack Developer)* | **KHỐI LÕI ĐẶT VÉ CHỊU TẢI CAO & MASTER DATA XE (6 Trang)** — *Khối lượng lớn* | **6 Trang Nghiệp Vụ Nặng**: `/search` (Tìm kiếm & Ghế VIP), `/checkout` (Thanh toán đa kênh), `/admin/locations` (Bến xe), `/admin/seat-types` (Hạng ghế), `/admin/seat-templates` (Mẫu xe), `/admin/gateways` (Cổng thanh toán) | • `TripSearchController` & `TripService` (SWR Cache 0ms)<br/>• `SeatLockController` & `SeatLockService`<br/>• **Pessimistic Lock `@Lock(PESSIMISTIC_WRITE)`** chống race condition trùng ghế<br/>• Đồng hồ đếm lùi giữ chỗ 10:00 (TTL) tự động nhả ghế<br/>• Cổng thanh toán VietQR động PayOS & VNPAY qua `@Transactional(SERIALIZABLE)`<br/>• Master Data bến xe, sơ đồ xe 34 chỗ và gateways | • Giao diện Tìm kiếm chuyến xe & Bộ lọc đa chiều<br/>• Sơ đồ 34 phòng Limousine VIP 2 tầng trực quan<br/>• Đồng hồ đếm ngược 10:00 đổi màu đỏ cảnh báo hết giờ<br/>• Màn hình Checkout chọn điểm đón/trả ETA & cổng thanh toán<br/>• Quản lý mẫu sơ đồ xe, hạng ghế và gateways trong Admin |
| **4** | **Trần Minh Đức**<br/>`2601minhduc@gmail.com`<br/>*(Full-Stack Developer)* | **KHỐI TRẢI NGHIỆM KHÁCH HÀNG & QUẢN LÝ VÉ CÁ NHÂN (4 Trang)** | **4 Trang Khách Hàng**: `/my-tickets` (Vé của tôi & Hủy vé hoàn tiền), `/profile` (Hồ sơ cá nhân), `/login` & `/register` (Đăng nhập/Ký), `/promotions` (Khuyến mại Voucher) | • `MyBookingsController` & `UserProfileController`<br/>• API Tra cứu lịch sử vé đã mua theo tài khoản khách hàng<br/>• API Hủy vé trực tuyến & Thuật toán hoàn tiền tự động theo mốc giờ chạy (>24h hoàn 95%, 12-24h hoàn 70%)<br/>• API Quản lý hồ sơ cá nhân và đổi mật khẩu an toàn<br/>• API Kho mã giảm giá Voucher | • Giao diện Vé của tôi (`/my-tickets`), xem lịch sử và nút hủy vé kèm popup xác nhận số tiền hoàn<br/>• Trang Hồ sơ cá nhân (`/profile`) & đổi mật khẩu<br/>• Trang Đăng nhập & Đăng ký khách hàng với nút điền nhanh tài khoản mẫu<br/>• Trang Kho khuyến mãi (`/promotions`) sao chép mã ưu đãi |
| **5** | **Đoàn Nhật Cường**<br/>`Cuongclasspurpose@gmail.com`<br/>*(Frontend & Mobile Specialist)* | **KHỐI TRUYỀN THÔNG, TRA CỨU OFFLINE & SOÁT VÉ DI ĐỘNG (5 Trang)** | **5 Trang Trải Nghiệm Di Động**: `/` (Trang chủ), `/lookup` (Tra cứu Offline), `/scanner` (📷 Quét mã QR), `/schedule` (Lịch trình), `/reviews` & `/guide` (Đánh giá & FAQ; kèm `/admin/banners`, `/admin/reviews`) | • `TicketLookupController` & `TicketCheckinController`<br/>• API Tra cứu vé nhanh bằng SĐT hoặc Mã đơn `BK-*`<br/>• API Xác thực vé điện tử thời gian thực & Check-in lên xe (`POST /api/v1/tickets/checkin`)<br/>• API Đánh giá 1-5 sao ⭐ Verified Journey<br/>• API Banner Cloudinary trang chủ | • Trang chủ, Lịch trình xe 3 miền, Banner khuyến mại<br/>• Trang Tra cứu vé Offline qua LocalStorage & Lộ trình di chuyển<br/>• 📷 **Trang Quét mã QR vé bằng camera/webcam (`/scanner`) xác thực trong 0.2s**<br/>• Widget Đánh giá review & Trợ lý AI du lịch 24/7 |
| **6** | **Phan Trung Kiên**<br/>`phantrungkien2006@gmail.com`<br/>*(Sinh viên)* | **MIỄN THỰC TẬP OJT (EXEMPTED)** | *Được miễn OJT theo quyết định đào tạo của Nhà trường / Doanh nghiệp* | *Không nhận phân công task trong dự án* | *Không nhận phân công task trong dự án* |

---

### 2.5 Ma trận Trách nhiệm RACI V5 Theo Trang Chức Năng
* **R** (Responsible): Trực tiếp thực hiện Full-Stack trang chức năng (Giao diện + Controller + Service + APIs + Test)
* **A** (Accountable): Nhóm trưởng phê duyệt & chịu trách nhiệm chất lượng kiến trúc chung (**Phạm Công Thành**)
* **C** (Consulted): Tham vấn chuyên môn kỹ thuật
* **I** (Informed): Nhận thông báo tiến độ

| Phân hệ & Nhóm Trang Chức Năng | Thành (Lead) | Phát (Admin) | Phong (Core) | Đức (User) | Cường (Mobile) | Kiên (Miễn OJT) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **COMPANY PORTAL (10 Trang: Login, Dashboard, Chuyến, Khách, Đội xe, Trạm, Quyết toán, Chính sách, Review)** | **R / A** | I | I | I | I | *(Miễn OJT)* |
| **ADMIN PORTAL (10 Trang: Login, Dashboard Sàn, 480 Chuyến, User RBAC, Duyệt Hãng, Tuyến, Vé, Audit)** | **A** | **R** | I | I | I | *(Miễn OJT)* |
| **CORE BOOKING & MASTER DATA (6 Trang: Search & Ghế 2 Tầng VIP, Checkout Đa Kênh, Bến Xe, Hạng Ghế, Mẫu Xe, Gateway)** | **A** | I | **R** | C | I | *(Miễn OJT)* |
| **CUSTOMER & MY-TICKETS (4 Trang: Vé của tôi & Hủy vé, Hồ sơ cá nhân, Đăng nhập/Ký, Voucher khuyến mãi)** | **A** | I | C | **R** | I | *(Miễn OJT)* |
| **MOBILE, OFFLINE & SCANNER (5 Trang: Trang chủ, Tra cứu Offline, 📷 Quét mã QR Camera, Lịch trình, Review & FAQ)** | **A** | I | I | I | **R** | *(Miễn OJT)* |
| **Trụ cột Kiến trúc Hệ thống, Security JWT, DDL CSDL 36 Bảng Supabase Cloud & DevOps CI/CD** | **R / A** | C | C | C | C | *(Miễn OJT)* |

---

### 2.6 Kế Hoạch Sprint Backlog & 17 User Stories Chuẩn Agile Scrum (Trello Board)

> 📋 **Bảng Trello Trực Tuyến**: [TravelEasy_Platform | Trello Board](https://trello.com/b/AA5BYoe1/traveleasyplatform)  
> 🎨 **Bản Thiết Kế Stitch Trực Tuyến**: [TravelEasy UI Prototype | Stitch Project](https://stitch.withgoogle.com/projects/5774129554395496210?pli=1)

#### 🎯 Quy ước Cấu trúc Thẻ Task trên Trello:
* **Tiêu đề (Title)**: `({Điểm}) US-{Mã}: Là một {Vai trò}, tôi muốn {Hành động} để {Mục đích}` (Khớp 100% chuẩn Scrum & tiện ích Scrum for Trello).
* **Story Points theo Fibonacci**:
  * `(2)` - Rất dễ / Cơ bản (1 - 3 giờ): Giao diện tĩnh, CRUD cơ bản, không logic phức tạp (Đức, Cường phụ trách).
  * `(3)` - Trung bình (Nửa ngày - 1 ngày): Form validation, gọi API RESTful chuẩn, hiển thị chi tiết (Đức, Cường, Phát).
  * `(5)` - Khá phức tạp (1 - 1.5 ngày): Dynamic filter đa tiêu chí, sơ đồ xe tương tác (Phát, Phong, Đức).
  * `(8)` - Rất khó / Concurrency (1.5 - 2 ngày): Pessimistic Lock chống đặt trùng ghế, Giao dịch thanh toán an toàn `@Transactional(SERIALIZABLE)` (Phong, Đức, Phát, Thành).
* **Mỗi Task bao gồm 2 Checklist cụ thể**: **⚙️ Backend Checklist** và **🎨 Frontend Checklist**.

---

#### 📊 Bảng Tổng Hợp Phân Bổ 17 User Stories Chuẩn Theo Trang Chức Năng:

| Mã US | Phân hệ / Trang Phụ Trách | Tiêu đề User Story | Story Points | Thành viên phụ trách | Mức độ kỹ thuật |
|:---:|:---|:---|:---:|:---:|:---|
| **US-01** | **A0. Admin Dashboard** | Là một Quản trị viên, tôi muốn xem Dashboard 4 chỉ số KPI và bảng điều phối để nắm bắt tức thời tình hình vận hành của hệ thống | **(8)** | **Nguyễn Đại Phát** | Khó / Thống kê tổng hợp & Điều phối |
| **US-02** | **A1. Lịch trình & 480 Chuyến** | Là một Quản trị viên, tôi muốn giám sát và điều phối 480 chuyến xe toàn sàn, đổi trạng thái xuất bến/hủy chuyến để vận hành lịch trình xe chạy | **(8)** | **Nguyễn Đại Phát** | Khó / Thuật toán sinh ghế & State Machine |
| **US-03** | **A2. Đội xe & Nhà xe Đối tác** | Là một Quản trị viên, tôi muốn quản lý danh mục nhà xe đối tác và phê duyệt hồ sơ xe để kiểm soát đội xe trên hệ thống | **(5)** | **Nguyễn Đại Phát** | Vừa / CRUD Danh mục Đối tác & Xe |
| **US-04** | **A3. Tuyến đường Liên tỉnh** | Là một Quản trị viên, tôi muốn quản lý các tuyến đường 25+ chặng trọng điểm kèm mốc giờ ETA để tối ưu lộ trình xe di chuyển | **(5)** | **Nguyễn Đại Phát** | Vừa / Quản lý lộ trình & ETA Offset |
| **US-05** | **A4. Chính sách & Quyết toán Sàn** | Là một Quản trị viên, tôi muốn cấu hình bảng quy tắc hoàn tiền hủy vé sàn và tạo kỳ quyết toán tài chính để tự động hóa dòng tiền | **(5)** | **Nguyễn Đại Phát** | Khá / Cancellation Rules & Settlements |
| **US-06** | **A5. Người dùng & RBAC Chống Xóa** | Là một Quản trị viên, tôi muốn quản lý danh sách người dùng và phân quyền RBAC an toàn bằng JWT, có cơ chế chống xóa Admin tối cao | **(5)** | **Nguyễn Đại Phát** | Khá / Spring Security JWT & RBAC Guard |
| **US-07** | **A6. Vết Kiểm Toán Audit Logs** | Là một Quản trị viên, tôi muốn theo dõi nhật ký audit log bất biến để đảm bảo an toàn bảo mật và kiểm tra lịch sử thao tác toàn sàn | **(5)** | **Nguyễn Đại Phát** | Vừa / Append-Only Audit Trail |
| **US-08** | **P1. Tìm kiếm & Sơ đồ Ghế 2 Tầng** | Là một Khách hàng, tôi muốn tìm kiếm chuyến xe kết hợp bộ lọc nâng cao thời gian thực và xem sơ đồ 2 tầng 34 chỗ Limousine VIP | **(8)** | **Phạm Thanh Phong** | Khó / SWR Cache 0ms & 34-seat Map |
| **US-09** | **P2. Khóa Giữ Chỗ Concurrency 10:00** | Là một Khách hàng, tôi muốn hệ thống giữ chỗ độc quyền trong 10 phút có đồng hồ đếm ngược bằng Pessimistic Lock chống cướp vé | **(8)** | **Phạm Thanh Phong** | Rất khó / Pessimistic Write Lock |
| **US-10** | **P3. Checkout & Thanh Toán Đa Kênh** | Là một Khách hàng, tôi muốn xác nhận đặt vé, chọn điểm đón/trả và thanh toán đa kênh an toàn (VietQR, VNPAY, COD) qua giao dịch Serializable | **(8)** | **Phạm Thanh Phong** | Rất khó / Transactional Serializable |
| **US-11** | **P4. Master Data Bến Xe & Cấu Hình Xe** | Là một Kỹ sư hệ thống, tôi muốn quản lý danh mục bến xe toàn quốc, hạng ghế phụ thu và mẫu sơ đồ xe 34 chỗ để cấu hình dữ liệu xe | **(5)** | **Phạm Thanh Phong** | Khá / Master Data Locations & Seat Templates |
| **US-12** | **D1. Vé Của Tôi & Hủy Vé Tự Động** | Là một Khách hàng, tôi muốn xem lịch sử vé đã mua và thực hiện hủy vé online nhận hoàn tiền tự động theo chính sách giờ chạy | **(5)** | **Trần Minh Đức** | Khá / My Tickets & Auto Refund Algorithm |
| **US-13** | **D2. Hồ Sơ Khách Hàng & Đổi Mật Khẩu**| Là một Khách hàng, tôi muốn quản lý thông tin tài khoản cá nhân, cập nhật SĐT và đổi mật khẩu bảo mật thuận tiện | **(3)** | **Trần Minh Đức** | Dễ / Profile & Password Validation |
| **US-14** | **D3. Đăng Nhập/Ký & Kho Voucher** | Là một Khách hàng, tôi muốn đăng ký/đăng nhập nhanh bằng JWT và nhận các mã ưu đãi giảm giá chuyến đi | **(3)** | **Trần Minh Đức** | Dễ / JWT Auth & Voucher Clipboard |
| **US-15** | **M1. Trang Chủ & Lịch Trình Toàn Quốc** | Là một Khách hàng, tôi muốn tra cứu lịch trình xe chạy toàn quốc và xem các tuyến đường hot trên trang chủ hiện đại | **(5)** | **Đoàn Nhật Cường** | Vừa / Responsive UI & Nationwide Schedule |
| **US-16** | **M2. Tra Cứu Vé Offline & Bản Đồ** | Là một Khách hàng, tôi muốn tra cứu thông tin vé nhanh bằng SĐT hoặc mã đơn và xem được vé khi không có kết nối mạng Internet | **(5)** | **Đoàn Nhật Cường** | Khá / Offline LocalStorage Cache & Route Map |
| **US-17** | **M3. 📷 Quét Mã QR Soát Vé Camera** | Là một Nhân viên phụ xe / Hành khách, tôi muốn dùng camera quét trực tiếp mã QR trên vé để xác thực và Check-in lên xe trong 0.2s | **(5)** | **Đoàn Nhật Cường** | Khá / HTML5 QR Scanner & Instant Check-in |

---

#### Lộ Trình Phân Chia Sprint & Trạng Thái Đồng Bộ Bảng Trello Trực Tuyến:
> 📄 **Bảng Trello Live**: [https://trello.com/b/AA5BYoe1/traveleasyplatform](https://trello.com/b/AA5BYoe1/traveleasyplatform)  
> 📄 **Bộ tài liệu 4 Sprint chi tiết**: 
> - [docs/04-agile-and-sprints/SPRINT_1_README.md](docs/04-agile-and-sprints/SPRINT_1_README.md) — Sprint 1: Nền tảng Kiến trúc, CSDL & Master Data
> - [docs/04-agile-and-sprints/SPRINT_2_README.md](docs/04-agile-and-sprints/SPRINT_2_README.md) — Sprint 2: Core Booking Engine & Hai Cổng Quản Trị
> - [docs/04-agile-and-sprints/SPRINT_3_README.md](docs/04-agile-and-sprints/SPRINT_3_README.md) — Sprint 3: Kiểm Thử Tích Hợp, Soát Vé Di Động & Vận Hành
> - [docs/04-agile-and-sprints/SPRINT_4_README.md](docs/04-agile-and-sprints/SPRINT_4_README.md) — Sprint 4: Vận Hành Sẵn Sàng Sản Xuất & Lộ Trình Mở Rộng
> - [docs/04-agile-and-sprints/THIET_KE_LUONG_NGHIEP_VU_VA_DIEU_HUONG_SPRINT_4.md](docs/04-agile-and-sprints/THIET_KE_LUONG_NGHIEP_VU_VA_DIEU_HUONG_SPRINT_4.md) — Thiết Kế Luồng Đi Logic & Điểm Chạm 1-Click
> - [docs/03-api-and-deployment/HUONG_DAN_PHAN_CHIA_THU_MUC_CODE_NHOM_7.md](docs/03-api-and-deployment/HUONG_DAN_PHAN_CHIA_THU_MUC_CODE_NHOM_7.md) — Hướng Dẫn Phân Chia Thư Mục Code Cho Từng Thành Viên
> - [docs/02-architecture-and-db/MIGRATION_SPRINT_4_EXTENSIONS.sql](docs/02-architecture-and-db/MIGRATION_SPRINT_4_EXTENSIONS.sql) — Script CSDL 8 Bảng Mới & Cột Bổ Sung

| Sprint | Thời gian & Trọng tâm | Thẻ Trello | Story Points | Deliverables then chốt | Trạng thái Live |
|:---:|---|:---:|:---:|---|:---:|
| **Sprint 1** | **Foundation & Master Data**: Kiến trúc Modular Monolith, CSDL Supabase 36 bảng, Stateless JWT RBAC & Master Data xe | **53 Thẻ** | **175 SP** | CSDL 36 bảng chuẩn hóa, Spring Security 6 JWT Bearer 3 vai trò, Master Data bến xe toàn quốc & sơ đồ xe Limousine 34 phòng VIP, Docker Compose | **`Done Sprint 1` (53/53 - 100%)** |
| **Sprint 2** | **Core Booking & Full Portals Engine**: Đặt vé thời gian thực, Khóa giữ chỗ Pessimistic Lock 10:00, Thanh toán VietQR/VNPAY, Cổng Nhà xe 10 trang, Cổng Admin 10 trang | **53 Thẻ** | **169 SP** | SWR In-Memory Cache 0ms, Sơ đồ VIP 2 tầng, Pessimistic Lock `@Lock(PESSIMISTIC_WRITE)` chống cướp vé, VietQR PayOS & VNPAY Serializable, Cổng Nhà xe 10 trang, Cổng Admin 10 trang | **`Done Sprint 2` (53/53 - 100%)** |
| **Sprint 3** | **Integration Testing, QR Scanner & Readiness**: Kiểm thử tích hợp liên cổng E2E, Soát vé QR di động bằng camera (< 0.2s), Tra cứu vé ngoại tuyến, Mã tương quan Correlation ID, Endpoint `/health` | **54 Thẻ** | **216 SP** | Bộ test E2E liên cổng, Quét mã QR soát vé qua webcam/camera điện thoại (`/scanner`), Tra cứu vé Offline LocalStorage (`/lookup`), Correlation ID Filter tracing, Kiểm toán tài chính | **`Done S3`: 13 Thẻ (Thành đã xong)<br/>`Backlog S3`: 41 Thẻ (4 bạn đang làm)** |
| **Sprint 4** | **Bến Xe Thực Tế, Hợp Đồng Du Lịch & Mở Rộng**: Quầy vé bến xe của nhà xe, Thuê xe hợp đồng du lịch, Gửi hàng bưu kiện, GPS Live Tracking xe chạy, Kịch bản Demo Hub 15' | **Roadmap & Scaffold** | **Production Readiness** | 1. Quầy vé bến xe của Nhà xe POS 3 click (`/company/pos`) & Quản lý ca trực tiền mặt (`/company/pos/shifts`)<br/>2. Thuê xe hợp đồng du lịch đa kênh & Ký quỹ an toàn Escrow 30% (`/charter`)<br/>3. Ký gửi hàng hóa bưu kiện hầm xe (`/cargo`)<br/>4. Bản đồ GPS Live Tracking thời gian thực (`/tracking/:tripId`)<br/>5. Quản trị giá vé động Flash Sale (`/company/pricing-rules`) & Ví điểm EasyXu (`/rewards`) | **Sẵn sàng triển khai & Đã chuẩn bị thư mục** |

---

### 2.7 Thiết Kế Luồng Đi Logic & Điểm Chạm Không Bị Phi Lý Cho Sprint 4

> 💡 **Triết lý thiết kế Zero-Friction UX**: Dịch vụ xuất hiện đúng lúc, đúng chỗ theo đúng hành trình thực tế của hành khách và nhân viên bến xe:
> 1. **Khách hàng**: Header trang chủ có Tab Bar 1-chạm chuyển đổi `[Vé Xe Khách] [Thuê Xe Du Lịch] [Gửi Hàng] [Theo Dõi Xe]`. Trên vé điện tử `/my-tickets` có nút `[📍 Xem Xe Đang Tới Đâu]` mở thẳng bản đồ vệ tinh. Tại bước thanh toán `/checkout` có checkbox mua bảo hiểm 10k và cấn trừ điểm EasyXu.
> 2. **Nhân viên Quầy Bến Xe của Nhà Xe**: Vào Cổng Nhà xe (`/company`) có ngay nút mở chế độ POS (`/company/pos`) bán vé trong 3 click chuột, in vé nhiệt bill 80mm có mã QR và đóng/kết ca tiền mặt chống thất thoát.
> 3. **Ban Quản Trị Sàn**: Đứng giữa giữ 30% tiền cọc hợp đồng thuê xe (`/admin/charters`), chỉ giải ngân cho nhà xe khi chuyến đi hoàn tất an toàn.
>
> 👉 *Xem đặc tả chi tiết tại [docs/04-agile-and-sprints/THIET_KE_LUONG_NGHIEP_VU_VA_DIEU_HUONG_SPRINT_4.md](docs/04-agile-and-sprints/THIET_KE_LUONG_NGHIEP_VU_VA_DIEU_HUONG_SPRINT_4.md)*.


#### 👑 PHÂN HỆ QUẢN TRỊ (ADMIN PORTAL) — NGUYỄN ĐẠI PHÁT (7 USER STORIES)

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

##### 💺 Phạm Thanh Phong (Full-Stack Seat Inventory & Concurrency)

###### (8) US-10: Là một Khách hàng, tôi muốn xem sơ đồ 2 tầng xe Limousine trực quan để tự do chọn vị trí giường nằm ưng ý nhất
* **Mô tả (Description)**:
  * **Backend**: `GET /api/v1/trips/{id}/seats` (Trả về 34 ghế chia 2 tầng kèm trạng thái `AVAILABLE`, `LOCKED`, `BOOKED`).
  * **Frontend**: `BusSeatMap.tsx` & `SeatSelectionPage.tsx` (Vẽ 2 tầng xe Limousine với 3 mã màu: Xanh trống, Cam chọn, Xám đã bán).
* **Checklist**:
  * [x] [BE] Truy vấn danh sách ghế theo chuyến kèm giá vé từng ghế
  * [x] [BE] DTO `TripSeatResponse`
  * [x] [FE] Vẽ sơ đồ 2 tầng xe Limousine (Tầng 1 A01-A17, Tầng 2 B01-B17)
  * [x] [FE] Xử lý chọn/bỏ chọn tối đa 4 ghế và tự động tính tổng tiền tạm tính

###### (8) US-11: Là một Khách hàng, tôi muốn hệ thống giữ chỗ độc quyền trong 10 phút có đồng hồ đếm ngược để hoàn tất thủ tục thanh toán mà không sợ bị người khác cướp vé
* **Mô tả (Description)**:
  * **Backend**: `POST /api/v1/seats/lock` (Khóa bi quan `@Lock(LockModeType.PESSIMISTIC_WRITE)`, TTL = 600s, tự động nhả ghế nếu hết hạn).
  * **Frontend**: `SeatLockStatusPage.tsx` (Đồng hồ đếm lùi 10:00, cảnh báo nhấp nháy đỏ khi < 2:00, cảnh báo nhả ghế khi hết giờ).
* **Checklist**:
  * [x] [BE] Khóa ghế độc quyền bằng Pessimistic Write Lock chống Overbooking
  * [x] [BE] Cơ chế kiểm tra và giải phóng ghế tự động sau 10 phút
  * [x] [BE] Viết test kiểm thử Concurrency 10 luồng cùng tranh 1 ghế
  * [x] [FE] Widget đồng hồ đếm ngược 10:00 thời gian thực
  * [x] [FE] Hiệu ứng cảnh báo sắp hết giờ và thông báo hủy giữ chỗ

---

##### 📝 Trần Minh Đức (Full-Stack Booking & Multi-Channel Payment Flow)

###### (5) US-12: Là một Khách hàng, tôi muốn chọn điểm đón/trả cụ thể và điền thông tin hành khách để nhà xe liên hệ đón đúng giờ
* **Mô tả (Description)**:
  * **Backend**: `GET /api/v1/trips/{id}/points` & `POST /api/v1/bookings/validate` (Lấy trạm đón/trả, validate SĐT 10 số, Email đúng định dạng).
  * **Frontend**: `BookingCheckoutPage.tsx` (Dropdown chọn điểm đón/trả theo giờ, form nhập thông tin người đặt, ô nhập Voucher).
* **Checklist**:
  * [x] [BE] API trả danh mục điểm đón/trả theo lộ trình
  * [x] [BE] Regex kiểm tra hợp lệ Số điện thoại Việt Nam và Email
  * [x] [FE] Dropdown chọn điểm đón và điểm trả theo mốc giờ xe chạy
  * [x] [FE] Form nhập thông tin khách hàng và ô áp dụng mã Voucher

###### (8) US-13: Là một Khách hàng, tôi muốn thanh toán đơn vé đa kênh an toàn (VNPay QR, MoMo, COD) và quản lý vé cá nhân
* **Mô tả (Description)**:
  * **Backend**: `POST /api/v1/bookings` & `POST /api/v1/payments/create` (`@Transactional` nguyên tử, sinh mã đơn `BK-*`, tích hợp VNPay/MoMo/COD, API hủy vé trực tuyến).
  * **Frontend**: `PaymentPortalPage.tsx` & `MyBookingsPage.tsx` (Chọn phương thức COD / VNPay / MoMo, xem vé đã mua, nút hủy vé hoàn tiền online).
* **Checklist**:
  * [x] [BE] Xử lý giao dịch nguyên tử `@Transactional(isolation = Isolation.SERIALIZABLE)`
  * [x] [BE] Thuật toán sinh mã đơn vé duy nhất `BK-YYYYMMDD-XXXX`
  * [x] [BE] Tích hợp tạo URL/QR thanh toán VNPay và MoMo
  * [x] [FE] Giao diện chọn phương thức thanh toán trực quan
  * [x] [FE] Trang Quản lý vé của tôi (`/my-tickets`) hỗ trợ hủy vé trực tuyến

---

##### 🌟 Đoàn Nhật Cường (Full-Stack Portal Experience, Offline Lookup & QR Scanner)

###### (5) US-14: Là một Khách hàng / Nhân viên, tôi muốn nhận vé điện tử sắc nét kèm mã QR Code và có thể quét camera trực tiếp tại `/scanner` để dễ dàng soát vé lên xe
* **Mô tả (Description)**:
  * **Backend**: `GET /api/v1/tickets/{ticketCode}` & `POST /api/v1/tickets/checkin` (Lấy thông tin vé từ bảng `tickets`, cập nhật trạng thái `CHECKED_IN` theo thời gian thực).
  * **Frontend**: `PaymentSuccessPage.tsx` & `UniversalQrScannerPage.tsx` (Thẻ vé Boarding Pass, render mã QR, trang quét camera/webcam trực tiếp `/scanner`).
* **Checklist**:
  * [x] [BE] Viết query lấy thông tin vé theo mã `ticketCode`
  * [x] [BE] API Endpoint xác thực vé và check-in lên xe
  * [x] [FE] Render mã QR Code sắc nét quét được bằng camera và nút "In vé"
  * [x] [FE] Giao diện Quét mã QR bằng Camera điện thoại / Webcam laptop (`/scanner`)

###### (3) US-15: Là một Khách hàng, tôi muốn đọc hướng dẫn quy định hành lý và các câu hỏi thường gặp (FAQ) để chuẩn bị tốt nhất trước khi khởi hành
* **Mô tả (Description)**:
  * **Backend**: `GET /api/v1/guide/faq` (Trả về danh mục câu hỏi thường gặp và quy định hành lý từ CSDL/JSON).
  * **Frontend**: `GuideFaqPage.tsx` (Quy định hành lý tối đa 20kg, giờ có mặt trước 15 phút, Accordion FAQ bấm đóng/mở).
* **Checklist**:
  * [x] [BE] Tạo Controller trả về danh sách FAQ và quy định hành lý
  * [x] [BE] Model dữ liệu FAQ đơn giản
  * [x] [FE] Dựng khung thông tin quy định hành lý và lưu ý khi đi xe
  * [x] [FE] Danh sách câu hỏi thường gặp dạng Accordion (click để mở câu trả lời)

###### (3) US-16: Là một Khách hàng, tôi muốn tra cứu thông tin vé nhanh bằng số điện thoại hoặc mã đơn và xem được vé khi không có mạng (Offline)
* **Mô tả (Description)**:
  * **Backend**: `GET /api/v1/bookings/code/{code}` hoặc theo SĐT (Tìm đơn vé trong CSDL, trả về 404 nếu không tìm thấy).
  * **Frontend**: `TicketLookupPage.tsx` (1 ô nhập SĐT hoặc Mã vé `BK-*`, lưu vé Offline vào `localStorage`, vẽ lộ trình di chuyển thời gian thực).
* **Checklist**:
  * [x] [BE] Viết truy vấn tìm Booking theo mã đơn vé hoặc số điện thoại
  * [x] [BE] Xử lý ngoại lệ trả về thông báo lỗi thân thiện nếu không tìm thấy vé
  * [x] [FE] Ô nhập liệu đơn giản tra cứu SĐT / Mã vé
  * [x] [FE] Hỗ trợ lưu và hiển thị vé Offline không cần mạng Internet

###### (3) US-17: Là một Khách hàng, tôi muốn gửi đánh giá số sao (1-5 ⭐) và nhận xét dịch vụ sau chuyến đi để phản hồi trải nghiệm thực tế với nhà xe
* **Mô tả (Description)**:
  * **Backend**: `POST /api/v1/reviews` (Lưu số sao 1-5, nội dung nhận xét vào bảng `reviews` của CSDL).
  * **Frontend**: `ReviewSubmitPage.tsx` (Widget chọn 1-5 ngôi sao ⭐, ô textarea nhập nhận xét, nút "Gửi đánh giá").
* **Checklist**:
  * [x] [BE] Tạo Entity `Review` và Repository lưu đánh giá vào CSDL
  * [x] [BE] API Endpoint `POST /api/v1/reviews`
  * [x] [FE] Widget tương tác chọn từ 1 đến 5 sao ⭐ trực quan
  * [x] [FE] Ô textarea nhập lời nhận xét và nút gửi kèm thông báo thành công

---

##### 🎓 Phan Trung Kiên (Sinh Viên Miễn Thực Tập OJT)
* **Ghi chú**: Sinh viên được miễn thực tập OJT theo quyết định và quy định đào tạo của nhà trường/doanh nghiệp. Không nhận phân công task trong dự án.

---
## 3. KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ (TECH STACK)

### 3.1 Mô hình kiến trúc Modular Monolith & Clean Architecture
Hệ thống TravelEasy áp dụng kiến trúc **Modular Monolith** kết hợp **Clean / Hexagonal Architecture** (theo tài liệu `docs/02-architecture-and-db/PROJECT_ARCHITECTURE.md`).
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
Dựa trên tài liệu chuẩn `docs/01-requirements/domain.md`:
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


### 4.7 Quy Trình Nộp Đơn Đối Tác & Trung Tâm Thẩm Định Pháp Lý KYB (Partner Onboarding & KYB Center)

Quy trình gia nhập đối tác nhà xe được thiết kế theo tiêu chuẩn thẩm định doanh nghiệp **KYB (Know Your Business)** chặt chẽ, đảm bảo 100% đối tác mở bán vé trên TravelEasy đều là đơn vị vận tải hành khách hợp pháp, sở hữu giấy phép của Sở GTVT và tài khoản ngân hàng chính chủ phục vụ thanh toán ký quỹ Escrow.

#### A. Sơ đồ Luồng Nghiệp Vụ End-to-End (Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor Partner as Doanh Nghiệp Nhà Xe
    participant FE as Frontend Portal
    participant BE as Backend Spring Boot
    participant Cloud as Cloudinary CDN Storage
    participant DB as Supabase PostgreSQL
    actor Admin as Ban Quản Trị Sàn (Admin)

    Note over Partner, FE: BƯỚC 1: KHAI BÁO THÔNG TIN & TẢI TỆP TRỰC TIẾP
    Partner->>FE: Nhập Tên nhà xe, MST, Người đại diện, Hotline
    Partner->>FE: Tạo tuyến đường (Route Builder: Điểm đi - Điểm đến, 1 chiều/khứ hồi)
    Partner->>FE: Kéo thả file Ảnh CCCD 2 mặt & File Scan GPKD (Ảnh hoặc PDF)
    FE->>BE: POST /api/v1/upload/image (Tải file MultipartFile)
    BE->>Cloud: Lưu trữ an toàn tại traveleasy/kyb_documents (resource_type: auto)
    Cloud-->>BE: Trả về Secure HTTPS URL
    BE-->>FE: Trả về link file Cloudinary
    Partner->>FE: Nhập tài khoản ngân hàng thụ hưởng (Ngân hàng, STK, Tên chủ TK)

    Note over FE, BE: BƯỚC 2: CLIENT & SERVER VALIDATION (13 QUY TẮC)
    Partner->>FE: Bấm "Gửi Yêu Cầu Hợp Tác Ngay"
    FE->>FE: Thẩm định 13 trường dữ liệu (Inline error alerts nếu sai)
    FE->>BE: POST /api/v1/partners/register
    BE->>BE: Kiểm tra tính duy nhất (Unique TaxCode & CompanyName)
    BE->>DB: Lưu hồ sơ trạng thái PENDING và kyc_status = PENDING
    BE-->>FE: HTTP 200 Đăng ký thành công

    Note over Admin, DB: BƯỚC 3: QUY TRÌNH THẨM ĐỊNH KYB 5 BƯỚC TẠI ADMIN PORTAL
    Admin->>FE: Mở Trung Tâm Thẩm Định KYB (/admin/bus-companies)
    FE->>DB: Truy vấn hồ sơ nhà xe & tài liệu pháp lý
    Admin->>FE: 1. Bấm 1-Click tra cứu MST trên Cổng Tổng Cục Thuế / MaSoThue.com
    Admin->>FE: 2. Soi ảnh 2 mặt CCCD gắn chip (Lightbox phóng to Full HD)
    Admin->>FE: 3. Xem trực tiếp văn bản PDF Giấy phép vận tải Sở GTVT (Embedded PDF Reader)
    Admin->>FE: 4. Kiểm tra đối soát AML tự động: So khớp Tên chủ tài khoản với Tên pháp nhân
    Admin->>FE: 5. Kênh Tele-Check: Bấm gọi hotline kiểm chứng

    Note over Admin, BE: BƯỚC 4: RA QUYẾT ĐỊNH THẨM ĐỊNH (3 NHÁNH)
    alt Nhánh 1: Phê Duyệt Hồ Sơ (APPROVE)
        Admin->>FE: Thiết lập % hoa hồng sàn (6% - 12%) & Ghi chú
        FE->>BE: POST /admin/bus-companies/{id}/approve
        BE->>DB: Cập nhật status = ACTIVE, kyc_status = VERIFIED
        BE->>DB: Tự động khởi tạo tài khoản ROLE_OPERATOR
        BE-->>Partner: Gửi thông báo & tài khoản điều hành qua Email
    else Nhánh 2: Yêu Cầu Bổ Sung (REQUEST_SUPPLEMENT)
        Admin->>FE: Chọn lý do yêu cầu chụp lại CCCD hoặc gửi bổ sung GPKD (Hạn 7 ngày)
        FE->>BE: POST /admin/bus-companies/{id}/request-supplement
        BE->>DB: Cập nhật status = PENDING_SUPPLEMENT
    else Nhánh 3: Từ Chối Hồ Sơ (REJECT)
        Admin->>FE: Nhập lý do từ chối (Không đủ điều kiện kinh doanh vận tải)
        FE->>BE: POST /admin/bus-companies/{id}/reject
        BE->>DB: Cập nhật status = REJECTED
    end
```

#### B. Các Cải Tiến Trải Nghiệm Đột Phá Đã Triển Khai

1. **Bộ Công Cụ Tải Tệp Trực Tiếp (File Upload & Drag-and-Drop Dropzone):**
   * Loại bỏ hoàn toàn việc bắt người dùng dán URL thủ công.
   * Chấp nhận tệp ảnh (`.png`, `.jpg`, `.webp`) cho 2 mặt CCCD và file tài liệu **`.PDF`** hoặc ảnh cho Giấy phép kinh doanh / vận tải.
   * File được lưu trữ vĩnh viễn trên Cloudinary CDN phân loại theo thư mục `traveleasy/kyb_documents`, có preview trực tiếp ngay trên form.

2. **Hệ Thống Tạo Tuyến Đường Điểm Đầu - Điểm Cuối (Interactive Route Builder):**
   * Người dùng không cần tìm hay gõ ký tự đặc biệt `⇄`.
   * Giao diện cho phép chọn **Điểm khởi hành**, chọn **Chiều di chuyển** (2 Chiều khứ hồi `⇄` hoặc 1 Chiều `➔`), và chọn **Điểm đến**.
   * Bấm `+ Thêm Tuyến` để quản lý các tuyến xe dưới dạng các thẻ (Tags) linh hoạt, có nút `✕` để xóa từng tuyến và thanh gợi ý nhanh các tuyến phổ biến.

3. **Hệ Thống Thẩm Định 13 Quy Tắc (Real-time Validation System):**
   * Kiểm tra định dạng số điện thoại Việt Nam (10 số, đầu 03/05/07/08/09).
   * Kiểm tra mã số thuế hợp lệ (10 hoặc 13 số).
   * Kiểm tra số CCCD đúng 12 chữ số theo quy chuẩn Bộ Công An.
   * Bắt buộc đính kèm đủ 3 tệp giấy tờ (CCCD trước, CCCD sau, GPKD).
   * Tự động chuẩn hóa Tên chủ tài khoản ngân hàng thành In Hoa Không Dấu.
   * Hiển thị cảnh báo lỗi viền đỏ tức thì (Inline Errors) và tự động xóa lỗi khi người dùng chỉnh sửa.

4. **Trình Đọc Văn Bản PDF Trực Tiếp (Embedded Full Screen PDF Reader) Dành Cho Admin:**
   * Khi nhà xe tải lên Giấy phép kinh doanh dạng PDF, Admin có thể bấm **"Đọc Trực Tiếp PDF"** để mở trình duyệt xem toàn bộ các trang tài liệu PDF nhiều trang, dấu mộc đỏ của Sở GTVT ngay trong cửa sổ Admin mà không cần tải file về máy.
   * Tính năng đối chiếu chống rửa tiền (AML Check) tự động so khớp tên chủ tài khoản ngân hàng với tên pháp nhân để cảnh báo rủi ro gian lận dòng tiền.


---

## 5. THIẾT KẾ LỚP CHI TIẾT (CLASS DIAGRAM CANONICAL)

Dưới đây là 6 sơ đồ Class Diagram Mermaid chuẩn hóa theo `docs/02-architecture-and-db/class_diagram.md`:

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

#### 1. Tài khoản người dùng (`users`) — Mật khẩu dùng chung: **`123456789@`** *(hoặc `Rikkei@123`)*
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

### ⚡ CÁCH 1 (KHUYÊN DÙNG NHẤT): CHỈ 1 LỆNH `npm run dev` CHẠY CẢ FRONTEND VÀ BACKEND

Tại thư mục gốc của dự án (`Nhom7_QUANLYNHAXE`), bạn chỉ cần chạy đúng **1 câu lệnh duy nhất**:

```bash
npm run dev
```

Hệ thống sẽ tự động điều phối chạy song song cả 2 dịch vụ:
* ⚙️ **Backend (Spring Boot API)**: Khởi chạy tại `http://localhost:8080` (kèm Swagger UI tại `http://localhost:8080/swagger-ui.html`)
* 🌐 **Frontend (Vite + React)**: Khởi chạy tại `http://localhost:5173/`

> **Mẹo hữu ích:** 
> * Nhấn `Ctrl + C` trong terminal bất cứ lúc nào để tắt đồng thời cả Backend và Frontend, tự động giải phóng hoàn toàn cổng 8080 và 5173 mà không bị kẹt tiến trình ngầm.
> * Nếu đang ở trong thư mục `frontend/`, bạn cũng có thể gõ `npm run dev:all` để khởi chạy tương tự.

---

### Cách 2: Khởi chạy Trực tiếp Từng Terminal (Thủ công / In-Memory DB)
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

#### 2. Quy tắc Concurrency Lock (Dành cho Phạm Thanh Phong — Task U4)
* **Khóa bi quan bắt buộc**: Khi viết API khóa giữ chỗ 10 phút (`POST /api/v1/seats/lock`), bắt buộc phải sử dụng `@Lock(LockModeType.PESSIMISTIC_WRITE)` trên phương thức truy vấn của `TripSeatRepository` để khóa hàng độc quyền ở tầng Database:
  ```java
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT s FROM TripSeat s WHERE s.trip.id = :tripId AND s.seatCode IN :seatCodes")
  List<TripSeat> findSeatsWithLock(@Param("tripId") Long tripId, @Param("seatCodes") List<String> seatCodes);
  ```
* **Tuyệt đối không dùng `synchronized` Java**: Khóa ở tầng RAM của JVM sẽ vô tác dụng khi scale nhiều instance hoặc chạy qua load balancer. Phải giao trách nhiệm khóa độc quyền cho PostgreSQL/MySQL.

#### 3. Quy tắc Giao dịch Tài chính Nguyên tử (Dành cho Trần Minh Đức — Task U6)
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
  * **Phạm Công Thành (Lead / Architect)**: Phụ trách Cổng Điều Hành Đối Tác Nhà Xe (`CompanyTripController.java`, `CompanyBookingController.java`, `CompanyVehicleController.java`...) & Kiến trúc hệ thống, Security JWT Core.
  * **Nguyễn Đại Phát**: Phụ trách toàn bộ Cổng Quản Trị Sàn Tổng Admin (`AdminTripController.java`, `AdminUserController.java`, `AdminCompanyController.java`, `AdminRouteController.java`, `AdminSettlementController.java`, `AdminAuditLogController.java`...).
  * **Phạm Thanh Phong**: Phụ trách `TripSearchController.java`, `SeatCatalogController.java` & `SeatLockController.java`.
  * **Trần Minh Đức**: Phụ trách `BookingController.java`, `PaymentController.java` & `MyBookingsController.java`.
  * **Đoàn Nhật Cường**: Phụ trách `TicketLookupController.java`, `TicketCheckinController.java`, `UniversalQrScannerController.java` & `ReviewController.java`.
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

> **Mật khẩu dùng chung cho tất cả tài khoản:** **`123456789@`** *(hoặc `Rikkei@123`)*

| Vai trò (Role) | Email đăng nhập | Mật khẩu mẫu | Quyền hạn & Phân hệ truy cập |
|---|---|:---:|---|
| **Admin (Quản trị sàn)** | `admin@traveleasy.vn`<br>`phanthanhphong.admin@traveleasy.vn`<br>`trungkien.admin@traveleasy.vn` | **`123456789@`** | Toàn quyền Quản trị sàn, Xem Dashboard KPI, Quản lý người dùng, Thêm/sửa chuyến xe |
| **Operator (Nhà xe)** | `operator@futa.vn`<br>`futa@gmail.com`<br>`dieuhanh@thanhbuoi.com.vn`<br>`dieuhanh@hoamaivungtau.com.vn` | **`123456789@`** | Quản lý lịch trình, sơ đồ ghế 2 tầng và danh sách hành khách nhà xe |
| **Customer (Hành khách)** | `customer@gmail.com` *(SĐT: `0912345678`)*<br>`tranthib@gmail.com` | **`123456789@`** | Tìm kiếm chuyến, Đặt vé xe COD/VNPay, Xem lịch sử vé, Nhận vé điện tử & QR Code |

* **Mã đơn vé mẫu có sẵn để kiểm tra tính năng Tra Cứu Vé & Render QR Code**:
  * Nhập mã đặt vé: `BKG-20261025-001` tại trang **Tra Cứu Vé** (`http://localhost:5173/lookup`) để xem chi tiết vé điện tử của khách hàng Nguyễn Văn Du Khách với 2 ghế nằm A01, A02 kèm mã QR chuẩn.
  * Mã vé lẻ: `TK-20261025-001-A01` hoặc `TK-20261025-001-A02` (sử dụng được ngay trên công cụ quét vé [`http://localhost:5173/scanner`](http://localhost:5173/scanner)).

---

### 🧪 BẰNG CHỨNG KIỂM THỬ THỰC TẾ (VERIFIED LIVE METRICS)
* ✅ **Backend Compile**: `./gradlew bootJar` ➔ **BUILD SUCCESSFUL (0 Errors)**.
* ✅ **Frontend Compile**: `npm run build` ➔ **1637 modules transformed (0 Errors, Built in 3.92s)**.
* ✅ **API Tìm chuyến xe**: `GET /api/v1/trips/search?departureLocation=TP. Hồ Chí Minh&arrivalLocation=Đà Lạt` ➔ **HTTP 200 (Success, 120ms)**.
* ✅ **API Đặt vé COD**: `POST /api/v1/bookings` ➔ **HTTP 200 (Đặt vé thành công, tự sinh mã BK-* và vé con TK-*)**.
* ✅ **Kiểm tra chống tranh chấp ghế (Concurrency Lock)**: Đặt lại ghế vừa mua ➔ **HTTP 409 Conflict ("Ghế vừa được người khác đặt")**.
* ✅ **Trợ lý AI Du lịch**: `POST /api/v1/ai/chat` ➔ **HTTP 200 (Tư vấn chọn giường tầng dưới A01-A06 chống say xe)**.

---

## 9. QUY CHUẨN LÀM VIỆC VỚI GIT & BỘ NGUYÊN TẮC PHÂN NHÁNH - COMMIT CHUẨN DOANH NGHIỆP

> **Mục tiêu chiến lược:**  
> Hệ thống TravelEasy Platform áp dụng chuẩn quản lý phiên bản mã nguồn phân tán (Distributed Version Control System - DVCS) theo mô hình **Git Flow chuẩn doanh nghiệp**. Toàn bộ 5 thành viên thực tập trong dự án phải tuân thủ nghiêm ngặt 100% quy chuẩn này nhằm:  
> 1. Đạt điểm tối đa tiêu chí đánh giá: *"Lịch sử hoạt động nhóm rõ ràng, commit có ý nghĩa, phân nhánh chuẩn chỉ và vận hành CI/CD pipeline ổn định"*.  
> 2. Bảo vệ nhánh `main` luôn ở trạng thái sẵn sàng nghiệm thu (Production-Ready) không bao giờ bị gián đoạn.  
> 3. Triệt tiêu 100% tình trạng ghi đè mã nguồn (Code Overwriting) và tối ưu hóa thời gian xử lý xung đột (Merge Conflict Resolution).

---

### 9.1 Triết lý & Bộ nguyên tắc cốt lõi (Core Git Principles)

1. **Production-First (`main` là bất khả xâm phạm)**: Nhánh `main` phản ánh mã nguồn thực thi chính xác trên môi trường bàn giao nghiệm thu. Tuyệt đối không commit hoặc push thử nghiệm trực tiếp lên `main`.
2. **Nguyên tử hóa Commit (Atomic Commits)**: Mỗi commit chỉ thực hiện một thay đổi duy nhất, hoàn chỉnh và có thể độc lập hoàn tác (`git revert`) mà không gây ảnh hưởng hay làm gãy các module khác.
3. **Trung tâm tích hợp duy nhất (`dev`)**: Toàn bộ các nhánh tính năng (`feature/*`), nhánh sửa lỗi (`bugfix/*`) đều phải tích hợp, kiểm thử liên kết và chạy thành công test suite trên `dev` trước khi mở Release PR lên `main`.
4. **Không rò rỉ bí mật (Zero-Secret Leakage)**: Tuyệt đối không bao giờ commit các thông tin nhạy cảm (JWT secret, DB password, API keys, file `.env`) vào Git. Luôn duy trì file `.gitignore` nghiêm ngặt và cung cấp file mẫu `.env.example`.
5. **Lịch sử mã nguồn sạch (Clean Linear History)**: Khuyến khích pull có đồng bộ cập nhật (`git pull origin dev`) và giải quyết xung đột tại máy cá nhân trước khi mở Pull Request để giữ sơ đồ commit rõ ràng, minh bạch.

---

### 9.2 Mô hình phân nhánh chuẩn Enterprise Git Flow (Branching Strategy)

Dự án áp dụng mô hình phân cấp 2 tầng nhánh chính (Protected Branches) và 3 tầng nhánh nghiệp vụ ngắn hạn (Working Branches):

```mermaid
gitGraph
   commit id: "init-repo" tag: "v1.0.0"
   branch dev
   checkout dev
   commit id: "dev-setup"
   branch feature/thanh-company-tenant-isolation
   checkout feature/thanh-company-tenant-isolation
   commit id: "feat(company): tenant isolation guard"
   commit id: "feat(policy): scope bus cancellation rules"
   checkout dev
   merge feature/thanh-company-tenant-isolation id: "pr-101-approved"
   branch feature/phong-customer-pessimistic-lock
   checkout feature/phong-customer-pessimistic-lock
   commit id: "feat(seatmap): 2-deck svg seat layout"
   commit id: "feat(concurrency): lock trip seat on booking"
   checkout dev
   merge feature/phong-customer-pessimistic-lock id: "pr-102-approved"
   branch feature/duc-customer-vietqr-vnpay
   checkout feature/duc-customer-vietqr-vnpay
   commit id: "feat(payment): vietqr dynamic payload"
   checkout dev
   merge feature/duc-customer-vietqr-vnpay id: "pr-103-approved"
   checkout main
   merge dev tag: "v1.1.0-release" id: "release-v1.1.0"
```

#### Chi tiết vai trò của từng nhánh:
1. **Nhánh `main` (Production Branch - BẢO VỆ CẤP ĐỘ CAO NHẤT)**:
   * Chứa phiên bản sản phẩm ổn định nhất phục vụ Hội đồng giám khảo chấm thi và người dùng thực tế.
   * **Branch Protection**: Khóa cứng quyền push trực tiếp (`Deny Direct Push`). Chỉ tiếp nhận mã nguồn thông qua Pull Request từ `dev`.
   * Mỗi lần merge vào `main` bắt buộc gắn Tag phiên bản theo Semantic Versioning (`v1.0.0`, `v1.1.0`).
2. **Nhánh `dev` (Sprint Integration Branch - TRUNG TÂM TÍCH HỢP)**:
   * Nhánh làm việc chung của 5 thành viên thực tập.
   * Toàn bộ các Pull Request tính năng hoàn thành đều phải được merge vào đây sau khi vượt qua vòng Code Review của Team Lead.
   * GitHub Actions tự động kích hoạt kiểm thử Unit Test Backend (`./gradlew test`) và Build Frontend (`npm run build`) khi có commit mới trên `dev`.
3. **Nhánh `feature/*` (Feature Branches - TÍNH NĂNG MỚI)**:
   * Tách ra từ `dev` khi bắt đầu thực hiện User Story mới.
   * Đặt tên theo chuẩn định danh cá nhân và chức năng cụ thể.
   * Sau khi hoàn thiện, kiểm thử cục bộ pass 100%, mở Pull Request vào `dev` và xóa nhánh sau khi merge.
4. **Nhánh `bugfix/*` (Bugfix Branches - VÁ LỖI TÍCH HỢP)**:
   * Tách ra từ `dev` để xử lý các bug phát hiện trong quá trình kiểm thử liên thông (Integration Test) trước khi đóng gói Release.
5. **Nhánh `hotfix/*` (Hotfix Branches - SỬA LỖI KHẨN CẤP PRODUCTION)**:
   * Chỉ tạo khi phát hiện lỗi nghiêm trọng trên `main` sát giờ bảo vệ.
   * Tách trực tiếp từ `main`, sửa lỗi, kiểm tra kỹ lưỡng, sau đó merge đồng thời vào cả `main` lẫn `dev`.

---

### 9.3 Quy chuẩn đặt tên nhánh (Branch Naming Convention & Matrix Phân Công Thành Viên)

#### Cú pháp chuẩn bắt buộc:
```text
<type>/<tên-thành-viên>-<module>-<mô-tả-ngắn-kebab-case>
```

* `<type>`: `feature` (tính năng mới), `bugfix` (sửa lỗi trên dev), `hotfix` (sửa lỗi khẩn cấp main), `refactor` (tối ưu mã), `docs` (tài liệu).
* `<tên-thành-viên>`: `thanh`, `phat`, `phong`, `duc`, `cuong`.
* `<module>`: `company`, `admin`, `seatmap`, `booking`, `payment`, `home`, `scanner`, `auth`, `concurrency`.
* `<mô-tả-ngắn-kebab-case>`: 2-4 từ tiếng Anh viết thường, ngăn cách bởi dấu gạch ngang `-`.

#### Bảng Matrix phân công nhánh chuẩn cho 5 thành viên thực tập theo Trang chức năng:

| Thành viên & Vai trò | Phân hệ (Trang Chức Năng Phụ Trách) | Định danh nhánh chuẩn (Branch Examples) | Mục tiêu nghiệm thu |
|:---|:---|:---|:---|
| **Phạm Công Thành**<br/>*(Team Leader & Architect)* | Toàn bộ 10 Trang Cổng Đối Tác Nhà Xe (`/company/*`) + Core Architecture & DevOps | `feature/thanh-company-tenant-isolation`<br/>`feature/thanh-company-cancellation-policy`<br/>`feature/thanh-company-escrow-settlement` | Đóng gói trọn vẹn 10 trang nhà xe, cách ly dữ liệu đa nhà xe 100%, ví ký quỹ doanh thu an toàn. |
| **Nguyễn Đại Phát**<br/>*(Full-Stack Developer)* | Toàn bộ 10 Trang Cốt Lõi Cổng Quản Trị Sàn Tổng Admin (`/admin/*`) | `feature/phat-admin-dashboard-kpi`<br/>`feature/phat-admin-trip-dispatch`<br/>`feature/phat-admin-user-companies-crud` | Đóng gói trọn vẹn 10 trang Admin, điều phối 480 chuyến xe toàn quốc, quản trị người dùng RBAC, audit logs. |
| **Phạm Thanh Phong**<br/>*(Full-Stack Developer)* | 6 Trang Lõi Nghiệp Vụ Chịu Tải Cao (`/search`, `/checkout`) & Master Data Xe Admin | `feature/phong-customer-search-seatmap`<br/>`feature/phong-customer-pessimistic-lock`<br/>`feature/phong-customer-checkout-payment` | Sơ đồ ghế Limousine VIP 2 tầng, khóa ghế bi quan Pessimistic Lock, thanh toán Serializable, master data xe. |
| **Trần Minh Đức**<br/>*(Full-Stack Developer)* | 4 Trang Trải Nghiệm Khách Hàng & Quản Lý Vé Cá Nhân (`/my-tickets`, `/profile`, `/login`, `/promotions`) | `feature/duc-customer-my-tickets`<br/>`feature/duc-customer-ticket-cancellation`<br/>`feature/duc-customer-profile-management` | Quản lý vé cá nhân, hủy vé online hoàn tiền tự động theo chính sách, quản lý tài khoản và voucher ưu đãi. |
| **Đoàn Nhật Cường**<br/>*(Frontend & Mobile Specialist)* | 5 Trang Truyền Thông, Tra Cứu Offline & 📷 Quét Mã QR Soát Vé (`/`, `/lookup`, `/scanner`, `/schedule`, `/reviews`) | `feature/cuong-home-banner-slider`<br/>`feature/cuong-offline-ticket-lookup`<br/>`feature/cuong-qr-camera-scanner` | Giao diện chuẩn Responsive Mobile/Tablet, tra cứu vé offline qua LocalStorage, máy quét vé QR camera siêu nhạy. |
| *(Phan Trung Kiên)* | *(Miễn thực tập OJT theo quyết định đào tạo của Nhà trường / Doanh nghiệp)* | *(N/A)* | *(N/A)* |

---

### 9.4 Quy chuẩn đặt tên commit (Conventional Commits 1.0.0 & NGUYÊN TẮC VÀNG TIẾNG VIỆT CÓ DẤU)

> [!IMPORTANT]
> ### 🏆 NGUYÊN TẮC VÀNG BẮT BUỘC (THE GOLDEN RULE)
> **100% COMMIT MESSAGE TRONG TOÀN BỘ DỰ ÁN BẮT BUỘC PHẢI VIẾT BẰNG TIẾNG VIỆT CÓ DẤU!**  
> Nhóm 7 thống nhất quy định bắt buộc: Mọi thao tác commit lên Git Repository đều phải sử dụng **Tiếng Việt có dấu đầy đủ, rõ ràng và chuẩn chính tả**.  
> • ❌ **CẤM:** Viết commit bằng tiếng Anh (ví dụ: `fix bug`, `update code`, `refactor service`).  
> • ❌ **CẤM:** Viết tiếng Việt không dấu (ví dụ: `sua loi dat ve`, `them tinh nang huy ve`).  
> • ❌ **CẤM:** Commit cụt lủn không rõ nghĩa (ví dụ: `update`, `fix`, `done`, `test`).  
> • ✅ **BẮT BUỘC:** Tuân thủ chuẩn Conventional Commits kết hợp **mô tả bằng Tiếng Việt có dấu**:  
>   `type(scope): mô tả ngắn gọn bằng Tiếng Việt có dấu dưới 72 ký tự`

```text
<type>(<scope>): <mô tả ngắn gọn bằng Tiếng Việt có dấu dưới 72 ký tự>

[Mô tả chi tiết tùy chọn: giải thích lý do thực hiện và giải pháp kỹ thuật đã áp dụng bằng Tiếng Việt có dấu]

[Footer tùy chọn: liên kết mã công việc, ví dụ: Ref #42, Closes #15]
```

#### Bảng danh mục 10 Types chuẩn hóa với ví dụ Tiếng Việt có dấu:
| Type | Ý nghĩa nghiệp vụ | Ví dụ minh họa chuẩn Tiếng Việt có dấu |
|:---|:---|:---|
| `feat` | Bổ sung tính năng mới, API mới, component giao diện mới | `feat(seatmap): hoàn thiện sơ đồ ghế 2 tầng kèm nút chuyển tầng trực quan` |
| `fix` | Sửa chữa lỗi nghiệp vụ, xử lý ngoại lệ phát sinh | `fix(concurrency): chặn đặt trùng ghế khi nhiều khách cùng thanh toán` |
| `security` | Vá lỗ hổng bảo mật, kiểm soát phân quyền, mã hóa dữ liệu | `security(company): áp dụng phân quyền nghiêm ngặt chặn nhà xe can thiệp chuyến của nhau` |
| `perf` | Tối ưu hóa hiệu năng, giảm thời gian truy vấn SQL | `perf(trips): bổ sung composite index cho departure_time và route_id` |
| `refactor` | Tái cấu trúc mã nguồn (tối ưu hóa hàm, không đổi logic bên ngoài) | `refactor(booking): tách logic tính giá vé và phụ thu tầng vào Domain Service` |
| `style` | Căn chỉnh giao diện CSS, Responsive Mobile/Tablet | `style(responsive): bổ sung thanh cuộn ngang cho bảng dữ liệu quản trị viên` |
| `docs` | Cập nhật tài liệu kỹ thuật, SRS, thiết kế CSDL, hướng dẫn vận hành | `docs(git): ban hành nguyên tắc vàng bắt buộc commit bằng tiếng Việt có dấu` |
| `test` | Viết thêm hoặc chỉnh sửa Unit Test, Integration Test | `test(auth): bổ sung 5 ca kiểm thử xác thực thời hạn và quyền hạn của JWT token` |
| `chore` | Cập nhật dependencies, build script, cấu hình Gradle, Vite, Docker | `chore(deps): nâng cấp thư viện tailwindcss và lucide-react lên bản mới nhất` |
| `ci` | Chỉnh sửa cấu hình workflow GitHub Actions, pipeline CI/CD | `ci(github): bổ sung bước tự động kiểm tra biên dịch Gradle khi mở pull request` |

#### Bảng danh mục Scope chuẩn hóa cho hệ thống:
* `auth`: Xác thực tài khoản, JWT, BCrypt, Spring Security, phân quyền vai trò.
* `company`: Cổng thông tin nhà xe, quản lý xe, điểm đón trả, tài xế, tuyến đường đăng ký.
* `policy`: Chính sách hoàn hủy vé của nhà xe và chuẩn hệ thống.
* `admin`: Cổng quản trị sàn tổng, thống kê doanh thu, quản lý tài khoản đối tác.
* `trips`: Quản lý danh mục chuyến xe, lộ trình di chuyển, giờ xuất bến.
* `seatmap`: Sơ đồ ghế 2 tầng, ma trận vị trí ghế, giá vé phân hạng.
* `concurrency`: Cơ chế khóa dữ liệu (Pessimistic Locking), xử lý tranh chấp chỗ ngồi.
* `booking`: Tạo đơn đặt vé, trạng thái vé, tạo mã vé điện tử BK-*.
* `payment`: Cổng thanh toán VietQR PayOS, VNPAY, thanh toán tiền mặt COD, webhook IPN.
* `settlement`: Quản lý ví ký quỹ Escrow, đối soát doanh thu sàn và chia sẻ lợi nhuận.
* `responsive`: Tối ưu giao diện hiển thị trên Mobile (iOS/Android) và Tablet (iPad/Galaxy Tab).
* `qr`: Khởi tạo và quét mã QR Code vé xe qua Camera trên thiết bị di động.
* `offline`: Lưu trữ vé cục bộ qua LocalStorage/IndexedDB để tra cứu khi mất mạng.
* `reviews`: Đánh giá chất lượng dịch vụ nhà xe, bình luận khách hàng 5 sao.

---

### 9.5 Bảng nguyên tắc Do's and Don'ts khi thao tác Git

| ✅ NGUYÊN TẮC NÊN LÀM (DO'S) | ❌ HÀNH VI TUYỆT ĐỐI CẤM (DON'TS) |
|:---|:---|
| **Kéo mã nguồn mới nhất mỗi ngày**: Luôn chạy `git checkout dev ; git pull origin dev` trước khi bắt đầu viết code mới. | **Cấm commit thẳng lên `main` hoặc `dev`**: Tuyệt đối không bao giờ push trực tiếp vào 2 nhánh bảo vệ. |
| **Commit nhỏ và nguyên tử (Atomic Commit)**: Chia nhỏ công việc thành từng commit độc lập, diễn đạt chính xác hành động vừa hoàn thành. | **Không gom commit "rác"**: Không gộp cả ngày làm việc vào 1 commit khổng lồ với thông điệp vô nghĩa (`fix`, `update`, `test`, `done`). |
| **Kiểm tra trạng thái trước khi commit**: Luôn dùng `git status` và `git diff` để rà soát kỹ các file thay đổi trước khi `git add`. | **Không commit file nhạy cảm**: Tuyệt đối không commit file `.env`, mật khẩu database, file `.log`, thư mục `build/`, `dist/`, `node_modules/`. |
| **Kiểm tra tính toàn vẹn (Build Check)**: Luôn chạy thử `./gradlew compileJava` và `npm run build` thành công trên máy trước khi push. | **Không push code gãy build**: Không bao giờ đẩy code đang bị lỗi biên dịch lên remote làm hỏng môi trường của đồng đội. |
| **Đồng bộ nhánh trước khi mở PR**: Merge `dev` vào nhánh `feature` của mình tại local để tự giải quyết triệt để conflict trước khi tạo PR. | **Không mở PR khi đang bị conflict**: Không bao giờ để Pull Request ở trạng thái đỏ "This branch has conflicts that must be resolved". |
| **Xóa nhánh feature sau khi merge**: Xóa nhánh cá nhân trên GitHub sau khi PR được merge để giữ Repository luôn gọn gàng, tinh gọn. | **Không sử dụng `git push --force`**: Nghiêm cấm dùng cờ `--force` trên các nhánh dùng chung vì sẽ ghi đè và làm mất lịch sử của đồng đội. |

---

### 9.6 Quy trình 7 bước làm việc hàng ngày của lập trình viên (Daily Workflow Standard)

Toàn bộ thành viên thực hiện nghiêm ngặt chu trình 7 bước sau trong mỗi ngày phát triển:

#### Bước 1: Đồng bộ mã nguồn mới nhất từ nhánh `dev`
Mở Terminal (PowerShell trên Windows) tại thư mục gốc dự án:
```powershell
git checkout dev
git pull origin dev
```

#### Bước 2: Khởi tạo nhánh tính năng mới theo đúng chuẩn
Tạo và chuyển sang nhánh làm việc cá nhân (ví dụ: Phạm Thanh Phong làm phần khóa ghế):
```powershell
git checkout -b feature/phong-customer-pessimistic-lock
```

#### Bước 3: Phát triển tính năng & Rà soát thay đổi cục bộ
Viết code, lưu file và kiểm tra danh sách file đã thay đổi:
```powershell
git status
git diff
```

#### Bước 4: Tạo commit nguyên tử chuẩn Conventional Commits
Chỉ thêm các file liên quan trực tiếp đến tính năng và tạo commit rõ ràng:
```powershell
git add backend/src/main/java/com/traveleasy/service/BookingService.java
git commit -m "feat(concurrency): triển khai khóa bi quan pessimistic write lock khi giữ chỗ ghế"
```

#### Bước 5: Kéo cập nhật mới nhất từ `dev` về nhánh cá nhân để phòng ngừa conflict
Trước khi đẩy mã nguồn lên GitHub, đảm bảo nhánh cá nhân đã hòa trộn toàn bộ code mới nhất của các bạn khác:
```powershell
git checkout dev
git pull origin dev
git checkout feature/phong-customer-pessimistic-lock
git merge dev
```
*(Nếu xuất hiện xung đột, xem mục 9.9 để giải quyết xung đột trên VS Code, lưu file và commit hoàn tất)*.

#### Bước 6: Chạy thử nghiệm biên dịch toàn diện (Pre-push Health Check)
Bảo đảm không có lỗi compile backend và lỗi đóng gói frontend:
```powershell
# Kiểm tra biên dịch Backend Java:
.\gradlew.bat compileJava

# Kiểm tra biên dịch Frontend React:
cd frontend ; npm run build ; cd ..
```

#### Bước 7: Đẩy nhánh lên GitHub & Khởi tạo Pull Request
Đẩy nhánh làm việc lên remote repository:
```powershell
git push -u origin feature/phong-customer-pessimistic-lock
```
Sau đó truy cập GitHub, tạo Pull Request trỏ từ `feature/phong-customer-pessimistic-lock` vào nhánh đích `dev`.

---

### 9.7 Mẫu Pull Request chuẩn & Bộ tiêu chí đánh giá Code Review (PR Quality Gate)

Mỗi khi tạo Pull Request trên GitHub, người tạo bắt buộc điền đầy đủ theo biểu mẫu chuẩn sau:

```markdown
### 📌 Tóm tắt công việc (Summary)
- Triển khai cơ chế khóa bi quan (Pessimistic Locking) trong `BookingService.java` nhằm giải quyết dứt điểm lỗi tranh chấp chỗ ngồi khi nhiều khách cùng đặt 1 ghế cùng thời điểm.
- Bổ sung transaction rollback an toàn và trả mã lỗi HTTP 409 Conflict với thông điệp rõ ràng cho frontend.

### 🏷️ Loại thay đổi (Type of Change)
- [x] Tính năng mới (New Feature)
- [ ] Sửa lỗi (Bug Fix)
- [ ] Tối ưu hóa hiệu năng (Performance Optimization)
- [ ] Tái cấu trúc mã nguồn (Refactor)
- [ ] Cập nhật giao diện / Responsive (UI / Style)

### 🧪 Bằng chứng kiểm thử (Verification & Test Evidence)
- [x] Đã chạy `.\gradlew.bat compileJava` thành công (0 errors).
- [x] Đã chạy `npm run build` thành công, bundle không phát sinh cảnh báo lỗi.
- [x] Đã kiểm thử thực tế trên 2 trình duyệt ẩn danh đồng thời: Khách hàng B nhận ngay thông báo lỗi 409 khi Khách hàng A đang giữ ghế.

### 📋 Checklist trước khi yêu cầu Review
- [x] Nhánh đã được merge cập nhật mới nhất từ `dev` và không có merge conflict.
- [x] Không để lại code thừa, comment không cần thiết hoặc lệnh `console.log` rác.
- [x] Tuyệt đối không chứa mật khẩu, key bí mật hay file `.env`.
```

#### Tiêu chí phê duyệt (PR Quality Gate):
1. **Tối thiểu 1 lượt phê duyệt (Approve)** từ Nhóm trưởng (Phạm Công Thành).
2. **100% CI Checks Passed**: GitHub Actions build thành công cả Backend và Frontend.
3. **Không xung đột (Zero Conflicts)**: Nhánh có thể tự động merge sạch sẽ vào `dev`.

---

### 9.8 Cấu hình Branch Protection Rules trên GitHub & Quản lý Bảo mật Secret Zero-Leakage

Nhóm trưởng thực hiện thiết lập bảo vệ nhánh trên giao diện GitHub Repository:

```
GitHub Repo ➔ Settings ➔ Branches ➔ Add branch protection rule
```

#### Cấu hình chi tiết cho nhánh `main` và nhánh `dev`:
1. **Branch name pattern**: Điền `main` (và tạo thêm một rule tương tự cho `dev`).
2. **Protect matching branches**:
   * ✅ **Require a pull request before merging**: Bắt buộc mọi thay đổi phải thông qua Pull Request, vô hiệu hóa hoàn toàn lệnh `git push` trực tiếp.
   * ✅ **Require approvals**: Thiết lập giá trị là **1** (Cần ít nhất 1 thành viên review và phê duyệt).
   * ✅ **Dismiss stale pull request approvals when new commits are pushed**: Tự động hủy phê duyệt cũ nếu tác giả đẩy thêm commit mới, buộc phải review lại.
   * ✅ **Require status checks to pass before merging**: Bắt buộc pipeline CI/CD (Build Gradle & Vite) phải trả kết quả xanh (Success) mới được phép merge.
   * ✅ **Do not allow bypassing the above settings**: Áp dụng quy tắc cho toàn bộ thành viên, kể cả Repository Owner / Admin.

#### Nguyên tắc quản lý biến môi trường an toàn:
* File `.env` và thư mục `credentials/` được khai báo cố định trong `.gitignore`.
* Dự án cung cấp file mẫu `backend/src/main/resources/application.properties.example` và `frontend/.env.example` chứa các biến môi trường mẫu không có mật khẩu thật để thành viên mới clone về tự cấu hình:
  ```powershell
  # Copy file cấu hình mẫu sang file môi trường thực tế tại máy cá nhân:
  Copy-Item frontend\.env.example frontend\.env
  ```

---

### 9.9 Cẩm nang xử lý xung đột mã nguồn chuyên sâu (Deep Merge Conflict Resolution)

Xung đột mã nguồn (Merge Conflict) xuất hiện khi hai thành viên cùng chỉnh sửa trên cùng một dòng code trong cùng một file. Quy trình xử lý xung đột chuẩn xác:

1. **Nhận diện file xung đột**: Khi thực hiện `git merge dev`, Git sẽ hiển thị thông báo `CONFLICT (content): Merge conflict in <tên-file>`. Chạy `git status` để xem danh sách các file đang bị xung đột màu đỏ.
2. **Cấu trúc vùng đánh dấu xung đột**:
   ```java
   <<<<<<< HEAD (Mã nguồn hiện tại trên nhánh feature của bạn)
   public ResponseEntity<?> processBooking(BookingRequest req) {
       return bookingService.createBookingWithPessimisticLock(req);
   }
   =======
   public ResponseEntity<?> processBooking(BookingRequest req) {
       return bookingService.createBookingWithOptimisticLock(req);
   }
   >>>>>>> dev (Mã nguồn mới nhất từ nhánh dev của đồng đội vừa được merge lên)
   ```
3. **Quy tắc giải quyết xung đột**:
   * Mở file trên Visual Studio Code hoặc IntelliJ IDEA. Trình soạn thảo sẽ hiển thị 4 tùy chọn trực quan:
     * `Accept Current Change`: Giữ code của nhánh mình.
     * `Accept Incoming Change`: Giữ code từ nhánh `dev`.
     * `Accept Both Changes`: Giữ cả hai đoạn code.
     * `Compare Changes`: So sánh trực tiếp từng dòng.
   * **Nguyên tắc vàng**: Trao đổi trực tiếp ngay với tác giả đoạn code xung đột để thống nhất giải pháp kỹ thuật tối ưu nhất. **Tuyệt đối không tự ý xóa bỏ logic xử lý của đồng đội!**
4. **Đóng gói hoàn tất sau khi giải quyết**:
   ```powershell
   # 1. Thêm file đã resolve sạch conflict vào staging:
   git add backend/src/main/java/com/traveleasy/service/BookingService.java

   # 2. Hoàn tất commit merge:
   git commit -m "chore(merge): resolve conflict with dev in booking service logic"

   # 3. Đẩy nhánh đã xử lý sạch sẽ lên remote:
   git push origin feature/phong-customer-pessimistic-lock
   ```

---

### 9.10 Bảng tra cứu nhanh lệnh Git thường dùng (Git Daily Cheat Sheet)

| Lệnh Git thực thi (Command) | Ý nghĩa nghiệp vụ & Hoàn cảnh sử dụng |
|:---|:---|
| `git status` | Kiểm tra trạng thái hiện tại: các file đã sửa, file chưa tracked, nhánh hiện hành. |
| `git branch -a` | Liệt kê toàn bộ các nhánh cục bộ (local) và nhánh trên máy chủ (remote). |
| `git checkout -b <tên-nhánh>` | Tạo một nhánh mới và tự động chuyển ngay sang nhánh vừa tạo. |
| `git checkout <tên-nhánh>` | Chuyển đổi qua lại giữa các nhánh làm việc. |
| `git pull origin dev` | Kéo toàn bộ mã nguồn cập nhật mới nhất từ nhánh `dev` trên remote về local. |
| `git add .` | Thêm toàn bộ các file đã thay đổi vào khu vực chờ commit (Staging Area). |
| `git add <đường-dẫn-file>` | Thêm chỉ định một file cụ thể vào Staging Area (khuyến khích dùng cho commit nguyên tử). |
| `git commit -m "<message>"` | Đóng gói các thay đổi trong Staging Area thành commit mới với thông điệp chuẩn. |
| `git push -u origin <tên-nhánh>` | Đẩy nhánh từ local lên GitHub và thiết lập liên kết theo dõi (upstream tracking). |
| `git stash` | Tạm thời cất giữ các thay đổi chưa commit vào bộ nhớ đệm khi cần chuyển nhánh gấp. |
| `git stash pop` | Lấy lại và áp dụng lại các thay đổi đã cất trong bộ nhớ đệm stash. |
| `git log --oneline --graph -n 10` | Xem 10 commit gần nhất dạng sơ đồ cây trực quan, gọn gàng trên 1 dòng. |
| `git reset --soft HEAD~1` | Hủy commit gần nhất nhưng vẫn giữ nguyên toàn bộ file đã sửa trong Staging Area. |
| `git remote -v` | Kiểm tra địa chỉ đường dẫn URL của kho mã nguồn GitHub từ xa. |

---

---

## 10. KỊCH BẢN DEMO BẢO VỆ TỐT NGHIỆP 100/100 ĐIỂM (15 PHÚT)

Kịch bản 15 phút chia rõ vai trò và thao tác cho cả 5 thành viên thực tập trước Hội đồng giám khảo theo đúng các trang chức năng đã đóng gói (Phan Trung Kiên được miễn thực tập OJT):

```
+--------------------------------------------------------------------------------------------------------------------+
| PHÂN BỔ THỜI GIAN DEMO BẢO VỆ (TỔNG CỘNG 15 PHÚT — 5 THÀNH VIÊN THỰC TẬP OJT)                                      |
+--------------------------------------------------------------------------------------------------------------------+
| 00:00 - 03:00 (3 phút) : Phạm Công Thành  - Kiến trúc hệ thống, Supabase DB 36 bảng, Cổng Đối Tác (/company/*)    |
| 03:00 - 06:00 (3 phút) : Nguyễn Đại Phát  - Cổng Quản Trị Sàn Tổng (/admin/*), Giám sát 480 chuyến xe, RBAC, Logs  |
| 06:00 - 09:00 (3 phút) : Phạm Thanh Phong   - Tìm kiếm siêu tốc, Sơ đồ ghế VIP 2 tầng, Khóa Concurrency & Checkout  |
| 09:00 - 12:00 (3 phút) : Trần Minh Đức     - Quản lý vé của tôi (/my-tickets), Hủy vé tự động, Hồ sơ & Voucher      |
| 12:00 - 15:00 (3 phút) : Đoàn Nhật Cường- Tra cứu Offline, 📷 Quét mã QR Camera (/scanner), Trợ lý AI & Báo cáo QA|
+--------------------------------------------------------------------------------------------------------------------+
```

### Chi tiết các bước trình diễn từng thành viên:
1. **Phút 00:00 - 03:00: Phạm Công Thành (Nhóm trưởng / System Architect & Tech Lead)**
   * Chào hội đồng, giới thiệu bài toán đặt vé xe liên tỉnh giải quyết vấn đề tranh chấp giường nằm cao điểm Lễ/Tết.
   * Giới thiệu kiến trúc Clean Architecture + Modular Monolith, CSDL 36 bảng chuẩn hóa đồng bộ trên Supabase Cloud Database, bảo mật Stateless JWT và phân quyền RBAC 3 vai trò (`ADMIN`, `OPERATOR`, `CUSTOMER`).
   * **Demo Cổng Đối Tác Nhà Xe (`/company/*` 10 Trang)**: Đăng nhập tài khoản hãng xe Phương Trang (`operator@futa.vn`), xem Dashboard thống kê doanh thu bán vé riêng của hãng, mở bán chuyến xe mới, xem danh sách hành khách theo thời gian thực và quản lý đối soát quyết toán tài chính (phí hoa hồng sàn 10%).
2. **Phút 03:00 - 06:00: Nguyễn Đại Phát (Full-Stack Developer phụ trách Admin Lead)**
   * Đăng nhập Cổng Quản trị viên Sàn (`/admin/login` với `daiphat.admin@traveleasy.vn`, mật khẩu: `123456789@`).
   * **Demo Dashboard Quản Trị Sàn Tổng**: Trình diễn 4 chỉ số KPI tổng sàn (GMV Doanh thu, Tổng vé bán, Số chuyến hoạt động, Top nhà xe đối tác).
   * **Quản lý & Giám sát 480 chuyến xe toàn sàn (`/admin/trips`)**: Can thiệp khẩn cấp (hủy chuyến thời tiết xấu, đổi lịch xe, đổi tài xế).
   * **Quản trị Người dùng & RBAC (`/admin/users`)**: Phân quyền tài khoản, khóa/mở khóa và cơ chế bảo vệ chống xóa Admin tối cao (`admin@traveleasy.vn`).
   * **Minh chứng Vết kiểm toán bất biến (`/admin/audit-logs`)**: Hiển thị nhật ký ghi nhận thời gian thực mọi hành vi thêm/sửa/xóa của quản trị viên và nhà xe.
3. **Phút 06:00 - 09:00: Phạm Thanh Phong (Full-Stack Developer phụ trách Core Booking & Seat Engine)**
   * Thao tác trên Trang tìm kiếm `/search`: Lọc chuyến xe đa chiều (Khoảng giá vé, Khung giờ sáng/tối, Nhà xe, Đánh giá ⭐). Trình diễn tốc độ tải siêu tốc nhờ SWR Cache 0ms.
   * Bấm **"Chọn chuyến"** tại chuyến Limousine VIP 34 chỗ. Sơ đồ ghế 2 tầng bung ra trực quan (Tầng 1 A01-A17, Tầng 2 B01-B17) với 3 mã màu: Ghế trống (xanh), Ghế đang chọn (cam), Ghế đã bán (xám).
   * **Demo Concurrency Lock đỉnh cao**: Mở 2 tab trình duyệt song song giả lập 2 khách hàng cùng click đặt 1 ghế A05 tại cùng 1 giây ➔ Chứng minh thuật toán **Pessimistic Lock (`SELECT ... FOR UPDATE`)** chặn tuyệt đối hiện tượng Double-Booking, chỉ duy nhất 1 khách hàng giữ được ghế và đồng hồ đếm ngược 10:00 (TTL) bắt đầu đếm lùi an toàn.
   * Chuyển tiếp sang `/checkout`: Thanh toán đa kênh an toàn VietQR PayOS và VNPAY Sandbox qua giao dịch `@Transactional(SERIALIZABLE)`.
4. **Phút 09:00 - 12:00: Trần Minh Đức (Full-Stack Developer phụ trách Khách hàng & Quản lý vé)**
   * **Quản lý vé của tôi (`/my-tickets`)**: Đăng nhập tài khoản khách hàng `customer@gmail.com`, xem danh sách toàn bộ vé đã mua, xem trạng thái vé (`ISSUED`, `USED`, `CANCELLED`).
   * **Demo Hủy vé trực tuyến & Hoàn tiền tự động**: Thử nghiệm thao tác bấm nút Hủy vé trên vé chưa chạy ➔ Hệ thống tự động tính toán số tiền hoàn dựa trên chính sách giờ chạy (>24h hoàn 95%, 12-24h hoàn 70%) và lập tức giải phóng ghế về trạng thái sẵn sàng mở bán.
   * **Quản lý hồ sơ cá nhân (`/profile`) & Kho khuyến mãi (`/promotions`)**: Cập nhật thông tin tài khoản, đổi mật khẩu an toàn và sao chép mã ưu đãi Voucher.
5. **Phút 12:00 - 15:00: Đoàn Nhật Cường (Frontend & Mobile Specialist phụ trách Tra cứu, QR Scanner & QA)**
   * **Tra cứu vé điện tử Offline & Bản đồ lộ trình (`/lookup`)**: Tra cứu theo mã đặt vé `BKG-20261025-001`, hiển thị thẻ vé sang trọng kèm bản đồ lộ trình di chuyển thời gian thực, hỗ trợ lưu và xem vé Offline không cần mạng.
   * **📷 Trình diễn Quét mã QR soát vé đa năng (`/scanner`)**: Bật camera laptop/điện thoại quét trực tiếp mã QR trên vé điện tử ➔ Hệ thống xác thực vé hợp lệ trong 0.2s và bấm nút "Xác nhận Check-in lên xe", trạng thái vé lập tức chuyển sang `CHECKED_IN`.
   * Trình diễn chế độ Giao diện tối (Dark Mode) và Chatbot Trợ lý AI du lịch 24/7.
   * **Báo cáo chất lượng & QA**: Bộ 30 API Backend Pass 100%, 25 Test Cases tự động đạt 100%, Pipeline GitHub Actions CI/CD xanh 100%, Docker Compose sẵn sàng triển khai sản xuất.
   * **Tổng kết**: Nhóm 7 hoàn thành xuất sắc 100% mục tiêu đề tài, tự tin bảo vệ đạt điểm tuyệt đối **100/100 điểm**!

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

#### 4. Cơ chế Mock Thanh toán 1-Click Demo & VNPAY Sandbox (Không Tự Động Đóng)
Để phục vụ việc trình diễn bảo vệ không cần chuyển tiền thật mà vẫn đảm bảo toàn bộ luồng Backend, API và CSDL ghi nhận đầy đủ, hệ thống trang bị nút **"✓ CHẤP NHẬN ĐÃ THANH TOÁN THÀNH CÔNG (DEMO)"**:
* **Giao diện Cổng VNPAY Gateway**: Tích hợp các tab VNPAY-QR, Thẻ ATM 36 ngân hàng nội địa (Vietcombank, BIDV, Techcombank, NCB...), và Thẻ quốc tế Visa/Master.
* **Nút bấm Demo nổi bật**: Bấm nút gửi lệnh `POST /api/v1/payments/mock-success/{bookingCode}?paymentMethod=VNPAY` đến Backend.
* **Ghi nhận CSDL thật**: Tạo bản ghi trong bảng `payment_transactions`, sinh mã giao dịch chuẩn VNPAY (VD: `VNP173456...`), cập nhật trạng thái đơn vé sang `CONFIRMED` và `PAID`.
* **Không tự động đóng / Không ngắt demo**: Modal giữ nguyên màn hình kết quả thành công với đầy đủ mã giao dịch VNPAY, số tiền, thời gian và trạng thái CSDL để người dùng thong thả thuyết minh cho hội đồng bảo vệ.
* **Người dùng chủ động điều hướng**: Chỉ chuyển sang trang vé khi người dùng bấm nút **"Xem Chi Tiết Vé Điện Tử Ngay"**.
![Hộp Thoại Thanh Toán VNPAY Sẵn Sàng](docs/screenshots/screenshot_vnpay_modal_ready.png)
*Hình 11.6: Hộp thoại VNPAY Gateway với nút bấm chấp nhận thanh toán thành công rõ ràng phục vụ Demo.*

![Kết Quả Giao Dịch VNPAY Thành Công Lưu CSDL](docs/screenshots/screenshot_vnpay_modal_success.png)
*Hình 11.7: Màn hình kết quả thanh toán VNPAY được giữ nguyên hiển thị mã giao dịch và CSDL đã ghi nhận.*

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

#### 5. Quản Lý Điểm Đón Trả Nhà Xe (Company Locations — Full CRUD)
Mô hình cấu hình địa điểm đón trả (`BusCompanyLocationConfig`) cho phép nhà xe liên kết linh hoạt với mạng lưới bến xe Master Data toàn quốc:
* **Gán địa điểm mới**: Chọn bến xe Master Data từ CSDL (Bến xe Miền Đông, Bến xe Đà Lạt, Bến xe Mỹ Đình...), đặt tên hiển thị thương hiệu của nhà xe, địa chỉ văn phòng/quầy vé và hướng dẫn đón trả khách.
* **Chỉnh sửa cấu hình**: Cập nhật tên hiển thị, quầy vé đón trả và hướng dẫn in vé cho hành khách.
* **Xóa cấu hình địa điểm**: Gỡ bỏ điểm đón trả khỏi lịch trình của nhà xe.
* **Đồng bộ thời gian thực**: Toàn bộ dữ liệu được lưu bền vững, không bị mất khi F5.
![Quản Lý Địa Điểm Đón Trả Nhà Xe](docs/screenshots/screenshot_company_locations_live.png)
*Hình 11.23: Danh sách điểm đón trả của nhà xe kết nối với bến xe Master Data.*

![Modal Gán Địa Điểm Cho Nhà Xe](docs/screenshots/screenshot_company_locations_modal.png)
*Hình 11.24: Hộp thoại Gán Địa Điểm Cho Nhà Xe — Chọn Master Location từ CSDL toàn sàn.*

#### 6. Quản Lý Chính Sách Hủy Vé Nhà Xe (Cancellation Policies)
Hỗ trợ nhà xe chủ động thiết lập và quản lý các quy định hoàn tiền khi hành khách yêu cầu hủy vé:
* **Tạo chính sách mới**: Thiết lập tên chính sách (VD: Chính sách Limousine VIP & Cao điểm Lễ Tết), mô tả điều kiện áp dụng.
* **Cấu hình tỷ lệ hoàn vé linh hoạt theo mốc giờ**:
  * Trước khởi hành trên 24 giờ: 100%, 90%, 80%, 70%, 50% hoàn tiền.
  * Trước khởi hành 12 - 24 giờ: 70%, 50%, 30%, 20%, 0% hoàn tiền.
  * Trước khởi hành dưới 12 giờ: 0% (Không hoàn tiền), 20%, 30%.
* **Phân định rõ ràng**: Chính sách chuẩn mặc định của Sàn (`Hệ thống`) được bảo vệ không bị xóa; chính sách do Nhà xe tự tạo có thể chỉnh sửa, xóa hoặc kích hoạt làm chính sách mặc định áp dụng.
* **Lưu trữ bền vững**: Dữ liệu được lưu trữ và duy trì ổn định qua các lần tải lại trang (F5).
![Danh Sách Chính Sách Hủy Vé Nhà Xe](docs/screenshots/screenshot_company_cancellation_policies.png)
*Hình 11.25: Danh mục chính sách hủy vé của nhà xe và chính sách chuẩn sàn TravelEasy.*

![Modal Tạo Chính Sách Hủy Vé Mới](docs/screenshots/screenshot_company_cancellation_modal.png)
*Hình 11.26: Hộp thoại cấu hình tỷ lệ hoàn vé linh hoạt theo các mốc giờ khởi hành.*

#### 7. Quản Lý Điều Phối Chuyến Xe Nhà Xe (Trips Management)
Cổng điều phối chuyến xe phục vụ trực tiếp nghiệp vụ vận hành hàng ngày của nhà xe:
* **Tạo chuyến xe mới**: Lựa chọn tuyến đường, xe điều phối từ danh mục phương tiện sẵn có, thiết lập giờ xuất bến, giờ đến dự kiến, giá vé và số lượng chỗ.
* **Bộ lọc trạng thái theo Tab**: Phân loại tức thì theo `Tất cả`, `SCHEDULED` (Đã lên lịch), `DELAYED` (Trễ giờ), `RUNNING` (Đang chạy), `COMPLETED` (Hoàn thành), `CANCELLED` (Đã hủy).
* **Bảng điều phối chi tiết**: Xem đầy đủ thông tin mã chuyến, biển số xe, loại xe, giờ xuất bến, giá vé và tình trạng trễ.
* **Thao tác nhanh trên chuyến**: Hỗ trợ Báo trễ giờ (+30 phút), Khởi hành xuất bến ngay (`RUNNING`), Xác nhận hoàn thành chuyến (`COMPLETED`), hoặc Hủy chuyến xe khẩn cấp (`CANCELLED`) kèm thông báo tức thì.
![Danh Sách Chuyến Xe Nhà Xe](docs/screenshots/screenshot_company_trips.png)
*Hình 11.27: Bảng quản lý chuyến xe của đối tác nhà xe với đầy đủ trạng thái và giá vé.*

![Modal Tạo Chuyến Xe Mới](docs/screenshots/screenshot_company_trip_create_modal.png)
*Hình 11.28: Hộp thoại lên lịch khởi hành chuyến xe mới kết nối với đội xe của nhà xe.*

![Modal Xem Chi Tiết & Điều Phối Chuyến](docs/screenshots/screenshot_company_trip_detail_modal.png)
*Hình 11.29: Xem chi tiết chuyến xe và cụm nút thao tác điều phối nhanh (Báo trễ giờ, Xuất bến, Hoàn thành, Hủy).*

#### 8. Quản Lý Đơn Đặt Vé Khách Hàng (Bookings Management)
Công cụ tra cứu, kiểm soát vé và phục vụ khách hàng tại quầy / trên xe:
* **Tìm kiếm thông minh**: Tìm nhanh theo Mã đặt vé, Họ tên hành khách, Email hoặc Số điện thoại.
* **Bộ lọc trạng thái vé**: Phân nhóm theo `Tất cả`, `CONFIRMED` (Đã xác nhận), `PENDING` (Chờ thanh toán), `CANCELLED` (Đã hủy).
* **Xem chi tiết đơn vé**: Hiển thị họ tên, số điện thoại liên hệ, email, tuyến đường, điểm đón, điểm trả, danh sách mã ghế đã đặt (VD: `A01`, `A02`), phương thức thanh toán (VNPAY, Tiền mặt) và tổng tiền.
* **Hành động nghiệp vụ**:
  * Xác nhận đặt vé đối với các đơn đang chờ thanh toán tại quầy (`PENDING` -> `CONFIRMED`).
  * Hủy vé và xử lý hoàn tiền cho hành khách theo chính sách nhà xe.
  * In vé / Xuất lệnh in vé cho hành khách lên xe.
![Quản Lý Đơn Đặt Vé Nhà Xe](docs/screenshots/screenshot_company_bookings.png)
*Hình 11.30: Bảng theo dõi danh sách đặt vé hành khách thời gian thực.*

![Chi Tiết Đơn Đặt Vé Khách Hàng](docs/screenshots/screenshot_company_booking_modal.png)
*Hình 11.31: Hộp thoại xem chi tiết vé hành khách, số ghế, điểm đón trả và nút In vé / Hủy vé.*

#### 9. Quản Lý Đánh Giá & Phản Hồi Khách Hàng (Customer Reviews & Reports)
Kênh tương tác và chăm sóc khách hàng trực tiếp của nhà xe:
* **Bảng danh sách đánh giá**: Hiển thị số sao (1 đến 5 sao), trích dẫn nhận xét của hành khách, tên/email người đánh giá, mã chuyến xe và ngày gửi.
* **Phân loại đánh giá**: Lọc theo `Tất cả`, `Chưa phản hồi`, `Tốt (4-5 ★)`, `Cần chú ý (1-2 ★)`.
* **Gửi phản hồi công khai (Reply)**: Mở hộp thoại phản hồi với các mẫu trả lời nhanh ("Lời cảm ơn chuẩn", "Xin lỗi & cam kết khắc phục chất lượng") hoặc soạn nội dung riêng biệt. Phản hồi lập tức hiển thị công khai trên ứng dụng.
* **Báo cáo vi phạm (Report to Platform Admin)**: Cho phép nhà xe báo cáo các đánh giá spam, sử dụng ngôn từ thô tục hoặc cạnh tranh không lành mạnh lên Ban Quản Trị Sàn TravelEasy để kiểm duyệt và gỡ bỏ.
![Quản Lý Đánh Giá Khách Hàng](docs/screenshots/screenshot_company_reviews.png)
*Hình 11.32: Giao diện quản lý đánh giá khách hàng với xếp hạng sao và trạng thái phản hồi.*

![Hộp Thoại Phản Hồi Đánh Giá](docs/screenshots/screenshot_company_reviews_reply_modal.png)
*Hình 11.33: Hộp thoại gửi phản hồi chính thức từ nhà xe kèm các mẫu trả lời nhanh tiện lợi.*

#### 10. Phân Quyền Bảo Mật & Ẩn Hoàn Toàn Liên Kết Admin Tổng
* **Bảo mật phân tầng nghiêm ngặt**: Khi người dùng đăng nhập với tư cách Quản trị viên/Điều hành viên Nhà Xe (`ROLE_OPERATOR`), nút `"Sang TravelEasy Admin"` ở chân thanh điều hướng Sidebar được loại bỏ hoàn toàn.
* **Ngăn chặn vượt quyền**: Đảm bảo nhân viên đối tác nhà xe chỉ hoạt động trong phạm vi tài nguyên được cấp phép (`/company/*`), không nhìn thấy và không thể truy cập trái phép vào phân hệ Quản Trị Sàn Tổng (`/admin/*`).
* **Trải nghiệm chuyên biệt**: Giao diện gọn gàng, tập trung 100% vào nghiệp vụ điều hành và kinh doanh vận tải của nhà xe.

#### 11. Bảo Vệ Header Khách Hàng & Chặn 403 Forbidden Nghiêm Ngặt
* **Ẩn toàn bộ nút quản trị đối với Khách hàng**: Khi người dùng đăng nhập tài khoản Khách hàng (`ROLE_CUSTOMER`) hoặc khách vãng lai, hệ thống tự động ẩn hoàn toàn các nút "Quản Trị Sàn (ADMIN)" và "Cổng Điều Hành Xe (OPERATOR)" trên Header.
* **Điều hướng thông tin đối tác hợp chuẩn**: Các liên kết "Mở bán vé trên TravelEasy" và "Trở thành đối tác" trên Header không còn dẫn thẳng vào cổng quản lý mà mở Hộp thoại Giới thiệu Hợp tác Đối tác với đầy đủ chính sách, hotline hỗ trợ nhà xe và nút đăng nhập riêng cho đối tác đã có tài khoản.
* **Chặn đứng truy cập trái phép bằng Route Guards**: Nếu tài khoản Khách hàng cố tình nhập thủ công URL `/admin/*` hoặc `/company/*` trên thanh địa chỉ trình duyệt, hệ thống kích hoạt màn hình chặn 403 Forbidden với giao diện cảnh báo nghiêm ngặt và không có bất kỳ nút backdoor nào.
![Header Khách Hàng Sạch Sẽ Không Có Nút Admin](docs/screenshots/screenshot_customer_header_clean.png)
*Hình 11.34: Header phân hệ khách hàng sạch sẽ, không hiển thị bất kỳ lối tắt quản trị viên nào.*

![Modal Giới Thiệu Hợp Tác Bán Vé Cho Nhà Xe](docs/screenshots/screenshot_partner_info_modal.png)
*Hình 11.35: Hộp thoại thông tin hợp tác mở bán vé chuẩn mực khi khách hàng bấm vào liên kết đối tác.*

![Chặn Truy Cập Phân Hệ Quản Trị Sàn 403](docs/screenshots/screenshot_customer_403_admin.png)
*Hình 11.36: Màn hình từ chối quyền truy cập 403 Forbidden khi tài khoản Khách hàng cố tình vào `/admin/*`.*

![Chặn Truy Cập Phân Hệ Đối Tác Nhà Xe 403](docs/screenshots/screenshot_customer_403_company.png)
*Hình 11.37: Màn hình từ chối quyền truy cập 403 Forbidden khi tài khoản Khách hàng cố tình vào `/company/*`.*

#### 12. Tối Ưu Hóa Header Theo Cụm Chức Năng Nghiệp Vụ & Trang Roadmap / 404 Chuyên Nghiệp
* **Khôi phục độc lập và tách bạch chức năng "Tra Cứu Vé"**:
  * Chức năng **Tra Cứu Vé** (`/lookup`) được tách bạch thành một nút riêng biệt, nổi bật trên thanh điều hướng chính (ngay cạnh *Đặt Vé Xe* và *Vé Của Tôi*).
  * Cho phép hành khách vãng lai tra cứu tức thì thông tin vé bằng Mã đặt vé (`BK-*`) hoặc Số điện thoại, kiểm tra vị trí ghế ngồi, in vé và lấy mã QR Code lên xe mà **không bắt buộc phải đăng nhập tài khoản**.
* **Phân chia Header theo Cụm Chức Năng Sàn (Functional Navigation)**:
  * Thay vì chia theo phương tiện, toàn bộ thanh điều hướng được quy hoạch theo đúng nhu cầu và hành trình trải nghiệm của khách hàng:
    1. 🚌 **Đặt Vé Xe** (`/search` hoặc `/` — Hoạt động cốt lõi): Tìm chuyến, chọn lộ trình, xem giá vé và đặt chỗ.
    2. 🛡️ **Tra Cứu Vé** (`/lookup` — Hoạt động): Tra cứu nhanh thông tin vé và mã QR soát vé.
    3. 🎟️ **Vé Của Tôi** (`/my-tickets` — Hoạt động): Quản lý lịch sử vé của tài khoản cá nhân, đổi/hủy vé trực tuyến.
    4. ⏰ **Lịch Trình** (`/schedule` & `/routes` — Hoạt động hoàn chỉnh): Tra cứu bảng giờ xe xuất bến định kỳ, thông số cự ly, thời gian chạy, tần suất, khoảng giá vé, xem lộ trình điểm đón/trả và chuyển nhanh sang luồng đặt vé.
    5. 🏷️ **Khuyến Mãi** (`/promotions` [HOT] — Roadmap Coming Soon): Voucher giảm giá đến 50% và chương trình hoàn tiền.
    6. ⭐ **Đánh Giá** (`/reviews` — Roadmap Coming Soon): Nhận xét và chấm điểm chất lượng dịch vụ các nhà xe.
    7. 📄 **Chính Sách & FAQ** (`/policy` — Hoạt động): Quy định hành lý, chính sách hoàn hủy và cẩm nang đi xe.
* **Xử lý mượt mà các tính năng đang phát triển & Bắt lỗi 404**:
  * Các tính năng chức năng dự kiến (`/promotions`, `/reviews`...) tự động mở trang `NotFoundPage.tsx` ở chế độ **Lộ trình phát triển (Roadmap Mode)** với thanh tiến độ 3 bước và thời gian ra mắt dự kiến rõ ràng.
  * Mọi đường link sai hoặc không tồn tại (Catch-all route `path="*"`) sẽ hiển thị trang báo lỗi 404 thân thiện, chuyên nghiệp kèm các nút quay về Trang chủ, Đặt vé xe ngay và hotline hỗ trợ 24/7 (`1900 6868`).

![Giao Diện Header Mới Phân Chia Theo Cụm Chức Năng Nghiệp Vụ](docs/screenshots/screenshot_new_header_layout.png)
*Hình 11.38: Thanh điều hướng TravelEasy phân chia theo cụm chức năng nghiệp vụ rõ ràng, tách bạch Tra Cứu Vé và Vé Của Tôi.*

![Giao Diện Tra Cứu Vé Nhanh Độc Lập Không Cần Đăng Nhập](docs/screenshots/screenshot_ticket_lookup_page.png)
*Hình 11.39: Chức năng Tra Cứu Vé độc lập (`/lookup`) tra cứu nhanh bằng mã đặt vé hoặc số điện thoại kèm mã QR lên xe.*

![Trang Roadmap Chức Năng Lịch Trình & Bảng Giờ Chạy Xe](docs/screenshots/screenshot_coming_soon_schedule.png)
*Hình 11.40: Trang Roadmap chuyên nghiệp cho chức năng Lịch Trình Tuyến Xe (`/schedule`) với tiến độ triển khai 3 bước.*

![Trang Roadmap Chức Năng Đánh Giá & Xếp Hạng Nhà Xe](docs/screenshots/screenshot_coming_soon_reviews.png)
*Hình 11.41: Trang Roadmap cho chức năng Đánh Giá & Xếp Hạng Chất Lượng Nhà Xe (`/reviews`).*

![Trang Chính Sách Quy Chế & FAQ](docs/screenshots/screenshot_policy_faq_page.png)
*Hình 11.42: Giao diện Chính Sách & Quy Định FAQ (`/policy`) với các tab hoàn hủy vé, quy định hành lý và cam kết dịch vụ.*

![Trang Báo Lỗi 404 Not Found Khi Nhập Sai URL](docs/screenshots/screenshot_404_wrong_url.png)
*Hình 11.43: Trang 404 Not Found thân thiện khi truy cập vào đường link sai hoặc không tồn tại.*

---

### 11.4.1 Chức Năng Lịch Trình & Bảng Giờ Chạy Xe Khách Liên Tỉnh (`/schedule` & `/routes`)
Nhằm phục vụ nhu cầu khảo sát mạng lưới tuyến đường và giờ xe chạy định kỳ mà không cần phải chọn ngày đi cố định, TravelEasy Platform đã hoàn thiện toàn diện phân hệ **Lịch Trình Xe Khách**:
1. **Bộ chọn tuyến & Đảo chiều 1-chạm (`⇄`)**: Cho phép chọn nhanh điểm đi và điểm đến với danh sách gợi ý tự động (Datalist auto-suggestions) từ CSDL. Hỗ trợ các nút chọn nhanh các tuyến trọng điểm (Sài Gòn ⇄ Đà Lạt, Hà Nội ⇄ Sa Pa, Sài Gòn ⇄ Vũng Tàu, Sài Gòn ⇄ Nha Trang...).
2. **Thẻ tóm tắt thông số tuyến chắt lọc (Route Metrics)**: Hiển thị ngay cự ly (km), thời gian di chuyển dự kiến (~giờ), tần suất chạy xe (phút/chuyến) và khoảng giá vé dao động (min - max).
3. **Tab đối chiếu 2 chiều Đi & Về (Round-Trip Timetable Switcher)**: Dễ dàng chuyển đổi giữa `Chiều Đi: [Điểm Đi] ➔ [Điểm Đến]` và `Chiều Về: [Điểm Đến] ➔ [Điểm Đi]` để hành khách chủ động sắp xếp thời gian công tác và du lịch.
4. **Bộ lọc 4 khung giờ tinh giản**: Lọc nhanh các chuyến chạy trong ngày theo các buổi: Tất cả, Sáng sớm (00-06h), Buổi sáng (06-12h), Buổi chiều (12-18h), Buổi tối (18-24h).
5. **Timeline giờ chạy xe & Lộ trình đón/trả chi tiết**: Mỗi chuyến xe hiển thị trực quan giờ xuất bến, giờ đến dự kiến, tên nhà xe, đánh giá sao, loại xe, số ghế trống và giá vé. Nút Accordion `[📍 Xem danh sách điểm đón & trả dọc đường]` mở rộng lộ trình thứ tự từng trạm đón và trạm trả.
6. **Chuyển tiếp tức thì sang luồng Đặt Vé**: Nút `[Đặt Chuyến Này ➔]` liên kết mượt mà sang trang chọn ghế `/search` với mã chuyến và thông tin lộ trình đã chọn.
7. **Tiện ích In & Tải bảng giờ offline**: Nút `[🖨️ In / Lưu Bảng Giờ]` tối ưu hóa theo định dạng CSS `@media print`, giúp hành khách dễ dàng in ra giấy hoặc lưu file PDF để tra cứu khi di chuyển.
8. **Đồng bộ API Backend**: Cung cấp 2 endpoint công khai `GET /api/v1/trips/schedule` và `GET /api/v1/trips/schedule/routes` tối ưu hóa câu truy vấn, tự động tính toán tần suất và fallback giờ chạy định kỳ cho mọi tuyến đường.

---

### 11.5 Kiến Trúc Lưu Trữ Bền Vững Trên Database Thực (MySQL 8.0 & Zero Data Loss Guarantee)

#### 1. Loại Bỏ Hoàn Toàn In-Memory Mock Data & Chuẩn Hóa RDBMS Thực Tế
* Nhằm giải quyết triệt để tình trạng dữ liệu biến mất sau mỗi lần khởi động lại máy chủ (hiện tượng mock data "ngày có ngày không"), toàn bộ hệ thống phân hệ Backend (`Spring Boot 3.3.4`) đã được ngắt kết nối khỏi cơ sở dữ liệu tạm thời H2 In-Memory và kết nối trực tiếp 100% vào hệ quản trị cơ sở dữ liệu thực tế **MySQL 8.0 Community Server** (`localhost:3306/traveleasy_db`).
* **Chuẩn hóa Collation & Bảng mã**: Cấu hình `utf8mb4_0900_ai_ci` đồng bộ cho database và toàn bộ 18+ bảng thực thể (Entities), loại bỏ hoàn toàn lỗi xung đột bảng mã `Illegal mix of collations` khi thực thi các truy vấn JPQL tìm kiếm (`LIKE %...%`).

#### 2. Nguyên Tắc Bảo Toàn Dữ Liệu Tuyệt Đối (Zero Data Loss Protocol)
* **Chính sách Schema Hibernate**: Đặt cấu hình `spring.jpa.hibernate.ddl-auto: update` cho cả hai profile `default` và `dev`. Tuyệt đối không sử dụng `create` hoặc `create-drop`.
  * Mọi bảng dữ liệu, khóa chính, khóa ngoại, chỉ mục (Index) và dữ liệu nghiệp vụ thực tế được duy trì bền vững theo thời gian.
  * Khi khởi động lại máy chủ backend, Hibernate chỉ đối chiếu và cập nhật các trường mới (nếu có), không bao giờ xóa bảng hay làm rỗng dữ liệu.
* **Cơ chế Khởi tạo Thông minh (Smart Seed Protection)**: Thành phần `DataInitializer` được lập trình logic kiểm tra `userRepository.count() > 0`. Khi phát hiện cơ sở dữ liệu đã tồn tại dữ liệu vận hành, hệ thống lập tức xuất log:
  ```text
  Database already seeded. Skipping DataInitializer.
  ```
  Nhờ đó, dữ liệu của khách hàng, nhà xe, xe, tuyến đường và các giao dịch đặt vé đều được bảo vệ toàn vẹn tuyệt đối.

#### 3. Bộ API Quản Lý Thực Thi Của Đối Tác Nhà Xe (`CompanyManagementController.java`)
Hệ thống bổ sung bộ RESTful Controller chuyên dụng [CompanyManagementController.java](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/backend/src/main/java/com/traveleasy/controller/company/CompanyManagementController.java) kết nối trực tiếp với các repository của Spring Data JPA, cung cấp đầy đủ các thao tác CRUD trên dữ liệu thực tế:
* **Quản lý Chuyến xe (`/api/v1/company/trips`)**:
  * `GET`: Truy vấn danh sách chuyến xe thực tế theo `busCompanyId` kèm lọc theo trạng thái và tuyến đường.
  * `POST`: Tạo mới chuyến xe trên MySQL, tự động tạo đồng thời **34 bản ghi ghế ngồi thực tế** trong bảng `trip_seats` với trạng thái `AVAILABLE`.
  * `PUT /{id}`: Cập nhật giá vé, thời gian khởi hành/kết thúc và thông tin xe.
  * `PATCH /{id}/status`: Cập nhật trạng thái chuyến xe (`SCHEDULED`, `DEPARTED`, `RUNNING`, `COMPLETED`, `CANCELLED`).
  * `DELETE /{id}`: Xóa chuyến xe khỏi database khi chưa phát sinh giao dịch vé.
* **Quản lý Đơn đặt vé (`/api/v1/company/bookings`)**:
  * `GET`: Lấy danh sách toàn bộ vé đặt thuộc các chuyến xe của nhà xe, hỗ trợ phân trang và tìm kiếm theo mã vé/khách hàng.
  * `PATCH /{id}/status`: Cập nhật trạng thái vé trực tiếp (`CONFIRMED`, `CANCELLED`, `COMPLETED`).
* **Quản lý Chính sách Hủy vé (`/api/v1/company/cancellation-policies`)**:
  * `GET`: Lấy danh sách các mốc thời gian hoàn tiền trước giờ khởi hành.
  * `POST`: Thêm chính sách mới (số giờ trước khởi hành, tỷ lệ hoàn tiền %).
  * `DELETE /{id}`: Xóa chính sách hoàn hủy.
* **Quản lý Đánh giá Khách hàng (`/api/v1/company/reviews`)**:
  * `GET`: Truy xuất danh sách đánh giá sao và nhận xét từ hành khách.
  * `POST /{id}/reply`: Phản hồi chính thức từ nhà xe tới khách hàng.
  * `POST /{id}/report`: Báo cáo đánh giá vi phạm quy chuẩn lên Admin sàn.
* **Quản lý Địa điểm & Văn phòng Nhà xe (`/api/v1/company/locations`)**:
  * `GET`: Danh sách các điểm đón, điểm trả và văn phòng giao dịch của nhà xe.
  * `POST`: Đăng ký thêm điểm đón/trả mới.
  * `DELETE /{id}`: Hủy liên kết điểm đón/trả.

#### 4. Báo Cáo Kiểm Thử Lưu Trữ Bền Vững & Minh Chứng Truy Vấn Trực Tiếp Từ MySQL 8.0
Kịch bản kiểm thử tự động `test_db_persistence.mjs` đã thực hiện chuỗi giao dịch thêm mới và sửa đổi dữ liệu thực tế trên hệ thống:
1. **Thêm phương tiện mới**: Tạo xe biển số `51B-117.13` (Limousine 34 phòng) -> Truy vấn MySQL xác nhận bản ghi tồn tại trong bảng `vehicles` với `id: 5`.
2. **Tạo chuyến xe mới**: Tạo chuyến đi Nha Trang giá `360,000 VND` -> Truy vấn MySQL xác nhận chuyến xe lưu trong bảng `trips` với `id: 20`.
3. **Tự động sinh sơ đồ ghế thực**: Kiểm tra bảng `trip_seats` ghi nhận đủ **34 ghế ngồi vật lý** liên kết trực tiếp với chuyến xe `id: 20`.
4. **Cập nhật trạng thái vận hành**: Chuyển trạng thái chuyến xe sang `RUNNING` -> Kiểm tra MySQL xác nhận trường `status` lưu trữ giá trị `RUNNING`.
5. **Tìm kiếm công khai**: Gọi API `/api/v1/trips/search` -> Trả về danh sách đầy đủ 18+ chuyến xe thực tế từ cơ sở dữ liệu MySQL mà không phụ thuộc vào bất kỳ mock data nào.

![Tìm Kiếm Chuyến Xe Trực Tiếp Từ MySQL 8.0](docs/screenshots/screenshot_db_search_trips_live.png)
*Hình 11.44: Giao diện tìm kiếm chuyến xe của hành khách hiển thị dữ liệu thời gian thực từ cơ sở dữ liệu MySQL 8.0 bền vững.*

![Quản Lý Chuyến Xe Đối Tác Trên Database Thực](docs/screenshots/screenshot_db_company_trips_live.png)
*Hình 11.45: Giao diện quản lý chuyến xe đối tác với các thao tác CRUD và cập nhật trạng thái lưu trữ trực tiếp vào MySQL.*

![Danh Sách Xe Nhà Xe Đồng Bộ Trực Tiếp Từ MySQL](docs/screenshots/screenshot_db_company_vehicles_live.png)
*Hình 11.46: Danh sách phương tiện vận tải của nhà xe được đồng bộ chính xác và bảo toàn 100% qua các lần khởi động lại máy chủ.*

---

### 11.6 Hệ Thống CI/CD Pipeline & Triển Khai Containerization Tự Động (GitHub Actions & Docker Compose)

#### 1. Kiến Trúc Pipeline CI/CD Toàn Diện (Enterprise CI/CD Workflow)
Hệ thống TravelEasy tích hợp đường ống tích hợp và triển khai liên tục (CI/CD) tự động hóa thông qua **GitHub Actions** tại [.github/workflows/ci-cd.yml](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/.github/workflows/ci-cd.yml) với 3 giai đoạn (Stages) độc lập và đồng bộ:

```mermaid
flowchart LR
    GitPush["Git Push / PR (main, dev)"] --> BackendCI["1. Backend CI<br/>(Java 21 LTS + Gradle 8.13<br/>Spring Boot bootJar)"]
    GitPush --> FrontendCI["2. Frontend CI<br/>(Node 20 LTS + TypeScript<br/>Vite Production Build)"]
    BackendCI --> Artifacts["Upload Artifacts<br/>(JAR & Dist bundles)"]
    FrontendCI --> Artifacts
    Artifacts --> DockerCD["3. Docker CD & Packaging<br/>(Docker Compose Config &<br/>Build Container Images)"]
    DockerCD --> Ready["Deployment Ready<br/>(Zero-Downtime Ready)"]
```

#### 2. Các Giai Đoạn Trong Đường Ống CI/CD
1. **Giai đoạn 1 - Backend CI (`backend-ci`)**:
   * **Môi trường**: `ubuntu-latest`, **Java 21 LTS** (phân phối Temurin).
   * **Công cụ**: Gradle v3 GitHub Action với cơ chế cache thông minh.
   * **Nhiệm vụ**: Biên dịch toàn bộ mã nguồn Java, đóng gói artifact JAR Spring Boot 3.3.4 (`./gradlew bootJar --no-daemon`).
   * **Lưu trữ Artifact**: Tự động xuất xưởng và lưu trữ file `traveleasy-backend-jar` phục vụ deploy.
2. **Giai đoạn 2 - Frontend CI (`frontend-ci`)**:
   * **Môi trường**: `ubuntu-latest`, **Node.js 20 LTS**.
   * **Nhiệm vụ**: Cài đặt phụ thuộc (`npm install`), kiểm tra kiểu tĩnh TypeScript nghiêm ngặt (`tsc`) và đóng gói tài nguyên tối ưu (`vite build`).
   * **Lưu trữ Artifact**: Tự động lưu trữ gói thư mục tĩnh `frontend/dist` (`traveleasy-frontend-dist`).
3. **Giai đoạn 3 - Docker Containerization & Verification (`docker-cd-verification`)**:
   * **Điều kiện tiên quyết**: Chờ cả 2 giai đoạn `backend-ci` và `frontend-ci` hoàn thành xuất sắc (`needs: [backend-ci, frontend-ci]`).
   * **Xác thực Compose Spec**: Kiểm tra cú pháp và liên kết mạng trong `docker-compose.yml` (`docker compose config`).
   * **Đóng gói Image**: Xây dựng đồng thời các Docker Image chuyên dụng (`traveleasy-backend`, `traveleasy-frontend`, `traveleasy-mysql:8.0`).
   * **Nginx Reverse Proxy**: Tích hợp cấu hình [frontend/nginx.conf](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/frontend/nginx.conf) với SPA routing `try_files $uri $uri/ /index.html;` và tự động điều hướng proxy `/api/` về container `backend:8080`.

#### 3. Khắc Phục Lỗi CI/CD Cốt Lõi Trên GitHub Actions
* **Sự cố Wrapper Jar bị Gitignore**: Trước đây file cấu hình `.gitignore` có quy tắc chặn `*.jar` khiến tệp nhị phân `backend/gradle/wrapper/gradle-wrapper.jar` không được đẩy lên GitHub, dẫn đến runner Linux báo lỗi `ClassNotFoundException: org.gradle.wrapper.GradleWrapperMain`.
* **Giải pháp khắc phục triệt để**:
  1. Thêm ngoại lệ `!**/gradle-wrapper.jar` vào [.gitignore](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/.gitignore).
  2. Bổ sung [.gitattributes](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/.gitattributes) chuẩn hóa ký tự xuống dòng `LF` cho toàn bộ các script khởi chạy Linux `gradlew` và `.sh`.
  3. Cập nhật [backend/Dockerfile](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/backend/Dockerfile) hỗ trợ `dos2unix` và `bash` trong môi trường container Alpine.
  4. Đưa `gradle-wrapper.jar` vào git tracking và kích hoạt pipeline tự động trên mọi nhánh `dev` và `main`.

#### 4. Hướng Dẫn Triển Khai Trực Tiếp Bằng Docker Compose (Single-Command Deployment)
Để triển khai toàn bộ nền tảng TravelEasy (gồm Database MySQL 8.0, Backend Spring Boot và Frontend Nginx React) trên bất kỳ máy chủ nào:
```bash
# 1. Clone repository
git clone -b dev https://github.com/phamcongthanhvn2k6/traveleasy-platform.git
cd traveleasy-platform

# 2. Khởi chạy toàn bộ hệ sinh thái với 1 dòng lệnh duy nhất
docker compose up -d --build

# 3. Kiểm tra trạng thái các container
docker compose ps
```
* **Frontend Application**: Truy cập tại `http://localhost:3000`
* **Backend API & Swagger**: Truy cập tại `http://localhost:8080/swagger-ui.html`
* **MySQL Database 8.0**: Cổng `3306`, database `traveleasy_db`

---

### 11.7 Hoàn Thiện Nghiệp Vụ Vận Hành Tuyến Đường, Thống Kê KPI Thời Gian Thực & Bộ Lọc Tìm Kiếm Đa Chiều

#### 1. Loại Bỏ Triệt Để Dữ Liệu Tĩnh & Kết Nối Tuyến Đường Nhà Xe Vào MySQL 8.0
* **Trước đây**: Trang [CompanyRoutesPage.tsx](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/frontend/src/pages/company/routes/CompanyRoutesPage.tsx) hiển thị 2 dòng dữ liệu mock cố định, các nút "Tạo tuyến mới", "Chỉnh sửa" và "Xóa" chưa có bộ xử lý tương tác với máy chủ.
* **Giải pháp hoàn thiện**:
  * Bổ sung đầy đủ 4 RESTful API vào [CompanyManagementController.java](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/backend/src/main/java/com/traveleasy/controller/company/CompanyManagementController.java):
    * `GET /api/v1/company/routes`: Truy vấn toàn bộ danh sách tuyến đường thực tế từ bảng `routes`.
    * `POST /api/v1/company/routes`: Thêm mới tuyến đường vào MySQL (với điểm đi, điểm đến, thời gian chạy dự kiến và cự ly km).
    * `PUT /api/v1/company/routes/{id}`: Cập nhật lộ trình và thông số cự ly của tuyến.
    * `DELETE /api/v1/company/routes/{id}`: Xóa tuyến đường khỏi CSDL khi chưa gắn với chuyến xe.
  * Tái cấu trúc giao diện `CompanyRoutesPage.tsx` với thanh tìm kiếm thời gian thực, modal thêm mới, modal chỉnh sửa, xác nhận xóa an toàn và thông báo Toast phản hồi trạng thái giao dịch.

#### 2. Thống Kê KPI Dashboard Nhà Xe Thời Gian Thực (`/company/dashboard/stats`)
* Nâng cấp trang [CompanyDashboardPage.tsx](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/frontend/src/pages/company/dashboard/CompanyDashboardPage.tsx) từ các số liệu tĩnh thành bảng điều khiển động (Live Operations Dashboard):
  * Doanh thu tích lũy được tính tổng tự động từ các đơn vé `CONFIRMED` trong bảng `bookings`.
  * Số lượng chuyến xe vận hành và chuyến xe sẵn sàng xuất bến được đếm trực tiếp từ bảng `trips`.
  * Danh sách "Chuyến xe sắp khởi hành" truy xuất trực tiếp các chuyến xe mới nhất từ CSDL kèm mã chuyến, lộ trình, loại xe, số ghế trống và trạng thái vận hành (`RUNNING`, `SCHEDULED`).

#### 3. Chuẩn Hóa Ngôn Ngữ & Trải Nghiệm Giao Diện Đối Tác
* Toàn bộ thanh điều hướng bên [CompanyLayout.tsx](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/frontend/src/components/CompanyLayout.tsx) được chuẩn hóa tiếng Việt có dấu đầy đủ (`Tổng quan`, `Đội xe`, `Địa điểm nhà xe`, `Tuyến đường`, `Chính sách hủy`, `Chuyến xe`, `Đặt vé`, `Đánh giá`, `VẬN HÀNH`, `KINH DOANH`).
* Sửa lỗi lệch múi giờ (UTC Timezone Shift) khi biên tập chuyến xe trong trang [AdminTripsPage.tsx](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/frontend/src/pages/admin/trips/AdminTripsPage.tsx), bảo toàn chính xác giờ khởi hành địa phương (GMT+7) khi lưu trữ vào MySQL.

#### 4. Sửa Lỗi Bộ Lọc Loại Xe Ghế Ngồi (`SEAT` / `SEATER`) Trong Tìm Kiếm
* Khắc phục độ lệch định danh loại xe giữa [FilterSidebar.tsx](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/frontend/src/pages/customer/search/components/FilterSidebar.tsx) (`SEATER`) và backend enum `BusType.java` (`SEAT`).
* Cập nhật logic lọc đa chiều trong [TripSearchPage.tsx](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/frontend/src/pages/customer/search/TripSearchPage.tsx) hỗ trợ tương thích hai chiều, giúp hành khách lọc chính xác xe ghế ngồi, xe giường nằm và xe limousine VIP mà không bị sót chuyến.

![Dashboard Nhà Xe Dữ Liệu Thực Tế MySQL](docs/screenshots/screenshot_company_dashboard_live.png)
*Hình 11.47: Dashboard nhà xe hiển thị KPI doanh thu và chuyến xe sắp tới trực tiếp từ MySQL 8.0.*

![Quản Lý Tuyến Đường Nhà Xe Trên Database Thực](docs/screenshots/screenshot_company_routes_live.png)
*Hình 11.48: Quản lý tuyến đường nhà xe với thao tác CRUD trực tiếp trên database thực.*

![Bộ Lọc Tìm Kiếm Chuyến Xe Đa Chiều](docs/screenshots/screenshot_search_bus_type_filter.png)
*Hình 11.49: Bộ lọc tìm kiếm chuyến xe đa chiều theo giờ chạy, tầm giá, loại xe và hãng xe.*

---

### 11.8 Phân Định Tuyệt Đối Vai Trò Quản Trị Sàn Tổng (Platform Admin) & Đối Tác Nhà Xe (Bus Operator)

#### 1. Định Vị Bản Chất & Sự Tách Bạch Kiến Trúc (Architecture & Role Separation)
Hệ thống TravelEasy được thiết kế theo mô hình **Đa Thuê Bao (Multi-Tenant SaaS Platform)**, phân tách hoàn toàn và tuyệt đối giữa hai cấp độ quản lý:

1. **Quản Trị Sàn Tổng (Platform Admin — `/admin/*`)**:
   * **Đại diện**: Ban điều hành công nghệ và pháp lý của toàn bộ sàn thương mại điện tử TravelEasy Việt Nam.
   * **Trách nhiệm cốt lõi**:
     * Kiểm duyệt hồ sơ pháp lý, phê duyệt hoặc đình chỉ các đơn vị đối tác nhà xe (`Bus Company Management`).
     * Quản lý toàn bộ danh mục tài khoản người dùng (`User Management`: Phân quyền ADMIN, OPERATOR, CUSTOMER, khóa tài khoản vi phạm).
     * Cấu hình hạ tầng sàn: Tham số cổng thanh toán (VNPay, MoMo, ZaloPay), biểu ngữ quảng cáo (Banners), chính sách chung toàn sàn.
     * Xử lý báo cáo tranh chấp, khiếu nại đánh giá vi phạm từ các nhà xe.
     * Giám sát bảo mật và an toàn dữ liệu qua Nhật ký kiểm toán toàn sàn (`System Audit Logs`).
   * **Phạm vi dữ liệu (Data Scope)**: **Toàn cục (System-Wide Global)** — Có quyền xem toàn bộ chuyến xe, toàn bộ tuyến đường và các giao dịch của mọi hãng xe trên hệ thống.

2. **Cổng Điều Hành Đối Tác Nhà Xe (Bus Operator Portal — `/company/*`)**:
   * **Đại diện**: Đơn vị vận tải hành khách cụ thể (Ví dụ: FUTA Phương Trang, Mai Linh, Hoàng Long, Sao Việt...).
   * **Trách nhiệm cốt lõi**:
     * Quản lý và đăng kiểm đội xe riêng của mình (`Vehicle Fleet Management`).
     * Thiết lập danh mục điểm đón/trả và văn phòng trung chuyển riêng (`Pickup & Drop-off Points`).
     * Đăng ký lộ trình và các tuyến đường vận tải được cấp phép (`Registered Routes`).
     * Quy định chính sách hoàn tiền và hủy vé riêng theo từng mốc giờ khởi hành (`Cancellation Policies`).
     * Lập lịch, khởi tạo và điều phối các chuyến xe xuất bến hàng ngày (`Trip Scheduling & Dispatching`).
     * Theo dõi danh sách hành khách và kiểm soát các đơn đặt vé thuộc các chuyến của nhà xe (`Passenger & Booking Management`).
     * Chăm sóc khách hàng và phản hồi trực tiếp các đánh giá sau chuyến đi (`Customer Review Responses`).
   * **Phạm vi dữ liệu (Data Scope)**: **Đơn vị thuê bao độc lập (Tenant-Scoped Isolation)** — Tuyệt đối KHÔNG ĐƯỢC PHÉP xem, chỉnh sửa hay can thiệp vào doanh thu, chuyến xe, đội xe hoặc khách hàng của các nhà xe đối thủ cạnh tranh trên cùng sàn.

---

#### 2. Ma Trận So Sánh Phân Quyền & Ranh Giới Vận Hành (Role & Responsibility Matrix)

| Tiêu chí | Quản Trị Sàn Tổng (Platform Admin) | Đối Tác Nhà Xe (Bus Operator) |
| :--- | :--- | :--- |
| **Vai trò đại diện** | Chủ quản sàn thương mại TravelEasy | Doanh nghiệp vận tải đối tác |
| **Mã quyền bảo vệ** | `ROLE_ADMIN` | `ROLE_OPERATOR` (hoặc Admin sàn được ủy quyền hỗ trợ) |
| **Không gian URL** | `/admin/*` | `/company/*` |
| **Bộ bảo vệ định tuyến** | `AdminAuthGuard.tsx` (Chặn 403 Forbidden nếu không phải Admin) | `CompanyAuthGuard.tsx` (Chặn 403 Forbidden đối với khách hàng phổ thông) |
| **Bộ nhận diện giao diện** | Tông màu Deep Indigo (`#6366f1`) sang trọng, đẳng cấp quản trị sàn | Tông màu Cyan / Emerald (`#0ea5e9`, `#10b981`) năng động, phong cách vận hành thực địa |
| **Huy hiệu phân biệt** | `QUẢN TRỊ SÀN TỔNG (PLATFORM ADMIN)` | `CỔNG ĐIỀU HÀNH NHÀ XE (OPERATOR PORTAL)` |
| **Phạm vi truy vấn dữ liệu** | Toàn bộ cơ sở dữ liệu (`getAllTrips`, `getAllBookings`, `getAllCompanies`) | Bị chặn cứng theo mã định danh nhà xe (`findByBusCompanyId`, `sumRevenueByCompanyId`) |
| **Nút điều hướng chéo** | Không có nút sang cổng đối tác (giữ nguyên không gian tập trung) | Không hiển thị nút quay lại trang admin tổng trên Header |
| **Quản trị người dùng** | Toàn quyền tạo, sửa, khóa tài khoản người dùng và nhà xe | Chỉ quản lý thông tin hành khách đi trên các chuyến xe của mình |
| **Cấu hình thanh toán** | Quản lý Secret Key và cấu hình API VNPay / MoMo sàn | Nhận dòng tiền đối soát định kỳ theo tỷ lệ hoa hồng sàn quy định |

---

#### 3. Cơ Chế Cách Ly Dữ Liệu Đa Thuê Bao (Tenant Isolation Implementation)
Để đảm bảo bí mật kinh doanh giữa các nhà xe trên cùng một nền tảng cơ sở dữ liệu MySQL 8.0, hệ thống triển khai cơ chế lọc dữ liệu cưỡng bức (Forced Tenant Scoping) tại tầng Persistence và Service:

1. **Thống kê Doanh thu & KPI Cách ly**:
   * Tại [BookingRepository.java](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/backend/src/main/java/com/traveleasy/repository/BookingRepository.java):
     ```java
     @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.trip.busCompany.id = :busCompanyId AND b.status = 'CONFIRMED'")
     BigDecimal sumTotalRevenueByBusCompanyId(@Param("busCompanyId") Long busCompanyId);
     ```
   * Doanh thu của Nhà xe A chỉ tính trên các đơn vé `CONFIRMED` thuộc chuyến xe do Nhà xe A vận hành.

2. **Cách ly Danh sách Chuyến xe & Lịch xuất bến**:
   * Tại [TripRepository.java](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/backend/src/main/java/com/traveleasy/repository/TripRepository.java):
     ```java
     List<Trip> findByBusCompanyIdOrderByDepartureTimeDesc(Long busCompanyId);
     Long countByBusCompanyId(Long busCompanyId);
     Long countByBusCompanyIdAndStatus(Long busCompanyId, TripStatus status);
     ```
   * Khi Nhà xe A đăng nhập vào Cổng điều hành, hệ thống gọi `GET /api/v1/company/trips?companyId=1` và chỉ nạp đúng các chuyến xe của Nhà xe A.

3. **Bằng chứng Kiểm thử Cách ly Thực Tế**:
   * **Truy vấn Nhà xe ID = 1 (TravelEasy Express)**:
     * Tổng số chuyến xe: **14 chuyến**
     * Tổng đơn đặt vé: **2 đơn**
     * Doanh thu tích lũy: **1,030,000 VND**
   * **Truy vấn Nhà xe ID = 2 (Đơn vị đối tác khác)**:
     * Tổng số chuyến xe: **0 chuyến**
     * Tổng đơn đặt vé: **0 đơn**
     * Doanh thu tích lũy: **0.00 VND**
   * => Xác nhận 100% dữ liệu được cách ly an toàn, loại bỏ triệt để nguy cơ rò rỉ dữ liệu giữa các hãng xe.

![Giao Diện Quản Trị Sàn Tổng](docs/screenshots/screenshot_platform_admin_trips.png)
*Hình 11.50: Giao diện Quản Trị Sàn Tổng (Platform Admin) với nhận diện Deep Indigo và phạm vi giám sát toàn hệ thống.*

![Giao Diện Cổng Điều Hành Đối Tác Nhà Xe](docs/screenshots/screenshot_partner_operator_dashboard.png)
*Hình 11.51: Giao diện Cổng Điều Hành Đối Tác Nhà Xe (Operator Portal) với nhận diện Cyan/Emerald và dữ liệu phân vùng độc lập.*

---

### 11.9 Làm Giàu & Đa Dạng Hóa Toàn Diện Cơ Sở Dữ Liệu Thực Tế (Comprehensive Database Enrichment)

#### 1. Tổng Quan Quy Mô Dữ Liệu Sau Khi Làm Giàu
Nhằm đáp ứng yêu cầu kiểm thử toàn diện, báo cáo đồ án và trải nghiệm vận hành thực tế sống động, toàn bộ hệ thống cơ sở dữ liệu **MySQL 8.0** (`traveleasy_db`) đã được bổ sung khối lượng lớn dữ liệu nghiệp vụ thực tế, phong phú và chuẩn hóa 100%:

| Thực Thể (Entity) | Trước Khi Làm Giàu | Sau Khi Làm Giàu | Mức Độ Tăng Trưởng | Chi Tiết Nghiệp Vụ Bổ Sung |
| :--- | :---: | :---: | :---: | :--- |
| **Người dùng (`users`)** | 12 | **28** | **+133%** | Đầy đủ tài khoản Admin sàn, Operator của 10 hãng xe và 16 khách hàng 3 miền với SĐT 10 số & mật khẩu chuẩn `Rikkei@123` |
| **Đội xe vận tải (`vehicles`)** | 5 | **26** | **+420%** | Biển số các tỉnh (51B, 29B, 72B, 15B, 43B, 79B...), đủ 3 dòng xe Limousine VIP, Giường nằm 2 tầng, Ghế ngồi cao cấp |
| **Tuyến đường (`routes`)** | 14 | **20** | **+43%** | Mở rộng mạng lưới: Sài Gòn - Cà Mau, Hà Nội - Ninh Bình, Đà Nẵng - Nha Trang, Sài Gòn - Rạch Giá, Châu Đốc |
| **Chuyến xe (`trips`)** | 20 | **101** | **+405%** | Phủ đều các khung giờ (Sáng, Trưa, Tối, Đêm), các ngày (Hôm nay, Ngày mai, Tuần tới, Quá khứ) và trạng thái `SCHEDULED`, `RUNNING`, `COMPLETED` |
| **Sơ đồ ghế ngồi (`trip_seats`)** | 680 | **3,434** | **+405%** | Mỗi chuyến xe có đủ 34 ghế vật lý (Tầng 1 A01-A17, Tầng 2 B01-B17) đồng bộ chính xác với trạng thái `AVAILABLE` / `BOOKED` |
| **Đơn đặt vé (`bookings`)** | 3 | **28** | **+833%** | Mã đơn chuẩn `BK-20261021-XXXX`, đầy đủ thông tin hành khách, điểm đón/trả, phương thức thanh toán VNPay, MoMo, VietQR, COD |
| **Vé điện tử (`tickets`)** | 4 | **38** | **+850%** | Mã vé `TK-*` gắn với từng ghế, mã QR Hash an toàn, trạng thái `ISSUED` hoặc `USED` |
| **Chính sách hoàn hủy (`cancellation_policies`)** | 2 | **7** | **+250%** | Chính sách riêng biệt của các hãng xe (FUTA Phương Trang, Thành Bưởi, Hoa Mai, Sao Việt, Văn Minh...) |
| **Đánh giá & Phản hồi (`review_reports`)** | 3 | **11** | **+267%** | Nhận xét đa dạng từ 3 đến 5 sao về chất lượng xe, độ êm ái, cổng sạc, wifi và thái độ tài xế |
| **Địa danh & Bến xe (`locations`)** | 5 | **14** | **+180%** | Bến xe Miền Đông mới, Bến xe Miền Tây, Bến xe Giáp Bát, Bến xe Nước Ngầm, Bến xe Vũng Tàu, Bến xe Sa Pa... |

---

#### 2. Danh Sách Tài Khoản Thử Nghiệm Chuẩn Hóa
Mọi tài khoản trong hệ thống đều có thể đăng nhập ngay bằng mật khẩu chung: **`123456789@`** *(hoặc `Rikkei@123`)*

1. **Quản Trị Viên Sàn Tổng (Platform Admin)**:
   * `admin@traveleasy.vn` — Quản Trị Viên Hệ Thống
   * `daiphat.admin@traveleasy.vn` — Nguyễn Đại Phát (Admin Phụ Trách Sàn)
   * `phanthanhphong.admin@traveleasy.vn` — Phạm Thanh Phong
2. **Điều Hành Đối Tác Nhà Xe (Bus Operators)** (Đăng nhập tại `/company/login`):
   * `partner@traveleasy.vn` — Điều Hành TravelEasy Express (Nhà xe 1)
   * `dieuhanh@thanhbuoi.com.vn` — Điều Hành Thành Bưởi Limousine (Nhà xe 2)
   * `dieuhanh@xesaoviet.com.vn` — Điều Hành Sao Việt Express (Nhà xe 3)
   * `dieuhanh@kumhosamco.com.vn` — Điều Hành Kumho Samco (Nhà xe 4)
   * `dieuhanh@hoamaivungtau.com.vn` — Điều Hành Xe Hoa Mai Vũng Tàu (Nhà xe 5)
   * `dieuhanh@hoanglongasia.com` — Điều Hành Hoàng Long Asia (Nhà xe 6)
   * `staff@traveleasy.vn` — Nhân Viên Vận Hành Nhà Xe Văn Minh (Nhà xe 7)
   * `dieuhanh@cuctunglimousine.com` — Điều Hành Cúc Tùng Limousine (Nhà xe 8)
   * `dieuhanh@haivan.com` — Điều Hành Xe Hải Vân (Nhà xe 9)
   * `dieuhanh@chinnghia.com.vn` — Điều Hành Xe Chín Nghĩa (Nhà xe 10)
   * `dieuhanh@futabus.vn` — Điều Hành Phương Trang FUTA Bus Lines (Nhà xe 11)
   * `dieuhanh@xekhachlienhung.com` — Điều Hành Xe Khách Liên Hưng (Nhà xe 12)
   * `dieuhanh@halan.com.vn` — Điều Hành Hà Lan Limousine (Nhà xe 13)
   * `dieuhanh@dcarlimousine.vn` — Điều Hành DCar Limousine VIP (Nhà xe 14)
   * `dieuhanh@anphuquy.vn` — Điều Hành An Phú Quý Limousine (Nhà xe 15)
3. **Khách Hàng Trải Nghiệm (Customers)**:
   * `customer@gmail.com` — Nguyễn Văn Du Khách
   * `dangvanlam@gmail.com` — Đặng Văn Lâm
   * `thuylinh.travel@gmail.com` — Nguyễn Thùy Linh
   * `khoi.vu@gmail.com` — Vũ Minh Khôi
   * `haidang.do@gmail.com` — Đỗ Hải Đăng
   * `thaophuong.bui@gmail.com` — Bùi Phương Thảo

---

#### 3. Minh Chứng Trải Nghiệm Giao Diện Với Dữ Liệu Phong Phú

![Danh Sách 28 Người Dùng Hệ Thống Phong Phú](docs/screenshots/screenshot_admin_users_enriched.png)
*Hình 11.52: Giao diện Quản trị Người Dùng hiển thị đầy đủ 28 tài khoản phân loại theo vai trò ADMIN, OPERATOR, CUSTOMER.*

![Hệ Thống 101 Chuyến Xe Toàn Sàn Đa Dạng](docs/screenshots/screenshot_admin_trips_enriched.png)
*Hình 11.53: Giao diện Quản trị Chuyến Xe sàn tổng với hơn 100 chuyến xe đa dạng tuyến đường, loại xe và trạng thái vận hành.*

![Tìm Kiếm Chuyến Xe Của Khách Hàng Với Đa Dạng Lựa Chọn](docs/screenshots/screenshot_customer_search_enriched.png)
*Hình 11.54: Khách hàng tìm kiếm chuyến xe nhận được hàng chục kết quả thời gian thực từ nhiều nhà xe và khung giờ khác nhau.*

![Cổng Điều Hành Đối Tác Quản Lý Chuyến Xe Thực Tế](docs/screenshots/screenshot_company_trips_enriched.png)
*Hình 11.55: Cổng điều hành đối tác nhà xe quản lý lịch xe xuất bến, trạng thái khởi hành và số ghế trống trực tiếp trên MySQL 8.0.*

---

### 11.10 Tối Ưu Hóa Trải Nghiệm Tìm Kiếm: Mặc Định Hiển Thị Toàn Bộ Tuyến Xe & Lọc Linh Hoạt Theo Điểm Đi/Điểm Đến

#### 1. Vấn Đề Gặp Phải Trước Đây (Hardcoded Default Route Lock)
* **Thực trạng**: Khi người dùng nhấn nút "Đặt Vé Xe" từ thanh điều hướng chính (hoặc truy cập `/search`), trang tìm kiếm trước đây bị gắn cứng giá trị mặc định `origin = 'TP. Hồ Chí Minh'` và `destination = 'Đà Lạt'`, đồng thời ép buộc ngày đi là hôm nay.
* **Hạn chế**: Hành khách khi mới vào trang chỉ thấy duy nhất 2 chuyến xe của tuyến Sài Gòn ⇄ Đà Lạt trong ngày, tạo cảm giác hệ thống thiếu hụt dữ liệu và không thể khám phá toàn bộ mạng lưới tuyến đường liên tỉnh phong phú của nền tảng (Hà Nội, Sa Pa, Nha Trang, Vũng Tàu, Cần Thơ, Hải Phòng, Huế, Quy Nhơn...).

#### 2. Giải Pháp Hoàn Thiện: Cơ Chế Hiển Thị Toàn Bộ Tuyến Mở (Open Route Discovery)
1. **Mặc định hiển thị toàn bộ 76+ chuyến xe toàn quốc**:
   * Khi truy cập trang `/search` không kèm tham số bộ lọc, hệ thống tự động gọi API `GET /api/v1/trips/search` không giới hạn điểm đi/điểm đến, tải lên toàn bộ chuyến xe đang mở bán trên toàn quốc.
   * Tiêu đề trang hiển thị trực quan: **Toàn bộ chuyến xe toàn quốc ({totalTrips} chuyến)**.
2. **Hỗ trợ tùy chọn "Tất cả điểm xuất phát" & "Tất cả điểm đến"**:
   * Bộ chọn nơi xuất phát và nơi đến được bổ sung tùy chọn **"Tất cả điểm xuất phát (Toàn quốc)"** và **"Tất cả điểm đến (Toàn quốc)"** (`value=""`).
   * Người dùng có thể lọc linh hoạt:
     * Chỉ chọn nơi đi (ví dụ: `TP. Hồ Chí Minh`): Xem tất cả các chuyến xuất phát từ Sài Gòn đi các tỉnh thành.
     * Chỉ chọn nơi đến (ví dụ: `Đà Lạt`): Xem tất cả các chuyến từ mọi miền đến Đà Lạt.
     * Chọn cả hai: Xem đích danh tuyến đường chỉ định.
3. **Thanh điều hướng ngày linh hoạt (Flexible Date Stepper)**:
   * Cho phép xem chuyến xe của **mọi ngày khởi hành** (không bắt buộc phải chọn cố định một ngày).
   * Bổ sung nút **"✕ Bỏ chọn ngày (Xem mọi ngày)"** và **"Lọc chuyến hôm nay"** giúp hành khách chuyển đổi tức thì giữa chế độ xem tổng thể và xem chi tiết theo ngày.
4. **Nút "Xem toàn bộ tuyến" (Reset Quick Action)**:
   * Khi đang áp dụng bất kỳ bộ lọc điểm đi/điểm đến hay ngày chạy nào, nút **"✕ Xem toàn bộ tuyến"** màu đỏ nổi bật xuất hiện ngay góc trên bên phải, cho phép hành khách hoàn tác nhanh chỉ với 1 cú click.

![Trang Tìm Kiếm Mặc Định Hiển Thị Toàn Bộ Chuyến Xe Toàn Quốc](docs/screenshots/screenshot_search_all_trips_initial.png)
*Hình 11.56: Giao diện Đặt Vé Xe mặc định hiển thị toàn bộ 76+ chuyến xe toàn quốc, sẵn sàng để người dùng lọc theo điểm đi và điểm đến.*

![Lọc Chi Tiết Chuyến Xe Khi Người Dùng Chọn Hành Trình](docs/screenshots/screenshot_search_filtered_trips.png)
*Hình 11.57: Giao diện tự động thu hẹp kết quả chính xác khi người dùng chọn nơi xuất phát và nơi đến, kèm nút "✕ Xem toàn bộ tuyến" tiện lợi.*

---

### 11.11 Hệ Thống Nâng Cấp Toàn Diện (Phase 1, 2, 3): Bộ Tính Năng Enterprise Đột Phá 2026

Nhằm đưa nền tảng **TravelEasy** từ mức MVP vận hành ổn định lên chuẩn **Enterprise-Grade / Production-Ready**, tạo điểm nhấn công nghệ và nghiệp vụ vượt trội khi bảo vệ đồ án tốt nghiệp, hệ thống đã hoàn thiện toàn diện lộ trình 3 giai đoạn:

```mermaid
flowchart LR
    P1["Giai đoạn 1 (Quick-Wins)<br/>• Vé PDF Boarding Pass<br/>• Biểu đồ SVG Doanh thu<br/>• Xuất Excel đón khách"] --> P2["Giai đoạn 2 (Core Commerce)<br/>• Trợ lý AI Du lịch 24/7<br/>• Kho Voucher Khuyến mãi<br/>• Khóa ghế độc quyền 10p"]
    P2 --> P3["Giai đoạn 3 (Enterprise Polish)<br/>• Đối soát tài chính & Hoa hồng<br/>• Gửi Email vé & Hóa đơn VAT<br/>• Bộ test JUnit 5 100% Pass"]
```

---

#### 1. Thẻ Lên Xe & Vé Điện Tử Chuẩn Hãng Vận Tải (`BoardingPassModal.tsx`)
* **Thiết kế chuẩn hãng cao cấp**: Mô phỏng thẻ lên máy bay / cuống vé đục lỗ (perforated coupon) với phong cách xe khách Limousine VIP, dải nhận diện TravelEasy, huy hiệu xác thực và logo in chìm.
* **Mã QR kiểm soát vé**: Tự động mã hóa mã đơn hàng (`BK-...`) và mã vé (`TK-...`) phục vụ quét kiểm tra nhanh tại cửa lên xe.
* **Tải PDF & In ấn chuẩn A4/A5**: Tối ưu hóa `@media print` giúp in hoặc xuất file PDF trực tiếp không bị vỡ layout hay tràn trang.
* **Tích hợp**: Đã gắn tại trang **Tra cứu vé** (`TicketLookupPage.tsx`) và **Vé của tôi** (`MyTicketsPage.tsx`).

---

#### 2. Biểu Đồ Doanh Thu & Tăng Trưởng SVG Tương Tác (`RevenueChart.tsx`)
* **Công nghệ Pure React SVG**: Hoàn toàn không phụ thuộc thư viện bên ngoài nặng nề, tốc độ render cực nhanh, đồ họa vector sắc nét tuyệt đối trên mọi màn hình Retina / 4K.
* **Bộ lọc thời gian 3 chế độ**: Xem theo `7 Ngày Qua`, `30 Ngày Qua` hoặc `Theo Tháng Trong Năm`.
* **Hover tương tác**: Rê chuột lên các điểm dữ liệu để xem chi tiết doanh thu (VNĐ), số lượng vé bán và tỷ lệ lấp đầy ghế.
* **Thẻ chỉ số tài chính (KPIs)**: Tự động tính Doanh thu giai đoạn, Trung bình/ngày và Tỷ lệ tăng trưởng so với kỳ trước.
* **Đa phân hệ**: Tích hợp tông xanh ngọc (`#0d9488`) tại **Cổng Đối Tác Nhà Xe** (`CompanyDashboardPage.tsx`) và tông xanh hoàng gia (`#2563eb`) tại **Cổng Quản Trị Hệ Thống** (`AdminDashboardPage.tsx`).

---

#### 3. Lệnh Điều Xe & Xuất Danh Sách Khách Đi Xe (`PassengerManifestModal.tsx`)
* **Nghiệp vụ xuất bến thực tế**: Cung cấp danh sách hành khách đi xe theo từng chuyến cho Bác tài và Phụ xe (số ghế, họ tên, số điện thoại, điểm đón, điểm trả, ghi chú hành lý).
* **Điểm danh trực tiếp**: Tài xế/Phụ xe có thể click điểm danh từng khách ngay trên màn hình với thanh tiến độ hoàn thành hiển thị trực quan.
* **Xuất file Excel / CSV**: Định dạng UTF-8 BOM chuẩn, mở trực tiếp bằng Microsoft Excel không bao giờ bị lỗi font tiếng Việt.
* **In Lệnh Điều Xe**: Mẫu lệnh xuất bến hành trình chuẩn nghiệp vụ vận tải, có sẵn ô ký tên xác nhận của Tài xế và Trưởng bến điều độ.
* **Tích hợp**: Có mặt tại cả **Quản lý Chuyến xe Nhà xe** (`CompanyTripsPage.tsx`) và **Quản lý Chuyến xe Sàn** (`AdminTripsPage.tsx`).

---

#### 4. Trợ Lý AI Du Lịch Thông Minh 24/7 Toàn Sàn (`AiAssistantWidget.tsx`)
* **Nút bấm nổi thông minh 24/7**: Hiển thị ở góc dưới cùng bên phải màn hình khách hàng với hiệu ứng phát sáng (Glowing Pulse) và huy hiệu `24/7`.
* **Kết nối Backend AI trực tiếp**: Tích hợp với endpoint `/api/v1/ai/chat` của Spring Boot (đã mở quyền công khai, không cần đăng nhập).
* **Điều hướng tuyến xe thông minh (Smart Route Linking)**: Khi AI đề xuất lộ trình (ví dụ: *TP. Hồ Chí Minh ➔ Đà Lạt* hoặc *Hà Nội ➔ Sa Pa*), một thẻ hành động tương tác sẽ xuất hiện ngay trong bong bóng chat. Khách hàng chỉ cần bấm **"Xem vé & Đặt chuyến này ➔"** để tự động chuyển sang trang tìm kiếm với đúng điểm đi/điểm đến.
* **Bộ gợi ý câu hỏi nhanh (Quick Prompts)**: Khách hàng có thể bấm nhanh các câu hỏi phổ biến: Đà Lạt, Nha Trang, Sa Pa, Giường chống say xe, Chính sách hủy vé hoàn tiền, Mã giảm giá.
* **Trải nghiệm mượt mà**: Có hiệu ứng 3 chấm gõ phím của AI (`bounceDot`), mốc thời gian tin nhắn, tự động cuộn xuống cuối (auto-scroll) và nút làm mới hội thoại.

---

#### 5. Kho Voucher & Mã Giảm Giá Khuyến Mãi Tương Tác (`VoucherModal.tsx`)
* **Giải quyết điểm nghẽn trải nghiệm**: Khách hàng không cần phải nhớ hoặc đoán mã giảm giá; ngay dưới ô nhập mã tại bảng thanh toán (`OrderSummaryPanel.tsx`) có nút: **"🎟️ Chọn mã ưu đãi ({count} mã có sẵn)"**.
* **Kho 5 mã ưu đãi thực tế**:
  1. `TRAVELEASY`: Giảm **50.000 đ** cho khách hàng mới (Đơn từ 200.000 đ).
  2. `GIAM20`: Giảm **20%** khi đặt từ 2 vé trở lên (Tối đa 100.000 đ).
  3. `VEXEREVIP`: Giảm **50.000 đ** tri ân khách hàng thân thiết.
  4. `HE2026`: Giảm **30.000 đ** mùa du lịch hè.
  5. `DATSOM20K`: Giảm **20.000 đ** khi đặt trước ngày khởi hành.
* **Áp dụng 1 chạm**: Bấm **"Áp Dụng"** sẽ tự động điền mã, tính toán chiết khấu trừ thẳng vào tổng tiền thanh toán và thông báo Toast thành công. Có cả nút **"Sao chép mã"** tiện lợi.

---

#### 6. Cơ Chế Khóa Giữ Chỗ Độc Quyền 10 Phút (`BusSeatMap.tsx`)
* **Bổ sung trạng thái `LOCKED` (Đang giữ chỗ)**: Sơ đồ ghế 2 tầng giờ đây hỗ trợ đầy đủ 4 trạng thái:
  * ⚪ **Ghế trống**: Màu trắng viền xanh dương (Có thể chọn).
  * 🟠 **Đang chọn**: Màu cam nổi bật.
  * 🟡 **Đang giữ chỗ (10p)**: Màu vàng hổ phách kèm biểu tượng ổ khóa 🔒 (Ghế đang được khách khác thanh toán giữ chỗ, tạm thời bị khóa).
  * 🔘 **Đã bán**: Màu xám (Đã thanh toán thành công).
* **Banner Cam Kết Bảo Lưu Giữ Chỗ**: Bổ sung dải băng thông báo minh bạch: *"Cam kết giữ chỗ độc quyền 10 phút: Ngay khi bấm 'Tiếp tục đặt vé', các ghế đã chọn sẽ chuyển sang trạng thái Giữ Chỗ Độc Quyền để bạn an tâm chuyển khoản thanh toán mà không sợ bị người khác tranh mua."*

---

#### 7. Hệ Thống Đối Soát Doanh Thu & Quyết Toán Hoa Hồng Sàn (`AdminSettlementsPage.tsx` & `CompanySettlementsPage.tsx`)
* **Cổng Quản trị Sàn (`/admin/settlements`)**:
  * **4 thẻ chỉ số tài chính (KPIs)**: Tổng GMV toàn sàn, Hoa hồng sàn thu được (trung bình 8-10%), Số tiền đã giải ngân, Số tiền đang chờ đối soát.
  * **Quy trình duyệt quyết toán 3 bước**: `CHỜ ĐỐI SOÁT` ➔ `ĐÃ CHỐT SỐ LIỆU` ➔ `ĐÃ GIẢI NGÂN CHUYỂN KHOẢN`.
  * **Xuất biên bản tài chính**: Nút xuất file Excel/CSV chuẩn UTF-8 và nút in **Biên bản quyết toán tài chính** khổ A4 chính thức.
  * Tích hợp trực tiếp vào thanh điều hướng Sidebar Admin tại `AdminLayout.tsx`.
* **Cổng Đối tác Nhà xe (`/company/settlements`)**:
  * Hiển thị minh bạch thông tin tài khoản ngân hàng nhận tiền đã xác thực KYC (Vietcombank, MBBank...).
  * Thống kê chi tiết: Doanh thu bán vé, Phí dịch vụ sàn khấu trừ, Số tiền thực nhận về tài khoản ngân hàng và mã giao dịch chuyển khoản.
  * Xuất báo cáo Excel và in biên bản đối soát doanh thu.
  * Tích hợp vào thanh điều hướng Sidebar Đối tác tại `CompanyLayout.tsx`.

---

#### 8. Tự Động Hóa Gửi Vé Điện Tử & Hóa Đơn VAT Qua Email (`EmailTicketModal.tsx`)
* **Mô phỏng Email HTML chuyên nghiệp**: Khung xem trước (Email Preview) sống động với dải màu gradient TravelEasy, mã đơn đặt chỗ, thông tin lộ trình, vị trí ghế, điểm đón và mã QR quét vé.
* **Tùy chọn Xuất hóa đơn GTGT (VAT)**: Tích hợp ô nhập Mã số thuế và Tên doanh nghiệp/Cơ quan để xuất hóa đơn điện tử cho khách hàng đi công tác.
* **Gửi lại vé tức thì**: Khách hàng hoặc nhân viên nhà xe có thể nhập email bất kỳ và bấm **"Gửi Vé Ngay"** để hệ thống gửi thư xác nhận.
* **Tích hợp**: Đã gắn nút `Gửi Vé Qua Email / VAT` tại cả trang **Tra cứu vé** (`TicketLookupPage.tsx`) và **Vé của tôi** (`MyTicketsPage.tsx`).

---

#### 9. Bộ Kiểm Thử Tự Động Backend Đạt 100% Pass (JUnit 5 + Mockito)
* **Kiểm thử Trợ lý AI (`AiServiceTest.java`)**:
  * Kiểm thử tư vấn lộ trình Đà Lạt, Nha Trang, Sa Pa.
  * Kiểm thử giải đáp chính sách hủy vé và phản hồi chào mừng (5/5 tests pass).
* **Kiểm thử Nghiệp vụ Đặt Vé (`BookingServiceTest.java`)**:
  * Kiểm thử bắt lỗi khi không tìm thấy chuyến xe (`RESOURCE_NOT_FOUND`).
  * Kiểm thử chặn đặt vé khi chuyến xe đã đóng bán / tạm hủy (`VALIDATION_ERROR`).
  * Kiểm thử cơ chế khóa ghế chống đặt trùng (`SEAT_ALREADY_BOOKED`) khi ghế đã có người mua (3/3 tests pass).
* **Khắc phục triệt để lỗi đường dẫn Unicode trên Windows trong Gradle**: Cấu hình cơ chế tự động phân giải đường dẫn 8.3 short path (`MYTNH~1`) trong `build.gradle`, đảm bảo lệnh `./gradlew test` chạy mượt mà không bao giờ bị lỗi `ClassNotFoundException` do thư mục `Máy tính`.

---

| STT | Tính Năng Mới Bổ Sung | Phân Hệ Phục Vụ | File Thành Phần Cốt Lõi | Trạng Thái |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Thẻ Lên Xe & Vé PDF | Khách Hàng | `frontend/src/components/BoardingPassModal.tsx` | ✅ Đã duyệt |
| 2 | Biểu Đồ Doanh Thu SVG | Quản Trị & Đối Tác | `frontend/src/components/RevenueChart.tsx` | ✅ Đã duyệt |
| 3 | Lệnh Xuất Bến & Điểm Danh | Đối Tác & Quản Trị | `frontend/src/components/PassengerManifestModal.tsx` | ✅ Đã duyệt |
| 4 | Trợ Lý AI Du Lịch 24/7 | Khách Hàng | `frontend/src/components/AiAssistantWidget.tsx` | ✅ Đã duyệt |
| 5 | Kho Voucher & Khuyến Mãi | Khách Hàng | `frontend/src/components/VoucherModal.tsx` | ✅ Đã duyệt |
| 6 | Khóa Giữ Chỗ 10 Phút | Khách Hàng | `frontend/src/components/BusSeatMap.tsx` | ✅ Đã duyệt |
| 7 | Đối Soát Doanh Thu Sàn | Quản Trị Viên Sàn | `frontend/src/pages/admin/settlements/AdminSettlementsPage.tsx` | ✅ Đã duyệt |
| 8 | Đối Soát Nhận Tiền Nhà Xe | Đối Tác Nhà Xe | `frontend/src/pages/company/settlements/CompanySettlementsPage.tsx` | ✅ Đã duyệt |
| 9 | Gửi Vé & Hóa Đơn VAT Email | Khách Hàng | `frontend/src/components/EmailTicketModal.tsx` | ✅ Đã duyệt |
| 10 | Suite Kiểm Thử Tự Động | Backend | `backend/src/test/java/com/traveleasy/service/` | ✅ 16/16 Pass |
| 11 | Real-time SSE Khóa Ghế | Toàn Sàn Real-time | `SeatRealtimeService.java` & `TripResultCard.tsx` | ✅ Đã triển khai |
| 12 | Cổng Thanh Toán PayOS MB Bank | Khách Hàng & Thanh Toán | `PayOsService.java` & `QrPaymentModal.tsx` | ✅ Đã tích hợp |

---

### 11.12 Cơ Chế Real-time SSE: Khóa Giữ Chỗ & Đồng Bộ Trạng Thái Ghế Thời Gian Thực (Màu Vàng / Xám)

Để giải quyết bài toán cốt lõi trong sàn thương mại vận tải hành khách (tương tự **Vexere**, **Vietnam Airlines**, **CGV Cinemas**), hệ thống đã kích hoạt thành công cơ chế **Server-Sent Events (SSE)** giúp sơ đồ ghế **tự động biến đổi màu theo thời gian thực (Zero-Reload UI)** khi có khách hàng khác đang thao tác:

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Khách Hàng A (Đang Mua)
    participant ClientA as Trình Duyệt A
    participant Backend as Spring Boot (SSE & DB)
    participant ClientB as Trình Duyệt B
    actor UserB as Khách Hàng B (Đang Xem)

    ClientB->>Backend: GET /api/v1/trips/{id}/seats/stream (Kết nối SSE)
    Backend-->>ClientB: Event "INIT" (SSE Live Connected)
    
    UserA->>ClientA: Chọn ghế A02 & Bấm "Tiếp Tục Đặt Vé"
    ClientA->>Backend: POST /api/v1/trips/{id}/seats/hold (Ghế: A02)
    Backend->>Backend: Khóa DB & Chuyển trạng thái sang LOCKED (Hạn 10p)
    Backend-->>ClientB: Event "SEAT_UPDATE" (Ghế: A02, Status: LOCKED)
    Note over ClientB: Ghế A02 tự động đổi sang MÀU VÀNG (LOCKED)<br/>(Hiển thị icon Khóa, vô hiệu hóa click)

    alt Khách A Thanh Toán Thành Công
        UserA->>ClientA: Xác nhận thanh toán đơn vé
        ClientA->>Backend: POST /api/v1/bookings
        Backend->>Backend: Cập nhật BOOKED & Sinh vé TK-...
        Backend-->>ClientB: Event "SEAT_UPDATE" (Ghế: A02, Status: BOOKED)
        Note over ClientB: Ghế A02 lập tức chuyển sang MÀU XÁM (BOOKED)<br/>(Đã bán - Bất khả dụng)
    else Khách A Hủy Hoặc Hết Hạn 10 Phút
        Backend->>Backend: Scheduler tự động nhả ghế sang AVAILABLE
        Backend-->>ClientB: Event "SEAT_UPDATE" (Ghế: A02, Status: AVAILABLE)
        Note over ClientB: Ghế A02 tự động chuyển về MÀU TRẮNG (AVAILABLE)<br/>(Mở lại cho người khác đặt)
    end
```

#### 1. Các Quy Tắc Hiển Thị Màu & Trạng Thái Ghế Real-time
* ⚪ **Trắng viền xanh (`AVAILABLE`)**: Ghế trống hoàn toàn, khách hàng được tự do bấm chọn.
* 🟠 **Màu Cam (`SELECTED`)**: Ghế đang được chính người dùng hiện tại chọn mua (tối đa 6 vé/lần).
* 🟡 **Màu Vàng Hổ Phách (`LOCKED`)**: Ghế đang có khách hàng khác tiến hành thanh toán giữ chỗ trong 10 phút. Tự động hiển thị biểu tượng ổ khóa `🔒`, kèm nhãn `Giữ chỗ` và vô hiệu hóa không cho bấm.
* ⚫ **Màu Xám Tro (`BOOKED`)**: Ghế đã được thanh toán thành công và xuất vé điện tử chính thức (`Đã bán`).

#### 2. Cơ Chế Chống Xung Đột Trực Tiếp (Conflict Auto-Deselect)
* Khi **Khách hàng B** đang chọn ghế `A02` trên màn hình của mình, nếu **Khách hàng A** nhanh tay hơn bấm vào thanh toán trước:
  * Sự kiện SSE lập tức truyền xuống máy Khách B.
  * Ghế `A02` tự động bị gỡ khỏi danh sách ghế đã chọn của Khách B.
  * Hệ thống phát cảnh báo Toast vàng: *"Ghế A02 vừa có khách khác giữ chỗ thanh toán (Màu Vàng)! Hệ thống đã tự động gỡ ghế khỏi đơn của bạn."*

#### 3. Bảng Điều Khiển Giả Lập Real-time Cho Thầy Cô / Ban Giám Khảo Kiểm Thử 1 Chạm
* Ngay trên sơ đồ ghế (`TripResultCard.tsx`), hệ thống trang bị thanh công cụ:  
  **`[🧪 Thử Nghiệm Real-time (Đổi màu Vàng / Xám trực tiếp)]`**:
  * Cho phép chọn ghế bất kỳ (Ví dụ: `A02`, `A03`, `B01`).
  * Nút `🟡 Đổi Vàng (Đang TT)`: Kích hoạt ghế sang `LOCKED` (Màu Vàng).
  * Nút `⚫ Đổi Xám (Đã Bán)`: Kích hoạt ghế sang `BOOKED` (Màu Xám).
  * Nút `⚪ Trả Về Trống`: Mở lại ghế thành `AVAILABLE` (Màu Trắng).
  * Giúp kiểm tra trọn vẹn cơ chế đổi màu mượt mà với hiệu ứng chuyển động CSS 0.3s ngay trên một màn hình hoặc mở 2 tab song song mà không tốn công tạo tài khoản phụ.

---

### 11.13 Tích Hợp Cổng Thanh Toán Trực Tuyến PayOS (Liên Kết Ngân Hàng Quân Đội MB Bank)

Hệ thống đã tích hợp chính thức cổng thanh toán **PayOS** — giải pháp thanh toán tự động qua mã VietQR Napas 24/7 hàng đầu Việt Nam:

* **Tài khoản thụ hưởng doanh nghiệp / Trưởng nhóm**:
  * **Ngân hàng**: **MB Bank (Ngân hàng Quân Đội - BIN: 970422)**
  * **Số tài khoản**: **`0944 3543 98`** (`0944354398`)
  * **Chủ tài khoản**: **`PHAM CONG THANH`**
* **Thông số API Kênh thanh toán**:
  * `Client ID`: `a187b55f-6c8a-499b-886b-722fcc0c3039`
  * `Api Key`: `b8a86931-3e77-4787-8acd-322dceb91f70`
  * `Webhook URL`: `/api/v1/payments/payos/webhook`
* **Quy trình thanh toán PayOS**:
  1. Khách hàng chọn phương thức **"Cổng PayOS — Quét mã VietQR MB Bank"**.
  2. Backend tự động khởi tạo đơn thanh toán qua PayOS API kèm chữ ký bảo mật HMAC-SHA256 chuẩn ngân hàng.
  3. Mã VietQR động được tạo chính xác với số tiền vé và nội dung chuyển khoản `TRAVELEASY {Mã booking}`.
  4. Nút bấm **"🔗 Mở Cổng Thanh Toán PayOS (Trang Chính Thức)"** cho phép khách hàng chuyển hướng trực tiếp sang trang thanh toán chính thức của PayOS nếu muốn.
  5. Khi ngân hàng MB nhận được tiền, Webhook PayOS bắn tín hiệu về backend tự động kích hoạt vé điện tử (`ISSUED`) và cập nhật đơn đặt vé sang `CONFIRMED`.
  6. Hệ thống duy trì song song nút **"⚡ Xác Nhận Chuyển Khoản Demo"** giúp thầy cô và giám khảo kiểm thử thành công 100% trong vòng 1 click mà không lo trừ tiền tài khoản thực tế.

---

---

### 11.14 Hệ Thống Kiểm Soát Dữ Liệu Đầu Vào (Backend Validation), Xử Lý Ngoại Lệ Tập Trung & Khắc Phục Luồng Nghiệp Vụ Gây Lỗi

Hệ thống đã được củng cố toàn diện tầng Backend nhằm đảm bảo tính toàn vẹn dữ liệu, kiểm soát luồng nghiệp vụ chặt chẽ và ngăn chặn triệt để các lỗ hổng / ngoại lệ phát sinh trong quá trình vận hành:

#### 1. Kiến Trúc Xử Lý Ngoại Lệ Tập Trung Toàn Diện (`GlobalExceptionHandler`)
* Cấu trúc phản hồi lỗi chuẩn RESTful qua `ApiResponse<T>`:
  * `success: false`
  * `message: String` (thông điệp lỗi thân thiện bằng tiếng Việt)
  * `errors: Map<String, String>` (danh sách chi tiết từng trường bị lỗi định dạng / ràng buộc, hỗ trợ Frontend highlight ô nhập liệu màu đỏ)
  * `timestamp: LocalDateTime`
* **Xử lý chuyên sâu 11 nhóm ngoại lệ tiêu chuẩn**:
  1. `MethodArgumentNotValidException`: Bắt lỗi bean validation `@Valid` từ các Request DTO và trả về mã lỗi 400 kèm chi tiết từng field lỗi.
  2. `ConstraintViolationException`: Bắt lỗi vi phạm ràng buộc trên query parameter và path variable (400 Bad Request).
  3. `HttpMessageNotReadableException`: Bắt lỗi JSON sai cú pháp hoặc truyền giá trị enum không hợp lệ (400 Bad Request).
  4. `MethodArgumentTypeMismatchException`: Bắt lỗi sai kiểu dữ liệu tham số trên URL (VD: truyền chuỗi chữ vào ID kiểu số) (400 Bad Request).
  5. `MissingServletRequestParameterException`: Bắt lỗi thiếu tham số bắt buộc `@RequestParam` (400 Bad Request).
  6. `HttpRequestMethodNotSupportedException`: Xử lý khi gọi sai method HTTP (trả về 405 Method Not Allowed).
  7. `AccessDeniedException`: Chặn truy cập trái quyền và trả về 403 Forbidden thay vì lỗi hệ thống.
  8. `DataIntegrityViolationException`: Bắt lỗi vi phạm ràng buộc toàn vẹn cơ sở dữ liệu MySQL (Unique key, Foreign key) và trả về 409 Conflict với thông điệp nghiệp vụ rõ ràng, không làm lộ tên bảng hoặc câu lệnh SQL nội bộ.
  9. `IllegalArgumentException` & `IllegalStateException`: Bắt lỗi nghiệp vụ tham số không hợp lệ (400 Bad Request).
  10. `NoResourceFoundException`: Bắt đường dẫn API hoặc tài nguyên tĩnh không tồn tại và trả về 404 Not Found.
  11. `Exception (Fallback Handler)`: Bắt lỗi bất ngờ ở mức hệ thống, tự động ghi log lỗi bằng SLF4J và trả về mã 500 kèm thông điệp bảo mật, tuyệt đối không làm lộ stack trace ra môi trường sản xuất.

#### 2. Chuẩn Hóa Ràng Buộc Dữ Liệu (Jakarta Bean Validation) Trên Toàn Bộ DTOs
* **`CreateBookingRequest`**: Kiểm soát số điện thoại định dạng chuẩn Việt Nam (`^(0|\+84)[0-9]{9,10}$`), kiểm tra định dạng email `@Email`, bắt buộc danh sách ghế chọn không được rỗng (`@NotEmpty`).
* **`CreateTripRequest` & `UpdateTripRequest`**: Ràng buộc giá vé tối thiểu từ 1.000 VNĐ (`@DecimalMin("1000")`), số ghế xe hợp lệ từ 1 đến 100 ghế (`@Min(1)`, `@Max(100)`).
* **`CreateRouteRequest`**: Ràng buộc thời gian di chuyển dự kiến phải lớn hơn 0 giờ (`@DecimalMin("0.1")`) và quãng đường tối thiểu từ 1 km (`@DecimalMin("1.0")`).
* **`CreateBusCompanyRequest`**: Ràng buộc số hotline nhà xe theo chuẩn tổng đài hoặc di động (`^(0|\+84|1900|1800)[0-9]{6,10}$`).
* **`ChangePasswordRequest` & `UpdateProfileRequest`**: Bắt buộc mật khẩu mới tối thiểu 6 ký tự, số điện thoại đúng định dạng.
* Kích hoạt đầy đủ chú thích `@Valid` trên tất cả các Controller (`BookingController`, `AdminTripController`, `CompanyManagementController`, `AdminManagementController`, `AuthController`).

#### 3. Khắc Phục Triệt Để 7 Luồng Nghiệp Vụ Gây Lỗi (Error-prone Flows)
1. **Chặn đặt vé cho chuyến xe trong quá khứ**: `BookingService.createBooking()` kiểm tra chặt chẽ `trip.getDepartureTime() >= LocalDateTime.now()` và trạng thái chuyến `TripStatus.SCHEDULED`.
2. **Chặn hủy vé / đổi chuyến sau khi xe đã xuất bến**: Khi chuyến xe đã khởi hành hoặc đơn vé đã ở trạng thái `COMPLETED`, hệ thống từ chối hủy/đổi và hướng dẫn liên hệ trực tiếp nhà xe.
3. **Chặn đổi vé (Reschedule) sang cùng chuyến và ghế hiện tại**: Phát hiện và báo lỗi ngay nếu hành khách chọn lại chính chuyến xe và ghế đang ngồi.
4. **Ngăn chặn xóa cứng gây lỗi khóa ngoại (Foreign Key Integrity)**:
   * Không cho phép xóa chuyến xe (`AdminTripService.deleteTrip()`) nếu đã có hành khách đặt vé trong CSDL (`bookingRepository.existsByTripId`). Thay vào đó yêu cầu chuyển trạng thái chuyến sang `CANCELLED`.
   * Không cho phép xóa nhà xe hoặc tuyến đường nếu đang có các chuyến xe trực thuộc đang hoạt động.
   * Không cho phép xóa người dùng nếu tài khoản đã có lịch sử đơn vé (chuyển sang khóa tài khoản `LOCKED`).
5. **Chống trùng lặp số điện thoại khi cập nhật Profile**: `AuthService.updateProfile()` kiểm tra tính duy nhất của số điện thoại qua `existsByPhoneAndIdNot`, tránh xung đột định danh.
6. **Chống đổi mật khẩu trùng mật khẩu cũ**: `AuthService.changePassword()` bắt buộc mật khẩu mới phải khác mật khẩu hiện tại.
7. **Cơ chế Idempotency cho Webhook thanh toán**: `PaymentService.confirmVietQrTransfer()` tự động kiểm tra nếu đơn vé đã được thanh toán thành công từ trước thì trả kết quả thành công ngay, tránh ghi đè dữ liệu hoặc xuất vé trùng khi Webhook gửi nhiều lần.
8. **Chống quét trùng vé & Gian lận soát vé QR (`BookingService.checkInTicket()`)**:
   * Khi soát vé lần đầu: Hệ thống chuyển trạng thái vé sang `USED`, lưu mốc thời gian khách lên xe (`boardedAt = now()`), trả về trạng thái xác thực `validationStatus = "VALID"` kèm thông điệp `"✓ VÉ HỢP LỆ — ĐÃ XÁC NHẬN LÊN XE THÀNH CÔNG"` và cờ `checkInAllowed = false` (chốt vé đã hoàn thành check-in).
   * Khi quét lại vé đã ở trạng thái `USED`: Hệ thống ném ngay ngoại lệ `AppException(VALIDATION_ERROR, "CẢNH BÁO: Vé này đã được soát lên xe trước đó rồi!")` (HTTP 400 Bad Request kèm mốc giờ lên xe). Màn hình `/scanner` bật cảnh báo đỏ toàn màn hình kèm âm thanh còi hú, chặn tuyệt đối hành vi dùng vé lặp lại hoặc gian lận lên xe lần 2.
9. **Cô lập dữ liệu Đa đối tác Nhà xe (Strict Multi-Tenancy Tenant Isolation)**:
   * Bổ sung trường `busCompanyId` trực tiếp vào Entity `User` (ánh xạ cột `bus_company_id`) và phản hồi đăng nhập `AuthResponse`.
   * Khi Admin phê duyệt hồ sơ đối tác KYB (`AdminManagementService.approveCompany()`), hệ thống tự động khởi tạo tài khoản Quản trị nhà xe (`ROLE_OPERATOR`) và khóa cứng `operator.busCompanyId(company.getId())`.
   * Cổng Đối tác Nhà xe (`frontend/src/utils/companyHelper.ts`) tự động nhận diện và khóa phạm vi làm việc theo `user.busCompanyId`, ngăn ngừa triệt để việc nhà xe này xem hoặc sửa đổi chuyến xe, sơ đồ ghế, soát vé hoặc doanh thu của nhà xe khác.
10. **Tự động giải phóng ghế Hard-Hold sau 10 phút (Automated Booking Expiration Cleanup)**:
   * Tác vụ nền định kỳ 60 giây (`@Scheduled(fixedDelay = 60000)` trong `TripAutomationService`) kích hoạt phương thức `bookingService.cleanupExpiredPendingBookings(10)`.
   * Tự động quét toàn bộ đơn đặt vé `Booking` ở trạng thái `PENDING` quá 10 phút chưa thanh toán, cập nhật trạng thái đơn sang `CANCELLED`, hủy vé `Ticket` sang `CANCELLED`, giải phóng ghế `TripSeat.status` từ `HARD_HELD` về lại `AVAILABLE`, tăng lại số ghế khả dụng của chuyến `availableSeats`.
   * Đồng thời phát tín hiệu thời gian thực (Real-time Broadcast) qua STOMP/WebSocket (`SeatRealtimeService`) tới toàn bộ các máy khách đang xem sơ đồ ghế để lập tức mở khóa ghế sang màu trắng/xanh.

---

---
*Tài liệu Master Specification được ban hành chính thức bởi Nhóm trưởng Phạm Công Thành — Nhóm 7.*  
*Chúc toàn đội bảo vệ thành công rực rỡ!*


---

## 12. HƯỚNG DẪN TOÀN DIỆN CHO THÀNH VIÊN: TEST TÍNH NĂNG, CHỤP ẢNH MINH CHỨNG & LẬP BIÊN BẢN NGHIỆM THU (DEADLINE HẾT NGÀY MAI)

> 📢 **THÔNG BÁO QUAN TRỌNG TỪ NHÓM TRƯỞNG PHẠM CÔNG THÀNH:**  
> Hệ thống TravelEasy Platform đã cơ bản hoàn thiện toàn bộ tính năng trên 3 Phân hệ (Company, Admin, Users). Để chuẩn bị cho buổi bảo vệ đồ án tốt nghiệp đạt điểm số 100/100, **TOÀN BỘ 100% THÀNH VIÊN TRONG NHÓM PHẢI THAM GIA KIỂM THỬ TRỰC TIẾP** trên máy cá nhân theo đúng các trang chức năng đã được phân công.  
> 
> ⏰ **Hạn chót hoàn thành (Deadline)**: **Trước 23:59:00 HẾT NGÀY MAI (02/11/2026)**.  
> 💬 **Kênh hỗ trợ**: *"Nếu có bất kỳ thắc mắc kỹ thuật hoặc phát sinh lỗi nào trong quá trình kiểm thử, hãy **nhắn tin riêng trực tiếp cho Nhóm trưởng (Thành)** để được hỗ trợ gỡ rối ngay lập tức!"*

---

### 12.1 Quy trình 7 bước "Đường đi nước bước" dành cho thành viên

Toàn bộ thành viên thực hiện nghiêm ngặt theo chu trình 7 bước sau:

```
[Bước 1: Kéo code mới nhất từ dev]
       │
       ▼
[Bước 2: Tạo nhánh kiểm thử: test/<tên>-acceptance-testing]
       │
       ▼
[Bước 3: Khởi chạy Backend & Frontend trên máy cá nhân]
       │
       ▼
[Bước 4: Test từng trang chức năng theo đúng phân công]
       │
       ▼
[Bước 5: Chụp ảnh màn hình minh chứng -> docs/screenshots/]
       │
       ▼
[Bước 6: Ghi nhận kết quả & nhận xét vào Biên bản nghiệm thu]
       │
       ▼
[Bước 7: Commit chuẩn Conventional Commits & Mở Pull Request]
```

#### 🔹 Bước 1: Kéo toàn bộ mã nguồn cập nhật mới nhất từ nhánh `dev`
Mở Terminal (PowerShell trên Windows) tại thư mục gốc dự án:
```powershell
git checkout dev
git pull origin dev
```

#### 🔹 Bước 2: Tạo nhánh kiểm thử nghiệm thu cá nhân
Tạo nhánh mới tách từ `dev` theo đúng định danh của bạn:
* **Thành**: `git checkout -b test/thanh-company-acceptance`
* **Phát**: `git checkout -b test/phat-admin-acceptance`
* **Phong**: `git checkout -b test/phong-booking-acceptance`
* **Đức**: `git checkout -b test/duc-customer-acceptance`
* **Cường**: `git checkout -b test/cuong-mobile-acceptance`

#### 🔹 Bước 3: Khởi chạy dự án cục bộ (Local Environment)
Mở 2 cửa sổ Terminal song song:
```powershell
# Terminal 1: Khởi động Backend Spring Boot (Port 8080)
.\gradlew.bat bootRun

# Terminal 2: Khởi động Frontend React Vite (Port 5173)
cd frontend ; npm install ; npm run dev
```
Truy cập ứng dụng trên trình duyệt: `http://localhost:5173`

#### 🔹 Bước 4: Kiểm thử chi tiết từng trang chức năng theo phân công
* Mở từng đường dẫn trang web được phân công (xem Ma trận tại Mục 12.2).
* Kiểm tra các thao tác: Tìm kiếm, lọc dữ liệu, thêm mới, sửa, xóa, chuyển tab, xem modal popup.
* Kiểm tra tính tương thích hiển thị Responsive trên Desktop, Tablet (iPad) và Mobile (F12 Responsive Mode).
* Mở **Console (F12)** kiểm tra xem có phát sinh lỗi đỏ (`Uncaught Error`) hay cảnh báo bất thường nào không.

#### 🔹 Bước 5: Chụp ảnh màn hình minh chứng & Lưu vào `docs/screenshots/`
* Chụp ảnh màn hình rõ nét thể hiện giao diện trang đang hoạt động bình thường hoặc kết quả sau khi thao tác thành công.
* **Quy chuẩn đặt tên file ảnh bắt buộc** (Lưu trực tiếp vào thư mục `docs/screenshots/`):
  * Cổng Company (Thành): `test_company_<tên-trang>.png` (ví dụ: `test_company_dashboard.png`)
  * Cổng Admin (Phát): `test_admin_<tên-trang>.png` (ví dụ: `test_admin_trips.png`)
  * Cổng Đặt vé & Master Data (Phong): `test_core_<tên-trang>.png` (ví dụ: `test_core_search_seatmap.png`)
  * Cổng Khách hàng (Đức): `test_customer_<tên-trang>.png` (ví dụ: `test_customer_my_tickets.png`)
  * Cổng Di động & Media (Cường): `test_mobile_<tên-trang>.png` (ví dụ: `test_mobile_qr_scanner.png`)

#### 🔹 Bước 6: Cập nhật kết quả vào Biên bản nghiệm thu dự án
Mở file tài liệu nghiệm thu chính:
[`docs/05-qa-and-testing/BIEN_BAN_NGHIEM_THU_KIEM_THU_TINH_NANG_NHOM_7.md`](docs/05-qa-and-testing/BIEN_BAN_NGHIEM_THU_KIEM_THU_TINH_NANG_NHOM_7.md)
Tìm đến bảng phân công của mình, cập nhật cột **Trạng thái thực tế** (`PASS`), đường dẫn ảnh screenshot và viết 2-3 câu nhận xét đánh giá trải nghiệm thực tế.

#### 🔹 Bước 7: Commit, Push lên GitHub và Mở Pull Request
```powershell
# Thêm file ảnh và file biên bản vào staging:
git add docs/screenshots/ docs/05-qa-and-testing/BIEN_BAN_NGHIEM_THU_KIEM_THU_TINH_NANG_NHOM_7.md

# Tạo commit chuẩn Conventional Commits:
git commit -m "test(acceptance): hoàn thành kiểm thử tính năng và bổ sung minh chứng nghiệm thu [Tên Bạn]"

# Đẩy nhánh lên GitHub:
git push -u origin <tên-nhánh-kiểm-thử>
```
Truy cập GitHub Repository và bấm **"Compare & pull request"** trỏ vào nhánh đích `dev`. Gán Reviewer cho Nhóm trưởng **Phạm Công Thành** để duyệt nghiệm thu!

---

### 12.2 Ma trận phân công kiểm thử nghiệm thu theo Trang chức năng

| Thành viên & Vai trò | Phân hệ & Số lượng Trang | Đường Dẫn URL Kiểm Thử | Tài khoản đăng nhập test |
|:---|:---:|:---|:---|
| **1. Phạm Công Thành**<br/>*(Team Leader & Architect)* | **Cổng Đối Tác Nhà Xe (10 Trang)** | `/company/login`, `/company/dashboard`, `/company/trips`, `/company/bookings`, `/company/vehicles`, `/company/locations`, `/company/routes`, `/company/settlements`, `/company/cancellation-policies`, `/company/reviews` | `operator@futa.vn`<br/>`dieuhanh@xesaoviet.com.vn`<br/>Mật khẩu: `123456789@` |
| **2. Nguyễn Đại Phát**<br/>*(Admin Lead & Full-Stack)* | **Cổng Quản Trị Sàn Tổng (10 Trang)** | `/admin/login`, `/admin/dashboard`, `/admin/trips`, `/admin/users`, `/admin/bus-companies`, `/admin/routes`, `/admin/bookings`, `/admin/settlements`, `/admin/cancellation-policies`, `/admin/audit-logs` | `daiphat.admin@traveleasy.vn`<br/>`admin@traveleasy.vn`<br/>Mật khẩu: `123456789@` |
| **3. Phạm Thanh Phong**<br/>*(Core Booking & Seat Engine)* | **Khối Lõi Đặt Vé & Master Data (6 Trang)** | `/search` (Tìm kiếm & Sơ đồ ghế 2 tầng VIP), `/checkout` (Thanh toán đa kênh VietQR/VNPAY), `/admin/locations` (Bến xe), `/admin/seat-types` (Hạng ghế), `/admin/seat-templates` (Mẫu xe), `/admin/gateways` (Cổng thanh toán) | Mở 2 tab ẩn danh song song giả lập khách đặt trùng ghế (Pessimistic Lock) |
| **4. Trần Minh Đức**<br/>*(Full-Stack Developer)* | **Khách Hàng & Quản Lý Vé (4 Trang)** | `/my-tickets` (Vé của tôi & Hủy vé hoàn tiền tự động), `/profile` (Hồ sơ cá nhân & Đổi mật khẩu), `/login` & `/register` (Đăng nhập/Ký khách hàng), `/promotions` (Kho voucher ưu đãi) | `customer@gmail.com`<br/>`minhduc@gmail.com`<br/>Mật khẩu: `123456789@` |
| **5. Đoàn Nhật Cường**<br/>*(Frontend & Mobile Specialist)* | **Di Động, Offline & QR Scanner (5 Trang)** | `/` (Trang chủ), `/lookup` (Tra cứu vé Offline & Lộ trình), `/scanner` (📷 Quét mã QR Camera trong 0.2s), `/schedule` (Lịch trình xe toàn quốc), `/reviews` & `/guide` (Đánh giá review & Cẩm nang FAQ) | Khách công cộng & Thiết bị Di động (Mobile / Camera) |
| *(Phan Trung Kiên)* | *(0 Trang)* | *(Miễn thực tập OJT theo quyết định đào tạo của Nhà trường / Doanh nghiệp)* | *(N/A)* |

---
