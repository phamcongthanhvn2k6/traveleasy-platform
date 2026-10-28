package com.traveleasy.common.exception;

import com.traveleasy.common.dto.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("Xử lý AppException trả về đúng HTTP status và thông điệp")
    void testHandleAppException() {
        AppException ex = new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chuyến xe");
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleAppException(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Không tìm thấy chuyến xe", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Xử lý MethodArgumentNotValidException trả về 400 kèm chi tiết từng trường lỗi")
    void testHandleValidation() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError1 = new FieldError("bookingRequest", "customerPhone", "Số điện thoại không đúng định dạng");
        FieldError fieldError2 = new FieldError("bookingRequest", "customerName", "Họ tên không được để trống");

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError1, fieldError2));

        ResponseEntity<ApiResponse<Map<String, String>>> response = exceptionHandler.handleValidation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertTrue(response.getBody().getMessage().contains("Lỗi dữ liệu"));
        assertNotNull(response.getBody().getErrors());
        assertEquals(2, response.getBody().getErrors().size());
        assertEquals("Số điện thoại không đúng định dạng", response.getBody().getErrors().get("customerPhone"));
    }

    @Test
    @DisplayName("Xử lý HttpMessageNotReadableException trả về 400")
    void testHandleNotReadable() {
        HttpMessageNotReadableException ex = mock(HttpMessageNotReadableException.class);
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleNotReadable(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertTrue(response.getBody().getMessage().contains("JSON"));
    }

    @Test
    @DisplayName("Xử lý MethodArgumentTypeMismatchException trả về 400 kèm tên tham số")
    void testHandleTypeMismatch() {
        MethodArgumentTypeMismatchException ex = mock(MethodArgumentTypeMismatchException.class);
        when(ex.getName()).thenReturn("id");
        when(ex.getValue()).thenReturn("abc");
        doReturn(Long.class).when(ex).getRequiredType();

        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleTypeMismatch(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().getMessage().contains("'id'"));
        assertTrue(response.getBody().getMessage().contains("'abc'"));
    }

    @Test
    @DisplayName("Xử lý MissingServletRequestParameterException trả về 400")
    void testHandleMissingParam() {
        MissingServletRequestParameterException ex = new MissingServletRequestParameterException("status", "String");
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleMissingParam(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().getMessage().contains("status"));
    }

    @Test
    @DisplayName("Xử lý HttpRequestMethodNotSupportedException trả về 405 Method Not Allowed")
    void testHandleMethodNotSupported() {
        HttpRequestMethodNotSupportedException ex = new HttpRequestMethodNotSupportedException("POST");
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleMethodNotSupported(ex);

        assertEquals(HttpStatus.METHOD_NOT_ALLOWED, response.getStatusCode());
        assertTrue(response.getBody().getMessage().contains("POST"));
    }

    @Test
    @DisplayName("Xử lý AccessDeniedException trả về 403 Forbidden")
    void testHandleAccessDenied() {
        AccessDeniedException ex = new AccessDeniedException("Access is denied");
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleAccessDenied(ex);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(response.getBody().getMessage().contains("không có quyền"));
    }

    @Test
    @DisplayName("Xử lý DataIntegrityViolationException với foreign key trả về 409 Conflict")
    void testHandleDataIntegrity_ForeignKey() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException("Cannot delete or update a parent row: a foreign key constraint fails");
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleDataIntegrity(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertTrue(response.getBody().getMessage().contains("liên kết"));
    }
}

