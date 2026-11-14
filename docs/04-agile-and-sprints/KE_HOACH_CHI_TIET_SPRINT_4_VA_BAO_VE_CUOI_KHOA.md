# 🚀 KẾ HOẠCH CHI TIẾT SPRINT 4 & CẨM NANG BẢO VỆ ĐỒ ÁN OJT CAPSTONE
## DỰ ÁN: NỀN TẢNG ĐẶT VÉ XE KHÁCH LIÊN TỈNH & QUẢN LÝ NHÀ XE TRAVELEASY
### ĐƠN VỊ: NHÓM 7 (OJT CAPSTONE PROJECT)
### CHỦ TRÌ: PHẠM CÔNG THÀNH (TEAM LEADER)
### THỜI GIAN: 14/11/2026 – 20/11/2026 (NGÀY BẢO VỆ: THỨ SÁU 20/11/2026)

---

## 🎯 PHẦN I: TỔNG QUAN CHIẾN LƯỢC SPRINT 4

Sprint 4 là **Sprint cuối cùng** trong chuỗi 4 tuần Sprint của dự án tốt nghiệp OJT.  
Mục tiêu tối thượng của Sprint này **không phải là mở rộng tính năng**, mà là:
1. **Ổn định hóa hệ thống (System Hardening & Stabilization)**.
2. **Xử lý triệt để 100% nợ kỹ thuật và nợ task từ Sprint 3**.
3. **Chuẩn bị kịch bản trình diễn mượt mà 15 phút không tì vết**.
4. **Phân vai rành mạch, bảo vệ tự tin trước Hội đồng Giảng viên**.

```
+-----------------------------------------------------------------------------------------+
|                                    CHIẾN LƯỢC SPRINT 4                                  |
+-----------------------------------------------------------------------------------------+
|  [14-15/11]: Trả nợ Sprint 3 (8 SP) + Nạp dữ liệu xe thực tế                            |
|  [16/11]:    CODE FREEZE toàn hệ thống + Nghiệm thu 3 task nợ                           |
|  [17/11]:    Hoàn thiện Slide thuyết trình 25 trang + UAT giao diện                     |
|  [18/11]:    Diễn tập Demo lần 1 (Dry Run #1) - Khớp giờ 15 phút                        |
|  [19/11]:    Tổng duyệt lần 2 (Dry Run #2) + Quay Video Backup + Xuất file CSDL .sql    |
|  [20/11]:    🎯 BÁO CÁO BẢO VỆ CHÍNH THỨC TRƯỚC HỘI ĐỒNG OJT                            |
+-----------------------------------------------------------------------------------------+
```

---

## 👥 PHẦN II: MA TRẬN PHÂN CÔNG VÀ STORY POINTS SPRINT 4 (29 SP)

| STT | Thành viên | Username Trello | Vai trò phụ trách | Mã Task | Tên Task chi tiết | SP |
| :---: | :--- | :--- | :--- | :---: | :--- | :---: |
| 1 | **Phạm Công Thành** | `@thanhphmcong1` | Team Leader & System Architect | `[S401]`<br>`[S402]` | - Tổng duyệt Hạ tầng Docker VPS, Demo Hub & Chỉ số sức khỏe JVM<br>- Đóng gói Release v1.0.0 & Quay Video Demo dự phòng Offline | **3 SP**<br>**2 SP** |
| 2 | **Nguyễn Đại Phát** | `@phatnguyn146` | Fullstack Lead / Admin & Tracking | `[S403]`<br>`[S404]` | - Rà soát UAT Cổng Admin, Duyệt Nhà xe & Quản lý Voucher Khuyến mại<br>- Kịch bản Demo Thanh toán Webhook VNPAY & GPS Live Tracking SSE | **3 SP**<br>**2 SP** |
| 3 | **Phạm Thanh Phong** | `@phmthanhphong17` | Backend Core / Concurrency & POS | `[S405]`<br>`[S406]` | - Kịch bản Demo Khóa ghế Concurrency Lock 10:00 Đa luồng<br>- Kịch bản Demo Bán vé POS tại quầy bến xe & Xem trước In vé nhiệt 80mm | **2 SP**<br>**2 SP** |
| 4 | **Trần Minh Đức** | `@minhdctrn13` | Fullstack / Pricing & Operations | `[S407]`<br>`[S408]` | - Dọn dẹp Fixtures dữ liệu mẫu thực tế (5 tuyến xe, nhà xe Sao Việt, Futa)<br>- Kịch bản Demo Đổi vé chuyển chuyến, Trung chuyển & Sổ chi phí P&L | **2 SP**<br>**2 SP** |
| 5 | **Đoàn Nhật Cường** | `@joshliam` | Mobile & App Operations Specialist | `[S315]`<br>`[S319]`<br>`[S320]` | *(Trả nợ Sprint 3)*<br>- Code Review, Explain Analyze & PostgreSQL Index Tuning<br>- Nối logic kiểm tra nồng độ cồn và giờ lái xe liên tục duyệt tổ lái<br>- Test Camera quét QR soát vé WebApp trên điện thoại thật | **2 SP**<br>**3 SP**<br>**3 SP** |
| 6 | **Phan Trung Kiên** | `@kienphantrung8` | QA & BA Documentation Support | `[S409]`<br>`[S410]` | - Hoàn thiện Slide PowerPoint 25 trang chuẩn nhận diện TravelEasy<br>- Đóng bìa tài liệu đồ án, in ấn biên bản bàn giao & hồ sơ OJT | **2 SP**<br>**1 SP** |
| **TỔNG** | **CẢ NHÓM 7** | - | - | **10 Tasks** | **Sprint nhẹ nhàng, an toàn, sẵn sàng 100% cho buổi bảo vệ** | **29 SP** |

---

## 🎙️ PHẦN III: PHÂN VAI THUYẾT TRÌNH BẢO VỆ 15 PHÚT (CHIA ĐỀU CHO CÁC THÀNH VIÊN)

Buổi bảo vệ gồm **15 phút trình bày + 10 phút trả lời phản biện**. Kịch bản phân vai như sau:

### 1. Phút 00:00 – 02:30: Mở Đầu, Báo Cáo Kiến Trúc & Sức Khỏe Hệ Thống
- **Người trình bày**: **Phạm Công Thành**
- **Nội dung**:
  - Giới thiệu đề tài, lý do lựa chọn và giải quyết các bài toán vận tải nhức nhối hiện nay.
  - Trình bày kiến trúc Modular Monolith (Spring Boot 3.3, Java 21, React Vite, PostgreSQL Supabase, Redis Lock).
  - Mở trang Demo Hub (`/demo`), bấm **`Kiểm Tra Sức Khỏe API`**, show trạng thái kết nối DB HikariCP, bộ nhớ JVM RAM xanh mướt.

### 2. Phút 02:30 – 05:30: Trải Nghiệm Khách Hàng, Khóa Ghế Concurrency & Thanh Toán VNPAY
- **Người trình bày**: **Trần Minh Đức** & **Phạm Thanh Phong**
- **Nội dung**:
  - Đức thao tác tìm kiếm chuyến xe Sài Gòn -> Đà Lạt, chọn ghế.
  - Phong mở song song trình duyệt thứ 2 mô phỏng khách khác cùng bấm vào đúng chiếc ghế đó.
  - Chứng minh cơ chế **Concurrency Pessimistic Lock** và đếm ngược 10:00 giữ chỗ qua SSE.
  - Đức tiến hành thanh toán vé qua cổng VNPAY/VietQR tự động.

### 3. Phút 05:30 – 08:30: Nghiệp Vụ Hiện Trường Bến Xe: POS Bán Vé, Tổ Lái & In Lệnh GTVT
- **Người trình bày**: **Phạm Thanh Phong** & **Đoàn Nhật Cường**
- **Nội dung**:
  - Phong demo giao diện POS `/company/pos`: nhân viên bến bán vé tốc hành, in bill nhiệt 80mm có QR code.
  - Cường mở `/company/crew`: điều phối tổ lái, nhập kiểm tra nồng độ cồn 0.00 mg/L và giờ lái xe liên tục để ký lệnh xuất bến.
  - Trình chiếu mẫu **Lệnh Vận Chuyển Điện Tử chuẩn Bộ GTVT** (Nghị định 10/2020/NĐ-CP) có mã QR tra cứu CSGT.

### 4. Phút 08:30 – 11:30: WebApp Soát Vé Di Động, Đổi Vé, Trung Chuyển & Sổ Chi Phí P&L
- **Người trình bày**: **Đoàn Nhật Cường** & **Trần Minh Đức**
- **Nội dung**:
  - Cường cầm điện thoại thật quét mã QR trên vé vừa in ở bước trước -> Hệ thống phát âm thanh "Ting", tự động đổi trạng thái sang "ĐÃ LÊN XE".
  - Đức trình diễn nghiệp vụ khách muốn đổi sang chuyến khác: hệ thống tính bù trừ tiền vé, nhả ghế cũ, giữ ghế mới.
  - Đức mở sổ chi phí `/company/expenses`: kê khai xăng dầu, phí cầu đường BOT, tính toán lợi nhuận ròng P&L cho chuyến xe.

### 5. Phút 11:30 – 13:30: Cổng Quản Trị Sàn Admin, Quản Lý Khuyến Mại & GPS Live Tracking
- **Người trình bày**: **Nguyễn Đại Phát**
- **Nội dung**:
  - Đăng nhập Cổng Admin: duyệt đơn đăng ký nhà xe mới (KYB).
  - Quản lý kho voucher khuyến mại: cấp thêm lượt, xem tỷ lệ sử dụng thực tế.
  - Mở trang `/tracking/:tripId`: demo bản đồ xe chạy thời gian thực qua tín hiệu SSE, hiển thị trạm dừng chân và thời gian đến dự kiến (ETA).

### 6. Phút 13:30 – 15:00: Tổng Kết, Thống Kê Agile/Scrum & Mời Hội Đồng Đặt Câu Hỏi
- **Người trình bày**: **Phạm Công Thành** & **Phan Trung Kiên**
- **Nội dung**:
  - Trình chiếu biểu đồ Burndown Chart, tổng kết 4 Sprint trên Trello, 242 bài test tự động CI/CD đạt 100%.
  - Cảm ơn Thầy Cô Hội đồng và mở màn phần Q&A phản biện.

---

## ❓ PHẦN IV: CẨM NANG DỰ PHÒNG CÂU HỎI PHẢN BIỆN CỦA HỘI ĐỒNG (FAQ DEFENSE)

| Chủ đề câu hỏi | Người trả lời chính | Hướng trả lời ghi điểm tuyệt đối |
| :--- | :---: | :--- |
| **Hệ thống xử lý thế nào khi 100 người cùng bấm mua 1 vé cùng 1 giây?** | **Phạm Thanh Phong** | Sử dụng kết hợp **Pessimistic Lock (`SELECT ... FOR UPDATE`)** tại tầng cơ sở dữ liệu và **Redis Distributed Lock**, đảm bảo chỉ đúng 1 transaction giành được lock. Các transaction khác nhận về exception ngay lập tức và client nhận thông báo ghế đã có người giữ chỗ qua Server-Sent Events (SSE). |
| **Làm sao chống gian lận khi nhân viên soát vé quét QR?** | **Đoàn Nhật Cường** | Mã QR chứa payload có chữ ký số hoặc mã định danh vé duy nhất. Khi quét thành công, trạng thái vé chuyển sang `CHECKED_IN` ngay lập tức. Nếu quét lại lần 2, hệ thống sẽ cảnh báo đỏ *"Vé đã được sử dụng lúc HH:mm bởi nhân viên X"*, ngăn chặn hoàn toàn việc chụp ảnh vé chia sẻ cho người khác. |
| **Tại sao hệ thống lại có chức năng kiểm tra nồng độ cồn và giờ lái xe?** | **Nguyễn Đại Phát** | Đây là yêu cầu thực tế theo Thông tư 12/2020/TT-BGTVT và Nghị định 10/2020/NĐ-CP của Bộ Giao thông Vận tải. Nhà xe bắt buộc phải kiểm tra điều kiện an toàn của tài xế trước khi xuất bến thì Lệnh vận chuyển điện tử mới hợp lệ khi lực lượng CSGT/TTGT kiểm tra trên đường. |
| **Kiến trúc dữ liệu có bị nghẽn cổ chai khi dữ liệu lớn không?** | **Phạm Công Thành** | Toàn bộ cơ sở dữ liệu đã chuẩn hóa 3NF gồm 44 bảng, đánh Index tối ưu trên các trường tìm kiếm tần suất cao (`trip_id`, `route_id`, `departure_time`). Hệ thống sử dụng HikariCP Connection Pool kết hợp SWR Caching ở phía Frontend, đạt tốc độ phản hồi API dưới 150ms. |

---

## 🎒 PHẦN V: CHECKLIST CHUẨN BỊ TRƯỚC GIỜ G (THỨ SÁU 20/11)

- [ ] **Laptop trình chiếu chính**: Sạc đầy pin, tắt thông báo Zalo/Facebook/Teams, cài sẵn trình duyệt mở sẵn 3 cửa sổ (Khách, Nhà xe, Admin).
- [ ] **Điện thoại quét QR**: Bật sẵn 4G, pin > 80%, mở sẵn trang WebApp soát vé.
- [ ] **Video Backup 15 phút**: Lưu sẵn trên desktop máy tính (phòng khi mất mạng wifi trường).
- [ ] **File Backup Database**: Xuất file `traveleasy_backup_final.sql`.
- [ ] **Trang phục**: Áo sơ mi trắng / đồng phục trường, chỉn chu, tác phong chuyên nghiệp.

