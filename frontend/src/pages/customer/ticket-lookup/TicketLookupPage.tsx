import React, { useState } from 'react';
import api from '../../../services/api';
import { Booking } from '../../../types';
import { Search, ShieldCheck, QrCode, MapPin } from 'lucide-react';

export const TicketLookupPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      const res = await api.get(`/bookings/code/${code.trim()}`);
      setBooking(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không tìm thấy thông tin đơn đặt vé với mã này!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '720px', marginTop: '40px' }}>
      <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a', textAlign: 'center', marginBottom: '8px' }}>
          Tra Cứu Vé & Lấy Mã QR Lên Xe
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
          Nhập mã đơn vé của bạn (VD: BK-20261019-XXXX) để kiểm tra trạng thái vé và vị trí ghế ngồi
        </p>

        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <input
            type="text"
            required
            placeholder="Nhập mã đặt vé..."
            value={code}
            onChange={e => setCode(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Search size={18} /> {loading ? 'Đang tìm...' : 'Tra Cứu'}
          </button>
        </form>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {booking && (
          <div style={{ border: '2px dashed #93c5fd', borderRadius: '12px', padding: '24px', backgroundColor: '#f0f9ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Mã đặt vé:</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb' }}>{booking.bookingCode}</div>
              </div>
              <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '13px' }}>
                {booking.status}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', fontSize: '14px' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>Nhà xe & Tuyến đường</div>
                <div style={{ fontWeight: 700 }}>{booking.trip.busCompanyName}</div>
                <div>{booking.trip.originCity} ➔ {booking.trip.destinationCity}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>Hành khách</div>
                <div style={{ fontWeight: 700 }}>{booking.customerName}</div>
                <div>{booking.customerPhone}</div>
              </div>
            </div>

            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', backgroundColor: '#fff', padding: '12px', borderRadius: '8px' }}>
              <div><MapPin size={14} style={{ display: 'inline', color: '#2563eb' }} /> Điểm đón: <strong>{booking.pickupPointName}</strong></div>
              <div><MapPin size={14} style={{ display: 'inline', color: '#f97316' }} /> Điểm trả: <strong>{booking.dropoffPointName}</strong></div>
            </div>

            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>Danh Sách Vé Điện Tử</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {booking.tickets.map(t => (
                <div key={t.id} style={{ backgroundColor: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <QrCode size={40} color="#2563eb" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Mã vé: {t.ticketCode}</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#f97316', margin: '4px 0' }}>Ghế {t.seatNumber}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{t.price.toLocaleString('vi-VN')} đ</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
