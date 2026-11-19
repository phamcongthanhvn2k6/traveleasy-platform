# 📘 CẨM NANG GIẢI NGHĨA 100% CƠ SỞ DỮ LIỆU TRAVELEASY (DATA DICTIONARY)
> **Dành riêng cho:** Sinh viên Phạm Công Thành — Chuẩn bị bảo vệ Khóa luận / Đồ án tốt nghiệp  
> **Tài liệu nguồn:** [`schema.sql`](./schema.sql) & [`MIGRATION_SPRINT_4_EXTENSIONS.sql`](./MIGRATION_SPRINT_4_EXTENSIONS.sql)  
> **Công nghệ Database:** MySQL 8.0+ (InnoDB, UTF8mb4, UUID v4, Optimistic Locking, Virtual Generated Columns)

---

## 📌 MỤC LỤC 5 PHÂN NHÓM DỮ LIỆU
1. [Nhóm 1: Định danh, Tài khoản & Pháp lý Đối tác (Identity, KYB & Fleet)](#nhom-1)
2. [Nhóm 2: Mạng lưới Tuyến đường & Chuyến xe (Routes, Stops & Trips)](#nhom-2)
3. [Nhóm 3: Đặt vé, Bán vé & Dòng tiền Thanh toán (Bookings, Tickets & Payments)](#nhom-3)
4. [Nhóm 4: Nghiệp vụ Vận hành Bến xe & Buồng lái (POS, Crews, Shuttles & GPS)](#nhom-4)
5. [Nhóm 5: Dịch vụ Gia tăng & Quản trị Tài chính (Charter, Cargo, Pricing & P&L)](#nhom-5)
6. [Bộ câu hỏi Hội đồng chuyên sâu về Cơ sở dữ liệu & Cách trả lời](#hoi-dong-qa)

---

<a name="nhom-1"></a>
## 🏢 NHÓM 1: ĐỊNH DANH, TÀI KHOẢN & PHÁP LÝ ĐỐI TÁC

### 1.1. Bảng `users` (Tài khoản người dùng toàn sàn)
| Tên Trường | Kiểu Dữ Liệu | Ràng Buộc | Ý Nghĩa Nghiệp Vụ & Vai Trò |
| :--- | :--- | :--- | :--- |
| `id` | `CHAR(36)` | **PK**, UUID v4 | Khóa chính định danh tài khoản độc nhất. Sinh ngẫu nhiên từ Application layer. |
| `firebase_uid` | `VARCHAR(128)` | `UNIQUE`, `NULL` | Lưu UID khi người dùng đăng nhập bằng Google hoặc xác thực OTP số điện thoại qua Firebase Auth. |
| `phone_number` | `VARCHAR(20)` | `UNIQUE`, `NULL` | Số điện thoại dùng làm tên đăng nhập và là kênh nhận mã vé SMS khi mua vé. |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NULL` | Hòm thư nhận vé điện tử định dạng PDF và hóa đơn giá trị gia tăng (VAT). |
| `role` | `VARCHAR(20)` | `CHECK IN ('CUSTOMER', 'BUS_COMPANY', 'ADMIN')` | Quyền hạn hệ thống. `CUSTOMER` (Khách), `BUS_COMPANY` (Nhà xe đối tác), `ADMIN` (Ban quản trị sàn). |
| `bus_company_id` | `CHAR(36)` | `FK` -> `bus_companies.id` | **Cực kỳ quan trọng cho Multi-tenancy:** Nếu `role='BUS_COMPANY'`, trường này chỉ rõ nhân viên/chủ xe thuộc hãng xe nào để phân lập dữ liệu. |
| `account_status` | `VARCHAR(20)` | `ACTIVE`, `LOCKED`, `ANONYMIZED` | Trạng thái: Hoạt động, Bị khóa do gian lận, hoặc Đã ẩn danh khi khách yêu cầu xóa tài khoản. |
| `anonymized_at` | `DATETIME(3)` | `NULL` | Thời điểm thực hiện "Quyền được quên" (Right to be Forgotten) theo luật an toàn thông tin. |
| `version` | `INT` | `DEFAULT 0` | Khóa lạc quan (Optimistic Locking) chống tình trạng 2 quản trị viên cùng sửa tài khoản một lúc gây mất dữ liệu. |

---

### 1.2. Bảng `bus_companies` (Hồ sơ Doanh nghiệp Đối tác Nhà xe & Thẩm định KYB)
| Tên Trường | Kiểu Dữ Liệu | Ý Nghĩa Thực Tế Trong Vận Tải |
| :--- | :--- | :--- |
| `id` | `CHAR(36)` | Mã định danh nhà xe (UUID). Ví dụ: Phương Trang, Thành Bưởi, Hoa Mai... |
| `name` | `VARCHAR(255)` | Tên thương hiệu hiển thị trên thanh tìm kiếm và vé xe. |
| `hotline` | `VARCHAR(20)` | Số tổng đài khẩn cấp in trên vé để khách hàng gọi khi trễ chuyến hoặc thất lạc hành lý. |
| `tax_code` | `VARCHAR(20)` | Mã số thuế doanh nghiệp (MST) để kiểm tra đăng ký kinh doanh và xuất hóa đơn điện tử. |
| `business_license_number` | `VARCHAR(50)` | Số Giấy phép đăng ký kinh doanh vận tải hành khách bằng ô tô do Sở GTVT cấp. |
| `business_license_url` | `TEXT` | Link ảnh chụp bản gốc GPKD để Admin kiểm tra tính pháp lý trước khi cho phép mở bán vé. |
| `legal_representative` | `VARCHAR(100)` | Họ tên người đại diện pháp luật (Giám đốc công ty hoặc chủ hộ kinh doanh cá thể). |
| `identity_card_number` | `VARCHAR(20)` | Số CCCD gắn chip của người đại diện để xác minh danh tính chủ xe (KYB). |
| `bank_name`, `bank_account_number`, `bank_account_owner` | `VARCHAR` | Thông tin tài khoản ngân hàng thụ hưởng nhận tiền quyết toán doanh thu bán vé hàng tuần từ sàn. |
| `kyc_status` | `VARCHAR(30)` | Trạng thái thẩm định pháp lý: `PENDING_APPROVAL`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`. |
| `commission_rate` | `DECIMAL(5,2)` | Tỷ lệ hoa hồng sàn thu trên mỗi vé bán thành công (mặc định 8.00%). |
| `status` | `VARCHAR(20)` | Trạng thái hoạt động: `ACTIVE` (đang bán vé), `SUSPENDED` (tạm đình chỉ do có phản ánh xấu). |
| `default_cancellation_policy_id` | `CHAR(36)` | Khóa ngoại trỏ đến chính sách hoàn hủy vé mặc định của hãng xe. |

---

### 1.3. Bảng `vehicles` (Hồ sơ Đội xe & 4 Giấy tờ Lưu hành bắt buộc)
> [!IMPORTANT]
> **Điểm ăn tiền với Hội đồng:** Khác với các phần mềm bán hàng thông thường, bảng `vehicles` của TravelEasy tuân thủ nghiêm ngặt Nghị định 10/2020/NĐ-CP về kinh doanh vận tải xe ô tô với đủ **4 loại chứng chỉ lưu hành**.

| Tên Trường | Kiểu Dữ Liệu | Giải Thích Nghiệp Vụ Luật Giao Thông |
| :--- | :--- | :--- |
| `plate_number` | `VARCHAR(20)` | Biển kiểm soát xe (Ví dụ: `51B-888.99`). Duy nhất trên toàn hệ thống. |
| `vehicle_type` | `VARCHAR(20)` | Loại xe: `SEATED` (Ghế ngồi), `SLEEPER` (Giường nằm), `LIMOUSINE` (Phòng VIP). |
| `registration_certificate_url` | `TEXT` | **Giấy tờ 1:** Cà-vẹt xe (Chứng nhận đăng ký xe ô tô xác nhận quyền sở hữu). |
| `inspection_certificate_url` | `TEXT` | **Giấy tờ 2:** Giấy chứng nhận kiểm định an toàn kỹ thuật và bảo vệ môi trường (Đăng kiểm). |
| `inspection_expiry_date` | `DATE` | Ngày hết hạn đăng kiểm. Hệ thống sẽ **tự động cảnh báo trước 15 ngày** và khóa không cho xếp lịch chuyến nếu xe hết hạn đăng kiểm. |
| `insurance_certificate_url` | `TEXT` | **Giấy tờ 3:** Giấy chứng nhận bảo hiểm trách nhiệm dân sự bắt buộc của chủ xe cơ giới. |
| `insurance_expiry_date` | `DATE` | Ngày hết hạn bảo hiểm TNDS (bảo vệ quyền lợi hành khách khi có rủi ro). |
| `badge_number` & `badge_url` | `VARCHAR/TEXT` | **Giấy tờ 4:** Số và ảnh chụp **Phù hiệu xe chạy tuyến cố định** do Sở Giao thông Vận tải cấp. |
| `badge_expiry_date` | `DATE` | Ngày hết hạn phù hiệu vận tải. Xe không có phù hiệu hợp lệ không được xuất bến. |
| `compliance_status` | `VARCHAR(20)` | Trạng thái tuân thủ pháp lý: `PENDING` (Chờ duyệt), `VERIFIED` (Đủ chuẩn lưu hành), `EXPIRED` (Hết hạn). |

---

<a name="nhom-2"></a>
## 🗺️ NHÓM 2: MẠNG LƯỚI TUYẾN ĐƯỜNG & CHUYẾN XE

### 2.1. Cặp bảng Mẫu Tuyến: `route_templates` & `route_template_stops`
- `route_templates`: Chứa tên tuyến tổng quan (Ví dụ: *Sài Gòn ➔ Đà Lạt*), điểm đi neo chuẩn (`origin_location_id`) và điểm đến neo chuẩn (`destination_location_id`).
- `route_template_stops`: Danh sách các trạm dừng tuần tự dọc đường:
  - `sequence`: Thứ tự trạm (1, 2, 3...). Trạm đầu tiên có `sequence=1`.
  - `estimated_travel_duration_from_previous_stop_minutes`: Số phút chạy từ trạm trước tới trạm này (lấy từ Routing API OpenStreetMap, nhà xe không được bịa).
  - `stop_type`: `PICKUP` (chỉ đón), `DROPOFF` (chỉ trả), `PICKUP_AND_DROPOFF` (vừa đón vừa trả).

### 2.2. Bảng `trips` (Lịch trình chuyến xe cụ thể theo ngày giờ)
| Tên Trường | Kiểu Dữ Liệu | Ý Nghĩa Thực Tế |
| :--- | :--- | :--- |
| `id` | `CHAR(36)` | Mã chuyến xe cụ thể (Ví dụ chuyến 23:00 đêm nay đi Nha Trang). |
| `route_template_id` | `CHAR(36)` | Tuyến đường gốc làm mẫu để nhân bản ra chuyến xe này. |
| `vehicle_id` | `CHAR(36)` | Xe cơ giới cụ thể được phân công lăn bánh cho chuyến này. |
| `base_departure_time` | `DATETIME(3)` | Ngày giờ xuất bến theo kế hoạch đã công bố. |
| `base_arrival_time` | `DATETIME(3)` | Ngày giờ dự kiến đến bến cuối cùng. |
| `status` | `VARCHAR(20)` | `SCHEDULED` (Theo lịch), `DELAYED` (Trễ giờ), `RUNNING` (Đang chạy), `COMPLETED` (Hoàn thành), `CANCELLED` (Hủy chuyến). |
| `delay_minutes` | `INT` | Số phút xe bị trễ so với giờ hẹn do kẹt xe hoặc thời tiết xấu. |
| `current_latitude` & `longitude` | `DECIMAL(10,7)` | **Tọa độ vệ tinh thời gian thực:** Lưu vị trí mới nhất do buồng lái truyền về để chấm điểm đỏ trên bản đồ Leaflet. |
| `last_gps_updated_at` | `DATETIME(3)` | Thời điểm xe gửi tín hiệu GPS gần nhất (phát hiện xe mất sóng/ngắt thiết bị). |

### 2.3. Bảng `trip_seats` (Kho tồn kho ghế theo từng chuyến xe — Chống Double Booking)
- `trip_id`, `seat_code`: Khóa chính hỗn hợp (Ví dụ: Chuyến #101, ghế `A01`).
- `seat_type_code`: Loại ghế (`VIP_ROOM`, `STANDARD_BED`, `SEAT_FRONT`...).
- `status`:
  - `AVAILABLE`: Ghế đang trống, ai cũng có thể bấm chọn.
  - `SOFT_HELD`: Khách đang giữ chỗ tạm thời (giữ trong 10 phút để điền thông tin và quét mã VietQR).
  - `BOOKED`: Đã thanh toán tiền thành công, vé đã xuất.
- `version`: **Optimistic Lock:** Nếu 2 khách hàng cùng bấm chọn ghế `A01` tại cùng một tích tắc, chỉ người có `version` khớp mới giữ được ghế; người kia nhận thông báo *"Ghế vừa được khách khác chọn"*.

---

<a name="nhom-3"></a>
## 💳 NHÓM 3: ĐẶT VÉ, BÁN VÉ & DÒNG TIỀN THANH TOÁN

### 3.1. Bảng `bookings` (Đơn đặt chỗ) & Bảng `tickets` (Vé xe chi tiết)
> [!NOTE]
> **Quan hệ 1 - N:** Một `booking` đại diện cho một đơn hàng của cả gia đình, có thể chứa **nhiều `tickets`** (ví dụ mua 3 vé cho ba mẹ và con).

- **Trong bảng `bookings`:**
  - `booking_channel`: Phân loại kênh bán vé: `ONLINE` (Khách tự đặt qua Web/App), `POS_COUNTER` (Khách mua tại quầy bến xe), `PHONE_ORDER` (Gọi điện thoại tổng đài).
  - `pos_shift_id`: Mã ca trực nếu vé được bán tại bến xe (để gom vào doanh thu của thu ngân ca đó).
  - `staff_user_id`: Nhân viên quầy trực tiếp thao tác bán vé.
  - `total_amount`: Tổng số tiền cần thu.
- **Trong bảng `tickets`:**
  - `seat_code`: Số ghế cụ thể của vé đó (Ví dụ: `A02`).
  - `seat_price_amount`: **Snapshot bất biến:** Lưu giá tiền vé tại thời điểm mua. Sau này nhà xe có tăng/giảm giá tuyến đường thì giá vé cũ của khách đã in ra vẫn không bị thay đổi.
  - `passenger_full_name` & `phone_number`: Tên và số điện thoại người ngồi ghế đó.
  - `qr_content`: Chuỗi mã hóa để render mã QR lên vé. Phụ xe dùng điện thoại quét mã này để đối chiếu soát vé trước khi cho khách lên xe.
  - `is_printed` & `printed_at`: Đánh dấu vé đã được in ra giấy nhiệt tại quầy bến xe hay chưa.
  - `has_insurance`: Đánh dấu khách có mua gói bảo hiểm tai nạn chuyến đi (10.000đ) hay không.
  - `active_seat_key`: Cột ảo do hệ thống tự sinh (`trip_id - seat_code`), kết hợp ràng buộc `UNIQUE` đảm bảo **1 ghế trên 1 chuyến xe không bao giờ bị bán cho 2 người**!

### 3.2. Bảng `payment_transactions` & `refund_transactions` (Cổng thanh toán & Hoàn tiền)
- `payment_transactions`: Lưu vết từng phiên giao dịch qua VietQR, VNPay, MoMo.
  - `txn_ref`: Mã giao dịch đối soát của Ngân hàng / Cổng thanh toán.
  - `txn_type`: `INITIAL` (Thanh toán mua vé lần đầu), `RESCHEDULE_SURCHARGE` (Thu thêm phụ phí chênh lệch khi khách xin đổi sang xe cao cấp hơn).
- `refund_transactions`: Lưu vết khi khách hủy vé hoặc nhà xe hủy chuyến:
  - `amount`: Số tiền thực tế hoàn về tài khoản khách sau khi trừ phí hủy theo quy định.

---

<a name="nhom-4"></a>
## 🚍 NHÓM 4: VẬN HÀNH BẾN XE & BUỒNG LÁI TÀI XẾ

### 4.1. Bảng `pos_shifts` (Quản lý Ca trực Quầy vé Tiền mặt & Báo cáo Z-Report)
| Tên Trường | Kiểu Dữ Liệu | Ý Nghĩa Thực Tế |
| :--- | :--- | :--- |
| `company_id` | `CHAR(36)` | Thuộc nhà xe nào (Ví dụ: Quầy vé FUTA). |
| `staff_user_id` | `CHAR(36)` | Nhân viên thu ngân đang trực ca. |
| `terminal_location_id` | `CHAR(36)` | Quầy đặt ở bến nào (Bến xe Miền Đông, Bến xe An Sương...). |
| `initial_cash_amount` | `DECIMAL(14,2)` | Tiền mặt lẻ bàn giao đầu ca để thối lại cho khách mua vé (Ví dụ: 1.000.000đ). |
| `total_cash_collected` | `DECIMAL(14,2)` | Tổng tiền mặt thu được từ việc bán vé trong ca. |
| `total_qr_collected` | `DECIMAL(14,2)` | Tổng tiền khách quét mã VietQR tại quầy. |
| `total_tickets_sold` | `INT` | Tổng số vé đã in ra trong ca trực. |
| `status` | `VARCHAR(20)` | `OPEN` (Ca đang mở), `CLOSED` (Đã chốt sổ in Z-Report), `AUDITED` (Kế toán trưởng đã duyệt). |
| `notes` | `TEXT` | Giải trình tiền mặt thực đếm trong két bị lệch so với phần mềm (thừa/thiếu tiền thối). |

### 4.2. Bảng `trip_crews` (Phân công Tổ lái & Giám sát An toàn GTĐB)
> [!IMPORTANT]
> **Điểm nhấn thực tế:** Theo Điều 65 Luật Giao thông Đường bộ Việt Nam, **tài xế không được lái xe liên tục quá 4 giờ** và không quá 10 giờ trong một ngày.

- `primary_driver_name`, `phone`, `license`: Thông tin tài xế chính và số GPLX hạng E/D.
- `secondary_driver_name`, `phone`: Tài xế phụ đổi lái trên chặng đường dài (ví dụ Sài Gòn đi Hà Nội/Đà Nẵng bắt buộc phải có tài xế đổi ca).
- `conductor_name`: Họ tên nhân viên tiếp viên / phụ xe kiểm tra vé và sắp xếp hành lý hầm xe.
- `continuous_drive_hours`: Số giờ tài xế chính đã lái xe liên tục. Hệ thống sẽ **báo động đỏ** khi con số này vượt qua `4.0 giờ`.
- `notes`: Ghi nhận kết quả thổi nồng độ cồn trước giờ xuất bến (tiêu chuẩn bắt buộc `0.00 mg/L khí thở`).

### 4.3. Bảng `shuttle_requests` (Xe trung chuyển gom khách tận nơi)
- `passenger_name` & `phone`: Tên và số điện thoại khách cần đón.
- `pickup_address`: Địa chỉ nhà riêng hoặc khách sạn trong nội thành cần xe nhỏ tới đón.
- `main_trip_id`: Chuyến xe khách lớn liên tỉnh mà khách chuẩn bị lên.
- `shuttle_pickup_time`: Giờ xe nhỏ hẹn có mặt tại nhà khách để kịp ra bến.
- `assigned_vehicle_plate` & `driver_name`: Biển số xe 7-16 chỗ và tài xế trung chuyển được phân công.

---

<a name="nhom-5"></a>
## 📦 NHÓM 5: DỊCH VỤ GIA TĂNG & QUẢN TRỊ TÀI CHÍNH

### 5.1. Bảng `cargo_orders` (Ký gửi hàng hóa bưu kiện hầm xe)
- `tracking_code`: Mã vận đơn bưu kiện (Ví dụ: `CG-2026-889901`) để người gửi/người nhận tra cứu tiến độ kiện hàng trên Website.
- `cargo_type`: Phân loại hàng: `DOCUMENT` (Thư tín), `PARCEL` (Bưu kiện), `HEAVY` (Hàng nặng), `BIKE` (Gửi kèm xe máy), `FRESH_FOOD` (Hải sản/hoa quả tươi).
- `shipping_fee`: Tiền cước vận chuyển theo trọng lượng (`weight_kg`).
- `cod_amount`: Số tiền nhờ nhà xe thu hộ người nhận (Cash on Delivery).
- `delivery_otp_code`: **Mã OTP bí mật gồm 6 chữ số** gửi qua tin nhắn SMS tới người nhận. Khi đến kho bến xe, người nhận bắt buộc phải đọc đúng mã OTP này thì thủ kho mới bàn giao kiện hàng (chống lấy nhầm hoặc mất cắp hàng hóa).

### 5.2. Bảng `charter_requests` & `charter_bids` (Dịch vụ Thuê xe Hợp đồng Du lịch)
- `charter_requests`: Đơn yêu cầu từ khách đoàn (Công ty, trường học) cần thuê trọn gói xe 16-45 chỗ đi du lịch (có điểm đón, điểm đến, giờ đi, giờ về, cự ly `estimated_distance_km`).
- `charter_bids`: Các nhà xe trên sàn tham gia đấu thầu chào giá trọn gói:
  - `quoted_total_price`: Giá trọn gói nhà xe đề xuất (đã gồm xăng dầu, tài xế, phí BOT).
  - `required_deposit_amount`: Số tiền cọc giữ xe (quy định 30% tổng hợp đồng).
  - `escrow_status`: **Cơ chế Escrow giữ cọc trung gian của Sàn:** Khách nộp cọc cho sàn TravelEasy giữ (`HELD_IN_ESCROW`). Khi chuyến xe du lịch hoàn thành tốt đẹp, sàn mới giải ngân tiền cọc cho nhà xe (`RELEASED_TO_COMPANY`), bảo vệ khách khỏi bị nhà xe bỏ rơi hoặc hủy đột xuất.

### 5.3. Bảng `dynamic_pricing_rules` (Quản trị Giá vé động)
- `rule_type`:
  - `SURCHARGE_HOLIDAY`: Phụ thu vé ngày lễ tết (+20% đến +40%).
  - `FLASH_SALE_LAST_HOUR`: Xả vé giờ chót giảm giá (-15% đến -30%) khi xe còn cách giờ chạy `condition_hours_before` mà số ghế trống còn nhiều hơn `condition_empty_seat_threshold`.

### 5.4. Bảng `user_reward_wallets` (Ví điểm thưởng EasyXu)
- `balance_points`: Số dư điểm thưởng khả dụng (1 Xu = 1 VNĐ).
- Khách hàng đi xe được hoàn tích lũy xu để trừ tiền trực tiếp vào đơn đặt vé sau.

### 5.5. Bảng `travel_insurance_policies` (Hợp đồng Bảo hiểm Chuyến đi)
- `policy_number`: Số hợp đồng bảo hiểm điện tử liên kết với Tổng công ty Bảo hiểm Bảo Việt.
- `premium_amount`: 10.000 VNĐ / vé.
- `max_coverage_amount`: Mức đền bù tối đa lên tới 400.000.000 VNĐ cho hành khách khi không may xảy ra tai nạn giao thông.

### 5.6. Bảng `trip_expenses` (Báo cáo Lợi nhuận P&L từng chuyến xe)
- Hạch toán chi tiết chi phí chuyến:
  - `fuel_cost`: Tiền dầu Diesel tiêu hao thực tế.
  - `toll_bot_cost`: Tiền cước qua các trạm thu phí BOT tự động (ePass/VETC).
  - `driver_salary`: Lương nhật/phụ cấp chuyến trả cho tài xế và phụ xe.
  - `terminal_fee`: Lệ phí hoa hồng cổng xuất bến trả cho Ban quản lý bến xe.
- Giúp chủ hãng xe tính được: **Lợi nhuận ròng = Doanh thu vé - Tổng chi phí chuyến**.

---

<a name="hoi-dong-qa"></a>
## 🎓 BỘ CÂU HỎI HỘI ĐỒNG CHUYÊN SÂU VỀ DATABASE & CÁCH TRẢ LỜI

### ❓ Câu 1: Tại sao em dùng `CHAR(36)` UUID v4 làm khóa chính thay vì `BIGINT AUTO_INCREMENT`?
> **Trả lời:**
> 1. **Tính bảo mật:** `AUTO_INCREMENT` để lộ số lượng bản ghi kinh doanh (đối thủ có thể đoán được hôm nay sàn bán được bao nhiêu vé bằng cách nhìn ID tăng dần). UUID che giấu hoàn toàn dữ liệu này.
> 2. **Kiến trúc phân tán:** UUID được sinh ra ngay tại tầng ứng dụng (Application layer) trước khi lưu vào DB, giúp hệ thống có thể tạo trước mã đơn, gửi đi thanh toán qua cổng Ngân hàng mà không cần chờ DB trả về ID tự tăng.

### ❓ Câu 2: Em giải quyết bài toán chống Double-Booking (2 người cùng đặt 1 ghế) trong Database như thế nào?
> **Trả lời:**
> Em áp dụng chiến lược phòng thủ 3 lớp (3-tier Defense):
> - **Lớp 1 (Redis Cache):** Khóa phân tán (Distributed Lock) giữ ghế tạm thời trong 10 phút.
> - **Lớp 2 (Optimistic Locking):** Trong bảng `trip_seats` có cột `version`. Câu lệnh cập nhật trạng thái ghế luôn kèm điều kiện `WHERE version = @old_version`. Nếu có người khác đã sửa, câu lệnh cập nhật sẽ trả về 0 hàng bị ảnh hưởng.
> - **Lớp 3 (Database Constraint):** Trong bảng `tickets` có cột ảo `active_seat_key = CONCAT(trip_id, '-', seat_code)` kết hợp chỉ mục `UNIQUE KEY`. Cấp độ DB sẽ chặn đứng hoàn toàn việc phát hành 2 vé cho cùng 1 ghế trên cùng 1 chuyến.

### ❓ Câu 3: Tại sao lại cần snapshot giá ghế trong `trip_seat_prices` và `tickets` mà không join trực tiếp từ bảng tuyến đường?
> **Trả lời:**
> Giá tuyến đường có thể thay đổi theo thời gian (ví dụ hôm nay 200.000đ, ngày mai nhà xe chỉnh lên 250.000đ). Nếu chỉ lưu quan hệ join động thì tất cả vé khách đã mua từ tuần trước sẽ bị nhảy giá sai theo giá mới, làm sai lệch báo cáo kế toán và hóa đơn đã xuất. Vì vậy, giá vé bắt buộc phải **Snapshot bất biến** tại thời điểm xuất vé!

### ❓ Câu 4: Phân hệ Multi-tenancy phân lập dữ liệu các nhà xe được thiết kế ra sao ở cấp độ Database?
> **Trả lời:**
> Bảng `users` có cột `bus_company_id`. Khi tài khoản có `role = 'BUS_COMPANY'`, tất cả các truy vấn dữ liệu (chuyến xe, doanh thu, vé, xe, tài xế) đều bắt buộc phải kèm điều kiện lọc `WHERE bus_company_id = :targetCompanyId`. Nhà xe A tuyệt đối không thể nhìn thấy chuyến xe hoặc doanh thu của Nhà xe B.
