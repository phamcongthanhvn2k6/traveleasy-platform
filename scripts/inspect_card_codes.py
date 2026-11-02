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
lists = json.loads(urllib.request.urlopen(url).read())

for l in lists:
    if l['name'] in ['Done Sprint 2', 'Done Sprint 3', 'Done Sprint 4', 'Done Sprint 1']:
        cards = l.get('cards', [])
        s_codes = {}
        for c in cards:
            # find S1xx, S2xx, S3xx, S4xx
            m = re.search(r'\[(S\d{3})\]', c['name'])
            prefix = m.group(1)[:2] if m else "NoCode"
            s_codes[prefix] = s_codes.get(prefix, 0) + 1
        print(f"List '{l['name']}': {len(cards)} cards -> breakdown: {s_codes}")

