# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: S317-responsive-cross-browser.spec.ts >> S317 Responsive layout >> [S317-RS] mobile-375x667: không tràn ngang, render được trang chủ
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
      - generic [ref=e12]:
        - link "Cổng Đối Tác Nhà Xe" [ref=e13] [cursor=pointer]:
          - /url: /company/login
        - link "Hợp tác mở bán vé" [ref=e19] [cursor=pointer]:
          - /url: /partner
        - generic [ref=e26] [cursor=pointer]: 🇻🇳 VN
        - link "Hotline 24/7" [ref=e30] [cursor=pointer]:
          - /url: tel:19006868
        - link "Đăng nhập / Đăng ký" [ref=e35] [cursor=pointer]:
          - /url: /auth
    - generic [ref=e39]:
      - link "TravelEasy .vn NỀN TẢNG KẾT NỐI HÀNH KHÁCH VÀ NHÀ XE" [ref=e41] [cursor=pointer]:
        - /url: /
        - generic [ref=e47]:
          - generic [ref=e48]:
            - generic [ref=e49]: TravelEasy
            - generic [ref=e50]: .vn
          - generic [ref=e51]: NỀN TẢNG KẾT NỐI HÀNH KHÁCH VÀ NHÀ XE
      - generic [ref=e52]:
        - button "Toggle Theme" [ref=e53] [cursor=pointer]:
          - generic [ref=e61]: Giao diện Sáng
        - button "Thông báo" [ref=e63] [cursor=pointer]:
          - generic [ref=e67]: "4"
        - button "Mở Menu Điều Hướng" [ref=e68] [cursor=pointer]
  - main [ref=e70]:
    - generic [ref=e71]:
      - generic [ref=e73]:
        - generic [ref=e74]:
          - generic [ref=e75]: THỨ 3 HÀNG TUẦN | 12H - 14H
          - heading "ĐẠI TIỆC FLASH SALE — VÉ RẺ ĐẾN 50%" [level=1] [ref=e78]
          - paragraph [ref=e79]: "*Áp dụng cho mọi tuyến đường nhà xe tham gia chương trình. Cam kết 100% giữ chỗ, chọn vị trí trực tiếp trên sơ đồ xe!"
        - generic [ref=e80]:
          - generic [ref=e81]:
            - generic [ref=e82]: Địa chỉ mới
            - generic [ref=e87]:
              - button "Xe khách" [ref=e88] [cursor=pointer]
              - button "Máy bay -50k" [ref=e93] [cursor=pointer]:
                - text: Máy bay
                - generic [ref=e96]: "-50k"
              - button "Tàu hỏa Vé Tết" [ref=e97] [cursor=pointer]:
                - text: Tàu hỏa
                - generic [ref=e102]: Vé Tết
              - button "Thuê xe Mới" [ref=e103] [cursor=pointer]:
                - text: Thuê xe
                - generic [ref=e108]: Mới
          - generic [ref=e110]:
            - generic [ref=e111]:
              - generic [ref=e112]: Nơi xuất phát
              - combobox [ref=e114] [cursor=pointer]:
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
            - button "Đổi chiều xuất phát / điểm đến" [ref=e115] [cursor=pointer]
            - generic [ref=e119]:
              - generic [ref=e120]: Nơi đến
              - combobox [ref=e122] [cursor=pointer]:
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
            - generic [ref=e123]:
              - generic [ref=e124]: Ngày đi
              - textbox [ref=e127] [cursor=pointer]: 2026-11-05
            - button "Thêm ngày về" [ref=e128] [cursor=pointer]
            - button "Tìm kiếm" [ref=e130] [cursor=pointer]
      - generic [ref=e135]:
        - generic [ref=e136]: Chắc chắn có chỗ
        - generic [ref=e141]: Hỗ trợ 24/7
        - generic [ref=e146]: Nhiều ưu đãi
        - generic [ref=e153]: Thanh toán đa dạng
      - generic [ref=e158]:
        - generic [ref=e159]:
          - generic [ref=e160]:
            - generic [ref=e161]: ĐIỂM ĐẾN ĐƯỢC YÊU THÍCH NHẤT 2026
            - heading "Tuyến đường phổ biến" [level=2] [ref=e165]
            - paragraph [ref=e166]: Đặt vé sớm các tuyến trọng điểm, cam kết 100% giữ chỗ, không tăng giá ngày Lễ/Tết
          - generic [ref=e167]:
            - button "Xem các tuyến trước" [ref=e168] [cursor=pointer]
            - button "Xem các tuyến tiếp theo" [ref=e171] [cursor=pointer]
        - generic [ref=e174]:
          - button "Tất cả tuyến hot" [ref=e175] [cursor=pointer]
          - button "Từ TP. Hồ Chí Minh" [ref=e179] [cursor=pointer]
          - button "Từ Hà Nội" [ref=e184] [cursor=pointer]
          - button "Miền Trung & Tây Nguyên" [ref=e189] [cursor=pointer]
          - button "Miền Tây Sông Nước" [ref=e194] [cursor=pointer]
        - generic [ref=e200]:
          - generic [ref=e201] [cursor=pointer]:
            - generic [ref=e202]:
              - img "TP. Hồ Chí Minh - Đà Lạt" [ref=e203]
              - generic [ref=e205]: GIẢM 15%
              - generic [ref=e209]: Limousine Phòng Riêng VIP
              - generic [ref=e210]: ~6.5h • 305 km
              - generic [ref=e215]: "4.8"
            - generic [ref=e219]:
              - generic [ref=e220]:
                - generic [ref=e221]:
                  - generic [ref=e222]: TP. Hồ Chí Minh
                  - generic [ref=e225]: Đà Lạt
                - paragraph [ref=e226]:
                  - generic [ref=e231]: 48 chuyến xe xuất bến mỗi ngày
              - generic [ref=e232]:
                - generic [ref=e233]:
                  - generic [ref=e234]: Giá vé từ
                  - generic [ref=e235]:
                    - generic [ref=e236]: 390,000đ
                    - generic [ref=e237]: 448,500đ
                - button "Chọn chuyến" [ref=e238]
          - generic [ref=e242] [cursor=pointer]:
            - generic [ref=e243]:
              - img "TP. Hồ Chí Minh - Nha Trang" [ref=e244]
              - generic [ref=e246]: GIẢM 15%
              - generic [ref=e250]: Limousine VIP 22 Phòng
              - generic [ref=e251]: ~8h • 435 km
              - generic [ref=e256]: "4.8"
            - generic [ref=e260]:
              - generic [ref=e261]:
                - generic [ref=e262]:
                  - generic [ref=e263]: TP. Hồ Chí Minh
                  - generic [ref=e266]: Nha Trang
                - paragraph [ref=e267]:
                  - generic [ref=e272]: 32 chuyến xe xuất bến mỗi ngày
              - generic [ref=e273]:
                - generic [ref=e274]:
                  - generic [ref=e275]: Giá vé từ
                  - generic [ref=e276]:
                    - generic [ref=e277]: 320,000đ
                    - generic [ref=e278]: 368,000đ
                - button "Chọn chuyến" [ref=e279]
          - generic [ref=e283] [cursor=pointer]:
            - generic [ref=e284]:
              - img "TP. Hồ Chí Minh - Cần Thơ" [ref=e285]
              - generic [ref=e287]: GIẢM 15%
              - generic [ref=e291]: Giường Nằm Cao Cấp
              - generic [ref=e292]: ~3.5h • 169 km
              - generic [ref=e297]: "4.8"
            - generic [ref=e301]:
              - generic [ref=e302]:
                - generic [ref=e303]:
                  - generic [ref=e304]: TP. Hồ Chí Minh
                  - generic [ref=e307]: Cần Thơ
                - paragraph [ref=e308]:
                  - generic [ref=e313]: 40 chuyến xe xuất bến mỗi ngày
              - generic [ref=e314]:
                - generic [ref=e315]:
                  - generic [ref=e316]: Giá vé từ
                  - generic [ref=e317]:
                    - generic [ref=e318]: 199,000đ
                    - generic [ref=e319]: 228,850đ
                - button "Chọn chuyến" [ref=e320]
          - generic [ref=e324] [cursor=pointer]:
            - generic [ref=e325]:
              - img "Hà Nội - Sa Pa" [ref=e326]
              - generic [ref=e328]: GIẢM 15%
              - generic [ref=e332]: Cabin Đôi Cung Điện
              - generic [ref=e333]: ~5.5h • 315 km
              - generic [ref=e338]: "4.8"
            - generic [ref=e342]:
              - generic [ref=e343]:
                - generic [ref=e344]:
                  - generic [ref=e345]: Hà Nội
                  - generic [ref=e348]: Sa Pa
                - paragraph [ref=e349]:
                  - generic [ref=e354]: 36 chuyến xe xuất bến mỗi ngày
              - generic [ref=e355]:
                - generic [ref=e356]:
                  - generic [ref=e357]: Giá vé từ
                  - generic [ref=e358]:
                    - generic [ref=e359]: 450,000đ
                    - generic [ref=e360]: 517,500đ
                - button "Chọn chuyến" [ref=e361]
          - generic [ref=e365] [cursor=pointer]:
            - generic [ref=e366]:
              - img "TP. Hồ Chí Minh - Vũng Tàu" [ref=e367]
              - generic [ref=e369]: GIẢM 15%
              - generic [ref=e373]: Limousine Ghế Massage VIP
              - generic [ref=e374]: ~2h • 105 km
              - generic [ref=e379]: "4.8"
            - generic [ref=e383]:
              - generic [ref=e384]:
                - generic [ref=e385]:
                  - generic [ref=e386]: TP. Hồ Chí Minh
                  - generic [ref=e389]: Vũng Tàu
                - paragraph [ref=e390]:
                  - generic [ref=e395]: 60 chuyến xe xuất bến mỗi ngày
              - generic [ref=e396]:
                - generic [ref=e397]:
                  - generic [ref=e398]: Giá vé từ
                  - generic [ref=e399]:
                    - generic [ref=e400]: 199,000đ
                    - generic [ref=e401]: 228,850đ
                - button "Chọn chuyến" [ref=e402]
          - generic [ref=e406] [cursor=pointer]:
            - generic [ref=e407]:
              - img "Vũng Tàu - TP. Hồ Chí Minh" [ref=e408]
              - generic [ref=e410]: GIẢM 15%
              - generic [ref=e414]: Limousine VIP 34 Phòng
              - generic [ref=e415]: ~2h • 105 km
              - generic [ref=e420]: "4.8"
            - generic [ref=e424]:
              - generic [ref=e425]:
                - generic [ref=e426]:
                  - generic [ref=e427]: Vũng Tàu
                  - generic [ref=e430]: TP. Hồ Chí Minh
                - paragraph [ref=e431]:
                  - generic [ref=e436]: 24 chuyến xe xuất bến mỗi ngày
              - generic [ref=e437]:
                - generic [ref=e438]:
                  - generic [ref=e439]: Giá vé từ
                  - generic [ref=e440]:
                    - generic [ref=e441]: 199,000đ
                    - generic [ref=e442]: 228,850đ
                - button "Chọn chuyến" [ref=e443]
          - generic [ref=e447] [cursor=pointer]:
            - generic [ref=e448]:
              - img "TP. Hồ Chí Minh - Phan Thiết" [ref=e449]
              - generic [ref=e451]: GIẢM 15%
              - generic [ref=e455]: Limousine VIP 34 Phòng
              - generic [ref=e456]: ~4h • 215 km
              - generic [ref=e461]: "4.8"
            - generic [ref=e465]:
              - generic [ref=e466]:
                - generic [ref=e467]:
                  - generic [ref=e468]: TP. Hồ Chí Minh
                  - generic [ref=e471]: Phan Thiết
                - paragraph [ref=e472]:
                  - generic [ref=e477]: 28 chuyến xe xuất bến mỗi ngày
              - generic [ref=e478]:
                - generic [ref=e479]:
                  - generic [ref=e480]: Giá vé từ
                  - generic [ref=e481]:
                    - generic [ref=e482]: 199,000đ
                    - generic [ref=e483]: 228,850đ
                - button "Chọn chuyến" [ref=e484]
          - generic [ref=e488] [cursor=pointer]:
            - generic [ref=e489]:
              - img "TP. Hồ Chí Minh - Buôn Ma Thuột" [ref=e490]
              - generic [ref=e492]: GIẢM 15%
              - generic [ref=e496]: Limousine Cung Điện Đôi
              - generic [ref=e497]: ~7.5h • 350 km
              - generic [ref=e502]: "4.8"
            - generic [ref=e506]:
              - generic [ref=e507]:
                - generic [ref=e508]:
                  - generic [ref=e509]: TP. Hồ Chí Minh
                  - generic [ref=e512]: Buôn Ma Thuột
                - paragraph [ref=e513]:
                  - generic [ref=e518]: 22 chuyến xe xuất bến mỗi ngày
              - generic [ref=e519]:
                - generic [ref=e520]:
                  - generic [ref=e521]: Giá vé từ
                  - generic [ref=e522]:
                    - generic [ref=e523]: 199,000đ
                    - generic [ref=e524]: 228,850đ
                - button "Chọn chuyến" [ref=e525]
          - generic [ref=e529] [cursor=pointer]:
            - generic [ref=e530]:
              - img "Hà Nội - Hải Phòng" [ref=e531]
              - generic [ref=e533]: GIẢM 15%
              - generic [ref=e537]: Limousine VIP 9 Chỗ
              - generic [ref=e538]: ~1.5h • 120 km
              - generic [ref=e543]: "4.8"
            - generic [ref=e547]:
              - generic [ref=e548]:
                - generic [ref=e549]:
                  - generic [ref=e550]: Hà Nội
                  - generic [ref=e553]: Hải Phòng
                - paragraph [ref=e554]:
                  - generic [ref=e559]: 35 chuyến xe xuất bến mỗi ngày
              - generic [ref=e560]:
                - generic [ref=e561]:
                  - generic [ref=e562]: Giá vé từ
                  - generic [ref=e563]:
                    - generic [ref=e564]: 199,000đ
                    - generic [ref=e565]: 228,850đ
                - button "Chọn chuyến" [ref=e566]
          - generic [ref=e570] [cursor=pointer]:
            - generic [ref=e571]:
              - img "Hà Nội - Hạ Long" [ref=e572]
              - generic [ref=e574]: GIẢM 15%
              - generic [ref=e578]: Limousine VIP 9 Chỗ
              - generic [ref=e579]: ~2.5h • 155 km
              - generic [ref=e584]: "4.8"
            - generic [ref=e588]:
              - generic [ref=e589]:
                - generic [ref=e590]:
                  - generic [ref=e591]: Hà Nội
                  - generic [ref=e594]: Hạ Long
                - paragraph [ref=e595]:
                  - generic [ref=e600]: 35 chuyến xe xuất bến mỗi ngày
              - generic [ref=e601]:
                - generic [ref=e602]:
                  - generic [ref=e603]: Giá vé từ
                  - generic [ref=e604]:
                    - generic [ref=e605]: 199,000đ
                    - generic [ref=e606]: 228,850đ
                - button "Chọn chuyến" [ref=e607]
          - generic [ref=e611] [cursor=pointer]:
            - generic [ref=e612]:
              - img "Hà Nội - Vinh" [ref=e613]
              - generic [ref=e615]: GIẢM 15%
              - generic [ref=e619]: Limousine VIP 34 Phòng
              - generic [ref=e620]: ~5.5h • 300 km
              - generic [ref=e625]: "4.8"
            - generic [ref=e629]:
              - generic [ref=e630]:
                - generic [ref=e631]:
                  - generic [ref=e632]: Hà Nội
                  - generic [ref=e635]: Vinh
                - paragraph [ref=e636]:
                  - generic [ref=e641]: 24 chuyến xe xuất bến mỗi ngày
              - generic [ref=e642]:
                - generic [ref=e643]:
                  - generic [ref=e644]: Giá vé từ
                  - generic [ref=e645]:
                    - generic [ref=e646]: 199,000đ
                    - generic [ref=e647]: 228,850đ
                - button "Chọn chuyến" [ref=e648]
          - generic [ref=e652] [cursor=pointer]:
            - generic [ref=e653]:
              - img "Hà Nội - Hà Giang" [ref=e654]
              - generic [ref=e656]: GIẢM 15%
              - generic [ref=e660]: Limousine VIP 34 Phòng
              - generic [ref=e661]: ~6h • 320 km
              - generic [ref=e666]: "4.8"
            - generic [ref=e670]:
              - generic [ref=e671]:
                - generic [ref=e672]:
                  - generic [ref=e673]: Hà Nội
                  - generic [ref=e676]: Hà Giang
                - paragraph [ref=e677]:
                  - generic [ref=e682]: 24 chuyến xe xuất bến mỗi ngày
              - generic [ref=e683]:
                - generic [ref=e684]:
                  - generic [ref=e685]: Giá vé từ
                  - generic [ref=e686]:
                    - generic [ref=e687]: 199,000đ
                    - generic [ref=e688]: 228,850đ
                - button "Chọn chuyến" [ref=e689]
          - generic [ref=e693] [cursor=pointer]:
            - generic [ref=e694]:
              - img "Đà Nẵng - Huế" [ref=e695]
              - generic [ref=e697]: GIẢM 15%
              - generic [ref=e701]: Limousine VIP 24 Phòng
              - generic [ref=e702]: ~2.5h • 100 km
              - generic [ref=e707]: "4.8"
            - generic [ref=e711]:
              - generic [ref=e712]:
                - generic [ref=e713]:
                  - generic [ref=e714]: Đà Nẵng
                  - generic [ref=e717]: Huế
                - paragraph [ref=e718]:
                  - generic [ref=e723]: 30 chuyến xe xuất bến mỗi ngày
              - generic [ref=e724]:
                - generic [ref=e725]:
                  - generic [ref=e726]: Giá vé từ
                  - generic [ref=e727]:
                    - generic [ref=e728]: 199,000đ
                    - generic [ref=e729]: 228,850đ
                - button "Chọn chuyến" [ref=e730]
          - generic [ref=e734] [cursor=pointer]:
            - generic [ref=e735]:
              - img "Đà Nẵng - Quy Nhơn" [ref=e736]
              - generic [ref=e738]: GIẢM 15%
              - generic [ref=e742]: Limousine Giường Nằm VIP
              - generic [ref=e743]: ~5.5h • 320 km
              - generic [ref=e748]: "4.8"
            - generic [ref=e752]:
              - generic [ref=e753]:
                - generic [ref=e754]:
                  - generic [ref=e755]: Đà Nẵng
                  - generic [ref=e758]: Quy Nhơn
                - paragraph [ref=e759]:
                  - generic [ref=e764]: 20 chuyến xe xuất bến mỗi ngày
              - generic [ref=e765]:
                - generic [ref=e766]:
                  - generic [ref=e767]: Giá vé từ
                  - generic [ref=e768]:
                    - generic [ref=e769]: 199,000đ
                    - generic [ref=e770]: 228,850đ
                - button "Chọn chuyến" [ref=e771]
          - generic [ref=e775] [cursor=pointer]:
            - generic [ref=e776]:
              - img "Đà Lạt - TP. Hồ Chí Minh" [ref=e777]
              - generic [ref=e779]: GIẢM 15%
              - generic [ref=e783]: Limousine VIP 34 Phòng
              - generic [ref=e784]: ~6.5h • 305 km
              - generic [ref=e789]: "4.8"
            - generic [ref=e793]:
              - generic [ref=e794]:
                - generic [ref=e795]:
                  - generic [ref=e796]: Đà Lạt
                  - generic [ref=e799]: TP. Hồ Chí Minh
                - paragraph [ref=e800]:
                  - generic [ref=e805]: 24 chuyến xe xuất bến mỗi ngày
              - generic [ref=e806]:
                - generic [ref=e807]:
                  - generic [ref=e808]: Giá vé từ
                  - generic [ref=e809]:
                    - generic [ref=e810]: 199,000đ
                    - generic [ref=e811]: 228,850đ
                - button "Chọn chuyến" [ref=e812]
          - generic [ref=e816] [cursor=pointer]:
            - generic [ref=e817]:
              - img "Sa Pa - Hà Nội" [ref=e818]
              - generic [ref=e820]: GIẢM 15%
              - generic [ref=e824]: Limousine VIP Giường Nằm
              - generic [ref=e825]: ~5.5h • 315 km
              - generic [ref=e830]: "4.8"
            - generic [ref=e834]:
              - generic [ref=e835]:
                - generic [ref=e836]:
                  - generic [ref=e837]: Sa Pa
                  - generic [ref=e840]: Hà Nội
                - paragraph [ref=e841]:
                  - generic [ref=e846]: 50 chuyến xe xuất bến mỗi ngày
              - generic [ref=e847]:
                - generic [ref=e848]:
                  - generic [ref=e849]: Giá vé từ
                  - generic [ref=e850]:
                    - generic [ref=e851]: 199,000đ
                    - generic [ref=e852]: 228,850đ
                - button "Chọn chuyến" [ref=e853]
          - generic [ref=e857] [cursor=pointer]:
            - generic [ref=e858]:
              - img "Nha Trang - TP. Hồ Chí Minh" [ref=e859]
              - generic [ref=e861]: GIẢM 15%
              - generic [ref=e865]: Limousine VIP 34 Phòng
              - generic [ref=e866]: ~8h • 435 km
              - generic [ref=e871]: "4.8"
            - generic [ref=e875]:
              - generic [ref=e876]:
                - generic [ref=e877]:
                  - generic [ref=e878]: Nha Trang
                  - generic [ref=e881]: TP. Hồ Chí Minh
                - paragraph [ref=e882]:
                  - generic [ref=e887]: 24 chuyến xe xuất bến mỗi ngày
              - generic [ref=e888]:
                - generic [ref=e889]:
                  - generic [ref=e890]: Giá vé từ
                  - generic [ref=e891]:
                    - generic [ref=e892]: 199,000đ
                    - generic [ref=e893]: 228,850đ
                - button "Chọn chuyến" [ref=e894]
          - generic [ref=e898] [cursor=pointer]:
            - generic [ref=e899]:
              - img "Cần Thơ - TP. Hồ Chí Minh" [ref=e900]
              - generic [ref=e902]: GIẢM 15%
              - generic [ref=e906]: Limousine VIP 34 Phòng
              - generic [ref=e907]: ~3.5h • 169 km
              - generic [ref=e912]: "4.8"
            - generic [ref=e916]:
              - generic [ref=e917]:
                - generic [ref=e918]:
                  - generic [ref=e919]: Cần Thơ
                  - generic [ref=e922]: TP. Hồ Chí Minh
                - paragraph [ref=e923]:
                  - generic [ref=e928]: 24 chuyến xe xuất bến mỗi ngày
              - generic [ref=e929]:
                - generic [ref=e930]:
                  - generic [ref=e931]: Giá vé từ
                  - generic [ref=e932]:
                    - generic [ref=e933]: 199,000đ
                    - generic [ref=e934]: 228,850đ
                - button "Chọn chuyến" [ref=e935]
          - generic [ref=e939] [cursor=pointer]:
            - generic [ref=e940]:
              - img "Hà Nội - Đà Nẵng" [ref=e941]
              - generic [ref=e943]: GIẢM 15%
              - generic [ref=e947]: Limousine VIP 24 Phòng
              - generic [ref=e948]: ~13.5h • 780 km
              - generic [ref=e953]: "4.8"
            - generic [ref=e957]:
              - generic [ref=e958]:
                - generic [ref=e959]:
                  - generic [ref=e960]: Hà Nội
                  - generic [ref=e963]: Đà Nẵng
                - paragraph [ref=e964]:
                  - generic [ref=e969]: 30 chuyến xe xuất bến mỗi ngày
              - generic [ref=e970]:
                - generic [ref=e971]:
                  - generic [ref=e972]: Giá vé từ
                  - generic [ref=e973]:
                    - generic [ref=e974]: 199,000đ
                    - generic [ref=e975]: 228,850đ
                - button "Chọn chuyến" [ref=e976]
          - generic [ref=e980] [cursor=pointer]:
            - generic [ref=e981]:
              - img "Phan Thiết - TP. Hồ Chí Minh" [ref=e982]
              - generic [ref=e984]: GIẢM 15%
              - generic [ref=e988]: Limousine VIP 34 Phòng
              - generic [ref=e989]: ~4h • 215 km
              - generic [ref=e994]: "4.8"
            - generic [ref=e998]:
              - generic [ref=e999]:
                - generic [ref=e1000]:
                  - generic [ref=e1001]: Phan Thiết
                  - generic [ref=e1004]: TP. Hồ Chí Minh
                - paragraph [ref=e1005]:
                  - generic [ref=e1010]: 24 chuyến xe xuất bến mỗi ngày
              - generic [ref=e1011]:
                - generic [ref=e1012]:
                  - generic [ref=e1013]: Giá vé từ
                  - generic [ref=e1014]:
                    - generic [ref=e1015]: 220,000đ
                    - generic [ref=e1016]: 253,000đ
                - button "Chọn chuyến" [ref=e1017]
      - generic [ref=e1022]:
        - generic [ref=e1023]:
          - heading "Cam kết dịch vụ vàng từ TravelEasy Platform" [level=3] [ref=e1024]
          - paragraph [ref=e1025]: Nền tảng đặt vé công nghệ hàng đầu Việt Nam bảo vệ 100% quyền lợi hành khách trong mọi chuyến đi
        - generic [ref=e1026]:
          - generic [ref=e1027]:
            - generic [ref=e1028]: CAM KẾT SÀN
            - heading "Cam kết 100% giữ đúng chỗ" [level=4] [ref=e1034]
            - paragraph [ref=e1035]: Đảm bảo có chỗ nằm theo đúng số ghế đã chọn trên sơ đồ. Bồi hoàn 150% nếu nhà xe tự ý đổi chuyến.
          - generic [ref=e1036]:
            - generic [ref=e1037]: CÔNG NGHỆ ĐỘC QUYỀN
            - heading "Khóa giữ chỗ Concurrency" [level=4] [ref=e1042]
            - paragraph [ref=e1043]: Thuật toán khóa độc quyền giữ vé trong 10 phút, không bao giờ xảy ra tình trạng cướp vé hay trùng chỗ.
          - generic [ref=e1044]:
            - generic [ref=e1045]: TIỆN ÍCH DI ĐỘNG
            - heading "Soát vé QR không in giấy" [level=4] [ref=e1054]
            - paragraph [ref=e1055]: Quét camera tại /scanner lên xe trong 0.2s. Hỗ trợ tra cứu và hiển thị vé Offline khi mất mạng Internet.
          - generic [ref=e1056]:
            - generic [ref=e1057]: HOÀN TIỀN NHANH
            - heading "Hủy vé tự động hoàn tiền" [level=4] [ref=e1063]
            - paragraph [ref=e1064]: Chính sách hoàn tiền tự động trực tuyến lên tới 95% giá vé theo quy định mốc giờ minh bạch.
      - generic [ref=e1065]:
        - generic [ref=e1066]:
          - generic [ref=e1067]:
            - heading "Đối tác nhà xe hàng đầu" [level=2] [ref=e1068]
            - paragraph [ref=e1069]: Hợp tác chính thức cùng hơn 50+ thương hiệu vận tải hành khách liên tỉnh uy tín nhất
          - button "Xem tất cả nhà xe" [ref=e1070] [cursor=pointer]
        - generic [ref=e1074]:
          - generic [ref=e1075] [cursor=pointer]:
            - img "Phương Trang (FUTA)" [ref=e1077]
            - heading "Phương Trang (FUTA)" [level=4] [ref=e1078]
            - paragraph [ref=e1079]: 48 tuyến liên tỉnh
            - generic [ref=e1080]: 4.9 • 200+ chuyến/ngày
          - generic [ref=e1084] [cursor=pointer]:
            - img "Thành Bưởi VIP" [ref=e1086]
            - heading "Thành Bưởi VIP" [level=4] [ref=e1087]
            - paragraph [ref=e1088]: Sài Gòn - Đà Lạt - Cần Thơ
            - generic [ref=e1089]: 4.8 • 120+ chuyến/ngày
          - generic [ref=e1093] [cursor=pointer]:
            - img "Hoa Mai Vũng Tàu" [ref=e1095]
            - heading "Hoa Mai Vũng Tàu" [level=4] [ref=e1096]
            - paragraph [ref=e1097]: Sài Gòn - Vũng Tàu VIP
            - generic [ref=e1098]: 4.9 • 150+ chuyến/ngày
          - generic [ref=e1102] [cursor=pointer]:
            - img "Sao Việt Sa Pa" [ref=e1104]
            - heading "Sao Việt Sa Pa" [level=4] [ref=e1105]
            - paragraph [ref=e1106]: Hà Nội - Sa Pa Cabin Đôi
            - generic [ref=e1107]: 4.8 • 80+ chuyến/ngày
          - generic [ref=e1111] [cursor=pointer]:
            - img "Kumho Samco" [ref=e1113]
            - heading "Kumho Samco" [level=4] [ref=e1114]
            - paragraph [ref=e1115]: Miền Đông & Miền Tây
            - generic [ref=e1116]: 4.7 • 90+ chuyến/ngày
          - generic [ref=e1120] [cursor=pointer]:
            - img "Hải Vân Limousine" [ref=e1122]
            - heading "Hải Vân Limousine" [level=4] [ref=e1123]
            - paragraph [ref=e1124]: Tuyến Cao Tốc & Sân Bay
            - generic [ref=e1125]: 4.9 • 65+ chuyến/ngày
      - generic [ref=e1130]:
        - generic [ref=e1131] [cursor=pointer]:
          - generic [ref=e1132]: TIỆN ÍCH HÀNH KHÁCH & TÀI XẾ
          - heading "Máy Quét Mã QR Soát Vé Tức Thì" [level=3] [ref=e1140]
          - paragraph [ref=e1141]: Dùng camera điện thoại hoặc tải ảnh vé để kiểm tra tính hợp lệ và Check-in lên xe trong 0.2s không cần in vé giấy.
          - generic [ref=e1142]: Mở máy quét QR ngay
        - generic [ref=e1147] [cursor=pointer]:
          - generic [ref=e1148]: SPRING AI CHATBOT 24/7
          - heading "Trợ Lý AI Gợi Ý Tuyến Xe & Vị Trí Ghế" [level=3] [ref=e1153]
          - paragraph [ref=e1154]: Tư vấn chọn giường nằm tầng dưới A01-A06 chống say xe, gợi ý lịch trình vi vu Đà Lạt và Sa Pa chuẩn chuyên gia.
          - generic [ref=e1155]: Hỏi Trợ Lý AI
      - generic [ref=e1160]:
        - generic [ref=e1161]:
          - heading "Ưu đãi nổi bật" [level=2] [ref=e1162]
          - paragraph [ref=e1163]: Các chương trình khuyến mãi và mã giảm giá vé xe hot nhất
        - generic [ref=e1164]:
          - generic [ref=e1165] [cursor=pointer]:
            - generic [ref=e1166]:
              - img "Mùa Thu Vàng Săn Mây Sa Pa - Giảm ngay 20% vé Limousine" [ref=e1167]
              - generic [ref=e1168]: HOT DEAL
            - generic [ref=e1169]:
              - heading "Mùa Thu Vàng Săn Mây Sa Pa - Giảm ngay 20% vé Limousine" [level=4] [ref=e1170]
              - generic [ref=e1171]: Xem chi tiết ưu đãi
          - generic [ref=e1174] [cursor=pointer]:
            - generic [ref=e1175]:
              - img "Du Lịch Đà Lạt Mộng Mơ - Trải nghiệm Cung Điện Di Động Thành Bưởi" [ref=e1176]
              - generic [ref=e1177]: HOT DEAL
            - generic [ref=e1178]:
              - heading "Du Lịch Đà Lạt Mộng Mơ - Trải nghiệm Cung Điện Di Động Thành Bưởi" [level=4] [ref=e1179]
              - generic [ref=e1180]: Xem chi tiết ưu đãi
          - generic [ref=e1183] [cursor=pointer]:
            - generic [ref=e1184]:
              - img "Khám Phá Biển Xanh Nha Trang - FUTA Bus Lines đồng hành cùng bạn" [ref=e1185]
              - generic [ref=e1186]: HOT DEAL
            - generic [ref=e1187]:
              - heading "Khám Phá Biển Xanh Nha Trang - FUTA Bus Lines đồng hành cùng bạn" [level=4] [ref=e1188]
              - generic [ref=e1189]: Xem chi tiết ưu đãi
          - generic [ref=e1192] [cursor=pointer]:
            - generic [ref=e1193]:
              - img "Ưu đãi Đặt Vé Xe Tết 2027 - Hoàn tiền 10% qua Cổng PayOS" [ref=e1194]
              - generic [ref=e1195]: HOT DEAL
            - generic [ref=e1196]:
              - heading "Ưu đãi Đặt Vé Xe Tết 2027 - Hoàn tiền 10% qua Cổng PayOS" [level=4] [ref=e1197]
              - generic [ref=e1198]: Xem chi tiết ưu đãi
          - generic [ref=e1201] [cursor=pointer]:
            - generic [ref=e1202]:
              - img "Cung Đường Di Sản Miền Trung - Đà Nẵng, Huế, Hội An trọn gói" [ref=e1203]
              - generic [ref=e1204]: HOT DEAL
            - generic [ref=e1205]:
              - heading "Cung Đường Di Sản Miền Trung - Đà Nẵng, Huế, Hội An trọn gói" [level=4] [ref=e1206]
              - generic [ref=e1207]: Xem chi tiết ưu đãi
          - generic [ref=e1210] [cursor=pointer]:
            - generic [ref=e1211]:
              - img "Hè Sôi Động Vũng Tàu - Đón tận nơi chỉ từ 160.000đ cùng Hoa Mai Limousine" [ref=e1212]
              - generic [ref=e1213]: HOT DEAL
            - generic [ref=e1214]:
              - heading "Hè Sôi Động Vũng Tàu - Đón tận nơi chỉ từ 160.000đ cùng Hoa Mai Limousine" [level=4] [ref=e1215]
              - generic [ref=e1216]: Xem chi tiết ưu đãi
          - generic [ref=e1219] [cursor=pointer]:
            - generic [ref=e1220]:
              - img "Flash Sale Thứ Ba Vui Vẻ - Giảm 50K cho mọi chuyến đi" [ref=e1221]
              - generic [ref=e1222]: HOT DEAL
            - generic [ref=e1223]:
              - heading "Flash Sale Thứ Ba Vui Vẻ - Giảm 50K cho mọi chuyến đi" [level=4] [ref=e1224]
              - generic [ref=e1225]: Xem chi tiết ưu đãi
          - generic [ref=e1228] [cursor=pointer]:
            - generic [ref=e1229]:
              - img "Ưu đãi Khách Mới - Nhập WELCOME50 nhận ngay voucher 50.000đ" [ref=e1230]
              - generic [ref=e1231]: HOT DEAL
            - generic [ref=e1232]:
              - heading "Ưu đãi Khách Mới - Nhập WELCOME50 nhận ngay voucher 50.000đ" [level=4] [ref=e1233]
              - generic [ref=e1234]: Xem chi tiết ưu đãi
          - generic [ref=e1237] [cursor=pointer]:
            - generic [ref=e1238]:
              - img "Đồng hành Mùa Thi & Nhập Học Sinh Viên - Trợ giá vé 15%" [ref=e1239]
              - generic [ref=e1240]: HOT DEAL
            - generic [ref=e1241]:
              - heading "Đồng hành Mùa Thi & Nhập Học Sinh Viên - Trợ giá vé 15%" [level=4] [ref=e1242]
              - generic [ref=e1243]: Xem chi tiết ưu đãi
          - generic [ref=e1246] [cursor=pointer]:
            - generic [ref=e1247]:
              - img "Liên kết Thẻ Ngân Hàng MB Bank - Quét PayOS VietQR giảm ngay 30K" [ref=e1248]
              - generic [ref=e1249]: HOT DEAL
            - generic [ref=e1250]:
              - heading "Liên kết Thẻ Ngân Hàng MB Bank - Quét PayOS VietQR giảm ngay 30K" [level=4] [ref=e1251]
              - generic [ref=e1252]: Xem chi tiết ưu đãi
      - generic [ref=e1255]:
        - generic [ref=e1256]:
          - heading "Du lịch Sapa" [level=2] [ref=e1257]
          - paragraph [ref=e1258]: Cẩm nang khám phá xứ sở sương mù, săn mây Fansipan và trải nghiệm văn hóa Tây Bắc
        - generic [ref=e1259]:
          - generic [ref=e1260] [cursor=pointer]:
            - img "Mệt mỏi tới Sa Pa... Giảm đến 100K khi đặt vé xe phòng VIP cabin đôi" [ref=e1261]
            - generic [ref=e1262]:
              - generic [ref=e1263]:
                - generic [ref=e1264]: Ưu đãi
                - generic [ref=e1265]: 3 ưu đãi
              - paragraph [ref=e1266]: Mệt mỏi tới Sa Pa... Giảm đến 100K khi đặt vé xe phòng VIP cabin đôi
          - generic [ref=e1267] [cursor=pointer]:
            - 'img "Hành trình đưa bạn đến Phố Sương Sa Pa: Top 5 xe Limousine cabin phòng riêng" [ref=e1268]'
            - generic [ref=e1269]:
              - generic [ref=e1270]:
                - generic [ref=e1271]: Phương tiện
                - generic [ref=e1272]: 4 bài viết
              - paragraph [ref=e1273]: "Hành trình đưa bạn đến Phố Sương Sa Pa: Top 5 xe Limousine cabin phòng riêng"
          - generic [ref=e1274] [cursor=pointer]:
            - img "Kinh nghiệm khám phá Sa Pa mùa lúa chín, săn mây nóc nhà Đông Dương Fansipan" [ref=e1275]
            - generic [ref=e1276]:
              - generic [ref=e1277]:
                - generic [ref=e1278]: Kinh nghiệm du lịch
                - generic [ref=e1279]: 8 bài viết
              - paragraph [ref=e1280]: Kinh nghiệm khám phá Sa Pa mùa lúa chín, săn mây nóc nhà Đông Dương Fansipan
      - generic [ref=e1281]:
        - generic [ref=e1282]:
          - heading "Cuộc thi sáng tạo Go with TravelEasy" [level=2] [ref=e1283]
          - paragraph [ref=e1284]: Chia sẻ khoảnh khắc du lịch vi vu cùng TravelEasy và rinh giải thưởng hấp dẫn
        - generic [ref=e1285]:
          - generic [ref=e1286] [cursor=pointer]:
            - img "Nhận thưởng hàng chục triệu đồng khi tham gia \"Go with TravelEasy\"" [ref=e1288]
            - generic [ref=e1289]:
              - text: CUỘC THI HOT
              - heading "Nhận thưởng hàng chục triệu đồng khi tham gia \"Go with TravelEasy\"" [level=4] [ref=e1290]
          - generic [ref=e1291] [cursor=pointer]:
            - img "Gia hạn thời gian nộp bài dự thi Go with TravelEasy đến hết quý 4" [ref=e1293]
            - generic [ref=e1294]:
              - text: THÔNG BÁO
              - heading "Gia hạn thời gian nộp bài dự thi Go with TravelEasy đến hết quý 4" [level=4] [ref=e1295]
          - generic [ref=e1296] [cursor=pointer]:
            - img "Thể lệ cuộc thi sáng tạo nội dung du lịch Go with TravelEasy 2026" [ref=e1298]
            - generic [ref=e1299]:
              - text: HƯỚNG DẪN
              - heading "Thể lệ cuộc thi sáng tạo nội dung du lịch Go with TravelEasy 2026" [level=4] [ref=e1300]
          - generic [ref=e1301] [cursor=pointer]:
            - img "Cơ cấu giải thưởng & Tiêu chí chấm điểm các tác phẩm xuất sắc" [ref=e1303]
            - generic [ref=e1304]:
              - text: GIẢI THƯỞNG
              - heading "Cơ cấu giải thưởng & Tiêu chí chấm điểm các tác phẩm xuất sắc" [level=4] [ref=e1305]
      - generic [ref=e1306]:
        - generic [ref=e1307]:
          - heading "Ưu đãi thanh toán online" [level=2] [ref=e1308]
          - paragraph [ref=e1309]: Tiết kiệm hơn khi thanh toán vé trực tuyến qua ví điện tử và ngân hàng
        - generic [ref=e1310]:
          - generic [ref=e1311] [cursor=pointer]:
            - generic [ref=e1312]:
              - text: ShopeePay
              - heading "Giảm đến 50K khi thanh toán bằng ví ShopeePay" [level=4] [ref=e1313]
            - generic [ref=e1314]:
              - generic [ref=e1315]: Áp dụng ngay khi thanh toán
              - generic [ref=e1316]: GIẢM 50K
          - generic [ref=e1317] [cursor=pointer]:
            - generic [ref=e1318]:
              - text: VNPAY-QR
              - heading "Giảm đến 50K khi thanh toán dịch vụ TravelEasy bằng VNPAY-QR" [level=4] [ref=e1319]
            - generic [ref=e1320]:
              - generic [ref=e1321]: Áp dụng ngay khi thanh toán
              - generic [ref=e1322]: VNPAY 50K
          - generic [ref=e1323] [cursor=pointer]:
            - generic [ref=e1324]:
              - text: ZaloPay
              - heading "Giảm đến 50K khi thanh toán TravelEasy bằng ví Zalopay" [level=4] [ref=e1325]
            - generic [ref=e1326]:
              - generic [ref=e1327]: Áp dụng ngay khi thanh toán
              - generic [ref=e1328]: ZALOPAY 50K
          - generic [ref=e1329] [cursor=pointer]:
            - generic [ref=e1330]:
              - text: MoMo
              - heading "Giảm 20K khi thanh toán vé xe nhanh chóng bằng ví MoMo" [level=4] [ref=e1331]
            - generic [ref=e1332]:
              - generic [ref=e1333]: Áp dụng ngay khi thanh toán
              - generic [ref=e1334]: MOMO 20K
      - generic [ref=e1335]:
        - generic [ref=e1336]:
          - heading "Ưu đãi từ đối tác khác" [level=2] [ref=e1337]
          - paragraph [ref=e1338]: Đặc quyền từ mạng lưới đối tác Grab, Green SM, MOOVTEK và các khu nghỉ dưỡng
        - generic [ref=e1339]:
          - generic [ref=e1340] [cursor=pointer]:
            - generic [ref=e1341]:
              - generic [ref=e1342]:
                - generic [ref=e1343]: MOOVTEK
                - generic [ref=e1344]: GIẢM 30%
              - heading "Giảm đến 30% khi đặt xe công nghệ MOOVTEK dành cho khách hàng TravelEasy" [level=4] [ref=e1345]
              - paragraph [ref=e1346]: Tiễn thẳng bến xe - Đặt ngay khởi trễ
            - generic [ref=e1347]: Nhận mã ngay
          - generic [ref=e1350] [cursor=pointer]:
            - generic [ref=e1351]:
              - generic [ref=e1352]:
                - generic [ref=e1353]: Grab
                - generic [ref=e1354]: GIẢM 20%
              - heading "Giảm 20% khi đặt dịch vụ GrabBike/GrabCar di chuyển ra bến xe" [level=4] [ref=e1355]
              - paragraph [ref=e1356]: Có Grab đón đưa mọi nẻo đường
            - generic [ref=e1357]: Nhận mã ngay
          - generic [ref=e1360] [cursor=pointer]:
            - generic [ref=e1361]:
              - generic [ref=e1362]:
                - generic [ref=e1363]: Green SM
                - generic [ref=e1364]: ƯU ĐÃI 20%
              - heading "Giảm đến 20% khi sử dụng dịch vụ taxi điện Green SM cho khách TravelEasy" [level=4] [ref=e1365]
              - paragraph [ref=e1366]: Trọn vẹn một hành trình xanh
            - generic [ref=e1367]: Nhận mã ngay
          - generic [ref=e1370] [cursor=pointer]:
            - generic [ref=e1371]:
              - generic [ref=e1372]:
                - generic [ref=e1373]: Radisson Resort
                - generic [ref=e1374]: GIẢM 15%
              - heading "Giảm 15% dịch vụ Spa tại Radisson Resort Mũi Né dành cho khách hàng" [level=4] [ref=e1375]
              - paragraph [ref=e1376]: Thư giãn tuyệt đỉnh sau chuyến xe đường dài
            - generic [ref=e1377]: Nhận mã ngay
      - generic [ref=e1380]:
        - generic [ref=e1381]:
          - heading "TravelEasy có gì mới?" [level=2] [ref=e1382]
          - paragraph [ref=e1383]: Cập nhật các tính năng và dự án ý nghĩa mới nhất từ nền tảng
        - generic [ref=e1384]:
          - generic [ref=e1385] [cursor=pointer]:
            - generic [ref=e1386]:
              - generic [ref=e1387]:
                - generic [ref=e1388]: TÍNH NĂNG MỚI
                - generic [ref=e1389]: Tháng 10/2026
              - heading "TravelEasy chính thức hỗ trợ phương thức thanh toán tiện lợi Apple Pay" [level=4] [ref=e1390]
            - generic [ref=e1391]: Tìm hiểu thêm →
          - generic [ref=e1392] [cursor=pointer]:
            - generic [ref=e1393]:
              - generic [ref=e1394]:
                - generic [ref=e1395]: CỘNG ĐỒNG
                - generic [ref=e1396]: Xuân 2027
              - heading "Quỹ \"Chuyến Xe Yêu Thương\" - Trao hàng nghìn vé xe Tết đoàn viên cho người khó khăn" [level=4] [ref=e1397]
            - generic [ref=e1398]: Tìm hiểu thêm →
          - generic [ref=e1399] [cursor=pointer]:
            - generic [ref=e1400]:
              - generic [ref=e1401]:
                - generic [ref=e1402]: CÔNG NGHỆ
                - generic [ref=e1403]: Tháng 10/2026
              - heading "Chủ động và an tâm hơn trong mọi hành trình với tính năng định vị theo dõi xe trực tiếp" [level=4] [ref=e1404]
            - generic [ref=e1405]: Tìm hiểu thêm →
          - generic [ref=e1406] [cursor=pointer]:
            - generic [ref=e1407]:
              - generic [ref=e1408]:
                - generic [ref=e1409]: DỊCH VỤ MỚI
                - generic [ref=e1410]: Tháng 10/2026
              - heading "\"Bảo hiểm chuyến đi\" chính thức ra mắt - An tâm di chuyển với mức bảo hiểm tới 400 triệu" [level=4] [ref=e1411]
            - generic [ref=e1412]: Tìm hiểu thêm →
      - generic [ref=e1413]:
        - heading "Mạng lưới bến xe và nhà xe đối tác hàng đầu" [level=3] [ref=e1414]
        - paragraph [ref=e1415]: TravelEasy kết nối trực tiếp với các bến xe trung tâm tại các thành phố lớn cùng hơn 100+ nhà xe uy tín trên khắp mọi miền Tổ quốc.
        - generic [ref=e1416]:
          - generic [ref=e1417]:
            - heading "Bến xe phía Nam" [level=4] [ref=e1418]
            - list [ref=e1419]:
              - listitem [ref=e1420]: • Bến xe Miền Đông (Bình Thạnh)
              - listitem [ref=e1421]: • Bến xe Miền Tây (Bình Tân)
              - listitem [ref=e1422]: • Bến xe An Sương (Hóc Môn)
              - listitem [ref=e1423]: • Bến xe Vũng Tàu
              - listitem [ref=e1424]: • Bến xe Trung tâm Cần Thơ
          - generic [ref=e1425]:
            - heading "Bến xe phía Bắc" [level=4] [ref=e1426]
            - list [ref=e1427]:
              - listitem [ref=e1428]: • Bến xe Mỹ Đình (Hà Nội)
              - listitem [ref=e1429]: • Bến xe Giáp Bát (Hà Nội)
              - listitem [ref=e1430]: • Bến xe Nước Ngầm (Hà Nội)
              - listitem [ref=e1431]: • Bến xe Cầu Rào (Hải Phòng)
              - listitem [ref=e1432]: • Bến xe Sa Pa (Lào Cai)
          - generic [ref=e1433]:
            - heading "Bến xe miền Trung & Tây Nguyên" [level=4] [ref=e1434]
            - list [ref=e1435]:
              - listitem [ref=e1436]: • Bến xe Liên tỉnh Đà Lạt
              - listitem [ref=e1437]: • Bến xe Trung tâm Đà Nẵng
              - listitem [ref=e1438]: • Bến xe Phía Nam Nha Trang
              - listitem [ref=e1439]: • Bến xe Quy Nhơn
              - listitem [ref=e1440]: • Bến xe Phía Bắc TP. Huế
          - generic [ref=e1441]:
            - heading "Nhà xe tiêu biểu" [level=4] [ref=e1442]
            - list [ref=e1443]:
              - listitem [ref=e1444]: • TravelEasy Express Bus
              - listitem [ref=e1445]: • Phương Trang (FUTA Bus Lines)
              - listitem [ref=e1446]: • Thành Bưởi Limousine
              - listitem [ref=e1447]: • Sao Việt Express
              - listitem [ref=e1448]: • Xe Khách Hoa Mai Vũng Tàu
  - generic [ref=e1449]:
    - generic [ref=e1450] [cursor=pointer]: Cần trợ lý AI tư vấn chuyến đi?
    - button "Hỏi Trợ Lý AI 24/7" [ref=e1455] [cursor=pointer]:
      - generic [ref=e1460]: Hỏi Trợ Lý AI
      - generic [ref=e1461]: 24/7
  - contentinfo [ref=e1462]:
    - generic [ref=e1463]:
      - generic [ref=e1464]:
        - generic [ref=e1465]: TravelEasy.vn
        - paragraph [ref=e1472]: Nền tảng công nghệ kết nối hành khách và các thương hiệu nhà xe uy tín toàn quốc. Đặt vé trực tuyến, chọn vị trí giường nằm 2 tầng trực quan, cam kết giữ chỗ 100%.
        - generic [ref=e1473]:
          - generic [ref=e1474]:
            - text: "Hotline CSKH 24/7:"
            - strong [ref=e1479]: 1900 6868
          - generic [ref=e1480]:
            - text: "Email hỗ trợ:"
            - strong [ref=e1484]: support@traveleasy.vn
      - generic [ref=e1485]:
        - heading "Tuyến Đường Phổ Biến" [level=4] [ref=e1486]
        - list [ref=e1487]:
          - listitem [ref=e1488]:
            - link "→ Xe đi Đà Lạt từ Sài Gòn" [ref=e1489] [cursor=pointer]:
              - /url: /search?origin=TP.+H%E1%BB%93+Ch%C3%AD+Minh&destination=%C4%90%C3%A0+L%E1%BA%A1t
          - listitem [ref=e1490]:
            - link "→ Xe đi Nha Trang từ Sài Gòn" [ref=e1491] [cursor=pointer]:
              - /url: /search?origin=TP.+H%E1%BB%93+Ch%C3%AD+Minh&destination=Nha+Trang
          - listitem [ref=e1492]:
            - link "→ Xe đi Sa Pa từ Hà Nội" [ref=e1493] [cursor=pointer]:
              - /url: /search?origin=H%C3%A0+N%E1%BB%99i&destination=Sa+Pa
          - listitem [ref=e1494]:
            - link "→ Xe đi Hải Phòng từ Hà Nội" [ref=e1495] [cursor=pointer]:
              - /url: /search?origin=H%C3%A0+N%E1%BB%99i&destination=H%E1%BA%A3i+Ph%C3%B2ng
          - listitem [ref=e1496]:
            - link "→ Xe đi Vũng Tàu từ Sài Gòn" [ref=e1497] [cursor=pointer]:
              - /url: /search?origin=TP.+H%E1%BB%93+Ch%C3%AD+Minh&destination=V%C5%A9ng+T%C3%A0u
      - generic [ref=e1498]:
        - heading "Đối Tác Nhà Xe" [level=4] [ref=e1499]
        - list [ref=e1500]:
          - listitem [ref=e1501]:
            - link "→ TravelEasy Express Lines" [ref=e1502] [cursor=pointer]:
              - /url: /search?origin=TP.+H%E1%BB%93+Ch%C3%AD+Minh&destination=%C4%90%C3%A0+L%E1%BA%A1t
          - listitem [ref=e1503]:
            - link "→ Sao Việt Express" [ref=e1504] [cursor=pointer]:
              - /url: /search?origin=H%C3%A0+N%E1%BB%99i&destination=Sa+Pa
          - listitem [ref=e1505]:
            - link "→ Phương Trang FUTA Bus Lines" [ref=e1506] [cursor=pointer]:
              - /url: /search?origin=TP.+H%E1%BB%93+Ch%C3%AD+Minh&destination=Nha+Trang
          - listitem [ref=e1507]:
            - link "🤝 Hợp tác mở bán vé cùng TravelEasy" [ref=e1508] [cursor=pointer]:
              - /url: /partner
          - listitem [ref=e1509]:
            - link "→ Cổng đăng nhập đối tác nhà xe" [ref=e1510] [cursor=pointer]:
              - /url: /company/login
      - generic [ref=e1511]:
        - heading "Chính Sách & Hỗ Trợ" [level=4] [ref=e1512]
        - list [ref=e1513]:
          - listitem [ref=e1514]:
            - link "→ Chính sách hoàn / hủy vé 24/7" [ref=e1515] [cursor=pointer]:
              - /url: /policy?tab=cancellation
          - listitem [ref=e1516]:
            - link "→ Cam kết giữ 100% chỗ (Hoàn 150%)" [ref=e1517] [cursor=pointer]:
              - /url: /policy?tab=guarantee
          - listitem [ref=e1518]:
            - link "→ Quy chế hoạt động sàn vé xe" [ref=e1519] [cursor=pointer]:
              - /url: /policy?tab=terms
          - listitem [ref=e1520]:
            - link "→ Bảo mật & An toàn thanh toán" [ref=e1521] [cursor=pointer]:
              - /url: /policy?tab=privacy
          - listitem [ref=e1522]:
            - link "→ Câu hỏi thường gặp (FAQ)" [ref=e1523] [cursor=pointer]:
              - /url: /policy?tab=faq
    - generic [ref=e1524]:
      - generic [ref=e1525]: TravelEasy Platform © 2026. Bản quyền thuộc về Nhóm 7 — Khóa đào tạo Rikkei Pre-OJT.
      - generic [ref=e1526]:
        - link "Tra cứu vé điện tử" [ref=e1527] [cursor=pointer]:
          - /url: /lookup
        - link "Vé của tôi" [ref=e1528] [cursor=pointer]:
          - /url: /my-tickets
        - link "Hồ sơ cá nhân" [ref=e1529] [cursor=pointer]:
          - /url: /profile
  - navigation [ref=e1530]:
    - link "Trang chủ" [ref=e1531] [cursor=pointer]:
      - /url: /
    - link "Đặt vé" [ref=e1537] [cursor=pointer]:
      - /url: /search
    - link "Vé của tôi" [ref=e1543] [cursor=pointer]:
      - /url: /my-tickets
    - link "Quét QR" [ref=e1548] [cursor=pointer]:
      - /url: /scanner
    - link "Đăng nhập" [ref=e1557] [cursor=pointer]:
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