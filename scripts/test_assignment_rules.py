import sys, requests, json, re
sys.stdout.reconfigure(encoding='utf-8')

KEY   = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'
LIST_S3 = '6ae8100bb7df18ff8e790209'
BASE  = 'https://api.trello.com/1'

r = requests.get(f'{BASE}/lists/{LIST_S3}/cards', params={'key':KEY,'token':TOKEN, 'fields': 'id,name,idMembers,desc'})
cards = r.json()

print(f"Tổng cộng có {len(cards)} thẻ trong Sprint 3 Backlog.")

# Danh sách task rõ ràng của Thành (Kiến trúc, DevOps, Correlation Id, Runbook/Bàn giao, Seed Data, Security Library, Production Readiness)
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

def assign_member(card):
    name = card['name']
    desc = card.get('desc', '')
    combined = (name + ' ' + desc).lower()
    
    # Kiểm tra task của Thành trước
    for kw in THANH_KEYWORDS:
        if kw.lower() in name.lower():
            return 'thanh'
            
    # Kiểm tra theo mô tả có sẵn nếu đã ghi rõ
    if 'phạm công thành' in desc.lower() and 'người thực hiện: phạm công thành' in desc.lower():
        return 'thanh'
    if 'nguyễn đại phát' in desc.lower() or 'phát nguyễn' in desc.lower():
        return 'phat'
    if 'đoàn nhật cường' in desc.lower() or 'josh liam' in desc.lower():
        return 'cuong'
    if 'trần minh đức' in desc.lower() or 'minh đức trần' in desc.lower():
        return 'duc'
    if 'phạm thanh phong' in desc.lower():
        return 'phong'

    # Phân loại theo nghiệp vụ (Domain-based)
    # Admin / Đối soát / Chỉ số
    if any(k in combined for k in ['quản trị', 'admin', 'bảng điều khiển', 'đối soát', 'chỉ số']):
        return 'phat'
        
    # Mobile / Soát vé / Scanner / Camera / Ngoại tuyến
    if any(k in combined for k in ['soát vé', 'scanner', 'camera', 'ngoại tuyến', 'offline', 'thích ứng', 'di động']):
        return 'cuong'
        
    # Khách hàng / Đăng nhập / Profile / Vé của tôi / Hoàn tiền
    if any(k in combined for k in ['khách hàng', 'vé của tôi', 'hủy vé', 'hoàn tiền', 'hồ sơ', 'voucher', 'tiếp cận']):
        return 'duc'
        
    # Booking / Tìm chuyến / Chọn ghế / Khóa ghế / Thanh toán / API
    return 'phong'

counts = {'thanh': 0, 'phat': 0, 'phong': 0, 'duc': 0, 'cuong': 0}
thanh_cards = []
other_cards = []

for c in cards:
    assigned = assign_member(c)
    counts[assigned] += 1
    if assigned == 'thanh':
        thanh_cards.append(c)
    else:
        other_cards.append((c, assigned))

print()
print("=== PHÂN CHIA THẺ THEO THÀNH VIÊN ===")
print(f"  Phạm Công Thành (User): {counts['thanh']} thẻ (SẼ CHUYỂN SANG DONE SPRINT 3)")
print(f"  Nguyễn Đại Phát:        {counts['phat']} thẻ")
print(f"  Phạm Thanh Phong:       {counts['phong']} thẻ")
print(f"  Đoàn Nhật Cường:        {counts['cuong']} thẻ")
print(f"  Trần Minh Đức:          {counts['duc']} thẻ")
print(f"  Tổng:                   {sum(counts.values())} thẻ")

print()
print(f"Danh sách {len(thanh_cards)} thẻ của Phạm Công Thành sẽ chuyển sang Done Sprint 3:")
for i, c in enumerate(thanh_cards):
    print(f"  [{i+1:2d}] {c['name'][:75]}")

