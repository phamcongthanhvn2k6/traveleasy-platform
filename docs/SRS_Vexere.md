# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) - HỆ THỐNG VEXERE CLONE

**Dự án:** Hệ thống Quản lý Đặt vé Xe khách (Vexere Clone)  
**Tiêu chuẩn áp dụng:** IEEE Std 830-1998  
**Trạng thái:** Hoàn thiện (Đã đồng bộ 100% với Class Diagram v2 [Source of Truth], Domain Model và Database Design)  
**Phiên bản:** 2.0  

---

## 1. GIỚI THIỆU (INTRODUCTION)

### 1.1 Mục đích (Purpose)
Tài liệu SRS này mô tả chi tiết các yêu cầu chức năng và phi chức năng của Hệ thống Quản lý Đặt vé Xe khách (Vexere Clone). Tài liệu được sử dụng làm cơ sở cam kết giữa đội ngũ phát triển, kiểm thử và các bên liên quan (Khách hàng, Nhà xe, Admin) về các tính năng sẽ được xây dựng và nghiệm thu.

### 1.2 Phạm vi sản phẩm (Product Scope)
Hệ thống Vexere Clone là nền tảng thương mại điện tử và quản lý vận hành kết nối giữa ba tác nhân chính: Khách hàng (đặt vé trực tuyến), Nhà xe (quản lý đội xe, lịch trình, giá vé và hành khách) và Quản trị viên hệ thống (giám sát, cấu hình cổng thanh toán, kiểm duyệt nội dung và xem audit log). Hệ thống hỗ trợ xử lý giao dịch đặt chỗ thời gian thực, tự động hóa hoàn tiền và phân phối thông tin hành trình qua SMS/Email.

### 1.3 Định nghĩa và Thuật ngữ (Definitions, Acronyms, and Abbreviations)
*   **OTP (One-Time Password):** Mật khẩu sử dụng một lần để xác thực đăng nhập qua SĐT.
*   **ETA (Estimated Time of Arrival):** Thời gian dự kiến đến một điểm đón/trả của xe.
*   **Soft Hold (Khóa mềm):** Cơ chế giữ ghế tạm thời trong thời gian ngắn (180 giây) thông qua Redis khi người dùng đang ở bước Chọn ghế và bước điền Thông tin liên hệ.
*   **Hard Hold (Khóa cứng):** Cơ chế giữ ghế trong 10 phút (600 giây) kể từ thời điểm nhấn "Tiếp tục" ở bước Thông tin liên hệ để chờ kết quả giao dịch thanh toán.
*   **IPN (Instant Payment Notification):** Cơ chế cổng thanh toán gọi trực tiếp về backend của hệ thống để cập nhật kết quả giao dịch trực tuyến qua kênh server-to-server.
*   **Location Catalog (Danh mục Địa điểm Dùng chung):** Danh mục địa lý Master Data (Tỉnh/Thành, Quận/Huyện, Phường/Xã) do Admin quản lý tập trung toàn hệ thống.
*   **BusCompany Location Config (Cấu hình Địa điểm Nhà xe):** Cấu hình riêng của từng Nhà xe tại 1 Location dùng chung (tên hiển thị, bật/tắt đón/trả, hotline, hướng dẫn gặp tài xế, cổng, platform). Áp dụng quy tắc Soft Disable (Grandfather Rule).
*   **Route Template (Tuyến mẫu):** Tuyến mẫu định sẵn của Nhà xe (chứa `originLocationId`/`destinationLocationId` làm Default Representative Locations / Search Anchors, danh sách `RouteTemplateStop` vận hành có thứ tự sequence kèm thời lượng từng đoạn `estimatedTravelDurationFromPreviousStopMinutes` được tính tự động từ Routing API — Stop 1 luôn bằng 0, Nhà xe không có quyền tự chỉnh sửa/ghi đè, cấu hình dịch vụ xe trung chuyển `RouteTemplateShuttleService`, và bảng giá `RouteTemplateSeatPrice` theo loại ghế).
*   **Representative Stop (Điểm đại diện hiển thị Card):** Điểm dừng đón/trả hiển thị trên Search Result Card được lựa chọn ĐỘNG từ `RouteTemplateStop` theo Search Context.
*   **Trip Points (Điểm dừng/đón trả trên chuyến đi):** Runtime snapshot được clone từ `RouteTemplateStop` khi chuyến đi (`Trip`) được khởi tạo với giờ xuất phát gốc `TripSchedule.baseDepartureTime`. Hệ thống tự động tính `TripPoint.eta` bằng cách cộng dồn tuần tự từng đoạn theo sequence (`TripPoint[1].eta = baseDepartureTime`, `TripPoint[i].eta = TripPoint[i-1].eta + duration[i]`), phục vụ theo dõi ETA real-time và vận hành (không tham gia Search). Ngoài lịch trình, Trip Point còn **sao chép và lưu lại thông tin vận hành** của điểm dừng tại thời điểm tạo chuyến (tên hiển thị, cho đón/trả trực tiếp hay không, hotline, hướng dẫn gặp tài xế, cổng, nền đỗ, mốc nhận biết) — nhờ vậy thông tin hiển thị cho khách của chuyến cũ không bị thay đổi khi Nhà xe cập nhật cấu hình địa điểm về sau.
*   **Shuttle Service (Dịch vụ Xe trung chuyển):** Dịch vụ đón/trả khách từ khu vực bên ngoài điểm dừng cố định bằng xe trung chuyển. Đón (`PICKUP`) và Trả (`DROPOFF`) được cấu hình độc lập trên Tuyến mẫu (`RouteTemplateShuttleService`). **`[MEDIUM-4]`** Mỗi Tuyến mẫu có tối đa **0..1 PICKUP** và tối đa **0..1 DROPOFF** Shuttle Service (`UNIQUE(routeTemplateId, shuttleType)`) — các điểm/ lựa chọn mà khách nhìn thấy trong UI thuộc về service đó và **KHÔNG** được hiểu thành nhiều Shuttle Service độc lập. Bắt buộc sở hữu `referenceStop` là mốc thời gian do **Nhà xe tự chọn thủ công** từ các `RouteTemplateStop` của tuyến (NOT NULL). Phạm vi phục vụ (`coverageAreaDescription`) là văn bản mô tả (không tạo Location entity riêng). Được snapshot thành `TripShuttleService` trên từng chuyến đi.
*   **Reschedule (Đổi chuyến / Đổi ngày — Phương án A):** Nghiệp vụ cho phép Khách hàng đổi 1 hoặc nhiều `Ticket` sang `Trip` mới. Canonical model: hệ thống tạo **`Booking` mới (`newBooking`)** thuộc `newTrip` và **`Ticket` mới (`newTicket`)** thuộc `newBooking`; Old Ticket (`oldTicket`) chuyển sang `CANCELLED` với `cancellationReason = RESCHEDULED` — Old Ticket **không** đổi `booking_id`, **không** đổi `trip_id`, **không** được tái sử dụng. Lịch sử được lưu trong `RescheduleRecord` với `oldTicketId`/`newTicketId` rõ ràng. **`[D1]` Reschedule Operation:** một lần đổi vé (dù đổi bao nhiêu vé) là **một operation duy nhất**, định danh bằng `rescheduleOperationId`; mọi `RescheduleRecord` của lần đổi đó mang cùng giá trị này. **`[PBD-02 CLOSED V1]`** Chênh lệch tài chính tính theo **tổng operation**: `totalNetAdjustment = Σ (newSeatPrice - oldSeatPrice)` — `rescheduleFee = 0` trong V1 (nếu field `rescheduleFee` vẫn giữ để mở rộng tương lai thì giá trị V1 luôn bằng 0). dương → nộp thêm **1** giao dịch (`RESCHEDULE_SURCHARGE`), âm → **1** giao dịch hoàn tiền, bằng 0 → không phát sinh giao dịch.
*   **Partial Cancellation (Hủy vé từng phần — Phương án A):** Luồng cho phép Khách hàng chọn và hủy từng vé cụ thể trong một đơn đặt vé (`Booking`) chứa nhiều vé. Chỉ vé bị hủy chuyển sang `CANCELLED` và giải phóng ghế tương ứng; các vé còn lại tiếp tục giữ trạng thái `ISSUED`. `Booking` duy trì trạng thái `CONFIRMED` nếu vẫn còn ít nhất 1 vé active.

### 1.4 Tài liệu tham khảo (References)
*   IEEE Std 830-1998, IEEE Recommended Practice for Software Requirements Specifications.
*   Class Diagram v2 (`class_diagram.md`) — Source of Truth cho toàn bộ thiết kế hệ thống.
*   Domain Model Specification (`domain.md`) & Database Design Specification (`database_design.md`).

---

## 2. MÔ TẢ TỔNG QUAN (OVERALL DESCRIPTION)

### 2.1 Bối cảnh sản phẩm (Product Perspective)
Hệ thống hoạt động dưới mô hình Web Application / Mobile Web, kết nối trực tiếp với các API của bên thứ ba như:
*   Cổng thanh toán: VNPay, MoMo, ZaloPay.
*   SMS Gateway: Twilio, eSMS, Zalo ZNS.
*   Email Service: Amazon SES, SendGrid, SMTP Server.

```
+--------------------------------------------------------+
|                    VEXERE CLONE SYSTEM                 |
|  +----------------+  +-----------------+  +---------+  |
|  | Khách hàng Web |  | Portal Nhà Xe   |  | Admin   |  |
|  +----------------+  +-----------------+  +---------+  |
+-----------+-------------------+----------------+-------+
            |                   |                |
   +--------v--------+ +--------v--------+ +-----v-----+
   | Payment Gateway | |   SMS Gateway   | | Email API |
   | (VNPay/MoMo...) | | (Twilio/eSMS)   | | (SES/SG)  |
   +-----------------+ +-----------------+ +-----------+
```

### 2.2 Chức năng sản phẩm (Product Functions)
Hệ thống cung cấp các nhóm chức năng chính được phân quyền rõ ràng:
1.  **Quản lý người dùng:** Đăng ký tài khoản, đăng nhập bằng OTP SĐT hoặc Google, phân quyền truy cập.
2.  **Tìm kiếm & Đặt vé:** Tìm chuyến xe, hiển thị sơ đồ ghế, thực hiện thanh toán trực tuyến, khóa giữ ghế qua cơ chế hai lớp Soft-Hold và Hard-Hold.
3.  **Vận hành Nhà xe:** Quản lý thông tin nhà xe, danh sách xe, điểm đón/trả, thiết lập chuyến đi độc lập layout ghế, bán vé tại quầy, ghép ghế bán tự động khi xảy ra đổi phương tiện khẩn cấp.
4.  **Hệ thống thông báo:** Tự động gửi tin nhắn/Email xác nhận đặt vé, hoàn tiền và nhắc nhở thời gian thực dựa trên cập nhật trễ chuyến thủ công.
5.  **Quản trị và cấu hình:** Quản lý tài khoản, phân quyền, phê duyệt nhà xe, quản lý địa điểm, sơ đồ ghế mẫu, cấu hình cổng thanh toán và dịch vụ thông báo, kiểm duyệt đánh giá, quản lý banner, ghi Audit Log hệ thống.

### 2.3 Tác nhân & Đặc điểm người dùng (User Classes and Characteristics)
*   **Khách hàng (User):** Không yêu cầu kỹ năng công nghệ cao, giao diện trực quan, thao tác nhanh gọn trên thiết bị di động/máy tính.
*   **Nhân viên Nhà xe (Bus Company):** Cần màn hình quản lý rõ ràng, hỗ trợ các tác vụ CRUD nhanh, xử lý tình huống đổi xe/đổi chuyến khẩn cấp, báo cáo trễ chuyến thủ công. Mỗi tài khoản thuộc nhóm này được **gắn với đúng một Nhà xe** tại thời điểm tạo tài khoản; một Nhà xe có thể có nhiều tài khoản nhân viên. Liên kết này là cơ sở để hệ thống phân quyền và bảo đảm tài khoản chỉ thao tác được trên dữ liệu của chính Nhà xe mình (xem quy tắc Quyền sở hữu dữ liệu tại UC-2.3, UC-2.5, UC-2.9). Tài khoản Khách hàng và Quản trị viên **không** có liên kết này.
*   **Quản trị viên (Admin):** Có chuyên môn kỹ thuật hoặc nghiệp vụ quản trị, sử dụng Admin Dashboard để giám sát toàn bộ hệ thống.
*   *Lưu ý kiến trúc V1:* Hệ thống **không** có actor "Tài xế". Mọi thông tin hành trình và danh sách hành khách đi xe sẽ được nhà xe kết xuất ra phiếu thông tin giấy hoặc gửi thủ công ngoài hệ thống cho tài xế.

### 2.4 Ràng buộc thiết kế và hiện thực (Design and Implementation Constraints)
*   Hệ thống backend phải thiết kế phi trạng thái (Stateless API) để dễ dàng scale ngang.
*   Sử dụng Redis làm caching và quản lý khóa phân tán (Distributed Lock) phục vụ giữ ghế.
*   Toàn bộ thông tin cấu hình nhạy cảm (API Keys cổng thanh toán/SMS) phải được mã hóa trước khi lưu DB. Hệ thống V1 **không lưu trữ mật khẩu** — xác thực hoàn toàn qua OTP (SĐT) và Google OAuth2.

### 2.5 Giả định và Phụ thuộc (Assumptions and Dependencies)
*   Mã giao dịch từ cổng thanh toán và trạng thái IPN phản hồi chính xác.
*   Dịch vụ SMS Gateway và SMTP Email hoạt động với uptime > 99%.

---

## 3. YÊU CẦU CHI TIẾT (SPECIFIC REQUIREMENTS)

### 3.1 Yêu cầu Giao diện Ngoại vi (External Interface Requirements)

#### 3.1.1 Giao diện người dùng (User Interfaces)
*   **Khách hàng:** Trang chủ hiển thị banner và thanh tìm kiếm nổi bật; Sơ đồ chọn ghế hiển thị trực quan dạng lưới, cập nhật màu sắc ghế theo thời gian thực (Trống - Xanh, Đang chọn - Cam, Đã đặt - Xám).
*   **Nhà xe & Admin:** Bảng điều khiển (Dashboard) dạng lưới quản lý danh sách chuyến chạy, trạng thái đặt chỗ, biểu đồ doanh thu.

#### 3.1.2 Giao diện Phần mềm (Software Interfaces)
*   **Cổng thanh toán:** Tích hợp qua SDK/API kết nối Redirect URL, IPN Endpoint và API truy vấn trạng thái giao dịch (Query Transaction Status API) của VNPay, MoMo.
*   **SMS/Zalo Gateway:** Sử dụng RESTful API gửi tin nhắn định danh (Brandname).
*   **Bản đồ / Khoảng cách / Routing API:** Tích hợp Google Maps API (hoặc dịch vụ Routing tương đương) để hiển thị bản đồ vị trí điểm đón/trả, hỗ trợ gợi ý địa điểm (Places Autocomplete), và **tự động tính thời lượng di chuyển dự kiến giữa hai điểm dừng liên tiếp** (`estimatedTravelDurationFromPreviousStopMinutes`) khi Nhà xe cấu hình hoặc cập nhật Tuyến mẫu (`RouteTemplate`). Kết quả duration lấy trực tiếp từ Routing API — **Nhà xe không có quyền chỉnh sửa/ghi đè giá trị này** (Stop đầu tiên luôn bằng 0). Hệ thống **không gọi lại Routing API** mỗi lần Khách hàng Search, mỗi lần tạo Trip, hay khi tính ETA runtime lúc có sự cố trễ chuyến.
*   **WebSocket Server:** Giao thức kết nối hai chiều real-time (như Socket.IO hoặc STOMP over WebSocket) được sử dụng để broadcast trạng thái ghế (Trống/Đang chọn/Đã đặt) tới toàn bộ client đang xem cùng chuyến xe trong UC-1.6.

---

### 3.2 Tính năng hệ thống & Đặc tả Use Case (Functional Requirements)

#### 3.2.1 Phân hệ Khách hàng (User)

##### UC-1.1: Đăng ký tài khoản
*   **Tiền điều kiện:** Ứng dụng đã khởi động và thiết bị có kết nối Internet.
*   **Luồng sự kiện chính:** Khách hàng điền thông tin (Họ tên, SĐT, Email) -> Hệ thống kiểm tra trùng lặp SĐT/Email -> Gửi mã xác thực OTP -> Xác nhận thành công -> Tạo tài khoản. **Hệ thống V1 không sử dụng mật khẩu** — khách hàng không nhập và hệ thống không lưu mật khẩu.
*   **Hậu điều kiện:** Tài khoản mới được ghi nhận vào cơ sở dữ liệu.

##### UC-1.2: Đăng nhập hệ thống (SĐT OTP & Google)
*   **Tiền điều kiện:** Ứng dụng đã khởi động, thiết bị có kết nối Internet.
*   **Luồng sự kiện chính:**
    1.  *Đối với OTP:* Khách hàng nhập SĐT -> Nhấn "Gửi mã OTP" -> Hệ thống tạo OTP 6 số (hạn 2 phút), gửi qua cổng SMS -> Khách nhập mã OTP -> Hệ thống xác thực khớp -> Đăng nhập thành công (tự tạo tài khoản mới nếu SĐT chưa có trong DB).
    2.  *Đối với Google:* Khách chọn "Đăng nhập Google" -> Xác nhận qua Google OAuth2 -> Hệ thống backend xác thực ID Token từ Google -> Đăng nhập thành công (tự tạo tài khoản mới bằng Email nếu chưa có).
    *(Lưu ý: Hai hình thức tài khoản này hoạt động độc lập, không tự động gộp tài khoản).*
*   **Luồng ngoại lệ:** 
    *   *Ngoại lệ 1:* Số điện thoại sai định dạng -> Báo lỗi nhập liệu.
    *   *Ngoại lệ 2 (Rate Limit):* Gửi yêu cầu OTP quá 1 lần/60s hoặc quá 3 lần/15 phút -> Chặn gửi và yêu cầu nhập reCAPTCHA/đợi hết thời gian khóa.
    *   *Ngoại lệ 3:* Nhập sai OTP quá 3 lần -> Khóa tạm thời yêu cầu xác thực OTP của SĐT đó trong 5 phút.
*   **Hậu điều kiện:** Khách hàng nhận được các phiên token hoạt động bao gồm 2 loại token:
    - Access Token: JWT, thời hạn ngắn (ví dụ 15 phút), chứa các claims tối thiểu sub (userId), role, iat, exp; dùng để backend xác thực stateless (không cần query DB mỗi request) khi truy cập các API yêu cầu đăng nhập. Access Token được gửi kèm mỗi request qua header Authorization: Bearer <token>; hệ thống backend không lưu session trên server (đúng ràng buộc Stateless API tại mục 2.4).
    - Refresh Token: chuỗi ngẫu nhiên (UUID), không phải JWT, thời hạn dài hơn (ví dụ 7-30 ngày), được lưu ở Redis/DB kèm liên kết tới tài khoản; dùng để cấp lại Access Token mới khi hết hạn mà không bắt đăng nhập lại; có thể bị thu hồi (revoke) khi logout bằng cách xoá record tương ứng (đưa vào cơ chế blacklist đã có).

##### UC-1.3: Xem thông tin trang chủ
*   **Tiền điều kiện:** Ứng dụng đã khởi động.
*   **Luồng sự kiện chính:** Hệ thống truy vấn và hiển thị banner quảng cáo, các chương trình khuyến mãi hoạt động và danh sách chuyến chạy nổi bật của các nhà xe.
*   **Hậu điều kiện:** Hiển thị giao diện trang chủ đầy đủ thông tin.

##### UC-1.4: Tìm kiếm chuyến xe & Hiển thị kết quả động (Dynamic Representative Stop Selection)
*   **Tiền điều kiện:** Khách hàng mở ứng dụng.
*   **Luồng sự kiện chính:** 
    1. Khách hàng chọn Điểm đi, Điểm đến theo địa giới hành chính 3 cấp (Tỉnh/Thành phố, Quận/Huyện, Phường/Xã) và Ngày đi -> Nhấn "Tìm kiếm".
    2. **Quy trình Search Engine:** Search Engine truy vấn dữ liệu Tuyến mẫu (`RouteTemplate`) và danh sách Điểm dừng chuẩn (`RouteTemplateStop`). `TripPoint` là runtime snapshot không tham gia vào luồng tìm kiếm này.
    3. **Hiển thị Search Result Card — Thuật toán chọn điểm đại diện (canonical):** Điểm đón/trả đại diện (**Representative Pickup/Dropoff Stop**) hiển thị trên Card kết quả được lựa chọn **ĐỘNG từ `RouteTemplateStop`** theo Search Context cụ thể, theo đúng 4 quy tắc sau:
       - **Bước 1 — Xác định tập ứng viên hợp lệ:** Với mỗi Tuyến mẫu, xét danh sách `RouteTemplateStop` và lọc ra hai tập:
         - *Tập Pickup:* stop nằm trong vùng hành chính của **Điểm đi** (đúng cấp đã chọn: Tỉnh / Huyện / Xã) **VÀ** điểm đó **thực sự cho phép đón khách** (`acceptsPickup = true` trên `BusCompanyLocationConfig` tương ứng; `RouteStopType` không mâu thuẫn — `TRANSIT_ONLY` bị loại).
         - *Tập Dropoff:* stop nằm trong vùng hành chính của **Điểm đến** **VÀ** điểm đó **thực sự cho phép trả khách** (`acceptsDropoff = true`; `TRANSIT_ONLY` bị loại).
         - Một stop chỉ khớp địa giới nhưng **không** cho đón/trả (ví dụ trạm kỹ thuật, điểm chỉ đi ngang) **không** được làm điểm đại diện.
       - **Bước 2 — Representative Pickup Stop:** là stop khớp **ĐẦU TIÊN** theo thứ tự hành trình (`sequence` nhỏ nhất trong tập Pickup) — khách lên xe càng sớm càng tốt trong khu vực đón.
       - **Bước 3 — Representative Dropoff Stop:** là stop khớp **CUỐI CÙNG** theo thứ tự hành trình (`sequence` lớn nhất trong tập Dropoff) — khách xuống ở điểm sâu nhất trong khu vực đến.
       - **Bước 4 — Loại tuyến không khớp:** Nếu tập Pickup hoặc tập Dropoff rỗng (kể cả trường hợp có stop đúng địa giới nhưng không cho đón/trả), hoặc `sequence` của Pickup không nhỏ hơn `sequence` của Dropoff (sai chiều hành trình), thì `RouteTemplate` đó **không khớp** và **không** xuất hiện trong kết quả.
       - *Ví dụ (Tỉnh):* HCM → Kon Tum hiển thị Dropoff là stop cuối cùng **cho phép trả khách** thuộc tỉnh Kon Tum. *Ví dụ (Huyện):* HCM → Đắk Tô hiển thị Dropoff là stop cuối cùng cho phép trả khách thuộc huyện Đắk Tô; tuyến không dừng trả khách tại Đắk Tô sẽ không xuất hiện.
       - **Không** dùng `originLocationId`/`destinationLocationId` làm điểm đại diện **khi đã có Search Context**.
       - **Fallback:** Chỉ khi **không có** Search Context (ví dụ xem danh sách mặc định của nhà xe), card mới dùng `originLocationId` và `destinationLocationId` làm điểm đại diện mặc định (Default Representative Locations). Ngoài ra, hai trường này phục vụ phân loại, quản trị và SEO.
    4. **Bộ lọc (Filter):** Sau khi danh sách kết quả được hiển thị, hệ thống cung cấp bộ lọc (giờ khởi hành, nhà xe, khoảng giá vé theo từng loại ghế, đánh giá, loại xe) áp dụng trực tiếp trên tập kết quả ban đầu.
    5. **Chuyển tiếp sang đặt vé:** Khi khách chọn một chuyến từ kết quả tìm kiếm, hệ thống **tự động chọn sẵn đúng cặp điểm đón/trả đã hiển thị trên Card**. Khách chỉ được đổi sang điểm dừng khác nếu Nhà xe cho phép điểm đó đón/trả (`acceptsPickup`/`acceptsDropoff`).
*   **Hậu điều kiện:** Danh sách chuyến đi kèm điểm dừng đại diện động theo Search Context được hiển thị chính xác; mọi điểm đại diện hiển thị đều là điểm khách **thực sự có thể lên/xuống xe**; cặp điểm đón/trả được chuyển tiếp nhất quán sang luồng đặt vé.

##### UC-1.5: Xem chi tiết chuyến xe
*   **Tiền điều kiện:** Đã hiển thị danh sách chuyến xe phù hợp.
*   **Luồng sự kiện chính:** Khách hàng click vào chuyến đi cụ thể -> Hệ thống hiển thị chi tiết hình ảnh xe, điểm đón/trả cụ thể, chính sách đổi trả, đánh giá của các khách hàng khác.
*   **Hậu điều kiện:** Giao diện chi tiết chuyến chạy hiển thị đầy đủ.

##### UC-1.6: Chọn ghế & Khóa tạm thời thời gian thực (Soft Hold & Hard Hold)
*   **Tiền điều kiện:** Khách hàng đang ở màn hình chi tiết chuyến đi.
*   **Luồng sự kiện chính:**
    1.  **Bước 1: Chọn ghế:** Khách hàng chọn một hoặc nhiều ghế trống trên sơ đồ. Hệ thống tạo Soft Hold có thời hạn TTL = 180 giây trong Redis (Sử dụng lệnh `SETNX` với key `seat:{tripId}:{seatCode}`). Đồng thời, hệ thống phát đi sự kiện qua WebSocket báo trạng thái ghế "Đang chọn" đến tất cả các client đang xem cùng chuyến xe.
    2.  **Bước 2: Màn hình Thông tin liên hệ:** Khi nhấn "Tiếp tục" từ bước chọn ghế, hệ thống hiển thị form nhập thông tin liên hệ (Họ tên, SĐT, Email người đặt), thông tin chuyến xe, giá tạm tính và đồng hồ đếm ngược thời gian hiệu lực còn lại của Soft Hold.
        *   *Validate Đăng nhập:* Tại bước này, nếu người dùng chưa đăng nhập, hệ thống sẽ chặn hành động bấm "Tiếp tục". Việc kiểm tra này bắt buộc thực hiện tại Backend (API trả về HTTP status `401 Unauthorized` nếu thiếu JWT Token hợp lệ), đồng thời hiển thị Modal yêu cầu đăng nhập ở Frontend.
    3.  **Bước 3: Chuyển đổi Soft -> Hard (Chỉ xảy ra 1 lần duy nhất khi bấm "Tiếp tục" ở bước Thông tin liên hệ):**
        *   Hệ thống thực hiện một Lua script tuần tự và atomic trên Redis để kiểm tra: Nếu key Soft Hold vẫn tồn tại (chưa hết hạn TTL) -> Tiến hành xóa Soft Hold và tạo Hard Hold với TTL = 600 giây (10 phút) để chuyển sang màn hình Thanh toán.
        *   Nếu Soft Hold đã hết hạn (TTL = 0) -> Redis trả về kết quả hết hạn, Backend trả mã lỗi `409 Conflict`, bắt buộc khách hàng quay lại bước chọn ghế từ đầu.
    4.  **Bước 4: Màn hình Thanh toán:** Hệ thống hiển thị các cổng thanh toán. Khách hàng có tối đa 10 phút Hard Hold để hoàn tất giao dịch.
        *   *Quy tắc cứng:* Không hỗ trợ gia hạn thời gian Hard Hold dưới bất kỳ hình thức nào (kể cả khi thanh toán thất bại và yêu cầu thử lại). Nếu quá 10 phút giao dịch chưa hoàn tất, key Hard Hold trong Redis hết hạn → Hold **không còn hiệu lực**; hệ thống đồng bộ trạng thái tồn kho `TripSeat.status` về `AVAILABLE` và khách hàng bắt buộc phải chọn lại ghế (xem **`[M3]`** bên dưới).
*   **Lý do thiết kế:** Việc cấm gia hạn Hard Hold nhằm ngăn chặn triệt để hành vi cố ý giữ ghế vô hạn bằng cách liên tục nhấn "Thử lại thanh toán", đảm bảo sự công bằng và tính sẵn sàng của vé cho các khách hàng khác.
*   **`[M3]` Phân vai Source of Truth — Redis Hold vs `TripSeat.status` (canonical):**
    *   **Redis là Source of Truth cho Hold tạm thời và TTL.** Redis quyết định một Soft Hold / Hard Hold **còn hiệu lực hay đã hết hạn**, và cung cấp atomicity phân tán (`SETNX`, Lua script) chống double-booking trong luồng Hold.
    *   **`TripSeat.status` là trạng thái tồn kho bền vững (persistent inventory state / projection)** lưu trong Database, phục vụ truy vấn, hiển thị và vận hành. Giá trị: `AVAILABLE` / `SOFT_HELD` / `HARD_HELD` / `BOOKED`.
    *   Đây là **hai vai trò khác nhau**, **không** phải hai nguồn sự thật cạnh tranh nhau. Khi cần trả lời câu hỏi *"ghế này hiện còn Hold hợp lệ không?"*, hệ thống **phải dựa vào Redis**, **không** chỉ nhìn `TripSeat.status`.
    *   **Hold hết hạn — luồng canonical:** Redis key hết hạn **không** tự động làm Database thay đổi. Bắt buộc tồn tại một **bước đồng bộ** đưa trạng thái persistent về đúng:
        ```text
        Redis Hold het han / duoc giai phong
                ↓
        Hold khong con hieu luc
                ↓
        He thong dong bo trang thai ton kho
                ↓
        TripSeat.status = AVAILABLE
        ```
        Mục tiêu: không để tồn tại lâu dài tình trạng *Redis không còn Hold* nhưng *Database vẫn `HARD_HELD`*. Yêu cầu ở mức nghiệp vụ là **eventual consistency**; cơ chế triển khai cụ thể thuộc phạm vi thiết kế kỹ thuật, không ràng buộc ở tài liệu này.
    *   **Không** phát sinh `Ticket` hợp lệ từ một Hold đã hết hạn — tính hợp lệ của Hard Hold phải được kiểm trên Redis tại thời điểm finalize.
    *   **Ba kịch bản canonical:**

        | Kịch bản | Redis | `trip_seats.status` |
        |---|---|---|
        | **A — Hard Hold còn hiệu lực** | Hard Hold ACTIVE, TTL chưa hết | `HARD_HELD` — ghế **chưa** được coi là Available |
        | **B — Hard Hold hết hạn** | Hold EXPIRED / key không còn | đồng bộ → `AVAILABLE` — ghế được phép tham gia Hold/Booking mới |
        | **C — Thanh toán thành công** | Hold được finalize / release | `BOOKED` — tồn kho bền vững; `Ticket` → `ISSUED` |
*   **Hậu điều kiện:** Ghế được giữ cứng trong Redis chờ kết quả thanh toán; `TripSeat.status` được đồng bộ tương ứng (`HARD_HELD`).

##### UC-1.7 & UC-1.8: Đặt vé & Thanh toán trực tuyến
*   **Tiền điều kiện:** Ghế đã được Hard Hold thành công (UC-1.6).
*   **Luồng sự kiện chính:**
    1.  Khách hàng thực hiện thanh toán qua cổng VNPay/MoMo/ZaloPay.
    2.  Hệ thống chuyển tiếp khách hàng sang giao diện của cổng thanh toán.
    3.  Khách hàng xác thực và thực hiện chuyển tiền.
    4.  Hệ thống nhận phản hồi IPN trực tiếp từ server cổng thanh toán, đối chiếu chữ ký bảo mật, xác thực kết quả giao dịch và chuyển trạng thái vé thành "Đã đặt".
*   **Hậu điều kiện:** Giao dịch thanh toán được hoàn thành, ghế được gán vĩnh viễn cho khách.

##### UC-1.9: Nhận vé điện tử (QR Code)
*   **Tiền điều kiện:** Thanh toán thành công (UC-1.8).
*   **Luồng sự kiện chính:** Hệ thống tạo bản ghi vé điện tử kèm theo mã QR chứa thông tin chuyến đi, họ tên, số ghế và gửi hóa đơn xác nhận về email của khách. **`[D7]`** Tại chính thời điểm này, hệ thống **chốt và lưu giá vé lên từng vé** (`Ticket.seatPrice`), sao chép từ bảng giá của chuyến (`TripSeatPrice`) theo loại ghế tương ứng. Giá này **bất biến** suốt vòng đời vé.
*   **Hậu điều kiện:** Vé điện tử được hiển thị cho khách hàng và lưu trữ trong lịch sử đặt vé, kèm **giá vé đã chốt** — là căn cứ duy nhất cho mọi tính toán hoàn tiền và đối soát về sau.

##### UC-1.10: Nhận thông báo tự động (ETA tính tự động từ baseDepartureTime & duration)
*   **Tiền điều kiện:** Khách hàng có vé **ACTIVE** (`ISSUED` hoặc `CHECKED_IN`).
*   **Luồng sự kiện chính:**
    1.  *Khi đặt vé thành công:* Hệ thống tự động gửi Email/SMS xác nhận thông tin vé trong vòng 2 phút.
    2.  *Khi chuẩn bị đi:* Cron Job chạy ngầm quét các chuyến đi khởi hành trong vòng 2 tiếng tiếp theo.
    3.  **`[D6]`** Hệ thống tính giờ đón thực tế = `TripPoint.eta` (ETA gốc **bất biến**, đã tính khi tạo chuyến từ `TripSchedule.baseDepartureTime` cộng dồn `estimatedTravelDurationFromPreviousStopMinutes`) **+** `TripSchedule.delayMinutes` (**tổng** số phút trễ hiện tại do nhà xe báo tại UC-2.11). Phép cộng thực hiện **khi đọc**; `TripPoint.eta` không bị ghi đè nên báo trễ nhiều lần không gây cộng dồn sai.
    4.  Hệ thống gửi Email và tin nhắn nhắc nhở chi tiết địa điểm đón và thời gian chạy thực tế cập nhật cho hành khách.
*   **Hậu điều kiện:** Khách hàng nhận được thông báo lịch trình cập nhật.

##### UC-1.11: Yêu cầu Hủy vé (Hủy toàn bộ hoặc Hủy từng phần vé - Partial Cancellation) & Hoàn tiền
*   **Tiền điều kiện `[D5]`:** `Ticket` ở trạng thái **`ISSUED`** và Khách hàng đăng nhập vào lịch sử đặt vé. Vé đã `CHECKED_IN` (khách đã lên xe), đã `COMPLETED` hoặc đã `CANCELLED` **không** được hủy.
*   **Luồng sự kiện chính (Hủy từng phần / Partial Cancellation):**
    1.  Khách hàng truy cập danh sách vé trong Booking và chọn 1 hoặc nhiều `Ticket` cụ thể cần hủy (ví dụ: chỉ hủy Ticket B trong đơn gồm 3 vé A, B, C).
    2.  Hệ thống kiểm tra Chính sách hủy áp dụng cho chuyến đi đó đối với từng vé chọn hủy.
    3.  Hệ thống tính toán số tiền hoàn cho riêng các `Ticket` bị hủy và hiển thị màn hình xác nhận. **`[D7]`** Số tiền hoàn được tính từ **giá đã lưu trên chính vé đó** (`Ticket.seatPrice` — số tiền khách **đã thực trả**) nhân với tỷ lệ hoàn theo Chính sách hủy, **không** lấy theo giá hiện hành của chuyến.
    4.  Khách hàng xác nhận hủy vé.
    5.  Hệ thống gọi API Refund của cổng thanh toán gốc (VNPay/MoMo) để hoàn tiền trực tiếp về tài khoản khách hàng tương ứng với giá trị vé bị hủy.
    6.  Hệ thống đổi trạng thái của các `Ticket` được chọn thành `CANCELLED`, ghi nhận `cancelled_at` và `refund_amount`, đồng thời giải phóng các ghế tương ứng (`TripSeat`) trên chuyến chạy về trạng thái `AVAILABLE`.
    7.  *Cập nhật trạng thái Booking & Phát Domain Event:*
        *   **Mỗi Ticket bị hủy** phát `TicketCancelled` → Refund Context khởi tạo `RefundTransaction` cho vé đó. **`[HIGH-2]`** Đối với **Rescheduled Ticket**, nếu số tiền cần hoàn phải lấy từ nhiều `PaymentTransaction` trong financial lineage, hệ thống sẽ phân bổ và tạo **nhiều `RefundTransaction`** (mỗi bản ghi trỏ đúng 1 `payment_txn_ref`, theo thứ tự mới nhất trước), Trip Aggregate giải phóng TripSeat tương ứng.
        *   Nếu `Booking` vẫn còn ít nhất 1 `Ticket` ở trạng thái `ISSUED` / `CHECKED_IN`: `Booking.status` tiếp tục giữ nguyên là `CONFIRMED`. **Không** phát `BookingCancelled` trong trường hợp này.
        *   Nếu tất cả `Ticket` thuộc `Booking` đều đã bị hủy (100% cancelled): `Booking.status` chuyển sang `CANCELLED`, đồng thời phát `BookingCancelled`.
*   **Hậu điều kiện:** Các vé được chọn bị hủy và hoàn tiền đúng tỷ lệ, các ghế tương ứng được giải phóng; các vé chưa hủy trong cùng Booking tiếp tục hoạt động bình thường; toàn bộ lịch sử đặt vé và refund được lưu vết đầy đủ.

##### UC-1.12: Quản lý tài khoản cá nhân
*   **Tiền điều kiện:** Khách hàng đã đăng nhập.
*   **Luồng sự kiện chính:** Khách hàng thực hiện cập nhật họ tên, thông tin cá nhân cơ bản hoặc gửi yêu cầu xóa dữ liệu tài khoản.
*   **Hậu điều kiện:** Thông tin tài khoản được cập nhật hoặc đánh dấu xóa trong hệ thống.

##### UC-1.13: Đối soát giao dịch tự động (Reconciliation)
*   **Tiền điều kiện:** Các giao dịch ở trạng thái `PENDING_PAYMENT` được tạo ra trong hệ thống.
*   **Luồng sự kiện chính:**
    1.  Một tiến trình Cron Job được thiết lập chạy định kỳ mỗi 5 phút một lần.
    2.  Hệ thống quét cơ sở dữ liệu để tìm các giao dịch có trạng thái `PENDING_PAYMENT` được tạo trước đó quá 11 phút (nhằm đảm bảo Redis Hard Hold có thời hạn TTL = 10 phút/600 giây của ghế đã hoàn toàn hết hạn, cộng thêm 1 phút buffer an toàn) mà chưa nhận được thông báo IPN từ cổng thanh toán. Mốc thời gian quét này phải luôn đồng bộ và khớp với thời hạn TTL Hard Hold được định nghĩa trong UC-1.6.
    3.  Hệ thống gọi API "Query Transaction Status" của cổng thanh toán tương ứng (VNPay/MoMo) bằng mã tham chiếu giao dịch (`txnRef`).
    4.  *Xử lý kết quả đối chiếu:*
        *   Nếu cổng thanh toán báo "Giao dịch thành công": Hệ thống cập nhật trạng thái đơn vé thành "Đã đặt", tạo vé điện tử và gửi thông báo cho khách hàng (xử lý sự cố mất IPN).
        *   Nếu cổng thanh toán báo "Giao dịch thất bại" hoặc "Chưa thanh toán": Hệ thống cập nhật trạng thái đơn vé thành "Thất bại/Hết hạn" để kết thúc chu trình giao dịch.
*   **Hậu điều kiện:** Tất cả các giao dịch treo đều được đưa về trạng thái cuối cùng (Thành công/Thất bại), đảm bảo tính nhất quán tài chính.

##### UC-1.14: Gửi đánh giá chuyến đi
*   **Tiền điều kiện:** Vé của Khách hàng đã ở trạng thái "Hoàn thành chuyến đi" (chuyến đi thực tế đã kết thúc).
*   **Luồng sự kiện chính:**
    1.  Khách hàng truy cập vào lịch sử đặt vé.
    2.  Chọn vé của chuyến đi đã hoàn thành.
    3.  Khách hàng thực hiện chấm điểm (rating) theo thang điểm từ 1 đến 5 sao và viết nhận xét (comment) cho nhà xe.
    4.  Nhấn nút gửi đánh giá.
    5.  Hệ thống ghi nhận và hiển thị đánh giá công khai NGAY LẬP TỨC (cơ chế hậu kiểm - post-moderation), không yêu cầu Admin duyệt trước khi hiển thị.
*   **Luồng ngoại lệ:**
    *   *Ngoại lệ 1 (Đánh giá trùng lặp):* Khách hàng chỉ được phép gửi đánh giá duy nhất một lần cho mỗi vé xe. Nếu vé đã được đánh giá, nút gửi đánh giá sẽ bị vô hiệu hóa.
    *   *Ngoại lệ 2:* Hệ thống không cho phép gửi đánh giá nếu trạng thái chuyến xe chưa hoàn thành hoặc vé xe đã bị hủy.
*   **Hậu điều kiện:** Đánh giá được ghi nhận và liên kết trực tiếp với UC-2.10 (Nhà xe xem đánh giá) và UC-3.9 (Admin kiểm duyệt đánh giá).

##### UC-1.15: Xem lịch sử đặt vé
*   **Tiền điều kiện:** Khách hàng đã đăng nhập thành công vào hệ thống.
*   **Luồng sự kiện chính:**
    1.  Khách hàng truy cập vào mục "Vé của tôi" hoặc "Lịch sử đặt vé".
    2.  Hệ thống truy vấn và hiển thị danh sách tất cả các vé xe khách hàng đã đặt.
    3.  Hệ thống hiển thị rõ ràng trạng thái thực tế của từng vé: Đang chờ thanh toán, Đã đặt, Đã hoàn thành, Đã hủy.
    4.  Khách hàng có thể bấm vào một vé cụ thể để xem chi tiết thông tin (chuyến đi, biển số xe, mã số ghế, giá vé) và thông tin lịch sử thanh toán tương ứng.
*   **Hậu điều kiện:** Danh sách vé và chi tiết vé được hiển thị chính xác theo dữ liệu thời gian thực.

##### UC-1.16: Yêu cầu Đổi ngày / Đổi chuyến (Reschedule Ticket / Booking — Model Tạo Booking Mới)
*   **Ràng buộc kiến trúc (Invariants):**
    *   Một `Booking` thuộc về đúng 1 `Trip` duy nhất (`Booking.tripId`). Thuộc tính này không thay đổi trong suốt vòng đời Booking.
    *   Toàn bộ `Ticket` thuộc cùng một `Booking` phải có `Ticket.tripId == Booking.tripId`. Không cho phép một `Booking` chứa các `Ticket` thuộc nhiều `Trip` khác nhau.
    *   Một `Ticket` gắn cố định vào 1 `Booking` và 1 `Trip` trong suốt vòng đời — không bao giờ được chuyển `Ticket` cũ sang `Booking` mới hay `Trip` mới.
    *   *Cơ chế bảo vệ ở tầng dữ liệu:* Invariant `Ticket.tripId == Booking.tripId` được **Cơ sở dữ liệu enforce trực tiếp** bằng Composite Foreign Key `tickets(booking_id, trip_id) → bookings(id, trip_id)`. Mọi thao tác INSERT/UPDATE tạo ra vé lệch chuyến — kể cả từ batch job, migration hay code path ngoài luồng nghiệp vụ chuẩn — đều bị Database từ chối. `Ticket.tripId` là bất biến (immutable) sau khi vé được tạo.
*   **Model Reschedule (Canonical):**
    ```
    Old Booking (tripId = oldTrip) → Old Ticket (ISSUED)
                    ↓ [RESCHEDULE]
    New Booking (tripId = newTrip) → New Ticket (ISSUED)
    Old Ticket → status = CANCELLED, cancellationReason = RESCHEDULED
    ```
*   **Tiền điều kiện `[D5]`:** `Ticket` (`oldTicket`) ở trạng thái **`ISSUED`** và người dùng đã đăng nhập vào hệ thống (Cụm tài khoản `CUSTOMER` hoặc `BUS_COMPANY` thông qua giao diện Operator). Vé đã `CHECKED_IN` (khách đã lên xe), đã `COMPLETED` hoặc đã `CANCELLED` **không** được đổi chuyến.
*   **Kiến trúc Reschedule Core (Customer và Operator dùng chung):** Cả Customer tự thực hiện lẫn Operator hỗ trợ khách đều đi qua **cùng một Reschedule Core** (`BookingOrchestrationService.rescheduleTicketsToNewBooking`). Không có business rule Reschedule riêng cho từng actor:
    - **Customer**: tự chọn Ticket, Trip mới, Seat mới qua giao diện người dùng.
    - **Operator** (Nhân viên Nhà xe hỗ trợ): chọn Ticket, Trip mới, Seat mới thay mặt khách qua giao diện Operator. Nếu phát sinh surcharge (`totalNetAdjustment > 0`), hệ thống tạo `PaymentTransaction PENDING_PAYMENT` để Customer thanh toán sau; không tạo business rule đặc biệt cho Operator.
    - Cả hai actor đều áp dụng đầy đủ các policy: PBD-01 (Cutoff), PBD-02 (Fee=0), PBD-03 (Cross-route), PBD-04 (Max 1 lần).
*   **Semantics của `PENDING_PAYMENT` trong Reschedule:** `newBooking = PENDING_PAYMENT` có nghĩa là: ghế mới đang được giữ tạm thời (Hard Hold, TTL = 600 giây), payment chưa hoàn tất. Khi TTL hết mà payment chưa SUCCESS: ghế mới được giải phóng, `newBooking` không được finalize, Old Ticket vẫn ACTIVE, Reschedule attempt **chưa** được tính là thành công (`new_ticket_id = NULL`). Nếu hệ thống khởi động lại hay khách thử lại, Reschedule vẫn có thể được tiến hành mới (PBD-04 không bị block).
*   **Luồng sự kiện chính:**
    1.  Người dùng (Customer tự thực hiện, hoặc Operator hỗ trợ khách) chọn 1 hoặc nhiều `Ticket` (`oldTicket`) trong đơn đặt vé cũ (`oldBooking`) và yêu cầu "Đổi chuyến / Đổi ngày". **`[D1]`** Hệ thống sinh một `rescheduleOperationId` (UUID) đại diện cho **lần đổi vé này** — mọi `RescheduleRecord` phát sinh sau đó đều mang cùng giá trị, cho phép tái dựng chính xác toàn bộ thao tác về sau.
    2.  Hệ thống kiểm tra điều kiện đổi vé theo chính sách hệ thống **V1 `[PBD-01 → PBD-04 CLOSED]`**: (i) **Cutoff** (`PBD-01`) — `currentTime < oldTrip.baseDepartureTime - 2 hours`, không cho phép đổi trong vòng 2 giờ trước giờ khởi hành của chuyến cũ; (ii) **Fee** (`PBD-02`) — `rescheduleFee = 0`, đổi vé miễn phí; (iii) **Cross-route** (`PBD-03`) — chỉ đổi sang `newTrip` có `routeTemplateId == oldTrip.routeTemplateId` **và** cùng BusCompany với `oldTrip`; (iv) **Max 1 lần** (`PBD-04`) — mỗi `Ticket` chỉ được đổi thành công tối đa 1 lần. **`[PBD-04 PATCH]`** PBD-04 **chỉ block khi Ticket đã có một Reschedule FINALIZED/COMPLETED thành công**:
        *   Dấu hiệu finalized thành công là `new_ticket_id IS NOT NULL` (kết quả sau khi Phase 2A hoàn tất).
        *   Khi kiểm tra điều kiện: Nếu tồn tại bản ghi trong `ticket_reschedule_histories` có `old_ticket_id = ticketId` VÀ `new_ticket_id IS NOT NULL` → **REJECT** yêu cầu Reschedule mới.
        *   Nếu chỉ tồn tại bản ghi có `new_ticket_id IS NULL` (attempt trước đó thất bại/hết hạn ở Phase 2B, chưa từng finalized) → **PASS**, vẫn cho phép khách thực hiện Reschedule lại.
        *   New Ticket sau khi tạo không được đổi tiếp.
    3.  Khách hàng chọn chuyến mới (`newTrip`) và vị trí ghế mới (`newSeat`).
    4.  Hệ thống thực hiện Soft/Hard Hold vị trí ghế mới trên `newTrip`.
    5.  Hệ thống tính toán chênh lệch tài chính cho **từng vé được đổi**: **`[PBD-02 CLOSED V1]`** `netAdjustment = newSeatPrice - oldSeatPrice` (`rescheduleFee = 0` trong V1; nếu field `rescheduleFee` vẫn giữ để mở rộng tương lai thì giá trị V1 luôn bằng 0). Khi khách đổi **nhiều vé trong cùng một thao tác**, hệ thống cộng dồn thành **tổng điều chỉnh** của cả thao tác: `totalNetAdjustment = Σ netAdjustment của từng vé`.
    6.  *Khởi tạo Booking mới:* Hệ thống tạo một **`Booking` mới (`newBooking`)** gắn liền với `newTrip` (tuân thủ invariant `Booking.tripId = newTrip`).
    7.  *Xử lý chênh lệch tài chính (theo **tổng** của cả thao tác, không phải từng vé):*
         *   *Tổng chênh lệch dương (totalNetAdjustment > 0):* Khách hàng được chuyển hướng sang Cổng thanh toán để nộp bổ sung **một lần** phần tiền chênh lệch (tạo **duy nhất 1** `PaymentTransaction` loại `RESCHEDULE_SURCHARGE` trỏ về `newBooking`). Sau khi nhận IPN thanh toán thành công, `newBooking` chuyển `PENDING_PAYMENT → CONFIRMED` (transition `PaymentSucceeded`) và hoàn tất đơn mới.
         *   *Tổng chênh lệch âm (totalNetAdjustment < 0):* Hệ thống khởi tạo **một hoặc nhiều** `RefundTransaction` theo financial lineage của `oldBooking` cho phần tiền thừa cần hoàn (xem Rule phân bổ Refund `[HIGH-2]`). **Điều kiện để tiến hành Finalize Reschedule là `RefundTransaction` được TẠO THÀNH CÔNG — không phải chờ `RefundTransaction.COMPLETED`.** Ngay sau khi tạo thành công, `newBooking` chuyển `PENDING_PAYMENT → CONFIRMED` (transition `RescheduleFinalized`). Refund tiếp tục xử lý bất đồng bộ: Gateway/IPN cập nhật `REQUESTED → PROCESSING → COMPLETED` hoặc `FAILED`. Nếu Refund `FAILED`, Reschedule đã hoàn tất vẫn **không** tự động quay ngược vé — đây là vấn đề xử lý tài chính riêng (retry/manual reconciliation).
         *   *Tổng chênh lệch bằng 0 (totalNetAdjustment == 0):* Hệ thống hoàn tất đổi vé ngay lập tức mà **không** phát sinh giao dịch tiền — kể cả khi từng vé lẻ có chênh lệch dương/âm bù trừ lẫn nhau. **`[HIGH-2]`** `newBooking` chuyển `PENDING_PAYMENT → CONFIRMED` (transition `RescheduleFinalized`).
    8.  *Hoàn tất Đổi vé (Finalize):*
        *   **Tạo `Ticket` mới (`newTicket`)** thuộc `newBooking`, trên `newTrip`, mã ghế `newSeat`, giá vé mới (snapshot từ `TripSeatPrice` tại thời điểm đổi). `newTicket` là Entity hoàn toàn mới, không liên quan `booking_id` hay `trip_id` của Old Booking.
        *   **Old Ticket (`oldTicketId`) chuyển sang `status = CANCELLED`** với `cancellationReason = RESCHEDULED`. Old Ticket không thay đổi `booking_id`, không thay đổi `trip_id`, không được tái sử dụng.
        *   Giải phóng vị trí ghế cũ (`TripSeat` trên `oldTrip`) về trạng thái `AVAILABLE`.
        *   Cập nhật vị trí ghế mới (`TripSeat` trên `newTrip`) thành `BOOKED`.
        *   Tạo bản ghi lịch sử đổi vé (`RescheduleRecord` / `ticket_reschedule_histories`) — Entity con của `oldBooking` — lưu đầy đủ: **`rescheduleOperationId`** `[D1]`, `oldBookingId`, `newBookingId`, **`oldTicketId`**, **`newTicketId`**, `oldTripId`, `newTripId`, `oldSeatCode`, `newSeatCode`, `oldSeatPrice`, `newSeatPrice`, `fareDifference`, `rescheduleFee`, `netAdjustmentAmount`, `paymentTxnRef` (nếu surcharge: trỏ PaymentTransaction của New Booking; nếu refund hoặc không phụ thu: `NULL`), `rescheduledAt`. (Các khoản hoàn tiền nếu có được tạo thành 1..N bản ghi `RefundTransaction` độc lập theo financial lineage, không lưu scalar `refundTransactionId` trong `RescheduleRecord`). **`[PBD-02 CLOSED V1]`** `rescheduleFee` vẫn giữ làm field lịch sử nhưng **giá trị V1 luôn bằng 0**; cơ chế Reschedule Fee khác sẽ thuộc phiên bản tương lai. Khi đổi nhiều vé cùng lúc, mỗi cặp vé sinh **một bản ghi riêng** nhưng tất cả mang **cùng `rescheduleOperationId`**.
*   **Hậu điều kiện:** `newTicket` thuộc `newBooking` trên `newTrip` được kích hoạt (`ISSUED`); `oldTicket` ở trạng thái `CANCELLED` (`cancellationReason = RESCHEDULED`); ghế cũ trên `oldTrip` được giải phóng; ghế mới được đặt; lịch sử đổi vé và đối soát tài chính bảo toàn đầy đủ với `oldTicketId` / `newTicketId` rõ ràng.
*   **`[D1]` Ràng buộc kiến trúc — Transaction Boundary (Async Payment):** `rescheduleOperationId` là **định danh nghiệp vụ** đại diện cho toàn bộ lần đổi vé, **không** đồng nghĩa với một database transaction duy nhất. Do payment là bất đồng bộ (chờ IPN), operation bắt buộc trải qua hai pha DB transaction riêng biệt:
    *   **Phase 1 (DB Transaction 1 — kết thúc trước khi chờ Payment Gateway):** Validate điều kiện → Hold Seat mới → Tạo `newBooking` (`PENDING_PAYMENT`). **`[HIGH-2]`** Có 3 nhánh:
        - **`totalNetAdjustment > 0`:** Tạo `PaymentTransaction` (`PENDING_PAYMENT`, loại `RESCHEDULE_SURCHARGE`, thuộc `newBooking`) → Tạo `RescheduleRecord` (**`[HIGH-1]`** `new_ticket_id = NULL`, chứa `payment_txn_ref` trỏ giao dịch surcharge của `newBooking`) → COMMIT. Chờ Payment Gateway / IPN.
        - **`totalNetAdjustment == 0`:** **KHÔNG tạo PaymentTransaction** → Tạo `RescheduleRecord` (**`[HIGH-1]`** `new_ticket_id = NULL`, `payment_txn_ref = NULL`) → COMMIT. Không cần chờ Payment Gateway.
        - **`totalNetAdjustment < 0`:** **KHÔNG tạo PaymentTransaction surcharge** → Tạo `RescheduleRecord` (**`[HIGH-1]`** `new_ticket_id = NULL`, `payment_txn_ref = NULL`) → Khởi tạo **một hoặc nhiều `RefundTransaction`** (`booking_id = newBooking.id`, `ticket_id = oldTicketId`, do New Ticket chưa tồn tại ở Phase 1; mỗi record trỏ đúng 1 `payment_txn_ref` source thực tế được hoàn trong financial lineage) theo financial lineage (Cumulative Refund Invariant) **`[HIGH-2]`** → COMMIT. **`RefundTransaction` tạo thành công là điều kiện để tiến hành Phase 2A ngay lập tức — không chờ Payment Gateway, không chờ `RefundTransaction.COMPLETED`.**
    *   Trạng thái sau Phase 1: ghế mới đang HardHeld, `newBooking` PENDING_PAYMENT, Old Ticket vẫn ACTIVE.
    *   **Phase 2A — Finalize (DB Transaction 2):**
        - **`totalNetAdjustment > 0` (khi IPN thành công):** Tạo `New Ticket` → **UPDATE `ticket_reschedule_histories.new_ticket_id = newTicketId`** → Old Ticket → `CANCELLED` (`RESCHEDULED`) → New Ticket → `ISSUED` → Ghế cũ → AVAILABLE → Ghế mới → BOOKED → **`newBooking → CONFIRMED` (transition `PaymentSucceeded`)** → COMMIT.
        - **`totalNetAdjustment == 0` (ngay lập tức):** Tạo `New Ticket` → **UPDATE `ticket_reschedule_histories.new_ticket_id = newTicketId`** → Old Ticket → `CANCELLED` (`RESCHEDULED`) → New Ticket → `ISSUED` → Ghế cũ → AVAILABLE → Ghế mới → BOOKED → **`newBooking → CONFIRMED` (transition `RescheduleFinalized`)** → COMMIT. **`[HIGH-2]`** `RescheduleFinalized` là transition nghiệp vụ: `PENDING_PAYMENT → CONFIRMED` khi Reschedule không phát sinh giao dịch tài chính.
        - **`totalNetAdjustment < 0` (ngay lập tức — sau khi Phase 1 tạo `RefundTransaction` thành công):** Tạo `New Ticket` → **UPDATE `ticket_reschedule_histories.new_ticket_id = newTicketId`** → Old Ticket → `CANCELLED` (`RESCHEDULED`) → New Ticket → `ISSUED` → Ghế cũ → AVAILABLE → Ghế mới → BOOKED → **`newBooking → CONFIRMED` (transition `RescheduleFinalized`)** → COMMIT. **`[HIGH-2]`** Transaction boundary Phase 2A: `Create RefundTransaction (Phase 1) → Finalize Reschedule → COMMIT`. Sau COMMIT: Gateway/IPN cập nhật `RefundTransaction`: `REQUESTED → PROCESSING → COMPLETED` hoặc `FAILED` — hoàn toàn bất đồng bộ. **Tuyệt đối không** dùng trạng thái Refund để giữ hoặc quyết định `newBooking`; **không** rollback Reschedule chỉ vì Refund xử lý chậm hoặc `FAILED`. Nếu Refund `FAILED`, Reschedule đã hoàn tất vẫn giữ nguyên — xử lý ở tầng tài chính riêng.
    *   **Phase 2B — Rollback (DB Transaction 2, khi payment timeout/thất bại — chỉ áp dụng cho nhánh `totalNetAdjustment > 0`):** Giải phóng ghế mới (Held → AVAILABLE) → Old Ticket vẫn giữ nguyên `ISSUED` (ACTIVE) → **`newBooking → FAILED`** → COMMIT. **`[HIGH-1]`** Không tạo New Ticket / không điền `new_ticket_id` (record giữ `NULL`).
    *   Trạng thái giữa Phase 1 và Phase 2 là **nhất quán và bền vững** (không dở dang): `newBooking.status = PENDING_PAYMENT`, hệ thống có thể khởi động lại và tái xử lý IPN nhờ `rescheduleOperationId`. **`PENDING_PAYMENT` có nghĩa là ghế mới đang được giữ tạm thời (Hard Hold TTL = 600 giây), payment chưa hoàn tất — không phải trạng thái lưu trữ vĩnh viễn.** Khi TTL hết mà payment chưa SUCCESS: ghế mới giải phóng, `newBooking` không được finalize, Old Ticket vẫn ACTIVE, Reschedule attempt này chưa thành công (`new_ticket_id = NULL`).


---

#### 3.2.1.X: Đặc tả cơ chế xác nhận thanh toán (IPN) & Khóa đồng thời Hoàn tiền (Refund Concurrency)
Nhằm đảm bảo tính tin cậy tuyệt đối cho các giao dịch tài chính, hệ thống thiết lập cơ chế xác nhận thanh toán hai lớp và bảo vệ hạn mức hoàn tiền:
*   **Phân biệt 2 kênh nhận kết quả thanh toán:**
    *   *Return URL (Client redirect):* Kênh redirect trình duyệt/ứng dụng của người dùng ngay sau khi thanh toán xong. Kênh này chỉ được dùng để hiển thị giao diện UI thông báo trạng thái "Đang xử lý/Kiểm tra giao dịch" cho người dùng. Tuyệt đối **không** dùng Return URL để xử lý logic đơn hàng (không cập nhật DB thành công, không tạo vé) vì luồng Client dễ bị can thiệp, sửa đổi tham số, hoặc bị ngắt kết nối giữa chừng.
    *   *IPN (Server-to-Server):* Kênh truyền thông tin trực tiếp giữa server của cổng thanh toán và server của hệ thống Vexere Clone. Đây là nguồn xác nhận tin cậy duy nhất (**Source of Truth**) để hệ thống cập nhật trạng thái đặt vé và kích hoạt tạo vé điện tử.
*   **Yêu cầu ACK đúng định dạng:** Backend của hệ thống khi nhận request IPN từ cổng thanh toán phải phản hồi (ACK) chính xác định dạng JSON quy định bởi cổng thanh toán đó (Ví dụ đối với VNPay: `{"RspCode": "00", "Message": "Confirm Success"}`). Nếu backend trả về sai định dạng, lỗi HTTP 5xx, hoặc bị timeout, cổng thanh toán sẽ tự động gửi lại IPN nhiều lần theo chu kỳ tăng dần (gây lãng phí tài nguyên và rủi ro race condition).
*   **Yêu cầu Idempotency (Tránh xử lý trùng lặp):** 
    *   Trước khi thực hiện bất kỳ thao tác nghiệp vụ nào khi nhận IPN, backend phải kiểm tra trạng thái hiện tại của giao dịch trong DB. Nếu giao dịch đã ở trạng thái khác `PENDING_PAYMENT` (ví dụ đã ở trạng thái `SUCCESS` hoặc `CANCELLED`), hệ thống lập tức bỏ qua logic xử lý và chỉ trả về mã ACK thành công để kết thúc luồng. Điều này ngăn chặn việc tạo trùng vé hoặc gửi tin nhắn SMS/Email trùng lặp khi nhận IPN nhiều lần.
    *   Hệ thống sử dụng kỹ thuật **Pessimistic Lock** (`SELECT ... FOR UPDATE`) khi truy vấn thông tin giao dịch theo `txnRef` ở bước đầu tiên của luồng xử lý IPN để ngăn chặn race condition trong trường hợp có hai request IPN đến gần như đồng thời.
*   **Ràng buộc hạn mức Hoàn tiền cộng dồn & Khóa đồng thời (Cumulative Refund Invariant & Concurrency Protection):**
    *   *Ràng buộc tài chính bất biến:* Tổng tiền tất cả các lần hoàn (`RefundTransaction`) đang chiếm hạn mức (`status IN (REQUESTED, PROCESSING, COMPLETED)`) liên kết với một giao dịch thanh toán gốc (`payment_txn_ref = X`) tuyệt đối không được vượt quá số tiền thanh toán ban đầu:
        $$\sum \text{refund\_transactions.amount}_{\text{payment\_txn\_ref}=X,\ \text{status} \in \{\text{REQUESTED, PROCESSING, COMPLETED}\}} \le \text{payment\_transactions.amount}_{\text{txn\_ref}=X}$$
    *   *Khóa đồng thời (Pessimistic Lock):* Khi xử lý bất kỳ yêu cầu hoàn tiền nào (Hủy vé toàn phần / Hủy vé từng phần / Đổi vé hoàn tiền thừa), backend bắt buộc phải thực hiện Pessimistic Lock trên bản ghi giao dịch gốc: `SELECT * FROM payment_transactions WHERE txn_ref = X FOR UPDATE`. Sau khi khóa thành công bản ghi thanh toán, hệ thống mới thực hiện tính `SUM(amount)` các `RefundTransaction` có `status IN ('REQUESTED', 'PROCESSING', 'COMPLETED')` và đối chiếu hạn mức trước khi ghi thêm bản ghi `RefundTransaction` mới. Lock, SUM, validation và INSERT phải nằm trong cùng một database transaction. Cơ chế này đảm bảo hai yêu cầu hoàn tiền đồng thời không cùng đọc một tổng số tiền hoàn cũ để tạo hai giao dịch hoàn vượt hạn mức gốc.
    *   *Semantics `RefundStatus` khi tính tổng:* Khi validate hạn mức hoàn tiền, hệ thống phải tính tổng (`SUM`) tất cả `RefundTransaction` có `status IN (REQUESTED, PROCESSING, COMPLETED)`. `FAILED` không chiếm hạn mức (transaction thất bại không giữ tiền). Cụ thể:
        - `REQUESTED`: đã reserve hạn mức — tính vào SUM.
        - `PROCESSING`: đang xử lý với cổng — tính vào SUM.
        - `COMPLETED`: đã hoàn tiền thành công — tính vào SUM.
        - `FAILED`: thất bại, không chiếm hạn mức — **KHÔNG tính vào SUM**.
*   **RefundCompleted ≠ Booking CANCELLED & Canonical Rule khi Booking COMPLETED:**
    *   Hoàn tất một `RefundTransaction` (`status = COMPLETED`) **không đồng nghĩa** với việc `Booking` chuyển sang `CANCELLED`. `Booking.status` chỉ chuyển `CANCELLED` khi **100% `Ticket` con của Booking đều ở trạng thái `CANCELLED`**. Trong Partial Cancellation (hủy 1 Ticket trong Booking nhiều vé), `Booking.status` vẫn giữ `CONFIRMED` sau khi RefundTransaction của Ticket đó hoàn tất.
    *   **Canonical Rule — Chốt duy nhất:** *Booking COMPLETED không cho phép tạo yêu cầu Refund mới, nhưng không ngăn RefundTransaction đã tồn tại tiếp tục xử lý và hoàn tất bất đồng bộ.*
        1. **Tạo Refund mới:** Nếu Booking đã `COMPLETED` thì không được tạo `RefundTransaction` mới (áp dụng tại thời điểm tạo refund request; vé đã `COMPLETED` không được hủy/đổi).
        2. **Refund đã tồn tại:** Nếu `RefundTransaction` đã được tạo trước khi Booking chuyển sang `COMPLETED`, nó vẫn được phép tiếp tục luồng async hiện tại: `PROCESSING → COMPLETED` hoặc `PROCESSING → FAILED`. Backend tuyệt đối **không** kiểm tra `booking.status == COMPLETED` để chặn một `RefundTransaction` đang xử lý dở dang.
*   **Rule phân bổ Refund theo Financial Lineage cho Rescheduled Ticket `[HIGH-2]`:**
    *   *Bối cảnh:* Một Rescheduled Ticket có thể sở hữu nhiều `PaymentTransaction` trong financial lineage (ví dụ: `Payment INITIAL` của `oldBooking` và `Payment RESCHEDULE_SURCHARGE` của `newBooking`). Khi hủy vé đã đổi (Rescheduled Ticket), số tiền hoàn có thể vượt quá hạn mức của một `PaymentTransaction` đơn lẻ và phải phân bổ từ nhiều `PaymentTransaction` trong lineage.
    *   *Semantics Canonical của `RefundTransaction.bookingId` và `paymentTxnRef`:*
        - Khi refund phát sinh từ Reschedule (cả khi giảm giá vé ở Phase 1 lẫn khi hủy vé đã đổi sau này): **`RefundTransaction.bookingId = NEW BOOKING`** (booking context của thao tác reschedule hiện tại).
        - **`RefundTransaction.paymentTxnRef`** trỏ tới `PaymentTransaction` **THỰC TẾ ĐƯỢC HOÀN TIỀN** (có thể thuộc `oldBooking` trong financial lineage, không nhất thiết thuộc `newBooking`).
        - Do đó **KHÔNG** giả định `RefundTransaction.bookingId == PaymentTransaction.bookingId`. Hai quan hệ này độc lập, **KHÔNG** sử dụng Composite FK `(booking_id, payment_txn_ref)` trên `refund_transactions`.
    *   *Financial Lineage Validation Contract (Application Layer bắt buộc):*
        - Trước khi tạo bất kỳ bản ghi `RefundTransaction` nào cho Reschedule, Application Layer **BẮT BUỘC** phải validate financial lineage trước.
        - Backend truy vết lineage theo chuỗi:
          $$\text{New Ticket} \rightarrow \text{RescheduleRecord} \rightarrow \text{Old Ticket} \rightarrow \text{Old Booking} \rightarrow \text{PaymentTransaction lineage}$$
        - **Recursive Reschedule Case:** Nếu `Old Ticket` vốn là kết quả của một lần Reschedule trước đó, Application Layer phải tiếp tục truy ngược đệ quy:
          $$\text{Old Ticket} \rightarrow \text{previous RescheduleRecord} \rightarrow \text{previous Old Ticket} \rightarrow \text{previous Old Booking} \rightarrow \text{PaymentTransaction lineage}$$
          cho đến khi xác định được `PaymentTransaction` hợp lệ đủ điều kiện hoàn tiền trong lineage.
        - **Chỉ sau khi lineage validation thành công** mới được phép khởi tạo `RefundTransaction`. Nếu validation thất bại $\rightarrow$ reject thao tác, **KHÔNG** insert `RefundTransaction`.
        - **KHÔNG** tạo thêm entity/bảng `PaymentAllocation`. Lineage được Application Layer reconstruct logic từ dữ liệu hiện có.
    *   *Chốt business rule phân bổ:*
        - Một Rescheduled Ticket có thể tạo **nhiều `RefundTransaction`** nếu số tiền cần refund phải phân bổ từ nhiều `PaymentTransaction` trong financial lineage.
        - Mỗi `RefundTransaction` chỉ tham chiếu đúng **một `PaymentTransaction`** qua `payment_txn_ref`.
        - Tổng số tiền Refund của từng `PaymentTransaction` không được vượt quá phần tiền còn được phép refund của `PaymentTransaction` đó (`remaining_limit = payment.amount - SUM(requested/processing/completed refunds)`).
        - Refund chỉ được phân bổ vào các `PaymentTransaction` thuộc financial lineage hợp lệ của Ticket đang refund.
        - Không coi toàn bộ `Payment INITIAL` của Booking cũ là tiền của Rescheduled Ticket; phải giới hạn theo financial lineage của Ticket (chỉ lấy phần giá trị vé gốc `oldTicket.seatPrice`, không lấy phần tiền của các vé khác trong Booking cũ).
        - Không thêm bảng `PaymentAllocation`, không thêm field mới để lưu allocation. Allocation là logic nghiệp vụ được Application tính toán từ financial lineage hiện có.
        - Nếu cần nhiều source thì tạo nhiều `RefundTransaction`, mỗi record ứng với một `PaymentTransaction` source.
    *   *Thứ tự phân bổ deterministic (mới nhất trước):*
        1. `RESCHEDULE_SURCHARGE` gần nhất trước.
        2. Sau đó mới đến PaymentTransaction nguồn trước đó trong lineage (ngược dần về `INITIAL`).
        - Tiếp tục phân bổ đến khi đủ số tiền cần refund.
        - Nếu một source chỉ còn một phần hạn mức refund thì chỉ phân bổ phần còn lại vào source đó rồi tiếp tục sang source trước.
    *   *Ví dụ canonical bắt buộc đúng (Hủy vé đã đổi — Rescheduled Ticket Cancellation):*
        - Booking A: Ticket B = 500k, Ticket A = 100k, Ticket C = 100k. Payment INITIAL = 700k.
        - B đổi sang B2 = 600k, Payment RESCHEDULE_SURCHARGE = 100k.
        - Khi B2 cần refund 480k:
          - `PAY_SURCHARGE` = 100k (còn hạn mức 100k)
          - `PAY_INITIAL` lineage hợp lệ = 500k (phần của Ticket B, không lấy 200k của A/C)
          - Refund cần = 480k
          → `RefundTransaction` #1: 100k → trỏ `payment_txn_ref` của PAY_SURCHARGE, `bookingId = Booking B` (ticket_id = B2.id)
          → `RefundTransaction` #2: 380k → trỏ `payment_txn_ref` của PAY_INITIAL, `bookingId = Booking B` (ticket_id = B2.id)
    *   *Semantics `RefundTransaction.ticket_id` trong Reschedule Refund (totalNetAdjustment < 0 tại Phase 1):*
        - Tại Phase 1, New Ticket chưa tồn tại (`new_ticket_id = NULL`). Do đó, `RefundTransaction.ticket_id` bắt buộc gán bằng **`oldTicketId`**.
        - Tuyệt đối **không dùng `newTicketId`** cho RefundTransaction tại Phase 1 vì New Ticket chưa được tạo.
        - Sau khi New Ticket được tạo ở Phase 2A, New Ticket sẽ truy ngược financial lineage qua: `newTicket -> RescheduleRecord -> oldTicket`, từ đó xác định các `RefundTransaction` đã phát sinh trên Old Ticket.
        - `ticket_id` của `RefundTransaction` vẫn là **anchor** của Ticket mà khoản refund phát sinh từ lineage của nó.
        - *Ví dụ canonical Reschedule Refund giảm giá vé:*
          - Old Ticket B = 500k $\rightarrow$ Reschedule sang chuyến mới giá 400k $\rightarrow$ Refund chênh lệch cần = 100k.
          - Phase 1: New Ticket chưa tồn tại $\rightarrow$ Tạo `RefundTransaction`: `booking_id = newBooking.id`, `ticket_id = Old Ticket B`, `amount = 100k`, `payment_txn_ref =` Payment source hợp lệ trong lineage (INITIAL của Old Booking).
          - Phase 2A: Tạo New Ticket B2, cập nhật `ticket_reschedule_histories.new_ticket_id = B2.id`, Finalize Reschedule.
    *   *Bảo lưu các invariant:*
        - Cumulative refund invariant trên từng `PaymentTransaction` giữ nguyên;
        - `REQUESTED/PROCESSING/COMPLETED` chiếm hạn mức, `FAILED` không chiếm;
        - Pessimistic Lock (`SELECT ... FOR UPDATE`) trên các `PaymentTransaction` liên quan theo thứ tự xác định để chống deadlock;
        - `ticketId` là anchor khi Refund gắn với Ticket cụ thể (với Partial Cancellation là Ticket bị hủy; với Reschedule Refund tại Phase 1 là `oldTicketId` vì New Ticket chưa tồn tại);
        - `payment_txn_ref` và `booking_id` vẫn là 2 FK độc lập, không khôi phục Composite FK cũ.
*   **Xác thực chữ ký (Signature Verification):** Backend bắt buộc phải tính toán lại mã băm (checksum) của toàn bộ tham số nhận được trong request IPN với Secret Key (Hash Key) cấu hình trong hệ thống và đối chiếu với tham số signature nhận được. Nếu chữ ký không khớp, lập tức từ chối giao dịch và ghi log cảnh báo xâm nhập.
*   **PaymentTransaction Cardinality:** Một `Booking` có thể liên kết với nhiều `PaymentTransaction`: **tối đa 1 giao dịch loại `INITIAL`** (thanh toán đặt vé lần đầu) và **0..N giao dịch loại `RESCHEDULE_SURCHARGE`** (mỗi lượt đổi vé có surcharge tạo 1 giao dịch bổ sung, thuộc `newBooking`). Database constraint: Partial Unique Index `(booking_id) WHERE txn_type = 'INITIAL'`.

---

#### 3.2.2 Phân hệ Nhà xe (Bus Company)

##### UC-2.1: Quản lý thông tin nhà xe
*   **Tiền điều kiện:** Nhà xe đăng nhập hệ thống quản lý.
*   **Luồng sự kiện chính:** Xem, cập nhật thông tin giới thiệu, địa chỉ, số hotline và album ảnh của nhà xe.
*   **Hậu điều kiện:** Thông tin được cập nhật và lưu trữ.

##### UC-2.2: Quản lý danh sách xe
*   **Tiền điều kiện:** Nhà xe đăng nhập hệ thống quản lý.
*   **Luồng sự kiện chính:** CRUD danh sách các xe thuộc nhà xe (biển số, số lượng ghế, loại xe VIP/Thường) và album ảnh xe.
*   **Hậu điều kiện:** Danh sách xe được cập nhật.

##### UC-2.3: Quản lý Cấu hình Địa điểm Nhà xe (`BusCompanyLocationConfig`)
*   **Tiền điều kiện:** Nhà xe đăng nhập hệ thống quản lý.
*   **Luồng sự kiện chính:** 
    1. Danh mục địa điểm (`Location`) là dữ liệu dùng chung toàn hệ thống do Admin quản lý (xem UC-3.3). Nhà xe không tạo mới địa điểm master data.
    2. Nhà xe thực hiện CRUD các bản ghi Cấu hình Địa điểm (`BusCompanyLocationConfig`) riêng cho công ty mình bằng cách chọn một `Location` từ danh mục dùng chung và bổ sung thông tin vận hành riêng: Tên hiển thị riêng (`displayName`), chọn bật/tắt quyền đón/trả trực tiếp tại điểm dừng (`acceptsPickup`, `acceptsDropoff`), số điện thoại hotline đón, ghi chú hướng dẫn gặp tài xế, vị trí cổng/cột/bãi đỗ/landmark. *(Lưu ý: Cờ acceptsPickup/acceptsDropoff biểu diễn việc đón/trả trực tiếp tại chính điểm dừng đó; dịch vụ đón/trả khách từ khu vực bên ngoài bằng xe trung chuyển được quản lý độc lập tại Shuttle Service ở UC-2.5).*
    3. **Quy tắc Soft Disable (Grandfather Rule):**
       - Khi cấu hình địa điểm ở trạng thái `ACTIVE`: Được phép hiển thị và chọn khi tạo mới hoặc cập nhật điểm dừng tuyến mẫu (`RouteTemplateStop`).
       - Khi cấu hình địa điểm chuyển sang `DISABLED`: Hệ thống chặn không cho chọn trong bất kỳ thao tác tạo mới hoặc chỉnh sửa `RouteTemplateStop` nào kể từ thời điểm đó.
       - Các `RouteTemplateStop` đã tham chiếu trước đó, các chuyến đi (`Trip`) đã tạo và các snapshot `TripPoint` giữ nguyên 100% không bị ảnh hưởng (bảo vệ tính toàn vẹn lịch sử, không cascade update).
    4. **Quy tắc Bất biến của cấu hình đã từng được sử dụng `[D3]`:**
       - Khi cấu hình **chưa từng được** bất kỳ điểm dừng tuyến mẫu (`RouteTemplateStop`) nào sử dụng: Nhà xe được phép sửa mọi thông tin, **kể cả** chọn lại `Location` khác.
       - Ngay khi cấu hình **đã từng được** ít nhất một điểm dừng tuyến mẫu sử dụng: hệ thống **khóa `Location`** của cấu hình đó **vĩnh viễn**. Nhà xe vẫn sửa được thông tin vận hành (tên hiển thị, hotline, cổng, nền đỗ, hướng dẫn...), nhưng **không được** trỏ cấu hình sang một địa điểm khác. Muốn dùng địa điểm khác, Nhà xe phải **tạo một cấu hình mới**.
       - **Khóa là vĩnh viễn — xóa điểm dừng KHÔNG mở khóa lại:** nếu sau này toàn bộ điểm dừng tham chiếu bị xóa (hoặc bị xóa theo khi xóa tuyến mẫu), cấu hình **vẫn giữ nguyên trạng thái khóa**. Hệ thống ghi nhận trạng thái "đã từng được sử dụng" bằng một dấu mốc **chỉ ghi một lần**, không bao giờ được gỡ bỏ.
       - *Lý do:* các tuyến mẫu và lịch sử chuyến đi xác định địa điểm thông qua cấu hình này. Nếu chỉ kiểm tra "hiện tại có điểm dừng nào dùng không", thì việc xóa hết điểm dừng sẽ khiến cấu hình mở khóa trở lại và cho phép đổi địa điểm — làm sai lệch ý nghĩa của toàn bộ dữ liệu lịch sử đã tham chiếu tới nó.
       - Lưu ý: sửa thông tin vận hành **không** làm thay đổi các chuyến đi đã tạo — thông tin hiển thị của chuyến đã được sao chép sang `TripPoint` tại thời điểm tạo chuyến (xem UC-2.5).
*   **Quy tắc Quyền sở hữu dữ liệu (Ownership):** `BusCompanyLocationConfig` là **dữ liệu riêng** của đúng một Nhà xe. Nhà xe chỉ được xem, sửa và sử dụng cấu hình do chính mình tạo; **không** được tham chiếu cấu hình của Nhà xe khác trong bất kỳ dữ liệu nào (đặc biệt là điểm dừng tuyến mẫu — xem UC-2.5). Ngược lại, `Location` bên dưới cấu hình vẫn là **dữ liệu dùng chung**: nhiều Nhà xe hoàn toàn có thể cùng chọn một `Location` và tạo cấu hình vận hành riêng biệt của mình tại địa điểm đó. **Quyền sở hữu là bất biến:** một cấu hình đã tạo **không bao giờ** được chuyển sang Nhà xe khác — quy tắc này áp dụng tương tự cho Phương tiện (`Vehicle`), Tuyến mẫu (`RouteTemplate`) và Chính sách hủy (`CancellationPolicy`). Nhờ vậy không thể lách quy tắc sở hữu bằng cách đổi chủ của dữ liệu cha sau khi đã có dữ liệu con tham chiếu.
*   **Hậu điều kiện:** Cấu hình địa điểm của Nhà xe được ghi nhận, tuân thủ nguyên tắc bảo vệ dữ liệu lịch sử và ranh giới sở hữu giữa các Nhà xe.

##### UC-2.4: Quản lý sơ đồ ghế nhà xe
*   **Tiền điều kiện:** Nhà xe đăng nhập.
*   **Luồng sự kiện chính:** 
    1. Nhà xe chọn một sơ đồ mẫu chuẩn có sẵn do Admin công bố (UC-3.4), tương ứng đúng số lượng ghế/tầng/hàng/cột của xe thực tế. Hệ thống kiểm tra các giới hạn kích thước khung hình (`maxFloor`, `maxRows`, `maxColumns`) và tự động clone (sao chép) toàn bộ cấu trúc các ô ghế mẫu (`TemplateSeatSlot`) thành các bản ghi gán vị trí ghế (`SeatPositionAssignment`) riêng cho xe — Nhà xe KHÔNG được chỉnh sửa cấu trúc lưới (không thêm/bớt hàng, cột, tầng).
    2. Sau khi có lưới ghế, nhà xe thực hiện gán (tick/paint) loại ghế cho từng vị trí ghế trong lưới, chọn từ danh mục loại ghế chuẩn hóa do Admin quản lý (VIP, Thường, Giường đơn, Giường đôi...).
    3. **Quản lý trạng thái vật lý của ghế (`status`):** Nhà xe có thể cập nhật trạng thái vật lý/vận hành lâu dài của từng vị trí ghế trên xe (`ACTIVE`, `BROKEN`, `DISABLED`, `MAINTENANCE`) để tạm khóa các ghế bị hỏng vật lý trên xe thực tế. Trạng thái vật lý này độc lập hoàn toàn với trạng thái đặt chỗ real-time (`TripSeat.status`) của từng chuyến đi.
*   **Hậu điều kiện:** Sơ đồ ghế của xe được ghi nhận, bao gồm danh sách các vị trí ghế clone từ mẫu Admin và loại ghế/trạng thái vật lý đã gán.
*   **Lý do thiết kế:** Khóa cấu trúc lưới đảm bảo chuẩn hóa layout giữa các nhà xe, là điều kiện tiên quyết để thuật toán Ghép ghế bán tự động (UC-2.5, Quy tắc 1) hoạt động chính xác khi đổi xe khẩn cấp.

##### UC-2.5: Quản lý Tuyến mẫu (`RouteTemplate`), Khởi tạo Chuyến đi (`Trip`), Shuttle Service & Ghép ghế bán tự động
*   **Tiền điều kiện:** Nhà xe đăng nhập.
*   **Luồng sự kiện chính:**
    1.  **Quản lý Tuyến mẫu (`RouteTemplate`):** Nhà xe tạo lập tuyến đường mẫu cố định:
        - Khai báo `originLocationId` và `destinationLocationId` làm **Default Representative Locations (Search Anchors / Fallback)** của tuyến.
        - Khai báo danh sách điểm dừng vận hành (`RouteTemplateStop`) theo thứ tự `sequence`. Hệ thống tự động gọi Routing API (như Google Maps) để **tính thời lượng di chuyển dự kiến giữa hai điểm dừng liên tiếp** (`estimatedTravelDurationFromPreviousStopMinutes`). **Nhà xe không có quyền chỉnh sửa/ghi đè giá trị này**. Stop đầu tiên (`sequence = 1`) luôn có `estimatedTravelDurationFromPreviousStopMinutes = 0` (NOT NULL). Không dùng giờ tuyệt đối hay cumulative duration tính từ điểm xuất phát.
        - **Cấu hình Dịch vụ Xe trung chuyển (`RouteTemplateShuttleService`):** Khai báo dịch vụ Đón (`PICKUP`) và Trả (`DROPOFF`) độc lập. **`[MEDIUM-4]`** Mỗi Tuyến mẫu có tối đa **0..1 PICKUP** và tối đa **0..1 DROPOFF** Shuttle Service (`UNIQUE(routeTemplateId, shuttleType)`) — các điểm/ lựa chọn mà khách nhìn thấy trong UI thuộc về service đó và **KHÔNG** được hiểu thành nhiều Shuttle Service độc lập. Mỗi dịch vụ trung chuyển bắt buộc sở hữu `referenceStop` là mốc thời gian vận hành chính do **Nhà xe tự chọn thủ công** từ các `RouteTemplateStop` thuộc tuyến (NOT NULL, không mặc định/suy luận từ điểm cuối hay origin/destination). Khai báo `shuttleOffsetMinutes`, phạm vi phục vụ `coverageAreaDescription` (văn bản mô tả, không tạo Location entity riêng), loại phí `pricingType` (`FREE` ở V1, sẵn sàng mở rộng `PAID`/`feeAmount` ở V2). Không xây dựng Voucher/Discount System.
        - Khai báo khung giá vé cho từng loại ghế (`RouteTemplateSeatPrice`).
    2.  **Khởi tạo Chuyến đi (`Trip`):** Khi khởi tạo một chuyến đi thực tế từ Tuyến mẫu, Nhà xe nhập **Ngày chạy** và **Giờ xuất phát gốc** (`TripSchedule.baseDepartureTime`). Hệ thống thực hiện snapshot bất biến:
        - Clone danh sách điểm dừng `RouteTemplateStop` thành danh sách `TripPoint` trên `Trip`. Hệ thống tự động tính `TripPoint.eta` bằng cách cộng dồn tuần tự từng đoạn theo sequence: `TripPoint[1].eta = baseDepartureTime` (vì duration của stop 1 = 0), `TripPoint[i].eta = TripPoint[i-1].eta + Stop[i].estimatedTravelDurationFromPreviousStopMinutes` (với i > 1). Đồng thời **sao chép thông tin vận hành** từ Cấu hình Địa điểm (`BusCompanyLocationConfig`) sang `TripPoint`: tên hiển thị, cờ cho đón/trả trực tiếp, hotline, hướng dẫn gặp tài xế, cổng, nền đỗ, mốc nhận biết. Các giá trị này **bất biến** sau khi chuyến được tạo và là nguồn duy nhất để hiển thị cho khách (không đọc lại cấu hình hiện hành).
        - Clone danh sách `RouteTemplateShuttleService` thành `TripShuttleService` trên `Trip`. Thời gian hiển thị dịch vụ trung chuyển (`displayTime`) được snapshot tự động:
          - Đón khách (`PICKUP`): `TripShuttleService.displayTime = TripPoint(referenceStop).eta - shuttleOffsetMinutes`
          - Trả khách (`DROPOFF`): `TripShuttleService.displayTime = TripPoint(referenceStop).eta + shuttleOffsetMinutes`
        - Clone bảng giá vé theo loại ghế `RouteTemplateSeatPrice` thành `TripSeatPrice` trên `Trip` (dùng làm nguồn duy nhất để tính tiền vé khi đặt chỗ, không tồn tại cột `baseFare`). **`[D7]`** `TripSeatPrice` **bất biến** sau khi chuyến được tạo; khi phát hành vé, giá được **sao chép sang từng `Ticket`** (`Ticket.seatPrice`) làm bản ghi lịch sử cho hoàn tiền/đối soát.
        - Clone sơ đồ vị trí ghế của xe được gán thành danh sách ghế chuyến (`TripSeat`).
        - *Bảo vệ dữ liệu lịch sử:* Mọi thay đổi sau đó đối với `RouteTemplate` KHÔNG làm thay đổi các `Trip` cũ đã khởi tạo.
    3.  *Khi xảy ra sự cố đổi xe khẩn cấp cho chuyến đang chạy:* Nhà xe chọn chuyến chạy và gán xe dự phòng mới có sơ đồ ghế khác. Hệ thống tự động kích hoạt **Thuật toán ghép ghế bán tự động (Semi-automatic Seat Mapping)**:
        *   *Quy tắc 1: Khớp loại ghế giống hệt:* Ưu tiên gán khách hàng sang vị trí mới có loại ghế tương đương.
        *   *Quy tắc 2: Thứ tự ưu tiên FIFO:* Ưu tiên xử lý ghép ghế trước cho khách hàng đặt vé/thanh toán sớm nhất.
        *   *Quy tắc 3: Tự động gán:* Nếu tất cả khách hàng đều tìm được ghế tương đương khớp 100% -> Hệ thống tự động lưu gán ghế mới và thông báo cho khách qua SMS/Email.
        *   *Quy tắc 4: Fallback thủ công:* Nếu thiếu ghế tương đương cho bất kỳ hành khách nào -> Chuyển toàn bộ nhóm bị ảnh hưởng sang "Chờ xếp xe thủ công" để nhân viên điều hành trực tiếp xử lý.
*   **Quy tắc Quyền sở hữu dữ liệu (Ownership):** Toàn bộ dữ liệu vận hành phải thuộc **cùng một Nhà xe**:
    - *Điểm dừng tuyến mẫu:* Mỗi `RouteTemplateStop` chỉ được chọn `BusCompanyLocationConfig` do **chính Nhà xe sở hữu tuyến mẫu** tạo ra. Chọn cấu hình của Nhà xe khác bị hệ thống từ chối. (`Location` bên dưới vẫn là danh mục dùng chung — xem UC-2.3.)
    - *Chuyến đi và phương tiện:* Chuyến đi chỉ được gán `Vehicle` thuộc đội xe của chính Nhà xe đó — kể cả trong luồng đổi xe khẩn cấp ở bước 3.
    - *Chuyến đi và tuyến mẫu:* Nhà xe chỉ được khởi tạo chuyến đi từ `RouteTemplate` của chính mình.
    - Các ràng buộc này được kiểm tra khi lưu dữ liệu; hệ thống từ chối mọi thao tác vi phạm ranh giới sở hữu giữa các Nhà xe.
*   **Hậu điều kiện:** Tuyến mẫu và chuyến đi được tạo lập đầy đủ dữ liệu snapshot bất biến; sơ đồ ghế chuyến đi được cập nhật an toàn khi đổi xe; mọi dữ liệu tham chiếu đều thuộc đúng Nhà xe sở hữu.

##### UC-2.6: Đặt vé thủ công
*   **Tiền điều kiện:** Nhà xe đăng nhập.
*   **Luồng sự kiện chính:** Nhân viên nhà xe đặt vé trực tiếp cho khách hàng gọi điện hoặc mua vé tại quầy bằng cách chọn ghế trống trên sơ đồ và nhập thông tin hành khách trực tiếp.
*   **Hậu điều kiện:** Vé thủ công được tạo thành công trên hệ thống.

##### UC-2.7: Quản lý vé & hành khách
*   **Tiền điều kiện:** Nhà xe đăng nhập.
*   **Luồng sự kiện chính:** Tra cứu thông tin vé, cập nhật trạng thái (đã lên xe, hủy vé), xuất danh sách hành khách đi xe theo chuyến để bàn giao cho tài xế dưới dạng bản in giấy (offline).
*   **Hậu điều kiện:** Trạng thái vé được lưu vết và danh sách hành khách được kết xuất.

##### UC-2.8: Xem danh sách giao dịch
*   **Tiền điều kiện:** Nhà xe đăng nhập.
*   **Luồng sự kiện chính:** Xem lịch sử giao dịch thanh toán đặt vé của khách hàng trên các chuyến đi thuộc quyền quản lý của nhà xe.
*   **Hậu điều kiện:** Dữ liệu giao dịch được hiển thị chính xác.

##### UC-2.9: Cấu hình chính sách hủy
*   **Tiền điều kiện:** Nhà xe đăng nhập.
*   **Luồng sự kiện chính:** Nhà xe thiết lập một Chính sách hủy mặc định ở cấp công ty (mốc thời gian và tỷ lệ hoàn tiền, ví dụ: hoàn 100% trước 24h chạy). Khi tạo chuyến đi mới, hệ thống tự động áp dụng chính sách mặc định này vào chuyến. Nhà xe có thể ghi đè (override) chính sách riêng cho một chuyến cụ thể nếu cần (ví dụ: chuyến cao điểm lễ Tết áp dụng chính sách siết chặt hơn).
*   **Quy tắc Bất biến sau khi sử dụng (Immutable-After-Use):**
    *   *Trước khi được sử dụng:* Chính sách hủy **chưa từng được Chuyến đi nào áp dụng** vẫn được Nhà xe **chỉnh sửa tự do** — thêm, sửa, xóa các mốc thời gian và tỷ lệ hoàn tiền như nghiệp vụ thông thường.
    *   *Sau khi được sử dụng:* Ngay khi một Chuyến đi đầu tiên áp dụng chính sách đó, chính sách bị **khóa vĩnh viễn** và không thể chỉnh sửa hay xóa các quy tắc bên trong. Khi Nhà xe muốn thay đổi, hệ thống **tạo một phiên bản chính sách mới** và áp dụng cho các chuyến đi tạo từ thời điểm đó trở đi; các chuyến đi cũ tiếp tục giữ chính sách cũ.
    *   *Lý do:* Bảo đảm số tiền hoàn của một chuyến đi cũ luôn được tính theo đúng chính sách tại thời điểm chuyến được tạo, không bị thay đổi hồi tố. Ví dụ: chuyến tạo với quy tắc "trước 24h hoàn 100%" sẽ luôn hoàn 100% dù sau đó Nhà xe đổi chính sách thành 70%.
    *   *Cơ chế bảo vệ:* Cơ sở dữ liệu chặn mọi thao tác sửa/xóa quy tắc **của những chính sách đã bị khóa** (kiểm tra theo từng bản ghi, không chặn các chính sách chưa sử dụng). Tầng ứng dụng chịu trách nhiệm đánh dấu trạng thái khóa ngay trong giao dịch tạo chuyến đi đầu tiên và điều hướng Nhà xe sang luồng tạo phiên bản mới.
*   **Quy tắc Quyền sở hữu dữ liệu (Ownership):** Mỗi Chính sách hủy thuộc **đúng một Nhà xe**. Một chuyến đi chỉ được áp dụng chính sách do **chính Nhà xe sở hữu chuyến đi đó** tạo ra; áp dụng chính sách của Nhà xe khác bị hệ thống từ chối.
*   **Hậu điều kiện:** Chính sách hủy mặc định được lưu ở cấp nhà xe; mỗi chuyến đi lưu chính sách hủy áp dụng thực tế (kế thừa mặc định hoặc override riêng), và chính sách đó bất biến trong suốt vòng đời chuyến đi.

##### UC-2.10: Quản lý đánh giá khách hàng & Yêu cầu Báo cáo vi phạm (ReviewReport)
*   **Tiền điều kiện:** Nhà xe đăng nhập.
*   **Luồng sự kiện chính:** 
    1. Nhà xe xem các đánh giá của khách hàng đối với dịch vụ của mình. Nếu phát hiện đánh giá vi phạm (bôi nhọ, sai sự thật, ngôn từ tục tĩu), nhà xe gửi yêu cầu báo cáo (`ReviewReport`) lên Admin.
    2. Ngay khi report được gửi, hệ thống tự động chuyển trạng thái đánh giá đó sang "Tạm ẩn - Chờ Admin xử lý" (`HIDDEN_PENDING_REVIEW`) khỏi giao diện công khai.
    3. **Ràng buộc PENDING & Quy tắc Re-report:**
       - Mỗi `Review` chỉ được phép có **tối đa 01 `ReviewReport` ở trạng thái PENDING** (`PENDING_ADMIN_DECISION`) tại một thời điểm (chặn gửi report chồng report).
       - Nếu Admin xử lý bác bỏ (`REJECTED`) report cũ, Nhà xe **ĐƯỢC PHÉP tạo ReviewReport mới** trong tương lai nếu phát hiện vi phạm khác. Mỗi lần report mới LUÔN tạo thành một bản ghi `ReviewReport` mới hoàn toàn (không reopen hay sửa bản ghi cũ) để lưu vết đầy đủ lịch sử moderation.
       - Giới hạn số lượt report miễn phí của nhà xe trong khoảng thời gian nhất định (VD: 10 report/tháng).
*   **Hậu điều kiện:** Yêu cầu report được tạo mới và chuyển đến Admin xử lý trong SLA 48h.

##### UC-2.11: Báo cáo tình trạng chuyến đi thủ công (Cập nhật số phút trễ)
*   **Tiền điều kiện:** Nhân viên nhà xe đăng nhập; chuyến đi chưa `COMPLETED`/`CANCELLED`.
*   **Luồng sự kiện chính:**
    1.  Khi xe chạy gặp sự cố, tắc đường hoặc xuất phát muộn, nhân viên nhà xe truy cập màn hình giám sát chuyến đi đang chạy.
    2.  **`[D6]`** Nhập **TỔNG số phút trễ hiện tại** của chuyến (ví dụ: đang trễ 30 phút). Đây là con số **tuyệt đối**, **không phải** số phút trễ phát sinh thêm.
    3.  **`[D6]`** Hệ thống **ghi đè (SET)** `TripSchedule.delayMinutes = 30`, **không cộng dồn** vào giá trị cũ. Hệ thống **KHÔNG** sửa `TripPoint.eta` — giờ đón dự kiến hiển thị cho khách được tính khi đọc: `TripPoint.eta + delayMinutes`. Sau đó gửi thông báo nhắc nhở cập nhật cho hành khách ở UC-1.10.
    4.  *Cập nhật lại nhiều lần:* Nếu sau đó chuyến trễ thêm, nhân viên nhập **tổng mới** (ví dụ 45 phút) → hệ thống SET `delayMinutes = 45`. Giờ đón hiển thị là `eta + 45`, **không phải** `eta + 30 + 45`. Nếu xe chạy bù kịp giờ, nhập `0` để khôi phục đúng lịch trình gốc.
*   **Hậu điều kiện:** Tổng số phút trễ hiện tại của chuyến được cập nhật và lưu vết; ETA gốc của các Trip Point được bảo toàn nguyên vẹn.
*   **Ngoại lệ:** Không chấp nhận số phút trễ âm (`CHECK (delay_minutes >= 0)`).

---

#### 3.2.3 Phân hệ Quản trị viên (Admin)

Lưu ý kiến trúc: Hệ thống KHÔNG triển khai RBAC động (Admin tự định nghĩa Role/Permission mới). Phân quyền được thiết kế tĩnh với 3 role cố định trong code: CUSTOMER, BUS_COMPANY, ADMIN, được nhúng vào claim `role` của JWT Access Token (xem UC-1.2) và kiểm tra ở tầng API (annotation `@PreAuthorize` hoặc middleware tương đương) trên từng endpoint.

##### UC-3.1: Quản lý tài khoản hệ thống
*   **Tiền điều kiện:** Admin đăng nhập trang quản trị.
*   **Luồng sự kiện chính:** CRUD tài khoản khách hàng, nhà xe; Khóa/mở khóa tài khoản vi phạm.
*   **Hậu điều kiện:** Trạng thái tài khoản được cập nhật trong DB.

##### UC-3.2: Quản lý nhà xe hệ thống
*   **Tiền điều kiện:** Admin đăng nhập.
*   **Luồng sự kiện chính:** CRUD thông tin nhà xe, phê duyệt hồ sơ nhà xe mới tham gia hệ thống.
*   **Hậu điều kiện:** Nhà xe được kích hoạt trạng thái hoạt động.

##### UC-3.3: Quản lý Danh mục Địa điểm Dùng chung (`Location Master Data`)
*   **Tiền điều kiện:** Admin đăng nhập.
*   **Luồng sự kiện chính:** CRUD danh mục địa giới hành chính (Tỉnh/Thành phố, Quận/Huyện, Phường/Xã), bến xe lớn và điểm đón/trả chuẩn dùng chung toàn hệ thống. Tất cả các Nhà xe đều tham chiếu tới danh mục địa điểm này để cấu hình điểm vận hành riêng (UC-2.3).
*   **Hậu điều kiện:** Dữ liệu địa điểm master data được cập nhật.

##### UC-3.4: Quản lý Sơ đồ ghế mẫu & Danh mục Loại ghế
*   **Tiền điều kiện:** Admin đăng nhập.
*   **Luồng sự kiện chính:** 
    1. Tạo lập các layout sơ đồ ghế tiêu chuẩn (VIP 22 chỗ, Giường nằm 38 chỗ...) kèm khai báo metadata giới hạn kích thước khung hình (`maxFloor`, `maxRows`, `maxColumns`) làm dữ liệu mẫu cho các nhà xe clone.
    2. Quản lý danh mục Loại ghế chuẩn hóa toàn hệ thống (VIP, Thường, Giường đơn, Giường đôi...) — đây là danh mục dùng chung duy nhất do Admin quản lý; Nhà xe chọn gán loại ghế từ danh mục này khi thiết lập sơ đồ xe (UC-2.4).
*   **Hậu điều kiện:** Sơ đồ mẫu và danh mục loại ghế được xuất bản.

##### UC-3.5: Quản lý & Điều hành chuyến đi
*   **Tiền điều kiện:** Admin đăng nhập.
*   **Ràng buộc vận hành:** Tương tự như quy định với Nhà xe tại UC-2.5, Admin không được phép chỉnh sửa trực tiếp sơ đồ layout ghế của một chuyến đi đã phát sinh giao dịch bán vé, trừ khi thực hiện điều xe khẩn cấp theo cơ chế ghép ghế bán tự động để đảm bảo tính toàn vẹn dữ liệu đặt vé.
*   **Luồng sự kiện chính:** Giám sát trạng thái hoạt động các chuyến đi toàn hệ thống, can thiệp điều phối/hủy chuyến khi có vi phạm.
*   **Hậu điều kiện:** Trạng thái chuyến đi được kiểm soát.

##### UC-3.6: Quản lý Tuyến mẫu & Snapshot Chuyến đi
*   **Tiền điều kiện:** Admin đăng nhập.
*   **Luồng sự kiện chính:** Giám sát danh sách Tuyến mẫu (`RouteTemplate`) của các Nhà xe. Thời lượng di chuyển dự kiến giữa hai điểm dừng liên tiếp (`estimatedTravelDurationFromPreviousStopMinutes`) được tự động tính từ Routing API khi tạo/cập nhật Tuyến mẫu (Nhà xe không có quyền chỉnh sửa/ghi đè, stop đầu luôn bằng 0). Khi chuyến đi được tạo từ giờ xuất phát gốc (`TripSchedule.baseDepartureTime`), hệ thống tự động cộng dồn thời lượng từng đoạn theo sequence để tạo snapshot `TripPoint.eta` và snapshot dịch vụ xe trung chuyển `TripShuttleService`.
*   **Hậu điều kiện:** Dữ liệu tuyến và chuyến đi được giám sát tập trung.

##### UC-3.7: Cấu hình cổng thanh toán
*   **Tiền điều kiện:** Admin đăng nhập.
*   **Luồng sự kiện chính:** Cấu hình thông số kết nối API (Merchant ID, Hash Key, Payment URL) của VNPay, MoMo, ZaloPay.
*   **Hậu điều kiện:** Tham số cổng thanh toán được nạp và hoạt động.

##### UC-3.8: Cấu hình dịch vụ thông báo
*   **Tiền điều kiện:** Admin đăng nhập.
*   **Luồng sự kiện chính:** Thiết lập API Keys gửi SMS OTP (eSMS, Twilio) và cấu hình máy chủ SMTP Email, chạy gửi thử nghiệm trước khi lưu.
*   **Hậu điều kiện:** Cổng thông báo hoạt động trên cấu hình mới.

##### UC-3.9: Kiểm duyệt đánh giá & Xử lý Yêu cầu Báo cáo (ReviewReport)
*   **Tiền điều kiện:** Admin đăng nhập.
*   **Luồng sự kiện chính:** 
    1. Admin xem danh sách các đánh giá đang ở trạng thái "Tạm ẩn - Chờ xử lý" (`HIDDEN_PENDING_REVIEW`) do Nhà xe gửi `ReviewReport`, hoặc chủ động rà soát đánh giá vi phạm tiêu chuẩn cộng đồng.
    2. Admin ra quyết định đối với `ReviewReport`: 
       - **Bác bỏ report (`REJECTED`):** Khôi phục đánh giá về trạng thái hiển thị công khai (`PUBLIC`). Bản ghi report cũ kết thúc ở trạng thái `REJECTED`. Nhà xe có thể tạo bản ghi `ReviewReport` mới trong tương lai nếu phát hiện vi phạm khác.
       - **Chấp nhận report (`APPROVED`):** Chuyển đánh giá sang trạng thái ẩn vĩnh viễn (`HIDDEN_PERMANENT`).
    3. Mọi quyết định của Admin đều ghi nhận vết lịch sử trong bản ghi `ReviewReport` tương ứng.
*   **Cam kết SLA:** Admin xử lý các report từ Nhà xe trong vòng tối đa 48 giờ kể từ thời điểm report được gửi.
*   **Hậu điều kiện:** Trạng thái đánh giá và bản ghi `ReviewReport` được cập nhật chính xác.

##### UC-3.10: Quản lý Banner quảng cáo
*   **Tiền điều kiện:** Admin đăng nhập.
*   **Luồng sự kiện chính:** CRUD các banner hiển thị tại trang chủ khách hàng để quảng bá chiến dịch hoặc nhà xe.
*   **Hậu điều kiện:** Banner mới được xuất bản lên trang chủ.

##### UC-3.11: Xem Audit Log
*   **Tiền điều kiện:** Admin đăng nhập.
*   **Luồng sự kiện chính:** Xem nhật ký hoạt động hệ thống bao gồm: lịch sử đăng nhập, lịch sử thay đổi cấu hình tiền tệ, API thanh toán, thao tác CRUD chuyến đi của nhà xe và admin.
*   **Hậu điều kiện:** Giao diện audit log được hiển thị đầy đủ (dữ liệu này là Read-Only).

---

### 3.3 Yêu cầu Phi chức năng (Non-Functional Requirements)

#### 3.3.1 Hiệu năng (Performance Requirements)
*   **Thời gian phản hồi (Response Time):** API lấy danh sách chuyến xe và trạng thái sơ đồ ghế phải phản hồi dưới 500ms dưới điều kiện tải thông thường.
*   **Tính đồng thời (Concurrency):** Hệ thống xử lý được tối thiểu 200 giao dịch đặt ghế đồng thời trên cùng một chuyến xe mà không xảy ra tình trạng bán trùng ghế (Double booking).
*   **Uptime:** Hệ thống hoạt động liên tục với cam kết Uptime đạt tối thiểu 99.9%.

#### 3.3.2 An toàn & Bảo mật (Safety and Security Requirements)
*   **Bảo mật OTP:** Áp dụng Rate Limiting chặn brute force mã OTP. Mã OTP chỉ có hiệu lực tối đa 120 giây và tự động bị hủy sau 3 lần nhập sai.
*   **Mã hóa dữ liệu:** Sử dụng giao thức HTTPS/TLS 1.3 cho toàn bộ kết nối. Hệ thống V1 **không lưu trữ mật khẩu** (xác thực qua OTP và Google OAuth2) nên không phát sinh yêu cầu băm mật khẩu. Các API Key cổng thanh toán và SMS phải được mã hóa AES-256 trước khi lưu DB.
*   **Audit Log:** Mọi hành động đăng nhập, cập nhật cấu hình cổng thanh toán, thay đổi lịch trình chuyến xe, hủy vé của nhà xe đều phải ghi nhận đầy đủ IP, User, Thời gian và Chi tiết thay đổi vào bảng Audit Log không được phép xóa/sửa.

#### 3.3.3 Độ tin cậy & Bảo trì (Reliability and Maintainability)
*   **Khả năng tự phục hồi (Resilience):** Khi cổng thanh toán gặp sự cố gián đoạn kết nối, hệ thống phải tự động hoàn trả (rollback) trạng thái ghế từ Hard Hold về Trống trong Redis sau 10 phút để đảm bảo quyền lợi đặt chỗ của khách hàng khác.

#### 3.3.4 Bảo vệ dữ liệu cá nhân (PDPD — Nghị định 13/2023/NĐ-CP)
Nhằm tuân thủ các quy định pháp luật hiện hành của Việt Nam về bảo vệ dữ liệu cá nhân nhạy cảm, hệ thống áp dụng các nguyên tắc thiết kế sau:
*   **Chính sách Retention (Lưu trữ dữ liệu):** 
    *   Các dữ liệu cá nhân của người dùng như số điện thoại, email, thông tin liên hệ hành khách, lịch sử di chuyển và thông tin giao dịch tài chính chỉ được lưu trữ dưới dạng định danh trong thời hạn tối đa là 5 năm (phục vụ mục đích đối soát tài chính và thuế).
    *   Sau thời hạn trên, toàn bộ thông tin định danh cá nhân liên quan bắt buộc phải được mã hóa ẩn danh (anonymized) hoặc xóa hoàn toàn khỏi cơ sở dữ liệu hoạt động và cơ sở dữ liệu sao lưu.
*   **Cơ chế xóa dữ liệu theo yêu cầu (Right to be Forgotten):** 
    *   Hệ thống cung cấp chức năng cho phép Khách hàng gửi yêu cầu xóa tài khoản và xóa toàn bộ dữ liệu cá nhân liên quan trực tiếp trên trang quản lý tài khoản.
    *   Sau khi nhận yêu cầu và xác thực danh tính người dùng, hệ thống phải thực hiện xóa bỏ hoàn toàn hoặc ẩn danh hóa tất cả các thông tin cá nhân của người dùng đó trong cơ sở dữ liệu hoạt động trong vòng tối đa 72 giờ (ngoại trừ các dữ liệu giao dịch tài chính bắt buộc phải lưu trữ theo Luật kế toán).

#### 3.3.5 Khả năng Giám sát & Đo lường (Observability)
*   **Hệ thống Monitoring:** Thiết lập các công cụ giám sát sức khỏe hệ thống (như Prometheus, Grafana) để theo dõi liên tục tải CPU, dung lượng RAM, dung lượng Disk I/O, Network Throughput và độ trễ (latency) của các API giao dịch cốt lõi.
*   **Hệ thống Alerting:** Thiết lập cảnh báo tự động gửi về kênh vận hành (Telegram, Slack, Email) ngay lập tức khi phát hiện các lỗi hệ thống nghiêm trọng như: tỷ lệ phản hồi lỗi HTTP 5xx vượt quá 5% tổng traffic trong 1 phút, CPU load trung bình vượt quá 85% kéo dài 3 phút, hoặc kết nối tới cổng thanh toán VNPay/MoMo bị timeout liên tục quá 3 lần.
*   **SLA phát hiện sự cố:** Đội ngũ kỹ thuật cam kết phát hiện ra các sự cố nghiêm trọng ảnh hưởng đến luồng đặt vé và thanh toán trực tuyến trong vòng tối đa 5 phút kể từ lúc sự cố phát sinh thông qua hệ thống cảnh báo tự động.

#### 3.3.6 Khả năng sao lưu và khôi phục (Backup RPO/RTO)
*   **RPO (Recovery Point Objective - Điểm khôi phục mục tiêu):** Cam kết mất mát dữ liệu tối đa là 1 giờ. Cơ sở dữ liệu giao dịch chính được đồng bộ liên tục (Write-Ahead Logging / Replication) sang máy chủ cơ sở dữ liệu dự phòng. Toàn bộ cơ sở dữ liệu được nén, mã hóa và sao lưu (Backup) đầy đủ hàng ngày lúc 2:00 AM gửi lên Cloud Storage biệt lập (AWS S3).
*   **RTO (Recovery Time Objective - Thời gian khôi phục mục tiêu):** Thời gian tối đa để khôi phục hoạt động bình thường của hệ thống khi xảy ra sự cố thảm họa nghiêm trọng (Disaster Recovery):
    *   Đối với luồng đặt vé và thanh toán cốt lõi của Khách hàng: Thời gian phục hồi tối đa là 2 giờ.
    *   Đối với phân hệ quản lý của Nhà xe và trang Dashboard của Admin: Thời gian phục hồi tối đa là 4 giờ.

---

## 4. BÁO CÁO ĐỒNG BỘ THIẾT KẾ (SYNCHRONIZATION REPORT)

### Trạng thái rà soát & Đồng bộ mới nhất (Đồng bộ 100% cả 4 tài liệu)

| STT | Nội dung Quyết định | Trạng thái đồng bộ | Mô tả chi tiết |
|---|---|---|---|
| 1 | **RouteTemplateStop & Duration** | ✅ Đã đồng bộ | `RouteTemplateStop` không lưu giờ tuyệt đối (`plannedArrivalTime`). Chuyển sang lưu `estimatedTravelDurationFromPreviousStopMinutes` (thời lượng của đoạn từ stop liền trước đến stop hiện tại). Stop 1 luôn có duration = 0 (NOT NULL). Duration lấy từ Routing API (Google Maps), Nhà xe **không có quyền tự chỉnh sửa/ghi đè**. |
| 2 | **Trip Departure Time** | ✅ Đã đồng bộ | Khi tạo `Trip`, Nhà xe nhập Ngày chạy + Giờ xuất phát. Tái sử dụng `TripSchedule.baseDepartureTime` (`trips.base_departure_time`). Không tạo thêm field `Trip.departureTime` trùng nghĩa. |
| 3 | **Tự động tính TripPoint.eta** | ✅ Đã đồng bộ | Khi tạo `Trip`, `TripPoint.eta` được tự động tính dồn tuần tự từng đoạn theo sequence: `TripPoint[1].eta = baseDepartureTime`, `TripPoint[i].eta = TripPoint[i-1].eta + duration[i]`. `TripPoint` snapshot kết quả bất biến, thay đổi Tuyến mẫu sau đó không làm đổi Trip cũ. |
| 4 | **Runtime Delay ETA** `[D6]` | ✅ Đã đồng bộ | `TripDelayReportService` **SET** `TripSchedule.delayMinutes` = **tổng** số phút trễ hiện tại (absolute, không cộng dồn). `TripPoint.eta` là **ETA gốc bất biến**, không bao giờ bị ghi đè. Giờ thực tế = `eta + delayMinutes` tính khi đọc → báo trễ nhiều lần không double-count, đặt lại về 0 khôi phục đúng lịch gốc. Không gọi lại Routing API runtime. |
| 5 | **Shuttle Service Model** | ✅ Đã đồng bộ | Thiết lập mô hình snapshot `RouteTemplateShuttleService` -> `TripShuttleService`. Pickup và Dropoff là 2 cấu hình độc lập. Bắt buộc có `referenceStop` do **Nhà xe tự chọn thủ công** từ các `RouteTemplateStop` của tuyến (NOT NULL). `displayTime` được snapshot tính từ `TripPoint(referenceStop).eta +/- shuttleOffsetMinutes`. |
| 6 | **Phạm vi Shuttle (Coverage Area)** | ✅ Đã đồng bộ | Coverage là chuỗi văn bản mô tả (`coverageAreaDescription`), không tạo `Location` entity mới. |
| 7 | **Shuttle Pricing** | ✅ Đã đồng bộ | V1 hỗ trợ `FREE`, không khóa khả năng mở rộng `PAID`/`feeAmount` ở V2. Không xây dựng hệ thống Voucher/Discount. |
