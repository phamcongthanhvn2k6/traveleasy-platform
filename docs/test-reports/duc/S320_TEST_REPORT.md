# 📋 BÁO CÁO KẾT QUẢ KIỂM THỬ TÍCH HỢP FIXTURES & ĐIỀU HƯỚNG VÉ (S320 TEST REPORT)
> **Dự án**: Sàn Đặt Vé Xe Khách & Quản Lý Nhà Xe TravelEasy (`traveleasy-platform`)  
> **Người thực hiện**: Trần Minh Đức (`tranduc2601` / `@minhdctrn13`)  
> **Người phê duyệt**: Phạm Công Thành (Team Leader & System Architect)  
> **Minh chứng GitHub**: Pull Request #47 (`feat(fixtures): fix seed fixtures, scanner routing, and round-trip search`)  
> **Tuân thủ SOP**: Quy trình kiểm thử an toàn tại `docs/05-qa-and-testing/QUY_TRINH_KIEM_THU_VA_NGHIEM_THU_CHUAN_DO_AN.md`.

---

## 📌 1. THÔNG TIN THẺ KIỂM THỬ
* **Mã thẻ Trello**: `[FE+BE][S320]`
* **Tiêu đề công việc**: `[Ưu tiên: 2] [2 SP] [FE+BE][S320] Khắc phục lỗi fixtures dữ liệu mẫu, điều hướng soát vé và đồng bộ tìm kiếm khứ hồi`
* **Cột Trello**: `Done Sprint 3`
* **Ngày kiểm thử & nghiệm thu**: `06/11/2026`
* **Môi trường kiểm thử**:
  - Backend: `S320ApiIntegrationTest.java` (Spring Boot MockMvc, `@ActiveProfiles("test")`, Supabase/H2)
  - Frontend: `S320-acceptance.spec.ts` (Playwright E2E Test Suite)
  - Trình duyệt: Chromium, Firefox, WebKit, Mobile Safari

---

## 🔬 2. NỘI DUNG VÀ KẾT QUẢ THỰC HIỆN KIỂM THỬ

### 2.1. Kiểm thử Backend (`S320ApiIntegrationTest.java`)
| STT | Tên Test Case | Mục tiêu kiểm định | Kết quả | Ghi chú an toàn |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `testFixturesSeedDataInitialization` | Kiểm tra nạp dữ liệu mẫu 25+ tuyến đường và xe | **PASS** | Không ghi đè bảng Production |
| 2 | `testSoldOutGuardCheck` | Chặn đứng hành vi đặt vé khi chuyến đã hết ghế | **PASS** | Bắn mã lỗi 400 Bad Request chuẩn |
| 3 | `testPublicContentController` | Endpoint `/api/public/destinations` phản hồi 200 | **PASS** | Dữ liệu JSON chuẩn RFC 7807 |

### 2.2. Kiểm thử Giao diện E2E Playwright (`S320-acceptance.spec.ts`)
| STT | Kịch bản kiểm thử (Test Scenario) | Kết quả mong đợi | Kết quả thực tế |
| :---: | :--- | :--- | :---: |
| 1 | Truy cập trang dữ liệu mẫu `/test/fixtures` | Hiển thị bảng điều khiển seed data | **PASS (100%)** |
| 2 | Điều hướng soát vé QR `/scanner` sang `/operator/check-in` | Chuyển trang mượt mà không lỗi 404 | **PASS (100%)** |
| 3 | Tìm kiếm chuyến xe khứ hồi (Round-trip) | Đồng bộ ngày đi và ngày về chính xác | **PASS (100%)** |
| 4 | Trạng thái hiển thị chuyến hết vé (Sold-out badge) | Nút chọn ghế bị vô hiệu hóa, mác "Hết vé" | **PASS (100%)** |

---

## 📸 3. BẰNG CHỨNG HÌNH ẢNH & LOG TERMINAL
* **Backend Build**: `.\gradlew.bat compileJava` $\rightarrow$ `BUILD SUCCESSFUL in 4s`.
* **Frontend E2E**: Chạy `npx playwright test S320-acceptance.spec.ts` $\rightarrow$ `4 passed (100%)`.
* **Ảnh chụp màn hình**: Lưu tại `docs/screenshots/` (Gồm ảnh seed fixtures và điều hướng soát vé).

---

## 🏆 4. KẾT LUẬN & NGHIỆM THU (DoD)
* [x] Không sửa đổi xâm lấn logic cốt lõi của thành viên khác.
* [x] Cả Backend và Frontend đều build thành công 0 lỗi.
* [x] Không commit thư mục rác `test-results/`.
* [x] Code đã merge thành công vào nhánh `dev` qua PR #47.
* **Đánh giá của Leader**: Nghiệm thu đạt chuẩn 100% DoD.
