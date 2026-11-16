import requests
KEY   = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'
BOARD = 'AA5BYoe1'

lists = requests.get(f'https://api.trello.com/1/boards/{BOARD}/lists', params={'key': KEY, 'token': TOKEN}).json()
for l in lists:
    if 'SPRINT 4' in l['name']:
        cards = requests.get(f"https://api.trello.com/1/lists/{l['id']}/cards", params={'key': KEY, 'token': TOKEN}).json()
        print(f"{l['name']} (ID: {l['id']}) has {len(cards)} cards:")
        for c in cards:
            print(f"  - {c['name']}")

