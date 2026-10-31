import React, { useState, useEffect } from 'react';
import { Calendar, Search, Ban, CheckCircle, Clock, MapPin, Bus, RefreshCw, X, Users, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../../services/api';
import { toast } from '../../../context/ToastContext';
import { PassengerManifestModal } from '../../../components/PassengerManifestModal';

interface TripItem {
  id: number;
  busCompanyId: number;
  busCompanyName: string;
  routeId: number;
  originCity: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  busType: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: 'SCHEDULED' | 'DEPARTED' | 'CANCELLED';
}

export const AdminTripsPage: React.FC = () => {
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SCHEDULED' | 'DEPARTED' | 'CANCELLED'>('ALL');

  // Modal Manifest / Dispatch
  const [manifestTrip, setManifestTrip] = useState<TripItem | null>(null);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/trips');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setTrips(res.data.data);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      console.error('Failed to load trips from API:', err);
      toast.error('Không thể tải danh sách chuyến xe từ CSDL', 'Lỗi Kết Nối');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleToggleTripStatus = async (trip: TripItem) => {
    const willCancel = trip.status === 'SCHEDULED';
    const actionLabel = willCancel ? 'ĐÌNH CHỈ KHẨN CẤP (TẠM HỦY)' : 'MỞ BÁN LẠI';

    const reason = window.prompt(
      `Xác nhận ${actionLabel} chuyến xe #${trip.id} (${trip.originCity} → ${trip.destinationCity} của ${trip.busCompanyName})?\n\nVui lòng nhập lý do điều phối (sự cố kỹ thuật, thời tiết xấu, hoặc theo đề nghị nhà xe):`,
      willCancel ? 'Điều phối khẩn cấp theo thông báo sự cố từ nhà xe' : 'Khôi phục mở bán sau khi giải quyết sự cố'
    );

    if (!reason || !reason.trim()) return;

    const nextStatus = willCancel ? 'CANCELLED' : 'SCHEDULED';

    try {
      await api.patch(`/admin/trips/${trip.id}/status`, null, {
        params: { status: nextStatus },
      });

      setTrips(prev => prev.map(t => (t.id === trip.id ? { ...t, status: nextStatus } : t)));

      if (nextStatus === 'CANCELLED') {
        toast.warning(
          `Đã tạm đình chỉ mở bán chuyến #${trip.id} trên sàn TravelEasy (Lý do: ${reason}).`,
          'Đình Chỉ Chuyến Xe'
        );
      } else {
        toast.success(
          `Đã khôi phục mở bán chuyến #${trip.id} trên sàn TravelEasy.`,
          'Khôi Phục Mở Bán'
        );
      }
    } catch (err: any) {
      console.error('Failed to update trip status:', err);
      toast.error('Cập nhật trạng thái chuyến xe thất bại!', 'Lỗi');
    }
  };

  const filteredTrips = trips.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchCity = t.originCity.toLowerCase().includes(q) || t.destinationCity.toLowerCase().includes(q);
      const matchCompany = t.busCompanyName.toLowerCase().includes(q);
      if (!matchCity && !matchCompany) return false;
    }
    return true;
  });

  const scheduledCount = trips.filter(t => t.status === 'SCHEDULED').length;
  const cancelledCount = trips.filter(t => t.status === 'CANCELLED').length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Quản trị sàn <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> <span style={{ color: '#0f172a' }}>Giám sát chuyến xe</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Giám Sát &amp; Điều Phối Chuyến Xe Toàn Sàn
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Tổng số: <strong>{trips.length}</strong> chuyến xe ({scheduledCount} đang mở bán, {cancelledCount} tạm hủy)
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchTrips}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>
      </div>

      {/* Info Notice Card: Governance */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 18px',
          borderRadius: '10px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          marginBottom: '18px',
          fontSize: '13px',
          color: '#1e40af',
        }}
      >
        <ShieldCheck size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>Quy chuẩn phân định trách nhiệm vận hành:</strong> Chuyến xe, giờ chạy, số lượng ghế và giá vé do <strong>Nhà xe đối tác trực tiếp thiết lập và chịu trách nhiệm pháp lý</strong> tại Cổng Điều Hành Nhà Xe. Admin sàn TravelEasy thực hiện vai trò <strong>giám sát tỷ lệ lấp đầy, điều phối khi có sự cố bất khả kháng và bảo vệ tiền vé hành khách (Escrow)</strong>.
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            placeholder="Tìm theo nhà xe, điểm đi hoặc điểm đến (Phương Trang, Hà Nội, Đà Lạt...)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13.5px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'SCHEDULED', label: `Đang mở bán (${scheduledCount})` },
            { key: 'DEPARTED', label: 'Đã khởi hành' },
            { key: 'CANCELLED', label: `Tạm hủy (${cancelledCount})` },
          ].map((tab: any) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  backgroundColor: isActive ? '#2563eb' : '#ffffff',
                  color: isActive ? '#ffffff' : '#64748b',
                  border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trips Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>MÃ CHUYẾN</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NHÀ XE VẬN HÀNH</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>LỘ TRÌNH</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>GIỜ XUẤT BẾN</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>DÒNG XE</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>GIÁ NIÊM YẾT</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>GHẾ TRỐNG</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>ĐIỀU PHỐI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Đang tải danh sách chuyến xe từ CSDL...
                </td>
              </tr>
            ) : filteredTrips.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy chuyến xe nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredTrips.map(t => {
                const isScheduled = t.status === 'SCHEDULED';
                const depDate = new Date(t.departureTime);
                const depStr = depDate.toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                });
                const bookedCount = t.totalSeats - t.availableSeats;

                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#64748b' }}>
                      #{t.id}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Bus size={15} />
                        </div>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{t.busCompanyName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{t.originCity}</span>
                        <span style={{ color: '#94a3b8' }}>→</span>
                        <span style={{ fontWeight: 700, color: '#d97706' }}>{t.destinationCity}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} color="#64748b" />
                        <span>{depStr}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
                        {t.busType}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#2563eb' }}>
                      {t.price.toLocaleString('vi-VN')} đ
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontWeight: 700, color: t.availableSeats > 0 ? '#10b981' : '#ef4444' }}>
                        {t.availableSeats}
                      </span>
                      <span style={{ color: '#94a3b8' }}>/{t.totalSeats}</span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          backgroundColor: isScheduled ? '#ecfdf5' : '#fef2f2',
                          color: isScheduled ? '#059669' : '#dc2626',
                          border: `1px solid ${isScheduled ? '#a7f3d0' : '#fecaca'}`,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {isScheduled ? 'MỞ BÁN' : 'TẠM HỦY'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {/* Nút Xem Danh Sách Hành Khách */}
                        <button
                          onClick={() => setManifestTrip(t)}
                          title="Lệnh điều xe & Danh sách hành khách"
                          style={{
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <Users size={13} color="#2563eb" /> Khách ({bookedCount})
                        </button>

                        {/* Nút Đình Chỉ Khẩn Cấp / Mở Lại (Admin Governance) */}
                        <button
                          onClick={() => handleToggleTripStatus(t)}
                          title={isScheduled ? 'Đình chỉ khẩn cấp mở bán chuyến này' : 'Mở bán lại chuyến xe'}
                          style={{
                            backgroundColor: isScheduled ? '#fffbeb' : '#ecfdf5',
                            color: isScheduled ? '#d97706' : '#059669',
                            border: `1px solid ${isScheduled ? '#fde68a' : '#a7f3d0'}`,
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isScheduled ? <Ban size={13} /> : <CheckCircle size={13} />}
                          <span>{isScheduled ? 'Đình chỉ' : 'Mở lại'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Passenger Manifest Modal */}
      {manifestTrip && (
        <PassengerManifestModal
          trip={manifestTrip}
          isOpen={true}
          isAdmin={true}
          onClose={() => setManifestTrip(null)}
        />
      )}
    </div>
  );
};

export default AdminTripsPage;
