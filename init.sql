-- =====================================================================
-- VEXERE CLONE — MYSQL 8.0+ DATABASE SCHEMA
-- Nguồn: SRS_Vexere.md + domain.md + class_diagram.md + database_design.md
-- Chuyển đổi từ thiết kế gốc (PostgreSQL) sang MySQL 8.0+
-- Quy ước:
--   - UUID: CHAR(36), sinh tại Application; DEFAULT (UUID()) làm fallback
--   - Thời gian: DATETIME(3) (lưu UTC ở tầng ứng dụng, MySQL không có kiểu
--     "with timezone" đáng tin cậy như TIMESTAMPTZ của Postgres)
--   - Tiền tệ: DECIMAL thay NUMERIC (tương đương)
--   - JSONB -> JSON
--   - BIGSERIAL -> BIGINT AUTO_INCREMENT
--   - Partial Unique Index -> generated virtual column + UNIQUE KEY
--   - PL/pgSQL trigger -> MySQL trigger (DELIMITER $$ ... SIGNAL SQLSTATE)
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS traveleasy_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE traveleasy_db;

-- =====================================================================
-- NHÓM A — IDENTITY & ACCESS
-- =====================================================================

-- A1. users (Aggregate Root: User)
CREATE TABLE users (
  id                 CHAR(36)     NOT NULL DEFAULT (UUID()),
  firebase_uid       VARCHAR(128) NULL,
  phone_number       VARCHAR(20)  NULL,
  email              VARCHAR(255) NULL,
  role               VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER',
  bus_company_id     CHAR(36)     NULL,
  account_status     VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  password           VARCHAR(255) NULL COMMENT 'Mã hóa BCrypt 12 rounds phục vụ xác thực người dùng',
  full_name          VARCHAR(100) NULL COMMENT 'Họ và tên hiển thị của người dùng',
  created_at         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  anonymized_at      DATETIME(3)  NULL,
  version            INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_firebase_uid (firebase_uid),
  UNIQUE KEY uq_users_phone (phone_number),
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT ck_users_role
    CHECK (role IN ('CUSTOMER','BUS_COMPANY','ADMIN')),
  CONSTRAINT ck_users_account_status
    CHECK (account_status IN ('ACTIVE','LOCKED','ANONYMIZED')),
  CONSTRAINT ck_users_phone_or_email
    CHECK (phone_number IS NOT NULL OR email IS NOT NULL),
  CONSTRAINT ck_users_bus_company_role
    CHECK (
      (role = 'BUS_COMPANY' AND bus_company_id IS NOT NULL)
      OR
      (role <> 'BUS_COMPANY' AND bus_company_id IS NULL)
    )
  -- FK bus_company_id -> bus_companies.id được thêm sau khi bus_companies tồn tại (xem cuối NHÓM B)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: User. bus_company_id chỉ có giá trị khi role=BUS_COMPANY (Rule [FIX 1]).';

-- A2. refresh_tokens (Entity con của User)
CREATE TABLE refresh_tokens (
  id          CHAR(36)    NOT NULL DEFAULT (UUID()),
  user_id     CHAR(36)    NOT NULL,
  issued_at   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  expires_at  DATETIME(3) NOT NULL,
  revoked     TINYINT(1)  NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_refresh_tokens_user (user_id),
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Entity con của User — xác thực phiên đăng nhập dài hạn.';

-- =====================================================================
-- NHÓM B — FLEET & SEAT CATALOG
-- =====================================================================

-- B1. bus_companies (Aggregate Root: BusCompany)
-- Lưu ý: FK default_cancellation_policy_id -> cancellation_policies được thêm
-- bằng ALTER TABLE ở cuối file (phá cycle bus_companies <-> cancellation_policies).
CREATE TABLE bus_companies (
  id                              CHAR(36)     NOT NULL DEFAULT (UUID()),
  name                            VARCHAR(255) NOT NULL,
  hotline                         VARCHAR(20)  NOT NULL,
  status                          VARCHAR(20)  NOT NULL DEFAULT 'PENDING_APPROVAL',
  default_cancellation_policy_id  CHAR(36)     NULL,
  email                           VARCHAR(100) NULL,
  address                         VARCHAR(255) NULL,
  logo_url                        VARCHAR(500) NULL,
  average_rating                  DECIMAL(2, 1) DEFAULT 5.0,
  created_at                      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at                      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  version                         INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_bus_companies_default_policy (default_cancellation_policy_id),
  CONSTRAINT ck_bus_companies_status
    CHECK (status IN ('PENDING_APPROVAL','ACTIVE','SUSPENDED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: BusCompany.';

-- B2. vehicles (Aggregate Root độc lập)
CREATE TABLE vehicles (
  id              CHAR(36)     NOT NULL DEFAULT (UUID()),
  bus_company_id  CHAR(36)     NOT NULL,
  plate_number    VARCHAR(20)  NOT NULL,
  vehicle_type    VARCHAR(20)  NOT NULL,
  status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  version         INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehicles_plate (plate_number),
  KEY idx_vehicles_bus_company (bus_company_id),
  CONSTRAINT ck_vehicles_type CHECK (vehicle_type IN ('SEAT','SEATED','SLEEPER','LIMOUSINE')),
  CONSTRAINT ck_vehicles_status CHECK (status IN ('ACTIVE','INACTIVE')),
  CONSTRAINT fk_vehicles_bus_company
    FOREIGN KEY (bus_company_id) REFERENCES bus_companies (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: Vehicle — độc lập khỏi BusCompany (Fix 8).';

-- B2a. vehicle_images (Entity con của Vehicle — Gallery / Photo support)
-- Stores multiple gallery images for one Vehicle. `display_order` controls
-- presentation order. `is_cover` identifies the active cover image.
-- `image_url` points to the original/full image; `thumbnail_url` optionally
-- points to a smaller version. Status supports soft archival.
--
-- Usage:
--   Vehicle List   → use the single ACTIVE cover image
--   Vehicle Detail → load all ACTIVE rows ORDER BY display_order ASC
--
-- Only URL/metadata is stored — no BLOBs or Base64. Actual files live in
-- an external object/image storage service.
--
-- Cover-image rule: at most ONE ACTIVE cover image per Vehicle.
-- Enforced by a generated column + UNIQUE constraint. A Vehicle may have
-- 0 cover images (all NULLs pass the MySQL UNIQUE).
CREATE TABLE vehicle_images (
  id                  CHAR(36)     NOT NULL DEFAULT (UUID()),
  vehicle_id          CHAR(36)     NOT NULL,
  image_url           VARCHAR(500) NOT NULL,
  thumbnail_url       VARCHAR(500) NULL,
  display_order       INT          NOT NULL DEFAULT 0,
  is_cover            BOOLEAN      NOT NULL DEFAULT FALSE,
  caption             VARCHAR(255) NULL,
  status              VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  -- Enforces at most 1 ACTIVE cover image per vehicle via a generated column.
  -- When is_cover=TRUE AND status='ACTIVE' → vehicle_id is materialised;
  -- otherwise NULL. MySQL UNIQUE allows multiple NULLs, so 0..N covers with
  -- is_cover=FALSE or status<>'ACTIVE' are all permitted.
  cover_vehicle_key CHAR(36)
    GENERATED ALWAYS AS (
      CASE WHEN is_cover = TRUE AND status = 'ACTIVE' THEN vehicle_id ELSE NULL END
    ) VIRTUAL,
  PRIMARY KEY (id),
  KEY idx_vehicle_images_vehicle_id (vehicle_id),
  UNIQUE KEY uq_vehicle_images_cover_vehicle (cover_vehicle_key),
  KEY idx_vehicle_images_vehicle_order (vehicle_id, display_order),
  KEY idx_vehicle_images_status (status),
  CONSTRAINT ck_vehicle_images_status CHECK (status IN ('ACTIVE','ARCHIVED')),
  CONSTRAINT ck_vehicle_images_display_order CHECK (display_order >= 0),
  CONSTRAINT fk_vehicle_images_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Entity con của Vehicle — gallery ảnh phương tiện. display_order xác định thứ tự hiển thị; is_cover đánh dấu ảnh cover chính. ON DELETE CASCADE vì Vehicle là aggregate owner.';

-- B3. seat_layout_templates (Aggregate Root)
CREATE TABLE seat_layout_templates (
  id           CHAR(36)     NOT NULL DEFAULT (UUID()),
  name         VARCHAR(255) NOT NULL,
  max_floor    SMALLINT     NOT NULL DEFAULT 1,
  max_rows     SMALLINT     NOT NULL,
  max_columns  SMALLINT     NOT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
  created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  created_by   CHAR(36)     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_seat_layout_templates_created_by (created_by),
  CONSTRAINT ck_slt_status CHECK (status IN ('DRAFT','PUBLISHED','DEPRECATED')),
  CONSTRAINT ck_slt_dimensions CHECK (max_floor > 0 AND max_rows > 0 AND max_columns > 0),
  CONSTRAINT fk_slt_created_by
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: SeatLayoutTemplate — do Admin công bố.';

-- B4. template_seat_slots (Entity con của SeatLayoutTemplate)
CREATE TABLE template_seat_slots (
  id             CHAR(36)   NOT NULL DEFAULT (UUID()),
  template_id    CHAR(36)   NOT NULL,
  seat_code      VARCHAR(10) NOT NULL,
  floor          SMALLINT   NOT NULL DEFAULT 1,
  seat_row     SMALLINT   NOT NULL,
  column_number  SMALLINT   NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tss_template_seat (template_id, seat_code),
  CONSTRAINT fk_tss_template
    FOREIGN KEY (template_id) REFERENCES seat_layout_templates (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Entity con của SeatLayoutTemplate — cấu trúc lưới thô (chưa gán SeatType).';

-- B7. seat_types (Aggregate Root, reference data) — tạo trước vì B5/B6 tham chiếu
CREATE TABLE seat_types (
  code        VARCHAR(30)  NOT NULL,
  label       VARCHAR(100) NOT NULL,
  status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (code),
  CONSTRAINT ck_seat_types_status CHECK (status IN ('ACTIVE','DEPRECATED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: SeatType — danh mục loại ghế chuẩn hóa, chỉ Admin CRUD.';

-- B5. vehicle_seat_layouts (Aggregate Root — quan hệ 0..1 với Vehicle, một chiều [D2])
CREATE TABLE vehicle_seat_layouts (
  id                  CHAR(36)    NOT NULL DEFAULT (UUID()),
  vehicle_id          CHAR(36)    NOT NULL,
  source_template_id  CHAR(36)    NOT NULL,
  status              VARCHAR(20) NOT NULL DEFAULT 'CONFIGURING',
  created_at          DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at          DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  version             INT         NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vsl_vehicle (vehicle_id),
  KEY idx_vsl_source_template (source_template_id),
  CONSTRAINT ck_vsl_status CHECK (status IN ('CONFIGURING','FINALIZED')),
  CONSTRAINT fk_vsl_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE,
  CONSTRAINT fk_vsl_source_template
    FOREIGN KEY (source_template_id) REFERENCES seat_layout_templates (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: VehicleSeatLayout. [D2] Vehicle "1"->"0..1" VehicleSeatLayout, một chiều (vehicle_id NOT NULL UNIQUE), không FK cycle.';

-- B6. seat_position_assignments (bảng bridge VehicleSeatLayout N-N SeatType, có thuộc tính)
CREATE TABLE seat_position_assignments (
  id                       CHAR(36)    NOT NULL DEFAULT (UUID()),
  vehicle_seat_layout_id   CHAR(36)    NOT NULL,
  seat_code                VARCHAR(10) NOT NULL,
  floor                    SMALLINT    NOT NULL,
  seat_row               SMALLINT    NOT NULL,
  column_number            SMALLINT    NOT NULL,
  seat_type_code           VARCHAR(30) NOT NULL,
  status                   VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (id),
  UNIQUE KEY uq_spa_layout_seat (vehicle_seat_layout_id, seat_code),
  KEY idx_spa_seat_type (seat_type_code),
  CONSTRAINT ck_spa_status CHECK (status IN ('ACTIVE','BROKEN','DISABLED','MAINTENANCE')),
  CONSTRAINT fk_spa_layout
    FOREIGN KEY (vehicle_seat_layout_id) REFERENCES vehicle_seat_layouts (id) ON DELETE CASCADE,
  CONSTRAINT fk_spa_seat_type
    FOREIGN KEY (seat_type_code) REFERENCES seat_types (code) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Entity con của VehicleSeatLayout — vị trí ghế đã gán SeatType + trạng thái vật lý (status khác TripSeat.status).';

-- B8. administrative_provinces (Current administrative reference/master data)
-- `id` is the application's internal relational key. `official_code` is the
-- official Vietnam administrative code and is intentionally not used as a
-- business-table FK. This current model has no district FK/table.
CREATE TABLE administrative_provinces (
  id             CHAR(36)     NOT NULL DEFAULT (UUID()),
  official_code  CHAR(2)      NOT NULL,
  name           VARCHAR(100) NOT NULL,
  unit_type      ENUM('PROVINCE','CENTRALLY_RUN_CITY','CITY') NOT NULL,
  status         ENUM('ACTIVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  created_at     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_administrative_provinces_official_code (official_code),
  UNIQUE KEY uq_administrative_provinces_name_code (name, official_code),
  KEY idx_administrative_provinces_status (status),
  CONSTRAINT ck_administrative_provinces_official_code
    CHECK (official_code REGEXP '^[0-9]{2}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Current province-level administrative master data. Internal id is the relational key; official_code is the external official Vietnam code. No district layer is modeled.';

-- B9. administrative_communes (Current administrative reference/master data)
-- A commune, ward, or special zone belongs to exactly one province. There is
-- deliberately no district_id: district is not a current FK in this model and
-- must not be reintroduced as a required hierarchy layer.
CREATE TABLE administrative_communes (
  id             CHAR(36)     NOT NULL DEFAULT (UUID()),
  province_id    CHAR(36)     NOT NULL,
  official_code  CHAR(5)      NOT NULL,
  name           VARCHAR(100) NOT NULL,
  unit_type      ENUM('COMMUNE','WARD','SPECIAL_ZONE') NOT NULL,
  status         ENUM('ACTIVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  created_at     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_administrative_communes_official_code (official_code),
  UNIQUE KEY uq_administrative_communes_province_id (province_id, id),
  UNIQUE KEY uq_administrative_communes_province_name (province_id, name),
  KEY idx_administrative_communes_province (province_id),
  KEY idx_administrative_communes_province_name (province_id, name),
  KEY idx_administrative_communes_status (status),
  CONSTRAINT ck_administrative_communes_official_code
    CHECK (official_code REGEXP '^[0-9]{3,5}$'),
  CONSTRAINT fk_administrative_communes_province
    FOREIGN KEY (province_id) REFERENCES administrative_provinces (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Current commune-level administrative master data: commune, ward, or special zone. Internal id is the relational key; official_code is the external official Vietnam code.';

-- B10. locations (Aggregate Root — Shared Master Data, Rule B)
-- A Location is a shared master place managed by Admin. It belongs to one
-- current province-level unit and one current commune-level unit, stores
-- geographic coordinates, and may store external map-provider metadata.
-- TrackAsia place_id/official_id are metadata only; they are never internal
-- relational keys. Resolve provider identifiers to official_code first, then
-- persist the corresponding administrative_* .id values.
CREATE TABLE locations (
  id                    CHAR(36)      NOT NULL DEFAULT (UUID()),
  name                  VARCHAR(255)  NOT NULL,
  latitude              DECIMAL(9,6)  NOT NULL,
  longitude             DECIMAL(9,6)  NOT NULL,
  province_id           CHAR(36)      NOT NULL,
  commune_id            CHAR(36)      NOT NULL,
  map_provider          VARCHAR(50)   NULL,
  provider_place_id     VARCHAR(255)  NULL,
  provider_official_id  VARCHAR(255)  NULL,
  formatted_address     VARCHAR(500)  NULL,
  status                ENUM('ACTIVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  created_at            DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at            DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_locations_province (province_id),
  KEY idx_locations_commune (commune_id),
  KEY idx_locations_province_commune_status (province_id, commune_id, status),
  KEY idx_locations_map_provider_place (map_provider, provider_place_id),
  CONSTRAINT ck_locations_coordinates
    CHECK (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180),
  CONSTRAINT fk_locations_province
    FOREIGN KEY (province_id) REFERENCES administrative_provinces (id) ON DELETE RESTRICT,
  CONSTRAINT fk_locations_commune_same_province
    FOREIGN KEY (province_id, commune_id)
    REFERENCES administrative_communes (province_id, id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Shared master place/location managed by Admin. Current hierarchy is province -> commune/ward/special_zone -> location; district is not a current FK. Coordinates and optional TrackAsia metadata are stored here.';

-- =====================================================================
-- NHÓM F — ROUTE TEMPLATE & LOCATION CONFIGURATION
-- =====================================================================

-- F4. bus_company_location_configs (Aggregate Root) — tạo trước vì route_template_stops tham chiếu
CREATE TABLE bus_company_location_configs (
  id                            CHAR(36)     NOT NULL DEFAULT (UUID()),
  bus_company_id                CHAR(36)     NOT NULL,
  location_id                   CHAR(36)     NOT NULL,
  location_locked_at            DATETIME(3)  NULL,
  display_name                  VARCHAR(255) NOT NULL,
  status                        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  accepts_pickup                TINYINT(1)   NOT NULL DEFAULT 1,
  accepts_dropoff               TINYINT(1)   NOT NULL DEFAULT 1,
  note                          TEXT         NULL,
  contact_phone                 VARCHAR(20)  NULL,
  driver_meeting_instructions   TEXT         NULL,
  gate                          VARCHAR(50)  NULL,
  platform                      VARCHAR(50)  NULL,
  landmark                      VARCHAR(255) NULL,
  created_at                    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at                    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  version                       INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bclc_company_location (bus_company_id, location_id),
  KEY idx_bclc_location (location_id),
  CONSTRAINT ck_bclc_status CHECK (status IN ('ACTIVE','DISABLED')),
  CONSTRAINT fk_bclc_bus_company
    FOREIGN KEY (bus_company_id) REFERENCES bus_companies (id) ON DELETE RESTRICT,
  CONSTRAINT fk_bclc_location
    FOREIGN KEY (location_id) REFERENCES locations (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: BusCompanyLocationConfig. [D3] location_locked_at = write-once marker (EVER USED semantics).';

-- F1. route_templates (Aggregate Root)
CREATE TABLE route_templates (
  id                        CHAR(36)     NOT NULL DEFAULT (UUID()),
  bus_company_id            CHAR(36)     NOT NULL,
  name                      VARCHAR(255) NOT NULL,
  origin_location_id        CHAR(36)     NOT NULL,
  destination_location_id   CHAR(36)     NOT NULL,
  status                    VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
  created_at                DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at                DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  version                   INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_rt_bus_company (bus_company_id),
  KEY idx_rt_origin (origin_location_id),
  KEY idx_rt_destination (destination_location_id),
  CONSTRAINT ck_rt_status CHECK (status IN ('DRAFT','PUBLISHED','DEPRECATED')),
  CONSTRAINT fk_rt_bus_company
    FOREIGN KEY (bus_company_id) REFERENCES bus_companies (id) ON DELETE RESTRICT,
  CONSTRAINT fk_rt_origin_location
    FOREIGN KEY (origin_location_id) REFERENCES locations (id) ON DELETE RESTRICT,
  CONSTRAINT fk_rt_destination_location
    FOREIGN KEY (destination_location_id) REFERENCES locations (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: RouteTemplate. origin/destination_location_id = Default Representative Locations (Search Anchor / fallback), Rule Issue#7.';

-- F3. route_template_stops (Entity con của RouteTemplate)
CREATE TABLE route_template_stops (
  id                                                     CHAR(36)    NOT NULL DEFAULT (UUID()),
  route_template_id                                      CHAR(36)    NOT NULL,
  sequence                                                SMALLINT    NOT NULL,
  bus_company_location_config_id                          CHAR(36)    NOT NULL,
  estimated_travel_duration_from_previous_stop_minutes    INT         NOT NULL DEFAULT 0,
  stop_type                                               VARCHAR(20) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rts_template_sequence (route_template_id, sequence),
  UNIQUE KEY uq_rts_id_template (id, route_template_id),
  KEY idx_rts_config (bus_company_location_config_id),
  CONSTRAINT ck_rts_stop_type
    CHECK (stop_type IN ('PICKUP','DROPOFF','PICKUP_AND_DROPOFF','TRANSIT_ONLY')),
  CONSTRAINT ck_rts_first_stop_zero_duration
    CHECK (sequence > 1 OR estimated_travel_duration_from_previous_stop_minutes = 0),
  CONSTRAINT fk_rts_route_template
    FOREIGN KEY (route_template_id) REFERENCES route_templates (id) ON DELETE CASCADE,
  CONSTRAINT fk_rts_config
    FOREIGN KEY (bus_company_location_config_id) REFERENCES bus_company_location_configs (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Entity con của RouteTemplate. duration lấy từ Routing API, Nhà xe không có quyền ghi đè. uq_rts_id_template phục vụ Composite FK cho route_template_shuttle_services.';

-- F2. route_template_seat_prices (Entity con của RouteTemplate)
CREATE TABLE route_template_seat_prices (
  id                  CHAR(36)      NOT NULL DEFAULT (UUID()),
  route_template_id   CHAR(36)      NOT NULL,
  seat_type_code      VARCHAR(30)   NOT NULL,
  price_amount        DECIMAL(14,2) NOT NULL,
  price_currency      CHAR(3)       NOT NULL DEFAULT 'VND',
  PRIMARY KEY (id),
  UNIQUE KEY uq_rtsp_template_seattype (route_template_id, seat_type_code),
  KEY idx_rtsp_seat_type (seat_type_code),
  CONSTRAINT fk_rtsp_route_template
    FOREIGN KEY (route_template_id) REFERENCES route_templates (id) ON DELETE CASCADE,
  CONSTRAINT fk_rtsp_seat_type
    FOREIGN KEY (seat_type_code) REFERENCES seat_types (code) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Entity con của RouteTemplate — nguồn gốc giá vé, snapshot sang trip_seat_prices khi tạo Trip.';

-- F5. route_template_shuttle_services (Entity con của RouteTemplate)
CREATE TABLE route_template_shuttle_services (
  id                            CHAR(36)      NOT NULL DEFAULT (UUID()),
  route_template_id             CHAR(36)      NOT NULL,
  shuttle_type                  VARCHAR(20)   NOT NULL,
  reference_stop_id             CHAR(36)      NOT NULL,
  shuttle_offset_minutes        INT           NOT NULL DEFAULT 0,
  coverage_area_description     TEXT          NOT NULL,
  pricing_type                  VARCHAR(20)   NOT NULL DEFAULT 'FREE',
  fee_amount                    DECIMAL(12,2) NULL,
  created_at                    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at                    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_rtss_template_type (route_template_id, shuttle_type),
  KEY idx_rtss_reference_stop (reference_stop_id),
  CONSTRAINT ck_rtss_shuttle_type CHECK (shuttle_type IN ('PICKUP','DROPOFF')),
  CONSTRAINT ck_rtss_pricing_type CHECK (pricing_type IN ('FREE','PAID')),
  CONSTRAINT ck_rtss_fee_when_paid CHECK (pricing_type = 'FREE' OR fee_amount IS NOT NULL),
  CONSTRAINT fk_rtss_route_template
    FOREIGN KEY (route_template_id) REFERENCES route_templates (id) ON DELETE CASCADE,
  CONSTRAINT fk_rtss_refstop_same_template
    FOREIGN KEY (reference_stop_id, route_template_id)
    REFERENCES route_template_stops (id, route_template_id)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Entity con của RouteTemplate — referenceStop do Nhà xe tự chọn thủ công (NOT NULL), Composite FK đảm bảo thuộc đúng RouteTemplate cha.';

-- =====================================================================
-- NHÓM C — TRIP & SEAT INVENTORY (Core Domain)
-- =====================================================================

-- C1. cancellation_policies (Aggregate Root)
CREATE TABLE cancellation_policies (
  id                     CHAR(36)    NOT NULL DEFAULT (UUID()),
  owner_bus_company_id   CHAR(36)    NOT NULL,
  locked_at              DATETIME(3) NULL,
  created_at             DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at             DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  version                INT         NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_cp_owner (owner_bus_company_id),
  -- Lưu ý: CHECK (locked_at <= now()) trong bản gốc PostgreSQL không thể
  -- chuyển sang MySQL — CHECK constraint của MySQL 8 bắt buộc DETERMINISTIC,
  -- không cho phép CURRENT_TIMESTAMP(). Ràng buộc "locked_at không ở tương
  -- lai" chuyển sang Application-enforced (ck_cp_locked_at_not_future).
  CONSTRAINT fk_cp_owner_bus_company
    FOREIGN KEY (owner_bus_company_id) REFERENCES bus_companies (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: CancellationPolicy. locked_at = Immutable-After-Use marker (set khi Trip đầu tiên tham chiếu).';

-- C2. cancellation_rules (Entity con của CancellationPolicy)
CREATE TABLE cancellation_rules (
  id                      CHAR(36)     NOT NULL DEFAULT (UUID()),
  policy_id               CHAR(36)     NOT NULL,
  hours_before_departure  INT          NOT NULL,
  refund_percentage       DECIMAL(5,2) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cr_policy_hours (policy_id, hours_before_departure),
  CONSTRAINT ck_cr_refund_pct CHECK (refund_percentage BETWEEN 0 AND 100),
  CONSTRAINT fk_cr_policy
    FOREIGN KEY (policy_id) REFERENCES cancellation_policies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Entity con (VO collection) của CancellationPolicy. Immutable sau khi Policy.locked_at được set (trigger bên dưới).';

-- C3. trips (Aggregate Root trung tâm)
CREATE TABLE trips (
  id                        CHAR(36)     NOT NULL DEFAULT (UUID()),
  route_template_id         CHAR(36)     NOT NULL,
  vehicle_id                CHAR(36)     NOT NULL,
  cancellation_policy_id    CHAR(36)     NOT NULL,
  origin_location_id        CHAR(36)     NOT NULL,
  destination_location_id   CHAR(36)     NOT NULL,
  base_departure_time       DATETIME(3)  NOT NULL,
  delay_minutes             INT          NOT NULL DEFAULT 0,
  status                    VARCHAR(20)  NOT NULL DEFAULT 'SCHEDULED',
  created_at                DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at                DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  version                   INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_trips_id_route_template (id, route_template_id),
  KEY idx_trips_route_template (route_template_id),
  KEY idx_trips_vehicle (vehicle_id),
  KEY idx_trips_policy (cancellation_policy_id),
  KEY idx_trips_search (origin_location_id, destination_location_id, base_departure_time),
  CONSTRAINT ck_trips_status CHECK (status IN ('SCHEDULED','DELAYED','RUNNING','COMPLETED','CANCELLED')),
  CONSTRAINT ck_trips_delay_non_negative CHECK (delay_minutes >= 0),
  CONSTRAINT fk_trips_route_template
    FOREIGN KEY (route_template_id) REFERENCES route_templates (id) ON DELETE RESTRICT,
  CONSTRAINT fk_trips_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE RESTRICT,
  CONSTRAINT fk_trips_cancellation_policy
    FOREIGN KEY (cancellation_policy_id) REFERENCES cancellation_policies (id) ON DELETE RESTRICT,
  CONSTRAINT fk_trips_origin_location
    FOREIGN KEY (origin_location_id) REFERENCES locations (id) ON DELETE RESTRICT,
  CONSTRAINT fk_trips_destination_location
    FOREIGN KEY (destination_location_id) REFERENCES locations (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: Trip. [D6] delay_minutes là TỔNG tuyệt đối (SET, không cộng dồn). Ownership O2/O3/O4 qua route_template_id (trigger bên dưới).';

-- C4. trip_points (Entity con của Trip, snapshot từ route_template_stops + bus_company_location_configs)
CREATE TABLE trip_points (
  id                                CHAR(36)     NOT NULL DEFAULT (UUID()),
  trip_id                           CHAR(36)     NOT NULL,
  bus_company_location_config_id    CHAR(36)     NOT NULL,
  sequence                          SMALLINT     NOT NULL,
  eta                               DATETIME(3)  NOT NULL,
  display_name                      VARCHAR(255) NOT NULL,
  accepts_pickup                    TINYINT(1)   NOT NULL,
  accepts_dropoff                   TINYINT(1)   NOT NULL,
  contact_phone                     VARCHAR(20)  NULL,
  driver_meeting_instructions       TEXT         NULL,
  gate                              VARCHAR(50)  NULL,
  platform                          VARCHAR(50)  NULL,
  landmark                          VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tp_trip_sequence (trip_id, sequence),
  UNIQUE KEY uq_tp_id_trip (id, trip_id),
  KEY idx_tp_config (bus_company_location_config_id),
  CONSTRAINT fk_tp_trip
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
  CONSTRAINT fk_tp_config
    FOREIGN KEY (bus_company_location_config_id) REFERENCES bus_company_location_configs (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Entity con của Trip. [D6] eta = ETA GỐC BẤT BIẾN (trigger chặn UPDATE). [FIX 2] 8 field vận hành snapshot bất biến — đọc từ đây, không join live Config.';

-- C5. trip_seats (Entity con của Trip — "chiến trường" chống double-booking)
CREATE TABLE trip_seats (
  trip_id          CHAR(36)    NOT NULL,
  seat_code        VARCHAR(10) NOT NULL,
  seat_type_code   VARCHAR(30) NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
  version          INT         NOT NULL DEFAULT 0,
  PRIMARY KEY (trip_id, seat_code),
  KEY idx_ts_seat_type (seat_type_code),
  KEY idx_ts_trip_status (trip_id, status),
  CONSTRAINT ck_ts_status CHECK (status IN ('AVAILABLE','SOFT_HELD','HARD_HELD','BOOKED')),
  CONSTRAINT fk_ts_trip
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
  CONSTRAINT fk_ts_seat_type
    FOREIGN KEY (seat_type_code) REFERENCES seat_types (code) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Entity con của Trip — đơn vị tồn kho ghế real-time. Natural Key (trip_id, seat_code). Optimistic Lock (version) là lớp phòng thủ thứ 2 sau Redis.';

-- C7. trip_seat_prices (Entity con của Trip, snapshot từ route_template_seat_prices)
CREATE TABLE trip_seat_prices (
  trip_id          CHAR(36)      NOT NULL,
  seat_type_code   VARCHAR(30)   NOT NULL,
  price_amount     DECIMAL(14,2) NOT NULL,
  price_currency   CHAR(3)       NOT NULL DEFAULT 'VND',
  PRIMARY KEY (trip_id, seat_type_code),
  KEY idx_tsp_seat_type (seat_type_code),
  CONSTRAINT fk_tsp_trip
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
  CONSTRAINT fk_tsp_seat_type
    FOREIGN KEY (seat_type_code) REFERENCES seat_types (code) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Entity con của Trip — snapshot BẤT BIẾN giá vé tại thời điểm tạo Trip (D7 #3). Nguồn duy nhất để tính tiền lúc Issue Ticket.';

-- C6. trip_shuttle_services (Entity con của Trip, snapshot từ route_template_shuttle_services)
-- [SỬA M-2]: bổ sung PK `id` — bảng gốc trong database_design.md thiếu cột này.
CREATE TABLE trip_shuttle_services (
  id                            CHAR(36)      NOT NULL DEFAULT (UUID()),
  trip_id                       CHAR(36)      NOT NULL,
  shuttle_type                  VARCHAR(20)   NOT NULL,
  reference_stop_id             CHAR(36)      NOT NULL,
  shuttle_offset_minutes        INT           NOT NULL DEFAULT 0,
  coverage_area_description     TEXT          NOT NULL,
  pricing_type                  VARCHAR(20)   NOT NULL DEFAULT 'FREE',
  fee_amount                    DECIMAL(12,2) NULL,
  display_time                  DATETIME(3)   NOT NULL,
  created_at                    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at                    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_tss_trip_type (trip_id, shuttle_type),
  KEY idx_tss_reference_stop (reference_stop_id),
  CONSTRAINT ck_tss_shuttle_type CHECK (shuttle_type IN ('PICKUP','DROPOFF')),
  CONSTRAINT ck_tss_pricing_type CHECK (pricing_type IN ('FREE','PAID')),
  CONSTRAINT ck_tss_fee_when_paid CHECK (pricing_type = 'FREE' OR fee_amount IS NOT NULL),
  CONSTRAINT fk_tss_trip
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
  CONSTRAINT fk_tss_refstop_same_trip
    FOREIGN KEY (reference_stop_id, trip_id)
    REFERENCES trip_points (id, trip_id)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Entity con của Trip — snapshot dịch vụ trung chuyển. [M-2 FIX] có id PK riêng (bản gốc database_design.md thiếu cột này).';

-- =====================================================================
-- NHÓM D — BOOKING, PAYMENT & REFUND (Core Domain)
-- =====================================================================

-- D1. bookings (Aggregate Root)
CREATE TABLE bookings (
  id            CHAR(36)      NOT NULL DEFAULT (UUID()),
  user_id       CHAR(36)      NOT NULL,
  trip_id       CHAR(36)      NOT NULL,
  status        VARCHAR(20)   NOT NULL DEFAULT 'PENDING_PAYMENT',
  total_amount  DECIMAL(14,2) NOT NULL,
  currency      CHAR(3)       NOT NULL DEFAULT 'VND',
  created_at    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  version       INT           NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bookings_id_trip (id, trip_id),
  KEY idx_bookings_user (user_id),
  KEY idx_bookings_trip (trip_id),
  CONSTRAINT ck_bookings_status
    CHECK (status IN ('PENDING_PAYMENT','CONFIRMED','FAILED','EXPIRED','CANCELLED','COMPLETED')),
  CONSTRAINT fk_bookings_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_trip
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: Booking. uq_bookings_id_trip phục vụ Composite FK cho tickets (Booking-Ticket Trip Uniformity).';

-- D2. tickets (Entity con của Booking)
CREATE TABLE tickets (
  id                       CHAR(36)      NOT NULL DEFAULT (UUID()),
  booking_id               CHAR(36)      NOT NULL,
  trip_id                  CHAR(36)      NOT NULL,
  seat_code                VARCHAR(10)   NOT NULL,
  seat_price_amount        DECIMAL(14,2) NOT NULL,
  seat_price_currency      CHAR(3)       NOT NULL DEFAULT 'VND',
  passenger_full_name      VARCHAR(255)  NOT NULL,
  passenger_phone_number   VARCHAR(20)   NOT NULL,
  qr_content                TEXT         NULL,
  status                   VARCHAR(20)   NOT NULL DEFAULT 'ISSUED',
  cancellation_reason      VARCHAR(30)   NULL,
  cancelled_at             DATETIME(3)   NULL,
  refund_amount            DECIMAL(14,2) NULL,
  created_at               DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at               DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  version                  INT           NOT NULL DEFAULT 0,
  -- [Partial Unique Index emulation] chống double-booking: (trip_id, seat_code) chỉ duy nhất
  -- khi status <> 'CANCELLED'. Vé CANCELLED không chiếm slot nữa.
  -- TRIM() bắt buộc: MySQL/MariaDB coi CONCAT() trực tiếp trên cột CHAR(N)
  -- có padding là biểu thức không hợp lệ trong GENERATED ALWAYS AS (lỗi 1901).
  active_seat_key VARCHAR(80)
    GENERATED ALWAYS AS (
      CASE WHEN status <> 'CANCELLED' THEN CONCAT(TRIM(trip_id), '-', seat_code) ELSE NULL END
    ) VIRTUAL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tickets_active_seat (active_seat_key),
  KEY idx_tickets_booking (booking_id),
  KEY idx_tickets_trip_seat (trip_id, seat_code),
  CONSTRAINT ck_tickets_status
    CHECK (status IN ('ISSUED','CHECKED_IN','COMPLETED','CANCELLED')),
  CONSTRAINT ck_tickets_cancellation_reason
    CHECK (cancellation_reason IS NULL OR cancellation_reason IN ('CUSTOMER_CANCELLATION','RESCHEDULED')),
  CONSTRAINT ck_ticket_seat_price_non_negative CHECK (seat_price_amount >= 0),
  CONSTRAINT ck_ticket_refund_within_price
    CHECK (refund_amount IS NULL OR refund_amount <= seat_price_amount),
  CONSTRAINT fk_tickets_booking_trip
    FOREIGN KEY (booking_id, trip_id)
    REFERENCES bookings (id, trip_id)
    ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT fk_tickets_trip_seat
    FOREIGN KEY (trip_id, seat_code)
    REFERENCES trip_seats (trip_id, seat_code)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Entity con của Booking. [D7] seat_price snapshot bất biến tại Issue Ticket (trigger bên dưới). Composite FK enforce Ticket.tripId==Booking.tripId.';

-- D3. payment_transactions (Aggregate Root độc lập)
CREATE TABLE payment_transactions (
  txn_ref      VARCHAR(64)   NOT NULL,
  booking_id   CHAR(36)      NOT NULL,
  txn_type     VARCHAR(20)   NOT NULL DEFAULT 'INITIAL',
  gateway_type VARCHAR(20)   NOT NULL,
  amount       DECIMAL(14,2) NOT NULL,
  currency     CHAR(3)       NOT NULL DEFAULT 'VND',
  status       VARCHAR(20)   NOT NULL DEFAULT 'PENDING_PAYMENT',
  created_at   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  version      INT           NOT NULL DEFAULT 0,
  -- [Partial Unique Index emulation] tối đa 1 giao dịch INITIAL / booking
  initial_booking_key CHAR(36)
    GENERATED ALWAYS AS (CASE WHEN txn_type = 'INITIAL' THEN TRIM(booking_id) ELSE NULL END) STORED,
  PRIMARY KEY (txn_ref),
  UNIQUE KEY uq_pt_txnref_booking (txn_ref, booking_id),
  UNIQUE KEY uq_pt_initial_per_booking (initial_booking_key),
  KEY idx_pt_booking (booking_id),
  CONSTRAINT ck_pt_txn_type CHECK (txn_type IN ('INITIAL','RESCHEDULE_SURCHARGE')),
  CONSTRAINT ck_pt_gateway_type CHECK (gateway_type IN ('VNPAY','MOMO','ZALOPAY')),
  CONSTRAINT ck_pt_status CHECK (status IN ('PENDING_PAYMENT','SUCCESS','FAILED','EXPIRED')),
  CONSTRAINT fk_pt_booking
    FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: PaymentTransaction. txn_ref là Natural Key (PK). Chỉ lưu gateway_type — resolve Config theo type ở tầng Application ([FIX 3]).';

-- D4. refund_transactions (Aggregate Root độc lập)
CREATE TABLE refund_transactions (
  id                CHAR(36)      NOT NULL DEFAULT (UUID()),
  payment_txn_ref   VARCHAR(64)   NOT NULL,
  booking_id        CHAR(36)      NOT NULL,
  ticket_id         CHAR(36)      NULL,
  amount            DECIMAL(14,2) NOT NULL,
  currency          CHAR(3)       NOT NULL DEFAULT 'VND',
  status            VARCHAR(20)   NOT NULL DEFAULT 'REQUESTED',
  created_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  version           INT           NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_rt_payment_txn (payment_txn_ref),
  KEY idx_rt_booking (booking_id),
  KEY idx_rt_ticket (ticket_id),
  CONSTRAINT ck_rt_amount_non_negative CHECK (amount >= 0),
  CONSTRAINT ck_refund_transaction_status CHECK (status IN ('REQUESTED','PROCESSING','COMPLETED','FAILED')),
  CONSTRAINT fk_rt_payment_txn
    FOREIGN KEY (payment_txn_ref) REFERENCES payment_transactions (txn_ref)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_rt_booking
    FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE RESTRICT,
  CONSTRAINT fk_rt_ticket
    FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: RefundTransaction. payment_txn_ref và booking_id là 2 FK độc lập; financial lineage được Application validate.';

-- D5. ticket_reschedule_histories (Entity con của Old Booking)
CREATE TABLE ticket_reschedule_histories (
  id                       CHAR(36)      NOT NULL DEFAULT (UUID()),
  reschedule_operation_id  CHAR(36)      NOT NULL,
  old_booking_id           CHAR(36)      NOT NULL,
  new_booking_id           CHAR(36)      NOT NULL,
  old_ticket_id            CHAR(36)      NOT NULL,
  new_ticket_id            CHAR(36)      NULL,
  old_trip_id              CHAR(36)      NOT NULL,
  old_seat_code             VARCHAR(10)   NOT NULL,
  old_seat_price            DECIMAL(14,2) NOT NULL,
  new_trip_id              CHAR(36)      NOT NULL,
  new_seat_code             VARCHAR(10)   NOT NULL,
  new_seat_price            DECIMAL(14,2) NOT NULL,
  fare_difference          DECIMAL(14,2) NOT NULL,
  reschedule_fee           DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  net_adjustment_amount    DECIMAL(14,2) NOT NULL,
  payment_txn_ref          VARCHAR(64)   NULL,
  rescheduled_at           DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_trh_operation (reschedule_operation_id),
  KEY idx_trh_old_booking (old_booking_id),
  KEY idx_trh_new_booking (new_booking_id),
  KEY idx_trh_old_ticket (old_ticket_id),
  KEY idx_trh_new_ticket (new_ticket_id),
  CONSTRAINT fk_trh_old_booking
    FOREIGN KEY (old_booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
  CONSTRAINT fk_trh_new_booking
    FOREIGN KEY (new_booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
  CONSTRAINT fk_trh_old_ticket
    FOREIGN KEY (old_ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
  CONSTRAINT fk_trh_new_ticket
    FOREIGN KEY (new_ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
  CONSTRAINT fk_trh_old_trip
    FOREIGN KEY (old_trip_id) REFERENCES trips (id) ON DELETE RESTRICT,
  CONSTRAINT fk_trh_new_trip
    FOREIGN KEY (new_trip_id) REFERENCES trips (id) ON DELETE RESTRICT,
  CONSTRAINT fk_trh_payment_txn
    FOREIGN KEY (payment_txn_ref) REFERENCES payment_transactions (txn_ref) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Entity con của Old Booking. new_ticket_id NULL hợp lệ ở Phase 1; RefundTransaction là Aggregate Root độc lập, không có scalar refund link.';

-- =====================================================================
-- NHÓM E — REVIEW, ADMIN CONFIG & AUDIT
-- =====================================================================

-- E1. reviews (Aggregate Root)
CREATE TABLE reviews (
  id          CHAR(36)    NOT NULL DEFAULT (UUID()),
  ticket_id   CHAR(36)    NOT NULL,
  rating      SMALLINT    NOT NULL,
  comment     TEXT        NULL,
  status      VARCHAR(30) NOT NULL DEFAULT 'PUBLIC',
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  version     INT         NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reviews_ticket (ticket_id),
  CONSTRAINT ck_reviews_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT ck_reviews_status
    CHECK (status IN ('PUBLIC','HIDDEN_PENDING_REVIEW','HIDDEN_PERMANENT')),
  CONSTRAINT fk_reviews_ticket
    FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: Review. UNIQUE(ticket_id) — 1 vé chỉ review 1 lần (Rule 13).';

-- E2. review_reports (Entity con của Review)
CREATE TABLE review_reports (
  id                            CHAR(36)    NOT NULL DEFAULT (UUID()),
  review_id                     CHAR(36)    NOT NULL,
  reported_by_bus_company_id    CHAR(36)    NOT NULL,
  status                        VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
  created_at                    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  decided_at                    DATETIME(3) NULL,
  -- [Partial Unique Index emulation] tối đa 1 report PENDING_ADMIN_DECISION / review
  pending_review_key CHAR(36)
    GENERATED ALWAYS AS (
      CASE WHEN status = 'PENDING_ADMIN_DECISION' THEN TRIM(review_id) ELSE NULL END
    ) VIRTUAL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rr_pending_per_review (pending_review_key),
  KEY idx_rr_review (review_id),
  KEY idx_rr_bus_company (reported_by_bus_company_id),
  CONSTRAINT ck_rr_status
    CHECK (status IN ('SUBMITTED','PENDING_ADMIN_DECISION','APPROVED','REJECTED')),
  CONSTRAINT fk_rr_review
    FOREIGN KEY (review_id) REFERENCES reviews (id) ON DELETE CASCADE,
  CONSTRAINT fk_rr_reported_by
    FOREIGN KEY (reported_by_bus_company_id) REFERENCES bus_companies (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Entity con của Review. Tối đa 1 report PENDING/review — enforce bằng generated column + UNIQUE KEY (thay Partial Unique Index Postgres).';

-- E3. banners (Aggregate Root)
CREATE TABLE banners (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  title       VARCHAR(255) NULL,
  image_url   VARCHAR(500) NOT NULL,
  status      VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
  created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  created_by  CHAR(36)     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_banners_created_by (created_by),
  CONSTRAINT ck_banners_status CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  CONSTRAINT fk_banners_created_by
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: Banner.';

-- E4. payment_gateway_configs (Aggregate Root)
CREATE TABLE payment_gateway_configs (
  id                  CHAR(36)     NOT NULL DEFAULT (UUID()),
  gateway_type        VARCHAR(20)  NOT NULL,
  merchant_id         VARCHAR(100) NULL,
  encrypted_api_key   TEXT         NOT NULL,
  payment_url         VARCHAR(500) NULL,
  status              VARCHAR(20)  NOT NULL DEFAULT 'INACTIVE',
  created_at          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at          DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  updated_by          CHAR(36)     NOT NULL,
  version             INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pgc_gateway_type (gateway_type),
  KEY idx_pgc_updated_by (updated_by),
  CONSTRAINT ck_pgc_gateway_type CHECK (gateway_type IN ('VNPAY','MOMO','ZALOPAY')),
  CONSTRAINT ck_pgc_status CHECK (status IN ('ACTIVE','INACTIVE')),
  CONSTRAINT fk_pgc_updated_by
    FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: PaymentGatewayConfig. encrypted_api_key phải mã hóa AES-256 ở Application trước khi INSERT (Rule 32).';

-- E5. notification_gateway_configs (Aggregate Root)
CREATE TABLE notification_gateway_configs (
  id                        CHAR(36)    NOT NULL DEFAULT (UUID()),
  channel                   VARCHAR(20) NOT NULL,
  encrypted_credentials      TEXT        NOT NULL,
  status                    VARCHAR(20) NOT NULL DEFAULT 'INACTIVE',
  created_at                DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at                DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  updated_by                CHAR(36)    NOT NULL,
  version                   INT         NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ngc_channel (channel),
  KEY idx_ngc_updated_by (updated_by),
  CONSTRAINT ck_ngc_channel CHECK (channel IN ('SMS','EMAIL')),
  CONSTRAINT ck_ngc_status CHECK (status IN ('ACTIVE','INACTIVE')),
  CONSTRAINT fk_ngc_updated_by
    FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: NotificationGatewayConfig.';

-- E6. audit_logs (Aggregate Root, append-only)
CREATE TABLE audit_logs (
  id             BIGINT      NOT NULL AUTO_INCREMENT,
  actor_user_id  CHAR(36)    NULL,
  ip_address     VARCHAR(45) NOT NULL,
  action         VARCHAR(100) NOT NULL,
  entity_type    VARCHAR(100) NULL,
  entity_id      VARCHAR(100) NULL,
  detail_before  JSON        NULL,
  detail_after   JSON        NULL,
  occurred_at    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_al_actor (actor_user_id),
  KEY idx_al_entity (entity_type, entity_id),
  KEY idx_al_occurred (occurred_at),
  CONSTRAINT fk_al_actor
    FOREIGN KEY (actor_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Aggregate Root: AuditLog — append-only (L-2: BIGINT AUTO_INCREMENT thay BIGSERIAL). REVOKE UPDATE/DELETE ở tầng ứng dụng/DB user.';

-- =====================================================================
-- FK bổ sung để phá cycle bus_companies <-> cancellation_policies
-- (insert 2 pha: tạo BusCompany với default_cancellation_policy_id=NULL,
--  tạo CancellationPolicy, rồi UPDATE lại default_cancellation_policy_id)
-- =====================================================================
ALTER TABLE bus_companies
  ADD CONSTRAINT fk_bus_companies_default_policy
  FOREIGN KEY (default_cancellation_policy_id)
  REFERENCES cancellation_policies (id) ON DELETE RESTRICT;

-- FK users.bus_company_id -> bus_companies.id (thêm sau khi bus_companies tồn tại)
ALTER TABLE users
  ADD CONSTRAINT fk_users_bus_company
  FOREIGN KEY (bus_company_id) REFERENCES bus_companies (id) ON DELETE RESTRICT;

-- =====================================================================
-- TRIGGERS — chuyển đổi từ PL/pgSQL sang MySQL 8.0+
-- Nguyên tắc áp dụng theo Prompt: chỉ tạo trigger khi CHECK/FK/UNIQUE/
-- constraint đơn thuần không đủ (invariant xuyên bảng hoặc bất biến
-- theo thời gian). KHÔNG tạo trigger cho những gì Application đã đủ
-- trách nhiệm (O3, PBD, cutoff, max reschedule, IPN, Redis Hold,
-- Seat Remapping, Routing API, FINALIZED-before-clone).
-- =====================================================================

DELIMITER $$

-- ---------------------------------------------------------------------
-- [D2] vehicle_seat_layouts.vehicle_id — bất biến (không đổi chủ sở hữu layout)
-- ---------------------------------------------------------------------
CREATE TRIGGER tg_layout_vehicle_immutable
BEFORE UPDATE ON vehicle_seat_layouts
FOR EACH ROW
BEGIN
  IF NEW.vehicle_id <> OLD.vehicle_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'vehicle_seat_layouts.vehicle_id la BAT BIEN sau khi tao: khong the chuyen layout sang xe khac.';
  END IF;
END$$

-- ---------------------------------------------------------------------
-- Rule O1: route_template_stops.bus_company_location_config_id phải cùng
-- BusCompany với route_templates cha
-- ---------------------------------------------------------------------
CREATE TRIGGER tg_rt_stop_config_same_company
BEFORE INSERT ON route_template_stops
FOR EACH ROW
BEGIN
  DECLARE v_template_company CHAR(36);
  DECLARE v_config_company CHAR(36);

  SELECT bus_company_id INTO v_template_company
  FROM route_templates WHERE id = NEW.route_template_id;

  SELECT bus_company_id INTO v_config_company
  FROM bus_company_location_configs WHERE id = NEW.bus_company_location_config_id;

  IF v_config_company <> v_template_company THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Ownership violation (O1): BusCompanyLocationConfig khong thuoc cung BusCompany voi RouteTemplate cha.';
  END IF;
END$$

CREATE TRIGGER tg_rt_stop_config_same_company_upd
BEFORE UPDATE ON route_template_stops
FOR EACH ROW
BEGIN
  DECLARE v_template_company CHAR(36);
  DECLARE v_config_company CHAR(36);

  SELECT bus_company_id INTO v_template_company
  FROM route_templates WHERE id = NEW.route_template_id;

  SELECT bus_company_id INTO v_config_company
  FROM bus_company_location_configs WHERE id = NEW.bus_company_location_config_id;

  IF v_config_company <> v_template_company THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Ownership violation (O1): BusCompanyLocationConfig khong thuoc cung BusCompany voi RouteTemplate cha.';
  END IF;
END$$

-- ---------------------------------------------------------------------
-- [D3] bus_company_location_configs — write-once location_locked_at marker
-- (1) đánh dấu "đã từng dùng" khi Stop đầu tiên tham chiếu
-- ---------------------------------------------------------------------
CREATE TRIGGER tg_mark_config_location_locked_ins
AFTER INSERT ON route_template_stops
FOR EACH ROW
BEGIN
  UPDATE bus_company_location_configs
     SET location_locked_at = CURRENT_TIMESTAMP(3)
   WHERE id = NEW.bus_company_location_config_id
     AND location_locked_at IS NULL;
END$$

CREATE TRIGGER tg_mark_config_location_locked_upd
AFTER UPDATE ON route_template_stops
FOR EACH ROW
BEGIN
  IF NEW.bus_company_location_config_id <> OLD.bus_company_location_config_id THEN
    UPDATE bus_company_location_configs
       SET location_locked_at = CURRENT_TIMESTAMP(3)
     WHERE id = NEW.bus_company_location_config_id
       AND location_locked_at IS NULL;
  END IF;
END$$

-- (2) chặn đổi location_id sau khi đã khóa + chặn reset marker
CREATE TRIGGER tg_config_location_immutable_after_use
BEFORE UPDATE ON bus_company_location_configs
FOR EACH ROW
BEGIN
  IF NEW.location_id <> OLD.location_id AND OLD.location_locked_at IS NOT NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'BusCompanyLocationConfig da TUNG duoc RouteTemplateStop su dung: location_id la IMMUTABLE vinh vien. Hay tao Config moi.';
  END IF;

  IF OLD.location_locked_at IS NOT NULL
     AND (NEW.location_locked_at IS NULL OR NEW.location_locked_at <> OLD.location_locked_at) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'location_locked_at la WRITE-ONCE: khong the reset hoac thay doi.';
  END IF;
END$$

-- ---------------------------------------------------------------------
-- CancellationPolicy Immutable-After-Use (Copy-on-Write)
-- ---------------------------------------------------------------------
CREATE TRIGGER tg_cancellation_rules_immutable_after_use_upd
BEFORE UPDATE ON cancellation_rules
FOR EACH ROW
BEGIN
  DECLARE v_locked_at DATETIME(3);
  SELECT locked_at INTO v_locked_at FROM cancellation_policies WHERE id = OLD.policy_id;
  IF v_locked_at IS NOT NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'CancellationPolicy da duoc Trip su dung: khong the sua CancellationRule. Hay tao Policy moi (Copy-on-Write).';
  END IF;
END$$

CREATE TRIGGER tg_cancellation_rules_immutable_after_use_del
BEFORE DELETE ON cancellation_rules
FOR EACH ROW
BEGIN
  DECLARE v_locked_at DATETIME(3);
  SELECT locked_at INTO v_locked_at FROM cancellation_policies WHERE id = OLD.policy_id;
  IF v_locked_at IS NOT NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'CancellationPolicy da duoc Trip su dung: khong the xoa CancellationRule. Hay tao Policy moi (Copy-on-Write).';
  END IF;
END$$

CREATE TRIGGER tg_policy_locked_at_write_once
BEFORE UPDATE ON cancellation_policies
FOR EACH ROW
BEGIN
  IF OLD.locked_at IS NOT NULL
     AND (NEW.locked_at IS NULL OR NEW.locked_at <> OLD.locked_at) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'locked_at cua CancellationPolicy la write-once, khong the thay doi hay reset.';
  END IF;
END$$

-- ---------------------------------------------------------------------
-- Rule O2 / O4: trips.vehicle_id và trips.cancellation_policy_id phải
-- cùng BusCompany với route_templates cha (O3 là Application-enforced)
-- ---------------------------------------------------------------------
CREATE TRIGGER tg_trip_same_company_ownership_ins
BEFORE INSERT ON trips
FOR EACH ROW
BEGIN
  DECLARE v_template_company CHAR(36);
  DECLARE v_vehicle_company CHAR(36);
  DECLARE v_policy_company CHAR(36);

  SELECT bus_company_id INTO v_template_company
  FROM route_templates WHERE id = NEW.route_template_id;

  SELECT bus_company_id INTO v_vehicle_company
  FROM vehicles WHERE id = NEW.vehicle_id;

  SELECT owner_bus_company_id INTO v_policy_company
  FROM cancellation_policies WHERE id = NEW.cancellation_policy_id;

  IF v_vehicle_company <> v_template_company THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Ownership violation (O2): Vehicle khong thuoc cung BusCompany voi RouteTemplate cua Trip.';
  END IF;

  IF v_policy_company <> v_template_company THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Ownership violation (O4): CancellationPolicy khong thuoc cung BusCompany voi RouteTemplate cua Trip.';
  END IF;
END$$

CREATE TRIGGER tg_trip_same_company_ownership_upd
BEFORE UPDATE ON trips
FOR EACH ROW
BEGIN
  DECLARE v_template_company CHAR(36);
  DECLARE v_vehicle_company CHAR(36);
  DECLARE v_policy_company CHAR(36);

  -- D7 / [FIX 5]: chỉ các snapshot policy-route bị bất biến.
  -- status, delay_minutes và vehicle_id vẫn mutable theo lifecycle vận hành.
  IF NEW.route_template_id <> OLD.route_template_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'trips.route_template_id la SNAPSHOT BAT BIEN (D7) sau khi tao Trip.';
  END IF;

  IF NEW.origin_location_id <> OLD.origin_location_id
     OR NEW.destination_location_id <> OLD.destination_location_id
     OR NEW.base_departure_time <> OLD.base_departure_time THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'trips.origin/destination_location_id va base_departure_time la SNAPSHOT BAT BIEN (D7) sau khi tao Trip.';
  END IF;

  IF NEW.cancellation_policy_id <> OLD.cancellation_policy_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'trips.cancellation_policy_id la BAT BIEN (FIX 5) sau khi tao Trip.';
  END IF;

  -- Giữ Rule O2 khi Vehicle được đổi trong vận hành.
  IF NEW.vehicle_id <> OLD.vehicle_id THEN
    SELECT bus_company_id INTO v_template_company
    FROM route_templates WHERE id = NEW.route_template_id;

    SELECT bus_company_id INTO v_vehicle_company
    FROM vehicles WHERE id = NEW.vehicle_id;

    IF v_vehicle_company <> v_template_company THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ownership violation (O2): Vehicle khong thuoc cung BusCompany voi RouteTemplate cua Trip.';
    END IF;
  END IF;
END$$

-- [FIX 5] Policy được lock lần đầu khi được Trip sử dụng. UPDATE này thuộc
-- cùng transaction với INSERT Trip, nên sẽ rollback nếu transaction rollback.
CREATE TRIGGER tg_trip_policy_lock_on_first_use
AFTER INSERT ON trips
FOR EACH ROW
BEGIN
  UPDATE cancellation_policies
     SET locked_at = CURRENT_TIMESTAMP(3)
   WHERE id = NEW.cancellation_policy_id
     AND locked_at IS NULL;
END$$

-- ---------------------------------------------------------------------
-- [D6] trip_points.eta — ETA gốc bất biến (không bao giờ UPDATE)
-- ---------------------------------------------------------------------
CREATE TRIGGER tg_trip_point_eta_immutable
BEFORE UPDATE ON trip_points
FOR EACH ROW
BEGIN
  IF NEW.eta <> OLD.eta THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'trip_points.eta la BAT BIEN: bao tre chuyen bang cach SET trips.delay_minutes, khong UPDATE eta.';
  END IF;
END$$

-- [FIX 2] 8 field vận hành snapshot trên trip_points cũng bất biến sau khi tạo Trip
CREATE TRIGGER tg_trip_point_snapshot_immutable
BEFORE UPDATE ON trip_points
FOR EACH ROW
BEGIN
  IF NEW.display_name <> OLD.display_name
     OR NEW.accepts_pickup <> OLD.accepts_pickup
     OR NEW.accepts_dropoff <> OLD.accepts_dropoff
     OR NOT (NEW.contact_phone <=> OLD.contact_phone)
     OR NOT (NEW.driver_meeting_instructions <=> OLD.driver_meeting_instructions)
     OR NOT (NEW.gate <=> OLD.gate)
     OR NOT (NEW.platform <=> OLD.platform)
     OR NOT (NEW.landmark <=> OLD.landmark) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'trip_points: cac field snapshot van hanh la BAT BIEN sau khi tao Trip (Fix 2 / Grandfather Rule).';
  END IF;
END$$

-- ---------------------------------------------------------------------
-- [D7] trip_seat_prices — snapshot bất biến (chặn cả UPDATE và DELETE
-- ngoài luồng CASCADE khi xóa Trip)
-- ---------------------------------------------------------------------
CREATE TRIGGER tg_trip_seat_price_immutable_upd
BEFORE UPDATE ON trip_seat_prices
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'trip_seat_prices la SNAPSHOT BAT BIEN (D7): khong duoc UPDATE sau khi Trip duoc tao. Muon doi gia -> tao Trip moi.';
END$$

-- ---------------------------------------------------------------------
-- [D7] tickets.seat_price — snapshot bất biến tại thời điểm Issue Ticket
-- ---------------------------------------------------------------------
CREATE TRIGGER tg_ticket_price_immutable
BEFORE UPDATE ON tickets
FOR EACH ROW
BEGIN
  IF NEW.seat_price_amount <> OLD.seat_price_amount
     OR NEW.seat_price_currency <> OLD.seat_price_currency THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'tickets.seat_price la SNAPSHOT BAT BIEN (D7): khong duoc UPDATE sau khi ve duoc phat hanh.';
  END IF;
END$$

-- [D7] TripShuttleService là snapshot toàn bộ, không có field mutable.
CREATE TRIGGER tg_trip_shuttle_immutable
BEFORE UPDATE ON trip_shuttle_services
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'trip_shuttle_services la SNAPSHOT BAT BIEN (D7): khong duoc UPDATE sau khi Trip duoc tao.';
END$$

-- [D7] Chỉ danh tính snapshot của ghế là bất biến; status/version vẫn mutable.
CREATE TRIGGER tg_trip_seat_identity_immutable
BEFORE UPDATE ON trip_seats
FOR EACH ROW
BEGIN
  IF NEW.seat_code <> OLD.seat_code
     OR NEW.seat_type_code <> OLD.seat_type_code THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'trip_seats.seat_code va seat_type_code la SNAPSHOT BAT BIEN (D7).';
  END IF;
END$$

DELIMITER ;

-- =====================================================================
-- [FIX 1] Ownership Immutability trên PARENT — chặn đổi chủ sở hữu của
-- Aggregate đã tồn tại (đóng lỗ hổng O1/O2/O4 bị bypass qua UPDATE parent)
-- MySQL không có cơ chế tương đương TG_ARGV của Postgres nên viết 4
-- trigger riêng biệt thay vì 1 hàm dùng chung tham số hóa.
-- =====================================================================

DELIMITER $$

CREATE TRIGGER tg_vehicles_owner_immutable
BEFORE UPDATE ON vehicles
FOR EACH ROW
BEGIN
  IF NEW.bus_company_id <> OLD.bus_company_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'vehicles.bus_company_id la IMMUTABLE: khong the chuyen Vehicle sang BusCompany khac.';
  END IF;
END$$

CREATE TRIGGER tg_route_templates_owner_immutable
BEFORE UPDATE ON route_templates
FOR EACH ROW
BEGIN
  IF NEW.bus_company_id <> OLD.bus_company_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'route_templates.bus_company_id la IMMUTABLE: khong the chuyen RouteTemplate sang BusCompany khac.';
  END IF;
END$$

CREATE TRIGGER tg_configs_owner_immutable
BEFORE UPDATE ON bus_company_location_configs
FOR EACH ROW
BEGIN
  IF NEW.bus_company_id <> OLD.bus_company_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'bus_company_location_configs.bus_company_id la IMMUTABLE: khong the chuyen Config sang BusCompany khac.';
  END IF;
END$$

CREATE TRIGGER tg_policies_owner_immutable
BEFORE UPDATE ON cancellation_policies
FOR EACH ROW
BEGIN
  IF NEW.owner_bus_company_id <> OLD.owner_bus_company_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'cancellation_policies.owner_bus_company_id la IMMUTABLE: khong the chuyen Policy sang BusCompany khac.';
  END IF;
END$$

-- ---------------------------------------------------------------------
-- users.bus_company_id — bất biến vô điều kiện [FIX 1]
-- ---------------------------------------------------------------------
CREATE TRIGGER tg_users_bus_company_immutable
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  IF NOT (NEW.bus_company_id <=> OLD.bus_company_id) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'users.bus_company_id la IMMUTABLE sau khi tao tai khoan.';
  END IF;
END$$

-- ---------------------------------------------------------------------
-- tickets.booking_id / tickets.trip_id — bất biến sau khi INSERT
-- (bổ sung phòng thủ ngoài Composite FK ON UPDATE RESTRICT — chặn cả
-- trường hợp đổi cả 2 cột cùng lúc thành một cặp hợp lệ khác)
-- ---------------------------------------------------------------------
CREATE TRIGGER tg_tickets_booking_trip_immutable
BEFORE UPDATE ON tickets
FOR EACH ROW
BEGIN
  IF NEW.trip_id <> OLD.trip_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'tickets.trip_id la BAT BIEN sau khi tao ve (khong bao gio chuyen Ticket sang Trip khac).';
  END IF;
  IF NEW.booking_id <> OLD.booking_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'tickets.booking_id la BAT BIEN sau khi tao ve (khong bao gio chuyen Ticket sang Booking khac).';
  END IF;
END$$

-- ---------------------------------------------------------------------
-- bookings.trip_id — bất biến sau khi tạo (kết hợp Composite FK ON UPDATE
-- RESTRICT ở tickets để không có đường nào làm lệch trip_id)
-- ---------------------------------------------------------------------
CREATE TRIGGER tg_bookings_trip_immutable
BEFORE UPDATE ON bookings
FOR EACH ROW
BEGIN
  IF NEW.trip_id <> OLD.trip_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'bookings.trip_id la BAT BIEN sau khi tao Booking.';
  END IF;
END$$

DELIMITER ;

-- =====================================================================
-- INDEX bổ sung (ngoài UNIQUE/PK/FK đã khai báo cùng bảng)
-- =====================================================================

-- Search Representative Stop (Read Model — Bước 8 database_design.md)
CREATE INDEX idx_rts_template_sequence_lookup ON route_template_stops (route_template_id, sequence);
CREATE INDEX idx_bclc_location_lookup ON bus_company_location_configs (location_id);

-- Reconciliation Cron (UC-1.13): quét PENDING_PAYMENT quá hạn
CREATE INDEX idx_pt_status_created ON payment_transactions (status, created_at);

-- Lịch sử đặt vé theo User (UC-1.15)
CREATE INDEX idx_bookings_user_status ON bookings (user_id, status);

-- Trip search theo trạng thái vận hành (UC-3.5)
CREATE INDEX idx_trips_status ON trips (status);

-- Review pending cho Admin xử lý SLA 48h (UC-3.9)
CREATE INDEX idx_rr_status_created ON review_reports (status, created_at);

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- GHI CHÚ TỔNG HỢP — CÁC RULE ĐƯỢC CHỦ ĐÍCH ĐỂ Ở TẦNG APPLICATION
-- (không ép thành trigger/constraint theo đúng CONSTRAINT PRIORITY của
-- yêu cầu triển khai — DB chỉ enforce PK/FK/UNIQUE/NOT NULL/CHECK/INDEX
-- và các bất biến bắt buộc phải có trigger; phần còn lại business logic
-- do Application/Domain chịu trách nhiệm):
--
--   - O3 (Rule Ownership #3 — Booking.trip phải thuộc BusCompany hợp lệ
--     theo currentUser.busCompanyId của actor): Application-enforced.
--   - PBD (Pending Business Decision, các mục domain.md chưa chốt số cụ
--     thể): Application-enforced khi có quyết định.
--   - Cutoff time đặt vé / hủy vé: Application-enforced (đọc từ
--     cancellation_rules nhưng logic so sánh giờ hiện tại nằm ở service).
--   - Reschedule policy / max reschedule count / cooldown: Application.
--   - IPN (Instant Payment Notification) workflow đối soát cổng thanh
--     toán: Application (gọi ngoài, không thuộc transaction DB).
--   - Redis Soft Hold / Hard Hold giữ ghế tạm thời trước khi có Ticket
--     thật: Application (TTL trong Redis, không phải bảng SQL).
--   - Seat Remapping khi đổi VehicleSeatLayout: Application.
--   - Routing API tính estimated_travel_duration_from_previous_stop_minutes:
--     Application (giá trị được ghi vào route_template_stops sau khi gọi
--     API ngoài, DB chỉ lưu kết quả).
--   - [M-1] Representative Stop Search: Application (Repository/Query
--     Service) PHẢI lọc thêm "AND s.stop_type <> 'TRANSIT_ONLY'" ngoài
--     accepts_pickup/accepts_dropoff của Config khi SELECT — vì
--     route_template_stops.stop_type là thuộc tính theo-từng-stop, khác
--     với accepts_pickup/accepts_dropoff vốn thuộc BusCompanyLocationConfig
--     dùng chung nhiều stop, nên 2 điều kiện KHÔNG tương đương và không
--     thể suy ra lẫn nhau chỉ bằng CHECK/FK ở DB.
--   - VehicleSeatLayout phải ở status='FINALIZED' TRƯỚC KHI Application
--     được phép clone dữ liệu sang trip_seats khi tạo Trip: Application
--     (DB không chặn bằng trigger vì đây là điều kiện tại thời điểm ghi
--     của một luồng nghiệp vụ nhiều bước, không phải bất biến của riêng
--     một bảng).
-- =====================================================================

-- =====================================================================
-- HẾT SCHEMA
-- =====================================================================

-- =====================================================================
-- COMPATIBILITY VIEWS (Hỗ trợ truy vấn danh mục Tuyến xe & Điểm đón trả)
-- =====================================================================
CREATE OR REPLACE VIEW routes AS
SELECT 
  rt.id AS id,
  rt.bus_company_id AS bus_company_id,
  l_orig.name AS departure_location,
  l_dest.name AS arrival_location,
  6.5 AS duration_hours,
  305.0 AS distance_km,
  rt.created_at AS created_at
FROM route_templates rt
JOIN locations l_orig ON rt.origin_location_id = l_orig.id
JOIN locations l_dest ON rt.destination_location_id = l_dest.id;

CREATE OR REPLACE VIEW pickup_dropoff_points AS
SELECT 
  rts.id AS id,
  rts.route_template_id AS route_id,
  bclc.display_name AS name,
  loc.name AS address,
  CASE 
    WHEN rts.stop_type = 'DROPOFF' THEN 'DROPOFF'
    ELSE 'PICKUP'
  END AS point_type,
  rts.sequence AS display_order
FROM route_template_stops rts
JOIN bus_company_location_configs bclc ON rts.bus_company_location_config_id = bclc.id
JOIN locations loc ON bclc.location_id = loc.id;


-- =====================================================================
-- DỮ LIỆU KHỞI TẠO MẪU TOÀN DIỆN CHO 36 BẢNG (COMPREHENSIVE SEED DATA)
-- Nguồn dữ liệu: docs/schema.sql + docs/database_design.md + docs/SRS_Vexere.md
-- Mật khẩu tài khoản dùng chung: Rikkei@123 (BCrypt 12 rounds)
-- Hash: $2a$12$Pmk4aET/6hYWnob519wJPuCTPdsmPBmolH4Bl85ABX/a6Tz3kFpti
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. SEAT TYPES (Danh mục loại ghế chuẩn hóa toàn sàn)
INSERT INTO seat_types (code, label, status) VALUES
('STANDARD', 'Ghế tiêu chuẩn / Giường tầng 1 chống say', 'ACTIVE'),
('VIP', 'Ghế VIP / Giường tầng 2 thoáng mát', 'ACTIVE'),
('SLEEPER', 'Giường nằm bọc da cao cấp', 'ACTIVE'),
('CABIN', 'Cabin Cung Điện đôi có massage riêng', 'ACTIVE')
ON DUPLICATE KEY UPDATE label=VALUES(label);

-- 2. SEAT LAYOUT TEMPLATES & SLOTS (Sơ đồ mẫu 34 chỗ 2 tầng: A01-A17, B01-B17)
INSERT INTO seat_layout_templates (id, name, max_floor, max_rows, max_columns, status, created_by) VALUES
('slt-34-standard', 'Sơ đồ chuẩn Giường nằm Limousine 34 chỗ (2 Tầng)', 2, 9, 2, 'PUBLISHED', '11111111-1111-1111-1111-111111111111')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO template_seat_slots (id, template_id, seat_code, floor, seat_row, column_number) VALUES
-- Tầng 1: A01 -> A17
('tss-a01', 'slt-34-standard', 'A01', 1, 1, 1), ('tss-a02', 'slt-34-standard', 'A02', 1, 1, 2),
('tss-a03', 'slt-34-standard', 'A03', 1, 2, 1), ('tss-a04', 'slt-34-standard', 'A04', 1, 2, 2),
('tss-a05', 'slt-34-standard', 'A05', 1, 3, 1), ('tss-a06', 'slt-34-standard', 'A06', 1, 3, 2),
('tss-a07', 'slt-34-standard', 'A07', 1, 4, 1), ('tss-a08', 'slt-34-standard', 'A08', 1, 4, 2),
('tss-a09', 'slt-34-standard', 'A09', 1, 5, 1), ('tss-a10', 'slt-34-standard', 'A10', 1, 5, 2),
('tss-a11', 'slt-34-standard', 'A11', 1, 6, 1), ('tss-a12', 'slt-34-standard', 'A12', 1, 6, 2),
('tss-a13', 'slt-34-standard', 'A13', 1, 7, 1), ('tss-a14', 'slt-34-standard', 'A14', 1, 7, 2),
('tss-a15', 'slt-34-standard', 'A15', 1, 8, 1), ('tss-a16', 'slt-34-standard', 'A16', 1, 8, 2),
('tss-a17', 'slt-34-standard', 'A17', 1, 9, 1),
-- Tầng 2: B01 -> B17
('tss-b01', 'slt-34-standard', 'B01', 2, 1, 1), ('tss-b02', 'slt-34-standard', 'B02', 2, 1, 2),
('tss-b03', 'slt-34-standard', 'B03', 2, 2, 1), ('tss-b04', 'slt-34-standard', 'B04', 2, 2, 2),
('tss-b05', 'slt-34-standard', 'B05', 2, 3, 1), ('tss-b06', 'slt-34-standard', 'B06', 2, 3, 2),
('tss-b07', 'slt-34-standard', 'B07', 2, 4, 1), ('tss-b08', 'slt-34-standard', 'B08', 2, 4, 2),
('tss-b09', 'slt-34-standard', 'B09', 2, 5, 1), ('tss-b10', 'slt-34-standard', 'B10', 2, 5, 2),
('tss-b11', 'slt-34-standard', 'B11', 2, 6, 1), ('tss-b12', 'slt-34-standard', 'B12', 2, 6, 2),
('tss-b13', 'slt-34-standard', 'B13', 2, 7, 1), ('tss-b14', 'slt-34-standard', 'B14', 2, 7, 2),
('tss-b15', 'slt-34-standard', 'B15', 2, 8, 1), ('tss-b16', 'slt-34-standard', 'B16', 2, 8, 2),
('tss-b17', 'slt-34-standard', 'B17', 2, 9, 1)
ON DUPLICATE KEY UPDATE seat_code=VALUES(seat_code);

-- 3. BUS COMPANIES (Hãng xe đối tác)
INSERT INTO bus_companies (id, name, hotline, status, email, address, logo_url, average_rating) VALUES
('bc-futa', 'Phương Trang (FUTA Bus Lines)', '1900 6067', 'ACTIVE', 'hotro@futa.vn', 'Bến xe Miền Tây, 395 Kinh Dương Vương, An Lạc, Bình Tân, TP.HCM', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&auto=format&fit=crop&q=80', 4.9),
('bc-thanhbuoi', 'Thành Bưởi', '1900 6079', 'ACTIVE', 'info@thanhbuoi.com.vn', '266 Lê Hồng Phong, Phường 4, Quận 5, TP.HCM', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=150&auto=format&fit=crop&q=80', 4.8),
('bc-saoviet', 'Sao Việt', '1900 6746', 'ACTIVE', 'contact@xesaoviet.com.vn', '779 Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội', 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=150&auto=format&fit=crop&q=80', 4.7),
('bc-kumho', 'Kumho Samco Buslines', '1900 6065', 'ACTIVE', 'cskh@kumhosamco.com.vn', '292 Đinh Bộ Lĩnh, Phường 26, Bình Thạnh, TP.HCM', 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=150&auto=format&fit=crop&q=80', 4.8),
('bc-hoamai', 'Xe Khách Hoa Mai', '1900 599 997', 'ACTIVE', 'info@hoamaivungtau.com.vn', '47 Trưng Nhị, Phường 1, TP. Vũng Tàu', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&auto=format&fit=crop&q=80', 4.9),
('bc-hoanglong', 'Hoàng Long Asia', '0225 3920 920', 'ACTIVE', 'info@hoanglongasia.com', '05 Phạm Ngũ Lão, Ngô Quyền, Hải Phòng', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=150&auto=format&fit=crop&q=80', 4.7),
('bc-vanminh', 'Nhà Xe Văn Minh', '1900 6467', 'ACTIVE', 'vanminh@vanminh74.vn', '101 Lý Thường Kiệt, TP. Vinh, Nghệ An', 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=150&auto=format&fit=crop&q=80', 4.9),
('bc-cuctung', 'Cúc Tùng Limousine', '1900 6606', 'ACTIVE', 'cuctunglimousine@gmail.com', 'Bến xe phía Nam Nha Trang, Khánh Hòa', 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=150&auto=format&fit=crop&q=80', 4.8),
('bc-haivan', 'Hải Vân Express', '1900 6763', 'ACTIVE', 'cskh@haivan.com', 'Tòa nhà N2E Lê Văn Lương, Nhân Chính, Thanh Xuân, Hà Nội', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&auto=format&fit=crop&q=80', 4.8),
('bc-chinnghia', 'Chín Nghĩa', '1900 636 636', 'ACTIVE', 'chinnghiaquangngai@gmail.com', '06 Đinh Tiên Hoàng, Nghĩa Chánh, TP. Quảng Ngãi', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=150&auto=format&fit=crop&q=80', 4.7)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. USERS (Tài khoản người dùng: Admin, Operator FUTA, Customer)
INSERT INTO users (id, phone_number, email, role, bus_company_id, account_status, password, full_name) VALUES
('11111111-1111-1111-1111-111111111111', '0901234567', 'admin@traveleasy.vn', 'ADMIN', NULL, 'ACTIVE', '$2a$12$Pmk4aET/6hYWnob519wJPuCTPdsmPBmolH4Bl85ABX/a6Tz3kFpti', 'Phạm Công Thành (Quản Trị Viên)'),
('22222222-2222-2222-2222-222222222222', '0909888999', 'operator@futa.vn', 'BUS_COMPANY', 'bc-futa', 'ACTIVE', '$2a$12$Pmk4aET/6hYWnob519wJPuCTPdsmPBmolH4Bl85ABX/a6Tz3kFpti', 'Điều Hành Xe Phương Trang (FUTA)'),
('33333333-3333-3333-3333-333333333333', '0912345678', 'customer@gmail.com', 'CUSTOMER', NULL, 'ACTIVE', '$2a$12$Pmk4aET/6hYWnob519wJPuCTPdsmPBmolH4Bl85ABX/a6Tz3kFpti', 'Nguyễn Văn Du Khách'),
('44444444-4444-4444-4444-444444444444', '0902223344', 'phanthanhphong.admin@traveleasy.vn', 'ADMIN', NULL, 'ACTIVE', '$2a$12$Pmk4aET/6hYWnob519wJPuCTPdsmPBmolH4Bl85ABX/a6Tz3kFpti', 'Phạm Thanh Phong'),
('55555555-5555-5555-5555-555555555555', '0903334455', 'trungkien.admin@traveleasy.vn', 'ADMIN', NULL, 'ACTIVE', '$2a$12$Pmk4aET/6hYWnob519wJPuCTPdsmPBmolH4Bl85ABX/a6Tz3kFpti', 'Phan Trung Kiên'),
('66666666-6666-6666-6666-666666666666', '0905556677', 'dieuhanh@hoamaivungtau.com.vn', 'BUS_COMPANY', 'bc-hoamai', 'ACTIVE', '$2a$12$Pmk4aET/6hYWnob519wJPuCTPdsmPBmolH4Bl85ABX/a6Tz3kFpti', 'Điều Hành Xe Hoa Mai'),
('77777777-7777-7777-7777-777777777777', '0906667788', 'dieuhanh@hoanglongasia.com', 'BUS_COMPANY', 'bc-hoanglong', 'ACTIVE', '$2a$12$Pmk4aET/6hYWnob519wJPuCTPdsmPBmolH4Bl85ABX/a6Tz3kFpti', 'Điều Hành Hoàng Long'),
('88888888-8888-8888-8888-888888888888', '0907778899', 'dieuhanh@vanminh74.vn', 'BUS_COMPANY', 'bc-vanminh', 'ACTIVE', '$2a$12$Pmk4aET/6hYWnob519wJPuCTPdsmPBmolH4Bl85ABX/a6Tz3kFpti', 'Điều Hành Văn Minh'),
('99999999-9999-9999-9999-999999999999', '0987654321', 'tranthib@gmail.com', 'CUSTOMER', NULL, 'ACTIVE', '$2a$12$Pmk4aET/6hYWnob519wJPuCTPdsmPBmolH4Bl85ABX/a6Tz3kFpti', 'Trần Thị Bích Ngọc'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '0978112233', 'lehoangc@gmail.com', 'CUSTOMER', NULL, 'ACTIVE', '$2a$12$Pmk4aET/6hYWnob519wJPuCTPdsmPBmolH4Bl85ABX/a6Tz3kFpti', 'Lê Hoàng Cường'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '0933445566', 'phamquocd@gmail.com', 'CUSTOMER', NULL, 'ACTIVE', '$2a$12$Pmk4aET/6hYWnob519wJPuCTPdsmPBmolH4Bl85ABX/a6Tz3kFpti', 'Phạm Quốc Dũng'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '0944556677', 'hoangmaie@gmail.com', 'CUSTOMER', NULL, 'ACTIVE', '$2a$12$Pmk4aET/6hYWnob519wJPuCTPdsmPBmolH4Bl85ABX/a6Tz3kFpti', 'Hoàng Thị Mai')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 5. CANCELLATION POLICIES & RULES
INSERT INTO cancellation_policies (id, owner_bus_company_id, locked_at) VALUES
('cp-futa', 'bc-futa', CURRENT_TIMESTAMP(3)),
('cp-thanhbuoi', 'bc-thanhbuoi', CURRENT_TIMESTAMP(3)),
('cp-saoviet', 'bc-saoviet', CURRENT_TIMESTAMP(3)),
('cp-hoamai', 'bc-hoamai', CURRENT_TIMESTAMP(3)),
('cp-hoanglong', 'bc-hoanglong', CURRENT_TIMESTAMP(3)),
('cp-vanminh', 'bc-vanminh', CURRENT_TIMESTAMP(3)),
('cp-chinnghia', 'bc-chinnghia', CURRENT_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE owner_bus_company_id=VALUES(owner_bus_company_id);

INSERT INTO cancellation_rules (id, policy_id, hours_before_departure, refund_percentage) VALUES
('cr-futa-1', 'cp-futa', 24, 100.00),
('cr-futa-2', 'cp-futa', 12, 50.00),
('cr-futa-3', 'cp-futa', 0, 0.00),
('cr-tb-1', 'cp-thanhbuoi', 24, 100.00),
('cr-tb-2', 'cp-thanhbuoi', 12, 50.00),
('cr-tb-3', 'cp-thanhbuoi', 0, 0.00)
ON DUPLICATE KEY UPDATE refund_percentage=VALUES(refund_percentage);

-- Gán chính sách mặc định cho nhà xe
UPDATE bus_companies SET default_cancellation_policy_id = 'cp-futa' WHERE id = 'bc-futa';
UPDATE bus_companies SET default_cancellation_policy_id = 'cp-thanhbuoi' WHERE id = 'bc-thanhbuoi';
UPDATE bus_companies SET default_cancellation_policy_id = 'cp-saoviet' WHERE id = 'bc-saoviet';
UPDATE bus_companies SET default_cancellation_policy_id = 'cp-hoamai' WHERE id = 'bc-hoamai';
UPDATE bus_companies SET default_cancellation_policy_id = 'cp-hoanglong' WHERE id = 'bc-hoanglong';
UPDATE bus_companies SET default_cancellation_policy_id = 'cp-vanminh' WHERE id = 'bc-vanminh';
UPDATE bus_companies SET default_cancellation_policy_id = 'cp-chinnghia' WHERE id = 'bc-chinnghia';

-- 6. VEHICLES (Đội xe vật lý)
INSERT INTO vehicles (id, bus_company_id, plate_number, vehicle_type, status) VALUES
('veh-futa-1', 'bc-futa', '51B-123.45', 'SLEEPER', 'ACTIVE'),
('veh-futa-2', 'bc-futa', '51B-999.88', 'LIMOUSINE', 'ACTIVE'),
('veh-futa-3', 'bc-futa', '51B-456.78', 'SLEEPER', 'ACTIVE'),
('veh-sao-1', 'bc-saoviet', '29B-888.66', 'LIMOUSINE', 'ACTIVE'),
('veh-hm-1', 'bc-hoamai', '72B-012.34', 'LIMOUSINE', 'ACTIVE'),
('veh-hm-2', 'bc-hoamai', '72B-056.78', 'LIMOUSINE', 'ACTIVE'),
('veh-hm-3', 'bc-hoamai', '72B-099.99', 'LIMOUSINE', 'ACTIVE'),
('veh-futa-4', 'bc-futa', '51B-234.56', 'SLEEPER', 'ACTIVE'),
('veh-tb-1', 'bc-thanhbuoi', '51B-777.88', 'SLEEPER', 'ACTIVE'),
('veh-hl-1', 'bc-hoanglong', '15B-011.22', 'SEAT', 'ACTIVE'),
('veh-hl-2', 'bc-hoanglong', '15B-033.44', 'LIMOUSINE', 'ACTIVE'),
('veh-vm-1', 'bc-vanminh', '37B-088.99', 'SLEEPER', 'ACTIVE'),
('veh-hv-1', 'bc-haivan', '23B-005.55', 'LIMOUSINE', 'ACTIVE'),
('veh-futa-5', 'bc-futa', '43B-022.33', 'SEAT', 'ACTIVE'),
('veh-cn-1', 'bc-chinnghia', '76B-066.77', 'SLEEPER', 'ACTIVE'),
('veh-futa-6', 'bc-futa', '51B-111.22', 'SLEEPER', 'ACTIVE'),
('veh-futa-7', 'bc-futa', '51B-333.44', 'LIMOUSINE', 'ACTIVE'),
('veh-futa-8', 'bc-futa', '51B-555.66', 'SLEEPER', 'ACTIVE'),
('veh-sao-2', 'bc-saoviet', '29B-777.99', 'LIMOUSINE', 'ACTIVE'),
('veh-hm-4', 'bc-hoamai', '72B-088.11', 'LIMOUSINE', 'ACTIVE')
ON DUPLICATE KEY UPDATE plate_number=VALUES(plate_number);

-- Vehicle Images
INSERT INTO vehicle_images (id, vehicle_id, image_url, display_order, is_cover, caption, status) VALUES
('vimg-1', 'veh-futa-1', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800', 1, TRUE, 'Ngoại thất xe Phương Trang', 'ACTIVE'),
('vimg-2', 'veh-futa-2', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800', 1, TRUE, 'Nội thất phòng nằm VIP Limousine', 'ACTIVE')
ON DUPLICATE KEY UPDATE image_url=VALUES(image_url);

-- Vehicle Seat Layouts (1-1 với Vehicle)
INSERT INTO vehicle_seat_layouts (id, vehicle_id, source_template_id, status) VALUES
('vsl-futa-1', 'veh-futa-1', 'slt-34-standard', 'FINALIZED'),
('vsl-futa-2', 'veh-futa-2', 'slt-34-standard', 'FINALIZED'),
('vsl-futa-3', 'veh-futa-3', 'slt-34-standard', 'FINALIZED'),
('vsl-sao-1', 'veh-sao-1', 'slt-34-standard', 'FINALIZED'),
('vsl-hm-1', 'veh-hm-1', 'slt-34-standard', 'FINALIZED'),
('vsl-hm-2', 'veh-hm-2', 'slt-34-standard', 'FINALIZED'),
('vsl-hm-3', 'veh-hm-3', 'slt-34-standard', 'FINALIZED'),
('vsl-futa-4', 'veh-futa-4', 'slt-34-standard', 'FINALIZED'),
('vsl-tb-1', 'veh-tb-1', 'slt-34-standard', 'FINALIZED'),
('vsl-hl-1', 'veh-hl-1', 'slt-34-standard', 'FINALIZED'),
('vsl-hl-2', 'veh-hl-2', 'slt-34-standard', 'FINALIZED'),
('vsl-vm-1', 'veh-vm-1', 'slt-34-standard', 'FINALIZED'),
('vsl-hv-1', 'veh-hv-1', 'slt-34-standard', 'FINALIZED'),
('vsl-futa-5', 'veh-futa-5', 'slt-34-standard', 'FINALIZED'),
('vsl-cn-1', 'veh-cn-1', 'slt-34-standard', 'FINALIZED'),
('vsl-futa-6', 'veh-futa-6', 'slt-34-standard', 'FINALIZED'),
('vsl-futa-7', 'veh-futa-7', 'slt-34-standard', 'FINALIZED'),
('vsl-futa-8', 'veh-futa-8', 'slt-34-standard', 'FINALIZED'),
('vsl-sao-2', 'veh-sao-2', 'slt-34-standard', 'FINALIZED'),
('vsl-hm-4', 'veh-hm-4', 'slt-34-standard', 'FINALIZED')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Seat Position Assignments cho xe veh-futa-1 (Tầng 1 STANDARD, Tầng 2 VIP)
INSERT INTO seat_position_assignments (id, vehicle_seat_layout_id, seat_code, floor, seat_row, column_number, seat_type_code, status) VALUES
('spa-1-a01', 'vsl-futa-1', 'A01', 1, 1, 1, 'STANDARD', 'ACTIVE'),
('spa-1-a02', 'vsl-futa-1', 'A02', 1, 1, 2, 'STANDARD', 'ACTIVE'),
('spa-1-a03', 'vsl-futa-1', 'A03', 1, 2, 1, 'STANDARD', 'ACTIVE'),
('spa-1-a04', 'vsl-futa-1', 'A04', 1, 2, 2, 'STANDARD', 'ACTIVE'),
('spa-1-b01', 'vsl-futa-1', 'B01', 2, 1, 1, 'VIP', 'ACTIVE'),
('spa-1-b02', 'vsl-futa-1', 'B02', 2, 1, 2, 'VIP', 'ACTIVE')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 7. ADMINISTRATIVE PROVINCES & COMMUNES
INSERT INTO administrative_provinces (id, official_code, name, unit_type, status) VALUES
('prov-79', '79', 'Thành phố Hồ Chí Minh', 'CITY', 'ACTIVE'),
('prov-68', '68', 'Tỉnh Lâm Đồng', 'PROVINCE', 'ACTIVE'),
('prov-56', '56', 'Tỉnh Khánh Hòa', 'PROVINCE', 'ACTIVE'),
('prov-92', '92', 'Thành phố Cần Thơ', 'CITY', 'ACTIVE'),
('prov-01', '01', 'Thành phố Hà Nội', 'CITY', 'ACTIVE'),
('prov-10', '10', 'Tỉnh Lào Cai', 'PROVINCE', 'ACTIVE'),
('prov-77', '77', 'Tỉnh Bà Rịa - Vũng Tàu', 'PROVINCE', 'ACTIVE'),
('prov-60', '60', 'Tỉnh Bình Thuận', 'PROVINCE', 'ACTIVE'),
('prov-66', '66', 'Tỉnh Đắk Lắk', 'PROVINCE', 'ACTIVE'),
('prov-31', '31', 'Thành phố Hải Phòng', 'CITY', 'ACTIVE'),
('prov-22', '22', 'Tỉnh Quảng Ninh', 'PROVINCE', 'ACTIVE'),
('prov-40', '40', 'Tỉnh Nghệ An', 'PROVINCE', 'ACTIVE'),
('prov-02', '02', 'Tỉnh Hà Giang', 'PROVINCE', 'ACTIVE'),
('prov-48', '48', 'Thành phố Đà Nẵng', 'CITY', 'ACTIVE'),
('prov-46', '46', 'Tỉnh Thừa Thiên Huế', 'PROVINCE', 'ACTIVE'),
('prov-52', '52', 'Tỉnh Bình Định', 'PROVINCE', 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO administrative_communes (id, province_id, official_code, name, unit_type, status) VALUES
('comm-bt', 'prov-79', '769', 'Phường An Lạc (Bình Tân)', 'WARD', 'ACTIVE'),
('comm-dl', 'prov-68', '512', 'Phường 3 (TP. Đà Lạt)', 'WARD', 'ACTIVE'),
('comm-nt', 'prov-56', '384', 'Phường Xương Huân (TP. Nha Trang)', 'WARD', 'ACTIVE'),
('comm-ct', 'prov-92', '916', 'Phường Tân An (Ninh Kiều, Cần Thơ)', 'WARD', 'ACTIVE'),
('comm-hn', 'prov-01', '019', 'Phường Mỹ Đình (Nam Từ Liêm, Hà Nội)', 'WARD', 'ACTIVE'),
('comm-sp', 'prov-10', '082', 'Thị xã Sa Pa', 'WARD', 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 8. LOCATIONS (Shared Master Data)
INSERT INTO locations (id, name, latitude, longitude, province_name, district_name, ward_name, status) VALUES
('loc-bx-mientay', 'Bến xe Miền Tây', 10.749200, 106.609400, 'TP. Hồ Chí Minh', 'Bình Tân', 'An Lạc', 'ACTIVE'),
('loc-tram-ansuong', 'Trạm An Sương', 10.843600, 106.611700, 'TP. Hồ Chí Minh', 'Hóc Môn', 'Bà Điểm', 'ACTIVE'),
('loc-bx-miendong', 'Bến xe Miền Đông Mới', 10.880500, 106.815300, 'TP. Hồ Chí Minh', 'TP. Thủ Đức', 'Long Bình', 'ACTIVE'),
('loc-bx-dalat', 'Bến xe Liên tỉnh Đà Lạt', 11.933200, 108.448500, 'Lâm Đồng', 'TP. Đà Lạt', 'Phường 3', 'ACTIVE'),
('loc-bx-nhatrang', 'Bến xe Phía Nam Nha Trang', 12.238800, 109.167200, 'Khánh Hòa', 'TP. Nha Trang', 'Xương Huân', 'ACTIVE'),
('loc-bx-cantho', 'Bến xe Trung tâm Cần Thơ', 10.012500, 105.772500, 'Cần Thơ', 'Cái Răng', 'Hưng Thành', 'ACTIVE'),
('loc-bx-mydinh', 'Bến xe Mỹ Đình', 21.028500, 105.778200, 'Hà Nội', 'Nam Từ Liêm', 'Mỹ Đình', 'ACTIVE'),
('loc-bx-sapa', 'Bến xe Sa Pa', 22.336400, 103.843800, 'Lào Cai', 'Thị xã Sa Pa', 'Sa Pa', 'ACTIVE'),
('loc-bx-vungtau', 'Bến xe Vũng Tàu', 10.354100, 107.084200, 'Bà Rịa - Vũng Tàu', 'TP. Vũng Tàu', 'Phường Thắng Tam', 'ACTIVE'),
('loc-tram-hangxanh', 'Trạm Hàng Xanh', 10.801600, 106.711800, 'TP. Hồ Chí Minh', 'Bình Thạnh', 'Phường 21', 'ACTIVE'),
('loc-vp-q1', 'Văn phòng Quận 1', 10.771200, 106.698500, 'TP. Hồ Chí Minh', 'Quận 1', 'Nguyễn Thái Bình', 'ACTIVE'),
('loc-bx-phanthiet', 'Bến xe Bắc Phan Thiết', 10.932800, 108.098400, 'Bình Thuận', 'TP. Phan Thiết', 'Từ Văn Tư', 'ACTIVE'),
('loc-bx-bmt', 'Bến xe Liên Tỉnh Đắk Lắk', 12.695300, 108.065800, 'Đắk Lắk', 'TP. Buôn Ma Thuột', 'Tân An', 'ACTIVE'),
('loc-bx-nuocngam', 'Bến xe Nước Ngầm', 20.976500, 105.841200, 'Hà Nội', 'Hoàng Mai', 'Hoàng Liệt', 'ACTIVE'),
('loc-bx-niemnghia', 'Bến xe Niệm Nghĩa', 20.852100, 106.671300, 'Hải Phòng', 'Lê Chân', 'Niệm Nghĩa', 'ACTIVE'),
('loc-bx-baichay', 'Bến xe Bãi Cháy', 20.970200, 107.034500, 'Quảng Ninh', 'TP. Hạ Long', 'Bãi Cháy', 'ACTIVE'),
('loc-bx-bacvinh', 'Bến xe Bắc Vinh', 18.710200, 105.674200, 'Nghệ An', 'TP. Vinh', 'Nghi Kim', 'ACTIVE'),
('loc-bx-hagiang', 'Bến xe Trung tâm Hà Giang', 22.801200, 104.978200, 'Hà Giang', 'TP. Hà Giang', 'Phương Thiện', 'ACTIVE'),
('loc-bx-danang', 'Bến xe Trung tâm Đà Nẵng', 16.059200, 108.172500, 'Đà Nẵng', 'Liên Chiểu', 'Hòa Minh', 'ACTIVE'),
('loc-bx-hue', 'Bến xe Phía Nam Huế', 16.442500, 107.595400, 'Thừa Thiên Huế', 'TP. Huế', 'An Đông', 'ACTIVE'),
('loc-bx-quynhon', 'Bến xe Trung tâm Quy Nhơn', 13.754200, 109.214500, 'Bình Định', 'TP. Quy Nhơn', 'Ghềnh Ráng', 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 9. BUS COMPANY LOCATION CONFIGS (Cấu hình đón trả riêng của từng nhà xe)
INSERT INTO bus_company_location_configs (id, bus_company_id, location_id, display_name, status, accepts_pickup, accepts_dropoff, contact_phone, driver_meeting_instructions) VALUES
('bclc-futa-bxmt', 'bc-futa', 'loc-bx-mientay', 'Văn phòng FUTA Bến xe Miền Tây', 'ACTIVE', TRUE, FALSE, '1900 6067', 'Có mặt trước giờ khởi hành 30 phút tại quầy vé số 12'),
('bclc-futa-as', 'bc-futa', 'loc-tram-ansuong', 'Trạm FUTA Ngã tư An Sương', 'ACTIVE', TRUE, FALSE, '1900 6067', 'Chờ tại phòng chờ máy lạnh số 2'),
('bclc-futa-bxdl', 'bc-futa', 'loc-bx-dalat', 'Bến xe FUTA Liên tỉnh Đà Lạt', 'ACTIVE', FALSE, TRUE, '1900 6067', 'Xe trung chuyển trả tận khách sạn trung tâm'),
('bclc-futa-bxnt', 'bc-futa', 'loc-bx-nhatrang', 'Văn phòng FUTA Phía Nam Nha Trang', 'ACTIVE', FALSE, TRUE, '1900 6067', 'Đón trả khách tại sảnh chính'),
('bclc-sao-bxmd', 'bc-saoviet', 'loc-bx-mydinh', 'Văn phòng Sao Việt Mỹ Đình', 'ACTIVE', TRUE, FALSE, '1900 6746', 'Quầy vé Sao Việt cạnh cổng ra vào số 1'),
('bclc-sao-bxsp', 'bc-saoviet', 'loc-bx-sapa', 'Bến xe Sao Việt Sa Pa', 'ACTIVE', FALSE, TRUE, '1900 6746', 'Trả khách tại sảnh bến xe Điện Biên Phủ')
ON DUPLICATE KEY UPDATE display_name=VALUES(display_name);

-- 10. ROUTE TEMPLATES (Tuyến mẫu)
INSERT INTO route_templates (id, bus_company_id, name, origin_location_id, destination_location_id, status) VALUES
('rt-futa-hcm-dl', 'bc-futa', 'TP. Hồ Chí Minh ➔ Đà Lạt (FUTA Limousine)', 'loc-bx-mientay', 'loc-bx-dalat', 'PUBLISHED'),
('rt-futa-hcm-nt', 'bc-futa', 'TP. Hồ Chí Minh ➔ Nha Trang (FUTA Express)', 'loc-bx-miendong', 'loc-bx-nhatrang', 'PUBLISHED'),
('rt-tb-hcm-ct', 'bc-thanhbuoi', 'TP. Hồ Chí Minh ➔ Cần Thơ (Thành Bưởi VIP)', 'loc-bx-mientay', 'loc-bx-cantho', 'PUBLISHED'),
('rt-sao-hn-sp', 'bc-saoviet', 'Hà Nội ➔ Sa Pa (Sao Việt Cabin Cung Điện)', 'loc-bx-mydinh', 'loc-bx-sapa', 'PUBLISHED'),
('rt-hm-hcm-vt', 'bc-hoamai', 'TP. Hồ Chí Minh ➔ Vũng Tàu (Hoa Mai Limousine)', 'loc-vp-q1', 'loc-bx-vungtau', 'PUBLISHED'),
('rt-hm-vt-hcm', 'bc-hoamai', 'Vũng Tàu ➔ TP. Hồ Chí Minh (Hoa Mai Limousine)', 'loc-bx-vungtau', 'loc-vp-q1', 'PUBLISHED'),
('rt-futa-hcm-pt', 'bc-futa', 'TP. Hồ Chí Minh ➔ Phan Thiết (FUTA Giường Nằm)', 'loc-bx-miendong', 'loc-bx-phanthiet', 'PUBLISHED'),
('rt-tb-hcm-bmt', 'bc-thanhbuoi', 'TP. Hồ Chí Minh ➔ Buôn Ma Thuột (Thành Bưởi)', 'loc-bx-mientay', 'loc-bx-bmt', 'PUBLISHED'),
('rt-hl-hn-hp', 'bc-hoanglong', 'Hà Nội ➔ Hải Phòng (Hoàng Long Cao Tốc)', 'loc-bx-nuocngam', 'loc-bx-niemnghia', 'PUBLISHED'),
('rt-hl-hn-hl', 'bc-hoanglong', 'Hà Nội ➔ Hạ Long (Hoàng Long Limousine)', 'loc-bx-mydinh', 'loc-bx-baichay', 'PUBLISHED'),
('rt-vm-hn-vinh', 'bc-vanminh', 'Hà Nội ➔ Vinh (Văn Minh VIP)', 'loc-bx-nuocngam', 'loc-bx-bacvinh', 'PUBLISHED'),
('rt-hv-hn-hg', 'bc-haivan', 'Hà Nội ➔ Hà Giang (Hải Vân Express)', 'loc-bx-mydinh', 'loc-bx-hagiang', 'PUBLISHED'),
('rt-futa-dn-hue', 'bc-futa', 'Đà Nẵng ➔ Huế (FUTA Ghế Ngồi)', 'loc-bx-danang', 'loc-bx-hue', 'PUBLISHED'),
('rt-cn-dn-qn', 'bc-chinnghia', 'Đà Nẵng ➔ Quy Nhơn (Chín Nghĩa Giường Nằm)', 'loc-bx-danang', 'loc-bx-quynhon', 'PUBLISHED')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Route Template Stops
INSERT INTO route_template_stops (id, route_template_id, sequence, bus_company_location_config_id, estimated_travel_duration_from_previous_stop_minutes, stop_type) VALUES
('rts-1-1', 'rt-futa-hcm-dl', 1, 'bclc-futa-bxmt', 0, 'PICKUP'),
('rts-1-2', 'rt-futa-hcm-dl', 2, 'bclc-futa-as', 45, 'PICKUP'),
('rts-1-3', 'rt-futa-hcm-dl', 3, 'bclc-futa-bxdl', 345, 'DROPOFF'),
('rts-4-1', 'rt-sao-hn-sp', 1, 'bclc-sao-bxmd', 0, 'PICKUP'),
('rts-4-2', 'rt-sao-hn-sp', 2, 'bclc-sao-bxsp', 330, 'DROPOFF')
ON DUPLICATE KEY UPDATE stop_type=VALUES(stop_type);

-- Route Template Seat Prices
INSERT INTO route_template_seat_prices (id, route_template_id, seat_type_code, price_amount, price_currency) VALUES
('rtsp-1-std', 'rt-futa-hcm-dl', 'STANDARD', 290000.00, 'VND'),
('rtsp-1-vip', 'rt-futa-hcm-dl', 'VIP', 340000.00, 'VND'),
('rtsp-2-std', 'rt-futa-hcm-nt', 'STANDARD', 320000.00, 'VND'),
('rtsp-4-cab', 'rt-sao-hn-sp', 'CABIN', 380000.00, 'VND')
ON DUPLICATE KEY UPDATE price_amount=VALUES(price_amount);

-- Route Template Shuttle Services
INSERT INTO route_template_shuttle_services (id, route_template_id, shuttle_type, reference_stop_id, shuttle_offset_minutes, coverage_area_description, pricing_type, fee_amount) VALUES
('rtss-1-drop', 'rt-futa-hcm-dl', 'DROPOFF', 'rts-1-3', 30, 'Bán kính 5km trung tâm thành phố Đà Lạt', 'FREE', NULL)
ON DUPLICATE KEY UPDATE coverage_area_description=VALUES(coverage_area_description);

-- 11. TRIPS (Chuyến xe mở bán theo lịch trình thực tế)
INSERT INTO trips (id, route_template_id, vehicle_id, cancellation_policy_id, origin_location_id, destination_location_id, base_departure_time, delay_minutes, status, departure_time, arrival_time, bus_type, license_plate, total_seats, available_seats, price, description) VALUES
('trip-1', 'rt-futa-hcm-dl', 'veh-futa-1', 'cp-futa', 'loc-bx-mientay', 'loc-bx-dalat', DATE_ADD(CURRENT_DATE(), INTERVAL '1 08:00:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '1 08:00:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '1 14:30:00' DAY_SECOND), 'SLEEPER', '51B-123.45', 34, 32, 290000.00, 'Xe giường nằm 34 chỗ cao cấp FUTA, trang bị điều hòa kháng khuẩn, wifi 5G tốc độ cao, nước khoáng Lavie và khăn lạnh miễn phí suốt hành trình.'),
('trip-2', 'rt-futa-hcm-dl', 'veh-futa-2', 'cp-futa', 'loc-bx-mientay', 'loc-bx-dalat', DATE_ADD(CURRENT_DATE(), INTERVAL '1 22:30:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '1 22:30:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '2 05:00:00' DAY_SECOND), 'LIMOUSINE', '51B-999.88', 34, 34, 340000.00, 'Xe Limousine VIP 34 phòng đơn riêng tư, sạc điện thoại Type-C đa năng, rèm che kín đáo, tivi màn hình cảm ứng giải trí từng cabin.'),
('trip-3', 'rt-futa-hcm-nt', 'veh-futa-3', 'cp-futa', 'loc-bx-miendong', 'loc-bx-nhatrang', DATE_ADD(CURRENT_DATE(), INTERVAL '1 07:00:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '1 07:00:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '1 15:00:00' DAY_SECOND), 'SLEEPER', '51B-456.78', 34, 34, 320000.00, 'Tuyến Sài Gòn đi phố biển Nha Trang qua cao tốc Phan Thiết - Vĩnh Hảo êm ái, hỗ trợ đón khách chu đáo tận nơi.'),
('trip-4', 'rt-sao-hn-sp', 'veh-sao-1', 'cp-saoviet', 'loc-bx-mydinh', 'loc-bx-sapa', DATE_ADD(CURRENT_DATE(), INTERVAL '1 06:30:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '1 06:30:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '1 12:00:00' DAY_SECOND), 'LIMOUSINE', '29B-888.66', 34, 34, 380000.00, 'Xe Cabin Cung Điện Bay Hà Nội - Sa Pa qua cao tốc Nội Bài - Lào Cai, trang bị đệm massage toàn thân thư giãn.'),
('trip-5', 'rt-hm-hcm-vt', 'veh-hm-1', 'cp-hoamai', 'loc-vp-q1', 'loc-bx-vungtau', DATE_ADD(CURRENT_DATE(), INTERVAL '1 09:00:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '1 09:00:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '1 11:00:00' DAY_SECOND), 'LIMOUSINE', '72B-012.34', 34, 30, 180000.00, 'Xe Limousine VIP Hoa Mai 9-34 chỗ, đưa đón tận nơi khu vực Bãi Trước/Bãi Sau Vũng Tàu.'),
('trip-6', 'rt-hm-hcm-vt', 'veh-hm-2', 'cp-hoamai', 'loc-vp-q1', 'loc-bx-vungtau', DATE_ADD(CURRENT_DATE(), INTERVAL '1 14:00:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '1 14:00:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '1 16:00:00' DAY_SECOND), 'LIMOUSINE', '72B-056.78', 34, 34, 180000.00, 'Xe Limousine cao cấp chuyến chiều, máy lạnh êm ái, wifi miễn phí.'),
('trip-7', 'rt-hm-vt-hcm', 'veh-hm-3', 'cp-hoamai', 'loc-bx-vungtau', 'loc-vp-q1', DATE_ADD(CURRENT_DATE(), INTERVAL '1 16:30:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '1 16:30:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '1 18:30:00' DAY_SECOND), 'LIMOUSINE', '72B-099.99', 34, 28, 180000.00, 'Chuyến Vũng Tàu về Sài Gòn trả khách Hàng Xanh và Quận 1.'),
('trip-8', 'rt-futa-hcm-pt', 'veh-futa-4', 'cp-futa', 'loc-bx-miendong', 'loc-bx-phanthiet', DATE_ADD(CURRENT_DATE(), INTERVAL '1 08:30:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '1 08:30:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '1 12:30:00' DAY_SECOND), 'SLEEPER', '51B-234.56', 34, 32, 220000.00, 'Xe giường nằm FUTA đi Phan Thiết - Mũi Né, trả tại các resort Hàm Tiến.'),
('trip-9', 'rt-tb-hcm-bmt', 'veh-tb-1', 'cp-thanhbuoi', 'loc-bx-mientay', 'loc-bx-bmt', DATE_ADD(CURRENT_DATE(), INTERVAL '1 21:00:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '1 21:00:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '2 04:30:00' DAY_SECOND), 'SLEEPER', '51B-777.88', 34, 34, 350000.00, 'Tuyến Sài Gòn đi thủ phủ cà phê Buôn Ma Thuột, xe đời mới giường êm rộng rãi.'),
('trip-10', 'rt-hl-hn-hp', 'veh-hl-1', 'cp-hoanglong', 'loc-bx-nuocngam', 'loc-bx-niemnghia', DATE_ADD(CURRENT_DATE(), INTERVAL '1 07:30:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '1 07:30:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '1 09:00:00' DAY_SECOND), 'SEAT', '15B-011.22', 34, 34, 150000.00, 'Xe ghế ngồi cao cấp Hoàng Long chạy cao tốc Hà Nội - Hải Phòng 5 sao.'),
('trip-11', 'rt-hl-hn-hl', 'veh-hl-2', 'cp-hoanglong', 'loc-bx-mydinh', 'loc-bx-baichay', DATE_ADD(CURRENT_DATE(), INTERVAL '1 08:00:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '1 08:00:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '1 10:30:00' DAY_SECOND), 'LIMOUSINE', '15B-033.44', 34, 31, 250000.00, 'Hà Nội - Hạ Long ngắm vịnh di sản, xe Limousine sang trọng tiện nghi.'),
('trip-12', 'rt-vm-hn-vinh', 'veh-vm-1', 'cp-vanminh', 'loc-bx-nuocngam', 'loc-bx-bacvinh', DATE_ADD(CURRENT_DATE(), INTERVAL '1 22:00:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '1 22:00:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '2 03:30:00' DAY_SECOND), 'SLEEPER', '37B-088.99', 34, 26, 310000.00, 'Nhà xe Văn Minh chuyên tuyến Nghệ An, phục vụ chu đáo, phát đồ ăn nhẹ và nước suối.'),
('trip-13', 'rt-hv-hn-hg', 'veh-hv-1', 'cp-haivan', 'loc-bx-mydinh', 'loc-bx-hagiang', DATE_ADD(CURRENT_DATE(), INTERVAL '1 20:30:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '1 20:30:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '2 02:30:00' DAY_SECOND), 'LIMOUSINE', '23B-005.55', 34, 34, 390000.00, 'Hải Vân Express cabin đôi đi cao nguyên đá Đồng Văn - Hà Giang.'),
('trip-14', 'rt-futa-dn-hue', 'veh-futa-5', 'cp-futa', 'loc-bx-danang', 'loc-bx-hue', DATE_ADD(CURRENT_DATE(), INTERVAL '1 10:00:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '1 10:00:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '1 12:30:00' DAY_SECOND), 'SEAT', '43B-022.33', 34, 34, 120000.00, 'Tuyến liên tỉnh miền Trung qua hầm Hải Vân, đón trả trung tâm Đà Nẵng - Huế.'),
('trip-15', 'rt-cn-dn-qn', 'veh-cn-1', 'cp-chinnghia', 'loc-bx-danang', 'loc-bx-quynhon', DATE_ADD(CURRENT_DATE(), INTERVAL '1 13:00:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '1 13:00:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '1 18:30:00' DAY_SECOND), 'SLEEPER', '76B-066.77', 34, 33, 270000.00, 'Chuyến Đà Nẵng đi thành phố biển Quy Nhơn, xe chạy êm, giá vé ổn định.'),
('trip-16', 'rt-futa-hcm-dl', 'veh-futa-6', 'cp-futa', 'loc-bx-mientay', 'loc-bx-dalat', DATE_ADD(CURRENT_DATE(), INTERVAL '2 07:30:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '2 07:30:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '2 14:00:00' DAY_SECOND), 'SLEEPER', '51B-111.22', 34, 34, 290000.00, 'FUTA Sài Gòn - Đà Lạt chuyến sáng ngắm đèo Bảo Lộc.'),
('trip-17', 'rt-futa-hcm-dl', 'veh-futa-7', 'cp-futa', 'loc-bx-mientay', 'loc-bx-dalat', DATE_ADD(CURRENT_DATE(), INTERVAL '2 23:00:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '2 23:00:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '3 05:30:00' DAY_SECOND), 'LIMOUSINE', '51B-333.44', 34, 29, 350000.00, 'Limousine phòng vip FUTA Sài Gòn - Đà Lạt đi đêm ngủ một giấc tới nơi.'),
('trip-18', 'rt-futa-hcm-nt', 'veh-futa-8', 'cp-futa', 'loc-bx-miendong', 'loc-bx-nhatrang', DATE_ADD(CURRENT_DATE(), INTERVAL '2 21:00:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '2 21:00:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '3 05:00:00' DAY_SECOND), 'SLEEPER', '51B-555.66', 34, 34, 320000.00, 'Xe giường nằm đi Nha Trang chuyến tối đón bình minh trên biển.'),
('trip-19', 'rt-sao-hn-sp', 'veh-sao-2', 'cp-saoviet', 'loc-bx-mydinh', 'loc-bx-sapa', DATE_ADD(CURRENT_DATE(), INTERVAL '2 22:30:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '2 22:30:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '3 04:00:00' DAY_SECOND), 'LIMOUSINE', '29B-777.99', 34, 30, 400000.00, 'Sao Việt Royal Cabin VIP Hà Nội - Sa Pa đi săn mây Fansipan.'),
('trip-20', 'rt-hm-hcm-vt', 'veh-hm-4', 'cp-hoamai', 'loc-vp-q1', 'loc-bx-vungtau', DATE_ADD(CURRENT_DATE(), INTERVAL '3 08:00:00' DAY_SECOND), 0, 'SCHEDULED', DATE_ADD(CURRENT_DATE(), INTERVAL '3 08:00:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '3 10:00:00' DAY_SECOND), 'LIMOUSINE', '72B-088.11', 34, 34, 190000.00, 'Hoa Mai Vũng Tàu chuyến sáng cuối tuần đi tắm biển.')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 12. TRIP POINTS (Snapshot lịch trình + ETA bất biến)
INSERT INTO trip_points (id, trip_id, bus_company_location_config_id, sequence, eta, display_name, accepts_pickup, accepts_dropoff, contact_phone, driver_meeting_instructions) VALUES
('tp-1-1', 'trip-1', 'bclc-futa-bxmt', 1, DATE_ADD(CURRENT_DATE(), INTERVAL '1 08:00:00' DAY_SECOND), 'Văn phòng FUTA Bến xe Miền Tây', TRUE, FALSE, '1900 6067', 'Có mặt trước giờ khởi hành 30 phút tại quầy vé số 12'),
('tp-1-2', 'trip-1', 'bclc-futa-as', 2, DATE_ADD(CURRENT_DATE(), INTERVAL '1 08:45:00' DAY_SECOND), 'Trạm FUTA Ngã tư An Sương', TRUE, FALSE, '1900 6067', 'Chờ tại phòng chờ máy lạnh số 2'),
('tp-1-3', 'trip-1', 'bclc-futa-bxdl', 3, DATE_ADD(CURRENT_DATE(), INTERVAL '1 14:30:00' DAY_SECOND), 'Bến xe FUTA Liên tỉnh Đà Lạt', FALSE, TRUE, '1900 6067', 'Xe trung chuyển trả tận khách sạn trung tâm')
ON DUPLICATE KEY UPDATE display_name=VALUES(display_name);

-- 13. TRIP SEAT PRICES (Snapshot bất biến từ RouteTemplateSeatPrice)
INSERT INTO trip_seat_prices (trip_id, seat_type_code, price_amount, price_currency) VALUES
('trip-1', 'STANDARD', 290000.00, 'VND'),
('trip-1', 'VIP', 340000.00, 'VND'),
('trip-2', 'STANDARD', 290000.00, 'VND'),
('trip-2', 'VIP', 340000.00, 'VND'),
('trip-3', 'STANDARD', 320000.00, 'VND'),
('trip-4', 'CABIN', 380000.00, 'VND')
ON DUPLICATE KEY UPDATE price_amount=VALUES(price_amount);

-- 14. TRIP SHUTTLE SERVICES (Snapshot trung chuyển)
INSERT INTO trip_shuttle_services (id, trip_id, shuttle_type, reference_stop_id, shuttle_offset_minutes, coverage_area_description, pricing_type, fee_amount, display_time) VALUES
('tss-trip1-drop', 'trip-1', 'DROPOFF', 'tp-1-3', 30, 'Bán kính 5km trung tâm thành phố Đà Lạt', 'FREE', NULL, DATE_ADD(CURRENT_DATE(), INTERVAL '1 15:00:00' DAY_SECOND))
ON DUPLICATE KEY UPDATE coverage_area_description=VALUES(coverage_area_description);

-- 15. TRIP SEATS (136 Ghế ngồi cho 4 chuyến - Tầng 1: A01-A17 STANDARD, Tầng 2: B01-B17 VIP)
-- Chuyến 1 (A01, A02 đã bán mẫu để demo)
INSERT INTO trip_seats (trip_id, seat_code, seat_type_code, status, version) VALUES
('trip-1', 'A01', 'STANDARD', 'BOOKED', 1),
('trip-1', 'A02', 'STANDARD', 'BOOKED', 1),
('trip-1', 'A03', 'STANDARD', 'AVAILABLE', 0),
('trip-1', 'A04', 'STANDARD', 'AVAILABLE', 0),
('trip-1', 'A05', 'STANDARD', 'AVAILABLE', 0),
('trip-1', 'A06', 'STANDARD', 'AVAILABLE', 0),
('trip-1', 'A07', 'STANDARD', 'AVAILABLE', 0),
('trip-1', 'A08', 'STANDARD', 'AVAILABLE', 0),
('trip-1', 'A09', 'STANDARD', 'AVAILABLE', 0),
('trip-1', 'A10', 'STANDARD', 'AVAILABLE', 0),
('trip-1', 'A11', 'STANDARD', 'AVAILABLE', 0),
('trip-1', 'A12', 'STANDARD', 'AVAILABLE', 0),
('trip-1', 'A13', 'STANDARD', 'AVAILABLE', 0),
('trip-1', 'A14', 'STANDARD', 'AVAILABLE', 0),
('trip-1', 'A15', 'STANDARD', 'AVAILABLE', 0),
('trip-1', 'A16', 'STANDARD', 'AVAILABLE', 0),
('trip-1', 'A17', 'STANDARD', 'AVAILABLE', 0),
('trip-1', 'B01', 'VIP', 'AVAILABLE', 0),
('trip-1', 'B02', 'VIP', 'AVAILABLE', 0),
('trip-1', 'B03', 'VIP', 'AVAILABLE', 0),
('trip-1', 'B04', 'VIP', 'AVAILABLE', 0),
('trip-1', 'B05', 'VIP', 'AVAILABLE', 0),
('trip-1', 'B06', 'VIP', 'AVAILABLE', 0),
('trip-1', 'B07', 'VIP', 'AVAILABLE', 0),
('trip-1', 'B08', 'VIP', 'AVAILABLE', 0),
('trip-1', 'B09', 'VIP', 'AVAILABLE', 0),
('trip-1', 'B10', 'VIP', 'AVAILABLE', 0),
('trip-1', 'B11', 'VIP', 'AVAILABLE', 0),
('trip-1', 'B12', 'VIP', 'AVAILABLE', 0),
('trip-1', 'B13', 'VIP', 'AVAILABLE', 0),
('trip-1', 'B14', 'VIP', 'AVAILABLE', 0),
('trip-1', 'B15', 'VIP', 'AVAILABLE', 0),
('trip-1', 'B16', 'VIP', 'AVAILABLE', 0),
('trip-1', 'B17', 'VIP', 'AVAILABLE', 0)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Chuyến 2 (Mở bán 34 ghế)
INSERT INTO trip_seats (trip_id, seat_code, seat_type_code, status, version) VALUES
('trip-2', 'A01', 'STANDARD', 'AVAILABLE', 0), ('trip-2', 'A02', 'STANDARD', 'AVAILABLE', 0),
('trip-2', 'A03', 'STANDARD', 'AVAILABLE', 0), ('trip-2', 'A04', 'STANDARD', 'AVAILABLE', 0),
('trip-2', 'B01', 'VIP', 'AVAILABLE', 0), ('trip-2', 'B02', 'VIP', 'AVAILABLE', 0),
('trip-3', 'A01', 'STANDARD', 'AVAILABLE', 0), ('trip-3', 'A02', 'STANDARD', 'AVAILABLE', 0), ('trip-3', 'B01', 'VIP', 'AVAILABLE', 0), ('trip-3', 'B02', 'VIP', 'AVAILABLE', 0),
('trip-4', 'A01', 'CABIN', 'AVAILABLE', 0), ('trip-4', 'A02', 'CABIN', 'AVAILABLE', 0), ('trip-4', 'B01', 'CABIN', 'AVAILABLE', 0), ('trip-4', 'B02', 'CABIN', 'AVAILABLE', 0),
('trip-5', 'A01', 'STANDARD', 'BOOKED', 1), ('trip-5', 'A02', 'STANDARD', 'BOOKED', 1), ('trip-5', 'A03', 'STANDARD', 'BOOKED', 1), ('trip-5', 'A04', 'STANDARD', 'BOOKED', 1), ('trip-5', 'A05', 'STANDARD', 'AVAILABLE', 0), ('trip-5', 'B01', 'VIP', 'AVAILABLE', 0),
('trip-6', 'A01', 'STANDARD', 'AVAILABLE', 0), ('trip-6', 'A02', 'STANDARD', 'AVAILABLE', 0), ('trip-6', 'B01', 'VIP', 'AVAILABLE', 0),
('trip-7', 'A01', 'STANDARD', 'BOOKED', 1), ('trip-7', 'A02', 'STANDARD', 'BOOKED', 1), ('trip-7', 'B01', 'VIP', 'BOOKED', 1), ('trip-7', 'B02', 'VIP', 'AVAILABLE', 0),
('trip-8', 'A01', 'STANDARD', 'BOOKED', 1), ('trip-8', 'A02', 'STANDARD', 'BOOKED', 1), ('trip-8', 'B01', 'VIP', 'AVAILABLE', 0),
('trip-11', 'A01', 'STANDARD', 'BOOKED', 1), ('trip-11', 'A02', 'STANDARD', 'BOOKED', 1), ('trip-11', 'A03', 'STANDARD', 'BOOKED', 1), ('trip-11', 'B01', 'VIP', 'AVAILABLE', 0),
('trip-12', 'A01', 'STANDARD', 'BOOKED', 1), ('trip-12', 'A02', 'STANDARD', 'BOOKED', 1), ('trip-12', 'A03', 'STANDARD', 'BOOKED', 1), ('trip-12', 'A04', 'STANDARD', 'BOOKED', 1), ('trip-12', 'B01', 'VIP', 'AVAILABLE', 0),
('trip-15', 'A01', 'STANDARD', 'BOOKED', 1), ('trip-15', 'A02', 'STANDARD', 'AVAILABLE', 0), ('trip-15', 'B01', 'VIP', 'AVAILABLE', 0)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 16. BOOKINGS & TICKETS (Đơn vé mẫu và vé điện tử)
INSERT INTO bookings (id, user_id, trip_id, status, total_amount, currency, booking_code, passenger_name, passenger_phone, passenger_email, pickup_point, dropoff_point, seat_numbers, payment_method) VALUES
('bk-sample-001', '33333333-3333-3333-3333-333333333333', 'trip-1', 'CONFIRMED', 580000.00, 'VND', 'BKG-20261025-001', 'Nguyễn Văn Du Khách', '0912345678', 'customer@gmail.com', 'Bến xe Miền Tây', 'Bến xe Liên tỉnh Đà Lạt', 'A01, A02', 'COD'),
('bk-sample-002', '99999999-9999-9999-9999-999999999999', 'trip-5', 'CONFIRMED', 360000.00, 'VND', 'BKG-20261021-002', 'Trần Thị Bích Ngọc', '0987654321', 'tranthib@gmail.com', 'Văn phòng Quận 1', 'Bãi Sau Vũng Tàu (Đón trả tận nơi)', 'A01, A02', 'COD'),
('bk-sample-003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'trip-8', 'CONFIRMED', 440000.00, 'VND', 'BKG-20261021-003', 'Lê Hoàng Cường', '0978112233', 'lehoangc@gmail.com', 'Bến xe Miền Đông Mới', 'Resort Hàm Tiến - Mũi Né', 'A01, A02', 'COD'),
('bk-sample-004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'trip-11', 'COMPLETED', 750000.00, 'VND', 'BKG-20261021-004', 'Phạm Quốc Dũng', '0933445566', 'phamquocd@gmail.com', 'Bến xe Mỹ Đình', 'Bến xe Bãi Cháy', 'A01, A02, A03', 'COD'),
('bk-sample-005', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'trip-12', 'CONFIRMED', 1240000.00, 'VND', 'BKG-20261021-005', 'Hoàng Thị Mai', '0944556677', 'hoangmaie@gmail.com', 'Bến xe Nước Ngầm', 'Văn phòng Mai Hắc Đế', 'A01, A02, A03, A04', 'COD'),
('bk-sample-006', '33333333-3333-3333-3333-333333333333', 'trip-15', 'PENDING', 270000.00, 'VND', 'BKG-20261021-006', 'Nguyễn Văn Du Khách', '0912345678', 'customer@gmail.com', 'Bến xe Trung tâm Đà Nẵng', 'Bến xe Trung tâm Quy Nhơn', 'A01', 'COD')
ON DUPLICATE KEY UPDATE status=VALUES(status);

INSERT INTO tickets (id, booking_id, trip_id, seat_code, seat_price_amount, seat_price_currency, passenger_full_name, passenger_phone_number, qr_content, status, ticket_code, seat_number, price, qr_code_hash) VALUES
('tkt-sample-001', 'bk-sample-001', 'trip-1', 'A01', 290000.00, 'VND', 'Nguyễn Văn Du Khách', '0912345678', 'TRAVELEASY:TKT-A01:TRIP1:PASSENGER_NVDK', 'ISSUED', 'TK-20261025-001-A01', 'A01', 290000.00, 'c5e26b88-5c42-4f01-8b21-7e8c3a19e001'),
('tkt-sample-002', 'bk-sample-001', 'trip-1', 'A02', 290000.00, 'VND', 'Nguyễn Văn Du Khách', '0912345678', 'TRAVELEASY:TKT-A02:TRIP1:PASSENGER_NVDK', 'ISSUED', 'TK-20261025-001-A02', 'A02', 290000.00, 'f7a14c99-7b33-4d22-9e32-8f9d4b28f002'),
('tkt-sample-003', 'bk-sample-002', 'trip-5', 'A01', 180000.00, 'VND', 'Trần Thị Bích Ngọc', '0987654321', 'TRAVELEASY:TKT-A01:TRIP5:PASSENGER_TTBN', 'ISSUED', 'TK-20261021-002-A01', 'A01', 180000.00, 'qr-hm-20261021-002-a01'),
('tkt-sample-004', 'bk-sample-002', 'trip-5', 'A02', 180000.00, 'VND', 'Trần Thị Bích Ngọc', '0987654321', 'TRAVELEASY:TKT-A02:TRIP5:PASSENGER_TTBN', 'ISSUED', 'TK-20261021-002-A02', 'A02', 180000.00, 'qr-hm-20261021-002-a02'),
('tkt-sample-005', 'bk-sample-003', 'trip-8', 'A01', 220000.00, 'VND', 'Lê Hoàng Cường', '0978112233', 'TRAVELEASY:TKT-A01:TRIP8:PASSENGER_LHC', 'ISSUED', 'TK-20261021-003-A01', 'A01', 220000.00, 'qr-ft-20261021-003-a01'),
('tkt-sample-006', 'bk-sample-003', 'trip-8', 'A02', 220000.00, 'VND', 'Lê Hoàng Cường', '0978112233', 'TRAVELEASY:TKT-A02:TRIP8:PASSENGER_LHC', 'ISSUED', 'TK-20261021-003-A02', 'A02', 220000.00, 'qr-ft-20261021-003-a02'),
('tkt-sample-007', 'bk-sample-004', 'trip-11', 'A01', 250000.00, 'VND', 'Phạm Quốc Dũng', '0933445566', 'TRAVELEASY:TKT-A01:TRIP11:PASSENGER_PQD', 'USED', 'TK-20261021-004-A01', 'A01', 250000.00, 'qr-hl-20261021-004-a01'),
('tkt-sample-008', 'bk-sample-004', 'trip-11', 'A02', 250000.00, 'VND', 'Phạm Quốc Dũng', '0933445566', 'TRAVELEASY:TKT-A02:TRIP11:PASSENGER_PQD', 'USED', 'TK-20261021-004-A02', 'A02', 250000.00, 'qr-hl-20261021-004-a02'),
('tkt-sample-009', 'bk-sample-004', 'trip-11', 'A03', 250000.00, 'VND', 'Phạm Quốc Dũng', '0933445566', 'TRAVELEASY:TKT-A03:TRIP11:PASSENGER_PQD', 'USED', 'TK-20261021-004-A03', 'A03', 250000.00, 'qr-hl-20261021-004-a03'),
('tkt-sample-010', 'bk-sample-005', 'trip-12', 'A01', 310000.00, 'VND', 'Hoàng Thị Mai', '0944556677', 'TRAVELEASY:TKT-A01:TRIP12:PASSENGER_HTM', 'ISSUED', 'TK-20261021-005-A01', 'A01', 310000.00, 'qr-vm-20261021-005-a01'),
('tkt-sample-011', 'bk-sample-005', 'trip-12', 'A02', 310000.00, 'VND', 'Hoàng Thị Mai', '0944556677', 'TRAVELEASY:TKT-A02:TRIP12:PASSENGER_HTM', 'ISSUED', 'TK-20261021-005-A02', 'A02', 310000.00, 'qr-vm-20261021-005-a02'),
('tkt-sample-012', 'bk-sample-005', 'trip-12', 'A03', 310000.00, 'VND', 'Hoàng Thị Mai', '0944556677', 'TRAVELEASY:TKT-A03:TRIP12:PASSENGER_HTM', 'ISSUED', 'TK-20261021-005-A03', 'A03', 310000.00, 'qr-vm-20261021-005-a03'),
('tkt-sample-013', 'bk-sample-005', 'trip-12', 'A04', 310000.00, 'VND', 'Hoàng Thị Mai', '0944556677', 'TRAVELEASY:TKT-A04:TRIP12:PASSENGER_HTM', 'ISSUED', 'TK-20261021-005-A04', 'A04', 310000.00, 'qr-vm-20261021-005-a04'),
('tkt-sample-014', 'bk-sample-006', 'trip-15', 'A01', 270000.00, 'VND', 'Nguyễn Văn Du Khách', '0912345678', 'TRAVELEASY:TKT-A01:TRIP15:PASSENGER_NVDK', 'ISSUED', 'TK-20261021-006-A01', 'A01', 270000.00, 'qr-cn-20261021-006-a01')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 17. PAYMENT TRANSACTIONS
INSERT INTO payment_transactions (txn_ref, booking_id, txn_type, gateway_type, amount, currency, status) VALUES
('TXN-COD-20261025-001', 'bk-sample-001', 'INITIAL', 'MOMO', 580000.00, 'VND', 'SUCCESS')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 18. REVIEWS & REVIEW REPORTS
INSERT INTO reviews (id, ticket_id, rating, comment, status) VALUES
('rev-sample-001', 'tkt-sample-001', 5, 'Xe Phương Trang chạy rất êm, tài xế lịch sự, giường nằm sạch sẽ, đón đúng giờ tại Bến xe Miền Tây!', 'PUBLIC')
ON DUPLICATE KEY UPDATE rating=VALUES(rating);

-- 19. BANNERS (Quảng cáo trang chủ)
INSERT INTO banners (id, title, image_url, status, created_by) VALUES
('bnr-dalat', 'Khám Phá Đà Lạt Mộng Mơ Cùng Phương Trang Limousine - Giảm Ngay 10%', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80', 'PUBLISHED', '11111111-1111-1111-1111-111111111111'),
('bnr-sapa', 'Săn Mây Sa Pa - Trải Nghiệm Cabin Cung Điện Bay Sao Việt Sang Trọng', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80', 'PUBLISHED', '11111111-1111-1111-1111-111111111111')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 20. PAYMENT & NOTIFICATION GATEWAY CONFIGS
INSERT INTO payment_gateway_configs (id, gateway_type, merchant_id, encrypted_api_key, payment_url, status) VALUES
('pgw-vnpay', 'VNPAY', 'VNPAY_MERCHANT_TRAVELEASY', 'AES256_ENCRYPTED_KEY_VNPAY_2026', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', 'ACTIVE'),
('pgw-momo', 'MOMO', 'MOMO_PARTNER_TRAVELEASY', 'AES256_ENCRYPTED_KEY_MOMO_2026', 'https://test-payment.momo.vn/v2/gateway/api/create', 'ACTIVE'),
('pgw-zalopay', 'ZALOPAY', 'ZALOPAY_APPID_TRAVELEASY', 'AES256_ENCRYPTED_KEY_ZALOPAY_2026', 'https://sb-openapi.zalopay.vn/v2/create', 'ACTIVE')
ON DUPLICATE KEY UPDATE status=VALUES(status);

INSERT INTO notification_gateway_configs (id, channel, encrypted_credentials, status) VALUES
('ngw-sms', 'SMS', 'AES256_ESMS_API_KEY_SECRET', 'ACTIVE'),
('ngw-email', 'EMAIL', 'AES256_SENDGRID_SMTP_SECRET', 'ACTIVE')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 21. AUDIT LOGS (Bản ghi vết bất biến)
INSERT INTO audit_logs (id, actor_user_id, ip_address, action, entity_type, entity_id, detail_before, detail_after) VALUES
(1, '11111111-1111-1111-1111-111111111111', '127.0.0.1', 'SYSTEM_INITIALIZATION', 'SYSTEM', 'PRJ-TRAVELEASY-MVP-01', NULL, '{"event": "Master database initialized with 36 canonical tables and seed data"}'),
(2, '11111111-1111-1111-1111-111111111111', '127.0.0.1', 'APPROVE_BUS_COMPANY', 'BUS_COMPANY', 'bc-futa', '{"status": "PENDING_APPROVAL"}', '{"status": "ACTIVE", "reason": "Approved by Architect Pham Cong Thanh"}'),
(3, '22222222-2222-2222-2222-222222222222', '127.0.0.1', 'CREATE_TRIP', 'TRIP', 'trip-1', NULL, '{"route": "TP.HCM -> Da Lat", "seats": 34, "price": 290000, "departure": "08:00"}')
ON DUPLICATE KEY UPDATE action=VALUES(action);

SET FOREIGN_KEY_CHECKS = 1;
