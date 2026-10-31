package com.traveleasy.service.customer;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.booking.BookingResponse;
import com.traveleasy.dto.booking.CreateBookingRequest;
import com.traveleasy.dto.booking.TicketResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import com.traveleasy.service.realtime.SeatRealtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final TripRepository tripRepository;
    private final TripSeatRepository tripSeatRepository;
    private final PickupDropoffPointRepository pointRepository;
    private final UserRepository userRepository;
    private final TripService tripService;
    private final SeatRealtimeService seatRealtimeService;

    @Transactional(isolation = Isolation.SERIALIZABLE)
    @org.springframework.cache.annotation.CacheEvict(value = {"admin_all_bookings", "system_stats", "company_dashboard_stats", "trips_search"}, allEntries = true)
    public BookingResponse createBooking(CreateBookingRequest request, String userEmail) {
        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe"));

        if (trip.getStatus() != TripStatus.SCHEDULED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Chuyến xe không còn mở bán vé (Trạng thái: " + trip.getStatus() + ")");
        }

        if (trip.getDepartureTime() != null && trip.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Chuyến xe đã khởi hành vào " + trip.getDepartureTime() + ", không thể đặt vé");
        }

        if (trip.getBusCompany() != null && "SUSPENDED".equalsIgnoreCase(trip.getBusCompany().getStatus())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Nhà xe " + trip.getBusCompany().getName() + " hiện đang tạm ngừng hoạt động trên sàn.");
        }

        // PESSIMISTIC LOCK: Lock các ghế được chọn để chống xung đột đặt trùng
        List<TripSeat> requestedSeats = tripSeatRepository.findByTripIdAndSeatCodeInWithLock(
                trip.getId(), request.getSeatNumbers());

        if (requestedSeats.size() != request.getSeatNumbers().size()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Một số ghế không tồn tại trên chuyến này");
        }

        for (TripSeat seat : requestedSeats) {
            if (seat.getStatus() == SeatStatus.BOOKED) {
                throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED, "Ghế " + seat.getSeatCode() + " vừa được người khác đặt. Vui lòng chọn ghế khác!");
            }
        }

        // Tính tổng tiền & Cập nhật trạng thái ghế
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (TripSeat seat : requestedSeats) {
            seat.setStatus(SeatStatus.BOOKED);
            totalAmount = totalAmount.add(trip.getPrice());
        }
        tripSeatRepository.saveAll(requestedSeats);

        // Trừ ghế trống trên chuyến xe
        trip.setAvailableSeats(trip.getAvailableSeats() - requestedSeats.size());
        tripRepository.save(trip);

        // Lấy tên điểm đón và trả
        String pickupName = "Bến xe xuất phát";
        String dropoffName = "Bến xe đích";
        if (request.getPickupPointId() != null) {
            pickupName = pointRepository.findById(request.getPickupPointId()).map(PickupDropoffPoint::getName).orElse(pickupName);
        }
        if (request.getDropoffPointId() != null) {
            dropoffName = pointRepository.findById(request.getDropoffPointId()).map(PickupDropoffPoint::getName).orElse(dropoffName);
        }

        // Lấy user đăng nhập nếu có
        User user = null;
        if (userEmail != null) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }

        // Sinh mã booking
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String bookingCode = "BK-" + datePrefix + "-" + randomSuffix;

        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .user(user)
                .trip(trip)
                .passengerName(request.getCustomerName())
                .passengerPhone(request.getCustomerPhone())
                .passengerEmail(request.getCustomerEmail())
                .pickupPoint(pickupName)
                .dropoffPoint(dropoffName)
                .seatNumbers(String.join(", ", request.getSeatNumbers()))
                .totalAmount(totalAmount)
                .paymentMethod(request.getPaymentMethod())
                .status(BookingStatus.CONFIRMED)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Sinh danh sách vé (Tickets) kèm mã QR hash
        List<Ticket> tickets = new ArrayList<>();
        int seq = 1;
        for (TripSeat seat : requestedSeats) {
            String ticketCode = String.format("TK-%s-%02d", bookingCode.replace("BK-", ""), seq++);
            String qrHash = UUID.randomUUID().toString().replace("-", "");

            Ticket ticket = Ticket.builder()
                    .booking(savedBooking)
                    .ticketCode(ticketCode)
                    .seatNumber(seat.getSeatCode())
                    .price(trip.getPrice())
                    .qrCodeHash(qrHash)
                    .status(TicketStatus.ISSUED)
                    .build();
            tickets.add(ticket);
        }
        ticketRepository.saveAll(tickets);

        // Phát broadcast cập nhật thời gian thực các ghế đã được đặt mua thành công (Màu Xám - BOOKED)
        List<String> bookedCodes = requestedSeats.stream().map(TripSeat::getSeatCode).collect(Collectors.toList());
        seatRealtimeService.broadcastBooked(trip.getId(), bookedCodes);

        return mapToBookingResponse(savedBooking, tickets);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingByCode(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy mã đơn vé: " + bookingCode));
        List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
        return mapToBookingResponse(booking, tickets);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "User không tồn tại"));
        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        return bookings.stream().map(b -> {
            List<Ticket> tickets = ticketRepository.findByBookingId(b.getId());
            return mapToBookingResponse(b, tickets);
        }).collect(Collectors.toList());
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"admin_all_bookings", "system_stats", "company_dashboard_stats", "trips_search"}, allEntries = true)
    public BookingResponse cancelBooking(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn đặt vé"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Đơn đặt vé này đã bị hủy trước đó");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Đơn đặt vé đã hoàn thành chuyến đi, không thể hủy");
        }
        if (booking.getTrip() != null && booking.getTrip().getDepartureTime() != null &&
                booking.getTrip().getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Chuyến xe đã khởi hành, không thể hủy vé trực tuyến");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
        List<String> seatCodes = new ArrayList<>();
        for (Ticket ticket : tickets) {
            ticket.setStatus(TicketStatus.CANCELLED);
            seatCodes.add(ticket.getSeatNumber());
        }
        ticketRepository.saveAll(tickets);

        // Giải phóng ghế về AVAILABLE
        List<TripSeat> seats = tripSeatRepository.findByTripIdAndSeatCodeInWithLock(booking.getTrip().getId(), seatCodes);
        for (TripSeat seat : seats) {
            seat.setStatus(SeatStatus.AVAILABLE);
        }
        tripSeatRepository.saveAll(seats);

        // Cập nhật lại số ghế trống của chuyến
        Trip trip = booking.getTrip();
        trip.setAvailableSeats(trip.getAvailableSeats() + tickets.size());
        tripRepository.save(trip);

        // Broadcast thời gian thực ghế đã được giải phóng (Màu Trắng - AVAILABLE)
        seatRealtimeService.broadcastReleased(trip.getId(), seatCodes);

        return mapToBookingResponse(booking, tickets);
    }

    @Transactional
    public BookingResponse cancelPartialTickets(Long bookingId, List<Long> ticketIds, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn đặt vé"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Đơn đặt vé này đã bị hủy trước đó");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Đơn đặt vé đã hoàn thành chuyến đi, không thể hủy vé");
        }
        if (booking.getTrip() != null && booking.getTrip().getDepartureTime() != null &&
                booking.getTrip().getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Chuyến xe đã khởi hành, không thể hủy vé trực tuyến");
        }

        List<Ticket> allTickets = ticketRepository.findByBookingId(booking.getId());
        List<String> releasedSeats = new ArrayList<>();

        for (Ticket ticket : allTickets) {
            if (ticketIds.contains(ticket.getId()) && ticket.getStatus() != TicketStatus.CANCELLED) {
                ticket.setStatus(TicketStatus.CANCELLED);
                releasedSeats.add(ticket.getSeatNumber());
            }
        }
        ticketRepository.saveAll(allTickets);

        if (!releasedSeats.isEmpty()) {
            List<TripSeat> seats = tripSeatRepository.findByTripIdAndSeatCodeInWithLock(booking.getTrip().getId(), releasedSeats);
            for (TripSeat seat : seats) {
                seat.setStatus(SeatStatus.AVAILABLE);
            }
            tripSeatRepository.saveAll(seats);

            Trip trip = booking.getTrip();
            trip.setAvailableSeats(trip.getAvailableSeats() + releasedSeats.size());
            tripRepository.save(trip);

            // Broadcast thời gian thực ghế đã được giải phóng (Màu Trắng - AVAILABLE)
            seatRealtimeService.broadcastReleased(trip.getId(), releasedSeats);
        }

        boolean allCancelled = allTickets.stream().allMatch(t -> t.getStatus() == TicketStatus.CANCELLED);
        if (allCancelled) {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
        }

        return mapToBookingResponse(booking, allTickets);
    }

    @Transactional
    public BookingResponse rescheduleTicket(Long bookingId, Long oldTicketId, Long newTripId, String newSeatNumber, String userEmail) {
        Booking oldBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn đặt vé"));

        if (oldBooking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Đơn đặt vé đã bị hủy, không thể đổi chuyến");
        }
        if (oldBooking.getStatus() == BookingStatus.COMPLETED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Đơn đặt vé đã hoàn thành chuyến đi, không thể đổi chuyến");
        }
        if (oldBooking.getTrip() != null && oldBooking.getTrip().getDepartureTime() != null &&
                oldBooking.getTrip().getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Chuyến xe hiện tại đã khởi hành, không thể đổi vé trực tuyến");
        }

        Ticket oldTicket = ticketRepository.findById(oldTicketId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy vé cần đổi"));

        if (oldTicket.getStatus() == TicketStatus.CANCELLED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Vé này đã bị hủy, không thể đổi chuyến");
        }

        if (newTripId.equals(oldBooking.getTrip().getId()) && newSeatNumber.equalsIgnoreCase(oldTicket.getSeatNumber())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Bạn đang chọn trùng chuyến xe và ghế ngồi hiện tại");
        }

        Trip newTrip = tripRepository.findById(newTripId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe mới"));

        if (newTrip.getStatus() != TripStatus.SCHEDULED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Chuyến xe mới không còn mở bán vé (Trạng thái: " + newTrip.getStatus() + ")");
        }
        if (newTrip.getDepartureTime() != null && newTrip.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Chuyến xe mới đã khởi hành trong quá khứ");
        }

        // Release old seat
        List<TripSeat> oldSeats = tripSeatRepository.findByTripIdAndSeatCodeInWithLock(oldBooking.getTrip().getId(), List.of(oldTicket.getSeatNumber()));
        if (!oldSeats.isEmpty()) {
            oldSeats.get(0).setStatus(SeatStatus.AVAILABLE);
            tripSeatRepository.saveAll(oldSeats);
            Trip oldTrip = oldBooking.getTrip();
            oldTrip.setAvailableSeats(oldTrip.getAvailableSeats() + 1);
            tripRepository.save(oldTrip);
        }
        oldTicket.setStatus(TicketStatus.CANCELLED);
        ticketRepository.save(oldTicket);

        // Lock new seat on new trip
        List<TripSeat> newSeats = tripSeatRepository.findByTripIdAndSeatCodeInWithLock(newTrip.getId(), List.of(newSeatNumber));
        if (newSeats.isEmpty() || newSeats.get(0).getStatus() != SeatStatus.AVAILABLE) {
            throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED, "Ghế mới " + newSeatNumber + " trên chuyến mới đã có người đặt!");
        }
        newSeats.get(0).setStatus(SeatStatus.BOOKED);
        tripSeatRepository.saveAll(newSeats);
        newTrip.setAvailableSeats(Math.max(0, newTrip.getAvailableSeats() - 1));
        tripRepository.save(newTrip);

        // Create new booking for new trip per SRS UC-1.16 Canonical Model
        String newBookingCode = "BK-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        Booking newBooking = Booking.builder()
                .bookingCode(newBookingCode)
                .user(oldBooking.getUser())
                .passengerName(oldBooking.getPassengerName())
                .passengerPhone(oldBooking.getPassengerPhone())
                .passengerEmail(oldBooking.getPassengerEmail())
                .trip(newTrip)
                .pickupPoint(oldBooking.getPickupPoint())
                .dropoffPoint(oldBooking.getDropoffPoint())
                .totalAmount(newTrip.getPrice())
                .paymentMethod(oldBooking.getPaymentMethod())
                .seatNumbers(newSeatNumber)
                .status(BookingStatus.CONFIRMED)
                .build();
        Booking savedNewBooking = bookingRepository.save(newBooking);

        String newTicketCode = "TK-" + newBookingCode.replace("BK-", "") + "-01";
        Ticket newTicket = Ticket.builder()
                .booking(savedNewBooking)
                .ticketCode(newTicketCode)
                .seatNumber(newSeatNumber)
                .price(newTrip.getPrice())
                .qrCodeHash(UUID.randomUUID().toString().replace("-", ""))
                .status(TicketStatus.ISSUED)
                .build();
        ticketRepository.save(newTicket);

        return mapToBookingResponse(savedNewBooking, List.of(newTicket));
    }

    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable("admin_all_bookings")
    public List<BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAllWithTripDetails();
        if (bookings.isEmpty()) return Collections.emptyList();

        List<Long> bookingIds = bookings.stream().map(Booking::getId).collect(Collectors.toList());
        List<Ticket> allTickets = ticketRepository.findByBookingIdIn(bookingIds);
        Map<Long, List<Ticket>> ticketsByBooking = new HashMap<>();
        for (Ticket t : allTickets) {
            if (t.getBooking() != null && t.getBooking().getId() != null) {
                ticketsByBooking.computeIfAbsent(t.getBooking().getId(), k -> new ArrayList<>()).add(t);
            }
        }

        return bookings.stream()
                .map(b -> mapToBookingResponse(b, ticketsByBooking.getOrDefault(b.getId(), Collections.emptyList())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable(value = "company_bookings", key = "#companyId != null ? #companyId : 1L")
    public List<BookingResponse> getCompanyBookings(Long companyId) {
        Long targetId = companyId != null ? companyId : 1L;
        List<Booking> bookings = bookingRepository.findByBusCompanyIdWithTripDetails(targetId);
        if (bookings.isEmpty()) return Collections.emptyList();

        List<Long> bookingIds = bookings.stream().map(Booking::getId).collect(Collectors.toList());
        List<Ticket> allTickets = ticketRepository.findByBookingIdIn(bookingIds);
        Map<Long, List<Ticket>> ticketsByBooking = new HashMap<>();
        for (Ticket t : allTickets) {
            if (t.getBooking() != null && t.getBooking().getId() != null) {
                ticketsByBooking.computeIfAbsent(t.getBooking().getId(), k -> new ArrayList<>()).add(t);
            }
        }

        return bookings.stream()
                .map(b -> mapToBookingResponse(b, ticketsByBooking.getOrDefault(b.getId(), Collections.emptyList())))
                .collect(Collectors.toList());
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"admin_all_bookings", "system_stats", "company_dashboard_stats"}, allEntries = true)
    public BookingResponse updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn đặt vé"));
        booking.setStatus(status);
        List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
        return mapToBookingResponse(bookingRepository.save(booking), tickets);
    }

    public BookingResponse mapToBookingResponse(Booking b, List<Ticket> tickets) {
        List<TicketResponse> ticketResponses = tickets.stream().map(t -> TicketResponse.builder()
                .id(t.getId())
                .ticketCode(t.getTicketCode())
                .seatNumber(t.getSeatNumber())
                .price(t.getPrice())
                .qrCodeHash(t.getQrCodeHash())
                .status(t.getStatus())
                .createdAt(t.getCreatedAt())
                .build()).collect(Collectors.toList());

        return BookingResponse.builder()
                .id(b.getId())
                .bookingCode(b.getBookingCode())
                .userId(b.getUser() != null ? b.getUser().getId() : null)
                .customerName(b.getPassengerName())
                .customerPhone(b.getPassengerPhone())
                .customerEmail(b.getPassengerEmail())
                .trip(tripService.mapToTripResponse(b.getTrip()))
                .pickupPointName(b.getPickupPoint())
                .dropoffPointName(b.getDropoffPoint())
                .totalAmount(b.getTotalAmount())
                .paymentMethod(b.getPaymentMethod())
                .status(b.getStatus())
                .createdAt(b.getCreatedAt())
                .tickets(ticketResponses)
                .build();
    }

    @Transactional(readOnly = true)
    public com.traveleasy.dto.booking.VerifiedTicketResponse verifyTicket(String rawCode) {
        if (rawCode == null || rawCode.trim().isEmpty()) {
            return com.traveleasy.dto.booking.VerifiedTicketResponse.builder()
                    .validationStatus("INVALID")
                    .validationMessage("Mã QR rỗng hoặc không đúng định dạng")
                    .checkInAllowed(false)
                    .build();
        }

        String cleanCode = rawCode.trim();
        if (cleanCode.contains("|")) {
            String[] parts = cleanCode.split("\\|");
            for (String part : parts) {
                if (part.startsWith("TK-")) cleanCode = part;
                else if (part.startsWith("BK-") && !cleanCode.startsWith("TK-")) cleanCode = part;
            }
        }

        java.util.Optional<Ticket> ticketOpt = ticketRepository.findByTicketCode(cleanCode);
        if (ticketOpt.isPresent()) {
            Ticket ticket = ticketOpt.get();
            Booking booking = ticket.getBooking();
            return buildVerifiedResponse(ticket, booking);
        }

        java.util.Optional<Booking> bookingOpt = bookingRepository.findByBookingCode(cleanCode);
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
            Ticket ticket = tickets.isEmpty() ? null : tickets.get(0);
            return buildVerifiedResponse(ticket, booking);
        }

        return com.traveleasy.dto.booking.VerifiedTicketResponse.builder()
                .ticketCode(cleanCode)
                .validationStatus("INVALID")
                .validationMessage("Mã vé không tồn tại trong hệ thống TravelEasy. Vui lòng kiểm tra lại mã QR!")
                .checkInAllowed(false)
                .build();
    }

    @Transactional
    public com.traveleasy.dto.booking.VerifiedTicketResponse checkInTicket(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy mã vé " + ticketCode));

        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Vé đã bị hủy, không thể xác nhận lên xe");
        }

        ticket.setStatus(TicketStatus.USED);
        ticketRepository.save(ticket);
        return buildVerifiedResponse(ticket, ticket.getBooking());
    }

    private com.traveleasy.dto.booking.VerifiedTicketResponse buildVerifiedResponse(Ticket ticket, Booking booking) {
        Trip trip = booking != null ? booking.getTrip() : null;
        String valStatus = "VALID";
        String valMessage = "✓ VÉ HỢP LỆ — ĐÃ XÁC THỰC LÊN XE THÀNH CÔNG";
        boolean allowed = true;

        if (booking != null && booking.getStatus() == BookingStatus.CANCELLED) {
            valStatus = "CANCELLED";
            valMessage = "⚠️ VÉ ĐÃ HỦY: Đơn đặt vé này đã được hủy trước đó.";
            allowed = false;
        } else if (ticket != null && ticket.getStatus() == TicketStatus.CANCELLED) {
            valStatus = "CANCELLED";
            valMessage = "⚠️ VÉ ĐÃ HỦY: Chỗ ngồi này đã bị hủy.";
            allowed = false;
        } else if (ticket != null && ticket.getStatus() == TicketStatus.USED) {
            valStatus = "ALREADY_CHECKED_IN";
            valMessage = "ℹ️ ĐÃ SOÁT VÉ: Vé này đã được xác nhận lên xe trước đó.";
            allowed = false;
        }

        return com.traveleasy.dto.booking.VerifiedTicketResponse.builder()
                .bookingCode(booking != null ? booking.getBookingCode() : null)
                .ticketCode(ticket != null ? ticket.getTicketCode() : null)
                .passengerName(booking != null ? booking.getPassengerName() : null)
                .passengerPhone(booking != null ? booking.getPassengerPhone() : null)
                .passengerEmail(booking != null ? booking.getPassengerEmail() : null)
                .busCompanyName(trip != null && trip.getBusCompany() != null ? trip.getBusCompany().getName() : "TravelEasy Express")
                .busType(trip != null && trip.getBusType() != null ? trip.getBusType().name() : "Limousine VIP")
                .licensePlate(trip != null && trip.getLicensePlate() != null ? trip.getLicensePlate() : "51B-888.88")
                .routeName(trip != null && trip.getRoute() != null ? (trip.getRoute().getDepartureLocation() + " ➔ " + trip.getRoute().getArrivalLocation()) : "Tuyến liên tỉnh")
                .originCity(trip != null && trip.getRoute() != null ? trip.getRoute().getDepartureLocation() : null)
                .destinationCity(trip != null && trip.getRoute() != null ? trip.getRoute().getArrivalLocation() : null)
                .pickupPoint(booking != null ? booking.getPickupPoint() : null)
                .dropoffPoint(booking != null ? booking.getDropoffPoint() : null)
                .departureTime(trip != null ? trip.getDepartureTime() : null)
                .arrivalTime(trip != null ? trip.getArrivalTime() : null)
                .seatNumber(ticket != null ? ticket.getSeatNumber() : null)
                .price(ticket != null ? ticket.getPrice() : (booking != null ? booking.getTotalAmount() : null))
                .ticketStatus(ticket != null ? ticket.getStatus().name() : null)
                .bookingStatus(booking != null ? booking.getStatus().name() : null)
                .validationStatus(valStatus)
                .validationMessage(valMessage)
                .checkInAllowed(allowed)
                .build();
    }
}
