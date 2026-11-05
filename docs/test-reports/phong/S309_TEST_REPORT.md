# 📋 BÁO CÁO KẾT QUẢ KIỂM THỬ TÍCH HỢP KHÓA GHẾ (S309 TEST REPORT)
> **Hướng dẫn:** Báo cáo kiểm thử độc lập của thành viên Phạm Thanh Phong tại `docs/test-reports/phong/S309_TEST_REPORT.md`.  
> **Tuyệt đối:** Tuân thủ quy chuẩn Zero Merge Conflict và 100% Commit Tiếng Việt có dấu.

---

## 📌 1. THÔNG TIN THẺ KIỂM THỬ
* **Mã thẻ Trello:** `[S309]` (`6ae81139` / `oUXpbgI1`)
* **Tên task:** `[Ưu tiên: 2] [3 SP] [BE][S309] Kiểm thử tích hợp khóa ghế — Hết hạn, đồng thời và chống đặt trùng (/api/seat-locks)`
* **Người thực hiện:** Phạm Thanh Phong (`phmthanhphong17`)
* **Người rà soát:** Phạm Công Thành (`thanhphmcong1`)
* **Ngày kiểm thử:** `2026-11-05`
* **Môi trường kiểm thử:** Localhost & Spring Boot MockMvc Integration Test (`@ActiveProfiles("test")` / H2 In-Memory & Pessimistic Write Lock)
* **Tệp kiểm thử tự động:** `backend/src/test/java/com/traveleasy/integration/S309ApiIntegrationTest.java`
* **Tệp điều hướng API:** `backend/src/main/java/com/traveleasy/controller/customer/TripController.java`

---

## 🔍 2. CHI TIẾT KỊCH BẢN KIỂM THỬ (TEST SCENARIOS)

| STT | Kịch bản kiểm thử (Test Case) | Dữ liệu đầu vào (Input) | Kết quả mong đợi (Expected) | Kết quả thực tế (Actual) | Đánh giá |
|:---:|:---|:---|:---|:---|:---:|
| 1 | **DoD 1 — Luồng chuẩn giữ chỗ 10 phút & đồng bộ dữ liệu** | `POST /api/seat-locks` với `tripId`, `seatCodes: ["A02", "A03"]`, `sessionId: "sess-customer-01"` | Trả về `200 OK`, trạng thái `LOCKED`, `ttlSeconds: 600`, `price: 350000.0`, đồng nhất với `GET /api/v1/trips/{id}` | Trả về `200 OK`, đồng bộ chính xác giá vé, thời hạn và trạng thái ghế `LOCKED` trên cả 2 API | **PASS** |
| 2 | **DoD 2 — Thao tác lặp (Idempotent) & tính nguyên tử khi xung đột lô ghế** | Gửi lặp lại cùng `sessionId` trên ghế `A02`; sau đó phiên B gửi lô `["A05", "A02"]` | Phiên A giữ lặp thành công; Phiên B bị từ chối `409 Conflict` và ghế `A05` không bị treo `LOCKED` | Phiên A nhận `200 OK`; Phiên B nhận `409 Conflict`, ghế `A05` bảo toàn trạng thái `AVAILABLE` | **PASS** |
| 3 | **DoD 3 — Cạnh tranh đồng thời (Multi-thread Race Condition)** | 8 luồng (`ExecutorService` + `CountDownLatch`) cùng khóa ghế `A06` tại cùng một thời điểm | Duy nhất 1 luồng khóa thành công (`200 OK`), 7 luồng còn lại nhận `409 Conflict` | `successCount = 1`, `conflictCount = 7`, ghế `A06` mang trạng thái `LOCKED` | **PASS** |
| 4 | **DoD 4 — Luồng hết hạn khóa ghế (TTL Expiration & Auto-Cleanup)** | Khóa ghế `A07` với `ttlSeconds: 1`, chờ hết hạn hoặc gọi `POST /api/seat-locks/expire` | Khóa hết hạn tự động giải phóng về `AVAILABLE`, khách hàng mới khóa lại ghế `A07` thành công | Khóa cũ tự động thu hồi, khách mới giữ chỗ thành công `200 OK`, sau khi expire ghế về `AVAILABLE` | **PASS** |
| 5 | **DoD 5 — Chống đặt trùng (Anti-Double-Booking) trên `/api/v1/bookings`** | Phiên A giữ ghế `A08`; Phiên B gọi `POST /api/v1/bookings` đặt `A08`; sau đó Phiên A đặt `A08` | Phiên B bị chặn với `409 Conflict` (`SEAT_ALREADY_BOOKED`); Phiên A đặt vé thành công (`BOOKED`) | Phiên B nhận `409 Conflict`; Phiên A tạo đơn thành công `200 OK`, ghế `A08` chuyển sang `BOOKED` | **PASS** |
| 6 | **DoD 6 — Kiểm tra dữ liệu bắt buộc & lỗi phụ thuộc** | Thiếu `tripId`/`seatCodes`/`sessionId`, chuyến không tồn tại, ghế `Z99`, chuyến `CANCELLED` | Trả về `400 Bad Request`, `404 Not Found` hoặc `409 Conflict` kèm thông điệp tiếng Việt rõ ràng | Tất cả 7 trường hợp biên đều trả về đúng mã lỗi HTTP và cấu trúc `ApiResponse` chuẩn | **PASS** |
| 7 | **DoD 7 — Phân quyền vai trò & cô lập phạm vi nhà xe (Multi-tenant)** | Phiên khác tự ý release; gọi `/api/seat-locks/force-release` với Anonymous, `CUSTOMER`, nhà xe đối thủ và nhà xe chủ quản | Anonymous `401`, `CUSTOMER` `403`, nhà xe đối thủ `403`, nhà xe chủ quản `200 OK` | Chặn chính xác 100% truy cập trái phép và giải phóng thành công cho đúng nhà xe sở hữu chuyến | **PASS** |

---

## 📸 3. BẰNG CHỨNG KIỂM THỬ (EVIDENCE)

### 3.1 Phản hồi JSON chuẩn khi khóa ghế thành công (`POST /api/seat-locks`):
```json
{
  "success": true,
  "message": "Giữ chỗ thành công trong 10 phút",
  "data": [
    {
      "tripId": 1,
      "seatNumber": "A02",
      "status": "LOCKED",
      "message": "Ghế A02 đang được giữ chỗ thanh toán (thời hạn 10 phút)",
      "holderSessionId": "sess-customer-01",
      "price": 350000.0,
      "ttlSeconds": 600,
      "expiresAt": "2026-11-05T07:48:00.000",
      "timestamp": "2026-11-05T07:38:00.000"
    }
  ],
  "timestamp": "2026-11-05T07:38:00.000"
}
```

### 3.2 Phản hồi JSON khi xung đột giữ chỗ hoặc cố tình đặt trùng ghế đang bị khóa (`409 Conflict`):
```json
{
  "success": false,
  "message": "Ghế A08 đang được hành khách khác giữ chỗ thanh toán. Vui lòng chọn ghế khác!",
  "timestamp": "2026-11-05T07:38:05.000"
}
```

---

## 🎯 4. KẾT LUẬN & ĐỀ XUẤT
* **Trạng thái thẻ:** ✅ **ĐẠT (PASS 7/7 DoD Test Cases)** — Sẵn sàng mở Pull Request vào `dev` và chuyển thẻ sang cột **`Done Sprint 3`**.
* **Ghi chú/Lỗi phát hiện:** Đã đồng bộ hoàn chỉnh khóa bi quan (`PESSIMISTIC_WRITE`), kiểm soát phiên giữ chỗ (`sessionId`), tự động thu hồi khóa quá hạn (TTL) và cô lập quyền nhà xe.

