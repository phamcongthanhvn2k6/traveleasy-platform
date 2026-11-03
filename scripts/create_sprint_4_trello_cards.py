"""
SCRIPT: create_sprint_4_trello_cards.py
Mục tiêu:
  1. Mở hoặc tạo danh sách 'Sprint Backlog - SPRINT 4' trên Trello.
  2. Tạo 16 thẻ chuẩn cho Sprint 4 tương ứng 5 phân hệ thực tế:
     - Quầy vé bến xe của Nhà xe POS (/company/pos & /company/pos/shifts)
     - Thuê xe hợp đồng du lịch & Ký quỹ Escrow 30% (/charter & /admin/charters)
     - Gửi hàng bưu kiện hầm xe (/cargo)
     - GPS Live Tracking xe chạy thời gian thực (/tracking/:tripId & SSE)
     - Giá vé động Flash Sale (/company/pricing-rules) & Ví EasyXu (/rewards)
     - Bảo hiểm chuyến đi (/insurance) & Demo Hub 15 phút (/demo)
  3. Gán đúng thành viên (Phát, Phong, Cường, Đức), Story Points và Checklist DoD.
"""
import sys, requests, json, time, urllib.parse
sys.stdout.reconfigure(encoding='utf-8')

KEY   = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'
BOARD = 'AA5BYoe1'
BASE  = 'https://api.trello.com/1'
HEADERS = {'Content-Type': 'application/x-www-form-urlencoded'}

MEMBER_IDS = {
    'thanh': '692e4e6c8379666bcf47e7e1', # Phạm Công Thành (Architect)
    'phat':  '68059add9a007163e68826b9', # Nguyễn Đại Phát
    'phong': '692e4eee91abcb512798534a', # Phạm Thanh Phong
    'duc':   '692e4f54351701077614b9cb', # Trần Minh Đức
    'cuong': '6ae1b1e83656c2e4f73178d5', # Đoàn Nhật Cường (Josh Liam)
}

def trello_get(path, **params):
    r = requests.get(f'{BASE}{path}', params={'key': KEY, 'token': TOKEN, **params}, timeout=15)
    r.raise_for_status()
    return r.json()

def trello_post(path, data):
    r = requests.post(
        f'{BASE}{path}',
        headers=HEADERS,
        params={'key': KEY, 'token': TOKEN},
        data=data,
        timeout=15
    )
    return r

def trello_put(path, data):
    r = requests.put(
        f'{BASE}{path}',
        headers=HEADERS,
        params={'key': KEY, 'token': TOKEN},
        data=data,
        timeout=15
    )
    return r

# 1. Tìm hoặc mở list Sprint Backlog - SPRINT 4
print("1. Kiểm tra các danh sách trên Board...")
all_lists = trello_get(f'/boards/{BOARD}/lists', filter='all')
s4_list_id = None

for l in all_lists:
    name = l['name'].lower()
    if 'sprint 4' in name or 'sprint-4' in name:
        s4_list_id = l['id']
        print(f"   Tìm thấy list: {l['name']} ({l['id']}) - Closed: {l['closed']}")
        # Mở lại và đổi tên chuẩn
        trello_put(f'/lists/{s4_list_id}', 'name=Sprint+Backlog+-+SPRINT+4&closed=false&pos=bottom')
        print("   Đã mở lại và đặt tên: 'Sprint Backlog - SPRINT 4'")
        break

if not s4_list_id:
    print("   Chưa có list, tạo mới 'Sprint Backlog - SPRINT 4'...")
    res = trello_post(f'/boards/{BOARD}/lists', 'name=Sprint+Backlog+-+SPRINT+4&pos=bottom')
    s4_list_id = res.json()['id']
    print(f"   Đã tạo mới list: {s4_list_id}")

# 2. Định nghĩa danh sách 16 thẻ chuẩn cho Sprint 4
s4_cards_def = [
    # --- PHÂN HỆ ADMIN & ĐỐI TÁC: NGUYỄN ĐẠI PHÁT (3 thẻ) ---
    {
        'title': '[S401][FE] Giao diện Quản trị Thuê xe Hợp đồng & Ký quỹ Escrow 30% (/admin/charters)',
        'sp': 3,
        'assignee': 'phat',
        'desc': """**Mô tả**: Dựng màn hình Admin giám sát toàn bộ hợp đồng thuê xe toàn sàn, kiểm tra tiền cọc 30% đang giữ trong quỹ Escrow và nút bấm giải ngân cọc cho nhà xe sau khi chuyến đi hoàn tất.
- **Story Points**: 3 SP
- **Người thực hiện**: Nguyễn Đại Phát
- **Độ ưu tiên**: Cao (P1)
- **Tiêu chí nghiệm thu (DoD)**:
  - [ ] Bảng hiển thị danh sách đơn thuê xe (Mã HĐ, Khách hàng, Nhà xe, Giá trọn gói, Tiền cọc).
  - [ ] Bộ lọc trạng thái: Đang tìm báo giá, Đã cọc Escrow, Đang chạy chuyến, Đã hoàn thành.
  - [ ] Nút "Giải ngân cọc" (Release Escrow) chuyển tiền về ví nhà xe kèm popup xác nhận.""",
        'checklists': [
            'Bảng danh sách hợp đồng thuê xe kèm trạng thái cọc 30%',
            'Modal chi tiết lộ trình và báo giá của các nhà xe',
            'Nút duyệt giải ngân tiền cọc an toàn cho nhà xe'
        ]
    },
    {
        'title': '[S401][BE] API Quản lý Hợp đồng Thuê xe & Logic Giải ngân Ký quỹ Escrow (/api/v1/admin/charters)',
        'sp': 4,
        'assignee': 'phat',
        'desc': """**Mô tả**: Viết Backend API quản lý hợp đồng thuê xe, xử lý giữ cọc 30% và giải ngân an toàn cho nhà xe khi chuyến đi kết thúc.
- **Story Points**: 4 SP
- **Người thực hiện**: Nguyễn Đại Phát
- **Độ ưu tiên**: Cao (P1)
- **Tiêu chí nghiệm thu (DoD)**:
  - [ ] API `GET /api/v1/admin/charters` hỗ trợ phân trang và lọc theo trạng thái cọc.
  - [ ] API `POST /api/v1/admin/charters/{id}/release-escrow` khấu trừ 5% phí sàn và giải ngân 95% cọc cho nhà xe.
  - [ ] Ghi nhận vết giao dịch bất biến vào bảng `audit_logs`.""",
        'checklists': [
            'Entity CharterRequest & CharterBid JPA Mapping',
            'Service xử lý giải ngân Escrow và tính phí sàn 5%',
            'API phân trang và kiểm toán giao dịch'
        ]
    },
    {
        'title': '[S402][FE+BE] Phân hệ Quản trị Giá vé động & Flash Sale giờ chót (/company/pricing-rules)',
        'sp': 4,
        'assignee': 'phat',
        'desc': """**Mô tả**: Xây dựng phân hệ cho phép nhà xe cấu hình luật giá tự động (phụ thu lễ Tết +20%, Flash Sale giờ chót -15% khi xe sắp chạy còn nhiều ghế trống).
- **Story Points**: 4 SP
- **Người thực hiện**: Nguyễn Đại Phát
- **Độ ưu tiên**: Trung bình (P2)
- **Tiêu chí nghiệm thu (DoD)**:
  - [ ] Giao diện danh sách luật giá và form modal tạo luật giá mới.
  - [ ] Backend tự động tính toán giá vé cuối cùng (`final_price`) khi khách tìm chuyến.
  - [ ] Banner nhấp nháy "Flash Sale Giờ Vàng" trên trang chủ khi có luật giá kích hoạt.""",
        'checklists': [
            'Entity DynamicPricingRule & Repository',
            'Thuật toán tính giá động theo giờ xuất bến và tỷ lệ trống',
            'Giao diện nhà xe quản lý bật/tắt luật giá linh hoạt'
        ]
    },

    # --- PHÂN HỆ QUẦY BẾN XE POS & REALTIME: PHẠM THANH PHONG (5 thẻ) ---
    {
        'title': '[S403][FE] Giao diện POS Bán vé nhanh tại Quầy Bến xe của Nhà xe (/company/pos)',
        'sp': 4,
        'assignee': 'phong',
        'desc': """**Mô tả**: Xây dựng giao diện POS chuyên dụng cho nhân viên trực quầy vé của nhà xe tại Bến xe Miền Đông, Bến xe Miền Tây, Mỹ Đình... thao tác siêu tốc trong 3 click chuột.
- **Story Points**: 4 SP
- **Người thực hiện**: Phạm Thanh Phong
- **Độ ưu tiên**: Cao (P1)
- **Tiêu chí nghiệm thu (DoD)**:
  - [ ] Lưới chuyến xe sắp xuất bến trong ngày (1-3 tiếng tới).
  - [ ] Sơ đồ chọn buồng VIP trực quan, chọn ghế bằng 1 click.
  - [ ] Phím tắt F9 xuất vé & in nhiệt hóa đơn bill 80mm có mã QR cầm tay.""",
        'checklists': [
            'Layout màn hình POS Full-screen tối ưu chuột cảm ứng và phím tắt',
            'Component sơ đồ buồng ghế phản hồi tức thì',
            'Hỗ trợ in hóa đơn nhiệt qua lệnh window.print() chuẩn khổ 80mm'
        ]
    },
    {
        'title': '[S403][BE] API Xử lý Bán vé Quầy POS & Khóa ghế đồng bộ thời gian thực (/api/v1/company/pos)',
        'sp': 4,
        'assignee': 'phong',
        'desc': """**Mô tả**: Viết API bán vé nhanh tại quầy bến xe, hỗ trợ thanh toán Tiền mặt (CASH) hoặc VietQR tại quầy, đồng bộ lock ghế tức thì với khách online.
- **Story Points**: 4 SP
- **Người thực hiện**: Phạm Thanh Phong
- **Độ ưu tiên**: Cao (P1)
- **Tiêu chí nghiệm thu (DoD)**:
  - [ ] API `POST /api/v1/company/pos/tickets` nhận lệnh đặt vé từ quầy.
  - [ ] Đổi trạng thái ghế sang `BOOKED` với cơ chế `@Lock(PESSIMISTIC_WRITE)`.
  - [ ] Sinh mã QR vé dạng hash bảo mật để tài xế quét soát vé bằng camera.""",
        'checklists': [
            'API POS ticket issuance với phân quyền nhân viên quầy',
            'Xử lý khóa ghế đồng bộ loại bỏ 100% rủi ro trùng vé',
            'Tự động gán booking_channel = POS_COUNTER'
        ]
    },
    {
        'title': '[S404][FE+BE] Quản lý Đóng/Mở Ca trực & Bàn giao Tiền mặt quầy bến xe (/company/pos/shifts)',
        'sp': 4,
        'assignee': 'phong',
        'desc': """**Mô tả**: Xây dựng phân hệ quản lý ca trực quầy vé tiền mặt cho nhân viên nhà xe tại bến, in phiếu Z-Report kết ca bàn giao cho thủ quỹ.
- **Story Points**: 4 SP
- **Người thực hiện**: Phạm Thanh Phong
- **Độ ưu tiên**: Trung bình (P2)
- **Tiêu chí nghiệm thu (DoD)**:
  - [ ] Màn hình mở ca (nhập số tiền lẻ đầu ngày).
  - [ ] Thống kê doanh thu tiền mặt và tiền quét QR trong ca trực.
  - [ ] Bấm Kết ca in phiếu tổng kết doanh thu bàn giao tiền mặt.""",
        'checklists': [
            'Entity PosShift & API mở/kết ca trực',
            'Báo cáo doanh số theo ca làm việc của từng nhân viên',
            'In phiếu Z-Report tổng kết tiền nộp thủ quỹ'
        ]
    },
    {
        'title': '[S405][BE] Dịch vụ GPS Live Tracking & Stream Tọa độ xe qua Server-Sent Events (SSE) (/api/v1/tracking)',
        'sp': 4,
        'assignee': 'phong',
        'desc': """**Mô tả**: Xây dựng dịch vụ tiếp nhận tọa độ GPS của xe khách và stream trực tiếp về trình duyệt người dùng qua Server-Sent Events (SSE).
- **Story Points**: 4 SP
- **Người thực hiện**: Phạm Thanh Phong
- **Độ ưu tiên**: Cao (P1)
- **Tiêu chí nghiệm thu (DoD)**:
  - [ ] API `POST /api/v1/tracking/update` nhận tọa độ từ xe (kinh độ, vĩ độ, tốc độ).
  - [ ] Endpoint `GET /api/v1/tracking/stream/{tripId}` phát luồng SSE về client.
  - [ ] Tự động tính toán khoảng cách còn lại và thời gian dự kiến đón (ETA).""",
        'checklists': [
            'Spring WebMvc SseEmitter quản lý kết nối thời gian thực',
            'Thuật toán tính khoảng cách Haversine Formula',
            'Cập nhật tọa độ tức thời vào bảng trips'
        ]
    },
    {
        'title': '[S406][BE] Động cơ Tính cước Vận chuyển Bưu kiện & Quản lý Vận đơn Hầm xe (/api/v1/cargo)',
        'sp': 4,
        'assignee': 'phong',
        'desc': """**Mô tả**: Viết Backend xử lý dịch vụ gửi hàng hóa hầm xe khách, tính cước theo thể tích/khối lượng và sinh mã OTP nhận hàng.
- **Story Points**: 4 SP
- **Người thực hiện**: Phạm Thanh Phong
- **Độ ưu tiên**: Trung bình (P2)
- **Tiêu chí nghiệm thu (DoD)**:
  - [ ] API tính cước tự động dựa trên loại hàng và trọng lượng.
  - [ ] Sinh mã vận đơn duy nhất dạng `CG-2026-XXXXX` và mã OTP 6 số.
  - [ ] API xác nhận giao hàng bằng mã OTP tại bến đến.""",
        'checklists': [
            'Entity CargoOrder & CargoRepository',
            'Thuật toán tính cước hàng hóa thể tích và khối lượng',
            'Xác thực mã OTP khi nhận hàng tại bến'
        ]
    },

    # --- PHÂN HỆ MOBILE & BẢN ĐỒ VỆ TINH: ĐOÀN NHẬT CƯỜNG (3 thẻ) ---
    {
        'title': '[S405][FE] Bản đồ Định vị GPS Live Tracking xe chạy thời gian thực trên di động (/tracking/:tripId)',
        'sp': 4,
        'assignee': 'cuong',
        'desc': """**Mô tả**: Xây dựng màn hình bản đồ vệ tinh tương tác (Leaflet/Mapbox) hiển thị icon xe khách di chuyển mượt mà trên tuyến đường đón khách.
- **Story Points**: 4 SP
- **Người thực hiện**: Đoàn Nhật Cường
- **Độ ưu tiên**: Cao (P1)
- **Tiêu chí nghiệm thu (DoD)**:
  - [ ] Tích hợp thư viện Leaflet hiển thị bản đồ tuyến đường.
  - [ ] Lắng nghe luồng SSE từ Backend và cập nhật vị trí xe không cần F5.
  - [ ] Hiển thị thẻ thông tin: Tốc độ xe (km/h), thời gian dự kiến đón (~18 phút).""",
        'checklists': [
            'Tích hợp bản đồ Leaflet / OpenStreetMap trên React',
            'Hiệu ứng icon xe bus di chuyển mượt mà (Marker Animation)',
            'Giao diện tối ưu hoàn hảo trên màn hình điện thoại'
        ]
    },
    {
        'title': '[S407][FE] Trung tâm Hỗ trợ Khẩn cấp & Chăm sóc Khách hàng 24/7 (/support)',
        'sp': 3,
        'assignee': 'cuong',
        'desc': """**Mô tả**: Dựng trang trung tâm hỗ trợ hành khách suốt hành trình di chuyển, tích hợp danh bạ hotline bến xe và gửi phản ánh sự cố.
- **Story Points**: 3 SP
- **Người thực hiện**: Đoàn Nhật Cường
- **Độ ưu tiên**: Thấp (P3)
- **Tiêu chí nghiệm thu (DoD)**:
  - [ ] Danh bạ Hotline khẩn cấp 1-chạm gọi điện trực tiếp.
  - [ ] Form gửi phản ánh (quên hành lý, thái độ phục vụ) đính kèm ảnh.
  - [ ] FAQ các câu hỏi thường gặp khi đi xe liên tỉnh.""",
        'checklists': [
            'Giao diện danh bạ cứu hộ và số điện thoại các bến xe',
            'Form gửi ticket hỗ trợ khẩn cấp',
            'Tối ưu hiển thị Responsive trên mobile'
        ]
    },
    {
        'title': '[S408][FE] Tối ưu hóa Trải nghiệm Di động Mobile-First cho các Phân hệ Mới Sprint 4',
        'sp': 3,
        'assignee': 'cuong',
        'desc': """**Mô tả**: Rà soát và hoàn thiện độ thích ứng di động (Mobile Responsive) cho toàn bộ các trang mới của Sprint 4.
- **Story Points**: 3 SP
- **Người thực hiện**: Đoàn Nhật Cường
- **Độ ưu tiên**: Trung bình (P2)
- **Tiêu chí nghiệm thu (DoD)**:
  - [ ] Kiểm thử hiển thị trên iPhone, iPad, Android màn hình nhỏ.
  - [ ] Tối ưu tốc độ tải trang Core Web Vitals < 1.5 giây.
  - [ ] Không bị tràn khung ngang (horizontal scrollbar).""",
        'checklists': [
            'Rà soát Responsive trên các độ phân giải màn hình',
            'Kiểm tra kích thước nút bấm cảm ứng (Touch Target > 44px)',
            'Tối ưu kích thước bundle JavaScript'
        ]
    },

    # --- PHÂN HỆ TIỆN ÍCH DỊCH VỤ KHÁCH HÀNG: TRẦN MINH ĐỨC (5 thẻ) ---
    {
        'title': '[S409][FE] Giao diện Đặt thuê xe du lịch hợp đồng trọn gói có tài xế (/charter)',
        'sp': 4,
        'assignee': 'duc',
        'desc': """**Mô tả**: Dựng màn hình cho khách đoàn, công ty đặt thuê nguyên xe 16, 29 hoặc 45 chỗ có tài xế riêng.
- **Story Points**: 4 SP
- **Người thực hiện**: Trần Minh Đức
- **Độ ưu tiên**: Cao (P1)
- **Tiêu chí nghiệm thu (DoD)**:
  - [ ] Form nhập điểm đón, điểm đến, ngày đi/về, chọn loại xe.
  - [ ] Tự động tính khoảng cách km và ước tính mức giá tham khảo.
  - [ ] Màn hình danh sách báo giá của các nhà xe kèm nút đặt cọc 30%.""",
        'checklists': [
            'Form đặt xe trực quan với validation địa chỉ',
            'Lựa chọn loại xe 16 chỗ, 29 chỗ, 45 chỗ Universe',
            'Giao diện so sánh các báo giá cạnh tranh từ nhà xe'
        ]
    },
    {
        'title': '[S410][FE] Giao diện Ký gửi hàng hóa bưu kiện hầm xe & Tra cứu vận đơn (/cargo)',
        'sp': 4,
        'assignee': 'duc',
        'desc': """**Mô tả**: Dựng màn hình gửi bưu phẩm, tài liệu, xe máy hầm xe khách và tra cứu tiến độ vận đơn.
- **Story Points**: 4 SP
- **Người thực hiện**: Trần Minh Đức
- **Độ ưu tiên**: Trung bình (P2)
- **Tiêu chí nghiệm thu (DoD)**:
  - [ ] Form nhập người gửi, người nhận, chọn loại hàng (giấy tờ, bưu kiện, xe máy).
  - [ ] Tính cước tự động hiển thị trước khi thanh toán.
  - [ ] Hiển thị tem vận đơn có mã vạch QR dán thùng hàng.""",
        'checklists': [
            'Form tạo đơn gửi hàng kèm tính cước tự động',
            'Trang tra cứu tiến độ vận đơn theo mã CG-2026-XXXXX',
            'Hiển thị mã QR và hướng dẫn gửi nhận tại bến'
        ]
    },
    {
        'title': '[S411][FE] Giao diện Ví tích điểm thưởng EasyXu & Minigame Vòng quay may mắn (/rewards)',
        'sp': 3,
        'assignee': 'duc',
        'desc': """**Mô tả**: Xây dựng trang ví điểm thưởng EasyXu và minigame Vòng quay may mắn kích thích khách hàng quay lại mua vé.
- **Story Points**: 3 SP
- **Người thực hiện**: Trần Minh Đức
- **Độ ưu tiên**: Thấp (P3)
- **Tiêu chí nghiệm thu (DoD)**:
  - [ ] Thẻ hiển thị số dư EasyXu (1 xu = 1 VNĐ).
  - [ ] Lịch sử cộng/trừ xu sau mỗi chuyến đi.
  - [ ] Vòng quay may mắn Canvas/CSS trúng voucher giảm giá 10% - 30%.""",
        'checklists': [
            'Hiển thị số dư ví xu và lịch sử biến động',
            'Component Minigame Vòng quay may mắn có hiệu ứng âm thanh',
            'Tích hợp cấn trừ xu trực tiếp tại màn hình thanh toán'
        ]
    },
    {
        'title': '[S412][FE] Tích hợp Gói Bảo hiểm chuyến đi 10k & Form nộp hồ sơ bồi thường (/insurance)',
        'sp': 3,
        'assignee': 'duc',
        'desc': """**Mô tả**: Xây dựng trang thông tin bảo hiểm tai nạn chuyến đi và form nộp yêu cầu bồi thường trực tuyến khi gặp sự cố.
- **Story Points**: 3 SP
- **Người thực hiện**: Trần Minh Đức
- **Độ ưu tiên**: Thấp (P3)
- **Tiêu chí nghiệm thu (DoD)**:
  - [ ] Trang giới thiệu quyền lợi bảo hiểm (đền bù tai nạn tới 400 triệu).
  - [ ] Form nộp hồ sơ yêu cầu bồi thường trực tuyến (tải ảnh vé, hóa đơn viện phí).
  - [ ] Checkbox tích chọn mua bảo hiểm 10k tại trang checkout.""",
        'checklists': [
            'Trang chi tiết quyền lợi bảo hiểm liên kết Bảo Việt',
            'Form nộp yêu cầu bồi thường sự cố trực tuyến',
            'Tích hợp tùy chọn mua kèm bảo hiểm tại trang thanh toán'
        ]
    },
    {
        'title': '[S413][FE] Chuẩn bị Kịch bản và Dữ liệu Trình diễn Demo Hub 15 phút bảo vệ OJT (/demo)',
        'sp': 3,
        'assignee': 'thanh',
        'desc': """**Mô tả**: Hoàn thiện trang Demo Hub `/demo` hỗ trợ Hội đồng chấm thi chuyển nhanh giữa các phân hệ và kịch bản bảo vệ đồ án 15 phút.
- **Story Points**: 3 SP
- **Người thực hiện**: Cả nhóm (Review: Phạm Công Thành)
- **Độ ưu tiên**: Cao (P1)
- **Tiêu chí nghiệm thu (DoD)**:
  - [ ] Trang `/demo` có 5 card chuyển hướng nhanh: Khách đặt vé, Quầy bến xe POS, Quét QR, Thuê xe hợp đồng, GPS Live.
  - [ ] Nạp sẵn dữ liệu demo mượt mà không bị rỗng.
  - [ ] Kịch bản phân chia thuyết trình 15 phút khớp 100% với tài liệu.""",
        'checklists': [
            'Giao diện trang Demo Hub /demo trực quan',
            'Dữ liệu mẫu chuẩn hóa sẵn sàng cho ngày bảo vệ',
            'Slide thuyết trình và kịch bản demo 15 phút'
        ]
    }
]

print()
print("3. Bắt đầu tạo 16 thẻ trên Trello...")
created_count = 0

for i, card in enumerate(s4_cards_def):
    mem_key = card['assignee']
    mem_id = MEMBER_IDS.get(mem_key, '')
    
    # Tạo card
    payload = {
        'idList': s4_list_id,
        'name': card['title'],
        'desc': card['desc'],
        'pos': 'bottom',
        'idMembers': mem_id
    }
    
    data_encoded = urllib.parse.urlencode(payload)
    r = trello_post('/cards', data_encoded)
    
    if r.status_code == 200:
        card_id = r.json()['id']
        created_count += 1
        print(f"  [{i+1}/16] ✅ {card['title'][:55]}")
        
        # Tạo checklist nếu có
        if card.get('checklists'):
            chk_payload = urllib.parse.urlencode({'idCard': card_id, 'name': 'Tiêu chí hoàn thành (DoD)'})
            chk_res = trello_post(f'/cards/{card_id}/checklists', chk_payload)
            if chk_res.status_code == 200:
                chk_id = chk_res.json()['id']
                for item in card['checklists']:
                    item_payload = urllib.parse.urlencode({'name': item})
                    trello_post(f'/checklists/{chk_id}/checkItems', item_payload)
    else:
        print(f"  [{i+1}/16] ❌ Lỗi tạo thẻ {card['title'][:40]}: {r.status_code}")
    
    time.sleep(0.15)

print()
print("=" * 60)
print(f"🏆 ĐÃ TẠO THÀNH CÔNG {created_count}/16 THẺ TRÊN 'Sprint Backlog - SPRINT 4'!")
print("Phân bổ công việc:")
print("  - Nguyễn Đại Phát: 3 thẻ (11 SP) — Admin Charters Escrow & Pricing Rules")
print("  - Phạm Thanh Phong: 5 thẻ (20 SP) — Quầy vé POS, Ca trực, GPS SSE & Cước hàng")
print("  - Đoàn Nhật Cường: 3 thẻ (10 SP) — Bản đồ Live Tracking, CSKH & Mobile")
print("  - Trần Minh Đức: 4 thẻ (14 SP) — Đặt xe hợp đồng, Gửi bưu kiện, Ví EasyXu, Bảo hiểm")
print("  - Cả nhóm (Review: Thành): 1 thẻ (3 SP) — Demo Hub 15' bảo vệ OJT")
print("  Tổng cộng: 16 thẻ — 58 SP")
print()
print(f"🔗 Xem trực tiếp: https://trello.com/b/AA5BYoe1/traveleasyplatform")

