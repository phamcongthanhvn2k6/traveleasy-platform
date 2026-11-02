import urllib.request
import json
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

KEY = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'
BOARD_ID = 'AA5BYoe1'

url = f'https://api.trello.com/1/boards/{BOARD_ID}/lists?key={KEY}&token={TOKEN}&cards=open'
req = urllib.request.Request(url, headers={'Accept': 'application/json'})
with urllib.request.urlopen(req) as resp:
    lists = json.loads(resp.read().decode('utf-8'))

for l in lists:
    cards = l.get('cards', [])
    if not cards:
        continue
    total_sp = 0
    cards_with_sp = 0
    for c in cards:
        m = re.search(r'\[(\d+)\s*SP\]', c['name'])
        if m:
            total_sp += int(m.group(1))
            cards_with_sp += 1
        else:
            # check description or default
            m_desc = re.search(r'Story Points:\s*(\d+)', c.get('desc', ''))
            if m_desc:
                total_sp += int(m_desc.group(1))
                cards_with_sp += 1
            else:
                total_sp += 3 # default estimate
    print(f"List: '{l['name']}' (ID: {l['id']})")
    print(f"   Cards count: {len(cards)}")
    print(f"   Total Story Points: {total_sp} SP")
    print("-" * 50)

