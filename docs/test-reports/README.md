# 🧪 QUY CHUẨN BÁO CÁO KIỂM THỬ SPRINT 3 & SPRINT 4 (ZERO MERGE CONFLICT)

> [!IMPORTANT]
> **TÀI LIỆU QUY TRÌNH BẮT BUỘC:** Mọi thành viên trước khi thực hiện task kiểm thử và mở PR nghiệm thu **BẮT BUỘC** phải đọc kỹ và tuân thủ:
> 👉 **[Quy trình kiểm thử an toàn & nghiệm thu chuẩn đồ án](../05-qa-and-testing/QUY_TRINH_KIEM_THU_VA_NGHIEM_THU_CHUAN_DO_AN.md)**
>
> **2 NGUYÊN TẮC BẤT DI BẤT DỊCH:**
> 1. **KHÔNG XÂM LẤN PRODUCTION CODE:** Tuyệt đối KHÔNG sửa code trong `backend/src/main/` hoặc `frontend/src/` khi làm task test. Test là Hộp đen (Black-box), phát hiện lỗi thì ghi nhận BUG report, không được tự ý sửa logic hệ thống làm gãy tính năng khác.
> 2. **KHÔNG COMMIT RÁC HỆ THỐNG:** Tuyệt đối KHÔNG commit thư mục tạm như `test-results/`, `playwright-report/`, `.cache/` làm phình to repo Git.

## 📂 1. Phân chia thư mục độc lập
* `docs/test-reports/phat/` 👉 **Nguyễn Đại Phát** chỉ tạo file báo cáo trong thư mục này.
* `docs/test-reports/phong/` 👉 **Phạm Thanh Phong** chỉ tạo file báo cáo trong thư mục này.
* `docs/test-reports/cuong/` 👉 **Đoàn Nhật Cường** chỉ tạo file báo cáo trong thư mục này.
* `docs/test-reports/duc/` 👉 **Trần Minh Đức** chỉ tạo file báo cáo trong thư mục này.

---

## 🌿 2. Quy trình làm việc trên Git (4 Bước)
1. **Trước khi bắt đầu:** Kéo code mới nhất từ dev về máy:
   ```bash
   git checkout dev
   git pull origin dev
   ```
2. **Tạo nhánh riêng của bạn:**
   ```bash
   git checkout -b test/<ma-the>-<ten-ban>
   # Ví dụ: git checkout -b test/s308-phat
   ```
3. **Thực hiện kiểm thử và ghi báo cáo:**
   * Copy `docs/test-reports/TEMPLATE_TEST_REPORT.md` vào thư mục của bạn.
   * Đổi tên thành `<MA_THE>_TEST_REPORT.md` (ví dụ: `docs/test-reports/phat/S308_TEST_REPORT.md`) và điền kết quả PASS/FAIL.
4. **Commit và đẩy nhánh lên GitHub:**
   ```bash
   git add docs/test-reports/<ten-ban>/
   git commit -m "test(sprint3): báo cáo kiểm thử thẻ [S3xx] đạt chuẩn DoD"
   git push origin test/<ma-the>-<ten-ban>
   ```
5. **Tạo Pull Request (PR) trên GitHub về nhánh `dev`:**
   * Leader (Phạm Công Thành) sẽ review và bấm nút **Merge Pull Request** trên GitHub.

---

## 🏷️ 3. Quy trình đồng bộ với Trello
* Khi bắt đầu làm: Kéo thẻ từ **`To Do`** ➔ **`In Progress`**.
* Khi đẩy nhánh lên Git xong và tạo PR: Kéo thẻ từ **`In Progress`** ➔ **`Testing`** hoặc **`Code Review`**.
* Khi Leader merge code vào `dev`: Kéo thẻ vào **`Done Sprint 3`** (hoặc **`Done Sprint 4`**)!

