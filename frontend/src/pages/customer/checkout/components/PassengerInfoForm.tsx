import React, { useState } from 'react';
import { User, Phone, Mail, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';

export interface PassengerInfo {
  fullName: string;
  phone: string;
  email: string;
  note: string;
  hasInsurance: boolean;
  termsAccepted: boolean;
}

// Regex chuẩn số điện thoại Việt Nam: bắt đầu bằng 03, 05, 07, 08, 09 và đủ đúng 10 chữ số
export const VN_PHONE_REGEX = /^(03|05|07|08|09)\d{8}$/;

// Regex chuẩn định dạng email (RFC 5322 compatible pattern, ngăn liên tiếp dấu chấm ở domain)
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;

export const validateVNPhone = (phone: string): { isValid: boolean; message: string } => {
  const cleanPhone = phone.replace(/[\s.-]/g, '');
  if (!cleanPhone) {
    return { isValid: false, message: 'Vui lòng nhập số điện thoại' };
  }
  if (!VN_PHONE_REGEX.test(cleanPhone)) {
    return {
      isValid: false,
      message: 'Số điện thoại không hợp lệ (Phải đúng 10 số và bắt đầu bằng 03, 05, 07, 08, 09)',
    };
  }
  return { isValid: true, message: '' };
};

export const validateEmail = (email: string): { isValid: boolean; message: string } => {
  const cleanEmail = email.trim();
  if (!cleanEmail) {
    return { isValid: false, message: 'Vui lòng nhập email nhận vé' };
  }
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return {
      isValid: false,
      message: 'Định dạng email không hợp lệ (Ví dụ: hotro@traveleasy.vn)',
    };
  }
  return { isValid: true, message: '' };
};

interface Props {
  info: PassengerInfo;
  onChange: (info: PassengerInfo) => void;
  seatCount: number;
}

export const PassengerInfoForm: React.FC<Props> = ({ info, onChange, seatCount }) => {
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const [frequentTravelers, setFrequentTravelers] = React.useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('traveleasy_frequent_travelers');
      if (saved) return JSON.parse(saved);
      const userStr = localStorage.getItem('traveleasy_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        return [{ id: 'user', name: u.fullName || 'Khách hàng', phone: u.phone || '', email: u.email || '', relationship: 'Bản thân' }];
      }
      return [];
    } catch {
      return [];
    }
  });

  const phoneValidation = validateVNPhone(info.phone);
  const emailValidation = validateEmail(info.email);

  const phoneError = (touched.phone || info.phone.length > 0) && !phoneValidation.isValid ? phoneValidation.message : '';
  const emailError = (touched.email || info.email.length > 0) && !emailValidation.isValid ? emailValidation.message : '';

  const handleSelectFrequentTraveler = (traveler: any) => {
    setTouched({ phone: true, email: true });
    onChange({
      ...info,
      fullName: traveler.name || info.fullName,
      phone: traveler.phone || info.phone,
      email: traveler.email || info.email,
    });
  };

  const updateField = (field: keyof PassengerInfo, value: any) => {
    onChange({
      ...info,
      [field]: value,
    });
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
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

      {/* Sổ tay hành khách thân quen - Điền nhanh 1 chạm */}
      {frequentTravelers.length > 0 && (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
            ⚡ Điền nhanh từ danh bạ:
          </span>
          {frequentTravelers.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectFrequentTraveler(t)}
              style={{
                backgroundColor: info.fullName === t.name ? '#eff6ff' : '#ffffff',
                border: info.fullName === t.name ? '1px solid #2563eb' : '1px solid #cbd5e1',
                color: info.fullName === t.name ? '#1d4ed8' : '#334155',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{t.name}</span>
              {t.relationship && (
                <span
                  style={{
                    backgroundColor: info.fullName === t.name ? '#dbeafe' : '#f1f5f9',
                    fontSize: '10px',
                    padding: '1px 4px',
                    borderRadius: '4px',
                  }}
                >
                  {t.relationship}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

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
              placeholder="Ví dụ: 0912345678"
              value={info.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              style={{
                width: '100%',
                padding: '11px 14px 11px 38px',
                borderRadius: '8px',
                border: phoneError ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                backgroundColor: phoneError ? '#fef2f2' : '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s, background-color 0.2s',
              }}
            />
            <Phone
              size={16}
              color={phoneError ? '#ef4444' : '#94a3b8'}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
          {phoneError && (
            <div
              style={{
                color: '#dc2626',
                fontSize: '12px',
                fontWeight: 600,
                marginTop: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <AlertCircle size={14} />
              <span>{phoneError}</span>
            </div>
          )}
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
            onBlur={() => handleBlur('email')}
            style={{
              width: '100%',
              padding: '11px 14px 11px 38px',
              borderRadius: '8px',
              border: emailError ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
              backgroundColor: emailError ? '#fef2f2' : '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.2s, background-color 0.2s',
            }}
          />
          <Mail
            size={16}
            color={emailError ? '#ef4444' : '#94a3b8'}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>
        {emailError && (
          <div
            style={{
              color: '#dc2626',
              fontSize: '12px',
              fontWeight: 600,
              marginTop: '5px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <AlertCircle size={14} />
            <span>{emailError}</span>
          </div>
        )}
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


