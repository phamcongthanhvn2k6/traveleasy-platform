# 🎓 TÀI LIỆU THIẾT KẾ CÔNG VIỆC & KỊCH BẢN BẢO VỆ ĐỒ ÁN TỐT NGHIỆP PRE-OJT (100/100 ĐIỂM)
## DỰ ÁN: TRAVELEASY PLATFORM — HỆ THỐNG QUẢN LÝ NHÀ XE & ĐẶT VÉ XE KHÁCH LIÊN TỈNH TRỰC TUYẾN
### ĐƠN VỊ: RIKKEI ACADEMY | NHÓM 7 (SĨ SỐ: 6 THÀNH VIÊN)
### TRƯỞNG NHÓM (TEAM LEADER & SYSTEM ARCHITECT): PHẠM CÔNG THÀNH

---

## 📌 PHẦN 1: THÔNG TIN TỔNG QUAN & MỤC TIÊU ĐỒ ÁN

* **Tên đề tài**: TravelEasy Platform — Sàn Thương Mại Điện Tử Đặt Vé Xe Khách & Điều Hành Vận Tải Liên Tỉnh (Mô hình chuẩn Vexere).
* **Mã đồ án**: `PRJ-TRAVELEASY-MVP-01`
* **Công nghệ cốt lõi**:
  - **Backend**: Spring Boot 3.3.4, Java 21 LTS, Spring Security (Stateless JWT Bearer), Spring Data JPA, Hibernate.
  - **Frontend**: React 18.3, TypeScript 5.6, Vite 5.4, Tailwind CSS, Lucide React, Axios.
  - **Cơ sở dữ liệu**: Supabase Cloud PostgreSQL (Transaction Pooler 6543, 18 bảng chuẩn hóa DDD).
  - **Lưu trữ đa phương tiện**: Cloudinary CDN (Quản lý tự động kho ảnh Banner, Logo hãng xe, Điểm đến và Ảnh review).
  - **Thanh toán trực tuyến**: PayOS VietQR Napas 24/7 (MB Bank) & Tiền mặt COD.
  - **DevOps & QA**: Docker, Docker Compose, GitHub Actions CI/CD Pipeline.
* **Mục tiêu điểm số**: **100/100 ĐIỂM TUYỆT ĐỐI** (60 Điểm Functional + 40 Điểm Non-Functional & Phản biện).

---

## 👥 PHẦN 2: CƠ CẤU NHÂN SỰ & BẢNG PHÂN CÔNG CÔNG VIỆC CHUẨN (STT 1 ➔ 6)

Dự án áp dụng kiến trúc **Two-Portal Architecture** (Phân hệ Admin & Phân hệ Khách hàng) kết hợp ma trận trách nhiệm **RACI** phân hóa theo đúng năng lực thực tế của từng thành viên:

```
+------------------------------------------------------------------------------------------------------------------+
|                                    MA TRẬN PHÂN CHIA TRÁCH NHIỆM (RACI V3)                                      |
+------------------------------------------------------------------------------------------------------------------+
| 👑 PHẠM CÔNG THÀNH (STT 4) - TRƯỞNG NHÓM & KIẾN TRÚC SƯ TRƯỞNG                                                  |
|    - Kiến trúc tổng thể hệ thống, Bảo mật Spring Security, Supabase Cloud, Cloudinary CDN, Docker CI/CD         |
|    - Toàn quyền phụ trách: ADMIN PORTAL (/admin/*) & PARTNER OPERATOR PORTAL (/company/*)                       |
+------------------------------------------------------------------------------------------------------------------+
| 🚀 NHÓM KỸ THUẬT CỨNG (MODULE NẶNG, LOGIC THUẬT TOÁN & CONCURRENCY):                                             |
|    • STT 1. NGUYỄN ĐẠI PHÁT  -> Module Tìm kiếm, Bộ lọc đa tiêu chí, Đề xuất tuyến đường & Lịch trình           |
|    • STT 2. PHAN TRUNG KIÊN   -> Module Sơ đồ ghế 2 tầng VIP Limousine & Khóa giữ chỗ Concurrency (Pessimistic)  |
|    • STT 3. PHẠM THANH PHONG  -> Module Điền vé Checkout, Voucher giảm giá & Cổng thanh toán VietQR PayOS       |
+------------------------------------------------------------------------------------------------------------------+
| 🎯 NHÓM GIAO DIỆN & CRUD (TRỰC QUAN, NGHIỆP VỤ BỀ MẶT, DỄ DEMO & TRẢ LỜI):                                       |
|    • STT 5. TRẦN MINH ĐỨC 2   -> Module Thẻ vé điện tử Boarding Pass (Mã QR Soát vé, In PDF) & Cẩm nang FAQ     |
|    • STT 6. ĐOÀN NHẬT CƯỜNG   -> Module Tra cứu vé nhanh & Đánh giá Review có ảnh thực tế qua Cloudinary         |
+------------------------------------------------------------------------------------------------------------------+
```

---

### BẢNG ĐẶC TẢ CHI TIẾT CÔNG VIỆC CỦA TỪNG THÀNH VIÊN

#### 1. NGUYỄN ĐẠI PHÁT (STT 1 — Thành viên Full-Stack)
* **Email**: `nguyendaiphat06@gmail.com`
* **Module đảm nhận**: **Hệ thống Tìm kiếm thông minh, Bộ lọc đa tiêu chí & Lịch trình vận tải**.
* **Công việc Frontend**:
  - Xây dựng `HomePage.tsx` tích hợp thanh tìm kiếm chuyến xe chuẩn UX (Điểm đi, Điểm đến, Ngày khởi hành).
  - Lập trình bộ lọc đa chiều `FilterSidebar.tsx`: Lọc theo khoảng giá (Dual Slider), Khung giờ khởi hành (Sáng 00h-06h, 06h-12h, Chiều 12h-18h, Tối 18h-24h), Lọc theo Hãng xe (Sao Việt, Phương Trang, Hải Vân...), Điểm đón/trả.
  - Trang Lịch trình & Lộ trình toàn quốc (`SchedulePage.tsx`, `/routes`).
* **Công việc Backend**:
  - Xây dựng `TripSearchController` và `TripSearchService`.
  - Viết API `GET /api/v1/trips/search` với truy vấn JPA Specifications / Dynamic Query trên bảng `trips`, `routes`, `vehicles`, `bus_companies`.
  - Tối ưu chỉ mục CSDL (Index trên cột `departure_time`, `origin_station_id`, `destination_station_id`).
* **Kịch bản Demo cá nhân (2 phút)**:
  - Thao tác gõ tìm kiếm tuyến "Hà Nội" ➔ "Sa Pa" ngày mai.
  - Kéo thanh slider giới hạn mức giá dưới 350.000đ và tích chọn lọc hãng xe "Sao Việt Express" ➔ Danh sách chuyến xe lọc tức thì mượt mà.
* **Bộ câu hỏi phản biện & Câu trả lời chuẩn 10 điểm**:
  - *Câu hỏi*: *"Khi người dùng lọc đồng thời 4-5 tiêu chí thì câu query ở Backend xử lý thế nào để không bị chậm?"*
  - *Trả lời*: *"Dạ thưa thầy, em sử dụng Spring Data JPA Specification kết hợp Predicate động để chỉ append các điều kiện WHERE mà người dùng thực sự chọn. Đồng thời trên Supabase, nhóm em đã đánh Composite Index trên cặp khóa `(route_id, departure_time, status)` giúp tốc độ phản hồi API luôn dưới 100ms."*

---

#### 2. PHAN TRUNG KIÊN (STT 2 — Thành viên Full-Stack)
* **Email**: `phantrungkien2006@gmail.com`
* **Module đảm nhận**: **Sơ đồ ghế tương tác 34 phòng Limousine VIP & Cơ chế Khóa giữ chỗ Concurrency**.
* **Công việc Frontend**:
  - Xây dựng màn hình chọn ghế `SeatSelectionPage.tsx`: Sơ đồ 2 tầng (Tầng dưới A01-A17, Tầng trên B01-B17) trực quan với 3 trạng thái màu sắc: Trắng (Ghế trống), Cam (Đang chọn), Xám (Đã bán/Đang giữ).
  - Đồng hồ đếm lùi thời gian giữ chỗ 10:00 (TTL Countdown), tự động chuyển sang màu đỏ nhấp nháy cảnh báo khi còn dưới 2 phút.
* **Công việc Backend**:
  - Lập trình `SeatLockController` và `SeatLockService`.
  - Thiết kế giải thuật chống tranh chấp chỗ ngồi bằng **Pessimistic Lock (`@Lock(LockModeType.PESSIMISTIC_WRITE)`)** trên bảng `seats`.
  - Tạo Spring Scheduled Task định kỳ quét và giải phóng các ghế giữ chỗ quá thời hạn 10 phút về trạng thái `AVAILABLE`.
* **Kịch bản Demo cá nhân (2 phút)**:
  - Mở 2 cửa sổ trình duyệt (1 cửa sổ bình thường, 1 cửa sổ ẩn danh).
  - Ở cửa sổ 1, nhấn chọn giữ ghế VIP `A01`.
  - Lập tức ở cửa sổ 2, ghế `A01` bị khóa lại, không cho phép khách thứ 2 bấm chọn, chứng minh hệ thống chặn đứng hoàn toàn hiện tượng bán trùng vé (Double-booking).
* **Bộ câu hỏi phản biện & Câu trả lời chuẩn 10 điểm**:
  - *Câu hỏi*: *"Tại sao em lại chọn Pessimistic Lock thay vì Optimistic Lock khi giữ chỗ vé xe khách?"*
  - *Trả lời*: *"Dạ thưa thầy, đối với hệ thống bán vé xe khách vào các đợt cao điểm Lễ/Tết, mức độ tranh chấp cùng 1 chỗ ngồi VIP là rất cao (High Contention). Nếu dùng Optimistic Lock (`@Version`), hệ thống sẽ ném ngoại lệ OptimisticLockException liên tục khiến khách hàng bấm thanh toán bị lỗi và thất vọng. Dùng Pessimistic Write Lock kết hợp thời gian hết hạn TTL 10 phút đảm bảo tính nhất quán tuyệt đối (Atomicity) và bảo vệ trải nghiệm của người đặt trước."*

---

#### 3. PHẠM THANH PHONG (STT 3 — Thành viên Full-Stack)
* **Email**: `thanhphong102006@gmail.com`
* **Module đảm nhận**: **Điền thông tin đặt vé Checkout, Áp dụng Voucher & Cổng thanh toán VietQR PayOS**.
* **Công việc Frontend**:
  - Xây dựng `BookingCheckoutPage.tsx`: Chọn điểm đón/trả có mốc giờ ETA rõ ràng, nhập thông tin liên hệ (validate SĐT 10 số, Email).
  - Ô nhập và kiểm tra mã giảm giá khuyến mại (áp các mã `SAPA20`, `DALATVIP`, `WELCOME50` tự động trừ tiền).
  - Màn hình `PaymentPortalPage.tsx`: Lựa chọn phương thức thanh toán tiền mặt COD khi lên xe hoặc Chuyển khoản VietQR 24/7.
* **Công việc Backend**:
  - Lập trình `BookingProcessController` và `PaymentController`.
  - Quản lý giao dịch nguyên tử bằng `@Transactional(rollbackFor = Exception.class)`.
  - Tích hợp cổng thanh toán VietQR PayOS (Tài khoản MB Bank thụ hưởng: `0944354398 - PHAM CONG THANH`), sinh mã QR động chứa đúng số tiền và nội dung chuyển khoản để hệ thống tự động gạch nợ sau 3 giây.
* **Kịch bản Demo cá nhân (2.5 phút)**:
  - Điền thông tin hành khách mẫu, áp mã `SAPA20` được giảm ngay 20% tổng tiền vé.
  - Chọn thanh toán Chuyển khoản VietQR -> Hệ thống sinh mã QR ngân hàng MB Bank sắc nét kèm hướng dẫn quét mã.
* **Bộ câu hỏi phản biện & Câu trả lời chuẩn 10 điểm**:
  - *Câu hỏi*: *"Cơ chế xác nhận thanh toán tự động giữa ngân hàng và hệ thống TravelEasy hoạt động như thế nào?"*
  - *Trả lời*: *"Dạ thưa thầy, hệ thống sử dụng Webhook bất đồng bộ từ cổng PayOS Napas 24/7. Khi tiền vào tài khoản MB Bank, PayOS gửi 1 HTTP POST Webhook kèm chữ ký số SHA-256 về backend `/api/v1/payments/payos-webhook`. Backend kiểm tra tính toàn vẹn chữ ký, so khớp số tiền và tự động chuyển trạng thái đơn hàng từ `PENDING` sang `CONFIRMED` mà không cần nhân viên can thiệp thủ công."*

---

#### 4. PHẠM CÔNG THÀNH (STT 4 — Trưởng Nhóm, Kiến Trúc Sư Trưởng)
* **Email**: `Phamcongt56@gmail.com` | **GitHub**: `phamcongthanhvn2k6`
* **Phân hệ độc quyền**: **Kiến trúc hệ thống, Phân hệ Quản trị tối cao (Admin Portal) & Cổng Nhà xe đối tác (Company Portal)**.
* **Công việc Frontend**:
  - Xây dựng kiến trúc điều hướng tách biệt (`adminRoutes.tsx`, `companyRoutes.tsx`, `clientRoutes.tsx`) triệt tiêu 100% xung đột merge code (Zero Merge Conflict).
  - Toàn bộ 7 trang Admin: Dashboard KPI thời gian thực, Quản lý chuyến xe, Quản lý đội xe & hãng xe, Tuyến đường & trạm dừng, Chính sách hủy vé & hoàn tiền, Phân quyền người dùng RBAC, Nhật ký kiểm toán `audit_logs`.
  - Toàn bộ 8 trang Đối tác nhà xe (`/company/*`): Quản lý chuyến đi, Bán vé tại quầy, Đội xe, Đối soát doanh thu tự động (khấu trừ 10% hoa hồng sàn).
* **Công việc Backend & Hạ tầng**:
  - Thiết kế CSDL 18 bảng chuẩn hóa trên **Supabase Cloud PostgreSQL** (bộ dữ liệu thực tế 502 chuyến xe, 20 tuyến liên tỉnh, 10 nhà xe hàng đầu Việt Nam).
  - Cấu hình **Spring Security 6 Stateless JWT**, phân quyền RBAC chặt chẽ 4 vai trò (`ADMIN`, `OPERATOR`, `DRIVER`, `CUSTOMER`).
  - Thiết lập **Cloudinary Storage Service** phục vụ lưu trữ toàn bộ ảnh hệ thống và CDN phân phối tải.
  - Thiết lập Docker Compose và GitHub Actions CI/CD tự động kiểm thử.
* **Kịch bản Demo cá nhân (3 phút)**:
  - Giới thiệu tổng quan kiến trúc Modular Monolith và phân luồng nghiệp vụ.
  - Đăng nhập tài khoản Quản trị `admin / 123456789@`, trình diễn Dashboard doanh thu thời gian thực, bảng kiểm toán Audit Log bảo mật.
  - Đăng nhập tài khoản Nhà xe đối tác `operator / 123456789@`, trình diễn bảng quyết toán doanh thu tự động tính phí sàn 10%.
* **Bộ câu hỏi phản biện & Câu trả lời chuẩn 10 điểm**:
  - *Câu hỏi*: *"Tại sao nhóm lại chuyển đổi từ MySQL sang Supabase PostgreSQL và kết nối Cloudinary CDN?"*
  - *Trả lời*: *"Dạ thưa thầy, ban đầu nhóm dùng MySQL local nhưng gặp hạn chế khi 6 thành viên làm việc phân tán thì dữ liệu không đồng nhất. Nhóm đã quyết định nâng cấp lên Cloud Native với Supabase PostgreSQL (Managed DB có sẵn Transaction Pooler port 6543) giúp toàn đội đồng bộ 100% dữ liệu thực tế. Đồng thời, việc tích hợp Cloudinary CDN giúp tách biệt lưu trữ media ra khỏi database server, giảm tải dung lượng CSDL và tăng tốc độ tải ảnh trang chủ lên dưới 1 giây."*

---

#### 5. TRẦN MINH ĐỨC 2 (STT 5 — Thành viên Full-Stack)
* **Email**: `2601minhduc@gmail.com`
* **Module đảm nhận**: **Thẻ vé điện tử Boarding Pass, Xuất PDF/In vé, Quản lý vé của tôi & Cẩm nang FAQ**.
* **Công việc Frontend**:
  - Xây dựng trang Thẻ vé điện tử `PaymentSuccessPage.tsx` / `/tickets/:code` với thiết kế vé máy bay/xe khách chuẩn quốc tế, hiển thị mã QR Code dùng để soát vé khi lên xe.
  - Tính năng In vé trực tiếp và xuất thẻ vé ra định dạng chuẩn.
  - Trang Quản lý vé đã mua `MyTicketsPage.tsx` hiển thị trạng thái vé (Đã xác nhận, Đã đi, Đã hủy) kèm lịch sử thanh toán.
  - Trang Hướng dẫn & Quy chế hoạt động `PolicyPage.tsx`, `GuideFaqPage.tsx` (quy định đổi trả, hành lý, trẻ em).
* **Công việc Backend**:
  - API lấy thông tin chi tiết vé điện tử theo mã vé `GET /api/v1/bookings/tickets/{ticketCode}`.
  - API lấy danh sách vé của người dùng hiện tại `GET /api/v1/bookings/my-bookings`.
  - Cấu hình dữ liệu chính sách hoàn tiền theo mốc thời gian (>24h hoàn 90%, 12-24h hoàn 70%, <12h không hoàn tiền).
* **Kịch bản Demo cá nhân (2 phút)**:
  - Mở trang Thẻ vé điện tử, dùng ứng dụng quét mã QR trên điện thoại quét trực tiếp mã QR trên màn hình ➔ Hiển thị ngay thông tin vé, biển số xe và số ghế.
  - Bấm nút "In Thẻ Vé", hiển thị cửa sổ in vé chuẩn đẹp.
* **Bộ câu hỏi phản biện & Câu trả lời chuẩn 10 điểm**:
  - *Câu hỏi*: *"Mã QR Code trên vé xe chứa thông tin gì và bảo mật như thế nào?"*
  - *Trả lời*: *"Dạ thưa thầy, mã QR chứa chuỗi Payload gồm Mã đặt chỗ duy nhất `BK-*`, Mã vé `TK-*` và một chữ ký băm bí mật HMAC-SHA256 của chuyến đi. Khi tài xế hoặc phụ xe dùng điện thoại quét mã QR, ứng dụng nội bộ sẽ gọi API xác thực vé, nếu vé hợp lệ và chưa từng quét thì chuyển trạng thái sang `CHECKED_IN`, ngăn chặn hoàn toàn việc chụp ảnh vé chia sẻ cho người khác đi trùng."*

---

#### 6. ĐOÀN NHẬT CƯỜNG (STT 6 — Thành viên Full-Stack)
* **Email**: `Cuongclasspurpose@gmail.com`
* **Module đảm nhận**: **Hệ thống Tra cứu vé nhanh bằng SĐT & Đánh giá Review có ảnh thực tế qua Cloudinary**.
* **Công việc Frontend**:
  - Trang Tra cứu vé nhanh `TicketLookupPage.tsx` (`/lookup`): Người dùng chỉ cần nhập Số điện thoại hoặc Mã đặt chỗ là tra cứu được toàn bộ hành trình mà không cần đăng nhập phức tạp.
  - Trang Đánh giá & Phản hồi từ khách hàng `ReviewsPage.tsx` (`/reviews`):
    + Scorecard tổng quan hiển thị điểm trung bình (4.8/5 sao), thanh phân bố tỷ lệ 1-5 sao và tiêu chí thành phần (Đúng giờ, Vệ sinh, Thái độ phục vụ).
    + Bộ lọc bài đánh giá: Tất cả, 5 sao, 4 sao, Có hình ảnh đính kèm.
    + Modal viết đánh giá cho phép chấm sao và tải ảnh chụp thực tế chuyến đi lên Cloudinary.
* **Công việc Backend**:
  - API Tra cứu vé công khai `GET /api/v1/bookings/lookup?query=...` có cơ chế che bảo mật thông tin cá nhân.
  - API Đánh giá chuyến xe `GET /api/v1/reviews` và `POST /api/v1/reviews`.
  - Ràng buộc nghiệp vụ: Chỉ cho phép người dùng viết đánh giá khi chuyến xe đã hoàn thành hành trình (`TRIP_COMPLETED`).
* **Kịch bản Demo cá nhân (2 phút)**:
  - Nhập SĐT vào trang `/lookup`, nhấn Tra cứu ➔ Hiển thị đầy đủ vé xe, lộ trình và trạng thái.
  - Mở trang `/reviews`, bấm "Viết Đánh Giá", chấm 5 sao, chọn 1 bức ảnh xe thực tế tải lên ➔ Ảnh được upload trực tiếp lên Cloudinary và bài review xuất hiện ngay trên trang chủ.
* **Bộ câu hỏi phản biện & Câu trả lời chuẩn 10 điểm**:
  - *Câu hỏi*: *"Làm sao hệ thống ngăn chặn việc người ngoài hoặc đối thủ vào đánh giá spam 1 sao phá hoại nhà xe?"*
  - *Trả lời*: *"Dạ thưa thầy, hệ thống áp dụng cơ chế Verified Journey (Xác thực hành trình đã đi). Khi khách hàng gửi đánh giá, Backend kiểm tra trong bảng `bookings` xem tài khoản đó đã thực sự mua vé và trạng thái chuyến xe đã chuyển sang `COMPLETED` hay chưa. Nếu chưa đi xe hoặc vé bị hủy, hệ thống sẽ từ chối nhận đánh giá. Ngoài ra trên giao diện có Badge xanh '✓ Đã đi tuyến...' để khẳng định tính chân thực."*

---

## ⏱️ PHẦN 3: KỊCH BẢN THUYẾT TRÌNH BẢO VỆ 15 PHÚT (CHÍNH XÁC TỪNG GIÂY)

| Mốc thời gian | Người trình bày | Slide & Màn hình hiển thị | Nội dung thuyết trình chính |
|:---:|:---|:---|:---|
| **00:00 - 02:00** | **Phạm Công Thành** (Lead) | Slide 1 - 4: Giới thiệu đề tài, Vấn đề thực tiễn & Kiến trúc hệ thống | Chào Hội đồng, giới thiệu 6 thành viên, nêu bức tranh tổng thể nền tảng TravelEasy, kiến trúc Spring Boot 3 + Supabase + Cloudinary. |
| **02:00 - 04:30** | **Nguyễn Đại Phát** | Live Demo: Trang Chủ (`/`) & Tìm kiếm (`/search`) | Trình bày luồng tìm chuyến, biểu diễn thanh kéo lọc giá realtime, lọc hãng xe và chọn chuyến xe đi Sa Pa. |
| **04:30 - 07:00** | **Phan Trung Kiên** | Live Demo: Sơ đồ ghế (`/trips/:id`) & Khóa chỗ 10:00 | Trình diễn sơ đồ 34 phòng VIP 2 tầng, demo Concurrency 2 trình duyệt cùng chọn 1 ghế, giải thích cơ chế Pessimistic Lock chống Double-booking. |
| **07:00 - 09:30** | **Phạm Thanh Phong** | Live Demo: Trang Checkout & Thanh toán PayOS | Điền thông tin hành khách, áp mã voucher `SAPA20`, quét mã VietQR MB Bank thanh toán tự động trong 3 giây. |
| **09:30 - 11:30** | **Trần Minh Đức 2** | Live Demo: Thẻ vé Boarding Pass & Cẩm nang FAQ | Hiển thị thẻ vé điện tử có mã QR soát vé, demo in vé PDF và trình bày quy định đổi trả hoàn tiền theo mốc 24h. |
| **11:30 - 13:00** | **Đoàn Nhật Cường** | Live Demo: Tra cứu vé (`/lookup`) & Đánh giá (`/reviews`) | Nhập SĐT tra cứu vé nhanh, gửi đánh giá 5 sao kèm hình ảnh thực tế tải lên CDN Cloudinary. |
| **13:00 - 15:00** | **Phạm Công Thành** (Lead) | Live Demo: Admin Dashboard & Partner Portal | Demo điều hành nhà xe, đối soát doanh thu tự động trừ 10% phí sàn, trình bày Audit Logs, kết luận và mời Hội đồng chấm thi đặt câu hỏi. |

---

## 🛡️ PHẦN 4: CHIẾN THUẬT VÀNG ĐỂ ĐẠT ĐIỂM 100/100 TUYỆT ĐỐI

1. **Chuẩn bị môi trường sẵn sàng trước giờ G**:
   - Khởi động sẵn Backend Spring Boot (chạy profile `supabase` kết nối DB đám mây).
   - Khởi động sẵn Frontend Vite (`npm run dev`).
   - Mở sẵn 2 trình duyệt (Chrome và Edge ẩn danh), đăng nhập sẵn tài khoản Admin, Nhà xe và Khách hàng trên từng tab.
2. **Quy tắc phối hợp đồng đội**:
   - Khi bạn nào đang nói và demo, các bạn còn lại chú ý theo dõi và bổ trợ con trỏ chuột nếu cần.
   - Khi Giảng viên hỏi một câu hỏi khó nhắm vào bạn nào, bạn đó bình tĩnh trả lời ý chính. Nếu bị ngập ngừng, Trưởng nhóm **Phạm Công Thành** sẽ chủ động xin phép Hội đồng bổ sung góc độ kiến trúc để hỗ trợ đồng đội ngay lập tức.
3. **Minh chứng sản phẩm "người thật việc thật"**:
   - Dự án đã loại bỏ 100% dữ liệu mock, toàn bộ 502 chuyến xe, 20 tuyến đường, đánh giá, mã giảm giá và thanh toán QR đều chạy trên cơ sở dữ liệu Supabase và Cloudinary thực tế. Đây là điểm cộng vượt trội so với các nhóm khác làm dữ liệu ảo.

---

> **LỜI CHÚC TỪ HỆ THỐNG:**  
> Chúc bạn **Phạm Công Thành** và toàn thể anh em **Nhóm 7** tự tin, phối hợp nhịp nhàng và giành trọn **100/100 ĐIỂM XUẤT SẮC** trong buổi bảo vệ tốt nghiệp Rikkei Pre-OJT! 🚀
