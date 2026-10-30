# 🎓 TÀI LIỆU THIẾT KẾ CÔNG VIỆC & KỊCH BẢN BẢO VỆ ĐỒ ÁN TỐT NGHIỆP PRE-OJT (100/100 ĐIỂM)
## DỰ ÁN: TRAVELEASY PLATFORM — HỆ THỐNG QUẢN LÝ NHÀ XE & ĐẶT VÉ XE KHÁCH LIÊN TỈNH TRỰC TUYẾN
### ĐƠN VỊ: RIKKEI ACADEMY | NHÓM 7 (SĨ SỐ: 6 THÀNH VIÊN)
### TRƯỞNG NHÓM (TEAM LEADER & SYSTEM ARCHITECT): PHẠM CÔNG THÀNH

---

## 📌 PHẦN 1: THÔNG TIN TỔNG QUAN & MỤC TIÊU ĐỒ ÁN

* **Tên đề tài**: TravelEasy Platform — Sàn Thương Mại Điện Tử Đặt Vé Xe Khách & Điều Hành Vận Tải Liên Tỉnh (Mô hình chuẩn Vexere Enterprise).
* **Mã đồ án**: `PRJ-TRAVELEASY-MVP-01`
* **Công nghệ cốt lõi**:
  - **Backend**: Spring Boot 3.3.4, Java 21 LTS, Spring Security 6 (Stateless JWT Bearer), Spring Data JPA, Hibernate ORM, Spring Cache.
  - **Frontend**: React 18.3, TypeScript 5.6, Vite 5.4, Tailwind CSS, Lucide React Icons, SWR In-Memory Client Cache, HTML5 QR Scanner.
  - **Cơ sở dữ liệu**: Supabase Cloud PostgreSQL (Transaction Pooler port 6543, 36 bảng chuẩn hóa Domain-Driven Design).
  - **Lưu trữ đa phương tiện**: Cloudinary CDN (Quản lý tự động kho ảnh Banner, Logo hãng xe, Điểm đến và Ảnh review).
  - **Thanh toán trực tuyến**: VNPay QR Code, Ví điện tử MoMo, VietQR Napas 24/7 và Tiền mặt COD khi lên xe.
  - **DevOps & QA**: Docker, Docker Compose, GitHub Actions CI/CD Pipeline, JUnit 5 + Mockito (25/25 Test Cases Pass 100%).
* **Mục tiêu điểm số**: **100/100 ĐIỂM TUYỆT ĐỐI** (60 Điểm Functional + 40 Điểm Non-Functional & Phản biện).

---

## 👥 PHẦN 2: CƠ CẤU NHÂN SỰ & BẢNG PHÂN CÔNG CÔNG VIỆC CHUẨN OJT

Dự án áp dụng kiến trúc **Three-Portal Architecture (3 Phân Hệ Doanh Nghiệp - 34 Trang)** kết hợp ma trận trách nhiệm **RACI V4** phân hóa theo đúng năng lực thực tế và tình hình OJT:

```
+------------------------------------------------------------------------------------------------------------------+
|                                    MA TRẬN PHÂN CHIA TRÁCH NHIỆM (RACI V4 CHUẨN OJT)                              |
+------------------------------------------------------------------------------------------------------------------+
| 👑 PHẠM CÔNG THÀNH (TRƯỞNG NHÓM & KIẾN TRÚC SƯ TRƯỞNG):                                                          |
|    - Toàn quyền phụ trách: CỔNG ĐỐI TÁC NHÀ XE (COMPANY PORTAL — 9 TRANG: /company/*)                            |
|    - Kiến trúc tổng thể hệ thống, Bảo mật Spring Security JWT, CSDL 36 bảng Supabase Cloud, Docker & CI/CD       |
+------------------------------------------------------------------------------------------------------------------+
| 🛡️ NGUYỄN ĐẠI PHÁT (FULL-STACK DEVELOPER PHỤ TRÁCH ADMIN):                                                       |
|    - Toàn quyền phụ trách: CỔNG QUẢN TRỊ SÀN TỔNG (ADMIN PORTAL — 14 TRANG: /admin/*)                            |
|    - Dashboard sàn 4 KPIs, Giám sát 480 chuyến xe, Quản trị Người dùng RBAC, Duyệt Hãng, Tuyến & Audit Logs      |
+------------------------------------------------------------------------------------------------------------------+
| 🌐 NHÓM PHỤ TRÁCH TÍNH NĂNG USERS / PUBLIC PORTAL (11 TRANG):                                                    |
|    • PHẠM THANH PHONG  -> Tìm kiếm siêu tốc, Sơ đồ ghế 2 tầng VIP & Concurrency Pessimistic Lock 10:00           |
|    • TRẦN MINH ĐỨC 2   -> Điểm đón/trả, Đặt vé Checkout, Cổng thanh toán đa kênh & Quản lý vé cá nhân/Hủy vé    |
|    • ĐOÀN NHẬT CƯỜNG   -> Trang chủ, Lịch trình, Tra cứu vé Offline, Quét mã QR Camera (/scanner) & Đánh giá    |
+------------------------------------------------------------------------------------------------------------------+
| 🎓 PHAN TRUNG KIÊN (SINH VIÊN):                                                                                  |
|    • MIỄN THỰC TẬP OJT (EXEMPTED) theo quy định đào tạo. Không nhận phân công task trong dự án.                  |
+------------------------------------------------------------------------------------------------------------------+
```

---

### BẢNG ĐẶC TẢ CHI TIẾT CÔNG VIỆC CỦA TỪNG THÀNH VIÊN

#### 1. PHẠM CÔNG THÀNH (Trưởng Nhóm & Kiến Trúc Sư Trưởng)
* **Email**: `Phamcongt56@gmail.com` | **GitHub**: `phamcongthanhvn2k6`
* **Phân hệ đảm nhận**: **Cổng Đối Tác Nhà Xe (Company Portal — 9 Trang) & Kiến Trúc Hệ Thống Toàn Sàn**.
* **Công việc Frontend**:
  - Xây dựng Router điều phối độc lập `companyRoutes.tsx` và giao diện Sidebar điều hành nhà xe riêng biệt.
  - Toàn bộ 9 trang nhà xe:
    1. `/company/login`: Đăng nhập đối tác hãng xe (`operator@futa.vn`, `dieuhanh@thanhbuoi.com.vn`...).
    2. `/company/dashboard`: Dashboard đối tác (Doanh thu riêng hãng, số khách phục vụ, tỷ lệ lấp đầy ghế).
    3. `/company/trips`: Quản lý lịch chạy, mở bán chuyến xe mới, điều chỉnh giá vé dịp Lễ/Tết.
    4. `/company/bookings`: Danh sách hành khách đi xe theo thời gian thực (ghế, điểm đón, điểm trả, trạng thái check-in).
    5. `/company/vehicles`: Quản lý đội xe (Limousine 34 phòng, xe giường nằm, biển số xe, tình trạng bảo dưỡng).
    6. `/company/locations`: Cấu hình trạm dừng, văn phòng, điểm đón/trả riêng của hãng.
    7. `/company/routes`: Danh mục tuyến đường hãng xe được cấp phép khai thác.
    8. `/company/settlements`: Đối soát doanh thu bán vé, khấu trừ 10% phí hoa hồng sàn TravelEasy.
    9. `/company/reviews`: Chăm sóc khách hàng, đọc và gửi phản hồi giải đáp đánh giá của hành khách.
* **Công việc Backend & Hạ tầng**:
  - Thiết kế và quản trị CSDL 36 bảng chuẩn hóa trên **Supabase Cloud PostgreSQL** (480 chuyến xe, 25 tuyến, 10 nhà xe lớn).
  - Cấu hình **Spring Security 6 Stateless JWT Bearer**, phân quyền RBAC 3 vai trò (`ADMIN`, `OPERATOR`, `CUSTOMER`).
  - Container hóa Docker Compose và thiết lập CI/CD GitHub Actions Pipeline.
* **Kịch bản Demo cá nhân (3 phút)**:
  - Chào Hội đồng, giới thiệu kiến trúc Modular Monolith + Clean Architecture, CSDL 36 bảng trên Supabase Cloud.
  - Đăng nhập tài khoản nhà xe Phương Trang (`operator@futa.vn`), xem Dashboard thống kê doanh thu, mở bán chuyến xe mới và biểu diễn tính năng quyết toán doanh thu tự động khấu trừ 10% phí hoa hồng sàn.
* **Bộ câu hỏi phản biện & Câu trả lời chuẩn 10 điểm**:
  - *Câu hỏi*: *"Cơ chế bảo mật và phân quyền giữa Admin tổng và Đối tác nhà xe được thiết kế thế nào để tránh lộ lọt dữ liệu giữa các hãng xe?"*
  - *Trả lời*: *"Dạ thưa thầy, ở tầng Backend em sử dụng Spring Security RBAC kết hợp Tenant Isolation: Mỗi tài khoản `OPERATOR` được gán cố định `company_id`. Toàn bộ các câu query của nhà xe đều bắt buộc lọc qua điều kiện `WHERE company_id = :currentCompanyId`, ngăn chặn hoàn toàn việc nhà xe A nhìn thấy doanh thu hay danh sách khách của nhà xe B. Ngoài ra, giao diện Sidebar của Nhà xe đã ẩn hoàn toàn liên kết sang Admin để bảo vệ ranh giới tài nguyên."*

---

#### 2. NGUYỄN ĐẠI PHÁT (Full-Stack Developer Phụ Trách Admin)
* **Email**: `nguyendaiphat06@gmail.com` | **Tài khoản Admin**: `daiphat.admin@traveleasy.vn`
* **Phân hệ đảm nhận**: **Cổng Quản Trị Sàn Tổng (Admin Portal — 14 Trang)**.
* **Công việc Frontend**:
  - Quản lý Router `adminRoutes.tsx`, thanh điều hướng `AdminNav.tsx` và trang đăng nhập `/admin/login`.
  - Toàn bộ 14 trang quản trị sàn:
    1. `/admin/dashboard`: Dashboard toàn sàn 4 KPIs (Tổng GMV, Tổng vé bán, Số chuyến hoạt động, Top 5 nhà xe xuất sắc).
    2. `/admin/trips`: Quản lý & giám sát 480 chuyến xe toàn quốc, can thiệp khẩn cấp (hủy chuyến, đổi tài xế, trễ giờ).
    3. `/admin/users`: Quản trị người dùng & phân quyền RBAC, khóa/mở khóa tài khoản, tích hợp cơ chế chống xóa Admin tối cao.
    4. `/admin/bus-companies`: Phê duyệt hồ sơ nhà xe mới, kiểm duyệt hợp đồng, quản lý hotline và logo Cloudinary.
    5. `/admin/routes`: Quản lý 25+ tuyến đường trọng điểm, cự ly km, thời gian chạy dự kiến.
    6. `/admin/bookings`: Tra cứu toàn bộ giao dịch đặt vé trên sàn, kiểm tra mã đơn, lịch sử thanh toán.
    7. `/admin/settlements`: Kiểm soát dòng tiền sàn, tạo kỳ quyết toán chi trả cho các nhà xe đối tác.
    8. `/admin/locations`: Dữ liệu gốc (Master Data) các bến xe lớn toàn quốc (Bến xe Miền Đông, Bến xe Mỹ Đình...).
    9. `/admin/seat-types`: Cấu hình hạng ghế (`STANDARD`, `VIP`, `LIMOUSINE`) và đơn giá phụ thu.
    10. `/admin/seat-templates`: Quản lý mẫu sơ đồ xe 34 chỗ, xe Limousine 22 phòng.
    11. `/admin/gateways`: Cấu hình bật/tắt các cổng thanh toán VNPay, MoMo, VietQR, COD.
    12. `/admin/banners`: Quản lý banner hình ảnh Cloudinary trang chủ, liên kết khuyến mại.
    13. `/admin/reviews`: Kiểm duyệt đánh giá khách hàng, ẩn bình luận độc hại.
    14. `/admin/audit-logs`: Vết kiểm toán bất biến (Append-only Audit Trail) ghi lại mọi hành vi thêm/sửa/xóa.
* **Công việc Backend**:
  - Xây dựng `AdminManagementController`, `AdminTripController`, `AdminUserController`, `AdminAuditLogController`.
  - Viết `AdminManagementService` xử lý thống kê doanh thu, duyệt đối tác, phân quyền RBAC và ghi vết kiểm toán.
* **Kịch bản Demo cá nhân (3 phút)**:
  - Đăng nhập `daiphat.admin@traveleasy.vn` vào `/admin/login`.
  - Trình diễn Dashboard 4 KPIs, thao tác giám sát chuyến xe toàn quốc, khóa tài khoản vi phạm, minh chứng cơ chế chống xóa Admin tối cao và mở bảng Audit Logs chứng minh mọi thay đổi đều được ghi vết bảo mật.
* **Bộ câu hỏi phản biện & Câu trả lời chuẩn 10 điểm**:
  - *Câu hỏi*: *"Bảng Audit Logs của hệ thống có đặc điểm gì đặc biệt để đảm bảo tính toàn vẹn và không bị giả mạo?"*
  - *Trả lời*: *"Dạ thưa thầy, bảng `audit_logs` được thiết kế theo nguyên tắc Append-Only (chỉ cho phép INSERT, tuyệt đối không có API UPDATE hay DELETE). Mỗi bản ghi tự động lưu trữ ID người thực hiện, vai trò, địa chỉ IP, hành động (`CREATE`, `UPDATE`, `DELETE`), mốc thời gian ISO và snapshot trạng thái dữ liệu trước/sau dạng JSONB, giúp Ban Giám Đốc truy cứu trách nhiệm chính xác 100% khi có sự cố vận hành."*

---

#### 3. PHẠM THANH PHONG (Full-Stack Developer — Users Slice 1)
* **Email**: `thanhphong102006@gmail.com`
* **Phân hệ đảm nhận**: **Tìm Kiếm Siêu Tốc, Sơ Đồ Ghế 2 Tầng VIP Limousine & Khóa Giữ Chỗ Concurrency 10:00**.
* **Công việc Frontend**:
  - Xây dựng giao diện Tìm kiếm chuyến xe `/search` kết hợp bộ lọc thông minh đa chiều (Khoảng giá, Giờ xuất bến, Hãng xe, Điểm đón, Đánh giá ⭐).
  - Tích hợp cơ chế **SWR In-Memory Client Cache** giúp lật bộ lọc và tải lại kết quả trong 0ms.
  - Sơ đồ tương tác 34 giường nằm Limousine VIP 2 tầng (`BusSeatMap.tsx`, `SeatSelectionPage.tsx`): Tầng 1 (A01-A17), Tầng 2 (B01-B17) với 3 mã màu: Trống (xanh), Đang chọn (cam), Đã bán (xám).
  - Đồng hồ đếm lùi giữ chỗ 10:00 (TTL Countdown), tự động chuyển sang màu đỏ nhấp nháy cảnh báo khi còn dưới 2 phút.
* **Công việc Backend**:
  - Lập trình `TripSearchController`, `SeatCatalogController` và `SeatLockController`.
  - Tối ưu truy vấn bằng Spring Cache (`@EnableCaching`, `@Cacheable(value = "trips_search")`) và giải quyết triệt để lỗi N+1 Query bằng truy vấn gộp điểm đón/trả theo lô (`findByRouteIdInOrderByDisplayOrderAsc`).
  - Thiết kế giải thuật chống tranh chấp chỗ ngồi bằng **Pessimistic Lock (`@Lock(LockModeType.PESSIMISTIC_WRITE)`)** trên bảng `seats`.
  - Cơ chế kiểm tra và giải phóng ghế tự động sau 10 phút về trạng thái `AVAILABLE`.
* **Kịch bản Demo cá nhân (3 phút)**:
  - Thao tác tìm kiếm tuyến TP.HCM ➔ Đà Lạt trên `/search`, kéo thanh trượt lọc giá và bấm chọn chuyến xe.
  - Bung sơ đồ 34 phòng VIP 2 tầng, chọn ghế A03, A04.
  - **Demo Concurrency Lock đỉnh cao**: Mở 2 tab trình duyệt song song giả lập 2 khách cùng click chọn 1 ghế A05 tại cùng 1 giây ➔ Chứng minh chỉ duy nhất 1 khách giữ được ghế, tab còn lại báo lỗi ghế đã được giữ, đồng hồ 10:00 đếm ngược an toàn.
* **Bộ câu hỏi phản biện & Câu trả lời chuẩn 10 điểm**:
  - *Câu hỏi*: *"Tại sao em lại chọn Pessimistic Lock thay vì Optimistic Lock khi giữ chỗ vé xe khách dịp Lễ/Tết?"*
  - *Trả lời*: *"Dạ thưa thầy, vào các dịp cao điểm, mức độ tranh chấp cùng 1 chỗ nằm VIP tầng 1 là cực kỳ cao. Nếu dùng Optimistic Lock (`@Version`), hệ thống sẽ ném ngoại lệ OptimisticLockException liên tục khiến khách hàng bấm thanh toán bị lỗi và thất vọng. Dùng Pessimistic Write Lock (`SELECT ... FOR UPDATE`) kết hợp TTL 10 phút đảm bảo tính nhất quán tuyệt đối (Atomicity) và bảo vệ trải nghiệm của người đặt trước."*

---

#### 4. TRẦN MINH ĐỨC 2 (Full-Stack Developer — Users Slice 2)
* **Email**: `2601minhduc@gmail.com`
* **Phân hệ đảm nhận**: **Xác Nhận Đặt Vé Checkout, Cổng Thanh Toán Đa Kênh & Quản Lý Vé Cá Nhân/Hủy Vé**.
* **Công việc Frontend**:
  - Xây dựng màn hình Xác nhận đặt vé `/checkout` (`BookingCheckoutPage.tsx`): Chọn trạm đón/trả kèm mốc giờ ETA dự kiến, nhập thông tin hành khách (validate SĐT 10 số, email), áp dụng voucher mã giảm giá (`SAPA20`, `WELCOME50`...).
  - Màn hình Cổng thanh toán an toàn: Chọn phương thức VNPay QR, Ví MoMo, VietQR chuyển khoản hoặc Tiền mặt COD khi lên xe.
  - Xây dựng trang Quản lý vé của tôi `/my-tickets` (`MyBookingsPage.tsx`): Xem lịch sử vé đã mua, xem trạng thái vé (`ISSUED`, `USED`, `CANCELLED`), thực hiện Hủy vé trực tuyến kèm popup xác nhận hoàn tiền.
* **Công việc Backend**:
  - Lập trình `BookingController`, `PaymentController` và `MyBookingsService`.
  - Quản lý giao dịch nguyên tử bằng `@Transactional(isolation = Isolation.SERIALIZABLE, rollbackFor = Exception.class)`.
  - Thuật toán sinh mã đơn vé duy nhất `BK-YYYYMMDD-XXXX` và mã vé con `TK-*-A01`.
  - Tích hợp API xử lý thanh toán đa kênh và API hủy vé trực tuyến: Tự động tính toán số tiền hoàn dựa trên mốc thời gian trước giờ khởi hành (>24h hoàn 90%, 12-24h hoàn 70%, <12h không hoàn) và giải phóng ghế lập tức.
* **Kịch bản Demo cá nhân (3 phút)**:
  - Điền thông tin đặt vé trên `/checkout`, áp mã voucher giảm giá, chọn thanh toán COD khi lên xe, bấm Xác nhận đặt vé.
  - Chuyển sang `/my-tickets`: Hiển thị vé vừa đặt thành công.
  - Thử nghiệm bấm nút "Yêu cầu hủy vé" ➔ Hệ thống tính toán số tiền hoàn tự động theo chính sách và chuyển trạng thái vé sang `CANCELLED`.
* **Bộ câu hỏi phản biện & Câu trả lời chuẩn 10 điểm**:
  - *Câu hỏi*: *"Giao dịch đặt vé gồm nhiều bước (trừ ghế, tạo đơn, sinh vé con, tính voucher), nếu có 1 bước bị lỗi thì hệ thống xử lý ra sao?"*
  - *Trả lời*: *"Dạ thưa thầy, toàn bộ chuỗi nghiệp vụ được bao trọn trong 1 Transaction duy nhất với cấp độ cô lập `@Transactional(isolation = Isolation.SERIALIZABLE)`. Nếu bất kỳ bước nào thất bại, Spring Boot sẽ kích hoạt Rollback 100% dữ liệu, ghế được hoàn trả về trạng thái cũ, đảm bảo không bao giờ xảy ra tình trạng trừ tiền mà không có vé hoặc sinh đơn rác trong cơ sở dữ liệu."*

---

#### 5. ĐOÀN NHẬT CƯỜNG (Full-Stack Developer — Users Slice 3)
* **Email**: `Cuongclasspurpose@gmail.com`
* **Phân hệ đảm nhận**: **Trang Chủ, Lịch Trình, Tra Cứu Vé Offline, Quét Mã QR Camera (/scanner) & Đánh Giá/FAQ**.
* **Công việc Frontend**:
  - Xây dựng Trang chủ `/` (`HomePage.tsx`), Lịch trình toàn quốc `/schedule`, Cẩm nang & FAQ `/guide`.
  - Trang Tra cứu vé điện tử `/lookup` (`TicketLookupPage.tsx`): Tra cứu theo Mã đơn `BK-*` hoặc SĐT, hiển thị vé điện tử kèm lộ trình di chuyển thời gian thực, **hỗ trợ lưu và hiển thị vé Offline không cần mạng Internet**.
  - 📷 **Trang Quét mã QR vé đa năng `/scanner` (`UniversalQrScannerPage.tsx`)**: Tích hợp trực tiếp camera điện thoại hoặc webcam laptop, hỗ trợ tải ảnh chụp mã QR hoặc nhập mã vé. Hiển thị thông tin vé hợp lệ và nút bấm **"Xác nhận Check-in lên xe"** theo thời gian thực.
  - Trang Đánh giá & Nhận xét `/reviews` (`ReviewsPage.tsx`): Điểm trung bình sao ⭐, biểu đồ phân bố sao, bộ lọc đánh giá và modal gửi review.
  - Tích hợp Chế độ Giao diện tối (Dark Mode Toggle) trên thanh Navbar và Chatbot Trợ lý AI du lịch 24/7.
* **Công việc Backend**:
  - Lập trình `TicketLookupController`, `TicketCheckinController` và `ReviewController`.
  - API tra cứu vé công khai `GET /api/v1/bookings/lookup?query=...` có che bảo mật thông tin cá nhân.
  - API xác thực vé điện tử và cập nhật trạng thái `CHECKED_IN` thời gian thực `POST /api/v1/tickets/checkin`.
  - API đánh giá chuyến xe có ràng buộc Verified Journey (chỉ cho phép khách đã hoàn thành chuyến xe đánh giá).
* **Kịch bản Demo cá nhân (3 phút)**:
  - Tra cứu mã vé `BKG-20261025-001` trên `/lookup`, hiển thị lộ trình di chuyển và bật chế độ Offline chứng minh vé vẫn xem được bình thường.
  - Mở trang `/scanner`: Dùng camera laptop quét trực tiếp mã QR trên vé ➔ Hệ thống xác thực vé hợp lệ trong 0.2s và bấm nút "Xác nhận Check-in lên xe", trạng thái vé lập tức chuyển sang `CHECKED_IN`.
  - Demo nút chuyển Dark Mode trên Navbar và hỏi Trợ lý AI du lịch mẹo chọn giường tầng dưới chống say xe.
* **Bộ câu hỏi phản biện & Câu trả lời chuẩn 10 điểm**:
  - *Câu hỏi*: *"Tính năng Quét mã QR soát vé `/scanner` hoạt động thế nào và ngăn chặn việc chụp ảnh chia sẻ vé giả mạo ra sao?"*
  - *Trả lời*: *"Dạ thưa thầy, mã QR trên mỗi vé điện tử chứa chuỗi mã hóa gồm Mã đơn vé `BK-*`, Mã vé con `TK-*` và chữ ký số. Khi camera quét được mã, frontend gửi request xác thực lên backend `/api/v1/tickets/checkin`. Backend kiểm tra trạng thái vé: Nếu vé ở trạng thái `ISSUED` hoặc `CONFIRMED`, hệ thống cho phép Check-in và lập tức đổi trạng thái sang `CHECKED_IN` trong CSDL. Nếu có người khác cố tình dùng lại ảnh chụp vé đó quét lần 2, hệ thống sẽ báo đỏ 'Vé này đã được Check-in lúc HH:mm' và từ chối lên xe, ngăn chặn tuyệt đối việc đi trùng vé."*

---

#### 6. PHAN TRUNG KIÊN (Sinh Viên)
* **Email**: `phantrungkien2006@gmail.com`
* **Trạng thái**: **MIỄN THỰC TẬP OJT (EXEMPTED FROM OJT)** theo quyết định và quy định đào tạo của nhà trường/doanh nghiệp.
* **Phân công nhiệm vụ**: Không nhận phân công task trong dự án nhằm đảm bảo phản ánh chính xác thực tế đánh giá kết quả thực tập.

---

## ⏱️ PHẦN 3: KỊCH BẢN THUYẾT TRÌNH BẢO VỆ 15 PHÚT (CHÍNH XÁC TỪNG GIÂY)

```
+--------------------------------------------------------------------------------------------------------------------+
| PHÂN BỔ THỜI GIAN DEMO BẢO VỆ (TỔNG CỘNG 15 PHÚT — 5 THÀNH VIÊN THỰC TẬP OJT)                                      |
+--------------------------------------------------------------------------------------------------------------------+
| 00:00 - 03:00 (3 phút) : Phạm Công Thành  - Kiến trúc hệ thống, Supabase DB, Cổng Đối Tác Nhà Xe (/company/*)      |
| 03:00 - 06:00 (3 phút) : Nguyễn Đại Phát  - Cổng Quản Trị Sàn Tổng (/admin/*), Giám sát 480 chuyến xe, RBAC, Logs  |
| 06:00 - 09:00 (3 phút) : Phạm Thanh Phong - Tìm kiếm siêu tốc, Sơ đồ ghế 2 tầng VIP & Concurrency Pessimistic Lock |
| 09:00 - 12:00 (3 phút) : Trần Minh Đức 2  - Đặt vé Checkout, Cổng thanh toán đa kênh VNPay/COD & Quản lý vé/Hủy vé|
| 12:00 - 15:00 (3 phút) : Đoàn Nhật Cường  - Tra cứu vé Offline, Quét mã QR Camera (/scanner), Trợ lý AI & Báo cáo QA|
+--------------------------------------------------------------------------------------------------------------------+
```

### Chi tiết các bước trình diễn thuyết trình:

#### 1. Mốc 00:00 - 03:00: Phạm Công Thành (Trưởng Nhóm / Kiến Trúc Sư Trưởng)
* **Nội dung trình bày**:
  - Chào Hội đồng giám khảo, giới thiệu thành phần nhóm 7 và bài toán chuyển đổi số vận tải hành khách liên tỉnh.
  - Trình chiếu sơ đồ kiến trúc Modular Monolith + Clean Architecture, CSDL 36 bảng chuẩn hóa đồng bộ trên Supabase Cloud Database, bảo mật Stateless JWT và phân quyền RBAC 3 vai trò (`ADMIN`, `OPERATOR`, `CUSTOMER`).
  - **Live Demo Cổng Đối Tác Nhà Xe (`/company/*`)**: Đăng nhập tài khoản hãng xe Phương Trang (`operator@futa.vn`), xem Dashboard thống kê doanh thu bán vé riêng của hãng, mở bán chuyến xe mới, xem danh sách hành khách theo thời gian thực và quản lý đối soát quyết toán tài chính (khấu trừ phí hoa hồng sàn 10%).

#### 2. Mốc 03:00 - 06:00: Nguyễn Đại Phát (Full-Stack Developer Phụ Trách Admin)
* **Nội dung trình bày**:
  - Đăng nhập Cổng Quản trị viên Sàn (`/admin/login` với `daiphat.admin@traveleasy.vn`, mật khẩu: `123456789@`).
  - **Live Demo Dashboard Quản Trị Sàn Tổng**: Trình diễn 4 chỉ số KPI tổng sàn (GMV Doanh thu, Tổng vé bán ra, Số chuyến hoạt động, Top 5 nhà xe xuất sắc).
  - **Quản lý & Giám sát 480 chuyến xe toàn sàn (`/admin/trips`)**: Can thiệp khẩn cấp (hủy chuyến thời tiết xấu, đổi lịch xe, đổi tài xế).
  - **Quản trị Người dùng & RBAC (`/admin/users`)**: Phân quyền tài khoản, khóa/mở khóa tài khoản vi phạm và minh chứng cơ chế bảo vệ chống xóa Admin tối cao (`admin@traveleasy.vn`).
  - **Minh chứng Vết kiểm toán bất biến (`/admin/audit-logs`)**: Hiển thị nhật ký ghi nhận thời gian thực mọi hành vi thêm/sửa/xóa của quản trị viên và nhà xe.

#### 3. Mốc 06:00 - 09:00: Phạm Thanh Phong (Full-Stack Developer Phụ Trách Tìm Kiếm & Sơ Đồ Ghế)
* **Nội dung trình bày**:
  - Thao tác trên Trang tìm kiếm `/search`: Lọc chuyến xe đa chiều (Khoảng giá vé, Khung giờ sáng/tối, Nhà xe Phương Trang/Thành Bưởi, Đánh giá ⭐). Trình diễn tốc độ tải siêu tốc nhờ SWR Cache và Spring Boot Caching.
  - Bấm **"Chọn chuyến"** tại chuyến Limousine VIP 34 chỗ. Sơ đồ ghế 2 tầng bung ra trực quan (Tầng 1 A01-A17, Tầng 2 B01-B17) với 3 mã màu: Ghế trống (xanh), Ghế đang chọn (cam), Ghế đã bán (xám).
  - **Demo Concurrency Lock đỉnh cao**: Mở 2 tab trình duyệt song song giả lập 2 khách hàng cùng click đặt 1 ghế A05 tại cùng 1 giây ➔ Chứng minh thuật toán **Pessimistic Lock (`SELECT ... FOR UPDATE`)** chặn tuyệt đối hiện tượng Double-Booking, chỉ duy nhất 1 khách hàng giữ được ghế và đồng hồ đếm ngược 10:00 (TTL) bắt đầu đếm lùi an toàn.

#### 4. Mốc 09:00 - 12:00: Trần Minh Đức 2 (Full-Stack Developer Phụ Trách Đặt Vé & Thanh Toán)
* **Nội dung trình bày**:
  - Chuyển tiếp sang màn hình Xác nhận đặt vé `/checkout`: Chọn điểm đón kèm mốc giờ ETA dự kiến, điểm trả, nhập thông tin hành khách và áp dụng mã Voucher giảm giá 50.000đ.
  - **Cổng thanh toán đa kênh an toàn**: Lựa chọn phương thức thanh toán linh hoạt (VNPay QR Code động, Ví điện tử MoMo, hoặc Tiền mặt COD khi lên xe) được bảo vệ bằng giao dịch nguyên tử `@Transactional(SERIALIZABLE)`.
  - **Quản lý vé của tôi (`/my-tickets`)**: Đăng nhập tài khoản khách hàng, xem danh sách toàn bộ vé đã mua, trạng thái vé (`ISSUED`, `USED`, `CANCELLED`).
  - **Demo Hủy vé trực tuyến & Hoàn tiền tự động**: Thử nghiệm thao tác bấm nút Hủy vé ➔ Hệ thống tự động tính toán số tiền hoàn dựa trên chính sách giờ chạy (>24h hoàn 90%, 12-24h hoàn 70%) và lập tức giải phóng ghế về trạng thái sẵn sàng mở bán.

#### 5. Mốc 12:00 - 15:00: Đoàn Nhật Cường (Full-Stack Developer Phụ Trách Tra Cứu, QR Scanner & Tổng Kết)
* **Nội dung trình bày**:
  - **Tra cứu vé điện tử Offline & Bản đồ lộ trình (`/lookup`)**: Tra cứu theo mã đặt vé `BKG-20261025-001`, hiển thị thẻ vé sang trọng kèm bản đồ lộ trình di chuyển thời gian thực, hỗ trợ lưu và xem vé Offline không cần mạng.
  - **📷 Trình diễn Quét mã QR soát vé đa năng (`/scanner`)**: Bật camera laptop/điện thoại quét trực tiếp mã QR trên vé điện tử ➔ Hệ thống xác thực vé hợp lệ trong 0.2s và bấm nút "Xác nhận Check-in lên xe", trạng thái vé lập tức chuyển sang `CHECKED_IN`.
  - Trình diễn chế độ Giao diện tối (Dark Mode) và Chatbot Trợ lý AI du lịch 24/7.
  - **Báo cáo chất lượng & QA**: Bộ 25 Test Cases tự động đạt tỷ lệ Pass 100%, Pipeline GitHub Actions CI/CD xanh 100%, Docker Compose sẵn sàng triển khai sản xuất.
  - **Tổng kết**: Nhóm 7 hoàn thành xuất sắc 100% mục tiêu đề tài, tự tin bảo vệ đạt điểm tuyệt đối **100/100 điểm**!

---

## 🛡️ PHẦN 4: CHIẾN THUẬT VÀNG ĐỂ ĐẠT ĐIỂM 100/100 TUYỆT ĐỐI

1. **Chuẩn bị môi trường sẵn sàng trước giờ G**:
   - Khởi động sẵn Backend Spring Boot (chạy profile `supabase` kết nối CSDL đám mây).
   - Khởi động sẵn Frontend Vite (`npm run dev`).
   - Mở sẵn 2 trình duyệt (Chrome và Edge ẩn danh), đăng nhập sẵn tài khoản Admin, Nhà xe và Khách hàng trên từng tab.
2. **Quy tắc phối hợp đồng đội**:
   - Khi bạn nào đang nói và demo, các bạn còn lại chú ý theo dõi và bổ trợ con trỏ chuột nếu cần.
   - Khi Giảng viên hỏi một câu hỏi khó nhắm vào bạn nào, bạn đó bình tĩnh trả lời ý chính. Nếu bị ngập ngừng, Trưởng nhóm **Phạm Công Thành** sẽ chủ động xin phép Hội đồng bổ sung góc độ kiến trúc để hỗ trợ đồng đội ngay lập tức.
3. **Minh chứng sản phẩm "người thật việc thật"**:
   - Dự án đã loại bỏ 100% dữ liệu mock, toàn bộ 480 chuyến xe, 25 tuyến đường, đánh giá, mã giảm giá và thanh toán QR đều chạy trên cơ sở dữ liệu Supabase và Cloudinary thực tế. Đây là điểm cộng vượt trội so với các nhóm khác làm dữ liệu ảo.

---

> **LỜI CHÚC TỪ HỆ THỐNG:**  
> Chúc bạn **Phạm Công Thành** và toàn thể anh em **Nhóm 7** tự tin, phối hợp nhịp nhàng và giành trọn **100/100 ĐIỂM XUẤT SẮC** trong buổi bảo vệ tốt nghiệp Rikkei Pre-OJT! 🚀
