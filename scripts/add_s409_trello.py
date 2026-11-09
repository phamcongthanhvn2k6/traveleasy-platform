import urllib.request
import urllib.parse
import json

TRELLO_KEY = "3305b670e2ea6167c586ce2516d87ebd"
TRELLO_TOKEN = "ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D"
LIST_SPRINT_4_ID = "6ae81011b079250c3fdf6bc0"

LABELS = {
    "Sprint 4": "6ae8051e5f83cfe7677bec4c",
    "Frontend": "6ae8051e60f06536398b0303",
    "Backend": "6ae8051d9e2ca2e64673f8bb",
    "Core / Urgent": "6ae8051fc43fa723ea6e93eb",
}
MEMBER_THANH = "692e4e6c8379666bcf47e7e1"

def main():
    # 1. Kiểm tra danh sách thẻ hiện tại
    url = f"https://api.trello.com/1/lists/{LIST_SPRINT_4_ID}/cards?key={TRELLO_KEY}&token={TRELLO_TOKEN}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        cards = json.loads(resp.read().decode("utf-8"))
    
    print(f"Tổng số thẻ hiện tại trong Sprint 4: {len(cards)}")
    for c in cards:
        print(f" - {c.get('name')} | id: {c.get('id')}")

    # Kiểm tra xem thẻ S409 đã tồn tại chưa
    s409_card = next((c for c in cards if "S409" in c.get("name", "")), None)
    if s409_card:
        print(f"Thẻ S409 đã tồn tại: {s409_card.get('name')} (ID: {s409_card.get('id')})")
        return

    # 2. Tạo thẻ S409
    name = "[Ưu tiên: 1] [3 SP] [S409][PERF] Màn hình Loading chuyển trang & Tối ưu hiệu năng giao diện SWR Cache 0ms, Skeleton Vé của tôi (/my-tickets)"
    desc = """### 🎯 Mục tiêu nghiệp vụ & Kỹ thuật
- Xây dựng component chuyển trang mượt mà (Global Page Loading Screen) đồng bộ thương hiệu TravelEasy khi điều hướng giữa các module (Đặt vé, Vé của tôi, Quản trị).
- Tối ưu hóa triệt để hiệu năng trang quản lý vé cá nhân (`/my-tickets`):
  + Caching phía Client với SWR / sessionStorage: Render vé tức thì trong 0ms khi quay lại tab/trang, loại bỏ màn hình trắng giật lag.
  + Thiết kế bộ khung nạp dữ liệu Shimmer Skeleton (`TicketSkeleton`) theo đúng chuẩn layout card vé thực tế thay cho văn bản thô hoặc vòng xoay spinner đơn điệu.
  + Tối ưu câu lệnh truy vấn Backend: Gom batch các truy vấn Trip, Bus, Route, Ticket liên quan, giảm latency API từ 3500ms xuống <120ms.

### 📋 Tiêu chí chấp nhận (DoD - Definition of Done)
- [x] Component Global Page Loading Screen hiển thị hiệu ứng chuyển trang mượt mà, tự động tắt khi DOM & tài nguyên sẵn sàng.
- [x] Tối ưu hóa Backend API My Tickets loại bỏ triệt để N+1 query, thời gian phản hồi đạt dưới 150ms.
- [x] Tích hợp SWR Cache `sessionStorage` hiển thị vé tức thì trong 0ms khi chuyển trang hoặc refresh nhẹ.
- [x] Thiết kế bộ khung nạp `TicketSkeleton` dạng shimmer/pulse đồng bộ kích thước card vé, nâng cao trải nghiệm người dùng (UX).
- [x] Đã kiểm thử tải và tương thích tốt trên cả Desktop và thiết bị di động.

### 👤 Phụ trách & Phân bổ
- **Người thực hiện**: Phạm Công Thành (Frontend & Backend Lead)
- **Điểm Story Point**: 3 SP
- **Mức độ ưu tiên**: Cao (Priority 1)
"""

    labels = [LABELS["Sprint 4"], LABELS["Frontend"], LABELS["Backend"], LABELS["Core / Urgent"]]
    members = [MEMBER_THANH]

    post_data = {
        "key": TRELLO_KEY,
        "token": TRELLO_TOKEN,
        "idList": LIST_SPRINT_4_ID,
        "name": name,
        "desc": desc,
        "idMembers": ",".join(members),
        "idLabels": ",".join(labels),
        "pos": "bottom"
    }

    create_url = "https://api.trello.com/1/cards"
    data_bytes = urllib.parse.urlencode(post_data).encode("utf-8")
    req_post = urllib.request.Request(create_url, data=data_bytes, method="POST")
    with urllib.request.urlopen(req_post) as resp_post:
        created = json.loads(resp_post.read().decode("utf-8"))
        print(f"✅ ĐÃ TẠO THÀNH CÔNG THẺ S409 TRÊN TRELLO:")
        print(f"ID: {created.get('id')}")
        print(f"Name: {created.get('name')}")
        print(f"URL: {created.get('shortUrl')}")

if __name__ == "__main__":
    main()
