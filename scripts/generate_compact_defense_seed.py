# -*- coding: utf-8 -*-
"""
Compact, fast SQL generator for complete Defense Week Seed Data
"""

def generate_compact_sql(dates):
    # (route_id, bus_company_id, dep_hour, dep_min, dur_hours, bus_type, price, plate, desc)
    route_templates = [
        # Tuyến 1: Sài Gòn -> Đà Lạt
        (1, 1, 6, 0, 6.5, 'LIMOUSINE', 390000, '51B-289.99', 'Xe Limousine VIP 34 phòng riêng biệt, sạc Type-C, nước suối khăn lạnh'),
        (1, 1, 8, 30, 6.5, 'SLEEPER', 320000, '51B-124.56', 'Xe giường nằm chất lượng cao FUTA, máy lạnh, wifi, chăn ấm'),
        (1, 2, 13, 0, 6.5, 'LIMOUSINE', 390000, '53B-307.51', 'Xe phòng VIP Thành Bưởi, rèm che kín đáo, tivi giải trí'),
        (1, 1, 22, 30, 6.5, 'LIMOUSINE', 390000, '51B-998.12', 'Chuyến đêm VIP Limousine Sài Gòn đi Đà Lạt - Chuyến xe trọng điểm Demo OJT'),
        (1, 2, 23, 0, 6.5, 'SLEEPER', 320000, '53B-110.38', 'Xe giường nằm êm ái, hỗ trợ trả khách tận nơi trung tâm Đà Lạt'),
        (1, 1, 23, 30, 6.5, 'LIMOUSINE', 390000, '51B-654.32', 'Limousine cao cấp xuất phát Bến xe Miền Đông mới'),
        
        # Tuyến 15: Đà Lạt -> Sài Gòn
        (15, 1, 8, 0, 6.5, 'SLEEPER', 320000, '49B-018.88', 'Chuyến sáng ngắm đèo Bảo Lộc, đón tận nơi tại các khách sạn Đà Lạt'),
        (15, 2, 13, 30, 6.5, 'LIMOUSINE', 390000, '49B-023.45', 'Xe phòng cao cấp Thành Bưởi về Sài Gòn'),
        (15, 1, 22, 0, 6.5, 'LIMOUSINE', 390000, '49B-099.11', 'Chuyến đêm Đà Lạt về Bến xe Miền Tây'),
        (15, 2, 23, 0, 6.5, 'SLEEPER', 320000, '49B-066.77', 'Giường nằm êm ái, trả khách dọc Quốc lộ 20 và Suối Tiên'),

        # Tuyến 2: Sài Gòn -> Nha Trang
        (2, 1, 7, 0, 8.0, 'SLEEPER', 320000, '51B-334.55', 'Tuyến Sài Gòn đi phố biển Nha Trang, xe chạy êm, hỗ trợ khăn lạnh'),
        (2, 8, 11, 0, 7.5, 'LIMOUSINE', 420000, '79B-015.67', 'Cúc Tùng Limousine Cung Điện Di Động 22 cabin sang trọng'),
        (2, 1, 20, 30, 8.0, 'LIMOUSINE', 390000, '51B-889.99', 'Xe Limousine Live GPS Tracking thời gian thực - Chuyến xe kết nối giám sát an toàn'),
        (2, 8, 22, 0, 7.5, 'LIMOUSINE', 420000, '79B-028.99', 'Cúc Tùng Limousine xuất bến đón trả trung tâm TP Nha Trang'),

        # Tuyến 17: Nha Trang -> Sài Gòn
        (17, 1, 8, 30, 8.0, 'SLEEPER', 320000, '79B-044.22', 'Xe FUTA từ Bến xe phía Nam Nha Trang về TP.HCM'),
        (17, 8, 21, 0, 7.5, 'LIMOUSINE', 420000, '79B-055.66', 'Chuyến đêm Cúc Tùng về Sài Gòn rạng sáng'),

        # Tuyến 3: Sài Gòn -> Cần Thơ
        (3, 2, 6, 30, 3.5, 'LIMOUSINE', 220000, '65B-012.34', 'Xe Limousine đi miền Tây sông nước Cần Thơ qua cao tốc Trung Lương'),
        (3, 1, 9, 0, 3.5, 'SLEEPER', 180000, '51B-778.89', 'Xe giường nằm FUTA Bến xe Miền Tây đi Cần Thơ'),
        (3, 2, 14, 0, 3.5, 'LIMOUSINE', 220000, '65B-034.56', 'Chuyến chiều Cần Thơ, trung chuyển tận nhà quận Ninh Kiều'),
        (3, 1, 17, 30, 3.5, 'SLEEPER', 180000, '51B-990.12', 'Chuyến tối xuất phát Bến xe Miền Tây'),

        # Tuyến 18: Cần Thơ -> Sài Gòn
        (18, 2, 7, 0, 3.5, 'LIMOUSINE', 220000, '65B-078.90', 'Cần Thơ về Sài Gòn buổi sáng đón tại Bến xe Trung tâm'),
        (18, 1, 13, 30, 3.5, 'SLEEPER', 180000, '51B-556.77', 'FUTA Cần Thơ về Bến xe Miền Tây'),

        # Tuyến 5: Sài Gòn -> Vũng Tàu (Xe Hoa Mai)
        (5, 5, 6, 0, 2.0, 'SEAT', 190000, '72B-011.22', 'Hoa Mai VIP Limousine 9-16 chỗ ngả lưng êm ái, chạy cao tốc Long Thành'),
        (5, 5, 8, 0, 2.0, 'SEAT', 190000, '72B-012.33', 'Hoa Mai VIP đón trả tận nơi trung tâm TP Vũng Tàu'),
        (5, 5, 10, 0, 2.0, 'SEAT', 190000, '72B-014.55', 'Hoa Mai chuyến trưa đi tắm biển Vũng Tàu'),
        (5, 5, 13, 0, 2.0, 'SEAT', 190000, '72B-015.66', 'Hoa Mai xuất phát từ 44 Nguyễn Thái Bình, Quận 1'),
        (5, 5, 15, 30, 2.0, 'SEAT', 190000, '72B-016.77', 'Hoa Mai chuyến chiều về Bãi Sau Vũng Tàu'),
        (5, 5, 17, 30, 2.0, 'SEAT', 190000, '72B-018.99', 'Hoa Mai chuyến tối cuối tuần'),

        # Tuyến 6: Vũng Tàu -> Sài Gòn
        (6, 5, 7, 0, 2.0, 'SEAT', 190000, '72B-021.11', 'Vũng Tàu về Sài Gòn trả tại Sân bay Tân Sơn Nhất'),
        (6, 5, 9, 30, 2.0, 'SEAT', 190000, '72B-022.33', 'Vũng Tàu về Quận 1'),
        (6, 5, 13, 30, 2.0, 'SEAT', 190000, '72B-024.55', 'Hoa Mai về Sài Gòn buổi chiều'),

        # Tuyến 4: Hà Nội -> Sa Pa
        (4, 3, 6, 30, 5.5, 'LIMOUSINE', 450000, '29B-188.76', 'Sao Việt Limousine Hà Nội đi Sa Pa cao tốc Nội Bài - Lào Cai'),
        (4, 3, 22, 0, 5.5, 'LIMOUSINE', 450000, '29B-199.88', 'Chuyến đêm ngắm sương mù Sa Pa sáng sớm'),

        # Tuyến 16: Sa Pa -> Hà Nội
        (16, 3, 8, 0, 5.5, 'LIMOUSINE', 450000, '29B-201.23', 'Sao Việt Sa Pa về Bến xe Mỹ Đình'),
        (16, 3, 14, 0, 5.5, 'LIMOUSINE', 450000, '29B-202.34', 'Sao Việt Sa Pa về Hà Nội chuyến chiều'),

        # Tuyến 19: Hà Nội -> Đà Nẵng
        (19, 6, 8, 0, 13.5, 'SLEEPER', 550000, '15B-012.89', 'Hoàng Long Asia giường nằm xuyên Việt, hỗ trợ ăn trưa và tối'),
        (19, 6, 18, 0, 13.5, 'SLEEPER', 550000, '15B-034.90', 'Hoàng Long giường nằm chất lượng cao Hà Nội - Đà Nẵng'),

        # Tuyến 13: Đà Nẵng -> Huế
        (13, 1, 8, 30, 2.5, 'SLEEPER', 120000, '43B-011.22', 'FUTA Đà Nẵng đi Cố đô Huế qua hầm Hải Vân'),
        (13, 1, 14, 0, 2.5, 'SLEEPER', 120000, '43B-022.33', 'Chuyến chiều Đà Nẵng đi Bến xe phía Nam Huế'),

        # Tuyến 14: Đà Nẵng -> Quy Nhơn
        (14, 10, 9, 0, 5.5, 'SLEEPER', 250000, '76B-015.88', 'Chín Nghĩa Bến xe Đà Nẵng đi Quy Nhơn')
    ]

    values_list = []
    for d in dates:
        for tpl in route_templates:
            r_id, bc_id, h, m, dur, b_type, price, plate, desc = tpl
            dep_ts = f"{d} {h:02d}:{m:02d}:00"
            arr_h = int(h + dur)
            arr_m = int(m + (dur - int(dur)) * 60)
            if arr_m >= 60:
                arr_h += 1
                arr_m -= 60
            arr_d = d
            if arr_h >= 24:
                arr_h -= 24
                # next day
                day_num = int(d.split('-')[2]) + 1
                arr_d = f"2026-11-{day_num:02d}"
            arr_ts = f"{arr_d} {arr_h:02d}:{arr_m:02d}:00"
            desc_escaped = desc.replace("'", "''")
            values_list.append(f"({r_id}, {bc_id}, '{dep_ts}'::timestamp, '{arr_ts}'::timestamp, '{b_type}', {price}.0, '{plate}', '{desc_escaped}')")

    sql = """DO $$
DECLARE
    r RECORD;
    v_trip_id BIGINT;
BEGIN
    FOR r IN (
        SELECT * FROM (VALUES
""" + ",\n".join(values_list) + """
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
"""
    return sql

if __name__ == "__main__":
    dates = ['2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22']
    for d in dates:
        sql = generate_compact_sql([d])
        fname = f"scripts/compact_seed_{d.replace('-', '_')}.sql"
        with open(fname, "w", encoding="utf-8") as f:
            f.write(sql)
        print(f"Generated {fname} ({len(sql)} chars)")
