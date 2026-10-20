import React from 'react';
import { Plus, Shield } from 'lucide-react';

export const CompanyCancellationPoliciesPage: React.FC = () => {
  const rules = [
    {
      condition: 'Truoc khoi hanh 1 ngay — Den khong gioi han',
      refundRate: '100% hoan tien',
      type: 'FULL',
    },
    {
      condition: 'Truoc khoi hanh 12 gio — Den 1 ngay',
      refundRate: '50% hoan tien',
      type: 'PARTIAL',
    },
    {
      condition: 'Truoc khoi hanh 0 gio — Den 12 gio',
      refundRate: '0% hoan tien',
      type: 'NONE',
    },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            Nha xe <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Chinh sach huy
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Chinh sach huy ve
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            0 chinh sach cua nha xe + 1 mac dinh he thong
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
          <span>Tao chinh sach</span>
        </button>
      </div>

      {/* Policy Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px 24px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          maxWidth: '750px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Mac dinh
            </h2>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Mac dinh he thong
            </div>
          </div>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Shield size={12} />
            <span>He thong</span>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rules.map((rule, idx) => {
            const isZero = rule.type === 'NONE';
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9'
                }}
              >
                <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                  {rule.condition}
                </span>
                <span
                  style={{
                    padding: '3px 9px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: isZero ? '#fef2f2' : '#ecfdf5',
                    color: isZero ? '#dc2626' : '#059669',
                    border: isZero ? '1px solid #fecaca' : '1px solid #a7f3d0'
                  }}
                >
                  {rule.refundRate}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CompanyCancellationPoliciesPage;
