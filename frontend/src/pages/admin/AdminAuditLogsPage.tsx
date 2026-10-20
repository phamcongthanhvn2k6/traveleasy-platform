import React, { useState } from 'react';
import { Filter } from 'lucide-react';

interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  before: string;
  after: string;
}

export const AdminAuditLogsPage: React.FC = () => {
  const [actionFilter, setActionFilter] = useState('ALL');

  const logs: AuditLogItem[] = [
    {
      id: 'log1',
      timestamp: '17:00 10/02/2025',
      user: 'admin@vexere.vn',
      action: 'APPROVE_COMPANY',
      target: 'bus_companies #bc1',
      before: '{"status": "PENDING_APPROVAL"}',
      after: '{"status": "ACTIVE"}',
    },
    {
      id: 'log2',
      timestamp: '17:00 01/03/2025',
      user: 'admin@vexere.vn',
      action: 'APPROVE_COMPANY',
      target: 'bus_companies #bc2',
      before: '{"status": "PENDING_APPROVAL"}',
      after: '{"status": "ACTIVE"}',
    },
    {
      id: 'log3',
      timestamp: '16:00 15/07/2026',
      user: 'admin@vexere.vn',
      action: 'SUSPEND_COMPANY',
      target: 'bus_companies #bc4',
      before: '{"status": "ACTIVE"}',
      after: '{"status": "SUSPENDED"}',
    },
    {
      id: 'log4',
      timestamp: '16:00 15/02/2025',
      user: 'boss@futabus.vn',
      action: 'CREATE_VEHICLE',
      target: 'vehicles #v1',
      before: '—',
      after: '{"license_plate": "51B-123.45", "vehicle_type": "SLEEPER"}',
    },
    {
      id: 'log5',
      timestamp: '17:00 20/09/2026',
      user: 'admin@vexere.vn',
      action: 'APPROVE_REVIEW_REPORT',
      target: 'review_reports #rp1',
      before: '{"status": "PENDING"}',
      after: '{"status": "APPROVED"}',
    },
    {
      id: 'log6',
      timestamp: '18:00 15/02/2025',
      user: 'boss@futabus.vn',
      action: 'CREATE_ROUTE',
      target: 'route_templates #rt1',
      before: '—',
      after: '{"name": "Sai Gon - Da Lat"}',
    },
    {
      id: 'log7',
      timestamp: '16:00 01/09/2026',
      user: 'admin@vexere.vn',
      action: 'UPDATE_BANNER',
      target: 'banners #bn1',
      before: '{"is_active": false}',
      after: '{"is_active": true}',
    },
    {
      id: 'log8',
      timestamp: '01:00 20/09/2026',
      user: 'boss@futabus.vn',
      action: 'CANCEL_TRIP',
      target: 'trips #t5',
      before: '{"status": "SCHEDULED"}',
      after: '{"status": "CANCELLED"}',
    },
  ];

  const filtered = logs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
          VeXeRe Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Nhat ky
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
          Nhat ky he thong
        </h1>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
          {logs.length} ban ghi
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '7px 12px',
            width: '100%',
            maxWidth: '100%'
          }}
        >
          <Filter size={15} color="#94a3b8" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '13px',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <option value="ALL">Tat ca hanh dong</option>
            <option value="APPROVE_COMPANY">APPROVE_COMPANY</option>
            <option value="SUSPEND_COMPANY">SUSPEND_COMPANY</option>
            <option value="CREATE_VEHICLE">CREATE_VEHICLE</option>
            <option value="APPROVE_REVIEW_REPORT">APPROVE_REVIEW_REPORT</option>
            <option value="CREATE_ROUTE">CREATE_ROUTE</option>
            <option value="UPDATE_BANNER">UPDATE_BANNER</option>
            <option value="CANCEL_TRIP">CANCEL_TRIP</option>
          </select>
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
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
              <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>THOI GIAN</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NGUOI THUC HIEN</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>HANH DONG</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>DOI TUONG</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRUOC</th>
              <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>SAU</th>
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
                <td style={{ padding: '14px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>{item.timestamp}</td>
                <td style={{ padding: '14px 16px', fontWeight: 500, color: '#0f172a' }}>{item.user}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.3px',
                      backgroundColor: '#eef2ff',
                      color: '#4f46e5',
                      border: '1px solid #c7d2fe',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.action}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 600, whiteSpace: 'nowrap' }}>{item.target}</td>
                <td style={{ padding: '14px 16px', color: '#64748b', fontFamily: 'monospace', fontSize: '11px' }}>
                  {item.before}
                </td>
                <td style={{ padding: '14px 16px', color: '#0f172a', fontFamily: 'monospace', fontSize: '11px' }}>
                  {item.after}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAuditLogsPage;

