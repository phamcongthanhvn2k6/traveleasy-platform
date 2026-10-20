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
        String query = request.getMessage().toLowerCase();
        String reply;
        String suggestedRoute = null;

        if (query.contains("đà lạt") || query.contains("da lat")) {
            reply = "Tuyến Sài Gòn - Đà Lạt hiện có các chuyến xe Limousine phòng nằm 34 chỗ của nhà xe Phương Trang và Thành Bưởi, khởi hành mỗi tối lúc 22:00 và 23:00. Bạn nên chọn giường tầng dưới (A01 - A06) để chống say xe tối ưu nhất!";
            suggestedRoute = "TP. Hồ Chí Minh -> Đà Lạt";
        } else if (query.contains("nha trang")) {
            reply = "Tuyến Sài Gòn - Nha Trang xe chạy cao tốc mới chỉ mất khoảng 7-8 tiếng. Bạn có thể chọn nhà xe Phương Trang hoặc Sao Việt, giá vé chỉ từ 280.000đ. Đi chuyến 22:30 sáng hôm sau là tới bến xe phía Nam Nha Trang!";
            suggestedRoute = "TP. Hồ Chí Minh -> Nha Trang";
        } else if (query.contains("sa pa") || query.contains("sapa")) {
            reply = "Chuyến Hà Nội đi Sa Pa là tuyến đường đẹp bậc nhất qua cao tốc Nội Bài - Lào Cai. Nhà xe Sao Việt phục vụ xe giường nằm cabin đôi cao cấp, đón tại bến xe Mỹ Đình lúc 06:30 và 22:00.";
            suggestedRoute = "Hà Nội -> Sa Pa";
        } else if (query.contains("huỷ vé") || query.contains("hủy vé") || query.contains("đổi vé")) {
            reply = "Chính sách hủy vé TravelEasy: Bạn có thể hủy vé trước giờ khởi hành ít nhất 24 giờ để được hoàn 100% tiền qua mã vé hoặc phương thức đã thanh toán. Vui lòng vào mục 'Tra cứu vé' để thực hiện.";
        } else {
            reply = "Chào bạn! Tôi là trợ lý AI TravelEasy. Tôi có thể hỗ trợ bạn tìm chuyến xe khách giá rẻ, tư vấn chọn vị trí ghế chống say xe, hướng dẫn điểm đón trả hoặc chính sách đặt vé của các nhà xe!";
        }

        return AiChatResponse.builder()
                .reply(reply)
                .suggestedRoute(suggestedRoute)
                .build();
    }
}
