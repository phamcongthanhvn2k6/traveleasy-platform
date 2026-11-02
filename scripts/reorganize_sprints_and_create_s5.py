#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
import os
import json
import time
import urllib.request
import urllib.parse
import urllib.error

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

KEY = "29657650aaf408d6e18a6c3cac462abf"
TOKEN = "ATTA5df659447ca073fdb453ecfbd5a2c6e6f50d2c7ead022955d6a2db31d4e600ea614476D8"
BOARD_ID = "AA5BYoe1"

LIST_DONE_S2 = "6ae810124a6fcb3b47a9063a"
LIST_DONE_S3 = "6ae810128399397fe002ace9"
LIST_DONE_S4 = "6ae810133cffecec9ae9a6d0"
LIST_BACKLOG_S4 = "6ae81011b079250c3fdf6bc0"

LABEL_S2 = "6ae8051d1c5db33989c70814" # Sprint 2 (sky)
LABEL_S3 = "6ae8051e8bcb4bb0182f08c8" # Sprint 3 (purple)
LABEL_S4 = "6ae8051e5f83cfe7677bec4c" # Sprint 4 (green)
LABEL_FE = "6ada2975f9e7748cabcd7157" # Frontend
LABEL_BE = "6ada29757825b08b7f3cf963" # Backend
LABEL_CUSTOMER = "6ada29776cd0ced0e1f3b2d1"
LABEL_COMPANY = "6ae8051fd10c9c805fd8de18"
LABEL_ADMIN = "6ada297762b48680ef71bcd2"
LABEL_QA = "6ae8052017abe46a47aaf487"
LABEL_CORE = "6ada29760151390fa06f05fa"

def api_call(url, method="GET", data=None):
    sep = "&" if "?" in url else "?"
    full_url = f"{url}{sep}key={KEY}&token={TOKEN}"
    headers = {"Accept": "application/json"}
    body = None
    if data is not None:
        headers["Content-Type"] = "application/json"
        body = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(full_url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            res_str = r.read().decode("utf-8")
            return json.loads(res_str) if res_str else {}
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8", errors="ignore")
        print(f"   [HTTP Error {e.code}] {err}")
        return None
    except Exception as e:
        print(f"   [Network Error] {e}")
        return None

def update_card_labels(card, remove_labels, add_labels):
    current = card.get("idLabels", [])
    updated = [lid for lid in current if lid not in remove_labels]
    for lid in add_labels:
        if lid not in updated:
            updated.append(lid)
    return updated

def main():
    print("🚀 Bắt đầu tái cấu trúc các Sprint theo yêu cầu:")
    print("   1. Gộp toàn bộ Sprint 3 vào Sprint 2")
    print("   2. Gộp nửa đầu Sprint 4 (22 thẻ) vào Sprint 2")
    print("   3. Gộp nửa sau Sprint 4 (22 thẻ) vào Sprint 3")
    print("   4. Tạo danh sách và chuẩn hóa 12 thẻ mới cho Sprint 5")

    # 1. Lấy thẻ từ Done Sprint 3 và Done Sprint 4
    cards_s3 = api_call(f"https://api.trello.com/1/lists/{LIST_DONE_S3}/cards") or []
    cards_s4 = api_call(f"https://api.trello.com/1/lists/{LIST_DONE_S4}/cards") or []

    print(f"\n📦 Tìm thấy {len(cards_s3)} thẻ ở Done Sprint 3 và {len(cards_s4)} thẻ ở Done Sprint 4.")

    # BƯỚC 1: Chuyển toàn bộ thẻ Done Sprint 3 sang Done Sprint 2
    print("\n--- BƯỚC 1: Chuyển toàn bộ 40 thẻ Sprint 3 sang Done Sprint 2 ---")
    for i, c in enumerate(cards_s3, 1):
        c_id = c["id"]
        short_title = c["name"][:55]
        new_labels = update_card_labels(c, [LABEL_S3, LABEL_S4], [LABEL_S2])
        api_call(f"https://api.trello.com/1/cards/{c_id}", method="PUT", data={
            "idList": LIST_DONE_S2,
            "idLabels": new_labels
        })
        print(f"[{i}/{len(cards_s3)}] S3 -> S2: {short_title}... (✅ Done)")
        time.sleep(0.08)

    # BƯỚC 2: Chuyển 22 thẻ đầu của Sprint 4 sang Done Sprint 2
    s4_part1 = cards_s4[:22]
    s4_part2 = cards_s4[22:]

    print("\n--- BƯỚC 2: Chuyển 22 thẻ đầu của Sprint 4 sang Done Sprint 2 ---")
    for i, c in enumerate(s4_part1, 1):
        c_id = c["id"]
        short_title = c["name"][:55]
        new_labels = update_card_labels(c, [LABEL_S3, LABEL_S4], [LABEL_S2])
        api_call(f"https://api.trello.com/1/cards/{c_id}", method="PUT", data={
            "idList": LIST_DONE_S2,
            "idLabels": new_labels
        })
        print(f"[{i}/22] S4 (Part 1) -> S2: {short_title}... (✅ Done)")
        time.sleep(0.08)

    # BƯỚC 3: Chuyển 22 thẻ còn lại của Sprint 4 sang Done Sprint 3
    print("\n--- BƯỚC 3: Chuyển 22 thẻ sau của Sprint 4 sang Done Sprint 3 ---")
    for i, c in enumerate(s4_part2, 1):
        c_id = c["id"]
        short_title = c["name"][:55]
        new_labels = update_card_labels(c, [LABEL_S2, LABEL_S4], [LABEL_S3])
        api_call(f"https://api.trello.com/1/cards/{c_id}", method="PUT", data={
            "idList": LIST_DONE_S3,
            "idLabels": new_labels
        })
        print(f"[{i}/22] S4 (Part 2) -> S3: {short_title}... (✅ Done)")
        time.sleep(0.08)

    # BƯỚC 4: Tạo nhãn Sprint 5 và danh sách Sprint Backlog - SPRINT 5
    print("\n--- BƯỚC 4: Tạo nhãn Sprint 5 và Danh sách Sprint 5 ---")
    
    # Tạo hoặc lấy nhãn Sprint 5
    labels = api_call(f"https://api.trello.com/1/boards/{BOARD_ID}/labels") or []
    s5_label = next((l for l in labels if l.get("name") == "Sprint 5"), None)
    if not s5_label:
        s5_label = api_call(f"https://api.trello.com/1/boards/{BOARD_ID}/labels", method="POST", data={
            "name": "Sprint 5",
            "color": "sky"
        })
        print(f"✅ Đã tạo nhãn 'Sprint 5' mới: {s5_label.get('id')}")
    else:
        print(f"ℹ️ Đã có nhãn 'Sprint 5': {s5_label.get('id')}")
    label_s5_id = s5_label.get("id")

    # Tạo danh sách Sprint Backlog - SPRINT 5 nếu chưa có
    board_lists = api_call(f"https://api.trello.com/1/boards/{BOARD_ID}/lists") or []
    s5_list = next((l for l in board_lists if "SPRINT 5" in l.get("name", "").upper()), None)
    if not s5_list:
        s5_list = api_call(f"https://api.trello.com/1/boards/{BOARD_ID}/lists", method="POST", data={
            "name": "Sprint Backlog - SPRINT 5",
            "pos": 5 # Đặt cạnh Sprint Backlog - SPRINT 4
        })
        print(f"✅ Đã tạo danh sách 'Sprint Backlog - SPRINT 5': {s5_list.get('id')}")
    else:
        print(f"ℹ️ Đã có danh sách 'Sprint Backlog - SPRINT 5': {s5_list.get('id')}")
    list_s5_id = s5_list.get("id")

    # BƯỚC 5: Tạo 12 thẻ chuẩn hóa cho Sprint 5
    print("\n--- BƯỚC 5: Tạo 12 thẻ chuẩn hóa nghiệp vụ cho Sprint 5 ---")
    
    s5_tasks = [
        {
            "name": "[Ưu tiên: 1] [5 SP] [FE][S501] Bản đồ theo dõi lộ trình và vị trí xe khách thời gian thực (/track)",
            "desc": """1. TIÊU ĐỀ THẺ
[Ưu tiên: 1] [5 SP] [FE][S501] Bản đồ theo dõi lộ trình và vị trí xe khách thời gian thực (/track)

2. THÔNG TIN PHỤ TRỢ
- Phân hệ: Cổng khách hàng (Customer Portal)
- Kỳ Sprint: Sprint 5
- Điểm độ phức tạp: 5 Story Points
- Trạng thái: Sẵn sàng phát triển (Ready for Dev)

3. MÔ TẢ CHI TIẾT
Xây dựng giao diện bản đồ tương tác hiển thị vị trí xe đang lăn bánh thực tế, các trạm dừng đón/trả, quãng đường đã đi và dự báo thời gian đến trạm đón (ETA).""",
            "labels": [LABEL_FE, LABEL_CUSTOMER, label_s5_id, LABEL_CORE],
            "dod": [
                "Bản đồ Leaflet/OpenStreetMap hiển thị mượt mà trên cả desktop và mobile.",
                "Icon xe khách di chuyển cập nhật theo tọa độ GPS truyền về từ WebSocket/SSE.",
                "Hiển thị bảng thông tin nổi (Popup): Biển số xe, tốc độ (km/h), khoảng cách còn lại và thời gian dự kiến đến (ETA).",
                "Có nút định vị vị trí hiện tại của khách hàng để đo khoảng cách tới xe."
            ]
        },
        {
            "name": "[Ưu tiên: 1] [5 SP] [BE][S501] Dịch vụ tính toán ETA, khoảng cách và luồng WebSocket/SSE GPS (/api/v1/tracking)",
            "desc": """1. TIÊU ĐỀ THẺ
[Ưu tiên: 1] [5 SP] [BE][S501] Dịch vụ tính toán ETA, khoảng cách và luồng WebSocket/SSE GPS (/api/v1/tracking)

2. THÔNG TIN PHỤ TRỢ
- Phân hệ: Cổng khách hàng & Lõi hệ thống (Backend Core)
- Kỳ Sprint: Sprint 5
- Điểm độ phức tạp: 5 Story Points
- Trạng thái: Sẵn sàng phát triển (Ready for Dev)

3. MÔ TẢ CHI TIẾT
Cung cấp REST API và kênh WebSocket/SSE đẩy tọa độ xe liên tục về client mỗi 3-5 giây. Tính toán ETA dựa trên giải thuật khoảng cách Haversine và tốc độ trung bình của tuyến đường.""",
            "labels": [LABEL_BE, LABEL_CUSTOMER, label_s5_id, LABEL_CORE],
            "dod": [
                "Endpoint GET /api/v1/tracking/{tripId} trả về tọa độ hiện tại, lộ trình polyline và danh sách trạm đón.",
                "Kênh SSE/WebSocket đẩy dữ liệu tọa độ mượt mà dưới 500ms độ trễ.",
                "Công thức tính ETA phản ánh chính xác khoảng cách và trừ hao dừng đỗ tại trạm.",
                "Kiểm thử chịu tải đồng thời 500 kết nối theo dõi cùng lúc không nghẽn RAM."
            ]
        },
        {
            "name": "[Ưu tiên: 2] [5 SP] [FE][S502] Giao diện đặt gửi bưu kiện, tra cứu vận đơn và in phiếu QR (/cargo)",
            "desc": """1. TIÊU ĐỀ THẺ
[Ưu tiên: 2] [5 SP] [FE][S502] Giao diện đặt gửi bưu kiện, tra cứu vận đơn và in phiếu QR (/cargo)

2. THÔNG TIN PHỤ TRỢ
- Phân hệ: Dịch vụ mở rộng (Cargo & Logistics)
- Kỳ Sprint: Sprint 5
- Điểm độ phức tạp: 5 Story Points
- Trạng thái: Sẵn sàng phát triển (Ready for Dev)

3. MÔ TẢ CHI TIẾT
Trang gửi hàng bưu kiện liên tỉnh: Chọn văn phòng gửi/nhận, loại hàng hóa, cân nặng/kích thước, tính cước tức thời. Sinh mã vận đơn CG-2026-XXXX kèm QR code để dán lên kiện hàng.""",
            "labels": [LABEL_FE, LABEL_CUSTOMER, label_s5_id],
            "dod": [
                "Form đặt gửi hàng có xác thực thông tin người gửi/nhận đầy đủ số điện thoại và địa chỉ.",
                "Tự động tính cước vận chuyển hiển thị ngay khi nhập trọng lượng và chọn tuyến.",
                "Màn hình tra cứu lộ trình hàng hóa 4 bước: Tiếp nhận -> Lên xe -> Đến kho đích -> Đã giao.",
                "Hỗ trợ in phiếu gửi hàng khổ A5 hoặc tem nhãn dán QR bưu kiện."
            ]
        },
        {
            "name": "[Ưu tiên: 2] [5 SP] [BE][S502] Động cơ tính cước vận chuyển theo km/kg và quản lý kho trạm (/api/v1/cargo)",
            "desc": """1. TIÊU ĐỀ THẺ
[Ưu tiên: 2] [5 SP] [BE][S502] Động cơ tính cước vận chuyển theo km/kg và quản lý kho trạm (/api/v1/cargo)

2. THÔNG TIN PHỤ TRỢ
- Phân hệ: Lõi bưu chính & Kho bãi (Backend Logistics)
- Kỳ Sprint: Sprint 5
- Điểm độ phức tạp: 5 Story Points
- Trạng thái: Sẵn sàng phát triển (Ready for Dev)

3. MÔ TẢ CHI TIẾT
Module quản lý vòng đời bưu kiện: Tạo đơn gửi, áp bảng cước động theo khoảng cách tuyến và phân loại hàng (tiêu chuẩn, cồng kềnh, giá trị cao). API cập nhật trạng thái kho bãi của nhân viên.""",
            "labels": [LABEL_BE, LABEL_COMPANY, label_s5_id],
            "dod": [
                "Entity CargoPackage và bảng quan hệ cargo_packages chuẩn hóa CSDL PostgreSQL.",
                "API POST /api/v1/cargo/orders tạo đơn và sinh mã vận đơn duy nhất (Idempotent).",
                "API PATCH /api/v1/cargo/orders/{id}/status dành cho nhân viên kho cập nhật trạng thái.",
                "Tích hợp mã hóa hash QR vận đơn chống làm giả."
            ]
        },
        {
            "name": "[Ưu tiên: 2] [3 SP] [FE][S503] Giao diện ví điểm thưởng EasyXu, vòng quay may mắn và ưu đãi (/rewards)",
            "desc": """1. TIÊU ĐỀ THẺ
[Ưu tiên: 2] [3 SP] [FE][S503] Giao diện ví điểm thưởng EasyXu, vòng quay may mắn và ưu đãi (/rewards)

2. THÔNG TIN PHỤ TRỢ
- Phân hệ: Trải nghiệm khách hàng (Customer Loyalty)
- Kỳ Sprint: Sprint 5
- Điểm độ phức tạp: 3 Story Points
- Trạng thái: Sẵn sàng phát triển (Ready for Dev)

3. MÔ TẢ CHI TIẾT
Giao diện trung tâm quà tặng: Hiển thị số dư EasyXu tích lũy, tiến trình thăng hạng thẻ (Đồng, Bạc, Vàng, Kim Cương), vòng quay may mắn điểm danh mỗi ngày và danh mục đổi quà/voucher.""",
            "labels": [LABEL_FE, LABEL_CUSTOMER, label_s5_id],
            "dod": [
                "Hiển thị thẻ hội viên thiết kế gradient cao cấp với thanh tiến trình nâng hạng.",
                "Vòng quay may mắn (Canvas Lucky Wheel) quay mượt mà kèm âm thanh và hiệu ứng pháo hoa.",
                "Cửa hàng đổi mã giảm giá có nút 'Đổi Ngay' kèm kiểm tra số dư xu.",
                "Tương thích hoàn hảo trên điện thoại và máy tính bảng."
            ]
        },
        {
            "name": "[Ưu tiên: 2] [3 SP] [BE][S503] Nghiệp vụ tích điểm tự động theo vé, phân hạng hội viên VIP (/api/v1/loyalty)",
            "desc": """1. TIÊU ĐỀ THẺ
[Ưu tiên: 2] [3 SP] [BE][S503] Nghiệp vụ tích điểm tự động theo vé, phân hạng hội viên VIP (/api/v1/loyalty)

2. THÔNG TIN PHỤ TRỢ
- Phân hệ: Quản lý khách hàng thân thiết (Backend Loyalty Engine)
- Kỳ Sprint: Sprint 5
- Điểm độ phức tạp: 3 Story Points
- Trạng thái: Sẵn sàng phát triển (Ready for Dev)

3. MÔ TẢ CHI TIẾT
Cơ chế tự động cộng EasyXu khi đơn đặt vé chuyển sang trạng thái COMPLETED (tỷ lệ 3% giá trị đơn). Xử lý quay thưởng ngẫu nhiên hàng ngày có kiểm soát tỷ lệ trúng và chống gian lận đa tài khoản.""",
            "labels": [LABEL_BE, LABEL_CUSTOMER, label_s5_id],
            "dod": [
                "Lắng nghe sự kiện BookingCompletedEvent để cộng điểm tự động trong Transaction an toàn.",
                "API POST /api/v1/loyalty/spin thực hiện quay thưởng: 1 lượt/ngày/người dùng.",
                "API POST /api/v1/loyalty/redeem trừ xu và sinh voucher cá nhân hóa.",
                "Ghi log biến động số dư xu chi tiết phục vụ kiểm toán."
            ]
        },
        {
            "name": "[Ưu tiên: 2] [5 SP] [FE][S504] Giao diện đặt Combo du lịch trọn gói Vé xe khứ hồi + Khách sạn (/combo, /hotel)",
            "desc": """1. TIÊU ĐỀ THẺ
[Ưu tiên: 2] [5 SP] [FE][S504] Giao diện đặt Combo du lịch trọn gói Vé xe khứ hồi + Khách sạn (/combo, /hotel)

2. THÔNG TIN PHỤ TRỢ
- Phân hệ: Du lịch & Khách sạn (Travel Packages)
- Kỳ Sprint: Sprint 5
- Điểm độ phức tạp: 5 Story Points
- Trạng thái: Sẵn sàng phát triển (Ready for Dev)

3. MÔ TẢ CHI TIẾT
Trang tổng hợp gói du lịch trọn gói tại Đà Lạt, Vũng Tàu, Nha Trang, Sa Pa: Cho phép chọn đồng thời cặp vé xe khứ hồi và phòng khách sạn / homestay view đẹp với mức giá chiết khấu 15-20%.""",
            "labels": [LABEL_FE, LABEL_CUSTOMER, label_s5_id],
            "dod": [
                "Bộ lọc khách sạn theo khu vực trung tâm, số sao, tiện ích (bể bơi, buffet sáng).",
                "Bước chọn phòng tích hợp trơn tru vào luồng chọn ghế xe khứ hồi.",
                "Tính tổng hóa đơn gói combo và hiển thị rõ số tiền tiết kiệm được so với mua lẻ.",
                "Hỗ trợ xem ảnh phòng 360 độ và chính sách nhận/trả phòng."
            ]
        },
        {
            "name": "[Ưu tiên: 2] [5 SP] [BE][S504] API kiểm tra tình trạng phòng khách sạn và đối soát gói combo (/api/v1/combos)",
            "desc": """1. TIÊU ĐỀ THẺ
[Ưu tiên: 2] [5 SP] [BE][S504] API kiểm tra tình trạng phòng khách sạn và đối soát gói combo (/api/v1/combos)

2. THÔNG TIN PHỤ TRỢ
- Phân hệ: Đối tác lưu trú & Đặt chỗ (Backend Combo Engine)
- Kỳ Sprint: Sprint 5
- Điểm độ phức tạp: 5 Story Points
- Trạng thái: Sẵn sàng phát triển (Ready for Dev)

3. MÔ TẢ CHI TIẾT
Quản lý dữ liệu đối tác khách sạn liên kết, tình trạng phòng trống (Allotment) theo ngày, và logic ghép nối vé xe - phòng nghỉ trong cùng một mã đơn hàng duy nhất.""",
            "labels": [LABEL_BE, LABEL_ADMIN, label_s5_id],
            "dod": [
                "Cấu trúc bảng hotels, hotel_rooms, combo_packages trong PostgreSQL.",
                "Khóa giữ phòng đồng thời với khóa giữ chỗ ghế xe (Two-Phase Commit an toàn).",
                "API phân tách doanh thu đối soát: phần thanh toán cho nhà xe và phần cho khách sạn.",
                "Xử lý hủy gói combo theo chính sách hủy liên hoàn."
            ]
        },
        {
            "name": "[Ưu tiên: 1] [5 SP] [FE][S505] Cổng di động điều phối danh sách hành khách theo trạm đón của bác tài (/driver)",
            "desc": """1. TIÊU ĐỀ THẺ
[Ưu tiên: 1] [5 SP] [FE][S505] Cổng di động điều phối danh sách hành khách theo trạm đón của bác tài (/driver)

2. THÔNG TIN PHỤ TRỢ
- Phân hệ: Cổng điều hành bác tài (Driver Portal)
- Kỳ Sprint: Sprint 5
- Điểm độ phức tạp: 5 Story Points
- Trạng thái: Sẵn sàng phát triển (Ready for Dev)

3. MÔ TẢ CHI TIẾT
Giao diện tối ưu di động dành riêng cho tài xế và phụ xe: Hiển thị danh sách khách hàng đón dọc đường (Passenger Manifest) xếp theo thứ tự lộ trình, nút gọi điện thoại nhanh 1-chạm và điểm danh.""",
            "labels": [LABEL_FE, LABEL_COMPANY, label_s5_id, LABEL_CORE],
            "dod": [
                "Thiết kế giao diện Mobile Dark Mode chống chói mắt ban đêm khi lái xe.",
                "Nút bấm to, rõ ràng: 'Đã lên xe', 'Đón trễ', 'Vắng mặt (No-show)'.",
                "Tích hợp link tel: để bác tài bấm là mở ứng dụng gọi điện thoại ngay lập tức.",
                "Hoạt động offline tốt khi xe đi vào vùng đèo mất sóng 4G."
            ]
        },
        {
            "name": "[Ưu tiên: 1] [5 SP] [BE][S505] API điểm danh khách lên xe, gọi nhanh 1-chạm và báo cáo chậm giờ (/api/v1/driver)",
            "desc": """1. TIÊU ĐỀ THẺ
[Ưu tiên: 1] [5 SP] [BE][S505] API điểm danh khách lên xe, gọi nhanh 1-chạm và báo cáo chậm giờ (/api/v1/driver)

2. THÔNG TIN PHỤ TRỢ
- Phân hệ: Điều hành vận tải thời gian thực (Backend Dispatch Core)
- Kỳ Sprint: Sprint 5
- Điểm độ phức tạp: 5 Story Points
- Trạng thái: Sẵn sàng phát triển (Ready for Dev)

3. MÔ TẢ CHI TIẾT
Cung cấp API cho bác tài đăng nhập bằng mã tài xế hoặc số điện thoại, tải danh sách khách của chuyến đang chạy, đồng bộ trạng thái đón trả và gửi cảnh báo chậm giờ xe chạy tới văn phòng.""",
            "labels": [LABEL_BE, LABEL_COMPANY, label_s5_id, LABEL_CORE],
            "dod": [
                "Phân quyền ROLE_DRIVER chỉ được xem chuyến xe mình được phân công phụ trách.",
                "API GET /api/v1/driver/manifest trả danh sách khách nhóm theo từng trạm đón.",
                "API PATCH /api/v1/driver/passenger-status cập nhật trạng thái có chữ ký thời gian.",
                "Tự động gửi cảnh báo về Dashboard nhà xe khi có khách vắng mặt hoặc xe bị trễ quá 15 phút."
            ]
        },
        {
            "name": "[Ưu tiên: 3] [3 SP] [FE][S506] Giao diện cấu hình trung tâm thông báo đa kênh (/profile/notifications)",
            "desc": """1. TIÊU ĐỀ THẺ
[Ưu tiên: 3] [3 SP] [FE][S506] Giao diện cấu hình trung tâm thông báo đa kênh (/profile/notifications)

2. THÔNG TIN PHỤ TRỢ
- Phân hệ: Cài đặt người dùng (User Preferences)
- Kỳ Sprint: Sprint 5
- Điểm độ phức tạp: 3 Story Points
- Trạng thái: Sẵn sàng phát triển (Ready for Dev)

3. MÔ TẢ CHI TIẾT
Cho phép khách hàng bật/tắt nhận thông báo qua Email, SMS và Web Push Notification về: Nhắc nhở giờ khởi hành, biển số xe & số điện thoại bác tài, mã giảm giá sinh nhật.""",
            "labels": [LABEL_FE, LABEL_CUSTOMER, label_s5_id],
            "dod": [
                "Giao diện danh sách chuyển đổi (Toggle switches) trực quan cho từng kênh thông báo.",
                "Hộp thư thông báo trong ứng dụng (In-app Notification Dropdown) có số đếm chưa đọc.",
                "Lưu cấu hình tức thời và đồng bộ trên mọi thiết bị.",
                "Xem lại lịch sử các thông báo đã gửi trong 30 ngày."
            ]
        },
        {
            "name": "[Ưu tiên: 3] [3 SP] [BE][S506] Dịch vụ tự động gửi thông báo SMS/Zalo/Email trước giờ chạy 2 tiếng (/api/v1/notifications)",
            "desc": """1. TIÊU ĐỀ THẺ
[Ưu tiên: 3] [3 SP] [BE][S506] Dịch vụ tự động gửi thông báo SMS/Zalo/Email trước giờ chạy 2 tiếng (/api/v1/notifications)

2. THÔNG TIN PHỤ TRỢ
- Phân hệ: Dịch vụ thông báo tự động (Backend Notification Engine)
- Kỳ Sprint: Sprint 5
- Điểm độ phức tạp: 3 Story Points
- Trạng thái: Sẵn sàng phát triển (Ready for Dev)

3. MÔ TẢ CHI TIẾT
Tác vụ chạy ngầm định kỳ (Spring @Scheduled) quét các chuyến xe chuẩn bị khởi hành trong vòng 120 phút tới, tự động gửi tin nhắn SMS Brandname/Zalo ZNS/Email thông báo biển số xe, vị trí đón và số điện thoại tài xế.""",
            "labels": [LABEL_BE, LABEL_CUSTOMER, label_s5_id],
            "dod": [
                "Job tự động quét mỗi 10 phút không làm nghẽn thread pool.",
                "Template thông báo chuẩn hóa HTML Email và nội dung SMS ngắn gọn súc tích.",
                "Cơ chế Idempotent chống gửi trùng tin nhắn nhiều lần cho cùng một vé.",
                "Ghi nhận trạng thái gửi thành công / thất bại vào bảng notification_logs."
            ]
        }
    ]

    for idx, task in enumerate(s5_tasks, 1):
        print(f"\n[{idx}/12] Tạo thẻ Sprint 5: {task['name'][:60]}...")
        card_data = {
            "idList": list_s5_id,
            "name": task["name"],
            "desc": task["desc"],
            "idLabels": task["labels"],
            "pos": "bottom"
        }
        created = api_call("https://api.trello.com/1/cards", method="POST", data=card_data)
        if created and "id" in created:
            c_id = created["id"]
            # Tạo checklist DoD
            ck = api_call(f"https://api.trello.com/1/cards/{c_id}/checklists", method="POST", data={
                "name": "Tiêu chí nghiệm thu (DoD)"
            })
            if ck and "id" in ck:
                ck_id = ck["id"]
                for item_text in task["dod"]:
                    api_call(f"https://api.trello.com/1/checklists/{ck_id}/checkItems", method="POST", data={
                        "name": item_text,
                        "checked": False
                    })
                    time.sleep(0.06)
            print("   ✅ Đã tạo thẻ kèm Checklist DoD thành công!")
        time.sleep(0.1)

    print("\n" + "="*60)
    print("🎉 TÁI CẤU TRÚC VÀ TẠO MỚI SPRINT 5 THÀNH CÔNG RỰC RỠ!")
    print("="*60)

if __name__ == "__main__":
    main()

