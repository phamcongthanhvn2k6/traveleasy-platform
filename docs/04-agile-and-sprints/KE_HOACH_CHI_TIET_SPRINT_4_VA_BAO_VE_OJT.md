# 🎯 KẾ HOẠCH TỔNG LỰC SPRINT 4 & ĐỐI SOÁT BẢNG TRELLO (FINAL SPRINT DEFENSE RUNBOOK)
**Dự án**: Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy (`traveleasy-platform`)  
**Đơn vị thực hiện**: OJT Đồ Án Nhóm 7  
**Giai đoạn**: Tuần 7 - Tuần 8 (Sprint Cuối & Nghiệm thu Bảo vệ Tốt nghiệp)  
**Thời hạn chốt nộp**: Cuối tuần sau (Code Freeze & Defense Ready)  
**Nhóm trưởng / System Architect**: Phạm Công Thành (`phamcongthanhvn2k6` / `thanhphmcong1`)  
**Ngày lập kế hoạch**: 05/11/2026  

---

## 1. BÁO CÁO ĐỐI SOÁT HIỆN TRẠNG (RECONCILIATION AUDIT)

### 1.1. Đối soát giữa Trello và Mã nguồn thực tế
Qua rà soát chi tiết trên Bảng Trello và cấu trúc cây thư mục mã nguồn (`frontend/src/` và `backend/src/`), nhóm ghi nhận hiện trạng như sau:

| STT | Mã Task trên Trello | Tên nghiệp vụ trên Trello | Hiện trạng Mã nguồn trong Repo | Đánh giá & Việc cần làm ngay trong Sprint 4 |
| :---: | :---: | :--- | :--- | :--- |
| 1 | **`[S401][FE]`** | Giao diện Quản trị Thuê xe Hợp đồng & Ký quỹ Escrow 30% | Đã có sẵn file `frontend/src/pages/admin/charters/AdminCharterList.jsx` | Kết nối vào `adminRoutes.tsx` (`/admin/charters`), chuẩn hóa dữ liệu hợp đồng mẫu. |
| 2 | **`[S401][BE]`** | API Quản lý Hợp đồng Thuê xe & Logic Giải ngân Ký quỹ Escrow | Đã có thực thể và logic hợp đồng, dữ liệu mẫu | Hoàn thiện controller `/api/v1/admin/charters` và cơ chế giải ngân 70% còn lại. |
| 3 | **`[S402][FE+BE]`** | Phân hệ Quản trị Giá vé động & Flash Sale giờ chót | Logic đã có trong SRS và bảng chính sách | Dựng giao diện cấu hình phụ thu Lễ Tết (+20%) và Flash Sale (-15%) tại `/company/pricing-rules`. |
| 4 | **`[S403][FE]`** | Giao diện POS Bán vé nhanh tại Quầy Bến xe của Nhà xe | Đã có sẵn file `frontend/src/pages/company/pos/PosTerminalPage.jsx` | Kết nối vào `companyRoutes.tsx` (`/company/pos`), tối ưu phím tắt và in hóa đơn nhiệt. |
| 5 | **`[S403][BE]`** | API Bán vé Quầy POS & Khóa ghế đồng bộ thời gian thực | Sử dụng chung Booking Engine & Concurrency Lock | Đảm bảo bán vé tại quầy lập tức chuyển trạng thái ghế sang `BOOKED` trên Web/App khách. |
| 6 | **`[S404][FE+BE]`** | Quản lý Đóng/Mở Ca trực & Bàn giao Tiền mặt quầy | Nghiệp vụ đối soát tiền lẻ đầu ca và Z-Report cuối ca | Bổ sung Modal mở/đóng ca trực tại `/company/pos/shifts`. |
| 7 | **`[S405][FE]`** | Bản đồ Định vị GPS Live Tracking xe chạy thời gian thực | Đã có sẵn file `frontend/src/pages/customer/tracking/LiveTrackingMapPage.jsx` | Kết nối vào `clientRoutes.tsx` (`/tracking/:tripId`), hiển thị lộ trình xe di chuyển Leaflet. |
| 8 | **`[S405][BE]`** | Dịch vụ GPS Live Tracking & Stream Tọa độ xe qua SSE | Đã có kiến trúc SSE (`Server-Sent Events`) | Cung cấp endpoint stream tọa độ `/api/v1/tracking/:tripId`. |
| 9 | **`[S406][BE]`** | Động cơ Tính cước Vận chuyển Bưu kiện Hầm xe | Công thức tính theo trọng lượng/kích thước | Xây dựng API tính cước và sinh mã vận đơn QR `/api/v1/cargo`. |
| 10 | **`[S407][FE]`** | Trung tâm Hỗ trợ Khẩn cấp & CSKH 24/7 | Đã có bố cục hỗ trợ trong trang Policy | Hoàn thiện giao diện `/support` (Hotline, Chatbot FAQ cứu hộ). |
| 11 | **`[S408][FE]`** | Tối ưu hóa Trải nghiệm Di động Mobile-First Sprint 4 | Đã áp dụng Tailwind CSS responsive | Rà soát giao diện mobile cho POS, Cargo và Tracking. |
| 12 | **`[S409][FE]`** | Giao diện Đặt thuê xe du lịch hợp đồng trọn gói | Đã có sẵn file `frontend/src/pages/customer/charter/CharterBookingPage.jsx` | Kết nối vào `clientRoutes.tsx` (`/charter`), cho phép khách chọn loại xe và lộ trình. |
| 13 | **`[S410][FE]`** | Giao diện Ký gửi hàng hóa bưu kiện hầm xe | Đã có sẵn file `frontend/src/pages/customer/cargo/CargoBookingPage.jsx` | Kết nối vào `clientRoutes.tsx` (`/cargo`), sinh tem nhãn vận đơn QR dán kiện hàng. |

> [!NOTE]
> **Về Trung tâm Trình diễn Demo Hub (`/demo`)**:
> Tệp [DemoPage.tsx](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/frontend/src/pages/customer/demo/DemoPage.tsx) và [DemoController.java](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/backend/src/main/java/com/traveleasy/controller/common/DemoController.java) đã được xây dựng sẵn sàng 100% với đầy đủ chức năng: Thống kê trạng thái sàn, Reset dữ liệu demo, Tạo vé mẫu kèm mã QR chuẩn và kiểm tra kết nối CSDL! Đây chính là "vũ khí bí mật" giúp buổi bảo vệ 15 phút diễn ra mượt mà không tì vết.

---

## 2. PHÂN BỔ ĐIỂM STORY POINTS (SP) VÀ MA TRẬN RACI SPRINT 4

Để **ngăn chặn tuyệt đối tình trạng lạm phát điểm** như ở Sprint 3, toàn bộ 13 User Stories của Sprint 4 được định lượng khắt khe dựa trên khối lượng công việc thực tế còn lại (hầu hết giao diện cốt lõi đã có sẵn khung, chỉ hoàn thiện kết nối và tinh chỉnh):

### 2.1. Bảng phân bổ Story Points chuẩn Scrum (Tổng cộng: 34 SP)

| Mã Task | Phân hệ & Nghiệp vụ | Phụ trách (RACI) | Điểm SP | Trạng thái kỹ thuật |
| :--- | :--- | :---: | :---: | :--- |
| **`[S401][FE]`** | Giao diện Quản trị Thuê xe Hợp đồng & Ký quỹ Escrow (`/admin/charters`) | **Nguyễn Đại Phát** | **2 SP** | Dựng bảng duyệt hợp đồng, nút giải ngân Escrow 30%. |
| **`[S401][BE]`** | API Quản lý Hợp đồng Thuê xe & Logic Giải ngân Escrow | **Nguyễn Đại Phát** | **3 SP** | Endpoint duyệt hợp đồng, ghi nhận trạng thái thanh toán. |
| **`[S402][FE+BE]`** | Quản trị Giá vé động & Flash Sale giờ chót (`/company/pricing-rules`) | **Nguyễn Đại Phát** | **3 SP** | Cấu hình phụ thu +20% Lễ Tết, giảm -15% giờ chót. |
| **`[S403][FE]`** | Giao diện Bán vé Quầy POS Nhà xe (`/company/pos`) | **Phạm Thanh Phong** | **3 SP** | Phím tắt F1-F9, chọn chuyến, nhả hóa đơn nhiệt 80mm. |
| **`[S403][BE]`** | API Bán vé Quầy POS & Khóa ghế đồng thời thời gian thực | **Phạm Thanh Phong** | **2 SP** | Bán vé quầy đồng bộ trạng thái `BOOKED` tức thì. |
| **`[S404][FE+BE]`** | Quản lý Đóng/Mở Ca trực & Bàn giao Tiền mặt (`/company/pos/shifts`) | **Phạm Thanh Phong** | **2 SP** | Khởi tạo tiền lẻ đầu ca, xuất phiếu Z-Report cuối ca. |
| **`[S405][BE]`** | Dịch vụ GPS Live Tracking & Stream Tọa độ xe qua SSE | **Phạm Thanh Phong** | **2 SP** | Server-Sent Events phát tọa độ định kỳ 1 giây. |
| **`[S406][BE]`** | Động cơ Tính cước Vận chuyển Bưu kiện Hầm xe (`/api/v1/cargo`) | **Phạm Thanh Phong** | **2 SP** | Tính cước theo kg/thể tích, sinh mã vận đơn. |
| **`[S405][FE]`** | Bản đồ GPS Live Tracking xe chạy thời gian thực (`/tracking/:tripId`) | **Đoàn Nhật Cường** | **3 SP** | Tích hợp bản đồ Leaflet, hiển thị xe di chuyển trên route. |
| **`[S407][FE]`** | Trung tâm Hỗ trợ Khẩn cấp & Chăm sóc Khách hàng 24/7 (`/support`) | **Đoàn Nhật Cường** | **2 SP** | Hotline nhà xe, FAQ cứu hộ, mẫu gửi sự cố. |
| **`[S408][FE]`** | Tối ưu hóa Trải nghiệm Di động Mobile-First Sprint 4 | **Đoàn Nhật Cường** | **3 SP** | Rà soát giao diện mobile trên Chrome, Safari, Firefox. |
| **`[S409][FE]`** | Giao diện Đặt thuê xe du lịch hợp đồng (`/charter`) | **Trần Minh Đức** | **3 SP** | Form chọn điểm đi/đến, loại xe 16-45 chỗ, tính tạm tính. |
| **`[S410][FE]`** | Giao diện Ký gửi bưu kiện & Tra cứu vận đơn (`/cargo`) | **Trần Minh Đức** | **3 SP** | Nhập bưu phẩm, sinh tem nhãn QR dán kiện hàng. |
| **HẠ TẦNG & DEMO** | Docker Compose Production, Demo Hub `/demo`, Slide Bảo vệ | **Phạm Công Thành** | **(Lead/Arch)** | Đóng gói release, tài liệu vận hành, thuyết trình chính. |
| **TỔNG CỘNG** | **13 User Stories Sprint 4** | **Toàn đội** | **34 SP** | **Chuẩn xác & Vừa vặn 100%** |

### 2.2. Cân bằng tải công việc giữa các thành viên
- **Phạm Công Thành (Lead / Architect)**: 0 SP code mới. Tập trung 100% vào review code, đóng gói Docker, hoàn thiện Slide và kịch bản bảo vệ trước Hội đồng.
- **Nguyễn Đại Phát**: 8 SP (3 task liên quan Admin & Giá vé).
- **Phạm Thanh Phong**: 11 SP (5 task liên quan POS Bến xe, Concurrency, SSE Tracking & Cargo).
- **Đoàn Nhật Cường**: 8 SP (3 task liên quan Bản đồ Mobile, Support, Responsive).
- **Trần Minh Đức**: 6 SP (2 task liên quan Khách hàng: Thuê xe & Gửi hàng).

---

## 3. LỘ TRÌNH THỰC HIỆN 7 NGÀY NƯỚC RÚT (COUNTDOWN ROADMAP TO DEFENSE)

```
[Thứ Hai - Thứ Ba] ─────► [Thứ Tư - Thứ Năm] ─────► [Thứ Sáu] ─────────► [Thứ Bảy - CN]
  Tích hợp Routes           Test Hồi quy E2E          CODE FREEZE           TỔNG DIỄN TẬP
  & Bật tính năng           & Tối ưu Mobile           Đóng gói Docker       BẢO VỆ THỬ 15P
  (S401 - S410)             (Đo Core Web Vitals)      Gắn Tag v1.0.0        Chốt Slide & Sách
```

### 🗓️ Giai đoạn 1: Tích hợp hoàn thiện tính năng (Thứ Hai — Thứ Ba)
- **Mục tiêu**: Kích hoạt toàn bộ các tuyến đường dẫn (Routes) mới vào ứng dụng, đảm bảo click từ menu/navbar là mở được trang.
- **Nhiệm vụ cụ thể**:
  - Kết nối `/charter`, `/cargo`, `/tracking/:tripId`, `/support` vào [clientRoutes.tsx](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/frontend/src/routes/clientRoutes.tsx).
  - Kết nối `/company/pos` vào [companyRoutes.tsx](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/frontend/src/routes/companyRoutes.tsx).
  - Kết nối `/admin/charters` vào [adminRoutes.tsx](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/frontend/src/routes/adminRoutes.tsx).
  - Khớp dữ liệu hiển thị mượt mà với mock data khi backend chưa kết nối.

### 🗓️ Giai đoạn 2: Kiểm thử hồi quy & Tối ưu trải nghiệm (Thứ Tư — Thứ Năm)
- **Mục tiêu**: Kiểm tra tính ổn định, tốc độ tải trang và độ tương thích di động.
- **Nhiệm vụ cụ thể**:
  - Chạy toàn bộ test suites frontend và backend: `npm run test`, `mvn test`.
  - Đo lường chỉ số Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1).
  - Kiểm tra giao diện Dark Mode / Light Mode và tính nhất quán font chữ, màu sắc nút bấm.
  - Test luồng quét mã QR soát vé qua camera điện thoại thật với tốc độ < 0.2s.

### 🗓️ Giai đoạn 3: Đóng băng mã nguồn & Xuất xưởng Release (Thứ Sáu)
- **Mục tiêu**: Đóng băng code (Code Freeze), không nhận thêm bất kỳ thay đổi nào ngoài fix bug nghiêm trọng.
- **Nhiệm vụ cụ thể**:
  - Merge toàn bộ code đã kiểm thử vào nhánh `dev` và tạo PR cuối cùng vào `main`.
  - Gắn thẻ Release Tag chính thức: `v1.0.0-production`.
  - Kiểm tra khởi chạy toàn sàn bằng lệnh duy nhất: `docker-compose up -d --build`.
  - Xuất báo cáo nghiệm thu kiểm thử toàn sàn: `BIEN_BAN_NGHIEM_THU_TONG_THE.md`.

### 🗓️ Giai đoạn 4: Tổng diễn tập Kịch bản Bảo vệ OJT (Thứ Bảy — Chủ Nhật)
- **Mục tiêu**: Luyện tập thuyết trình trôi chảy, phân vai mạch lạc, tự tin làm chủ toàn bộ bài toán trước Hội đồng.
- **Nhiệm vụ cụ thể**:
  - Hoàn thiện Slide thuyết trình (PowerPoint/Canva) gồm 20-25 slides chuẩn nhận diện thương hiệu TravelEasy.
  - Chạy thử kịch bản Demo Hub `/demo` theo đúng đồng hồ bấm giờ 15 phút.
  - Chuẩn bị sẵn phương án dự phòng (Video quay màn hình chất lượng cao phòng khi bến xe/hội trường mất mạng).

---

## 4. KỊCH BẢN TRÌNH DIỄN BẢO VỆ 15 PHÚT TRƯỚC HỘI ĐỒNG (15-MINUTE DEFENSE RUNBOOK)

| Thời gian | Nội dung trình bày | Người phụ trách | Hành động trực quan trên màn hình chiếu |
| :---: | :--- | :---: | :--- |
| **00:00 - 02:30**<br>*(2.5 phút)* | **Mở đầu & Bối cảnh dự án**<br>- Giới thiệu Đề tài TravelEasy.<br>- Kiến trúc Modular Monolith, CSDL 36 bảng.<br>- Bảng Trello 4 Sprint chuẩn Agile. | **Phạm Công Thành**<br>*(Team Leader)* | - Chiếu Slide kiến trúc phân tầng.<br>- Mở trang `/demo` bấm nút **Kiểm tra Sức Khỏe Hệ Thống** (Show trạng thái UP, CSDL kết nối tốt, Memory < 256MB). |
| **02:30 - 06:30**<br>*(4.0 phút)* | **Luồng Khách hàng Đặt vé Online**<br>- Tìm kiếm chuyến SWR Cache 0ms.<br>- Sơ đồ 34 ghế Limousine VIP 2 tầng.<br>- Cơ chế khóa ghế Concurrency Lock 10:00.<br>- Quét VietQR thanh toán tự động. | **Trần Minh Đức**<br>*(Customer Portal)* | - Thao tác tìm xe Sài Gòn $\rightarrow$ Đà Lạt.<br>- Chọn ghế A01, mở song song tab ẩn danh chứng minh ghế A01 lập tức bị khóa.<br>- Bấm thanh toán, quét mã QR sinh vé thành công. |
| **06:30 - 09:30**<br>*(3.0 phút)* | **Hiện trường Bến xe Thực tế**<br>- Quầy bán vé nhanh POS (`/company/pos`).<br>- In vé nhiệt cầm tay có mã QR bảo mật.<br>- Tài xế quét mã QR soát vé siêu tốc < 0.2s bằng camera điện thoại. | **Phạm Thanh Phong** & **Đoàn Nhật Cường** | - Phong mở `/company/pos`, dùng phím tắt F2 bán vé cho khách vãng lai, in hóa đơn nhiệt ra màn hình.<br>- Cường cầm điện thoại thật quét camera vào mã QR vé vừa in $\rightarrow$ Hệ thống lập tức "Tít" xanh và cập nhật vé sang trạng thái `ĐÃ LÊN XE`. |
| **09:30 - 12:00**<br>*(2.5 phút)* | **Hệ sinh thái Mở rộng Đột phá**<br>- Định vị GPS Live Tracking xe chạy (`/tracking`).<br>- Dịch vụ Ký gửi bưu kiện hầm xe (`/cargo`).<br>- Thuê xe hợp đồng du lịch (`/charter`). | **Nguyễn Đại Phát** & **Đoàn Nhật Cường** | - Phát mở `/admin/charters` show cơ chế ký quỹ Escrow 30%.<br>- Cường mở `/tracking/101` show xe đang chạy trên bản đồ vệ tinh vệ tinh thời gian thực SSE. |
| **12:00 - 13:30**<br>*(1.5 phút)* | **Tổng quan Quản trị & Đối soát Sàn**<br>- Doanh thu, đối soát 10% hoa hồng.<br>- Nhật ký Audit Logs bất biến. | **Nguyễn Đại Phát** | - Mở Dashboard Admin: Doanh thu thực tế, biểu đồ tăng trưởng, nhật ký kiểm toán không thể sửa xóa. |
| **13:30 - 15:00**<br>*(1.5 phút)* | **Kết luận & Bàn giao Sản phẩm**<br>- Tổng kết 4 Sprint (100% DoD hoàn tất).<br>- Lời cảm ơn và chuyển sang phần Q&A. | **Phạm Công Thành** | - Chiếu Slide bàn giao sản phẩm, mở repository GitHub chứng minh lịch sử commit chuẩn chỉ và đón nhận câu hỏi phản biện. |

---

## 5. BỘ SẢN PHẨM BÀN GIAO NGHIỆM THU (FINAL DELIVERABLES)

Khi kết thúc Sprint 4, toàn bộ hồ sơ sau phải sẵn sàng để nộp lên Hội đồng:
1. 📂 **Mã nguồn hoàn chỉnh**: Nhánh `main` sạch sẽ, gắn tag `v1.0.0-production`.
2. 🐳 **Gói Docker triển khai**: `docker-compose.yml` chạy ngon lành cả Frontend, Backend, Database và Nginx Reverse Proxy.
3. 📑 **Bộ tài liệu kỹ thuật hoàn chỉnh**:
   - `docs/01-architecture/KIEN_TRUC_HE_THONG_TOAN_SAN.md`
   - `docs/02-database/THIET_KE_CSDL_36_BANG.md`
   - `docs/03-api/TAI_LIEU_RESTFUL_API_CHUAN_HOA.md`
   - `docs/04-agile-and-sprints/BAO_CAO_TONG_KET_4_SPRINT.md`
   - `docs/05-user-manual/SO_TAY_HUONG_DAN_SU_DUNG.md`
   - `docs/06-operations/SO_TAY_VAN_HANH_VA_QUAY_LUI.md`
4. 📊 **Slide thuyết trình bảo vệ**: File PDF & PPTX chuẩn bị cho buổi bảo vệ 15 phút.
5. 🎥 **Video Demo Backup**: Clip quay màn hình 5-7 phút full HD thuyết minh toàn bộ luồng chức năng phòng trường hợp mất mạng.

---
*Kế hoạch này được duyệt bởi Nhóm trưởng Phạm Công Thành và là kim chỉ nam hành động của toàn bộ Nhóm 7 cho đến ngày bảo vệ thành công đồ án OJT.*

