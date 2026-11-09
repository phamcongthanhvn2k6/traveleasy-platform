import urllib.request
import urllib.parse
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

KEY = '3305b670e2ea6167c586ce2516d87ebd'
TOKEN = 'ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D'
BOARD_ID = '6ad6f486572cd6662754e074'

url = f'https://api.trello.com/1/boards/{BOARD_ID}/lists?key={KEY}&token={TOKEN}&cards=open'
req = urllib.request.Request(url, headers={'Accept': 'application/json'})
with urllib.request.urlopen(req) as resp:
    lists = json.loads(resp.read().decode())

s4_list = [l for l in lists if 'Sprint Backlog - SPRINT 4' in l['name']][0]
duplicates = [
    '[Ưu tiên: 2] [3 SP] [S403][FE]',
    '[Ưu tiên: 2] [2 SP] [S405][BE]'
]

for c in s4_list['cards']:
    name = c['name']
    if any(d in name for d in duplicates):
        print(f"🗑️ Đang archive thẻ trùng: {name[:50]}...")
        del_url = f"https://api.trello.com/1/cards/{c['id']}?key={KEY}&token={TOKEN}"
        del_req = urllib.request.Request(del_url, data=urllib.parse.urlencode({'closed': 'true'}).encode(), method='PUT')
        urllib.request.urlopen(del_req)

# Sắp xếp lại thứ tự từ S401 đến S408
order = ['S401', 'S402', 'S403', 'S404', 'S405', 'S406', 'S407', 'S408']
with urllib.request.urlopen(urllib.request.Request(url, headers={'Accept': 'application/json'})) as resp:
    lists_updated = json.loads(resp.read().decode())
s4_updated = [l for l in lists_updated if 'Sprint Backlog - SPRINT 4' in l['name']][0]

cards_by_code = {}
for c in s4_updated['cards']:
    for o in order:
        if o in c['name']:
            cards_by_code[o] = c
            break

for idx, o in enumerate(order, 1):
    if o in cards_by_code:
        c = cards_by_code[o]
        pos_val = idx * 1000
        pos_url = f"https://api.trello.com/1/cards/{c['id']}?key={KEY}&token={TOKEN}"
        pos_req = urllib.request.Request(pos_url, data=urllib.parse.urlencode({'pos': pos_val}).encode(), method='PUT')
        urllib.request.urlopen(pos_req)
        print(f"   🔢 Đặt vị trí {idx}: {c['name'][:50]}")

print("✅ Đã hoàn tất dọn dẹp và sắp xếp thứ tự 8 thẻ Sprint 4!")
