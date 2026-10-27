import React from 'react';
import { TripSeat } from '../types';
import { ShieldCheck, Lock, Clock } from 'lucide-react';

interface Props {
  seats: TripSeat[];
  selectedSeatNumbers: string[];
  onToggleSeat: (seatNumber: string) => void;
}

export const BusSeatMap: React.FC<Props> = ({ seats, selectedSeatNumbers, onToggleSeat }) => {
  const deck1Seats = seats.filter((s) => s.deck === 1);
  const deck2Seats = seats.filter((s) => s.deck === 2);

  const renderSeat = (seat: TripSeat) => {
    const isSelected = selectedSeatNumbers.includes(seat.seatNumber);
    const isBooked = seat.status === 'BOOKED';
    const isLocked = seat.status === 'LOCKED';

    let bg = '#ffffff';
    let borderColor = '#3b82f6';
    let textColor = '#1e3a8a';
    let cursor = 'pointer';
    let subText = `${seat.price / 1000}k`;

    if (isBooked) {
      bg = '#cbd5e1';
      borderColor = '#94a3b8';
      textColor = '#64748b';
      cursor = 'not-allowed';
      subText = 'Đã bán';
    } else if (isLocked) {
      bg = '#fef3c7';
      borderColor = '#f59e0b';
      textColor = '#b45309';
      cursor = 'not-allowed';
      subText = 'Giữ chỗ';
    } else if (isSelected) {
      bg = '#f97316';
      borderColor = '#ea580c';
      textColor = '#ffffff';
      subText = 'Đang chọn';
    }

    return (
      <button
        key={seat.id}
        disabled={isBooked || isLocked}
        onClick={() => onToggleSeat(seat.seatNumber)}
        title={
          isBooked
            ? `Ghế ${seat.seatNumber} đã có người mua`
            : isLocked
            ? `Ghế ${seat.seatNumber} đang được giữ chỗ trong 10 phút`
            : `Ghế ${seat.seatNumber} - Giá ${seat.price.toLocaleString('vi-VN')} đ`
        }
        style={{
          width: '58px',
          height: '54px',
          borderRadius: '8px',
          border: `2px solid ${borderColor}`,
          backgroundColor: bg,
          color: textColor,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '13px',
          cursor: cursor,
          transition: 'all 0.15s ease',
          boxShadow: isSelected ? '0 4px 6px -1px rgba(249, 115, 22, 0.4)' : 'none',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span>{seat.seatNumber}</span>
          {isLocked && <Lock size={10} color="#b45309" />}
        </div>
        <span style={{ fontSize: '9px', fontWeight: 600, opacity: 0.9, marginTop: '1px' }}>
          {subText}
        </span>
      </button>
    );
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', marginTop: '16px' }}>
      {/* Status Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '18px',
          fontSize: '12.5px',
          fontWeight: 600,
          flexWrap: 'wrap',
          backgroundColor: '#ffffff',
          padding: '10px 16px',
          borderRadius: '10px',
          border: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '2px solid #3b82f6', backgroundColor: '#fff' }}></div>
          <span style={{ color: '#1e293b' }}>Ghế trống</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#f97316' }}></div>
          <span style={{ color: '#ea580c' }}>Đang chọn</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid #f59e0b', backgroundColor: '#fef3c7' }}></div>
          <span style={{ color: '#b45309' }}>Đang giữ chỗ (10p)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#cbd5e1' }}></div>
          <span style={{ color: '#64748b' }}>Đã bán</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Tầng 1 */}
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ textAlign: 'center', fontWeight: 800, color: '#1e3a8a', marginBottom: '14px', fontSize: '13.5px', letterSpacing: '0.2px' }}>
            TẦNG 1 (DƯỚI) - CHỐNG SAY XE & ÊM ÁI
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', justifyItems: 'center' }}>
            {deck1Seats.map(renderSeat)}
          </div>
        </div>

        {/* Tầng 2 */}
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ textAlign: 'center', fontWeight: 800, color: '#334155', marginBottom: '14px', fontSize: '13.5px', letterSpacing: '0.2px' }}>
            TẦNG 2 (TRÊN) - TẦM NHÌN THOÁNG MÁT
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', justifyItems: 'center' }}>
            {deck2Seats.map(renderSeat)}
          </div>
        </div>
      </div>

      {/* 10-Minute Lock Guarantee Banner */}
      <div
        style={{
          marginTop: '16px',
          padding: '10px 14px',
          backgroundColor: '#eff6ff',
          borderRadius: '10px',
          border: '1px solid #bfdbfe',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '12px',
          color: '#1e40af',
        }}
      >
        <ShieldCheck size={18} color="#2563eb" style={{ flexShrink: 0 }} />
        <span>
          <strong>Cam kết giữ chỗ độc quyền 10 phút:</strong> Ngay khi bấm <em>"Tiếp tục đặt vé"</em>, hệ thống sẽ tạm khóa các ghế đã chọn trong 10 phút để bạn an tâm thanh toán mà không sợ bị trùng ghế.
        </span>
      </div>
    </div>
  );
};

export default BusSeatMap;
