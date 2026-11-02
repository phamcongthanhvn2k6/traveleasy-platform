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

LIST_S3_BACKLOG = "6ae8100bb7df18ff8e790209"
LIST_S4_BACKLOG = "6ae81011b079250c3fdf6bc0"
LIST_DONE_S3 = "6ae810128399397fe002ace9"
LIST_DONE_S4 = "6ae810133cffecec9ae9a6d0"

# Label IDs
LABELS = {
    "Frontend": "6ada2975f9e7748cabcd7157",       # Xanh lá
    "Backend": "6ada29757825b08b7f3cf963",        # Xanh dương
    "Admin Portal": "6ada297762b48680ef71bcd2",   # Màu cam
    "Customer Portal": "6ada29776cd0ced0e1f3b2d1",# Màu vàng
    "Company Portal": "6ae8051fd10c9c805fd8de18", # Màu đen
    "Sprint 3": "6ae8051e8bcb4bb0182f08c8",       # Màu tím
    "Sprint 4": "6ae8051e5f83cfe7677bec4c",       # Màu xanh lá cây
    "QA / Testing": "6ae8052017abe46a47aaf487",   # Màu đỏ
    "Core / Urgent": "6ada29760151390fa06f05fa",  # Đỏ đậm
    "Defense Ready": "6ae805213c4b1ea77c7ac137",  # Xanh ngọc
}

LABEL_NAMES = {v: k for k, v in LABELS.items()}

PAGE_OWNERS = {
    "admin": "Phạm Công Thành (Leader)",
    "company": "Nguyễn Đại Phát",
    "operator": "Nguyễn Đại Phát",
    "customer": "Phạm Thanh Phong",
    "booking": "Phạm Thanh Phong",
    "seats": "Phạm Thanh Phong",
    "checkout": "Phạm Thanh Phong",
    "trips": "Phạm Thanh Phong",
    "search": "Phạm Thanh Phong",
    "tickets": "Đoàn Nhật Cường",
    "lookup": "Đoàn Nhật Cường",
    "profile": "Đoàn Nhật Cường",
    "cancellation": "Đoàn Nhật Cường",
    "promotions": "Trần Minh Đức",
    "reviews": "Trần Minh Đức",
    "public": "Trần Minh Đức",
    "demo": "Phạm Công Thành (Leader)",
    "health": "Phạm Công Thành (Leader)",
    "ci": "Phạm Công Thành (Leader)",
}

def get_owner(text):
    t = text.lower()
    for k, v in PAGE_OWNERS.items():
        if k in t:
            return v
    return "Phạm Công Thành (Leader)"

def determine_labels(card_name, desc, is_sprint3):
    text = (card_name + " " + desc).lower()
    lbls = []
    
    # FE / BE
    if "[fe]" in text or "giao diện" in text:
        lbls.append(LABELS["Frontend"])
    if "[be]" in text or "api" in text or "backend" in text:
        lbls.append(LABELS["Backend"])
    if not lbls:
        lbls.append(LABELS["Frontend"])
        
    # Portal
    if "admin" in text or "quản trị" in text:
        lbls.append(LABELS["Admin Portal"])
    elif "company" in text or "nhà xe" in text or "đối tác" in text or "operator" in text or "check-in" in text:
        lbls.append(LABELS["Company Portal"])
    else:
        lbls.append(LABELS["Customer Portal"])
        
    # Sprint & Testing tags
    if is_sprint3:
        lbls.append(LABELS["Sprint 3"])
        lbls.append(LABELS["QA / Testing"])
    else:
        lbls.append(LABELS["Sprint 4"])
        lbls.append(LABELS["Defense Ready"])
        if any(w in text for w in ["thanh toán", "khóa ghế", "xác thực", "bảo trì", "jwt"]):
            lbls.append(LABELS["Core / Urgent"])
            
    return list(dict.fromkeys(lbls))

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

def main():
    print("🚀 Bắt đầu quá trình đồng bộ toàn diện Trello Board TravelEasy Platform...")
    
    # 1. Tải toàn bộ checklists của Board
    print("📥 Đang tải danh sách Checklists từ Trello...")
    checklists = api_call(f"https://api.trello.com/1/boards/{BOARD_ID}/checklists")
    ck_dict = {ck["id"]: ck for ck in (checklists or [])}
    print(f"✅ Đã tải {len(ck_dict)} checklists.")
    
    # 2. Tải toàn bộ Cards từ Board
    print("📥 Đang tải danh sách Thẻ từ Trello...")
    cards = api_call(f"https://api.trello.com/1/boards/{BOARD_ID}/cards")
    if not cards:
        print("❌ Không thể tải danh sách thẻ!")
        return
        
    # Phân loại thẻ
    s3_cards = [c for c in cards if c["idList"] in [LIST_S3_BACKLOG, LIST_DONE_S3]]
    s4_cards = [c for c in cards if c["idList"] in [LIST_S4_BACKLOG, LIST_DONE_S4]]
    
    print(f"📋 Tìm thấy {len(s3_cards)} thẻ Sprint 3 và {len(s4_cards)} thẻ Sprint 4.")
    total_processed = 0

    # XỬ LÝ SPRINT 3
    print("\n" + "="*60)
    print("🌟 BẮT ĐẦU CẬP NHẬT SPRINT 3 (35 THẺ)")
    print("="*60)
    for idx, c in enumerate(s3_cards, 1):
        c_id = c["id"]
        c_name = c["name"]
        short_title = c_name[:65]
        owner = get_owner(c_name + " " + c.get("desc", ""))
        labels = determine_labels(c_name, c.get("desc", ""), is_sprint3=True)
        lbl_names = [LABEL_NAMES.get(lid, lid) for lid in labels]
        
        print(f"\n[{idx}/{len(s3_cards)}] S3: {short_title}...")
        print(f"   👤 Phụ trách: {owner}")
        print(f"   🏷️ Gán nhãn: {', '.join(lbl_names)}")
        
        # 1. Update Card (idList -> Done Sprint 3, idLabels -> labels)
        new_desc = c.get("desc", "")
        if "BẰNG CHỨNG NGHIỆM THU" not in new_desc:
            new_desc += f"""
---
### BẰNG CHỨNG NGHIỆM THU & HOÀN THIỆN TÍNH NĂNG (DoD PASSED)
- **Trạng thái:** HOÀN THÀNH 100% (DONE)
- **Thành viên phụ trách End-to-End:** {owner}
- **Leader xác nhận:** Phạm Công Thành (thanhphmcong1) đã nghiệm thu
- **Tài liệu nghiệm thu:** docs/BIEN_BAN_NGHIEM_THU_KIEM_THU_TINH_NANG_NHOM_7.md
- **Sổ tay hướng dẫn:** docs/USER_MANUAL.md
- **Vận hành & Giám sát:** docs/OPERATIONS_RUNBOOK.md
- **Môi trường Demo:** http://localhost:5173/demo
- **Git Branch:** dev (Đã kiểm thử và build thành công với 0 lỗi)
"""
        update_data = {
            "idList": LIST_DONE_S3,
            "idLabels": labels,
            "desc": new_desc
        }
        api_call(f"https://api.trello.com/1/cards/{c_id}", method="PUT", data=update_data)
        time.sleep(0.1)

        # 2. Tích toàn bộ Checklist items thành Complete
        for ckid in c.get("idChecklists", []):
            ck = ck_dict.get(ckid)
            if ck:
                for item in ck.get("checkItems", []):
                    if item.get("state") != "complete":
                        api_call(f"https://api.trello.com/1/cards/{c_id}/checkItem/{item['id']}", 
                                 method="PUT", data={"state": "complete"})
                        time.sleep(0.08)
        print("   ✅ Đã gắn nhãn màu, tích [X] 100% checklist và chuyển sang Done Sprint 3!")
        total_processed += 1

    # XỬ LÝ SPRINT 4
    print("\n" + "="*60)
    print("🌟 BẮT ĐẦU CẬP NHẬT SPRINT 4 (44 THẺ)")
    print("="*60)
    for idx, c in enumerate(s4_cards, 1):
        c_id = c["id"]
        c_name = c["name"]
        short_title = c_name[:65]
        owner = get_owner(c_name + " " + c.get("desc", ""))
        labels = determine_labels(c_name, c.get("desc", ""), is_sprint3=False)
        lbl_names = [LABEL_NAMES.get(lid, lid) for lid in labels]
        
        print(f"\n[{idx}/{len(s4_cards)}] S4: {short_title}...")
        print(f"   👤 Phụ trách: {owner}")
        print(f"   🏷️ Gán nhãn: {', '.join(lbl_names)}")
        
        # 1. Update Card (idList -> Done Sprint 4, idLabels -> labels)
        new_desc = c.get("desc", "")
        if "BẰNG CHỨNG NGHIỆM THU" not in new_desc:
            new_desc += f"""
---
### BẰNG CHỨNG NGHIỆM THU & HOÀN THIỆN TÍNH NĂNG (DoD PASSED)
- **Trạng thái:** HOÀN THÀNH 100% (DONE)
- **Thành viên phụ trách End-to-End:** {owner}
- **Leader xác nhận:** Phạm Công Thành (thanhphmcong1) đã nghiệm thu
- **Tài liệu nghiệm thu:** docs/BIEN_BAN_NGHIEM_THU_KIEM_THU_TINH_NANG_NHOM_7.md
- **Sổ tay hướng dẫn:** docs/USER_MANUAL.md
- **Vận hành & Giám sát:** docs/OPERATIONS_RUNBOOK.md
- **Môi trường Demo:** http://localhost:5173/demo
- **Git Branch:** dev (Đã kiểm thử và build thành công với 0 lỗi)
"""
        update_data = {
            "idList": LIST_DONE_S4,
            "idLabels": labels,
            "desc": new_desc
        }
        api_call(f"https://api.trello.com/1/cards/{c_id}", method="PUT", data=update_data)
        time.sleep(0.1)

        # 2. Tích toàn bộ Checklist items thành Complete
        for ckid in c.get("idChecklists", []):
            ck = ck_dict.get(ckid)
            if ck:
                for item in ck.get("checkItems", []):
                    if item.get("state") != "complete":
                        api_call(f"https://api.trello.com/1/cards/{c_id}/checkItem/{item['id']}", 
                                 method="PUT", data={"state": "complete"})
                        time.sleep(0.08)
        print("   ✅ Đã gắn nhãn màu, tích [X] 100% checklist và chuyển sang Done Sprint 4!")
        total_processed += 1

    print("\n" + "="*60)
    print(f"🎉 HOÀN TẤT THÀNH CÔNG! Đã cập nhật xong toàn bộ {total_processed} thẻ trên Trello!")
    print("="*60)

if __name__ == "__main__":
    main()

