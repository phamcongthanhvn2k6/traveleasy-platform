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

CREATE DATABASE IF NOT EXISTS vexere_clone
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE vexere_clone;

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
  CONSTRAINT ck_vehicles_type CHECK (vehicle_type IN ('SEATED','SLEEPER','LIMOUSINE')),
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
  unit_type      ENUM('PROVINCE','CENTRALLY_RUN_CITY') NOT NULL,
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
    CHECK (official_code REGEXP '^[0-9]{5}$'),
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