import React, { useState } from 'react';
import { QrCode, CheckCircle2, Copy, Check, AlertCircle } from 'lucide-react';
import { toast } from '../../../../context/ToastContext';

interface Props {
  bookingCode: string;
  totalAmount: number;
  onSuccess: () => void;
  onClose: () => void;
}

export const QrPaymentModal: React.FC<Props> = ({
  bookingCode,
  totalAmount,
  onSuccess,
  onClose,
}) => {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const bankName = 'MB Bank (Ngân hàng Quân Đội)';
  const accountNumber = '0988123456789';
  const accountHolder = 'CONG TY CP CONG NGHE TRAVELEASY VIET NAM';
  const transferContent = `TRAVELEASY ${bookingCode}`;

  // VietQR QuickPay URL format:
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    `2|99|0988123456789|CONG TY CP TRAVELEASY||0|0|${totalAmount}|${transferContent}|transfer_p2p`
  )}`;

  const handleCopy = (text: string, type: 'acc' | 'content') => {
    navigator.clipboard.writeText(text);
    if (type === 'acc') {
      setCopiedAccount(true);
      toast.success('Đã sao chép số tài khoản!', 'Sao Chép');
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedContent(true);
      toast.success('Đã sao chép nội dung chuyển khoản!', 'Sao Chép');
      setTimeout(() => setCopiedContent(false), 2000);
    }
  };

  const handleConfirmPaid = () => {
    setConfirming(true);
    setTimeout(() => {
      setConfirming(false);
      onSuccess();
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '16px',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '520px',
          width: '100%',
          padding: '28px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <QrCode size={22} color="#2563eb" />
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Quét Mã QR Thanh Toán Vé
          </h3>
        </div>

        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 18px 0' }}>
          Mở ứng dụng Ngân hàng bất kỳ (Vietcombank, MB, Techcombank, BIDV...) quét mã QR dưới đây để hoàn tất thanh toán tức thì.
        </p>

        {/* Dynamic QR Code Box */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '2px dashed #93c5fd',
            borderRadius: '14px',
            padding: '16px',
            display: 'inline-block',
            marginBottom: '18px',
          }}
        >
          <img
            src={qrUrl}
            alt="Mã QR Chuyển Khoản"
            style={{ width: '220px', height: '220px', display: 'block', margin: '0 auto', borderRadius: '8px' }}
          />
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', marginTop: '8px' }}>
            VNPay-QR & VietQR Tự Động Khớp Lệnh
          </div>
        </div>

        {/* Transfer details */}
        <div
          style={{
            backgroundColor: '#f1f5f9',
            borderRadius: '10px',
            padding: '14px',
            textAlign: 'left',
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Ngân hàng:</span>
            <strong style={{ color: '#0f172a' }}>{bankName}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>Số tài khoản:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ color: '#2563eb', fontSize: '14px' }}>{accountNumber}</strong>
              <button
                onClick={() => handleCopy(accountNumber, 'acc')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#2563eb' }}
              >
                {copiedAccount ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Chủ tài khoản:</span>
            <strong style={{ color: '#0f172a' }}>{accountHolder}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Số tiền:</span>
            <strong style={{ color: '#f97316', fontSize: '16px' }}>
              {totalAmount.toLocaleString('vi-VN')} đ
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
            <span style={{ color: '#64748b' }}>Nội dung chuyển khoản:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>
                {transferContent}
              </strong>
              <button
                onClick={() => handleCopy(transferContent, 'content')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626' }}
              >
                {copiedContent ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#475569',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Đổi phương thức khác
          </button>

          <button
            onClick={handleConfirmPaid}
            disabled={confirming}
            style={{
              flex: 1.5,
              backgroundColor: '#16a34a',
              border: 'none',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.4)',
            }}
          >
            <CheckCircle2 size={16} />
            {confirming ? 'Đang xác thực hệ thống...' : 'Tôi Đã Chuyển Khoản'}
          </button>
        </div>
      </div>
    </div>
  );
};

