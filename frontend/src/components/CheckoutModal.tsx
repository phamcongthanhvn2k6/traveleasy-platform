import React, { useState } from 'react';
import { Trip, Booking } from '../types';
import api from '../services/api';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';
import { toast } from '../context/ToastContext';

interface Props {
  trip: Trip;
  selectedSeats: string[];
  points: { pickup?: number; dropoff?: number; pickupName?: string; dropoffName?: string };
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
}

export const CheckoutModal: React.FC<Props> = ({ trip, selectedSeats, points, onClose, onSuccess }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_BOARD' | 'VNPAY'>('CASH_ON_BOARD');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPrice = selectedSeats.length * trip.price;

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
        note
      };

      const res = await api.post('/bookings', payload);
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '540px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none' }}
        >
          <X size={20} color="#64748b" />
        </button>

        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px', color: '#1e3a8a' }}>
          Thông Tin Hành Khách Đặt Vé
        </h3>

        {/* Tóm tắt */}
        <div style={{ backgroundColor: '#eff6ff', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          <div style={{ fontWeight: 700, color: '#1e40af' }}>{trip.busCompanyName} - {trip.originCity} ➔ {trip.destinationCity}</div>
          <div style={{ color: '#475569', marginTop: '4px' }}>
            Ghế: <strong>{selectedSeats.join(', ')}</strong> | Tổng: <strong style={{ color: '#2563eb' }}>{totalPrice.toLocaleString('vi-VN')} đ</strong>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Họ và tên *</label>
            <input 
              required
              type="text" 
              placeholder="Nguyễn Văn A"
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Số điện thoại nhận vé *</label>
            <input 
              required
              type="tel" 
              placeholder="0912345678"
              value={customerPhone} 
              onChange={e => setCustomerPhone(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Email (nhận mã QR)</label>
            <input 
              type="email" 
              placeholder="hanhkhach@gmail.com"
              value={customerEmail} 
              onChange={e => setCustomerEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Phương thức thanh toán *</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ flex: 1, padding: '10px', borderRadius: '6px', border: paymentMethod === 'CASH_ON_BOARD' ? '2px solid #2563eb' : '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'CASH_ON_BOARD'}
                  onChange={() => setPaymentMethod('CASH_ON_BOARD')}
                />
                <span>Thanh toán COD khi lên xe</span>
              </label>

              <label style={{ flex: 1, padding: '10px', borderRadius: '6px', border: paymentMethod === 'VNPAY' ? '2px solid #2563eb' : '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'VNPAY'}
                  onChange={() => setPaymentMethod('VNPAY')}
                />
                <span>Chuyển khoản QR / VNPay</span>
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Ghi chú đón / hành lý</label>
            <textarea 
              rows={2}
              placeholder="VD: Có gửi kèm 1 xe máy Wave, đón tại ngã tư..."
              value={note} 
              onChange={e => setNote(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#f97316',
              color: '#fff',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '16px',
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <ShieldCheck size={20} /> {loading ? 'Đang xử lý đặt vé...' : `Xác Nhận Đặt Vé (${totalPrice.toLocaleString('vi-VN')} đ)`}
          </button>
        </form>
      </div>
    </div>
  );
};
