import urllib.request, json

key = '3305b670e2ea6167c586ce2516d87ebd'
token = 'ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D'
board_id = '6ad6f486572cd6662754e074'

url_lists = f'https://api.trello.com/1/boards/{board_id}/lists?key={key}&token={token}'
req = urllib.request.Request(url_lists, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    lists = json.loads(resp.read().decode())

url_cards = f'https://api.trello.com/1/boards/{board_id}/cards?key={key}&token={token}'
req = urllib.request.Request(url_cards, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    cards = json.loads(resp.read().decode())

print(f"Total active cards: {len(cards)}")
for l in lists:
    c_in_l = [c for c in cards if c['idList'] == l['id']]
    print(f"- {l['name']}: {len(c_in_l)} cards")
