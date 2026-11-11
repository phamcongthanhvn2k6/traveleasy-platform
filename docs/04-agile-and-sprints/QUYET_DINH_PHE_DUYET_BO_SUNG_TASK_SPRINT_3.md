# 📜 QUYẾT ĐỊNH PHÊ DUYỆT BỔ SUNG & CHÍNH THỨC HÓA CÁC TASK MỚI CHO SPRINT 3
**Dự án**: Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy (`traveleasy-platform`)  
**Số văn bản**: `03/2026/QD-S3-TRAVELEASY`  
**Ngày ban hành**: 10/11/2026  
**Người ký duyệt**: **Phạm Công Thành** (Team Leader & System Architect)  

---

## 📌 CĂN CỨ VÀ LÝ DO PHÊ DUYỆT

1. **Căn cứ yêu cầu thực tế của đợt thực tập tốt nghiệp (OJT)**: Nhóm nhận định số lượng task ban đầu của Sprint 3 còn chưa thể hiện hết năng lực giải quyết bài toán nghiệp vụ toàn diện của mô hình vận tải hành khách liên tỉnh.
2. **Căn cứ việc cân bằng khối lượng công việc (Workload Balancing)**: Cần phân bổ định mức Story Points công bằng và đồng đều giữa 4 thành viên OJT active (Phạm Công Thành, Trần Minh Đức, Đoàn Nhật Cường, Nguyễn Đại Phát) nhằm đạt kết quả đánh giá tối đa từ giảng viên hướng dẫn. *(Lưu ý: Thành viên Phan Trung Kiên được miễn OJT theo quy chế đào tạo nên không giao task)*.
3. **Căn cứ tính khả thi kỹ thuật**: Toàn bộ hệ thống router, stub pages, API controller khung và 4 bảng CSDL mới trên Supabase đã được setup hoàn tất 100%, đảm bảo triển khai không có rủi ro xung đột mã nguồn.

---

## ⚖️ ĐIỀU 1: CHÍNH THỨC PHÊ DUYỆT DANH MỤC 8 TASK BỔ SUNG THÀNH TASK SPRINT 3

Chuyển đổi toàn bộ 8 task đề xuất thành các User Stories & Technical Tasks chính thức nằm trong phạm vi **Sprint 3 (Sprint Backlog)**:

| STT | Mã Task | Tên Nhiệm Vụ Nghiệp Vụ | Phụ Trách | Điểm SP | Mức Ưu Tiên |
|:---:|:---:|:---|:---:|:---:|:---:|
| 1 | **`[S316]`** | **Nghiệp Vụ Đổi Vé & Chuyển Chuyến Xe Khách** | Trần Minh Đức | **3 SP** | Ưu tiên 2 |
| 2 | **`[S317]`** | **Quản Lý Đón Trả Trung Chuyển Hành Khách Tận Nơi** | Trần Minh Đức | **3 SP** | Ưu tiên 3 |
| 3 | **`[S318]`** | **Sổ Chi Phí Vận Hành Chuyến & Báo Cáo Lãi Lỗ (P&L)** | Trần Minh Đức | **2 SP** | Ưu tiên 3 |
| 4 | **`[S319]`** | **Phân Công Tổ Lái & Kiểm Tra Điều Kiện Xuất Bến** | Đoàn Nhật Cường | **3 SP** | Ưu tiên 2 |
| 5 | **`[S320]`** | **WebApp Quét QR Soát Vé & Điểm Danh Hành Khách Lên Xe** | Đoàn Nhật Cường | **3 SP** | Ưu tiên 2 |
| 6 | **`[S321]`** | **Thiết Lập Chính Sách Phí Hoàn Hủy & Xử Lý Yêu Cầu Hủy Vé** | Nguyễn Đại Phát | **3 SP** | Ưu tiên 2 |
| 7 | **`[S322]`** | **Xuất PDF/Excel Lệnh Vận Chuyển Điện Tử Chuẩn Bộ GTVT** | Nguyễn Đại Phát | **2 SP** | Ưu tiên 3 |
| 8 | **`[S323]`** | **Kịch Bản E2E Test & Kiểm Thử Tích Hợp Ca Trực POS + Webhook** | Nguyễn Đại Phát | **2 SP** | Ưu tiên 2 |

---

## ⚖️ ĐIỀU 2: ĐIỀU CHỈNH CHỈ TIÊU & QUY MÔ SPRINT 3

- **Tổng số công việc Sprint 3**: Tăng từ 8 tasks lên **16 tasks**.
- **Tổng điểm Story Points Sprint 3**: Nâng từ 22 SP lên **42 Story Points**.
- **Chỉ tiêu phân bổ theo thành viên**:
  - **Phạm Công Thành**: 10 SP (`S301`, `S310`, `S311`)
  - **Trần Minh Đức**: 11 SP (`S307`, `S316`, `S317`, `S318`)
  - **Đoàn Nhật Cường**: 11 SP (`S305`, `S315`, `S319`, `S320`)
  - **Nguyễn Đại Phát**: 10 SP (`S313`, `S314`, `S321`, `S322`, `S323`)

---

## ⚖️ ĐIỀU 3: NGUYÊN TẮC THI CÔNG & BẢO TOÀN MÃ NGUỒN (CODE CONVENTION)

1. **Tuân thủ quy hoạch Router 2 cấp phẳng**: Mọi trang giao diện của nhà xe chỉ sử dụng đường dẫn `/company/<feature>`, nghiêm cấm sử dụng router 3 cấp lồng nhau.
2. **Cơ chế Phân lập mã nguồn (Code Isolation)**:
   - Các thành viên chỉ triển khai logic trong thư mục trang và controller đã được phân công riêng.
   - Tuyệt đối không chỉnh sửa các file dùng chung như `App.tsx`, `companyRoutes.tsx`, `CompanyLayout.tsx` hay cấu hình Security Backend mà chưa có sự đồng ý của Team Leader.
3. **Cơ sở dữ liệu thống nhất**: Sử dụng trực tiếp cấu trúc schema đã bổ sung trên Supabase và file `schema.sql` / `init.sql` hiện hành.

---

## ✍️ KÝ PHÊ DUYỆT

**TM. NHÓM 7 (OJT CAPSTONE PROJECT)**  
*Nhóm trưởng & Kiến trúc sư hệ thống*  

*(Đã ký điện tử)*  
**PHẠM CÔNG THÀNH**
