import sys, requests, json, time, urllib.parse
sys.stdout.reconfigure(encoding='utf-8')

KEY   = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'
BOARD = 'AA5BYoe1'
BASE  = 'https://api.trello.com/1'
AUTH  = {'key': KEY, 'token': TOKEN}

def trello_get(path, **params):
    r = requests.get(f'{BASE}{path}', params={**AUTH, **params}, timeout=15)
    r.raise_for_status()
    return r.json()

# ------ 1. Lấy danh sách lists ------
lists_raw = trello_get(f'/boards/{BOARD}/lists', fields='id,name,closed')
lists = [l for l in lists_raw if not l.get('closed')]
print("=== CÁC LIST ĐANG MỞ ===")
for l in lists:
    print(f"  {l['name']}: {l['id']}")

# Tìm list IDs
list_map = {l['name']: l['id'] for l in lists}
print()

# ------ 2. Đếm số thẻ mỗi list ------
print("=== SỐ THẺ TRONG TỪNG LIST ===")
list_counts = {}
for l in lists:
    cards = trello_get(f'/lists/{l["id"]}/cards', fields='id,name,desc')
    list_counts[l['name']] = {'id': l['id'], 'cards': cards, 'count': len(cards)}
    print(f"  {l['name']}: {len(cards)} thẻ")

print()
print("=== KẾ HOẠCH GỘP ===")
print("Dự án giảm từ 4 Sprint → 3 Sprint")
print("Sprint 1 (Done): GIỮ NGUYÊN")
print("Sprint 2 (Done): GIỮ NGUYÊN")
print("Sprint 3: Gộp Sprint 3 Backlog + Sprint 4 Backlog")

# Kiểm tra story points từ desc
def get_sp(desc):
    import re
    m = re.search(r'(\d+)\s*SP', desc or '', re.IGNORECASE)
    if m:
        return int(m.group(1))
    # fallback theo label thường gặp
    return 3

# Tổng kết
for name, info in list_counts.items():
    sp_total = sum(get_sp(c.get('desc','')) for c in info['cards'])
    if info['count'] > 0:
        print(f"  {name}: {info['count']} thẻ, ~{sp_total} SP")

