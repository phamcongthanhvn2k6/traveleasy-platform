/**
 * @file TripCrewPage.tsx
 * @description [S319] Phân Hệ Phân Công Tài Xế & Phụ Xe Cho Từng Chuyến Xe (/company/crew)
 * @author Đoàn Nhật Cường (CuongLiam)
 * @role Frontline Operations & Driver Management
 */
import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  AlertTriangle,
  Clock,
  Bus,
  CheckCircle2,
  ShieldAlert,
  Search,
  FileCheck2,
  Activity,
  Phone,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import { TripCrewService, TripCrewResponse, AssignCrewRequest } from './TripCrewService';

export const TripCrewPage: React.FC = () => {
  const [assignments, setAssignments] = useState<TripCrewResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal phân công
  const [selectedCrew, setSelectedCrew] = useState<TripCrewResponse | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState<AssignCrewRequest>({
    tripId: 0,
    primaryDriverName: '',
    primaryDriverPhone: '',
    primaryDriverLicense: 'Hạng E (Đầy đủ hồ sơ)',
    secondaryDriverName: '',
    secondaryDriverPhone: '',
    conductorName: '',
    conductorPhone: '',
    continuousDriveHours: 3.5,
    alcoholTested: true,
    alcoholReading: 0.0,
    notes: ''
  });

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await TripCrewService.getCrewAssignments();
      setAssignments(data);
    } catch (err: any) {
      console.error(err);
      toast.error('Không thể tải danh sách phân công tổ lái từ hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleOpenAssignModal = (crew: TripCrewResponse) => {
    setSelectedCrew(crew);
    setFormData({
      tripId: crew.tripId,
      primaryDriverName: crew.primaryDriverName || '',
      primaryDriverPhone: crew.primaryDriverPhone || '',
      primaryDriverLicense: crew.primaryDriverLicense || 'Hạng E',
      secondaryDriverName: crew.secondaryDriverName || '',
      secondaryDriverPhone: crew.secondaryDriverPhone || '',
      conductorName: crew.conductorName || '',
      conductorPhone: crew.conductorPhone || '',
      continuousDriveHours: crew.continuousDriveHours || 3.5,
      alcoholTested: crew.alcoholTested ?? true,
      alcoholReading: crew.alcoholReading ?? 0.0,
      distanceKm: crew.distanceKm,
      notes: crew.notes || ''
    });
    setIsAssignModalOpen(true);
  };

  const handleSaveCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.primaryDriverName || !formData.primaryDriverPhone) {
      toast.error('Vui lòng nhập họ tên và số điện thoại tài xế chính.');
      return;
    }

    try {
      setSubmitting(true);
      const updated = await TripCrewService.assignCrew(formData);
      toast.success(`Đã phân công tổ lái thành công cho chuyến xe #${updated.tripId}!`);
      setIsAssignModalOpen(false);
      fetchAssignments();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi phân công tổ lái';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignDispatchPermit = async (tripId: number) => {
    try {
      const updated = await TripCrewService.signDispatchPermit(tripId);
      toast.success(`Ký lệnh xuất bến thành công! Mã lệnh: ${updated.dispatchPermitCode}`);
      fetchAssignments();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi ký lệnh xuất bến';
      toast.error(msg);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      a.route.toLowerCase().includes(q) ||
      a.tripCode.toLowerCase().includes(q) ||
      (a.licensePlate && a.licensePlate.toLowerCase().includes(q)) ||
      (a.primaryDriverName && a.primaryDriverName.toLowerCase().includes(q))
    );
  });

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
                Phân Công Tổ Lái & Kiểm Tra Điều Kiện Xuất Bến
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full">
                Task S319 - CuongLiam
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Quản lý tổ lái, kiểm tra nồng độ cồn bắt buộc (0.00 mg/L), GPLX hạng D/E và ký lệnh xuất bến điện tử chuẩn Bộ GTVT.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAssignments}
            className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-700"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Cảnh báo an toàn pháp lý GTVT */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
        <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900 dark:text-amber-200 space-y-1">
          <p className="font-bold">Quy chuẩn an toàn pháp lý bắt buộc trước khi xe lăn bánh:</p>
          <ul className="list-disc list-inside text-xs space-y-0.5">
            <li><strong>Nồng độ cồn:</strong> Bắt buộc 0.00 mg/L (Chặn ký lệnh xuất bến 100% nếu chưa kiểm tra hoặc &gt; 0).</li>
            <li><strong>Giấy phép lái xe:</strong> Bắt buộc Hạng D hoặc Hạng E phù hợp quy chuẩn xe khách thương mại.</li>
            <li><strong>Đổi lái:</strong> Tuyến đường &gt; 300km hoặc thời gian chạy &gt; 4 giờ bắt buộc phải có Tài xế 2 (Đổi lái).</li>
          </ul>
        </div>
      </div>

      {/* Thanh tìm kiếm & bộ lọc */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tuyến đường, mã chuyến, biển số, tài xế..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Bảng danh sách phân công */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            Lịch Phân Công Tổ Lái & Trạng Thái Lệnh Xuất Bến
          </h2>
          <span className="text-xs text-slate-500">Tổng cộng: {filteredAssignments.length} chuyến</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Chuyến Xe & Lộ Trình</th>
                <th className="py-3 px-4">Tài Xế Chính (Tài 1)</th>
                <th className="py-3 px-4">Tài Xế Phụ (Tài 2)</th>
                <th className="py-3 px-4">Kiểm Tra Nồng Độ Cồn</th>
                <th className="py-3 px-4 text-center">Trạng Thái An Toàn</th>
                <th className="py-3 px-4 text-right">Lệnh Xuất Bến / Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Đang tải dữ liệu phân công tổ lái...
                  </td>
                </tr>
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Không tìm thấy chuyến xe nào.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((c) => (
                  <tr key={c.tripId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{c.route}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-indigo-600">{c.tripCode}</span>
                        <span>•</span>
                        <span>{c.licensePlate}</span>
                        <span>•</span>
                        <span>{c.distanceKm}km ({c.continuousDriveHours}h)</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {c.primaryDriverName ? (
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{c.primaryDriverName}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {c.primaryDriverPhone} | {c.primaryDriverLicense || 'Hạng E'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded">
                          Chưa gán lái chính
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {c.secondaryDriverName ? (
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{c.secondaryDriverName}</p>
                          <p className="text-xs text-slate-500">{c.secondaryDriverPhone || 'Đổi lái'}</p>
                        </div>
                      ) : c.distanceKm > 300 || (c.continuousDriveHours && c.continuousDriveHours > 4.0) ? (
                        <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Bắt buộc có Tài 2
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Không yêu cầu (&lt; 300km)</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {c.alcoholTested ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            0.00 mg/L (Đã Test)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                            Chưa Test Cồn
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {c.status === 'DISPATCH_PERMIT_SIGNED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          <FileCheck2 className="w-3.5 h-3.5" /> Đã Ký Lệnh Xuất Bến
                        </span>
                      ) : c.status === 'COMPLIANT_DISPATCH_READY' || c.status === 'COMPLIANT' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn Sàng Xuất Bến
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5" /> Chưa Đủ Điều Kiện
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenAssignModal(c)}
                          className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
                        >
                          Phân Công
                        </button>

                        {c.status !== 'DISPATCH_PERMIT_SIGNED' ? (
                          <button
                            onClick={() => handleSignDispatchPermit(c.tripId)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" /> Ký Lệnh
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 font-mono" title={c.dispatchPermitCode || ''}>
                            {c.dispatchPermitCode}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Phân Công Tổ Lái & Test Cồn */}
      {isAssignModalOpen && selectedCrew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Phân Công Tổ Lái Cho Chuyến Xe #{selectedCrew.tripId}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedCrew.route} ({selectedCrew.distanceKm}km)
                </p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCrew} className="space-y-4">
              {/* Tài xế chính */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tài xế chính (Tài 1) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Họ tên tài xế chính"
                    value={formData.primaryDriverName}
                    onChange={(e) => setFormData({ ...formData, primaryDriverName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Số điện thoại tài 1"
                    value={formData.primaryDriverPhone}
                    onChange={(e) => setFormData({ ...formData, primaryDriverPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* GPLX */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Hạng Giấy Phép Lái Xe <span className="text-rose-500">* (Bắt buộc Hạng D hoặc E)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hạng E (8 năm kinh nghiệm)"
                  value={formData.primaryDriverLicense || ''}
                  onChange={(e) => setFormData({ ...formData, primaryDriverLicense: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              {/* Tài xế phụ (Đổi lái) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Tài xế 2 (Đổi lái)</span>
                  {selectedCrew.distanceKm > 300 && (
                    <span className="text-rose-600 text-[11px] font-bold">Bắt buộc cho tuyến &gt; 300km</span>
                  )}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Họ tên tài xế 2"
                    value={formData.secondaryDriverName || ''}
                    onChange={(e) => setFormData({ ...formData, secondaryDriverName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  <input
                    type="tel"
                    placeholder="SĐT tài xế 2"
                    value={formData.secondaryDriverPhone || ''}
                    onChange={(e) => setFormData({ ...formData, secondaryDriverPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Phụ xe / Tiếp viên */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phụ xe / Tiếp viên</label>
                  <input
                    type="text"
                    placeholder="Họ tên tiếp viên"
                    value={formData.conductorName || ''}
                    onChange={(e) => setFormData({ ...formData, conductorName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">SĐT Tiếp viên</label>
                  <input
                    type="tel"
                    placeholder="SĐT tiếp viên"
                    value={formData.conductorPhone || ''}
                    onChange={(e) => setFormData({ ...formData, conductorPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Kiểm tra nồng độ cồn */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.alcoholTested}
                    onChange={(e) => setFormData({ ...formData, alcoholTested: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Xác nhận đã thổi nồng độ cồn trước chuyến đi (Bắt buộc)
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Chỉ số đo thực tế:</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.alcoholReading ?? 0.0}
                    onChange={(e) => setFormData({ ...formData, alcoholReading: parseFloat(e.target.value) || 0 })}
                    className="w-24 px-2 py-1 text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">mg/L</span>
                  <span className="text-[11px] text-slate-500">(Bắt buộc = 0.00)</span>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Lưu Phân Công & Đối Soát An Toàn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default TripCrewPage;
