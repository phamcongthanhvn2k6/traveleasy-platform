import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Booking } from '../types';
import { CheckCircle, QrCode, Download, ArrowLeft, Bus, Calendar, MapPin, User, ShieldCheck } from 'lucide-react';

export const PaymentSuccessPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const location = useLocation();
  const [booking, setBooking] = useState<Booking | null>(location.state?.booking || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!booking && code) {
      setLoading(true);
      api.get(`/bookings/code/${code}`)
        .then(res => setBooking(res.data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [code]);

  // Demo fallback data if database returns null on initial mock
  const b: any = booking || {
    id: 1,
    bookingCode: code || 'BK-20261025-001',
    passengerName: 'Phạm Công Thành',
    passengerPhone: '0901234567',
    passengerEmail: 'Phamcongt56@gmail.com',
    busCompanyName: 'Phương Trang (FUTA Bus Lines)',
    departureLocation: 'TP. Hồ Chí Minh (Bến xe Miền Đông mới)',
    arrivalLocation: 'Lâm Đồng (Bến xe Liên tỉnh Đà Lạt)',
    departureTime: '2026-10-25 22:00:00',
    seatNumbers: 'A01, A02',
    totalPrice: 640000,
    status: 'CONFIRMED',
    paymentMethod: 'COD',
    pickupPointName: 'Bến xe Miền Đông mới (22:00)',
    dropoffPointName: 'Bến xe Liên tỉnh Đà Lạt (06:00)'
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '32px 0 64px' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px' }}>
          <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={14} /> Trang Chủ
          </Link>
          <span style={{ color: '#94a3b8' }}>/</span>
          <span style={{ color: '#64748b' }}>Vé Điện Tử & Mã QR Lên Xe (UC-1.9)</span>
        </div>

        {/* Success Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', marginBottom: '12px' }}>
            <CheckCircle size={44} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1e3a8a' }}>
            Thẻ Vé Điện Tử Lên Xe (E-Ticket)
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Mã đơn vé: <strong style={{ color: '#2563eb', fontSize: '16px' }}>{b.bookingCode}</strong> • Trạng thái: <strong style={{ color: '#16a34a' }}>ĐÃ XÁC NHẬN</strong>
          </p>
        </div>

        {/* E-Ticket Card Layout */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          {/* Ticket Header Brand */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#fff',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.8 }}>VÉ XE KHÁCH LIÊN TỈNH</span>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{b.busCompanyName}</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', opacity: 0.8 }}>PHƯƠNG THỨC</span>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>{b.paymentMethod}</div>
            </div>
          </div>

          <div style={{ padding: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '24px', alignItems: 'center' }}>
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>TUYẾN ĐƯỜNG</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {b.departureLocation} ➔ {b.arrivalLocation}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>GIỜ KHỞI HÀNH</span>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a8a', marginTop: '2px' }}>
                      {b.departureTime.replace('T', ' ')}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>VỊ TRÍ GHẾ</span>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#ea580c', marginTop: '2px' }}>
                      {b.seatNumbers}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>HÀNH KHÁCH</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>
                    {b.passengerName} • {b.passengerPhone}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>ĐIỂM ĐÓN / TRẢ</span>
                  <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                    Đón: {b.pickupPointName || 'Bến xe Miền Đông mới'}<br />
                    Trả: {b.dropoffPointName || 'Bến xe Liên tỉnh Đà Lạt'}
                  </div>
                </div>
              </div>

              {/* QR Code Container */}
              <div style={{ textAlign: 'center', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                {/* SVG Visual QR Mock */}
                <div style={{ width: '130px', height: '130px', margin: '0 auto', backgroundColor: '#fff', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={110} color="#0f172a" />
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', marginTop: '8px' }}>
                  QUÉT ĐỂ LÊN XE
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                  Tài xế / Phụ xe kiểm tra
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '24px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Tổng thanh toán:</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a', marginLeft: '8px' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.totalPrice)}
                </span>
              </div>
              <button
                onClick={() => window.print()}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#1e293b',
                  border: '1px solid #cbd5e1',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Download size={14} /> In / Lưu Vé
              </button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/lookup" style={{ color: '#2563eb', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
            Tra cứu đơn vé khác ➔
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
