package com.traveleasy.service.customer;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.booking.BookingResponse;
import com.traveleasy.dto.booking.CreateBookingRequest;
import com.traveleasy.dto.booking.TicketResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
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

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public BookingResponse createBooking(CreateBookingRequest request, String userEmail) {
        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe"));

        if (trip.getStatus() != TripStatus.SCHEDULED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Chuyến xe không còn mở bán vé");
        }

        // PESSIMISTIC LOCK: Lock các ghế được chọn để chống xung đột đặt trùng
        List<TripSeat> requestedSeats = tripSeatRepository.findByTripIdAndSeatCodeInWithLock(
                trip.getId(), request.getSeatNumbers());

        if (requestedSeats.size() != request.getSeatNumbers().size()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Một số ghế không tồn tại trên chuyến này");
        }

        for (TripSeat seat : requestedSeats) {
            if (seat.getStatus() != SeatStatus.AVAILABLE) {
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
    public BookingResponse cancelBooking(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn đặt vé"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Đơn đặt vé này đã bị hủy trước đó");
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

        return mapToBookingResponse(booking, tickets);
    }

    @Transactional
    public BookingResponse cancelPartialTickets(Long bookingId, List<Long> ticketIds, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn đặt vé"));

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

        Ticket oldTicket = ticketRepository.findById(oldTicketId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy vé cần đổi"));

        if (oldTicket.getStatus() == TicketStatus.CANCELLED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Vé này đã bị hủy, không thể đổi chuyến");
        }

        Trip newTrip = tripRepository.findById(newTripId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe mới"));

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

    private BookingResponse mapToBookingResponse(Booking b, List<Ticket> tickets) {
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
}
