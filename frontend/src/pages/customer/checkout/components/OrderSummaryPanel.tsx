import React, { useState, useEffect } from 'react';
import { Trip } from '../../../../types';
import { MapPin, Clock, ShieldCheck, Tag, Bus, ArrowRight, Gift } from 'lucide-react';
import { toast } from '../../../../context/ToastContext';
import { VoucherModal, AVAILABLE_VOUCHERS } from '../../../../components/VoucherModal';
import api from '../../../../services/api';

interface Props {
  trip: Trip;
  selectedSeats: string[];
  points: { pickup?: number; dropoff?: number; pickupName?: string; dropoffName?: string };
  hasInsurance: boolean;
  onApplyVoucher: (discountAmount: number, code: string) => void;
  onSubmit: () => void;
  loading: boolean;
  disabled: boolean;
}

export const OrderSummaryPanel: React.FC<Props> = ({
  trip,
  selectedSeats,
  points,
  hasInsurance,
  onApplyVoucher,
  onSubmit,
  loading,
  disabled,
}) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState('');
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const seatCount = selectedSeats.length;
  const baseTicketPrice = seatCount * trip.price;
  const insurancePrice = hasInsurance ? seatCount * 25000 : 0;
  const finalTotal = Math.max(0, baseTicketPrice + insurancePrice - discount);

  // Auto-apply voucher if user selected one from Promotions page
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('traveleasy_selected_voucher');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.code) {
          applyVoucherByCode(parsed.code);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }, [baseTicketPrice]);

  const applyVoucherByCode = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toast.warning('Vui lòng nhập mã giảm giá!', 'Voucher');
      return;
    }

    setVoucherCode(cleanCode);

    try {
      // Validate live with Supabase backend
      const res = await api.get('/promotions/validate', {
        params: {
          code: cleanCode,
          amount: baseTicketPrice,
          origin: trip.originCity,
          destination: trip.destinationCity,
        }
      });

      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        const discountVal = Number(data.discountAmount || 0);
        setDiscount(discountVal);
        setAppliedCode(cleanCode);
        onApplyVoucher(discountVal, cleanCode);
        toast.success(data.message || `Áp dụng mã ${cleanCode} thành công!`, 'Mã Ưu Đãi Supabase');
        return;
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message;
      if (errorMsg) {
        toast.warning(errorMsg, 'Mã Không Hợp Lệ');
        return;
      }
    }

    // Local fallback for offline/demo codes
    if (cleanCode === 'TRAVELEASY' || cleanCode === 'VEXEREVIP' || cleanCode === 'GIAM50K' || cleanCode === 'DALATVIP') {
      const discountValue = 50000;
      setDiscount(discountValue);
      setAppliedCode(cleanCode);
      onApplyVoucher(discountValue, cleanCode);
      toast.success(`Áp dụng mã ${cleanCode} thành công! Giảm ngay 50.000 đ`, 'Mã Ưu Đãi');
    } else if (cleanCode === 'GIAM20' || cleanCode === 'SAPA20') {
      const discountValue = Math.min(100000, Math.round(baseTicketPrice * 0.2));
      setDiscount(discountValue);
      setAppliedCode(cleanCode);
      onApplyVoucher(discountValue, cleanCode);
      toast.success(`Áp dụng mã ${cleanCode} thành công! Giảm 20% (${discountValue.toLocaleString('vi-VN')} đ)`, 'Mã Ưu Đãi');
    } else if (cleanCode === 'PAYOS50' || cleanCode === 'HE2026') {
      const discountValue = 30000;
      setDiscount(discountValue);
      setAppliedCode(cleanCode);
      onApplyVoucher(discountValue, cleanCode);
      toast.success(`Áp dụng mã ${cleanCode} thành công! Giảm ngay 30.000 đ`, 'Mã Ưu Đãi');
    } else if (cleanCode === 'WELCOME50' || cleanCode === 'BANMOI15') {
      const discountValue = Math.min(80000, Math.round(baseTicketPrice * 0.15));
      setDiscount(discountValue);
      setAppliedCode(cleanCode);
      onApplyVoucher(discountValue, cleanCode);
      toast.success(`Áp dụng mã ${cleanCode} thành công! Giảm 15% bạn mới`, 'Mã Bạn Mới');
    } else {
      toast.error('Mã giảm giá không tồn tại hoặc đã hết hạn trên hệ thống!', 'Mã Không Hợp Lệ');
    }
  };

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    applyVoucherByCode(voucherCode);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return '00:00';
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return '';
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
        position: 'sticky',
        top: '90px',
      }}
    >
      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
        Tóm Tắt Đơn Vé Xe
      </h3>

      {/* Bus company & Route */}
      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <img
            src={trip.busCompanyLogo || 'https://res.cloudinary.com/dkzrqnahy/image/upload/v1793289372/traveleasy/bus-companies/logo_futa_buslines.jpg'}
            alt={trip.busCompanyName}
            style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }}
          />
          <strong style={{ fontSize: '15px', color: '#0f172a' }}>{trip.busCompanyName}</strong>
        </div>

        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{trip.originCity}</span>
          <ArrowRight size={14} color="#2563eb" />
          <span>{trip.destinationCity}</span>
        </div>

        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
          Khởi hành: <strong>{formatTime(trip.departureTime)}</strong> ngày {formatDate(trip.departureTime)}
        </div>
      </div>

      {/* Pickup & Dropoff */}
      <div style={{ fontSize: '12.5px', color: '#475569', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '14px', lineHeight: 1.5 }}>
        <div>
          <MapPin size={13} color="#2563eb" style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
          Điểm đón: <strong>{points.pickupName || trip.originCity}</strong>
        </div>
        <div style={{ marginTop: '4px' }}>
          <MapPin size={13} color="#f97316" style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
          Điểm trả: <strong>{points.dropoffName || trip.destinationCity}</strong>
        </div>
      </div>

      {/* Seat numbers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
        <span style={{ color: '#64748b' }}>Ghế đã chọn ({seatCount} vé):</span>
        <strong style={{ color: '#f97316', fontSize: '14px' }}>{selectedSeats.join(', ')}</strong>
      </div>

      {/* Voucher Input Form */}
      <form onSubmit={handleApplyVoucher} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Mã giảm giá (VD: TRAVELEASY)"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 32px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              fontWeight: 600,
              boxSizing: 'border-box',
              textTransform: 'uppercase',
            }}
          />
          <Tag size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            color: '#1e293b',
            borderRadius: '8px',
            padding: '9px 14px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Áp dụng
        </button>
      </form>

      {/* Available Vouchers Quick Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => setShowVoucherModal(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: 0,
          }}
        >
          <Gift size={13} color="#2563eb" />
          <span>Chọn mã ưu đãi ({AVAILABLE_VOUCHERS.length} mã có sẵn)</span>
        </button>
        {appliedCode && (
          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
            Đã dùng: {appliedCode}
          </span>
        )}
      </div>

      {/* Price breakdown */}
      <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
          <span>Giá vé ({seatCount} x {formatCurrency(trip.price)}):</span>
          <span>{formatCurrency(baseTicketPrice)}</span>
        </div>

        {hasInsurance && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
            <span>Bảo hiểm chuyến đi ({seatCount} người):</span>
            <span>+{formatCurrency(insurancePrice)}</span>
          </div>
        )}

        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', fontWeight: 600 }}>
            <span>Mã giảm giá ({appliedCode}):</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '12px',
            marginTop: '4px',
          }}
        >
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Tổng thanh toán:</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#f97316' }}>{formatCurrency(finalTotal)}</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        disabled={disabled || loading}
        onClick={onSubmit}
        style={{
          width: '100%',
          backgroundColor: disabled ? '#94a3b8' : '#f97316',
          color: '#ffffff',
          border: 'none',
          padding: '14px',
          borderRadius: '10px',
          fontWeight: 800,
          fontSize: '15px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: disabled ? 'none' : '0 4px 10px rgba(249, 115, 22, 0.4)',
          transition: 'all 0.15s ease',
        }}
      >
        {loading ? 'Đang Xử Lý Giao Dịch...' : 'Thanh Toán Ngay →'}
      </button>

      <div style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '10px' }}>
        Bằng việc thanh toán, bạn cam kết tuân thủ chính sách vận tải.
      </div>

      {/* Voucher Modal */}
      <VoucherModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        onSelectVoucher={(code) => applyVoucherByCode(code)}
        orderTotal={baseTicketPrice}
        appliedCode={appliedCode}
      />
    </div>
  );
};

