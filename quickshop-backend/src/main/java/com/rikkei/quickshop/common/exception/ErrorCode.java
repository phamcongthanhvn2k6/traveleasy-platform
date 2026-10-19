package com.rikkei.quickshop.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    USER_NOT_FOUND("USER_001", "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_EXISTS("USER_002", "Email đã được sử dụng", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS("AUTH_001", "Email hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED("AUTH_002", "Bạn cần đăng nhập để thực hiện thao tác này", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("AUTH_003", "Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN),
    PRODUCT_NOT_FOUND("PROD_001", "Sản phẩm không tồn tại", HttpStatus.NOT_FOUND),
    CATEGORY_NOT_FOUND("CAT_001", "Danh mục không tồn tại", HttpStatus.NOT_FOUND),
    INSUFFICIENT_STOCK("ORDER_001", "Số lượng hàng trong kho không đủ", HttpStatus.BAD_REQUEST),
    ORDER_NOT_FOUND("ORDER_002", "Đơn hàng không tồn tại", HttpStatus.NOT_FOUND),
    INTERNAL_SERVER_ERROR("SYS_001", "Lỗi hệ thống nội bộ", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
