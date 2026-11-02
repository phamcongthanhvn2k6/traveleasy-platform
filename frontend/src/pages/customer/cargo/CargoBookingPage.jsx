/**
 * @file CargoBookingPage.jsx
 * @description Màn hình Ký gửi bưu kiện & hàng hóa hầm xe khách liên tỉnh
 * @author Trần Minh Đức
 * @role Customer Portal & Services
 */
import React, { useState } from 'react';

export default function CargoBookingPage() {
  const [cargoType, setCargoType] = useState('DOCUMENT');
  const [weightKg, setWeightKg] = useState(2);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">📦 Ký Gửi Hàng Hóa & Bưu Kiện Theo Xe</h1>
          <p className="text-sm text-slate-500">
            Dịch vụ gửi bưu phẩm, tài liệu, hoa quả, xe máy hầm xe khách nhận hàng ngay trong ngày
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="font-semibold text-slate-800 mb-4">Thông Tin Kiện Hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-slate-700">Tên & SĐT Người Gửi (Tại Bến Đi)</label>
              <input type="text" placeholder="Nguyễn Văn A - 09xx xxx xxx" className="w-full p-2.5 border rounded-lg text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Tên & SĐT Người Nhận (Tại Bến Đến)</label>
              <input type="text" placeholder="Trần Thị B - 09xx xxx xxx" className="w-full p-2.5 border rounded-lg text-sm mt-1" />
            </div>
          </div>

          <h2 className="font-semibold text-slate-800 mb-3 mt-6">Loại Hàng Hóa</h2>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { id: 'DOCUMENT', name: 'Giấy Tờ / Tài Liệu', rate: '50.000đ' },
              { id: 'PARCEL', name: 'Bưu Kiện Nhẹ (< 5kg)', rate: '80.000đ' },
              { id: 'HEAVY', name: 'Thùng Hàng (> 10kg)', rate: '150.000đ' },
              { id: 'BIKE', name: 'Xe Máy / Xe Đạp Điện', rate: '350.000đ' },
            ].map((c) => (
              <div
                key={c.id}
                onClick={() => setCargoType(c.id)}
                className={`p-3 border rounded-xl cursor-pointer text-center transition ${
                  cargoType === c.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="font-bold text-xs text-slate-900">{c.name}</p>
                <p className="text-xs text-emerald-600 font-semibold mt-1">{c.rate}</p>
              </div>
            ))}
          </div>

          <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition">
            Tạo Mã Vận Đơn & Xuất Tem QR Kiện Hàng
          </button>
        </div>
      </div>
    </div>
  );
}
