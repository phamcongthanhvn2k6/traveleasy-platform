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

    // Map chứa các SseEmitter theo tripId
    private final ConcurrentHashMap<Long, CopyOnWriteArrayList<SseEmitter>> tripEmitters = new ConcurrentHashMap<>();

    // Scheduler cho tự động nhả ghế sau thời gian giữ chỗ (10 phút)
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

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

    /**
     * Khóa giữ chỗ ghế tạm thời khi khách chuyển sang bước thanh toán (đổi màu VÀNG - LOCKED)
     */
    @Transactional
    public List<SeatUpdateEvent> holdSeats(Long tripId, List<String> seatCodes, String sessionId) {
        if (seatCodes == null || seatCodes.isEmpty()) {
            return Collections.emptyList();
        }

        List<TripSeat> seats = tripSeatRepository.findByTripIdAndSeatCodeInWithLock(tripId, seatCodes);
        if (seats.size() != seatCodes.size()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Một số ghế không tồn tại trên chuyến này");
        }

        for (TripSeat seat : seats) {
            if (seat.getStatus() == SeatStatus.BOOKED) {
                throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED, "Ghế " + seat.getSeatCode() + " đã có người mua vé!");
            }
            if (seat.getStatus() == SeatStatus.LOCKED) {
                throw new AppException(ErrorCode.VALIDATION_ERROR, "Ghế " + seat.getSeatCode() + " đang được một khách hàng khác giữ chỗ thanh toán!");
            }
        }

        List<SeatUpdateEvent> events = new ArrayList<>();
        for (TripSeat seat : seats) {
            seat.setStatus(SeatStatus.LOCKED);
            events.add(SeatUpdateEvent.builder()
                    .tripId(tripId)
                    .seatNumber(seat.getSeatCode())
                    .status(SeatStatus.LOCKED)
                    .message("Ghế " + seat.getSeatCode() + " đang được giữ chỗ thanh toán (thời hạn 10 phút)")
                    .holderSessionId(sessionId)
                    .timestamp(LocalDateTime.now())
                    .build());
        }
        tripSeatRepository.saveAll(seats);

        // Broadcast sự kiện LOCKED tới toàn bộ người dùng đang mở sơ đồ chuyến này
        for (SeatUpdateEvent ev : events) {
            broadcastSeatUpdate(tripId, ev.getSeatNumber(), ev.getStatus(), ev.getMessage(), sessionId);
        }

        // Lên lịch tự động nhả ghế sau 10 phút (600s) nếu chưa hoàn tất thanh toán
        scheduler.schedule(() -> autoReleaseIfStillLocked(tripId, seatCodes), 10, TimeUnit.MINUTES);

        return events;
    }

    /**
     * Hủy giữ chỗ ghế và trả về trạng thái TRỐNG (AVAILABLE)
     */
    @Transactional
    public void releaseSeats(Long tripId, List<String> seatCodes) {
        if (seatCodes == null || seatCodes.isEmpty()) {
            return;
        }

        List<TripSeat> seats = tripSeatRepository.findByTripIdAndSeatCodeInWithLock(tripId, seatCodes);
        for (TripSeat seat : seats) {
            if (seat.getStatus() == SeatStatus.LOCKED) {
                seat.setStatus(SeatStatus.AVAILABLE);
                broadcastSeatUpdate(tripId, seat.getSeatCode(), SeatStatus.AVAILABLE,
                        "Ghế " + seat.getSeatCode() + " đã được mở lại cho khách khác đặt", null);
            }
        }
        tripSeatRepository.saveAll(seats);
    }

    /**
     * Broadcast thông báo các ghế đã thanh toán thành công (XÁM - BOOKED)
     */
    public void broadcastBooked(Long tripId, List<String> seatCodes) {
        if (seatCodes == null) return;
        for (String seatCode : seatCodes) {
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
            List<TripSeat> seats = tripSeatRepository.findByTripIdAndSeatCodeInWithLock(tripId, seatCodes);
            List<TripSeat> seatsToSave = new ArrayList<>();
            for (TripSeat seat : seats) {
                if (seat.getStatus() == SeatStatus.LOCKED) {
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

