package com.traveleasy.controller;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.trip.TripDetailResponse;
import com.traveleasy.dto.trip.TripResponse;
import com.traveleasy.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
@Tag(name = "Trip Management", description = "Tìm kiếm chuyến xe và Sơ đồ ghế")
public class TripController {

    private final TripService tripService;

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm chuyến xe theo Nơi đi, Nơi đến, Ngày đi")
    public ApiResponse<List<TripResponse>> searchTrips(
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate departureDate) {
        return ApiResponse.success(tripService.searchTrips(origin, destination, departureDate));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết chuyến xe kèm Sơ đồ ghế 2 tầng và Điểm đón/trả")
    public ApiResponse<TripDetailResponse> getTripDetail(@PathVariable Long id) {
        return ApiResponse.success(tripService.getTripDetail(id));
    }
}
