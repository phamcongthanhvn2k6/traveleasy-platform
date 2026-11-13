/**
 * @file CompanyReportsPage.tsx
 * @description Báo Cáo Thống Kê Doanh Thu & Tỷ Lệ Lấp Đầy Ghế Nhà Xe (/company/reports)
 * Dữ liệu thời gian thực 100% từ Supabase PostgreSQL qua Backend API
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  Ticket,
  Percent,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Search,
  AlertTriangle,
  Bus,
  Layers,
  Flame,
  ArrowDownRight,
  Building2,
  Activity,
  CreditCard
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';
import { getStoredCompany } from '../../../utils/companyHelper';

interface ChartPoint {
  label: string;
  date: string;
  grossRevenue: number;
  platformFee: number;
  netRevenue: number;
  bookings: number;
  occupancyRate: number;
}

interface RoutePerformance {
  routeId: string;
  routeName: string;
  tripsCount: number;
  totalSeats: number;
  bookedSeats: number;
  occupancyRate: number; // %
  grossRevenue: number;
  platformFee: number; // 8%
  netRevenue: number;
}

interface TripPerformance {
  tripId: number;
  tripCode: string;
  routeName: string;
  departureTime: string;
  licensePlate: string;
  busType: string;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  occupancyRate: number; // %
  price: number;
  grossRevenue: number;
  platformFee: number; // 8%
  netRevenue: number;
  status: string;
  occupancyLevel: 'PEAK' | 'NORMAL' | 'LOW' | string;
}

interface ReportSummary {
  busCompanyId: number;
  companyName: string;
  period: string;
  totalGrossRevenue: number;
  platformFeeRate: number; // 8.0%
  totalPlatformFee: number;
  totalNetRevenue: number;
  totalTickets: number;
  totalTrips: number;
  avgOccupancyRate: number;
  peakTripsCount: number;
  lowTripsCount: number;
  chartData: ChartPoint[];
  routePerformances: RoutePerformance[];
  tripPerformances: TripPerformance[];
}

export const CompanyReportsPage: React.FC = () => {
  const currentCompany = getStoredCompany();
  const [dateRange, setDateRange] = useState<string>('MONTH');
  const [activeTab, setActiveTab] = useState<'TRIPS' | 'ROUTES'>('TRIPS');
  const [chartMode, setChartMode] = useState<'REVENUE' | 'OCCUPANCY'>('REVENUE');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'PEAK' | 'LOW'>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [report, setReport] = useState<ReportSummary>({
    busCompanyId: currentCompany.id || 14,
    companyName: currentCompany.name || 'Nhà Xe Đối Tác',
    period: 'MONTH',
    totalGrossRevenue: 0,
    platformFeeRate: 8.0,
    totalPlatformFee: 0,
    totalNetRevenue: 0,
    totalTickets: 0,
    totalTrips: 0,
    avgOccupancyRate: 0,
    peakTripsCount: 0,
    lowTripsCount: 0,
    chartData: [],
    routePerformances: [],
    tripPerformances: []
  });

  const fetchReportData = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    else setLoading(true);

    try {
      // 100% GỌI BACKEND API TÍNH TOÁN DỮ LIỆU THỰC TẾ TỪ CSDL SUPABASE
      const res = await api.get('/company/reports/summary', {
        params: {
          companyId: currentCompany.id,
          period: dateRange
        }
      });

      if (res.data?.data) {
        setReport(res.data.data);
        if (showToast) toast.success('Đã đồng bộ số liệu đối soát thời gian thực từ CSDL!');
      }
    } catch (err: any) {
      console.error('Lỗi khi tải báo cáo từ CSDL:', err);
      toast.error('Không thể đồng bộ số liệu từ máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [currentCompany.id, dateRange]);

  // Bộ lọc danh sách chuyến xe
  const filteredTrips = useMemo(() => {
    return (report.tripPerformances || []).filter((trip) => {
      const matchSearch =
        trip.tripCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());

      const matchLevel =
        filterLevel === 'ALL' ||
        (filterLevel === 'PEAK' && trip.occupancyLevel === 'PEAK') ||
        (filterLevel === 'LOW' && trip.occupancyLevel === 'LOW');

      return matchSearch && matchLevel;
    });
  }, [report.tripPerformances, searchTerm, filterLevel]);

  // Xuất file CSV / Excel chuẩn UTF-8 BOM
  const handleExportCSV = async () => {
    toast.info('Đang xuất bảng tính Excel/CSV đối soát tài chính từ CSDL...');
    try {
      const response = await api.get('/company/reports/export-csv', {
        params: { companyId: currentCompany.id, period: dateRange },
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bao_Cao_Doanh_Thu_${currentCompany.id}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Đã tải xuống file CSV đối soát doanh thu thành công!');
    } catch (err) {
      toast.error('Có lỗi xảy ra khi tạo file xuất báo cáo.');
    }
  };

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. BANNER NGHIỆP VỤ ĐIỀU HÀNH B2B (THAY THẾ TOÀN BỘ BANNER SPRINT 3 CŨ) */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 relative overflow-hidden">
          {/* Subtle Decorative Elements */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -mb-20" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  KẾT NỐI REAL-TIME SUPABASE
                </span>
                <span className="text-xs font-medium text-slate-400">
                  Hợp đồng B2B: <span className="text-amber-300 font-semibold">Khấu trừ hoa hồng sàn 8% cố định</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <BarChart3 className="w-7 h-7 text-indigo-400 shrink-0" />
                Báo Cáo Hoạt Động Doanh Thu & Tỷ Lệ Lấp Đầy Ghế
              </h1>

              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Giám sát số liệu tài chính minh bạch cho đối tác <span className="font-bold text-white underline decoration-indigo-400 underline-offset-4">{report.companyName}</span>. 
                Theo dõi sát sao từng kỳ đối soát, doanh số bán vé, chiết khấu hoa hồng nền tảng và hiệu quả khai thác ghế trên toàn mạng lưới xe.
              </p>
            </div>

            {/* Quick Metrics Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 shrink-0">
              <div className="bg-white/5 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  Kỳ đối soát
                </div>
                <p className="text-sm font-bold text-white">Tháng 11/2026</p>
                <p className="text-[11px] text-emerald-400 mt-0.5">Chốt ngày 15 & 30</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  Tình trạng ví
                </div>
                <p className="text-sm font-bold text-white">Sẵn sàng kết toán</p>
                <p className="text-[11px] text-slate-400 mt-0.5">92% doanh thu ròng</p>
              </div>

              <div className="bg-white/5 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 col-span-2 sm:col-span-1 lg:col-span-2">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Bus className="w-3.5 h-3.5 text-amber-400" />
                  Quy mô khai thác
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-white">{report.totalTrips} chuyến vận hành</p>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                    {report.routePerformances.length} tuyến
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. THANH ĐIỀU KHIỂN & BỘ LỌC THỜI GIAN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Chi Tiết Chỉ Số Tài Chính & Đối Soát
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dữ liệu được tổng hợp trực tiếp từ bảng <code className="text-indigo-600 font-mono bg-indigo-50 px-1 py-0.5 rounded">trips</code> và <code className="text-indigo-600 font-mono bg-indigo-50 px-1 py-0.5 rounded">bookings</code> trong CSDL
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm text-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
              >
                <option value="7D">7 Ngày Gần Nhất</option>
                <option value="MONTH">Tháng Này (11/2026)</option>
                <option value="QUARTER">Quý 4/2026</option>
                <option value="ALL">Toàn Bộ Lịch Sử</option>
              </select>
            </div>

            <button
              onClick={() => fetchReportData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-sm font-medium shadow-sm transition-all"
              title="Đồng bộ lại số liệu mới nhất từ CSDL"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Xuất Excel / CSV
            </button>
          </div>
        </div>

        {/* 3. CÁC THẺ KPI CHỈ SỐ TÀI CHÍNH THỰC TẾ (4 KPI CARDS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tổng Doanh Thu */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Tổng Doanh Thu Bán Vé</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatVND(report.totalGrossRevenue)}</p>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {report.totalTickets} vé đã thanh toán thành công
            </p>
          </div>

          {/* Chiết Khấu Sàn (8%) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Hoa Hồng Sàn (8%)</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-600">-{formatVND(report.totalPlatformFee)}</p>
            <p className="text-xs text-slate-400 mt-1.5">Khấu trừ tự động 8% theo điều khoản sàn</p>
          </div>

          {/* Thực Nhận Nhà Xe */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Thực Nhận Nhà Xe (92%)</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{formatVND(report.totalNetRevenue)}</p>
            <p className="text-xs text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Đã sẵn sàng tạo lệnh rút tiền
            </p>
          </div>

          {/* Tỷ Lệ Lấp Đầy Trung Bình */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Tỷ Lệ Lấp Đầy TB</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-blue-600">{report.avgOccupancyRate}%</p>
              <span className="text-xs font-medium text-slate-500">({report.totalTrips} chuyến)</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                <Flame className="w-3.5 h-3.5" /> {report.peakTripsCount} cao điểm
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-rose-500 font-medium">
                <ArrowDownRight className="w-3.5 h-3.5" /> {report.lowTripsCount} thấp điểm
              </span>
            </div>
          </div>
        </div>

        {/* 4. BIỂU ĐỒ TRỰC QUAN RECHARTS (DỮ LIỆU THỰC TẾ TỪ CSDL) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {chartMode === 'REVENUE' ? 'Biểu Đồ Doanh Thu Thực Tế & Hoa Hồng Sàn' : 'Biểu Đồ Diễn Biến Tỷ Lệ Lấp Đầy Ghế (%)'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Trực quan hóa xu hướng doanh thu và lượng vé bán ra theo chuỗi thời gian thực
              </p>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setChartMode('REVENUE')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  chartMode === 'REVENUE'
                    ? 'bg-white text-indigo-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📊 Doanh Thu (VNĐ)
              </button>
              <button
                onClick={() => setChartMode('OCCUPANCY')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  chartMode === 'OCCUPANCY'
                    ? 'bg-white text-blue-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📈 Tỷ Lệ Lấp Đầy (%)
              </button>
            </div>
          </div>

          {/* Khung vẽ Recharts */}
          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <RefreshCw className="w-7 h-7 animate-spin text-indigo-500 mb-2" />
                <p className="text-xs font-medium">Đang truy vấn số liệu biểu đồ từ CSDL...</p>
              </div>
            ) : report.chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-medium text-slate-500">Chưa phát sinh dữ liệu biểu đồ trong khoảng thời gian này</p>
              </div>
            ) : chartMode === 'REVENUE' ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={report.chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}Tr`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => {
                      const num = Number(value) || 0;
                      if (name === 'grossRevenue') return [formatVND(num), 'Tổng Doanh Thu'];
                      if (name === 'netRevenue') return [formatVND(num), 'Thực Nhận Nhà Xe'];
                      if (name === 'platformFee') return [formatVND(num), 'Phí Sàn 8%'];
                      return [value, name];
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Legend
                    formatter={(value) => {
                      if (value === 'grossRevenue') return <span className="text-xs font-medium text-slate-700">Tổng Doanh Thu</span>;
                      if (value === 'netRevenue') return <span className="text-xs font-medium text-emerald-700">Thực Nhận Nhà Xe</span>;
                      if (value === 'platformFee') return <span className="text-xs font-medium text-amber-700">Phí Sàn 8%</span>;
                      return value;
                    }}
                  />
                  <Bar dataKey="grossRevenue" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="netRevenue" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Line type="monotone" dataKey="platformFee" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report.chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => {
                      if (name === 'occupancyRate') return [`${value}%`, 'Tỷ Lệ Lấp Đầy'];
                      if (name === 'bookings') return [`${value} vé`, 'Vé Đã Bán'];
                      return [value, name];
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs font-medium text-blue-700">
                        {value === 'occupancyRate' ? 'Tỷ Lệ Lấp Đầy Ghế (%)' : value}
                      </span>
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="occupancyRate"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#occupancyGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 5. PHẦN TABS BẢNG KÊ: CHI TIẾT CHUYẾN XE VS TỔNG HỢP THEO TUYẾN */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Tabs & Search */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('TRIPS')}
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'TRIPS'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bus className="w-4 h-4" />
                Chi Tiết Từng Chuyến Xe ({report.tripPerformances.length})
              </button>
              <button
                onClick={() => setActiveTab('ROUTES')}
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'ROUTES'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                Thống Kê Theo Tuyến Đường ({report.routePerformances.length})
              </button>
            </div>

            {/* Bộ lọc cho Tab Chuyến Xe */}
            {activeTab === 'TRIPS' && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm mã chuyến, tuyến, biển số..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <select
                  value={filterLevel}
                  onChange={(e: any) => setFilterLevel(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none"
                >
                  <option value="ALL">Tất Cả Mức Độ</option>
                  <option value="PEAK">🔥 Cao Điểm (≥ 80%)</option>
                  <option value="LOW">⚠️ Thấp Điểm (&lt; 50%)</option>
                </select>
              </div>
            )}
          </div>

          {/* NỘI DUNG TAB 1: CHI TIẾT TỪNG CHUYẾN XE */}
          {activeTab === 'TRIPS' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-4">Mã Chuyến & Tuyến</th>
                    <th className="py-3.5 px-4">Giờ Xuất Bến</th>
                    <th className="py-3.5 px-4">Phương Tiện</th>
                    <th className="py-3.5 px-4 text-center">Tỷ Lệ Lấp Đầy</th>
                    <th className="py-3.5 px-4 text-center">Vé Đã Bán</th>
                    <th className="py-3.5 px-4 text-right">Tổng Doanh Thu</th>
                    <th className="py-3.5 px-4 text-right">Phí Sàn (8%)</th>
                    <th className="py-3.5 px-4 text-right">Thực Nhận</th>
                    <th className="py-3.5 px-4 text-center">Phân Loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                        <p className="text-xs text-slate-400">Đang tổng hợp dữ liệu chuyến xe từ CSDL Supabase...</p>
                      </td>
                    </tr>
                  ) : filteredTrips.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <BarChart3 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700">Không tìm thấy chuyến xe nào phù hợp điều kiện lọc</p>
                        <p className="text-xs text-slate-400 mt-1">Vui lòng điều chỉnh lại từ khóa tìm kiếm hoặc mức độ lấp đầy.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTrips.map((row) => (
                      <tr key={row.tripId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{row.tripCode}</p>
                          <p className="text-xs text-slate-500">{row.routeName}</p>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                          {row.departureTime}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                            {row.licensePlate}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">{row.busType}</p>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  row.occupancyRate >= 80
                                    ? 'bg-emerald-500'
                                    : row.occupancyRate >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(row.occupancyRate, 100)}%` }}
                              />
                            </div>
                            <span className="font-bold text-xs text-slate-800">{row.occupancyRate}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-indigo-600">{row.bookedSeats}</span>
                          <span className="text-xs text-slate-400"> / {row.totalSeats}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          {formatVND(row.grossRevenue)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-xs text-amber-600 font-medium">
                          -{formatVND(row.platformFee)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                          {formatVND(row.netRevenue)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {row.occupancyLevel === 'PEAK' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              <Flame className="w-3 h-3 text-emerald-600" /> Cao điểm
                            </span>
                          ) : row.occupancyLevel === 'LOW' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                              <AlertTriangle className="w-3 h-3 text-rose-600" /> Thấp điểm
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                              Bình thường
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* NỘI DUNG TAB 2: TỔNG HỢP THEO TUYẾN ĐƯỜNG */}
          {activeTab === 'ROUTES' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-4">Tên Tuyến Đường</th>
                    <th className="py-3.5 px-4 text-center">Số Chuyến</th>
                    <th className="py-3.5 px-4 text-center">Vé Bán / Tổng Chỗ</th>
                    <th className="py-3.5 px-4 text-center">Tỷ Lệ Lấp Đầy TB</th>
                    <th className="py-3.5 px-4 text-right">Tổng Doanh Thu</th>
                    <th className="py-3.5 px-4 text-right">Phí Sàn (8%)</th>
                    <th className="py-3.5 px-4 text-right">Thực Nhận Nhà Xe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {report.routePerformances.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <BarChart3 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700">Chưa có dữ liệu tuyến đường trong kỳ này</p>
                      </td>
                    </tr>
                  ) : (
                    report.routePerformances.map((r) => (
                      <tr key={r.routeId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{r.routeName}</p>
                          <p className="text-xs text-slate-400">Mã tuyến: {r.routeId}</p>
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-slate-700">{r.tripsCount} chuyến</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-indigo-600">{r.bookedSeats}</span>
                          <span className="text-xs text-slate-400"> / {r.totalSeats}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  r.occupancyRate >= 80
                                    ? 'bg-emerald-500'
                                    : r.occupancyRate >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(r.occupancyRate, 100)}%` }}
                              />
                            </div>
                            <span className="font-bold text-xs text-slate-800">{r.occupancyRate}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          {formatVND(r.grossRevenue)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-xs text-amber-600 font-medium">
                          -{formatVND(r.platformFee)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                          {formatVND(r.netRevenue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CompanyReportsPage;
