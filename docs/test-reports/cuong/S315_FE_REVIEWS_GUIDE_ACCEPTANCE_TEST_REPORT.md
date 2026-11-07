# BÁO CÁO KẾT QUẢ KIỂM THỬ NGHIỆM THU ĐÁNH GIÁ — S315

> **Dự án:** TravelEasy Platform — Nền tảng đặt vé xe khách trực tuyến & quản lý vận tải đa cổng
> **Thẻ Trello:** `[FE][S315]` — Kiểm thử nghiệm thu đánh giá — Phản hồi nhà xe và trang hướng dẫn (`/reviews`)
> **Người thực hiện:** Đoàn Nhật Cường (`CuongLiam` / `joshliam`)
> **Leader review:** Phạm Công Thành (`thanhphmcong1`)
> **Sprint:** Sprint 3
> **Thời điểm chạy kiểm thử:** `<điền ngày giờ>`
> **Môi trường:** Localhost — Vite Dev Server `http://localhost:5173` / Node.js `<điền: node -v>` / Playwright `<điền: npx playwright --version>` / OS Windows
> **Công cụ:** Playwright chạy trình duyệt thật (Chromium, Firefox, WebKit, Microsoft Edge); API backend được mock bằng `page.route()`

---

## 1. KẾT LUẬN NHANH

| Hạng mục | Kết quả |
|:---|:---|
| Tổng số lượt chạy | 68 (17 test × 4 trình duyệt) |
| Đạt (passed) | **20** |
| Không đạt (failed) | **48** |
| Thời gian chạy | 3 phút 18 giây |
| **Kết luận** | ❌ **KHÔNG ĐẠT** — 12/17 kịch bản fail đồng nhất trên cả 4 trình duyệt; **nguyên nhân chưa được xác định** (xem mục 5) |

Các kịch bản đạt: hiển thị trang, API lỗi, trang `/policy`, chặn khách chưa đăng nhập, chuyển hướng khi có `bookingCode` mà chưa đăng nhập. Toàn bộ nhóm gửi đánh giá (mã vé, chống gửi lặp, phiên hết hạn, mất kết nối) **chưa được kiểm chứng**, vì các test đều fail ở bước mở form.

Lưu ý: kết quả fail đồng nhất ở 4 trình duyệt cho thấy vấn đề không nằm ở engine trình duyệt. Hiện chưa đủ căn cứ để kết luận đó là lỗi của ứng dụng hay do selector/dữ liệu mock trong test chưa khớp với mã nguồn thật.

---

## 2. MỤC TIÊU & PHẠM VI

**Mục tiêu:** Kiểm thử nghiệm thu luồng đánh giá chuyến đi, phản hồi chính thức của nhà xe và trang hướng dẫn công khai trên `/reviews`, theo trạng thái vé và quyền người dùng.

**Trong phạm vi:**
1. Hiển thị trang đánh giá, scorecard, cam kết minh bạch, phản hồi của nhà xe, bộ lọc, trạng thái rỗng, lightbox ảnh.
2. Trang hướng dẫn / quy chế `/policy`.
3. Quyền: khách chưa đăng nhập bị yêu cầu đăng nhập; người đã đăng nhập mở được form.
4. Gửi đánh giá: mã vé hợp lệ, không tồn tại, đã dùng; chống gửi lặp; phiên hết hạn (401); mất kết nối.

**Ngoài phạm vi:** kiểm thử backend thật (mọi API được mock), hiệu năng, thiết bị thật.

**Giới hạn của phương pháp:** vì API được mock, bộ test này chỉ chứng minh hành vi của Frontend; **chưa chứng minh backend từ chối đúng vé trái quy tắc**.

**Phạm vi mã nguồn:** chỉ thêm file kiểm thử, cấu hình Playwright, ảnh và báo cáo. Không sửa `ReviewsPage.tsx` hay mã nguồn ứng dụng.

---

## 3. CÁCH TÁI HIỆN

```powershell
cd frontend
npm install
npx playwright install chromium firefox webkit
npm run test:acceptance:s315
```

Ảnh chụp: `docs/test-reports/cuong/screenshots/`. Dữ liệu lỗi của Playwright: `docs/test-reports/cuong/test-results/`.

---

## 4. KẾT QUẢ CHI TIẾT TỪNG KỊCH BẢN

Mỗi kịch bản chạy trên 4 project: chromium, firefox, webkit, edge.

| Mã | Nhóm | Kịch bản | Kết quả (4 trình duyệt) |
|:---|:---|:---|:---:|
| S315-01 | Hiển thị | Tiêu đề, cam kết người đi thật, scorecard | ✅ PASS 4/4 |
| S315-02 | Hiển thị | Hộp phản hồi chính thức của nhà xe | ❌ FAIL 4/4 |
| S315-03 | Hiển thị | Đánh giá không có phản hồi thì không hiện hộp phản hồi | ❌ FAIL 4/4 |
| S315-04 | Hiển thị | Lọc 5 sao | ❌ FAIL 4/4 |
| S315-05 | Hiển thị | Trạng thái rỗng (chưa có đánh giá) | ❌ FAIL 4/4 |
| S315-06 | Hiển thị | API reviews lỗi: không trắng trang, không crash | ✅ PASS 4/4 |
| S315-07 | Hiển thị | Bấm ảnh mở lightbox | ❌ FAIL 4/4 |
| S315-08 | Hướng dẫn | Trang `/policy` hiển thị đúng | ✅ PASS 4/4 |
| S315-09 | Quyền | Khách bấm "Viết Đánh Giá": bị yêu cầu đăng nhập, không mở form, không gọi API | ✅ PASS 4/4 |
| S315-10 | Quyền | `/reviews?bookingCode=...` khi chưa đăng nhập: chuyển sang đăng nhập kèm `redirect` | ✅ PASS 4/4 |
| S315-11 | Quyền | Đã đăng nhập: mở được form viết đánh giá | ❌ FAIL 4/4 |
| S315-12 | Gửi đánh giá | Mã vé hợp lệ: gửi thành công, đúng 1 request | ❌ FAIL 4/4 |
| S315-13 | Gửi đánh giá | Mã vé không tồn tại / chưa hoàn thành: bị từ chối rõ ràng | ❌ FAIL 4/4 |
| S315-14 | Gửi đánh giá | Mã vé đã dùng: bị từ chối rõ ràng | ❌ FAIL 4/4 |
| S315-15 | Gửi đánh giá | Bấm gửi liên tiếp khi mạng chậm: chỉ 1 request | ❌ FAIL 4/4 |
| S315-16 | Gửi đánh giá | Phiên hết hạn (401): không báo thành công giả | ❌ FAIL 4/4 |
| S315-17 | Gửi đánh giá | Mất kết nối khi gửi: báo lỗi, không thành công giả | ❌ FAIL 4/4 |

### Tổng hợp theo trình duyệt

| Project | Passed | Failed |
|:---|:---:|:---:|
| chromium | 5 | 12 |
| firefox | 5 | 12 |
| webkit | 5 | 12 |
| edge | 5 | 12 |
| **Tổng** | **20** | **48** |

### Output terminal (tóm tắt)

```text
> playwright test e2e/S315-acceptance.spec.ts
Running 68 tests using 4 workers
...
  48 failed
    [chromium/firefox/webkit/edge] › [S315-02], [S315-03], [S315-04], [S315-05], [S315-07],
                                     [S315-11], [S315-12], [S315-13], [S315-14], [S315-15],
                                     [S315-16], [S315-17]
  20 passed (3.3m)
```

---

## 5. PHÂN TÍCH CÁC KỊCH BẢN FAIL

> Mục này ghi nhận **hiện trạng**. Chưa gán mã bug cho ứng dụng vì chưa phân biệt được lỗi ứng dụng với lỗi cấu hình test.

### 5.1. Nhóm A — Không mở được form viết đánh giá (S315-11 đến S315-17)

* **Bằng chứng ghi nhận (log trình duyệt edge, S315-13 đến S315-17):** sau khi bấm nút "Viết Đánh Giá", phần tử có chữ `Viết Đánh Giá Chuyến Đi` không xuất hiện trong 5000ms.
* S315-11 và S315-12 có log chi tiết nằm trong `test-results/` (`<điền từ error-context.md>`).
* **Dự kiến có liên quan:** cùng một bước mở form là điểm chặn của cả nhóm, nên các test gửi đánh giá (mã vé, chống gửi lặp, 401, mất kết nối) **chưa được kiểm chứng**.

### 5.2. Nhóm B — Không thấy dữ liệu đánh giá mock (S315-02, 03, 04, 05, 07)

* Các test này cần danh sách đánh giá từ API mock; S315-01 và S315-06 (không cần dữ liệu danh sách) đạt.
* Chi tiết lỗi từng test: `<điền từ error-context.md>`.

### 5.3. Nguyên nhân cần xác minh

| # | Giả thuyết | Cách xác minh |
|:---:|:---|:---|
| 1 | Khóa `localStorage` dùng trong test (`traveleasy_token`, `traveleasy_user`) khác khóa thật của ứng dụng, nên phiên đăng nhập giả không được nhận | Đăng nhập thủ công, mở DevTools → Application → Local Storage để đối chiếu tên khóa |
| 2 | Đường dẫn API đánh giá thật khác mẫu mock (`/api/reviews`, `/api/reviews/summary`) | Mở DevTools → Network tại `/reviews`, ghi lại URL request danh sách đánh giá |
| 3 | Chữ hiển thị thật khác chữ trong test (tiêu đề modal, tên nút, thông báo) | So với giao diện thật ở ảnh chụp lỗi |
| 4 | Ứng dụng thật chưa có tính năng tương ứng | Chỉ kết luận sau khi loại trừ 1–3, rồi mới ghi thành bug |

**Kết quả xác minh:** `<điền sau khi kiểm tra>`.

---

## 6. ẢNH CHỤP MINH CHỨNG

Thư mục: `docs/test-reports/cuong/screenshots/`. Quy ước tên: `S315-<số test>-<project>.png`, ví dụ `S315-13-chromium.png`.

Spec chụp ảnh tự động sau mỗi test (kể cả test fail), nên mỗi lượt chạy có một ảnh. Số file thực tế: `<điền: đếm số ảnh trong thư mục, mong đợi 68>`.

---

## 7. TIÊU CHÍ NGHIỆM THU (DoD)

- [ ] Các luồng đánh giá, phản hồi của nhà xe và trang hướng dẫn xử lý chính xác theo trạng thái vé và quyền người dùng — *phần quyền khách đạt (S315-09, 10), phần theo trạng thái vé chưa kiểm chứng được*.
- [ ] Mã không hợp lệ, đã dùng hoặc không tồn tại bị từ chối rõ ràng — *chưa kiểm chứng (S315-13, 14 fail)*.
- [ ] Có kiểm tra thao tác lặp, lỗi kết nối và quyền — *quyền: đạt; thao tác lặp và lỗi kết nối khi gửi: chưa kiểm chứng (S315-15, 16, 17 fail)*.
- [ ] Có kiểm thử luồng thành công, lỗi và trường hợp biên; kết quả ghi trong PR — *luồng gửi thành công chưa kiểm chứng (S315-12 fail)*.
- [x] Test chạy bằng trình duyệt thật trên Chromium, Firefox, WebKit và Edge.
- [x] Không có thay đổi ngoài phạm vi task.
- [ ] Leader xác nhận checklist và bằng chứng.

---

## 8. KẾT LUẬN & ĐỀ XUẤT

* **Trạng thái:** ❌ **KHÔNG ĐẠT** — 20/68 lượt chạy đạt; 12/17 kịch bản fail trên cả 4 trình duyệt; nguyên nhân chưa xác định.
* **Đề xuất:**
  1. Thực hiện các bước xác minh ở mục 5.3, chỉnh test cho khớp ứng dụng thật nếu sai lệch nằm ở test.
  2. Chạy lại `npm run test:acceptance:s315`, cập nhật số liệu và báo cáo.
  3. Chỉ ghi bug cho nhóm Frontend sau khi đã loại trừ lỗi cấu hình test, kèm bước tái hiện và ảnh.
  4. Chuyển thẻ sang `Done Sprint 3` theo quyết định của Leader.
* **Hạn chế đã biết:**
  * API được mock, không kiểm chứng được backend.
  * WebKit và Chromium của Playwright không phải Safari hoặc Edge cài thật.
  * Chưa đo hiệu năng và chưa kiểm thử trên thiết bị thật.