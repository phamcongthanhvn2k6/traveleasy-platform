/**
 * @file TicketExchangePage.tsx
 * @description [S316] Phân Hệ Đổi Vé, Đổi Giờ Chạy & Chuyển Ghế Linh Hoạt (/company/ticket-exchange)
 * - Tra cứu vé gốc và kiểm tra ràng buộc giờ khởi hành >= 12 tiếng
 * - Tự động tải danh sách chuyến xe và sơ đồ ghế thực tế từ máy chủ (loại bỏ dữ liệu giả)
 * - Tính toán hóa đơn chênh lệch tài chính (phụ thu / hoàn trả / bằng giá)
 * - Xác nhận đổi vé qua API POST /api/v1/company/ticket-exchange có kiểm soát lỗi chuẩn mực
 * - In phiếu xác nhận đổi vé chuyến xe chuẩn in ấn window.print()
 * - Tuân thủ 100% tiếng Việt có dấu chuẩn mực, không emoji, sử dụng Lucide React icons
 * @author Trần Minh Đức (tranduc2601)
 * @role Backend & Business Engine Specialist
 */
import React, { useState, useEffect } from 'react';
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
  Printer,
  Clock,
  ShieldCheck,
  Check,
  Phone,
  MapPin,
  QrCode,
  FileCheck
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

interface TicketData {
  ticketId: number;
  ticketCode: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  tripId: number;
  route: string;
  departureTime: string;
  seatNumber: string;
  price: number;
  status: string;
  canExchange: boolean;
  hoursUntilDeparture: number;
  policyNotice: string;
}

interface TripOption {
  id: number;
  code: string;
  name: string;
  busType: string;
  departureTime: string;
  price: number;
  availableSeats: string[];
}

interface ExchangeResult {
  exchangeId: number;
  status: string;
  message: string;
  oldTicketCode: string;
  oldTicketStatus: string;
  newTicketCode: string;
  newSeatCode: string;
  newTripId: number;
  oldPrice: number;
  newPrice: number;
  priceDifference: number;
  surchargeAmount: number;
  refundAmount: number;
  exchangeFee: number;
  customerName: string;
  customerPhone: string;
  oldTripDepartureTime?: string;
  newTripDepartureTime?: string;
  oldRoute?: string;
  newRoute?: string;
  exchangeTime: string;
}

export const TicketExchangePage: React.FC = () => {
  const [ticketCodeSearch, setTicketCodeSearch] = useState('');
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);

  // Danh sách chuyến xe tải từ API
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [availableSeats, setAvailableSeats] = useState<string[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [exchangeNote, setExchangeNote] = useState<string>('Khách hàng yêu cầu đổi giờ xuất bến tại quầy');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [exchangeResult, setExchangeResult] = useState<ExchangeResult | null>(null);

  // Tải danh sách chuyến xe thực tế từ Backend
  const fetchTrips = async () => {
    setLoadingTrips(true);
    try {
      const res = await api.get('/company/trips');
      const tripList: any[] = res.data?.data || res.data || [];
      if (Array.isArray(tripList) && tripList.length > 0) {
        const formatted: TripOption[] = tripList.map((t: any) => ({
          id: t.id,
          code: t.tripCode || `TRIP-${t.id}`,
          name: `${t.route?.departureLocation || 'Bến đi'} → ${t.route?.arrivalLocation || 'Bến đến'} (${new Date(t.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${new Date(t.departureTime).toLocaleDateString('vi-VN')})`,
          busType: t.vehicle?.name || t.vehicle?.busType || 'Xe Khách Giường Nằm Chất Lượng Cao',
          departureTime: new Date(t.departureTime).toLocaleString('vi-VN'),
          price: Number(t.price || 0),
          availableSeats: []
        }));
        setTrips(formatted);
        if (formatted.length > 0) {
          setSelectedTripId(formatted[0].id);
        }
      }
    } catch (err: any) {
      logError('Không thể tải danh mục chuyến xe từ máy chủ', err);
    } finally {
      setLoadingTrips(false);
    }
  };

  const logError = (msg: string, err: any) => {
    console.error(msg, err);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Khi chọn chuyến xe mới, tải sơ đồ ghế thực tế từ API /api/v1/trips/{tripId}
  useEffect(() => {
    if (!selectedTripId) return;

    const fetchTripSeats = async () => {
      setLoadingSeats(true);
      try {
        const res = await api.get(`/trips/${selectedTripId}`);
        const seats: any[] = res.data?.data?.seats || [];
        const available = seats
          .filter((s: any) => s.status === 'AVAILABLE')
          .map((s: any) => s.seatNumber || s.seatCode);

        setAvailableSeats(available);
        if (available.length > 0) {
          setSelectedSeat(available[0]);
        } else {
          setSelectedSeat('');
        }
      } catch (err: any) {
        setAvailableSeats([]);
        setSelectedSeat('');
      } finally {
        setLoadingSeats(false);
      }
    };

    fetchTripSeats();
  }, [selectedTripId]);

  // Tính toán chênh lệch giá
  const currentTrip = trips.find((t) => t.id === selectedTripId);
  const oldPrice = ticketData?.price || 0;
  const newPrice = currentTrip?.price || 0;
  const priceDifference = newPrice - oldPrice;
  const surchargeAmount = priceDifference > 0 ? priceDifference : 0;
  const refundAmount = priceDifference < 0 ? Math.abs(priceDifference) : 0;

  // Tra cứu vé gốc từ API
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = ticketCodeSearch.trim();
    if (!query) {
      toast.warning('Vui lòng nhập mã vé cần tra cứu để thực hiện đổi vé.', 'Tra Cứu Vé');
      return;
    }

    setLoadingLookup(true);
    setExchangeResult(null);

    try {
      const res = await api.get('/company/ticket-exchange/lookup', {
        params: { ticketCode: query }
      });
      if (res.data && res.data.success && res.data.data) {
        setTicketData(res.data.data);
        toast.success(`Đã tìm thấy thông tin vé: ${query}`, 'Tra Cứu Thành Công');
      } else {
        const msg = res.data?.message || 'Không tìm thấy vé hợp lệ với mã yêu cầu.';
        toast.error(msg, 'Tra Cứu Thất Bại');
        setTicketData(null);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tra cứu thông tin vé. Vui lòng kiểm tra lại mã vé!';
      toast.error(msg, 'Tra Cứu Thất Bại');
      setTicketData(null);
    } finally {
      setLoadingLookup(false);
    }
  };

  // Xác nhận đổi vé
  const handleExchange = async () => {
    if (!ticketData) {
      toast.warning('Vui lòng tra cứu vé cần đổi trước khi tiếp tục.', 'Thiếu Dữ Liệu');
      return;
    }
    if (!ticketData.canExchange) {
      toast.error('Vé không đủ điều kiện đổi do giờ khởi hành còn dưới 12 tiếng theo quy định.', 'Từ Chối Đổi Vé');
      return;
    }
    if (!selectedTripId) {
      toast.warning('Vui lòng chọn chuyến xe mới.', 'Chọn Chuyến');
      return;
    }
    if (!selectedSeat) {
      toast.warning('Vui lòng chọn ghế mới còn trống trên chuyến xe.', 'Chọn Ghế');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        oldTicketCode: ticketData.ticketCode,
        newTripId: selectedTripId,
        newSeatNumber: selectedSeat,
        note: exchangeNote
      };

      const res = await api.post('/company/ticket-exchange', payload);
      if (res.data && res.data.success && res.data.data) {
        setExchangeResult(res.data.data);
        toast.success('Đổi vé thành công! Mã vé mới và đơn mới đã được phát hành.', 'Thành Công');
      } else {
        const msg = res.data?.message || 'Không thể thực hiện đổi vé!';
        toast.error(msg, 'Thao Tác Thất Bại');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đổi vé thất bại do lỗi kết nối máy chủ hoặc ghế đã được chọn!';
      toast.error(msg, 'Thao Tác Thất Bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  // In phiếu xác nhận
  const handlePrintSlip = () => {
    window.print();
  };

  // Làm mới quy trình đổi vé tiếp theo
  const handleReset = () => {
    setExchangeResult(null);
    setTicketCodeSearch('');
    setTicketData(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <ArrowLeftRight className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Đổi Vé & Chuyển Chuyến Xe Khách
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full">
                Task S316 - TMD
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Quy trình đổi vé, chuyển đổi khung giờ xuất bến, giải phóng ghế cũ và tính toán chênh lệch giá vé tự động.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Tra cứu vé gốc */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          1. Tra Cứu Vé Cần Đổi
        </h2>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={ticketCodeSearch}
            onChange={(e) => setTicketCodeSearch(e.target.value)}
            placeholder="Nhập mã vé cần đổi (VD: TK-20261110-CT03-01 hoặc mã đơn BK-...)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            disabled={loadingLookup}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingLookup ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Tra Cứu Vé
          </button>
        </form>

        {ticketData && (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Hành Khách</p>
                <p className="font-bold text-slate-900 dark:text-white mt-1">{ticketData.customerName}</p>
                <p className="text-sm text-slate-500">{ticketData.customerPhone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Chuyến Hiện Tại</p>
                <p className="font-bold text-slate-900 dark:text-white mt-1">{ticketData.route}</p>
                <p className="text-sm text-slate-500">{ticketData.departureTime}</p>
                <p className="text-sm text-blue-600 font-semibold mt-0.5">Ghế cũ: {ticketData.seatNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Giá Vé Đã Trả</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-1 text-lg">
                  {ticketData.price.toLocaleString()} VNĐ
                </p>
                <span className="inline-block mt-1 px-2.5 py-0.5 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-semibold">
                  Trạng thái: {ticketData.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Mã Vé & Đơn Đặt</p>
                <p className="font-mono text-sm text-slate-700 dark:text-slate-300 mt-1">{ticketData.ticketCode}</p>
                <p className="font-mono text-xs text-slate-500">{ticketData.bookingCode}</p>
              </div>
            </div>

            {/* Cảnh báo quy định >= 12 tiếng */}
            {ticketData.canExchange ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Hợp lệ:</strong> {ticketData.policyNotice}
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-800 dark:text-red-300 text-sm">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span>
                  <strong>Từ chối đổi vé:</strong> {ticketData.policyNotice}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Chọn chuyến xe và ghế mới */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          2. Chọn Chuyến Xe & Ghế Ngồi Mới
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Chuyến xe mới muốn đổi sang
            </label>
            {loadingTrips ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center gap-2 text-sm text-slate-500">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                Đang tải danh sách chuyến xe thực tế...
              </div>
            ) : trips.length > 0 ? (
              <select
                value={selectedTripId || ''}
                onChange={(e) => setSelectedTripId(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.name} - {trip.busType} ({trip.price.toLocaleString()} VNĐ)
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-amber-600">Chưa có chuyến xe nào khả dụng trên hệ thống.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Chọn ghế trống trên chuyến xe mới
            </label>
            {loadingSeats ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center gap-2 text-sm text-slate-500">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                Đang tải sơ đồ ghế thực tế...
              </div>
            ) : availableSeats.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableSeats.map((seat) => (
                  <button
                    key={seat}
                    type="button"
                    onClick={() => setSelectedSeat(seat)}
                    className={`px-4 py-2 rounded-xl font-bold border transition ${
                      selectedSeat === seat
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    Ghế {seat}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-rose-500 font-semibold">Chuyến xe này hiện không còn ghế trống khả dụng.</p>
            )}
            {selectedSeat && (
              <p className="text-xs text-slate-500 mt-2">
                Đang chọn: <strong>Ghế {selectedSeat}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Ghi chú lý do đổi vé */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Ghi chú lý do đổi vé (tùy chọn)
          </label>
          <input
            type="text"
            value={exchangeNote}
            onChange={(e) => setExchangeNote(e.target.value)}
            placeholder="Nhập ghi chú hoặc lý do yêu cầu đổi vé..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>

        {/* Bảng hóa đơn chi tiết tính toán chênh lệch giá vé */}
        <div className="mt-6 p-5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Chi tiết hóa đơn chênh lệch giá vé:
              </p>
              <div className="text-xs text-amber-800 dark:text-amber-300 mt-1 space-y-0.5">
                <p>Giá vé gốc đã thanh toán: <strong>{oldPrice.toLocaleString()} VNĐ</strong></p>
                <p>Giá vé chuyến xe mới: <strong>{newPrice.toLocaleString()} VNĐ</strong></p>
                <p>Phí dịch vụ đổi vé: <strong>0 VNĐ</strong> (Miễn phí theo chính sách)</p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 uppercase font-semibold">
              {priceDifference > 0 ? 'Số tiền phụ thu:' : priceDifference < 0 ? 'Số tiền hoàn trả:' : 'Khoản chênh lệch:'}
            </span>
            <div className={`text-2xl font-bold ${
              priceDifference > 0
                ? 'text-amber-600 dark:text-amber-400'
                : priceDifference < 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}>
              {priceDifference > 0 && `+${surchargeAmount.toLocaleString()} VNĐ`}
              {priceDifference < 0 && `-${refundAmount.toLocaleString()} VNĐ`}
              {priceDifference === 0 && '0 VNĐ (Bằng giá)'}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {priceDifference > 0 ? 'Khách hàng cần thanh toán bổ sung tại quầy' : priceDifference < 0 ? 'Nhà xe sẽ hoàn tiền lại cho hành khách' : 'Không phát sinh khoản thu/chi'}
            </p>
          </div>
        </div>

        {/* Nút xác nhận đổi vé */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleExchange}
            disabled={!ticketData?.canExchange || isSubmitting || !selectedSeat}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <FileCheck className="w-5 h-5" />
            )}
            Xác Nhận Đổi Vé & Xuất Vé Mới
          </button>
        </div>
      </div>

      {/* Phiếu xác nhận đổi vé và in ấn (DoD 4) */}
      {exchangeResult && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border-2 border-blue-500 shadow-xl space-y-6 print:border-none print:shadow-none print:p-0">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">HỆ THỐNG XE KHÁCH TRAVELEASY</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                PHIẾU XÁC NHẬN ĐỔI VÉ & CHUYỂN CHUYẾN XE
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mã giao dịch: <strong>EX-{exchangeResult.exchangeId}</strong> - Ngày thực hiện: {exchangeResult.exchangeTime}
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                onClick={handlePrintSlip}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition flex items-center gap-2 text-sm shadow"
              >
                <Printer className="w-4 h-4" />
                In Phiếu Đổi Vé
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition text-sm"
              >
                Đổi Vé Tiếp Theo
              </button>
            </div>
          </div>

          {/* Bảng so sánh Vé cũ và Vé mới */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">THÔNG TIN VÉ CŨ</span>
                <span className="px-2 py-0.5 text-xs bg-slate-200 text-slate-700 rounded font-semibold">
                  Trạng thái: EXCHANGED
                </span>
              </div>
              <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">{exchangeResult.oldTicketCode}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Tuyến: {exchangeResult.oldRoute || ticketData?.route}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Khởi hành: {exchangeResult.oldTripDepartureTime || ticketData?.departureTime}</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">Ghế: {ticketData?.seatNumber} - Giá vé: {exchangeResult.oldPrice.toLocaleString()} VNĐ</p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-600 uppercase">THÔNG TIN VÉ MỚI ĐƯỢC CẤP</span>
                <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded font-semibold">
                  Trạng thái: ISSUED
                </span>
              </div>
              <p className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">{exchangeResult.newTicketCode}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Tuyến: {exchangeResult.newRoute || currentTrip?.name}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Khởi hành: {exchangeResult.newTripDepartureTime || currentTrip?.departureTime}</p>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mt-1">Ghế mới: {exchangeResult.newSeatCode} - Giá vé: {exchangeResult.newPrice.toLocaleString()} VNĐ</p>
            </div>
          </div>

          {/* Bảng kê chi tiết tài chính */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Giá vé chuyến xe mới:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{exchangeResult.newPrice.toLocaleString()} VNĐ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Giá trị vé cũ đối trừ:</span>
              <span className="font-semibold text-slate-900 dark:text-white">-{exchangeResult.oldPrice.toLocaleString()} VNĐ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Phí dịch vụ đổi vé:</span>
              <span className="font-semibold text-emerald-600">0 VNĐ (Miễn phí)</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-base font-bold">
              <span className="text-slate-900 dark:text-white">
                {exchangeResult.surchargeAmount > 0 ? 'Số tiền phụ thu cần thanh toán:' : exchangeResult.refundAmount > 0 ? 'Số tiền nhà xe hoàn trả lại:' : 'Chênh lệch:'}
              </span>
              <span className={exchangeResult.surchargeAmount > 0 ? 'text-amber-600' : exchangeResult.refundAmount > 0 ? 'text-emerald-600' : 'text-slate-700'}>
                {exchangeResult.surchargeAmount > 0 && `+${exchangeResult.surchargeAmount.toLocaleString()} VNĐ`}
                {exchangeResult.refundAmount > 0 && `-${exchangeResult.refundAmount.toLocaleString()} VNĐ`}
                {exchangeResult.priceDifference === 0 && '0 VNĐ'}
              </span>
            </div>
          </div>

          {/* Chữ ký xác nhận */}
          <div className="grid grid-cols-2 pt-6 text-center text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 uppercase">Người Lập Phiếu</p>
              <p className="mt-1">(Ký và ghi rõ họ tên)</p>
              <div className="h-16"></div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">Nhân viên quầy vé</p>
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 uppercase">Hành Khách Xác Nhận</p>
              <p className="mt-1">(Ký và ghi rõ họ tên)</p>
              <div className="h-16"></div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">{exchangeResult.customerName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketExchangePage;
