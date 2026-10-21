import React from 'react';
import { QrCode, CreditCard, Wallet, Banknote, ShieldCheck } from 'lucide-react';

export type PaymentMethodType = 'VIETQR' | 'VNPAY' | 'MOMO' | 'ZALOPAY' | 'COD';

interface Props {
  selectedMethod: PaymentMethodType;
  onChange: (method: PaymentMethodType) => void;
}

export const PaymentMethodSelector: React.FC<Props> = ({ selectedMethod, onChange }) => {
  const methods = [
    {
      id: 'VIETQR' as PaymentMethodType,
      name: 'Chuyển khoản VietQR QuickPay (Khuyên dùng)',
      desc: 'Quét mã QR Napas 24/7 tức thì từ 40+ App Ngân hàng (Vietcombank, MB, Techcombank, BIDV...). Hệ thống tự động xác nhận trong 3 giây.',
      badge: 'Khuyên dùng - Nhanh nhất',
      icon: QrCode,
      iconColor: '#2563eb',
      iconBg: '#eff6ff',
    },
    {
      id: 'VNPAY' as PaymentMethodType,
      name: 'Cổng VNPAY (Thẻ ATM nội địa, Thẻ quốc tế Visa/Master, VNPAY-QR)',
      desc: 'Cổng thanh toán điện tử chuẩn Ngân hàng Nhà nước. Hỗ trợ thẻ ATM nội địa 36 ngân hàng và thẻ Visa/MasterCard bảo mật 3D-Secure OTP.',
      badge: 'Cổng Quốc Gia',
      icon: CreditCard,
      iconColor: '#dc2626',
      iconBg: '#fef2f2',
    },
    {
      id: 'MOMO' as PaymentMethodType,
      name: 'Ví Điện Tử MoMo',
      desc: 'Thanh toán bảo mật một chạm qua ứng dụng Ví MoMo tiện lợi và nhận điểm tích lũy.',
      badge: 'Tích điểm',
      icon: Wallet,
      iconColor: '#d946ef',
      iconBg: '#fdf4ff',
    },
    {
      id: 'ZALOPAY' as PaymentMethodType,
      name: 'Ví Điện Tử ZaloPay',
      desc: 'Thanh toán tức thì ngay trong ứng dụng Zalo hoặc ZaloPay không cần liên kết phức tạp.',
      badge: null,
      icon: Wallet,
      iconColor: '#0284c7',
      iconBg: '#f0f9ff',
    },
    {
      id: 'COD' as PaymentMethodType,
      name: 'Thanh toán tiền mặt khi lên xe',
      desc: 'Nhận mã đặt vé trước, xuất trình mã vé và thanh toán trực tiếp cho tài xế hoặc phụ xe khi có mặt tại điểm đón.',
      badge: null,
      icon: Banknote,
      iconColor: '#d97706',
      iconBg: '#fffbeb',
    },
  ];

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 800,
            color: '#0f172a',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CreditCard size={18} color="#2563eb" />
          Phương Thức Thanh Toán
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
          <ShieldCheck size={14} /> Bảo mật PCI-DSS 256-bit
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {methods.map((m) => {
          const isSelected = selectedMethod === m.id;
          const Icon = m.icon;
          return (
            <label
              key={m.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '16px',
                borderRadius: '10px',
                border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={isSelected}
                onChange={() => onChange(m.id)}
                style={{ marginTop: '4px', accentColor: '#2563eb', width: '16px', height: '16px' }}
              />

              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: m.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={20} color={m.iconColor} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{m.name}</span>
                  {m.badge && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {m.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                  {m.desc}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
