import React, { useState, useEffect } from 'react';
import { Route as RouteIcon, Plus, Search, Edit2, Trash2, Clock, MapPin, RefreshCw, X, CheckCircle } from 'lucide-react';
import api from '../../../services/api';
import { toast } from '../../../context/ToastContext';

interface RouteItem {
  id: number;
  busCompanyId: number;
  busCompanyName: string;
  departureLocation: string;
  arrivalLocation: string;
  durationHours: number;
  distanceKm: number;
  pointsCount?: number;
  createdAt?: string;
}

export const CompanyRoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formDeparture, setFormDeparture] = useState('TP. Hồ Chí Minh');
  const [formArrival, setFormArrival] = useState('Đà Lạt');
  const [formDuration, setFormDuration] = useState('6.0');
  const [formDistance, setFormDistance] = useState('305');
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal
  const [editingRoute, setEditingRoute] = useState<RouteItem | null>(null);
  const [editDeparture, setEditDeparture] = useState('');
  const [editArrival, setEditArrival] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editDistance, setEditDistance] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/company/routes');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setRoutes(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load company routes:', err);
      toast.error('Không thể tải danh sách tuyến đường từ CSDL', 'Lỗi CSDL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDeparture.trim() || !formArrival.trim()) {
      toast.warning('Vui lòng nhập điểm đi và điểm đến!', 'Thiếu Thông Tin');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        busCompanyId: 1, // Nhà xe đối tác TravelEasy Express
        departureLocation: formDeparture.trim(),
        arrivalLocation: formArrival.trim(),
        durationHours: parseFloat(formDuration) || 6.0,
        distanceKm: parseFloat(formDistance) || 300.0,
      };

      const res = await api.post('/company/routes', payload);
      if (res.data?.data) {
        setRoutes((prev) => [res.data.data, ...prev]);
        toast.success(`Đã thêm tuyến đường ${formDeparture} → ${formArrival} vào CSDL!`, 'Thành Công');
        setShowCreateModal(false);
      }
    } catch (err: any) {
      console.error('Create route error:', err);
      toast.error(err.response?.data?.message || 'Không thể tạo tuyến đường!', 'Lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (r: RouteItem) => {
    setEditingRoute(r);
    setEditDeparture(r.departureLocation);
    setEditArrival(r.arrivalLocation);
    setEditDuration(String(r.durationHours));
    setEditDistance(String(r.distanceKm));
  };

  const handleUpdateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute) return;

    setUpdating(true);
    try {
      const payload = {
        busCompanyId: editingRoute.busCompanyId || 1,
        departureLocation: editDeparture.trim(),
        arrivalLocation: editArrival.trim(),
        durationHours: parseFloat(editDuration) || 6.0,
        distanceKm: parseFloat(editDistance) || 300.0,
      };

      const res = await api.put(`/company/routes/${editingRoute.id}`, payload);
      if (res.data?.data) {
        setRoutes((prev) => prev.map((item) => (item.id === editingRoute.id ? res.data.data : item)));
        toast.success(`Đã cập nhật tuyến đường #${editingRoute.id} thành công!`, 'Cập Nhật Thành Công');
        setEditingRoute(null);
      }
    } catch (err: any) {
      console.error('Update route error:', err);
      toast.error(err.response?.data?.message || 'Cập nhật tuyến đường thất bại!', 'Lỗi');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRoute = async (route: RouteItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tuyến ${route.departureLocation} → ${route.arrivalLocation} khỏi CSDL?`)) {
      return;
    }

    try {
      await api.delete(`/company/routes/${route.id}`);
      setRoutes((prev) => prev.filter((r) => r.id !== route.id));
      toast.success(`Đã xóa tuyến đường #${route.id} khỏi CSDL!`, 'Đã Xóa');
    } catch (err: any) {
      console.error('Delete route error:', err);
      toast.error(err.response?.data?.message || 'Không thể xóa tuyến đường (có thể đang có chuyến xe chạy)!', 'Lỗi');
    }
  };

  const filteredRoutes = routes.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.departureLocation.toLowerCase().includes(q) ||
      r.arrivalLocation.toLowerCase().includes(q) ||
      (r.busCompanyName && r.busCompanyName.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            Nhà xe <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Tuyến đường vận hành
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Tuyến Đường Nhà Xe
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Quản lý danh mục các lộ trình vận chuyển hành khách trực tiếp trên CSDL MySQL
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchRoutes}
            disabled={loading}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '9px 14px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
            }}
          >
            <Plus size={16} />
            <span>Tạo tuyến mới</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          placeholder="Tìm kiếm tuyến đường theo điểm đi, điểm đến hoặc nhà xe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '13px',
            color: '#1e293b',
            width: '100%',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Table Container */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>
                MÃ / TÊN TUYẾN
              </th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>
                ĐIỂM ĐI (XUẤT PHÁT)
              </th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>
                ĐIỂM ĐẾN
              </th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>
                THỜI GIAN
              </th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>
                CỰ LY (KM)
              </th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>
                TRẠNG THÁI
              </th>
              <th style={{ padding: '12px 18px', width: '110px', textAlign: 'right', color: '#64748b', fontWeight: 600, fontSize: '11px' }}>
                THAO TÁC
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: '#0284c7' }} />
                  <div>Đang tải dữ liệu tuyến đường từ MySQL...</div>
                </td>
              </tr>
            ) : filteredRoutes.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  <RouteIcon size={32} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#334155' }}>Không tìm thấy tuyến đường nào</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>Bấm nút "Tạo tuyến mới" để thêm tuyến đầu tiên vào CSDL.</div>
                </td>
              </tr>
            ) : (
              filteredRoutes.map((r) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: '#e0f2fe',
                          color: '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '12px',
                          flexShrink: 0,
                        }}
                      >
                        #{r.id}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {r.departureLocation} → {r.arrivalLocation}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {r.busCompanyName || 'TravelEasy Express'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontWeight: 600 }}>
                      <MapPin size={14} color="#0284c7" />
                      {r.departureLocation}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontWeight: 600 }}>
                      <MapPin size={14} color="#10b981" />
                      {r.arrivalLocation}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                      <Clock size={14} color="#f59e0b" />
                      {r.durationHours} giờ
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.distanceKm} km</span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 9px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                      }}
                    >
                      <CheckCircle size={12} /> Đang mở bán
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={() => openEditModal(r)}
                        title="Chỉnh sửa tuyến đường"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          color: '#0284c7',
                          borderRadius: '6px',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0f2fe')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteRoute(r)}
                        title="Xóa tuyến đường"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          color: '#ef4444',
                          borderRadius: '6px',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tạo Tuyến Mới */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
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
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RouteIcon size={18} color="#0284c7" />
                <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>Tạo Tuyến Đường Mới</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRoute} style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Điểm đi (Tỉnh / Thành phố khởi hành) *
                </label>
                <input
                  type="text"
                  required
                  value={formDeparture}
                  onChange={(e) => setFormDeparture(e.target.value)}
                  placeholder="Ví dụ: TP. Hồ Chí Minh"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Điểm đến (Tỉnh / Thành phố trả khách) *
                </label>
                <input
                  type="text"
                  required
                  value={formArrival}
                  onChange={(e) => setFormArrival(e.target.value)}
                  placeholder="Ví dụ: Đà Lạt, Nha Trang, Vũng Tàu..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Thời gian chạy dự kiến (giờ)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Cự ly lộ trình (km)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="10"
                    value={formDistance}
                    onChange={(e) => setFormDistance(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)',
                  }}
                >
                  {submitting ? 'Đang lưu vào MySQL...' : 'Lưu Tuyến Đường'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Tuyến */}
      {editingRoute && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
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
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={18} color="#0284c7" />
                <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Chỉnh Sửa Tuyến #{editingRoute.id}
                </h2>
              </div>
              <button
                onClick={() => setEditingRoute(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateRoute} style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Điểm đi (Khởi hành) *
                </label>
                <input
                  type="text"
                  required
                  value={editDeparture}
                  onChange={(e) => setEditDeparture(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Điểm đến *
                </label>
                <input
                  type="text"
                  required
                  value={editArrival}
                  onChange={(e) => setEditArrival(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Thời gian chạy (giờ)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Cự ly (km)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="10"
                    value={editDistance}
                    onChange={(e) => setEditDistance(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setEditingRoute(null)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)',
                  }}
                >
                  {updating ? 'Đang cập nhật...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
