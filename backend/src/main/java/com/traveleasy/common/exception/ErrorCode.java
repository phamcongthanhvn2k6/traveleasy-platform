package com.traveleasy.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    USER_NOT_FOUND("USER_001", "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_EXISTS("USER_002", "Email này đã được đăng ký", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS("AUTH_001", "Email hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    TRIP_NOT_FOUND("TRIP_001", "Chuyến xe không tồn tại", HttpStatus.NOT_FOUND),
    INSUFFICIENT_SEATS("SEAT_001", "Chuyến xe không còn đủ số ghế trống yêu cầu", HttpStatus.BAD_REQUEST),
    SEAT_ALREADY_BOOKED("SEAT_002", "Ghế đã được đặt bởi hành khách khác", HttpStatus.CONFLICT),
    BOOKING_NOT_FOUND("BOOK_001", "Đơn đặt vé không tồn tại", HttpStatus.NOT_FOUND);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
