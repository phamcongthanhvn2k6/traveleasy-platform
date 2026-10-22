# ĐẶC TẢ QUẢN TRỊ BẢNG TRELLO (TRELLO BOARD BLUEPRINT & SYNC GUIDE)
## HỆ THỐNG QUẢN LÝ TIẾN ĐỘ SPRINT BACKLOG & QUY TRÌNH TỰ ĐỘNG HÓA
### DỰ ÁN: TRAVELEASY PLATFORM (`PRJ-TRAVELEASY-MVP-01`) | [LINK TRELLO BOARD](https://trello.com/b/AA5BYoe1/traveleasyplatform)

---

> **BẢNG TRELLO TRỰC TUYẾN DỰ ÁN:** [https://trello.com/b/AA5BYoe1/traveleasyplatform](https://trello.com/b/AA5BYoe1/traveleasyplatform)  
> **BOARD ID:** `6ad6f486572cd6662754e074`  
> **CÔNG CỤ TỰ ĐỘNG HÓA:** `scripts/sync_trello.py`  
> **TRẠNG THÁI NGHIỆM THU SPRINT 1:** **17/17 USER STORIES HOÀN THÀNH (95 STORY POINTS - CỘT 'DONE SPRINT')**.

---

## 1. CẤU TRÚC DANH SÁCH & LUỒNG CÔNG VIỆC CHUẨN AGILE (LISTS WORKFLOW)

Bảng Trello được cấu hình theo đúng quy chuẩn Scrum Board tiêu chuẩn quốc tế:

```
+-------------------+    +--------------------+    +-------------+    +---------------+    +---------------+    +--------------------+
|  PRODUCT BACKLOG  | ➔ | SPRINT 1 BACKLOG   | ➔ | IN PROGRESS | ➔ |  CODE REVIEW  | ➔ |    TESTING    | ➔ |    DONE SPRINT     |
| (5 US Tương lai)  |    | (Chờ nạp task mới) |    | (Đang làm)  |    | (Kiểm thử PR) |    | (Nghiệm thu)  |    | (17 US Hoàn thành) |
+-------------------+    +--------------------+    +-------------+    +---------------+    +---------------+    +--------------------+
```

1. **`Product Backlog`**: Chứa các User Stories mở rộng cho phiên bản tương lai (US-21 đến US-25).
2. **`Sprint Backlog - SPRINT 1`** & **`Todo`**: Danh sách các nhiệm vụ được lập kế hoạch cho sprint tiếp theo.
3. **`In Progress`**: Các công việc đang trong quá trình lập trình.
4. **`Code Review`**: Các nhánh tính năng đã tạo Pull Request và đang được Tech Lead kiểm duyệt.
5. **`Testing`**: Các chức năng đã merge vào nhánh `dev` và đang được kiểm thử tích hợp (QA).
6. **`Done Sprint`**: Toàn bộ 17 User Stories đã hoàn thành, vượt qua 25 Test Cases và sẵn sàng cho buổi bảo vệ 100/100 điểm.

---

## 2. QUY CHUẨN BẢNG NHÃN MÀU (LABEL SYSTEM)

| Tên Nhãn | Mã Màu | Ý nghĩa & Phạm vi áp dụng |
|---|:---:|---|
| **`Admin Portal`** | 🟠 **Cam** | Các màn hình và API phục vụ quản trị viên nền tảng và đối tác nhà xe |
| **`Customer Portal`** | 🟡 **Vàng** | Các tính năng phục vụ khách hàng đặt vé công khai |
| **`Backend`** | 🔵 **Xanh dương** | Lập trình Spring Boot 3, RESTful API, Database, Security, Locking |
| **`Frontend`** | 🟢 **Xanh lá** | Dựng giao diện React 18, Vite, TypeScript, Responsive CSS |
| **`Fullstack`** | 🟣 **Tím** | Nhiệm vụ bao quát cả Frontend và Backend tích hợp |
| **`Core / Urgent`** | 🔴 **Đỏ** | Các nghiệp vụ sống còn (Concurrency 10:00, Đặt vé, Thanh toán, Dashboard) |

---

## 3. DANH MỤC 17 USER STORIES TẠI CỘT 'DONE SPRINT' (95 STORY POINTS)

Mỗi thẻ User Story đều tuân thủ định dạng chuẩn của Scrum:
* **Tiêu đề**: `({Điểm Fibonacci}) US-{Mã}: Là một {Vai trò}, tôi muốn {Hành động} để {Mục đích}`.
* **Mô tả kỹ thuật**: Đường dẫn API Backend và Component Frontend.
* **2 Checklists chi tiết**: `Backend Checklist` và `Frontend Checklist` (Tất cả items đều được đánh dấu hoàn thành 100%).

### 3.1 Nhóm Phân hệ Quản trị (Admin Portal - 36 Story Points) - Phụ trách: Phạm Công Thành

#### 1. `(8) US-01: Là một Quản trị viên, tôi muốn xem Dashboard 4 chỉ số KPI và bảng điều phối để nắm bắt tức thời tình hình vận hành của hệ thống`
* **Nhãn**: `Admin Portal`, `Fullstack`, `Core / Urgent`
* **Thành viên**: `thanhphmcong1` (Phạm Công Thành)
* **Backend Checklist**:
  - [x] Viết API Endpoint `GET /api/v1/admin/dashboard/stats`
  - [x] Truy vấn tổng hợp số liệu thực tế từ các bảng `trips`, `bookings`, `payments`
  - [x] Tối ưu truy vấn SQL Dashboard dưới 50ms
* **Frontend Checklist**:
  - [x] Dựng 4 thẻ số liệu KPI trực quan (Tổng chuyến, Chuyến mở bán, Đơn vé, Doanh thu)
  - [x] Dựng lưới 6 Card điều phối nhanh dẫn tới các trang quản trị
  - [x] Tích hợp tự động đồng bộ số liệu qua Axios service

#### 2. `(8) US-02: Là một Quản trị viên, tôi muốn tạo chuyến xe mới tự động sinh 34 ghế và đổi trạng thái chuyến để vận hành lịch trình xe chạy`
* **Nhãn**: `Admin Portal`, `Fullstack`, `Core / Urgent`
* **Thành viên**: `thanhphmcong1` (Phạm Công Thành)
* **Backend Checklist**:
  - [x] Thuật toán tự động sinh 34 ghế (17 ghế tầng 1 A01-A17, 17 ghế tầng 2 B01-B17)
  - [x] Logic chuyển trạng thái State Machine: `SCHEDULED` ➔ `DEPARTED` ➔ `COMPLETED` ➔ `CANCELLED`
  - [x] Khóa snapshot giá vé trên chuyến xe theo Tuyến mẫu
* **Frontend Checklist**:
  - [x] Form Popup tạo chuyến mới có validation giờ chạy và ngày đi
  - [x] Bảng hiển thị danh sách chuyến xe kèm nút đổi trạng thái trực tiếp
  - [x] Badge màu trực quan phân biệt trạng thái chuyến xe

#### 3. `(5) US-03: Là một Quản trị viên, tôi muốn quản lý danh mục nhà xe đối tác và phương tiện để kiểm soát đội xe trên hệ thống`
* **Nhãn**: `Admin Portal`, `Fullstack`
* **Thành viên**: `thanhphmcong1` (Phạm Công Thành)
* **Backend Checklist**:
  - [x] Viết CRUD BusCompanyRepository & VehicleRepository
  - [x] Xử lý ràng buộc một nhà xe sở hữu nhiều phương tiện
  - [x] Quản lý trạng thái ACTIVE / INACTIVE của đối tác
* **Frontend Checklist**:
  - [x] Dựng giao diện thẻ thông tin nhà xe (Hotline, địa chỉ, rating sao)
  - [x] Bảng quản lý phương tiện (Biển số xe, loại xe Limousine 34 phòng)
  - [x] Modal thêm mới và cập nhật phương tiện vận tải

#### 4. `(5) US-04: Là một Quản trị viên, tôi muốn quản lý các tuyến đường và trạm đón/trả kèm mốc giờ ETA để tối ưu lộ trình xe di chuyển`
* **Nhãn**: `Admin Portal`, `Fullstack`
* **Thành viên**: `thanhphmcong1` (Phạm Công Thành)
* **Backend Checklist**:
  - [x] Viết CRUD Route và danh sách điểm dừng kèm mốc giờ ETA Offset
  - [x] Validation khoảng cách km và tính toàn vẹn sequence trạm dừng
  - [x] Tính toán tự động ETA từ điểm xuất phát đến các trạm kế tiếp
* **Frontend Checklist**:
  - [x] Bảng danh sách tuyến xe liên tỉnh (Điểm đi - Điểm đến)
  - [x] Card danh sách trạm đón/trả dọc đường kèm khoảng cách km
  - [x] Form nhập lộ trình có gợi ý địa điểm thông minh

#### 5. `(5) US-05: Là một Quản trị viên, tôi muốn cấu hình bảng quy tắc hoàn tiền hủy vé và phụ thu tầng ghế để tự động hóa chính sách tài chính`
* **Nhãn**: `Admin Portal`, `Fullstack`
* **Thành viên**: `thanhphmcong1` (Phạm Công Thành)
* **Backend Checklist**:
  - [x] Entity CancellationPolicyRule và logic tính % tiền hoàn tự động
  - [x] Cấu hình mức phụ thu tầng 1 và phụ thu cuối tuần
  - [x] Xử lý giao dịch hoàn tiền tự động vào số dư khách hàng
* **Frontend Checklist**:
  - [x] Bảng trực quan hóa các mốc giờ hủy vé và tỷ lệ hoàn tiền
  - [x] Khung cấu hình giá vé phụ thu theo tầng
  - [x] Toast thông báo phản hồi khi cập nhật chính sách thành công

#### 6. `(5) US-06: Là một Quản trị viên, tôi muốn quản lý danh sách người dùng và phân quyền RBAC an toàn bằng JWT để kiểm soát quyền truy cập hệ thống`
* **Nhãn**: `Admin Portal`, `Backend`, `Core / Urgent`
* **Thành viên**: `thanhphmcong1` (Phạm Công Thành)
* **Backend Checklist**:
  - [x] Cấu hình SecurityConfig và JWT Authentication Filter
  - [x] API `GET /api/v1/admin/users` và PATCH cập nhật trạng thái khóa
  - [x] Mã hóa mật khẩu một chiều BCrypt 10 rounds
* **Frontend Checklist**:
  - [x] Bảng danh sách người dùng (Họ tên, SĐT, Email, Vai trò)
  - [x] Badge hiển thị màu theo vai trò (Admin đỏ, Driver vàng, Khách xanh)
  - [x] Chức năng khóa/mở khóa tài khoản an toàn

#### 7. `(5) US-07: Là một Quản trị viên, tôi muốn theo dõi nhật ký audit log và kiểm duyệt đánh giá của khách hàng để đảm bảo chất lượng dịch vụ và tính an toàn bảo mật`
* **Nhãn**: `Admin Portal`, `Fullstack`
* **Thành viên**: `thanhphmcong1` (Phạm Công Thành)
* **Backend Checklist**:
  - [x] Service ghi nhận vết Audit Log bất biến vào CSDL
  - [x] API lấy danh sách đánh giá kèm nút duyệt trạng thái
  - [x] Ghi nhật ký mọi thao tác nhạy cảm của Admin và Operator
* **Frontend Checklist**:
  - [x] Bảng Audit Trail hiển thị lịch sử thao tác hệ thống
  - [x] Thẻ đánh giá của khách hàng kèm nút "Duyệt hiển thị"
  - [x] Bộ lọc tìm kiếm nhật ký theo thời gian và người dùng

---

### 3.2 Nhóm Phân hệ Khách hàng (Client Portal - 59 Story Points)

#### 8. `(8) US-08: Tìm kiếm chuyến xe kết hợp bộ lọc nâng cao thời gian thực`
* **Phụ trách**: `phatnguyn146` (Nguyễn Đại Phát) | **Nhãn**: `Customer Portal`, `Fullstack`, `Core / Urgent`
* **Checklists**:
  - [x] [BE] Viết dynamic JPA Specification lọc đa tiêu chí linh hoạt
  - [x] [BE] DTO `TripSearchRequest` và `TripSummaryResponse`
  - [x] [FE] Thanh tìm kiếm có gợi ý địa điểm (Autosuggest)
  - [x] [FE] Sidebar bộ lọc thời gian thực (Slider khoảng giá, Checkbox nhà xe, Radio khung giờ)

#### 9. `(5) US-09: Xem chi tiết thông tin xe, tiện ích và lộ trình trạm dừng ETA`
* **Phụ trách**: `phatnguyn146` (Nguyễn Đại Phát) | **Nhãn**: `Customer Portal`, `Fullstack`
* **Checklists**:
  - [x] [BE] DTO `TripDetailResponse` kèm mảng tiện ích và điểm đón/trả
  - [x] [BE] API Endpoint `GET /api/v1/trips/{id}`
  - [x] [FE] Khung hiển thị hình ảnh xe Limousine và biểu tượng tiện ích (WiFi, sạc, nước)
  - [x] [FE] Timeline trực quan hóa các trạm đón/trả và mốc giờ ETA xe chạy

#### 10. `(8) US-10: Xem sơ đồ 2 tầng xe Limousine trực quan để chọn vị trí giường nằm`
* **Phụ trách**: Phan Trung Kiên | **Nhãn**: `Customer Portal`, `Frontend`, `Core / Urgent`
* **Checklists**:
  - [x] [BE] Truy vấn danh sách ghế theo chuyến kèm giá vé từng tầng
  - [x] [BE] DTO `TripSeatResponse` phân chia tầng 1 và tầng 2
  - [x] [FE] Vẽ sơ đồ 2 tầng xe Limousine (Tầng 1 A01-A17, Tầng 2 B01-B17)
  - [x] [FE] Xử lý chọn/bỏ chọn tối đa 4 ghế và tự động tính tổng tiền tạm tính

#### 11. `(8) US-11: Khóa giữ chỗ độc quyền trong 10 phút có đồng hồ đếm ngược`
* **Phụ trách**: Phan Trung Kiên | **Nhãn**: `Customer Portal`, `Backend`, `Core / Urgent`
* **Checklists**:
  - [x] [BE] Khóa ghế độc quyền bằng Pessimistic Write Lock chống Overbooking
  - [x] [BE] Cơ chế kiểm tra và giải phóng ghế tự động sau 10 phút (TTL = 600s)
  - [x] [FE] Widget đồng hồ đếm ngược 10:00 thời gian thực
  - [x] [FE] Hiệu ứng cảnh báo nhấp nháy đỏ khi thời gian còn dưới 2:00

#### 12. `(5) US-12: Chọn điểm đón/trả cụ thể và điền thông tin hành khách`
* **Phụ trách**: `phmthanhphong17` (Phạm Thanh Phong) | **Nhãn**: `Customer Portal`, `Fullstack`
* **Checklists**:
  - [x] [BE] API trả danh mục điểm đón/trả theo lộ trình chuyến đi
  - [x] [BE] Regex kiểm tra hợp lệ Số điện thoại Việt Nam (10 số) và Email
  - [x] [FE] Dropdown chọn điểm đón và điểm trả theo mốc giờ xe chạy
  - [x] [FE] Form nhập thông tin khách hàng (Họ tên, SĐT, Email) có validation

#### 13. `(8) US-13: Thanh toán đơn vé đa kênh an toàn (VietQR, VNPay, COD) tức thì`
* **Phụ trách**: `phmthanhphong17` (Phạm Thanh Phong) | **Nhãn**: `Customer Portal`, `Fullstack`, `Core / Urgent`
* **Checklists**:
  - [x] [BE] Xử lý giao dịch nguyên tử `@Transactional(isolation = Isolation.SERIALIZABLE)`
  - [x] [BE] Thuật toán sinh mã đơn vé duy nhất `BK-YYYYMMDD-XXXX`
  - [x] [FE] Giao diện chọn phương thức thanh toán trực quan (VietQR, VNPay, COD)
  - [x] [FE] Màn hình hiển thị mã QR Code chuyển khoản kèm nút Demo xác nhận

#### 14. `(5) US-14: Nhận vé điện tử sắc nét kèm mã QR Code quét lên xe`
* **Phụ trách**: `minhdctrn13` (Trần Minh Đức) | **Nhãn**: `Customer Portal`, `Frontend`
* **Checklists**:
  - [x] [BE] Viết query lấy thông tin vé theo mã `ticketCode`
  - [x] [BE] DTO `TicketResponse` đầy đủ thông tin chuyến, vị trí ghế và hành khách
  - [x] [FE] Thiết kế giao diện Thẻ vé Boarding Pass (Logo nhà xe, số xe, số ghế)
  - [x] [FE] Render mã QR Code sắc nét quét được bằng camera điện thoại

#### 15. `(3) US-15: Đọc hướng dẫn quy định hành lý và các câu hỏi thường gặp (FAQ)`
* **Phụ trách**: `minhdctrn13` (Trần Minh Đức) | **Nhãn**: `Customer Portal`, `Frontend`
* **Checklists**:
  - [x] [BE] Tạo Controller trả về danh sách FAQ và quy định hành lý
  - [x] [BE] Model dữ liệu câu hỏi và câu trả lời thường gặp
  - [x] [FE] Dựng khung thông tin quy định hành lý tối đa 20kg và lưu ý khi đi xe
  - [x] [FE] Danh sách câu hỏi thường gặp dạng Accordion (click để đóng/mở)

#### 16. `(3) US-16: Tra cứu thông tin vé nhanh bằng số điện thoại hoặc mã đơn`
* **Phụ trách**: Đoàn Nhật Cường | **Nhãn**: `Customer Portal`, `Fullstack`
* **Checklists**:
  - [x] [BE] Viết truy vấn tìm Booking theo mã đơn vé hoặc số điện thoại
  - [x] [BE] Xử lý ngoại lệ trả về thông báo lỗi thân thiện nếu không tìm thấy vé
  - [x] [FE] Ô nhập liệu đơn giản tra cứu SĐT hoặc Mã vé
  - [x] [FE] Bảng hiển thị thông tin vé tra cứu được kèm thông báo trạng thái

#### 17. `(3) US-17: Gửi đánh giá số sao (1-5 ⭐) và nhận xét dịch vụ sau chuyến đi`
* **Phụ trách**: Đoàn Nhật Cường | **Nhãn**: `Customer Portal`, `Fullstack`
* **Checklists**:
  - [x] [BE] Tạo Entity Review và Repository lưu đánh giá vào CSDL
  - [x] [BE] API Endpoint `POST /api/v1/reviews` có kiểm tra tính hợp lệ số sao
  - [x] [FE] Widget tương tác chọn từ 1 đến 5 sao ⭐ trực quan
  - [x] [FE] Ô textarea nhập lời nhận xét và nút gửi kèm thông báo thành công Toast

---

## 4. DANH MỤC THẺ PRODUCT BACKLOG (TÍNH NĂNG MỞ RỘNG TƯƠNG LAI)

Tại danh sách `Product Backlog`, lưu giữ 5 thẻ mở rộng phục vụ kế hoạch phát triển Phase 2:
1. `(3) US-21`: Trò chuyện với Trợ lý AI du lịch để tư vấn vị trí giường nằm chống say và quán ăn ngon.
2. `(5) US-22`: Quản lý Sổ địa chỉ người đi cùng trong Profile để tự động điền form đặt vé.
3. `(3) US-23`: Tự động gửi email xác nhận vé điện tử kèm file PDF đính kèm.
4. `(5) US-24`: Thuật toán đổi xe khẩn cấp và ghép ghế bán tự động khi xe gặp sự cố.
5. `(3) US-25`: Bộ kiểm thử tự động 25 Test Cases CI/CD định kỳ.

---

## 5. DANH MỤC THẺ RÁC ĐÃ LƯU TRỮ (ARCHIVED FOREIGN CARDS)

Toàn bộ 23 thẻ lạ thuộc về dự án thi trắc nghiệm tiếng Anh TOEIC và các thẻ nháp cũ trùng lặp đã được script tự động nhận diện và lưu trữ (Archive) an toàn:
* **Các thẻ TOEIC bị lưu trữ**: `us-07` (identity service), `us-09` (rabbitmq), `us-13` (lưu bài redis), `us-14` (chấm điểm ets), `us-15` (exam dtos), `us-16` (erd ngân hàng đề), `us-17` (erd phiên thi), `us-18` (ddl v1.0), `us-19` (giám thị proctoring), `us-20` (sổ tay câu sai), `us-22` (json đề thi), `us-23` (postman gateway), `us-26` (uat luồng thi), `us-28` (xử lý sự cố), `us-30` (từ vựng toeic), `us-31` (faq thí sinh), `us-32` (khảo sát thí sinh).
* **Các thẻ nháp cũ bị lưu trữ**: `(3) US-03: Là một Admin...`, `(3) US-04...`, `(4) US-08...`, `(3) US-12...`, `(2) US-18...`, `(2) US-20...`.

---

## 6. HƯỚNG DẪN 1-CLICK ĐỒNG BỘ TRELLO LIVE BẰNG SCRIPT PYTHON

Bất kỳ thành viên nào có quyền trên bảng Trello đều có thể chạy script để đồng bộ toàn bộ bảng chỉ trong 5 giây:

### Bước 1: Lấy Trello API Key & Token
1. Đăng nhập tài khoản Trello và truy cập: [https://trello.com/power-ups/admin](https://trello.com/power-ups/admin).
2. Sao chép chuỗi **API Key**.
3. Bấm vào liên kết **"Generate a Token"** (ngay bên dưới ô API Key) và nhấn **"Allow"** để cấp quyền, sau đó sao chép chuỗi **Token**.

### Bước 2: Chạy lệnh đồng bộ tự động
Mở terminal tại thư mục gốc của dự án và chạy:
```bash
python scripts/sync_trello.py --key YOUR_API_KEY --token YOUR_TOKEN
```
*Script sẽ tự động dọn sạch 23 thẻ rác, tạo 6 nhãn màu, đưa toàn bộ 17 User Stories vào cột `Done Sprint` và tích xanh 100% các mục checklist.*
