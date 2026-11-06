# BÁO CÁO KẾT QUẢ KIỂM THỬ (TEST EXECUTION REPORT)

> **Mã Tài Liệu**: `TR-S310-PHONG-01`
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
| **Mã Thẻ Trello (Task ID)** | `[FE][S310]` |
| **Tên Tính Năng / Phân Hệ** | Kiểm thử nghiệm thu thanh toán — Đặt vé và chọn phương thức (`/booking/checkout`) |
| **Nhánh Git (Branch Name)** | `testing/S310-phong-kiem-thu-nghiem-thu-thanh-toan-checkout` |
| **Nhánh Đích (Base Branch)** | `dev` |
| **Môi Trường Kiểm Thử** | Windows 11, Node.js, TypeScript (`tsc`), Vite 5.4.21, E2E Acceptance Runner |

---

## 2. PHẠM VI & MỤC TIÊU KIỂM THỬ (TEST SCOPE & OBJECTIVES)

### 2.1. Tệp Mã Nguồn Được Kiểm Thử & Tích Hợp
- `frontend/e2e/S310-acceptance.spec.ts`: Bộ kịch bản kiểm thử nghiệm thu tự động bao phủ toàn diện 7 nhóm tiêu chí DoD của luồng đặt vé và thanh toán.
- `frontend/src/routes/clientRoutes.tsx`: Đồng bộ tích hợp tuyến đường `/booking/checkout` song song với `/checkout` (bổ sung đúng 1 dòng định tuyến, bảo toàn nguyên vẹn toàn bộ các route hiện hữu).
- `frontend/src/pages/customer/checkout/CheckoutPage.tsx`: Giữ nguyên 100% mã nguồn giao diện gốc để tuân thủ chặt chẽ nguyên lý Đơn trách nhiệm (SRP) và tránh xung đột chéo (Merge Conflict).

### 2.2. Các Tiêu Chí Nghiệm Thu (Acceptance Criteria - DoD)
- [x] **DoD 1**: Các luồng đặt vé, thanh toán và chọn phương thức thanh toán (`PAYOS`/`VIETQR`, `VNPAY`, `COD`) xử lý đúng trạng thái và hiển thị thông tin giao dịch chính xác.
- [x] **DoD 2**: Dữ liệu nhập hành khách (`fullName`, `phone`, `email`, `termsAccepted`) được kiểm tra chặt chẽ; giao diện/API thể hiện rõ trạng thái đang chờ (`PENDING`), thành công (`SUCCESS`), thất bại (`FAILED`) và lỗi phụ thuộc.
- [x] **DoD 3**: Trạng thái giữ chỗ (`HELD`/`CONFIRMED`/`RELEASED`), thanh toán và hoàn tiền (`REFUNDED`) không bị cập nhật sai khi yêu cầu bấm lặp (Double-Submit) hoặc Webhook gửi lại.
- [x] **DoD 4**: Tích hợp tuyến `/booking/checkout`, kiểm soát phân quyền truy cập (chặn khách vãng lai chưa đăng nhập và điều hướng `/login?redirect=/checkout`), có bằng chứng kiểm thử lặp lại được.

---

## 3. DANH SÁCH KỊCH BẢN KIỂM THỬ (TEST CASES)

| Mã TC | Tên Kịch Bản Kiểm Thử | Đầu Vào / Điều Kiện Tiên Quyết | Kết Quả Kỳ Vọng | Kết Quả Thực Tế | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **S310-TC01** | Đồng bộ định tuyến `/booking/checkout` và chặn truy cập khi chưa đăng nhập | Truy cập `/booking/checkout` khi `traveleasy_token = null` và khi có JWT hợp lệ | Hỗ trợ cả `/checkout` & `/booking/checkout`; chặn khách chưa đăng nhập và chuyển hướng `/login?redirect=/checkout` | Khớp 100% kỳ vọng | **PASS** |
| **S310-TC02** | Kiểm tra dữ liệu hành khách bắt buộc và tính toán tổng tiền thanh toán | Để trống lần lượt Họ tên, SĐT, Email, bỏ chọn Điều khoản; tính tổng 2 ghế x 320k + bảo hiểm 25k/ghế - voucher 50k | Báo lỗi đúng từng trường thiếu; tổng tiền tính chính xác `640,000đ` và không bao giờ âm | Khớp 100% kỳ vọng | **PASS** |
| **S310-TC03** | Luồng đặt vé và chọn phương thức tiền mặt khi lên xe (`COD`) | Chọn `paymentMethod = 'COD'`, gửi yêu cầu tạo đơn `TE-S310-COD01` | Khởi tạo đơn thành công, không mở modal QR/VNPAY, xóa `sessionStorage` tạm và điều hướng `/tickets/TE-S310-COD01` | Khớp 100% kỳ vọng | **PASS** |
| **S310-TC04** | Luồng thanh toán chuyển khoản VietQR Napas 24/7 (`PAYOS`) và kích hoạt vé | Chọn `paymentMethod = 'PAYOS'`, khởi tạo QR MB Bank và xác nhận chuyển khoản | Trả về trạng thái `PENDING` kèm URL VietQR; sau khi xác nhận chuyển sang `SUCCESS`, `bookingStatus = CONFIRMED`, `isPaid = true` | Khớp 100% kỳ vọng | **PASS** |
| **S310-TC05** | Luồng cổng `VNPAY`: Cảnh báo khi hủy giao dịch (`?vnpay_status=failed`) và thử lại | Nhận query `?vnpay_status=failed&bookingCode=TE-S310-VNP03`, sau đó thực hiện thanh toán lại | Hiển thị cảnh báo rõ mã đơn, bảo toàn phiên giữ chỗ (`sessionHoldActive = true`) và cho phép thanh toán lại thành công | Khớp 100% kỳ vọng | **PASS** |
| **S310-TC06** | Xử lý hết phiên giữ chỗ 10 phút và lỗi phụ thuộc API | Bộ đếm 10 phút chạm `00:00` hoặc API trả lỗi `409 Conflict` ghế đã bị giữ | Khối `finally` luôn giải phóng `loading = false`; khi hết giờ tự động xóa `sessionStorage` và điều hướng `/search` | Khớp 100% kỳ vọng | **PASS** |
| **S310-TC07** | Chống bấm lặp (Double-Submit) và tính lũy đẳng khi Webhook gửi lại / Hoàn tiền | Bấm nút Thanh toán 3 lần liên tiếp; gửi lặp Webhook `SUCCESS`, gửi trễ `FAILED`, và gửi Webhook sau khi `REFUNDED` | Chỉ gửi 1 request duy nhất (`submitCount = 1`); trạng thái `SUCCESS` và `REFUNDED` bất biến trước các bản tin webhook trùng hoặc đến trễ | Khớp 100% kỳ vọng | **PASS** |

---

## 4. BẰNG CHỨNG THỰC THI (TEST EXECUTION EVIDENCE)

### 4.1. Lệnh Thực Thi Kiểm Thử & Build Frontend
```bash
cd frontend
npm run build
npx tsx e2e/S310-acceptance.spec.ts
```

### 4.2. Kết Quả Đầu Ra (Console Output)
```text
> traveleasy-frontend@1.0.0 build
> tsc && vite build
built in 14.5s (0 errors)

=== KẾT QUẢ KIỂM THỬ NGHIỆM THU S310: 7/7 PASSED ===
[PASS] S310-TC01 — Đồng bộ định tuyến /booking/checkout và chặn truy cập trái phép khi chưa đăng nhập: Hỗ trợ cả /checkout và /booking/checkout; chặn khách chưa có JWT và điều hướng về /login?redirect=/checkout.
[PASS] S310-TC02 — Kiểm tra dữ liệu hành khách bắt buộc và tính toán tổng tiền thanh toán: Bắt chính xác 4 ràng buộc (Họ tên, SĐT, Email, Điều khoản) và tính đúng tổng tiền (640,000đ cho 2 ghế + bảo hiểm - voucher).
[PASS] S310-TC03 — Luồng đặt vé và chọn phương thức thanh toán tiền mặt khi lên xe (COD): Tạo đơn TE-S310-COD01 (690.000đ), giải phóng session tạm và chuyển hướng /tickets/TE-S310-COD01.
[PASS] S310-TC04 — Luồng thanh toán chuyển khoản VietQR Napas 24/7 (PAYOS) và kích hoạt vé tự động: Hiển thị QR MB Bank (0944354398), chuyển trạng thái PENDING -> SUCCESS và điều hướng /tickets/TE-S310-QR02?payment=success.
[PASS] S310-TC05 — Luồng cổng VNPAY: Xử lý cảnh báo khi hủy giao dịch (vnpay_status=failed) và thử lại thành công: Bảo toàn phiên giữ chỗ khi callback báo lỗi để khách thử lại và kích hoạt vé thành công.
[PASS] S310-TC06 — Xử lý hết phiên giữ chỗ 10 phút và lỗi phụ thuộc API không để lại trạng thái dở dang: Đảm bảo finally luôn tắt trạng thái đang tải (loading=false) khi lỗi API và dọn sạch sessionStorage khi hết giờ giữ chỗ.
[PASS] S310-TC07 — Bảo vệ chống bấm lặp (Double-Submit) và tính lũy đẳng khi Webhook gửi lại / Hoàn tiền: Chặn bấm đúp (submitCount=1); bảo toàn trạng thái giữ chỗ, thanh toán (SUCCESS) và hoàn tiền (REFUNDED) trước các bản tin webhook lặp hoặc đến trễ.
```

---

## 5. KẾT LUẬN & ĐỀ XUẤT NGHIỆM THU (CONCLUSION)

- **Tổng số kịch bản kiểm thử**: `07`
- **Số kịch bản đạt (PASS)**: `07/07 (100%)`
- **Số kịch bản lỗi (FAIL)**: `00`
- **Đánh giá kiến trúc & an toàn nhánh**:
  1. Đã tách biệt hoàn toàn kịch bản kiểm thử tại `frontend/e2e/S310-acceptance.spec.ts`, giữ nguyên 100% file `CheckoutPage.tsx` (tuân thủ nguyên lý SRP và góp ý từ Leader).
  2. Tích hợp gọn gàng tuyến `/booking/checkout` trong `frontend/src/routes/clientRoutes.tsx` (chỉ thêm 1 dòng, không xóa bất kỳ route nào).
  3. Nhánh được tách trực tiếp từ `dev` mới nhất và trỏ PR về `dev`.
