# 📗 SPRINT 2 README — ĐỘNG CƠ ĐẶT VÉ LÕI & HAI CỔNG QUẢN TRỊ
> **Dự án:** Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy  
> **Đơn vị:** OJT Đồ Án Nhóm 7  
> **Thời gian thực hiện:** Tuần 3 - Tuần 4  
> **Trạng thái:** ✅ **NGHIỆM THU (Đạt 88.6% - 62/70 SP, 16/18 Tasks)**  
> **Tồn đọng chuyển tiếp Sprint 3:** 2 Tasks (8 SP)  
> **Biên bản báo cáo chi tiết:** [BAO_CAO_TONG_KET_SPRINT_2_VA_KE_HOACH_SPRINT_3.md](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/docs/04-agile-and-sprints/BAO_CAO_TONG_KET_SPRINT_2_VA_KE_HOACH_SPRINT_3.md)  

---

## 🎯 1. MỤC TIÊU SPRINT (SPRINT GOAL)
Hiện thực hóa toàn bộ luồng nghiệp vụ kinh doanh cốt lõi (Core Booking Flow): Tìm kiếm chuyến xe, Sơ đồ chọn ghế trực quan 34 phòng Limousine VIP, thuật toán khóa giữ chỗ chống tranh chấp ghế (Pessimistic Locking), thanh toán tự động VietQR/VNPAY và xây dựng 2 cổng điều hành độc lập: Cổng Nhà xe đối tác (`/company/*`) và Cổng Quản trị sàn (`/admin/*`).

---

## 👥 2. PHÂN CÔNG THÀNH VIÊN (RACI)

| Thành viên | Vai trò | Trọng tâm công việc Sprint 2 |
|:---|:---|:---|
| **Phạm Công Thành** | Team Leader & System Architect | Xây dựng Cổng Nhà xe (`/company/*` gồm 10 trang): Quản lý đội xe, tài xế, điều phối lịch trình, bảng đối soát tài chính, quản lý chính sách giá vé; hỗ trợ kỹ thuật thanh toán. |
| **Nguyễn Đại Phát** | Admin Lead & Full-Stack | Xây dựng Cổng Quản trị Admin (`/admin/*` gồm 10 trang): Dashboard 4 chỉ số tài chính, phê duyệt nhà xe, giám sát 480 chuyến xe toàn sàn, quyết toán chiết khấu 10%, quản lý người dùng. |
| **Phạm Thanh Phong** | Core Booking & Seat Engine | Xây dựng màn hình Tìm kiếm vé (`/search`), sơ đồ chọn ghế 34 buồng Limousine VIP 2 tầng, thuật toán khóa ghế chống cướp chỗ `@Lock(PESSIMISTIC_WRITE)`, tích hợp thanh toán VietQR PayOS & VNPAY (`/checkout`). |
| **Đoàn Nhật Cường** | Mobile Specialist | Trang chủ tương tác (`/`), bộ lọc tìm kiếm nhanh tuyến đường, trang Lịch trình xe chạy toàn quốc (`/schedule`), trang Đánh giá trải nghiệm (`/reviews`), Cẩm nang đi xe (`/guide`). |
| **Trần Minh Đức** | Customer Portal | Phân hệ Vé của tôi (`/my-tickets`), thuật toán tính tỷ lệ hoàn tiền khi hủy vé theo thời gian thực, trang Quản lý hồ sơ cá nhân & đổi mật khẩu (`/profile`), kho mã giảm giá (`/promotions`). |
| **Phan Trung Kiên** | Thành viên | Miễn thực tập OJT (Exempted) theo quyết định đào tạo. |

---

## 📋 3. PHẠM VI & HẠNG MỤC CÔNG VIỆC CHÍNH (SPRINT BACKLOG)

### 3.1. Động cơ Tìm kiếm & Chọn ghế (Booking & Seat Selection)
- Bộ lọc tìm kiếm thông minh: Tìm theo điểm đi/đến, ngày khởi hành, khung giờ (sáng, trưa, tối), loại xe, khoảng giá.
- Tối ưu bộ nhớ đệm In-Memory SWR (Stale-While-Revalidate) trả kết quả tìm kiếm với độ trễ phản hồi < 50ms.
- Sơ đồ trực quan 34 buồng VIP: Phân tầng rõ ràng (Tầng 1 buồng đôi/đơn, Tầng 2 view thoáng), hiển thị trạng thái ghế (Trống, Đang giữ, Đã bán) theo thời gian thực.

### 3.2. Xử lý tranh chấp đồng thời & Khóa ghế (Concurrency Control)
- **Thuật toán Khóa bi quan (`@Lock(LockModeType.PESSIMISTIC_WRITE)`):** Khi khách bấm chọn ghế, hệ thống khóa dòng bản ghi ghế trong CSDL, không cho bất kỳ giao dịch nào khác sửa đổi cùng lúc.
- **Cơ chế đếm ngược 10:00 phút:** Ghế được giữ tạm trong 10 phút để khách thực hiện thanh toán; nếu quá giờ không thanh toán, scheduler tự động giải phóng ghế trở lại trạng thái trống.

### 3.3. Tích hợp Thanh toán Tự động (Payment Gateway)
- **VietQR PayOS:** Sinh mã QR thanh toán động kèm mã đơn hàng và số tiền chính xác; Webhook tự động nhận thông báo thanh toán và xuất vé trong 1-2 giây.
- **VNPAY Sandbox:** Chuyển hướng thanh toán qua cổng VNPAY, kiểm tra mã phản hồi `vnp_ResponseCode == "00"` và xử lý giao dịch nguyên tử (`@Transactional(isolation = Isolation.SERIALIZABLE)`).

### 3.4. Hai Cổng Quản trị Hoàn thiện
- **Cổng Nhà xe (`/company/*`):** Quản lý xe, tài xế, tạo chuyến xe mới, cấu hình điểm đón/trả, danh sách hành khách đi xe, xem báo cáo doanh thu theo ngày/tháng.
- **Cổng Quản trị Sàn (`/admin/*`):** Giám sát toàn bộ hoạt động đặt vé, khóa/mở khóa nhà xe, quản lý chính sách hoa hồng sàn 10%, tra cứu lịch sử giao dịch và Audit Logs.

---

## 📦 4. SẢN PHẨM BÀN GIAO (DELIVERABLES)
1. Luồng đặt vé và thanh toán hoạt động trọn vẹn từ Tìm kiếm ➔ Chọn ghế ➔ Thanh toán ➔ Xuất vé.
2. Cổng nhà xe đối tác vận hành tại địa chỉ `/company` (10 màn hình chức năng).
3. Cổng quản trị sàn vận hành tại địa chỉ `/admin` (10 màn hình chức năng).
4. Phân hệ khách hàng quản lý vé cá nhân tại `/my-tickets`.

---

## 🏆 5. KẾT QUẢ NGHIỆM THU & TIÊU CHÍ HOÀN THÀNH (DoD)
- ✅ Kiểm thử đồng thời: Mô phỏng 2 phiên trình duyệt cùng chọn 1 ghế ➔ Chỉ người bấm trước được giữ ghế, người thứ hai nhận thông báo ghế đã có người giữ.
- ✅ Thanh toán thực tế: Quét mã VietQR thành công ➔ Trạng thái vé chuyển ngay sang `PAID` và gửi mã vé về giao diện.
- ✅ Kết quả hoàn thành: **62/70 SP (16/18 Tasks - Đạt 88.6% kế hoạch)**.
- ⚠️ Tồn đọng chuyển tiếp Sprint 3: **8 SP (2 Tasks kiểm thử tự động & Fixture DB - Trần Minh Đức)**.
- 💡 Ý kiến chỉ đạo từ Thầy: Tiếp nhận 2 task đột xuất cho Sprint 3 gồm Tích hợp Google OAuth2/OTP (Phát) và Tái cấu trúc thẩm định KYB đối tác Nhà xe (Thành - [S322]).

