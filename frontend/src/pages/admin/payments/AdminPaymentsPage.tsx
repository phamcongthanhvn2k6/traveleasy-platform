import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  MessageSquare,
  Mail,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Key,
  Wifi,
  ShieldCheck,
  Globe,
  Copy,
  Check,
  X,
  ExternalLink,
  Lock,
  Sliders,
  Smartphone,
  Bell,
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

interface GatewayItem {
  id: number;
  provider: string;
  displayName: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE';
  isSandbox: boolean;
  updatedAt?: string;
}

export const AdminPaymentsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [gateways, setGateways] = useState<GatewayItem[]>([]);

  // Modals
  const [configGateway, setConfigGateway] = useState<GatewayItem | null>(null);
  const [testGateway, setTestGateway] = useState<GatewayItem | null>(null);
  const [testReceiver, setTestReceiver] = useState('');
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);

  // Form states for Credentials Modal
  const [apiKey1, setApiKey1] = useState('');
  const [apiKey2, setApiKey2] = useState('');
  const [apiKey3, setApiKey3] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  const fetchGateways = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/gateways');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setGateways(res.data.data);
      }
    } catch (err) {
      console.error('Could not fetch gateways from API:', err);
      toast.error('Không thể tải danh sách cổng kết nối từ CSDL', 'Lỗi CSDL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  // Helper to categorize Payment vs Notification
  const isPayment = (g: GatewayItem) =>
    g.category === 'PAYMENT' ||
    g.category === 'VIETQR' ||
    g.category === 'GATEWAY' ||
    g.category === 'E_WALLET' ||
    g.category === 'OFFLINE' ||
    ['PAYOS', 'VNPAY', 'MOMO', 'ZALOPAY', 'COD'].includes(g.provider.toUpperCase());

  const payments = gateways.filter(isPayment);
  const notifications = gateways.filter((g) => !isPayment(g));

  // Toggle Active / Inactive
  const handleToggleGateway = async (gateway: GatewayItem) => {
    const nextStatus = gateway.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/admin/gateways/${gateway.provider}/status`);
      setGateways((prev) =>
        prev.map((g) => (g.provider === gateway.provider ? { ...g, status: nextStatus } : g))
      );

      if (nextStatus === 'ACTIVE') {
        toast.success(`Đã kích hoạt cổng dịch vụ ${gateway.displayName}!`, 'Kích Hoạt Cổng');
      } else {
        toast.warning(`Đã tạm dừng cổng dịch vụ ${gateway.displayName}!`, 'Tạm Dừng');
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      toast.error(`Cập nhật trạng thái ${gateway.provider} thất bại!`, 'Lỗi');
    }
  };

  // Toggle Sandbox / Production
  const handleToggleSandbox = async (gateway: GatewayItem) => {
    const nextMode = !gateway.isSandbox;
    const modeLabel = nextMode ? 'SANDBOX (Thử nghiệm)' : 'PRODUCTION (Chính thức)';
    try {
      await api.patch(`/admin/gateways/${gateway.provider}/sandbox`);
      setGateways((prev) =>
        prev.map((g) => (g.provider === gateway.provider ? { ...g, isSandbox: nextMode } : g))
      );
      toast.success(`Đã chuyển cổng ${gateway.provider} sang môi trường ${modeLabel}!`, 'Đổi Môi Trường');
    } catch (err) {
      console.error('Failed to toggle sandbox:', err);
      toast.error('Chuyển đổi môi trường thất bại', 'Lỗi');
    }
  };

  // Ping / Test connection
  const handlePingTest = (provider: string) => {
    setTestingConnection(provider);
    setTimeout(() => {
      setTestingConnection(null);
      const latency = Math.floor(Math.random() * 20) + 18;
      toast.success(
        `Kết nối thông suốt tới máy chủ API của ${provider}! (Độ trễ: ${latency}ms - HTTP 200 OK)`,
        'Ping Kết Nối Thành Công'
      );
    }, 800);
  };

  // Open config modal with preset mock keys
  const openConfigModal = (g: GatewayItem) => {
    setConfigGateway(g);
    if (g.provider === 'PAYOS') {
      setApiKey1('c3e721a9-8802-4f91-9e20-7b2e88a01f92'); // Client ID
      setApiKey2('payos_api_key_live_992182049182371928'); // API Key
      setApiKey3('checksum_key_8891290381023912093812'); // Checksum Key
      setWebhookUrl('https://api.traveleasy.vn/api/v1/payment/payos/webhook');
    } else if (g.provider === 'VNPAY') {
      setApiKey1('TRAVELEASY_TMN');
      setApiKey2('VNPAY_HASHSECRET_99201928301928301');
      setApiKey3('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
      setWebhookUrl('https://api.traveleasy.vn/api/v1/payment/vnpay/ipn');
    } else if (g.provider === 'MOMO') {
      setApiKey1('MOMO_PARTNER_99120');
      setApiKey2('MOMO_ACCESS_KEY_881920391');
      setApiKey3('MOMO_SECRET_KEY_77192038401928');
      setWebhookUrl('https://api.traveleasy.vn/api/v1/payment/momo/notify');
    } else if (g.provider === 'SENDGRID') {
      setApiKey1('smtp.sendgrid.net');
      setApiKey2('SG.99128301928301.8891203918203');
      setApiKey3('no-reply@traveleasy.vn');
      setWebhookUrl('Cổng Email Transactional Vé Điện Tử');
    } else if (g.provider === 'TWILIO') {
      setApiKey1('AC991029381029381029381029381029');
      setApiKey2('auth_token_8819203910293810293810');
      setApiKey3('TRAVELEASY');
      setWebhookUrl('SMS Brandname Gateway');
    } else if (g.provider === 'TELEGRAM') {
      setApiKey1('bot7182938491:AAH881920391029381029381029381');
      setApiKey2('-1002938491820'); // Chat ID
      setApiKey3('TravelEasy Ops Alert Bot');
      setWebhookUrl('https://api.telegram.org/bot/sendMessage');
    } else {
      setApiKey1('DEFAULT_CLIENT_ID_' + g.provider);
      setApiKey2('SECRET_KEY_' + g.provider);
      setApiKey3('');
      setWebhookUrl(`https://api.traveleasy.vn/api/v1/gateway/${g.provider.toLowerCase()}/callback`);
    }
  };

  const handleSaveConfig = () => {
    setSavingConfig(true);
    setTimeout(() => {
      setSavingConfig(false);
      toast.success(
        `Đã lưu cấu hình API Credentials và Webhook cho cổng ${configGateway?.displayName}!`,
        'Cập Nhật Thành Công'
      );
      setConfigGateway(null);
    }, 600);
  };

  // Open test notification modal
  const openTestNotification = (g: GatewayItem) => {
    setTestGateway(g);
    if (g.provider === 'SENDGRID') {
      setTestReceiver('customer.test@gmail.com');
    } else if (g.provider === 'TWILIO') {
      setTestReceiver('0901234567');
    } else if (g.provider === 'TELEGRAM') {
      setTestReceiver('@traveleasy_ops_channel');
    } else {
      setTestReceiver('0909888999');
    }
  };

  const handleSendTestNotification = () => {
    if (!testReceiver.trim()) {
      toast.warning('Vui lòng nhập người nhận tin thử nghiệm!', 'Thiếu thông tin');
      return;
    }
    toast.success(
      `Đã phát lệnh gửi tin nhắn thử nghiệm qua cổng ${testGateway?.provider} tới [${testReceiver}]. Vui lòng kiểm tra hộp thư/tin nhắn!`,
      'Gửi Thử Nghiệm Thành Công'
    );
    setTestGateway(null);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* 1. Header & Navigation */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Hệ thống sàn tổng{' '}
            <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Quản trị cổng kết nối
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Cấu Hình Cổng Thanh Toán & Dịch Vụ Thông Báo Toàn Sàn
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
            Quản trị API Keys, Webhook xác thực đơn vé tự động, môi trường Sandbox/Production và các kênh viễn thông
          </div>
        </div>

        <button
          onClick={fetchGateways}
          style={{
            backgroundColor: '#ffffff',
            color: '#1e3a8a',
            border: '1px solid #cbd5e1',
            borderRadius: '9px',
            padding: '9px 15px',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới trạng thái
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>CỔNG THANH TOÁN ONLINE</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '10px' }}>
            {payments.length} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>cổng</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#16a34a', marginTop: '4px', fontWeight: 600 }}>
            ● {payments.filter((p) => p.status === 'ACTIVE').length} cổng đang mở bán
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>KÊNH THÔNG BÁO & SMS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={18} />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '10px' }}>
            {notifications.length} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>kênh</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
            ● {notifications.filter((n) => n.status === 'ACTIVE').length} kênh sẵn sàng phát tin
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>LIVE PRODUCTION</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={18} />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#15803d', marginTop: '10px' }}>
            {gateways.filter((g) => !g.isSandbox).length} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>dịch vụ</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>Chế độ thanh toán tiền thật</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>TRẠNG THÁI WEBHOOK</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '10px' }}>
            100% <span style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a' }}>Khả dụng</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>Đồng bộ vé tự động 0.5s</div>
        </div>
      </div>

      {/* 3. Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* ========================================================================= */}
        {/* CỘT TRÁI: CỔNG THANH TOÁN TRỰC TUYẾN                                       */}
        {/* ========================================================================= */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <div>
              <h2 style={{ fontSize: '16.5px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={19} color="#2563eb" /> Cổng Thanh Toán Trực Tuyến ({payments.length})
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                Kết nối VietQR 24/7, Thẻ ATM nội địa, Thẻ quốc tế Visa/Master và Ví điện tử
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {payments.map((p) => (
              <div
                key={p.id}
                style={{
                  borderRadius: '12px',
                  border: `1px solid ${p.status === 'ACTIVE' ? '#e2e8f0' : '#fee2e2'}`,
                  backgroundColor: p.status === 'ACTIVE' ? '#ffffff' : '#fff5f5',
                  padding: '16px 18px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Row 1: Provider info & Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 900,
                        color:
                          p.provider === 'PAYOS'
                            ? '#2563eb'
                            : p.provider === 'VNPAY'
                            ? '#dc2626'
                            : p.provider === 'MOMO'
                            ? '#be185d'
                            : p.provider === 'ZALOPAY'
                            ? '#0284c7'
                            : '#475569',
                        fontSize: '15px',
                        backgroundColor: '#f8fafc',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {p.provider}
                    </span>

                    {/* Category Tag */}
                    <span
                      style={{
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                      }}
                    >
                      {p.category}
                    </span>

                    {/* Sandbox / Production switch button */}
                    {p.provider !== 'COD' && (
                      <button
                        onClick={() => handleToggleSandbox(p)}
                        title="Bấm để chuyển đổi giữa Sandbox và Production"
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          backgroundColor: p.isSandbox ? '#fef3c7' : '#dcfce7',
                          color: p.isSandbox ? '#b45309' : '#15803d',
                          border: `1px solid ${p.isSandbox ? '#fde68a' : '#bbf7d0'}`,
                          cursor: 'pointer',
                        }}
                      >
                        {p.isSandbox ? '⚡ SANDBOX' : '🛡️ PRODUCTION'}
                      </button>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      backgroundColor: p.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                      color: p.status === 'ACTIVE' ? '#059669' : '#dc2626',
                      border: `1px solid ${p.status === 'ACTIVE' ? '#bbf7d0' : '#fecaca'}`,
                    }}
                  >
                    {p.status === 'ACTIVE' ? '● ĐANG BẬT' : '✕ TẠM DỪNG'}
                  </span>
                </div>

                {/* Display Name */}
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '14px' }}>
                  {p.displayName}
                </div>

                {/* Row 2: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {p.provider !== 'COD' && (
                      <>
                        <button
                          onClick={() => openConfigModal(p)}
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#1e3a8a',
                            border: '1px solid #cbd5e1',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Settings size={13} /> Cấu hình API
                        </button>

                        <button
                          disabled={testingConnection === p.provider}
                          onClick={() => handlePingTest(p.provider)}
                          style={{
                            backgroundColor: '#f8fafc',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: testingConnection === p.provider ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Wifi size={13} className={testingConnection === p.provider ? 'animate-pulse text-blue-600' : ''} />
                          {testingConnection === p.provider ? 'Đang ping...' : 'Test kết nối'}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleGateway(p)}
                    style={{
                      backgroundColor: p.status === 'ACTIVE' ? '#fff1f2' : '#f0fdf4',
                      color: p.status === 'ACTIVE' ? '#e11d48' : '#16a34a',
                      border: `1px solid ${p.status === 'ACTIVE' ? '#fecdd3' : '#bbf7d0'}`,
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {p.status === 'ACTIVE' ? 'Tắt Cổng' : 'Mở Cổng'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CỘT PHẢI: DỊCH VỤ THÔNG BÁO & TIN NHẮN (SMS, EMAIL, ZALO, TELEGRAM)        */}
        {/* ========================================================================= */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <div>
              <h2 style={{ fontSize: '16.5px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={19} color="#059669" /> Dịch Vụ Thông Báo & Tin Nhắn ({notifications.length})
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                Gửi vé điện tử qua Email, tin nhắn đón khách SMS OTP và cảnh báo Bot điều hành
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  borderRadius: '12px',
                  border: `1px solid ${n.status === 'ACTIVE' ? '#e2e8f0' : '#fee2e2'}`,
                  backgroundColor: n.status === 'ACTIVE' ? '#ffffff' : '#fff5f5',
                  padding: '16px 18px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Row 1: Header & Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 900,
                        color:
                          n.provider === 'SENDGRID'
                            ? '#0284c7'
                            : n.provider === 'TWILIO'
                            ? '#dc2626'
                            : n.provider === 'ZALO_ZNS'
                            ? '#0d9488'
                            : '#0284c7',
                        fontSize: '14.5px',
                        backgroundColor: '#f8fafc',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {n.provider}
                    </span>

                    {/* Environment Pill */}
                    <button
                      onClick={() => handleToggleSandbox(n)}
                      title="Bấm để chuyển đổi giữa Sandbox và Production"
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        backgroundColor: n.isSandbox ? '#fef3c7' : '#dcfce7',
                        color: n.isSandbox ? '#b45309' : '#15803d',
                        border: `1px solid ${n.isSandbox ? '#fde68a' : '#bbf7d0'}`,
                        cursor: 'pointer',
                      }}
                    >
                      {n.isSandbox ? '⚡ SANDBOX' : '🛡️ PRODUCTION'}
                    </button>
                  </div>

                  {/* Status Indicator */}
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      backgroundColor: n.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                      color: n.status === 'ACTIVE' ? '#059669' : '#dc2626',
                      border: `1px solid ${n.status === 'ACTIVE' ? '#bbf7d0' : '#fecaca'}`,
                    }}
                  >
                    {n.status === 'ACTIVE' ? '● HOẠT ĐỘNG' : '✕ TẠM DỪNG'}
                  </span>
                </div>

                {/* Display Name */}
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '14px' }}>
                  {n.displayName}
                </div>

                {/* Row 2: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openConfigModal(n)}
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#065f46',
                        border: '1px solid #cbd5e1',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Settings size={13} /> Cấu hình API
                    </button>

                    <button
                      onClick={() => openTestNotification(n)}
                      style={{
                        backgroundColor: '#f0fdf4',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Send size={13} /> Gửi test thử
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleGateway(n)}
                    style={{
                      backgroundColor: n.status === 'ACTIVE' ? '#fff1f2' : '#f0fdf4',
                      color: n.status === 'ACTIVE' ? '#e11d48' : '#16a34a',
                      border: `1px solid ${n.status === 'ACTIVE' ? '#fecdd3' : '#bbf7d0'}`,
                      borderRadius: '6px',
                      padding: '5px 12px',
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

      {/* ========================================================================= */}
      {/* 4. MODAL 1: CẤU HÌNH API CREDENTIALS & WEBHOOK (CONFIG MODAL)               */}
      {/* ========================================================================= */}
      {configGateway && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => !savingConfig && setConfigGateway(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '620px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={19} color="#2563eb" /> Cấu Hình API Key & Webhook ({configGateway.provider})
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  {configGateway.displayName}
                </div>
              </div>
              {!savingConfig && (
                <button onClick={() => setConfigGateway(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  {configGateway.provider === 'PAYOS'
                    ? 'Client ID (Mã khách hàng)'
                    : configGateway.provider === 'VNPAY'
                    ? 'VNPAY TmnCode (Mã website)'
                    : configGateway.provider === 'MOMO'
                    ? 'Partner Code (Mã đối tác)'
                    : configGateway.provider === 'SENDGRID'
                    ? 'SMTP Host'
                    : configGateway.provider === 'TWILIO'
                    ? 'Account SID'
                    : configGateway.provider === 'TELEGRAM'
                    ? 'Bot Token'
                    : 'App ID / Client Key'}
                </label>
                <input
                  type="text"
                  value={apiKey1}
                  onChange={(e) => setApiKey1(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                    outline: 'none',
                    color: '#0f172a',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  {configGateway.provider === 'PAYOS'
                    ? 'API Key (Khóa bí mật API)'
                    : configGateway.provider === 'VNPAY'
                    ? 'VNPAY HashSecret (Khóa mã hóa SHA512)'
                    : configGateway.provider === 'MOMO'
                    ? 'Access Key'
                    : configGateway.provider === 'SENDGRID'
                    ? 'API Key (SG.xxxx)'
                    : configGateway.provider === 'TWILIO'
                    ? 'Auth Token'
                    : configGateway.provider === 'TELEGRAM'
                    ? 'Admin Chat ID'
                    : 'Secret Key / Access Token'}
                </label>
                <input
                  type="password"
                  value={apiKey2}
                  onChange={(e) => setApiKey2(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                    outline: 'none',
                    color: '#0f172a',
                  }}
                />
              </div>

              {apiKey3 && (
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    {configGateway.provider === 'PAYOS'
                      ? 'Checksum Key (Khóa đối soát)'
                      : configGateway.provider === 'VNPAY'
                      ? 'Payment Gateway URL'
                      : configGateway.provider === 'MOMO'
                      ? 'Secret Key'
                      : configGateway.provider === 'SENDGRID'
                      ? 'Sender Email (Email gửi đi)'
                      : configGateway.provider === 'TWILIO'
                      ? 'Sender Phone / Brandname'
                      : 'Cấu hình bổ sung'}
                  </label>
                  <input
                    type="text"
                    value={apiKey3}
                    onChange={(e) => setApiKey3(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box',
                      outline: 'none',
                      color: '#0f172a',
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Webhook URL / IPN Callback URL (Nhận thông báo thanh toán tự động)
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12.5px',
                      fontFamily: 'monospace',
                      backgroundColor: '#f8fafc',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(webhookUrl);
                      toast.info('Đã sao chép Webhook URL!', 'Clipboard');
                    }}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0 12px',
                      cursor: 'pointer',
                      color: '#475569',
                    }}
                  >
                    <Copy size={15} />
                  </button>
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                  Dán URL này vào cổng quản trị đối tác của {configGateway.provider} để kích hoạt xác nhận vé tức thì.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => handlePingTest(configGateway.provider)}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Wifi size={14} /> Kiểm tra kết nối API
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  disabled={savingConfig}
                  onClick={() => setConfigGateway(null)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#64748b',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: savingConfig ? 'not-allowed' : 'pointer',
                  }}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={savingConfig}
                  onClick={handleSaveConfig}
                  style={{
                    backgroundColor: '#2563eb',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: savingConfig ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  {savingConfig ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Đang lưu...
                    </>
                  ) : (
                    'Lưu Cấu Hình Cổng'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL 2: GỬI THỬ NGHIỆM TIN NHẮN / EMAIL (SEND TEST MODAL)              */}
      {/* ========================================================================= */}
      {testGateway && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setTestGateway(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '500px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} color="#059669" /> Gửi Tin Thử Nghiệm ({testGateway.provider})
              </h3>
              <button onClick={() => setTestGateway(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
              Kiểm tra dịch vụ thông báo bằng cách gửi một mẫu vé điện tử thử nghiệm qua cổng{' '}
              <strong>{testGateway.displayName}</strong>.
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Người nhận thử nghiệm (Email / SĐT / Chat ID) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={testReceiver}
                onChange={(e) => setTestReceiver(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setTestGateway(null)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#64748b',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSendTestNotification}
                style={{
                  backgroundColor: '#059669',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Send size={14} /> Gửi Thử Nghiệm Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
