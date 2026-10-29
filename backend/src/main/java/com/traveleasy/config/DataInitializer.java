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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("🚀 [TRAVELEASY] Database already fully seeded on Supabase with 18 tables. Ready!");
            return;
        }

        log.info("Seeding rich initial data for TravelEasy Platform...");

        // 1. Seed Users (Admins, Operators, Customers)
        String encodedPass = passwordEncoder.encode("123456789@");

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

        // More Diverse Operators & Customers
        User opThanhBuoi = User.builder().email("dieuhanh@thanhbuoi.com.vn").password(encodedPass).fullName("Điều Hành Thành Bưởi").phone("0908123456").role(Role.OPERATOR).status("ACTIVE").build();
        User opSaoViet = User.builder().email("dieuhanh@xesaoviet.com.vn").password(encodedPass).fullName("Điều Hành Sao Việt Express").phone("0907234567").role(Role.OPERATOR).status("ACTIVE").build();
        User opKumho = User.builder().email("dieuhanh@kumhosamco.com.vn").password(encodedPass).fullName("Điều Hành Kumho Samco").phone("0906345678").role(Role.OPERATOR).status("ACTIVE").build();
        User opCucTung = User.builder().email("dieuhanh@cuctunglimousine.com").password(encodedPass).fullName("Điều Hành Cúc Tùng Limousine").phone("0905456789").role(Role.OPERATOR).status("ACTIVE").build();
        User opHaiVan = User.builder().email("dieuhanh@haivan.com").password(encodedPass).fullName("Điều Hành Xe Hải Vân").phone("0904567890").role(Role.OPERATOR).status("ACTIVE").build();
        User opChinNghia = User.builder().email("dieuhanh@chinnghia.com.vn").password(encodedPass).fullName("Điều Hành Xe Chín Nghĩa").phone("0903678901").role(Role.OPERATOR).status("ACTIVE").build();

        User cust6 = User.builder().email("dangvanlam@gmail.com").password(encodedPass).fullName("Đặng Văn Lâm").phone("0918112233").role(Role.CUSTOMER).status("ACTIVE").build();
        User cust7 = User.builder().email("thuylinh.travel@gmail.com").password(encodedPass).fullName("Nguyễn Thùy Linh").phone("0935667788").role(Role.CUSTOMER).status("ACTIVE").build();
        User cust8 = User.builder().email("khoi.vu@gmail.com").password(encodedPass).fullName("Vũ Minh Khôi").phone("0904889900").role(Role.CUSTOMER).status("ACTIVE").build();
        User cust9 = User.builder().email("haidang.do@gmail.com").password(encodedPass).fullName("Đỗ Hải Đăng").phone("0923445566").role(Role.CUSTOMER).status("ACTIVE").build();
        User cust10 = User.builder().email("thaophuong.bui@gmail.com").password(encodedPass).fullName("Bùi Phương Thảo").phone("0966778899").role(Role.CUSTOMER).status("ACTIVE").build();
        User cust11 = User.builder().email("tuanmai@gmail.com").password(encodedPass).fullName("Mai Anh Tuấn").phone("0977112244").role(Role.CUSTOMER).status("ACTIVE").build();
        User cust12 = User.builder().email("ngale@gmail.com").password(encodedPass).fullName("Lê Thanh Nga").phone("0989223355").role(Role.CUSTOMER).status("ACTIVE").build();
        User cust13 = User.builder().email("ducanh.tran@gmail.com").password(encodedPass).fullName("Trần Đức Anh").phone("0914556677").role(Role.CUSTOMER).status("ACTIVE").build();
        User cust14 = User.builder().email("lanhuong.nguyen@gmail.com").password(encodedPass).fullName("Nguyễn Lan Hương").phone("0922334455").role(Role.CUSTOMER).status("ACTIVE").build();
        User cust15 = User.builder().email("quanghuy.pham@gmail.com").password(encodedPass).fullName("Phạm Quang Huy").phone("0933557799").role(Role.CUSTOMER).status("ACTIVE").build();

        userRepository.saveAll(List.of(
                admin1, admin2, admin3, opFuta, opHoaMai, opHoangLong, opVanMinh,
                opThanhBuoi, opSaoViet, opKumho, opCucTung, opHaiVan, opChinNghia,
                cust1, cust2, cust3, cust4, cust5,
                cust6, cust7, cust8, cust9, cust10, cust11, cust12, cust13, cust14, cust15
        ));

        // 2. Seed 10 Bus Companies (Cloudinary Logos)
        BusCompany futa = BusCompany.builder().name("TravelEasy Express").code("SK-2024-001").hotline("1900 6067").email("contact@traveleasy.vn").address("Bến xe Miền Tây, TP. Hồ Chí Minh").logoUrl("https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289372/traveleasy/bus-companies/logo_futa_buslines.jpg").status("ACTIVE").averageRating(BigDecimal.valueOf(4.9)).build();
        BusCompany thanhBuoi = BusCompany.builder().name("Thành Bưởi Limousine").code("SK-2024-002").hotline("1900 6079").email("info@thanhbuoi.com.vn").address("266 Lê Hồng Phong, Quận 5, TP. Hồ Chí Minh").logoUrl("https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289373/traveleasy/bus-companies/logo_thanh_buoi.jpg").status("ACTIVE").averageRating(BigDecimal.valueOf(4.8)).build();
        BusCompany saoViet = BusCompany.builder().name("Sao Việt Express").code("SK-2024-003").hotline("1900 6746").email("contact@xesaoviet.com.vn").address("779 Giải Phóng, Hoàng Mai, Hà Nội").logoUrl("https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289374/traveleasy/bus-companies/logo_sao_viet.jpg").status("ACTIVE").averageRating(BigDecimal.valueOf(4.7)).build();
        BusCompany kumho = BusCompany.builder().name("Kumho Samco Buslines").code("SK-2024-004").hotline("1900 6065").email("cskh@kumhosamco.com.vn").address("292 Đinh Bộ Lĩnh, Bình Thạnh, TP. Hồ Chí Minh").logoUrl("https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289408/traveleasy/bus-companies/logo_kumho_samco.jpg").status("PENDING_APPROVAL").averageRating(BigDecimal.valueOf(4.8)).build();
        BusCompany hoaMai = BusCompany.builder().name("Xe Khách Hoa Mai").code("SK-2024-005").hotline("1900 599 997").email("info@hoamaivungtau.com.vn").address("47 Trưng Nhị, Phường 1, TP. Vũng Tàu").logoUrl("https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289376/traveleasy/bus-companies/logo_hoa_mai.jpg").status("ACTIVE").averageRating(BigDecimal.valueOf(4.9)).build();
        BusCompany hoangLong = BusCompany.builder().name("Hoàng Long Asia").code("SK-2024-006").hotline("0225 3920 920").email("info@hoanglongasia.com").address("05 Phạm Ngũ Lão, Ngô Quyền, Hải Phòng").logoUrl("https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289377/traveleasy/bus-companies/logo_hoang_long.jpg").status("SUSPENDED").averageRating(BigDecimal.valueOf(4.7)).build();
        BusCompany vanMinh = BusCompany.builder().name("Nhà Xe Văn Minh").code("SK-2024-007").hotline("1900 6467").email("vanminh@vanminh74.vn").address("101 Lý Thường Kiệt, TP. Vinh, Nghệ An").logoUrl("https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289377/traveleasy/bus-companies/logo_van_minh.jpg").status("ACTIVE").averageRating(BigDecimal.valueOf(4.9)).build();
        BusCompany cucTung = BusCompany.builder().name("Cúc Tùng Limousine").code("SK-2024-008").hotline("1900 6606").email("cuctunglimousine@gmail.com").address("Bến xe phía Nam Nha Trang, Khánh Hòa").logoUrl("https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289409/traveleasy/bus-companies/logo_cuc_tung.jpg").status("ACTIVE").averageRating(BigDecimal.valueOf(4.8)).build();
        BusCompany haiVan = BusCompany.builder().name("Hải Vân Express").code("SK-2024-009").hotline("1900 6763").email("cskh@haivan.com").address("Tòa nhà N2E Lê Văn Lương, Nhân Chính, Thanh Xuân, Hà Nội").logoUrl("https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289379/traveleasy/bus-companies/logo_hai_van.jpg").status("ACTIVE").averageRating(BigDecimal.valueOf(4.8)).build();
        BusCompany chinNghia = BusCompany.builder().name("Chín Nghĩa").code("SK-2024-010").hotline("1900 636 636").email("chinnghiaquangngai@gmail.com").address("06 Đinh Tiên Hoàng, Nghĩa Chánh, TP. Quảng Ngãi").logoUrl("https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289379/traveleasy/bus-companies/logo_chin_nghia.jpg").status("ACTIVE").averageRating(BigDecimal.valueOf(4.7)).build();

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
        supplementRoutePickupDropoffPoints();

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

        // 10. Seed Banners (Cloudinary Official URLs)
        List<Banner> banners = List.of(
                Banner.builder().title("Mùa Thu Vàng Săn Mây Sa Pa - Giảm ngay 20% vé Limousine").imagePath("https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289364/traveleasy/banners/banner_hero_sapa_fansipan.jpg").position("Trang chu - Top").status("ACTIVE").duration("07:00 01/09/2026 — 23:59 31/12/2026").link("/promotions").build(),
                Banner.builder().title("Du Lịch Đà Lạt Mộng Mơ - Săn Vé Giường Nằm VIP Giảm 50K").imagePath("https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289365/traveleasy/banners/banner_hero_dalat_mongmo.jpg").position("Trang chu - Khuyen mai").status("ACTIVE").duration("07:00 01/09/2026 — 23:59 31/12/2026").link("/promotions").build(),
                Banner.builder().title("Khám Phá Biển Xanh Nha Trang - FUTA Bus Lines đồng hành cùng bạn").imagePath("https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289366/traveleasy/banners/banner_hero_nhatrang_bienxanh.jpg").position("Trang chu - Tuyen hot").status("ACTIVE").duration("07:00 01/09/2026 — 23:59 31/12/2026").link("/search?destination=Nha+Trang").build(),
                Banner.builder().title("Liên kết Thẻ Ngân Hàng MB Bank - Quét PayOS VietQR giảm ngay 30K").imagePath("https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289407/traveleasy/banners/banner_promo_payos_mbbank.jpg").position("Trang chu - Top").status("ACTIVE").duration("07:00 01/10/2026 — 23:59 31/12/2026").link("/promotions").build()
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
        seedDefaultVehicles(futa);

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

    private void seedDefaultVehicles(BusCompany futa) {
        List<Vehicle> vehicles = List.of(
                Vehicle.builder()
                        .busCompany(futa)
                        .plateNumber("51B-123.45")
                        .vehicleCode("v1")
                        .vehicleType("SLEEPER")
                        .floors(2)
                        .manufactureYear(2022)
                        .seatLayout("Giường nằm 2 tầng 34 chỗ")
                        .imageUrl("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&auto=format&fit=crop&q=60")
                        .status("ACTIVE")
                        .build(),
                Vehicle.builder()
                        .busCompany(futa)
                        .plateNumber("51B-987.65")
                        .vehicleCode("v2")
                        .vehicleType("LIMOUSINE")
                        .floors(1)
                        .manufactureYear(2023)
                        .seatLayout("Ghế ngồi 1 tầng 24 chỗ (Limousine)")
                        .status("ACTIVE")
                        .build(),
                Vehicle.builder()
                        .busCompany(futa)
                        .plateNumber("51B-111.22")
                        .vehicleCode("v4")
                        .vehicleType("SEATED")
                        .floors(1)
                        .manufactureYear(2018)
                        .seatLayout("Ghế ngồi 1 tầng 45 chỗ")
                        .status("INACTIVE")
                        .build()
        );
        vehicleRepository.saveAll(vehicles);
        log.info("Default vehicles seeded successfully!");
    }

    private void syncDemoPasswordForAllUsers() {
        try {
            String demoPass = passwordEncoder.encode("123456789@");
            List<User> allUsers = userRepository.findAll();
            if (!allUsers.isEmpty()) {
                for (User u : allUsers) {
                    u.setPassword(demoPass);
                }
                userRepository.saveAll(allUsers);
                log.info("🔐 [DEMO AUTH] Đã đồng bộ mật khẩu của toàn bộ {} tài khoản người dùng thành: 123456789@", allUsers.size());
            }
        } catch (Exception e) {
            log.error("Lỗi khi đồng bộ mật khẩu demo: {}", e.getMessage());
        }
    }

    private void supplementEarlyMorningTripsAndBusCompanies() {
        log.info("Checking and supplementing Bus Companies, Operator Accounts and Early Morning Trips (00:00 - 06:00)...");
        String encodedPass = passwordEncoder.encode("123456789@");

        // 1. Bổ sung các Nhà xe lớn còn thiếu
        if (!busCompanyRepository.existsByName("Phương Trang FUTA Bus Lines")) {
            BusCompany phuongTrang = BusCompany.builder()
                    .name("Phương Trang FUTA Bus Lines")
                    .code("SK-2024-011")
                    .hotline("1900 6067")
                    .email("hotro@futabus.vn")
                    .address("Bến xe Miền Tây, 395 Kinh Dương Vương, TP. Hồ Chí Minh")
                    .logoUrl("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&auto=format&fit=crop&q=80")
                    .status("ACTIVE")
                    .averageRating(BigDecimal.valueOf(4.9))
                    .build();
            busCompanyRepository.save(phuongTrang);
        }

        if (!busCompanyRepository.existsByName("Xe Khách Liên Hưng")) {
            BusCompany lienHung = BusCompany.builder()
                    .name("Xe Khách Liên Hưng")
                    .code("SK-2024-012")
                    .hotline("1900 2679")
                    .email("cskh@xekhachlienhung.com")
                    .address("77 Thái Nguyên, Phước Tân, TP. Nha Trang, Khánh Hòa")
                    .logoUrl("https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=150&auto=format&fit=crop&q=80")
                    .status("ACTIVE")
                    .averageRating(BigDecimal.valueOf(4.8))
                    .build();
            busCompanyRepository.save(lienHung);
        }

        if (!busCompanyRepository.existsByName("Hà Lan Limousine")) {
            BusCompany haLan = BusCompany.builder()
                    .name("Hà Lan Limousine")
                    .code("SK-2024-013")
                    .hotline("1900 1198")
                    .email("dieuhanh@halan.com.vn")
                    .address("Bến xe Mỹ Đình, Phạm Hùng, Nam Từ Liêm, Hà Nội")
                    .logoUrl("https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=150&auto=format&fit=crop&q=80")
                    .status("ACTIVE")
                    .averageRating(BigDecimal.valueOf(4.9))
                    .build();
            busCompanyRepository.save(haLan);
        }

        if (!busCompanyRepository.existsByName("DCar Limousine VIP")) {
            BusCompany dCar = BusCompany.builder()
                    .name("DCar Limousine VIP")
                    .code("SK-2024-014")
                    .hotline("1900 6868")
                    .email("dieuhanh@dcarlimousine.vn")
                    .address("Sân bay Tân Sơn Nhất, Quận Tân Bình, TP. Hồ Chí Minh")
                    .logoUrl("https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=150&auto=format&fit=crop&q=80")
                    .status("ACTIVE")
                    .averageRating(BigDecimal.valueOf(5.0))
                    .build();
            busCompanyRepository.save(dCar);
        }

        if (!busCompanyRepository.existsByName("An Phú Quý Limousine")) {
            BusCompany anPhuQuy = BusCompany.builder()
                    .name("An Phú Quý Limousine")
                    .code("SK-2024-015")
                    .hotline("1900 545 555")
                    .email("dieuhanh@anphuquy.vn")
                    .address("Bến xe Nước Ngầm, Hoàng Mai, Hà Nội")
                    .logoUrl("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&auto=format&fit=crop&q=80")
                    .status("ACTIVE")
                    .averageRating(BigDecimal.valueOf(4.8))
                    .build();
            busCompanyRepository.save(anPhuQuy);
        }

        // 2. Bổ sung Tài khoản điều hành (OPERATOR) cho từng Nhà xe
        List<User> newOperators = new ArrayList<>();
        if (!userRepository.existsByEmail("dieuhanh@futabus.vn")) {
            newOperators.add(User.builder().email("dieuhanh@futabus.vn").password(encodedPass).fullName("Điều Hành Phương Trang FUTA").phone("0901889900").role(Role.OPERATOR).status("ACTIVE").build());
        }
        if (!userRepository.existsByEmail("dieuhanh@xekhachlienhung.com")) {
            newOperators.add(User.builder().email("dieuhanh@xekhachlienhung.com").password(encodedPass).fullName("Điều Hành Xe Liên Hưng").phone("0902889911").role(Role.OPERATOR).status("ACTIVE").build());
        }
        if (!userRepository.existsByEmail("dieuhanh@halan.com.vn")) {
            newOperators.add(User.builder().email("dieuhanh@halan.com.vn").password(encodedPass).fullName("Điều Hành Hà Lan Limousine").phone("0903889922").role(Role.OPERATOR).status("ACTIVE").build());
        }
        if (!userRepository.existsByEmail("dieuhanh@dcarlimousine.vn")) {
            newOperators.add(User.builder().email("dieuhanh@dcarlimousine.vn").password(encodedPass).fullName("Điều Hành DCar VIP").phone("0904889933").role(Role.OPERATOR).status("ACTIVE").build());
        }
        if (!userRepository.existsByEmail("dieuhanh@anphuquy.vn")) {
            newOperators.add(User.builder().email("dieuhanh@anphuquy.vn").password(encodedPass).fullName("Điều Hành An Phú Quý").phone("0905889944").role(Role.OPERATOR).status("ACTIVE").build());
        }
        if (!newOperators.isEmpty()) {
            userRepository.saveAll(newOperators);
        }

        // 3. Đảm bảo tuyến đường Chiều về tồn tại kèm điểm đón/trả
        BusCompany defaultCompany = busCompanyRepository.findAll().stream().findFirst().orElse(null);
        if (defaultCompany == null) return;

        Route rHanoiSapa = routeRepository.findByDepartureLocationAndArrivalLocation("Hà Nội", "Sa Pa").orElse(null);
        Route rSapaHanoi = routeRepository.findByDepartureLocationAndArrivalLocation("Sa Pa", "Hà Nội").orElse(null);
        if (rSapaHanoi == null) {
            rSapaHanoi = Route.builder()
                    .busCompany(defaultCompany)
                    .departureLocation("Sa Pa")
                    .arrivalLocation("Hà Nội")
                    .durationHours(BigDecimal.valueOf(5.5))
                    .distanceKm(BigDecimal.valueOf(315.0))
                    .build();
            routeRepository.save(rSapaHanoi);

            pointRepository.saveAll(List.of(
                    PickupDropoffPoint.builder().route(rSapaHanoi).name("Bến xe Sa Pa").address("Điện Biên Phủ, TT. Sa Pa, Lào Cai").pointType(PointType.PICKUP).displayOrder(1).build(),
                    PickupDropoffPoint.builder().route(rSapaHanoi).name("Văn phòng Sa Pa (Nhà Thờ Đá)").address("Thạch Sơn, Sa Pa").pointType(PointType.PICKUP).displayOrder(2).build(),
                    PickupDropoffPoint.builder().route(rSapaHanoi).name("Bến xe Mỹ Đình").address("Số 20 Phạm Hùng, Nam Từ Liêm, Hà Nội").pointType(PointType.DROPOFF).displayOrder(1).build(),
                    PickupDropoffPoint.builder().route(rSapaHanoi).name("Bến xe Giáp Bát").address("Giải Phóng, Hoàng Mai, Hà Nội").pointType(PointType.DROPOFF).displayOrder(2).build()
            ));
        }

        Route rHcmDalat = routeRepository.findByDepartureLocationAndArrivalLocation("TP. Hồ Chí Minh", "Đà Lạt").orElse(null);
        Route rDalatHcm = routeRepository.findByDepartureLocationAndArrivalLocation("Đà Lạt", "TP. Hồ Chí Minh").orElse(null);
        if (rDalatHcm == null) {
            rDalatHcm = Route.builder()
                    .busCompany(defaultCompany)
                    .departureLocation("Đà Lạt")
                    .arrivalLocation("TP. Hồ Chí Minh")
                    .durationHours(BigDecimal.valueOf(6.5))
                    .distanceKm(BigDecimal.valueOf(305.0))
                    .build();
            routeRepository.save(rDalatHcm);

            pointRepository.saveAll(List.of(
                    PickupDropoffPoint.builder().route(rDalatHcm).name("Bến xe Liên tỉnh Đà Lạt").address("01 Tô Hiến Thành, P.3, TP. Đà Lạt").pointType(PointType.PICKUP).displayOrder(1).build(),
                    PickupDropoffPoint.builder().route(rDalatHcm).name("Văn phòng Đà Lạt (Hồ Xuân Hương)").address("Trần Phú, TP. Đà Lạt").pointType(PointType.PICKUP).displayOrder(2).build(),
                    PickupDropoffPoint.builder().route(rDalatHcm).name("Bến xe Miền Đông mới").address("501 Hoàng Hữu Nam, TP. Thủ Đức, TP.HCM").pointType(PointType.DROPOFF).displayOrder(1).build(),
                    PickupDropoffPoint.builder().route(rDalatHcm).name("Bến xe Miền Tây").address("395 Kinh Dương Vương, Bình Tân, TP.HCM").pointType(PointType.DROPOFF).displayOrder(2).build()
            ));
        }

        // 4. Bổ sung các Chuyến xe khung giờ Sáng sớm (00:00 - 06:00) cho 7 ngày tới
        BusCompany saoViet = busCompanyRepository.findByName("Sao Việt Express").orElse(defaultCompany);
        BusCompany futa = busCompanyRepository.findByName("TravelEasy Express").orElse(defaultCompany);
        BusCompany thanhBuoi = busCompanyRepository.findByName("Thành Bưởi Limousine").orElse(defaultCompany);
        BusCompany haiVan = busCompanyRepository.findByName("Hải Vân Express").orElse(defaultCompany);
        BusCompany hoaMai = busCompanyRepository.findByName("Xe Khách Hoa Mai").orElse(defaultCompany);

        List<Trip> newTrips = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int day = 0; day <= 6; day++) {
            LocalDate date = today.plusDays(day);

            // === Hà Nội -> Sa Pa (r4): Khung giờ 00h - 06h sáng ===
            if (rHanoiSapa != null) {
                // Chuyến 00:30 (Đêm muộn / Rạng sáng)
                LocalDateTime t0030 = date.atTime(0, 30);
                if (!tripRepository.existsByRouteIdAndDepartureTime(rHanoiSapa.getId(), t0030)) {
                    newTrips.add(Trip.builder()
                            .busCompany(saoViet)
                            .route(rHanoiSapa)
                            .departureTime(t0030)
                            .arrivalTime(t0030.plusHours(5).plusMinutes(30))
                            .busType(BusType.LIMOUSINE)
                            .price(BigDecimal.valueOf(450000))
                            .totalSeats(34)
                            .availableSeats(28)
                            .status(TripStatus.SCHEDULED)
                            .build());
                }

                // Chuyến 04:30 (Sáng sớm)
                LocalDateTime t0430 = date.atTime(4, 30);
                if (!tripRepository.existsByRouteIdAndDepartureTime(rHanoiSapa.getId(), t0430)) {
                    newTrips.add(Trip.builder()
                            .busCompany(haiVan)
                            .route(rHanoiSapa)
                            .departureTime(t0430)
                            .arrivalTime(t0430.plusHours(5).plusMinutes(30))
                            .busType(BusType.SLEEPER)
                            .price(BigDecimal.valueOf(420000))
                            .totalSeats(34)
                            .availableSeats(22)
                            .status(TripStatus.SCHEDULED)
                            .build());
                }

                // Chuyến 05:30 (Sáng sớm đón sương mù Sa Pa)
                LocalDateTime t0530 = date.atTime(5, 30);
                if (!tripRepository.existsByRouteIdAndDepartureTime(rHanoiSapa.getId(), t0530)) {
                    newTrips.add(Trip.builder()
                            .busCompany(saoViet)
                            .route(rHanoiSapa)
                            .departureTime(t0530)
                            .arrivalTime(t0530.plusHours(5).plusMinutes(30))
                            .busType(BusType.LIMOUSINE)
                            .price(BigDecimal.valueOf(480000))
                            .totalSeats(34)
                            .availableSeats(25)
                            .status(TripStatus.SCHEDULED)
                            .build());
                }
            }

            // === Sa Pa -> Hà Nội: Khung giờ 00h - 06h sáng ===
            if (rSapaHanoi != null) {
                LocalDateTime t0030Ret = date.atTime(0, 30);
                if (!tripRepository.existsByRouteIdAndDepartureTime(rSapaHanoi.getId(), t0030Ret)) {
                    newTrips.add(Trip.builder()
                            .busCompany(saoViet)
                            .route(rSapaHanoi)
                            .departureTime(t0030Ret)
                            .arrivalTime(t0030Ret.plusHours(5).plusMinutes(30))
                            .busType(BusType.LIMOUSINE)
                            .price(BigDecimal.valueOf(450000))
                            .totalSeats(34)
                            .availableSeats(26)
                            .status(TripStatus.SCHEDULED)
                            .build());
                }

                LocalDateTime t0500Ret = date.atTime(5, 0);
                if (!tripRepository.existsByRouteIdAndDepartureTime(rSapaHanoi.getId(), t0500Ret)) {
                    newTrips.add(Trip.builder()
                            .busCompany(haiVan)
                            .route(rSapaHanoi)
                            .departureTime(t0500Ret)
                            .arrivalTime(t0500Ret.plusHours(5).plusMinutes(30))
                            .busType(BusType.SLEEPER)
                            .price(BigDecimal.valueOf(420000))
                            .totalSeats(34)
                            .availableSeats(20)
                            .status(TripStatus.SCHEDULED)
                            .build());
                }
            }

            // === TP. Hồ Chí Minh -> Đà Lạt: Khung giờ 00h - 06h sáng ===
            if (rHcmDalat != null) {
                LocalDateTime t0030 = date.atTime(0, 30);
                if (!tripRepository.existsByRouteIdAndDepartureTime(rHcmDalat.getId(), t0030)) {
                    newTrips.add(Trip.builder()
                            .busCompany(futa)
                            .route(rHcmDalat)
                            .departureTime(t0030)
                            .arrivalTime(t0030.plusHours(6).plusMinutes(30))
                            .busType(BusType.LIMOUSINE)
                            .price(BigDecimal.valueOf(390000))
                            .totalSeats(34)
                            .availableSeats(30)
                            .status(TripStatus.SCHEDULED)
                            .build());
                }

                LocalDateTime t0500 = date.atTime(5, 0);
                if (!tripRepository.existsByRouteIdAndDepartureTime(rHcmDalat.getId(), t0500)) {
                    newTrips.add(Trip.builder()
                            .busCompany(thanhBuoi)
                            .route(rHcmDalat)
                            .departureTime(t0500)
                            .arrivalTime(t0500.plusHours(6).plusMinutes(30))
                            .busType(BusType.SLEEPER)
                            .price(BigDecimal.valueOf(320000))
                            .totalSeats(34)
                            .availableSeats(24)
                            .status(TripStatus.SCHEDULED)
                            .build());
                }
            }

            // === Đà Lạt -> TP. Hồ Chí Minh: Khung giờ 00h - 06h sáng ===
            if (rDalatHcm != null) {
                LocalDateTime t0030 = date.atTime(0, 30);
                if (!tripRepository.existsByRouteIdAndDepartureTime(rDalatHcm.getId(), t0030)) {
                    newTrips.add(Trip.builder()
                            .busCompany(thanhBuoi)
                            .route(rDalatHcm)
                            .departureTime(t0030)
                            .arrivalTime(t0030.plusHours(6).plusMinutes(30))
                            .busType(BusType.LIMOUSINE)
                            .price(BigDecimal.valueOf(390000))
                            .totalSeats(34)
                            .availableSeats(27)
                            .status(TripStatus.SCHEDULED)
                            .build());
                }

                LocalDateTime t0430 = date.atTime(4, 30);
                if (!tripRepository.existsByRouteIdAndDepartureTime(rDalatHcm.getId(), t0430)) {
                    newTrips.add(Trip.builder()
                            .busCompany(futa)
                            .route(rDalatHcm)
                            .departureTime(t0430)
                            .arrivalTime(t0430.plusHours(6).plusMinutes(30))
                            .busType(BusType.SLEEPER)
                            .price(BigDecimal.valueOf(320000))
                            .totalSeats(34)
                            .availableSeats(21)
                            .status(TripStatus.SCHEDULED)
                            .build());
                }
            }
        }

        if (!newTrips.isEmpty()) {
            tripRepository.saveAll(newTrips);
            for (Trip trip : newTrips) {
                seedSeatsForTrip(trip);
            }
            log.info("Bổ sung thành công {} chuyến xe khung giờ sáng sớm (00:00 - 06:00) kèm sơ đồ ghế!", newTrips.size());
        }

        // 5. Đảm bảo tất cả các tuyến đường đều có điểm đón / trả thực tế và chi tiết
        supplementRoutePickupDropoffPoints();
    }

    private void supplementRoutePickupDropoffPoints() {
        List<Route> allRoutes = routeRepository.findAll();
        List<PickupDropoffPoint> pointsToSave = new ArrayList<>();

        for (Route route : allRoutes) {
            List<PickupDropoffPoint> existingPoints = pointRepository.findByRouteIdOrderByDisplayOrderAsc(route.getId());
            if (existingPoints != null && !existingPoints.isEmpty()) {
                continue;
            }

            String orig = route.getDepartureLocation();
            String dest = route.getArrivalLocation();

            // Điểm đón theo thành phố khởi hành
            List<PointTemplate> pickupTemplates = getPointTemplatesForCity(orig, PointType.PICKUP);
            int order = 1;
            for (PointTemplate pt : pickupTemplates) {
                pointsToSave.add(PickupDropoffPoint.builder()
                        .route(route)
                        .name(pt.name)
                        .address(pt.address)
                        .pointType(PointType.PICKUP)
                        .displayOrder(order++)
                        .build());
            }

            // Điểm trả theo thành phố đến
            List<PointTemplate> dropoffTemplates = getPointTemplatesForCity(dest, PointType.DROPOFF);
            order = 1;
            for (PointTemplate dt : dropoffTemplates) {
                pointsToSave.add(PickupDropoffPoint.builder()
                        .route(route)
                        .name(dt.name)
                        .address(dt.address)
                        .pointType(PointType.DROPOFF)
                        .displayOrder(order++)
                        .build());
            }
        }

        if (!pointsToSave.isEmpty()) {
            pointRepository.saveAll(pointsToSave);
            log.info("Bổ sung thành công {} điểm đón / trả chi tiết cho các tuyến đường chưa có điểm dừng!", pointsToSave.size());
        }
    }

    private static class PointTemplate {
        String name;
        String address;
        PointTemplate(String name, String address) {
            this.name = name;
            this.address = address;
        }
    }

    private List<PointTemplate> getPointTemplatesForCity(String city, PointType type) {
        if (city == null) city = "";
        String c = city.toLowerCase();

        if (c.contains("hồ chí minh") || c.contains("sài gòn") || c.contains("tp.hcm")) {
            if (type == PointType.PICKUP) {
                return List.of(
                        new PointTemplate("Bến xe Miền Tây", "395 Kinh Dương Vương, P. An Lạc, Q. Bình Tân, TP.HCM"),
                        new PointTemplate("Bến xe Miền Đông mới", "501 Hoàng Hữu Nam, P. Long Bình, TP. Thủ Đức, TP.HCM"),
                        new PointTemplate("Văn phòng Quận 1 (Phạm Ngũ Lão)", "272 Đề Thám, P. Phạm Ngũ Lão, Quận 1, TP.HCM"),
                        new PointTemplate("Trạm đón Ngã 4 Hàng Xanh", "486 Điện Biên Phủ, P. 21, Q. Bình Thạnh, TP.HCM"),
                        new PointTemplate("Trạm dừng chân An Sương", "QL22, Xã Bà Điểm, Huyện Hóc Môn, TP.HCM")
                );
            } else {
                return List.of(
                        new PointTemplate("Bến xe Miền Tây", "395 Kinh Dương Vương, P. An Lạc, Q. Bình Tân, TP.HCM"),
                        new PointTemplate("Bến xe Miền Đông mới", "501 Hoàng Hữu Nam, P. Long Bình, TP. Thủ Đức, TP.HCM"),
                        new PointTemplate("Văn phòng Quận 1", "272 Đề Thám, P. Phạm Ngũ Lão, Quận 1, TP.HCM"),
                        new PointTemplate("Sân bay Tân Sơn Nhất", "Ga Quốc nội, Phường 2, Q. Tân Bình, TP.HCM")
                );
            }
        }

        if (c.contains("đà nẵng")) {
            return List.of(
                    new PointTemplate("Bến xe Trung tâm Đà Nẵng", "185 Tôn Đức Thắng, P. Hòa Minh, Q. Liên Chiểu, Đà Nẵng"),
                    new PointTemplate("Văn phòng Cầu Rồng - Hải Châu", "45 Nguyễn Văn Linh, P. Nam Dương, Q. Hải Châu, Đà Nẵng"),
                    new PointTemplate("Trạm đón Ngũ Hành Sơn", "322 Lê Văn Hiến, P. Khuê Mỹ, Q. Ngũ Hành Sơn, Đà Nẵng"),
                    new PointTemplate("Sân bay Quốc tế Đà Nẵng", "Cột số 5, Ga Quốc nội, Q. Hải Châu, Đà Nẵng")
            );
        }

        if (c.contains("quy nhơn")) {
            return List.of(
                    new PointTemplate("Bến xe Trung tâm Quy Nhơn", "71 Tây Sơn, P. Ghềnh Ráng, TP. Quy Nhơn, Bình Định"),
                    new PointTemplate("Văn phòng Quy Nhơn (Nguyễn Tất Thành)", "126 Nguyễn Tất Thành, P. Lê Hồng Phong, TP. Quy Nhơn"),
                    new PointTemplate("Đại học Quy Nhơn", "170 An Dương Vương, P. Nguyễn Văn Cừ, TP. Quy Nhơn"),
                    new PointTemplate("Khu đô thị An Phú Thịnh", "Đường Võ Nguyên Giáp, P. Nhơn Bình, TP. Quy Nhơn")
            );
        }

        if (c.contains("hà nội")) {
            return List.of(
                    new PointTemplate("Bến xe Mỹ Đình", "Số 20 Phạm Hùng, P. Mỹ Đình 2, Q. Nam Từ Liêm, Hà Nội"),
                    new PointTemplate("Bến xe Giáp Bát", "Giải Phóng, P. Giáp Bát, Q. Hoàng Mai, Hà Nội"),
                    new PointTemplate("Bến xe Nước Ngầm", "Km8 Đường Giải Phóng, P. Hoàng Liệt, Q. Hoàng Mai, Hà Nội"),
                    new PointTemplate("Văn phòng Phố Cổ", "24 Bát Đàn, P. Hàng Gai, Q. Hoàn Kiếm, Hà Nội"),
                    new PointTemplate("Sân bay Nội Bài", "Tầng 1 Sảnh E, Sân bay Nội Bài, Sóc Sơn, Hà Nội")
            );
        }

        if (c.contains("sa pa")) {
            return List.of(
                    new PointTemplate("Bến xe Sa Pa mới", "Điện Biên Phủ, TT. Sa Pa, Lào Cai"),
                    new PointTemplate("Văn phòng Sa Pa (Nhà Thờ Đá)", "Đường Thạch Sơn, TT. Sa Pa, Lào Cai"),
                    new PointTemplate("Trạm cáp treo Fansipan Legend", "Đường Nguyễn Chí Thanh, TT. Sa Pa, Lào Cai")
            );
        }

        if (c.contains("đà lạt")) {
            return List.of(
                    new PointTemplate("Bến xe Liên tỉnh Đà Lạt", "01 Tô Hiến Thành, P.3, TP. Đà Lạt"),
                    new PointTemplate("Văn phòng Hồ Xuân Hương", "Đường Trần Phú, P.3, TP. Đà Lạt"),
                    new PointTemplate("Chợ Đêm Đà Lạt (Trung chuyển)", "Đường Nguyễn Thị Minh Khai, P.1, TP. Đà Lạt")
            );
        }

        if (c.contains("nha trang")) {
            return List.of(
                    new PointTemplate("Bến xe Phía Nam Nha Trang", "Đường 23/10, Xã Vĩnh Trung, TP. Nha Trang, Khánh Hòa"),
                    new PointTemplate("Văn phòng Nha Trang (Trần Phú)", "54 Trần Phú, P. Lộc Thọ, TP. Nha Trang"),
                    new PointTemplate("Trạm đón Chợ Đầm Nha Trang", "09 Bến Chợ, P. Vạn Thạnh, TP. Nha Trang")
            );
        }

        if (c.contains("vũng tàu")) {
            return List.of(
                    new PointTemplate("Bến xe Vũng Tàu", "192 Nam Kỳ Khởi Nghĩa, Phường 3, TP. Vũng Tàu"),
                    new PointTemplate("Văn phòng Bãi Sau Vũng Tàu", "Đường Thùy Vân, Phường Thắng Tam, TP. Vũng Tàu"),
                    new PointTemplate("Trạm đón Bãi Trước", "Đường Trần Phú, Phường 1, TP. Vũng Tàu")
            );
        }

        if (c.contains("cần thơ")) {
            return List.of(
                    new PointTemplate("Bến xe Trung tâm Cần Thơ", "QL1A, P. Hưng Thạnh, Q. Cái Răng, TP. Cần Thơ"),
                    new PointTemplate("Văn phòng Bến Ninh Kiều", "107 Nguyễn Thái Học, P. Tân An, Q. Ninh Kiều, Cần Thơ"),
                    new PointTemplate("Trạm đón Đại học Cần Thơ", "Khu II, Đường 3/2, Q. Ninh Kiều, TP. Cần Thơ")
            );
        }

        if (c.contains("hải phòng")) {
            return List.of(
                    new PointTemplate("Bến xe Cầu Rào", "Đường Lạch Tray, P. Đằng Giang, Q. Ngô Quyền, Hải Phòng"),
                    new PointTemplate("Bến xe Vĩnh Niệm", "Đường Bùi Viện, P. Vĩnh Niệm, Q. Lê Chân, Hải Phòng")
            );
        }

        if (c.contains("huế")) {
            return List.of(
                    new PointTemplate("Bến xe Phía Nam Huế", "97 An Dương Vương, P. An Đông, TP. Huế"),
                    new PointTemplate("Văn phòng Trung tâm Huế", "14 Hà Nội, P. Vĩnh Ninh, TP. Huế")
            );
        }

        // Fallback chung cho các địa phương khác
        return List.of(
                new PointTemplate("Bến xe Trung tâm " + city, "Trung tâm hành chính " + city),
                new PointTemplate("Văn phòng đại diện " + city, "Trục đường chính nội đô " + city)
        );
    }
}
