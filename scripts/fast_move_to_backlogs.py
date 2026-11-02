import urllib.request
import urllib.parse
import json
import time
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

KEY = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'

LIST_S3_BACKLOG = "6ae810118eb30740924b1300"
LIST_S4_BACKLOG = "6ae81011b079250c3fdf6bc0"
LIST_DONE_S3 = "6ae810128399397fe002ace9"
LIST_DONE_S4 = "6ae810133cffecec9ae9a6d0"

def trello_req(url, method='GET', data=None):
    sep = '&' if '?' in url else '?'
    full_url = f"{url}{sep}key={KEY}&token={TOKEN}"
    encoded_data = None
    if data:
        encoded_data = urllib.parse.urlencode(data).encode('utf-8')
    req = urllib.request.Request(full_url, data=encoded_data, method=method)
    req.add_header('Accept', 'application/json')
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"Error {method} {url}: {e}", flush=True)
        return None

print("🚀 Chuyển 40 thẻ Sprint 3 từ Done Sprint 3 -> Sprint Backlog - SPRINT 3...", flush=True)
cards_s3 = trello_req(f"https://api.trello.com/1/lists/{LIST_DONE_S3}/cards") or []
print(f"   Tìm thấy {len(cards_s3)} thẻ S3", flush=True)

for i, c in enumerate(cards_s3, 1):
    card_id = c['id']
    trello_req(f"https://api.trello.com/1/cards/{card_id}", method='PUT', data={'idList': LIST_S3_BACKLOG})
    if i % 10 == 0 or i == len(cards_s3):
        print(f"   [{i}/{len(cards_s3)}] Đã chuyển sang Sprint Backlog - SPRINT 3", flush=True)
    time.sleep(0.05)

print("\n🚀 Chuyển 44 thẻ Sprint 4 từ Done Sprint 4 -> Sprint Backlog - SPRINT 4...", flush=True)
cards_s4 = trello_req(f"https://api.trello.com/1/lists/{LIST_DONE_S4}/cards") or []
print(f"   Tìm thấy {len(cards_s4)} thẻ S4", flush=True)

for i, c in enumerate(cards_s4, 1):
    card_id = c['id']
    trello_req(f"https://api.trello.com/1/cards/{card_id}", method='PUT', data={'idList': LIST_S4_BACKLOG})
    if i % 10 == 0 or i == len(cards_s4):
        print(f"   [{i}/{len(cards_s4)}] Đã chuyển sang Sprint Backlog - SPRINT 4", flush=True)
    time.sleep(0.05)

print("\n✅ KIỂM TRA LẠI SỐ LƯỢNG THẺ TOÀN BỘ CÁC DANH SÁCH:", flush=True)
BOARD_ID = 'AA5BYoe1'
lists = trello_req(f"https://api.trello.com/1/boards/{BOARD_ID}/lists?cards=open") or []
for l in lists:
    cards = l.get('cards', [])
    if len(cards) > 0 or l['name'].startswith('Done') or 'Sprint Backlog' in l['name']:
        print(f"   * {l['name']}: {len(cards)} thẻ", flush=True)

