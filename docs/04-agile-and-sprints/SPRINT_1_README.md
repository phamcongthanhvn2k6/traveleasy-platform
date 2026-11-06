# 📘 SPRINT 1 README — NỀN TẢNG KIẾN TRÚC, CSDL & MASTER DATA
> **Dự án:** Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy  
> **Đơn vị:** OJT Đồ Án Nhóm 7  
> **Thời gian thực hiện:** Tuần 1 (Sprint 1 — Nền tảng Kiến trúc, CSDL & Master Data)  
> **Trạng thái:** ✅ **DONE (100% Hoàn thành)**  
> **Quy mô danh mục:** 19 Thẻ cốt lõi | 32 Story Points (Chuẩn hóa Scrum 1 tuần)  

---

## 🎯 1. MỤC TIÊU SPRINT (SPRINT GOAL)
Xây dựng nền tảng hạ tầng kỹ thuật vững chắc, mô hình hóa cơ sở dữ liệu quan hệ hoàn chỉnh, thiết lập kiến trúc Modular Monolith cho cả Frontend và Backend, thiết lập cơ chế xác thực/phân quyền RBAC chuẩn bảo mật và nạp dữ liệu danh mục toàn quốc (Master Data).

---

## 👥 2. PHÂN CÔNG THÀNH VIÊN (RACI)

| Thành viên | Vai trò | Trọng tâm công việc Sprint 1 |
|:---|:---|:---|
| **Phạm Công Thành** | Team Leader & System Architect | Thiết kế kiến trúc tổng thể, khởi tạo Spring Boot 3 + React Vite, dựng Docker Compose, thiết kế CSDL 36 bảng trên Supabase, tích hợp Spring Security 6 + JWT. |
| **Nguyễn Đại Phát** | Admin Lead & Full-Stack | Xây dựng khung giao diện Cổng Quản trị Admin (`/admin`), thiết lập layout Dashboard, chuẩn bị các API danh mục hệ thống. |
| **Phạm Thanh Phong** | Core Booking & Seat Engine | Thiết kế mô hình dữ liệu Chuyến xe, Xe, Tuyến đường; xây dựng cấu trúc sơ đồ ghế Limousine 34 phòng VIP; chuẩn bị cấu trúc seed data. |
| **Đoàn Nhật Cường** | Mobile Specialist | Khởi tạo cấu trúc giao diện Responsive Mobile-First trên React, xây dựng Header/Footer chuẩn nhận diện TravelEasy, chuẩn bị khung Trang chủ (`/`). |
| **Trần Minh Đức** | Customer Portal | Xây dựng màn hình Đăng ký, Đăng nhập (`/login`, `/register`), validation form bằng Zod/React Hook Form, tích hợp lưu trữ Token bảo mật. |
| **Phan Trung Kiên** | Thành viên | Miễn thực tập OJT (Exempted) theo quyết định đào tạo. |

---

## 📋 3. PHẠM VI & HẠNG MỤC CÔNG VIỆC CHÍNH (SPRINT BACKLOG)

### 3.1. Nền tảng Kiến trúc & DevOps
- Khởi tạo Backend: Spring Boot 3.3.4, Java 17, Gradle/Maven, Lombok, MapStruct, Spring Data JPA.
- Khởi tạo Frontend: React 18.3, Vite, TailwindCSS, Lucide Icons, Axios, React Router v6.
- Docker hóa môi trường phát triển: `docker-compose.yml` gồm PostgreSQL, Backend, Frontend.
- Quy chuẩn Git: Phân nhánh `main`, `dev`, `feature/*`, chuẩn conventional commit `feat:`, `fix:`, `docs:`.

### 3.2. Cơ sở dữ liệu & Master Data
- Thiết kế và triển khai 36 bảng chuẩn hóa 3NF trên Supabase PostgreSQL Cloud.
- Thiết lập khóa ngoại, chỉ mục (Index) trên các cột tìm kiếm thường xuyên (`departure_date`, `route_id`, `status`).
- Seed dữ liệu danh mục:
  - 10+ Bến xe trung tâm (Bến xe Miền Đông, Bến xe Miền Tây, Mỹ Đình, Giáp Bát...).
  - Tuyến đường huyết mạch: Sài Gòn ⇄ Đà Lạt, Sài Gòn ⇄ Nha Trang, Hà Nội ⇄ SaPa.
  - Sơ đồ mẫu xe khách: Limousine 34 buồng phòng VIP 2 tầng, Giường nằm 40 chỗ.

### 3.3. Bảo mật & Xác thực (Security & RBAC)
- Triển khai **Stateless JWT Bearer Token** với Access Token & Refresh Token.
- Phân quyền 3 vai trò độc lập:
  - `ROLE_CUSTOMER`: Hành khách đặt vé, quản lý lịch sử.
  - `ROLE_COMPANY`: Nhà xe quản lý chuyến, xe, tài xế, tài chính.
  - `ROLE_ADMIN`: Ban quản trị sàn kiểm soát toàn hệ thống.
- Mã hóa mật khẩu người dùng với thuật toán BCrypt.

---

## 📦 4. SẢN PHẨM BÀN GIAO (DELIVERABLES)
1. Source code repository đầy đủ cấu trúc `/backend` và `/frontend`.
2. Script CSDL chuẩn `schema.sql` và dữ liệu ban đầu.
3. Tài liệu kiến trúc `PROJECT_ARCHITECTURE.md` và thiết kế dữ liệu `database_design.md`.
4. Môi trường Docker chạy lệnh `docker-compose up -d` là toàn bộ hệ thống hoạt động.

---

## 🏆 5. KẾT QUẢ NGHIỆM THU & TIÊU CHÍ HOÀN THÀNH (DoD)
- ✅ 100% API xác thực (Đăng ký, Đăng nhập, Refresh Token) vượt qua kiểm thử Postman.
- ✅ Kết nối CSDL Supabase Cloud ổn định, không lỗi kết nối connection pool.
- ✅ Đăng nhập phân quyền chính xác: Khách hàng, Nhà xe và Admin được chuyển hướng đúng cổng tương ứng.
- ✅ Tổng kết: **19/19 Thẻ hoàn thành (32 SP) — Đạt 100% mục tiêu Sprint 1 (Cột 'Done Sprint 1' trên Trello)**.

