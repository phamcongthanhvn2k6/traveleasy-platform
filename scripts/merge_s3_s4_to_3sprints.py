"""
SCRIPT: merge_s3_s4_to_3sprints.py
Mục tiêu: Gộp Sprint 4 (44 thẻ) vào Sprint 3 (40 thẻ) → 1 Sprint 3 duy nhất với 84 thẻ
Đồng thời:
  - Đổi tên list "Sprint Backlog - SPRINT 4" → "Sprint Backlog - SPRINT 3 (Phần 2)" để hiển thị rõ
  - Đổi tên "Done Sprint 4" → "Done Sprint 3" (nếu cần)
  - Tính và in Story Points từng sprint

Sau khi chạy:
  - Done Sprint 1: 38 thẻ (DONE - không đổi)
  - Done Sprint 2: 38 thẻ (DONE - không đổi)
  - Sprint Backlog - SPRINT 3: 84 thẻ (đang làm, chứa cả S3+S4 cũ)
"""
import sys, requests, json, time
sys.stdout.reconfigure(encoding='utf-8')

KEY   = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'
BOARD = 'AA5BYoe1'
BASE  = 'https://api.trello.com/1'
HEADERS = {'Content-Type': 'application/x-www-form-urlencoded'}

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

# ============ LIST IDs (từ lần check trước) ============
LIST_S3_BACKLOG = '6ae8100bb7df18ff8e790209'   # Sprint Backlog - SPRINT 3 (40 thẻ)
LIST_S4_BACKLOG = '6ae81011b079250c3fdf6bc0'   # Sprint Backlog - SPRINT 4 (44 thẻ)
LIST_DONE_S1    = '6ae81053a0bcce0597b2503d'   # Done Sprint 1 (38 thẻ)
LIST_DONE_S2    = '6ae810124a6fcb3b47a9063a'   # Done Sprint 2 (38 thẻ)
LIST_DONE_S3    = '6ae810128399397fe002ace9'   # Done Sprint 3 (trống)
LIST_DONE_S4    = '6ae810133cffecec9ae9a6d0'   # Done Sprint 4 (trống)

# ============ Hàm tính SP từ description ============
import re
def get_sp(desc):
    """Lấy story point từ description thẻ (tìm pattern số SP)"""
    if not desc:
        return 3
    m = re.search(r'\*\*Story Points[:\*]*\s*(\d+)', desc, re.IGNORECASE)
    if m:
        return int(m.group(1))
    m = re.search(r'SP[:\s]*(\d+)', desc, re.IGNORECASE)
    if m:
        return int(m.group(1))
    m = re.search(r'(\d+)\s*SP', desc, re.IGNORECASE)
    if m:
        return int(m.group(1))
    return 3  # default

# ============ BƯỚC 1: Đọc thẻ Sprint 3 và Sprint 4 ============
print("📥 Đang tải thẻ Sprint 3 Backlog...")
s3_cards = trello_get(f'/lists/{LIST_S3_BACKLOG}/cards', fields='id,name,desc')
print(f"   Sprint 3 Backlog: {len(s3_cards)} thẻ")

print("📥 Đang tải thẻ Sprint 4 Backlog...")
s4_cards = trello_get(f'/lists/{LIST_S4_BACKLOG}/cards', fields='id,name,desc')
print(f"   Sprint 4 Backlog: {len(s4_cards)} thẻ")

print("📥 Đang tải thẻ Done Sprint 1...")
d1_cards = trello_get(f'/lists/{LIST_DONE_S1}/cards', fields='id,name,desc')
print(f"   Done Sprint 1: {len(d1_cards)} thẻ")

print("📥 Đang tải thẻ Done Sprint 2...")
d2_cards = trello_get(f'/lists/{LIST_DONE_S2}/cards', fields='id,name,desc')
print(f"   Done Sprint 2: {len(d2_cards)} thẻ")

# ============ Tính SP ============
sp_s1 = sum(get_sp(c.get('desc','')) for c in d1_cards)
sp_s2 = sum(get_sp(c.get('desc','')) for c in d2_cards)
sp_s3_only = sum(get_sp(c.get('desc','')) for c in s3_cards)
sp_s4 = sum(get_sp(c.get('desc','')) for c in s4_cards)
sp_s3_merged = sp_s3_only + sp_s4

print()
print("=" * 60)
print("📊 STORY POINTS TRƯỚC KHI GỘP:")
print(f"  Sprint 1 (Done): {len(d1_cards)} thẻ — {sp_s1} SP")
print(f"  Sprint 2 (Done): {len(d2_cards)} thẻ — {sp_s2} SP")
print(f"  Sprint 3 Backlog: {len(s3_cards)} thẻ — {sp_s3_only} SP")
print(f"  Sprint 4 Backlog: {len(s4_cards)} thẻ — {sp_s4} SP")
print(f"  TỔNG: {len(d1_cards)+len(d2_cards)+len(s3_cards)+len(s4_cards)} thẻ — {sp_s1+sp_s2+sp_s3_only+sp_s4} SP")

print()
print("=" * 60)
print("🔄 KẾ HOẠCH SAU KHI GỘP (3 SPRINT):")
print(f"  Sprint 1 (Done): {len(d1_cards)} thẻ — {sp_s1} SP ✅")
print(f"  Sprint 2 (Done): {len(d2_cards)} thẻ — {sp_s2} SP ✅")
print(f"  Sprint 3 (Đang làm - gộp S3+S4): {len(s3_cards)+len(s4_cards)} thẻ — {sp_s3_merged} SP")
print()

# ============ BƯỚC 2: Di chuyển tất cả thẻ Sprint 4 → Sprint 3 ============
print("🚀 Bắt đầu chuyển thẻ Sprint 4 → Sprint 3...")
ok_count = 0
err_count = 0
for i, card in enumerate(s4_cards):
    r = trello_put(f'/cards/{card["id"]}', f'idList={LIST_S3_BACKLOG}')
    if r.status_code == 200:
        ok_count += 1
        print(f"  [{i+1}/{len(s4_cards)}] ✅ {card['name'][:60]}")
    else:
        err_count += 1
        print(f"  [{i+1}/{len(s4_cards)}] ❌ {card['name'][:60]} — {r.status_code}: {r.text[:100]}")
    time.sleep(0.12)  # Rate limit

print()
print(f"✅ Di chuyển xong: {ok_count}/{len(s4_cards)} thẻ thành công, {err_count} lỗi")

# ============ BƯỚC 3: Đổi tên list Sprint 4 Backlog ============
print()
print("📝 Đổi tên 'Sprint Backlog - SPRINT 4' → 'Archive - Sprint 4 (Đã gộp vào S3)'...")
r = trello_put(f'/lists/{LIST_S4_BACKLOG}', 'name=Archive+-+Sprint+4+%28%C4%90%C3%A3+g%E1%BB%99p+v%C3%A0o+S3%29&closed=true')
print(f"  Kết quả: {r.status_code}")

# Đóng Done Sprint 4 luôn
print("📝 Đóng list 'Done Sprint 4' (trống)...")
r = trello_put(f'/lists/{LIST_DONE_S4}', 'closed=true')
print(f"  Kết quả: {r.status_code}")

# ============ BƯỚC 4: Verify kết quả ============
print()
print("=" * 60)
print("🔍 KIỂM TRA KẾT QUẢ SAU KHI GỘP:")
s3_new = trello_get(f'/lists/{LIST_S3_BACKLOG}/cards', fields='id,name,desc')
sp_s3_new = sum(get_sp(c.get('desc','')) for c in s3_new)
print(f"  Sprint Backlog - SPRINT 3 (gộp): {len(s3_new)} thẻ — {sp_s3_new} SP")

d1_v = trello_get(f'/lists/{LIST_DONE_S1}/cards', fields='id,name,desc')
d2_v = trello_get(f'/lists/{LIST_DONE_S2}/cards', fields='id,name,desc')
sp_d1 = sum(get_sp(c.get('desc','')) for c in d1_v)
sp_d2 = sum(get_sp(c.get('desc','')) for c in d2_v)

print()
print("=" * 60)
print("🏆 TỔNG KẾT CUỐI CÙNG — 3 SPRINT:")
print(f"  ✅ Sprint 1 (DONE)    : {len(d1_v):3d} thẻ — {sp_d1:4d} SP")
print(f"  ✅ Sprint 2 (DONE)    : {len(d2_v):3d} thẻ — {sp_d2:4d} SP")
print(f"  🔵 Sprint 3 (In Sprint): {len(s3_new):3d} thẻ — {sp_s3_new:4d} SP")
print(f"  {'─'*45}")
print(f"  TỔNG               : {len(d1_v)+len(d2_v)+len(s3_new):3d} thẻ — {sp_d1+sp_d2+sp_s3_new:4d} SP")
print()
print("✅ HOÀN THÀNH! Board Trello giờ chỉ còn 3 Sprint.")
print(f"🔗 https://trello.com/b/AA5BYoe1/traveleasyplatform")

