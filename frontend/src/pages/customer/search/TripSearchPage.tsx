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

  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || '';
  const companyParam = searchParams.get('company') || '';

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  // Sorting and Filtering State
  const [sortOption, setSortOption] = useState<SortOption>('DEFAULT');
  const [filters, setFilters] = useState<FilterState>({
    timeRange: [0, 24],
    timeSlots: [],
    priceRanges: [],
    busTypes: [],
    companies: companyParam ? [companyParam] : [],
    pickupPoints: [],
    dropoffPoints: [],
    minRating: null,
    popularTags: [],
  });

  useEffect(() => {
    if (companyParam) {
      setFilters((prev) => ({
        ...prev,
        companies: prev.companies.some((c) => c.toLowerCase() === companyParam.toLowerCase())
          ? prev.companies
          : [...prev.companies, companyParam],
      }));
    }
  }, [companyParam]);

  // Booking Modal State
  const [bookingTrip, setBookingTrip] = useState<Trip | null>(null);
  const [bookingSeats, setBookingSeats] = useState<string[]>([]);
  const [bookingPoints, setBookingPoints] = useState<any>({});
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const fetchTrips = async (orig: string, dest: string, depDate: string) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (orig && orig.trim() !== '') params.origin = orig.trim();
      if (dest && dest.trim() !== '') params.destination = dest.trim();
      if (depDate && depDate.trim() !== '') params.departureDate = depDate.trim();

      const res = await api.get('/trips/search', { params });

      const data = res.data?.data || [];
      setTrips(data);

      if (data.length > 0) {
        if (!orig && !dest) {
          toast.success(`Đang hiển thị toàn bộ ${data.length} chuyến xe toàn quốc!`, 'Tất Cả Chuyến Xe');
        } else if (orig && dest) {
          toast.success(`Tìm thấy ${data.length} chuyến xe từ ${orig} đến ${dest}!`, 'Kết Quả');
        } else if (orig) {
          toast.success(`Tìm thấy ${data.length} chuyến xe xuất phát từ ${orig}!`, 'Kết Quả');
        } else {
          toast.success(`Tìm thấy ${data.length} chuyến xe đến ${dest}!`, 'Kết Quả');
        }
      } else {
        toast.info('Không tìm thấy chuyến xe nào phù hợp. Vui lòng thử nới lỏng bộ lọc!', 'Thông Báo');
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
    const nextParams: Record<string, string> = {};
    if (newOrigin && newOrigin.trim() !== '') nextParams.origin = newOrigin.trim();
    if (newDestination && newDestination.trim() !== '') nextParams.destination = newDestination.trim();
    if (newDate && newDate.trim() !== '') nextParams.date = newDate.trim();
    if (companyParam && companyParam.trim() !== '') nextParams.company = companyParam.trim();
    setSearchParams(nextParams);
  };

  // Dynamic Facets & Counts
  const availableCompanies = useMemo(() => {
    const counts: Record<string, number> = {};
    trips.forEach((t) => {
      if (t.busCompanyName) {
        counts[t.busCompanyName] = (counts[t.busCompanyName] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [trips]);

  const availablePickupPoints = useMemo(() => {
    const originCity = origin || (trips.length > 0 ? trips[0].originCity : '');
    const points: Record<string, number> = {};
    if (originCity.includes('Hồ Chí Minh') || originCity.includes('Sài Gòn')) {
      points['Bến xe Miền Tây'] = Math.ceil(trips.length * 0.6);
      points['Bến xe An Sương'] = Math.ceil(trips.length * 0.4);
      points['Văn phòng Quận 1 (Phạm Ngũ Lão)'] = Math.ceil(trips.length * 0.35);
      points['Ngã 4 Hàng Xanh'] = Math.ceil(trips.length * 0.5);
    } else if (originCity.includes('Hà Nội')) {
      points['Bến xe Mỹ Đình'] = Math.ceil(trips.length * 0.6);
      points['Bến xe Giáp Bát'] = Math.ceil(trips.length * 0.4);
      points['Văn phòng Phố Cổ'] = Math.ceil(trips.length * 0.3);
      points['Sân bay Nội Bài'] = Math.ceil(trips.length * 0.45);
    } else {
      points[`Bến xe Trung Tâm ${originCity || 'Điểm Đi'}`] = trips.length;
      points[`Văn phòng đại diện ${originCity || 'Điểm Đi'}`] = Math.ceil(trips.length * 0.5);
    }
    return Object.entries(points).map(([name, count]) => ({ name, count }));
  }, [trips, origin]);

  const availableDropoffPoints = useMemo(() => {
    const destCity = destination || (trips.length > 0 ? trips[0].destinationCity : '');
    const points: Record<string, number> = {};
    if (destCity.includes('Đà Lạt')) {
      points['Bến xe Liên tỉnh Đà Lạt'] = Math.ceil(trips.length * 0.8);
      points['Văn phòng Hồ Xuân Hương'] = Math.ceil(trips.length * 0.45);
      points['Chợ Đêm Đà Lạt (Trung chuyển)'] = Math.ceil(trips.length * 0.3);
    } else if (destCity.includes('Sa Pa')) {
      points['Bến xe Sa Pa mới'] = Math.ceil(trips.length * 0.75);
      points['Nhà thờ Đá Sa Pa'] = Math.ceil(trips.length * 0.5);
    } else if (destCity.includes('Nha Trang')) {
      points['Bến xe phía Nam Nha Trang'] = Math.ceil(trips.length * 0.7);
      points['Văn phòng đường Trần Phú'] = Math.ceil(trips.length * 0.5);
    } else {
      points[`Bến xe Liên Tỉnh ${destCity || 'Điểm Đến'}`] = trips.length;
      points[`Nội thành ${destCity || 'Điểm Đến'}`] = Math.ceil(trips.length * 0.6);
    }
    return Object.entries(points).map(([name, count]) => ({ name, count }));
  }, [trips, destination]);

  const availableBusTypes = useMemo(() => {
    const limousineCount = trips.filter((t) => t.busType === 'LIMOUSINE').length;
    const sleeperCount = trips.filter((t) => t.busType === 'SLEEPER').length;
    const seatCount = trips.filter((t) => t.busType === 'SEAT' || t.busType === 'SEATER').length;

    return [
      { type: 'LIMOUSINE', name: 'Limousine 34 Phòng VIP', count: limousineCount },
      { type: 'SLEEPER', name: 'Giường Nằm Tiêu Chuẩn 40 Chỗ', count: sleeperCount },
      { type: 'SEAT', name: 'Ghế Ngồi Cao Cấp 29 Chỗ', count: seatCount },
    ].filter((bt) => bt.count > 0 || trips.length === 0);
  }, [trips]);

  const facetCounts = useMemo(() => {
    let under300 = 0;
    let from300to400 = 0;
    let over400 = 0;
    let early = 0;
    let morning = 0;
    let afternoon = 0;
    let evening = 0;
    let xeXin = 0;
    let instant = trips.length;
    let moneyBack = trips.length;
    let rating45 = 0;
    let rating40 = trips.length;

    trips.forEach((t) => {
      if (t.price < 300000) under300++;
      else if (t.price <= 400000) from300to400++;
      else over400++;

      try {
        const d = new Date(t.departureTime);
        const h = d.getHours();
        if (h >= 0 && h < 6) early++;
        else if (h >= 6 && h < 12) morning++;
        else if (h >= 12 && h < 18) afternoon++;
        else evening++;
      } catch {}

      if (t.busType === 'LIMOUSINE') {
        xeXin++;
        rating45++;
      } else if (t.price >= 350000) {
        rating45++;
      }
    });

    return {
      under300Count: under300,
      from300to400Count: from300to400,
      over400Count: over400,
      earlyCount: early,
      morningCount: morning,
      afternoonCount: afternoon,
      eveningCount: evening,
      xeXinCount: xeXin,
      instantCount: instant,
      moneyBackCount: moneyBack,
      rating45Count: rating45,
      rating40Count: rating40,
    };
  }, [trips]);

  // Filter and Sort Trips
  const filteredAndSortedTrips = useMemo(() => {
    return trips
      .filter((t) => {
        // 1. Time range slider filter (from hours to hours)
        try {
          const d = new Date(t.departureTime);
          const h = d.getHours() + d.getMinutes() / 60;
          if (h < filters.timeRange[0] || h > filters.timeRange[1]) {
            return false;
          }
        } catch {}

        // 2. Preset time slot filter
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
          } catch {}
        }

        // 3. Price range filter
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

        // 4. Bus type filter
        if (filters.busTypes.length > 0) {
          const matchBusType = filters.busTypes.some(
            (bt) =>
              bt === t.busType ||
              (bt === 'SEATER' && t.busType === 'SEAT') ||
              (bt === 'SEAT' && t.busType === 'SEATER')
          );
          if (!matchBusType) {
            return false;
          }
        }

        // 5. Company filter
        if (filters.companies.length > 0) {
          const matched = filters.companies.some(
            (c) => t.busCompanyName && (t.busCompanyName === c || t.busCompanyName.toLowerCase().includes(c.toLowerCase()))
          );
          if (!matched) {
            return false;
          }
        }

        // 6. Rating filter
        if (filters.minRating !== null) {
          const tripRating = t.busType === 'LIMOUSINE' ? 4.9 : 4.6;
          if (tripRating < filters.minRating) {
            return false;
          }
        }

        // 7. Popular tags
        if (filters.popularTags.length > 0) {
          if (filters.popularTags.includes('XE_XIN') && t.busType !== 'LIMOUSINE') {
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
        if (sortOption === 'RATING_DESC') {
          const ratingA = a.busType === 'LIMOUSINE' ? 4.9 : 4.6;
          const ratingB = b.busType === 'LIMOUSINE' ? 4.9 : 4.6;
          return ratingB - ratingA;
        }
        return 0; // DEFAULT
      });
  }, [trips, filters, sortOption]);

  const handleResetFilters = () => {
    setFilters({
      timeRange: [0, 24],
      timeSlots: [],
      priceRanges: [],
      busTypes: [],
      companies: [],
      pickupPoints: [],
      dropoffPoints: [],
      minRating: null,
      popularTags: [],
    });
    setSortOption('DEFAULT');
    toast.info('Đã hoàn tác toàn bộ bộ lọc và sắp xếp!', 'Đặt Lại');
  };

  const handleOpenBooking = (trip: Trip, seats: string[], points: any) => {
    const checkoutPayload = { trip, selectedSeats: seats, points };
    try {
      sessionStorage.setItem('traveleasy_checkout_data', JSON.stringify(checkoutPayload));
    } catch (e) {
      console.warn(e);
    }
    navigate('/checkout', { state: checkoutPayload });
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
            sortOption={sortOption}
            onSortChange={setSortOption}
            availableCompanies={availableCompanies}
            availablePickupPoints={availablePickupPoints}
            availableDropoffPoints={availableDropoffPoints}
            availableBusTypes={availableBusTypes}
            facetCounts={facetCounts}
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

