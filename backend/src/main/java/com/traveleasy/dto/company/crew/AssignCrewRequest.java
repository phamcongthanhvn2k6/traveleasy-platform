package com.traveleasy.dto.company.crew;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignCrewRequest {

    @NotNull(message = "ID chuyến xe không được để trống")
    private Long tripId;

    @NotBlank(message = "Tên tài xế chính không được để trống")
    private String primaryDriverName;

    @NotBlank(message = "Số điện thoại tài xế chính không được để trống")
    private String primaryDriverPhone;

    private String primaryDriverLicense;

    private String secondaryDriverName;
    private String secondaryDriverPhone;

    private String conductorName;
    private String conductorPhone;

    private BigDecimal continuousDriveHours;

    @NotNull(message = "Phải ghi nhận kiểm tra nồng độ cồn")
    private Boolean alcoholTested;

    private BigDecimal alcoholReading;

    private Double distanceKm;

    private String notes;
}
