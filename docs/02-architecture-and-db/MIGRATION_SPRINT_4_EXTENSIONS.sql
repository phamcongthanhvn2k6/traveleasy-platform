-- ============================================================================
-- TRAVEL EASY PLATFORM — SPRINT 4 DATABASE MIGRATION SCRIPT
-- Mô tả: Bổ sung các trường và bảng dữ liệu phục vụ các phân hệ mở rộng Sprint 4:
--   1. Phân hệ Quầy vé bến xe của Nhà xe (POS Counter & Shift Management)
--   2. Dịch vụ Thuê xe Hợp đồng du lịch (Charter Requests & Bidding Escrow)
--   3. Ký gửi hàng hóa bưu kiện hầm xe (Cargo Orders & Tracking)
--   4. Định vị GPS xe khách thời gian thực (Live GPS Tracking)
--   5. Quản trị giá vé động & Flash Sale (Dynamic Pricing Rules)
--   6. Ví tích điểm EasyXu & Bảo hiểm chuyến đi (Rewards & Insurance)
--   7. Vận hành nâng cao: Tổ lái, Trung chuyển, Thu chi chuyến, Đổi vé
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PHẦN 1: BỔ SUNG CỘT CHO CÁC BẢNG HIỆN HỮU (ALTER TABLE)
-- ----------------------------------------------------------------------------

-- 1.1. Bổ sung nguồn đặt vé và ca trực cho bảng `bookings`
-- Giúp hệ thống phân định vé bán qua Website/App hay bán trực tiếp tại Quầy bến xe
ALTER TABLE bookings
  ADD COLUMN booking_channel VARCHAR(20) NOT NULL DEFAULT 'ONLINE' 
    COMMENT 'Kênh đặt vé: ONLINE (khách tự đặt qua App/Web), POS_COUNTER (mua tại quầy vé bến xe), PHONE_ORDER (gọi tổng đài đặt giữ chỗ)',
  ADD COLUMN pos_shift_id CHAR(36) NULL 
    COMMENT 'Mã ca trực (pos_shifts.id) thực hiện giao dịch này — phục vụ chốt sổ đối soát doanh thu ca cuối ngày (Z-Report)',
  ADD COLUMN staff_user_id CHAR(36) NULL 
    COMMENT 'Mã nhân viên quầy vé (users.id) trực tiếp thao tác bán và in vé cho khách tại bến xe';

-- 1.2. Bổ sung trạng thái in vé nhiệt và bảo hiểm cho bảng `tickets`
-- Hỗ trợ in vé cứng cầm tay tại quầy POS và đính kèm gói bảo hiểm tai nạn
ALTER TABLE tickets
  ADD COLUMN is_printed TINYINT(1) NOT NULL DEFAULT 0 
    COMMENT 'Trạng thái in vé nhiệt bến xe (khổ K80): 0=Chưa in (chỉ có vé điện tử), 1=Đã in vé cứng ra giấy tại quầy',
  ADD COLUMN printed_at DATETIME(3) NULL 
    COMMENT 'Thời điểm chính xác nhân viên quầy bấm lệnh in cuộn vé nhiệt cho khách tại bến',
  ADD COLUMN has_insurance TINYINT(1) NOT NULL DEFAULT 0 
    COMMENT 'Đánh dấu vé có mua kèm gói bảo hiểm tai nạn chuyến đi bắt buộc/tự nguyện (10.000đ/vé): 0=Không mua, 1=Đã mua bảo hiểm';

-- 1.3. Bổ sung tọa độ GPS thời gian thực cho bảng `trips`
-- Lưu trữ vị trí vệ tinh mới nhất của xe để hiển thị tức thì trên bản đồ khách hàng
ALTER TABLE trips
  ADD COLUMN current_latitude DECIMAL(10, 7) NULL 
    COMMENT 'Tọa độ Vĩ độ (Latitude) mới nhất của xe do tài xế buồng lái phát lên (Ví dụ: 10.776889)',
  ADD COLUMN current_longitude DECIMAL(10, 7) NULL 
    COMMENT 'Tọa độ Kinh độ (Longitude) mới nhất của xe do tài xế buồng lái phát lên (Ví dụ: 106.700806)',
  ADD COLUMN current_speed_kmh INT NULL DEFAULT 0 
    COMMENT 'Thông số viễn thông phụ trợ thiết bị buồng lái (km/h) - Không dùng để kiểm định phạt tốc độ',
  ADD COLUMN last_gps_updated_at DATETIME(3) NULL 
    COMMENT 'Thời điểm máy chủ nhận được gói tin định vị GPS gần nhất từ buồng lái';


-- ----------------------------------------------------------------------------
-- PHẦN 2: TẠO CÁC BẢNG MỚI PHỤC VỤ SPRINT 4 (CREATE TABLE)
-- ----------------------------------------------------------------------------

-- 2.1. Bảng Quản lý Ca trực Quầy vé Tiền mặt của Nhà xe (POS Shifts)
-- Nghiệp vụ: Mỗi nhân viên khi vào ca sáng/chiều sẽ mở ca, nhập số tiền lẻ đầu ca để thối, 
-- cuối ca hệ thống tính tổng tiền vé bán ra và so sánh với tiền mặt thực tế trong két (Báo cáo Z-Report).
CREATE TABLE IF NOT EXISTS pos_shifts (
  id                      CHAR(36)      NOT NULL DEFAULT (UUID()) COMMENT 'Mã định danh duy nhất của ca trực (UUID v4)',
  company_id              CHAR(36)      NOT NULL COMMENT 'Khóa ngoại trỏ đến nhà xe (bus_companies.id) sở hữu quầy vé',
  staff_user_id           CHAR(36)      NOT NULL COMMENT 'Khóa ngoại trỏ đến nhân viên thu ngân/bán vé đang phụ trách ca trực (users.id)',
  terminal_location_id    CHAR(36)      NOT NULL COMMENT 'Địa điểm bến xe nơi đặt quầy (Ví dụ: Bến xe Miền Đông mới, Bến xe An Sương)',
  counter_name            VARCHAR(50)   NOT NULL DEFAULT 'Quầy số 1' COMMENT 'Tên gọi hoặc số thứ tự nhận diện quầy vé vật lý (Ví dụ: Quầy FUTA 05)',
  opened_at               DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm nhân viên bấm Bắt đầu mở ca trực',
  closed_at               DATETIME(3)   NULL COMMENT 'Thời điểm chốt ca trực và in biên bản bàn giao Z-Report (NULL nếu ca đang mở)',
  initial_cash_amount     DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'Số tiền mặt lẻ ban đầu bàn giao vào hộc tiền để thối lại cho khách',
  total_cash_collected    DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng số tiền mặt thực tế thu được từ việc bán vé trong ca trực',
  total_qr_collected      DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng doanh thu vé khách thanh toán bằng quét mã VietQR tĩnh/động tại quầy',
  total_tickets_sold      INT           NOT NULL DEFAULT 0    COMMENT 'Tổng số lượng vé in xuất thành công trong suốt thời gian của ca trực',
  status                  VARCHAR(20)   NOT NULL DEFAULT 'OPEN' COMMENT 'Trạng thái ca: OPEN (Đang mở bán), CLOSED (Đã chốt ca), AUDITED (Kế toán đã duyệt)',
  notes                   TEXT          NULL COMMENT 'Ghi chú bàn giao ca, giải trình lệch quỹ tiền mặt (thừa/thiếu so với hệ thống)',
  created_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm bản ghi ca trực được khởi tạo',
  updated_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm cập nhật ca trực gần nhất',
  PRIMARY KEY (id),
  KEY idx_pos_shifts_company (company_id),
  KEY idx_pos_shifts_staff (staff_user_id),
  CONSTRAINT fk_pos_shifts_company FOREIGN KEY (company_id) REFERENCES bus_companies(id),
  CONSTRAINT fk_pos_shifts_staff FOREIGN KEY (staff_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Quản lý ca trực quầy vé bến xe, đối soát doanh thu tiền mặt & QR, bàn giao quỹ Z-Report.';


-- 2.2. Bảng Yêu cầu Thuê xe Hợp đồng Du lịch (Charter Requests)
-- Nghiệp vụ: Khách hàng đoàn thể, công ty có nhu cầu thuê nguyên chuyến xe (16-45 chỗ) đi du lịch, 
-- gửi yêu cầu để các nhà xe trên sàn cùng tham gia chào giá cạnh tranh.
CREATE TABLE IF NOT EXISTS charter_requests (
  id                      CHAR(36)      NOT NULL DEFAULT (UUID()) COMMENT 'Mã định danh duy nhất của yêu cầu thuê xe (UUID v4)',
  customer_user_id        CHAR(36)      NULL COMMENT 'Mã tài khoản khách hàng đặt thuê (NULL nếu là khách vãng lai gọi điện/đến quầy)',
  contact_full_name       VARCHAR(255)  NOT NULL COMMENT 'Họ tên người liên hệ đại diện đoàn khách thuê xe',
  contact_phone_number    VARCHAR(20)   NOT NULL COMMENT 'Số điện thoại liên hệ trực tiếp để thỏa thuận hợp đồng',
  origin_address          VARCHAR(255)  NOT NULL COMMENT 'Địa chỉ đón đoàn chi tiết (Ví dụ: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1)',
  destination_address     VARCHAR(255)  NOT NULL COMMENT 'Địa chỉ điểm đến du lịch (Ví dụ: Khách sạn Mường Thanh, Bãi Sau, TP. Vũng Tàu)',
  departure_time          DATETIME(3)   NOT NULL COMMENT 'Thời điểm xe phải có mặt tại điểm đón để khởi hành đi',
  return_time             DATETIME(3)   NULL     COMMENT 'Thời điểm đón đoàn quay về (NULL nếu thuê xe 1 chiều)',
  vehicle_type_needed     VARCHAR(30)   NOT NULL COMMENT 'Loại xe yêu cầu: 16_SEAT (Ford Transit), 29_SEAT (Thaco), 34_ROOM (Limousine VIP), 45_SEAT (Universe)',
  estimated_distance_km   INT           NOT NULL DEFAULT 0 COMMENT 'Khoảng cách hành trình ước tính (km) dùng làm căn cứ tính cước phí',
  special_requests        TEXT          NULL COMMENT 'Các yêu cầu phụ trợ: Có micro karaoke, nước suối khăn lạnh, khoang hành lý rộng...',
  status                  VARCHAR(30)   NOT NULL DEFAULT 'PENDING_QUOTES' 
    COMMENT 'Trạng thái hợp đồng: PENDING_QUOTES (Chờ nhà xe báo giá), QUOTED (Đã có báo giá), DEPOSIT_PAID (Đã thanh toán cọc 30%), IN_PROGRESS (Đang chạy), COMPLETED (Hoàn tất), CANCELLED (Đã hủy)',
  created_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm khách gửi yêu cầu thuê xe lên sàn',
  updated_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm cập nhật trạng thái yêu cầu',
  PRIMARY KEY (id),
  KEY idx_charter_customer (customer_user_id),
  KEY idx_charter_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Đơn yêu cầu thuê xe hợp đồng du lịch nguyên chuyến từ khách đoàn / công ty.';


-- 2.3. Bảng Báo giá Đấu thầu Thuê xe của các Nhà xe (Charter Bids & Escrow)
-- Nghiệp vụ: Các đối tác nhà xe xem danh sách yêu cầu thuê xe và gửi bảng báo giá trọn gói cạnh tranh.
-- Sàn TravelEasy đóng vai trò bên thứ ba giữ tiền cọc 30% (Escrow) để đảm bảo quyền lợi cho cả 2 bên.
CREATE TABLE IF NOT EXISTS charter_bids (
  id                      CHAR(36)      NOT NULL DEFAULT (UUID()) COMMENT 'Mã định danh gói báo giá đấu thầu (UUID v4)',
  charter_request_id      CHAR(36)      NOT NULL COMMENT 'Khóa ngoại trỏ đến yêu cầu thuê xe tương ứng (charter_requests.id)',
  company_id              CHAR(36)      NOT NULL COMMENT 'Khóa ngoại trỏ đến nhà xe tham gia chào giá (bus_companies.id)',
  vehicle_id              CHAR(36)      NULL     COMMENT 'Xe dự kiến phân công chạy hợp đồng (vehicles.id)',
  driver_user_id          CHAR(36)      NULL     COMMENT 'Tài xế dự kiến lái chuyến hợp đồng này (users.id)',
  quoted_total_price      DECIMAL(14,2) NOT NULL COMMENT 'Tổng giá trọn gói nhà xe đề xuất (đã bao gồm phí cầu đường, xăng dầu, tài xế)',
  required_deposit_amount DECIMAL(14,2) NOT NULL COMMENT 'Số tiền cọc bắt buộc (thường quy định 30% tổng giá trị) để giữ xe',
  escrow_status           VARCHAR(30)   NOT NULL DEFAULT 'NOT_PAID' 
    COMMENT 'Trạng thái tiền cọc trung gian: NOT_PAID (Chưa nộp), HELD_IN_ESCROW (Sàn đang tạm giữ bảo chứng), RELEASED_TO_COMPANY (Sàn đã thanh toán cho nhà xe sau khi hoàn thành), REFUNDED (Đã hoàn lại cho khách)',
  bid_status              VARCHAR(20)   NOT NULL DEFAULT 'OFFERED' 
    COMMENT 'Trạng thái gói báo giá: OFFERED (Đã gửi chào giá), ACCEPTED (Khách chọn báo giá này), REJECTED (Khách từ chối/chọn hãng khác), EXPIRED (Quá hạn phản hồi)',
  company_notes           TEXT          NULL COMMENT 'Cam kết chất lượng của nhà xe: Xe đời mới 2024, bảo hiểm hành khách 100tr/vụ...',
  created_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm nhà xe gửi bản báo giá',
  PRIMARY KEY (id),
  KEY idx_charter_bids_request (charter_request_id),
  KEY idx_charter_bids_company (company_id),
  CONSTRAINT fk_bids_request FOREIGN KEY (charter_request_id) REFERENCES charter_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_bids_company FOREIGN KEY (company_id) REFERENCES bus_companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Báo giá đấu thầu xe hợp đồng du lịch và cơ chế bảo chứng cọc Escrow 30%.';


-- 2.4. Bảng Đơn Hàng Gửi Hàng Hóa Bưu Kiện Hầm Xe (Cargo Orders)
-- Nghiệp vụ: Quản lý bưu phẩm, hàng hóa gửi theo hầm xe khách liên tỉnh. Có mã vận đơn tra cứu,
-- bảo mật bằng mã OTP nhận hàng tại bến, hỗ trợ thu hộ tiền hàng COD.
CREATE TABLE IF NOT EXISTS cargo_orders (
  id                      CHAR(36)      NOT NULL DEFAULT (UUID()) COMMENT 'Mã định danh duy nhất của đơn ký gửi hàng hóa (UUID v4)',
  tracking_code           VARCHAR(30)   NOT NULL COMMENT 'Mã vận đơn bưu kiện định dạng chuẩn: CG-2026-XXXXX để khách tra cứu tiến độ',
  company_id              CHAR(36)      NOT NULL COMMENT 'Khóa ngoại trỏ đến nhà xe thực hiện vận chuyển (bus_companies.id)',
  trip_id                 CHAR(36)      NULL     COMMENT 'Khóa ngoại trỏ đến chuyến xe cụ thể chở kiện hàng này (trips.id)',
  sender_name             VARCHAR(255)  NOT NULL COMMENT 'Họ tên đầy đủ của người gửi hàng tại văn phòng bến xe',
  sender_phone            VARCHAR(20)   NOT NULL COMMENT 'Số điện thoại người gửi để nhận tin nhắn SMS thông báo tình trạng đơn',
  receiver_name           VARCHAR(255)  NOT NULL COMMENT 'Họ tên đầy đủ của người nhận hàng tại điểm đến',
  receiver_phone          VARCHAR(20)   NOT NULL COMMENT 'Số điện thoại người nhận (dùng để xác thực và nhận mã OTP lấy hàng)',
  origin_point_id         CHAR(36)      NOT NULL COMMENT 'Điểm gửi hàng/văn phòng nhà xe tại bến đi (locations.id hoặc trip_points.id)',
  destination_point_id    CHAR(36)      NOT NULL COMMENT 'Điểm nhận hàng/văn phòng bến xe tại điểm đến nơi trả hàng',
  cargo_type              VARCHAR(30)   NOT NULL COMMENT 'Phân loại hàng hóa: DOCUMENT (Tài liệu, thư tín), PARCEL (Bưu kiện tiêu chuẩn), HEAVY (Hàng nặng/cồng kềnh), BIKE (Xe máy/xe đạp điện), FRESH_FOOD (Thực phẩm tươi sống/đông lạnh)',
  weight_kg               DECIMAL(6,2)  NOT NULL DEFAULT 1.00 COMMENT 'Trọng lượng kiện hàng (kg) dùng để áp biểu cước vận chuyển',
  dimensions_cm           VARCHAR(50)   NULL     COMMENT 'Kích thước ba chiều: Dài x Rộng x Cao tính bằng cm (Ví dụ: 40x30x20)',
  shipping_fee            DECIMAL(14,2) NOT NULL COMMENT 'Cước phí vận chuyển hàng hóa thu theo bảng giá niêm yết của nhà xe',
  cod_amount              DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'Số tiền nhờ nhà xe thu hộ người nhận (COD - Cash on Delivery)',
  payment_status          VARCHAR(20)   NOT NULL DEFAULT 'PAID' COMMENT 'Tình trạng cước: PAID (Người gửi đã trả trước), UNPAID_COD (Người nhận trả cước và tiền hàng)',
  status                  VARCHAR(30)   NOT NULL DEFAULT 'RECEIVED_AT_TERMINAL'
    COMMENT 'Vòng đời đơn hàng: RECEIVED_AT_TERMINAL (Đã nhận hàng tại quầy bến), IN_TRANSIT (Hàng đang nằm trong hầm xe di chuyển), ARRIVED_AT_DESTINATION (Hàng đã tới kho bến đích), DELIVERED (Đã giao thành công cho người nhận), RETURNED (Hàng chuyển hoàn vì không liên lạc được)',
  delivery_otp_code       CHAR(6)       NOT NULL COMMENT 'Mã OTP bí mật gồm 6 chữ số gửi qua SMS cho người nhận, bắt buộc đọc cho nhân viên kho để trả hàng',
  created_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm tiếp nhận kiện hàng tại quầy',
  updated_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm cập nhật lộ trình đơn hàng gần nhất',
  PRIMARY KEY (id),
  UNIQUE KEY uq_cargo_tracking (tracking_code),
  KEY idx_cargo_company (company_id),
  KEY idx_cargo_receiver (receiver_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Quản lý vận đơn hàng hóa ký gửi hầm xe, tra cứu bưu kiện bằng OTP bảo mật và COD.';


-- 2.5. Bảng Nhật Ký Tọa Độ GPS Xe Chạy Thời Gian Thực (Trip Tracking Logs)
-- Nghiệp vụ: Lưu vết lịch sử di chuyển viễn thông của xe theo chu kỳ (ví dụ 10 giây/lần)
-- phục vụ hiển thị vệt đường đi (Polyline) trên bản đồ và giám sát lộ trình.
CREATE TABLE IF NOT EXISTS trip_tracking_logs (
  id                      BIGINT AUTO_INCREMENT NOT NULL COMMENT 'Khóa chính tự tăng của bản ghi định vị',
  trip_id                 CHAR(36)      NOT NULL COMMENT 'Khóa ngoại trỏ đến chuyến xe đang chạy (trips.id)',
  latitude                DECIMAL(10, 7) NOT NULL COMMENT 'Tọa độ Vĩ độ GPS chính xác tại thời điểm ghi nhận (Ví dụ: 10.823099)',
  longitude               DECIMAL(10, 7) NOT NULL COMMENT 'Tọa độ Kinh độ GPS chính xác tại thời điểm ghi nhận (Ví dụ: 106.772545)',
  speed_kmh               INT           NOT NULL DEFAULT 0 COMMENT 'Thông số tốc độ phụ trợ ghi nhận từ cảm biến buồng lái',
  heading_degrees         INT           NULL DEFAULT 0 COMMENT 'Góc quay la bàn định hướng xe di chuyển (từ 0° đến 360° so với hướng Bắc)',
  recorded_at             DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm ghi nhận tọa độ GPS tại buồng lái',
  PRIMARY KEY (id),
  KEY idx_tracking_trip_time (trip_id, recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Lưu vết tọa độ GPS viễn thông theo thời gian thực phục vụ vẽ vệt hành trình trên bản đồ.';


-- 2.6. Bảng Quản Trị Giá Vé Động & Flash Sale (Dynamic Pricing Rules)
-- Nghiệp vụ: Cho phép nhà xe cấu hình thuật toán tự động điều chỉnh giá:
-- Giảm giá giờ chót (Flash sale) kích cầu khi xe sắp chạy mà còn trống nhiều chỗ;
-- Hoặc Tăng giá phụ thu dịp Lễ 30/4, Tết Nguyên Đán theo đúng quy định.
CREATE TABLE IF NOT EXISTS dynamic_pricing_rules (
  id                      CHAR(36)      NOT NULL DEFAULT (UUID()) COMMENT 'Mã định danh quy tắc giá động (UUID v4)',
  company_id              CHAR(36)      NOT NULL COMMENT 'Khóa ngoại trỏ đến nhà xe thiết lập quy tắc giá (bus_companies.id)',
  route_template_id       CHAR(36)      NULL COMMENT 'Mã tuyến đường áp dụng (NULL nghĩa là áp dụng tự động cho toàn bộ tất cả các tuyến của hãng)',
  rule_name               VARCHAR(100)  NOT NULL COMMENT 'Tên gọi dễ nhớ của quy tắc: Flash Sale Đêm Giờ Chót, Phụ Thu Cao Điểm Tết Âm Lịch...',
  rule_type               VARCHAR(30)   NOT NULL COMMENT 'Phân loại quy tắc: SURCHARGE_HOLIDAY (Phụ thu ngày lễ/tết), FLASH_SALE_LAST_HOUR (Xả vé giờ chót kích cầu), EARLY_BIRD (Ưu đãi mua vé sớm trước 30 ngày)',
  adjustment_percent      DECIMAL(5,2)  NOT NULL COMMENT 'Tỷ lệ phần trăm điều chỉnh giá: Số dương (+20.00%) là tăng giá, số âm (-15.00%) là giảm giá',
  condition_hours_before  INT           NULL     COMMENT 'Điều kiện kích hoạt: Còn cách giờ khởi hành của chuyến xe dưới X tiếng đồng hồ',
  condition_empty_seat_threshold INT   NULL     COMMENT 'Điều kiện kích hoạt: Số lượng ghế trống trên xe hiện tại còn nhiều hơn X ghế',
  start_date              DATE          NULL     COMMENT 'Ngày bắt đầu có hiệu lực của luật giá động',
  end_date                DATE          NULL     COMMENT 'Ngày kết thúc hiệu lực của luật giá động',
  is_active               TINYINT(1)    NOT NULL DEFAULT 1 COMMENT 'Trạng thái bật/tắt quy tắc: 1=Đang kích hoạt áp dụng, 0=Tạm dừng',
  created_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm tạo quy tắc giá động',
  PRIMARY KEY (id),
  KEY idx_pricing_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Thuật toán định giá vé động: Phụ thu cao điểm ngày lễ hoặc giảm giá vé giờ chót.';


-- 2.7. Bảng Ví Tích Điểm Thưởng Khách Hàng (User Reward Wallets)
-- Nghiệp vụ: Chương trình chăm sóc khách hàng thân thiết. Khách đi xe được tích 1% - 3% giá trị vé
-- thành EasyXu để trừ tiền trực tiếp vào các lần đặt vé tiếp theo (1 Xu = 1 VNĐ).
CREATE TABLE IF NOT EXISTS user_reward_wallets (
  user_id                 CHAR(36)      NOT NULL COMMENT 'Khóa chính và khóa ngoại liên kết 1-1 với tài khoản người dùng (users.id)',
  balance_points          INT           NOT NULL DEFAULT 0    COMMENT 'Số dư điểm thưởng EasyXu hiện có trong ví, sẵn sàng sử dụng (1 Xu = 1 VNĐ)',
  total_earned_points     INT           NOT NULL DEFAULT 0    COMMENT 'Tổng tích lũy số Xu đã được cộng thưởng từ trước đến nay qua các chuyến đi hoàn tất',
  total_spent_points      INT           NOT NULL DEFAULT 0    COMMENT 'Tổng tích lũy số Xu khách hàng đã sử dụng để cấn trừ vào tiền thanh toán vé',
  updated_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm ví điểm thưởng thay đổi số dư gần nhất',
  PRIMARY KEY (user_id),
  CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Ví tích điểm thưởng khách hàng thân thiết EasyXu (1 điểm = 1 VNĐ giảm trừ tiền vé).';


-- 2.8. Bảng Hợp Đồng Bảo Hiểm Chuyến Đi (Travel Insurance Policies)
-- Nghiệp vụ: Tích hợp với đơn vị bảo hiểm (Bảo Việt / PTI). Mỗi vé xe có thể mua kèm
-- bảo hiểm tai nạn hành khách với mức phí 10.000đ để được bảo hiểm quyền lợi lên tới 400 triệu đồng.
CREATE TABLE IF NOT EXISTS travel_insurance_policies (
  id                      CHAR(36)      NOT NULL DEFAULT (UUID()) COMMENT 'Mã định danh duy nhất của hợp đồng bảo hiểm điện tử (UUID v4)',
  ticket_id               CHAR(36)      NOT NULL COMMENT 'Khóa ngoại liên kết 1-1 với vé xe khách hàng đã mua (tickets.id)',
  policy_number           VARCHAR(50)   NOT NULL COMMENT 'Số hợp đồng chứng nhận bảo hiểm chính thức do công ty bảo hiểm cấp (Ví dụ: BV-2026-998811)',
  insurance_provider      VARCHAR(50)   NOT NULL DEFAULT 'BaoViet_Insurance' COMMENT 'Tên đơn vị bảo hiểm bảo trợ: BaoViet_Insurance (Bảo Việt), PTI (Bưu Điện)...',
  premium_amount          DECIMAL(10,2) NOT NULL DEFAULT 10000.00 COMMENT 'Phí bảo hiểm thu của hành khách trên mỗi vé xe (10.000 VNĐ)',
  max_coverage_amount     DECIMAL(14,2) NOT NULL DEFAULT 400000000.00 COMMENT 'Hạn mức trách nhiệm bồi thường thiệt hại tối đa cho hành khách (400.000.000 VNĐ)',
  claim_status            VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE' 
    COMMENT 'Tình trạng hợp đồng bảo hiểm: ACTIVE (Đang có hiệu lực bảo vệ), CLAIM_SUBMITTED (Đã nộp hồ sơ yêu cầu bồi thường sự cố), PAID (Đã chi trả bồi thường xong), REJECTED (Từ chối bồi thường do gian lận)',
  created_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm cấp đơn bảo hiểm (ngay sau khi thanh toán vé thành công)',
  PRIMARY KEY (id),
  UNIQUE KEY uq_insurance_ticket (ticket_id),
  CONSTRAINT fk_insurance_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Chứng nhận bảo hiểm tai nạn hành khách chuyến đi liên kết cùng công ty bảo hiểm uy tín.';


-- ----------------------------------------------------------------------------
-- PHẦN 3: CÁC BẢNG BỔ SUNG NGHIỆP VỤ VẬN HÀNH NÂNG CAO (OPERATIONAL EXPANSIONS)
-- ----------------------------------------------------------------------------

-- 3.1. Bảng Phân Công Tổ Lái & Tiếp Viên (Trip Crews)
-- Nghiệp vụ: Tuân thủ quy định an toàn giao thông đường bộ: Giám sát tài xế chính, tài xế phụ,
-- phụ xe, theo dõi số giờ lái xe liên tục không vượt quá 4 giờ quy định.
CREATE TABLE IF NOT EXISTS trip_crews (
  id                      BIGINT AUTO_INCREMENT NOT NULL COMMENT 'Khóa chính tự tăng của bản ghi phân công tổ lái',
  trip_id                 CHAR(36)      NOT NULL COMMENT 'Khóa ngoại trỏ đến chuyến xe vận hành (trips.id)',
  bus_company_id          CHAR(36)      NOT NULL COMMENT 'Khóa ngoại trỏ đến nhà xe chủ quản (bus_companies.id)',
  primary_driver_name     VARCHAR(100)  NOT NULL COMMENT 'Họ tên tài xế lái chính cầm vô lăng',
  primary_driver_phone    VARCHAR(20)   NOT NULL COMMENT 'Số điện thoại liên lạc tài xế chính',
  primary_driver_license  VARCHAR(50)   NULL COMMENT 'Số giấy phép lái xe (GPLX) hạng E/D của tài xế chính',
  secondary_driver_name   VARCHAR(100)  NULL COMMENT 'Họ tên tài xế phụ đổi lái trên đường dài',
  secondary_driver_phone  VARCHAR(20)   NULL COMMENT 'Số điện thoại tài xế phụ',
  conductor_name          VARCHAR(100)  NULL COMMENT 'Họ tên nhân viên tiếp viên / phụ xe phục vụ hành khách',
  conductor_phone         VARCHAR(20)   NULL COMMENT 'Số điện thoại phụ xe',
  continuous_drive_hours  DECIMAL(4,1)  NOT NULL DEFAULT 0.0 COMMENT 'Số giờ tài xế chính đã lái xe liên tục (cảnh báo vi phạm nếu vượt quá 4.0 giờ theo luật GTĐB)',
  status                  VARCHAR(30)   NOT NULL DEFAULT 'COMPLIANT' COMMENT 'Trạng thái tuân thủ an toàn: COMPLIANT (Đạt chuẩn an toàn), WARNING_HOURS (Gần chạm ngưỡng 4 tiếng), VIOLATED (Đã vi phạm vượt giờ)',
  notes                   TEXT          NULL COMMENT 'Ghi chú kiểm tra nồng độ cồn, sức khỏe trước khi xuất bến',
  created_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm phân công tổ lái',
  updated_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm cập nhật trạng thái tổ lái',
  PRIMARY KEY (id),
  UNIQUE KEY uq_trip_crews_trip (trip_id),
  CONSTRAINT fk_trip_crews_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  CONSTRAINT fk_trip_crews_company FOREIGN KEY (bus_company_id) REFERENCES bus_companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Phân công tổ lái xe, phụ xe và kiểm soát số giờ lái xe liên tục theo luật an toàn GTĐB.';


-- 3.2. Bảng Yêu Cầu Xe Trung Chuyển Đón Khách Tận Nơi (Shuttle Requests)
-- Nghiệp vụ: Điều phối các xe nhỏ (7-16 chỗ) đón hành khách tận nhà trong nội thành
-- đưa ra bến xe trung tâm trước giờ xe lớn xuất bến, hoặc đưa khách từ bến về tận khách sạn.
CREATE TABLE IF NOT EXISTS shuttle_requests (
  id                      BIGINT AUTO_INCREMENT NOT NULL COMMENT 'Khóa chính tự tăng của yêu cầu trung chuyển',
  bus_company_id          CHAR(36)      NOT NULL COMMENT 'Khóa ngoại trỏ đến nhà xe điều hành xe trung chuyển (bus_companies.id)',
  booking_id              CHAR(36)      NULL COMMENT 'Khóa ngoại trỏ đến mã đơn đặt vé của khách (bookings.id)',
  passenger_name          VARCHAR(100)  NOT NULL COMMENT 'Họ tên hành khách cần đón/trả trung chuyển',
  passenger_phone         VARCHAR(20)   NOT NULL COMMENT 'Số điện thoại hành khách để tài xế trung chuyển gọi trước khi tới',
  pickup_address          VARCHAR(255)  NOT NULL COMMENT 'Địa chỉ nhà riêng hoặc khách sạn cần xe nhỏ tới đón',
  main_trip_id            CHAR(36)      NOT NULL COMMENT 'Khóa ngoại trỏ đến chuyến xe lớn liên tỉnh chính mà khách sẽ lên (trips.id)',
  shuttle_pickup_time     DATETIME(3)   NOT NULL COMMENT 'Giờ xe trung chuyển dự kiến có mặt tại nhà khách để đón',
  assigned_vehicle_plate  VARCHAR(30)   NULL COMMENT 'Biển số xe trung chuyển được phân công (Ví dụ: 51F-123.45)',
  shuttle_driver_name     VARCHAR(100)  NULL COMMENT 'Họ tên tài xế xe trung chuyển',
  status                  VARCHAR(30)   NOT NULL DEFAULT 'PENDING' 
    COMMENT 'Tiến độ trung chuyển: PENDING (Chờ xếp xe), ASSIGNED (Đã có xe & tài xế nhận cuốc), PICKED_UP (Đã đón khách lên xe), COMPLETED (Đã đưa khách đến bến an toàn), CANCELLED (Khách tự ra bến)',
  created_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm khách gửi yêu cầu xe trung chuyển',
  PRIMARY KEY (id),
  CONSTRAINT fk_shuttle_company FOREIGN KEY (bus_company_id) REFERENCES bus_companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_shuttle_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  CONSTRAINT fk_shuttle_main_trip FOREIGN KEY (main_trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Điều phối xe trung chuyển gom khách tận nhà ra bến xe và trả khách về khách sạn.';


-- 3.3. Bảng Sổ Chi Phí & Lợi Nhuận Từng Chuyến Xe (Trip Expenses & P&L)
-- Nghiệp vụ: Báo cáo tài chính vi mô theo từng chuyến xe giúp chủ nhà xe nắm rõ:
-- Doanh thu tiền vé trừ đi Xăng dầu, Trạm BOT, Lương tài xế, Bến bãi => Lợi nhuận ròng của chuyến.
CREATE TABLE IF NOT EXISTS trip_expenses (
  id                      BIGINT AUTO_INCREMENT NOT NULL COMMENT 'Khóa chính tự tăng của sổ thu chi chuyến xe',
  trip_id                 CHAR(36)      NOT NULL COMMENT 'Khóa ngoại trỏ đến chuyến xe tương ứng (trips.id)',
  bus_company_id          CHAR(36)      NOT NULL COMMENT 'Khóa ngoại trỏ đến nhà xe hạch toán chi phí (bus_companies.id)',
  fuel_cost               DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Chi phí tiền dầu Diesel / Xăng tiêu hao thực tế của chuyến đi',
  toll_bot_cost           DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng cước phí qua các trạm thu phí đường bộ BOT (ePass / VETC)',
  driver_salary           DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Tiền công nhật hoặc phụ cấp chuyến trả cho tài xế và phụ xe',
  terminal_fee            DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Lệ phí hoa hồng cổng xuất bến trả cho ban quản lý bến xe',
  other_costs             DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Các chi phí phát sinh khác: Nước ngọt, bánh mì phục vụ khách, sửa chữa vặt...',
  notes                   TEXT          NULL COMMENT 'Ghi chú giải trình các khoản chi phí phát sinh đột xuất',
  created_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm lập phiếu chi chuyến',
  updated_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm cập nhật số liệu hạch toán',
  PRIMARY KEY (id),
  UNIQUE KEY uq_trip_expenses_trip (trip_id),
  CONSTRAINT fk_trip_expenses_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  CONSTRAINT fk_trip_expenses_company FOREIGN KEY (bus_company_id) REFERENCES bus_companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Sổ hạch toán chi phí xăng dầu, BOT, bến bãi và phân tích lợi nhuận ròng (P&L) từng chuyến xe.';


-- 3.4. Bảng Nhật Ký Lưu Vết Đổi Vé & Chuyển Chuyến (Ticket Exchange Logs)
-- Nghiệp vụ: Lưu vết kiểm toán nghiệp vụ khi hành khách muốn đổi sang chuyến xe khác hoặc đổi số ghế:
-- Tính toán chênh lệch giá vé giữa chuyến cũ và mới, thu phụ phí chênh lệch hoặc hoàn tiền thừa cho khách.
CREATE TABLE IF NOT EXISTS ticket_exchange_logs (
  id                      BIGINT AUTO_INCREMENT NOT NULL COMMENT 'Khóa chính tự tăng của nhật ký đổi vé',
  bus_company_id          CHAR(36)      NOT NULL COMMENT 'Khóa ngoại trỏ đến nhà xe giải quyết đổi vé (bus_companies.id)',
  original_ticket_id      CHAR(36)      NOT NULL COMMENT 'Mã vé ban đầu mà khách đã mua (tickets.id)',
  new_ticket_id           CHAR(36)      NULL COMMENT 'Mã vé mới được phát hành thay thế sau khi đổi chuyến thành công (tickets.id)',
  old_trip_id             CHAR(36)      NOT NULL COMMENT 'Mã chuyến xe cũ bị hủy bỏ (trips.id)',
  new_trip_id             CHAR(36)      NOT NULL COMMENT 'Mã chuyến xe mới mà khách chuyển sang đi (trips.id)',
  old_seat_code           VARCHAR(20)   NOT NULL COMMENT 'Số ghế ngồi cũ bị trả lại kho ghế trống (Ví dụ: A01)',
  new_seat_code           VARCHAR(20)   NOT NULL COMMENT 'Số ghế ngồi mới mà khách lựa chọn trên chuyến mới (Ví dụ: B05)',
  price_difference        DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Số tiền chênh lệch giữa giá vé mới và vé cũ (Giá mới - Giá cũ)',
  surcharge_paid          DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Số tiền phụ thu thực tế khách hàng phải đóng thêm khi nâng hạng vé cao hơn',
  refund_returned         DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Số tiền nhà xe hoàn trả lại cho khách nếu đổi sang chuyến/ghế có giá thấp hơn',
  performed_by_user_id    CHAR(36)      NULL COMMENT 'Mã tài khoản nhân viên quầy thực hiện thao tác đổi vé trên phần mềm (users.id)',
  reason                  TEXT          NULL COMMENT 'Lý do khách hàng xin đổi vé (Ví dụ: Đổi giờ họp, bận việc đột xuất)',
  created_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Thời điểm thực hiện giao dịch đổi vé',
  PRIMARY KEY (id),
  CONSTRAINT fk_exchange_company FOREIGN KEY (bus_company_id) REFERENCES bus_companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_exchange_old_trip FOREIGN KEY (old_trip_id) REFERENCES trips(id),
  CONSTRAINT fk_exchange_new_trip FOREIGN KEY (new_trip_id) REFERENCES trips(id),
  CONSTRAINT fk_exchange_staff FOREIGN KEY (performed_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Nhật ký kiểm toán nghiệp vụ đổi vé, chuyển chuyến xe và cân đối chênh lệch giá vé.';
