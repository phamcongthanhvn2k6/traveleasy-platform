/**
 * @file ShuttleManagementPage.tsx
 * @description [S317] Phân Hệ Quản Lý Xe Trung Chuyển Đón Khách Tận Nhà (/company/shuttles)
 * @author Trần Minh Đức (tranduc2601)
 * @role Backend & Business Engine Specialist
 */
import React, { useState } from 'react';
import {
  Car,
  MapPin,
  Clock,
  User,
  Phone,
  Search,
  CheckCircle2,
  Calendar,
  Filter,
  PlusCircle,
  Truck
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';

interface ShuttleRequest {
  id: string;
  passengerName: string;
  phone: string;
  pickupAddress: string;
  mainTrip: string;
  tripDepartureTime: string;
  shuttlePickupTime: string;
  assignedVehicle: string;
  driverName: string;
  status: 'PENDING' | 'PICKING_UP' | 'ARRIVED_TERMINAL';
}

export const ShuttleManagementPage: React.FC = () => {
  const [requests, setRequests] = useState<ShuttleRequest[]>([
    {
      id: 'ST-01',
      passengerName: 'Trần Thị Bích Ngọc',
      phone: '0987654321',
      pickupAddress: '45 Lê Văn Việt, Tăng Nhơn Phú A, TP. Thủ Đức',
      mainTrip: 'TP.HCM ➔ Đà Lạt (22:30)',
      tripDepartureTime: '22:30 10/11/2026',
      shuttlePickupTime: '21:15 10/11/2026',
      assignedVehicle: '51B-168.99 (Ford Transit 16c)',
      driverName: 'Nguyễn Văn Tài (Tài xế trung chuyển 01)',
      status: 'PICKING_UP'
    },
    {
      id: 'ST-02',
      passengerName: 'Lê Hoàng Cường',
      phone: '0918273645',
      pickupAddress: '120 Man Thiện, P. Hiệp Phú, TP. Thủ Đức',
      mainTrip: 'TP.HCM ➔ Đà Lạt (22:30)',
      tripDepartureTime: '22:30 10/11/2026',
      shuttlePickupTime: '21:30 10/11/2026',
      assignedVehicle: '51B-168.99 (Ford Transit 16c)',
      driverName: 'Nguyễn Văn Tài (Tài xế trung chuyển 01)',
      status: 'PENDING'
    },
    {
      id: 'ST-03',
      passengerName: 'Bùi Quỳnh Nga',
      phone: '0966554433',
      pickupAddress: '25 Nguyễn Duy Trinh, Bình Trưng Tây, TP. Thủ Đức',
      mainTrip: 'TP.HCM ➔ Nha Trang (21:00)',
      tripDepartureTime: '21:00 10/11/2026',
      shuttlePickupTime: '19:45 10/11/2026',
      assignedVehicle: '51B-199.22 (Hyundai Solati 16c)',
      driverName: 'Trần Đình Trọng (Tài xế trung chuyển 02)',
      status: 'ARRIVED_TERMINAL'
    }
  ]);

  const handleUpdateStatus = (id: string, newStatus: ShuttleRequest['status']) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    toast.success('Đã cập nhật trạng thái đón trung chuyển thành công.', 'Trung Chuyển');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Car className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Điều Phối Xe Trung Chuyển Tận Nơi
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full">
                Task S317 - TMD
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gom danh sách khách hàng đăng ký đón/trả tận nhà, phân xe 16 chỗ đón gom về bến xe đúng giờ.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tổng khách đăng ký đón hôm nay</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">12 khách</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm font-medium text-amber-500">Đang trên đường đón</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">4 khách</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm font-medium text-emerald-500">Đã gom an toàn về bến</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">8 khách</p>
        </div>
      </div>

      {/* Danh sách yêu cầu trung chuyển */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            Lộ Trình Đón Gom Khách Tận Nhà
          </h2>
          <span className="text-xs text-slate-500">Tự động gom theo cụm địa chỉ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Hành Khách</th>
                <th className="py-3 px-4">Địa Chỉ Đón Tận Nơi</th>
                <th className="py-3 px-4">Giờ Đón Trung Chuyển</th>
                <th className="py-3 px-4">Xe & Tài Xế Trung Chuyển</th>
                <th className="py-3 px-4">Chuyến Xe Lớn</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{r.passengerName}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {r.phone}
                    </p>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="text-slate-800 dark:text-slate-200 font-medium flex items-start gap-1">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      {r.pickupAddress}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {r.shuttlePickupTime}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-900 dark:text-white">{r.assignedVehicle}</p>
                    <p className="text-xs text-slate-500">{r.driverName}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {r.mainTrip}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {r.status === 'ARRIVED_TERMINAL' && (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        Đã Đến Bến
                      </span>
                    )}
                    {r.status === 'PICKING_UP' && (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        Đang Đón Khách
                      </span>
                    )}
                    {r.status === 'PENDING' && (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Chờ Xe Đến
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {r.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'PICKING_UP')}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition"
                      >
                        Bắt Đầu Đón
                      </button>
                    )}
                    {r.status === 'PICKING_UP' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'ARRIVED_TERMINAL')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                      >
                        Đã Đến Bến
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default ShuttleManagementPage;
