# 🔬 BÁO CÁO RÀ SOÁT CHUYÊN SÂU LỖ HỔNG NGHIỆP VỤ & HẠ TẦNG (AUDIT ROUND 2)
> **Dự án**: Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy (`traveleasy-platform`)  
> **Giai đoạn**: Kiểm toán chuyên sâu Vòng 2 (Deep Concurrency, Deadlock & Payment Gateway Audit)  
> **Người thực hiện**: Phạm Công Thành (Team Leader & System Architect)  
> **Trạng thái**: ✅ **ĐÃ KHẮC PHỤC TRIỆT ĐỂ & ĐÃ MERGE VÀO DEV** (Commit `d0cbfbf`)

---

## 📌 TỔNG HỢP 5 LỖ HỔNG CHÍ MẠNG VÒNG 2 PHÁT HIỆN ĐƯỢC

```
+---------------+-------------------------------------------------------------------------------------------------------------------------+
| Mã Lỗ Hổng    | Chi Tiết Nguy Cơ & Lỗi Nghiệp Vụ                                        | Giải Pháp Đã Triển Khai (Fix Applied)         |
+---------------+-------------------------------------------------------------------------------------------------------------------------+
| BUG-ROUND2-01 | DATABASE DEADLOCK KHI ĐẶT NHIỀU GHẾ ĐỒNG THỜI:                          | Sắp xếp thứ tự ghế theo chuẩn Canonical       |
| (CRITICAL)    | Luồng 1 chọn [A01, A02], Luồng 2 chọn [A02, A01]. Do không sắp xếp thứ | Ordering (Collections.sort(seatCodes)) trước  |
|               | tự lock ghế, PostgreSQL xảy ra Deadlock làm sập tiến trình đặt vé.      | khi gọi findByTripIdAndSeatCodeInWithLock.    |
+---------------+-------------------------------------------------------------------------+-----------------------------------------------+
| BUG-ROUND2-02 | LATE-WEBHOOK HỒI SINH ĐƠN HÀNG ĐÃ HỦY (Double-Booking):                 | Late-Webhook Guard: Nếu booking đã CANCELLED  |
| (CRITICAL)    | Khách chuyển tiền muộn sau 15 phút (khi ghế đã tự động nhả và người    | do quá hạn 10 phút, cấm hồi sinh sang         |
|               | khác mua mất). Webhook PayOS bắn về tự động set CONFIRMED và ISSUED vé  | CONFIRMED; chuyển sang REFUND_REQUIRED để     |
|               | -> 2 khách cùng cầm vé hợp lệ cho 1 ghế (Trùng vé kinh hoàng).         | tự động hoàn tiền cho khách trong 24h.        |
+---------------+-------------------------------------------------------------------------+-----------------------------------------------+
| BUG-ROUND2-03 | LỆCH KÉT POS DO TIỀN HOÀN VÉ TẠI QUẦY (Cash Discrepancy):               | Bổ sung biến theo dõi total_cash_refunds      |
| (HIGH)        | Khách trả vé tại quầy bến xe, thu ngân móc két hoàn tiền mặt nhưng hệ   | trong ca trực POS. Tiền két thực tế =         |
|               | thống chỉ cộng doanh số bán mà không trừ tiền hoàn -> Kết ca lệch quỹ.  | Initial Cash + Cash Sales - Cash Refunds.     |
+---------------+-------------------------------------------------------------------------+-----------------------------------------------+
| BUG-ROUND2-04 | "NHỒI GIÁ" VƯỢT KHUNG QUY ĐỊNH BỘ TÀI CHÍNH (Price Gouging):            | Thiết lập trần phụ thu Max Surcharge Cap:     |
| (MEDIUM)      | Rule Cuối tuần +15%, Rule Ngày lễ +30%, Khung giờ vàng +20.000đ. Khi    | Tổng mức tăng phụ thu của mọi luật cộng dồn   |
|               | trùng nhau giá vé bị đội lên 55%, vi phạm trần giá kê khai với Sở GTVT. | không được vượt quá 40% giá vé gốc.           |
+---------------+-------------------------------------------------------------------------+-----------------------------------------------+
| BUG-ROUND2-05 | LỆNH VẬN CHUYỂN BỊ THAY ĐỔI SAU KHI XE RỜI BẾN (Audit Tampering):       | Snapshot Manifest Bất Biến: Khi xe xuất bến   |
| (MEDIUM)      | Xe đã lăn bánh trên quốc lộ nhưng nhân viên vẫn vào xóa bớt khách trên  | (DISPATCHED), danh sách hành khách bị đóng    |
|               | hệ thống -> Dữ liệu trên app lệch với Lệnh vận chuyển đã nộp cho CSGT.  | băng (Frozen), cấm thêm bớt để kiểm toán.     |
+---------------+-------------------------------------------------------------------------+-----------------------------------------------+
```

---

## 🛡️ CHI TIẾT CÁC BẢN VÁ ĐÃ HOÀN TẤT VÀ KIỂM THỬ XONG

### 1. Bản Vá Chống Deadlock Đa Luồng (Canonical Lock Ordering)
- **File**: `BookingService.java` & `SeatRealtimeService.java`
- **Cơ chế**: Mọi danh sách ghế do người dùng hoặc API gửi lên (dù thứ tự ngẫu nhiên thế nào) đều được ép sắp xếp theo thứ tự bảng chữ cái (`A01` $\rightarrow$ `A02` $\rightarrow$ `B01`) trước khi thực hiện câu lệnh `SELECT ... FOR UPDATE`.
- **Hiệu quả**: 100% các luồng cạnh tranh đều tuân thủ chung một hướng khóa, loại bỏ hoàn toàn khả năng xảy ra chu trình chờ đợi lẫn nhau (Circular Wait Cycle), triệt tiêu lỗi Deadlock trên PostgreSQL.

### 2. Bản Vá Late-Webhook Chống Bán Trùng Vé Khi Khách Chuyển Khoản Muộn
- **File**: `PaymentService.java` & `PaymentStatus.java`
- **Cơ chế**: 
  - Thêm trạng thái `PaymentStatus.REFUND_REQUIRED`.
  - Trong callback/webhook, nếu phát hiện `booking.getStatus() == BookingStatus.CANCELLED`:
    - Ghi nhận trạng thái thanh toán là `REFUND_REQUIRED`.
    - Tuyệt đối không chuyển đơn sang `CONFIRMED` và không cấp mã vé `ISSUED`.
    - Trả về thông báo minh bạch cho hệ thống: *"Đơn hàng đã hết hạn 10 phút, ghế đã nhả cho người khác; hệ thống sẽ hoàn tiền cho quý khách trong 24 giờ"*.
