import urllib.request
import json

TRELLO_KEY = "3305b670e2ea6167c586ce2516d87ebd"
TRELLO_TOKEN = "ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D"
LIST_DONE_S3 = "6ae810128399397fe002ace9"

def main():
    url = f"https://api.trello.com/1/lists/{LIST_DONE_S3}/cards?key={TRELLO_KEY}&token={TRELLO_TOKEN}"
    with urllib.request.urlopen(url) as resp:
        cards = json.loads(resp.read().decode("utf-8"))
    
    print(f"=== DANH SÁCH 33 THẺ TRONG DONE SPRINT 3 ===")
    for i, c in enumerate(cards, 1):
        print(f"{i}. [{c['id']}] {c['name']}")

if __name__ == "__main__":
    main()
