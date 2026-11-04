# 🌿 QUY CHUẨN LÀM VIỆC VỚI GIT & QUY TRÌNH PHÂN NHÁNH (GIT WORKFLOW)
## DỰ ÁN: TRAVELEASY PLATFORM — HỆ THỐNG ĐẶT VÉ XE KHÁCH LIÊN TỈNH
### ĐƠN VỊ: OJT ĐỒ ÁN NHÓM 7 | MÃ DỰ ÁN: `PRJ-TRAVELEASY-MVP-01`
### TRƯỞNG NHÓM & QUẢN TRỊ KHO MÃ NGUỒN (REPO OWNER): PHẠM CÔNG THÀNH

---

> **MỤC TIÊU & TÍNH PHÁP QUY:**  
> • **Kỷ luật là sức mạnh:** Đảm bảo 100% thành viên (5/5) tuân thủ quy trình Git chuyên nghiệp chuẩn Enterprise.  
> • **Bảo vệ điểm số 100/100 OJT:** Lịch sử Git sạch, phân nhánh mạch lạc, commit tiếng Việt có dấu chuẩn ngữ pháp, minh bạch tiến độ Sprint Backlog.  
> • **Ngăn chặn rủi ro:** Chấm dứt hoàn toàn tình trạng "Mega-PR" (ôm nhiều task vào 1 nhánh), làm nhảy Sprint, xung đột mã nguồn (Merge Conflicts) hoặc đẩy code hỏng lên nhánh `dev` / `main`.

---

## 1. MÔ HÌNH PHÂN NHÁNH CHUẨN (BRANCHING STRATEGY)

Hệ thống Git của dự án **TravelEasy Platform** vận hành theo mô hình phân nhánh chặt chẽ:

```
[main] --------------------------------------------------------------------> (Production / Sẵn sàng chấm thi)
          \                                                            /
[dev]      \---- [Sprint 1] ---- [Sprint 2] ---- [Sprint 3] ----------/-----> (Nhánh tích hợp chính của nhóm)
                  \                 \                 \
[branches]         \-- feature/...   \-- testing/...   \-- fix/...
```

### 1.1 Hai nhánh chính được bảo vệ tối cao (Protected Branches)
1. **Nhánh `main` (Production):**
   - Chứa mã nguồn phiên bản phát hành chính thức, đã nghiệm thu toàn bộ 25 Test Cases và không còn lỗi.
   - **BẢO VỆ TUYỆT ĐỐI:** Cấm mọi hành vi commit hoặc push trực tiếp lên `main`.
   - Mọi thay đổi đưa vào `main` bắt buộc phải thông qua **Pull Request (PR)** từ nhánh `dev` và phải do **Team Lead (Phạm Công Thành)** duyệt và merge.
2. **Nhánh `dev` (Sprint Integration Branch):**
   - Nhánh tích hợp làm việc hàng ngày của cả 5 thành viên trong nhóm.
   - Mọi tính năng, ca kiểm thử hay sửa lỗi đều phải tách nhánh riêng và tạo Pull Request merge vào `dev`.
   - Bắt buộc kiểm tra biên dịch (`npm run build` và `gradlew testClasses`) pass 100% trước khi tạo PR vào `dev`.

---

## 2. HỆ THỐNG TIỀN TỐ BẮT BUỘC & CÚ PHÁP ĐẶT TÊN NHÁNH

> [!IMPORTANT]
> ### 🏆 NGUYÊN TẮC VÀNG BẤT BIẾN (THE GOLDEN RULE)
> **1 TASK = 1 NHÁNH = 1 PULL REQUEST DUY NHẤT (1T-1B-1PR)**  
> • **Nghiêm cấm "Mega-PR":** Tuyệt đối cấm gộp từ 2 task trở lên vào cùng một nhánh.  
> • **Nghiêm cấm nhảy Sprint:** Sprint hiện tại là Sprint 3, cấm tuyệt đối nộp code hay mở PR chứa các task `S4xx` của Sprint 4.  
> • **Chế tài xử lý:** Team Lead có toàn quyền **CLOSE / REJECT NGAY LẬP TỨC** bất kỳ PR nào vi phạm quy tắc này mà không cần xem xét nội dung code!

### 2.1 Bảng hệ thống tiền tố bắt buộc (Mandatory Prefixes)

Mọi nhánh được tạo ra đều **BẮT BUỘC** phải bắt đầu bằng một trong các tiền tố sau:

| Tiền tố nhánh | Mục đích sử dụng | Phạm vi áp dụng |
|:---|:---|:---|
| **`feature/`** | Phát triển User Story / Tính năng mới | Toàn bộ các task phát triển chức năng FE & BE trong Sprint hiện tại |
| **`testing/`** | Toàn bộ công việc kiểm thử phần mềm | Unit test, Integration test, E2E Acceptance test, Mock Fixtures, DB Test |
| **`fix/`** | Sửa lỗi (Bug fix) trong Sprint | Khắc phục các lỗi phát sinh trong quá trình kiểm thử hoặc sau review |
| **`docs/`** | Soạn thảo & Cập nhật tài liệu | Báo cáo Sprint, cập nhật SRS, Architecture docs, Git Workflow, Hướng dẫn |
| **`refactor/`** | Tái cấu trúc & Dọn dẹp mã nguồn | Tối ưu hóa code, chuẩn hóa Clean Architecture mà không đổi logic nghiệp vụ |
| **`perf/`** | Tối ưu hóa hiệu năng hệ thống | Cải thiện thời gian phản hồi SQL, SWR In-Memory cache, Concurrency lock |
| **`hotfix/`** | Bản vá sự cố khẩn cấp | Xử lý lỗi nghiêm trọng ảnh hưởng trực tiếp đến luồng thanh toán / demo |

### 2.2 Cú pháp đặt tên nhánh chuẩn 100%

$$\Large \mathbf{\text{<tiền-tố>} / \text{<MÃ-TASK>} - \text{<tên-thành-viên>} - \text{<mô-tả-kebab-case>}}$$

Trong đó:
* **`<tiền-tố>`**: Chọn chính xác từ bảng mục 2.1 (`feature/`, `testing/`, `fix/`, `docs/`, `refactor/`, `perf/`, `hotfix/`).
* **`<MÃ-TASK>`**: Bắt buộc là mã thẻ trên Trello (ví dụ: `S320`, `S321`, `S322`, `S312`, `S313`, `S317`, `S318`...).
* **`<tên-thành-viên>`**: Tên không dấu của người thực hiện (`thanh`, `phat`, `phong`, `cuong`, `duc`).
* **`<mô-tả-kebab-case>`**: Mô tả ngắn gọn nội dung công việc từ 2 - 5 từ, viết thường, ngăn cách bởi dấu gạch ngang `-`.

### 2.3 Bảng danh mục mẫu nhánh chuẩn cho từng thành viên:

| Thành viên | Mã Task | Tiền tố | Tên nhánh chuẩn 100% |
|:---|:---:|:---:|:---|
| **Phạm Công Thành** | S322 | `feature/` | `feature/S322-thanh-tai-cau-truc-dang-ky-doi-tac-kyb` |
| **Phạm Công Thành** | S300 | `docs/` | `docs/S300-thanh-dong-bo-bao-cao-sprint-2-va-3` |
| **Nguyễn Đại Phát** | S321 | `feature/` | `feature/S321-phat-tich-hop-google-oauth2-otp` |
| **Trần Thanh Phong** | S310 | `perf/` | `perf/S310-phong-toi-uu-concurrency-pessimistic-lock` |
| **Trần Thanh Phong** | S315 | `fix/` | `fix/S315-phong-sua-loi-countdown-timer-giu-ghe` |
| **Huỳnh Nhật Cường** | S316 | `feature/` | `feature/S316-cuong-soat-ve-qr-camera-di-dong` |
| **Trần Minh Đức** | S320 | `testing/` | `testing/S320-duc-kiem-thu-du-lieu-mau-fixture-don-db` |
| **Trần Minh Đức** | S312 | `testing/` | `testing/S312-duc-kiem-thu-trang-chu-banner-lich-chay` |
| **Trần Minh Đức** | S313 | `testing/` | `testing/S313-duc-kiem-thu-api-tra-cuu-ve-va-bao-mat` |
| **Trần Minh Đức** | S317 | `testing/` | `testing/S317-duc-kiem-thu-tuong-thich-hop-dong-api` |
| **Trần Minh Đức** | S318 | `testing/` | `testing/S318-duc-kiem-thu-wcag-accessibility-ban-phim` |

---

## 3. TIÊU CHUẨN COMMIT MESSAGE (100% TIẾNG VIỆT CÓ DẤU)

> [!CAUTION]
> ### 🛑 QUY TẮC COMMIT MESSAGE BẮT BUỘC
> **100% COMMIT MESSAGE PHẢI VIẾT BẰNG TIẾNG VIỆT CÓ DẤU ĐẦY ĐỦ VÀ GẮN KÈM MÃ TASK!**  
> ❌ **CẤM:** Viết tiếng Anh (ví dụ: `fix bug`, `update test`, `done task`).  
> ❌ **CẤM:** Viết tiếng Việt không dấu (ví dụ: `sua giao dien dat ve`, `kiem thu tra cuu ve`).  
> ❌ **CẤM:** Commit cụt ngủn hoặc vô nghĩa (ví dụ: `wip`, `update`, `test`, `done`, `fix`).  
> ✅ **BẮT BUỘC:** Tuân thủ chuẩn Conventional Commits Tiếng Việt có dấu theo cú pháp dưới đây.

$$\Large \mathbf{\text{<loại>}(\text{<mã-task>}): \text{mô tả nội dung công việc bằng Tiếng Việt có dấu}}$$

### 3.1 Bảng phân loại Commit Types chuẩn hóa:

| Loại | Ý nghĩa | Ví dụ mẫu chuẩn Tiếng Việt có dấu |
|:---|:---|:---|
| **`feat`** | Tính năng mới | `feat(S321): tích hợp nút đăng nhập Google OAuth2 trên giao diện khách hàng` |
| **`feat`** | Tính năng mới | `feat(S322): xây dựng form thẩm định doanh nghiệp nhà xe KYB 3 khối` |
| **`test`** | Kiểm thử phần mềm | `test(S320): kiểm thử tích hợp dữ liệu mẫu fixture và quy trình dọn CSDL an toàn` |
| **`test`** | Kiểm thử phần mềm | `test(S313): kiểm thử tích hợp API tra cứu vé và bảo mật dữ liệu hành khách` |
| **`fix`** | Sửa lỗi mã nguồn | `fix(S315): sửa lỗi đếm ngược giải phóng ghế quá hạn 10 phút trên CSDL` |
| **`docs`** | Cập nhật tài liệu | `docs(S300): cập nhật biên bản tổng kết Sprint 2 và kế hoạch nước rút Sprint 3` |
| **`refactor`**| Tái cấu trúc code | `refactor(S322): chuẩn hóa service upload giấy phép vận tải lên Cloudinary` |
| **`perf`** | Tối ưu hiệu năng | `perf(S310): tối ưu câu truy vấn kiểm tra khóa bi quan dưới 30ms` |
| **`chore`** | Cấu hình & Thư viện| `chore(deps): nâng cấp thư viện quét mã QR html5-qrcode lên phiên bản mới` |

---

## 4. QUY TRÌNH LÀM VIỆC 7 BƯỚC BẮT BUỘC CỦA MỖI THÀNH VIÊN

Mỗi khi bắt đầu một task mới từ Trello, thành viên thực hiện nghiêm ngặt 7 bước sau:

### Bước 1: Kéo mã nguồn mới nhất từ nhánh `dev`
```bash
git checkout dev
git pull origin dev
```

### Bước 2: Tạo nhánh riêng cho task theo đúng cú pháp chuẩn
```bash
# Ví dụ Minh Đức làm task S320:
git checkout -b testing/S320-duc-kiem-thu-du-lieu-mau-fixture-don-db
```

### Bước 3: Viết code / test và commit đều đặn bằng tiếng Việt có dấu
```bash
git add .
git commit -m "test(S320): kiểm thử tích hợp dữ liệu mẫu fixture và quy trình dọn CSDL an toàn"
```

### Bước 4: Kiểm tra điều kiện chất lượng kỹ thuật tại máy cá nhân (Pre-flight Check)
Trước khi đẩy code lên GitHub, thành viên **BẮT BUỘC** phải tự chạy 2 lệnh sau:
1. **Kiểm tra Frontend:**
   ```bash
   cd frontend
   npm run build
   ```
   *(Bắt buộc: 0 lỗi TypeScript, build ra thư mục dist/ thành công).*
2. **Kiểm tra Backend:**
   ```bash
   cd backend
   gradlew.bat testClasses
   ```
   *(Bắt buộc: BUILD SUCCESSFUL, không có lỗi biên dịch class).*

### Bước 5: Kéo cập nhật từ `dev` về để triệt tiêu mọi xung đột (Zero Conflict)
```bash
git checkout dev
git pull origin dev
git checkout testing/S320-duc-kiem-thu-du-lieu-mau-fixture-don-db
git merge dev
```
*(Nếu có conflict, tự giải quyết trên IDE, test lại cho pass rồi mới tiếp tục).*

### Bước 6: Đẩy nhánh lên GitHub
```bash
git push -u origin testing/S320-duc-kiem-thu-du-lieu-mau-fixture-don-db
```

### Bước 7: Mở Pull Request (PR) theo mẫu quy định
1. Truy cập Repository GitHub: [https://github.com/phamcongthanhvn2k6/traveleasy-platform](https://github.com/phamcongthanhvn2k6/traveleasy-platform)
2. Bấm nút **"New pull request"**.
3. Chọn:
   - **Base branch (nhánh đích):** `dev`
   - **Compare branch (nhánh nguồn):** `testing/S320-duc-kiem-thu-du-lieu-mau-fixture-don-db`
4. Điền tiêu đề và nội dung PR theo mẫu quy định tại **Mục 5**.
5. Gán Reviewer: **`phamcongthanhvn2k6` (Phạm Công Thành)**.

---

## 5. TIÊU CHUẨN TẠO VÀ KIỂM DUYỆT PULL REQUEST (PR GATEKEEPING)

### 5.1 Cú pháp tiêu đề Pull Request
$$\Large \mathbf{\text{[<MÃ-TASK>]} \ \text{[<TIỀN-TỐ>]} \ \text{<Tên nghiệp vụ bằng Tiếng Việt có dấu>}}$$

*Ví dụ:*  
- `[S320] [TESTING] Kiểm thử tích hợp dữ liệu mẫu Fixture và dọn dẹp CSDL an toàn`
- `[S321] [FEATURE] Tích hợp Đăng nhập Google OAuth2 và Xác thực mã OTP`
- `[S322] [FEATURE] Tái cấu trúc phân hệ Đăng ký Đối tác Nhà xe KYB và Thẩm định Admin`

### 5.2 Mẫu mô tả Pull Request (PR Template) bắt buộc:

```markdown
### 📌 THÔNG TIN TASK
- **Mã Task trên Trello:** [S320]
- **Thành viên phụ trách:** Trần Minh Đức
- **Sprint:** Sprint 3 (Nhiệm vụ tồn đọng Sprint 2 dứt điểm)

### 🛠️ NỘI DUNG THAY ĐỔI
- Bổ sung class kiểm thử `S320ApiIntegrationTest.java` kiểm tra dọn sạch DB.
- Thêm trang giao diện nạp dữ liệu mẫu `TestFixturesPage.tsx` tại `/test/fixtures`.
- Viết kịch bản kiểm thử E2E tự động `S320-acceptance.spec.ts`.

### ✅ BẰNG CHỨNG KIỂM THỬ (TEST RESULTS)
- [x] Frontend `npm run build`: PASS (0 lỗi TypeScript)
- [x] Backend `gradlew testClasses`: BUILD SUCCESSFUL
- [x] Đã merge nhánh `dev` mới nhất: 0 Merge Conflict
- [x] Ảnh chụp màn hình / Log kết quả test: (Đính kèm ảnh minh chứng vào đây)
```

### 5.3 Quy định giới hạn quy mô PR (PR Size Limits)
- Mỗi PR chỉ giải quyết **duy nhất 1 mã Task**.
- Khuyến nghị: Thay đổi **dưới 15 files** và **dưới 500 dòng code** (trừ file sinh tự động hoặc file dữ liệu mẫu fixture).
- PR vượt quá ngưỡng phải có giải trình cụ thể trong phần mô tả.

---

## 6. QUY TẮC BẢO MẬT BIẾN MÔI TRƯỜNG & AN TOÀN KHO CODE

1. **TUYỆT ĐỐI CẤM COMMIT FILE `.env` LÊN GITHUB:**  
   File `.env` chứa URL kết nối Supabase thật, khóa bí mật JWT, khóa PayOS, VNPAY, Cloudinary. Commit lộ bí mật sẽ bị GitHub Secret Scanning gắn cờ và bị trừ toàn bộ điểm chuyên cần OJT!
2. **Khai báo biến mẫu tại `.env.example`:**  
   Mọi biến môi trường mới phải khai báo giá trị mẫu tại `.env.example` để đồng đội tự copy cấu hình khi kéo code về.
3. **Thẩm quyền Merge:**  
   Chỉ duy nhất **Team Lead (Phạm Công Thành)** hoặc thành viên được Lead ủy quyền bằng văn bản mới có quyền bấm nút **Merge Pull Request** vào nhánh `dev` và `main`.

---
*Quy chuẩn này có hiệu lực ngay lập tức kể từ ngày ban hành. Toàn bộ 5 thành viên Nhóm 7 có nghĩa vụ tuân thủ 100% để bảo đảm đồ án đạt điểm số tối đa 100/100!*
