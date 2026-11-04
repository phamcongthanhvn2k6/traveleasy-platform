# KẾ HOẠCH THỰC HIỆN SPRINT 2 (SPRINT 2 PLANNING)
> **Đơn vị:** Nhóm 7 — Dự Án TravelEasy  
> **Thời gian:** 2 tuần (Tuần 3 - Tuần 4)  
> **Quy mô:** 70 Story Points (18 Tasks chi tiết)  
> **Mục tiêu:** Động Cơ Đặt Vé Lõi & Hai Cổng Quản Trị  

---

## 1. QUY MÔ & PHÂN BỔ TÀI NGUYÊN
* **Thời gian thực hiện:** 2 tuần (Từ Tuần 3 đến hết Tuần 4)
* **Tổng Story Points dự kiến:** 70 Story Points (18 Tasks chi tiết)
* **Velocity mục tiêu:** 70 SP (Tăng 34.6% so với Sprint 1 nhờ nền tảng hạ tầng đã ổn định)

---

## 2. BẢNG PHÂN BỔ CHI TIẾT SPRINT 2 BACKLOG
| Mã Task | Nội Dung Công Việc | Phụ Trách | SP | Tiêu Chí Nghiệm Thu |
| :--- | :--- | :--- | :---: | :--- |
| **SP2-01** | API Tìm kiếm chuyến xe & Bộ lọc | Phạm Công Thành | 5 | Lọc theo giá, giờ, nhà xe < 300ms |
| **SP2-02** | Sơ đồ 34 phòng Limousine VIP 2 tầng | Nguyễn Đại Phát | 5 | Hiển thị đúng tầng trên/dưới, trạng thái |
| **SP2-03** | Thuật toán khóa giữ chỗ 10p (Pessimistic) | Phạm Công Thành | 8 | Không xảy ra double booking khi 2 user chọn |
| **SP2-04** | Tích hợp Cổng PayOS VietQR 24/7 | Trần Đức | 5 | Sinh mã QR động, Webhook xác nhận tức thì |
| **SP2-05** | Tích hợp Cổng thanh toán VNPAY Sandbox | Trần Đức | 5 | Chuyển hướng cổng, tính checksum chuẩn |
| **SP2-06** | Trang Checkout & Thu thập thông tin khách | Nguyễn Văn A | 3 | Validate SĐT, email, điểm đón/trả |
| **SP2-07** | Trang Tra cứu vé qua mã PNR & SĐT | Nguyễn Văn A | 3 | Hiển thị chi tiết vé, mã QR vé điện tử |
| **SP2-08** | Cổng Nhà Xe: Đăng nhập & Đổi mật khẩu | Nguyễn Đại Phát | 3 | Chỉ role COMPANY mới vào được /company |
| **SP2-09** | Cổng Nhà Xe: Quản lý phương tiện & Xe | Nguyễn Đại Phát | 5 | Thêm, sửa, gán sơ đồ ghế cho từng xe |
| **SP2-10** | Cổng Nhà Xe: Quản lý tuyến đường & ETA | Nguyễn Đại Phát | 5 | Định nghĩa điểm đón/trả và mốc giờ |
| **SP2-11** | Cổng Nhà Xe: Tạo chuyến tự sinh 34 ghế | Phạm Công Thành | 5 | Chọn xe, chọn tuyến -> sinh ghế chuyến |
| **SP2-12** | Cổng Nhà Xe: Sơ đồ theo dõi bán vé chuyến | Nguyễn Văn A | 3 | Xem trực quan các ghế đã thanh toán |
| **SP2-13** | Cổng Admin: Quản lý nhà xe & Duyệt KYB | Nguyễn Đại Phát | 5 | Kích hoạt hoặc đình chỉ hoạt động nhà xe |
| **SP2-14** | Cổng Admin: Cấu hình cổng thanh toán | Trần Đức | 3 | Bật tắt PayOS, VNPAY, COD toàn sàn |
| **SP2-15** | Cổng Admin: Quản lý chính sách hủy vé | Trần Đức | 3 | Cài đặt mốc giờ và % hoàn tiền |
| **SP2-16** | Cơ chế Xóa Mềm 100% trang Admin | Nguyễn Đại Phát | 2 | Không hard delete ở bất kỳ bảng nào |
| **SP2-17** | Đăng ký đối tác trực tuyến (KYB) | Trần Đức | 5 | Form nộp hồ sơ nhà xe (Rollover SP3) |
| **SP2-18** | Đăng nhập Google OAuth2 mạng xã hội | Phạm Công Thành | 3 | Nút Login Google (Rollover SP3) |

---

## 3. MA TRẬN QUẢN TRỊ RỦI RO SPRINT 2
* **Rủi ro 1 - Tranh chấp giữ chỗ (Double Booking):** Áp dụng Pessimistic Locking (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) tại tầng CSDL và kiểm tra trạng thái vé trước khi xác nhận giữ chỗ.
* **Rủi ro 2 - Độ trễ Webhook ngân hàng:** Thiết lập cơ chế Polling song song từ Frontend và ân hạn thêm 2 phút trước khi hủy đơn hàng.
* **Rủi ro 3 - Khối lượng công việc lớn (70 SP):** Ưu tiên 16 task cốt lõi, chủ động rollover 2 task phụ sang Sprint 3 nếu gặp cản trở về thời gian.
