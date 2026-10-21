import React, { useState, useEffect } from 'react';
import { MapPin, Search, Plus, Trash2, Clock, Navigation, Bus, RefreshCw, X } from 'lucide-react';
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
  pointsCount: number;
  createdAt: string;
}

interface BusCompanySimple {
  id: number;
  name: string;
}

export const AdminRoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [companies, setCompanies] = useState<BusCompanySimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form fields
  const [formCompanyId, setFormCompanyId] = useState<number | ''>('');
  const [formDeparture, setFormDeparture] = useState('TP. Hồ Chí Minh');
  const [formArrival, setFormArrival] = useState('Đà Lạt');
  const [formDuration, setFormDuration] = useState('6.5');
  const [formDistance, setFormDistance] = useState('310');
  const [submitting, setSubmitting] = useState(false);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/routes');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setRoutes(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load routes:', err);
      toast.error('Không thể tải danh sách tuyến đường từ CSDL', 'Lỗi CSDL');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/bus-companies');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setCompanies(res.data.data.map((c: any) => ({ id: Number(c.id), name: c.name })));
        if (res.data.data.length > 0) {
          setFormCompanyId(Number(res.data.data[0].id));
        }
      }
    } catch (err) {
      console.warn('Could not fetch companies for dropdown');
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchCompanies();
  }, []);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompanyId || !formDeparture.trim() || !formArrival.trim()) {
      toast.warning('Vui lòng điền đầy đủ nhà xe, điểm đi và điểm đến!', 'Thiếu Thông Tin');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        busCompanyId: Number(formCompanyId),
        departureLocation: formDeparture.trim(),
        arrivalLocation: formArrival.trim(),
        durationHours: parseFloat(formDuration) || 6.0,
        distanceKm: parseFloat(formDistance) || 300.0,
      };

      const res = await api.post('/admin/routes', payload);
      if (res.data?.data) {
        setRoutes(prev => [res.data.data, ...prev]);
        toast.success(`Đã thêm tuyến đường ${formDeparture} → ${formArrival} vào CSDL!`, 'Thành Công');
        setShowModal(false);
      }
    } catch (err: any) {
      console.error('Create route error:', err);
      toast.error(err.response?.data?.message || 'Không thể tạo tuyến đường!', 'Lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoute = async (route: RouteItem) => {
    if (!window.confirm(`Bạn có chắc muốn xoá tuyến đường ${route.departureLocation} → ${route.arrivalLocation} (${route.busCompanyName})?`)) {
      return;
    }

    try {
      await api.delete(`/admin/routes/${route.id}`);
      setRoutes(prev => prev.filter(r => r.id !== route.id));
      toast.info(`Đã xoá tuyến đường #${route.id} thành công!`, 'Xoá Tuyến Đường');
    } catch (err: any) {
      console.error('Delete route error:', err);
      toast.error(err.response?.data?.message || 'Xoá tuyến đường thất bại!', 'Lỗi');
    }
  };

  const filteredRoutes = routes.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.departureLocation.toLowerCase().includes(q) ||
      r.arrivalLocation.toLowerCase().includes(q) ||
      r.busCompanyName.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Quản trị <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Tuyến đường vận tải
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Quản Lý Tuyến Đường Xe Khách
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Tổng số: <strong>{routes.length}</strong> tuyến đường đang được khai thác trên toàn sàn
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchRoutes}
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
            <RefreshCw size={14} /> Làm mới
          </button>

          <button
            onClick={() => setShowModal(true)}
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
            <Plus size={16} /> Thêm Tuyến Đường Mới
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Tìm theo điểm đi, điểm đến hoặc nhà xe (Hà Nội, Sài Gòn, Đà Lạt, Phương Trang...)"
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
      </div>

      {/* Routes Table */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <th style={{ padding: '12px 18px', width: '80px' }}>MÃ TUYẾN</th>
              <th style={{ padding: '12px 18px' }}>NHÀ XE KHAI THÁC</th>
              <th style={{ padding: '12px 18px' }}>LỘ TRÌNH (ĐIỂM ĐI → ĐIỂM ĐẾN)</th>
              <th style={{ padding: '12px 18px' }}>THỜI GIAN DỰ KIẾN</th>
              <th style={{ padding: '12px 18px' }}>QUÃNG ĐƯỜNG</th>
              <th style={{ padding: '12px 18px', textAlign: 'right' }}>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Đang tải danh sách tuyến đường từ CSDL...
                </td>
              </tr>
            ) : filteredRoutes.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy tuyến đường nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredRoutes.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#64748b' }}>
                    #{r.id}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bus size={15} />
                      </div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{r.busCompanyName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{r.departureLocation}</span>
                      <span style={{ color: '#94a3b8' }}>→</span>
                      <span style={{ fontWeight: 700, color: '#d97706' }}>{r.arrivalLocation}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={14} color="#64748b" />
                      <span>{r.durationHours} giờ</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Navigation size={14} color="#64748b" />
                      <span>{r.distanceKm} km</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteRoute(r)}
                      title="Xoá tuyến đường"
                      style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Trash2 size={13} /> Xoá
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Thêm Tuyến Đường */}
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
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Thêm Tuyến Đường Mới</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Đồng bộ dữ liệu trực tiếp vào bảng routes</div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateRoute} style={{ padding: '24px' }}>
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

                {/* Điểm đi & Điểm đến */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Điểm Khởi Hành <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formDeparture}
                      onChange={e => setFormDeparture(e.target.value)}
                      placeholder="VD: TP. Hồ Chí Minh"
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
                      Điểm Đến <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formArrival}
                      onChange={e => setFormArrival(e.target.value)}
                      placeholder="VD: Đà Lạt"
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

                {/* Thời gian & Quãng đường */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Thời Gian Chạy (Giờ) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={formDuration}
                      onChange={e => setFormDuration(e.target.value)}
                      placeholder="VD: 6.5"
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
                      Quãng Đường (Km)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={formDistance}
                      onChange={e => setFormDistance(e.target.value)}
                      placeholder="VD: 310"
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
                  {submitting ? 'Đang tạo...' : 'Tạo Tuyến Đường'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoutesPage;
