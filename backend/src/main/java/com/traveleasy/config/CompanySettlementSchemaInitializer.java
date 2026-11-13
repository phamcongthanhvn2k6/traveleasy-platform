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
                "ALTER TABLE settlement_records ADD COLUMN IF NOT EXISTS code VARCHAR(50)"
            );
            jdbcTemplate.execute(
                "UPDATE settlement_records SET code = id WHERE code IS NULL"
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
            log.info("[SETTLEMENT SCHEMA] Verified settlement_records.previous_balance, payout_requests, and company_pos_shifts tables.");
        } catch (Exception e) {
            log.warn("[SETTLEMENT SCHEMA] Bỏ qua khởi tạo DDL (có thể đang chạy H2/test hoặc thiếu quyền): {}", e.getMessage());
        }
    }
}
