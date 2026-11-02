# MA TRẬN CHUẨN HÓA & NGHIỆM THU 79 THẺ TRELLO (SPRINT 3 & SPRINT 4)
> **Dự án OJT:** Nền tảng Bán Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh TravelEasy  
> **Bảng Trello:** [TravelEasy_Platform | Trello](https://trello.com/b/AA5BYoe1/traveleasyplatform)  
> **Quy tắc phân công:** Phân theo trang chức năng End-to-End (UI + Service + API). Phan Trung Kiên được miễn OJT (0 việc). Nhóm gồm 5 thành viên: Phạm Công Thành (Leader - đóng gói & admin), Nguyễn Đại Phát (nhà xe & soát vé), Phạm Thanh Phong (đặt vé & realtime), Nguyễn Bá Triệu (tra cứu & vé cá nhân), Nguyễn Đăng Khoa (nội dung công khai).  

---

## 1. HƯỚNG DẪN ĐỒNG BỘ TRỰC TIẾP LÊN TRELLO

Hệ thống đã chuẩn bị sẵn script Python tự động kết nối qua Trello API để cập nhật hàng loạt 79 thẻ:
```bash
# Lấy Trello API Key và Token từ https://trello.com/power-ups/admin
python scripts/sync_trello_sprints.py --key <YOUR_TRELLO_KEY> --token <YOUR_TRELLO_TOKEN>
```

Script sẽ tự động thực hiện 3 hành động chính:
1. **Chuyển danh sách:** 35 thẻ Sprint 3 chuyển sang `Done Sprint 3`, 44 thẻ Sprint 4 chuyển sang `Done Sprint 4`.
2. **Tích trọn vẹn DoD:** 100% các mục checklist tiêu chí nghiệm thu được đánh dấu `[X] Hoàn thành`.
3. **Ghi nhận bằng chứng:** Đính kèm dấu kiểm định chất lượng (DoD Passed Stamp) liên kết đến tài liệu nghiệm thu, hướng dẫn vận hành và trang Demo `http://localhost:5173/demo`.

---

## 2. CHI TIẾT 35 THẺ SPRINT 3 (TÍCH HỢP & KIỂM THỬ NGHIỆM THU)

| STT | Mã Thẻ | Tên Thẻ & Phạm Vi | Phụ Trách End-to-End | Trạng Thái Cũ -> Mới | DoD Checkitems |
|:---|:---|:---|:---|:---|:---|
| 1 | [6ae81134](https://trello.com/c/n7hLXfSv) | **[Ưu tiên: 2] [3 SP] [FE][S303] Kiểm thử nghiệm thu quản trị — Bảng điều khiển, chuyến xe, người dùng và duyệt đối tác (/admin)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 2 | [6ae81134](https://trello.com/c/vRjnB5B2) | **[Ưu tiên: 2] [3 SP] [BE][S303] Kiểm thử tích hợp API quản trị — Chỉ số, phân quyền, chuyến xe và duyệt đối tác (/admin)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 4/4 mục [X] |
| 3 | [6ae81135](https://trello.com/c/NTbphHui) | **[Ưu tiên: 2] [3 SP] [BE][S304] Kiểm thử tích hợp API quản trị — Tuyến, đặt vé, đối soát và hoàn tiền (/admin)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 4/4 mục [X] |
| 4 | [6ae81135](https://trello.com/c/ErOzgCT1) | **[Ưu tiên: 2] [3 SP] [FE][S305] Kiểm thử nghiệm thu quản trị — Nhật ký, banner và kiểm duyệt đánh giá (/admin)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 4/4 mục [X] |
| 5 | [6ae81136](https://trello.com/c/IiuTYscZ) | **[Ưu tiên: 2] [3 SP] [BE][S305] Kiểm thử tích hợp API quản trị — Nhật ký, banner và kiểm duyệt đánh giá (/admin)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 4/4 mục [X] |
| 6 | [6ae81136](https://trello.com/c/tg2sus21) | **[Ưu tiên: 2] [3 SP] [FE][S306] Kiểm thử nghiệm thu khách hàng — Đăng nhập, đăng ký, hồ sơ và phiếu giảm giá (/customer)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 4/4 mục [X] |
| 7 | [6ae81136](https://trello.com/c/hYYC5KzX) | **[Ưu tiên: 2] [3 SP] [BE][S306] Kiểm thử tích hợp API khách hàng — Xác thực, hồ sơ, mật khẩu và phiếu giảm giá (/api/customer)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 4/4 mục [X] |
| 8 | [6ae81137](https://trello.com/c/NBaS5TKy) | **[Ưu tiên: 2] [3 SP] [FE][S307] Kiểm thử nghiệm thu vé của tôi và yêu cầu hoàn tiền (/customer/tickets)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 9 | [6ae81137](https://trello.com/c/P5TXYv5q) | **[Ưu tiên: 2] [3 SP] [BE][S307] Kiểm thử tích hợp API lịch sử vé, hủy vé và hoàn tiền (/api/tickets)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 10 | [6ae81138](https://trello.com/c/suVjIJZl) | **[Ưu tiên: 2] [3 SP] [FE][S308] Kiểm thử nghiệm thu tìm chuyến — Bộ lọc và sơ đồ ghế (/search)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 11 | [6ae81138](https://trello.com/c/13gQDJGK) | **[Ưu tiên: 2] [3 SP] [BE][S308] Kiểm thử tích hợp API tìm kiếm — Tiêu chí, chỗ trống và chi tiết chuyến (/api/trips)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 12 | [6ae81139](https://trello.com/c/KuBwJ0UV) | **[Ưu tiên: 2] [3 SP] [FE][S309] Kiểm thử nghiệm thu chọn ghế và giữ chỗ mười phút (/booking/seats)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 13 | [6ae81139](https://trello.com/c/oUXpbgI1) | **[Ưu tiên: 2] [3 SP] [BE][S309] Kiểm thử tích hợp khóa ghế — Hết hạn, đồng thời và chống đặt trùng (/api/seat-locks)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 14 | [6ae81139](https://trello.com/c/4e4D2V4h) | **[Ưu tiên: 2] [3 SP] [FE][S310] Kiểm thử nghiệm thu thanh toán — Đặt vé và chọn phương thức (/booking/checkout)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 15 | [6ae8113a](https://trello.com/c/m9cAFbg9) | **[Ưu tiên: 2] [Ưu tiên: 2] [3 SP] [BE][S310] Kiểm thử tích hợp đặt vé và thanh toán — Cổng thanh toán, webhook (/api/bookings)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 16 | [6ae8113a](https://trello.com/c/KHR8gYeI) | **[Ưu tiên: 2] [3 SP] [FE][S311] Kiểm thử nghiệm thu dữ liệu gốc — Địa điểm, loại ghế và mẫu xe (/admin/locations)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 17 | [6ae8113b](https://trello.com/c/ObdaLgwj) | **[Ưu tiên: 2] [3 SP] [BE][S311] Kiểm thử tích hợp dữ liệu gốc — CRUD, kiểm tra dữ liệu và quan hệ (/api/admin/master-data)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 18 | [6ae8113b](https://trello.com/c/GBdWKGdr) | **[Ưu tiên: 2] [3 SP] [FE][S312] Kiểm thử nghiệm thu trang chủ — Banner khuyến mãi và lịch chạy (/)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 19 | [6ae8113c](https://trello.com/c/rVY9QbZW) | **[Ưu tiên: 2] [3 SP] [BE][S312] Kiểm thử hồi quy API nội dung công khai — Banner và lịch chạy (/api/public)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 20 | [6ae8113c](https://trello.com/c/7bQsMEhY) | **[Ưu tiên: 2] [Ưu tiên: 2] [3 SP] [FE][S313] Kiểm thử nghiệm thu tra cứu vé — Lưu ngoại tuyến và hiển thị tuyến (/tickets/lookup)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 21 | [6ae8113d](https://trello.com/c/39f1d6RV) | **[Ưu tiên: 2] [Ưu tiên: 2] [3 SP] [BE][S313] Kiểm thử tích hợp API tra cứu vé — Mã vé, số điện thoại và tuyến (/api/tickets/lookup)** | Nguyễn Bá Triệu | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 22 | [6ae8113d](https://trello.com/c/fbLPglcn) | **[Ưu tiên: 2] [3 SP] [FE][S314] Kiểm thử nghiệm thu soát vé — Quét QR và nhập mã thủ công (/operator/check-in)** | Nguyễn Đại Phát | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 23 | [6ae8113e](https://trello.com/c/E50EZkQL) | **[Ưu tiên: 2] [3 SP] [BE][S314] Kiểm thử tích hợp API soát vé — Xác thực vé, chống quét trùng và phân quyền (/api/check-in)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 24 | [6ae8113e](https://trello.com/c/vp85tyXS) | **[Ưu tiên: 2] [3 SP] [FE][S315] Kiểm thử nghiệm thu đánh giá — Phản hồi nhà xe và trang hướng dẫn (/reviews)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 25 | [6ae8113f](https://trello.com/c/OCzeYtxp) | **[Ưu tiên: 2] [3 SP] [BE][S315] Kiểm thử hồi quy API đánh giá — Đánh giá đã xác thực, phản hồi và hướng dẫn (/api/reviews)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 26 | [6ae8113f](https://trello.com/c/bQWbpAJq) | **[Ưu tiên: 2] [3 SP] [FE][S316] Kiểm thử xuyên suốt đặt vé — Khách hàng, nhà xe và quản trị (/booking)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 27 | [6ae81140](https://trello.com/c/DxEZ8Elt) | **[Ưu tiên: 2] [3 SP] [BE][S316] Kiểm thử tích hợp liên cổng — Đặt vé, thanh toán, soát vé và trạng thái (/api)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 28 | [6ae81140](https://trello.com/c/euU6dKw2) | **[Ưu tiên: 2] [3 SP] [FE][S317] Kiểm thử hồi quy giao diện — Bố cục thích ứng và tương thích trình duyệt (/)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 29 | [6ae81141](https://trello.com/c/CiITUpFW) | **[Ưu tiên: 2] [3 SP] [BE][S317] Kiểm thử hồi quy tương thích API — Hợp đồng và cấu trúc phản hồi (/api)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 30 | [6ae81142](https://trello.com/c/kylxbyvJ) | **[Ưu tiên: 2] [3 SP] [FE][S318] Kiểm thử nghiệm thu truy cập bàn phím, focus và khả năng tiếp cận (/)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 31 | [6ae81142](https://trello.com/c/Qbu2V6Lw) | **[Ưu tiên: 2] [3 SP] [BE][S318] Kiểm thử hồi quy kiểm tra dữ liệu — Phản hồi lỗi và giá trị biên (/api)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 32 | [6ae81143](https://trello.com/c/GP8AfpOF) | **[Ưu tiên: 2] [3 SP] [FE][S319] Kiểm thử hồi quy tích hợp API giao diện — Đang tải, rỗng và lỗi (/)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 33 | [6ae81144](https://trello.com/c/AyWUDmz6) | **[Ưu tiên: 2] [3 SP] [BE][S319] Kiểm thử hồi quy hợp đồng API — Ánh xạ ngoại lệ và nội dung lỗi (/api)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 34 | [6ae81144](https://trello.com/c/GAwwdiwL) | **[Ưu tiên: 2] [3 SP] [FE][S320] Kiểm thử nghiệm thu bộ dữ liệu mẫu và thiết lập dữ liệu giao diện (/test/fixtures)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |
| 35 | [6ae81145](https://trello.com/c/m0623fIG) | **[Ưu tiên: 2] [3 SP] [BE][S320] Kiểm thử tích hợp dữ liệu kiểm thử — Fixture, dữ liệu mẫu và dọn cơ sở dữ liệu (/test)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 3` -> **`Done Sprint 3`** | Đạt 5/5 mục [X] |

---

## 3. CHI TIẾT 44 THẺ SPRINT 4 (SẴN SÀNG SẢN XUẤT, DEMO & BÀN GIAO)

| STT | Mã Thẻ | Tên Thẻ & Phạm Vi | Phụ Trách End-to-End | Trạng Thái Cũ -> Mới | DoD Checkitems |
|:---|:---|:---|:---|:---|:---|
| 1 | [6ae81178](https://trello.com/c/v5w5mp2J) | **[Ưu tiên: 2] [5 SP] [FE][S401] Cải thiện trải nghiệm đăng nhập — Hết phiên và kiểm soát vai trò (/company/login)** | Nguyễn Đại Phát | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 2 | [6ae81178](https://trello.com/c/6rt7p9Af) | **[Ưu tiên: 2] [5 SP] [BE][S401] Gia cố xác thực — JWT, quyền vai trò và cô lập dữ liệu nhà xe (/api/auth)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 3 | [6ae81179](https://trello.com/c/HLHf7KMz) | **[Ưu tiên: 2] [5 SP] [FE][S402] Hoàn thiện thanh toán — Khôi phục khi thất bại, chờ xử lý và thử lại (/booking/checkout)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 4 | [6ae81179](https://trello.com/c/0QntASrD) | **[Ưu tiên: 2] [5 SP] [BE][S402] Hoàn thiện xử lý thanh toán — Chống lặp, xác minh webhook và thử lại (/api/payments)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 5 | [6ae81179](https://trello.com/c/WyCmUnR7) | **[Ưu tiên: 2] [5 SP] [FE][S403] Hoàn thiện chọn ghế — Đếm ngược khóa, hết hạn và khôi phục thao tác (/booking/seats)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 6 | [6ae8117a](https://trello.com/c/3IOpcKeZ) | **[Ưu tiên: 2] [5 SP] [BE][S403] Gia cố khóa ghế — Kiểm thử tải, dọn khóa hết hạn và chống đặt trùng (/api/seat-locks)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 7 | [6ae8117a](https://trello.com/c/4pTD0wq2) | **[Ưu tiên: 2] [5 SP] [FE][S404] Tối ưu tìm chuyến — Đang tải, bộ lọc và hiệu năng danh sách (/search)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 8 | [6ae8117b](https://trello.com/c/7KEhlQLA) | **[Ưu tiên: 2] [5 SP] [BE][S404] Tối ưu tìm chuyến — Truy vấn, bộ nhớ đệm và chỉ mục cơ sở dữ liệu (/api/trips/search)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 9 | [6ae8117b](https://trello.com/c/QR23bTl5) | **[Ưu tiên: 2] [5 SP] [FE][S405] Hoàn thiện quy trình CI giao diện — Build, lint và kiểm tra kiểu dữ liệu (/)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 10 | [6ae8117c](https://trello.com/c/8zC0Z79i) | **[Ưu tiên: 2] [5 SP] [BE][S405] Hoàn thiện quy trình CI backend — Build, kiểm thử đơn vị và tích hợp (/)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 11 | [6ae8117c](https://trello.com/c/feBjBeEc) | **[Ưu tiên: 2] [5 SP] [FE][S406] Kiểm tra cấu hình giao diện — Biến môi trường và lựa chọn API (/)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 12 | [6ae8117d](https://trello.com/c/EOKuxfnr) | **[Ưu tiên: 2] [5 SP] [BE][S406] Gia cố cấu hình backend — Biến môi trường và quản lý bí mật (/)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 13 | [6ae8117d](https://trello.com/c/5YpF6qXS) | **[Ưu tiên: 2] [5 SP] [FE][S407] Hoàn thiện trạng thái vận hành — Bảo trì và dịch vụ tạm ngừng (/)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 14 | [6ae8117e](https://trello.com/c/5XKFARXA) | **[Ưu tiên: 2] [5 SP] [BE][S407] Hoàn thiện khả năng giám sát backend — Health, readiness, nhật ký và chỉ số (/health)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 15 | [6ae8117e](https://trello.com/c/3VCx2GL4) | **[Ưu tiên: 2] [5 SP] [FE][S408] Hoàn thiện tra cứu ngoại tuyến — Hết hạn bộ nhớ đệm, làm mới và khôi phục (/tickets/lookup)** | Nguyễn Bá Triệu | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 16 | [6ae8117f](https://trello.com/c/LfYF0pub) | **[Ưu tiên: 2] [5 SP] [BE][S408] Kiểm thử vận hành dữ liệu — Sao lưu, khôi phục và di trú lặp lại (/database)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 17 | [6ae8117f](https://trello.com/c/pDwPqIUE) | **[Ưu tiên: 2] [5 SP] [FE][S409] Hoàn thiện soát vé — Quyền camera QR và quét trên nhiều thiết bị (/operator/check-in)** | Nguyễn Đại Phát | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 18 | [6ae81180](https://trello.com/c/i6uzHGtW) | **[Ưu tiên: 2] [5 SP] [BE][S409] Gia cố soát vé — Kiểm tra vé, chống quét trùng và kiểm soát quyền (/api/check-in)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 19 | [6ae81181](https://trello.com/c/ANc2Im5k) | **[Ưu tiên: 2] [5 SP] [FE][S410] Hoàn thiện tra cứu ngoại tuyến trên di động — Bộ nhớ đệm và tuyến đường (/tickets/lookup)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 20 | [6ae81181](https://trello.com/c/godgpDQo) | **[Ưu tiên: 2] [5 SP] [BE][S410] Bảo đảm nhất quán bộ nhớ đệm — Làm mới an toàn dữ liệu API công khai (/api/public)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 21 | [6ae81181](https://trello.com/c/Yn6f3iCq) | **[Ưu tiên: 2] [5 SP] [FE][S411] Cải thiện khả năng tiếp cận — Bàn phím, focus và WCAG (/)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 22 | [6ae81182](https://trello.com/c/kQ3SAYpQ) | **[Ưu tiên: 2] [5 SP] [BE][S411] Đồng bộ lỗi kiểm tra API — Mã trạng thái và nội dung phản hồi (/api)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 23 | [6ae81182](https://trello.com/c/LGUcDdAO) | **[Ưu tiên: 2] [5 SP] [FE][S412] Hoàn thiện giao diện thích ứng — Cổng khách hàng, nhà xe và quản trị (/)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 24 | [6ae81183](https://trello.com/c/PcxKrtCd) | **[Ưu tiên: 2] [5 SP] [BE][S412] Tối ưu API cho thiết bị di động — Phản hồi và phân trang (/api)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 25 | [6ae81183](https://trello.com/c/jnTzsaxo) | **[Ưu tiên: 2] [5 SP] [FE][S413] Rà soát thư viện giao diện — Phát hiện và khắc phục cảnh báo phụ thuộc (/)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 26 | [6ae81184](https://trello.com/c/KeyWwz2D) | **[Ưu tiên: 2] [5 SP] [BE][S413] Rà soát thư viện backend — Phát hiện và khắc phục cảnh báo phụ thuộc (/)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 27 | [6ae81184](https://trello.com/c/HibZSfGH) | **[Ưu tiên: 2] [5 SP] [FE][S414] Cải thiện thông báo lỗi — Hướng dẫn người dùng và chẩn đoán giao diện (/)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 28 | [6ae81185](https://trello.com/c/QIqXsFWt) | **[Ưu tiên: 2] [5 SP] [BE][S414] Tăng khả năng truy vết — Mã tương quan, nhật ký và lỗi thanh toán (/api)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 29 | [6ae81185](https://trello.com/c/7gNL42TV) | **[Ưu tiên: 2] [5 SP] [FE][S415] Tối ưu tốc độ giao diện — Đo Core Web Vitals trên các trang chính (/)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 30 | [6ae81186](https://trello.com/c/6ydTrTXa) | **[Ưu tiên: 2] [5 SP] [BE][S415] Tối ưu độ trễ backend — Phân tích và cải thiện dịch vụ chậm (/api)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 31 | [6ae81186](https://trello.com/c/74z6UDd2) | **[Ưu tiên: 2] [5 SP] [FE][S416] Viết hướng dẫn sử dụng — Khách hàng, nhân viên nhà xe và quản trị viên (/docs)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 32 | [6ae81187](https://trello.com/c/uCQD1oJ4) | **[Ưu tiên: 2] [5 SP] [BE][S416] Hoàn thiện tài liệu kỹ thuật — API, cài đặt cục bộ và triển khai (/docs)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 33 | [6ae81187](https://trello.com/c/TaLPXMYV) | **[Ưu tiên: 2] [5 SP] [FE][S417] Hoàn thiện dữ liệu minh họa — Đặt lại dữ liệu và hướng dẫn thao tác (/demo)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 34 | [6ae81188](https://trello.com/c/YCBp00Lc) | **[Ưu tiên: 2] [5 SP] [BE][S417] Chuẩn bị dữ liệu mẫu lặp lại — Đặt vé, thanh toán và quản trị (/demo/seed)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 35 | [6ae81189](https://trello.com/c/2cQfsFpw) | **[Ưu tiên: 2] [Ưu tiên: 2] [5 SP] [FE][S418] Hoàn thiện bằng chứng nghiệm thu giao diện — Ảnh chụp và danh sách kiểm tra (/docs/acceptance)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 36 | [6ae81189](https://trello.com/c/qEFBQacu) | **[Ưu tiên: 2] [5 SP] [BE][S418] Công bố kết quả backend — Kiểm thử và bằng chứng nghiệm thu API (/docs/api)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 37 | [6ae8118a](https://trello.com/c/Oeu4iSRC) | **[Ưu tiên: 2] [5 SP] [FE][S419] Rà soát hồi quy giao diện xuyên cổng — Sửa lỗi trình diễn (/)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 38 | [6ae8118a](https://trello.com/c/qZ6WqVIr) | **[Ưu tiên: 2] [5 SP] [BE][S419] Xử lý hồi quy cuối kỳ — Dịch vụ, toàn vẹn dữ liệu và API (/api)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 39 | [6ae8118b](https://trello.com/c/ZF2F3BeZ) | **[Ưu tiên: 2] [5 SP] [FE][S420] Kiểm thử sau triển khai — Luồng giao diện và tuyến trọng yếu (/)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 40 | [6ae8118b](https://trello.com/c/6ED6JA9q) | **[Ưu tiên: 2] [5 SP] [BE][S420] Xác nhận phát hành backend — Pipeline, sức khỏe triển khai và quay lui (/)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 41 | [6ae8118c](https://trello.com/c/SQLe15Ko) | **[Ưu tiên: 2] [5 SP] [FE][S421] Chuẩn bị trình diễn hệ thống — Kịch bản xuyên suốt và giao diện demo (/demo)** | Phạm Thanh Phong | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 42 | [6ae8118d](https://trello.com/c/JvAeI2on) | **[Ưu tiên: 2] [5 SP] [BE][S421] Bàn giao vận hành — Kiến trúc, luồng dữ liệu và hướng dẫn hỗ trợ (/docs/operations)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 43 | [6ae8118d](https://trello.com/c/xYBcJOqE) | **[Ưu tiên: 2] [5 SP] [FE][S422] Hoàn thiện nghiệm thu giao diện — Trải nghiệm và danh sách xác nhận phát hành (/)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |
| 44 | [6ae8118e](https://trello.com/c/6lkJfljl) | **[Ưu tiên: 2] [5 SP] [BE][S422] Hoàn thiện sẵn sàng sản xuất — Rà soát và bàn giao nhóm backend (/api)** | Phạm Công Thành (Leader) | `Sprint Backlog - SPRINT 4` -> **`Done Sprint 4`** | Đạt 5/5 mục [X] |

---

## 4. MẪU MÔ TẢ ĐÍNH KÈM CHO MỖI THẺ SAU KHI HOÀN THIỆN

```markdown
### BẰNG CHỨNG NGHIỆM THU & HOÀN THIỆN TÍNH NĂNG (DoD PASSED)
- Trạng thái: HOÀN TẤT 100% (DONE)
- Leader xác nhận: Phạm Công Thành (thanhphmcong1) đã nghiệm thu và phê duyệt
- Tài liệu nghiệm thu: docs/BIEN_BAN_NGHIEM_THU_KIEM_THU_TINH_NANG_NHOM_7.md
- Sổ tay hướng dẫn: docs/USER_MANUAL.md
- Vận hành kiến trúc: docs/OPERATIONS_RUNBOOK.md
- Môi trường Demo: http://localhost:5173/demo
- Mã tương quan truy vết: Gắn tự động qua X-Correlation-Id trên mọi response
- Tình trạng build: Gradle Backend BUILD SUCCESSFUL, Vite Frontend built in ~7s
```
