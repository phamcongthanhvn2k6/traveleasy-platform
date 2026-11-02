import urllib.request, json, sys
sys.stdout.reconfigure(encoding='utf-8')
k = '3305b670e2ea6167c586ce2516d87ebd'
t = 'ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D'
b = '6ad6f486572cd6662754e074'
url = f'https://api.trello.com/1/boards/{b}/lists?key={k}&token={t}&cards=open'
req = urllib.request.Request(url, headers={'Accept': 'application/json'})
with urllib.request.urlopen(req) as resp:
    lists = json.loads(resp.read().decode())
for l in lists:
    cards = l.get('cards', [])
    print(f"\n=======================================================")
    print(f"📋 {l['name']} ({len(cards)} thẻ)")
    print(f"=======================================================")
    for c in cards:
        lbs = [x.get('name', '') for x in c.get('labels', [])]
        print(f"  • {c['name']}")
        print(f"    🏷️ Nhãn: {', '.join(lbs)}")
