import React, { useState, useEffect } from 'react';
import { 
  Database, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Bus, 
  QrCode, 
  Zap, 
  Copy, 
  ExternalLink,
  Flame,
  Check,
  Ticket
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api, { clearApiCache } from '../../../services/api';

export interface SampleFixture {
  id: string;
  category: 'TRIP' | 'TICKET' | 'CARGO' | 'ERROR_BOUNDARY';
  title: string;
  description: string;
  badge: string;
  payload: Record<string, any>;
}

export interface DemoTrip {
  id: number;
  route: string;
  departureLocation?: string;
  arrivalLocation?: string;
  busCompany: string;
  licensePlate: string;
  departureTime: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
  status?: string;
  busType?: string;
}

export interface SampleBookingData {
  bookingCode: string;
  ticketCode: string;
  passengerName: string;
  passengerPhone?: string;
  qrCodeHash: string;
  tripRoute?: string;
  busCompany?: string;
}

export const SAMPLE_FIXTURES: SampleFixture[] = [
  {
    id: 'FIX-TRIP-01',
    category: 'TRIP',
    title: 'Chuyến xe Limousine VIP Hà Nội - Đà Nẵng',
    description: 'Dữ liệu chuẩn hợp lệ với 34 ghế, 32 ghế trống, đầy đủ điểm đón/trả và giá vé chuẩn 450.000đ.',
    badge: 'Hợp lệ (Standard)',
    payload: {
      tripId: 101,
      route: 'Hà Nội - Đà Nẵng',
      busType: 'LIMOUSINE',
      availableSeats: 32,
      price: 450000,
      departureTime: '18:30:00',
      status: 'SCHEDULED'
    }
  },
  {
    id: 'FIX-TRIP-02',
    category: 'TRIP',
    title: 'Chuyến xe Sài Gòn - Nha Trang (Cháy vé)',
    description: 'Trường hợp biên: 0 ghế trống (sold out), kiểm tra hành vi khóa nút đặt và hiển thị badge Hết vé.',
    badge: 'Biên: Kín chỗ (Sold Out)',
    payload: {
      tripId: 102,
      route: 'Sài Gòn - Nha Trang',
      busType: 'SLEEPER',
      availableSeats: 0,
      price: 320000,
      departureTime: '21:00:00',
      status: 'SOLD_OUT'
    }
  },
  {
    id: 'FIX-TICKET-01',
    category: 'TICKET',
    title: 'Vé xe điện tử QR Code (Đã thanh toán)',
    description: 'Mã vé BK-2026-9988, trạng thái PAID, có chữ ký bảo mật sẵn sàng quét tại cổng soát vé.',
    badge: 'Hợp lệ: Sẵn sàng quét',
    payload: {
      ticketCode: 'BK-2026-9988',
      passenger: 'Trần Minh Đức',
      phone: '0912***789',
      seatCode: 'A05',
      qrPayload: 'TVE_VERIFIED_BK-2026-9988_SECURE_TOKEN',
      status: 'PAID'
    }
  },
  {
    id: 'FIX-TICKET-02',
    category: 'TICKET',
    title: 'Vé quá hạn thanh toán (> 10 phút)',
    description: 'Trường hợp ghế bị treo đang giữ chỗ quá 10 phút, kiểm thử thuật toán tự động giải phóng ghế.',
    badge: 'Biên: Hết hạn giữ chỗ',
    payload: {
      ticketCode: 'BK-EXPIRED-001',
      seatCode: 'B02',
      holdExpiresAt: '2026-11-04T00:00:00Z',
      status: 'RELEASED_AUTO'
    }
  },
  {
    id: 'FIX-CARGO-01',
    category: 'CARGO',
    title: 'Vận đơn Bưu kiện Hầm xe Khách (Có tem QR)',
    description: 'Hàng hóa 15kg gồm tài liệu và linh kiện điện tử, tự động tính cước 120.000đ kèm tem QR dán kiện hàng.',
    badge: 'Nghiệp vụ Hầm xe',
    payload: {
      waybillCode: 'CG-889900',
      senderPhone: '0988112233',
      receiverPhone: '0977445566',
      weightKg: 15.0,
      fee: 120000,
      qrStamp: 'CARGO_QR_STAMP_CG-889900'
    }
  },
  {
    id: 'FIX-ERR-01',
    category: 'ERROR_BOUNDARY',
    title: 'Kịch bản lỗi mạng & Dữ liệu rỗng (Empty State)',
    description: 'Kiểm thử phản hồi giao diện khi API trả mã lỗi 500 hoặc danh sách rỗng 0 kết quả.',
    badge: 'Xử lý lỗi (Graceful)',
    payload: {
      simulateHttpCode: 500,
      errorMessage: 'Không thể kết nối đến máy chủ dữ liệu. Vui lòng thử lại sau giây lát.',
      fallbackMode: 'CACHE_OR_OFFLINE_BANNER'
    }
  }
];

const INITIAL_DEMO_TRIPS: DemoTrip[] = [
  {
    id: 101,
    route: 'Hà Nội - Đà Nẵng',
    departureLocation: 'Hà Nội',
    arrivalLocation: 'Đà Nẵng',
    busCompany: 'Phương Trang VIP',
    licensePlate: '29B-12345',
    departureTime: '18:30:00',
    totalSeats: 34,
    availableSeats: 32,
    price: 450000,
    status: 'SCHEDULED',
    busType: 'LIMOUSINE'
  },
  {
    id: 102,
    route: 'Sài Gòn - Nha Trang',
    departureLocation: 'Sài Gòn',
    arrivalLocation: 'Nha Trang',
    busCompany: 'FUTA Bus Lines',
    licensePlate: '51B-98765',
    departureTime: '21:00:00',
    totalSeats: 34,
    availableSeats: 0,
    price: 320000,
    status: 'SCHEDULED',
    busType: 'SLEEPER'
  },
  {
    id: 103,
    route: 'Hà Nội - Sa Pa',
    departureLocation: 'Hà Nội',
    arrivalLocation: 'Sa Pa',
    busCompany: 'Sao Việt Express',
    licensePlate: '24B-67890',
    departureTime: '06:30:00',
    totalSeats: 34,
    availableSeats: 1,
    price: 420000,
    status: 'SCHEDULED',
    busType: 'LIMOUSINE'
  }
];

export const TestFixturesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeFixture, setActiveFixture] = useState<SampleFixture>(SAMPLE_FIXTURES[0]);
  const [isResetting, setIsResetting] = useState(false);
  const [simulatedState, setSimulatedState] = useState<'IDLE' | 'LOADING' | 'EMPTY' | 'ERROR'>('IDLE');

  // Live Trip Simulator State
  const [trips, setTrips] = useState<DemoTrip[]>(INITIAL_DEMO_TRIPS);
  const [selectedTripId, setSelectedTripId] = useState<number>(101);
  const [customTripInput, setCustomTripInput] = useState<string>('');
  const [isLoadingTrips, setIsLoadingTrips] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  // Sample Booking / QR State
  const [sampleBooking, setSampleBooking] = useState<SampleBookingData | null>(null);
  const [qrImgFailed, setQrImgFailed] = useState<boolean>(false);

  const selectedTrip = trips.find(t => t.id === selectedTripId) || trips[0];

  const filteredFixtures = selectedCategory === 'ALL' 
    ? SAMPLE_FIXTURES 
    : SAMPLE_FIXTURES.filter(f => f.category === selectedCategory);

  const clearSearchCaches = (trip?: DemoTrip) => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('trip_search_') || key.startsWith('api_cache_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => sessionStorage.removeItem(k));
      clearApiCache();
    } catch {}
  };

  const fetchLiveTrips = async () => {
    setIsLoadingTrips(true);
    try {
      const res = await api.get('/demo/trips?limit=25', { skipCache: true, params: { _t: Date.now() } } as any);
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setTrips(res.data.data);
        if (!res.data.data.some((t: DemoTrip) => t.id === selectedTripId)) {
          setSelectedTripId(res.data.data[0].id);
        }
        toast.success(`Đã tải danh sách ${res.data.data.length} chuyến xe hoạt động từ hệ thống!`);
      }
    } catch {
      // Giữ nguyên dữ liệu khởi tạo mặc định nếu server đang chạy chế độ mock/offline
    } finally {
      setIsLoadingTrips(false);
    }
  };

  useEffect(() => {
    fetchLiveTrips();
  }, []);

  const updateTripInState = (updatedTrip: Partial<DemoTrip> & { id?: number; tripId?: number }) => {
    const targetId = updatedTrip.tripId || updatedTrip.id || selectedTripId;
    setTrips(prev => prev.map(t => {
      if (t.id === targetId) {
        return {
          ...t,
          availableSeats: updatedTrip.availableSeats !== undefined ? updatedTrip.availableSeats : t.availableSeats,
          totalSeats: updatedTrip.totalSeats !== undefined ? updatedTrip.totalSeats : t.totalSeats,
        };
      }
      return t;
    }));
  };

  const handleSelectTrip = (id: number) => {
    setSelectedTripId(id);
    setCustomTripInput('');
  };

  const handleApplyCustomTripId = async () => {
    const parsed = parseInt(customTripInput.trim(), 10);
    if (isNaN(parsed) || parsed <= 0) {
      toast.warning('Vui lòng nhập mã chuyến xe (Trip ID) là số nguyên dương hợp lệ!');
      return;
    }
    const existing = trips.find(t => t.id === parsed);
    if (existing) {
      setSelectedTripId(parsed);
      toast.info(`Đã chuyển sang chuyến xe #${parsed}!`);
      return;
    }

    try {
      const res = await api.get(`/trips/${parsed}`);
      const tripData = res.data?.data?.trip || res.data?.data;
      if (tripData) {
        const originCity = tripData.originCity || tripData.departureLocation || 'Hà Nội';
        const destCity = tripData.destinationCity || tripData.arrivalLocation || 'Đà Nẵng';
        const loadedTrip: DemoTrip = {
          id: parsed,
          route: tripData.route || `${originCity} - ${destCity}`,
          departureLocation: originCity,
          arrivalLocation: destCity,
          busCompany: tripData.busCompanyName || tripData.busCompany || 'Phương Trang VIP',
          licensePlate: tripData.licensePlate || '29B-12345',
          departureTime: tripData.departureTime || '18:30:00',
          totalSeats: tripData.totalSeats || 34,
          availableSeats: tripData.availableSeats !== undefined ? tripData.availableSeats : 32,
          price: tripData.price || 450000,
          status: tripData.status || 'SCHEDULED',
          busType: tripData.busType || 'LIMOUSINE'
        };
        setTrips(prev => [loadedTrip, ...prev]);
        setSelectedTripId(parsed);
        toast.success(`Đã nạp chuyến xe #${parsed} từ hệ thống thành công!`);
        return;
      }
    } catch {
      // Fallback khi offline hoặc mã chuyến xe chưa có trong CSDL
    }

    const newCustomTrip: DemoTrip = {
      id: parsed,
      route: 'Hà Nội - Đà Nẵng',
      departureLocation: 'Hà Nội',
      arrivalLocation: 'Đà Nẵng',
      busCompany: 'Phương Trang VIP',
      licensePlate: '29B-12345',
      departureTime: '18:30:00',
      totalSeats: 34,
      availableSeats: 32,
      price: 450000,
      status: 'SCHEDULED',
      busType: 'LIMOUSINE'
    };
    setTrips(prev => [newCustomTrip, ...prev]);
    setSelectedTripId(parsed);
    toast.success(`Đã nạp thành công chuyến xe #${parsed} vào bộ điều khiển!`);
  };

  const handleSetSoldOut = async () => {
    if (!selectedTrip) return;
    setIsActionLoading('sold-out');
    try {
      const res = await api.post(`/demo/trips/${selectedTrip.id}/set-sold-out`);
      const updated = res.data?.data;
      if (updated) {
        updateTripInState(updated);
      } else {
        updateTripInState({ id: selectedTrip.id, availableSeats: 0 });
      }
      clearSearchCaches(selectedTrip);
      toast.success(`Đã thiết lập chuyến xe #${selectedTrip.id} sang trạng thái CHÁY VÉ (0 ghế trống)!`);
    } catch {
      updateTripInState({ id: selectedTrip.id, availableSeats: 0 });
      clearSearchCaches(selectedTrip);
      toast.success(`Mô phỏng: Đã đặt chuyến xe #${selectedTrip.id} thành CHÁY VÉ (0 ghế trống)!`);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleSetOneSeat = async () => {
    if (!selectedTrip) return;
    setIsActionLoading('one-seat');
    try {
      const res = await api.post(`/demo/trips/${selectedTrip.id}/set-seats?count=1`);
      const updated = res.data?.data;
      if (updated) {
        updateTripInState(updated);
      } else {
        updateTripInState({ id: selectedTrip.id, availableSeats: 1 });
      }
      clearSearchCaches(selectedTrip);
      toast.success(`Đã thiết lập chuyến xe #${selectedTrip.id} chỉ còn đúng 1 ghế trống duy nhất!`);
    } catch {
      updateTripInState({ id: selectedTrip.id, availableSeats: 1 });
      clearSearchCaches(selectedTrip);
      toast.success(`Mô phỏng: Đã đặt chuyến xe #${selectedTrip.id} chỉ còn 1 ghế trống duy nhất!`);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleResetTripSeats = async () => {
    if (!selectedTrip) return;
    setIsActionLoading('reset-seats');
    try {
      const res = await api.post(`/demo/trips/${selectedTrip.id}/reset-seats`);
      const updated = res.data?.data;
      if (updated) {
        updateTripInState(updated);
      } else {
        updateTripInState({ id: selectedTrip.id, availableSeats: selectedTrip.totalSeats });
      }
      clearSearchCaches(selectedTrip);
      toast.success(`Đã khôi phục mở bán toàn bộ ${selectedTrip.totalSeats} ghế trống cho chuyến xe #${selectedTrip.id}!`);
    } catch {
      updateTripInState({ id: selectedTrip.id, availableSeats: selectedTrip.totalSeats });
      clearSearchCaches(selectedTrip);
      toast.success(`Mô phỏng: Đã khôi phục toàn bộ ${selectedTrip.totalSeats} ghế trống!`);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleOpenSearchPage = () => {
    if (!selectedTrip) return;
    clearSearchCaches(selectedTrip);
    let origin = selectedTrip.departureLocation || '';
    let destination = selectedTrip.arrivalLocation || '';
    if (!origin || !destination) {
      const parts = selectedTrip.route.split(' - ');
      origin = parts[0] || 'Hà Nội';
      destination = parts[1] || 'Đà Nẵng';
    }
    const searchUrl = `/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
    window.open(searchUrl, '_blank');
  };

  const handleSeedSampleBooking = async () => {
    setIsActionLoading('seed-booking');
    setQrImgFailed(false);
    try {
      const res = await api.post('/demo/seed-sample-booking');
      if (res.data?.data) {
        setSampleBooking(res.data.data);
        toast.success('Đã tạo vé xe mẫu DEMO-TICKET-2026 kèm mã QR quét thử thành công!');
      }
    } catch {
      setSampleBooking({
        bookingCode: 'DEMO-TICKET-2026',
        ticketCode: 'DEMO-TK-001',
        qrCodeHash: 'TE-DEMO-001-VALID',
        passengerName: 'Nguyễn Văn Du Khách (Demo)',
        tripRoute: selectedTrip ? `${selectedTrip.route}` : 'Hà Nội - Đà Nẵng',
        busCompany: selectedTrip ? selectedTrip.busCompany : 'Phương Trang VIP',
      });
      toast.info('Đã tạo vé xe mẫu DEMO-TICKET-2026 sẵn sàng quét thử!');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleResetData = () => {
    setIsResetting(true);
    try {
      const testKeys = ['traveleasy_test_fixtures', 'traveleasy_simulation_mode', 'traveleasy_checkout_data'];
      testKeys.forEach(k => {
        try { localStorage.removeItem(k); } catch {}
        try { sessionStorage.removeItem(k); } catch {}
      });
      clearSearchCaches();
      setSimulatedState('IDLE');
      toast.success('Đã dọn sạch toàn bộ dữ liệu thử nghiệm trong localStorage & sessionStorage (Zero Residue)!');
    } finally {
      setTimeout(() => setIsResetting(false), 200);
    }
  };

  const formatDepartureTime = (rawTime?: string) => {
    if (!rawTime) return '18:30';
    if (rawTime.includes('T')) {
      const parts = rawTime.split('T');
      const timePart = parts[1] ? parts[1].substring(0, 5) : '18:30';
      const datePart = parts[0] || '';
      return `${timePart} (${datePart})`;
    }
    return rawTime.substring(0, 5);
  };

  const getOriginAndDestination = () => {
    if (selectedTrip.departureLocation && selectedTrip.arrivalLocation) {
      return { origin: selectedTrip.departureLocation, destination: selectedTrip.arrivalLocation };
    }
    const parts = selectedTrip.route.split(' - ');
    return {
      origin: parts[0] || 'Hà Nội',
      destination: parts[1] || 'Đà Nẵng'
    };
  };

  const { origin, destination } = getOriginAndDestination();

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-full">
              <Database className="w-3.5 h-3.5" />
              <span>Phân hệ Kiểm Thử & Nghiệm Thu Dữ Liệu (/test/fixtures)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bảng Điều Khiển Dữ Liệu Mẫu & Giả Lập Trực Tiếp (Live Interactive Test Console)
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Hỗ trợ kiểm thử viên và giảng viên chấm bài thao tác 1-click trực tiếp trên giao diện: đổi trạng thái cháy vé, khôi phục ghế, tạo vé mẫu và kiểm chứng liên kết hệ thống thời gian thực mà không cần sao chép JSON.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-sm font-semibold rounded-xl transition duration-150 disabled:opacity-50"
            >
              <Trash2 className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Đang dọn dẹp...' : 'Dọn sạch dữ liệu'}</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            TRỌNG TÂM: KHỐI ĐIỀU KHIỂN CHUYẾN XE THỰC TẾ (LIVE TRIP SIMULATOR)
           ========================================================================= */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800/40 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-indigo-800/50 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Khối Điều Khiển Chuyến Xe Thực Tế (Live Trip Simulator)</span>
                </h2>
                <p className="text-xs text-indigo-200">
                  Điều khiển trực tiếp số ghế và trạng thái cháy vé trên CSDL thực tế với hiệu lực tức thì
                </p>
              </div>
            </div>

            <button
              onClick={fetchLiveTrips}
              disabled={isLoadingTrips}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-800/40 hover:bg-indigo-700/50 text-indigo-200 border border-indigo-600/40 rounded-xl text-xs font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTrips ? 'animate-spin' : ''}`} />
              <span>Làm mới danh sách</span>
            </button>
          </div>

          {/* 1. Bộ chọn chuyến xe (Trip Selector) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-900/60 p-4 rounded-2xl border border-indigo-900/50">
            <div className="md:col-span-8 space-y-1.5">
              <label htmlFor="trip-selector" className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Chọn chuyến xe từ danh sách hệ thống:
              </label>
              <select
                id="trip-selector"
                value={selectedTripId}
                onChange={(e) => handleSelectTrip(parseInt(e.target.value, 10))}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {trips.map(t => (
                  <option key={t.id} value={t.id}>
                    [ID: {t.id}] {t.route} - {t.busCompany} ({t.availableSeats}/{t.totalSeats} ghế trống)
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label htmlFor="custom-trip-input" className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Hoặc nhập mã chuyến xe (Trip ID):
              </label>
              <div className="flex gap-2">
                <input
                  id="custom-trip-input"
                  type="text"
                  placeholder="Ví dụ: 101, 493"
                  value={customTripInput}
                  onChange={(e) => setCustomTripInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCustomTripId(); }}
                  className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomTripId}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-sm whitespace-nowrap"
                >
                  Nạp mã
                </button>
              </div>
            </div>
          </div>

          {/* 2. Thẻ trạng thái Live (Live Trip Card) */}
          {selectedTrip && (
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      Trip ID: #{selectedTrip.id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedTrip.busType || 'LIMOUSINE'}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mt-2">
                    <span>{origin}</span>
                    <span className="text-indigo-400 font-mono">{'->'}</span>
                    <span>{destination}</span>
                  </h3>
                </div>

                <div className="flex flex-col sm:items-end gap-1">
                  <div className="text-xs text-slate-400">Trạng thái ghế hiện tại:</div>
                  {/* Badge màu sắc trực quan theo quy định */}
                  {selectedTrip.availableSeats === 0 ? (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>0/{selectedTrip.totalSeats} ghế - ĐÃ HẾT VÉ</span>
                    </div>
                  ) : selectedTrip.availableSeats === 1 ? (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>1/{selectedTrip.totalSeats} ghế - Chỉ còn 1 chỗ duy nhất</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>{selectedTrip.availableSeats}/{selectedTrip.totalSeats} ghế trống</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Chi tiết thông số chuyến xe */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Nhà xe & Biển số:</span>
                  <span className="font-bold text-white text-sm">
                    {selectedTrip.busCompany} ({selectedTrip.licensePlate || '29B-12345'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Giờ khởi hành:</span>
                  <span className="font-bold text-white text-sm">
                    {formatDepartureTime(selectedTrip.departureTime)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Giá vé niêm yết:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {selectedTrip.price ? selectedTrip.price.toLocaleString('vi-VN') : '450.000'} đ
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Tổng số ghế thiết kế:</span>
                  <span className="font-bold text-white text-sm">
                    {selectedTrip.totalSeats} ghế (2 tầng)
                  </span>
                </div>
              </div>

              {/* 3. Các nút hành động 1-Click (Action Buttons) */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
                  Thao tác điều khiển 1-Click (Tác động trực tiếp CSDL):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  
                  {/* Nút Cháy Vé Ngay */}
                  <button
                    onClick={handleSetSoldOut}
                    disabled={isActionLoading !== null}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow-rose-600/30 disabled:opacity-50"
                  >
                    <Flame className={`w-4 h-4 ${isActionLoading === 'sold-out' ? 'animate-bounce' : ''}`} />
                    <span>{isActionLoading === 'sold-out' ? 'Đang cập nhật...' : 'Cháy Vé Ngay (0 Ghế)'}</span>
                  </button>

                  {/* Nút Sắp Hết Vé */}
                  <button
                    onClick={handleSetOneSeat}
                    disabled={isActionLoading !== null}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow-amber-600/30 disabled:opacity-50"
                  >
                    <Zap className={`w-4 h-4 ${isActionLoading === 'one-seat' ? 'animate-bounce' : ''}`} />
                    <span>{isActionLoading === 'one-seat' ? 'Đang cập nhật...' : 'Sắp Hết Vé (Còn 1 Ghế)'}</span>
                  </button>

                  {/* Nút Khôi Phục Mở Bán */}
                  <button
                    onClick={handleResetTripSeats}
                    disabled={isActionLoading !== null}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow-emerald-600/30 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isActionLoading === 'reset-seats' ? 'animate-spin' : ''}`} />
                    <span>{isActionLoading === 'reset-seats' ? 'Đang xử lý...' : 'Khôi Phục Mở Bán (Reset Ghế)'}</span>
                  </button>

                  {/* Nút Xem Ngay Trên Trang Tìm Chuyến */}
                  <button
                    onClick={handleOpenSearchPage}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow-indigo-600/30"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Xem Ngay Trên Trang Tìm Chuyến (/search)</span>
                  </button>

                </div>
              </div>

            </div>
          )}

          {/* 4. Tích hợp Vé Mẫu & QR Code Quét Thử */}
          <div className="bg-slate-900/90 border border-indigo-800/60 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-amber-400" />
                  <span>Kịch Bản Vé Mẫu Đã Thanh Toán & Mã QR Soát Vé</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Tạo vé mẫu có sẵn trong hệ thống để quét thử nghiệm thu tính năng check-in và tra cứu
                </p>
              </div>

              <button
                onClick={handleSeedSampleBooking}
                disabled={isActionLoading === 'seed-booking'}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-sm disabled:opacity-50 whitespace-nowrap"
              >
                <QrCode className="w-4 h-4" />
                <span>{isActionLoading === 'seed-booking' ? 'Đang tạo...' : 'Tạo Vé Xe Mẫu Đã Thanh Toán'}</span>
              </button>
            </div>

            {sampleBooking && (
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                  <div className="p-2 bg-white rounded-xl shadow-md border border-slate-300 flex items-center justify-center min-w-[124px] min-h-[124px]">
                    {!qrImgFailed ? (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(sampleBooking.qrCodeHash || 'TE-DEMO-001-VALID')}`}
                        alt="Mã QR Vé Mẫu"
                        onError={() => setQrImgFailed(true)}
                        className="w-28 h-28 block"
                      />
                    ) : (
                      <div className="w-28 h-28 bg-slate-100 rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center p-2 text-center">
                        <QrCode className="w-10 h-10 text-slate-800" />
                        <span className="text-[10px] text-slate-700 font-bold mt-1">Mã QR Ngoại Tuyến</span>
                        <span className="text-[8px] font-mono text-indigo-700 break-all">{sampleBooking.qrCodeHash}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1.5 text-xs">
                    <div className="inline-block px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-[11px]">
                      CONFIRMED - ĐÃ XUẤT VÉ
                    </div>
                    <div>
                      <span className="text-slate-400">Mã đặt chỗ: </span>
                      <strong className="text-white font-mono text-sm">{sampleBooking.bookingCode}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Mã vé điện tử: </span>
                      <strong className="text-amber-400 font-mono text-sm">{sampleBooking.ticketCode}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Hành khách: </span>
                      <strong className="text-white">{sampleBooking.passengerName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Mã chuỗi QR: </span>
                      <span className="font-mono text-indigo-300">{sampleBooking.qrCodeHash}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
                  <button
                    onClick={() => window.open(`/lookup?code=${encodeURIComponent(sampleBooking.bookingCode)}`, '_blank')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở trang Tra Cứu Vé (/lookup)</span>
                  </button>
                  <button
                    onClick={() => window.open('/scanner', '_blank')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Mở cổng Soát Vé Quét QR (/scanner)</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* State Simulator Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Mô phỏng trạng thái UI:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSimulatedState('IDLE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                simulatedState === 'IDLE' 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Bình thường (Data Ready)
            </button>
            <button
              onClick={() => setSimulatedState('LOADING')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                simulatedState === 'LOADING' 
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Đang tải (Skeleton/Delay)
            </button>
            <button
              onClick={() => setSimulatedState('EMPTY')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                simulatedState === 'EMPTY' 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Dữ liệu rỗng (0 Items)
            </button>
            <button
              onClick={() => setSimulatedState('ERROR')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                simulatedState === 'ERROR' 
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Mã lỗi 500 / Network Fail
            </button>
          </div>
        </div>

        {/* State Display Panel if simulated */}
        {simulatedState === 'LOADING' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto"></div>
            <div className="h-8 bg-slate-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4 mx-auto"></div>
            <p className="text-xs text-amber-700 font-medium">Đang mô phỏng trạng thái tải dữ liệu có độ trễ mạng...</p>
          </div>
        )}

        {simulatedState === 'EMPTY' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Không có dữ liệu trong bộ lọc này</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Giao diện xử lý mượt mà trạng thái rỗng, không gây lỗi cú pháp hoặc crash màn hình người dùng.
            </p>
          </div>
        )}

        {simulatedState === 'ERROR' && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
            <h3 className="text-base font-bold text-rose-900">Mô phỏng: Lỗi kết nối dịch vụ (500 Internal Error)</h3>
            <p className="text-sm text-rose-700 max-w-md mx-auto">
              Hệ thống kích hoạt cơ chế fallback an toàn, hiển thị thông báo thân thiện và ẩn mã lỗi nội bộ.
            </p>
          </div>
        )}

        {/* =========================================================================
            BỘ DỮ LIỆU MẪU THAM KHẢO & CHI TIẾT JSON (REFERENCE FIXTURES)
           ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Bộ Dữ Liệu Mẫu Tham Khảo (Reference Fixtures)
              </h3>
              <p className="text-xs text-slate-500">
                Các mẫu cấu trúc dữ liệu JSON chuẩn phục vụ kiểm thử đơn vị và tích hợp
              </p>
            </div>
            <div className="flex gap-2 border-b sm:border-b-0 border-slate-200 pb-2 sm:pb-0 overflow-x-auto">
              {['ALL', 'TRIP', 'TICKET', 'CARGO', 'ERROR_BOUNDARY'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat === 'ALL' && 'Tất cả'}
                  {cat === 'TRIP' && 'Chuyến xe'}
                  {cat === 'TICKET' && 'Vé & Đặt chỗ'}
                  {cat === 'CARGO' && 'Bưu kiện'}
                  {cat === 'ERROR_BOUNDARY' && 'Kịch bản lỗi'}
                </button>
              ))}
            </div>
          </div>

          {/* Two-Column Grid: List & Detail View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Fixture List */}
            <div className="lg:col-span-5 space-y-3">
              {filteredFixtures.map(fixture => {
                const isSelected = activeFixture.id === fixture.id;
                return (
                  <button
                    type="button"
                    key={fixture.id}
                    onClick={() => setActiveFixture(fixture)}
                    aria-label={`Xem fixture: ${fixture.title}`}
                    className={`p-4 rounded-xl border cursor-pointer transition duration-150 text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                      isSelected
                        ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/20 shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-slate-500">{fixture.id}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {fixture.badge}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{fixture.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{fixture.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Detailed JSON Inspector */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{activeFixture.category}</span>
                  <h3 className="text-base font-extrabold text-slate-900">{activeFixture.title}</h3>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(activeFixture.payload, null, 2));
                    toast.success('Đã sao chép cấu trúc JSON của fixture vào clipboard');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép JSON</span>
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {activeFixture.description}
              </p>

              <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto text-emerald-400 font-mono text-xs leading-relaxed">
                <pre>{JSON.stringify(activeFixture.payload, null, 2)}</pre>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Dữ liệu mẫu đã kiểm chứng theo chuẩn nghiệp vụ TravelEasy
                </span>
                <span className="font-mono">ID: {activeFixture.id}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
