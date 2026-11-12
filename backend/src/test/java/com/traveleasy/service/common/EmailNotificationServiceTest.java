package com.traveleasy.service.common;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailNotificationServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailNotificationService emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailNotificationService();
        ReflectionTestUtils.setField(emailService, "mailSender", mailSender);
        ReflectionTestUtils.setField(emailService, "fromEmail", "phamcongt56@gmail.com");
        ReflectionTestUtils.setField(emailService, "frontendUrl", "http://localhost:5173");
        emailService.preloadTemplates();

        when(mailSender.createMimeMessage()).thenAnswer(inv -> new MimeMessage(Session.getInstance(new Properties())));
    }

    @Test
    @DisplayName("Email phê duyệt hiển thị đúng 8% thay vì 0.08%, đủ thông tin đăng nhập và không còn placeholder")
    void sendPartnerApprovalEmail_FormatsCommissionAndRendersTemplate() throws Exception {
        emailService.sendPartnerApprovalEmail(
                "phamcongt56@gmail.com",
                "Phương Nam Express",
                "NX-12",
                "Travel@4821!nx",
                new BigDecimal("0.08")
        );

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(captor.capture());

        String html = extractHtmlContent(captor.getValue());
        assertTrue(html.contains("Phương Nam Express"));
        assertTrue(html.contains("http://localhost:5173/company/login"));
        assertTrue(html.contains("Travel@4821!nx"));
        assertTrue(html.contains("NX-12"));
        assertTrue(html.contains(">8%<"));
        assertFalse(html.contains("0.08%"));
        assertFalse(html.contains("{{"));
    }

    @Test
    @DisplayName("Email yêu cầu bổ sung và từ chối render sạch nội dung và không còn placeholder")
    void sendSupplementAndRejectionEmails_RenderCleanly() throws Exception {
        emailService.sendPartnerSupplementEmail(
                "phamcongt56@gmail.com",
                "Phương Nam Express",
                "Bổ sung ảnh chụp rõ nét Giấy phép kinh doanh vận tải"
        );
        emailService.sendPartnerRejectionEmail(
                "phamcongt56@gmail.com",
                "Phương Nam Express",
                "Mã số thuế không khớp với Giấy phép kinh doanh"
        );

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, times(2)).send(captor.capture());

        String supplementHtml = extractHtmlContent(captor.getAllValues().get(0));
        assertTrue(supplementHtml.contains("Bổ sung ảnh chụp rõ nét Giấy phép kinh doanh vận tải"));
        assertFalse(supplementHtml.contains("{{"));

        String rejectHtml = extractHtmlContent(captor.getAllValues().get(1));
        assertTrue(rejectHtml.contains("Mã số thuế không khớp với Giấy phép kinh doanh"));
        assertFalse(rejectHtml.contains("{{"));
    }

    @Test
    @DisplayName("Gửi liên tiếp cho 2 nhà xe khác nhau không bị dính dữ liệu cũ và chống placeholder injection")
    void sendPartnerApprovalEmail_IsolatedPerRecipientAndInjectionSafe() throws Exception {
        emailService.sendPartnerApprovalEmail(
                "nhaxeA@gmail.com",
                "Nhà Xe Alpha {{tempPassword}}",
                "ALPHA-01",
                "SecretAlpha$99",
                new BigDecimal("0.08")
        );
        emailService.sendPartnerApprovalEmail(
                "nhaxeB@gmail.com",
                "Nhà Xe Beta",
                "BETA-02",
                "SecretBeta#77",
                new BigDecimal("0.10")
        );

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, times(2)).send(captor.capture());

        String htmlA = extractHtmlContent(captor.getAllValues().get(0));
        String htmlB = extractHtmlContent(captor.getAllValues().get(1));

        assertTrue(htmlA.contains("nhaxeA@gmail.com"));
        assertTrue(htmlA.contains("SecretAlpha$99"));
        assertFalse(htmlA.contains("Nhà Xe Alpha SecretAlpha$99"));

        assertTrue(htmlB.contains("Nhà Xe Beta"));
        assertTrue(htmlB.contains("nhaxeB@gmail.com"));
        assertTrue(htmlB.contains("SecretBeta#77"));
        assertTrue(htmlB.contains("BETA-02"));
        assertTrue(htmlB.contains(">10%<"));
        assertFalse(htmlB.contains("SecretAlpha$99"));
        assertFalse(htmlB.contains("nhaxeA@gmail.com"));
    }

    private String extractHtmlContent(MimeMessage message) throws Exception {
        Object content = message.getContent();
        if (content instanceof jakarta.mail.Multipart multipart) {
            for (int i = 0; i < multipart.getCount(); i++) {
                var part = multipart.getBodyPart(i);
                Object partContent = part.getContent();
                if (partContent instanceof jakarta.mail.Multipart nested) {
                    for (int j = 0; j < nested.getCount(); j++) {
                        if (nested.getBodyPart(j).getContent() instanceof String s) {
                            return s;
                        }
                    }
                } else if (partContent instanceof String s) {
                    return s;
                }
            }
        }
        return String.valueOf(content);
    }
}
