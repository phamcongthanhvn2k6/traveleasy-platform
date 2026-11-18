import React, { useState, useEffect, useMemo } from 'react';
import { X, Tag, Check, Copy, Clock, Sparkles, Percent, Gift, ChevronRight, Wallet, CheckCircle2, AlertOctagon } from 'lucide-react';
import { toast } from '../context/ToastContext';
import { VoucherWalletService } from '../services/voucherWalletService';
import api from '../services/api';

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
    code: 'PAYOS50',
    title: 'Cổng PayOS VietQR - Giảm ngay 30.000 đ',
    description: 'Áp dụng khi thanh toán trực tuyến qua cổng PayOS chuyển khoản 24/7',
    discountType: 'FIXED',
    discountValue: 30000,
    minOrderValue: 150000,
    expiryDate: '31/12/2026',
    badge: 'VIETQR MB',
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
  const [modalTab, setModalTab] = useState<'MY_WALLET' | 'ALL'>('MY_WALLET');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [voucherList, setVoucherList] = useState<VoucherItem[]>(AVAILABLE_VOUCHERS);

  // Danh sách mã voucher người dùng đã lưu trong ví
  const ownedCodes = useMemo(() => VoucherWalletService.getOwnedVoucherCodes(), [isOpen]);

  // Đồng bộ danh sách voucher thời gian thực từ CSDL hệ thống
  useEffect(() => {
    if (!isOpen) return;
    api.get('/promotions')
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const mapped: VoucherItem[] = res.data.data.map((v: any) => ({
            code: v.code,
            title: v.title,
            description: v.description || 'Ưu đãi đặt vé xe khách từ TravelEasy',
            discountType: (v.discountType === 'PERCENT' || v.discountType === 'percentage') ? 'PERCENT' : 'FIXED',
            discountValue: Number(v.discountValue || 0),
            minOrderValue: Number(v.minOrderValue || 0),
            maxDiscount: v.maxDiscount ? Number(v.maxDiscount) : undefined,
            expiryDate: v.endDate ? new Date(v.endDate).toLocaleDateString('vi-VN') : '31/12/2026',
            badge: v.badgeText || (v.discountType === 'PERCENT' ? `GIẢM ${v.discountValue}%` : `GIẢM ${(Number(v.discountValue) / 1000).toFixed(0)}K`),
          }));
          setVoucherList(mapped);
        }
      })
      .catch((err) => {
        console.warn('Sử dụng danh sách voucher cục bộ do lỗi tải CSDL:', err);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã ${code} vào bộ nhớ tạm!`, 'Đã Sao Chép');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApply = (v: VoucherItem) => {
    const isExpired = VoucherWalletService.isExpired(v.expiryDate);
    if (isExpired) {
      toast.error(`Mã ưu đãi [${v.code}] đã hết hạn sử dụng (${v.expiryDate})! Không thể áp dụng.`, 'Voucher Hết Hạn');
      return;
    }

    if (orderTotal < v.minOrderValue) {
      const missing = v.minOrderValue - orderTotal;
      toast.warning(
        `Đơn hàng chưa đạt mức tối thiểu ${v.minOrderValue.toLocaleString('vi-VN')} đ (còn thiếu ${missing.toLocaleString('vi-VN')} đ)!`,
        'Chưa Đủ Điều Kiện'
      );
      return;
    }

    onSelectVoucher(v.code);
    onClose();
  };

  // Lọc voucher hiển thị theo tab
  const displayedVouchers = modalTab === 'MY_WALLET'
    ? voucherList.filter((v) => ownedCodes.includes(v.code.toUpperCase()))
    : voucherList;

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
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
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
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <Gift size={22} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Chọn Mã Ưu Đãi / Voucher
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Đơn hàng hiện tại: <strong style={{ color: '#0f172a' }}>{orderTotal.toLocaleString('vi-VN')} đ</strong>
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

        {/* Tab Selection: Ví Của Tôi vs Tất Cả */}
        <div
          style={{
            display: 'flex',
            padding: '8px 16px',
            gap: '8px',
            backgroundColor: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <button
            type="button"
            onClick={() => setModalTab('MY_WALLET')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: modalTab === 'MY_WALLET' ? '#ffffff' : 'transparent',
              color: modalTab === 'MY_WALLET' ? '#0f172a' : '#64748b',
              boxShadow: modalTab === 'MY_WALLET' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Wallet size={15} color={modalTab === 'MY_WALLET' ? '#059669' : '#64748b'} />
            <span>Ví Của Tôi ({voucherList.filter(v => ownedCodes.includes(v.code.toUpperCase())).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setModalTab('ALL')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: modalTab === 'ALL' ? '#ffffff' : 'transparent',
              color: modalTab === 'ALL' ? '#0f172a' : '#64748b',
              boxShadow: modalTab === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Tag size={15} color={modalTab === 'ALL' ? '#ea580c' : '#64748b'} />
            <span>Tất Cả Ưu Đãi ({voucherList.length})</span>
          </button>
        </div>

        {/* List of Vouchers */}
        <div
          style={{
            padding: '16px 20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: '#ffffff',
          }}
        >
          {displayedVouchers.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>👛</div>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px', marginBottom: '4px' }}>
                Ví của bạn chưa có voucher phù hợp
              </div>
              <div style={{ fontSize: '12px' }}>
                Vui lòng chuyển sang tab <strong>"Tất Cả Ưu Đãi"</strong> để áp dụng mã giảm giá khác.
              </div>
            </div>
          ) : (
            displayedVouchers.map((v) => {
              const isApplied = appliedCode === v.code;
              const isExpired = VoucherWalletService.isExpired(v.expiryDate);
              const isSpendEligible = orderTotal >= v.minOrderValue;
              const isEligible = isSpendEligible && !isExpired;
              const isOwned = ownedCodes.includes(v.code.toUpperCase());

              return (
                <div
                  key={v.code}
                  style={{
                    border: isApplied
                      ? '2px solid #2563eb'
                      : !isEligible
                      ? '1px dashed #cbd5e1'
                      : isOwned
                      ? '1.5px solid #10b981'
                      : '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    backgroundColor: isApplied
                      ? '#eff6ff'
                      : !isEligible
                      ? '#f8fafc'
                      : '#ffffff',
                    opacity: !isEligible ? 0.75 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
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
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: '12px',
                          letterSpacing: '0.8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Tag size={11} color="#38bdf8" />
                        <span>{v.code}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleCopy(v.code, e)}
                        title="Sao chép mã"
                        style={{
                          background: 'transparent',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '3px 7px',
                          color: '#475569',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {copiedCode === v.code ? <Check size={11} color="#16a34a" /> : <Copy size={11} />}
                        <span>{copiedCode === v.code ? 'Đã chép' : 'Chép'}</span>
                      </button>

                      {isOwned && (
                        <span
                          style={{
                            backgroundColor: '#ecfdf5',
                            color: '#059669',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '6px',
                            border: '1px solid #a7f3d0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <CheckCircle2 size={10} /> Đã trong ví
                        </span>
                      )}

                      {v.badge && (
                        <span
                          style={{
                            backgroundColor: '#fff7ed',
                            color: '#ea580c',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '6px',
                            border: '1px solid #ffedd5',
                          }}
                        >
                          {v.badge}
                        </span>
                      )}
                    </div>

                    {/* Apply action button */}
                    <button
                      type="button"
                      onClick={() => handleApply(v)}
                      disabled={isApplied || !isEligible}
                      style={{
                        backgroundColor: isApplied
                          ? '#16a34a'
                          : !isEligible
                          ? '#94a3b8'
                          : '#ea580c',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: isApplied || !isEligible ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: isEligible && !isApplied ? '0 2px 4px rgba(234, 88, 12, 0.25)' : 'none',
                      }}
                    >
                      {isApplied ? (
                        <>
                          <Check size={13} /> Đang dùng
                        </>
                      ) : isExpired ? (
                        'Đã Hết Hạn'
                      ) : !isSpendEligible ? (
                        'Chưa Đủ Tiền'
                      ) : (
                        'Áp Dụng'
                      )}
                    </button>
                  </div>

                  {/* Content */}
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                      {v.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', lineHeight: 1.4 }}>
                      {v.description}
                    </div>
                  </div>

                  {/* Footer conditions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: '#64748b',
                      paddingTop: '6px',
                      borderTop: '1px dashed #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} color={isExpired ? '#e11d48' : '#94a3b8'} />
                      <span style={{ color: isExpired ? '#e11d48' : '#64748b', fontWeight: isExpired ? 700 : 500 }}>
                        HSD: {v.expiryDate} {isExpired ? '(Đã hết hạn)' : ''}
                      </span>
                    </div>
                    <div>
                      Đơn tối thiểu:{' '}
                      <strong style={{ color: isSpendEligible ? '#0f172a' : '#ea580c' }}>
                        {v.minOrderValue.toLocaleString('vi-VN')} đ
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
