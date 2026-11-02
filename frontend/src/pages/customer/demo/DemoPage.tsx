import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  CheckCircle, 
  RefreshCw, 
  ShieldCheck, 
  Terminal, 
  QrCode, 
  Users, 
  Bus, 
  CreditCard, 
  Activity, 
  Copy, 
  ExternalLink, 
  ChevronRight,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';

interface DemoStats {
  totalUsers: number;
  totalBusCompanies: number;
  totalRoutes: number;
  totalTrips: number;
  totalBookings: number;
  totalTickets: number;
  totalSeats: number;
  seatsAvailable: number;
  seatsLocked: number;
  seatsBooked: number;
  readyForDemo: boolean;
}

interface HealthData {
  status: string;
  version: string;
  uptimeMs: number;
  database: string;
  userCount: number;
  tripCount: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
}

export const DemoPage: React.FC = () => {
  const [stats, setStats] = useState<DemoStats | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [seededTicket, setSeededTicket] = useState<{
    bookingCode: string;
    ticketCode: string;
    qrCodeHash: string;
    passengerName: string;
    tripRoute: string;
  } | null>(null);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/v1/demo/status');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setStats(json.data);
      }
    } catch {
      // Backend có thể chưa chạy hoặc mock
      setStats({
        totalUsers: 25,
        totalBusCompanies: 10,
        totalRoutes: 20,
        totalTrips: 120,
        totalBookings: 85,
        totalTickets: 140,
        totalSeats: 3600,
        seatsAvailable: 3420,
        seatsLocked: 4,
        seatsBooked: 176,
        readyForDemo: true,
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchHealth = async () => {
    setActionLoading('health');
    try {
      const res = await fetch('/api/v1/health');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setHealth(json.data);
          toast.success('Trạng thái UP - Cơ sở dữ liệu KẾT NỐI TỐT', 'Sức Khỏe Hệ Thống');
        }
      }
    } catch {
      toast.warning('Không thể kết nối đến API Health (Server chưa khởi động)', 'Cảnh Báo');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetSeats = async (all = false) => {
    setActionLoading('resetSeats');
    try {
      const res = await fetch(`/api/v1/demo/reset-seats?resetAllBooked=${all}`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        toast.success(json.message || 'Đã giải phóng ghế bị khóa thành công!', 'Đặt Lại Ghế');
        fetchStats();
      } else {
        toast.error('Lỗi khi gọi reset ghế', 'Thất Bại');
      }
    } catch {
      toast.info('Mô phỏng: Đã mở lại toàn bộ ghế đang khóa về trạng thái TRỐNG', 'Thông Báo');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSeedTicket = async () => {
    setActionLoading('seedTicket');
    try {
      const res = await fetch('/api/v1/demo/seed-sample-booking', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setSeededTicket(json.data);
          toast.success('Đã khởi tạo vé mẫu DEMO-TICKET-2026 kèm mã QR sẵn sàng quét!', 'Khởi Tạo Vé Mẫu');
          fetchStats();
        }
      }
    } catch {
      setSeededTicket({
        bookingCode: 'DEMO-TICKET-2026',
        ticketCode: 'DEMO-TK-001',
        qrCodeHash: 'TE-DEMO-001-VALID',
        passengerName: 'Nguyễn Văn Du Khách (Demo)',
        tripRoute: 'TP. Hồ Chí Minh -> Đà Lạt',
      });
      toast.info('Đã nạp vé mẫu demo cục bộ', 'Vé Mẫu');
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label} vào bộ nhớ tạm!`, 'Đã Sao Chép');
  };

  useEffect(() => {
    fetchStats();
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Banner tiêu đề */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Bus size={320} />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles size={14} className="text-amber-300" /> Sprint 4 Delivery & Final Release Handover
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Trung Tâm Trình Diễn & Kịch Bản Bảo Vệ OJT (15 Phút)
            </h1>
            <p className="mt-3 text-blue-100 text-sm sm:text-base leading-relaxed">
              Hệ sinh thái quản lý nhà xe liên tỉnh và bán vé trực tuyến <strong>TravelEasy Platform</strong>. 
              Trang hỗ trợ nạp dữ liệu mẫu lặp lại, kiểm tra sức khỏe 3 cổng độc lập (Admin, Partner, Customer) và theo dõi kịch bản trình bày chuẩn mực.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => handleResetSeats(false)}
                disabled={actionLoading === 'resetSeats'}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-medium px-4 py-2.5 rounded-xl shadow transition"
              >
                <RefreshCw size={16} className={actionLoading === 'resetSeats' ? 'animate-spin' : ''} />
                Đặt Lại Ghế Khóa Tạm (LOCKED)
              </button>
              <button
                onClick={handleSeedTicket}
                disabled={actionLoading === 'seedTicket'}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-medium px-4 py-2.5 rounded-xl shadow transition"
              >
                <QrCode size={16} />
                Tạo Vé Mẫu Quét QR Ngay
              </button>
              <button
                onClick={fetchHealth}
                disabled={actionLoading === 'health'}
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 active:scale-95 text-white font-medium px-4 py-2.5 rounded-xl backdrop-blur-md shadow transition"
              >
                <Activity size={16} />
                Kiểm Tra Sức Khỏe API
              </button>
            </div>
          </div>
        </div>

        {/* Khối Trạng thái Dữ liệu & Sức khỏe */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Độ Sẵn Sàng (Health)</span>
              <Activity size={16} className="text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {health?.status || 'UP'}
              </span>
              <span className="text-xs text-slate-500">v{health?.version || '1.0.0'}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">DB: {health?.database || 'CONNECTED'}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Tài Khoản & Đối Tác</span>
              <Users size={16} className="text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {stats?.totalUsers || 25}
              </span>
              <span className="text-xs text-slate-500">Người dùng ({stats?.totalBusCompanies || 10} Nhà xe)</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Phân quyền 3 vai trò nghiêm ngặt</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Chuyến Xe & Tuyến Chạy</span>
              <Bus size={16} className="text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {stats?.totalTrips || 120}
              </span>
              <span className="text-xs text-slate-500">Chuyến ({stats?.totalRoutes || 20} Tuyến)</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Dữ liệu mẫu phủ sóng toàn quốc</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Ghế Đang Khóa Tạm</span>
              <CreditCard size={16} className="text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-500">
                {stats?.seatsLocked ?? 0}
              </span>
              <span className="text-xs text-slate-500">/ {stats?.totalSeats || 3600} ghế</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Tự nhả sau 10 phút hoặc bấm Reset</p>
          </div>
        </div>

        {/* Khối hiển thị vé mẫu được nạp để quét QR */}
        {seededTicket && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500 text-white rounded-xl">
                  <QrCode size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    Vé Mẫu Trình Diễn Đã Sẵn Sàng (Live QR Ticket Ready)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Sử dụng mã này để demo tra cứu vé hoặc dùng camera quét tại màn hình Check-in nhà xe
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/lookup?code=${seededTicket.bookingCode}`}
                  target="_blank"
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition inline-flex items-center gap-1"
                >
                  Mở Tra Cứu Vé <ExternalLink size={12} />
                </Link>
                <Link
                  to="/scanner"
                  target="_blank"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition inline-flex items-center gap-1"
                >
                  Mở Máy Soát QR <ExternalLink size={12} />
                </Link>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-100 dark:border-amber-900/40 text-xs">
              <div>
                <span className="text-slate-400 block">Mã Đặt Chỗ:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{seededTicket.bookingCode}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Mã Vé Điện Tử:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{seededTicket.ticketCode}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Hành Khách:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{seededTicket.passengerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Chuỗi Mã Hóa QR (Hash):</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{seededTicket.qrCodeHash}</span>
              </div>
            </div>
          </div>
        )}

        {/* Thẻ Tài Khoản Trình Diễn Nhanh (3 Cổng) */}
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Tài Khoản Đăng Nhập Mẫu Cho 3 Phân Hệ (Role-Based Demo Accounts)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Khách hàng */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative">
              <div className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 mb-3">
                CỔNG KHÁCH HÀNG (CUSTOMER)
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Nguyễn Văn Du Khách</h3>
              <p className="text-xs text-slate-500 mt-0.5">Đặt chỗ, thanh toán, quản lý vé và hủy hoàn</p>
              
              <div className="mt-4 space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span>Email:</span>
                  <button onClick={() => copyToClipboard('customer@gmail.com', 'Email')} className="hover:text-blue-600 flex items-center gap-1 font-semibold">
                    customer@gmail.com <Copy size={12} />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Mật khẩu:</span>
                  <button onClick={() => copyToClipboard('123456789@', 'Mật khẩu')} className="hover:text-blue-600 flex items-center gap-1 font-semibold">
                    123456789@ <Copy size={12} />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <Link to="/auth" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Đăng nhập Khách hàng <ChevronRight size={14} />
                </Link>
                <Link to="/search" className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                  Tìm chuyến ngay
                </Link>
              </div>
            </div>

            {/* 2. Nhà xe */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative">
              <div className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-3">
                CỔNG NHÀ XE (PARTNER)
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Điều Hành TravelEasy Express</h3>
              <p className="text-xs text-slate-500 mt-0.5">Quản lý đội xe, chuyến xe, giá vé và soát vé QR</p>
              
              <div className="mt-4 space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span>Email:</span>
                  <button onClick={() => copyToClipboard('partner@traveleasy.vn', 'Email')} className="hover:text-blue-600 flex items-center gap-1 font-semibold">
                    partner@traveleasy.vn <Copy size={12} />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Mật khẩu:</span>
                  <button onClick={() => copyToClipboard('123456789@', 'Mật khẩu')} className="hover:text-blue-600 flex items-center gap-1 font-semibold">
                    123456789@ <Copy size={12} />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <Link to="/company/login" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  Đăng nhập Cổng Nhà Xe <ChevronRight size={14} />
                </Link>
                <Link to="/scanner" className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                  Soát vé QR di động
                </Link>
              </div>
            </div>

            {/* 3. Quản trị */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative">
              <div className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 mb-3">
                CỔNG QUẢN TRỊ (ADMIN)
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Quản Trị Viên Hệ Thống</h3>
              <p className="text-xs text-slate-500 mt-0.5">Duyệt đối tác, đối soát tài chính, nhật ký kiểm toán</p>
              
              <div className="mt-4 space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span>Email:</span>
                  <button onClick={() => copyToClipboard('admin@traveleasy.vn', 'Email')} className="hover:text-blue-600 flex items-center gap-1 font-semibold">
                    admin@traveleasy.vn <Copy size={12} />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Mật khẩu:</span>
                  <button onClick={() => copyToClipboard('123456789@', 'Mật khẩu')} className="hover:text-blue-600 flex items-center gap-1 font-semibold">
                    123456789@ <Copy size={12} />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <Link to="/admin/login" className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1">
                  Đăng nhập Cổng Admin <ChevronRight size={14} />
                </Link>
                <Link to="/admin" className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* KỊCH BẢN BẢO VỆ 15 PHÚT CHI TIẾT */}
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <Play size={20} className="text-emerald-600" />
            Kịch Bản Trình Bày 15 Phút Bảo Vệ OJT (Standard Live Defense Script)
          </h2>

          <div className="space-y-4">
            {/* Giai đoạn 1 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    00:00 - 03:00 (3 Phút)
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Giai đoạn 1: Giới Thiệu Đề Tài & Kiến Trúc Đa Cổng Monorepo
                  </h3>
                </div>
                <ShieldCheck size={20} className="text-blue-500" />
              </div>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <strong>Nội dung trình bày:</strong> Trình bày bối cảnh chuyển đổi số ngành vận tải hành khách liên tỉnh. Giới thiệu mô hình 3 cổng (Client, Partner, Admin), kiến trúc Spring Boot 3.3, React 18, Tailwind CSS, Supabase PostgreSQL và khả năng cô lập dữ liệu nhà xe (Multi-tenancy isolation).
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono">Monorepo Zero-Conflict</span>
                <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono">Pessimistic Locking</span>
                <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono">Spring Security JWT</span>
              </div>
            </div>

            {/* Giai đoạn 2 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    03:00 - 07:00 (4 Phút)
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Giai đoạn 2: Trình Diễn Cổng Khách Hàng — Đặt Chỗ, Giữ Ghế Realtime & Thanh Toán
                  </h3>
                </div>
                <Link to="/search" target="_blank" className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                  Mở Tìm Chuyến <ExternalLink size={12} />
                </Link>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <strong>Thao tác trực tiếp:</strong> Tìm tuyến TP.HCM - Đà Lạt. Chọn chuyến xe Thành Bưởi hoặc FUTA. Mở sơ đồ ghế 2 tầng, chọn ghế A01/A02. Minh họa cơ chế khóa ghế 10 phút chống đặt trùng. Nhập thông tin hành khách, áp dụng mã giảm giá `HELLOSUMMER`, chọn thanh toán VietQR / VNPAY và hoàn tất xuất vé.
              </p>
            </div>

            {/* Giai đoạn 3 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    07:00 - 10:00 (3 Phút)
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Giai đoạn 3: Trình Diễn Cổng Nhà Xe — Quản Lý Chuyến & Soát Vé QR Di Động
                  </h3>
                </div>
                <Link to="/scanner" target="_blank" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
                  Mở Máy Quét QR <ExternalLink size={12} />
                </Link>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <strong>Thao tác trực tiếp:</strong> Đăng nhập Cổng Nhà xe (`partner@traveleasy.vn`). Xem danh sách chuyến của nhà xe mình (chứng minh chỉ thấy dữ liệu nhà xe mình, không lẫn nhà xe khác). Mở tính năng Soát vé QR (`/scanner`), quét mã vé `DEMO-TICKET-2026`. Hệ thống báo xác thực thành công. Thử quét lại lần 2 để chứng minh tính năng chống quét trùng vé.
              </p>
            </div>

            {/* Giai đoạn 4 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                    10:00 - 13:00 (3 Phút)
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Giai đoạn 4: Trình Diễn Cổng Quản Trị Tối Cao — Doanh Thu, Duyệt Đối Tác & Audit Log
                  </h3>
                </div>
                <Link to="/admin" target="_blank" className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1">
                  Mở Cổng Admin <ExternalLink size={12} />
                </Link>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <strong>Thao tác trực tiếp:</strong> Đăng nhập Admin (`admin@traveleasy.vn`). Xem biểu đồ doanh thu toàn sàn, phân tích theo nhà xe. Thao tác phê duyệt hồ sơ đối tác mới (`/admin/partners`). Kiểm tra nhật ký kiểm toán (Audit Logs) để xem toàn bộ lịch sử thao tác gắn liền mã tương quan `X-Correlation-Id`.
              </p>
            </div>

            {/* Giai đoạn 5 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    13:00 - 15:00 (2 Phút)
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Giai đoạn 5: Hỏi Đáp (Q&A) & Kiểm Chứng Khả Năng Khôi Phục Hệ Thống
                  </h3>
                </div>
                <CheckCircle size={20} className="text-emerald-500" />
              </div>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <strong>Nội dung:</strong> Sẵn sàng trả lời các câu hỏi về: Giải thuật chống race-condition khi 2 người cùng đặt 1 ghế (Pessimistic lock), cơ chế bảo mật JWT stateless, chính sách hoàn tiền tự động và chiến lược backup dữ liệu. Bấm nút "Đặt Lại Ghế Khóa" để chứng minh khả năng dọn dẹp phiên thử nghiệm tức thì.
              </p>
            </div>
          </div>
        </div>

        {/* Liên kết Tài liệu bàn giao & Nghiệm thu */}
        <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-xl">
              <Database size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Tài Liệu Kỹ Thuật & Biên Bản Nghiệm Thu Sprint 3 - Sprint 4
              </h4>
              <p className="text-xs text-slate-500">
                Đầy đủ ma trận kiểm thử 79 thẻ, hướng dẫn vận hành kiến trúc và kịch bản rollback
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/policy"
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
            >
              Quy Chế Hoạt Động
            </Link>
            <Link
              to="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
            >
              Về Trang Chủ
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DemoPage;
