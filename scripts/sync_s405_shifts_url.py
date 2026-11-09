import urllib.request
import urllib.parse
import json

TRELLO_KEY = "3305b670e2ea6167c586ce2516d87ebd"
TRELLO_TOKEN = "ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D"
CARD_S405_ID = "6ae8cbcd3440dd9bcf949216"
MEMBER_CUONG = "6ae1b1e83656c2e4f73178d5"

def main():
    name = "[Ưu tiên: 2] [3 SP] [S405][SHIFTS] Quản Lý Ca Trực & Bàn Giao Tiền Mặt Quầy Bến Xe (/company/shifts)"
    desc = """### 🎯 Mục tiêu nghiệp vụ & Kỹ thuật
- Xây dựng phân hệ Quản lý ca trực & Bàn giao tiền mặt quầy vé bến xe độc lập tại route `/company/shifts`.
- Tách rời hoàn toàn khỏi thư mục `/company/pos` của Phong để loại bỏ 100% nguy cơ xung đột mã nguồn (Merge Conflict):
  + File component độc lập: `frontend/src/pages/company/shifts/CompanyShiftsPage.tsx`.
  + Khởi tạo ca trực mới: Nhập tên thu ngân, quầy vé bến xe và số tiền lẻ ban đầu trong két.
  + Theo dõi doanh thu tiền mặt thu được từ các vé bán lẻ tại quầy trong suốt ca trực.
  + Chốt ca trực và lập biên bản đối soát Z-Report (tổng tiền kỳ vọng, tiền thực đếm, chênh lệch thực tế).
  + Nút gửi lệnh in phiếu Z-Report chuẩn hóa cho thủ quỹ nhà xe ký nhận.

### 📋 Tiêu chí chấp nhận (DoD - Definition of Done)
- [x] Khởi tạo ca trực mới và lưu trữ trạng thái OPEN vào danh sách.
- [x] Tính toán chính xác doanh thu tiền mặt và tổng tiền két lý thuyết.
- [x] Modal chốt ca trực và phát hiện độ lệch tiền mặt nếu có.
- [x] Chức năng in biên bản bàn giao Z-Report hoạt động chuẩn.
- [x] Route `/company/shifts` và menu Sidebar hiển thị chuẩn mực trên giao diện TravelEasy Partner.

### 👤 Phụ trách & Phân bổ
- **Người thực hiện**: Đoàn Nhật Cường (Frontend & Mobile Specialist)
- **Điểm Story Point**: 3 SP
- **Mức độ ưu tiên**: Trung bình - Cao (Priority 2)
"""

    url = f"https://api.trello.com/1/cards/{CARD_S405_ID}?key={TRELLO_KEY}&token={TRELLO_TOKEN}"
    put_data = urllib.parse.urlencode({
        "name": name,
        "desc": desc,
        "idMembers": MEMBER_CUONG
    }).encode("utf-8")

    req_put = urllib.request.Request(url, data=put_data, method="PUT")
    with urllib.request.urlopen(req_put) as resp:
        card = json.loads(resp.read().decode("utf-8"))
        print(f"✅ ĐÃ ĐỒNG BỘ THẺ S405 TRÊN TRELLO:")
        print(f"Name: {card.get('name')}")
        print(f"URL: {card.get('shortUrl')}")

if __name__ == "__main__":
    main()
