# BÁO CÁO KẾT QUẢ KIỂM THỬ TÍCH HỢP KHÓA GHẾ (S309 TEST REPORT)
> **Hướng dẫn:** Báo cáo kiểm thử độc lập của thành viên Phạm Thanh Phong tại `docs/test-reports/phong/S309_TEST_REPORT.md`.  
> **Tuyệt đối:** Tuân thủ quy chuẩn Zero Merge Conflict và 100% Commit Tiếng Việt có dấu.

---

## 1. THÔNG TIN THẺ KIỂM THỬ
* **Mã thẻ Trello:** `[S309]` (`6ae81139` / `oUXpbgI1`)
* **Tên task:** `[Ưu tiên: 2] [3 SP] [BE][S309] Kiểm thử tích hợp khóa ghế — Hết hạn, đồng thời và chống đặt trùng (/api/seat-locks)`
* **Người thực hiện:** Phạm Thanh Phong (`phmthanhphong17`)
* **Người rà soát:** Phạm Công Thành (`thanhphmcong1`)
* **Ngày kiểm thử:** `2026-11-06`
* **Môi trường kiểm thử:** Localhost & Spring Boot MockMvc Integration Test (`@ActiveProfiles("test")` / H2 In-Memory & Pessimistic Write Lock)
* **Tệp kiểm thử tự động:** `backend/src/test/java/com/traveleasy/integration/S309ApiIntegrationTest.java`
* **Nguyên tắc thực hiện:** Chỉ bổ sung tệp kiểm thử độc lập `S309ApiIntegrationTest.java` và báo cáo kiểm thử trên các API giữ chỗ/đặt vé hiện hữu của nhánh `dev`, giữ nguyên 100% mã nguồn nghiệp vụ gốc để đảm bảo an toàn tuyệt đối và 0 xung đột mã nguồn.

---

## 2. CHI TIẾT KỊCH BẢN KIỂM THỬ (TEST SCENARIOS)

| STT | Kịch bản kiểm thử (Test Case) | Dữ liệu đầu vào (Input) | Kết quả mong đợi (Expected) | Kết quả thực tế (Actual) | Đánh giá |
|:---:|:---|:---|:---|:---|:---:|
| 1 | **DoD 1 — Khóa giữ chỗ ghế 10 phút & đồng bộ sơ đồ ghế** | `POST /api/v1/trips/{tripId}/seats/hold` với `seatCodes: ["A02", "A03"]`, `sessionId: "sess-customer-01"` | Trả về `200 OK`, trạng thái `LOCKED`, đồng nhất với `GET /api/v1/trips/{id}` | Trả về `200 OK`, đồng bộ chính xác trạng thái ghế `LOCKED` trên cả 2 API | **PASS** |
| 2 | **DoD 2 — Chặn giữ trùng ghế đang LOCKED & bảo toàn nguyên tử lô ghế** | Phiên A giữ ghế `A02`; Phiên B gửi lô `["A04", "A02"]` | Phiên B bị từ chối `400 Bad Request` và ghế `A04` không bị khóa dở dang | Phiên B bị từ chối, ghế `A04` bảo toàn trạng thái `AVAILABLE` | **PASS** |
| 3 | **DoD 3 — Cạnh tranh đồng thời (Multi-thread Concurrency)** | 6 luồng (`ExecutorService` + `CountDownLatch`) cùng gọi giữ ghế `A04` tại cùng một thời điểm | Duy nhất 1 luồng khóa thành công (`200 OK`), 5 luồng còn lại bị từ chối | `successCount = 1`, `rejectedCount = 5`, ghế `A04` mang trạng thái `LOCKED` | **PASS** |
| 4 | **DoD 4 — Giải phóng ghế giữ chỗ & mở lại cho khách hàng mới** | Gọi `POST /api/v1/trips/{tripId}/seats/release` cho ghế `A05`, sau đó khách mới giữ lại `A05` | Ghế `A05` về `AVAILABLE` và khách hàng mới giữ chỗ thành công (`200 OK`) | Giải phóng thành công và cấp giữ chỗ mới cho `sess-second` | **PASS** |
| 5 | **DoD 5 — Chống đặt trùng (Anti-Double-Booking) & kiểm tra ghế không tồn tại** | Đặt ghế `A06` 2 lần trên `POST /api/v1/bookings`; giữ ghế `A01` đã `BOOKED`; giữ ghế `Z99` không tồn tại | Lần đặt trùng và ghế đã bán trả về `409 Conflict`; ghế không tồn tại trả về `404 Not Found` | Trả về đúng mã HTTP `200`, `409`, `409`, `404` chuẩn `ApiResponse` | **PASS** |

---

## 3. BẰNG CHỨNG KIỂM THỬ (EVIDENCE)

### 3.1 Lệnh chạy kiểm thử tái lập kết quả:
```powershell
cd backend
.\gradlew.bat test --tests com.traveleasy.integration.S309ApiIntegrationTest --info
```

### 3.2 Phản hồi JSON chuẩn khi khóa ghế thành công (`POST /api/v1/trips/{tripId}/seats/hold`):
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
      "holderSessionId": "sess-customer-01"
    }
  ]
}
```

---

## 4. KẾT LUẬN & ĐỀ XUẤT
* **Trạng thái thẻ:** **ĐẠT (PASS 5/5 DoD Test Cases)** — Đã khôi phục 100% mã nguồn nghiệp vụ gốc về nguyên trạng nhánh `dev`, PR chỉ chứa đúng tệp kiểm thử `S309ApiIntegrationTest.java` và báo cáo `S309_TEST_REPORT.md`.
