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

members_url = f'https://api.trello.com/1/boards/{BOARD_ID}/members?key={KEY}&token={TOKEN}'
members = {m['id']: m['fullName'] + ' (@' + m['username'] + ')' for m in get_json(members_url)}

# Member normalization helper
def normalize_member(card):
    assigned = [members.get(mid, mid) for mid in card.get('idMembers', [])]
    desc = card.get('desc', '')
    m_assignee = re.search(r'(?:Thành viên|Phụ trách):\s*([^\n\r]+)', desc)
    desc_member = m_assignee.group(1).strip() if m_assignee else ""
    
    # Priority: desc_member if present, else assigned
    primary = desc_member if desc_member else (assigned[0] if assigned else "Chưa gán")
    
    # Map to standard 6 team members:
    # 1. Phạm Công Thành
    # 2. Nguyễn Đại Phát
    # 3. Phan Trung Kiên
    # 4. Phạm Thanh Phong
    # 5. Trần Minh Đức
    # 6. Đoàn Nhật Cường (Josh Liam)
    lower = primary.lower()
    if 'thành' in lower or 'thanhphmcong1' in lower:
        return "Phạm Công Thành (@thanhphmcong1)"
    elif 'phát' in lower or 'phatnguyn146' in lower:
        return "Nguyễn Đại Phát (@phatnguyn146)"
    elif 'kiên' in lower or 'kienphantrung8' in lower:
        return "Phan Trung Kiên (@kienphantrung8)"
    elif 'phong' in lower or 'phmthanhphong17' in lower:
        return "Phạm Thanh Phong (@phmthanhphong17)"
    elif 'đức' in lower or 'minhdctrn13' in lower:
        return "Trần Minh Đức (@minhdctrn13)"
    elif 'cường' in lower or 'joshliam' in lower:
        return "Đoàn Nhật Cường (@joshliam)"
    return primary

def extract_sp(name, desc):
    m = re.search(r'\[(\d+)\s*SP\]', name)
    if m:
        return int(m.group(1))
    m2 = re.search(r'(\d+)\s*SP', name)
    if m2:
        return int(m2.group(1))
    m_desc = re.search(r'Story Points?:\s*(\d+)', desc)
    if m_desc:
        return int(m_desc.group(1))
    return 3

# Fetch all cards
cards_url = f'https://api.trello.com/1/boards/{BOARD_ID}/cards?key={KEY}&token={TOKEN}&attachments=false'
cards = get_json(cards_url)

lists_url = f'https://api.trello.com/1/boards/{BOARD_ID}/lists?key={KEY}&token={TOKEN}'
lists_map = {l['id']: l['name'] for l in get_json(lists_url)}

LIST_DONE_S3 = "6ae810128399397fe002ace9"
LIST_CODE_REVIEW = "6ad6f486572cd6662754e071"
LIST_BACKLOG_S3 = "6ae81011b079250c3fdf6bc0"

done_s3_cards = [c for c in cards if c['idList'] == LIST_DONE_S3]
review_cards = [c for c in cards if c['idList'] == LIST_CODE_REVIEW]
backlog_s3_cards = [c for c in cards if c['idList'] == LIST_BACKLOG_S3 and 'Sprint Goal' not in c['name']]

print("="*80)
print(f"1. DANH SÁCH TASK HOÀN THÀNH (DONE SPRINT 3): {len(done_s3_cards)} tasks")
print("="*80)

member_stats = {
    "Phạm Công Thành (@thanhphmcong1)": {"done_tasks": [], "done_sp": 0, "debt_tasks": [], "debt_sp": 0},
    "Nguyễn Đại Phát (@phatnguyn146)": {"done_tasks": [], "done_sp": 0, "debt_tasks": [], "debt_sp": 0},
    "Phan Trung Kiên (@kienphantrung8)": {"done_tasks": [], "done_sp": 0, "debt_tasks": [], "debt_sp": 0},
    "Phạm Thanh Phong (@phmthanhphong17)": {"done_tasks": [], "done_sp": 0, "debt_tasks": [], "debt_sp": 0},
    "Trần Minh Đức (@minhdctrn13)": {"done_tasks": [], "done_sp": 0, "debt_tasks": [], "debt_sp": 0},
    "Đoàn Nhật Cường (@joshliam)": {"done_tasks": [], "done_sp": 0, "debt_tasks": [], "debt_sp": 0},
}

for c in done_s3_cards:
    sp = extract_sp(c['name'], c.get('desc', ''))
    mem = normalize_member(c)
    member_stats.setdefault(mem, {"done_tasks": [], "done_sp": 0, "debt_tasks": [], "debt_sp": 0})
    member_stats[mem]["done_tasks"].append(c['name'])
    member_stats[mem]["done_sp"] += sp
    print(f"  [DONE] {c['name']} ({sp} SP) -> {mem}")

print("\n" + "="*80)
print(f"2. DANH SÁCH TASK NỢ / CHƯA HOÀN THÀNH (CODE REVIEW & SPRINT BACKLOG): {len(review_cards) + len(backlog_s3_cards)} tasks")
print("="*80)

debt_cards = review_cards + backlog_s3_cards
for c in debt_cards:
    sp = extract_sp(c['name'], c.get('desc', ''))
    mem = normalize_member(c)
    list_name = lists_map.get(c['idList'], c['idList'])
    member_stats.setdefault(mem, {"done_tasks": [], "done_sp": 0, "debt_tasks": [], "debt_sp": 0})
    member_stats[mem]["debt_tasks"].append((c['name'], list_name))
    member_stats[mem]["debt_sp"] += sp
    print(f"  [NỢ - {list_name}] {c['name']} ({sp} SP) -> {mem}")

print("\n" + "="*80)
print("3. TỔNG HỢP THEO TỪNG THÀNH VIÊN")
print("="*80)

total_done_sp = 0
total_done_tasks = 0
total_debt_sp = 0
total_debt_tasks = 0

for mem, st in member_stats.items():
    d_count = len(st["done_tasks"])
    d_sp = st["done_sp"]
    deb_count = len(st["debt_tasks"])
    deb_sp = st["debt_sp"]
    total_done_tasks += d_count
    total_done_sp += d_sp
    total_debt_tasks += deb_count
    total_debt_sp += deb_sp
    
    print(f"\n👤 {mem}:")
    print(f"   - Hoàn thành: {d_count} tasks ({d_sp} SP)")
    print(f"   - Nợ lại: {deb_count} tasks ({deb_sp} SP)")
    if st["debt_tasks"]:
        for tname, lstate in st["debt_tasks"]:
            print(f"     + [{lstate}] {tname}")

print("\n" + "="*80)
print(f"TỔNG KẾT TOÀN ĐỘI SPRINT 3:")
print(f" - Tổng hoàn thành: {total_done_tasks} tasks ({total_done_sp} SP)")
print(f" - Tổng nợ lại: {total_debt_tasks} tasks ({total_debt_sp} SP)")
print(f" - Tổng phạm vi Sprint 3: {total_done_tasks + total_debt_tasks} tasks ({total_done_sp + total_debt_sp} SP)")
print(f" - Tỷ lệ hoàn thành: {round(total_done_sp / (total_done_sp + total_debt_sp) * 100, 1)}% SP")
print("="*80)

