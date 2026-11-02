import sys, requests, json
sys.stdout.reconfigure(encoding='utf-8')

KEY   = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'
LIST_S3 = '6ae8100bb7df18ff8e790209'
BASE  = 'https://api.trello.com/1'

r = requests.get(f'{BASE}/lists/{LIST_S3}/cards', params={'key':KEY,'token':TOKEN, 'fields': 'id,name,idMembers,desc'})
cards = r.json()

THANH_KEYWORDS = [
    'S414] Tăng khả năng truy vết',
    'S416] Hoàn thiện tài liệu kỹ thuật',
    'S421] Bàn giao vận hành',
    'S417] Chuẩn bị dữ liệu mẫu lặp lại',
    'S417] Hoàn thiện dữ liệu minh họa',
    'S413] Rà soát thư viện backend',
    'S413] Rà soát thư viện giao diện',
    'S422] Hoàn thiện sẵn sàng sản xuất',
    'S422] Hoàn thiện nghiệm thu giao diện',
    'S420] Xác nhận phát hành backend',
    'S316] Kiểm thử tích hợp liên cổng',
    'S316] Kiểm thử xuyên suốt đặt vé',
    'S408] Kiểm thử vận hành dữ liệu'
]

thanh_cards = []
remaining_cards = []

for c in cards:
    is_thanh = False
    for kw in THANH_KEYWORDS:
        if kw.lower() in c['name'].lower():
            is_thanh = True
            break
    if is_thanh:
        thanh_cards.append(c)
    else:
        remaining_cards.append(c)

print(f"Tổng số thẻ: {len(cards)}")
print(f"Thẻ của Thành (-> Done S3): {len(thanh_cards)}")
print(f"Thẻ còn lại trong Backlog S3: {len(remaining_cards)}")

# Chia đều remaining_cards cho 4 người:
# Phat: 10, Phong: 10, Cuong: 10, Duc: 11
phat_cards = []
phong_cards = []
cuong_cards = []
duc_cards = []

for c in remaining_cards:
    name = c['name'].lower()
    
    # Ưu tiên theo domain trước
    if any(k in name for k in ['quản trị', 'admin', 'dữ liệu minh họa', 'trình diễn hệ thống', 'sau triển khai']):
        if len(phat_cards) < 10:
            phat_cards.append(c)
            continue
            
    if any(k in name for k in ['soát vé', 'scanner', 'ngoại tuyến', 'thích ứng', 'di động', 'hướng dẫn sử dụng', 'đánh giá', 'tốc độ giao diện']):
        if len(cuong_cards) < 10:
            cuong_cards.append(c)
            continue
            
    if any(k in name for k in ['tiếp cận', 'thông báo lỗi', 'bằng chứng nghiệm thu', 'hồi quy giao diện', 'khách hàng', 'vé của tôi']):
        if len(duc_cards) < 11:
            duc_cards.append(c)
            continue

    if any(k in name for k in ['tìm chuyến', 'chọn ghế', 'khóa ghế', 'thanh toán', 'độ trễ backend', 'nhất quán bộ nhớ', 'đồng bộ lỗi']):
        if len(phong_cards) < 10:
            phong_cards.append(c)
            continue

    # Fallback để cân bằng số lượng
    target = min([
        (len(phat_cards), 10, phat_cards),
        (len(phong_cards), 10, phong_cards),
        (len(cuong_cards), 10, cuong_cards),
        (len(duc_cards), 11, duc_cards)
    ], key=lambda x: x[0])
    target[2].append(c)

print()
print("=== KẾT QUẢ CHIA ĐỀU BỔ SUNG ===")
print(f"  Phạm Công Thành  : {len(thanh_cards):2d} thẻ  (Chuyển sang Done Sprint 3)")
print(f"  Nguyễn Đại Phát  : {len(phat_cards):2d} thẻ  (Sprint Backlog S3)")
print(f"  Phạm Thanh Phong : {len(phong_cards):2d} thẻ  (Sprint Backlog S3)")
print(f"  Đoàn Nhật Cường  : {len(cuong_cards):2d} thẻ  (Sprint Backlog S3)")
print(f"  Trần Minh Đức    : {len(duc_cards):2d} thẻ  (Sprint Backlog S3)")
print(f"  Tổng cộng        : {len(thanh_cards)+len(phat_cards)+len(phong_cards)+len(cuong_cards)+len(duc_cards)} thẻ")

