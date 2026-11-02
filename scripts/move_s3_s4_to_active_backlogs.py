import urllib.request
import urllib.parse
import json
import time
import sys
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

KEY = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'
BOARD_ID = 'AA5BYoe1'

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
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"Error {method} {url}: {e}")
        return None

# Members allocation pool for S3 & S4 (Excluding Pham Cong Thanh):
# 1. Nguyễn Đại Phát (Admin, DevOps, Settments)
# 2. Phạm Thanh Phong (Core, Booking, API, DB)
# 3. Đoàn Nhật Cường (Frontend, QR, Mobile, Testing)
# 4. Trần Minh Đức (Customer, Tickets, Docs, Reporting)

def get_reassigned_member(card_name, index):
    name_lower = card_name.lower()
    if 'admin' in name_lower or 'doanh thu' in name_lower or 'quyết toán' in name_lower or 'đối soát' in name_lower or 'bảo mật' in name_lower or 'vận hành' in name_lower:
        return "Nguyễn Đại Phát"
    elif 'ghế' in name_lower or 'đặt vé' in name_lower or 'thanh toán' in name_lower or 'api' in name_lower or 'dịch vụ' in name_lower or 'tìm' in name_lower:
        return "Phạm Thanh Phong"
    elif 'soát vé' in name_lower or 'qr' in name_lower or 'di động' in name_lower or 'tra cứu' in name_lower or 'giao diện' in name_lower or 'kiểm thử' in name_lower:
        return "Đoàn Nhật Cường"
    else:
        return "Trần Minh Đức"

print("🚀 Bắt đầu chuyển Sprint 3 và Sprint 4 về đúng trạng thái thực tế:")
print("   - Sprint 1 (38 thẻ) & Sprint 2 (38 thẻ): DONE 100%")
print("   - Sprint 3 (40 thẻ): Đang làm ngày đầu -> chuyển về 'Sprint Backlog - SPRINT 3'")
print("   - Sprint 4 (44 thẻ): Sprint cuối sắp làm -> chuyển về 'Sprint Backlog - SPRINT 4'")
print("   - Không chia task cho Phạm Công Thành trong Sprint 3 & 4 (chia đều cho Phát, Phong, Cường, Đức)\n")

# 1. Process Sprint 3 cards
cards_s3 = trello_req(f"https://api.trello.com/1/lists/{LIST_DONE_S3}/cards?checklists=all") or []
print(f"📦 Đang xử lý {len(cards_s3)} thẻ của Sprint 3...")

for i, card in enumerate(cards_s3, 1):
    card_id = card['id']
    assigned_member = get_reassigned_member(card['name'], i)
    
    # 1. Move to Sprint Backlog - SPRINT 3
    trello_req(f"https://api.trello.com/1/cards/{card_id}", method='PUT', data={'idList': LIST_S3_BACKLOG})
    
    # 2. Update description to reflect active Sprint 3 Day 1 status
    desc = card.get('desc', '')
    desc = re.sub(r'### BẰNG CHỨNG NGHIỆM THU.*', '', desc, flags=re.DOTALL)
    desc = re.sub(r'Phụ trách:.*', f'Phụ trách: {assigned_member} (Nhóm 7)', desc)
    new_desc = desc.strip() + f"\n\n### TIẾN ĐỘ THỰC HIỆN SPRINT 3 (NGÀY ĐẦU TIÊN)\n- Trạng thái: IN PROGRESS / SPRINT BACKLOG\n- Phụ trách thực hiện: {assigned_member}\n- Mục tiêu: Tích hợp và kiểm thử nghiệm thu tính năng toàn sàn\n"
    trello_req(f"https://api.trello.com/1/cards/{card_id}", method='PUT', data={'desc': new_desc})
    
    # 3. Uncheck checklist items
    for cl in card.get('checklists', []):
        for item in cl.get('checkItems', []):
            if item.get('state') == 'complete':
                trello_req(f"https://api.trello.com/1/cards/{card_id}/checkItem/{item['id']}", method='PUT', data={'state': 'incomplete'})
                
    if i % 10 == 0 or i == len(cards_s3):
        print(f"   [{i}/{len(cards_s3)}] Đã chuyển thẻ Sprint 3 về Backlog và reset trạng thái")
    time.sleep(0.08)

# 2. Process Sprint 4 cards
cards_s4 = trello_req(f"https://api.trello.com/1/lists/{LIST_DONE_S4}/cards?checklists=all") or []
print(f"\n📦 Đang xử lý {len(cards_s4)} thẻ của Sprint 4...")

for i, card in enumerate(cards_s4, 1):
    card_id = card['id']
    assigned_member = get_reassigned_member(card['name'], i)
    
    # 1. Move to Sprint Backlog - SPRINT 4
    trello_req(f"https://api.trello.com/1/cards/{card_id}", method='PUT', data={'idList': LIST_S4_BACKLOG})
    
    # 2. Update description to reflect Sprint 4 (Final Sprint) status
    desc = card.get('desc', '')
    desc = re.sub(r'### BẰNG CHỨNG NGHIỆM THU.*', '', desc, flags=re.DOTALL)
    desc = re.sub(r'Phụ trách:.*', f'Phụ trách: {assigned_member} (Nhóm 7)', desc)
    new_desc = desc.strip() + f"\n\n### TIẾN ĐỘ THỰC HIỆN SPRINT 4 (SPRINT CUỐI CÙNG)\n- Trạng thái: SPRINT BACKLOG (Sẵn sàng triển khai sau Sprint 3)\n- Phụ trách thực hiện: {assigned_member}\n- Mục tiêu: Vận hành sẵn sàng sản xuất, SRE & Bàn giao đồ án OJT\n"
    trello_req(f"https://api.trello.com/1/cards/{card_id}", method='PUT', data={'desc': new_desc})
    
    # 3. Uncheck checklist items
    for cl in card.get('checklists', []):
        for item in cl.get('checkItems', []):
            if item.get('state') == 'complete':
                trello_req(f"https://api.trello.com/1/cards/{card_id}/checkItem/{item['id']}", method='PUT', data={'state': 'incomplete'})
                
    if i % 10 == 0 or i == len(cards_s4):
        print(f"   [{i}/{len(cards_s4)}] Đã chuyển thẻ Sprint 4 về Backlog và reset trạng thái")
    time.sleep(0.08)

print("\n🎉 HOÀN THÀNH ĐIỀU CHỈNH TRẠNG THÁI THỰC TẾ:")
board_lists = trello_req(f"https://api.trello.com/1/boards/{BOARD_ID}/lists?cards=open") or []
for l in board_lists:
    cards = l.get('cards', [])
    if len(cards) > 0 or l['name'].startswith('Done'):
        print(f"   * {l['name']}: {len(cards)} thẻ")

