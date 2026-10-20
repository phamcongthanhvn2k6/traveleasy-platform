-- ==============================================================================
-- DATABASE CREATION: TRAVELEASY PLATFORM (PRODUCTION-READY MVP)
-- HỆ THỐNG QUẢN LÝ NHÀ XE VÀ BÁN VÉ XE KHÁCH LIÊN TỈNH TRỰC TUYẾN
-- CHARSET: utf8mb4, COLLATION: utf8mb4_unicode_ci
-- ==============================================================================
CREATE DATABASE IF NOT EXISTS traveleasy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE traveleasy_db;

-- 1. BẢNG USERS (Quản lý người dùng, phân quyền RBAC)
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

-- 2. BẢNG BUS_COMPANIES (Đối tác nhà xe liên tỉnh)
CREATE TABLE IF NOT EXISTS bus_companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    hotline VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address VARCHAR(255),
    logo_url VARCHAR(500),
    average_rating DECIMAL(2, 1) DEFAULT 5.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. BẢNG ROUTES (Tuyến đường liên tỉnh cố định)
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

-- 4. BẢNG PICKUP_DROPOFF_POINTS (Điểm đón & Điểm trả khách cố định của tuyến)
CREATE TABLE IF NOT EXISTS pickup_dropoff_points (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    point_type ENUM('PICKUP', 'DROPOFF') NOT NULL,
    display_order INT DEFAULT 1,
    CONSTRAINT fk_points_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. BẢNG TRIPS (Chuyến xe mở bán theo lịch trình)
CREATE TABLE IF NOT EXISTS trips (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_id BIGINT NOT NULL,
    bus_company_id BIGINT NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    bus_type ENUM('SLEEPER', 'LIMOUSINE', 'SEAT') NOT NULL DEFAULT 'SLEEPER',
    license_plate VARCHAR(20),
    total_seats INT NOT NULL DEFAULT 34 CHECK (total_seats > 0),
    available_seats INT NOT NULL CHECK (available_seats >= 0),
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    description TEXT,
    status ENUM('SCHEDULED', 'DEPARTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_trips_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    CONSTRAINT fk_trips_company FOREIGN KEY (bus_company_id) REFERENCES bus_companies(id) ON DELETE CASCADE,
    INDEX idx_trips_departure_time (departure_time),
    INDEX idx_trips_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. BẢNG TRIP_SEATS (Sơ đồ kho ghế chi tiết của chuyến đi - Tránh Double-booking)
CREATE TABLE IF NOT EXISTS trip_seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_id BIGINT NOT NULL,
    seat_code VARCHAR(10) NOT NULL, -- Ví dụ: A01, A02, B01, B02
    floor INT NOT NULL DEFAULT 1 CHECK (floor IN (1, 2)),
    row_num INT NOT NULL DEFAULT 1,
    col_num INT NOT NULL DEFAULT 1,
    seat_type VARCHAR(50) DEFAULT 'STANDARD',
    status ENUM('AVAILABLE', 'BOOKED') NOT NULL DEFAULT 'AVAILABLE',
    CONSTRAINT fk_seats_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    UNIQUE KEY uq_trip_seat (trip_id, seat_code),
    INDEX idx_seats_availability (trip_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. BẢNG BOOKINGS (Đơn đặt vé xe của hành khách)
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    trip_id BIGINT NOT NULL,
    booking_code VARCHAR(50) NOT NULL UNIQUE,
    passenger_name VARCHAR(100) NOT NULL,
    passenger_phone VARCHAR(20) NOT NULL,
    passenger_email VARCHAR(100),
    pickup_point VARCHAR(150),
    dropoff_point VARCHAR(150),
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

-- 8. BẢNG TICKETS (Chi tiết vé điện tử từng vị trí ghế ngồi)
CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    seat_number VARCHAR(10) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    qr_code_hash VARCHAR(255),
    status ENUM('ISSUED', 'USED', 'CANCELLED') NOT NULL DEFAULT 'ISSUED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tickets_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================================================
-- DỮ LIỆU KHỞI TẠO MẪU (SEED DATA SẴN SÀNG CHẤM THI)
-- Mật khẩu mặc định: Rikkei@123
-- ==============================================================================
INSERT INTO users (email, password, full_name, phone, role) VALUES 
('admin@traveleasy.vn', '$2a$12$e0M2OQeJ0A3Qv7M0eP9Iau6mK8QxIe8yL4O2e3T1A0P2e3T1A0P2e', 'Quản Trị Viên TravelEasy', '0988888888', 'ADMIN'),
('operator@phuongtrang.vn', '$2a$12$e0M2OQeJ0A3Qv7M0eP9Iau6mK8QxIe8yL4O2e3T1A0P2e3T1A0P2e', 'Điều Hành Phương Trang', '0901234567', 'OPERATOR'),
('customer@gmail.com', '$2a$12$e0M2OQeJ0A3Qv7M0eP9Iau6mK8QxIe8yL4O2e3T1A0P2e3T1A0P2e', 'Trần Thị Hành Khách', '0912345678', 'CUSTOMER');

INSERT INTO bus_companies (name, hotline, email, address, logo_url, average_rating) VALUES 
('Phương Trang (FUTA Bus Lines)', '19006067', 'hotro@futabus.vn', 'Bến xe Miền Tây, TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150', 4.9),
('Thành Bưởi', '19006079', 'info@thanhbuoi.com.vn', 'Lê Hồng Phong, Quận 5, TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=150', 4.8),
('Sao Việt', '19006746', 'saoviet@xekhach.vn', '789 Giải Phóng, Giáp Bát, Hà Nội', 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=150', 4.7);

INSERT INTO routes (bus_company_id, departure_location, arrival_location, duration_hours, distance_km) VALUES 
(1, 'Hồ Chí Minh', 'Đà Lạt', 6.5, 305.0),
(2, 'Hồ Chí Minh', 'Cần Thơ', 3.5, 169.0),
(3, 'Hà Nội', 'Sa Pa', 5.5, 315.0),
(1, 'Hồ Chí Minh', 'Nha Trang', 8.5, 435.0);

-- Điểm đón trả tuyến Sài Gòn - Đà Lạt
INSERT INTO pickup_dropoff_points (route_id, name, address, point_type, display_order) VALUES
(1, 'Bến xe Miền Tây', '395 Kinh Dương Vương, An Lạc, Bình Tân, TP.HCM', 'PICKUP', 1),
(1, 'Văn phòng Hàng Xanh', '486H Điện Biên Phủ, Phường 21, Bình Thạnh, TP.HCM', 'PICKUP', 2),
(1, 'Bến xe Liên tỉnh Đà Lạt', 'Số 1 Tô Hiến Thành, Phường 3, TP. Đà Lạt', 'DROPOFF', 1),
(1, 'Văn phòng Trung tâm Đà Lạt', '04-06 Trần Hưng Đạo, Phường 10, TP. Đà Lạt', 'DROPOFF', 2);

-- Điểm đón trả tuyến Hà Nội - Sa Pa
INSERT INTO pickup_dropoff_points (route_id, name, address, point_type, display_order) VALUES
(3, 'Bến xe Mỹ Đình', 'Số 20 Phạm Hùng, Mỹ Đình, Nam Từ Liêm, Hà Nội', 'PICKUP', 1),
(3, 'Văn phòng Phố Cổ', '114 Trần Nhật Duật, Hoàn Kiếm, Hà Nội', 'PICKUP', 2),
(3, 'Bến xe Sa Pa', 'Đường Điện Biên Phủ, Thị xã Sa Pa, Lào Cai', 'DROPOFF', 1);

-- Chuyến xe mở bán
INSERT INTO trips (id, route_id, bus_company_id, departure_time, arrival_time, bus_type, license_plate, total_seats, available_seats, price, description, status, is_active) VALUES 
(1, 1, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL '1 6:30' DAY_MINUTE), 'LIMOUSINE', '51B-888.88', 34, 32, 290000, 'Xe Limousine 34 phòng VIP có rèm che riêng tư, cổng sạc Type-C, nước suối và khăn lạnh miễn phí.', 'SCHEDULED', 1),
(2, 1, 2, DATE_ADD(NOW(), INTERVAL '1 2' DAY_HOUR), DATE_ADD(NOW(), INTERVAL '1 8:30' DAY_MINUTE), 'SLEEPER', '51B-999.99', 40, 40, 250000, 'Xe giường nằm 40 chỗ êm ái, điều hòa mát lạnh, wifi tốc độ cao suốt hành trình.', 'SCHEDULED', 1),
(3, 2, 2, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL '1 3:30' DAY_MINUTE), 'LIMOUSINE', '65B-123.45', 28, 28, 180000, 'Xe Limousine VIP Sài Gòn về thủ phủ miền Tây Cần Thơ, ghế massage thư giãn.', 'SCHEDULED', 1),
(4, 3, 3, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL '1 5:30' DAY_MINUTE), 'LIMOUSINE', '29B-567.89', 32, 32, 350000, 'Xe Cabin đôi cung điện bay Hà Nội đi thị trấn sương mù Sa Pa.', 'SCHEDULED', 1);

-- Khởi tạo sơ đồ ghế cho Chuyến 1 (34 phòng Limousine: Tầng 1 A01-A17, Tầng 2 B01-B17)
INSERT INTO trip_seats (trip_id, seat_code, floor, row_num, col_num, status) VALUES 
(1, 'A01', 1, 1, 1, 'BOOKED'), -- Đã bán mẫu
(1, 'A02', 1, 1, 2, 'BOOKED'), -- Đã bán mẫu
(1, 'A03', 1, 2, 1, 'AVAILABLE'),
(1, 'A04', 1, 2, 2, 'AVAILABLE'),
(1, 'A05', 1, 3, 1, 'AVAILABLE'),
(1, 'A06', 1, 3, 2, 'AVAILABLE'),
(1, 'A07', 1, 4, 1, 'AVAILABLE'),
(1, 'A08', 1, 4, 2, 'AVAILABLE'),
(1, 'A09', 1, 5, 1, 'AVAILABLE'),
(1, 'A10', 1, 5, 2, 'AVAILABLE'),
(1, 'A11', 1, 6, 1, 'AVAILABLE'),
(1, 'A12', 1, 6, 2, 'AVAILABLE'),
(1, 'A13', 1, 7, 1, 'AVAILABLE'),
(1, 'A14', 1, 7, 2, 'AVAILABLE'),
(1, 'A15', 1, 8, 1, 'AVAILABLE'),
(1, 'A16', 1, 8, 2, 'AVAILABLE'),
(1, 'A17', 1, 9, 1, 'AVAILABLE'),
(1, 'B01', 2, 1, 1, 'AVAILABLE'),
(1, 'B02', 2, 1, 2, 'AVAILABLE'),
(1, 'B03', 2, 2, 1, 'AVAILABLE'),
(1, 'B04', 2, 2, 2, 'AVAILABLE'),
(1, 'B05', 2, 3, 1, 'AVAILABLE'),
(1, 'B06', 2, 3, 2, 'AVAILABLE'),
(1, 'B07', 2, 4, 1, 'AVAILABLE'),
(1, 'B08', 2, 4, 2, 'AVAILABLE'),
(1, 'B09', 2, 5, 1, 'AVAILABLE'),
(1, 'B10', 2, 5, 2, 'AVAILABLE'),
(1, 'B11', 2, 6, 1, 'AVAILABLE'),
(1, 'B12', 2, 6, 2, 'AVAILABLE'),
(1, 'B13', 2, 7, 1, 'AVAILABLE'),
(1, 'B14', 2, 7, 2, 'AVAILABLE'),
(1, 'B15', 2, 8, 1, 'AVAILABLE'),
(1, 'B16', 2, 8, 2, 'AVAILABLE'),
(1, 'B17', 2, 9, 1, 'AVAILABLE');

-- Đơn đặt vé mẫu sẵn có
INSERT INTO bookings (id, user_id, trip_id, booking_code, passenger_name, passenger_phone, passenger_email, pickup_point, dropoff_point, seat_numbers, total_amount, payment_method, status) VALUES 
(1, 3, 1, 'BKG-20261025-001', 'Trần Thị Hành Khách', '0912345678', 'customer@gmail.com', 'Bến xe Miền Tây', 'Bến xe Liên tỉnh Đà Lạt', 'A01, A02', 580000, 'COD', 'CONFIRMED');

INSERT INTO tickets (booking_id, ticket_code, seat_number, price, qr_code_hash, status) VALUES 
(1, 'TKT-20261025-A01', 'A01', 290000, 'QR_HASH_A01_TRIP1', 'ISSUED'),
(1, 'TKT-20261025-A02', 'A02', 290000, 'QR_HASH_A02_TRIP1', 'ISSUED');
