# BÁO CÁO KẾT QUẢ KIỂM THỬ (TEST EXECUTION REPORT)

> **Mã Tài Liệu**: `TR-S310-BE-PHONG-01`
> **Phiên Bản**: `1.0`
> **Ngày Thực Hiện**: `06/11/2026`
> **Trạng Thái**: `PASSED`

---

## 1. THÔNG TIN CHUNG (GENERAL INFORMATION)

| Hạng mục | Chi tiết |
| :--- | :--- |
| **Người thực hiện (Tester)** | Phạm Thanh Phong (`@PhamThanhPhongPN`) |
| **Vai trò trong nhóm** | QA / Testing & Fullstack Developer |
| **Sprint thực hiện** | Sprint 3 |
| **Mã Thẻ Trello (Task ID)** | `[BE][S310]` |
| **Tên Tính Năng / Phân Hệ** | Kiểm thử tích hợp đặt vé và thanh toán — Cổng thanh toán, webhook (`/api/bookings` & `/api/payments`) |
| **Nhánh Git (Branch Name)** | `testing/S310-phong-kiem-thu-tich-hop-dat-ve-thanh-toan` |
| **Nhánh Đích (Base Branch)** | `dev` |
| **Môi Trường Kiểm Thử** | Windows 11, Java 17, Spring Boot 3, JUnit 5, MockMvc, H2 In-Memory (`@ActiveProfiles("test")`) |

---

## 2. PHẠM VI & MỤC TIÊU KIỂM THỬ (TEST SCOPE & OBJECTIVES)

### 2.1. Tệp Mã Nguồn Được Kiểm Thử & Bổ Sung
- `backend/src/test/java/com/traveleasy/integration/S310ApiIntegrationTest.java`: Bộ kiểm thử tích hợp Backend xác minh toàn diện luồng đặt vé (`/api/v1/bookings`), khởi tạo cổng thanh toán (`/api/v1/payments/initiate`), xử lý Webhook IPN VNPAY (`/api/v1/payments/vnpay-ipn`) và Webhook PayOS (`/api/v1/payments/payos/webhook`).
- Các Controller và Service nghiệp vụ hiện hữu (`BookingController.java`, `PaymentController.java`, `BookingService.java`, `PaymentService.java`) được giữ nguyên 100% để tuân thủ nguyên lý Đơn trách nhiệm (SRP) và triệt tiêu hoàn toàn nguy cơ xung đột nhánh (Merge Conflict).

### 2.2. Các Tiêu Chí Nghiệm Thu (Acceptance Criteria - DoD)
- [x] **DoD 1**: Đặt vé xe khách (`POST /api/v1/bookings`) với cả phương thức trực tuyến (`VNPAY`) và tiền mặt (`COD`), trừ số ghế trống nguyên tử, tính đúng tổng tiền (vé + bảo hiểm - giảm giá) và khởi tạo đúng trạng thái đơn/vé.
- [x] **DoD 2**: Kết nối cổng thanh toán (`POST /api/v1/payments/initiate`) sinh URL thanh toán VNPAY kèm chữ ký bảo mật `vnp_SecureHash`, sinh mã QR chuyển khoản `VIETQR` Napas 24/7 và tra cứu trạng thái giao dịch thời gian thực (`GET /api/v1/payments/status/{bookingCode}`).
- [x] **DoD 3**: Xử lý Webhook IPN VNPAY (`GET /api/v1/payments/vnpay-ipn`) chặn chữ ký giả mạo (`INVALID_SIGNATURE` -> `RspCode = 01`) và tự động kích hoạt đơn (`CONFIRMED`) + xuất vé (`ISSUED`) khi chữ ký HMAC-SHA512 hợp lệ (`vnp_ResponseCode = 00` -> `RspCode = 00`).
- [x] **DoD 4**: Xử lý Webhook PayOS (`POST /api/v1/payments/payos/webhook`) và đảm bảo tính lũy đẳng (Idempotency) chống xử lý lặp khi cổng thanh toán gửi lại cùng một bản tin Webhook nhiều lần.
- [x] **DoD 5**: Kiểm soát chặt phân quyền truy cập (`401 Unauthorized` khi chưa đăng nhập), xác thực dữ liệu đầu vào (`400 Bad Request`), chống đặt trùng ghế đã bán (`409 Conflict`) và chặn khởi tạo thanh toán cho đơn đã hủy (`400 Bad Request`).

---

## 3. DANH SÁCH KỊCH BẢN KIỂM THỬ (TEST CASES)

| Mã TC | Tên Kịch Bản Kiểm Thử | Đầu Vào / Điều Kiện Tiên Quyết | Kết Quả Kỳ Vọng | Kết Quả Thực Tế | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **DoD 1** | Đặt vé thành công qua `POST /api/v1/bookings` với `VNPAY` và `COD`, trừ ghế nguyên tử | Đặt 2 ghế `A01, A02` (VNPAY, có bảo hiểm, giảm 20k) và 1 ghế `A03` (COD) | Đơn VNPAY ở trạng thái `PENDING` (`630,000đ`), đơn COD ở trạng thái `CONFIRMED` (`300,000đ`), ghế trống giảm chính xác | Khớp 100% kỳ vọng | **PASS** |
| **DoD 2** | Khởi tạo phiên thanh toán `VNPAY` & `VIETQR`, sinh mã `txnRef` và kiểm tra trạng thái | Gọi `POST /api/v1/payments/initiate` và `GET /api/v1/payments/status/{bookingCode}` | Sinh URL VNPAY có `vnp_SecureHash`, sinh URL VietQR kèm STK ngân hàng, trạng thái `PENDING` (`paid = false`) | Khớp 100% kỳ vọng | **PASS** |
| **DoD 3** | Xử lý Webhook VNPAY IPN chặn chữ ký giả mạo và kích hoạt đơn/vé khi chữ ký hợp lệ | Gọi `GET /api/v1/payments/vnpay-ipn` với hash giả mạo, sau đó gọi với chữ ký HMAC-SHA512 hợp lệ | Chữ ký giả trả `RspCode = 01`, giữ đơn ở `PENDING`; chữ ký đúng trả `RspCode = 00`, đơn chuyển `CONFIRMED`, vé chuyển `ISSUED` | Khớp 100% kỳ vọng | **PASS** |
| **DoD 4** | Xử lý Webhook PayOS và đảm bảo tính lũy đẳng (Idempotency) khi nhận Webhook lặp lại | Gửi 2 lần liên tiếp cùng bản tin `POST /api/v1/payments/payos/webhook` cho đơn `BK-S310-PAYOS04` | Lần 1 kích hoạt đơn & vé; lần 2 trả thông báo đã thanh toán trước đó, không sinh thêm bản ghi `PaymentTransaction` trùng | Khớp 100% kỳ vọng | **PASS** |
| **DoD 5** | Chặn đặt vé khi chưa đăng nhập (`401`), dữ liệu sai (`400`), ghế đã bán (`409`) và đơn đã hủy (`400`) | Gọi API không có user, gửi SĐT/ghế không hợp lệ, đặt trùng ghế `A05`, và thanh toán đơn `CANCELLED` | Trả đúng mã HTTP `401`, `400`, `409`, `400` với thông điệp lỗi tiếng Việt chuẩn xác | Khớp 100% kỳ vọng | **PASS** |

---

## 4. BẰNG CHỨNG THỰC THI (TEST EXECUTION EVIDENCE)

### 4.1. Lệnh Thực Thi Kiểm Thử
```bash
cd backend
.\gradlew.bat test --tests com.traveleasy.integration.S310ApiIntegrationTest --info
```

### 4.2. Kết Quả Đầu Ra (Console Output)
```text
> Task :test
S310ApiIntegrationTest > DoD 1: Đặt vé thành công qua POST /api/v1/bookings với VNPAY và COD, trừ ghế nguyên tử PASSED
S310ApiIntegrationTest > DoD 2: Khởi tạo phiên thanh toán VNPAY & VIETQR, sinh mã tham chiếu txnRef và kiểm tra trạng thái PASSED
S310ApiIntegrationTest > DoD 3: Xử lý Webhook VNPAY IPN chặn chữ ký giả mạo và kích hoạt đơn/vé khi chữ ký hợp lệ PASSED
S310ApiIntegrationTest > DoD 4: Xử lý Webhook PayOS và đảm bảo tính lũy đẳng (Idempotency) khi nhận Webhook lặp lại PASSED
S310ApiIntegrationTest > DoD 5: Chặn đặt vé khi chưa đăng nhập (401), dữ liệu sai (400), ghế đã bán (409) và đơn đã hủy (400) PASSED

BUILD SUCCESSFUL
```

---

## 5. KẾT LUẬN & ĐỀ XUẤT NGHIỆM THU (CONCLUSION)

- **Tổng số kịch bản kiểm thử**: `05`
- **Số kịch bản đạt (PASS)**: `05/05 (100%)`
- **Số kịch bản lỗi (FAIL)**: `00`
- **Đánh giá kiến trúc & an toàn nhánh**:
  1. Chỉ bổ sung tệp kiểm thử độc lập `S310ApiIntegrationTest.java` và báo cáo `S310_BE_TEST_REPORT.md`, tuyệt đối không chỉnh sửa chồng chéo lên các Controller/Service hiện có.
  2. Tách nhánh trực tiếp từ `dev` mới nhất và trỏ PR về `dev`, đảm bảo 0 Merge Conflict.

