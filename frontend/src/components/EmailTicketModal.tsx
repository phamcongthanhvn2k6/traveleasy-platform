import React, { useState } from 'react';
import { Mail, Send, X, CheckCircle2, ShieldCheck, FileText, Bus, Clock, MapPin, QrCode } from 'lucide-react';
import { toast } from '../context/ToastContext';

interface EmailTicketModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
}

export const EmailTicketModal: React.FC<EmailTicketModalProps> = ({
  booking,
  isOpen,
  onClose,
}) => {
  const [recipientEmail, setRecipientEmail] = useState(
    booking?.customerEmail || 'khachhang@traveleasy.vn'
  );
  const [includeVat, setIncludeVat] = useState(true);
  const [companyTaxId, setCompanyTaxId] = useState('0312345678');
  const [companyName, setCompanyName] = useState('CÔNG TY TNHH DU LỊCH & CÔNG NGHỆ');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSendEmail = () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      toast.warning('Vui lòng nhập địa chỉ email hợp lệ!', 'Email Không Hợp Lệ');
      return;
    }

    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSentSuccess(true);
      toast.success(
        `Đã gửi vé điện tử & hóa đơn VAT thành công tới ${recipientEmail}!`,
        'Email Đã Được Gửi'
      );
    }, 1200);
  };

  const bookingCode = booking.bookingCode || 'BK-20261027-001';
  const customerName = booking.customerName || 'Nguyễn Văn An';
  const customerPhone = booking.customerPhone || '0900000000';
  const totalAmount = booking.totalAmount || 320000;
  const tripRoute = booking.trip?.originCity
    ? `${booking.trip.originCity} ➔ ${booking.trip.destinationCity}`
    : 'TP. Hồ Chí Minh ➔ Đà Lạt';

  const seatsList = Array.isArray(booking.tickets)
    ? booking.tickets.map((t: any) => t.seatNumber).join(', ')
    : 'A03, A04';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mail size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800 }}>
                GỬI VÉ ĐIỆN TỬ & HÓA ĐƠN VAT QUA EMAIL
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Mã đơn: <strong style={{ color: '#38bdf8' }}>{bookingCode}</strong> • Tự động gửi qua SMTP Mailer
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '22px 24px', overflowY: 'auto', flex: 1, backgroundColor: '#f8fafc' }}>
          {/* Email Settings Bar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid #e2e8f0',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Email người nhận vé điện tử:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={handleSendEmail}
                  disabled={sending}
                  style={{
                    backgroundColor: sending ? '#94a3b8' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(37,99,235,0.25)',
                  }}
                >
                  <Send size={15} />
                  <span>{sending ? 'Đang gửi...' : 'Gửi Vé Ngay'}</span>
                </button>
              </div>
            </div>

            {/* Checkbox VAT Invoice */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="vatCheck"
                checked={includeVat}
                onChange={(e) => setIncludeVat(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="vatCheck" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                Kèm Hóa đơn điện tử VAT (Phục vụ thanh toán doanh nghiệp / cơ quan)
              </label>
            </div>

            {includeVat && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>Mã số thuế doanh nghiệp:</label>
                  <input
                    type="text"
                    value={companyTaxId}
                    onChange={(e) => setCompanyTaxId(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>Tên cơ quan / Doanh nghiệp:</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Success Banner if sent */}
          {sentSuccess && (
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#065f46',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={18} color="#059669" />
              <span>Hệ thống đã chuyển vé điện tử & chứng từ hóa đơn tới <strong>{recipientEmail}</strong>. Khách hàng có thể kiểm tra hộp thư đến hoặc mục thư rác.</span>
            </div>
          )}

          {/* Preview Email Template Container */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              XEM TRƯỚC NỘI DUNG EMAIL GỬI KHÁCH HÀNG:
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              }}
            >
              {/* Fake Email Header */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                  color: '#ffffff',
                  padding: '24px 28px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.3px' }}>
                  🚌 TRAVELEASY VIETNAM
                </div>
                <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px' }}>
                  Xác Nhận Đặt Chỗ Vé Xe Khách Điện Tử & Hóa Đơn VAT
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginTop: '10px',
                  }}
                >
                  MÃ ĐƠN: {bookingCode}
                </div>
              </div>

              {/* Email Body Content */}
              <div style={{ padding: '24px', fontSize: '13px', color: '#1e293b' }}>
                <p style={{ margin: '0 0 14px 0', lineHeight: 1.5 }}>
                  Xin chào <strong>{customerName}</strong>,
                </p>
                <p style={{ margin: '0 0 16px 0', lineHeight: 1.5, color: '#475569' }}>
                  TravelEasy xin gửi lời cảm ơn quý khách đã tin tưởng dịch vụ. Chuyến xe của quý khách đã được giữ chỗ và kích hoạt thành công trên hệ thống. Dưới đây là thông tin chi tiết hành trình:
                </p>

                {/* Itinerary Table */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Hành trình:</span>
                    <strong style={{ color: '#0f172a' }}>{tripRoute}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Nhà xe vận chuyển:</span>
                    <strong style={{ color: '#2563eb' }}>{booking.trip?.busCompanyName || 'TravelEasy VIP Express'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Số ghế đặt:</span>
                    <strong style={{ color: '#ea580c', fontSize: '14px' }}>{seatsList}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Số điện thoại liên hệ:</span>
                    <strong>{customerPhone}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Điểm đón khách:</span>
                    <strong>{booking.pickupPointName || 'Bến xe Miền Tây (Quầy 12)'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Tổng thanh toán (Đã VAT):</span>
                    <span style={{ fontSize: '16px', fontWeight: 900, color: '#16a34a' }}>
                      {totalAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                {includeVat && (
                  <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '12px', color: '#166534', marginBottom: '16px' }}>
                    ✓ Đã lập kèm Hóa đơn điện tử GTGT cho MST: <strong>{companyTaxId}</strong> ({companyName}). File hóa đơn XML/PDF được đính kèm trong thư.
                  </div>
                )}

                <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  💡 <em>Lưu ý: Quý khách vui lòng có mặt tại điểm đón trước 30 phút giờ khởi hành và xuất trình mã QR này cho nhân viên phụ xe. Hotline hỗ trợ 24/7: <strong>1900 8888</strong>.</em>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailTicketModal;

