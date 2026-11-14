package com.traveleasy.dto.shuttle;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDateTime;

/**
 * [S317] DTO đăng ký yêu cầu đón trung chuyển mới
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateShuttleRequest {

    private Long busCompanyId;

    private Long bookingId;

    @NotBlank(message = "Tên hành khách không được để trống")
    private String passengerName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Số điện thoại không đúng định dạng Việt Nam")
    private String passengerPhone;

    @NotBlank(message = "Địa chỉ đón tận nơi không được để trống")
    private String pickupAddress;

    @NotNull(message = "Mã chuyến xe chính không được để trống")
    private Long mainTripId;

    @NotNull(message = "Giờ đón trung chuyển không được để trống")
    private LocalDateTime shuttlePickupTime;

    private Double distanceKm;

    private Integer minutesBeforeDeparture;
}
