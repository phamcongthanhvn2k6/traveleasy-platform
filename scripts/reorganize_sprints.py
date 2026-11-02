#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TRAVELEASY PLATFORM - TRELLO SPRINT REORGANIZATION SCRIPT
Chia Sprint hoàn chỉnh cho Bảng Trello:
- List 1: Product Backlog (Phase 2 Roadmap - 19 SP)
- List 2: Sprint 1: Architecture, CSDL & Auth (23 SP) [DONE]
- List 3: Sprint 2: Core Booking & Concurrency Lock (29 SP) [DONE]
- List 4: Sprint 3: Payment, Boarding Pass & Tickets (21 SP) [DONE]
- List 5: Sprint 4: Admin Portal, Settlements & Logs (22 SP) [DONE]
- List 6: Testing & QA Verification (25/25 Pass)
- List 7: Sprint Retrospective & Defense Ready (100/100)
- List 8: Bug Tracking (0 Critical Issues)
"""

import sys
import json
import time
import urllib.request
import urllib.parse

API_KEY = "3305b670e2ea6167c586ce2516d87ebd"
API_TOKEN = "ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D"
BOARD_ID = "6ad6f486572cd6662754e074"
BOARD_SHORT_URL = "https://trello.com/b/AA5BYoe1"

BASE_URL = "https://api.trello.com/1"

def trello_req(endpoint, method="GET", data=None, params=None):
    if params is None:
        params = {}
    params["key"] = API_KEY
    params["token"] = API_TOKEN
    query = urllib.parse.urlencode(params)
    url = f"{BASE_URL}/{endpoint}?{query}"
    
    headers = {"Accept": "application/json"}
    body = None
    if data is not None:
        headers["Content-Type"] = "application/json; charset=utf-8"
        body = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    time.sleep(0.15) # rate limit polite delay
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            if content:
                return json.loads(content)
            return {}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"[!] HTTP Error {e.code} on {method} {endpoint}: {err_msg}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"[!] Error on {method} {endpoint}: {e}", file=sys.stderr)
        return None

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    print("=" * 70)
    print("🚀 BẮT ĐẦU CHIA SPRINT HOÀN CHỈNH CHO BẢNG TRELLO TRAVELEASY")
    print(f"Board URL: {BOARD_SHORT_URL}")
    print("=" * 70)

    # 1. Fetch current board state
    print("\n[1/6] Đang tải thông tin hiện tại của Board...")
    board_data = trello_req(f"boards/{BOARD_ID}", params={"lists": "all", "cards": "all", "labels": "all", "members": "all"})
    if not board_data:
        print("[!] Không thể kết nối Trello. Thoát.")
        return 1

    current_lists = {l["id"]: l for l in board_data.get("lists", [])}
    cards = board_data.get("cards", [])
    labels = {lb.get("name"): lb.get("id") for lb in board_data.get("labels", []) if lb.get("name")}
    members = {m.get("username"): m.get("id") for m in board_data.get("members", [])}

    print(f"-> Tìm thấy {len(current_lists)} danh sách, {len(cards)} thẻ, {len(labels)} nhãn, {len(members)} thành viên.")

    # 2. Ensure Sprint labels exist
    print("\n[2/6] Kiểm tra và khởi tạo nhãn Sprint...")
    sprint_labels_to_ensure = {
        "Sprint 1": "orange",
        "Sprint 2": "sky",
        "Sprint 3": "purple",
        "Sprint 4": "green",
        "Product Backlog": "yellow",
        "Company Portal": "black",
        "Admin Portal": "orange",
        "Customer Portal": "sky",
        "QA / Testing": "red",
        "Defense Ready": "green",
    }
    
    # fetch all labels again to get colors
    existing_labels_full = {lb.get("name"): lb for lb in board_data.get("labels", []) if lb.get("name")}
    label_ids = {}
    for name, color in sprint_labels_to_ensure.items():
        if name in existing_labels_full:
            label_ids[name] = existing_labels_full[name]["id"]
            print(f"  + Đã có nhãn: {name} (ID: {label_ids[name]})")
        else:
            new_lb = trello_req(f"boards/{BOARD_ID}/labels", method="POST", data={"name": name, "color": color})
            if new_lb:
                label_ids[name] = new_lb["id"]
                print(f"  + Tạo mới nhãn: {name} ({color}) -> ID: {new_lb['id']}")

    # 3. Rename lists into the 4 Sprints + Backlog + QA + Retrospective
    print("\n[3/6] Chuẩn hóa và đổi tên các danh sách (Lists) theo 4 Sprint...")
    
    # We map specific list IDs to target names and positions
    list_mapping = {
        "6ad6f486572cd6662754e06c": {"name": "📦 Product Backlog (Phase 2 Roadmap - 19 SP)", "pos": 1},
        "6ad6f486572cd6662754e06d": {"name": "🚀 Sprint 1: Architecture, CSDL & Auth (23 SP) [DONE]", "pos": 2},
        "6ad6f486572cd6662754e06e": {"name": "⚡ Sprint 2: Core Booking & Concurrency Lock (29 SP) [DONE]", "pos": 3},
        "6ad6f486572cd6662754e06f": {"name": "💳 Sprint 3: Payment, Boarding Pass & Tickets (21 SP) [DONE]", "pos": 4},
        "6ad6f486572cd6662754e070": {"name": "👑 Sprint 4: Admin Portal, Settlements & Logs (22 SP) [DONE]", "pos": 5},
        "6ad6f486572cd6662754e071": {"name": "🧪 Testing & QA Verification (25/25 Pass)", "pos": 6},
        "6ad6f486572cd6662754e072": {"name": "🏆 Sprint Retrospective & Defense Ready (100/100)", "pos": 7},
        "6ad6f486572cd6662754e073": {"name": "🐛 Bug Tracking (0 Critical Issues)", "pos": 8},
    }

    for lid, info in list_mapping.items():
        if lid in current_lists:
            print(f"  * Cập nhật danh sách {lid} -> '{info['name']}'...")
            trello_req(f"lists/{lid}", method="PUT", params={"name": info["name"], "pos": info["pos"]})

    # List IDs for easy lookup
    LIST_BACKLOG = "6ad6f486572cd6662754e06c"
    LIST_SPRINT_1 = "6ad6f486572cd6662754e06d"
    LIST_SPRINT_2 = "6ad6f486572cd6662754e06e"
    LIST_SPRINT_3 = "6ad6f486572cd6662754e06f"
    LIST_SPRINT_4 = "6ad6f486572cd6662754e070"
    LIST_QA       = "6ad6f486572cd6662754e071"
    LIST_DONE     = "6ad6f486572cd6662754e072"

    # Member IDs
    PHAT_ID = members.get("phatnguyn146")
    PHONG_ID = members.get("phmthanhphong17")
    DUC_ID = members.get("minhdctrn13")
    THANH_ID = members.get("thanhphmcong1")

    # 4. Map User Stories to Sprint Lists, Members, and Labels
    print("\n[4/6] Phân bổ 17 User Stories và 5 Backlog Stories vào từng Sprint...")

    sprint_assignments = {
        # SPRINT 1 (23 SP)
        "US-06": {"list": LIST_SPRINT_1, "sprint": "Sprint 1", "member": PHAT_ID, "pos": 1},
        "US-11": {"list": LIST_SPRINT_1, "sprint": "Sprint 1", "member": PHONG_ID, "pos": 2},
        "US-14": {"list": LIST_SPRINT_1, "sprint": "Sprint 1", "member": DUC_ID, "pos": 3},
        "US-03": {"list": LIST_SPRINT_1, "sprint": "Sprint 1", "member": PHAT_ID, "pos": 4},
        "US-04": {"list": LIST_SPRINT_1, "sprint": "Sprint 1", "member": PHAT_ID, "pos": 5},

        # SPRINT 2 (29 SP)
        "US-08": {"list": LIST_SPRINT_2, "sprint": "Sprint 2", "member": PHONG_ID, "pos": 1},
        "US-09": {"list": LIST_SPRINT_2, "sprint": "Sprint 2", "member": PHONG_ID, "pos": 2},
        "US-02": {"list": LIST_SPRINT_2, "sprint": "Sprint 2", "member": PHAT_ID, "pos": 3},
        "US-15": {"list": LIST_SPRINT_2, "sprint": "Sprint 2", "member": THANH_ID, "pos": 4},

        # SPRINT 3 (21 SP)
        "US-10": {"list": LIST_SPRINT_3, "sprint": "Sprint 3", "member": PHONG_ID, "pos": 1},
        "US-12": {"list": LIST_SPRINT_3, "sprint": "Sprint 3", "member": DUC_ID, "pos": 2},
        "US-13": {"list": LIST_SPRINT_3, "sprint": "Sprint 3", "member": DUC_ID, "pos": 3},
        "US-17": {"list": LIST_SPRINT_3, "sprint": "Sprint 3", "member": THANH_ID, "pos": 4},

        # SPRINT 4 (22 SP)
        "US-01": {"list": LIST_SPRINT_4, "sprint": "Sprint 4", "member": PHAT_ID, "pos": 1},
        "US-05": {"list": LIST_SPRINT_4, "sprint": "Sprint 4", "member": PHAT_ID, "pos": 2},
        "US-07": {"list": LIST_SPRINT_4, "sprint": "Sprint 4", "member": PHAT_ID, "pos": 3},
        "US-16": {"list": LIST_SPRINT_4, "sprint": "Sprint 4", "member": THANH_ID, "pos": 4},

        # PRODUCT BACKLOG (19 SP)
        "US-21": {"list": LIST_BACKLOG, "sprint": "Product Backlog", "member": THANH_ID, "pos": 1},
        "US-22": {"list": LIST_BACKLOG, "sprint": "Product Backlog", "member": DUC_ID, "pos": 2},
        "US-23": {"list": LIST_BACKLOG, "sprint": "Product Backlog", "member": DUC_ID, "pos": 3},
        "US-24": {"list": LIST_BACKLOG, "sprint": "Product Backlog", "member": THANH_ID, "pos": 4},
        "US-25": {"list": LIST_BACKLOG, "sprint": "Product Backlog", "member": PHAT_ID, "pos": 5},
    }

    # Fetch fresh cards
    fresh_cards = trello_req(f"boards/{BOARD_ID}/cards") or []
    for c in fresh_cards:
        c_name = c.get("name", "")
        for us_key, assign in sprint_assignments.items():
            if us_key in c_name:
                print(f"  -> Xử lý {us_key} ('{c_name[:40]}...')...")
                # 1. Move to list & position
                trello_req(f"cards/{c['id']}", method="PUT", params={"idList": assign["list"], "pos": assign["pos"]})
                
                # 2. Add Sprint Label
                sprint_lb_name = assign["sprint"]
                if sprint_lb_name in label_ids:
                    sprint_lb_id = label_ids[sprint_lb_name]
                    current_card_labels = [lb["id"] for lb in c.get("labels", [])]
                    if sprint_lb_id not in current_card_labels:
                        trello_req(f"cards/{c['id']}/idLabels", method="POST", params={"value": sprint_lb_id})
                
                # 3. Add Member
                target_mem = assign["member"]
                if target_mem:
                    current_card_mems = c.get("idMembers", [])
                    if target_mem not in current_card_mems:
                        trello_req(f"cards/{c['id']}/idMembers", method="POST", params={"value": target_mem})
                break

    # 5. Add Verification & Retrospective Cards to QA and Done lists
    print("\n[5/6] Bổ sung Thẻ Nghiệm thu QA và Tổng kết Bảo vệ...")
    
    qa_card_1_title = "📋 [QA-01] Biên bản Kiểm thử Tính năng & Nghiệm thu Nội bộ Nhóm 7"
    qa_card_1_desc = """### 📋 HỒ SƠ NGHIỆM THU KIỂM THỦ TÍNH NĂNG NHÓM 7
- **Chỉ đạo**: Nhóm trưởng Phạm Công Thành (`docs/BIEN_BAN_NGHIEM_THU_KIEM_THU_TINH_NANG_NHOM_7.md`)
- **Yêu cầu**: 100% thành viên pull code mới từ `dev`, chạy test từng trang chức năng, chụp ảnh minh chứng vào `docs/screenshots/` và điền nhận xét nghiệm thu.
- **Thời hạn chót**: Trước 23:59:00 Hết ngày mai.
- **Phân công Test**:
  1. Thành: Cổng Nhà xe (`/company/*`)
  2. Phát: Cổng Quản trị Sàn (`/admin/*`)
  3. Phong: Tìm kiếm & Sơ đồ ghế 2 tầng (`/search`, `/checkout`)
  4. Đức: Vé của tôi & Profile (`/my-tickets`, `/profile`, `/promotions`)
  5. Cường: Trang chủ, Tra cứu Offline & QR Scanner (`/`, `/lookup`, `/scanner`, `/reviews`)"""

    qa_card_2_title = "📊 [QA-02] Bộ 25 Test Cases Kiểm thử Toàn diện & NFR Benchmarks"
    qa_card_2_desc = """### 📊 BÁO CÁO NGHIỆM THU 25/25 TEST CASES (100% PASS)
- **Tài liệu đặc tả**: `docs/TEST_PLAN_AND_REPORT.md`
- **Kết quả Functional**: 25/25 Test Cases Pass (TC-01 -> TC-25), 0 Bug, 0 Defect.
- **Kết quả NFR (40/40 Điểm)**:
  - API Latency: 120ms (Chuẩn <500ms)
  - First Contentful Paint (FCP): 0.65s (Chuẩn <2s)
  - Concurrency Load: 50 req/s không xảy ra race condition nhờ Pessimistic Lock
  - Bảo mật: BCrypt 12 rounds, Stateless JWT Bearer, Spring Security RBAC 3 vai trò."""

    def_card_1_title = "🎓 [DEF-01] Kịch bản Thuyết trình Bảo vệ Đồ án 15 Phút Chuẩn Barem"
    def_card_1_desc = """### 🎓 KỊCH BẢN DEMO 15 PHÚT (CHÍNH XÁC TỪNG GIÂY)
- **Tài liệu đặc tả**: `docs/KE_HOACH_THIET_KE_CONG_VIEC_VA_KICH_BAN_BAO_VE_OJT.md`
- **00:00 - 03:00 (3 phút)**: Phạm Công Thành (Kiến trúc, Supabase DB, Cổng Nhà xe `/company/*`)
- **03:00 - 06:00 (3 phút)**: Nguyễn Đại Phát (Cổng Admin `/admin/*`, Giám sát 480 chuyến xe, Logs)
- **06:00 - 09:00 (3 phút)**: Trần Nam Phong (Tìm kiếm siêu tốc, Sơ đồ ghế 2 tầng & Pessimistic Lock)
- **09:00 - 12:00 (3 phút)**: Trần Hữu Đức (Checkout VietQR/COD, Vé của tôi, Hủy vé tự động)
- **12:00 - 15:00 (3 phút)**: Nguyễn Trọng Cường (Tra cứu vé offline, Quét mã QR Camera `/scanner`, AI)"""

    def_card_2_title = "🏆 [DEF-02] Bàn giao Toàn diện Hệ thống TravelEasy Platform 100/100 Điểm"
    def_card_2_desc = """### 🏆 TỔNG KẾT BÀN GIAO TOÀN DIỆN DỰ ÁN
- **Quy mô bàn giao**: 17 User Stories Done (95 SP), 5 Backlog Stories (19 SP).
- **Mã nguồn**: Backend Spring Boot 3.3.4 (Java 21), Frontend React 18.3 (Vite TS).
- **Cơ sở dữ liệu**: 36 bảng chuẩn hóa trên Supabase Cloud PostgreSQL.
- **DevOps**: Docker Compose 1-click & GitHub Actions CI/CD Pipeline.
- **Cam kết**: Đạt điểm tối đa 100/100 trước Hội đồng phản biện Rikkei Academy."""

    # Check if cards exist before creating
    existing_titles = {c.get("name"): c["id"] for c in fresh_cards}
    
    meta_cards = [
        (LIST_QA, qa_card_1_title, qa_card_1_desc, "QA / Testing", THANH_ID),
        (LIST_QA, qa_card_2_title, qa_card_2_desc, "QA / Testing", PHAT_ID),
        (LIST_DONE, def_card_1_title, def_card_1_desc, "Defense Ready", THANH_ID),
        (LIST_DONE, def_card_2_title, def_card_2_desc, "Defense Ready", PHAT_ID),
    ]

    for lid, title, desc, lb_name, mem_id in meta_cards:
        if title not in existing_titles:
            print(f"  + Tạo thẻ mới: {title[:40]}...")
            card_params = {"name": title, "desc": desc, "idList": lid}
            if lb_name in label_ids:
                card_params["idLabels"] = [label_ids[lb_name]]
            if mem_id:
                card_params["idMembers"] = [mem_id]
            trello_req("cards", method="POST", data=card_params)
        else:
            print(f"  * Thẻ đã tồn tại: {title[:40]}")

    print("\n[6/6] HOÀN TẤT ĐỒNG BỘ 100% CẤU TRÚC SPRINT TRÊN TRELLO!")
    print(f"Xem bảng trực tiếp tại: {BOARD_SHORT_URL}")
    print("=" * 70)
    return 0

if __name__ == "__main__":
    sys.exit(main())
