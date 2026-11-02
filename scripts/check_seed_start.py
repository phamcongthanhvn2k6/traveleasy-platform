import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('init.sql', 'r', encoding='utf-8') as f:
    init_content = f.read()

with open('docs/schema.sql', 'r', encoding='utf-8') as f:
    schema_content = f.read()

# Tìm vị trí bắt đầu INSERT INTO trong init.sql
m = re.search(r'-- =+\s*\n--\s*DỮ LIỆU MẪU|--\s*SEED DATA|INSERT INTO users', init_content, re.IGNORECASE)
if m:
    pos = m.start()
    print(f"Seed data starts at index {pos}")
    # Tìm dòng chứa pos
    line_no = init_content[:pos].count('\n') + 1
    print(f"Seed data starts at line {line_no}")
else:
    print("Could not find start marker, searching first INSERT INTO")
    m2 = re.search(r'INSERT INTO ', init_content)
    line_no = init_content[:m2.start()].count('\n') + 1
    print(f"First INSERT INTO at line {line_no}")

