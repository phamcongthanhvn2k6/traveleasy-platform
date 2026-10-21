import React, { useState } from 'react';
import { Trip } from '../../../../types';
import { MapPin, Clock, ShieldCheck, Tag, Bus, ArrowRight } from 'lucide-react';
import { toast } from '../../../../context/ToastContext';

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

  const seatCount = selectedSeats.length;
  const baseTicketPrice = seatCount * trip.price;
  const insurancePrice = hasInsurance ? seatCount * 25000 : 0;
  const finalTotal = Math.max(0, baseTicketPrice + insurancePrice - discount);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = voucherCode.trim().toUpperCase();
    if (!cleanCode) {
      toast.warning('Vui lòng nhập mã giảm giá!', 'Voucher');
      return;
    }

    if (cleanCode === 'TRAVELEASY' || cleanCode === 'VEXEREVIP' || cleanCode === 'GIAM50K') {
      const discountValue = 50000;
      setDiscount(discountValue);
      setAppliedCode(cleanCode);
      onApplyVoucher(discountValue, cleanCode);
      toast.success(`Áp dụng mã ${cleanCode} thành công! Giảm ngay 50.000 đ`, 'Mã Ưu Đãi');
    } else if (cleanCode === 'GIAM20') {
      const discountValue = Math.round(baseTicketPrice * 0.2);
      setDiscount(discountValue);
      setAppliedCode(cleanCode);
      onApplyVoucher(discountValue, cleanCode);
      toast.success(`Áp dụng mã ${cleanCode} thành công! Giảm 20% (${discountValue.toLocaleString('vi-VN')} đ)`, 'Mã Ưu Đãi');
    } else {
      toast.error('Mã giảm giá không tồn tại hoặc đã hết hạn!', 'Mã Không Hợp Lệ');
    }
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
            src={trip.busCompanyLogo || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150'}
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
      <form onSubmit={handleApplyVoucher} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
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
    </div>
  );
};

