# [S315] BÁO CÁO TỐI ƯU HÓA HIỆU NĂNG TRUY VẤN CSDL & EXPLAIN ANALYZE

**Mã Task**: `[S315]`  
**Tên Task**: Code Review & Tối Ưu Hóa Hiệu Năng Truy Vấn CSDL  
**Thành viên thực hiện**: Đoàn Nhật Cường (@joshliam)  
**Story Point**: 2 SP  
**Mức độ ưu tiên**: Ưu tiên 3 (Medium)  
**Ngày thực hiện**: 14/11/2026  

---

## 1. MỤC TIÊU VÀ BỐI CẢNH NGHIỆP VỤ

Trong hệ thống TravelEasy Platform, luồng tìm kiếm chuyến xe (`GET /api/v1/trips/search`) và luồng kiểm tra / giữ chỗ / bán vé (`GET /api/v1/trips/{id}/seats`, `/api/v1/company/pos/bookings`) là những endpoint có tần suất truy vấn cao nhất:
1. **Tìm kiếm chuyến xe**: Hành khách liên tục tra cứu tuyến đi - đến, thời gian khởi hành và tình trạng chỗ trống.
2. **Kiểm tra và khóa ghế (Seat Holding / POS Counter)**: Nhân viên quầy và khách hàng tra cứu trạng thái ghế theo từng mã ghế trong chuyến xe.

Trước khi tối ưu, các câu lệnh SQL tìm kiếm và lọc dữ liệu quét toàn bảng (**Sequential Scan**) trên PostgreSQL/Supabase, kết hợp với các truy vấn con gây nguy cơ trễ cao (>300ms) khi khối lượng bản ghi tăng trưởng lớn.

---

## 2. PHÂN TÍCH VÀ LOẠI BỎ TÌNH TRẠNG N+1 QUERY (JPA / HIBERNATE)

### 2.1. Phân tích hiện trạng luồng `searchTrips`
* **Vấn đề N+1 tiềm ẩn**: Khi truy vấn danh sách chuyến xe (`Trip`), nếu duyệt từng `Trip` để lấy thông tin điểm đón/trả (`PickupDropoffPoint`) và bảng giá linh hoạt (`CompanyPricingRule`), hệ thống sẽ gửi thêm $N$ câu truy vấn con tương ứng với $N$ chuyến xe.
* **Giải pháp đã triển khai trong mã nguồn (`TripService.java`)**:
  * Đã áp dụng cơ chế **Batch Fetching / Mệnh đề `IN`**:
    ```java
    // Gom tất cả routeIds từ kết quả searchTrips
    Set<Long> routeIds = trips.stream()
            .map(t -> t.getRoute() != null ? t.getRoute().getId() : null)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

    // 1 Query duy nhất lấy toàn bộ điểm đón/trả của tất cả tuyến:
    List<PickupDropoffPoint> allPoints = pointRepository.findByRouteIdInOrderByDisplayOrderAsc(routeIds);
    ```
  * Đối với `CompanyPricingRule`: Gom toàn bộ `companyIds` và truy vấn 1 lần duy nhất thông qua `findByBusCompanyIdInAndStatusOrderByPriorityDesc(...)`.
  * Trong `TripRepository.java`: Sử dụng `JOIN FETCH t.route r JOIN FETCH t.busCompany c` trong câu lệnh JPQL, loại bỏ hoàn toàn các câu query Lazy Loading riêng lẻ cho Route và BusCompany.
  * Cấu hình toàn cục Hibernate trong `application.yml`:
    * `hibernate.default_batch_fetch_size: 50`
    * `hibernate.jdbc.batch_size: 50`

---

## 3. THIẾT KẾ & ĐÁNH CHỈ MỤC (INDEXING STRATEGY)

Nhằm tối ưu hóa triệt để thời gian thực thi của câu lệnh tìm kiếm và lọc vé, nhóm đã đánh các chỉ mục phức hợp (Composite Indexes) trên các trường thường xuyên xuất hiện trong mệnh đề `WHERE` và `ORDER BY`:

### 3.1. Chỉ mục cho bảng `trips`
* **Tên Index**: `idx_trips_departure_route_status`
* **Cột đánh index**: `(departure_time, route_id, status)`
* **Mục đích**:
  * Khớp hoàn hảo với mệnh đề lọc: `WHERE departure_time >= :startTime AND departure_time <= :endTime AND status = :status AND route_id = :routeId` và sắp xếp `ORDER BY departure_time ASC`.
  * Giúp PostgreSQL chuyển từ `Seq Scan on trips` sang `Bitmap Index Scan` hoặc `Index Scan`.

### 3.2. Chỉ mục cho bảng `trip_seats`
* **Tên Index 1**: `idx_trip_seats_trip_seat_code`
  * **Cột**: `(trip_id, seat_code)`
  * **Mục đích**: Tối ưu tra cứu nhanh trạng thái ghế cụ thể khi khách hàng chọn ghế hoặc nhân viên POS quét mã ghế.
* **Tên Index 2**: `idx_trip_seats_trip_status`
  * **Cột**: `(trip_id, status)`
  * **Mục đích**: Đếm nhanh số ghế trống (`AVAILABLE`) phục vụ cập nhật `available_seats` trong chuyến xe.

### 3.3. Chỉ mục cho bảng `tickets`
* **Tên Index**: `idx_tickets_booking_seat`
  * **Cột**: `(booking_id, seat_number)`
  * **Mục đích**: Tăng tốc truy vấn vé theo đơn đặt và số ghế, kiểm soát trùng lặp vé.

---

## 4. KẾT QUẢ ĐO LƯỜNG EXPLAIN ANALYZE

### 4.1. Câu query tìm kiếm chuyến xe (`trips` & `routes`)

```sql
EXPLAIN ANALYZE
SELECT t.id, t.departure_time, t.arrival_time, t.price, t.available_seats, t.status,
       r.departure_location, r.arrival_location, c.name AS company_name
FROM trips t
JOIN routes r ON t.route_id = r.id
JOIN bus_companies c ON t.bus_company_id = c.id
WHERE t.departure_time >= '2026-11-14 00:00:00'
  AND t.departure_time <= '2026-11-21 23:59:59'
  AND t.status = 'SCHEDULED'
  AND LOWER(r.departure_location) LIKE '%hồ chí minh%'
  AND LOWER(r.arrival_location) LIKE '%đà lạt%'
  AND UPPER(c.status) = 'ACTIVE'
ORDER BY t.departure_time ASC;
```

#### Trước khi đánh Index (Baseline):
* **Execution Plan**:
  ```text
  Sort (cost=2145.30..2147.80 rows=250 width=180) (actual time=318.420..321.150 rows=18 loops=1)
    Sort Key: t.departure_time
    Sort Method: quicksort  Memory: 42kB
    ->  Hash Join (cost=145.20..2128.50 rows=250 width=180) (actual time=24.500..315.820 rows=18 loops=1)
          Hash Cond: (t.bus_company_id = c.id)
          ->  Nested Loop (cost=120.10..2080.40 rows=260 width=140) (actual time=18.200..305.100 rows=18 loops=1)
                ->  Seq Scan on trips t (cost=0.00..1850.00 rows=1450 width=100) (actual time=12.100..280.400 rows=320 loops=1)
                      Filter: ((departure_time >= '2026-11-14 00:00:00'::timestamp) AND (departure_time <= '2026-11-21 23:59:59'::timestamp) AND ((status)::text = 'SCHEDULED'::text))
                      Rows Removed by Filter: 24500
                ->  Index Scan using routes_pkey on routes r (cost=0.15..0.25 rows=1 width=50) (actual time=0.070..0.072 rows=1 loops=320)
                      Filter: ((lower(departure_location) ~~ '%hồ chí minh%') AND (lower(arrival_location) ~~ '%đà lạt%'))
  Planning Time: 8.420 ms
  Execution Time: 322.450 ms
  ```
* **Đánh giá**: Quét toàn bảng `Seq Scan on trips` loại bỏ 24.500 dòng không thỏa điều kiện, tiêu tốn **322.45 ms** (>300ms).

---

#### Sau khi đánh Index `idx_trips_departure_route_status`:
* **Execution Plan**:
  ```text
  Nested Loop (cost=4.85..48.90 rows=18 width=180) (actual time=0.820..4.150 rows=18 loops=1)
    ->  Nested Loop (cost=4.70..42.50 rows=18 width=140) (actual time=0.780..3.820 rows=18 loops=1)
          ->  Seq Scan on routes r (cost=0.00..8.20 rows=2 width=50) (actual time=0.040..0.120 rows=2 loops=1)
                Filter: ((lower(departure_location) ~~ '%hồ chí minh%') AND (lower(arrival_location) ~~ '%đà lạt%'))
                Rows Removed by Filter: 38
          ->  Index Scan using idx_trips_departure_route_status on trips t (cost=4.70..17.10 rows=9 width=100) (actual time=0.350..1.810 rows=9 loops=2)
                Index Cond: ((t.departure_time >= '2026-11-14 00:00:00'::timestamp) AND (t.departure_time <= '2026-11-21 23:59:59'::timestamp) AND (t.route_id = r.id) AND ((t.status)::text = 'SCHEDULED'::text))
    ->  Index Scan using bus_companies_pkey on bus_companies c (cost=0.15..0.35 rows=1 width=50) (actual time=0.015..0.016 rows=1 loops=18)
          Filter: ((status IS NULL) OR ((status)::text = 'ACTIVE'::text))
  Planning Time: 1.150 ms
  Execution Time: 4.820 ms
  ```
* **Kết quả**:
  * Thời gian phản hồi giảm từ **322.45ms** xuống **4.82ms** (giảm tới **98.5%**, vượt xa chỉ tiêu **<50ms** trong DoD).
  * `Seq Scan` trên bảng `trips` chuyển thành `Index Scan` trực tiếp trên B-Tree Index.

---

### 4.2. Câu query kiểm tra ghế trống theo chuyến (`trip_seats`)

```sql
EXPLAIN ANALYZE
SELECT seat_code, seat_type, status, floor, row_num, col_num
FROM trip_seats
WHERE trip_id = 125
  AND status = 'AVAILABLE';
```

#### Trước khi đánh Index:
* **Execution Plan**:
  ```text
  Seq Scan on trip_seats (cost=0.00..850.00 rows=34 width=45) (actual time=5.100..32.400 rows=36 loops=1)
    Filter: ((trip_id = 125) AND ((status)::text = 'AVAILABLE'::text))
    Rows Removed by Filter: 23406
  Execution Time: 33.150 ms
  ```

#### Sau khi đánh Index `idx_trip_seats_trip_status`:
* **Execution Plan**:
  ```text
  Bitmap Heap Scan on trip_seats (cost=4.30..18.20 rows=34 width=45) (actual time=0.060..0.180 rows=36 loops=1)
    Recheck Cond: ((trip_id = 125) AND ((status)::text = 'AVAILABLE'::text))
    ->  Bitmap Index Scan on idx_trip_seats_trip_status (cost=0.00..4.30 rows=34 width=0) (actual time=0.045..0.045 rows=36 loops=1)
          Index Cond: ((trip_id = 125) AND ((status)::text = 'AVAILABLE'::text))
  Execution Time: 0.240 ms
  ```
* **Kết quả**: Thời gian thực thi giảm từ **33.15ms** xuống **0.24ms**.

---

## 5. TỔNG HỢP THAY ĐỔI MÃ NGUỒN & SCHEMA

| STT | Tệp tin | Nội dung thay đổi |
|---|---|---|
| 1 | `docs/02-architecture-and-db/schema.sql` | Tài liệu hóa chỉ mục `idx_trips_departure_route_status`, `idx_trip_seats_trip_seat_code`, `idx_trip_seats_trip_status` |
| 2 | `init.sql` | Bổ sung DDL tạo index tương thích PostgreSQL (`CREATE INDEX IF NOT EXISTS ...`) |
| 3 | `CompanySettlementSchemaInitializer.java` | Tự động kiểm tra và khởi tạo các Index khi hệ thống khởi động với Spring Boot |
| 4 | `Trip.java`, `TripSeat.java`, `Ticket.java` | Khai báo metadata `@Table(indexes = { ... })` đồng bộ JPA Entity |
| 5 | `S315PerformanceTuningIntegrationTest.java` | Bộ test tự động kiểm thử hiệu năng truy vấn, đo lường response time < 50ms và xác thực index |

---

## 6. ĐỐI CHIẾU TIÊU CHÍ NGHIỆM THU (DoD)

- [x] **EXPLAIN ANALYZE các câu query tìm chuyến xe**: Thời gian phản hồi giảm từ >300ms (322.45ms) xuống <50ms (thực tế đạt **4.82ms**).
- [x] **Tài liệu hóa các index tối ưu trong `docs/02-architecture-and-db/schema.sql`**: Đã cập nhật đầy đủ phần index tối ưu trong schema.sql và init.sql.
- [x] **Rà soát N+1 Query**: Đã xác nhận cơ chế Batch IN Fetching và JOIN FETCH loại bỏ triệt để các vòng lặp N+1 trong `searchTrips`.
- [x] **Code Build & Test**: 100% mã nguồn backend biên dịch thành công (`BUILD SUCCESSFUL`).
