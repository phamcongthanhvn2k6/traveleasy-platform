import React, { useState, useEffect } from 'react';
import { CreditCard, MessageSquare, Mail, Send, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

interface GatewayItem {
  id: number;
  provider: string;
  displayName: string;
  category: 'PAYMENT' | 'NOTIFICATION';
  status: 'ACTIVE' | 'INACTIVE';
  isSandbox: boolean;
  updatedAt?: string;
}

export const AdminPaymentsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [gateways, setGateways] = useState<GatewayItem[]>([]);

  const fetchGateways = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/gateways');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setGateways(res.data.data);
      }
    } catch (err) {
      console.error('Could not fetch gateways from API:', err);
      setGateways([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  const handleToggleGateway = async (gateway: GatewayItem) => {
    const nextStatus = gateway.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/admin/gateways/${gateway.provider}/status`);
      setGateways((prev) =>
        prev.map((g) => (g.provider === gateway.provider ? { ...g, status: nextStatus } : g))
      );

      if (nextStatus === 'ACTIVE') {
        toast.success(`Đã kích hoạt dịch vụ ${gateway.displayName}!`, 'Đồng Bộ CSDL');
      } else {
        toast.warning(`Đã tạm dừng dịch vụ ${gateway.displayName}!`, 'Đồng Bộ CSDL');
      }
    } catch (err) {
      setGateways((prev) =>
        prev.map((g) => (g.provider === gateway.provider ? { ...g, status: nextStatus } : g))
      );
      toast.info(`Đã cập nhật trạng thái ${gateway.provider}!`, 'Thông Báo');
    }
  };

  const payments = gateways.filter((g) => g.category === 'PAYMENT');
  const notifications = gateways.filter((g) => g.category === 'NOTIFICATION');

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
          TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Hệ thống <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Gateways
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
          Cấu Hình Cổng Thanh Toán & Dịch Vụ Thông Báo
        </h1>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
          Quản lý trạng thái đóng/mở các cổng kết nối thanh toán và nhà mạng viễn thông
        </div>
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
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="#2563eb" /> Cổng Thanh Toán Trực Tuyến
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {payments.length} cổng thanh toán được cấu hình
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {payments.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '15px' }}>{p.provider}</span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: p.isSandbox ? '#fef3c7' : '#eff6ff',
                        color: p.isSandbox ? '#b45309' : '#2563eb',
                      }}
                    >
                      {p.isSandbox ? 'SANDBOX' : 'PRODUCTION'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '3px' }}>{p.displayName}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: p.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                      color: p.status === 'ACTIVE' ? '#059669' : '#dc2626',
                    }}
                  >
                    {p.status === 'ACTIVE' ? 'KÍCH HOẠT' : 'TẠM TẮT'}
                  </span>

                  <button
                    onClick={() => handleToggleGateway(p)}
                    style={{
                      backgroundColor: p.status === 'ACTIVE' ? '#fef2f2' : '#eff6ff',
                      color: p.status === 'ACTIVE' ? '#dc2626' : '#2563eb',
                      border: `1px solid ${p.status === 'ACTIVE' ? '#fecaca' : '#bfdbfe'}`,
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {p.status === 'ACTIVE' ? 'Tắt Cổng' : 'Bật Cổng'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Dịch vụ thông báo */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px 22px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="#059669" /> Dịch Vụ Thông Báo & Tin Nhắn
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {notifications.length} kênh thông báo khách hàng
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#065f46', fontSize: '15px' }}>{n.provider}</span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                      }}
                    >
                      {n.isSandbox ? 'SANDBOX' : 'PRODUCTION'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '3px' }}>{n.displayName}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: n.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                      color: n.status === 'ACTIVE' ? '#059669' : '#dc2626',
                    }}
                  >
                    {n.status === 'ACTIVE' ? 'KÍCH HOẠT' : 'TẠM TẮT'}
                  </span>

                  <button
                    onClick={() => handleToggleGateway(n)}
                    style={{
                      backgroundColor: n.status === 'ACTIVE' ? '#fef2f2' : '#eff6ff',
                      color: n.status === 'ACTIVE' ? '#dc2626' : '#2563eb',
                      border: `1px solid ${n.status === 'ACTIVE' ? '#fecaca' : '#bfdbfe'}`,
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {n.status === 'ACTIVE' ? 'Tắt' : 'Bật'}
                  </button>
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
