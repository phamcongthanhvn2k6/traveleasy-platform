package com.rikkei.quickshop.service.impl;

import com.rikkei.quickshop.dto.ai.AiChatResponse;
import com.rikkei.quickshop.dto.ai.AiGenerateResponse;
import com.rikkei.quickshop.entity.Product;
import com.rikkei.quickshop.repository.ProductRepository;
import com.rikkei.quickshop.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final ProductRepository productRepository;

    @Override
    public AiGenerateResponse generateProductDescription(String productName) {
        // Fallback / Stub Generator chuẩn SEO
        String generated = "✨ **" + productName + "** — Trải nghiệm sự khác biệt đẳng cấp từ QuickShop!

" +
                "🔹 **Đặc điểm nổi bật:**
" +
                "• Thiết kế hiện đại, tinh tế và sang trọng, dẫn đầu xu hướng thị trường.
" +
                "• Chất liệu cao cấp đạt tiêu chuẩn độ bền vượt trội theo thời gian.
" +
                "• Tối ưu hiệu năng sử dụng hằng ngày, đem lại cảm giác thoải mái tối đa.
" +
                "• Bảo hành chính hãng uy tín 12 tháng, 1 đổi 1 trong 30 ngày đầu.

" +
                "👉 *Đặt mua ngay hôm nay tại QuickShop để nhận ưu đãi giá tốt nhất cùng chính sách giao hàng COD tận nơi toàn quốc!*";

        return AiGenerateResponse.builder()
                .description(generated)
                .build();
    }

    @Override
    public AiChatResponse chatWithAssistant(String userMessage) {
        List<Product> availableProducts = productRepository.findTop20ByIsActiveTrue();

        StringBuilder reply = new StringBuilder("Dạ QuickShop xin chào bạn! Cảm ơn bạn đã nhắn tin: '" + userMessage + "'.\n\n");
        reply.append("Dưới đây là một số sản phẩm đang bán chạy nhất tại cửa hàng chúng mình:\n");

        for (int i = 0; i < Math.min(3, availableProducts.size()); i++) {
            Product p = availableProducts.get(i);
            reply.append("• **").append(p.getName()).append("**: ")
                 .append(String.format("%,.0f VNĐ", p.getPrice()))
                 .append(" (Còn lại: ").append(p.getStock()).append(" chiếc)\n");
        }
        reply.append("\nBạn cần tư vấn thêm chi tiết sản phẩm nào, cứ nhắn cho mình nhé!");

        return AiChatResponse.builder()
                .reply(reply.toString())
                .build();
    }
}
