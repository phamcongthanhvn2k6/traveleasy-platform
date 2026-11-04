# 🌿 QUY CHUẨN LÀM VIỆC VỚI GIT & QUY TRÌNH PHÂN NHÁNH (GIT WORKFLOW)
## DỰ ÁN: TRAVELEASY PLATFORM (SPRINT 7 NGÀY - NHÓM 6 THÀNH VIÊN)
### TÀI LIỆU HƯỚNG DẪN DÀNH CHO TOÀN BỘ THÀNH VIÊN DỰ ÁN

---

> **MỤC TIÊU:**  
> • Đảm bảo 100% thành viên tuân thủ quy tắc làm việc nhóm chuyên nghiệp với Git.  
> • Đạt điểm tối đa tiêu chí: *"Có lịch sử hoạt động nhóm với git rõ ràng, commit có ý nghĩa và triển khai thành công CI/CD Pipeline"*.  
> • Ngăn chặn triệt để xung đột mã nguồn (Merge Conflicts) và không bao giờ làm hỏng nhánh `main`.

---

## 1. MÔ HÌNH PHÂN NHÁNH CHUẨN (BRANCHING STRATEGY)

Hệ thống Git của dự án **TravelEasy Platform** áp dụng mô hình phân nhánh rút gọn tối ưu cho Sprint 7 ngày:

```
[main] --------------------------------------------- (Production / Sẵn sàng chấm thi)
          \                                     /
[dev]      \---- [Sprint Integration] ---------/---- (Nhánh tích hợp chính của cả nhóm)
                  \                 /    \
[feature/*]        \-- feature/... /      \-- feature/...
```

### 1.1 Hai nhánh chính cố định (Protected Branches)
1.  **Nhánh `main` (Production):**
    *   Chứa mã nguồn ổn định nhất, đã được kiểm thử kỹ lưỡng và sẵn sàng đem đi bảo vệ, chấm điểm.
    *   **BẬT BRANCH PROTECTION:** Cấm commit hoặc push trực tiếp lên `main`.
    *   Mọi thay đổi đưa vào `main` bắt buộc phải thông qua **Pull Request (PR)** từ nhánh `dev` và phải được **Team Lead review & duyệt (Approve)**.
2.  **Nhánh `dev` (hoặc `develop` — Tích hợp):**
    *   Nhánh làm việc chung của cả nhóm 6 người.
    *   Các thành viên sau khi hoàn thành tính năng trên nhánh cá nhân sẽ tạo Pull Request merge vào `dev`.
    *   GitHub Actions tự động chạy kiểm thử Unit Test và build thử nghiệm trên nhánh này.

### 1.2 Các nhánh làm việc ngắn hạn (Temporary Branches)
*   **`feature/*`:** Nhánh phát triển tính năng mới của từng thành viên. Nhánh này được tách ra từ `dev` và sau khi hoàn thiện sẽ tạo PR merge ngược lại vào `dev`.
*   **`bugfix/*`:** Nhánh sửa lỗi phát sinh trong quá trình kiểm thử tích hợp trên `dev`.
*   **`hotfix/*`:** Nhánh sửa lỗi khẩn cấp trực tiếp từ `main` nếu phát hiện lỗi nghiêm trọng sát giờ chấm thi.

---

## 2. QUY CHUẨN ĐẶT TÊN NHÁNH (BRANCH NAMING CONVENTION)

Tất cả các thành viên bắt buộc phải đặt tên nhánh theo cấu trúc chuẩn:

$$\text{Loại nhánh} / \text{Mã thành viên hoặc Tên} - \text{Tên tính năng ngắn gọn}$$

### Cú pháp chi tiết:
*   Tính năng mới: `feature/<tên-thành-viên>-<tên-chức-năng>`
*   Sửa lỗi: `bugfix/<tên-thành-viên>-<tên-lỗi>`

### Bảng ví dụ phân bổ nhánh cho 6 thành viên trong Sprint 7 ngày:

| Thành viên | Nhiệm vụ phân công | Tên nhánh chuẩn |
|---|---|---|
| **Member 1 (Lead / AI)** | Tích hợp Spring AI Chatbot & SEO Generator | `feature/m1-spring-ai-chatbot`<br/>`feature/m1-ai-seo-generator` |
| **Member 2 (Auth & User)** | Xác thực JWT, BCrypt, Trang Đăng ký/Đăng nhập | `feature/m2-auth-jwt-security`<br/>`feature/m2-user-profile-page` |
| **Member 3 (Trips Catalog)** | Tuyến xe, Chuyến xe, Tìm kiếm Nơi đi - Nơi đến | `feature/m3-trip-catalog-api`<br/>`feature/m3-search-filter-ui` |
| **Member 4 (Seat & Booking)**| Sơ đồ ghế 2 tầng, Đặt vé COD, Trừ ghế nguyên tử | `feature/m4-bus-seat-map`<br/>`feature/phong-customer-pessimistic-lock` |
| **Member 5 (Admin & Order)** | Admin Dashboard, Quản lý chuyến xe, Duyệt vé | `feature/m5-admin-trip-crud`<br/>`feature/m5-admin-booking-status` |
| **Member 6 (DevOps & QA)** | Dockerfile, Docker Compose, CI/CD, Test Cases | `feature/m6-docker-containerize`<br/>`feature/m6-github-actions-cicd` |

---

## 3. QUY CHUẨN ĐẶT TÊN COMMIT (CONVENTIONAL COMMITS & TIẾNG VIỆT CÓ DẤU)

> [!IMPORTANT]
> ### 🏆 NGUYÊN TẮC VÀNG BẮT BUỘC (THE GOLDEN RULE)
> **100% COMMIT MESSAGE TRONG TOÀN BỘ DỰ ÁN BẮT BUỘC PHẢI VIẾT BẰNG TIẾNG VIỆT CÓ DẤU!**  
> • **Lý do:** Đây là dự án thực tế phục vụ báo cáo tốt nghiệp OJT và chuyển giao vận hành thương mại. Lịch sử Git commit bằng Tiếng Việt có dấu chuẩn ngữ pháp giúp Hội đồng chấm thi, Giảng viên và toàn bộ thành viên trong nhóm hiểu rõ chính xác 100% nội dung thay đổi mà không gây hiểu lầm.  
> • ❌ **CẤM:** Viết commit tiếng Anh (ví dụ: `fix bug`, `update code`, `refactor service`).  
> • ❌ **CẤM:** Viết tiếng Việt không dấu (ví dụ: `sua loi dat ve`, `them tinh nang huy ve`).  
> • ❌ **CẤM:** Commit chung chung không rõ ý nghĩa (ví dụ: `update`, `fix`, `done`, `test`).  
> • ✅ **BẮT BUỘC:** Viết đúng cấu trúc Conventional Commits với phần mô tả bằng **Tiếng Việt có dấu đầy đủ**.

$$\text{type}(\text{scope}): \text{mô tả hành động ngắn gọn bằng Tiếng Việt có dấu (dưới 72 ký tự)}$$

### 3.1 Danh sách các tiền tố (Types):
*   `feat`: Thêm mới một tính năng hoặc API mới.
*   `fix`: Sửa lỗi (bug) trong mã nguồn hoặc logic nghiệp vụ.
*   `docs`: Cập nhật tài liệu (README, SRS, thiết kế CSDL, cẩm nang vận hành).
*   `style`: Chỉnh sửa giao diện CSS, căn lề, định dạng code (không thay đổi logic nghiệp vụ).
*   `refactor`: Tái cấu trúc mã nguồn (tối ưu hóa thuật toán, không thêm tính năng mới).
*   `test`: Bổ sung hoặc cập nhật Unit Test, Integration Test.
*   `chore`: Cập nhật thư viện phụ thuộc, cấu hình Gradle, Vite, Docker.
*   `ci`: Cập nhật luồng tự động hóa CI/CD GitHub Actions.

### 3.2 Bảng ví dụ mẫu commit chuẩn Tiếng Việt có dấu:
| Loại commit | Ví dụ mẫu chuẩn Tiếng Việt có dấu |
| :--- | :--- |
| **`feat`** | `feat(auth): thêm API đăng ký và đăng nhập trả về mã xác thực JWT token` |
| **`feat`** | `feat(seat): hoàn thiện component sơ đồ ghế xe khách 2 tầng trực quan` |
| **`feat`** | `feat(trip): bổ sung bộ lọc chuyến xe theo khoảng giá và giờ khởi hành` |
| **`fix`** | `fix(booking): sửa lỗi cướp ghế đang được giữ chỗ thanh toán trong 10 phút` |
| **`fix`** | `fix(auth): sửa lỗi đăng nhập tài khoản khách hàng demo trên giao diện` |
| **`docs`** | `docs(srs): bổ sung quy trình đăng ký nhà xe và hồ sơ giấy tờ xe bắt buộc` |
| **`docs`** | `docs(audit): tạo bảng rà soát 13 lỗ hổng nghiệp vụ thực tế và kế hoạch khắc phục` |
| **`test`** | `test(order): bổ sung 5 ca kiểm thử đặt vé thành công và chặn đặt trùng ghế` |
| **`refactor`** | `refactor(payment): tối ưu hàm xử lý callback từ cổng thanh toán VNPAY` |
| **`ci`** | `ci(actions): cấu hình build tự động Gradle và Vite trên nhánh dev` |

---

## 4. QUY TRÌNH LÀM VIỆC HÀNG NGÀY CỦA TỪNG THÀNH VIÊN (7 BƯỚC CHUẨN)

Mỗi ngày khi bắt đầu làm task, thành viên thực hiện đúng 7 bước sau:

### Bước 1: Đồng bộ mã nguồn mới nhất từ nhánh `dev`
```bash
git checkout dev
git pull origin dev
```

### Bước 2: Tạo nhánh tính năng mới từ `dev`
```bash
git checkout -b feature/phong-customer-pessimistic-lock
```

### Bước 3: Viết code và commit thường xuyên
Chia nhỏ công việc thành các commit có ý nghĩa:
```bash
git add .
git commit -m "feat(booking): tạo form thông tin hành khách đặt vé COD"
```

### Bước 4: Luôn kéo cập nhật mới nhất từ `dev` về nhánh của mình trước khi đẩy lên
Tránh xung đột mã nguồn với đồng đội:
```bash
git checkout dev
git pull origin dev
git checkout feature/phong-customer-pessimistic-lock
git merge dev
```
*(Nếu có xung đột, giải quyết conflict ngay trên IDE, sau đó commit lại)*.

### Bước 5: Đẩy nhánh tính năng lên GitHub
```bash
git push -u origin feature/phong-customer-pessimistic-lock
```

### Bước 6: Tạo Pull Request (PR) trên giao diện GitHub
1.  Truy cập vào Repository trên GitHub.
2.  Bấm nút **"Compare & pull request"**.
3.  Chọn:
    *   **base branch (nhánh đích):** `dev`
    *   **compare branch (nhánh nguồn):** `feature/phong-customer-pessimistic-lock`
4.  Điền tiêu đề PR rõ ràng: `[FEATURE] Hoàn thiện giao diện đặt vé COD và trừ ghế trống`.
5.  Gắn tag Reviewer (chọn Team Lead hoặc đồng đội phụ trách cùng module).

### Bước 7: Review code & Merge vào `dev`
*   Người được gán Review kiểm tra code trên tab **Files changed**.
*   Nếu đạt yêu cầu ➔ Bấm **Approve** và tiến hành **Merge pull request**.
*   Sau khi merge thành công, xóa nhánh feature trên GitHub để giữ repo gọn gàng.

---

## 5. HƯỚNG DẪN BẬT "BRANCH PROTECTION RULES" TRÊN GITHUB CHO NHÁNH `main`

Để đảm bảo không ai vô tình push code lỗi thẳng lên `main`, Team Lead thực hiện thiết lập như sau:

1.  Vào Repository trên GitHub: `https://github.com/phamcongthanhvn2k6/traveleasy-platform`.
2.  Bấm vào tab **Settings** (ở thanh menu phía trên).
3.  Ở cột menu bên trái, chọn mục **Branches** (nằm dưới mục *Code and automation*).
4.  Tại mục **Branch protection rules**, bấm nút **Add branch ruleset** (hoặc **Add rule**).
5.  Thiết lập các thông số sau:
    *   **Branch name pattern:** Điền `main`.
    *   Tích chọn: **Require a pull request before merging** (Bắt buộc phải tạo PR, không cho push thẳng).
    *   Tích chọn: **Require approvals** ➔ Chọn số lượng là **1** (Yêu cầu ít nhất 1 thành viên hoặc Lead duyệt).
    *   Tích chọn: **Dismiss stale pull request approvals when new commits are pushed** (Hủy duyệt cũ nếu có commit mới).
    *   Tích chọn: **Do not allow bypassing the above settings** (Áp dụng cho cả Admin/Owner).
6.  Bấm nút **Create** (hoặc **Save changes**) ở cuối trang để kích hoạt!

---

## 6. QUY TẮC BẢO MẬT & QUẢN LÝ BIẾN MÔI TRƯỜNG

*   **TUYỆT ĐỐI KHÔNG COMMIT FILE `.env` LÊN GITHUB:**  
    File `.env` chứa mật khẩu database thật, khóa bí mật JWT, API Key của OpenAI. Nếu commit lên sẽ bị GitHub quét cảnh báo rò rỉ bảo mật và bị trừ điểm nặng!
*   **Sử dụng file `.env.example`:**  
    Mọi biến môi trường mới khi thêm vào dự án phải được khai báo mẫu vào file `.env.example` với giá trị giả lập để các thành viên khác biết cách cấu hình trên máy cục bộ của họ.
*   **Khi clone dự án về máy:**  
    Mỗi thành viên tự sao chép file mẫu thành file cấu hình thực tế:
    ```bash
    cp .env.example .env
    ```

---
*Tài liệu được ban hành bởi Team Lead — Dự án TravelEasy Platform.*  
*Chúc toàn đội làm việc ăn ý, mượt mà và giành trọn điểm số tối đa!*


---

## 7. QUY CHUẨN TẠO NHÁNH KIỂM THỬ & BẮT BUỘC (MỖI TASK 1 NHÁNH RIÊNG)

Để đảm bảo kỷ luật quản trị mã nguồn, tính minh bạch của Sprint và bảo vệ điểm số 100/100 OJT:
* **QUY TẮC BẮT BUỘC:**
  1. **Mỗi task là 1 nhánh riêng biệt (Nghiêm cấm gom nhiều task vào 1 branch / Mega-PR).**
  2. **Tiền tố bắt buộc cho nhánh kiểm thử là `testing/`** và phải gắn mã số task rõ ràng:
     ```bash
     testing/<mã-task>-<mô-tả-ngắn-gọn>
     ```
  3. **Tiêu đề commit BẮT BUỘC viết bằng Tiếng Việt có dấu**, tuân thủ định dạng Conventional Commits:
     ```bash
     test(<mã-task>): <mô tả chi tiết nội dung kiểm thử bằng tiếng Việt có dấu>
     ```
* **Ví dụ danh sách nhánh kiểm thử chuẩn hóa:**
  * `testing/S320-kiem-thu-du-lieu-mau-fixture-va-don-dep-db`
  * `testing/S312-kiem-thu-nghiem-thu-trang-chu-banner-lich-chay`
  * `testing/S313-kiem-thu-tich-hop-api-tra-cuu-ve-va-bao-mat`
  * `testing/S317-kiem-thu-hoi-quy-tuong-thich-hop-dong-api`
  * `testing/S318-kiem-thu-kha-nang-tiep-can-ban-phim-wcag`
* **Quy chuẩn lưu ảnh minh chứng**:
  * Chụp ảnh màn hình các trang web hoạt động bình thường và lưu vào thư mục `docs/screenshots/`.
  * Đặt tên ảnh theo cú pháp: `docs/screenshots/test_<phân-hệ>_<tên-trang>.png`.
* **Cập nhật Biên bản nghiệm thu**:
  * Điền kết quả kiểm thử vào file [`docs/BIEN_BAN_NGHIEM_THU_KIEM_THU_TINH_NANG_NHOM_7.md`](BIEN_BAN_NGHIEM_THU_KIEM_THU_TINH_NANG_NHOM_7.md).
* **Commit chuẩn Conventional Commits Tiếng Việt có dấu**:
  ```bash
  git add docs/screenshots/ docs/BIEN_BAN_NGHIEM_THU_KIEM_THU_TINH_NANG_NHOM_7.md
  git commit -m "test(acceptance): hoàn thành kiểm thử và bổ sung minh chứng nghiệm thu [Tên Bạn]"
  git push -u origin <tên-nhánh-kiểm-thử>
  ```
* **Thời hạn chót (Deadline)**: **Hết ngày mai (23:59:00)**.
* **Hỗ trợ kỹ thuật**: Nhắn tin riêng trực tiếp cho Nhóm trưởng Phạm Công Thành nếu gặp bất kỳ lỗi nào!
