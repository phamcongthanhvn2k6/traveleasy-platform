package com.traveleasy.controller.company;

import com.traveleasy.entity.*;
import com.traveleasy.repository.BookingRepository;
import com.traveleasy.repository.TicketRepository;
import com.traveleasy.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompanyTripManifestControllerTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private CompanyTripManifestController controller;

    private Trip testTrip;
    private BusCompany testCompany;
    private Route testRoute;

    @BeforeEach
    void setUp() {
        testCompany = BusCompany.builder()
                .id(1L)
                .name("Phương Trang FUTA Bus Lines")
                .taxCode("0303889988")
                .hotline("1900 6067")
                .address("468 Lê Hồng Phong, Q10, TP.HCM")
                .build();

        testRoute = Route.builder()
                .id(10L)
                .departureLocation("Bến xe Miền Đông Mới")
                .arrivalLocation("Bến xe Liên tỉnh Đà Lạt")
                .build();

        testTrip = Trip.builder()
                .id(696L)
                .busCompany(testCompany)
                .route(testRoute)
                .busType(BusType.LIMOUSINE)
                .licensePlate("51B-888.88")
                .totalSeats(34)
                .availableSeats(30)
                .departureTime(LocalDateTime.of(2026, 11, 20, 22, 0))
                .arrivalTime(LocalDateTime.of(2026, 11, 21, 5, 0))
                .price(BigDecimal.valueOf(320000))
                .status(TripStatus.SCHEDULED)
                .build();
    }

    @Test
    @DisplayName("Lấy Lệnh Vận Chuyển Điện Tử chuẩn Bộ GTVT - Thành Công và đầy đủ thông tin")
    void getTripManifest_Success() {
        when(tripRepository.findByIdWithDetails(696L)).thenReturn(Optional.of(testTrip));

        var response = controller.getTripManifest(696L, false);

        assertThat(response.isSuccess()).isTrue();
        Map<String, Object> data = response.getData();
        assertThat(data).isNotNull();
        assertThat(data.get("manifestNumber")).isEqualTo("LVC-GTVT-2026-696");
        assertThat(data.get("busCompanyName")).isEqualTo("Phương Trang FUTA Bus Lines");
        assertThat(data.get("licensePlate")).isEqualTo("51B-888.88");
        assertThat(data.get("route")).isEqualTo("Bến xe Miền Đông Mới ➔ Bến xe Liên tỉnh Đà Lạt");
        assertThat(data.get("manifestSecurityHash")).isNotNull();
        assertThat(data.get("isFrozen")).isEqualTo(false);
        assertThat(data.get("digitalSignature")).isNotNull();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> passengers = (List<Map<String, Object>>) data.get("passengers");
        assertThat(passengers).isNotEmpty();
    }

    @Test
    @DisplayName("Lệnh vận chuyển tự động đóng băng (Snapshot Manifest) khi xe đã xuất bến (RUNNING)")
    void getTripManifest_FrozenWhenRunning() {
        testTrip.setStatus(TripStatus.RUNNING);
        when(tripRepository.findByIdWithDetails(696L)).thenReturn(Optional.of(testTrip));

        var response = controller.getTripManifest(696L, false);

        assertThat(response.isSuccess()).isTrue();
        Map<String, Object> data = response.getData();
        assertThat(data.get("isFrozen")).isEqualTo(true);
        assertThat(data.get("complianceNotice").toString()).contains("LỆNH ĐÃ ĐÓNG BĂNG");
    }

    @Test
    @DisplayName("Lấy Lệnh Vận Chuyển với vé thật từ CSDL")
    void getTripManifest_WithRealTickets() {
        when(tripRepository.findByIdWithDetails(696L)).thenReturn(Optional.of(testTrip));

        Booking booking = Booking.builder()
                .id(100L)
                .bookingCode("BK-REAL-01")
                .passengerName("Phan Công Thành")
                .passengerPhone("0987654321")
                .pickupPoint("Cây xăng Petrolimex Hàng Xanh")
                .dropoffPoint("Bến xe Đà Lạt")
                .build();

        Ticket ticket = Ticket.builder()
                .id(501L)
                .ticketCode("TK-696-A01")
                .seatNumber("A01")
                .price(BigDecimal.valueOf(320000))
                .status(TicketStatus.ISSUED)
                .booking(booking)
                .build();

        when(ticketRepository.findByBookingTripId(696L)).thenReturn(List.of(ticket));

        var response = controller.getTripManifest(696L, false);

        assertThat(response.isSuccess()).isTrue();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> passengers = (List<Map<String, Object>>) response.getData().get("passengers");
        assertThat(passengers).hasSize(1);
        assertThat(passengers.get(0).get("passengerName")).isEqualTo("Phan Công Thành");
        assertThat(passengers.get(0).get("seatCode")).isEqualTo("A01");
        assertThat(passengers.get(0).get("pickupPoint")).isEqualTo("Cây xăng Petrolimex Hàng Xanh");
    }

    @Test
    @DisplayName("Xuất CSV Excel Lệnh Vận Chuyển chuẩn Bộ GTVT có UTF-8 BOM")
    void exportCsvManifest_ReturnsCsvWithBom() {
        when(tripRepository.findByIdWithDetails(696L)).thenReturn(Optional.of(testTrip));

        ResponseEntity<byte[]> response = controller.exportCsvManifest(696L);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getHeaders().getContentType().toString()).contains("text/csv");
        assertThat(response.getHeaders().getFirst("Content-Disposition")).contains("Lenh_Van_Chuyen_Trip_696.csv");

        byte[] body = response.getBody();
        assertThat(body).isNotNull();
        String csvContent = new String(body, java.nio.charset.StandardCharsets.UTF_8);

        // Kiểm tra UTF-8 BOM ký tự đầu tiên
        assertThat(csvContent.charAt(0)).isEqualTo('\uFEFF');
        // Kiểm tra Quốc hiệu tiêu ngữ và nội dung chuẩn
        assertThat(csvContent).contains("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM");
        assertThat(csvContent).contains("Độc lập - Tự do - Hạnh phúc");
        assertThat(csvContent).contains("LVC-GTVT-2026-696");
        assertThat(csvContent).contains("Phương Trang FUTA Bus Lines");
        assertThat(csvContent).contains("STT,Số Ghế,Họ và Tên Hành Khách,Số Điện Thoại,Mã Vé,Mã Đơn,Điểm Đón,Điểm Trả,Giá Vé (VNĐ),Trạng Thái");
    }

    @Test
    @DisplayName("Tra cứu và xác thực tính hợp pháp của Lệnh Vận Chuyển cho CSGT & TTGT")
    void verifyManifest_Success() {
        when(tripRepository.findById(696L)).thenReturn(Optional.of(testTrip));

        var response = controller.verifyManifest(696L, "SOME-HASH");

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getData().get("valid")).isEqualTo(true);
        assertThat(response.getData().get("authorityNotice").toString()).contains("Lệnh vận chuyển hợp lệ");
    }
}
