import React, { useState, useEffect } from 'react';
import { SearchTripBar } from '../../../components/SearchTripBar';
import { TripCard } from '../../../components/TripCard';
import { CheckoutModal } from '../../../components/CheckoutModal';
import { Trip, Booking } from '../../../types';
import api from '../../../services/api';
import { CheckCircle, Award, Clock, ShieldCheck } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingTrip, setBookingTrip] = useState<Trip | null>(null);
  const [bookingSeats, setBookingSeats] = useState<string[]>([]);
  const [bookingPoints, setBookingPoints] = useState<any>({});
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const fetchTrips = async (origin = 'TP. Hồ Chí Minh', destination = 'Đà Lạt') => {
    setLoading(true);
    try {
      const res = await api.get('/trips/search', {
        params: { origin, destination }
      });
      setTrips(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleSearch = (origin: string, destination: string, date: string) => {
    fetchTrips(origin, destination);
  };

  const handleOpenBooking = (trip: Trip, seats: string[], points: any) => {
    setBookingTrip(trip);
    setBookingSeats(seats);
    setBookingPoints(points);
  };

  return (
    <div>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        color: '#ffffff',
        padding: '64px 0 80px',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Đặt Vé Xe Khách Trực Tuyến - Nhanh Chóng & Giá Rẻ
          </h1>
          <p style={{ fontSize: '17px', color: '#bfdbfe', maxWidth: '600px', margin: '0 auto' }}>
            Cam kết 100% giữ chỗ ngồi. Chọn ghế trực tiếp trên sơ đồ 2 tầng. Hỗ trợ thanh toán tiền mặt COD khi lên xe!
          </p>
        </div>
      </div>

      <div className="container">
        <SearchTripBar onSearch={handleSearch} />

        {/* Value Proposition */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          margin: '36px 0'
        }}>
          <div style={{ backgroundColor: '#fff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Award size={32} color="#2563eb" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Nhà xe uy tín</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Phương Trang, Thành Bưởi, Sao Việt</div>
            </div>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <ShieldCheck size={32} color="#10b981" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Cam kết 100% giữ chỗ</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Hoàn tiền 150% nếu nhà xe hủy chỗ</div>
            </div>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Clock size={32} color="#f97316" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Hỗ trợ 24/7</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Hotline & Trợ lý thông minh AI</div>
            </div>
          </div>
        </div>

        {/* Trip Results */}
        <div style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px', color: '#1e293b' }}>
            Danh Sách Chuyến Xe ({trips.length} chuyến)
          </h2>

          {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Đang tìm chuyến xe...</div>}

          {!loading && trips.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '12px' }}>
              Không tìm thấy chuyến xe phù hợp. Vui lòng chọn ngày khác hoặc tuyến khác!
            </div>
          )}

          {!loading && trips.map(t => (
            <TripCard key={t.id} trip={t} onBook={handleOpenBooking} />
          ))}
        </div>
      </div>

      {/* Checkout Modal */}
      {bookingTrip && (
        <CheckoutModal 
          trip={bookingTrip}
          selectedSeats={bookingSeats}
          points={bookingPoints}
          onClose={() => setBookingTrip(null)}
          onSuccess={(b) => {
            setBookingTrip(null);
            setConfirmedBooking(b);
          }}
        />
      )}

      {/* Booking Success Modal */}
      {confirmedBooking && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 110, padding: '16px'
        }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '32px', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
            <CheckCircle size={56} color="#10b981" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>
              Đặt Vé Thành Công!
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
              Cảm ơn quý khách đã tin tưởng dịch vụ TravelEasy Platform.
            </p>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', textAlign: 'left', fontSize: '14px', marginBottom: '20px' }}>
              <div>Mã đặt vé: <strong style={{ color: '#2563eb' }}>{confirmedBooking.bookingCode}</strong></div>
              <div>Hành khách: <strong>{confirmedBooking.customerName}</strong> ({confirmedBooking.customerPhone})</div>
              <div>Tuyến xe: <strong>{confirmedBooking.trip.originCity} ➔ {confirmedBooking.trip.destinationCity}</strong></div>
              <div>Ghế: <strong>{confirmedBooking.tickets.map(t => t.seatNumber).join(', ')}</strong></div>
              <div>Tổng tiền: <strong style={{ color: '#f97316' }}>{confirmedBooking.totalAmount.toLocaleString('vi-VN')} đ</strong></div>
              <div>Thanh toán: <strong>{confirmedBooking.paymentMethod === 'CASH_ON_BOARD' ? 'Tiền mặt khi lên xe' : 'Chuyển khoản'}</strong></div>
            </div>

            <button
              onClick={() => setConfirmedBooking(null)}
              style={{
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                width: '100%'
              }}
            >
              Hoàn Tất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
