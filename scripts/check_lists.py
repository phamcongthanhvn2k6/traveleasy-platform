import sys, requests, json
sys.stdout.reconfigure(encoding='utf-8')

KEY   = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'
BOARD = 'AA5BYoe1'
BASE  = 'https://api.trello.com/1'

r = requests.get(f'{BASE}/boards/{BOARD}/lists', params={'key':KEY,'token':TOKEN})
for l in r.json():
    print(f"{l['name']}: {l['id']} - closed: {l['closed']}")
