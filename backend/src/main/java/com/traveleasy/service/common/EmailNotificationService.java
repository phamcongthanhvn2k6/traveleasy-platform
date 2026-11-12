package com.traveleasy.service.common;

import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class EmailNotificationService {

    private static final String TEMPLATE_DIR = "templates/email/";
    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\{\\{([a-zA-Z0-9_]+)}}");
    private static final List<String> PRELOAD_TEMPLATES = List.of(
            "partner-received.html",
            "partner-approved.html",
            "partner-rejected.html",
            "partner-supplement.html",
            "password-reset-otp.html",
            "password-reset-success.html"
    );

    private final ConcurrentHashMap<String, String> templateCache = new ConcurrentHashMap<>();

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.frontend-url:${app.frontend.url:http://localhost:5173}}")
    private String frontendUrl;

    @PostConstruct
    public void preloadTemplates() {
        for (String name : PRELOAD_TEMPLATES) {
            try {
                loadTemplate(name);
            } catch (Exception e) {
                log.warn("⚠️ Không thể nạp trước mẫu email {}: {}", name, e.getMessage());
            }
        }
        log.info("✅ Đã nạp và cache {} mẫu email vào bộ nhớ để tối ưu tốc độ gửi.", templateCache.size());
    }

    /**
     * Gửi Email thông báo Đã Tiếp Nhận Hồ Sơ Đăng Ký Đối Tác (Chờ Xét Duyệt KYB)
     */
    @Async
    public void sendPartnerRegistrationReceivedEmail(String recipientEmail, String companyName, String contactName) {
        String subject = "📨 [TravelEasy] Đã tiếp nhận hồ sơ đăng ký đối tác nhà xe " + companyName;
        String safeContact = escapeHtml((contactName != null && !contactName.isBlank()) ? contactName.trim() : "Quý Đối Tác");
        String safeCompany = escapeHtml(companyName != null ? companyName.trim() : "Nhà Xe Đối Tác");

        String html = renderTemplate("partner-received.html", Map.of(
                "contactName", safeContact,
                "companyName", safeCompany
        ));

        sendHtmlEmail(recipientEmail, subject, html);
    }

    /**
     * Gửi Email thông báo Phê Duyệt Hồ Sơ Đối Tác & Bàn Giao Tài Khoản Điều Hành (ROLE_OPERATOR)
     */
    @Async
    public void sendPartnerApprovalEmail(
            String recipientEmail,
            String companyName,
            String companyCode,
            String tempPassword,
            BigDecimal commissionRate
    ) {
        String baseUrl = (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl.trim() : "http://localhost:5173";
        String loginUrl = baseUrl.endsWith("/") ? (baseUrl + "company/login") : (baseUrl + "/company/login");
        String subject = "🎉 [TravelEasy] Chúc mừng! Hồ sơ đối tác nhà xe " + companyName + " đã được phê duyệt thành công";
        String rateStr = formatCommissionRate(commissionRate);

        String html = renderTemplate("partner-approved.html", Map.of(
                "companyName", escapeHtml(companyName != null ? companyName.trim() : "Đối Tác"),
                "loginUrl", escapeHtml(loginUrl),
                "recipientEmail", escapeHtml(recipientEmail != null ? recipientEmail.trim() : ""),
                "tempPassword", escapeHtml(tempPassword != null ? tempPassword : ""),
                "companyCode", escapeHtml(companyCode != null ? companyCode : ""),
                "commissionRate", escapeHtml(rateStr)
        ));

        sendHtmlEmail(recipientEmail, subject, html);
    }

    /**
     * Gửi Email thông báo Từ Chối Hồ Sơ Đối Tác kèm Lý Do Cụ Thể
     */
    @Async
    public void sendPartnerRejectionEmail(String recipientEmail, String companyName, String reason) {
        String subject = "⚠️ [TravelEasy] Thông báo về hồ sơ đăng ký hợp tác nhà xe " + companyName;
        String reasonStr = (reason != null && !reason.isBlank())
                ? reason.trim()
                : "Hồ sơ chưa đáp ứng đầy đủ tiêu chuẩn kiểm duyệt giấy phép kinh doanh vận tải của sàn.";

        String html = renderTemplate("partner-rejected.html", Map.of(
                "companyName", escapeHtml(companyName != null ? companyName.trim() : "Đối Tác"),
                "reason", escapeHtml(reasonStr)
        ));

        sendHtmlEmail(recipientEmail, subject, html);
    }

    /**
     * Gửi Email Yêu Cầu Bổ Sung Hồ Sơ Pháp Lý
     */
    @Async
    public void sendPartnerSupplementEmail(String recipientEmail, String companyName, String requirements) {
        String subject = "📋 [TravelEasy] Yêu cầu bổ sung hồ sơ pháp lý đối tác nhà xe " + companyName;
        String reqStr = (requirements != null && !requirements.isBlank())
                ? requirements.trim()
                : "Bổ sung ảnh chụp rõ nét Giấy phép kinh doanh vận tải và CCCD người đại diện pháp luật.";

        String html = renderTemplate("partner-supplement.html", Map.of(
                "companyName", escapeHtml(companyName != null ? companyName.trim() : "Đối Tác"),
                "requirements", escapeHtml(reqStr)
        ));

        sendHtmlEmail(recipientEmail, subject, html);
    }

    /**
     * Gửi Email thông báo Giải Ngân Doanh Thu Quyết Toán (Settlement Payout) cho Đối tác Nhà Xe
     */
    @Async
    public void sendSettlementPayoutEmail(
            String recipientEmail,
            String companyName,
            String settlementCode,
            String periodName,
            BigDecimal grossAmount,
            BigDecimal platformCommission,
            BigDecimal netPayable,
            String bankName,
            String accountNumber,
            String accountHolder,
            String payoutTxHash,
            String payoutNote
    ) {
        String subject = "💰 [TravelEasy] Xác nhận giải ngân doanh thu kỳ " + periodName + " - " + companyName;

        java.text.NumberFormat currencyFmt = java.text.NumberFormat.getInstance(new java.util.Locale("vi", "VN"));
        String grossStr = currencyFmt.format(grossAmount != null ? grossAmount : BigDecimal.ZERO) + " đ";
        String comStr = currencyFmt.format(platformCommission != null ? platformCommission : BigDecimal.ZERO) + " đ";
        String netStr = currencyFmt.format(netPayable != null ? netPayable : BigDecimal.ZERO) + " đ";

        String noteBlock = (payoutNote != null && !payoutNote.isBlank())
                ? "<div style=\"margin-top: 12px; padding: 10px; background-color: #f8fafc; border-radius: 8px; font-size: 13px; color: #475569;\"><strong>Ghi chú:</strong> " + escapeHtml(payoutNote) + "</div>"
                : "";

        String html = """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
                .card { max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
                .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px 24px; text-align: center; color: #ffffff; }
                .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
                .header p { margin: 6px 0 0 0; opacity: 0.92; font-size: 14px; }
                .content { padding: 30px 28px; line-height: 1.6; font-size: 14.5px; }
                .badge-success { display: inline-block; background-color: #dcfce7; color: #15803d; font-weight: 700; padding: 6px 14px; border-radius: 9999px; font-size: 13px; margin-bottom: 16px; }
                .amount-hero { text-align: center; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 1px solid #86efac; border-radius: 14px; padding: 24px; margin: 20px 0; }
                .amount-hero .label { font-size: 13px; color: #166534; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
                .amount-hero .value { font-size: 32px; font-weight: 900; color: #15803d; margin-top: 6px; }
                .table-summary { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
                .table-summary td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
                .table-summary td:last-child { text-align: right; font-weight: 600; }
                .bank-box { background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 16px 18px; margin: 18px 0; font-size: 13.5px; }
                .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12.5px; color: #64748b; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <h1>TravelEasy Settlement Desk</h1>
                  <p>Xác Nhận Giải Ngân Quyết Toán Doanh Thu Đối Tác</p>
                </div>
                <div class="content">
                  <span class="badge-success">✓ GIẢI NGÂN THÀNH CÔNG (PAID)</span>
                  <p>Kính gửi Quý Đối Tác <strong>%s</strong>,</p>
                  <p>Bộ phận Tài chính - Kế toán TravelEasy xin thông báo đã hoàn tất chuyển khoản quyết toán doanh thu bán vé cho Quý đơn vị theo kỳ đối soát <strong>%s</strong> (Mã đối soát: <strong>%s</strong>).</p>

                  <div class="amount-hero">
                    <div class="label">Số tiền thực nhận chuyển khoản</div>
                    <div class="value">%s</div>
                  </div>

                  <table class="table-summary">
                    <tr>
                      <td style="color: #64748b;">Tổng doanh thu vé gốc (100%%):</td>
                      <td style="color: #0f172a;">%s</td>
                    </tr>
                    <tr>
                      <td style="color: #64748b;">Phí dịch vụ nền tảng (Hoa hồng 10%%):</td>
                      <td style="color: #dc2626;">- %s</td>
                    </tr>
                    <tr style="border-bottom: 2px solid #e2e8f0;">
                      <td style="font-weight: 700; color: #0f172a;">Thực nhận thanh toán (Net Payable):</td>
                      <td style="font-weight: 800; color: #15803d; font-size: 16px;">%s</td>
                    </tr>
                  </table>

                  <div class="bank-box">
                    <strong style="color: #0f172a;">Thông tin tài khoản thụ hưởng (Escrow):</strong><br>
                    • Ngân hàng: <strong>%s</strong><br>
                    • Số tài khoản: <strong>%s</strong><br>
                    • Chủ tài khoản: <strong>%s</strong><br>
                    • Mã ủy nhiệm chi / Tx Hash: <strong style="font-family: monospace; color: #2563eb;">%s</strong>
                    %s
                  </div>

                  <p style="font-size: 13.5px; color: #475569;">Doanh thu vé được đối soát tự động từ hệ thống giao dịch thực tế. Quý Nhà Xe có thể tra cứu chi tiết từng mã vé đối soát tại <strong>Cổng Điều Hành Nhà Xe > Báo Cáo Quyết Toán</strong>.</p>
                </div>
                <div class="footer">
                  Ban Tài Chính Kế Toán TravelEasy Platform • Hotline: <strong>1900 6868</strong><br>
                  Email: accounting@traveleasy.vn
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                escapeHtml(companyName),
                escapeHtml(periodName),
                escapeHtml(settlementCode),
                netStr,
                grossStr,
                comStr,
                netStr,
                escapeHtml(bankName != null ? bankName : "Tài khoản đối tác"),
                escapeHtml(accountNumber != null ? accountNumber : "-"),
                escapeHtml(accountHolder != null ? accountHolder : companyName),
                escapeHtml(payoutTxHash != null ? payoutTxHash : "VCB-FT-DIRECT"),
                noteBlock
        );

        sendHtmlEmail(recipientEmail, subject, html);
    }

    /**
     * Gửi Email mã OTP 6 chữ số để xác minh khôi phục mật khẩu người dùng.
     */
    @Async
    public void sendPasswordResetOtpEmail(String recipientEmail, String fullName, String otpCode, int expiryMinutes) {
        String safeName = escapeHtml((fullName != null && !fullName.isBlank()) ? fullName.trim() : "Quý khách");
        String subject = "[TravelEasy] Mã OTP xác nhận khôi phục mật khẩu: " + otpCode;

        String html = renderTemplate("password-reset-otp.html", Map.of(
                "fullName", safeName,
                "otpCode", escapeHtml(otpCode),
                "expiryMinutes", String.valueOf(expiryMinutes)
        ));

        sendHtmlEmail(recipientEmail, subject, html);
    }

    /**
     * Gửi Email thông báo đã đổi mật khẩu thành công sau khi khôi phục qua OTP.
     */
    @Async
    public void sendPasswordResetSuccessEmail(String recipientEmail, String fullName) {
        String safeName = escapeHtml((fullName != null && !fullName.isBlank()) ? fullName.trim() : "Quý khách");
        String subject = "[TravelEasy] Mật khẩu tài khoản của bạn đã được thay đổi";

        String html = renderTemplate("password-reset-success.html", Map.of(
                "fullName", safeName
        ));

        sendHtmlEmail(recipientEmail, subject, html);
    }

    String renderTemplate(String templateName, Map<String, String> variables) {
        String template = loadTemplate(templateName);
        Matcher matcher = PLACEHOLDER_PATTERN.matcher(template);
        StringBuilder result = new StringBuilder(template.length() + 128);
        while (matcher.find()) {
            String key = matcher.group(1);
            String value = variables.getOrDefault(key, "");
            matcher.appendReplacement(result, Matcher.quoteReplacement(value != null ? value : ""));
        }
        matcher.appendTail(result);
        return result.toString();
    }

    private String loadTemplate(String templateName) {
        return templateCache.computeIfAbsent(templateName, name -> {
            ClassPathResource resource = new ClassPathResource(TEMPLATE_DIR + name);
            try (InputStream is = resource.getInputStream()) {
                return new String(is.readAllBytes(), StandardCharsets.UTF_8);
            } catch (IOException e) {
                throw new IllegalStateException("Không thể đọc mẫu email: " + TEMPLATE_DIR + name, e);
            }
        });
    }

    private String formatCommissionRate(BigDecimal commissionRate) {
        if (commissionRate == null) {
            return "8%";
        }
        BigDecimal pct = commissionRate.compareTo(BigDecimal.ONE) < 0
                ? commissionRate.multiply(BigDecimal.valueOf(100))
                : commissionRate;
        return pct.stripTrailingZeros().toPlainString() + "%";
    }

    private String escapeHtml(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    /**
     * Hàm dùng chung gửi Email HTML (Hỗ trợ SMTP thật + Smart Fallback sang Console Log)
     */
    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        if (to == null || to.isBlank() || !to.contains("@")) {
            log.warn("⚠️ Địa chỉ email người nhận không hợp lệ: {}", to);
            return;
        }

        boolean sentSuccessfully = false;
        if (mailSender != null && fromEmail != null && !fromEmail.isBlank()) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail, "TravelEasy Platform");
                helper.setTo(to.trim());
                helper.setSubject(subject);
                helper.setText(htmlBody, true);
                mailSender.send(message);
                sentSuccessfully = true;
                log.info("✅ [SMTP LIVE] Đã gửi email thành công tới: {} | Tiêu đề: {}", to, subject);
            } catch (Exception e) {
                log.warn("⚠️ Không thể gửi qua SMTP ({}). Chuyển sang chế độ Smart Log Preview.", e.getMessage());
            }
        }

        if (!sentSuccessfully) {
            log.info("================================================================================");
            log.info("📧 [MOCK / LOCAL EMAIL NOTIFICATION]");
            log.info("TO: {}", to);
            log.info("SUBJECT: {}", subject);
            log.info("STATUS: Giả lập thành công (Chế độ phát triển & demo bảo vệ đồ án)");
            log.info("================================================================================");
        }
    }
}
