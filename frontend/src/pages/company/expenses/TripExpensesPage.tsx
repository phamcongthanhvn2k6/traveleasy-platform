/**
 * @file TripExpensesPage.tsx
 * @description [S318] Phân Hệ Quản Lý Chi Phí Chuyến Xe & Tính Lợi Nhuận Ròng P&L (/company/expenses)
 * @author Trần Minh Đức (tranduc2601)
 * @role Backend & Business Engine Specialist
 */
import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Fuel,
  Receipt,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Calendar,
  Bus,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Edit3,
  X,
  FileSpreadsheet
} from 'lucide-react';
import api from '../../../services/api';
import { toast } from '../../../context/ToastContext';

export interface TripProfitLossItem {
  tripId: number;
  tripCode: string;
  routeName: string;
  licensePlate: string;
  departureTime: string;
  arrivalTime?: string;
  status?: string;

  actualRevenue: number;
  fuelCost: number;
  tollBotCost: number;
  driverSalary: number;
  terminalFee: number;
  otherCosts: number;
  totalExpense: number;

  netProfit: number;
  profitMarginPercent: number;
  isLoss: boolean;
  lossAmount: number;

  invoiceNumber?: string;
  notes?: string;
  isLocked: boolean;
  lockNotice?: string;
}

export interface CompanyExpenseSummary {
  trips: TripProfitLossItem[];
  totalRevenue: number;
  totalExpense: number;
  totalNetProfit: number;
  overallMarginPercent: number;
  lossTripsCount: number;
}

const DEFAULT_SUMMARY: CompanyExpenseSummary = {
  trips: [
    {
      tripId: 101,
      tripCode: 'TRIP-HCM-DL-2230',
      routeName: 'TP. Hồ Chí Minh -> Đà Lạt',
      licensePlate: '51B-888.88',
      departureTime: '2026-11-10T22:30:00',
      actualRevenue: 11700000,
      fuelCost: 3200000,
      tollBotCost: 850000,
      driverSalary: 1200000,
      terminalFee: 450000,
      otherCosts: 0,
      totalExpense: 5700000,
      netProfit: 6000000,
      profitMarginPercent: 51.3,
      isLoss: false,
      lossAmount: 0,
      invoiceNumber: 'VAT-HCM-DL-001',
      notes: 'Chuyến xe đầy đủ chứng từ xuất bến',
      isLocked: false,
      lockNotice: 'Sổ chi phí còn mở. Có thể điều chỉnh hóa đơn trong vòng 48h sau chuyến đi.'
    },
    {
      tripId: 102,
      tripCode: 'TRIP-HCM-VT-0700',
      routeName: 'TP. Hồ Chí Minh -> Vũng Tàu',
      licensePlate: '51B-777.77',
      departureTime: '2026-11-10T07:00:00',
      actualRevenue: 3820000,
      fuelCost: 1100000,
      tollBotCost: 320000,
      driverSalary: 600000,
      terminalFee: 250000,
      otherCosts: 0,
      totalExpense: 2270000,
      netProfit: 1550000,
      profitMarginPercent: 40.6,
      isLoss: false,
      lossAmount: 0,
      invoiceNumber: 'VAT-HCM-VT-002',
      notes: 'Tài xế bổ sung vé trạm Long Phước',
      isLocked: false,
      lockNotice: 'Sổ chi phí còn mở. Có thể điều chỉnh hóa đơn trong vòng 48h sau chuyến đi.'
    },
    {
      tripId: 103,
      tripCode: 'TRIP-DL-HCM-1400',
      routeName: 'Đà Lạt -> TP. Hồ Chí Minh',
      licensePlate: '51B-888.88',
      departureTime: '2026-11-11T14:00:00',
      actualRevenue: 4680000,
      fuelCost: 3200000,
      tollBotCost: 850000,
      driverSalary: 1200000,
      terminalFee: 450000,
      otherCosts: 200000,
      totalExpense: 5900000,
      netProfit: -1220000,
      profitMarginPercent: -26.07,
      isLoss: true,
      lossAmount: 1220000,
      invoiceNumber: 'VAT-DL-HCM-003',
      notes: 'Chuyến ít khách giữa tuần, phát sinh phí cứu hộ nhẹ',
      isLocked: false,
      lockNotice: 'CẢNH BÁO: Chuyến xe chạy lỗ -1.220.000đ. Đề xuất điều chỉnh biểu đồ chạy xe.'
    }
  ],
  totalRevenue: 20200000,
  totalExpense: 13870000,
  totalNetProfit: 6330000,
  overallMarginPercent: 31.34,
  lossTripsCount: 1
};

export const TripExpensesPage: React.FC = () => {
  const [summary, setSummary] = useState<CompanyExpenseSummary>(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTrip, setSelectedTrip] = useState<TripProfitLossItem | null>(null);

  // Form state
  const [fuelCost, setFuelCost] = useState<string>('0');
  const [tollBotCost, setTollBotCost] = useState<string>('0');
  const [driverSalary, setDriverSalary] = useState<string>('0');
  const [terminalFee, setTerminalFee] = useState<string>('0');
  const [otherCosts, setOtherCosts] = useState<string>('0');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/company/expenses');
      if (res.data && res.data.success && res.data.data) {
        setSummary(res.data.data);
      }
    } catch (err: any) {
      console.warn('API /company/expenses chưa sẵn sàng hoặc offline, sử dụng dữ liệu mặc định.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const openEditModal = (trip: TripProfitLossItem) => {
    setSelectedTrip(trip);
    setFuelCost(String(trip.fuelCost || 0));
    setTollBotCost(String(trip.tollBotCost || 0));
    setDriverSalary(String(trip.driverSalary || 0));
    setTerminalFee(String(trip.terminalFee || 0));
    setOtherCosts(String(trip.otherCosts || 0));
    setInvoiceNumber(trip.invoiceNumber || '');
    setNotes(trip.notes || '');
    setIsLocked(Boolean(trip.isLocked));
    setIsModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;

    if (selectedTrip.isLocked) {
      toast.error('Sổ chi phí chuyến này đã bị khóa. Không thể chỉnh sửa!', 'Thao Tác Bị Chặn');
      return;
    }

    const payload = {
      fuelCost: parseFloat(fuelCost) || 0,
      tollBotCost: parseFloat(tollBotCost) || 0,
      driverSalary: parseFloat(driverSalary) || 0,
      terminalFee: parseFloat(terminalFee) || 0,
      otherCosts: parseFloat(otherCosts) || 0,
      invoiceNumber: invoiceNumber.trim(),
      notes: notes.trim(),
      isLocked: isLocked
    };

    if (payload.fuelCost < 0 || payload.tollBotCost < 0 || payload.driverSalary < 0 || payload.terminalFee < 0 || payload.otherCosts < 0) {
      toast.error('Các khoản chi phí vận hành không được là số âm!', 'Lỗi Xác Thực Dữ Liệu');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/company/expenses/trips/${selectedTrip.tripId}`, payload);
      if (res.data && res.data.success) {
        toast.success('Đã lưu chi phí vận hành và cập nhật báo cáo lãi lỗ thành công!', 'Cập Nhật Thành Công');
        setIsModalOpen(false);
        fetchExpenses();
      } else {
        const msg = res.data?.message || 'Không thể lưu chi phí chuyến xe.';
        toast.error(msg, 'Thao Tác Thất Bại');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể kết nối máy chủ để lưu chi phí.';
      toast.error(msg, 'Thao Tác Thất Bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Sổ Thu Chi & Báo Cáo Lãi Lỗ Chuyến Xe (P&L)
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded-full">
                Task S318 - TMD
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Quản lý chi phí xăng dầu, vé BOT cầu đường, phụ cấp tài xế và hóa đơn đỏ để tự động tính Lợi nhuận ròng cho từng chuyến xe.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (summary.trips.length > 0) {
              openEditModal(summary.trips[0]);
            } else {
              toast.info('Hiện chưa có chuyến xe nào để kê khai chi phí.', 'Thông Báo');
            }
          }}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition flex items-center gap-2 self-start md:self-auto shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Nhập Chi Phí Mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Tổng Doanh Thu Bán Vé</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {summary.totalRevenue.toLocaleString('vi-VN')} đ
          </p>
          <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">Đã đối soát vé hoàn tất</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-rose-500 font-medium uppercase tracking-wider">Tổng Chi Phí Vận Hành</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            {summary.totalExpense.toLocaleString('vi-VN')} đ
          </p>
          <span className="text-xs text-slate-400 mt-1 inline-block">Dầu nhớt, BOT, lương, bến bãi</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-emerald-500 font-medium uppercase tracking-wider">Lợi Nhuận Ròng (Net P&L)</p>
          <p className={`text-2xl font-bold mt-1 ${summary.totalNetProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {summary.totalNetProfit >= 0 ? `+${summary.totalNetProfit.toLocaleString('vi-VN')} đ` : `${summary.totalNetProfit.toLocaleString('vi-VN')} đ`}
          </p>
          <span className="text-xs text-slate-400 mt-1 inline-block">Doanh thu trừ tổng chi phí</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-blue-500 font-medium uppercase tracking-wider">Tỷ Suất Sinh Lời Bình Quân</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {summary.overallMarginPercent}%
          </p>
          <span className="text-xs text-slate-400 mt-1 inline-block">Lợi nhuận ròng / Doanh thu</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 shadow-sm bg-rose-50/30 dark:bg-rose-950/20">
          <p className="text-xs text-rose-600 font-bold uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Số Chuyến Xe Chạy Lỗ
          </p>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            {summary.lossTripsCount} chuyến
          </p>
          <span className="text-xs text-rose-500 mt-1 inline-block">Chi phí vượt doanh thu vé</span>
        </div>
      </div>

      {/* Bảng chi tiết chi phí theo chuyến */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Fuel className="w-5 h-5 text-amber-600" />
            Bảng Kê Chi Tiết Chi Phí & Lãi Lỗ Từng Chuyến Xe
          </h2>
          <span className="text-xs text-slate-500 font-medium">Bảo mật cấp cao: Chỉ Chủ xe & Kế toán trưởng được xem</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Chuyến Xe & Biển Số</th>
                <th className="py-3 px-4 text-right">Doanh Thu Vé</th>
                <th className="py-3 px-4 text-right">Nhiên Liệu</th>
                <th className="py-3 px-4 text-right">Cầu Đường BOT</th>
                <th className="py-3 px-4 text-right">Lương Tài Xế</th>
                <th className="py-3 px-4 text-right">Bến Bãi & Khác</th>
                <th className="py-3 px-4 text-right">Tổng Chi Phí</th>
                <th className="py-3 px-4 text-right">Lợi Nhuận Ròng</th>
                <th className="py-3 px-4 text-center">Tỷ Suất (P&L)</th>
                <th className="py-3 px-4 text-center">Số Hóa Đơn Đỏ</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {summary.trips.map((r) => (
                <tr
                  key={r.tripId}
                  className={`transition ${r.isLoss ? 'bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-100/50' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'}`}
                >
                  <td className="py-3 px-4 font-sans">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{r.routeName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Xe: <span className="font-bold text-blue-600">{r.licensePlate}</span> | Mã: <span className="font-mono">{r.tripCode}</span>
                    </p>
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {r.actualRevenue.toLocaleString('vi-VN')} đ
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {r.fuelCost.toLocaleString('vi-VN')} đ
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {r.tollBotCost.toLocaleString('vi-VN')} đ
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {r.driverSalary.toLocaleString('vi-VN')} đ
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {(r.terminalFee + r.otherCosts).toLocaleString('vi-VN')} đ
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 text-sm">
                    {r.totalExpense.toLocaleString('vi-VN')} đ
                  </td>

                  <td className={`py-3 px-4 text-right font-mono font-bold text-sm ${r.isLoss ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {r.netProfit >= 0 ? `+${r.netProfit.toLocaleString('vi-VN')} đ` : `${r.netProfit.toLocaleString('vi-VN')} đ`}
                  </td>

                  <td className="py-3 px-4 text-center font-sans">
                    {r.isLoss ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-300 inline-flex items-center gap-1 shadow-sm">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Lỗ ({r.profitMarginPercent}%)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 inline-flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        Lãi +{r.profitMarginPercent}%
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center font-sans">
                    {r.invoiceNumber ? (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-mono text-xs font-bold border border-blue-200">
                        {r.invoiceNumber}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Chưa có HĐ</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center font-sans">
                    <button
                      onClick={() => openEditModal(r)}
                      disabled={r.isLocked}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 ${
                        r.isLocked
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}
                      title={r.isLocked ? 'Sổ chi phí đã khóa sau 48h hoặc đã chốt đối soát' : 'Kê khai hoặc điều chỉnh chi phí'}
                    >
                      {r.isLocked ? <Lock className="w-3.5 h-3.5 text-slate-400" /> : <Edit3 className="w-3.5 h-3.5 text-amber-600" />}
                      {r.isLocked ? 'Đã Khóa' : 'Kê Khai'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Kê Khai Chi Phí Vận Hành */}
      {isModalOpen && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-600" />
                  Kê Khai Sổ Chi Phí Vận Hành Chuyến
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chuyến: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTrip.routeName}</span> ({selectedTrip.licensePlate})
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chi Phí Nhiên Liệu / Dầu Nhớt (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="VD: 3200000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vé Trạm Thu Phí / Cầu Đường BOT (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={tollBotCost}
                    onChange={(e) => setTollBotCost(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="VD: 850000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lương / Phụ Cấp Lái & Phụ Xe (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={driverSalary}
                    onChange={(e) => setDriverSalary(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="VD: 1200000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lệ Phí Ra Vào Bến Bãi (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={terminalFee}
                    onChange={(e) => setTerminalFee(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="VD: 450000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chi Phí Phát Sinh Hợp Lệ Khác (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={otherCosts}
                    onChange={(e) => setOtherCosts(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="VD: 100000 (Rửa xe, tiếp nước, vệ sinh xe...)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số Hóa Đơn Đỏ / Chứng Từ VAT
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="VD: VAT-2026-8899"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi Chú Diễn Giải Chi Phí
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="Ghi chú nội dung chi phí, tài xế nộp kèm liên đỏ hoặc chứng từ điện tử..."
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Lưu ý kiểm soát nội bộ:</strong> Số chi phí chỉ được chỉnh sửa trong vòng 48 giờ sau khi chuyến xe kết thúc. Sau thời hạn này, sổ sẽ tự động khóa vĩnh viễn để bảo vệ tính bất biến kế toán tài chính.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold transition flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {submitting ? 'Đang Lưu...' : 'Lưu Sổ Chi Phí'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripExpensesPage;
