package com.traveleasy.service.ai;

import com.traveleasy.dto.ai.AiChatRequest;
import com.traveleasy.dto.ai.AiChatResponse;
import com.traveleasy.repository.RouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiService {

    private final RouteRepository routeRepository;

    public AiChatResponse getTravelAdvice(AiChatRequest request) {
        String query = request.getMessage() != null ? request.getMessage().toLowerCase() : "";
        String contextCity = request.getContextCity() != null ? request.getContextCity().toLowerCase() : "";
        String reply;
        String suggestedRoute = null;

        if (query.contains("huỷ vé") || query.contains("hủy vé") || query.contains("đổi vé") || query.contains("hoàn tiền")) {
            reply = """
                    Chính sách hủy vé TravelEasy: Bạn có thể hủy vé trước giờ khởi hành ít nhất 24 giờ để được hoàn 100% tiền qua mã vé hoặc phương thức đã thanh toán. Vui lòng vào mục 'Tra cứu vé' để thực hiện.

                    ### 🛡️ CHI TIẾT CHÍNH SÁCH HOÀN / HỦY VÉ & ĐỔI CHUYẾN
                    * **Hủy trước 24 giờ**: Hoàn **90% - 100%** tiền vé tùy theo quy định từng nhà xe.
                    * **Hủy từ 12 - 24 giờ trước giờ chạy**: Hoàn **70%** giá vé (phí xử lý 30%).
                    * **Hủy dưới 12 giờ trước giờ chạy**: Không hỗ trợ hoàn tiền do xe đã chốt danh sách xuất bến.
                    * **Chính sách đổi ngày / đổi chuyến (PBD-02)**: Miễn phí đổi chuyến trước giờ khởi hành tối thiểu **2 tiếng**.
                    * **Cam kết 150%**: Nếu nhà xe bỏ khách hoặc không cung cấp dịch vụ, TravelEasy bồi thường hoàn tiền **150%**.

                    👉 Bạn có thể vào mục **"Vé Của Tôi"** hoặc **"Tra Cứu Vé"** trên thanh menu để thao tác trực tuyến chỉ với 1 click!
                    """;
        } else if (query.contains("chào") || query.contains("hello") || query.equals("hi") || query.trim().isEmpty()) {
            reply = """
                    Chào bạn! Tôi là trợ lý AI TravelEasy. Tôi có thể hỗ trợ bạn tìm chuyến xe khách giá rẻ, tư vấn chọn vị trí ghế chống say xe, hướng dẫn điểm đón trả hoặc chính sách đặt vé của các nhà xe!

                    ✨ **Gợi ý bạn có thể hỏi tôi:**
                    • *"Tư vấn chuyến đi Đà Lạt 3 ngày 2 đêm"*
                    • *"Nên chọn ghế tầng mấy để không bị say xe?"*
                    • *"Hôm nay có những mã giảm giá nào?"*
                    • *"Chính sách hoàn hủy vé và đổi chuyến ra sao?"*
                    • *"Thanh toán bằng VietQR PayOS như thế nào?"*
                    """;
        } else if (query.contains("say xe") || query.contains("chọn ghế") || query.contains("vị trí ghế") || query.contains("tầng 1") || query.contains("tầng 2") || query.contains("giường nằm")) {
            reply = """
                    ### 💺 MẸO CHỌN VỊ TRÍ GHẾ NGỒI / GIƯỜNG NẰM CHỐNG SAY XE TỐI ƯU
                    * **Vị trí tốt nhất để chống say xe**:
                      * ✅ **Tầng 1 (Dưới) - Dãy giữa (A02, A03, A04, A05)**: Nằm ở trung tâm trọng tâm xe, biên độ rung lắc thấp nhất khi xe vào cua đèo dốc hoặc qua ổ gà. Cực kỳ êm ái cho người già, trẻ nhỏ và người nhạy cảm với mùi xe.
                    * **Vị trí ngắm cảnh & thoáng mát riêng tư**:
                      * 🌟 **Tầng 2 (Trên) - Dãy cửa sổ (B01, B03, B04)**: Tầm nhìn rộng thoáng, không khí mát mẻ, ít bị ảnh hưởng bởi lối đi lại. Rất thích hợp cho các bạn trẻ thích ngắm cảnh đêm hoặc chụp ảnh.
                    * **Vị trí nên hạn chế nếu dễ bị say xe**:
                      * ❌ Các ghế sát đuôi xe vì độ nhún nảy mạnh nhất khi qua gờ giảm tốc.

                    💡 *Mẹo TravelEasy*: Hệ thống cho phép bạn **chọn trực tiếp số ghế** trên sơ đồ xe 2 tầng thời gian thực và cam kết giữ chỗ độc quyền 10 phút!
                    """;
        } else if (query.contains("thanh toán") || query.contains("payos") || query.contains("vietqr") || query.contains("vnpay") || query.contains("chuyển khoản") || query.contains("ngân hàng")) {
            reply = """
                    ### 💳 HƯỚNG DẪN THANH TOÁN VÉ XE TRỰC TUYẾN TẠI TRAVELEASY
                    TravelEasy hỗ trợ 3 phương thức thanh toán an toàn, bảo mật tiêu chuẩn cao:

                    1. ⚡ **Cổng PayOS — Quét mã VietQR Napas 24/7 (MB Bank)**:
                       * Hỗ trợ quét mã qua ứng dụng của **tất cả ngân hàng Việt Nam** (Vietcombank, MB, Techcombank, BIDV, ACB, VPBank,...) và ví điện tử.
                       * **Đặc quyền**: Hệ thống Webhook tự động kích hoạt vé trong **3 giây**, không cần chụp màn hình chuyển khoản hay chờ nhân viên duyệt.
                    2. 💳 **Cổng thanh toán VNPAY-QR**:
                       * Hỗ trợ thẻ ATM nội địa Napas, Internet Banking và thẻ quốc tế Visa / MasterCard / JCB.
                    3. 💵 **Thanh toán tiền mặt khi lên xe (Cash on Board)**:
                       * Khách hàng thanh toán trực tiếp cho phụ xe hoặc tại văn phòng nhà xe khi làm thủ tục lên xe.

                    🔒 *Bảo chứng an toàn*: Vé điện tử kèm mã QR tra cứu sẽ được phát hành ngay lập tức về Email và số điện thoại của bạn!
                    """;
        } else if (query.contains("mã giảm") || query.contains("voucher") || query.contains("khuyến mãi") || query.contains("ưu đãi") || query.contains("giảm giá")) {
            reply = """
                    ### 🎟️ DANH SÁCH MÃ GIẢM GIÁ & VOUCHER KHẢ DỤNG HÔM NAY
                    * 🌟 **SAPA20**: Giảm **20%** vé xe Limousine cabin VIP tuyến Sa Pa.
                    * 🏔️ **DALATVIP**: Giảm ngay **50.000đ** cho tuyến Sài Gòn ➔ Đà Lạt phòng nằm VIP.
                    * 🎁 **WELCOME50**: Giảm **15%** (tối đa 50.000đ) cho khách hàng lần đầu đặt vé trên sàn.
                    * ⚡ **PAYOS50**: Giảm ngay **30.000đ** khi thanh toán quét mã VietQR Napas MB Bank.

                    👉 Bạn chỉ cần bấm **[Sao chép mã]** ở danh sách voucher bên dưới và dán vào ô Mã giảm giá tại bước Thanh Toán để được trừ tiền trực tiếp!
                    """;
        } else if (query.contains("hành lý") || query.contains("thú cưng") || query.contains("chó mèo") || query.contains("trẻ em") || query.contains("vali")) {
            reply = """
                    ### 🧳 QUY ĐỊNH VỀ HÀNH LÝ, TRẺ EM & VẬN CHUYỂN THÚ CƯNG
                    * 📦 **Hành lý xách tay & Ký gửi**:
                      * Mỗi vé được miễn phí **20kg** hành lý ký gửi dưới hầm xe và 1 balo/túi xách nhỏ mang lên khoang ghế.
                      * Nếu mang theo xe máy, xe đạp hoặc vali ngoại cỡ, bạn vui lòng liên hệ nhà xe trước 2 tiếng để sắp xếp khoang gửi.
                    * 👶 **Chính sách đối với trẻ em**:
                      * Trẻ em dưới **5 tuổi** hoặc cao dưới **100cm** ngồi/nằm chung với người lớn được **MIỄN PHÍ VÉ**.
                      * Trẻ em từ 5 tuổi trở lên hoặc cần nằm giường riêng tính vé như người lớn.
                    * 🐾 **Vận chuyển thú cưng (Chó, Mèo)**:
                      * Thú cưng bắt buộc phải có lồng chuồng thông thoáng và được vận chuyển dưới hầm xe có khe thông khí theo quy định an toàn giao thông đường bộ.
                    """;
        } else if (query.contains("đà nẵng") || query.contains("da nang") || query.contains("quy nhơn") || query.contains("quy nhon")) {
            suggestedRoute = "Đà Nẵng -> Quy Nhơn";
            reply = """
                    ### 🌊 PHẦN 1: TÓM TẮT NHANH ĐIỂM ĐẾN (QUY NHƠN - ĐÀ NẴNG)
                    * **Thời tiết & Trang phục**: Khí hậu miền Trung nắng ráo, biển xanh cát vàng từ tháng 3 đến tháng 10. Mang theo trang phục biển, kính râm, kem chống nắng và mũ rộng vành.
                    * **Di chuyển**: Thuê xe máy vi vu cung đường biển Kỳ Co - Eo Gió hoặc taxi nội thành.

                    ---

                    ### 📍 PHẦN 2: LỊCH TRÌNH KHUYÊN DÙNG (3 NGÀY 2 ĐÊM)
                    * **Ngày 1**: Đón bình minh Kỳ Co, lặn ngắm san hô Bãi Dứa, ăn trưa hải sản Nhơn Lý. Chiều check-in Eo Gió và Tịnh Xá Ngọc Hòa.
                    * **Ngày 2**: Tham quan Tháp Đôi Chăm Pa, Ghềnh Ráng Tiên Sa (mộ Hàn Mặc Tử, Bãi Trứng Hoàng Hậu), chiều tắm biển Quy Hòa.
                    * **Ngày 3**: Thưởng thức Bánh xèo tôm nhảy rau mầm Gia Vỹ, mua bánh ít lá gai & chả ram tôm đất làm quà.

                    ---

                    ### 🚌 PHẦN 3: GỢI Ý CHUYẾN XE KHÁCH TỐI ƯU
                    * **Khuyên chọn**: Xe Limousine giường nằm cao cấp chạy tuyến **Đà Nẵng ➔ Quy Nhơn** xuất bến lúc 08:00 sáng hoặc 14:00 chiều (mất ~6 giờ chạy đường QL1A ven biển).

                    ---

                    ### 💰 PHẦN 4: DỰ TRÙ KINH PHÍ CHO 1 NGƯỜI
                    * 🎟️ Vé xe khách khứ hồi: ~`500.000đ`
                    * 🏨 Khách sạn gần biển (2 đêm): ~`550.000đ`
                    * 🍜 Ăn uống hải sản & tour cano Kỳ Co: ~`900.000đ`
                    * 👉 **TỔNG KINH PHÍ DỰ KIẾN: ~1.950.000đ / người**
                    """;
        } else if (query.contains("đà lạt") || query.contains("da lat") || contextCity.contains("đà lạt")) {
            suggestedRoute = "TP. Hồ Chí Minh -> Đà Lạt";
            reply = """
                    ### 🌸 PHẦN 1: TÓM TẮT NHANH ĐIỂM ĐẾN (ĐÀ LẠT)
                    * **Thời tiết & Trang phục**: Nhiệt độ dao động 14°C - 23°C, se lạnh sáng sớm và ban đêm. Chuẩn bị áo len ấm, áo khoác dạ, khăn quàng và giày thể thao êm chân.
                    * **Di chuyển nội thành**: Thuê xe máy số/tay ga (120.000đ - 150.000đ/ngày) hoặc taxi công nghệ tiện lợi cho nhóm bạn/gia đình.

                    ---

                    ### 📍 PHẦN 2: LỊCH TRÌNH MẪU CHI TIẾT (3 NGÀY 2 ĐÊM)
                    * **Ngày 1 (Săn Mây & Check-in View Thung Lũng)**:
                      * `05:00` - Đón bình minh săn mây Cầu Đất Panorama. *(Mẹo: Có mặt trước 05:30 để đón biển mây bồng bềnh nhất)*
                      * `07:30` - Thưởng thức Bánh mì xíu mại Hoàng Diệu (Ăn sáng).
                      * `09:30` - Check-in Ga Đà Lạt cổ kính & Dinh 1 Bảo Đại.
                      * `12:00` - Ăn trưa Lẩu gà lá é Tao Ngộ (Đường 3/4).
                      * `15:30` - Chiêm ngưỡng Vườn hoa Cẩm Tú Cầu Trại Mát & Cà phê Túi Mơ To.
                      * `19:00` - Dạo Chợ Đêm Đà Lạt, thưởng thức bánh tráng nướng & sữa đậu nành nóng.
                    * **Ngày 2 (Văn Hóa, Rừng Thông & Cung Đường Đèo)**:
                      * `08:00` - Tham quan Thiền Viện Trúc Lâm & Đi cáp treo ngắm Hồ Tuyền Lâm.
                      * `11:30` - Ăn trưa Cơm lam gà nướng Thung Lũng Xanh.
                      * `14:30` - Check-in Đèo Prenn & Rừng thông đồi Đa Phú.
                      * `18:30` - Tiệc nướng BBQ thung lũng đèn lãng mạn.
                    * **Ngày 3 (Mua Sắm Đặc Sản & Tạm Biệt Đà Lạt)**:
                      * `08:00` - Cafe vợt Tùng cổ kính khu Hòa Bình & Ăn bánh ướt lòng gà Long.
                      * `10:00` - Mua mứt dâu tây, hoa quả sấy và atiso làm quà tại L’angfarm.

                    ---

                    ### 🚌 PHẦN 3: GỢI Ý CHUYẾN XE KHÁCH TỐI ƯU (SMART TRANSPORT BRIDGE)
                    * **Khuyên chọn**: Chuyến Limousine phòng nằm VIP xuất bến lúc **22:30 - 23:00 tối thứ Sáu** từ TP. Hồ Chí Minh (TravelEasy Express / Thành Bưởi).
                    * **Lý do**: Bạn ngủ trọn một giấc trên xe, 05:00 sáng thứ Bảy vừa đến nơi nhận xe máy đi săn mây Cầu Đất ngay. Vừa tiết kiệm 1 đêm khách sạn, vừa tận dụng tối đa thời gian khám phá!

                    ---

                    ### 💰 PHẦN 4: ƯỚC TÍNH KINH PHÍ DỰ TRÙ (CHO 1 NGƯỜI)
                    * 🎟️ Vé xe khách khứ hồi (Limousine): ~`700.000đ`
                    * 🏨 Khách sạn / Homestay view đồi (2 đêm): ~`600.000đ`
                    * 🛵 Thuê xe máy & xăng xe (3 ngày): ~`300.000đ`
                    * 🍜 Ăn uống & vé tham quan: ~`900.000đ`
                    * 👉 **TỔNG KINH PHÍ DỰ KIẾN: ~2.500.000đ / người**
                    """;
        } else if (query.contains("sa pa") || query.contains("sapa") || contextCity.contains("sa pa")) {
            suggestedRoute = "Hà Nội -> Sa Pa";
            reply = """
                    ### 🏔️ PHẦN 1: TÓM TẮT NHANH ĐIỂM ĐẾN (SA PA)
                    * **Thời tiết & Trang phục**: Khí hậu vùng núi cao, nhiệt độ 10°C - 18°C, có sương mù dày. Bắt buộc mang áo phao dày, áo giữ nhiệt, khăn len và giày leo núi chống trơn trượt.
                    * **Di chuyển nội thành**: Thuê xe máy khám phá các bản làng hoặc xe điện nội thị trung tâm thị trấn Sa Pa.

                    ---

                    ### 📍 PHẦN 2: LỊCH TRÌNH MẪU CHI TIẾT (3 NGÀY 2 ĐÊM)
                    * **Ngày 1 (Chinh Phục Nóc Nhà Đông Dương Fansipan)**:
                      * `06:30` - Đến Sa Pa, ăn sáng Phở cốn sủi Quán Ông Há & cất hành lý.
                      * `08:30` - Trải nghiệm tàu hỏa leo núi Mường Hoa & Cáp treo Fansipan lên đỉnh 3.143m.
                      * `12:30` - Ăn trưa Thắng cố A Quỳnh & Lẩu cá tầm Sa Pa đặc sản.
                      * `15:00` - Dạo quanh Nhà Thờ Đá & Sun Plaza check-in kiến trúc Pháp.
                      * `18:30` - Ăn tối đồ nướng than hồng phố Cầu Mây & massage chân người Dao đỏ.
                    * **Ngày 2 (Bản Cát Cát & Cổng Trời Ô Quy Hồ)**:
                      * `08:30` - Khám phá Bản Cát Cát, thuê trang phục dân tộc H'Mông chụp ảnh bên guồng nước.
                      * `12:00` - Thưởng thức Cơm lam thịt lợn cắp nách nướng.
                      * `14:30` - Chinh phục một trong 'Tứ Đại Đỉnh Đèo' Ô Quy Hồ & Săn hoàng hôn tại Cổng Trời.
                      * `19:00` - Dạo Chợ đêm Sa Pa, mua hạt dẻ nướng và quà lưu niệm thổ cẩm.
                    * **Ngày 3 (Bản Tả Phìn & Tắm Lá Thuốc Dao Đỏ)**:
                      * `08:30` - Thăm Tu viện cổ Tả Phìn & Trải nghiệm ngâm bồn tắm lá thuốc thảo mộc Dao đỏ thư giãn.
                      * `11:30` - Mua nấm hương rừng, thịt trâu gác bếp làm quà & lên xe về Hà Nội.

                    ---

                    ### 🚌 PHẦN 3: GỢI Ý CHUYẾN XE KHÁCH TỐI ƯU (SMART TRANSPORT BRIDGE)
                    * **Khuyên chọn**: Chuyến xe Limousine Cabin đôi của **Sao Việt Express** xuất bến lúc **23:00 tối** từ Bến xe Mỹ Đình / Giải Phóng.
                    * **Lý do**: Xe chạy cao tốc Nội Bài - Lào Cai êm ái, đến Sa Pa lúc 05:30 sáng, hành khách được tiếp tục nằm nghỉ trên xe đến 06:30 rồi bắt đầu hành trình.

                    ---

                    ### 💰 PHẦN 4: ƯỚC TÍNH KINH PHÍ DỰ TRÙ (CHO 1 NGƯỜI)
                    * 🎟️ Vé xe khách khứ hồi (Cabin VIP): ~`850.000đ`
                    * 🏨 Khách sạn trung tâm (2 đêm): ~`700.000đ`
                    * 🚡 Vé cáp treo Fansipan + Tàu hỏa: ~`950.000đ`
                    * 🍜 Ăn uống đặc sản & thuê xe: ~`900.000đ`
                    * 👉 **TỔNG KINH PHÍ DỰ KIẾN: ~3.400.000đ / người**
                    """;
        } else if (query.contains("nha trang") || contextCity.contains("nha trang")) {
            suggestedRoute = "TP. Hồ Chí Minh -> Nha Trang";
            reply = """
                    ### 🌊 PHẦN 1: TÓM TẮT NHANH ĐIỂM ĐẾN (NHA TRANG)
                    * **Thời tiết & Trang phục**: Nắng vàng biển xanh quanh năm, nhiệt độ 26°C - 32°C. Chuẩn bị đồ bơi, kính râm, kem chống nắng SPF50+, nón rộng vành và dép xỏ ngón.
                    * **Di chuyển nội thành**: Xe máy, taxi hoặc cano cao tốc ra các đảo vịnh Nha Trang.

                    ---

                    ### 📍 PHẦN 2: LỊCH TRÌNH MẪU CHI TIẾT (3 NGÀY 2 ĐÊM)
                    * **Ngày 1 (Biển Bãi Dài & Foodtour Bản Địa)**:
                      * `06:30` - Đến bến xe Nha Trang, ăn sáng Bún sứa chả cá Cô Ba đường Yersin.
                      * `08:30` - Tắm biển Bãi Dài với bờ cát trắng mịn và làn nước trong vắt.
                      * `12:00` - Ăn trưa Nem nướng Đặng Văn Quyên chuẩn vị Ninh Hòa.
                      * `15:00` - Tham quan Tháp Bà Ponagar cổ kính & Tắm bùn khoáng nóng I-Resort.
                      * `18:30` - Ăn tối Hải sản tươi sống Bờ Kè Tháp Bà & Dạo Chợ Đêm Trần Phú.
                    * **Ngày 2 (Tour 3 Đảo Vịnh Nha Trang & Lặn San Hô)**:
                      * `08:00` - Đi cano ra Hòn Mun lặn ngắm san hô biển sâu.
                      * `11:30` - Ăn trưa tại Làng Chài trên bè nổi (mực nhảy, tôm hùm, cá bớp).
                      * `14:00` - Vui chơi tại Hòn Tằm (chèo SUP, tắm biển).
                      * `19:00` - Thưởng thức Bò nướng Lạc Cảnh danh tiếng.
                    * **Ngày 3 (Check-in Thành Phố & Mua Hải Sản Khô)**:
                      * `08:00` - Thăm Nhà thờ Núi Đá & Viện Hải Dương Học ngắm hàng ngàn sinh vật biển.
                      * `11:00` - Ghé Chợ Đầm mua mực một nắng, chả cá Nha Trang và nước mắm nhỉ làm quà.

                    ---

                    ### 🚌 PHẦN 3: GỢI Ý CHUYẾN XE KHÁCH TỐI ƯU (SMART TRANSPORT BRIDGE)
                    * **Khuyên chọn**: Chuyến xe Limousine 34 Phòng xuất bến lúc **22:30** từ TP. Hồ Chí Minh (Xe Khách Liên Hưng / Cúc Tùng Limousine).
                    * **Lý do**: Chạy toàn tuyến cao tốc Dầu Giây - Phan Thiết - Cam Lâm cực nhanh chỉ mất ~7 tiếng, đến nơi 05:30 sáng đón bình minh biển Trần Phú.

                    ---

                    ### 💰 PHẦN 4: ƯỚC TÍNH KINH PHÍ DỰ TRÙ (CHO 1 NGƯỜI)
                    * 🎟️ Vé xe khách khứ hồi: ~`650.000đ`
                    * 🏨 Khách sạn gần biển (2 đêm): ~`600.000đ`
                    * 🚤 Tour Cano 3 Đảo Hòn Mun - Hòn Tằm: ~`650.000đ`
                    * 🍜 Ăn uống hải sản & tham quan: ~`800.000đ`
                    * 👉 **TỔNG KINH PHÍ DỰ KIẾN: ~2.700.000đ / người**
                    """;
        } else if (query.contains("vũng tàu") || query.contains("vung tau") || contextCity.contains("vũng tàu")) {
            suggestedRoute = "TP. Hồ Chí Minh -> Vũng Tàu";
            reply = """
                    ### 🏖️ PHẦN 1: TÓM TẮT NHANH ĐIỂM ĐẾN (VŨNG TÀU)
                    * **Thời tiết & Trang phục**: Nắng ráo, gió biển lộng quanh năm. Trang phục mùa hè thoáng mát, đồ tắm biển và giày dép dễ di chuyển.
                    * **Di chuyển nội thành**: Thuê xe máy dạo cung đường biển Hạ Long - Trần Phú tuyệt đẹp.

                    ---

                    ### 📍 PHẦN 2: LỊCH TRÌNH 2 NGÀY 1 ĐÊM "CHILL CUỐI TUẦN"
                    * **Ngày 1**:
                      * `07:30` - Lên xe Limousine tại TP.HCM, 09:30 có mặt tại Vũng Tàu.
                      * `10:00` - Thưởng thức Bánh khọt Gốc Vú Sữa nóng hổi giòn rụm.
                      * `11:30` - Check-in khách sạn, nghỉ ngơi.
                      * `14:30` - Chinh phục Hải đăng Vũng Tàu, ngắm toàn cảnh thành phố biển & ăn yaourt trứng gà lòng đào Cô Tiên.
                      * `16:30` - Tắm biển Bãi Sau sóng êm.
                      * `19:00` - Ăn tối Lẩu cá đuối Út Mười & Cafe ngắm biển Sunset Lounge.
                    * **Ngày 2**:
                      * `06:30` - Ngắm bình minh Bãi Trước & ăn sáng Bánh mì xíu mại.
                      * `08:00` - Leo Tượng Chúa Kito Vua ngắm biển từ trên cao.
                      * `10:30` - Mua bánh bông lan trứng muối Gốc Cột Điện & Hải sản Chợ Xóm Lưới làm quà.
                      * `14:00` - Lên xe Limousine về lại Sài Gòn.

                    ---

                    ### 🚌 PHẦN 3: GỢI Ý CHUYẾN XE KHÁCH TỐI ƯU (SMART TRANSPORT BRIDGE)
                    * **Khuyên chọn**: Xe Khách Hoa Mai Limousine VIP 9 chỗ xuất bến lúc **07:30 sáng** (chuyến đi) và **14:30 chiều hôm sau** (chuyến về).
                    * **Lý do**: Xe đưa đón tận nơi trong nội thành Vũng Tàu, chạy cao tốc Long Thành chỉ mất đúng 2 tiếng.

                    ---

                    ### 💰 PHẦN 4: ƯỚC TÍNH KINH PHÍ DỰ TRÙ (CHO 1 NGƯỜI)
                    * 🎟️ Vé xe Limousine khứ hồi: ~`380.000đ`
                    * 🏨 Khách sạn view biển (1 đêm): ~`350.000đ`
                    * 🛵 Thuê xe máy & xăng (2 ngày): ~`180.000đ`
                    * 🍜 Ăn uống & hải sản: ~`450.000đ`
                    * 👉 **TỔNG KINH PHÍ DỰ KIẾN: ~1.360.000đ / người**
                    """;
        } else {
            reply = String.format("""
                    ### 🗺️ PHẦN 1: TÓM TẮT NHANH ĐIỂM ĐẾN (%s)
                    * **Thời tiết & Mẹo**: Khí hậu thuận lợi cho du lịch trải nghiệm. Bạn nên chuẩn bị trang phục gọn nhẹ và sạc dự phòng cho hành trình khám phá.
                    * **Di chuyển**: Xe máy hoặc taxi công nghệ thuận tiện để đi lại giữa các danh lam thắng cảnh.

                    ---

                    ### 📍 PHẦN 2: LỊCH TRÌNH KHUYÊN DÙNG
                    * **Buổi Sáng**: Khởi hành sớm, thưởng thức món ăn sáng đặc sản địa phương và check-in các thắng cảnh biểu tượng.
                    * **Buổi Trưa**: Dùng bữa tại quán ăn lâu đời và nghỉ ngơi tránh nắng gắt.
                    * **Buổi Chiều**: Thư giãn tại quán cà phê ngắm cảnh hoặc tham quan làng nghề văn hóa.
                    * **Buổi Tối**: Khám phá chợ đêm bản địa và các món ăn đường phố hấp dẫn.

                    ---

                    ### 🚌 PHẦN 3: GỢI Ý CHUYẾN XE KHÁCH TỐI ƯU
                    * **Khuyên chọn**: Đặt chuyến xe giường nằm hoặc Limousine cao cấp của TravelEasy Express khởi hành buổi sáng hoặc đêm muộn để tối ưu hóa thời gian nghỉ ngơi.

                    ---

                    ### 💰 PHẦN 4: ƯỚC TÍNH KINH PHÍ DỰ TRÙ
                    * Chi phí trung bình khoảng **1.500.000đ - 2.500.000đ / người** cho chuyến đi 2 - 3 ngày (đã bao gồm vé xe khách khứ hồi, lưu trú và ăn uống).
                    """, query.toUpperCase());
        }

        return AiChatResponse.builder()
                .reply(reply)
                .suggestedRoute(suggestedRoute)
                .build();
    }
}
