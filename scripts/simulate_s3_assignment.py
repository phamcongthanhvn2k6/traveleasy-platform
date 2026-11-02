import sys, requests, json, re
sys.stdout.reconfigure(encoding='utf-8')

KEY   = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'
LIST_S3 = '6ae8100bb7df18ff8e790209'
LIST_DONE_S3 = '6ae810128399397fe002ace9'
BASE  = 'https://api.trello.com/1'

MEMBERS = {
    'thanh': {'id': '692e4e6c8379666bcf47e7e1', 'name': 'Phạm Công Thành'},
    'phat':  {'id': '68059add9a007163e68826b9', 'name': 'Nguyễn Đại Phát'},
    'phong': {'id': '692e4eee91abcb512798534a', 'name': 'Phạm Thanh Phong'},
    'duc':   {'id': '692e4f54351701077614b9cb', 'name': 'Trần Minh Đức'},
    'cuong': {'id': '6ae1b1e83656c2e4f73178d5', 'name': 'Đoàn Nhật Cường'},
}

r = requests.get(f'{BASE}/lists/{LIST_S3}/cards', params={'key':KEY,'token':TOKEN, 'fields': 'id,name,idMembers,desc'})
cards = r.json()

def classify_card(name, desc):
    text = (name + ' ' + desc).lower()
    
    # 1. Thành (User): Kiến trúc, CI/CD, Correlation ID, Truy vết, Bàn giao, Runbook, Tài liệu kỹ thuật, Dữ liệu mẫu lặp lại, Sẵn sàng sản xuất, Seed data
    if any(k in text for k in [
        'truy vết', 'correlation', 'bàn giao vận hành', 'tài liệu kỹ thuật — kiến trúc',
        'sẵn sàng sản xuất', 'xác nhận phát hành', 'dữ liệu mẫu lặp lại', 'dữ liệu minh họa',
        'rà soát thư viện backend', 'rà soát thư viện giao diện', 'kiểm tra cấu hình backend',
        'hoàn thiện quy trình ci', 'kiểm thử tích hợp liên cổng'
    ]):
        return 'thanh'
    
    # 2. Phát: Quản trị, Admin, Báo cáo, Chỉ số, Doanh thu, Quyết toán, Đối soát
    if any(k in text for k in [
        'quản trị', 'admin', 'bảng điều khiển', 'đối soát', 'chỉ số', 'nhà xe đối tác',
        'dữ liệu quản trị'
    ]):
        return 'phat'
        
    # 3. Cường: Soát vé, Scanner, Camera, Ngoại tuyến, Offline, Responsive, Di động, Đánh giá, Lịch sử tra cứu, Giao diện thích ứng
    if any(k in text for k in [
        'soát vé', 'scanner', 'ngoại tuyến', 'offline', 'thích ứng', 'di động',
        'tốc độ giao diện', 'hướng dẫn sử dụng — khách hàng', 'đánh giá'
    ]):
        return 'cuong'
        
    # 4. Đức: Khách hàng, Đăng nhập, Đăng ký, Vé của tôi, Hủy vé, Hoàn tiền, Hồ sơ, Voucher, Thông báo lỗi giao diện
    if any(k in text for k in [
        'khách hàng', 'vé của tôi', 'hủy vé', 'hoàn tiền', 'hồ sơ', 'voucher',
        'thông báo lỗi', 'trải nghiệm đăng nhập'
    ]):
        return 'duc'
        
    # 5. Phong: Booking, Tìm chuyến, Chọn ghế, Khóa ghế, Thanh toán, API nhà xe, Cache, Hồi quy API
    return 'phong'

assignments = {'thanh': [], 'phat': [], 'phong': [], 'duc': [], 'cuong': []}

for c in cards:
    assigned_key = classify_card(c['name'], c.get('desc', ''))
    assignments[assigned_key].append(c)

print("=== PHÂN PHỐI DỰ KIẾN TRONG SPRINT 3 ===")
for k, card_list in assignments.items():
    print(f"  {MEMBERS[k]['name']}: {len(card_list)} thẻ")

print()
print("=== THẺ CỦA PHẠM CÔNG THÀNH (SẼ CHUYỂN SANG DONE SPRINT 3) ===")
for i, c in enumerate(assignments['thanh']):
    print(f"  [{i+1}] {c['name'][:70]}")

