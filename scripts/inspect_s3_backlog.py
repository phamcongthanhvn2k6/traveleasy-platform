import sys, requests, json
sys.stdout.reconfigure(encoding='utf-8')

KEY   = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'
LIST_S3 = '6ae8100bb7df18ff8e790209'
BASE  = 'https://api.trello.com/1'

r = requests.get(f'{BASE}/lists/{LIST_S3}/cards', params={'key':KEY,'token':TOKEN, 'fields': 'id,name,idMembers,desc'})
cards = r.json()
print(f'Total cards in S3 Backlog: {len(cards)}')
for i, c in enumerate(cards):
    assignee = 'Chưa rõ'
    for line in c.get('desc','').split('\n'):
        if any(k in line.lower() for k in ['phụ trách', 'thành viên', 'assignee', 'người thực hiện']):
            assignee = line.strip()
            break
    print(f'[{i+1:2d}] {c["name"][:55]} | {assignee} | Members: {c.get("idMembers")}')

