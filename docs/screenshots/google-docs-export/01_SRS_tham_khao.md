# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) — MẪU THAM KHẢO CHUẨN
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
