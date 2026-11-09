import urllib.request
import urllib.parse
import json

TRELLO_KEY = "3305b670e2ea6167c586ce2516d87ebd"
TRELLO_TOKEN = "ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D"
CARD_S405_ID = "6ae8cbcd3440dd9bcf949216"
MEMBER_CUONG = "6ae1b1e83656c2e4f73178d5"

LABELS = {
    "Sprint 4": "6ae8051e5f83cfe7677bec4c",
    "Frontend": "6ae8051e60f06536398b0303",
    "Company Portal": "6ae8051ddc0429f6b957e844",
}

def main():
    new_name = "[Ưu tiên: 2] [3 SP] [S405][MANIFEST] Giao Diện Danh Sách Hành Khách & Điều Phối Điểm Đón/Trả Cho Tài Xế (/driver/manifest)"
    new_desc = """### 🎯 Mục tiêu nghiệp vụ & Kỹ thuật
- Xây dựng giao diện Danh sách hành khách chuyến đi (Passenger Manifest) độc lập dành riêng cho Tài xế và Phụ xe (`/driver/manifest`).
- Tối ưu hóa trải nghiệm Mobile-first để tài xế dễ dàng thao tác bằng một tay trên điện thoại:
  + Hiển thị danh sách hành khách được nhóm và sắp xếp theo trình tự các điểm đón/trả dọc lộ trình chuyến xe (VD: Bến xe Miền Đông ➔ Ngã ba Vũng Tàu ➔ Trạm Dầu Giây ➔ Bến xe Đà Lạt).
  + Thẻ thông tin hành khách trực quan: Họ tên, Số điện thoại, Mã vé QR, Vị trí ghế ngồi (A01, A02), Trạng thái đón (Chưa lên xe / Đã lên xe).
  + Tích hợp nút bấm gọi điện thoại nhanh (`tel:`) hỗ trợ tài xế/phụ xe liên hệ với khách trước khi xe đến trạm đón 10 phút.
  + Nút bấm xác nhận nhanh khách đã lên xe (Check-in) đồng bộ trạng thái ngay lập tức.
  + Đảm bảo tách biệt 100% về đường dẫn và mã nguồn với phân hệ Bán vé POS của Phong (`/company/pos`), loại bỏ hoàn toàn nguy cơ xung đột mã nguồn.

### 📋 Tiêu chí chấp nhận (DoD - Definition of Done)
- [ ] Giao diện responsive mượt mà trên mobile, font chữ to rõ ràng, độ tương phản cao cho tài xế xem ngoài trời.
- [ ] Danh sách hành khách nhóm chính xác theo từng điểm đón/trả dọc tuyến đường.
- [ ] Nút bấm gọi điện thoại (`tel:`) hoạt động chuẩn xác trên các trình duyệt di động (iOS / Android).
- [ ] Nút chuyển trạng thái "Đã lên xe" phản hồi tức thì với hiệu ứng trực quan (tick xanh).
- [ ] Tuyệt đối độc lập ở route `/driver/manifest`, không phụ thuộc hay xung đột với module `/company/pos`.

### 👤 Phụ trách & Phân bổ
- **Người thực hiện**: Đoàn Nhật Cường (Frontend & Mobile Specialist)
- **Điểm Story Point**: 3 SP
- **Mức độ ưu tiên**: Trung bình - Cao (Priority 2)
"""

    labels = [LABELS["Sprint 4"], LABELS["Frontend"], LABELS["Company Portal"]]

    update_url = f"https://api.trello.com/1/cards/{CARD_S405_ID}?key={TRELLO_KEY}&token={TRELLO_TOKEN}"
    put_data = urllib.parse.urlencode({
        "name": new_name,
        "desc": new_desc,
        "idMembers": MEMBER_CUONG,
        "idLabels": ",".join(labels)
    }).encode("utf-8")

    req_put = urllib.request.Request(update_url, data=put_data, method="PUT")
    with urllib.request.urlopen(req_put) as resp:
        card = json.loads(resp.read().decode("utf-8"))
        print(f"✅ ĐÃ CẬP NHẬT THÀNH CÔNG THẺ S405 TRÊN TRELLO:")
        print(f"ID: {card.get('id')}")
        print(f"Name: {card.get('name')}")
        print(f"Members: {card.get('idMembers')}")
        print(f"URL: {card.get('shortUrl')}")

if __name__ == "__main__":
    main()
