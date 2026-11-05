package com.traveleasy.service.realtime;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.trip.SeatUpdateEvent;
import com.traveleasy.entity.SeatStatus;
import com.traveleasy.entity.TripSeat;
import com.traveleasy.repository.TripSeatRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeatRealtimeService {

    public static final int DEFAULT_HOLD_TTL_SECONDS = 600;

    private final TripSeatRepository tripSeatRepository;

    private final ConcurrentHashMap<Long, CopyOnWriteArrayList<SseEmitter>> tripEmitters = new ConcurrentHashMap<>();

    private final ConcurrentHashMap<String, SeatLockMetadata> activeLocks = new ConcurrentHashMap<>();

    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatLockMetadata {
        private Long tripId;
        private String seatCode;
        private String sessionId;
        private BigDecimal price;
        private LocalDateTime lockedAt;
        private LocalDateTime expiresAt;
        private Integer ttlSeconds;
    }

    private String lockKey(Long tripId, String seatCode) {
        return tripId + ":" + seatCode;
    }

    public SseEmitter subscribe(Long tripId) {
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

    public void broadcastSeatUpdate(Long tripId, String seatNumber, SeatStatus status, String message, String holderSessionId) {
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
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }

        if (!deadEmitters.isEmpty()) {
            emitters.removeAll(deadEmitters);
        }
    }

    @Transactional
    public List<SeatUpdateEvent> holdSeats(Long tripId, List<String> seatCodes, String sessionId) {
        return holdSeatsWithTtl(tripId, seatCodes, sessionId, DEFAULT_HOLD_TTL_SECONDS);
    }

    @Transactional
    public List<SeatUpdateEvent> holdSeatsWithTtl(Long tripId, List<String> seatCodes, String sessionId, Integer ttlSeconds) {
        if (seatCodes == null || seatCodes.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> uniqueSeatCodes = new ArrayList<>(new LinkedHashSet<>(seatCodes));
        List<TripSeat> seats = tripSeatRepository.findByTripIdAndSeatCodeInWithLock(tripId, uniqueSeatCodes);
        if (seats.size() != uniqueSeatCodes.size()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Một số ghế không tồn tại trên chuyến này");
        }

        int effectiveTtl = (ttlSeconds != null && ttlSeconds > 0) ? ttlSeconds : DEFAULT_HOLD_TTL_SECONDS;
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusSeconds(effectiveTtl);

        for (TripSeat seat : seats) {
            if (seat.getStatus() == SeatStatus.BOOKED) {
                throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED, "Ghế " + seat.getSeatCode() + " đã có người mua vé!");
            }
            if (seat.getStatus() == SeatStatus.LOCKED) {
                String key = lockKey(tripId, seat.getSeatCode());
                SeatLockMetadata existingLock = activeLocks.get(key);
                boolean isExpired = existingLock != null
                        && existingLock.getExpiresAt() != null
                        && !existingLock.getExpiresAt().isAfter(now);

                if (isExpired) {
                    activeLocks.remove(key);
                    seat.setStatus(SeatStatus.AVAILABLE);
                } else {
                    boolean isSameSession = existingLock != null
                            && sessionId != null
                            && !sessionId.isBlank()
                            && sessionId.equals(existingLock.getSessionId());
                    if (!isSameSession) {
                        throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED,
                                "Ghế " + seat.getSeatCode() + " đang được một khách hàng khác giữ chỗ thanh toán!");
                    }
                }
            }
        }

        List<SeatUpdateEvent> events = new ArrayList<>();
        for (TripSeat seat : seats) {
            seat.setStatus(SeatStatus.LOCKED);
            BigDecimal seatPrice = (seat.getTrip() != null && seat.getTrip().getPrice() != null)
                    ? seat.getTrip().getPrice()
                    : null;

            SeatLockMetadata metadata = SeatLockMetadata.builder()
                    .tripId(tripId)
                    .seatCode(seat.getSeatCode())
                    .sessionId(sessionId)
                    .price(seatPrice)
                    .lockedAt(now)
                    .expiresAt(expiresAt)
                    .ttlSeconds(effectiveTtl)
                    .build();
            activeLocks.put(lockKey(tripId, seat.getSeatCode()), metadata);

            events.add(SeatUpdateEvent.builder()
                    .tripId(tripId)
                    .seatNumber(seat.getSeatCode())
                    .status(SeatStatus.LOCKED)
                    .message("Ghế " + seat.getSeatCode() + " đang được giữ chỗ thanh toán (thời hạn 10 phút)")
                    .holderSessionId(sessionId)
                    .price(seatPrice)
                    .ttlSeconds(effectiveTtl)
                    .expiresAt(expiresAt)
                    .timestamp(now)
                    .build());
        }
        tripSeatRepository.saveAll(seats);

        for (SeatUpdateEvent ev : events) {
            broadcastSeatUpdate(tripId, ev.getSeatNumber(), ev.getStatus(), ev.getMessage(), sessionId);
        }

        scheduler.schedule(() -> autoReleaseIfStillLocked(tripId, uniqueSeatCodes), effectiveTtl, TimeUnit.SECONDS);

        return events;
    }

    @Transactional
    public void releaseSeats(Long tripId, List<String> seatCodes) {
        releaseSeatsWithSession(tripId, seatCodes, null);
    }

    @Transactional
    public List<SeatUpdateEvent> releaseSeatsWithSession(Long tripId, List<String> seatCodes, String sessionId) {
        if (seatCodes == null || seatCodes.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> uniqueSeatCodes = new ArrayList<>(new LinkedHashSet<>(seatCodes));
        List<TripSeat> seats = tripSeatRepository.findByTripIdAndSeatCodeInWithLock(tripId, uniqueSeatCodes);
        if (seats.size() != uniqueSeatCodes.size()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Một số ghế không tồn tại trên chuyến này");
        }

        LocalDateTime now = LocalDateTime.now();
        if (sessionId != null && !sessionId.isBlank()) {
            for (TripSeat seat : seats) {
                if (seat.getStatus() == SeatStatus.LOCKED) {
                    SeatLockMetadata meta = activeLocks.get(lockKey(tripId, seat.getSeatCode()));
                    boolean isNotExpired = meta != null && (meta.getExpiresAt() == null || meta.getExpiresAt().isAfter(now));
                    if (isNotExpired && meta.getSessionId() != null && !sessionId.equals(meta.getSessionId())) {
                        throw new AppException(ErrorCode.FORBIDDEN,
                                "Không có quyền giải phóng ghế " + seat.getSeatCode() + " đang được giữ bởi phiên làm việc khác!");
                    }
                }
            }
        }

        List<SeatUpdateEvent> events = new ArrayList<>();
        for (TripSeat seat : seats) {
            activeLocks.remove(lockKey(tripId, seat.getSeatCode()));
            if (seat.getStatus() == SeatStatus.LOCKED) {
                seat.setStatus(SeatStatus.AVAILABLE);
                broadcastSeatUpdate(tripId, seat.getSeatCode(), SeatStatus.AVAILABLE,
                        "Ghế " + seat.getSeatCode() + " đã được mở lại cho khách khác đặt", null);
            }
            BigDecimal seatPrice = (seat.getTrip() != null && seat.getTrip().getPrice() != null)
                    ? seat.getTrip().getPrice()
                    : null;
            events.add(SeatUpdateEvent.builder()
                    .tripId(tripId)
                    .seatNumber(seat.getSeatCode())
                    .status(seat.getStatus())
                    .message("Ghế " + seat.getSeatCode() + " đã được giải phóng")
                    .holderSessionId(null)
                    .price(seatPrice)
                    .ttlSeconds(0)
                    .timestamp(now)
                    .build());
        }
        tripSeatRepository.saveAll(seats);
        return events;
    }

    @Transactional
    public List<SeatUpdateEvent> cleanupExpiredLocks(Long tripId) {
        if (tripId == null) {
            return Collections.emptyList();
        }
        LocalDateTime now = LocalDateTime.now();
        List<String> expiredSeatCodes = new ArrayList<>();
        String prefix = tripId + ":";

        for (Map.Entry<String, SeatLockMetadata> entry : activeLocks.entrySet()) {
            if (entry.getKey().startsWith(prefix)) {
                SeatLockMetadata meta = entry.getValue();
                if (meta != null && meta.getExpiresAt() != null && !meta.getExpiresAt().isAfter(now)) {
                    expiredSeatCodes.add(meta.getSeatCode());
                }
            }
        }

        if (expiredSeatCodes.isEmpty()) {
            return Collections.emptyList();
        }

        List<TripSeat> seats = tripSeatRepository.findByTripIdAndSeatCodeInWithLock(tripId, expiredSeatCodes);
        List<TripSeat> seatsToSave = new ArrayList<>();
        List<SeatUpdateEvent> events = new ArrayList<>();

        for (TripSeat seat : seats) {
            activeLocks.remove(lockKey(tripId, seat.getSeatCode()));
            if (seat.getStatus() == SeatStatus.LOCKED) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seatsToSave.add(seat);
                BigDecimal seatPrice = (seat.getTrip() != null && seat.getTrip().getPrice() != null)
                        ? seat.getTrip().getPrice()
                        : null;
                SeatUpdateEvent ev = SeatUpdateEvent.builder()
                        .tripId(tripId)
                        .seatNumber(seat.getSeatCode())
                        .status(SeatStatus.AVAILABLE)
                        .message("Ghế " + seat.getSeatCode() + " đã hết hạn giữ chỗ và tự động mở lại")
                        .holderSessionId(null)
                        .price(seatPrice)
                        .ttlSeconds(0)
                        .timestamp(now)
                        .build();
                events.add(ev);
                broadcastSeatUpdate(tripId, seat.getSeatCode(), SeatStatus.AVAILABLE, ev.getMessage(), null);
            }
        }

        if (!seatsToSave.isEmpty()) {
            tripSeatRepository.saveAll(seatsToSave);
        }
        return events;
    }

    @Transactional
    public List<SeatUpdateEvent> expireLocksImmediately(Long tripId, List<String> seatCodes) {
        LocalDateTime expiredTime = LocalDateTime.now().minusSeconds(1);
        if (seatCodes != null && !seatCodes.isEmpty()) {
            for (String code : seatCodes) {
                SeatLockMetadata meta = activeLocks.get(lockKey(tripId, code));
                if (meta != null) {
                    meta.setExpiresAt(expiredTime);
                } else {
                    activeLocks.put(lockKey(tripId, code), SeatLockMetadata.builder()
                            .tripId(tripId)
                            .seatCode(code)
                            .expiresAt(expiredTime)
                            .build());
                }
            }
        } else {
            List<TripSeat> allSeats = tripSeatRepository.findByTripIdOrderByFloorAscSeatCodeAsc(tripId);
            for (TripSeat s : allSeats) {
                if (s.getStatus() == SeatStatus.LOCKED) {
                    activeLocks.put(lockKey(tripId, s.getSeatCode()), SeatLockMetadata.builder()
                            .tripId(tripId)
                            .seatCode(s.getSeatCode())
                            .expiresAt(expiredTime)
                            .build());
                }
            }
        }
        return cleanupExpiredLocks(tripId);
    }

    @Transactional
    public List<SeatUpdateEvent> getActiveLocks(Long tripId) {
        cleanupExpiredLocks(tripId);
        List<TripSeat> seats = tripSeatRepository.findByTripIdOrderByFloorAscSeatCodeAsc(tripId);
        LocalDateTime now = LocalDateTime.now();
        List<SeatUpdateEvent> result = new ArrayList<>();

        for (TripSeat seat : seats) {
            if (seat.getStatus() == SeatStatus.LOCKED) {
                SeatLockMetadata meta = activeLocks.get(lockKey(tripId, seat.getSeatCode()));
                BigDecimal seatPrice = (seat.getTrip() != null && seat.getTrip().getPrice() != null)
                        ? seat.getTrip().getPrice()
                        : (meta != null ? meta.getPrice() : null);
                int remainingTtl = DEFAULT_HOLD_TTL_SECONDS;
                LocalDateTime expiresAt = now.plusSeconds(DEFAULT_HOLD_TTL_SECONDS);
                String holderSession = null;

                if (meta != null) {
                    holderSession = meta.getSessionId();
                    if (meta.getExpiresAt() != null) {
                        expiresAt = meta.getExpiresAt();
                        long secs = Duration.between(now, meta.getExpiresAt()).getSeconds();
                        remainingTtl = (int) Math.max(0L, secs);
                    }
                }

                result.add(SeatUpdateEvent.builder()
                        .tripId(tripId)
                        .seatNumber(seat.getSeatCode())
                        .status(SeatStatus.LOCKED)
                        .message("Ghế " + seat.getSeatCode() + " đang được khóa giữ chỗ")
                        .holderSessionId(holderSession)
                        .price(seatPrice)
                        .ttlSeconds(remainingTtl)
                        .expiresAt(expiresAt)
                        .timestamp(now)
                        .build());
            }
        }
        return result;
    }

    public void validateAndConsumeLocksForBooking(Long tripId, List<TripSeat> requestedSeats, String sessionId) {
        LocalDateTime now = LocalDateTime.now();
        for (TripSeat seat : requestedSeats) {
            if (seat.getStatus() == SeatStatus.LOCKED) {
                String key = lockKey(tripId, seat.getSeatCode());
                SeatLockMetadata meta = activeLocks.get(key);
                boolean isExpired = meta != null
                        && meta.getExpiresAt() != null
                        && !meta.getExpiresAt().isAfter(now);

                if (isExpired) {
                    activeLocks.remove(key);
                    seat.setStatus(SeatStatus.AVAILABLE);
                } else {
                    boolean isOwner = meta != null
                            && sessionId != null
                            && !sessionId.isBlank()
                            && sessionId.equals(meta.getSessionId());
                    if (!isOwner) {
                        throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED,
                                "Ghế " + seat.getSeatCode() + " đang được hành khách khác giữ chỗ thanh toán. Vui lòng chọn ghế khác!");
                    }
                }
            }
        }

        for (TripSeat seat : requestedSeats) {
            activeLocks.remove(lockKey(tripId, seat.getSeatCode()));
        }
    }

    public void broadcastBooked(Long tripId, List<String> seatCodes) {
        if (seatCodes == null) return;
        for (String seatCode : seatCodes) {
            activeLocks.remove(lockKey(tripId, seatCode));
            broadcastSeatUpdate(tripId, seatCode, SeatStatus.BOOKED,
                    "Ghế " + seatCode + " vừa được thanh toán thành công!", null);
        }
    }

    public void broadcastReleased(Long tripId, List<String> seatCodes) {
        if (seatCodes == null) return;
        for (String seatCode : seatCodes) {
            activeLocks.remove(lockKey(tripId, seatCode));
            broadcastSeatUpdate(tripId, seatCode, SeatStatus.AVAILABLE,
                    "Ghế " + seatCode + " đã được hoàn lại thành ghế trống.", null);
        }
    }

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

    private void autoReleaseIfStillLocked(Long tripId, List<String> seatCodes) {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<TripSeat> seats = new ArrayList<>();
            for (String code : seatCodes) {
                tripSeatRepository.findByTripIdAndSeatCode(tripId, code).ifPresent(seats::add);
            }
            List<TripSeat> seatsToSave = new ArrayList<>();
            for (TripSeat seat : seats) {
                String key = lockKey(tripId, seat.getSeatCode());
                SeatLockMetadata meta = activeLocks.get(key);
                boolean shouldRelease = meta == null
                        || meta.getExpiresAt() == null
                        || !meta.getExpiresAt().isAfter(now);
                if (seat.getStatus() == SeatStatus.LOCKED && shouldRelease) {
                    activeLocks.remove(key);
                    seat.setStatus(SeatStatus.AVAILABLE);
                    seatsToSave.add(seat);
                    broadcastSeatUpdate(tripId, seat.getSeatCode(), SeatStatus.AVAILABLE,
                            "Ghế " + seat.getSeatCode() + " đã hết hạn giữ chỗ 10 phút và tự động mở lại", null);
                }
            }
            if (!seatsToSave.isEmpty()) {
                tripSeatRepository.saveAll(seatsToSave);
            }
        } catch (Exception e) {
            log.error("Lỗi khi tự động giải phóng ghế hết hạn giữ chỗ cho tripId {}: {}", tripId, e.getMessage());
        }
    }
}
