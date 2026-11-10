import urllib.request
import json

TRELLO_KEY = "3305b670e2ea6167c586ce2516d87ebd"
TRELLO_TOKEN = "ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D"

LISTS_TO_CHECK = [
    ("To Do", "6ad6f486572cd6662754e06f"),
    ("In Progress", "6ad6f486572cd6662754e070"),
    ("Code Review", "6ad6f486572cd6662754e071"),
    ("Sprint Backlog - SPRINT 3 (6ae81011)", "6ae81011b079250c3fdf6bc0"),
]

def main():
    for name, lid in LISTS_TO_CHECK:
        url = f"https://api.trello.com/1/lists/{lid}/cards?key={TRELLO_KEY}&token={TRELLO_TOKEN}"
        with urllib.request.urlopen(url) as resp:
            cards = json.loads(resp.read().decode("utf-8"))
        print(f"\n=== {name} ({len(cards)} thẻ) ===")
        for c in cards:
            print(f"- [{c['id']}] {c['name']}")

if __name__ == "__main__":
    main()
