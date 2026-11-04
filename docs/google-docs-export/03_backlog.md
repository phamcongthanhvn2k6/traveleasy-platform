# PRODUCT BACKLOG CHUẨN AGILE/SCRUM — DỰ ÁN TRAVELEASY
> **Quy mô:** 70 User Stories | 4 Sprints | 290 Story Points  
> **Đơn vị quản lý:** Nhóm 7 — TravelEasy Platform  
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

### 2.1 Phân hệ Quản trị Sàn (Admin Portal)
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

### 2.2 Phân hệ Nhà Xe Đối Tác (Company Portal)
| Mã US | Tên Tính Năng | Mô Tả User Story | SP | Độ Ưu Tiên | Sprint |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **US-COM-01** | Đăng ký đối tác & Tải hồ sơ pháp lý | Chủ nhà xe đăng ký trực tuyến, nộp giấy phép vận tải gia nhập sàn. | 8 | Must Have | Sprint 2 |
| **US-COM-02** | Quản lý phương tiện & Biển số xe | Khai báo xe, biển kiểm soát, loại xe, gán sơ đồ ghế và bảo dưỡng. | 5 | Must Have | Sprint 2 |
| **US-COM-03** | Quản lý tài xế & Phụ xe | Lưu trữ danh bạ lái xe, số bằng lái và phân công cho từng chuyến xe. | 5 | Should Have | Sprint 3 |
| **US-COM-04** | Tuyến đường & Điểm đón/trả với ETA | Định nghĩa lộ trình từ A đến B, các trạm đón và mốc giờ dự kiến. | 5 | Must Have | Sprint 2 |
| **US-COM-05** | Khởi tạo chuyến xe tự động sinh 34 ghế | Mở chuyến xe chạy theo giờ, hệ thống tự động sinh 34 ghế trống. | 8 | Must Have | Sprint 2 |
| **US-COM-06** | Sơ đồ bán vé & Quản lý đơn vé chuyến | Quan sát trực quan trạng thái ghế đã bán, giữ chỗ hoặc còn trống. | 8 | Must Have | Sprint 2 |
| **US-COM-07** | Báo cáo doanh thu & Rút tiền đối soát | Theo dõi doanh thu thực nhận sau trừ hoa hồng và gửi lệnh rút tiền. | 8 | Must Have | Sprint 3 |

### 2.3 Phân hệ Khách Hàng (Customer Portal)
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
