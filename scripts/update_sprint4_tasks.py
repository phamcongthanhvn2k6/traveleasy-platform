import urllib.request
import urllib.parse
import json

API_KEY = "3305b670e2ea6167c586ce2516d87ebd"
TOKEN = "ATTA1a8c4785106f67bfa876d633b2f5660d1c42589c404d23cb4be7f573933a07d8229C677D"
CODE_REVIEW_LIST_ID = "6ad6f486572cd6662754e071"

TASKS = [
    {
        "id": "6afa687b0095e555235d65b7",
        "code": "S401",
        "name": "[Ưu tiên: 2] [1 SP] [S401] Tối ưu hóa bundle Vite & Cấu hình nén Gzip/Brotli Frontend",
        "items": [
            "6afa687dce99db60c7f3702e",
            "6afa687ef4d9a989f7036d68",
            "6afa687f1192780b40a5f474"
        ],
        "comment": "✅ [S401 COMPLETED]\n- Đã cấu hình manualChunks phân tách gọn gàng các vendor nặng: vendor-react, vendor-icons, vendor-leaflet, vendor-charts, vendor-firebase, vendor-utils trong vite.config.ts.\n- Đã kiểm tra build frontend thành công 100% không lỗi, kích thước các sub-chunks được nén tối ưu (Gzip ~11kB-121kB).\n- Chuyển card sang Code Review."
    },
    {
        "id": "6afa6880a51718ef58af3052",
        "code": "S402",
        "name": "[Ưu tiên: 1] [2 SP] [S402] Tối ưu timeout HikariCP Connection Pool & Graceful Shutdown Backend",
        "items": [
            "6afa6883b96babeed84fbc4c",
            "6afa68833d22b458c8dba317",
            "6afa68841640448319b336c9"
        ],
        "comment": "✅ [S402 COMPLETED]\n- Đã cấu hình HikariCP Connection Pool với connection-timeout: 20000ms (20s) và max-lifetime: 1800000ms (30 phút) trong cả application.yml và application-supabase.yml.\n- Đã kích hoạt cơ chế server.shutdown: graceful cùng timeout-per-shutdown-phase: 20s đảm bảo backend giải phóng kết nối và xử lý dứt điểm request trước khi tắt.\n- Chuyển card sang Code Review."
    },
    {
        "id": "6afa68853da43eb1be377a63",
        "code": "S403",
        "name": "[Ưu tiên: 1] [2 SP] [S403] Tối ưu bảo mật CORS, Content-Security-Policy & Rate Limiting IP",
        "items": [
            "6afa68874354745ddace212a",
            "6afa6888cfa2aeacf2d7dc49",
            "6afa6889c8564f5fe07f7f14"
        ],
        "comment": "✅ [S403 COMPLETED]\n- Đã cấu hình CorsConfigurationSource nghiêm ngặt chỉ cho phép các domain tin cậy (localhost:5173, 3000, 8080, traveleasy.vn) thay vì mở tự do wildcard.\n- Đã bổ sung Security Headers: X-Content-Type-Options: nosniff, X-Frame-Options: DENY, và Content-Security-Policy đa tầng phòng chống Clickjacking, MIME-sniffing và XSS.\n- Đã triển khai LoginAttemptService sử dụng Caffeine in-memory cache tự động khóa 15 phút nếu người dùng nhập sai thông tin 5 lần liên tiếp.\n- Chuyển card sang Code Review."
    },
    {
        "id": "6afa688acf2491646a3c29dd",
        "code": "S404",
        "name": "[Ưu tiên: 2] [1 SP] [S404] Tối ưu cơ chế Global Exception Handler & Standardized Response Body",
        "items": [
            "6afa688c57e7b1fe1c02f370",
            "6afa688dd3444ff8247fc82f",
            "6afa688d7d4ed0725c5f1fe8"
        ],
        "comment": "✅ [S404 COMPLETED]\n- Đã bổ sung bộ xử lý @ExceptionHandler(ConstraintViolationException.class) và @ExceptionHandler(MethodArgumentNotValidException.class) trong GlobalExceptionHandler.\n- Chuẩn hóa thông điệp lỗi tiếng Việt thân thiện, rõ ràng đến từng trường dữ liệu bị vi phạm.\n- Đảm bảo định dạng chuẩn ApiResponse.error(400) đồng nhất toàn hệ thống.\n- Chuyển card sang Code Review."
    }
]

def update_check_item(card_id, check_item_id):
    url = f"https://api.trello.com/1/cards/{card_id}/checkItem/{check_item_id}?state=complete&key={API_KEY}&token={TOKEN}"
    req = urllib.request.Request(url, method="PUT")
    with urllib.request.urlopen(req) as resp:
        return resp.status

def add_comment(card_id, text):
    url = f"https://api.trello.com/1/cards/{card_id}/actions/comments?key={API_KEY}&token={TOKEN}"
    data = urllib.parse.urlencode({"text": text}).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    with urllib.request.urlopen(req) as resp:
        return resp.status

def move_card(card_id, list_id):
    url = f"https://api.trello.com/1/cards/{card_id}?idList={list_id}&key={API_KEY}&token={TOKEN}"
    req = urllib.request.Request(url, method="PUT")
    with urllib.request.urlopen(req) as resp:
        return resp.status

for task in TASKS:
    card_id = task["id"]
    print(f"Processing {task['code']} ({card_id})...")
    for item_id in task["items"]:
        st = update_check_item(card_id, item_id)
        print(f"  CheckItem {item_id} -> complete (HTTP {st})")
    cm_st = add_comment(card_id, task["comment"])
    print(f"  Comment added (HTTP {cm_st})")
    mv_st = move_card(card_id, CODE_REVIEW_LIST_ID)
    print(f"  Moved to Code Review (HTTP {mv_st})")

print("\nAll 4 tasks updated successfully on Trello!")
