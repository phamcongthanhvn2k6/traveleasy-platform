# 📋 BÁO CÁO KẾT QUẢ KIỂM THỬ XÁC THỰC FIREBASE GOOGLE SIGN-IN & OTP (S321 TEST REPORT)
> **Dự án**: Sàn Đặt Vé Xe Khách & Quản Lý Nhà Xe TravelEasy (`traveleasy-platform`)  
> **Người thực hiện**: Nguyễn Đại Phát (`Phat-Nguyen06` / `@phatnguyn146`)  
> **Người phê duyệt**: Phạm Công Thành (Team Leader & System Architect)  
> **Minh chứng GitHub**: Pull Request #45 (`feat(auth): implement Firebase Google sign-in`)  
> **Tuân thủ SOP**: Quy trình kiểm thử an toàn tại `docs/05-qa-and-testing/QUY_TRINH_KIEM_THU_VA_NGHIEM_THU_CHUAN_DO_AN.md`.

---

## 📌 1. THÔNG TIN THẺ KIỂM THỬ
* **Mã thẻ Trello**: `[S321A]`, `[S321B]`, `[S321C]`, `[S321D]` (Phân tách từ thẻ gốc `[S321]`)
* **Tiêu đề công việc**:
  - `[FE][S321A]` Thiết kế nút Đăng nhập Google & Xử lý Callback lấy ID Token (1 SP)
  - `[BE][S321B]` API Xác thực Google ID Token, Tự động liên kết User & Cấp JWT (2 SP)
  - `[FE][S321C]` Giao diện Modal nhập mã OTP 6 ô tự động nhảy focus & Bộ đếm 60s (1 SP)
  - `[BE][S321D]` Dịch vụ Sinh mã OTP, Quản trị thời gian sống TTL & Xác thực số điện thoại (1 SP)
* **Cột Trello**: `Done Sprint 3`
* **Ngày kiểm thử & nghiệm thu**: `06/11/2026`
* **Môi trường kiểm thử**:
  - Backend: Spring Boot 3 Security JWT (`AuthController.java`, Firebase Admin SDK)
  - Frontend: React 18 + Vite (`LoginPage.jsx`, Firebase Client Auth SDK)

---

## 🔬 2. NỘI DUNG VÀ KẾT QUẢ THỰC HIỆN KIỂM THỬ

### 2.1. Kiểm thử Backend (`AuthController.java`)
| STT | Kịch bản kiểm thử (API Scenario) | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Xác thực ID Token Google hợp lệ | `POST /api/v1/auth/firebase/google` với `idToken` | Sinh bản ghi User, cấp phát cặp JWT token | **PASS (200 OK)** |
| 2 | Xác thực ID Token giả mạo / hết hạn | `idToken` không đúng chữ ký Google | Từ chối truy cập, bắt lỗi an toàn | **PASS (401 Unauthorized)** |
| 3 | Sinh mã OTP 6 chữ số | `POST /api/v1/auth/otp/send` với SĐT | Mã OTP được sinh và lưu cache TTL 5 phút | **PASS (200 OK)** |
| 4 | Xác thực mã OTP đúng | Nhập đúng mã OTP trong thời gian 5 phút | Cập nhật `is_phone_verified = true` | **PASS (200 OK)** |

### 2.2. Kiểm thử Giao diện Frontend (`LoginPage.jsx`)
| STT | Kịch bản kiểm thử (Frontend Scenario) | Kết quả mong đợi | Kết quả thực tế |
| :---: | :--- | :--- | :---: |
| 1 | Hiển thị nút "Đăng nhập bằng Google" | Nút chuẩn nhận diện tại `/login` và `/register` | **PASS** |
| 2 | Popup đăng nhập Google One-Tap | Bật popup Google, chọn tài khoản và nhận token | **PASS** |
| 3 | Modal nhập OTP 6 ô input | Nhập số tự động nhảy focus sang ô tiếp theo | **PASS** |
| 4 | Đồng hồ đếm ngược 60s và nút "Gửi lại mã" | Đếm lùi từ 60 về 0, vô hiệu hóa nút gửi spam | **PASS** |

---

## 📸 3. BẰNG CHỨNG HÌNH ẢNH & LOG TERMINAL
* **Backend Build**: `.\gradlew.bat compileJava` $\rightarrow$ `BUILD SUCCESSFUL`.
* **Frontend Build**: `npm run build` $\rightarrow$ `✓ built in 20.74s (0 errors)`.
* **Mã nguồn đã tích hợp**: PR #45 đã merge thành công vào nhánh `dev`.

---

## 🏆 4. KẾT LUẬN & NGHIỆM THU (DoD)
* [x] Tuân thủ 100% bảo mật: Không hardcode secret keys, sử dụng biến môi trường.
* [x] Đã phân tách thành 4 thẻ chuẩn Scrum 1-2 SP, xóa bỏ thẻ lạm phát 10 SP.
* [x] Code đã merge thành công vào nhánh `dev` qua PR #45.
* **Đánh giá của Leader**: Nghiệm thu đạt chuẩn 100% DoD.
