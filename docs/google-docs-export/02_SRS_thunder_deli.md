# ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) — HỆ THỐNG TRAVELEASY
> **Đề tài:** Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh Toàn Quốc (VeXeRe Architecture Clone)  
> **Mã dự án:** PRJ-TRAVELEASY-MVP-01  
> **Đơn vị thực hiện:** Nhóm 7 — OJT Capstone Project  
> **Trạng thái:** Hoàn thiện (Verified)  

---

> [!NOTE]
> Hệ thống giải quyết triệt để 3 bài toán: (1) Trùng vé, trùng ghế giường nằm dịp cao điểm; (2) Thất thoát doanh thu vé và khó khăn trong thanh toán số; (3) Thiếu tính minh bạch trong đối soát hoa hồng nhà xe.

## 1. GIỚI THIỆU & THÔNG TIN DỰ ÁN
* **Tên hệ thống:** TravelEasy Enterprise Transport Platform
* **Thành viên thực hiện:** Phạm Công Thành (Leader), Nguyễn Đại Phát, Trần Đức, Nguyễn Văn A
* **Tech Stack:** Spring Boot 3.2 (Java 17) + React 18 / TypeScript / Tailwind CSS / Vite + CSDL Supabase PostgreSQL 15 + Docker Compose

---

## 2. KIẾN TRÚC PHÂN HỆ VÀ TÁC NHÂN
### 2.1 Ba phân hệ cổng làm việc độc lập
1. **Cổng Khách Hàng (Customer Portal - `/`):** Tìm kiếm chuyến xe đa tiêu chí, chọn vị trí giường nằm 34 phòng Limousine VIP 2 tầng, khóa giữ chỗ 10 phút Pessimistic Lock, thanh toán VietQR PayOS / VNPAY / COD, tra cứu vé qua mã PNR.
2. **Cổng Nhà Xe Đối Tác (Company Portal - `/company/*`):** Quản lý đội xe, tài xế, khai báo tuyến đường, trạm đón/trả với ETA chính xác, tạo lịch chạy tự động sinh 34 ghế, giám sát bán vé, xem báo cáo doanh thu và đối soát ví tiền.
3. **Cổng Quản Trị Sàn (Admin Portal - `/admin/*`):** Quản lý Master Data toàn quốc, thẩm định cấp phép nhà xe (KYB), phê duyệt Admin 2 tầng (Root Admin vs Sub-Admin), quản trị cổng thanh toán, đối soát ký quỹ Escrow chu kỳ 15 ngày, Audit Log toàn sàn.

### 2.2 Bảng Ma Trận RACI
| Nhóm Nghiệp Vụ | Khách Hàng | Nhà Xe | Sub-Admin | Root Admin |
| :--- | :--- | :--- | :--- | :--- |
| **Tìm chuyến & Đặt giữ chỗ 10p** | Thực hiện (R) | Xem (I) | Giám sát (I) | Giám sát (I) |
| **Quản lý xe, tài xế & chuyến** | Không quyền | Chịu trách nhiệm (A) | Hỗ trợ (C) | Toàn quyền (A) |
| **Đăng ký đối tác & Thẩm định KYB** | Không quyền | Nộp hồ sơ (R) | Thẩm định (R) | Phê duyệt cuối (A) |
| **Đối soát doanh thu & Ký quỹ** | Không quyền | Đề nghị rút (R) | Xác nhận đối soát (R) | Giải ngân (A) |
| **Thêm/Xóa Admin & Audit Log** | Không quyền | Không quyền | Đề xuất duyệt | Phê duyệt độc quyền (A) |

---

## 3. CÁC QUY TRÌNH NGHIỆP VỤ CỐT LÕI
### 3.1 Khóa giữ chỗ chống xung đột ghế (Pessimistic Locking)
Khi khách chọn giường (ví dụ: Phòng 01 Tầng dưới), hệ thống kích hoạt cơ chế khóa giữ chỗ tạm thời (TEMPORARY_HOLD) trong 10 phút. Trong thời gian này, không có hành khách nào khác có thể chọn hoặc thanh toán vị trí này. Quá 10 phút không thanh toán, hệ thống tự động giải phóng chỗ về trạng thái AVAILABLE.

### 3.2 Thanh toán & Ký quỹ Escrow
Hỗ trợ 3 phương thức: VietQR PayOS, VNPAY Gateway, COD (Tiền mặt). Tiền thanh toán trực tuyến được sàn TravelEasy tạm giữ trong tài khoản ký quỹ Escrow. Sau khi chuyến xe xuất bến an toàn, tiền mới được chuyển sang số dư khả dụng của nhà xe trong kỳ đối soát 15 ngày.

### 3.3 Chuẩn Xóa Mềm 100% (Soft Delete Compliance)
Tất cả bảng dữ liệu cốt lõi (users, bus_companies, locations, seat_templates, banners, routes, trips) đều áp dụng cơ chế Soft Delete (cờ `is_deleted`). Nghiêm cấm hoàn toàn xóa cứng trên trang Admin để bảo toàn lịch sử kiểm toán.

### 3.4 Phân quyền 2 tầng & Duyệt tạo Admin
Chỉ Root System Admin (`admin@traveleasy.vn`) có quyền bổ nhiệm Admin. Yêu cầu tạo Admin từ Sub-Admin sẽ được lưu vào bảng `admin_creation_requests` và cần Root Admin phê duyệt mới được cấp tài khoản.
