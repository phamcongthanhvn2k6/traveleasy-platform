import React, { useState } from 'react';
import { Bus, Eye, Ban, Check } from 'lucide-react';

interface BusCompanyItem {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  statusLabel: string;
  createdAt: string;
}

export const AdminBusCompaniesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  const [companies, setCompanies] = useState<BusCompanyItem[]>([
    {
      id: 'bc1',
      name: 'Phuong Trang FUTA',
      code: 'SK-2024-001',
      email: 'info@futabus.vn',
      phone: '1900 6067',
      status: 'ACTIVE',
      statusLabel: 'Hoat dong',
      createdAt: '16:00 10/02/2025',
    },
    {
      id: 'bc2',
      name: 'Kumho Samco',
      code: 'SK-2024-002',
      email: 'info@kumho.vn',
      phone: '1900 1800',
      status: 'ACTIVE',
      statusLabel: 'Hoat dong',
      createdAt: '16:00 01/03/2025',
    },
    {
      id: 'bc3',
      name: 'Tan Kim Thanh',
      code: 'SK-2026-015',
      email: 'tankimthanh@gmail.com',
      phone: '0933 000 111',
      status: 'PENDING',
      statusLabel: 'Cho duyet',
      createdAt: '16:00 18/09/2026',
    },
    {
      id: 'bc4',
      name: 'Ha Lan Express',
      code: 'SK-2025-008',
      email: 'contact@halan.vn',
      phone: '020 3848 0348',
      status: 'SUSPENDED',
      statusLabel: 'Tam ngung',
      createdAt: '16:00 01/08/2025',
    },
  ]);

  const toggleCompanyStatus = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.status === 'ACTIVE') {
          return { ...c, status: 'SUSPENDED', statusLabel: 'Tam ngung' };
        }
        return { ...c, status: 'ACTIVE', statusLabel: 'Hoat dong' };
      })
    );
  };

  const pendingCount = companies.filter((c) => c.status === 'PENDING').length;

  const filteredCompanies = companies.filter((c) => {
    if (activeTab === 'ALL') return true;
    return c.status === activeTab;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
          VeXeRe Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> <span style={{ color: '#0f172a' }}>Nha xe</span>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
          Quan ly nha xe
        </h1>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
          {pendingCount} cho duyet, {companies.length} tong cong
        </div>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { key: 'ALL', label: 'Tat ca' },
          { key: 'PENDING', label: 'Cho duyet' },
          { key: 'ACTIVE', label: 'Active' },
          { key: 'SUSPENDED', label: 'Suspended' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                backgroundColor: isActive ? '#4f46e5' : '#ffffff',
                color: isActive ? '#ffffff' : '#64748b',
                border: isActive ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
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
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TEN NHA XE</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>LIEN HE</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRANG THAI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NGAY TAO</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>HANH DONG</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((c) => {
              const statusStyles = {
                ACTIVE: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
                PENDING: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
                SUSPENDED: { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
              }[c.status];

              return (
                <tr
                  key={c.id}
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
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: '#eef2ff',
                          color: '#4f46e5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Bus size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{c.code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ color: '#334155' }}>{c.email}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{c.phone}</div>
                  </td>
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
                      {c.statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>{c.createdAt}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        title="Xem chi tiet"
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
                        <Eye size={16} />
                      </button>
                      {c.status === 'ACTIVE' ? (
                        <button
                          onClick={() => toggleCompanyStatus(c.id)}
                          title="Tam ngung nha xe"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: '#ef4444',
                            display: 'flex',
                            borderRadius: '4px'
                          }}
                        >
                          <Ban size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleCompanyStatus(c.id)}
                          title="Kich hoat / Duyet"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: '#10b981',
                            display: 'flex',
                            borderRadius: '4px'
                          }}
                        >
                          <Check size={16} />
                        </button>
                      )}
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

export default AdminBusCompaniesPage;

