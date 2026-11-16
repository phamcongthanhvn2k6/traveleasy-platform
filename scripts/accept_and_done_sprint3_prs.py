import urllib.request
import urllib.parse
import json

API_KEY = "3305b670e2ea6167c586ce2516d87ebd"
TOKEN = "ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D"
DONE_SPRINT3_LIST_ID = "6ae810128399397fe002ace9"

CARDS = [
    {
        "id": "6af34f77076510c11e29bd5d",
        "code": "S315",
        "pr": 66,
        "comment": "🎉 [NGHIỆM THU THÀNH CÔNG - PR #66 MERGED]\n- Đã nghiệm thu & merge PR #66 vào nhánh dev.\n- Bổ sung B-Tree Composite Index (idx_trips_departure_route_status, idx_trip_seats_trip_status, idx_tickets_booking_seat).\n- EXPLAIN ANALYZE giảm độ trễ từ >300ms xuống còn 4.82ms (giảm 98.5%).\n- Chuyển thẻ sang Done Sprint 3."
    },
    {
        "id": "6af34f54cba95a88dbe89a63",
        "code": "S319",
        "pr": 67,
        "comment": "🎉 [NGHIỆM THU THÀNH CÔNG - PR #67 MERGED]\n- Đã nghiệm thu & merge PR #67 vào nhánh dev.\n- Đảm bảo quy chuẩn an toàn Bộ GTVT: kiểm soát nồng độ cồn = 0.00 mg/L, bằng lái Hạng D/E, tài xế phụ cho chuyến > 4h/300km.\n- Hệ thống sinh mã lệnh xuất bến điện tử DP-xxxxx thành công.\n- Chuyển thẻ sang Done Sprint 3."
    },
    {
        "id": "6af34f595434d568a187a3bc",
        "code": "S320",
        "pr": 69,
        "comment": "🎉 [NGHIỆM THU THÀNH CÔNG - PR #69 MERGED]\n- Đã nghiệm thu & merge PR #69 vào nhánh dev.\n- WebApp soát vé QR đa tầng với PESSIMISTIC_WRITE lock, âm thanh phản hồi Web Audio API, Offline-First Cache Manifest và fallback nhập mã vé 6 ký tự.\n- Sơ đồ ghế điểm danh trực quan tại /conductor/scanner.\n- Chuyển thẻ sang Done Sprint 3."
    }
]

def get_check_items(card_id):
    url = f"https://api.trello.com/1/cards/{card_id}/checklists?key={API_KEY}&token={TOKEN}"
    with urllib.request.urlopen(url) as resp:
        checklists = json.loads(resp.read().decode("utf-8"))
        items = []
        for cl in checklists:
            for item in cl.get("checkItems", []):
                items.append((item["id"], item["name"]))
        return items

def update_check_item(card_id, check_item_id):
    url = f"https://api.trello.com/1/cards/{card_id}/checkItem/{check_item_id}?state=complete&key={API_KEY}&token={TOKEN}"
    req = urllib.request.Request(url, method="PUT")
    with urllib.request.urlopen(req) as resp:
        return resp.status

def add_comment(card_id, text):
    url = f"https://api.trello.com/1/cards/{card_id}/actions/comments?key={API_KEY}&token={TOKEN}"
    data = urllib.parse.urlencode({"text": text}).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    with urllib.request.urlopen(req) as resp:
        return resp.status

def move_card(card_id, list_id):
    url = f"https://api.trello.com/1/cards/{card_id}?idList={list_id}&key={API_KEY}&token={TOKEN}"
    req = urllib.request.Request(url, method="PUT")
    with urllib.request.urlopen(req) as resp:
        return resp.status

for card in CARDS:
    cid = card["id"]
    print(f"Processing {card['code']} (PR #{card['pr']})...")
    items = get_check_items(cid)
    for i_id, i_name in items:
        st = update_check_item(cid, i_id)
        print(f"  CheckItem: '{i_name}' -> complete (HTTP {st})")
    cm_st = add_comment(cid, card["comment"])
    print(f"  Comment added (HTTP {cm_st})")
    mv_st = move_card(cid, DONE_SPRINT3_LIST_ID)
    print(f"  Moved to Done Sprint 3 (HTTP {mv_st})")

print("\nAll 3 cards updated to Done Sprint 3 on Trello!")

