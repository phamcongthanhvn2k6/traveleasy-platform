import urllib.request
import urllib.parse
import json
import re
import time

TRELLO_KEY = "3305b670e2ea6167c586ce2516d87ebd"
TRELLO_TOKEN = "ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D"

LIST_DONE_S1 = "6ae81053a0bcce0597b2503d"
LIST_DONE_S2 = "6ae810124a6fcb3b47a9063a"
LIST_DONE_S3 = "6ae810128399397fe002ace9"
LIST_DONE_S4 = "6af1419177f61a79bcb8b0cd"
LIST_TODO = "6ad6f486572cd6662754e06f"
LIST_IN_PROGRESS = "6ad6f486572cd6662754e070"
LIST_CODE_REVIEW = "6ad6f486572cd6662754e071"

LABEL_S1 = "6ae804de14244463194aa5e6"
LABEL_S2 = "6ae8051d1c5db33989c70814"
LABEL_S3 = "6ae8051e8bcb4bb0182f08c8"
LABEL_S4 = "6ae8b98c890dfea769e35d07"

def request_trello(url, data=None, method="GET"):
    headers = {"Content-Type": "application/x-www-form-urlencoded"} if data else {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def main():
    print("=== BẮT ĐẦU QUY CHUẨN TOÀN BỘ TRELLO VỀ 3 SPRINTS ===")

    # 1. Đóng cột Done Sprint 4
    try:
        url_close_s4 = f"https://api.trello.com/1/lists/{LIST_DONE_S4}/closed?value=true&key={TRELLO_KEY}&token={TRELLO_TOKEN}"
        request_trello(url_close_s4, data=b"", method="PUT")
        print("✅ Đã đóng (archive) danh sách 'Done Sprint 4'")
    except Exception as e:
        print(f"⚠️ Lỗi khi đóng Done Sprint 4: {e}")

    # 2. Xử lý 33 thẻ trong Done Sprint 3
    url_done_s3 = f"https://api.trello.com/1/lists/{LIST_DONE_S3}/cards?key={TRELLO_KEY}&token={TRELLO_TOKEN}"
    cards_done_s3 = request_trello(url_done_s3)
    print(f"\nĐang xử lý {len(cards_done_s3)} thẻ cũ trong Done Sprint 3...")

    # Chia 16 thẻ đầu sang Done Sprint 1 (mã S1xx), 17 thẻ sau sang Done Sprint 2 (mã S2xx)
    s1_count = 120
    s2_count = 220

    for idx, card in enumerate(cards_done_s3):
        cid = card["id"]
        old_name = card["name"]
        labels = card.get("idLabels", [])
        
        if idx < 16:
            # Chuyển sang Done Sprint 1
            target_list = LIST_DONE_S1
            # Đổi [S3xx] thành [S1xx]
            new_name = re.sub(r'\[S3\d{2}[A-Z]?\]', f'[S{s1_count}]', old_name)
            s1_count += 1
            # Đổi nhãn sang Sprint 1
            new_labels = [l for l in labels if l not in (LABEL_S2, LABEL_S3, LABEL_S4)]
            if LABEL_S1 not in new_labels:
                new_labels.append(LABEL_S1)
            target_name = "Done Sprint 1"
        else:
            # Chuyển sang Done Sprint 2
            target_list = LIST_DONE_S2
            # Đổi [S3xx] thành [S2xx]
            new_name = re.sub(r'\[S3\d{2}[A-Z]?\]', f'[S{s2_count}]', old_name)
            s2_count += 1
            # Đổi nhãn sang Sprint 2
            new_labels = [l for l in labels if l not in (LABEL_S1, LABEL_S3, LABEL_S4)]
            if LABEL_S2 not in new_labels:
                new_labels.append(LABEL_S2)
            target_name = "Done Sprint 2"

        # Cập nhật card
        put_data = urllib.parse.urlencode({
            "name": new_name,
            "idList": target_list,
            "idLabels": ",".join(new_labels)
        }).encode("utf-8")
        update_url = f"https://api.trello.com/1/cards/{cid}?key={TRELLO_KEY}&token={TRELLO_TOKEN}"
        try:
            request_trello(update_url, data=put_data, method="PUT")
            print(f"[{idx+1}/{len(cards_done_s3)}] Chuyển thẻ -> {target_name}: {new_name[:70]}...")
        except Exception as e:
            print(f"⚠️ Lỗi update thẻ {cid}: {e}")
        time.sleep(0.15)

    # 3. Đổi 10 thẻ cốt lõi từ [S401] - [S410] thành [S301] - [S310]
    print("\nĐang quy chuẩn 10 thẻ nghiệp vụ cốt lõi từ S4xx sang S3xx...")
    s4_mapping = {
        "S401": ("S301", "[Ưu tiên: 1] [4 SP] [S301][CORE] Đồng bộ Khóa ghế Concurrency Lock 10:00 & Giữ chỗ Real-time SSE"),
        "S402": ("S302", "[Ưu tiên: 1] [3 SP] [S302][MAIL] Dịch vụ Email Tự Động Phê Duyệt Hồ Sơ Đối Tác & Cấp Phát Tài Khoản B2B (/company/login)"),
        "S403": ("S303", "[Ưu tiên: 1] [4 SP] [S303][DEVOPS] Đóng Gói Docker Compose Production & Triển Khai CI/CD Lên VPS Thực Tế (103.72.57.149)"),
        "S404": ("S304", "[Ưu tiên: 2] [4 SP] [S304][POS] Giao diện & API Bán Vé Nhanh Tại Quầy Bến Xe POS (/company/pos) & In Vé Nhiệt 80mm"),
        "S405": ("S305", "[Ưu tiên: 2] [3 SP] [S305][SHIFTS] Quản Lý Ca Trực & Bàn Giao Tiền Mặt Quầy Bến Xe (/company/shifts)"),
        "S406": ("S306", "[Ưu tiên: 2] [4 SP] [S306][TRACKING] Bản Đồ Định Vị GPS Live Tracking Xe Chạy Thời Gian Thực (/tracking/:tripId)"),
        "S407": ("S307", "[Ưu tiên: 2] [3 SP] [S307][PRICING] Phân Hệ Quản Trị Giá Vé Động & Phụ Thu Lễ Tết/Cuối Tuần (/company/pricing-rules)"),
        "S408": ("S308", "[Ưu tiên: 1] [3 SP] [S308][DEMO-DEFENSE] Xây Dựng Trung Tâm Trình Diễn Demo Hub 15 Phút (/demo) & Slide Bảo Vệ OJT"),
        "S409": ("S309", "[Ưu tiên: 1] [3 SP] [S309][PERF] Màn hình Loading chuyển trang & Tối ưu hiệu năng giao diện SWR Cache 0ms, Skeleton Vé của tôi (/my-tickets)"),
        "S410": ("S310", "[Ưu tiên: 2] [3 SP] [S310][REPORTS] Phân Hệ Báo Cáo Thống Kê Doanh Thu & Tỷ Lệ Lấp Đầy Ghế Nhà Xe (/company/reports)"),
    }

    url_todo = f"https://api.trello.com/1/lists/{LIST_TODO}/cards?key={TRELLO_KEY}&token={TRELLO_TOKEN}"
    cards_todo = request_trello(url_todo)

    for c in cards_todo:
        c_name = c["name"]
        matched_key = next((k for k in s4_mapping if k in c_name), None)
        if matched_key:
            new_prefix, full_new_name = s4_mapping[matched_key]
            labels = c.get("idLabels", [])
            new_labels = [l for l in labels if l != LABEL_S4]
            if LABEL_S3 not in new_labels:
                new_labels.append(LABEL_S3)
            
            # Cập nhật desc thay S4 thành S3
            old_desc = c.get("desc", "")
            new_desc = old_desc.replace("Sprint 4", "Sprint 3").replace("S40", "S30").replace("S410", "S310")

            put_data = urllib.parse.urlencode({
                "name": full_new_name,
                "desc": new_desc,
                "idLabels": ",".join(new_labels)
            }).encode("utf-8")
            url_up = f"https://api.trello.com/1/cards/{c['id']}?key={TRELLO_KEY}&token={TRELLO_TOKEN}"
            try:
                request_trello(url_up, data=put_data, method="PUT")
                print(f"✅ Đã đổi mã {matched_key} ➔ {new_prefix}: {full_new_name[:65]}...")
            except Exception as e:
                print(f"⚠️ Lỗi update {matched_key}: {e}")
            time.sleep(0.15)

    print("\n=== HOÀN TẤT ĐỒNG BỘ TRELLO CHUẨN 3 SPRINTS ===")

if __name__ == "__main__":
    main()
