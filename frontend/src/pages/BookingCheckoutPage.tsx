import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Trip } from '../types';
import { ArrowLeft, CheckCircle, CreditCard, ShieldCheck, MapPin, User } from 'lucide-react';

export const BookingCheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { trip?: Trip; selectedSeats?: string[] } | undefined;

  const trip = state?.trip || {
    id: 1,
    busCompanyName: 'Phương Trang (FUTA Bus Lines)',
    departureLocation: 'TP. Hồ Chí Minh',
    arrivalLocation: 'Đà Lạt',
    departureTime: '2026-10-25T22:00:00',
    arrivalTime: '2026-10-26T06:00:00',
    busType: 'LIMOUSINE_34',
    price: 320000,
    availableSeats: 30,
    totalSeats: 34,
    status: 'SCHEDULED'
  };

  const selectedSeats = state?.selectedSeats && state.selectedSeats.length > 0 
    ? state.selectedSeats 
    : ['A01', 'A02'];

  const [passengerName, setPassengerName] = useState('Phạm Công Thành');
  const [passengerPhone, setPassengerPhone] = useState('0901234567');
  const [passengerEmail, setPassengerEmail] = useState('Phamcongt56@gmail.com');
  const [pickupPointId, setPickupPointId] = useState('1');
  const [dropoffPointId, setDropoffPointId] = useState('3');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalPrice = trip.price * selectedSeats.length;

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.post('/bookings', {
        tripId: trip.id,
        seatCodes: selectedSeats,
        passengerName,
        passengerPhone,
        passengerEmail,
        pickupPointId: Number(pickupPointId),
        dropoffPointId: Number(dropoffPointId),
        paymentMethod
      });

      const booking = res.data.data;
      navigate(`/tickets/${booking.bookingCode}`, { state: { booking } });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn đặt vé.');
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '24px 0 64px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '13px' }}>
          <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={14} /> Trang Chủ
          </Link>
          <span style={{ color: '#94a3b8' }}>/</span>
          <span style={{ color: '#64748b' }}>Xác Nhận Đặt Vé & Thanh Toán (UC-1.7 & UC-1.8)</span>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a', marginBottom: '8px' }}>
            Thông Tin Hành Khách & Điểm Đón / Trả
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            Vui lòng điền thông tin chính xác để nhận mã vé điện tử QR Code lên xe
          </p>

          {errorMsg && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
              {errorMsg}
            </div>
          )}

          {/* Tóm tắt chuyến đi */}
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
            <div style={{ fontWeight: 800, color: '#166534', fontSize: '15px' }}>{trip.busCompanyName}</div>
            <div style={{ fontSize: '13px', color: '#15803d', marginTop: '4px' }}>
              {(trip as any).originCity || (trip as any).departureLocation} ➔ {(trip as any).destinationCity || (trip as any).arrivalLocation} | Khởi hành: {trip.departureTime.replace('T', ' ')}
            </div>
            <div style={{ fontSize: '13px', color: '#15803d', marginTop: '4px' }}>
              Ghế: <strong>{selectedSeats.join(', ')}</strong> ({selectedSeats.length} vé) • Tổng tiền: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</strong>
            </div>
          </div>

          <form onSubmit={handleSubmitBooking}>
            {/* Điểm đón & trả */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Điểm đón khách (Pickup Point)
                </label>
                <select value={pickupPointId} onChange={(e) => setPickupPointId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="1">Bến xe Miền Đông mới (22:00)</option>
                  <option value="2">Ngã tư Dầu Giây (23:30)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Điểm trả khách (Dropoff Point)
                </label>
                <select value={dropoffPointId} onChange={(e) => setDropoffPointId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="3">Bến xe Liên tỉnh Đà Lạt (06:00)</option>
                  <option value="4">Trung chuyển nội thành Đà Lạt (06:30)</option>
                </select>
              </div>
            </div>

            {/* Thông tin khách hàng */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Họ và tên hành khách</label>
                <input type="text" required value={passengerName} onChange={(e) => setPassengerName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Số điện thoại nhận vé</label>
                <input type="tel" required value={passengerPhone} onChange={(e) => setPassengerPhone(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Email nhận hóa đơn</label>
                <input type="email" required value={passengerEmail} onChange={(e) => setPassengerEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
                Phương thức thanh toán
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <label style={{ border: paymentMethod === 'COD' ? '2px solid #2563eb' : '1px solid #cbd5e1', padding: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', backgroundColor: paymentMethod === 'COD' ? '#eff6ff' : '#fff' }}>
                  <input type="radio" name="pay" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>Thanh Toán Khi Lên Xe (COD)</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Trả tiền mặt cho tài xế</div>
                  </div>
                </label>

                <label style={{ border: paymentMethod === 'VNPAY' ? '2px solid #2563eb' : '1px solid #cbd5e1', padding: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', backgroundColor: paymentMethod === 'VNPAY' ? '#eff6ff' : '#fff' }}>
                  <input type="radio" name="pay" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>Cổng VNPay / QR Pay</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Thẻ ATM / Mobile Banking</div>
                  </div>
                </label>

                <label style={{ border: paymentMethod === 'MOMO' ? '2px solid #2563eb' : '1px solid #cbd5e1', padding: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', backgroundColor: paymentMethod === 'MOMO' ? '#eff6ff' : '#fff' }}>
                  <input type="radio" name="pay" checked={paymentMethod === 'MOMO'} onChange={() => setPaymentMethod('MOMO')} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>Ví Điện Tử MoMo</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Quét mã MoMo tức thì</div>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.25)'
              }}
            >
              {loading ? 'Đang tạo đơn đặt vé...' : `Xác Nhận Đặt Vé & Thanh Toán (${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)})`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingCheckoutPage;
