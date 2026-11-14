/**
 * @file CancellationRefundPage.tsx
 * @description [S321] Quản Lý Biểu Phí & Tính Tiền Hoàn Hủy Vé Tự Động (/company/refunds)
 * - Tab 1: Cấu hình biểu phí hoàn hủy đa bậc thang
 * - Tab 2: Danh sách và xử lý duyệt hoàn hủy vé (Phân bổ phạt 80/20 - BUG-NEW-03, Tự nhả ghế - BUG-NEW-04)
 * @author Nguyễn Đại Phát (daiphat)
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Percent,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Search,
  Save,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  User,
  Phone,
  Ticket,
  Bus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../services/api';
import { getStoredCompany } from '../../../utils/companyHelper';
import { TableSkeleton } from '../../../components/common/Skeleton';

interface RefundRule {
  id: number;
  hoursBeforeDeparture: number;
  feePercent: number;
  refundPercent: number;
  desc: string;
}

interface RefundRequestItem {
  id: number;
  ticketCode: string;
  passengerName: string;
  passengerPhone: string;
  routeName: string;
  seatNumber: string;
  originalPrice: number;
  status: string;
  cancellationFee: number;
  refundAmount: number;
  busCompanyShare: number;
  platformShare: number;
  departureTime: string;
  requestTime: string;
}

export const CancellationRefundPage: React.FC = () => {
  const { isDark } = useTheme();
  const currentCompany = getStoredCompany();
  const [activeTab, setActiveTab] = useState<'rules' | 'requests'>('requests');
  const [rules, setRules] = useState<RefundRule[]>([
    {
      id: 1,
      hoursBeforeDeparture: 24,
      feePercent: 10,
      refundPercent: 90,
      desc: 'Hủy trước giờ khởi hành > 24 tiếng (Khấu trừ 10%, hoàn 90%)',
    },
    {
      id: 2,
      hoursBeforeDeparture: 12,
      feePercent: 30,
      refundPercent: 70,
      desc: 'Hủy từ 12 - 24 tiếng trước giờ chạy (Khấu trừ 30%, hoàn 70%)',
    },
    {
      id: 3,
      hoursBeforeDeparture: 2,
      feePercent: 50,
      refundPercent: 50,
      desc: 'Hủy từ 2 - 12 tiếng trước giờ chạy (Khấu trừ 50%, hoàn 50%)',
    },
    {
      id: 4,
      hoursBeforeDeparture: 0,
      feePercent: 100,
      refundPercent: 0,
      desc: 'Hủy dưới 2 tiếng hoặc sau giờ xuất bến (Không hoàn tiền)',
    },
  ]);

  const [requests, setRequests] = useState<RefundRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTicketForCalc, setSelectedTicketForCalc] = useState<any | null>(null);

  // Fetch real rules & requests from backend DB
  const fetchRealData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rulesRes, reqRes] = await Promise.allSettled([
        api.get('/company/refunds/rules', {
          params: { companyId: currentCompany.id, busCompanyId: currentCompany.id },
        }),
        api.get('/company/refunds/requests', {
          params: { companyId: currentCompany.id, busCompanyId: currentCompany.id },
        }),
      ]);

      if (rulesRes.status === 'fulfilled' && rulesRes.value.data?.data && Array.isArray(rulesRes.value.data.data)) {
        setRules(rulesRes.value.data.data);
      }

      if (reqRes.status === 'fulfilled' && reqRes.value.data?.data && Array.isArray(reqRes.value.data.data)) {
        setRequests(reqRes.value.data.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu hoàn hủy vé:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany.id]);

  useEffect(() => {
    fetchRealData();
  }, [fetchRealData]);

  const handleSaveRules = async () => {
    try {
      await api.put('/company/refunds/rules', rules);
      toast.success('Đã lưu cấu hình biểu phí hoàn hủy vé vào CSDL nhà xe!', 'Cập Nhật Biểu Phí');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể lưu biểu phí, vui lòng thử lại!', 'Lỗi');
    }
  };

  const handleCalculateQuick = async () => {
    if (!searchCode.trim()) {
      toast.error('Vui lòng nhập mã vé cần tra cứu hoàn hủy!', 'Tra Cứu');
      return;
    }

    try {
      const res = await api.post(
        `/company/refunds/calculate`,
        null,
        {
          params: {
            ticketCode: searchCode.trim(),
            companyId: currentCompany.id,
            busCompanyId: currentCompany.id,
          },
        }
      );
      if (res.data?.data) {
        setSelectedTicketForCalc(res.data.data);
        toast.info(`Tìm thấy thông tin vé ${searchCode.trim()}`, 'Tính Tiền Hoàn');
        return;
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || `Không tìm thấy vé ${searchCode.trim()} trong hệ thống!`;
      toast.error(errMsg, 'Lỗi Tra Cứu');
    }
  };

  const handleConfirmRefund = async (ticketCode: string) => {
    if (!window.confirm(`Xác nhận duyệt hủy vé ${ticketCode}? Ghế sẽ được mở lại ngay lập tức và tính toán hoàn tiền cho khách.`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const res = await api.post('/company/refunds', {
        ticketCode,
        companyId: currentCompany.id,
        busCompanyId: currentCompany.id,
      });
      const msg = res.data?.message || `Đã duyệt hủy vé ${ticketCode} thành công! Ghế đã được tự động mở lại cho khách khác.`;
      toast.success(msg, 'Hoàn Tiền Thành Công');
      await fetchRealData();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Có lỗi xảy ra khi duyệt hủy vé!';
      toast.error(errMsg, 'Lỗi');
    } finally {
      setSelectedTicketForCalc(null);
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
            <RotateCcw className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Chính Sách Khấu Trừ & Xử Lý Hoàn Hủy Vé
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 rounded-full">
                Task S321 - Phat
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Quản lý biểu phí phạt hủy vé theo mốc giờ, phân chia tỷ lệ 80/20 và tự động nhả ghế mở bán lại.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'requests'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            📋 Xử Lý Yêu Cầu Hủy Vé
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'rules'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            ⚙️ Cấu Hình Biểu Phí
          </button>
        </div>
      </div>

      {/* KPI Cards: Phân bổ tài chính hoàn hủy */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Tổng Yêu Cầu Hủy
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {requests.length} vé
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            {requests.filter((r) => r.status === 'ISSUED').length} vé đang chờ duyệt hoàn
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Tổng Tiền Hoàn Khách
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-emerald-600">
              {requests
                .reduce((acc, cur) => acc + cur.refundAmount, 0)
                .toLocaleString('vi-VN')}{' '}
              đ
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <span className="text-xs text-emerald-600 mt-2 block font-medium">
            Tự động trả về thẻ / ví khách
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Thu Phạt Nhà Xe (80%)
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-amber-600">
              {requests
                .reduce((acc, cur) => acc + cur.busCompanyShare, 0)
                .toLocaleString('vi-VN')}{' '}
              đ
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <span className="text-xs text-amber-600 mt-2 block font-medium">
            Bù đắp chi phí ghế trống (BUG-NEW-03)
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Phí Dịch Vụ Sàn (20%)
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-indigo-600">
              {requests
                .reduce((acc, cur) => acc + cur.platformShare, 0)
                .toLocaleString('vi-VN')}{' '}
              đ
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <span className="text-xs text-indigo-600 mt-2 block font-medium">
            Khấu trừ vào bảng đối soát sàn
          </span>
        </div>
      </div>

      {/* TAB 1: DANH SÁCH & XỬ LÝ YÊU CẦU HOÀN HỦY */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Quick Calculator Panel */}
          <div className="bg-gradient-to-r from-rose-50 to-orange-50 dark:from-slate-900 dark:to-slate-850 p-6 rounded-2xl border border-rose-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Search className="w-5 h-5 text-rose-600" />
              Tra Cứu Vé & Tính Tiền Hoàn Hủy Tức Thì
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Ticket className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Nhập mã vé điện tử cần tính tiền hoàn (ví dụ: TK-20261114-A05)..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCalculateQuick()}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                />
              </div>
              <button
                onClick={handleCalculateQuick}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
              >
                <DollarSign className="w-4 h-4" />
                Tính Tiền Hoàn
              </button>
            </div>

            {/* Calculated Preview Card */}
            {selectedTicketForCalc && (
              <div className="mt-4 p-5 bg-white dark:bg-slate-800 rounded-xl border border-rose-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 gap-2">
                  <div>
                    <span className="text-xs text-slate-400">Kết quả tính toán cho mã vé:</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {selectedTicketForCalc.ticketCode}
                      <span className="px-2 py-0.5 text-xs bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 rounded font-bold">
                        {selectedTicketForCalc.tierDescription}
                      </span>
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Thời gian trước giờ chạy:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {selectedTicketForCalc.hoursBeforeDeparture} tiếng
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <span className="text-xs text-slate-400 block">Giá vé gốc:</span>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {Number(selectedTicketForCalc.originalPrice).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                    <span className="text-xs text-rose-500 block">
                      Phí khấu trừ ({selectedTicketForCalc.cancellationFeePercent}%):
                    </span>
                    <span className="font-bold text-rose-600 text-base">
                      -{Number(selectedTicketForCalc.cancellationFee).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <span className="text-xs text-emerald-600 block">Khách thực nhận:</span>
                    <span className="font-bold text-emerald-600 text-base">
                      {Number(selectedTicketForCalc.refundAmountToCustomer).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <span className="text-xs text-amber-600 block">Nhà xe nhận (80% phạt):</span>
                    <span className="font-bold text-amber-600 text-base">
                      +{Number(selectedTicketForCalc.busCompanyPenaltyRevenue).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    💡 {selectedTicketForCalc.settlementImpactNotice}
                  </p>
                  <button
                    disabled={isProcessing}
                    onClick={() => handleConfirmRefund(selectedTicketForCalc.ticketCode)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Xác Nhận Hủy Vé & Mở Lại Ghế Trống
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Table of Refund Requests */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-rose-600" />
                Danh Sách Vé Cần Xử Lý Hoàn Hủy ({currentCompany.name})
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchRealData}
                  disabled={isLoading}
                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Tải lại dữ liệu"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-500' : ''}`} />
                </button>
                <span className="text-xs text-slate-500">
                  Hiển thị {requests.length} giao dịch gần nhất
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Mã Vé & Hành Khách</th>
                    <th className="p-4">Tuyến Xe & Số Ghế</th>
                    <th className="p-4">Giá Vé Gốc</th>
                    <th className="p-4">Tiền Hoàn Khách</th>
                    <th className="p-4">Phạt Nhà Xe (80%)</th>
                    <th className="p-4">Trạng Thái</th>
                    <th className="p-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading && requests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6">
                        <TableSkeleton rows={4} columns={7} />
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400">
                        <Ticket className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          Chưa có yêu cầu hoàn hủy vé nào của {currentCompany.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Các vé khi được yêu cầu hủy sẽ hiển thị tại đây để duyệt và tự động mở lại ghế xe.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    requests.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                      >
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {item.ticketCode}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <User className="w-3.5 h-3.5" /> {item.passengerName} • {item.passengerPhone}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {item.routeName}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded font-bold">
                              Ghế {item.seatNumber}
                            </span>
                            <span>Khởi hành: {item.departureTime}</span>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                          {Number(item.originalPrice || 0).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-emerald-600 block">
                            {Number(item.refundAmount || 0).toLocaleString('vi-VN')} đ
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Khấu trừ: {Number(item.cancellationFee || 0).toLocaleString('vi-VN')} đ
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-amber-600 block">
                            +{Number(item.busCompanyShare || 0).toLocaleString('vi-VN')} đ
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Sàn giữ: {Number(item.platformShare || 0).toLocaleString('vi-VN')} đ
                          </span>
                        </td>
                        <td className="p-4">
                          {item.status === 'CANCELLED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" /> Đã Hủy & Nhả Ghế
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-600" /> Chờ Duyệt Hủy
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {item.status === 'ISSUED' ? (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleConfirmRefund(item.ticketCode)}
                              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition shadow-sm disabled:opacity-50"
                            >
                              Duyệt Hủy
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">Đã Hoàn Tất</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CẤU HÌNH BIỂU PHÍ HOÀN HỦY */}
      {activeTab === 'rules' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Percent className="w-5 h-5 text-rose-600" />
                Biểu Phí Khấu Trừ Hoàn Vé Áp Dụng Toàn Tuyến
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Quy định tỷ lệ phần trăm tiền phạt dựa trên thời điểm hành khách gửi yêu cầu hủy vé.
              </p>
            </div>
            <button
              onClick={handleSaveRules}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              Lưu Cấu Hình
            </button>
          </div>

          <div className="p-6 space-y-4">
            {rules.map((rule, idx) => (
              <div
                key={rule.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-bold flex items-center justify-center text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{rule.desc}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mốc thời gian áp dụng: Hủy trước giờ xuất bến tối thiểu{' '}
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {rule.hoursBeforeDeparture} tiếng
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Khấu trừ tiền phạt:</span>
                    <span className="font-bold text-rose-600 text-base">{rule.feePercent}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Khách thực nhận:</span>
                    <span className="font-bold text-emerald-600 text-lg">{rule.refundPercent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Policy Information Notice */}
          <div className="m-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Nguyên tắc phân bổ tiền phạt hủy vé (BUG-NEW-03):
            </p>
            <p>
              • <strong>80% tiền phạt:</strong> Được ghi nhận vào ví doanh thu của Nhà xe nhằm bù đắp rủi ro chi phí nhiên liệu & ghế trống khi xe xuất bến.
            </p>
            <p>
              • <strong>20% tiền phạt:</strong> Được khấu trừ làm phí xử lý cổng thanh toán & hạ tầng kỹ thuật sàn TravelEasy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancellationRefundPage;
