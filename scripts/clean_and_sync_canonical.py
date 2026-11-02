#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TRAVELEASY PLATFORM - CLEAN & SYNCHRONIZE TRELLO BOARD TO LATEST CODE
1. Xóa bỏ toàn bộ icon / emoji thừa thãi ở tiêu đề danh sách và thẻ.
2. Đồng bộ 100% tiêu đề, Story Points, mô tả và checklist theo đúng đặc tả mã nguồn mới nhất (README Section 2.6).
3. Đảm bảo phân bổ chính xác vào 4 Sprint và Product Backlog.
"""

import sys
import json
import time
import urllib.request
import urllib.parse

API_KEY = "3305b670e2ea6167c586ce2516d87ebd"
API_TOKEN = "ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D"
BOARD_ID = "6ad6f486572cd6662754e074"
BOARD_SHORT_URL = "https://trello.com/b/AA5BYoe1"

BASE_URL = "https://api.trello.com/1"

def trello_req(endpoint, method="GET", data=None, params=None):
    if params is None:
        params = {}
    params["key"] = API_KEY
    params["token"] = API_TOKEN
    query = urllib.parse.urlencode(params)
    url = f"{BASE_URL}/{endpoint}?{query}"
    
    headers = {"Accept": "application/json"}
    body = None
    if data is not None:
        headers["Content-Type"] = "application/json; charset=utf-8"
        body = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    time.sleep(0.12)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            if content:
                return json.loads(content)
            return {}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"[!] HTTP Error {e.code} on {method} {endpoint}: {err_msg}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"[!] Error on {method} {endpoint}: {e}", file=sys.stderr)
        return None

# Canonical definition of 17 User Stories from latest README.md Section 2.6
CANONICAL_CARDS = {
    "US-01": {
        "title": "(8) US-01: Là một Quản trị viên, tôi muốn xem Dashboard 4 chỉ số KPI và bảng điều phối để nắm bắt tức thời tình hình vận hành của hệ thống",
        "points": 8,
        "sprint": "Sprint 4",
        "member_username": "phatnguyn146",
        "list_key": "sprint_4",
        "desc": """**MÔ TẢ NGHIỆP VỤ (US-01 - ADMIN PORTAL)**:
- **Backend**: `GET /api/v1/admin/dashboard/stats` (Tính tổng chuyến xe, chuyến đang mở bán, tổng đơn đặt và doanh thu thực nhận).
- **Frontend**: `AdminDashboardPage.tsx` (Dựng 4 thẻ KPI số liệu trực quan và lưới 6 Card điều phối chức năng).
- **Phụ trách**: Nguyễn Đại Phát (Admin Lead).
- **Trạng thái**: Hoàn thành & Nghiệm thu 100% Pass.""",
        "be_checklist": [
            "Viết Service truy vấn tổng hợp doanh thu và số lượng chuyến",
            "Tạo DTO DashboardStatsResponse",
            "Tối ưu truy vấn SQL Dashboard dưới 50ms"
        ],
        "fe_checklist": [
            "Dựng 4 thẻ KPI Card hiển thị số liệu trực quan",
            "Dựng lưới 6 Card chức năng có nút chuyển trang nhanh",
            "Tích hợp tự động đồng bộ số liệu qua Axios service"
        ]
    },
    "US-02": {
        "title": "(8) US-02: Là một Quản trị viên, tôi muốn giám sát và điều phối 480 chuyến xe toàn sàn, đổi trạng thái xuất bến/hủy chuyến để vận hành lịch trình xe chạy",
        "points": 8,
        "sprint": "Sprint 2",
        "member_username": "phatnguyn146",
        "list_key": "sprint_2",
        "desc": """**MÔ TẢ NGHIỆP VỤ (US-02 - ADMIN TRIPS)**:
- **Backend**: `POST /api/v1/admin/trips` & `PATCH /api/v1/admin/trips/{id}/status`.
- **Frontend**: `AdminTripsPage.tsx` (Bảng danh sách 480 chuyến xe và Form modal tạo chuyến).
- **Phụ trách**: Nguyễn Đại Phát (Admin Lead).
- **Trạng thái**: Hoàn thành & Nghiệm thu 100% Pass.""",
        "be_checklist": [
            "Thuật toán tự động sinh 34 ghế (17 ghế tầng 1 A01-A17, 17 ghế tầng 2 B01-B17)",
            "Logic chuyển trạng thái: SCHEDULED -> DEPARTED -> COMPLETED -> CANCELLED",
            "Xử lý hủy chuyến và thông báo cho hành khách"
        ],
        "fe_checklist": [
            "Form Popup tạo chuyến mới có validation giờ chạy",
            "Bảng hiển thị danh sách chuyến kèm nút đổi trạng thái trực tiếp",
            "Bộ lọc tìm chuyến theo ngày đi và nhà xe"
        ]
    },
    "US-03": {
        "title": "(5) US-03: Là một Quản trị viên, tôi muốn quản lý danh mục nhà xe đối tác và phê duyệt hồ sơ xe để kiểm soát đội xe trên hệ thống",
        "points": 5,
        "sprint": "Sprint 1",
        "member_username": "phatnguyn146",
        "list_key": "sprint_1",
        "desc": """**MÔ TẢ NGHIỆP VỤ (US-03 - FLEET & PARTNERS)**:
- **Backend**: `GET/POST /api/v1/admin/companies` & `/api/v1/admin/vehicles`.
- **Frontend**: `AdminFleetPage.tsx` (Card danh thiếp nhà xe và bảng quản lý biển số xe).
- **Phụ trách**: Nguyễn Đại Phát (Admin Lead).
- **Trạng thái**: Hoàn thành & Nghiệm thu 100% Pass.""",
        "be_checklist": [
            "Viết CRUD BusCompanyRepository & VehicleRepository",
            "Xử lý ràng buộc một nhà xe sở hữu nhiều phương tiện",
            "Validate định dạng biển số xe và hotline nhà xe"
        ],
        "fe_checklist": [
            "Dựng giao diện thẻ thông tin nhà xe (Hotline, địa chỉ, rating)",
            "Bảng quản lý phương tiện (Biển số xe, loại xe Limousine 34 phòng)",
            "Modal thêm mới và cập nhật thông tin đối tác"
        ]
    },
    "US-04": {
        "title": "(5) US-04: Là một Quản trị viên, tôi muốn quản lý các tuyến đường 25+ chặng trọng điểm kèm mốc giờ ETA để tối ưu lộ trình xe di chuyển",
        "points": 5,
        "sprint": "Sprint 1",
        "member_username": "phatnguyn146",
        "list_key": "sprint_1",
        "desc": """**MÔ TẢ NGHIỆP VỤ (US-04 - ROUTES & STOPS)**:
- **Backend**: `GET/POST /api/v1/admin/routes` & `/api/v1/admin/routes/{id}/stops`.
- **Frontend**: `AdminRoutesPage.tsx` (Bảng lộ trình liên tỉnh và sơ đồ trạm đón/trả).
- **Phụ trách**: Nguyễn Đại Phát (Admin Lead).
- **Trạng thái**: Hoàn thành & Nghiệm thu 100% Pass.""",
        "be_checklist": [
            "Viết CRUD Route và danh sách điểm dừng kèm mốc giờ ETA Offset",
            "Validation khoảng cách km và thứ tự trạm dừng",
            "API cập nhật điểm dừng trung gian"
        ],
        "fe_checklist": [
            "Bảng danh sách tuyến xe liên tỉnh (Điểm đi - Điểm đến)",
            "Card danh sách trạm đón/trả dọc đường kèm khoảng cách km",
            "Modal cấu hình thứ tự trạm đón trả"
        ]
    },
    "US-05": {
        "title": "(5) US-05: Là một Quản trị viên, tôi muốn cấu hình bảng quy tắc hoàn tiền hủy vé sàn và tạo kỳ quyết toán tài chính để tự động hóa dòng tiền",
        "points": 5,
        "sprint": "Sprint 4",
        "member_username": "phatnguyn146",
        "list_key": "sprint_4",
        "desc": """**MÔ TẢ NGHIỆP VỤ (US-05 - POLICIES & SETTLEMENTS)**:
- **Backend**: Bảng `cancellation_policy_rules` (>24h hoàn 90%, 12-24h hoàn 70%, <12h không hoàn) & `settlements` (khấu trừ hoa hồng 10%).
- **Frontend**: `AdminPoliciesPage.tsx` & `AdminSettlementsPage.tsx`.
- **Phụ trách**: Nguyễn Đại Phát (Admin Lead).
- **Trạng thái**: Hoàn thành & Nghiệm thu 100% Pass.""",
        "be_checklist": [
            "Entity CancellationPolicyRule và logic tính phần trăm tiền hoàn tự động",
            "API tính toán kỳ quyết toán doanh thu khấu trừ 10% hoa hồng sàn",
            "Xử lý cập nhật trạng thái thanh toán quyết toán cho nhà xe"
        ],
        "fe_checklist": [
            "Bảng trực quan hóa các mốc giờ hủy vé và tỷ lệ hoàn",
            "Trang Admin Settlements quản lý đối soát và xuất file báo cáo",
            "Modal tạo kỳ quyết toán tài chính định kỳ"
        ]
    },
    "US-06": {
        "title": "(5) US-06: Là một Quản trị viên, tôi muốn quản lý danh sách người dùng và phân quyền RBAC an toàn bằng JWT, có cơ chế chống xóa Admin tối cao",
        "points": 5,
        "sprint": "Sprint 1",
        "member_username": "phatnguyn146",
        "list_key": "sprint_1",
        "desc": """**MÔ TẢ NGHIỆP VỤ (US-06 - SECURITY & RBAC)**:
- **Backend**: Spring Security JWT, 3 vai trò cố định (`ADMIN`, `OPERATOR`, `CUSTOMER`), mã hóa BCrypt, cơ chế chống xóa Admin tối cao.
- **Frontend**: `AdminUsersPage.tsx` (Bảng danh sách tài khoản kèm Badge màu phân quyền).
- **Phụ trách**: Nguyễn Đại Phát (Admin Lead).
- **Trạng thái**: Hoàn thành & Nghiệm thu 100% Pass.""",
        "be_checklist": [
            "Cấu hình SecurityConfig và JWT Authentication Filter",
            "API GET/POST/PATCH /api/v1/admin/users",
            "Cơ chế bảo vệ chống xóa hoặc khóa tài khoản Super Admin"
        ],
        "fe_checklist": [
            "Bảng danh sách người dùng phân trang và lọc theo vai trò",
            "Badge màu hiển thị vai trò (Admin đỏ, Operator xanh, Customer vàng)",
            "Nút khóa/mở khóa tài khoản an toàn kèm hộp thoại xác nhận"
        ]
    },
    "US-07": {
        "title": "(5) US-07: Là một Quản trị viên, tôi muốn theo dõi nhật ký audit log bất biến để đảm bảo an toàn bảo mật và kiểm tra lịch sử thao tác toàn sàn",
        "points": 5,
        "sprint": "Sprint 4",
        "member_username": "phatnguyn146",
        "list_key": "sprint_4",
        "desc": """**MÔ TẢ NGHIỆP VỤ (US-07 - AUDIT LOGS)**:
- **Backend**: Bảng `audit_logs` (nguyên tắc Append-Only, lưu snapshot JSONB trước/sau thao tác, IP, thời gian ISO).
- **Frontend**: `AdminAuditLogsPage.tsx` (Bảng vết kiểm toán, timeline chi tiết).
- **Phụ trách**: Nguyễn Đại Phát (Admin Lead).
- **Trạng thái**: Hoàn thành & Nghiệm thu 100% Pass.""",
        "be_checklist": [
            "Entity AuditLog Append-Only (không có API Update hoặc Delete)",
            "AOP Interceptor tự động ghi vết mọi hành vi thêm sửa xóa",
            "API phân trang và lọc Audit Log theo người dùng và mốc thời gian"
        ],
        "fe_checklist": [
            "Bảng Audit Logs có badge hành động (CREATE, UPDATE, DELETE)",
            "Modal xem chi tiết snapshot dữ liệu trước và sau thao tác",
            "Bộ lọc tìm kiếm nhật ký theo địa chỉ IP và mã người dùng"
        ]
    },
    "US-08": {
        "title": "(8) US-08: Là một Khách hàng, tôi muốn tìm kiếm chuyến xe kết hợp bộ lọc nâng cao thời gian thực và xem sơ đồ 2 tầng 34 chỗ Limousine VIP",
        "points": 8,
        "sprint": "Sprint 2",
        "member_username": "phmthanhphong17",
        "list_key": "sprint_2",
        "desc": """**MÔ TẢ NGHIỆP VỤ (US-08 - CORE BOOKING)**:
- **Backend**: `GET /api/v1/trips/search` (Spring Data JPA Specification + Spring Cache SWR 0ms) & `GET /api/v1/trips/{id}/seats`.
- **Frontend**: `SearchPage.tsx` & `BusSeatMap.tsx` (Lọc đa tiêu chí + Sơ đồ 34 giường nằm Limousine 2 tầng).
- **Phụ trách**: Trần Nam Phong (Core Booking & Concurrency Engine).
- **Trạng thái**: Hoàn thành & Nghiệm thu 100% Pass.""",
        "be_checklist": [
            "Tối ưu truy vấn tìm chuyến xe dưới 100ms bằng Spring Cache",
            "API trả về 34 ghế phân tầng (Tầng 1 A01-A17, Tầng 2 B01-B17)",
            "Giải quyết triệt để lỗi N+1 Query bằng batch fetching điểm đón trả"
        ],
        "fe_checklist": [
            "Bộ lọc thông minh (Khoảng giá, Giờ xuất bến, Hãng xe, Đánh giá)",
            "Sơ đồ 34 ghế Limousine 2 tầng trực quan 3 mã màu",
            "Cơ chế chọn/bỏ chọn tối đa 4 ghế và tính tổng tiền tức thời"
        ]
    },
    "US-09": {
        "title": "(8) US-09: Là một Khách hàng, tôi muốn hệ thống giữ chỗ độc quyền trong 10 phút có đồng hồ đếm ngược bằng Pessimistic Lock chống cướp vé",
        "points": 8,
        "sprint": "Sprint 2",
        "member_username": "phmthanhphong17",
        "list_key": "sprint_2",
        "desc": """**MÔ TẢ NGHIỆP VỤ (US-09 - CONCURRENCY LOCK 10:00)**:
- **Backend**: `POST /api/v1/seats/lock` (Pessimistic Lock `@Lock(LockModeType.PESSIMISTIC_WRITE)`, TTL = 600s, tự động giải phóng ghế khi hết hạn).
- **Frontend**: `SeatLockStatusPage.tsx` (Đồng hồ đếm lùi 10:00, cảnh báo nhấp nháy đỏ khi còn dưới 2 phút).
- **Phụ trách**: Trần Nam Phong (Core Booking & Concurrency Engine).
- **Trạng thái**: Hoàn thành & Nghiệm thu 100% Pass.""",
        "be_checklist": [
            "Khóa hàng độc quyền bằng Pessimistic Write Lock (SELECT FOR UPDATE)",
            "Cơ chế kiểm tra và giải phóng ghế tự động sau 10 phút",
            "Kiểm thử Concurrency 50 luồng đồng thời không xảy ra Double-Booking"
        ],
        "fe_checklist": [
            "Widget đồng hồ đếm ngược 10:00 thời gian thực",
            "Cảnh báo đỏ nhấp nháy khi thời gian giữ chỗ còn dưới 2:00",
            "Thông báo hủy giữ chỗ và tự động chuyển hướng khi hết giờ"
        ]
    },
    "US-10": {
        "title": "(8) US-10: Là một Khách hàng, tôi muốn xác nhận đặt vé, chọn điểm đón/trả và thanh toán đa kênh an toàn (VietQR, VNPAY, COD) qua giao dịch Serializable",
        "points": 8,
        "sprint": "Sprint 3",
        "member_username": "phmthanhphong17",
        "list_key": "sprint_3",
        "desc": """**MÔ TẢ NGHIỆP VỤ (US-10 - CHECKOUT & MULTI-GATEWAY)**:
- **Backend**: `POST /api/v1/bookings` & `POST /api/v1/payments/create` (`@Transactional(isolation = Isolation.SERIALIZABLE)`, sinh mã `BK-*`, tích hợp PayOS VietQR, VNPAY Sandbox, COD).
- **Frontend**: `BookingCheckoutPage.tsx` (Chọn trạm đón/trả theo giờ, form khách, chọn cổng thanh toán).
- **Phụ trách**: Trần Nam Phong (Core Booking & Concurrency Engine).
- **Trạng thái**: Hoàn thành & Nghiệm thu 100% Pass.""",
        "be_checklist": [
            "Xử lý giao dịch an toàn cấp cao nhất Isolation.SERIALIZABLE",
            "Tích hợp cổng PayOS tạo mã VietQR MB Bank kèm chữ ký HMAC-SHA256",
            "Cổng VNPAY QR Sandbox và phương thức thanh toán tiền mặt COD"
        ],
        "fe_checklist": [
            "Form chọn điểm đón và điểm trả chi tiết theo giờ xe chạy",
            "Modal thanh toán quét mã VietQR tự động cập nhật trạng thái",
            "Nút Xác nhận chuyển khoản Demo 1-click phục vụ kiểm thử"
        ]
    },
    "US-11": {
        "title": "(5) US-11: Là một Kỹ sư hệ thống, tôi muốn quản lý danh mục bến xe toàn quốc, hạng ghế phụ thu và mẫu sơ đồ xe 34 chỗ để cấu hình dữ liệu xe",
        "points": 5,
        "sprint": "Sprint 1",
        "member_username": "phmthanhphong17",
        "list_key": "sprint_1",
        "desc": """**MÔ TẢ NGHIỆP VỤ (US-11 - MASTER DATA LOCATIONS & SEATS)**:
- **Backend**: `GET/POST /api/v1/admin/locations`, `/api/v1/admin/seat-types`, `/api/v1/admin/seat-templates`.
- **Frontend**: `AdminLocationsPage.tsx`, `AdminSeatTypesPage.tsx`, `AdminSeatTemplatesPage.tsx`.
- **Phụ trách**: Trần Nam Phong (Core Booking & Concurrency Engine).
- **Trạng thái**: Hoàn thành & Nghiệm thu 100% Pass.""",
        "be_checklist": [
            "Quản lý danh mục bến xe toàn quốc (Miền Đông, Miền Tây, Mỹ Đình)",
            "Cấu hình đơn giá phụ thu cho hạng ghế VIP và Limousine",
            "Quản lý mẫu sơ đồ xe 34 chỗ và Limousine 22 phòng"
        ],
        "fe_checklist": [
            "Giao diện quản lý danh mục bến xe và trạm trung chuyển",
            "Bảng cấu hình mức phụ thu theo hạng ghế",
            "Trình trực quan hóa mẫu sơ đồ ghế trước khi áp dụng cho chuyến"
        ]
    },
    "US-12": {
        "title": "(5) US-12: Là một Khách hàng, tôi muốn xem lịch sử vé đã mua và thực hiện hủy vé online nhận hoàn tiền tự động theo chính sách giờ chạy",
        "points": 5,
        "sprint": "Sprint 3",
        "member_username": "minhdctrn13",
        "list_key": "sprint_3",
        "desc": """**MÔ TẢ NGHIỆP VỤ (US-12 - MY TICKETS & AUTO REFUND)**:
- **Backend**: `GET /api/v1/bookings/my-bookings` & `POST /api/v1/bookings/{id}/cancel` (Thuật toán tính hoàn tiền theo giờ khởi hành).
- **Frontend**: `MyTicketsPage.tsx` (Danh sách vé, badge trạng thái, hộp thoại xác nhận hủy vé hiển thị số tiền hoàn).
- **Phụ trách**: Trần Hữu Đức (Customer & Tickets).
- **Trạng thái**: Hoàn thành & Nghiệm thu 100% Pass.""",
        "be_checklist": [
            "API lấy danh sách vé của người dùng đã xác thực JWT",
            "Thuật toán tính phần trăm hoàn tiền tự động (>24h 90%, 12-24h 70%, <12h 0%)",
            "Cập nhật trạng thái vé sang CANCELLED và nhả ghế về AVAILABLE"
        ],
        "fe_checklist": [
            "Trang Vé của tôi hiển thị danh sách vé đã mua và lịch sử chuyến đi",
            "Modal xác nhận hủy vé tính toán số tiền hoàn trước khi hủy",
            "Badge trạng thái trực quan (Đã thanh toán, Chờ lên xe, Đã hủy)"
        ]
    },
    "US-13": {
        "title": "(3) US-13: Là một Khách hàng, tôi muốn quản lý thông tin tài khoản cá nhân, cập nhật SĐT và đổi mật khẩu bảo mật thuận tiện",
        "points": 3,
        "sprint": "Sprint 3",
        "member_username": "minhdctrn13",
        "list_key": "sprint_3",
        "desc": """**MÔ TẢ NGHIỆP VỤ (US-13 - CUSTOMER PROFILE)**:
- **Backend**: `GET/PUT /api/v1/users/profile` & `POST /api/v1/users/change-password` (Mã hóa BCrypt 12 rounds).
- **Frontend**: `ProfilePage.tsx` (Form thông tin cá nhân, form đổi mật khẩu có kiểm tra độ mạnh).
- **Phụ trách**: Trần Hữu Đức (Customer & Tickets).
- **Trạng thái**: Hoàn thành & Nghiệm thu 100% Pass.""",
        "be_checklist": [
            "API cập nhật họ tên và số điện thoại người dùng",
            "API đổi mật khẩu có kiểm tra mật khẩu cũ và mã hóa BCrypt",
            "Validate định dạng số điện thoại Việt Nam"
        ],
        "fe_checklist": [
            "Form chỉnh sửa thông tin cá nhân và ảnh đại diện",
            "Form đổi mật khẩu có con mắt ẩn/hiện mật khẩu",
            "Thông báo Toast thành công khi cập nhật"
        ]
    },
    "US-14": {
        "title": "(3) US-14: Là một Khách hàng, tôi muốn đăng ký/đăng nhập nhanh bằng JWT và nhận các mã ưu đãi giảm giá chuyến đi",
        "points": 3,
        "sprint": "Sprint 1",
        "member_username": "minhdctrn13",
        "list_key": "sprint_1",
        "desc": """**MÔ TẢ NGHIỆP VỤ (US-14 - AUTH & VOUCHERS)**:
- **Backend**: `POST /api/v1/auth/login`, `/register` & `GET /api/v1/promotions`.
- **Frontend**: `LoginPage.tsx`, `RegisterPage.tsx` & `VoucherModal.tsx` (Kho 5 mã ưu đãi 1 chạm).
- **Phụ trách**: Trần Hữu Đức (Customer & Tickets).
- **Trạng thái**: Hoàn thành & Nghiệm thu 100% Pass.""",
        "be_checklist": [
            "API Đăng ký tài khoản mới và Đăng nhập trả về JWT Bearer Token",
            "API lấy danh sách mã giảm giá Voucher khả dụng",
            "Logic kiểm tra điều kiện áp dụng mã voucher cho đơn đặt vé"
        ],
        "fe_checklist": [
            "Giao diện Đăng ký và Đăng nhập hiện đại có nút đăng nhập nhanh Demo",
            "Modal kho mã giảm giá (TRAVELEASY, GIAM20, VEXEREVIP...)",
            "Nút Sao chép mã và Áp dụng 1 chạm trừ tiền trực tiếp vào đơn vé"
        ]
    },
    "US-15": {
        "title": "(5) US-15: Là một Khách hàng, tôi muốn tra cứu lịch trình xe chạy toàn quốc và xem các tuyến đường hot trên trang chủ hiện đại",
        "points": 5,
        "sprint": "Sprint 2",
        "member_username": "thanhphmcong1", # mapped to team lead / assigned
        "list_key": "sprint_2",
        "desc": """**MÔ TẢ NGHIỆP VỤ (US-15 - HOME & SCHEDULE)**:
- **Backend**: `GET /api/v1/public/popular-routes` & `GET /api/v1/public/schedule`.
- **Frontend**: `HomePage.tsx` (Slider tuyến đường phổ biến, Trust Badges, đối tác vận tải) & `SchedulePage.tsx` (Lịch trình toàn quốc).
- **Phụ trách**: Nguyễn Trọng Cường (Frontend & Mobile Specialist).
- **Trạng thái**: Hoàn thành & Nghiệm thu 100% Pass.""",
        "be_checklist": [
            "API trả về danh sách các tuyến đường phổ biến có giá vé rẻ nhất",
            "API tổng hợp lịch trình xe chạy toàn quốc theo các khung giờ",
            "Tối ưu truy vấn dữ liệu trang chủ dưới 50ms"
        ],
        "fe_checklist": [
            "Slider tuyến đường hot trực quan có ảnh Cloudinary và giá vé",
            "Khu vực Trust Badges và đối tác nhà xe (Phương Trang, Thành Bưởi...)",
            "Trang Lịch trình toàn quốc tra cứu nhanh giờ xuất bến"
        ]
    },
    "US-16": {
        "title": "(5) US-16: Là một Khách hàng, tôi muốn tra cứu thông tin vé nhanh bằng SĐT hoặc mã đơn và xem được vé khi không có kết nối mạng Internet",
        "points": 5,
        "sprint": "Sprint 4",
        "member_username": "thanhphmcong1",
        "list_key": "sprint_4",
        "desc": """**MÔ TẢ NGHIỆP VỤ (US-16 - OFFLINE TICKET LOOKUP)**:
- **Backend**: `GET /api/v1/bookings/lookup?query=...` (Tra cứu mã `BK-*` hoặc SĐT, che mờ thông tin bảo mật).
- **Frontend**: `TicketLookupPage.tsx` (Lưu vé vào LocalStorage xem Offline, vẽ bản đồ lộ trình đón trả).
- **Phụ trách**: Nguyễn Trọng Cường (Frontend & Mobile Specialist).
- **Trạng thái**: Hoàn thành & Nghiệm thu 100% Pass.""",
        "be_checklist": [
            "API tra cứu vé công khai có cơ chế che bảo mật thông tin cá nhân",
            "Xử lý tìm kiếm theo cả mã đơn vé và số điện thoại đặt vé",
            "Trả về thông tin chi tiết xe, giờ chạy, số ghế và trạm đón trả"
        ],
        "fe_checklist": [
            "Giao diện tra cứu 1 ô nhập liệu đơn giản, tiện dụng",
            "Cơ chế Offline Cache tự động lưu vé đã tra cứu vào LocalStorage",
            "Hiển thị thông báo khi mất kết nối mạng và cho phép xem vé bình thường"
        ]
    },
    "US-17": {
        "title": "(5) US-17: Là một Nhân viên phụ xe / Hành khách, tôi muốn dùng camera quét trực tiếp mã QR trên vé để xác thực và Check-in lên xe trong 0.2s",
        "points": 5,
        "sprint": "Sprint 3",
        "member_username": "thanhphmcong1",
        "list_key": "sprint_3",
        "desc": """**MÔ TẢ NGHIỆP VỤ (US-17 - QR SCANNER & INSTANT CHECK-IN)**:
- **Backend**: `POST /api/v1/tickets/checkin` (Xác thực mã vé, cập nhật trạng thái `CHECKED_IN`, chống quét trùng vé).
- **Frontend**: `TicketScannerPage.tsx` (Quét webcam/camera điện thoại bằng thư viện jsQR, phản hồi âm thanh WebAudio).
- **Phụ trách**: Nguyễn Trọng Cường (Frontend & Mobile Specialist).
- **Trạng thái**: Hoàn thành & Nghiệm thu 100% Pass.""",
        "be_checklist": [
            "API kiểm tra tính hợp lệ của mã vé và chữ ký điện tử",
            "Cập nhật trạng thái vé sang CHECKED_IN thời gian thực",
            "Cơ chế chống quét trùng vé: báo lỗi nếu vé đã check-in trước đó"
        ],
        "fe_checklist": [
            "Tích hợp thư viện jsQR quét camera trực tiếp mượt mà",
            "Phản hồi âm thanh Beep WebAudio và chuông báo thành công",
            "Hỗ trợ tải ảnh chụp mã QR từ thư viện ảnh để quét"
        ]
    }
}

CANONICAL_BACKLOG = {
    "US-21": {
        "title": "(3) US-21: Là một Khách hàng, tôi muốn trò chuyện với Trợ lý AI du lịch để tư vấn vị trí giường nằm chống say xe và gợi ý quán ăn ngon",
        "desc": """**MÔ TẢ USER STORY (US-21 - PHASE 2 ROADMAP)**:
- **Mục tiêu**: Nâng cấp Trợ lý AI TravelEasy từ Rule-based sang mô hình LLM RAG (OpenAI / Gemini).
- **Phạm vi**: Gợi ý kinh nghiệm du lịch, mẹo chọn giường tầng dưới chống say xe và các quán ăn ngon dọc tuyến đường.
- **Story Points**: (3) Story Points.
- **Trạng thái**: Product Backlog (Phase 2)."""
    },
    "US-22": {
        "title": "(5) US-22: Là một Khách hàng, tôi muốn quản lý Sổ địa chỉ người đi cùng trong Profile để tự động điền form đặt vé",
        "desc": """**MÔ TẢ USER STORY (US-22 - PHASE 2 ROADMAP)**:
- **Mục tiêu**: Bổ sung bảng `user_companions` cho phép lưu danh sách người thân (họ tên, SĐT, CCCD).
- **Phạm vi**: Khi đặt vé chỉ cần 1 click chọn người đi cùng để điền tự động.
- **Story Points**: (5) Story Points.
- **Trạng thái**: Product Backlog (Phase 2)."""
    },
    "US-23": {
        "title": "(3) US-23: Là một Khách hàng, tôi muốn nhận email xác nhận vé điện tử kèm file PDF đính kèm tự động sau khi thanh toán",
        "desc": """**MÔ TẢ USER STORY (US-23 - PHASE 2 ROADMAP)**:
- **Mục tiêu**: Tích hợp Spring Boot Starter Mail với SMTP MailGun/SendGrid.
- **Phạm vi**: Tự động sinh file PDF Boarding Pass chuẩn iText/OpenPDF và gửi email ngay sau khi thanh toán thành công.
- **Story Points**: (3) Story Points.
- **Trạng thái**: Product Backlog (Phase 2)."""
    },
    "US-24": {
        "title": "(5) US-24: Là một Nhà xe, tôi muốn có tính năng đổi xe khẩn cấp và ghép ghế bán tự động khi xe gặp sự cố trên đường",
        "desc": """**MÔ TẢ USER STORY (US-24 - PHASE 2 ROADMAP)**:
- **Mục tiêu**: Xây dựng thuật toán dồn khách và chuyển phương tiện khi xe gặp sự cố hỏng hóc hoặc tai nạn.
- **Phạm vi**: Giữ nguyên vị trí giường tương đương và tự động gửi thông báo SMS khẩn cấp cho hành khách.
- **Story Points**: (5) Story Points.
- **Trạng thái**: Product Backlog (Phase 2)."""
    },
    "US-25": {
        "title": "(3) US-25: Là một QA Lead, tôi muốn có bộ 25 Test Cases tự động chạy định kỳ trên CI/CD để giám sát chất lượng liên tục",
        "desc": """**MÔ TẢ USER STORY (US-25 - PHASE 2 ROADMAP)**:
- **Mục tiêu**: Xây dựng bộ kiểm thử E2E tự động hóa bằng Playwright/Cypress.
- **Phạm vi**: Thiết lập cron job chạy kiểm thử toàn diện 25 kịch bản hàng đêm trên GitHub Actions.
- **Story Points**: (3) Story Points.
- **Trạng thái**: Product Backlog (Phase 2)."""
    }
}

CLEAN_LIST_MAPPING = {
    "6ad6f486572cd6662754e06c": {"key": "backlog", "name": "Product Backlog (Phase 2 Roadmap - 19 SP)", "pos": 1},
    "6ad6f486572cd6662754e06d": {"key": "sprint_1", "name": "Sprint 1: Architecture, CSDL & Auth (23 SP) [DONE]", "pos": 2},
    "6ad6f486572cd6662754e06e": {"key": "sprint_2", "name": "Sprint 2: Core Booking & Concurrency Lock (29 SP) [DONE]", "pos": 3},
    "6ad6f486572cd6662754e06f": {"key": "sprint_3", "name": "Sprint 3: Payment, Boarding Pass & Tickets (21 SP) [DONE]", "pos": 4},
    "6ad6f486572cd6662754e070": {"key": "sprint_4", "name": "Sprint 4: Admin Portal, Settlements & Logs (22 SP) [DONE]", "pos": 5},
    "6ad6f486572cd6662754e071": {"key": "qa", "name": "Testing & QA Verification (25/25 Pass)", "pos": 6},
    "6ad6f486572cd6662754e072": {"key": "retrospective", "name": "Sprint Retrospective & Defense Ready (100/100)", "pos": 7},
    "6ad6f486572cd6662754e073": {"key": "bug", "name": "Bug Tracking (0 Critical Issues)", "pos": 8},
}

KEY_TO_LIST_ID = {v["key"]: k for k, v in CLEAN_LIST_MAPPING.items()}

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    print("=" * 70)
    print("🧹 BẮT ĐẦU DỌN DẸP ICON & ĐỒNG BỘ TRELLO THEO CODE MỚI NHẤT")
    print(f"Board URL: {BOARD_SHORT_URL}")
    print("=" * 70)

    # 1. Update List names to clean names (no emojis)
    print("\n[1/5] Cập nhật tiêu đề 8 danh sách sạch sẽ, loại bỏ icon thừa...")
    for lid, info in CLEAN_LIST_MAPPING.items():
        print(f"  * Danh sách {info['key']} -> '{info['name']}'...")
        trello_req(f"lists/{lid}", method="PUT", params={"name": info["name"], "pos": info["pos"]})

    # 2. Fetch Board data
    print("\n[2/5] Đang nạp dữ liệu Board hiện tại...")
    board_data = trello_req(f"boards/{BOARD_ID}", params={"cards": "all", "labels": "all", "members": "all"})
    if not board_data:
        print("[!] Không thể kết nối. Thoát.")
        return 1

    cards = board_data.get("cards", [])
    labels = {lb.get("name"): lb.get("id") for lb in board_data.get("labels", []) if lb.get("name")}
    members = {m.get("username"): m.get("id") for m in board_data.get("members", [])}

    print(f"  -> {len(cards)} thẻ, {len(labels)} nhãn, {len(members)} thành viên.")

    # 3. Synchronize 17 canonical cards
    print("\n[3/5] Đồng bộ chính xác 17 User Stories theo mã nguồn mới nhất...")
    for c in cards:
        c_name = c.get("name", "")
        # Find which US this card belongs to
        matched_us = None
        for us_code in CANONICAL_CARDS.keys():
            if us_code in c_name:
                matched_us = us_code
                break
        
        if matched_us:
            target_data = CANONICAL_CARDS[matched_us]
            target_list_id = KEY_TO_LIST_ID[target_data["list_key"]]
            target_title = target_data["title"]
            target_desc = target_data["desc"]
            
            print(f"  -> Cập nhật {matched_us}...")
            # Update title, desc, list
            trello_req(f"cards/{c['id']}", method="PUT", data={"name": target_title, "desc": target_desc}, params={"idList": target_list_id})

            # Check and update Sprint label
            target_sprint = target_data["sprint"]
            if target_sprint in labels:
                sprint_lb_id = labels[target_sprint]
                cur_lbs = [lb["id"] for lb in c.get("labels", [])]
                if sprint_lb_id not in cur_lbs:
                    trello_req(f"cards/{c['id']}/idLabels", method="POST", params={"value": sprint_lb_id})

            # Check and update member
            target_username = target_data["member_username"]
            if target_username in members:
                target_mem_id = members[target_username]
                cur_mems = c.get("idMembers", [])
                if target_mem_id not in cur_mems:
                    trello_req(f"cards/{c['id']}/idMembers", method="POST", params={"value": target_mem_id})

            # Update / ensure Checklists
            # Fetch existing checklists
            card_checklists = trello_req(f"cards/{c['id']}/checklists") or []
            existing_cl_names = {cl["name"]: cl for cl in card_checklists}

            # Backend Checklist
            be_cl_name = "Backend Checklist"
            if be_cl_name not in existing_cl_names:
                be_cl = trello_req("checklists", method="POST", data={"idCard": c["id"], "name": be_cl_name})
                if be_cl:
                    for item in target_data["be_checklist"]:
                        trello_req(f"checklists/{be_cl['id']}/checkItems", method="POST", data={"name": item, "checked": True})
            
            # Frontend Checklist
            fe_cl_name = "Frontend Checklist"
            if fe_cl_name not in existing_cl_names:
                fe_cl = trello_req("checklists", method="POST", data={"idCard": c["id"], "name": fe_cl_name})
                if fe_cl:
                    for item in target_data["fe_checklist"]:
                        trello_req(f"checklists/{fe_cl['id']}/checkItems", method="POST", data={"name": item, "checked": True})

        # Match Product Backlog cards
        matched_bk = None
        for bk_code in CANONICAL_BACKLOG.keys():
            if bk_code in c_name:
                matched_bk = bk_code
                break
        
        if matched_bk:
            bk_data = CANONICAL_BACKLOG[matched_bk]
            bk_list_id = KEY_TO_LIST_ID["backlog"]
            print(f"  -> Cập nhật Backlog {matched_bk}...")
            trello_req(f"cards/{c['id']}", method="PUT", data={"name": bk_data["title"], "desc": bk_data["desc"]}, params={"idList": bk_list_id})

    # 4. Clean up QA and Defense cards (remove emojis from titles)
    print("\n[4/5] Làm sạch tiêu đề các thẻ Nghiệm thu QA và Tổng kết bảo vệ...")
    clean_meta_titles = {
        "QA-01": "[QA-01] Biên bản Kiểm thử Tính năng & Nghiệm thu Nội bộ Nhóm 7",
        "QA-02": "[QA-02] Bộ 25 Test Cases Kiểm thử Toàn diện & NFR Benchmarks (100% Pass)",
        "DEF-01": "[DEF-01] Kịch bản Thuyết trình Bảo vệ Đồ án 15 Phút Chuẩn Barem (5 thành viên OJT)",
        "DEF-02": "[DEF-02] Bàn giao Toàn diện Hệ thống TravelEasy Platform (100/100 Điểm)"
    }

    fresh_cards = trello_req(f"boards/{BOARD_ID}/cards") or []
    for c in fresh_cards:
        c_name = c.get("name", "")
        for meta_code, clean_title in clean_meta_titles.items():
            if meta_code in c_name and c_name != clean_title:
                print(f"  * Đổi tên thẻ {meta_code} -> '{clean_title}'...")
                trello_req(f"cards/{c['id']}", method="PUT", data={"name": clean_title})

    print("\n[5/5] HOÀN TẤT DỌN DẸP ICON VÀ ĐỒNG BỘ TRELLO!")
    print(f"Bảng Trello sạch sẽ trực tiếp tại: {BOARD_SHORT_URL}")
    print("=" * 70)
    return 0

if __name__ == "__main__":
    sys.exit(main())
