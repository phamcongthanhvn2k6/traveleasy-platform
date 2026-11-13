package com.traveleasy.service.realtime;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.trip.SeatUpdateEvent;
import com.traveleasy.entity.SeatStatus;
import com.traveleasy.entity.TripSeat;
import com.traveleasy.repository.TripSeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeatRealtimeService {

    private final TripSeatRepository tripSeatRepository;
    private final com.traveleasy.repository.TripRepository tripRepository;

    // Map chứa các SseEmitter theo tripId
    private final ConcurrentHashMap<Long, CopyOnWriteArrayList<SseEmitter>> tripEmitters = new ConcurrentHashMap<>();

    // Map theo dõi thông tin người/phiên đang giữ ghế (key: "tripId:SEAT_CODE", value: userEmail hoặc sessionId)
    private final ConcurrentHashMap<String, String> seatHolders = new ConcurrentHashMap<>();

    // Map theo dõi thời điểm khóa ghế (timestamp tính bằng ms) để tự động nhận diện hết hạn 10 phút
    private final ConcurrentHashMap<String, Long> seatHoldTimes = new ConcurrentHashMap<>();

    // Scheduler cho tự động nhả ghế sau thời gian giữ chỗ (10 phút)
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    @jakarta.annotation.PostConstruct
    public void resetOrphanLocksOnStartup() {
        try {
            int resetCount = tripSeatRepository.resetAllLockedSeatsToAvailable();
            if (resetCount > 0) {
                log.info("⚡ Khởi động hệ thống: Đã tự động giải phóng {} ghế LOCKED tồn đọng về AVAILABLE", resetCount);
            }
        } catch (Exception e) {
            log.warn("Không thể reset ghế LOCKED khi khởi động: {}", e.getMessage());
        }
    }

    private String getHolderKey(Long tripId, String seatCode) {
        return tripId + ":" + (seatCode != null ? seatCode.trim().toUpperCase() : "");
    }

    /**
     * Đăng ký nhận luồng SSE thời gian thực cho một chuyến xe
     */
    public SseEmitter subscribe(Long tripId) {
        // Timeout 30 phút (1,800,000 ms)
        SseEmitter emitter = new SseEmitter(1_800_000L);

        tripEmitters.computeIfAbsent(tripId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        Runnable cleanup = () -> {
            CopyOnWriteArrayList<SseEmitter> emitters = tripEmitters.get(tripId);
            if (emitters != null) {
                emitters.remove(emitter);
                if (emitters.isEmpty()) {
                    tripEmitters.remove(tripId);
                }
            }
        };

        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        // Gửi sự kiện INIT chào mừng ban đầu
        try {
            emitter.send(SseEmitter.event()
                    .name("INIT")
                    .data(Map.of(
                            "tripId", tripId,
                            "message", "Đã kết nối thành công luồng cập nhật ghế thời gian thực!",
                            "timestamp", LocalDateTime.now().toString()
                    )));
        } catch (IOException e) {
            log.warn("Không thể gửi sự kiện INIT tới emitter cho tripId {}: {}", tripId, e.getMessage());
            cleanup.run();
        }

        return emitter;
    }

    /**
     * Phát broadcast cập nhật trạng thái ghế đến tất cả khách hàng đang xem chuyến này
     */
    public void broadcastSeatUpdate(Long tripId, String seatNumber, SeatStatus status, String message, String holderSessionId) {
        try {
            SeatUpdateEvent event = SeatUpdateEvent.builder()
                    .tripId(tripId)
                    .seatNumber(seatNumber)
                    .status(status)
                    .message(message)
                    .holderSessionId(holderSessionId)
                    .timestamp(LocalDateTime.now())
                    .build();

            CopyOnWriteArrayList<SseEmitter> emitters = tripEmitters.get(tripId);
            if (emitters == null || emitters.isEmpty()) {
                return;
            }

            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("SEAT_UPDATE")
                            .data(event));
                } catch (Throwable e) {
                    deadEmitters.add(emitter);
                    try {
                        emitter.complete();
                    } catch (Throwable ignored) {}
                }
            }

            if (!deadEmitters.isEmpty()) {
                emitters.removeAll(deadEmitters);
            }
        } catch (Throwable t) {
            log.warn("Không thể broadcast SSE (không ảnh hưởng giao dịch giữ chỗ): {}", t.getMessage());
        }
    }

    /**
     * Khóa giữ chỗ ghế tạm thời khi khách chuyển sang bước thanh toán (đổi màu VÀNG - LOCKED)
     */
    @Transactional
    public List<SeatUpdateEvent> holdSeats(Long tripId, List<String> seatCodes, String sessionId) {
        return holdSeats(tripId, seatCodes, sessionId, null);
    }

    /**
     * Khóa giữ chỗ ghế tạm thời với thông tin định danh người dùng (userEmail hoặc sessionId)
     */
    @Transactional
    public List<SeatUpdateEvent> holdSeats(Long tripId, List<String> seatCodes, String sessionId, String userEmail) {
        if (seatCodes == null || seatCodes.isEmpty()) {
            return Collections.emptyList();
        }

        String currentHolder = (userEmail != null && !userEmail.isBlank())
                ? userEmail.trim().toLowerCase()
                : (sessionId != null && !sessionId.isBlank() ? sessionId.trim() : "anonymous_" + UUID.randomUUID().toString().substring(0, 8));

        List<String> sortedCodes = new ArrayList<>(seatCodes);
        Collections.sort(sortedCodes);
        List<TripSeat> seats = tripSeatRepository.findByTripIdAndSeatCodeInWithLock(tripId, sortedCodes);
        if (seats.size() != seatCodes.size()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Một số ghế không tồn tại trên chuyến này");
        }

        for (TripSeat seat : seats) {
            if (seat.getStatus() == SeatStatus.BOOKED) {
                throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED, "Ghế " + seat.getSeatCode() + " đã có người mua vé!");
            }
            if (seat.getStatus() == SeatStatus.LOCKED) {
                String key = getHolderKey(tripId, seat.getSeatCode());
                Long holdTime = seatHoldTimes.get(key);
                String existingHolder = seatHolders.get(key);
                // Kiểm tra xem khóa giữ chỗ có còn hiệu lực không (tối đa 10 phút = 600,000ms)
                boolean isExpired = (holdTime == null) || (System.currentTimeMillis() - holdTime > 600_000L);
                if (isExpired) {
                    // Đã hết hạn hoặc mất phiên -> tự động mở lại ghế và cho phép phiên mới tiếp quản
                    seat.setStatus(SeatStatus.AVAILABLE);
                    seatHolders.remove(key);
                    seatHoldTimes.remove(key);
                } else if (existingHolder != null) {
                    boolean isSameHolder = existingHolder.equalsIgnoreCase(currentHolder)
                            || (userEmail != null && !userEmail.isBlank() && existingHolder.equalsIgnoreCase(userEmail.trim()))
                            || (sessionId != null && !sessionId.isBlank() && existingHolder.equalsIgnoreCase(sessionId.trim()));
                    if (!isSameHolder) {
                        throw new AppException(ErrorCode.VALIDATION_ERROR, "Ghế " + seat.getSeatCode() + " đang được một khách hàng khác giữ chỗ thanh toán (thời hạn 10 phút)!");
                    }
                }
            }
        }

        List<SeatUpdateEvent> events = new ArrayList<>();
        for (TripSeat seat : seats) {
            seat.setStatus(SeatStatus.LOCKED);
            String key = getHolderKey(tripId, seat.getSeatCode());
            seatHolders.put(key, currentHolder);
            seatHoldTimes.putIfAbsent(key, System.currentTimeMillis());
            events.add(SeatUpdateEvent.builder()
                    .tripId(tripId)
                    .seatNumber(seat.getSeatCode())
                    .status(SeatStatus.LOCKED)
                    .message("Ghế " + seat.getSeatCode() + " đang được giữ chỗ thanh toán (thời hạn 10 phút)")
                    .holderSessionId(currentHolder)
                    .timestamp(LocalDateTime.now())
                    .build());
        }
        tripSeatRepository.saveAllAndFlush(seats);

        // Cập nhật số chỗ trống thực tế trên bảng trips để kết quả tìm kiếm toàn sàn khớp 100%
        try {
            tripRepository.findById(tripId).ifPresent(trip -> {
                long availableCount = tripSeatRepository.countByTripIdAndStatus(tripId, SeatStatus.AVAILABLE);
                trip.setAvailableSeats((int) availableCount);
                tripRepository.saveAndFlush(trip);
            });
        } catch (Exception e) {
            log.warn("Không thể cập nhật availableSeats trên trip {}: {}", tripId, e.getMessage());
        }

        // Broadcast sự kiện LOCKED tới toàn bộ người dùng đang mở sơ đồ chuyến này
        for (SeatUpdateEvent ev : events) {
            try {
                broadcastSeatUpdate(tripId, ev.getSeatNumber(), ev.getStatus(), ev.getMessage(), currentHolder);
            } catch (Throwable ignored) {}
        }

        // Lên lịch tự động nhả ghế sau 10 phút (600s) nếu chưa hoàn tất thanh toán
        scheduler.schedule(() -> autoReleaseIfStillLocked(tripId, seatCodes), 10, TimeUnit.MINUTES);

        return events;
    }

    /**
     * Thông tin chi tiết về người đang giữ ghế
     */
    @lombok.Data
    @lombok.Builder
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class SeatHolderInfo {
        private boolean isHeld;
        private boolean isHeldByMe;
        private boolean isExpired;
        private long remainingSeconds;
        private String holderIdentifier;
    }

    /**
     * Lấy thông tin giữ chỗ của một ghế cụ thể
     */
    public SeatHolderInfo getSeatHolderInfo(Long tripId, String seatCode, String userEmail, String sessionId) {
        String key = getHolderKey(tripId, seatCode);
        String holder = seatHolders.get(key);
        Long holdTime = seatHoldTimes.get(key);

        if (holder == null || holdTime == null) {
            return null;
        }

        long elapsed = System.currentTimeMillis() - holdTime;
        if (elapsed > 600_000L) {
            return SeatHolderInfo.builder()
                    .isHeld(false)
                    .isHeldByMe(false)
                    .isExpired(true)
                    .remainingSeconds(0)
                    .build();
        }

        boolean isHeldByMe = false;
        if (userEmail != null && !userEmail.isBlank() && holder.equalsIgnoreCase(userEmail.trim())) {
            isHeldByMe = true;
        } else if (sessionId != null && !sessionId.isBlank() && holder.equalsIgnoreCase(sessionId.trim())) {
            isHeldByMe = true;
        }

        long remainingSecs = Math.max(0, (600_000L - elapsed) / 1000L);

        return SeatHolderInfo.builder()
                .isHeld(true)
                .isHeldByMe(isHeldByMe)
                .isExpired(false)
                .remainingSeconds(remainingSecs)
                .holderIdentifier(holder)
                .build();
    }

    /**
     * Lấy toàn bộ thông tin phiên giữ chỗ hiện tại của người dùng trên toàn hệ thống
     */
    @Transactional(readOnly = true)
    public com.traveleasy.dto.trip.ActiveHoldResponse getMyActiveHold(String userEmail, String sessionId) {
        if ((userEmail == null || userEmail.isBlank()) && (sessionId == null || sessionId.isBlank())) {
            return com.traveleasy.dto.trip.ActiveHoldResponse.builder().hasActiveHold(false).build();
        }

        Long matchedTripId = null;
        List<String> heldSeats = new ArrayList<>();
        Long minRemainingSeconds = Long.MAX_VALUE;
        Long earliestHoldTime = null;

        long now = System.currentTimeMillis();

        for (Map.Entry<String, String> entry : seatHolders.entrySet()) {
            String key = entry.getKey();
            String holder = entry.getValue();

            boolean matches = false;
            if (userEmail != null && !userEmail.isBlank() && holder.equalsIgnoreCase(userEmail.trim())) {
                matches = true;
            } else if (sessionId != null && !sessionId.isBlank() && holder.equalsIgnoreCase(sessionId.trim())) {
                matches = true;
            }

            if (matches) {
                Long holdTime = seatHoldTimes.get(key);
                if (holdTime != null) {
                    long elapsed = now - holdTime;
                    if (elapsed <= 600_000L) {
                        String[] parts = key.split(":");
                        if (parts.length == 2) {
                            try {
                                Long tId = Long.parseLong(parts[0]);
                                if (matchedTripId == null) {
                                    matchedTripId = tId;
                                }
                                if (matchedTripId.equals(tId)) {
                                    heldSeats.add(parts[1]);
                                    long remaining = Math.max(0, (600_000L - elapsed) / 1000L);
                                    if (remaining < minRemainingSeconds) {
                                        minRemainingSeconds = remaining;
                                        earliestHoldTime = holdTime;
                                    }
                                }
                            } catch (NumberFormatException ignored) {}
                        }
                    }
                }
            }
        }

        if (matchedTripId == null || heldSeats.isEmpty()) {
            return com.traveleasy.dto.trip.ActiveHoldResponse.builder().hasActiveHold(false).build();
        }

        Collections.sort(heldSeats);
        Long finalTripId = matchedTripId;
        final long finalRemaining = minRemainingSeconds != Long.MAX_VALUE ? minRemainingSeconds : 600L;
        final long finalExpiry = earliestHoldTime != null ? (earliestHoldTime + 600_000L) : (now + 600_000L);

        return tripRepository.findByIdWithDetails(finalTripId).map(trip -> com.traveleasy.dto.trip.ActiveHoldResponse.builder()
                .hasActiveHold(true)
                .tripId(trip.getId())
                .busCompanyName(trip.getBusCompany() != null ? trip.getBusCompany().getName() : "TravelEasy Bus")
                .busCompanyLogo(trip.getBusCompany() != null ? trip.getBusCompany().getLogoUrl() : null)
                .originCity(trip.getRoute() != null ? trip.getRoute().getDepartureLocation() : "")
                .destinationCity(trip.getRoute() != null ? trip.getRoute().getArrivalLocation() : "")
                .departureTime(trip.getDepartureTime())
                .price(trip.getPrice())
                .seatCodes(heldSeats)
                .remainingSeconds(finalRemaining)
                .expiryTimestamp(finalExpiry)
                .build()
        ).orElse(com.traveleasy.dto.trip.ActiveHoldResponse.builder().hasActiveHold(false).build());
    }

    /**
     * Kiểm tra xem ghế có đang được giữ bởi chính user này hay không
     */
    public boolean isSeatHeldBy(Long tripId, String seatCode, String userEmail, String sessionId) {
        String key = getHolderKey(tripId, seatCode);
        Long holdTime = seatHoldTimes.get(key);
        if (holdTime == null || (System.currentTimeMillis() - holdTime > 600_000L)) {
            return true; // Khóa đã hết hạn hoặc không có phiên trong bộ nhớ -> Cho phép tiến hành
        }
        String existingHolder = seatHolders.get(key);
        if (existingHolder == null) {
            return true;
        }
        if (userEmail != null && !userEmail.isBlank() && existingHolder.equalsIgnoreCase(userEmail.trim())) {
            return true;
        }
        if (sessionId != null && !sessionId.isBlank() && existingHolder.equalsIgnoreCase(sessionId.trim())) {
            return true;
        }
        return false;
    }

    /**
     * Xóa thông tin giữ chỗ khi đã thanh toán thành công
     */
    public void removeSeatHolders(Long tripId, List<String> seatCodes) {
        if (seatCodes == null) return;
        for (String seatCode : seatCodes) {
            String key = getHolderKey(tripId, seatCode);
            seatHolders.remove(key);
            seatHoldTimes.remove(key);
        }
    }

    /**
     * Hủy giữ chỗ ghế và trả về trạng thái TRỐNG (AVAILABLE)
     */
    @Transactional
    public void releaseSeats(Long tripId, List<String> seatCodes) {
        if (seatCodes == null || seatCodes.isEmpty()) {
            return;
        }

        List<String> sortedCodes = new ArrayList<>(seatCodes);
        Collections.sort(sortedCodes);
        List<TripSeat> seats = tripSeatRepository.findByTripIdAndSeatCodeInWithLock(tripId, sortedCodes);
        for (TripSeat seat : seats) {
            if (seat.getStatus() == SeatStatus.LOCKED) {
                seat.setStatus(SeatStatus.AVAILABLE);
                String key = getHolderKey(tripId, seat.getSeatCode());
                seatHolders.remove(key);
                seatHoldTimes.remove(key);
                broadcastSeatUpdate(tripId, seat.getSeatCode(), SeatStatus.AVAILABLE,
                        "Ghế " + seat.getSeatCode() + " đã được mở lại cho khách khác đặt", null);
            }
        }
        tripSeatRepository.saveAllAndFlush(seats);

        try {
            tripRepository.findById(tripId).ifPresent(trip -> {
                long availableCount = tripSeatRepository.countByTripIdAndStatus(tripId, SeatStatus.AVAILABLE);
                trip.setAvailableSeats((int) availableCount);
                tripRepository.saveAndFlush(trip);
            });
        } catch (Exception e) {
            log.warn("Không thể cập nhật availableSeats sau khi release trên trip {}: {}", tripId, e.getMessage());
        }
    }

    /**
     * Broadcast thông báo các ghế đã thanh toán thành công (XÁM - BOOKED)
     */
    public void broadcastBooked(Long tripId, List<String> seatCodes) {
        if (seatCodes == null) return;
        for (String seatCode : seatCodes) {
            seatHolders.remove(getHolderKey(tripId, seatCode));
            broadcastSeatUpdate(tripId, seatCode, SeatStatus.BOOKED,
                    "Ghế " + seatCode + " vừa được thanh toán thành công!", null);
        }
    }

    /**
     * Broadcast thông báo các ghế được hoàn hủy về trống (TRẮNG - AVAILABLE)
     */
    public void broadcastReleased(Long tripId, List<String> seatCodes) {
        if (seatCodes == null) return;
        for (String seatCode : seatCodes) {
            broadcastSeatUpdate(tripId, seatCode, SeatStatus.AVAILABLE,
                    "Ghế " + seatCode + " đã được hoàn lại thành ghế trống.", null);
        }
    }

    /**
     * Giả lập thời gian thực (demo realtime simulation) để test nhanh trên giao diện
     */
    @Transactional
    public SeatUpdateEvent simulateSeatAction(Long tripId, String seatNumber, String action) {
        TripSeat seat = tripSeatRepository.findByTripIdAndSeatCode(tripId, seatNumber)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy ghế " + seatNumber));

        SeatStatus targetStatus;
        String msg;

        if ("HOLD".equalsIgnoreCase(action) || "LOCK".equalsIgnoreCase(action)) {
            targetStatus = SeatStatus.LOCKED;
            msg = "⚡ Giả lập: Khách hàng đang thanh toán ghế " + seatNumber + " (Màu Vàng)";
        } else if ("BOOK".equalsIgnoreCase(action)) {
            targetStatus = SeatStatus.BOOKED;
            msg = "⚡ Giả lập: Đã thanh toán thành công ghế " + seatNumber + " (Màu Xám)";
        } else {
            targetStatus = SeatStatus.AVAILABLE;
            msg = "⚡ Giả lập: Ghế " + seatNumber + " đã được giải phóng về trống (Màu Trắng)";
        }

        seat.setStatus(targetStatus);
        tripSeatRepository.save(seat);

        broadcastSeatUpdate(tripId, seatNumber, targetStatus, msg, "simulation");

        return SeatUpdateEvent.builder()
                .tripId(tripId)
                .seatNumber(seatNumber)
                .status(targetStatus)
                .message(msg)
                .holderSessionId("simulation")
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Tự động giải phóng ghế sau khi hết hạn 10 phút
     */
    private void autoReleaseIfStillLocked(Long tripId, List<String> seatCodes) {
        try {
            List<TripSeat> seats = tripSeatRepository.findByTripIdAndSeatCodeIn(tripId, seatCodes);
            List<TripSeat> seatsToSave = new ArrayList<>();
            for (TripSeat seat : seats) {
                if (seat.getStatus() == SeatStatus.LOCKED) {
                    seat.setStatus(SeatStatus.AVAILABLE);
                    String key = getHolderKey(tripId, seat.getSeatCode());
                    seatHolders.remove(key);
                    seatHoldTimes.remove(key);
                    seatsToSave.add(seat);
                    broadcastSeatUpdate(tripId, seat.getSeatCode(), SeatStatus.AVAILABLE,
                            "Ghế " + seat.getSeatCode() + " đã hết hạn giữ chỗ 10 phút và tự động mở lại", null);
                }
            }
            if (!seatsToSave.isEmpty()) {
                tripSeatRepository.saveAllAndFlush(seatsToSave);
                try {
                    tripRepository.findById(tripId).ifPresent(trip -> {
                        long availableCount = tripSeatRepository.countByTripIdAndStatus(tripId, SeatStatus.AVAILABLE);
                        trip.setAvailableSeats((int) availableCount);
                        tripRepository.saveAndFlush(trip);
                    });
                } catch (Exception ignored) {}
            }
        } catch (Exception e) {
            log.error("Lỗi khi tự động giải phóng ghế hết hạn giữ chỗ cho tripId {}: {}", tripId, e.getMessage());
        }
    }
}

