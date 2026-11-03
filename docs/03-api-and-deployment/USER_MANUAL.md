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
   - Có thể bấm nút **"Điền Nhanh Hồ Sơ Mẫu Chuẩn (1-Click)"** để trải nghiệm thử luồng nộp hồ sơ chuẩn chỉ với 1 thao tác.

2. **Khai báo Hồ sơ Doanh nghiệp & Tuyến đường Khai thác:**
   - **Thông tin Pháp nhân:** Nhập Tên doanh nghiệp/Hợp tác xã theo ĐKKD, Họ tên người đại diện/quản lý, Mã số thuế (10 hoặc 13 chữ số chuẩn), Số điện thoại Hotline và Trụ sở đăng ký kinh doanh.
   - **Bộ Công Cụ Tạo Tuyến Đường Linh Hoạt (Interactive Route Builder):**
     - Nhập **Điểm khởi hành** (ví dụ: *Sài Gòn*, *Hà Nội*, *Đà Nẵng*).
     - Bấm nút chọn **Chiều tuyến**: 2 Chiều Khứ Hồi (`⇄`) hoặc 1 Chiều (`➔`) mà không cần tìm hay gõ ký tự đặc biệt.
     - Nhập **Điểm đến** (ví dụ: *Đà Lạt*, *Sa Pa*, *Nha Trang*) và bấm **"+ Thêm Tuyến"**.
     - Các tuyến đã chọn xuất hiện dạng Thẻ (Tags) trực quan, có nút `✕` để xóa linh hoạt từng tuyến. Có thanh gợi ý các tuyến phổ biến 1-click thêm ngay.
   - **Quy mô đội xe:** Chọn phân khúc phù hợp (1 - 5 xe, 6 - 20 xe, 21 - 50 xe, Trên 50 xe).

3. **Nộp Giấy Tờ Bằng File Ảnh & File PDF Trực Tiếp (Dropzone Upload):**
   - **Không bắt người dùng nhập link URL thủ công.**
   - **Tài liệu 1 (Ảnh CCCD Mặt Trước):** Kéo thả hoặc bấm chọn tệp ảnh rõ nét 4 góc của người đại diện (JPG, PNG, WEBP tối đa 10MB).
   - **Tài liệu 2 (Ảnh CCCD Mặt Sau):** Kéo thả hoặc chọn tệp ảnh mặt sau có vân tay và chip điện tử.
   - **Tài liệu 3 (Scan Giấy Phép Kinh Doanh / Tuyến Cố Định):** Cho phép nộp file tài liệu số **`PDF`** (nhiều trang, có mộc đỏ Sở GTVT) hoặc file **`Ảnh`**.
   - Tất cả tập tin được đẩy lên Cloudinary CDN phân loại vào thư mục `traveleasy/kyb_documents` và bảo mật qua HTTPS. Có thumbnail preview ngay trên form.

4. **Tài Khoản Ngân Hàng Quyết Toán Ký Quỹ (Escrow Settlement Account):**
   - Chọn Ngân hàng thụ hưởng (MB Bank, Vietcombank, Techcombank, BIDV...).
   - Nhập Số tài khoản ngân hàng (từ 6 đến 20 chữ số).
   - Nhập Tên chủ tài khoản: Hệ thống tự động chuẩn hóa **In Hoa Không Dấu** (VD: `CONG TY TNHH VAN TAI SAO MAI`). Bắt buộc phải trùng tên với pháp nhân hoặc người đại diện trên GPKD để đáp ứng kiểm toán chống rửa tiền (AML Check).

5. **Hệ Thống Thẩm Định Real-Time (13 Quy Tắc Validation):**
   - Nếu bất kỳ trường nào bị thiếu hoặc sai định dạng (CCCD không đủ 12 số, SĐT sai chuẩn VN, chưa tải đủ 3 tệp giấy tờ), hệ thống sẽ cảnh báo viền đỏ kèm dòng chữ giải thích chi tiết ngay dưới ô nhập liệu.
   - Khi người dùng chỉnh sửa, thông báo lỗi sẽ tự động biến mất.
   - Khi tất cả hợp lệ, bấm **"Gửi Yêu Cầu Hợp Tác Ngay"** để gửi hồ sơ vào hàng đợi thẩm định của Quản trị viên sàn (`status = 'PENDING'`).

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

### 3.2 Thẩm Định Hồ Sơ Pháp Lý & Phê Duyệt Đối Tác Nhà Xe (Admin KYB Center)
- **Truy cập:** `http://localhost:5173/admin/bus-companies` (Hỗ trợ các Tab lọc: *Tất cả*, *⏳ Chờ thẩm định*, *⚠️ Chờ bổ sung*, *✅ Đang hoạt động*, *❌ Bị từ chối*, *⏸️ Tạm ngưng*).
- **Quy trình Thẩm định 5 Bước Toàn Diện:**
  1. **Bước 1 (Kiểm tra MST Doanh Nghiệp 1-Click):**
     - Admin bấm nút **"Tra Cứu MST Nhanh (MãSốThuế.com)"** hoặc **"Cổng ĐKKD Quốc Gia"** để kiểm tra tính hợp lệ của doanh nghiệp (tình trạng nợ thuế, hoạt động bình thường, không giải thể).
  2. **Bước 2 (Đối chiếu CCCD Gắn Chip Người Đại Diện):**
     - Xem ảnh 2 mặt CCCD. Admin có thể click vào ảnh để mở **Lightbox phóng to Full HD** soi rõ từng chữ số định danh 12 số, ngày cấp và nơi thường trú.
  3. **Bước 3 (Thẩm định Giấy Phép Kinh Doanh Vận Tải Bằng Ô Tô - Đọc PDF Trực Tiếp):**
     - Hệ thống hỗ trợ xem bản scan ảnh hoặc **Trình đọc PDF Toàn Màn Hình (Embedded PDF Reader)**: Admin bấm *"Đọc Trực Tiếp PDF"* để đọc toàn văn quyết định của Sở GTVT, kiểm tra mộc đỏ và thời hạn hiệu lực $ge 6$ tháng ngay trên trình duyệt mà không cần tải file về máy.
  4. **Bước 4 (Đối chiếu Tài khoản Escrow & Chống Rửa Tiền AML Check):**
     - Thuật toán AML tự động chuẩn hóa tiếng Việt không dấu và so khớp Tên chủ tài khoản với Tên pháp nhân/người đại diện.
     - Hiển thị huy hiệu **"✓ AML Khớp Chính Chủ"** (thẻ xanh) hoặc cảnh báo vàng nếu tên tài khoản khác tên pháp nhân, ngăn chặn gian lận dòng tiền ký quỹ.
  5. **Bước 5 (Kênh Tele-Check Nóng & Ra Quyết Định 3 Nhánh):**
     - Nút **"Gọi Tele-Check Ngay"** (`tel:`) để Admin gọi trực tiếp hotline nhà xe, nút **"Soạn Email Phản Hồi"** (`mailto:`).
     - **Bảng Điều Khiển Ra Quyết Định (Decision Panel):**
       * **Phương Án 1 - PHÊ DUYỆT (`APPROVE`):** Admin chọn hoặc nhập Tỷ lệ hoa hồng sàn (`commissionRate`: 6%, 8%, 10%, 12%), nhập ghi chú. Hệ thống chuyển `status = 'ACTIVE'`, `kyc_status = 'VERIFIED'`, và **tự động cấp tài khoản Điều Hành (`ROLE_OPERATOR`)** cho email của nhà xe.
       * **Phương Án 2 - YÊU CẦU BỔ SUNG (`REQUEST_SUPPLEMENT`):** Chọn lý do nhanh (CCCD bị mờ, thiếu giấy phép tuyến cố định...) với hạn bổ sung 7 ngày, chuyển trạng thái sang `PENDING_SUPPLEMENT`.
       * **Phương Án 3 - TỪ CHỐI (`REJECT`):** Nhập lý do từ chối chuẩn hóa, chuyển trạng thái sang `REJECTED`.

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
