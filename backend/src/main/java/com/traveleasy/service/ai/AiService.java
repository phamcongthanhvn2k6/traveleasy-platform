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

        if (query.contains("huỷ vé") || query.contains("hủy vé") || query.contains("đổi vé")) {
            reply = "Chính sách hủy vé TravelEasy: Bạn có thể hủy vé trước giờ khởi hành ít nhất 24 giờ để được hoàn 100% tiền qua mã vé hoặc phương thức đã thanh toán. Vui lòng vào mục 'Tra cứu vé' để thực hiện.";
        } else if (query.contains("chào") || query.contains("hello") || query.equals("hi") || query.trim().isEmpty()) {
            reply = "Chào bạn! Tôi là trợ lý AI TravelEasy. Tôi có thể hỗ trợ bạn tìm chuyến xe khách giá rẻ, tư vấn chọn vị trí ghế chống say xe, hướng dẫn điểm đón trả hoặc chính sách đặt vé của các nhà xe!";
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
