# 📋 MẪU BÁO CÁO KẾT QUẢ KIỂM THỬ (TEST REPORT TEMPLATE)
> **Hướng dẫn:** Thành viên copy file này vào thư mục của mình (`docs/test-reports/<ten-ban>/`) và đổi tên thành `<MA_THE>_TEST_REPORT.md` (Ví dụ: `S308_TEST_REPORT.md`).  
> **Tuyệt đối:** Không sửa file của thành viên khác để tránh 100% xung đột Git.

---

## 📌 1. THÔNG TIN THẺ KIỂM THỬ
* **Mã thẻ Trello:** `[S3xx]`
* **Tên task:** *(Ví dụ: [BE][S308] Kiểm thử tích hợp API tìm kiếm)*
* **Người thực hiện:** *(Nguyễn Đại Phát / Phạm Thanh Phong / Đoàn Nhật Cường / Trần Minh Đức)*
* **Ngày kiểm thử:** *(YYYY-MM-DD)*
* **Môi trường kiểm thử:** Localhost (Backend 8080 / Frontend 5173 / Supabase Database)

---

## 🔍 2. CHI TIẾT KỊCH BẢN KIỂM THỬ (TEST SCENARIOS)

| STT | Kịch bản kiểm thử (Test Case) | Dữ liệu đầu vào (Input) | Kết quả mong đợi (Expected) | Kết quả thực tế (Actual) | Đánh giá |
|:---:|:---|:---|:---|:---|:---:|
| 1 | Luồng chuẩn (Happy Path) | Tìm chuyến: Sài Gòn ➔ Đà Lạt | Trả về danh sách chuyến xe đúng tuyến | Danh sách hiển thị đúng chuyến mở bán | **PASS** |
| 2 | Trường hợp biên (Edge Case) | Tìm ngày quá khứ hoặc tuyến không tồn tại | Báo lỗi hoặc hiển thị rỗng thân thiện | Hiển thị thông báo "Không tìm thấy chuyến" | **PASS** |
| 3 | Kiểm tra phân quyền (Security) | Gọi API mà không có Token hoặc sai Role | Trả về mã lỗi 401 hoặc 403 Forbidden | Trả về 403 Forbidden chuẩn bảo mật | **PASS** |

---

## 📸 3. BẰNG CHỨNG KIỂM THỬ (EVIDENCE)
*(Chụp ảnh màn hình Postman / Giao diện hoặc copy response JSON dán vào đây)*:

```json
{
  "status": 200,
  "message": "Success",
  "data": { ... }
}
```

---

## 🎯 4. KẾT LUẬN & ĐỀ XUẤT
* **Trạng thái thẻ:** ✅ **ĐẠT (PASS)** — Sẵn sàng chuyển thẻ sang cột **`Done Sprint 3`**.
* **Ghi chú/Lỗi phát hiện (nếu có):** Không có lỗi nghiêm trọng.

