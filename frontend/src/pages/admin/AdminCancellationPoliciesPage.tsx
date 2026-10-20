import React, { useState } from 'react';
import { Shield, Search, Plus, Eye, Edit2, Trash2, Building, Settings2, Info } from 'lucide-react';

interface PolicyItem {
  id: string;
  name: string;
  version: string;
  companyName: string;
  isSystem: boolean;
  isDefault: boolean;
  rulesCount: number;
}

export const AdminCancellationPoliciesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const policies: PolicyItem[] = [
    {
      id: 'cp1',
      name: 'Mac dinh',
      version: 'cp1 — v0',
      companyName: 'He thong',
      isSystem: true,
      isDefault: true,
      rulesCount: 3,
    },
    {
      id: 'cp2',
      name: 'Kumho rieng',
      version: 'cp2 — v0',
      companyName: 'Kumho Samco',
      isSystem: false,
      isDefault: false,
      rulesCount: 3,
    },
    {
      id: 'cp3',
      name: 'Ha Lan rieng',
      version: 'cp3 — v0',
      companyName: 'Ha Lan Express',
      isSystem: false,
      isDefault: false,
      rulesCount: 0,
    },
  ];

  const filtered = policies.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.companyName.toLowerCase().includes(search.toLowerCase())) {
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
            VeXeRe Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> He thong <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Chinh sach huy
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Chinh sach huy ve
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {policies.length} chinh sach — 6 quy tac
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={{
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span>Them quy tac</span>
          </button>
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
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)'
            }}
          >
            <Plus size={16} />
            <span>Them chinh sach</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 12px',
              width: '260px',
              gap: '8px'
            }}
          >
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Tim ten chinh sach, nha xe..."
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
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
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
            <option value="ALL">Tat ca nha xe</option>
            <option value="Kumho">Kumho Samco</option>
            <option value="HaLan">Ha Lan Express</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '140px'
            }}
          >
            <option value="ALL">Tat ca loai</option>
            <option value="SYSTEM">He thong</option>
            <option value="CUSTOM">Tuy chinh</option>
          </select>
        </div>

        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Eye size={14} color="#94a3b8" />
          <span>Click eye de xem quy tac cua chinh sach</span>
        </div>
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
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>CHINH SACH</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NHA XE</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>MAC DINH</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>QUY TAC</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>HANH DONG</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: item.isSystem ? '#fffbeb' : '#eff6ff',
                        color: item.isSystem ? '#d97706' : '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Shield size={17} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{item.version}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  {item.isSystem ? (
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: '#0f172a',
                        color: '#ffffff'
                      }}
                    >
                      {item.companyName}
                    </span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                      <Building size={14} color="#64748b" />
                      <span>{item.companyName}</span>
                    </div>
                  )}
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: item.isDefault ? '#ecfdf5' : '#f1f5f9',
                      color: item.isDefault ? '#059669' : '#64748b',
                      border: item.isDefault ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                    }}
                  >
                    {item.isDefault ? 'Mac dinh' : 'Tuy chinh'}
                  </span>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontWeight: 600 }}>
                    <Settings2 size={14} color="#64748b" />
                    <span>{item.rulesCount}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      title="Xem quy tac"
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

      {/* Bottom Cascade Notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
        <Info size={14} color="#94a3b8" />
        <span>CancellationPolicy → CancellationRules: Xoa Policy se xoa toan bo Rule lien quan (cascade).</span>
      </div>
    </div>
  );
};

export default AdminCancellationPoliciesPage;
