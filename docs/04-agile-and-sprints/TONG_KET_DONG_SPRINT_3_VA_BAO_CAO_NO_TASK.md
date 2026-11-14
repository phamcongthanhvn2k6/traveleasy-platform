# 📋 BIÊN BẢN CHÍNH THỨC ĐÓNG SPRINT 3 & BÁO CÁO GHI NỢ CÔNG VIỆC (TASK DEBT)
## ĐỀ TÀI: NỀN TẢNG ĐẶT VÉ XE KHÁCH LIÊN TỈNH & QUẢN LÝ NHÀ XE TRAVELEASY
### ĐƠN VỊ: NHÓM 7 (OJT CAPSTONE PROJECT)
### CHỦ TRÌ NGHIỆM THU: PHẠM CÔNG THÀNH (TEAM LEADER)
### THỜI ĐIỂM CHỐT SỔ: NGÀY 14 THÁNG 11 NĂM 2026

---

## 📢 PHẦN I: TUYÊN BỐ CHÍNH THỨC KẾT THÚC & ĐÓNG SPRINT 3

Căn cứ vào kế hoạch phân công công việc Scrum/Agile của Nhóm 7 và dữ liệu quản trị thực tế được đồng bộ thời gian thực từ hệ thống Trello Board (`TravelEasy_Platform - ID: AA5BYoe1`) cùng kho mã nguồn GitHub (`traveleasy-platform`):

> **QUYẾT ĐỊNH**:
> 1. **Chính thức tuyên bố KẾT THÚC và ĐÓNG SPRINT 3** kể từ ngày **14/11/2026**.
> 2. Đóng băng danh sách công việc của Sprint 3. Không tiếp tục đưa task mới vào phạm vi Sprint 3.
> 3. Toàn bộ 18 task hoàn thành đạt đầy đủ tiêu chuẩn nghiệm thu (Definition of Done - DoD) được giữ nguyên tại cột **`Done Sprint 3`**.
> 4. Toàn bộ các công việc chưa hoàn tất nghiệm thu (3 task) được **lập sổ ghi nợ (Debt Ledger)**, bảo lưu hiện trạng tại cột **`Code Review`** và chuyển giao trách nhiệm hoàn thành sang Sprint 4 / Giai đoạn bàn giao cuối.

---

## 📊 PHẦN II: TỔNG HỢP KẾT QUẢ SPRINT 3

### 1. Chỉ số thực thi cốt lõi (Scrum Velocity & KPIs)
- **Tổng số task trong phạm vi Sprint 3**: **21 tasks**
- **Tổng điểm Story Points (SP) đăng ký**: **63 SP**
- **Số task đã hoàn thành nghiệm thu (`Done Sprint 3`)**: **18 tasks** (chiếm **85.7%** tổng số task)
- **Số điểm Story Points đã tích lũy**: **55 SP** (đạt **87.3%** khối lượng cam kết)
- **Số task chưa hoàn thành (Ghi nợ)**: **3 tasks** (chiếm **14.3%** số task)
- **Số điểm Story Points ghi nợ**: **8 SP** (chiếm **12.7%** khối lượng cam kết)
- **Chỉ số kiểm thử tự động**: **242 / 242 Tests Passed (100%)**
- **Chỉ số Build Frontend & Typecheck**: **Vite Build Pass (0 errors)**

### 2. Bảng phân bổ KPI & Story Points theo từng thành viên

| STT | Họ và tên thành viên | Username Trello | Vai trò phụ trách | Task Hoàn thành | SP Hoàn thành | Task Nợ lại | SP Nợ lại | Tỷ lệ hoàn thành SP | Đánh giá xếp loại |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | **Phạm Công Thành** | `@thanhphmcong1` | Team Leader / DevOps / System Architect | **5 tasks** | **16 SP** | 0 | 0 SP | **100%** | **Xuất sắc** |
| 2 | **Nguyễn Đại Phát** | `@phatnguyn146` | Fullstack Lead / Admin & Tracking | **6 tasks** | **17 SP** | 0 | 0 SP | **100%** | **Xuất sắc** |
| 3 | **Phạm Thanh Phong** | `@phmthanhphong17` | Backend Core / Concurrency & POS | **2 tasks** | **8 SP** | 0 | 0 SP | **100%** | **Tốt** |
| 4 | **Trần Minh Đức** | `@minhdctrn13` | Fullstack / Pricing, Transfer & P&L | **4 tasks** | **11 SP** | 0 | 0 SP | **100%** | **Tốt** |
| 5 | **Đoàn Nhật Cường** | `@joshliam` | Mobile & App Operations Specialist | **1 task** | **3 SP** | **3 tasks** | **8 SP** | **27.3%** | **Ghi nợ công việc** |
| 6 | **Phan Trung Kiên** | `@kienphantrung8` | QA & BA Documentation Support | 0 task | 0 SP | 0 | 0 SP | N/A | Hoàn thành tài liệu |
| **TỔNG** | **TOÀN ĐỘI NHÓM 7** | - | - | **18 tasks** | **55 SP** | **3 tasks** | **8 SP** | **87.3%** | **HOÀN THÀNH SPRINT 3** |

---

## 🏆 PHẦN III: DANH MỤC CHI TIẾT 18 TASK ĐÃ HOÀN THÀNH TRONG CỘT `Done Sprint 3`

### 1. Phạm Công Thành (5 tasks — 16 SP)
* `[S303][DEVOPS]` **Đóng Gói Docker Compose Production & Triển Khai CI/CD Lên VPS Thực Tế (103.72.57.149)** — **4 SP**
  - Đóng gói container backend Spring Boot, frontend React Vite, PostgreSQL, Redis và Caddy web server. Triển khai pipeline GitHub Actions tự động build, test và deploy lên VPS.
* `[S302][MAIL]` **Dịch vụ Email Tự Động Phê Duyệt Hồ Sơ Đối Tác & Cấp Phát Tài Khoản B2B (/company/login)** — **3 SP**
  - Tích hợp JavaMailSender gửi email HTML thông báo kết quả thẩm định hồ sơ KYB của nhà xe kèm thông tin đăng nhập tự động.
* `[S309][PERF]` **Màn hình Loading chuyển trang & Tối ưu hiệu năng giao diện SWR Cache 0ms, Skeleton Vé của tôi (/my-tickets)** — **3 SP**
  - Cải thiện trải nghiệm người dùng với Shimmer loading skeleton, tối ưu cache client với SWR đạt tốc độ render tức thì.
* `[S308][DEMO-DEFENSE]` **Xây Dựng Trung Tâm Trình Diễn Demo Hub 15 Phút (/demo) & Slide Bảo Vệ OJT** — **3 SP**
  - Thiết kế trang Demo Hub 1 click đóng vai các nhân vật (Khách hàng, Nhà xe, Quản trị viên) và slide thuyết trình chuẩn chỉ phục vụ bảo vệ đồ án.
* `[S311]` **Đối Soát Doanh Số Bán Vé Định Kỳ & Quản Lý Ví Nhà Xe** — **3 SP**
  - Xây dựng nghiệp vụ quyết toán doanh số định kỳ, tính toán hoa hồng sàn, hiển thị lịch sử biến động số dư ví nhà xe.

### 2. Nguyễn Đại Phát (6 tasks — 17 SP)
* `[S306][TRACKING]` **Bản Đồ Định Vị GPS Live Tracking Xe Chạy Thời Gian Thực (/tracking/:tripId)** — **4 SP**
  - Bản đồ tương tác Leaflet/OpenStreetMap mô phỏng tọa độ GPS, SSE truyền dữ liệu xe chạy, tính toán thời gian đến dự kiến (ETA), đồng bộ cảnh báo an toàn.
* `[S310][REPORTS]` **Phân Hệ Báo Cáo Thống Kê Doanh Thu & Tỷ Lệ Lấp Đầy Ghế Nhà Xe (/company/reports)** — **3 SP**
  - Báo cáo phân tích doanh thu đa chiều theo tuyến, theo xe, tỷ lệ lấp đầy ghế (load factor), biểu đồ trực quan hóa dữ liệu.
* `[S321]` **Thiết Lập Chính Sách Phí Hoàn Hủy & Xử Lý Yêu Cầu Hủy Vé** — **3 SP**
  - Cấu hình bậc thang phí phạt hủy vé theo thời gian báo trước (>24h, 12h-24h, <12h), tự động hoàn tiền và giải phóng ghế về trạng thái `AVAILABLE`.
* `[FEAT]` **Implement SMS OTP Rate Limiting & Resend Countdown** — **3 SP**
  - Cơ chế chặn spam OTP (rate limit), đếm ngược 60s gửi lại, bảo vệ endpoint xác thực tài khoản.
* `[S314]` **Kiểm Thử Hồi Quy & Tích Hợp Toàn Bộ Luồng Thanh Toán** — **2 SP**
  - Viết suite test kiểm thử toàn diện luồng thanh toán VNPAY, kiểm tra chữ ký số HMAC-SHA512, chống ghi nhận trùng giao dịch.
* `[S322]` **Xuất PDF/Excel Lệnh Vận Chuyển Điện Tử Chuẩn Bộ GTVT** — **2 SP**
  - Tạo Lệnh vận chuyển điện tử theo Nghị định 10/2020/NĐ-CP và Thông tư 12/2020/TT-BGTVT, hỗ trợ in ấn A4, mã QR xác thực CSGT và xuất Excel.

### 3. Phạm Thanh Phong (2 tasks — 8 SP)
* `[S301][CORE]` **Đồng bộ Khóa ghế Concurrency Lock 10:00 & Giữ chỗ Real-time SSE** — **4 SP**
  - Giải quyết bài toán Race Condition khi nhiều người cùng chọn 1 ghế với cơ chế Pessimistic Lock kết hợp đếm ngược 10 phút và broadcast SSE tức thời.
* `[S304][POS]` **Giao diện & API Bán Vé Nhanh Tại Quầy Bến Xe POS (/company/pos) & In Vé Nhiệt 80mm** — **4 SP**
  - Phân hệ bán vé tốc hành tại quầy bến xe cho nhân viên, tự động in vé khổ nhiệt 80mm kèm QR code lên xe.

### 4. Trần Minh Đức (4 tasks — 11 SP)
* `[S307][PRICING]` **Phân Hệ Quản Trị Giá Vé Động & Phụ Thu Lễ Tết/Cuối Tuần (/company/pricing-rules)** — **3 SP**
  - Xây dựng luật điều chỉnh giá vé linh hoạt theo ngày trong tuần, dịp lễ Tết, tỷ lệ lấp đầy ghế theo thời gian thực.
* `[S316]` **Nghiệp Vụ Đổi Vé & Chuyển Chuyến Xe Khách** — **3 SP**
  - Hỗ trợ hành khách đổi sang chuyến xe khác, tính toán chênh lệch giá vé và cập nhật trạng thái ghế cũ/mới tự động.
* `[S317]` **Quản Lý Đón Trả Trung Chuyển Hành Khách Tận Nơi** — **3 SP**
  - Phân hệ ghi nhận và quản lý danh sách hành khách đăng ký xe trung chuyển đón trả tận nhà/điểm hẹn.
* `[S318]` **Sổ Chi Phí Vận Hành Chuyến & Báo Cáo Lãi Lỗ (P&L)** — **2 SP**
  - Ghi chép chi phí cầu đường, nhiên liệu, phụ phí bến bãi, tính toán lợi nhuận ròng thực tế cho từng chuyến xe xuất bến.

### 5. Đoàn Nhật Cường (1 task — 3 SP)
* `[S305][SHIFTS]` **Quản Lý Ca Trực & Bàn Giao Tiền Mặt Quầy Bến Xe (/company/shifts)** — **3 SP**
  - Giao diện và API mở/đóng ca trực thu ngân, đối soát tiền mặt thực thu với doanh số vé in tại quầy.

---

## ⚠️ PHẦN IV: SỔ GHI NỢ CÔNG VIỆC CHƯA HOÀN THÀNH (TASK & TECHNICAL DEBT LEDGER)

Căn cứ vào trạng thái rà soát thực tế trên Trello Board tại thời điểm đóng Sprint 3, toàn bộ **3 tasks (tổng cộng 8 Story Points)** chưa vượt qua kiểm duyệt nghiệm thu được chính thức ghi vào **Sổ ghi nợ công việc của nhóm**:

### 1. Bảng kê chi tiết các khoản nợ:

```
+----------------------------------------------------------------------------------------------------------------+
|                                    SỔ GHI NỢ TASK SPRINT 3 (TASK DEBT LEDGER)                                  |
+-----+---------+-------------------------------------------------------+----+-------------------+---------------+
| STT | Mã Task | Tên công việc (User Story / Task)                     | SP | Người chịu trách  | Trạng thái    |
|     |         |                                                       |    | nhiệm (Assignee)  | hiện tại      |
+-----+---------+-------------------------------------------------------+----+-------------------+---------------+
|  1  |  S315   | Code Review & Tối Ưu Hóa Hiệu Năng Truy Vấn CSDL      | 2  | Đoàn Nhật Cường   | Code Review   |
|  2  |  S319   | Phân Công Tổ Lái & Kiểm Tra Điều Kiện Xuất Bến        | 3  | Đoàn Nhật Cường   | Code Review   |
|  3  |  S320   | WebApp Quét QR Soát Vé & Điểm Danh Hành Khách Lên Xe   | 3  | Đoàn Nhật Cường   | Code Review   |
+-----+---------+-------------------------------------------------------+----+-------------------+---------------+
|                               TỔNG CỘNG NỢ: 3 TASKS (8 STORY POINTS)                                          |
+----------------------------------------------------------------------------------------------------------------+
```

### 2. Phân tích chi tiết từng khoản nợ và nguyên nhân tồn đọng:

#### 📌 Task 1: `[S315]` Code Review & Tối Ưu Hóa Hiệu Năng Truy Vấn CSDL (2 SP)
- **Người phụ trách**: **Đoàn Nhật Cường** (`@joshliam`)
- **Vị trí trên Trello**: Cột `Code Review` (ID thẻ: `6ae81011b079250c3fdf6bcc`)
- **Lý do chưa nghiệm thu**: Thành viên đã rà soát một số câu lệnh SELECT nhưng chưa hoàn tất tài liệu đo lường hiệu năng (`EXPLAIN ANALYZE`), chưa tạo đủ bộ Index cho các trường tra cứu tần suất cao (`trip_id`, `seat_code`, `departure_time`).
- **Thời hạn giải quyết**: Phải nộp báo cáo Benchmark trước ngày 16/11/2026.

#### 📌 Task 2: `[S319]` Phân Công Tổ Lái & Kiểm Tra Điều Kiện Xuất Bến (3 SP)
- **Người phụ trách**: **Đoàn Nhật Cường** (`@joshliam`)
- **Vị trí trên Trello**: Cột `Code Review` (ID thẻ: `6ae81011b079250c3fdf6bd4`)
- **Lý do chưa nghiệm thu**: Giao diện đã có form nhập thông tin tài xế và phụ xe, tuy nhiên luồng backend kiểm tra tự động điều kiện an toàn (Nồng độ cồn = 0.00 mg/L, Giờ lái xe liên tục < 4 tiếng theo Luật Giao thông đường bộ) chưa tích hợp validation chặn lệnh xuất bến.
- **Thời hạn giải quyết**: Hoàn thiện tích hợp API validation trước ngày 16/11/2026.

#### 📌 Task 3: `[S320]` WebApp Quét QR Soát Vé & Điểm Danh Hành Khách Lên Xe (3 SP)
- **Người phụ trách**: **Đoàn Nhật Cường** (`@joshliam`)
- **Vị trí trên Trello**: Cột `Code Review` (ID thẻ: `6ae81011b079250c3fdf6bd6`)
- **Lý do chưa nghiệm thu**: Luồng quét QR qua camera thiết bị di động gặp lỗi cấp quyền MediaStream trên các trình duyệt iOS Safari khi deploy môi trường HTTPS thực tế. Cần fallback chế độ nhập mã vé thủ công tức thì khi camera không khả dụng.
- **Thời hạn giải quyết**: Hoàn tất fix camera và fallback code trước ngày 17/11/2026.

---

## 📌 PHẦN V: KẾ HOẠCH BÀN GIAO & KẾT LUẬN

1. **Hiệu lực biên bản**: Biên bản này có giá trị xác nhận chính thức khép lại Sprint 3 của dự án TravelEasy.
2. **Kế hoạch Sprint 4 / Giai đoạn bàn giao**:
   - Thành viên **Đoàn Nhật Cường** cam kết tập trung 100% thời gian trong 48 giờ tới để trả dứt điểm **8 SP nợ** thuộc 3 task trên.
   - Nhóm tiến hành chuẩn bị tài liệu tổng duyệt, kịch bản thuyết trình bảo vệ 15 phút (Demo Hub) và slide OJT Capstone Project.
3. **Chữ ký xác nhận đại diện Nhóm 7**:
   - **Team Leader / System Architect**: *Phạm Công Thành* (Đã ký duyệt)
   - **Thành viên nhận nợ**: *Đoàn Nhật Cường* (Đã tiếp nhận cam kết)
