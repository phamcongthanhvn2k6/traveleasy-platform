/**
 * @file CompanyShiftsPage.tsx
 * @description Quản lý Ca trực & Bàn giao Tiền mặt Quầy Bến Xe (/company/shifts)
 * @author Đoàn Nhật Cường (Josh Liam)
 * @role Frontend & POS Specialist
 */
import React, { useState, useEffect } from 'react';
import {
  Clock,
  DollarSign,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Printer,
  PlusCircle,
  Lock,
  Unlock,
  Calendar,
  User,
  ArrowRight,
  RefreshCw,
  FileText
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';

interface ShiftRecord {
  id: string;
  shiftCode: string;
  cashierName: string;
  counterName: string;
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  cashRevenue: number;
  expectedEndingCash: number;
  actualEndingCash?: number;
  difference?: number;
  ticketCount: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

const STORAGE_KEY = 'traveleasy_company_shifts';

export const CompanyShiftsPage: React.FC = () => {
  const [shifts, setShifts] = useState<ShiftRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveShifts = (newShifts: ShiftRecord[]) => {
    setShifts(newShifts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newShifts));
  };

  // Modal mở ca
  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
  const [newCashierName, setNewCashierName] = useState('Đoàn Nhật Cường');
  const [newCounterName, setNewCounterName] = useState('Quầy Vé Số 02 - Bến Xe Miền Đông');
  const [newInitialCash, setNewInitialCash] = useState<number>(1000000);

  // Modal đóng ca (Z-Report)
  const [selectedShiftToClose, setSelectedShiftToClose] = useState<ShiftRecord | null>(null);
  const [actualEndingCashInput, setActualEndingCashInput] = useState<number>(0);
  const [closingNote, setClosingNote] = useState('');

  // Ca hiện tại đang mở
  const currentActiveShift = shifts.find((s) => s.status === 'OPEN');

  const handleOpenShift = () => {
    if (!newCashierName.trim()) {
      toast.error('Vui lòng nhập tên thu ngân');
      return;
    }
    if (newInitialCash < 0) {
      toast.error('Số tiền ban đầu không hợp lệ');
      return;
    }

    const newShift: ShiftRecord = {
      id: `shift-${Date.now()}`,
      shiftCode: `CA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${shifts.length + 1}`,
      cashierName: newCashierName,
      counterName: newCounterName,
      openedAt: new Date().toLocaleString('vi-VN'),
      initialCash: Number(newInitialCash),
      cashRevenue: 0,
      expectedEndingCash: Number(newInitialCash),
      ticketCount: 0,
      status: 'OPEN',
      notes: 'Vừa khởi tạo ca trực mới'
    };

    saveShifts([newShift, ...shifts]);
    setIsOpeningModalOpen(false);
    toast.success('Mở ca trực thành công! Sẵn sàng bán vé quầy POS.');
  };

  const handleCloseShift = () => {
    if (!selectedShiftToClose) return;

    const diff = Number(actualEndingCashInput) - selectedShiftToClose.expectedEndingCash;

    const updated = shifts.map((s) => {
      if (s.id === selectedShiftToClose.id) {
        return {
          ...s,
          closedAt: new Date().toLocaleString('vi-VN'),
          actualEndingCash: Number(actualEndingCashInput),
          difference: diff,
          status: 'CLOSED' as const,
          notes: closingNote || (diff === 0 ? 'Khớp doanh thu 100%' : `Lệch: ${diff.toLocaleString()}đ`)
        };
      }
      return s;
    });

    saveShifts(updated);
    setSelectedShiftToClose(null);
    toast.success('Đã kết ca trực và xuất biên bản bàn giao Z-Report thành công!');
  };

  const handlePrintZReport = (shift: ShiftRecord) => {
    toast.info(`Đang gửi lệnh in phiếu kết ca Z-Report cho ca: ${shift.shiftCode}...`);
    window.print();
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* BANNER THÔNG TIN TASK SPRINT 3 & NGƯỜI PHỤ TRÁCH */}
        <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md mb-6 border border-purple-700/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 uppercase">
                  SPRINT 3 TASK
                </span>
                <span className="text-xs font-semibold text-purple-200">Mã thẻ: [S305][SHIFTS] • Định mức: 3 SP</span>
              </div>
              <h2 className="text-xl font-bold mt-1.5 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-300" />
                Quản Lý Ca Trực & Bàn Giao Tiền Mặt Quầy Bến Xe
              </h2>
              <p className="text-xs text-purple-200 mt-1">
                Khởi tạo số tiền lẻ ban đầu, theo dõi doanh thu tiền mặt và in phiếu kết ca Z-Report nộp thủ quỹ
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
              <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center font-bold text-sm shadow">
                C
              </div>
              <div>
                <p className="text-xs text-purple-200">Thành viên phụ trách</p>
                <p className="text-sm font-bold text-white">Đoàn Nhật Cường (@joshliam)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tiêu đề & Nút hành động */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                <Clock className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900">Quản Lý Ca Trực & Bàn Giao Tiền Mặt</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Phân hệ mở ca, chốt doanh thu tiền mặt quầy vé bến xe và lập biên bản bàn giao thủ quỹ Z-Report
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!currentActiveShift ? (
              <button
                onClick={() => setIsOpeningModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                Mở Ca Trực Mới
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedShiftToClose(currentActiveShift);
                  setActualEndingCashInput(currentActiveShift.expectedEndingCash);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium shadow-sm transition-all"
              >
                <Lock className="w-5 h-5" />
                Chốt Ca & In Z-Report ({currentActiveShift.shiftCode})
              </button>
            )}
          </div>
        </div>

        {/* Thẻ trạng thái ca hiện tại */}
        {currentActiveShift && (
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-6 rounded-2xl shadow-lg mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-indigo-700/60 gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  ĐANG TRONG CA TRỰC
                </span>
                <h2 className="text-xl font-bold mt-2">{currentActiveShift.shiftCode}</h2>
                <p className="text-sm text-indigo-200 mt-0.5">
                  Thu ngân: <span className="font-semibold text-white">{currentActiveShift.cashierName}</span> • {currentActiveShift.counterName}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-indigo-300">Giờ mở ca</p>
                <p className="text-sm font-semibold">{currentActiveShift.openedAt}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <p className="text-xs text-indigo-200">Tiền Lẻ Ban Đầu</p>
                <p className="text-xl font-bold mt-1">{currentActiveShift.initialCash.toLocaleString('vi-VN')} đ</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <p className="text-xs text-indigo-200">Doanh Thu Vé Tiền Mặt</p>
                <p className="text-xl font-bold text-emerald-300 mt-1">+{currentActiveShift.cashRevenue.toLocaleString('vi-VN')} đ</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <p className="text-xs text-indigo-200">Tổng Tiền Két Kỳ Vọng</p>
                <p className="text-xl font-bold text-amber-300 mt-1">{currentActiveShift.expectedEndingCash.toLocaleString('vi-VN')} đ</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <p className="text-xs text-indigo-200">Số Vé Đã Xuất</p>
                <p className="text-xl font-bold mt-1">{currentActiveShift.ticketCount} vé</p>
              </div>
            </div>
          </div>
        )}

        {/* Bảng lịch sử các ca trực */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              Lịch Sử & Báo Cáo Đối Soát Ca Trực
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
              Tổng {shifts.length} ca trực
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Mã Ca</th>
                  <th className="py-3.5 px-4">Thu Ngân / Quầy</th>
                  <th className="py-3.5 px-4">Thời Gian</th>
                  <th className="py-3.5 px-4 text-right">Tiền Đầu Ca</th>
                  <th className="py-3.5 px-4 text-right">Tiền Thu Được</th>
                  <th className="py-3.5 px-4 text-right">Thực Nộp Két</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-center">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {shifts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <p className="font-semibold text-slate-700">Chưa có ca trực nào được mở</p>
                      <p className="text-xs text-slate-400 mt-1">Bấm "Mở Ca Trực Mới" ở góc trên để bắt đầu ca làm việc của quầy vé.</p>
                    </td>
                  </tr>
                ) : (
                  shifts.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-indigo-600">{s.shiftCode}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">{s.cashierName}</p>
                      <p className="text-xs text-slate-400">{s.counterName}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      <p>Mở: {s.openedAt}</p>
                      {s.closedAt && <p className="text-slate-400">Đóng: {s.closedAt}</p>}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600 font-medium">
                      {s.initialCash.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                      +{s.cashRevenue.toLocaleString('vi-VN')} đ
                      <span className="block text-xs font-normal text-slate-400">({s.ticketCount} vé)</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {s.actualEndingCash ? `${s.actualEndingCash.toLocaleString('vi-VN')} đ` : '—'}
                      {s.difference !== undefined && s.difference !== 0 && (
                        <span className={`block text-xs ${s.difference > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          Lệch: {s.difference > 0 ? `+${s.difference}` : s.difference} đ
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {s.status === 'OPEN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Unlock className="w-3.5 h-3.5" /> Đang Mở
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" /> Đã Kết Ca
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handlePrintZReport(s)}
                        title="In Biên bản bàn giao Z-Report"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" /> In Z-Report
                      </button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal mở ca mới */}
        {isOpeningModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                Khởi Tạo Ca Trực Bán Vé Mới
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Thu Ngân Đảm Nhiệm</label>
                  <input
                    type="text"
                    value={newCashierName}
                    onChange={(e) => setNewCashierName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Quầy Bến Xe</label>
                  <input
                    type="text"
                    value={newCounterName}
                    onChange={(e) => setNewCounterName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Số Tiền Lẻ Ban Đầu Trong Két (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={newInitialCash}
                    onChange={(e) => setNewInitialCash(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <p className="text-xs text-slate-400 mt-1">Dùng để thối tiền lẻ cho khách mua vé tại quầy.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsOpeningModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg"
                >
                  Hủy Bỏ
                </button>
                <button
                  onClick={handleOpenShift}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm"
                >
                  Xác Nhận Mở Ca
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal đóng ca trực & Z-Report */}
        {selectedShiftToClose && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-amber-600" />
                Chốt Ca Trực & Xuất Báo Cáo Z-Report
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Ca: <span className="font-semibold text-slate-800">{selectedShiftToClose.shiftCode}</span> • Thu ngân:{' '}
                {selectedShiftToClose.cashierName}
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tiền lẻ ban đầu:</span>
                  <span className="font-semibold">{selectedShiftToClose.initialCash.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Doanh thu bán vé tiền mặt:</span>
                  <span className="font-semibold text-emerald-600">+{selectedShiftToClose.cashRevenue.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-bold text-slate-900">
                  <span>Tổng tiền két lý thuyết:</span>
                  <span className="text-indigo-600">{selectedShiftToClose.expectedEndingCash.toLocaleString()} đ</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Tiền Mặt Đếm Thực Tế Trong Két (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={actualEndingCashInput}
                    onChange={(e) => setActualEndingCashInput(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  {Number(actualEndingCashInput) !== selectedShiftToClose.expectedEndingCash && (
                    <p className="text-xs text-rose-500 font-semibold mt-1">
                      ⚠️ Lệch so với hệ thống:{' '}
                      {(Number(actualEndingCashInput) - selectedShiftToClose.expectedEndingCash).toLocaleString()} đ
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi Chú Bàn Giao</label>
                  <textarea
                    rows={2}
                    value={closingNote}
                    onChange={(e) => setClosingNote(e.target.value)}
                    placeholder="Ghi chú về tiền rách, tiền giả (nếu có)..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedShiftToClose(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg"
                >
                  Quay Lại
                </button>
                <button
                  onClick={handleCloseShift}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg shadow-sm"
                >
                  Xác Nhận Đóng Ca & Xuất Z-Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyShiftsPage;
