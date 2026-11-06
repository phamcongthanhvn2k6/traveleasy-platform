# -*- coding: utf-8 -*-
"""
Generate markdown counterparts (.md) in docs/google-docs-export/
with the correct 5 team members of Nhóm 7:
1. Phạm Công Thành (Team Leader & System Architect)
2. Nguyễn Đại Phát (Admin Lead & Full-Stack Developer)
3. Phạm Thanh Phong (Core Booking & Seat Engine)
4. Đoàn Nhật Cường (Frontend & Mobile Specialist)
5. Trần Minh Đức (Full-Stack & QA/Testing)
"""

import os
import sys
sys.stdout.reconfigure(encoding='utf-8')

OUTPUT_DIR = os.path.join(os.getcwd(), "docs", "google-docs-export")

# 1. 01_SRS_tham_khao.md
md1 = """# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) — MẪU THAM KHẢO CHUẨN
> **Tiêu chuẩn:** IEEE Std 830-1998 Reference Standard  
> **Phân loại:** Tài liệu mẫu tham khảo dự án CNTT / OJT Capstone  
> **Trạng thái:** Hoàn thiện (Verified)  

---

> [!NOTE]
> Đây là tài liệu SRS tham khảo chuẩn cấu trúc IEEE 830 được sử dụng làm chuẩn mực (benchmark) cho các hệ thống thương mại điện tử, đặt dịch vụ trực tuyến và chuyển đổi số doanh nghiệp.

## 1. GIỚI THIỆU TỔNG QUAN (INTRODUCTION)
### 1.1 Mục đích tài liệu (Purpose)
Tài liệu Đặc tả Yêu cầu Phần mềm (SRS) này mô tả toàn diện các yêu cầu nghiệp vụ, yêu cầu chức năng, yêu cầu phi chức năng và giao diện hệ thống cho nền tảng trực tuyến. Tài liệu đóng vai trò làm hợp đồng kỹ thuật giữa đội ngũ phân tích nghiệp vụ (BA), nhóm phát triển phần mềm (Dev Team), đội ngũ kiểm thử (QA/QC) và các bên liên quan.

### 1.2 Phạm vi sản phẩm (Product Scope)
Hệ thống cung cấp giải pháp đa nền tảng kết nối 3 đối tượng chính: Khách hàng đầu cuối (End-User), Nhà cung cấp dịch vụ/Đối tác đối ngoại (Merchant/Partner) và Đội ngũ quản trị sàn trung tâm (System Admin).

### 1.3 Định nghĩa & Thuật ngữ viết tắt (Definitions & Acronyms)
| Thuật ngữ | Tên tiếng Anh | Ý nghĩa trong hệ thống |
| :--- | :--- | :--- |
| **SRS** | Software Requirements Specification | Tài liệu đặc tả yêu cầu phần mềm chuẩn IEEE 830 |
| **RBAC** | Role-Based Access Control | Mô hình kiểm soát truy cập và phân quyền dựa trên vai trò |
| **JWT** | JSON Web Token | Chuẩn mã hóa token xác thực người dùng không trạng thái |
| **KYB** | Know Your Business | Quy trình xác minh định danh pháp lý và thẩm định nhà cung cấp đối tác |
| **Escrow** | Escrow Account Mechanism | Cơ chế tài khoản ký quỹ bảo vệ người mua trước khi hoàn tất dịch vụ |

---

## 2. MÔ TẢ TỔNG QUAN HỆ THỐNG (OVERALL DESCRIPTION)
### 2.1 Bối cảnh sản phẩm (Product Perspective)
Hệ thống hoạt động dưới mô hình Web Application hiện đại, áp dụng kiến trúc Modular Monolith hướng Microservices. Phía máy khách sử dụng Single Page Application (SPA), máy chủ Backend cung cấp RESTful APIs chuẩn OpenAPI/Swagger và lưu trữ dữ liệu tập trung trên cơ sở dữ liệu quan hệ (RDBMS) có kiểm soát ACID.

### 2.2 Phân loại tác nhân người dùng (User Classes & Characteristics)
* **Khách hàng (Customer):** Người dùng vãng lai hoặc đã đăng ký, tìm kiếm thông tin dịch vụ, giữ chỗ trực tuyến, thanh toán và gửi đánh giá phản hồi.
* **Đối tác cung ứng (Partner/Vendor):** Các đơn vị kinh doanh đã qua thẩm định, quản lý danh mục tài sản, quản lý giá dịch vụ, tiếp nhận đơn đặt và đối soát doanh thu.
* **Quản trị viên vận hành (Operational Admin):** Kiểm duyệt nội dung, quản lý danh mục dùng chung (Master Data), đối soát giao dịch tài chính, cấu hình cổng thanh toán.
* **Quản trị viên hệ thống (Root Admin):** Quyền tối cao toàn sàn, phê duyệt bổ nhiệm Admin mới, xem nhật ký kiểm toán hệ thống (Audit Trail), xử lý sự cố khẩn cấp.

---

## 3. YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS - FR)
| Mã FR | Tên chức năng | Tác nhân | Mô tả xử lý cốt lõi |
| :--- | :--- | :--- | :--- |
| **FR-01** | Xác thực & Cấp quyền | All Users | Đăng ký, Đăng nhập JWT, Quên mật khẩu OTP, Phân quyền RBAC |
| **FR-02** | Quản lý Master Data | Admin | Quản lý danh mục địa bàn, đơn vị hành chính, mã giảm giá toàn sàn |
| **FR-03** | Thẩm định đối tác (KYB) | Partner / Admin | Nộp hồ sơ pháp lý, giấy phép kinh doanh, Admin phê duyệt kích hoạt |
| **FR-04** | Quản lý tài nguyên đối tác | Partner | Khai báo đội ngũ, trang thiết bị, bảng giá và cấu hình phụ thu |
| **FR-05** | Điều phối lịch trình dịch vụ | Partner | Tạo lịch biểu, tự động sinh slot/chỗ ngồi, kiểm soát mở/đóng bán |
| **FR-06** | Tìm kiếm & Đặt chỗ thời gian thực | Customer | Tìm kiếm đa tiêu chí, chọn vị trí trực quan, khóa giữ chỗ chống xung đột |
| **FR-07** | Cổng thanh toán & Webhook | Customer / Gateway | Tích hợp PayOS/VietQR, VNPAY, COD; xử lý Webhook bất đồng bộ |
| **FR-08** | Quản lý đơn & Tra cứu PNR | Customer / Partner | Tra cứu không cần đăng nhập qua mã đơn/SĐT; gửi vé điện tử |
| **FR-09** | Đối soát & Ký quỹ (Escrow) | Admin / Partner | Tự động trích hoa hồng sàn, phong tỏa tiền chờ hoàn tất dịch vụ |
| **FR-10** | Audit Log & Báo cáo | Root Admin | Ghi log mọi thao tác nhạy cảm; biểu đồ doanh thu và tăng trưởng |

---

## 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - NFR)
* **Hiệu năng (Performance):** Thời gian phản hồi tìm kiếm < 500ms; xử lý khóa đồng thời < 15ms; đáp ứng tối thiểu 500 concurrent users.
* **Bảo mật (Security):** Mã hóa mật khẩu bằng BCrypt độ mạnh 10; truyền tải qua HTTPS/TLS 1.3; ngăn chặn SQL Injection, XSS, CSRF.
* **Độ tin cậy & Toàn vẹn:** Tỷ lệ Uptime đạt 99.9%; áp dụng cơ chế Xóa mềm (Soft Delete 100%) để bảo toàn toàn vẹn lịch sử giao dịch.
* **Khả năng sử dụng (Usability):** Thiết kế Responsive Mobile-First, tuân thủ bảng màu chuẩn WCAG, thân thiện và trực quan.
"""

# 2. 02_SRS_TravelEasy.md
md2 = """# ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) — HỆ THỐNG TRAVELEASY
> **Đề tài:** Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh Toàn Quốc (VeXeRe Architecture Clone)  
> **Mã dự án:** PRJ-TRAVELEASY-MVP-01  
> **Đơn vị thực hiện:** Nhóm 7 — 5 Thành viên chính thức  
> **Trạng thái:** Hoàn thiện (Verified)  

---

> [!NOTE]
> Hệ thống giải quyết triệt để 3 bài toán: (1) Trùng vé, trùng ghế giường nằm dịp cao điểm; (2) Thất thoát doanh thu vé và khó khăn trong thanh toán số; (3) Thiếu tính minh bạch trong đối soát hoa hồng nhà xe.

## 1. GIỚI THIỆU & THÔNG TIN DỰ ÁN
* **Tên hệ thống:** TravelEasy Enterprise Transport Platform
* **5 Thành viên thực hiện:**
  1. **Phạm Công Thành** — Trưởng nhóm & Kiến trúc sư hệ thống (Team Leader & System Architect)
  2. **Nguyễn Đại Phát** — Phụ trách Cổng Quản trị Admin & Full-Stack Developer
  3. **Phạm Thanh Phong** — Phụ trách Động cơ Đặt vé & Sơ đồ Ghế (Core Booking & Seat Engine)
  4. **Đoàn Nhật Cường** — Phụ trách Giao diện Responsive & Thiết bị Di động (Frontend & Mobile Specialist)
  5. **Trần Minh Đức** — Phụ trách Kiểm thử tự động, Cổng Khách hàng & Full-Stack Developer
* **Tech Stack:** Spring Boot 3.2 (Java 17) + React 18 / TypeScript / Tailwind CSS / Vite + CSDL Supabase PostgreSQL 15 + Docker Compose

---

## 2. KIẾN TRÚC PHÂN HỆ VÀ TÁC NHÂN
### 2.1 Ba phân hệ cổng làm việc độc lập
1. **Cổng Khách Hàng (Customer Portal - `/`):** Tìm kiếm chuyến xe đa tiêu chí, chọn vị trí giường nằm 34 phòng Limousine VIP 2 tầng, khóa giữ chỗ 10 phút Pessimistic Lock, thanh toán VietQR PayOS / VNPAY / COD, tra cứu vé qua mã PNR.
2. **Cổng Nhà Xe Đối Tác (Company Portal - `/company/*`):** Quản lý đội xe, tài xế, khai báo tuyến đường, trạm đón/trả với ETA chính xác, tạo lịch chạy tự động sinh 34 ghế, giám sát bán vé, xem báo cáo doanh thu và đối soát ví tiền.
3. **Cổng Quản Trị Sàn (Admin Portal - `/admin/*`):** Quản lý Master Data toàn quốc, thẩm định cấp phép nhà xe (KYB), phê duyệt Admin 2 tầng (Root Admin vs Sub-Admin), quản trị cổng thanh toán, đối soát ký quỹ Escrow chu kỳ 15 ngày, Audit Log toàn sàn.

### 2.2 Bảng Ma Trận RACI
| Nhóm Nghiệp Vụ | Khách Hàng | Nhà Xe | Sub-Admin | Root Admin |
| :--- | :--- | :--- | :--- | :--- |
| **Tìm chuyến & Đặt giữ chỗ 10p** | Thực hiện (R) | Xem (I) | Giám sát (I) | Giám sát (I) |
| **Quản lý xe, tài xế & chuyến** | Không quyền | Chịu trách nhiệm (A) | Hỗ trợ (C) | Toàn quyền (A) |
| **Đăng ký đối tác & Thẩm định KYB** | Không quyền | Nộp hồ sơ (R) | Thẩm định (R) | Phê duyệt cuối (A) |
| **Đối soát doanh thu & Ký quỹ** | Không quyền | Đề nghị rút (R) | Xác nhận đối soát (R) | Giải ngân (A) |
| **Thêm/Xóa Admin & Audit Log** | Không quyền | Không quyền | Đề xuất duyệt | Phê duyệt độc quyền (A) |

---

## 3. CÁC QUY TRÌNH NGHIỆP VỤ CỐT LÕI
### 3.1 Khóa giữ chỗ chống xung đột ghế (Pessimistic Locking)
Khi khách chọn giường (ví dụ: Phòng 01 Tầng dưới), hệ thống kích hoạt cơ chế khóa giữ chỗ tạm thời (TEMPORARY_HOLD) trong 10 phút. Trong thời gian này, không có hành khách nào khác có thể chọn hoặc thanh toán vị trí này. Quá 10 phút không thanh toán, hệ thống tự động giải phóng chỗ về trạng thái AVAILABLE.

### 3.2 Thanh toán & Ký quỹ Escrow
Hỗ trợ 3 phương thức: VietQR PayOS, VNPAY Gateway, COD (Tiền mặt). Tiền thanh toán trực tuyến được sàn TravelEasy tạm giữ trong tài khoản ký quỹ Escrow. Sau khi chuyến xe xuất bến an toàn, tiền mới được chuyển sang số dư khả dụng của nhà xe trong kỳ đối soát 15 ngày.

### 3.3 Chuẩn Xóa Mềm 100% (Soft Delete Compliance)
Tất cả bảng dữ liệu cốt lõi (users, bus_companies, locations, seat_templates, banners, routes, trips) đều áp dụng cơ chế Soft Delete (cờ `is_deleted`). Nghiêm cấm hoàn toàn xóa cứng trên trang Admin để bảo toàn lịch sử kiểm toán.

### 3.4 Phân quyền 2 tầng & Duyệt tạo Admin
Chỉ Root System Admin (`admin@traveleasy.vn`) có quyền bổ nhiệm Admin. Yêu cầu tạo Admin từ Sub-Admin sẽ được lưu vào bảng `admin_creation_requests` và cần Root Admin phê duyệt mới được cấp tài khoản.
"""

# 3. 03_backlog.md
md3 = """# PRODUCT BACKLOG CHUẨN AGILE/SCRUM — DỰ ÁN TRAVELEASY
> **Quy mô:** 70 User Stories | 4 Sprints | 290 Story Points  
> **Đơn vị quản lý:** Nhóm 7 — 5 Thành viên chính thức  
> **Trạng thái:** Active & Sprint Tracking  

---

## 1. TỔNG QUAN ĐỊNH MỨC & PHÂN BỔ 4 SPRINTS
| Sprint | Trọng Tâm Mục Tiêu | Số User Story | Story Points | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| **Sprint 1** | Kiến trúc nền tảng, CSDL 36 bảng, Auth JWT, Master Data | 15 US | 52 SP | ✅ Hoàn thành (100%) |
| **Sprint 2** | Động cơ Đặt vé lõi, Khóa ghế 10p, Thanh toán, Cổng Admin/Company | 18 US | 70 SP | ✅ Nghiệm thu (88.6%) |
| **Sprint 3** | Vận hành nhà xe, Báo cáo đối soát, Tra cứu vé, Duyệt Admin | 18 US | 74 SP | 🚀 Đang triển khai |
| **Sprint 4** | Tối ưu hiệu năng, Đánh giá vi phạm, QA/Testing, Đóng gói OJT | 19 US | 94 SP | 📋 Kế hoạch chuẩn bị |
| **TỔNG CỘNG** | **Toàn bộ hệ thống TravelEasy hoàn chỉnh đáp ứng sản xuất** | **70 US** | **290 SP** | **Bảo vệ Đồ Án OJT** |

---

## 2. DANH MỤC CHI TIẾT USER STORIES (PRODUCT BACKLOG ITEMS)

### 2.1 Phân hệ Quản trị Sàn (Admin Portal - Phụ trách: Nguyễn Đại Phát)
| Mã US | Tên Tính Năng | Mô Tả User Story | SP | Độ Ưu Tiên | Sprint |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **US-ADM-01** | Xem Dashboard tổng quan 4 KPI | Là Quản trị viên, tôi muốn xem doanh thu, hoa hồng, vé bán, chuyến chạy thời gian thực. | 8 | Must Have | Sprint 1 |
| **US-ADM-02** | Quản lý danh mục Tỉnh thành & Bến xe | Là Quản trị viên, tôi muốn quản lý danh mục địa bàn và xóa mềm an toàn. | 5 | Must Have | Sprint 1 |
| **US-ADM-03** | Quản lý mẫu sơ đồ ghế | Cấu hình sơ đồ mẫu 29 ghế, 34 phòng limousine, 45 ghế. | 5 | Must Have | Sprint 1 |
| **US-ADM-04** | Quản lý người dùng & Phân quyền RBAC | Quản lý tài khoản, khóa tài khoản, phân quyền và xóa mềm người dùng. | 5 | Must Have | Sprint 1 |
| **US-ADM-05** | Phân quyền 2 tầng & Phê duyệt tạo Admin | Root Admin phê duyệt các yêu cầu tạo mới Admin từ Sub-Admin. | 8 | Must Have | Sprint 3 |
| **US-ADM-06** | Thẩm định hồ sơ đối tác nhà xe (KYB) | Thẩm định giấy phép kinh doanh, hợp đồng để kích hoạt nhà xe. | 8 | Must Have | Sprint 2 |
| **US-ADM-07** | Cấu hình Cổng thanh toán & Đối soát | Bật/tắt PayOS, VNPAY, COD và theo dõi ma trận đối soát. | 5 | Must Have | Sprint 2 |
| **US-ADM-08** | Quản lý Đối soát & Ký quỹ (Settlements) | Theo dõi chu kỳ 15 ngày, xác nhận và duyệt lệnh giải ngân ví nhà xe. | 8 | Must Have | Sprint 3 |
| **US-ADM-09** | Cấu hình chính sách hủy vé & hoàn tiền | Cài đặt mốc thời gian và % tiền vé được hoàn khi hủy vé. | 5 | Should Have | Sprint 2 |
| **US-ADM-10** | Kiểm duyệt báo cáo vi phạm & đánh giá xấu | Ẩn đánh giá bôi nhọ, xử lý tranh chấp vé hoặc phạt nhà xe vi phạm. | 5 | Should Have | Sprint 3 |

### 2.2 Phân hệ Nhà Xe Đối Tác (Company Portal - Phụ trách: Phạm Thanh Phong & Phạm Công Thành)
| Mã US | Tên Tính Năng | Mô Tả User Story | SP | Độ Ưu Tiên | Sprint |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **US-COM-01** | Đăng ký đối tác & Tải hồ sơ pháp lý | Chủ nhà xe đăng ký trực tuyến, nộp giấy phép vận tải gia nhập sàn. | 8 | Must Have | Sprint 2 |
| **US-COM-02** | Quản lý phương tiện & Biển số xe | Khai báo xe, biển kiểm soát, loại xe, gán sơ đồ ghế và bảo dưỡng. | 5 | Must Have | Sprint 2 |
| **US-COM-03** | Quản lý tài xế & Phụ xe | Lưu trữ danh bạ lái xe, số bằng lái và phân công cho từng chuyến xe. | 5 | Should Have | Sprint 3 |
| **US-COM-04** | Tuyến đường & Điểm đón/trả với ETA | Định nghĩa lộ trình từ A đến B, các trạm đón và mốc giờ dự kiến. | 5 | Must Have | Sprint 2 |
| **US-COM-05** | Khởi tạo chuyến xe tự động sinh 34 ghế | Mở chuyến xe chạy theo giờ, hệ thống tự động sinh 34 ghế trống. | 8 | Must Have | Sprint 2 |
| **US-COM-06** | Sơ đồ bán vé & Quản lý đơn vé chuyến | Quan sát trực quan trạng thái ghế đã bán, giữ chỗ hoặc còn trống. | 8 | Must Have | Sprint 2 |
| **US-COM-07** | Báo cáo doanh thu & Rút tiền đối soát | Theo dõi doanh thu thực nhận sau trừ hoa hồng và gửi lệnh rút tiền. | 8 | Must Have | Sprint 3 |

### 2.3 Phân hệ Khách Hàng (Customer Portal - Phụ trách: Đoàn Nhật Cường & Trần Minh Đức)
| Mã US | Tên Tính Năng | Mô Tả User Story | SP | Độ Ưu Tiên | Sprint |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **US-CUS-01** | Tìm kiếm chuyến xe đa tiêu chí | Nhập điểm đi, điểm đến, ngày khởi hành để tìm các chuyến xe. | 8 | Must Have | Sprint 2 |
| **US-CUS-02** | Bộ lọc tìm kiếm nâng cao thời gian thực | Lọc theo giờ chạy, tầm giá vé, loại xe limousine và nhà xe. | 5 | Must Have | Sprint 2 |
| **US-CUS-03** | Sơ đồ 34 phòng Limousine VIP 2 tầng | Nhìn thấy trực quan vị trí giường tầng trên, tầng dưới để lựa chọn. | 8 | Must Have | Sprint 2 |
| **US-CUS-04** | Khóa giữ chỗ 10 phút đếm ngược | Vị trí ghế được giữ độc quyền trong 10 phút để khách an tâm thanh toán. | 8 | Must Have | Sprint 2 |
| **US-CUS-05** | Thanh toán VietQR PayOS quét mã | Quét mã QR chuyển khoản tự động và nhận xác nhận thanh toán tức thì. | 8 | Must Have | Sprint 2 |
| **US-CUS-06** | Thanh toán Cổng VNPAY và COD | Tùy chọn thanh toán qua thẻ ngân hàng VNPAY hoặc tiền mặt khi lên xe. | 5 | Must Have | Sprint 2 |
| **US-CUS-07** | Tra cứu vé điện tử không cần đăng nhập | Nhập mã vé (PNR) và SĐT để xem lại thông tin vé xe bất cứ lúc nào. | 5 | Must Have | Sprint 2 |
| **US-CUS-08** | Đánh giá chất lượng chuyến đi kèm số sao | Chấm điểm số sao và viết bình luận phản ánh trải nghiệm dịch vụ. | 5 | Should Have | Sprint 3 |
"""

# 4. 04_report_sprint_1.md
md4 = """# BÁO CÁO TỔNG KẾT & NGHIỆM THU SPRINT 1
> **Đơn vị:** Nhóm 7 — Dự Án TravelEasy (5 Thành viên)  
> **Thời gian:** 2 tuần (Tuần 1 - Tuần 2)  
> **Trạng thái:** ✅ Hoàn thành 100% (52/52 Story Points)  

---

## 1. THÔNG SỐ VẬN HÀNH SPRINT 1
| Chỉ Số Đo Lường | Giá Trị Nghiệm Thu Thực Tế |
| :--- | :--- |
| **Thời gian thực hiện** | 2 tuần (Từ Tuần 1 đến hết Tuần 2) |
| **Mục tiêu Sprint (Sprint Goal)** | Xây dựng hạ tầng kỹ thuật, mô hình CSDL 36 bảng, phân quyền RBAC JWT, nạp Master Data |
| **Tổng số Story Points cam kết** | 52 Story Points (15 Tasks) |
| **Tổng số Story Points hoàn thành** | **52 / 52 Story Points (Đạt 100% kế hoạch)** |
| **Số task chuyển tiếp (Rollover)** | **0 Task (Không phát sinh nợ kỹ thuật)** |

---

## 2. ĐÓNG GÓP CỦA 5 THÀNH VIÊN TRONG SPRINT 1
| Thành Viên | Vai Trò Chuyên Trách | SP | Kết Quả Đóng Góp Chính |
| :--- | :--- | :---: | :--- |
| **Phạm Công Thành** | Team Leader & Architect | 12 SP | Dựng khung Spring Boot 3, thiết kế CSDL 36 bảng, cấu hình Docker Compose |
| **Nguyễn Đại Phát** | Admin Lead & Full-Stack | 11 SP | Xây dựng UI Admin, danh mục Tỉnh thành, Bến xe, Sơ đồ mẫu ghế master |
| **Phạm Thanh Phong** | Core Booking & Seat Engine | 11 SP | Hiện thực hóa Sơ đồ ghế master 34 phòng VIP, thiết lập API cấu hình xe |
| **Đoàn Nhật Cường** | Frontend & Mobile Specialist | 9 SP | Xây dựng Header/Footer chuẩn VeXeRe, Layout chuẩn SEO, Routing React |
| **Trần Minh Đức** | Full-Stack & QA/Testing | 9 SP | Hiện thực hóa Security Filter JWT, phân quyền RBAC 3 vai trò, Seed Master Data |

---

## 3. CHI TIẾT SẢN PHẨM BÀN GIAO (DELIVERABLES)
1. **Module Xác Thực JWT & RBAC:** Phân tầng Controller -> Service -> Repository. Lớp `JwtAuthenticationFilter` chặn lọc và xác thực mọi request an toàn.
2. **Cơ Sở Dữ Liệu PostgreSQL:** Tệp tin `schema.sql` 36 bảng quan hệ, khóa ngoại, index và cờ xóa mềm `is_deleted`.
3. **Cổng Quản Trị Danh Mục (Admin):** Quản lý Tỉnh/Thành phố, Bến xe toàn quốc, Mẫu sơ đồ 34 phòng limousine với đầy đủ Thêm/Sửa/Lọc/Xóa mềm.
4. **Bộ Tài Liệu Kỹ Thuật:** Class Diagram, ERD, Deployment Guide đầy đủ.

---

## 4. KỲ HỌP CẢI TIẾN SPRINT (SPRINT RETROSPECTIVE)
* **What Went Well:** Tốc độ thiết kế CSDL và khởi tạo dự án nhanh, hoàn thành trước 2 ngày; cả 5 thành viên phối hợp ăn ý.
* **What Could Be Improved:** Bổ sung thêm chỉ mục (index) cho các bảng giao dịch để tăng tốc độ tìm kiếm trong Sprint 2.
"""

# 5. 05_planning_sprint_2.md
md5 = """# KẾ HOẠCH THỰC HIỆN SPRINT 2 (SPRINT 2 PLANNING)
> **Đơn vị:** Nhóm 7 — Dự Án TravelEasy (5 Thành viên)  
> **Thời gian:** 2 tuần (Tuần 3 - Tuần 4)  
> **Quy mô:** 70 Story Points (18 Tasks chi tiết)  
> **Mục tiêu:** Động Cơ Đặt Vé Lõi & Hai Cổng Quản Trị  

---

## 1. QUY MÔ & PHÂN BỔ TÀI NGUYÊN
* **Thời gian thực hiện:** 2 tuần (Từ Tuần 3 đến hết Tuần 4)
* **Tổng Story Points dự kiến:** 70 Story Points (18 Tasks chi tiết)
* **Phân bổ 5 thành viên:**
  - Phạm Công Thành: 16 SP
  - Nguyễn Đại Phát: 15 SP
  - Phạm Thanh Phong: 15 SP
  - Đoàn Nhật Cường: 12 SP
  - Trần Minh Đức: 12 SP

---

## 2. BẢNG PHÂN BỔ CHI TIẾT SPRINT 2 BACKLOG
| Mã Task | Nội Dung Công Việc | Phụ Trách | SP | Tiêu Chí Nghiệm Thu |
| :--- | :--- | :--- | :---: | :--- |
| **SP2-01** | API Tìm kiếm chuyến xe & Bộ lọc | Phạm Công Thành | 5 | Lọc theo giá, giờ, nhà xe < 300ms |
| **SP2-02** | Sơ đồ 34 phòng Limousine VIP 2 tầng | Phạm Thanh Phong | 5 | Hiển thị đúng tầng trên/dưới, trạng thái |
| **SP2-03** | Thuật toán khóa giữ chỗ 10p (Pessimistic) | Phạm Công Thành | 8 | Không xảy ra double booking khi 2 user chọn |
| **SP2-04** | Tích hợp Cổng PayOS VietQR 24/7 | Trần Minh Đức | 5 | Sinh mã QR động, Webhook xác nhận tức thì |
| **SP2-05** | Tích hợp Cổng thanh toán VNPAY Sandbox | Trần Minh Đức | 5 | Chuyển hướng cổng, tính checksum chuẩn |
| **SP2-06** | Trang Checkout & Thu thập thông tin khách | Đoàn Nhật Cường | 4 | Validate SĐT, email, điểm đón/trả |
| **SP2-07** | Trang Tra cứu vé qua mã PNR & SĐT | Đoàn Nhật Cường | 4 | Hiển thị chi tiết vé, mã QR vé điện tử |
| **SP2-08** | Cổng Nhà Xe: Đăng nhập & Đổi mật khẩu | Nguyễn Đại Phát | 3 | Chỉ role COMPANY mới vào được /company |
| **SP2-09** | Cổng Nhà Xe: Quản lý phương tiện & Xe | Nguyễn Đại Phát | 5 | Thêm, sửa, gán sơ đồ ghế cho từng xe |
| **SP2-10** | Cổng Nhà Xe: Quản lý tuyến đường & ETA | Nguyễn Đại Phát | 5 | Định nghĩa điểm đón/trả và mốc giờ |
| **SP2-11** | Cổng Nhà Xe: Tạo chuyến tự sinh 34 ghế | Phạm Thanh Phong | 5 | Chọn xe, chọn tuyến -> sinh ghế chuyến |
| **SP2-12** | Cổng Nhà Xe: Sơ đồ theo dõi bán vé chuyến | Phạm Thanh Phong | 5 | Xem trực quan các ghế đã thanh toán |
| **SP2-13** | Cổng Admin: Quản lý nhà xe & Duyệt KYB | Nguyễn Đại Phát | 5 | Kích hoạt hoặc đình chỉ hoạt động nhà xe |
| **SP2-14** | Cổng Admin: Cấu hình cổng thanh toán | Trần Minh Đức | 2 | Bật tắt PayOS, VNPAY, COD toàn sàn |
| **SP2-15** | Cổng Admin: Quản lý chính sách hủy vé | Phạm Công Thành | 3 | Cài đặt mốc giờ và % hoàn tiền |
| **SP2-16** | Cơ chế Xóa Mềm 100% trang Admin | Nguyễn Đại Phát | 2 | Không hard delete ở bất kỳ bảng nào |
| **SP2-17** | Đăng ký đối tác trực tuyến (KYB) | Đoàn Nhật Cường | 4 | Form nộp hồ sơ nhà xe (Rollover SP3) |
| **SP2-18** | Đăng nhập Google OAuth2 mạng xã hội | Phạm Công Thành | 4 | Nút Login Google (Rollover SP3) |

---

## 3. MA TRẬN QUẢN TRỊ RỦI RO SPRINT 2
* **Rủi ro 1 - Tranh chấp giữ chỗ (Double Booking):** Áp dụng Pessimistic Locking (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) tại tầng CSDL và kiểm tra trạng thái vé trước khi xác nhận giữ chỗ.
* **Rủi ro 2 - Độ trễ Webhook ngân hàng:** Thiết lập cơ chế Polling song song từ Frontend và ân hạn thêm 2 phút trước khi hủy đơn hàng.
* **Rủi ro 3 - Khối lượng công việc lớn (70 SP):** Ưu tiên 16 task cốt lõi, chủ động rollover 2 task phụ sang Sprint 3 nếu gặp cản trở về thời gian.
"""

# 6. 06_report_sprint_2_planning_sprint_3.md
md6 = """# BÁO CÁO TỔNG KẾT SPRINT 2 & KẾ HOẠCH SPRINT 3
> **Đơn vị:** Nhóm 7 — Dự Án TravelEasy (5 Thành viên)  
> **Nghiệm thu Sprint 2:** 62/70 Story Points (88.6%)  
> **Kế hoạch Sprint 3:** 74 Story Points (Đối soát tài chính & Vận hành toàn diện)  

---

## 1. TỔNG KẾT ĐÁNH GIÁ SPRINT 2
* **Story Points hoàn thành:** 62 / 70 Story Points (88.6% kế hoạch). Toàn bộ luồng nghiệp vụ kinh doanh cốt lõi (Core Booking Flow) và 2 Cổng quản trị (`/company` và `/admin`) đã vận hành trơn tru.
* **Chuẩn Xóa Mềm 100%:** Toàn bộ các trang Admin đã chuyển đổi từ Xóa cứng sang Xóa mềm.
* **Thanh toán:** Tích hợp thành công VietQR PayOS, VNPAY Sandbox và COD; dọn dẹp các cổng lỗi thời.
* **Task chuyển tiếp (Rollover):** 2 Tasks (8 SP) chuyển tiếp sang Sprint 3 (KYB form và Google OAuth2).

---

## 2. KẾ HOẠCH SPRINT 3 — ĐỐI SOÁT TÀI CHÍNH & VẬN HÀNH TOÀN DIỆN
* **Thời gian thực hiện:** 2 tuần (Tuần 5 - Tuần 6)
* **Quy mô cam kết:** 74 Story Points (8 SP rollover + 66 SP tính năng mới)
* **5 Trọng tâm lớn của Sprint 3:**
  1. **Module Đối soát Tài chính (`/admin/settlements`):** Chu kỳ 15 ngày, tự động trích hoa hồng sàn, tài khoản ký quỹ Escrow và lệnh giải ngân ví nhà xe.
  2. **Kiểm duyệt Báo cáo Vi phạm (`/admin/review-reports`):** Tiếp nhận khiếu nại của khách, kiểm duyệt đánh giá tiêu cực và xử lý tranh chấp vé.
  3. **Phân quyền Duyệt Admin (`/admin/users`):** Hệ thống phê duyệt 2 tầng bảo vệ hệ thống trước hành vi tạo admin trái phép.
  4. **Cổng Đăng Ký Đối Tác (KYB Registration):** Cổng đăng ký dành riêng cho nhà xe mới gia nhập sàn với form xác thực giấy phép kinh doanh.
  5. **Tích hợp Google OAuth2:** Đăng nhập nhanh một chạm bằng tài khoản Google cá nhân.
"""

files = [
    ("01_SRS_tham_khao.md", md1),
    ("02_SRS_TravelEasy.md", md2),
    ("03_backlog.md", md3),
    ("04_report_sprint_1.md", md4),
    ("05_planning_sprint_2.md", md5),
    ("06_report_sprint_2_planning_sprint_3.md", md6)
]

for filename, content in files:
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f" Saved: {path}")

print("\n All markdown files regenerated with correct 5 members!")
