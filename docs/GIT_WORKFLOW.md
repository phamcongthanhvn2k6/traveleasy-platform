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
| **Member 4 (Seat & Booking)**| Sơ đồ ghế 2 tầng, Đặt vé COD, Trừ ghế nguyên tử | `feature/m4-bus-seat-map`<br/>`feature/m4-booking-checkout-cod` |
| **Member 5 (Admin & Order)** | Admin Dashboard, Quản lý chuyến xe, Duyệt vé | `feature/m5-admin-trip-crud`<br/>`feature/m5-admin-booking-status` |
| **Member 6 (DevOps & QA)** | Dockerfile, Docker Compose, CI/CD, Test Cases | `feature/m6-docker-containerize`<br/>`feature/m6-github-actions-cicd` |

---

## 3. QUY CHUẨN ĐẶT TÊN COMMIT (CONVENTIONAL COMMITS)

Để lịch sử Git của nhóm chuyên nghiệp, đẹp mắt và dễ truy vết, toàn bộ commit phải tuân thủ chuẩn **Conventional Commits**:

$$\text{type}(\text{scope}): \text{mô tả ngắn gọn bằng tiếng Việt hoặc tiếng Anh}$$

### 3.1 Danh sách các tiền tố (Types):
*   `feat`: Thêm mới một tính năng hoặc API mới.
*   `fix`: Sửa lỗi (bug) trong mã nguồn.
*   `docs`: Cập nhật tài liệu (README, API spec, tài liệu thiết kế).
*   `style`: Chỉnh sửa giao diện, format code, css (không thay đổi logic nghiệp vụ).
*   `refactor`: Tái cấu trúc mã nguồn (tối ưu hàm, không thêm tính năng mới).
*   `test`: Viết thêm hoặc chỉnh sửa Unit Test, Integration Test.
*   `chore`: Cập nhật dependencies, cấu hình build Gradle, Vite, Docker.
*   `ci`: Cập nhật pipeline GitHub Actions.

### 3.2 Ví dụ mẫu commit chuẩn:
*   `feat(auth): thêm API đăng ký và đăng nhập trả về JWT token`
*   `feat(trips): xây dựng API tìm kiếm chuyến xe theo lộ trình và ngày đi`
*   `feat(seat): hoàn thiện component sơ đồ ghế xe khách 2 tầng trực quan`
*   `fix(booking): sửa lỗi race condition trừ số ghế trống khi đặt cùng lúc`
*   `docs(api): cập nhật danh sách endpoint Swagger và Postman collection`
*   `test(order): bổ sung 5 test case kiểm thử đặt vé thành công và hết ghế`
*   `ci(actions): cấu hình build tự động Gradle và Vite trên nhánh dev`

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
git checkout -b feature/m4-booking-checkout-cod
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
git checkout feature/m4-booking-checkout-cod
git merge dev
```
*(Nếu có xung đột, giải quyết conflict ngay trên IDE, sau đó commit lại)*.

### Bước 5: Đẩy nhánh tính năng lên GitHub
```bash
git push -u origin feature/m4-booking-checkout-cod
```

### Bước 6: Tạo Pull Request (PR) trên giao diện GitHub
1.  Truy cập vào Repository trên GitHub.
2.  Bấm nút **"Compare & pull request"**.
3.  Chọn:
    *   **base branch (nhánh đích):** `dev`
    *   **compare branch (nhánh nguồn):** `feature/m4-booking-checkout-cod`
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

