import React, { useState } from 'react';
import { X, Tag, Check, Copy, Clock, Sparkles, Percent, Gift, ChevronRight } from 'lucide-react';
import { toast } from '../context/ToastContext';

export interface VoucherItem {
  code: string;
  title: string;
  description: string;
  discountType: 'FIXED' | 'PERCENT';
  discountValue: number; // e.g. 50000 or 20 (for 20%)
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  badge?: string;
}

export const AVAILABLE_VOUCHERS: VoucherItem[] = [
  {
    code: 'TRAVELEASY',
    title: 'Giảm 50.000 đ cho khách hàng mới',
    description: 'Áp dụng cho mọi tuyến xe khách toàn quốc với đơn từ 200.000 đ',
    discountType: 'FIXED',
    discountValue: 50000,
    minOrderValue: 200000,
    expiryDate: '31/12/2026',
    badge: 'HOT NHẤT',
  },
  {
    code: 'GIAM20',
    title: 'Giảm 20% khi đặt từ 2 vé',
    description: 'Ưu đãi nhóm bạn & gia đình, giảm tối đa 100.000 đ trên tổng hóa đơn',
    discountType: 'PERCENT',
    discountValue: 20,
    minOrderValue: 300000,
    maxDiscount: 100000,
    expiryDate: '30/11/2026',
    badge: 'TIẾT KIỆM',
  },
  {
    code: 'VEXEREVIP',
    title: 'Tri ân thành viên VIP - Giảm 50.000 đ',
    description: 'Dành riêng cho khách hàng đã từng đặt vé trên hệ thống TravelEasy',
    discountType: 'FIXED',
    discountValue: 50000,
    minOrderValue: 250000,
    expiryDate: '31/12/2026',
  },
  {
    code: 'HE2026',
    title: 'Chào Hè Sôi Động - Giảm 30.000 đ',
    description: 'Áp dụng cho các tuyến du lịch biển: Nha Trang, Vũng Tàu, Phan Thiết, Quy Nhơn',
    discountType: 'FIXED',
    discountValue: 30000,
    minOrderValue: 150000,
    expiryDate: '31/10/2026',
  },
  {
    code: 'DATSOM20K',
    title: 'Đặt vé sớm - Giảm ngay 20.000 đ',
    description: 'Áp dụng khi đặt vé trước giờ khởi hành ít nhất 2 ngày',
    discountType: 'FIXED',
    discountValue: 20000,
    minOrderValue: 100000,
    expiryDate: '31/12/2026',
  },
];

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVoucher: (code: string) => void;
  orderTotal: number;
  appliedCode?: string;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  isOpen,
  onClose,
  onSelectVoucher,
  orderTotal,
  appliedCode,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã ${code} vào bộ nhớ tạm!`, 'Đã Sao Chép');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApply = (code: string) => {
    onSelectVoucher(code);
    onClose();
  };

  return (
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 22px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <Gift size={20} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Kho Voucher & Khuyến Mãi
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Chọn một mã ưu đãi tốt nhất cho đơn hàng của bạn
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* List of Vouchers */}
        <div
          style={{
            padding: '20px 22px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            backgroundColor: '#ffffff',
          }}
        >
          {AVAILABLE_VOUCHERS.map((v) => {
            const isApplied = appliedCode === v.code;
            const isEligible = orderTotal >= v.minOrderValue;

            return (
              <div
                key={v.code}
                style={{
                  border: isApplied
                    ? '2px solid #2563eb'
                    : '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  backgroundColor: isApplied ? '#eff6ff' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  position: 'relative',
                  boxShadow: isApplied
                    ? '0 4px 12px rgba(37, 99, 235, 0.12)'
                    : '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Top Row: Code Badge & Apply Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        backgroundColor: '#1e293b',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '13px',
                        letterSpacing: '0.8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Tag size={12} color="#38bdf8" />
                      <span>{v.code}</span>
                    </div>

                    <button
                      onClick={(e) => handleCopy(v.code, e)}
                      title="Sao chép mã"
                      style={{
                        background: 'transparent',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        color: '#475569',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {copiedCode === v.code ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                      <span>{copiedCode === v.code ? 'Đã chép' : 'Sao chép'}</span>
                    </button>

                    {v.badge && (
                      <span
                        style={{
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          padding: '3px 7px',
                          borderRadius: '6px',
                          border: '1px solid #fecaca',
                        }}
                      >
                        {v.badge}
                      </span>
                    )}
                  </div>

                  {/* Apply action */}
                  <button
                    onClick={() => handleApply(v.code)}
                    disabled={isApplied}
                    style={{
                      backgroundColor: isApplied ? '#16a34a' : '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 16px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: isApplied ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: isApplied ? 'none' : '0 2px 4px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    {isApplied ? (
                      <>
                        <Check size={14} /> Đang dùng
                      </>
                    ) : (
                      'Áp Dụng'
                    )}
                  </button>
                </div>

                {/* Content */}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    {v.title}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '3px', lineHeight: 1.4 }}>
                    {v.description}
                  </div>
                </div>

                {/* Footer conditions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11.5px',
                    color: '#64748b',
                    paddingTop: '8px',
                    borderTop: '1px dashed #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} color="#94a3b8" />
                    <span>HSD: {v.expiryDate}</span>
                  </div>
                  <div>
                    Đơn tối thiểu:{' '}
                    <strong style={{ color: isEligible ? '#0f172a' : '#ea580c' }}>
                      {v.minOrderValue.toLocaleString('vi-VN')} đ
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Bottom info bar */}
        <div
          style={{
            padding: '12px 22px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            fontSize: '12px',
            color: '#64748b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Mỗi đơn vé chỉ áp dụng 01 mã voucher ưu đãi.</span>
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#334155',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherModal;

