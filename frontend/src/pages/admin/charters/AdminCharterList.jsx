/**
 * @file AdminCharterList.jsx
 * @description Màn hình Quản lý Hợp đồng Thuê xe & Quản trị Ký quỹ Escrow 30%
 * @author Nguyễn Đại Phát
 * @role Admin Lead & Full-Stack
 */
import React from 'react';

export default function AdminCharterList() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản Lý Thuê Xe Hợp Đồng & Ký Quỹ Escrow</h1>
            <p className="text-sm text-slate-500">Giám sát các hợp đồng thuê xe toàn sàn và bảo đảm an toàn tiền cọc 30%</p>
          </div>
          <div className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-700">
            Tổng tiền cọc Escrow đang giữ: 14.500.000đ
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-700">
              <tr>
                <th className="p-4">Mã Hợp Đồng</th>
                <th className="p-4">Khách Hàng</th>
                <th className="p-4">Lộ Trình</th>
                <th className="p-4">Loại Xe</th>
                <th className="p-4">Nhà Xe Trúng Thầu</th>
                <th className="p-4">Tiền Cọc (30%)</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-900">CT-2026-001</td>
                <td className="p-4">Công ty Du Lịch ABC (0909123456)</td>
                <td className="p-4">Sài Gòn ⇄ Vũng Tàu (2 ngày)</td>
                <td className="p-4">Xe 29 Chỗ</td>
                <td className="p-4 font-medium text-slate-800">Nhà Xe Phương Trang</td>
                <td className="p-4 font-semibold text-emerald-600">960.000đ (Đã cọc)</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                    Đang Chạy Chuyến
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold">
                    Giải Ngân Cọc
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
