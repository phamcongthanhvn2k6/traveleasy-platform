# 🔍 BÁO CÁO RÀ SOÁT LỖ HỔNG NGHIỆP VỤ & XUNG ĐỘT LOGIC HỆ THỐNG (SPRINT 3 AUDIT)
> **Dự án**: Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy (`traveleasy-platform`)  
> **Giai đoạn**: Rà soát & Thẩm định Toàn vẹn Hệ thống Sprint 3 (System Integrity & Logic Audit)  
> **Người thực hiện rà soát**: Phạm Công Thành (Team Leader & System Architect)  
> **Mục tiêu**: Nhận diện sớm các "bẫy" nghiệp vụ, rủi ro lệch dòng tiền, tranh chấp dữ liệu đồng thời và lỗi trạng thái (State Desynchronization) khi đưa 8 tính năng mới vào vận hành.

---

## 📌 TỔNG HỢP 8 LỖ HỔNG LOGIC & XUNG ĐỘT NGHIỆP VỤ PHÁT HIỆN ĐƯỢC

| Mã Lỗ Hổng | Tên Lỗ Hổng / Điểm Nghẽn Logic | Mức Độ | Module Tương Tác | Hậu Quả Thực Tế |
| :---: | :--- | :---: | :--- | :--- |
| **BUG-NEW-01** | **Mất dấu trạng thái khi Đổi vé (Ghost Ticket vs Cancelled)** | **CRITICAL** | `S316` (Đổi vé) $\leftrightarrow$ `S311` (Đối soát) $\leftrightarrow$ `/my-tickets` | Vé cũ bị set `CANCELLED` khiến khách tưởng bị hủy vé; hệ thống đối soát tính nhầm thành tiền hoàn cho khách. |
| **BUG-NEW-02** | **Xung đột Concurrency: Đổi vé nhưng không Lock ghế chuyến mới** | **CRITICAL** | `S316` (Đổi vé) $\leftrightarrow$ `S301` (Lock ghế) $\leftrightarrow$ `TripSeat` | Khách đang đổi sang ghế B02 chuyến mới thì khách online khác cướp mất ghế B02; giao dịch rơi vào trạng thái lơ lửng. |
| **BUG-NEW-03** | **Lệch Quỹ Đối Soát do Tiền Phạt Hủy Vé (Cancellation Fee Split)** | **HIGH** | `S321` (Hoàn hủy) $\leftrightarrow$ `S311` (Ví nhà xe) $\leftrightarrow$ `settlement_records` | Khách hủy vé mất phí phạt 30%. Sàn và Nhà xe không có quy chế phân chia tiền phạt $\rightarrow$ Lệch số dư ví đối soát. |
| **BUG-NEW-04** | **Lệch bộ đếm `availableSeats` trên bảng `trips` (Drifted Seats)** | **HIGH** | `BookingService` $\leftrightarrow$ `S316` $\leftrightarrow$ `S321` | Khi hủy hoặc đổi vé, ghế được nhả về `AVAILABLE` nhưng `availableSeats` trên bảng `trips` không cập nhật đồng bộ. |
| **BUG-NEW-05** | **Phụ xe mất mạng 4G không soát được vé QR (Offline Blindspot)** | **HIGH** | `S320` (Soát vé QR) $\leftrightarrow$ Hiện trường bến xe | Xe chạy vùng đèo dốc hoặc tầng hầm bến xe mất sóng, phụ xe không thể gọi API xác thực vé online $\rightarrow$ Ùn tắc cửa xe. |
| **BUG-NEW-06** | **Vi phạm Pháp lý An toàn GTVT khi phân công 1 tài xế tuyến dài** | **MEDIUM** | `S319` (Tổ lái) $\leftrightarrow$ `S322` (Lệnh GTVT) $\leftrightarrow$ Nghị định 10/2020 | Tuyến đường > 500km (> 8 tiếng) nhưng hệ thống cho phép chỉ gán 1 tài xế $\rightarrow$ Xe bị CSGT xử phạt và đình chỉ xuất bến. |
| **BUG-NEW-07** | **Đón trả Trung chuyển bất khả thi về mặt địa lý & thời gian** | **MEDIUM** | `S317` (Trung chuyển) $\leftrightarrow$ `Trip.departureTime` | Khách đặt đón cách bến xe 25km trước giờ chạy 30 phút $\rightarrow$ Xe trung chuyển không thể đưa khách đến kịp giờ xuất bến. |
| **BUG-NEW-08** | **Gian lận Chi phí Lãi/Lỗ sau khi Chuyến xe đã kết toán** | **LOW** | `S318` (Chi phí P&L) $\leftrightarrow$ `S311` (Chốt kỳ đối soát) | Chuyến xe đã chạy xong và chốt tiền từ tuần trước nhưng nhân viên vẫn vào sửa tăng chi phí xăng dầu để bòn rút quỹ. |

---

## 🔬 PHÂN TÍCH CHI TIẾT TỪNG LỖ HỔNG & GIẢI PHÁP KHẮC PHỤC

---

### 🚨 LỖ HỔNG 1: Mất Dấu Trạng Thái Khi Đổi Vé (`TicketStatus.EXCHANGED`)
* **Vị trí ảnh hưởng**: `backend/src/main/java/com/traveleasy/entity/TicketStatus.java` và luồng `POST /api/v1/company/ticket-exchange`.
* **Hiện trạng logic**:
  Trong Entity `TicketStatus` hiện tại chỉ có 3 trạng thái: `ISSUED`, `USED`, `CANCELLED`.
  Khi thực hiện đổi vé (`S316`), nếu lập trình viên tái sử dụng trạng thái `CANCELLED` cho vé cũ:
  1. Trang "Vé của tôi" (`/my-tickets`) của khách hàng sẽ hiển thị vé cũ màu đỏ với chữ: **"VÉ ĐÃ HỦY"**, gây hoang mang cho hành khách.
  2. Module đối soát tài chính (`S311`) sẽ quét các vé `CANCELLED` và hiểu nhầm đây là vé khách hủy để hoàn tiền, dẫn đến trừ tiền ví nhà xe sai lệch.
* **Giải pháp khắc phục triệt để**:
  1. Bổ sung trạng thái `EXCHANGED` vào `TicketStatus`:
     ```java
     public enum TicketStatus {
         ISSUED,
         USED,
         CANCELLED,
         EXCHANGED // <-- Vé đã được đổi sang chuyến khác
     }
     ```
  2. Bảng `ticket_exchange_logs` phải lưu cặp khóa ngoại liên kết 2 chiều: `old_ticket_id` và `new_ticket_id`.
  3. Khi khách xem lịch sử vé, vé cũ hiển thị tag màu tím: **"Đã đổi sang mã vé: TK-NEW-XXXX"** kèm nút bấm xem vé mới.

---

### 🚨 LỖ HỔNG 2: Xung Đột Concurrency Khi Đổi Vé Sang Chuyến Mới
* **Vị trí ảnh hưởng**: `CompanyTicketExchangeController.java` $\leftrightarrow$ `SeatRealtimeService` $\leftrightarrow$ `TripSeatRepository`.
* **Kịch bản lỗi (Race Condition)**:
  1. Khách A muốn đổi từ chuyến 696 sang ghế `B02` của chuyến 697.
  2. Nhân viên quầy đang thao tác form đổi vé trên màn hình (mất 30-45 giây để kiểm tra và thu tiền phụ thu).
  3. Cùng lúc đó, khách B đang lướt web trên điện thoại bấm mua luôn ghế `B02` của chuyến 697.
  4. Nhân viên quầy bấm nút "Xác nhận đổi vé":
     - Nếu hệ thống không dùng Concurrency Lock, cả khách A và khách B đều được cấp vé cho ghế `B02` $\rightarrow$ **Trùng vé nghiêm trọng (Double-booking)**!
     - Nếu hệ thống báo lỗi nửa chừng, vé cũ của khách A đã bị hủy nhưng vé mới không tạo được $\rightarrow$ **Khách A mất trắng chỗ ngồi**!
* **Giải pháp khắc phục triệt để**:
  1. Áp dụng quy trình 2 pha (Two-Phase Exchange Transaction):
     - **Pha 1**: Khi chọn ghế mới trên chuyến mới, hệ thống phải gọi hàm `seatRealtimeService.holdSeat(...)` để khóa ghế mới trong 5 phút (màu Vàng).
     - **Pha 2**: Thao tác đổi vé phải đặt trong một `@Transactional(isolation = Isolation.SERIALIZABLE)`. Cả việc giải phóng ghế cũ và xác nhận ghế mới phải nằm trong cùng 1 database transaction. Nếu có lỗi, rollback 100%.

---

### 🚨 LỖ HỔNG 3: Lệch Quỹ Đối Soát Do Tiền Phạt Hủy Vé (`S321` vs `S311`)
* **Vị trí ảnh hưởng**: `cancellation_policies`, `settlement_records`, `BookingService.java`.
* **Kịch bản lỗi dòng tiền**:
  - Khách mua vé 200,000 VNĐ qua cổng thanh toán (tiền vào tài khoản trung gian của Sàn).
  - Khách hủy vé trước giờ chạy 18 tiếng. Theo quy chế: Phí phạt hủy là 30% (60,000 VNĐ), hoàn lại cho khách 70% (140,000 VNĐ).
  - Vấn đề: **Số tiền 60,000 VNĐ tiền phạt hủy sẽ được hạch toán cho ai?**
    - Nếu Sàn giữ trọn 60k: Nhà xe bị thiệt hại vì xe chạy ghế trống mà không được bồi thường.
    - Nếu Nhà xe nhận trọn 60k: Sàn mất phí vận hành cổng thanh toán và phí xử lý hoàn tiền.
* **Quy tắc chuẩn hóa nghiệp vụ sàn TMĐT**:
  - Tiền phạt hủy vé (60,000 VNĐ) được phân bổ theo tỷ lệ chuẩn:
    - **Nhà xe nhận 80%** tiền phạt ($48,000$ VNĐ) để bù đắp chi phí cơ hội ghế trống.
    - **Sàn nhận 20%** tiền phạt ($12,000$ VNĐ) làm phí dịch vụ hủy vé.
  - Bảng `settlement_records` phải có thêm cột: `cancellation_penalty_revenue` để ghi nhận khoản thu này vào kỳ đối soát ngày 01 và 15 hàng tháng.

---

### 🚨 LỖ HỔNG 4: Lệch Số Lượng Ghế Trống (`availableSeats` Drift)
* **Vị trí ảnh hưởng**: Bảng `trips(available_seats)` và `trip_seats(status)`.
* **Nguyên nhân cốt lõi**:
  - Hiện tại, bảng `trips` có cột `available_seats` lưu số nguyên (ví dụ: 34), trong khi bảng `trip_seats` có 34 dòng ghế con (`AVAILABLE`, `BOOKED`, `LOCKED`).
  - Khi code thao tác đổi vé (`S316`) hoặc hủy vé (`S321`), nếu lập trình viên chỉ cập nhật:
    `seat.setStatus(SeatStatus.AVAILABLE);`
    mà quên gọi:
    `trip.setAvailableSeats(trip.getAvailableSeats() + 1);`
    hoặc cập nhật đồng thời nhiều thread không có `@Version` / Lock, thì số ghế hiển thị trên danh sách tìm kiếm chuyến xe sẽ bị **lệch hoàn toàn** so với sơ đồ ghế thực tế.
* **Giải pháp khắc phục triệt để**:
  1. Tạo Trigger tự động trong Supabase PostgreSQL hoặc viết một hàm tiện ích duy nhất `syncTripAvailableSeats(Long tripId)`:
     ```sql
     UPDATE trips 
     SET available_seats = (
         SELECT COUNT(*) 
         FROM trip_seats 
         WHERE trip_id = trips.id AND status = 'AVAILABLE'
     )
     WHERE id = :tripId;
     ```
  2. Bất kỳ khi nào có giao dịch Đặt vé, Hủy vé, Đổi vé hoàn tất, luôn thực thi câu lệnh đồng bộ này.

---

### 🚨 LỖ HỔNG 5: Điểm Mù Ngoại Tuyến Khi Quét QR Soát Vé (`S320`)
* **Vị trí ảnh hưởng**: `QrTicketScannerPage.tsx` và `ConductorScannerController.java`.
* **Kịch bản thực tế bến xe**:
  - Xe khách xuất bến tại các bến xe tầng hầm hoặc đón khách dọc quốc lộ vùng núi (Đèo Bảo Lộc, Đèo Hải Vân) nơi sóng 3G/4G chập chờn hoặc mất sóng hoàn toàn.
  - Nếu WebApp của phụ xe mỗi lần quét mã QR lại phải gửi HTTP POST lên server để hỏi "Vé này có hợp lệ không?":
    $\rightarrow$ Màn hình sẽ xoay vòng (Loading timeout) $\rightarrow$ Hành khách đứng chờ đông đúc, phụ xe bực mình và bỏ qua không quét nữa!
* **Giải pháp kiến trúc**:
  1. **Pre-caching Trip Manifest**: Trước giờ xuất bến 30 phút (khi còn wifi tại bến xe), WebApp tự động tải toàn bộ danh sách 34 mã vé và hash QR của chuyến xe đó về `IndexedDB` / `LocalStorage` trên trình duyệt điện thoại.
  2. **Offline-First Validation**:
     - Khi quét QR, WebApp kiểm tra hash trực tiếp trên bộ nhớ máy trước.
     - Nếu khớp và chưa check-in $\rightarrow$ Báo "Hợp lệ" ngay trong $0.05$ giây, lưu trạng thái `OFFLINE_CHECKED`.
     - Khi có mạng trở lại, WebApp tự động đồng bộ (Background Sync) danh sách lên server.

---

### 🚨 LỖ HỔNG 6: Vi Phạm Quy Chuẩn Pháp Lý Về Thời Gian Lái Xe Tuyến Dài (`S319`)
* **Vị trí ảnh hưởng**: `TripCrewPage.tsx`, `CompanyTripCrewController.java`, `trip_crews`.
* **Quy chuẩn pháp lý Bộ Giao thông Vận tải (Nghị định 10/2020/NĐ-CP)**:
  - Thời gian làm việc của người lái xe ô tô không quá 10 giờ trong một ngày và không được lái xe liên tục quá 04 giờ.
  - Đối với các tuyến đường dài (Ví dụ: Tuyến Hà Nội $\leftrightarrow$ Đà Nẵng: 760km, chạy 14-16 tiếng; Sài Gòn $\leftrightarrow$ Nha Trang: 430km, chạy 8-9 tiếng), **bắt buộc phải có từ 02 tài xế trở lên**.
* **Lỗ hổng hệ thống**:
  - Nếu hệ thống cho phép nhà xe chỉ gán 1 tài xế chính và bấm "Ký lệnh xuất bến" cho chuyến xe chạy 12 tiếng $\rightarrow$ Khi xuất file PDF Lệnh Vận Chuyển (`S322`), lực lượng Thanh tra Giao thông sẽ lập biên bản xử phạt nhà xe từ 6,000,000 - 8,000,000 VNĐ.
* **Giải pháp khắc phục**:
  - Bổ sung logic kiểm tra thời lượng chuyến xe (`estimatedHours`):
    - Nếu `estimatedHours > 4` hoặc `distanceKm > 300`: Bắt buộc phải có cả `Tài xế chính (MAIN_DRIVER)` và `Tài xế phụ (CO_DRIVER)`.
    - Cả 2 tài xế đều phải có kết quả đo nồng độ cồn `= 0.00 mg/L` mới cho phép ký duyệt lệnh xuất bến.

---

### 🚨 LỖ HỔNG 7: Đón Trả Trung Chuyển Bất Khả Thi Về Địa Lý & Thời Gian (`S317`)
* **Vị trí ảnh hưởng**: `ShuttleManagementPage.tsx`, `shuttle_requests`.
* **Kịch bản phi lý**:
  - Khuyến khích khách đặt trung chuyển tận nhà nhưng không chặn khoảng cách và thời gian.
  - Khách ở Hóc Môn đặt xe tuyến khởi hành lúc 18:00 tại Bến xe Miền Tây, nhưng 17:30 mới tạo yêu cầu trung chuyển đón tận nhà.
  - Tài xế trung chuyển không thể bay qua 20km kẹt xe giờ tan tầm để đón khách kịp 18:00 xuất bến.
* **Ràng buộc nghiệp vụ cần bổ sung (Business Rules)**:
  1. **Lead Time Constraint**: Yêu cầu đón tận nơi phải được đăng ký **trước giờ xe tuyến khởi hành ít nhất 120 phút**.
  2. **Geofencing / Radius Constraint**: Địa chỉ đón chỉ được chấp nhận trong phạm vi các quận trung tâm hoặc bán kính tối đa 10km tính từ văn phòng/bến xe của nhà xe.

---

### 🚨 LỖ HỔNG 8: Gian Lận Kê Khai Chi Phí Lãi/Lỗ Sau Khi Chốt Sổ (`S318`)
* **Vị trí ảnh hưởng**: `trip_expenses`, `CompanyTripExpenseController.java`.
* **Kịch bản tiêu cực nội bộ**:
  - Chuyến xe 696 chạy ngày 01/11, doanh thu 10,000,000 VNĐ, chi phí xăng dầu đã kê 3,000,000 VNĐ, lãi 7,000,000 VNĐ.
  - Ngày 08/11 (sau 1 tuần), nhân viên điều hành thông đồng với tài xế vào trang `/company/expenses` tạo thêm chi phí "Sửa chữa dọc đường 4,000,000 VNĐ" để biển thủ tiền quỹ nhà xe.
* **Giải pháp kiểm soát nội bộ (Internal Control)**:
  - Thêm trường `is_locked` (BOOLEAN) vào bảng `trip_expenses`.
  - Quy tắc: Sau khi chuyến xe chuyển sang trạng thái `COMPLETED` quá 48 giờ, hoặc sau khi kỳ đối soát tuần đã được Giám đốc nhà xe duyệt, hệ thống tự động khóa sổ chi phí (Read-only). Bất kỳ chỉnh sửa nào sau thời điểm này đều phải có quyền Admin cấp cao và ghi log kiểm toán bất biến (`audit_logs`).

---

## 🛡️ BẢNG CHECKLIST HÀNH ĐỘNG DÀNH CHO CÁC THÀNH VIÊN TRONG SPRINT 3

| Thành viên | Nhiệm vụ cần lưu ý ngay khi code |
| :--- | :--- |
| **Trần Minh Đức** | 1. Khi làm Đổi vé `S316`: Dùng `TicketStatus.EXCHANGED`, gọi hàm Lock ghế mới trước khi hủy ghế cũ.<br>2. Khi làm Trung chuyển `S317`: Validate thời gian đón trước ít nhất 2 tiếng.<br>3. Khi làm Sổ chi phí `S318`: Thêm điều kiện chặn sửa sau khi chuyến xe đã hoàn thành 48h. |
| **Đoàn Nhật Cường** | 1. Khi làm Tổ lái `S319`: Bắt buộc 2 tài xế cho chuyến đường dài > 300km, chặn xuất bến nếu thiếu test cồn.<br>2. Khi làm Quét QR `S320`: Lưu cache danh sách vé vào `LocalStorage` để quét mượt mà khi mất mạng. |
| **Nguyễn Đại Phát** | 1. Khi làm Hoàn hủy vé `S321`: Bổ sung tỷ lệ chia tiền phạt hủy (80% Nhà xe, 20% Sàn).<br>2. Khi làm Xuất lệnh GTVT `S322`: Thể hiện đầy đủ tên cả Lái chính và Lái phụ theo quy chuẩn pháp lý. |
| **Phạm Công Thành** | 1. Tích hợp hàm `syncTripAvailableSeats(tripId)` để chống lệch số lượng ghế trống.<br>2. Hoàn thiện cơ chế Lock 10:00 của `S301` làm chốt chặn vững chắc cho toàn bộ các luồng đổi vé và đặt vé. |
