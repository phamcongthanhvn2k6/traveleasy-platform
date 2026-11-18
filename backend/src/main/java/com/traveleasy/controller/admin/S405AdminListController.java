package com.traveleasy.controller.admin;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.dto.admin.S405PageResponse;
import com.traveleasy.dto.admin.S405TripSummary;
import com.traveleasy.dto.admin.S405BookingSummary;
import com.traveleasy.dto.booking.BookingResponse;
import com.traveleasy.dto.trip.TripResponse;
import com.traveleasy.entity.BookingStatus;
import com.traveleasy.entity.TripStatus;
import com.traveleasy.service.admin.AdminTripService;
import com.traveleasy.service.customer.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.BufferedWriter;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

/** Paginated admin endpoints; legacy list endpoints remain unchanged. */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class S405AdminListController {
    private static final int MAX_SIZE = 100;
    private final AdminTripService trips;
    private final BookingService bookings;

    @GetMapping("/trips/page")
    public ResponseEntity<ApiResponse<S405PageResponse<TripResponse>>> tripsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long busCompanyId,
            @RequestParam(required = false) Long routeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate departureFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate departureTo,
            @RequestParam(required = false) TripStatus status) {
        validate(page, size, busCompanyId, routeId, departureFrom, departureTo);
        Page<TripResponse> result = trips.getS405Trips(search, busCompanyId, routeId,
                start(departureFrom), end(departureTo), status, PageRequest.of(page, size));
        return noStore(ApiResponse.success(S405PageResponse.from(result)));
    }

    @GetMapping("/bookings/page")
    public ResponseEntity<ApiResponse<S405PageResponse<BookingResponse>>> bookingsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long busCompanyId,
            @RequestParam(required = false) Long routeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate departureFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate departureTo,
            @RequestParam(required = false) BookingStatus status) {
        validate(page, size, busCompanyId, routeId, departureFrom, departureTo);
        Page<BookingResponse> result = bookings.getS405BookingPage(search, busCompanyId, routeId,
                start(departureFrom), end(departureTo), status, PageRequest.of(page, size));
        return noStore(ApiResponse.success(S405PageResponse.from(result)));
    }

    @GetMapping("/trips/summary")
    public ResponseEntity<ApiResponse<S405TripSummary>> tripsSummary() {
        return noStore(ApiResponse.success(trips.getS405TripSummary()));
    }

    @GetMapping("/bookings/summary")
    public ResponseEntity<ApiResponse<S405BookingSummary>> bookingsSummary() {
        return noStore(ApiResponse.success(bookings.getS405BookingSummary()));
    }

    @GetMapping(value = "/trips/export", produces = "text/csv")
    public ResponseEntity<StreamingResponseBody> exportTrips(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long busCompanyId,
            @RequestParam(required = false) Long routeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate departureFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate departureTo,
            @RequestParam(required = false) TripStatus status) {
        validate(0, MAX_SIZE, busCompanyId, routeId, departureFrom, departureTo);
        LocalDateTime from = start(departureFrom);
        LocalDateTime to = end(departureTo);
        StreamingResponseBody stream = output -> {
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(output, StandardCharsets.UTF_8));
            writer.write('\uFEFF');
            writer.write("Mã chuyến,Nhà xe,Điểm đi,Điểm đến,Giờ xuất bến,Giờ đến,Dòng xe,Giá niêm yết (VNĐ),Tổng ghế,Ghế trống,Đã đặt,Tỷ lệ lấp đầy (%),Trạng thái\r\n");
            int index = 0;
            Page<TripResponse> batch;
            do {
                batch = trips.getS405Trips(search, busCompanyId, routeId, from, to, status,
                        PageRequest.of(index++, MAX_SIZE));
                for (TripResponse t : batch.getContent()) writeTrip(writer, t);
                writer.flush();
            } while (batch.hasNext());
        };
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename("traveleasy_trips.csv").build().toString())
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8)).body(stream);
    }

    private static void writeTrip(BufferedWriter writer, TripResponse t) throws java.io.IOException {
        int total = Objects.requireNonNullElse(t.getTotalSeats(), 0);
        int available = Objects.requireNonNullElse(t.getAvailableSeats(), 0);
        int booked = total - available;
        long occupancy = total > 0 ? Math.round((double) booked * 100 / total) : 0;
        String label = t.getStatus() == TripStatus.SCHEDULED ? "Mở bán"
                : t.getStatus() == TripStatus.CANCELLED ? "Tạm hủy" : "Đã khởi hành";
        writer.write(csv(t.getId()) + ',' + csv(t.getBusCompanyName()) + ',' + csv(t.getOriginCity()) + ','
                + csv(t.getDestinationCity()) + ',' + csv(t.getDepartureTime()) + ',' + csv(t.getArrivalTime()) + ','
                + csv(t.getBusType()) + ',' + csv(t.getPrice()) + ',' + total + ',' + available + ',' + booked + ','
                + occupancy + ',' + csv(label) + "\r\n");
    }

    private static String csv(Object value) {
        String text = value == null ? "" : value.toString();
        return '"' + text.replace("\"", "\"\"") + '"';
    }

    private static <T> ResponseEntity<ApiResponse<T>> noStore(ApiResponse<T> body) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(body);
    }

    private static void validate(int page, int size, Long company, Long route, LocalDate from, LocalDate to) {
        if (page < 0) throw new IllegalArgumentException("page phải lớn hơn hoặc bằng 0");
        if (size < 1 || size > MAX_SIZE) throw new IllegalArgumentException("size phải từ 1 đến 100");
        if ((company != null && company <= 0) || (route != null && route <= 0))
            throw new IllegalArgumentException("ID nhà xe và tuyến đường phải lớn hơn 0");
        if (from != null && to != null && from.isAfter(to))
            throw new IllegalArgumentException("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc");
        if (LocalDate.MAX.equals(to)) throw new IllegalArgumentException("Ngày kết thúc không hợp lệ");
    }

    private static LocalDateTime start(LocalDate date) { return date == null ? null : date.atStartOfDay(); }
    private static LocalDateTime end(LocalDate date) { return date == null ? null : date.plusDays(1).atStartOfDay(); }
}
