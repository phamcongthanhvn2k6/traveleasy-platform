import React, { useState } from 'react';
import { Armchair, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from '../../../context/ToastContext';

interface SeatTypeItem {
  code: string;
  name: string;
  description: string;
  priceMultiplier: string;
  status: string;
}

export const AdminSeatTypesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const seatTypes: SeatTypeItem[] = [
    {
      code: 'VIP',
      name: 'Ghe VIP',
      description: 'Ghe ngoi rong, boc da',
      priceMultiplier: 'x1.3',
      status: 'Da xuat ban',
    },
    {
      code: 'STD',
      name: 'Ghe Thuong',
      description: 'Ghe ngoi tieu chuan',
      priceMultiplier: 'x1',
      status: 'Da xuat ban',
    },
    {
      code: 'BED_SINGLE',
      name: 'Giuong nam don',
      description: 'Giuong don 1 nguoi',
      priceMultiplier: 'x1.4',
      status: 'Da xuat ban',
    },
    {
      code: 'BED_DOUBLE',
      name: 'Giuong nam doi',
      description: 'Giuong doi 2 nguoi',
      priceMultiplier: 'x1.5',
      status: 'Da xuat ban',
    },
  ];

  const filtered = seatTypes.filter((s) => {
    if (search && !s.code.toLowerCase().includes(search.toLowerCase()) && !s.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Danh muc <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Loai ghe
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Loai ghe
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {seatTypes.length} loai ghe trong he thong
          </div>
        </div>

        <button
          onClick={() => toast.info('Đang mở form tạo loại ghế mới...', 'Thêm Loại Ghế')}
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
          <span>Them loai ghe</span>
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
            placeholder="Tim kiem ma, ten loai ghe..."
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
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>MA LOAI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TEN LOAI GHE</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>MO TA</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>HE SO GIA</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRANG THAI</th>
              <th style={{ padding: '12px 18px', width: '80px', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.code}
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
                    <span style={{ fontWeight: 700, color: '#3b82f6' }}>{item.code}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>{item.name}</td>
                <td style={{ padding: '14px 18px', color: '#64748b' }}>{item.description}</td>
                <td style={{ padding: '14px 18px', fontWeight: 700, color: '#d97706' }}>{item.priceMultiplier}</td>
                <td style={{ padding: '14px 18px' }}>
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => toast.info(`Đang mở chỉnh sửa loại ghế "${item.name}"...`, 'Chỉnh Sửa')}
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
                      onClick={() => toast.warning(`Đã xóa loại ghế "${item.name}" khỏi danh mục!`, 'Xóa Loại Ghế')}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSeatTypesPage;

