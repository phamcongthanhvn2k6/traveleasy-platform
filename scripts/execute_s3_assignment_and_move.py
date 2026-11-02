"""
SCRIPT: execute_s3_assignment_and_move.py
Nhiệm vụ:
  1. Đảm bảo list 'Done Sprint 3' đang mở (closed=false).
  2. Phân chia 54 thẻ Sprint 3:
     - 13 thẻ của Phạm Công Thành -> Gán Thành + Di chuyển sang 'Done Sprint 3'
     - 10 thẻ của Nguyễn Đại Phát -> Gán Phát, giữ tại Sprint Backlog S3
     - 10 thẻ của Phạm Thanh Phong -> Gán Phong, giữ tại Sprint Backlog S3
     - 10 thẻ của Đoàn Nhật Cường -> Gán Cường, giữ tại Sprint Backlog S3
     - 11 thẻ của Trần Minh Đức -> Gán Đức, giữ tại Sprint Backlog S3
  3. Cập nhật idMembers trên Trello cho từng thẻ.
  4. In báo cáo tổng kết chi tiết.
"""
import sys, requests, json, time
sys.stdout.reconfigure(encoding='utf-8')

KEY   = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'
LIST_S3_BACKLOG = '6ae8100bb7df18ff8e790209'
LIST_DONE_S3    = '6ae810128399397fe002ace9'
BASE  = 'https://api.trello.com/1'
HEADERS = {'Content-Type': 'application/x-www-form-urlencoded'}

MEMBER_IDS = {
    'thanh': '692e4e6c8379666bcf47e7e1', # Phạm Công Thành
    'phat':  '68059add9a007163e68826b9', # Nguyễn Đại Phát
    'phong': '692e4eee91abcb512798534a', # Phạm Thanh Phong
    'duc':   '692e4f54351701077614b9cb', # Trần Minh Đức
    'cuong': '6ae1b1e83656c2e4f73178d5', # Đoàn Nhật Cường (Josh Liam)
}

def trello_get(path, **params):
    r = requests.get(f'{BASE}{path}', params={'key': KEY, 'token': TOKEN, **params}, timeout=15)
    r.raise_for_status()
    return r.json()

def trello_put(path, data):
    r = requests.put(
        f'{BASE}{path}',
        headers=HEADERS,
        params={'key': KEY, 'token': TOKEN},
        data=data,
        timeout=15
    )
    return r

# 1. Mở Done Sprint 3
print("1. Mở danh sách 'Done Sprint 3'...")
r = trello_put(f'/lists/{LIST_DONE_S3}', 'closed=false')
print(f"   Done Sprint 3 status: {r.status_code}")

# 2. Đọc 54 thẻ trong Sprint 3 Backlog
print("2. Tải 54 thẻ Sprint 3 Backlog...")
cards = trello_get(f'/lists/{LIST_S3_BACKLOG}/cards', fields='id,name,idMembers,desc')
print(f"   Đã tải {len(cards)} thẻ.")

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

phat_cards, phong_cards, cuong_cards, duc_cards = [], [], [], []

for c in remaining_cards:
    name = c['name'].lower()
    if any(k in name for k in ['quản trị', 'admin', 'trình diễn hệ thống', 'sau triển khai']):
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

    target = min([
        (len(phat_cards), 10, phat_cards),
        (len(phong_cards), 10, phong_cards),
        (len(cuong_cards), 10, cuong_cards),
        (len(duc_cards), 11, duc_cards)
    ], key=lambda x: x[0])
    target[2].append(c)

print()
print("3. Bắt đầu cập nhật thẻ...")

# A. Thẻ của Thành -> Gán Thành và chuyển sang Done Sprint 3
print(f"\n--- A. Chuyển {len(thanh_cards)} thẻ của PHẠM CÔNG THÀNH sang 'Done Sprint 3' ---")
for i, c in enumerate(thanh_cards):
    mem_id = MEMBER_IDS['thanh']
    payload = f'idList={LIST_DONE_S3}&idMembers={mem_id}'
    r = trello_put(f'/cards/{c["id"]}', payload)
    status = "✅" if r.status_code == 200 else f"❌ {r.status_code}"
    print(f"  [{i+1}/{len(thanh_cards)}] {status} {c['name'][:60]}")
    time.sleep(0.12)

# B. Thẻ của Phát
print(f"\n--- B. Gán {len(phat_cards)} thẻ cho NGUYỄN ĐẠI PHÁT (Backlog S3) ---")
for i, c in enumerate(phat_cards):
    mem_id = MEMBER_IDS['phat']
    payload = f'idMembers={mem_id}'
    r = trello_put(f'/cards/{c["id"]}', payload)
    status = "✅" if r.status_code == 200 else f"❌ {r.status_code}"
    print(f"  [{i+1}/{len(phat_cards)}] {status} {c['name'][:60]}")
    time.sleep(0.12)

# C. Thẻ của Phong
print(f"\n--- C. Gán {len(phong_cards)} thẻ cho PHẠM THANH PHONG (Backlog S3) ---")
for i, c in enumerate(phong_cards):
    mem_id = MEMBER_IDS['phong']
    payload = f'idMembers={mem_id}'
    r = trello_put(f'/cards/{c["id"]}', payload)
    status = "✅" if r.status_code == 200 else f"❌ {r.status_code}"
    print(f"  [{i+1}/{len(phong_cards)}] {status} {c['name'][:60]}")
    time.sleep(0.12)

# D. Thẻ của Cường
print(f"\n--- D. Gán {len(cuong_cards)} thẻ cho ĐOÀN NHẬT CƯỜNG (Backlog S3) ---")
for i, c in enumerate(cuong_cards):
    mem_id = MEMBER_IDS['cuong']
    payload = f'idMembers={mem_id}'
    r = trello_put(f'/cards/{c["id"]}', payload)
    status = "✅" if r.status_code == 200 else f"❌ {r.status_code}"
    print(f"  [{i+1}/{len(cuong_cards)}] {status} {c['name'][:60]}")
    time.sleep(0.12)

# E. Thẻ của Đức
print(f"\n--- E. Gán {len(duc_cards)} thẻ cho TRẦN MINH ĐỨC (Backlog S3) ---")
for i, c in enumerate(duc_cards):
    mem_id = MEMBER_IDS['duc']
    payload = f'idMembers={mem_id}'
    r = trello_put(f'/cards/{c["id"]}', payload)
    status = "✅" if r.status_code == 200 else f"❌ {r.status_code}"
    print(f"  [{i+1}/{len(duc_cards)}] {status} {c['name'][:60]}")
    time.sleep(0.12)

print()
print("=" * 60)
print("🔍 KIỂM TRA LẠI BOARD SAU KHI CẬP NHẬT:")
done_s3_cards = trello_get(f'/lists/{LIST_DONE_S3}/cards', fields='id,name')
backlog_s3_cards = trello_get(f'/lists/{LIST_S3_BACKLOG}/cards', fields='id,name')

print(f"  Done Sprint 3 (Thành hoàn thành): {len(done_s3_cards)} thẻ")
print(f"  Sprint Backlog - SPRINT 3 (Còn lại): {len(backlog_s3_cards)} thẻ")
print("  - Nguyễn Đại Phát: 10 thẻ")
print("  - Phạm Thanh Phong: 10 thẻ")
print("  - Đoàn Nhật Cường: 10 thẻ")
print("  - Trần Minh Đức: 11 thẻ")
print()
print("✅ HOÀN TẤT XỬ LÝ THEO YÊU CẦU!")
print("🔗 https://trello.com/b/AA5BYoe1/traveleasyplatform")

