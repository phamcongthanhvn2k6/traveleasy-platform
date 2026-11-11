/**
 * @file TicketExchangePage.tsx
 * @description [S316] Phân Hệ Đổi Vé, Đổi Giờ Chạy & Chuyển Ghế Linh Hoạt (/company/ticket-exchange)
 * @author Trần Minh Đức (tranduc2601)
 * @role Backend & Business Engine Specialist
 */
import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Ticket,
  User,
  DollarSign,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';

export const TicketExchangePage: React.FC = () => {
  const [ticketCodeSearch, setTicketCodeSearch] = useState('');
  const [foundTicket, setFoundTicket] = useState<{
    ticketCode: string;
    bookingCode: string;
    customerName: string;
    phone: string;
    currentTrip: string;
    departureTime: string;
    seatNumber: string;
    price: number;
    status: string;
  } | null>({
    ticketCode: 'TK-20261110-CT03-01',
    bookingCode: 'BK-20261110-CT03',
    customerName: 'Nguyễn Văn Du Khách',
    phone: '0912345678',
    currentTrip: 'TP. Hồ Chí Minh ➔ Đà Lạt (22:30 10/11/2026)',
    departureTime: '22:30 10/11/2026',
    seatNumber: 'A05',
    price: 340000,
    status: 'ISSUED'
  });

  const [targetTrip, setTargetTrip] = useState('TRIP-VIP-0630');
  const [targetSeat, setTargetSeat] = useState('A03');
  const targetPrice = 420000;
  const priceDiff = targetPrice - (foundTicket?.price || 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCodeSearch.trim()) {
      toast.warning('Vui lòng nhập mã vé cần đổi.', 'Tra Cứu');
      return;
    }
    toast.success(`Đã tìm thấy thông tin vé: ${ticketCodeSearch.trim()}`, 'Thành Công');
  };

  const handleExchange = () => {
    toast.success(
      `Đã chuyển thành công sang ghế ${targetSeat} (Phụ thu: ${priceDiff.toLocaleString()}đ).`,
      'Đổi Vé Thành Công'
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <ArrowLeftRight className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Đổi Vé & Chuyển Chuyến Xe
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full">
                Task S316 - TMD
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Quy trình đổi vé, chuyển đổi khung giờ xuất bến và xử lý chênh lệch giá vé tự động cho hành khách.
            </p>
          </div>
        </div>
      </div>

      {/* Tra cứu vé */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          1. Tra Cứu Vé Cần Đổi
        </h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={ticketCodeSearch}
            onChange={(e) => setTicketCodeSearch(e.target.value)}
            placeholder="Nhập mã vé (VD: TK-20261110-CT03-01 hoặc mã đơn BK-...)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Tra Cứu Vé
          </button>
        </form>

        {foundTicket && (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Hành Khách</p>
              <p className="font-bold text-slate-900 dark:text-white mt-1">{foundTicket.customerName}</p>
              <p className="text-sm text-slate-500">{foundTicket.phone}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Chuyến Hiện Tại</p>
              <p className="font-bold text-slate-900 dark:text-white mt-1">{foundTicket.currentTrip}</p>
              <p className="text-sm text-blue-600 font-medium">Ghế: {foundTicket.seatNumber}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Giá Vé Đã Trả</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-1 text-lg">
                {foundTicket.price.toLocaleString()} VNĐ
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded font-medium">
                {foundTicket.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Mã Vé & Đơn</p>
              <p className="font-mono text-sm text-slate-700 dark:text-slate-300 mt-1">{foundTicket.ticketCode}</p>
              <p className="font-mono text-xs text-slate-500">{foundTicket.bookingCode}</p>
            </div>
          </div>
        )}
      </div>

      {/* Chọn chuyến và ghế mới */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          2. Chọn Chuyến Xe & Ghế Ngồi Mới
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Chuyến xe mới (Cùng tuyến)
            </label>
            <select
              value={targetTrip}
              onChange={(e) => setTargetTrip(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="TRIP-VIP-0630">Sáng mai: 06:30 11/11/2026 — Limousine Cung Điện (420.000đ)</option>
              <option value="TRIP-CHIEU-1400">Chiều mai: 14:00 11/11/2026 — Limousine 34 Phòng (340.000đ)</option>
              <option value="TRIP-DEM-2100">Đêm mai: 21:00 11/11/2026 — Giường Nằm Cao Cấp (340.000đ)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Ghế trống còn lại trên chuyến mới
            </label>
            <div className="flex gap-2">
              {['A03', 'A04', 'B01', 'B02', 'B05'].map((seat) => (
                <button
                  key={seat}
                  type="button"
                  onClick={() => setTargetSeat(seat)}
                  className={`px-4 py-2 rounded-xl font-bold border transition ${
                    targetSeat === seat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  {seat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Thanh toán chênh lệch */}
        <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Tính toán chênh lệch giá vé:
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Vé cũ: 340.000đ ➔ Vé mới: 420.000đ. Khách hàng cần phụ thu thêm phần chênh lệch.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 uppercase font-semibold">Số tiền phụ thu:</span>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              +{priceDiff.toLocaleString()} VNĐ
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleExchange}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <FileCheck className="w-5 h-5" />
            Xác Nhận Đổi Vé & Xuất Vé Mới
          </button>
        </div>
      </div>
    </div>
  );
};
export default TicketExchangePage;
