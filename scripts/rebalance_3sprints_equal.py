"""
SCRIPT: rebalance_3sprints_equal.py
Mục tiêu: Chia đều 160 thẻ vào 3 Sprint (~53-54 thẻ/sprint)
  - Sprint 1 Done: 38 → thêm 15 thẻ từ đầu Sprint 3 → = 53 thẻ
  - Sprint 2 Done: 38 → thêm 15 thẻ từ Sprint 3 (tiếp theo) → = 53 thẻ
  - Sprint 3 Backlog: 84 → còn 54 thẻ

Strategy: Lấy 30 thẻ đầu tiên trong Sprint 3 backlog
  - 15 thẻ đầu → Done Sprint 1
  - 15 thẻ tiếp → Done Sprint 2
"""
import sys, requests, time
sys.stdout.reconfigure(encoding='utf-8')

KEY   = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'
BASE  = 'https://api.trello.com/1'
HEADERS = {'Content-Type': 'application/x-www-form-urlencoded'}

LIST_S3_BACKLOG = '6ae8100bb7df18ff8e790209'   # Sprint Backlog - SPRINT 3 (84 thẻ)
LIST_DONE_S1    = '6ae81053a0bcce0597b2503d'   # Done Sprint 1 (38 thẻ)
LIST_DONE_S2    = '6ae810124a6fcb3b47a9063a'   # Done Sprint 2 (38 thẻ)
LIST_DONE_S3    = '6ae810128399397fe002ace9'   # Done Sprint 3 (trống)

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

import re
def get_sp(desc):
    if not desc:
        return 3
    m = re.search(r'\*\*Story Points[:\*]*\s*(\d+)', desc, re.IGNORECASE)
    if m: return int(m.group(1))
    m = re.search(r'(\d+)\s*SP', desc, re.IGNORECASE)
    if m: return int(m.group(1))
    return 3

# ---- Đọc hiện trạng ----
print("📥 Đang tải dữ liệu hiện tại...")
s3_cards = trello_get(f'/lists/{LIST_S3_BACKLOG}/cards', fields='id,name,desc')
d1_cards = trello_get(f'/lists/{LIST_DONE_S1}/cards', fields='id,name,desc')
d2_cards = trello_get(f'/lists/{LIST_DONE_S2}/cards', fields='id,name,desc')

total = len(s3_cards) + len(d1_cards) + len(d2_cards)
print(f"  Tổng: {total} thẻ")
print(f"  Done Sprint 1: {len(d1_cards)} thẻ")
print(f"  Done Sprint 2: {len(d2_cards)} thẻ")
print(f"  Sprint 3 Backlog: {len(s3_cards)} thẻ")

# ---- Tính số thẻ cần chia ----
target_per = total // 3          # = 53
target_last = total - target_per * 2  # = 54 (sprint 3)

need_s1 = target_per - len(d1_cards)  # = 53 - 38 = 15
need_s2 = target_per - len(d2_cards)  # = 53 - 38 = 15
s3_keep  = len(s3_cards) - need_s1 - need_s2

print()
print(f"📊 MỤC TIÊU: {target_per} thẻ/sprint (Sprint 1, 2), {target_last} thẻ (Sprint 3)")
print(f"  Cần chuyển từ S3 → Done Sprint 1: {need_s1} thẻ")
print(f"  Cần chuyển từ S3 → Done Sprint 2: {need_s2} thẻ")
print(f"  Sprint 3 giữ lại: {s3_keep} thẻ")

# Lấy các thẻ cần chuyển (từ đầu danh sách Sprint 3)
# Lấy các thẻ CUỐI danh sách S3 (thẻ S4 cũ, dễ nhận biết) để chuyển vào Done
# Đây là các thẻ vừa được thêm vào (từ S4 cũ), ưu tiên lấy chúng ra Done S1/S2
to_s1 = s3_cards[:need_s1]           # 15 thẻ đầu → Done Sprint 1
to_s2 = s3_cards[need_s1:need_s1+need_s2]  # 15 thẻ tiếp → Done Sprint 2

print()
print("=== THẺ SẼ CHUYỂN VÀO DONE SPRINT 1 ===")
for i, c in enumerate(to_s1):
    print(f"  [{i+1}] {c['name'][:70]}")

print()
print("=== THẺ SẼ CHUYỂN VÀO DONE SPRINT 2 ===")
for i, c in enumerate(to_s2):
    print(f"  [{i+1}] {c['name'][:70]}")

print()
print("🚀 Bắt đầu chuyển thẻ → Done Sprint 1...")
ok1, err1 = 0, 0
for i, card in enumerate(to_s1):
    r = trello_put(f'/cards/{card["id"]}', f'idList={LIST_DONE_S1}')
    if r.status_code == 200:
        ok1 += 1
        print(f"  [{i+1}/{len(to_s1)}] ✅ {card['name'][:60]}")
    else:
        err1 += 1
        print(f"  [{i+1}/{len(to_s1)}] ❌ {r.status_code}: {card['name'][:50]}")
    time.sleep(0.12)

print()
print("🚀 Bắt đầu chuyển thẻ → Done Sprint 2...")
ok2, err2 = 0, 0
for i, card in enumerate(to_s2):
    r = trello_put(f'/cards/{card["id"]}', f'idList={LIST_DONE_S2}')
    if r.status_code == 200:
        ok2 += 1
        print(f"  [{i+1}/{len(to_s2)}] ✅ {card['name'][:60]}")
    else:
        err2 += 1
        print(f"  [{i+1}/{len(to_s2)}] ❌ {r.status_code}: {card['name'][:50]}")
    time.sleep(0.12)

# ---- Verify ----
print()
print("🔍 Đang kiểm tra kết quả...")
s3_final = trello_get(f'/lists/{LIST_S3_BACKLOG}/cards', fields='id,name,desc')
d1_final = trello_get(f'/lists/{LIST_DONE_S1}/cards', fields='id,name,desc')
d2_final = trello_get(f'/lists/{LIST_DONE_S2}/cards', fields='id,name,desc')

sp1 = sum(get_sp(c.get('desc','')) for c in d1_final)
sp2 = sum(get_sp(c.get('desc','')) for c in d2_final)
sp3 = sum(get_sp(c.get('desc','')) for c in s3_final)

print()
print("=" * 60)
print("🏆 KẾT QUẢ CUỐI CÙNG — 3 SPRINT CÂN ĐỐI:")
print(f"  ✅ Sprint 1 (DONE)     : {len(d1_final):3d} thẻ — {sp1:4d} SP")
print(f"  ✅ Sprint 2 (DONE)     : {len(d2_final):3d} thẻ — {sp2:4d} SP")
print(f"  🔵 Sprint 3 (Đang làm) : {len(s3_final):3d} thẻ — {sp3:4d} SP")
print(f"  {'─'*46}")
total_f = len(d1_final)+len(d2_final)+len(s3_final)
total_sp = sp1+sp2+sp3
print(f"  TỔNG                  : {total_f:3d} thẻ — {total_sp:4d} SP")
print()

# Kiểm tra cân đối
max_diff = max(len(d1_final),len(d2_final),len(s3_final)) - min(len(d1_final),len(d2_final),len(s3_final))
if max_diff <= 2:
    print("✅ CÂN ĐỐI TỐT! Chênh lệch tối đa chỉ", max_diff, "thẻ giữa các sprint.")
else:
    print(f"⚠️  Chênh lệch {max_diff} thẻ — có thể cần điều chỉnh thêm.")

print()
print(f"🔗 https://trello.com/b/AA5BYoe1/traveleasyplatform")

