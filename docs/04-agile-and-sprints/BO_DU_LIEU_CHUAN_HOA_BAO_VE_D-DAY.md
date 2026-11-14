# 🎯 BỘ DỮ LIỆU CHUẨN HÓA PHỤC VỤ BÁO CÁO BẢO VỆ ĐỒ ÁN (D-DAY: 20/11/2026)

> **Dự án**: Nền Tảng Đặt Vé & Quản Lý Nhà Xe Liên Tỉnh Trực Tuyến — **TravelEasy**  
> **Ngày bảo vệ chính thức (D-Day)**: **Thứ Sáu, 20/11/2026**  
> **Tuần lễ bảo vệ**: **18/11/2026 — 22/11/2026**  
> **Cơ sở dữ liệu đám mây trực tiếp**: Supabase Cloud PostgreSQL (`ctvcwhdepzyvqsncbslf`)

---

## 1. TỔNG QUAN HIỆN TRẠNG DỮ LIỆU ĐÃ NẠP TRÊN SUPABASE CLOUD

Hệ thống đã được nạp dữ liệu hoàn chỉnh 100%, không sử dụng mockdata tĩnh, tuân thủ nghiêm ngặt toàn bộ Check Constraints, Foreign Keys và Business Rules của PostgreSQL:

| Ngày Khởi Hành | Thứ Trong Tuần | Số Lượng Chuyến Xe | Số Tuyến Đường Hoạt Động | Số Nhà Xe Tham Gia | Số Ghế Khởi Tạo & Quản Lý | Tổ Lái Xe & Kiểm Tra An Toàn |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **18/11/2026** | Thứ Tư | **56 chuyến** | 13 tuyến | 7 nhà xe lớn | 1,904 ghế | 56 tổ lái (Đạt chuẩn 0.00 mg/L) |
| **19/11/2026** | Thứ Năm | **56 chuyến** | 13 tuyến | 7 nhà xe lớn | 1,904 ghế | 56 tổ lái (Đạt chuẩn 0.00 mg/L) |
| **20/11/2026** | **Thứ Sáu (D-Day)** | **56 chuyến** | **13 tuyến** | **7 nhà xe lớn** | **1,904 ghế** | **56 tổ lái (Đạt chuẩn 0.00 mg/L)** |
| **21/11/2026** | Thứ Bảy | **40 chuyến** | 13 tuyến | 7 nhà xe lớn | 1,360 ghế | 40 tổ lái (Đạt chuẩn 0.00 mg/L) |
| **22/11/2026** | Chủ Nhật | **40 chuyến** | 13 tuyến | 7 nhà xe lớn | 1,360 ghế | 40 tổ lái (Đạt chuẩn 0.00 mg/L) |
| **TỔNG CỘNG** | **Tuần Bảo Vệ** | **248 chuyến xe** | **13 tuyến** | **7 nhà xe** | **8,432 ghế xe** | **248 biên bản kiểm định an toàn** |

---

## 2. 13 TUYẾN ĐƯỜNG HUYẾT MẠCH & 7 NHÀ XE THƯƠNG HIỆU LỚN

Dữ liệu bao phủ đầy đủ cả 3 miền Bắc - Trung - Nam:

1. **TP. Hồ Chí Minh ⇄ Đà Lạt** (Tuyến trọng điểm Demo): Phương Trang (FUTA), Thành Bưởi (Giá: 320.000đ - 390.000đ).
2. **TP. Hồ Chí Minh ⇄ Nha Trang**: Phương Trang, Cúc Tùng Limousine (Giá: 320.000đ - 420.000đ).
3. **TP. Hồ Chí Minh ⇄ Cần Thơ**: Phương Trang, Thành Bưởi (Giá: 180.000đ - 220.000đ).
4. **TP. Hồ Chí Minh ⇄ Vũng Tàu**: Xe Khách Hoa Mai Limousine VIP (Giá: 190.000đ).
5. **Hà Nội ⇄ Sa Pa**: Xe Sao Việt Limousine Cabin (Giá: 450.000đ).
6. **Hà Nội ⇄ Đà Nẵng**: Hoàng Long Asia Giường Nằm Xuyên Việt (Giá: 550.000đ).
7. **Đà Nẵng ⇄ Cố Đô Huế**: Phương Trang FUTA qua hầm Hải Vân (Giá: 120.000đ).
8. **Đà Nẵng ⇄ Quy Nhơn**: Xe Chín Nghĩa (Giá: 250.000đ).

---

## 3. THÔNG TIN TÀI KHOẢN & DỮ LIỆU DEMO KỊCH BẢN TRỌNG ĐIỂM

Tất cả tài khoản hệ thống sử dụng mật khẩu chung: `123456789@`

### 3.1. Tài Khoản Khách Hàng (Demo Luồng Đặt Vé, Tra Cứu, Ví Điểm & Quét QR)
- **Email**: `customer@gmail.com`
- **Mật khẩu**: `123456789@`
- **Tên hiển thị**: Nguyễn Văn Du Khách (SĐT: `0912345678`)
- **Ví tích điểm thưởng (Loyalty Points)**: 120 điểm khả dụng (đã tích lũy 150 điểm, sử dụng 30 điểm).
- **Vé có sẵn trong ngày bảo vệ (20/11/2026)**:
  - **Mã đơn đặt**: `TE-2026-1120-01`
  - **Trạng thái**: `CONFIRMED` — Tổng tiền: `780.000 VNĐ`
  - **Chuyến xe**: 22:30 ngày 20/11/2026 | Tuyến TP.HCM ➔ Đà Lạt | FUTA Limousine VIP
  - **Chi tiết vé**:
    - Vé 1: Mã `TK-2026-1120-A01` — Ghế `A01` — Trạng thái `ISSUED` — QR Hash: `TE-FUTA-SGN-DLI-A01-20261120`
    - Vé 2: Mã `TK-2026-1120-A02` — Ghế `A02` — Trạng thái `ISSUED` — QR Hash: `TE-FUTA-SGN-DLI-A02-20261120`
  - 👉 *Hiệu quả*: Khi đăng nhập vào `localhost:5173`, thanh thông báo "Nhắc nhở khởi hành" sẽ ngay lập tức kích hoạt, khách bấm vào "Xem vé của tôi" hoặc "/my-tickets" sẽ thấy ngay vé hiển thị sắc nét cùng mã QR động sẵn sàng cho nhà xe soát vé.

### 3.2. Tài Khoản Đối Tác Nhà Xe (Demo Cổng Portal Nhà Xe & Phê Duyệt An Toàn)
- **Email**: `partner@traveleasy.vn`
- **Mật khẩu**: `123456789@`
- **Nhà xe quản lý**: Phương Trang (FUTA Bus Lines)
- **Tính năng demo**:
  - Quản lý chuyến xe ngày 20/11/2026.
  - Sơ đồ ghế thực tế (Ghế A01, A02 đã chuyển trạng thái `BOOKED`, các ghế khác sẵn sàng).
  - Soát vé QR Code trực tiếp từ camera / máy quét.
  - Quản lý tổ lái & biên bản nồng độ cồn (`0.00 mg/L`, thời gian lái xe liên tục `< 4h`).

### 3.3. Tài Khoản Quản Trị Sàn (Admin Toàn Quyền)
- **Email**: `admin@traveleasy.vn`
- **Mật khẩu**: `123456789@`
- **Tính năng demo**:
  - Dashboard tổng quan doanh thu toàn sàn, số vé bán, số chuyến vận hành.
  - Quản lý danh mục tuyến đường, nhà xe liên kết, mã khuyến mại (`promotions`).

---

## 4. DỮ LIỆU TÍNH NĂNG NÂNG CAO ĐÃ CHUẨN HÓA

### 4.1. Bản Đồ Giám Sát GPS Tracking Trực Tuyến (`/tracking`)
- **Biển số xe Live Demo**: `51B-889.99`
- **Chuyến xe**: Sài Gòn ➔ Nha Trang (20:30)
- **Tài xế**: Nguyễn Văn Hùng (GPLX Hạng E, Đạt chuẩn nồng độ cồn 0.00 mg/L)
- **Tọa độ trực tiếp**: Chạy dọc Quốc lộ 1A / Cao tốc Dầu Giây - Phan Thiết, tự động tính toán ETA và trạm dừng chân.

### 4.2. Danh Sách Mã Khuyến Mại Hợp Lệ (`promotions`)
Tất cả các voucher sau đều có hiệu lực xuyên suốt năm 2026 - 2027:
- `DALATVIP`: Giảm ngay 50.000đ cho chuyến đi Đà Lạt (Đơn từ 250.000đ).
- `SAPA20`: Giảm 20% tối đa 100.000đ tuyến Hà Nội - Sa Pa.
- `WELCOME50`: Giảm 15% tối đa 80.000đ cho khách hàng mới.
- `PAYOS50`: Giảm 30.000đ khi thanh toán qua cổng thanh toán trực tuyến.
- `VETAO15`: Giảm 15% tối đa 60.000đ.
- `HOTLINE10`: Giảm 10% tối đa 50.000đ.

### 4.3. Dịch Vụ Thuê Xe Trọn Chuyến (`charter_requests` & `charter_bids`)
- **Yêu cầu thuê xe**: Công Ty Du Lịch Sài Gòn Mới thuê xe 29 chỗ TP.HCM ➔ Vũng Tàu.
- **Ngày khởi hành**: 21/11/2026 — Ngày về: 22/11/2026.
- **Báo giá cạnh tranh có sẵn**: Phương Trang FUTA chào giá trọn gói 4.500.000đ (Đặt cọc 1.500.000đ qua Escrow).

### 4.4. Dịch Vụ Ký Gửi Hàng Hóa (`cargo_orders`)
- **Mã vận đơn**: `CG-2026-889901`
- **Tuyến**: TP.HCM ➔ Đà Lạt (Trọng lượng: 3.5 kg, Cước phí: 75.000đ đã thanh toán).
- **Mã OTP nhận hàng**: `889922` — Trạng thái: `RECEIVED_AT_TERMINAL` (Đã nhập kho tại bến).

---

## 5. KỊCH BẢN DEMO 15 PHÚT TỐI ƯU CHO BUỔI BẢO VỆ

| Thời Gian | Phân Hệ Demo | Nội Dung Trình Bày Chi Tiết | Dữ Liệu Sử Dụng |
| :---: | :---: | :--- | :--- |
| **00:00 - 02:00** | **Giới thiệu** | Giới thiệu thành viên nhóm 7, mục tiêu đề tài, bài toán thực tiễn và kiến trúc Microservices/Monolith mở rộng. | Slide thuyết trình |
| **02:00 - 06:00** | **Khách Hàng (Customer Web)** | - Tìm kiếm chuyến xe: TP.HCM ➔ Đà Lạt ngày **20/11/2026**.<br>- Xem danh sách 6 chuyến xe đa dạng (FUTA, Thành Bưởi).<br>- Chọn ghế trực quan trên sơ đồ xe 2 tầng 34 phòng.<br>- Áp dụng mã giảm giá `DALATVIP` trừ tiền thành công.<br>- Đăng nhập `customer@gmail.com` để xem 2 vé có sẵn kèm QR Code động. | Tuyến 1, ngày 20/11/2026, Voucher `DALATVIP` |
| **06:00 - 09:00** | **Giám Sát & Tiện Ích** | - Demo GPS Live Tracking xe `51B-889.99` cập nhật tọa độ thời gian thực trên bản đồ Leaflet.<br>- Xem thông tin an toàn tổ lái, nồng độ cồn 0.00 mg/L.<br>- Tra cứu đơn hàng ký gửi `CG-2026-889901` bằng mã OTP `889922`. | Biển số `51B-889.99`, Mã `CG-2026-889901` |
| **09:00 - 12:00** | **Nhà Xe (Operator Portal)** | - Đăng nhập `partner@traveleasy.vn`.<br>- Xem danh sách chuyến bay/chuyến xe xuất bến ngày 20/11.<br>- Thực hiện quét/soát vé QR Code `TK-2026-1120-A01`.<br>- Quản lý kiểm định tổ lái trước giờ xuất bến. | Tài khoản Partner FUTA |
| **12:00 - 14:00** | **Quản Trị Sàn (Admin)** | - Đăng nhập `admin@traveleasy.vn`.<br>- Báo cáo tổng thể doanh thu, cấu hình chính sách hủy vé, quản lý nhà xe liên kết. | Tài khoản Admin |
| **14:00 - 15:00** | **Kết Luận & Q&A** | Tổng kết thành quả đạt được, bài học kinh nghiệm và sẵn sàng cho phần hỏi đáp của Hội đồng. | Slide & Q&A |

---
*Tài liệu đã được cập nhật và kiểm thử trực tiếp trên hệ thống cơ sở dữ liệu Supabase ngày 15/11/2026.*
