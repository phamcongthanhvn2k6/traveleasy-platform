import sys, requests, json, time
sys.stdout.reconfigure(encoding='utf-8')

KEY   = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'
BOARD = 'AA5BYoe1'
BASE  = 'https://api.trello.com/1'

MEMBERS = {
    'thanh': '692e4e6c8379666bcf47e7e1', # Phạm Công Thành
    'phat':  '68059add9a007163e68826b9', # Nguyễn Đại Phát
    'phong': '692e4eee91abcb512798534a', # Phạm Thanh Phong
    'duc':   '692e4f54351701077614b9cb', # Trần Minh Đức
    'cuong': '6ae1b1e83656c2e4f73178d5', # Đoàn Nhật Cường
}

LABELS = {
    'sprint4': '6ae8b98c890dfea769e35d07',
    'backend': '6ada29757825b08b7f3cf963',
    'frontend': '6ada2975f9e7748cabcd7157',
    'fullstack': '6ada2976134cf5186e8c4d4f',
    'admin': '6ada297762b48680ef71bcd2',
    'company': '6ae8051fd10c9c805fd8de18',
    'customer': '6ada29776cd0ced0e1f3b2d1',
    'defense': '6ae805213c4b1ea77c7ac137',
    'urgent': '6ada2960151390fa06f05fa' if '6ada2960151390fa06f05fa' else '6ae8b98c890dfea769e35d07'
}

def trello_get(path, **params):
    r = requests.get(f'{BASE}{path}', params={'key': KEY, 'token': TOKEN, **params}, timeout=20)
    r.raise_for_status()
    return r.json()

def trello_post(path, data):
    r = requests.post(f'{BASE}{path}', params={'key': KEY, 'token': TOKEN}, data=data, timeout=20)
    r.raise_for_status()
    return r.json()

def trello_put(path, data):
    r = requests.put(f'{BASE}{path}', params={'key': KEY, 'token': TOKEN}, data=data, timeout=20)
    r.raise_for_status()
    return r.json()

# 1. Tìm hoặc tạo list 'Sprint Backlog - SPRINT 4'
print("1. Kiểm tra / Tạo danh sách 'Sprint Backlog - SPRINT 4'...")
all_lists = trello_get(f'/boards/{BOARD}/lists?filter=all')
s4_list = None
for l in all_lists:
    if 'SPRINT 4' in l['name'] and 'Backlog' in l['name']:
        s4_list = l
        break

if s4_list:
    s4_list_id = s4_list['id']
    print(f"-> Đã tìm thấy danh sách (ID: {s4_list_id}). Đang mở lại nếu bị đóng...")
    trello_put(f'/lists/{s4_list_id}', {'closed': 'false', 'pos': 3.85, 'name': 'Sprint Backlog - SPRINT 4'})
else:
    print("-> Đang tạo mới danh sách 'Sprint Backlog - SPRINT 4'...")
    res = trello_post(f'/boards/{BOARD}/lists', {
        'name': 'Sprint Backlog - SPRINT 4',
        'pos': 3.85
    })
    s4_list_id = res['id']
    print(f"-> Tạo thành công: {s4_list_id}")

# 2. Xóa hoặc dọn dẹp các thẻ cũ trong list S4 nếu có (tránh trùng lặp)
existing_cards = trello_get(f'/lists/{s4_list_id}/cards')
print(f"Số thẻ hiện có trong S4 list: {len(existing_cards)}")

# 3. Tạo thẻ SPRINT GOAL
goal_desc = """🎯 **MỤC TIÊU CỐT LÕI (SPRINT GOAL) SPRINT 4 (16/11 - 20/11/2026):**
> **"Ổn định toàn diện hệ thống, tối ưu hóa hiệu năng và sửa dứt điểm các lỗi tồn đọng để đảm bảo nền tảng TravelEasy vận hành trơn tru 100% phục vụ buổi báo cáo bảo vệ tốt nghiệp OJT (Thứ Sáu, 20/11/2026)."**

---

### 📊 THỐNG KÊ TỔNG QUAN SPRINT 4:
- **Tổng số task trong Sprint 4**: **19 Tasks** (16 task tối ưu/sửa lỗi mới + 3 task nợ cũ Sprint 3)
- **Tổng điểm Story Points**: **35 Story Points (SP)**
- **Thời gian thực hiện**: 16/11/2026 – 20/11/2026 (1 tuần nước rút)
- **Ngày bảo vệ D-Day**: Thứ Sáu, 20/11/2026

---

### 👥 BẢNG TỔNG KẾT ĐIỂM STORY POINTS MỖI THÀNH VIÊN SAU KHI HOÀN THÀNH:

| STT | Thành Viên | Username | Điểm Đã Tích Lũy (S1-S3) | Điểm Đảm Nhận Sprint 4 | TỔNG ĐIỂM SAU KHI XONG | Tỷ Lệ Đóng Góp |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | **Phạm Công Thành** | `@thanhphmcong1` | **179 SP** | **6 SP** (4 tasks) | **185 SP** | Xuất sắc / Leader |
| 2 | **Nguyễn Đại Phát** | `@phatnguyn146` | **72 SP** | **6 SP** (4 tasks) | **78 SP** | Xuất sắc / Fullstack |
| 3 | **Phạm Thanh Phong** | `@phmthanhphong17` | **44 SP** | **6 SP** (4 tasks) | **50 SP** | Tốt / Core Backend |
| 4 | **Trần Minh Đức** | `@minhdctrn13` | **33 SP** | **6 SP** (4 tasks) | **39 SP** | Tốt / Booking Flow |
| 5 | **Đoàn Nhật Cường** | `@joshliam` | **35 SP** | **11 SP** (6 tasks)* | **46 SP** | Tốt / Mobile & Safety |
| **TỔNG** | **TOÀN ĐỘI (5 TV)** | - | **363 SP** | **35 SP** | **398 SP** | **ĐẠT CHUẨN TỐT NGHIỆP** |

*\* Ghi chú của Đoàn Nhật Cường: 11 SP gồm 3 task nợ cũ Sprint 3 (8 SP: S315, S319, S320) + 3 task tối ưu mới (3 SP: S417, S418, S419).*

---

### 🛡️ 3 TIÊU CHÍ NGHIỆM THU SPRINT GOAL (DoD):
- [ ] 100% 19 tasks kỹ thuật chuyển sang trạng thái Done trước 12:00 ngày 20/11/2026.
- [ ] Không còn bất kỳ lỗi crash 500 nào trên toàn bộ 3 phân hệ (Customer, Operator, Admin).
- [ ] Dữ liệu ngày bảo vệ 20/11/2026 trên Supabase Cloud hiển thị đầy đủ 56 chuyến xe, vé mẫu và xe GPS sẵn sàng cho 15 phút thuyết trình.
"""

# Kiểm tra xem thẻ SPRINT GOAL đã có chưa
has_goal = any('SPRINT GOAL' in c['name'] for c in existing_cards)
if not has_goal:
    print("-> Đang tạo thẻ SPRINT GOAL...")
    card_goal = trello_post('/cards', {
        'idList': s4_list_id,
        'name': '🎯 [SPRINT GOAL] Sprint 4: Ổn Định Toàn Diện Hệ Thống, Tối Ưu Hóa & Sửa Lỗi Bảo Vệ OJT',
        'desc': goal_desc,
        'pos': 'top',
        'idLabels': f"{LABELS['sprint4']},{LABELS['defense']}"
    })
    # Add Checklist to Goal card
    cl = trello_post(f"/cards/{card_goal['id']}/checklists", {'name': 'Tiêu chí nghiệm thu Sprint Goal'})
    trello_post(f"/checklists/{cl['id']}/checkItems", {'name': 'Phạm Công Thành hoàn tất 4 task hạ tầng & bảo mật (S401 - S404: 6 SP)'})
    trello_post(f"/checklists/{cl['id']}/checkItems", {'name': 'Nguyễn Đại Phát hoàn tất 4 task Admin & Khuyến mại (S405 - S408: 6 SP)'})
    trello_post(f"/checklists/{cl['id']}/checkItems", {'name': 'Phạm Thanh Phong hoàn tất 4 task Backend & Cache (S409 - S412: 6 SP)'})
    trello_post(f"/checklists/{cl['id']}/checkItems", {'name': 'Trần Minh Đức hoàn tất 4 task Booking & Reviews (S413 - S416: 6 SP)'})
    trello_post(f"/checklists/{cl['id']}/checkItems", {'name': 'Đoàn Nhật Cường trả sạch 3 task nợ cũ & 3 task mới (11 SP)'})
    trello_post(f"/checklists/{cl['id']}/checkItems", {'name': 'Cơ sở dữ liệu Supabase ngày 20/11/2026 sẵn sàng cho buổi bảo vệ D-Day'})
    print("-> Tạo xong thẻ SPRINT GOAL!")
else:
    print("-> Thẻ SPRINT GOAL đã tồn tại. Đang cập nhật nội dung...")
    for c in existing_cards:
        if 'SPRINT GOAL' in c['name']:
            trello_put(f"/cards/{c['id']}", {'desc': goal_desc, 'pos': 'top'})
            break

# 4. Danh sách 16 tasks kỹ thuật mới cho Sprint 4
TASKS = [
    # Phạm Công Thành (4 tasks - 6 SP)
    {
        'code': 'S401', 'sp': 1, 'priority': 2, 'member': 'thanh', 'label': 'backend',
        'name': '[Ưu tiên: 2] [1 SP] [S401] Tối ưu hóa bundle Vite & Cấu hình nén Gzip/Brotli Frontend',
        'desc': '🎯 MỤC TIÊU:\n- Loại bỏ package thừa trong package.json, chia nhỏ chunk vendor trong vite.config.ts.\n- Tối ưu thời gian tải trang First Contentful Paint (FCP) dưới 1.2s.',
        'items': ['Chạy npx vite-bundle-visualizer phân tích bundle size', 'Cấu hình manualChunks cho react, lucide-react, leaflet', 'Kiểm tra điểm Lighthouse Performance đạt > 90']
    },
    {
        'code': 'S402', 'sp': 2, 'priority': 1, 'member': 'thanh', 'label': 'backend',
        'name': '[Ưu tiên: 1] [2 SP] [S402] Tối ưu timeout HikariCP Connection Pool & Graceful Shutdown Backend',
        'desc': '🎯 MỤC TIÊU:\n- Ngăn ngừa tình trạng rò rỉ connection PostgreSQL trên Supabase khi nhiều request đồng thời.\n- Đảm bảo Spring Boot giải phóng tài nguyên an toàn khi tắt ứng dụng.',
        'items': ['Cấu hình connectionTimeout: 20000ms, maxLifetime: 1800000ms', 'Thiết lập server.shutdown: graceful trong application.yml', 'Kiểm thử tải đồng thời không xuất hiện ngoại lệ Connection timeout']
    },
    {
        'code': 'S403', 'sp': 2, 'priority': 1, 'member': 'thanh', 'label': 'backend',
        'name': '[Ưu tiên: 1] [2 SP] [S403] Tối ưu bảo mật CORS, Content-Security-Policy & Rate Limiting IP',
        'desc': '🎯 MỤC TIÊU:\n- Khóa chặt origin CORS chỉ cho phép frontend domain và localhost.\n- Thêm Security Headers chống Clickjacking/XSS và chặn brute-force login.',
        'items': ['Cấu hình CorsConfigurationSource nghiêm ngặt trong SecurityConfig', 'Bổ sung X-Content-Type-Options: nosniff và X-Frame-Options: DENY', 'Tích hợp bộ lọc giới hạn 5 lần đăng nhập sai liên tiếp']
    },
    {
        'code': 'S404', 'sp': 1, 'priority': 2, 'member': 'thanh', 'label': 'backend',
        'name': '[Ưu tiên: 2] [1 SP] [S404] Tối ưu cơ chế Global Exception Handler & Standardized Response Body',
        'desc': '🎯 MỤC TIÊU:\n- Bắt trọn vẹn MethodArgumentNotValidException và DataIntegrityViolationException.\n- Trả về cấu trúc JSON đồng nhất { success: false, message, code, timestamp } cho client.',
        'items': ['Bổ sung handler cho lỗi ConstraintViolationException trong GlobalExceptionHandler', 'Chuẩn hóa mã lỗi tiếng Việt dễ hiểu cho người dùng', 'Kiểm thử API trả về mã lỗi 400 chuẩn format khi dữ liệu gửi lên không hợp lệ']
    },

    # Nguyễn Đại Phát (4 tasks - 6 SP)
    {
        'code': 'S405', 'sp': 2, 'priority': 1, 'member': 'phat', 'label': 'admin',
        'name': '[Ưu tiên: 1] [2 SP] [S405] Tối ưu bộ lọc tìm kiếm & Phân trang Server-side tại Admin Trips',
        'desc': '🎯 MỤC TIÊU:\n- Tối ưu AdminTripsPage.tsx và AdminBookingsPage.tsx lọc nhanh theo nhà xe, tuyến đường và ngày xuất bến.\n- Giữ nguyên bộ lọc khi chuyển trang mà không reload lại toàn trang.',
        'items': ['Nối query parameters với URL params để lưu trạng thái bộ lọc', 'Tối ưu component Pagination hiển thị trang đầu, trang cuối mượt mà', 'Kiểm tra tốc độ render khi lọc trong danh sách 200 bản ghi']
    },
    {
        'code': 'S406', 'sp': 1, 'priority': 2, 'member': 'phat', 'label': 'admin',
        'name': '[Ưu tiên: 2] [1 SP] [S406] Sửa lỗi hiển thị & Hoàn thiện bảng biến động số dư hoàn tiền',
        'desc': '🎯 MỤC TIÊU:\n- Hiển thị chính xác tỷ lệ khấu trừ (10%, 30%, 100%) tại CancellationRefundPage.tsx.\n- Cập nhật số tiền hoàn thực tế và trạng thái REFUNDED minh bạch.',
        'items': ['Bảng hiển thị đầy đủ: Số tiền gốc, phí phạt hủy, số tiền hoàn lại', 'Nút "Xác nhận chuyển khoản hoàn tiền" cập nhật trạng thái tức thì', 'Ghi nhật ký biến động số dư ví đối tác tương ứng']
    },
    {
        'code': 'S407', 'sp': 2, 'priority': 1, 'member': 'phat', 'label': 'admin',
        'name': '[Ưu tiên: 1] [2 SP] [S407] Tối ưu UX/UI form nhập Voucher khuyến mại & Bổ sung Validation mã',
        'desc': '🎯 MỤC TIÊU:\n- Tự động convert mã voucher thành chữ in hoa khi người dùng gõ.\n- Kiểm tra điều kiện giá trị đơn tối thiểu (min_order_value) trước khi áp dụng voucher.',
        'items': ['Input auto-uppercase và loại bỏ khoảng trắng thừa', 'Hiển thị toast cảnh báo màu cam nếu giá trị đơn chưa đạt mức tối thiểu', 'Validate ngày hết hạn không được nhỏ hơn ngày bắt đầu tại form tạo voucher Admin']
    },
    {
        'code': 'S408', 'sp': 1, 'priority': 2, 'member': 'phat', 'label': 'admin',
        'name': '[Ưu tiên: 2] [1 SP] [S408] Sửa lỗi hiển thị & Tối ưu Responsive Dashboard Thống kê Admin',
        'desc': '🎯 MỤC TIÊU:\n- Căn chỉnh biểu đồ doanh thu Recharts tại AdminDashboardPage.tsx không bị tràn viền trên màn hình iPad/Tablet.',
        'items': ['Thêm ResponsiveContainer của Recharts với width="100%" và aspect ratio phù hợp', 'Kiểm thử giao diện Dashboard trên kích thước màn hình 768px và 1024px', 'Định dạng số tiền VNĐ chuẩn phân cách dấu chấm (VD: 1.250.000 đ)']
    },

    # Phạm Thanh Phong (4 tasks - 6 SP)
    {
        'code': 'S409', 'sp': 2, 'priority': 1, 'member': 'phong', 'label': 'backend',
        'name': '[Ưu tiên: 1] [2 SP] [S409] Tối ưu thời gian phản hồi API tìm chuyến bằng Redis Cache',
        'desc': '🎯 MỤC TIÊU:\n- Cache kết quả tìm kiếm các tuyến xe trọng điểm với TTL 60 giây.\n- Tự động xóa cache (@CacheEvict) khi nhà xe thêm chuyến hoặc có vé mới được đặt.',
        'items': ['Gắn annotation @Cacheable(value="trips_search", key="#searchDto") vào TripService', 'Cấu hình RedisCacheManager với TTL 60s', 'Đo đạc response time giảm từ 250ms xuống < 30ms khi cache hit']
    },
    {
        'code': 'S410', 'sp': 2, 'priority': 1, 'member': 'phong', 'label': 'backend',
        'name': '[Ưu tiên: 1] [2 SP] [S410] Xử lý ngoại lệ tranh chấp ghế trả về HTTP 409 Conflict rõ ràng',
        'desc': '🎯 MỤC TIÊU:\n- Bắt lỗi tranh chấp ghế đồng thời (Race Condition), trả về HTTP status 409 Conflict chuẩn xác.',
        'items': ['Bắt ngoại lệ OptimisticLockingFailureException và CustomSeatHoldException', 'Trả về HTTP 409 với message: "Ghế này vừa được chọn bởi khách hàng khác"', 'Frontend bắt mã 409 hiển thị toast thông báo thân thiện']
    },
    {
        'code': 'S411', 'sp': 1, 'priority': 2, 'member': 'phong', 'label': 'company',
        'name': '[Ưu tiên: 2] [1 SP] [S411] Tối ưu form bán vé quầy POS: Tự tính tiền thối & Phím tắt nhanh',
        'desc': '🎯 MỤC TIÊU:\n- Hỗ trợ nhân viên bến xe bán vé tốc hành dưới 10 giây tại PosTerminalPage.tsx.',
        'items': ['Ô nhập "Tiền khách đưa" tự động tính số tiền thừa thối lại', 'Hỗ trợ phím tắt Enter để chốt vé và gọi lệnh in', 'Kiểm tra in vé nhiệt 80mm hiển thị rõ mã QR và tên hành khách']
    },
    {
        'code': 'S412', 'sp': 1, 'priority': 2, 'member': 'phong', 'label': 'backend',
        'name': '[Ưu tiên: 2] [1 SP] [S412] Tối ưu câu SQL tìm chuyến: Khử triệt để N+1 Queries bằng @EntityGraph',
        'desc': '🎯 MỤC TIÊU:\n- Nạp sẵn thông tin busCompany và route trong 1 câu SQL duy nhất khi query chuyến xe.\n- Giảm số lượng truy vấn database từ N+1 xuống 1 câu lệnh.',
        'items': ['Thêm @EntityGraph(attributePaths = {"busCompany", "route"}) vào TripRepository', 'Bật Hibernate SQL Logging kiểm tra số lượng câu SELECT được thực thi', 'Xác nhận loại bỏ hoàn toàn các câu query lặp tìm hãng xe']
    },

    # Trần Minh Đức (4 tasks - 6 SP)
    {
        'code': 'S413', 'sp': 2, 'priority': 1, 'member': 'duc', 'label': 'customer',
        'name': '[Ưu tiên: 1] [2 SP] [S413] Tối ưu luồng Đổi vé (TicketExchangePage): Validate & Phụ thu',
        'desc': '🎯 MỤC TIÊU:\n- Tính toán chính xác số tiền phụ thu khi đổi từ xe thường sang xe VIP.\n- Trả lại ghế cũ về trạng thái AVAILABLE ngay lập tức sau khi đổi vé thành công.',
        'items': ['API kiểm tra chênh lệch giá vé và yêu cầu thanh toán phụ thu', 'Cập nhật sơ đồ ghế của cả 2 chuyến xe liên quan', 'Lưu nhật ký đổi vé trong bảng ticket_exchange_logs']
    },
    {
        'code': 'S414', 'sp': 1, 'priority': 2, 'member': 'duc', 'label': 'customer',
        'name': '[Ưu tiên: 2] [1 SP] [S414] Sửa lỗi đồng bộ đăng nhập Header & Tự ẩn banner khi hết giờ',
        'desc': '🎯 MỤC TIÊU:\n- Đồng bộ trạng thái đăng nhập giữa các tab qua storage event.\n- Tự động ẩn thanh thông báo nhắc nhở khởi hành màu vàng nếu chuyến xe đã quá giờ xuất bến.',
        'items': ['Lắng nghe window.addEventListener("storage") để cập nhật auth state', 'So sánh departure_time của vé với new Date() hiện tại', 'Ẩn banner nhắc nhở nếu thời gian khởi hành đã trôi qua']
    },
    {
        'code': 'S415', 'sp': 2, 'priority': 1, 'member': 'duc', 'label': 'customer',
        'name': '[Ưu tiên: 1] [2 SP] [S415] Tối ưu hiển thị chi tiết vé & In vé PDF/SVG mã QR trên di động',
        'desc': '🎯 MỤC TIÊU:\n- Tối ưu trang MyTicketsPage.tsx hiển thị mã QR chuẩn SVG có độ tương phản cao.\n- Căn chỉnh layout xem vé trên điện thoại không bị tràn viền.',
        'items': ['Mã QR render chuẩn kích thước 200x200px với mã hash bảo mật', 'Bổ sung nút tải ảnh vé về máy hoặc in ấn di động', 'Responsive hoàn hảo trên màn hình iPhone / Android']
    },
    {
        'code': 'S416', 'sp': 1, 'priority': 2, 'member': 'duc', 'label': 'customer',
        'name': '[Ưu tiên: 2] [1 SP] [S416] Tối ưu UI/UX bảng Reviews: Lọc sao, ẩn fake review & Nhãn xác thực',
        'desc': '🎯 MỤC TIÊU:\n- Nâng cấp trang ReviewsPage.tsx thành trang phản hồi uy tín, chuẩn hóa nội dung cho buổi bảo vệ.',
        'items': ['Bộ lọc xem đánh giá theo số sao (Tất cả, 5 sao, 4 sao, 3 sao)', 'Gắn nhãn xanh "Khách đã hoàn thành chuyến đi" cho review có mã vé', 'Loại bỏ các bình luận thử nghiệm hoặc nội dung rác']
    },

    # Đoàn Nhật Cường (3 tasks mới - 3 SP)
    {
        'code': 'S417', 'sp': 1, 'priority': 2, 'member': 'cuong', 'label': 'customer',
        'name': '[Ưu tiên: 2] [1 SP] [S417] Sửa lỗi & Bổ sung Validation SĐT chuẩn VN (10 số) và Email',
        'desc': '🎯 MỤC TIÊU:\n- Chuẩn hóa form nhập thông tin hành khách tại PassengerInfoForm.tsx.',
        'items': ['Regex kiểm tra đầu số 03, 05, 07, 08, 09 và đủ đúng 10 chữ số', 'Hiển thị thông báo lỗi màu đỏ ngay dưới ô input khi người dùng gõ sai', 'Kiểm tra định dạng email hợp lệ trước khi cho phép bấm nút Thanh toán']
    },
    {
        'code': 'S418', 'sp': 1, 'priority': 2, 'member': 'cuong', 'label': 'customer',
        'name': '[Ưu tiên: 2] [1 SP] [S418] Tối ưu hiệu năng tải trang & Thêm Skeleton Loading tại TripSearch',
        'desc': '🎯 MỤC TIÊU:\n- Loại bỏ hiện tượng giật màn hình (Cumulative Layout Shift) khi tìm kiếm chuyến xe.',
        'items': ['Tạo component TripCardSkeleton với hiệu ứng shimmer bóng đổ', 'Hiển thị 3 thẻ skeleton trong lúc API đang fetch dữ liệu', 'Chuyển đổi mượt mà sang thẻ chuyến xe thật khi có dữ liệu']
    },
    {
        'code': 'S419', 'sp': 1, 'priority': 2, 'member': 'cuong', 'label': 'customer',
        'name': '[Ưu tiên: 2] [1 SP] [S419] Tối ưu bản đồ GPS: Nút "Tự động căn chỉnh xe về tâm" (Re-center)',
        'desc': '🎯 MỤC TIÊU:\n- Nâng cao trải nghiệm người dùng trên màn hình /tracking.',
        'items': ['Thêm nút floating action button định vị trên bản đồ Leaflet', 'Click nút sẽ gọi map.panTo(xePosition) đưa xe 51B-889.99 về chính giữa', 'Hiển thị tooltip hướng dẫn thân thiện khi hover']
    }
]

print(f"\n4. Đang đồng bộ {len(TASKS)} thẻ kỹ thuật lên danh sách Sprint Backlog - SPRINT 4...")
created_count = 0
for t in TASKS:
    # Check if card with this code already exists in S4 list
    card_exists = any(t['code'] in c['name'] for c in existing_cards)
    if not card_exists:
        labels_to_add = [LABELS['sprint4']]
        if t['label'] in LABELS:
            labels_to_add.append(LABELS[t['label']])
        
        member_id = MEMBERS.get(t['member'])
        card_data = {
            'idList': s4_list_id,
            'name': t['name'],
            'desc': t['desc'],
            'pos': 'bottom',
            'idLabels': ','.join(labels_to_add),
            'idMembers': member_id if member_id else ''
        }
        res = trello_post('/cards', card_data)
        cid = res['id']
        
        # Add Checklist
        cl = trello_post(f"/cards/{cid}/checklists", {'name': 'Checklist Nghiệm Thu (DoD)'})
        for item in t['items']:
            trello_post(f"/checklists/{cl['id']}/checkItems", {'name': item})
        
        created_count += 1
        print(f"  + Đã tạo thẻ: {t['code']} - {t['name'][:40]}... (Gán: {t['member'].upper()})")
        time.sleep(0.3)
    else:
        print(f"  ~ Thẻ {t['code']} đã tồn tại, bỏ qua.")

print(f"\n✅ HOÀN TẤT ĐỒNG BỘ TRELLO! Đã tạo mới {created_count} thẻ kỹ thuật + 1 thẻ SPRINT GOAL.")
