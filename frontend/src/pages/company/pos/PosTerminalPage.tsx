/**
 * @file PosTerminalPage.jsx
 * @description Màn hình Bán vé nhanh tại Quầy bến xe của Nhà xe (POS Terminal)
 * @author Phạm Thanh Phong
 * @role Core Booking & Realtime
 */
import React, { useState } from 'react';

export default function PosTerminalPage() {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  const handlePrintTicket = () => {
    alert('Đang xuất vé & gửi lệnh in nhiệt khổ 80mm...');
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
          <h2 className="font-semibold text-slate-800 mb-3">1. Chuyến Xe Sắp Chạy</h2>
          <div className="space-y-2">
            <div className="p-3 border border-indigo-200 bg-indigo-50/50 rounded-lg cursor-pointer">
              <p className="font-bold text-indigo-900">Sài Gòn ➔ Đà Lạt (22:00)</p>
              <p className="text-xs text-slate-600">Limousine 34 Phòng • Biển số: 51B-889.99</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">Còn trống 8 phòng</p>
            </div>
          </div>
        </div>

        {/* Cột 2: Sơ đồ chọn buồng VIP */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h2 className="font-semibold text-slate-800 mb-3">2. Sơ Đồ Buồng Ghế Trống</h2>
          <p className="text-xs text-slate-500 mb-3">Click vào buồng để giữ chỗ tức thì tại quầy</p>
          <div className="grid grid-cols-4 gap-2">
            {['P01', 'P02', 'P03', 'P04', 'P05', 'P06'].map((seat) => (
              <button
                key={seat}
                className="p-3 border rounded-lg text-center font-bold hover:bg-indigo-50 border-slate-300"
              >
                {seat}
              </button>
            ))}
          </div>
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

