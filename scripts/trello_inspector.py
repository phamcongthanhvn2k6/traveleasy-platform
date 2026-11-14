import urllib.request
import json
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

KEY = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'
BOARD_ID = 'AA5BYoe1'

def get_json(url):
    req = urllib.request.Request(url, headers={'Accept': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

# 1. Get Board Members
members_url = f'https://api.trello.com/1/boards/{BOARD_ID}/members?key={KEY}&token={TOKEN}'
members = {m['id']: m['fullName'] + ' (@' + m['username'] + ')' for m in get_json(members_url)}
print("=== THÀNH VIÊN TRÊN BOARD ===")
for mid, name in members.items():
    print(f"  {mid}: {name}")

# 2. Get Lists
lists_url = f'https://api.trello.com/1/boards/{BOARD_ID}/lists?key={KEY}&token={TOKEN}'
lists = get_json(lists_url)
print("\n=== DANH SÁCH CÁC CỘT TRÊN BOARD ===")
for l in lists:
    print(f"  [{l['name']}] (ID: {l['id']}, closed: {l['closed']})")

# 3. Get Cards in each list
cards_url = f'https://api.trello.com/1/boards/{BOARD_ID}/cards?key={KEY}&token={TOKEN}&attachments=false'
cards = get_json(cards_url)

cards_by_list = {}
for c in cards:
    lid = c['idList']
    cards_by_list.setdefault(lid, []).append(c)

print("\n" + "="*80)
print("CHI TIẾT CÁC THẺ THEO DANH SÁCH")
print("="*80)

for l in lists:
    lid = l['id']
    lname = l['name']
    lcards = cards_by_list.get(lid, [])
    print(f"\n📁 CỘT: {lname} ({len(lcards)} thẻ)")
    print("-" * 60)
    for c in lcards:
        cname = c['name']
        m_sp = re.search(r'\[(\d+)\s*SP\]', cname)
        sp = int(m_sp.group(1)) if m_sp else 0
        assigned = [members.get(mid, mid) for mid in c.get('idMembers', [])]
        assignee_str = ", ".join(assigned) if assigned else "Chưa gán member"
        
        # Check description for member if idMembers empty
        desc = c.get('desc', '')
        m_assignee = re.search(r'Thành viên:\s*([^\n\r]+)', desc)
        if m_assignee:
            desc_member = m_assignee.group(1).strip()
        else:
            m_assignee2 = re.search(r'Phụ trách:\s*([^\n\r]+)', desc)
            desc_member = m_assignee2.group(1).strip() if m_assignee2 else ""

        print(f"  * {cname} | SP: {sp}")
        print(f"    - ID: {c['id']}")
        print(f"    - Gán (idMembers): {assignee_str}")
        if desc_member:
            print(f"    - Ghi nhận trong Desc: {desc_member}")
