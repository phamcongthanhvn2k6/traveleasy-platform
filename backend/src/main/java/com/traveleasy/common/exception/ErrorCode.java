package com.traveleasy.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    RESOURCE_NOT_FOUND("SYS_404", "Tài nguyên không tồn tại", HttpStatus.NOT_FOUND),
    RESOURCE_ALREADY_EXISTS("SYS_409", "Tài nguyên đã tồn tại", HttpStatus.CONFLICT),
    UNAUTHORIZED("AUTH_401", "Chưa xác thực hoặc không có quyền", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("AUTH_403", "Không có quyền truy cập", HttpStatus.FORBIDDEN),
    ACCOUNT_LOCKED("AUTH_423", "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.", HttpStatus.FORBIDDEN),
    VALIDATION_ERROR("VAL_400", "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND("USER_001", "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_EXISTS("USER_002", "Email này đã được đăng ký", HttpStatus.BAD_REQUEST),
    PHONE_ALREADY_EXISTS("USER_003", "Số điện thoại này đã được đăng ký", HttpStatus.CONFLICT),
    INVALID_CREDENTIALS("AUTH_001", "Email hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    TRIP_NOT_FOUND("TRIP_001", "Chuyến xe không tồn tại", HttpStatus.NOT_FOUND),
    INSUFFICIENT_SEATS("SEAT_001", "Chuyến xe không còn đủ số ghế trống yêu cầu", HttpStatus.BAD_REQUEST),
    SEAT_ALREADY_BOOKED("SEAT_002", "Ghế đã được đặt bởi hành khách khác", HttpStatus.CONFLICT),
    BOOKING_NOT_FOUND("BOOK_001", "Đơn đặt vé không tồn tại", HttpStatus.NOT_FOUND),
    OPERATION_NOT_ALLOWED("SYS_400", "Thao tác không được phép thực hiện", HttpStatus.BAD_REQUEST),
    DATA_INTEGRITY_VIOLATION("SYS_409_DB", "Vi phạm ràng buộc dữ liệu hoặc dữ liệu đang được sử dụng", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
