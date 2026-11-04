# BÁO CÁO TỔNG KẾT & NGHIỆM THU SPRINT 1
> **Đơn vị:** Nhóm 7 — Dự Án TravelEasy  
> **Thời gian:** 2 tuần (Tuần 1 - Tuần 2)  
> **Trạng thái:** ✅ Hoàn thành 100% (52/52 Story Points)  

---

## 1. THÔNG SỐ VẬN HÀNH SPRINT 1
| Chỉ Số Đo Lường | Giá Trị Nghiệm Thu Thực Tế |
| :--- | :--- |
| **Thời gian thực hiện** | 2 tuần (Từ Tuần 1 đến hết Tuần 2) |
| **Mục tiêu Sprint (Sprint Goal)** | Xây dựng hạ tầng kỹ thuật, mô hình CSDL 36 bảng, phân quyền RBAC JWT, nạp Master Data |
| **Tổng số Story Points cam kết** | 52 Story Points (15 Tasks) |
| **Tổng số Story Points hoàn thành** | **52 / 52 Story Points (Đạt 100% kế hoạch)** |
| **Số task chuyển tiếp (Rollover)** | **0 Task (Không phát sinh nợ kỹ thuật)** |

---

## 2. ĐÓNG GÓP CỦA CÁC THÀNH VIÊN
| Thành Viên | Vai Trò Chuyên Trách | Story Points | Kết Quả Đóng Góp Chính |
| :--- | :--- | :---: | :--- |
| **Phạm Công Thành** | Team Leader & Architect | 15 SP | Dựng khung Spring Boot 3, thiết kế CSDL 36 bảng, cấu hình Docker Compose |
| **Nguyễn Đại Phát** | Admin Lead & Full-Stack | 14 SP | Xây dựng UI Admin, danh mục Tỉnh thành, Bến xe, Sơ đồ mẫu ghế master |
| **Trần Đức** | Backend Core Developer | 12 SP | Hiện thực hóa Security Filter JWT, phân quyền RBAC 3 vai trò, Seed Master Data |
| **Nguyễn Văn A** | Frontend Developer | 11 SP | Xây dựng Header/Footer chuẩn VeXeRe, Layout chuẩn SEO, Routing React |

---

## 3. CHI TIẾT SẢN PHẨM BÀN GIAO (DELIVERABLES)
1. **Module Xác Thực JWT & RBAC:** Phân tầng Controller -> Service -> Repository. Lớp `JwtAuthenticationFilter` chặn lọc và xác thực mọi request an toàn.
2. **Cơ Sở Dữ Liệu PostgreSQL:** Tệp tin `schema.sql` 36 bảng quan hệ, khóa ngoại, index và cờ xóa mềm `is_deleted`.
3. **Cổng Quản Trị Danh Mục (Admin):** Quản lý Tỉnh/Thành phố, Bến xe toàn quốc, Mẫu sơ đồ 34 phòng limousine với đầy đủ Thêm/Sửa/Lọc/Xóa mềm.
4. **Bộ Tài Liệu Kỹ Thuật:** Class Diagram, ERD, Deployment Guide đầy đủ.

---

## 4. KỲ HỌP CẢI TIẾN SPRINT (SPRINT RETROSPECTIVE)
* **What Went Well:** Tốc độ thiết kế CSDL và khởi tạo dự án nhanh, hoàn thành trước 2 ngày; phối hợp Backend - Frontend ăn ý.
* **What Could Be Improved:** Bổ sung thêm chỉ mục (index) cho các bảng giao dịch để tăng tốc độ tìm kiếm trong Sprint 2.
