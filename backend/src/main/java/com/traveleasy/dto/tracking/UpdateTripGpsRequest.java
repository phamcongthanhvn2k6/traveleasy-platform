package com.traveleasy.dto.tracking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * [S306][TRACKING] DTO Tài Xế Cập Nhật Tọa Độ GPS Thực Tế Lên Server
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTripGpsRequest {
    private Double latitude;
    private Double longitude;
    private Double speed; // km/h
    private Double heading; // độ la bàn
    private String locationName;
    private String driverName;
    private String driverPhone;
    private String note;
}
