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

        User admin1 = User.builder().email("admin@traveleasy.vn").password(encodedPass).fullName("Quản Trị Viên Hệ Thống").phone("0901234567").role(Role.ADMIN).build();
        User admin2 = User.builder().email("phanthanhphong.admin@traveleasy.vn").password(encodedPass).fullName("Phạm Thanh Phong").phone("0902223344").role(Role.ADMIN).build();
        User admin3 = User.builder().email("trungkien.admin@traveleasy.vn").password(encodedPass).fullName("Phan Trung Kiên").phone("0903334455").role(Role.ADMIN).build();

        User opFuta = User.builder().email("operator@futa.vn").password(encodedPass).fullName("Điều Hành Xe Phương Trang").phone("0909888999").role(Role.OPERATOR).build();
        User opHoaMai = User.builder().email("dieuhanh@hoamaivungtau.com.vn").password(encodedPass).fullName("Điều Hành Xe Hoa Mai").phone("0905556677").role(Role.OPERATOR).build();
        User opHoangLong = User.builder().email("dieuhanh@hoanglongasia.com").password(encodedPass).fullName("Điều Hành Hoàng Long").phone("0906667788").role(Role.OPERATOR).build();
        User opVanMinh = User.builder().email("dieuhanh@vanminh74.vn").password(encodedPass).fullName("Điều Hành Văn Minh").phone("0907778899").role(Role.OPERATOR).build();

        User cust1 = User.builder().email("customer@gmail.com").password(encodedPass).fullName("Nguyễn Văn Du Khách").phone("0912345678").role(Role.CUSTOMER).build();
        User cust2 = User.builder().email("tranthib@gmail.com").password(encodedPass).fullName("Trần Thị Bích Ngọc").phone("0987654321").role(Role.CUSTOMER).build();
        User cust3 = User.builder().email("lehoangc@gmail.com").password(encodedPass).fullName("Lê Hoàng Cường").phone("0978112233").role(Role.CUSTOMER).build();
        User cust4 = User.builder().email("phamquocd@gmail.com").password(encodedPass).fullName("Phạm Quốc Dũng").phone("0933445566").role(Role.CUSTOMER).build();
        User cust5 = User.builder().email("hoangmaie@gmail.com").password(encodedPass).fullName("Hoàng Thị Mai").phone("0944556677").role(Role.CUSTOMER).build();

        userRepository.saveAll(List.of(admin1, admin2, admin3, opFuta, opHoaMai, opHoangLong, opVanMinh, cust1, cust2, cust3, cust4, cust5));

        // 2. Seed 10 Bus Companies
        BusCompany futa = BusCompany.builder().name("Phương Trang (FUTA Bus Lines)").hotline("1900 6067").email("hotro@futa.vn").address("Bến xe Miền Tây, TP. Hồ Chí Minh").logoUrl("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&auto=format&fit=crop&q=80").averageRating(BigDecimal.valueOf(4.9)).build();
        BusCompany thanhBuoi = BusCompany.builder().name("Thành Bưởi").hotline("1900 6079").email("info@thanhbuoi.com.vn").address("266 Lê Hồng Phong, Quận 5, TP. Hồ Chí Minh").logoUrl("https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=150&auto=format&fit=crop&q=80").averageRating(BigDecimal.valueOf(4.8)).build();
        BusCompany saoViet = BusCompany.builder().name("Sao Việt").hotline("1900 6746").email("contact@xesaoviet.com.vn").address("779 Giải Phóng, Hoàng Mai, Hà Nội").logoUrl("https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=150&auto=format&fit=crop&q=80").averageRating(BigDecimal.valueOf(4.7)).build();
        BusCompany kumho = BusCompany.builder().name("Kumho Samco Buslines").hotline("1900 6065").email("cskh@kumhosamco.com.vn").address("292 Đinh Bộ Lĩnh, Bình Thạnh, TP. Hồ Chí Minh").logoUrl("https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=150&auto=format&fit=crop&q=80").averageRating(BigDecimal.valueOf(4.8)).build();
        BusCompany hoaMai = BusCompany.builder().name("Xe Khách Hoa Mai").hotline("1900 599 997").email("info@hoamaivungtau.com.vn").address("47 Trưng Nhị, Phường 1, TP. Vũng Tàu").logoUrl("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&auto=format&fit=crop&q=80").averageRating(BigDecimal.valueOf(4.9)).build();
        BusCompany hoangLong = BusCompany.builder().name("Hoàng Long Asia").hotline("0225 3920 920").email("info@hoanglongasia.com").address("05 Phạm Ngũ Lão, Ngô Quyền, Hải Phòng").logoUrl("https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=150&auto=format&fit=crop&q=80").averageRating(BigDecimal.valueOf(4.7)).build();
        BusCompany vanMinh = BusCompany.builder().name("Nhà Xe Văn Minh").hotline("1900 6467").email("vanminh@vanminh74.vn").address("101 Lý Thường Kiệt, TP. Vinh, Nghệ An").logoUrl("https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=150&auto=format&fit=crop&q=80").averageRating(BigDecimal.valueOf(4.9)).build();
        BusCompany cucTung = BusCompany.builder().name("Cúc Tùng Limousine").hotline("1900 6606").email("cuctunglimousine@gmail.com").address("Bến xe phía Nam Nha Trang, Khánh Hòa").logoUrl("https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=150&auto=format&fit=crop&q=80").averageRating(BigDecimal.valueOf(4.8)).build();
        BusCompany haiVan = BusCompany.builder().name("Hải Vân Express").hotline("1900 6763").email("cskh@haivan.com").address("Tòa nhà N2E Lê Văn Lương, Nhân Chính, Thanh Xuân, Hà Nội").logoUrl("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&auto=format&fit=crop&q=80").averageRating(BigDecimal.valueOf(4.8)).build();
        BusCompany chinNghia = BusCompany.builder().name("Chín Nghĩa").hotline("1900 636 636").email("chinnghiaquangngai@gmail.com").address("06 Đinh Tiên Hoàng, Nghĩa Chánh, TP. Quảng Ngãi").logoUrl("https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=150&auto=format&fit=crop&q=80").averageRating(BigDecimal.valueOf(4.7)).build();

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

                PickupDropoffPoint.builder().route(r2).name("Bến xe Miền Đông Mới").address("TP. Thủ Đức, TP.HCM").pointType(PointType.PICKUP).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(r2).name("Bến xe Phía Nam Nha Trang").address("Đường 23/10, TP. Nha Trang").pointType(PointType.DROPOFF).displayOrder(1).build(),

                PickupDropoffPoint.builder().route(r3).name("Bến xe Miền Tây").address("395 Kinh Dương Vương, Bình Tân, TP.HCM").pointType(PointType.PICKUP).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(r3).name("Bến xe Trung tâm Cần Thơ").address("Cầu Cần Thơ, Hưng Thành, Cái Răng, Cần Thơ").pointType(PointType.DROPOFF).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(r3).name("Bến Ninh Kiều").address("Hai Bà Trưng, Tân An, Ninh Kiều, Cần Thơ").pointType(PointType.DROPOFF).displayOrder(2).build(),

                PickupDropoffPoint.builder().route(r4).name("Bến xe Mỹ Đình").address("Số 20 Phạm Hùng, Nam Từ Liêm, Hà Nội").pointType(PointType.PICKUP).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(r4).name("Bến xe Sa Pa").address("Điện Biên Phủ, Sa Pa, Lào Cai").pointType(PointType.DROPOFF).displayOrder(1).build(),

                PickupDropoffPoint.builder().route(r5).name("Văn phòng Quận 1").address("44 Nguyễn Thái Bình, Quận 1, TP.HCM").pointType(PointType.PICKUP).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(r5).name("Trạm Hàng Xanh").address("178 Điện Biên Phủ, Bình Thạnh, TP.HCM").pointType(PointType.PICKUP).displayOrder(2).build(),
                PickupDropoffPoint.builder().route(r5).name("Bến xe Vũng Tàu").address("192 Nam Kỳ Khởi Nghĩa, TP. Vũng Tàu").pointType(PointType.DROPOFF).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(r5).name("Bãi Sau Vũng Tàu (Đón trả tận nơi)").address("02 Thùy Vân, TP. Vũng Tàu").pointType(PointType.DROPOFF).displayOrder(2).build(),

                PickupDropoffPoint.builder().route(r7).name("Bến xe Miền Đông Mới").address("TP. Thủ Đức, TP.HCM").pointType(PointType.PICKUP).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(r7).name("Bến xe Bắc Phan Thiết").address("01 Từ Văn Tư, TP. Phan Thiết").pointType(PointType.DROPOFF).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(r7).name("Resort Hàm Tiến - Mũi Né").address("Nguyễn Đình Chiểu, Hàm Tiến, Phan Thiết").pointType(PointType.DROPOFF).displayOrder(2).build(),

                PickupDropoffPoint.builder().route(r9).name("Bến xe Nước Ngầm").address("Ngọc Hồi, Hoàng Mai, Hà Nội").pointType(PointType.PICKUP).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(r9).name("Bến xe Niệm Nghĩa").address("275 Trần Nguyên Hãn, Lê Chân, Hải Phòng").pointType(PointType.DROPOFF).displayOrder(1).build(),

                PickupDropoffPoint.builder().route(r11).name("Bến xe Nước Ngầm").address("Ngọc Hồi, Hoàng Mai, Hà Nội").pointType(PointType.PICKUP).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(r11).name("Bến xe Bắc Vinh").address("Nghi Kim, TP. Vinh, Nghệ An").pointType(PointType.DROPOFF).displayOrder(1).build(),

                PickupDropoffPoint.builder().route(r13).name("Bến xe Trung tâm Đà Nẵng").address("Tôn Đức Thắng, Cẩm Lệ, Đà Nẵng").pointType(PointType.PICKUP).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(r13).name("Bến xe Phía Nam Huế").address("97 An Dương Vương, TP. Huế").pointType(PointType.DROPOFF).displayOrder(1).build()
        );
        pointRepository.saveAll(points);

        // 5. Seed Trips
        LocalDateTime tomorrow = LocalDateTime.now().plusDays(1).withHour(8).withMinute(0).withSecond(0).withNano(0);

        Trip trip1 = Trip.builder().route(r1).busCompany(futa).departureTime(tomorrow).arrivalTime(tomorrow.plusHours(6).plusMinutes(30)).busType(BusType.SLEEPER).licensePlate("51B-123.45").totalSeats(34).availableSeats(32).price(BigDecimal.valueOf(290000)).description("Xe giường nằm chất lượng cao FUTA, máy lạnh, wifi, nước suối.").status(TripStatus.SCHEDULED).build();
        Trip trip2 = Trip.builder().route(r1).busCompany(futa).departureTime(tomorrow.withHour(22).withMinute(30)).arrivalTime(tomorrow.plusDays(1).withHour(5).withMinute(0)).busType(BusType.LIMOUSINE).licensePlate("51B-999.88").totalSeats(34).availableSeats(34).price(BigDecimal.valueOf(340000)).description("Xe phòng VIP Limousine 34 phòng riêng biệt.").status(TripStatus.SCHEDULED).build();
        Trip trip3 = Trip.builder().route(r2).busCompany(futa).departureTime(tomorrow.withHour(7).withMinute(0)).arrivalTime(tomorrow.withHour(15).withMinute(0)).busType(BusType.SLEEPER).licensePlate("51B-456.78").totalSeats(34).availableSeats(34).price(BigDecimal.valueOf(320000)).description("Tuyến Sài Gòn đi phố biển Nha Trang, xe chạy êm ái.").status(TripStatus.SCHEDULED).build();
        Trip trip4 = Trip.builder().route(r4).busCompany(saoViet).departureTime(tomorrow.withHour(6).withMinute(30)).arrivalTime(tomorrow.withHour(12).withMinute(0)).busType(BusType.LIMOUSINE).licensePlate("29B-888.66").totalSeats(34).availableSeats(34).price(BigDecimal.valueOf(380000)).description("Xe cabin đôi cao cấp chạy cao tốc Nội Bài - Lào Cai.").status(TripStatus.SCHEDULED).build();
        Trip trip5 = Trip.builder().route(r5).busCompany(hoaMai).departureTime(tomorrow.withHour(9).withMinute(0)).arrivalTime(tomorrow.withHour(11).withMinute(0)).busType(BusType.LIMOUSINE).licensePlate("72B-012.34").totalSeats(34).availableSeats(30).price(BigDecimal.valueOf(180000)).description("Xe Limousine VIP Hoa Mai đưa đón tận nơi Vũng Tàu.").status(TripStatus.SCHEDULED).build();
        Trip trip6 = Trip.builder().route(r7).busCompany(futa).departureTime(tomorrow.withHour(8).withMinute(30)).arrivalTime(tomorrow.withHour(12).withMinute(30)).busType(BusType.SLEEPER).licensePlate("51B-234.56").totalSeats(34).availableSeats(32).price(BigDecimal.valueOf(220000)).description("Xe FUTA đi Phan Thiết trả khách các resort Mũi Né.").status(TripStatus.SCHEDULED).build();
        Trip trip7 = Trip.builder().route(r9).busCompany(hoangLong).departureTime(tomorrow.withHour(7).withMinute(30)).arrivalTime(tomorrow.withHour(9).withMinute(0)).busType(BusType.SEAT).licensePlate("15B-011.22").totalSeats(34).availableSeats(34).price(BigDecimal.valueOf(150000)).description("Xe ghế ngồi cao cấp Hoàng Long cao tốc Hải Phòng.").status(TripStatus.SCHEDULED).build();
        Trip trip8 = Trip.builder().route(r11).busCompany(vanMinh).departureTime(tomorrow.withHour(22).withMinute(0)).arrivalTime(tomorrow.plusDays(1).withHour(3).withMinute(30)).busType(BusType.SLEEPER).licensePlate("37B-088.99").totalSeats(34).availableSeats(26).price(BigDecimal.valueOf(310000)).description("Nhà xe Văn Minh chuyên tuyến Nghệ An, phục vụ chu đáo.").status(TripStatus.SCHEDULED).build();
        Trip trip9 = Trip.builder().route(r13).busCompany(futa).departureTime(tomorrow.withHour(10).withMinute(0)).arrivalTime(tomorrow.withHour(12).withMinute(30)).busType(BusType.SEAT).licensePlate("43B-022.33").totalSeats(34).availableSeats(34).price(BigDecimal.valueOf(120000)).description("Tuyến liên tỉnh miền Trung qua hầm Hải Vân.").status(TripStatus.SCHEDULED).build();
        Trip trip10 = Trip.builder().route(r14).busCompany(chinNghia).departureTime(tomorrow.withHour(13).withMinute(0)).arrivalTime(tomorrow.withHour(18).withMinute(30)).busType(BusType.SLEEPER).licensePlate("76B-066.77").totalSeats(34).availableSeats(33).price(BigDecimal.valueOf(270000)).description("Chuyến Đà Nẵng đi Quy Nhơn, xe chạy êm ái.").status(TripStatus.SCHEDULED).build();

        List<Trip> allTrips = List.of(trip1, trip2, trip3, trip4, trip5, trip6, trip7, trip8, trip9, trip10);
        tripRepository.saveAll(allTrips);

        // 6. Generate 34 seats for each trip
        for (Trip t : allTrips) {
            seedSeatsForTrip(t, t.equals(trip1) || t.equals(trip5) || t.equals(trip8));
        }

        // 7. Seed Sample Bookings & Tickets
        Booking b1 = Booking.builder().bookingCode("BKG-20261025-001").user(cust1).trip(trip1).passengerName("Nguyễn Văn Du Khách").passengerPhone("0912345678").passengerEmail("customer@gmail.com").pickupPoint("Bến xe Miền Tây").dropoffPoint("Bến xe Liên tỉnh Đà Lạt").seatNumbers("A01, A02").totalAmount(BigDecimal.valueOf(580000)).paymentMethod(PaymentMethod.COD).status(BookingStatus.CONFIRMED).build();
        Booking b2 = Booking.builder().bookingCode("BKG-20261021-002").user(cust2).trip(trip5).passengerName("Trần Thị Bích Ngọc").passengerPhone("0987654321").passengerEmail("tranthib@gmail.com").pickupPoint("Văn phòng Quận 1").dropoffPoint("Bãi Sau Vũng Tàu").seatNumbers("A01, A02").totalAmount(BigDecimal.valueOf(360000)).paymentMethod(PaymentMethod.COD).status(BookingStatus.CONFIRMED).build();
        bookingRepository.saveAll(List.of(b1, b2));

        Ticket t1 = Ticket.builder().booking(b1).ticketCode("TK-20261025-001-A01").seatNumber("A01").price(BigDecimal.valueOf(290000)).qrCodeHash("c5e26b88-5c42-4f01-8b21-7e8c3a19e001").status(TicketStatus.ISSUED).build();
        Ticket t2 = Ticket.builder().booking(b1).ticketCode("TK-20261025-001-A02").seatNumber("A02").price(BigDecimal.valueOf(290000)).qrCodeHash("f7a14c99-7b33-4d22-9e32-8f9d4b28f002").status(TicketStatus.ISSUED).build();
        Ticket t3 = Ticket.builder().booking(b2).ticketCode("TK-20261021-002-A01").seatNumber("A01").price(BigDecimal.valueOf(180000)).qrCodeHash("qr-hm-20261021-002-a01").status(TicketStatus.ISSUED).build();
        Ticket t4 = Ticket.builder().booking(b2).ticketCode("TK-20261021-002-A02").seatNumber("A02").price(BigDecimal.valueOf(180000)).qrCodeHash("qr-hm-20261021-002-a02").status(TicketStatus.ISSUED).build();
        ticketRepository.saveAll(List.of(t1, t2, t3, t4));

        log.info("Successfully seeded rich initial data for TravelEasy Platform!");
    }

    private void seedSeatsForTrip(Trip trip, boolean bookSome) {
        List<TripSeat> seats = new ArrayList<>();

        // Floor 1 (A01 - A17)
        for (int i = 1; i <= 17; i++) {
            String seatCode = String.format("A%02d", i);
            SeatStatus status = (bookSome && (i == 1 || i == 2)) ? SeatStatus.BOOKED : SeatStatus.AVAILABLE;
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
