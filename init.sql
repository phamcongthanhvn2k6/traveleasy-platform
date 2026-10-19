-- ==============================================================================
-- DATABASE CREATION: TRAVELEASY PLATFORM (MVP)
-- CHARSET: utf8mb4, COLLATION: utf8mb4_unicode_ci
-- ==============================================================================
CREATE DATABASE IF NOT EXISTS traveleasy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE traveleasy_db;

-- 1. BẢNG USERS
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('CUSTOMER', 'OPERATOR', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. BẢNG BUS_COMPANIES
CREATE TABLE IF NOT EXISTS bus_companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    hotline VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. BẢNG ROUTES
CREATE TABLE IF NOT EXISTS routes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bus_company_id BIGINT NOT NULL,
    departure_location VARCHAR(100) NOT NULL,
    arrival_location VARCHAR(100) NOT NULL,
    duration_hours DECIMAL(4, 1) NOT NULL,
    distance_km DECIMAL(6, 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_routes_company FOREIGN KEY (bus_company_id) REFERENCES bus_companies(id) ON DELETE CASCADE,
    INDEX idx_routes_locations (departure_location, arrival_location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. BẢNG TRIPS
CREATE TABLE IF NOT EXISTS trips (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_id BIGINT NOT NULL,
    bus_company_id BIGINT NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    bus_type ENUM('SLEEPER', 'LIMOUSINE', 'SEAT') NOT NULL DEFAULT 'SLEEPER',
    total_seats INT NOT NULL DEFAULT 40 CHECK (total_seats > 0),
    available_seats INT NOT NULL CHECK (available_seats >= 0),
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_trips_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    CONSTRAINT fk_trips_company FOREIGN KEY (bus_company_id) REFERENCES bus_companies(id) ON DELETE CASCADE,
    INDEX idx_trips_departure_time (departure_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. BẢNG BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    trip_id BIGINT NOT NULL,
    booking_code VARCHAR(50) NOT NULL UNIQUE,
    passenger_name VARCHAR(100) NOT NULL,
    passenger_phone VARCHAR(20) NOT NULL,
    passenger_email VARCHAR(100),
    seat_numbers VARCHAR(100) NOT NULL, -- Ví dụ: "A01, A02"
    total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method ENUM('COD') NOT NULL DEFAULT 'COD',
    status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE RESTRICT,
    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. BẢNG TICKETS
CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    seat_number VARCHAR(10) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    status ENUM('ISSUED', 'USED', 'CANCELLED') NOT NULL DEFAULT 'ISSUED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tickets_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================================================
-- SEED DATA THỰC TẾ
-- Mật khẩu mặc định: Rikkei@123 (BCrypt hash)
-- ==============================================================================
INSERT INTO users (email, password, full_name, phone, role) VALUES 
('admin@traveleasy.vn', '$2a$12$e0M2OQeJ0A3Qv7M0eP9Iau6mK8QxIe8yL4O2e3T1A0P2e3T1A0P2e', 'Quản Trị Viên TravelEasy', '0988888888', 'ADMIN'),
('operator@phuongtrang.vn', '$2a$12$e0M2OQeJ0A3Qv7M0eP9Iau6mK8QxIe8yL4O2e3T1A0P2e3T1A0P2e', 'Điều Hành Phương Trang', '0901234567', 'OPERATOR'),
('customer@gmail.com', '$2a$12$e0M2OQeJ0A3Qv7M0eP9Iau6mK8QxIe8yL4O2e3T1A0P2e3T1A0P2e', 'Trần Thị Hành Khách', '0912345678', 'CUSTOMER');

INSERT INTO bus_companies (name, hotline, email, address) VALUES 
('Phương Trang (FUTA Bus Lines)', '19006067', 'hotro@futabus.vn', 'Bến xe Miền Tây, TP. Hồ Chí Minh'),
('Thành Bưởi', '19006079', 'info@thanhbuoi.com.vn', 'Lê Hồng Phong, Quận 5, TP. Hồ Chí Minh'),
('Sao Việt', '19006746', 'saoviet@xekhach.vn', '789 Giải Phóng, Giáp Bát, Hà Nội');

INSERT INTO routes (bus_company_id, departure_location, arrival_location, duration_hours, distance_km) VALUES 
(1, 'Hồ Chí Minh', 'Đà Lạt', 6.5, 305.0),
(2, 'Hồ Chí Minh', 'Cần Thơ', 3.5, 169.0),
(3, 'Hà Nội', 'Sa Pa', 5.5, 315.0),
(1, 'Hồ Chí Minh', 'Nha Trang', 8.5, 435.0);

INSERT INTO trips (route_id, bus_company_id, departure_time, arrival_time, bus_type, total_seats, available_seats, price, description, is_active) VALUES 
(1, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL '1 6:30' DAY_MINUTE), 'LIMOUSINE', 34, 30, 290000, 'Xe Limousine 34 phòng VIP có rèm che riêng tư, cổng sạc Type-C, nước suối và khăn lạnh miễn phí.', 1),
(1, 2, DATE_ADD(NOW(), INTERVAL '1 2' DAY_HOUR), DATE_ADD(NOW(), INTERVAL '1 8:30' DAY_MINUTE), 'SLEEPER', 40, 36, 250000, 'Xe giường nằm 40 chỗ êm ái, điều hòa mát lạnh, wifi tốc độ cao suốt hành trình.', 1),
(2, 2, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL '1 3:30' DAY_MINUTE), 'LIMOUSINE', 28, 25, 180000, 'Xe Limousine VIP Sài Gòn về thủ phủ miền Tây Cần Thơ, ghế massage thư giãn.', 1),
(3, 3, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL '1 5:30' DAY_MINUTE), 'LIMOUSINE', 32, 28, 350000, 'Xe Cabin đôi cung điện bay Hà Nội đi thị trấn sương mù Sa Pa.', 1);
