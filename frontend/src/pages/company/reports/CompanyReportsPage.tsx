/**
 * @file CompanyReportsPage.tsx
 * @description Báo Cáo Thống Kê Doanh Thu & Tỷ Lệ Lấp Đầy Ghế Nhà Xe (/company/reports)
 * @author Nguyễn Đại Phát (phatnguyn146)
 * @role Analytics & Finance Specialist
 * @task [S310][REPORTS] Sprint 3 (3 SP)
 */
import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  DollarSign,
  Ticket,
  Users,
  Percent,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';

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

export const CompanyReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('MONTH'); // 'WEEK' | 'MONTH' | 'QUARTER'

  // Dữ liệu hiệu suất tuyến xe
  const performanceData: RoutePerformance[] = [
    {
      routeId: 'route-01',
      routeName: 'TP. Hồ Chí Minh ➔ Đà Lạt (Khứ Hồi)',
      tripsCount: 42,
      totalSeats: 1428,
      bookedSeats: 1314,
      occupancyRate: 92.0,
      grossRevenue: 394200000,
      platformFee: 31536000,
      netRevenue: 362664000
    },
    {
      routeId: 'route-02',
      routeName: 'TP. Hồ Chí Minh ➔ Nha Trang (Khứ Hồi)',
      tripsCount: 28,
      totalSeats: 952,
      bookedSeats: 818,
      occupancyRate: 85.9,
      grossRevenue: 228900000,
      platformFee: 18312000,
      netRevenue: 210588000
    },
    {
      routeId: 'route-03',
      routeName: 'TP. Hồ Chí Minh ➔ Phan Thiết / Mũi Né',
      tripsCount: 30,
      totalSeats: 1020,
      bookedSeats: 795,
      occupancyRate: 77.9,
      grossRevenue: 159000000,
      platformFee: 12720000,
      netRevenue: 146280000
    },
    {
      routeId: 'route-04',
      routeName: 'TP. Hồ Chí Minh ➔ Cần Thơ / Miền Tây',
      tripsCount: 20,
      totalSeats: 680,
      bookedSeats: 490,
      occupancyRate: 72.1,
      grossRevenue: 88200000,
      platformFee: 7056000,
      netRevenue: 81144000
    }
  ];

  // Tính tổng
  const totalGross = performanceData.reduce((acc, cur) => acc + cur.grossRevenue, 0);
  const totalFee = performanceData.reduce((acc, cur) => acc + cur.platformFee, 0);
  const totalNet = performanceData.reduce((acc, cur) => acc + cur.netRevenue, 0);
  const totalTickets = performanceData.reduce((acc, cur) => acc + cur.bookedSeats, 0);
  const avgOccupancy = (
    performanceData.reduce((acc, cur) => acc + cur.occupancyRate, 0) / performanceData.length
  ).toFixed(1);

  const handleExportCSV = () => {
    toast.info('Đang tạo file bảng tính Báo cáo doanh thu & Đối soát TravelEasy...');
    setTimeout(() => {
      const csvHeader = 'Mã Tuyến,Tên Tuyến,Số Chuyến,Tổng Ghế,Vé Đã Bán,Tỷ Lệ Lấp Đầy (%),Tổng Doanh Thu (VNĐ),Phí Sàn 8% (VNĐ),Thực Nhận Nhà Xe (VNĐ)\n';
      const csvRows = performanceData
        .map(
          (p) =>
            `"${p.routeId}","${p.routeName}",${p.tripsCount},${p.totalSeats},${p.bookedSeats},${p.occupancyRate}%,${p.grossRevenue},${p.platformFee},${p.netRevenue}`
        )
        .join('\n');
      const blob = new Blob(['\uFEFF' + csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bao_Cao_Doanh_Thu_Nha_Xe_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Đã tải xuống file CSV báo cáo tài chính thành công!');
    }, 600);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* BANNER THÔNG TIN TASK SPRINT 3 & NGƯỜI PHỤ TRÁCH */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md mb-6 border border-emerald-700/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 uppercase">
                  SPRINT 3 TASK
                </span>
                <span className="text-xs font-semibold text-emerald-200">Mã thẻ: [S310][REPORTS] • Định mức: 3 SP</span>
              </div>
              <h2 className="text-xl font-bold mt-1.5 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-300" />
                Phân Hệ Báo Cáo Thống Kê Doanh Thu & Tỷ Lệ Lấp Đầy Ghế Nhà Xe
              </h2>
              <p className="text-xs text-emerald-200 mt-1">
                Theo dõi hiệu quả tài chính, tỷ lệ lấp đầy từng tuyến xe và lập bảng đối soát chiết khấu sàn 8%
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
              <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-sm shadow">
                P
              </div>
              <div>
                <p className="text-xs text-emerald-200">Thành viên phụ trách</p>
                <p className="text-sm font-bold text-white">Nguyễn Đại Phát (@phatnguyn146)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tiêu đề & Bộ lọc thời gian */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Báo Cáo Hoạt Động & Doanh Thu</h1>
            <p className="text-sm text-slate-500">Kỳ đối soát: Tháng 11/2026 • Chiết khấu hoa hồng sàn: 8%</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="WEEK">7 Ngày Gần Nhất</option>
              <option value="MONTH">Tháng Này (11/2026)</option>
              <option value="QUARTER">Quý 4/2026</option>
            </select>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Xuất Báo Cáo Excel/CSV
            </button>
          </div>
        </div>

        {/* Thẻ KPI Tài Chính */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Tổng Doanh Thu Bán Vé</span>
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalGross.toLocaleString('vi-VN')} đ</p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% so với tháng trước
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Hoa Hồng Sàn (8%)</span>
              <Percent className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-600">-{totalFee.toLocaleString('vi-VN')} đ</p>
            <p className="text-xs text-slate-400 mt-1">Khấu trừ tự động qua PayOS / VNPAY</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Thực Nhận Nhà Xe</span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">{totalNet.toLocaleString('vi-VN')} đ</p>
            <p className="text-xs text-emerald-700 font-medium mt-1">Đã sẵn sàng kết toán</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Tỷ Lệ Lấp Đầy Trung Bình</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{avgOccupancy}%</p>
            <p className="text-xs text-slate-400 mt-1">Tổng cộng {totalTickets.toLocaleString()} vé đã bán</p>
          </div>
        </div>

        {/* Bảng kê chi tiết theo từng tuyến xe */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Chi Tiết Hiệu Quả & Doanh Thu Từng Tuyến Đường
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
              {performanceData.length} tuyến xe hoạt động
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Tuyến Đường</th>
                  <th className="py-3.5 px-4 text-center">Số Chuyến</th>
                  <th className="py-3.5 px-4 text-center">Vé Bán / Tổng Chỗ</th>
                  <th className="py-3.5 px-4 text-center">Tỷ Lệ Lấp Đầy</th>
                  <th className="py-3.5 px-4 text-right">Tổng Doanh Thu</th>
                  <th className="py-3.5 px-4 text-right">Phí Sàn (8%)</th>
                  <th className="py-3.5 px-4 text-right">Thực Nhận Nhà Xe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {performanceData.map((row) => (
                  <tr key={row.routeId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{row.routeName}</p>
                      <p className="text-xs text-slate-400">Mã: {row.routeId}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-700">{row.tripsCount} chuyến</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-indigo-600">{row.bookedSeats}</span>
                      <span className="text-xs text-slate-400"> / {row.totalSeats}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.occupancyRate >= 85
                                ? 'bg-emerald-500'
                                : row.occupancyRate >= 75
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${row.occupancyRate}%` }}
                          />
                        </div>
                        <span className="font-bold text-xs text-slate-700">{row.occupancyRate}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {row.grossRevenue.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-amber-600 font-medium">
                      -{row.platformFee.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                      {row.netRevenue.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyReportsPage;
