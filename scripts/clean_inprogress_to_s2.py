import urllib.request
import urllib.parse
import json

TRELLO_KEY = "3305b670e2ea6167c586ce2516d87ebd"
TRELLO_TOKEN = "ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D"

LIST_DONE_S2 = "6ae810124a6fcb3b47a9063a"
LABEL_S2 = "6ae8051d1c5db33989c70814"

CARDS_TO_MOVE = [
    ("6ae81138fbfe77346b8a9df3", "[Ưu tiên: 2] [1 SP] [BE][S237] Kiểm thử tích hợp API tìm kiếm — Tiêu chí, chỗ trống và chi tiết chuyến (/api/trips)"),
    ("6ae8113f6812785bd9c362ed", "[Ưu tiên: 2] [1 SP] [BE][S238] Kiểm thử hồi quy API đánh giá — Đánh giá đã xác thực, phản hồi và hướng dẫn (/api/reviews)"),
    ("6ae8113edeac0317d008df7e", "[Ưu tiên: 2] [1 SP] [FE][S239] Kiểm thử nghiệm thu đánh giá — Phản hồi nhà xe và trang hướng dẫn (/reviews)")
]

def main():
    for cid, new_name in CARDS_TO_MOVE:
        url = f"https://api.trello.com/1/cards/{cid}?key={TRELLO_KEY}&token={TRELLO_TOKEN}"
        put_data = urllib.parse.urlencode({
            "name": new_name,
            "idList": LIST_DONE_S2,
            "idLabels": LABEL_S2
        }).encode("utf-8")
        req = urllib.request.Request(url, data=put_data, method="PUT")
        with urllib.request.urlopen(req) as resp:
            card = json.loads(resp.read().decode("utf-8"))
            print(f"✅ Đã chuyển thẻ sang Done Sprint 2: {card.get('name')}")

if __name__ == "__main__":
    main()
