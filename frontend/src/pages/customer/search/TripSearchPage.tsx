import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { Trip, Booking } from '../../../types';
import { TripSearchHeader } from './components/TripSearchHeader';
import { FilterSidebar, FilterState } from './components/FilterSidebar';
import { SortTabBar, SortOption } from './components/SortTabBar';
import { TripResultCard } from './components/TripResultCard';
import { CheckoutModal } from '../../../components/CheckoutModal';
import { toast } from '../../../context/ToastContext';
import { Bus, AlertCircle } from 'lucide-react';

export const TripSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const origin = searchParams.get('origin') || 'TP. Hồ Chí Minh';
  const destination = searchParams.get('destination') || 'Đà Lạt';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  // Sorting and Filtering State
  const [sortOption, setSortOption] = useState<SortOption>('DEFAULT');
  const [filters, setFilters] = useState<FilterState>({
    timeSlots: [],
    priceRanges: [],
    busTypes: [],
    companies: [],
  });

  // Booking Modal State
  const [bookingTrip, setBookingTrip] = useState<Trip | null>(null);
  const [bookingSeats, setBookingSeats] = useState<string[]>([]);
  const [bookingPoints, setBookingPoints] = useState<any>({});
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const fetchTrips = async (orig: string, dest: string, depDate: string) => {
    setLoading(true);
    try {
      const res = await api.get('/trips/search', {
        params: {
          origin: orig,
          destination: dest,
          departureDate: depDate,
        },
      });

      const data = res.data?.data || [];
      setTrips(data);

      if (data.length > 0) {
        toast.success(`Tìm thấy ${data.length} chuyến xe từ ${orig} đến ${dest}!`, 'Kết Quả');
      } else {
        toast.info(`Không có chuyến xe trực tiếp ngày ${depDate}. Đang gợi ý chuyến gần nhất.`, 'Thông Báo');
      }
    } catch (err) {
      console.error('Failed to search trips:', err);
      toast.error('Lỗi khi tải danh sách chuyến xe. Vui lòng thử lại!', 'Lỗi');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips(origin, destination, date);
  }, [origin, destination, date]);

  const handleSearchChange = (newOrigin: string, newDestination: string, newDate: string) => {
    setSearchParams({
      origin: newOrigin,
      destination: newDestination,
      date: newDate,
    });
  };

  // Get list of unique available companies for sidebar
  const availableCompanies = useMemo(() => {
    const set = new Set<string>();
    trips.forEach((t) => {
      if (t.busCompanyName) set.add(t.busCompanyName);
    });
    return Array.from(set);
  }, [trips]);

  // Filter and Sort Trips
  const filteredAndSortedTrips = useMemo(() => {
    return trips
      .filter((t) => {
        // 1. Time slot filter
        if (filters.timeSlots.length > 0) {
          try {
            const hour = new Date(t.departureTime).getHours();
            const isEarly = hour >= 0 && hour < 6;
            const isMorning = hour >= 6 && hour < 12;
            const isAfternoon = hour >= 12 && hour < 18;
            const isEvening = hour >= 18 && hour < 24;

            const matchesEarly = filters.timeSlots.includes('EARLY') && isEarly;
            const matchesMorning = filters.timeSlots.includes('MORNING') && isMorning;
            const matchesAfternoon = filters.timeSlots.includes('AFTERNOON') && isAfternoon;
            const matchesEvening = filters.timeSlots.includes('EVENING') && isEvening;

            if (!matchesEarly && !matchesMorning && !matchesAfternoon && !matchesEvening) {
              return false;
            }
          } catch {
            // Keep if parse fails
          }
        }

        // 2. Price range filter
        if (filters.priceRanges.length > 0) {
          const isUnder300 = t.price < 300000;
          const is300to400 = t.price >= 300000 && t.price <= 400000;
          const isOver400 = t.price > 400000;

          const matchUnder = filters.priceRanges.includes('UNDER_300') && isUnder300;
          const match300to400 = filters.priceRanges.includes('FROM_300_TO_400') && is300to400;
          const matchOver = filters.priceRanges.includes('OVER_400') && isOver400;

          if (!matchUnder && !match300to400 && !matchOver) {
            return false;
          }
        }

        // 3. Bus type filter
        if (filters.busTypes.length > 0) {
          if (!filters.busTypes.includes(t.busType)) {
            return false;
          }
        }

        // 4. Company filter
        if (filters.companies.length > 0) {
          if (!filters.companies.includes(t.busCompanyName)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'EARLIEST') {
          return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
        }
        if (sortOption === 'LATEST') {
          return new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime();
        }
        if (sortOption === 'PRICE_ASC') {
          return a.price - b.price;
        }
        if (sortOption === 'PRICE_DESC') {
          return b.price - a.price;
        }
        return 0; // DEFAULT
      });
  }, [trips, filters, sortOption]);

  const handleResetFilters = () => {
    setFilters({
      timeSlots: [],
      priceRanges: [],
      busTypes: [],
      companies: [],
    });
    toast.info('Đã hoàn tác toàn bộ bộ lọc!', 'Đặt Lại');
  };

  const handleOpenBooking = (trip: Trip, seats: string[], points: any) => {
    setBookingTrip(trip);
    setBookingSeats(seats);
    setBookingPoints(points);
  };

  const handleBookingSuccess = (booking: Booking) => {
    setConfirmedBooking(booking);
    setBookingTrip(null);
    toast.success(`Đặt vé thành công! Mã đơn: ${booking.bookingCode}`, 'Thành Công');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '80vh', paddingBottom: '60px' }}>
      {/* 1. Header with Title & Date Switcher */}
      <TripSearchHeader
        origin={origin}
        destination={destination}
        departureDate={date}
        totalTrips={filteredAndSortedTrips.length}
        onSearchChange={handleSearchChange}
      />

      {/* 2. Main Body Grid: Left Sidebar & Right Results */}
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left: Filter Sidebar */}
        <div>
          <FilterSidebar
            filters={filters}
            availableCompanies={availableCompanies}
            onChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Right: Sort Tab Bar & Trips List */}
        <div>
          <SortTabBar
            currentSort={sortOption}
            onChangeSort={setSortOption}
            resultCount={filteredAndSortedTrips.length}
          />

          {loading ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '60px 20px',
                textAlign: 'center',
                color: '#64748b',
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Đang tìm kiếm chuyến xe tốt nhất cho bạn...
              </div>
              <div style={{ fontSize: '13px' }}>
                Vui lòng đợi trong giây lát để hệ thống kết nối với các đối tác nhà xe.
              </div>
            </div>
          ) : filteredAndSortedTrips.length > 0 ? (
            <div>
              {filteredAndSortedTrips.map((trip) => (
                <TripResultCard key={trip.id} trip={trip} onBook={handleOpenBooking} />
              ))}
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '50px 20px',
                textAlign: 'center',
              }}
            >
              <AlertCircle size={40} color="#94a3b8" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                Không tìm thấy chuyến xe nào phù hợp
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: '0 auto 16px auto' }}>
                Hãy thử nới lỏng các tiêu chí bộ lọc (khung giờ, loại xe, mức giá) hoặc chọn một ngày khởi hành khác.
              </p>
              <button
                onClick={handleResetFilters}
                style={{
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Đặt lại tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Checkout Modal */}
      {bookingTrip && (
        <CheckoutModal
          trip={bookingTrip}
          selectedSeats={bookingSeats}
          points={bookingPoints}
          onClose={() => setBookingTrip(null)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Confirmed Booking Success Notification Dialog */}
      {confirmedBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              padding: '28px',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                fontSize: '28px',
              }}
            >
              ✓
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Đặt Vé Xe Thành Công!
            </h3>

            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
              Mã đặt vé của bạn là <strong style={{ color: '#2563eb' }}>{confirmedBooking.bookingCode}</strong>.
              Hệ thống đã gửi thông tin xác nhận qua Email và SMS.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  navigate(`/tickets/${confirmedBooking.bookingCode}`);
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Xem Vé Điện Tử (QR)
              </button>

              <button
                onClick={() => setConfirmedBooking(null)}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
