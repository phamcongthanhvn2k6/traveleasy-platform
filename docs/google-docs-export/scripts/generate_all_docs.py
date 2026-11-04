# -*- coding: utf-8 -*-
"""
Full Document Suite Generator for Google Docs Tabs:
1. SRS tham khảo
2. SRS TravelEasy (& alias SRS thunder deli)
3. backlog
4. report sprint 1
5. planning sprint 2
6. report sprint 2 & planning sprint 3
"""

import os
import sys
import shutil
sys.stdout.reconfigure(encoding='utf-8')
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

from build_docs_base import (
    OUTPUT_DIR, COLOR_PRIMARY, COLOR_SECONDARY, COLOR_DARK, COLOR_MUTED,
    HEX_HEADER_BG, HEX_ROW_EVEN, HEX_ROW_ODD,
    set_cell_background, set_cell_margins, style_table,
    create_base_doc, add_heading_1, add_heading_2, add_heading_3,
    add_body, add_callout, add_bullet
)

# ==============================================================================
# 1. GENERATE DOC 1: SRS THAM KHẢO
# ==============================================================================
def generate_doc1():
    print("Generating Doc 1: SRS Tham Khảo...")
    doc = create_base_doc(
        title="TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) — MẪU THAM KHẢO CHUẨN",
        subtitle="Software Requirements Specification (IEEE Std 830-1998 Reference Standard)",
        author="Tài Liệu Mẫu Tham Khảo Dự Án CNTT / OJT Capstone"
    )

    add_callout(
        doc,
        "Đây là tài liệu SRS tham khảo chuẩn cấu trúc IEEE 830 được sử dụng làm chuẩn mực (benchmark) "
        "cho các hệ thống thương mại điện tử, đặt dịch vụ trực tuyến và chuyển đổi số doanh nghiệp. "
        "Tài liệu định nghĩa đầy đủ từ mục tiêu, kiến trúc tổng thể, đặc tả chức năng (FR) đến phi chức năng (NFR).",
        "MỤC ĐÍCH TÀI LIỆU THAM KHẢO"
    )

    add_heading_1(doc, "1. GIỚI THIỆU TỔNG QUAN (INTRODUCTION)")
    add_heading_2(doc, "1.1 Mục đích tài liệu (Purpose)")
    add_body(doc, "Tài liệu Đặc tả Yêu cầu Phần mềm (SRS) này mô tả toàn diện các yêu cầu nghiệp vụ, yêu cầu chức năng, yêu cầu phi chức năng và giao diện hệ thống cho nền tảng trực tuyến. Tài liệu đóng vai trò làm hợp đồng kỹ thuật giữa đội ngũ phân tích nghiệp vụ (BA), nhóm phát triển phần mềm (Dev Team), đội ngũ kiểm thử (QA/QC) và các bên liên quan (Product Owner, Ban Giám hiệu, Doanh nghiệp).")

    add_heading_2(doc, "1.2 Phạm vi sản phẩm (Product Scope)")
    add_body(doc, "Hệ thống cung cấp giải pháp đa nền tảng kết nối 3 đối tượng chính: Khách hàng đầu cuối (End-User), Nhà cung cấp dịch vụ/Đối tác đối ngoại (Merchant/Partner) và Đội ngũ quản trị sàn trung tâm (System Admin). Mục tiêu chính là số hóa quy trình kinh doanh, tối ưu hóa tỷ lệ chuyển đổi, loại trừ sai sót con người và thiết lập kênh thanh toán đối soát tài chính minh bạch.")

    add_heading_2(doc, "1.3 Định nghĩa & Thuật ngữ viết tắt (Definitions & Acronyms)")
    t1 = doc.add_table(rows=6, cols=3)
    t1.columns[0].width = Inches(1.5)
    t1.columns[1].width = Inches(1.8)
    t1.columns[2].width = Inches(3.2)
    headers = ["Thuật ngữ", "Tên tiếng Anh", "Ý nghĩa trong hệ thống"]
    for i, h in enumerate(headers):
        t1.cell(0, i).paragraphs[0].text = h
    
    terms = [
        ("SRS", "Software Requirements Specification", "Tài liệu đặc tả yêu cầu phần mềm chuẩn IEEE 830"),
        ("RBAC", "Role-Based Access Control", "Mô hình kiểm soát truy cập và phân quyền dựa trên vai trò"),
        ("JWT", "JSON Web Token", "Chuẩn mã hóa token xác thực người dùng không trạng thái (stateless)"),
        ("KYB", "Know Your Business", "Quy trình xác minh định danh pháp lý và thẩm định nhà cung cấp đối tác"),
        ("Escrow", "Escrow Account Mechanism", "Cơ chế tài khoản ký quỹ bảo vệ người mua trước khi hoàn tất dịch vụ")
    ]
    for r_idx, (t, en, vi) in enumerate(terms, start=1):
        t1.cell(r_idx, 0).paragraphs[0].text = t
        t1.cell(r_idx, 1).paragraphs[0].text = en
        t1.cell(r_idx, 2).paragraphs[0].text = vi
    style_table(t1)

    add_heading_1(doc, "2. MÔ TẢ TỔNG QUAN HỆ THỐNG (OVERALL DESCRIPTION)")
    add_heading_2(doc, "2.1 Bối cảnh sản phẩm (Product Perspective)")
    add_body(doc, "Hệ thống hoạt động dưới mô hình Web Application hiện đại, áp dụng kiến trúc Modular Monolith hướng Microservices. Phía máy khách sử dụng Single Page Application (SPA), máy chủ Backend cung cấp RESTful APIs chuẩn OpenAPI/Swagger và lưu trữ dữ liệu tập trung trên cơ sở dữ liệu quan hệ (RDBMS) có kiểm soát ACID.")

    add_heading_2(doc, "2.2 Phân loại tác nhân người dùng (User Classes & Characteristics)")
    add_bullet(doc, "Người dùng vãng lai hoặc đã đăng ký, tìm kiếm thông tin dịch vụ, giữ chỗ trực tuyến, thanh toán và gửi đánh giá phản hồi.", "Khách hàng (Customer):")
    add_bullet(doc, "Các đơn vị kinh doanh đã qua thẩm định, quản lý danh mục tài sản, quản lý giá dịch vụ, tiếp nhận đơn đặt và đối soát doanh thu.", "Đối tác cung ứng (Partner/Vendor):")
    add_bullet(doc, "Kiểm duyệt nội dung, quản lý danh mục dùng chung (Master Data), đối soát giao dịch tài chính, cấu hình cổng thanh toán.", "Quản trị viên vận hành (Operational Admin):")
    add_bullet(doc, "Quyền tối cao toàn sàn, phê duyệt bổ nhiệm Admin mới, xem nhật ký kiểm toán hệ thống (Audit Trail), xử lý sự cố khẩn cấp.", "Quản trị viên hệ thống (Root Admin):")

    add_heading_1(doc, "3. YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS - FR)")
    add_body(doc, "Dưới đây là ma trận 10 nhóm yêu cầu chức năng cốt lõi được đặc tả theo cấu trúc chuẩn phân tích nghiệp vụ:")

    t_fr = doc.add_table(rows=11, cols=4)
    t_fr.columns[0].width = Inches(1.0)
    t_fr.columns[1].width = Inches(1.8)
    t_fr.columns[2].width = Inches(1.2)
    t_fr.columns[3].width = Inches(2.5)
    fr_headers = ["Mã FR", "Tên chức năng", "Tác nhân", "Mô tả xử lý cốt lõi"]
    for i, h in enumerate(fr_headers):
        t_fr.cell(0, i).paragraphs[0].text = h

    fr_data = [
        ("FR-01", "Xác thực & Cấp quyền", "All Users", "Đăng ký, Đăng nhập JWT, Quên mật khẩu OTP, Phân quyền RBAC"),
        ("FR-02", "Quản lý Master Data", "Admin", "Quản lý danh mục địa bàn, đơn vị hành chính, mã giảm giá toàn sàn"),
        ("FR-03", "Thẩm định đối tác (KYB)", "Partner / Admin", "Nộp hồ sơ pháp lý, giấy phép kinh doanh, Admin phê duyệt kích hoạt"),
        ("FR-04", "Quản lý tài nguyên đối tác", "Partner", "Khai báo đội ngũ, trang thiết bị, bảng giá và cấu hình phụ thu"),
        ("FR-05", "Điều phối lịch trình dịch vụ", "Partner", "Tạo lịch biểu, tự động sinh slot/chỗ ngồi, kiểm soát mở/đóng bán"),
        ("FR-06", "Tìm kiếm & Đặt chỗ thời gian thực", "Customer", "Tìm kiếm đa tiêu chí, chọn vị trí trực quan, khóa giữ chỗ chống xung đột"),
        ("FR-07", "Cổng thanh toán & Webhook", "Customer / Gateway", "Tích hợp PayOS/VietQR, VNPAY, COD; xử lý Webhook bất đồng bộ"),
        ("FR-08", "Quản lý đơn & Tra cứu PNR", "Customer / Partner", "Tra cứu không cần đăng nhập qua mã đơn/SĐT; gửi vé điện tử"),
        ("FR-09", "Đối soát & Ký quỹ (Escrow)", "Admin / Partner", "Tự động trích hoa hồng sàn, phong tỏa tiền chờ hoàn tất dịch vụ"),
        ("FR-10", "Audit Log & Báo cáo", "Root Admin", "Ghi log mọi thao tác nhạy cảm; biểu đồ doanh thu và tăng trưởng")
    ]
    for r_idx, (m, name, actor, desc) in enumerate(fr_data, start=1):
        t_fr.cell(r_idx, 0).paragraphs[0].text = m
        t_fr.cell(r_idx, 1).paragraphs[0].text = name
        t_fr.cell(r_idx, 2).paragraphs[0].text = actor
        t_fr.cell(r_idx, 3).paragraphs[0].text = desc
    style_table(t_fr)

    add_heading_1(doc, "4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - NFR)")
    add_bullet(doc, "Thời gian phản hồi tìm kiếm < 500ms; xử lý khóa đồng thời < 15ms; đáp ứng tối thiểu 500 concurrent users.", "Hiệu năng (Performance):")
    add_bullet(doc, "Mã hóa mật khẩu bằng BCrypt độ mạnh 10; truyền tải qua HTTPS/TLS 1.3; ngăn chặn SQL Injection, XSS, CSRF.", "Bảo mật (Security):")
    add_bullet(doc, "Tỷ lệ Uptime đạt 99.9%; áp dụng cơ chế Xóa mềm (Soft Delete 100%) để bảo toàn toàn vẹn lịch sử giao dịch.", "Độ tin cậy & Toàn vẹn: ")
    add_bullet(doc, "Thiết kế Responsive Mobile-First, tuân thủ bảng màu chuẩn WCAG, thân thiện và trực quan cho người lớn tuổi.", "Khả năng sử dụng (Usability):")

    add_heading_1(doc, "5. PHỤ LỤC & MA TRẬN TRUY VẾT YÊU CẦU (TRACEABILITY MATRIX)")
    add_body(doc, "Mọi yêu cầu chức năng từ FR-01 đến FR-10 đều được ánh xạ trực tiếp sang Product Backlog dưới dạng User Stories và được kiểm chứng thông qua các kịch bản kiểm thử (Test Cases) tương ứng trong các Sprint.")

    path_docx = os.path.join(OUTPUT_DIR, "01_SRS_tham_khao.docx")
    doc.save(path_docx)
    print(f" Saved: {path_docx}")

# ==============================================================================
# 2. GENERATE DOC 2: SRS TRAVELEASY (& ALIAS SRS THUNDER DELI)
# ==============================================================================
def generate_doc2():
    print("Generating Doc 2: SRS TravelEasy (and alias SRS thunder deli)...")
    doc = create_base_doc(
        title="ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) — HỆ THỐNG TRAVELEASY",
        subtitle="Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh Toàn Quốc (VeXeRe Architecture Clone)",
        author="Nhóm 7 — Dự Án Tốt Nghiệp OJT Capstone"
    )

    add_callout(
        doc,
        "Dự án TravelEasy là nền tảng sàn thương mại điện tử chuyên biệt kết nối hành khách liên tỉnh với các đơn vị nhà xe uy tín toàn quốc. "
        "Hệ thống giải quyết triệt để 3 vấn nạn cốt lõi của ngành vận tải hành khách: (1) Trùng vé, trùng ghế giường nằm dịp cao điểm; "
        "(2) Thất thoát doanh thu vé và khó khăn trong thanh toán số; (3) Thiếu tính minh bạch trong đối soát hoa hồng và bảo vệ quyền lợi người đi xe.",
        "TỔNG QUAN DỰ ÁN NHÓM 7"
    )

    add_heading_1(doc, "1. GIỚI THIỆU & THÔNG TIN DỰ ÁN")
    add_body(doc, "• Tên dự án: Nền Tảng Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy")
    add_body(doc, "• Mã dự án: PRJ-TRAVELEASY-MVP-01")
    add_body(doc, "• Đơn vị thực hiện: Nhóm 7 (Phạm Công Thành, Nguyễn Đại Phát, Trần Đức, Nguyễn Văn A)")
    add_body(doc, "• Tech Stack: Backend Spring Boot 3.2 (Java 17) + Frontend React 18 / TypeScript / Tailwind CSS / Vite + CSDL Supabase PostgreSQL 15 + Docker Compose")

    add_heading_1(doc, "2. KIẾN TRÚC PHÂN HỆ VÀ TÁC NHÂN (ACTORS & SUBSYSTEMS)")
    add_heading_2(doc, "2.1 Ba phân hệ cổng làm việc độc lập")
    add_bullet(doc, "Trang chủ tìm kiếm, tra cứu vé, chọn giường 34 phòng Limousine VIP, thanh toán VietQR PayOS / VNPAY / Tiền mặt khi lên xe (COD), tra cứu vé điện tử.", "1. Cổng Khách Hàng (Customer Portal - /):")
    add_bullet(doc, "Dành riêng cho đối tác vận tải: Quản lý đội xe, tài xế, khai báo tuyến đường, lịch chạy, bảng giá động, giám sát bán vé, phản hồi khiếu nại và rút tiền đối soát.", "2. Cổng Nhà Xe Đối Tác (Company Portal - /company/*):")
    add_bullet(doc, "Dành cho ban quản trị sàn: Quản lý Master Data toàn quốc, thẩm định cấp phép nhà xe (KYB), phê duyệt Admin 2 tầng, quản trị cổng thanh toán, giám sát ký quỹ Escrow và Audit Log.", "3. Cổng Quản Trị Sàn (Admin Portal - /admin/*):")

    add_heading_2(doc, "2.2 Bảng phân quyền Ma trận RACI")
    t_raci = doc.add_table(rows=6, cols=5)
    t_raci.columns[0].width = Inches(2.2)
    t_raci.columns[1].width = Inches(1.1)
    t_raci.columns[2].width = Inches(1.1)
    t_raci.columns[3].width = Inches(1.1)
    t_raci.columns[4].width = Inches(1.0)
    raci_headers = ["Nhóm Nghiệp Vụ", "Khách Hàng", "Nhà Xe", "Sub-Admin", "Root Admin"]
    for i, h in enumerate(raci_headers):
        t_raci.cell(0, i).paragraphs[0].text = h
    
    raci_data = [
        ("Tìm chuyến & Đặt giữ chỗ 10p", "Thực hiện (R)", "Xem (I)", "Giám sát (I)", "Giám sát (I)"),
        ("Quản lý xe, tài xế & chuyến", "Không quyền", "Chịu trách nhiệm (A)", "Hỗ trợ (C)", "Toàn quyền (A)"),
        ("Đăng ký đối tác & Thẩm định KYB", "Không quyền", "Nộp hồ sơ (R)", "Thẩm định (R)", "Phê duyệt cuối (A)"),
        ("Đối soát doanh thu & Ký quỹ", "Không quyền", "Đề nghị rút (R)", "Xác nhận đối soát (R)", "Giải ngân (A)"),
        ("Thêm/Xóa Admin & Audit Log", "Không quyền", "Không quyền", "Đề xuất duyệt", "Phê duyệt độc quyền (A)")
    ]
    for r_idx, (task, c, p, sa, ra) in enumerate(raci_data, start=1):
        t_raci.cell(r_idx, 0).paragraphs[0].text = task
        t_raci.cell(r_idx, 1).paragraphs[0].text = c
        t_raci.cell(r_idx, 2).paragraphs[0].text = p
        t_raci.cell(r_idx, 3).paragraphs[0].text = sa
        t_raci.cell(r_idx, 4).paragraphs[0].text = ra
    style_table(t_raci)

    add_heading_1(doc, "3. CÁC QUY TRÌNH NGHIỆP VỤ CỐT LÕI (CORE WORKFLOWS)")
    add_heading_2(doc, "3.1 Quy trình Đặt vé & Khóa giữ chỗ chống trùng lặp (Pessimistic Locking)")
    add_body(doc, "Khi khách hàng click chọn một giường nằm (ví dụ: Phòng 01 Tầng dưới), hệ thống kích hoạt cơ chế khóa giữ chỗ tạm thời (TEMPORARY_HOLD) trong thời lượng 10 phút. Trong khoảng thời gian này, không có bất kỳ hành khách nào khác có thể chọn hoặc thanh toán vị trí này. Nếu quá 10 phút khách không hoàn tất thanh toán, hệ thống tự động giải phóng chỗ về trạng thái AVAILABLE.")

    add_heading_2(doc, "3.2 Quy trình Thanh toán & Ký quỹ Escrow bảo vệ 2 đầu")
    add_body(doc, "Hỗ trợ 3 phương thức thanh toán chính thức:")
    add_bullet(doc, "Tạo mã QR thanh toán động có nhúng mã đơn vé, xác thực tức thời qua Webhook ngân hàng.", "1. VietQR PayOS:")
    add_bullet(doc, "Chuyển hướng cổng thanh toán quốc gia, bảo mật chuẩn PCI-DSS.", "2. VNPAY Gateway:")
    add_bullet(doc, "Thanh toán trực tiếp bằng tiền mặt tại văn phòng nhà xe hoặc khi lên xe.", "3. Tiền mặt (COD):")
    add_body(doc, "Cơ chế Escrow: Toàn bộ tiền vé thanh toán trực tuyến được sàn TravelEasy tạm giữ an toàn trong tài khoản ký quỹ. Sau khi chuyến xe hoàn tất xuất bến và không có khiếu nại, tiền mới được chuyển sang số dư khả dụng của nhà xe trong kỳ đối soát chu kỳ 15 ngày.")

    add_heading_2(doc, "3.3 Cơ chế Xóa Mềm 100% (Soft Delete Compliance)")
    add_body(doc, "Toàn bộ bảng dữ liệu cốt lõi trên CSDL (users, bus_companies, locations, seat_templates, banners, routes, trips) đều áp dụng cơ chế Soft Delete thông qua cờ is_deleted hoặc deleted_at. Nghiêm cấm hoàn toàn hành vi xóa cứng (Hard Delete / DELETE FROM) trên trang Admin nhằm đảm bảo an toàn tuyệt đối cho hệ thống, chống phá hoại nội bộ và bảo toàn toàn vẹn lịch sử kiểm toán tài chính.")

    add_heading_2(doc, "3.4 Quy trình Phân quyền 2 tầng và Phê duyệt Admin")
    add_body(doc, "Chỉ duy nhất Root System Admin (admin@traveleasy.vn) có quyền thêm mới hoặc bổ nhiệm tài khoản Quản trị viên (ROLE_ADMIN). Các Sub-Admin khi gửi yêu cầu thêm mới Admin sẽ được đưa vào bảng admin_creation_requests ở trạng thái PENDING và phải được Root Admin phê duyệt mới được cấp tài khoản.")

    path_docx1 = os.path.join(OUTPUT_DIR, "02_SRS_TravelEasy.docx")
    path_docx2 = os.path.join(OUTPUT_DIR, "02_SRS_thunder_deli.docx")
    doc.save(path_docx1)
    shutil.copyfile(path_docx1, path_docx2)
    print(f" Saved: {path_docx1}")
    print(f" Saved alias: {path_docx2}")

# ==============================================================================
# 3. GENERATE DOC 3: PRODUCT BACKLOG
# ==============================================================================
def generate_doc3():
    print("Generating Doc 3: Product Backlog...")
    doc = create_base_doc(
        title="PRODUCT BACKLOG CHUẨN AGILE/SCRUM — DỰ ÁN TRAVELEASY",
        subtitle="Danh Mục Yêu Cầu Sản Phẩm Chi Tiết (70 User Stories | 4 Sprints | 290 Story Points)",
        author="Nhóm 7 — Ban Quản Lý Sản Phẩm (Product Management)"
    )

    add_callout(
        doc,
        "Product Backlog được xây dựng tuân thủ chặt chẽ khung làm việc Scrum/Agile. "
        "Mỗi hạng mục (Product Backlog Item - PBI) được mô tả theo chuẩn User Story Format: "
        "'Là một [Vai trò], tôi muốn [Hành động] để [Lợi ích mang lại]', kèm theo Điểm nỗ lực (Story Points theo dãy Fibonacci), "
        "Mức độ ưu tiên MoSCoW (Must, Should, Could, Won't) và Tiêu chí nghiệm thu rõ ràng (Acceptance Criteria).",
        "NGUYÊN TẮC QUẢN TRỊ BACKLOG"
    )

    add_heading_1(doc, "1. TỔNG QUAN ĐỊNH MỨC & PHÂN BỔ 4 SPRINTS")
    t_summary = doc.add_table(rows=6, cols=5)
    t_summary.columns[0].width = Inches(1.2)
    t_summary.columns[1].width = Inches(2.2)
    t_summary.columns[2].width = Inches(1.0)
    t_summary.columns[3].width = Inches(1.0)
    t_summary.columns[4].width = Inches(1.1)
    sum_headers = ["Sprint", "Trọng Tâm Mục Tiêu", "Số User Story", "Story Points", "Trạng Thái"]
    for i, h in enumerate(sum_headers):
        t_summary.cell(0, i).paragraphs[0].text = h
        
    sprint_data = [
        ("Sprint 1", "Kiến trúc nền tảng, CSDL 36 bảng, Auth JWT, Master Data", "15 US", "52 SP", "✅ Hoàn thành (100%)"),
        ("Sprint 2", "Động cơ Đặt vé lõi, Khóa ghế 10p, Thanh toán, Cổng Admin/Company", "18 US", "70 SP", "✅ Nghiệm thu (88.6%)"),
        ("Sprint 3", "Vận hành nhà xe, Báo cáo đối soát, Tra cứu vé, Duyệt Admin", "18 US", "74 SP", " Đang triển khai"),
        ("Sprint 4", "Tối ưu hiệu năng, Đánh giá vi phạm, QA/Testing, Đóng gói OJT", "19 US", "94 SP", "📋 Kế hoạch chuẩn bị"),
        ("TỔNG CỘNG", "Toàn bộ hệ thống TravelEasy hoàn chỉnh đáp ứng sản xuất", "70 US", "290 SP", "Bảo vệ Đồ Án OJT")
    ]
    for r_idx, (sp, focus, count, pts, st) in enumerate(sprint_data, start=1):
        t_summary.cell(r_idx, 0).paragraphs[0].text = sp
        t_summary.cell(r_idx, 1).paragraphs[0].text = focus
        t_summary.cell(r_idx, 2).paragraphs[0].text = count
        t_summary.cell(r_idx, 3).paragraphs[0].text = pts
        t_summary.cell(r_idx, 4).paragraphs[0].text = st
    style_table(t_summary)

    add_heading_1(doc, "2. DANH MỤC CHI TIẾT USER STORIES (PRODUCT BACKLOG ITEMS)")

    add_heading_2(doc, "2.1 Phân hệ Quản trị Sàn (Admin Portal - 18 User Stories)")
    stories_admin = [
        ("US-ADM-01", "Xem Dashboard tổng quan 4 KPI", "Là Quản trị viên, tôi muốn xem doanh thu, hoa hồng sàn, số vé bán và số chuyến chạy theo thời gian thực để nắm bắt bức tranh kinh doanh toàn diện.", "8", "Must Have", "Sprint 1"),
        ("US-ADM-02", "Quản lý danh mục Tỉnh thành & Bến xe (Soft Delete)", "Là Quản trị viên, tôi muốn thêm, sửa, ẩn danh mục địa bàn toàn quốc và áp dụng xóa mềm để bảo vệ dữ liệu lịch sử.", "5", "Must Have", "Sprint 1"),
        ("US-ADM-03", "Quản lý mẫu sơ đồ ghế (Seat Templates)", "Là Quản trị viên, tôi muốn cấu hình sơ đồ mẫu 29 ghế, 34 phòng limousine, 45 ghế để các nhà xe áp dụng nhanh.", "5", "Must Have", "Sprint 1"),
        ("US-ADM-04", "Quản lý người dùng & Phân quyền RBAC", "Là Quản trị viên, tôi muốn quản lý tài khoản, khóa tài khoản, cấp vai trò và áp dụng xóa mềm người dùng.", "5", "Must Have", "Sprint 1"),
        ("US-ADM-05", "Phân quyền 2 tầng & Phê duyệt tạo Admin", "Là Root Admin, tôi muốn duyệt các yêu cầu tạo mới Admin từ Sub-Admin để tránh tạo tài khoản trái phép.", "8", "Must Have", "Sprint 3"),
        ("US-ADM-06", "Thẩm định hồ sơ đối tác nhà xe (KYB)", "Là Quản trị viên, tôi muốn xem giấy phép kinh doanh, hợp đồng của nhà xe để kích hoạt hoặc từ chối hợp tác.", "8", "Must Have", "Sprint 2"),
        ("US-ADM-07", "Cấu hình Cổng thanh toán & Ma trận đối soát", "Là Quản trị viên, tôi muốn bật/tắt PayOS, VNPAY, COD và xem bảng ma trận đối soát tài chính tập trung.", "5", "Must Have", "Sprint 2"),
        ("US-ADM-08", "Quản lý Đối soát & Ký quỹ nhà xe (Settlements)", "Là Quản trị viên, tôi muốn theo dõi kỳ đối soát 15 ngày, xác nhận và duyệt thanh toán số dư ví cho nhà xe.", "8", "Must Have", "Sprint 3"),
        ("US-ADM-09", "Cấu hình chính sách hủy vé & hoàn tiền", "Là Quản trị viên, tôi muốn cài đặt mốc thời gian trước giờ khởi hành và tỷ lệ phần trăm tiền vé được hoàn.", "5", "Should Have", "Sprint 2"),
        ("US-ADM-10", "Kiểm duyệt báo cáo vi phạm & đánh giá xấu", "Là Quản trị viên, tôi muốn nhận diện khiếu nại của khách, ẩn đánh giá bôi nhọ hoặc phạt nhà xe vi phạm.", "5", "Should Have", "Sprint 3")
    ]
    render_story_table(doc, stories_admin)

    add_heading_2(doc, "2.2 Phân hệ Nhà Xe Đối Tác (Company Portal - 16 User Stories)")
    stories_company = [
        ("US-COM-01", "Đăng ký đối tác & Tải hồ sơ pháp lý", "Là chủ nhà xe, tôi muốn đăng ký trực tuyến, nộp giấy phép vận tải và thông tin thuế để gia nhập sàn.", "8", "Must Have", "Sprint 2"),
        ("US-COM-02", "Quản lý danh sách phương tiện & Biển số xe", "Là nhà xe, tôi muốn khai báo xe, biển kiểm soát, loại xe, gán sơ đồ ghế và cập nhật trạng thái bảo dưỡng.", "5", "Must Have", "Sprint 2"),
        ("US-COM-03", "Quản lý thông tin tài xế & Phụ xe", "Là nhà xe, tôi muốn lưu trữ danh bạ lái xe, số bằng lái và phân công cho từng chuyến xe cụ thể.", "5", "Should Have", "Sprint 3"),
        ("US-COM-04", "Thiết lập tuyến đường & Điểm đón/trả với ETA", "Là nhà xe, tôi muốn định nghĩa lộ trình từ A đến B, các trạm đón dọc đường và mốc thời gian dự kiến.", "5", "Must Have", "Sprint 2"),
        ("US-COM-05", "Khởi tạo chuyến xe tự động sinh 34 ghế", "Là nhà xe, tôi muốn mở chuyến xe chạy theo giờ, hệ thống tự động sinh 34 ghế trống theo sơ đồ mẫu.", "8", "Must Have", "Sprint 2"),
        ("US-COM-06", "Xem sơ đồ bán vé & Quản lý đơn vé chuyến", "Là nhà xe, tôi muốn quan sát trực quan trạng thái ghế đã bán, giữ chỗ hoặc còn trống của từng chuyến xe.", "8", "Must Have", "Sprint 2"),
        ("US-COM-07", "Xem báo cáo doanh thu & Yêu cầu rút tiền", "Là nhà xe, tôi muốn theo dõi doanh thu thực nhận sau trừ hoa hồng sàn và gửi lệnh rút tiền về tài khoản ngân hàng.", "8", "Must Have", "Sprint 3")
    ]
    render_story_table(doc, stories_company)

    add_heading_2(doc, "2.3 Phân hệ Khách Hàng (Customer Portal - 20 User Stories)")
    stories_customer = [
        ("US-CUS-01", "Tìm kiếm chuyến xe đa tiêu chí", "Là hành khách, tôi muốn nhập điểm đi, điểm đến, ngày khởi hành để tìm các chuyến xe phù hợp nhất.", "8", "Must Have", "Sprint 2"),
        ("US-CUS-02", "Bộ lọc tìm kiếm nâng cao thời gian thực", "Là hành khách, tôi muốn lọc theo giờ chạy, tầm giá vé, loại xe limousine và nhà xe ưa thích.", "5", "Must Have", "Sprint 2"),
        ("US-CUS-03", "Sơ đồ 34 phòng Limousine VIP 2 tầng", "Là hành khách, tôi muốn nhìn thấy trực quan vị trí giường tầng trên, tầng dưới để tự do lựa chọn.", "8", "Must Have", "Sprint 2"),
        ("US-CUS-04", "Khóa giữ chỗ 10 phút đếm ngược", "Là hành khách, tôi muốn vị trí ghế tôi chọn được giữ độc quyền trong 10 phút để tôi an tâm thanh toán.", "8", "Must Have", "Sprint 2"),
        ("US-CUS-05", "Thanh toán VietQR PayOS quét mã ngân hàng", "Là hành khách, tôi muốn quét mã QR chuyển khoản tự động và nhận xác nhận thanh toán thành công tức thì.", "8", "Must Have", "Sprint 2"),
        ("US-CUS-06", "Thanh toán Cổng VNPAY và COD", "Là hành khách, tôi muốn có thêm tùy chọn thanh toán qua thẻ VNPAY hoặc thanh toán tiền mặt khi lên xe.", "5", "Must Have", "Sprint 2"),
        ("US-CUS-07", "Tra cứu vé điện tử không cần đăng nhập", "Là hành khách, tôi muốn nhập mã vé (PNR) và số điện thoại để xem lại thông tin vé xe bất cứ lúc nào.", "5", "Must Have", "Sprint 2"),
        ("US-CUS-08", "Đánh giá chất lượng chuyến đi kèm số sao", "Là hành khách sau khi hoàn tất chuyến xe, tôi muốn chấm điểm số sao và viết bình luận phản ánh trải nghiệm.", "5", "Should Have", "Sprint 3")
    ]
    render_story_table(doc, stories_customer)

    add_heading_1(doc, "3. TIÊU CHÍ SẴN SÀNG (DoR) & TIÊU CHÍ HOÀN THÀNH (DoD)")
    add_bullet(doc, "User Story phải tuân thủ cấu trúc chuẩn, có Story Points, có Acceptance Criteria rõ ràng và đã được thảo luận trong buổi Sprint Planning.", "Definition of Ready (DoR):")
    add_bullet(doc, "Code được review qua Pull Request, vượt qua unit test, triển khai mượt mà trên môi trường kiểm thử, không còn lỗi nghiêm trọng (Blocker/Critical) và được Product Owner nghiệm thu.", "Definition of Done (DoD):")

    path_docx = os.path.join(OUTPUT_DIR, "03_backlog.docx")
    doc.save(path_docx)
    print(f" Saved: {path_docx}")

def render_story_table(doc, stories):
    table = doc.add_table(rows=len(stories)+1, cols=6)
    table.columns[0].width = Inches(1.1)
    table.columns[1].width = Inches(1.6)
    table.columns[2].width = Inches(2.3)
    table.columns[3].width = Inches(0.5)
    table.columns[4].width = Inches(0.8)
    table.columns[5].width = Inches(0.7)
    headers = ["Mã US", "Tên Tính Năng", "Mô Tả User Story", "SP", "Độ Ưu Tiên", "Sprint"]
    for i, h in enumerate(headers):
        table.cell(0, i).paragraphs[0].text = h
    for r_idx, (code, title, desc, sp, prio, sp_name) in enumerate(stories, start=1):
        table.cell(r_idx, 0).paragraphs[0].text = code
        table.cell(r_idx, 1).paragraphs[0].text = title
        table.cell(r_idx, 2).paragraphs[0].text = desc
        table.cell(r_idx, 3).paragraphs[0].text = sp
        table.cell(r_idx, 4).paragraphs[0].text = prio
        table.cell(r_idx, 5).paragraphs[0].text = sp_name
    style_table(table)

# ==============================================================================
# 4. GENERATE DOC 4: REPORT SPRINT 1
# ==============================================================================
def generate_doc4():
    print("Generating Doc 4: Report Sprint 1...")
    doc = create_base_doc(
        title="BÁO CÁO TỔNG KẾT & NGHIỆM THU SPRINT 1",
        subtitle="Sprint 1 Review, Delivery & Retrospective Report — Nền Tảng Kiến Trúc & Master Data",
        author="Nhóm 7 — Dự Án TravelEasy"
    )

    add_callout(
        doc,
        "Sprint 1 đã kết thúc thành công với 100% mục tiêu đề ra được hoàn thành đúng hạn (52/52 Story Points, 15/15 Tasks). "
        "Hệ thống đã thiết lập hoàn chỉnh kiến trúc Modular Monolith trên Spring Boot 3 và React 18 Vite, "
        "triển khai mô hình CSDL quan hệ 36 bảng trên Supabase PostgreSQL và nạp đầy đủ dữ liệu Master Data toàn quốc.",
        "KẾT QUẢ NGHIỆM THU XUẤT SẮC"
    )

    add_heading_1(doc, "1. THÔNG SỐ VẬN HÀNH SPRINT 1")
    t_info = doc.add_table(rows=6, cols=2)
    t_info.columns[0].width = Inches(2.2)
    t_info.columns[1].width = Inches(4.3)
    info_data = [
        ("Thời gian thực hiện", "2 tuần (Từ Tuần 1 đến hết Tuần 2)"),
        ("Mục tiêu Sprint (Sprint Goal)", "Xây dựng hạ tầng kỹ thuật, mô hình hóa CSDL 36 bảng, phân quyền RBAC JWT và nạp Master Data"),
        ("Tổng số Story Points cam kết", "52 Story Points (15 Tasks)"),
        ("Tổng số Story Points hoàn thành", "52 / 52 Story Points (Đạt 100% kế hoạch)"),
        ("Số task chuyển tiếp (Rollover)", "0 Task (Không phát sinh nợ kỹ thuật)")
    ]
    t_info.cell(0, 0).paragraphs[0].text = "Chỉ Số Đo Lường"
    t_info.cell(0, 1).paragraphs[0].text = "Giá Trị Nghiệm Thu Thực Tế"
    for r_idx, (k, v) in enumerate(info_data, start=1):
        t_info.cell(r_idx, 0).paragraphs[0].text = k
        t_info.cell(r_idx, 1).paragraphs[0].text = v
    style_table(t_info)

    add_heading_1(doc, "2. ĐÓNG GÓP CỦA CÁC THÀNH VIÊN TRONG SPRINT 1")
    t_mem = doc.add_table(rows=5, cols=4)
    t_mem.columns[0].width = Inches(1.8)
    t_mem.columns[1].width = Inches(1.8)
    t_mem.columns[2].width = Inches(1.0)
    t_mem.columns[3].width = Inches(1.9)
    m_headers = ["Thành Viên", "Vai Trò Chuyên Trách", "Story Points", "Kết Quả Đóng Góp Chính"]
    for i, h in enumerate(m_headers):
        t_mem.cell(0, i).paragraphs[0].text = h
    
    m_data = [
        ("Phạm Công Thành", "Team Leader & Architect", "15 SP", "Dựng khung Spring Boot 3, thiết kế CSDL 36 bảng, cấu hình Docker Compose"),
        ("Nguyễn Đại Phát", "Admin Lead & Full-Stack", "14 SP", "Xây dựng UI Admin, danh mục Tỉnh thành, Bến xe, Sơ đồ mẫu ghế master"),
        ("Trần Đức", "Backend Core Developer", "12 SP", "Hiện thực hóa Security Filter JWT, phân quyền RBAC 3 vai trò, Seed Master Data"),
        ("Nguyễn Văn A", "Frontend Developer", "11 SP", "Xây dựng Header/Footer chuẩn VeXeRe, Layout chuẩn SEO, Routing React")
    ]
    for r_idx, (mem, role, sp, res) in enumerate(m_data, start=1):
        t_mem.cell(r_idx, 0).paragraphs[0].text = mem
        t_mem.cell(r_idx, 1).paragraphs[0].text = role
        t_mem.cell(r_idx, 2).paragraphs[0].text = sp
        t_mem.cell(r_idx, 3).paragraphs[0].text = res
    style_table(t_mem)

    add_heading_1(doc, "3. CHI TIẾT CÁC HẠNG MỤC SẢN PHẨM BÀN GIAO (DELIVERABLES)")
    add_bullet(doc, "Mã nguồn Spring Boot 3.2.x được cấu hình chuẩn phân tầng: Controller -> Service -> Repository -> Entity. Bộ lọc JwtAuthenticationFilter xác thực header Bearer Token an toàn.", "1. Module Xác Thực JWT & RBAC:")
    add_bullet(doc, "Tệp tin schema.sql gồm 36 bảng quan hệ có đầy đủ khóa chính UUID/BIGINT, khóa ngoại, chỉ mục hiệu năng (INDEX) và cờ xóa mềm is_deleted.", "2. Cơ Sở Dữ Liệu PostgreSQL:")
    add_bullet(doc, "Giao diện quản lý Tỉnh/Thành phố, Bến xe toàn quốc và Mẫu sơ đồ 34 phòng limousine với đầy đủ tính năng Thêm, Sửa, Lọc, Xóa mềm.", "3. Cổng Quản Trị Danh Mục (Admin):")
    add_bullet(doc, "Tài liệu thiết kế kiến trúc, Class Diagram, ERD và hướng dẫn thiết lập môi trường phát triển (Deployment Guide).", "4. Bộ Tài Liệu Kỹ Thuật:")

    add_heading_1(doc, "4. KỲ HỌP CẢI TIẾN SPRINT (SPRINT RETROSPECTIVE)")
    add_heading_2(doc, "4.1 Những điểm làm tốt (What Went Well)")
    add_bullet(doc, "Tốc độ thiết kế CSDL và khởi tạo dự án rất nhanh chóng, hoàn thành vượt tiến độ 2 ngày so với kế hoạch ban đầu.")
    add_bullet(doc, "Sự phối hợp chặt chẽ giữa Backend và Frontend thông qua tài liệu quy chuẩn API chung.")

    add_heading_2(doc, "4.2 Những điểm cần cải thiện (What Could Be Improved)")
    add_bullet(doc, "Một số bảng dữ liệu ban đầu thiếu chỉ mục (index) dẫn đến câu truy vấn tìm kiếm còn chậm, đã được bổ sung kịp thời.")
    add_bullet(doc, "Cần tăng cường viết Unit Test tự động cho các hàm xử lý logic đặt chỗ trong Sprint tiếp theo.")

    path_docx = os.path.join(OUTPUT_DIR, "04_report_sprint_1.docx")
    doc.save(path_docx)
    print(f" Saved: {path_docx}")

# ==============================================================================
# 5. GENERATE DOC 5: PLANNING SPRINT 2
# ==============================================================================
def generate_doc5():
    print("Generating Doc 5: Planning Sprint 2...")
    doc = create_base_doc(
        title="KẾ HOẠCH THỰC HIỆN SPRINT 2 (SPRINT 2 PLANNING)",
        subtitle="Sprint 2 Scope, Breakdown, Resource Allocation & Risk Management Plan",
        author="Nhóm 7 — Dự Án TravelEasy"
    )

    add_callout(
        doc,
        "Sprint 2 là giai đoạn bản lề quyết định thành bại của toàn bộ dự án TravelEasy. "
        "Trọng tâm của Sprint 2 là xây dựng hoàn chỉnh Động cơ Đặt vé lõi (Core Booking Engine), "
        "Sơ đồ chọn vị trí giường nằm 34 phòng Limousine VIP, thuật toán khóa giữ chỗ độc quyền 10 phút chống xung đột ghế, "
        "tích hợp Cổng thanh toán VietQR PayOS / VNPAY và ra mắt phiên bản đầu tiên của 2 cổng quản trị (/company và /admin).",
        "MỤC TIÊU SPRINT 2 (SPRINT GOAL)"
    )

    add_heading_1(doc, "1. QUY MÔ & PHÂN BỔ TÀI NGUYÊN SPRINT 2")
    add_body(doc, "• Thời gian thực hiện: 2 tuần (Từ Tuần 3 đến hết Tuần 4)")
    add_body(doc, "• Tổng Story Points dự kiến: 70 Story Points (18 Tasks chi tiết)")
    add_body(doc, "• Velocity mục tiêu của đội ngũ: 70 SP (Tăng 34.6% so với Sprint 1 nhờ nền tảng hạ tầng đã ổn định)")

    add_heading_1(doc, "2. BẢNG PHÂN BỔ CHI TIẾT SPRINT 2 BACKLOG")
    t_tasks = doc.add_table(rows=19, cols=5)
    t_tasks.columns[0].width = Inches(1.0)
    t_tasks.columns[1].width = Inches(2.3)
    t_tasks.columns[2].width = Inches(1.4)
    t_tasks.columns[3].width = Inches(0.6)
    t_tasks.columns[4].width = Inches(1.2)
    task_headers = ["Mã Task", "Nội Dung Công Việc", "Phụ Trách", "SP", "Tiêu Chí Nghiệm Thu"]
    for i, h in enumerate(task_headers):
        t_tasks.cell(0, i).paragraphs[0].text = h

    tasks_data = [
        ("SP2-01", "API Tìm kiếm chuyến xe & Bộ lọc", "Phạm Công Thành", "5", "Lọc theo giá, giờ, nhà xe < 300ms"),
        ("SP2-02", "Sơ đồ 34 phòng Limousine VIP 2 tầng", "Nguyễn Đại Phát", "5", "Hiển thị đúng tầng trên/dưới, trạng thái"),
        ("SP2-03", "Thuật toán khóa giữ chỗ 10p (Pessimistic)", "Phạm Công Thành", "8", "Không xảy ra double booking khi 2 user chọn"),
        ("SP2-04", "Tích hợp Cổng PayOS VietQR 24/7", "Trần Đức", "5", "Sinh mã QR động, Webhook xác nhận tức thì"),
        ("SP2-05", "Tích hợp Cổng thanh toán VNPAY Sandbox", "Trần Đức", "5", "Chuyển hướng cổng, tính checksum chuẩn"),
        ("SP2-06", "Trang Checkout & Thu thập thông tin khách", "Nguyễn Văn A", "3", "Validate SĐT, email, điểm đón/trả"),
        ("SP2-07", "Trang Tra cứu vé qua mã PNR & SĐT", "Nguyễn Văn A", "3", "Hiển thị chi tiết vé, mã QR vé điện tử"),
        ("SP2-08", "Cổng Nhà Xe: Đăng nhập & Đổi mật khẩu", "Nguyễn Đại Phát", "3", "Chỉ role COMPANY mới vào được /company"),
        ("SP2-09", "Cổng Nhà Xe: Quản lý phương tiện & Xe", "Nguyễn Đại Phát", "5", "Thêm, sửa, gán sơ đồ ghế cho từng xe"),
        ("SP2-10", "Cổng Nhà Xe: Quản lý tuyến đường & ETA", "Nguyễn Đại Phát", "5", "Định nghĩa điểm đón/trả và mốc giờ"),
        ("SP2-11", "Cổng Nhà Xe: Tạo chuyến tự động sinh 34 ghế", "Phạm Công Thành", "5", "Chọn xe, chọn tuyến -> sinh ghế chuyến"),
        ("SP2-12", "Cổng Nhà Xe: Sơ đồ theo dõi bán vé chuyến", "Nguyễn Văn A", "3", "Xem trực quan các ghế đã thanh toán"),
        ("SP2-13", "Cổng Admin: Quản lý nhà xe & Duyệt KYB", "Nguyễn Đại Phát", "5", "Kích hoạt hoặc đình chỉ hoạt động nhà xe"),
        ("SP2-14", "Cổng Admin: Cấu hình cổng thanh toán", "Trần Đức", "3", "Bật tắt PayOS, VNPAY, COD toàn sàn"),
        ("SP2-15", "Cổng Admin: Quản lý chính sách hủy vé", "Trần Đức", "3", "Cài đặt mốc giờ và % hoàn tiền"),
        ("SP2-16", "Cơ chế Xóa Mềm 100% trang Admin", "Nguyễn Đại Phát", "2", "Không hard delete ở bất kỳ bảng nào"),
        ("SP2-17", "Đăng ký đối tác trực tuyến (KYB)", "Trần Đức", "5", "Form nộp hồ sơ nhà xe (Rollover SP3)"),
        ("SP2-18", "Đăng nhập Google OAuth2 mạng xã hội", "Phạm Công Thành", "3", "Nút Login Google (Rollover SP3)")
    ]
    for r_idx, (tid, name, owner, sp, ac) in enumerate(tasks_data, start=1):
        t_tasks.cell(r_idx, 0).paragraphs[0].text = tid
        t_tasks.cell(r_idx, 1).paragraphs[0].text = name
        t_tasks.cell(r_idx, 2).paragraphs[0].text = owner
        t_tasks.cell(r_idx, 3).paragraphs[0].text = sp
        t_tasks.cell(r_idx, 4).paragraphs[0].text = ac
    style_table(t_tasks)

    add_heading_1(doc, "3. MA TRẬN QUẢN TRỊ RỦI RO SPRINT 2 (RISK MANAGEMENT)")
    add_bullet(doc, "Nhiều người dùng cùng bấm chọn 1 phòng VIP vào cùng một phần nghìn giây. -> Giải pháp: Áp dụng cơ chế Pessimistic Locking (@Lock(LockModeType.PESSIMISTIC_WRITE)) tại tầng CSDL và kiểm tra trạng thái vé trước khi xác nhận giữ chỗ.", "Rủi ro 1 - Tranh chấp giữ chỗ (Double Booking):")
    add_bullet(doc, "Mạng viễn thông trễ khiến Webhook PayOS/VNPAY đến sau khi hết hạn 10 phút. -> Giải pháp: Thiết lập cơ chế Polling song song từ Frontend và nới lỏng thời gian ân hạn thêm 2 phút trước khi hủy đơn hàng.", "Rủi ro 2 - Độ trễ Webhook ngân hàng:")
    add_bullet(doc, "Khối lượng công việc lớn (70 SP) vượt ngưỡng 18 task. -> Giải pháp: Ưu tiên tuyệt đối 16 task cốt lõi phục vụ luồng đặt vé và quản trị, chủ động chuyển tiếp 2 task tiện ích mở rộng (KYB form và Google Login) sang Sprint 3 nếu gặp cản trở về thời gian.", "Rủi ro 3 - Áp lực tiến độ Sprint:")

    path_docx = os.path.join(OUTPUT_DIR, "05_planning_sprint_2.docx")
    doc.save(path_docx)
    print(f" Saved: {path_docx}")

# ==============================================================================
# 6. GENERATE DOC 6: REPORT SPRINT 2 & PLANNING SPRINT 3
# ==============================================================================
def generate_doc6():
    print("Generating Doc 6: Report Sprint 2 & Planning Sprint 3...")
    doc = create_base_doc(
        title="BÁO CÁO TỔNG KẾT SPRINT 2 & KẾ HOẠCH SPRINT 3",
        subtitle="Sprint 2 Acceptance Review (62/70 SP - 88.6%) & Sprint 3 Planning (74 SP)",
        author="Nhóm 7 — Dự Án TravelEasy"
    )

    add_callout(
        doc,
        "Sprint 2 đã nghiệm thu xuất sắc 16/18 Tasks, đạt 62/70 Story Points (88.6% kế hoạch). "
        "Toàn bộ luồng nghiệp vụ kinh doanh cốt lõi (Core Booking Flow) và 2 Cổng quản trị (/company và /admin) "
        "đã vận hành trơn tru và hoàn tất tích hợp cổng thanh toán trực tuyến. "
        "2 Task còn lại (8 SP) được chủ động rollover sang Sprint 3 cùng với các tính năng đối soát tài chính nâng cao.",
        "KẾT QUẢ NGHIỆM THU SPRINT 2"
    )

    add_heading_1(doc, "1. TỔNG KẾT ĐÁNH GIÁ SPRINT 2")
    add_bullet(doc, "Hoàn thành 62 / 70 Story Points cam kết (Tỷ lệ đạt 88.6%). Tỷ lệ hoàn thành thực tế nằm trong biên độ kiểm soát an toàn của phương pháp luận Agile.")
    add_bullet(doc, "Toàn bộ 100% các chức năng Admin đã được chuyển đổi thành công từ Xóa cứng sang Xóa mềm (Soft Delete).")
    add_bullet(doc, "Hệ thống thanh toán đã tích hợp hoàn hảo VietQR PayOS, VNPAY Sandbox và COD, dọn dẹp các cổng lỗi thời.")

    add_heading_1(doc, "2. KẾ HOẠCH SPRINT 3 — ĐỐI SOÁT TÀI CHÍNH & VẬN HÀNH TOÀN DIỆN")
    add_body(doc, "• Thời gian thực hiện: 2 tuần (Tuần 5 - Tuần 6)")
    add_body(doc, "• Quy mô cam kết: 74 Story Points (Gồm 8 SP tồn đọng từ Sprint 2 + 66 SP tính năng mới)")
    add_body(doc, "• 5 Trọng tâm lớn của Sprint 3:")
    add_bullet(doc, "Chu kỳ 15 ngày, tự động trích hoa hồng sàn, tài khoản ký quỹ Escrow và lệnh giải ngân ví nhà xe.", "1. Module Đối soát Tài chính (/admin/settlements):")
    add_bullet(doc, "Tiếp nhận khiếu nại của khách, kiểm duyệt đánh giá tiêu cực và xử lý tranh chấp vé.", "2. Kiểm duyệt Báo cáo Vi phạm (/admin/review-reports):")
    add_bullet(doc, "Hệ thống phê duyệt 2 tầng bảo vệ hệ thống trước hành vi tạo admin trái phép.", "3. Phân quyền Duyệt Admin (/admin/users):")
    add_bullet(doc, "Cổng đăng ký dành riêng cho nhà xe mới gia nhập sàn với form xác thực giấy phép kinh doanh.", "4. Cổng Đăng Ký Đối Tác (KYB Registration):")
    add_bullet(doc, "Đăng nhập nhanh một chạm bằng tài khoản Google cá nhân.", "5. Tích hợp Google OAuth2:")

    path_docx = os.path.join(OUTPUT_DIR, "06_report_sprint_2_planning_sprint_3.docx")
    doc.save(path_docx)
    print(f" Saved: {path_docx}")

# ==============================================================================
# MAIN RUNNER
# ==============================================================================
if __name__ == "__main__":
    generate_doc1()
    generate_doc2()
    generate_doc3()
    generate_doc4()
    generate_doc5()
    generate_doc6()
    print("\n All documents generated successfully in docs/google-docs-export/")
