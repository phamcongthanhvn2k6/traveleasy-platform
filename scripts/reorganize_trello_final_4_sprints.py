import urllib.request
import urllib.parse
import json
import time
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

KEY = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'
BOARD_ID = 'AA5BYoe1'

LIST_DONE_S1 = "6ae81053a0bcce0597b2503d"
LIST_DONE_S2 = "6ae810124a6fcb3b47a9063a"
LIST_DONE_S3 = "6ae810128399397fe002ace9"
LIST_DONE_S4 = "6ae810133cffecec9ae9a6d0"
LIST_PROD_BACKLOG = "6ae8100ff6bb76d54fb4a27d"
LIST_S5_BACKLOG = "6ae8b98d7e8951773c4820ad"

LABEL_S2 = "6ae8051d1c5db33989c70814"
LABEL_S3 = "6ae8051e8bcb4bb0182f08c8"
LABEL_S4 = "6ae8051e5f83cfe7677bec4c"

def trello_req(url, method='GET', data=None):
    sep = '&' if '?' in url else '?'
    full_url = f"{url}{sep}key={KEY}&token={TOKEN}"
    encoded_data = None
    if data:
        encoded_data = urllib.parse.urlencode(data).encode('utf-8')
    req = urllib.request.Request(full_url, data=encoded_data, method=method)
    req.add_header('Accept', 'application/json')
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"Error {method} {url}: {e}")
        return None

print("🚀 Bắt đầu tái cơ cấu lại chuẩn 4 Sprint (Sprint 1, 2, 3, 4) - KHÔNG CÓ SPRINT 5:")

# 1. Fetch cards from Done Sprint 2
s2_cards = trello_req(f"https://api.trello.com/1/lists/{LIST_DONE_S2}/cards") or []
print(f"📦 Số thẻ trong Done Sprint 2 hiện tại: {len(s2_cards)}")

# Filter cards
s3_to_move = [c for c in s2_cards if '[S3' in c['name']]
s4_part1_to_move = [c for c in s2_cards if '[S4' in c['name']]

print(f"   -> Chuyển {len(s3_to_move)} thẻ S3 sang Done Sprint 3...")
for i, c in enumerate(s3_to_move, 1):
    card_id = c['id']
    # update list to LIST_DONE_S3
    trello_req(f"https://api.trello.com/1/cards/{card_id}", method='PUT', data={'idList': LIST_DONE_S3})
    # remove label S2 if present
    trello_req(f"https://api.trello.com/1/cards/{card_id}/idLabels/{LABEL_S2}", method='DELETE')
    # add label S3
    trello_req(f"https://api.trello.com/1/cards/{card_id}/idLabels", method='POST', data={'value': LABEL_S3})
    if i % 10 == 0 or i == len(s3_to_move):
        print(f"      [{i}/{len(s3_to_move)}] Đã chuyển sang S3")
    time.sleep(0.08)

print(f"   -> Chuyển {len(s4_part1_to_move)} thẻ S4 (Part 1) sang Done Sprint 4...")
for i, c in enumerate(s4_part1_to_move, 1):
    card_id = c['id']
    trello_req(f"https://api.trello.com/1/cards/{card_id}", method='PUT', data={'idList': LIST_DONE_S4})
    trello_req(f"https://api.trello.com/1/cards/{card_id}/idLabels/{LABEL_S2}", method='DELETE')
    trello_req(f"https://api.trello.com/1/cards/{card_id}/idLabels", method='POST', data={'value': LABEL_S4})
    if i % 10 == 0 or i == len(s4_part1_to_move):
        print(f"      [{i}/{len(s4_part1_to_move)}] Đã chuyển sang S4")
    time.sleep(0.08)

# 2. Fetch cards from Done Sprint 3
s3_cards = trello_req(f"https://api.trello.com/1/lists/{LIST_DONE_S3}/cards") or []
s4_part2_to_move = [c for c in s3_cards if '[S4' in c['name']]
print(f"   -> Chuyển {len(s4_part2_to_move)} thẻ S4 (Part 2) từ Done Sprint 3 sang Done Sprint 4...")
for i, c in enumerate(s4_part2_to_move, 1):
    card_id = c['id']
    trello_req(f"https://api.trello.com/1/cards/{card_id}", method='PUT', data={'idList': LIST_DONE_S4})
    trello_req(f"https://api.trello.com/1/cards/{card_id}/idLabels/{LABEL_S3}", method='DELETE')
    trello_req(f"https://api.trello.com/1/cards/{card_id}/idLabels", method='POST', data={'value': LABEL_S4})
    if i % 10 == 0 or i == len(s4_part2_to_move):
        print(f"      [{i}/{len(s4_part2_to_move)}] Đã chuyển sang S4")
    time.sleep(0.08)

# 3. Handle Sprint 5 Backlog cards: Move to Product Backlog (Lộ trình tính năng nâng cấp mở rộng)
s5_cards = trello_req(f"https://api.trello.com/1/lists/{LIST_S5_BACKLOG}/cards") or []
print(f"📦 Chuyển {len(s5_cards)} thẻ từ Sprint Backlog - SPRINT 5 sang Product Backlog...")
for i, c in enumerate(s5_cards, 1):
    card_id = c['id']
    trello_req(f"https://api.trello.com/1/cards/{card_id}", method='PUT', data={'idList': LIST_PROD_BACKLOG})
    time.sleep(0.08)

# Close / Archive the Sprint Backlog - SPRINT 5 list
trello_req(f"https://api.trello.com/1/lists/{LIST_S5_BACKLOG}/closed", method='PUT', data={'value': 'true'})
print("✅ Đã đóng danh sách 'Sprint Backlog - SPRINT 5' trên Trello.")

print("\n🎉 HOÀN TẤT TÁI CẤU TRÚC! Kiểm tra lại số lượng thẻ từng danh sách:")
board_lists = trello_req(f"https://api.trello.com/1/boards/{BOARD_ID}/lists?cards=open") or []
for l in board_lists:
    cards = l.get('cards', [])
    if len(cards) > 0 or l['name'].startswith('Done'):
        print(f"   * {l['name']}: {len(cards)} thẻ")

