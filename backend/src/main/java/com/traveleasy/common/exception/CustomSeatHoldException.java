package com.traveleasy.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * [S410] Ngoại lệ chuyên biệt khi xảy ra tranh chấp giữ chỗ hoặc đặt trùng ghế đồng thời (Race Condition).
 * Luôn trả về HTTP 409 Conflict kèm thông điệp chuẩn cho khách hàng.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class CustomSeatHoldException extends AppException {

    public static final String DEFAULT_CONFLICT_MESSAGE = "Ghế này vừa được chọn bởi khách hàng khác";

    private final String seatCode;

    public CustomSeatHoldException() {
        super(ErrorCode.SEAT_ALREADY_BOOKED, DEFAULT_CONFLICT_MESSAGE);
        this.seatCode = null;
    }

    public CustomSeatHoldException(String message) {
        super(ErrorCode.SEAT_ALREADY_BOOKED,
                (message != null && !message.isBlank()) ? message : DEFAULT_CONFLICT_MESSAGE);
        this.seatCode = null;
    }

    public CustomSeatHoldException(String seatCode, String message) {
        super(ErrorCode.SEAT_ALREADY_BOOKED,
                (message != null && !message.isBlank()) ? message : DEFAULT_CONFLICT_MESSAGE);
        this.seatCode = seatCode;
    }

    public static CustomSeatHoldException forSeat(String seatCode) {
        if (seatCode == null || seatCode.isBlank()) {
            return new CustomSeatHoldException(DEFAULT_CONFLICT_MESSAGE);
        }
        return new CustomSeatHoldException(
                seatCode,
                DEFAULT_CONFLICT_MESSAGE + " (Ghế " + seatCode.trim().toUpperCase() + ")"
        );
    }

    public String getSeatCode() {
        return seatCode;
    }
}
