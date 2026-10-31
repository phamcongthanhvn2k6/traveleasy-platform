package com.traveleasy.controller.customer;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.admin.PartnerRegisterRequest;
import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.*;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Public Portal Content", description = "Dữ liệu công khai: Banners, khuyến mại, đánh giá, bến xe từ Supabase")
public class PublicContentController {

    private final BannerRepository bannerRepository;
    private final BusCompanyRepository busCompanyRepository;
    private final LocationRepository locationRepository;
    private final CancellationPolicyRepository cancellationPolicyRepository;
    private final PromotionRepository promotionRepository;
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RouteRepository routeRepository;
    private final TripRepository tripRepository;
    private final AuditLogRepository auditLogRepository;

    // ==========================================
    // 1. BANNERS
    // ==========================================
    @org.springframework.cache.annotation.Cacheable("banners_list")
    @GetMapping("/banners")
    @Operation(summary = "Lấy danh sách banner quảng cáo từ Supabase")
    public ApiResponse<List<Banner>> getActiveBanners() {
        List<Banner> activeBanners = bannerRepository.findByStatus("ACTIVE");
        if (activeBanners.isEmpty()) {
            activeBanners = bannerRepository.findAll();
        }
        return ApiResponse.success(activeBanners);
    }

    // ==========================================
    // 2. KHUYẾN MẠI & VOUCHERS (PROMOTIONS)
    // ==========================================
    @org.springframework.cache.annotation.Cacheable(value = "promotions_list", key = "#category != null ? #category : 'ALL'")
    @GetMapping("/promotions")
    @Operation(summary = "Lấy toàn bộ danh sách mã giảm giá từ bảng promotions trên Supabase")
    public ApiResponse<List<Promotion>> getPromotions(@RequestParam(required = false) String category) {
        List<Promotion> promotions = promotionRepository.findAllByIsActiveTrueOrderByCreatedAtDesc();
        if (category != null && !category.equalsIgnoreCase("ALL") && !category.equalsIgnoreCase("Tất cả")) {
            promotions = promotions.stream()
                    .filter(p -> p.getCategory() != null && (
                            p.getCategory().equalsIgnoreCase(category) ||
                            mapCategoryToVietnamese(p.getCategory()).equalsIgnoreCase(category)
                    ))
                    .collect(Collectors.toList());
        }
        return ApiResponse.success(promotions);
    }

    private String mapCategoryToVietnamese(String cat) {
        if (cat == null) return "Tất cả";
        return switch (cat.toUpperCase()) {
            case "NEW_CUSTOMER", "NEW" -> "Khách mới";
            case "HOT_ROUTE" -> "Tuyến hot";
            case "ONLINE_PAYMENT" -> "Thanh toán online";
            default -> "Tất cả";
        };
    }

    @GetMapping("/promotions/validate")
    @Operation(summary = "Kiểm tra mã voucher và tính toán giá trị giảm giá theo thời gian thực")
    public ApiResponse<VoucherValidationResult> validateVoucher(
            @RequestParam String code,
            @RequestParam(required = false, defaultValue = "0") BigDecimal amount,
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination
    ) {
        if (code == null || code.trim().isEmpty()) {
            return ApiResponse.error("Vui lòng nhập mã voucher");
        }

        Optional<Promotion> promoOpt = promotionRepository.findByCodeIgnoreCaseAndIsActiveTrue(code.trim());
        if (promoOpt.isEmpty()) {
            return ApiResponse.error("Mã ưu đãi '" + code.trim() + "' không tồn tại hoặc đã hết hạn!");
        }

        Promotion promo = promoOpt.get();

        // 1. Kiểm tra đơn hàng tối thiểu
        if (promo.getMinOrderValue() != null && amount.compareTo(promo.getMinOrderValue()) < 0) {
            return ApiResponse.error(String.format("Mã %s yêu cầu giá trị đơn tối thiểu %,d đ (Đơn hiện tại: %,d đ)",
                    promo.getCode(), promo.getMinOrderValue().longValue(), amount.longValue()));
        }

        // 2. Kiểm tra tuyến áp dụng (nếu có)
        if (promo.getApplicableOrigin() != null && origin != null && !origin.isBlank()) {
            if (!origin.toLowerCase().contains(promo.getApplicableOrigin().toLowerCase())) {
                return ApiResponse.error("Mã này chỉ áp dụng cho chuyến xuất phát từ: " + promo.getApplicableOrigin());
            }
        }
        if (promo.getApplicableDestination() != null && destination != null && !destination.isBlank()) {
            if (!destination.toLowerCase().contains(promo.getApplicableDestination().toLowerCase())) {
                return ApiResponse.error("Mã này chỉ áp dụng cho chuyến đi đến: " + promo.getApplicableDestination());
            }
        }

        // 3. Tính mức giảm
        BigDecimal discount = BigDecimal.ZERO;
        if ("PERCENT".equalsIgnoreCase(promo.getDiscountType())) {
            BigDecimal percent = promo.getDiscountValue().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            discount = amount.multiply(percent).setScale(0, RoundingMode.HALF_UP);
            if (promo.getMaxDiscount() != null && promo.getMaxDiscount().compareTo(BigDecimal.ZERO) > 0) {
                if (discount.compareTo(promo.getMaxDiscount()) > 0) {
                    discount = promo.getMaxDiscount();
                }
            }
        } else {
            discount = promo.getDiscountValue();
            if (discount.compareTo(amount) > 0) {
                discount = amount;
            }
        }

        BigDecimal finalAmount = amount.subtract(discount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        VoucherValidationResult result = VoucherValidationResult.builder()
                .code(promo.getCode())
                .title(promo.getTitle())
                .discountType(promo.getDiscountType())
                .discountValue(promo.getDiscountValue())
                .discountAmount(discount)
                .originalAmount(amount)
                .finalAmount(finalAmount)
                .message("Áp dụng mã ưu đãi thành công! Bạn được giảm " + String.format("%,d đ", discount.longValue()))
                .build();

        return ApiResponse.success("Mã ưu đãi hợp lệ", result);
    }

    // ==========================================
    // 3. ĐÁNH GIÁ & PHẢN HỒI (REVIEWS)
    // ==========================================
    @GetMapping("/reviews")
    @Operation(summary = "Lấy danh sách đánh giá khách hàng thực tế từ Supabase")
    public ApiResponse<List<Review>> getReviews(
            @RequestParam(required = false) Long busCompanyId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) Boolean hasImages
    ) {
        List<Review> list;
        if (busCompanyId != null && busCompanyId > 0) {
            list = reviewRepository.findByBusCompanyIdAndStatusOrderByCreatedAtDesc(busCompanyId, "APPROVED");
        } else {
            list = reviewRepository.findAllByStatusOrderByCreatedAtDesc("APPROVED");
        }

        if (rating != null && rating >= 1 && rating <= 5) {
            list = list.stream().filter(r -> Objects.equals(r.getRating(), rating)).collect(Collectors.toList());
        }

        if (Boolean.TRUE.equals(hasImages)) {
            list = list.stream().filter(r -> r.getImageUrls() != null && !r.getImageUrls().isBlank()).collect(Collectors.toList());
        }

        return ApiResponse.success(list);
    }

    @GetMapping("/reviews/summary")
    @Operation(summary = "Lấy số liệu scorecard tổng quan đánh giá từ Supabase")
    public ApiResponse<ReviewSummaryResponse> getReviewSummary(@RequestParam(required = false) Long busCompanyId) {
        List<Review> list;
        if (busCompanyId != null && busCompanyId > 0) {
            list = reviewRepository.findByBusCompanyIdAndStatusOrderByCreatedAtDesc(busCompanyId, "APPROVED");
        } else {
            list = reviewRepository.findAllByStatusOrderByCreatedAtDesc("APPROVED");
        }

        if (list.isEmpty()) {
            return ApiResponse.success(ReviewSummaryResponse.builder()
                    .averageRating(5.0)
                    .totalReviews(0)
                    .rating5Count(0)
                    .rating4Count(0)
                    .rating3Count(0)
                    .rating2Count(0)
                    .rating1Count(0)
                    .punctualityScore(5.0)
                    .cleanlinessScore(5.0)
                    .serviceScore(5.0)
                    .build());
        }

        int total = list.size();
        double avgRating = list.stream().mapToInt(Review::getRating).average().orElse(5.0);
        long r5 = list.stream().filter(r -> r.getRating() == 5).count();
        long r4 = list.stream().filter(r -> r.getRating() == 4).count();
        long r3 = list.stream().filter(r -> r.getRating() == 3).count();
        long r2 = list.stream().filter(r -> r.getRating() == 2).count();
        long r1 = list.stream().filter(r -> r.getRating() == 1).count();

        double punctuality = list.stream()
                .filter(r -> r.getPunctualityRating() != null)
                .mapToDouble(r -> r.getPunctualityRating().doubleValue())
                .average().orElse(4.9);

        double cleanliness = list.stream()
                .filter(r -> r.getCleanlinessRating() != null)
                .mapToDouble(r -> r.getCleanlinessRating().doubleValue())
                .average().orElse(4.8);

        double service = list.stream()
                .filter(r -> r.getServiceRating() != null)
                .mapToDouble(r -> r.getServiceRating().doubleValue())
                .average().orElse(4.9);

        ReviewSummaryResponse summary = ReviewSummaryResponse.builder()
                .averageRating(Math.round(avgRating * 10.0) / 10.0)
                .totalReviews(total)
                .rating5Count((int) r5)
                .rating4Count((int) r4)
                .rating3Count((int) r3)
                .rating2Count((int) r2)
                .rating1Count((int) r1)
                .punctualityScore(Math.round(punctuality * 10.0) / 10.0)
                .cleanlinessScore(Math.round(cleanliness * 10.0) / 10.0)
                .serviceScore(Math.round(service * 10.0) / 10.0)
                .build();

        return ApiResponse.success(summary);
    }

    @GetMapping("/reviews/eligible-bookings")
    @Operation(summary = "Lấy các chuyến xe của khách đã hoàn thành hành trình và đủ điều kiện để viết đánh giá")
    public ApiResponse<List<EligibleBookingDto>> getEligibleBookings(
            @RequestParam(required = false) String bookingCode,
            @RequestParam(required = false) String phone,
            Principal principal
    ) {
        if (principal == null) {
            // Chưa đăng nhập -> Tuyệt đối không trả về bất kỳ chuyến xe nào của người khác!
            return ApiResponse.success(Collections.emptyList());
        }

        User currentUser = userRepository.findByEmail(principal.getName()).orElse(null);
        if (currentUser == null) {
            return ApiResponse.success(Collections.emptyList());
        }

        List<Booking> candidates = new ArrayList<>();

        if (bookingCode != null && !bookingCode.isBlank()) {
            bookingRepository.findByBookingCodeWithTripDetails(bookingCode.trim())
                    .filter(b -> (b.getUser() != null && b.getUser().getId().equals(currentUser.getId()))
                            || (b.getPassengerPhone() != null && b.getPassengerPhone().equals(currentUser.getPhone()))
                            || (b.getPassengerEmail() != null && b.getPassengerEmail().equalsIgnoreCase(currentUser.getEmail())))
                    .ifPresent(candidates::add);
        } else {
            candidates.addAll(bookingRepository.findByUserIdWithTripDetails(currentUser.getId()));
            if (currentUser.getPhone() != null && !currentUser.getPhone().isBlank()) {
                List<Booking> byPhone = bookingRepository.findByPassengerPhoneOrderByCreatedAtDesc(currentUser.getPhone());
                for (Booking b : byPhone) {
                    if (candidates.stream().noneMatch(c -> c.getId().equals(b.getId()))) {
                        bookingRepository.findByBookingCodeWithTripDetails(b.getBookingCode()).ifPresent(candidates::add);
                    }
                }
            }
        }

        LocalDateTime now = LocalDateTime.now();
        Set<String> alreadyReviewedCodes = reviewRepository.findAllReviewedBookingCodes();
        List<EligibleBookingDto> result = new ArrayList<>();

        for (Booking b : candidates) {
            Trip t = b.getTrip();
            // Điều kiện: Chuyến xe ĐÃ HOÀN THÀNH (arrivalTime hoặc departureTime < now, hoặc status COMPLETED)
            boolean isCompleted = false;
            if (b.getStatus() == BookingStatus.COMPLETED) {
                isCompleted = true;
            } else if (t != null && t.getStatus() == TripStatus.COMPLETED) {
                isCompleted = true;
            } else if (t != null && t.getDepartureTime() != null && t.getDepartureTime().isBefore(now)) {
                isCompleted = true;
            }

            // Chưa từng được đánh giá (kiểm tra tức thì trong HashSet)
            boolean alreadyReviewed = alreadyReviewedCodes.contains(b.getBookingCode());

            if (isCompleted && !alreadyReviewed) {
                String compName = (t != null && t.getBusCompany() != null) ? t.getBusCompany().getName() : "TravelEasy Express";
                String route = (t != null && t.getRoute() != null)
                        ? (t.getRoute().getDepartureLocation() + " - " + t.getRoute().getArrivalLocation()) : "Chuyến liên tỉnh";

                result.add(EligibleBookingDto.builder()
                        .bookingId(b.getId())
                        .bookingCode(b.getBookingCode())
                        .passengerName(b.getPassengerName())
                        .busCompanyId(t != null && t.getBusCompany() != null ? t.getBusCompany().getId() : null)
                        .busCompanyName(compName)
                        .routeName(route)
                        .departureTime(t != null ? t.getDepartureTime() : null)
                        .arrivalTime(t != null ? t.getArrivalTime() : null)
                        .seatNumbers(b.getSeatNumbers())
                        .build());
            }
        }

        return ApiResponse.success(result);
    }

    @PostMapping("/reviews")
    @Operation(summary = "Khách hàng gửi đánh giá sau khi chuyến xe đã hoàn thành chuyến đi")
    public ApiResponse<?> submitReview(@RequestBody CreateReviewDto request, Principal principal) {
        if (principal == null) {
            return ApiResponse.error("Vui lòng đăng nhập tài khoản để gửi đánh giá chuyến đi!");
        }

        User currentUser = userRepository.findByEmail(principal.getName()).orElse(null);
        if (currentUser == null) {
            return ApiResponse.error("Không tìm thấy thông tin tài khoản người dùng!");
        }

        if (request.getBookingCode() == null || request.getBookingCode().isBlank()) {
            return ApiResponse.error("Vui lòng cung cấp mã đặt vé (Booking Code) của chuyến đi cần đánh giá");
        }

        String code = request.getBookingCode().trim();
        Optional<Booking> bookingOpt = bookingRepository.findByBookingCodeWithTripDetails(code);
        if (bookingOpt.isEmpty()) {
            return ApiResponse.error("Không tìm thấy thông tin đơn đặt vé với mã: " + code);
        }

        Booking booking = bookingOpt.get();

        // Kiểm tra quyền sở hữu đơn đặt vé:
        boolean isOwner = (booking.getUser() != null && booking.getUser().getId().equals(currentUser.getId()))
                || (booking.getPassengerPhone() != null && booking.getPassengerPhone().equals(currentUser.getPhone()))
                || (booking.getPassengerEmail() != null && booking.getPassengerEmail().equalsIgnoreCase(currentUser.getEmail()));

        if (!isOwner) {
            return ApiResponse.error("Bạn không có quyền đánh giá đơn đặt vé này vì chuyến đi không thuộc tài khoản của bạn!");
        }

        // 1. Kiểm tra đã đánh giá chưa
        if (reviewRepository.existsByBookingCode(code)) {
            return ApiResponse.error("Mã vé " + code + " này đã được gửi đánh giá trước đó. Mỗi chuyến đi chỉ được đánh giá 1 lần.");
        }

        // 2. KIỂM TRA ĐIỀU KIỆN TIÊN QUYẾT: CHUYẾN XE PHẢI HOÀN THÀNH CHUYẾN ĐI
        Trip trip = booking.getTrip();
        LocalDateTime now = LocalDateTime.now();
        boolean isCompleted = false;

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            isCompleted = true;
        } else if (trip != null && trip.getStatus() == TripStatus.COMPLETED) {
            isCompleted = true;
        } else if (trip != null && trip.getDepartureTime() != null && trip.getDepartureTime().isBefore(now)) {
            isCompleted = true;
        }

        if (!isCompleted) {
            return ApiResponse.error("⛔ Chuyến xe chưa hoàn thành chuyến đi! Quý khách chỉ có thể gửi đánh giá sau khi chuyến xe đã khởi hành và hoàn tất hành trình.");
        }

        // 3. Chuẩn bị thông tin đánh giá
        String rawName = request.getPassengerName();
        if (rawName == null || rawName.isBlank()) {
            rawName = booking.getPassengerName();
        }
        String maskedName = maskCustomerName(rawName);

        String companyName = (trip != null && trip.getBusCompany() != null) ? trip.getBusCompany().getName() : "TravelEasy Express";
        String routeName = (trip != null && trip.getRoute() != null)
                ? (trip.getRoute().getDepartureLocation() + " - " + trip.getRoute().getArrivalLocation()) : "Chuyến liên tỉnh";

        int rating = request.getRating() != null ? Math.max(1, Math.min(5, request.getRating())) : 5;
        BigDecimal punctuality = request.getPunctualityRating() != null ? request.getPunctualityRating() : BigDecimal.valueOf(5.0);
        BigDecimal cleanliness = request.getCleanlinessRating() != null ? request.getCleanlinessRating() : BigDecimal.valueOf(5.0);
        BigDecimal service = request.getServiceRating() != null ? request.getServiceRating() : BigDecimal.valueOf(5.0);

        Review review = Review.builder()
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .customerName(maskedName)
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .tripId(trip != null ? trip.getId() : null)
                .busCompanyId(trip != null && trip.getBusCompany() != null ? trip.getBusCompany().getId() : null)
                .busCompanyName(companyName)
                .routeName(routeName)
                .rating(rating)
                .punctualityRating(punctuality)
                .cleanlinessRating(cleanliness)
                .serviceRating(service)
                .comment(request.getComment() != null ? request.getComment().trim() : "Trải nghiệm chuyến đi rất tốt.")
                .imageUrls(request.getImageUrls())
                .status("APPROVED")
                .build();

        Review saved = reviewRepository.save(review);

        // 4. Tự động cập nhật averageRating của BusCompany trên Supabase
        if (trip != null && trip.getBusCompany() != null) {
            BusCompany company = trip.getBusCompany();
            List<Review> compReviews = reviewRepository.findByBusCompanyIdAndStatusOrderByCreatedAtDesc(company.getId(), "APPROVED");
            if (!compReviews.isEmpty()) {
                double avg = compReviews.stream().mapToInt(Review::getRating).average().orElse(5.0);
                company.setAverageRating(BigDecimal.valueOf(Math.round(avg * 10.0) / 10.0));
                busCompanyRepository.save(company);
            }
        }

        return ApiResponse.success("Đánh giá chuyến đi thành công! Cảm ơn bạn đã đóng góp phản hồi quý báu.", saved);
    }

    private String maskCustomerName(String name) {
        if (name == null || name.isBlank()) return "Hành khách TravelEasy";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) return parts[0];
        if (parts.length == 2) return parts[0] + " ***";
        return parts[0] + " *** " + parts[parts.length - 1];
    }

    // ==========================================
    // 4. DANH MỤC KHÁC
    // ==========================================
    @GetMapping("/bus-companies")
    @Operation(summary = "Lấy danh mục đối tác nhà xe từ Supabase")
    public ApiResponse<List<BusCompany>> getBusCompanies() {
        return ApiResponse.success(busCompanyRepository.findAll());
    }

    @GetMapping("/locations")
    @Operation(summary = "Lấy danh mục bến xe và điểm đón trả từ Supabase")
    public ApiResponse<List<Location>> getLocations() {
        return ApiResponse.success(locationRepository.findAll());
    }

    @GetMapping("/cancellation-policies")
    @Operation(summary = "Lấy chính sách hủy đổi vé từ Supabase")
    public ApiResponse<List<CancellationPolicy>> getCancellationPolicies() {
        return ApiResponse.success(cancellationPolicyRepository.findAll());
    }

    @org.springframework.cache.annotation.Cacheable("routes_list")
    @GetMapping("/routes")
    @Operation(summary = "Lấy toàn bộ tuyến đường vận hành từ CSDL Supabase")
    public ApiResponse<List<Route>> getAllRoutes() {
        return ApiResponse.success(routeRepository.findAllByOrderByDepartureLocationAscArrivalLocationAsc());
    }

    @org.springframework.cache.annotation.Cacheable("popular_routes")
    @GetMapping("/routes/popular")
    @Operation(summary = "Lấy danh sách các tuyến đường phổ biến từ Supabase kèm giá vé thấp nhất thực tế")
    public ApiResponse<List<Map<String, Object>>> getPopularRoutes() {
        List<Route> routes = routeRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        // TỐI ƯU HÓA: Thay vì duyệt vòng lặp 25 lần gọi qua mạng sang Úc (mất 5-6s),
        // chỉ gọi 1 truy vấn duy nhất lấy các chuyến sắp tới và gom giá tối thiểu trong RAM!
        List<Trip> upcomingTrips = tripRepository.searchTrips(null, null, LocalDateTime.now(), null, TripStatus.SCHEDULED);
        Map<Long, BigDecimal> minPriceMap = new HashMap<>();
        for (Trip t : upcomingTrips) {
            if (t.getRoute() != null && t.getRoute().getId() != null && t.getPrice() != null) {
                Long rId = t.getRoute().getId();
                minPriceMap.merge(rId, t.getPrice(), (p1, p2) -> p1.compareTo(p2) < 0 ? p1 : p2);
            }
        }

        for (Route r : routes) {
            BigDecimal minPrice = minPriceMap.getOrDefault(r.getId(), BigDecimal.valueOf(199000));

            String dest = r.getArrivalLocation() != null ? r.getArrivalLocation().toLowerCase() : "";
            String imgUrl = "https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289365/traveleasy/banners/banner_hero_dalat_mongmo.jpg";
            String bgColor = "linear-gradient(180deg, transparent 40%, rgba(30, 58, 138, 0.85) 100%)";

            if (dest.contains("sa pa") || dest.contains("sapa")) {
                imgUrl = "https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289364/traveleasy/banners/banner_hero_sapa_fansipan.jpg";
                bgColor = "linear-gradient(180deg, transparent 40%, rgba(30, 58, 138, 0.85) 100%)";
            } else if (dest.contains("đà lạt") || dest.contains("da lat")) {
                imgUrl = "https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289365/traveleasy/banners/banner_hero_dalat_mongmo.jpg";
                bgColor = "linear-gradient(180deg, transparent 40%, rgba(194, 65, 12, 0.85) 100%)";
            } else if (dest.contains("nha trang")) {
                imgUrl = "https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289366/traveleasy/banners/banner_hero_nhatrang_bienxanh.jpg";
                bgColor = "linear-gradient(180deg, transparent 40%, rgba(120, 53, 15, 0.85) 100%)";
            } else if (dest.contains("vũng tàu") || dest.contains("vung tau")) {
                imgUrl = "https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289368/traveleasy/banners/banner_hero_vungtau_hoamai.jpg";
                bgColor = "linear-gradient(180deg, transparent 40%, rgba(13, 148, 136, 0.85) 100%)";
            } else if (dest.contains("đà nẵng") || dest.contains("da nang") || dest.contains("huế") || dest.contains("hội an")) {
                imgUrl = "https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289367/traveleasy/banners/banner_hero_mientrung_disan.jpg";
                bgColor = "linear-gradient(180deg, transparent 40%, rgba(2, 132, 199, 0.85) 100%)";
            } else if (dest.contains("hải phòng") || dest.contains("hà nội")) {
                imgUrl = "https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289370/traveleasy/banners/banner_promo_welcome_newuser.jpg";
                bgColor = "linear-gradient(180deg, transparent 40%, rgba(55, 48, 163, 0.85) 100%)";
            }

            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("title", r.getDepartureLocation() + " - " + r.getArrivalLocation());
            map.put("origin", r.getDepartureLocation());
            map.put("destination", r.getArrivalLocation());
            map.put("price", String.format("%,dđ", minPrice.longValue()));
            map.put("oldPrice", String.format("%,dđ", minPrice.multiply(BigDecimal.valueOf(1.15)).longValue()));
            map.put("distanceKm", r.getDistanceKm());
            map.put("durationHours", r.getDurationHours());
            map.put("image", imgUrl);
            map.put("bgColor", bgColor);
            result.add(map);
        }
        return ApiResponse.success(result);
    }

    // ==========================================
    // 7. PARTNER REGISTRATION (HỢP TÁC MỞ BÁN VÉ)
    // ==========================================
    @org.springframework.cache.annotation.CacheEvict(value = {"admin_bus_companies", "bus_companies", "system_stats"}, allEntries = true)
    @PostMapping("/partners/register")
    @Operation(summary = "Đăng ký đối tác mở bán vé trực tuyến (Public Form)")
    public ApiResponse<?> registerPartner(@RequestBody PartnerRegisterRequest request) {
        if (request.getCompanyName() == null || request.getCompanyName().isBlank()) {
            return ApiResponse.error("Vui lòng nhập Tên Nhà Xe / Đơn Vị Vận Tải!");
        }
        if (request.getContactName() == null || request.getContactName().isBlank()) {
            return ApiResponse.error("Vui lòng nhập Họ Và Tên Người Đại Diện!");
        }
        if (request.getPhone() == null || request.getPhone().isBlank()) {
            return ApiResponse.error("Vui lòng nhập Số Điện Thoại Liên Hệ!");
        }

        String name = request.getCompanyName().trim();
        if (busCompanyRepository.existsByName(name)) {
            return ApiResponse.error("Nhà xe '" + name + "' đã tồn tại trong danh mục hệ thống. Vui lòng kiểm tra lại hoặc liên hệ tổng đài!");
        }

        String rand = String.format("%04d", new Random().nextInt(10000));
        String code = "NX-" + rand;

        String hotline = request.getPhone().trim();
        String email = (request.getEmail() != null && !request.getEmail().isBlank())
                ? request.getEmail().trim()
                : ("partner." + rand + "@traveleasy.vn");

        StringBuilder addressBuilder = new StringBuilder();
        if (request.getContactName() != null && !request.getContactName().isBlank()) {
            addressBuilder.append("Đại diện: ").append(request.getContactName().trim());
        }
        if (request.getTaxCode() != null && !request.getTaxCode().isBlank()) {
            if (addressBuilder.length() > 0) addressBuilder.append(" | ");
            addressBuilder.append("MST: ").append(request.getTaxCode().trim());
        }
        if (request.getFleetSize() != null && !request.getFleetSize().isBlank()) {
            if (addressBuilder.length() > 0) addressBuilder.append(" | ");
            addressBuilder.append("Quy mô: ").append(request.getFleetSize().trim());
        }
        if (request.getRoutes() != null && !request.getRoutes().isBlank()) {
            if (addressBuilder.length() > 0) addressBuilder.append(" | ");
            addressBuilder.append("Tuyến: ").append(request.getRoutes().trim());
        }
        if (request.getBusinessAddress() != null && !request.getBusinessAddress().isBlank()) {
            if (addressBuilder.length() > 0) addressBuilder.append(" | ");
            addressBuilder.append("Trụ sở: ").append(request.getBusinessAddress().trim());
        }
        String address = addressBuilder.length() > 0 ? addressBuilder.toString() : "Việt Nam";

        BusCompany company = BusCompany.builder()
                .name(name)
                .code(code)
                .hotline(hotline)
                .email(email)
                .address(address)
                .logoUrl("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=120")
                .averageRating(BigDecimal.valueOf(5.0))
                .status("PENDING_APPROVAL")
                .createdAt(LocalDateTime.now())
                .build();

        BusCompany saved = busCompanyRepository.save(company);

        try {
            AuditLog auditLog = AuditLog.builder()
                    .userEmail(email)
                    .action("PARTNER_REGISTRATION")
                    .target("bus_companies #" + saved.getId())
                    .beforeState("-")
                    .afterState("{\"name\": \"" + saved.getName() + "\", \"status\": \"PENDING_APPROVAL\"}")
                    .createdAt(LocalDateTime.now())
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception ignored) {}

        return ApiResponse.success("Đăng ký hồ sơ đối tác nhà xe thành công! Hồ sơ đã được chuyển đến ban quản trị hệ thống để xét duyệt.", saved);
    }

    // ==========================================
    // DTO CLASSES
    // ==========================================
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoucherValidationResult {
        private String code;
        private String title;
        private String discountType;
        private BigDecimal discountValue;
        private BigDecimal discountAmount;
        private BigDecimal originalAmount;
        private BigDecimal finalAmount;
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewSummaryResponse {
        private Double averageRating;
        private Integer totalReviews;
        private Integer rating5Count;
        private Integer rating4Count;
        private Integer rating3Count;
        private Integer rating2Count;
        private Integer rating1Count;
        private Double punctualityScore;
        private Double cleanlinessScore;
        private Double serviceScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EligibleBookingDto {
        private Long bookingId;
        private String bookingCode;
        private String passengerName;
        private Long busCompanyId;
        private String busCompanyName;
        private String routeName;
        private LocalDateTime departureTime;
        private LocalDateTime arrivalTime;
        private String seatNumbers;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateReviewDto {
        private String bookingCode;
        private String passengerName;
        private Integer rating;
        private BigDecimal punctualityRating;
        private BigDecimal cleanlinessRating;
        private BigDecimal serviceRating;
        private String comment;
        private String imageUrls;
    }
}
