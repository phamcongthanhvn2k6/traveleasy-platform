# BÁO CÁO NGHIỆM THU SPRINT 7 NGÀY & KỊCH BẢN BẢO VỆ 100/100 ĐIỂM
## TỔNG KẾT DỰ ÁN SPRINT BACKLOG, MA TRẬN RACI & SPRINT RETROSPECTIVE
### DỰ ÁN: TRAVELEASY PLATFORM (`PRJ-TRAVELEASY-MVP-01`) | NHÓM 7 - RIKKEI PRE-OJT

---

> **MỤC TIÊU BÁO CÁO:** Tổng kết chu kỳ phát triển nước rút 7 ngày (Sprint 7 ngày) theo phương pháp luận Agile / Scrum, đánh giá hiệu suất của 6 thành viên theo ma trận RACI và chuẩn bị kịch bản demo 15 phút bảo vệ tốt nghiệp hoàn hảo.

---

## 1. TỔNG QUAN SPRINT 7 NGÀY (SPRINT OVERVIEW)

* **Tên Sprint**: `Sprint 1 - TravelEasy MVP Delivery (Vexere Model)`
* **Thời gian thực hiện**: 7 ngày làm việc liên tục (Agile Scrum).
* **Mục tiêu Sprint**: Xây dựng hoàn chỉnh nền tảng sàn thương mại điện tử đặt vé xe khách liên tỉnh và hệ thống quản trị điều hành nhà xe, đạt **100/100 điểm tuyệt đối** (60 điểm chức năng + 40 điểm phi chức năng & QA).
* **Quy mô bàn giao**:
  - **17 User Stories** hoàn thành trọn vẹn (Tổng **95 Story Points**).
  - **38 RESTful API Endpoints** chuẩn OpenAPI/Swagger hoạt động chính xác.
  - **17 Màn hình giao diện** hoàn thiện trên nền tảng React 18 + Vite TypeScript.
  - **36 Bảng CSDL** MySQL 8.0 chuẩn hóa 3NF kèm 136 ghế 2 tầng khởi tạo mẫu.
  - **Hệ thống Container Docker Compose** và **CI/CD Pipeline** tự động hóa 100%.

---

## 2. MA TRẬN TRÁCH NHIỆM RACI V3 & ĐÁNH GIÁ ĐÓNG GÓP 6 THÀNH VIÊN

* **R (Responsible)**: Thành viên trực tiếp lập trình (Full-Stack: Controller, Service, DTO, React Page, Component).
* **A (Accountable)**: Nhóm trưởng chịu trách nhiệm chất lượng cuối cùng và duyệt Merge Code (**Phạm Công Thành**).
* **C (Consulted)**: Thành viên tham vấn chuyên môn kỹ thuật hoặc hỗ trợ phối hợp giao diện.
* **I (Informed)**: Thành viên nhận thông báo tiến độ.

| Phân hệ & Tính năng Full-Stack | Thành (Lead) | Phát (Cứng) | Kiên (Cứng) | Phong (Cứng) | Đức (Yếu) | Cường (Yếu) | Kết quả nghiệm thu |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **ADMIN PORTAL: 7 Trang Dashboard KPI, Lịch trình, Đội xe, Tuyến, Giá, User, Audit (US-01 -> US-07)** | **R / A** | I | I | I | I | I | **100% Hoàn thành** (36 SP) |
| **USERS 1: Tìm kiếm chuyến xe, Bộ lọc đa tiêu chí & Chi tiết lộ trình ETA (US-08, US-09)** | **A** | **R** | C | I | I | I | **100% Hoàn thành** (13 SP) |
| **USERS 2: Sơ đồ 34 ghế Limousine VIP & Khóa giữ chỗ Concurrency 10:00 (US-10, US-11)** | **A** | C | **R** | C | I | I | **100% Hoàn thành** (16 SP) |
| **USERS 3: Điểm đón/trả, Form Đặt vé & Cổng thanh toán VietQR / VNPay (US-12, US-13)** | **A** | I | C | **R** | I | I | **100% Hoàn thành** (13 SP) |
| **USERS 4: Thẻ vé điện tử QR Code Boarding Pass & Cẩm nang FAQ (US-14, US-15)** | **A** | I | I | I | **R** | I | **100% Hoàn thành** (8 SP) |
| **USERS 5: Tra cứu vé nhanh bằng SĐT & Gửi đánh giá dịch vụ 1-5 sao (US-16, US-17)** | **A** | I | I | I | I | **R** | **100% Hoàn thành** (6 SP) |
| **Kiến trúc Monolith, DDL CSDL 36 bảng, Docker & Quản trị Git PR** | **R / A** | C | C | C | C | C | **100% Hoàn thành** (3 SP) |

---

## 3. BẢNG TỔNG HỢP 17 USER STORIES HOÀN THÀNH (95 STORY POINTS)

| Mã US | Phân hệ / Màn hình | Tiêu đề User Story | Story Points | Thành viên phụ trách | Trạng thái |
|:---:|:---|:---|:---:|:---:|:---:|
| **US-01** | A0. Admin Dashboard | Xem Dashboard 4 chỉ số KPI và bảng điều phối để nắm bắt tình hình vận hành | **(8)** | Phạm Công Thành | **DONE** |
| **US-02** | A1. Lịch trình & Chuyến | Tạo chuyến xe mới tự động sinh 34 ghế và đổi trạng thái chuyến vận hành | **(8)** | Phạm Công Thành | **DONE** |
| **US-03** | A2. Đội xe & Nhà xe | Quản lý danh mục nhà xe đối tác và phương tiện vận tải | **(5)** | Phạm Công Thành | **DONE** |
| **US-04** | A3. Tuyến & Trạm dừng | Quản lý các tuyến đường và trạm đón/trả kèm mốc giờ ETA | **(5)** | Phạm Công Thành | **DONE** |
| **US-05** | A4. Chính sách & Giá vé | Cấu hình bảng quy tắc hoàn tiền hủy vé (>24h 90%, 12-24h 70%, <12h 0%) | **(5)** | Phạm Công Thành | **DONE** |
| **US-06** | A5. Người dùng & RBAC | Quản lý người dùng và phân quyền RBAC an toàn bằng JWT | **(5)** | Phạm Công Thành | **DONE** |
| **US-07** | A6. Audit Logs & Review | Theo dõi nhật ký audit log bất biến và kiểm duyệt đánh giá khách hàng | **(5)** | Phạm Công Thành | **DONE** |
| **US-08** | U1. Tìm kiếm & Bộ lọc | Tìm kiếm chuyến xe kết hợp bộ lọc thông minh thời gian thực | **(8)** | Nguyễn Đại Phát | **DONE** |
| **US-09** | U2. Chi tiết chuyến xe | Xem chi tiết tiện ích xe (WiFi/sạc) và lộ trình trạm dừng ETA | **(5)** | Nguyễn Đại Phát | **DONE** |
| **US-10** | U3. Sơ đồ ghế 2 tầng | Xem sơ đồ 34 phòng Limousine 2 tầng trực quan chọn vị trí ưng ý | **(8)** | Phan Trung Kiên | **DONE** |
| **US-11** | U4. Khóa giữ chỗ 10:00| Khóa giữ chỗ độc quyền trong 10 phút có đồng hồ đếm ngược chống cướp vé | **(8)** | Phan Trung Kiên | **DONE** |
| **US-12** | U5. Điểm đón & Form vé | Chọn điểm đón/trả cụ thể và điền thông tin hành khách | **(5)** | Phạm Thanh Phong | **DONE** |
| **US-13** | U6. Cổng thanh toán | Thanh toán đơn vé đa kênh an toàn (VietQR, VNPay, COD) tức thì | **(8)** | Phạm Thanh Phong | **DONE** |
| **US-14** | U7. Thẻ vé QR Code | Nhận vé điện tử Boarding Pass sắc nét kèm mã QR quét lên xe | **(5)** | Trần Minh Đức | **DONE** |
| **US-15** | U8. Cẩm nang & FAQ | Xem hướng dẫn quy định hành lý 20kg và các câu hỏi thường gặp | **(3)** | Trần Minh Đức | **DONE** |
| **US-16** | U9. Tra cứu vé đơn giản| Tra cứu thông tin vé nhanh bằng SĐT hoặc mã đơn bất kỳ lúc nào | **(3)** | Đoàn Nhật Cường | **DONE** |
| **US-17** | U10. Đánh giá Review | Gửi đánh giá 1-5 sao ⭐ và nhận xét dịch vụ sau chuyến đi | **(3)** | Đoàn Nhật Cường | **DONE** |

---

## 4. BIỂU ĐỒ BURNDOWN VÀ TỐC ĐỘ PHÁT TRIỂN (SPRINT BURNDOWN & VELOCITY)

```
Story Points còn lại
  95 | * (Ngày 1: Lập kế hoạch, DDL CSDL 36 bảng, dựng khung dự án)
     |   \
  80 |    * (Ngày 2: Hoàn thành JWT Security, Authentication, Sub-Routers)
     |     \
  60 |      * (Ngày 3: Dựng xong Tìm kiếm, Bộ lọc, Chi tiết chuyến xe & CRUD Fleet)
     |       \
  40 |        * (Ngày 4: Hoàn thành Sơ đồ ghế 2 tầng & Pessimistic Lock Concurrency)
     |         \
  20 |          * (Ngày 5: Hoàn tất Đặt vé, Cổng thanh toán VietQR & Vé QR Code)
     |           \
   5 |            * (Ngày 6: Tra cứu vé, FAQ, Review, Audit Log, Docker Compose)
     |             \
   0 +--------------* (Ngày 7: Nghiệm thu 25 Test Cases, Hoàn thiện Docs & Trello)
     ----------------------------------------------------------------------------
       N1    N2    N3    N4    N5    N6    N7 (Sprint 7 ngày)
```

* **Vận tốc thực tế (Actual Velocity)**: **95 Points / 7 ngày** (Tương đương 13.5 Story Points / ngày cho đội ngũ 6 người).
* **Chất lượng bàn giao**: 0 Critical Bug, 0 Blocker, 100% Test Cases Pass.

---

## 5. ĐÁNH GIÁ BÀI HỌC KINH NGHIỆM (SPRINT RETROSPECTIVE)

### 5.1 Điều đã làm rất tốt (What Went Well)
1. **Kiến trúc Phân rã 2 Sub-Routers (`adminRoutes.tsx` & `clientRoutes.tsx`)**: Giúp 6 thành viên làm việc song song mà hoàn toàn không xảy ra xung đột mã nguồn (Git Merge Hell).
2. **Cơ chế Khóa Bi quan (`@Lock(PESSIMISTIC_WRITE)`)**: Giải quyết triệt để bài toán khó nhất của dự án đặt vé xe khách là hiện tượng tranh chấp ghế đồng thời (Overbooking).
3. **Đóng gói Docker Compose 1-Click**: Mọi thành viên và hội đồng thẩm định đều có thể khởi chạy toàn bộ hệ sinh thái mà không gặp bất kỳ lỗi lệch môi trường hay cấu hình CSDL nào.

### 5.2 Điều cần cải tiến cho các dự án sau (What Could Be Improved)
1. Thống nhất bảng biến màu CSS hệ thống ngay từ ngày đầu tiên để giảm thời gian tinh chỉnh giao diện.
2. Xây dựng bộ test tự động JUnit song song ngay từ lúc viết Controller thay vì kiểm thử dồn về các ngày cuối sprint.

---

## 6. KỊCH BẢN DEMO 15 PHÚT BẢO VỆ TỐT NGHIỆP ĐẠT 100/100 ĐIỂM

| Mốc thời gian | Nội dung trình bày | Người phụ trách | Điểm nhấn kỹ thuật / Thao tác minh họa |
|:---:|:---|:---|:---|
| **00:00 - 02:00** | **Giới thiệu Tổng quan & Kiến trúc Hệ thống** | **Phạm Công Thành** (Lead) | - Giới thiệu bài toán vận tải Vexere và mục tiêu 100/100 điểm.<br/>- Trình bày sơ đồ kiến trúc Modular Monolith Spring Boot 3 + Clean Architecture + Docker Compose.<br/>- Giới thiệu bảng phân công RACI 6 thành viên. |
| **02:00 - 05:00** | **Demo Phân hệ Khách hàng: Tìm kiếm & Bộ lọc** | **Nguyễn Đại Phát** | - Thao tác trực tiếp trên trang chủ: Tìm chuyến Sài Gòn ➔ Đà Lạt.<br/>- Kéo thanh trượt khoảng giá, chọn xe Limousine, chọn nhà xe Phương Trang.<br/>- Mở xem chi tiết chuyến, chỉ rõ danh sách tiện ích và lộ trình ETA các trạm dừng. |
| **05:00 - 08:00** | **Demo Sơ đồ Ghế & Khóa Giữ chỗ Concurrency 10:00** | **Phan Trung Kiên** | - Mở sơ đồ 34 phòng Limousine 2 tầng, chỉ rõ phân loại tầng 1/tầng 2.<br/>- Click chọn ghế A03, bấm tiếp tục để kích hoạt **đồng hồ đếm ngược 10:00**.<br/>- Mở tab ẩn danh (incognito) chọn cùng ghế A03 để chứng minh ghế đã bị khóa độc quyền (Pessimistic Lock), không bị Overbooking. |
| **08:00 - 11:00** | **Demo Đặt vé, Thanh toán VietQR & Thẻ vé QR Code** | **Phạm Thanh Phong & Trần Minh Đức** | - Điền thông tin hành khách, chọn trạm đón BX Miền Tây.<br/>- Chọn phương thức VietQR, giải thích cơ chế sinh mã QR động và nội dung chuyển khoản tự động.<br/>- Bấm xác nhận thanh toán ➔ Hiển thị ngay Thẻ vé điện tử Boarding Pass sang trọng.<br/>- Dùng điện thoại quét trực tiếp mã QR trên màn hình để hội đồng thấy mã vé. |
| **11:00 - 13:00** | **Demo Tra cứu vé & Đánh giá Dịch vụ 1-5 Sao** | **Đoàn Nhật Cường** | - Mở trang Tra cứu vé, gõ số điện thoại vừa đặt vé ➔ Hiển thị bảng chi tiết vé.<br/>- Gửi đánh giá 5 sao kèm lời nhận xét dịch vụ gửi về hệ thống. |
| **13:00 - 15:00** | **Demo Phân hệ Quản trị Admin, CSDL & Hỏi đáp Hội đồng** | **Phạm Công Thành** (Lead) | - Đăng nhập tài khoản Admin, trình chiếu Dashboard 4 chỉ số KPI vận hành.<br/>- Tạo một chuyến xe mới và mở CSDL MySQL chứng minh 34 ghế được sinh tự động tức thì.<br/>- Trình chiếu trang Audit Trail vết thao tác bảo mật.<br/>- Tuyên bố hoàn thành và trả lời câu hỏi phản biện của Hội đồng. |
