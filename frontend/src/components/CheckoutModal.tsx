import React, { useState, useEffect, useRef } from 'react';
import { Trip, Booking } from '../types';
import api from '../services/api';
import { X, CheckCircle, ShieldCheck, Lock, Clock, AlertTriangle } from 'lucide-react';
import { toast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

interface Props {
  trip: Trip;
  selectedSeats: string[];
  points: { pickup?: number; dropoff?: number; pickupName?: string; dropoffName?: string };
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
}

export const CheckoutModal: React.FC<Props> = ({ trip, selectedSeats, points, onClose, onSuccess }) => {
  const { isDark } = useTheme();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_BOARD' | 'PAYOS' | 'VNPAY'>('PAYOS');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 phút giữ chỗ

  const bookingSuccessRef = useRef(false);
  const isHeldRef = useRef(false);

  const totalPrice = selectedSeats.length * trip.price;

  // Tự động gửi yêu cầu khóa giữ chỗ (LOCKED - Màu Vàng) khi mở bước thanh toán
  useEffect(() => {
    let active = true;

    const holdSeats = async () => {
      try {
        await api.post(`/trips/${trip.id}/seats/hold`, {
          seatCodes: selectedSeats,
          sessionId: 'session-' + Date.now(),
        });
        if (active) {
          isHeldRef.current = true;
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Một số ghế bạn chọn vừa được khách khác giữ chỗ!';
        toast.error(msg, 'Ghế Đã Có Người Đặt');
        onClose();
      }
    };

    holdSeats();

    // Đồng hồ đếm ngược 10 phút
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.warning('Thời gian giữ chỗ 10 phút đã hết hạn. Ghế đã được mở lại cho khách khác.', 'Hết Hạn Giữ Ghế');
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      active = false;
      clearInterval(timer);
      // Nếu hủy hoặc đóng modal mà chưa đặt vé thành công, trả ghế về AVAILABLE
      if (isHeldRef.current && !bookingSuccessRef.current) {
        api.post(`/trips/${trip.id}/seats/release`, {
          seatCodes: selectedSeats,
        }).catch(() => {});
      }
    };
  }, [trip.id, selectedSeats, onClose]);

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        tripId: trip.id,
        seatNumbers: selectedSeats,
        customerName,
        customerPhone,
        customerEmail,
        pickupPointId: points.pickup,
        dropoffPointId: points.dropoff,
        paymentMethod,
        note,
      };

      const res = await api.post('/bookings', payload);
      bookingSuccessRef.current = true;
      toast.success(`Đặt vé thành công! Mã đơn của bạn là: ${res.data.data.bookingCode}`, 'Đặt Vé Thành Công');
      onSuccess(res.data.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi đặt vé. Vui lòng thử lại!';
      toast.error(msg, 'Đặt Vé Thất Bại');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: isDark ? '#111827' : '#fff',
          color: isDark ? '#f8fafc' : '#0f172a',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          position: 'relative',
          border: `1px solid ${isDark ? '#1e293b' : 'none'}`,
          boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', color: isDark ? '#94a3b8' : '#64748b' }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px', color: isDark ? '#60a5fa' : '#1e3a8a' }}>
          Thông Tin Hành Khách Đặt Vé
        </h3>

        {/* Realtime Seat Holding Indicator Banner */}
        <div
          style={{
            backgroundColor: isDark ? '#451a03' : '#fffbeb',
            border: `1px solid ${isDark ? '#d97706' : '#fde68a'}`,
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color={isDark ? '#fbbf24' : '#d97706'} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#fef08a' : '#92400e' }}>
                Đang giữ chỗ thời gian thực (Màu Vàng trên sơ đồ)
              </div>
              <div style={{ fontSize: '11.5px', color: isDark ? '#fde68a' : '#b45309' }}>
                Các ghế (<strong>{selectedSeats.join(', ')}</strong>) đang được khóa để bạn an tâm thanh toán
              </div>
            </div>
          </div>
          <div
            style={{
              backgroundColor: isDark ? '#78350f' : '#fef3c7',
              border: `1px solid ${isDark ? '#d97706' : '#f59e0b'}`,
              padding: '6px 12px',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '13px',
              color: isDark ? '#fef3c7' : '#92400e',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Clock size={13} /> {formatCountdown(timeLeft)}
          </div>
        </div>

        {/* Tóm tắt */}
        <div style={{ backgroundColor: isDark ? '#1e293b' : '#eff6ff', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', border: `1px solid ${isDark ? '#334155' : 'transparent'}` }}>
          <div style={{ fontWeight: 700, color: isDark ? '#93c5fd' : '#1e40af' }}>{trip.busCompanyName} - {trip.originCity} ➔ {trip.destinationCity}</div>
          <div style={{ color: isDark ? '#cbd5e1' : '#475569', marginTop: '4px' }}>
            Ghế: <strong>{selectedSeats.join(', ')}</strong> | Tổng: <strong style={{ color: isDark ? '#38bdf8' : '#2563eb' }}>{totalPrice.toLocaleString('vi-VN')} đ</strong>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: isDark ? 'rgba(239,68,68,0.2)' : '#fef2f2', border: `1px solid ${isDark ? '#ef4444' : '#fecaca'}`, color: isDark ? '#fca5a5' : '#b91c1c', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: isDark ? '#cbd5e1' : '#334155' }}>Họ và tên *</label>
            <input 
              required
              type="text" 
              placeholder="Nguyễn Văn A"
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, backgroundColor: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: isDark ? '#cbd5e1' : '#334155' }}>Số điện thoại nhận vé *</label>
            <input 
              required
              type="tel" 
              placeholder="0912345678"
              value={customerPhone} 
              onChange={e => setCustomerPhone(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, backgroundColor: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: isDark ? '#cbd5e1' : '#334155' }}>Email nhận vé điện tử</label>
            <input 
              type="email" 
              placeholder="khachhang@example.com"
              value={customerEmail} 
              onChange={e => setCustomerEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, backgroundColor: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: isDark ? '#cbd5e1' : '#334155' }}>Hình thức thanh toán</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('PAYOS')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '8px',
                  border: paymentMethod === 'PAYOS' ? `2px solid ${isDark ? '#10b981' : '#059669'}` : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                  backgroundColor: paymentMethod === 'PAYOS' ? (isDark ? 'rgba(16,185,129,0.2)' : '#ecfdf5') : (isDark ? '#1e293b' : '#fff'),
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '12px', color: paymentMethod === 'PAYOS' ? (isDark ? '#4ade80' : '#065f46') : (isDark ? '#f8fafc' : '#1e293b') }}>
                  ⚡ PayOS (MB Bank)
                </div>
                <div style={{ fontSize: '10.5px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>Quét VietQR Napas</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('VNPAY')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '8px',
                  border: paymentMethod === 'VNPAY' ? `2px solid ${isDark ? '#38bdf8' : '#2563eb'}` : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                  backgroundColor: paymentMethod === 'VNPAY' ? (isDark ? 'rgba(56,189,248,0.2)' : '#eff6ff') : (isDark ? '#1e293b' : '#fff'),
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '12px', color: paymentMethod === 'VNPAY' ? (isDark ? '#38bdf8' : '#1e40af') : (isDark ? '#f8fafc' : '#1e293b') }}>
                  💳 VNPAY Sandbox
                </div>
                <div style={{ fontSize: '10.5px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>Cổng ngân hàng</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CASH_ON_BOARD')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '8px',
                  border: paymentMethod === 'CASH_ON_BOARD' ? `2px solid ${isDark ? '#f59e0b' : '#d97706'}` : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                  backgroundColor: paymentMethod === 'CASH_ON_BOARD' ? (isDark ? 'rgba(245,158,11,0.2)' : '#fffbeb') : (isDark ? '#1e293b' : '#fff'),
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '12px', color: paymentMethod === 'CASH_ON_BOARD' ? (isDark ? '#fbbf24' : '#92400e') : (isDark ? '#f8fafc' : '#1e293b') }}>
                  💵 Tiền mặt
                </div>
                <div style={{ fontSize: '10.5px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>Trả khi lên xe</div>
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: isDark ? '#cbd5e1' : '#334155' }}>Ghi chú đón trả</label>
            <textarea 
              rows={2}
              placeholder="VD: Đón tại ngã 4, có vali lớn..."
              value={note} 
              onChange={e => setNote(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, backgroundColor: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                color: isDark ? '#cbd5e1' : '#334155',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#fff',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Đang tạo đơn vé...' : `Xác Nhận Đặt (${totalPrice.toLocaleString('vi-VN')} đ)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
