import urllib.request
import json

TRELLO_KEY = "3305b670e2ea6167c586ce2516d87ebd"
TRELLO_TOKEN = "ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D"
LIST_DONE_S1 = "6ae81053a0bcce0597b2503d"
LIST_DONE_S2 = "6ae810124a6fcb3b47a9063a"

def main():
    for name, lid in [("Done Sprint 1", LIST_DONE_S1), ("Done Sprint 2", LIST_DONE_S2)]:
        url = f"https://api.trello.com/1/lists/{lid}/cards?key={TRELLO_KEY}&token={TRELLO_TOKEN}"
        with urllib.request.urlopen(url) as resp:
            cards = json.loads(resp.read().decode("utf-8"))
        print(f"\n=== {name} ({len(cards)} thẻ) ===")
        for c in cards[:5]:
            print(f"- [{c['id']}] {c['name']}")

if __name__ == "__main__":
    main()
