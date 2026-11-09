import urllib.request
import json

TRELLO_KEY = "3305b670e2ea6167c586ce2516d87ebd"
TRELLO_TOKEN = "ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D"
BOARD_ID = "6ad6f486572cd6662754e074"
LIST_SPRINT_4_ID = "6ae81011b079250c3fdf6bc0"

def main():
    # 1. Members
    url = f"https://api.trello.com/1/boards/{BOARD_ID}/members?key={TRELLO_KEY}&token={TRELLO_TOKEN}"
    with urllib.request.urlopen(url) as resp:
        members = json.loads(resp.read().decode("utf-8"))
    print("=== MEMBERS ON BOARD ===")
    member_map = {}
    for m in members:
        member_map[m["id"]] = m["fullName"]
        print(f"ID: {m['id']} | Name: {m['fullName']} | Username: {m.get('username')}")

    # 2. Cards in Sprint 4
    url_cards = f"https://api.trello.com/1/lists/{LIST_SPRINT_4_ID}/cards?key={TRELLO_KEY}&token={TRELLO_TOKEN}"
    with urllib.request.urlopen(url_cards) as resp:
        cards = json.loads(resp.read().decode("utf-8"))
    print("\n=== CARDS IN SPRINT 4 LIST ===")
    for c in cards:
        card_members = [member_map.get(mid, mid) for mid in c.get("idMembers", [])]
        print(f"[{c['id']}] {c['name']} -> Members: {', '.join(card_members) if card_members else 'Unassigned'}")

if __name__ == "__main__":
    main()
