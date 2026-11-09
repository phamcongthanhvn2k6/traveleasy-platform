/**
 * @file LiveTrackingMapPage.jsx
 * @description Bản đồ Định vị GPS Live Tracking xe khách chạy thời gian thực
 * @author Nguyễn Đại Phát (phatnguyn146)
 * @role Analytics & Tracking Specialist
 * @task [S406][TRACKING] Sprint 4 (4 SP)
 */
import React, { useState, useEffect } from 'react';

export default function LiveTrackingMapPage() {
  const [etaMinutes, setEtaMinutes] = useState(18);
  const [currentSpeed, setCurrentSpeed] = useState(65);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* BANNER THÔNG TIN TASK SPRINT 4 & NGƯỜI PHỤ TRÁCH */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md mb-6 border border-teal-700/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 uppercase">
                  SPRINT 4 TASK
                </span>
                <span className="text-xs font-semibold text-emerald-200">Mã thẻ: [S406][TRACKING] • Định mức: 4 SP</span>
              </div>
              <h2 className="text-xl font-bold mt-1.5 flex items-center gap-2">
                📍 Bản Đồ Định Vị GPS Live Tracking Xe Chạy Thời Gian Thực
              </h2>
              <p className="text-xs text-emerald-200 mt-1">
                Tích hợp bản đồ Leaflet & Server-Sent Events (SSE) truyền tọa độ xe chạy trực tiếp tới điện thoại khách hàng
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
              <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-sm shadow">
                P
              </div>
              <div>
                <p className="text-xs text-emerald-200">Thành viên phụ trách</p>
                <p className="text-sm font-bold text-white">Nguyễn Đại Phát (@phatnguyn146)</p>
              </div>
            </div>
          </div>
        </div>

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

