package com.traveleasy.config;

import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BusCompanyRepository busCompanyRepository;
    private final RouteRepository routeRepository;
    private final PickupDropoffPointRepository pointRepository;
    private final TripRepository tripRepository;
    private final TripSeatRepository tripSeatRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final SeatTypeRepository seatTypeRepository;
    private final SeatLayoutTemplateRepository seatLayoutTemplateRepository;
    private final LocationRepository locationRepository;
    private final BannerRepository bannerRepository;
    private final GatewayConfigRepository gatewayConfigRepository;
    private final ReviewReportRepository reviewReportRepository;
    private final CancellationPolicyRepository cancellationPolicyRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping DataInitializer.");
            return;
        }

        log.info("Seeding rich initial data for TravelEasy Platform...");

        // 1. Seed Users (Admins, Operators, Customers)
        String encodedPass = passwordEncoder.encode("Rikkei@123");

        User admin1 = User.builder().email("admin@traveleasy.vn").password(encodedPass).fullName("Quản Trị Viên Hệ Thống").phone("0901234567").role(Role.ADMIN).status("ACTIVE").build();
        User admin2 = User.builder().email("phanthanhphong.admin@traveleasy.vn").password(encodedPass).fullName("Phạm Thanh Phong").phone("0902223344").role(Role.ADMIN).status("ACTIVE").build();
        User admin3 = User.builder().email("trungkien.admin@traveleasy.vn").password(encodedPass).fullName("Phan Trung Kiên").phone("0903334455").role(Role.ADMIN).status("ACTIVE").build();

        User opFuta = User.builder().email("partner@traveleasy.vn").password(encodedPass).fullName("Điều Hành TravelEasy Express").phone("0909888999").role(Role.OPERATOR).status("ACTIVE").build();
        User opHoaMai = User.builder().email("dieuhanh@hoamaivungtau.com.vn").password(encodedPass).fullName("Điều Hành Xe Hoa Mai").phone("0905556677").role(Role.OPERATOR).status("ACTIVE").build();
        User opHoangLong = User.builder().email("dieuhanh@hoanglongasia.com").password(encodedPass).fullName("Điều Hành Hoàng Long").phone("0906667788").role(Role.OPERATOR).status("ACTIVE").build();
        User opVanMinh = User.builder().email("staff@traveleasy.vn").password(encodedPass).fullName("Nhân Viên Vận Hành").phone("0907778899").role(Role.OPERATOR).status("ACTIVE").build();

        User cust1 = User.builder().email("customer@gmail.com").password(encodedPass).fullName("Nguyễn Văn Du Khách").phone("0912345678").role(Role.CUSTOMER).status("ACTIVE").build();
        User cust2 = User.builder().email("tranthib@gmail.com").password(encodedPass).fullName("Trần Thị Bích Ngọc").phone("0987654321").role(Role.CUSTOMER).status("ACTIVE").build();
        User cust3 = User.builder().email("lehoangc@gmail.com").password(encodedPass).fullName("Lê Hoàng Cường").phone("0978112233").role(Role.CUSTOMER).status("ACTIVE").build();
        User cust4 = User.builder().email("phamquocd@gmail.com").password(encodedPass).fullName("Phạm Quốc Dũng").phone("0933445566").role(Role.CUSTOMER).status("LOCKED").build();
        User cust5 = User.builder().email("hoangmaie@gmail.com").password(encodedPass).fullName("Hoàng Thị Mai").phone("0944556677").role(Role.CUSTOMER).status("ACTIVE").build();

        userRepository.saveAll(List.of(admin1, admin2, admin3, opFuta, opHoaMai, opHoangLong, opVanMinh, cust1, cust2, cust3, cust4, cust5));

        // 2. Seed 10 Bus Companies
        BusCompany futa = BusCompany.builder().name("TravelEasy Express").code("SK-2024-001").hotline("1900 6067").email("contact@traveleasy.vn").address("Bến xe Miền Tây, TP. Hồ Chí Minh").logoUrl("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&auto=format&fit=crop&q=80").status("ACTIVE").averageRating(BigDecimal.valueOf(4.9)).build();
        BusCompany thanhBuoi = BusCompany.builder().name("Thành Bưởi Limousine").code("SK-2024-002").hotline("1900 6079").email("info@thanhbuoi.com.vn").address("266 Lê Hồng Phong, Quận 5, TP. Hồ Chí Minh").logoUrl("https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=150&auto=format&fit=crop&q=80").status("ACTIVE").averageRating(BigDecimal.valueOf(4.8)).build();
        BusCompany saoViet = BusCompany.builder().name("Sao Việt Express").code("SK-2024-003").hotline("1900 6746").email("contact@xesaoviet.com.vn").address("779 Giải Phóng, Hoàng Mai, Hà Nội").logoUrl("https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=150&auto=format&fit=crop&q=80").status("ACTIVE").averageRating(BigDecimal.valueOf(4.7)).build();
        BusCompany kumho = BusCompany.builder().name("Kumho Samco Buslines").code("SK-2024-004").hotline("1900 6065").email("cskh@kumhosamco.com.vn").address("292 Đinh Bộ Lĩnh, Bình Thạnh, TP. Hồ Chí Minh").logoUrl("https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=150&auto=format&fit=crop&q=80").status("PENDING_APPROVAL").averageRating(BigDecimal.valueOf(4.8)).build();
        BusCompany hoaMai = BusCompany.builder().name("Xe Khách Hoa Mai").code("SK-2024-005").hotline("1900 599 997").email("info@hoamaivungtau.com.vn").address("47 Trưng Nhị, Phường 1, TP. Vũng Tàu").logoUrl("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&auto=format&fit=crop&q=80").status("ACTIVE").averageRating(BigDecimal.valueOf(4.9)).build();
        BusCompany hoangLong = BusCompany.builder().name("Hoàng Long Asia").code("SK-2024-006").hotline("0225 3920 920").email("info@hoanglongasia.com").address("05 Phạm Ngũ Lão, Ngô Quyền, Hải Phòng").logoUrl("https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=150&auto=format&fit=crop&q=80").status("SUSPENDED").averageRating(BigDecimal.valueOf(4.7)).build();
        BusCompany vanMinh = BusCompany.builder().name("Nhà Xe Văn Minh").code("SK-2024-007").hotline("1900 6467").email("vanminh@vanminh74.vn").address("101 Lý Thường Kiệt, TP. Vinh, Nghệ An").logoUrl("https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=150&auto=format&fit=crop&q=80").status("ACTIVE").averageRating(BigDecimal.valueOf(4.9)).build();
        BusCompany cucTung = BusCompany.builder().name("Cúc Tùng Limousine").code("SK-2024-008").hotline("1900 6606").email("cuctunglimousine@gmail.com").address("Bến xe phía Nam Nha Trang, Khánh Hòa").logoUrl("https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=150&auto=format&fit=crop&q=80").status("ACTIVE").averageRating(BigDecimal.valueOf(4.8)).build();
        BusCompany haiVan = BusCompany.builder().name("Hải Vân Express").code("SK-2024-009").hotline("1900 6763").email("cskh@haivan.com").address("Tòa nhà N2E Lê Văn Lương, Nhân Chính, Thanh Xuân, Hà Nội").logoUrl("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&auto=format&fit=crop&q=80").status("ACTIVE").averageRating(BigDecimal.valueOf(4.8)).build();
        BusCompany chinNghia = BusCompany.builder().name("Chín Nghĩa").code("SK-2024-010").hotline("1900 636 636").email("chinnghiaquangngai@gmail.com").address("06 Đinh Tiên Hoàng, Nghĩa Chánh, TP. Quảng Ngãi").logoUrl("https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=150&auto=format&fit=crop&q=80").status("ACTIVE").averageRating(BigDecimal.valueOf(4.7)).build();

        busCompanyRepository.saveAll(List.of(futa, thanhBuoi, saoViet, kumho, hoaMai, hoangLong, vanMinh, cucTung, haiVan, chinNghia));

        // 3. Seed 14 Routes
        Route r1 = Route.builder().busCompany(futa).departureLocation("TP. Hồ Chí Minh").arrivalLocation("Đà Lạt").durationHours(BigDecimal.valueOf(6.5)).distanceKm(BigDecimal.valueOf(305.0)).build();
        Route r2 = Route.builder().busCompany(futa).departureLocation("TP. Hồ Chí Minh").arrivalLocation("Nha Trang").durationHours(BigDecimal.valueOf(8.0)).distanceKm(BigDecimal.valueOf(435.0)).build();
        Route r3 = Route.builder().busCompany(thanhBuoi).departureLocation("TP. Hồ Chí Minh").arrivalLocation("Cần Thơ").durationHours(BigDecimal.valueOf(3.5)).distanceKm(BigDecimal.valueOf(169.0)).build();
        Route r4 = Route.builder().busCompany(saoViet).departureLocation("Hà Nội").arrivalLocation("Sa Pa").durationHours(BigDecimal.valueOf(5.5)).distanceKm(BigDecimal.valueOf(315.0)).build();
        Route r5 = Route.builder().busCompany(hoaMai).departureLocation("TP. Hồ Chí Minh").arrivalLocation("Vũng Tàu").durationHours(BigDecimal.valueOf(2.0)).distanceKm(BigDecimal.valueOf(105.0)).build();
        Route r6 = Route.builder().busCompany(hoaMai).departureLocation("Vũng Tàu").arrivalLocation("TP. Hồ Chí Minh").durationHours(BigDecimal.valueOf(2.0)).distanceKm(BigDecimal.valueOf(105.0)).build();
        Route r7 = Route.builder().busCompany(futa).departureLocation("TP. Hồ Chí Minh").arrivalLocation("Phan Thiết").durationHours(BigDecimal.valueOf(4.0)).distanceKm(BigDecimal.valueOf(215.0)).build();
        Route r8 = Route.builder().busCompany(thanhBuoi).departureLocation("TP. Hồ Chí Minh").arrivalLocation("Buôn Ma Thuột").durationHours(BigDecimal.valueOf(7.5)).distanceKm(BigDecimal.valueOf(350.0)).build();
        Route r9 = Route.builder().busCompany(hoangLong).departureLocation("Hà Nội").arrivalLocation("Hải Phòng").durationHours(BigDecimal.valueOf(1.5)).distanceKm(BigDecimal.valueOf(120.0)).build();
        Route r10 = Route.builder().busCompany(hoangLong).departureLocation("Hà Nội").arrivalLocation("Hạ Long").durationHours(BigDecimal.valueOf(2.5)).distanceKm(BigDecimal.valueOf(155.0)).build();
        Route r11 = Route.builder().busCompany(vanMinh).departureLocation("Hà Nội").arrivalLocation("Vinh").durationHours(BigDecimal.valueOf(5.5)).distanceKm(BigDecimal.valueOf(300.0)).build();
        Route r12 = Route.builder().busCompany(haiVan).departureLocation("Hà Nội").arrivalLocation("Hà Giang").durationHours(BigDecimal.valueOf(6.0)).distanceKm(BigDecimal.valueOf(320.0)).build();
        Route r13 = Route.builder().busCompany(futa).departureLocation("Đà Nẵng").arrivalLocation("Huế").durationHours(BigDecimal.valueOf(2.5)).distanceKm(BigDecimal.valueOf(100.0)).build();
        Route r14 = Route.builder().busCompany(chinNghia).departureLocation("Đà Nẵng").arrivalLocation("Quy Nhơn").durationHours(BigDecimal.valueOf(5.5)).distanceKm(BigDecimal.valueOf(320.0)).build();

        routeRepository.saveAll(List.of(r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14));

        // 4. Seed Pickup & Dropoff Points
        List<PickupDropoffPoint> points = List.of(
                PickupDropoffPoint.builder().route(r1).name("Bến xe Miền Tây").address("395 Kinh Dương Vương, Bình Tân, TP.HCM").pointType(PointType.PICKUP).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(r1).name("Trạm An Sương").address("QL22, Bà Điểm, Hóc Môn, TP.HCM").pointType(PointType.PICKUP).displayOrder(2).build(),
                PickupDropoffPoint.builder().route(r1).name("Bến xe Liên tỉnh Đà Lạt").address("01 Tô Hiến Thành, P.3, TP. Đà Lạt").pointType(PointType.DROPOFF).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(r1).name("Văn phòng Đà Lạt (Hồ Xuân Hương)").address("Trần Phú, TP. Đà Lạt").pointType(PointType.DROPOFF).displayOrder(2).build(),
                PickupDropoffPoint.builder().route(r4).name("Bến xe Mỹ Đình").address("Số 20 Phạm Hùng, Nam Từ Liêm, Hà Nội").pointType(PointType.PICKUP).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(r4).name("Bến xe Sa Pa").address("Điện Biên Phủ, TT. Sa Pa, Lào Cai").pointType(PointType.DROPOFF).displayOrder(1).build()
        );
        pointRepository.saveAll(points);

        // 5. Seed Trips & Seats
        LocalDateTime now = LocalDateTime.now();
        List<Trip> trips = new ArrayList<>();

        for (int day = 0; day <= 5; day++) {
            LocalDateTime depDate = now.plusDays(day);

            Trip t1 = Trip.builder().busCompany(futa).route(r1).departureTime(depDate.withHour(7).withMinute(0)).arrivalTime(depDate.withHour(13).withMinute(30)).busType(BusType.SLEEPER).price(BigDecimal.valueOf(320000)).totalSeats(34).availableSeats(30).status(TripStatus.SCHEDULED).build();
            Trip t2 = Trip.builder().busCompany(futa).route(r1).departureTime(depDate.withHour(23).withMinute(0)).arrivalTime(depDate.plusDays(1).withHour(5).withMinute(30)).busType(BusType.LIMOUSINE).price(BigDecimal.valueOf(390000)).totalSeats(34).availableSeats(28).status(TripStatus.SCHEDULED).build();
            Trip t3 = Trip.builder().busCompany(saoViet).route(r4).departureTime(depDate.withHour(6).withMinute(30)).arrivalTime(depDate.withHour(12).withMinute(0)).busType(BusType.SLEEPER).price(BigDecimal.valueOf(450000)).totalSeats(34).availableSeats(25).status(TripStatus.SCHEDULED).build();

            trips.add(t1);
            trips.add(t2);
            trips.add(t3);
        }

        tripRepository.saveAll(trips);

        for (Trip trip : trips) {
            seedSeatsForTrip(trip);
        }

        // 6. Seed Bookings & Tickets
        Booking b1 = Booking.builder().bookingCode("TE-2026-9812").passengerName("Nguyễn Văn Du Khách").passengerPhone("0912345678").passengerEmail("customer@gmail.com").trip(trips.get(0)).totalAmount(BigDecimal.valueOf(640000)).seatNumbers("A01, A02").status(BookingStatus.CONFIRMED).paymentMethod(PaymentMethod.VNPAY).build();
        Booking b2 = Booking.builder().bookingCode("TE-2026-9813").passengerName("Trần Thị Bích Ngọc").passengerPhone("0987654321").passengerEmail("tranthib@gmail.com").trip(trips.get(1)).totalAmount(BigDecimal.valueOf(390000)).seatNumbers("B05").status(BookingStatus.CONFIRMED).paymentMethod(PaymentMethod.MOMO).build();
        Booking b3 = Booking.builder().bookingCode("TE-2026-9814").passengerName("Lê Hoàng Cường").passengerPhone("0978112233").passengerEmail("lehoangc@gmail.com").trip(trips.get(2)).totalAmount(BigDecimal.valueOf(450000)).seatNumbers("A09").status(BookingStatus.PENDING).paymentMethod(PaymentMethod.VIETQR).build();

        bookingRepository.saveAll(List.of(b1, b2, b3));

        Ticket tk1 = Ticket.builder().booking(b1).ticketCode("TK-A01-9812").seatNumber("A01").price(BigDecimal.valueOf(320000)).status(TicketStatus.ISSUED).build();
        Ticket tk2 = Ticket.builder().booking(b1).ticketCode("TK-A02-9812").seatNumber("A02").price(BigDecimal.valueOf(320000)).status(TicketStatus.ISSUED).build();
        Ticket tk3 = Ticket.builder().booking(b2).ticketCode("TK-B05-9813").seatNumber("B05").price(BigDecimal.valueOf(390000)).status(TicketStatus.ISSUED).build();
        Ticket tk4 = Ticket.builder().booking(b3).ticketCode("TK-A09-9814").seatNumber("A09").price(BigDecimal.valueOf(450000)).status(TicketStatus.ISSUED).build();

        ticketRepository.saveAll(List.of(tk1, tk2, tk3, tk4));

        // 7. Seed Seat Types (Catalog)
        List<SeatType> seatTypes = List.of(
                SeatType.builder().code("SLEEPER_STANDARD").label("Giường nằm tiêu chuẩn").description("Giường bọc da cao cấp êm ái, ngả 180 độ").status("ACTIVE").build(),
                SeatType.builder().code("LIMOUSINE_VIP").label("Limousine VIP 24 chỗ").description("Cabin riêng biệt, màn hình giải trí, sạc không dây").status("ACTIVE").build(),
                SeatType.builder().code("SEATED_ECO").label("Ghế ngồi tiêu chuẩn").description("Ghế đệm êm, tựa lưng thoải mái, tiết kiệm chi phí").status("ACTIVE").build(),
                SeatType.builder().code("CABIN_SUITE").label("Cabin đôi hoàng gia").description("Phòng đôi sang trọng dành cho gia đình hoặc cặp đôi").status("ACTIVE").build()
        );
        seatTypeRepository.saveAll(seatTypes);

        // 8. Seed Seat Layout Templates
        List<SeatLayoutTemplate> templates = List.of(
                SeatLayoutTemplate.builder().name("Giường nằm 2 tầng 34 chỗ").maxFloor(2).maxRows(6).maxColumns(3).totalSeats(34).status("PUBLISHED").build(),
                SeatLayoutTemplate.builder().name("Limousine VIP 1 tầng 24 chỗ").maxFloor(1).maxRows(8).maxColumns(3).totalSeats(24).status("PUBLISHED").build(),
                SeatLayoutTemplate.builder().name("Ghế ngồi 1 tầng 45 chỗ").maxFloor(1).maxRows(11).maxColumns(4).totalSeats(45).status("PUBLISHED").build()
        );
        seatLayoutTemplateRepository.saveAll(templates);

        // 9. Seed Master Locations
        List<Location> locations = List.of(
                Location.builder().name("Bến xe Miền Đông").locationType("BUS_STATION").province("Hồ Chí Minh").address("292 Đinh Bộ Lĩnh, P.26, Q.Bình Thạnh").routesCount(12).status("ACTIVE").build(),
                Location.builder().name("Bến xe Mỹ Đình").locationType("BUS_STATION").province("Hà Nội").address("Số 20 Phạm Hùng, Mỹ Đình 2, Nam Từ Liêm").routesCount(15).status("ACTIVE").build(),
                Location.builder().name("Bến xe Liên tỉnh Đà Lạt").locationType("BUS_STATION").province("Đà Lạt").address("Số 01 Tô Hiến Thành, P.3, TP. Đà Lạt").routesCount(8).status("ACTIVE").build(),
                Location.builder().name("Bến xe Phía Nam Nha Trang").locationType("BUS_STATION").province("Nha Trang").address("Km 6 Đường 23/10, Vĩnh Trung, TP. Nha Trang").routesCount(6).status("ACTIVE").build(),
                Location.builder().name("Bến xe Trung tâm Đà Nẵng").locationType("BUS_STATION").province("Đà Nẵng").address("Tôn Đức Thắng, Hoà Minh, Liên Chiểu, TP. Đà Nẵng").routesCount(10).status("ACTIVE").build()
        );
        locationRepository.saveAll(locations);

        // 10. Seed Banners
        List<Banner> banners = List.of(
                Banner.builder().title("Ưu đãi vé xe Đà Lạt - Ngắm hoa dã quỳ").imagePath("/img/banners/dalat-promo.jpg").position("Trang chu - Top").status("ACTIVE").duration("07:00 01/09/2026 — 06:59 01/10/2026").link("https://traveleasy.vn/dalat-sale").build(),
                Banner.builder().title("Ưu đãi LIMOUSINE thương gia 2026").imagePath("/img/banners/limo-promo.jpg").position("Trang chu - Bottom").status("ACTIVE").duration("07:00 15/09/2026 — 06:59 15/10/2026").link(null).build(),
                Banner.builder().title("Mở bán vé Tết 2027 sớm - Giữ chỗ ngay").imagePath("/img/banners/tet-early.jpg").position("Trang chu - Top").status("INACTIVE").duration("07:00 01/11/2026 — 06:59 01/01/2027").link("https://traveleasy.vn/tet-early").build()
        );
        bannerRepository.saveAll(banners);

        // 11. Seed Gateway Configs
        List<GatewayConfig> gateways = List.of(
                GatewayConfig.builder().provider("VNPAY").displayName("Cổng thanh toán VNPay (ATM / QR / Visa)").category("PAYMENT").status("ACTIVE").isSandbox(true).build(),
                GatewayConfig.builder().provider("MOMO").displayName("Ví điện tử MoMo").category("PAYMENT").status("ACTIVE").isSandbox(true).build(),
                GatewayConfig.builder().provider("ZALOPAY").displayName("Ví điện tử ZaloPay").category("PAYMENT").status("ACTIVE").isSandbox(true).build(),
                GatewayConfig.builder().provider("VIETQR").displayName("Chuyển khoản ngân hàng tự động VietQR").category("PAYMENT").status("ACTIVE").isSandbox(false).build(),
                GatewayConfig.builder().provider("TELEGRAM").displayName("Bot thông báo tức thì Telegram").category("NOTIFICATION").status("ACTIVE").isSandbox(false).build(),
                GatewayConfig.builder().provider("TWILIO").displayName("Cổng gửi SMS OTP Twilio").category("NOTIFICATION").status("ACTIVE").isSandbox(true).build(),
                GatewayConfig.builder().provider("SENDGRID").displayName("Cổng gửi Email vé điện tử SendGrid").category("NOTIFICATION").status("ACTIVE").isSandbox(false).build()
        );
        gatewayConfigRepository.saveAll(gateways);

        // 12. Seed Review Reports
        List<ReviewReport> reports = List.of(
                ReviewReport.builder().reporterEmail("tran.b@example.com").reviewAuthor("spammer@gmail.com").reason("Ngôn từ không phù hợp, xúc phạm tài xế").reviewSnippet("\"Tài xế lái ẩu, thái độ phục vụ quá tệ...\"").rating(1).status("PENDING").build(),
                ReviewReport.builder().reporterEmail("nguyen.a@example.com").reviewAuthor("troll@gmail.com").reason("Nội dung quảng cáo sai sự thật").reviewSnippet("\"Đi xe bên nhà xe này dở lắm, qua bên nhà xe khác đi...\"").rating(1).status("PENDING").build(),
                ReviewReport.builder().reporterEmail("customer@gmail.com").reviewAuthor("baduser@gmail.com").reason("Spam đánh giá tiêu cực không đi xe").reviewSnippet("\"Hủy chuyến vô lý, lừa đảo khách hàng...\"").rating(1).status("APPROVED").build()
        );
        reviewReportRepository.saveAll(reports);

        // 13. Seed Cancellation Policies
        List<CancellationPolicy> policies = List.of(
                CancellationPolicy.builder().name("Chính sách hoàn huỷ mặc định sàn").isDefault(true).busCompanyName(null).description("Áp dụng cho mọi nhà xe đối tác chưa cấu hình chính sách riêng").rulesCount(3).build(),
                CancellationPolicy.builder().name("Chính sách hoàn huỷ VIP TravelEasy Express").isDefault(false).busCompanyName("TravelEasy Express").description("Chính sách ưu tiên hoàn tiền 100% trước 24 giờ").rulesCount(3).build()
        );
        cancellationPolicyRepository.saveAll(policies);

        // 14. Seed Audit Logs
        List<AuditLog> auditLogs = List.of(
                AuditLog.builder().userEmail("admin@traveleasy.vn").action("APPROVE_COMPANY").target("bus_companies #bc1").beforeState("{\"status\": \"PENDING_APPROVAL\"}").afterState("{\"status\": \"ACTIVE\"}").build(),
                AuditLog.builder().userEmail("admin@traveleasy.vn").action("APPROVE_COMPANY").target("bus_companies #bc2").beforeState("{\"status\": \"PENDING_APPROVAL\"}").afterState("{\"status\": \"ACTIVE\"}").build(),
                AuditLog.builder().userEmail("admin@traveleasy.vn").action("SUSPEND_COMPANY").target("bus_companies #bc4").beforeState("{\"status\": \"ACTIVE\"}").afterState("{\"status\": \"SUSPENDED\"}").build(),
                AuditLog.builder().userEmail("partner@traveleasy.vn").action("CREATE_VEHICLE").target("vehicles #v1").beforeState("-").afterState("{\"license_plate\": \"51B-123.45\", \"vehicle_type\": \"SLEEPER\"}").build(),
                AuditLog.builder().userEmail("admin@traveleasy.vn").action("APPROVE_REVIEW_REPORT").target("review_reports #rp1").beforeState("{\"status\": \"PENDING\"}").afterState("{\"status\": \"APPROVED\"}").build(),
                AuditLog.builder().userEmail("partner@traveleasy.vn").action("CREATE_ROUTE").target("route_templates #rt1").beforeState("-").afterState("{\"name\": \"Sai Gon - Da Lat\"}").build(),
                AuditLog.builder().userEmail("admin@traveleasy.vn").action("UPDATE_BANNER").target("banners #bn1").beforeState("{\"is_active\": false}").afterState("{\"is_active\": true}").build(),
                AuditLog.builder().userEmail("partner@traveleasy.vn").action("CANCEL_TRIP").target("trips #t5").beforeState("{\"status\": \"SCHEDULED\"}").afterState("{\"status\": \"CANCELLED\"}").build()
        );
        auditLogRepository.saveAll(auditLogs);

        log.info("TravelEasy Platform initial data seeded successfully!");
    }

    private void seedSeatsForTrip(Trip trip) {
        List<TripSeat> seats = new ArrayList<>();

        // Floor 1 (A01 - A17)
        for (int i = 1; i <= 17; i++) {
            String seatCode = String.format("A%02d", i);
            SeatStatus status = (i == 1 || i == 2) ? SeatStatus.BOOKED : SeatStatus.AVAILABLE;
            seats.add(TripSeat.builder()
                    .trip(trip)
                    .seatCode(seatCode)
                    .floor(1)
                    .rowNum((i - 1) / 3 + 1)
                    .colNum((i - 1) % 3 + 1)
                    .seatType("STANDARD")
                    .status(status)
                    .build());
        }

        // Floor 2 (B01 - B17)
        for (int i = 1; i <= 17; i++) {
            String seatCode = String.format("B%02d", i);
            seats.add(TripSeat.builder()
                    .trip(trip)
                    .seatCode(seatCode)
                    .floor(2)
                    .rowNum((i - 1) / 3 + 1)
                    .colNum((i - 1) % 3 + 1)
                    .seatType("VIP")
                    .status(SeatStatus.AVAILABLE)
                    .build());
        }

        tripSeatRepository.saveAll(seats);
    }
}
