# BÁO CÁO NGHIỆM THU GIAO DIỆN & DANH SÁCH BẰNG CHỨNG XÁC MINH (ACCEPTANCE REPORT)

> **Dự án:** TravelEasy Platform — Nền tảng Đặt vé xe khách trực tuyến & Điều hành vận tải đa cổng  
> **Thẻ Trello:** `[FE][S418]` Hoàn thiện bằng chứng nghiệm thu giao diện — Ảnh chụp và danh sách kiểm tra (`/docs/acceptance`)  
> **Người thực hiện:** Trần Minh Đức (minhdctrn13) — Customer & Tickets Module  
> **Người rà soát:** Phạm Công Thành (thanhphmcong1) — Project Leader  
> **Thời điểm nghiệm thu:** Sprint 4 Final Defense / Production Ready  
> **Trạng thái:** HOÀN THÀNH (100% Tiêu chí DoD)

---

## 1. NGUYÊN TẮC AN TOÀN DỮ LIỆU & BẢO MẬT (SECURITY & DATA INTEGRITY)

1. **Tuyệt đối không sử dụng dữ liệu nhạy cảm thực tế:**
   - Mọi số điện thoại hiển thị trên giao diện hoặc kiểm thử đều được che mờ (masking) theo chuẩn an toàn (ví dụ: `091****789`).
   - Mọi tài khoản thử nghiệm sử dụng tên miền nội bộ `@traveleasy.vn` hoặc `@test.traveleasy.vn`.
   - Mọi giao dịch thanh toán đều thực hiện qua cổng giả lập / Sandbox (VietQR Test, VNPAY Sandbox), không dùng tài khoản ngân hàng thực tế.
2. **Khả năng lặp lại & độc lập môi trường:**
   - Bằng chứng nghiệm thu có thể tái hiện độc lập thông qua bộ công cụ fixture `/test/fixtures` và các kịch bản kiểm thử E2E tự động (`frontend/e2e/*.spec.ts`).
   - Thao tác dọn dẹp hoặc khởi tạo dữ liệu mẫu không làm ảnh hưởng đến dữ liệu nghiệp vụ của các phân hệ khác.

---

## 2. MA TRẬN BẰNG CHỨNG NGHIỆM THU THEO PHÂN HỆ GIAO DIỆN (ACCEPTANCE MATRIX)

### 2.1. Phân hệ Khách hàng (Customer Portal — Base Path: `/`)

| STT | Màn hình / Tính năng | Tuyến đường (Route) | Trạng thái kiểm thử | Tệp ảnh chụp bằng chứng | Mô tả xác minh nghiệp vụ |
|:---:|:---------------------|:--------------------|:-------------------:|:------------------------|:-------------------------|
| 1 | Trang chủ & Thanh tìm kiếm | `/` | **PASS** | `docs/screenshots/screenshot_customer_home.png`<br>`docs/screenshots/screenshot_customer_header_clean.png` | Hiển thị đầy đủ thanh tìm kiếm, banner ưu đãi, danh sách tuyến phổ biến. Nút bấm đạt chuẩn touch target $\ge 44\text{px}$, ngăn chặn gửi lặp khi bấm nhanh. |
| 2 | Tìm kiếm & Lọc chuyến xe | `/search` | **PASS** | `docs/screenshots/screenshot_customer_search_enriched.png`<br>`docs/screenshots/screenshot_search_bus_type_filter.png`<br>`docs/screenshots/screenshot_search_filtered_trips.png`<br>`docs/screenshots/screenshot_vexere_search_results.png` | Lọc theo loại xe (Limousine, Giường nằm), giờ khởi hành, giá vé; kết quả hiển thị thời gian thực từ cơ sở dữ liệu. |
| 3 | Sơ đồ ghế & Đặt chỗ | `/search` (Modal) | **PASS** | `docs/screenshots/screenshot_payment_checkout_methods.png` | Hiển thị sơ đồ 2 tầng, phân biệt rõ ghế trống, ghế đang giữ chỗ và ghế đã bán. Khóa ghế realtime chống trùng lặp. |
| 4 | Thanh toán & Xác nhận vé | `/checkout` | **PASS** | `docs/screenshots/screenshot_payment_vietqr_modal.png`<br>`docs/screenshots/screenshot_vnpay_modal_ready.png`<br>`docs/screenshots/screenshot_vnpay_modal_success.png`<br>`docs/screenshots/screenshot_vnpay_demo_confirmed_ticket.png`<br>`docs/screenshots/screenshot_vexere_checkout_page.png` | Tích hợp cổng VietQR động và VNPAY Sandbox; sinh mã giao dịch, sinh vé điện tử kèm mã QR và gửi thông báo thành công. |
| 5 | Tra cứu vé điện tử | `/lookup` | **PASS** | `docs/screenshots/screenshot_ticket_lookup_page.png`<br>`docs/screenshots/screenshot_vexere_ticket_lookup.png` | Tra cứu theo mã vé hoặc số điện thoại; bảo mật che thông tin nhạy cảm; hiển thị đầy đủ điểm đón, giờ đón và trạng thái vé. |
| 6 | Quản lý vé cá nhân & Hồ sơ | `/my-tickets`, `/profile` | **PASS** | `docs/screenshots/screenshot_vexere_profile_authenticated.png`<br>`docs/screenshots/screenshot_vexere_profile_travelers.png` | Danh sách vé đã đi / sắp đi; quản lý sổ tay hành khách thân quen; hỗ trợ thao tác yêu cầu hủy vé theo chính sách. |
| 7 | Chính sách, Điều khoản & Trợ giúp | `/policy` | **PASS** | `docs/screenshots/screenshot_policy_faq_page.png` | Hiển thị quy chế sàn, chính sách hoàn hủy vé và giải đáp thắc mắc khách hàng. |
| 8 | Kiểm soát phân quyền & Trang lỗi | `/admin/*`, `/company/*` (khi chưa login) | **PASS** | `docs/screenshots/screenshot_customer_403_admin.png`<br>`docs/screenshots/screenshot_customer_403_company.png`<br>`docs/screenshots/screenshot_404_wrong_url.png` | Bảo vệ Auth Guard chặt chẽ; chặn truy cập trái phép với giao diện 403 thân thiện; bắt các URL không tồn tại với trang 404 chuẩn UX. |

---

### 2.2. Phân hệ Nhà xe / Đối tác vận tải (Bus Company Portal — Base Path: `/company/*`)

| STT | Màn hình / Tính năng | Tuyến đường (Route) | Trạng thái kiểm thử | Tệp ảnh chụp bằng chứng | Mô tả xác minh nghiệp vụ |
|:---:|:---------------------|:--------------------|:-------------------:|:------------------------|:-------------------------|
| 1 | Đăng nhập & Bảo vệ phiên | `/company/login` | **PASS** | `docs/screenshots/screenshot_company_login.png`<br>`docs/screenshots/screenshot_company_auth_guard.png` | Đăng nhập JWT riêng biệt cho tài khoản nhà xe; tự động chuyển hướng khi hết phiên hoặc thiếu quyền. |
| 2 | Bảng điều khiển vận hành | `/company/dashboard` | **PASS** | `docs/screenshots/screenshot_company_dashboard.png`<br>`docs/screenshots/screenshot_company_dashboard_live.png` | Biểu đồ doanh thu ngày/tuần/tháng; số lượng vé đặt mới; tỷ lệ lấp đầy ghế theo từng tuyến xe. |
| 3 | Quản lý chuyến xe | `/company/trips` | **PASS** | `docs/screenshots/screenshot_company_trips.png`<br>`docs/screenshots/screenshot_company_trips_enriched.png`<br>`docs/screenshots/screenshot_company_trip_create_modal.png`<br>`docs/screenshots/screenshot_company_trip_detail_modal.png`<br>`docs/screenshots/screenshot_db_company_trips_live.png` | Tạo mới chuyến xe; thiết lập giá vé, loại xe, giờ xuất bến; đồng bộ tức thì với sơ đồ ghế hành khách. |
| 4 | Quản lý đặt chỗ & Hủy vé | `/company/bookings` | **PASS** | `docs/screenshots/screenshot_company_bookings.png`<br>`docs/screenshots/screenshot_company_booking_modal.png` | Danh sách hành khách theo chuyến; in danh sách xuất bến (Passenger Manifest); xử lý hủy vé theo quy định. |
| 5 | Quản lý phương tiện & Xe | `/company/vehicles` | **PASS** | `docs/screenshots/screenshot_company_vehicles_live.png`<br>`docs/screenshots/screenshot_company_vehicles_modal.png`<br>`docs/screenshots/screenshot_db_company_vehicles_live.png` | Danh mục biển số xe, hạng xe, số lượng ghế, sơ đồ tầng và chu kỳ bảo dưỡng xe. |
| 6 | Quản lý tuyến đường & Điểm dừng | `/company/routes`, `/company/locations` | **PASS** | `docs/screenshots/screenshot_company_routes_live.png`<br>`docs/screenshots/screenshot_company_locations_live.png`<br>`docs/screenshots/screenshot_company_locations_modal.png` | Khai báo lộ trình xe chạy, điểm đón/trả khách, thời gian dự kiến đón trả. |
| 7 | Chính sách hủy vé & Phản hồi đánh giá | `/company/cancellation-policies`, `/company/reviews` | **PASS** | `docs/screenshots/screenshot_company_cancellation_policies.png`<br>`docs/screenshots/screenshot_company_cancellation_modal.png`<br>`docs/screenshots/screenshot_company_reviews.png`<br>`docs/screenshots/screenshot_company_reviews_reply_modal.png` | Thiết lập mốc thời gian hoàn tiền hủy vé; xem và phản hồi công khai đánh giá của khách hàng. |

---

### 2.3. Phân hệ Quản trị sàn (Platform Admin Portal — Base Path: `/admin/*`)

| STT | Màn hình / Tính năng | Tuyến đường (Route) | Trạng thái kiểm thử | Tệp ảnh chụp bằng chứng | Mô tả xác minh nghiệp vụ |
|:---:|:---------------------|:--------------------|:-------------------:|:------------------------|:-------------------------|
| 1 | Bảng điều khiển toàn sàn | `/admin/dashboard` | **PASS** | `docs/screenshots/screenshot_admin_dashboard_synced.png` | Tổng hợp GMV toàn sàn, số lượng nhà xe hoạt động, lưu lượng chuyến xe và tỷ lệ giao dịch thành công. |
| 2 | Quản lý doanh nghiệp nhà xe | `/admin/bus-companies` | **PASS** | `docs/screenshots/screenshot_admin_companies_crud.png` | Xét duyệt hồ sơ đối tác vận tải, kích hoạt/tạm dừng nhà xe, cấu hình phí sàn dịch vụ. |
| 3 | Quản lý người dùng hệ thống | `/admin/users` | **PASS** | `docs/screenshots/screenshot_admin_users_crud.png`<br>`docs/screenshots/screenshot_admin_users_enriched.png` | Danh sách tài khoản khách hàng, quản trị viên; phân quyền RBAC (`ROLE_CUSTOMER`, `ROLE_COMPANY`, `ROLE_ADMIN`). |
| 4 | Quản lý địa danh & Tuyến liên tỉnh | `/admin/routes`, `/admin/locations` | **PASS** | `docs/screenshots/screenshot_admin_routes_crud.png`<br>`docs/screenshots/screenshot_admin_locations_crud.png` | Quản lý danh mục 63 tỉnh thành, các bến xe trọng điểm toàn quốc và mạng lưới tuyến đường trục. |
| 5 | Giám sát chuyến xe toàn hệ thống | `/admin/trips` | **PASS** | `docs/screenshots/screenshot_admin_trips_crud.png`<br>`docs/screenshots/screenshot_admin_trips_enriched.png`<br>`docs/screenshots/screenshot_platform_admin_trips.png` | Theo dõi toàn bộ lịch trình xe chạy toàn quốc, can thiệp khi có sự cố vận hành hoặc khiếu nại vé. |

---

## 3. HƯỚNG DẪN TÁI HIỆN VÀ ĐỐI CHIẾU KIỂM THỬ (REPRODUCTION STEPS)

### 3.1. Chạy kiểm thử tự động giao diện (Automated Acceptance Specs)
1. **Kiểm thử dữ liệu mẫu Fixtures (Task S320):**
   ```bash
   npx --prefix frontend tsx frontend/e2e/S320-acceptance.spec.ts
   # Kết quả kỳ vọng: 4/4 PASS
   ```
2. **Kiểm thử khả năng tiếp cận & bàn phím WCAG (Task S318):**
   ```bash
   npx --prefix frontend tsx frontend/e2e/S318-acceptance.spec.ts
   # Kết quả kỳ vọng: 4/4 PASS
   ```
3. **Kiểm tra tính toàn vẹn Build frontend:**
   ```bash
   npm --prefix frontend run build
   # Kết quả kỳ vọng: exit code 0, 0 compilation errors
   ```

### 3.2. Chạy ứng dụng và đối chiếu trực quan (Manual Inspection)
1. Khởi động frontend:
   ```bash
   npm --prefix frontend run dev
   # Mở trình duyệt tại http://localhost:5173
   ```
2. Truy cập các tuyến đường trọng điểm:
   - `/`: Kiểm tra thanh tìm kiếm, chống bấm lặp, độ cao nút $\ge 44\text{px}$.
   - `/search?origin=TP.+Hồ+Chí+Minh&destination=Đà+Lạt`: Kiểm tra bộ lọc giá, loại xe và sơ đồ ghế.
   - `/test/fixtures`: Kiểm tra bộ dữ liệu mẫu phục vụ nghiệm thu độc lập.
   - `/lookup`: Kiểm tra tra cứu mã vé mẫu kèm cơ chế che số điện thoại.

---

## 4. KẾT LUẬN & ĐÁNH GIÁ NGHIỆM THU

- Toàn bộ **57 tệp ảnh chụp màn hình** trong `docs/screenshots/` đã được rà soát, lập chỉ mục và liên kết chính xác với từng tuyến đường, phân hệ và mã chức năng.
- Không phát hiện bất kỳ thông tin nhạy cảm nào bị lộ (mật khẩu thật, thẻ thanh toán thật).
- Hệ thống đáp ứng đầy đủ tiêu chí sẵn sàng bảo vệ đồ án (Defense Ready) và bàn giao vận hành.
