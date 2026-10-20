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
import java.util.UUID;

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

        log.info("Seeding initial data for TravelEasy Platform...");

        // 1. Seed Users
        String encodedPass = passwordEncoder.encode("Rikkei@123");

        User admin = User.builder()
                .email("admin@traveleasy.vn")
                .password(encodedPass)
                .fullName("Quản Trị Viên Hệ Thống")
                .phone("0901234567")
                .role(Role.ADMIN)
                .build();

        User operator = User.builder()
                .email("operator@futa.vn")
                .password(encodedPass)
                .fullName("Điều Hành Xe Phương Trang")
                .phone("0909888999")
                .role(Role.OPERATOR)
                .build();

        User customer = User.builder()
                .email("customer@gmail.com")
                .password(encodedPass)
                .fullName("Nguyễn Văn Du Khách")
                .phone("0912345678")
                .role(Role.CUSTOMER)
                .build();

        userRepository.saveAll(List.of(admin, operator, customer));

        // 2. Seed Bus Companies
        BusCompany futa = BusCompany.builder()
                .name("Phương Trang (FUTA Bus Lines)")
                .hotline("1900 6067")
                .email("hotro@futa.vn")
                .address("Bến xe Miền Tây, TP. Hồ Chí Minh")
                .logoUrl("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150&auto=format&fit=crop&q=80")
                .averageRating(BigDecimal.valueOf(4.9))
                .build();

        BusCompany thanhBuoi = BusCompany.builder()
                .name("Thành Bưởi")
                .hotline("1900 6079")
                .email("info@thanhbuoi.com.vn")
                .address("266 Lê Hồng Phong, Quận 5, TP. Hồ Chí Minh")
                .logoUrl("https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=150&auto=format&fit=crop&q=80")
                .averageRating(BigDecimal.valueOf(4.8))
                .build();

        BusCompany saoViet = BusCompany.builder()
                .name("Sao Việt")
                .hotline("1900 6746")
                .email("contact@xesaoviet.com.vn")
                .address("779 Giải Phóng, Hoàng Mai, Hà Nội")
                .logoUrl("https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=150&auto=format&fit=crop&q=80")
                .averageRating(BigDecimal.valueOf(4.7))
                .build();

        BusCompany kumho = BusCompany.builder()
                .name("Kumho Samco Buslines")
                .hotline("1900 6065")
                .email("cskh@kumhosamco.com.vn")
                .address("292 Đinh Bộ Lĩnh, Bình Thạnh, TP. Hồ Chí Minh")
                .logoUrl("https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=150&auto=format&fit=crop&q=80")
                .averageRating(BigDecimal.valueOf(4.8))
                .build();

        busCompanyRepository.saveAll(List.of(futa, thanhBuoi, saoViet, kumho));

        // 3. Seed Routes
        Route routeHcmDalat = Route.builder()
                .busCompany(futa)
                .departureLocation("TP. Hồ Chí Minh")
                .arrivalLocation("Đà Lạt")
                .durationHours(BigDecimal.valueOf(6.5))
                .distanceKm(BigDecimal.valueOf(305.0))
                .build();

        Route routeHcmNhaTrang = Route.builder()
                .busCompany(futa)
                .departureLocation("TP. Hồ Chí Minh")
                .arrivalLocation("Nha Trang")
                .durationHours(BigDecimal.valueOf(8.0))
                .distanceKm(BigDecimal.valueOf(435.0))
                .build();

        Route routeHnSapa = Route.builder()
                .busCompany(saoViet)
                .departureLocation("Hà Nội")
                .arrivalLocation("Sa Pa")
                .durationHours(BigDecimal.valueOf(5.5))
                .distanceKm(BigDecimal.valueOf(315.0))
                .build();

        Route routeHcmCanTho = Route.builder()
                .busCompany(thanhBuoi)
                .departureLocation("TP. Hồ Chí Minh")
                .arrivalLocation("Cần Thơ")
                .durationHours(BigDecimal.valueOf(3.5))
                .distanceKm(BigDecimal.valueOf(169.0))
                .build();

        routeRepository.saveAll(List.of(routeHcmDalat, routeHcmNhaTrang, routeHcmCanTho, routeHnSapa));

        // 4. Seed Pickup & Dropoff Points
        List<PickupDropoffPoint> points = List.of(
                PickupDropoffPoint.builder().route(routeHcmDalat).name("Bến xe Miền Tây").address("395 Kinh Dương Vương, Bình Tân, TP.HCM").pointType(PointType.PICKUP).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(routeHcmDalat).name("Trạm An Sương").address("QL22, Bà Điểm, Hóc Môn, TP.HCM").pointType(PointType.PICKUP).displayOrder(2).build(),
                PickupDropoffPoint.builder().route(routeHcmDalat).name("Bến xe Liên tỉnh Đà Lạt").address("01 Tô Hiến Thành, P.3, TP. Đà Lạt").pointType(PointType.DROPOFF).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(routeHcmDalat).name("Văn phòng Đà Lạt (Hồ Xuân Hương)").address("Trần Phú, TP. Đà Lạt").pointType(PointType.DROPOFF).displayOrder(2).build(),

                PickupDropoffPoint.builder().route(routeHcmNhaTrang).name("Bến xe Miền Đông Mới").address("TP. Thủ Đức, TP.HCM").pointType(PointType.PICKUP).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(routeHcmNhaTrang).name("Bến xe Phía Nam Nha Trang").address("Đường 23/10, TP. Nha Trang").pointType(PointType.DROPOFF).displayOrder(1).build(),

                PickupDropoffPoint.builder().route(routeHcmCanTho).name("Bến xe Miền Tây").address("395 Kinh Dương Vương, Bình Tân, TP.HCM").pointType(PointType.PICKUP).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(routeHcmCanTho).name("Bến xe Trung tâm Cần Thơ").address("Cầu Cần Thơ, Hưng Thành, Cái Răng, Cần Thơ").pointType(PointType.DROPOFF).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(routeHcmCanTho).name("Bến Ninh Kiều").address("Hai Bà Trưng, Tân An, Ninh Kiều, Cần Thơ").pointType(PointType.DROPOFF).displayOrder(2).build(),

                PickupDropoffPoint.builder().route(routeHnSapa).name("Bến xe Mỹ Đình").address("Số 20 Phạm Hùng, Nam Từ Liêm, Hà Nội").pointType(PointType.PICKUP).displayOrder(1).build(),
                PickupDropoffPoint.builder().route(routeHnSapa).name("Bến xe Sa Pa").address("Điện Biên Phủ, Sa Pa, Lào Cai").pointType(PointType.DROPOFF).displayOrder(1).build()
        );
        pointRepository.saveAll(points);

        // 5. Seed Trips
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1).withHour(8).withMinute(0).withSecond(0).withNano(0);

        Trip trip1 = Trip.builder()
                .route(routeHcmDalat)
                .busCompany(futa)
                .departureTime(tomorrow)
                .arrivalTime(tomorrow.plusHours(6).plusMinutes(30))
                .busType(BusType.SLEEPER)
                .licensePlate("51B-123.45")
                .totalSeats(34)
                .availableSeats(32)
                .price(BigDecimal.valueOf(290000))
                .description("Xe giường nằm chất lượng cao FUTA, máy lạnh, wifi, nước suối, chăn ấm.")
                .status(TripStatus.SCHEDULED)
                .build();

        Trip trip2 = Trip.builder()
                .route(routeHcmDalat)
                .busCompany(futa)
                .departureTime(tomorrow.withHour(22).withMinute(30))
                .arrivalTime(tomorrow.plusDays(1).withHour(5).withMinute(0))
                .busType(BusType.LIMOUSINE)
                .licensePlate("51B-999.88")
                .totalSeats(34)
                .availableSeats(34)
                .price(BigDecimal.valueOf(340000))
                .description("Xe phòng VIP Limousine 34 phòng riêng biệt, sạc điện thoại Type-C, rèm che kín đáo.")
                .status(TripStatus.SCHEDULED)
                .build();

        Trip trip3 = Trip.builder()
                .route(routeHcmNhaTrang)
                .busCompany(futa)
                .departureTime(tomorrow.withHour(7).withMinute(0))
                .arrivalTime(tomorrow.withHour(15).withMinute(0))
                .busType(BusType.SLEEPER)
                .licensePlate("51B-456.78")
                .totalSeats(34)
                .availableSeats(34)
                .price(BigDecimal.valueOf(320000))
                .description("Tuyến Sài Gòn đi phố biển Nha Trang, xe chạy êm, hỗ trợ khăn lạnh và đón tận nơi.")
                .status(TripStatus.SCHEDULED)
                .build();

        Trip trip4 = Trip.builder()
                .route(routeHnSapa)
                .busCompany(saoViet)
                .departureTime(tomorrow.withHour(6).withMinute(30))
                .arrivalTime(tomorrow.withHour(12).withMinute(0))
                .busType(BusType.LIMOUSINE)
                .licensePlate("29B-888.66")
                .totalSeats(34)
                .availableSeats(34)
                .price(BigDecimal.valueOf(380000))
                .description("Xe cabin đôi cao cấp chạy cao tốc Nội Bài - Lào Cai, massage thư giãn.")
                .status(TripStatus.SCHEDULED)
                .build();

        tripRepository.saveAll(List.of(trip1, trip2, trip3, trip4));

        // 6. Generate 34 seats for each trip
        seedSeatsForTrip(trip1, true); // Trip 1 has A01, A02 booked
        seedSeatsForTrip(trip2, false);
        seedSeatsForTrip(trip3, false);
        seedSeatsForTrip(trip4, false);

        // 7. Seed Sample Booking for Trip 1
        Booking sampleBooking = Booking.builder()
                .bookingCode("BKG-20261025-001")
                .user(customer)
                .trip(trip1)
                .passengerName("Nguyễn Văn Du Khách")
                .passengerPhone("0912345678")
                .passengerEmail("customer@gmail.com")
                .pickupPoint("Bến xe Miền Tây")
                .dropoffPoint("Bến xe Liên tỉnh Đà Lạt")
                .seatNumbers("A01, A02")
                .totalAmount(BigDecimal.valueOf(580000))
                .paymentMethod(PaymentMethod.COD)
                .status(BookingStatus.CONFIRMED)
                .build();

        bookingRepository.save(sampleBooking);

        Ticket ticket1 = Ticket.builder()
                .booking(sampleBooking)
                .ticketCode("TK-20261025-001-A01")
                .seatNumber("A01")
                .price(BigDecimal.valueOf(290000))
                .qrCodeHash("c5e26b88-5c42-4f01-8b21-7e8c3a19e001")
                .status(TicketStatus.ISSUED)
                .build();

        Ticket ticket2 = Ticket.builder()
                .booking(sampleBooking)
                .ticketCode("TK-20261025-001-A02")
                .seatNumber("A02")
                .price(BigDecimal.valueOf(290000))
                .qrCodeHash("f7a14c99-7b33-4d22-9e32-8f9d4b28f002")
                .status(TicketStatus.ISSUED)
                .build();

        ticketRepository.saveAll(List.of(ticket1, ticket2));

        log.info("Successfully seeded TravelEasy initial data (Users, Companies, Routes, Trips, 136 Seats, Bookings & Tickets)!");
    }

    private void seedSeatsForTrip(Trip trip, boolean bookA01A02) {
        List<TripSeat> seats = new ArrayList<>();

        // Floor 1 (A01 - A17)
        for (int i = 1; i <= 17; i++) {
            String seatCode = String.format("A%02d", i);
            SeatStatus status = (bookA01A02 && (i == 1 || i == 2)) ? SeatStatus.BOOKED : SeatStatus.AVAILABLE;
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
