# 📚 TRAVELEASY — TỔNG HỢP VÀ ĐIỀU HƯỚNG TÀI LIỆU DỰ ÁN (MASTER DOCS INDEX)

> **Dự án**: Sàn Thương Mại Điện Tử & Đặt Vé Xe Khách Liên Tỉnh Trực Tuyến TravelEasy  
> **Đơn vị thực hiện**: Nhóm 7 — Khóa OJT  
> **Trưởng nhóm / Kiến trúc sư hệ thống**: Phạm Công Thành (`phamcongthanhvn2k6`)  
> **Cơ sở dữ liệu**: Supabase Cloud PostgreSQL (44 bảng chuẩn hóa + Realtime RPC)  

---


> [!IMPORTANT]
> ### 🏆 NGUYÊN TẮC VÀNG: BẮT BUỘC COMMIT BẰNG TIẾNG VIỆT CÓ DẤU
> Toàn bộ thành viên nhóm 7 khi làm việc với Git bắt buộc phải tuân thủ quy định: **100% commit message phải viết bằng Tiếng Việt có dấu đầy đủ** theo chuẩn `type(scope): mô tả hành động bằng Tiếng Việt có dấu`. Chi tiết xem tại [GIT_WORKFLOW.md](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/docs/03-api-and-deployment/GIT_WORKFLOW.md).

## 🧭 CẤU TRÚC PHÂN LOẠI TÀI LIỆU (6 PHÂN HỆ CHÍNH)

Toàn bộ tài liệu kỹ thuật, nghiệp vụ, kiến trúc và quy trình quản trị dự án được cấu trúc tinh gọn thành **5 phân hệ chuyên biệt**:

```
docs/
├── README.md                                    # 📌 Trang chủ điều hướng Master Index
├── schema.sql                                   # 🗄️ CSDL chuẩn 44 bảng (Single Source of Truth)
├── 01-requirements/                             # 1️⃣ Phân hệ Yêu Cầu & Đặc Tả Nghiệp Vụ
├── 02-architecture-and-db/                      # 2️⃣ Phân hệ Kiến Trúc & Cơ Sở Dữ Liệu
├── 03-api-and-deployment/                       # 3️⃣ Phân hệ API, Triển Khai & Vận Hành
├── 04-agile-and-sprints/                        # 4️⃣ Phân hệ Quản Trị Agile, Trello & Sprints
├── 05-qa-and-testing/                           # 5️⃣ Phân hệ Đảm Bảo Chất Lượng (QA) & Kiểm Thử
├── 06-business-logic-audits/                    # 6️⃣ Phân hệ Kiểm Toán Nghiệp Vụ & Báo Cáo Lỗ Hổng
├── test-reports/                                # 🧪 Báo cáo kiểm thử cá nhân từng thành viên
└── screenshots/                                 # 📸 Hình ảnh minh chứng nghiệm thu thực tế
```

---

## 1️⃣ PHÂN HỆ YÊU CẦU & ĐẶC TẢ NGHIỆP VỤ (`docs/01-requirements/`)

Tập trung vào phạm vi hệ thống, luồng hành trình người dùng và khung pháp lý sàn vận tải:

* 📄 [SRS_Vexere.md](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/docs/01-requirements/SRS_Vexere.md)  
  * **Nội dung**: Bản đặc tả yêu cầu phần mềm chi tiết (SRS) mô phỏng tiêu chuẩn thực tế của nền tảng VeXeRe.
  * **Trọng tâm**: Yêu cầu chức năng (FR) cho 3 đối tượng (Khách hàng, Nhà xe đối tác, Quản trị sàn), yêu cầu phi chức năng (NFR), SLA, tính sẵn sàng 99.9% và bảo mật PII/PCI-DSS.

* 📄 [domain.md](file:///c:/Users/LEGION/OneDrive/Máy%20tính/Nhom7_QUANLYNHAXE/docs/01-requirements/domain.md)  
  * **Nội dung**: Mô hình Domain-Driven Design (DDD), phân tích Bounded Context và các Aggregate Root nghiệp vụ.
  * **Trọng tâm**: Định nghĩa rõ vòng đời Vé, Chuyến xe, Hàng hóa, Xe hợp đồng, Escrow thanh toán và Thuật toán điều chỉnh giá động.

* 📄 [HIEP_DINH_QUY_CHE_HOAT_DONG_VA_HOP_DONG_HOP_TAC.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/01-requirements/HIEP_DINH_QUY_CHE_HOAT_DONG_VA_HOP_DONG_HOP_TAC.md)  
  * **Nội dung**: Văn bản pháp lý, Quy chế hoạt động sàn TMĐT theo Nghị định 52/2013/NĐ-CP và Nghị định 85/2021/NĐ-CP.
  * **Trọng tâm**: Cơ chế ký quỹ bảo lãnh tiền vé (Escrow), phân định trách nhiệm khi huỷ chuyến, bồi thường chậm muộn 150%, điều khoản bất khả kháng và hợp đồng điện tử nhà xe.

---

## 2️⃣ PHÂN HỆ KIẾN TRÚC & CƠ SỞ DỮ LIỆU (`docs/02-architecture-and-db/`)

Tập trung vào mô hình kỹ thuật, sơ đồ quan hệ và hạ tầng dữ liệu:

* 📄 [PROJECT_ARCHITECTURE.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/02-architecture-and-db/PROJECT_ARCHITECTURE.md)  
  * **Nội dung**: Kiến trúc tổng thể hệ thống (Clean Architecture & Micro-ready Monolith).
  * **Trọng tâm**: Phân tầng Presentation, Application, Domain, Infrastructure; giải pháp chịu tải cao, caching Redis đa tầng, cơ chế xử lý tương tranh ghế (Pessimistic Locking `SELECT ... FOR UPDATE`).

* 📄 [class_diagram.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/02-architecture-and-db/class_diagram.md)  
  * **Nội dung**: Biểu đồ Class Diagram chi tiết toàn bộ các Entity, DTO, Repository, Service và Controller trong Spring Boot.

* 📄 [database_design.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/02-architecture-and-db/database_design.md)  
  * **Nội dung**: Thiết kế chi tiết 44 bảng dữ liệu, chuẩn hóa 3NF, danh sách khóa chính (PK), khóa ngoại (FK), Trigger tự động và hệ thống Index tăng tốc truy vấn.

* 📄 [schema.sql](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/schema.sql) *(File chuẩn SSOT)*  
  * **Nội dung**: Toàn bộ câu lệnh DDL khởi tạo 44 bảng CSDL và toàn bộ tập dữ liệu mẫu sinh động (Seed data chuẩn cho Chuyến xe, Tuyến đường, Nhà xe, Vé xe, Người dùng).

* 📄 [MIGRATION_SPRINT_4_EXTENSIONS.sql](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/02-architecture-and-db/MIGRATION_SPRINT_4_EXTENSIONS.sql)  
  * **Nội dung**: Kịch bản SQL migration bổ sung 8 bảng và các trường mở rộng phục vụ nghiệp vụ nâng cao Sprint 4 (Gửi hàng xe khách, Thuê xe chuyến, Ví tích điểm, GPS Tracking, Bảo hiểm, Bán vé POS tại quầy).

---

## 3️⃣ PHÂN HỆ API, TRIỂN KHAI & VẬN HÀNH (`docs/03-api-and-deployment/`)

Cung cấp tài liệu tích hợp API, đóng gói triển khai và cẩm nang vận hành:

* 📄 [API_DOCUMENTATION.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/03-api-and-deployment/API_DOCUMENTATION.md)  
  * **Nội dung**: Danh mục toàn bộ API RESTful kèm Request/Response mẫu, mã HTTP status và tài liệu Swagger UI.

* 📄 [DEPLOYMENT_GUIDE.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/03-api-and-deployment/DEPLOYMENT_GUIDE.md)  
  * **Nội dung**: Hướng dẫn đóng gói Docker đa tầng (Multi-stage build), cấu hình Docker Compose và triển khai lên môi trường Cloud.

* 📄 [OPERATIONS_RUNBOOK.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/03-api-and-deployment/OPERATIONS_RUNBOOK.md)  
  * **Nội dung**: Cẩm nang vận hành sự cố (SRE & On-call Runbook), kịch bản ứng phó nghẽn mạng, lỗi cổng thanh toán VNPay/VietQR, giải cứu deadlock và kích hoạt chế độ phòng vệ khẩn cấp.

* 📄 [USER_MANUAL.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/03-api-and-deployment/USER_MANUAL.md)  
  * **Nội dung**: Sổ tay hướng dẫn sử dụng chi tiết dành cho Khách hàng, Nhà xe vận hành và Quản trị viên sàn.

* 📄 [GIT_WORKFLOW.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/03-api-and-deployment/GIT_WORKFLOW.md)  
  * **Nội dung**: Quy chuẩn quy trình phân nhánh Git (Branching Strategy), quy tắc đặt tên commit Conventional Commits và quy trình Review / Merge Pull Request.

* 📄 [HUONG_DAN_PHAN_CHIA_THU_MUC_CODE_NHOM_7.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/03-api-and-deployment/HUONG_DAN_PHAN_CHIA_THU_MUC_CODE_NHOM_7.md)  
  * **Nội dung**: Hướng dẫn phân chia cấu trúc mã nguồn Frontend và Backend nhằm ngăn ngừa triệt để xung đột merge giữa 5 thành viên trong nhóm.

---

## 4️⃣ PHÂN HỆ QUẢN TRỊ AGILE, TRELLO & SPRINTS (`docs/04-agile-and-sprints/`)

Tài liệu quản lý tiến độ, ma trận phân bổ công việc và kịch bản bảo vệ:

* 📄 [KE_HOACH_PHAN_CHIA_SPRINT_AGILE.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/04-agile-and-sprints/KE_HOACH_PHAN_CHIA_SPRINT_AGILE.md)  
  * **Nội dung**: Kế hoạch tổng thể 4 Sprint theo khung phương pháp Agile/Scrum, phân bổ Story Points cân đối giữa các thành viên.

* 📄 [TRELLO_BOARD_MANAGEMENT.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/04-agile-and-sprints/TRELLO_BOARD_MANAGEMENT.md)  
  * **Nội dung**: Quy chế quản lý bảng Trello chuẩn công nghiệp, định nghĩa nhãn (Labels), trạng thái cột (To Do, In Progress, Code Review, Done) và Checklist nghiệm thu.

* 📄 [TRELLO_4_SPRINTS_CAN_DOI_VA_RO_TRINH_MO_RONG.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/04-agile-and-sprints/TRELLO_4_SPRINTS_CAN_DOI_VA_RO_TRINH_MO_RONG.md)  
  * **Nội dung**: Lộ trình cân đối khối lượng công việc 4 Sprint và chiến lược mở rộng quy mô dự án.

* 📄 [TRELLO_SPRINT_3_4_PERFECTION_MATRIX.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/04-agile-and-sprints/TRELLO_SPRINT_3_4_PERFECTION_MATRIX.md)  
  * **Nội dung**: Ma trận chi tiết 100+ thẻ công việc cho Sprint 3 (Kiểm thử & Nghiệm thu) và Sprint 4 (Mở rộng tính năng nâng cao).

* 📄 **Chi Tiết Báo Cáo Từng Sprint**:
  * [SPRINT_1_README.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/04-agile-and-sprints/SPRINT_1_README.md): Nền tảng Core, Xác thực JWT, CSDL chuẩn và Quản trị Danh mục.
  * [SPRINT_2_README.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/04-agile-and-sprints/SPRINT_2_README.md): Tìm kiếm vé xe đa tiêu chí, Chọn sơ đồ ghế 2 tầng, Thanh toán VNPAY & QR.
  * [SPRINT_3_README.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/04-agile-and-sprints/SPRINT_3_README.md): Cổng điều hành đối tác nhà xe, Báo cáo kiểm thử hồi quy & Tối ưu hiệu năng.
  * [SPRINT_4_README.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/04-agile-and-sprints/SPRINT_4_README.md): 8 Tính năng đột phá (Ký gửi hàng hóa, Thuê xe chuyến, Ví voucher, Bán vé POS quầy...).

* 📄 [THIET_KE_LUONG_NGHIEP_VU_VA_DIEU_HUONG_SPRINT_4.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/04-agile-and-sprints/THIET_KE_LUONG_NGHIEP_VU_VA_DIEU_HUONG_SPRINT_4.md)  
  * **Nội dung**: Thiết kế luồng đi UX/UI logic, sơ đồ điều hướng Menu và đường dẫn URL cho toàn bộ tính năng Sprint 4.

* 📄 [KE_HOACH_NANG_CAP_TINH_NANG_VA_TRANG_MOI.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/04-agile-and-sprints/KE_HOACH_NANG_CAP_TINH_NANG_VA_TRANG_MOI.md)  
  * **Nội dung**: Định hướng R&D sản phẩm và tích hợp công nghệ AI tương lai.

* 📄 [KE_HOACH_THIET_KE_CONG_VIEC_VA_KICH_BAN_BAO_VE_OJT.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/04-agile-and-sprints/KE_HOACH_THIET_KE_CONG_VIEC_VA_KICH_BAN_BAO_VE_OJT.md)  
  * **Nội dung**: Kịch bản thuyết trình bảo vệ đồ án OJT, phân vai trả lời phản biện và điều phối demo thực tế trước Hội đồng.

---

## 5️⃣ PHÂN HỆ KIỂM THỬ (QA) & NGHIỆM THU (`docs/05-qa-and-testing/`)

Tài liệu chứng minh chất lượng phần mềm thông qua các kịch bản kiểm thử tự động và thủ công:

* 📄 [TEST_PLAN_AND_REPORT.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/05-qa-and-testing/TEST_PLAN_AND_REPORT.md)  
  * **Nội dung**: Kế hoạch kiểm thử tổng thể (Test Strategy), ma trận phân loại Test Case (Functional, Security, Concurrency, Regression) và kết quả nghiệm thu.

* 📄 [BIEN_BAN_NGHIEM_THU_KIEM_THU_TINH_NANG_NHOM_7.md](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/05-qa-and-testing/BIEN_BAN_NGHIEM_THU_KIEM_THU_TINH_NANG_NHOM_7.md)  
  * **Nội dung**: Biên bản nghiệm thu kiểm thử tính năng của Nhóm 7 có chữ ký điện tử xác nhận của Trưởng nhóm và các thành viên thực thi.

* 📁 [test-reports/](file:///c:/Users/LEGION/OneDrive/Máy tính/Nhom7_QUANLYNHAXE/docs/test-reports/)  
  * **Nội dung**: Thư mục phân lập báo cáo kiểm thử độc lập cho từng thành viên:
    * `cuong/` — Nguyễn Văn Cường
    * `duc/` — Trần Minh Đức
    * `phat/` — Nguyễn Đại Phát
    * `phong/` — Phạm Thanh Phong
    * `TEMPLATE_TEST_REPORT.md` — Mẫu biên bản chuẩn chống xung đột Git.

---

## 📸 THƯ MỤC MINH CHỨNG (`docs/screenshots/`)

Chứa hơn 40+ ảnh chụp màn hình ghi nhận từng tính năng thực tế đang chạy trên môi trường Development:
* Các modal CRUD quản trị xe, chuyến xe, địa điểm, tuyến đường.
* Giao diện chọn ghế 2 tầng, màn hình thanh toán VietQR & VNPay.
* Cổng đăng nhập đối tác nhà xe và tra cứu vé điện tử thời gian thực.

