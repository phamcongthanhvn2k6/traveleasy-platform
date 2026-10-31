import React, { useState, useEffect } from 'react';
import { MapPin, Search, Clock, Navigation, Bus, RefreshCw, X, Eye, ShieldCheck, AlertCircle, Building2 } from 'lucide-react';
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

export const AdminRoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/routes');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setRoutes(res.data.data);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      console.error('Failed to load routes:', err);
      toast.error('Không thể tải danh sách tuyến đường từ CSDL', 'Lỗi CSDL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

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
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Quản trị sàn <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> <span style={{ color: '#0f172a' }}>Giám sát tuyến đường</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Giám Sát Mạng Lưới Tuyến Đường Toàn Sàn
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Tổng số: <strong>{routes.length}</strong> tuyến đường đang được các đối tác nhà xe đăng ký khai thác
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

      {/* Info Notice Card: Role separation */}
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
          <strong>Quy chuẩn phân định trách nhiệm:</strong> Tuyến đường, trạm đón/trả và lộ trình khai thác do <strong>Nhà xe đối tác trực tiếp sở hữu và quản lý</strong> tại Cổng Điều Hành Đối Tác (theo giấy phép của Sở GTVT). Admin sàn thực hiện vai trò <strong>giám sát tuân thủ, kiểm tra lộ trình và hỗ trợ hành khách</strong>.
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo điểm đi, điểm đến hoặc nhà xe khai thác (Phương Trang, Hà Nội, Sài Gòn, Đà Lạt...)"
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
      </div>

      {/* Table */}
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
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>MÃ TUYẾN</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NHÀ XE KHAI THÁC</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>LỘ TRÌNH (XUẤT PHÁT → ĐẾN)</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>THỜI GIAN CHẠY</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>QUÃNG ĐƯỜNG</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>ĐIỂM ĐÓN/TRẢ</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Đang tải mạng lưới tuyến đường từ CSDL...
                </td>
              </tr>
            ) : filteredRoutes.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy tuyến đường nào.
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
                      {r.pointsCount || 2} trạm đón/trả
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedRoute(r)}
                      title="Xem chi tiết lộ trình tuyến đường"
                      style={{
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Eye size={13} /> Chi Tiết Lộ Trình
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Xem Chi Tiết Lộ Trình Tuyến Đường */}
      {selectedRoute && (
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
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    Chi Tiết Tuyến Đường #{selectedRoute.id}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Đơn vị khai thác: <strong style={{ color: '#0f172a' }}>{selectedRoute.busCompanyName}</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedRoute(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Route banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    HÀNH TRÌNH KHAI THÁC
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>
                    {selectedRoute.departureLocation} <span style={{ color: '#2563eb' }}>⇄</span> {selectedRoute.arrivalLocation}
                  </div>
                </div>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  ● Đang Mở Bán
                </span>
              </div>

              {/* Grid specs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <Navigation size={13} /> QUÃNG ĐƯỜNG
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                    {selectedRoute.distanceKm} km
                  </div>
                </div>

                <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <Clock size={13} /> THỜI GIAN LƯU THÔNG
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                    ~{selectedRoute.durationHours} giờ
                  </div>
                </div>

                <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <Building2 size={13} /> DOANH NGHIỆP VẬN TẢI
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>
                    {selectedRoute.busCompanyName}
                  </div>
                </div>

                <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <MapPin size={13} /> ĐIỂM ĐÓN / TRẢ
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                    {selectedRoute.pointsCount || 2} điểm dừng
                  </div>
                </div>
              </div>

              {/* Regulatory Notice */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '12px 14px',
                  backgroundColor: '#fffbeb',
                  borderRadius: '10px',
                  border: '1px solid #fde68a',
                  fontSize: '12px',
                  color: '#92400e',
                  lineHeight: 1.5,
                  marginBottom: '20px',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Quy chế vận hành sàn:</strong> Điểm đón/trả và giá cước chặng dọc đường do Nhà xe đối tác khai báo và chịu trách nhiệm pháp lý theo giấy phép luồng tuyến của Sở GTVT. Quản trị viên sàn chỉ can thiệp tạm ngưng mở bán khi có thông báo đình chỉ từ cơ quan chức năng hoặc phát sinh vi phạm quy chế sàn.
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedRoute(null)}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoutesPage;
