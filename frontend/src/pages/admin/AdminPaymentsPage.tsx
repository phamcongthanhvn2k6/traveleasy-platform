import React, { useState } from 'react';
import { CreditCard, MessageSquare, Mail, Send } from 'lucide-react';

interface GatewayItem {
  id: string;
  name: string;
  env: 'PRODUCTION' | 'SANDBOX';
  active: boolean;
}

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<GatewayItem[]>([
    { id: 'p1', name: 'VNPAY', env: 'PRODUCTION', active: true },
    { id: 'p2', name: 'VNPAY', env: 'SANDBOX', active: true },
    { id: 'p3', name: 'MOMO', env: 'PRODUCTION', active: true },
    { id: 'p4', name: 'ZALOPAY', env: 'SANDBOX', active: false },
  ]);

  const [notifications, setNotifications] = useState<GatewayItem[]>([
    { id: 'n1', name: 'SPEEDSMS', env: 'PRODUCTION', active: true },
    { id: 'n2', name: 'SENDGRID', env: 'PRODUCTION', active: true },
    { id: 'n3', name: 'ESMS', env: 'SANDBOX', active: false },
  ]);

  const togglePayment = (id: string) => {
    setPayments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
          VeXeRe Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> He thong <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Gateway
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
          Cong thanh toan & Thong bao
        </h1>
      </div>

      {/* 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px' }}>
        {/* Left Column: Cổng thanh toán */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px 22px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Cong thanh toan
            </h2>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              {payments.length} cong
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {payments.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid #f1f5f9',
                  backgroundColor: '#ffffff',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.4px', marginTop: '2px' }}>
                      {p.env}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: p.active ? '#059669' : '#94a3b8'
                    }}
                  >
                    {p.active ? 'Active' : 'Inactive'}
                  </span>
                  {/* Switch Toggle */}
                  <div
                    onClick={() => togglePayment(p.id)}
                    style={{
                      width: '36px',
                      height: '20px',
                      borderRadius: '10px',
                      backgroundColor: p.active ? '#10b981' : '#cbd5e1',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        position: 'absolute',
                        top: '2px',
                        left: p.active ? '18px' : '2px',
                        transition: 'left 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Cổng thông báo */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px 22px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Cong thong bao
            </h2>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              {notifications.length} cong
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid #f1f5f9',
                  backgroundColor: '#ffffff',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#f0fdf4',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {n.name === 'SENDGRID' ? <Mail size={18} /> : <MessageSquare size={18} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{n.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.4px', marginTop: '2px' }}>
                      {n.env}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: n.active ? '#059669' : '#94a3b8'
                    }}
                  >
                    {n.active ? 'Active' : 'Inactive'}
                  </span>
                  {/* Switch Toggle */}
                  <div
                    onClick={() => toggleNotification(n.id)}
                    style={{
                      width: '36px',
                      height: '20px',
                      borderRadius: '10px',
                      backgroundColor: n.active ? '#10b981' : '#cbd5e1',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        position: 'absolute',
                        top: '2px',
                        left: n.active ? '18px' : '2px',
                        transition: 'left 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;

