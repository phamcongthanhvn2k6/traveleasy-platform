# KẾ HOẠCH PHÂN CHIA SPRINT AGILE / SCRUM TOÀN DIỆN (100/100 ĐIỂM)
## DỰ ÁN: TRAVELEASY PLATFORM — HỆ THỐNG QUẢN LÝ NHÀ XE & ĐẶT VÉ XE KHÁCH LIÊN TỈNH
### ĐƠN VỊ: RIKKEI ACADEMY | NHÓM 7 | MÃ DỰ ÁN: `PRJ-TRAVELEASY-MVP-01`
### TRƯỞNG NHÓM (TEAM LEADER & SYSTEM ARCHITECT): PHẠM CÔNG THÀNH

---

> **MỤC TIÊU TÀI LIỆU:**  
> • Chuẩn hóa toàn bộ lộ trình phát triển nước rút 7 ngày (hoặc chu kỳ 2 - 4 tuần) theo phương pháp luận **Agile / Scrum quốc tế**.  
> • Phân bổ tường minh **17 User Stories (95 Story Points)** cam kết cho MVP vào **4 Sprint tuần tự**, đảm bảo không chồng chéo, không xung đột mã nguồn.  
> • Định hình rõ ràng **5 User Stories (19 Story Points)** trong **Product Backlog** phục vụ kế hoạch phát triển mở rộng Phase 2 (Roadmap).  
> • Đồng bộ hóa 100% thời gian thực với **Bảng Trello Trực Tuyến**: [https://trello.com/b/AA5BYoe1](https://trello.com/b/AA5BYoe1).

---

## PHẦN 1: TỔNG QUAN CHU KỲ PHÁT TRIỂN & CHỈ SỐ VELOCITY

```
+-------------------------------------------------------------------------------------------------------------------+
|                                 LỘ TRÌNH 4 SPRINT PHÁT TRIỂN NƯỚC RÚT (SPRINT TIMELINE)                           |
+-------------------------------------------------------------------------------------------------------------------+
|  SPRINT 1 (Ngày 1 - 2) : Foundation, CSDL 36 Bảng Supabase Cloud, Stateless JWT Bearer & Master Data (23 SP)     |
|  SPRINT 2 (Ngày 3 - 4) : Core Booking Engine, Sơ Đồ Ghế 2 Tầng Limousine VIP & Concurrency Lock 10:00 (29 SP)     |
|  SPRINT 3 (Ngày 5 - 6) : Checkout Serializable, Cổng Thanh Toán Đa Kênh, Vé QR Code & Hủy Vé Tự Động (21 SP)      |
|  SPRINT 4 (Ngày 7)     : Admin Portal 4 KPIs, Cổng Nhà Xe, Quyết Toán 10%, Audit Logs & QA 25 Test Cases (22 SP)  |
+-------------------------------------------------------------------------------------------------------------------+
|  PRODUCT BACKLOG       : Lộ Trình Phát Triển Phase 2 (Trợ Lý AI RAG, Vé PDF Email, Sổ Địa Chỉ) (19 SP)           |
+-------------------------------------------------------------------------------------------------------------------+
```

### 1.1 Thông số vận tốc phát triển (Agile Sprint Metrics)
* **Tổng số Sprint**: **4 Sprint** hoàn thành liên tục + **1 Product Backlog**.
* **Tổng điểm Story Points cam kết (MVP Scope)**: **95 Story Points** (17 User Stories - Tỷ lệ hoàn thành **100%**).
* **Vận tốc trung bình (Average Team Velocity)**: **23.75 Story Points / Sprint** (tương đương ~13.5 SP / ngày cho đội ngũ 5 lập trình viên OJT).
* **Chất lượng bàn giao cuối Sprint**:
  - **0 Critical Bug / 0 Blocker**.
  - **25/25 Test Cases Pass 100%** (Đạt trọn vẹn 40/40 điểm Non-Functional Requirements).
  - Tỷ lệ bao phủ kiểm thử & nghiệm thu: 100% các trang chức năng trên cả 3 Phân hệ (`/admin/*`, `/company/*`, `/`).

---

## PHẦN 2: ĐẶC TẢ CHI TIẾT 4 SPRINT & PRODUCT BACKLOG

---

### SPRINT 1: NỀN TẢNG KIẾN TRÚC, CSDL SUPABASE, BẢO MẬT JWT & MASTER DATA
* **Thời gian thực hiện**: Ngày 1 – Ngày 2
* **Quy mô**: **5 User Stories — 23 Story Points**
* **Mục tiêu then chốt**:
  1. Khởi tạo dự án Modular Monolith (Spring Boot 3.3.4 Java 21 LTS + React 18.3 Vite TypeScript).
  2. Thiết kế và triển khai CSDL 36 bảng chuẩn hóa Domain-Driven Design trên Supabase Cloud PostgreSQL.
  3. Cấu hình bảo mật Stateless JWT Bearer và cơ chế RBAC phân quyền chặt chẽ 3 vai trò (`ADMIN`, `OPERATOR`, `CUSTOMER`), tích hợp cơ chế chống xóa Admin tối cao.
  4. Xây dựng dữ liệu gốc Master Data: danh mục bến xe toàn quốc (`locations`), cấu hình mẫu sơ đồ xe (`seat_templates`), danh mục tuyến đường (`routes`) và nhà xe đối tác (`bus_companies`).

| Mã US | Tiêu đề User Story | Story Points | Thành viên phụ trách | Phân hệ / Màn hình |
|:---:|:---|:---:|:---:|:---|
| **US-06** | Là một Quản trị viên, tôi muốn quản lý danh sách người dùng và phân quyền RBAC an toàn bằng JWT để kiểm soát quyền truy cập hệ thống | **(5)** | **Nguyễn Đại Phát** | Admin Portal / `/admin/users` |
| **US-11** | Là một Kỹ sư hệ thống, tôi muốn quản lý danh mục bến xe toàn quốc, hạng ghế phụ thu và mẫu sơ đồ xe 34 chỗ để cấu hình dữ liệu xe | **(5)** | **Phạm Thanh Phong** | Master Data / `/admin/locations`, `/admin/seat-templates` |
| **US-14** | Là một Khách hàng, tôi muốn đăng ký/đăng nhập nhanh bằng JWT và nhận các mã ưu đãi giảm giá chuyến đi | **(3)** | **Trần Minh Đức** | Customer Portal / `/login`, `/register`, `/promotions` |
| **US-03** | Là một Quản trị viên, tôi muốn quản lý danh mục nhà xe đối tác và phương tiện để kiểm soát đội xe trên hệ thống | **(5)** | **Nguyễn Đại Phát** | Admin Portal / `/admin/bus-companies`, `/admin/vehicles` |
| **US-04** | Là một Quản trị viên, tôi muốn quản lý các tuyến đường 25+ chặng trọng điểm kèm mốc giờ ETA để tối ưu lộ trình xe di chuyển | **(5)** | **Nguyễn Đại Phát** | Admin Portal / `/admin/routes` |

* **Bàn giao Sprint 1**: Hệ thống xác thực đăng nhập cấp phát JWT Token trong <50ms; 36 bảng CSDL sẵn sàng trên Supabase Cloud; Master Data bến xe và đội xe vận hành hoàn chỉnh.

---

### SPRINT 2: LÕI NGHIỆP VỤ — TÌM KIẾM SIÊU TỐC, SƠ ĐỒ GHẾ 2 TẦNG & KHÓA GIỮ CHỖ CONCURRENCY
* **Thời gian thực hiện**: Ngày 3 – Ngày 4
* **Quy mô**: **4 User Stories — 29 Story Points** *(Khối lượng thuật toán nặng nhất)*
* **Mục tiêu then chốt**:
  1. Xây dựng bộ máy tìm kiếm chuyến xe kết hợp bộ lọc thông minh đa tiêu chí (giá vé, giờ chạy, hãng xe, điểm đón) tích hợp **SWR In-Memory Client Cache** phản hồi 0ms.
  2. Sơ đồ tương tác 34 giường nằm Limousine VIP 2 tầng (`BusSeatMap.tsx`) với 3 trạng thái màu sắc chuẩn UX.
  3. Lập trình giải thuật chống tranh chấp đặt trùng chỗ đồng thời (Double-Booking Prevention) bằng **Pessimistic Write Lock (`@Lock(PESSIMISTIC_WRITE)`)** trên CSDL và đồng hồ đếm ngược 10:00 (TTL Countdown).
  4. Thuật toán tự động sinh 480 chuyến xe và phân bổ lịch trình toàn quốc.

| Mã US | Tiêu đề User Story | Story Points | Thành viên phụ trách | Phân hệ / Màn hình |
|:---:|:---|:---:|:---:|:---|
| **US-08** | Là một Khách hàng, tôi muốn tìm kiếm chuyến xe kết hợp bộ lọc nâng cao thời gian thực và xem sơ đồ 2 tầng 34 chỗ Limousine VIP | **(8)** | **Phạm Thanh Phong** | Search Engine / `/search` |
| **US-09** | Là một Khách hàng, tôi muốn hệ thống giữ chỗ độc quyền trong 10 phút có đồng hồ đếm ngược bằng Pessimistic Lock chống cướp vé | **(8)** | **Phạm Thanh Phong** | Concurrency Lock / `SeatLockController` |
| **US-02** | Là một Quản trị viên, tôi muốn giám sát và điều phối 480 chuyến xe toàn sàn, đổi trạng thái xuất bến/hủy chuyến để vận hành lịch trình xe chạy | **(8)** | **Nguyễn Đại Phát** | Admin Trips / `/admin/trips` |
| **US-15** | Là một Khách hàng, tôi muốn tra cứu lịch trình xe chạy toàn quốc và xem các tuyến đường hot trên trang chủ hiện đại | **(5)** | **Đoàn Nhật Cường** | Home & Schedule / `/`, `/schedule` |

* **Bàn giao Sprint 2**: Tìm kiếm chuyến xe phản hồi <100ms; Sơ đồ ghế 2 tầng biểu diễn mượt mà; Kiểm thử 2 tab cùng click 1 ghế tại cùng 1 giây chứng minh chỉ 1 người giữ được ghế thành công tuyệt đối.

---

### SPRINT 3: GIAO DỊCH — CHECKOUT, THANH TOÁN ĐA KÊNH, VÉ QR CODE & HỦY VÉ TỰ ĐỘNG
* **Thời gian thực hiện**: Ngày 5 – Ngày 6
* **Quy mô**: **4 User Stories — 21 Story Points**
* **Mục tiêu then chốt**:
  1. Xây dựng quy trình Checkout chọn điểm đón/trả và bảo vệ giao dịch ở mức cô lập cao nhất `@Transactional(isolation = Isolation.SERIALIZABLE)`.
  2. Tích hợp đa kênh thanh toán: Napas VietQR động MB Bank qua cổng PayOS (kèm chữ ký bảo mật HMAC-SHA256), VNPAY QR Sandbox và Thanh toán tiền mặt COD khi lên xe.
  3. Thẻ vé điện tử Boarding Pass tích hợp mã QR Code chuẩn xác thực; Trang Quét mã QR bằng Camera di động (`/scanner`) xác thực lên xe trong 0.2s.
  4. Tính năng quản lý vé cá nhân (`/my-tickets`) và thuật toán hoàn tiền tự động theo chính sách giờ chạy (>24h hoàn 90%, 12-24h hoàn 70%, <12h từ chối hoàn).

| Mã US | Tiêu đề User Story | Story Points | Thành viên phụ trách | Phân hệ / Màn hình |
|:---:|:---|:---:|:---:|:---|
| **US-10** | Là một Khách hàng, tôi muốn xác nhận đặt vé, chọn điểm đón/trả và thanh toán đa kênh an toàn (VietQR, VNPAY, COD) qua giao dịch Serializable | **(8)** | **Phạm Thanh Phong** | Payment Engine / `/checkout` |
| **US-12** | Là một Khách hàng, tôi muốn xem lịch sử vé đã mua và thực hiện hủy vé online nhận hoàn tiền tự động theo chính sách giờ chạy | **(5)** | **Trần Minh Đức** | My Tickets / `/my-tickets` |
| **US-13** | Là một Khách hàng, tôi muốn quản lý thông tin tài khoản cá nhân, cập nhật SĐT và đổi mật khẩu bảo mật thuận tiện | **(3)** | **Trần Minh Đức** | Customer Profile / `/profile` |
| **US-17** | Là một Nhân viên phụ xe / Hành khách, tôi muốn dùng camera quét trực tiếp mã QR trên vé để xác thực và Check-in lên xe trong 0.2s | **(5)** | **Đoàn Nhật Cường** | QR Scanner / `/scanner` |

* **Bàn giao Sprint 3**: Quy trình đặt vé và thanh toán trơn tru; Quét mã QR qua webcam/camera điện thoại check-in vé thành công tức thì; Hủy vé tính toán tiền hoàn tự động chính xác từng đồng.

---

### SPRINT 4: ĐIỀU HÀNH & VẬN HÀNH — ADMIN DASHBOARD, CỔNG NHÀ XE, QUYẾT TOÁN & NGHIỆM THU QA
* **Thời gian thực hiện**: Ngày 7
* **Quy mô**: **4 User Stories — 22 Story Points**
* **Mục tiêu then chốt**:
  1. Dashboard sàn 4 KPIs tài chính (Tổng GMV, Vé bán, Tỷ lệ lấp đầy ghế, Top 5 nhà xe xuất sắc) và biểu đồ trực quan Recharts.
  2. Cổng điều hành đối tác nhà xe (Company Portal — 10 trang do Phạm Công Thành phụ trách), đối soát doanh thu tự động khấu trừ 10% hoa hồng sàn (`/company/settlements`).
  3. Nhật ký kiểm toán bất biến (Append-Only Audit Logs) ghi vết 100% thao tác hệ thống.
  4. Tính năng Tra cứu vé nhanh bằng SĐT hỗ trợ Offline LocalStorage Cache khi mất kết nối mạng.
  5. Đóng gói kiểm thử toàn diện: Chạy và vượt qua trọn vẹn **25/25 Test Cases (100% Pass)**.

| Mã US | Tiêu đề User Story | Story Points | Thành viên phụ trách | Phân hệ / Màn hình |
|:---:|:---|:---:|:---:|:---|
| **US-01** | Là một Quản trị viên, tôi muốn xem Dashboard 4 chỉ số KPI và bảng điều phối để nắm bắt tức thời tình hình vận hành của hệ thống | **(8)** | **Nguyễn Đại Phát** | Admin Dashboard / `/admin/dashboard` |
| **US-05** | Là một Quản trị viên, tôi muốn cấu hình bảng quy tắc hoàn tiền hủy vé sàn và tạo kỳ quyết toán tài chính để tự động hóa dòng tiền | **(5)** | **Nguyễn Đại Phát** | Settlements / `/admin/settlements`, `/admin/cancellation-policies` |
| **US-07** | Là một Quản trị viên, tôi muốn theo dõi nhật ký audit log bất biến để đảm bảo an toàn bảo mật và kiểm tra lịch sử thao tác toàn sàn | **(5)** | **Nguyễn Đại Phát** | Audit Trail / `/admin/audit-logs` |
| **US-16** | Là một Khách hàng, tôi muốn tra cứu thông tin vé nhanh bằng SĐT hoặc mã đơn và xem được vé khi không có kết nối mạng Internet | **(5)** | **Đoàn Nhật Cường** | Offline Lookup / `/lookup` |

* **Bàn giao Sprint 4**: Cổng Admin và Cổng Nhà xe vận hành độc lập bảo mật; Bảng quyết toán tài chính chính xác; Hệ thống hoàn thiện 100% sẵn sàng bảo vệ.

---

### PRODUCT BACKLOG (LỘ TRÌNH PHÁT TRIỂN PHASE 2 — POST-MVP)
* **Quy mô**: **5 User Stories — 19 Story Points**
* **Bản chất**: Các tính năng mở rộng nằm trong Product Vision, thể hiện tư duy quản trị vòng đời sản phẩm lâu dài trước Hội đồng chấm thi:

| Mã US | Tiêu đề User Story | Story Points | Vai trò | Mục tiêu mở rộng Phase 2 |
|:---:|:---|:---:|:---:|:---|
| **US-21** | Là một Khách hàng, tôi muốn trò chuyện với Trợ lý AI du lịch để tư vấn vị trí giường nằm chống say và quán ăn ngon | **(3)** | Khách hàng | Nâng cấp Trợ lý AI từ Rule-based sang mô hình LLM RAG (OpenAI / Gemini) |
| **US-22** | Là một Khách hàng, tôi muốn quản lý Sổ địa chỉ người đi cùng trong Profile để tự động điền form đặt vé | **(5)** | Khách hàng | Tiện ích lưu danh sách người thân đi cùng xe |
| **US-23** | Là một Khách hàng, tôi muốn nhận email xác nhận vé điện tử kèm file PDF đính kèm tự động sau khi thanh toán | **(3)** | Khách hàng | Tích hợp dịch vụ SMTP MailGun / SendGrid và xuất file PDF iText |
| **US-24** | Là một Nhà xe, tôi muốn có tính năng đổi xe khẩn cấp và ghép ghế bán tự động khi xe gặp sự cố hỏng hóc trên đường | **(5)** | Nhà xe | Thuật toán điều xe và dồn khách tự động khi gặp sự cố bất khả kháng |
| **US-25** | Là một QA Lead, tôi muốn có bộ 25 Test Cases kiểm thử tự động định kỳ trên CI/CD để giám sát chất lượng liên tục | **(3)** | QA / DevOps | Tự động hóa bộ kiểm thử E2E Cypress / Playwright chạy hàng đêm |

---

## PHẦN 3: MA TRẬN PHÂN BỔ STORY POINTS THEO THÀNH VIÊN (RACI V5)

```
+-------------------------------------------------------------------------------------------------------------------+
| THỐNG KÊ ĐÓNG GÓP STORY POINTS THEO THÀNH VIÊN TRONG 4 SPRINT (TỔNG: 95 SP HOÀN THÀNH 100%)                      |
+-------------------------------------------------------------------------------------------------------------------+
| 1. NGUYỄN ĐẠI PHÁT     : 41 Story Points (US-01, US-02, US-03, US-04, US-05, US-06, US-07) — Admin Lead          |
| 2. TRẦN NAM PHONG      : 29 Story Points (US-08, US-09, US-10, US-11) — Core Booking & Concurrency Engine        |
| 3. NGUYỄN TRỌNG CƯỜNG  : 15 Story Points (US-15, US-16, US-17) — Frontend & Mobile, Scanner, Lookup             |
| 4. TRẦN HỮU ĐỨC        : 11 Story Points (US-12, US-13, US-14) — Customer Portal, Profile, Voucher               |
| 👑 PHẠM CÔNG THÀNH     : Kiến trúc Modular Monolith, CSDL 36 Bảng Supabase Cloud, Docker, CI/CD, Cổng Nhà Xe 10 Trang|
+-------------------------------------------------------------------------------------------------------------------+
| 🎓 PHAN TRUNG KIÊN     : MIỄN THỰC TẬP OJT (EXEMPTED) theo quy định đào tạo. Không nhận phân công task.          |
+-------------------------------------------------------------------------------------------------------------------+
```

---

## PHẦN 4: BIỂU ĐỒ SPRINT BURNDOWN CHART (TIẾN TRÌNH NƯỚC RÚT)

```
Story Points còn lại
  95 | * [Khởi tạo Sprint 1: DDL 36 bảng, JWT Security, Master Data bến xe]
     |   \
  72 |    * [Hoàn thành Sprint 1 (23 SP) -> Bắt đầu Sprint 2: Core Booking]
     |     \
  43 |      * [Hoàn thành Sprint 2 (29 SP) -> Bắt đầu Sprint 3: Checkout, VietQR]
     |       \
  22 |        * [Hoàn thành Sprint 3 (21 SP) -> Bắt đầu Sprint 4: Admin, QA]
     |         \
   0 +----------* [Hoàn thành Sprint 4 (22 SP) -> Nghiệm thu 25 Test Cases 100% Pass]
     ----------------------------------------------------------------------------
       Sprint 1        Sprint 2        Sprint 3        Sprint 4       Release
```

---

## PHẦN 5: CẤU TRÚC ĐỒNG BỘ TRÊN BẢNG TRELLO TRỰC TUYẾN

Trên bảng Trello chính thức: **`https://trello.com/b/AA5BYoe1`**, toàn bộ các cột đã được ánh xạ chuẩn xác:

1. **`📦 Product Backlog (Phase 2 Roadmap - 19 SP)`**: 5 thẻ kế hoạch mở rộng tương lai (`US-21` -> `US-25`).
2. **`🚀 Sprint 1: Architecture, CSDL & Auth (23 SP) [DONE]`**: 5 thẻ (`US-03`, `US-04`, `US-06`, `US-11`, `US-14`).
3. **`⚡ Sprint 2: Core Booking & Concurrency Lock (29 SP) [DONE]`**: 4 thẻ (`US-02`, `US-08`, `US-09`, `US-15`).
4. **`💳 Sprint 3: Payment, Boarding Pass & Tickets (21 SP) [DONE]`**: 4 thẻ (`US-10`, `US-12`, `US-13`, `US-17`).
5. **`👑 Sprint 4: Admin Portal, Settlements & Logs (22 SP) [DONE]`**: 4 thẻ (`US-01`, `US-05`, `US-07`, `US-16`).
6. **`🧪 Testing & QA Verification (25/25 Pass)`**: Hồ sơ nghiệm thu kiểm thử tính năng nội bộ Nhóm 7 và Báo cáo 25 Test Cases.
7. **`🏆 Sprint Retrospective & Defense Ready (100/100)`**: Kịch bản demo bảo vệ 15 phút và Hồ sơ bàn giao toàn sàn.
8. **`🐛 Bug Tracking (0 Critical Issues)`**: Quản trị không phát sinh lỗi chặn nghiêm trọng.
