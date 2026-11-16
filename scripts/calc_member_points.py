import sys, re, requests
sys.stdout.reconfigure(encoding='utf-8')
KEY   = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'

members_info = {
    '692e4e6c8379666bcf47e7e1': 'Phạm Công Thành',
    '68059add9a007163e68826b9': 'Nguyễn Đại Phát',
    '692e4eee91abcb512798534a': 'Phạm Thanh Phong',
    '692e4f54351701077614b9cb': 'Trần Minh Đức',
    '6ae1b1e83656c2e4f73178d5': 'Đoàn Nhật Cường'
}

done_lists = {
    '6ae81053a0bcce0597b2503d': 'Sprint 1',
    '6ae810124a6fcb3b47a9063a': 'Sprint 2',
    '6ae810128399397fe002ace9': 'Sprint 3'
}

stats = {m: {'s1': 0, 's2': 0, 's3': 0} for m in members_info}

for lid, sname in done_lists.items():
    cards = requests.get(f'https://api.trello.com/1/lists/{lid}/cards', params={'key': KEY, 'token': TOKEN}).json()
    for c in cards:
        name = c['name']
        m_sp = re.search(r'\[(\d+)\s*SP\]', name)
        sp = int(m_sp.group(1)) if m_sp else 0
        for mid in c['idMembers']:
            if mid in stats:
                key = 's1' if sname == 'Sprint 1' else ('s2' if sname == 'Sprint 2' else 's3')
                stats[mid][key] += sp

for mid, d in stats.items():
    s1, s2, s3 = d['s1'], d['s2'], d['s3']
    total = s1 + s2 + s3
    print(f"{members_info[mid]}: S1={s1} SP | S2={s2} SP | S3={s3} SP | Total(S1-S3)={total} SP")

