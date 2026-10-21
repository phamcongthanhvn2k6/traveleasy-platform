package com.traveleasy.controller.customer;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.entity.Banner;
import com.traveleasy.entity.ReviewReport;
import com.traveleasy.repository.BannerRepository;
import com.traveleasy.repository.ReviewReportRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Public Portal Content", description = "Dữ liệu công khai trang chủ: Banners, đánh giá")
public class PublicContentController {

    private final BannerRepository bannerRepository;
    private final ReviewReportRepository reviewReportRepository;

    @GetMapping("/banners")
    @Operation(summary = "Lấy danh sách banner quảng cáo đang hoạt động trên trang chủ")
    public ApiResponse<List<Banner>> getActiveBanners() {
        List<Banner> activeBanners = bannerRepository.findByStatus("ACTIVE");
        return ApiResponse.success(activeBanners);
    }

    @PostMapping("/reviews")
    @Operation(summary = "Khách hàng gửi đánh giá hoặc phản ánh chuyến xe")
    public ApiResponse<ReviewReport> submitReview(@RequestBody ReviewSubmissionRequest request) {
        ReviewReport report = ReviewReport.builder()
                .reporterEmail(request.getEmail() != null ? request.getEmail() : "anonymous@customer.com")
                .reviewAuthor(request.getAuthor() != null ? request.getAuthor() : "Hành khách")
                .reason(request.getReason() != null ? request.getReason() : "Đánh giá chất lượng chuyến đi")
                .reviewSnippet(request.getComment() != null ? request.getComment() : "Trải nghiệm dịch vụ")
                .rating(request.getRating() != null ? request.getRating() : 5)
                .status("PENDING")
                .build();

        return ApiResponse.success("Gửi đánh giá thành công! Cảm ơn bạn đã đóng góp ý kiến.", reviewReportRepository.save(report));
    }

    @Data
    public static class ReviewSubmissionRequest {
        private String email;
        private String author;
        private String reason;
        private String comment;
        private Integer rating;
    }
}
