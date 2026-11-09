# ⚖️ QUY CHUẨN KỸ THUẬT QUẢN TRỊ MÃ NGUỒN & ĐIỀU LỆ KỶ LUẬT GIT (GIT WORKFLOW CONSTITUTION)
## DỰ ÁN: TRAVELEASY PLATFORM — HỆ THỐNG ĐẶT VÉ XE KHÁCH LIÊN TỈNH
### ĐƠN VỊ: OJT ĐỒ ÁN NHÓM 7 | MÃ DỰ ÁN: `PRJ-TRAVELEASY-MVP-01`
### CƠ QUAN BAN HÀNH: BAN QUẢN TRỊ DỰ ÁN | TRƯỞNG NHÓM (REPO OWNER): PHẠM CÔNG THÀNH
### HIỆU LỰC THI HÀNH: BẮT BUỘC ÁP DỤNG ĐỐI VỚI 100% THÀNH VIÊN KỂ TỪ KHI BAN HÀNH

---

> ### 📜 LỜI MỞ ĐẦU & CĂN CỨ PHÁP LÝ NỘI BỘ
> 1. Tài liệu này là **Hiến chương Quản trị Mã nguồn** chính thức của Nhóm 7 (TravelEasy Platform). Mọi thành viên tham gia phát triển dự án bắt buộc phải nghiên cứu kỹ lưỡng và tuân thủ tuyệt đối từng điều khoản.
> 2. Mọi đánh giá về điểm số chuyên cần, điểm đóng góp cá nhân (Individual Contribution) và kết quả nghiệm thu OJT của Giảng viên đều căn cứ trực tiếp trên lịch sử Git (Git Tree, Pull Request history, Commit logs) theo đúng tài liệu này.
> 3. Bất kỳ thành viên nào thao tác sai quy định sẽ bị xử lý theo đúng **Chương 5: Bảng chế tài & Căn cứ xử lý vi phạm** của văn bản này. Không có trường hợp ngoại lệ.

---

## CHƯƠNG 1: NGUYÊN TẮC BẤT DI BẤT BIẾN (THE CARDINAL RULES)

Mọi thành viên khi mở máy tính và làm việc với repository đều phải khắc cốt ghi tâm **4 Nguyên tắc Vàng**:

* **NGUYÊN TẮC 1 — LUẬT ĐỘC LẬP TÁC VỤ (1T-1B-1PR):**  
  $$\mathbf{1 \ Task \ (User \ Story) = 1 \ Branch \ Riêng \ Biệt = 1 \ Pull \ Request \ Duy \ Nhất}$$  
  Nghiêm cấm tuyệt đối hành vi gộp từ 2 task trở lên vào cùng một nhánh (Mega-PR). Một task chỉ được coi là hoàn thành khi PR của riêng task đó được Team Lead duyệt (Approve) và merge vào `dev`.
* **NGUYÊN TẮC 2 — LUẬT BẢO TỒN RANH GIỚI SPRINT (SPRINT BOUNDARY INTEGRITY):**  
  Sprint nào chỉ làm và nộp đúng các task của Sprint đó. Đang trong chu kỳ Sprint 3 thì chỉ làm và mở PR cho các mã task của Sprint 3 (`S3xx`). Bất kỳ PR nào làm sai phạm vi sẽ bị từ chối ngay lập tức.
* **NGUYÊN TẮC 3 — LUẬT NGÔN NGỮ BẢN ĐỊA CHUẨN MỰC (100% VIETNAMESE COMMITS):**  
  100% commit message phải viết bằng **Tiếng Việt có dấu đầy đủ, chuẩn ngữ pháp**, tuân thủ định dạng Conventional Commits và có mã task rõ ràng. Cấm tiếng Anh nửa mùa, cấm tiếng Việt không dấu, cấm commit vô nghĩa.
* **NGUYÊN TẮC 4 — LUẬT KHÔNG HỎNG NHÁNH CHUNG (ZERO BROKEN BUILDS):**  
  Trước khi mở Pull Request vào `dev`, nhánh cá nhân **BẮT BUỘC** phải vượt qua kiểm tra biên dịch độc lập (Frontend build pass 100%, Backend compile pass 100%) và không có xung đột mã nguồn (Zero Merge Conflict).

---

## CHƯƠNG 2: MÔ HÌNH PHÂN NHÁNH & HỆ THỐNG TIỀN TỐ BẮT BUỘC

### 2.1 Cấu trúc cây phân nhánh (Branching Topology)

```
[main]  =============================================================> (Production / Bản phát hành chấm thi)
           \                                                    // (Chỉ Lead merge khi kết thúc đồ án)
[dev]       \==== [Sprint 1] ====> [Sprint 2] ====> [Sprint 3] =========> (Nhánh tích hợp làm việc hàng ngày)
                   \\                \\              \\
[branches]          \-- feature/...    \-- fix/...     \-- testing/...
```

1. **Nhánh `main` (Production Branch — BẢO VỆ TUYỆT ĐỐI):**
   - Chỉ lưu trữ phiên bản ổn định nhất, hoàn thiện 100% để trình chiếu trước Hội đồng chấm thi.
   - Bật cơ chế **Branch Protection Rules** trên GitHub: Cấm push thẳng, cấm force push, bắt buộc phải có PR và 100% phải do Team Lead (Phạm Công Thành) trực tiếp Approve và Merge.
2. **Nhánh `dev` (Development Integration Branch — NHÁNH LÀM VIỆC CHUNG):**
   - Là điểm hội tụ mã nguồn của cả 5 thành viên trong từng Sprint.
   - Không ai được phép code trực tiếp trên `dev`. Mọi đóng góp đều phải đi qua nhánh con và Pull Request.
3. **Các nhánh con ngắn hạn (Topic / Feature Branches):**
   - Nhánh con được tách ra từ `dev`, hoàn thành xong task thì merge ngược về `dev` và xóa nhánh trên GitHub.

---

### 2.2 Bảng hệ thống Tiền tố nhánh (Mandatory Branch Prefixes)

Mọi nhánh làm việc được tạo ra **BẮT BUỘC** phải có tiền tố nằm trong bảng dưới đây. Các tiền tố được phân định ranh giới rạch ròi, **hoàn toàn không trùng lặp ý nghĩa**:

| Tiền tố nhánh | Tên gọi chuẩn | Định nghĩa & Ranh giới áp dụng chuẩn mực | Ví dụ mẫu chuẩn |
|:---|:---|:---|:---|
| **`feature/`** | Nhánh Tính năng | Sử dụng khi **phát triển một User Story mới** (viết mới màn hình UI, thêm mới endpoint API, thêm mới nghiệp vụ logic). | `feature/S321-phat-dang-nhap-google-otp`<br/>`feature/S322-thanh-dang-ky-doi-tac-kyb` |
| **`testing/`** | Nhánh Kiểm thử | Sử dụng cho **toàn bộ công tác kiểm thử**: viết Unit test, Integration test, E2E spec Playwright, tạo Mock Fixtures, scripts dọn dẹp DB. | `testing/S320-duc-du-lieu-mau-fixture-don-db`<br/>`testing/S312-duc-kiem-thu-trang-chu-banner` |
| **`fix/`** | Nhánh Sửa lỗi | Sử dụng khi **sửa lỗi (bug) phát sinh** trong quá trình kiểm thử nội bộ hoặc khắc phục lỗi do Giảng viên chỉ ra sau buổi review. | `fix/S315-phong-sua-loi-countdown-timer-ghe`<br/>`fix/S319-cuong-sua-loi-responsive-mobile` |
| **`docs/`** | Nhánh Tài liệu | Sử dụng khi **soạn thảo, cập nhật tài liệu dự án** (báo cáo Sprint, biên bản nghiệm thu, SRS, ERD, hướng dẫn Git). | `docs/S300-thanh-dong-bo-bao-cao-sprint-2-va-3`<br/>`docs/S301-phat-dac-ta-api-admin-portal` |
| **`refactor/`** | Nhánh Tái cấu trúc| Sử dụng khi **sắp xếp lại code cho sạch đẹp** (Clean Code, tách component, tối ưu package) mà **KHÔNG sửa bug** và **KHÔNG đổi tính năng**. | `refactor/S322-thanh-tach-service-cloudinary`<br/>`refactor/S310-phong-chuan-hoa-booking-helper` |
| **`perf/`** | Nhánh Hiệu năng | Sử dụng khi **tối ưu hóa tốc độ, độ trễ hệ thống** (đánh chỉ mục Database Index, cấu hình SWR Cache, giảm độ trễ lock ghế dưới 30ms). | `perf/S310-phong-toi-uu-khoa-bi-quan-sql`<br/>`perf/S314-cuong-nen-anh-webp-giam-tai` |
| **`hotfix/`** | Nhánh Vá khẩn | Chỉ dùng khi **sửa lỗi cực kỳ nghiêm trọng (Blocker/Critical)** trên nhánh `main` khi sắp đến giờ báo cáo với Giảng viên. | `hotfix/HF01-thanh-sua-loi-khoa-admin-toi-cao` |

---

### 2.3 Cú pháp đặt tên nhánh (Branch Naming Syntax)

$$\Large \mathbf{	ext{<tiền-tố>} / 	ext{<MÃ-TASK>} - 	ext{<tên-thành-viên>} - 	ext{<mô-tả-kebab-case>}}$$

**Quy tắc kiểm tra tính hợp lệ của tên nhánh:**
1. `<tiền-tố>`: Phải có dấu `/` phía sau và thuộc 1 trong 7 tiền tố trên (`feature/`, `testing/`, `fix/`, `docs/`, `refactor/`, `perf/`, `hotfix/`).
2. `<MÃ-TASK>`: Bắt buộc in hoa và khớp với mã thẻ trên bảng Trello (ví dụ: `S320`, `S321`, `S322`, `S312`, `S313`, `S317`, `S318`...).
3. `<tên-thành-viên>`: Viết thường không dấu (`thanh`, `phat`, `phong`, `cuong`, `duc`).
4. `<mô-tả-kebab-case>`: Viết thường, không dấu, từ 2 đến 5 từ ngắn gọn, ngăn cách bằng dấu gạch ngang `-`.

*Ví dụ tên nhánh HỢP LỆ:*
- ✅ `testing/S320-duc-kiem-thu-du-lieu-mau-fixture-don-db`
- ✅ `feature/S321-phat-tich-hop-google-oauth2-otp`
- ✅ `feature/S322-thanh-tai-cau-truc-dang-ky-doi-tac-kyb`
- ✅ `fix/S315-phong-sua-loi-dem-nguoc-khoa-ghe`

*Ví dụ tên nhánh KHÔNG HỢP LỆ (Sẽ bị từ chối):*
- ❌ `feature/minhduc-customer-tickets-acceptance` *(Thiếu mã task, gộp nhiều task)*
- ❌ `test/duc-acceptance` *(Sai tiền tố `test/` thay vì `testing/`, thiếu mã task)*
- ❌ `S320_kiem_thu_du_lieu` *(Thiếu tiền tố, sai cú pháp gạch dưới)*
- ❌ `testing/S320_S312_S313_kiem_thu` *(Gộp nhiều task vào 1 nhánh)*

---


### 2.3 Liên kết trạng thái Git Pull Request với Bảng Trello Kanban

Mỗi giai đoạn trong quy trình Git gắn liền với một bước chuyển dịch trên bảng Trello:

`
[Bắt đầu task]    ---> Kéo thẻ từ 'To Do' sang 'In Progress'
[Mở Pull Request]  ---> Kéo thẻ từ 'In Progress' sang 'Code Review' (Dán link PR)
[Lead Test]        ---> Nhóm trưởng kéo sang 'Testing'
[Phát hiện lỗi]   ---> Nhóm trưởng chuyển sang 'Bug' (Thành viên kéo về 'In Progress' sửa)
[Merge dev thành công] ---> Nhóm trưởng kéo sang 'Done'
`

---

## CHƯƠNG 3: QUY CHUẨN COMMIT MESSAGE (TIẾNG VIỆT CÓ DẤU & RÕ NGHĨA)

### 3.1 Cú pháp Commit chuẩn Conventional Commits

$$\Large \mathbf{	ext{<loại>}(	ext{<mã-task>}): 	ext{mô tả hành động chi tiết bằng Tiếng Việt có dấu}}$$

### 3.2 Bảng đối chiếu 8 loại Commit Types (Phân định rạch ròi, không trùng lặp):

| Loại Commit | Định nghĩa ranh giới sử dụng | Trường hợp áp dụng thực tế trong dự án | Ví dụ mẫu chuẩn 100% Tiếng Việt có dấu |
|:---|:---|:---|:---|
| **`feat`** | **Tính năng mới** | Thêm mới trang giao diện, thêm component, thêm API endpoint mới. | `feat(S321): thêm nút đăng nhập Google Identity trên trang login` |
| **`test`** | **Kiểm thử phần mềm** | Viết code test (JUnit, Mockito, Playwright, Fixtures, Mock Data). | `test(S320): viết test tích hợp kiểm tra quy trình dọn CSDL an toàn` |
| **`fix`** | **Sửa lỗi mã nguồn** | Khắc phục bug logic nghiệp vụ sai, lỗi vỡ layout hoặc lỗi crash API. | `fix(S315): sửa lỗi đếm ngược giải phóng ghế quá hạn 10 phút trên CSDL` |
| **`refactor`**| **Tái cấu trúc code**| Sắp xếp lại class/hàm cho sạch mà **không sửa bug**, **không đổi tính năng**. | `refactor(S322): tách logic upload ảnh Cloudinary thành service dùng chung` |
| **`perf`** | **Tối ưu hiệu năng** | Giảm thời gian phản hồi (ms), tối ưu query SQL, bổ sung bộ nhớ đệm cache. | `perf(S310): tối ưu hóa câu lệnh khóa bi quan giảm thời gian phản hồi <30ms` |
| **`docs`** | **Cập nhật tài liệu**| Soạn thảo hoặc sửa đổi tài liệu markdown, SRS, báo cáo sprint, biên bản. | `docs(S300): đồng bộ báo cáo tổng kết Sprint 2 và kế hoạch Sprint 3` |
| **`chore`** | **Cấu hình & Phụ thuộc**| Nâng cấp thư viện `pom.xml`, `package.json`, cấu hình build Vite/Gradle. | `chore(deps): bổ sung thư viện @react-oauth/google phiên bản mới nhất` |
| **`ci`** | **Tự động hóa CI/CD**| Chỉnh sửa file workflow `.github/workflows/` cho pipeline tự động. | `ci(actions): thêm bước tự động kiểm tra npm run build khi mở PR vào dev` |

### 3.3 Danh sách đen các Commit BỊ NGHIÊM CẤM (Commit Blacklist):
* ❌ **Cấm commit bằng Tiếng Anh:** `fix bug`, `update code`, `add new feature`, `test completed`, `wip`.
* ❌ **Cấm commit bằng Tiếng Việt không dấu:** `sua giao dien`, `them tinh nang`, `test xong roi`, `commit code`.
* ❌ **Cấm commit cụt ngủn hoặc mơ hồ:** `fix`, `update`, `done`, `test`, `ok`, `a`, `1`, `clean`.
* ❌ **Cấm commit sai mã task hoặc không có mã task:** `feat: xong tinh nang`, `fix(bug): sua loi`.

---

## CHƯƠNG 4: QUY TRÌNH 7 BƯỚC HÀNG NGÀY & TIÊU CHUẨN MỞ PULL REQUEST

### 4.1 Quy trình 7 bước bắt buộc cho mọi thành viên:

```
[B1: Kéo dev mới nhất] ➔ [B2: Tạo nhánh riêng theo task] ➔ [B3: Code & Commit có dấu]
                                                                        │
[B6: Đẩy nhánh lên Git] ◄── [B5: Merge dev & xử lý xung đột] ◄── [B4: Pre-flight Check (Build FE/BE)]
          │
[B7: Mở PR & Gán Lead Review]
```

1. **Bước 1: Kéo mã nguồn mới nhất từ `dev`:**
   ```bash
   git checkout dev
   git pull origin dev
   ```
2. **Bước 2: Tạo nhánh riêng cho đúng 1 task:**
   ```bash
   # Ví dụ: Đức nhận task S320
   git checkout -b testing/S320-duc-kiem-thu-du-lieu-mau-fixture-don-db
   ```
3. **Bước 3: Viết code và commit đều đặn bằng tiếng Việt có dấu:**
   ```bash
   git add .
   git commit -m "test(S320): tích hợp kiểm thử dữ liệu mẫu fixture và quy trình dọn CSDL an toàn"
   ```
4. **Bước 4: Chạy kiểm tra kỹ thuật tại máy cá nhân (Pre-flight Check BẮT BUỘC):**
   - **Frontend:** `cd frontend && npm run build` ➔ **Phải đạt: 0 lỗi TypeScript, ra thư mục dist/**.
   - **Backend:** `cd backend && gradlew.bat testClasses` ➔ **Phải đạt: BUILD SUCCESSFUL**.
   *(Nếu bị lỗi, phải tự sửa xong trên máy cá nhân rồi mới được đi tiếp Bước 5).*
5. **Bước 5: Kéo cập nhật từ `dev` về để triệt tiêu mọi xung đột:**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout testing/S320-duc-kiem-thu-du-lieu-mau-fixture-don-db
   git merge dev
   ```
   *(Nếu có conflict, tự giải quyết trên IDE, chạy lại Bước 4 rồi mới commit).*
6. **Bước 6: Đẩy nhánh tính năng lên GitHub:**
   ```bash
   git push -u origin testing/S320-duc-kiem-thu-du-lieu-mau-fixture-don-db
   ```
7. **Bước 7: Mở Pull Request vào `dev` theo đúng biểu mẫu chuẩn.**

---

### 4.2 Cú pháp tiêu đề Pull Request
$$\Large \mathbf{	ext{[<MÃ-TASK>]} \ 	ext{[<TIỀN-TỐ-IN-HOA>]} \ 	ext{<Tên nghiệp vụ bằng Tiếng Việt có dấu>}}$$

*Ví dụ:*
- `[S320] [TESTING] Kiểm thử tích hợp dữ liệu mẫu Fixture và quy trình dọn CSDL an toàn`
- `[S321] [FEATURE] Tích hợp Đăng nhập nhanh Google OAuth2 và Xác thực mã OTP`
- `[S322] [FEATURE] Tái cấu trúc phân hệ Đăng ký Đối tác Nhà xe KYB và Thẩm định Cổng Admin`
- `[S315] [FIX] Khắc phục lỗi bộ đếm ngược giải phóng ghế giữ chỗ quá hạn 10 phút`

### 4.3 Mẫu mô tả Pull Request (PR Template) bắt buộc:

Mỗi khi tạo PR trên GitHub, thành viên **bắt buộc** phải điền đầy đủ mẫu sau vào phần Description:

```markdown
### 📌 1. THÔNG TIN TASK
- **Mã Task trên Trello:** [S320]
- **Thành viên thực hiện:** Trần Minh Đức
- **Sprint:** Sprint 3 (Nhiệm vụ tồn đọng Sprint 2 dứt điểm)

### 🛠️ 2. NỘI DUNG THAY ĐỔI
- Bổ sung class kiểm thử `S320ApiIntegrationTest.java` kiểm tra dọn sạch DB.
- Thêm trang giao diện nạp dữ liệu mẫu `TestFixturesPage.tsx` tại `/test/fixtures`.
- Viết kịch bản kiểm thử E2E tự động `S320-acceptance.spec.ts`.

### ✅ 3. BIÊN BẢN TỰ KIỂM TRA (PRE-FLIGHT CHECKLIST)
- [x] Chỉ xử lý duy nhất 1 task [S320], không gom task khác vào nhánh.
- [x] Đúng tiến độ Sprint 3, không có mã nguồn của Sprint khác.
- [x] Frontend `npm run build`: PASS (0 lỗi TypeScript).
- [x] Backend `gradlew testClasses`: BUILD SUCCESSFUL.
- [x] Đã merge nhánh `dev` mới nhất: 0 Merge Conflict.
- [x] Toàn bộ commit message đều bằng Tiếng Việt có dấu.

### 📷 4. ẢNH CHỤP MINH CHỨNG NGHIỆM THU
(Dán ảnh chụp màn hình chức năng hoạt động hoặc ảnh log test PASS vào đây)
```

---

## CHƯƠNG 5: BẢNG CHẾ TÀI & CĂN CỨ XỬ LÝ VI PHẠM (DISCIPLINARY POLICY)

Nhằm đảm bảo tính nghiêm minh và công bằng cho toàn đội, Ban Quản trị dự án ban hành **Khung chế tài 5 lỗi vi phạm**:

| Mã Vi Phạm | Tên Hành Vi Vi Phạm | Mô tả chi tiết hành vi | Biện pháp chế tài & Căn cứ xử lý |
|:---:|:---|:---|:---|
| **VP-01** | **Gom task vào 1 nhánh (Mega-PR)** | Tạo branch hoặc PR chứa từ 2 User Stories/Tasks trở lên (ví dụ: gộp S312, S313, S320 vào 1 branch). | • **CẤP 1:** Team Lead **CLOSE / REJECT NGAY LẬP TỨC** PR không cần đọc code.<br/>• Bắt buộc thành viên phải tự cherry-pick tách ra từng nhánh riêng để nộp lại. |
| **VP-02** | **Vượt rào Sprint (Sprint Jumping)** | Mở PR chứa các mã task thuộc Sprint tiếp theo khi Sprint hiện tại chưa hoàn thành (ví dụ: đang Sprint 3 nộp task S418, S419). | • **CẤP 1:** Team Lead **CLOSE PR NGAY LẬP TỨC**.<br/>• Gắn nhãn `invalid-sprint-jumping`. Yêu cầu giữ lại trên local, cấm nộp lên `dev`. |
| **VP-03** | **Sai tiền tố & Cú pháp nhánh** | Đặt tên nhánh không có tiền tố hợp lệ, thiếu mã task hoặc dùng dấu gạch dưới `_` (ví dụ: `test/duc-acceptance`, `feature/minhduc`). | • **CẤP 1:** Yêu cầu đổi tên nhánh hoặc tạo nhánh mới đúng chuẩn trước khi Lead xem xét. |
| **VP-04** | **Commit tiếng Anh / Không dấu / Vô nghĩa** | Commit bằng tiếng Anh (`fix bug`, `done`), tiếng Việt không dấu (`sua code`) hoặc vô nghĩa (`update`, `fix`). | • **CẤP 1:** Bắt buộc thành viên phải dùng `git commit --amend` hoặc `git rebase -i` viết lại toàn bộ message bằng Tiếng Việt có dấu trước khi được duyệt. |
| **VP-05** | **Đẩy code hỏng / Conflict (Broken PR)** | Mở PR khi Frontend chưa build pass, Backend chưa compile pass hoặc đang bị xung đột với `dev`. | • **CẤP 1:** Reject PR.<br/>• **CẤP 2 (Nếu tái phạm 2 lần):** Trừ 10% điểm đánh giá chuyên cần cá nhân OJT trong tuần. |

---

## CHƯƠNG 6: HƯỚNG DẪN KHẮC PHỤC KHI ĐÃ LỠ LÀM SAI (TROUBLESHOOTING GUIDE)

Nếu thành viên đã lỡ gom nhiều commit vào một nhánh sai quy định (như trường hợp của Minh Đức với nhánh `feature/minhduc-customer-tickets-acceptance`), hãy bình tĩnh thực hiện theo các bước sau để bóc tách mã nguồn sạch sẽ:

### 6.1 Cách dùng `git cherry-pick` để bóc từng task thành nhánh riêng:

Giả sử bạn đã có nhánh tổng hợp chứa các commit:
- Task S320 gồm 2 commit: `e99212a` và `754fc71`.
- Task S312 gồm commit: `62ed0b6`.
- Task S313 gồm commit: `5b85548`.

**Quy trình bóc tách từng nhánh độc lập:**

```bash
# Bước 1: Kéo dev mới nhất
git checkout dev
git pull origin dev

# Bước 2: Tách nhánh riêng cho Task S320
git checkout -b testing/S320-duc-kiem-thu-du-lieu-mau-fixture-don-db
git cherry-pick e99212a 754fc71
# Kiểm tra build: cd frontend && npm run build && cd ../backend && gradlew.bat testClasses
git push -u origin testing/S320-duc-kiem-thu-du-lieu-mau-fixture-don-db
# Sau đó lên GitHub mở PR riêng cho S320!

# Bước 3: Tách tiếp nhánh riêng cho Task S312
git checkout dev
git checkout -b testing/S312-duc-kiem-thu-trang-chu-banner-lich-chay
git cherry-pick 62ed0b6
git push -u origin testing/S312-duc-kiem-thu-trang-chu-banner-lich-chay
# Mở PR riêng cho S312!

# Bước 4: Tách tiếp nhánh riêng cho Task S313
git checkout dev
git checkout -b testing/S313-duc-kiem-thu-api-tra-cuu-ve-va-bao-mat
git cherry-pick 5b85548
git push -u origin testing/S313-duc-kiem-thu-api-tra-cuu-ve-va-bao-mat
# Mở PR riêng cho S313!
```

### 6.2 Cách sửa lại commit message sai sang Tiếng Việt có dấu:
Nếu bạn vừa commit mà quên gõ tiếng Việt có dấu:
```bash
git commit --amend -m "test(S320): tích hợp kiểm thử dữ liệu mẫu fixture và quy trình dọn CSDL an toàn"
git push --force-with-lease origin <tên-nhánh>
```

---

## CHƯƠNG 7: PHÊ DUYỆT & HIỆU LỰC THI HÀNH

1. Văn bản này được biểu quyết và thông qua bởi **Toàn thể thành viên Nhóm 7**.
2. **Team Leader (Phạm Công Thành)** giữ quyền giám sát, phê duyệt (Approve) và thực thi các biện pháp chế tài quản trị mã nguồn.
3. Toàn bộ các vi phạm được ghi nhận tự động vào **Nhật ký Kiểm toán Dự án (Audit Log)** để làm căn cứ chấm điểm OJT cuối khóa.

---
**BAN HÀNH CHÍNH THỨC BỞI TRƯỞNG NHÓM PHẠM CÔNG THÀNH**  
*Dự án TravelEasy Platform — OJT Nhóm 7*  
*Ký duyệt ngày 04/11/2026.*
