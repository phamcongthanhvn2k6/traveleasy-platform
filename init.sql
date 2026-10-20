-- ==============================================================================
-- DATABASE CREATION: TRAVELEASY PLATFORM (PRODUCTION-READY MVP)
-- NỀN TẢNG QUẢN LÝ NHÀ XE & ĐẶT VÉ XE KHÁCH LIÊN TỈNH TRỰC TUYẾN
-- NGUỒN ĐẶC TẢ: docs/SRS_Vexere.md + docs/database_design.md + docs/domain.md
-- MÃ DỰ ÁN: PRJ-TRAVELEASY-MVP-01 | NHÓM 7 (SPRINT 7 NGÀY - RIKKEI PRE-OJT)
-- QUẢN TRỊ VIÊN & ARCHITECT: PHẠM CÔNG THÀNH
-- CHARSET: utf8mb4, COLLATION: utf8mb4_unicode_ci
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS traveleasy_db 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE traveleasy_db;

-- ==============================================================================
-- 1. BẢNG USERS (Quản lý tài khoản, danh tính & phân quyền RBAC 3 cấp)
-- ==============================================================================
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS trip_seats;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS pickup_dropoff_points;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS bus_companies;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('CUSTOMER', 'OPERATOR', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 2. BẢNG BUS_COMPANIES (Hãng xe & Nhà xe đối tác vận tải)
-- ==============================================================================
CREATE TABLE bus_companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    hotline VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address VARCHAR(255),
    logo_url VARCHAR(500),
    average_rating DECIMAL(2, 1) DEFAULT 5.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_companies_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 3. BẢNG ROUTES (Tuyến đường liên tỉnh cố định giữa các Tỉnh/Thành phố)
-- ==============================================================================
CREATE TABLE routes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bus_company_id BIGINT NOT NULL,
    departure_location VARCHAR(100) NOT NULL,
    arrival_location VARCHAR(100) NOT NULL,
    duration_hours DECIMAL(4, 1) NOT NULL,
    distance_km DECIMAL(6, 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_routes_company FOREIGN KEY (bus_company_id) REFERENCES bus_companies(id) ON DELETE CASCADE,
    INDEX idx_routes_locations (departure_location, arrival_location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 4. BẢNG PICKUP_DROPOFF_POINTS (Điểm đón & Điểm trả khách chi tiết của tuyến)
-- ==============================================================================
CREATE TABLE pickup_dropoff_points (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    point_type ENUM('PICKUP', 'DROPOFF') NOT NULL,
    display_order INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_points_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_points_route (route_id, point_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 5. BẢNG TRIPS (Lịch trình chuyến xe mở bán theo thời gian thực)
-- ==============================================================================
CREATE TABLE trips (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_trips_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    CONSTRAINT fk_trips_company FOREIGN KEY (bus_company_id) REFERENCES bus_companies(id) ON DELETE CASCADE,
    INDEX idx_trips_search (route_id, departure_time, status),
    INDEX idx_trips_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 6. BẢNG TRIP_SEATS (Sơ đồ kho ghế 2 tầng & Khóa nguyên tử chống Race-Condition)
-- ==============================================================================
CREATE TABLE trip_seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_id BIGINT NOT NULL,
    seat_code VARCHAR(10) NOT NULL, -- Tầng 1: A01-A17, Tầng 2: B01-B17
    floor INT NOT NULL DEFAULT 1 CHECK (floor IN (1, 2)),
    row_num INT NOT NULL DEFAULT 1,
    col_num INT NOT NULL DEFAULT 1,
    seat_type VARCHAR(50) DEFAULT 'STANDARD',
    status ENUM('AVAILABLE', 'BOOKED') NOT NULL DEFAULT 'AVAILABLE',
    CONSTRAINT fk_seats_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    UNIQUE KEY uq_trip_seat (trip_id, seat_code),
    INDEX idx_seats_status (trip_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 7. BẢNG BOOKINGS (Đơn đặt vé xe của hành khách - Hỗ trợ COD & Khách vãng lai)
-- ==============================================================================
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL, -- Nullable cho phép khách vãng lai đặt vé không bắt buộc đăng nhập
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
    status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_bookings_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE RESTRICT,
    INDEX idx_bookings_code (booking_code),
    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 8. BẢNG TICKETS (Chi tiết vé điện tử từng vị trí ghế & Mã QR check-in)
-- ==============================================================================
CREATE TABLE tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    seat_number VARCHAR(10) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    qr_code_hash VARCHAR(255) NOT NULL,
    status ENUM('ISSUED', 'USED', 'CANCELLED') NOT NULL DEFAULT 'ISSUED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tickets_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_tickets_code (ticket_code),
    INDEX idx_tickets_qr (qr_code_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- DỮ LIỆU KHỞI TẠO MẪU TOÀN DIỆN (COMPREHENSIVE SEED DATA)
-- Mật khẩu mặc định: Rikkei@123 (Mã hóa chuẩn BCrypt 12 rounds)
-- Hash: $2a$12$Pmk4aET/6hYWnob519wJPuCTPdsmPBmolH4Bl85ABX/a6Tz3kFpti
-- ==============================================================================

-- 1. Seed Users (Admin, Nhà xe Operator, Khách hàng Customer)
INSERT INTO users (id, email, password, full_name, phone, role) VALUES 
(1, 'admin@traveleasy.vn', '$2a$12$Pmk4aET/6hYWnob519wJPuCTPdsmPBmolH4Bl85ABX/a6Tz3kFpti', 'Phạm Công Thành (Quản Trị Viên)', '0901234567', 'ADMIN'),
(2, 'operator@futa.vn', '$2a$12$Pmk4aET/6hYWnob519wJPuCTPdsmPBmolH4Bl85ABX/a6Tz3kFpti', 'Điều Hành Xe Phương Trang (FUTA)', '0909888999', 'OPERATOR'),
(3, 'customer@gmail.com', '$2a$12$Pmk4aET/6hYWnob519wJPuCTPdsmPBmolH4Bl85ABX/a6Tz3kFpti', 'Nguyễn Văn Du Khách', '0912345678', 'CUSTOMER');

-- 2. Seed Bus Companies (Hãng xe đối tác uy tín hàng đầu Việt Nam)
INSERT INTO bus_companies (id, name, hotline, email, address, logo_url, average_rating) VALUES 
(1, 'Phương Trang (FUTA Bus Lines)', '1900 6067', 'hotro@futa.vn', 'Bến xe Miền Tây, 395 Kinh Dương Vương, An Lạc, Bình Tân, TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&auto=format&fit=crop&q=80', 4.9),
(2, 'Thành Bưởi', '1900 6079', 'info@thanhbuoi.com.vn', '266 Lê Hồng Phong, Phường 4, Quận 5, TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=150&auto=format&fit=crop&q=80', 4.8),
(3, 'Sao Việt', '1900 6746', 'contact@xesaoviet.com.vn', '779 Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội', 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=150&auto=format&fit=crop&q=80', 4.7),
(4, 'Kumho Samco Buslines', '1900 6065', 'cskh@kumhosamco.com.vn', '292 Đinh Bộ Lĩnh, Phường 26, Bình Thạnh, TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=150&auto=format&fit=crop&q=80', 4.8);

-- 3. Seed Routes (Các trục hành lang giao thông liên tỉnh trọng điểm)
INSERT INTO routes (id, bus_company_id, departure_location, arrival_location, duration_hours, distance_km) VALUES 
(1, 1, 'TP. Hồ Chí Minh', 'Đà Lạt', 6.5, 305.0),
(2, 1, 'TP. Hồ Chí Minh', 'Nha Trang', 8.0, 435.0),
(3, 2, 'TP. Hồ Chí Minh', 'Cần Thơ', 3.5, 169.0),
(4, 3, 'Hà Nội', 'Sa Pa', 5.5, 315.0);

-- 4. Seed Pickup & Dropoff Points (Điểm đón trả cố định theo từng tuyến)
INSERT INTO pickup_dropoff_points (route_id, name, address, point_type, display_order) VALUES
-- Tuyến 1: Sài Gòn -> Đà Lạt
(1, 'Bến xe Miền Tây', '395 Kinh Dương Vương, An Lạc, Bình Tân, TP.HCM', 'PICKUP', 1),
(1, 'Trạm An Sương', 'QL22, Bà Điểm, Hóc Môn, TP.HCM', 'PICKUP', 2),
(1, 'Văn phòng Hàng Xanh', '486H Điện Biên Phủ, Phường 21, Bình Thạnh, TP.HCM', 'PICKUP', 3),
(1, 'Bến xe Liên tỉnh Đà Lạt', 'Số 01 Tô Hiến Thành, Phường 3, TP. Đà Lạt', 'DROPOFF', 1),
(1, 'Văn phòng Trung tâm Đà Lạt (Hồ Xuân Hương)', '04-06 Trần Hưng Đạo, Phường 10, TP. Đà Lạt', 'DROPOFF', 2),

-- Tuyến 2: Sài Gòn -> Nha Trang
(2, 'Bến xe Miền Đông Mới', 'Đường Hoàng Hữu Nam, Long Bình, TP. Thủ Đức, TP.HCM', 'PICKUP', 1),
(2, 'Ngã tư Thủ Đức', 'Xa Lộ Hà Nội, TP. Thủ Đức, TP.HCM', 'PICKUP', 2),
(2, 'Bến xe Phía Nam Nha Trang', 'Km 6 Đường 23/10, TP. Nha Trang, Khánh Hòa', 'DROPOFF', 1),
(2, 'Văn phòng Nha Trang', '14 Pasteur, Phường Xương Huân, TP. Nha Trang', 'DROPOFF', 2),

-- Tuyến 3: Sài Gòn -> Cần Thơ
(3, 'Bến xe Miền Tây', '395 Kinh Dương Vương, Bình Tân, TP.HCM', 'PICKUP', 1),
(3, 'Bến xe Trung tâm Cần Thơ', 'Đường dẫn Cầu Cần Thơ, Hưng Thành, Cái Răng, Cần Thơ', 'DROPOFF', 1),
(3, 'Bến Ninh Kiều', 'Đường Hai Bà Trưng, Tân An, Ninh Kiều, Cần Thơ', 'DROPOFF', 2),

-- Tuyến 4: Hà Nội -> Sa Pa
(4, 'Bến xe Mỹ Đình', 'Số 20 Phạm Hùng, Mỹ Đình, Nam Từ Liêm, Hà Nội', 'PICKUP', 1),
(4, 'Văn phòng Phố Cổ Hà Nội', '114 Trần Nhật Duật, Hoàn Kiếm, Hà Nội', 'PICKUP', 2),
(4, 'Sân bay Quốc tế Nội Bài', 'Nhà ga T1, Sóc Sơn, Hà Nội', 'PICKUP', 3),
(4, 'Bến xe Khách Sa Pa', 'Đường Điện Biên Phủ, Thị xã Sa Pa, Lào Cai', 'DROPOFF', 1),
(4, 'Nhà thờ Đá Sa Pa', 'Thị trấn Sa Pa, Lào Cai', 'DROPOFF', 2);

-- 5. Seed Trips (Lịch trình mở bán thực tế cho ngày mai và ngày kế tiếp)
INSERT INTO trips (id, route_id, bus_company_id, departure_time, arrival_time, bus_type, license_plate, total_seats, available_seats, price, description, status) VALUES 
(1, 1, 1, DATE_ADD(CURRENT_DATE(), INTERVAL '1 08:00:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '1 14:30:00' DAY_SECOND), 'SLEEPER', '51B-123.45', 34, 32, 290000.00, 'Xe giường nằm 34 chỗ cao cấp FUTA, trang bị điều hòa kháng khuẩn, wifi 5G tốc độ cao, nước khoáng Lavie và khăn lạnh miễn phí suốt hành trình.', 'SCHEDULED'),
(2, 1, 1, DATE_ADD(CURRENT_DATE(), INTERVAL '1 22:30:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '2 05:00:00' DAY_SECOND), 'LIMOUSINE', '51B-999.88', 34, 34, 340000.00, 'Xe Limousine VIP 34 phòng đơn riêng tư, sạc điện thoại Type-C đa năng, rèm che kín đáo, tivi màn hình cảm ứng giải trí từng cabin.', 'SCHEDULED'),
(3, 2, 1, DATE_ADD(CURRENT_DATE(), INTERVAL '1 07:00:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '1 15:00:00' DAY_SECOND), 'SLEEPER', '51B-456.78', 34, 34, 320000.00, 'Tuyến Sài Gòn đi phố biển Nha Trang qua cao tốc Phan Thiết - Vĩnh Hảo êm ái, hỗ trợ đón khách chu đáo tận nơi.', 'SCHEDULED'),
(4, 4, 3, DATE_ADD(CURRENT_DATE(), INTERVAL '1 06:30:00' DAY_SECOND), DATE_ADD(CURRENT_DATE(), INTERVAL '1 12:00:00' DAY_SECOND), 'LIMOUSINE', '29B-888.66', 34, 34, 380000.00, 'Xe Cabin Cung Điện Bay Hà Nội - Sa Pa qua cao tốc Nội Bài - Lào Cai, trang bị đệm massage toàn thân thư giãn.', 'SCHEDULED');

-- 6. Seed Trip Seats (Sinh đầy đủ 34 ghế cho cả 4 chuyến xe = 136 ghế ngồi)
-- Chuyến 1: 34 ghế (Đã có sẵn 2 ghế bán mẫu A01, A02 để demo trạng thái màu xám trên giao diện)
INSERT INTO trip_seats (trip_id, seat_code, floor, row_num, col_num, seat_type, status) VALUES
(1, 'A01', 1, 1, 1, 'STANDARD', 'BOOKED'),
(1, 'A02', 1, 1, 2, 'STANDARD', 'BOOKED'),
(1, 'A03', 1, 2, 1, 'STANDARD', 'AVAILABLE'),
(1, 'A04', 1, 2, 2, 'STANDARD', 'AVAILABLE'),
(1, 'A05', 1, 3, 1, 'STANDARD', 'AVAILABLE'),
(1, 'A06', 1, 3, 2, 'STANDARD', 'AVAILABLE'),
(1, 'A07', 1, 4, 1, 'STANDARD', 'AVAILABLE'),
(1, 'A08', 1, 4, 2, 'STANDARD', 'AVAILABLE'),
(1, 'A09', 1, 5, 1, 'STANDARD', 'AVAILABLE'),
(1, 'A10', 1, 5, 2, 'STANDARD', 'AVAILABLE'),
(1, 'A11', 1, 6, 1, 'STANDARD', 'AVAILABLE'),
(1, 'A12', 1, 6, 2, 'STANDARD', 'AVAILABLE'),
(1, 'A13', 1, 7, 1, 'STANDARD', 'AVAILABLE'),
(1, 'A14', 1, 7, 2, 'STANDARD', 'AVAILABLE'),
(1, 'A15', 1, 8, 1, 'STANDARD', 'AVAILABLE'),
(1, 'A16', 1, 8, 2, 'STANDARD', 'AVAILABLE'),
(1, 'A17', 1, 9, 1, 'STANDARD', 'AVAILABLE'),
(1, 'B01', 2, 1, 1, 'VIP', 'AVAILABLE'),
(1, 'B02', 2, 1, 2, 'VIP', 'AVAILABLE'),
(1, 'B03', 2, 2, 1, 'VIP', 'AVAILABLE'),
(1, 'B04', 2, 2, 2, 'VIP', 'AVAILABLE'),
(1, 'B05', 2, 3, 1, 'VIP', 'AVAILABLE'),
(1, 'B06', 2, 3, 2, 'VIP', 'AVAILABLE'),
(1, 'B07', 2, 4, 1, 'VIP', 'AVAILABLE'),
(1, 'B08', 2, 4, 2, 'VIP', 'AVAILABLE'),
(1, 'B09', 2, 5, 1, 'VIP', 'AVAILABLE'),
(1, 'B10', 2, 5, 2, 'VIP', 'AVAILABLE'),
(1, 'B11', 2, 6, 1, 'VIP', 'AVAILABLE'),
(1, 'B12', 2, 6, 2, 'VIP', 'AVAILABLE'),
(1, 'B13', 2, 7, 1, 'VIP', 'AVAILABLE'),
(1, 'B14', 2, 7, 2, 'VIP', 'AVAILABLE'),
(1, 'B15', 2, 8, 1, 'VIP', 'AVAILABLE'),
(1, 'B16', 2, 8, 2, 'VIP', 'AVAILABLE'),
(1, 'B17', 2, 9, 1, 'VIP', 'AVAILABLE');

-- Chuyến 2: 34 ghế (Tất cả sẵn sàng mở bán)
INSERT INTO trip_seats (trip_id, seat_code, floor, row_num, col_num, seat_type, status) VALUES
(2, 'A01', 1, 1, 1, 'STANDARD', 'AVAILABLE'), (2, 'A02', 1, 1, 2, 'STANDARD', 'AVAILABLE'),
(2, 'A03', 1, 2, 1, 'STANDARD', 'AVAILABLE'), (2, 'A04', 1, 2, 2, 'STANDARD', 'AVAILABLE'),
(2, 'A05', 1, 3, 1, 'STANDARD', 'AVAILABLE'), (2, 'A06', 1, 3, 2, 'STANDARD', 'AVAILABLE'),
(2, 'A07', 1, 4, 1, 'STANDARD', 'AVAILABLE'), (2, 'A08', 1, 4, 2, 'STANDARD', 'AVAILABLE'),
(2, 'A09', 1, 5, 1, 'STANDARD', 'AVAILABLE'), (2, 'A10', 1, 5, 2, 'STANDARD', 'AVAILABLE'),
(2, 'A11', 1, 6, 1, 'STANDARD', 'AVAILABLE'), (2, 'A12', 1, 6, 2, 'STANDARD', 'AVAILABLE'),
(2, 'A13', 1, 7, 1, 'STANDARD', 'AVAILABLE'), (2, 'A14', 1, 7, 2, 'STANDARD', 'AVAILABLE'),
(2, 'A15', 1, 8, 1, 'STANDARD', 'AVAILABLE'), (2, 'A16', 1, 8, 2, 'STANDARD', 'AVAILABLE'),
(2, 'A17', 1, 9, 1, 'STANDARD', 'AVAILABLE'),
(2, 'B01', 2, 1, 1, 'VIP', 'AVAILABLE'), (2, 'B02', 2, 1, 2, 'VIP', 'AVAILABLE'),
(2, 'B03', 2, 2, 1, 'VIP', 'AVAILABLE'), (2, 'B04', 2, 2, 2, 'VIP', 'AVAILABLE'),
(2, 'B05', 2, 3, 1, 'VIP', 'AVAILABLE'), (2, 'B06', 2, 3, 2, 'VIP', 'AVAILABLE'),
(2, 'B07', 2, 4, 1, 'VIP', 'AVAILABLE'), (2, 'B08', 2, 4, 2, 'VIP', 'AVAILABLE'),
(2, 'B09', 2, 5, 1, 'VIP', 'AVAILABLE'), (2, 'B10', 2, 5, 2, 'VIP', 'AVAILABLE'),
(2, 'B11', 2, 6, 1, 'VIP', 'AVAILABLE'), (2, 'B12', 2, 6, 2, 'VIP', 'AVAILABLE'),
(2, 'B13', 2, 7, 1, 'VIP', 'AVAILABLE'), (2, 'B14', 2, 7, 2, 'VIP', 'AVAILABLE'),
(2, 'B15', 2, 8, 1, 'VIP', 'AVAILABLE'), (2, 'B16', 2, 8, 2, 'VIP', 'AVAILABLE'),
(2, 'B17', 2, 9, 1, 'VIP', 'AVAILABLE');

-- Chuyến 3: 34 ghế (Tất cả sẵn sàng mở bán)
INSERT INTO trip_seats (trip_id, seat_code, floor, row_num, col_num, seat_type, status) VALUES
(3, 'A01', 1, 1, 1, 'STANDARD', 'AVAILABLE'), (3, 'A02', 1, 1, 2, 'STANDARD', 'AVAILABLE'),
(3, 'A03', 1, 2, 1, 'STANDARD', 'AVAILABLE'), (3, 'A04', 1, 2, 2, 'STANDARD', 'AVAILABLE'),
(3, 'A05', 1, 3, 1, 'STANDARD', 'AVAILABLE'), (3, 'A06', 1, 3, 2, 'STANDARD', 'AVAILABLE'),
(3, 'A07', 1, 4, 1, 'STANDARD', 'AVAILABLE'), (3, 'A08', 1, 4, 2, 'STANDARD', 'AVAILABLE'),
(3, 'A09', 1, 5, 1, 'STANDARD', 'AVAILABLE'), (3, 'A10', 1, 5, 2, 'STANDARD', 'AVAILABLE'),
(3, 'A11', 1, 6, 1, 'STANDARD', 'AVAILABLE'), (3, 'A12', 1, 6, 2, 'STANDARD', 'AVAILABLE'),
(3, 'A13', 1, 7, 1, 'STANDARD', 'AVAILABLE'), (3, 'A14', 1, 7, 2, 'STANDARD', 'AVAILABLE'),
(3, 'A15', 1, 8, 1, 'STANDARD', 'AVAILABLE'), (3, 'A16', 1, 8, 2, 'STANDARD', 'AVAILABLE'),
(3, 'A17', 1, 9, 1, 'STANDARD', 'AVAILABLE'),
(3, 'B01', 2, 1, 1, 'VIP', 'AVAILABLE'), (3, 'B02', 2, 1, 2, 'VIP', 'AVAILABLE'),
(3, 'B03', 2, 2, 1, 'VIP', 'AVAILABLE'), (3, 'B04', 2, 2, 2, 'VIP', 'AVAILABLE'),
(3, 'B05', 2, 3, 1, 'VIP', 'AVAILABLE'), (3, 'B06', 2, 3, 2, 'VIP', 'AVAILABLE'),
(3, 'B07', 2, 4, 1, 'VIP', 'AVAILABLE'), (3, 'B08', 2, 4, 2, 'VIP', 'AVAILABLE'),
(3, 'B09', 2, 5, 1, 'VIP', 'AVAILABLE'), (3, 'B10', 2, 5, 2, 'VIP', 'AVAILABLE'),
(3, 'B11', 2, 6, 1, 'VIP', 'AVAILABLE'), (3, 'B12', 2, 6, 2, 'VIP', 'AVAILABLE'),
(3, 'B13', 2, 7, 1, 'VIP', 'AVAILABLE'), (3, 'B14', 2, 7, 2, 'VIP', 'AVAILABLE'),
(3, 'B15', 2, 8, 1, 'VIP', 'AVAILABLE'), (3, 'B16', 2, 8, 2, 'VIP', 'AVAILABLE'),
(3, 'B17', 2, 9, 1, 'VIP', 'AVAILABLE');

-- Chuyến 4: 34 ghế (Tất cả sẵn sàng mở bán)
INSERT INTO trip_seats (trip_id, seat_code, floor, row_num, col_num, seat_type, status) VALUES
(4, 'A01', 1, 1, 1, 'STANDARD', 'AVAILABLE'), (4, 'A02', 1, 1, 2, 'STANDARD', 'AVAILABLE'),
(4, 'A03', 1, 2, 1, 'STANDARD', 'AVAILABLE'), (4, 'A04', 1, 2, 2, 'STANDARD', 'AVAILABLE'),
(4, 'A05', 1, 3, 1, 'STANDARD', 'AVAILABLE'), (4, 'A06', 1, 3, 2, 'STANDARD', 'AVAILABLE'),
(4, 'A07', 1, 4, 1, 'STANDARD', 'AVAILABLE'), (4, 'A08', 1, 4, 2, 'STANDARD', 'AVAILABLE'),
(4, 'A09', 1, 5, 1, 'STANDARD', 'AVAILABLE'), (4, 'A10', 1, 5, 2, 'STANDARD', 'AVAILABLE'),
(4, 'A11', 1, 6, 1, 'STANDARD', 'AVAILABLE'), (4, 'A12', 1, 6, 2, 'STANDARD', 'AVAILABLE'),
(4, 'A13', 1, 7, 1, 'STANDARD', 'AVAILABLE'), (4, 'A14', 1, 7, 2, 'STANDARD', 'AVAILABLE'),
(4, 'A15', 1, 8, 1, 'STANDARD', 'AVAILABLE'), (4, 'A16', 1, 8, 2, 'STANDARD', 'AVAILABLE'),
(4, 'A17', 1, 9, 1, 'STANDARD', 'AVAILABLE'),
(4, 'B01', 2, 1, 1, 'VIP', 'AVAILABLE'), (4, 'B02', 2, 1, 2, 'VIP', 'AVAILABLE'),
(4, 'B03', 2, 2, 1, 'VIP', 'AVAILABLE'), (4, 'B04', 2, 2, 2, 'VIP', 'AVAILABLE'),
(4, 'B05', 2, 3, 1, 'VIP', 'AVAILABLE'), (4, 'B06', 2, 3, 2, 'VIP', 'AVAILABLE'),
(4, 'B07', 2, 4, 1, 'VIP', 'AVAILABLE'), (4, 'B08', 2, 4, 2, 'VIP', 'AVAILABLE'),
(4, 'B09', 2, 5, 1, 'VIP', 'AVAILABLE'), (4, 'B10', 2, 5, 2, 'VIP', 'AVAILABLE'),
(4, 'B11', 2, 6, 1, 'VIP', 'AVAILABLE'), (4, 'B12', 2, 6, 2, 'VIP', 'AVAILABLE'),
(4, 'B13', 2, 7, 1, 'VIP', 'AVAILABLE'), (4, 'B14', 2, 7, 2, 'VIP', 'AVAILABLE'),
(4, 'B15', 2, 8, 1, 'VIP', 'AVAILABLE'), (4, 'B16', 2, 8, 2, 'VIP', 'AVAILABLE'),
(4, 'B17', 2, 9, 1, 'VIP', 'AVAILABLE');

-- 7. Seed Sample Bookings (Đơn đặt vé có sẵn phục vụ kiểm thử tra cứu vé)
INSERT INTO bookings (id, user_id, trip_id, booking_code, passenger_name, passenger_phone, passenger_email, pickup_point, dropoff_point, seat_numbers, total_amount, payment_method, status) VALUES 
(1, 3, 1, 'BKG-20261025-001', 'Nguyễn Văn Du Khách', '0912345678', 'customer@gmail.com', 'Bến xe Miền Tây', 'Bến xe Liên tỉnh Đà Lạt', 'A01, A02', 580000.00, 'COD', 'CONFIRMED');

-- 8. Seed Sample Tickets (Vé điện tử con & Mã QR check-in)
INSERT INTO tickets (id, booking_id, ticket_code, seat_number, price, qr_code_hash, status) VALUES 
(1, 1, 'TK-20261025-001-A01', 'A01', 290000.00, 'c5e26b88-5c42-4f01-8b21-7e8c3a19e001', 'ISSUED'),
(2, 1, 'TK-20261025-001-A02', 'A02', 290000.00, 'f7a14c99-7b33-4d22-9e32-8f9d4b28f002', 'ISSUED');\n