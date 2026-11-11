/**
 * @file TripExpensesPage.tsx
 * @description [S318] Phân Hệ Quản Lý Chi Phí Chuyến Xe & Tính Lợi Nhuận Ròng (/company/expenses)
 * @author Trần Minh Đức (tranduc2601)
 * @role Backend & Business Engine Specialist
 */
import React, { useState } from 'react';
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
  FileSpreadsheet
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';

interface TripExpenseRecord {
  id: string;
  tripCode: string;
  route: string;
  departureDate: string;
  licensePlate: string;
  ticketRevenue: number;
  cargoRevenue: number;
  totalRevenue: number;
  fuelCost: number;
  tollBotCost: number;
  driverSalary: number;
  terminalFee: number;
  totalExpense: number;
  netProfit: number;
  marginPercent: number;
}

export const TripExpensesPage: React.FC = () => {
  const [records] = useState<TripExpenseRecord[]>([
    {
      id: 'EXP-01',
      tripCode: 'TRIP-HCM-DL-2230',
      route: 'TP. Hồ Chí Minh ➔ Đà Lạt',
      departureDate: '10/11/2026',
      licensePlate: '51B-888.88',
      ticketRevenue: 10200000,
      cargoRevenue: 1500000,
      totalRevenue: 11700000,
      fuelCost: 3200000,
      tollBotCost: 850000,
      driverSalary: 1200000,
      terminalFee: 450000,
      totalExpense: 5700000,
      netProfit: 6000000,
      marginPercent: 51.3
    },
    {
      id: 'EXP-02',
      tripCode: 'TRIP-HCM-VT-0700',
      route: 'TP. Hồ Chí Minh ➔ Vũng Tàu',
      departureDate: '10/11/2026',
      licensePlate: '51B-777.77',
      ticketRevenue: 3420000,
      cargoRevenue: 400000,
      totalRevenue: 3820000,
      fuelCost: 1100000,
      tollBotCost: 320000,
      driverSalary: 600000,
      terminalFee: 250000,
      totalExpense: 2270000,
      netProfit: 1550000,
      marginPercent: 40.6
    },
    {
      id: 'EXP-03',
      tripCode: 'TRIP-DL-HCM-1400',
      route: 'Đà Lạt ➔ TP. Hồ Chí Minh',
      departureDate: '11/11/2026',
      licensePlate: '51B-888.88',
      ticketRevenue: 4080000,
      cargoRevenue: 600000,
      totalRevenue: 4680000,
      fuelCost: 3200000,
      tollBotCost: 850000,
      driverSalary: 1200000,
      terminalFee: 450000,
      totalExpense: 5700000,
      netProfit: -1020000,
      marginPercent: -21.8
    }
  ]);

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
                Sổ Thu Chi & Lợi Nhuận Chuyến Xe
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded-full">
                Task S318 - TMD
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Quản lý chi phí dầu nhớt, vé cầu đường BOT, công tài xế để tính toán Lợi nhuận ròng (P&L) cho từng chuyến xe.
            </p>
          </div>
        </div>

        <button
          onClick={() => toast.info('Chức năng nhập hóa đơn chi phí mới đang mở.', 'Nhập Chi Phí')}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition flex items-center gap-2 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Nhập Chi Phí Mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium uppercase">Tổng Doanh Thu Vé & Hàng</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">20.200.000đ</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-rose-500 font-medium uppercase">Tổng Chi Phí Vận Hành</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">13.670.000đ</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-emerald-500 font-medium uppercase">Lợi Nhuận Ròng (Net)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">+6.530.000đ</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-blue-500 font-medium uppercase">Tỷ Suất Lãi Trung Bình</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">32.3%</p>
        </div>
      </div>

      {/* Bảng chi tiết */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Fuel className="w-5 h-5 text-amber-600" />
            Bảng Kê Chi Tiết Chi Phí Theo Chuyến
          </h2>
          <span className="text-xs text-slate-500">Tự động đối soát với vé đã bán</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Chuyến Xe & Biển Số</th>
                <th className="py-3 px-4 text-right">Tổng Doanh Thu</th>
                <th className="py-3 px-4 text-right">Dầu Nhớt</th>
                <th className="py-3 px-4 text-right">Cầu Đường BOT</th>
                <th className="py-3 px-4 text-right">Công Lái Xe</th>
                <th className="py-3 px-4 text-right">Tổng Chi Phí</th>
                <th className="py-3 px-4 text-right">Lợi Nhuận Ròng</th>
                <th className="py-3 px-4 text-center">Tỷ Suất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-xs">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-sans">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{r.route}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Xe: <span className="font-bold text-blue-600">{r.licensePlate}</span> | Ngày: {r.departureDate}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white text-sm">
                    {r.totalRevenue.toLocaleString()}đ
                  </td>
                  <td className="py-3 px-4 text-right text-rose-600">
                    {r.fuelCost.toLocaleString()}đ
                  </td>
                  <td className="py-3 px-4 text-right text-rose-600">
                    {r.tollBotCost.toLocaleString()}đ
                  </td>
                  <td className="py-3 px-4 text-right text-rose-600">
                    {r.driverSalary.toLocaleString()}đ
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-rose-600 text-sm">
                    {r.totalExpense.toLocaleString()}đ
                  </td>
                  <td className={`py-3 px-4 text-right font-bold text-sm ${r.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {r.netProfit >= 0 ? `+${r.netProfit.toLocaleString()}đ` : `${r.netProfit.toLocaleString()}đ`}
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    {r.marginPercent >= 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {r.marginPercent}%
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Lỗ ({r.marginPercent}%)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default TripExpensesPage;
