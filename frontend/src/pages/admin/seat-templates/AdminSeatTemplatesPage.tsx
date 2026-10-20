import React, { useState } from 'react';
import { Armchair, Search, Plus, Eye, Edit2, Grid, Trash2 } from 'lucide-react';

interface SeatTemplateItem {
  id: string;
  name: string;
  floors: number;
  rows: number;
  columns: number;
  totalSeats: string;
  status: 'PUBLISHED' | 'DRAFT';
  statusLabel: string;
}

export const AdminSeatTemplatesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const templates: SeatTemplateItem[] = [
    {
      id: 'tpl1',
      name: 'Giuong nam 2 tang 34 cho',
      floors: 2,
      rows: 5,
      columns: 4,
      totalSeats: '40 / 40',
      status: 'PUBLISHED',
      statusLabel: 'Da xuat ban',
    },
    {
      id: 'tpl2',
      name: 'Ghe ngoi 1 tang 24 cho (Limo)',
      floors: 1,
      rows: 6,
      columns: 4,
      totalSeats: '24 / 24',
      status: 'PUBLISHED',
      statusLabel: 'Da xuat ban',
    },
    {
      id: 'tpl3',
      name: 'Giuong nam 1 tang 22 cho',
      floors: 1,
      rows: 6,
      columns: 4,
      totalSeats: '24 / 24',
      status: 'DRAFT',
      statusLabel: 'Ban nhap',
    },
  ];

  const filtered = templates.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Danh muc <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Mau ghe
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Mau so do ghe
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {templates.length} mau trong he thong
          </div>
        </div>

        <button
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
          <span>Tao mau moi</span>
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
            placeholder="Tim kiem ten mau..."
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
            minWidth: '180px'
          }}
        >
          <option value="ALL">Tat ca trang thai</option>
          <option value="PUBLISHED">Da xuat ban</option>
          <option value="DRAFT">Ban nhap</option>
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
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TEN MAU</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TANG</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>HANG</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>COT</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TONG CHO</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRANG THAI</th>
              <th style={{ padding: '12px 18px', width: '120px', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const statusStyles = item.status === 'PUBLISHED'
                ? { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' }
                : { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };

              return (
                <tr
                  key={item.id}
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
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#eff6ff',
                          color: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Armchair size={17} />
                      </div>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#334155' }}>{item.floors}</td>
                  <td style={{ padding: '14px 18px', color: '#334155' }}>{item.rows}</td>
                  <td style={{ padding: '14px 18px', color: '#334155' }}>{item.columns}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#2563eb' }}>{item.totalSeats}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: statusStyles.bg,
                        color: statusStyles.text,
                        border: `1px solid ${statusStyles.border}`,
                      }}
                    >
                      {item.statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        title="Xem so do"
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
                        <Eye size={15} />
                      </button>
                      <button
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
                        title="Cau hinh ghe"
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
                        <Grid size={15} />
                      </button>
                      <button
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

export default AdminSeatTemplatesPage;

