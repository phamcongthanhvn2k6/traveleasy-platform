# ĐẶC TẢ CHI TIẾT LUỒNG NGHIỆP VỤ BỔ SUNG SPRINT 3 (VẬN HÀNH NÂNG CAO)
**Dự án:** TravelEasy Platform — Nền Tảng Đặt Vé & Quản Lý Nhà Xe Liên Tỉnh  
**Phân hệ:** Cổng Đối Tác Nhà Xe (TravelEasy Partner Portal)  
**Tài liệu:** Đặc tả Kỹ thuật & Nghiệp vụ (SRS & Technical Specification)  
**Phiên bản:** 3.1.0  
**Tác giả:** Nhóm 7 (Phạm Công Thành - Lead, Trần Minh Đức, Đoàn Nhật Cường, Nguyễn Đại Phát)

---

## MỤC LỤC
1. [Tổng Quan Kiến Trúc & Nguyên Tắc Không Xung Đột (Zero-Conflict)](#1-tổng-quan-kiến-trúc--nguyên-tắc-không-xung-đột)
2. [Đặc Tả Chi Tiết 6 Luồng Nghiệp Vụ Mới](#2-đặc-tả-chi-tiết-6-luồng-nghiệp-vụ-mới)
   * [2.1. Luồng S316: Đổi Vé, Đổi Giờ Chạy & Chuyển Ghế Linh Hoạt](#21-luồng-s316-đổi-vé-đổi-giờ-chạy--chuyển-ghế-linh-hoạt)
   * [2.2. Luồng S317: Xe Trung Chuyển Đón Khách Tận Nhà](#22-luồng-s317-xe-trung-chuyển-đón-khách-tận-nhà)
   * [2.3. Luồng S318: Quản Lý Chi Phí Chuyến Xe & Lợi Nhuận Ròng (P&L)](#23-luồng-s318-quản-lý-chi-phí-chuyến-xe--lợi-nhuận-ròng-pl)
   * [2.4. Luồng S319: Phân Công Tổ Lái & Kiểm Soát An Toàn GTVT](#24-luồng-s319-phân-công-tổ-lái--kiểm-soát-an-toàn-gtvt)
   * [2.5. Luồng S320: Ứng Dụng Web Mobile Quét QR Soát Vé Cho Phụ Xe](#25-luồng-s320-ứng-dụng-web-mobile-quét-qr-soát-vé-cho-phụ-xe)
   * [2.6. Luồng S321: Chính Sách Biểu Phí & Tính Tiền Hoàn Hủy Vé](#26-luồng-s321-chính-sách-biểu-phí--tính-tiền-hoàn-hủy-vé)
3. [Mô Hình Dữ Liệu Thực Thể & DDL 4 Bảng Mới](#3-mô-hình-dữ-liệu-thực-thể--ddl-4-bảng-mới)
4. [Rà Soát Rủi Ro Xung Đột & Cơ Chế Phòng Vệ (Defense In Depth)](#4-rà-soát-rủi-ro-xung-đột--cơ-chế-phòng-vệ)

---

## 1. TỔNG QUAN KIẾN TRÚC & NGUYÊN TẮC KHÔNG XUNG ĐỘT

Để đảm bảo 4 thành viên cùng phát triển đồng thời trên nhánh `dev` mà không xảy ra xung đột mã nguồn:
1. **Chuẩn hóa Router 2 cấp phẳng:** Tuyệt đối không dùng router 3-4 cấp (`/company/tickets/reschedule` ➔ đổi thành `/company/ticket-exchange`).
2. **Nguyên tắc phân lập File (File Ownership):**
   * Mỗi thành viên sở hữu Page Component riêng trong `frontend/src/pages/company/...`
   * Mỗi thành viên sở hữu Controller riêng trong `backend/src/main/java/com/traveleasy/controller/...`
   * Toàn bộ Router và Sidebar đã được khởi tạo sẵn một lần duy nhất, cấm thành viên tự ý sửa lại file router trung tâm (`App.tsx`, `CompanyRoutes.tsx`).
3. **Quản lý CSDL tập trung:** CSDL Supabase PostgreSQL do Trưởng nhóm (Phạm Công Thành) quản trị. Các bảng, khóa ngoại và dữ liệu mẫu đã được nạp sẵn, các thành viên chỉ việc gọi API để truy xuất và cập nhật.

---

## 2. ĐẶC TẢ CHI TIẾT 6 LUỒNG NGHIỆP VỤ MỚI

### 2.1. Luồng S316: Đổi Vé, Đổi Giờ Chạy & Chuyển Ghế Linh Hoạt
* **Tác giả:** Trần Minh Đức (`tranduc2601`)
* **Endpoint API:** `POST /api/v1/company/ticket-exchange/confirm`
* **Router Frontend:** `/company/ticket-exchange`
* **Bảng CSDL liên quan:** `tickets`, `trip_seats`, `trips`, `ticket_exchange_logs`

#### Luồng xử lý chi tiết (Business Workflow):
1. **Bước 1 (Tra cứu):** Nhân viên nhập mã vé (`ticket_code`). Hệ thống validate:
   * Vé phải có trạng thái `ISSUED` (chưa lên xe, chưa hủy).
   * Chuyến xe hiện tại chưa xuất bến (`departure_time > NOW() + 60 minutes`).
2. **Bước 2 (Chọn ghế mới):** Chọn chuyến xe mới (cùng tuyến hoặc tuyến tương đương) và chọn vị trí ghế mới (`new_seat_code`).
3. **Bước 3 (Khóa ghế tạm thời):** Ghế mới trên chuyến mới được chuyển sang `BOOKED` tạm thời để tránh người khác đặt mất.
4. **Bước 4 (Tính chênh lệch giá):**
   $$\Delta P = \text{Giá vé mới} - \text{Giá vé cũ}$$
   * Nếu $\Delta P > 0$: Yêu cầu thu thêm tiền mặt (COD) hoặc QR từ khách hàng.
   * Nếu $\Delta P < 0$: Sinh phiếu hoàn tiền thừa cho khách.
   * Nếu $\Delta P = 0$: Đổi ngang giá miễn phí.
5. **Bước 5 (Ghi nhận Database nguyên tử `@Transactional`):**
   * Chuyển vé cũ sang trạng thái `CANCELLED_FOR_EXCHANGE`.
   * Nhả ghế cũ trên chuyến cũ sang `AVAILABLE`.
   * Tạo bản ghi vé mới gắn với ghế mới, trạng thái `ISSUED`.
   * Ghi log vào bảng `ticket_exchange_logs`.

---

### 2.2. Luồng S317: Xe Trung Chuyển Đón Khách Tận Nhà
* **Tác giả:** Trần Minh Đức (`tranduc2601`)
* **Endpoint API:** `GET /api/v1/company/shuttles/requests`, `PATCH /api/v1/company/shuttles/requests/{id}/status`
* **Router Frontend:** `/company/shuttles`
* **Bảng CSDL liên quan:** `shuttle_requests`, `trips`, `bookings`

#### Luồng xử lý chi tiết:
1. Khách hàng khi đặt vé online có tick chọn checkbox: *"Yêu cầu xe trung chuyển đón tận nhà"* và nhập địa chỉ chi tiết.
2. Hệ thống tự động tạo bản ghi trong `shuttle_requests` với trạng thái `PENDING`.
3. Điều phối viên nhà xe mở trang `/company/shuttles`:
   * Lọc danh sách khách theo mốc giờ xuất bến của xe lớn.
   * Gán xe 16 chỗ (biển số) và tài xế trung chuyển phụ trách.
   * Tính giờ đón dự kiến trước giờ xe lớn chạy 45 - 60 phút.
4. Tài xế trung chuyển cập nhật trạng thái khi đón: `PENDING` ➔ `PICKING_UP` (Đang đón) ➔ `ARRIVED_TERMINAL` (Đã đưa khách đến bến an toàn).

---

### 2.3. Luồng S318: Quản Lý Chi Phí Chuyến Xe & Lợi Nhuận Ròng (Trip P&L)
* **Tác giả:** Trần Minh Đức (`tranduc2601`)
* **Endpoint API:** `GET /api/v1/company/expenses/trips/{tripId}`, `POST /api/v1/company/expenses/trips/{tripId}`
* **Router Frontend:** `/company/expenses`
* **Bảng CSDL liên quan:** `trip_expenses`, `trips`, `tickets`, `cargo_orders`

#### Công thức tính toán P&L (Profit & Loss):
$$\text{Tổng Doanh Thu} = \sum (\text{Giá vé đã bán}) + \sum (\text{Cước hàng ký gửi})$$
$$\text{Tổng Chi Phí} = \text{Tiền dầu} + \text{Phí BOT cầu đường} + \text{Công tài xế} + \text{Phí bến bãi} + \text{Khác}$$
$$\text{Lợi Nhuận Ròng (Net Profit)} = \text{Tổng Doanh Thu} - \text{Tổng Chi Phí}$$
$$\text{Tỷ Suất Lợi Nhuận (\%)} = \frac{\text{Lợi Nhuận Ròng}}{\text{Tổng Doanh Thu}} \times 100$$
* Cảnh báo tự động: Nếu Lợi nhuận ròng $< 0$ (chuyến xe chạy rỗng/lỗ), hệ thống hiển thị cảnh báo đỏ và tỷ lệ lấp đầy ghế để nhà xe cân nhắc gom chuyến hoặc điều chỉnh giá vé động.

---

### 2.4. Luồng S319: Phân Công Tổ Lái & Kiểm Soát An Toàn GTVT
* **Tác giả:** Đoàn Nhật Cường (`CuongLiam`)
* **Endpoint API:** `GET /api/v1/company/crew/assignments`, `POST /api/v1/company/crew/assignments`
* **Router Frontend:** `/company/crew`
* **Bảng CSDL liên quan:** `trip_crews`, `trips`, `vehicles`

#### Quy chuẩn an toàn bắt buộc:
1. **Kiểm tra trùng lịch:** Một tài xế không được phân công vào 2 chuyến xe có khung giờ đè lên nhau:
   $$[\text{Dep}_A, \text{Arr}_A] \cap [\text{Dep}_B, \text{Arr}_B] \neq \emptyset \implies \text{ERROR: Tài xế đang chạy chuyến khác!}$$
2. **Quy định đổi lái:** Tuyến đường có cự ly $> 300\text{km}$ hoặc thời gian di chuyển $> 4\text{ giờ}$ bắt buộc phải có **Tài xế 2 (Đổi lái)**.
3. **Cảnh báo vi phạm:** Cảnh báo đỏ nếu tổng thời gian lái của 1 tài xế trong ngày vượt quá $10\text{ giờ}$.

---

### 2.5. Luồng S320: Ứng Dụng Web Mobile Quét QR Soát Vé Cho Phụ Xe
* **Tác giả:** Đoàn Nhật Cường (`CuongLiam`)
* **Endpoint API:** `POST /api/v1/conductor/scanner/verify-ticket`
* **Router Frontend:** `/conductor/scanner`
* **Bảng CSDL liên quan:** `tickets`, `trips`

#### Luồng quét vé (Real-time Scan):
1. Phụ xe mở trình duyệt trên điện thoại truy cập `/conductor/scanner`.
2. Camera quét mã QR in trên vé giấy hoặc hiển thị trên điện thoại của khách hàng (chuỗi QR mã hóa dạng `QR-CT-xxx-xxx`).
3. Backend kiểm tra:
   * Vé có thuộc chuyến xe hiện tại không?
   * Vé có trạng thái là `ISSUED` không?
4. **Phản hồi:**
   * ✅ **Hợp lệ:** Chuyển trạng thái vé từ `ISSUED` sang `USED`, cập nhật thời gian soát vé `printed_at = NOW()`, phát âm thanh "Bíp" thành công, hiển thị tên khách và số ghế màu xanh.
   * ❌ **Lỗi:** Nếu vé đã quét trước đó (`USED`) hoặc sai chuyến/sai ngày ➔ Phát âm thanh cảnh báo lỗi và viền màn hình chớp đỏ.

---

### 2.6. Luồng S321: Chính Sách Biểu Phí & Tính Tiền Hoàn Hủy Vé
* **Tác giả:** Nguyễn Đại Phát (`daiphat`)
* **Endpoint API:** `GET /api/v1/company/refunds/rules`, `POST /api/v1/company/refunds/calculate`
* **Router Frontend:** `/company/refunds`
* **Bảng CSDL liên quan:** `cancellation_policies`, `tickets`, `bookings`

#### Bảng tỷ lệ hoàn tiền mẫu theo quy định:
| Mốc thời gian trước giờ xuất bến | Tỷ lệ khấu trừ phí hủy | Tỷ lệ hoàn trả khách | Trạng thái ghi nhận |
| :--- | :---: | :---: | :--- |
| $> 24\text{ giờ}$ | **10%** | **90%** | Duyệt hoàn tiền tự động |
| $12 - 24\text{ giờ}$ | **30%** | **70%** | Duyệt hoàn tiền tự động |
| $2 - 12\text{ giờ}$ | **50%** | **50%** | Chờ quản lý nhà xe duyệt |
| $< 2\text{ giờ}$ hoặc sau giờ xuất bến | **100%** | **0%** | Từ chối hoàn tiền |

---

## 3. MÔ HÌNH DỮ LIỆU THỰC THỂ & DDL 4 BẢNG MỚI

```sql
-- 1. Bảng Tổ Lái Chuyến Xe
CREATE TABLE public.trip_crews (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    trip_id BIGINT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    bus_company_id BIGINT NOT NULL REFERENCES public.bus_companies(id) ON DELETE CASCADE,
    primary_driver_name VARCHAR(100) NOT NULL,
    primary_driver_phone VARCHAR(20) NOT NULL,
    primary_driver_license VARCHAR(50),
    secondary_driver_name VARCHAR(100),
    secondary_driver_phone VARCHAR(20),
    conductor_name VARCHAR(100),
    conductor_phone VARCHAR(20),
    continuous_drive_hours NUMERIC(4,1) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'COMPLIANT' NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_trip_crews_trip UNIQUE (trip_id)
);

-- 2. Bảng Yêu Cầu Xe Trung Chuyển
CREATE TABLE public.shuttle_requests (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    bus_company_id BIGINT NOT NULL REFERENCES public.bus_companies(id) ON DELETE CASCADE,
    booking_id BIGINT REFERENCES public.bookings(id) ON DELETE SET NULL,
    passenger_name VARCHAR(100) NOT NULL,
    passenger_phone VARCHAR(20) NOT NULL,
    pickup_address VARCHAR(255) NOT NULL,
    main_trip_id BIGINT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    shuttle_pickup_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    assigned_vehicle_plate VARCHAR(30),
    shuttle_driver_name VARCHAR(100),
    status VARCHAR(30) DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Bảng Sổ Chi Phí Vận Hành
CREATE TABLE public.trip_expenses (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    trip_id BIGINT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    bus_company_id BIGINT NOT NULL REFERENCES public.bus_companies(id) ON DELETE CASCADE,
    fuel_cost NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    toll_bot_cost NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    driver_salary NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    terminal_fee NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    other_costs NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_trip_expenses_trip UNIQUE (trip_id)
);

-- 4. Bảng Nhật Ký Đổi Vé
CREATE TABLE public.ticket_exchange_logs (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    bus_company_id BIGINT NOT NULL REFERENCES public.bus_companies(id) ON DELETE CASCADE,
    original_ticket_id BIGINT NOT NULL REFERENCES public.tickets(id),
    new_ticket_id BIGINT REFERENCES public.tickets(id),
    old_trip_id BIGINT NOT NULL REFERENCES public.trips(id),
    new_trip_id BIGINT NOT NULL REFERENCES public.trips(id),
    old_seat_code VARCHAR(20) NOT NULL,
    new_seat_code VARCHAR(20) NOT NULL,
    price_difference NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    surcharge_paid NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    refund_returned NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    performed_by_user_id BIGINT REFERENCES public.users(id),
    reason TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

---

## 4. RÀ SOÁT RỦI RO XUNG ĐỘT & CƠ CHẾ PHÒNG VỆ

### 4.1. Rủi ro xung đột kho ghế khi Đổi Vé (Exchange Race Condition)
* **Nguy cơ:** Khi khách hàng A đang thực hiện đổi sang ghế `B02` của chuyến khác, đồng thời khách hàng B ngoài website cũng đang bấm mua ghế `B02`. Nếu không khóa nguyên tử, 2 khách sẽ mua trùng 1 ghế.
* **Cơ chế phòng vệ:** Áp dụng khóa lạc quan `@Version` trên thực thể `TripSeat` hoặc khóa bi quan `PESSIMISTIC_WRITE` khi thực hiện câu lệnh chuyển ghế:
  ```sql
  SELECT * FROM trip_seats WHERE trip_id = :newTripId AND seat_code = :newSeatCode FOR UPDATE;
  ```

### 4.2. Rủi ro gian lận Quét Mã QR Soát Vé (Replay Attack)
* **Nguy cơ:** Khách hàng chụp ảnh màn hình mã QR gửi cho bạn bè, 2 người cùng cầm mã QR lên xe ở 2 cửa khác nhau.
* **Cơ chế phòng vệ:** Khi quét mã QR lần đầu tiên, trường `status` đổi ngay sang `USED` và trường `is_printed` chuyển sang `true`. Lần quét thứ 2 ngay lập tức bị từ chối với thông báo: *"CẢNH BÁO: Vé này đã được check-in lúc [HH:mm:ss]!"*.

### 4.3. Rủi ro sai lệch Sổ sách Đối Soát Doanh Thu (Settlement Integrity)
* **Nguy cơ:** Khi vé bị hủy hoặc đổi có phụ thu, nếu bảng đối soát `settlement_records` không cập nhật lại, tổng tiền chuyển khoản cho nhà xe cuối tháng sẽ bị sai lệch.
* **Cơ chế phòng vệ:** Khi vé đổi hoặc hủy thành công, hệ thống tự động bắn Event `TICKET_STATUS_CHANGED` để Service đối soát tính toán lại trường `net_payable` của kỳ thanh toán hiện hành.
