# 🎓 BÁO CÁO KHỞI ĐỘNG SPRINT 4 & THỐNG KÊ CÔNG VIỆC TRÊN TRELLO
## ĐỀ TÀI: NỀN TẢNG ĐẶT VÉ XE KHÁCH LIÊN TỈNH & QUẢN LÝ NHÀ XE TRAVELEASY
### ĐƠN VỊ: NHÓM 7 (OJT CAPSTONE PROJECT)
### THỜI GIAN THỰC HIỆN: 16/11/2026 – 20/11/2026 (1 TUẦN NƯỚC RÚT)
### NGÀY BÁO CÁO BẢO VỆ CHÍNH THỨC (D-DAY): THỨ SÁU, 20/11/2026

---

## 🎯 PHẦN I: THẺ SPRINT GOAL CHÍNH THỨC (ĐÃ ĐƯA LÊN ĐẦU DANH SÁCH TRELLO)

> 🏆 **NỘI DUNG SPRINT GOAL ĐƯỢC GHIM TRÊN TRELLO:**  
> **"Ổn định toàn diện hệ thống, tối ưu hóa hiệu năng và sửa dứt điểm các lỗi tồn đọng để đảm bảo nền tảng TravelEasy vận hành trơn tru 100% phục vụ buổi báo cáo bảo vệ tốt nghiệp OJT (Thứ Sáu, 20/11/2026)."**

### 1. Chỉ số cốt lõi của Sprint 4
- **Tổng số task trong phạm vi Sprint 4**: **19 Tasks** (16 task tối ưu/sửa lỗi mới + 3 task nợ cũ Sprint 3) + **1 thẻ ghim Sprint Goal**.
- **Tổng điểm Story Points (SP)**: **35 Story Points**
- **Thành phần tham gia**: **Đúng 5 thành viên chính thức làm OJT** (Phạm Công Thành, Nguyễn Đại Phát, Phạm Thanh Phong, Trần Minh Đức, Đoàn Nhật Cường). *Thành viên Phan Trung Kiên không tham gia OJT này và đã được loại khỏi danh sách phân công*.
- **Tính chất công việc**: 100% là task kỹ thuật thực tế (tối ưu hóa hiệu năng, sửa lỗi giao diện/backend, khử N+1 query, validation dữ liệu và tối ưu trải nghiệm người dùng). Không có task soạn thảo kịch bản.

### 2. Tiêu chí nghiệm thu Sprint Goal (Definition of Done - DoD)
- [x] Đã chuẩn hóa và nạp sẵn 248 chuyến xe thật trên Supabase Cloud cho tuần lễ bảo vệ (18/11 – 22/11/2026).
- [ ] 100% 19 tasks kỹ thuật chuyển sang trạng thái Done trước 12:00 ngày 20/11/2026.
- [ ] Loại bỏ hoàn toàn lỗi crash 500, bọc try-catch và kiểm tra kết nối HikariCP an toàn.
- [ ] Hệ thống thanh toán trực tuyến, quét mã QR soát vé và bản đồ GPS Live Tracking vận hành ổn định phục vụ 15 phút bảo vệ trước Hội đồng.

---

## 📊 PHẦN II: THỐNG KÊ ĐIỂM STORY POINTS TỪNG THÀNH VIÊN SAU KHI HOÀN THÀNH

Bảng thống kê toàn diện điểm tích lũy qua 4 Sprint từ đầu kỳ đến lúc bảo vệ tốt nghiệp:

| STT | Họ và Tên Thành Viên | Trello Username | Vai Trò Kỹ Thuật | Điểm Đã Tích Lũy (Sprint 1 - 3) | Điểm Đảm Nhận Sprint 4 | TỔNG ĐIỂM SAU SPRINT 4 | Số Task Sprint 4 | Đánh Giá Tốt Nghiệp |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| 1 | **Phạm Công Thành** | `@thanhphmcong1` | Team Leader / DevOps / Backend Architect | **179 SP** | **6 SP** | **185 SP** | 4 tasks | **Xuất sắc** |
| 2 | **Nguyễn Đại Phát** | `@phatnguyn146` | Fullstack Lead / Admin & Promotions | **72 SP** | **6 SP** | **78 SP** | 4 tasks | **Xuất sắc** |
| 3 | **Phạm Thanh Phong** | `@phmthanhphong17` | Backend Core / Cache & Concurrency | **44 SP** | **6 SP** | **50 SP** | 4 tasks | **Tốt** |
| 4 | **Trần Minh Đức** | `@minhdctrn13` | Fullstack / Booking Flow & Reviews | **33 SP** | **6 SP** | **39 SP** | 4 tasks | **Tốt** |
| 5 | **Đoàn Nhật Cường** | `@joshliam` | Mobile & Field Safety Specialist | **35 SP** | **11 SP**\* | **46 SP** | 6 tasks | **Tốt** |
| **TỔNG** | **TOÀN ĐỘI (5 THÀNH VIÊN)** | - | **NỀN TẢNG TRAVELEASY** | **363 SP** | **35 SP** | **398 SP** | **19 TASKS** | **ĐẠT XUẤT SẮC** |

*\* Ghi chú phân bổ của Đoàn Nhật Cường:* 
- **8 SP nợ cũ Sprint 3** (hoàn thành trong 48h đầu): `[S315]` (2 SP), `[S319]` (3 SP), `[S320]` (3 SP).
- **3 SP tối ưu mới**: `[S417]` (1 SP), `[S418]` (1 SP), `[S419]` (1 SP).

---

## 📋 PHẦN III: DANH MỤC CHI TIẾT 19 TASKS ĐÃ ĐỒNG BỘ LÊN TRELLO

### 1. Phạm Công Thành (4 tasks — 6 SP)
1. **`[S401]` Tối ưu hóa bundle Vite & Cấu hình nén Gzip/Brotli Frontend (1 SP)**: Chia nhỏ chunk vendor, giảm dung lượng JS ban đầu xuống dưới 1.5MB, tăng tốc độ FCP < 1.2s.
2. **`[S402]` Tối ưu timeout HikariCP Connection Pool & Graceful Shutdown Backend (2 SP)**: Thiết lập connection timeout 20s, maxLifetime 30 phút, cấu hình graceful shutdown để giải phóng kết nối Supabase an toàn.
3. **`[S403]` Tối ưu bảo mật CORS, Content-Security-Policy & Rate Limiting IP (2 SP)**: Chặn domain lạ, thêm headers chống Clickjacking/XSS, giới hạn 5 lần đăng nhập sai.
4. **`[S404]` Tối ưu cơ chế Global Exception Handler & Standardized Response Body (1 SP)**: Bắt gọn lỗi Validation và DB Constraint, trả về JSON `{ success: false, message, code }` chuẩn hóa cho toàn sàn.

### 2. Nguyễn Đại Phát (4 tasks — 6 SP)
5. **`[S405]` Tối ưu bộ lọc tìm kiếm & Phân trang Server-side tại Admin Trips & Bookings (2 SP)**: Lọc nhanh theo nhà xe, số điện thoại, tuyến đường và ngày xuất bến mượt mà không reload trang.
6. **`[S406]` Sửa lỗi hiển thị & Hoàn thiện bảng biến động số dư hoàn tiền tại `CancellationRefundPage` (1 SP)**: Cập nhật chính xác tỷ lệ khấu trừ (10%, 30%, 100%) tại `CancellationRefundPage.tsx` và nút xác nhận hoàn tiền.
7. **`[S407]` Tối ưu UX/UI form nhập Voucher khuyến mại & Bổ sung Validation mã giảm giá (2 SP)**: Tự động uppercase mã giảm giá, kiểm tra giá trị đơn tối thiểu (`min_order_value`), chặn áp dụng mã hết hạn.
8. **`[S408]` Sửa lỗi hiển thị & Tối ưu Responsive Dashboard Thống kê Doanh thu Admin trên iPad/Tablet (1 SP)**: Căn chỉnh biểu đồ doanh thu không bị vỡ layout khi xem trên iPad / màn hình độ phân giải trung bình.

### 3. Phạm Thanh Phong (4 tasks — 6 SP)
9. **`[S409]` Tối ưu thời gian phản hồi API tìm chuyến `/api/v1/trips/search` bằng Redis Cache (2 SP)**: Cache kết quả tìm chuyến các tuyến hot (TTL 60s), tự động `@CacheEvict` khi có đặt vé mới.
10. **`[S410]` Xử lý ngoại lệ tranh chấp ghế (Concurrency Race Condition) trả về HTTP 409 Conflict rõ ràng (2 SP)**: Bắt lỗi khi 2 người cùng chọn 1 ghế, trả về mã 409 kèm thông báo: *"Ghế này vừa được chọn bởi khách hàng khác"*.
11. **`[S411]` Tối ưu form bán vé nhanh tại quầy `PosTerminalPage`: Tính tiền thừa trả khách & Phím tắt nhanh (1 SP)**: Nhập tiền khách đưa tự động tính tiền thối trả lại, phím tắt `Enter` chốt vé nhanh trong 5 giây.
12. **`[S412]` Tối ưu câu SQL tìm chuyến: Khử triệt để N+1 Queries bằng `@EntityGraph` (1 SP)**: Nạp kèm thông tin nhà xe và tuyến đường trong 1 query duy nhất, giảm 80% số truy vấn database.

### 4. Trần Minh Đức (4 tasks — 6 SP)
13. **`[S413]` Tối ưu luồng Đổi vé (`TicketExchangePage`): Validate chênh lệch giá & Cập nhật sơ đồ ghế (2 SP)**: Tính phụ thu chênh lệch giá vé và trả ghế cũ về `AVAILABLE` ngay lập tức.
14. **`[S414]` Sửa lỗi đồng bộ trạng thái đăng nhập trên Header & Tự động ẩn banner nhắc nhở khi quá giờ (1 SP)**: Đồng bộ session đăng nhập giữa các tab, tự động ẩn thanh nhắc nhở màu vàng khi chuyến xe đã khởi hành.
15. **`[S415]` Tối ưu hiển thị chi tiết vé & In vé PDF/SVG mã QR sắc nét trên di động tại `MyTicketsPage` (2 SP)**: QR Code hiển thị độ tương phản cao, nút in vé / xuất PDF chuẩn khổ giấy di động không tràn màn hình.
16. **`[S416]` Tối ưu UI/UX bảng đánh giá nhà xe (`ReviewsPage`): Bộ lọc sao, loại bỏ fake review & Nhãn xác thực (1 SP)**: Bổ sung bộ lọc đánh giá 1-5 sao, gắn nhãn *"Đã đi chuyến này"*, loại bỏ các review rác thử nghiệm.

### 5. Đoàn Nhật Cường (6 tasks — 11 SP)
17. **`[S417]` Sửa lỗi & Bổ sung Validation toàn diện số điện thoại chuẩn Việt Nam (10 số) và Email (1 SP)**: Validate regex đầu số di động Việt Nam (`03, 05, 07, 08, 09`), báo lỗi đỏ tức thì dưới ô input.
18. **`[S418]` Tối ưu hiệu năng tải trang tĩnh & Thêm Skeleton Loading mượt mà khi fetch chuyến xe tại `TripSearchPage` (1 SP)**: Thêm hiệu ứng khung xương (Skeleton) khi đang tải danh sách chuyến, loại bỏ hiện tượng giật trang.
19. **`[S419]` Tối ưu bản đồ `LiveTrackingMapPage`: Bổ sung nút "Tự động căn chỉnh xe về tâm bản đồ" (Re-center) (1 SP)**: Thêm nút nổi trên bản đồ Leaflet để click đưa vị trí xe `51B-889.99` về chính giữa màn hình.
20. *`[S315]` Code Review & Tối ưu hóa Index PostgreSQL các truy vấn tìm chuyến & ghế (2 SP — Nợ Sprint 3)*.
21. *`[S319]` Form phân công tổ lái & Validate điều kiện xuất bến (3 SP — Nợ Sprint 3)*.
22. *`[S320]` WebApp Quét mã QR soát vé & Điểm danh khách trên xe bằng camera di động (3 SP — Nợ Sprint 3)*.

---

## 📅 PHẦN IV: LỊCH TRÌNH THỰC HIỆN TỪ THỨ HAI ĐẾN THỨ SÁU BẢO VỆ

- **Thứ Hai (16/11)**: Kích hoạt danh sách Sprint 4 trên Trello. Cường tập trung xử lý 3 task nợ cũ (`S315`, `S319`, `S320`). Thành, Phát, Phong hoàn tất các task cấu hình backend, cache Redis và bảo mật CORS.
- **Thứ Ba (17/11)**: Đức và Cường hoàn tất các task giao diện Đổi vé, Validation SĐT, Header và Skeleton Loading.
- **Thứ Tư (18/11)**: Chạy thử nghiệm toàn diện (Integration Testing) 19 tasks trên môi trường thật với dữ liệu Supabase ngày 20/11/2026.
- **Thứ Năm (19/11)**: Khóa code toàn diện (Code Freeze), kiểm tra máy tính thuyết trình, thiết bị di động quét QR và sao lưu file database.
- **Thứ Sáu (20/11) — D-DAY**: **Chính thức Báo cáo Bảo vệ Đồ án Tốt nghiệp OJT trước Hội đồng Giảng viên**.
