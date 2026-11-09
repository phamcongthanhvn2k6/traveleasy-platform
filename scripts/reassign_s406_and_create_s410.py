import urllib.request
import urllib.parse
import json

TRELLO_KEY = "3305b670e2ea6167c586ce2516d87ebd"
TRELLO_TOKEN = "ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D"
LIST_SPRINT_4_ID = "6ae81011b079250c3fdf6bc0"

CARD_S406_ID = "6af13e7fe7325c7fee45fb48"
MEMBER_PHAT = "68059add9a007163e68826b9"

LABELS = {
    "Sprint 4": "6ae8051e5f83cfe7677bec4c",
    "Company Portal": "6ae8051ddc0429f6b957e844",
    "Backend": "6ae8051d9e2ca2e64673f8bb",
    "Frontend": "6ae8051e60f06536398b0303",
}

def main():
    # 1. Chuyển thẻ S406 sang cho Phát Nguyễn
    print("1. Đang chuyển giao thẻ S406 sang cho Phát Nguyễn...")
    url_update_s406 = f"https://api.trello.com/1/cards/{CARD_S406_ID}?key={TRELLO_KEY}&token={TRELLO_TOKEN}"
    put_data = urllib.parse.urlencode({
        "idMembers": MEMBER_PHAT
    }).encode("utf-8")
    req_put = urllib.request.Request(url_update_s406, data=put_data, method="PUT")
    with urllib.request.urlopen(req_put) as resp:
        card_s406 = json.loads(resp.read().decode("utf-8"))
        print(f"✅ Đã gán S406 cho: {card_s406.get('idMembers')} ({card_s406.get('name')})")

    # 2. Kiểm tra thẻ S410 đã có chưa
    url_list_cards = f"https://api.trello.com/1/lists/{LIST_SPRINT_4_ID}/cards?key={TRELLO_KEY}&token={TRELLO_TOKEN}"
    with urllib.request.urlopen(url_list_cards) as resp:
        cards = json.loads(resp.read().decode("utf-8"))
    
    s410_card = next((c for c in cards if "S410" in c.get("name", "")), None)
    if s410_card:
        print(f"Thẻ S410 đã tồn tại: {s410_card.get('name')} (ID: {s410_card.get('id')})")
        return

    # 3. Tạo thẻ S410
    print("\n2. Đang tạo thẻ S410 trên Trello cho Phát Nguyễn...")
    name_s410 = "[Ưu tiên: 2] [3 SP] [S410][REPORTS] Phân Hệ Báo Cáo Thống Kê Doanh Thu & Tỷ Lệ Lấp Đầy Ghế Nhà Xe (/company/reports)"
    desc_s410 = """### 🎯 Mục tiêu nghiệp vụ & Kỹ thuật
- Xây dựng phân hệ Báo cáo Doanh thu & Thống kê Tỷ lệ lấp đầy ghế dành riêng cho Ban điều hành Nhà xe (`/company/reports`).
- Cung cấp số liệu tài chính minh bạch, hỗ trợ nhà xe tối ưu hóa kế hoạch điều phối xe và biểu giá theo từng chuyến/tuyến:
  + Biểu đồ trực quan (Recharts) theo dõi doanh thu thực tế theo ngày, tuần, tháng.
  + Thống kê tỷ lệ lấp đầy ghế (Occupancy Rate %) theo từng chuyến xe, nhận diện chuyến cao điểm và thấp điểm.
  + Bảng kê đối soát tài chính: Tổng tiền bán vé, chiết khấu hoa hồng sàn (8%), số tiền thực nhận của nhà xe.
  + Chức năng xuất dữ liệu báo cáo sang định dạng Excel (.xlsx) / CSV phục vụ kế toán nội bộ.

### 📋 Tiêu chí chấp nhận (DoD - Definition of Done)
- [ ] Giao diện Dashboard báo cáo `/company/reports` trực quan, hiển thị đúng các chỉ số KPI: Doanh thu, Số vé bán, Tỷ lệ lấp đầy ghế.
- [ ] Biểu đồ cột/đường trực quan hóa doanh thu theo ngày/tháng phản hồi mượt mà.
- [ ] Bảng kê chi tiết từng chuyến xe hiển thị chính xác công thức hoa hồng sàn 8% bất biến.
- [ ] Nút xuất Excel / CSV tải về file bảng tính định dạng chuẩn, đầy đủ thông tin vé và doanh thu.
- [ ] API backend tính toán tổng hợp dữ liệu chính xác theo `busCompanyId` của tài khoản đăng nhập.

### 👤 Phụ trách & Phân bổ
- **Người thực hiện**: Nguyễn Đại Phát (Admin & Company Portal)
- **Điểm Story Point**: 3 SP
- **Mức độ ưu tiên**: Trung bình - Cao (Priority 2)
"""

    labels = [LABELS["Sprint 4"], LABELS["Company Portal"], LABELS["Frontend"], LABELS["Backend"]]
    post_data = {
        "key": TRELLO_KEY,
        "token": TRELLO_TOKEN,
        "idList": LIST_SPRINT_4_ID,
        "name": name_s410,
        "desc": desc_s410,
        "idMembers": MEMBER_PHAT,
        "idLabels": ",".join(labels),
        "pos": "bottom"
    }

    create_url = "https://api.trello.com/1/cards"
    data_bytes = urllib.parse.urlencode(post_data).encode("utf-8")
    req_post = urllib.request.Request(create_url, data=data_bytes, method="POST")
    with urllib.request.urlopen(req_post) as resp_post:
        created = json.loads(resp_post.read().decode("utf-8"))
        print(f"✅ ĐÃ TẠO THÀNH CÔNG THẺ S410 TRÊN TRELLO:")
        print(f"ID: {created.get('id')}")
        print(f"Name: {created.get('name')}")
        print(f"URL: {created.get('shortUrl')}")

if __name__ == "__main__":
    main()
