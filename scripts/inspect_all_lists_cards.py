import urllib.request
import json

TRELLO_KEY = "3305b670e2ea6167c586ce2516d87ebd"
TRELLO_TOKEN = "ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D"
BOARD_ID = "6ad6f486572cd6662754e074"

def main():
    url = f"https://api.trello.com/1/boards/{BOARD_ID}/lists?key={TRELLO_KEY}&token={TRELLO_TOKEN}"
    with urllib.request.urlopen(url) as resp:
        lists = json.loads(resp.read().decode("utf-8"))
    
    print("=== DANH SÁCH CÁC CỘT TRÊN BOARD ===")
    for l in lists:
        url_cards = f"https://api.trello.com/1/lists/{l['id']}/cards?key={TRELLO_KEY}&token={TRELLO_TOKEN}"
        with urllib.request.urlopen(url_cards) as resp_c:
            cards = json.loads(resp_c.read().decode("utf-8"))
        print(f"[{l['id']}] {l['name']} -> {len(cards)} thẻ")

if __name__ == "__main__":
    main()
