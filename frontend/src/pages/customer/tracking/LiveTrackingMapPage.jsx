/**
 * @file LiveTrackingMapPage.jsx
 * @description Bản đồ Định vị GPS Live Tracking xe khách chạy thời gian thực
 * @author Đoàn Nhật Cường
 * @role Mobile Specialist & Live Tracking
 */
import React, { useState, useEffect } from 'react';

export default function LiveTrackingMapPage() {
  const [etaMinutes, setEtaMinutes] = useState(18);
  const [currentSpeed, setCurrentSpeed] = useState(65);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">📍 Định Vị GPS Xe Chạy Thời Gian Thực</h1>
            <p className="text-sm text-slate-500">Chuyến: Sài Gòn ➔ Đà Lạt • Biển số: 51B-889.99</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-700">Đang truyền tọa độ Live SSE</span>
          </div>
        </div>

        {/* Thẻ trạng thái hành trình */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500">Thời Gian Dự Kiến Đến Điểm Đón</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">~{etaMinutes} phút</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500">Tốc Độ Xe Hiện Tại</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{currentSpeed} km/h</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500">Trạm Dừng Chân Tiếp Theo</p>
            <p className="text-lg font-bold text-slate-800 mt-1">Trạm Dầu Giây (Đồng Nai)</p>
          </div>
        </div>

        {/* Khung bản đồ mô phỏng */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-96 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
              🚌
            </div>
            <p className="font-semibold text-slate-800">Khu vực nhúng bản đồ tương tác Leaflet / Mapbox</p>
            <p className="text-xs text-slate-500 mt-1">
              Hiển thị tuyến đường cao tốc Long Thành - Dầu Giây và vị trí xe khách di chuyển
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
