# BÁO CÁO KẾT QUẢ KIỂM THỬ HỒI QUY GIAO DIỆN — S317

> **Dự án:** TravelEasy Platform — Nền tảng đặt vé xe khách trực tuyến & quản lý vận tải đa cổng
> **Thẻ Trello:** `[FE][S317]` (ID: `6ae81140`) — Kiểm thử hồi quy giao diện — Bố cục thích ứng và tương thích trình duyệt (`/`)
> **Người thực hiện:** Đoàn Nhật Cường (`CuongLiam`)
> **Leader review:** Phạm Công Thành (`thanhphmcong1`)
> **Thời điểm chạy kiểm thử:** `<điền ngày giờ>`
> **Môi trường:** Localhost — Vite Dev Server `http://localhost:5173` / Node.js `<điền: node -v>` / Playwright `<điền: npx playwright --version>` / OS Windows
> **Công cụ:** Playwright chạy trình duyệt thật (Chromium, Firefox, WebKit, Microsoft Edge)

---

## 1. KẾT LUẬN NHANH

| Hạng mục | Kết quả |
|:---|:---|
| Tổng số lượt chạy | 52 (13 test × 4 trình duyệt) |
| Đạt (passed) | **44** |
| Không đạt (failed) | **8** |
| Thời gian chạy | 58.8 giây |
| **Kết luận** | ❌ **KHÔNG ĐẠT** — phát hiện lỗi giao diện mobile (1 bug, xem mục 5) |

Bộ test hoạt động đúng: nó phát hiện **trang chủ bị tràn chiều ngang ở viewport mobile** trên cả 4 trình duyệt. Tablet và desktop đạt toàn bộ.

---

## 2. MỤC TIÊU & PHẠM VI

**Mục tiêu:** Xác minh trang chủ (`/`) hiển thị đúng ở nhiều kích thước màn hình và nhiều engine trình duyệt, đồng thời kiểm tra chặn truy cập trái phép và khả năng chịu lỗi khi API không phản hồi.

**Trong phạm vi:**
1. Bố cục thích ứng tại 6 viewport: mobile (375×667, 412×915), tablet (768×1024, 1024×768), desktop (1440×900, 1920×1080).
2. Tương thích trình duyệt: Chromium (Chrome), Firefox, WebKit (Safari), Edge.
3. Kiểm soát truy cập: khách chưa đăng nhập vào `/admin/dashboard` và `/company/trips`.
4. Trường hợp biên: API backend lỗi/ngắt kết nối.

**Ngoài phạm vi:** hiệu năng (Lighthouse, FPS), kiểm thử trên thiết bị thật, đồng bộ Light/Dark theme và Toast.

**Phạm vi mã nguồn:** task này chỉ thêm file kiểm thử, cấu hình Playwright, ảnh chụp và báo cáo. Không sửa mã nguồn ứng dụng (`src/`). Lỗi phát hiện được ghi nhận để nhóm Frontend xử lý.

---

## 3. CÁCH TÁI HIỆN

```powershell
cd frontend
npm install
npx playwright install chromium firefox webkit
npm run test:regression:s317
```

---

## 4. KẾT QUẢ CHI TIẾT TỪNG KỊCH BẢN

Mỗi kịch bản chạy trên 4 project: chromium, firefox, webkit, edge.

| Mã | Nhóm | Kịch bản | Cách kiểm tra (đo từ DOM thật) | Kết quả (4 trình duyệt) |
|:---|:---|:---|:---|:---:|
| S317-RS-01 | Responsive | Mobile 375×667 | `scrollWidth` ≤ `clientWidth`; chụp ảnh | ❌ **FAIL 4/4** |
| S317-RS-02 | Responsive | Mobile 412×915 | như trên | ❌ **FAIL 4/4** |
| S317-RS-03 | Responsive | Tablet 768×1024 | như trên | ✅ PASS 4/4 |
| S317-RS-04 | Responsive | Tablet 1024×768 | như trên | ✅ PASS 4/4 |
| S317-RS-05 | Responsive | Desktop 1440×900 | như trên | ✅ PASS 4/4 |
| S317-RS-06 | Responsive | Desktop 1920×1080 | như trên | ✅ PASS 4/4 |
| S317-RS-07 | Responsive | Touch target mobile 375×667 | Chiều cao nút `button[type="submit"]` ≥ 44px | ✅ PASS 4/4 |
| S317-RS-08 | Responsive | Lưới đổi số cột theo breakpoint | Số cột `gridTemplateColumns` desktop > mobile | ✅ PASS 4/4 |
| S317-CB-01 | Cross-browser | Engine hỗ trợ CSS | `CSS.supports`: flexbox, grid, sticky, backdrop-filter | ✅ PASS 4/4 |
| S317-CB-02 | Cross-browser | Không có lỗi JS chưa bắt | 0 sự kiện `pageerror` khi tải trang | ✅ PASS 4/4 |
| S317-RBAC-01 | Phân quyền | Guest vào `/admin/dashboard` | URL cuối khớp `/admin/login` | ✅ PASS 4/4 |
| S317-RBAC-02 | Phân quyền | Guest vào `/company/trips` | URL cuối khớp `/company/login` | ✅ PASS 4/4 |
| S317-EC-01 | Biên | API lỗi (`**/api/**` bị abort) | Trang có nội dung, không có `pageerror` | ✅ PASS 4/4 |

Kết quả `CSS.supports` ghi nhận trên cả 3 engine được log: `{ flexbox: true, grid: true, sticky: true, backdrop: true }`.

### Tổng hợp theo trình duyệt

| Project | Passed | Failed |
|:---|:---:|:---:|
| chromium | 11 | 2 |
| firefox | 11 | 2 |
| webkit | 11 | 2 |
| edge | 11 | 2 |
| **Tổng** | **44** | **8** |

### Output terminal (tóm tắt)

```text
> playwright test e2e/S317-responsive-cross-browser.spec.ts
Running 52 tests using 4 workers
...
  8 failed
    [chromium] › S317 Responsive layout › [S317-RS] mobile-375x667: không tràn ngang, render được trang chủ
    [chromium] › S317 Responsive layout › [S317-RS] mobile-412x915: không tràn ngang, render được trang chủ
    [firefox]  › (2 test tương tự)
    [webkit]   › (2 test tương tự)
    [edge]     › (2 test tương tự)
  44 passed (58.8s)

Lỗi: Trang bị tràn chiều ngang
  Expected: false
  Received: true
```

---

## 5. LỖI PHÁT HIỆN

| Mã bug | Mức độ đề xuất | Mô tả |
|:---|:---|:---|
| BUG-S317-01 | Major *(Leader xác nhận mức độ)* | Trang chủ `/` bị tràn chiều ngang (`document.documentElement.scrollWidth > clientWidth`) ở viewport mobile 375×667 và 412×915, trên cả Chromium, Firefox, WebKit và Edge. Người dùng mobile có thể phải cuộn ngang. |

**Các bước tái hiện:**
1. Chạy `npm run dev` trong `frontend`.
2. Mở `http://localhost:5173/` với viewport rộng 375px hoặc 412px (DevTools → Device Toolbar).
3. Quan sát: trang có thể cuộn ngang / nội dung vượt khỏi chiều rộng màn hình.

**Kết quả mong đợi:** không có cuộn ngang ở mọi viewport mobile.
**Kết quả thực tế:** có tràn ngang. Lỗi xuất hiện đồng nhất ở 4 trình duyệt, nên nhiều khả năng do CSS/layout của ứng dụng chứ không phải đặc thù một engine.

**Nguyên nhân gốc:** chưa xác định phần tử gây tràn. Cần nhóm Frontend điều tra (đề xuất kiểm tra phần tử có chiều rộng cố định, banner, hoặc `100vw` kèm scrollbar).

**Ảnh minh chứng:** `<tên file ảnh mobile sau khi chạy lại với bản spec đã chụp ảnh trước khi assert>`.

---

## 6. ẢNH CHỤP MINH CHỨNG

Thư mục: `docs/screenshots/`, quy ước tên `S317-<project>-<viewport>.png`.

* **Đã có (20 ảnh):** tablet và desktop (4 viewport × 4 trình duyệt = 16 ảnh) và `S317-<project>-api-offline.png` (4 ảnh).
* **Chưa có (8 ảnh):** mobile 375×667 và 412×915 của 4 trình duyệt, vì test fail ở bước kiểm tra tràn ngang trước khi kịp chụp. Cần bổ sung bằng cách chụp trước khi assert (xem hướng dẫn cập nhật spec) rồi chạy lại để có ảnh minh chứng cho BUG-S317-01.

---

## 7. TIÊU CHÍ NGHIỆM THU (DoD)

- [x] Test responsive chạy bằng trình duyệt thật trên đủ 6 viewport.
- [x] Test chạy trên Chromium, Firefox, WebKit và Edge.
- [x] Guest bị chuyển hướng đúng khi vào tuyến admin và company.
- [x] Trang chủ không trắng và không có lỗi JS khi API lỗi.
- [x] Lỗi phát hiện được ghi nhận kèm bước tái hiện (BUG-S317-01).
- [ ] Ảnh chụp mobile minh chứng lỗi đã commit trong `docs/screenshots/`.
- [ ] Không còn lỗi Blocker/Critical: **chưa xác định**, chờ Leader đánh giá mức độ BUG-S317-01.
- [x] Không có thay đổi ngoài phạm vi task (`AdminLoginPage.tsx` đã hoàn nguyên).

---

## 8. KẾT LUẬN & ĐỀ XUẤT

* **Trạng thái:** ❌ **KHÔNG ĐẠT** — 44/52 lượt chạy đạt, 8 lượt fail do cùng một lỗi tràn ngang trên mobile.
* **Đề xuất:**
  1. Báo BUG-S317-01 cho Leader (`thanhphmcong1`) và nhóm Frontend để sửa phần layout trang chủ ở mobile.
  2. Sau khi bản sửa được merge, chạy lại `npm run test:regression:s317` để xác nhận 52/52 và cập nhật báo cáo.
  3. Chuyển thẻ `[FE][S317]` sang `Done Sprint 3` khi có kết quả đạt, hoặc theo quyết định của Leader nếu chấp nhận ghi nhận lỗi làm kết quả của task kiểm thử.
* **Hạn chế đã biết:**
  * WebKit và Chromium của Playwright không phải Safari hoặc Edge cài thật trên thiết bị Apple/Windows.
  * Viewport mobile là mô phỏng kích thước trong trình duyệt desktop, chưa phải thiết bị thật.
  * Chưa đo hiệu năng.
