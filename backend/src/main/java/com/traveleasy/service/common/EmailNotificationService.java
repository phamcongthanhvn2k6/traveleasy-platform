package com.traveleasy.service.common;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
public class EmailNotificationService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.frontend-url:${app.frontend.url:http://localhost:5173}}")
    private String frontendUrl;

    /**
     * Gửi Email thông báo Đã Tiếp Nhận Hồ Sơ Đăng Ký Đối Tác (Chờ Xét Duyệt KYB)
     */
    @Async
    public void sendPartnerRegistrationReceivedEmail(String recipientEmail, String companyName, String contactName) {
        String subject = "📨 [TravelEasy] Đã tiếp nhận hồ sơ đăng ký đối tác nhà xe " + companyName;
        String nameStr = (contactName != null && !contactName.isBlank()) ? contactName : "Quý Đối Tác";

        String html = """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
                .card { max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
                .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px 24px; text-align: center; color: #ffffff; }
                .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
                .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }
                .content { padding: 30px 28px; line-height: 1.6; font-size: 14.5px; }
                .box-info { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px 20px; margin: 20px 0; color: #166534; }
                .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12.5px; color: #64748b; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <h1>TravelEasy Platform</h1>
                  <p>Hệ Thống Đặt Vé Xe Khách & Quản Lý Nhà Xe Liên Tỉnh</p>
                </div>
                <div class="content">
                  <p>Kính gửi <strong>%s</strong> (Đại diện <strong>%s</strong>),</p>
                  <p>Hệ thống TravelEasy đã <strong>tiếp nhận thành công hồ sơ đăng ký hợp tác mở bán vé trực tuyến</strong> của Quý Nhà Xe.</p>
                  
                  <div class="box-info">
                    ⏳ <strong>Trạng thái hồ sơ:</strong> Đang chờ thẩm định pháp nhân KYB<br>
                    ⏱️ <strong>Thời gian xử lý:</strong> Chuyên viên thẩm định sẽ kiểm tra giấy phép kinh doanh và phản hồi trong vòng <strong>24 giờ làm việc</strong>.
                  </div>

                  <p>Khi hồ sơ được phê duyệt, hệ thống sẽ tự động gửi thông tin tài khoản đăng nhập Cổng Quản Lý Điều Hành Nhà Xe (OPERATOR) và mật khẩu khởi tạo trực tiếp qua email này.</p>
                  <p>Trân trọng cảm ơn sự tin tưởng hợp tác của Quý Đơn vị!</p>
                </div>
                <div class="footer">
                  Phòng Phát Triển Mạng Lưới Đối Tác TravelEasy • Hotline: <strong>1900 6868</strong><br>
                  Email: support-partner@traveleasy.vn
                </div>
              </div>
            </body>
            </html>
            """.formatted(nameStr, companyName);

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
        String loginUrl = frontendUrl + "/company/login";
        String subject = "🎉 [TravelEasy] Chúc mừng! Hồ sơ đối tác nhà xe " + companyName + " đã được phê duyệt thành công";

        String rateStr = (commissionRate != null) ? commissionRate.stripTrailingZeros().toPlainString() + "%" : "8%";

        String html = """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
                .card { max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
                .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px 24px; text-align: center; color: #ffffff; }
                .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
                .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }
                .content { padding: 30px 28px; line-height: 1.6; font-size: 14.5px; }
                .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
                .box-creds { background-color: #eff6ff; border: 2px dashed #93c5fd; border-radius: 12px; padding: 18px 20px; margin: 20px 0; }
                .cred-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #dbeafe; font-size: 14px; }
                .cred-item:last-child { border-bottom: none; }
                .cred-label { color: #475569; font-weight: 600; }
                .cred-value { font-weight: 700; color: #1e40af; font-family: monospace; font-size: 15px; }
                .btn-cta { display: block; text-align: center; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 24px; border-radius: 10px; font-weight: 700; font-size: 15px; margin: 25px 0 15px 0; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
                .note { background-color: #fefce8; border-left: 4px solid #eab308; padding: 12px 14px; font-size: 13px; color: #713f12; border-radius: 0 8px 8px 0; margin-top: 15px; }
                .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12.5px; color: #64748b; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <h1>TravelEasy Platform</h1>
                  <p>Hệ Thống Đặt Vé Xe Khách Trực Tuyến Hàng Đầu Việt Nam</p>
                </div>
                <div class="content">
                  <div class="greeting">Kính gửi Ban Giám Đốc Nhà Xe %s,</div>
                  <p>Ban Quản Trị TravelEasy xin trân trọng thông báo: <strong>Hồ sơ đăng ký đối tác mở bán vé trực tuyến của Quý Nhà Xe đã được phê duyệt thành công!</strong></p>
                  <p>Dưới đây là thông tin tài khoản Điều Hành (OPERATOR) được cấp phát riêng biệt để Quý Đối tác truy cập vào Cổng Quản Lý Điều Hành Nhà Xe:</p>
                  
                  <div class="box-creds">
                    <div class="cred-item">
                      <span class="cred-label">Đường dẫn Cổng Đối Tác:</span>
                      <span class="cred-value">%s</span>
                    </div>
                    <div class="cred-item">
                      <span class="cred-label">Tài khoản (Email):</span>
                      <span class="cred-value">%s</span>
                    </div>
                    <div class="cred-item">
                      <span class="cred-label">Mật khẩu khởi tạo:</span>
                      <span class="cred-value">%s</span>
                    </div>
                    <div class="cred-item">
                      <span class="cred-label">Mã nhà xe sàn cấp:</span>
                      <span class="cred-value">%s</span>
                    </div>
                    <div class="cred-item">
                      <span class="cred-label">Tỉ lệ hoa hồng sàn:</span>
                      <span class="cred-value">%s</span>
                    </div>
                  </div>

                  <a href="%s" class="btn-cta" target="_blank">ĐĂNG NHẬP CỔNG ĐIỀU HÀNH NHÀ XE NGAY ➔</a>

                  <div class="note">
                    🔒 <strong>Lưu ý bảo mật:</strong> Để đảm bảo an toàn tuyệt đối cho doanh thu và dữ liệu đội xe, Quý Đối tác vui lòng đổi mật khẩu ngay trong lần đầu tiên đăng nhập.
                  </div>
                </div>
                <div class="footer">
                  Hotline Hỗ Trợ Kỹ Thuật Đối Tác: <strong>1900 6868 (24/7)</strong><br>
                  Email: support-partner@traveleasy.vn • Trụ sở TravelEasy Platform Việt Nam
                </div>
              </div>
            </body>
            </html>
            """.formatted(companyName, loginUrl, recipientEmail, tempPassword, companyCode, rateStr, loginUrl);

        sendHtmlEmail(recipientEmail, subject, html);
    }

    /**
     * Gửi Email thông báo Từ Chối Hồ Sơ Đối Tác kèm Lý Do Cụ Thể
     */
    @Async
    public void sendPartnerRejectionEmail(String recipientEmail, String companyName, String reason) {
        String subject = "⚠️ [TravelEasy] Thông báo về hồ sơ đăng ký hợp tác nhà xe " + companyName;
        String reasonStr = (reason != null && !reason.isBlank()) ? reason : "Hồ sơ chưa đáp ứng đầy đủ tiêu chuẩn kiểm duyệt giấy phép kinh doanh vận tải của sàn.";

        String html = """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
                .card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
                .header { background: linear-gradient(135deg, #ef4444, #dc2626); padding: 24px; text-align: center; color: #ffffff; }
                .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
                .content { padding: 28px; line-height: 1.6; font-size: 14.5px; }
                .box-reason { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 14px 18px; color: #991b1b; font-weight: 600; margin: 18px 0; }
                .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 12.5px; color: #64748b; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <h1>TravelEasy Platform</h1>
                  <p>Thông Báo Thẩm Định Hồ Sơ Hợp Tác</p>
                </div>
                <div class="content">
                  <p>Kính gửi Đại diện Nhà Xe <strong>%s</strong>,</p>
                  <p>Ban Quản Trị TravelEasy xin cảm ơn Quý Đơn vị đã quan tâm và nộp hồ sơ hợp tác mở bán vé trực tuyến trên nền tảng của chúng tôi.</p>
                  <p>Sau khi thẩm định giấy tờ và điều kiện vận tải, chúng tôi rất tiếc phải thông báo hồ sơ của Quý Đơn vị hiện <strong>chưa được phê duyệt</strong> vì lý do:</p>
                  
                  <div class="box-reason">
                    📌 %s
                  </div>

                  <p>Quý Nhà Xe vui lòng kiểm tra và hoàn thiện lại hồ sơ giấy tờ, sau đó có thể nộp lại đơn đăng ký mới hoặc liên hệ trực tiếp với chuyên viên thẩm định để được hỗ trợ hướng dẫn chi tiết.</p>
                </div>
                <div class="footer">
                  Tổng Đài Thẩm Định Đối Tác: <strong>1900 6868</strong> • Email: partner-kyb@traveleasy.vn
                </div>
              </div>
            </body>
            </html>
            """.formatted(companyName, reasonStr);

        sendHtmlEmail(recipientEmail, subject, html);
    }

    /**
     * Gửi Email Yêu Cầu Bổ Sung Hồ Sơ Pháp Lý
     */
    @Async
    public void sendPartnerSupplementEmail(String recipientEmail, String companyName, String requirements) {
        String subject = "📋 [TravelEasy] Yêu cầu bổ sung hồ sơ pháp lý đối tác nhà xe " + companyName;
        String reqStr = (requirements != null && !requirements.isBlank()) ? requirements : "Bổ sung ảnh chụp rõ nét Giấy phép kinh doanh vận tải và CCCD người đại diện pháp luật.";

        String html = """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
                .card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
                .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 24px; text-align: center; color: #ffffff; }
                .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
                .content { padding: 28px; line-height: 1.6; font-size: 14.5px; }
                .box-req { background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 18px; color: #92400e; font-weight: 600; margin: 18px 0; }
                .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 12.5px; color: #64748b; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <h1>TravelEasy Platform</h1>
                  <p>Yêu Cầu Bổ Sung Hồ Sơ Pháp Lý</p>
                </div>
                <div class="content">
                  <p>Kính gửi Đại diện Nhà Xe <strong>%s</strong>,</p>
                  <p>Ban Quản Trị TravelEasy đã tiếp nhận hồ sơ đăng ký hợp tác của Quý Nhà Xe. Để hoàn tất quy trình phê duyệt KYB, Quý Nhà Xe vui lòng bổ sung thông tin sau:</p>
                  
                  <div class="box-req">
                    📝 %s
                  </div>

                  <p>Quý Nhà Xe vui lòng phản hồi email này hoặc liên hệ chuyên viên phụ trách để gửi bổ sung các chứng từ theo yêu cầu trong vòng 03 ngày làm việc.</p>
                </div>
                <div class="footer">
                  Phòng Hợp Tác Đối Tác TravelEasy • Hotline: <strong>1900 6868</strong>
                </div>
              </div>
            </body>
            </html>
            """.formatted(companyName, reqStr);

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
                ? "<div style=\"margin-top: 12px; padding: 10px; background-color: #f8fafc; border-radius: 8px; font-size: 13px; color: #475569;\"><strong>Ghi chú:</strong> " + payoutNote + "</div>"
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
                companyName,
                periodName,
                settlementCode,
                netStr,
                grossStr,
                comStr,
                netStr,
                bankName != null ? bankName : "Tài khoản đối tác",
                accountNumber != null ? accountNumber : "-",
                accountHolder != null ? accountHolder : companyName,
                payoutTxHash != null ? payoutTxHash : "VCB-FT-DIRECT",
                noteBlock
        );

        sendHtmlEmail(recipientEmail, subject, html);
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

