### 🚨 [CODE REVIEW & YÊU CẦU SỬA LỖI NGUY HIỂM] - Task [S320] WebApp Quét QR Soát Vé & Điểm Danh Hành Khách

Chào Cường (@CuongLiam), qua kiểm định kỹ thuật và đào sâu bới móc mã nguồn PR #69, phát hiện **nhiều lỗi nghiêm trọng có thể làm tê liệt cơ sở dữ liệu, thất thoát doanh thu và rò rỉ dữ liệu khách hàng**:

---

#### 1. 🛑 LỖI NGUY HIỂM GÂY SẬP DB: Khóa Bi Quan `PESSIMISTIC_WRITE` Kết Hợp Full Table Scan
- **Vị trí**: `TicketRepository.java` dòng 28-30:
  ```java
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT t FROM Ticket t WHERE UPPER(t.ticketCode) = UPPER(:code) OR (t.qrCodeHash IS NOT NULL AND t.qrCodeHash = :code)")
  Optional<Ticket> findByCodeOrQrHashForUpdate(@Param("code") String code);
  ```
- **Vấn đề kỹ thuật**:
  1. Biểu thức hàm `UPPER(t.ticketCode)` không thể tận dụng B-Tree Index thông thường của `ticket_code` (trừ khi có Functional Index `UPPER(ticket_code)`).
  2. Cột `qr_code_hash` **hoàn toàn chưa được đánh index** trong CSDL!
  3. Kết hợp điều kiện `OR` giữa 2 trường không tối ưu buộc PostgreSQL phải chạy **Sequential Scan (quét toàn bộ bảng `tickets`)**.
  4. Đáng sợ nhất: Đi kèm với `@Lock(LockModeType.PESSIMISTIC_WRITE)` (`SELECT ... FOR UPDATE`), PostgreSQL sẽ phải duyệt qua từng dòng bảng để khóa!
- **Hậu quả**: Khi hàng chục phụ xe quét vé đồng thời tại các cửa xe vào giờ xuất bến, các câu lệnh scan bảng có lock này sẽ chèn ép nhau, gây cạn kiệt Connection Pool HikariCP, dẫn tới **Deadlock (`deadlock detected`) và làm tê liệt toàn bộ hệ thống bán vé của dự án!**
- **Khắc phục**:
  - Tách riêng biệt 2 truy vấn tra cứu theo `ticketCode` (chuẩn hóa chữ hoa trước ở tầng Java service) và `qrCodeHash`.
  - Bổ sung Index bắt buộc cho `qr_code_hash` trong PostgreSQL.
  - Loại bỏ hoàn toàn `UPPER()` trong câu query JPQL để tận dụng trực tiếp B-Tree Index:
    ```java
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Ticket t WHERE t.ticketCode = :code OR t.qrCodeHash = :code")
    Optional<Ticket> findByCodeOrQrHashForUpdate(@Param("code") String code);
    ```

---

#### 2. 💸 LỖ HỔNG THẤT THOÁT DOANH THU: Không Kiểm Tra Trạng Thái Thanh Toán Của Booking
- **Vị trí**: Hàm `validateTicket` trong `ConductorScannerController.java`.
- **Vấn đề**: Em chỉ kiểm tra trạng thái của vé (`ticket.getStatus() == USED` hoặc `CANCELLED`), nhưng **HOÀN TOÀN BỎ QUÊN trạng thái thanh toán của Đơn Hàng (`booking.getStatus()`)**!
- **Hậu quả**: Hành khách đặt vé nhưng chưa thanh toán (đơn đang `PENDING`, thanh toán VietQR/VNPAY bị hủy hoặc chưa trả tiền COD) vẫn có mã vé tạm. Khi họ đưa mã này quét tại xe, hệ thống vẫn báo: **`"VÉ HỢP LỆ! Đã xác nhận khách lên xe thành công (MÀU XANH)"`**. Nhà xe sẽ bị thất thoát tiền vé nghiêm trọng!
- **Khắc phục**: Bổ sung ngay điều kiện bắt buộc:
  ```java
  if (booking == null || (booking.getStatus() != BookingStatus.PAID && booking.getStatus() != BookingStatus.CONFIRMED)) {
      return ApiResponse.success("Vé chưa thanh toán", ValidateTicketResponse.builder()
              .valid(false)
              .checkInStatus("UNPAID")
              .validationColor("RED")
              .message("CẢNH BÁO: Đơn đặt vé này CHƯA ĐƯỢC THANH TOÁN (Trạng thái: " + (booking != null ? booking.getStatus() : "NULL") + ")!")
              .build());
  }
  ```

---

#### 3. 🛡️ LỖ HỔNG BẢO MẬT: Lộ Dữ Liệu Khách Hàng (PII Data Leak)
- **Vị trí**: API `GET /api/v1/conductor/scanner/trips/{tripId}/manifest`.
- **Vấn đề**: Không có bất kỳ kiểm tra phân quyền nào để xác định phụ xe/tài xế có được phân công lái chuyến xe này hay thuộc nhà xe này hay không.
- **Hậu quả**: Bất kỳ ai có tài khoản đăng nhập (kể cả hành khách thông thường) chỉ cần truyền `tripId` bất kỳ là có thể tải về danh sách toàn bộ hành khách: **Họ tên đầy đủ, Số điện thoại thật, Mã vé, Số ghế**. Đây là lỗi vi phạm nghiêm trọng Luật An ninh mạng và chuẩn bảo vệ dữ liệu cá nhân (GDPR).
- **Khắc phục**: Kiểm tra `Authentication` và xác thực người gọi API phải có vai trò `STAFF/DRIVER/CONDUCTOR` được phân công trên chuyến xe đó.

---

#### 4. ⚠️ Lỗ Hổng Nghiệp Vụ Frontend: Quét Offline Bằng Số Ghế Thay Vì Mã Vé
- **Vị trí**: Hàm `validateOffline` trong `ConductorScannerService.ts` dòng 98-103:
  ```typescript
  const seat = manifest.seats.find(
    (s) =>
      (s.ticketCode && s.ticketCode.toUpperCase() === clean) ||
      s.seatCode.toUpperCase() === clean || // ❌ LỖI NGHIỆP VỤ: Cho phép nhập số ghế để check-in!
      (clean.length <= 4 && s.seatCode.toUpperCase().endsWith(clean))
  );
  ```
- **Hậu quả**: Người dùng chỉ cần gõ bừa số ghế như `"A01"` hoặc `"01"` là hệ thống tự động xác nhận vé hợp lệ và cho khách lên xe mà không cần mã vé hay quét QR!
- **Chưa có cơ chế đồng bộ ngược (Sync-back)**: Khi mất sóng 4G soát vé ngoại tuyến, danh sách đã lên xe chỉ lưu tạm trong `localStorage`. Khi có mạng trở lại, hệ thống **không có queue gửi đồng bộ các vé đã quét về máy chủ**, dẫn tới dữ liệu trên server vẫn ở trạng thái chưa lên xe.

---

#### 5. 📱 Giao Diện Scanner Còn Mang Tính Mock / Chưa Hoàn Thiện Thực Tế
- `currentTripId` đang bị **hardcode cứng = 696**, phụ xe không có dropdown chọn chuyến xe mà mình đang trực.
- Khung quét Camera khi bấm vào chỉ gọi hàm `handleSimulateCameraScan` chọn ngẫu nhiên trong 5 mã vé test giả lập, chưa kích hoạt `getUserMedia` / `jsqr` để quét QR thực tế từ camera điện thoại.

