import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { Trip, Booking } from '../../../types';
import { TripSearchHeader } from './components/TripSearchHeader';
import { FilterSidebar, FilterState } from './components/FilterSidebar';
import { SortTabBar, SortOption } from './components/SortTabBar';
import { TripResultCard } from './components/TripResultCard';
import { Pagination } from '../../../components/Pagination';
import { CheckoutModal } from '../../../components/CheckoutModal';
import { toast } from '../../../context/ToastContext';
import { useTheme } from '../../../context/ThemeContext';
import { Bus, AlertCircle } from 'lucide-react';

// Bộ nhớ đệm Client-side SWR: Giữ kết quả tìm kiếm trong RAM và SessionStorage để hiển thị tức thì (0ms)
const tripSearchClientCache = new Map<string, { data: Trip[]; timestamp: number }>();

const getSessionSearchCache = (key: string): { data: Trip[]; timestamp: number } | null => {
  try {
    const raw = sessionStorage.getItem(`trip_search_${key}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
};

const setSessionSearchCache = (key: string, item: { data: Trip[]; timestamp: number }) => {
  try {
    sessionStorage.setItem(`trip_search_${key}`, JSON.stringify(item));
  } catch (e) {}
};

export const TripSearchPage: React.FC = () => {
  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || '';
  const companyParam = searchParams.get('company') || '';

  // Khởi tạo ngay lập tức từ RAM hoặc SessionStorage để tải trang 0ms không bao giờ chớp màn hình
  const initialCacheKey = `${origin}_${destination}_${date}`;
  const initialCached = tripSearchClientCache.get(initialCacheKey) || getSessionSearchCache(initialCacheKey);

  const [trips, setTrips] = useState<Trip[]>(() => (initialCached ? initialCached.data : []));
  const [loading, setLoading] = useState<boolean>(() => !initialCached);

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
    const cacheKey = `${orig}_${dest}_${depDate}`;
    const cached = tripSearchClientCache.get(cacheKey) || getSessionSearchCache(cacheKey);
    const now = Date.now();

    // 1. Instant Cache Hit: Hiển thị ngay lập tức (0ms) nếu đã tải trong vòng 10 phút
    if (cached && (now - cached.timestamp < 600_000)) {
      setTrips(cached.data);
      if (!tripSearchClientCache.has(cacheKey)) {
        tripSearchClientCache.set(cacheKey, cached);
      }
      setLoading(false);
      return;
    }

    // 2. Optimistic Rendering: Nếu có dữ liệu trong cache cũ, hiển thị trước và không bật loading spinner
    if (cached) {
      setTrips(cached.data);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const params: Record<string, string> = {};
      if (orig && orig.trim() !== '') params.origin = orig.trim();
      if (dest && dest.trim() !== '') params.destination = dest.trim();
      if (depDate && depDate.trim() !== '') params.departureDate = depDate.trim();

      const res = await api.get('/trips/search', { params });

      const data = res.data?.data || [];
      setTrips(data);
      const cacheItem = { data, timestamp: Date.now() };
      tripSearchClientCache.set(cacheKey, cacheItem);
      setSessionSearchCache(cacheKey, cacheItem);

      // Chỉ hiển thị toast nếu chưa có cache hiển thị trước đó để tránh trùng lặp
      if (!cached && data.length > 0) {
        if (!orig && !dest) {
          toast.success(`Đang hiển thị toàn bộ ${data.length} chuyến xe toàn quốc!`, 'Tất Cả Chuyến Xe');
        } else if (orig && dest) {
          toast.success(`Tìm thấy ${data.length} chuyến xe từ ${orig} đến ${dest}!`, 'Kết Quả');
        } else if (orig) {
          toast.success(`Tìm thấy ${data.length} chuyến xe xuất phát từ ${orig}!`, 'Kết Quả');
        } else {
          toast.success(`Tìm thấy ${data.length} chuyến xe đến ${dest}!`, 'Kết Quả');
        }
      } else if (!cached && data.length === 0) {
        toast.info('Không tìm thấy chuyến xe nào phù hợp. Vui lòng thử nới lỏng bộ lọc!', 'Thông Báo');
      }
    } catch (err) {
      console.error('Failed to search trips:', err);
      toast.error('Lỗi khi tải danh sách chuyến xe. Vui lòng thử lại!', 'Lỗi');
      if (!cached) setTrips([]);
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
    const map = new Map<string, { name: string; address?: string; count: number }>();
    trips.forEach((t) => {
      if (t.pickupPoints && t.pickupPoints.length > 0) {
        t.pickupPoints.forEach((p) => {
          const existing = map.get(p.name);
          if (existing) {
            existing.count += 1;
            if (!existing.address && p.address) existing.address = p.address;
          } else {
            map.set(p.name, { name: p.name, address: p.address, count: 1 });
          }
        });
      }
    });

    if (map.size === 0 && trips.length > 0) {
      const originCity = origin || trips[0].originCity || 'Điểm Đi';
      map.set(`Bến xe Trung Tâm ${originCity}`, {
        name: `Bến xe Trung Tâm ${originCity}`,
        address: `Khu vực bến xe trung tâm ${originCity}`,
        count: trips.length,
      });
      map.set(`Văn phòng đại diện ${originCity}`, {
        name: `Văn phòng đại diện ${originCity}`,
        address: `Trục đường chính nội đô ${originCity}`,
        count: Math.ceil(trips.length * 0.5),
      });
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [trips, origin]);

  const availableDropoffPoints = useMemo(() => {
    const map = new Map<string, { name: string; address?: string; count: number }>();
    trips.forEach((t) => {
      if (t.dropoffPoints && t.dropoffPoints.length > 0) {
        t.dropoffPoints.forEach((p) => {
          const existing = map.get(p.name);
          if (existing) {
            existing.count += 1;
            if (!existing.address && p.address) existing.address = p.address;
          } else {
            map.set(p.name, { name: p.name, address: p.address, count: 1 });
          }
        });
      }
    });

    if (map.size === 0 && trips.length > 0) {
      const destCity = destination || trips[0].destinationCity || 'Điểm Đến';
      map.set(`Bến xe Liên Tỉnh ${destCity}`, {
        name: `Bến xe Liên Tỉnh ${destCity}`,
        address: `Cửa ngõ đón trả khách liên tỉnh ${destCity}`,
        count: trips.length,
      });
      map.set(`Nội thành ${destCity}`, {
        name: `Nội thành ${destCity}`,
        address: `Các điểm đón trả nội thành ${destCity}`,
        count: Math.ceil(trips.length * 0.6),
      });
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
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

      const tripRating = t.busCompanyRating ?? (t.busType === 'LIMOUSINE' ? 4.9 : 4.6);
      if (tripRating >= 4.5) {
        rating45++;
      }
      if (tripRating >= 4.0) {
        rating40++;
      }
      if (t.busType === 'LIMOUSINE') {
        xeXin++;
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
        // 1. Time filter (Preset Slots OR Time Range Slider)
        try {
          const d = new Date(t.departureTime);
          const h = d.getHours() + d.getMinutes() / 60;

          if (filters.timeSlots.length > 0) {
            const isEarly = h >= 0 && h < 6;
            const isMorning = h >= 6 && h < 12;
            const isAfternoon = h >= 12 && h < 18;
            const isEvening = h >= 18 && h <= 24;

            const matchesSlot =
              (filters.timeSlots.includes('EARLY') && isEarly) ||
              (filters.timeSlots.includes('MORNING') && isMorning) ||
              (filters.timeSlots.includes('AFTERNOON') && isAfternoon) ||
              (filters.timeSlots.includes('EVENING') && isEvening);

            if (!matchesSlot) return false;
          } else {
            if (h < filters.timeRange[0] || h > filters.timeRange[1]) {
              return false;
            }
          }
        } catch {}

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

        // 4. Company filter
        if (filters.companies.length > 0) {
          const matched = filters.companies.some(
            (c) => t.busCompanyName && (t.busCompanyName === c || t.busCompanyName.toLowerCase().includes(c.toLowerCase()))
          );
          if (!matched) {
            return false;
          }
        }

        // 5b. Pickup point filter
        if (filters.pickupPoints.length > 0) {
          if (t.pickupPoints && t.pickupPoints.length > 0) {
            const hasPickup = t.pickupPoints.some((p) => filters.pickupPoints.includes(p.name));
            if (!hasPickup) return false;
          } else {
            const originCity = origin || t.originCity || '';
            const matchesOrigin = filters.pickupPoints.some((pt) => pt.toLowerCase().includes(originCity.toLowerCase()));
            if (!matchesOrigin) return false;
          }
        }

        // 5c. Dropoff point filter
        if (filters.dropoffPoints.length > 0) {
          if (t.dropoffPoints && t.dropoffPoints.length > 0) {
            const hasDropoff = t.dropoffPoints.some((p) => filters.dropoffPoints.includes(p.name));
            if (!hasDropoff) return false;
          } else {
            const destCity = destination || t.destinationCity || '';
            const matchesDest = filters.dropoffPoints.some((pt) => pt.toLowerCase().includes(destCity.toLowerCase()));
            if (!matchesDest) return false;
          }
        }

        // 6. Rating filter
        if (filters.minRating !== null) {
          const tripRating = t.busCompanyRating ?? (t.busType === 'LIMOUSINE' ? 4.9 : 4.6);
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
        const timeA = new Date(a.departureTime).getTime();
        const timeB = new Date(b.departureTime).getTime();
        const hourMinA = new Date(a.departureTime).getHours() * 60 + new Date(a.departureTime).getMinutes();
        const hourMinB = new Date(b.departureTime).getHours() * 60 + new Date(b.departureTime).getMinutes();
        const ratingA = a.busCompanyRating ?? (a.busType === 'LIMOUSINE' ? 4.9 : 4.6);
        const ratingB = b.busCompanyRating ?? (b.busType === 'LIMOUSINE' ? 4.9 : 4.6);

        // 1. Giờ đi sớm nhất
        if (sortOption === 'EARLIEST') {
          if (timeA !== timeB) return timeA - timeB;
          return a.price - b.price;
        }

        // 2. Giờ đi muộn nhất (Trong cùng ngày: giờ muộn hơn lên trước; Khác ngày: ngày gần lên trước)
        if (sortOption === 'LATEST') {
          const dateA = a.departureTime.split('T')[0];
          const dateB = b.departureTime.split('T')[0];
          if (dateA === dateB) {
            if (hourMinB !== hourMinA) return hourMinB - hourMinA;
            return a.price - b.price;
          }
          return dateA.localeCompare(dateB) || (hourMinB - hourMinA);
        }

        // 3. Giá tăng dần (Ưu tiên rẻ nhất, bằng giá thì giờ sớm lên trước)
        if (sortOption === 'PRICE_ASC') {
          if (a.price !== b.price) return a.price - b.price;
          return timeA - timeB;
        }

        // 4. Giá giảm dần (Ưu tiên giá cao nhất, bằng giá thì giờ sớm lên trước)
        if (sortOption === 'PRICE_DESC') {
          if (b.price !== a.price) return b.price - a.price;
          return timeA - timeB;
        }

        // 5. Đánh giá cao nhất (Đánh giá cao lên trước, bằng sao thì giờ sớm lên trước)
        if (sortOption === 'RATING_DESC') {
          if (ratingB !== ratingA) return ratingB - ratingA;
          return timeA - timeB;
        }

        // 6. Mặc định (Khởi hành sớm lên trước, ưu tiên nhà xe đánh giá cao và giá tốt)
        if (timeA !== timeB) return timeA - timeB;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return a.price - b.price;
      });
  }, [trips, filters, sortOption]);

  // Pagination State (mặc định 20 chuyến / trang, chia theo tổng số chuyến)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Reset to page 1 whenever search criteria or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortOption, origin, destination, date]);

  const totalItems = filteredAndSortedTrips.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedTrips.slice(start, start + pageSize);
  }, [filteredAndSortedTrips, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

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
    setCurrentPage(1);
    toast.info('Đã hoàn tác toàn bộ bộ lọc và sắp xếp!', 'Đặt Lại');
  };

  const handleOpenBooking = (trip: Trip, seats: string[], points: any) => {
    const token = localStorage.getItem('traveleasy_token');
    const checkoutPayload = { trip, selectedSeats: seats, points };
    try {
      sessionStorage.setItem('traveleasy_checkout_data', JSON.stringify(checkoutPayload));
    } catch (e) {
      console.warn(e);
    }

    if (!token) {
      toast.warning('Quý khách vui lòng đăng nhập để tiến hành đặt vé và thanh toán! Khách chưa đăng nhập chỉ có thể tra cứu thông tin.', 'Yêu Cầu Đăng Nhập');
      navigate('/login?redirect=/checkout', { state: checkoutPayload });
      return;
    }

    navigate('/checkout', { state: checkoutPayload });
  };

  const handleBookingSuccess = (booking: Booking) => {
    setConfirmedBooking(booking);
    setBookingTrip(null);
    toast.success(`Đặt vé thành công! Mã đơn: ${booking.bookingCode}`, 'Thành Công');
  };

  return (
    <div style={{
      backgroundColor: isDark ? '#0b0f19' : '#f8fafc',
      color: isDark ? '#f8fafc' : '#0f172a',
      minHeight: '80vh',
      paddingBottom: '60px',
      transition: 'background-color 0.25s ease, color 0.25s ease'
    }}>
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
          {searchParams.get('voucher') && (
            <div
              style={{
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '12px',
                padding: '12px 18px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>🎁</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#c2410c' }}>
                    Bạn đang săn ưu đãi [ mã: {searchParams.get('voucher')} ]
                  </div>
                  <div style={{ fontSize: '12px', color: '#9a3412' }}>
                    Chọn chuyến xe bạn yêu thích và tiến hành đặt chỗ. Mã ưu đãi sẽ được áp dụng tự động tại bước thanh toán!
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#ea580c',
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  whiteSpace: 'nowrap',
                }}
              >
                ĐÃ ÁP DỤNG MÃ
              </span>
            </div>
          )}

          <SortTabBar
            currentSort={sortOption}
            onChangeSort={setSortOption}
            resultCount={filteredAndSortedTrips.length}
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
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
          ) : paginatedTrips.length > 0 ? (
            <div>
              {paginatedTrips.map((trip) => (
                <TripResultCard key={trip.id} trip={trip} onBook={handleOpenBooking} />
              ))}

              {/* Phân trang (Pagination: 20 chuyến / trang, chia theo tổng số) */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[20, 40, 60]}
                itemLabel="chuyến xe"
              />
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

