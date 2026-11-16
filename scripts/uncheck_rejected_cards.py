import urllib.request
import json

key = "3305b670e2ea6167c586ce2516d87ebd"
tok = "ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D"
CARDS = ["6af34f77076510c11e29bd5d", "6af34f54cba95a88dbe89a63", "6af34f595434d568a187a3bc"]

for cid in CARDS:
    url = f"https://api.trello.com/1/cards/{cid}/checklists?key={key}&token={tok}"
    with urllib.request.urlopen(url) as resp:
        checklists = json.loads(resp.read().decode("utf-8"))
        for cl in checklists:
            for item in cl.get("checkItems", []):
                i_id = item["id"]
                u_url = f"https://api.trello.com/1/cards/{cid}/checkItem/{i_id}?state=incomplete&key={key}&token={tok}"
                req = urllib.request.Request(u_url, method="PUT")
                with urllib.request.urlopen(req) as u_resp:
                    print(f"Unchecked item '{item['name']}' on card {cid}: {u_resp.status}")

print("All checkitems reset to incomplete!")
