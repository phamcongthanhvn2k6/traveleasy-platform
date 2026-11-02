/**
 * @file CharterBookingPage.jsx
 * @description Màn hình Đặt thuê nguyên xe du lịch hợp đồng có tài xế riêng
 * @author Trần Minh Đức
 * @role Customer Portal & Services
 */
import React, { useState } from 'react';

export default function CharterBookingPage() {
  const [vehicleType, setVehicleType] = useState('29_SEAT');
  const [departure, setDeparture] = useState('Sài Gòn');
  const [destination, setDestination] = useState('Vũng Tàu');
  const [estimatedKm, setEstimatedKm] = useState(125);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">🚐 Thuê Xe Hợp Đồng Du Lịch Trọn Gói</h1>
          <p className="text-sm text-slate-500">
            Dành cho khách đoàn, công ty, trường học đi tour có tài xế riêng theo lộ trình yêu cầu
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="font-semibold text-slate-800 mb-4">Thông Tin Lộ Trình Thuê Xe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-slate-700">Điểm Đón</label>
              <input
                type="text"
                className="w-full p-2.5 border rounded-lg text-sm mt-1"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Điểm Đến</label>
              <input
                type="text"
                className="w-full p-2.5 border rounded-lg text-sm mt-1"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>

          <h2 className="font-semibold text-slate-800 mb-3 mt-6">Chọn Loại Xe Phù Hợp</h2>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { id: '16_SEAT', name: 'Xe 16 Chỗ', desc: 'Ford Transit / Solati' },
              { id: '29_SEAT', name: 'Xe 29 Chỗ', desc: 'Hyundai County / Thaco' },
              { id: '45_SEAT', name: 'Xe 45 Chỗ Universe', desc: 'Hyundai Universe VIP' },
            ].map((v) => (
              <div
                key={v.id}
                onClick={() => setVehicleType(v.id)}
                className={`p-3 border rounded-xl cursor-pointer transition ${
                  vehicleType === v.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="font-bold text-sm text-slate-900">{v.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500">Ước tính cự ly lộ trình: ~{estimatedKm} km</p>
              <p className="text-sm font-semibold text-slate-800">Mức giá tham khảo: ~2.800.000đ - 3.200.000đ</p>
            </div>
            <span className="text-xs text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full font-medium">
              3-5 Nhà xe sẽ gửi báo giá cạnh tranh
            </span>
          </div>

          <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition">
            Gửi Yêu Cầu Thuê Xe Nhận Báo Giá Cạnh Tranh
          </button>
        </div>
      </div>
    </div>
  );
}

