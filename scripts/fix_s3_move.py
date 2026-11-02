import urllib.request
import urllib.parse
import json
import time
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

KEY = '29657650aaf408d6e18a6c3cac462abf'
TOKEN = 'ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8'

LIST_S3_BACKLOG = "6ae810118eb30740924b1300"
LIST_DONE_S3 = "6ae810128399397fe002ace9"

def trello_get(path):
    url = f"https://api.trello.com/1{path}"
    sep = '&' if '?' in url else '?'
    full_url = f"{url}{sep}key={KEY}&token={TOKEN}"
    req = urllib.request.Request(full_url, headers={'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))

def trello_put(path, data):
    url = f"https://api.trello.com/1{path}"
    sep = '&' if '?' in url else '?'
    full_url = f"{url}{sep}key={KEY}&token={TOKEN}"
    encoded_data = urllib.parse.urlencode(data).encode('utf-8')
    req = urllib.request.Request(full_url, data=encoded_data, method='PUT')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    req.add_header('Accept', 'application/json')
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))

# Fetch fresh cards from Done Sprint 3
print("Fetching fresh cards from Done Sprint 3...", flush=True)
cards = trello_get(f"/lists/{LIST_DONE_S3}/cards")
print(f"Found {len(cards)} cards", flush=True)

moved = 0
errors = 0
for i, c in enumerate(cards, 1):
    card_id = c['id']
    short_link = c.get('shortLink', '')
    try:
        # Use the shortLink route which is more reliable
        result = trello_put(f"/cards/{card_id}", {'idList': LIST_S3_BACKLOG})
        if result.get('idList') == LIST_S3_BACKLOG:
            moved += 1
        else:
            print(f"  [{i}] Unexpected result for {short_link}: {result.get('idList')}", flush=True)
            errors += 1
    except Exception as e:
        print(f"  [{i}] Error moving {card_id} ({short_link}): {e}", flush=True)
        errors += 1
    if i % 5 == 0 or i == len(cards):
        print(f"  Progress: [{i}/{len(cards)}] moved={moved}, errors={errors}", flush=True)
    time.sleep(0.1)

print(f"\n✅ Done! Moved {moved}/{len(cards)} cards to Sprint Backlog - SPRINT 3", flush=True)

# Verify
remaining = trello_get(f"/lists/{LIST_DONE_S3}/cards")
backlog_s3 = trello_get(f"/lists/{LIST_S3_BACKLOG}/cards")
print(f"Done Sprint 3 remaining: {len(remaining)}", flush=True)
print(f"Sprint Backlog - SPRINT 3 now has: {len(backlog_s3)}", flush=True)

