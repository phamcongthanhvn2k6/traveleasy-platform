# CẨM NANG HƯỚNG DẪN SỬ DỤNG & VẬN HÀNH TRAVELEASY PLATFORM
## TÀI LIỆU HƯỚNG DẪN CHI TIẾT DÀNH CHO KHÁCH HÀNG, ĐỐI TÁC NHÀ XE & QUẢN TRỊ VIÊN
### MÃ DỰ ÁN: `PRJ-TRAVELEASY-MVP-01` | MÔ HÌNH VẬN HÀNH: VEXERE PLATFORM

---

> **MỤC TIÊU TÀI LIỆU:** Cung cấp hướng dẫn toàn diện từ A-Z cho cả 3 đối tượng người dùng trong hệ sinh thái TravelEasy Platform, kèm hình ảnh minh chứng thực tế trên từng giao diện màn hình và các bước xử lý lỗi thường gặp.

---

## MỤC LỤC
1. [PHẦN 1: HƯỚNG DẪN DÀNH CHO KHÁCH HÀNG (CUSTOMER PORTAL)](#phần-1-hướng-dẫn-dành-cho-khách-hàng-customer-portal)
   - 1.1 Tìm kiếm chuyến xe & Áp dụng bộ lọc thông minh
   - 1.2 Xem chi tiết chuyến xe & Chọn vị trí giường nằm 2 tầng
   - 1.3 Khóa giữ chỗ độc quyền 10 phút & Điền thông tin hành khách
   - 1.4 Thanh toán trực tuyến đa kênh an toàn (VietQR, VNPAY, COD)
   - 1.5 Tra cứu vé điện tử & Mã QR Check-in ngoại tuyến
   - 1.6 Quản lý lịch sử vé & Yêu cầu hoàn hủy / Đổi vé tự động
2. [PHẦN 2: HƯỚNG DẪN DÀNH CHO ĐỐI TÁC NHÀ XE (PARTNER PORTAL)](#phần-2-hướng-dẫn-dành-cho-đối-tác-nhà-xe-partner-portal)
   - 2.1 Đăng nhập & Cô lập phạm vi dữ liệu nhà xe (Multi-Tenancy)
   - 2.2 Quản lý phương tiện, sơ đồ ghế & Đội ngũ tài xế
   - 2.3 Điều hành chuyến xe, định cấu hình giá vé & Điểm đón trả
   - 2.4 Ứng dụng Soát vé QR trên di động (Anti-Rescan Protection)
   - 2.5 Bảng đối soát tài chính, doanh thu & Đánh giá chất lượng
3. [PHẦN 3: HƯỚNG DẪN DÀNH CHO QUẢN TRỊ VIÊN (SUPER ADMIN PORTAL)](#phần-3-hướng-dẫn-dành-cho-quản-trị-viên-super-admin-portal)
   - 3.1 Bảng điều khiển tổng quan chỉ số toàn sàn (Executive Dashboard)
   - 3.2 Phê duyệt hồ sơ đối tác nhà xe mới
   - 3.3 Quản trị danh mục dữ liệu gốc (Master Data)
   - 3.4 Cấu hình chính sách hủy vé & Hoàn tiền tự động
   - 3.5 Kiểm soát nhật ký kiểm toán (Audit Logs) qua `X-Correlation-Id`
4. [PHẦN 4: HƯỚNG DẪN XỬ LÝ SỰ CỐ & CÂU HỎI THƯỜNG GẶP (FAQ)](#phần-4-hướng-dẫn-xử-lý-sự-cố--câu-hỏi-thường-gặp-faq)

---

## PHẦN 1: HƯỚNG DẪN DÀNH CHO KHÁCH HÀNG (CUSTOMER PORTAL)

### 1.1 Tìm kiếm chuyến xe & Áp dụng bộ lọc thông minh
1. **Truy cập Trang chủ** (`http://localhost:5173/` hoặc `http://localhost:3000/`):
   - Tại thanh tìm kiếm trung tâm (Hero Search Bar), chọn **Nơi xuất phát** (ví dụ: *TP. Hồ Chí Minh*, *Hà Nội*, *Đà Nẵng*).
   - Chọn **Nơi đến** (ví dụ: *Đà Lạt*, *Nha Trang*, *Cần Thơ*, *Sa Pa*, *Vũng Tàu*).
   - Chọn **Ngày đi** và nhấn nút **"Tìm chuyến xe"**.
2. **Sử dụng Bộ lọc đa tiêu chí (Smart Filter)**:
   - **Khoảng giá**: Kéo thanh trượt để lọc chuyến xe theo ngân sách (từ 100.000đ đến 1.000.000đ).
   - **Khung giờ chạy**: Chọn Sáng (06:00 - 12:00), Chiều (12:00 - 18:00) hoặc Đêm (18:00 - 24:00).
   - **Loại xe**: Chọn *Limousine VIP 34 phòng*, *Giường nằm tiêu chuẩn*, hoặc *Cabin Cung điện*.
   - **Nhà xe ưa thích**: Tích chọn *TravelEasy Express*, *Phương Trang (FUTA)*, *Thành Bưởi*, *Sao Việt*, hoặc *Kumho Samco*.
   - *Minh chứng giao diện*: ![Customer Search Results](screenshots/screenshot_customer_search_enriched.png)

### 1.2 Xem chi tiết chuyến xe & Chọn vị trí giường nằm 2 tầng
1. **Xem thông tin chi tiết**:
   - Nhấn vào chuyến xe mong muốn để xem tiện ích đi kèm: WiFi tốc độ cao, cổng sạc Type-C, nước uống, chăn gối khử khuẩn.
   - Xem lộ trình trạm dừng dọc đường kèm giờ đến dự kiến (ETA) chính xác.
2. **Chọn ghế trên sơ đồ 34 phòng Limousine**:
   - Hệ thống hiển thị 2 tầng xe riêng biệt:
     - **Tầng 1 (Dưới - Ký hiệu A01 đến A17)**: Vị trí êm ái, chống say xe, phù hợp người lớn tuổi và trẻ nhỏ.
     - **Tầng 2 (Trên - Ký hiệu B01 đến B17)**: Không gian thoáng đãng, ngắm cảnh đường trường.
   - **Quy ước màu sắc trên sơ đồ**:
     - **Màu Trắng/Xanh**: Ghế trống đang mở bán (`AVAILABLE`), có thể bấm chọn.
     - **Màu Cam/Xanh dương**: Ghế bạn đang chọn (`SELECTED`).
     - **Màu Vàng (LOCKED)**: Ghế đang được khách hàng khác giữ chỗ thanh toán trong 10 phút.
     - **Màu Xám (BOOKED)**: Ghế đã được người khác đặt trước.
   - *Lưu ý*: Mỗi hành khách được chọn tối đa 4 ghế trong một lượt đặt vé.

### 1.3 Khóa giữ chỗ độc quyền 10 phút & Điền thông tin hành khách
1. **Đồng hồ đếm ngược giữ chỗ (10:00)**:
   - Ngay khi bấm "Tiếp tục", hệ thống kích hoạt cơ chế khóa bi quan (**Pessimistic Lock**) trong vòng 600 giây. Không ai khác có thể chọn trùng ghế của bạn trong thời gian này.
   - Khi đồng hồ còn dưới 2 phút, cảnh báo nhấp nháy đỏ sẽ nhắc nhở hoàn tất giao dịch.
2. **Điền thông tin liên hệ**:
   - Nhập Họ và tên hành khách.
   - Nhập Số điện thoại (10 chữ số) để nhận mã vé và tài xế liên hệ khi đón xe.
   - Nhập Email để nhận vé điện tử định dạng chuẩn.
   - Chọn điểm đón và điểm trả thực tế trong danh sách trạm dừng.
   - *Minh chứng giao diện*: ![Vexere Checkout Page](screenshots/screenshot_vexere_checkout_page.png)

### 1.4 Thanh toán trực tuyến đa kênh an toàn
Hệ thống hỗ trợ 3 phương thức thanh toán linh hoạt:
1. **Chuyển khoản Ngân hàng (VietQR)**:
   - Màn hình hiển thị mã QR động chứa đầy đủ thông tin: Ngân hàng thụ hưởng, Số tài khoản, Số tiền chính xác và Nội dung chuyển khoản tự động (`BK-...`).
   - Mở ứng dụng ngân hàng bất kỳ, quét mã QR và xác nhận chuyển tiền.
   - Nút *"Xác nhận đã chuyển khoản"* hoặc *"Thanh toán thử nghiệm (Demo)"* giúp nghiệm thu giao dịch ngay lập tức.
   - *Minh chứng giao diện*: ![Payment VietQR Modal](screenshots/screenshot_payment_vietqr_modal.png)
2. **Cổng thanh toán VNPay**:
   - Hỗ trợ thanh toán qua thẻ ATM nội địa, thẻ quốc tế Visa/Mastercard hoặc ứng dụng ngân hàng.
   - *Minh chứng giao diện*: ![Payment VNPay Modal](screenshots/screenshot_vnpay_modal_ready.png)
3. **Thanh toán tiền mặt tại nhà xe (COD)**:
   - Áp dụng cho các chuyến xe xuất phát sau thời điểm đặt tối thiểu 24 giờ.

### 1.5 Tra cứu vé điện tử & Mã QR Check-in ngoại tuyến
- **Truy cập:** `http://localhost:5173/lookup` hoặc quét QR code trên vé.
- **Thao tác:** Nhập Mã vé (Ví dụ: `DEMO-TICKET-2026`) và Số điện thoại đặt vé.
- **Kết quả:** Hiển thị toàn bộ thông tin chuyến xe, vị trí ghế, thời gian đón, mã QR bảo mật và nút **"Tải Vé Dạng Ảnh/PDF"**. Vé đã tra cứu được lưu tự động vào `localStorage` của trình duyệt để có thể mở lại ngay cả khi mất sóng Internet trên xe.

### 1.6 Quản lý lịch sử vé & Yêu cầu hoàn hủy / Đổi vé tự động
- **Truy cập:** `http://localhost:5173/my-tickets` (Yêu cầu đăng nhập tài khoản).
- **Chính sách hoàn tiền tự động:**
  - Hủy trước giờ chạy > 24 giờ: Khách được hoàn **90% - 95%** giá vé.
  - Từ 12 đến 24 giờ: Khách được hoàn **70%** giá vé.
  - Dưới 12 giờ: Không áp dụng hoàn vé theo quy chế vận tải.
- **Thao tác hoàn vé:** Nhấn "Yêu Cầu Hủy Vé" -> Chọn lý do -> Xác nhận tài khoản ngân hàng nhận tiền hoàn. Hệ thống tự động giải phóng ghế về trạng thái TRỐNG ngay lập tức.

---

## PHẦN 2: HƯỚNG DẪN DÀNH CHO ĐỐI TÁC NHÀ XE (PARTNER PORTAL)

### 2.0 Quy trình Nộp Đơn Đăng Ký Đối Tác Mở Bán Vé Trực Tuyến (Dành cho Doanh nghiệp Vận tải Mới)
1. **Truy cập Cổng Đăng Ký Hợp Tác:**
   - Tại trang chủ TravelEasy, nhấn vào nút **"Hợp tác mở bán vé"** trên thanh điều hướng hoặc truy cập trực tiếp `http://localhost:5173/partner`.
2. **Khai báo Hồ sơ 5 Bước Chuẩn Pháp Lý:**
   - **Bước 1 (Thông tin Pháp nhân):** Nhập Tên doanh nghiệp/Hợp tác xã theo ĐKKD, Tên thương mại hiển thị cho hành khách (VD: *Thành Bưởi*, *Phương Trang FUTA*), Mã số thuế (10 hoặc 13 chữ số), Địa chỉ trụ sở và Văn phòng giao dịch.
   - **Bước 2 (Giấy phép Vận tải):** Khai báo Số Giấy phép Kinh doanh Vận tải bằng ô tô do Sở GTVT cấp, Ngày cấp, Nơi cấp và Ngày hết hạn (phải còn hiệu lực tối thiểu 06 tháng).
   - **Bước 3 (Tài liệu Số hóa):** Tải lên file ảnh chụp/scan bản gốc Giấy chứng nhận ĐKKD, Giấy phép Kinh doanh Vận tải, Logo thương hiệu và ảnh chụp phương tiện tiêu biểu.
   - **Bước 4 (Người đại diện, CCCD & Ngân hàng Quyết toán):**
     - Khai báo Họ tên, Chức vụ và Số CCCD của Người đại diện pháp luật.
     - **Bắt buộc tải lên file ảnh chụp 2 mặt Căn cước công dân (CCCD) gắn chip** của Người đại diện theo pháp luật: ảnh rõ nét 4 góc, thấy rõ số định danh cá nhân để đối chiếu với ĐKKD.
     - Số điện thoại Hotline đặt vé và Email chính thức nhận đối soát.
     - **Tài khoản Ngân hàng Quyết toán Ký quỹ (Escrow):** Nhập Số tài khoản, Ngân hàng, Chi nhánh và Tên chủ tài khoản (**Bắt buộc phải trùng khớp với Tên doanh nghiệp hoặc Tên người đại diện trên GPKD** để chống rửa tiền).
   - **Bước 5 (Ký cam kết Quy chế & Nộp đơn):** Đọc và tích chọn cam kết chấp thuận *Quy chế Sàn TMĐT TravelEasy*, *Cam kết bồi thường 150% nếu bán trùng vé*, *Tỷ lệ chiết khấu sàn*. Nhấn nút **"Nộp Hồ Sơ Đăng Ký Đối Tác"**.
3. **Nhận Mã Hồ Sơ & Kết Quả Tiếp Nhận:**
   - Hệ thống cấp Mã hồ sơ duy nhất (`registrationTicketCode`) và gửi Email tự động xác nhận tiếp nhận hồ sơ.
   - Hồ sơ được chuyển vào hàng đợi thẩm định của Quản trị viên sàn (`status = 'PENDING_APPROVAL'`). Thời gian xét duyệt tiêu chuẩn: từ 24h đến 48h làm việc.

### 2.1 Đăng nhập & Cô lập phạm vi dữ liệu nhà xe (Multi-Tenancy)
- **Truy cập:** `http://localhost:5173/company/login`.
- **Tài khoản mẫu:** `partner@traveleasy.vn` / `123456789@`.
- **Bảo mật đa tầng:** Backend tự động trích xuất `companyId` từ JWT Token và áp dụng lọc dữ liệu triệt để. Nhà xe A không bao giờ có thể xem hoặc chỉnh sửa chuyến xe, doanh thu của Nhà xe B.

### 2.2 Quản lý phương tiện & Thẩm định 4 Giấy tờ xe bắt buộc
- **Truy cập:** `http://localhost:5173/company/vehicles`.
- **Thao tác Đăng ký xe mới (Tuân thủ Nghị định 10/2020/NĐ-CP):**
  1. Khai báo thông số kỹ thuật: Biển kiểm soát (VD: `51B-888.99`), Loại xe (Ghế ngồi, Giường nằm, Limousine VIP 34 phòng), Hãng sản xuất, Năm sản xuất.
  2. **Bắt buộc tải lên Đủ Bộ 4 Loại Giấy Tờ Lưu Hành Xe Hợp Pháp:**
     - **(1) Giấy chứng nhận Đăng ký xe ô tô (Cà vẹt xe):** Tải lên bản chụp 2 mặt (`registration_certificate_url`).
     - **(2) Sổ Đăng kiểm (An toàn Kỹ thuật & Bảo vệ Môi trường):** Tải lên ảnh chụp sổ đăng kiểm (`inspection_certificate_url`) và Khai báo Ngày hết hạn đăng kiểm (phải còn hạn **tối thiểu 30 ngày** tại thời điểm đăng ký).
     - **(3) Bảo hiểm Bắt buộc TNDS & Bảo hiểm Tai nạn Hành khách:** Tải lên chứng nhận bảo hiểm (`insurance_certificate_url`) và Khai báo Ngày hết hạn bảo hiểm.
     - **(4) Phù hiệu Xe Khách (Sở GTVT cấp):** Tải lên ảnh phù hiệu dán trên kính (`badge_url`), khai báo Số phù hiệu và Ngày hết hạn.
  3. **Quy tắc Kiểm duyệt & Khóa An Toàn Tự Động:**
     - Nếu thiếu bất kỳ 1 trong 4 loại giấy tờ trên hoặc giấy tờ đã quá hạn, hệ thống **lập tức chặn** không cho lưu xe.
     - **Chỉ xe có `compliance_status = 'VERIFIED'` mới được phép gán vào Chuyến đi (`Trip`)** để mở bán vé.
     - **Khóa tự động khi hết hạn (Auto-Lock on Expiry):** Đúng 00:00 của ngày hết hạn đăng kiểm/bảo hiểm, hệ thống tự động khóa xe (`compliance_status = 'EXPIRED'`) và cấm gán vào các chuyến đi tương lai.

### 2.3 Điều hành chuyến xe, định cấu hình giá vé & Điểm đón trả
- **Truy cập:** `http://localhost:5173/company/trips`.
- **Tạo chuyến xe mới:**
  - Chọn tuyến đường được cấp phép (VD: Sài Gòn - Đà Lạt).
  - Chọn phương tiện và tài xế phụ trách.
  - Thiết lập giờ xuất bến, giờ dự kiến đến nơi.
  - Định cấu hình giá vé cơ sở và phụ thu ngày lễ Tết.

### 2.4 Ứng dụng Soát vé QR trên di động (Anti-Rescan Protection)
- **Truy cập:** nút **"📷 Mở Máy Quét QR Soát Vé (Check-in)"** tại trang Điều hành đặt vé `http://localhost:5173/company/bookings` hoặc trang Tra cứu vé `http://localhost:5173/lookup`.
- **Thao tác:**
  1. Cấp quyền truy cập camera trên điện thoại thông minh hoặc máy tính bảng.
  2. Đưa camera hướng vào mã QR trên điện thoại của khách hàng.
  3. Hệ thống kiểm tra chữ ký mã hóa `qrCodeHash`.
     - *Hợp lệ:* Hiển thị thẻ Xanh - Tên khách, ghế ngồi, trạng thái chuyển sang **USED (Đã lên xe)**.
     - *Quét trùng lần 2:* Hiển thị cảnh báo Đỏ - "Vé này đã được soát vào lúc HH:mm".

### 2.5 Bảng đối soát tài chính, doanh thu & Đánh giá chất lượng
- **Truy cập:** `http://localhost:5173/company/reports` và `http://localhost:5173/company/reviews`.
- **Đối soát:** Theo dõi doanh thu thực nhận sau khi trừ phí hoa hồng sàn (Commission 5-8%).
- **Phản hồi đánh giá:** Xem nhận xét 1-5 sao của khách hàng và gửi phản hồi chăm sóc khách hàng công khai.

---

## PHẦN 3: HƯỚNG DẪN DÀNH CHO QUẢN TRỊ VIÊN (SUPER ADMIN PORTAL)

### 3.1 Bảng điều khiển tổng quan chỉ số toàn sàn (Executive Dashboard)
- **Truy cập:** `http://localhost:5173/admin/login` -> Chuyển hướng tới `http://localhost:5173/admin`.
- **Tài khoản:** `admin@traveleasy.vn` / `123456789@`.
- **Chỉ số theo dõi thời gian thực:**
  - Tổng số vé bán thành công trong ngày / tuần / tháng.
  - Tổng GMV (Gross Merchandise Value) và doanh thu hoa hồng sàn.
  - Tỷ lệ lấp đầy ghế bình quân (Seat Occupancy Rate).

### 3.2 Thẩm Định Hồ Sơ Pháp Lý & Phê Duyệt Đối Tác Nhà Xe (Admin KYB Workflow)
- **Truy cập:** `http://localhost:5173/admin/bus-companies` (Tab *Duyệt đối tác chờ thẩm định*).
- **Quy trình Thẩm định 4 Bước Nghiêm Ngặt:**
  1. **Bước 1 (Tiếp nhận hàng đợi):** Admin xem danh sách các hồ sơ ở trạng thái `PENDING_APPROVAL`. Hệ thống tự động kiểm tra định dạng MST, định dạng CCCD và kiểm tra blacklist vi phạm.
  2. **Bước 2 (Đối chiếu CSDL Thuế & Căn cước công dân):**
     - Bấm nút "Tra cứu MST tự động" để đối chiếu thông tin doanh nghiệp trên Cổng Đăng ký Doanh nghiệp Quốc gia (`dangkykinhdoanh.gov.vn`) và Cổng Thuế (`tracuunnt.gdt.gov.vn`).
     - Kiểm tra file ảnh chụp 2 mặt Căn cước công dân (CCCD) của Người đại diện: đối chiếu họ tên, số định danh với thông tin trên ĐKKD.
     - Kiểm tra Giấy phép Kinh doanh Vận tải ô tô: kiểm tra dấu mộc đỏ của Sở GTVT và thời hạn hiệu lực còn tối thiểu 06 tháng.
     - Đối chiếu Tên chủ tài khoản Ngân hàng thụ hưởng với Tên công ty hoặc Tên người đại diện (Tuyệt đối không duyệt tài khoản cá nhân khác lạ để phòng chống rửa tiền).
  3. **Bước 3 (Cuộc gọi kiểm chứng Tele-Check):** Gọi điện trực tiếp tới Hotline đặt vé và SĐT Người đại diện để xác nhận tính chính danh của người nộp hồ sơ.
  4. **Bước 4 (Ra Quyết định Thẩm định):**
     - **PHÊ DUYỆT (`APPROVED / ACTIVE`):**
       - Admin thiết lập tỷ lệ chiết khấu sàn (Commission Rate mặc định 5% - 8%), chu kỳ quyết toán Escrow.
       - Hệ thống tự động chuyển trạng thái `status = 'ACTIVE'`, `kyc_status = 'VERIFIED'`.
       - Hệ thống **tự động khởi tạo tài khoản Quản trị nhà xe (`ROLE_OPERATOR`)**, mã hóa mật khẩu an toàn và gửi Email thông báo bàn giao Cổng điều hành cho đối tác.
       - Hệ thống phát hành Hợp đồng hợp tác điện tử (`Partner e-Contract`) có mã băm SHA-256 lưu trữ vĩnh viễn trong CSDL.
     - **YÊU CẦU BỔ SUNG (`REQUIRES_SUPPLEMENT`):** Nếu ảnh giấy tờ mờ hoặc thiếu tài liệu, Admin nhập lý do hướng dẫn. Hệ thống gửi Email chứa đường link an toàn cho đối tác bổ sung trong vòng 07 ngày làm việc.
     - **BÁC BỎ / TỪ CHỐI (`REJECTED`):** Khi phát hiện giấy tờ giả mạo hoặc không có giấy phép vận tải, Admin bắt buộc nhập lý do từ chối chuẩn hóa. Hệ thống gửi email từ chối lịch sự và khóa MST vi phạm trong 30 ngày.

### 3.3 Quản trị danh mục dữ liệu gốc (Master Data)
- **Truy cập:** `http://localhost:5173/admin/locations` và `http://localhost:5173/admin/cancellation-policies`.
- Quản lý các tỉnh thành xuất bến/đến nơi, cấu hình ma trận tuyến liên tỉnh, định nghĩa quy tắc phạt hủy vé chung toàn sàn.

### 3.4 Cấu hình chính sách hủy vé & Hoàn tiền tự động
- Thiết lập bảng quy tắc hoàn tiền theo mốc thời gian:
  - Trước giờ chạy > 24 giờ: Khách được hoàn **90%** giá vé (phí xử lý 10%).
  - Từ 12 đến 24 giờ: Khách được hoàn **70%** giá vé (phí xử lý 30%).
  - Dưới 12 giờ trước giờ chạy: **0% hoàn tiền** (đảm bảo quyền lợi cho nhà xe).

### 3.5 Kiểm soát nhật ký kiểm toán (Audit Logs) qua `X-Correlation-Id`
- **Truy cập:** `http://localhost:5173/admin/audit-logs`.
- Toàn bộ thao tác nhạy cảm (Đổi trạng thái vé, chuyển tiền đối soát, khóa tài khoản, sửa giá vé) đều được hệ thống ghi log kiểm toán kèm IP, User thực hiện và mã định danh duy nhất `X-Correlation-Id`.

---

## PHẦN 4: HƯỚNG DẪN XỬ LÝ SỰ CỐ & CÂU HỎI THƯỜNG GẶP (FAQ)

| Sự Cố / Câu Hỏi | Nguyên Nhân | Cách Xử Lý Nhanh |
|:---|:---|:---|
| Không chọn được ghế màu vàng | Ghế đang có khách khác giữ chỗ thanh toán | Chờ 10 phút để ghế tự giải phóng hoặc chọn ghế khác kế bên |
| Thanh toán trừ tiền ngân hàng nhưng chưa nhận mã vé | Webhook ngân hàng bị nghẽn mạng | Vào trang `/demo`, kiểm tra mã đối soát hoặc tra cứu số điện thoại tại `/lookup` |
| Quên mật khẩu đăng nhập | Nhập sai quá 5 lần | Liên hệ hotline sàn 1900 6067 hoặc Quản trị viên hệ thống để mở khóa tài khoản |
| Camera máy quét vé không hoạt động | Trình duyệt chưa cấp quyền Video | Bấm biểu tượng Ổ khóa trên thanh địa chỉ duyệt web -> Bật quyền Camera -> Tải lại trang |
| Bị kẹt ghế sau khi kiểm thử thử nghiệm | Khách đóng tab khi đang thanh toán | Truy cập `http://localhost:5173/demo` -> Bấm nút **"Đặt Lại Ghế Khóa Tạm"** để giải phóng ngay |
