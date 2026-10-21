import React from 'react';
import { User, Phone, Mail, MessageSquare, ShieldCheck } from 'lucide-react';

export interface PassengerInfo {
  fullName: string;
  phone: string;
  email: string;
  note: string;
  hasInsurance: boolean;
  termsAccepted: boolean;
}

interface Props {
  info: PassengerInfo;
  onChange: (info: PassengerInfo) => void;
  seatCount: number;
}

export const PassengerInfoForm: React.FC<Props> = ({ info, onChange, seatCount }) => {
  const updateField = (field: keyof PassengerInfo, value: any) => {
    onChange({
      ...info,
      [field]: value,
    });
  };

  const insuranceFeePerSeat = 25000;
  const totalInsurance = seatCount * insuranceFeePerSeat;

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
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 800,
          color: '#0f172a',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <User size={18} color="#2563eb" />
        Thông Tin Hành Khách Đi Xe
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Full Name */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Họ và tên hành khách <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              required
              placeholder="Ví dụ: Nguyễn Văn A"
              value={info.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px 11px 38px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                fontWeight: 600,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            <User
              size={16}
              color="#94a3b8"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Số điện thoại (Nhận SMS vé & bác tài liên hệ) <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="tel"
              required
              placeholder="Ví dụ: 0912 345 678"
              value={info.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px 11px 38px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                fontWeight: 600,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            <Phone
              size={16}
              color="#94a3b8"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
        </div>
      </div>

      {/* Email */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
          Email (Nhận vé điện tử & hóa đơn VAT) <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="email"
            required
            placeholder="Ví dụ: hotro@traveleasy.vn"
            value={info.email}
            onChange={(e) => updateField('email', e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px 11px 38px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              fontWeight: 600,
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
          <Mail
            size={16}
            color="#94a3b8"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>
      </div>

      {/* Note */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
          Ghi chú đón xe cho tài xế (Tùy chọn)
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Ví dụ: Đón tại đầu hẻm 83, có 2 vali lớn, đi cùng người lớn tuổi..."
            value={info.note}
            onChange={(e) => updateField('note', e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px 11px 38px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
          <MessageSquare
            size={16}
            color="#94a3b8"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>
      </div>

      {/* Insurance Add-on Checkbox */}
      <div
        style={{
          backgroundColor: info.hasInsurance ? '#f0fdf4' : '#f8fafc',
          border: `1px solid ${info.hasInsurance ? '#bbf7d0' : '#e2e8f0'}`,
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '16px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onClick={() => updateField('hasInsurance', !info.hasInsurance)}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <input
            type="checkbox"
            checked={info.hasInsurance}
            onChange={(e) => updateField('hasInsurance', e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: '#16a34a', marginTop: '2px' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#16a34a" /> Bảo hiểm chuyến đi an tâm
              </span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#16a34a' }}>
                +{totalInsurance.toLocaleString('vi-VN')} đ
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              Quyền lợi bồi hoàn chi phí y tế & tai nạn lên đến 100.000.000 đ/người do Bảo hiểm Quân Đội (MIC) bảo lãnh.
            </p>
          </div>
        </div>
      </div>

      {/* Terms and conditions checkbox */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#475569' }}>
        <input
          type="checkbox"
          checked={info.termsAccepted}
          onChange={(e) => updateField('termsAccepted', e.target.checked)}
          style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
        />
        <span>
          Tôi đã đọc và đồng ý với{' '}
          <strong style={{ color: '#2563eb' }}>Điều khoản sử dụng</strong> và{' '}
          <strong style={{ color: '#2563eb' }}>Chính sách hủy đổi vé</strong> của TravelEasy.
        </span>
      </label>
    </div>
  );
};
