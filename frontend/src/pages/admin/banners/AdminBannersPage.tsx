import React, { useState, useEffect } from 'react';
import { Image, Search, Plus, ExternalLink, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

interface BannerItem {
  id: string;
  title: string;
  imagePath: string;
  position: string;
  status: 'ACTIVE' | 'INACTIVE';
  statusLabel: string;
  duration: string;
  link?: string;
}

export const AdminBannersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<BannerItem[]>([]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/banners');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setBanners(res.data.data.map((b: any) => ({
          id: String(b.id),
          title: b.title,
          imagePath: b.imagePath || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500',
          position: b.position || 'Trang chu - Top',
          status: b.status,
          statusLabel: b.status === 'ACTIVE' ? 'Đang hiện' : 'Đang ẩn',
          duration: b.duration || '07:00 01/01/2026 - 23:59 31/12/2026',
          link: b.link,
        })));
      }
    } catch (err) {
      console.warn('Could not load banners from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleToggleStatus = async (banner: BannerItem) => {
    const nextStatus = banner.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/admin/banners/${banner.id}/status`);
      setBanners(prev => prev.map(b => b.id === banner.id ? {
        ...b,
        status: nextStatus,
        statusLabel: nextStatus === 'ACTIVE' ? 'Đang hiện' : 'Đang ẩn'
      } : b));

      if (nextStatus === 'ACTIVE') {
        toast.success(`Đã hiển thị banner "${banner.title}" lên Trang chủ cho người dùng!`, 'Đồng Bộ CSDL');
      } else {
        toast.warning(`Đã ẩn banner "${banner.title}" khỏi Trang chủ người dùng!`, 'Đồng Bộ CSDL');
      }
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái banner', 'Thất Bại');
    }
  };

  const handleDeleteBanner = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn banner "${title}" khỏi hệ thống?`)) return;
    try {
      await api.delete(`/admin/banners/${id}`);
      setBanners(prev => prev.filter(b => b.id !== id));
      toast.success(`Đã xóa banner "${title}" thành công!`, 'Đồng Bộ CSDL');
    } catch (err) {
      toast.error('Lỗi khi xóa banner', 'Thất Bại');
    }
  };

  const filtered = banners.filter((b) => {
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (positionFilter !== 'ALL' && b.position !== positionFilter) return false;
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Hệ thống <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Banner
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Quản Lý Banner Quảng Cáo & Khuyến Mãi
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Đồng bộ trực tiếp với mục Khuyến Mãi trên Trang Chủ của người dùng
          </div>
        </div>

        <button
          onClick={fetchBanners}
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
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Tìm theo tiêu đề banner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '9px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            color: '#334155',
            outline: 'none',
            backgroundColor: '#ffffff'
          }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hiện trên Web</option>
          <option value="INACTIVE">Đang ẩn</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <th style={{ padding: '12px 18px' }}>ẢNH & TIÊU ĐỀ BANNER</th>
              <th style={{ padding: '12px 18px' }}>VỊ TRÍ HIỂN THỊ</th>
              <th style={{ padding: '12px 18px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '12px 18px' }}>THỜI HẠN</th>
              <th style={{ padding: '12px 18px' }}>LIÊN KẾT ĐÍCH</th>
              <th style={{ padding: '12px 18px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  Đang tải danh sách banner từ CSDL...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy banner nào.
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '72px',
                          height: '42px',
                          borderRadius: '6px',
                          backgroundColor: '#f1f5f9',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Image size={20} color="#94a3b8" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.title}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>ID: #{b.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      {b.position}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        backgroundColor: b.status === 'ACTIVE' ? '#f0fdf4' : '#f8fafc',
                        color: b.status === 'ACTIVE' ? '#16a34a' : '#64748b',
                        border: `1px solid ${b.status === 'ACTIVE' ? '#bbf7d0' : '#cbd5e1'}`,
                      }}
                    >
                      {b.status === 'ACTIVE' ? 'Đang hiện trên Web' : 'Đang ẩn'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12px' }}>
                    {b.duration}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {b.link ? (
                      <a
                        href={b.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#2563eb',
                          textDecoration: 'none',
                          fontWeight: 600,
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>Mở liên kết</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>---</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleStatus(b)}
                        title={b.status === 'ACTIVE' ? 'Ẩn khỏi web' : 'Hiển thị lên web'}
                        style={{
                          backgroundColor: b.status === 'ACTIVE' ? '#fff1f2' : '#f0fdf4',
                          border: `1px solid ${b.status === 'ACTIVE' ? '#fecdd3' : '#bbf7d0'}`,
                          color: b.status === 'ACTIVE' ? '#e11d48' : '#16a34a',
                          cursor: 'pointer',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {b.status === 'ACTIVE' ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span>{b.status === 'ACTIVE' ? 'Ẩn' : 'Hiện'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b.id, b.title)}
                        title="Xóa banner"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#94a3b8',
                          display: 'flex',
                          borderRadius: '4px'
                        }}
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
    </div>
  );
};

export default AdminBannersPage;
