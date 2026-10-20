import React, { useState, useEffect } from 'react';
import { SearchTripBar } from '../components/SearchTripBar';
import { TripCard } from '../components/TripCard';
import { CheckoutModal } from '../components/CheckoutModal';
import { Trip, Booking } from '../types';
import api from '../services/api';
import { Filter, SlidersHorizontal, ArrowLeft, Bus, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TripSearchPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(500000);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('ALL');

  const [bookingTrip, setBookingTrip] = useState<Trip | null>(null);
  const [bookingSeats, setBookingSeats] = useState<string[]>([]);
  const [bookingPoints, setBookingPoints] = useState<any>({});

  const fetchTrips = async (origin = 'TP. Hồ Chí Minh', destination = 'Đà Lạt') => {
    setLoading(true);
    try {
      const res = await api.get('/trips/search', { params: { origin, destination } });
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

  const filteredTrips = trips.filter(t => {
    if (selectedCompany !== 'ALL' && !t.busCompanyName.toLowerCase().includes(selectedCompany.toLowerCase())) {
      return false;
    }
    if (t.price > maxPrice) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '24px 0 64px' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '13px' }}>
          <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={14} /> Trang Chủ
          </Link>
          <span style={{ color: '#94a3b8' }}>/</span>
          <span style={{ color: '#64748b' }}>Tìm Kiếm & Bộ Lọc Nâng Cao (UC-1.4 & UC-1.5)</span>
        </div>

        <SearchTripBar onSearch={(o, d) => fetchTrips(o, d)} />

        {/* Content with Sidebar Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', marginTop: '32px' }}>
          {/* Sidebar Filter */}
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <Filter size={20} color="#2563eb" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>Bộ Lọc Thông Minh</h3>
            </div>

            {/* Filter Nhà Xe */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                Hãng Xe Đối Tác
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="radio" name="company" checked={selectedCompany === 'ALL'} onChange={() => setSelectedCompany('ALL')} />
                  Tất cả nhà xe
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="radio" name="company" checked={selectedCompany === 'Phương Trang'} onChange={() => setSelectedCompany('Phương Trang')} />
                  Phương Trang (FUTA)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="radio" name="company" checked={selectedCompany === 'Thành Bưởi'} onChange={() => setSelectedCompany('Thành Bưởi')} />
                  Thành Bưởi Limousine
                </label>
              </div>
            </div>

            {/* Filter Giá Vé */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Giá Vé Tối Đa</label>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(maxPrice)}
                </span>
              </div>
              <input 
                type="range" 
                min="200000" 
                max="500000" 
                step="20000" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(Number(e.target.value))} 
                style={{ width: '100%' }}
              />
            </div>

            {/* Khung giờ chạy */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                Khung Giờ Xuất Bến
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={() => setSelectedTimeSlot('MORNING')}
                  style={{ textAlign: 'left', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: selectedTimeSlot === 'MORNING' ? '#eff6ff' : '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Sáng (06:00 - 12:00)
                </button>
                <button 
                  onClick={() => setSelectedTimeSlot('EVENING')}
                  style={{ textAlign: 'left', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: selectedTimeSlot === 'EVENING' ? '#eff6ff' : '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Tối (18:00 - 24:00) - Đi đêm
                </button>
              </div>
            </div>
          </div>

          {/* Trips Result List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
                Kết Quả Tìm Thấy ({filteredTrips.length} chuyến xe)
              </h2>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Đã sắp xếp theo giá tốt nhất</span>
            </div>

            {filteredTrips.length === 0 ? (
              <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b' }}>Không có chuyến nào khớp với bộ lọc. Hãy nới lỏng mức giá hoặc chọn nhà xe khác!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredTrips.map(trip => (
                  <TripCard 
                    key={trip.id} 
                    trip={trip} 
                    onBook={(t, seats, points) => {
                      setBookingTrip(t);
                      setBookingSeats(seats);
                      setBookingPoints(points);
                    }} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {bookingTrip && (
        <CheckoutModal
          trip={bookingTrip}
          selectedSeats={bookingSeats}
          points={bookingPoints}
          onClose={() => setBookingTrip(null)}
          onSuccess={() => {
            setBookingTrip(null);
            fetchTrips();
          }}
        />
      )}
    </div>
  );
};

export default TripSearchPage;
