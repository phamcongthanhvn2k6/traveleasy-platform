import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BusSeatMap } from '../components/BusSeatMap';
import api from '../services/api';
import { Trip, TripSeat, Point } from '../types';
import { Clock, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle, Bus } from 'lucide-react';

export const SeatSelectionPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [seats, setSeats] = useState<TripSeat[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes TTL
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = tripId || '1';
    setLoading(true);
    api.get(`/trips/${id}`).then(res => {
      if (res.data.data.trip) {
        setTrip(res.data.data.trip);
        setSeats(res.data.data.seats || []);
        setPoints(res.data.data.pickupPoints || []);
      } else {
        setTrip(res.data.data);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [tripId]);

  // Countdown timer 10:00
  useEffect(() => {
    if (selectedSeats.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Thời gian giữ chỗ 10 phút đã hết hạn! Ghế đã được nhả ra.');
          setSelectedSeats([]);
          return 600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedSeats.length]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeatToggle = (seatCode: string) => {
    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatCode));
    } else {
      if (selectedSeats.length >= 4) {
        alert('Mỗi giao dịch chỉ được chọn tối đa 4 ghế!');
        return;
      }
      setSelectedSeats([...selectedSeats, seatCode]);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '24px 0 64px' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '13px' }}>
          <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={14} /> Trang Chủ
          </Link>
          <span style={{ color: '#94a3b8' }}>/</span>
          <span style={{ color: '#64748b' }}>Sơ Đồ Chọn Ghế 2 Tầng Trực Quan (UC-1.6)</span>
        </div>

        {/* Trip Header Card */}
        {trip && (
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '3px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px' }}>
                CHUYẾN XE #{trip.id} • {trip.busType}
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                {trip.busCompanyName} — {trip.originCity || trip.departureLocation} ➔ {trip.destinationCity || trip.arrivalLocation}
              </h2>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                Khởi hành: <strong>{trip.departureTime.replace('T', ' ')}</strong> (Dự kiến đến: {trip.arrivalTime.replace('T', ' ')})
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '10px 16px', borderRadius: '8px' }}>
                <Clock size={20} color="#ea580c" />
                <div>
                  <div style={{ fontSize: '11px', color: '#9a3412', fontWeight: 700 }}>THỜI GIAN GIỮ CHỖ CÒN LẠI</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#c2410c' }}>{formatTimer(timeLeft)}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Seat Map Interaction */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>
              Sơ Đồ 34 Phòng Limousine VIP (Tầng 1 & Tầng 2)
            </h3>
            {seats.length > 0 ? (
              <BusSeatMap 
                seats={seats}
                selectedSeatNumbers={selectedSeats}
                onToggleSeat={handleSeatToggle}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                Đang tải dữ liệu sơ đồ ghế 2 tầng...
              </div>
            )}
          </div>

          {/* Booking Summary Box */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              Tóm Tắt Đặt Chỗ
            </h3>

            <div style={{ fontSize: '14px', marginBottom: '12px' }}>
              <div style={{ color: '#64748b', marginBottom: '4px' }}>Ghế đã chọn:</div>
              {selectedSeats.length === 0 ? (
                <div style={{ fontStyle: 'italic', color: '#94a3b8' }}>Chưa chọn ghế nào</div>
              ) : (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {selectedSeats.map(s => (
                    <span key={s} style={{ backgroundColor: '#ffedd5', color: '#c2410c', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#475569' }}>Tổng tiền tạm tính:</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((trip?.price || 320000) * selectedSeats.length)}
                </span>
              </div>
            </div>

            <button
              disabled={selectedSeats.length === 0}
              onClick={() => navigate('/checkout', { state: { trip, selectedSeats } })}
              style={{
                width: '100%',
                backgroundColor: selectedSeats.length > 0 ? '#2563eb' : '#cbd5e1',
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: selectedSeats.length > 0 ? 'pointer' : 'not-allowed'
              }}
            >
              Tiếp Tục Đặt Vé <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;

