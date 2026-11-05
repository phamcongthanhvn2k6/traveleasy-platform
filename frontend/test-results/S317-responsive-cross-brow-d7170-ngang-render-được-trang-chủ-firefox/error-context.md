# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: S317-responsive-cross-browser.spec.ts >> S317 Responsive layout >> [S317-RS] mobile-412x915: không tràn ngang, render được trang chủ
- Location: e2e\S317-responsive-cross-browser.spec.ts:39:5

# Error details

```
Error: Trang bị tràn chiều ngang

expect(received).toBe(expected) // Object.is equality

Expected: false
Received: true
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e8]: MỚI
        - generic [ref=e9]:
          - text: Cam kết hoàn 150% nếu nhà xe không cung cấp dịch vụ vận chuyển (*)
          - img [ref=e10] [cursor=pointer]
      - generic [ref=e14]:
        - link "Cổng Đối Tác Nhà Xe" [ref=e15] [cursor=pointer]:
          - /url: /company/login
        - link "Hợp tác mở bán vé" [ref=e25] [cursor=pointer]:
          - /url: /partner
        - generic [ref=e33] [cursor=pointer]: 🇻🇳 VN
        - link "Hotline 24/7" [ref=e38] [cursor=pointer]:
          - /url: tel:19006868
        - link "Đăng nhập / Đăng ký" [ref=e43] [cursor=pointer]:
          - /url: /auth
    - generic [ref=e47]:
      - link "TravelEasy .vn NỀN TẢNG KẾT NỐI HÀNH KHÁCH VÀ NHÀ XE" [ref=e49] [cursor=pointer]:
        - /url: /
        - generic [ref=e59]:
          - generic [ref=e60]:
            - generic [ref=e61]: TravelEasy
            - generic [ref=e62]: .vn
          - generic [ref=e63]: NỀN TẢNG KẾT NỐI HÀNH KHÁCH VÀ NHÀ XE
      - generic [ref=e64]:
        - button "Toggle Theme" [ref=e65] [cursor=pointer]:
          - generic [ref=e77]: Giao diện Sáng
        - button "Thông báo" [ref=e79] [cursor=pointer]:
          - generic [ref=e83]: "4"
        - button "Mở Menu Điều Hướng" [ref=e84] [cursor=pointer]
  - main [ref=e89]:
    - generic [ref=e90]:
      - generic [ref=e92]:
        - generic [ref=e93]:
          - generic [ref=e94]: THỨ 3 HÀNG TUẦN | 12H - 14H
          - heading "ĐẠI TIỆC FLASH SALE — VÉ RẺ ĐẾN 50%" [level=1] [ref=e101]
          - paragraph [ref=e102]: "*Áp dụng cho mọi tuyến đường nhà xe tham gia chương trình. Cam kết 100% giữ chỗ, chọn vị trí trực tiếp trên sơ đồ xe!"
        - generic [ref=e103]:
          - generic [ref=e104]:
            - generic [ref=e105]: Địa chỉ mới
            - generic [ref=e110]:
              - button "Xe khách" [ref=e111] [cursor=pointer]
              - button "Máy bay -50k" [ref=e120] [cursor=pointer]:
                - text: Máy bay
                - generic [ref=e123]: "-50k"
              - button "Tàu hỏa Vé Tết" [ref=e124] [cursor=pointer]:
                - text: Tàu hỏa
                - generic [ref=e133]: Vé Tết
              - button "Thuê xe Mới" [ref=e134] [cursor=pointer]:
                - text: Thuê xe
                - generic [ref=e140]: Mới
          - generic [ref=e142]:
            - generic [ref=e143]:
              - generic [ref=e144]: Nơi xuất phát
              - combobox [ref=e146] [cursor=pointer]:
                - option "Tất cả điểm xuất phát (Toàn quốc)"
                - option "TP. Hồ Chí Minh" [selected]
                - option "Hà Nội"
                - option "Đà Lạt"
                - option "Nha Trang"
                - option "Đà Nẵng"
                - option "Vũng Tàu"
                - option "Sa Pa"
                - option "Hải Phòng"
                - option "Cần Thơ"
                - option "Huế"
                - option "Quy Nhơn"
                - option "Phan Thiết"
            - button "Đổi chiều xuất phát / điểm đến" [ref=e147] [cursor=pointer]
            - generic [ref=e153]:
              - generic [ref=e154]: Nơi đến
              - combobox [ref=e156] [cursor=pointer]:
                - option "Tất cả điểm đến (Toàn quốc)"
                - option "TP. Hồ Chí Minh"
                - option "Hà Nội"
                - option "Đà Lạt" [selected]
                - option "Nha Trang"
                - option "Đà Nẵng"
                - option "Vũng Tàu"
                - option "Sa Pa"
                - option "Hải Phòng"
                - option "Cần Thơ"
                - option "Huế"
                - option "Quy Nhơn"
                - option "Phan Thiết"
            - generic [ref=e157]:
              - generic [ref=e158]: Ngày đi
              - textbox [ref=e164] [cursor=pointer]: 2026-11-05
            - button "Thêm ngày về" [ref=e165] [cursor=pointer]
            - button "Tìm kiếm" [ref=e169] [cursor=pointer]
      - generic [ref=e174]:
        - generic [ref=e175]: Chắc chắn có chỗ
        - generic [ref=e180]: Hỗ trợ 24/7
        - generic [ref=e185]: Nhiều ưu đãi
        - generic [ref=e192]: Thanh toán đa dạng
      - generic [ref=e198]:
        - generic [ref=e199]:
          - generic [ref=e200]:
            - generic [ref=e201]: ĐIỂM ĐẾN ĐƯỢC YÊU THÍCH NHẤT 2026
            - heading "Tuyến đường phổ biến" [level=2] [ref=e205]
            - paragraph [ref=e206]: Đặt vé sớm các tuyến trọng điểm, cam kết 100% giữ chỗ, không tăng giá ngày Lễ/Tết
          - generic [ref=e207]:
            - button "Xem các tuyến trước" [ref=e208] [cursor=pointer]
            - button "Xem các tuyến tiếp theo" [ref=e211] [cursor=pointer]
        - generic [ref=e214]:
          - button "Tất cả tuyến hot" [ref=e215] [cursor=pointer]
          - button "Từ TP. Hồ Chí Minh" [ref=e223] [cursor=pointer]
          - button "Từ Hà Nội" [ref=e228] [cursor=pointer]
          - button "Miền Trung & Tây Nguyên" [ref=e233] [cursor=pointer]
          - button "Miền Tây Sông Nước" [ref=e238] [cursor=pointer]
        - generic [ref=e248]:
          - generic [ref=e249] [cursor=pointer]:
            - generic [ref=e250]:
              - img "TP. Hồ Chí Minh - Đà Lạt" [ref=e251]
              - generic [ref=e253]: GIẢM 15%
              - generic [ref=e257]: Limousine Phòng Riêng VIP
              - generic [ref=e258]: ~6.5h • 305 km
              - generic [ref=e263]: "4.8"
            - generic [ref=e267]:
              - generic [ref=e268]:
                - generic [ref=e269]:
                  - generic [ref=e270]: TP. Hồ Chí Minh
                  - generic [ref=e274]: Đà Lạt
                - paragraph [ref=e275]:
                  - generic [ref=e284]: 48 chuyến xe xuất bến mỗi ngày
              - generic [ref=e285]:
                - generic [ref=e286]:
                  - generic [ref=e287]: Giá vé từ
                  - generic [ref=e288]:
                    - generic [ref=e289]: 390,000đ
                    - generic [ref=e290]: 448,500đ
                - button "Chọn chuyến" [ref=e291]
          - generic [ref=e296] [cursor=pointer]:
            - generic [ref=e297]:
              - img "TP. Hồ Chí Minh - Nha Trang" [ref=e298]
              - generic [ref=e300]: GIẢM 15%
              - generic [ref=e304]: Limousine VIP 22 Phòng
              - generic [ref=e305]: ~8h • 435 km
              - generic [ref=e310]: "4.8"
            - generic [ref=e314]:
              - generic [ref=e315]:
                - generic [ref=e316]:
                  - generic [ref=e317]: TP. Hồ Chí Minh
                  - generic [ref=e321]: Nha Trang
                - paragraph [ref=e322]:
                  - generic [ref=e331]: 32 chuyến xe xuất bến mỗi ngày
              - generic [ref=e332]:
                - generic [ref=e333]:
                  - generic [ref=e334]: Giá vé từ
                  - generic [ref=e335]:
                    - generic [ref=e336]: 320,000đ
                    - generic [ref=e337]: 368,000đ
                - button "Chọn chuyến" [ref=e338]
          - generic [ref=e343] [cursor=pointer]:
            - generic [ref=e344]:
              - img "TP. Hồ Chí Minh - Cần Thơ" [ref=e345]
              - generic [ref=e347]: GIẢM 15%
              - generic [ref=e351]: Giường Nằm Cao Cấp
              - generic [ref=e352]: ~3.5h • 169 km
              - generic [ref=e357]: "4.8"
            - generic [ref=e361]:
              - generic [ref=e362]:
                - generic [ref=e363]:
                  - generic [ref=e364]: TP. Hồ Chí Minh
                  - generic [ref=e368]: Cần Thơ
                - paragraph [ref=e369]:
                  - generic [ref=e378]: 40 chuyến xe xuất bến mỗi ngày
              - generic [ref=e379]:
                - generic [ref=e380]:
                  - generic [ref=e381]: Giá vé từ
                  - generic [ref=e382]:
                    - generic [ref=e383]: 199,000đ
                    - generic [ref=e384]: 228,850đ
                - button "Chọn chuyến" [ref=e385]
          - generic [ref=e390] [cursor=pointer]:
            - generic [ref=e391]:
              - img "Hà Nội - Sa Pa" [ref=e392]
              - generic [ref=e394]: GIẢM 15%
              - generic [ref=e398]: Cabin Đôi Cung Điện
              - generic [ref=e399]: ~5.5h • 315 km
              - generic [ref=e404]: "4.8"
            - generic [ref=e408]:
              - generic [ref=e409]:
                - generic [ref=e410]:
                  - generic [ref=e411]: Hà Nội
                  - generic [ref=e415]: Sa Pa
                - paragraph [ref=e416]:
                  - generic [ref=e425]: 36 chuyến xe xuất bến mỗi ngày
              - generic [ref=e426]:
                - generic [ref=e427]:
                  - generic [ref=e428]: Giá vé từ
                  - generic [ref=e429]:
                    - generic [ref=e430]: 450,000đ
                    - generic [ref=e431]: 517,500đ
                - button "Chọn chuyến" [ref=e432]
          - generic [ref=e437] [cursor=pointer]:
            - generic [ref=e438]:
              - img "TP. Hồ Chí Minh - Vũng Tàu" [ref=e439]
              - generic [ref=e441]: GIẢM 15%
              - generic [ref=e445]: Limousine Ghế Massage VIP
              - generic [ref=e446]: ~2h • 105 km
              - generic [ref=e451]: "4.8"
            - generic [ref=e455]:
              - generic [ref=e456]:
                - generic [ref=e457]:
                  - generic [ref=e458]: TP. Hồ Chí Minh
                  - generic [ref=e462]: Vũng Tàu
                - paragraph [ref=e463]:
                  - generic [ref=e472]: 60 chuyến xe xuất bến mỗi ngày
              - generic [ref=e473]:
                - generic [ref=e474]:
                  - generic [ref=e475]: Giá vé từ
                  - generic [ref=e476]:
                    - generic [ref=e477]: 199,000đ
                    - generic [ref=e478]: 228,850đ
                - button "Chọn chuyến" [ref=e479]
          - generic [ref=e484] [cursor=pointer]:
            - generic [ref=e485]:
              - img "Vũng Tàu - TP. Hồ Chí Minh" [ref=e486]
              - generic [ref=e488]: GIẢM 15%
              - generic [ref=e492]: Limousine VIP 34 Phòng
              - generic [ref=e493]: ~2h • 105 km
              - generic [ref=e498]: "4.8"
            - generic [ref=e502]:
              - generic [ref=e503]:
                - generic [ref=e504]:
                  - generic [ref=e505]: Vũng Tàu
                  - generic [ref=e509]: TP. Hồ Chí Minh
                - paragraph [ref=e510]:
                  - generic [ref=e519]: 24 chuyến xe xuất bến mỗi ngày
              - generic [ref=e520]:
                - generic [ref=e521]:
                  - generic [ref=e522]: Giá vé từ
                  - generic [ref=e523]:
                    - generic [ref=e524]: 199,000đ
                    - generic [ref=e525]: 228,850đ
                - button "Chọn chuyến" [ref=e526]
          - generic [ref=e531] [cursor=pointer]:
            - generic [ref=e532]:
              - img "TP. Hồ Chí Minh - Phan Thiết" [ref=e533]
              - generic [ref=e535]: GIẢM 15%
              - generic [ref=e539]: Limousine VIP 34 Phòng
              - generic [ref=e540]: ~4h • 215 km
              - generic [ref=e545]: "4.8"
            - generic [ref=e549]:
              - generic [ref=e550]:
                - generic [ref=e551]:
                  - generic [ref=e552]: TP. Hồ Chí Minh
                  - generic [ref=e556]: Phan Thiết
                - paragraph [ref=e557]:
                  - generic [ref=e566]: 28 chuyến xe xuất bến mỗi ngày
              - generic [ref=e567]:
                - generic [ref=e568]:
                  - generic [ref=e569]: Giá vé từ
                  - generic [ref=e570]:
                    - generic [ref=e571]: 199,000đ
                    - generic [ref=e572]: 228,850đ
                - button "Chọn chuyến" [ref=e573]
          - generic [ref=e578] [cursor=pointer]:
            - generic [ref=e579]:
              - img "TP. Hồ Chí Minh - Buôn Ma Thuột" [ref=e580]
              - generic [ref=e582]: GIẢM 15%
              - generic [ref=e586]: Limousine Cung Điện Đôi
              - generic [ref=e587]: ~7.5h • 350 km
              - generic [ref=e592]: "4.8"
            - generic [ref=e596]:
              - generic [ref=e597]:
                - generic [ref=e598]:
                  - generic [ref=e599]: TP. Hồ Chí Minh
                  - generic [ref=e603]: Buôn Ma Thuột
                - paragraph [ref=e604]:
                  - generic [ref=e613]: 22 chuyến xe xuất bến mỗi ngày
              - generic [ref=e614]:
                - generic [ref=e615]:
                  - generic [ref=e616]: Giá vé từ
                  - generic [ref=e617]:
                    - generic [ref=e618]: 199,000đ
                    - generic [ref=e619]: 228,850đ
                - button "Chọn chuyến" [ref=e620]
          - generic [ref=e625] [cursor=pointer]:
            - generic [ref=e626]:
              - img "Hà Nội - Hải Phòng" [ref=e627]
              - generic [ref=e629]: GIẢM 15%
              - generic [ref=e633]: Limousine VIP 9 Chỗ
              - generic [ref=e634]: ~1.5h • 120 km
              - generic [ref=e639]: "4.8"
            - generic [ref=e643]:
              - generic [ref=e644]:
                - generic [ref=e645]:
                  - generic [ref=e646]: Hà Nội
                  - generic [ref=e650]: Hải Phòng
                - paragraph [ref=e651]:
                  - generic [ref=e660]: 35 chuyến xe xuất bến mỗi ngày
              - generic [ref=e661]:
                - generic [ref=e662]:
                  - generic [ref=e663]: Giá vé từ
                  - generic [ref=e664]:
                    - generic [ref=e665]: 199,000đ
                    - generic [ref=e666]: 228,850đ
                - button "Chọn chuyến" [ref=e667]
          - generic [ref=e672] [cursor=pointer]:
            - generic [ref=e673]:
              - img "Hà Nội - Hạ Long" [ref=e674]
              - generic [ref=e676]: GIẢM 15%
              - generic [ref=e680]: Limousine VIP 9 Chỗ
              - generic [ref=e681]: ~2.5h • 155 km
              - generic [ref=e686]: "4.8"
            - generic [ref=e690]:
              - generic [ref=e691]:
                - generic [ref=e692]:
                  - generic [ref=e693]: Hà Nội
                  - generic [ref=e697]: Hạ Long
                - paragraph [ref=e698]:
                  - generic [ref=e707]: 35 chuyến xe xuất bến mỗi ngày
              - generic [ref=e708]:
                - generic [ref=e709]:
                  - generic [ref=e710]: Giá vé từ
                  - generic [ref=e711]:
                    - generic [ref=e712]: 199,000đ
                    - generic [ref=e713]: 228,850đ
                - button "Chọn chuyến" [ref=e714]
          - generic [ref=e719] [cursor=pointer]:
            - generic [ref=e720]:
              - img "Hà Nội - Vinh" [ref=e721]
              - generic [ref=e723]: GIẢM 15%
              - generic [ref=e727]: Limousine VIP 34 Phòng
              - generic [ref=e728]: ~5.5h • 300 km
              - generic [ref=e733]: "4.8"
            - generic [ref=e737]:
              - generic [ref=e738]:
                - generic [ref=e739]:
                  - generic [ref=e740]: Hà Nội
                  - generic [ref=e744]: Vinh
                - paragraph [ref=e745]:
                  - generic [ref=e754]: 24 chuyến xe xuất bến mỗi ngày
              - generic [ref=e755]:
                - generic [ref=e756]:
                  - generic [ref=e757]: Giá vé từ
                  - generic [ref=e758]:
                    - generic [ref=e759]: 199,000đ
                    - generic [ref=e760]: 228,850đ
                - button "Chọn chuyến" [ref=e761]
          - generic [ref=e766] [cursor=pointer]:
            - generic [ref=e767]:
              - img "Hà Nội - Hà Giang" [ref=e768]
              - generic [ref=e770]: GIẢM 15%
              - generic [ref=e774]: Limousine VIP 34 Phòng
              - generic [ref=e775]: ~6h • 320 km
              - generic [ref=e780]: "4.8"
            - generic [ref=e784]:
              - generic [ref=e785]:
                - generic [ref=e786]:
                  - generic [ref=e787]: Hà Nội
                  - generic [ref=e791]: Hà Giang
                - paragraph [ref=e792]:
                  - generic [ref=e801]: 24 chuyến xe xuất bến mỗi ngày
              - generic [ref=e802]:
                - generic [ref=e803]:
                  - generic [ref=e804]: Giá vé từ
                  - generic [ref=e805]:
                    - generic [ref=e806]: 199,000đ
                    - generic [ref=e807]: 228,850đ
                - button "Chọn chuyến" [ref=e808]
          - generic [ref=e813] [cursor=pointer]:
            - generic [ref=e814]:
              - img "Đà Nẵng - Huế" [ref=e815]
              - generic [ref=e817]: GIẢM 15%
              - generic [ref=e821]: Limousine VIP 24 Phòng
              - generic [ref=e822]: ~2.5h • 100 km
              - generic [ref=e827]: "4.8"
            - generic [ref=e831]:
              - generic [ref=e832]:
                - generic [ref=e833]:
                  - generic [ref=e834]: Đà Nẵng
                  - generic [ref=e838]: Huế
                - paragraph [ref=e839]:
                  - generic [ref=e848]: 30 chuyến xe xuất bến mỗi ngày
              - generic [ref=e849]:
                - generic [ref=e850]:
                  - generic [ref=e851]: Giá vé từ
                  - generic [ref=e852]:
                    - generic [ref=e853]: 199,000đ
                    - generic [ref=e854]: 228,850đ
                - button "Chọn chuyến" [ref=e855]
          - generic [ref=e860] [cursor=pointer]:
            - generic [ref=e861]:
              - img "Đà Nẵng - Quy Nhơn" [ref=e862]
              - generic [ref=e864]: GIẢM 15%
              - generic [ref=e868]: Limousine Giường Nằm VIP
              - generic [ref=e869]: ~5.5h • 320 km
              - generic [ref=e874]: "4.8"
            - generic [ref=e878]:
              - generic [ref=e879]:
                - generic [ref=e880]:
                  - generic [ref=e881]: Đà Nẵng
                  - generic [ref=e885]: Quy Nhơn
                - paragraph [ref=e886]:
                  - generic [ref=e895]: 20 chuyến xe xuất bến mỗi ngày
              - generic [ref=e896]:
                - generic [ref=e897]:
                  - generic [ref=e898]: Giá vé từ
                  - generic [ref=e899]:
                    - generic [ref=e900]: 199,000đ
                    - generic [ref=e901]: 228,850đ
                - button "Chọn chuyến" [ref=e902]
          - generic [ref=e907] [cursor=pointer]:
            - generic [ref=e908]:
              - img "Đà Lạt - TP. Hồ Chí Minh" [ref=e909]
              - generic [ref=e911]: GIẢM 15%
              - generic [ref=e915]: Limousine VIP 34 Phòng
              - generic [ref=e916]: ~6.5h • 305 km
              - generic [ref=e921]: "4.8"
            - generic [ref=e925]:
              - generic [ref=e926]:
                - generic [ref=e927]:
                  - generic [ref=e928]: Đà Lạt
                  - generic [ref=e932]: TP. Hồ Chí Minh
                - paragraph [ref=e933]:
                  - generic [ref=e942]: 24 chuyến xe xuất bến mỗi ngày
              - generic [ref=e943]:
                - generic [ref=e944]:
                  - generic [ref=e945]: Giá vé từ
                  - generic [ref=e946]:
                    - generic [ref=e947]: 199,000đ
                    - generic [ref=e948]: 228,850đ
                - button "Chọn chuyến" [ref=e949]
          - generic [ref=e954] [cursor=pointer]:
            - generic [ref=e955]:
              - img "Sa Pa - Hà Nội" [ref=e956]
              - generic [ref=e958]: GIẢM 15%
              - generic [ref=e962]: Limousine VIP Giường Nằm
              - generic [ref=e963]: ~5.5h • 315 km
              - generic [ref=e968]: "4.8"
            - generic [ref=e972]:
              - generic [ref=e973]:
                - generic [ref=e974]:
                  - generic [ref=e975]: Sa Pa
                  - generic [ref=e979]: Hà Nội
                - paragraph [ref=e980]:
                  - generic [ref=e989]: 50 chuyến xe xuất bến mỗi ngày
              - generic [ref=e990]:
                - generic [ref=e991]:
                  - generic [ref=e992]: Giá vé từ
                  - generic [ref=e993]:
                    - generic [ref=e994]: 199,000đ
                    - generic [ref=e995]: 228,850đ
                - button "Chọn chuyến" [ref=e996]
          - generic [ref=e1001] [cursor=pointer]:
            - generic [ref=e1002]:
              - img "Nha Trang - TP. Hồ Chí Minh" [ref=e1003]
              - generic [ref=e1005]: GIẢM 15%
              - generic [ref=e1009]: Limousine VIP 34 Phòng
              - generic [ref=e1010]: ~8h • 435 km
              - generic [ref=e1015]: "4.8"
            - generic [ref=e1019]:
              - generic [ref=e1020]:
                - generic [ref=e1021]:
                  - generic [ref=e1022]: Nha Trang
                  - generic [ref=e1026]: TP. Hồ Chí Minh
                - paragraph [ref=e1027]:
                  - generic [ref=e1036]: 24 chuyến xe xuất bến mỗi ngày
              - generic [ref=e1037]:
                - generic [ref=e1038]:
                  - generic [ref=e1039]: Giá vé từ
                  - generic [ref=e1040]:
                    - generic [ref=e1041]: 199,000đ
                    - generic [ref=e1042]: 228,850đ
                - button "Chọn chuyến" [ref=e1043]
          - generic [ref=e1048] [cursor=pointer]:
            - generic [ref=e1049]:
              - img "Cần Thơ - TP. Hồ Chí Minh" [ref=e1050]
              - generic [ref=e1052]: GIẢM 15%
              - generic [ref=e1056]: Limousine VIP 34 Phòng
              - generic [ref=e1057]: ~3.5h • 169 km
              - generic [ref=e1062]: "4.8"
            - generic [ref=e1066]:
              - generic [ref=e1067]:
                - generic [ref=e1068]:
                  - generic [ref=e1069]: Cần Thơ
                  - generic [ref=e1073]: TP. Hồ Chí Minh
                - paragraph [ref=e1074]:
                  - generic [ref=e1083]: 24 chuyến xe xuất bến mỗi ngày
              - generic [ref=e1084]:
                - generic [ref=e1085]:
                  - generic [ref=e1086]: Giá vé từ
                  - generic [ref=e1087]:
                    - generic [ref=e1088]: 199,000đ
                    - generic [ref=e1089]: 228,850đ
                - button "Chọn chuyến" [ref=e1090]
          - generic [ref=e1095] [cursor=pointer]:
            - generic [ref=e1096]:
              - img "Hà Nội - Đà Nẵng" [ref=e1097]
              - generic [ref=e1099]: GIẢM 15%
              - generic [ref=e1103]: Limousine VIP 24 Phòng
              - generic [ref=e1104]: ~13.5h • 780 km
              - generic [ref=e1109]: "4.8"
            - generic [ref=e1113]:
              - generic [ref=e1114]:
                - generic [ref=e1115]:
                  - generic [ref=e1116]: Hà Nội
                  - generic [ref=e1120]: Đà Nẵng
                - paragraph [ref=e1121]:
                  - generic [ref=e1130]: 30 chuyến xe xuất bến mỗi ngày
              - generic [ref=e1131]:
                - generic [ref=e1132]:
                  - generic [ref=e1133]: Giá vé từ
                  - generic [ref=e1134]:
                    - generic [ref=e1135]: 199,000đ
                    - generic [ref=e1136]: 228,850đ
                - button "Chọn chuyến" [ref=e1137]
          - generic [ref=e1142] [cursor=pointer]:
            - generic [ref=e1143]:
              - img "Phan Thiết - TP. Hồ Chí Minh" [ref=e1144]
              - generic [ref=e1146]: GIẢM 15%
              - generic [ref=e1150]: Limousine VIP 34 Phòng
              - generic [ref=e1151]: ~4h • 215 km
              - generic [ref=e1156]: "4.8"
            - generic [ref=e1160]:
              - generic [ref=e1161]:
                - generic [ref=e1162]:
                  - generic [ref=e1163]: Phan Thiết
                  - generic [ref=e1167]: TP. Hồ Chí Minh
                - paragraph [ref=e1168]:
                  - generic [ref=e1177]: 24 chuyến xe xuất bến mỗi ngày
              - generic [ref=e1178]:
                - generic [ref=e1179]:
                  - generic [ref=e1180]: Giá vé từ
                  - generic [ref=e1181]:
                    - generic [ref=e1182]: 220,000đ
                    - generic [ref=e1183]: 253,000đ
                - button "Chọn chuyến" [ref=e1184]
      - generic [ref=e1190]:
        - generic [ref=e1191]:
          - heading "Cam kết dịch vụ vàng từ TravelEasy Platform" [level=3] [ref=e1192]
          - paragraph [ref=e1193]: Nền tảng đặt vé công nghệ hàng đầu Việt Nam bảo vệ 100% quyền lợi hành khách trong mọi chuyến đi
        - generic [ref=e1194]:
          - generic [ref=e1195]:
            - generic [ref=e1196]: CAM KẾT SÀN
            - heading "Cam kết 100% giữ đúng chỗ" [level=4] [ref=e1202]
            - paragraph [ref=e1203]: Đảm bảo có chỗ nằm theo đúng số ghế đã chọn trên sơ đồ. Bồi hoàn 150% nếu nhà xe tự ý đổi chuyến.
          - generic [ref=e1204]:
            - generic [ref=e1205]: CÔNG NGHỆ ĐỘC QUYỀN
            - heading "Khóa giữ chỗ Concurrency" [level=4] [ref=e1210]
            - paragraph [ref=e1211]: Thuật toán khóa độc quyền giữ vé trong 10 phút, không bao giờ xảy ra tình trạng cướp vé hay trùng chỗ.
          - generic [ref=e1212]:
            - generic [ref=e1213]: TIỆN ÍCH DI ĐỘNG
            - heading "Soát vé QR không in giấy" [level=4] [ref=e1229]
            - paragraph [ref=e1230]: Quét camera tại /scanner lên xe trong 0.2s. Hỗ trợ tra cứu và hiển thị vé Offline khi mất mạng Internet.
          - generic [ref=e1231]:
            - generic [ref=e1232]: HOÀN TIỀN NHANH
            - heading "Hủy vé tự động hoàn tiền" [level=4] [ref=e1238]
            - paragraph [ref=e1239]: Chính sách hoàn tiền tự động trực tuyến lên tới 95% giá vé theo quy định mốc giờ minh bạch.
      - generic [ref=e1240]:
        - generic [ref=e1241]:
          - generic [ref=e1242]:
            - heading "Đối tác nhà xe hàng đầu" [level=2] [ref=e1243]
            - paragraph [ref=e1244]: Hợp tác chính thức cùng hơn 50+ thương hiệu vận tải hành khách liên tỉnh uy tín nhất
          - button "Xem tất cả nhà xe" [ref=e1245] [cursor=pointer]
        - generic [ref=e1249]:
          - generic [ref=e1250] [cursor=pointer]:
            - img "Phương Trang (FUTA)" [ref=e1252]
            - heading "Phương Trang (FUTA)" [level=4] [ref=e1253]
            - paragraph [ref=e1254]: 48 tuyến liên tỉnh
            - generic [ref=e1255]: 4.9 • 200+ chuyến/ngày
          - generic [ref=e1259] [cursor=pointer]:
            - img "Thành Bưởi VIP" [ref=e1261]
            - heading "Thành Bưởi VIP" [level=4] [ref=e1262]
            - paragraph [ref=e1263]: Sài Gòn - Đà Lạt - Cần Thơ
            - generic [ref=e1264]: 4.8 • 120+ chuyến/ngày
          - generic [ref=e1268] [cursor=pointer]:
            - img "Hoa Mai Vũng Tàu" [ref=e1270]
            - heading "Hoa Mai Vũng Tàu" [level=4] [ref=e1271]
            - paragraph [ref=e1272]: Sài Gòn - Vũng Tàu VIP
            - generic [ref=e1273]: 4.9 • 150+ chuyến/ngày
          - generic [ref=e1277] [cursor=pointer]:
            - img "Sao Việt Sa Pa" [ref=e1279]
            - heading "Sao Việt Sa Pa" [level=4] [ref=e1280]
            - paragraph [ref=e1281]: Hà Nội - Sa Pa Cabin Đôi
            - generic [ref=e1282]: 4.8 • 80+ chuyến/ngày
          - generic [ref=e1286] [cursor=pointer]:
            - img "Kumho Samco" [ref=e1288]
            - heading "Kumho Samco" [level=4] [ref=e1289]
            - paragraph [ref=e1290]: Miền Đông & Miền Tây
            - generic [ref=e1291]: 4.7 • 90+ chuyến/ngày
          - generic [ref=e1295] [cursor=pointer]:
            - img "Hải Vân Limousine" [ref=e1297]
            - heading "Hải Vân Limousine" [level=4] [ref=e1298]
            - paragraph [ref=e1299]: Tuyến Cao Tốc & Sân Bay
            - generic [ref=e1300]: 4.9 • 65+ chuyến/ngày
      - generic [ref=e1305]:
        - generic [ref=e1306] [cursor=pointer]:
          - generic [ref=e1307]: TIỆN ÍCH HÀNH KHÁCH & TÀI XẾ
          - heading "Máy Quét Mã QR Soát Vé Tức Thì" [level=3] [ref=e1322]
          - paragraph [ref=e1323]: Dùng camera điện thoại hoặc tải ảnh vé để kiểm tra tính hợp lệ và Check-in lên xe trong 0.2s không cần in vé giấy.
          - generic [ref=e1324]: Mở máy quét QR ngay
        - generic [ref=e1329] [cursor=pointer]:
          - generic [ref=e1330]: SPRING AI CHATBOT 24/7
          - heading "Trợ Lý AI Gợi Ý Tuyến Xe & Vị Trí Ghế" [level=3] [ref=e1339]
          - paragraph [ref=e1340]: Tư vấn chọn giường nằm tầng dưới A01-A06 chống say xe, gợi ý lịch trình vi vu Đà Lạt và Sa Pa chuẩn chuyên gia.
          - generic [ref=e1341]: Hỏi Trợ Lý AI
      - generic [ref=e1346]:
        - generic [ref=e1347]:
          - heading "Ưu đãi nổi bật" [level=2] [ref=e1348]
          - paragraph [ref=e1349]: Các chương trình khuyến mãi và mã giảm giá vé xe hot nhất
        - generic [ref=e1350]:
          - generic [ref=e1351] [cursor=pointer]:
            - generic [ref=e1352]:
              - img "Mùa Thu Vàng Săn Mây Sa Pa - Giảm ngay 20% vé Limousine" [ref=e1353]
              - generic [ref=e1354]: HOT DEAL
            - generic [ref=e1355]:
              - heading "Mùa Thu Vàng Săn Mây Sa Pa - Giảm ngay 20% vé Limousine" [level=4] [ref=e1356]
              - generic [ref=e1357]: Xem chi tiết ưu đãi
          - generic [ref=e1361] [cursor=pointer]:
            - generic [ref=e1362]:
              - img "Du Lịch Đà Lạt Mộng Mơ - Trải nghiệm Cung Điện Di Động Thành Bưởi" [ref=e1363]
              - generic [ref=e1364]: HOT DEAL
            - generic [ref=e1365]:
              - heading "Du Lịch Đà Lạt Mộng Mơ - Trải nghiệm Cung Điện Di Động Thành Bưởi" [level=4] [ref=e1366]
              - generic [ref=e1367]: Xem chi tiết ưu đãi
          - generic [ref=e1371] [cursor=pointer]:
            - generic [ref=e1372]:
              - img "Khám Phá Biển Xanh Nha Trang - FUTA Bus Lines đồng hành cùng bạn" [ref=e1373]
              - generic [ref=e1374]: HOT DEAL
            - generic [ref=e1375]:
              - heading "Khám Phá Biển Xanh Nha Trang - FUTA Bus Lines đồng hành cùng bạn" [level=4] [ref=e1376]
              - generic [ref=e1377]: Xem chi tiết ưu đãi
          - generic [ref=e1381] [cursor=pointer]:
            - generic [ref=e1382]:
              - img "Ưu đãi Đặt Vé Xe Tết 2027 - Hoàn tiền 10% qua Cổng PayOS" [ref=e1383]
              - generic [ref=e1384]: HOT DEAL
            - generic [ref=e1385]:
              - heading "Ưu đãi Đặt Vé Xe Tết 2027 - Hoàn tiền 10% qua Cổng PayOS" [level=4] [ref=e1386]
              - generic [ref=e1387]: Xem chi tiết ưu đãi
          - generic [ref=e1391] [cursor=pointer]:
            - generic [ref=e1392]:
              - img "Cung Đường Di Sản Miền Trung - Đà Nẵng, Huế, Hội An trọn gói" [ref=e1393]
              - generic [ref=e1394]: HOT DEAL
            - generic [ref=e1395]:
              - heading "Cung Đường Di Sản Miền Trung - Đà Nẵng, Huế, Hội An trọn gói" [level=4] [ref=e1396]
              - generic [ref=e1397]: Xem chi tiết ưu đãi
          - generic [ref=e1401] [cursor=pointer]:
            - generic [ref=e1402]:
              - img "Hè Sôi Động Vũng Tàu - Đón tận nơi chỉ từ 160.000đ cùng Hoa Mai Limousine" [ref=e1403]
              - generic [ref=e1404]: HOT DEAL
            - generic [ref=e1405]:
              - heading "Hè Sôi Động Vũng Tàu - Đón tận nơi chỉ từ 160.000đ cùng Hoa Mai Limousine" [level=4] [ref=e1406]
              - generic [ref=e1407]: Xem chi tiết ưu đãi
          - generic [ref=e1411] [cursor=pointer]:
            - generic [ref=e1412]:
              - img "Flash Sale Thứ Ba Vui Vẻ - Giảm 50K cho mọi chuyến đi" [ref=e1413]
              - generic [ref=e1414]: HOT DEAL
            - generic [ref=e1415]:
              - heading "Flash Sale Thứ Ba Vui Vẻ - Giảm 50K cho mọi chuyến đi" [level=4] [ref=e1416]
              - generic [ref=e1417]: Xem chi tiết ưu đãi
          - generic [ref=e1421] [cursor=pointer]:
            - generic [ref=e1422]:
              - img "Ưu đãi Khách Mới - Nhập WELCOME50 nhận ngay voucher 50.000đ" [ref=e1423]
              - generic [ref=e1424]: HOT DEAL
            - generic [ref=e1425]:
              - heading "Ưu đãi Khách Mới - Nhập WELCOME50 nhận ngay voucher 50.000đ" [level=4] [ref=e1426]
              - generic [ref=e1427]: Xem chi tiết ưu đãi
          - generic [ref=e1431] [cursor=pointer]:
            - generic [ref=e1432]:
              - img "Đồng hành Mùa Thi & Nhập Học Sinh Viên - Trợ giá vé 15%" [ref=e1433]
              - generic [ref=e1434]: HOT DEAL
            - generic [ref=e1435]:
              - heading "Đồng hành Mùa Thi & Nhập Học Sinh Viên - Trợ giá vé 15%" [level=4] [ref=e1436]
              - generic [ref=e1437]: Xem chi tiết ưu đãi
          - generic [ref=e1441] [cursor=pointer]:
            - generic [ref=e1442]:
              - img "Liên kết Thẻ Ngân Hàng MB Bank - Quét PayOS VietQR giảm ngay 30K" [ref=e1443]
              - generic [ref=e1444]: HOT DEAL
            - generic [ref=e1445]:
              - heading "Liên kết Thẻ Ngân Hàng MB Bank - Quét PayOS VietQR giảm ngay 30K" [level=4] [ref=e1446]
              - generic [ref=e1447]: Xem chi tiết ưu đãi
      - generic [ref=e1451]:
        - generic [ref=e1452]:
          - heading "Du lịch Sapa" [level=2] [ref=e1453]
          - paragraph [ref=e1454]: Cẩm nang khám phá xứ sở sương mù, săn mây Fansipan và trải nghiệm văn hóa Tây Bắc
        - generic [ref=e1455]:
          - generic [ref=e1456] [cursor=pointer]:
            - img "Mệt mỏi tới Sa Pa... Giảm đến 100K khi đặt vé xe phòng VIP cabin đôi" [ref=e1457]
            - generic [ref=e1458]:
              - generic [ref=e1459]:
                - generic [ref=e1460]: Ưu đãi
                - generic [ref=e1461]: 3 ưu đãi
              - paragraph [ref=e1462]: Mệt mỏi tới Sa Pa... Giảm đến 100K khi đặt vé xe phòng VIP cabin đôi
          - generic [ref=e1463] [cursor=pointer]:
            - 'img "Hành trình đưa bạn đến Phố Sương Sa Pa: Top 5 xe Limousine cabin phòng riêng" [ref=e1464]'
            - generic [ref=e1465]:
              - generic [ref=e1466]:
                - generic [ref=e1467]: Phương tiện
                - generic [ref=e1468]: 4 bài viết
              - paragraph [ref=e1469]: "Hành trình đưa bạn đến Phố Sương Sa Pa: Top 5 xe Limousine cabin phòng riêng"
          - generic [ref=e1470] [cursor=pointer]:
            - img "Kinh nghiệm khám phá Sa Pa mùa lúa chín, săn mây nóc nhà Đông Dương Fansipan" [ref=e1471]
            - generic [ref=e1472]:
              - generic [ref=e1473]:
                - generic [ref=e1474]: Kinh nghiệm du lịch
                - generic [ref=e1475]: 8 bài viết
              - paragraph [ref=e1476]: Kinh nghiệm khám phá Sa Pa mùa lúa chín, săn mây nóc nhà Đông Dương Fansipan
      - generic [ref=e1477]:
        - generic [ref=e1478]:
          - heading "Cuộc thi sáng tạo Go with TravelEasy" [level=2] [ref=e1479]
          - paragraph [ref=e1480]: Chia sẻ khoảnh khắc du lịch vi vu cùng TravelEasy và rinh giải thưởng hấp dẫn
        - generic [ref=e1481]:
          - generic [ref=e1482] [cursor=pointer]:
            - img "Nhận thưởng hàng chục triệu đồng khi tham gia \"Go with TravelEasy\"" [ref=e1484]
            - generic [ref=e1485]:
              - text: CUỘC THI HOT
              - heading "Nhận thưởng hàng chục triệu đồng khi tham gia \"Go with TravelEasy\"" [level=4] [ref=e1486]
          - generic [ref=e1487] [cursor=pointer]:
            - img "Gia hạn thời gian nộp bài dự thi Go with TravelEasy đến hết quý 4" [ref=e1489]
            - generic [ref=e1490]:
              - text: THÔNG BÁO
              - heading "Gia hạn thời gian nộp bài dự thi Go with TravelEasy đến hết quý 4" [level=4] [ref=e1491]
          - generic [ref=e1492] [cursor=pointer]:
            - img "Thể lệ cuộc thi sáng tạo nội dung du lịch Go with TravelEasy 2026" [ref=e1494]
            - generic [ref=e1495]:
              - text: HƯỚNG DẪN
              - heading "Thể lệ cuộc thi sáng tạo nội dung du lịch Go with TravelEasy 2026" [level=4] [ref=e1496]
          - generic [ref=e1497] [cursor=pointer]:
            - img "Cơ cấu giải thưởng & Tiêu chí chấm điểm các tác phẩm xuất sắc" [ref=e1499]
            - generic [ref=e1500]:
              - text: GIẢI THƯỞNG
              - heading "Cơ cấu giải thưởng & Tiêu chí chấm điểm các tác phẩm xuất sắc" [level=4] [ref=e1501]
      - generic [ref=e1502]:
        - generic [ref=e1503]:
          - heading "Ưu đãi thanh toán online" [level=2] [ref=e1504]
          - paragraph [ref=e1505]: Tiết kiệm hơn khi thanh toán vé trực tuyến qua ví điện tử và ngân hàng
        - generic [ref=e1506]:
          - generic [ref=e1507] [cursor=pointer]:
            - generic [ref=e1508]:
              - text: ShopeePay
              - heading "Giảm đến 50K khi thanh toán bằng ví ShopeePay" [level=4] [ref=e1509]
            - generic [ref=e1510]:
              - generic [ref=e1511]: Áp dụng ngay khi thanh toán
              - generic [ref=e1512]: GIẢM 50K
          - generic [ref=e1513] [cursor=pointer]:
            - generic [ref=e1514]:
              - text: VNPAY-QR
              - heading "Giảm đến 50K khi thanh toán dịch vụ TravelEasy bằng VNPAY-QR" [level=4] [ref=e1515]
            - generic [ref=e1516]:
              - generic [ref=e1517]: Áp dụng ngay khi thanh toán
              - generic [ref=e1518]: VNPAY 50K
          - generic [ref=e1519] [cursor=pointer]:
            - generic [ref=e1520]:
              - text: ZaloPay
              - heading "Giảm đến 50K khi thanh toán TravelEasy bằng ví Zalopay" [level=4] [ref=e1521]
            - generic [ref=e1522]:
              - generic [ref=e1523]: Áp dụng ngay khi thanh toán
              - generic [ref=e1524]: ZALOPAY 50K
          - generic [ref=e1525] [cursor=pointer]:
            - generic [ref=e1526]:
              - text: MoMo
              - heading "Giảm 20K khi thanh toán vé xe nhanh chóng bằng ví MoMo" [level=4] [ref=e1527]
            - generic [ref=e1528]:
              - generic [ref=e1529]: Áp dụng ngay khi thanh toán
              - generic [ref=e1530]: MOMO 20K
      - generic [ref=e1531]:
        - generic [ref=e1532]:
          - heading "Ưu đãi từ đối tác khác" [level=2] [ref=e1533]
          - paragraph [ref=e1534]: Đặc quyền từ mạng lưới đối tác Grab, Green SM, MOOVTEK và các khu nghỉ dưỡng
        - generic [ref=e1535]:
          - generic [ref=e1536] [cursor=pointer]:
            - generic [ref=e1537]:
              - generic [ref=e1538]:
                - generic [ref=e1539]: MOOVTEK
                - generic [ref=e1540]: GIẢM 30%
              - heading "Giảm đến 30% khi đặt xe công nghệ MOOVTEK dành cho khách hàng TravelEasy" [level=4] [ref=e1541]
              - paragraph [ref=e1542]: Tiễn thẳng bến xe - Đặt ngay khởi trễ
            - generic [ref=e1543]: Nhận mã ngay
          - generic [ref=e1547] [cursor=pointer]:
            - generic [ref=e1548]:
              - generic [ref=e1549]:
                - generic [ref=e1550]: Grab
                - generic [ref=e1551]: GIẢM 20%
              - heading "Giảm 20% khi đặt dịch vụ GrabBike/GrabCar di chuyển ra bến xe" [level=4] [ref=e1552]
              - paragraph [ref=e1553]: Có Grab đón đưa mọi nẻo đường
            - generic [ref=e1554]: Nhận mã ngay
          - generic [ref=e1558] [cursor=pointer]:
            - generic [ref=e1559]:
              - generic [ref=e1560]:
                - generic [ref=e1561]: Green SM
                - generic [ref=e1562]: ƯU ĐÃI 20%
              - heading "Giảm đến 20% khi sử dụng dịch vụ taxi điện Green SM cho khách TravelEasy" [level=4] [ref=e1563]
              - paragraph [ref=e1564]: Trọn vẹn một hành trình xanh
            - generic [ref=e1565]: Nhận mã ngay
          - generic [ref=e1569] [cursor=pointer]:
            - generic [ref=e1570]:
              - generic [ref=e1571]:
                - generic [ref=e1572]: Radisson Resort
                - generic [ref=e1573]: GIẢM 15%
              - heading "Giảm 15% dịch vụ Spa tại Radisson Resort Mũi Né dành cho khách hàng" [level=4] [ref=e1574]
              - paragraph [ref=e1575]: Thư giãn tuyệt đỉnh sau chuyến xe đường dài
            - generic [ref=e1576]: Nhận mã ngay
      - generic [ref=e1580]:
        - generic [ref=e1581]:
          - heading "TravelEasy có gì mới?" [level=2] [ref=e1582]
          - paragraph [ref=e1583]: Cập nhật các tính năng và dự án ý nghĩa mới nhất từ nền tảng
        - generic [ref=e1584]:
          - generic [ref=e1585] [cursor=pointer]:
            - generic [ref=e1586]:
              - generic [ref=e1587]:
                - generic [ref=e1588]: TÍNH NĂNG MỚI
                - generic [ref=e1589]: Tháng 10/2026
              - heading "TravelEasy chính thức hỗ trợ phương thức thanh toán tiện lợi Apple Pay" [level=4] [ref=e1590]
            - generic [ref=e1591]: Tìm hiểu thêm →
          - generic [ref=e1592] [cursor=pointer]:
            - generic [ref=e1593]:
              - generic [ref=e1594]:
                - generic [ref=e1595]: CỘNG ĐỒNG
                - generic [ref=e1596]: Xuân 2027
              - heading "Quỹ \"Chuyến Xe Yêu Thương\" - Trao hàng nghìn vé xe Tết đoàn viên cho người khó khăn" [level=4] [ref=e1597]
            - generic [ref=e1598]: Tìm hiểu thêm →
          - generic [ref=e1599] [cursor=pointer]:
            - generic [ref=e1600]:
              - generic [ref=e1601]:
                - generic [ref=e1602]: CÔNG NGHỆ
                - generic [ref=e1603]: Tháng 10/2026
              - heading "Chủ động và an tâm hơn trong mọi hành trình với tính năng định vị theo dõi xe trực tiếp" [level=4] [ref=e1604]
            - generic [ref=e1605]: Tìm hiểu thêm →
          - generic [ref=e1606] [cursor=pointer]:
            - generic [ref=e1607]:
              - generic [ref=e1608]:
                - generic [ref=e1609]: DỊCH VỤ MỚI
                - generic [ref=e1610]: Tháng 10/2026
              - heading "\"Bảo hiểm chuyến đi\" chính thức ra mắt - An tâm di chuyển với mức bảo hiểm tới 400 triệu" [level=4] [ref=e1611]
            - generic [ref=e1612]: Tìm hiểu thêm →
      - generic [ref=e1613]:
        - heading "Mạng lưới bến xe và nhà xe đối tác hàng đầu" [level=3] [ref=e1614]
        - paragraph [ref=e1615]: TravelEasy kết nối trực tiếp với các bến xe trung tâm tại các thành phố lớn cùng hơn 100+ nhà xe uy tín trên khắp mọi miền Tổ quốc.
        - generic [ref=e1616]:
          - generic [ref=e1617]:
            - heading "Bến xe phía Nam" [level=4] [ref=e1618]
            - list [ref=e1619]:
              - listitem [ref=e1620]: • Bến xe Miền Đông (Bình Thạnh)
              - listitem [ref=e1621]: • Bến xe Miền Tây (Bình Tân)
              - listitem [ref=e1622]: • Bến xe An Sương (Hóc Môn)
              - listitem [ref=e1623]: • Bến xe Vũng Tàu
              - listitem [ref=e1624]: • Bến xe Trung tâm Cần Thơ
          - generic [ref=e1625]:
            - heading "Bến xe phía Bắc" [level=4] [ref=e1626]
            - list [ref=e1627]:
              - listitem [ref=e1628]: • Bến xe Mỹ Đình (Hà Nội)
              - listitem [ref=e1629]: • Bến xe Giáp Bát (Hà Nội)
              - listitem [ref=e1630]: • Bến xe Nước Ngầm (Hà Nội)
              - listitem [ref=e1631]: • Bến xe Cầu Rào (Hải Phòng)
              - listitem [ref=e1632]: • Bến xe Sa Pa (Lào Cai)
          - generic [ref=e1633]:
            - heading "Bến xe miền Trung & Tây Nguyên" [level=4] [ref=e1634]
            - list [ref=e1635]:
              - listitem [ref=e1636]: • Bến xe Liên tỉnh Đà Lạt
              - listitem [ref=e1637]: • Bến xe Trung tâm Đà Nẵng
              - listitem [ref=e1638]: • Bến xe Phía Nam Nha Trang
              - listitem [ref=e1639]: • Bến xe Quy Nhơn
              - listitem [ref=e1640]: • Bến xe Phía Bắc TP. Huế
          - generic [ref=e1641]:
            - heading "Nhà xe tiêu biểu" [level=4] [ref=e1642]
            - list [ref=e1643]:
              - listitem [ref=e1644]: • TravelEasy Express Bus
              - listitem [ref=e1645]: • Phương Trang (FUTA Bus Lines)
              - listitem [ref=e1646]: • Thành Bưởi Limousine
              - listitem [ref=e1647]: • Sao Việt Express
              - listitem [ref=e1648]: • Xe Khách Hoa Mai Vũng Tàu
  - generic [ref=e1649]:
    - generic [ref=e1650] [cursor=pointer]: Cần trợ lý AI tư vấn chuyến đi?
    - button "Hỏi Trợ Lý AI 24/7" [ref=e1659] [cursor=pointer]:
      - generic [ref=e1668]: Hỏi Trợ Lý AI
      - generic [ref=e1669]: 24/7
  - contentinfo [ref=e1670]:
    - generic [ref=e1671]:
      - generic [ref=e1672]:
        - generic [ref=e1673]: TravelEasy.vn
        - paragraph [ref=e1684]: Nền tảng công nghệ kết nối hành khách và các thương hiệu nhà xe uy tín toàn quốc. Đặt vé trực tuyến, chọn vị trí giường nằm 2 tầng trực quan, cam kết giữ chỗ 100%.
        - generic [ref=e1685]:
          - generic [ref=e1686]:
            - text: "Hotline CSKH 24/7:"
            - strong [ref=e1691]: 1900 6868
          - generic [ref=e1692]:
            - text: "Email hỗ trợ:"
            - strong [ref=e1696]: support@traveleasy.vn
      - generic [ref=e1697]:
        - heading "Tuyến Đường Phổ Biến" [level=4] [ref=e1698]
        - list [ref=e1699]:
          - listitem [ref=e1700]:
            - link "→ Xe đi Đà Lạt từ Sài Gòn" [ref=e1701] [cursor=pointer]:
              - /url: /search?origin=TP.+H%E1%BB%93+Ch%C3%AD+Minh&destination=%C4%90%C3%A0+L%E1%BA%A1t
          - listitem [ref=e1702]:
            - link "→ Xe đi Nha Trang từ Sài Gòn" [ref=e1703] [cursor=pointer]:
              - /url: /search?origin=TP.+H%E1%BB%93+Ch%C3%AD+Minh&destination=Nha+Trang
          - listitem [ref=e1704]:
            - link "→ Xe đi Sa Pa từ Hà Nội" [ref=e1705] [cursor=pointer]:
              - /url: /search?origin=H%C3%A0+N%E1%BB%99i&destination=Sa+Pa
          - listitem [ref=e1706]:
            - link "→ Xe đi Hải Phòng từ Hà Nội" [ref=e1707] [cursor=pointer]:
              - /url: /search?origin=H%C3%A0+N%E1%BB%99i&destination=H%E1%BA%A3i+Ph%C3%B2ng
          - listitem [ref=e1708]:
            - link "→ Xe đi Vũng Tàu từ Sài Gòn" [ref=e1709] [cursor=pointer]:
              - /url: /search?origin=TP.+H%E1%BB%93+Ch%C3%AD+Minh&destination=V%C5%A9ng+T%C3%A0u
      - generic [ref=e1710]:
        - heading "Đối Tác Nhà Xe" [level=4] [ref=e1711]
        - list [ref=e1712]:
          - listitem [ref=e1713]:
            - link "→ TravelEasy Express Lines" [ref=e1714] [cursor=pointer]:
              - /url: /search?origin=TP.+H%E1%BB%93+Ch%C3%AD+Minh&destination=%C4%90%C3%A0+L%E1%BA%A1t
          - listitem [ref=e1715]:
            - link "→ Sao Việt Express" [ref=e1716] [cursor=pointer]:
              - /url: /search?origin=H%C3%A0+N%E1%BB%99i&destination=Sa+Pa
          - listitem [ref=e1717]:
            - link "→ Phương Trang FUTA Bus Lines" [ref=e1718] [cursor=pointer]:
              - /url: /search?origin=TP.+H%E1%BB%93+Ch%C3%AD+Minh&destination=Nha+Trang
          - listitem [ref=e1719]:
            - link "🤝 Hợp tác mở bán vé cùng TravelEasy" [ref=e1720] [cursor=pointer]:
              - /url: /partner
          - listitem [ref=e1721]:
            - link "→ Cổng đăng nhập đối tác nhà xe" [ref=e1722] [cursor=pointer]:
              - /url: /company/login
      - generic [ref=e1723]:
        - heading "Chính Sách & Hỗ Trợ" [level=4] [ref=e1724]
        - list [ref=e1725]:
          - listitem [ref=e1726]:
            - link "→ Chính sách hoàn / hủy vé 24/7" [ref=e1727] [cursor=pointer]:
              - /url: /policy?tab=cancellation
          - listitem [ref=e1728]:
            - link "→ Cam kết giữ 100% chỗ (Hoàn 150%)" [ref=e1729] [cursor=pointer]:
              - /url: /policy?tab=guarantee
          - listitem [ref=e1730]:
            - link "→ Quy chế hoạt động sàn vé xe" [ref=e1731] [cursor=pointer]:
              - /url: /policy?tab=terms
          - listitem [ref=e1732]:
            - link "→ Bảo mật & An toàn thanh toán" [ref=e1733] [cursor=pointer]:
              - /url: /policy?tab=privacy
          - listitem [ref=e1734]:
            - link "→ Câu hỏi thường gặp (FAQ)" [ref=e1735] [cursor=pointer]:
              - /url: /policy?tab=faq
    - generic [ref=e1736]:
      - generic [ref=e1737]: TravelEasy Platform © 2026. Bản quyền thuộc về Nhóm 7 — Khóa đào tạo Rikkei Pre-OJT.
      - generic [ref=e1738]:
        - link "Tra cứu vé điện tử" [ref=e1739] [cursor=pointer]:
          - /url: /lookup
        - link "Vé của tôi" [ref=e1740] [cursor=pointer]:
          - /url: /my-tickets
        - link "Hồ sơ cá nhân" [ref=e1741] [cursor=pointer]:
          - /url: /profile
  - navigation [ref=e1742]:
    - link "Trang chủ" [ref=e1743] [cursor=pointer]:
      - /url: /
    - link "Đặt vé" [ref=e1749] [cursor=pointer]:
      - /url: /search
    - link "Vé của tôi" [ref=e1755] [cursor=pointer]:
      - /url: /my-tickets
    - link "Quét QR" [ref=e1763] [cursor=pointer]:
      - /url: /scanner
    - link "Đăng nhập" [ref=e1779] [cursor=pointer]:
      - /url: /auth
```

# Test source

```ts
  1   | /**
  2   |  * S317-responsive-cross-browser.spec.ts
  3   |  * ============================================================================
  4   |  * KIỂM THỬ HỒI QUY GIAO DIỆN — BỐ CỤC THÍCH ỨNG VÀ TƯƠNG THÍCH TRÌNH DUYỆT (/)
  5   |  * Thẻ Trello: [FE][S317] (ID: 6ae81140)
  6   |  * Người thực hiện: Đoàn Nhật Cường (CuongLiam)
  7   |  * Leader phê duyệt: Phạm Công Thành (thanhphmcong1)
  8   |  * Công cụ: Playwright (Chromium / Firefox / WebKit / Edge) — render DOM thật
  9   |  * ============================================================================
  10  |  * Chạy: npm --prefix frontend run test:regression:s317
  11  |  * Ảnh chụp lưu tại: docs/screenshots/S317-<browser>-<viewport>.png
  12  |  */
  13  | import { test, expect, type Page } from '@playwright/test';
  14  | import fs from 'node:fs';
  15  | import path from 'node:path';
  16  | 
  17  | const SHOT_DIR = path.resolve(process.cwd(), '..', 'docs', 'screenshots');
  18  | fs.mkdirSync(SHOT_DIR, { recursive: true });
  19  | 
  20  | const VIEWPORTS = [
  21  |   { name: 'mobile-375x667', width: 375, height: 667 },
  22  |   { name: 'mobile-412x915', width: 412, height: 915 },
  23  |   { name: 'tablet-768x1024', width: 768, height: 1024 },
  24  |   { name: 'tablet-1024x768', width: 1024, height: 768 },
  25  |   { name: 'desktop-1440x900', width: 1440, height: 900 },
  26  |   { name: 'desktop-1920x1080', width: 1920, height: 1080 },
  27  | ];
  28  | 
  29  | const hasHorizontalOverflow = (page: Page) =>
  30  |   page.evaluate(
  31  |     () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  32  |   );
  33  | 
  34  | // ---------------------------------------------------------------------------
  35  | // 1. RESPONSIVE: không tràn ngang + chụp ảnh thật ở mỗi viewport
  36  | // ---------------------------------------------------------------------------
  37  | test.describe('S317 Responsive layout', () => {
  38  |   for (const vp of VIEWPORTS) {
  39  |     test(`[S317-RS] ${vp.name}: không tràn ngang, render được trang chủ`, async ({ page }, info) => {
  40  |       await page.setViewportSize({ width: vp.width, height: vp.height });
  41  |       await page.goto('/', { waitUntil: 'networkidle' });
  42  | 
  43  |       await expect(page.locator('body')).toBeVisible();
> 44  |       expect(await hasHorizontalOverflow(page), 'Trang bị tràn chiều ngang').toBe(false);
      |                                                                              ^ Error: Trang bị tràn chiều ngang
  45  | 
  46  |       await page.screenshot({
  47  |         path: path.join(SHOT_DIR, `S317-${info.project.name}-${vp.name}.png`),
  48  |         fullPage: true,
  49  |       });
  50  |     });
  51  |   }
  52  | 
  53  |   test('[S317-RS] Mobile: nút submit tìm kiếm có touch target >= 44px', async ({ page }) => {
  54  |     await page.setViewportSize({ width: 375, height: 667 });
  55  |     await page.goto('/', { waitUntil: 'networkidle' });
  56  |     // Điều chỉnh selector cho đúng SearchBar của dự án nếu cần
  57  |     const btn = page.locator('button[type="submit"]').first();
  58  |     await expect(btn).toBeVisible();
  59  |     const box = await btn.boundingBox();
  60  |     expect(box).not.toBeNull();
  61  |     expect(box!.height).toBeGreaterThanOrEqual(44);
  62  |   });
  63  | 
  64  |   test('[S317-RS] Số cột lưới thay đổi theo breakpoint (layout thực đo từ DOM)', async ({ page }) => {
  65  |     // Đo số cột thật của phần tử grid đầu tiên trên trang
  66  |     const countCols = () =>
  67  |       page.evaluate(() => {
  68  |         const grid = Array.from(document.querySelectorAll<HTMLElement>('*')).find(
  69  |           (el) => getComputedStyle(el).display === 'grid' && el.children.length >= 2,
  70  |         );
  71  |         if (!grid) return 0;
  72  |         return getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
  73  |       });
  74  | 
  75  |     await page.setViewportSize({ width: 375, height: 667 });
  76  |     await page.goto('/', { waitUntil: 'networkidle' });
  77  |     const mobile = await countCols();
  78  | 
  79  |     await page.setViewportSize({ width: 1440, height: 900 });
  80  |     await page.waitForTimeout(300);
  81  |     const desktop = await countCols();
  82  | 
  83  |     expect(desktop, 'Desktop phải có nhiều cột hơn mobile').toBeGreaterThan(mobile);
  84  |   });
  85  | });
  86  | 
  87  | // ---------------------------------------------------------------------------
  88  | // 2. CROSS-BROWSER: kiểm tra tính năng CSS thật trên engine đang chạy
  89  | // ---------------------------------------------------------------------------
  90  | test.describe('S317 Cross-browser', () => {
  91  |   test('[S317-CB] Engine hỗ trợ flexbox, grid, sticky, backdrop-filter', async ({ page, browserName }) => {
  92  |     await page.goto('/', { waitUntil: 'networkidle' });
  93  |     const support = await page.evaluate(() => ({
  94  |       flexbox: CSS.supports('display', 'flex'),
  95  |       grid: CSS.supports('display', 'grid'),
  96  |       sticky: CSS.supports('position', 'sticky'),
  97  |       backdrop:
  98  |         CSS.supports('backdrop-filter', 'blur(4px)') ||
  99  |         CSS.supports('-webkit-backdrop-filter', 'blur(4px)'),
  100 |     }));
  101 |     console.log(`[${browserName}]`, support);
  102 |     expect(support).toEqual({ flexbox: true, grid: true, sticky: true, backdrop: true });
  103 |   });
  104 | 
  105 |   test('[S317-CB] Không có lỗi JS chưa bắt (pageerror) khi tải trang chủ', async ({ page }) => {
  106 |     const errors: string[] = [];
  107 |     page.on('pageerror', (e) => errors.push(e.message));
  108 |     await page.goto('/', { waitUntil: 'networkidle' });
  109 |     expect(errors, errors.join('\n')).toHaveLength(0);
  110 |   });
  111 | });
  112 | 
  113 | // ---------------------------------------------------------------------------
  114 | // 3. RBAC: khách vãng lai bị chặn ở tuyến admin/company
  115 | // ---------------------------------------------------------------------------
  116 | test.describe('S317 RBAC guard', () => {
  117 |   test('[S317-RBAC] Guest vào /admin/dashboard -> /admin/login', async ({ page }) => {
  118 |     await page.goto('/admin/dashboard');
  119 |     await expect(page).toHaveURL(/\/admin\/login/);
  120 |   });
  121 | 
  122 |   test('[S317-RBAC] Guest vào /company/trips -> /company/login', async ({ page }) => {
  123 |     await page.goto('/company/trips');
  124 |     await expect(page).toHaveURL(/\/company\/login/);
  125 |   });
  126 | });
  127 | 
  128 | // ---------------------------------------------------------------------------
  129 | // 4. EDGE CASE: API backend lỗi -> trang không trắng, không crash
  130 | // ---------------------------------------------------------------------------
  131 | test.describe('S317 Edge cases', () => {
  132 |   test('[S317-EC] API lỗi/ngắt kết nối: trang chủ vẫn hiển thị nội dung', async ({ page }, info) => {
  133 |     const errors: string[] = [];
  134 |     page.on('pageerror', (e) => errors.push(e.message));
  135 |     await page.route('**/api/**', (route) => route.abort('failed'));
  136 | 
  137 |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  138 |     await page.waitForTimeout(1500);
  139 | 
  140 |     const textLen = await page.evaluate(() => document.body.innerText.trim().length);
  141 |     expect(textLen, 'Màn hình bị trắng khi API lỗi').toBeGreaterThan(20);
  142 |     expect(errors, errors.join('\n')).toHaveLength(0);
  143 | 
  144 |     await page.screenshot({
```