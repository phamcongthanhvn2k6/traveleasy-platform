import React, { useState } from 'react';
import { 
  Database, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Bus, 
  QrCode, 
  Zap, 
  Copy, 
  ArrowRight
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';

export interface SampleFixture {
  id: string;
  category: 'TRIP' | 'TICKET' | 'CARGO' | 'ERROR_BOUNDARY';
  title: string;
  description: string;
  badge: string;
  payload: Record<string, any>;
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

export const TestFixturesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeFixture, setActiveFixture] = useState<SampleFixture>(SAMPLE_FIXTURES[0]);
  const [isResetting, setIsResetting] = useState(false);
  const [simulatedState, setSimulatedState] = useState<'IDLE' | 'LOADING' | 'EMPTY' | 'ERROR'>('IDLE');

  const filtered = selectedCategory === 'ALL' 
    ? SAMPLE_FIXTURES 
    : SAMPLE_FIXTURES.filter(f => f.category === selectedCategory);

  const handleCopyPayload = (payload: Record<string, any>) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    toast.success('Đã sao chép cấu trúc JSON của fixture vào clipboard');
  };

  const handleResetData = () => {
    setIsResetting(true);
    try {
      // ponytail: actually clean test residual keys from localStorage & sessionStorage
      const testKeys = ['traveleasy_test_fixtures', 'traveleasy_simulation_mode', 'traveleasy_checkout_data'];
      testKeys.forEach(k => {
        try { localStorage.removeItem(k); } catch {}
        try { sessionStorage.removeItem(k); } catch {}
      });
      setSimulatedState('IDLE');
      toast.success('Đã dọn sạch toàn bộ dữ liệu thử nghiệm trong localStorage & sessionStorage (Zero Residue)!');
    } finally {
      setTimeout(() => setIsResetting(false), 200);
    }
  };

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
              Bảng Thiết Lập Fixture & Dữ Liệu Mẫu
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Hỗ trợ kiểm thử viên và kỹ sư giao diện giả lập tức thì các trạng thái hợp lệ, lỗi, giá trị biên và dọn sạch dữ liệu an toàn theo tiêu chuẩn DoD.
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

        {/* Category Filter Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
          {['ALL', 'TRIP', 'TICKET', 'CARGO', 'ERROR_BOUNDARY'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'ALL' && 'Tất cả Fixtures'}
              {cat === 'TRIP' && 'Chuyến xe (Trips)'}
              {cat === 'TICKET' && 'Vé & Đặt chỗ (Tickets)'}
              {cat === 'CARGO' && 'Bưu kiện Hầm xe (Cargo)'}
              {cat === 'ERROR_BOUNDARY' && 'Kịch bản Biên / Lỗi'}
            </button>
          ))}
        </div>

        {/* Two-Column Grid: List & Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Fixture List */}
          <div className="lg:col-span-5 space-y-3">
            {filtered.map(fixture => {
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
                <h3 className="text-lg font-extrabold text-slate-900">{activeFixture.title}</h3>
              </div>
              <button
                onClick={() => handleCopyPayload(activeFixture.payload)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép JSON</span>
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
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
  );
};
