package com.traveleasy.controller.company;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.common.security.CompanySecurityService;
import com.traveleasy.dto.company.crew.AssignCrewRequest;
import com.traveleasy.dto.company.crew.TripCrewResponse;
import com.traveleasy.entity.StaffRole;
import com.traveleasy.entity.User;
import com.traveleasy.service.company.TripCrewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CompanyTripCrewControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CompanySecurityService securityService;

    @Mock
    private TripCrewService tripCrewService;

    @InjectMocks
    private CompanyTripCrewController companyTripCrewController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(companyTripCrewController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("Lấy danh sách phân công tổ lái thành công qua API /api/v1/company/crew/assignments")
    void getCrewAssignments_Success() throws Exception {
        TripCrewResponse crewResponse = TripCrewResponse.builder()
                .id(1L)
                .tripId(696L)
                .tripCode("TRIP-0696")
                .route("TP. Hồ Chí Minh ➔ Đà Lạt")
                .departureTime(LocalDateTime.now().plusDays(1))
                .licensePlate("51B-888.88")
                .primaryDriverName("Nguyễn Văn Hùng")
                .primaryDriverPhone("0901234567")
                .primaryDriverLicense("Hạng E")
                .secondaryDriverName("Lê Văn Thắng")
                .secondaryDriverPhone("0907654321")
                .conductorName("Trần Văn Phụ")
                .conductorPhone("0911223344")
                .continuousDriveHours(new BigDecimal("3.5"))
                .alcoholTested(true)
                .alcoholReading(BigDecimal.ZERO)
                .status("COMPLIANT_DISPATCH_READY")
                .build();

        when(tripCrewService.getCrewAssignments(eq(14L), any())).thenReturn(List.of(crewResponse));

        mockMvc.perform(get("/api/v1/company/crew/assignments")
                        .param("busCompanyId", "14"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].tripId").value(696))
                .andExpect(jsonPath("$.data[0].primaryDriverName").value("Nguyễn Văn Hùng"))
                .andExpect(jsonPath("$.data[0].alcoholTested").value(true))
                .andExpect(jsonPath("$.data[0].alcoholReading").value(0.0));
    }

    @Test
    @DisplayName("Phân công tổ lái thành công khi đáp ứng đầy đủ điều kiện an toàn")
    void assignCrew_Success() throws Exception {
        AssignCrewRequest request = AssignCrewRequest.builder()
                .tripId(696L)
                .primaryDriverName("Nguyễn Văn Hùng")
                .primaryDriverPhone("0901234567")
                .primaryDriverLicense("Hạng E")
                .secondaryDriverName("Lê Văn Thắng")
                .secondaryDriverPhone("0907654321")
                .conductorName("Trần Văn Phụ")
                .conductorPhone("0911223344")
                .continuousDriveHours(new BigDecimal("3.5"))
                .alcoholTested(true)
                .alcoholReading(BigDecimal.ZERO)
                .distanceKm(310.0)
                .notes("Đầy đủ 2 tài xế")
                .build();

        TripCrewResponse crewResponse = TripCrewResponse.builder()
                .id(1L)
                .tripId(696L)
                .primaryDriverName("Nguyễn Văn Hùng")
                .alcoholTested(true)
                .alcoholReading(BigDecimal.ZERO)
                .status("COMPLIANT_DISPATCH_READY")
                .build();

        when(tripCrewService.assignCrew(eq(14L), any(AssignCrewRequest.class))).thenReturn(crewResponse);

        mockMvc.perform(post("/api/v1/company/crew/assignments")
                        .param("busCompanyId", "14")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.primaryDriverName").value("Nguyễn Văn Hùng"))
                .andExpect(jsonPath("$.data.alcoholTested").value(true));
    }

    @Test
    @DisplayName("Ký lệnh xuất bến thành công khi đã xác nhận kiểm tra nồng độ cồn")
    void signDispatchPermit_Success() throws Exception {
        TripCrewResponse crewResponse = TripCrewResponse.builder()
                .id(1L)
                .tripId(696L)
                .alcoholTested(true)
                .alcoholReading(BigDecimal.ZERO)
                .dispatchPermitCode("DP-20261114-00696")
                .dispatchedAt(LocalDateTime.now())
                .status("DISPATCH_PERMIT_SIGNED")
                .build();

        when(tripCrewService.signDispatchPermit(eq(14L), eq(696L))).thenReturn(crewResponse);

        mockMvc.perform(post("/api/v1/company/crew/trips/696/dispatch-permit")
                        .param("busCompanyId", "14"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.dispatchPermitCode").value("DP-20261114-00696"))
                .andExpect(jsonPath("$.data.status").value("DISPATCH_PERMIT_SIGNED"));
    }
}
