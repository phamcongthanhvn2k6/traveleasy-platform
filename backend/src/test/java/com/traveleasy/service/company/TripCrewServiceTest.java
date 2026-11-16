package com.traveleasy.service.company;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.company.crew.AssignCrewRequest;
import com.traveleasy.dto.company.crew.TripCrewResponse;
import com.traveleasy.entity.BusCompany;
import com.traveleasy.entity.Route;
import com.traveleasy.entity.Trip;
import com.traveleasy.entity.TripCrew;
import com.traveleasy.repository.BusCompanyRepository;
import com.traveleasy.repository.TripCrewRepository;
import com.traveleasy.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripCrewServiceTest {

    @Mock
    private TripCrewRepository tripCrewRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private BusCompanyRepository busCompanyRepository;

    @InjectMocks
    private TripCrewServiceImpl tripCrewService;

    private Long busCompanyId;
    private Long tripId;
    private BusCompany busCompany;
    private Trip trip;

    @BeforeEach
    void setUp() {
        busCompanyId = 14L;
        tripId = 696L;

        busCompany = BusCompany.builder()
                .id(busCompanyId)
                .name("Nhà Xe Công Thành")
                .build();

        Route route = Route.builder()
                .id(1L)
                .departureLocation("TP. Hồ Chí Minh")
                .arrivalLocation("Đà Lạt")
                .distanceKm(BigDecimal.valueOf(310))
                .durationHours(BigDecimal.valueOf(6.5))
                .build();

        trip = Trip.builder()
                .id(tripId)
                .busCompany(busCompany)
                .route(route)
                .departureTime(LocalDateTime.now().plusDays(1))
                .arrivalTime(LocalDateTime.now().plusDays(1).plusHours(6))
                .licensePlate("51B-888.88")
                .build();
    }

    @Test
    @DisplayName("Chặn phân công nếu chưa kiểm tra nồng độ cồn (alcoholTested = false)")
    void assignCrew_ThrowsWhenAlcoholNotTested() {
        when(tripRepository.findByIdWithDetails(tripId)).thenReturn(Optional.of(trip));

        AssignCrewRequest request = AssignCrewRequest.builder()
                .tripId(tripId)
                .primaryDriverName("Nguyễn Văn Hùng")
                .primaryDriverPhone("0901234567")
                .primaryDriverLicense("Hạng E")
                .alcoholTested(false)
                .build();

        AppException exception = assertThrows(AppException.class, () ->
                tripCrewService.assignCrew(busCompanyId, request)
        );

        assertEquals(ErrorCode.VALIDATION_ERROR, exception.getErrorCode());
        assertTrue(exception.getMessage().contains("Chưa có xác nhận kiểm tra nồng độ cồn"));
        verify(tripCrewRepository, never()).save(any());
    }

    @Test
    @DisplayName("Chặn phân công nếu phát hiện nồng độ cồn > 0.00 mg/L")
    void assignCrew_ThrowsWhenAlcoholReadingAboveZero() {
        when(tripRepository.findByIdWithDetails(tripId)).thenReturn(Optional.of(trip));

        AssignCrewRequest request = AssignCrewRequest.builder()
                .tripId(tripId)
                .primaryDriverName("Nguyễn Văn Hùng")
                .primaryDriverPhone("0901234567")
                .primaryDriverLicense("Hạng E")
                .alcoholTested(true)
                .alcoholReading(new BigDecimal("0.15"))
                .build();

        AppException exception = assertThrows(AppException.class, () ->
                tripCrewService.assignCrew(busCompanyId, request)
        );

        assertEquals(ErrorCode.VALIDATION_ERROR, exception.getErrorCode());
        assertTrue(exception.getMessage().contains("Phát hiện nồng độ cồn"));
        verify(tripCrewRepository, never()).save(any());
    }

    @Test
    @DisplayName("Chặn phân công nếu GPLX không thuộc hạng D hoặc E")
    void assignCrew_ThrowsWhenInvalidDriverLicense() {
        when(tripRepository.findByIdWithDetails(tripId)).thenReturn(Optional.of(trip));

        AssignCrewRequest request = AssignCrewRequest.builder()
                .tripId(tripId)
                .primaryDriverName("Nguyễn Văn Hùng")
                .primaryDriverPhone("0901234567")
                .primaryDriverLicense("Hạng B2")
                .alcoholTested(true)
                .alcoholReading(BigDecimal.ZERO)
                .build();

        AppException exception = assertThrows(AppException.class, () ->
                tripCrewService.assignCrew(busCompanyId, request)
        );

        assertEquals(ErrorCode.VALIDATION_ERROR, exception.getErrorCode());
        assertTrue(exception.getMessage().contains("phải thuộc hạng D hoặc E"));
        verify(tripCrewRepository, never()).save(any());
    }

    @Test
    @DisplayName("Chặn phân công nếu tuyến > 4 giờ liên tục / > 300km mà không có tài xế phụ đổi lái")
    void assignCrew_ThrowsWhenOvertimeWithoutSecondaryDriver() {
        when(tripRepository.findByIdWithDetails(tripId)).thenReturn(Optional.of(trip));

        AssignCrewRequest request = AssignCrewRequest.builder()
                .tripId(tripId)
                .primaryDriverName("Nguyễn Văn Hùng")
                .primaryDriverPhone("0901234567")
                .primaryDriverLicense("Hạng E")
                .continuousDriveHours(new BigDecimal("5.0"))
                .distanceKm(310.0)
                .alcoholTested(true)
                .alcoholReading(BigDecimal.ZERO)
                .secondaryDriverName(null)
                .build();

        AppException exception = assertThrows(AppException.class, () ->
                tripCrewService.assignCrew(busCompanyId, request)
        );

        assertEquals(ErrorCode.VALIDATION_ERROR, exception.getErrorCode());
        assertTrue(exception.getMessage().contains("bắt buộc phải bố trí Tài xế 2"));
        verify(tripCrewRepository, never()).save(any());
    }

    @Test
    @DisplayName("Chặn ký lệnh xuất bến nếu chưa có xác nhận kiểm tra cồn (alcohol_tested = false)")
    void signDispatchPermit_ThrowsWhenAlcoholNotTested() {
        when(tripRepository.findByIdWithDetails(tripId)).thenReturn(Optional.of(trip));

        TripCrew unverifiedCrew = TripCrew.builder()
                .id(1L)
                .trip(trip)
                .busCompany(busCompany)
                .primaryDriverName("Nguyễn Văn Hùng")
                .primaryDriverPhone("0901234567")
                .alcoholTested(false)
                .build();

        when(tripCrewRepository.findByTripId(tripId)).thenReturn(Optional.of(unverifiedCrew));

        AppException exception = assertThrows(AppException.class, () ->
                tripCrewService.signDispatchPermit(busCompanyId, tripId)
        );

        assertEquals(ErrorCode.VALIDATION_ERROR, exception.getErrorCode());
        assertTrue(exception.getMessage().contains("alcohol_tested = false"));
        verify(tripCrewRepository, never()).save(any());
    }

    @Test
    @DisplayName("Ký lệnh xuất bến thành công khi nồng độ cồn = 0.00 mg/L và đầy đủ điều kiện")
    void signDispatchPermit_Success() {
        when(tripRepository.findByIdWithDetails(tripId)).thenReturn(Optional.of(trip));

        TripCrew compliantCrew = TripCrew.builder()
                .id(1L)
                .trip(trip)
                .busCompany(busCompany)
                .primaryDriverName("Nguyễn Văn Hùng")
                .primaryDriverPhone("0901234567")
                .primaryDriverLicense("Hạng E")
                .secondaryDriverName("Lê Văn Thắng")
                .alcoholTested(true)
                .alcoholReading(BigDecimal.ZERO)
                .continuousDriveHours(new BigDecimal("3.5"))
                .status("COMPLIANT_DISPATCH_READY")
                .build();

        when(tripCrewRepository.findByTripId(tripId)).thenReturn(Optional.of(compliantCrew));
        when(tripCrewRepository.save(any(TripCrew.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TripCrewResponse response = tripCrewService.signDispatchPermit(busCompanyId, tripId);

        assertNotNull(response);
        assertEquals("DISPATCH_PERMIT_SIGNED", response.getStatus());
        assertNotNull(response.getDispatchPermitCode());
        assertTrue(response.getDispatchPermitCode().startsWith("DP-"));
        assertNotNull(response.getDispatchedAt());
        verify(tripCrewRepository, times(1)).save(any(TripCrew.class));
    }
}
