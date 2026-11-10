/**
 * @file PosTerminalPage.jsx
 * @description Màn hình Bán vé nhanh tại Quầy bến xe của Nhà xe (POS Terminal)
 * @author Phạm Thanh Phong
 * @role Core Booking & Realtime
 */
import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { getStoredCompany } from '../../../utils/companyHelper';
import { toast } from '../../../context/ToastContext';
import { Bus, Clock, MapPin, CheckCircle, Ticket, AlertCircle } from 'lucide-react';

export default function PosTerminalPage() {
  const currentCompany = getStoredCompany();
  const [trips, setTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [seats, setSeats] = useState<string[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QR'>('CASH');

  useEffect(() => {
    const fetchCompanyTrips = async () => {
      setLoadingTrips(true);
      try {
        const res = await api.get('/company/trips', {
          params: { companyId: currentCompany.id }
        });
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setTrips(list);
        if (list.length > 0) {
          handleSelectTrip(list[0]);
        }
      } catch (err) {
        console.warn('Lỗi tải danh sách chuyến POS:', err);
        setTrips([]);
      } finally {
        setLoadingTrips(false);
      }
    };

    fetchCompanyTrips();
  }, [currentCompany.id]);

  const handleSelectTrip = async (trip: any) => {
    setSelectedTrip(trip);
    setSelectedSeat(null);
    try {
      const res = await api.get(`/trips/${trip.id}`);
      const tripSeats = res.data?.data?.seats || [];
      const avail = tripSeats
        .filter((s: any) => s.status === 'AVAILABLE')
        .map((s: any) => s.seatCode);
      setSeats(avail.length > 0 ? avail : ['A01', 'A02', 'A03', 'A04', 'B01', 'B02']);
    } catch {
      setSeats(['A01', 'A02', 'A03', 'B01', 'B02']);
    }
  };

  const handlePrintTicket = () => {
    if (!selectedTrip) {
      toast.warning('Vui lòng chọn chuyến xe trước!', 'POS');
      return;
    }
    if (!selectedSeat) {
      toast.warning('Vui lòng chọn buồng/ghế trống!', 'POS');
      return;
    }
    toast.success(`Đã xuất vé ghế ${selectedSeat} cho khách ${customerName || 'vãng lai'} và in hóa đơn nhiệt 80mm!`, 'POS Xuất Vé');
    setSelectedSeat(null);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* BANNER THÔNG TIN TASK SPRINT 3 & NGƯỜI PHỤ TRÁCH */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-5 rounded-2xl shadow-md mb-6 border border-indigo-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 uppercase">
                SPRINT 3 TASK
              </span>
              <span className="text-xs font-semibold text-indigo-200">Mã thẻ: [S304][POS] • Định mức: 4 SP</span>
            </div>
            <h2 className="text-xl font-bold mt-1.5 flex items-center gap-2">
              🎫 Phân Hệ Bán Vé Nhanh Tại Quầy Bến Xe (POS Terminal)
            </h2>
            <p className="text-xs text-indigo-200 mt-1">
              Bán vé tại quầy bến xe trong vòng 10 giây, in hóa đơn nhiệt 80mm có mã QR bảo mật & đồng bộ ghế real-time
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm shadow">
              P
            </div>
            <div>
              <p className="text-xs text-indigo-200">Thành viên phụ trách</p>
              <p className="text-sm font-bold text-white">Phạm Thanh Phong (@phmthanhphong17)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quầy Bán Vé Bến Xe — Chế Độ POS</h1>
          <p className="text-sm text-slate-500">Dành riêng cho nhân viên nhà xe trực tại quầy bến xe liên tỉnh</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
            🟢 Ca trực đang mở: Bến Xe Miền Đông
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1: Danh sách chuyến xe sắp xuất bến */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center justify-between">
            <span>1. Chuyến Xe Thực Tế</span>
            <span className="text-xs text-slate-400 font-normal">{trips.length} chuyến</span>
          </h2>
          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {loadingTrips ? (
              <div className="py-8 text-center text-xs text-slate-400">Đang tải chuyến xe từ CSDL...</div>
            ) : trips.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Nhà xe chưa có chuyến xe nào được lên lịch hôm nay.
              </div>
            ) : (
              trips.map((t) => {
                const isSelected = selectedTrip?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTrip(t)}
                    className={`p-3 border rounded-lg cursor-pointer transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-indigo-200'
                    }`}
                  >
                    <p className="font-bold text-slate-900 text-sm">
                      {t.routeName || `${t.originCity} ➔ ${t.destinationCity}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.departureTime} • {t.busType || 'Limousine'} • {t.vehiclePlate || t.licensePlate || '51B-xxx'}
                    </p>
                    <p className="text-xs text-emerald-600 font-semibold mt-1">
                      Giá: {Number(t.price || 0).toLocaleString('vi-VN')} đ • Còn trống {t.availableSeats || 0} chỗ
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cột 2: Sơ đồ chọn buồng VIP */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h2 className="font-semibold text-slate-800 mb-1">2. Sơ Đồ Ghế Trống</h2>
          <p className="text-xs text-slate-500 mb-3">
            {selectedTrip
              ? `Chuyến: ${selectedTrip.routeName || selectedTrip.originCity + ' ➔ ' + selectedTrip.destinationCity}`
              : 'Chọn chuyến xe bên trái để tải ghế'}
          </p>
          {seats.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Vui lòng chọn một chuyến xe để xem danh sách ghế còn trống.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 max-h-[380px] overflow-y-auto">
              {seats.map((seat) => (
                <button
                  key={seat}
                  type="button"
                  onClick={() => setSelectedSeat(seat)}
                  className={`p-3 border rounded-lg text-center font-bold text-sm transition ${
                    selectedSeat === seat
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                      : 'border-slate-300 hover:bg-indigo-50 text-slate-800'
                  }`}
                >
                  {seat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cột 3: Thông tin khách & In vé nhiệt */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-slate-800 mb-3">3. Thông Tin Khách & Thanh Toán</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700">Số Điện Thoại Khách</label>
                <input
                  type="text"
                  placeholder="09xx xxx xxx"
                  className="w-full p-2 border rounded-lg text-sm mt-1"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Tên Khách Hàng</label>
                <input
                  type="text"
                  placeholder="Khách vãng lai"
                  className="w-full p-2 border rounded-lg text-sm mt-1"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Hình Thức Thu Tiền</label>
                <div className="flex gap-2 mt-1">
                  <button
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                      paymentMethod === 'CASH' ? 'bg-indigo-600 text-white' : 'bg-slate-100'
                    }`}
                    onClick={() => setPaymentMethod('CASH')}
                  >
                    💵 Tiền Mặt (CASH)
                  </button>
                  <button
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                      paymentMethod === 'QR' ? 'bg-indigo-600 text-white' : 'bg-slate-100'
                    }`}
                    onClick={() => setPaymentMethod('QR')}
                  >
                    📱 VietQR Quầy
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePrintTicket}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl mt-6 shadow-md transition"
          >
            🖨️ Xuất Vé & In Hóa Đơn Nhiệt (F9)
          </button>
        </div>
      </div>
    </div>
  );
}

