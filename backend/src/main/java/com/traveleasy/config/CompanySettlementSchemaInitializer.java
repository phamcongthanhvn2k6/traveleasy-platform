package com.traveleasy.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Đảm bảo cột previous_balance trên bảng settlement_records và bảng payout_requests
 * tồn tại an toàn khi chạy với hibernate.ddl-auto=none.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class CompanySettlementSchemaInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_role VARCHAR(30) DEFAULT 'OWNER'"
            );
            jdbcTemplate.execute(
                "ALTER TABLE settlement_records ADD COLUMN IF NOT EXISTS bus_company_id BIGINT"
            );
            jdbcTemplate.execute(
                "DO $$ BEGIN " +
                "IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settlement_records' AND column_name = 'company_id') THEN " +
                "UPDATE settlement_records SET bus_company_id = company_id WHERE bus_company_id IS NULL; " +
                "END IF; " +
                "END $$;"
            );
            jdbcTemplate.execute(
                "ALTER TABLE settlement_records ADD COLUMN IF NOT EXISTS start_date VARCHAR(20)"
            );
            jdbcTemplate.execute(
                "ALTER TABLE settlement_records ADD COLUMN IF NOT EXISTS end_date VARCHAR(20)"
            );
            jdbcTemplate.execute(
                "ALTER TABLE settlement_records ALTER COLUMN period_code DROP NOT NULL"
            );
            jdbcTemplate.execute(
                "ALTER TABLE settlement_records ADD COLUMN IF NOT EXISTS code VARCHAR(50)"
            );
            jdbcTemplate.execute(
                "UPDATE settlement_records SET code = CAST(id AS VARCHAR) WHERE code IS NULL"
            );
            jdbcTemplate.execute(
                "ALTER TABLE settlement_records ADD COLUMN IF NOT EXISTS previous_balance NUMERIC(15, 2) NOT NULL DEFAULT 0"
            );
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS payout_requests (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "request_code VARCHAR(50) NOT NULL UNIQUE, " +
                "company_id BIGINT NOT NULL REFERENCES bus_companies(id), " +
                "amount NUMERIC(15, 2) NOT NULL, " +
                "bank_name VARCHAR(150), " +
                "bank_account_number VARCHAR(100), " +
                "bank_account_owner VARCHAR(150), " +
                "status VARCHAR(30) NOT NULL DEFAULT 'PENDING', " +
                "note TEXT, " +
                "requested_by VARCHAR(150), " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "processed_at TIMESTAMP)"
            );
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS company_pos_shifts (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "bus_company_id BIGINT NOT NULL, " +
                "cashier_id BIGINT, " +
                "cashier_name VARCHAR(150), " +
                "shift_code VARCHAR(50), " +
                "initial_cash_amount NUMERIC(15, 2) NOT NULL DEFAULT 0, " +
                "total_cash_collected NUMERIC(15, 2) NOT NULL DEFAULT 0, " +
                "counted_cash_amount NUMERIC(15, 2), " +
                "cash_discrepancy NUMERIC(15, 2), " +
                "total_tickets_issued INT NOT NULL DEFAULT 0, " +
                "status VARCHAR(30) NOT NULL DEFAULT 'OPEN', " +
                "opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "closed_at TIMESTAMP, " +
                "note TEXT, " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
            );
            // [Sprint 3] Đảm bảo cấu trúc CSDL cho S307, S316, S317, S318 luôn sẵn sàng trên mọi môi trường
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS company_pricing_rules (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "bus_company_id BIGINT NOT NULL, " +
                "name VARCHAR(150) NOT NULL, " +
                "rule_type VARCHAR(30) NOT NULL, " +
                "scope VARCHAR(30) NOT NULL DEFAULT 'ALL_ROUTES', " +
                "route_id BIGINT, " +
                "adjustment_type VARCHAR(30) NOT NULL DEFAULT 'PERCENTAGE', " +
                "adjustment_value NUMERIC(12, 2) NOT NULL DEFAULT 0, " +
                "start_date DATE NOT NULL, " +
                "end_date DATE NOT NULL, " +
                "applicable_days VARCHAR(100) DEFAULT 'ALL', " +
                "is_last_minute BOOLEAN NOT NULL DEFAULT FALSE, " +
                "last_minute_hours INT DEFAULT 2, " +
                "min_empty_seat_percentage INT DEFAULT 50, " +
                "priority INT NOT NULL DEFAULT 0, " +
                "status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', " +
                "description TEXT, " +
                "created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP)"
            );
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS ticket_exchange_logs (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "bus_company_id BIGINT NOT NULL, " +
                "original_ticket_id BIGINT NOT NULL, " +
                "new_ticket_id BIGINT, " +
                "old_trip_id BIGINT NOT NULL, " +
                "new_trip_id BIGINT NOT NULL, " +
                "old_seat_code VARCHAR(20) NOT NULL, " +
                "new_seat_code VARCHAR(20) NOT NULL, " +
                "price_difference NUMERIC(12, 2) NOT NULL DEFAULT 0, " +
                "surcharge_paid NUMERIC(12, 2) NOT NULL DEFAULT 0, " +
                "refund_returned NUMERIC(12, 2) NOT NULL DEFAULT 0, " +
                "performed_by_user_id BIGINT, " +
                "reason TEXT, " +
                "created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP)"
            );
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS trip_expenses (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "trip_id BIGINT NOT NULL, " +
                "bus_company_id BIGINT NOT NULL, " +
                "fuel_cost NUMERIC(12, 2) NOT NULL DEFAULT 0, " +
                "toll_bot_cost NUMERIC(12, 2) NOT NULL DEFAULT 0, " +
                "driver_salary NUMERIC(12, 2) NOT NULL DEFAULT 0, " +
                "terminal_fee NUMERIC(12, 2) NOT NULL DEFAULT 0, " +
                "other_costs NUMERIC(12, 2) NOT NULL DEFAULT 0, " +
                "invoice_number VARCHAR(100), " +
                "is_locked BOOLEAN DEFAULT FALSE, " +
                "notes TEXT, " +
                "created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP)"
            );
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS shuttle_requests (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "bus_company_id BIGINT NOT NULL, " +
                "booking_id BIGINT, " +
                "passenger_name VARCHAR(100) NOT NULL, " +
                "passenger_phone VARCHAR(20) NOT NULL, " +
                "pickup_address VARCHAR(255) NOT NULL, " +
                "main_trip_id BIGINT NOT NULL, " +
                "shuttle_pickup_time TIMESTAMP WITHOUT TIME ZONE NOT NULL, " +
                "assigned_vehicle_plate VARCHAR(30), " +
                "shuttle_driver_name VARCHAR(100), " +
                "status VARCHAR(30) NOT NULL DEFAULT 'PENDING', " +
                "created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP)"
            );
            // Tự động liên kết bus_company_id cho các tài khoản đối tác mẫu để không bị 401/403 khi đăng nhập
            jdbcTemplate.execute(
                "UPDATE users SET bus_company_id = 1 WHERE (email = 'futa@gmail.com' OR email = 'operator1@futa.vn') AND bus_company_id IS NULL; " +
                "UPDATE users SET bus_company_id = 2 WHERE (email = 'thanhbuoi@gmail.com' OR email = 'dieuhanh@thanhbuoi.com.vn') AND bus_company_id IS NULL; " +
                "UPDATE users SET bus_company_id = 3 WHERE (email = 'saoviet@gmail.com' OR email = 'dieuhanh@xesaoviet.com.vn') AND bus_company_id IS NULL; " +
                "UPDATE users SET bus_company_id = 5 WHERE (email = 'hoamai@gmail.com' OR email = 'dieuhanh@hoamaivungtau.com.vn') AND bus_company_id IS NULL; " +
                "UPDATE users SET bus_company_id = 6 WHERE (email = 'dieuhanh@hoanglongasia.com') AND bus_company_id IS NULL; " +
                "UPDATE users SET bus_company_id = 7 WHERE (email = 'dieuhanh@vanminh74.vn') AND bus_company_id IS NULL; " +
                "UPDATE users SET bus_company_id = 9 WHERE (email = 'haivan@gmail.com' OR email = 'dieuhanh@haivan.com') AND bus_company_id IS NULL; " +
                "UPDATE users SET bus_company_id = 14 WHERE email = 'phamcongt56@gmail.com' AND bus_company_id IS NULL;"
            );
            log.info("[SETTLEMENT SCHEMA] Verified all Sprint 3 schema, payout_requests, POS shifts, and partner company associations.");
        } catch (Exception e) {
            log.warn("[SETTLEMENT SCHEMA] Bỏ qua khởi tạo DDL (có thể đang chạy H2/test hoặc thiếu quyền): {}", e.getMessage());
        }
    }
}
