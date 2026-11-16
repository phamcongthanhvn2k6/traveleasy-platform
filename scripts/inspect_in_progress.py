import urllib.request
import json

key = '3305b670e2ea6167c586ce2516d87ebd'
token = 'ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D'
board_id = '6ad6f486572cd6662754e074'

url_lists = f'https://api.trello.com/1/boards/{board_id}/lists?key={key}&token={token}'
req = urllib.request.Request(url_lists, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    lists = json.loads(resp.read().decode())
list_map = {l['id']: l['name'] for l in lists}

url_cards = f'https://api.trello.com/1/boards/{board_id}/cards?key={key}&token={token}'
req = urllib.request.Request(url_cards, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    cards = json.loads(resp.read().decode())

in_progress = [c for c in cards if list_map.get(c['idList']) == 'In Progress']
print(f"Found {len(in_progress)} cards in In Progress:")

for c in in_progress:
    print(f"\n--- {c['name']} (ID: {c['id']}) ---")
    print(f"Desc: {c.get('desc', '')[:120]}...")
    for chk_id in c.get('idChecklists', []):
        url_chk = f'https://api.trello.com/1/checklists/{chk_id}?key={key}&token={token}'
        req_chk = urllib.request.Request(url_chk, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req_chk) as chk_resp:
            chk = json.loads(chk_resp.read().decode())
            print(f"  Checklist: {chk['name']}")
            for item in chk.get('checkItems', []):
                print(f"    [{'X' if item['state'] == 'complete' else ' '}] {item['name']} (ID: {item['id']})")

