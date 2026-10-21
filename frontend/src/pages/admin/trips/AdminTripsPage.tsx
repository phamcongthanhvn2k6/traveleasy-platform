import React, { useState, useEffect } from 'react';
import { Calendar, Search, Plus, Ban, CheckCircle, Clock, MapPin, Bus, RefreshCw, X } from 'lucide-react';
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

interface BusCompanySimple {
  id: number;
  name: string;
}

interface RouteSimple {
  id: number;
  busCompanyId: number;
  departureLocation: string;
  arrivalLocation: string;
}

export const AdminTripsPage: React.FC = () => {
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [companies, setCompanies] = useState<BusCompanySimple[]>([]);
  const [routes, setRoutes] = useState<RouteSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SCHEDULED' | 'DEPARTED' | 'CANCELLED'>('ALL');

  // Modal create trip
  const [showModal, setShowModal] = useState(false);
  const [formCompanyId, setFormCompanyId] = useState<number | ''>('');
  const [formRouteId, setFormRouteId] = useState<number | ''>('');
  const [formDepartureTime, setFormDepartureTime] = useState('2026-10-25T08:00');
  const [formArrivalTime, setFormArrivalTime] = useState('2026-10-25T14:30');
  const [formBusType, setFormBusType] = useState('SLEEPER');
  const [formPrice, setFormPrice] = useState('280000');
  const [formTotalSeats, setFormTotalSeats] = useState('34');
  const [submitting, setSubmitting] = useState(false);

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

  const fetchMeta = async () => {
    try {
      const [compRes, routeRes] = await Promise.all([
        api.get('/admin/bus-companies'),
        api.get('/admin/routes'),
      ]);
      if (compRes.data?.data && Array.isArray(compRes.data.data)) {
        const comps = compRes.data.data.map((c: any) => ({ id: Number(c.id), name: c.name }));
        setCompanies(comps);
        if (comps.length > 0) setFormCompanyId(comps[0].id);
      }
      if (routeRes.data?.data && Array.isArray(routeRes.data.data)) {
        const rts = routeRes.data.data.map((r: any) => ({
          id: Number(r.id),
          busCompanyId: Number(r.busCompanyId),
          departureLocation: r.departureLocation,
          arrivalLocation: r.arrivalLocation,
        }));
        setRoutes(rts);
        if (rts.length > 0) setFormRouteId(rts[0].id);
      }
    } catch (err) {
      console.warn('Could not load metadata for trip modal:', err);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchMeta();
  }, []);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompanyId || !formRouteId || !formDepartureTime || !formArrivalTime || !formPrice) {
      toast.warning('Vui lòng điền đầy đủ các thông tin chuyến xe!', 'Thiếu Thông Tin');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        busCompanyId: Number(formCompanyId),
        routeId: Number(formRouteId),
        departureTime: formDepartureTime,
        arrivalTime: formArrivalTime,
        busType: formBusType,
        price: parseFloat(formPrice),
        totalSeats: parseInt(formTotalSeats) || 34,
      };

      const res = await api.post('/admin/trips', payload);
      if (res.data?.data) {
        toast.success(`Đã thêm chuyến xe mới #${res.data.data.id} và tự động sinh đủ ${payload.totalSeats} ghế ngồi trong CSDL!`, 'Tạo Chuyến Xe Thành Công');
        setShowModal(false);
        fetchTrips();
      }
    } catch (err: any) {
      console.error('Create trip error:', err);
      toast.error(err.response?.data?.message || 'Tạo chuyến xe thất bại!', 'Lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTripStatus = async (trip: TripItem) => {
    const nextStatus = trip.status === 'SCHEDULED' ? 'CANCELLED' : 'SCHEDULED';
    const actionLabel = nextStatus === 'CANCELLED' ? 'HỦY BỎ' : 'KÍCH HOẠT MỞ BÁN';

    if (!window.confirm(`Bạn có chắc muốn ${actionLabel} chuyến xe ${trip.originCity} → ${trip.destinationCity} (${trip.busCompanyName})?`)) {
      return;
    }

    try {
      await api.patch(`/admin/trips/${trip.id}/status`, null, {
        params: { status: nextStatus },
      });

      setTrips(prev => prev.map(t => (t.id === trip.id ? { ...t, status: nextStatus } : t)));

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

          <button
            onClick={() => {
              fetchMeta();
              setShowModal(true);
            }}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
            }}
          >
            <Plus size={16} /> Thêm Chuyến Xe Mới
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
              <th style={{ padding: '12px 18px', width: '70px' }}>MÃ</th>
              <th style={{ padding: '12px 18px' }}>NHÀ XE</th>
              <th style={{ padding: '12px 18px' }}>LỘ TRÌNH</th>
              <th style={{ padding: '12px 18px' }}>KHỞI HÀNH</th>
              <th style={{ padding: '12px 18px' }}>LOẠI XE</th>
              <th style={{ padding: '12px 18px' }}>GIÁ VÉ</th>
              <th style={{ padding: '12px 18px' }}>KHO GHẾ TRỐNG</th>
              <th style={{ padding: '12px 18px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '12px 18px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Đang tải danh sách chuyến xe từ cơ sở dữ liệu...
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
                  year: 'numeric',
                });

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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: t.availableSeats > 0 ? '#10b981' : '#ef4444' }}>
                          {t.availableSeats}
                        </span>
                        <span style={{ color: '#94a3b8' }}>/ {t.totalSeats} chỗ</span>
                      </div>
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
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {isScheduled ? <CheckCircle size={12} /> : <Ban size={12} />}
                        {isScheduled ? 'MỞ BÁN' : 'TẠM HỦY'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleTripStatus(t)}
                        style={{
                          backgroundColor: isScheduled ? '#fef2f2' : '#ecfdf5',
                          color: isScheduled ? '#dc2626' : '#059669',
                          border: `1px solid ${isScheduled ? '#fecaca' : '#a7f3d0'}`,
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {isScheduled ? 'Hủy chuyến' : 'Mở bán lại'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm Chuyến Xe Mới */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '560px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Thêm Chuyến Xe Mới</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Hệ thống tự động sinh 34 ghế ngồi A01-A17, B01-B17</div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTrip} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Nhà xe */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Nhà Xe Khai Thác <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formCompanyId}
                    onChange={e => setFormCompanyId(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tuyến đường */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Tuyến Đường Vận Tải <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formRouteId}
                    onChange={e => setFormRouteId(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>
                        Tuyến #{r.id}: {r.departureLocation} → {r.arrivalLocation}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Thời gian đi & đến */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Thời Gian Khởi Hành <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formDepartureTime}
                      onChange={e => setFormDepartureTime(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Thời Gian Đến Dự Kiến <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formArrivalTime}
                      onChange={e => setFormArrivalTime(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Loại xe & Giá vé */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Loại Xe <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={formBusType}
                      onChange={e => setFormBusType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="SLEEPER">Giường Nằm (SLEEPER)</option>
                      <option value="LIMOUSINE">Limousine VIP</option>
                      <option value="SEAT">Ghế Ngồi Tiêu Chuẩn</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Giá Vé (VNĐ) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="10000"
                      min="50000"
                      value={formPrice}
                      onChange={e => setFormPrice(e.target.value)}
                      placeholder="VD: 280000"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Kho ghế */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Quy Mô Ghế Ngồi (Mặc định 34 chỗ 2 tầng)
                  </label>
                  <input
                    type="number"
                    value={formTotalSeats}
                    onChange={e => setFormTotalSeats(e.target.value)}
                    min="10"
                    max="60"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#f8fafc',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {submitting ? 'Đang tạo...' : 'Tạo Chuyến Xe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTripsPage;
