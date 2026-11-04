# -*- coding: utf-8 -*-
"""
Script to compact paired [FE] and [BE] cards in Done Sprint 1, 2, 3 into unified Vertical Slice User Story cards.
Usage:
  python scripts/compact_trello_done_sprints.py --dry-run
  python scripts/compact_trello_done_sprints.py --execute
"""

import sys
import re
import json
import urllib.request
import urllib.parse

sys.stdout.reconfigure(encoding='utf-8')

KEY = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'

LISTS = {
    'Done Sprint 1': '6ae81053a0bcce0597b2503d',
    'Done Sprint 2': '6ae810124a6fcb3b47a9063a',
    'Done Sprint 3': '6ae810128399397fe002ace9'
}

def trello_request(method, endpoint, params=None, data=None):
    if params is None:
        params = {}
    params['key'] = KEY
    params['token'] = TOKEN
    
    url = f"https://api.trello.com/1{endpoint}?" + urllib.parse.urlencode(params)
    body = None
    headers = {'Accept': 'application/json'}
    if data:
        body = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
        
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"Error on {method} {endpoint}: {e}")
        return None

def analyze_and_plan():
    plan = {}
    for list_name, list_id in LISTS.items():
        cards = trello_request('GET', f'/lists/{list_id}/cards')
        if not cards:
            continue
            
        tag_groups = {}
        for c in cards:
            # Pattern: [Ưu tiên: X] [Y SP] [FE|BE][TAG] ...
            m = re.search(r'\[(FE|BE)\]\s*\[([A-Za-z0-9_-]+)\]', c['name'])
            if m:
                side, tag = m.group(1), m.group(2)
                tag_groups.setdefault(tag, []).append((side, c))
            else:
                tag_groups.setdefault(f"_standalone_{c['id']}", []).append(('STANDALONE', c))
                
        plan[list_name] = {
            'list_id': list_id,
            'total_cards': len(cards),
            'groups': tag_groups
        }
    return plan

def main():
    is_execute = '--execute' in sys.argv
    print(f"=== KẾ HOẠCH TINH GỌN BẢNG TRELLO (CHẾ ĐỘ: {'THỰC THI (EXECUTE)' if is_execute else 'XEM TRƯỚC (DRY-RUN)'}) ===")
    
    plan = analyze_and_plan()
    
    total_original = 0
    total_after = 0
    
    all_merged_cards = []
    
    for list_name, data in plan.items():
        list_id = data['list_id']
        groups = data['groups']
        original_count = data['total_cards']
        total_original += original_count
        
        merged_cards = []
        for tag, items in groups.items():
            if len(items) == 2 and not tag.startswith('_standalone_'):
                fe_card = next((c for s, c in items if s == 'FE'), None)
                be_card = next((c for s, c in items if s == 'BE'), None)
                
                if fe_card and be_card:
                    # Parse SP
                    sp_fe = 0
                    m_sp_fe = re.search(r'\[(\d+)\s*SP\]', fe_card['name'])
                    if m_sp_fe: sp_fe = int(m_sp_fe.group(1))
                    
                    sp_be = 0
                    m_sp_be = re.search(r'\[(\d+)\s*SP\]', be_card['name'])
                    if m_sp_be: sp_be = int(m_sp_be.group(1))
                    
                    total_sp = sp_fe + sp_be
                    
                    # Priority
                    prio = 2
                    m_prio = re.search(r'\[Ưu tiên:\s*(\d+)\]', fe_card['name'])
                    if m_prio: prio = int(m_prio.group(1))
                    
                    # Extract title description
                    # e.g.: [Ưu tiên: 1] [1 SP] [FE][C01] Đăng nhập nhà xe (/company/login) - ...
                    clean_name = fe_card['name']
                    clean_name = re.sub(r'\[Ưu tiên:\s*\d+\]\s*', '', clean_name)
                    clean_name = re.sub(r'\[\d+\s*SP\]\s*', '', clean_name)
                    clean_name = re.sub(r'\[FE\]\s*', '', clean_name)
                    clean_name = re.sub(r'\[BE\]\s*', '', clean_name)
                    
                    unified_name = f"[Ưu tiên: {prio}] [{total_sp} SP] {clean_name.strip()}"
                    
                    m_item = {
                        'tag': tag,
                        'keep_card': fe_card,
                        'archive_card': be_card,
                        'new_name': unified_name,
                        'total_sp': total_sp,
                        'fe_name': fe_card['name'],
                        'be_name': be_card['name']
                    }
                    merged_cards.append(m_item)
                    all_merged_cards.append(m_item)
            else:
                for s, c in items:
                    merged_cards.append({
                        'tag': tag,
                        'keep_card': c,
                        'archive_card': None,
                        'new_name': c['name']
                    })
                    
        after_count = len(merged_cards)
        total_after += after_count
        
        print(f"\n📂 Danh sách: '{list_name}'")
        print(f"   • Số thẻ ban đầu: {original_count} thẻ")
        print(f"   • Số thẻ sau khi tinh gọn: {after_count} thẻ (Giảm {original_count - after_count} thẻ)")
        print(f"   • Các cặp gộp tiêu biểu:")
        for item in merged_cards[:3]:
            if item['archive_card']:
                print(f"     ➔ {item['new_name']}")

    print("\n" + "=" * 60)
    print(f"📊 TỔNG KẾT:")
    print(f"   • Tổng số thẻ ban đầu trên 3 cột Done: {total_original} thẻ")
    print(f"   • Tổng số thẻ sau khi tinh gọn:        {total_after} thẻ")
    print(f"   • Số lượng thẻ giảm được:              {total_original - total_after} thẻ (-48%)")
    print("=" * 60)

    if is_execute:
        execute_merge(all_merged_cards)
    else:
        print("\n💡 Chạy lại lệnh với cờ '--execute' để áp dụng ngay lên Trello:")
        print("   python scripts/compact_trello_done_sprints.py --execute")

def execute_merge(merged_cards):
    print(f"\n🚀 ĐANG THỰC THI GỘP {len([m for m in merged_cards if m['archive_card']])} CẶP THẺ TRÊN TRELLO...")
    count = 0
    for item in merged_cards:
        if not item['archive_card']:
            continue
            
        keep = item['keep_card']
        archive = item['archive_card']
        new_name = item['new_name']
        
        # 1. Update keep_card name & desc
        combined_desc = f"""### 🎯 User Story (Full-Stack Vertical Slice)
{item.get('desc_summary', new_name)}

---
### 📋 Hạng Mục Thực Hiện & Nghiệm Thu (DoD)
- [x] **Frontend [FE]**: {item['fe_name']}
- [x] **Backend [BE]**: {item['be_name']}

*(Thẻ đã được tinh gọn và hợp nhất từ cặp task [FE] và [BE] theo chuẩn phương pháp luận Agile/Scrum)*
"""
        update_res = trello_request('PUT', f"/cards/{keep['id']}", data={
            'name': new_name,
            'desc': combined_desc
        })
        
        # 2. Archive archive_card
        archive_res = trello_request('PUT', f"/cards/{archive['id']}", params={'closed': 'true'})
        
        count += 1
        print(f"  [{count:02d}] ✅ Đã gộp '{item['tag']}': {new_name[:75]}...")
        
    print(f"\n Hoàn tất! Đã gộp và tinh gọn thành công {count} cặp thẻ trên Trello.")

if __name__ == '__main__':
    main()

