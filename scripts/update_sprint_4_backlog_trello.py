import urllib.request
import urllib.parse
import json
import time
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

KEY = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'
BOARD_ID = 'AA5BYoe1'

MEMBER_IDS = {
    'thanh': '692e4e6c8379666bcf47e7e1', # Phạm Công Thành
    'phat':  '68059add9a007163e68826b9', # Nguyễn Đại Phát
    'phong': '692e4eee91abcb512798534a', # Phạm Thanh Phong
    'duc':   '692e4f54351701077614b9cb', # Trần Minh Đức
    'cuong': '6ae1b1e83656c2e4f73178d5', # Đoàn Nhật Cường
}

def trello_req(url, method='GET', data=None):
    sep = '&' if '?' in url else '?'
    full_url = f"{url}{sep}key={KEY}&token={TOKEN}"
    encoded_data = None
    if data:
        encoded_data = urllib.parse.urlencode(data).encode('utf-8')
    req = urllib.request.Request(full_url, data=encoded_data, method=method)
    req.add_header('Accept', 'application/json')
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"Error {method} {url}: {e}")
        return None

# 1. Lấy danh sách lists trên board
lists = trello_req(f"https://api.trello.com/1/boards/{BOARD_ID}/lists?cards=open") or []
list_s4 = None
for l in lists:
    if "Sprint Backlog - SPRINT 4" in l['name']:
        list_s4 = l
        break

if not list_s4:
    print("❌ Không tìm thấy danh sách 'Sprint Backlog - SPRINT 4'")
    sys.exit(1)

print(f"📋 Tìm thấy danh sách: {list_s4['name']} (ID: {list_s4['id']})")

# 2. Lấy danh sách labels
labels = trello_req(f"https://api.trello.com/1/boards/{BOARD_ID}/labels") or []
label_map = {lb['name']: lb['id'] for lb in labels if lb.get('name')}
print(f"🏷️  Các nhãn hiện có: {list(label_map.keys())}")

label_s4_id = label_map.get('Sprint 4')
label_be_id = label_map.get('Backend')
label_fe_id = label_map.get('Frontend')
label_core_id = label_map.get('Core / Urgent')

# 3. Lấy các thẻ hiện có trong list Sprint 4
cards = list_s4.get('cards', [])
print(f"📦 Hiện có {len(cards)} thẻ trong Sprint 4:")

# 4. Rà soát thẻ cũ:
# Các thẻ loại bỏ: charter, cargo, support, mobile-first
out_of_scope_keywords = ['Hợp đồng', 'Thuê xe', 'Bưu kiện', 'hàng hóa', 'Hỗ trợ Khẩn cấp', 'Mobile-First', 'charter', 'cargo']

for c in cards:
    name = c['name']
    should_archive = any(kw.lower() in name.lower() for kw in out_of_scope_keywords)
    if should_archive:
        print(f"   🗑️ Đóng/Archive thẻ ngoài phạm vi: {name[:50]}...")
        trello_req(f"https://api.trello.com/1/cards/{c['id']}", method='PUT', data={'closed': 'true'})
        time.sleep(0.3)
    else:
        print(f"   ⭐ Giữ lại thẻ phù hợp: {name[:50]}...")

# 5. Danh mục 8 thẻ chuẩn hóa Sprint 4 Backlog
TARGET_CARDS = [
    {
        'code': '[S401]',
        'name': '[Ưu tiên: 1] [4 SP] [S401][CORE] Đồng bộ Khóa ghế Concurrency Lock 10:00 & Giữ chỗ Real-time SSE',
        'desc': '### MỤC TIÊU NGHIỆP VỤ & KỸ THUẬT:\n- Đồng bộ hóa trạng thái khóa ghế 10 phút thời gian thực qua Server-Sent Events (SSE).\n- Ngăn chặn hoàn toàn rủi ro trùng vé khi 2 người cùng đặt 1 ghế tại cùng thời điểm.\n- Bảo lưu giữ chỗ bền vững 10 phút khi người dùng điều hướng sang trang khác hoặc checkout quay lại.\n- Hiển thị đồng hồ đếm ngược giữ chỗ và nút "Tiếp tục đặt vé".\n\n### CHECKLIST NGHIỆM THU (DoD):\n- [x] Khóa ghế đồng thời qua Redis / Pessimistic Concurrency Lock trên Supabase.\n- [x] SSE broadcast sự kiện SEAT_LOCKED và SEAT_RELEASED ngay tức thì.\n- [x] Giao diện đổi màu Vàng (Đang giữ chỗ) trên các tab khác.\n- [x] Kiểm thử hồi quy đặt vé đa luồng thành công 100%.',
        'sp': 4,
        'member': MEMBER_IDS['phong'],
        'labels': [label_s4_id, label_be_id, label_core_id]
    },
    {
        'code': '[S402]',
        'name': '[Ưu tiên: 1] [3 SP] [S402][MAIL] Dịch vụ Email Tự Động Phê Duyệt Hồ Sơ Đối Tác & Cấp Phát Tài Khoản B2B (/company/login)',
        'desc': '### MỤC TIÊU NGHIỆP VỤ & KỸ THUẬT:\n- Gửi email HTML chuẩn nhận diện thương hiệu TravelEasy khi Admin phê duyệt hoặc từ chối hồ sơ nhà xe.\n- Tự động cấp phát tài khoản ROLE_OPERATOR, gán busCompanyId và cấp mật khẩu khởi tạo ngẫu nhiên, rõ ràng.\n- Bàn giao đường dẫn đăng nhập Cổng Điều Hành Nhà Xe (/company/login).\n- Hỗ trợ biến môi trường APP_FRONTEND_URL linh hoạt cho môi trường VPS và Production.\n\n### CHECKLIST NGHIỆM THU (DoD):\n- [x] Tích hợp spring-boot-starter-mail và Google SMTP live.\n- [x] Template Email HTML đẹp mắt, chuẩn responsive.\n- [x] Mật khẩu khởi tạo in trực tiếp trong thư (không bị mơ hồ).\n- [x] Thử nghiệm gửi thực tế thành công tới đối tác.',
        'sp': 3,
        'member': MEMBER_IDS['thanh'],
        'labels': [label_s4_id, label_be_id, label_core_id]
    },
    {
        'code': '[S403]',
        'name': '[Ưu tiên: 1] [4 SP] [S403][DEVOPS] Đóng Gói Docker Compose Production & Triển Khai CI/CD Lên VPS Thực Tế (103.72.57.149)',
        'desc': '### MỤC TIÊU NGHIỆP VỤ & KỸ THUẬT:\n- Xây dựng file docker-compose.prod.yml tối ưu hóa cho môi trường VPS Ubuntu 24.04 (103.72.57.149).\n- Cấu hình Nginx Reverse Proxy phục vụ Frontend cổng 80 chuẩn và điều hướng ngầm /api/ về Spring Boot 8080.\n- Kết nối trực tiếp Supabase Cloud PostgreSQL và PayOS.\n- Tự động hóa quy trình CI/CD khi push code lên nhánh dev/main.\n\n### CHECKLIST NGHIỆM THU (DoD):\n- [x] Viết docker-compose.prod.yml chuẩn Production.\n- [x] Dọn dẹp ổ đĩa VPS giải phóng 10GB dung lượng trống.\n- [x] Khởi chạy thành công 2 container traveleasy-backend và traveleasy-frontend.\n- [x] Truy cập Web qua IP VPS http://103.72.57.149 thành công.',
        'sp': 4,
        'member': MEMBER_IDS['thanh'],
        'labels': [label_s4_id, label_be_id, label_core_id]
    },
    {
        'code': '[S404]',
        'name': '[Ưu tiên: 2] [4 SP] [S404][POS] Giao diện & API Bán Vé Nhanh Tại Quầy Bến Xe POS (/company/pos) & In Vé Nhiệt 80mm',
        'desc': '### MỤC TIÊU NGHIỆP VỤ & KỸ THUẬT:\n- Phân hệ bán vé quầy POS siêu tốc cho nhân viên nhà xe tại bến xe (BXMĐ, BXMT, Mỹ Đình).\n- Hỗ trợ phím tắt F1-F9, xuất vé dưới 10 giây.\n- In hóa đơn nhiệt 80mm có mã QR bảo mật để tài xế quét soát vé.\n- Đồng bộ lập tức trạng thái ghế sang ĐÃ BÁN trên Web/App khách.\n\n### CHECKLIST NGHIỆM THU (DoD):\n- [ ] Giao diện POS gọn gàng, hỗ trợ thao tác nhanh.\n- [ ] Lệnh in hóa đơn nhiệt nhả vé chuẩn 80mm.\n- [ ] Khóa ghế đồng thời tức thì.',
        'sp': 4,
        'member': MEMBER_IDS['phong'],
        'labels': [label_s4_id, label_fe_id, label_be_id]
    },
    {
        'code': '[S405]',
        'name': '[Ưu tiên: 2] [3 SP] [S405][POS-SHIFTS] Quản Lý Ca Trực & Bàn Giao Tiền Mặt Quầy Bến Xe (/company/pos/shifts)',
        'desc': '### MỤC TIÊU NGHIỆP VỤ & KỸ THUẬT:\n- Quản lý đóng/mở ca trực quầy vé cho nhân viên bán vé của nhà xe.\n- Khởi tạo số tiền lẻ đầu ca trực.\n- Thống kê tổng tiền mặt thu được trong ca, xuất phiếu Z-Report cuối ca nộp thủ quỹ.\n\n### CHECKLIST NGHIỆM THU (DoD):\n- [ ] Modal mở ca nhập tiền lẻ đầu ca.\n- [ ] Thống kê số vé bán và tổng tiền mặt theo ca.\n- [ ] Phiếu chốt ca Z-Report đối soát minh bạch.',
        'sp': 3,
        'member': MEMBER_IDS['phat'],
        'labels': [label_s4_id, label_fe_id, label_be_id]
    },
    {
        'code': '[S406]',
        'name': '[Ưu tiên: 2] [4 SP] [S406][TRACKING] Bản Đồ Định Vị GPS Live Tracking Xe Chạy Thời Gian Thực (/tracking/:tripId)',
        'desc': '### MỤC TIÊU NGHIỆP VỤ & KỸ THUẬT:\n- Bản đồ tương tác Leaflet hiển thị tuyến đường và icon xe di chuyển thời gian thực.\n- Server-Sent Events (SSE) đẩy tọa độ định kỳ 1 giây về trình duyệt hành khách.\n- Dự tính thời gian xe đến đón (ETA) tại các điểm đón/trả.\n\n### CHECKLIST NGHIỆM THU (DoD):\n- [ ] Tích hợp bản đồ vệ tinh / vector Leaflet.\n- [ ] SSE stream tọa độ xe mượt mà.\n- [ ] Hiển thị thông tin chuyến xe và tài xế.',
        'sp': 4,
        'member': MEMBER_IDS['cuong'],
        'labels': [label_s4_id, label_fe_id]
    },
    {
        'code': '[S407]',
        'name': '[Ưu tiên: 2] [3 SP] [S407][PRICING] Phân Hệ Quản Trị Giá Vé Động & Phụ Thu Lễ Tết/Cuối Tuần (/company/pricing-rules)',
        'desc': '### MỤC TIÊU NGHIỆP VỤ & KỸ THUẬT:\n- Cho phép nhà xe thiết lập quy tắc giá vé linh hoạt: Phụ thu cao điểm Lễ Tết (+20%) hoặc giảm giá giờ chót (-15%).\n- Tự động áp dụng giá vé tính toán khi hành khách tra cứu chuyến.\n\n### CHECKLIST NGHIỆM THU (DoD):\n- [ ] Bảng cấu hình quy tắc phụ thu/giảm giá.\n- [ ] Động cơ tính giá vé động theo thời gian thực.\n- [ ] Thông báo chi tiết phụ thu trên giao diện thanh toán.',
        'sp': 3,
        'member': MEMBER_IDS['duc'],
        'labels': [label_s4_id, label_fe_id, label_be_id]
    },
    {
        'code': '[S408]',
        'name': '[Ưu tiên: 1] [3 SP] [S408][DEMO-DEFENSE] Xây Dựng Trung Tâm Trình Diễn Demo Hub 15 Phút (/demo) & Slide Bảo Vệ OJT',
        'desc': '### MỤC TIÊU NGHIỆP VỤ & KỸ THUẬT:\n- Trang Demo Hub (/demo) hỗ trợ chuyển nhanh giữa các phân hệ phục vụ Hội đồng chấm thi.\n- Kiểm tra trạng thái hệ thống (Health Check, DB pool, Memory).\n- Slide thuyết trình 25 trang chuẩn nhận diện thương hiệu TravelEasy.\n- Kịch bản bảo vệ 15 phút chi tiết từng giây cho 5 thành viên.\n\n### CHECKLIST NGHIỆM THU (DoD):\n- [x] Hoàn thiện giao diện và API Demo Hub /demo.\n- [x] Dữ liệu mẫu sẵn sàng cho toàn bộ luồng demo.\n- [x] Kịch bản phân vai RACI 15 phút hoàn chỉnh.',
        'sp': 3,
        'member': MEMBER_IDS['thanh'],
        'labels': [label_s4_id, label_core_id]
    }
]

# 6. Kiểm tra và cập nhật/tạo các thẻ chuẩn
# Lấy lại danh sách thẻ mở trong list Sprint 4
cards_after_archive = trello_req(f"https://api.trello.com/1/lists/{list_s4['id']}/cards") or []
existing_codes = {}
for c in cards_after_archive:
    for tc in TARGET_CARDS:
        if tc['code'] in c['name']:
            existing_codes[tc['code']] = c
            break

print(f"\n🔄 Tiến hành cập nhật/tạo mới 8 thẻ chuẩn hóa Sprint 4:")
for tc in TARGET_CARDS:
    code = tc['code']
    if code in existing_codes:
        c = existing_codes[code]
        print(f"   ✏️ Cập nhật thẻ: {code} -> {c['name'][:40]}...")
        data = {
            'name': tc['name'],
            'desc': tc['desc']
        }
        trello_req(f"https://api.trello.com/1/cards/{c['id']}", method='PUT', data=data)
        # Gán member
        if tc['member']:
            trello_req(f"https://api.trello.com/1/cards/{c['id']}/idMembers", method='POST', data={'value': tc['member']})
        # Gán labels
        for lb in tc['labels']:
            if lb:
                trello_req(f"https://api.trello.com/1/cards/{c['id']}/idLabels", method='POST', data={'value': lb})
    else:
        print(f"   ➕ Tạo mới thẻ: {tc['name'][:50]}...")
        data = {
            'idList': list_s4['id'],
            'name': tc['name'],
            'desc': tc['desc'],
            'pos': 'bottom'
        }
        if tc['member']:
            data['idMembers'] = tc['member']
        new_card = trello_req("https://api.trello.com/1/cards", method='POST', data=data)
        if new_card and 'id' in new_card:
            for lb in tc['labels']:
                if lb:
                    trello_req(f"https://api.trello.com/1/cards/{new_card['id']}/idLabels", method='POST', data={'value': lb})
    time.sleep(0.4)

print("\n🎉 HOÀN TẤT ĐIỀU CHỈNH SPRINT 4 BACKLOG TRÊN TRELLO!")
