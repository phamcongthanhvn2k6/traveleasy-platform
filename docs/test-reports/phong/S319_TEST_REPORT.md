# BÁO CÁO KẾT QUẢ KIỂM THỬ HỒI QUY HỢP ĐỒNG API & ÁNH XẠ NGOẠI LỆ (S319 TEST REPORT)
> **Hướng dẫn:** Báo cáo kiểm thử độc lập của thành viên Phạm Thanh Phong tại `docs/test-reports/phong/S319_TEST_REPORT.md`.  
> **Tuyệt đối:** Tuân thủ quy chuẩn Zero Merge Conflict và 100% Commit Tiếng Việt có dấu.

---

## 1. THÔNG TIN THẺ KIỂM THỬ
* **Mã thẻ Trello:** `[S319]` (`6ae81144` / `AyWUDmz6`)
* **Tên task:** `[Ưu tiên: 2] [3 SP] [BE][S319] Kiểm thử hồi quy hợp đồng API — Ánh xạ ngoại lệ và nội dung lỗi (/api)`
* **Người thực hiện:** Phạm Thanh Phong (`phmthanhphong17`)
* **Người rà soát:** Phạm Công Thành (`thanhphmcong1`)
* **Ngày kiểm thử:** `2026-11-06`
* **Môi trường kiểm thử:** Localhost & Spring Boot MockMvc Integration Test (`@ActiveProfiles("test")`)
* **Tệp kiểm thử tự động:** `backend/src/test/java/com/traveleasy/integration/S319ApiIntegrationTest.java`
* **Nguyên tắc thực hiện:** Chỉ bổ sung tệp kiểm thử độc lập `S319ApiIntegrationTest.java` và báo cáo kiểm thử, giữ nguyên 100% mã nguồn nghiệp vụ hiện có trên nhánh `dev` để đảm bảo an toàn hệ thống và 0 xung đột mã nguồn.

---

## 2. CHI TIẾT KỊCH BẢN KIỂM THỬ (TEST SCENARIOS)

| STT | Kịch bản kiểm thử (Test Case) | Dữ liệu đầu vào (Input) | Kết quả mong đợi (Expected) | Kết quả thực tế (Actual) | Đánh giá |
|:---:|:---|:---|:---|:---|:---:|
| 1 | **DoD 1 — Hợp đồng luồng chính & trạng thái danh sách rỗng** | `GET /api/v1/trips/search`, `/api/v1/trips/{id}` (có dữ liệu & không khớp tuyến) | Trả về `200 OK`, cấu trúc `ApiResponse` (`success: true`, `message`, `data`, `timestamp`), mảng rỗng `[]` khi không có chuyến | Phản hồi đúng hợp đồng `ApiResponse` chuẩn | **PASS** |
| 2 | **DoD 2 — Ánh xạ lỗi Validation (`MethodArgumentNotValidException`)** | `POST /api/v1/bookings` với các trường rỗng, SĐT `"12345"`, Email `"not-an-email"` | Trả về `400 Bad Request`, `message` mở đầu bằng `"Lỗi dữ liệu:"`, map `errors` liệt kê từng field | Trả về `400 Bad Request` kèm chi tiết tiếng Việt cho `tripId`, `seatNumbers`, `customerName`, `customerPhone`, `customerEmail`, `paymentMethod` | **PASS** |
| 3 | **DoD 3 — Ánh xạ lỗi JSON hỏng & sai kiểu tham số (`TypeMismatch`)** | JSON vỡ cú pháp trên `POST /api/v1/bookings` và `GET /api/v1/trips/abc-invalid-long` | Trả về `400 Bad Request` kèm thông báo lỗi tiếng Việt rõ ràng | Ánh xạ chính xác `400 Bad Request` cho cả hai trường hợp | **PASS** |
| 4 | **DoD 4 — Ánh xạ lỗi Phương thức HTTP (`405`) & Đường dẫn (`404`)** | `DELETE /api/v1/trips/search` và `GET /api/v1/trips/non-existent-subpath/unknown` | Trả về `405 Method Not Allowed` và `404 Not Found` chuẩn `ApiResponse` | Trả về đúng mã trạng thái `405` và `404`, không phát sinh lỗi `500` | **PASS** |
| 5 | **DoD 5 — Ánh xạ `AppException` (`404 Not Found` & `409 Conflict`)** | `GET /api/v1/trips/999999` và `POST /api/v1/bookings` đặt ghế `A01` đã `BOOKED` | Trả về `404 Not Found` và `409 Conflict` (`SEAT_ALREADY_BOOKED`) | Ánh xạ đúng mã trạng thái HTTP và thông báo lỗi tiếng Việt | **PASS** |
| 6 | **DoD 6 — Phân quyền (`401/403`) & Chống lộ thông tin nhạy cảm** | Gọi `/api/v1/admin/users` không token / quyền `CUSTOMER`, tra cứu mã vé không tồn tại | Trả về `401`/`403`/`404`, body tuyệt đối không chứa `java.lang.`, `org.hibernate.`, hay câu lệnh `SELECT` | Chặn truy cập trái phép và bảo mật 100% không rò rỉ stacktrace nội bộ | **PASS** |

---

## 3. BẰNG CHỨNG KIỂM THỬ (EVIDENCE)

### 3.1 Lệnh chạy kiểm thử tái lập kết quả:
```powershell
cd backend
.\gradlew.bat test --tests com.traveleasy.integration.S319ApiIntegrationTest --info
```

### 3.2 Phản hồi JSON chuẩn khi phát sinh lỗi Validation (`400 Bad Request`):
```json
{
  "success": false,
  "message": "Lỗi dữ liệu: Mã chuyến xe không được để trống",
  "errors": {
    "tripId": "Mã chuyến xe không được để trống",
    "seatNumbers": "Vui lòng chọn ít nhất 1 ghế",
    "customerName": "Họ tên hành khách không được để trống",
    "customerPhone": "Số điện thoại không đúng định dạng (VD: 0988123456)",
    "customerEmail": "Email không đúng định dạng",
    "paymentMethod": "Phương thức thanh toán không được để trống"
  },
  "timestamp": "2026-11-06T09:20:00.000"
}
```

---

## 4. KẾT LUẬN & ĐỀ XUẤT
* **Trạng thái thẻ:** **ĐẠT (PASS 6/6 DoD Test Cases)** — Đã rút gọn PR chỉ còn tệp kiểm thử `S319ApiIntegrationTest.java` và báo cáo `S319_TEST_REPORT.md` (không chạm vào code nghiệp vụ gốc trên `dev`).
