import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ExternalLink, ShieldCheck, Zap, X, Loader2 } from 'lucide-react';
import { toast } from '../../../../context/ToastContext';
import { paymentService } from '../../../../services/paymentService';

interface Props {
  bookingCode: string;
  totalAmount: number;
  paymentUrl?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const VnPayModal: React.FC<Props> = ({
  bookingCode,
  totalAmount,
  paymentUrl,
  onSuccess,
  onClose,
}) => {
  const [processing, setProcessing] = useState(false);

  const handleMockPay = async () => {
    setProcessing(true);
    try {
      const res = await paymentService.mockPaymentSuccess(bookingCode, 'VNPAY');
      if (res.isPaid || res.paymentStatus === 'SUCCESS') {
        toast.success(
          `Demo VNPAY: Thanh toán thành công! Đã ghi nhận mã GD: ${res.transactionNo} vào CSDL.`,
          'Thanh Toán VNPAY Thành Công'
        );
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        toast.error('Có lỗi khi giả lập thanh toán.', 'Lỗi');
      }
    } catch (err: any) {
      toast.error('Có lỗi kết nối hệ thống. Vui lòng thử lại!', 'Lỗi');
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenSandbox = () => {
    if (paymentUrl) {
      toast.info('Đang chuyển hướng sang Cổng VNPAY Sandbox chính thức...', 'VNPAY Sandbox');
      window.location.href = paymentUrl;
    } else {
      toast.error('Không tìm thấy liên kết VNPAY Sandbox.', 'Lỗi');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
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
          maxWidth: '520px',
          width: '100%',
          padding: '28px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          maxHeight: '92vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            backgroundColor: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
          }}
        >
          <X size={18} />
        </button>

        {/* Header with VNPAY Branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ backgroundColor: '#fef2f2', padding: '8px', borderRadius: '10px', display: 'flex' }}>
            <CreditCard size={26} color="#dc2626" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#dc2626', margin: 0, letterSpacing: '-0.3px' }}>
              VNPAY Payment Gateway
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>CỔNG THANH TOÁN ĐIỆN TỬ QUỐC GIA</span>
          </div>
        </div>

        {/* Order Details Card */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px 20px',
            margin: '18px 0',
            textAlign: 'left',
            fontSize: '13.5px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ color: '#64748b' }}>Mã đơn đặt vé:</span>
            <span style={{ fontWeight: 800, color: '#2563eb' }}>{bookingCode}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ color: '#64748b' }}>Tổng số tiền thanh toán:</span>
            <span style={{ fontWeight: 900, color: '#dc2626', fontSize: '16px' }}>
              {totalAmount.toLocaleString('vi-VN')} đ
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ color: '#64748b' }}>Trạng thái giao dịch:</span>
            <span style={{ fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
              Đang chờ thanh toán
            </span>
          </div>
        </div>

        {/* Demo Fast-Approval Banner & Button */}
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '2px dashed #3b82f6',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '16px',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>
            <Zap size={16} color="#2563eb" />
            CHẾ ĐỘ DEMO & BÁO CÁO NHANH (KHUYÊN DÙNG):
          </div>
          <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 12px 0', lineHeight: 1.5 }}>
            Bấm nút dưới đây để hệ thống tự động ghi nhận thanh toán thành công vào Database, sinh mã giao dịch VNPAY chuẩn, kích hoạt vé và chuyển sang màn hình vé điện tử ngay tức thì.
          </p>

          <button
            onClick={handleMockPay}
            disabled={processing}
            style={{
              width: '100%',
              padding: '13px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '14.5px',
              cursor: processing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(220,38,38,0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            {processing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {processing ? 'Đang cập nhật CSDL...' : '⚡ [DEMO] XÁC NHẬN ĐÃ THANH TOÁN VNPAY NGAY'}
          </button>
        </div>

        {/* Alternative: Real VNPAY Sandbox Gateway Redirect */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleOpenSandbox}
            style={{
              width: '100%',
              padding: '11px',
              backgroundColor: '#ffffff',
              color: '#1e3a8a',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <ExternalLink size={15} />
            Mở Cổng VNPAY Sandbox Chính Thức (Nhập Thẻ Test NCB)
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '11px', color: '#16a34a', marginTop: '6px' }}>
            <ShieldCheck size={14} /> Giao dịch demo được đồng bộ 100% với Backend & Database PostgreSQL
          </div>
        </div>
      </div>
    </div>
  );
};

export default VnPayModal;
