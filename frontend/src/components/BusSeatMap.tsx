import React from 'react';
import { TripSeat } from '../types';

interface Props {
  seats: TripSeat[];
  selectedSeatNumbers: string[];
  onToggleSeat: (seatNumber: string) => void;
}

export const BusSeatMap: React.FC<Props> = ({ seats, selectedSeatNumbers, onToggleSeat }) => {
  const deck1Seats = seats.filter(s => s.deck === 1);
  const deck2Seats = seats.filter(s => s.deck === 2);

  const renderSeat = (seat: TripSeat) => {
    const isSelected = selectedSeatNumbers.includes(seat.seatNumber);
    const isBooked = seat.status === 'BOOKED';

    let bg = '#ffffff';
    let borderColor = '#3b82f6';
    let textColor = '#1e3a8a';
    let cursor = 'pointer';

    if (isBooked) {
      bg = '#cbd5e1';
      borderColor = '#94a3b8';
      textColor = '#64748b';
      cursor = 'not-allowed';
    } else if (isSelected) {
      bg = '#f97316';
      borderColor = '#ea580c';
      textColor = '#ffffff';
    }

    return (
      <button
        key={seat.id}
        disabled={isBooked}
        onClick={() => onToggleSeat(seat.seatNumber)}
        style={{
          width: '56px',
          height: '52px',
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
          boxShadow: isSelected ? '0 4px 6px -1px rgba(249, 115, 22, 0.4)' : 'none'
        }}
      >
        <span>{seat.seatNumber}</span>
        <span style={{ fontSize: '9px', fontWeight: 500, opacity: 0.85 }}>
          {isBooked ? 'Đã bán' : `${(seat.price / 1000)}k`}
        </span>
      </button>
    );
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '12px', marginTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '2px solid #3b82f6', backgroundColor: '#fff' }}></div>
          <span>Ghế trống</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#f97316' }}></div>
          <span>Đang chọn</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#cbd5e1' }}></div>
          <span>Đã bán</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Tầng 1 */}
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'center', fontWeight: 700, color: '#334155', marginBottom: '12px', fontSize: '14px' }}>
            TẦNG 1 (DƯỚI) - CHỐNG SAY XE
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', justifyItems: 'center' }}>
            {deck1Seats.map(renderSeat)}
          </div>
        </div>

        {/* Tầng 2 */}
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'center', fontWeight: 700, color: '#334155', marginBottom: '12px', fontSize: '14px' }}>
            TẦNG 2 (TRÊN) - THOÁNG MÁT
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', justifyItems: 'center' }}>
            {deck2Seats.map(renderSeat)}
          </div>
        </div>
      </div>
    </div>
  );
};
