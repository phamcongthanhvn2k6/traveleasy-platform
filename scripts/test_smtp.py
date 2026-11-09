import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

sender = 'phamcongt56@gmail.com'
password = 'gizlexnljusfhuxd'
receiver = 'phamcongt56@gmail.com'

msg = MIMEMultipart('alternative')
msg['Subject'] = '🚀 [TravelEasy Test] Kiểm tra kết nối Google SMTP gửi email thông báo'
msg['From'] = f'TravelEasy Platform <{sender}>'
msg['To'] = receiver

html = '''
<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
    <h2 style="color: #2563eb;">🎉 Kiểm Tra Kết Nối Google SMTP Thành Công!</h2>
    <p>Chào bạn <strong>Phạm Công Thành</strong>,</p>
    <p>Hệ thống máy chủ TravelEasy Backend đã kết nối thành công tới dịch vụ Google SMTP với tài khoản <code>phamcongt56@gmail.com</code>.</p>
    <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0; color: #1e40af;"><strong>Trạng thái:</strong> ✅ Sẵn sàng gửi thông báo duyệt hồ sơ nhà xe & cấp tài khoản B2B.</p>
    </div>
    <p style="margin-top: 20px; font-size: 13px; color: #64748b;">TravelEasy Platform OJT 2026 - Sprint 3 Task S302</p>
  </div>
</div>
'''
msg.attach(MIMEText(html, 'html'))

try:
    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login(sender, password)
        server.sendmail(sender, receiver, msg.as_string())
    print('SUCCESS: Email sent successfully to', receiver)
except Exception as e:
    print('ERROR:', e)
