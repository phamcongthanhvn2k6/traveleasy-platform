import React, { useState } from 'react';
import { Search, Eye } from 'lucide-react';

interface BookingItem {
  id: string;
  code: string;
  customerEmail: string;
  tripCode: string;
  totalAmount: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  statusLabel: string;
  bookingTime: string;
}

export const CompanyBookingsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const bookings: BookingItem[] = [
    {
      id: 'b1',
      code: 'b1',
      customerEmail: 'nguyen.a@example.com',
      tripCode: 't1',
      totalAmount: '350.000 đ',
      status: 'CONFIRMED',
      statusLabel: 'Da xac nhan',
      bookingTime: '17:00 18/09/2026',
    },
    {
      id: 'b2',
      code: 'b2',
      customerEmail: 'tran.b@example.com',
      tripCode: 't1',
      totalAmount: '280.000 đ',
      status: 'CONFIRMED',
      statusLabel: 'Da xac nhan',
      bookingTime: '18:00 19/09/2026',
    },
    {
      id: 'b3',
      code: 'b3',
      customerEmail: 'nguyen.a@example.com',
      tripCode: 't3',
      totalAmount: '390.000 đ',
      status: 'CONFIRMED',
      statusLabel: 'Da xac nhan',
      bookingTime: '21:00 18/09/2026',
    },
    {
      id: 'b4',
      code: 'b4',
      customerEmail: 'tran.b@example.com',
      tripCode: 't4',
      totalAmount: '630.000 đ',
      status: 'CONFIRMED',
      statusLabel: 'Da xac nhan',
      bookingTime: '16:00 17/09/2026',
    },
    {
      id: 'b5',
      code: 'b5',
      customerEmail: 'locked@example.com',
      tripCode: 't5',
      totalAmount: '300.000 đ',
      status: 'CANCELLED',
      statusLabel: 'Da huy',
      bookingTime: '17:00 17/09/2026',
    },
    {
      id: 'b6',
      code: 'b6',
      customerEmail: 'nguyen.a@example.com',
      tripCode: 't4',
      totalAmount: '600.000 đ',
      status: 'CONFIRMED',
      statusLabel: 'Da xac nhan',
      bookingTime: '15:00 18/09/2026',
    },
    {
      id: 'b7',
      code: 'b7',
      customerEmail: 'locked@example.com',
      tripCode: 't7',
      totalAmount: '280.000 đ',
      status: 'CONFIRMED',
      statusLabel: 'Da xac nhan',
      bookingTime: '03:00 21/09/2026',
    },
    {
      id: 'b8',
      code: 'b8',
      customerEmail: 'locked@example.com',
      tripCode: 't6',
      totalAmount: '300.000 đ',
      status: 'CONFIRMED',
      statusLabel: 'Da xac nhan',
      bookingTime: '16:00 21/09/2026',
    },
  ];

  const filtered = bookings.filter((b) => {
    if (search && !b.code.toLowerCase().includes(search.toLowerCase()) && !b.customerEmail.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (activeTab !== 'ALL' && b.status !== activeTab) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
          Nha xe <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Dat ve
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
          Dat ve
        </h1>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
          {bookings.length} don hang
        </div>
      </div>

      {/* Filter Row & Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
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
            placeholder="Tim ma dat ve hoac email..."
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

        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'ALL', label: 'Tat ca' },
            { key: 'CONFIRMED', label: 'CONFIRMED' },
            { key: 'CANCELLED', label: 'CANCELLED' },
            { key: 'PENDING', label: 'PENDING' },
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
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>MA DAT</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>KHACH HANG</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>CHUYEN</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TONG TIEN</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRANG THAI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NGAY DAT</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>HANH DONG</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isConfirmed = item.status === 'CONFIRMED';
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
                  <td style={{ padding: '14px 18px', color: '#0f172a' }}>{item.customerEmail}</td>
                  <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 600 }}>{item.tripCode}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0f172a' }}>{item.totalAmount}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: isConfirmed ? '#ecfdf5' : '#fef2f2',
                        color: isConfirmed ? '#059669' : '#dc2626',
                        border: isConfirmed ? '1px solid #a7f3d0' : '1px solid #fecaca',
                      }}
                    >
                      {item.statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>{item.bookingTime}</td>
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

export default CompanyBookingsPage;
