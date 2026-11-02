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

list_map = {l['name']: l for l in lists}

done_s1 = list_map.get('Done Sprint 1', {}).get('cards', [])
done_s2 = list_map.get('Done Sprint 2', {}).get('cards', [])
done_s3 = list_map.get('Done Sprint 3', {}).get('cards', [])
done_s4 = list_map.get('Done Sprint 4', {}).get('cards', [])
s5_backlog = list_map.get('Sprint Backlog - SPRINT 5', {}).get('cards', [])

print(f"Current counts:")
print(f"  Done Sprint 1: {len(done_s1)}")
print(f"  Done Sprint 2: {len(done_s2)}")
print(f"  Done Sprint 3: {len(done_s3)}")
print(f"  Done Sprint 4: {len(done_s4)}")
print(f"  Sprint Backlog - SPRINT 5: {len(s5_backlog)}")

def extract_sp(card):
    m = re.search(r'\[(\d+)\s*SP\]', card['name'])
    if m:
        return int(m.group(1))
    m2 = re.search(r'Story Points:\s*(\d+)', card.get('desc', ''))
    if m2:
        return int(m2.group(1))
    return 3 # default

# Let's inspect the cards in Done Sprint 2:
s2_orig = []
s3_cards = []
s4_part1_cards = []

for c in done_s2:
    if '[S3' in c['name']:
        s3_cards.append(c)
    elif '[S4' in c['name']:
        s4_part1_cards.append(c)
    else:
        s2_orig.append(c)

print(f"\nInside Done Sprint 2:")
print(f"  Original S2 cards: {len(s2_orig)} (Total SP: {sum(extract_sp(c) for c in s2_orig)})")
print(f"  S3 cards (to move to Sprint 3): {len(s3_cards)} (Total SP: {sum(extract_sp(c) for c in s3_cards)})")
print(f"  S4 part 1 cards (to move to Sprint 4): {len(s4_part1_cards)} (Total SP: {sum(extract_sp(c) for c in s4_part1_cards)})")

s4_part2_cards = [c for c in done_s3 if '[S4' in c['name']]
print(f"\nInside Done Sprint 3:")
print(f"  S4 part 2 cards (to move to Sprint 4): {len(s4_part2_cards)} (Total SP: {sum(extract_sp(c) for c in s4_part2_cards)})")

print(f"\nInside Done Sprint 1:")
print(f"  S1 cards: {len(done_s1)} (Total SP: {sum(extract_sp(c) for c in done_s1)})")

