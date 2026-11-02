import os
import sys
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def replace_in_file(file_path, replacements):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    original = content
    for target, rep in replacements.items():
        content = content.replace(target, rep)
    
    if content != original:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✅ Updated {file_path}")
    else:
        print(f"ℹ️ No changes needed in {file_path}")

# 1. Standard name replacements across all documentation
NAME_REPLACEMENTS = {
    "Trần Nam Phong": "Phạm Thanh Phong",
    "Trần Hữu Đức": "Trần Minh Đức",
    "Nguyễn Trọng Cường": "Đoàn Nhật Cường",
    "Nguyễn Bá Triệu": "Đoàn Nhật Cường",
    "Nguyễn Đăng Khoa": "Trần Minh Đức",
}

doc_files = [
    "README.md",
    "docs/OPERATIONS_RUNBOOK.md",
    "docs/TRELLO_SPRINT_3_4_PERFECTION_MATRIX.md",
    "docs/BIEN_BAN_NGHIEM_THU_KIEM_THU_TINH_NANG_NHOM_7.md",
    "docs/KE_HOACH_THIET_KE_CONG_VIEC_VA_KICH_BAN_BAO_VE_OJT.md",
    "docs/KE_HOACH_PHAN_CHIA_SPRINT_AGILE.md",
    "docs/TRELLO_BOARD_MANAGEMENT.md",
    "scripts/execute_trello_full_sync.py",
    "scripts/sync_trello_sprints.py",
]

for doc in doc_files:
    replace_in_file(doc, NAME_REPLACEMENTS)

print("Standard name replacements done.")
