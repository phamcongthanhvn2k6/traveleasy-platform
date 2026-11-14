package com.traveleasy.service.company;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.common.security.CompanySecurityService;
import com.traveleasy.dto.pos.*;
import com.traveleasy.entity.*;
import com.traveleasy.repository.*;
import com.traveleasy.service.realtime.SeatRealtimeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyPosService {

    private final TripRepository tripRepository;
    private final TripSeatRepository tripSeatRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final BusCompanyRepository busCompanyRepository;
    private final CompanyPosShiftRepository posShiftRepository;
    private final SeatRealtimeService seatRealtimeService;
    private final CompanySecurityService securityService;
    private final JdbcTemplate jdbcTemplate;

    private User validateStaffAndResolveUser(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equalsIgnoreCase(authentication.getName())) {
            return securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.CASHIER);
        }
        return null;
    }

    private Long resolveTargetCompanyId(Long requestedCompanyId, User authenticatedUser) {
        if (authenticatedUser != null && authenticatedUser.getRole() != Role.ADMIN
                && authenticatedUser.getBusCompanyId() != null) {
            if (requestedCompanyId != null && !requestedCompanyId.equals(authenticatedUser.getBusCompanyId())) {
                throw new AppException(ErrorCode.FORBIDDEN,
                        "TRUY CẬP BỊ TỪ CHỐI: Bạn không có quyền thao tác trên dữ liệu POS của nhà xe khác!");
            }
            return authenticatedUser.getBusCompanyId();
        }
        return requestedCompanyId != null ? requestedCompanyId : 1L;
    }

    @Transactional
    @CacheEvict(value = {"company_trips", "company_dashboard_stats", "admin_all_bookings", "trips_search"}, allEntries = true)
    public PosReceiptResponse issuePosTicket(PosIssueTicketRequest request, Authentication authentication) {
        User staffUser = validateStaffAndResolveUser(authentication);

        if (request.getTripId() == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Vui lòng chọn chuyến xe cần xuất vé!");
        }
        if (request.getSeatNumbers() == null || request.getSeatNumbers().isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Vui lòng chọn ít nhất một ghế trống trên sơ đồ!");
        }

        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND,
                        "Không tìm thấy chuyến xe có mã: " + request.getTripId()));

        Long tripCompanyId = trip.getBusCompany() != null ? trip.getBusCompany().getId() : 1L;
        String busCompanyName = trip.getBusCompany() != null && trip.getBusCompany().getName() != null
                ? trip.getBusCompany().getName()
                : "Nhà Xe Liên Tỉnh TravelEasy";
        String busCompanyPhone = trip.getBusCompany() != null && trip.getBusCompany().getHotline() != null
                ? trip.getBusCompany().getHotline()
                : "1900 6067";
        if (staffUser != null && staffUser.getRole() != Role.ADMIN && staffUser.getBusCompanyId() != null) {
            if (!staffUser.getBusCompanyId().equals(tripCompanyId)) {
                throw new AppException(ErrorCode.FORBIDDEN,
                        "TRUY CẬP BỊ TỪ CHỐI: Chuyến xe này không thuộc quyền quản lý của nhà xe bạn!");
            }
        }

        if (trip.getStatus() != TripStatus.SCHEDULED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "Chuyến xe không ở trạng thái mở bán (Trạng thái hiện tại: " + trip.getStatus() + ")");
        }

        // Chuẩn hóa & sắp xếp mã ghế theo Canonical Lock Ordering để chống Deadlock đa luồng
        List<String> sortedSeatCodes = request.getSeatNumbers().stream()
                .filter(Objects::nonNull)
                .map(s -> s.trim().toUpperCase())
                .filter(s -> !s.isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        if (sortedSeatCodes.isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Danh sách mã ghế không hợp lệ!");
        }

        // Khóa bi quan PESSIMISTIC_WRITE các ghế được chọn
        List<TripSeat> lockedSeats = tripSeatRepository.findByTripIdAndSeatCodeInWithLock(trip.getId(), sortedSeatCodes);
        if (lockedSeats.size() != sortedSeatCodes.size()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND,
                    "Một hoặc nhiều ghế không tồn tại trên sơ đồ chuyến xe này!");
        }

        for (TripSeat seat : lockedSeats) {
            if (seat.getStatus() == SeatStatus.BOOKED) {
                throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED,
                        "Ghế " + seat.getSeatCode() + " vừa được bán! Vui lòng chọn ghế trống khác.");
            }
            if (seat.getStatus() == SeatStatus.LOCKED) {
                throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED,
                        "Ghế " + seat.getSeatCode() + " đang được hành khách online giữ chỗ thanh toán!");
            }
        }

        // Kiểm tra ca trực POS nếu có truyền shiftId
        CompanyPosShift activeShift = null;
        if (request.getShiftId() != null) {
            activeShift = posShiftRepository.findByIdWithLock(request.getShiftId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND,
                            "Không tìm thấy ca trực POS #" + request.getShiftId()));
            if (!tripCompanyId.equals(activeShift.getBusCompanyId())
                    && request.getBusCompanyId() != null
                    && !request.getBusCompanyId().equals(activeShift.getBusCompanyId())) {
                throw new AppException(ErrorCode.FORBIDDEN, "Ca trực không thuộc nhà xe của bạn!");
            }
            if (!"OPEN".equalsIgnoreCase(activeShift.getStatus())) {
                throw new AppException(ErrorCode.VALIDATION_ERROR,
                        "Ca trực #" + activeShift.getId() + " đã đóng (CLOSED). Vui lòng mở ca trực mới trước khi xuất vé!");
            }
        } else {
            activeShift = posShiftRepository.findFirstByBusCompanyIdAndStatusOrderByOpenedAtDesc(tripCompanyId, "OPEN")
                    .orElse(null);
        }

        // Chuyển trạng thái ghế sang BOOKED ngay lập tức
        for (TripSeat seat : lockedSeats) {
            seat.setStatus(SeatStatus.BOOKED);
        }
        tripSeatRepository.saveAllAndFlush(lockedSeats);

        // Đồng bộ số ghế trống thực tế trên chuyến xe
        long remainingAvailable = tripSeatRepository.countByTripIdAndStatus(trip.getId(), SeatStatus.AVAILABLE);
        trip.setAvailableSeats((int) remainingAvailable);
        tripRepository.save(trip);

        BigDecimal unitPrice = trip.getPrice() != null ? trip.getPrice() : BigDecimal.valueOf(300000);
        BigDecimal baseTotal = unitPrice.multiply(BigDecimal.valueOf(lockedSeats.size()));
        BigDecimal insuranceAmount = Boolean.TRUE.equals(request.getHasInsurance())
                ? BigDecimal.valueOf(25000L * lockedSeats.size())
                : BigDecimal.ZERO;
        BigDecimal totalAmount = baseTotal.add(insuranceAmount);

        String customerName = (request.getCustomerName() != null && !request.getCustomerName().trim().isEmpty())
                ? request.getCustomerName().trim()
                : "Khách vãng lai tại quầy";
        String customerPhone = (request.getCustomerPhone() != null && !request.getCustomerPhone().trim().isEmpty())
                ? request.getCustomerPhone().trim()
                : "0900000000";

        String rawPaymentMethod = request.getPaymentMethod() != null
                ? request.getPaymentMethod().trim().toUpperCase()
                : "CASH";
        boolean isQrPayment = "QR".equals(rawPaymentMethod) || "VIETQR".equals(rawPaymentMethod) || "PAYOS".equals(rawPaymentMethod);
        PaymentMethod entityPaymentMethod = isQrPayment ? PaymentMethod.VIETQR : PaymentMethod.COD;

        Route route = trip.getRoute();
        String originCity = route != null ? route.getDepartureLocation() : "Bến xe xuất phát";
        String destinationCity = route != null ? route.getArrivalLocation() : "Bến xe đích";
        String pickupPoint = (request.getPickupPoint() != null && !request.getPickupPoint().trim().isEmpty())
                ? request.getPickupPoint().trim()
                : (request.getTerminalName() != null && !request.getTerminalName().trim().isEmpty()
                    ? request.getTerminalName().trim()
                    : originCity);
        String dropoffPoint = (request.getDropoffPoint() != null && !request.getDropoffPoint().trim().isEmpty())
                ? request.getDropoffPoint().trim()
                : destinationCity;

        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uniqueSuffix = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        String bookingCode = "BK-POS-" + datePrefix + "-" + uniqueSuffix;

        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .user(staffUser)
                .trip(trip)
                .passengerName(customerName)
                .passengerPhone(customerPhone)
                .passengerEmail(request.getCustomerEmail())
                .pickupPoint(pickupPoint)
                .dropoffPoint(dropoffPoint)
                .seatNumbers(String.join(", ", sortedSeatCodes))
                .totalAmount(totalAmount)
                .originalAmount(baseTotal)
                .discountAmount(BigDecimal.ZERO)
                .insuranceAmount(insuranceAmount)
                .paymentMethod(entityPaymentMethod)
                .status(BookingStatus.CONFIRMED)
                .build();

        Booking savedBooking = bookingRepository.saveAndFlush(booking);

        LocalDateTime printedAt = LocalDateTime.now();
        List<Ticket> tickets = new ArrayList<>();
        List<PosReceiptResponse.PosTicketItem> ticketItems = new ArrayList<>();

        int seq = 1;
        for (TripSeat seat : lockedSeats) {
            String ticketRandom = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
            String ticketCode = String.format("TK-POS-%s-%s-%02d", datePrefix, ticketRandom, seq++);
            String qrHash = "QR-POS-" + UUID.randomUUID().toString().replace("-", "").toUpperCase();

            Ticket ticket = Ticket.builder()
                    .booking(savedBooking)
                    .ticketCode(ticketCode)
                    .seatNumber(seat.getSeatCode())
                    .price(unitPrice)
                    .qrCodeHash(qrHash)
                    .status(TicketStatus.ISSUED)
                    .build();
            tickets.add(ticket);
        }
        List<Ticket> savedTickets = ticketRepository.saveAllAndFlush(tickets);

        for (Ticket t : savedTickets) {
            ticketItems.add(PosReceiptResponse.PosTicketItem.builder()
                    .ticketId(t.getId())
                    .ticketCode(t.getTicketCode())
                    .seatNumber(t.getSeatNumber())
                    .price(t.getPrice())
                    .qrCodeHash(t.getQrCodeHash())
                    .status(t.getStatus().name())
                    .isPrinted(true)
                    .build());
        }

        // Cập nhật các cột mở rộng POS trên bảng bookings và tickets (nếu CSDL có cột)
        Long shiftIdToRecord = activeShift != null ? activeShift.getId() : null;
        Long staffIdToRecord = staffUser != null ? staffUser.getId() : 1L;
        try {
            jdbcTemplate.update(
                    "UPDATE bookings SET booking_channel = 'POS_COUNTER', pos_shift_id = ?, staff_user_id = ? WHERE id = ?",
                    shiftIdToRecord, staffIdToRecord, savedBooking.getId()
            );
            jdbcTemplate.update(
                    "UPDATE tickets SET is_printed = true, printed_at = ? WHERE booking_id = ?",
                    Timestamp.valueOf(printedAt), savedBooking.getId()
            );
        } catch (Exception ex) {
            log.debug("Bỏ qua cập nhật cột mở rộng POS trên môi trường test in-memory: {}", ex.getMessage());
        }

        // Cộng dồn nguyên tử doanh số và số vé vào ca trực POS đang mở
        if (activeShift != null) {
            if (isQrPayment) {
                posShiftRepository.recordQrSaleAtomically(activeShift.getId(), totalAmount, lockedSeats.size());
            } else {
                posShiftRepository.recordCashSaleAtomically(activeShift.getId(), totalAmount, lockedSeats.size());
            }
        }

        // Phát sự kiện SSE thời gian thực để Web/App khách hàng chuyển ghế sang ĐÃ BÁN (BOOKED) ngay lập tức
        seatRealtimeService.broadcastBooked(trip.getId(), sortedSeatCodes);

        BigDecimal cashReceived = request.getCashReceived() != null && request.getCashReceived().compareTo(totalAmount) >= 0
                ? request.getCashReceived()
                : totalAmount;
        BigDecimal changeAmount = isQrPayment ? BigDecimal.ZERO : cashReceived.subtract(totalAmount);

        String cashierName = staffUser != null && staffUser.getFullName() != null
                ? staffUser.getFullName()
                : "Phạm Thanh Phong (Thu ngân POS)";
        String counterName = request.getCounterName() != null && !request.getCounterName().isBlank()
                ? request.getCounterName()
                : (activeShift != null ? activeShift.getCounterName() : "Quầy POS 01 - Bến Xe Miền Đông");
        String terminalName = request.getTerminalName() != null && !request.getTerminalName().isBlank()
                ? request.getTerminalName()
                : "Bến Xe Miền Đông";
        String primaryQrHash = !ticketItems.isEmpty() ? ticketItems.get(0).getQrCodeHash() : bookingCode;

        return PosReceiptResponse.builder()
                .bookingId(savedBooking.getId())
                .bookingCode(savedBooking.getBookingCode())
                .qrCodeHash(primaryQrHash)
                .tripId(trip.getId())
                .busCompanyId(tripCompanyId)
                .busCompanyName(busCompanyName)
                .busCompanyPhone(busCompanyPhone)
                .routeName(originCity + " - " + destinationCity)
                .originCity(originCity)
                .destinationCity(destinationCity)
                .vehiclePlate(trip.getLicensePlate() != null ? trip.getLicensePlate() : "51B-299.88")
                .busType(trip.getBusType() != null ? trip.getBusType().name() : "LIMOUSINE")
                .departureTime(trip.getDepartureTime())
                .pickupPoint(pickupPoint)
                .dropoffPoint(dropoffPoint)
                .customerName(customerName)
                .customerPhone(customerPhone)
                .seatNumbers(sortedSeatCodes)
                .tickets(ticketItems)
                .unitPrice(unitPrice)
                .insuranceAmount(insuranceAmount)
                .totalAmount(totalAmount)
                .paymentMethod(isQrPayment ? "QR" : "CASH")
                .cashReceived(cashReceived)
                .changeAmount(changeAmount)
                .shiftId(shiftIdToRecord)
                .counterName(counterName)
                .terminalName(terminalName)
                .cashierName(cashierName)
                .printedAt(printedAt)
                .receiptWidthMm(80)
                .build();
    }

    @Transactional
    public PosShiftReportResponse openShift(PosOpenShiftRequest request, Authentication authentication) {
        User staffUser = validateStaffAndResolveUser(authentication);
        Long targetCompanyId = resolveTargetCompanyId(request != null ? request.getBusCompanyId() : null, staffUser);
        Long staffUserId = staffUser != null ? staffUser.getId() : 1L;

        BigDecimal initialCash = (request != null && request.getInitialCashAmount() != null)
                ? request.getInitialCashAmount()
                : BigDecimal.valueOf(1000000);
        if (initialCash.compareTo(BigDecimal.ZERO) < 0) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Số tiền mặt đầu ca không được âm!");
        }

        // Nếu nhà xe đã có ca đang mở của nhân viên này thì đóng hoặc trả về lỗi nếu muốn mở trùng
        Optional<CompanyPosShift> existingOpen = posShiftRepository
                .findFirstByBusCompanyIdAndStaffUserIdAndStatusOrderByOpenedAtDesc(targetCompanyId, staffUserId, "OPEN");
        if (existingOpen.isPresent()) {
            CompanyPosShift current = existingOpen.get();
            if (request != null && request.getCounterName() != null && !request.getCounterName().isBlank()) {
                current.setCounterName(request.getCounterName().trim());
            }
            if (request != null && request.getTerminalLocationId() != null) {
                current.setTerminalLocationId(request.getTerminalLocationId());
            }
            current.setUpdatedAt(LocalDateTime.now());
            CompanyPosShift saved = posShiftRepository.save(current);
            return mapToShiftReport(saved, staffUser, request != null ? request.getCashierName() : null, null);
        }

        String counterName = (request != null && request.getCounterName() != null && !request.getCounterName().isBlank())
                ? request.getCounterName().trim()
                : "Quầy POS 01 - Bến Xe Miền Đông";
        Long terminalId = (request != null && request.getTerminalLocationId() != null)
                ? request.getTerminalLocationId()
                : 1L;
        String cashierNote = (request != null && request.getNotes() != null && !request.getNotes().isBlank())
                ? request.getNotes().trim()
                : "Ca trực bán vé POS tại quầy bến xe (máy in nhiệt 80mm sẵn sàng)";
        if (request != null && request.getCashierName() != null && !request.getCashierName().isBlank()) {
            cashierNote = "[Thu ngân: " + request.getCashierName().trim() + "] " + cashierNote;
        }

        CompanyPosShift shift = CompanyPosShift.builder()
                .busCompanyId(targetCompanyId)
                .staffUserId(staffUserId)
                .terminalLocationId(terminalId)
                .counterName(counterName)
                .openedAt(LocalDateTime.now())
                .initialCashAmount(initialCash)
                .totalCashCollected(BigDecimal.ZERO)
                .totalQrCollected(BigDecimal.ZERO)
                .totalTicketsSold(0)
                .status("OPEN")
                .notes(cashierNote)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        CompanyPosShift saved = posShiftRepository.save(shift);
        return mapToShiftReport(saved, staffUser, request != null ? request.getCashierName() : null, null);
    }

    @Transactional
    public PosShiftReportResponse closeShift(Long shiftId, PosCloseShiftRequest request, Authentication authentication) {
        User staffUser = validateStaffAndResolveUser(authentication);

        CompanyPosShift shift = posShiftRepository.findByIdWithLock(shiftId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND,
                        "Không tìm thấy ca trực POS #" + shiftId));

        if (staffUser != null && staffUser.getRole() != Role.ADMIN && staffUser.getBusCompanyId() != null) {
            if (!staffUser.getBusCompanyId().equals(shift.getBusCompanyId())) {
                throw new AppException(ErrorCode.FORBIDDEN,
                        "TRUY CẬP BỊ TỪ CHỐI: Bạn không có quyền kết ca trực của nhà xe khác!");
            }
        }

        if ("CLOSED".equalsIgnoreCase(shift.getStatus())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Ca trực #" + shiftId + " đã được kết ca trước đó!");
        }

        BigDecimal initialCash = shift.getInitialCashAmount() != null ? shift.getInitialCashAmount() : BigDecimal.ZERO;
        BigDecimal cashSales = shift.getTotalCashCollected() != null ? shift.getTotalCashCollected() : BigDecimal.ZERO;
        BigDecimal expectedCash = initialCash.add(cashSales);

        BigDecimal countedCash = (request != null && request.getCountedCashAmount() != null)
                ? request.getCountedCashAmount()
                : expectedCash;
        if (countedCash.compareTo(BigDecimal.ZERO) < 0) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Số tiền mặt kiểm đếm thực tế không được âm!");
        }

        BigDecimal discrepancy = countedCash.subtract(expectedCash);
        String auditStatus = discrepancy.compareTo(BigDecimal.ZERO) == 0
                ? "BALANCED"
                : (discrepancy.compareTo(BigDecimal.ZERO) > 0 ? "SURPLUS" : "DEFICIT");

        shift.setStatus("CLOSED");
        shift.setClosedAt(LocalDateTime.now());
        shift.setUpdatedAt(LocalDateTime.now());

        String closingSummary = String.format(
                " | [Z-REPORT %s: Kỳ vọng=%sđ, Thực kiểm=%sđ, Chênh lệch=%sđ]",
                auditStatus,
                expectedCash.toPlainString(),
                countedCash.toPlainString(),
                discrepancy.toPlainString()
        );
        String extraNote = (request != null && request.getNotes() != null && !request.getNotes().isBlank())
                ? " - Ghi chú: " + request.getNotes().trim()
                : "";
        shift.setNotes((shift.getNotes() != null ? shift.getNotes() : "") + closingSummary + extraNote);

        CompanyPosShift saved = posShiftRepository.save(shift);
        return mapToShiftReport(saved, staffUser, null, countedCash);
    }

    @Transactional(readOnly = true)
    public PosShiftReportResponse getCurrentShift(Long busCompanyId, Authentication authentication) {
        User staffUser = validateStaffAndResolveUser(authentication);
        Long targetCompanyId = resolveTargetCompanyId(busCompanyId, staffUser);

        Optional<CompanyPosShift> openShift = posShiftRepository
                .findFirstByBusCompanyIdAndStatusOrderByOpenedAtDesc(targetCompanyId, "OPEN");

        if (openShift.isPresent()) {
            return mapToShiftReport(openShift.get(), staffUser, null, null);
        }

        List<CompanyPosShift> allShifts = posShiftRepository.findByBusCompanyIdOrderByOpenedAtDesc(targetCompanyId);
        if (!allShifts.isEmpty()) {
            return mapToShiftReport(allShifts.get(0), staffUser, null, null);
        }
        return null;
    }

    @Transactional(readOnly = true)
    public List<PosShiftReportResponse> getShiftSalesReports(Long busCompanyId, Authentication authentication) {
        User staffUser = validateStaffAndResolveUser(authentication);
        Long targetCompanyId = resolveTargetCompanyId(busCompanyId, staffUser);

        List<CompanyPosShift> shifts = posShiftRepository.findByBusCompanyIdOrderByOpenedAtDesc(targetCompanyId);
        Map<Long, String> userNames = new HashMap<>();
        for (CompanyPosShift s : shifts) {
            if (s.getStaffUserId() != null && !userNames.containsKey(s.getStaffUserId())) {
                userRepository.findById(s.getStaffUserId())
                        .ifPresent(u -> userNames.put(s.getStaffUserId(), u.getFullName()));
            }
        }

        return shifts.stream()
                .map(s -> mapToShiftReport(s, null, userNames.get(s.getStaffUserId()), null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PosReceiptResponse> getRecentPosReceipts(Long busCompanyId, Authentication authentication) {
        User staffUser = validateStaffAndResolveUser(authentication);
        Long targetCompanyId = resolveTargetCompanyId(busCompanyId, staffUser);

        List<Booking> bookings = bookingRepository.findByBusCompanyIdWithTripDetails(targetCompanyId);
        List<Booking> topRecent = bookings.stream().limit(10).collect(Collectors.toList());
        if (topRecent.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> bookingIds = topRecent.stream().map(Booking::getId).collect(Collectors.toList());
        Map<Long, List<Ticket>> ticketsByBooking = ticketRepository.findByBookingIdIn(bookingIds).stream()
                .collect(Collectors.groupingBy(t -> t.getBooking().getId()));

        List<PosReceiptResponse> results = new ArrayList<>();
        for (Booking b : topRecent) {
            Trip trip = b.getTrip();
            Route route = trip != null ? trip.getRoute() : null;
            BusCompany company = trip != null ? trip.getBusCompany() : null;
            String origin = route != null ? route.getDepartureLocation() : "Bến xe xuất phát";
            String dest = route != null ? route.getArrivalLocation() : "Bến xe đích";

            List<Ticket> bTickets = ticketsByBooking.getOrDefault(b.getId(), Collections.emptyList());
            List<PosReceiptResponse.PosTicketItem> items = bTickets.stream()
                    .map(t -> PosReceiptResponse.PosTicketItem.builder()
                            .ticketId(t.getId())
                            .ticketCode(t.getTicketCode())
                            .seatNumber(t.getSeatNumber())
                            .price(t.getPrice())
                            .qrCodeHash(t.getQrCodeHash() != null ? t.getQrCodeHash() : t.getTicketCode())
                            .status(t.getStatus().name())
                            .isPrinted(true)
                            .build())
                    .collect(Collectors.toList());

            List<String> seats = Arrays.stream((b.getSeatNumbers() != null ? b.getSeatNumbers() : "").split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());

            results.add(PosReceiptResponse.builder()
                    .bookingId(b.getId())
                    .bookingCode(b.getBookingCode())
                    .tripId(trip != null ? trip.getId() : null)
                    .busCompanyId(targetCompanyId)
                    .busCompanyName(company != null ? company.getName() : "Nhà Xe TravelEasy")
                    .busCompanyPhone(company != null ? company.getHotline() : "1900 6067")
                    .routeName(origin + " - " + dest)
                    .originCity(origin)
                    .destinationCity(dest)
                    .vehiclePlate(trip != null && trip.getLicensePlate() != null ? trip.getLicensePlate() : "51B-299.88")
                    .busType(trip != null && trip.getBusType() != null ? trip.getBusType().name() : "LIMOUSINE")
                    .departureTime(trip != null ? trip.getDepartureTime() : LocalDateTime.now())
                    .pickupPoint(b.getPickupPoint() != null ? b.getPickupPoint() : origin)
                    .dropoffPoint(b.getDropoffPoint() != null ? b.getDropoffPoint() : dest)
                    .customerName(b.getPassengerName())
                    .customerPhone(b.getPassengerPhone())
                    .seatNumbers(seats)
                    .tickets(items)
                    .unitPrice(trip != null ? trip.getPrice() : b.getTotalAmount())
                    .insuranceAmount(b.getInsuranceAmount() != null ? b.getInsuranceAmount() : BigDecimal.ZERO)
                    .totalAmount(b.getTotalAmount())
                    .paymentMethod(b.getPaymentMethod() == PaymentMethod.COD ? "CASH" : "QR")
                    .cashReceived(b.getTotalAmount())
                    .changeAmount(BigDecimal.ZERO)
                    .counterName("Quầy POS 01 - Bến Xe Miền Đông")
                    .terminalName("Bến Xe Miền Đông")
                    .cashierName("Phạm Thanh Phong")
                    .printedAt(b.getCreatedAt() != null ? b.getCreatedAt() : LocalDateTime.now())
                    .receiptWidthMm(80)
                    .build());
        }
        return results;
    }

    private PosShiftReportResponse mapToShiftReport(
            CompanyPosShift shift,
            User staffUser,
            String customCashierName,
            BigDecimal explicitCountedCash
    ) {
        BigDecimal initialCash = shift.getInitialCashAmount() != null ? shift.getInitialCashAmount() : BigDecimal.ZERO;
        BigDecimal cashCollected = shift.getTotalCashCollected() != null ? shift.getTotalCashCollected() : BigDecimal.ZERO;
        BigDecimal qrCollected = shift.getTotalQrCollected() != null ? shift.getTotalQrCollected() : BigDecimal.ZERO;
        BigDecimal totalRevenue = cashCollected.add(qrCollected);
        BigDecimal expectedCash = initialCash.add(cashCollected);

        BigDecimal countedCash = explicitCountedCash != null ? explicitCountedCash : expectedCash;
        BigDecimal discrepancy = countedCash.subtract(expectedCash);

        String auditStatus = "OPEN";
        if ("CLOSED".equalsIgnoreCase(shift.getStatus())) {
            if (discrepancy.compareTo(BigDecimal.ZERO) == 0) {
                auditStatus = "BALANCED";
            } else if (discrepancy.compareTo(BigDecimal.ZERO) > 0) {
                auditStatus = "SURPLUS";
            } else {
                auditStatus = "DEFICIT";
            }
        }

        String cashierName = customCashierName;
        if ((cashierName == null || cashierName.isBlank()) && shift.getNotes() != null && shift.getNotes().startsWith("[Thu ngân: ")) {
            int endIdx = shift.getNotes().indexOf(']');
            if (endIdx > 11) {
                cashierName = shift.getNotes().substring(11, endIdx).trim();
            }
        }
        if ((cashierName == null || cashierName.isBlank()) && staffUser != null && staffUser.getFullName() != null) {
            cashierName = staffUser.getFullName();
        }
        if (cashierName == null || cashierName.isBlank()) {
            cashierName = userRepository.findById(shift.getStaffUserId() != null ? shift.getStaffUserId() : 1L)
                    .map(User::getFullName)
                    .orElse("Phạm Thanh Phong");
        }

        String terminalName = resolveTerminalName(shift.getTerminalLocationId(), shift.getCounterName());
        String datePart = (shift.getOpenedAt() != null ? shift.getOpenedAt() : LocalDateTime.now())
                .format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String shiftCode = String.format("POS-SHIFT-%s-%02d", datePart, shift.getId() != null ? shift.getId() : 1L);

        return PosShiftReportResponse.builder()
                .shiftId(shift.getId())
                .shiftCode(shiftCode)
                .busCompanyId(shift.getBusCompanyId())
                .staffUserId(shift.getStaffUserId())
                .cashierName(cashierName)
                .terminalLocationId(shift.getTerminalLocationId())
                .terminalName(terminalName)
                .counterName(shift.getCounterName())
                .openedAt(shift.getOpenedAt())
                .closedAt(shift.getClosedAt())
                .initialCashAmount(initialCash)
                .totalCashCollected(cashCollected)
                .totalQrCollected(qrCollected)
                .totalRevenue(totalRevenue)
                .expectedCashInDrawer(expectedCash)
                .countedCashAmount("CLOSED".equalsIgnoreCase(shift.getStatus()) ? countedCash : null)
                .cashDiscrepancy("CLOSED".equalsIgnoreCase(shift.getStatus()) ? discrepancy : BigDecimal.ZERO)
                .auditStatus(auditStatus)
                .totalTicketsSold(shift.getTotalTicketsSold() != null ? shift.getTotalTicketsSold() : 0)
                .status(shift.getStatus())
                .notes(shift.getNotes())
                .build();
    }

    private String resolveTerminalName(Long terminalLocationId, String counterName) {
        if (counterName != null) {
            if (counterName.toLowerCase().contains("miền tây")) return "Bến Xe Miền Tây";
            if (counterName.toLowerCase().contains("mỹ đình")) return "Bến Xe Mỹ Đình";
            if (counterName.toLowerCase().contains("miền đông")) return "Bến Xe Miền Đông";
        }
        if (terminalLocationId != null) {
            if (terminalLocationId == 2L) return "Bến Xe Miền Tây";
            if (terminalLocationId == 3L) return "Bến Xe Mỹ Đình";
        }
        return "Bến Xe Miền Đông";
    }
}

