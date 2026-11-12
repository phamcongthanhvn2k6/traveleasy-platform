package com.traveleasy.controller.company;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.common.security.CompanySecurityService;
import com.traveleasy.dto.shuttle.*;
import com.traveleasy.entity.ShuttleRequestStatus;
import com.traveleasy.entity.StaffRole;
import com.traveleasy.entity.User;
import com.traveleasy.service.company.CompanyShuttleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyShuttleControllerTest {

    @Mock
    private CompanyShuttleService shuttleService;

    @Mock
    private CompanySecurityService securityService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private CompanyShuttleController controller;

    @Test
    @DisplayName("DoD-01: GET /api/v1/company/shuttles trả về danh sách chuẩn ApiResponse")
    void testGetShuttleRequests_Success() {
        ShuttleRequestResponse item = ShuttleRequestResponse.builder()
                .id(1L)
                .busCompanyId(14L)
                .passengerName("Trần Thị Bích Ngọc")
                .passengerPhone("0987654321")
                .pickupAddress("45 Lê Văn Việt, TP. Thủ Đức")
                .mainTripId(696L)
                .shuttlePickupTime(LocalDateTime.now().plusHours(2))
                .status(ShuttleRequestStatus.ARRIVED_TERMINAL)
                .build();

        when(shuttleService.getShuttleRequests(eq(14L), eq(696L), eq("EVENING"), eq(ShuttleRequestStatus.ARRIVED_TERMINAL)))
                .thenReturn(List.of(item));

        ApiResponse<List<ShuttleRequestResponse>> resp = controller.getShuttleRequests(
                14L, 696L, null, "EVENING", ShuttleRequestStatus.ARRIVED_TERMINAL, null);

        assertNotNull(resp);
        assertTrue(resp.isSuccess());
        assertEquals(1, resp.getData().size());
        assertEquals("Trần Thị Bích Ngọc", resp.getData().get(0).getPassengerName());
    }

    @Test
    @DisplayName("DoD-02: POST /api/v1/company/shuttles tạo mới yêu cầu đón trung chuyển")
    void testCreateShuttleRequest_Success() {
        CreateShuttleRequest req = CreateShuttleRequest.builder()
                .passengerName("Lê Hoàng Cường")
                .passengerPhone("0918273645")
                .pickupAddress("120 Man Thiện")
                .mainTripId(696L)
                .shuttlePickupTime(LocalDateTime.now().plusHours(3))
                .distanceKm(4.8)
                .minutesBeforeDeparture(180)
                .build();

        ShuttleRequestResponse created = ShuttleRequestResponse.builder()
                .id(2L)
                .passengerName(req.getPassengerName())
                .status(ShuttleRequestStatus.PENDING)
                .build();

        when(shuttleService.createShuttleRequest(any(CreateShuttleRequest.class), eq(14L)))
                .thenReturn(created);

        ApiResponse<ShuttleRequestResponse> resp = controller.createShuttleRequest(req, 14L, null);

        assertNotNull(resp);
        assertTrue(resp.isSuccess());
        assertEquals(2L, resp.getData().getId());
        assertEquals(ShuttleRequestStatus.PENDING, resp.getData().getStatus());
    }

    @Test
    @DisplayName("DoD-03: PUT /api/v1/company/shuttles/1/assign gán tài xế nhanh")
    void testAssignDriver_Success() {
        AssignDriverRequest assignReq = AssignDriverRequest.builder()
                .driverName("Nguyễn Văn Tài")
                .vehiclePlate("51B-168.99")
                .build();

        ShuttleRequestResponse assigned = ShuttleRequestResponse.builder()
                .id(1L)
                .shuttleDriverName("Nguyễn Văn Tài")
                .assignedVehiclePlate("51B-168.99")
                .status(ShuttleRequestStatus.ASSIGNED)
                .build();

        when(shuttleService.assignDriver(eq(1L), any(AssignDriverRequest.class), eq(14L)))
                .thenReturn(assigned);

        ApiResponse<ShuttleRequestResponse> resp = controller.assignDriver(1L, assignReq, 14L, null);

        assertNotNull(resp);
        assertTrue(resp.isSuccess());
        assertEquals("Nguyễn Văn Tài", resp.getData().getShuttleDriverName());
        assertEquals(ShuttleRequestStatus.ASSIGNED, resp.getData().getStatus());
    }

    @Test
    @DisplayName("DoD-04: PATCH /api/v1/company/shuttles/1/status cập nhật trạng thái")
    void testUpdateStatus_Success() {
        ShuttleRequestResponse updated = ShuttleRequestResponse.builder()
                .id(1L)
                .status(ShuttleRequestStatus.PICKING_UP)
                .build();

        when(shuttleService.updateStatus(eq(1L), eq(ShuttleRequestStatus.PICKING_UP), eq(14L)))
                .thenReturn(updated);

        ApiResponse<ShuttleRequestResponse> resp = controller.updateStatus(1L, ShuttleRequestStatus.PICKING_UP, 14L, null);

        assertNotNull(resp);
        assertTrue(resp.isSuccess());
        assertEquals(ShuttleRequestStatus.PICKING_UP, resp.getData().getStatus());
    }

    @Test
    @DisplayName("DoD-05: Chặn vai trò CASHIER truy cập điều phối trung chuyển (HTTP 403 Forbidden)")
    void testRBAC_CashierRole_ThrowsForbidden() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.DISPATCHER))
                .thenThrow(new AppException(ErrorCode.FORBIDDEN, "TRUY CẬP BỊ TỪ CHỐI"));

        AppException ex = assertThrows(AppException.class, () ->
                controller.getShuttleRequests(null, null, null, null, null, authentication)
        );

        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
    }

    @Test
    @DisplayName("DoD-06: Cho phép vai trò DISPATCHER điều phối xe trung chuyển")
    void testRBAC_DispatcherRole_Allowed() {
        User dispatcher = User.builder()
                .id(10L)
                .email("dispatcher@futa.vn")
                .busCompanyId(14L)
                .staffRole(StaffRole.DISPATCHER)
                .build();

        when(authentication.isAuthenticated()).thenReturn(true);
        when(securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.DISPATCHER))
                .thenReturn(dispatcher);

        when(shuttleService.getShuttleRequests(eq(14L), isNull(), isNull(), isNull()))
                .thenReturn(List.of());

        ApiResponse<List<ShuttleRequestResponse>> resp = controller.getShuttleRequests(
                null, null, null, null, null, authentication);

        assertNotNull(resp);
        assertTrue(resp.isSuccess());
    }
}
