import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle2, Copy, Check, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from '../../../../context/ToastContext';
import { paymentService, BankTransferDetails } from '../../../../services/paymentService';

interface Props {
  bookingCode: string;
  totalAmount: number;
  qrCodeUrl?: string;
  bankDetails?: BankTransferDetails;
  onSuccess: () => void;
  onClose: () => void;
}

export const QrPaymentModal: React.FC<Props> = ({
  bookingCode,
  totalAmount,
  qrCodeUrl,
  bankDetails,
  onSuccess,
  onClose,
}) => {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [checking, setChecking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const bankName = bankDetails?.bankName || 'MB Bank (Ngân hàng Quân Đội)';
  const accountNumber = bankDetails?.accountNumber || '0988123456789';
  const accountHolder = bankDetails?.accountHolder || 'CONG TY CP CONG NGHE TRAVELEASY VIET NAM';
  const transferContent = bankDetails?.transferContent || `TRAVELEASY ${bookingCode}`;

  // VietQR Napas 24/7 QuickPay Image URL
  const qrImage =
    qrCodeUrl ||
    `https://img.vietqr.io/image/MB-0988123456789-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(
      transferContent
    )}&accountName=${encodeURIComponent(accountHolder)}`;

  // Real-time polling check payment status every 4 seconds
  useEffect(() => {
    if (isSuccess) return;

    const interval = setInterval(async () => {
      try {
        const status = await paymentService.getPaymentStatus(bookingCode);
        if (status.isPaid || status.paymentStatus === 'SUCCESS') {
          setIsSuccess(true);
          toast.success('Hệ thống đã nhận được tiền chuyển khoản! Đang phát hành vé...', 'Thanh Toán Thành Công');
          clearInterval(interval);
        }
      } catch (err) {
        // Silent fail on polling error
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [bookingCode, isSuccess, onSuccess]);

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

  const handleManualConfirm = async () => {
    setConfirming(true);
    try {
      const res = await paymentService.confirmVietQr(bookingCode);
      if (res.isPaid || res.paymentStatus === 'SUCCESS') {
        setIsSuccess(true);
        toast.success('Xác nhận chuyển khoản thành công! Vé đã được kích hoạt.', 'Thành Công');
      } else {
        toast.info('Đang kiểm tra giao dịch với ngân hàng, vui lòng đợi trong giây lát...', 'Kiểm Tra');
      }
    } catch (err: any) {
      toast.error('Có lỗi khi xác nhận giao dịch. Vui lòng thử lại!', 'Lỗi');
    } finally {
      setConfirming(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const res = await paymentService.getPaymentStatus(bookingCode);
      if (res.isPaid || res.paymentStatus === 'SUCCESS') {
        setIsSuccess(true);
        toast.success('Đã nhận thanh toán thành công!', 'Thành Công');
      } else {
        toast.info('Hệ thống chưa ghi nhận biến động số dư. Vui lòng kiểm tra lại app ngân hàng hoặc bấm xác nhận.', 'Chờ Thanh Toán');
      }
    } catch (err) {
      toast.error('Không thể kiểm tra trạng thái lúc này.', 'Lỗi');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '16px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          maxWidth: '540px',
          width: '100%',
          padding: '28px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          maxHeight: '92vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {isSuccess ? (
          <div style={{ padding: '24px 10px', textAlign: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <CheckCircle2 size={44} />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#166534', margin: '0 0 8px 0' }}>
              Thanh Toán Thành Công!
            </h3>
            <p style={{ color: '#475569', fontSize: '13.5px', lineHeight: 1.6, marginBottom: '20px' }}>
              Hệ thống đã nhận được tiền chuyển khoản cho mã đơn <strong>{bookingCode}</strong> ({totalAmount.toLocaleString('vi-VN')} đ). Vé đã được kích hoạt thành công trên CSDL.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={onSuccess}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                }}
              >
                Xem Chi Tiết Vé Điện Tử Ngay
              </button>
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ backgroundColor: '#eff6ff', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                <QrCode size={22} color="#2563eb" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Quét Mã QR Chuyển Khoản Tức Thì
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
              Mở App Ngân hàng bất kỳ (Vietcombank, MB, Techcombank, BIDV, ACB...) quét mã QR Napas 24/7 dưới đây:
            </p>

            {/* Dynamic VietQR Napas 24/7 Image */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '2px dashed #93c5fd',
                borderRadius: '16px',
                padding: '16px',
                display: 'inline-block',
                marginBottom: '16px',
                boxShadow: '0 4px 12px rgba(37,99,235,0.06)',
              }}
            >
              <img
                src={qrImage}
                alt="VietQR QuickPay"
                style={{
                  width: '240px',
                  height: '240px',
                  display: 'block',
                  borderRadius: '10px',
                  objectFit: 'contain',
                }}
              />
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
                Tự động nhận diện số tiền & nội dung
              </div>
            </div>

            {/* Bank details table */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px',
                fontSize: '13px',
                textAlign: 'left',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Ngân hàng thụ hưởng:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{bankName}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Số tài khoản:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '14px' }}>{accountNumber}</span>
                  <button
                    onClick={() => handleCopy(accountNumber, 'acc')}
                    style={{
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: copiedAccount ? '#16a34a' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {copiedAccount ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                    {copiedAccount ? 'Đã sao chép' : 'Sao chép'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Chủ tài khoản:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{accountHolder}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Số tiền:</span>
                <span style={{ fontWeight: 900, color: '#dc2626', fontSize: '15px' }}>
                  {totalAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                <span style={{ color: '#64748b' }}>Nội dung chuyển:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, color: '#059669', fontSize: '13.5px' }}>{transferContent}</span>
                  <button
                    onClick={() => handleCopy(transferContent, 'content')}
                    style={{
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: copiedContent ? '#16a34a' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {copiedContent ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                    {copiedContent ? 'Đã sao chép' : 'Sao chép'}
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleManualConfirm}
                disabled={confirming}
                style={{
                  width: '100%',
                  padding: '13px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: confirming ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
                }}
              >
                {confirming ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                {confirming ? 'Đang kích hoạt vé...' : 'Tôi Đã Chuyển Khoản Thành Công'}
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleCheckStatus}
                  disabled={checking}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: checking ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
                  {checking ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái'}
                </button>

                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Đóng & Giữ Chỗ 10 Phút
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QrPaymentModal;
