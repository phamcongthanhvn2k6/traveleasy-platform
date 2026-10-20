import React, { useState } from 'react';
import { Plus, Eye } from 'lucide-react';

interface TripItem {
  id: string;
  code: string;
  routeName: string;
  vehiclePlate: string;
  departureTime: string;
  delayText: string;
  status: 'SCHEDULED' | 'DELAYED' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';
  statusLabel: string;
}

export const CompanyTripsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const trips: TripItem[] = [
    {
      id: 't1',
      code: 't1',
      routeName: 'Sai Gon - Da Lat',
      vehiclePlate: '51B-123.45',
      departureTime: '02:00 22/09/2026',
      delayText: '—',
      status: 'SCHEDULED',
      statusLabel: 'Da len lich',
    },
    {
      id: 't2',
      code: 't2',
      routeName: 'Sai Gon - Nha Trang',
      vehiclePlate: '51B-987.65',
      departureTime: '04:00 22/09/2026',
      delayText: '—',
      status: 'SCHEDULED',
      statusLabel: 'Da len lich',
    },
    {
      id: 't4',
      code: 't4',
      routeName: 'Sai Gon - Da Lat',
      vehiclePlate: '51B-123.45',
      departureTime: '15:00 20/09/2026',
      delayText: '—',
      status: 'COMPLETED',
      statusLabel: 'Hoan thanh',
    },
    {
      id: 't5',
      code: 't5',
      routeName: 'Sai Gon - Nha Trang',
      vehiclePlate: '51B-987.65',
      departureTime: '02:00 20/09/2026',
      delayText: '—',
      status: 'CANCELLED',
      statusLabel: 'Da huy',
    },
    {
      id: 't6',
      code: 't6',
      routeName: 'Sai Gon - Da Lat',
      vehiclePlate: '51B-123.45',
      departureTime: '02:00 23/09/2026',
      delayText: '+30 phut',
      status: 'DELAYED',
      statusLabel: 'Tre gio',
    },
    {
      id: 't7',
      code: 't7',
      routeName: 'Sai Gon - Da Lat',
      vehiclePlate: '51B-123.45',
      departureTime: '02:00 24/09/2026',
      delayText: '—',
      status: 'SCHEDULED',
      statusLabel: 'Da len lich',
    },
  ];

  const filtered = trips.filter((t) => {
    if (activeTab === 'ALL') return true;
    return t.status === activeTab;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            Nha xe <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Chuyen xe
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Chuyen xe
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {trips.length} chuyen
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
          <span>Tao chuyen moi</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { key: 'ALL', label: 'Tat ca' },
          { key: 'SCHEDULED', label: 'SCHEDULED' },
          { key: 'DELAYED', label: 'DELAYED' },
          { key: 'RUNNING', label: 'RUNNING' },
          { key: 'COMPLETED', label: 'COMPLETED' },
          { key: 'CANCELLED', label: 'CANCELLED' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                backgroundColor: isActive ? '#4f46e5' : '#ffffff',
                color: isActive ? '#ffffff' : '#64748b',
                border: isActive ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
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
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>MA CHUYEN</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TUYEN</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>XE</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>KHOI HANH</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRE</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRANG THAI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>HANH DONG</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const statusStyles = {
                SCHEDULED: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
                DELAYED: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
                RUNNING: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
                COMPLETED: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
                CANCELLED: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
              }[item.status];

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
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#3b82f6' }}>{item.code}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 500, color: '#0f172a' }}>{item.routeName}</td>
                  <td style={{ padding: '14px 18px', color: '#334155' }}>{item.vehiclePlate}</td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>{item.departureTime}</td>
                  <td style={{ padding: '14px 18px', color: item.delayText !== '—' ? '#d97706' : '#94a3b8', fontWeight: item.delayText !== '—' ? 700 : 400 }}>
                    {item.delayText}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: statusStyles?.bg,
                        color: statusStyles?.text,
                        border: `1px solid ${statusStyles?.border}`,
                      }}
                    >
                      {item.statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      title="Xem chi tiet"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#64748b',
                        display: 'inline-flex',
                        borderRadius: '4px'
                      }}
                    >
                      <Eye size={15} />
                    </button>
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

export default CompanyTripsPage;

