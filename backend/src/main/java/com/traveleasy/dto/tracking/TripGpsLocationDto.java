package com.traveleasy.dto.tracking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * [S306][TRACKING] DTO Truyền Tải Tọa Độ GPS Thời Gian Thực & Thông Tin Chuyến Xe
 * @author Nguyễn Đại Phát (phatnguyn146)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripGpsLocationDto {
    private Long tripId;
    private String tripCode;
    private Long routeId;
    private String routeName;
    private String originCity;
    private String destinationCity;
    private String licensePlate;
    private String busType;
    private String busCompanyName;

    // Tọa độ GPS & Vận hành thời gian thực
    private Double latitude;
    private Double longitude;
    private Double speed; // km/h
    private Double heading; // 0 - 360 độ la bàn
    private String currentLocationName;
    private String nextStationName;
    private Double nextStationDistanceKm;
    private Integer etaMinutes;
    private Double progressPercent; // 0 - 100%

    // Thông tin Tổ lái phụ trách
    private String driverName;
    private String driverPhone;
    private String driverLicense;
    private Boolean alcoholTested; // True nếu nồng độ cồn 0.00 mg/L

    private String status; // RUNNING, ARRIVED, SCHEDULED
    private String updatedAt;

    // Danh sách tọa độ toàn lộ trình [ [lat, lng], ... ] để Leaflet vẽ Polyline
    private List<double[]> routeCoordinates;
}
