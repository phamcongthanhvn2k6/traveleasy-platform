DO $$
DECLARE
    r RECORD;
    v_trip_id BIGINT;
BEGIN
    FOR r IN (
        SELECT * FROM (VALUES
(1, 1, '2026-11-22 06:00:00'::timestamp, '2026-11-22 12:30:00'::timestamp, 'LIMOUSINE', 390000.0, '51B-289.99', 'Xe Limousine VIP 34 phòng riêng biệt, sạc Type-C, nước suối khăn lạnh'),
(1, 1, '2026-11-22 08:30:00'::timestamp, '2026-11-22 15:00:00'::timestamp, 'SLEEPER', 320000.0, '51B-124.56', 'Xe giường nằm chất lượng cao FUTA, máy lạnh, wifi, chăn ấm'),
(1, 2, '2026-11-22 13:00:00'::timestamp, '2026-11-22 19:30:00'::timestamp, 'LIMOUSINE', 390000.0, '53B-307.51', 'Xe phòng VIP Thành Bưởi, rèm che kín đáo, tivi giải trí'),
(1, 1, '2026-11-22 22:30:00'::timestamp, '2026-11-23 05:00:00'::timestamp, 'LIMOUSINE', 390000.0, '51B-998.12', 'Chuyến đêm VIP Limousine Sài Gòn đi Đà Lạt - Chuyến xe trọng điểm Demo OJT'),
(1, 2, '2026-11-22 23:00:00'::timestamp, '2026-11-23 05:30:00'::timestamp, 'SLEEPER', 320000.0, '53B-110.38', 'Xe giường nằm êm ái, hỗ trợ trả khách tận nơi trung tâm Đà Lạt'),
(1, 1, '2026-11-22 23:30:00'::timestamp, '2026-11-23 06:00:00'::timestamp, 'LIMOUSINE', 390000.0, '51B-654.32', 'Limousine cao cấp xuất phát Bến xe Miền Đông mới'),
(15, 1, '2026-11-22 08:00:00'::timestamp, '2026-11-22 14:30:00'::timestamp, 'SLEEPER', 320000.0, '49B-018.88', 'Chuyến sáng ngắm đèo Bảo Lộc, đón tận nơi tại các khách sạn Đà Lạt'),
(15, 2, '2026-11-22 13:30:00'::timestamp, '2026-11-22 20:00:00'::timestamp, 'LIMOUSINE', 390000.0, '49B-023.45', 'Xe phòng cao cấp Thành Bưởi về Sài Gòn'),
(15, 1, '2026-11-22 22:00:00'::timestamp, '2026-11-23 04:30:00'::timestamp, 'LIMOUSINE', 390000.0, '49B-099.11', 'Chuyến đêm Đà Lạt về Bến xe Miền Tây'),
(15, 2, '2026-11-22 23:00:00'::timestamp, '2026-11-23 05:30:00'::timestamp, 'SLEEPER', 320000.0, '49B-066.77', 'Giường nằm êm ái, trả khách dọc Quốc lộ 20 và Suối Tiên'),
(2, 1, '2026-11-22 07:00:00'::timestamp, '2026-11-22 15:00:00'::timestamp, 'SLEEPER', 320000.0, '51B-334.55', 'Tuyến Sài Gòn đi phố biển Nha Trang, xe chạy êm, hỗ trợ khăn lạnh'),
(2, 8, '2026-11-22 11:00:00'::timestamp, '2026-11-22 18:30:00'::timestamp, 'LIMOUSINE', 420000.0, '79B-015.67', 'Cúc Tùng Limousine Cung Điện Di Động 22 cabin sang trọng'),
(2, 1, '2026-11-22 20:30:00'::timestamp, '2026-11-23 04:30:00'::timestamp, 'LIMOUSINE', 390000.0, '51B-889.99', 'Xe Limousine Live GPS Tracking thời gian thực - Chuyến xe kết nối giám sát an toàn'),
(2, 8, '2026-11-22 22:00:00'::timestamp, '2026-11-23 05:30:00'::timestamp, 'LIMOUSINE', 420000.0, '79B-028.99', 'Cúc Tùng Limousine xuất bến đón trả trung tâm TP Nha Trang'),
(17, 1, '2026-11-22 08:30:00'::timestamp, '2026-11-22 16:30:00'::timestamp, 'SLEEPER', 320000.0, '79B-044.22', 'Xe FUTA từ Bến xe phía Nam Nha Trang về TP.HCM'),
(17, 8, '2026-11-22 21:00:00'::timestamp, '2026-11-23 04:30:00'::timestamp, 'LIMOUSINE', 420000.0, '79B-055.66', 'Chuyến đêm Cúc Tùng về Sài Gòn rạng sáng'),
(3, 2, '2026-11-22 06:30:00'::timestamp, '2026-11-22 10:00:00'::timestamp, 'LIMOUSINE', 220000.0, '65B-012.34', 'Xe Limousine đi miền Tây sông nước Cần Thơ qua cao tốc Trung Lương'),
(3, 1, '2026-11-22 09:00:00'::timestamp, '2026-11-22 12:30:00'::timestamp, 'SLEEPER', 180000.0, '51B-778.89', 'Xe giường nằm FUTA Bến xe Miền Tây đi Cần Thơ'),
(3, 2, '2026-11-22 14:00:00'::timestamp, '2026-11-22 17:30:00'::timestamp, 'LIMOUSINE', 220000.0, '65B-034.56', 'Chuyến chiều Cần Thơ, trung chuyển tận nhà quận Ninh Kiều'),
(3, 1, '2026-11-22 17:30:00'::timestamp, '2026-11-22 21:00:00'::timestamp, 'SLEEPER', 180000.0, '51B-990.12', 'Chuyến tối xuất phát Bến xe Miền Tây'),
(18, 2, '2026-11-22 07:00:00'::timestamp, '2026-11-22 10:30:00'::timestamp, 'LIMOUSINE', 220000.0, '65B-078.90', 'Cần Thơ về Sài Gòn buổi sáng đón tại Bến xe Trung tâm'),
(18, 1, '2026-11-22 13:30:00'::timestamp, '2026-11-22 17:00:00'::timestamp, 'SLEEPER', 180000.0, '51B-556.77', 'FUTA Cần Thơ về Bến xe Miền Tây'),
(5, 5, '2026-11-22 06:00:00'::timestamp, '2026-11-22 08:00:00'::timestamp, 'SEAT', 190000.0, '72B-011.22', 'Hoa Mai VIP Limousine 9-16 chỗ ngả lưng êm ái, chạy cao tốc Long Thành'),
(5, 5, '2026-11-22 08:00:00'::timestamp, '2026-11-22 10:00:00'::timestamp, 'SEAT', 190000.0, '72B-012.33', 'Hoa Mai VIP đón trả tận nơi trung tâm TP Vũng Tàu'),
(5, 5, '2026-11-22 10:00:00'::timestamp, '2026-11-22 12:00:00'::timestamp, 'SEAT', 190000.0, '72B-014.55', 'Hoa Mai chuyến trưa đi tắm biển Vũng Tàu'),
(5, 5, '2026-11-22 13:00:00'::timestamp, '2026-11-22 15:00:00'::timestamp, 'SEAT', 190000.0, '72B-015.66', 'Hoa Mai xuất phát từ 44 Nguyễn Thái Bình, Quận 1'),
(5, 5, '2026-11-22 15:30:00'::timestamp, '2026-11-22 17:30:00'::timestamp, 'SEAT', 190000.0, '72B-016.77', 'Hoa Mai chuyến chiều về Bãi Sau Vũng Tàu'),
(5, 5, '2026-11-22 17:30:00'::timestamp, '2026-11-22 19:30:00'::timestamp, 'SEAT', 190000.0, '72B-018.99', 'Hoa Mai chuyến tối cuối tuần'),
(6, 5, '2026-11-22 07:00:00'::timestamp, '2026-11-22 09:00:00'::timestamp, 'SEAT', 190000.0, '72B-021.11', 'Vũng Tàu về Sài Gòn trả tại Sân bay Tân Sơn Nhất'),
(6, 5, '2026-11-22 09:30:00'::timestamp, '2026-11-22 11:30:00'::timestamp, 'SEAT', 190000.0, '72B-022.33', 'Vũng Tàu về Quận 1'),
(6, 5, '2026-11-22 13:30:00'::timestamp, '2026-11-22 15:30:00'::timestamp, 'SEAT', 190000.0, '72B-024.55', 'Hoa Mai về Sài Gòn buổi chiều'),
(4, 3, '2026-11-22 06:30:00'::timestamp, '2026-11-22 12:00:00'::timestamp, 'LIMOUSINE', 450000.0, '29B-188.76', 'Sao Việt Limousine Hà Nội đi Sa Pa cao tốc Nội Bài - Lào Cai'),
(4, 3, '2026-11-22 22:00:00'::timestamp, '2026-11-23 03:30:00'::timestamp, 'LIMOUSINE', 450000.0, '29B-199.88', 'Chuyến đêm ngắm sương mù Sa Pa sáng sớm'),
(16, 3, '2026-11-22 08:00:00'::timestamp, '2026-11-22 13:30:00'::timestamp, 'LIMOUSINE', 450000.0, '29B-201.23', 'Sao Việt Sa Pa về Bến xe Mỹ Đình'),
(16, 3, '2026-11-22 14:00:00'::timestamp, '2026-11-22 19:30:00'::timestamp, 'LIMOUSINE', 450000.0, '29B-202.34', 'Sao Việt Sa Pa về Hà Nội chuyến chiều'),
(19, 6, '2026-11-22 08:00:00'::timestamp, '2026-11-22 21:30:00'::timestamp, 'SLEEPER', 550000.0, '15B-012.89', 'Hoàng Long Asia giường nằm xuyên Việt, hỗ trợ ăn trưa và tối'),
(19, 6, '2026-11-22 18:00:00'::timestamp, '2026-11-23 07:30:00'::timestamp, 'SLEEPER', 550000.0, '15B-034.90', 'Hoàng Long giường nằm chất lượng cao Hà Nội - Đà Nẵng'),
(13, 1, '2026-11-22 08:30:00'::timestamp, '2026-11-22 11:00:00'::timestamp, 'SLEEPER', 120000.0, '43B-011.22', 'FUTA Đà Nẵng đi Cố đô Huế qua hầm Hải Vân'),
(13, 1, '2026-11-22 14:00:00'::timestamp, '2026-11-22 16:30:00'::timestamp, 'SLEEPER', 120000.0, '43B-022.33', 'Chuyến chiều Đà Nẵng đi Bến xe phía Nam Huế'),
(14, 10, '2026-11-22 09:00:00'::timestamp, '2026-11-22 14:30:00'::timestamp, 'SLEEPER', 250000.0, '76B-015.88', 'Chín Nghĩa Bến xe Đà Nẵng đi Quy Nhơn')
        ) AS t(route_id, bus_company_id, dep_time, arr_time, bus_type, price, plate, description)
        WHERE NOT EXISTS (SELECT 1 FROM trips WHERE license_plate = t.plate AND departure_time = t.dep_time)
    ) LOOP
        INSERT INTO trips (bus_company_id, route_id, departure_time, arrival_time, bus_type, price, available_seats, total_seats, status, license_plate, description, is_active, created_at)
        VALUES (r.bus_company_id, r.route_id, r.dep_time, r.arr_time, r.bus_type, r.price, 30, 34, 'SCHEDULED', r.plate, r.description, TRUE, CURRENT_TIMESTAMP)
        RETURNING id INTO v_trip_id;

        INSERT INTO trip_seats (trip_id, floor, row_num, col_num, seat_code, seat_type, status)
        SELECT v_trip_id, 1, (i - 1) / 3 + 1, (i - 1) % 3 + 1, 'A' || LPAD(i::text, 2, '0'), 'STANDARD',
               CASE WHEN i IN (1, 2, 5, 8) THEN 'BOOKED' ELSE 'AVAILABLE' END
        FROM generate_series(1, 17) i;

        INSERT INTO trip_seats (trip_id, floor, row_num, col_num, seat_code, seat_type, status)
        SELECT v_trip_id, 2, (i - 1) / 3 + 1, (i - 1) % 3 + 1, 'B' || LPAD(i::text, 2, '0'), 'STANDARD',
               CASE WHEN i IN (1, 2) THEN 'BOOKED' ELSE 'AVAILABLE' END
        FROM generate_series(1, 17) i;

        INSERT INTO trip_crews (trip_id, bus_company_id, primary_driver_name, primary_driver_phone, primary_driver_license, secondary_driver_name, secondary_driver_phone, conductor_name, conductor_phone, continuous_drive_hours, status, notes, created_at, updated_at)
        VALUES (v_trip_id, r.bus_company_id, 'Nguyễn Văn Hùng', '0901234567', 'GPLX-E-079088992211', 'Lê Văn Thắng', '0912345678', 'Trần Văn Phụ', '0987654321', 2.5, 'APPROVED_DEPARTURE', 'Đã kiểm tra cồn 0.00 mg/L, đủ điều kiện xuất bến', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    END LOOP;
END $$;
