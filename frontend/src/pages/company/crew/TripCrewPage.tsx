/**
 * @file TripCrewPage.tsx
 * @description [S319] Phân Hệ Phân Công Tài Xế & Phụ Xe Cho Từng Chuyến Xe (/company/crew)
 * @author Đoàn Nhật Cường (CuongLiam)
 * @role Frontline Operations & Driver Management
 */
import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  AlertTriangle,
  Clock,
  Bus,
  Calendar,
  CheckCircle2,
  ShieldAlert,
  Search,
  Plus
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';

interface CrewAssignment {
  id: string;
  tripCode: string;
  route: string;
  departureTime: string;
  licensePlate: string;
  primaryDriver: string;
  primaryDriverPhone: string;
  secondaryDriver: string;
  conductorName: string;
  continuousDriveHours: number;
  status: 'COMPLIANT' | 'WARNING_OVERTIME' | 'UNASSIGNED';
}

export const TripCrewPage: React.FC = () => {
  const [assignments, setAssignments] = useState<CrewAssignment[]>([
    {
      id: 'CR-01',
      tripCode: 'TRIP-HCM-DL-2230',
      route: 'TP. Hồ Chí Minh ➔ Đà Lạt (305km - 6.5h)',
      departureTime: '22:30 10/11/2026',
      licensePlate: '51B-888.88',
      primaryDriver: 'Nguyễn Văn Hùng (Bằng E - 8 năm)',
      primaryDriverPhone: '0901234567',
      secondaryDriver: 'Lê Văn Thắng (Bằng E - 5 năm)',
      conductorName: 'Trần Văn Phụ (Tiếp viên 01)',
      continuousDriveHours: 3.5,
      status: 'COMPLIANT'
    },
    {
      id: 'CR-02',
      tripCode: 'TRIP-HCM-NT-2100',
      route: 'TP. Hồ Chí Minh ➔ Nha Trang (435km - 8.0h)',
      departureTime: '21:00 10/11/2026',
      licensePlate: '51B-999.99',
      primaryDriver: 'Phạm Đức Hải (Bằng E - 10 năm)',
      primaryDriverPhone: '0912389922',
      secondaryDriver: 'Chưa phân công (Cần đổi lái)',
      conductorName: 'Nguyễn Văn Đạt (Tiếp viên 02)',
      continuousDriveHours: 5.5,
      status: 'WARNING_OVERTIME'
    },
    {
      id: 'CR-03',
      tripCode: 'TRIP-HCM-VT-0700',
      route: 'TP. Hồ Chí Minh ➔ Vũng Tàu (105km - 2.0h)',
      departureTime: '07:00 11/11/2026',
      licensePlate: '51B-777.77',
      primaryDriver: 'Trần Minh Tuấn (Bằng D - 4 năm)',
      primaryDriverPhone: '0933112233',
      secondaryDriver: 'Không yêu cầu (Tuyến < 4h)',
      conductorName: 'Không yêu cầu',
      continuousDriveHours: 2.0,
      status: 'COMPLIANT'
    }
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Phân Công Tài Xế & Tiếp Viên Chuyến Xe
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full">
                Task S319 - CuongLiam
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Quản lý tổ lái, tài xế phụ đổi ca và kiểm soát vi phạm thời gian lái xe liên tục theo luật Giao thông đường bộ.
            </p>
          </div>
        </div>

        <button
          onClick={() => toast.info('Mở modal thêm tài xế vào biên chế nhà xe.', 'Thêm Tài Xế')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Thêm Tài Xế Mới
        </button>
      </div>

      {/* Cảnh báo an toàn */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
        <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-900 dark:text-amber-200">
          <span className="font-bold">Quy định an toàn GTVT:</span> Chuyến xe có lộ trình trên 4 giờ hoặc trên 300km bắt buộc phải bố trí ít nhất 2 tài xế thay phiên lái. Tài xế không được lái liên tục quá 4 giờ và không quá 10 giờ trong ngày.
        </p>
      </div>

      {/* Danh sách phân công */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            Lịch Phân Công Tổ Lái Các Chuyến Xe
          </h2>
          <span className="text-xs text-slate-500">Tự động đối soát trùng giờ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Chuyến Xe & Giờ Chạy</th>
                <th className="py-3 px-4">Tài Xế Chính (Tài 1)</th>
                <th className="py-3 px-4">Tài Xế Phụ (Tài 2 - Đổi Lái)</th>
                <th className="py-3 px-4">Phụ Xe / Tiếp Viên</th>
                <th className="py-3 px-4 text-center">Kiểm Soát Giờ Lái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {assignments.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{c.route}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Khởi hành: <span className="font-bold text-indigo-600">{c.departureTime}</span> | Xe: {c.licensePlate}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{c.primaryDriver}</p>
                    <p className="text-xs text-slate-500">{c.primaryDriverPhone}</p>
                  </td>
                  <td className="py-3 px-4">
                    {c.secondaryDriver.includes('Chưa') ? (
                      <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {c.secondaryDriver}
                      </span>
                    ) : (
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {c.secondaryDriver}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {c.conductorName}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {c.status === 'COMPLIANT' && (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đúng Quy Chuẩn
                      </span>
                    )}
                    {c.status === 'WARNING_OVERTIME' && (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Cần Thêm Tài Phụ
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toast.info(`Mở điều chỉnh tổ lái cho chuyến ${c.tripCode}`, 'Phân Công')}
                      className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
                    >
                      Đổi Tài Xế
                    </button>
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
export default TripCrewPage;
