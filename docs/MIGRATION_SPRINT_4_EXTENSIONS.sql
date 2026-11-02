-- ============================================================================
-- TRAVEL EASY PLATFORM — SPRINT 4 DATABASE MIGRATION SCRIPT
-- Mô tả: Bổ sung các trường và bảng dữ liệu phục vụ các phân hệ mở rộng Sprint 4:
--   1. Phân hệ Quầy vé bến xe của Nhà xe (POS Counter & Shift Management)
--   2. Dịch vụ Thuê xe Hợp đồng du lịch (Charter Requests & Bidding Escrow)
--   3. Ký gửi hàng hóa bưu kiện hầm xe (Cargo Orders & Tracking)
--   4. Định vị GPS xe khách thời gian thực (Live GPS Tracking)
--   5. Quản trị giá vé động & Flash Sale (Dynamic Pricing Rules)
--   6. Ví tích điểm EasyXu & Bảo hiểm chuyến đi (Rewards & Insurance)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PHẦN 1: BỔ SUNG CỘT CHO CÁC BẢNG HIỆN HỮU (ALTER TABLE)
-- ----------------------------------------------------------------------------

-- 1.1. Bổ sung nguồn đặt vé và ca trực cho bảng `bookings`
ALTER TABLE bookings
  ADD COLUMN booking_channel VARCHAR(20) NOT NULL DEFAULT 'ONLINE' 
    COMMENT 'Kênh đặt vé: ONLINE, POS_COUNTER, PHONE_ORDER',
  ADD COLUMN pos_shift_id CHAR(36) NULL 
    COMMENT 'ID ca trực nếu đặt vé tại quầy bến xe',
  ADD COLUMN staff_user_id CHAR(36) NULL 
    COMMENT 'Nhân viên quầy thực hiện bán vé';

-- 1.2. Bổ sung trạng thái in vé nhiệt và bảo hiểm cho bảng `tickets`
ALTER TABLE tickets
  ADD COLUMN is_printed TINYINT(1) NOT NULL DEFAULT 0 
    COMMENT 'Đã in vé nhiệt giấy tại quầy: 0=Chưa, 1=Đã in',
  ADD COLUMN printed_at DATETIME(3) NULL 
    COMMENT 'Thời điểm in vé nhiệt tại bến xe',
  ADD COLUMN has_insurance TINYINT(1) NOT NULL DEFAULT 0 
    COMMENT 'Có mua gói bảo hiểm tai nạn chuyến đi (10.000đ): 0=Không, 1=Có';

-- 1.3. Bổ sung tọa độ GPS thời gian thực cho bảng `trips`
ALTER TABLE trips
  ADD COLUMN current_latitude DECIMAL(10, 7) NULL 
    COMMENT 'Tọa độ vĩ độ hiện tại của xe',
  ADD COLUMN current_longitude DECIMAL(10, 7) NULL 
    COMMENT 'Tọa độ kinh độ hiện tại của xe',
  ADD COLUMN current_speed_kmh INT NULL DEFAULT 0 
    COMMENT 'Tốc độ xe chạy hiện tại (km/h)',
  ADD COLUMN last_gps_updated_at DATETIME(3) NULL 
    COMMENT 'Thời điểm xe gửi tọa độ GPS gần nhất';


-- ----------------------------------------------------------------------------
-- PHẦN 2: TẠO 8 BẢNG MỚI PHỤC VỤ SPRINT 4 (CREATE TABLE)
-- ----------------------------------------------------------------------------

-- 2.1. Bảng Quản lý Ca trực Quầy vé Tiền mặt của Nhà xe
CREATE TABLE pos_shifts (
  id                      CHAR(36)      NOT NULL DEFAULT (UUID()),
  company_id              CHAR(36)      NOT NULL COMMENT 'Nhà xe sở hữu quầy',
  staff_user_id           CHAR(36)      NOT NULL COMMENT 'Nhân viên trực ca',
  terminal_location_id    CHAR(36)      NOT NULL COMMENT 'Vị trí bến xe (BXMĐ, Bến xe Miền Tây...)',
  counter_name            VARCHAR(50)   NOT NULL DEFAULT 'Quầy số 1' COMMENT 'Tên/Số quầy vé tại bến',
  opened_at               DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  closed_at               DATETIME(3)   NULL,
  initial_cash_amount     DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'Tiền mặt lẻ đầu ca để thối',
  total_cash_collected    DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng tiền mặt thu trong ca',
  total_qr_collected      DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng tiền quét VietQR tại quầy',
  total_tickets_sold      INT           NOT NULL DEFAULT 0    COMMENT 'Tổng số vé bán ra trong ca',
  status                  VARCHAR(20)   NOT NULL DEFAULT 'OPEN' COMMENT 'OPEN, CLOSED, AUDITED',
  notes                   TEXT          NULL,
  created_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_pos_shifts_company (company_id),
  KEY idx_pos_shifts_staff (staff_user_id),
  CONSTRAINT fk_pos_shifts_company FOREIGN KEY (company_id) REFERENCES bus_companies(id),
  CONSTRAINT fk_pos_shifts_staff FOREIGN KEY (staff_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2.2. Bảng Yêu cầu Thuê xe Hợp đồng Du lịch (Charter Requests)
CREATE TABLE charter_requests (
  id                      CHAR(36)      NOT NULL DEFAULT (UUID()),
  customer_user_id        CHAR(36)      NULL COMMENT 'NULL nếu khách vãng lai đặt tại quầy',
  contact_full_name       VARCHAR(255)  NOT NULL,
  contact_phone_number    VARCHAR(20)   NOT NULL,
  origin_address          VARCHAR(255)  NOT NULL COMMENT 'Điểm đón (Ví dụ: 123 Nguyễn Huệ, Q.1)',
  destination_address     VARCHAR(255)  NOT NULL COMMENT 'Điểm đến (Ví dụ: Bãi Sau Vũng Tàu)',
  departure_time          DATETIME(3)   NOT NULL COMMENT 'Ngày giờ khởi hành đi',
  return_time             DATETIME(3)   NULL     COMMENT 'Ngày giờ về (nếu thuê 2 chiều)',
  vehicle_type_needed     VARCHAR(30)   NOT NULL COMMENT '16_SEAT, 29_SEAT, 34_ROOM, 45_SEAT',
  estimated_distance_km   INT           NOT NULL DEFAULT 0 COMMENT 'Ước tính khoảng cách km',
  special_requests        TEXT          NULL COMMENT 'Karaoke, nước suối, ghế massage...',
  status                  VARCHAR(30)   NOT NULL DEFAULT 'PENDING_QUOTES' 
    COMMENT 'PENDING_QUOTES, QUOTED, DEPOSIT_PAID, IN_PROGRESS, COMPLETED, CANCELLED',
  created_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_charter_customer (customer_user_id),
  KEY idx_charter_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2.3. Bảng Báo giá Đấu thầu Thuê xe của các Nhà xe (Charter Bids & Escrow)
CREATE TABLE charter_bids (
  id                      CHAR(36)      NOT NULL DEFAULT (UUID()),
  charter_request_id      CHAR(36)      NOT NULL,
  company_id              CHAR(36)      NOT NULL COMMENT 'Nhà xe gửi báo giá',
  vehicle_id              CHAR(36)      NULL     COMMENT 'Xe phân công chạy hợp đồng',
  driver_user_id          CHAR(36)      NULL     COMMENT 'Tài xế phân công',
  quoted_total_price      DECIMAL(14,2) NOT NULL COMMENT 'Giá trọn gói nhà xe đề xuất',
  required_deposit_amount DECIMAL(14,2) NOT NULL COMMENT 'Số tiền cọc 30% giữ chỗ',
  escrow_status           VARCHAR(30)   NOT NULL DEFAULT 'NOT_PAID' 
    COMMENT 'NOT_PAID, HELD_IN_ESCROW (Sàn đang giữ cọc), RELEASED_TO_COMPANY, REFUNDED',
  bid_status              VARCHAR(20)   NOT NULL DEFAULT 'OFFERED' 
    COMMENT 'OFFERED, ACCEPTED, REJECTED, EXPIRED',
  company_notes           TEXT          NULL COMMENT 'Ghi chú tiện ích xe, bảo hiểm...',
  created_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_charter_bids_request (charter_request_id),
  KEY idx_charter_bids_company (company_id),
  CONSTRAINT fk_bids_request FOREIGN KEY (charter_request_id) REFERENCES charter_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_bids_company FOREIGN KEY (company_id) REFERENCES bus_companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2.4. Bảng Đơn Hàng Gửi Hàng Hóa Bưu Kiện Hầm Xe (Cargo Orders)
CREATE TABLE cargo_orders (
  id                      CHAR(36)      NOT NULL DEFAULT (UUID()),
  tracking_code           VARCHAR(30)   NOT NULL COMMENT 'Mã vận đơn bưu kiện: CG-2026-XXXXX',
  company_id              CHAR(36)      NOT NULL COMMENT 'Nhà xe vận chuyển',
  trip_id                 CHAR(36)      NULL     COMMENT 'Chuyến xe chở hàng',
  sender_name             VARCHAR(255)  NOT NULL,
  sender_phone            VARCHAR(20)   NOT NULL,
  receiver_name           VARCHAR(255)  NOT NULL,
  receiver_phone          VARCHAR(20)   NOT NULL,
  origin_point_id         CHAR(36)      NOT NULL COMMENT 'Điểm gửi hàng tại bến đi',
  destination_point_id    CHAR(36)      NOT NULL COMMENT 'Điểm nhận hàng tại bến đến',
  cargo_type              VARCHAR(30)   NOT NULL COMMENT 'DOCUMENT, PARCEL, HEAVY, BIKE, FRESH_FOOD',
  weight_kg               DECIMAL(6,2)  NOT NULL DEFAULT 1.00,
  dimensions_cm           VARCHAR(50)   NULL     COMMENT 'Dài x Rộng x Cao (cm)',
  shipping_fee            DECIMAL(14,2) NOT NULL COMMENT 'Tiền cước vận chuyển',
  cod_amount              DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'Tiền thu hộ COD (nếu có)',
  payment_status          VARCHAR(20)   NOT NULL DEFAULT 'PAID' COMMENT 'PAID, UNPAID_COD',
  status                  VARCHAR(30)   NOT NULL DEFAULT 'RECEIVED_AT_TERMINAL'
    COMMENT 'RECEIVED_AT_TERMINAL, IN_TRANSIT, ARRIVED_AT_DESTINATION, DELIVERED, RETURNED',
  delivery_otp_code       CHAR(6)       NOT NULL COMMENT 'Mã OTP 6 số để nhận hàng tại bến',
  created_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_cargo_tracking (tracking_code),
  KEY idx_cargo_company (company_id),
  KEY idx_cargo_receiver (receiver_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2.5. Bảng Nhật Ký Tọa Độ GPS Xe Chạy Thời Gian Thực (Trip Tracking Logs)
CREATE TABLE trip_tracking_logs (
  id                      BIGINT AUTO_INCREMENT NOT NULL,
  trip_id                 CHAR(36)      NOT NULL,
  latitude                DECIMAL(10, 7) NOT NULL,
  longitude               DECIMAL(10, 7) NOT NULL,
  speed_kmh               INT           NOT NULL DEFAULT 0,
  heading_degrees         INT           NULL DEFAULT 0 COMMENT 'Góc hướng xe chạy (0 - 360)',
  recorded_at             DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_tracking_trip_time (trip_id, recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2.6. Bảng Quản Trị Giá Vé Động & Flash Sale (Dynamic Pricing Rules)
CREATE TABLE dynamic_pricing_rules (
  id                      CHAR(36)      NOT NULL DEFAULT (UUID()),
  company_id              CHAR(36)      NOT NULL,
  route_template_id       CHAR(36)      NULL COMMENT 'NULL nghĩa là áp dụng toàn bộ tuyến của hãng',
  rule_name               VARCHAR(100)  NOT NULL COMMENT 'Tên luật giá: Flash Sale Đêm, Phụ Thu Lễ 30/4...',
  rule_type               VARCHAR(30)   NOT NULL COMMENT 'SURCHARGE_HOLIDAY, FLASH_SALE_LAST_HOUR, EARLY_BIRD',
  adjustment_percent      DECIMAL(5,2)  NOT NULL COMMENT 'Phần trăm tăng/giảm (+20.00 hoặc -15.00)',
  condition_hours_before  INT           NULL     COMMENT 'Áp dụng khi còn cách giờ chạy X tiếng',
  condition_empty_seat_threshold INT   NULL     COMMENT 'Áp dụng khi tỷ lệ trống > X chỗ',
  start_date              DATE          NULL,
  end_date                DATE          NULL,
  is_active               TINYINT(1)    NOT NULL DEFAULT 1,
  created_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_pricing_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2.7. Bảng Ví Tích Điểm Thưởng Khách Hàng (User Reward Wallets)
CREATE TABLE user_reward_wallets (
  user_id                 CHAR(36)      NOT NULL,
  balance_points          INT           NOT NULL DEFAULT 0    COMMENT 'Số dư EasyXu khả dụng (1 Xu = 1 VNĐ)',
  total_earned_points     INT           NOT NULL DEFAULT 0    COMMENT 'Tổng xu đã tích lũy từ trước đến nay',
  total_spent_points      INT           NOT NULL DEFAULT 0    COMMENT 'Tổng xu đã đổi trừ tiền vé',
  updated_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id),
  CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2.8. Bảng Hợp Đồng Bảo Hiểm Chuyến Đi (Travel Insurance Policies)
CREATE TABLE travel_insurance_policies (
  id                      CHAR(36)      NOT NULL DEFAULT (UUID()),
  ticket_id               CHAR(36)      NOT NULL,
  policy_number           VARCHAR(50)   NOT NULL COMMENT 'Mã hợp đồng: BV-2026-XXXXX',
  insurance_provider      VARCHAR(50)   NOT NULL DEFAULT 'BaoViet_Insurance' COMMENT 'Bảo Việt / PTI',
  premium_amount          DECIMAL(10,2) NOT NULL DEFAULT 10000.00 COMMENT 'Phí bảo hiểm 10.000đ/vé',
  max_coverage_amount     DECIMAL(14,2) NOT NULL DEFAULT 400000000.00 COMMENT 'Mức đền bù tối đa 400 triệu',
  claim_status            VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, CLAIM_SUBMITTED, PAID, REJECTED',
  created_at              DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_insurance_ticket (ticket_id),
  CONSTRAINT fk_insurance_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
