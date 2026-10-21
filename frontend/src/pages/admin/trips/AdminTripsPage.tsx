import React, { useState, useEffect } from 'react';
import { Calendar, Search, Plus, Ban, CheckCircle, Clock, MapPin, Bus, RefreshCw } from 'lucide-react';
import api from '../../../services/api';
import { toast } from '../../../context/ToastContext';

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

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/trips');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setTrips(res.data.data);
      }
    } catch (err: any) {
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
    const nextStatus = trip.status === 'SCHEDULED' ? 'CANCELLED' : 'SCHEDULED';
    const actionLabel = nextStatus === 'CANCELLED' ? 'HỦY BỎ' : 'KÍCH HOẠT MỞ BÁN';

    if (!window.confirm(`Bạn có chắc muốn ${actionLabel} chuyến xe ${trip.originCity} → ${trip.destinationCity} (${trip.busCompanyName})?`)) {
      return;
    }

    try {
      await api.patch(`/admin/trips/${trip.id}/status`, null, {
        params: { status: nextStatus }
      });

      setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, status: nextStatus } : t));

      if (nextStatus === 'CANCELLED') {
        toast.warning(
          `Đã chuyển chuyến xe #${trip.id} sang trạng thái CANCELLED. Chuyến xe sẽ không hiển thị trên trang tìm kiếm của khách hàng.`,
          'Đồng Bộ CSDL'
        );
      } else {
        toast.success(
          `Đã mở bán lại chuyến xe #${trip.id}. Khách hàng có thể tìm kiếm và đặt vé ngay lập tức.`,
          'Đồng Bộ CSDL'
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Quản trị <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Chuyến xe sàn
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Quản Lý Chuyến Xe & Mở Bán Vé
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Tổng số: <strong>{trips.length}</strong> chuyến • <strong>{scheduledCount}</strong> đang mở bán • <strong>{cancelledCount}</strong> tạm hủy
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
              padding: '9px 14px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} /> Làm mới CSDL
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Tìm theo tuyến đường (Hà Nội, Sài Gòn, Đà Lạt...) hoặc tên nhà xe..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Status Tab buttons */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          {(['ALL', 'SCHEDULED', 'CANCELLED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              style={{
                backgroundColor: statusFilter === tab ? '#ffffff' : 'transparent',
                color: statusFilter === tab ? '#1e3a8a' : '#64748b',
                fontWeight: statusFilter === tab ? 700 : 500,
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: statusFilter === tab ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {tab === 'ALL' ? 'Tất cả' : tab === 'SCHEDULED' ? 'Đang mở bán' : 'Đã hủy'}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Table */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <th style={{ padding: '12px 16px' }}>MÃ & TUYẾN ĐƯỜNG</th>
              <th style={{ padding: '12px 16px' }}>NHÀ XE</th>
              <th style={{ padding: '12px 16px' }}>GIỜ KHỞI HÀNH</th>
              <th style={{ padding: '12px 16px' }}>LOẠI XE</th>
              <th style={{ padding: '12px 16px' }}>GIÁ VÉ</th>
              <th style={{ padding: '12px 16px' }}>CHỖ TRỐNG</th>
              <th style={{ padding: '12px 16px' }}>TRẠNG THÁI TRÊN WEB</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  Đang tải dữ liệu chuyến xe từ CSDL...
                </td>
              </tr>
            ) : filteredTrips.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy chuyến xe nào phù hợp bộ lọc.
                </td>
              </tr>
            ) : (
              filteredTrips.map(trip => (
                <tr key={trip.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>
                      {trip.originCity} → {trip.destinationCity}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                      ID Chuyến: #{trip.id} • Tuyến #{trip.routeId}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Bus size={14} color="#2563eb" /> {trip.busCompanyName}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#334155' }}>
                      {new Date(trip.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      {new Date(trip.departureTime).toLocaleDateString('vi-VN')}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px', color: '#475569', fontWeight: 500 }}>
                    {trip.busType}
                  </td>

                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trip.price)}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontWeight: 700, color: trip.availableSeats > 0 ? '#16a34a' : '#ef4444' }}>
                      {trip.availableSeats} / {trip.totalSeats} chỗ
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        backgroundColor: trip.status === 'SCHEDULED' ? '#eff6ff' : '#fef2f2',
                        color: trip.status === 'SCHEDULED' ? '#2563eb' : '#ef4444',
                        border: `1px solid ${trip.status === 'SCHEDULED' ? '#bfdbfe' : '#fecaca'}`,
                      }}
                    >
                      {trip.status === 'SCHEDULED' ? 'Đang mở bán (Hiển thị)' : 'Đã hủy (Ẩn khỏi Web)'}
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleTripStatus(trip)}
                      style={{
                        backgroundColor: trip.status === 'SCHEDULED' ? '#fff1f2' : '#f0fdf4',
                        color: trip.status === 'SCHEDULED' ? '#e11d48' : '#16a34a',
                        border: `1px solid ${trip.status === 'SCHEDULED' ? '#fecdd3' : '#bbf7d0'}`,
                        borderRadius: '6px',
                        padding: '5px 12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {trip.status === 'SCHEDULED' ? (
                        <>
                          <Ban size={13} /> Hủy bán vé
                        </>
                      ) : (
                        <>
                          <CheckCircle size={13} /> Mở bán lại
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTripsPage;

