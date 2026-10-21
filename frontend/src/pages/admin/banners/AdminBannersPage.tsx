import React, { useState } from 'react';
import { Image, Search, Plus, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { toast } from '../../../context/ToastContext';

interface BannerItem {
  id: string;
  title: string;
  imagePath: string;
  position: 'Trang chu - Top' | 'Trang chu - Bottom';
  status: 'ACTIVE' | 'INACTIVE';
  statusLabel: string;
  duration: string;
  link?: string;
}

export const AdminBannersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const banners: BannerItem[] = [
    {
      id: 'bn1',
      title: 'Khuyen mai 20% ve Da Lat',
      imagePath: '/img/banners/dalat-sale.jpg',
      position: 'Trang chu - Top',
      status: 'ACTIVE',
      statusLabel: 'Dang hien',
      duration: '07:00 01/09/2026 — 06:59 01/10/2026',
      link: 'https://traveleasy.vn/dalat-sale',
    },
    {
      id: 'bn2',
      title: 'Uu dai LIMOUSINE cao cap',
      imagePath: '/img/banners/limo-promo.jpg',
      position: 'Trang chu - Bottom',
      status: 'ACTIVE',
      statusLabel: 'Dang hien',
      duration: '07:00 15/09/2026 — 06:59 15/10/2026',
    },
    {
      id: 'bn3',
      title: 'Ve Tet som - Dat ngay',
      imagePath: '/img/banners/tet-early.jpg',
      position: 'Trang chu - Top',
      status: 'INACTIVE',
      statusLabel: 'An',
      duration: '07:00 01/11/2026 — 06:59 01/01/2027',
      link: 'https://traveleasy.vn/tet-early',
    },
  ];

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
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> He thong <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Banner
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Banner
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {banners.length} banner trong he thong
          </div>
        </div>

        <button
          onClick={() => toast.info('Đang mở form tải lên banner quảng cáo mới...', 'Banner')}
          style={{
            backgroundColor: '#4f46e5',
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
            boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)'
          }}
        >
          <Plus size={16} />
          <span>Them banner</span>
        </button>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px',
            width: '280px',
            gap: '8px'
          }}
        >
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Tim theo tieu de, vi tri, link..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              color: '#0f172a',
              flex: 1
            }}
          />
        </div>

        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '13px',
            color: '#334155',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '160px'
          }}
        >
          <option value="ALL">Tat ca vi tri</option>
          <option value="Trang chu - Top">Trang chu - Top</option>
          <option value="Trang chu - Bottom">Trang chu - Bottom</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '13px',
            color: '#334155',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '160px'
          }}
        >
          <option value="ALL">Tat ca trang thai</option>
          <option value="ACTIVE">Dang hien</option>
          <option value="INACTIVE">An</option>
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TIEU DE</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>VI TRI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRANG THAI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>THOI GIAN</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>LINK</th>
              <th style={{ padding: '12px 18px', width: '80px', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const statusStyle = b.status === 'ACTIVE'
                ? { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' }
                : { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };

              return (
                <tr
                  key={b.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '28px',
                          borderRadius: '4px',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                          flexShrink: 0
                        }}
                      >
                        <Image size={15} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.title}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{b.imagePath}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {b.position}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                        border: `1px solid ${statusStyle.border}`,
                      }}
                    >
                      {b.statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12px' }}>{b.duration}</td>
                  <td style={{ padding: '14px 18px' }}>
                    {b.link ? (
                      <a
                        href={b.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#4f46e5',
                          textDecoration: 'none',
                          fontWeight: 600,
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>Xem</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>---</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => toast.info(`Đang mở chỉnh sửa banner "${b.title}"`, 'Chỉnh Sửa')}
                        title="Chinh sua"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#64748b',
                          display: 'flex',
                          borderRadius: '4px'
                        }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => toast.warning(`Đã xóa banner "${b.title}" khỏi hệ thống!`, 'Xóa Banner')}
                        title="Xoa"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#64748b',
                          display: 'flex',
                          borderRadius: '4px'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBannersPage;

