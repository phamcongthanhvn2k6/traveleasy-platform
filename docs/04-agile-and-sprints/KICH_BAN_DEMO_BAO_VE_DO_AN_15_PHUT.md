# 🎬 KỊCH BẢN TRÌNH DIỄN DEMO BẢO VỆ ĐỒ ÁN OJT (15 PHÚT — CHUẨN 100/100 ĐIỂM)
**Đề tài**: Nền Tảng Đặt Vé Xe Khách & Điều Hành Vận Tải Bến Xe Liên Tỉnh TravelEasy (`traveleasy-platform`)  
**Đơn vị**: OJT Đồ Án Nhóm 7  
**Thời lượng bảo vệ**: **15 Phút trình diễn trực tiếp + 10 Phút phản biện Hội đồng**  
**Trưởng nhóm / Điều phối demo**: Phạm Công Thành (`phamcongthanhvn2k6` / `thanhphmcong1`)  
**Ngày cập nhật**: 06/11/2026  

---

## 🎯 1. DANH SÁCH TÀI KHOẢN VÀ MÔI TRƯỜNG TRÌNH DIỄN (PRE-DEMO CHECKLIST)

Để buổi demo diễn ra trơn tru không mất 1 giây chuyển đổi tài khoản, chuẩn bị sẵn **3 cửa sổ trình duyệt độc lập** trước giờ G:

| Cửa sổ trình duyệt | Vai trò demo | Đường dẫn mở sẵn | Tài khoản đăng nhập sẵn | Mật khẩu mẫu |
| :--- | :--- | :--- | :--- | :--- |
| **Cửa sổ 1: Chrome chính** | **Khách hàng** & **Demo Hub** | `http://localhost:5173/demo` | `customer@gmail.com` | `123456789@` |
| **Cửa sổ 2: Chrome Ẩn danh** | **Đối tác Nhà xe (POS & Điều hành)** | `http://localhost:5173/company/login` | `operator@futa.vn` *(Phương Trang)* | `123456789@` |
| **Cửa sổ 3: MS Edge / Firefox** | **Quản trị viên Sàn Tổng (Admin)** | `http://localhost:5173/admin/login` | `admin@traveleasy.vn` *(hoặc `daiphat.admin@traveleasy.vn`)* | `123456789@` |
| **Thiết bị phụ: Điện thoại thật** | **Tài xế / Nhân viên soát vé** | Camera điện thoại kết nối mạng nội bộ | Quét trực tiếp mã QR trên vé máy tính | *(Không cần mật khẩu)* |

---

## ⏱️ 2. PHÂN BỔ THỜI GIAN VÀ MA TRẬN PHÂN VAI (TIMELINE RACI)

```
[00:00 - 02:30] ──────► [02:30 - 06:30] ──────► [06:30 - 09:30] ──────► [09:30 - 12:30] ──────► [12:30 - 15:00]
Phạm Công Thành         Trần Minh Đức           Phạm Thanh Phong         Nguyễn Đại Phát         Đoàn Nhật Cường
Kiến trúc, CSDL &       Khách hàng đặt vé,      Hiện trường Bến xe:      Cổng Quản trị Admin,    Tracking GPS SSE,
Sức khỏe hệ thống       Khóa ghế Concurrency    POS bán vé, In bill, QR  Escrow & Audit Logs     Mobile-first, Tổng kết
```

---

## 🎙️ 3. KỊCH BẢN CHI TIẾT TỪNG PHÚT (MINUTE-BY-MINUTE LIVE DEMO RUNBOOK)

---

### ⏱️ CHẶNG 1: MỞ ĐẦU, KIẾN TRÚC & SỨC KHỎE HỆ THỐNG (00:00 - 02:30)
**Người trình bày**: **Phạm Công Thành** *(Trưởng nhóm & Kiến trúc sư hệ thống)*  
**Mục tiêu**: Gây ấn tượng mạnh ngay từ giây đầu tiên về tính chuyên nghiệp, kiến trúc chuẩn mực và độ ổn định hạ tầng.

#### 🗣️ Lời thoại mở đầu:
> *"Kính chào quý Thầy Cô trong Hội đồng chấm thi tốt nghiệp OJT. Em là Phạm Công Thành, đại diện cho Nhóm 7 báo cáo đồ án **TravelEasy Platform** — Nền tảng đặt vé xe khách trực tuyến và quản trị điều hành vận tải liên tỉnh toàn diện.*  
> *Khác biệt với các ứng dụng đặt vé thông thường, TravelEasy giải quyết triệt để 3 bài toán lớn của ngành vận tải hành khách tại Việt Nam: **Thứ nhất**, xử lý tranh chấp khóa ghế đồng thời giờ cao điểm; **Thứ hai**, đồng bộ hiện trường bến xe qua máy POS và camera soát vé QR dưới 0.2 giây; **Thứ ba**, tích hợp hệ sinh thái mở rộng gồm gửi hàng bưu kiện, xe hợp đồng và bản đồ GPS Live Tracking thời gian thực.*  
> *Toàn bộ hệ thống được xây dựng theo kiến trúc **Modular Monolith + Clean Architecture**, Backend Spring Boot 3.3 Java 21, Frontend React 18 TypeScript, và CSDL 44 bảng chuẩn hóa 3NF trên Supabase Cloud (gồm 36 bảng cốt lõi và 8 bảng mở rộng hệ sinh thái)."*

#### 🖥️ Thao tác trực quan trên màn hình chiếu:
1. Mở trang **Demo Hub** tại `http://localhost:5173/demo`.
2. Bấm nút xanh **`Kiểm tra Sức Khỏe Hệ Thống`**:
   - Màn hình hiện Toast thông báo xanh: *`Trạng thái UP - Cơ sở dữ liệu KẾT NỐI TỐT`*.
   - Khối thống kê nhảy số: Uptime, Memory Used < 256MB, 44 bảng CSDL hoạt động hoàn hảo.
3. Thành chỉ tay vào màn hình:
   > *"Như Hội đồng có thể thấy trên màn hình trung tâm Demo Hub, toàn bộ dịch vụ Backend và CSDL Supabase đang kết nối trực tiếp, độ trễ mạng dưới 50ms, bộ nhớ RAM được tối ưu hóa ở mức an toàn. Sau đây, em xin nhường lại phần trình diễn cho bạn Trần Minh Đức để biểu diễn luồng đặt vé và giải thuật khóa ghế Concurrency."*

---

### ⏱️ CHẶNG 2: HÀNH TRÌNH KHÁCH HÀNG & GIẢI THUẬT KHÓA GHẾ CONCURRENCY (02:30 - 06:30)
**Người trình bày**: **Trần Minh Đức** *(Phụ trách Khách hàng & Thanh toán)*  
**Mục tiêu**: Trình diễn luồng tìm chuyến SWR Cache 0ms, sơ đồ 34 ghế Limousine VIP và bài test kinh điển Concurrency Lock.

#### 🗣️ Lời thoại của Đức:
> *"Em xin chào quý Thầy Cô. Em là Trần Minh Đức, phụ trách phân hệ Khách hàng. Em xin bắt đầu với hành trình một hành khách tìm kiếm chuyến xe đi Đà Lạt dịp cuối tuần."*

#### 🖥️ Thao tác trực quan trên màn hình chiếu:
1. **Tìm chuyến xe (`/search`)**:
   - Đức nhập: Nơi đi **`TP. Hồ Chí Minh`** ➔ Nơi đến **`Đà Lạt`** ➔ Ngày đi hôm nay.
   - Bấm **`Tìm Chuyến Xe`**: Kết quả 8+ chuyến xe bung ra tức thì trong 0ms nhờ cơ chế **SWR In-Memory Client Cache**.
   - Đức kéo thanh trượt bộ lọc: Lọc xe Limousine VIP, mức giá từ 300.000đ - 450.000đ, lọc nhà xe Phương Trang.
2. **Chọn ghế Limousine VIP 2 tầng (`BusSeatMap.tsx`)**:
   - Bấm nút **`Chọn Ghế`** tại chuyến 23:00 Phương Trang.
   - Sơ đồ 34 phòng nằm VIP 2 tầng bung ra trực quan (Tầng 1 A01-A17 màu xanh, Tầng 2 B01-B17).
3. **🔥 DEMO CONCURRENCY PESSIMISTIC LOCK (ĐIỂM NHẤN ĂN ĐIỂM 10/10)**:
   - Đức chia đôi màn hình: Cửa sổ trái là Khách A (Chrome thường), Cửa sổ phải là Khách B (Tab ẩn danh).
   - Cả 2 cùng mở sơ đồ ghế của chuyến xe 23:00.
   - **Khách A click chọn ghế `A05`**: Ghế chuyển sang màu cam, đồng hồ **`10:00 phút`** bắt đầu đếm lùi.
   - **Khách B lập tức click vào ghế `A05`**: Hệ thống chặn lại ngay lập tức và bắn thông báo Toast cảnh báo đỏ: *`Ghế A05 đang được giữ chỗ bởi khách hàng khác!`*
   > *Đức giải thích: "Thưa Thầy Cô, ở tầng CSDL em sử dụng **Pessimistic Write Lock (`SELECT ... FOR UPDATE`)** kết hợp TTL 10 phút. Giải thuật này loại bỏ 100% nguy cơ Double-Booking (đặt trùng ghế), bảo vệ quyền lợi tuyệt đối cho người giữ chỗ trước."*
4. **Xác nhận đặt vé & Thanh toán VietQR (`/checkout`)**:
   - Khách A nhập: Tên `Nguyễn Văn An`, SĐT `0987654321`.
   - Chọn điểm đón `Bến xe Miền Đông mới`, điểm trả `Bến xe liên tỉnh Đà Lạt`.
   - Nhập mã giảm giá: `VEXERE50` ➔ Giảm ngay 50.000đ vào tổng tiền.
   - Chọn phương thức: **`Quét mã VietQR Napas 24/7`**.
   - Bấm **`Xác nhận & Thanh toán`**: Modal mã QR VietQR động hiển thị sắc nét cùng mã đơn hàng duy nhất `BK-20261106-XXXX`.
   - Bấm nút giả lập thanh toán thành công ➔ Màn hình nhả vé điện tử kèm **Mã QR Boarding Pass**.
   > *Đức chuyển tiếp: "Tiếp theo, bạn Phạm Thanh Phong sẽ trình diễn hiện trường bến xe thực tế khi nhà xe bán vé quầy POS và kiểm soát vé lên xe."*

---

### ⏱️ CHẶNG 3: HIỆN TRƯỜNG BẾN XE THỰC TẾ: POS BÁN VÉ, IN BILL & QUÉT QR 0.2S (06:30 - 09:30)
**Người trình bày**: **Phạm Thanh Phong** & **Đoàn Nhật Cường**  
**Mục tiêu**: Trình diễn nghiệp vụ bến xe thực tế sát 100% mô hình Phương Trang/Thành Bưởi, kết hợp camera quét QR di động.

#### 🗣️ Lời thoại của Phong:
> *"Em xin chào quý Thầy Cô. Em là Phạm Thanh Phong. Trên thực tế tại các bến xe lớn như Bến xe Miền Đông hay Mỹ Đình, có tới 35% lượng khách là người lớn tuổi hoặc khách vãng lai mua vé trực tiếp tại quầy bến xe của nhà xe. Vì vậy, em đã phát triển phân hệ **POS Terminal Bến Xe** chuyên dụng dành riêng cho nhân viên nhà xe."*

#### 🖥️ Thao tác trực quan trên màn hình chiếu:
1. **Mở Cổng Nhà xe POS (`/company/pos`)**:
   - Phong chuyển sang Cửa sổ 2 (nhà xe Phương Trang).
   - Màn hình POS tối giản, tối ưu thao tác bằng phím tắt:
     - Nhấn **F2**: Chọn chuyến xe đi Đà Lạt.
     - Nhấn chọn ghế **`A08`**.
     - Nhập tên khách vãng lai: `Bác Ba`, SĐT: `0912345678`.
     - Nhấn **F9 (Tiền Mặt)** ➔ Xuất vé chỉ trong **3 cú click (chưa đầy 8 giây)**!
2. **In Vé Nhiệt Bến Xe (Thermal Bill 80mm)**:
   - Hệ thống mở popup in hóa đơn nhiệt tiêu chuẩn 80mm có logo Phương Trang, thông tin biển số xe, số ghế `A08` và **Mã QR vé bảo mật**.
3. **Đồng bộ thời gian thực (Zero-Conflict)**:
   - Phong quay lại màn hình khách hàng F5: Ghế `A08` trên Web khách hàng lập tức chuyển sang màu xám `ĐÃ BÁN`!
4. **📷 CƯỜNG CẦM ĐIỆN THOẠI QUÉT QR SOÁT VÉ TRỰC TIẾP (< 0.2 GIÂY)**:
   - Cường bật camera điện thoại thật (hoặc webcam laptop) mở trang `/scanner`.
   - Đưa camera soi vào mã QR trên hóa đơn mà Phong vừa in trên màn hình.
   - **"TÍT!"**: Hệ thống nhận diện mã vé trong **0.18 giây**, màn hình điện thoại lóe sáng xanh:
     - *`VÉ HỢP LỆ — Khách: Bác Ba | Chuyến: Sài Gòn - Đà Lạt | Ghế: A08`*.
   - Cường bấm nút **`Xác nhận Cho Lên Xe`**: Trạng thái vé lập tức cập nhật sang `CHECKED_IN` / `USED`.
   - Cường thử quét lại lần 2: Hệ thống lập tức báo đỏ cảnh báo âm thanh: *`CẢNH BÁO: Vé này đã được check-in lúc HH:mm! Từ chối lên xe!`*
   > *Cường giải thích: "Cơ chế này ngăn chặn tuyệt đối tình trạng gian lận chụp ảnh màn hình vé gửi cho nhiều người cùng đi lậu trên 1 vé."*

---

### ⏱️ CHẶNG 4: HỆ SINH THÁI MỞ RỘNG BẾN XE: CARGO, THUÊ XE & GPS TRACKING (09:30 - 12:30)
**Người trình bày**: **Đoàn Nhật Cường** & **Nguyễn Đại Phát**  
**Mục tiêu**: Trình diễn các tính năng vượt trội nâng tầm đề tài lên mức Enterprise: Bản đồ GPS vệ tinh, Ký gửi hàng hóa và Ký quỹ Escrow.

#### 🗣️ Lời thoại của Cường:
> *"Để giải quyết nỗi lo lắng của người nhà khi đón khách lúc nửa đêm, nhóm em đã phát triển tính năng **Bản đồ Định vị GPS Live Tracking xe chạy thời gian thực**."*

#### 🖥️ Thao tác trực quan trên màn hình chiếu:
1. **Live Tracking Xe Chạy Thời Gian Thực (`/tracking/:tripId`)**:
   - Cường mở đường dẫn `/tracking/101`.
   - Bản đồ tương tác vệ tinh Leaflet hiển thị lộ trình TP.HCM ➔ Đà Lạt.
   - Icon xe khách màu đỏ di chuyển mượt mà dọc theo Quốc lộ 20 theo từng giây nhờ giao thức **Server-Sent Events (SSE)**, hiển thị thời gian dự kiến tới trạm dừng chân (ETA) và tốc độ xe chạy 75 km/h.
2. **Ký Gửi Bưu Kiện Hầm Xe (`/cargo`)**:
   - Cường chuyển sang trang `/cargo`:
     - Nhập kiện hàng: `Thùng trái cây sầu riêng`, nặng `15 kg`.
     - Hệ thống tự động tính cước theo biểu phí bến xe: `120.000 VNĐ`.
     - Bấm đặt gửi hàng ➔ Sinh mã vận đơn bưu kiện kèm **Tem nhãn QR dán kiện hàng**.
3. **Cổng Quản Trị Admin & Ký Quỹ Escrow 30% (`/admin/charters`)**:
   - Phát chuyển sang Cửa sổ 3 (Cổng Admin):
     - Mở trang `/admin/charters`: Quản lý danh sách các hợp đồng thuê xe du lịch 45 chỗ trọn gói đi Vũng Tàu.
     - Phát chỉ vào cột **Ký quỹ Escrow**: Sàn TravelEasy giữ 30% tiền cọc (3.000.000 VNĐ).
     - Bấm nút **`Phê Duyệt & Giải Ngân Escrow`**: Hệ thống chuyển tiền cho nhà xe sau khi nhận được xác nhận chuyến đi an toàn từ hành khách.
4. **Vết Kiểm Toán Bất Biến (`/admin/audit-logs`)**:
   - Phát mở bảng Audit Logs: Hiển thị ngay lập tức dòng log vừa thực hiện: *`ADMIN duyệt giải ngân hợp đồng CH-001 lúc HH:mm:ss, IP 127.0.0.1`*.
   > *Phát nhấn mạnh: "Bảng `audit_logs` được thiết kế theo nguyên tắc Append-Only, chỉ cho INSERT, không cho sửa xóa, bảo vệ tính trung thực của kiểm toán tài chính sàn."*

---

### ⏱️ CHẶNG 5: TỔNG KẾT, TIÊU CHÍ QA & KẾT LUẬN (12:30 - 15:00)
**Người trình bày**: **Phạm Công Thành** *(Trưởng nhóm)*  
**Mục tiêu**: Đóng gói đồ án, khẳng định chất lượng kỹ thuật, trình bày các chỉ số QA và cảm ơn Hội đồng.

#### 🗣️ Lời thoại kết thúc:
> *"Kính thưa quý Thầy Cô, trong suốt 4 Sprint vừa qua, Nhóm 7 đã hoàn thành xuất sắc **100% mục tiêu của đề tài** với những con số minh chứng rõ ràng:*  
> *1. Toàn bộ **84 User Stories & Tasks** của 3 Sprint được nghiệm thu hoàn chỉnh trên bảng Trello.*  
> *2. Bộ kiểm thử tự động **25/25 Test Cases** JUnit 5 và Playwright E2E đạt tỷ lệ **Pass 100%**.*  
> *3. Toàn bộ mã nguồn đã được đóng gói container hóa qua **Docker Compose Production** và gắn thẻ phát hành chính thức `v1.0.0-production`.*  
> *Nhóm 7 xin chân thành cảm ơn sự hướng dẫn tận tình của quý Thầy Cô bộ môn OJT trong suốt quá trình thực hiện đồ án. Chúng em xin phép được lắng nghe nhận xét và sẵn sàng đón nhận các câu hỏi phản biện từ Hội đồng!"*

---

## 🛡️ 4. BỘ CÂU HỎI PHẢN BIỆN HÓC BÚA NHẤT CỦA HỘI ĐỒNG & CÂU TRẢ LỜI CHUẨN 10 ĐIỂM

Dưới đây là 5 câu hỏi kinh điển mà các Giảng viên thường chất vấn nhiều nhất, đã được chuẩn bị sẵn câu trả lời đạt điểm tối đa:

### ❓ Câu hỏi 1 (Về Concurrency & Database):
> *"Tại sao nhóm lại dùng Pessimistic Lock thay vì Optimistic Lock khi giữ chỗ vé xe khách? Nếu hàng nghìn người cùng tranh 1 ghế thì có bị nghẽn (Bottleneck) không?"*
* **Trả lời chuẩn (Phong/Thành)**:  
  *"Dạ thưa Thầy Cô, trong bài toán bán vé xe Tết, số lượng ghế là hữu hạn (chỉ 34 ghế) nhưng mức độ tranh chấp cùng 1 chỗ nằm VIP là cực kỳ gay gắt. Nếu dùng Optimistic Lock (`@Version`), hệ thống sẽ ném ngoại lệ `OptimisticLockException` liên tục khiến 999 khách hàng bị bắn lỗi văng ra ngoài, tạo trải nghiệm rất tệ.  
  Vì vậy, nhóm em sử dụng **Pessimistic Write Lock (`SELECT ... FOR UPDATE`)** với phạm vi khóa cực hẹp (Row-level lock trên đúng 1 dòng ID ghế đó), kết hợp thời gian sống TTL 10 phút lưu trong Redis/Database. Khi một người giữ ghế, các request sau chỉ phải chờ vài mili-giây để nhận kết quả ghế đã bị khóa và lập tức chuyển sang chọn ghế khác. Điều này bảo đảm tính toàn vẹn (ACID) và giữ hệ thống hoạt động ổn định không bị deadlock."*

---

### ❓ Câu hỏi 2 (Về Bảo mật & Kiến trúc):
> *"Làm thế nào để đảm bảo một nhân viên nhà xe Phương Trang không thể xem lén doanh thu hoặc danh sách khách hàng của nhà xe Thành Bưởi?"*
* **Trả lời chuẩn (Thành)**:  
  *"Dạ thưa Thầy Cô, nhóm áp dụng giải pháp **Multi-Tenant Isolation** tại tầng Application và Database:  
  1. Khi đối tác đăng nhập, Token JWT được ký kèm `company_id` của hãng xe đó.  
  2. Toàn bộ các câu lệnh JPA Repository trong phân hệ nhà xe đều bắt buộc phải có điều kiện ràng buộc `WHERE company_id = :currentCompanyId` lấy trực tiếp từ Security Context.  
  3. Giao diện Cổng nhà xe độc lập hoàn toàn với Admin Portal thông qua Guard bảo vệ `CompanyAuthGuard`. Dù nhân viên có cố tình sửa URL sang `/admin` hay thay đổi ID trên API, hệ thống sẽ lập tức chặn lại bằng mã lỗi `403 Forbidden`."*

---

### ❓ Câu hỏi 3 (Về Tính năng QR Soát vé):
> *"Nếu hành khách chụp ảnh màn hình mã QR vé gửi cho bạn bè, hoặc bến xe bị mất sóng điện thoại thì tài xế có soát vé được không?"*
* **Trả lời chuẩn (Cường)**:  
  *"Dạ thưa Thầy Cô, nhóm đã giải quyết trọn vẹn cả 2 tình huống này:  
  - **Trường hợp gian lận chụp ảnh gửi cho nhiều người**: Khi quét lần đầu, trạng thái vé ngay lập tức đổi sang `CHECKED_IN` trong CSDL. Người thứ 2 đưa ảnh đó ra quét, hệ thống quét QR sẽ phát cảnh báo đỏ và loa báo động 'Vé đã được sử dụng lúc 22:30'.  
  - **Trường hợp bến xe mất mạng Internet**: Ứng dụng tích hợp công nghệ **Offline Local Storage**. Khách hàng chỉ cần mở sẵn vé trước đó, dữ liệu vé và mã QR vẫn hiển thị sắc nét không cần mạng. Phía tài xế có chế độ lưu đệm danh sách khách ngoại tuyến và tự động đồng bộ (Sync) lên máy chủ ngay khi có lại kết nối 4G."*

---

### ❓ Câu hỏi 4 (Về Thanh toán & Giao dịch):
> *"Nếu khách hàng đang thanh toán qua VietQR mà mạng bị rớt hoặc khách hủy giữa chừng thì tiền và ghế được xử lý thế nào?"*
* **Trả lời chuẩn (Đức)**:  
  *"Dạ thưa Thầy Cô, toàn bộ nghiệp vụ đặt vé được bao bọc trong giao dịch nguyên tử `@Transactional(isolation = Isolation.SERIALIZABLE)`. Khi khách chọn ghế, hệ thống cấp thời gian đếm ngược 10:00 phút.  
  Nếu quá 10 phút mà webhook ngân hàng chưa gửi tín hiệu `PAID`, một tác vụ định kỳ (Scheduled Background Job) sẽ tự động giải phóng ghế trở lại trạng thái `AVAILABLE` cho khách khác mua. Nếu khách chủ động bấm Hủy, hệ thống lập tức rollback trạng thái ghế ngay tức khắc."*

---

### ❓ Câu hỏi 5 (Về Quản trị Vận hành & Phí hoa hồng):
> *"Mô hình đối soát doanh thu giữa Sàn và các Nhà xe hoạt động ra sao?"*
* **Trả lời chuẩn (Phát)**:  
  *"Dạ thưa Thầy Cô, TravelEasy áp dụng cơ chế **Net Payout Escrow**:  
  Toàn bộ tiền vé khách thanh toán online ban đầu được giữ tại tài khoản trung gian của Sàn. Định kỳ hàng tuần hoặc sau khi chuyến xe hoàn thành an toàn, hệ thống tự động chạy bảng đối soát khấu trừ đúng **10% phí hoa hồng sàn**, và xuất phiếu kết toán 90% doanh thu thực nhận về ví của nhà xe. Mọi giao dịch đối soát đều ghi vết vào sổ cái bất biến `audit_logs` để kế toán hai bên đối chiếu minh bạch."*

---

## 📋 5. BẢNG CHECKLIST CHUẨN BỊ TRƯỚC GIỜ BẢO VỆ 30 PHÚT

- [ ] **Kiểm tra nguồn điện & mạng**: Cắm sạc laptop 100%, kết nối mạng Wi-Fi ổn định (chuẩn bị sẵn 1 điện thoại phát 4G dự phòng).
- [ ] **Khởi động server**:
  ```powershell
  # Terminal 1 - Backend:
  cd backend; ./mvnw spring-boot:run
  # Terminal 2 - Frontend:
  cd frontend; npm run dev
  ```
- [ ] **Mở sẵn 3 cửa sổ trình duyệt**:
  - Tab 1: `http://localhost:5173/demo`
  - Tab 2: `http://localhost:5173/company/pos` (Đăng nhập sẵn `operator@futa.vn`)
  - Tab 3: `http://localhost:5173/admin/dashboard` (Đăng nhập sẵn `admin@traveleasy.vn`)
- [ ] **Điện thoại quét mã QR**: Bật sẵn camera hoặc truy cập `http://<ip-may-tinh>:5173/scanner`.
- [ ] **File Slide thuyết trình**: Mở sẵn ở chế độ Presenter View.
- [ ] **Trang phục**: Áo sơ mi chỉnh tề, tinh thần tự tin, đoàn kết hỗ trợ đồng đội!

---
*Chúc Nhóm 7 tự tin làm chủ toàn bộ bài thuyết trình và giành trọn điểm số 100/100 tuyệt đối trước Hội đồng OJT!* 🚀

