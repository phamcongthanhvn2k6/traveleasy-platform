# TÀI LIỆU ĐẶC TẢ RESTFUL API TRAVELEASY PLATFORM
## DANH MỤC 38 RESTFUL ENDPOINTS CHUẨN OPENAPI / SWAGGER 3.0
### MÃ DỰ ÁN: `PRJ-TRAVELEASY-MVP-01` | SPRING BOOT 3.3.4 (JAVA 21 LTS)

---

> **BASE URL:** `http://localhost:8080`  
> **SWAGGER UI INTERACTIVE CONSOLE:** `http://localhost:8080/swagger-ui.html`  
> **OPENAPI SCHEMA JSON:** `http://localhost:8080/v3/api-docs`  
> **CHUẨN PHẢN HỒI (STANDARD RESPONSE ENVELOPE):** Toàn bộ API đều đóng gói theo cấu trúc `ApiResponse<T>`:
```json
{
  "success": true,
  "code": 200,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-10-22T21:45:00Z"
}
```

---

## 1. PHÂN HỆ XÁC THỰC & TÀI KHOẢN (AUTHENTICATION & USER IDENTITY)

### 1.1 Đăng nhập hệ thống (Login)
* **Endpoint**: `POST /api/v1/auth/login`
* **Quyền hạn**: Public (Không yêu cầu Token)
* **Request Body**:
```json
{
  "email": "customer@gmail.com",
  "password": "Password123!"
}
```
* **Response 200 OK**:
```json
{
  "success": true,
  "code": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "user": {
      "id": "usr-cust-01",
      "fullName": "Nguyễn Văn Khách",
      "email": "customer@gmail.com",
      "phone": "0987654321",
      "role": "ROLE_CUSTOMER"
    }
  }
}
```
* **Lỗi thường gặp**: `401 Unauthorized` (Sai email hoặc mật khẩu), `400 Bad Request` (Email không đúng định dạng).

### 1.2 Đăng ký tài khoản khách hàng mới (Register)
* **Endpoint**: `POST /api/v1/auth/register`
* **Request Body**:
```json
{
  "fullName": "Trần Thị Lan",
  "email": "lan.tran@gmail.com",
  "phone": "0912345678",
  "password": "SecurePassword2026@"
}
```
* **Response 201 Created**: Trả về thông tin tài khoản đã tạo và tự động sinh mã định danh `usr-*`.

### 1.3 Lấy thông tin tài khoản hiện tại (Get Current User Profile)
* **Endpoint**: `GET /api/v1/auth/me`
* **Headers**: `Authorization: Bearer <accessToken>`
* **Response 200 OK**: Trả về chi tiết vai trò, số điện thoại, danh sách quyền hạn.

---

## 2. PHÂN HỆ KHÁCH HÀNG & ĐẶT VÉ TRỰC TUYẾN (CLIENT PORTAL)

### 2.1 Tìm kiếm chuyến xe đa tiêu chí (Search Trips with Dynamic Filters)
* **Endpoint**: `GET /api/v1/trips/search`
* **Query Parameters**:
  - `origin` (String, Required): Tên hoặc ID điểm xuất phát (ví dụ: `Sài Gòn`, `Hà Nội`).
  - `destination` (String, Required): Điểm đến (ví dụ: `Đà Lạt`, `Nha Trang`, `Sa Pa`).
  - `departureDate` (LocalDate, Required): Ngày đi định dạng `YYYY-MM-DD`.
  - `minPrice` / `maxPrice` (BigDecimal, Optional): Khoảng giá mong muốn.
  - `seatType` (Enum, Optional): `SLEEPER`, `LIMOUSINE`, `CABIN`.
  - `companyId` (String, Optional): Lọc theo nhà xe ưa thích.
* **Response 200 OK**:
```json
{
  "success": true,
  "data": [
    {
      "tripId": "trip-1",
      "route": "Sài Gòn ➔ Đà Lạt",
      "companyName": "Phương Trang (FUTA Bus Lines)",
      "departureTime": "2026-10-23T08:00:00",
      "arrivalTime": "2026-10-23T14:30:00",
      "duration": "6.5 giờ",
      "vehicleType": "Giường nằm Limousine VIP (34 phòng)",
      "fare": 290000,
      "availableSeats": 32,
      "totalSeats": 34,
      "pickupStation": "Bến xe Miền Tây",
      "dropoffStation": "Bến xe Liên tỉnh Đà Lạt"
    }
  ]
}
```

### 2.2 Xem chi tiết chuyến xe & Lộ trình ETA (Get Trip Details)
* **Endpoint**: `GET /api/v1/trips/{id}`
* **Response 200 OK**: Chi tiết tiện ích xe (WiFi, cổng sạc, nước uống) và mảng trạm dừng `points` kèm giờ ETA dự kiến.

### 2.3 Lấy sơ đồ 34 ghế Limousine 2 tầng (Get Trip Seat Map)
* **Endpoint**: `GET /api/v1/trips/{id}/seats`
* **Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "tripId": "trip-1",
    "floor1": [
      { "seatCode": "A01", "type": "STANDARD", "price": 290000, "status": "BOOKED" },
      { "seatCode": "A02", "type": "STANDARD", "price": 290000, "status": "BOOKED" },
      { "seatCode": "A03", "type": "STANDARD", "price": 290000, "status": "AVAILABLE" }
    ],
    "floor2": [
      { "seatCode": "B01", "type": "VIP", "price": 310000, "status": "AVAILABLE" }
    ]
  }
}
```

### 2.4 Tạo đơn đặt vé mới (Create Booking)
* **Endpoint**: `POST /api/v1/bookings`
* **Request Body**:
```json
{
  "tripId": "trip-1",
  "seatCodes": ["A03", "A04"],
  "customerName": "Lê Hoàng Nam",
  "customerPhone": "0901234567",
  "customerEmail": "nam.le@gmail.com",
  "pickupPointId": "pnt-sg-01",
  "dropoffPointId": "pnt-dl-01",
  "paymentMethod": "VIETQR"
}
```
* **Response 201 Created**:
```json
{
  "success": true,
  "data": {
    "bookingCode": "BK-20261023-8821",
    "totalAmount": 580000,
    "status": "PENDING_PAYMENT",
    "paymentDeadline": "2026-10-22T22:05:00Z"
  }
}
```

### 2.5 Tra cứu đơn vé (Lookup Booking by Code or Phone)
* **Endpoint**: `GET /api/v1/bookings/code/{bookingCode}`
* **Endpoint**: `GET /api/v1/bookings/my-bookings` (Có JWT Customer)
* **Response 200 OK**: Toàn bộ thông tin lịch trình, ghế, trạng thái thanh toán và mã QR.

### 2.6 Hủy vé & Hủy vé một phần (Cancel Booking / Partial Cancellation)
* **Endpoint**: `POST /api/v1/bookings/{id}/cancel`
* **Endpoint**: `POST /api/v1/bookings/{id}/cancel-partial`
* **Request Body (Hủy một phần)**:
```json
{
  "ticketIds": ["tkt-10293"],
  "cancellationReason": "Bận việc gia đình đột xuất"
}
```
* **Response 200 OK**: Áp dụng quy tắc khấu trừ theo bảng `cancellation_policy_rules`, giải phóng ghế về `AVAILABLE`, hoàn tiền phần còn lại.

### 2.7 Khởi tạo thanh toán & Xác nhận giao dịch (Payment Initiate & Confirm)
* **Endpoint**: `POST /api/v1/payments/initiate`
* **Endpoint**: `POST /api/v1/payments/confirm-transfer/{bookingCode}`
* **Endpoint**: `POST /api/v1/payments/mock-success/{bookingCode}` (Hỗ trợ demo nghiệm thu)
* **Response 200 OK**: Chuyển trạng thái đơn vé sang `PAID`/`CONFIRMED`, xuất vé điện tử.

---

## 3. PHÂN HỆ ĐIỀU HÀNH NHÀ XE ĐỐI TÁC (PARTNER OPERATOR PORTAL)

Toàn bộ các API trong nhóm này yêu cầu Header `Authorization: Bearer <token>` có vai trò `ROLE_OPERATOR` hoặc `ROLE_ADMIN`:

| Method | Đường dẫn Endpoint | Chức năng nghiệp vụ |
|:---:|:---|:---|
| `GET` | `/api/v1/company/dashboard/stats` | Thống kê số chuyến hôm nay, tổng vé đã bán và doanh thu thực nhận |
| `GET` | `/api/v1/company/trips` | Truy vấn danh sách chuyến xe thuộc nhà xe |
| `POST` | `/api/v1/company/trips` | Tạo chuyến xe mới (Hệ thống tự động sinh 34 ghế 2 tầng) |
| `PATCH`| `/api/v1/company/trips/{id}/status`| Chuyển trạng thái chuyến (`SCHEDULED` ➔ `DEPARTED` ➔ `COMPLETED` ➔ `CANCELLED`)|
| `GET` | `/api/v1/company/vehicles` | Quản lý đội xe: biển số, loại xe, số ghế, hạn đăng kiểm |
| `POST` | `/api/v1/company/vehicles` | Thêm mới phương tiện vận tải vào đội xe |
| `GET` | `/api/v1/company/routes` | Danh sách tuyến đường nhà xe đang khai thác |
| `POST` | `/api/v1/company/routes` | Thêm tuyến đường và cấu hình trạm dừng |
| `GET` | `/api/v1/company/bookings` | Danh sách hành khách đã đặt vé trên các chuyến của nhà xe |
| `GET` | `/api/v1/company/reviews` | Xem đánh giá của khách hàng và gửi phản hồi trả lời |

---

## 4. PHÂN HỆ QUẢN TRỊ TỔNG THỂ HỆ THỐNG (SYSTEM ADMIN PORTAL)

Toàn bộ các API yêu cầu Header `Authorization: Bearer <token>` có vai trò `ROLE_ADMIN`:

### 4.1 Thống kê Dashboard KPI Toàn hệ thống
* **Endpoint**: `GET /api/v1/admin/dashboard/stats`
* **Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "totalTrips": 12,
    "activeTrips": 8,
    "totalBookings": 156,
    "totalRevenue": 45240000,
    "activeCompanies": 4,
    "totalUsers": 340
  }
}
```

### 4.2 Danh mục Quản trị Cốt lõi
* **Quản trị Chuyến xe**:
  - `GET /api/v1/admin/trips`: Danh sách toàn bộ chuyến xe liên tỉnh trên hệ thống.
  - `POST /api/v1/admin/trips`: Điều phối lịch trình mới cho mọi nhà xe đối tác.
  - `PUT /api/v1/admin/trips/{id}` & `DELETE /api/v1/admin/trips/{id}`.
* **Quản trị Đối tác Nhà xe**:
  - `GET /api/v1/admin/bus-companies` & `POST /api/v1/admin/bus-companies`.
  - `PATCH /api/v1/admin/bus-companies/{id}/status`: Kích hoạt hoặc tạm ngưng hợp tác (`ACTIVE` / `INACTIVE`).
* **Quản trị Người dùng & Phân quyền RBAC**:
  - `GET /api/v1/admin/users`: Danh sách tất cả tài khoản trong hệ thống.
  - `PUT /api/v1/admin/users/{id}` & `PATCH /api/v1/admin/users/{id}/status`.
* **Cấu hình Chính sách Hủy vé & Giá vé**:
  - `GET /api/v1/admin/cancellation-policies` & `POST /api/v1/admin/cancellation-policies`.
* **Nhật ký Vết Audit Log (Audit Trail)**:
  - `GET /api/v1/admin/audit-logs`: Truy xuất lịch sử thay đổi cấu hình, tạo chuyến, cập nhật trạng thái đơn vé kèm thời gian, địa chỉ IP và mã nhân sự thực hiện.

---

## 5. BẢNG MÃ LỖI CHUẨN HỆ THỐNG (ERROR CODES & HTTP STATUS)

| HTTP Code | Error Code | Ý nghĩa & Nguyên nhân |
|:---:|:---|:---|
| `400` | `INVALID_INPUT` | Tham số gửi lên không đúng định dạng hoặc thiếu trường bắt buộc. |
| `401` | `UNAUTHORIZED` | Không có JWT Token hoặc Token đã hết hạn / không hợp lệ. |
| `403` | `FORBIDDEN` | Tài khoản không có đủ quyền hạn truy cập tài nguyên (ví dụ Customer vào Admin). |
| `404` | `RESOURCE_NOT_FOUND` | Không tìm thấy Chuyến xe, Ghế, Đơn vé hoặc Người dùng theo ID. |
| `409` | `SEAT_ALREADY_LOCKED` | Ghế đã có người khác giữ chỗ hoặc đã bán thành công (Overbooking Protection). |
| `422` | `CANCELLATION_DEADLINE_EXCEEDED`| Thời gian yêu cầu hủy vé dưới 12 giờ trước giờ khởi hành (0% hoàn tiền). |
| `500` | `INTERNAL_SERVER_ERROR` | Lỗi máy chủ không xác định, được ghi vết chi tiết vào nhật ký Logback. |
