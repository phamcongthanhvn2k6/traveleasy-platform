package com.traveleasy.service;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.dto.shuttle.*;
import com.traveleasy.entity.ShuttleRequest;
import com.traveleasy.entity.ShuttleRequestStatus;
import com.traveleasy.repository.ShuttleRequestRepository;
import com.traveleasy.repository.TripRepository;
import com.traveleasy.service.company.CompanyShuttleServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShuttleRequestServiceTest {

    @Mock
    private ShuttleRequestRepository shuttleRequestRepository;

    @Mock
    private TripRepository tripRepository;

    @InjectMocks
    private CompanyShuttleServiceImpl shuttleService;

    @Test
    @DisplayName("TC-01: Tạo mới yêu cầu đón trung chuyển hợp lệ thành công")
    void testCreateShuttleRequest_Success() {
        CreateShuttleRequest request = CreateShuttleRequest.builder()
                .passengerName("Trần Minh Đức")
                .passengerPhone("0987654321")
                .pickupAddress("45 Lê Văn Việt, Tăng Nhơn Phú A, TP. Thủ Đức")
                .mainTripId(696L)
                .shuttlePickupTime(LocalDateTime.now().plusHours(3))
                .distanceKm(6.2)
                .minutesBeforeDeparture(180)
                .build();

        ShuttleRequest saved = ShuttleRequest.builder()
                .id(1L)
                .busCompanyId(14L)
                .passengerName(request.getPassengerName())
                .passengerPhone(request.getPassengerPhone())
                .pickupAddress(request.getPickupAddress())
                .mainTripId(request.getMainTripId())
                .shuttlePickupTime(request.getShuttlePickupTime())
                .status(ShuttleRequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        when(shuttleRequestRepository.save(any(ShuttleRequest.class))).thenReturn(saved);

        ShuttleRequestResponse response = shuttleService.createShuttleRequest(request, 14L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Trần Minh Đức", response.getPassengerName());
        assertEquals("0987654321", response.getPassengerPhone());
        assertEquals(ShuttleRequestStatus.PENDING, response.getStatus());
        verify(shuttleRequestRepository, times(1)).save(any(ShuttleRequest.class));
    }

    @Test
    @DisplayName("TC-02: Từ chối khi vi phạm Lead Time (< 120 phút trước giờ xuất bến)")
    void testCreateShuttleRequest_LeadTimeViolation_ThrowsException() {
        CreateShuttleRequest request = CreateShuttleRequest.builder()
                .passengerName("Lê Hoàng Cường")
                .passengerPhone("0918273645")
                .pickupAddress("120 Man Thiện, TP. Thủ Đức")
                .mainTripId(696L)
                .shuttlePickupTime(LocalDateTime.now().plusMinutes(90))
                .distanceKm(4.5)
                .minutesBeforeDeparture(90) // Vi phạm lead time < 120 phút
                .build();

        AppException ex = assertThrows(AppException.class, () ->
                shuttleService.createShuttleRequest(request, 14L)
        );

        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("120 phút"));
        verify(shuttleRequestRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC-03: Từ chối khi vi phạm Bán kính phục vụ (> 10.0 km tính từ bến)")
    void testCreateShuttleRequest_GeofenceViolation_ThrowsException() {
        CreateShuttleRequest request = CreateShuttleRequest.builder()
                .passengerName("Bùi Quỳnh Nga")
                .passengerPhone("0966554433")
                .pickupAddress("Khu công nghệ cao xa bến")
                .mainTripId(696L)
                .shuttlePickupTime(LocalDateTime.now().plusHours(3))
                .distanceKm(12.8) // Vi phạm bán kính > 10.0 km
                .minutesBeforeDeparture(180)
                .build();

        AppException ex = assertThrows(AppException.class, () ->
                shuttleService.createShuttleRequest(request, 14L)
        );

        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("10.0km"));
        verify(shuttleRequestRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC-04: Gán tài xế nhanh và biển số xe trung chuyển 7-16 chỗ")
    void testAssignDriver_Success() {
        ShuttleRequest existing = ShuttleRequest.builder()
                .id(1L)
                .busCompanyId(14L)
                .passengerName("Trần Minh Đức")
                .passengerPhone("0987654321")
                .pickupAddress("45 Lê Văn Việt")
                .mainTripId(696L)
                .shuttlePickupTime(LocalDateTime.now().plusHours(2))
                .status(ShuttleRequestStatus.PENDING)
                .build();

        when(shuttleRequestRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(shuttleRequestRepository.save(any(ShuttleRequest.class))).thenAnswer(i -> i.getArgument(0));

        AssignDriverRequest assignReq = AssignDriverRequest.builder()
                .driverName("Nguyễn Văn Tài (Tài xế trung chuyển 01)")
                .vehiclePlate("51B-168.99 (Ford Transit 16c)")
                .build();

        ShuttleRequestResponse response = shuttleService.assignDriver(1L, assignReq, 14L);

        assertNotNull(response);
        assertEquals("Nguyễn Văn Tài (Tài xế trung chuyển 01)", response.getShuttleDriverName());
        assertEquals("51B-168.99 (Ford Transit 16c)", response.getAssignedVehiclePlate());
        assertEquals(ShuttleRequestStatus.ASSIGNED, response.getStatus());
        verify(shuttleRequestRepository, times(1)).save(existing);
    }

    @Test
    @DisplayName("TC-05: Gán tài xế thất bại khi ID không tồn tại (404 Not Found)")
    void testAssignDriver_NotFound_ThrowsException() {
        when(shuttleRequestRepository.findById(999L)).thenReturn(Optional.empty());

        AssignDriverRequest assignReq = AssignDriverRequest.builder()
                .driverName("Nguyễn Văn Tài")
                .vehiclePlate("51B-168.99")
                .build();

        AppException ex = assertThrows(AppException.class, () ->
                shuttleService.assignDriver(999L, assignReq, 14L)
        );

        assertEquals(ErrorCode.RESOURCE_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    @DisplayName("TC-06: Cập nhật trạng thái đón trung chuyển trên lộ trình gom khách")
    void testUpdateStatus_SequenceTransitions() {
        ShuttleRequest existing = ShuttleRequest.builder()
                .id(2L)
                .busCompanyId(14L)
                .passengerName("Lê Hoàng Cường")
                .passengerPhone("0918273645")
                .pickupAddress("120 Man Thiện")
                .mainTripId(696L)
                .shuttlePickupTime(LocalDateTime.now().plusHours(2))
                .status(ShuttleRequestStatus.ASSIGNED)
                .build();

        when(shuttleRequestRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(shuttleRequestRepository.save(any(ShuttleRequest.class))).thenAnswer(i -> i.getArgument(0));

        ShuttleRequestResponse resp1 = shuttleService.updateStatus(2L, ShuttleRequestStatus.PICKING_UP, 14L);
        assertEquals(ShuttleRequestStatus.PICKING_UP, resp1.getStatus());

        ShuttleRequestResponse resp2 = shuttleService.updateStatus(2L, ShuttleRequestStatus.ARRIVED_TERMINAL, 14L);
        assertEquals(ShuttleRequestStatus.ARRIVED_TERMINAL, resp2.getStatus());
    }

    @Test
    @DisplayName("TC-07: Lọc danh sách yêu cầu trung chuyển theo Chuyến xe (mainTripId)")
    void testGetShuttleRequests_FilterByMainTripId() {
        ShuttleRequest r1 = ShuttleRequest.builder().id(1L).busCompanyId(14L).mainTripId(696L).build();
        ShuttleRequest r2 = ShuttleRequest.builder().id(2L).busCompanyId(14L).mainTripId(696L).build();

        when(shuttleRequestRepository.findWithFilters(eq(14L), eq(696L), isNull(), isNull(), isNull()))
                .thenReturn(List.of(r1, r2));

        List<ShuttleRequestResponse> list = shuttleService.getShuttleRequests(14L, 696L, null, null);

        assertEquals(2, list.size());
        assertEquals(1L, list.get(0).getId());
        assertEquals(2L, list.get(1).getId());
    }

    @Test
    @DisplayName("TC-08: Lọc danh sách yêu cầu trung chuyển theo Trạng thái")
    void testGetShuttleRequests_FilterByStatus() {
        ShuttleRequest r1 = ShuttleRequest.builder().id(1L).busCompanyId(14L).status(ShuttleRequestStatus.PENDING).build();

        when(shuttleRequestRepository.findWithFilters(eq(14L), isNull(), eq(ShuttleRequestStatus.PENDING), isNull(), isNull()))
                .thenReturn(List.of(r1));

        List<ShuttleRequestResponse> list = shuttleService.getShuttleRequests(14L, null, null, ShuttleRequestStatus.PENDING);

        assertEquals(1, list.size());
        assertEquals(ShuttleRequestStatus.PENDING, list.get(0).getStatus());
    }

    @Test
    @DisplayName("TC-09: Chặn truy cập chéo giữa các nhà xe (Multi-Tenancy Isolation)")
    void testAccessCrossCompany_ThrowsForbidden() {
        ShuttleRequest existing = ShuttleRequest.builder()
                .id(3L)
                .busCompanyId(15L) // Thuộc nhà xe 15
                .passengerName("Khách nhà xe khác")
                .build();

        when(shuttleRequestRepository.findById(3L)).thenReturn(Optional.of(existing));

        // Nhà xe 14 cố truy cập dữ liệu của nhà xe 15
        AppException ex = assertThrows(AppException.class, () ->
                shuttleService.getShuttleRequestById(3L, 14L)
        );

        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
    }
}
