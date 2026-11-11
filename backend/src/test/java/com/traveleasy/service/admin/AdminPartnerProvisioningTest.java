package com.traveleasy.service.admin;

import com.traveleasy.entity.BusCompany;
import com.traveleasy.entity.User;
import com.traveleasy.repository.*;
import com.traveleasy.service.common.EmailNotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminPartnerProvisioningTest {

    @Mock private UserRepository userRepository;
    @Mock private BusCompanyRepository busCompanyRepository;
    @Mock private SeatTypeRepository seatTypeRepository;
    @Mock private SeatLayoutTemplateRepository seatLayoutTemplateRepository;
    @Mock private LocationRepository locationRepository;
    @Mock private BannerRepository bannerRepository;
    @Mock private GatewayConfigRepository gatewayConfigRepository;
    @Mock private ReviewReportRepository reviewReportRepository;
    @Mock private CancellationPolicyRepository cancellationPolicyRepository;
    @Mock private AuditLogRepository auditLogRepository;
    @Mock private RouteRepository routeRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private TripRepository tripRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailNotificationService emailNotificationService;
    @Mock private SettlementRecordRepository settlementRecordRepository;

    @InjectMocks
    private AdminManagementService adminManagementService;

    @Test
    @DisplayName("Phê duyệt 2 nhà xe khác nhau sinh 2 mật khẩu ngẫu nhiên riêng biệt và gửi đúng tên/email/mã từng nhà xe")
    void approveCompanyWithCommission_ProvisionsUniqueCredentialsPerCompany() {
        BusCompany c1 = BusCompany.builder()
                .id(101L)
                .name("Nhà Xe Thái Bình")
                .code("TB-101")
                .email("thaibinh@gmail.com")
                .hotline("0901111111")
                .status("PENDING")
                .commissionRate(new BigDecimal("0.08"))
                .build();

        BusCompany c2 = BusCompany.builder()
                .id(102L)
                .name("Nhà Xe Hải Phòng")
                .code("HP-102")
                .email("haiphong@gmail.com")
                .hotline("0902222222")
                .status("PENDING")
                .commissionRate(new BigDecimal("0.10"))
                .build();

        when(busCompanyRepository.findById(101L)).thenReturn(Optional.of(c1));
        when(busCompanyRepository.findById(102L)).thenReturn(Optional.of(c2));
        when(busCompanyRepository.save(any(BusCompany.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenAnswer(inv -> "ENC:" + inv.getArgument(0));

        adminManagementService.approveCompanyWithCommission(101L, new BigDecimal("0.08"), "OK 1");
        adminManagementService.approveCompanyWithCommission(102L, new BigDecimal("0.10"), "OK 2");

        ArgumentCaptor<String> emailCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> nameCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> codeCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> passCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<BigDecimal> rateCaptor = ArgumentCaptor.forClass(BigDecimal.class);

        verify(emailNotificationService, times(2)).sendPartnerApprovalEmail(
                emailCaptor.capture(),
                nameCaptor.capture(),
                codeCaptor.capture(),
                passCaptor.capture(),
                rateCaptor.capture()
        );

        assertEquals("thaibinh@gmail.com", emailCaptor.getAllValues().get(0));
        assertEquals("haiphong@gmail.com", emailCaptor.getAllValues().get(1));
        assertEquals("Nhà Xe Thái Bình", nameCaptor.getAllValues().get(0));
        assertEquals("Nhà Xe Hải Phòng", nameCaptor.getAllValues().get(1));
        assertEquals("TB-101", codeCaptor.getAllValues().get(0));
        assertEquals("HP-102", codeCaptor.getAllValues().get(1));

        String pass1 = passCaptor.getAllValues().get(0);
        String pass2 = passCaptor.getAllValues().get(1);
        assertEquals(12, pass1.length());
        assertEquals(12, pass2.length());
        assertNotEquals(pass1, pass2);

        verify(userRepository, times(2)).save(any(User.class));
    }
}
